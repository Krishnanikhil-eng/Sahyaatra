import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { BrowserRouter as Router, Link } from "react-router-dom";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { ChatWidget } from "./components/ChatWidget";
import { Toaster } from "sonner";
import { PageBackground } from "./components/PageBackground";
import { AppRoutes } from "./AppRoutes";
import { Navigation } from "./components/Navigation";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SOSButton } from "./components/SOSButton";
import { MapPin, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function App() {
  return (
    <Router>
      <PageBackground>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <ChatWidget />
          <Toaster />
        </div>
      </PageBackground>
    </Router>
  );

}

function Header() {
  const { t } = useTranslation(['nav', 'common']);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Sahyaatra
            </span>
          </Link>

          <Authenticated>
            <Navigation />
          </Authenticated>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <SOSButton />
            <div className="hidden md:flex items-center space-x-4">
              <Authenticated>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 font-medium">
                    {t('nav:header.welcome', { name: loggedInUser?.email?.split('@')[0] || 'friend' })}
                  </span>
                  <SignOutButton />
                </div>
              </Authenticated>
              <Unauthenticated>
                <Link
                  to="/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-105"
                >
                  {t('nav:header.signInPrompt')}
                </Link>
              </Unauthenticated>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-4 px-4 space-y-4 animate-in slide-in-from-top duration-200">
          <Authenticated>
            <Navigation direction="col" />
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600 font-medium">
                {t('nav:header.welcome', { name: loggedInUser?.email?.split('@')[0] || 'friend' })}
              </span>
              <SignOutButton />
            </div>
          </Authenticated>
          <Unauthenticated>
            <Link
              to="/signin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('nav:header.signInPrompt')}
            </Link>
          </Unauthenticated>
        </div>
      )}
    </header>
  );
}
