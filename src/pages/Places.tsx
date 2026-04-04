import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Filter, Grid, List, Eye, Star, ArrowRight, Compass, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import cleanedPlacesData from '../data/cleaned/all_places_cleaned.json';
import missingStatesData from '../data/missingStatesData.json';
import { ImageService, UnsplashImage } from '../services/imageService';
import { allIndianStates, getStateByCode } from '../data/indianStates';

interface Place {
  _id: string;
  state: string;
  stateCode: string;
  place_name: string;
  category: string;
  description?: string;
  timings?: string;
  entry_fee?: string;
  best_time?: string;
  nearest_railway?: string;
  nearest_bus?: string;
  nearest_airport?: string;
  metro_station?: string;
  accessibility?: string;
  guided_tours?: string;
  parking?: string;
  nearby_amenities?: string;
  official_website?: string;
  wikipedia?: string;
  special_notes?: string;
}

export function Places() {
  const { t } = useTranslation(['places', 'common']);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [placeImages, setPlaceImages] = useState<Map<string, UnsplashImage[]>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const allPlaces = [...cleanedPlacesData, ...missingStatesData] as Place[];

  // Get all unique states from the data, using comprehensive state data
  const uniqueStates = allIndianStates.map(state => ({
    code: state.code,
    name: state.name,
    type: state.type,
    region: state.region
  })).sort((a, b) => a.name.localeCompare(b.name));

  const states = [
    { code: 'all', name: t('places:filters.allStates') || 'All States & Union Territories' },
    ...uniqueStates
  ];

  const categories = [
    'all',
    ...Array.from(new Set(allPlaces.map(place => place.category))).sort()
  ];

  useEffect(() => {
    let filtered = allPlaces;

    if (searchTerm) {
      filtered = filtered.filter(place =>
        place.place_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (place.description && typeof place.description === 'string' && place.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (place.special_notes && typeof place.special_notes === 'string' && place.special_notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter(place => place.stateCode === selectedState);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }

    setFilteredPlaces(filtered);
  }, [searchTerm, selectedState, selectedCategory]);

  const loadPlaceImages = async (place: Place) => {
    if (placeImages.has(place._id) || loadingImages.has(place._id)) {
      return;
    }

    setLoadingImages(prev => new Set(prev).add(place._id));

    try {
      const images = await ImageService.getPlaceImages(place.place_name, 1);
      setPlaceImages(prev => new Map(prev).set(place._id, images));
    } catch (error) {
      console.error('Error loading images for place:', place.place_name, error);
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(place._id);
        return newSet;
      });
    }
  };

  const handlePlaceClick = (place: Place) => {
    navigate(`/places/detail/${place._id}`);
  };

  const getPlaceImage = (place: Place): string => {
    const images = placeImages.get(place._id);
    if (images && images.length > 0) {
      return ImageService.getOptimizedImageUrl(images[0], 'regular');
    }
    return `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                {t('places:title')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('places:subtitle', { count: allPlaces.length })}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/places/map')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t('common:buttons.interactiveMap')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('places:searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* State Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full lg:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-white"
              >
                {states.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.code === 'all'
                      ? state.name
                      : `${state.name} (${('type' in state && (state as any).type === 'state') ? t('common:labels.state') : t('common:labels.ut')})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full lg:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? t('places:filters.all') : (t(`places:filters.${category.toLowerCase()}`) || category)}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 border-r border-gray-300 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg text-gray-600">
            {t('places:showing', { count: filteredPlaces.length })}
            {selectedState !== 'all' && ` ${t('common:labels.in')} ${states.find(s => s.code === selectedState)?.name}`}
            {selectedCategory !== 'all' && ` ${t('common:labels.in')} ${t(`places:filters.${selectedCategory.toLowerCase()}`) || selectedCategory}`}
          </p>
        </div>

        {/* Places Grid/List */}
        {filteredPlaces.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredPlaces.map((place, idx) => (
              <div
                key={`${place._id}-${idx}`}
                onClick={() => handlePlaceClick(place)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group"
                onMouseEnter={() => loadPlaceImages(place)}
              >
                {/* Place Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getPlaceImage(place)}
                    alt={place.place_name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                      {t(`places:filters.${place.category.toLowerCase()}`) || place.category}
                    </span>
                  </div>
                  
                  {/* View Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Quick Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">{place.place_name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{place.state}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Star className="w-4 h-4" />
                        <span>{place.best_time || t('common:labels.yearRound')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Place Content */}
                <div className="p-5">
                  {/* Key Information */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      <span><strong>{t('places:details.bestTime')}:</strong> {place.best_time || t('common:labels.yearRound')}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      <span><strong>{t('places:details.entry') || 'Entry'}:</strong> {place.entry_fee || t('common:labels.free')}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="truncate">{place.nearest_railway || t('common:labels.checkDetails')}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {place.official_website && (
                      <a
                        href={place.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {t('common:buttons.website')}
                      </a>
                    )}
                    
                    {place.wikipedia && (
                      <a
                        href={place.wikipedia}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Wikipedia
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              {t('places:noResults')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('places:noResultsDesc') || 'Try adjusting your search criteria or filters'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedState('all');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('common:buttons.clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}