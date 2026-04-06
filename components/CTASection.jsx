import React from 'react';
import '../styles/academy.css';

export default function CTASection() {
  return (
    <section className="academy-cta">
      <div className="academy-cta__inner">
        <h2 className="academy-cta__title">Start Your Learning Journey</h2>
        <p className="academy-cta__subtitle">Discover courses tailored to your goals and interests.</p>
        <a href="#courses" className="academy-cta__btn">Explore All Courses</a>
      </div>
    </section>
  );
}
