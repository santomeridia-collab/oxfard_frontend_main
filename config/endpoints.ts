// Get API base URL from environment variable with validation
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL_AWS || import.meta.env.VITE_APP_API_BASE_URL;

export const API_ENDPOINTS = {
    GENERAL: {
        GET_ALL_DATA: (storeId: string) => `${API_BASE_URL}/get-all/shops/${storeId}/all-data`,
    },
    PUBLIC: {
        /** Pass subdomain only for *.localhost so backend can resolve by subdomain (backend does not treat .localhost as apkakhata.com). */
        RESOLVE_SHOP: (host: string, subdomain?: string) => {
            const url = new URL(`${API_BASE_URL}/public/resolve-shop`);
            url.searchParams.set("host", host);
            if (subdomain != null && subdomain !== "") url.searchParams.set("subdomain", subdomain);
            return url.toString();
        },
        /** public courses list with optional category filter */
        COURSES: (storeId: string, categoryId?: string) => {
            let url = `${API_BASE_URL}/academy/public/courses?store_id=${storeId}`;
            // Defensive check against string "undefined" or "null" which can happen during serialization
            const isValidCategory = categoryId &&
                categoryId !== 'all' &&
                categoryId !== 'undefined' &&
                categoryId !== 'null';

            if (isValidCategory) {
                url += `&category_id=${categoryId}`;
            }
            return url;
        },
        /** enroll in a course */
        ENROLL: (courseId: string) => `${API_BASE_URL}/academy/public/courses/${courseId}/enroll`,
    },
    CONTACT: {
        SUBMIT: `${API_BASE_URL}/contact-management/submit`,
        /** GET reviews for the store (contact-management) */
        REVIEWS: (storeId: string) => `${API_BASE_URL}/contact-management/reviews?store_id=${storeId}`,
        /** GET aggregate stats for approved reviews (total_count, average_rating, rating_1..rating_5) */
        REVIEWS_SUMMARY: (storeId: string) => `${API_BASE_URL}/contact-management/reviews/summary?store_id=${storeId}`,
    }
};

export default API_ENDPOINTS;
