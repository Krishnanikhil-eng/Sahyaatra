export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Coordinate mapping for specific locations to ensure absolute weather accuracy.
 * This is the EXCLUSIVE source for weather coordinates.
 */
export const COORDINATE_MAPPING: Record<string, Coordinates> = {
  // Goa
  "Baga Beach, North Goa": { lat: 15.5553, lon: 73.7517 },
  "Palolem Beach, South Goa": { lat: 15.0100, lon: 74.0232 },
  "Anjuna Beach, North Goa": { lat: 15.5733, lon: 73.7412 },
  "Fort Aguada, North Goa": { lat: 15.4925, lon: 73.7733 },
  
  // Telangana
  "Golconda Fort, Telangana": { lat: 17.3833, lon: 78.4011 },
  "Charminar, Telangana": { lat: 17.3616, lon: 78.4747 },
  "Birla Mandir, Telangana": { lat: 17.4062, lon: 78.4691 },
  "Salar Jung Museum, Telangana": { lat: 17.3713, lon: 78.4803 },
  "Hussain Sagar Lake, Telangana": { lat: 17.4239, lon: 78.4738 },

  // Kerala
  "Munnar, Kerala": { lat: 10.0889, lon: 77.0595 },
  "Alleppey Backwaters, Kerala": { lat: 9.4981, lon: 76.3329 },
  "Fort Kochi, Kerala": { lat: 9.9658, lon: 76.2421 },
  "Varkala Beach, Kerala": { lat: 8.7303, lon: 76.7058 },

  // Rajasthan
  "Hawa Mahal, Rajasthan": { lat: 26.9239, lon: 75.8267 },
  "City Palace, Rajasthan": { lat: 26.9258, lon: 75.8237 },
  "Amer Fort, Rajasthan": { lat: 26.9855, lon: 75.8513 },
  "Jaisalmer Fort, Rajasthan": { lat: 26.9124, lon: 70.9127 },
};

/**
 * Get coordinates for a given place name based on our mapping.
 * @param placeName The name of the place (e.g. "Baga Beach, North Goa")
 * @returns Coordinates object or undefined if not found
 */
export function getCoordsForPlace(placeName: string): Coordinates | undefined {
  // Try exact match first
  if (COORDINATE_MAPPING[placeName]) {
    return COORDINATE_MAPPING[placeName];
  }
  
  // Try partial match (case insensitive)
  const normalizedSearch = placeName.toLowerCase();
  const foundKey = Object.keys(COORDINATE_MAPPING).find(key => 
    key.toLowerCase().includes(normalizedSearch) || 
    normalizedSearch.includes(key.toLowerCase())
  );
  
  return foundKey ? COORDINATE_MAPPING[foundKey] : undefined;
}
