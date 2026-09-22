"""FFmpeg mastering chain — silence removal + loudness normalisation.

This reproduces the exact filter chain from the original watch.py:
  silenceremove → areverse → silenceremove → areverse → loudnorm
Output: pcm_s16le, 44100 Hz, stereo.
"""

from __future__ import annotations

import logging
import subprocess
from pathlib import Path

from auravocal.binaries import get_ffmpeg
from auravocal.config import CHANNELS, SAMPLE_FMT, SAMPLE_RATE

logger = logging.getLogger(__name__)

# The canonical mastering filter graph, ported verbatim from watch.py L353-358
_AUDIO_FILTER = (
    "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-40dB,"
    "areverse,"
    "silenceremove=start_periods=1:start_duration=0.5:start_threshold=-40dB,"
    "areverse,"
    "loudnorm"
)


def master(
    input_path: str | Path,
    output_path: str | Path,
    *,
    trim: tuple[str, str] | None = None,
) -> Path:
    """Apply the AuraVocal mastering chain to an audio file.

    Parameters
    ----------
    input_path:
        Path to the source audio file (typically a raw Demucs stem).
    output_path:
        Destination path for the mastered WAV.
    trim:
        Optional ``(start, end)`` timestamps in ``HH:MM:SS`` format.
        When provided, ffmpeg seeks into the input before filtering.

    Returns
    -------
    Path
        The *output_path* on success.

    Raises
    ------
    RuntimeError
        If ffmpeg exits with a non-zero code.
    FileNotFoundError
        If the input file does not exist.
    """
    input_path = Path(input_path)
    output_path = Path(output_path)

    if not input_path.is_file():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    ffmpeg = get_ffmpeg()

    cmd: list[str] = [ffmpeg, "-y"]

    # Optional time-range seek (applied before decoding for speed)
    if trim:
        start, end = trim
        cmd.extend(["-ss", start, "-to", end])

    cmd.extend([
        "-i", str(input_path),
        "-af", _AUDIO_FILTER,
        "-acodec", SAMPLE_FMT,
        "-ar", str(SAMPLE_RATE),
        "-ac", str(CHANNELS),
        str(output_path),
    ])

    logger.info("Mastering: %s → %s", input_path.name, output_path.name)
    logger.debug("ffmpeg command: %s", " ".join(cmd))

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"ffmpeg mastering failed (exit {result.returncode}):\n"
            f"{result.stderr.strip()}"
        )

    if not output_path.is_file():
        raise RuntimeError(f"ffmpeg produced no output at {output_path}")

    logger.info("Mastering complete: %s", output_path.name)
    return output_path
