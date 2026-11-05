"""Encode the native v3 crop as a one-shot, five-second, 60fps WebP."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'static/media/bloom-logo'
durations = [round((i + 1) * 1000 / 60) - round(i * 1000 / 60) for i in range(181)]
durations[-1] += 5000 - sum(durations)
frames = [Image.open(f'/tmp/bloom-hero-v3-dark-frames/{f:04}.png').convert('RGBA')
          for f in range(1, 182)]
frames[0].save(OUTPUT / 'intro-v3-dark.webp', save_all=True, append_images=frames[1:],
               duration=durations, loop=1, quality=88, method=5,
               lossless=False, allow_mixed=True, exact=True)
frames[-1].save(OUTPUT / 'static-v3-dark.webp', lossless=True, method=6)
for frame in frames:
    frame.close()
