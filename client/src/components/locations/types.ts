// Shared types for location components
export type ViewLevel = 'world' | 'country' | 'state' | 'settlement';

export interface NavigationState {
  level: ViewLevel;
  worldId: string;
  country: any | null;
  state: any | null;
  settlement: any | null;
}

export interface LocationsContextType {
  nav: NavigationState;
  navigateToCountry: (country: any) => void;
  navigateToState: (state: any) => void;
  navigateToSettlement: (settlement: any) => void;
  navigateBack: () => void;
  navigateToWorld: () => void;
}
