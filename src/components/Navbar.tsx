import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";
import { MapPin, Users, Sparkles, Compass, HelpCircle, User } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SignOutButton } from "../SignOutButton";
import { SOSButton } from "./SOSButton";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2 sm:gap-4">
          {/* Left: Brand */}
          <div className="shrink-0 flex items-center">
            <Brand />
          </div>

          {/* Center: Navigation */}
          <Authenticated>
            <div className="hidden lg:flex flex-1 justify-center min-w-0 px-2 sm:px-4">
              <NavLinks />
            </div>
          </Authenticated>

          {/* Right: User Controls */}
          <div className="shrink-0 flex items-center justify-end">
            <UserControls />
          </div>
        </div>
      </div>
    </header>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center space-x-2 shrink-0">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
        <MapPin className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent hidden sm:block">
        Sahyaatra
      </span>
    </Link>
  );
}

function NavLinks() {
  const location = useLocation();
  const { t } = useTranslation(['nav']);
  const isActive = (path: string) => location.pathname === path;

  const links = [
    { to: "/places", icon: <Compass className="w-4 h-4" />, label: t('nav:places') },
    { to: "/places/map", icon: <MapPin className="w-4 h-4" />, label: t('nav:interactiveMap') },
    { to: "/trips", icon: <Users className="w-4 h-4" />, label: t('nav:trips') },
    { to: "/demo", icon: <Sparkles className="w-4 h-4" />, label: t('nav:demo') },
    { to: "/help", icon: <HelpCircle className="w-4 h-4" />, label: t('nav:help') }
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap text-sm font-medium ${
            isActive(link.to)
              ? 'bg-blue-50 text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
          }`}
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function UserControls() {
  const { t } = useTranslation(['auth', 'common', 'nav']);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  return (
    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
      <LanguageSwitcher />
      <SOSButton />
      
      <Authenticated>
        <div className="flex items-center gap-2 sm:gap-3 border-l border-gray-200 pl-2 sm:pl-4">
          <Link
            to="/profile"
            className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            title={t('nav:profile')}
          >
            <User className="w-4 h-4" />
          </Link>
          <span className="text-sm font-medium text-gray-700 hidden xl:inline-block max-w-[150px] truncate">
            {t('auth:welcome', { name: loggedInUser?.email?.split('@')[0] || t('common:user.friend') })}
          </span>
          <SignOutButton />
        </div>
      </Authenticated>
      
      <Unauthenticated>
        <div className="text-sm font-medium text-gray-700 hidden sm:block border-l border-gray-200 pl-2 sm:pl-4">
          {t('auth:signInPrompt')}
        </div>
      </Unauthenticated>
    </div>
  );
}
