import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';

import '../styles/academy.css';

import { useAcademyData } from '../context/AcademyContext';

export default function AcademyHero({
  showCTA = true,
  onApplyForDemo = null
}) {

  const { heroData } = useAcademyData();

  // API data array
  const heroes = heroData?.data || [];

  return (
    <header className="academy-hero">

      {/* Background Slider */}
      <div className="academy-hero__background">

        {heroes.length > 0 && (
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{
              delay: 4000,
              disableOnInteraction: false
            }}
            loop={true}
            className="academy-hero__slider"
          >

            {heroes.map((item) => (
              <SwiperSlide key={item._id}>
                <div
                  className="academy-hero__slide-image"
                  style={{
                    backgroundImage: `url(${item.image})`
                  }}
                />

                <div className="academy-hero__overlay"></div>

                <div className="academy-hero__inner">
                  <h1 className="academy-hero__title">
                    {item.title}
                  </h1>

                  <p className="academy-hero__subtitle">
                    {item.subTitle}
                  </p>

                  {showCTA && (
                    onApplyForDemo ? (
                      <button
                        type="button"
                        className="academy-hero__cta"
                        onClick={onApplyForDemo}
                      >
                        Apply for Demo
                      </button>
                    ) : (
                      <a
                        className="academy-hero__cta"
                        href="#courses"
                      >
                        Explore Courses
                      </a>
                    )
                  )}
                </div>
              </SwiperSlide>
            ))}

          </Swiper>
        )}

      </div>

    </header>
  );
}