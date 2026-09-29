import validate from './validate-v2.generated.js';
import { parseDocument } from 'yaml';
import { validateProject, type Project } from './catalog';
export type Media = { id: string; type: 'image'; src: string; alt: string; title?: string; caption?: string; credit?: string; rights?: string } | { id: string; type: 'video'; url: string; title: string; poster?: string; transcript?: string };
export type Action = { id: string; type: 'demo'|'download'|'install'|'docs'; url: string; primary: boolean; label?: string; description?: string };
export type Profile = {
 schema: 'oic/project/v2'; id: string; name: string; summary: string; category: Project['category']; tags: string[]; platforms: string[];
 publisher: {name: string; url?: string}; description: {text: string} | {file: string};
 branding?: {logo: {on_light: string; on_dark?: string; alt: string}}; media?: Media[];
 source: {availability: Project['source']; repository?: string}; license: {name: string; url: string; spdx_expression?: string};
 access: {edition: string; cost: 'free'; notes: string; account_required: boolean | 'unknown'};
 requirements: {name: string; kind: 'software'|'hardware'|'service'; cost: 'free'|'paid'|'optional-paid'|'unknown'; notes: string; version?: string; url?: string; applies_to?: string[]}[];
 actions: Action[]; links?: Partial<Record<'homepage'|'docs'|'wiki'|'issues'|'discussions'|'changelog'|'support', string>>;
 faq?: {question: string; answer: string}[]; lifecycle: {stage: 'preview'|'beta'|'stable'; maintenance: 'active'|'maintenance-only'|'archived'};
 release?: {version: string; url: string; date?: string}; visibility: 'listed'|'withdrawn';
};
export type AuthoredProfile = Project | Profile;
export const actionLabel = (a: Action) => a.label || ({demo:'Try the demo',download:'Download',install:'Install',docs:'Read the docs'}[a.type]);
export function parseProfile(text: string): {project?: AuthoredProfile; errors: string[]} {
 if (new TextEncoder().encode(text).length > 65536) return {errors:['Keep project.yaml under 64 KB.']};
 try {
  const doc = parseDocument(text, {uniqueKeys:true, customTags:[]});
  if (doc.errors.length || doc.warnings.length) return {errors:[...doc.errors,...doc.warnings].map(e=>e.message)};
  const value = doc.toJS({maxAliasCount:0});
  if (value?.schema === 'oic/project/v1') return validateProject(value);
  if (!validate(value)) return {errors:(validate.errors || []).map(e=>`${e.instancePath || 'project'} ${e.message}`)};
  const p = value as Profile;
  const errors: string[] = [];
  if(p.actions.filter(a=>a.primary).length!==1) errors.push('Choose exactly one primary action.');
  for (const group of [p.actions,p.media || []]) if(new Set(group.map(a=>a.id)).size!==group.length) errors.push('Action and media IDs must be unique within each section.');
  if(p.source.availability!=='closed-source' && !p.source.repository) errors.push('Public source availability requires a repository URL.');
  for(const r of p.requirements) for(const id of r.applies_to || []) if(!p.actions.some(a=>a.id===id)) errors.push(`Unknown requirement action: ${id}`);
  const inspect = (v: unknown) => {
   if(typeof v === 'string' && v.startsWith('https:')) {try {const u=new URL(v); if(u.protocol!=='https:' || u.username || u.password || !u.hostname) errors.push('Links must use HTTPS without credentials.');} catch {errors.push('Invalid HTTPS URL.');}}
   else if(v && typeof v==='object') Object.values(v).forEach(inspect);
  }; inspect(p);
  for(const path of referencedFiles(p)) if(!path.startsWith('./') || path.split('/').includes('..')) errors.push('Files must stay inside the manifest directory.');
  for(const m of p.media || []) if(m.type==='image' && !/\.(png|jpe?g|webp)$/.test(m.src)) errors.push('Images must be PNG, JPEG or WebP.');
  if('file' in p.description && !p.description.file.endsWith('.md')) errors.push('Description files must be Markdown.');
  return errors.length ? {errors} : {project:p,errors:[]};
 } catch(e) {return {errors:[e instanceof Error ? e.message : 'Invalid YAML']};}
}
export function referencedFiles(p: Profile): string[] {
 return [...new Set([('file' in p.description ? p.description.file : undefined),p.branding?.logo.on_light,p.branding?.logo.on_dark,...(p.media || []).map(m=>m.type==='image'?m.src:m.poster)].filter((x): x is string=>!!x))];
}
// One display model keeps all v1 listings working. Author YAML remains untouched for export.
export function normalizeProfile(p: AuthoredProfile, files: Record<string,string> = {}): Project {
 if(p.schema==='oic/project/v1') return {...p};
 const primary=p.actions.find(a=>a.primary)!;
 const display=structuredClone(p);
 if(display.branding) {display.branding.logo.on_light=files[display.branding.logo.on_light] || ''; if(display.branding.logo.on_dark) display.branding.logo.on_dark=files[display.branding.logo.on_dark] || '';}
 display.media=(display.media || []).flatMap<Media>(m=> m.type==='image' ? (files[m.src]?[{...m,src:files[m.src]}]:[]) : [{...m,poster:m.poster?files[m.poster]:undefined}]);
 return {schema:'oic/project/v1',id:p.id,name:p.name,summary:p.summary,description:'text' in p.description?p.description.text:files[p.description.file] || '',category:p.category,tags:p.tags,platforms:p.platforms,source:p.source.availability,repository:p.source.repository,license:p.license.name,license_url:p.license.url,cost:'free',cost_notes:p.access.notes,software_requirements:p.requirements.some(r=>r.cost==='paid' && (!r.applies_to || r.applies_to.includes(primary.id)))?'paid-platform-required':p.requirements.some(r=>r.kind==='software' && r.cost==='unknown' && (!r.applies_to || r.applies_to.includes(primary.id)))?'see-terms':'no-paid-required',homepage:p.links?.homepage || p.publisher.url || primary.url,get_started:primary.url,documentation:p.links?.docs,maintainer:p.publisher.name,profile:display,authored:p};
}
