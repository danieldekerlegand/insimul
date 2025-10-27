import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertCharacter, Character } from '@shared/schema';

import { CountriesListView } from './characters/CountriesListView';
import { StatesListView } from './characters/StatesListView';
import { SettlementsListView } from './characters/SettlementsListView';
import { CharactersListView } from './characters/CharactersListView';
import { CharacterDetailView } from './characters/CharacterDetailView';
import { CharacterEditDialog } from './CharacterEditDialog';
import { CharacterChatDialog } from './CharacterChatDialog';

interface HierarchicalCharactersTabProps {
  worldId: string;
}

type ViewLevel = 'countries' | 'states' | 'settlements' | 'characters' | 'character-detail';

export function HierarchicalCharactersTab({ worldId }: HierarchicalCharactersTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Navigation state
  const [viewLevel, setViewLevel] = useState<ViewLevel>('countries');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Data state
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [truths, setTruths] = useState<any[]>([]);

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatCharacter, setChatCharacter] = useState<Character | null>(null);

  // Load initial data
  useEffect(() => {
    if (worldId) {
      fetchCountries();
      fetchAllCharacters();
      fetchTruths();
    }
  }, [worldId]);

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/countries`);
      if (res.ok) {
        const data = await res.json();
        setCountries(data);
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  // Fetch states for a country
  const fetchStates = async (countryId: string) => {
    try {
      const res = await fetch(`/api/countries/${countryId}/states`);
      if (res.ok) {
        const data = await res.json();
        setStates(data);
      }
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  // Fetch settlements for a state
  const fetchSettlements = async (stateId: string) => {
    try {
      const res = await fetch(`/api/states/${stateId}/settlements`);
      if (res.ok) {
        const data = await res.json();
        setSettlements(data);
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    }
  };

  // Fetch characters for a settlement
  const fetchCharacters = async (settlementId: string) => {
    try {
      const res = await fetch(`/api/settlements/${settlementId}/characters`);
      if (res.ok) {
        const data = await res.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  // Fetch all characters (for relationships)
  const fetchAllCharacters = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/characters`);
      if (res.ok) {
        const data = await res.json();
        setAllCharacters(data);
      }
    } catch (error) {
      console.error('Failed to fetch all characters:', error);
    }
  };

  // Fetch truths
  const fetchTruths = async () => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/truths`);
      if (res.ok) {
        const data = await res.json();
        setTruths(data);
      }
    } catch (error) {
      console.error('Failed to fetch truths:', error);
    }
  };

  // Character creation mutation
  const createCharacterMutation = useMutation({
    mutationFn: async (data: InsertCharacter) => {
      const response = await apiRequest('POST', `/api/worlds/${worldId}/characters`, data);
      return await response.json();
    },
    onSuccess: () => {
      if (selectedSettlement) {
        fetchCharacters(selectedSettlement.id);
      }
      fetchAllCharacters();
      toast({
        title: "Character created",
        description: "The character was successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create character: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Navigation handlers
  const selectCountry = (country: any) => {
    setSelectedCountry(country);
    fetchStates(country.id);
    setViewLevel('states');
  };

  const selectState = (state: any) => {
    setSelectedState(state);
    fetchSettlements(state.id);
    setViewLevel('settlements');
  };

  const selectSettlement = (settlement: any) => {
    setSelectedSettlement(settlement);
    fetchCharacters(settlement.id);
    setViewLevel('characters');
  };

  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setViewLevel('character-detail');
  };

  const goBack = () => {
    if (viewLevel === 'character-detail') {
      setViewLevel('characters');
      setSelectedCharacter(null);
    } else if (viewLevel === 'characters') {
      setViewLevel('settlements');
      setCharacters([]);
    } else if (viewLevel === 'settlements') {
      setViewLevel('states');
      setSettlements([]);
    } else if (viewLevel === 'states') {
      setViewLevel('countries');
      setStates([]);
      setSelectedState(null);
    }
  };

  // Navigation helpers for jumping to specific levels
  const navigateToCountries = () => {
    setViewLevel('countries');
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedSettlement(null);
    setSelectedCharacter(null);
    setStates([]);
    setSettlements([]);
    setCharacters([]);
  };

  const navigateToStates = () => {
    if (selectedCountry) {
      setViewLevel('states');
      setSelectedState(null);
      setSelectedSettlement(null);
      setSelectedCharacter(null);
      setSettlements([]);
      setCharacters([]);
    }
  };

  const navigateToSettlements = () => {
    if (selectedState) {
      setViewLevel('settlements');
      setSelectedSettlement(null);
      setSelectedCharacter(null);
      setCharacters([]);
    }
  };

  const navigateToCharacters = () => {
    if (selectedSettlement) {
      setViewLevel('characters');
      setSelectedCharacter(null);
    }
  };

  // Breadcrumb rendering
  const renderBreadcrumb = () => {
    const parts: JSX.Element[] = [];

    if (viewLevel !== 'countries') {
      parts.push(
        <Button key="back" variant="ghost" size="sm" onClick={goBack} className="gap-1 hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      );
    }

    // World - clickable if not at countries level
    parts.push(
      viewLevel === 'countries' ? (
        <span key="world" className="text-sm text-primary font-medium">World</span>
      ) : (
        <button
          key="world"
          onClick={navigateToCountries}
          className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
        >
          World
        </button>
      )
    );

    if (selectedCountry) {
      parts.push(<ChevronRight key="sep1" className="w-4 h-4 text-muted-foreground" />);
      parts.push(
        viewLevel === 'states' ? (
          <span key="country" className="text-sm font-medium text-primary">
            {selectedCountry.name}
          </span>
        ) : (
          <button
            key="country"
            onClick={navigateToStates}
            className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {selectedCountry.name}
          </button>
        )
      );
    }

    if (selectedState) {
      parts.push(<ChevronRight key="sep2" className="w-4 h-4 text-muted-foreground" />);
      parts.push(
        viewLevel === 'settlements' ? (
          <span key="state" className="text-sm font-medium text-primary">
            {selectedState.name}
          </span>
        ) : (
          <button
            key="state"
            onClick={navigateToSettlements}
            className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {selectedState.name}
          </button>
        )
      );
    }

    if (selectedSettlement) {
      parts.push(<ChevronRight key="sep3" className="w-4 h-4 text-muted-foreground" />);
      parts.push(
        viewLevel === 'characters' ? (
          <span key="settlement" className="text-sm font-medium text-primary">
            {selectedSettlement.name}
          </span>
        ) : (
          <button
            key="settlement"
            onClick={navigateToCharacters}
            className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
          >
            {selectedSettlement.name}
          </button>
        )
      );
    }

    if (selectedCharacter) {
      parts.push(<ChevronRight key="sep4" className="w-4 h-4 text-muted-foreground" />);
      parts.push(
        <span key="character" className="text-sm font-semibold text-primary">
          {[selectedCharacter.firstName, selectedCharacter.lastName].filter(Boolean).join(' ')}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2 mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
        {parts}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-6">
      {renderBreadcrumb()}

      {/* Countries View */}
      {viewLevel === 'countries' && (
        <CountriesListView countries={countries} onSelectCountry={selectCountry} />
      )}

      {/* States View */}
      {viewLevel === 'states' && (
        <StatesListView states={states} onSelectState={selectState} />
      )}

      {/* Settlements View */}
      {viewLevel === 'settlements' && (
        <SettlementsListView settlements={settlements} onSelectSettlement={selectSettlement} />
      )}

      {/* Characters View */}
      {viewLevel === 'characters' && (
        <CharactersListView
          characters={characters}
          worldId={worldId}
          onSelectCharacter={selectCharacter}
          onCreateCharacter={(data) => createCharacterMutation.mutate(data)}
          isCreating={createCharacterMutation.isPending}
        />
      )}

      {/* Character Detail View */}
      {viewLevel === 'character-detail' && selectedCharacter && (
        <CharacterDetailView
          character={selectedCharacter}
          allCharacters={allCharacters}
          onEditCharacter={(char) => {
            setCharacterToEdit(char);
            setShowEditDialog(true);
          }}
          onChatWithCharacter={(char) => {
            setChatCharacter(char);
            setShowChatDialog(true);
          }}
          onViewCharacter={selectCharacter}
        />
      )}

      {/* Edit Dialog */}
      <CharacterEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        character={characterToEdit}
        navigationContext={{
          worldName: 'World',
          countryName: selectedCountry?.name,
          stateName: selectedState?.name,
          settlementName: selectedSettlement?.name,
          onNavigateBack: goBack,
          onNavigateToCountries: navigateToCountries,
          onNavigateToStates: navigateToStates,
          onNavigateToSettlements: navigateToSettlements,
          onNavigateToCharacters: navigateToCharacters
        }}
        onCharacterUpdated={() => {
          if (selectedSettlement) {
            fetchCharacters(selectedSettlement.id);
          }
          fetchAllCharacters();
          // Refresh the selected character
          if (selectedCharacter && characterToEdit?.id === selectedCharacter.id) {
            fetchAllCharacters().then(() => {
              const updated = allCharacters.find(c => c.id === selectedCharacter.id);
              if (updated) setSelectedCharacter(updated);
            });
          }
          setShowEditDialog(false);
        }}
        onCharacterDeleted={() => {
          if (selectedSettlement) {
            fetchCharacters(selectedSettlement.id);
          }
          fetchAllCharacters();
          if (selectedCharacter && characterToEdit?.id === selectedCharacter.id) {
            goBack();
          }
          setShowEditDialog(false);
        }}
      />

      {/* Chat Dialog */}
      {chatCharacter && (
        <CharacterChatDialog
          open={showChatDialog}
          onOpenChange={setShowChatDialog}
          character={chatCharacter as any}
          truths={truths.filter(t => t.characterId === chatCharacter.id)}
        />
      )}
    </div>
  );
}
