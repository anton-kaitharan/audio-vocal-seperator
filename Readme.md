# YouTube Karoke Maker

Removes vocals from any YouTube video and saves a karoke WAV file.
Uses **yt-dlp** to download, **Demucs** (htdemucs) for AI vocal separation, and **FFmpeg** for processing.
Controlled entirely from your phone via a **Telegram bot**.

---

## Folder Structure

```
YouTubeTools/
├── run.bat           ← manual one-by-one mode (cmd)
├── watch.py          ← auto queue watcher (runs in background)
├── bot.py            ← Telegram bot (add to .gitignore, contains token)
├── requirements.txt  ← Python dependencies
├── .gitignore
│
├── queue/            ← drop .txt job files here (auto-created)
├── processing/       ← jobs currently being processed (auto-created)
├── done/             ← completed job files (auto-created)
├── failed/           ← failed job files with error logs (auto-created)
├── output/           ← final karoke WAV files saved here (auto-created)
├── logs/             ← per-job log files (auto-created)
├── models/           ← demucs AI models stored here (auto-created)
├── separated/        ← demucs temp output (auto-created, auto-cleaned)
├── frontend/         ← Next.js 15 DAW Studio & SaaS web application
├── server.py         ← FastAPI REST API backend
├── SAAS_DEPLOYMENT_GUIDE.md ← production SaaS hosting roadmap
│
├── yt-dlp.exe        ← download separately
├── ffmpeg/           ← download separately
│   └── bin/
│       └── ffmpeg.exe
└── demucs_ext/       ← Python venv (created during setup)
```

---

## Setup

### 1. Prerequisites
- Windows 10/11
- Python 3.10 or later — https://www.python.org/downloads/
- Git — https://git-scm.com/

### 2. Clone the repo
```bat
git clone https://github.com/anton-kaitharan/YouTubeTools.git
cd YouTubeTools
```

### 3. Create venv and install dependencies
```bat
python -m venv demucs_ext
demucs_ext\Scripts\activate
pip install -r requirements.txt
```

### 4. Download yt-dlp
Download `yt-dlp.exe` from https://github.com/yt-dlp/yt-dlp/releases/latest
Place it in the `YouTubeTools/` folder.

### 5. Download FFmpeg
Download the essentials build from https://www.gyan.dev/ffmpeg/builds/
Extract and place the `ffmpeg/` folder so the path is:
`YouTubeTools\ffmpeg\bin\ffmpeg.exe`

### 6. Set up Telegram Bot
1. Message **@BotFather** on Telegram → `/newbot` → copy the token
2. Message **@userinfobot** → copy your user ID
3. Create `bot.py` (not in repo — contains your token):
```python
BOT_TOKEN  = "YOUR_TOKEN"
ALLOWED_ID = 123456789
```

---

## Usage

### Option A — Manual (run.bat)
Double-click `run.bat` and follow the prompts.

### Option B — Queue system (watch.py + bot.py)
Run both in separate cmd windows:
```bat
:: Window 1
python watch.py

:: Window 2
python bot.py
```

Then from your phone, message your Telegram bot:
```
https://youtube.com/watch?v=abc123
Song Title Here
```
Or with trim:
```
https://youtube.com/watch?v=abc123
Song Title Here
00:00:10
00:03:30
```

The bot queues the job, `watch.py` processes it, and sends the finished WAV file back to your Telegram.

### Telegram Bot Commands
- `/start` — show help
- `/list` — show pending jobs
- `/done` — show completed jobs

---

## Notes
- First run downloads the htdemucs model (~80 MB) into `models/` automatically
- Output is always 44100 Hz, stereo, 16-bit PCM WAV (1411 kbps)
- Up to 2 songs can be processed simultaneously