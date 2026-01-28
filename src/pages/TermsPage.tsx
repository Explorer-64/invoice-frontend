import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NoIndex } from "components/NoIndex";
import { SiteFooter } from "components/SiteFooter";

export default function TermsPage() {
  const navigate = useNavigate();
  const effectiveDate = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    {
      title: "1. Introduction & Acceptance",
      body: [
        "These Terms of Service (the “Terms”) constitute a legally binding agreement between Abram Reimer (“we,” “us,” or “our”) and you, the individual or organization accessing Invoice Jobs (the “Service”). By creating an account, accessing, or using any part of the Service, you confirm that you have read, understood, and agree to be bound by these Terms.",
        "If you are entering into these Terms on behalf of a company or another legal entity, you represent that you have the authority to bind that entity. If you do not agree to these Terms, you must not use the Service."
      ]
    },
    {
      title: "2. About the Service",
      body: [
        "Invoice Jobs is a voice-enabled productivity platform that helps contractors and freelancers track time, manage client information, and create and send invoices. Features may include, but are not limited to, AI-assisted voice commands, calendar integrations, location-aware session logging, invoice generation, secure document storage, and analytics dashboards.",
        "We may add, remove, or modify features at any time to improve performance, comply with law, or enhance user experience."
      ]
    },
    {
      title: "3. Eligibility & Account Responsibilities",
      body: [
        "You must be at least 18 years old (or the age of majority in your jurisdiction) and capable of forming a binding contract to use the Service.",
        "You agree to:"
      ],
      list: [
        "Provide accurate, complete, and current registration information.",
        "Maintain the security of your credentials and promptly notify us of unauthorized use.",
        "Ensure your use complies with all applicable laws, regulations, and professional obligations.",
        "Accept full responsibility for activity conducted under your account, including by team members or authorized users."
      ]
    },
    {
      title: "4. Subscriptions, Billing & Taxes",
      body: [
        "Some features require a paid subscription. When you subscribe, you authorize us and our payment processor to charge the payment method you provide for all applicable fees, taxes, and renewal charges.",
        "Unless otherwise stated, subscriptions renew automatically at the end of each billing cycle. You may cancel renewal in-app, but fees already paid are non-refundable except where required by law.",
        "You are responsible for all taxes, duties, and government charges associated with your use of the Service, excluding taxes based on our income."
      ]
    },
    {
      title: "5. Acceptable Use",
      body: [
        "You agree not to use the Service for any unlawful, harmful, or abusive purpose. Prohibited conduct includes (but is not limited to):"
      ],
      list: [
        "Attempting to interfere with or compromise the integrity or security of the Service.",
        "Reverse engineering, decompiling, or exploiting the Service’s source code except where permitted by law.",
        "Uploading or transmitting malware, spam, or content that infringes intellectual property, privacy, or publicity rights.",
        "Harassing, threatening, or impersonating others, or misrepresenting your affiliation with a person or entity.",
        "Using automated means to scrape, harvest, or access data outside of documented APIs.",
        "Processing personal data without a valid legal basis or in violation of applicable privacy laws."
      ]
    },
    {
      title: "6. Intellectual Property",
      body: [
        "All intellectual property rights in the Service, including software, trademarks, logos, and documentation, belong to Abram Reimer or our licensors. Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes.",
        "No rights are granted except as explicitly set forth here."
      ]
    },
    {
      title: "7. User Content & Feedback",
      body: [
        "You retain ownership of the data, text, audio commands, documents, and other content you submit (“User Content”). You grant us a worldwide, royalty-free license to host, process, transmit, and display User Content solely as needed to provide and improve the Service.",
        "You represent that you have all rights necessary to grant this license and that your User Content complies with applicable law.",
        "If you provide feedback or suggestions, you grant us permission to use them without obligation or compensation."
      ]
    },
    {
      title: "8. Third-Party Services & Integrations",
      body: [
        "The Service may integrate with third-party platforms (e.g., Google Calendar, email providers, cloud storage, AI models). Use of those integrations is subject to the third party’s terms and privacy policies.",
        "We do not control and are not responsible for third-party services. Enabling an integration authorizes us to exchange relevant data with the third party to operate the feature."
      ]
    },
    {
      title: "9. Privacy & Data Protection",
      body: [
        "Our Privacy Policy describes how we collect, use, and safeguard personal data. By using the Service, you acknowledge that data processing described there is necessary to fulfill the contract between you and us.",
        "You are responsible for obtaining any consents required from your own end users or clients and for ensuring your compliance with applicable privacy laws when you upload or process their data."
      ]
    },
    {
      title: "10. Service Availability, Updates & Beta Features",
      body: [
        "We aim to keep the Service available 24/7, but downtime may occur for maintenance, updates, or events beyond our control. We may provide access to pre-release or beta features; such features are provided “as is” and may be withdrawn at any time.",
        "We may push security patches or updates automatically. You agree that we may apply updates without additional notice."
      ]
    },
    {
      title: "11. Disclaimers",
      body: [
        "To the fullest extent permitted by law, the Service is provided on an “as is” and “as available” basis without warranties of any kind, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, title, or non-infringement.",
        "We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components, or that data outputs will meet your requirements."
      ]
    },
    {
      title: "12. Limitation of Liability",
      body: [
        "To the maximum extent permitted by law, in no event will Abram Reimer or our suppliers be liable for any indirect, consequential, exemplary, punitive, or special damages, or for lost profits, revenues, goodwill, or data arising out of or relating to the Service or these Terms, even if advised of the possibility of such damages.",
        "Our aggregate liability for any claim arising out of or relating to the Service will not exceed the amounts you paid to us for the Service during the twelve (12) months preceding the event giving rise to liability.",
        "Some jurisdictions do not allow the exclusion or limitation of certain damages; in those jurisdictions, our liability will be limited to the extent permitted by law."
      ]
    },
    {
      title: "13. Indemnification",
      body: [
        "You agree to indemnify, defend, and hold harmless Abram Reimer and our officers, contractors, and affiliates from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related to: (a) your use or misuse of the Service; (b) your breach of these Terms or applicable law; or (c) your User Content or data processing practices."
      ]
    },
    {
      title: "14. Term & Termination",
      body: [
        "These Terms take effect when you first access the Service and remain in force until terminated. You may stop using the Service at any time, and you may delete your account via in-app controls.",
        "We may suspend or terminate your access if you violate these Terms, fail to pay fees, or create risk of harm. Upon termination, your right to use the Service stops immediately, but Sections 6 through 17 will continue to apply."
      ]
    },
    {
      title: "15. Governing Law & Dispute Resolution",
      body: [
        "These Terms and any dispute arising out of or relating to them are governed by the laws of the Province of British Columbia and the federal laws of Canada applicable therein, without regard to conflict of laws rules.",
        "You agree that the courts located in British Columbia, Canada have exclusive jurisdiction, and you consent to personal jurisdiction in those courts."
      ]
    },
    {
      title: "16. International Use & Export Controls",
      body: [
        "You are responsible for compliance with local laws when accessing the Service from outside Canada. You represent that you are not located in a jurisdiction embargoed by Canada, the United States, or other applicable authorities, and that you are not on any government list of prohibited or restricted parties."
      ]
    },
    {
      title: "17. Changes to These Terms",
      body: [
        "We may update these Terms from time to time to reflect changes in law, technology, or Service offerings. When we do, we will revise the “Effective date” at the top of this page and, where required, provide additional notice. Continued use of the Service after changes become effective constitutes acceptance of the updated Terms."
      ]
    },
    {
      title: "18. Contact",
      body: [
        "For questions about the Service or these Terms, email support@stackapps.com."
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
        
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
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
