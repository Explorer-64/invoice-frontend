import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Copy, Mail, MapPin, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "components/PageHeader";
import { SiteFooter } from "components/SiteFooter";

export default function ContactPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const email = "support@invoicejobs.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for form submission
    toast.success("Message sent!", {
      description: "We'll get back to you as soon as possible."
    });
  };

  return (
    <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8 px-4 md:px-6">
            <div className="mb-8">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Get in touch</h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Have questions about Invoice Jobs? We're here to help you streamline your billing process.
                    </p>
                    
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1">Email Support</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        For general inquiries and support requests.
                                    </p>
                                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border">
                                        <code className="text-sm flex-1">{email}</code>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopyEmail}>
                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            <span className="sr-only">Copy email</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1">Feedback</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We value your feedback! Let us know how we can improve your experience.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Send us a message</CardTitle>
                        <CardDescription>
                            Fill out the form below and we'll respond within 24 hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first-name">First name</Label>
                                    <Input id="first-name" placeholder="John" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last-name">Last name</Label>
                                    <Input id="last-name" placeholder="Doe" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="john@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="How can we help?" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea 
                                    id="message" 
                                    placeholder="Tell us more about your inquiry..." 
                                    className="min-h-[120px]"
                                    required 
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
        <SiteFooter />
    </div>
  );
}
