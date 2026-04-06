import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import '../styles/academy.css';

export default function AcademyHero({
  title = 'Academy',
  subtitle = 'Professional courses to advance your skills',
  media = null,
  showCTA = true,
  onApplyForDemo = null
}) {
  const videoUrl = media?.video_link;
  const imageUrls = [media?.image_1, media?.image_2, media?.image_3].filter(Boolean);

  return (
    <header className="academy-hero">
      {/* Background Media */}
      <div className="academy-hero__background">
        {videoUrl ? (
          <video
            className="academy-hero__video"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
          />
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
                <div
                  className="academy-hero__slide-image"
                  style={{ backgroundImage: `url(${url})` }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : imageUrls.length === 1 ? (
          <div
            className="academy-hero__static-image"
            style={{ backgroundImage: `url(${imageUrls[0]})` }}
          />
        ) : null}
        <div className="academy-hero__overlay"></div>
      </div>

      <div className="academy-hero__inner">
        <h1 className="academy-hero__title">{title}</h1>
        <p className="academy-hero__subtitle">{subtitle}</p>
        {showCTA && (onApplyForDemo ? (
          <button type="button" className="academy-hero__cta" onClick={onApplyForDemo}>
            Apply for Demo
          </button>
        ) : (
          <a className="academy-hero__cta" href="#courses">Explore courses</a>
        ))}
      </div>
    </header>
  );
}
