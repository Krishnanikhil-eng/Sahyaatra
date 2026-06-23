/**
 * Production-grade Image service for Sahyaatra.
 * Uses a 5-tier query hierarchy to ensure specific place accuracy for 9,000+ locations.
 */
const PEXELS_API_KEY = "9WIvfcdWPVL1MG9JS8J45MW1IVfSx8cZ8BMjk8ghvs8aezKZHmuXhxkC";
const PEXELS_API_URL = "https://api.pexels.com/v1";
const UNSPLASH_ACCESS_KEY = "8lkmwGyPAcKrZxZx2ehAPwOSUUbRJQ4EmMj1mz5UmQQ";
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
  private static BLACKLIST_KEYWORDS = ["legislative", "assembly", "elections", "constituency", "politics", "government", "vidhan sabha", "parliament", "seating chart"];

  private static fallbackPools: Record<string, string[]> = {
    nature: [
      'https://images.unsplash.com/photo-1514222134-b57cbb8ce073',
      'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc',
    ],
    fort: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc18a5bf', // generic fort/palace
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220', // fort
    ],
    temple: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245',
      'https://images.unsplash.com/photo-1590050752117-23a9d7fc2140',
    ],
    default: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
      'https://images.unsplash.com/photo-1506461883276-594a12b11dc3',
    ]
  };

  /**
   * Main entry point for place images using Wikipedia and Unsplash.
   */
  static async getPlaceImages(
    placeName: string,
    state: string,
    country: string = "India",
    type: string = "",
    count: number = 3
  ): Promise<UnsplashImage[]> {
    const cacheKey = `${placeName}-${state}-${type}-${count}`.toLowerCase();
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.images;
    }

    const cleanedPlace = this.sanitizeQuery(placeName);
    const cleanedState = this.sanitizeQuery(state);
    let finalImages: UnsplashImage[] = [];

    // 1. Try Wikipedia (Highest Accuracy)
    const wikiImage = await this.fetchFromWikipedia(cleanedPlace, cleanedState, country);
    if (wikiImage) {
      finalImages.push(wikiImage);
    }

    // 2. Fetch remaining from Unsplash/Pexels
    const remainingCount = count - finalImages.length;
    if (remainingCount > 0) {
      const query = `${cleanedPlace} ${cleanedState} ${country}`.trim();
      const unplashResults = await this.fetchFromSources(query, remainingCount + 3, cleanedPlace);
      
      const validResults = unplashResults.filter(img => 
        this.validateRelevance(img, cleanedPlace) && 
        !finalImages.some(existing => existing.id === img.id)
      );

      finalImages = [...finalImages, ...validResults];
    }

    // 3. Category Fallback if still empty or deficient
    if (finalImages.length === 0) {
      finalImages = this.getFallbackImages(count, cleanedPlace, type);
    } else if (finalImages.length < count) {
      const fallbacks = this.getFallbackImages(count - finalImages.length, cleanedPlace, type);
      finalImages = [...finalImages, ...fallbacks];
    }

    const results = finalImages.slice(0, count);
    this.cache.set(cacheKey, { images: results, timestamp: Date.now() });
    
    return results;
  }

  /**
   * Fetch exactly accurate image from Wikipedia
   */
  private static async fetchFromWikipedia(placeName: string, state: string, country: string): Promise<UnsplashImage | null> {
    // 1. Try the exact place name first! (This prevents "Agra Fort Uttar Pradesh" from matching the generic "Agra" or "UP" page)
    // 2. If that fails, append the state for disambiguation.
    const queries = [
      placeName.replace(/\s+/g, ' ').trim(),
      `${placeName} ${state}`.replace(/\s+/g, ' ').trim(),
    ];

    for (const query of queries) {
      try {
        // Fetch a few results so we can skip blacklisted ones
        const res = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=pageimages&format=json&pithumbsize=1000&origin=*`
        );
        if (!res.ok) continue;
        
        const data = await res.json();
        if (!data.query || !data.query.pages) continue;
        
        const pages = Object.values(data.query.pages) as any[];
        
        // Sort by index (search relevance order)
        pages.sort((a: any, b: any) => (a.index || 0) - (b.index || 0));
        
        // Find the first page with a thumbnail that isn't blacklisted
        for (const page of pages) {
          if (!page.thumbnail) continue;
          
          const titleLower = page.title.toLowerCase();
          const placeLower = placeName.toLowerCase();
          
          // Only skip if the title contains a blacklisted word that ISN'T part of the place name
          const isBlacklisted = this.BLACKLIST_KEYWORDS.some(word => 
            titleLower.includes(word) && !placeLower.includes(word)
          );
          
          if (isBlacklisted) {
            console.log(`[ImageService] Skipping blacklisted Wikipedia page: "${page.title}" for "${placeName}"`);
            continue;
          }
          
          console.log(`[ImageService] Wikipedia hit for "${query}" → ${page.title}`);
          return {
            id: `wiki_${page.pageid}`,
            urls: {
              small: page.thumbnail.source,
              regular: page.thumbnail.source,
              full: page.thumbnail.source,
            },
            alt_description: page.title,
            user: { name: 'Wikimedia Commons' }
          };
        }
      } catch (e) {
        console.error(`Wikipedia fetch failed for "${query}"`, e);
      }
    }
    return null;
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
    
    const finalResults = results.length > 0 ? results.slice(0, count) : this.getFallbackImages(count, seed || category, category);
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
    const finalResults = results.length > 0 ? results.slice(0, count) : this.getFallbackImages(count, "India", "nature");
    this.cache.set(cacheKey, { images: finalResults, timestamp: Date.now() });
    return finalResults;
  }

  /**
   * Keyword scoring to validate relevance
   */
  private static validateRelevance(image: UnsplashImage, coreKeyword: string): boolean {
    const textToMatch = (image.alt_description || "").toLowerCase();
    const keywords = coreKeyword.toLowerCase().split(' ').filter(k => k.length > 3);
    
    if (keywords.length === 0) return true;
    
    // Strict Validation: Require at least 50% of the significant keywords to match
    // Prevent generic words like "Fort" or "Caves" from returning incorrect places.
    const matchCount = keywords.filter(k => textToMatch.includes(k)).length;
    const requiredMatches = Math.max(1, Math.ceil(keywords.length / 2));
    
    return matchCount >= requiredMatches;
  }

  /**
   * Curated state-based fallback pool
   */
  private static getFallbackImages(count: number, seed: string, type: string = ""): UnsplashImage[] {
    let poolKey = 'default';
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes('fort') || typeLower.includes('historical') || typeLower.includes('monument')) {
      poolKey = 'fort';
    } else if (typeLower.includes('temple') || typeLower.includes('shrine') || typeLower.includes('pilgrimage')) {
      poolKey = 'temple';
    } else if (typeLower.includes('hill') || typeLower.includes('cave') || typeLower.includes('lake') || typeLower.includes('valley') || typeLower.includes('nature')) {
      poolKey = 'nature';
    }

    const pool = this.fallbackPools[poolKey] || this.fallbackPools['default'];

    const images: UnsplashImage[] = [];
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const startIndex = hash % pool.length;

    for (let i = 0; i < count; i++) {
      const idx = (startIndex + i) % pool.length;
      images.push({
        id: `fallback-${idx}-${seed}`,
        urls: {
          small: `${pool[idx]}?w=400&h=300&fit=crop`,
          regular: `${pool[idx]}?w=800&h=600&fit=crop`,
          full: `${pool[idx]}?w=1200&h=800&fit=crop`
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

