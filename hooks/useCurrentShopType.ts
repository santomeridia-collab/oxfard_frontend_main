import { useSearchParams } from "react-router-dom";
import { useAcademyData } from "../context/AcademyContext";

/**
 * Returns the currently selected shop type for the Academy.
 * Logic: Usually, if we are in the Academy module, the shop type is always 'academy'.
 * We provide this hook for compatibility with existing components that check for shop type.
 */
export function useCurrentShopType() {
    const { allData } = useAcademyData();
    const [searchParams] = useSearchParams();

    // In many cases, we can just return the academy shop type if it exists in allData
    const academyType = allData?.shop_details?.shop_type?.find((t: any) =>
        t.slug === 'academy' || t.name?.toLowerCase() === 'academy'
    );

    return academyType || { shop_type_id: "academy", slug: "academy", name: "Academy" };
}
