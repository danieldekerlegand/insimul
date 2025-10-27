import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, MapPin, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCharacterSchema, type InsertCharacter } from "@shared/schema";
import { z } from "zod";
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from "@/components/ui/alert";

const createCharacterFormSchema = insertCharacterSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  currentLocation: z.string().min(1, "Location is required"),
  age: z.coerce.number().min(0).optional(),
  occupation: z.string().optional(),
});

type CreateCharacterForm = z.infer<typeof createCharacterFormSchema>;

interface CharacterCreateDialogProps {
  worldId: string;
  settlementId?: string;
  onCreateCharacter: (data: InsertCharacter) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function CharacterCreateDialog({ worldId, settlementId, onCreateCharacter, isLoading = false, children }: CharacterCreateDialogProps) {
  const [open, setOpen] = useState(false);

  // Fetch settlements for this world
  const { data: settlements = [], isLoading: isLoadingSettlements } = useQuery<any[]>({
    queryKey: ['/api/worlds', worldId, 'settlements'],
    enabled: !!worldId && open,
  });

  const form = useForm<CreateCharacterForm>({
    resolver: zodResolver(createCharacterFormSchema),
    defaultValues: {
      worldId,
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      age: 25,
      gender: "",
      occupation: "",
      currentLocation: settlementId || "",
      generationMethod: "manual",
      personality: {},
      physicalTraits: {},
      mentalTraits: {},
      skills: {},
      relationships: {},
      socialAttributes: {},
      parentIds: [],
      childIds: [],
      genealogyData: {},
    },
  });

  // Update currentLocation when settlementId changes
  useEffect(() => {
    if (settlementId) {
      form.setValue('currentLocation', settlementId);
    }
  }, [settlementId, form]);

  const handleSubmit = (data: CreateCharacterForm) => {
    console.log('CharacterCreateDialog: Submitting character data:', data);
    onCreateCharacter(data);
    setOpen(false);
    form.reset({
      worldId,
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      age: 25,
      gender: "",
      occupation: "",
      currentLocation: settlementId || "",
      generationMethod: "manual",
      personality: {},
      physicalTraits: {},
      mentalTraits: {},
      skills: {},
      relationships: {},
      socialAttributes: {},
      parentIds: [],
      childIds: [],
      genealogyData: {},
    });
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const occupationOptions = [
    { value: "noble", label: "Noble" },
    { value: "merchant", label: "Merchant" },
    { value: "artisan", label: "Artisan" },
    { value: "soldier", label: "Soldier" },
    { value: "scholar", label: "Scholar" },
    { value: "priest", label: "Priest" },
    { value: "farmer", label: "Farmer" },
    { value: "servant", label: "Servant" },
    { value: "healer", label: "Healer" },
    { value: "bard", label: "Bard" },
    { value: "thief", label: "Thief" },
    { value: "diplomat", label: "Diplomat" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" data-testid="button-create-character">
            <Plus className="w-4 h-4 mr-2" />
            Create Character
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create New Character
          </DialogTitle>
          <DialogDescription>
            Create a new character for this world with basic information and traits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                data-testid="input-first-name"
                placeholder="e.g., Edmund"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                data-testid="input-last-name"
                placeholder="e.g., Blackwater"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                {...form.register("middleName")}
                data-testid="input-middle-name"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                {...form.register("suffix")}
                data-testid="input-suffix"
                placeholder="e.g., Jr., III, the Great"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={form.watch("gender") || ""}
                onValueChange={(value) => form.setValue("gender", value)}
              >
                <SelectTrigger data-testid="select-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                {...form.register("age")}
                data-testid="input-age"
                placeholder="25"
                min="0"
                max="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Select
                value={form.watch("occupation") || ""}
                onValueChange={(value) => form.setValue("occupation", value)}
              >
                <SelectTrigger data-testid="select-occupation">
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  {occupationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentLocation">Current Location *</Label>
            {settlements.length === 0 && !isLoadingSettlements ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No settlements found. Please create a settlement first before adding characters.
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={form.watch("currentLocation") || ""}
                onValueChange={(value) => form.setValue("currentLocation", value)}
                disabled={isLoadingSettlements}
              >
                <SelectTrigger data-testid="select-location">
                  <SelectValue placeholder={isLoadingSettlements ? "Loading locations..." : "Select location"} />
                </SelectTrigger>
                <SelectContent>
                  {settlements.map((settlement) => (
                    <SelectItem key={settlement.id} value={settlement.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {settlement.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.currentLocation && (
              <p className="text-sm text-red-600">{form.formState.errors.currentLocation.message}</p>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Character Features</CardTitle>
              <CardDescription>
                Advanced traits like personality, skills, and relationships can be configured later through the character editor.
              </CardDescription>
            </CardHeader>
          </Card>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-character"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || settlements.length === 0}
              data-testid="button-submit-character"
            >
              {isLoading ? "Creating..." : "Create Character"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}