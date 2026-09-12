import os
import sys
import re
import subprocess
import shutil
import psutil
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

BASE = os.path.dirname(os.path.abspath(__file__))
for env_name in [".env", "py.env"]:
    env_file = os.path.join(BASE, env_name)
    if os.path.exists(env_file):
        load_dotenv(env_file)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
        sys.stderr.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    except Exception:
        pass

BASE = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE, "static")
QUEUE_DIR = os.path.join(BASE, "queue")
PROCESSING_DIR = os.path.join(BASE, "processing")
DONE_DIR = os.path.join(BASE, "done")
FAILED_DIR = os.path.join(BASE, "failed")
OUTPUT_DIR = os.path.join(BASE, "output")
LOGS_DIR = os.path.join(BASE, "logs")
MODELS_DIR = os.path.join(BASE, "models")
YTDLP_EXE = os.path.join(BASE, "yt-dlp.exe")
if not os.path.exists(YTDLP_EXE):
    YTDLP_EXE = shutil.which("yt-dlp") or "yt-dlp"

for d in [STATIC_DIR, QUEUE_DIR, PROCESSING_DIR, DONE_DIR, FAILED_DIR, OUTPUT_DIR, LOGS_DIR, MODELS_DIR]:
    os.makedirs(d, exist_ok=True)

app = FastAPI(title="Karaoke Vocal Separator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

watcher_process = None

def is_watcher_running() -> bool:
    try:
        current_pid = os.getpid()
        for p in psutil.process_iter(['pid', 'name', 'cmdline']):
            if p.info['pid'] == current_pid:
                continue
            cmdline = p.info.get('cmdline') or []
            cmd_str = " ".join(cmdline).lower()
            if "watch.py" in cmd_str:
                return True
    except Exception:
        pass
    return False

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

def parse_job_file(file_path: str):
    name = os.path.basename(file_path)
    stat = os.stat(file_path)
    url = ""
    title = name.replace(".txt", "")
    start = None
    end = None
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = [l.strip() for l in f if l.strip()]
            if len(lines) >= 1:
                url = lines[0]
            if len(lines) >= 2:
                title = lines[1]
            if len(lines) >= 3:
                start = lines[2]
            if len(lines) >= 4:
                end = lines[3]
    except Exception:
        pass
    
    log_file = os.path.join(LOGS_DIR, name.replace(".txt", ".log"))
    has_log = os.path.exists(log_file)
    has_error = False
    if has_log:
        try:
            with open(log_file, "r", encoding="utf-8", errors="replace") as lf:
                log_txt = lf.read()
                if "ERROR:" in log_txt or "HTTP Error 403" in log_txt:
                    has_error = True
        except Exception:
            pass
    
    return {
        "filename": name,
        "title": title,
        "url": url,
        "start": start,
        "end": end,
        "mtime": stat.st_mtime,
        "size": stat.st_size,
        "has_log": has_log,
        "has_error": has_error
    }

class JobCreateRequest(BaseModel):
    url: str
    title: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None

@app.get("/api/status")
def get_status():
    gpu_name = "None"
    cuda_available = False
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            gpu_name = torch.cuda.get_device_name(0)
    except Exception:
        pass

    return {
        "cuda_available": cuda_available,
        "gpu_name": gpu_name,
        "watcher_running": is_watcher_running(),
        "queue_count": len([f for f in os.listdir(QUEUE_DIR) if f.endswith(".txt")]),
        "processing_count": len([f for f in os.listdir(PROCESSING_DIR) if f.endswith(".txt")]),
        "done_count": len([f for f in os.listdir(DONE_DIR) if f.endswith(".txt")]),
        "failed_count": len([f for f in os.listdir(FAILED_DIR) if f.endswith(".txt")]),
        "output_count": len([f for f in os.listdir(OUTPUT_DIR) if f.endswith(".wav") or f.endswith(".mp3")]),
    }

@app.get("/api/metadata")
def get_youtube_metadata(url: str = Query(...)):
    url = clean_url(url)
    if not ("youtube.com" in url or "youtu.be" in url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    try:
        cmd = [YTDLP_EXE, "--no-playlist"]
        if shutil.which("node"):
            cmd.extend(["--js-runtimes", "node"])
        cmd.extend(["--print", "title", "--print", "duration_string", url])
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=25
        )
        if res.returncode == 0:
            lines = res.stdout.strip().splitlines()
            title = lines[0] if len(lines) > 0 else "YouTube Song"
            duration = lines[1] if len(lines) > 1 else ""
            clean_title = re.sub(r'[\\/*?:"<>|%&^$#]', "", title).strip()
            return {"title": clean_title, "duration": duration, "url": url}
        else:
            return {"title": "", "duration": "", "url": url, "error": res.stderr.strip() or "Failed to fetch metadata"}
    except Exception as e:
        return {"title": "", "duration": "", "url": url, "error": str(e)}

@app.get("/api/jobs")
def get_jobs():
    def get_list(folder):
        files = [os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".txt")]
        files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        return [parse_job_file(f) for f in files]

    return {
        "processing": get_list(PROCESSING_DIR),
        "queue": get_list(QUEUE_DIR),
        "done": get_list(DONE_DIR),
        "failed": get_list(FAILED_DIR),
    }

@app.post("/api/jobs")
async def create_job(req: JobCreateRequest):
    url = clean_url(req.url)
    if not ("youtube.com" in url or "youtu.be" in url):
        raise HTTPException(status_code=400, detail="Must be a valid YouTube URL")

    title = req.title.strip() if req.title else "youtube_track"
    title = re.sub(r'[\\/*?:"<>|%&^$#]', "", title).strip()
    if not title:
        title = "youtube_track"

    modal_endpoint = os.getenv("MODAL_API_URL")
    modal_app_name = os.getenv("MODAL_APP_NAME")

    # 1. Primary path: Serverless Modal GPU HTTP Webhook
    if modal_endpoint:
        try:
            async with httpx.AsyncClient(timeout=600.0) as client:
                payload = {
                    "url": url,
                    "title": title,
                    "start": req.start.strip() if req.start else None,
                    "end": req.end.strip() if req.end else None
                }
                resp = await client.post(modal_endpoint, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("status") == "error":
                        raise HTTPException(status_code=500, detail=data.get("error", "Modal processing error"))
                    return {
                        "status": "completed",
                        "title": data.get("title", title),
                        "r2_key": data.get("r2_key"),
                        "download_url": data.get("download_url"),
                        "duration_seconds": data.get("duration_seconds")
                    }
                else:
                    raise HTTPException(status_code=resp.status_code, detail=f"Modal error: {resp.text}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Modal invocation error: {e}")

    # 2. Secondary path: Modal Python SDK Function.lookup if modal is installed
    if modal_app_name:
        try:
            import modal
            fn = modal.Function.lookup(modal_app_name, "separate_track")
            payload = {
                "url": url,
                "title": title,
                "start": req.start.strip() if req.start else None,
                "end": req.end.strip() if req.end else None
            }
            res = fn.remote(payload)
            if res.get("status") == "error":
                raise HTTPException(status_code=500, detail=res.get("error", "Modal SDK error"))
            return res
        except HTTPException:
            raise
        except Exception as e:
            print(f"[Modal Python SDK Warning] {e}")

    # 3. Fallback: Local folder queue mode (if Modal is not yet configured)
    safe_title = title.replace(" ", "_")
    target_path = os.path.join(QUEUE_DIR, f"{safe_title}.txt")
    counter = 1
    while os.path.exists(target_path):
        target_path = os.path.join(QUEUE_DIR, f"{safe_title}_{counter}.txt")
        counter += 1

    content = f"{url}\n{title}\n"
    if req.start and req.end:
        content += f"{req.start.strip()}\n{req.end.strip()}\n"

    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)

    return {"status": "queued", "filename": os.path.basename(target_path), "title": title}

@app.delete("/api/jobs/{folder}/{filename}")
def delete_job(folder: str, filename: str):
    allowed_folders = {"queue": QUEUE_DIR, "processing": PROCESSING_DIR, "done": DONE_DIR, "failed": FAILED_DIR}
    if folder not in allowed_folders:
        raise HTTPException(status_code=400, detail="Invalid folder")

    path = os.path.join(allowed_folders[folder], os.path.basename(filename))
    if os.path.exists(path):
        os.remove(path)
        log_path = os.path.join(LOGS_DIR, filename.replace(".txt", ".log"))
        if os.path.exists(log_path):
            try:
                os.remove(log_path)
            except Exception:
                pass
        return {"status": "deleted", "filename": filename}
    raise HTTPException(status_code=404, detail="Job not found")

@app.get("/api/files")
def get_output_files():
    files = []
    for f in os.listdir(OUTPUT_DIR):
        if f.endswith(".wav") or f.endswith(".mp3"):
            path = os.path.join(OUTPUT_DIR, f)
            stat = os.stat(path)
            files.append({
                "filename": f,
                "title": f.replace("_karoke.wav", "").replace("_karoke.mp3", "").replace("_", " "),
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "mtime": stat.st_mtime,
                "is_wav": f.endswith(".wav")
            })
    files.sort(key=lambda x: x["mtime"], reverse=True)
    return {"files": files}

@app.get("/api/audio/{filename}")
def stream_audio(filename: str):
    safe_name = os.path.basename(filename)
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    media_type = "audio/wav" if safe_name.endswith(".wav") else "audio/mpeg"
    return FileResponse(file_path, media_type=media_type, filename=safe_name)

@app.delete("/api/audio/{filename}")
def delete_audio(filename: str):
    safe_name = os.path.basename(filename)
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"status": "deleted", "filename": safe_name}
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/api/logs/{job_name}")
def get_job_log(job_name: str):
    safe_name = os.path.basename(job_name).replace(".txt", "").replace(".log", "") + ".log"
    log_path = os.path.join(LOGS_DIR, safe_name)
    if os.path.exists(log_path):
        try:
            with open(log_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            return {"job": job_name, "log": content}
        except Exception as e:
            return {"job": job_name, "log": f"Error reading log: {e}"}
    return {"job": job_name, "log": "No log generated yet for this job."}

@app.post("/api/watcher/start")
def start_watcher():
    if is_watcher_running():
        return {"status": "already_running"}
    python_exe = sys.executable
    venv_py = os.path.join(BASE, "demucs_ext", "Scripts", "python.exe")
    if os.path.exists(venv_py):
        python_exe = venv_py
    watch_script = os.path.join(BASE, "watch.py")
    subprocess.Popen([python_exe, watch_script], cwd=BASE)
    return {"status": "started"}

@app.post("/api/watcher/stop")
def stop_watcher():
    current_pid = os.getpid()
    killed = 0
    for p in psutil.process_iter(['pid', 'name', 'cmdline']):
        if p.info['pid'] == current_pid:
            continue
        cmdline = p.info.get('cmdline') or []
        cmd_str = " ".join(cmdline).lower()
        if "watch.py" in cmd_str:
            try:
                p.kill()
                killed += 1
            except Exception:
                pass
    return {"status": "stopped", "killed_count": killed}

@app.get("/")
def serve_index():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"message": "Frontend static files are being initialized..."})

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("  KARAOKE VOCAL SEPARATOR WEB DASHBOARD")
    print(f"  Access UI at: http://localhost:5000")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")
