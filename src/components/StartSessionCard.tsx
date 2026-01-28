import { useState } from "react";
import { Play, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { ClientResponse } from "types";
import brain from "brain";
import { toast } from "sonner";
import { Translate } from "components/Translate";

interface Props {
  clients: ClientResponse[];
  onStart: (clientId: string) => void;
  isStarting: boolean;
  onAddClient: () => void;
  onClientAdded?: () => void;
}

export function StartSessionCard({ clients, onStart, isStarting, onAddClient, onClientAdded }: Props) {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedClient = clients.find((c) => c.id.toString() === selectedClientId);

  const handleStart = () => {
    if (selectedClientId) {
      onStart(selectedClientId);
      setSelectedClientId("");
    }
  };

  const handleCreateAndSelect = async () => {
    if (!searchTerm.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await brain.create_client({
        name: searchTerm.trim(),
        email: null,
        phone: null,
        address: null,
      });
      const newClient = await response.json();
      toast.success(`Client "${newClient.name}" created`);
      
      setSelectedClientId(newClient.id.toString());
      setOpen(false);
      setSearchTerm("");
      
      // Refresh client list
      if (onClientAdded) {
        onClientAdded();
      }
    } catch (error) {
      console.error("Failed to create client:", error);
      toast.error("Failed to create client");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle><Translate>Start New Session</Translate></CardTitle>
        <CardDescription><Translate>Begin tracking time for a client</Translate></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <Label htmlFor="client-select" className="mb-2 block">
              <Translate>Select Client</Translate>
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedClient ? selectedClient.name : <Translate>Choose a client...</Translate>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search or type new client name..." 
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {!searchTerm.trim() && <Translate>No client found.</Translate>}
                    </CommandEmpty>
                    {searchTerm.trim() && (
                      <CommandGroup heading="Create New">
                        <CommandItem
                          onSelect={handleCreateAndSelect}
                          className="text-primary"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {isCreating ? <Translate>Creating...</Translate> : <><Translate>Create</Translate> "{searchTerm}"</>}
                        </CommandItem>
                      </CommandGroup>
                    )}
                    {filteredClients.length > 0 && (
                      <CommandGroup heading="Existing Clients">
                        {filteredClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              setSelectedClientId(client.id.toString());
                              setOpen(false);
                              setSearchTerm("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClientId === client.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={handleStart}
            disabled={!selectedClientId || isStarting}
            size="lg"
            className="gap-2 w-full sm:w-auto"
          >
            <Play className="h-5 w-5" />
            {isStarting ? <Translate>Starting...</Translate> : <Translate>Start Session</Translate>}
          </Button>
        </div>

        {clients.length === 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <Translate>No clients found.</Translate>{" "}
              <button
                onClick={onAddClient}
                className="text-primary hover:underline"
              >
                <Translate>Add a client</Translate>
              </button>{" "}
              <Translate>to get started.</Translate>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
