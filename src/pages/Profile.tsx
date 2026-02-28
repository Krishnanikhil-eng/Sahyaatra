import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { User, Edit, MapPin, Calendar, IndianRupee, Trophy } from "lucide-react";

export function Profile() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const profile = useQuery(api.profiles.getProfile, {});
  const stats = useQuery(api.profiles.getUserStats, {});
  const userTrips = useQuery(api.trips.getUserTrips);
  const createOrUpdateProfile = useMutation(api.profiles.createOrUpdateProfile);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    interests: profile?.interests || [],
    avatar: profile?.avatar || "",
  });

  const interests = [
    "Adventure", "Culture", "Food", "Nature", "Photography",
    "Spiritual", "Beach", "Mountains", "History", "Wildlife",
    "Backpacking", "Luxury", "Family", "Solo", "Group"
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsUploading(true);
      let storageId: string | undefined = undefined;

      // 1. Upload image if a new one is selected
      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId: uploadedId } = await result.json();
        storageId = uploadedId;
      }

      // 2. Save profile
      await createOrUpdateProfile({
        name: formData.name,
        bio: formData.bio || undefined,
        interests: formData.interests,
        avatar: formData.avatar || undefined,
        storageId: storageId as any, // Cast to any to bypass strict ID type checks if needed, though usually string works if the backend expects Id<"_storage"> and the string matches
      });

      setIsEditing(false);
      setSelectedImage(null);
      // Optional: revoke object URL to avoid memory leaks
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUploading(false);
    }
  };

  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => {
                  setFormData({
                    name: profile?.name || "",
                    bio: profile?.bio || "",
                    interests: profile?.interests || [],
                    avatar: profile?.avatar || "",
                  });
                  setSelectedImage(null);
                  setImagePreview(null);
                  setIsEditing(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell others about yourself, your travel style, and what you're looking for in travel buddies..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travel Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.interests.includes(interest)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                        {(imagePreview || formData.avatar || profile?.avatar) ? (
                          <img
                            src={imagePreview || formData.avatar || profile?.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center text-white text-2xl font-bold">
                            {formData.name.charAt(0).toUpperCase() || loggedInUser.email?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full text-sm text-gray-500
                            file:mr-4 file:py-2.5 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100 transition-colors cursor-pointer"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Upload a professional or travel-themed photo. Max size 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-70"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-100">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center text-white text-2xl font-bold">
                          {profile?.name?.charAt(0).toUpperCase() || loggedInUser.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 mt-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile?.name || "Set up your profile"}
                      </h2>
                      <p className="text-gray-600">{loggedInUser.email}</p>
                      {profile?.bio && (
                        <p className="text-gray-700 mt-2">{profile.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Interests */}
                  {profile?.interests && profile.interests.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Travel Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!profile && (
                    <div className="text-center py-8">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Complete your profile</h3>
                      <p className="text-gray-600 mb-4">Add your details to connect with travel buddies</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* My Trips */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">My Trips</h3>
              {userTrips && userTrips.length > 0 ? (
                <div className="space-y-4">
                  {userTrips.map((trip) => (
                    <div key={trip._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{trip.destination}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <IndianRupee className="w-4 h-4 mr-1" />
                              <span>₹{trip.budget.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{trip.currentTravelers}/{trip.maxTravelers} travelers</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${trip.status === 'open' ? 'bg-green-100 text-green-800' :
                            trip.status === 'full' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No trips created yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {stats && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trips Created</span>
                    <span className="font-semibold text-gray-900">{stats.tripsCreated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trips Joined</span>
                    <span className="font-semibold text-gray-900">{stats.tripsJoined}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed Trips</span>
                    <span className="font-semibold text-gray-900">{stats.completedTrips}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Budget Managed</span>
                    <span className="font-semibold text-gray-900">₹{stats.totalBudgetManaged.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Trophy className="w-6 h-6 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Travel Level</h3>
              </div>
              <p className="text-gray-600 text-sm">
                {stats?.tripsCreated === 0 && stats?.tripsJoined === 0 ? "New Explorer" :
                  stats && stats.tripsCreated + stats.tripsJoined < 5 ? "Travel Enthusiast" :
                    stats && stats.tripsCreated + stats.tripsJoined < 10 ? "Seasoned Traveler" :
                      "Travel Expert"}
              </p>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((stats?.tripsCreated || 0) + (stats?.tripsJoined || 0)) * 10, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
