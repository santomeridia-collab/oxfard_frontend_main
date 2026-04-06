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

export default function EventDetail() {
    const { id } = useParams();
    const { allData, loading } = useShopData();

    const event = useMemo(() => {
        const raw = allData?.events ?? allData?.event_list ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.items ? raw.items : []);
        const found = list.find(item => String(item.id) === String(id));
        if (!found) return null;
        const startStr = found.start_date ?? found.start_date_time ?? found.date ?? '';
        const endStr = found.end_date ?? found.end_date_time ?? '';
        const fullDesc = typeof found.description === 'string' ? found.description : (found.content ?? '');
        const shortDesc = fullDesc.length > 250 ? fullDesc.slice(0, 250).trim() + '…' : fullDesc;
        return {
            id: found.id,
            title: found.title ?? found.name ?? 'Untitled',
            date: formatDisplayDate(startStr),
            endDate: endStr ? formatDisplayDate(endStr) : '',
            location: found.location ?? found.venue ?? '',
            description: shortDesc,
            detailedDescription: fullDesc,
            cover_image: found.cover_image ?? found.image ?? found.image_url ?? null,
            event_status: found.event_status ?? found.status ?? '',
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

    if (!event) {
        return (
            <>
                <div className="academy-page">
                    <AcademyHeader />
                    <div className="academy-container" style={{ padding: '100px 0', textAlign: 'center' }}>
                        <h2>Event not found</h2>
                        <Link to="/academy/events-gallery" className="academy-course-card__btn" style={{ display: 'inline-block', marginTop: '20px' }}>Back to Events</Link>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    const shopName = allData?.shop_details?.shopname || 'Academy';
    const pageTitle = event.title ? `${event.title} | ${shopName}` : `Event | ${shopName}`;
    const pageDescription = event.description || `Join us for ${event.title}. ${event.date ? event.date : ''} ${event.location ? event.location : ''}`.trim() || 'View event details.';

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
            </Helmet>
            <div className="academy-page">
                <AcademyHeader />

                <section className="academy-hero">
                    {/* Background: prefer event cover_image, then home media */}
                    <div className="academy-hero__background">
                        {event.cover_image ? (
                            <div className="academy-hero__static-image" style={{ backgroundImage: `url(${event.cover_image})` }} />
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
                            {event.date && <span className="academy-course-card__meta-item">{event.date}</span>}
                            {event.endDate && <span className="academy-course-card__meta-item">– {event.endDate}</span>}
                            {event.location && <span className="academy-course-card__meta-item">{event.location}</span>}
                        </div>
                        <h1 className="academy-hero__title">{event.title}</h1>
                    </div>
                </section>

                <section className="academy-section">
                    <div className="academy-container">
                        <div className="academy-legal-content">
                            {event.description && (
                                <p className="academy-about-description" style={{ fontWeight: '600', marginBottom: '30px' }}>
                                    {event.description}
                                </p>
                            )}
                            <div className="academy-about-text" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                                {event.detailedDescription}
                            </div>

                            <div style={{ marginTop: '50px' }}>
                                <Link to="/academy/events-gallery" className="academy-course-card__btn" style={{ display: 'inline-block' }}>← Back to Events</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
