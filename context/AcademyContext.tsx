// src/context/AcademyContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

import API_ENDPOINTS from "../config/endpoints";

// =========================
// TYPES
// =========================

interface AcademyContextType {
  heroData: any[];
  categories: any[];
  courses: any[];
  gallery: any[];
  events: any[];

  loading: boolean;
  error: string | null;

  theme: "light" | "dark";
  toggleTheme: () => void;

  // =========================
  // API FUNCTIONS
  // =========================

  getCoursesByCategory: (category: string) => Promise<any[]>;

  getCourseDetails: (courseId: string) => Promise<any>;

  getGalleryDetails: (galleryId: string) => Promise<any>;

  getEventDetails: (eventId: string) => Promise<any>;

  refetch: () => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(
  undefined
);

// =========================
// PROVIDER
// =========================

export function AcademyProvider({
  children,
}: {
  children: ReactNode;
}) {
  // =========================
  // STATES
  // =========================

  const [heroData, setHeroData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("academy-theme");
    return (savedTheme as "light" | "dark") || "dark";
  });

  // =========================
  // THEME
  // =========================

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";

      localStorage.setItem("academy-theme", newTheme);

      return newTheme;
    });
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // =========================
  // REFETCH
  // =========================

  const refetch = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // =========================
  // FETCH ALL HOME DATA
  // =========================

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          heroRes,
          categoriesRes,
          coursesRes,
          galleryRes,
          eventsRes,
        ] = await Promise.all([
          fetch(API_ENDPOINTS.HERO.GET_ALL),

          fetch(API_ENDPOINTS.COURSES.GET_ALL_CATEGORIES),

          fetch(API_ENDPOINTS.COURSES.GET_ALL),

          fetch(API_ENDPOINTS.GALLERY.GET_ALL),

          fetch(API_ENDPOINTS.EVENTS.GET_ALL),
        ]);

        // =========================
        // CONVERT TO JSON
        // =========================

        const heroJson = await heroRes.json();
        const categoriesJson = await categoriesRes.json();
        const coursesJson = await coursesRes.json();
        const galleryJson = await galleryRes.json();
        const eventsJson = await eventsRes.json();

        // =========================
        // SAVE DATA
        // =========================

        setHeroData(heroJson || []);

        setCategories(categoriesJson || []);

        setCourses(coursesJson || []);

        setGallery(galleryJson || []);

        setEvents(eventsJson || []);
      } catch (err: any) {
        console.error("AcademyContext Error:", err);

        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [refreshKey]);

  // =========================
  // GET COURSES BY CATEGORY
  // =========================

  const getCoursesByCategory = async (category: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.COURSES.GET_BY_CATEGORY(category)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch category courses");
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // =========================
  // GET COURSE DETAILS
  // =========================

  const getCourseDetails = async (courseId: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.COURSES.GET_DETAILS(courseId)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch course details");
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // =========================
  // GET GALLERY DETAILS
  // =========================

  const getGalleryDetails = async (galleryId: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.GALLERY.GET_DETAILS(galleryId)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch gallery details");
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // =========================
  // GET EVENT DETAILS
  // =========================

  const getEventDetails = async (eventId: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.EVENTS.GET_DETAILS(eventId)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <AcademyContext.Provider
      value={{
        heroData,
        categories,
        courses,
        gallery,
        events,

        loading,
        error,

        theme,
        toggleTheme,

        getCoursesByCategory,
        getCourseDetails,
        getGalleryDetails,
        getEventDetails,

        refetch,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
}

// =========================
// CUSTOM HOOK
// =========================

export function useAcademyData() {
  const context = useContext(AcademyContext);

  if (!context) {
    throw new Error(
      "useAcademyData must be used within AcademyProvider"
    );
  }

  return context;
}

// Compatibility alias
export const useShopData = useAcademyData;

export function useStore() {
  const context = useAcademyData();

  return {
    loading: context.loading,
    error: context.error,
  };
}