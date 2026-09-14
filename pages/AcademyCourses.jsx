import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import { useAcademyData, useShopData } from "../context/AcademyContext";

import AcademyHeader from "../components/AcademyHeader";
import AcademyHero from "../components/AcademyHero";
import CategoryFilterBar from "../components/CategoryFilterBar";
import CourseGrid from "../components/CourseGrid";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

import "../styles/academy.css";

export default function AcademyCourses() {
  // =========================
  // ROUTER
  // =========================

  const [searchParams, setSearchParams] = useSearchParams();
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const coursesSectionRef = useRef(null);

  // =========================
  // CONTEXT DATA
  // =========================

  const { categories, courses, loading, error, getCoursesByCategory } =
    useAcademyData();

  const [categoryCourses, setCategoryCourses] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const { allData } = useShopData();
  console.log(allData, "data");

  // =========================
  // ACTIVE CATEGORY
  // =========================

  const getCategoryName = (category) =>
    typeof category === "string" ? category : category?.name || "";

  const getCategorySlug = (category) =>
    getCategoryName(category)
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const decodeCategoryParam = (category) => {
    try {
      return decodeURIComponent(category);
    } catch {
      return category;
    }
  };

  const rawCategoryParam = categoryName || searchParams.get("category") || "all";
  const categoryParam = decodeCategoryParam(rawCategoryParam);

  // =========================
  // HERO MEDIA
  // =========================

  const homeMedia = useMemo(() => {
    if (!allData?.home_media || allData.home_media.length === 0) {
      return null;
    }

    const academyShopType = allData?.shop_details?.shop_type?.find(
      (t) => t.slug === "academy" || t.name?.toLowerCase() === "academy",
    );

    const matched = allData.home_media.find(
      (m) => m.shop_type_id === academyShopType?.shop_type_id,
    );

    return matched || allData.home_media[0];
  }, [allData]);

  // =========================
  // SHOP NAME
  // =========================

  const shopName = allData?.shop_details?.shopname || "Academy";

  // =========================
  // NORMALIZE CATEGORY DATA
  // =========================

  const allCategories = categories?.data || [];

  const normalizedCategories = allCategories
    .map((cat) => {
      const name = getCategoryName(cat);

      return {
        id: name,
        name,
        slug: getCategorySlug(cat),
      };
    })
    .filter((cat) => cat.id && cat.name);

  const activeCategory =
    categoryParam === "all"
      ? "all"
      : normalizedCategories.find(
          (cat) => cat.id === categoryParam || cat.slug === categoryParam,
        )?.name || categoryParam;

  useEffect(() => {
    let isActive = true;

    const fetchCategoryCourses = async () => {
      if (activeCategory === "all") {
        setCategoryCourses([]);
        return;
      }

      setCategoryLoading(true);
      setCategoryError("");

      try {
        const data = await getCoursesByCategory(activeCategory);

        if (isActive) {
          setCategoryCourses(data);
        }
      } catch {
        if (isActive) {
          setCategoryError("Failed to load category courses.");
          setCategoryCourses([]);
        }
      } finally {
        if (isActive) {
          setCategoryLoading(false);
        }
      }
    };

    fetchCategoryCourses();

    return () => {
      isActive = false;
    };
  }, [activeCategory, getCoursesByCategory]);

  // =========================
  // NORMALIZE COURSE DATA
  // =========================

  const coursesSource =
    activeCategory === "all" ? courses?.data || [] : categoryCourses;

  const allCourses = coursesSource.map((course) => ({
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

  const filteredCourses =
    activeCategory === "all"
      ? allCourses
      : allCourses;

  // =========================
  // SCROLL TO COURSES SECTION
  // =========================

  const scrollToCourses = useCallback(() => {
    setTimeout(() => {
      if (coursesSectionRef.current) {
        coursesSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 120);
  }, []);

  useEffect(() => {
    // When a category route is accessed or scrollToCourses state is passed, auto-scroll to courses
    if (categoryName || location.state?.scrollToCourses) {
      scrollToCourses();
    }
  }, [categoryName, location.state?.scrollToCourses, scrollToCourses]);

  // =========================
  // HANDLE CATEGORY CHANGE
  // =========================

  const handleCategoryChange = (categoryId) => {
    if (categoryId === "all") {
      setSearchParams({});
      navigate("/academy/courses", { state: { scrollToCourses: true } });
    } else {
      navigate(`/academy/courses/category/${encodeURIComponent(categoryId)}`, {
        state: { scrollToCourses: true },
      });
    }
    scrollToCourses();
  };

  return (
    <>
      <Helmet>
        <title>Courses | {shopName}</title>

        <meta
          name="description"
          content="Browse our complete catalog of professional courses."
        />
      </Helmet>

      <main className="academy-page">
        {/* Header */}

        <AcademyHeader />

        {/* Hero */}

        <AcademyHero
          title="Our Courses"
          subtitle="Browse our complete catalog of professional courses"
          media={homeMedia}
          showCTA={false}
        />

        {/* Courses */}

        <section
          ref={coursesSectionRef}
          id="courses-section"
          className="academy-courses-section"
        >
          <div className="academy-container">
            <div className="academy-section-header">
              <h2 className="academy-section-title">
                {activeCategory === "all" ? "All Courses" : activeCategory}
              </h2>
            </div>

            {/* Category Filter */}

            <CategoryFilterBar
              categories={normalizedCategories}
              active={activeCategory}
              onChange={handleCategoryChange}
            />

            {/* Loading */}

            {(loading || categoryLoading) && (
              <p className="academy-loading">Loading courses...</p>
            )}

            {/* Error */}

            {(error || categoryError) && (
              <p className="academy-error">{error || categoryError}</p>
            )}

            {/* Empty */}

            {!loading &&
              !categoryLoading &&
              !error &&
              filteredCourses.length === 0 && (
              <p className="academy-empty">No courses found.</p>
            )}

            {/* Course Grid */}

            <CourseGrid courses={filteredCourses} />
          </div>
        </section>

        {/* CTA */}

        <CTASection />
      </main>

      {/* Footer */}

      <Footer />
    </>
  );
}
