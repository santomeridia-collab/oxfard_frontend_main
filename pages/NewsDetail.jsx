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

export default function NewsDetail() {
    const { id } = useParams();
    const { getNewsDetails, allData } = useShopData();
    const [newsItem, setNewsItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                setLoading(true);
                const data = await getNewsDetails(id);
                setNewsItem(data);
            } catch (err) {
                console.error('Error fetching news:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNewsDetail();
        }
    }, [id, getNewsDetails]);

    // Get home media for fallback
    const homeMedia = (() => {
        if (!allData?.home_media || allData.home_media.length === 0) return null;
        const academyShopType = allData?.shop_details?.shop_type?.find(
            (t) => t.slug === 'academy' || t.name?.toLowerCase() === 'academy'
        );
        const matched = allData.home_media.find(m => m.shop_type_id === academyShopType?.shop_type_id);
        return matched || allData.home_media[0];
    })();
    
    const videoUrl = homeMedia?.video_link;
    const imageUrls = [homeMedia?.image_1, homeMedia?.image_2, homeMedia?.image_3].filter(Boolean);

    if (loading) {
        return (
            <>
                <div className="academy-page">
                    <AcademyHeader />
                    <div className="academy-container" style={{ padding: '100px 0', textAlign: 'center' }}>
                        <p className="academy-loading">Loading…</p>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    if (error || !newsItem) {
        return (
            <>
                <div className="academy-page">
                    <AcademyHeader />
                    <div className="academy-container" style={{ padding: '100px 0', textAlign: 'center' }}>
                        <h2>News article not found</h2>
                        <Link to="/academy/news" className="academy-course-card__btn" style={{ display: 'inline-block', marginTop: '20px' }}>Back to News</Link>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    const shopName = allData?.shop_details?.shopname || 'Academy';
    const pageTitle = newsItem.title ? `${newsItem.title} | ${shopName}` : `News | ${shopName}`;
    const pageDescription = newsItem.content ? (typeof newsItem.content === 'string' ? newsItem.content.slice(0, 160) : '') : 'Read the latest news and updates from our academy.';
    
    // Handle article image or fallback to home media
    const articleImageUrl = newsItem.image;
    const imageUrl = articleImageUrl ? [articleImageUrl] : (imageUrls.length > 0 ? imageUrls : []);

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
            </Helmet>
            <div className="academy-page">
                <AcademyHeader />

                <section className="academy-hero">
                    <div className="academy-hero__background">
                        {articleImageUrl ? (
                            <div className="academy-hero__static-image" style={{ backgroundImage: `url(${articleImageUrl})` }} />
                        ) : videoUrl ? (
                            <video className="academy-hero__video" src={videoUrl} autoPlay muted loop playsInline />
                        ) : imageUrl.length > 1 ? (
                            <Swiper
                                modules={[Autoplay, EffectFade]}
                                effect="fade"
                                autoplay={{ delay: 5000, disableOnInteraction: false }}
                                loop={true}
                                className="academy-hero__slider"
                            >
                                {imageUrl.map((url, idx) => (
                                    <SwiperSlide key={idx}>
                                        <div className="academy-hero__slide-image" style={{ backgroundImage: `url(${url})` }} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : imageUrl.length === 1 ? (
                            <div className="academy-hero__static-image" style={{ backgroundImage: `url(${imageUrl[0]})` }} />
                        ) : null}
                        <div className="academy-hero__overlay"></div>
                    </div>

                    <div className="academy-container academy-hero__inner">
                        {newsItem.category && <span className="academy-course-card__badge" style={{ marginBottom: '15px', display: 'inline-block' }}>{newsItem.category}</span>}
                        <h1 className="academy-hero__title">{newsItem.title}</h1>
                        <p className="academy-hero__subtitle">{formatDisplayDate(newsItem.date)}</p>
                    </div>
                </section>

                <section className="academy-section">
                    <div className="academy-container">
                        <div className="academy-legal-content">
                            <div className="academy-about-text" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                                {newsItem.content}
                            </div>

                            {newsItem.source && (
                                <p className="academy-about-text" style={{ marginTop: '24px', fontSize: '0.95rem', opacity: 0.9 }}>
                                    Source: {newsItem.source}
                                </p>
                            )}
                            <div style={{ marginTop: '50px' }}>
                                <Link to="/academy/news" className="academy-course-card__btn" style={{ display: 'inline-block' }}>← Back to News</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
