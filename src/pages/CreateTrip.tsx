import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, Calendar, Users, FileText, Tag, UserPlus, X, Search } from "lucide-react";
import { PageBackground } from "../components/PageBackground";
import { useTranslation } from "react-i18next";

interface InvitedFriend {
  userId: string;
  name: string;
  avatar: string | null;
}

export function CreateTrip() {
  const { t } = useTranslation(['trips', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const createTrip = useMutation(api.trips.createTrip);

  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    maxTravelers: "4",
    description: "",
    interests: [] as string[],
    imageUrl: "",
    imageName: "",
    imageSize: 0,
    imageType: "",
  });

  const [invitedFriends, setInvitedFriends] = useState<InvitedFriend[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search users query — only fires when friendSearch has 2+ chars
  const searchResults = useQuery(
    api.friends.searchUsers,
    friendSearch.trim().length >= 2 ? { searchTerm: friendSearch.trim() } : "skip"
  );

  // Prefill from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const destination = params.get("destination");
    const ret = params.get("return");
    if (destination) {
      setFormData((prev) => ({ ...prev, destination }));
    }
    if (ret) setReturnUrl(ret);
  }, [location.search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const maxTravelersNum = Number(formData.maxTravelers);
  const openSlots = Math.max(0, maxTravelersNum - 1 - invitedFriends.length);
  const canInviteMore = invitedFriends.length < maxTravelersNum - 1;

  const interests = [
    "Adventure",
    "Culture",
    "Food",
    "Nature",
    "Photography",
    "Spiritual",
    "Beach",
    "Mountains",
    "History",
    "Wildlife",
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleInviteFriend = (friend: InvitedFriend) => {
    if (!canInviteMore) {
      toast.error(t('trips:messages.spotsFilledError'));
      return;
    }
    if (invitedFriends.some((f) => f.userId === friend.userId)) {
      toast.info(t('trips:messages.alreadyInvited'));
      return;
    }
    setInvitedFriends((prev) => [...prev, friend]);
    setFriendSearch("");
    setShowDropdown(false);
  };

  const handleRemoveFriend = (userId: string) => {
    setInvitedFriends((prev) => prev.filter((f) => f.userId !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.destination || !formData.startDate || !formData.endDate || !formData.budget) {
      toast.error(t('trips:messages.fillRequired'));
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error(t('trips:messages.dateError'));
      return;
    }

    if (formData.interests.length === 0) {
      toast.error(t('trips:messages.interestError'));
      return;
    }

    setIsSubmitting(true);

    try {
      const tripId = await createTrip({
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget),
        maxTravelers: Number(formData.maxTravelers),
        description: formData.description,
        interests: formData.interests,
        imageUrl: formData.imageUrl || undefined,
        invitedFriends: invitedFriends.length > 0
          ? invitedFriends.map((f) => f.userId) as any
          : undefined,
      });

      toast.success(t('trips:messages.createSuccess'));
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      } else {
        navigate(`/trips/${tripId}`);
      }
    } catch (error) {
      toast.error(t('trips:messages.createError'));
      // eslint-disable-next-line no-console
      console.error("Error creating trip:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out already-invited users from search results
  const filteredResults = (searchResults || []).filter(
    (user) => !invitedFriends.some((f) => f.userId === user.userId)
  );

  const travelerOptions = ["2", "3", "4", "5", "6", "8", "10"];

  return (
    <PageBackground query="travel planning">
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
            {returnUrl && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm flex items-center justify-between">
                <span>{t('trips:create.returnNotice')}</span>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => navigate(returnUrl!)}
                >
                  {t('trips:create.back')}
                </button>
              </div>
            )}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('trips:create.title')}</h1>
              <p className="text-gray-600">{t('trips:create.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('trips:create.destination')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
                  placeholder={t('trips:create.destinationPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('trips:create.startDate')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('trips:create.endDate')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="inline mr-1">₹</span>
                    {t('trips:create.budget')} *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={formData.budget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                    placeholder={t('trips:create.budgetPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    {t('trips:create.maxTravelers')}
                  </label>
                  <select
                    value={formData.maxTravelers}
                    onChange={(e) => {
                      const newMax = Number(e.target.value);
                      setFormData((prev) => ({ ...prev, maxTravelers: e.target.value }));
                      // Trim invited friends if new max is smaller
                      if (invitedFriends.length >= newMax) {
                        setInvitedFriends((prev) => prev.slice(0, newMax - 1));
                        toast.info(t('trips:messages.friendsRemoved'));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {travelerOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {t('trips:create.maxTravelersOption', { count: Number(opt) })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ─── Traveling With (Friends + Open Slots) ─── */}
              <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  {t('trips:create.travelingWith')}
                </label>

                {/* Search Input */}
                <div ref={searchRef} className="relative mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={friendSearch}
                      onChange={(e) => {
                        setFriendSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder={
                        canInviteMore
                          ? t('trips:create.searchFriends')
                          : t('trips:create.spotsFilled')
                      }
                      disabled={!canInviteMore}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showDropdown && friendSearch.trim().length >= 2 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredResults.length > 0 ? (
                        filteredResults.map((user) => (
                          <button
                            key={user.userId}
                            type="button"
                            onClick={() =>
                              handleInviteFriend({
                                userId: user.userId,
                                name: user.name,
                                avatar: user.avatar,
                              })
                            }
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.name} 
                                  className="w-full h-full rounded-full object-cover" 
                                />
                              ) : (
                                user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="text-sm text-gray-800 font-medium">{user.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {t('trips:create.noUsersFound')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Invited Friends Chips */}
                {invitedFriends.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {invitedFriends.map((friend) => (
                      <div
                        key={friend.userId}
                        className="inline-flex items-center gap-2 pl-1 pr-2 py-1 bg-white border border-blue-200 rounded-full shadow-sm"
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            friend.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{friend.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(friend.userId)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Open Slots Counter */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {t('common:labels.you') || 'You'}{invitedFriends.length > 0 && ` + ${invitedFriends.length} ${invitedFriends.length > 1 ? t('common:labels.friends') || 'friends' : t('common:labels.friend') || 'friend'}`}
                    </span>
                  </div>
                  <div
                    className={`font-medium px-3 py-1 rounded-full ${
                      openSlots > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {openSlots > 0
                      ? t('trips:detail.openSlots', { count: openSlots })
                      : t('trips:detail.groupFull')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  {t('trips:create.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={t('trips:create.descriptionPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  {t('trips:create.interests')} *
                </label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.interests.includes(interest) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {t(`trips:interests.${interest}`) || interest}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('trips:create.interestsSubtitle')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('trips:create.image')}</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>{t('trips:create.imageUpload')}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData((prev) => ({
                                  ...prev,
                                  imageUrl: reader.result as string,
                                  imageName: file.name,
                                  imageSize: file.size,
                                  imageType: file.type,
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">{t('trips:create.imageDragDrop')}</p>
                    </div>
                    <p className="text-xs text-gray-500">{t('trips:create.imageTypeDesc')}</p>
                  </div>
                </div>
                {formData.imageUrl && (
                  <div className="mt-4">
                    <img src={formData.imageUrl} alt="Trip preview" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? t('trips:create.submitting') : t('trips:create.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}
