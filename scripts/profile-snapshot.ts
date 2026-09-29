import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname, posix} from 'node:path';
import sharp from 'sharp';
import {parseProfile, referencedFiles, normalizeProfile} from '../src/profile.ts';
export const digest=(v: string|Uint8Array)=>createHash('sha256').update(v).digest('hex');
export type ReadBlob=(path:string,limit:number)=>Promise<Buffer>;
export type Snapshot={commit:string; manifest:string; digest:string; files:Record<string,{digest:string;content:string;kind:'image'|'text'}>};
export async function createSnapshot(commit:string, manifestPath:string, read:ReadBlob):Promise<Snapshot> {
 if(!/^[a-f0-9]{40}$/.test(commit)) throw Error('A full immutable commit SHA is required.');
 if(!/^(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_-]+\.ya?ml$/.test(manifestPath) || manifestPath.split('/').some(s=>s==='..'||s==='.')) throw Error('Invalid manifest path.');
 const manifest=(await read(manifestPath,65536)).toString('utf8');
 const result=parseProfile(manifest); if(!result.project) throw Error(result.errors.join('; '));
 const files:Snapshot['files']={}; let total=0;
 if(result.project.schema==='oic/project/v2') for(const name of referencedFiles(result.project)) {
  const markdown=name.endsWith('.md');
  const data=await read(posix.join(dirname(manifestPath),name),markdown?20480:2*1024*1024);
  if(data.length>(markdown?20480:2*1024*1024)) throw Error(`File exceeds limit: ${name}`);
  total+=data.length; if(total>20*1024*1024) throw Error('Profile exceeds 20 MB.');
  if(markdown) files[name]={digest:digest(data),content:data.toString('utf8'),kind:'text'};
  else {
   const image=sharp(data,{limitInputPixels:12000000,animated:false}); const metadata=await image.metadata();
   if(!['png','jpeg','webp'].includes(metadata.format || '') || (metadata.pages || 1)>1) throw Error('Only static PNG, JPEG and WebP images are supported.');
   const clean=await image.rotate().webp({quality:88}).toBuffer();
   files[name]={digest:digest(clean),content:clean.toString('base64'),kind:'image'};
  }
 }
 const hash=digest(JSON.stringify({manifest,files}));
 return {commit,manifest,digest:hash,files};
}
export function localReader(repo:string,commit:string):ReadBlob {
 return async(path,limit)=> {
  const entry=execFileSync('git',['-C',repo,'ls-tree',commit,'--',path],{encoding:'utf8',maxBuffer:4096}).trim();
  if(!entry.startsWith('100644 blob ') && !entry.startsWith('100755 blob ')) throw Error(`Missing regular file (symlinks/submodules prohibited): ${path}`);
  const hash=entry.split(/\s+/)[2];
  const size=Number(execFileSync('git',['-C',repo,'cat-file','-s',hash],{encoding:'utf8'}));
  if(size>limit) throw Error(`File exceeds limit: ${path}`);
  return execFileSync('git',['-C',repo,'cat-file','blob',hash],{maxBuffer:limit+1});
 };
}
export function renderSnapshot(snapshot:Snapshot) {
 const result=parseProfile(snapshot.manifest); if(!result.project) throw Error(result.errors.join('; '));
 if(snapshot.digest!==digest(JSON.stringify({manifest:snapshot.manifest,files:snapshot.files}))) throw Error('Snapshot digest mismatch.');
 if(result.project.schema==='oic/project/v2') for(const path of referencedFiles(result.project)) if(!snapshot.files[path]) throw Error(`Missing declared file: ${path}`);
 const resolved:Record<string,string>={};
 for(const [path,f] of Object.entries(snapshot.files)) {
  if(digest(f.kind==='text'?f.content:Buffer.from(f.content,'base64'))!==f.digest) throw Error(`Asset digest mismatch: ${path}`);
  resolved[path]=f.kind==='text'?f.content:`/images/projects/${f.digest}.webp`;
 }
 return normalizeProfile(result.project,resolved);
}
