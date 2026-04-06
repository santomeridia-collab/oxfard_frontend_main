import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import AcademyHeader from '../components/AcademyHeader';
import Footer from '../components/Footer';
import '../styles/academy.css';
import { useShopData } from '../context/AcademyContext';

/** Format ISO or raw date string to readable e.g. "Mar 9, 2026" */
function formatDisplayDate(value) {
  if (!value) return '';
  const str = typeof value === 'string' ? value : String(value);
  try {
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return str;
  }
}

const FALLBACK_NEWS = [
  {
    id: 1,
    title: 'New Batch Starting for Full‑Stack Web Development',
    tag: 'Admissions Open',
    date: 'Mar 05, 2026',
    highlight: 'Evening & weekend batches now available with limited seats.',
  },
  {
    id: 2,
    title: 'Academy Partners with Leading IT Companies',
    tag: 'Placement',
    date: 'Feb 20, 2026',
    highlight: 'Expanded placement support and industry‑led mock interviews for all graduating learners.',
  },
  {
    id: 3,
    title: 'Scholarship Program Announced for Top Performers',
    tag: 'Scholarship',
    date: 'Feb 01, 2026',
    highlight: 'Merit‑based scholarships available for select technology and data programs.',
  },
];

const FALLBACK_BLOG = [
  { id: 1, title: 'How to Choose the Right Course for Your Career', category: 'Career Guidance', date: 'Feb 12, 2026', readTime: '7 min read', excerpt: 'Learn a practical framework to evaluate courses based on your current skills, long‑term goals, and the job market.', image: null, author: '' },
  { id: 2, title: 'Modern Web Development Skills You Should Master', category: 'Web Development', date: 'Jan 28, 2026', readTime: '6 min read', excerpt: 'From React and TypeScript to deployment pipelines, discover the core skills that make you job‑ready as a web developer.', image: null, author: '' },
  { id: 3, title: 'Balancing Work, Study, and Life Effectively', category: 'Productivity', date: 'Jan 10, 2026', readTime: '5 min read', excerpt: 'Simple routines and tactics our top learners use to stay consistent without burning out.', image: null, author: '' },
];

function normalizeNewsItem(item, index) {
  if (!item || typeof item !== 'object') return null;
  const id = item.id ?? item.news_id ?? index + 1;
  const rawDate = item.date ?? item.created_at ?? item.published_at ?? item.published_date ?? '';
  return {
    id,
    title: item.title ?? item.name ?? 'Untitled',
    tag: item.tag ?? item.category ?? item.category_name ?? item.source ?? '',
    date: formatDisplayDate(rawDate) || rawDate,
    highlight: item.highlight ?? item.excerpt ?? item.summary ?? item.description ?? (item.content ? String(item.content).slice(0, 200) + '…' : ''),
    image: item.image || null,
  };
}

function normalizeBlogItem(item, index) {
  if (!item || typeof item !== 'object') return null;
  const id = item.id ?? item.blog_id ?? index + 1;
  const title = item.title ?? item.name ?? 'Untitled';
  const rawContent = item.content ?? item.body ?? item.description ?? item.excerpt ?? '';
  const excerptStr = item.excerpt ?? item.description ?? (typeof rawContent === 'string' ? rawContent.slice(0, 200) + (rawContent.length > 200 ? '…' : '') : '');
  const rawDate = item.date ?? item.created_at ?? item.published_at ?? item.updated_at ?? '';
  return {
    id,
    title,
    content: typeof rawContent === 'string' ? rawContent : String(rawContent || ''),
    excerpt: typeof excerptStr === 'string' ? excerptStr : String(excerptStr || ''),
    image: item.image || null,
    author: item.author || '',
    category: item.category ?? item.category_name ?? item.tag ?? '',
    date: formatDisplayDate(rawDate) || (typeof rawDate === 'string' ? rawDate : ''),
    readTime: item.read_time ?? item.readTime ?? '',
  };
}

export default function AcademyNews() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const { allData, loading } = useShopData();
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'blog' ? 'blog' : 'news');
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (!swiperInstance) return;
    if (tabFromUrl === 'blog') swiperInstance.slideTo(1);
    else if (tabFromUrl === 'news') swiperInstance.slideTo(0);
  }, [tabFromUrl, swiperInstance]);

  const newsItems = useMemo(() => {
    const raw = allData?.news ?? allData?.news_items ?? allData?.news_posts;
    const list = Array.isArray(raw) ? raw : (raw?.items ? raw.items : []);
    if (list.length === 0) return FALLBACK_NEWS;
    return list.map((item, i) => normalizeNewsItem(item, i)).filter(Boolean);
  }, [allData]);

  const blogPosts = useMemo(() => {
    const raw = allData?.blogs ?? allData?.blog_posts ?? allData?.blog;
    const list = Array.isArray(raw) ? raw : (raw?.items ? raw.items : []);
    if (list.length === 0) return FALLBACK_BLOG;
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (swiperInstance) swiperInstance.slideTo(tab === 'news' ? 0 : 1);
  };

  const videoUrl = homeMedia?.video_link;
  const imageUrls = [homeMedia?.image_1, homeMedia?.image_2, homeMedia?.image_3].filter(Boolean);
  const shopName = allData?.shop_details?.shopname || 'Academy';

  return (
    <>
      <Helmet>
        <title>News & Blog | {shopName}</title>
        <meta name="description" content="Stay updated with academy announcements, new batches, partnerships, and the latest articles and blog posts." />
      </Helmet>
      <div className="academy-page">
        <AcademyHeader />

        {/* News/Blog Hero with tabs */}
        <header className="academy-hero academy-hero--news-blog">
          <div className="academy-hero__background">
            {videoUrl ? (
              <video className="academy-hero__video" src={videoUrl} autoPlay muted loop playsInline />
            ) : imageUrls.length > 1 ? (
              <Swiper modules={[EffectFade]} effect="fade" loop className="academy-hero__slider">
                {imageUrls.map((url, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="academy-hero__slide-image" style={{ backgroundImage: `url(${url})` }} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : imageUrls.length === 1 ? (
              <div className="academy-hero__static-image" style={{ backgroundImage: `url(${imageUrls[0]})` }} />
            ) : null}
            <div className="academy-hero__overlay" />
          </div>
          <div className="academy-hero__inner">
            <h1 className="academy-hero__title">News & Blog</h1>
            <p className="academy-hero__subtitle">
              Stay updated with announcements, new batches, partnerships, and the latest articles.
            </p>
            <div className="academy-news-blog-tabs">
              <button
                type="button"
                className={`academy-news-blog-tab ${activeTab === 'news' ? 'active' : ''}`}
                onClick={() => handleTabClick('news')}
              >
                News
              </button>
              <button
                type="button"
                className={`academy-news-blog-tab ${activeTab === 'blog' ? 'active' : ''}`}
                onClick={() => handleTabClick('blog')}
              >
                Blog
              </button>
            </div>
          </div>
        </header>

        {/* Single content area: swipe/slide between News and Blog */}
        <section className="academy-courses-section academy-news-blog-content">
          <div className="academy-container academy-news-blog-swiper-wrap">
            {loading ? (
              <div className="academy-news-blog-loading">Loading…</div>
            ) : (
              <Swiper
                speed={350}
                allowTouchMove={true}
                resistanceRatio={0.85}
                onSwiper={(swiper) => {
                  setSwiperInstance(swiper);
                  if (tabFromUrl === 'blog') swiper.slideTo(1);
                }}
                onSlideChange={(swiper) => setActiveTab(swiper.activeIndex === 0 ? 'news' : 'blog')}
                className="academy-news-blog-swiper"
              >
                <SwiperSlide>
                  <div className="academy-section-header">
                    <h2 className="academy-section-title">Announcements & Updates</h2>
                  </div>
                  <div className="academy-grid">
                    {newsItems.map((item) => (
                      <article key={item.id} className="academy-course-card academy-news-card">
                        <Link to={`/academy/news/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.image && (
                            <div className="academy-course-card__image-wrapper">
                              <img src={item.image} alt={item.title} className="academy-course-card__img" loading="lazy" />
                            </div>
                          )}
                          <div className="academy-course-card__body">
                            <div className="academy-course-card__meta">
                              {item.tag && <span className="academy-course-card__meta-item">{item.tag}</span>}
                              {item.date && <span className="academy-course-card__meta-item">{item.date}</span>}
                            </div>
                            <h3 className="academy-course-card__title">{item.title}</h3>
                            <p className="academy-course-card__desc">{item.highlight}</p>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="academy-section-header">
                    <h2 className="academy-section-title">Blog</h2>
                  </div>
                  <div className="academy-grid academy-blog-grid">
                    {blogPosts.map((post) => (
                      <article key={post.id} className="academy-course-card academy-blog-card">
                        <Link to={`/academy/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {post.image && (
                            <div className="academy-course-card__image-wrapper">
                              <img src={post.image} alt={post.title} className="academy-course-card__img" loading="lazy" />
                            </div>
                          )}
                          <div className="academy-course-card__body">
                            <div className="academy-course-card__meta">
                              {post.author && <span className="academy-course-card__meta-item">{post.author}</span>}
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
                </SwiperSlide>
              </Swiper>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
