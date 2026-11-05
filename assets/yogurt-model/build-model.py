import bpy, math, json
from mathutils import Vector
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent.parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=32
scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.84,.75,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.6

def mat(name,color,metal=0,rough=.4):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
cream=mat('Molded warm white polymer',(.85,.87,.79),0,.32)
foil=mat('Fine aluminum foil',(.72,.75,.72),.82,.27)
# Fine foil texture is render-only; basic metallic/roughness also survives GLB.
p=foil.node_tree.nodes.get('Principled BSDF');n=foil.node_tree.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=240
b=foil.node_tree.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.12;b.inputs['Distance'].default_value=.003
foil.node_tree.links.new(n.outputs['Fac'],b.inputs['Height']);foil.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])
printmat=mat('Russian original packaging print',(.9,.92,.85),0,.55)
t=printmat.node_tree.nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(HERE/'label.jpg'));t.image.pack();printmat.node_tree.links.new(t.outputs['Color'],printmat.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
parts=[]
def lathe(name,profile,material,N=256,uv=False):
 verts=[];faces=[]
 # theta starts at -pi/2; front is u=.25; rear u=.75.
 for r,z in profile:
  for i in range(N+1):
   a=2*math.pi*i/N-math.pi/2;verts.append((r*math.sin(a),-r*math.cos(a),z))
 for j in range(len(profile)-1):
  for i in range(N):a=j*(N+1)+i;faces.append((a,a+1,a+N+2,a+N+1))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
 ob=bpy.data.objects.new(name,mesh);scene.collection.objects.link(ob);ob.data.materials.append(material)
 if uv:
  uvl=mesh.uv_layers.new(name='Wrap UV')
  for poly in mesh.polygons:
   for li in poly.loop_indices:
    v=mesh.loops[li].vertex_index;j,i=divmod(v,N+1);uvl.data[li].uv=(i/N,(profile[j][1]-profile[0][1])/(profile[-1][1]-profile[0][1]))
 for poly in mesh.polygons:poly.use_smooth=True
 parts.append(ob);return ob
# Revolved sealed cup with proper underside, lip and foil seating.
body=lathe('Cup molded shell',[(.001,.035),(.315,.035),(.33,.045),(.337,.065),(.342,.09),(.424,.73),(.428,.77),(.438,.786),(.442,.797),(.44,.807),(.425,.813),(.417,.802)],cream)
lathe('Printed wrap',[(.344,.092),(.4244,.731)],printmat,uv=True)
lathe('Lower molding seam',[(.335,.059),(.341,.062),(.342,.067),(.340,.071)],cream)
lathe('Molded lower foot',[(.314,.034),(.32,.024),(.33,.025),(.338,.038),(.338,.052)],cream)
lathe('Rolled lip bead',[(.419,.785),(.449,.786),(.453,.797),(.45,.808),(.434,.815)],cream)
lathe('Foil crimped perimeter',[(.001,.818),(.425,.818),(.451,.816),(.46,.809),(.461,.804)],foil)
# Printed foil seal retains a fine metallic perimeter and crimp.
lidmat=mat('Printed foil seal',(.8,.85,.7),.25,.4)
tex=lidmat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(HERE/'lid.jpg'));tex.image.pack()
lidmat.node_tree.links.new(tex.outputs['Color'],lidmat.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
N=256
verts=[(0,0,.819)]+[(.435*math.cos(i*2*math.pi/N),.435*math.sin(i*2*math.pi/N),.8195+.0005*math.sin(i*.7)) for i in range(N)]
faces=[(0,i+1,(i+1)%N+1) for i in range(N)]
mesh=bpy.data.meshes.new('Printed seal face');mesh.from_pydata(verts,[],faces);mesh.update()
uvl=mesh.uv_layers.new(name='Lid UV')
for poly in mesh.polygons:
 for li in poly.loop_indices:
  co=mesh.vertices[mesh.loops[li].vertex_index].co;uvl.data[li].uv=(.5+co.x/.9,.5+co.y/.9)
ob=bpy.data.objects.new('Printed foil face',mesh);scene.collection.objects.link(ob);ob.data.materials.append(lidmat);parts.append(ob)
# Subtle physically seated radial crimp ridges around outside rim.
for i in range(80):
 a=i*2*math.pi/80
 bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=1,location=(.454*math.cos(a),.454*math.sin(a),.809))
 ob=bpy.context.object;ob.name='Foil edge crimp';ob.scale=(.008,.004,.004);ob.rotation_euler.z=a;ob.data.materials.append(foil);parts.append(ob)
# Join same-material crimp details to avoid80 separate runtime draw calls.
crimps=[ob for ob in parts if ob.name.startswith('Foil edge crimp')]
parts=[ob for ob in parts if ob not in crimps]
bpy.ops.object.select_all(action='DESELECT')
for ob in crimps: ob.select_set(True)
bpy.context.view_layer.objects.active=crimps[0]
bpy.ops.object.join()
ob=bpy.context.object;ob.name='Foil rim crimps';parts.append(ob)
# Typical foil half-ellipse: straight seated hinge, continuous rounded free edge.
a=-math.pi/4; radial=Vector((math.cos(a),math.sin(a),0)); tangent=Vector((-math.sin(a),math.cos(a),0))
verts=[]
for i in range(49):
 t=math.pi*i/48
 v=radial*(.435+.112*math.sin(t))+tangent*(.071*math.cos(t))
 verts.append((v.x,v.y,.817-.006*math.sin(t)))
mesh=bpy.data.meshes.new('Rounded semicircle pull tab');mesh.from_pydata(verts,[],[tuple(range(len(verts)))]);mesh.update()
ob=bpy.data.objects.new('Rounded foil pull tab',mesh);scene.collection.objects.link(ob);ob.data.materials.append(foil)
s=ob.modifiers.new('Thin foil','SOLIDIFY');s.thickness=.0018
v=ob.modifiers.new('Soft tab edge','BEVEL');v.width=.001;v.segments=3;parts.append(ob)
# All delivered model parts grouped; real vertical pivot at the cup center.
assembly=bpy.data.objects.new('Yogurt assembly',None);scene.collection.objects.link(assembly)
for ob in parts:ob.parent=assembly

def light(name,pos,power,size):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
 ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=pos;ob.rotation_euler=(Vector((0,0,.4))-ob.location).to_track_quat('-Z','Y').to_euler()
light('Large softbox',(-2,-3,4),250,3);light('Foil strip',(2,0,3),180,2);light('Front fill',(0,-3,1),70,2)
data=bpy.data.cameras.new('Front product camera');cam=bpy.data.objects.new('Front product camera',data);scene.collection.objects.link(cam);scene.camera=cam
cam.location=(0,-3,1.65);cam.rotation_euler=(Vector((0,0,.43))-cam.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=1.35
# Geometry check / export only the product, excluding studio.
bpy.ops.object.select_all(action='DESELECT')
for ob in parts:ob.select_set(True)
assembly.select_set(True);bpy.context.view_layer.objects.active=body
(ROOT/'static/models').mkdir(exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'static/models/yogurt.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_image_format='AUTO')
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'yogurt.blend'))
scene.render.filepath=str(HERE/'front.png');bpy.ops.render.render(write_still=True)
assembly.rotation_euler.z=math.pi;scene.render.filepath=str(HERE/'reverse.png');bpy.ops.render.render(write_still=True)
tri=sum(len(ob.data.polygons)*2 for ob in parts if ob.type=='MESH')
(HERE/'build-report.json').write_text(json.dumps({'parts':len(parts),'estimated_triangles':tri,'dimensions':[.92,.92,.82],'glb_bytes':(ROOT/'static/models/yogurt.glb').stat().st_size,'blender':bpy.app.version_string},indent=2))
