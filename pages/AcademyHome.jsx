// src/pages/AcademyHome.jsx

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import AcademyHeader from '../components/AcademyHeader';
import AcademyHero from '../components/AcademyHero';
import ApplyForDemoPopup from '../components/ApplyForDemoPopup';
import CategoryFilterBar from '../components/CategoryFilterBar';
import CourseGrid from '../components/CourseGrid';
import AcademyPagination from '../components/AcademyPagination';
import ReviewsSection from '../components/ReviewsSection';
import Footer from '../components/Footer';

import { useAcademyData } from '../context/AcademyContext';

import '../styles/academy.css';

export default function AcademyHome() {

  // =========================
  // STATES
  // =========================

  const [active, setActive] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);

  const [showApplyForDemoModal, setShowApplyForDemoModal] =
    useState(false);

  const itemsPerPage = 6;

  // =========================
  // CONTEXT DATA
  // =========================

  const {
    categories,
    courses,
    loading,
    error,
  } = useAcademyData();

  // =========================
  // NORMALIZE CATEGORY DATA
  // =========================

  const allCategories = categories?.data || [];

  // =========================
  // NORMALIZE COURSE DATA
  // =========================

  const allCourses = (courses?.data || []).map((course) => ({
    id: course._id,

    title: course.courseName,

    category: course.category,

    description: course.description,

    duration: course.duration,

    studyMode: course.mode,

    price: course.amount,

    image: course.image,

    rawData: course,
  }));

  // =========================
  // FILTER COURSES
  // =========================

  const filtered =
    active === 'all'
      ? allCourses
      : allCourses.filter(
        (course) =>
          course.category?.toLowerCase() ===
          active.toLowerCase()
      );

  // =========================
  // PAGINATION
  // =========================

  const indexOfLastItem = currentPage * itemsPerPage;

  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filtered.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // =========================
  // RESET PAGE ON CATEGORY CHANGE
  // =========================

  useEffect(() => {
    setCurrentPage(1);
  }, [active]);

  // =========================
  // SCROLL ANIMATION
  // =========================

  useEffect(() => {

    if (loading) return;

    const targets = document.querySelectorAll(
      '.academy-courses-section, .academy-process-section, .academy-reviews-section'
    );

    const observer = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              'academy-animate',
              'is-visible'
            );

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
      }
    );

    targets.forEach((el) => {

      el.classList.add('academy-animate');

      observer.observe(el);
    });

    return () => observer.disconnect();

  }, [loading]);

  // =========================
  // SCROLL TO TOP ON PAGE CHANGE
  // =========================

  useEffect(() => {

    if (allCourses.length > 0) {

      const section = document.querySelector(
        '.academy-courses-section'
      );

      if (section) {

        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }

  }, [currentPage]);

  return (
    <>

      {/* ========================= */}
      {/* SEO */}
      {/* ========================= */}

      <Helmet>

        <title>
          Home | Academy
        </title>

        <meta
          name="description"
          content="Professional courses for skill growth."
        />

      </Helmet>

      {/* ========================= */}
      {/* PAGE */}
      {/* ========================= */}

      <main className="academy-page">

        {/* Header */}
        <AcademyHeader />

        {/* Hero */}
        <AcademyHero
          onApplyForDemo={() =>
            setShowApplyForDemoModal(true)
          }
        />

        {/* ========================= */}
        {/* COURSES SECTION */}
        {/* ========================= */}

        <section className="academy-courses-section">

          <div className="academy-container">

            <div className="academy-section-header">

              <h2 className="academy-section-title">
                Explore Our Courses
              </h2>

            </div>

            {/* ========================= */}
            {/* CATEGORY FILTER */}
            {/* ========================= */}

            <CategoryFilterBar
              categories={allCategories.map((cat) => ({
                id: cat,
                name: cat,
              }))}
              active={active}
              onChange={setActive}
            />

            {/* ========================= */}
            {/* LOADING */}
            {/* ========================= */}

            {loading && (
              <p className="academy-loading">
                Loading courses...
              </p>
            )}

            {/* ========================= */}
            {/* ERROR */}
            {/* ========================= */}

            {error && (
              <p className="academy-error">
                {error}
              </p>
            )}

            {/* ========================= */}
            {/* COURSE GRID */}
            {/* ========================= */}

            <CourseGrid courses={currentItems} />

            {/* ========================= */}
            {/* PAGINATION */}
            {/* ========================= */}

            <AcademyPagination
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />

          </div>

        </section>

        {/* ========================= */}
        {/* HOW TO APPLY */}
        {/* ========================= */}

        <section className="academy-process-section">

          <div className="academy-container">

            <div className="academy-process-header">

              <h2 className="academy-section-title">
                How to Apply for a Course
              </h2>

              <p className="academy-process-subtitle">
                Follow these simple steps to enroll.
              </p>

            </div>

            <div className="academy-process-grid">

              <div className="academy-process-card">

                <div className="academy-process-number">
                  1
                </div>

                <h4 className="academy-process-step-title">
                  Choose Your Course
                </h4>

                <p className="academy-process-step-desc">
                  Browse available courses.
                </p>

              </div>

              <div className="academy-process-card">

                <div className="academy-process-number">
                  2
                </div>

                <h4 className="academy-process-step-title">
                  Check Requirements
                </h4>

                <p className="academy-process-step-desc">
                  Read course details carefully.
                </p>

              </div>

              <div className="academy-process-card">

                <div className="academy-process-number">
                  3
                </div>

                <h4 className="academy-process-step-title">
                  Submit Application
                </h4>

                <p className="academy-process-step-desc">
                  Apply using the form.
                </p>

              </div>

              <div className="academy-process-card">

                <div className="academy-process-number">
                  4
                </div>

                <h4 className="academy-process-step-title">
                  Get Verified
                </h4>

                <p className="academy-process-step-desc">
                  Our team reviews your application.
                </p>

              </div>

              <div className="academy-process-card">

                <div className="academy-process-number">
                  5
                </div>

                <h4 className="academy-process-step-title">
                  Start Learning
                </h4>

                <p className="academy-process-step-desc">
                  Access your course and learn.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* Reviews */}
        <ReviewsSection />

      </main>

      {/* Footer */}
      <Footer />

      {/* ========================= */}
      {/* APPLY DEMO MODAL */}
      {/* ========================= */}

      {showApplyForDemoModal && (
        <ApplyForDemoPopup
          courses={allCourses}
          onClose={() =>
            setShowApplyForDemoModal(false)
          }
        />
      )}

    </>
  );
}