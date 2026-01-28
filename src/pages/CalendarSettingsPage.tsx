import { useEffect, useState } from "react";
import { backend as apiClient, API_URL } from "app";
import { useCurrentUser } from "app/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Calendar, AlertCircle, Loader2, Trash2, Lock, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CalendarSettingsPage() {
  const { user } = useCurrentUser();
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email: string | null } | null>(null);
  const [microsoftStatus, setMicrosoftStatus] = useState<{ connected: boolean; email: string | null } | null>(null);
  const [icloudStatus, setIcloudStatus] = useState<{ connected: boolean; apple_id: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // iCloud Form State
  const [icloudOpen, setIcloudOpen] = useState(false);
  const [appleId, setAppleId] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [submittingIcloud, setSubmittingIcloud] = useState(false);

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user?.id]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const [googleRes, microsoftRes, icloudRes] = await Promise.all([
        apiClient.get_oauth_status(),
        apiClient.get_microsoft_oauth_status(),
        apiClient.get_icloud_status()
      ]);
      
      setGoogleStatus(await googleRes.json());
      setMicrosoftStatus(await microsoftRes.json());
      setIcloudStatus(await icloudRes.json());
    } catch (error) {
      console.error("Failed to check connection status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = () => {
    window.location.href = `${API_URL}/auth/google/connect`;
  };
  
  const handleMicrosoftConnect = () => {
    window.location.href = `${API_URL}/auth/microsoft/connect`;
  };

  const handleIcloudConnect = async () => {
    if (!appleId || !appPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setSubmittingIcloud(true);
    try {
      await apiClient.connect_icloud({ apple_id: appleId, app_specific_password: appPassword });
      toast.success("iCloud connected successfully!");
      setIcloudOpen(false);
      checkStatus();
      setAppleId("");
      setAppPassword("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect iCloud. Please check your credentials.");
    } finally {
      setSubmittingIcloud(false);
    }
  };
  
  const handleIcloudDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect iCloud?")) {
      try {
        await apiClient.disconnect_icloud();
        toast.success("iCloud disconnected");
        checkStatus();
      } catch (error) {
        toast.error("Failed to disconnect");
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <PageHeader title="Google Calendar" subtitle="Connect your calendar for automatic time tracking" />
        <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="bg-card border rounded-lg p-8 shadow-sm max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to manage your calendar connection.
            </p>
            <Button asChild className="w-full">
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageHeader title="Calendar Integrations" subtitle="Connect your calendars for automatic time tracking" />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        
        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500"><path d="M3 7.8A8.6 8.6 0 0 1 8.6 3h6.8A8.6 8.6 0 0 1 21 7.8v8.4a8.6 8.6 0 0 1-5.6 4.8h-6.8A8.6 8.6 0 0 1 3 16.2Z"/><path d="M16 10h-4"/><path d="M8 10h4"/><path d="M8 14h8"/></svg>
              Google Calendar
            </CardTitle>
            <CardDescription>
              Connect your Google account to sync events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking status...
              </div>
            ) : googleStatus?.connected ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">Connected</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{googleStatus.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleGoogleConnect}>
                  Reconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleGoogleConnect} className="w-full sm:w-auto">
                Connect Google
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Microsoft Outlook */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-700"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              Microsoft Outlook
            </CardTitle>
            <CardDescription>
              Connect your Outlook or Office 365 calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking status...
              </div>
            ) : microsoftStatus?.connected ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">Connected</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{microsoftStatus.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleMicrosoftConnect}>
                  Reconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleMicrosoftConnect} className="w-full sm:w-auto">
                Connect Outlook
              </Button>
            )}
          </CardContent>
        </Card> */}

        {/* iCloud Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
              iCloud Calendar
            </CardTitle>
            <CardDescription>
              Connect your Apple iCloud calendar using an app-specific password
            </CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking status...
              </div>
            ) : icloudStatus?.connected ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">Connected</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{icloudStatus.apple_id}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleIcloudDisconnect}>
                  <Trash2 className="h-4 w-4 mr-2" /> Disconnect
                </Button>
              </div>
            ) : (
              <Dialog open={icloudOpen} onOpenChange={setIcloudOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">Connect iCloud</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect iCloud Calendar</DialogTitle>
                    <DialogDescription>
                      You need an App-Specific Password to connect iCloud.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-2">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Go to <strong>appleid.apple.com</strong> &gt; Sign-In and Security &gt; App-Specific Passwords. Generate one and paste it here. Do NOT use your main Apple ID password.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apple_id">Apple ID Email</Label>
                      <Input 
                        id="apple_id" 
                        placeholder="you@icloud.com" 
                        value={appleId}
                        onChange={(e) => setAppleId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app_password">App-Specific Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="app_password" 
                          type="password" 
                          className="pl-9"
                          placeholder="xxxx-xxxx-xxxx-xxxx"
                          value={appPassword}
                          onChange={(e) => setAppPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIcloudOpen(false)}>Cancel</Button>
                    <Button onClick={handleIcloudConnect} disabled={submittingIcloud}>
                      {submittingIcloud && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Connect
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
