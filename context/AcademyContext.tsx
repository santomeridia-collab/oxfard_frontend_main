import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import API_ENDPOINTS from "../config/endpoints";

export interface AcademyData {
    courses: any[];
    course_categories: any[];
    instructors: any[];
    shop_details?: any;
    [key: string]: any;
}

interface AcademyContextType {
    storeId: string;
    allData: AcademyData | null;
    loading: boolean;
    error: string | null;
    currencySymbol: string;
    refetch: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

/**
 * Extract subdomain from hostname (simplified local copy)
 */
function extractSubdomain(hostname: string): string | null {
    if (hostname.includes(".localhost")) {
        const parts = hostname.split(".");
        if (parts.length >= 2 && parts[0]) return parts[0];
    }
    if (hostname === "localhost" || hostname === "127.0.0.1") return null;
    const parts = hostname.split(".");
    if (parts.length >= 3) return parts[0];
    return null;
}

/**
 * Get currency symbol from currency code
 */
function getCurrencySymbol(currencyCode: string): string {
    try {
        return (0).toLocaleString('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace(/\d/g, '').trim();
    } catch (e) {
        return '₹';
    }
}

export function AcademyProvider({ children, initialStoreId }: { children: ReactNode, initialStoreId?: string }) {
    const [storeId, setStoreId] = useState<string>(initialStoreId || "");
    const [allData, setAllData] = useState<AcademyData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currencySymbol, setCurrencySymbol] = useState('₹');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('academy-theme');
        return (savedTheme as 'light' | 'dark') || 'dark';
    });

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('academy-theme', newTheme);
            return newTheme;
        });
    }, []);

    // Apply theme to body
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const refetch = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    // 1. Resolve storeId if not provided
    useEffect(() => {
        if (initialStoreId) {
            setStoreId(initialStoreId);
            return;
        }

        const resolveShop = async () => {
            const host = window.location.hostname;
            const subdomain = extractSubdomain(host);

            if (!subdomain) {
                // Fallback for local dev if needed
                const fallbackId = import.meta.env.VITE_APP_STORE_ID;
                if (fallbackId) setStoreId(fallbackId);
                else setError("No store resolution possible");
                return;
            }

            try {
                const res = await fetch(API_ENDPOINTS.PUBLIC.RESOLVE_SHOP(host, subdomain));
                if (res.ok) {
                    const data = await res.json();
                    if (data.store_id) setStoreId(data.store_id);
                }
            } catch (err) {
                console.error("AcademyContext: Failed to resolve shop", err);
            }
        };

        resolveShop();
    }, [initialStoreId]);

    // 2. Fetch Academy Data
    useEffect(() => {
        if (!storeId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(API_ENDPOINTS.GENERAL.GET_ALL_DATA(storeId));
                if (!res.ok) throw new Error("Failed to fetch academy data");
                const data = await res.json();

                // We could also fetch courses separately here if needed, 
                // but usually all-data includes them.
                setAllData(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storeId, refreshKey]);

    // 3. Fetch Currency Symbol based on location
    useEffect(() => {
        const detectCurrency = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                if (res.ok) {
                    const data = await res.json();
                    if (data.currency) {
                        setCurrencySymbol(getCurrencySymbol(data.currency));
                    }
                }
            } catch (err) {
                console.error("AcademyContext: Failed to detect currency", err);
            }
        };
        detectCurrency();
    }, []);

    // 4. Update Favicon dynamically
    useEffect(() => {
        const logoUrl = allData?.logos?.[0]?.file_url;
        if (logoUrl) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = logoUrl;
        }
    }, [allData]);

    return (
        <AcademyContext.Provider value={{ storeId, allData, loading, error, currencySymbol, refetch, theme, toggleTheme }}>
            {children}
        </AcademyContext.Provider>
    );
}

export function useAcademyData() {
    const context = useContext(AcademyContext);
    if (context === undefined) {
        throw new Error("useAcademyData must be used within an AcademyProvider");
    }
    return context;
}

// Compatibility aliases - so we don't have to change the logic inside 20+ files
export const useShopData = useAcademyData;

export function useStore() {
    const context = useAcademyData();
    return {
        storeId: context.storeId,
        store: context.allData?.shop_details || null,
        loading: context.loading,
        error: context.error,
        currencySymbol: context.currencySymbol
    };
}
