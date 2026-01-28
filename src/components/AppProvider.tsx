import { useEffect, type ReactNode, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { registerServiceWorker, setupPWAInstall } from "utils/pwa";
import { APP_BASE_PATH, API_URL } from "app";
import { ICONS } from "utils/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { Helmet } from 'react-helmet';
import { GeolocationProvider } from "components/GeolocationProvider";
import { SyncManager } from "components/SyncManager";
import { ConnectivityIndicator } from "components/ConnectivityIndicator";
import { SiteFooter } from "components/SiteFooter";
import { CookieConsentBanner } from "components/CookieConsentBanner";
import { LanguageProvider } from "utils/translationContext";
import "utils/firestore-offline"; // Initialize Firestore offline persistence

// Pre-load PayPal dependency to prevent Vite dynamic optimization issues
import '@paypal/react-paypal-js';

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 */
export const AppProvider = ({ children }: Props) => {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/auth");
  const isVerificationPage = location.pathname.includes("/auth/email-verification") || location.pathname.includes("/auth/sign-up");

  useEffect(() => {
    // Register SW and listeners
    registerServiceWorker();
    setupPWAInstall();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <LanguageProvider>
          <SyncManager>
            <GeolocationProvider>
              {children}
              {/* SiteFooter removed from here to avoid double rendering on LandingPage */}
              
              {isVerificationPage && (
                <div className="fixed top-4 left-4 right-16 z-[9999] max-w-2xl mx-auto animate-in slide-in-from-top-4">
                  <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-semibold mb-1">Secure Verification</p>
                      <p>
                        We use a secure third-party service for authentication. Please look for a verification email from <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">liquid-bouncy-tuba-lqbv</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isAuthPage && (
                <div className="fixed top-4 right-4 z-[9999]">
                  <Button asChild variant="outline" className="shadow-md bg-white dark:bg-gray-800">
                    <a href={APP_BASE_PATH || "/"}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to App
                    </a>
                  </Button>
                </div>
              )}
              <ConnectivityIndicator />
              <CookieConsentBanner />
              <Toaster />
            </GeolocationProvider>
          </SyncManager>
        </LanguageProvider>
      </Suspense>
    </>
  );
};
