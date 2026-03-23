import { Link, useLocation } from "react-router-dom";
import { MapPin, Users, MessageCircle, Calculator, User, Sparkles, Compass, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const location = useLocation();
  const { t } = useTranslation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link
        to="/places"
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/places')
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
      >
        <Compass className="w-4 h-4" />
        <span>{t('nav.places')}</span>
      </Link>
      <Link
        to="/places/map"
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/places/map')
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
      >
        <MapPin className="w-4 h-4" />
        <span>{t('nav.interactiveMap')}</span>
      </Link>
      <Link
        to="/trips"
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/trips')
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
      >
        <Users className="w-4 h-4" />
        <span>{t('nav.trips')}</span>
      </Link>
      <Link
        to="/profile"
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/profile')
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
      >
        <User className="w-4 h-4" />
        <span>{t('nav.profile')}</span>
      </Link>
      <Link
        to="/demo"
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/demo')
            ? 'bg-green-100 text-green-700'
            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
          }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>{t('nav.demo')}</span>
      </Link>
      <Link
        to="/help"
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/help')
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
      >
        <HelpCircle className="w-4 h-4" />
        <span>{t('nav.help')}</span>
      </Link>
    </nav>
  );
}