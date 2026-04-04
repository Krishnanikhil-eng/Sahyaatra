import { useParams } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send, Users, Sparkles, Bot, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useTranslation } from "react-i18next";

export function Chat() {
  const { t } = useTranslation(['chat', 'common']);
  const { tripId } = useParams<{ tripId: string }>();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.messages.getTripMessages, { tripId: tripId as any });
  const participants = useQuery(api.messages.getTripParticipants, { tripId: tripId as any });
  const sendMessage = useMutation(api.messages.sendMessage);
  const trip = useQuery(api.trips.getTripById, { tripId: tripId as any });
  const chatWithAI = useAction(api.ai.chatWithAI);

  const [aiMessage, setAiMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const generateToken = useMutation(api.trips.getTripVerificationToken);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        tripId: tripId as any,
        content: message,
      });
      setMessage("");
    } catch (error: any) {
      toast.error(error.message || t('chat:messages.error'));
    }
  };

  const handleAskAI = async () => {
    if (!aiMessage.trim()) return;

    setIsAiLoading(true);
    try {
      const context = trip ? `Trip to ${trip.destination} from ${trip.startDate} to ${trip.endDate}. Budget: ₹${trip.budget}. Interests: ${trip.interests.join(', ')}.` : '';

      const response = await chatWithAI({
        message: aiMessage,
        context: context,
      });

      // Send AI response as a system message
      await sendMessage({
        tripId: tripId as any,
        content: `🤖 AI Assistant: ${response}`,
      });

      setAiMessage("");
      toast.success(t('chat:ai.success'));
    } catch (error: any) {
      toast.error(t('chat:ai.error'));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShowQR = async () => {
    const publicBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL;

    // Check if PUBLIC_BASE_URL is missing as per instructions
    if (!publicBaseUrl) {
      console.error("QR Code Error: VITE_PUBLIC_BASE_URL is missing in environment variables. QR cannot be generated for mobile scanning.");
      toast.error(t('chat:qr.errorBaseUrl'));
      return;
    }

    try {
      const result = await generateToken({ tripId: tripId as any });
      if (result.success && result.token) {
        setVerificationToken(result.token);
        setShowQrModal(true);
      } else {
        toast.error(result.message || t('chat:qr.errorGenerate'));
      }
    } catch (error: any) {
      toast.error(error.message || t('chat:qr.errorGenerate'));
    }
  };

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('chat:page.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{trip.destination}</h1>
              <p className="text-sm text-gray-600">{t('chat:page.tripChat')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{t('chat:page.membersCount', { count: participants?.length || 0 })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        {/* Participants Sidebar */}
        <div className="w-64 bg-white border-r p-4">
          <h3 className="font-medium text-gray-900 mb-4">{t('chat:page.participants')}</h3>
          <div className="space-y-3">
            {participants?.map((participant) => (
              <div key={participant.userId} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                  <p className="text-xs text-gray-500">{participant.role}</p>
                </div>
              </div>
            ))}
          </div>

          {(participants?.length || 0) >= 2 && (
            <div className="mt-8 pt-6 border-t">
              <button
                onClick={handleShowQR}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
              >
                <QrCode className="w-4 h-4" />
                <span className="text-sm font-medium">{t('chat:qr.button')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages?.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.type === "system" ? "justify-center" : "justify-start"}`}
              >
                {msg.type === "system" ? (
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {msg.sender.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-sm text-gray-900">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.sender.name} • {new Date(msg._creationTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Assistant Section */}
          <div className="border-t bg-gradient-to-r from-purple-50 to-blue-50 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Bot className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">{t('chat:ai.label')}</span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAskAI(); }} className="flex space-x-2">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder={t('chat:ai.placeholder')}
                className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
              <button
                type="submit"
                disabled={!aiMessage.trim() || isAiLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{t('chat:ai.askButton')}</span>
              </button>
            </form>
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('chat:messages.placeholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('chat:qr.modalTitle')}</h3>
              <p className="text-sm text-gray-600 mb-6 font-medium">
                {t('chat:qr.modalSubtitle')}
              </p>

              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-100 inline-block mb-6">
                <QRCodeSVG
                  value={`${import.meta.env.VITE_PUBLIC_BASE_URL}/trip/verify/${verificationToken}`}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2 text-left">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700 italic">
                  {t('chat:qr.modalInfo')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
