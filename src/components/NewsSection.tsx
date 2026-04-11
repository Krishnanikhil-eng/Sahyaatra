import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, AlertCircle } from 'lucide-react';

// Formats the date similar to "2 hours ago"
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

const extractImageFromContent = (htmlContent: string) => {
  const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

export interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  thumbnail?: string;
  content?: string;
  description?: string;
}

interface NewsSectionProps {
  placeName: string;
  city?: string;
  state: string;
  category?: string;
}

const CACHE_EXPIRATION_MS = 1000 * 60 * 60 * 2; // 2 hours cache

const getCachedNews = (key: string): NewsItem[] | null => {
  try {
    const cached = sessionStorage.getItem(`sahyatra_news_${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
        return data; // valid cache
      }
    }
  } catch (e) {
    console.error('Error reading from cache', e);
  }
  return null;
};

const setCachedNews = (key: string, data: NewsItem[]) => {
  try {
    sessionStorage.setItem(`sahyatra_news_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.error('Error writing to cache', e);
  }
};

const filterNegative = (items: NewsItem[]) => {
  const negativeKeywords = [
    'exam', 'result', 'murder', 'crime', 'politics', 'survey', 
    'election', 'rape', 'arrest', 'scam', 'fraud', 'killing', 
    'suicide', 'court', 'bjp', 'congress', 'sensex', 'nifty',
    'minister', 'cm ', 'police', 'death', 'dead', 'dies', 'killed', 'accident', 'clash', 'firing'
  ];

  return items.filter(item => {
    const textToCheck = `${item.title} ${item.description || ''} ${item.content || ''}`.toLowerCase();
    return !negativeKeywords.some(kw => textToCheck.includes(kw));
  });
};

const filterByPlace = (items: NewsItem[], placeName: string) => {
  const pName = placeName.toLowerCase();
  return items.filter(item => item.title.toLowerCase().includes(pName));
};

const fetchSingleQuery = async (query: string, limit = 5): Promise<NewsItem[]> => {
  try {
    const rssUrl = encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}`);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (data.status === 'ok' && data.items) {
      return data.items.slice(0, limit); // fetch a bit for each, let's keep it small per query
    }
  } catch (err) {
    console.error(`Error fetching news for query "${query}":`, err);
  }
  return [];
};

export function NewsSection({ placeName, city, state, category }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAllNews = async () => {
      setLoading(true);
      setError(false);

      // Using a versioned composite key to bust old irrelevant cache
      const cacheKey = encodeURIComponent(`v3_news_${placeName}_${city}_${state}`);
      const cached = getCachedNews(cacheKey);

      if (cached) {
        if (isMounted) {
          setNews(cached);
          setLoading(false);
        }
        return;
      }

      // Generate smart queries strictly anchored to the specific location
      const queryList = [
        placeName,
        city && city.toLowerCase() !== placeName.toLowerCase() ? city : null,
        city ? `${city} ${state}` : `${placeName} ${state}`,
        `${placeName} ${category || 'tourism'}`
      ].filter(Boolean) as string[];

      // Deduplicate queries
      const uniqueQueries = Array.from(new Set(queryList));

      try {
        const results = await Promise.allSettled(
          uniqueQueries.map(q => fetchSingleQuery(q, 10))
        );

        let mergedArticles: NewsItem[] = [];
        results.forEach((res) => {
          if (res.status === 'fulfilled' && res.value) {
            mergedArticles = [...mergedArticles, ...res.value];
          }
        });

        // Remove duplicates by exact link
        const uniqueItemsMap = new Map<string, NewsItem>();
        mergedArticles.forEach((item) => {
          if (!uniqueItemsMap.has(item.link)) {
            uniqueItemsMap.set(item.link, item);
          }
        });

        // Filter and sort by latest date
        let finalArticles = Array.from(uniqueItemsMap.values());
        finalArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

        // Apply negative filters to discard unwanted domains
        const safeArticles = filterNegative(finalArticles);

        // Strictly search for the tourist place
        let placeFiltered = filterByPlace(safeArticles, placeName);

        // Fallback to original safe list if completely filtered out
        const resultArticles = placeFiltered.length > 0 ? placeFiltered : safeArticles;

        // We only want the absolute top 5 newest/most relevant articles globally
        const top5 = resultArticles.slice(0, 5);

        if (isMounted) {
          if (top5.length === 0 && mergedArticles.length === 0) {
            // Technically not an error, just empty state, but if all calls errored out returning []
            // we could flag this or just show empty. If lengths are 0 we show empty state.
          }
          setNews(top5);
          setCachedNews(cacheKey, top5);
        }
      } catch (err) {
        console.error('Error in multi-query feature', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllNews();

    return () => {
      isMounted = false;
    };
  }, [placeName, city, state, category]);

  const displayLocationLabel = city && city !== placeName ? city : placeName;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <div className="flex items-center mb-6">
          <Newspaper className="w-6 h-6 mr-3 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Latest News About {displayLocationLabel}</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4 p-4 border border-gray-100 rounded-lg">
              <div className="h-16 w-16 sm:h-24 sm:w-24 bg-gray-200 rounded-md flex-shrink-0"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Failed to load news</h3>
          <p className="text-gray-500 mt-2">We couldn't fetch the latest news for {displayLocationLabel} right now.</p>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Newspaper className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No relevant news found</h3>
          <p className="text-gray-500 mt-2">There don't seem to be any relevant news articles about {displayLocationLabel} right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
      <div className="flex items-center mb-6">
        <Newspaper className="w-6 h-6 mr-3 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Latest News About {displayLocationLabel}</h2>
      </div>
      <div className="space-y-4">
        {news.map((item, index) => {
          const imageUrl = item.thumbnail || extractImageFromContent(item.content || item.description || '');

          return (
            <a
              key={item.link || index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all duration-200"
            >
              {imageUrl && (
                <div className="h-40 sm:h-24 sm:w-32 flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-md bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-2 mb-2 leading-snug">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{timeAgo(item.pubDate)}</span>
                  <ExternalLink className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
