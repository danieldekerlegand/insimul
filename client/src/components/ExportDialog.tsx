import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Download, Copy, FileText, Loader2, Archive } from 'lucide-react';
import type { SystemType } from '@/lib/editor-types';
import { ruleExporter } from '@/lib/rule-exporter';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

interface CategoryCount {
  world: number;
  base: number;
}

interface DataCounts {
  rules: CategoryCount;
  characters: CategoryCount;
  actions: CategoryCount;
  quests: CategoryCount;
  items: CategoryCount;
  grammars: CategoryCount;
  languages: CategoryCount;
  truths: CategoryCount;
  texts: CategoryCount;
  narrative: CategoryCount;
}

/** Convert a display name to a readable Prolog atom (lowercase, underscored) */
function toAtom(name: string): string {
  if (!name) return 'unknown';
  // Normalize unicode (strip accents for atom, keep in quoted strings)
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^([0-9])/, '_$1')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'unknown';
}

/** Escape a string for use inside Prolog single quotes */
function escapeProlog(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Build a character atom from first + last name, with disambiguation suffix if needed */
function buildCharacterAtomMap(chars: any[]): Map<string, string> {
  const nameCount = new Map<string, number>();
  const atomMap = new Map<string, string>();

  // First pass: count names
  for (const char of chars) {
    const name = `${char.firstName || ''} ${char.lastName || ''}`.trim();
    const atom = toAtom(name);
    nameCount.set(atom, (nameCount.get(atom) || 0) + 1);
  }

  // Second pass: assign atoms (disambiguate duplicates with suffix)
  const seen = new Map<string, number>();
  for (const char of chars) {
    const id = char.id || char._id;
    const name = `${char.firstName || ''} ${char.lastName || ''}`.trim();
    const atom = toAtom(name);
    if ((nameCount.get(atom) || 0) > 1) {
      const idx = (seen.get(atom) || 0) + 1;
      seen.set(atom, idx);
      atomMap.set(id, `${atom}_${idx}`);
    } else {
      atomMap.set(id, atom);
    }
  }
  return atomMap;
}

/** Build an atom map for any named entity, disambiguating duplicates */
function buildNamedAtomMap(items: any[], nameField: string = 'name'): Map<string, string> {
  const nameCount = new Map<string, number>();
  const atomMap = new Map<string, string>();

  for (const item of items) {
    const atom = toAtom(item[nameField] || '');
    nameCount.set(atom, (nameCount.get(atom) || 0) + 1);
  }

  const seen = new Map<string, number>();
  for (const item of items) {
    const id = item.id || item._id;
    const atom = toAtom(item[nameField] || '');
    if ((nameCount.get(atom) || 0) > 1) {
      const idx = (seen.get(atom) || 0) + 1;
      seen.set(atom, idx);
      atomMap.set(id, `${atom}_${idx}`);
    } else {
      atomMap.set(id, atom);
    }
  }
  return atomMap;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worldId: string;
  worldName: string;
  // Legacy props for non-Insimul format exports
  rules?: any[];
  characters?: any[];
  actions?: any[];
  includeCharacters?: boolean;
  includeActions?: boolean;
}

export function ExportDialog({
  open,
  onOpenChange,
  worldId,
  worldName,
  rules = [],
  characters = [],
  actions = [],
  includeCharacters = false,
  includeActions = false
}: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<SystemType>('insimul');
  const [includeSchema, setIncludeSchema] = useState(false);
  const [exportedContent, setExportedContent] = useState('');
  const [exportedFiles, setExportedFiles] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const { toast } = useToast();

  // Category toggles — each has world and base independently
  type CategoryToggle = { world: boolean; base: boolean };
  const [catToggles, setCatToggles] = useState<Record<string, CategoryToggle>>({
    rules:      { world: true, base: false },
    characters: { world: true, base: false },
    actions:    { world: true, base: false },
    quests:     { world: true, base: false },
    items:      { world: true, base: false },
    grammars:   { world: true, base: false },
    languages:  { world: true, base: false },
    truths:     { world: true, base: false },
    texts:      { world: true, base: false },
    narrative:  { world: true, base: false },
  });

  const toggleCat = (cat: string, scope: 'world' | 'base') => {
    setCatToggles(prev => ({
      ...prev,
      [cat]: { ...prev[cat], [scope]: !prev[cat]?.[scope] },
    }));
  };

  // Convenience aliases for backward compat in export logic
  const includeRules = catToggles.rules.world;
  const includeCharacterData = catToggles.characters.world;
  const includeActionData = catToggles.actions.world;
  const includeQuests = catToggles.quests.world;
  const includeItems = catToggles.items.world;
  const includeGrammars = catToggles.grammars.world;
  const includeLanguages = catToggles.languages.world;
  const includeTruths = catToggles.truths.world;
  const includeTexts = catToggles.texts.world;
  const includeNarrative = catToggles.narrative.world;
  const includeBaseContent = Object.values(catToggles).some(t => t.base);

  // Fetch counts when dialog opens
  useEffect(() => {
    if (!open || !worldId) return;
    setExportedContent('');
    setExportedFiles({});

    const fetchCounts = async () => {
      try {
        const safeLen = (r: Response) => r.ok ? r.json().then(d => Array.isArray(d) ? d.length : 0) : Promise.resolve(0);

        const [
          worldRules, worldChars, worldActions, worldQuests, worldItems,
          worldGrammars, worldLangs, worldTruths, worldTexts, worldNarrative,
          baseRules, baseActions, baseItems,
        ] = await Promise.all([
          fetch(`/api/worlds/${worldId}/rules`).then(safeLen),
          fetch(`/api/worlds/${worldId}/characters`).then(safeLen),
          fetch(`/api/worlds/${worldId}/actions`).then(safeLen),
          fetch(`/api/worlds/${worldId}/quests`).then(safeLen),
          fetch(`/api/worlds/${worldId}/items`).then(safeLen),
          fetch(`/api/worlds/${worldId}/grammars`).then(safeLen),
          fetch(`/api/worlds/${worldId}/languages`).then(safeLen),
          fetch(`/api/worlds/${worldId}/truth`).then(safeLen),
          fetch(`/api/worlds/${worldId}/texts`).then(safeLen),
          fetch(`/api/worlds/${worldId}/narrative`).then(r => r.ok ? r.json().then(d => d ? 1 : 0) : 0),
          fetch('/api/rules/base').then(safeLen),
          fetch('/api/actions/base').then(safeLen),
          fetch('/api/items/base').then(safeLen),
        ]);

        setCounts({
          rules:      { world: worldRules, base: baseRules },
          characters: { world: worldChars, base: 0 },
          actions:    { world: worldActions, base: baseActions },
          quests:     { world: worldQuests, base: 0 },
          items:      { world: worldItems, base: baseItems },
          grammars:   { world: worldGrammars, base: 0 },
          languages:  { world: worldLangs, base: 0 },
          truths:     { world: worldTruths, base: 0 },
          texts:      { world: worldTexts, base: 0 },
          narrative:  { world: worldNarrative, base: 0 },
        });
      } catch (error) {
        console.error('Failed to fetch export counts:', error);
      }
    };

    fetchCounts();
  }, [open, worldId]);

  const formatOptions = [
    { value: 'insimul', label: 'Insimul Prolog', description: 'Export all Prolog content as-is' },
    { value: 'ensemble', label: 'Ensemble JSON', description: 'Social simulation rules as JSON' },
    { value: 'kismet', label: 'Kismet Prolog', description: 'Prolog-style social rules' },
    { value: 'tott', label: 'Talk of the Town Python', description: 'Python classes and methods' }
  ];

  // Generates Prolog content for a single category, returning the file text
  const generatePrologSection = (items: any[], sectionName: string): string => {
    const lines: string[] = [];
    const header = `%% Insimul World Export: ${worldName}\n%% Category: ${sectionName}\n%% Generated: ${new Date().toISOString()}\n`;
    lines.push(header);

    const prologItems = items.filter(item => item.content?.trim());
    if (prologItems.length === 0) return '';
    lines.push(`%% ═══════════════════════════════════════════════════════════`);
    lines.push(`%% ${sectionName} (${prologItems.length} entries)`);
    lines.push(`%% ═══════════════════════════════════════════════════════════\n`);
    for (const item of prologItems) {
      if (item.name) lines.push(`%% ${item.name}`);
      lines.push(item.content.trim());
      lines.push('');
    }
    return lines.join('\n');
  };

  // Generates Prolog facts for entities without a `content` field
  const generateFactsSection = (items: any[], sectionName: string, factGenerator: (item: any) => string): string => {
    if (items.length === 0) return '';
    const lines: string[] = [];
    const header = `%% Insimul World Export: ${worldName}\n%% Category: ${sectionName}\n%% Generated: ${new Date().toISOString()}\n`;
    lines.push(header);
    lines.push(`%% ═══════════════════════════════════════════════════════════`);
    lines.push(`%% ${sectionName} (${items.length} entries)`);
    lines.push(`%% ═══════════════════════════════════════════════════════════\n`);
    for (const item of items) {
      lines.push(factGenerator(item));
    }
    lines.push('');
    return lines.join('\n');
  };

  const generateCharacterFacts = (chars: any[]): string => {
    const atomMap = buildCharacterAtomMap(chars);
    return generateFactsSection(chars, 'Characters', (char) => {
      const name = `${char.firstName || ''} ${char.lastName || ''}`.trim() || char.name || 'unknown';
      const atom = atomMap.get(char.id || char._id) || toAtom(name);
      const lines = [`%% ${name}`];
      lines.push(`person(${atom}).`);
      if (char.firstName) lines.push(`first_name(${atom}, '${escapeProlog(char.firstName)}').`);
      if (char.lastName) lines.push(`last_name(${atom}, '${escapeProlog(char.lastName)}').`);
      lines.push(`full_name(${atom}, '${escapeProlog(name)}').`);
      if (char.gender) lines.push(`gender(${atom}, ${toAtom(char.gender)}).`);
      if (char.age) lines.push(`age(${atom}, ${char.age}).`);
      if (char.birthYear) lines.push(`birth_year(${atom}, ${char.birthYear}).`);
      if (char.isAlive !== false) lines.push(`alive(${atom}).`);
      else lines.push(`dead(${atom}).`);
      if (char.occupation) lines.push(`occupation(${atom}, ${toAtom(char.occupation)}).`);
      if (char.currentLocation) {
        // Resolve location to settlement name if available
        lines.push(`at_location(${atom}, ${toAtom(char.currentLocationName || char.currentLocation)}).`);
      }
      if (char.personality && typeof char.personality === 'object') {
        for (const [trait, value] of Object.entries(char.personality)) {
          if (typeof value === 'number') {
            lines.push(`personality(${atom}, ${toAtom(trait)}, ${value}).`);
          }
        }
      }
      if (char.skills && typeof char.skills === 'object') {
        for (const [skill, level] of Object.entries(char.skills)) {
          if (typeof level === 'number') {
            lines.push(`skill(${atom}, ${toAtom(skill)}, ${level}).`);
          }
        }
      }
      // Family relationships — resolve to names via atomMap
      if (char.spouseId && atomMap.has(char.spouseId)) {
        lines.push(`spouse(${atom}, ${atomMap.get(char.spouseId)}).`);
      }
      if (Array.isArray(char.parentIds)) {
        for (const pid of char.parentIds) {
          if (atomMap.has(pid)) lines.push(`parent(${atomMap.get(pid)}, ${atom}).`);
        }
      }
      if (Array.isArray(char.childIds)) {
        for (const cid of char.childIds) {
          if (atomMap.has(cid)) lines.push(`child(${atom}, ${atomMap.get(cid)}).`);
        }
      }
      // Social attributes
      if (char.socialAttributes && typeof char.socialAttributes === 'object') {
        for (const [attr, value] of Object.entries(char.socialAttributes)) {
          if (typeof value === 'number') {
            lines.push(`social_attribute(${atom}, ${toAtom(attr)}, ${value}).`);
          } else if (typeof value === 'boolean' && value) {
            lines.push(`social_attribute(${atom}, ${toAtom(attr)}).`);
          }
        }
      }
      lines.push('');
      return lines.join('\n');
    });
  };

  const generateItemContent = (items: any[]): string => {
    const withContent = items.filter(i => i.content?.trim());
    const withoutContent = items.filter(i => !i.content?.trim());
    const parts: string[] = [];
    if (withContent.length > 0) parts.push(generatePrologSection(withContent, 'Items (Prolog)'));
    if (withoutContent.length > 0) {
      const atomMap = buildNamedAtomMap(withoutContent);
      parts.push(generateFactsSection(withoutContent, 'Items', (item) => {
        const atom = atomMap.get(item.id || item._id) || toAtom(item.name || 'unknown');
        const lines = [`%% ${item.name || 'Unknown'}`];
        lines.push(`item(${atom}, '${escapeProlog(item.name || 'unknown')}', ${toAtom(item.itemType || 'misc')}).`);
        if (item.description) lines.push(`item_description(${atom}, '${escapeProlog(item.description.replace(/\n/g, ' '))}').`);
        if (item.value != null) lines.push(`item_value(${atom}, ${item.value}).`);
        if (item.sellValue != null) lines.push(`item_sell_value(${atom}, ${item.sellValue}).`);
        if (item.weight != null) lines.push(`item_weight(${atom}, ${item.weight}).`);
        if (item.rarity) lines.push(`item_rarity(${atom}, ${toAtom(item.rarity)}).`);
        if (item.category) lines.push(`item_category(${atom}, ${toAtom(item.category)}).`);
        if (item.basePrice != null) lines.push(`item_price(${atom}, ${item.basePrice}).`);
        if (item.tradeable) lines.push(`item_tradeable(${atom}).`);
        if (item.stackable) lines.push(`item_stackable(${atom}).`);
        if (Array.isArray(item.tags)) {
          for (const tag of item.tags) lines.push(`item_tag(${atom}, ${toAtom(tag)}).`);
        }
        lines.push('');
        return lines.join('\n');
      }));
    }
    return parts.filter(Boolean).join('\n');
  };

  const generateGrammarContent = (grammars: any[]): string => {
    const withContent = grammars.filter(g => g.content?.trim());
    const withoutContent = grammars.filter(g => !g.content?.trim());
    const parts: string[] = [];
    if (withContent.length > 0) parts.push(generatePrologSection(withContent, 'Grammars (Prolog)'));
    if (withoutContent.length > 0) {
      const atomMap = buildNamedAtomMap(withoutContent);
      parts.push(generateFactsSection(withoutContent, 'Grammars', (g) => {
        const atom = atomMap.get(g.id || g._id) || toAtom(g.name || 'unknown');
        const lines = [`%% ${g.name || 'Unknown'}`];
        lines.push(`grammar(${atom}, '${escapeProlog(g.name || 'unknown')}').`);
        if (g.description) lines.push(`grammar_description(${atom}, '${escapeProlog(g.description)}').`);
        // Export grammar rules as individual Prolog facts
        const grammarData = g.grammar || g.rules;
        if (grammarData && typeof grammarData === 'object') {
          for (const [key, expansions] of Object.entries(grammarData)) {
            if (Array.isArray(expansions)) {
              for (const exp of expansions) {
                lines.push(`grammar_rule(${atom}, ${toAtom(key)}, '${escapeProlog(String(exp))}').`);
              }
            }
          }
        }
        if (Array.isArray(g.tags)) {
          for (const tag of g.tags) lines.push(`grammar_tag(${atom}, ${toAtom(tag)}).`);
        }
        lines.push('');
        return lines.join('\n');
      }));
    }
    return parts.filter(Boolean).join('\n');
  };

  const generateLanguageContent = (languages: any[]): string => {
    return generateFactsSection(languages, 'Languages', (lang) => {
      const atom = toAtom(lang.name || 'unknown');
      const lines = [`%% ${lang.name || 'Unknown'}`];
      lines.push(`language(${atom}, '${escapeProlog(lang.name || 'unknown')}').`);
      if (lang.description) lines.push(`language_description(${atom}, '${escapeProlog(lang.description)}').`);
      if (lang.kind) lines.push(`language_kind(${atom}, ${toAtom(lang.kind)}).`);
      if (lang.realCode) lines.push(`language_code(${atom}, '${escapeProlog(lang.realCode)}').`);
      if (lang.isoCode) lines.push(`language_iso(${atom}, '${escapeProlog(lang.isoCode)}').`);
      if (lang.isPrimary) lines.push(`language_primary(${atom}).`);
      if (lang.isLearningTarget) lines.push(`language_learning_target(${atom}).`);
      lines.push('');
      return lines.join('\n');
    });
  };

  const generateTruthContent = (truths: any[], charAtomMap?: Map<string, string>): string => {
    const withContent = truths.filter(t => t.content?.trim());
    const withoutContent = truths.filter(t => !t.content?.trim());
    const parts: string[] = [];
    if (withContent.length > 0) parts.push(generatePrologSection(withContent, 'Truths (Prolog)'));
    if (withoutContent.length > 0) {
      const atomMap = buildNamedAtomMap(withoutContent, 'title');
      parts.push(generateFactsSection(withoutContent, 'Truths', (truth) => {
        const atom = atomMap.get(truth.id || truth._id) || toAtom(truth.title || truth.subject || 'unknown');
        const title = truth.title || truth.subject || 'Unknown';
        const lines = [`%% ${title}`];
        const entryType = toAtom(truth.entryType || 'fact');
        lines.push(`truth(${atom}, '${escapeProlog(title)}', ${entryType}).`);
        if (truth.content) lines.push(`truth_content(${atom}, '${escapeProlog(truth.content.replace(/\n/g, ' '))}').`);
        if (truth.importance != null) lines.push(`truth_importance(${atom}, ${truth.importance}).`);
        if (truth.isPublic) lines.push(`truth_public(${atom}).`);
        if (truth.timestep != null) lines.push(`truth_timestep(${atom}, ${truth.timestep}).`);
        // Resolve character reference to readable name
        if (truth.characterId && charAtomMap?.has(truth.characterId)) {
          lines.push(`truth_character(${atom}, ${charAtomMap.get(truth.characterId)}).`);
        }
        lines.push('');
        return lines.join('\n');
      }));
    }
    return parts.filter(Boolean).join('\n');
  };

  // Generate world facts
  const generateWorldFacts = (worldData: any): string => {
    if (!worldData) return '';
    const atom = toAtom(worldData.name || 'world');
    const lines: string[] = [];
    const header = `%% Insimul World Export: ${worldName}\n%% Category: World\n%% Generated: ${new Date().toISOString()}\n`;
    lines.push(header);
    lines.push(`%% ${worldData.name || 'World'}`);
    lines.push(`world(${atom}, '${escapeProlog(worldData.name || '')}').`);
    if (worldData.description) lines.push(`world_description(${atom}, '${escapeProlog(worldData.description)}').`);
    if (worldData.worldType) lines.push(`world_type(${atom}, ${toAtom(worldData.worldType)}).`);
    if (worldData.gameType) lines.push(`game_type(${atom}, ${toAtom(worldData.gameType)}).`);
    if (worldData.targetLanguage) lines.push(`target_language(${atom}, ${toAtom(worldData.targetLanguage)}).`);
    if (worldData.timestepUnit) lines.push(`timestep_unit(${atom}, ${toAtom(worldData.timestepUnit)}).`);
    if (worldData.gameplayTimestepUnit) lines.push(`gameplay_timestep_unit(${atom}, ${toAtom(worldData.gameplayTimestepUnit)}).`);
    if (worldData.cameraPerspective) lines.push(`camera_perspective(${atom}, ${toAtom(worldData.cameraPerspective)}).`);
    const gc = worldData.generationConfig;
    if (gc?.worldLanguages) {
      for (const lang of gc.worldLanguages) lines.push(`world_language(${atom}, ${toAtom(lang)}).`);
    }
    if (gc?.learningTargetLanguage) lines.push(`learning_target_language(${atom}, ${toAtom(gc.learningTargetLanguage)}).`);
    lines.push('');
    return lines.join('\n');
  };

  // Generate country facts
  const generateCountryFacts = (countries: any[]): string => {
    return generateFactsSection(countries, 'Countries', (c) => {
      const atom = toAtom(c.name || 'unknown');
      const lines = [`%% ${c.name || 'Unknown'}`];
      lines.push(`country(${atom}, '${escapeProlog(c.name || '')}').`);
      if (c.description) lines.push(`country_description(${atom}, '${escapeProlog(c.description)}').`);
      if (c.governmentType) lines.push(`government_type(${atom}, ${toAtom(c.governmentType)}).`);
      if (c.economicSystem) lines.push(`economic_system(${atom}, ${toAtom(c.economicSystem)}).`);
      if (c.foundedYear) lines.push(`country_founded(${atom}, ${c.foundedYear}).`);
      if (c.isActive) lines.push(`country_active(${atom}).`);
      lines.push('');
      return lines.join('\n');
    });
  };

  // Generate settlement facts
  const generateSettlementFacts = (settlements: any[], countryMap?: Map<string, string>, stateMap?: Map<string, string>): string => {
    return generateFactsSection(settlements, 'Settlements', (s) => {
      const atom = toAtom(s.name || 'unknown');
      const lines = [`%% ${s.name || 'Unknown'}`];
      const countryAtom = s.countryId && countryMap?.get(s.countryId) || '';
      const stateAtom = s.stateId && stateMap?.get(s.stateId) || '';
      if (countryAtom && stateAtom) {
        lines.push(`settlement(${atom}, '${escapeProlog(s.name || '')}', ${stateAtom}, ${countryAtom}).`);
      } else if (countryAtom) {
        lines.push(`settlement(${atom}, '${escapeProlog(s.name || '')}', ${countryAtom}).`);
      } else {
        lines.push(`settlement(${atom}, '${escapeProlog(s.name || '')}').`);
      }
      if (s.settlementType) lines.push(`settlement_type(${atom}, ${toAtom(s.settlementType)}).`);
      if (s.population) lines.push(`settlement_population(${atom}, ${s.population}).`);
      if (s.foundedYear) lines.push(`settlement_founded(${atom}, ${s.foundedYear}).`);
      // Districts, streets, landmarks
      if (Array.isArray(s.districts)) {
        for (const d of s.districts) {
          const dName = typeof d === 'string' ? d : d?.name;
          if (dName) {
            lines.push(`district(${toAtom(dName)}, '${escapeProlog(dName)}', ${atom}).`);
            if (d?.properties?.wealth != null) lines.push(`district_wealth(${toAtom(dName)}, ${Math.round(d.properties.wealth)}).`);
            if (d?.properties?.crime != null) lines.push(`district_crime(${toAtom(dName)}, ${Math.round(d.properties.crime)}).`);
          }
        }
      }
      if (Array.isArray(s.streets)) {
        for (const st of s.streets) {
          const stName = typeof st === 'string' ? st : st?.name;
          if (stName) {
            const parentDistrict = s.districts?.find((d: any) => d.id === st?.parentId);
            if (parentDistrict?.name) {
              lines.push(`street(${toAtom(stName)}, '${escapeProlog(stName)}', ${atom}, ${toAtom(parentDistrict.name)}).`);
            } else {
              lines.push(`street(${toAtom(stName)}, '${escapeProlog(stName)}', ${atom}).`);
            }
          }
        }
      }
      if (Array.isArray(s.landmarks)) {
        for (const lm of s.landmarks) {
          const lmName = typeof lm === 'string' ? lm : lm?.name;
          if (lmName) {
            lines.push(`landmark(${toAtom(lmName)}, '${escapeProlog(lmName)}', ${atom}).`);
            if (lm?.properties?.historical) lines.push(`landmark_historical(${toAtom(lmName)}).`);
          }
        }
      }
      lines.push('');
      return lines.join('\n');
    });
  };

  // Generate location/lot facts
  const generateLocationFacts = (locations: any[], settlementMap?: Map<string, string>): string => {
    return generateFactsSection(locations, 'Locations', (loc) => {
      const addr = loc.address || loc.name || `lot_${loc.id}`;
      const atom = toAtom(addr);
      const settlementAtom = loc.settlementId && settlementMap?.get(loc.settlementId) || '';
      const lines = [`%% ${addr}`];
      if (settlementAtom) {
        lines.push(`lot(${atom}, '${escapeProlog(addr)}', ${settlementAtom}).`);
      } else {
        lines.push(`lot(${atom}, '${escapeProlog(addr)}').`);
      }
      if (loc.lotType) lines.push(`lot_type(${atom}, ${toAtom(loc.lotType)}).`);
      if (loc.districtName) lines.push(`lot_district(${atom}, ${toAtom(loc.districtName)}).`);
      if (loc.streetName) lines.push(`lot_street(${atom}, ${toAtom(loc.streetName)}).`);
      if (loc.houseNumber) lines.push(`lot_house_number(${atom}, ${loc.houseNumber}).`);
      const bldg = loc.building;
      if (bldg && typeof bldg === 'object') {
        if (bldg.buildingCategory === 'residence') {
          lines.push(`building(${atom}, residence, ${toAtom(bldg.residenceType || 'house')}).`);
        } else if (bldg.buildingCategory === 'business') {
          lines.push(`building(${atom}, business, ${toAtom(bldg.businessType || 'unknown')}).`);
          if (bldg.name) lines.push(`business(${atom}, '${escapeProlog(bldg.name)}', ${toAtom(bldg.businessType || 'unknown')}).`);
        }
      }
      if (loc.featureCategory) lines.push(`feature(${atom}, ${toAtom(loc.featureCategory)}, ${toAtom(loc.featureType || '')}).`);
      if (loc.name) lines.push(`lot_name(${atom}, '${escapeProlog(loc.name)}').`);
      lines.push('');
      return lines.join('\n');
    });
  };

  // Generate text facts (books, journals, letters, signs)
  const generateTextFacts = (texts: any[]): string => {
    const atomMap = buildNamedAtomMap(texts, 'title');
    return generateFactsSection(texts, 'Texts', (t) => {
      const atom = atomMap.get(t.id || t._id) || toAtom(t.title || 'unknown');
      const lines = [`%% ${t.title || 'Unknown'}`];
      lines.push(`game_text(${atom}, '${escapeProlog(t.title || '')}', ${toAtom(t.textCategory || 'book')}).`);
      if (t.titleTranslation) lines.push(`text_translation(${atom}, '${escapeProlog(t.titleTranslation)}').`);
      if (t.cefrLevel) lines.push(`text_cefr_level(${atom}, ${toAtom(t.cefrLevel)}).`);
      if (t.targetLanguage) lines.push(`text_language(${atom}, ${toAtom(t.targetLanguage)}).`);
      if (t.difficulty) lines.push(`text_difficulty(${atom}, ${toAtom(t.difficulty)}).`);
      if (t.authorName) lines.push(`text_author(${atom}, '${escapeProlog(t.authorName)}').`);
      if (t.spawnLocationHint) lines.push(`text_spawn_location(${atom}, ${toAtom(t.spawnLocationHint)}).`);
      if (t.clueText) lines.push(`text_clue(${atom}, '${escapeProlog(t.clueText)}').`);
      if (t.status) lines.push(`text_status(${atom}, ${toAtom(t.status)}).`);
      if (t.narrativeChapterId) lines.push(`text_chapter(${atom}, ${toAtom(t.narrativeChapterId)}).`);
      // Pages
      const pages = Array.isArray(t.pages) ? t.pages : [];
      if (pages.length > 0) {
        lines.push(`text_page_count(${atom}, ${pages.length}).`);
        for (let i = 0; i < pages.length; i++) {
          const p = pages[i];
          if (p.content) lines.push(`text_page(${atom}, ${i}, '${escapeProlog(p.content.replace(/\n/g, ' '))}').`);
          if (p.contentTranslation) lines.push(`text_page_translation(${atom}, ${i}, '${escapeProlog(p.contentTranslation.replace(/\n/g, ' '))}').`);
        }
      }
      // Vocabulary highlights
      if (Array.isArray(t.vocabularyHighlights)) {
        for (const vh of t.vocabularyHighlights) {
          if (vh.word) {
            lines.push(`text_vocabulary(${atom}, '${escapeProlog(vh.word)}', '${escapeProlog(vh.translation || '')}', ${toAtom(vh.partOfSpeech || 'unknown')}).`);
          }
        }
      }
      // Tags
      if (Array.isArray(t.tags)) {
        for (const tag of t.tags) lines.push(`text_tag(${atom}, ${toAtom(tag)}).`);
      }
      lines.push('');
      return lines.join('\n');
    });
  };

  // Generate narrative facts (story arc structure)
  const generateNarrativeFacts = (narrative: any): string => {
    if (!narrative) return '';
    const lines: string[] = [];
    const header = `%% Insimul World Export: ${worldName}\n%% Category: Narrative\n%% Generated: ${new Date().toISOString()}\n`;
    lines.push(header);

    // Writer info
    const writerAtom = toAtom(narrative.writerName || narrative.writerFirstName || 'writer');
    if (narrative.writerName || narrative.writerFirstName) {
      const writerName = narrative.writerName || `${narrative.writerFirstName || ''} ${narrative.writerLastName || ''}`.trim();
      lines.push(`%% Narrative Writer`);
      lines.push(`narrative_writer(${writerAtom}, '${escapeProlog(writerName)}').`);
      if (narrative.writerFirstName) lines.push(`narrative_writer_first_name(${writerAtom}, '${escapeProlog(narrative.writerFirstName)}').`);
      if (narrative.writerLastName) lines.push(`narrative_writer_last_name(${writerAtom}, '${escapeProlog(narrative.writerLastName)}').`);
      if (narrative.writerBackstory) lines.push(`narrative_writer_backstory(${writerAtom}, '${escapeProlog(narrative.writerBackstory)}').`);
      if (narrative.disappearanceReason) lines.push(`narrative_disappearance_reason(${writerAtom}, '${escapeProlog(narrative.disappearanceReason)}').`);
      lines.push('');
    }

    // Chapters
    const chapters = Array.isArray(narrative.chapters) ? narrative.chapters : [];
    if (chapters.length > 0) {
      lines.push(`%% Narrative Chapters (${chapters.length})`);
      for (const ch of chapters) {
        const chAtom = toAtom(ch.chapterId || ch.title || `chapter_${ch.chapterNumber}`);
        lines.push(`narrative_chapter(${chAtom}, ${ch.chapterNumber || 0}, '${escapeProlog(ch.title || '')}').`);
        if (ch.introNarrative) lines.push(`chapter_intro(${chAtom}, '${escapeProlog(ch.introNarrative)}').`);
        if (ch.outroNarrative) lines.push(`chapter_outro(${chAtom}, '${escapeProlog(ch.outroNarrative)}').`);
        if (ch.mysteryDetails) lines.push(`chapter_mystery(${chAtom}, '${escapeProlog(ch.mysteryDetails)}').`);
        // Clues
        if (Array.isArray(ch.clueDescriptions)) {
          for (const clue of ch.clueDescriptions) {
            const clueAtom = toAtom(clue.clueId || '');
            if (clueAtom && clueAtom !== 'unknown') {
              lines.push(`chapter_clue(${chAtom}, ${clueAtom}, '${escapeProlog(clue.text || '')}').`);
              if (clue.npcRole) lines.push(`clue_npc_role(${clueAtom}, ${toAtom(clue.npcRole)}).`);
            }
          }
        }
      }
      lines.push('');
    }

    // Red herrings
    if (Array.isArray(narrative.redHerrings) && narrative.redHerrings.length > 0) {
      lines.push(`%% Red Herrings`);
      for (let i = 0; i < narrative.redHerrings.length; i++) {
        const rh = narrative.redHerrings[i];
        lines.push(`red_herring(${i}, '${escapeProlog(rh.description || '')}', '${escapeProlog(rh.source || '')}').`);
      }
      lines.push('');
    }

    return lines.join('\n');
  };

  const handleInsimulExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all requested data in parallel — always fetch world, countries, settlements for context
      const fetches: Record<string, Promise<Response>> = {};

      // Always fetch structural data for ID→name resolution
      fetches.world = fetch(`/api/worlds/${worldId}`);
      fetches.countries = fetch(`/api/worlds/${worldId}/countries`);
      fetches.states = fetch(`/api/worlds/${worldId}/states`);
      fetches.settlements = fetch(`/api/worlds/${worldId}/settlements`);

      if (includeRules) fetches.rules = fetch(`/api/worlds/${worldId}/rules`);
      if (includeCharacterData) fetches.characters = fetch(`/api/worlds/${worldId}/characters`);
      if (includeActionData) fetches.actions = fetch(`/api/worlds/${worldId}/actions`);
      if (includeQuests) fetches.quests = fetch(`/api/worlds/${worldId}/quests`);
      if (includeItems) fetches.items = fetch(`/api/worlds/${worldId}/items`);
      if (includeGrammars) fetches.grammars = fetch(`/api/worlds/${worldId}/grammars`);
      if (includeLanguages) fetches.languages = fetch(`/api/worlds/${worldId}/languages`);
      if (includeTruths) fetches.truths = fetch(`/api/worlds/${worldId}/truth`);
      if (includeTexts) fetches.texts = fetch(`/api/worlds/${worldId}/texts`);
      if (includeNarrative) fetches.narrative = fetch(`/api/worlds/${worldId}/narrative`);
      // Locations/lots fetched per-settlement below
      // Base content — per category
      if (catToggles.rules?.base) fetches.baseRules = fetch('/api/rules/base');
      if (catToggles.actions?.base) fetches.baseActions = fetch('/api/actions/base');
      if (catToggles.items?.base) fetches.baseItems = fetch('/api/items/base');

      const keys = Object.keys(fetches);
      const responses = await Promise.all(Object.values(fetches));
      const data: Record<string, any> = {};
      for (let i = 0; i < keys.length; i++) {
        if (responses[i].ok) {
          const json = await responses[i].json();
          data[keys[i]] = json;
        } else {
          data[keys[i]] = keys[i] === 'world' ? null : [];
        }
      }

      // Ensure arrays for list data (narrative is an object, not array)
      for (const key of ['countries', 'states', 'settlements', 'rules', 'characters', 'actions', 'quests', 'items', 'grammars', 'languages', 'truths', 'texts', 'baseRules', 'baseActions', 'baseItems']) {
        if (data[key] && !Array.isArray(data[key])) data[key] = [];
      }

      // Fetch lots per settlement
      const allLots: any[] = [];
      if (Array.isArray(data.settlements)) {
        const lotFetches = data.settlements.map((s: any) =>
          fetch(`/api/settlements/${s.id || s._id}/lots`).then(r => r.ok ? r.json() : []).catch(() => [])
        );
        const lotResults = await Promise.all(lotFetches);
        for (const lots of lotResults) {
          if (Array.isArray(lots)) allLots.push(...lots);
        }
      }
      data.locations = allLots;

      // Build ID→name maps for cross-referencing
      const countryAtomMap = new Map<string, string>();
      for (const c of (data.countries || [])) {
        countryAtomMap.set(c.id || c._id, toAtom(c.name || ''));
      }
      const stateAtomMap = new Map<string, string>();
      for (const s of (data.states || [])) {
        stateAtomMap.set(s.id || s._id, toAtom(s.name || ''));
      }
      const settlementAtomMap = new Map<string, string>();
      for (const s of (data.settlements || [])) {
        settlementAtomMap.set(s.id || s._id, toAtom(s.name || ''));
      }
      const charAtomMap = data.characters ? buildCharacterAtomMap(data.characters) : new Map<string, string>();

      // Build per-category file contents
      const exportFiles: Record<string, string> = {};

      // World
      if (data.world) {
        const content = generateWorldFacts(data.world);
        if (content) exportFiles['world.pl'] = content;
      }

      // Countries
      if (data.countries?.length > 0) {
        const content = generateCountryFacts(data.countries);
        if (content) exportFiles['countries.pl'] = content;
      }

      // Settlements
      if (data.settlements?.length > 0) {
        const content = generateSettlementFacts(data.settlements, countryAtomMap, stateAtomMap);
        if (content) exportFiles['settlements.pl'] = content;
      }

      // Locations/lots
      if (data.locations?.length > 0) {
        const content = generateLocationFacts(data.locations, settlementAtomMap);
        if (content) exportFiles['locations.pl'] = content;
      }

      if (data.baseRules?.length > 0) {
        const content = generatePrologSection(data.baseRules, 'Base Rules');
        if (content) exportFiles['base_rules.pl'] = content;
      }
      if (data.baseActions?.length > 0) {
        const content = generatePrologSection(data.baseActions, 'Base Actions');
        if (content) exportFiles['base_actions.pl'] = content;
      }
      if (data.baseItems?.length > 0) {
        const content = generateItemContent(data.baseItems);
        if (content) exportFiles['base_items.pl'] = content;
      }
      if (data.rules) {
        const content = generatePrologSection(data.rules, 'Rules');
        if (content) exportFiles['rules.pl'] = content;
      }
      if (data.actions) {
        const content = generatePrologSection(data.actions, 'Actions');
        if (content) exportFiles['actions.pl'] = content;
      }
      if (data.quests) {
        const content = generatePrologSection(data.quests, 'Quests');
        if (content) exportFiles['quests.pl'] = content;
      }
      if (data.characters) {
        const content = generateCharacterFacts(data.characters);
        if (content) exportFiles['characters.pl'] = content;
      }
      if (data.items) {
        const content = generateItemContent(data.items);
        if (content) exportFiles['items.pl'] = content;
      }
      if (data.grammars) {
        const content = generateGrammarContent(data.grammars);
        if (content) exportFiles['grammars.pl'] = content;
      }
      if (data.languages) {
        const content = generateLanguageContent(data.languages);
        if (content) exportFiles['languages.pl'] = content;
      }
      if (data.truths) {
        const content = generateTruthContent(data.truths, charAtomMap);
        if (content) exportFiles['truths.pl'] = content;
      }
      if (data.texts?.length > 0) {
        const content = generateTextFacts(data.texts);
        if (content) exportFiles['texts.pl'] = content;
      }
      if (data.narrative && typeof data.narrative === 'object' && !Array.isArray(data.narrative)) {
        const content = generateNarrativeFacts(data.narrative);
        if (content) exportFiles['narrative.pl'] = content;
      }

      setExportedFiles(exportFiles);

      // Also build a combined preview for the textarea
      const preview = Object.entries(exportFiles)
        .map(([filename, content]) => `%% ── ${filename} ──\n${content}`)
        .join('\n\n');
      setExportedContent(preview);
    } catch (error) {
      toast({
        title: 'Export Error',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLegacyExport = () => {
    try {
      const content = ruleExporter.exportToFormat(
        rules,
        exportFormat,
        includeSchema,
        includeCharacterData ? characters : undefined,
        includeActionData ? actions : undefined
      );
      setExportedContent(content);
    } catch (error) {
      toast({
        title: 'Export Error',
        description: error instanceof Error ? error.message : 'Failed to export rules',
        variant: 'destructive'
      });
    }
  };

  const handleExport = () => {
    if (exportFormat === 'insimul') {
      handleInsimulExport();
    } else {
      handleLegacyExport();
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportedContent);
    toast({
      title: 'Copied to Clipboard',
      description: 'The exported content has been copied to your clipboard.'
    });
  };

  const handleDownload = async () => {
    const worldSlug = worldName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // For Insimul format, bundle separate files into a zip
    if (exportFormat === 'insimul' && Object.keys(exportedFiles).length > 0) {
      const zip = new JSZip();
      const folder = zip.folder(worldSlug) as JSZip;
      for (const [filename, content] of Object.entries(exportedFiles)) {
        folder.file(filename, content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${worldSlug}_export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'File Downloaded',
        description: `Exported ${Object.keys(exportedFiles).length} files as ${worldSlug}_export.zip`
      });
      return;
    }

    // Legacy single-file download for other formats
    const fileExtensions: Record<string, string> = {
      ensemble: 'json',
      kismet: 'lp',
      tott: 'py'
    };

    const extension = fileExtensions[exportFormat] || 'txt';
    const filename = `${worldSlug}_export.${extension}`;

    const blob = new Blob([exportedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'File Downloaded',
      description: `Exported as ${filename}`
    });
  };

  const selectedFormat = formatOptions.find(option => option.value === exportFormat);
  const isInsimulFormat = exportFormat === 'insimul';

  const selectedCount = isInsimulFormat && counts
    ? Object.entries(catToggles).reduce((sum, [cat, toggle]) => {
        const c = counts[cat as keyof DataCounts];
        if (!c) return sum;
        return sum + (toggle.world ? c.world : 0) + (toggle.base ? c.base : 0);
      }, 0)
    : rules.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export World Data
          </DialogTitle>
          <DialogDescription>
            Export your world data for backup or use in other systems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: SystemType) => { setExportFormat(value); setExportedContent(''); setExportedFiles({}); }} data-testid="select-export-format">
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} data-testid={`format-option-${option.value}`}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFormat && (
              <p className="text-sm text-muted-foreground">{selectedFormat.description}</p>
            )}
          </div>

          {/* Export Options — full categories for Insimul format */}
          {isInsimulFormat ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Data Categories</Label>
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 items-center text-xs text-muted-foreground pb-1 border-b">
                <span />
                <span className="text-center w-16">World</span>
                <span className="text-center w-16">Base</span>
              </div>
              {/* Category rows */}
              {([
                ['rules',      'Rules'],
                ['characters', 'Characters'],
                ['actions',    'Actions'],
                ['quests',     'Quests'],
                ['items',      'Items'],
                ['grammars',   'Grammars'],
                ['languages',  'Languages'],
                ['truths',     'Truths'],
                ['texts',      'Texts'],
                ['narrative',  'Narrative'],
              ] as [string, string][]).map(([cat, label]) => {
                const c = counts?.[cat as keyof DataCounts];
                const hasWorld = (c?.world ?? 0) > 0;
                const hasBase = (c?.base ?? 0) > 0;
                return (
                  <div key={cat} className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center">
                    <Label className="text-sm">{label}</Label>
                    <div className="flex items-center justify-center w-16 gap-1">
                      <Checkbox
                        id={`inc-${cat}-world`}
                        checked={catToggles[cat]?.world ?? false}
                        onCheckedChange={() => toggleCat(cat, 'world')}
                        disabled={!hasWorld}
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{c?.world ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-center w-16 gap-1">
                      {hasBase ? (
                        <>
                          <Checkbox
                            id={`inc-${cat}-base`}
                            checked={catToggles[cat]?.base ?? false}
                            onCheckedChange={() => toggleCat(cat, 'base')}
                          />
                          <span className="text-xs text-muted-foreground w-8 text-right">{c?.base ?? 0}</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground w-16 text-center">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Legacy options for non-Insimul formats */
            <div className="space-y-4">
              {characters.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-characters"
                    checked={includeCharacterData}
                    onCheckedChange={() => toggleCat('characters', 'world')}
                    data-testid="checkbox-include-characters"
                  />
                  <Label htmlFor="include-characters" className="text-sm">
                    Include character data ({characters.length} characters)
                  </Label>
                </div>
              )}

              {actions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-actions"
                    checked={includeActionData}
                    onCheckedChange={() => toggleCat('actions', 'world')}
                    data-testid="checkbox-include-actions"
                  />
                  <Label htmlFor="include-actions" className="text-sm">
                    Include action data ({actions.length} actions)
                  </Label>
                </div>
              )}

              {exportFormat === 'ensemble' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-schema"
                    checked={includeSchema}
                    onCheckedChange={(checked) => setIncludeSchema(!!checked)}
                    data-testid="checkbox-include-schema"
                  />
                  <Label htmlFor="include-schema" className="text-sm">
                    Include schema definitions
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Export Action */}
          <div className="flex gap-3">
            <Button onClick={handleExport} disabled={selectedCount === 0 || isExporting} data-testid="button-export">
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                'Generate Export'
              )}
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              {selectedCount} items to export
            </div>
          </div>

          {/* Export Results */}
          {exportedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="exported-content">
                  Exported Content ({exportedContent.length.toLocaleString()} chars)
                </Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyToClipboard}
                    data-testid="button-copy-content"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    data-testid="button-download-file"
                  >
                    {isInsimulFormat && Object.keys(exportedFiles).length > 0 ? (
                      <>
                        <Archive className="w-4 h-4 mr-2" />
                        Download ZIP ({Object.keys(exportedFiles).length} files)
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                id="exported-content"
                value={exportedContent}
                readOnly
                className="min-h-[400px] font-mono text-sm"
                data-testid="textarea-exported-content"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
