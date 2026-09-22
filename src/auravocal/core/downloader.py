"""yt-dlp download wrapper — used as a Python library, not a subprocess.

Replaces the subprocess yt-dlp.exe calls from watch.py with the
``yt_dlp.YoutubeDL`` Python API for cross-platform compatibility.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any

from auravocal.binaries import get_ffmpeg
from auravocal.config import DEFAULT_CACHE_DIR

logger = logging.getLogger(__name__)


def _clean_url(url: str) -> str:
    """Normalise a YouTube URL, stripping tracking params.

    Handles youtube.com/watch, youtube.com/shorts, youtu.be,
    and music.youtube.com variants.
    """
    url = url.strip()

    patterns = [
        r"(https?://(?:www\.|music\.)?youtube\.com/watch\?v=[^&]+)",
        r"(https?://(?:www\.)?youtube\.com/shorts/[^?&]+)",
        r"(https?://youtu\.be/[^?&]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    return url.split("&")[0]


def _clean_title(title: str) -> str:
    """Remove filesystem-unsafe characters from a title string."""
    title = re.sub(r'[\\/*?:"<>|%&^$#]', "", title)
    return title.strip() or "track"


def get_metadata(url: str) -> dict[str, Any]:
    """Fetch video metadata (title, duration) without downloading.

    Parameters
    ----------
    url:
        YouTube URL (or any yt-dlp-supported URL).

    Returns
    -------
    dict
        ``{"title": str, "duration": float, "url": str}``
    """
    import yt_dlp

    clean = _clean_url(url)

    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
        "noplaylist": True,
        "skip_download": True,
    }

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(clean, download=False)

    if info is None:
        raise RuntimeError(f"yt-dlp returned no info for: {clean}")

    return {
        "title": _clean_title(info.get("title", "track")),
        "duration": float(info.get("duration", 0)),
        "url": clean,
    }


def download(
    url: str,
    output_dir: str | Path | None = None,
) -> Path:
    """Download the best audio stream and convert to WAV.

    Parameters
    ----------
    url:
        YouTube URL (or any yt-dlp-supported URL).
    output_dir:
        Directory to write the downloaded WAV into.
        Defaults to ``~/.cache/auravocal/downloads/``.

    Returns
    -------
    Path
        Absolute path to the downloaded ``.wav`` file.

    Raises
    ------
    RuntimeError
        If the download or conversion fails.
    """
    import yt_dlp

    clean = _clean_url(url)

    if output_dir is None:
        output_dir = DEFAULT_CACHE_DIR / "downloads"
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Fetch title for the output filename
    meta = get_metadata(clean)
    safe_title = meta["title"].replace(" ", "_")
    output_template = str(output_dir / f"{safe_title}.%(ext)s")

    ffmpeg_path = get_ffmpeg()

    opts: dict[str, Any] = {
        "format": "bestaudio/best",
        "noplaylist": True,
        "retries": 5,
        "fragment_retries": 5,
        "outtmpl": output_template,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": "0",
            }
        ],
        "ffmpeg_location": str(Path(ffmpeg_path).parent),
        "quiet": False,
        "no_warnings": False,
    }

    logger.info("Downloading: %s", clean)

    with yt_dlp.YoutubeDL(opts) as ydl:
        error_code = ydl.download([clean])

    if error_code != 0:
        raise RuntimeError(f"yt-dlp download failed (code {error_code}) for: {clean}")

    # Find the produced WAV
    expected = output_dir / f"{safe_title}.wav"
    if expected.is_file():
        logger.info("Downloaded: %s", expected)
        return expected

    # Fallback: search for any WAV in the output dir matching the title
    for candidate in output_dir.glob(f"{safe_title}*.wav"):
        logger.info("Downloaded: %s", candidate)
        return candidate

    raise RuntimeError(
        f"Download completed but WAV not found. "
        f"Expected: {expected}"
    )
