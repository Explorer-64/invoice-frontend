import { useState, useEffect } from "react";
import { useCurrentUser } from "app/auth";
import { PageHeader } from "components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, MessageSquare, ShieldAlert, Briefcase, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { SettingsAccount } from "components/SettingsAccount";
import { SettingsIntegrations } from "components/SettingsIntegrations";
import { SettingsBusiness } from "components/SettingsBusiness";
import { SettingsFeedback } from "components/SettingsFeedback";
import { SettingsAdmin } from "components/SettingsAdmin";
import { Translate } from "components/Translate";

export default function SettingsPage() {
  const { user } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "account");
  
  const isAdmin = user?.primaryEmail === "abereimer64@gmail.com";

  useEffect(() => {
    // Update URL when tab changes
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 md:pb-0">
        <PageHeader title="Settings" subtitle="Manage your account and preferences" />
        <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="bg-card border rounded-lg p-8 shadow-sm max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4"><Translate>Please Sign In</Translate></h2>
            <p className="text-muted-foreground mb-6">
              <Translate>You need to be signed in to manage your settings.</Translate>
            </p>
            <Button asChild className="w-full">
              <a href="/login"><Translate>Sign In</Translate></a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 md:pb-0">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline"><Translate>Account</Translate></span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline"><Translate>Business</Translate></span>
            </TabsTrigger>
             {/* Items tab removed */}
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline"><Translate>Integrations</Translate></span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline"><Translate>Feedback</Translate></span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                <span className="hidden sm:inline"><Translate>Admin</Translate></span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <SettingsAccount />
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business">
            <SettingsBusiness />
          </TabsContent>

          {/* Items Tab removed */}

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <SettingsIntegrations />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <SettingsFeedback />
          </TabsContent>

          {/* Admin Tab */}
          {isAdmin && (
            <TabsContent value="admin">
              <SettingsAdmin />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
