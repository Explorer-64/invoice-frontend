import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import type { Invoice, BusinessProfile } from "types";
import brain from "brain";
import { useUserGuardContext } from "app";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | InvoiceListItem | null;
  onSend: (invoiceId: number, subject: string, message: string) => Promise<void>;
}

export function InvoiceEmailDialog({ open, onOpenChange, invoice, onSend }: Props) {
  const { user } = useUserGuardContext();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    if (open) {
      // Fetch business profile when dialog opens
      const fetchProfile = async () => {
        try {
          const res = await brain.get_business_profile();
          const data = await res.json();
          setBusinessProfile(data);
        } catch (error) {
          console.error('Failed to fetch business profile:', error);
        }
      };
      fetchProfile();
    }
  }, [open]);

  useEffect(() => {
    if (open && invoice && businessProfile !== null) {
      const businessName = businessProfile?.company_name || user?.displayName || user?.email?.split('@')[0] || 'Your Business';
      setSubject(`Invoice ${invoice.invoice_number} from ${businessName}`);
      setMessage(`Hi ${invoice.client_name},

Please find attached invoice ${invoice.invoice_number} for $${invoice.total.toFixed(2)}.

Thank you for your business!

Best regards,
${businessName}`);
    }
  }, [open, invoice, businessProfile, user]);

  const handleSend = async () => {
    if (!invoice) return;
    setIsSending(true);
    try {
      await onSend(invoice.id, subject, message);
      onOpenChange(false);
    } catch (error) {
       // Parent handles errors
       console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Invoice via Email</DialogTitle>
          <DialogDescription>
            Customize the email subject and message. The invoice PDF will be attached automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Invoice Subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-message">Message</Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Email message..."
              rows={6}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
