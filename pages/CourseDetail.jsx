// src/pages/CourseDetail.jsx

import React from 'react';

import { useParams } from 'react-router-dom';

import { Helmet } from 'react-helmet-async';

import AcademyHeader from '../components/AcademyHeader';
import Footer from '../components/Footer';
import EnrollmentPopup from '../components/EnrollmentPopup';

import { useAcademyData } from '../context/AcademyContext';

import '../styles/academy.css';

export default function CourseDetail() {

  // =========================
  // PARAMS
  // =========================

  const { courseId } = useParams();

  // =========================
  // CONTEXT
  // =========================

  const {
    getCourseDetails,
  } = useAcademyData();

  // =========================
  // STATES
  // =========================

  const [course, setCourse] = React.useState(null);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState(null);

  const [isPopupOpen, setIsPopupOpen] =
    React.useState(false);

  // =========================
  // FETCH COURSE DETAILS
  // =========================

  React.useEffect(() => {

    const fetchCourse = async () => {

      try {

        setLoading(true);

        const response =
          await getCourseDetails(courseId);

        console.log(
          'Course Details Response:',
          response
        );

        // API returns:
        // {
        //   success: true,
        //   data: { ...course }
        // }

        if (response?.success && response?.data) {

          const data = response.data;

          const normalizedCourse = {

            id: data._id,

            title: data.courseName,

            category: data.category,

            description: data.description,

            duration: data.duration,

            studyMode: data.mode,

            price: data.amount,

            image: data.image,

            createdAt: data.createdAt,
          };

          setCourse(normalizedCourse);

        } else {

          setError('Course not found');
        }

      } catch (err) {

        console.error(err);

        setError('Failed to load course');

      } finally {

        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }

  }, [courseId]);

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <>
        <main className="academy-page">

          <AcademyHeader />

          <div className="academy-container">

            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
              }}
            >

              <p>
                Loading course details...
              </p>

            </div>

          </div>

        </main>

        <Footer />
      </>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !course) {

    return (
      <>
        <main className="academy-page">

          <AcademyHeader />

          <div className="academy-container">

            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
              }}
            >

              <p className="academy-error">
                {error}
              </p>

            </div>

          </div>

        </main>

        <Footer />
      </>
    );
  }

  return (
    <>

      {/* ========================= */}
      {/* SEO */}
      {/* ========================= */}

      <Helmet>

        <title>
          {course.title} | Academy
        </title>

        <meta
          name="description"
          content={course.description}
        />

      </Helmet>

      {/* ========================= */}
      {/* PAGE */}
      {/* ========================= */}

      <main className="academy-page">

        {/* Header */}
        <AcademyHeader />

        {/* ========================= */}
        {/* HERO SECTION */}
        {/* ========================= */}

        <section className="academy-course-hero">

          <div className="academy-container">

            <div className="academy-course-hero__layout">

              {/* LEFT */}
              <div className="academy-course-hero__left">

                {/* Category */}
                {course.category && (

                  <div className="academy-course-info__item">

                    <span className="academy-course-info__label">
                      Category
                    </span>

                    <span className="academy-course-info__value">
                      {course.category}
                    </span>

                  </div>
                )}

                {/* Title */}
                <h1 className="academy-course-hero__title">
                  {course.title}
                </h1>

                {/* Description */}
                <p className="academy-course-hero__subtitle">
                  {course.description}
                </p>

                {/* Course Info */}
                <div className="academy-course-info">

                  {/* Duration */}
                  {course.duration && (

                    <div className="academy-course-info__item">

                      <span className="academy-course-info__label">
                        Duration
                      </span>

                      <span className="academy-course-info__value">
                        {course.duration}
                      </span>

                    </div>
                  )}

                  {/* Mode */}
                  {course.studyMode && (

                    <div className="academy-course-info__item">

                      <span className="academy-course-info__label">
                        Study Mode
                      </span>

                      <span className="academy-course-info__value">
                        {course.studyMode}
                      </span>

                    </div>
                  )}

                </div>

                {/* Price */}
                {course.price && (

                  <div className="academy-course-pricing">

                    <div className="academy-course-pricing__price">

                      ₹{course.price}

                    </div>

                    <button
                      className="academy-course-pricing__btn"
                      onClick={() =>
                        setIsPopupOpen(true)
                      }
                    >
                      Enroll Now
                    </button>

                  </div>
                )}

              </div>

              {/* RIGHT IMAGE */}
              <div className="academy-course-hero__right">

                {course.image && (

                  <img
                    src={course.image}
                    alt={course.title}
                    className="academy-course-hero__img"
                  />
                )}

              </div>

            </div>

          </div>

        </section>

        {/* ========================= */}
        {/* OVERVIEW */}
        {/* ========================= */}

        <section className="academy-section academy-overview">

          <div className="academy-container">

            <h2 className="academy-section-heading">
              Course Overview
            </h2>

            <p className="academy-overview__text">
              {course.description}
            </p>

          </div>

        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* ========================= */}
      {/* ENROLL POPUP */}
      {/* ========================= */}

      {isPopupOpen && (

        <EnrollmentPopup
          courseId={course.id}
          courseTitle={course.title}
          onClose={() =>
            setIsPopupOpen(false)
          }
        />

      )}

    </>
  );
}