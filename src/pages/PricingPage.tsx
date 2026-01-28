import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { backend as apiClient } from 'app';
import { useCurrentUser } from "app/auth";
import { PageHeader } from 'components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, ShieldCheck, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SEO } from 'components/SEO';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SiteFooter } from "components/SiteFooter";

const PricingPage = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Record<string, string>>({});
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("none");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showCancelledDialog, setShowCancelledDialog] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [planRes, statusRes] = await Promise.all([
          apiClient.get_plan_id(),
          apiClient.get_subscription_status()
        ]);
        
        const planData = await planRes.json();
        const statusData = await statusRes.json();
        
        setPlans(planData.plans || {});
        setClientId(planData.paypal_client_id);
        setCurrentPlan(statusData.plan || "free");
        setIsSubscriptionActive(statusData.is_active);
        setSubscriptionStatus(statusData.status);
        setExpiresAt(statusData.expires_at || null);
      } catch (error) {
        console.error("Failed to load pricing data:", error);
        toast.error("Failed to load pricing information");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleApprove = async (data: any) => {
    setVerifying(true);
    try {
      console.log("Verifying subscription:", data.subscriptionID);
      await apiClient.verify_subscription({ subscription_id: data.subscriptionID });
      toast.success("Subscription active! Welcome to the new plan.");
      // Refresh status
      const statusRes = await apiClient.get_subscription_status();
      const statusData = await statusRes.json();
      setCurrentPlan(statusData.plan);
      setIsSubscriptionActive(statusData.is_active);
      setSubscriptionStatus(statusData.status);
      setExpiresAt(statusData.expires_at || null);
    } catch (error: any) {
      console.error("Verification failed:", error);
      
      // Extract error detail if available
      let errorMessage = "Failed to verify subscription. Please contact support.";
      if (error.json) {
          try {
              const errData = await error.json();
              if (errData.detail) {
                if (typeof errData.detail === "string") {
                  errorMessage = errData.detail;
                } else if (Array.isArray(errData.detail)) {
                   errorMessage = errData.detail.map((e: any) => e.msg || "Unknown error").join("; ");
                } else if (typeof errData.detail === "object") {
                   errorMessage = errData.detail.msg || JSON.stringify(errData.detail);
                }
              }
          } catch (e) {}
      }

      toast.error("Verification Failed", {
        description: (
           <div className="flex flex-col gap-2">
              <p>{errorMessage}</p>
              <p className="text-xs font-mono bg-muted p-1 rounded select-all">
                 ID: {data.subscriptionID}
              </p>
              <p className="text-xs">Please copy this ID and send it to support.</p>
           </div>
        ),
        duration: 10000, // Long duration
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose premium features at the end of your billing period.")) return;
    try {
      await apiClient.cancel_subscription();
      toast.success("Subscription cancelled.");
      const statusRes = await apiClient.get_subscription_status();
      const statusData = await statusRes.json();
      setCurrentPlan(statusData.plan);
      setIsSubscriptionActive(statusData.is_active);
      setSubscriptionStatus(statusData.status);
      setExpiresAt(statusData.expires_at || null);
    } catch (error) {
      console.error("Cancellation failed:", error);
      toast.error("Failed to cancel subscription.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Pricing Plans" subtitle="Choose the plan that works for you" />
        <div className="container mx-auto max-w-7xl px-4 py-8 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Don't render PayPal if clientId is missing
  if (!clientId) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Pricing Plans" subtitle="Choose the plan that works for you" />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive font-medium">PayPal is not configured. Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  const CancelledDialog = () => {
    const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
    const date = expiresAt ? new Date(expiresAt).toLocaleDateString() : 'soon';
    const paypalPlanId = plans[currentPlan];

    return (
      <Dialog open={showCancelledDialog} onOpenChange={setShowCancelledDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscription Cancelled</DialogTitle>
            <DialogDescription>
              Your {planName} plan is active until <strong>{date}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                What happens to my data?
              </p>
              <p>
                Your data will be safe! After {date}, your account will revert to the <strong>Free plan</strong>.
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-muted-foreground">
                <li>You will retain access to all existing clients and invoices.</li>
                <li>You won't be able to create <strong>new</strong> clients or invoices if you exceed the Free plan limits (1 client, 1 active invoice).</li>
              </ul>
            </div>

            <div className="pt-2">
               <p className="text-sm text-muted-foreground mb-3">
                 Changed your mind? Resubscribe now to continue without interruption.
               </p>
               {paypalPlanId && clientId ? (
                   <PayPalWrapper 
                      planId={paypalPlanId} 
                      onApprove={(data: any) => {
                        setShowCancelledDialog(false);
                        handleApprove(data);
                      }} 
                   />
               ) : (
                 <Button disabled className="w-full">Unavailable</Button>
               )}
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setShowCancelledDialog(false)}
            >
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const PaymentDialog = () => {
    const planId = selectedPlanForPayment ? plans[selectedPlanForPayment] : null;
    const planName = selectedPlanForPayment ? selectedPlanForPayment.charAt(0).toUpperCase() + selectedPlanForPayment.slice(1) : '';

    return (
      <Dialog open={!!selectedPlanForPayment} onOpenChange={(open) => !open && setSelectedPlanForPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {planName}</DialogTitle>
            <DialogDescription>
              Complete your subscription securely with PayPal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {planId && clientId ? (
              <PayPalWrapper 
                planId={planId} 
                onApprove={(data: any) => {
                  setSelectedPlanForPayment(null);
                  handleApprove(data);
                }} 
              />
            ) : (
              <div className="text-center text-muted-foreground p-4">
                Plan details unavailable. Please try again later.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const PlanCard = ({ 
    title, 
    price, 
    features, 
    planKey, 
    isPopular = false,
    description
  }: { 
    title: string, 
    price: string, 
    features: { text: string, included: boolean }[], 
    planKey: string,
    isPopular?: boolean,
    description: string
  }) => {
    const isCurrent = currentPlan === planKey && isSubscriptionActive;
    const isFree = planKey === 'free';
    const paypalPlanId = plans[planKey];
    
    // Admin check (simple frontend check to match backend logic for UX)
    const isAdmin = user?.primaryEmail === "abereimer64@gmail.com";
    const isBetaMode = !isAdmin;

    return (
      <Card className={`relative flex flex-col ${isCurrent ? "border-green-500 border-2 shadow-lg" : isPopular ? "border-primary shadow-md" : "border-muted"}`}>
        {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>}
        {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">CURRENT PLAN</div>}
        
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <div className="mt-4 text-3xl font-bold">{price}<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-3 text-sm">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                {f.included ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={f.included ? "" : "text-muted-foreground"}>{f.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="mt-auto pt-4">
          {isCurrent ? (
            <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50" disabled>Active Plan</Button>
          ) : isFree ? (
             // Downgrade to free logic (cancellation) logic is separate, usually via cancel button
             <Button variant="outline" className="w-full" disabled>Free Plan</Button>
          ) : (
            <div className="w-full">
              {isBetaMode ? (
                <Button className="w-full" variant="secondary" disabled>
                  Free during Beta
                </Button>
              ) : paypalPlanId && clientId ? (
                   <Button 
                     className="w-full" 
                     onClick={() => setSelectedPlanForPayment(planKey)}
                   >
                     {currentPlan === 'free' ? "Upgrade" : "Switch Plan"}
                   </Button>
              ) : (
                <Button className="w-full" variant="secondary" disabled>
                  {clientId ? "Not Configured" : "Loading..."}
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 relative">
      {verifying && (
         <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please do not close this window.</p>
         </div>
      )}
      <SEO 
        title="Pricing" 
        description="Simple pricing for contractors. Free tier available. Upgrade for unlimited clients, invoices, and GPS auto-tracking." 
        url="https://invoicejobs.com/pricing-page"
      />
      <PageHeader title="Upgrade Plan" description="Choose the perfect plan for your business" />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {isSubscriptionActive && currentPlan !== 'free' && (
           <div className="mb-8 flex justify-end">
              {subscriptionStatus === 'cancelled' ? (
                <Button 
                  variant="outline" 
                  className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  onClick={() => setShowCancelledDialog(true)}
                >
                  Subscription Cancelled
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleCancel} size="sm">Cancel Subscription</Button>
              )}
           </div>
        )}

        <PayPalScriptProvider options={{ 
          clientId: clientId || "test", // Fallback to prevent crash if loading, though checked above
          intent: "subscription",
          vault: true
        }}>
          <CancelledDialog />
          <PaymentDialog />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <PlanCard 
              title="Free" 
              price="$0" 
              description="For trying it out"
              planKey="free"
              features={[
                { text: "1 Client", included: true },
                { text: "1 Active Invoice", included: true },
                { text: "10 Voice Commands/mo", included: true },
                { text: "Manual Time Tracking", included: true },
                { text: "Auto Check-In", included: false },
              ]}
            />
            <PlanCard 
              title="Starter" 
              price="$4.99" 
              description="For side hustles"
              planKey="starter"
              features={[
                { text: "5 Clients", included: true },
                { text: "Unlimited Invoices", included: true },
                { text: "50 Voice Commands/mo", included: true },
                { text: "Manual Time Tracking", included: true },
                { text: "Auto Check-In", included: false },
              ]}
            />
            <PlanCard 
              title="Pro" 
              price="$9.99" 
              description="For professionals"
              planKey="pro"
              isPopular={true}
              features={[
                { text: "10 Clients", included: true },
                { text: "Unlimited Invoices", included: true },
                { text: "100 Voice Commands/mo", included: true },
                { text: "Auto Check-In", included: true },
                { text: "Priority Support", included: true },
              ]}
            />
             <PlanCard 
              title="Unlimited" 
              price="$29.99" 
              description="For power users"
              planKey="unlimited"
              features={[
                { text: "Unlimited Clients", included: true },
                { text: "Unlimited Invoices", included: true },
                { text: "Unlimited Voice Commands", included: true },
                { text: "Auto Check-In", included: true },
                { text: "Priority Support", included: true },
              ]}
            />
          </div>
        </PayPalScriptProvider>
      </div>
      <SiteFooter />
    </div>
  );
};

// Helper component to access the context if needed, but mainly to separate the logic
const PayPalWrapper = ({ planId, onApprove }: { planId: string, onApprove: any }) => {
  return (
    <PayPalButtons 
      style={{ shape: 'rect', color: 'blue', layout: 'vertical', label: 'subscribe', height: 40 }}
      createSubscription={(data, actions) => {
        return actions.subscription.create({
          plan_id: planId
        });
      }}
      onApprove={onApprove}
      onCancel={() => toast.info("Subscription flow cancelled")}
      onError={(err) => {
        console.error("PayPal Button Error:", err);
        toast.error("PayPal Error", { description: "An error occurred with the PayPal interface. Please try again." });
      }}
    />
  );
};

export default PricingPage;
