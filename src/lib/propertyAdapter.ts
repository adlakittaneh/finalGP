import { PropertyCardProps } from "@/components/PropertyCard";

/**
 * Backend Property Response Interface
 * This matches the actual backend response structure
 */
export interface BackendProperty {
  id: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  cityId: number;
  cityName: string;
  countryName: string;
  propertyType: "LAND" | "APARTMENT" | "HOUSE" | "OFFICE" | "STORE";
  listingType: "RENT" | "SELL";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  yearBuilt: number;
  furnished: boolean;
  status: string;
  approved: boolean;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  media: Array<{
    id: number;
    mediaUrl: string;
    displayOrder: number;
    createdAt: string;
  }>;
}

/**
 * Backend Pageable Response Interface
 */
export interface BackendPageableResponse {
  totalElements: number;
  totalPages: number;
  pageable: {
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  content: BackendProperty[];
  number: number;
  numberOfElements: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Maps listingType from backend to Arabic display text
 */
function mapListingType(listingType: "RENT" | "SELL" | string): string {
  if (listingType === "SELL" || listingType === "sell" || listingType?.toUpperCase() === "SELL") {
    return "للبيع";
  }
  if (listingType === "RENT" || listingType === "rent" || listingType?.toUpperCase() === "RENT") {
    return "للإيجار";
  }
  // Fallback
  return listingType || "للإيجار";
}

/**
 * Adapter function to convert backend property data to PropertyCard format
 * This function handles the mapping between backend enum values and frontend display values
 */
export function adaptBackendPropertyToPropertyCard(
  backendProperty: BackendProperty
): PropertyCardProps {
  // Ensure listingType is properly mapped
  const listingType = backendProperty.listingType || "RENT";
  const mappedType = mapListingType(listingType);
  
  // Ensure city and country names are properly extracted
  const cityName = backendProperty.cityName || "";
  const countryName = backendProperty.countryName || "";
  
  return {
    id: String(backendProperty.id),
    type: mappedType, // "للبيع" or "للإيجار"
    propertyType: backendProperty.propertyType, // Keep as-is (LAND, APARTMENT, etc.)
    title: backendProperty.title || "", // English title
    titleAr: backendProperty.titleAr || "", // Arabic title
    city: cityName, // City name from backend
    capital: countryName, // Country name from backend
    price: backendProperty.price || 0,
    images:
      Array.isArray(backendProperty.media) && backendProperty.media.length > 0
        ? backendProperty.media
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((m) => m.mediaUrl)
        : [],
    arabicDescription: backendProperty.descriptionAr,
    englishDescription: backendProperty.description,
    area: backendProperty.area,
    bedrooms: backendProperty.bedrooms,
    bathrooms: backendProperty.bathrooms,
    parking: backendProperty.parking,
    yearBuilt: backendProperty.yearBuilt,
    furnished: backendProperty.furnished,
  };
}

/**
 * Adapter function to convert a pageable response to an array of PropertyCardProps
 */
export function adaptBackendResponseToPropertyCards(
  response: BackendPageableResponse
): PropertyCardProps[] {
  if (!response.content || !Array.isArray(response.content)) {
    return [];
  }

  return response.content.map(adaptBackendPropertyToPropertyCard);
}

/**
 * Helper function to get the appropriate title based on language
 */
export function getPropertyTitle(
  backendProperty: BackendProperty,
  language: "AR" | "US"
): string {
  return language === "AR"
    ? backendProperty.titleAr || backendProperty.title
    : backendProperty.title || backendProperty.titleAr;
}

