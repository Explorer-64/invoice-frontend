import { useState, useEffect } from "react";
import brain from "brain";
import { API_URL } from "app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, Settings, MapPin, Loader2, Lock, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSearchParams } from "react-router-dom";
import { Translate } from "components/Translate";

export function SettingsIntegrations() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email: string | null } | null>(null);
  const [microsoftStatus, setMicrosoftStatus] = useState<{ connected: boolean; email: string | null } | null>(null);
  const [icloudStatus, setIcloudStatus] = useState<{ connected: boolean; apple_id: string | null } | null>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // iCloud Form State
  const [icloudOpen, setIcloudOpen] = useState(false);
  const [appleId, setAppleId] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [submittingIcloud, setSubmittingIcloud] = useState(false);

  useEffect(() => {
    checkSubscription();
    checkIntegrationsStatus();

    // Check for success/error params from OAuth callbacks
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    
    if (success) {
      toast.success("Integration connected successfully!");
      // Clear params
      searchParams.delete("success");
      setSearchParams(searchParams);
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
      searchParams.delete("error");
      setSearchParams(searchParams);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const res = await brain.get_subscription_status();
      const data = await res.json();
      setIsPremium(data.is_premium);
    } catch (e) {
      console.error("Failed to check subscription", e);
    }
  };

  const checkIntegrationsStatus = async () => {
    try {
      setLoadingIntegrations(true);
      const [googleRes, microsoftRes, icloudRes] = await Promise.all([
        brain.get_oauth_status(),
        brain.get_microsoft_oauth_status(),
        brain.get_icloud_status()
      ]);
      
      setGoogleStatus(await googleRes.json());
      setMicrosoftStatus(await microsoftRes.json());
      setIcloudStatus(await icloudRes.json());
    } catch (error) {
      console.error("Failed to check integration status:", error);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = `${API_URL}/auth/google/connect`;
  };

  const handleConnectMicrosoft = () => {
    window.location.href = `${API_URL}/auth/microsoft/connect`;
  };

  const handleConnectIcloud = async () => {
    if (!appleId || !appPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setSubmittingIcloud(true);
    try {
      await brain.connect_icloud({ apple_id: appleId, app_specific_password: appPassword });
      toast.success("iCloud connected successfully!");
      setIcloudOpen(false);
      checkIntegrationsStatus();
      setAppleId("");
      setAppPassword("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect iCloud. Please check your credentials.");
    } finally {
      setSubmittingIcloud(false);
    }
  };
  
  const handleDisconnectIcloud = async () => {
    if (confirm("Are you sure you want to disconnect iCloud?")) {
      try {
        await brain.disconnect_icloud();
        toast.success("iCloud disconnected");
        checkIntegrationsStatus();
      } catch (error) {
        toast.error("Failed to disconnect");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Calendar Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2">
          <Calendar className="h-5 w-5" />
          <Translate>Calendars</Translate>
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Google Calendar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M3 7.8A8.6 8.6 0 0 1 8.6 3h6.8A8.6 8.6 0 0 1 21 7.8v8.4a8.6 8.6 0 0 1-5.6 4.8h-6.8A8.6 8.6 0 0 1 3 16.2Z"/><path d="M16 10h-4"/><path d="M8 10h4"/><path d="M8 14h8"/></svg>
                <Translate>Google Calendar</Translate>
              </CardTitle>
              <CardDescription><Translate>Sync events automatically</Translate></CardDescription>
            </CardHeader>
            <CardContent>
              {loadingIntegrations ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> <Translate>Checking...</Translate></div>
              ) : googleStatus?.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="truncate font-medium"><Translate>Connected</Translate></span>
                  </div>
                  {googleStatus.email && <p className="text-xs text-muted-foreground truncate" title={googleStatus.email}>{googleStatus.email}</p>}
                  <Button variant="outline" size="sm" onClick={checkIntegrationsStatus} className="w-full h-8 text-xs"><Translate>Refresh</Translate></Button>
                </div>
              ) : (
                <Button onClick={handleConnectGoogle} variant="outline" size="sm" className="w-full"><Translate>Connect</Translate></Button>
              )}
            </CardContent>
          </Card>

          {/* iCloud Calendar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                <Translate>iCloud Calendar</Translate>
              </CardTitle>
              <CardDescription><Translate>Sync Apple events</Translate></CardDescription>
            </CardHeader>
            <CardContent>
              {loadingIntegrations ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> <Translate>Checking...</Translate></div>
              ) : icloudStatus?.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="truncate font-medium"><Translate>Connected</Translate></span>
                  </div>
                  {icloudStatus.apple_id && <p className="text-xs text-muted-foreground truncate" title={icloudStatus.apple_id}>{icloudStatus.apple_id}</p>}
                  <Button variant="ghost" size="sm" onClick={handleDisconnectIcloud} className="w-full h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"><Translate>Disconnect</Translate></Button>
                </div>
              ) : (
                <Dialog open={icloudOpen} onOpenChange={setIcloudOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full"><Translate>Connect</Translate></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle><Translate>Connect iCloud</Translate></DialogTitle>
                      <DialogDescription>
                        <Translate>Use an App-Specific Password from appleid.apple.com</Translate>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="apple_id"><Translate>Apple ID</Translate></Label>
                        <Input id="apple_id" placeholder="you@icloud.com" value={appleId} onChange={(e) => setAppleId(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="app_password"><Translate>App-Specific Password</Translate></Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="app_password" type="password" className="pl-9" placeholder="xxxx-xxxx-xxxx-xxxx" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIcloudOpen(false)}><Translate>Cancel</Translate></Button>
                      <Button onClick={handleConnectIcloud} disabled={submittingIcloud}>
                        {submittingIcloud && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <Translate>Connect</Translate>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Other Tools */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2">
          <Settings className="h-5 w-5" />
          <Translate>Tools</Translate>
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className={!isPremium ? "opacity-75 border-muted-foreground/20" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  <Translate>Auto Check-In</Translate>
                </CardTitle>
                {!isPremium && <Badge variant="secondary" className="text-[10px]">PRO</Badge>}
              </div>
              <CardDescription><Translate>Auto-start sessions at job sites</Translate></CardDescription>
            </CardHeader>
            <CardContent>
              {!isPremium ? (
                <Button size="sm" onClick={() => navigate('/pricing-page')} variant="outline" className="w-full"><Translate>Upgrade to Enable</Translate></Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span><Translate>Coming Soon</Translate></span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
