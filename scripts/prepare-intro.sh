#!/usr/bin/env bash
set -euo pipefail
site_dir="$(cd "$(dirname "$0")/.." && pwd)"
source_dir="${1:-$site_dir/../bloom-intro-v4}"
mkdir -p "$site_dir/static/media" "$site_dir/assets/intro-blender"
# Keep the complete motion envelope, including the tall leaf at the opening.
crop='crop=1320:800:330:150'
# Render only the two static images with alpha; the authored movie stays unchanged.
blender_bin="${BLOOM_BLENDER_BIN:-/Applications/Blender.app/Contents/MacOS/Blender}"
"$blender_bin" --background --disable-autoexec --threads 2 "$source_dir/Bloom-Intro.blend" \
  --python "$site_dir/scripts/render-intro-stills.py" -- "$site_dir/assets/intro-blender/alpha-originals"
ffmpeg -y -hide_banner -loglevel error -framerate 30 -start_number 1 \
  -i "$source_dir/frames/%04d.png" -frames:v 90 -vf "$crop" \
  -c:v libx264 -threads 2 -crf 17 -pix_fmt yuv420p -an -movflags +faststart \
  "$site_dir/static/media/bloom-intro.mp4"
for frame in first final; do
  if [[ "$frame" == first ]]; then input="$site_dir/assets/intro-blender/alpha-originals/0001.png"; else input="$site_dir/assets/intro-blender/alpha-originals/0090.png"; fi
  ffmpeg -y -hide_banner -loglevel error -i "$input" -vf "$crop" -frames:v 1 \
    "$site_dir/assets/intro-blender/bloom-wordmark-$frame.png"
  cwebp -quiet -lossless -m 6 "$site_dir/assets/intro-blender/bloom-wordmark-$frame.png" \
    -o "$site_dir/static/images/bloom-wordmark-$frame.webp"
done
