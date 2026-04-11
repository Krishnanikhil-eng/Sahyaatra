import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, AlertCircle } from 'lucide-react';

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

interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  thumbnail?: string;
  content?: string;
  description?: string;
}

interface NewsSectionProps {
  city: string;
}

export function NewsSection({ city }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchNews = async () => {
      setLoading(true);
      setError(false);
      try {
        const rssUrl = encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(city)}`);
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        
        if (data.status === 'ok' && data.items) {
          if (isMounted) {
            setNews(data.items.slice(0, 5));
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (city) {
      fetchNews();
    }

    return () => {
      isMounted = false;
    };
  }, [city]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <div className="flex items-center mb-6">
          <Newspaper className="w-6 h-6 mr-3 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Latest News About {city}</h2>
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
          <p className="text-gray-500 mt-2">We couldn't fetch the latest news for {city} right now.</p>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Newspaper className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No recent news found</h3>
          <p className="text-gray-500 mt-2">There don't seem to be any recent news articles about {city}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
      <div className="flex items-center mb-6">
        <Newspaper className="w-6 h-6 mr-3 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Latest News About {city}</h2>
      </div>
      <div className="space-y-4">
        {news.map((item, index) => {
          const imageUrl = item.thumbnail || extractImageFromContent(item.content || item.description || '');

          return (
            <a
              key={index}
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
