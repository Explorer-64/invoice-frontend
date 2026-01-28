import { useState } from "react";
import brain from "brain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Translate } from "components/Translate";

export function SettingsFeedback() {
  const [feedbackType, setFeedbackType] = useState("general");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setSubmittingFeedback(true);
      await brain.submit_feedback({
        type: feedbackType,
        message: feedbackMessage,
      });
      toast.success("Feedback submitted successfully!");
      setFeedbackMessage("");
      setFeedbackType("general");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><Translate>Send Feedback</Translate></CardTitle>
        <CardDescription>
          <Translate>Help us improve! Report bugs, suggest features, or share your thoughts.</Translate>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmitFeedback}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type"><Translate>Feedback Type</Translate></Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general"><Translate>General Feedback</Translate></SelectItem>
                <SelectItem value="feature"><Translate>Feature Request</Translate></SelectItem>
                <SelectItem value="bug"><Translate>Bug Report</Translate></SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message"><Translate>Message</Translate></Label>
            <Textarea
              id="message"
              placeholder="Tell us what you think..."
              className="min-h-[150px]"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={submittingFeedback} className="w-full">
            {submittingFeedback ? <Translate>Submitting...</Translate> : <Translate>Submit Feedback</Translate>}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
