// src/config/endpoints.ts

// Get API base URL from environment variable with validation
const API_BASE_URL =
  import.meta.env.VITE_APP_API_BASE_URL_AWS ||
  import.meta.env.VITE_APP_API_BASE_URL 
 

export const API_ENDPOINTS = {
  // =========================
  // HERO
  // =========================
  HERO: {
    GET_ALL: `${API_BASE_URL}/hero`,
  },

  // =========================
  // COURSES
  // =========================
  COURSES: {
    // Get all courses
    GET_ALL: `${API_BASE_URL}/courses`,

    // Get all categories
    GET_ALL_CATEGORIES: `${API_BASE_URL}/courses/categories/all`,

    // Get courses by category
    GET_BY_CATEGORY: (categoryName: string) =>
      `${API_BASE_URL}/courses/category/${encodeURIComponent(categoryName)}`,

    // Get course details
    GET_DETAILS: (courseId: string) =>
      `${API_BASE_URL}/courses/${courseId}`,
  },

  // =========================
  // GALLERY
  // =========================
  GALLERY: {
    // Get all gallery items
    GET_ALL: `${API_BASE_URL}/gallery`,

    // Get gallery details
    GET_DETAILS: (galleryId: string) =>
      `${API_BASE_URL}/gallery/${galleryId}`,
  },

  // =========================
  // EVENTS
  // =========================
  EVENTS: {
    // Get all events
    GET_ALL: `${API_BASE_URL}/events`,

    // Get event details
    GET_DETAILS: (eventId: string) =>
      `${API_BASE_URL}/events/${eventId}`,
  },

  // =========================
  // CONTACT
  // =========================
  CONTACT: {
    // Submit contact enquiry
    SUBMIT: `${API_BASE_URL}/contact-management/submit`,

    // Get reviews by submission type
    GET_REVIEWS: `${API_BASE_URL}/contact-management?submission_type=review`,

    // Get reviews
    // REVIEWS: () =>
    //   `${API_BASE_URL}/contact-management/reviews/`,

    // // Get reviews summary
    // REVIEWS_SUMMARY: () =>
    //   `${API_BASE_URL}/contact-management/reviews-summary`,
  },

  // =========================
  // PUBLIC
  // =========================
  PUBLIC: {
    // Get courses (optionally filtered by category)
    COURSES: (storeId: string, category: string) =>
      category === "all" || !category
        ? `${API_BASE_URL}/courses`
        : `${API_BASE_URL}/courses/category/${encodeURIComponent(category)}`,

    // Enroll in course
    ENROLL: (courseId: string) =>
      `${API_BASE_URL}/courses/${courseId}/enroll`,
  },

  // =========================
  // NEWS
  // =========================
  NEWS: {
    // Get all news
    GET_ALL: `${API_BASE_URL}/news/category/news`,

    // Get news details
    GET_DETAILS: (newsId: string) =>
      `${API_BASE_URL}/news/${newsId}`,
  },

  // =========================
  // BLOG
  // =========================
  BLOG: {
    // Get all blog posts
    GET_ALL: `${API_BASE_URL}/news/category/blog`,

    // Get blog details
    GET_DETAILS: (blogId: string) =>
      `${API_BASE_URL}/news/${blogId}`,
  },
  
  // =========================
  // INSTRUCTORS
  // =========================
  INSTRUCTORS: {
    // Get all instructors from the requested host
    GET_ALL: 'http://18.60.105.32/api/instructors',

    // Get instructor details
    GET_DETAILS: (instructorId: string) => `http://18.60.105.32/api/instructors/${instructorId}`,
  },
  
  // =========================
  // DEMO
  // =========================
  DEMO: {
    // Demo endpoint
    GET: `${API_BASE_URL}/demo`,
    // POST (submit) to demo
    POST: `${API_BASE_URL}/demo`,
  },
  
};

export default API_ENDPOINTS;