import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NoIndex } from "components/NoIndex";
import { SiteFooter } from "components/SiteFooter";

export default function CookiePolicyPage() {
  const navigate = useNavigate();
  const effectiveDate = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <NoIndex />
      <div className="container max-w-4xl py-8 px-4 md:px-6">
        <div className="mb-8">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Effective date: {effectiveDate}</p>
        
        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">1. What are cookies?</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to the owners of the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">2. How we use cookies</h2>
            <p className="mb-4">
              We use cookies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep you signed in to the application</li>
              <li>Understand how you use our website</li>
              <li>Remember your preferences</li>
              <li>Improve your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">3. Types of cookies we use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Essential Cookies</h3>
                <p>
                  These are necessary for the website to function and cannot be switched off. 
                  They include cookies for authentication and security.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                <p>
                  These allow us to count visits and traffic sources so we can measure and improve the performance of our site.
                  They help us know which pages are popular and see how visitors move around the site.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">4. Managing cookies</h2>
            <p className="mb-4">
              You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
              If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">5. Contact us</h2>
            <p>
              If you have any questions about our use of cookies, please email support@stackapps.com.
            </p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
