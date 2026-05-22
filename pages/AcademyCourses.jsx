import React, { useMemo } from "react";

import { useSearchParams } from "react-router-dom";

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

  // =========================
  // CONTEXT DATA
  // =========================

  const { categories, courses, loading, error } = useAcademyData();

  const { allData } = useShopData();
  console.log(allData, "data");

  // =========================
  // ACTIVE CATEGORY
  // =========================

  const activeCategory = searchParams.get("category") || "all";

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

  const filteredCourses =
    activeCategory === "all"
      ? allCourses
      : allCourses.filter(
          (course) =>
            course.category?.toLowerCase() === activeCategory.toLowerCase(),
        );

  // =========================
  // HANDLE CATEGORY CHANGE
  // =========================

  const handleCategoryChange = (categoryId) => {
    if (categoryId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({
        category: categoryId,
      });
    }
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

        <section className="academy-courses-section">
          <div className="academy-container">
            <div className="academy-section-header">
              <h2 className="academy-section-title">
                {activeCategory === "all" ? "All Courses" : activeCategory}
              </h2>
            </div>

            {/* Category Filter */}

            <CategoryFilterBar
              categories={[
                {
                  id: "all",
                  name: "All",
                },

                ...allCategories.map((cat) => ({
                  id: cat,
                  name: cat,
                })),
              ]}
              active={activeCategory}
              onChange={handleCategoryChange}
            />

            {/* Loading */}

            {loading && <p className="academy-loading">Loading courses...</p>}

            {/* Error */}

            {error && <p className="academy-error">{error}</p>}

            {/* Empty */}

            {!loading && !error && filteredCourses.length === 0 && (
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
