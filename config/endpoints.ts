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
};

export default API_ENDPOINTS;