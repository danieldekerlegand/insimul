/**
 * Bilingual Name Generation
 *
 * Helpers for generating names (settlements, NPCs, buildings, items)
 * in the target language with English translations stored alongside.
 */

export interface BilingualName {
  targetLanguage: string;  // Name in the target language
  english: string;         // English translation
  pronunciation?: string;  // Optional pronunciation guide
}

/**
 * Common settlement name components by language for offline fallback
 */
export const SETTLEMENT_NAME_COMPONENTS: Record<string, { prefixes: string[]; suffixes: string[]; types: Record<string, string> }> = {
  french: {
    prefixes: ['Saint-', 'Mont-', 'Belle-', 'Beau-', 'Vieux-', 'Château-', 'Pont-', 'Val-', 'Roche-', 'Bois-'],
    suffixes: ['-sur-Mer', '-les-Bains', '-en-Ciel', '-la-Forêt', '-le-Grand', '-le-Petit'],
    types: { village: 'village', town: 'bourg', city: 'cité', market: 'marché' },
  },
  spanish: {
    prefixes: ['San ', 'Santa ', 'Villa ', 'Puerto ', 'Monte ', 'Río ', 'Cerro ', 'Valle '],
    suffixes: [' del Mar', ' del Sol', ' de la Sierra', ' de los Ríos', ' la Vieja', ' la Nueva'],
    types: { village: 'aldea', town: 'pueblo', city: 'ciudad', market: 'mercado' },
  },
  german: {
    prefixes: ['Alt-', 'Neu-', 'Ober-', 'Unter-', 'Groß-', 'Klein-'],
    suffixes: ['-berg', '-burg', '-dorf', '-heim', '-wald', '-feld', '-stein', '-hausen', '-bach'],
    types: { village: 'Dorf', town: 'Stadt', city: 'Stadt', market: 'Markt' },
  },
  italian: {
    prefixes: ['San ', 'Santa ', 'Monte ', 'Porto ', 'Castel-', 'Torre '],
    suffixes: [' al Mare', ' di Sopra', ' di Sotto', ' Vecchia', ' Nuova'],
    types: { village: 'villaggio', town: 'borgo', city: 'città', market: 'mercato' },
  },
  japanese: {
    prefixes: ['新', '東', '西', '南', '北', '大', '小', '上', '下'],
    suffixes: ['村', '町', '市', '里', '浜', '山', '川', '野', '原'],
    types: { village: '村', town: '町', city: '市', market: '市場' },
  },
};

/**
 * Common business name translations by language
 */
export const BUSINESS_TRANSLATIONS: Record<string, Record<string, string>> = {
  french: {
    bakery: 'Boulangerie',
    tavern: 'Taverne',
    inn: 'Auberge',
    blacksmith: "Forge",
    market: 'Marché',
    shop: 'Boutique',
    church: 'Église',
    library: 'Bibliothèque',
    school: 'École',
    hospital: 'Hôpital',
    bank: 'Banque',
    farm: 'Ferme',
    stables: 'Écuries',
    barracks: 'Caserne',
    'town hall': 'Mairie',
    'general store': 'Épicerie',
    butcher: 'Boucherie',
    tailor: 'Couturière',
    apothecary: 'Apothicaire',
    jeweler: 'Bijouterie',
  },
  spanish: {
    bakery: 'Panadería',
    tavern: 'Taberna',
    inn: 'Posada',
    blacksmith: 'Herrería',
    market: 'Mercado',
    shop: 'Tienda',
    church: 'Iglesia',
    library: 'Biblioteca',
    school: 'Escuela',
    hospital: 'Hospital',
    bank: 'Banco',
    farm: 'Granja',
    stables: 'Establos',
    barracks: 'Cuartel',
    'town hall': 'Ayuntamiento',
    'general store': 'Tienda General',
    butcher: 'Carnicería',
    tailor: 'Sastrería',
    apothecary: 'Botica',
    jeweler: 'Joyería',
  },
  german: {
    bakery: 'Bäckerei',
    tavern: 'Gasthaus',
    inn: 'Wirtshaus',
    blacksmith: 'Schmiede',
    market: 'Markt',
    shop: 'Laden',
    church: 'Kirche',
    library: 'Bibliothek',
    school: 'Schule',
    hospital: 'Krankenhaus',
    bank: 'Bank',
    farm: 'Bauernhof',
    stables: 'Ställe',
    barracks: 'Kaserne',
    'town hall': 'Rathaus',
    'general store': 'Gemischtwarenladen',
    butcher: 'Metzgerei',
    tailor: 'Schneiderei',
    apothecary: 'Apotheke',
    jeweler: 'Juwelier',
  },
  italian: {
    bakery: 'Panetteria',
    tavern: 'Taverna',
    inn: 'Locanda',
    blacksmith: 'Fucina',
    market: 'Mercato',
    shop: 'Negozio',
    church: 'Chiesa',
    library: 'Biblioteca',
    school: 'Scuola',
    hospital: 'Ospedale',
    bank: 'Banca',
    farm: 'Fattoria',
    stables: 'Stalle',
    barracks: 'Caserma',
    'town hall': 'Municipio',
    'general store': 'Emporio',
    butcher: 'Macelleria',
    tailor: 'Sartoria',
    apothecary: 'Farmacia',
    jeweler: 'Gioielleria',
  },
};

/**
 * Get bilingual business name for a given language and business type
 */
export function getBilingualBusinessName(language: string, businessType: string): BilingualName | null {
  const langKey = language.toLowerCase();
  const translations = BUSINESS_TRANSLATIONS[langKey];
  if (!translations) return null;

  const typeKey = businessType.toLowerCase();
  const translation = translations[typeKey];
  if (!translation) return null;

  return {
    targetLanguage: translation,
    english: businessType.charAt(0).toUpperCase() + businessType.slice(1),
  };
}

/**
 * Build an LLM prompt for generating bilingual settlement names
 */
export function buildSettlementNamePrompt(
  targetLanguage: string,
  settlementType: string,
  terrain: string,
  worldType: string,
  count: number = 5
): string {
  return `Generate ${count} settlement names for a ${worldType} world where the primary language is ${targetLanguage}.
The settlements are ${settlementType}s located in ${terrain} terrain.

For each name, provide:
1. The name in ${targetLanguage}
2. Its English translation or meaning
3. A brief pronunciation guide

Format each as JSON: {"targetLanguage": "...", "english": "...", "pronunciation": "..."}
Return as a JSON array.`;
}

/**
 * Build an LLM prompt for generating NPC names appropriate to the target language
 */
export function buildNPCNamePrompt(
  targetLanguage: string,
  gender: 'male' | 'female',
  occupation: string,
  count: number = 5
): string {
  return `Generate ${count} character names appropriate for a ${targetLanguage}-speaking ${occupation} (${gender}).
The names should sound natural for a ${targetLanguage}-speaking culture.

For each name, provide:
1. First name
2. Last name
3. A nickname or title in ${targetLanguage} (e.g., "le Boulanger" for a French baker)

Format each as JSON: {"firstName": "...", "lastName": "...", "title": "..."}
Return as a JSON array.`;
}
