import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientWithRatesResponse } from "types";
import { Mail, Phone, MapPin, DollarSign, Calendar, Clock, Sparkles, TrendingUp, FileText } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import brain from "brain";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientWithRatesResponse | null;
  onEdit?: () => void;
}

export const ClientViewDialog = ({ open, onOpenChange, client, onEdit }: Props) => {
  if (!client) return null;

  const { client: details, rates } = client;
  const defaultRate = rates.find(r => r.is_default);
  const otherRates = rates.filter(r => !r.is_default);

  // Rate Advisor State
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [trade, setTrade] = useState("");
  const [experience, setExperience] = useState("Journeyman");
  const [yearsExperience, setYearsExperience] = useState("");
  const [advisorLocation, setAdvisorLocation] = useState("Vancouver, BC");
  const [advisorScenario, setAdvisorScenario] = useState("");
  const [advisorResult, setAdvisorResult] = useState<any | null>(null);
  const [isAdvising, setIsAdvising] = useState(false);

  const handleCheckRates = async () => {
    if (!trade.trim()) {
      toast.error("Trade required", { description: "Please enter your trade (e.g. Electrician)" });
      return;
    }

    setIsAdvising(true);
    try {
      const response = await brain.check_market_rates({
        trade,
        location: advisorLocation,
        experience_level: experience,
        years_experience: yearsExperience ? parseInt(yearsExperience) : undefined,
        current_rate: defaultRate ? parseFloat(defaultRate.amount.toString()) : 0,
        currency: "USD",
        scenario_description: advisorScenario || undefined
      });
      const data = await response.json();
      setAdvisorResult(data);
    } catch (error) {
      console.error("Rate check failed:", error);
      toast.error("Analysis failed", { description: "Could not fetch market rates." });
    } finally {
      setIsAdvising(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">{details.name}</DialogTitle>
          <DialogDescription>
            Client details and billing information
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6 py-4">
            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Contact Information</h3>
              
              <div className="grid gap-3">
                {details.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-foreground select-all">{details.email}</span>
                  </div>
                )}

                {details.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-foreground select-all">{details.phone}</span>
                  </div>
                )}

                {details.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-foreground whitespace-pre-wrap">{details.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-muted-foreground">
                    Client since {new Date(details.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Billing Information</h3>
                
                <Popover open={advisorOpen} onOpenChange={setAdvisorOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950">
                      <Sparkles className="w-3.5 h-3.5" />
                      Check Market Rates
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 max-h-[60vh] overflow-y-auto" align="end">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-medium leading-none flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-indigo-500" />
                          Market Rate Advisor
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          See how your pricing compares to local averages.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="advisor-trade" className="text-xs">Profession / Role</Label>
                          <Input 
                            id="advisor-trade" 
                            placeholder="e.g. Electrician, Graphic Designer, Lawyer" 
                            className="h-8 text-sm"
                            value={trade}
                            onChange={(e) => setTrade(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor="advisor-exp" className="text-xs">Experience</Label>
                            <Select value={experience} onValueChange={setExperience}>
                              <SelectTrigger id="advisor-exp" className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Entry Level">Entry Level / Apprentice</SelectItem>
                                <SelectItem value="Intermediate">Intermediate / Journeyman</SelectItem>
                                <SelectItem value="Senior">Senior / Master</SelectItem>
                                <SelectItem value="Expert">Expert / Principal</SelectItem>
                                <SelectItem value="Self-Taught">Self-Taught / Freelancer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="advisor-years" className="text-xs">Years</Label>
                            <Input 
                              id="advisor-years" 
                              type="number"
                              placeholder="#" 
                              className="h-8 text-sm"
                              value={yearsExperience}
                              onChange={(e) => setYearsExperience(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="advisor-loc" className="text-xs">Location</Label>
                          <Input 
                            id="advisor-loc" 
                            value={advisorLocation}
                            onChange={(e) => setAdvisorLocation(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="advisor-scenario" className="text-xs">Job Context (Optional)</Label>
                          <Textarea
                            id="advisor-scenario"
                            placeholder="e.g. Camp job, own trailer..."
                            className="h-16 text-sm resize-none"
                            value={advisorScenario}
                            onChange={(e) => setAdvisorScenario(e.target.value)}
                          />
                        </div>

                        <Button 
                          className="w-full h-8 text-xs" 
                          onClick={handleCheckRates}
                          disabled={isAdvising}
                        >
                          {isAdvising ? "Analyzing..." : "Analyze Rates"}
                        </Button>
                      </div>

                      {advisorResult && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-3 border border-border">
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs text-muted-foreground">Market Average</div>
                              <div className="text-lg font-bold text-foreground">
                                ${advisorResult.market_average}/hr
                              </div>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">
                              Range: ${advisorResult.market_low} - ${advisorResult.market_high}
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground border-t border-border pt-2">
                            <span className="font-medium text-foreground">Insight: </span>
                            {advisorResult.recommendation}
                          </div>

                          {advisorResult.suggested_rates && advisorResult.suggested_rates.length > 0 && (
                            <div className="space-y-2 border-t border-border pt-2">
                              <div className="text-xs font-medium text-muted-foreground">Suggested Rates</div>
                              {advisorResult.suggested_rates.map((rate: any, index: number) => (
                                <div key={index} className="flex items-center justify-between text-xs bg-background p-2 rounded border border-border">
                                  <div>
                                    <div className="font-medium">{rate.name}</div>
                                    <div className="text-muted-foreground text-[10px]">{rate.description}</div>
                                  </div>
                                  <div className="font-bold text-foreground">
                                    ${rate.amount}/{rate.rate_type === 'hourly' ? 'hr' : (rate.rate_type === 'daily' ? 'day' : rate.rate_type)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {advisorResult.rate_structure_advice && (
                              <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-blue-800 dark:text-blue-300 text-xs mt-2">
                                  <span className="font-medium">Structure: </span>
                                  {advisorResult.rate_structure_advice}
                              </div>
                          )}
                          
                          {!defaultRate && onEdit && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="w-full h-7 text-xs"
                              onClick={() => {
                                setAdvisorOpen(false);
                                onEdit(); // Redirect to edit mode where they can set it
                                toast.info("Set this rate in the Edit form");
                              }}
                            >
                              Set Rate in Edit Mode
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {defaultRate ? (
                          <>
                            ${Number(defaultRate.amount).toFixed(2)} / {defaultRate.rate_type === 'hourly' ? 'hour' : 'piece'}
                          </>
                        ) : (
                          "No default rate set"
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">Default Rate</span>
                    </div>
                  </div>

                  {otherRates.map(rate => (
                    <div key={rate.id} className="flex items-center gap-3 text-sm">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                             <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                 {rate.rate_type.substring(0, 2)}
                             </span>
                        </div>
                        <div className="flex flex-col">
                             <span className="font-medium text-foreground">
                                 ${Number(rate.amount).toFixed(2)} / {rate.rate_type === 'hourly' ? 'hour' : rate.rate_type}
                             </span>
                             <span className="text-xs text-muted-foreground capitalize">{rate.rate_type} Rate</span>
                        </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground capitalize">
                            {/* @ts-ignore */}
                            {details.invoice_template_type || "Standard"}
                        </span>
                        <span className="text-xs text-muted-foreground">Invoice Template</span>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {onEdit && (
            <Button variant="outline" onClick={() => {
              onOpenChange(false);
              onEdit();
            }}>
              Edit Client
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
