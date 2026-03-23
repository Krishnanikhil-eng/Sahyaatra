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
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
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
            <Authenticated>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {t('header.welcome', { name: loggedInUser?.email?.split('@')[0] || 'friend' })}
                </span>
                <SignOutButton />
              </div>
            </Authenticated>
            <Unauthenticated>
              <div className="text-sm text-gray-600">
                {t('header.signInPrompt')}
              </div>
            </Unauthenticated>
          </div>
        </div>
      </div>
    </header>
  );
}
