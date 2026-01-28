import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MapPin, FileText, Check, ArrowRight, WifiOff, Clock, Shield } from "lucide-react";
import { PWAInstallButton } from "components/PWAInstallButton";
import { Navigation } from "components/Navigation";
import { useCurrentUser } from "app/auth";
import { FAQSection } from "components/FAQSection";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "components/SiteFooter";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard-page", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="p-1.5 bg-primary rounded-lg">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>Invoice My Jobs</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button onClick={handleGetStarted}>Start Free Trial</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center overflow-hidden">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New: AI Voice Assistant
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              The Voice Assistant for <br/>
              <span className="text-primary">Contractors & Freelancers</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Track time, detect job sites, and send invoices just by talking. 
              Focus on your work, not the paperwork.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-lg h-12 px-8" onClick={handleGetStarted}>
                Start for Free <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="w-full sm:w-auto">
                <PWAInstallButton />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-secondary/30 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to get paid faster</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built specifically for mobile professionals who need simple, powerful tools.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={Mic}
                title="Voice Commands"
                description="Just say 'Start session for Smith' or 'Create invoice'. Our AI handles the rest."
              />
              <FeatureCard 
                icon={MapPin}
                title="Auto Check-In"
                description="Automatically detects when you arrive at a job site and prompts to start tracking."
              />
              <FeatureCard 
                icon={FileText}
                title="Instant Invoices"
                description="Generate professional PDF invoices in seconds and email them directly to clients."
              />
              <FeatureCard 
                icon={WifiOff}
                title="Works Offline"
                description="No signal? No problem. Track time and view data offline. Syncs when you're back."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
            
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 md:before:mx-auto before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/20 before:to-transparent">
              <Step 
                number="1"
                title="Speak to Start"
                description="Tap the mic and tell the assistant what you're working on. It sets up the client and starts the timer."
                icon={Mic}
              />
              <Step 
                number="2"
                title="Track Automatically"
                description="The app tracks your hours, detects breaks, and logs your location for accurate billing."
                icon={Clock}
                align="right"
              />
              <Step 
                number="3"
                title="Get Paid"
                description="When the job is done, say 'Send invoice'. The app generates a PDF and emails it to your client."
                icon={Check}
              />
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="py-20 bg-primary text-primary-foreground px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl opacity-90 mb-10">
              Start for free. Upgrade when you grow.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left mb-10">
              <div className="bg-background text-foreground p-8 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
                <div className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> 1 Client</li>
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> 1 Active Invoice</li>
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> 10 Voice Commands/mo</li>
                </ul>
                <Button className="w-full" variant="outline" onClick={handleGetStarted}>Get Started Free</Button>
              </div>
              
              <div className="bg-background text-foreground p-8 rounded-2xl shadow-xl border-2 border-primary-foreground/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> 10 Clients</li>
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> Unlimited Invoices</li>
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> GPS Auto-Tracking</li>
                  <li className="flex items-center gap-2"><Check className="w-5 h-5 text-primary" /> Priority Support</li>
                </ul>
                <Button className="w-full" onClick={handleGetStarted}>Start Free Trial</Button>
              </div>
            </div>

            <div className="text-center">
              <Button variant="link" className="text-primary-foreground hover:text-white" onClick={() => navigate('/pricing-page')}>
                View all plans and features <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <FAQSection />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function Step({ number, title, description, icon: Icon, align = "left" }: { number: string, title: string, description: string, icon: any, align?: "left" | "right" }) {
  return (
    <div className={`relative flex items-center justify-between md:justify-normal md:gap-8 ${align === "right" ? "md:flex-row-reverse" : ""}`}>
      <div className="hidden md:block w-1/2" />
      
      <div className="absolute left-0 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-background border-4 border-primary text-primary font-bold text-xl z-10 shadow-sm">
        {number}
      </div>
      
      <div className="ml-16 md:ml-0 md:w-1/2 p-6 bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-secondary rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
