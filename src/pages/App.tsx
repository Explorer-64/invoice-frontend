import React, { useEffect } from "react";
// import { useCurrentUser } from "app/auth";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import { SEO } from "components/SEO";

export default function App() {
  // const { user, loading } = useCurrentUser();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  /*
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard-page", { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading spinner while redirecting
  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }
  */

  // Render LandingPage directly for unauthenticated visitors
  // This avoids any flash of auth-protected content
  return (
    <>
      <SEO 
        title="Voice Invoice Assistant" 
        description="The AI voice assistant for contractors and freelancers. Track time, auto-detect job sites, and send invoices instantly."
      />
      <LandingPage />
    </>
  );
}
