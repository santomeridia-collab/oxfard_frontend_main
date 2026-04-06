import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useShopData, useStore } from '../context/AcademyContext';
import API_ENDPOINTS from '../config/endpoints';
import CurriculumAccordion from '../components/CurriculumAccordion';
import FAQAccordion from '../components/FAQAccordion';
import InstructorSection from '../components/InstructorSection';
import AcademyHeader from '../components/AcademyHeader';
import Footer from '../components/Footer';
import EnrollmentPopup from '../components/EnrollmentPopup';
import '../styles/academy.css';

// Sample course data - used only as last-resort fallback
const SAMPLE_COURSE = {
  title: 'Sample course',
  shortDescription: 'This is placeholder content.'
};

// normalize backend course structure for our UI components
function normalizeCourse(raw) {
  if (!raw) return null;

  // helper to sort by order property if available
  const sortByOrder = (arr = []) =>
    [...arr].sort((a, b) => (a.order || 0) - (b.order || 0));

  const modules = Array.isArray(raw.modules)
    ? sortByOrder(raw.modules).map((m) => ({
      title: m.title,
      lessons: sortByOrder(m.lessons || []).map((l) => ({
        title: l.title,
        isPreview: l.is_preview,
        contentType: l.content_type,
      })),
    }))
    : [];

  return {
    ...raw,
    id: raw.course_id || raw.id,
    title: raw.title || raw.name,
    shortDescription: raw.description || raw.syllabus_summary || '',
    longDescription: raw.description || raw.long_description || raw.syllabus_summary || '',
    image: raw.image_url || raw.image || raw.img,
    duration: raw.duration || '',
    studyMode: raw.study_mode || raw.studyMode || '',
    certification: raw.certification ? 'Yes' : '',
    intakeDates: Array.isArray(raw.intake_dates)
      ? raw.intake_dates.join(', ')
      : raw.intake_dates || '',
    price: raw.final_price || raw.price || 0,
    discount: raw.discount || 0,
    category: raw.category?.name || '',
    curriculum: modules,
    instructor: raw.instructor
      ? {
        name: raw.instructor.name,
        designation: raw.instructor.designation,
        photo: raw.instructor.image_url || raw.instructor.photo,
        bio: raw.instructor.bio || '',
      }
      : null,
    faq: raw.faqs || raw.faq || [],
  };
}

export default function CourseDetail({ course: initialCourse = SAMPLE_COURSE }) {
  const { courseId } = useParams();
  const { allData, currencySymbol } = useShopData();
  const { storeId } = useStore();
  const [course, setCourse] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      setLoading(true);
      setError(null);

      const lookup = (courses = []) =>
        courses.find(
          (c) =>
            c.course_id === courseId ||
            String(c.course_id) === courseId ||
            c.id === courseId
        );

      // try cache first, but only if it already contains module/faq details
      if (allData && allData.courses) {
        const found = lookup(allData.courses);
        if (
          found &&
          Array.isArray(found.modules) &&
          found.modules.length > 0
        ) {
          setCourse(normalizeCourse(found));
          setLoading(false);
          return;
        }
      }

      // otherwise fetch the public courses list; this endpoint returns
      // full course objects including modules and faqs (used for card
      // grid and detail pages)
      if (storeId) {
        try {
          const res = await fetch(API_ENDPOINTS.PUBLIC.COURSES(storeId));
          if (!res.ok) throw new Error('Failed to fetch courses');
          const data = await res.json();
          const courses = Array.isArray(data) ? data : data.data || [];

          const found = lookup(courses);
          if (found) {
            setCourse(normalizeCourse(found));
          } else {
            setError('Course not found');
          }
        } catch (err) {
          console.error('Failed to load course details:', err);
          setError(err && err.message ? err.message : String(err));
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      // if storeId is still undefined we just wait; effect reruns when it appears
    }

    loadCourse();
    return () => {
      cancelled = true;
    };
  }, [courseId, allData, storeId]);

  if (loading) {
    return (
      <>
        <main className="academy-page">
          <AcademyHeader />
          <div className="academy-container">
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p>Loading course details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !course) {
    return (
      <>
        <main className="academy-page">
          <AcademyHeader />
          <div className="academy-container">
            <p className="academy-not-found">Error: {error}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const shopName = allData?.shop_details?.shopname || 'Academy';
  const pageTitle = course?.title ? `${course.title} | ${shopName}` : `Course | ${shopName}`;
  const pageDescription = course?.shortDescription || course?.longDescription || 'View course details, curriculum, and enroll.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <main className="academy-page">
        <AcademyHeader />
        {/* Top Hero Section: Two-Column Layout */}
        <section className="academy-course-hero">
          <div className="academy-container">
            <div className="academy-course-hero__layout">
              {/* Left Column: Course Info */}
              <div className="academy-course-hero__left">
                {course.category && (
                  <div className="academy-course-info__item">
                    <span className="academy-course-info__label">Category</span>
                    <span className="academy-course-info__value">{course.category}</span>
                  </div>
                )}
                <h1 className="academy-course-hero__title">{course.title}</h1>
                <p className="academy-course-hero__subtitle">{course.shortDescription}</p>

                <div className="academy-course-info">
                  {course.duration && (
                    <div className="academy-course-info__item">
                      <span className="academy-course-info__label">Duration</span>
                      <span className="academy-course-info__value">{course.duration}</span>
                    </div>
                  )}
                  {course.studyMode && (
                    <div className="academy-course-info__item">
                      <span className="academy-course-info__label">Study Mode</span>
                      <span className="academy-course-info__value">{course.studyMode}</span>
                    </div>
                  )}
                  {course.certification && (
                    <div className="academy-course-info__item">
                      <span className="academy-course-info__label">Certification</span>
                      <span className="academy-course-info__badge">{course.certification}</span>
                    </div>
                  )}
                  {course.intakeDates && (
                    <div className="academy-course-info__item">
                      <span className="academy-course-info__label">Intake Dates</span>
                      <span className="academy-course-info__value">{course.intakeDates}</span>
                    </div>
                  )}
                </div>

                {course.price && (
                  <div className="academy-course-pricing">
                    <div className="academy-course-pricing__price">
                      {currencySymbol}{course.price.toFixed(2)}
                      {course.discount > 0 && (
                        <span className="academy-course-pricing__discount">
                          {' '}(−{course.discount}%)
                        </span>
                      )}
                    </div>
                    <button className="academy-course-pricing__btn" onClick={() => setIsPopupOpen(true)}>Enroll Now</button>
                  </div>
                )}
              </div>

              {/* Right Column: Course Image */}
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

        {/* Overview Section */}
        {course.longDescription && (
          <section className="academy-section academy-overview">
            <div className="academy-container">
              <h2 className="academy-section-heading">Course Overview</h2>
              <p className="academy-overview__text">{course.longDescription}</p>
            </div>
          </section>
        )}

        {/* Curriculum Section */}
        {course.curriculum && course.curriculum.length > 0 && (
          <section className="academy-section academy-curriculum-section">
            <div className="academy-container">
              <h2 className="academy-section-heading">Curriculum</h2>
              <CurriculumAccordion items={course.curriculum} />
            </div>
          </section>
        )}

        {/* Instructor Section */}
        {course.instructor && (
          <section className="academy-section academy-instructor-section">
            <div className="academy-container">
              <h2 className="academy-section-heading">Meet Your Instructor</h2>
              <InstructorSection instructor={course.instructor} />
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {course.faq && course.faq.length > 0 && (
          <section className="academy-section academy-faq-section">
            <div className="academy-container">
              <h2 className="academy-section-heading">Frequently Asked Questions</h2>
              <FAQAccordion items={course.faq} />
            </div>
          </section>
        )}
      </main>
      <Footer />
      {isPopupOpen && (
        <EnrollmentPopup
          courseId={course.id}
          courseTitle={course.title}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}

