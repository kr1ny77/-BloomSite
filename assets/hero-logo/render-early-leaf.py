"""Render an early formed-emblem reveal; keep v3 lettering and final lockup.
Blender -b --threads 2 --python assets/hero-logo/render-early-leaf.py
"""
from pathlib import Path
import bpy
from mathutils import Vector
import json, time, shutil
ROOT = Path(__file__).resolve().parents[2]

def ease(t):
    t = max(0., min(1., t))
    return t*t*t*(t*(6*t-15)+10)

report = {}
for theme in ['light', 'dark']:
    source = ROOT / f'assets/hero-logo/Bloom-v3{"-dark" if theme == "dark" else ""}.blend'
    bpy.ops.wm.open_mainfile(filepath=str(source))
    s = bpy.context.scene
    s.frame_set(300)
    bpy.context.view_layer.update()
    before = {o.name: [list(row) for row in o.matrix_world] for o in bpy.data.objects
              if o.name.startswith('Glyph_') or o.name == 'Leaf_Emblem'}
    leaf = bpy.data.objects['Leaf_Emblem']
    leaf.animation_data_clear()
    material = leaf.data.materials[0]
    material.node_tree.animation_data_clear()
    node = material.node_tree.nodes['V3 · whole object opacity']
    p = [v.co for v in leaf.data.vertices]
    pivot = Vector(tuple((min(v[i] for v in p)+max(v[i] for v in p))/2 for i in range(3)))
    for f in list(range(1, 117)) + [300]:
        t = (f-1)/60
        e = ease((t-.2)/1.0)
        scale = .96 + .04*e
        leaf.location = pivot*(1-scale) + Vector((-.018,-.045,0))*(1-e)
        leaf.scale = (scale,)*3
        for path in ['location', 'scale']: leaf.keyframe_insert(path, frame=f)
        node.outputs[0].default_value = ease((t-.2)/.48)
        node.outputs[0].keyframe_insert('default_value', frame=f)
    for owner in [leaf, material.node_tree]:
        for layer in owner.animation_data.action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for curve in bag.fcurves:
                        for key in curve.keyframe_points: key.interpolation = 'LINEAR'
    s.frame_set(300)
    bpy.context.view_layer.update()
    after = {o.name: [list(row) for row in o.matrix_world] for o in bpy.data.objects if o.name in before}
    assert before == after, 'Final lockup must remain identical'
    s.frame_set(34)
    assert node.outputs[0].default_value > .8, 'Leaf must be visible during the letter wave'
    s.render.use_border = True
    s.render.use_crop_to_border = True
    s.render.border_min_x, s.render.border_max_x = 180/1536, 1380/1536
    s.render.border_min_y, s.render.border_max_y = (1024-748)/1024, (1024-248)/1024
    s.render.resolution_percentage = 100
    s.render.threads_mode = 'FIXED'
    s.render.threads = 2
    s.render.use_persistent_data = True
    s.cycles.samples = 16
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for device in prefs.devices: device.use = device.type == 'METAL'
    s.cycles.device = 'GPU' if any(d.type == 'METAL' for d in prefs.devices) else 'CPU'
    s.frame_set(300)
    s['hero_revision'] = 'v4: formed leaf appears with letters at .20s, opaque .68s, settled 1.20s. Letter motion and final unchanged.'
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/f'assets/hero-logo/Bloom-v4-{theme}.blend'))
    folder = Path(f'/tmp/bloom-hero-v4-{theme}-frames')
    folder.mkdir(exist_ok=True)
    start = time.time()
    for f in range(1, 117):
        path = folder / f'{f:04}.png'
        if 1 < f <= 13:
            shutil.copyfile(folder/'0001.png', path)
            continue
        s.frame_set(f)
        s.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        if f%30 == 0: print(f'BLOOM_V4 {theme} {f}/116', flush=True)
    report[theme] = {'frames_rendered':116, 'hold_until':300, 'fps':60,
                     'final_matrices_identical':before==after, 'seconds':time.time()-start,
                     'leaf_start':.2,'leaf_opaque':.68,'leaf_settled':1.2}
    (ROOT/'assets/hero-logo/v4-render.json').write_text(json.dumps(report,indent=2))
