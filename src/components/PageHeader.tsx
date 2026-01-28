import { Mic, MessageSquare } from 'lucide-react';
import { Navigation } from './Navigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';
import brain from 'brain';
import { toast } from 'sonner';
import { Translate } from "components/Translate";

export interface Props {
  title?: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: Props) {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await brain.submit_feedback({ feedback: feedbackText });
      toast.success("Thanks for your feedback!");
      setFeedbackOpen(false);
      setFeedbackText("");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title ? <Translate>{title}</Translate> : 'Invoice My Jobs'}
                </h1>
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">BETA</Badge>
              </div>
              {subtitle && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <Translate>{subtitle}</Translate>
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <Translate>Feedback</Translate>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle><Translate>Send Beta Feedback</Translate></DialogTitle>
                  <DialogDescription>
                    <Translate>Found a bug or have a suggestion? We'd love to hear from you!</Translate>
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea 
                    placeholder="Tell us what you think..." 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleFeedbackSubmit} disabled={isSubmitting || !feedbackText.trim()}>
                    {isSubmitting ? <Translate>Sending...</Translate> : <Translate>Send Feedback</Translate>}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Navigation />
          </div>
        </div>
      </div>
    </header>
  );
}
