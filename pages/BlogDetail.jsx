// src/pages/BlogDetail.jsx
import React, { useState, useEffect } from 'react';
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

export default function BlogDetail() {
    const { id } = useParams();
    const { getBlogDetails, allData } = useShopData();
    const [blogPost, setBlogPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                setLoading(true);
                const data = await getBlogDetails(id);
                setBlogPost(data);
            } catch (err) {
                console.error('Error fetching blog:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlogDetail();
        }
    }, [id, getBlogDetails]);

    if (loading) {
        return (
            <div className="academy-page">
                <AcademyHeader />
                <div className="academy-container" style={{ padding: '100px 0', textAlign: 'center' }}>
                    <p>Loading blog post...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !blogPost) {
        return (
            <div className="academy-page">
                <AcademyHeader />
                <div className="academy-container" style={{ padding: '100px 0', textAlign: 'center' }}>
                    <h2>Blog post not found</h2>
                    <Link to="/academy/news?tab=blog" className="academy-course-card__btn" style={{ display: 'inline-block', marginTop: '20px' }}>
                        Back to Blog
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const shopName = allData?.shop_details?.shopname || 'Academy';
    
    // Handle images array or single image
    const imageUrls = blogPost.images?.length > 0 
        ? blogPost.images 
        : (blogPost.image ? [blogPost.image] : []);

    return (
        <>
            <Helmet>
                <title>{blogPost.title} | {shopName}</title>
                <meta name="description" content={blogPost.excerpt || (typeof blogPost.content === 'string' ? blogPost.content.slice(0, 160) : '')} />
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
                        <h1 className="academy-hero__title">{blogPost.title}</h1>
                        <div className="academy-blog-detail-meta">
                            {blogPost.author && <span className="academy-blog-detail-author">{blogPost.author}</span>}
                            {blogPost.date && <span className="academy-blog-detail-date">{formatDisplayDate(blogPost.date)}</span>}
                            {blogPost.readTime && <span className="academy-blog-detail-read">{blogPost.readTime}</span>}
                        </div>
                    </div>
                </section>

                <section className="academy-section">
                    <div className="academy-container">
                        <div className="academy-legal-content academy-blog-detail-content">
                            <div className="academy-about-text academy-blog-detail-body" style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '1.1rem' }}>
                                {blogPost.content}
                            </div>
                            <div style={{ marginTop: '50px' }}>
                                <Link to="/academy/news?tab=blog" className="academy-course-card__btn" style={{ display: 'inline-block' }}>
                                    ← Back to Blog
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}