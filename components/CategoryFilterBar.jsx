import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/free-mode';

import '../styles/academy.css';

const SCROLL_STEP_DESKTOP = 280;
const SCROLL_STEP_MOBILE = 200;

export default function CategoryFilterBar({
  categories = [],
  active = 'all',
  onChange = () => { }
}) {
  const scrollRef = useRef(null);
  const [scrollStep, setScrollStep] = useState(SCROLL_STEP_DESKTOP);
  const allCategories = [{ id: 'all', name: 'All Category' }, ...categories];

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const update = () => setScrollStep(mql.matches ? SCROLL_STEP_MOBILE : SCROLL_STEP_DESKTOP);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const scroll = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -scrollStep : scrollStep;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, [scrollStep]);

  return (
    <nav className="academy-filter" aria-label="Category filter">
      <div className="academy-filter__wrapper">
        <button
          type="button"
          className="academy-filter__arrow academy-filter__arrow--left"
          onClick={() => scroll('left')}
          aria-label="Scroll categories left"
        >
          <span className="academy-filter__arrow-icon" aria-hidden>‹</span>
        </button>

        <div className="academy-filter__scroll" ref={scrollRef}>
          {/* Mobile View – Swiper */}
          <div className="academy-filter__mobile">
            <Swiper
              modules={[FreeMode]}
              spaceBetween={10}
              slidesPerView="auto"
              freeMode={{
                enabled: true,
                momentumRatio: 0.5,
                momentumVelocityRatio: 0.5,
                sticky: true,
              }}
              grabCursor={true}
              resistance={true}
              resistanceRatio={0.85}
              touchEventsTarget="container"
              className="academy-filter__swiper"
              watchSlidesProgress
            >
              {allCategories.map((cat) => (
                <SwiperSlide key={cat.id} style={{ width: 'auto' }}>
                  <button
                    type="button"
                    className={`academy-filter__btn ${active === cat.id ? 'is-active' : ''}`}
                    onClick={() => onChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Desktop View – List */}
          <ul className="academy-filter__list academy-filter__desktop">
            {allCategories.map((cat) => (
              <li key={cat.id} className="academy-filter__item">
                <button
                  type="button"
                  className={`academy-filter__btn ${active === cat.id ? 'is-active' : ''}`}
                  onClick={() => onChange(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="academy-filter__arrow academy-filter__arrow--right"
          onClick={() => scroll('right')}
          aria-label="Scroll categories right"
        >
          <span className="academy-filter__arrow-icon" aria-hidden>›</span>
        </button>
      </div>
    </nav>
  );
}