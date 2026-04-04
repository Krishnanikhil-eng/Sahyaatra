import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TripCard } from "../components/TripCard";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Filter, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Trips() {
  const { t } = useTranslation(['trips', 'common']);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [maxBudget, setMaxBudget] = useState<number | undefined>();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMyTrips, setShowMyTrips] = useState(false);
  const [stateFilter, setStateFilter] = useState<string | undefined>();

  const stateCode = searchParams.get('state');
  const state = useQuery(api.states.getStateByCode, { code: stateCode || "" });

  // Handle state filter from URL
  useEffect(() => {
    if (stateCode && state) {
      setSearchTerm(state.name);
      setStateFilter(stateCode);
    }
  }, [searchParams, state]);

  const trips = useQuery(api.trips.searchTrips, {
    destination: searchTerm || undefined,
    maxBudget,
    interests: selectedInterests.length > 0 ? selectedInterests : undefined,
  });

  const allTrips = useQuery(api.trips.getAllTrips, { status: "open" });
  const myTrips = useQuery(api.trips.getUserTrips);

  const interests = [
    "Adventure", "Culture", "Food", "Nature", "Photography",
    "Spiritual", "Beach", "Mountains", "History", "Wildlife"
  ];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const displayTrips = showMyTrips ? myTrips : (searchTerm || maxBudget || selectedInterests.length > 0 ? trips : allTrips);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('trips:title')}</h1>
              <p className="text-gray-600 mt-1">{t('trips:subtitle')}</p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowMyTrips(!showMyTrips)}
                className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${showMyTrips
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                {showMyTrips ? t('trips:tabs.myTrips') : t('trips:tabs.all')}
              </button>
              <Link
                to="/trips/create"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                {t('trips:createTrip')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('trips:searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Budget Filter */}
            <div className="md:w-48">
              <input
                type="number"
                placeholder={t('trips:maxBudgetFilter')}
                value={maxBudget || ""}
                onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('trips:filters')}
            </button>
          </div>

          {/* Interest Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('trips:filterInterests')}</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedInterests.includes(interest)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {t(`trips:interests.${interest}`) || interest}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('trips:resultsCount', { count: displayTrips?.length || 0 })}
          </h2>
        </div>

        {/* Trip Grid */}
        {displayTrips && displayTrips.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('trips:noTripsFound')}</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || maxBudget || selectedInterests.length > 0
                ? t('trips:adjustCriteria')
                : t('trips:beTheFirst')
              }
            </p>
            <Link
              to="/trips/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('trips:createFirst')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
