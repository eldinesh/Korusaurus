const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * knowledge-index
 * ---------------
 * Scans docs/ at build time, reads each entry's frontmatter, and exposes a
 * compact index as global data. The homepage gallery reads this via
 * `usePluginData('knowledge-index')` to render filterable cards — no client-side
 * file parsing, no coupling to docs-plugin internals.
 *
 * Convention: docs/<category>/<slug>.md  →  route /docs/<category>/<slug>
 */
function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.mdx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

module.exports = function knowledgeIndexPlugin(context) {
  const docsDir = path.join(context.siteDir, 'docs');

  return {
    name: 'knowledge-index',

    async loadContent() {
      if (!fs.existsSync(docsDir)) return {entries: []};

      const entries = [];
      for (const file of walk(docsDir)) {
        const rel = path.relative(docsDir, file).replace(/\\/g, '/');
        const routeId = rel.replace(/\.mdx?$/, '');
        // Skip a top-level "contributing" / category-index style pages.
        if (!routeId.includes('/')) continue;

        const {data} = matter(fs.readFileSync(file, 'utf8'));
        if (data.draft === true) continue;

        const props = data.sidebar_custom_props || {};
        const category = props.category || rel.split('/')[0];

        entries.push({
          title: data.title || routeId,
          description: data.description || '',
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          category,
          permalink: '/docs/' + routeId, // <Link> prepends baseUrl automatically
          thumbnail: props.thumbnail || null,
          figma: props.figma || null,
          author: props.author || null,
        });
      }

      entries.sort((a, b) => a.title.localeCompare(b.title));
      return {entries};
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
