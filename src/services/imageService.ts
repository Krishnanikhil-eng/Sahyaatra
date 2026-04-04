/**
 * Production-grade Image service for Sahyaatra.
 * Uses a 5-tier query hierarchy to ensure specific place accuracy for 9,000+ locations.
 */
const PEXELS_API_KEY = "9WIvfcdWPVL1MG9JS8J45MW1IVfSx8cZ8BMjk8ghvs8aezKZHmuXhxkC";
const PEXELS_API_URL = "https://api.pexels.com/v1";
const UNSPLASH_ACCESS_KEY = "PDa7fpLGuSdOUmpVJyh6GSyYwdyeImsKsBmP8GgcXBg";
const UNSPLASH_API_URL = "https://api.unsplash.com";

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

interface CacheEntry {
  images: UnsplashImage[];
  timestamp: number;
}

export class ImageService {
  private static cache = new Map<string, CacheEntry>();
  private static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private static NOISY_WORDS = ["famous", "best", "top", "landmark", "monument", "tourist", "attraction", "india", "india tourism"];

  private static fallbackPool: string[] = [
    'https://images.unsplash.com/photo-1514222134-b57cbb8ce073', // Kerala
    'https://images.unsplash.com/photo-1596422846543-75c6fc18a5bf', // Jaipur
    'https://images.unsplash.com/photo-1590050752117-23a9d7fc2140', // Goa
    'https://images.unsplash.com/photo-1477587458883-47145ed94245', // Temple
    'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc', // Shimla
  ];

  /**
   * Main entry point for place images using a 5-tier discovery logic.
   */
  static async getPlaceImages(
    placeName: string,
    state: string,
    country: string = "India",
    type: string = "",
    count: number = 3
  ): Promise<UnsplashImage[]> {
    const cacheKey = `${placeName}-${state}-${type}-${count}`.toLowerCase();
    
    // 1. Check Cache with 24h TTL
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.images;
    }

    const cleanedPlace = this.sanitizeQuery(placeName);
    const cleanedState = this.sanitizeQuery(state);
    const cleanedType = this.sanitizeQuery(type);
    let finalImages: UnsplashImage[] = [];

    // Define Tiers
    const tiers = [
      // Tier 1: placeName + state + country + type
      `${cleanedPlace} ${cleanedState} ${country} ${cleanedType}`.trim(),
      // Tier 2: placeName + state + country
      `${cleanedPlace} ${cleanedState} ${country}`.trim(),
      // Tier 3: placeName + country
      `${cleanedPlace} ${country}`.trim(),
      // Tier 4: state + "tourism" + country
      `${cleanedState} tourism ${country}`.trim(),
    ];

    // Discovery Loop (Short-Circuit)
    for (const query of tiers) {
      if (finalImages.length >= count) break;
      
      const tierResults = await this.fetchFromSources(query, count - finalImages.length, cleanedPlace);
      
      // Filter & Validate
      const validResults = tierResults.filter(img => 
        this.validateRelevance(img, cleanedPlace) && 
        !finalImages.some(existing => existing.id === img.id)
      );

      finalImages = [...finalImages, ...validResults];
    }

    // Tier 5: Fallback if still empty
    if (finalImages.length === 0) {
      finalImages = this.getFallbackImages(count, cleanedPlace);
    }

    // Limit to count and cache
    const results = finalImages.slice(0, count);
    this.cache.set(cacheKey, { images: results, timestamp: Date.now() });
    
    return results;
  }

  /**
   * Remove noisy words from query strings
   */
  private static sanitizeQuery(query: any): string {
    if (!query || typeof query !== 'string') return "";
    let sanitized = query.toLowerCase();
    this.NOISY_WORDS.forEach(word => {
      sanitized = sanitized.split(word).join(" ");
    });
    return sanitized.replace(/\s+/g, ' ').trim();
  }

  /**
   * Fetch from Unsplash (Primary) and Pexels (Secondary)
   */
  private static async fetchFromSources(query: string, count: number, placeName: string): Promise<UnsplashImage[]> {
    let results: UnsplashImage[] = [];

    try {
      // Unsplash Call
      const unsplashRes = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count + 2}&orientation=landscape`,
        { headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );

      if (unsplashRes.ok) {
        const data = await unsplashRes.json();
        results = (data.results || []).map((photo: any) => ({
          id: photo.id,
          urls: photo.urls,
          alt_description: photo.alt_description || placeName,
          user: { name: photo.user.name }
        }));
      }

      // If Unsplash needs supplement, call Pexels
      if (results.length < count) {
        const pexelsRes = await fetch(
          `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${count + 2}&orientation=landscape`,
          { headers: { 'Authorization': PEXELS_API_KEY } }
        );

        if (pexelsRes.ok) {
          const data = await pexelsRes.json();
          const pexelsPhotos = (data.photos || []).map((p: any) => ({
            id: `pexels_${p.id}`,
            urls: { small: p.src.medium, regular: p.src.large, full: p.src.large2x },
            alt_description: p.alt || placeName,
            user: { name: p.photographer }
          }));
          results = [...results, ...pexelsPhotos];
        }
      }
    } catch (e) {
      console.error(`Fetch failed for query: ${query}`, e);
    }

    return results;
  }

  /**
   * Fetch category-specific images with the same discovery logic
   */
  static async getCategoryImages(category: string, count: number = 1, seed?: string): Promise<UnsplashImage[]> {
    const cacheKey = `category-${category}-${count}-${seed || 'none'}`.toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.images;
    }

    const cleanedCategory = this.sanitizeQuery(category);
    const results = await this.fetchFromSources(`${cleanedCategory} india tourism`, count, cleanedCategory);
    
    const finalResults = results.length > 0 ? results.slice(0, count) : this.getFallbackImages(count, seed || category);
    this.cache.set(cacheKey, { images: finalResults, timestamp: Date.now() });
    return finalResults;
  }

  /**
   * Fetch background/hero images
   */
  static async getBackgroundImages(count: number = 1): Promise<UnsplashImage[]> {
    const cacheKey = `background-${count}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.images;
    }

    const results = await this.fetchFromSources("india tourism landscape travel", count, "India");
    const finalResults = results.length > 0 ? results.slice(0, count) : this.getFallbackImages(count, "India");
    this.cache.set(cacheKey, { images: finalResults, timestamp: Date.now() });
    return finalResults;
  }

  /**
   * Keyword scoring to validate relevance
   */
  private static validateRelevance(image: UnsplashImage, coreKeyword: string): boolean {
    const textToMatch = (image.alt_description || "").toLowerCase();
    const keywords = coreKeyword.toLowerCase().split(' ').filter(k => k.length > 2);
    
    if (keywords.length === 0) return true;
    
    // Core check: if the main place name is in the description
    return keywords.some(k => textToMatch.includes(k));
  }

  /**
   * Curated state-based fallback pool
   */
  private static getFallbackImages(count: number, seed: string): UnsplashImage[] {
    const images: UnsplashImage[] = [];
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const startIndex = hash % this.fallbackPool.length;

    for (let i = 0; i < count; i++) {
      const idx = (startIndex + i) % this.fallbackPool.length;
      images.push({
        id: `fallback-${idx}-${seed}`,
        urls: {
          small: `${this.fallbackPool[idx]}?w=400&h=300&fit=crop`,
          regular: `${this.fallbackPool[idx]}?w=800&h=600&fit=crop`,
          full: `${this.fallbackPool[idx]}?w=1200&h=800&fit=crop`
        },
        alt_description: `Beautiful view of ${seed}`,
        user: { name: 'Sahyaatra' }
      });
    }
    return images;
  }

  // Helper for UI consistency
  static getOptimizedImageUrl(image: UnsplashImage, size: 'small' | 'regular' | 'full' = 'regular'): string {
    return image.urls[size];
  }
}

