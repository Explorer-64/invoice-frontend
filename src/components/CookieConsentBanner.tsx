import { useEffect, useState } from "react";
import {
  getStoredPreferences,
  savePreferences,
  createDefaultPreferences,
  subscribeToConsent,
  OPEN_COOKIE_SETTINGS_EVENT,
  triggerCookieSettings,
} from "utils/cookieConsent";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "utils/cn";

interface CookieToggles {
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_FLAG = "invoiceJobs.cookieBannerDismissed";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [toggles, setToggles] = useState<CookieToggles>({ analytics: false, marketing: false });

  useEffect(() => {
    const existing = getStoredPreferences();
    if (!existing) {
      setShowBanner(true);
      setToggles({ analytics: false, marketing: false });
    } else {
      setToggles({ analytics: existing.analytics, marketing: existing.marketing });
    }

    const unsubscribe = subscribeToConsent((prefs) => {
      setToggles({ analytics: prefs.analytics, marketing: prefs.marketing });
    });

    const handleOpenSettings = () => {
      setShowDialog(true);
      setShowBanner(false);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);

    return () => {
      unsubscribe();
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    savePreferences({ analytics: true, marketing: true });
    setShowBanner(false);
    window.localStorage.setItem(STORAGE_FLAG, "true");
  };

  const handleRejectMarketing = () => {
    savePreferences({ analytics: false, marketing: false });
    setShowBanner(false);
    window.localStorage.setItem(STORAGE_FLAG, "true");
  };

  const handleCustomize = () => {
    setShowDialog(true);
  };

  const handleSaveDialog = () => {
    savePreferences({ analytics: toggles.analytics, marketing: toggles.marketing });
    setShowDialog(false);
    setShowBanner(false);
    window.localStorage.setItem(STORAGE_FLAG, "true");
  };

  useEffect(() => {
    const stored = getStoredPreferences();
    if (!stored) {
      setToggles({ analytics: false, marketing: false });
      savePreferences({ analytics: false, marketing: false });
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    const flag = window.localStorage.getItem(STORAGE_FLAG);
    const prefs = getStoredPreferences();
    if (!flag || !prefs) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner && !showDialog) {
    return null;
  }

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md bg-card shadow-xl border border-border rounded-2xl p-6 z-50 space-y-4">
          <div>
            <p className="font-semibold">We use cookies</p>
            <p className="text-sm text-muted-foreground">
              Essential cookies keep the app running. We only enable analytics and marketing cookies if you allow it. You can change your choice anytime.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Button className="flex-1" onClick={handleAcceptAll}>
              Accept All
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleRejectMarketing}>
              Reject Marketing
            </Button>
            <Button variant="ghost" onClick={handleCustomize}>
              Customize
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Essential cookies are always on. Choose how we can use analytics and marketing cookies.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <CookieToggle
              title="Analytics"
              description="Helps us understand usage patterns and improve the product."
              checked={toggles.analytics}
              onChange={(value) => setToggles((prev) => ({ ...prev, analytics: value }))}
            />
            <CookieToggle
              title="Marketing"
              description="Allows personalized content and email campaigns."
              checked={toggles.marketing}
              onChange={(value) => setToggles((prev) => ({ ...prev, marketing: value }))}
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
            <Button variant="ghost" className="w-full" onClick={handleRejectMarketing}>
              Reject Non-Essential
            </Button>
            <Button className="w-full" onClick={handleSaveDialog}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ToggleProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function CookieToggle({ title, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between border border-border rounded-xl p-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
