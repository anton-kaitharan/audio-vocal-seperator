import os
import re
import time
import wave
import shutil
import tempfile
import subprocess
from typing import Optional, Dict, Any

import modal
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Modal App & Container Definition
# ---------------------------------------------------------------------------
app = modal.App("auravocal-backend")

def download_demucs_model():
    """Bake the htdemucs neural model into container image during build."""
    from demucs.pretrained import get_model
    get_model("htdemucs")

# Debain slim base + FFmpeg + Node.js (for yt-dlp YouTube JS challenges)
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("ffmpeg", "nodejs")
    .pip_install(
        "torch>=2.1.0",
        "torchaudio>=2.1.0",
        "demucs==4.0.1",
        "yt-dlp>=2024.8.6",
        "boto3>=1.34.0",
        "botocore>=1.34.0",
        "fastapi>=0.100.0",
        "pydantic>=2.0.0",
    )
    .run_function(download_demucs_model)
)

# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------
class JobPayload(BaseModel):
    url: str
    title: Optional[str] = "youtube_track"
    start: Optional[str] = None
    end: Optional[str] = None

class JobResponse(BaseModel):
    status: str
    title: str
    r2_key: str
    download_url: str
    duration_seconds: float
    error: Optional[str] = None

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def clean_url(url: str) -> str:
    url = url.strip()
    m = re.search(r"(https?://(?:www\.|music\.)?youtube\.com/watch\?v=[^&]+)", url)
    if m:
        return m.group(1)
    m = re.search(r"(https?://(?:www\.)?youtube\.com/shorts/[^?&]+)", url)
    if m:
        return m.group(1)
    m = re.search(r"(https?://youtu\.be/[^?&]+)", url)
    if m:
        return m.group(1)
    return url.split("&")[0]

def clean_title(title: str) -> str:
    title = re.sub(r'[\\/*?:"<>|%&^$#]', "", title)
    return title.strip() or "track"

# ---------------------------------------------------------------------------
# Serverless GPU Function & Webhook
# ---------------------------------------------------------------------------
@app.function(
    image=image,
    gpu="A10G",
    timeout=600,
    secrets=[modal.Secret.from_name("r2-credentials")],
)
@modal.fastapi_endpoint(method="POST")
def separate_track(payload: JobPayload) -> Dict[str, Any]:
    """
    Executes complete vocal separation pipeline on serverless A10G GPU:
    1. Downloads audio stream via yt-dlp (Node.js runtime enabled)
    2. Runs Demucs htdemucs AI stem separation (isolated to /tmp)
    3. Executes identical silence-trim + loudnorm FFmpeg filter chain
    4. Uploads broadcast-quality PCM WAV to Cloudflare R2
    5. Returns presigned download URL and job metadata
    """
    import boto3
    from botocore.config import Config

    url = payload.url
    raw_title = payload.title or "track"
    start = payload.start.strip() if payload.start else None
    end = payload.end.strip() if payload.end else None

    # Guarantee ephemeral isolation inside /tmp
    with tempfile.TemporaryDirectory(dir="/tmp") as temp_dir:
        try:
            clean_yt_url = clean_url(url)
            safe_title = clean_title(raw_title)

            print(f"[Modal] Processing job: '{safe_title}' from {clean_yt_url}")
            if start and end:
                print(f"[Modal] Requested segment: {start} -> {end}")

            # 1. DOWNLOAD AUDIO VIA YT-DLP
            raw_template = os.path.join(temp_dir, f"{safe_title}_raw.%(ext)s")
            raw_wav = os.path.join(temp_dir, f"{safe_title}_raw.wav")

            dl_cmd = [
                "yt-dlp",
                "--no-playlist",
                "--js-runtimes", "node",
                "-f", "bestaudio",
                "-x", "--audio-format", "wav",
                "--retries", "3",
                "-o", raw_template,
                clean_yt_url,
            ]
            dl_res = subprocess.run(dl_cmd, capture_output=True, text=True, cwd=temp_dir)
            if dl_res.returncode != 0 or not os.path.exists(raw_wav):
                err = dl_res.stderr.strip() or dl_res.stdout.strip()
                raise RuntimeError(f"yt-dlp download failed (code {dl_res.returncode}): {err}")

            # 2. SEGMENT TRIM (Fast pre-trim if start & end specified)
            demucs_input = raw_wav
            trimmed_wav = os.path.join(temp_dir, f"{safe_title}_trimmed.wav")
            if start and end:
                print(f"[Modal] Pre-trimming audio: {start} to {end}...")
                trim_cmd = [
                    "ffmpeg", "-y",
                    "-ss", start, "-to", end,
                    "-i", raw_wav,
                    "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2",
                    trimmed_wav,
                ]
                t_res = subprocess.run(trim_cmd, capture_output=True, text=True)
                if t_res.returncode == 0 and os.path.exists(trimmed_wav):
                    demucs_input = trimmed_wav

            # 3. DEMUCS AI VOCAL SEPARATION
            print("[Modal] Running Meta Demucs AI on A10G GPU...")
            sep_dir = os.path.join(temp_dir, "separated")
            demucs_cmd = [
                "demucs",
                "--two-stems=vocals",
                "-d", "cuda",
                "--out", sep_dir,
                demucs_input,
            ]
            d_res = subprocess.run(demucs_cmd, capture_output=True, text=True)
            stem_name = os.path.splitext(os.path.basename(demucs_input))[0]
            no_vocals_source = os.path.join(sep_dir, "htdemucs", stem_name, "no_vocals.wav")

            if d_res.returncode != 0 or not os.path.exists(no_vocals_source):
                err = d_res.stderr.strip() or d_res.stdout.strip()
                raise RuntimeError(f"Demucs failed (code {d_res.returncode}): {err}")

            # 4. FFMPEG POST-PROCESSING (exact filter chain from watch.py)
            print("[Modal] Running broadcast mastering & normalization...")
            af = (
                "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-40dB,"
                "areverse,"
                "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-40dB,"
                "areverse,"
                "loudnorm"
            )
            format_flags = ["-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2"]
            final_wav = os.path.join(temp_dir, f"{safe_title}_karoke.wav")

            if start and end and demucs_input == raw_wav:
                ff_cmd = ["ffmpeg", "-y", "-ss", start, "-to", end, "-i", no_vocals_source, "-af", af, *format_flags, final_wav]
            else:
                ff_cmd = ["ffmpeg", "-y", "-i", no_vocals_source, "-af", af, *format_flags, final_wav]

            f_res = subprocess.run(ff_cmd, capture_output=True, text=True)
            if f_res.returncode != 0 or not os.path.exists(final_wav):
                err = f_res.stderr.strip() or f_res.stdout.strip()
                raise RuntimeError(f"FFmpeg processing failed: {err}")

            # 5. MEASURE DURATION
            with wave.open(final_wav, "r") as wf:
                frames = wf.getnframes()
                rate = wf.getframerate()
                duration_seconds = round(frames / float(rate), 2)

            # 6. UPLOAD TO CLOUDFLARE R2 & GENERATE SIGNED URL
            bucket_name = os.environ["R2_BUCKET_NAME"]
            endpoint_url = os.environ["R2_ENDPOINT_URL"]
            access_key = os.environ["R2_ACCESS_KEY_ID"]
            secret_key = os.environ["R2_SECRET_ACCESS_KEY"]

            timestamp = int(time.time())
            r2_key = f"stems/{timestamp}_{safe_title}_karoke.wav"

            print(f"[Modal] Uploading {final_wav} to R2 bucket '{bucket_name}' key: {r2_key}...")
            r2_client = boto3.client(
                "s3",
                endpoint_url=endpoint_url,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name="auto",
                config=Config(signature_version="s3v4"),
            )

            r2_client.upload_file(
                final_wav,
                bucket_name,
                r2_key,
                ExtraArgs={"ContentType": "audio/wav"}
            )

            signed_url = r2_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": r2_key},
                ExpiresIn=86400,  # 24-hour signed link
            )

            print(f"[Modal] Job completed successfully! Duration: {duration_seconds}s")
            return {
                "status": "completed",
                "title": safe_title,
                "r2_key": r2_key,
                "download_url": signed_url,
                "duration_seconds": duration_seconds,
            }

        except Exception as e:
            print(f"[Modal ERROR] {e}")
            return {
                "status": "error",
                "title": raw_title,
                "r2_key": "",
                "download_url": "",
                "duration_seconds": 0.0,
                "error": str(e),
            }
        finally:
            # Ephemeral cleanup: tempfile.TemporaryDirectory removes /tmp folder on scope exit
            pass
