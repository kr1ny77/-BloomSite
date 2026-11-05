"""Render the authored opening and final frames with transparent film.

Run through Blender with the source .blend loaded; pass the output folder after --.
The source scene is never saved by this script.
"""
import sys
from pathlib import Path

import bpy

output_dir = Path(sys.argv[sys.argv.index('--') + 1])
output_dir.mkdir(parents=True, exist_ok=True)
scene = bpy.context.scene
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.threads_mode = 'FIXED'
scene.render.threads = 2

try:
    preferences = bpy.context.preferences.addons['cycles'].preferences
    preferences.compute_device_type = 'METAL'
    preferences.get_devices()
    for device in preferences.devices:
        device.use = device.type == 'METAL'
    scene.cycles.device = 'GPU' if any(device.type == 'METAL' for device in preferences.devices) else 'CPU'
except Exception:
    scene.cycles.device = 'CPU'

for frame in (1, 90):
    scene.frame_set(frame)
    scene.render.filepath = str(output_dir / f'{frame:04}.png')
    bpy.ops.render.render(write_still=True)
    print('BLOOM_ALPHA', frame, scene.cycles.device, flush=True)
