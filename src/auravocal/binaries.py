"""Cross-platform binary discovery for ffmpeg.

yt-dlp and demucs are used as Python libraries, so no binary discovery
is needed for them. Only ffmpeg is invoked as a subprocess.
"""

from __future__ import annotations

import shutil
from functools import lru_cache


@lru_cache(maxsize=1)
def get_ffmpeg() -> str:
    """Return the absolute path to a working ffmpeg binary.

    Resolution order:
    1. ``imageio-ffmpeg`` bundled binary (installed as a pip dependency).
    2. System ``ffmpeg`` on PATH (fallback for users who already have it).

    Raises
    ------
    FileNotFoundError
        If no ffmpeg binary can be located.
    """
    # 1. imageio-ffmpeg ships a static binary for every major OS
    try:
        import imageio_ffmpeg

        path = imageio_ffmpeg.get_ffmpeg_exe()
        if path:
            return path
    except Exception:
        pass

    # 2. Fall back to system PATH
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg

    raise FileNotFoundError(
        "ffmpeg not found. Install it with: pip install imageio-ffmpeg\n"
        "Or place ffmpeg on your system PATH."
    )


@lru_cache(maxsize=1)
def get_ffprobe() -> str:
    """Return the absolute path to a working ffprobe binary.

    Resolution order:
    1. Sibling of the ffmpeg binary found by :func:`get_ffmpeg`.
    2. System ``ffprobe`` on PATH.

    Raises
    ------
    FileNotFoundError
        If no ffprobe binary can be located.
    """
    import os

    # Try to find ffprobe next to ffmpeg
    try:
        ffmpeg_path = get_ffmpeg()
        ffmpeg_dir = os.path.dirname(ffmpeg_path)
        for candidate in ("ffprobe", "ffprobe.exe"):
            probe = os.path.join(ffmpeg_dir, candidate)
            if os.path.isfile(probe):
                return probe
    except FileNotFoundError:
        pass

    system_ffprobe = shutil.which("ffprobe")
    if system_ffprobe:
        return system_ffprobe

    raise FileNotFoundError(
        "ffprobe not found. It usually ships alongside ffmpeg.\n"
        "Install imageio-ffmpeg or place ffprobe on your system PATH."
    )
