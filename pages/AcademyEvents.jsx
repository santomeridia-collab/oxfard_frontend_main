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

function normalizeEvent(item, index) {
  if (!item || typeof item !== 'object') return null;
  const id = item.id ?? item._id ?? item.event_id ?? index + 1;
  const rawStart = item.start_date ?? item.start_date_time ?? item.date ?? item.created_at ?? '';
  return {
    id,
    title: item.title ?? item.name ?? 'Untitled',
    date: formatDisplayDate(rawStart),
    location: item.location ?? item.venue ?? '',
    description: item.description ?? item.summary ?? (item.content ? String(item.content).slice(0, 200) + '…' : ''),
    cover_image: item.cover_image ?? item.image ?? item.image_url ?? null,
    event_status: item.event_status ?? item.status ?? '',
  };
}

const FALLBACK_EVENTS = [
  { id: 1, title: 'Upcoming Event', type: 'Event', date: '—', location: '—', description: 'Check back soon for events.' },
];

export default function AcademyEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const { allData, loading } = useShopData();
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'gallery' ? 'gallery' : 'event');
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (!swiperInstance) return;
    if (tabFromUrl === 'gallery') swiperInstance.slideTo(1);
    else swiperInstance.slideTo(0);
  }, [tabFromUrl, swiperInstance]);

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

  const videoUrl = homeMedia?.video_link;
  const imageUrls = [homeMedia?.image_1, homeMedia?.image_2, homeMedia?.image_3].filter(Boolean);

  const events = useMemo(() => {
    const raw = allData?.events ?? allData?.event_list ?? [];
    const list = Array.isArray(raw) ? raw : (raw?.items ? raw.items : []);
    if (list.length === 0) return FALLBACK_EVENTS.map((e, i) => ({ ...e, id: e.id, cover_image: null }));
    return list.map((item, i) => normalizeEvent(item, i)).filter(Boolean);
  }, [allData]);

  const galleryItems = useMemo(() => {
    const raw = allData?.gallery ?? allData?.gallery_images ?? [];
    const list = Array.isArray(raw) ? raw : (raw?.items ? raw.items : []);
    return list
      .filter((item) => item && (item.image_url || item.url || item.image))
      .map((item) => ({
        id: item.id ?? item._id,
        url: item.image_url ?? item.url ?? item.image,
        title: item.title ?? item.caption ?? '',
      }));
  }, [allData]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'gallery' ? { tab: 'gallery' } : {});
    if (swiperInstance) swiperInstance.slideTo(tab === 'event' ? 0 : 1);
  };

  const shopName = allData?.shop_details?.shopname || 'Academy';

  return (
    <>
      <Helmet>
        <title>Events & Gallery | {shopName}</title>
        <meta name="description" content="Explore upcoming events, webinars, and highlights from our learning community. View our events and gallery." />
      </Helmet>
      <div className="academy-page">
        <AcademyHeader />

        {/* Hero: same pattern as News/Blog – title, subtitle, tabs only */}
        <header className="academy-hero academy-hero--news-blog academy-hero--events-gallery">
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
            <h1 className="academy-hero__title">Events &amp; Gallery</h1>
            <p className="academy-hero__subtitle">
              Explore upcoming events, webinars, and highlights from our learning community.
            </p>
            <div className="academy-news-blog-tabs">
              <button
                type="button"
                className={`academy-news-blog-tab ${activeTab === 'event' ? 'active' : ''}`}
                onClick={() => handleTabClick('event')}
              >
                Events
              </button>
              <button
                type="button"
                className={`academy-news-blog-tab ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => handleTabClick('gallery')}
              >
                Gallery
              </button>
            </div>
          </div>
        </header>

        {/* Content: single swiper with two slides – Events and Gallery (same as News/Blog) */}
        <section className="academy-courses-section academy-news-blog-content academy-events-gallery-content">
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
                  if (tabFromUrl === 'gallery') swiper.slideTo(1);
                }}
                onSlideChange={(swiper) => {
                  const tab = swiper.activeIndex === 0 ? 'event' : 'gallery';
                  setActiveTab(tab);
                  setSearchParams(tab === 'gallery' ? { tab: 'gallery' } : {});
                }}
                className="academy-news-blog-swiper"
              >
                <SwiperSlide>
                  <div className="academy-section-header">
                    <h2 className="academy-section-title">Events &amp; Highlights</h2>
                  </div>
                  <div className="academy-grid">
                    {events.map((event) => (
                      <article key={event.id} className="academy-course-card academy-event-card">
                        <Link to={`/academy/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {event.cover_image && (
                            <div className="academy-course-card__image-wrapper">
                              <img src={event.cover_image} alt={event.title} className="academy-course-card__img" loading="lazy" />
                            </div>
                          )}
                          <div className="academy-course-card__body">
                            <div className="academy-course-card__meta">
                              {event.date && <span className="academy-course-card__meta-item">{event.date}</span>}
                              {event.location && <span className="academy-course-card__meta-item">{event.location}</span>}
                            </div>
                            <h3 className="academy-course-card__title">{event.title}</h3>
                            <p className="academy-course-card__desc">{event.description}</p>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="academy-section-header">
                    <h2 className="academy-section-title">Gallery</h2>
                  </div>
                  {galleryItems.length === 0 ? (
                    <p className="academy-news-blog-loading" style={{ paddingTop: '1rem' }}>No gallery images yet.</p>
                  ) : (
                   <div className="academy-gallery-grid academy-gallery-grid--events">
  {galleryItems.map((item) => (
    <div key={item.id || item.url} className="academy-gallery-card academy-gallery-card--styled">
      {/* ADD THIS LINK WRAPPER */}
      <Link to={`/academy/gallery/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="academy-gallery-card__image-wrap">
          <img
            src={item.url}
            alt={item.title || 'Gallery'}
            loading="lazy"
          />
        </div>
        <div className="academy-gallery-card__body">
          {item.title && <h4 className="academy-gallery-card__title">{item.title}</h4>}
        </div>
      </Link>
    </div>
  ))}
</div>
                  )}
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

