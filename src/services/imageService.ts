// Image service for fetching beautiful images from both Pexels and Unsplash
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

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
}

function convertPexelsToUnsplashFormat(photo: PexelsPhoto): UnsplashImage {
  return {
    id: String(photo.id),
    urls: {
      small: photo.src.medium,
      regular: photo.src.large,
      full: photo.src.large2x
    },
    alt_description: photo.alt,
    user: {
      name: photo.photographer
    }
  };
}

export class ImageService {
  private static cache = new Map<string, UnsplashImage[]>();

  private static fallbackPool: string[] = [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da', // Taj Mahal
    'https://images.unsplash.com/photo-1514222134-b57cbb8ce073', // Kerala Backwaters
    'https://images.unsplash.com/photo-1506461883276-594a12b11cf3', // Varanasi
    'https://images.unsplash.com/photo-1596422846543-75c6fc18a5bf', // Hawa Mahal
    'https://images.unsplash.com/photo-1548013146-72479768bbaa', // India Gate
    'https://images.unsplash.com/photo-1587474260584-1f35a74a8b76', // Qutub Minar
    'https://images.unsplash.com/photo-1477587458883-47145ed94245', // Meenakshi Temple
    'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc', // Shimla
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', // Jaipur
    'https://images.unsplash.com/photo-1578351649132-80ce5a00ddbc', // Lotus Temple
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220', // Mumbai Marine Drive
    'https://images.unsplash.com/photo-1590050752117-23a9d7fc2140', // Goa
  ];

  static async getPlaceImages(placeName: string, count: number = 3, category?: string): Promise<UnsplashImage[]> {
    const cacheKey = `place_${placeName}_${count}_${category || 'none'}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try Pexels first (primary source)
      const pexelsResponse = await fetch(
        `${PEXELS_API_URL}/search?query=${encodeURIComponent(placeName + ' india tourism')}&per_page=${count + 5}&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        }
      );

      if (pexelsResponse.ok) {
        const pexelsData = await pexelsResponse.json();
        if (pexelsData.photos && pexelsData.photos.length > 0) {
          const photos = pexelsData.photos as PexelsPhoto[];
          const shiftedPhotos = this.stableShuffle(photos, placeName).slice(0, count);
          const images = shiftedPhotos.map(convertPexelsToUnsplashFormat);
          this.cache.set(cacheKey, images);
          return images;
        }
      }

      // If Pexels fails, try Unsplash
      const unsplashResponse = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(placeName + ' india tourism')}&per_page=${count + 5}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (unsplashResponse.ok) {
        const unsplashData = await unsplashResponse.json();
        if (unsplashData.results && unsplashData.results.length > 0) {
          const results = unsplashData.results as any[];
          const shiftedResults = this.stableShuffle(results, placeName).slice(0, count);
          const images = shiftedResults.map((photo: any) => ({
            id: photo.id,
            urls: photo.urls,
            alt_description: photo.alt_description || placeName,
            user: { name: photo.user.name }
          }));
          this.cache.set(cacheKey, images);
          return images;
        }
      }

      // Mid-tier fallback: search by category but pick based on placeName seed
      if (category) {
        const categoryImages = await this.getCategoryImages(category, count, placeName);
        if (categoryImages.length > 0) {
          this.cache.set(cacheKey, categoryImages);
          return categoryImages;
        }
      }

      throw new Error(`No specific images found for ${placeName}`);
    } catch (error) {
      console.error('Error in getPlaceImages:', error);
      return this.getFallbackImages(count, placeName);
    }
  }

  // Stable shuffle based on a seed string so the same place always gets the same (but varied) image
  private static stableShuffle<T>(array: T[], seed: string): T[] {
    const result = [...array];
    if (result.length <= 1) return result;

    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Use the hash to shift the array
    const shift = hash % result.length;
    for (let i = 0; i < shift; i++) {
      const first = result.shift();
      if (first) result.push(first);
    }
    return result;
  }

  static async getStateImages(stateName: string, count: number = 1): Promise<UnsplashImage[]> {
    const cacheKey = `state_${stateName}_${count}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const unsplashResponse = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(stateName + ' india tourism landscape')}&per_page=10&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (unsplashResponse.ok) {
        const data = await unsplashResponse.json();
        if (data.results && data.results.length > 0) {
          const results = data.results as UnsplashImage[];
          const images = this.stableShuffle(results, stateName).slice(0, count);
          this.cache.set(cacheKey, images);
          return images;
        }
      }

      const pexelsResponse = await fetch(
        `${PEXELS_API_URL}/search?query=${encodeURIComponent(stateName + ' india tourism')}&per_page=10&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        }
      );

      if (pexelsResponse.ok) {
        const data = await pexelsResponse.json();
        const photos = (data.photos || []) as PexelsPhoto[];
        const shifted = this.stableShuffle(photos, stateName).slice(0, count);
        const images = shifted.map(convertPexelsToUnsplashFormat);
        this.cache.set(cacheKey, images);
        return images;
      }

      return this.getFallbackImages(count, stateName);
    } catch (error) {
      console.error('Error fetching state images:', error);
      return this.getFallbackImages(count, stateName);
    }
  }

  static async getCategoryImages(category: string, count: number = 1, seed?: string): Promise<UnsplashImage[]> {
    const cacheKey = `category_${category}_${count}_${seed || 'none'}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const unsplashResponse = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(category + ' india tourism')}&per_page=15&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (unsplashResponse.ok) {
        const data = await unsplashResponse.json();
        if (data.results && data.results.length > 0) {
          const results = data.results as any[];
          const shifted = this.stableShuffle(results, seed || category).slice(0, count);
          const images = shifted.map((photo: any) => ({
            id: photo.id,
            urls: photo.urls,
            alt_description: photo.alt_description || category,
            user: { name: photo.user.name }
          }));
          this.cache.set(cacheKey, images);
          return images;
        }
      }

      return this.getFallbackImages(count, seed || category);
    } catch (error) {
      return this.getFallbackImages(count, seed || category);
    }
  }

  static async getBackgroundImages(count: number = 1): Promise<UnsplashImage[]> {
    const cacheKey = `background_${count}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const unsplashResponse = await fetch(
        `${UNSPLASH_API_URL}/photos/random?query=india tourism landscape&count=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (unsplashResponse.ok) {
        const images = await unsplashResponse.json();
        const formattedImages = Array.isArray(images) ? images : [images];
        this.cache.set(cacheKey, formattedImages);
        return formattedImages;
      }

      return this.getFallbackImages(count);
    } catch (error) {
      return this.getFallbackImages(count);
    }
  }

  private static getFallbackImages(count: number, seed?: string): UnsplashImage[] {
    const fallbackImages: UnsplashImage[] = [];

    // Hash the seed to pick a starting point in the pool
    let startIndex = 0;
    if (seed) {
      startIndex = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % this.fallbackPool.length;
    } else {
      startIndex = Math.floor(Math.random() * this.fallbackPool.length);
    }

    for (let i = 0; i < count; i++) {
      const poolIndex = (startIndex + i) % this.fallbackPool.length;
      fallbackImages.push({
        id: `fallback_${poolIndex}_${i}_${seed || 'noseed'}`,
        urls: {
          small: `${this.fallbackPool[poolIndex]}?w=400&h=300&fit=crop&q=80`,
          regular: `${this.fallbackPool[poolIndex]}?w=800&h=600&fit=crop&q=80`,
          full: `${this.fallbackPool[poolIndex]}?w=1200&h=800&fit=crop&q=80`
        },
        alt_description: 'Beautiful India landscape',
        user: { name: 'Unsplash' }
      });
    }

    return fallbackImages;
  }

  static getOptimizedImageUrl(image: UnsplashImage, size: 'small' | 'regular' | 'full' = 'regular'): string {
    return image.urls[size];
  }
}
