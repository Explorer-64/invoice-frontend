import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "How does the voice assistant work?",
      answer: "Just tap the microphone button and speak naturally. You can say \"Start a session for Smith Kitchen\", \"Log 4 hours for Jones\", or \"Create an invoice for last week's work\". Our AI understands your intent and handles the data entry for you."
    },
    {
      question: "Can I use this offline?",
      answer: "Yes! Invoice My Jobs is a Progressive Web App (PWA). You can install it on your phone's home screen and use it offline. While offline, information must be entered manually, as the AI voice assistant requires an active internet connection. Your data will sync automatically when you're back online."
    },
    {
      question: "Is it free to use?",
      answer: "We offer a free tier perfect for getting started. For unlimited clients, invoices, and advanced features like Auto Check-In, check out our affordable pricing plans."
    },
    {
      question: "How do I send invoices?",
      answer: "You can generate professional PDF invoices instantly. The app can email them directly to your clients, or you can download them to your device."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption and secure cloud storage. Your data is yours, and we prioritize your privacy."
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold text-center mb-8 text-foreground">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
