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

export default function NewsDetail() {
    const { id } = useParams();
    const { allData, loading } = useShopData();

    const newsItem = useMemo(() => {
        const raw = allData?.news ?? allData?.news_items ?? allData?.news_posts ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.items ? raw.items : []);
        const found = list.find(item => String(item.id) === String(id));
        if (!found) return null;
        return {
            id: found.id,
            title: found.title ?? found.name ?? 'Untitled',
            tag: found.tag ?? found.category ?? found.source ?? '',
            date: formatDisplayDate(found.published_date ?? found.date ?? found.created_at ?? ''),
            highlight: found.summary ?? found.highlight ?? found.excerpt ?? (found.content ? String(found.content).slice(0, 300) + '…' : ''),
            content: typeof found.content === 'string' ? found.content : (found.body ?? ''),
            image: found.image || null,
            source: found.source ?? null,
            source_url: found.source_url ?? null,
        };
    }, [allData, id]);
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

    if (!newsItem) {
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
    const pageDescription = newsItem.highlight || (typeof newsItem.content === 'string' ? newsItem.content.slice(0, 160) : '') || 'Read the latest news and updates from our academy.';

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
            </Helmet>
            <div className="academy-page">
                <AcademyHeader />

                <section className="academy-hero">
                    {/* Background Media: prefer article image, then home media */}
                    <div className="academy-hero__background">
                        {newsItem.image ? (
                            <div className="academy-hero__static-image" style={{ backgroundImage: `url(${newsItem.image})` }} />
                        ) : videoUrl ? (
                            <video className="academy-hero__video" src={videoUrl} autoPlay muted loop playsInline />
                        ) : imageUrls.length > 1 ? (
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
                        ) : imageUrls.length === 1 ? (
                            <div className="academy-hero__static-image" style={{ backgroundImage: `url(${imageUrls[0]})` }} />
                        ) : null}
                        <div className="academy-hero__overlay"></div>
                    </div>

                    <div className="academy-container academy-hero__inner">
                        <span className="academy-course-card__badge" style={{ marginBottom: '15px', display: 'inline-block' }}>{newsItem.tag}</span>
                        <h1 className="academy-hero__title">{newsItem.title}</h1>
                        <p className="academy-hero__subtitle">{newsItem.date}</p>
                    </div>
                </section>

                <section className="academy-section">
                    <div className="academy-container">
                        <div className="academy-legal-content">
                            <p className="academy-about-description" style={{ fontWeight: '600', fontSize: '1.2rem', marginBottom: '30px' }}>
                                {newsItem.highlight}
                            </p>
                            <div className="academy-about-text" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                                {newsItem.content}
                            </div>

                            {(newsItem.source || newsItem.source_url) && (
                                <p className="academy-about-text" style={{ marginTop: '24px', fontSize: '0.95rem', opacity: 0.9 }}>
                                    {newsItem.source_url ? (
                                        <a href={newsItem.source_url} target="_blank" rel="noopener noreferrer">{newsItem.source || 'Source'}</a>
                                    ) : (
                                        <span>Source: {newsItem.source}</span>
                                    )}
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
