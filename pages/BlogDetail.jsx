import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import AcademyHeader from '../components/AcademyHeader';
import Footer from '../components/Footer';
import '../styles/academy.css';
import { useShopData } from '../context/AcademyContext';

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

const FALLBACK_BLOG_POSTS = [
    { id: 1, title: 'How to Choose the Right Course for Your Career', category: 'Career Guidance', date: 'Feb 12, 2026', readTime: '7 min read', excerpt: 'Learn a practical framework to evaluate courses based on your current skills, long‑term goals, and the job market.', content: 'Choosing the right course is a pivotal step in your career journey.', image: null, author: '' },
    { id: 2, title: 'Modern Web Development Skills You Should Master', category: 'Web Development', date: 'Jan 28, 2026', readTime: '6 min read', excerpt: 'From React and TypeScript to deployment pipelines, discover the core skills that make you job‑ready as a web developer.', content: 'The landscape of web development is constantly evolving.', image: null, author: '' },
    { id: 3, title: 'Balancing Work, Study, and Life Effectively', category: 'Productivity', date: 'Jan 10, 2026', readTime: '5 min read', excerpt: 'Simple routines and tactics our top learners use to stay consistent without burning out.', content: 'Consistency is key to success in any learning endeavor.', image: null, author: '' },
];

function normalizeBlogItem(item, index) {
    if (!item || typeof item !== 'object') return null;
    const id = item.id ?? item.blog_id ?? index + 1;
    const title = item.title ?? item.name ?? 'Untitled';
    const rawContent = item.content ?? item.body ?? item.description ?? item.excerpt ?? '';
    const excerptStr = item.excerpt ?? item.description ?? (typeof rawContent === 'string' ? rawContent.slice(0, 200) + (rawContent.length > 200 ? '…' : '') : '');
    const rawDate = item.date ?? item.created_at ?? item.published_at ?? item.updated_at ?? '';
    const singleImage = item.image || null;
    const imagesArray = Array.isArray(item.images) ? item.images.filter(Boolean) : (Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : []);
    const images = imagesArray.length > 0 ? imagesArray : (singleImage ? [singleImage] : []);
    return {
        id,
        title,
        category: item.category ?? item.category_name ?? item.tag ?? '',
        date: formatDisplayDate(rawDate) || (typeof rawDate === 'string' ? rawDate : ''),
        readTime: item.read_time ?? item.readTime ?? '',
        excerpt: typeof excerptStr === 'string' ? excerptStr : String(excerptStr || ''),
        content: typeof rawContent === 'string' ? rawContent : String(rawContent || ''),
        image: singleImage,
        images,
        author: item.author || '',
    };
}

export default function BlogDetail() {
    const { id } = useParams();
    const { allData } = useShopData();

    const post = useMemo(() => {
        const raw = allData?.blogs ?? allData?.blog_posts ?? allData?.blog;
        const list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && raw.items ? raw.items : []);
        const normalized = list.length > 0
            ? list.map((item, i) => normalizeBlogItem(item, i)).filter(Boolean)
            : FALLBACK_BLOG_POSTS;
        const match = normalized.find((p) => p.id === id || String(p.id) === String(id) || p.id === parseInt(id, 10));
        return match ?? null;
    }, [allData, id]);

    if (!post) {
        return (
            <>
                <div className="academy-page">
                    <AcademyHeader />
                    <div className="academy-container" style={{ padding: '100px 0', textAlign: 'center' }}>
                        <h2>Blog post not found</h2>
                        <Link to="/academy/news?tab=blog" className="academy-course-card__btn" style={{ display: 'inline-block', marginTop: '20px' }}>Back to Blog</Link>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    const imageUrls = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
    const shopName = allData?.shop_details?.shopname || 'Academy';
    const pageTitle = post.title ? `${post.title} | ${shopName}` : `Blog | ${shopName}`;
    const pageDescription = post.excerpt || (post.content ? String(post.content).slice(0, 160) + '…' : '') || 'Read our latest blog post.';

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
            </Helmet>
            <div className="academy-page">
                <AcademyHeader />

                <section className="academy-hero academy-blog-detail-hero">
                    {imageUrls.length > 0 && (
                        <div className="academy-hero__background">
                            {imageUrls.length > 1 ? (
                                <Swiper
                                    modules={[Autoplay, EffectFade]}
                                    effect="fade"
                                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                                    loop={true}
                                    className="academy-hero__slider"
                                >
                                    {imageUrls.map((url, idx) => (
                                        <SwiperSlide key={idx}>
                                            <div className="academy-hero__slide-image" style={{ backgroundImage: `url(${url})` }} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            ) : (
                                <div className="academy-hero__static-image" style={{ backgroundImage: `url(${imageUrls[0]})` }} />
                            )}
                            <div className="academy-hero__overlay" />
                        </div>
                    )}
                    <div className="academy-container academy-hero__inner">
                        <h1 className="academy-hero__title">{post.title}</h1>
                        <div className="academy-blog-detail-meta">
                            {post.author && <span className="academy-blog-detail-author">{post.author}</span>}
                            {post.date && <span className="academy-blog-detail-date">{post.date}</span>}
                            {post.readTime && <span className="academy-blog-detail-read">{post.readTime}</span>}
                        </div>
                    </div>
                </section>

                <section className="academy-section">
                    <div className="academy-container">
                        <div className="academy-legal-content academy-blog-detail-content">
                            <div className="academy-about-text academy-blog-detail-body" style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '1.1rem' }}>
                                {post.content}
                            </div>
                            <div style={{ marginTop: '50px' }}>
                                <Link to="/academy/news?tab=blog" className="academy-course-card__btn" style={{ display: 'inline-block' }}>← Back to Blog</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
