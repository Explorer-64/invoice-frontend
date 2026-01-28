import React from "react";

export type Props = {};
import { APP_BASE_PATH } from "app";
import { Mail, Mic } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { triggerCookieSettings } from "utils/cookieConsent";

export function SiteFooter() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Privacy", path: "/privacy-page" },
    { label: "Terms", path: "/terms-page" },
    { label: "Contact", path: "/contact-page" },
    { label: "Cookie Policy", path: "/cookie-policy-page" },
  ];

  return (
    <footer className="bg-background border-t border-border py-10 px-4 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="p-1.5 bg-primary rounded-lg">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>Invoice My Jobs</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Voice-first invoicing and time tracking for contractors. Built for busy crews that need quick, accurate billing without spreadsheets.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <a href="mailto:support@stackapps.com" className="hover:text-foreground">
              support@stackapps.com
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <button className="hover:text-foreground" onClick={triggerCookieSettings}>
              Cookie Settings
            </button>
          </div>
          <p>© {currentYear} Invoice My Jobs. All rights reserved.</p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Need to revisit your consent?</p>
          <Button variant="outline" onClick={triggerCookieSettings}>
            Manage Cookie Preferences
          </Button>
        </div>
      </div>
    </footer>
  );
}
