/**
 * Shop type constants
 */
export const SHOP_TYPE_SLUGS = {
    ACADEMY: "academy",
} as const;

/** API can send image_url as string, string[], or array of { url, title?, description? } */
export type ImageUrlEntry = string | { url?: string; title?: string; description?: string };

/**
 * Normalize image entries from API formats to a consistent object array
 */
export function normalizeImageEntries(
    imageUrl: string | string[] | ImageUrlEntry[] | undefined
): { url: string; title?: string; description?: string }[] {
    if (!imageUrl) return [];
    if (typeof imageUrl === "string") {
        const trimmed = imageUrl.trim();
        return trimmed ? [{ url: trimmed }] : [];
    }
    if (!Array.isArray(imageUrl)) return [];
    const result: { url: string; title?: string; description?: string }[] = [];
    for (const entry of imageUrl) {
        if (typeof entry === "string") {
            const trimmed = entry.trim();
            if (trimmed) result.push({ url: trimmed });
        } else if (entry && typeof entry === "object" && typeof (entry as { url?: string }).url === "string") {
            const url = (entry as { url: string }).url.trim();
            if (url) {
                result.push({
                    url,
                    title: (entry as { title?: string }).title?.trim() || undefined,
                    description: (entry as { description?: string }).description?.trim() || undefined,
                });
            }
        }
    }
    return result;
}

/**
 * Interface for items that can be filtered by shop_type_id
 */
export interface ShopTypeScopedItem {
    shop_type_id?: string | null;
    [key: string]: any;
}

/**
 * Filter items by shop_type_id
 */
export function filterByShopTypeId<T extends ShopTypeScopedItem>(
    items: T[] | undefined | null,
    currentShopTypeId: string | undefined | null
): T[] {
    if (!items || items.length === 0) return [];
    return items.filter((item) => {
        const stId = item.shop_type_id;
        if (stId == null) return true;
        if (currentShopTypeId == null) return false;
        return stId == currentShopTypeId;
    });
}

/**
 * Check if the current shop type is Academy
 */
export function isAcademyShop(shopType: any): boolean {
    if (!shopType) return false;
    return shopType.slug === SHOP_TYPE_SLUGS.ACADEMY || shopType.name?.toLowerCase() === "academy";
}

/**
 * Get primary phone and email from shop_details.display_contact_numbers and display_contact_emails.
 * Uses first non-empty value in each array regardless of label. No fallback values.
 */
export function getPrimaryDisplayContact(allData: { shop_details?: { display_contact_numbers?: { label?: string; value?: string }[]; display_contact_emails?: { label?: string; value?: string }[] } } | null): { phone: string; email: string } {
    const numbers = allData?.shop_details?.display_contact_numbers ?? [];
    const emails = allData?.shop_details?.display_contact_emails ?? [];
    const phone = (numbers.find((n) => n?.value)?.value ?? "").trim();
    const email = (emails.find((e) => e?.value)?.value ?? "").trim();
    return { phone, email };
}
