import {useMemo, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type Entry = {
  title: string;
  description: string;
  tags: string[];
  category: string;
  permalink: string;
  thumbnail: string | null;
  figma: string | null;
  author: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  prompts: 'Prompts',
  skills: 'Skills',
  workflows: 'Workflows',
};

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Hero() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden />
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.heroActions}>
          <Link className={clsx('button button--primary button--lg', styles.cta)} to="/docs/prompts">
            Browse the library
          </Link>
          <Link
            className={clsx('button button--secondary button--lg', styles.ctaGhost)}
            to="/docs/contributing">
            Share an experiment →
          </Link>
        </div>
      </div>
    </header>
  );
}

function Card({entry}: {entry: Entry}) {
  return (
    <Link to={entry.permalink} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={clsx(styles.badge, styles[`badge_${entry.category}`])}>
          {CATEGORY_LABELS[entry.category] ?? titleCase(entry.category)}
        </span>
        {entry.figma && <span className={styles.figmaDot} title="Has a Figma link" />}
      </div>
      <Heading as="h3" className={styles.cardTitle}>
        {entry.title}
      </Heading>
      {entry.description && <p className={styles.cardDesc}>{entry.description}</p>}
      {entry.tags.length > 0 && (
        <div className={styles.cardTags}>
          {entry.tags.slice(0, 4).map((t) => (
            <span key={t} className={styles.chip}>
              {t}
            </span>
          ))}
        </div>
      )}
      {entry.author && <div className={styles.cardAuthor}>by {entry.author}</div>}
    </Link>
  );
}

function Gallery() {
  const data = usePluginData('knowledge-index') as {entries?: Entry[]} | undefined;
  const entries = data?.entries ?? [];

  const [category, setCategory] = useState<string>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const categories = useMemo(
    () => Array.from(new Set(entries.map((e) => e.category))).sort(),
    [entries],
  );
  const allTags = useMemo(
    () => Array.from(new Set(entries.flatMap((e) => e.tags))).sort(),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== 'all' && e.category !== category) return false;
      if (activeTags.length && !activeTags.every((t) => e.tags.includes(t))) return false;
      if (q && !(`${e.title} ${e.description}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [entries, category, activeTags, query]);

  const toggleTag = (t: string) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  if (!entries.length) {
    return (
      <div className={clsx('container', styles.empty)}>
        <p>No entries yet — be the first to <Link to="/docs/contributing">share an experiment</Link>.</p>
      </div>
    );
  }

  return (
    <section className={clsx('container', styles.gallery)}>
      <div className={styles.controls}>
        <input
          className={styles.search}
          type="search"
          placeholder="Filter by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter entries by name"
        />
        <div className={styles.filterRow}>
          <button
            className={clsx(styles.filterBtn, category === 'all' && styles.filterBtnActive)}
            onClick={() => setCategory('all')}>
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={clsx(styles.filterBtn, category === c && styles.filterBtnActive)}
              onClick={() => setCategory(c)}>
              {CATEGORY_LABELS[c] ?? titleCase(c)}
            </button>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className={styles.tagRow}>
            {allTags.map((t) => (
              <button
                key={t}
                className={clsx(styles.tagBtn, activeTags.includes(t) && styles.tagBtnActive)}
                onClick={() => toggleTag(t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
      </div>

      <div className={styles.grid}>
        {filtered.map((e) => (
          <Card key={entry_key(e)} entry={e} />
        ))}
      </div>
    </section>
  );
}

function entry_key(e: Entry): string {
  return e.permalink;
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Browse" description={siteConfig.tagline}>
      <Hero />
      <main>
        <Gallery />
      </main>
    </Layout>
  );
}
