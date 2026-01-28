import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NoIndex } from "components/NoIndex";
import { SiteFooter } from "components/SiteFooter";

export default function PrivacyPage() {
  const navigate = useNavigate();
  const effectiveDate = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    {
      title: "1. Who We Are & Scope",
      body: [
        "Invoice Jobs is owned and operated by Abram Reimer (“we,” “us,” or “our”). This Privacy Policy explains how we collect, use, disclose, and safeguard personal information when you use our English-language application, website, and related services (the “Service”).",
        "By using the Service, you acknowledge that we may process your information as described in this Policy and that we may provide supplemental terms where required by law."
      ]
    },
    {
      title: "2. Personal Information We Collect",
      body: [
        "We collect the categories of information described below when you interact with the Service:" 
      ],
      list: [
        "Account and contact details (name, email address, phone, company, profile photo).",
        "Client and billing data you input, including invoice contents, rates, and delivery preferences.",
        "Voice recordings, transcripts, prompts, and AI interactions used to execute commands or generate invoices.",
        "Calendar, geolocation, and time-tracking data when you connect integrations or enable GPS features.",
        "Usage, device, and diagnostics information (log files, browser type, IP address, cookie identifiers, crash reports).",
        "Payment metadata and subscription identifiers managed by PayPal, our third-party payment processor (we do not store full card numbers)."
      ]
    },
    {
      title: "3. How We Use Personal Information",
      body: [
        "We process personal information only for legitimate business and legal purposes, including:" 
      ],
      list: [
        "Providing, personalizing, and improving the Service, including AI-assisted features and automation steps.",
        "Authenticating users, securing accounts, and preventing fraud or abuse.",
        "Synchronizing with connected services (e.g., Google Calendar, email) at your direction.",
        "Generating invoices, reports, analytics, and notifications you request.",
        "Processing payments, subscriptions, and customer support interactions.",
        "Complying with legal obligations, resolving disputes, and enforcing our agreements."
      ]
    },
    {
      title: "4. Legal Bases for Processing",
      body: [
        "When required by laws such as the GDPR or UK Data Protection Act, we rely on the following legal bases:" 
      ],
      list: [
        "Performance of a contract when we deliver the Service you signed up for.",
        "Legitimate interests such as securing the platform, improving features, and preventing misuse (balanced against your rights).",
        "Compliance with legal obligations, including responding to lawful requests and maintaining business records.",
        "Consent, where you have expressly granted permission (e.g., marketing communications, optional integrations)."
      ]
    },
    {
      title: "5. Sharing & Disclosure",
      body: [
        "We do not sell personal information. We may disclose data to:" 
      ],
      list: [
        "Service providers under contract who process data on our behalf (hosting, analytics, customer support, AI providers).",
        "Integration partners you enable, such as Google Workspace, email services, cloud storage, or payment processors.",
        "Professional advisors, auditors, or regulators when necessary to comply with law or protect our rights.",
        "Other parties in connection with a business transaction (merger, acquisition), subject to confidentiality obligations."
      ]
    },
    {
      title: "6. Cookies & Tracking",
      body: [
        "We use cookies, local storage, and similar technologies to keep you signed in, measure performance, remember preferences, and secure the Service. You can modify browser settings to decline non-essential cookies, though certain features may not function properly."
      ]
    },
    {
      title: "7. Data Retention",
      body: [
        "We retain personal information for as long as needed to provide the Service, meet contractual or legal requirements, or resolve disputes. When data is no longer required, we delete or anonymize it according to our internal retention schedule, unless longer retention is mandated by law."
      ]
    },
    {
      title: "8. Security",
      body: [
        "We implement administrative, technical, and physical safeguards designed to protect personal information, including encryption in transit, restricted access, monitoring, and routine testing. No system is perfectly secure, and we cannot guarantee absolute security, but we continually improve our controls."
      ]
    },
    {
      title: "9. International Data Transfers",
      body: [
        "We operate from British Columbia, Canada, and may store or process data in Canada, the United States, or other jurisdictions where our service providers are located. When transferring data internationally, we rely on appropriate safeguards such as Standard Contractual Clauses, data processing agreements, and technical measures to protect your information."
      ]
    },
    {
      title: "10. Your Privacy Rights",
      body: [
        "Depending on your location, you may have rights to:" 
      ],
      list: [
        "Access, correct, or delete personal information we hold about you.",
        "Port your data to another service where technically feasible.",
        "Restrict or object to certain processing, including direct marketing.",
        "Withdraw consent at any time when we rely on consent.",
        "Lodge a complaint with your local supervisory authority."
      ]
    },
    {
      title: "11. Exercising Your Rights",
      body: [
        "To submit a privacy request, email support@stackapps.com with sufficient details for us to locate your account. We may ask for additional verification before fulfilling the request. We will respond within the timeframe required by applicable law.",
        "You may also adjust certain preferences directly in the application, including email notifications, connected calendars, and integrated services."
      ]
    },
    {
      title: "12. AI, Voice & Automation Features",
      body: [
        "Voice commands, transcripts, and AI-generated outputs are processed to fulfill your requests, improve accuracy, and prevent abuse. We may temporarily store audio snippets or transcripts to troubleshoot or enhance models, following access controls and deletion schedules.",
        "We do not rely on solely automated decision-making that produces legal or similarly significant effects without human oversight."
      ]
    },
    {
      title: "13. Children",
      body: [
        "The Service is intended for users 18 years or older. We do not knowingly collect personal information from children. If we learn that data was collected from someone under the age threshold, we will delete it promptly."
      ]
    },
    {
      title: "14. Changes to This Policy",
      body: [
        "We may update this Privacy Policy to reflect operational, legal, or regulatory changes. When we do, we will revise the effective date at the top of the page and, if the changes are material, provide additional notice or seek consent where required."
      ]
    },
    {
      title: "15. Contact",
      body: [
        "For questions or concerns about this Privacy Policy, please email support@stackapps.com."
      ]
    }
  ];

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
        
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">Effective date: {effectiveDate}</p>
        
        <div className="prose dark:prose-invert max-w-none space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul className="list-disc pl-6">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}