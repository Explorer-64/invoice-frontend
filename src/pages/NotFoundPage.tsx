import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SiteFooter } from "components/SiteFooter";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="text-2xl font-bold mt-4 mb-2">Page not found</h2>
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-xs text-muted-foreground mb-8 font-mono">
          Path: {location.pathname}
        </p>
        <Button asChild>
          <a href="/">Go back home</a>
        </Button>
      </div>
      <SiteFooter />
    </div>
  );
}