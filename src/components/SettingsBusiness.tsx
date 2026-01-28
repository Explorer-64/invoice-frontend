import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import brain from "brain";
import { Translate } from "components/Translate";

interface BusinessProfile {
  company_name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  tax_id: string;
  logo_url?: string;
}

export function SettingsBusiness() {
  const [profile, setProfile] = useState<BusinessProfile>({
    company_name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    tax_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await brain.get_business_profile();
      const data = await res.json();
      setProfile({
        company_name: data.company_name || "",
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || "",
        website: data.website || "",
        tax_id: data.tax_id || "",
        logo_url: data.logo_url || "",
      });
    } catch (error) {
      console.error("Failed to fetch business profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await brain.update_business_profile(profile);
      toast.success("Business profile updated successfully");
    } catch (error) {
      console.error("Failed to update business profile:", error);
      toast.error("Failed to update business profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle><Translate>Business Profile</Translate></CardTitle>
        <CardDescription>
          <Translate>This information will appear on your invoices.</Translate>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label><Translate>Company Name</Translate></Label>
          <Input 
            value={profile.company_name} 
            onChange={(e) => handleChange("company_name", e.target.value)} 
            placeholder="e.g. Acme Construction"
          />
        </div>
        
        <div className="space-y-2">
          <Label><Translate>Business Address</Translate></Label>
          <Input 
            value={profile.address} 
            onChange={(e) => handleChange("address", e.target.value)} 
            placeholder="123 Business St, City, State, ZIP"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label><Translate>Business Email</Translate></Label>
            <Input 
              type="email"
              value={profile.email} 
              onChange={(e) => handleChange("email", e.target.value)} 
              placeholder="billing@acme.com"
            />
          </div>
          <div className="space-y-2">
            <Label><Translate>Phone</Translate></Label>
            <Input 
              value={profile.phone} 
              onChange={(e) => handleChange("phone", e.target.value)} 
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label><Translate>Website</Translate></Label>
            <Input 
              value={profile.website} 
              onChange={(e) => handleChange("website", e.target.value)} 
              placeholder="www.acme.com"
            />
          </div>
          <div className="space-y-2">
            <Label><Translate>Tax ID / EIN</Translate> (Optional)</Label>
            <Input 
              value={profile.tax_id} 
              onChange={(e) => handleChange("tax_id", e.target.value)} 
              placeholder="12-3456789"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Translate>Saving...</Translate> : <Translate>Save Changes</Translate>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
