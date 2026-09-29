import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createSnapshot,localReader,renderSnapshot,type ReadBlob,type Snapshot} from './profile-snapshot.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const [command,id,...args]=process.argv.slice(2);
const option=(name:string)=>args[args.indexOf(name)+1];
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || '')) throw Error('Provide a valid listing ID.');
const candidate=resolve(root,`content/candidates/${id}.json`);
if(command==='fetch') {
 let commit:string; let read:ReadBlob;
 const path=args.includes('--path')?option('--path'):'.oic/project.yaml';
 if(args.includes('--local')) {
  const repo=option('--local'); commit=execFileSync('git',['-C',repo,'rev-parse',args.includes('--ref')?option('--ref'):'HEAD'],{encoding:'utf8'}).trim(); read=localReader(repo,commit);
 } else {
  const registrations=JSON.parse(await readFile(resolve(root,'content/sources.json'),'utf8'));
  const source=registrations[id]; if(!source) throw Error('Source must first be registered by an OIC reviewer.');
  const api=(endpoint:string)=>JSON.parse(execFileSync('gh',['api',endpoint],{encoding:'utf8',maxBuffer:4*1024*1024,timeout:30000}));
  const repo=api(`repositories/${source.repository_id}`);
  if(repo.full_name!==source.repository) throw Error('Repository moved or renamed; controller must be reviewed again.');
  if(repo.private) throw Error('Use a public listing-only repository for private projects.');
  commit=api(`repos/${repo.full_name}/commits/${encodeURIComponent(source.ref)}`).sha;
  const tree=api(`repos/${repo.full_name}/git/trees/${commit}?recursive=1`);
  if(tree.truncated) throw Error('Repository tree too large; use a listing-only repository.');
  read=async(name,limit)=> {
   const entry=tree.tree.find((f:{path:string})=>f.path===name);
   if(!entry || entry.type!=='blob' || !['100644','100755'].includes(entry.mode) || entry.size>limit) throw Error(`Invalid or oversized regular file: ${name}`);
   const blob=api(`repos/${repo.full_name}/git/blobs/${entry.sha}`); const buffer=Buffer.from(blob.content,'base64');
   if(buffer.length>limit) throw Error('Blob exceeds limit'); return buffer;
  };
  if(path!==source.path) throw Error(`Use the registered --path ${source.path}`);
 }
 const snapshot=await createSnapshot(commit,path,read); const p=renderSnapshot(snapshot); if(p.id!==id) throw Error('Source cannot change listing ID.');
 await mkdir(resolve(root,'content/candidates'),{recursive:true}); await writeFile(candidate,JSON.stringify(snapshot,null,2)+'\n');
 console.log(`Candidate ${id}\nCommit ${commit}\nDigest ${snapshot.digest}\nReview the manifest and assets before approval. Nothing published.`);
} else if(command==='approve') {
 const snapshot:Snapshot=JSON.parse(await readFile(candidate,'utf8')); renderSnapshot(snapshot);
 if(!args.includes('--digest') || option('--digest')!==snapshot.digest) throw Error('Approval must name the exact reviewed --digest.');
 const destination=resolve(root,`content/snapshots/${id}.json`);
 await mkdir(resolve(root,'content/snapshots'),{recursive:true});
 await writeFile(destination+'.tmp',JSON.stringify(snapshot,null,2)+'\n'); await rename(destination+'.tmp',destination);
 await writeFile(resolve(root,`content/projects/${id}.yaml`),snapshot.manifest);
 console.log(`Approved ${id} at ${snapshot.commit}. Run check, commit and deploy to publish.`);
} else throw Error('Usage: sync-profile.ts fetch ID [--local REPO] [--path .oic/project.yaml] | approve ID --digest SHA256');
