import os
import sys
import re
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
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

# ===================== CONFIG =====================
BOT_TOKEN  = os.getenv("BOT_TOKEN_ENV")
raw_id     = os.getenv("ALLOWED_ID_ENV")
ALLOWED_ID = int(raw_id) if raw_id and raw_id.strip().lstrip("-").isdigit() else None
QUEUE      = os.path.join(BASE, "queue")
PROCESSING = os.path.join(BASE, "processing")
DONE       = os.path.join(BASE, "done")
OUTPUT     = os.path.join(BASE, "output")
# ==================================================

def clean_url(url):
    match = re.search(r"(https?://(?:www\.)?youtube\.com/watch\?v=[^&]+)", url)
    if match:
        return match.group(1)
    match = re.search(r"(https?://youtu\.be/[^?&]+)", url)
    if match:
        return match.group(1)
    return url.split("&")[0]

def is_youtube_url(text):
    return "youtube.com/watch" in text or "youtu.be/" in text

# /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_ID:
        await update.message.reply_text("Unauthorized.")
        return
    await update.message.reply_text(
        "Karoke Bot Ready!\n\n"
        "Send job in this format:\n\n"
        "URL\n"
        "Song Title\n"
        "00:01:00  (start - optional)\n"
        "00:03:30  (end - optional)\n\n"
        "Commands:\n"
        "/list  - pending & processing jobs\n"
        "/done  - completed jobs\n"
        "/files - output files with sizes\n"
        "/start - show this help"
    )

# /list - shows currently processing + waiting separately
async def list_jobs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_ID:
        await update.message.reply_text("Unauthorized.")
        return

    processing = [f for f in os.listdir(PROCESSING) if f.endswith(".txt")]
    waiting    = [f for f in os.listdir(QUEUE) if f.endswith(".txt")]

    msg = ""
    if processing:
        msg += "Processing now:\n" + "\n".join(f"  * {f}" for f in processing) + "\n\n"
    if waiting:
        msg += "Waiting:\n" + "\n".join(f"  * {f}" for f in waiting)

    await update.message.reply_text(msg if msg else "Queue is empty.")

# /done - completed jobs
async def done_jobs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_ID:
        await update.message.reply_text("Unauthorized.")
        return
    files = [f for f in os.listdir(DONE) if f.endswith(".txt")]
    await update.message.reply_text(
        "Completed:\n" + "\n".join(f"  * {f}" for f in files) if files else "No completed jobs yet."
    )

# /files - list output folder with file sizes
async def list_files(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_ID:
        await update.message.reply_text("Unauthorized.")
        return

    files = sorted(os.listdir(OUTPUT))
    if not files:
        await update.message.reply_text("No output files yet.")
        return

    lines = []
    for f in files:
        size_mb = os.path.getsize(os.path.join(OUTPUT, f)) / (1024 * 1024)
        lines.append(f"  {f} ({size_mb:.1f} MB)")

    await update.message.reply_text("Output files:\n" + "\n".join(lines))

# Handle messages - create job file
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_ID:
        await update.message.reply_text("Unauthorized.")
        return

    text  = update.message.text.strip()
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    if len(lines) < 2:
        await update.message.reply_text(
            "Need at least 2 lines:\nLine 1: YouTube URL\nLine 2: Song title"
        )
        return

    if not is_youtube_url(lines[0]):
        await update.message.reply_text("Line 1 must be a YouTube URL.")
        return

    url   = clean_url(lines[0])
    title = lines[1]
    start = lines[2] if len(lines) > 2 else None
    end   = lines[3] if len(lines) > 3 else None

    content = f"{url}\n{title}\n"
    if start and end:
        content += f"{start}\n{end}\n"

    safe_name    = re.sub(r"[\\/*?:\"<>|]", "", title).strip().replace(" ", "_")
    job_filename = os.path.join(QUEUE, f"{safe_name}.txt")
    counter      = 1
    while os.path.exists(job_filename):
        job_filename = os.path.join(QUEUE, f"{safe_name}_{counter}.txt")
        counter += 1

    os.makedirs(QUEUE, exist_ok=True)
    with open(job_filename, "w", encoding="utf-8") as f:
        f.write(content)

    reply = f"Queued!\nTitle : {title}\nURL   : {url}"
    if start and end:
        reply += f"\nTrim  : {start} to {end}"

    await update.message.reply_text(reply)
    print(f"Job added: {job_filename}")

# ---------- START ----------
if __name__ == "__main__":
    for folder in [QUEUE, PROCESSING, DONE, OUTPUT]:
        os.makedirs(folder, exist_ok=True)

    print("=" * 45)
    print("      YouTube Karoke Telegram Bot")
    print("=" * 45)
    print(f"Base Directory   : {BASE}")
    print(f"Queue Directory  : {QUEUE}")
    print(f"Bot Token Loaded : {'YES' if BOT_TOKEN else 'NO - check py.env or .env'}")
    print(f"Allowed User ID  : {ALLOWED_ID if ALLOWED_ID else 'NOT SET - check py.env or .env'}")
    print("=" * 45)

    if not BOT_TOKEN or not ALLOWED_ID:
        print("\n[CONFIGURATION REQUIRED FOR TELEGRAM BOT]")
        print("To use the Telegram bot:")
        print("1. Copy 'py.env.example' to 'py.env' (or '.env')")
        print("2. Set BOT_TOKEN_ENV to your Telegram bot token from @BotFather")
        print("3. Set ALLOWED_ID_ENV to your Telegram user ID from @userinfobot")
        print("\nAlternatively, run 'run.bat' for direct interactive usage without Telegram.")
        exit(1)

    print("Bot starting...")
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("list", list_jobs))
    app.add_handler(CommandHandler("done", done_jobs))
    app.add_handler(CommandHandler("files", list_files))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("Bot running. Send messages from your phone.")
    app.run_polling(drop_pending_updates=True)