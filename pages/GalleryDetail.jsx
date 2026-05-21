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

export default function GalleryDetail() {
    const { id } = useParams();
    const { allData, loading } = useShopData();

    // 1. Extract and normalize the specific gallery item
    const galleryItem = useMemo(() => {
        const raw = allData?.gallery ?? allData?.gallery_images ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.items ? raw.items : []);
        const found = list.find(item => String(item.id ?? item._id) === String(id));
        
        if (!found) return null;

        return {
            id: found.id ?? found._id,
            url: found.image_url ?? found.url ?? found.image,
            title: found.title ?? found.caption ?? 'Untitled Image',
            description: found.description ?? found.summary ?? found.content ?? '',
        };
    }, [allData, id]);

    // 2. Fetch fallback background media if the item doesn't render perfectly
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

    // 3. Loading State
    if (loading) {
        return (
            <div className="academy-page">
                <AcademyHeader />
                <div className="academy-container" style={{ padding: '100px 0', textAlign: 'center' }}>
                    <p className="academy-loading">Loading…</p>
                </div>
                <Footer />
            </div>
        );
    }

    // 4. Fallback Not Found State
    if (!galleryItem) {
        return (
            <div className="academy-page">
                <AcademyHeader />
                <div className="academy-container" style={{ padding: '100px 0', textAlign: 'center' }}>
                    <h2>Image not found</h2>
                    <Link to="/academy/events-gallery?tab=gallery" className="academy-course-card__btn" style={{ display: 'inline-block', marginTop: '20px' }}>
                        Back to Gallery
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const shopName = allData?.shop_details?.shopname || 'Academy';
    const pageTitle = galleryItem.title ? `${galleryItem.title} | ${shopName}` : `Gallery | ${shopName}`;
    const pageDescription = galleryItem.description || `View photo details from ${shopName} gallery.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
            </Helmet>
            
            <div className="academy-page">
                <AcademyHeader />

                {/* Hero Section */}
                <section className="academy-hero">
                    <div className="academy-hero__background">
                        {galleryItem.url ? (
                            <div className="academy-hero__static-image" style={{ backgroundImage: `url(${galleryItem.url})` }} />
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
                        <div className="academy-course-card__meta" style={{ justifyContent: 'center', marginBottom: '15px' }}>
                            <span className="academy-course-card__meta-item">Gallery Highlight</span>
                        </div>
                        <h1 className="academy-hero__title">{galleryItem.title}</h1>
                    </div>
                </section>

                {/* Content Section */}
                <section className="academy-section">
                    <div className="academy-container">
                        <div className="academy-legal-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            
                            {/* High-quality Centered Layout Image View */}
                            <div className="academy-gallery-detail__image-container" style={{ maxWidth: '800px', width: '100%', marginBottom: '40px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                                <img src={galleryItem.url} alt={galleryItem.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>

                            <div style={{ maxWidth: '800px', width: '100%' }}>
                                {galleryItem.description && (
                                    <div className="academy-about-text" style={{ lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '30px' }}>
                                        {galleryItem.description}
                                    </div>
                                )}

                                <div style={{ marginTop: '30px' }}>
                                    {/* Appends ?tab=gallery query param to ensure they return cleanly to the gallery tab view */}
                                    <Link to="/academy/events-gallery?tab=gallery" className="academy-course-card__btn" style={{ display: 'inline-block' }}>
                                        ← Back to Gallery
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}