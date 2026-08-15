// src/context/AcademyContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

import API_ENDPOINTS from "../config/endpoints";

// =========================
// TYPES
// =========================

interface AcademyContextType {
  heroData: any;
  categories: any;
  courses: any;
  gallery: any;
  events: any;
  instructors: any;
  news: any;
  blog: any;
  allData: any;
  storeId: string;

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

  getInstructorDetails: (instructorId: string) => Promise<any>;

  getNewsDetails: (newsId: string) => Promise<any>;

  getBlogDetails: (blogId: string) => Promise<any>;

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
  initialStoreId = "",
}: {
  children: ReactNode;
  initialStoreId?: string;
}) {
  // =========================
  // STATES
  // =========================

  const [storeId] = useState<string>(
    initialStoreId || import.meta.env.VITE_APP_STORE_ID || ""
  );

  const [heroData, setHeroData] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [courses, setCourses] = useState<any>(null);
  const [gallery, setGallery] = useState<any>(null);
  const [events, setEvents] = useState<any>(null);
  const [instructors, setInstructors] = useState<any>(null);
  const [news, setNews] = useState<any>(null);
  const [blog, setBlog] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("academy-theme");
    return (savedTheme as "light" | "dark") || "light";
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
          instructorsRes,
          newsRes,
          blogRes,
        ] = await Promise.all([
          fetch(API_ENDPOINTS.HERO.GET_ALL),

          fetch(API_ENDPOINTS.COURSES.GET_ALL_CATEGORIES),

          fetch(API_ENDPOINTS.COURSES.GET_ALL),

          fetch(API_ENDPOINTS.GALLERY.GET_ALL),

          fetch(API_ENDPOINTS.EVENTS.GET_ALL),

          fetch(API_ENDPOINTS.INSTRUCTORS.GET_ALL),

          fetch(API_ENDPOINTS.NEWS.GET_ALL),

          fetch(API_ENDPOINTS.BLOG.GET_ALL),
        ]);

        // =========================
        // CONVERT TO JSON
        // =========================

        const heroJson = await heroRes.json();
        const categoriesJson = await categoriesRes.json();
        const coursesJson = await coursesRes.json();
        const galleryJson = await galleryRes.json();
        const eventsJson = await eventsRes.json();
        const instructorsJson = await instructorsRes.json();
        const newsJson = await newsRes.json();
        const blogJson = await blogRes.json();

        // =========================
        // SAVE DATA
        // =========================

        setHeroData(heroJson);

        setCategories(categoriesJson);

        setCourses(coursesJson);

        setGallery(galleryJson);

        setEvents(eventsJson);

        setInstructors(instructorsJson);

        setNews(newsJson);

        setBlog(blogJson);
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
  // ALLDATA MEMOIZED
  // =========================

  const allData = useMemo(() => {
    const catsArray = categories?.data || [];
    const uniqueCats = Array.from(new Set(catsArray.map((c: any) => typeof c === 'string' ? c : c.name)));
    const mappedCategories = uniqueCats.map((cat: any) => ({
      category_id: cat,
      name: cat,
      slug: cat.toLowerCase(),
    }));

    const heroesArray = heroData?.data || [];
    const homeMedia = heroesArray.map((hero: any) => ({
      shop_type_id: "academy",
      video_link: "",
      image_1: hero.image,
      image_2: "",
      image_3: "",
    }));

    return {
      shop_details: {
        // shopname: import.meta.env.VITE_APP_SHOP_NAME || "OWEOC",
        shopname: (
    <>
      Oxford Women Empowerment
      <br />
      Online & Offline Center
    </>
  ),
        shopcontactnumber: "+91 9447260668",
        shop_type: [
          { shop_type_id: "academy", slug: "academy", name: "Academy" }
        ],
        display_contact_numbers: [
          { label: "Phone", value: "+91 9447260668" }
        ],
        display_contact_emails: [
          { label: "Email", value: "oxfordwdr@gmail.com" }
        ]
      },
      logos: [
        {
          file_url: "https://lms-videos-jahfar.s3.ap-south-1.amazonaws.com/hero/1779087457785-Gemini_Generated_Image_2agk9c2agk9c2agk%20%281%29.png"
        }
      ],
      social_media_links: {
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        youtube: "https://youtube.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com"
      },
      course_categories: mappedCategories,
      home_media: homeMedia,
      gallery: gallery?.data || [],
      events: events?.data || [],
      instructors: instructors?.data || [],
      news: news?.data || [],
      blogs: blog?.data || [],
      content_documents: []
    };
  }, [heroData, categories, courses, gallery, events, instructors, news, blog]);

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

      const res = await response.json();
      return res?.data || [];
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

      const res = await response.json();
      return res?.data || null;
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

      const res = await response.json();
      return res?.data || null;
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

      const res = await response.json();
      return res?.data || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // =========================
  // GET NEWS DETAILS
  // =========================

  const getNewsDetails = async (newsId: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.NEWS.GET_DETAILS(newsId)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch news details");
      }

      const res = await response.json();
      return res?.data || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // =========================
  // GET BLOG DETAILS
  // =========================

  const getBlogDetails = async (blogId: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.BLOG.GET_DETAILS(blogId)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch blog details");
      }

      const res = await response.json();
      return res?.data || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // =========================
  // GET INSTRUCTOR DETAILS
  // =========================

  const getInstructorDetails = async (instructorId: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.INSTRUCTORS.GET_DETAILS(instructorId)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch instructor details");
      }

      const res = await response.json();
      return res?.data || null;
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
        instructors,
        news,
        blog,
        allData,
        storeId,

        loading,
        error,

        theme,
        toggleTheme,

        getCoursesByCategory,
        getCourseDetails,
        getGalleryDetails,
        getEventDetails,
        getInstructorDetails,
        getNewsDetails,
        getBlogDetails,

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