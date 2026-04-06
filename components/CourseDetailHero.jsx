import React from 'react';
import '../styles/academy.css';

export default function CourseDetailHero({ title, subtitle, cover }) {
  return (
    <div className="academy-detail-hero" style={{ backgroundImage: cover ? `url(${cover})` : 'none' }}>
      <div className="academy-detail-hero__inner">
        <h2 className="academy-detail-hero__title">{title}</h2>
        {subtitle && <p className="academy-detail-hero__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
