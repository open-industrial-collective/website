import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {parse,stringify} from 'yaml';
import sharp from 'sharp';
import {parseProfile,normalizeProfile,type Profile} from '../src/profile.ts';
import {createSnapshot,localReader,renderSnapshot} from '../scripts/profile-snapshot.ts';
const full=readFileSync(new URL('../public/templates/project-v2.yaml',import.meta.url),'utf8');
const base=parse(full) as Profile;
const minimal=()=>{const p=structuredClone(base);delete p.branding;delete p.media;delete p.faq;delete p.release;delete p.links;return p;};
test('v2 rich and minimal profiles validate and round trip without losing optional fields',()=>{
 for(const p of [base,minimal()]){assert.deepEqual(parseProfile(stringify(p)).errors,[]);assert.deepEqual(parseProfile(stringify(parseProfile(stringify(p)).project)).project,p);}
 assert.equal(normalizeProfile(minimal()).profile?.media?.length,0);
});
test('v2 rejects dangerous paths, invalid relationships, paid editions and forged publication decisions',()=>{
 const bad=[{...base,access:{...base.access,cost:'paid'}},{...base,reviewed:'today'},{...base,actions:base.actions.map(a=>({...a,primary:false}))},{...base,actions:[...base.actions,...base.actions]},{...base,source:{availability:'open-source'}},{...base,description:{file:'../private.md'}},{...base,description:{file:'./a.md',text:'also text'}},{...base,media:[{id:'x',type:'image',src:'https://example.org/track.png',alt:'x'}]},{...base,requirements:[{name:'x',kind:'software',cost:'free',notes:'okay',applies_to:['missing']}]},{...base,links:{wiki:'javascript:alert(1)'}}];
 for(const p of bad)assert.ok(parseProfile(stringify(p)).errors.length,JSON.stringify(p));
 for(const s of [full+'\nid: duplicated\n',full+'\n---\n'+full,'#'.repeat(66000),full+'\nx: !tag value'])assert.ok(parseProfile(s).errors.length);
});
test('paid requirements apply to the relevant action, not an unrelated free demo',()=>{
 const p=minimal();p.actions.push({id:'local',type:'install',primary:false,url:'https://example.org/local'});p.requirements=[{name:'Host',kind:'software',cost:'paid',notes:'Local only',applies_to:['local']}];assert.equal(normalizeProfile(p).software_requirements,'no-paid-required');p.requirements[0].applies_to=['demo'];assert.equal(normalizeProfile(p).software_requirements,'paid-platform-required');
});
test('arbitrary second project resolves generic logo, image, video, FAQ and primary action',()=>{
 const p={...base,id:'another-independent-tool'};const n=normalizeProfile(p,{'./media/logo-on-light.png':'/images/logo.webp','./media/overview.webp':'/images/overview.webp'});assert.equal(n.id,p.id);assert.equal(n.profile?.branding?.logo.on_light,'/images/logo.webp');assert.equal(n.profile?.media?.[0].type,'image');assert.equal(n.profile?.media?.[1].type,'video');assert.deepEqual(n.profile?.faq,p.faq);assert.equal(n.get_started,p.actions[0].url);
});
test('pinned snapshots detect asset-only changes, reject symlinks and preserve committed state',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'oic-test-'));const git=(args:string[])=>execFileSync('git',args,{cwd:dir,encoding:'utf8'}).trim();
 try {
  git(['init','-q']);git(['config','user.name','Test']);git(['config','user.email','test@example.org']);mkdirSync(join(dir,'.oic/media'),{recursive:true});
  const p=minimal();p.description={file:'./overview.md'};p.media=[{id:'screen',type:'image',src:'./media/screen.png',alt:'Synthetic test image'}];
  writeFileSync(join(dir,'.oic/project.yaml'),stringify(p));writeFileSync(join(dir,'.oic/overview.md'),'A committed overview for an unrelated project.');
  const png=async(color:string)=>sharp({create:{width:2,height:2,channels:3,background:color}}).png().toBuffer();
  writeFileSync(join(dir,'.oic/media/screen.png'),await png('red'));git(['add','.']);git(['commit','-qm','first']);const first=git(['rev-parse','HEAD']);const a=await createSnapshot(first,'.oic/project.yaml',localReader(dir,first));
  writeFileSync(join(dir,'.oic/media/screen.png'),await png('blue'));assert.equal((await createSnapshot(first,'.oic/project.yaml',localReader(dir,first))).digest,a.digest);
  git(['add','.']);git(['commit','-qm','image only']);const second=git(['rev-parse','HEAD']);const b=await createSnapshot(second,'.oic/project.yaml',localReader(dir,second));assert.notEqual(a.digest,b.digest);assert.equal(renderSnapshot(a).description,'A committed overview for an unrelated project.');
  const tampered=structuredClone(a);tampered.files['./overview.md'].content='changed';assert.throws(()=>renderSnapshot(tampered),/digest/);
  rmSync(join(dir,'.oic/overview.md'));symlinkSync('../../secret',join(dir,'.oic/overview.md'));git(['add','.']);git(['commit','-qm','symlink']);const third=git(['rev-parse','HEAD']);await assert.rejects(createSnapshot(third,'.oic/project.yaml',localReader(dir,third)),/regular file/);
  assert.equal(renderSnapshot(a).id,p.id,'last good snapshot remains usable');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('oversized files and unsupported image formats are rejected before publishing',async()=>{
 const p=minimal();p.media=[{id:'x',type:'image',src:'./x.png',alt:'x'}];
 await assert.rejects(createSnapshot('a'.repeat(40),'.oic/project.yaml',async path=>Buffer.from(path.endsWith('.yaml')?stringify(p):'<svg/>')));
});
