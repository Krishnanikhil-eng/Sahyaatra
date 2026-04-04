import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, DollarSign, ExternalLink, Car, Train, Plane, Bus, Users, Accessibility, Camera, Star } from 'lucide-react';
import { WeatherWidget } from '../components/WeatherWidget';
import { ImageService, UnsplashImage } from '../services/imageService';
import { CoTravelerButton } from '../components/CoTravelerButton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { getCoordsForPlace } from '../utils/locationUtils';

interface Place {
  _id: string;
  state: string;
  stateCode: string;
  place_name: string;
  category: string;
  description: string | null;
  timings: string | null;
  entry_fee: string | null;
  best_time: string | null;
  nearest_railway: string | null;
  nearest_bus: string | null;
  nearest_airport: string | null;
  metro_station: string | null;
  accessibility: string | null;
  guided_tours: string | null;
  parking: string | null;
  nearby_amenities: string | null;
  official_website: string | null;
  wikipedia: string | null;
  special_notes: string | null;
}

export function PlaceDetail() {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [statePlaces, setStatePlaces] = useState<Place[]>([]);

  const loadStatePlaces = async (placeId: string) => {
    try {
      const statePrefix = placeId.split('_')[0].toLowerCase();
      console.log('Loading state:', statePrefix);
      const fileName = `${statePrefix}_${stateStateMap[statePrefix]}`;
      console.log('Loading file:', fileName);
      const stateModule = await import(`../data/cleaned/${fileName}.json`);
      setStatePlaces(stateModule.default);
      console.log('Loaded places:', stateModule.default);
    } catch (error) {
      console.error('Error loading places:', error);
      setStatePlaces([]);
    }
  };

  // Map of state prefixes to their file names
  const stateStateMap: { [key: string]: string } = {
    'ga': 'goa',
    'an': 'andaman_and_nicobar_islands',
    'ap': 'andhra_pradesh',
    'ar': 'arunachal_pradesh',
    'as': 'assam',
    'br': 'bihar',
    'ch': 'chandigarh',
    'ct': 'chhattisgarh',
    'dl': 'delhi',
    'dn': 'dadra_and_nagar_haveli',
    'gj': 'gujarat',
    'hr': 'haryana',
    'hp': 'himachal_pradesh',
    'jk': 'jammu_and_kashmir',
    'jh': 'jharkhand',
    'ka': 'karnataka',
    'kl': 'kerala',
    'la': 'ladakh',
    'ld': 'lakshadweep',
    'mp': 'madhya_pradesh',
    'mh': 'maharashtra',
    'mn': 'manipur',
    'ml': 'meghalaya',
    'mz': 'mizoram',
    'nl': 'nagaland',
    'or': 'odisha',
    'pb': 'punjab',
    'py': 'puducherry',
    'rj': 'rajasthan',
    'sk': 'sikkim',
    'tg': 'telangana',
    'tn': 'tamil_nadu',
    'tr': 'tripura',
    'up': 'uttar_pradesh',
    'ut': 'uttarakhand',
    'wb': 'west_bengal'
  };

  const loadPlaceImages = async (place: Place) => {
    try {
      const locationQuery = `${place.place_name} ${place.state} india tourist attraction landmark monument`;
      const images: UnsplashImage[] = await ImageService.getPlaceImages(locationQuery, 4);
      setImages(images.map(img => img.urls.regular));
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([]);
    }
  };

  useEffect(() => {
    if (placeId) {
      setLoading(true);
      loadStatePlaces(placeId).then(() => {
        setLoading(false);
      });
    }
  }, [placeId]);

  useEffect(() => {
    if (statePlaces.length > 0 && placeId) {
      const foundPlace = statePlaces.find(p => p._id === placeId);
      console.log('Found Place:', foundPlace);
      if (foundPlace) {
        setPlace(foundPlace);
        loadPlaceImages(foundPlace);
      } else {
        setImages([]);
      }
    }
  }, [placeId, statePlaces]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Place not found</h2>
          <button
            onClick={() => {
              const stateCode = placeId?.split('_')[0].toUpperCase();
              navigate(stateCode ? `/places/state/${stateCode}` : '/places');
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back to {placeId?.split('_')[0].toUpperCase() || 'all states'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/places/state/${place.stateCode}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {place.state}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Place Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Image */}
            <div className="lg:w-1/2">
              <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                <img
                  src={images[0]}
                  alt={place.place_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    {place.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Place Info */}
            <div className="lg:w-1/2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{place.place_name}</h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{place.state}</span>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {place.timings && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Timings</p>
                      <p className="font-medium">{place.timings}</p>
                    </div>
                  </div>
                )}

                {place.entry_fee && (
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-3 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Entry Fee</p>
                      <p className="font-medium">{place.entry_fee}</p>
                    </div>
                  </div>
                )}

                {place.best_time && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-3 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-500">Best Time</p>
                      <p className="font-medium">{place.best_time}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {place.official_website && (
                  <a
                    href={place.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Official Website
                  </a>
                )}
                
                {place.wikipedia && (
                  <a
                    href={place.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Wikipedia
                  </a>
                )}
              </div>

              {/* Co-Traveler Button */}
              <ErrorBoundary fallback={
                <button className="w-full mt-4 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg">
                  Co-Traveler Feature Unavailable
                </button>
              }>
                <CoTravelerButton
                  placeId={place._id}
                  placeName={place.place_name}
                  stateName={place.state}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Weather</h2>
          {(() => {
            const coords = getCoordsForPlace(`${place.place_name}, ${place.state}`);
            return (
              <WeatherWidget 
                location={`${place.place_name}, ${place.state}`} 
                lat={coords?.lat}
                lon={coords?.lon}
              />
            );
          })()}
        </div>

        {/* Additional Images */}
        {images.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.slice(1).map((image, index) => (
                <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${place.place_name} ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transportation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Reach</h2>
            
            <div className="space-y-4">
              {place.nearest_railway && (
                <div className="flex items-start">
                  <Train className="w-6 h-6 mr-3 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Nearest Railway Station</p>
                    <p className="text-gray-600">{place.nearest_railway}</p>
                  </div>
                </div>
              )}

              {place.nearest_bus && (
                <div className="flex items-start">
                  <Bus className="w-6 h-6 mr-3 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Nearest Bus Stand</p>
                    <p className="text-gray-600">{place.nearest_bus}</p>
                  </div>
                </div>
              )}

              {place.nearest_airport && (
                <div className="flex items-start">
                  <Plane className="w-6 h-6 mr-3 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Nearest Airport</p>
                    <p className="text-gray-600">{place.nearest_airport}</p>
                  </div>
                </div>
              )}

              {place.metro_station && (
                <div className="flex items-start">
                  <Train className="w-6 h-6 mr-3 text-orange-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Nearest Metro Station</p>
                    <p className="text-gray-600">{place.metro_station}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Facilities & Services */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Facilities & Services</h2>
            
            <div className="space-y-4">
              {place.accessibility && (
                <div className="flex items-start">
                  <Accessibility className="w-6 h-6 mr-3 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Accessibility</p>
                    <p className="text-gray-600">{place.accessibility}</p>
                  </div>
                </div>
              )}

              {place.guided_tours && (
                <div className="flex items-start">
                  <Users className="w-6 h-6 mr-3 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Guided Tours</p>
                    <p className="text-gray-600">{place.guided_tours}</p>
                  </div>
                </div>
              )}

              {place.parking && (
                <div className="flex items-start">
                  <Car className="w-6 h-6 mr-3 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Parking</p>
                    <p className="text-gray-600">{place.parking}</p>
                  </div>
                </div>
              )}

              {place.nearby_amenities && (
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 mr-3 text-orange-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Nearby Amenities</p>
                    <p className="text-gray-600">{place.nearby_amenities}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Special Notes */}
        {place.special_notes && (
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Special Notes</h2>
            <p className="text-blue-800 leading-relaxed">{place.special_notes}</p>
          </div>
        )}

        {/* Description */}
        {place.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Place</h2>
            <p className="text-gray-700 leading-relaxed">{place.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
