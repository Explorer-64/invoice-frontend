import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExternalLink, Share, MoreVertical, PlusSquare, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { getDeferredPrompt, onInstallPrompt, promptPWAInstall, getSWStatus } from 'utils/pwa';
import { APP_BASE_PATH } from 'app';

export interface Props {}

export function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      const swStatus = getSWStatus();
      const manifestLink = document.querySelector('link[rel="manifest"]');
      
      setDebugInfo({
        basePath: APP_BASE_PATH,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        swRegistered: !!swStatus.registration,
        swError: swStatus.error ? swStatus.error.message : null,
        manifestFound: !!manifestLink,
        manifestHref: manifestLink?.getAttribute('href'),
        userAgent: window.navigator.userAgent,
        protocol: window.location.protocol
      });
    };

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Check if already running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');
    
    if (isStandalone) {
      console.log('✅ App is already installed');
      setIsInstalled(true);
      return;
    }

    // Update debug info periodically
    const interval = setInterval(updateDebugInfo, 1000);
    updateDebugInfo();

    // Subscribe to the install prompt event from our utility
    const cleanup = onInstallPrompt((prompt) => {
      console.log('✅ Install prompt received in button component');
      setCanInstall(!!prompt);
      updateDebugInfo();
    });

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptPWAInstall();
    } else {
      setShowInstructions(true);
    }
  };

  // Only hide if definitely installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleInstallClick}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all gap-2 rounded-full px-6 py-6"
        size="lg"
      >
        <ExternalLink className="h-5 w-5" />
        Install App
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Install Invoice Jobs</DialogTitle>
            <DialogDescription>
              Install this app on your device for quick access and offline features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isIOS ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">To install on iOS:</p>
                <ol className="space-y-3 list-decimal list-inside text-sm">
                  <li className="flex items-center gap-2">
                    Tap the <Share className="h-4 w-4 inline" /> Share button in your browser bar
                  </li>
                  <li className="flex items-center gap-2">
                    Scroll down and select <PlusSquare className="h-4 w-4 inline" /> "Add to Home Screen"
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">To install manually:</p>
                <ol className="space-y-3 list-decimal list-inside text-sm">
                  <li className="flex items-center gap-2">
                    Tap the <MoreVertical className="h-4 w-4 inline" /> Menu button in your browser
                  </li>
                  <li className="flex items-center gap-2">
                    Select "Install App" or "Add to Home Screen"
                  </li>
                </ol>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                   <p className="text-xs text-amber-800 flex items-start gap-2">
                     <Info className="h-4 w-4 shrink-0 mt-0.5" />
                     If you don't see the option, ensure you are opening this link in Chrome (Android) or Safari (iOS), not inside another app like Gmail or Facebook.
                   </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <button 
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
              >
                <Info className="h-3 w-3" />
                {showDebug ? "Hide Diagnostics" : "Show Diagnostics (for support)"}
              </button>
              
              {showDebug && (
                <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-md text-[10px] font-mono overflow-x-auto">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {canInstall ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
                      <span>Install Prompt Ready: {canInstall ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {debugInfo.swRegistered ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      <span>Service Worker: {debugInfo.swRegistered ? 'Registered' : 'Not Active'}</span>
                    </div>
                    {debugInfo.swError && (
                      <div className="text-red-500 pl-5">Error: {debugInfo.swError}</div>
                    )}
                    <div className="flex items-center gap-2">
                      {debugInfo.manifestFound ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      <span>Manifest Link: {debugInfo.manifestFound ? 'Found' : 'Missing'}</span>
                    </div>
                    <div className="pl-5 text-muted-foreground truncate">Href: {debugInfo.manifestHref}</div>
                    <div className="flex items-center gap-2">
                      {debugInfo.protocol === 'https:' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
                      <span>Protocol: {debugInfo.protocol}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-muted-foreground">
                      <div className="truncate">UA: {debugInfo.userAgent}</div>
                      <div>Base: {debugInfo.basePath}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
