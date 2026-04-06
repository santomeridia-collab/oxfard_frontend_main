import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AcademyHeader from '../components/AcademyHeader';
import AcademyHero from '../components/AcademyHero';
import Footer from '../components/Footer';
import '../styles/academy.css';
import { useShopData } from '../context/AcademyContext';

const FALLBACK_BLOG_POSTS = [
  {
    id: 1,
    title: 'How to Choose the Right Course for Your Career',
    category: 'Career Guidance',
    date: 'Feb 12, 2026',
    readTime: '7 min read',
    excerpt:
      'Learn a practical framework to evaluate courses based on your current skills, long‑term goals, and the job market.',
  },
  {
    id: 2,
    title: 'Modern Web Development Skills You Should Master',
    category: 'Web Development',
    date: 'Jan 28, 2026',
    readTime: '6 min read',
    excerpt:
      'From React and TypeScript to deployment pipelines, discover the core skills that make you job‑ready as a web developer.',
  },
  {
    id: 3,
    title: 'Balancing Work, Study, and Life Effectively',
    category: 'Productivity',
    date: 'Jan 10, 2026',
    readTime: '5 min read',
    excerpt:
      'Simple routines and tactics our top learners use to stay consistent without burning out.',
  },
];

/** Normalize a blog item from API (get-all-data) to a consistent shape for the UI */
function normalizeBlogItem(item, index) {
  if (!item || typeof item !== 'object') return null;
  const id = item.id ?? item.blog_id ?? index + 1;
  const title = item.title ?? item.name ?? 'Untitled';
  const rawContent = item.content ?? item.body ?? item.description ?? item.excerpt ?? '';
  const excerpt = item.excerpt ?? item.description ?? (typeof rawContent === 'string' ? rawContent.slice(0, 200) + (rawContent.length > 200 ? '…' : '') : '');
  const date = item.date ?? item.created_at ?? item.published_at ?? item.updated_at ?? '';
  const dateStr = typeof date === 'string' ? date : (date && typeof date === 'object' && date.toString ? date.toString() : '');
  return {
    id,
    title,
    category: item.category ?? item.category_name ?? item.tag ?? '',
    date: dateStr,
    readTime: item.read_time ?? item.readTime ?? '',
    excerpt: typeof excerpt === 'string' ? excerpt : String(excerpt || ''),
    content: typeof rawContent === 'string' ? rawContent : String(rawContent || ''),
  };
}

export default function AcademyBlog() {
  const { allData, loading } = useShopData();

  // Blog list from get-all-data API: support blogs, blog_posts, or blog
  const blogPosts = useMemo(() => {
    const raw = allData?.blogs ?? allData?.blog_posts ?? allData?.blog;
    const list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && raw.items ? raw.items : []);
    if (list.length === 0) return FALLBACK_BLOG_POSTS;
    return list.map((item, i) => normalizeBlogItem(item, i)).filter(Boolean);
  }, [allData]);

  const homeMedia = useMemo(() => {
    if (!allData?.home_media || allData.home_media.length === 0) return null;
    const academyShopType = allData?.shop_details?.shop_type?.find((t) =>
      t.slug === 'academy' || t.name?.toLowerCase() === 'academy'
    );
    const matched = allData.home_media.find(m =>
      m.shop_type_id === academyShopType?.shop_type_id
    );
    return matched || allData.home_media[0];
  }, [allData]);

  return (
    <>
      <div className="academy-page">
        <AcademyHeader />

        <AcademyHero
          title="Our Blog"
          subtitle="Insights, tips, and stories to help you learn faster and grow your career."
          media={homeMedia}
          showCTA={false}
        />

        <section className="academy-courses-section">
          <div className="academy-container">
            <div className="academy-section-header">
              <h2 className="academy-section-title">Latest Articles</h2>
            </div>

            {loading ? (
              <div className="academy-section-header" style={{ padding: '2rem 0' }}>
                <p>Loading blog posts…</p>
              </div>
            ) : (
              <div className="academy-grid">
                {blogPosts.map((post) => (
                  <article key={post.id} className="academy-course-card">
                    <Link to={`/academy/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="academy-course-card__body">
                        <div className="academy-course-card__meta">
                          {post.category && <span className="academy-course-card__meta-item">{post.category}</span>}
                          {post.date && <span className="academy-course-card__meta-item">{post.date}</span>}
                          {post.readTime && <span className="academy-course-card__meta-item">{post.readTime}</span>}
                        </div>
                        <h3 className="academy-course-card__title">{post.title}</h3>
                        <p className="academy-course-card__desc">{post.excerpt}</p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

