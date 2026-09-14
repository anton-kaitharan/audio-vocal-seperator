import os
import sys
import time
import subprocess
import re
import shutil
import requests
from threading import Thread
from queue import Queue
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
        sys.stderr.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    except Exception:
        pass

BASE = os.path.dirname(os.path.abspath(__file__))

for env_file in ["py.env", ".env"]:
    env_path = os.path.join(BASE, env_file)
    if os.path.exists(env_path):
        load_dotenv(env_path)

WATCH      = os.path.join(BASE, "queue")
PROCESSING = os.path.join(BASE, "processing")
DONE       = os.path.join(BASE, "done")
FAILED     = os.path.join(BASE, "failed")
OUTPUT     = os.path.join(BASE, "output")
LOGS       = os.path.join(BASE, "logs")
MODELS     = os.path.join(BASE, "models")
SEPARATED  = os.path.join(BASE, "separated")

# Binary paths with dynamic fallback
DEMUCS = os.path.join(BASE, "demucs_ext", "Scripts", "demucs.exe")
if not os.path.exists(DEMUCS):
    DEMUCS = shutil.which("demucs") or DEMUCS

YTDLP  = os.path.join(BASE, "yt-dlp.exe")
if not os.path.exists(YTDLP):
    YTDLP = shutil.which("yt-dlp") or YTDLP

FFMPEG = os.path.join(BASE, "ffmpeg", "bin", "ffmpeg.exe")
if not os.path.exists(FFMPEG):
    FFMPEG = shutil.which("ffmpeg") or FFMPEG

# ===================== TELEGRAM CONFIG =====================
BOT_TOKEN = os.getenv("BOT_TOKEN_ENV")
CHAT_ID   = os.getenv("CHAT_ID_ENV")
# ===========================================================

os.environ["TORCH_HOME"]                      = MODELS
os.environ["XDG_CACHE_HOME"]                  = MODELS
os.environ["HF_HOME"]                         = MODELS
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

MAX_WORKERS = 2
job_queue = Queue()

# ---------- TELEGRAM HELPERS ----------
def tg_send(msg):
    if not BOT_TOKEN or not CHAT_ID:
        print(f"[TG SKIP] Token or Chat ID missing. Message: {msg}")
        return
    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            data={"chat_id": CHAT_ID, "text": msg},
            timeout=15
        )
        if not resp.ok:
            print(f"[TG ERROR] sendMessage: {resp.text}")
    except Exception as e:
        print(f"[TG ERROR] {e}")

def tg_send_file(wav_path, title, logfile):
    """
    Send WAV if under 50MB.
    If over 50MB, convert to MP3, send it, then delete the MP3.
    WAV is always kept in output folder.
    """
    wav_size_mb = os.path.getsize(wav_path) / (1024 * 1024)
    log(f"WAV size: {wav_size_mb:.1f} MB", logfile)

    if not BOT_TOKEN or not CHAT_ID:
        log("[TG SKIP] Telegram token or Chat ID not configured. Finished file preserved in output/.", logfile)
        return

    mp3_path = None  # track so we can delete after sending

    if wav_size_mb <= 50:
        send_path  = wav_path
        mime       = "audio/wav"
        size_label = f"{wav_size_mb:.1f} MB WAV"
    else:
        # Convert to MP3 320kbps for Telegram delivery
        mp3_path = wav_path.replace("_karoke.wav", "_karoke.mp3")
        log(f"WAV over 50MB - converting to MP3 for Telegram...", logfile)
        tg_send(f"{title}\nWAV is {wav_size_mb:.1f} MB - converting to MP3 for sending...\nWAV is saved in output folder.")

        subprocess.run(
            [FFMPEG, "-y", "-i", wav_path, "-codec:a", "libmp3lame", "-qscale:a", "0", mp3_path],
            capture_output=True, text=True
        )

        if not os.path.exists(mp3_path):
            log("ERROR: MP3 conversion failed.", logfile)
            tg_send(f"MP3 conversion failed. Find WAV at:\noutput\\{os.path.basename(wav_path)}")
            return

        mp3_size_mb = os.path.getsize(mp3_path) / (1024 * 1024)
        log(f"MP3 size: {mp3_size_mb:.1f} MB", logfile)
        send_path  = mp3_path
        mime       = "audio/mp3"
        size_label = f"{mp3_size_mb:.1f} MB MP3 (WAV {wav_size_mb:.1f} MB saved in output)"

    # Send to Telegram
    try:
        log(f"Sending to Telegram: {send_path}", logfile)
        with open(send_path, "rb") as f:
            resp = requests.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendAudio",
                data={"chat_id": CHAT_ID, "caption": f"{title} - Karoke ({size_label})"},
                files={"audio": (os.path.basename(send_path), f, mime)},
                timeout=300
            )
        if resp.ok:
            log("File sent to Telegram successfully.", logfile)
            # Delete MP3 after successful send - WAV is kept
            if mp3_path and os.path.exists(mp3_path):
                os.remove(mp3_path)
                log(f"MP3 deleted after sending: {mp3_path}", logfile)
        else:
            log(f"[TG ERROR] sendAudio failed: {resp.text}", logfile)
            tg_send(f"Could not send file. Find it at:\noutput\\{os.path.basename(send_path)}")
    except Exception as e:
        log(f"[TG ERROR] {e}", logfile)
        tg_send(f"File send error: {e}")

# ---------- UTIL ----------
def log(msg, logfile):
    print(msg)
    with open(logfile, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

def clean_title(title):
    title = re.sub(r'[\\/*?:"<>|%&^$#]', "", title)
    return title.strip()

def clean_url(url):
    url = url.strip()
    if url.startswith("LOCAL:") or url.startswith("FILE:"):
        return url
    match = re.search(r"(https?://(?:www\.|music\.)?youtube\.com/watch\?v=[^&]+)", url)
    if match:
        return match.group(1)
    match = re.search(r"(https?://(?:www\.)?youtube\.com/shorts/[^?&]+)", url)
    if match:
        return match.group(1)
    match = re.search(r"(https?://youtu\.be/[^?&]+)", url)
    if match:
        return match.group(1)
    return url.split("&")[0]

# ---------- PROGRESS ----------
def run_with_progress(cmd, stage, logfile):
    use_shell = isinstance(cmd, str)
    process = subprocess.Popen(
        cmd,
        shell=use_shell,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        cwd=BASE,
        env=os.environ
    )

    for line in process.stdout:
        line = line.strip()
        if not line:
            continue

        if stage == "download":
            m = re.search(r"(\d{1,3}\.\d+)%", line)
            if m:
                log(f"Downloading... {m.group(1)}%", logfile)
            elif any(k in line.lower() for k in ["error", "warning", "forbidden", "http"]):
                log(f"[yt-dlp] {line}", logfile)
            elif "[download]" in line or "[extractaudio]" in line.lower():
                log(f"[yt-dlp] {line}", logfile)

        elif stage == "demucs":
            if "unauthenticated requests" in line.lower():
                continue
            log(f"[demucs] {line}", logfile)

        elif stage == "ffmpeg":
            m = re.search(r"time=(\d+:\d+:\d+\.\d+)", line)
            if m:
                log(f"Processing... {m.group(1)}", logfile)
            elif "error" in line.lower() or "warning" in line.lower():
                log(f"[ffmpeg] {line}", logfile)

    process.wait()
    return process.returncode

# ---------- PROCESS ----------
def process_job(proc_path):
    name    = os.path.basename(proc_path)
    logfile = os.path.join(LOGS, name.replace(".txt", ".log"))

    input_wav    = None
    trimmed_temp = None
    sep_folder   = None
    success      = False

    try:
        log(f"\nProcessing: {name}", logfile)

        with open(proc_path, "r", encoding="utf-8", errors="replace") as f:
            lines = [l.strip() for l in f if l.strip()]

        if len(lines) < 2:
            log("ERROR: Need at least URL + Title in job file.", logfile)
            tg_send(f"ERROR: Job {name} missing URL or title.")
            return

        url   = clean_url(lines[0])
        title = clean_title(lines[1])
        start = lines[2] if len(lines) > 2 else None
        end   = lines[3] if len(lines) > 3 else None

        if not title:
            log("ERROR: Title is empty after cleaning.", logfile)
            tg_send(f"ERROR: Title empty in {name}")
            return

        input_wav   = os.path.join(BASE, f"{title}_input.wav")
        output_file = os.path.join(OUTPUT, f"{title}_karoke.wav")
        output_inst = os.path.join(OUTPUT, f"{title}_instrumental.wav")
        output_vocals = os.path.join(OUTPUT, f"{title}_vocals.wav")

        log(f"Title  : {title}", logfile)
        log(f"URL/Src: {url}", logfile)
        if start and end:
            log(f"Trim   : {start} -> {end}", logfile)

        is_local_file = url.startswith("LOCAL:") or url.startswith("FILE:")
        if is_local_file:
            # DIRECT LOCAL AUDIO INGESTION
            local_rel = url.split(":", 1)[1].strip()
            local_path = os.path.join(BASE, local_rel) if not os.path.isabs(local_rel) else local_rel
            log(f"Ingesting local uploaded audio: {local_path}", logfile)
            if not os.path.exists(local_path):
                log(f"ERROR: Local source audio file not found: {local_path}", logfile)
                tg_send(f"ERROR: Local file missing for {title}")
                return

            tg_send(f"Started: {title}\nPreparing local audio...")
            conv_cmd = [
                FFMPEG, "-y",
                "-i", local_path,
                "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2",
                input_wav
            ]
            c_res = subprocess.run(conv_cmd, capture_output=True, text=True)
            if c_res.returncode != 0 or not os.path.exists(input_wav):
                log(f"ERROR: Failed to prepare local audio: {c_res.stderr}", logfile)
                tg_send(f"ERROR: Audio preparation failed for {title}")
                return
        else:
            # YOUTUBE DOWNLOAD
            tg_send(f"Started: {title}\nDownloading...")
            log("Starting download...", logfile)
            temp_template = os.path.join(BASE, f"{title}_input.%(ext)s")

            ffmpeg_dir = os.path.dirname(FFMPEG) if (FFMPEG and os.path.exists(FFMPEG)) else ""
            dl_cmd = [
                YTDLP,
                "--no-playlist",
                "--no-check-certificates",
                "--retries", "5",
                "--fragment-retries", "5",
                "--extractor-args", "youtube:player_client=android,web",
                "-f", "ba/b/bestaudio/best",
                "-x", "--audio-format", "wav",
                "--retries", "5",
                "-o", temp_template,
                url
            ]
            node_bin = shutil.which("node")
            if node_bin:
                dl_cmd.extend(["--js-runtimes", f"node:{node_bin}"])
            if ffmpeg_dir and os.path.exists(ffmpeg_dir):
                dl_cmd.extend(["--ffmpeg-location", ffmpeg_dir])

            ret = run_with_progress(dl_cmd, "download", logfile)
            if ret != 0 or not os.path.exists(input_wav):
                log(f"ERROR: Download failed (exit code {ret}).", logfile)
                tg_send(f"ERROR: Download failed for {title}")
                return

        # Optimization: If start and end are provided, trim input before Demucs to save immense GPU/CPU time
        demucs_input = input_wav
        if start and end:
            log(f"Trimming audio segment: {start} -> {end}...", logfile)
            trimmed_temp = os.path.join(BASE, f"{title}_input_trimmed.wav")
            trim_cmd = [
                FFMPEG, "-y",
                "-ss", start, "-to", end,
                "-i", input_wav,
                "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2",
                trimmed_temp
            ]
            t_ret = subprocess.run(trim_cmd, capture_output=True, text=True)
            if t_ret.returncode == 0 and os.path.exists(trimmed_temp):
                demucs_input = trimmed_temp
                log("Input segment trimmed successfully. Demucs will separate only the requested portion.", logfile)
            else:
                log(f"Trim notice: Fast trim skipped ({t_ret.stderr}), running full track separation.", logfile)

        tg_send(f"{title}\nDownload done. Separating vocals & instrumental...")

        # DEMUCS
        log("Starting vocal separation...", logfile)
        demucs_cmd = [DEMUCS, "--two-stems=vocals", "--out", SEPARATED, demucs_input]
        run_with_progress(demucs_cmd, "demucs", logfile)

        stem_name = os.path.splitext(os.path.basename(demucs_input))[0]
        sep_folder = os.path.join(SEPARATED, "htdemucs", stem_name)
        source_no_vocals = os.path.join(sep_folder, "no_vocals.wav")
        source_vocals = os.path.join(sep_folder, "vocals.wav")

        # Dynamic fallback search if exact folder name has variations
        if not os.path.exists(source_no_vocals) and os.path.exists(SEPARATED):
            for root, dirs, files in os.walk(SEPARATED):
                if "no_vocals.wav" in files and stem_name.lower() in root.lower():
                    sep_folder = root
                    source_no_vocals = os.path.join(sep_folder, "no_vocals.wav")
                    source_vocals = os.path.join(sep_folder, "vocals.wav")
                    break

        if not os.path.exists(source_no_vocals):
            log("ERROR: Demucs separation failed - no_vocals.wav not found.", logfile)
            tg_send(f"ERROR: Demucs failed for {title}")
            return

        tg_send(f"{title}\nStems isolated. Mastering audio...")

        # FFMPEG - post-processing
        log("Processing backing/karaoke audio...", logfile)
        af = (
            "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-40dB,"
            "areverse,"
            "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-40dB,"
            "areverse,"
            "loudnorm"
        )
        format_flags = ["-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2"]

        if start and end and demucs_input != trimmed_temp:
            cmd = [FFMPEG, "-y", "-ss", start, "-to", end, "-i", source_no_vocals, "-af", af] + format_flags + [output_file]
        else:
            cmd = [FFMPEG, "-y", "-i", source_no_vocals, "-af", af] + format_flags + [output_file]

        run_with_progress(cmd, "ffmpeg", logfile)

        if not os.path.exists(output_file):
            log("ERROR: FFmpeg post-processing failed for instrumental/karaoke.", logfile)
            tg_send(f"ERROR: FFmpeg failed for {title}")
            return

        # Also create instrumental copy for clarity
        try:
            shutil.copyfile(output_file, output_inst)
        except Exception:
            pass

        # Also process vocals stem if present!
        if os.path.exists(source_vocals):
            log("Processing vocals audio stem...", logfile)
            if start and end and demucs_input != trimmed_temp:
                v_cmd = [FFMPEG, "-y", "-ss", start, "-to", end, "-i", source_vocals, "-af", af] + format_flags + [output_vocals]
            else:
                v_cmd = [FFMPEG, "-y", "-i", source_vocals, "-af", af] + format_flags + [output_vocals]
            run_with_progress(v_cmd, "ffmpeg", logfile)
            if os.path.exists(output_vocals):
                log(f"[OK] Saved vocals: {output_vocals}", logfile)

        log(f"[OK] Saved instrumental/karaoke: {output_file}", logfile)
        tg_send(f"Done processing: {title}\nSending file...")
        success = True

        # SEND - WAV if under 50MB, else MP3 (deleted after sending)
        tg_send_file(output_file, title, logfile)

    except Exception as e:
        log(f"ERROR: {e}", logfile)
        tg_send(f"ERROR in {name}: {e}")

    finally:
        if sep_folder and os.path.exists(sep_folder):
            try:
                shutil.rmtree(sep_folder, ignore_errors=True)
            except Exception:
                pass
        if input_wav and os.path.exists(input_wav):
            try:
                os.remove(input_wav)
                log(f"Cleaned: {input_wav}", logfile)
            except Exception as e:
                log(f"Cleanup warning: {e}", logfile)
        if trimmed_temp and os.path.exists(trimmed_temp):
            try:
                os.remove(trimmed_temp)
            except Exception:
                pass

        target_dir = DONE if success else FAILED
        target_path = os.path.join(target_dir, name)
        if os.path.exists(proc_path):
            if os.path.exists(target_path):
                try:
                    os.remove(target_path)
                except Exception:
                    pass
            try:
                os.rename(proc_path, target_path)
            except Exception as e:
                log(f"Move error: {e}", logfile)

# ---------- WORKER ----------
def worker():
    while True:
        job = job_queue.get()
        if job is None:
            break
        process_job(job)
        job_queue.task_done()

# ---------- SCAN ----------
def scan_folder():
    try:
        files = [f for f in os.listdir(WATCH) if f.endswith(".txt")]
        for f in files:
            src = os.path.join(WATCH, f)
            dst = os.path.join(PROCESSING, f)
            try:
                os.rename(src, dst)
                job_queue.put(dst)
            except:
                pass
    except Exception as e:
        print(f"Scan error: {e}")

# ---------- START ----------
if __name__ == "__main__":
    for folder in [WATCH, PROCESSING, DONE, FAILED, OUTPUT, LOGS, MODELS, SEPARATED]:
        os.makedirs(folder, exist_ok=True)

    print("=" * 45)
    print("      PRO KAROKE WATCH SYSTEM STARTED")
    print("=" * 45)
    print(f"Queue    : {WATCH}")
    print(f"Output   : {OUTPUT}")
    print(f"Failed   : {FAILED}")
    print(f"Models   : {MODELS}")
    print(f"TG Token : {'OK' if BOT_TOKEN else 'MISSING - check py.env or .env'}")
    print(f"TG ChatID: {CHAT_ID if CHAT_ID else 'MISSING - check py.env or .env'}")
    print("=" * 45)

    for label, path in [("demucs", DEMUCS), ("yt-dlp", YTDLP), ("ffmpeg", FFMPEG)]:
        status = "[OK]     " if path and os.path.exists(path) else "[MISSING]"
        print(f"{status} {label}: {path}")
    print()

    tg_send("Karoke Watcher started and ready! 🎤")

    threads = []
    for _ in range(MAX_WORKERS):
        t = Thread(target=worker, daemon=True)
        t.start()
        threads.append(t)

    print(f"Waiting for jobs in '{WATCH}'...")
    try:
        while True:
            scan_folder()
            time.sleep(2)
    except KeyboardInterrupt:
        print("\nStopping watcher...")