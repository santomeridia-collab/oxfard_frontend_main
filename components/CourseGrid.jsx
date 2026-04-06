import React, { useEffect, useState } from 'react';
import CourseCard from './CourseCard';
import '../styles/academy.css';
 
export default function CourseGrid({ courses = [] }) {
  const [visible, setVisible] = useState(courses);
  const [fading, setFading] = useState(false);

  // sync on courses change with fade
  useEffect(() => {
    if (courses === visible) return;
    setFading(true);
    const timeout = setTimeout(() => {
      setVisible(courses);
      setFading(false);
    }, 300); // animation duration
    return () => clearTimeout(timeout);
  }, [courses]);

  if (!visible.length) return <p className="academy-empty">No courses available.</p>;

  return (
    <section id="courses" className={`academy-grid ${fading ? 'fade-out' : 'fade-in'}`}>
      {visible.map((c) => (
        <CourseCard key={c.id} course={c} />
      ))}
    </section>
  );
}
