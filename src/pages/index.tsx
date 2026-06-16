import {useMemo, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';
import useBaseUrl from '@docusaurus/useBaseUrl';
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

const CATEGORY_ORDER = ['prompts', 'skills', 'directives', 'projects', 'workflows', 'other'];
const CATEGORY_LABELS: Record<string, string> = {
  prompts: 'Prompts',
  skills: 'Skills',
  directives: 'Directives',
  projects: 'Projects',
  workflows: 'Workflows',
  other: 'Other',
};

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* Monochrome line icons, Linear-style. */
function CategoryIcon({category}: {category: string}) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (category === 'prompts') {
    return (
      <svg {...common}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (category === 'skills') {
    return (
      <svg {...common}>
        <path d="M12 3l1.9 4.8L19 9.5l-4.1 3.3L16 18l-4-2.7L8 18l1.1-5.2L5 9.5l5.1-1.7z" />
      </svg>
    );
  }
  if (category === 'workflows') {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="6" height="6" rx="1.5" />
        <rect x="15" y="14" width="6" height="6" rx="1.5" />
        <path d="M9 7h4a2 2 0 0 1 2 2v8" />
      </svg>
    );
  }
  if (category === 'directives') {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6z" />
        <path d="m9 11 2 2 4-4" />
      </svg>
    );
  }
  if (category === 'projects') {
    return (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function Hero() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden />
      <div className={clsx('container', styles.heroInner)}>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.heroActions}>
          <Link className={styles.ctaPrimary} to="/docs/contributing">
            Share an experiment
          </Link>
          <Link className={styles.ctaGhost} to="/docs/prompts">
            Browse the library →
          </Link>
        </div>
      </div>
    </header>
  );
}

function Card({entry}: {entry: Entry}) {
  const thumb = useBaseUrl(entry.thumbnail ?? '');
  return (
    <Link to={entry.permalink} className={clsx(styles.card, entry.thumbnail && styles.cardHasBanner)}>
      {entry.thumbnail ? (
        <div className={styles.cardBanner} style={{backgroundImage: `url(${thumb})`}} />
      ) : (
        <div className={styles.cardIcon}>
          <CategoryIcon category={entry.category} />
        </div>
      )}
      <div className={styles.cardBody}>
        <Heading as="h3" className={styles.cardTitle}>
          {entry.title}
        </Heading>
        {entry.description && <p className={styles.cardDesc}>{entry.description}</p>}
        {entry.tags.length > 0 && (
          <div className={styles.cardTags}>
            {entry.tags.slice(0, 3).map((t) => (
              <span key={t} className={styles.chip}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function Section({label, entries}: {label: string; entries: Entry[]}) {
  if (!entries.length) return null;
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <Heading as="h2" className={styles.sectionTitle}>
          {label}
        </Heading>
        <span className={styles.sectionCount}>{entries.length}</span>
      </div>
      <div className={styles.grid}>
        {entries.map((e) => (
          <Card key={e.permalink} entry={e} />
        ))}
      </div>
    </section>
  );
}

function Catalog() {
  const data = usePluginData('knowledge-index') as {entries?: Entry[]} | undefined;
  const entries = data?.entries ?? [];

  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const allTags = useMemo(
    () => Array.from(new Set(entries.flatMap((e) => e.tags))).sort(),
    [entries],
  );
  const categories = useMemo(() => {
    const present = Array.from(new Set(entries.map((e) => e.category)));
    return [
      ...CATEGORY_ORDER.filter((c) => present.includes(c)),
      ...present.filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
    ];
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (activeTags.length && !activeTags.every((t) => e.tags.includes(t))) return false;
      if (q && !`${e.title} ${e.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, activeTags, query]);

  const isFiltering = query.trim().length > 0 || activeTags.length > 0;

  const toggleTag = (t: string) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  if (!entries.length) {
    return (
      <div className={clsx('container', styles.empty)}>
        <p>
          No entries yet — be the first to{' '}
          <Link to="/docs/contributing">share an experiment</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('container', styles.catalog)}>
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className={styles.search}
            type="search"
            placeholder="Search the library…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the library"
          />
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

      {isFiltering ? (
        <Section label={`${filtered.length} result${filtered.length === 1 ? '' : 's'}`} entries={filtered} />
      ) : (
        categories.map((c) => (
          <Section
            key={c}
            label={CATEGORY_LABELS[c] ?? titleCase(c)}
            entries={filtered.filter((e) => e.category === c)}
          />
        ))
      )}
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Browse" description={siteConfig.tagline}>
      <Hero />
      <main>
        <Catalog />
      </main>
    </Layout>
  );
}
