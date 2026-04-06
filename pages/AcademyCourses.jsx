import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStore, useShopData } from '../context/AcademyContext';
import API_ENDPOINTS from '../config/endpoints';
import AcademyHeader from '../components/AcademyHeader';
import AcademyHero from '../components/AcademyHero';
import CategoryFilterBar from '../components/CategoryFilterBar';
import CourseGrid from '../components/CourseGrid';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import '../styles/academy.css';

export default function AcademyCourses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { storeId } = useStore();
  const { allData } = useShopData();

  // Get home_media for hero background
  const homeMedia = React.useMemo(() => {
    if (!allData?.home_media || allData.home_media.length === 0) return null;
    const academyShopType = allData?.shop_details?.shop_type?.find((t) =>
      t.slug === 'academy' || t.name?.toLowerCase() === 'academy'
    );
    const matched = allData.home_media.find(m =>
      m.shop_type_id === academyShopType?.shop_type_id
    );
    return matched || allData.home_media[0];
  }, [allData]);

  const shopName = allData?.shop_details?.shopname || 'Academy';
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get active category from query parameter
  const activeCategory = searchParams.get('category') || 'all';

  // Fetch courses from public API
  useEffect(() => {
    if (!storeId) return;

    setLoading(true);
    setError(null);

    // Build API URL with optional category filter
    const url = API_ENDPOINTS.PUBLIC.COURSES(storeId, activeCategory);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      })
      .then((data) => {
        const coursesList = Array.isArray(data) ? data : data.data || [];

        // Normalize courses for display
        const normalized = coursesList.map((c) => ({
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

        setCourses(normalized);
      })
      .catch((err) => {
        console.error('Failed to load courses:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [storeId, activeCategory]);

  // Fetch categories from allData and normalize
  useEffect(() => {
    if (allData?.course_categories) {
      const normalizedCats = allData.course_categories.map(cat => ({
        ...cat,
        id: String(cat.category_id)
      }));
      setCategories(normalizedCats);
    }
  }, [allData]);

  const handleCategoryChange = (categoryId) => {
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  return (
    <>
      <Helmet>
        <title>Courses | {shopName}</title>
        <meta name="description" content="Browse our complete catalog of professional courses. Find the right course for your career in web development, data science, design, and more." />
      </Helmet>
      <main className="academy-page">
        <AcademyHeader />
        <AcademyHero
          title="Our Courses"
          subtitle="Browse our complete catalog of professional courses"
          media={homeMedia}
          showCTA={false}
        />

        <section className="academy-courses-section">
          <div className="academy-container">
            <div className="academy-section-header">
              <h2 className="academy-section-title">
                {activeCategory === 'all' ? 'All Courses' : 'Filtered Courses'}
              </h2>
            </div>

            <CategoryFilterBar
              categories={categories}
              active={activeCategory}
              onChange={handleCategoryChange}
            />

            {loading && <p className="academy-loading">Loading courses...</p>}
            {error && <p className="academy-error">Failed to load courses: {error}</p>}
            <CourseGrid courses={courses} />
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
