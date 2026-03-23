import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Calendar, Users, IndianRupee, MessageCircle, Calculator, Send, ExternalLink, Star, Clock, DollarSign } from "lucide-react";
import cleanedPlacesData from "../data/cleaned/all_places_cleaned.json";

export function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trip = useQuery(api.trips.getTripById, { tripId: id as any });
  const requests = useQuery(api.tripRequests.getTripRequests, { tripId: id as any });
  const userRequests = useQuery(api.tripRequests.getUserRequests);
  const sendRequest = useMutation(api.tripRequests.sendTripRequest);
  const respondToRequest = useMutation(api.tripRequests.respondToTripRequest);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Infer a related place from the trip destination
  interface Place {
    _id: string;
    state: string;
    stateCode: string;
    place_name: string;
    category: string;
    description?: string | null;
    timings?: string | null;
    entry_fee?: string | null;
    best_time?: string | null;
    official_website?: string | null;
    wikipedia?: string | null;
  }

  const allPlaces = cleanedPlacesData as Place[];
  const relatedPlace: Place | null = (() => {
    if (!trip) return null;
    const dest = trip.destination?.toLowerCase().trim();
    if (!dest) return null;
    // 1) Exact match on id
    const byId = allPlaces.find(p => p._id.toLowerCase() === dest);
    if (byId) return byId;
    // 2) Exact match on place_name
    const byNameExact = allPlaces.find(p => p.place_name.toLowerCase() === dest);
    if (byNameExact) return byNameExact;
    // 3) Partial match on place_name
    const byNameIncludes = allPlaces.find(p => p.place_name.toLowerCase().includes(dest) || dest.includes(p.place_name.toLowerCase()));
    if (byNameIncludes) return byNameIncludes;
    // 4) If destination looks like a state name, pick first place from that state
    const byState = allPlaces.find(p => p.state.toLowerCase() === dest || p.stateCode.toLowerCase() === dest);
    if (byState) return byState;
    return null;
  })();

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  const isAuthor = loggedInUser && trip.authorId === loggedInUser._id;
  const hasRequested = userRequests?.some(req => req.tripId === trip._id);
  const acceptedRequests = requests?.filter(r => r.status === "accepted") || [];

  const handleSendRequest = async () => {
    try {
      await sendRequest({ tripId: trip._id });
      toast.success("Request sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send request");
    }
  };

  const handleRespondToRequest = async (requestId: string, response: "accepted" | "rejected") => {
    try {
      await respondToRequest({ requestId: requestId as any, response });
      toast.success(`Request ${response} successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/trips"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trips
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Hero Image */}
              <div className="relative h-64 bg-white">
                {trip.imageUrl ? (
                  <img
                    src={trip.imageUrl}
                    alt={trip.destination}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h1 className="text-3xl font-bold">{trip.destination}</h1>
                  <p className="text-sm opacity-90">by {trip.author.name}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <div>
                      <p className="text-sm">Dates</p>
                      <p className="font-medium">
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <IndianRupee className="w-5 h-5 mr-2" />
                    <div>
                      <p className="text-sm">Budget</p>
                      <p className="font-medium">₹{trip.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2" />
                    <div>
                      <p className="text-sm">Travelers</p>
                      <p className="font-medium">{trip.currentTravelers}/{trip.maxTravelers}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About this trip</h2>
                  <p className="text-gray-600 leading-relaxed">{trip.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {trip.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Related Place Details */}
                {relatedPlace && (
                  <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Place</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{relatedPlace.place_name}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{relatedPlace.state}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-700">
                            {relatedPlace.best_time && (
                              <span className="inline-flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-600" /> {relatedPlace.best_time}</span>
                            )}
                            {relatedPlace.timings && (
                              <span className="inline-flex items-center"><Clock className="w-4 h-4 mr-1 text-blue-600" /> {relatedPlace.timings}</span>
                            )}
                            {relatedPlace.entry_fee && (
                              <span className="inline-flex items-center"><DollarSign className="w-4 h-4 mr-1 text-green-600" /> {relatedPlace.entry_fee}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => navigate(`/places/detail/${relatedPlace._id}`)}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" /> View Place
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Requests (for author) */}
            {isAuthor && requests && requests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Requests</h2>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-medium">
                            {request.requester.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{request.requester.name}</h4>
                            <p className="text-sm text-gray-600">{request.requester.bio}</p>
                            {request.message && (
                              <p className="text-sm text-gray-600 mt-1">"{request.message}"</p>
                            )}
                          </div>
                        </div>
                        {request.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRespondToRequest(request._id, "accepted")}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(request._id, "rejected")}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status !== "pending" && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.status === "accepted" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {request.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-4">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  trip.status === 'open' ? 'bg-green-100 text-green-800' :
                  trip.status === 'full' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {trip.status}
                </div>
              </div>

              {!isAuthor && trip.status === "open" && !hasRequested && (
                <button
                  onClick={handleSendRequest}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mb-3"
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Request to Join
                </button>
              )}

              {hasRequested && (
                <div className="text-center py-3 text-gray-600">
                  <p>Request sent! Wait for approval.</p>
                </div>
              )}

              {isAuthor && (
                <div className="space-y-3">
                  <Link
                    to={`/chat/${trip._id}`}
                    className="block w-full px-4 py-3 bg-green-600 text-white text-center font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Group Chat
                  </Link>
                  <Link
                    to={`/budget/${trip._id}`}
                    className="block w-full px-4 py-3 border border-gray-300 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Calculator className="w-4 h-4 inline mr-2" />
                    Budget Planner
                  </Link>
                </div>
              )}
            </div>

            {/* Public Co-Travelers (Accepted) */}
            {acceptedRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Co-Travelers</h3>
                <div className="space-y-3">
                  {acceptedRequests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-medium">
                          {req.requester.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{req.requester.name}</div>
                          <div className="text-xs text-gray-600">Accepted</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invited Friends */}
            {trip.invitedFriendDetails && trip.invitedFriendDetails.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Invited Friends
                  </span>
                </h3>
                <div className="space-y-3">
                  {trip.invitedFriendDetails.map((friend) => (
                    <div key={friend.userId} className="flex items-center gap-3 border border-blue-100 bg-blue-50/50 rounded-lg p-3">
                      <div className="w-9 h-9 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          friend.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{friend.name}</div>
                        <div className="text-xs text-blue-600">Invited by organizer</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open Slots Indicator */}
            {trip.openSlots !== undefined && (
              <div className={`rounded-xl shadow-sm p-5 text-center ${
                trip.openSlots > 0 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
              }`}>
                <div className={`text-2xl font-bold ${trip.openSlots > 0 ? "text-green-700" : "text-yellow-700"}`}>
                  {trip.openSlots}
                </div>
                <div className={`text-sm font-medium ${trip.openSlots > 0 ? "text-green-600" : "text-yellow-600"}`}>
                  {trip.openSlots > 0
                    ? `open slot${trip.openSlots > 1 ? "s" : ""} for unknown co-travelers`
                    : "Group is full!"}
                </div>
              </div>
            )}

            {/* Trip Author */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Organizer</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-medium">
                  {trip.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{trip.author.name}</h4>
                  <p className="text-sm text-gray-600">Trip Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
