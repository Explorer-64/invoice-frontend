import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
import { Trash2, Star, StarOff, Plus } from "lucide-react";
import { ClientFormValues } from "utils/clientFormSchema";
import { ClientRateAdvisor } from "./ClientRateAdvisor";

export const ClientRatesForm = () => {
  const { control, register, setValue, watch } = useFormContext<ClientFormValues>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "rates",
  });

  const handleSetDefault = (index: number) => {
    const rates = watch("rates");
    rates.forEach((rate, i) => {
       if (i === index) {
          update(i, { ...rate, is_default: !rate.is_default });
       } else {
          update(i, { ...rate, is_default: false });
       }
    });
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-1">Billing Rates</h3>
          <p className="text-sm text-muted-foreground">
            Configure rates for different services, travel, or allowances.
          </p>
        </div>
        <ClientRateAdvisor onAddRate={(rate) => append(rate)} />
      </div>

      <div className="space-y-3">
        {fields.map((rate, index) => (
          <div key={rate.id} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border group relative">
            <div className="grid grid-cols-12 gap-2 flex-1">
              <div className="col-span-4">
                <Label className="text-[10px] text-muted-foreground uppercase">Type</Label>
                <Select
                  value={watch(`rates.${index}.rate_type`)}
                  onValueChange={(val: any) => setValue(`rates.${index}.rate_type`, val)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily (Day Rate)</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="piece">Piece Work</SelectItem>
                    <SelectItem value="fixed">Fixed Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <Label className="text-[10px] text-muted-foreground uppercase">Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="h-8 text-sm"
                  placeholder="0.00"
                  {...register(`rates.${index}.amount`)}
                />
              </div>
              <div className="col-span-4 flex items-end pb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={watch(`rates.${index}.is_default`) ? "secondary" : "ghost"}
                        size="sm"
                        className={`w-full h-8 text-xs justify-start px-2 ${watch(`rates.${index}.is_default`) ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 hover:bg-yellow-200" : "text-muted-foreground"}`}
                        onClick={() => handleSetDefault(index)}
                      >
                        {watch(`rates.${index}.is_default`) ? (
                          <><Star className="w-3 h-3 mr-1.5 fill-current" /> Default</>
                        ) : (
                          <><StarOff className="w-3 h-3 mr-1.5" /> Set Default</>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Default rate used for new sessions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive mt-5"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="w-full border-dashed text-muted-foreground"
          onClick={() => append({ rate_type: "hourly", amount: 0, currency: "USD", is_default: fields.length === 0, tempId: Date.now().toString() })}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Another Rate
        </Button>
      </div>
    </div>
  );
};
