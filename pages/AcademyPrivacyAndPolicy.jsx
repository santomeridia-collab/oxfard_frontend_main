import React from 'react';
import { Helmet } from 'react-helmet-async';
import AcademyHeader from '../components/AcademyHeader';
import Footer from '../components/Footer';
import '../styles/academy.css';
import { useShopData } from '../context/AcademyContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
const getLatestContentDocument = (docs, type) => {
  if (!docs) return null;
  const filtered = docs.filter(d => d.type === type);
  return filtered.sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))[0];
};

export default function AcademyPrivacyAndPolicy() {
  const { allData, loading, error } = useShopData();

  const contentDocuments = allData?.content_documents;
  const privacyDoc = getLatestContentDocument(contentDocuments, 'privacy');
  const title = privacyDoc?.title ?? 'Privacy & Policy';
  const content = privacyDoc?.content;
  const shopName = allData?.shop_details?.shopname || 'Academy';

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
          <div className="academy-container academy-loading-container">
            <p className="academy-loading">Loading privacy &amp; policy content...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{title} | {shopName}</title>
        <meta name="description" content="Privacy policy. How we collect, use, and protect your personal information." />
      </Helmet>
      <div className="academy-page">
        <AcademyHeader />

        <section className="academy-hero">
          {/* Background Media */}
          <div className="academy-hero__background">
            {videoUrl ? (
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
            <h1 className="academy-hero__title">{title}</h1>
            <p className="academy-hero__subtitle">
              Understand how we collect, use, and protect your personal information.
            </p>
          </div>
        </section>

        <div className="academy-container">
          <section className="academy-legal-section">
            <div className="academy-legal-content">
              {error && (
                <p className="academy-error">Error loading content: {error}</p>
              )}

              {!error && (
                <>
                  {content ? (
                    content.trim().includes('<') ? (
                      <div
                        className="academy-legal-html"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    ) : (
                      <ul className="academy-legal-list">
                        {content
                          .trim()
                          .split(/\n+/)
                          .filter((line) => line.trim())
                          .map((line, index) => (
                            <li key={index}>{line.trim()}</li>
                          ))}
                      </ul>
                    )
                  ) : (
                    <p>Content not available.</p>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

