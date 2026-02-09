import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Sparkles, MapPin, Calendar, Users, IndianRupee, Wand2 } from "lucide-react";

export function Demo() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateItinerary = useAction(api.ai.generateItinerary);
  const getDestinationInfo = useAction(api.ai.getDestinationInfo);
  const chatWithAI = useAction(api.ai.chatWithAI);

  const [destinationInfo, setDestinationInfo] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    text: string;
    isUser: boolean;
  }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const availableInterests = [
    "Adventure", "Culture", "Food", "Nature", "Photography",
    "Spiritual", "Beach", "Mountains", "History", "Wildlife"
  ];

  const handleInterestToggle = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerateItinerary = async () => {
    if (!destination || !startDate || !endDate || !budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateItinerary({
        destination,
        startDate,
        endDate,
        budget: Number(budget),
        travelers: Number(travelers),
        interests,
      });

      // Backend already returns a properly structured object with days[], totalEstimatedCost, and generalTips[]
      console.log("AI Response:", result);

      // Check if this is a rate limit error
      if (result.error === "RATE_LIMIT") {
        setItinerary(result);
        toast.warning("AI service is temporarily busy. Please wait a few seconds and try again.", {
          duration: 5000,
        });
      } else {
        setItinerary(result);
        toast.success("Itinerary generated successfully!");
      }
    } catch (error: any) {
      console.error("Itinerary generation error:", error);
      toast.error(error.message || "Failed to generate itinerary");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetDestinationInfo = async () => {
    if (!destination) {
      toast.error("Please enter a destination");
      return;
    }

    try {
      const info = await getDestinationInfo({ destination });
      setDestinationInfo(info);
      toast.success("Destination information loaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to get destination info");
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true,
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatting(true);

    try {
      const response = await chatWithAI({
        message: chatInput,
        context: `User is planning a trip to ${destination || "India"}. Current form data: budget ${budget}, travelers ${travelers}, interests: ${interests.join(", ")}`
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast.error("Failed to get AI response");
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">AI Travel Assistant Demo</h1>
            <p className="text-xl opacity-90">
              Experience the power of AI for travel planning in India
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Trip Planning Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Wand2 className="w-6 h-6 mr-2 text-purple-600" />
                AI Itinerary Generator
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Goa, Rajasthan, Kerala"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleGetDestinationInfo}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    Get destination insights
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IndianRupee className="w-4 h-4 inline mr-1" />
                      Budget (₹) *
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="15000"
                      min="1000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Travelers
                    </label>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5 people</option>
                      <option value="6">6 people</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableInterests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${interests.includes(interest)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateItinerary}
                  disabled={isGenerating}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Generate AI Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Chat */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chat with AI Assistant</h3>

              <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Ask me anything about travel in India!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${msg.isUser
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about destinations, budgets, travel tips..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isChatting}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-8">
            {/* Destination Info */}
            {destinationInfo && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Destination Insights</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Best Time to Visit</h4>
                    <p className="text-gray-600">{destinationInfo.bestTime}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Top Attractions</h4>
                    <ul className="text-gray-600 list-disc list-inside">
                      {destinationInfo.attractions?.map((attraction: string, index: number) => (
                        <li key={index}>{attraction}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Budget Estimates (3 days)</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="font-medium text-green-800">Budget</p>
                        <p className="text-green-600">₹{destinationInfo.budgetEstimate?.budget?.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="font-medium text-blue-800">Mid-range</p>
                        <p className="text-blue-600">₹{destinationInfo.budgetEstimate?.midRange?.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="font-medium text-purple-800">Luxury</p>
                        <p className="text-purple-600">₹{destinationInfo.budgetEstimate?.luxury?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Itinerary */}
            {itinerary && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Generated Itinerary</h3>
                <div className="space-y-4">
                  {itinerary.days && Array.isArray(itinerary.days) ? (
                    itinerary.days.map((day: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            Day {day.day || index + 1}: {day.title || `Day ${index + 1}`}
                          </h4>
                          <span className="text-sm text-gray-600">
                            ₹{(day.estimatedCost || 0).toLocaleString()}
                          </span>
                        </div>
                        <ul className="text-gray-600 text-sm space-y-1">
                          {day.activities && Array.isArray(day.activities) ? (
                            day.activities.map((activity: string, actIndex: number) => (
                              <li key={actIndex} className="flex items-start">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {activity}
                              </li>
                            ))
                          ) : (
                            <li className="flex items-start">
                              <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {day.activities || "Activity details not available"}
                            </li>
                          )}
                        </ul>
                        {day.tips && (
                          <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                            💡 {day.tips}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">AI Generated Itinerary</h4>
                      <div className="text-gray-600 text-sm">
                        {typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary)}
                      </div>
                    </div>
                  )}

                  {itinerary.totalEstimatedCost && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Total Estimated Cost:</span>
                        <span className="text-purple-600">₹{itinerary.totalEstimatedCost.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {itinerary.generalTips && Array.isArray(itinerary.generalTips) && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">General Tips</h5>
                      <ul className="text-blue-800 text-sm space-y-1">
                        {itinerary.generalTips.map((tip: string, tipIndex: number) => (
                          <li key={tipIndex}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!destinationInfo && !itinerary && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Results Will Appear Here</h3>
                <p className="text-gray-600">
                  Fill out the form and click the buttons to see AI-powered travel insights and itineraries.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
