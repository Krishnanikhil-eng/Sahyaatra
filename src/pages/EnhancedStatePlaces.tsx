import React, { useState, useEffect, useMemo } from 'react';

import { CoTravelerButton } from '../components/CoTravelerButton';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Clock, DollarSign, ExternalLink, Grid, List, Filter, Star, Eye, Train, Plane, Bus, Accessibility, Car, Users } from 'lucide-react';
import cleanedPlacesData from '../data/cleaned/all_places_cleaned.json';
import { ImageService, UnsplashImage } from '../services/imageService';
import { allIndianStates, getStateByCode } from '../data/indianStates';
import { CompactWeatherWidget } from '../components/WeatherWidget';

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

// Add a sub-component for dynamic thumbnails to avoid complex logic in the main component
function PlaceThumbnail({ placeName, stateName, category, fallbackUrl }: { placeName: string, stateName: string; category: string; fallbackUrl: string }) {
  const [imageUrl, setImageUrl] = useState<string>(fallbackUrl);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadThumbnail = async () => {
      try {
        const images = await ImageService.getPlaceImages(`${placeName} ${stateName}`, 1, category);
        if (isMounted && images.length > 0) {
          setImageUrl(images[0].urls.small);
        }
      } catch (error) {
        console.error('Error loading thumbnail for', placeName, error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadThumbnail();
    return () => { isMounted = false; };
  }, [placeName, stateName, category]);

  return (
    <img
      src={imageUrl}
      alt={placeName}
      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${loading ? 'blur-sm grayscale' : 'blur-0 grayscale-0'}`}
      loading="lazy"
    />
  );
}

export function EnhancedStatePlaces() {
  const { stateCode } = useParams<{ stateCode: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [stateImage, setStateImage] = useState<UnsplashImage | null>(null);
  const [stateInfo, setStateInfo] = useState<{ name: string; description: string; imageUrl: string } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedPlaceImage, setSelectedPlaceImage] = useState<UnsplashImage | null>(null);

  // Get state information dynamically from comprehensive state data
  const getStateDetails = (code: string) => {
    const state = getStateByCode(code);
    if (!state) return null;

    return {
      name: state.name,
      description: state.description,
      imageKeyword: `${state.name.toLowerCase()} ${state.highlights[0]?.toLowerCase() || 'tourism'}`
    };
  };

  const allPlaces: Place[] = cleanedPlacesData as Place[];
  const statePlaces = useMemo(() => allPlaces.filter(place => place.stateCode === stateCode), [allPlaces, stateCode]);

  // Get unique categories for this state
  const categories = ['all', ...Array.from(new Set(statePlaces.map(place => place.category)))];

  useEffect(() => {
    if (stateCode) {
      const details = getStateDetails(stateCode);
      if (details) {
        setStateInfo({
          name: details.name,
          description: details.description,
          imageUrl: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
        });

        // Load state image from Unsplash
        const loadStateImage = async () => {
          try {
            const images = await ImageService.getStateImages(details.name, 1);
            if (images.length > 0) {
              setStateImage(images[0]);
            }
          } catch (error) {
            console.error('Error loading state image:', error);
          }
        };

        loadStateImage();
      }
    }
  }, [stateCode]);

  // Load image for selected place when modal opens
  useEffect(() => {
    const loadPlaceImage = async () => {
      if (!selectedPlace) {
        setSelectedPlaceImage(null);
        return;
      }
      try {
        const query = `${selectedPlace.place_name} ${selectedPlace.state} india tourism landmark`;
        const images = await ImageService.getPlaceImages(query, 1);
        setSelectedPlaceImage(images[0] || null);
      } catch (e) {
        console.error('Error loading place image:', e);
        setSelectedPlaceImage(null);
      }
    };
    void loadPlaceImage();
  }, [selectedPlace]);

  const filteredPlaces = useMemo(() => {
    let filtered = statePlaces;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(place =>
        place.place_name.toLowerCase().includes(q) ||
        place.category.toLowerCase().includes(q) ||
        (place.description && place.description.toLowerCase().includes(q)) ||
        (place.special_notes && place.special_notes.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.category === selectedCategory);
    }
    return filtered;
  }, [statePlaces, searchTerm, selectedCategory]);

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  if (!stateInfo || !stateCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">State not found</h2>
          <p className="text-gray-600 mb-4">The state code "{stateCode}" is not recognized.</p>
          <button
            onClick={() => navigate('/places')}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back to states
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Enhanced Header */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={stateImage ? ImageService.getOptimizedImageUrl(stateImage, 'full') : stateInfo.imageUrl}
            alt={stateInfo.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = stateInfo.imageUrl;
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-4xl">
            <button
              onClick={() => navigate('/places')}
              className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to States
            </button>

            <h1 className="text-5xl font-bold mb-4">{stateInfo.name}</h1>
            <p className="text-xl text-white/90 mb-6 max-w-2xl">{stateInfo.description}</p>

            <div className="flex items-center space-x-6">
              <div className="flex items-center text-white/80">
                <MapPin className="w-6 h-6 mr-2" />
                <span className="text-lg">{statePlaces.length} places to explore</span>
              </div>
              <div className="flex items-center text-white/80">
                <Star className="w-6 h-6 mr-2" />
                <span className="text-lg">Amazing destinations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search places in this state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
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
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 border-r border-gray-300 transition-colors ${viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 transition-colors ${viewMode === 'list'
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
            Showing <span className="font-semibold text-blue-600">{filteredPlaces.length}</span> places in {stateInfo.name}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Weather Widget */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Weather in {stateInfo.name}</h2>
          <CompactWeatherWidget location={stateInfo.name} />
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
              >
                {/* Place Image */}
                <div className="relative h-56 overflow-hidden">
                  <PlaceThumbnail
                    placeName={place.place_name}
                    stateName={place.state}
                    category={place.category}
                    fallbackUrl={`https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                      {place.category}
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
                    <div className="flex items-center space-x-4 text-sm">
                      {place.timings && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Open</span>
                        </div>
                      )}
                      {place.entry_fee && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>{place.entry_fee.includes('Free') ? 'Free' : 'Paid'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Place Content */}
                <div className="p-5">
                  {/* Key Information */}
                  <div className="space-y-3 mb-4">
                    {place.best_time && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        <span><strong>Best time:</strong> {place.best_time}</span>
                      </div>
                    )}
                    {place.nearest_railway && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="truncate">{place.nearest_railway}</span>
                      </div>
                    )}
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
                        Website
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
              No places found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Place Details Modal/Section */}
        {selectedPlace && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedPlace(null)}
          >
            <div
              className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Fixed to Top Right of Modal */}
              <button
                className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors text-xl leading-none pt-0.5"
                onClick={() => setSelectedPlace(null)}
                aria-label="Close"
              >
                &times;
              </button>

              <div className="overflow-y-auto flex-1 w-full flex flex-col">
                {/* Prominent Header Image Banner */}
                <div className="relative h-72 sm:h-96 md:h-[45vh] bg-gray-900 shrink-0 w-full group">
                  <img
                    src={selectedPlaceImage ? ImageService.getOptimizedImageUrl(selectedPlaceImage, 'full') : (selectedPlace.place_name ? `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3` : stateInfo?.imageUrl)}
                    alt={selectedPlace.place_name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = stateInfo?.imageUrl || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Banner Content Overlaid on Image */}
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 text-white z-10">
                    <div className="flex items-center mb-3">
                      <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-sm rounded-full font-medium shadow-sm border border-white/10">
                        {selectedPlace.category}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 tracking-tight text-white drop-shadow-md">
                      {selectedPlace.place_name}
                    </h2>
                    <div className="flex items-center text-white/90">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                      <span className="text-lg md:text-xl font-medium drop-shadow-sm">{selectedPlace.state}</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="p-6 md:p-8 bg-white relative z-0 flex-1">
                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {selectedPlace.timings && (
                      <div className="flex items-center p-3 rounded-lg bg-gray-50">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Timings</p>
                          <p className="text-sm font-medium">{selectedPlace.timings}</p>
                        </div>
                      </div>
                    )}
                    {selectedPlace.entry_fee && (
                      <div className="flex items-center p-3 rounded-lg bg-gray-50">
                        <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">Entry Fee</p>
                          <p className="text-sm font-medium">{selectedPlace.entry_fee}</p>
                        </div>
                      </div>
                    )}
                    {selectedPlace.best_time && (
                      <div className="flex items-center p-3 rounded-lg bg-gray-50">
                        <Star className="w-4 h-4 mr-2 text-yellow-600" />
                        <div>
                          <p className="text-xs text-gray-500">Best Time</p>
                          <p className="text-sm font-medium">{selectedPlace.best_time}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description / Notes */}
                  {selectedPlace.description && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">About</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedPlace.description}</p>
                    </div>
                  )}
                  {selectedPlace.special_notes && (
                    <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800">
                      {selectedPlace.special_notes}
                    </div>
                  )}

                  {/* How to Reach */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {selectedPlace.nearest_railway && (
                      <div className="flex items-start p-3 rounded-lg bg-gray-50">
                        <Train className="w-5 h-5 mr-3 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Nearest Railway</p>
                          <p className="text-sm text-gray-700">{selectedPlace.nearest_railway}</p>
                        </div>
                      </div>
                    )}
                    {selectedPlace.nearest_bus && (
                      <div className="flex items-start p-3 rounded-lg bg-gray-50">
                        <Bus className="w-5 h-5 mr-3 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Nearest Bus</p>
                          <p className="text-sm text-gray-700">{selectedPlace.nearest_bus}</p>
                        </div>
                      </div>
                    )}
                    {selectedPlace.nearest_airport && (
                      <div className="flex items-start p-3 rounded-lg bg-gray-50">
                        <Plane className="w-5 h-5 mr-3 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Nearest Airport</p>
                          <p className="text-sm text-gray-700">{selectedPlace.nearest_airport}</p>
                        </div>
                      </div>
                    )}
                    {selectedPlace.metro_station && (
                      <div className="flex items-start p-3 rounded-lg bg-gray-50">
                        <Train className="w-5 h-5 mr-3 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Metro Station</p>
                          <p className="text-sm text-gray-700">{selectedPlace.metro_station}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Facilities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {selectedPlace.accessibility && (
                      <div className="flex items-start p-3 rounded-lg bg-gray-50">
                        <Accessibility className="w-5 h-5 mr-3 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Accessibility</p>
                          <p className="text-sm text-gray-700">{selectedPlace.accessibility}</p>
                        </div>
                      </div>
                    )}
                    {selectedPlace.guided_tours && (
                      <div className="flex items-start p-3 rounded-lg bg-gray-50">
                        <Users className="w-5 h-5 mr-3 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Guided Tours</p>
                          <p className="text-sm text-gray-700">{selectedPlace.guided_tours}</p>
                        </div>
                      </div>
                    )}
                    {selectedPlace.parking && (
                      <div className="flex items-start p-3 rounded-lg bg-gray-50">
                        <Car className="w-5 h-5 mr-3 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Parking</p>
                          <p className="text-sm text-gray-700">{selectedPlace.parking}</p>
                        </div>
                      </div>
                    )}
                    {selectedPlace.nearby_amenities && (
                      <div className="flex items-start p-3 rounded-lg bg-gray-50">
                        <MapPin className="w-5 h-5 mr-3 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Nearby Amenities</p>
                          <p className="text-sm text-gray-700">{selectedPlace.nearby_amenities}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* External Links */}
                  {(selectedPlace.official_website || selectedPlace.wikipedia) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedPlace.official_website && (
                        <a
                          href={selectedPlace.official_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" /> Official Website
                        </a>
                      )}
                      {selectedPlace.wikipedia && (
                        <a
                          href={selectedPlace.wikipedia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" /> Wikipedia
                        </a>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/places/detail/${selectedPlace._id}`)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> View Full Details
                    </button>
                    <div>
                      <h3 className="text-base font-semibold mb-2">Find Co-Travelers</h3>
                      <CoTravelerButton
                        placeId={selectedPlace._id}
                        stateName={selectedPlace.state}
                        placeName={selectedPlace.place_name}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Place detail page is handled through navigation */}
    </div>
  );
}
