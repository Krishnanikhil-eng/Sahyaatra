import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, MapPin, Calendar, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

export function StateDetail() {
  const { t } = useTranslation(['map', 'common']);
  const { code } = useParams<{ code: string }>();
  const state = useQuery(api.states.getStateByCode, { code: code || "" });
  const trips = useQuery(api.trips.searchTrips, { 
    destination: state?.name || "" 
  });

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('map:detail.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('map:detail.back')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{state.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Find Co-Traveller Section */}
          <div className="bg-blue-50 p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">{t('map:detail.findBuddies.title')}</h2>
                <p className="text-blue-700">{t('map:detail.findBuddies.subtitle', { name: state.name })}</p>
              </div>
              <Link
                to={`/trips?state=${state.code}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('map:detail.findBuddies.button')}
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
              {state.imageUrl ? (
                <img
                  src={state.imageUrl}
                  alt={state.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-2xl font-bold">{state.name}</h2>
                <p className="text-sm opacity-90">{t('common:tagline')}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('map:detail.about', { name: state.name })}</h3>
              <p className="text-gray-600 leading-relaxed">{state.description}</p>
            </div>

            {/* Attractions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('map:detail.attractions')}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {state.attractions.map((attraction, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{attraction}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Trips */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('map:detail.trips.title', { name: state.name })}
              </h3>
              {trips && trips.length > 0 ? (
                <div className="space-y-4">
                  {trips.slice(0, 3).map((trip) => (
                    <Link
                      key={trip._id}
                      to={`/trips/${trip._id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{trip.destination}</h4>
                        <span className="text-sm text-gray-500">₹{trip.budget.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{trip.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{t('map:detail.trips.travelers', { current: trip.currentTravelers, max: trip.maxTravelers })}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">{t('map:detail.trips.noTrips', { name: state.name })}</p>
                  <Link
                    to="/trips/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('map:detail.trips.planButton')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Best Time to Visit */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('map:detail.bestTime')}</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">{state.bestTime}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('map:detail.planYourTrip.title')}</h3>
              <div className="space-y-3">
                <Link
                  to="/trips/create"
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('map:detail.planYourTrip.create', { name: state.name })}
                </Link>
                <Link
                  to="/trips"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('map:detail.planYourTrip.find')}
                </Link>
              </div>
            </div>

            {/* Travel Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('map:detail.travelTips.title')}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• {t('map:detail.travelTips.tip1')}</li>
                <li>• {t('map:detail.travelTips.tip2')}</li>
                <li>• {t('map:detail.travelTips.tip3')}</li>
                <li>• {t('map:detail.travelTips.tip4')}</li>
                <li>• {t('map:detail.travelTips.tip5')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
