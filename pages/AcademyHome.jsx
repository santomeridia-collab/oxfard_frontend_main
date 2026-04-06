import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AcademyHeader from '../components/AcademyHeader';
import AcademyHero from '../components/AcademyHero';
import ApplyForDemoPopup from '../components/ApplyForDemoPopup';
import CategoryFilterBar from '../components/CategoryFilterBar';
import CourseGrid from '../components/CourseGrid';
import AcademyPagination from '../components/AcademyPagination';
import CTASection from '../components/CTASection';
import ReviewsSection from '../components/ReviewsSection';
import { useShopData, useStore } from '../context/AcademyContext';
import Footer from '../components/Footer';
import '../styles/academy.css';

export default function AcademyHome() {
  const [active, setActive] = useState('all');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showApplyForDemoModal, setShowApplyForDemoModal] = useState(false);
  const itemsPerPage = 6;

  // shop-wide data from backend (GET_ALL_DATA)
  const { allData, error } = useShopData();

  // when shop data arrives, normalize into component-friendly shape
  useEffect(() => {
    if (!allData) return;

    const normalizedCourses = (allData.courses || []).map((c) => ({
      ...c,
      id: c.course_id,
      image: c.image_url,
      category: c.category?.name || '',
      studyMode: c.study_mode,
      shortDescription: c.description || '',
      price: c.final_price || c.price,
      category_id: String(c.category_id),
      intakeDates: Array.isArray(c.intake_dates) ? c.intake_dates.join(', ') : (c.intake_dates || ''),
    }));

    const normalizedCats = (allData.course_categories || []).map((cat) => ({
      id: String(cat.category_id),
      name: cat.name,
    }));

    setCourses(normalizedCourses);
    setCategories(normalizedCats);
    setInstructors(allData.instructors || []);
    setLoading(false);
  }, [allData]);

  useEffect(() => {
    if (loading) return;
    const targets = document.querySelectorAll(
      '.academy-courses-section, .academy-process-section, .academy-reviews-section, .academy-cta, .academy-grid'
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('academy-animate', 'is-visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    targets.forEach((el) => {
      el.classList.add('academy-animate');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  // filter based on category id
  const filtered =
    active === 'all' ? courses : courses.filter((c) => c.category_id === active);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [active]);

  // Scroll to top of categories section when page changes
  useEffect(() => {
    // Only scroll if we are not on the first load (categories being empty)
    if (courses.length > 0) {
      const section = document.querySelector('.academy-courses-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage]);

  // Get home_media - try to match shop type, fallback to first available
  const getHomeMedia = () => {
    if (!allData?.home_media || allData.home_media.length === 0) return null;

    const academyShopType = allData?.shop_details?.shop_type?.find((t) =>
      t.slug === 'academy' || t.name?.toLowerCase() === 'academy'
    );

    const matched = allData.home_media.find(m =>
      m.shop_type_id === academyShopType?.shop_type_id
    );

    return matched || allData.home_media[0];
  };

  const homeMedia = getHomeMedia();
  const shopName = allData?.shop_details?.shopname || 'Academy';

  return (
    <>
      <Helmet>
        <title>Home | {shopName}</title>
        <meta name="description" content="Professional courses for skill growth. Explore web development, data science, design, and business courses. Enroll and start learning today." />
      </Helmet>
      <main className="academy-page">
        <AcademyHeader />
        <AcademyHero
          title="Professional Courses for Skill Growth"
          subtitle="Develop expertise in web development, data science, design, and business"
          media={homeMedia}
          onApplyForDemo={() => setShowApplyForDemoModal(true)}
        />

        <section className="academy-courses-section">
          <div className="academy-container">
            <div className="academy-section-header">
              <h2 className="academy-section-title">Explore Our Courses</h2>
            </div>

            <CategoryFilterBar categories={categories} active={active} onChange={setActive} />

            {loading && <p className="academy-loading">Loading courses...</p>}
            {error && <p className="academy-error">Failed to load data: {error}</p>}
            <CourseGrid courses={currentItems} />

            <AcademyPagination
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>

        {/* How to Apply Section */}
        <section className="academy-process-section">
          <div className="academy-container">
            <div className="academy-process-header">
              <h2 className="academy-section-title">How to Apply for a Course</h2>
              <p className="academy-process-subtitle">
                Follow these simple steps to enroll in your desired course.
              </p>
            </div>
            <div className="academy-process-grid">
              {/* Step 1 */}
              <div className="academy-process-card">
                <div className="academy-process-number">1</div>
                <h4 className="academy-process-step-title">Choose Your Course</h4>
                <p className="academy-process-step-desc">Browse all available courses and choose the one that matches your interest.</p>
              </div>
              {/* Step 2 */}
              <div className="academy-process-card">
                <div className="academy-process-number">2</div>
                <h4 className="academy-process-step-title">Check Requirements</h4>
                <p className="academy-process-step-desc">Read the course details, duration, and eligibility requirements carefully.</p>
              </div>
              {/* Step 3 */}
              <div className="academy-process-card">
                <div className="academy-process-number">3</div>
                <h4 className="academy-process-step-title">Submit Application</h4>
                <p className="academy-process-step-desc">Click on Apply Now and submit the required details in the application form.</p>
              </div>
              {/* Step 4 */}
              <div className="academy-process-card">
                <div className="academy-process-number">4</div>
                <h4 className="academy-process-step-title">Get Verified</h4>
                <p className="academy-process-step-desc">Our team will review your application and verify your information.</p>
              </div>
              {/* Step 5 */}
              <div className="academy-process-card">
                <div className="academy-process-number">5</div>
                <h4 className="academy-process-step-title">Start Learning</h4>
                <p className="academy-process-step-desc">Once approved, you can access the course and begin your learning journey.</p>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection />
      </main>
      <Footer />
      {showApplyForDemoModal && (
        <ApplyForDemoPopup
          courses={courses}
          onClose={() => setShowApplyForDemoModal(false)}
        />
      )}
    </>
  );
}
