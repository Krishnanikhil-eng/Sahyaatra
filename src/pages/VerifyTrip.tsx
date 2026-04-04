import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CheckCircle, XCircle, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function VerifyTrip() {
    const { t } = useTranslation(['verify', 'common']);
    const { token } = useParams<{ token: string }>();
    const trip = useQuery(api.trips.getTripByVerificationToken, { token: token || "" });

    if (trip === undefined) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className={`p-8 text-center ${trip ? 'bg-green-50' : 'bg-red-50'}`}>
                    {trip ? (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-green-900">{t('verify:title')}</h1>
                            <p className="text-green-700 font-medium">✅ {t('verify:successSubtitle')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-red-900">{t('verify:failedTitle')}</h1>
                            <p className="text-red-700 font-medium">❌ {t('verify:failedSubtitle')}</p>
                        </div>
                    )}
                </div>

                <div className="p-8">
                    {trip ? (
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center space-x-3 text-gray-700">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('verify:details.destination')}</p>
                                    <p className="font-semibold text-gray-900">{trip.destination}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-gray-700">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('verify:details.status')}</p>
                                    <p className="font-semibold text-gray-900 capitalize">{trip.status}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center mb-8">
                            {t('verify:error')}
                        </p>
                    )}

                    <Link
                        to="/"
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('verify:backHome')}</span>
                    </Link>
                </div>

                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        {t('verify:footer')}
                    </p>
                </div>
            </div>
        </div>
    );
}
