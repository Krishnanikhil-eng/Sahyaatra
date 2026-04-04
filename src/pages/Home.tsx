import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, MessageCircle, Calculator, Sparkles, ArrowRight, Compass, Star, Play } from "lucide-react";
import { ImageService, UnsplashImage } from "../services/imageService";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { useTranslation } from "react-i18next";
import { SignInForm } from "../SignInForm";
import { TripCard } from "../components/TripCard";

export function Home() {
  const { t } = useTranslation(['home']);
  const [backgroundImages, setBackgroundImages] = useState<UnsplashImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const trips = useQuery(api.trips.getAllTrips, { limit: 6, status: "open" });
  const seedStates = useMutation(api.states.seedStates);

  useEffect(() => {
    // Seed states data on first load
    seedStates().catch(console.error);
    
    // Load background images
    const loadBackgroundImages = async () => {
      try {
        const images = await ImageService.getBackgroundImages(5);
        setBackgroundImages(images);
      } catch (error) {
        console.error('Error loading background images:', error);
      }
    };

    loadBackgroundImages();
  }, [seedStates]);

  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [backgroundImages.length]);

  const currentBackgroundImage = backgroundImages[currentImageIndex];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      {currentBackgroundImage && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${ImageService.getOptimizedImageUrl(currentBackgroundImage, 'full')})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              {t('home:hero.badge')}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {t('home:hero.title')}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {" "}{t('home:hero.titleAccent')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              {t('home:hero.subtitle')}
            </p>
            
            <Authenticated>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to="/places/map"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                >
                  <MapPin className="w-6 h-6 mr-3" />
                  {t('home:buttons.map')}
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Link>
                
                <Link
                  to="/places"
                  className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 hover:border-white/50 transition-all duration-300"
                >
                  <Compass className="w-6 h-6 mr-3" />
                  {t('home:buttons.browse')}
                </Link>
                
                <Link
                  to="/trips/create"
                  className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 hover:border-white/50 transition-all duration-300"
                >
                  <Users className="w-6 h-6 mr-3" />
                  {t('home:buttons.plan')}
                </Link>
              </div>
            </Authenticated>

            <Unauthenticated>
              <div className="max-w-md mx-auto mb-12">
                <SignInForm />
              </div>
            </Unauthenticated>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{t('home:stats.destinations')}</div>
                <div className="text-white/80">{t('home:stats.destinationsLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{t('home:stats.states')}</div>
                <div className="text-white/80">{t('home:stats.statesLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{t('home:stats.ai')}</div>
                <div className="text-white/80">{t('home:stats.aiLabel')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-24 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home:features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home:features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MapPin className="w-10 h-10 text-white" />}
              title={t('home:features.map.title')}
              description={t('home:features.map.desc')}
              gradient="from-blue-600 to-blue-700"
              bgGradient="from-blue-50 to-blue-100"
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-white" />}
              title={t('home:features.planning.title')}
              description={t('home:features.planning.desc')}
              gradient="from-green-600 to-green-700"
              bgGradient="from-green-50 to-green-100"
            />
            <FeatureCard
              icon={<MessageCircle className="w-10 h-10 text-white" />}
              title={t('home:features.ai.title')}
              description={t('home:features.ai.desc')}
              gradient="from-purple-600 to-purple-700"
              bgGradient="from-purple-50 to-purple-100"
            />
            <FeatureCard
              icon={<Calculator className="w-10 h-10 text-white" />}
              title={t('home:features.budget.title')}
              description={t('home:features.budget.desc')}
              gradient="from-orange-600 to-orange-700"
              bgGradient="from-orange-50 to-orange-100"
            />
          </div>
        </div>
      </div>

      {/* Recent Trips Section */}
      <Authenticated>
        <div className="relative z-10 py-24 bg-gray-50/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {t('home:trips.recentTitle')}
                </h2>
                <p className="text-xl text-gray-600">
                  {t('home:trips.recentSubtitle')}
                </p>
              </div>
              <Link
                to="/trips"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('home:trips.viewAll')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips?.slice(0, 6).map((trip) => (
                <TripCard key={trip._id} trip={trip} />
              ))}
            </div>
            
            {(!trips || trips.length === 0) && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                  {t('home:trips.none')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('home:trips.noneDesc')}
                </p>
                <Link
                  to="/trips/create"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('home:trips.createFirst')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </Authenticated>

      {/* CTA Section */}
      <div className="relative z-10 py-24 bg-white">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('home:cta.title')}
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto">
            {t('home:cta.desc')}
          </p>
          <div className="flex justify-center">
            <Link
              to="/places/map"
              className="inline-flex items-center px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              <MapPin className="w-6 h-6 mr-3" />
              {t('home:cta.button')}
              <ArrowRight className="w-5 h-5 ml-3" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient, 
  bgGradient 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  bgGradient: string;
}) {
  return (
    <div className={`group text-center p-8 rounded-2xl bg-gradient-to-br ${bgGradient} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
      <div className={`w-20 h-20 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}