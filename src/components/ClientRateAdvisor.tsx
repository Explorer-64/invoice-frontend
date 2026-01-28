import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Sparkles, TrendingUp, Plus } from "lucide-react";
import brain from "brain";
import { RateDraft } from "utils/clientFormSchema";

interface Props {
  onAddRate: (rate: RateDraft) => void;
}

export const ClientRateAdvisor = ({ onAddRate }: Props) => {
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
        current_rate: 0, // We don't really have a single "current rate" to compare easily here, or could default to 0
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
    <Popover open={advisorOpen} onOpenChange={setAdvisorOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950">
          <Sparkles className="w-3.5 h-3.5" />
          Rate Advisor
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 max-h-[60vh] overflow-y-auto" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Market Rate Check
            </h4>
            <p className="text-xs text-muted-foreground">
              Compare your rates with local averages.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="advisor-trade" className="text-xs">Profession / Role</Label>
              <Input 
                id="advisor-trade" 
                placeholder="e.g. Electrician" 
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
              <Label htmlFor="advisor-scenario" className="text-xs">Job Context</Label>
              <Textarea
                id="advisor-scenario"
                placeholder="e.g. Remote camp job..."
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
              
              {advisorResult.suggested_rates && advisorResult.suggested_rates.length > 0 && (
                <div className="space-y-2 border-t border-border pt-2">
                  <div className="text-xs font-medium text-muted-foreground">Suggested Rates</div>
                  {advisorResult.suggested_rates.map((rate: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-background p-2 rounded border border-border group">
                      <div>
                        <div className="font-medium">{rate.name}</div>
                        <div className="text-muted-foreground text-[10px]">{rate.description}</div>
                        <div className="font-bold">${rate.amount} ({rate.rate_type})</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        title="Add to Rates"
                        onClick={() => {
                          onAddRate({
                            tempId: Date.now().toString() + index,
                            rate_type: (rate.rate_type === 'hourly' || rate.rate_type === 'daily' || rate.rate_type === 'travel' || rate.rate_type === 'piece' || rate.rate_type === 'fixed') ? rate.rate_type : 'fixed',
                            amount: parseFloat(rate.amount),
                            is_default: false,
                            currency: "USD"
                          });
                          toast.success(`Added ${rate.name} rate`);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
