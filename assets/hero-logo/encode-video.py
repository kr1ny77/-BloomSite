"""Encode v3 native PNG sequences as transparent 60fps web video.

Requires FFmpeg with libvpx-vp9 and macOS hevc_videotoolbox.
Light frames are full 1536x1024 renders; dark frames use the authored crop.
Usage: python3 assets/hero-logo/encode-video.py --light-frames PATH --dark-frames PATH
"""
import argparse
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--light-frames', type=Path, required=True)
parser.add_argument('--dark-frames', type=Path, required=True)
args = parser.parse_args()
output = Path(__file__).resolve().parents[2] / 'static/media/bloom-logo'
for theme, frames in [('light', args.light_frames), ('dark', args.dark_frames)]:
    if not (frames / '0001.png').is_file():
        parser.error(f'Missing native frame sequence: {frames}')
    crop = 'crop=1200:500:180:248,' if theme == 'light' else ''
    filters = crop + 'tpad=stop_mode=clone:stop_duration=5,'
    common = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-threads', '2',
              '-framerate', '60', '-i', str(frames / '%04d.png')]
    for extension, pixel_format, codec in [
        ('webm', 'yuva420p', ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '24',
                            '-deadline', 'good', '-cpu-used', '3', '-row-mt', '1', '-auto-alt-ref', '0']),
        ('mov', 'bgra', ['-c:v', 'hevc_videotoolbox', '-alpha_quality', '0.9',
                         '-tag:v', 'hvc1', '-b:v', '1500k', '-movflags', '+faststart']),
    ]:
        subprocess.run(common + ['-vf', filters + 'format=' + pixel_format,
                                 '-frames:v', '300', '-an'] + codec +
                       [str(output / f'intro-v3-{theme}-60.{extension}')], check=True)
