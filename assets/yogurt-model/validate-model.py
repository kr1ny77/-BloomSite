import bpy,json
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(HERE.parent.parent/'static/models/yogurt.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
points=[o.matrix_world@Vector(corner) for o in meshes for corner in o.bound_box]
dims=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
assert len(meshes)==9,len(meshes)
assert .8<dims[0]<1 and .7<dims[2]<1,dims
assert all(o.data.uv_layers for o in meshes if 'wrap' in o.name.lower() or 'face' in o.name.lower())
assert any('Russian original' in m.name for m in bpy.data.materials)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=16
scene.render.resolution_x=540;scene.render.resolution_y=540;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.world=bpy.data.worlds.new('Validation studio');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.5
for name,pos,power,size in [('Key',(-2,-3,4),250,3),('Fill',(2,-2,3),130,2)]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.size=size
 ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=pos;ob.rotation_euler=(Vector((0,0,.4))-ob.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('Validation');cam=bpy.data.objects.new('Validation',data);scene.collection.objects.link(cam);scene.camera=cam
cam.location=(0,-3,1.65);cam.rotation_euler=(Vector((0,0,.43))-cam.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=1.35
scene.render.filepath=str(HERE/'import-front.png');bpy.ops.render.render(write_still=True)
data=bpy.data.lights.new('Reverse fill','AREA');data.energy=200;data.size=3
fill=bpy.data.objects.new('Reverse fill',data);scene.collection.objects.link(fill);fill.location=(0,3,3);fill.rotation_euler=(Vector((0,0,.4))-fill.location).to_track_quat('-Z','Y').to_euler()
cam.location=(0,3,1.65);cam.rotation_euler=(Vector((0,0,.43))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(HERE/'import-reverse.png');bpy.ops.render.render(write_still=True)
triangles=sum(sum(len(p.vertices)-2 for p in ob.data.polygons) for ob in meshes)
(HERE/'validation.json').write_text(json.dumps({'fresh_import':'PASS','meshes':len(meshes),'triangles':triangles,'bounds':dims,'images':[i.name for i in bpy.data.images if i.type=='IMAGE']},indent=2))
