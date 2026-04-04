import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Info, ExternalLink, Search, Filter, Star, Calendar } from 'lucide-react';
import cleanedPlacesData from '../data/cleaned/all_places_cleaned.json';
import missingStatesData from '../data/missingStatesData.json';
import { CompactWeatherWidget } from './WeatherWidget';
import indiaStatesMeta from '../data/indiaStatesMeta.json';
import { IndiaMapSvg } from './IndiaMapSvg';
import { useTranslation } from "react-i18next";

interface StateInfo {
  code: string;
  name: string;
  type: 'state' | 'union_territory';
  region: string;
  capital: string;
  description: string;
  highlights: string[];
  bestTime: string;
}

export function AdvancedIndiaMap() {
  const { t } = useTranslation(['map', 'common']);
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<StateInfo | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');

  // Combine all places data
  const allPlaces = [...cleanedPlacesData, ...missingStatesData];

  // Function to get places count for a state
  const normalizeStateCode = (stateCode: string) => {
    if (stateCode === 'UK') return 'UT';
    return stateCode;
  };

  const getPlacesCount = (stateCode: string) => {
    return allPlaces.filter(
      place => normalizeStateCode(place.stateCode) === stateCode
    ).length;
  };

  const allStates = indiaStatesMeta as StateInfo[];

  const regions = ['all', 'Northern', 'Western', 'Central', 'Eastern', 'Southern', 'Northeastern', 'Islands'];

  const filteredStates = allStates.filter(state => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      state.name.toLowerCase().includes(searchLower) ||
      state.capital.toLowerCase().includes(searchLower) ||
      state.code.toLowerCase().includes(searchLower);
    const matchesRegion = filterRegion === 'all' || state.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  const filteredCodes = (searchTerm || filterRegion !== 'all')
    ? filteredStates.map(s => s.code)
    : null;

  const handleStateClick = (stateCode: string) => {
    const state = allStates.find(s => s.code === stateCode);
    if (state) {
      setSelectedState(state);
    }
  };

  const handleStateHover = (stateCode: string | null) => {
    setHoveredState(stateCode);
  };

  const handleStateLeave = () => {
    setHoveredState(null);
  };

  const navigateToState = (stateCode: string) => {
    navigate(`/places/state/${stateCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('map:header.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            {t('map:header.subtitle')}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('map:controls.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {t(`map:regions.${region}`)}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Map Container */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="relative">
              <IndiaMapSvg
                activeCode={selectedState?.code ?? null}
                hoveredCode={hoveredState}
                filteredCodes={filteredCodes}
                stateMeta={allStates}
                onSelect={handleStateClick}
                onHover={handleStateHover}
                onLeave={handleStateLeave}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="w-full xl:w-96">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-8">
              {selectedState ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedState.name}</h3>
                      <p className="text-sm text-gray-500">{selectedState.capital} - {t(`map:regions.${selectedState.region}`)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedState.type === 'state' ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{t('map:info.labels.state')}</span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{t('map:info.labels.ut')}</span>
                      )}
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{selectedState.description}</p>

                  <div className="space-y-4">
                    {/* Places Count */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">{t('map:info.labels.availablePlaces')}</h4>
                          <div className="text-2xl font-bold text-blue-600">{getPlacesCount(selectedState.code)}</div>
                        </div>
                        <MapPin className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>

                    {/* Weather Widget */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('map:info.labels.currentWeather')}</h4>
                      <CompactWeatherWidget location={selectedState.name} />
                    </div>

                    {/* Highlights */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {t('map:info.labels.topHighlights')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedState.highlights.map((highlight, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Best Time to Visit */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        {t('map:info.labels.bestTime')}
                      </h4>
                      <p className="text-sm text-gray-600">{selectedState.bestTime}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => navigateToState(selectedState.code)}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('common:buttons.explore', { name: selectedState.name })}
                      </button>
                      <button
                        onClick={() => setSelectedState(null)}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {t('common:buttons.clearSelection')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{t('map:info.defaultTitle')}</h3>
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>

                  <p className="text-gray-600 mb-6">
                    {t('map:info.defaultDesc')}
                  </p>

                  <div className="space-y-4">
                    {/* Statistics */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">28</div>
                          <div className="text-sm text-blue-800">{t('map:info.stats.states')}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-indigo-600">8</div>
                          <div className="text-sm text-indigo-800">{t('map:info.stats.uts')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('map:info.stats.totalRegions')}</span>
                        <span className="font-medium">36</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('map:info.stats.filteredResults')}</span>
                        <span className="font-medium">{filteredStates.length}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p><strong>{t('common:labels.tip') || 'Tip'}:</strong> {t('map:info.tip')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* States Grid */}
        {filteredStates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {filteredStates.length} {filterRegion === 'all' ? t('map:grid.title') : t('map:grid.regionStates', { region: t(`map:regions.${filterRegion}`) })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStates.map((state) => (
                <div
                  key={state.code}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleStateClick(state.code)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{state.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${state.type === 'state'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {state.type === 'state' ? t('map:info.labels.state') : t('map:info.labels.ut')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{state.capital}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{t(`map:regions.${state.region}`)}</p>
                    <p className="text-xs text-blue-600 font-medium">{t('map:grid.placesCount', { count: getPlacesCount(state.code) })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
