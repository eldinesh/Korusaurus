// Turns a parsed GitHub Issue Form submission into a Knowledge Hub entry.
//
// Reads JSON (keyed by issue-form field id) from $ISSUE_JSON, downloads any
// uploaded images/files into static/img/<slug>/ (never hotlinks GitHub's CDN),
// and writes docs/<category>/<slug>.md with valid frontmatter.
//
// Run by .github/workflows/experiment-to-page.yml after github-issue-parser.

import fs from 'node:fs';
import path from 'node:path';

// ── Inputs ──────────────────────────────────────────────────────────────────
const issue = JSON.parse(process.env.ISSUE_JSON || '{}');
const issueNumber = process.env.ISSUE_NUMBER || '0';
const author = process.env.ISSUE_USER || 'community';
const token = process.env.GITHUB_TOKEN || '';
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
const repoSlug = process.env.GITHUB_REPOSITORY || '';
const issueUrl = repoSlug ? `${serverUrl}/${repoSlug}/issues/${issueNumber}` : '';

// The ONLY tags allowed — must match docs/tags.yml (onInlineTags:'throw' will
// fail the build on anything else, so we drop unknown tags defensively here).
const KNOWN_TAGS = new Set([
  'claude', 'gpt', 'gemini', 'model-agnostic',
  'discovery', 'research', 'ideation', 'wireframing', 'content', 'testing', 'handoff',
  'designer', 'researcher', 'pm', 'writer',
  'beginner', 'intermediate', 'advanced',
]);

const CATEGORY_FOLDER = {prompt: 'prompts', skill: 'skills', workflow: 'workflows'};

const CONTENT_TYPE_EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif',
  'image/webp': 'webp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf',
  'text/plain': 'txt', 'text/markdown': 'md', 'application/json': 'json',
  'application/zip': 'zip',
};
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

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
    .slice(0, 60) || `experiment-${issueNumber}`;

const MEDIA_RE =
  /https?:\/\/(?:[a-z0-9-]+\.)*githubusercontent\.com\/[^\s)"'>]+|https?:\/\/github\.com\/user-attachments\/[^\s)"'>]+/gi;

async function downloadMedia(text, slug, counter) {
  // Returns { text: rewritten, files: [{rel, isImage}] }
  const urls = [...new Set((text.match(MEDIA_RE) || []))];
  const files = [];
  let rewritten = text;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: token ? {Authorization: `Bearer ${token}`} : {},
        redirect: 'follow',
      });
      if (!res.ok) {
        console.warn(`! skip ${url} (HTTP ${res.status})`);
        continue;
      }
      const ct = (res.headers.get('content-type') || '').split(';')[0].trim();
      const ext = CONTENT_TYPE_EXT[ct] || (path.extname(new URL(url).pathname).slice(1)) || 'bin';
      const name = `media-${counter.n++}.${ext}`;
      const dir = path.join('static', 'img', slug);
      fs.mkdirSync(dir, {recursive: true});
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(path.join(dir, name), buf);

      const rel = `/img/${slug}/${name}`;
      rewritten = rewritten.split(url).join(rel);
      files.push({rel, isImage: IMAGE_EXT.has(ext)});
      console.log(`✓ saved ${rel} (${buf.length} bytes)`);
    } catch (err) {
      console.warn(`! failed ${url}: ${err.message}`);
    }
  }
  return {text: rewritten, files};
}

// ── Build the entry ─────────────────────────────────────────────────────────
const title = clean(issue.title) || `Experiment ${issueNumber}`;
const summary = clean(issue.summary);
const categoryRaw = clean(issue.category).toLowerCase();
const folder = CATEGORY_FOLDER[categoryRaw] || 'prompts';
const figma = clean(issue.figma_url);
const links = clean(issue.links);

const tags = clean(issue.tags)
  .split(/[,\n]/)
  .map((t) => t.trim().toLowerCase())
  .filter((t) => KNOWN_TAGS.has(t));

const slug = slugify(title);
const counter = {n: 1};

const desc = await downloadMedia(clean(issue.description), slug, counter);
const att = await downloadMedia(clean(issue.attachments), slug, counter);

// ── Compose markdown ────────────────────────────────────────────────────────
const fm = ['---'];
fm.push(`title: ${JSON.stringify(title)}`);
if (summary) fm.push(`description: ${JSON.stringify(summary)}`);
fm.push(`tags: ${JSON.stringify(tags)}`);
fm.push('sidebar_custom_props:');
fm.push(`  category: ${folder}`);
fm.push(`  author: ${JSON.stringify(author)}`);
if (figma) fm.push(`  figma: ${JSON.stringify(figma)}`);
fm.push('---', '');

let body = `# ${title}\n\n`;
if (desc.text) body += `${desc.text}\n\n`;

if (att.files.length) {
  body += `## Attachments\n\n`;
  for (const f of att.files) {
    body += f.isImage ? `![](${f.rel})\n\n` : `[${path.basename(f.rel)}](${f.rel})\n\n`;
  }
}

if (figma || links) {
  body += `## Links\n\n`;
  if (figma) body += `- [Figma](${figma})\n`;
  if (links) body += `- ${links}\n`;
  body += `\n`;
}

const credit = issueUrl
  ? `*Submitted via [issue #${issueNumber}](${issueUrl}) by @${author}.*`
  : `*Submitted via issue #${issueNumber} by @${author}.*`;
body += `---\n\n${credit}\n`;

// ── Write (avoid clobbering an existing slug) ─────────────────────────────────
const dir = path.join('docs', folder);
fs.mkdirSync(dir, {recursive: true});
let file = path.join(dir, `${slug}.md`);
if (fs.existsSync(file)) file = path.join(dir, `${slug}-${issueNumber}.md`);
fs.writeFileSync(file, fm.join('\n') + body);

console.log(`\nWrote ${file}`);
console.log(`::notice::Created ${file} (category: ${folder}, tags: ${tags.join(', ') || 'none'})`);
