import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, IndianRupee } from "lucide-react";

export interface TripCardTrip {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  maxTravelers: number;
  currentTravelers: number;
  interests: string[];
  description: string;
  status: "open" | "full" | "completed";
  imageUrl?: string;
  author: {
    name: string;
    avatar?: string;
  };
}

interface TripCardProps {
  trip: TripCardTrip;
}

export function TripCard({ trip }: TripCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link to={`/trips/${trip._id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-400 to-green-400">
          {trip.imageUrl ? (
            <img
              src={trip.imageUrl}
              alt={trip.destination}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-white" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
              {trip.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {trip.destination}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <IndianRupee className="w-4 h-4" />
              <span>{trip.budget.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {trip.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{trip.startDate ? formatDate(trip.startDate) : "TBD"} - {trip.endDate ? formatDate(trip.endDate) : "TBD"}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2" />
              <span>{trip.currentTravelers || 1}/{trip.maxTravelers || 1} travelers</span>
            </div>
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-1 mb-4">
            {(trip.interests || []).slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {interest}
              </span>
            ))}
            {(trip.interests?.length || 0) > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                +{(trip.interests?.length || 0) - 3} more
              </span>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {(trip.author?.name || "U").charAt(0).toUpperCase()}
            </div>
            <span className="ml-2 text-sm text-gray-600">by {trip.author?.name || "Unknown"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
