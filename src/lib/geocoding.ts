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

