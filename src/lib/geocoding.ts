/**
 * Utility functions for OpenStreetMap Nominatim API (100% free)
 * Nominatim is a search engine for OpenStreetMap data
 */

interface LocationData {
  lat: number;
  lng: number;
}

// Helper function to safely format coordinates
const formatCoordinate = (coord: number | string | undefined | null): string => {
  if (coord === null || coord === undefined || coord === '') {
    return '0.000000';
  }
  const num = typeof coord === 'number' ? coord : Number(coord);
  if (isNaN(num)) {
    return '0.000000';
  }
  return num.toFixed(6);
};

/**
 * Format address to be short and clear: Country, City, District
 * @param addressData The full address data from Nominatim
 * @returns Formatted address string
 */
function formatAddress(addressData: any): string {
  const address = addressData.address || {};
  
  // Build address components in order: Country, City, District/Neighborhood
  const components: string[] = [];
  
  // Country
  if (address.country) {
    components.push(address.country);
  }
  
  // City or town
  if (address.city) {
    components.push(address.city);
  } else if (address.town) {
    components.push(address.town);
  } else if (address.village) {
    components.push(address.village);
  } else if (address.municipality) {
    components.push(address.municipality);
  }
  
  // District or neighborhood
  if (address.district) {
    components.push(address.district);
  } else if (address.neighbourhood) {
    components.push(address.neighbourhood);
  } else if (address.quarter) {
    components.push(address.quarter);
  } else if (address.suburb) {
    components.push(address.suburb);
  }
  
  // If we have components, join them with ", "
  if (components.length > 0) {
    return components.join("، ");
  }
  
  // Fallback to display name if no structured data
  return addressData.display_name || '';
}

/**
 * Convert coordinates to address using OpenStreetMap Nominatim API
 * This is completely free and doesn't require an API key
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise with address information
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  try {
    // Using Nominatim API - completely free, no API key needed
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Aqar Property App' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch address");
    }

    const data = await response.json();

    if (data && data.display_name) {
      // Format the address to be short and clear
      const formattedAddress = formatAddress(data);
      return formattedAddress || data.display_name;
    } else {
      // If no results, return coordinates as fallback
      return `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`;
    }
  } catch (error) {
    console.error("Error in reverseGeocode:", error);
    // Return coordinates as fallback
    return `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`;
  }
}

/**
 * Convert address to coordinates using OpenStreetMap Nominatim API
 * @param address Address string
 * @returns Promise with coordinates
 */
export async function geocode(
  address: string
): Promise<LocationData | null> {
  try {
    // Using Nominatim API - completely free, no API key needed
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1&accept-language=ar`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Aqar Property App' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch coordinates");
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Error in geocode:", error);
    return null;
  }
}

/**
 * Interface for detailed address components from Google Geocoding API
 */
export interface DetailedAddress {
  street?: string;
  city?: string;
  country?: string;
  fullAddress: string;
  formattedAddress: string;
}

/**
 * Format Google Geocoding API result to a detailed address
 * @param result Google Geocoding API result
 * @returns Formatted address object with street, city, country, and full address
 */
function formatGoogleAddress(result: any): DetailedAddress {
  const addressComponents = result.address_components || [];
  const formattedAddress = result.formatted_address || '';
  
  let street = '';
  let city = '';
  let country = '';
  
  // Extract address components
  addressComponents.forEach((component: any) => {
    const types = component.types || [];
    
    // Street address
    if (types.includes('street_number') || types.includes('route')) {
      const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
      const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
      street = [streetNumber, route].filter(Boolean).join(' ').trim();
    }
    
    // City
    if (types.includes('locality')) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_2') && !city) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_1') && !city) {
      city = component.long_name;
    }
    
    // Country
    if (types.includes('country')) {
      country = component.long_name;
    }
  });
  
  // Build full address: Street, City, Country
  const addressParts: string[] = [];
  if (street) addressParts.push(street);
  if (city) addressParts.push(city);
  if (country) addressParts.push(country);
  
  const fullAddress = addressParts.length > 0 
    ? addressParts.join('، ') 
    : formattedAddress;
  
  return {
    street: street || undefined,
    city: city || undefined,
    country: country || undefined,
    fullAddress,
    formattedAddress,
  };
}

/**
 * Convert coordinates to detailed address using Google Geocoding API
 * This provides accurate and detailed addresses with street, city, and country
 * @param lat Latitude
 * @param lng Longitude
 * @param apiKey Google Maps API key (optional, will try to get from env)
 * @returns Promise with detailed address information
 */
export async function reverseGeocodeGoogle(
  lat: number,
  lng: number,
  apiKey?: string
): Promise<DetailedAddress> {
  try {
    // Get API key from parameter or environment variable
    const GOOGLE_API_KEY = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your_api_key_here') {
      throw new Error('Google Maps API key is not configured');
    }
    
    // Use Google Geocoding API reverse geocoding
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=ar&region=ps`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch address: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Use the first result (most accurate)
      const result = data.results[0];
      return formatGoogleAddress(result);
    } else if (data.status === 'ZERO_RESULTS') {
      // No results found, return coordinates as fallback
      return {
        fullAddress: `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`,
        formattedAddress: `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`,
      };
    } else {
      throw new Error(`Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('Error in reverseGeocodeGoogle:', error);
    // Return coordinates as fallback
    return {
      fullAddress: `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`,
      formattedAddress: `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`,
    };
  }
}

