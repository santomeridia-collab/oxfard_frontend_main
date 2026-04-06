import React from 'react';
import { Link } from 'react-router-dom';
import { useShopData } from '../context/AcademyContext';
import '../styles/academy.css';

export default function CourseCard({ course }) {
  const { currencySymbol } = useShopData();

  return (
    <article className="academy-course-card">
      <div className="academy-course-card__image-wrapper">
        {course.image && <img className="academy-course-card__img" src={course.image} alt={course.title} />}
        {course.category && <span className="academy-course-card__badge">{course.category}</span>}
      </div>
      <div className="academy-course-card__body">
        <h3 className="academy-course-card__title">{course.title}</h3>
        <div className="academy-course-card__meta">
          {course.duration && <span className="academy-course-card__meta-item">⏱ {course.duration}</span>}
          {course.studyMode && <span className="academy-course-card__meta-item">📚 {course.studyMode}</span>}
          {course.intakeDates && <span className="academy-course-card__meta-item">📅 {course.intakeDates}</span>}
        </div>
        <p className="academy-course-card__desc">{course.shortDescription}</p>
        <div className="academy-course-card__footer">
          {course.price && <span className="academy-course-card__price">{currencySymbol}{course.price}</span>}
          <Link to={`/academy/course/${course.id}`} className="academy-course-card__btn">View Details</Link>
        </div>
      </div>
    </article>
  );
}
