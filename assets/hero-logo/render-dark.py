"""Adapt only the ink of the approved v3 scene for Bloom's dark surface.
Run: Blender -b --threads 2 --python assets/hero-logo/render-dark.py
The original scene, emblem, camera and animation remain untouched.
"""
import bpy
import json
from pathlib import Path
import time
import shutil

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/hero-logo/Bloom-v3.blend'
TIMING = json.loads((SOURCE.parent / 'v3-timing.json').read_text())
FRAMES = Path('/tmp/bloom-hero-v3-dark-frames')
FRAMES.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene = bpy.context.scene

def linear(c):
    c /= 255
    return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4

for obj in bpy.data.objects:
    if obj.name.startswith('Glyph_'):
        for material in obj.data.materials:
            for node in material.node_tree.nodes:
                if node.bl_idname == 'ShaderNodeEmission':
                    node.inputs['Color'].default_value = (*map(linear, (242, 246, 234)), 1)

scene.render.threads_mode = 'FIXED'
scene.render.threads = 2
scene.render.use_persistent_data = True
# Render the exact published crop directly, without moving the authored camera.
scene.render.use_border = True
scene.render.use_crop_to_border = True
scene.render.border_min_x = 180 / 1536
scene.render.border_max_x = 1380 / 1536
scene.render.border_min_y = (1024 - 748) / 1024
scene.render.border_max_y = (1024 - 248) / 1024
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'METAL'
prefs.get_devices()
for device in prefs.devices:
    device.use = device.type == 'METAL'
scene.cycles.device = 'GPU' if any(d.type == 'METAL' for d in prefs.devices) else 'CPU'
scene.frame_set(TIMING['frame_end'])
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'assets/hero-logo/Bloom-v3-dark.blend'))
start = time.time()
for frame in range(1, TIMING['hold_frame'] + 1):
    path = FRAMES / f'{frame:04}.png'
    if 1 < frame <= 13:
        shutil.copyfile(FRAMES / '0001.png', path)
        continue
    scene.frame_set(frame)
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    if frame % 30 == 0:
        print(f'HERO_V3_DARK {frame}/{TIMING["hold_frame"]}', flush=True)
(ROOT / 'assets/hero-logo/dark-v3-render.json').write_text(json.dumps({
    'source': str(SOURCE), 'changed': 'Glyph emission color only: #f2f6ea',
    'engine': scene.render.engine, 'device': scene.cycles.device,
    'samples': scene.cycles.samples, 'frames': [1, TIMING['hold_frame']], 'fps': TIMING['fps'],
    'crop': [180, 248, 1200, 500], 'duration_ms': 5000,
    'seconds': time.time() - start, 'leaf_and_motion': 'preserved',
}, indent=2))
