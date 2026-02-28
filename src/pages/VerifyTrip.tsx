import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CheckCircle, XCircle, MapPin, Calendar, ArrowLeft } from "lucide-react";

export function VerifyTrip() {
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
                            <h1 className="text-2xl font-bold text-green-900">Verified Trip</h1>
                            <p className="text-green-700 font-medium">✅ This is a verified co-traveller trip</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-red-900">Verification Failed</h1>
                            <p className="text-red-700 font-medium">❌ Invalid or inactive trip verification</p>
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
                                    <p className="text-sm text-gray-500">Destination</p>
                                    <p className="font-semibold text-gray-900">{trip.destination}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 text-gray-700">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-semibold text-gray-900 capitalize">{trip.status}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center mb-8">
                            The verification link you followed is either invalid, has expired, or the trip is no longer active.
                        </p>
                    )}

                    <Link
                        to="/"
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                </div>

                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        Secure Trip Verification System • Smart-BU
                    </p>
                </div>
            </div>
        </div>
    );
}
