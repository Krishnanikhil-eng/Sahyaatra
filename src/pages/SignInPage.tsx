import React, { useEffect } from 'react';
import { SignInForm } from '../SignInForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConvexAuth } from 'convex/react';
import { useTranslation } from 'react-i18next';

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect') || '/';
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, isLoading, location.search, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('signInPage.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('signInPage.subtitle')}</p>
          {new URLSearchParams(location.search).get('redirect') && (
            <p className="mt-2 text-xs text-blue-700 bg-blue-50 inline-block px-2 py-1 rounded">
              {t('signInPage.redirectNotice')}
            </p>
          )}
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
