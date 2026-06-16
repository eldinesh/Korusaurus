// Turns a parsed GitHub Issue Form submission into a Knowledge Hub entry.
//
// Reads JSON (keyed by issue-form field id) from $ISSUE_JSON, then:
//   • maps Type of Resource → docs/<category>/
//   • localizes images embedded in the description into static/img/<slug>/
//   • saves a banner image into static/img/<slug>/ and sets it as the card thumbnail
//   • saves one-or-more file attachments into static/resource-files/<slug>/ as downloads
//   • writes docs/<category>/<slug>.md with valid frontmatter
//
// Run by .github/workflows/experiment-to-page.yml after github-issue-parser.

import fs from 'node:fs';
import path from 'node:path';

// ── Inputs ──────────────────────────────────────────────────────────────────
const issue = JSON.parse(process.env.ISSUE_JSON || '{}');
const issueNumber = process.env.ISSUE_NUMBER || '0';
const submitter = process.env.ISSUE_USER || 'community';
const token = process.env.GITHUB_TOKEN || '';
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
const repoSlug = process.env.GITHUB_REPOSITORY || '';
const issueUrl = repoSlug ? `${serverUrl}/${repoSlug}/issues/${issueNumber}` : '';

// Type of Resource → docs folder (category).
const TYPE_FOLDER = {
  skill: 'skills',
  prompt: 'prompts',
  directive: 'directives',
  project: 'projects',
  workflow: 'workflows',
  other: 'other',
};

// The ONLY tags allowed — must match docs/tags.yml (onInlineTags:'throw' fails the
// build on anything else, so we drop unknown tags defensively here).
const KNOWN_TAGS = new Set([
  'claude', 'gpt', 'gemini', 'model-agnostic',
  'custom-instructions', 'critical-thinking', 'productivity', 'voice-tone',
  'discovery', 'research', 'ideation', 'wireframing', 'content', 'testing', 'handoff',
  'designer', 'researcher', 'pm', 'writer',
  'beginner', 'intermediate', 'advanced',
]);

const CONTENT_TYPE_EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif',
  'image/webp': 'webp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf',
  'text/plain': 'txt', 'text/markdown': 'md', 'application/json': 'json',
  'application/zip': 'zip', 'application/octet-stream': 'bin',
};
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

const MEDIA_RE =
  /https?:\/\/(?:[a-z0-9-]+\.)*githubusercontent\.com\/[^\s)"'>]+|https?:\/\/github\.com\/user-attachments\/[^\s)"'>]+/gi;

// ── Helpers ─────────────────────────────────────────────────────────────────
const clean = (v) => {
  const s = (v ?? '').toString().trim();
  return s === '_No response_' ? '' : s;
};

const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || `resource-${issueNumber}`;

async function fetchBytes(url) {
  const res = await fetch(url, {
    headers: token ? {Authorization: `Bearer ${token}`} : {},
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = (res.headers.get('content-type') || '').split(';')[0].trim();
  const ext = CONTENT_TYPE_EXT[ct] || path.extname(new URL(url).pathname).slice(1) || 'bin';
  return {bytes: Buffer.from(await res.arrayBuffer()), ext};
}

// File attachments → committed into static/resource-files/<slug>/ as downloads.
async function saveAttachments(text, slug) {
  const urls = [...new Set(text.match(MEDIA_RE) || [])];
  const dir = path.join('static', 'resource-files', slug);
  const files = [];
  let i = 1;
  for (const url of urls) {
    try {
      const {bytes, ext} = await fetchBytes(url);
      // Prefer the real filename when GitHub exposes it (file attachments do).
      const urlName = path.basename(new URL(url).pathname);
      const name = /\.[a-z0-9]{1,6}$/i.test(urlName) ? urlName : `file-${i}.${ext}`;
      fs.mkdirSync(dir, {recursive: true});
      fs.writeFileSync(path.join(dir, name), bytes);
      files.push({rel: `/resource-files/${slug}/${name}`, name, isImage: IMAGE_EXT.has(ext)});
      console.log(`✓ attachment ${name} (${bytes.length} bytes)`);
      i++;
    } catch (err) {
      console.warn(`! attachment ${url}: ${err.message}`);
    }
  }
  return files;
}

// Banner → committed into static/img/<slug>/ and used as the card thumbnail.
async function saveBanner(text, slug) {
  const url = (text.match(MEDIA_RE) || [])[0];
  if (!url) return null;
  try {
    const {bytes, ext} = await fetchBytes(url);
    if (!IMAGE_EXT.has(ext)) return null;
    const dir = path.join('static', 'img', slug);
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(path.join(dir, `banner.${ext}`), bytes);
    console.log(`✓ banner banner.${ext} (${bytes.length} bytes)`);
    return `/img/${slug}/banner.${ext}`;
  } catch (err) {
    console.warn(`! banner ${url}: ${err.message}`);
    return null;
  }
}

// Images embedded in the description → localized and rewritten inline.
async function localizeInline(text, slug) {
  const urls = [...new Set(text.match(MEDIA_RE) || [])];
  const dir = path.join('static', 'img', slug);
  let out = text;
  let i = 1;
  for (const url of urls) {
    try {
      const {bytes, ext} = await fetchBytes(url);
      const name = `inline-${i}.${ext}`;
      fs.mkdirSync(dir, {recursive: true});
      fs.writeFileSync(path.join(dir, name), bytes);
      out = out.split(url).join(`/img/${slug}/${name}`);
      i++;
    } catch (err) {
      console.warn(`! inline ${url}: ${err.message}`);
    }
  }
  return out;
}

// ── Build the entry ─────────────────────────────────────────────────────────
const title = clean(issue.title) || `Resource ${issueNumber}`;
const summary = clean(issue.summary);
const typeRaw = clean(issue.type).toLowerCase();
const folder = TYPE_FOLDER[typeRaw] || 'other';
const author = clean(issue.made_by) || `@${submitter}`;
const figma = clean(issue.figma_url);
const links = clean(issue.links);

const tags = clean(issue.tags)
  .split(/[,\n]/)
  .map((t) => t.trim().toLowerCase())
  .filter((t) => KNOWN_TAGS.has(t));

const slug = slugify(title);

const banner = await saveBanner(clean(issue.banner), slug);
const downloads = await saveAttachments(clean(issue.attachments), slug);
const body = await localizeInline(clean(issue.description), slug);

// ── Compose markdown ────────────────────────────────────────────────────────
const fm = ['---'];
fm.push(`title: ${JSON.stringify(title)}`);
if (summary) fm.push(`description: ${JSON.stringify(summary)}`);
fm.push(`tags: ${JSON.stringify(tags)}`);
fm.push('sidebar_custom_props:');
fm.push(`  category: ${folder}`);
fm.push(`  author: ${JSON.stringify(author)}`);
if (banner) fm.push(`  thumbnail: ${JSON.stringify(banner)}`);
if (figma) fm.push(`  figma: ${JSON.stringify(figma)}`);
fm.push('---', '');

let md = `# ${title}\n\n`;
if (body) md += `${body}\n\n`;

if (downloads.length) {
  md += `## Download\n\n`;
  for (const f of downloads) {
    md += `[⬇ ${f.name}](pathname://${f.rel})\n\n`;
  }
}

if (figma || links) {
  md += `## Links\n\n`;
  if (figma) md += `- [Figma](${figma})\n`;
  if (links) md += `- ${links}\n`;
  md += `\n`;
}

const credit = issueUrl
  ? `*Shared by ${author} · [issue #${issueNumber}](${issueUrl}).*`
  : `*Shared by ${author} · issue #${issueNumber}.*`;
md += `---\n\n${credit}\n`;

// ── Write (avoid clobbering an existing slug) ─────────────────────────────────
const dir = path.join('docs', folder);
fs.mkdirSync(dir, {recursive: true});
let file = path.join(dir, `${slug}.md`);
if (fs.existsSync(file)) file = path.join(dir, `${slug}-${issueNumber}.md`);
fs.writeFileSync(file, fm.join('\n') + md);

console.log(`\nWrote ${file}`);
console.log(`::notice::Created ${file} (type: ${folder}, by: ${author}, tags: ${tags.join(', ') || 'none'}, downloads: ${downloads.length})`);
