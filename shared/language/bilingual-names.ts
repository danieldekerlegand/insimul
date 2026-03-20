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
 * Residence type translations by language
 */
export const RESIDENCE_TRANSLATIONS: Record<string, Record<string, string>> = {
  french: {
    house: 'Maison',
    apartment: 'Appartement',
    mansion: 'Manoir',
    cottage: 'Chaumière',
    townhouse: 'Maison de ville',
    villa: 'Villa',
    cabin: 'Cabane',
    farmhouse: 'Maison de ferme',
    estate: 'Domaine',
    residence_small: 'Petite maison',
    residence_medium: 'Maison',
    residence_large: 'Grande maison',
  },
  spanish: {
    house: 'Casa',
    apartment: 'Apartamento',
    mansion: 'Mansión',
    cottage: 'Cabaña',
    townhouse: 'Casa adosada',
    villa: 'Villa',
    cabin: 'Cabaña',
    farmhouse: 'Casa de campo',
    estate: 'Finca',
    residence_small: 'Casa pequeña',
    residence_medium: 'Casa',
    residence_large: 'Casa grande',
  },
  german: {
    house: 'Haus',
    apartment: 'Wohnung',
    mansion: 'Herrenhaus',
    cottage: 'Hütte',
    townhouse: 'Stadthaus',
    villa: 'Villa',
    cabin: 'Blockhütte',
    farmhouse: 'Bauernhaus',
    estate: 'Anwesen',
    residence_small: 'Kleines Haus',
    residence_medium: 'Haus',
    residence_large: 'Großes Haus',
  },
  italian: {
    house: 'Casa',
    apartment: 'Appartamento',
    mansion: 'Palazzo',
    cottage: 'Casetta',
    townhouse: 'Casa a schiera',
    villa: 'Villa',
    cabin: 'Capanna',
    farmhouse: 'Casale',
    estate: 'Tenuta',
    residence_small: 'Casetta',
    residence_medium: 'Casa',
    residence_large: 'Casa grande',
  },
};

/**
 * Municipal/public building translations by language
 */
export const MUNICIPAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  french: {
    'town hall': 'Hôtel de ville',
    courthouse: 'Palais de justice',
    'post office': 'Bureau de poste',
    'fire station': 'Caserne de pompiers',
    'police station': 'Commissariat',
    prison: 'Prison',
    cemetery: 'Cimetière',
    park: 'Parc',
    fountain: 'Fontaine',
    monument: 'Monument',
    plaza: 'Place',
    bridge: 'Pont',
    dock: 'Quai',
    warehouse: 'Entrepôt',
    theater: 'Théâtre',
    museum: 'Musée',
    'train station': 'Gare',
    mill: 'Moulin',
    well: 'Puits',
    tower: 'Tour',
    gate: 'Porte',
    wall: 'Rempart',
  },
  spanish: {
    'town hall': 'Ayuntamiento',
    courthouse: 'Juzgado',
    'post office': 'Correos',
    'fire station': 'Estación de bomberos',
    'police station': 'Comisaría',
    prison: 'Prisión',
    cemetery: 'Cementerio',
    park: 'Parque',
    fountain: 'Fuente',
    monument: 'Monumento',
    plaza: 'Plaza',
    bridge: 'Puente',
    dock: 'Muelle',
    warehouse: 'Almacén',
    theater: 'Teatro',
    museum: 'Museo',
    'train station': 'Estación de tren',
    mill: 'Molino',
    well: 'Pozo',
    tower: 'Torre',
    gate: 'Puerta',
    wall: 'Muralla',
  },
  german: {
    'town hall': 'Rathaus',
    courthouse: 'Gericht',
    'post office': 'Postamt',
    'fire station': 'Feuerwehr',
    'police station': 'Polizeiwache',
    prison: 'Gefängnis',
    cemetery: 'Friedhof',
    park: 'Park',
    fountain: 'Brunnen',
    monument: 'Denkmal',
    plaza: 'Platz',
    bridge: 'Brücke',
    dock: 'Kai',
    warehouse: 'Lagerhaus',
    theater: 'Theater',
    museum: 'Museum',
    'train station': 'Bahnhof',
    mill: 'Mühle',
    well: 'Brunnen',
    tower: 'Turm',
    gate: 'Tor',
    wall: 'Stadtmauer',
  },
  italian: {
    'town hall': 'Municipio',
    courthouse: 'Tribunale',
    'post office': 'Ufficio postale',
    'fire station': 'Caserma dei pompieri',
    'police station': 'Questura',
    prison: 'Prigione',
    cemetery: 'Cimitero',
    park: 'Parco',
    fountain: 'Fontana',
    monument: 'Monumento',
    plaza: 'Piazza',
    bridge: 'Ponte',
    dock: 'Banchina',
    warehouse: 'Magazzino',
    theater: 'Teatro',
    museum: 'Museo',
    'train station': 'Stazione ferroviaria',
    mill: 'Mulino',
    well: 'Pozzo',
    tower: 'Torre',
    gate: 'Porta',
    wall: 'Mura',
  },
};

/**
 * Street type translations by language (used for street name signs)
 */
export const STREET_TRANSLATIONS: Record<string, Record<string, string>> = {
  french: {
    street: 'Rue',
    road: 'Route',
    avenue: 'Avenue',
    boulevard: 'Boulevard',
    lane: 'Ruelle',
    alley: 'Allée',
    path: 'Chemin',
    square: 'Place',
    court: 'Cour',
    drive: 'Allée',
    way: 'Voie',
    'main street': 'Grande Rue',
  },
  spanish: {
    street: 'Calle',
    road: 'Camino',
    avenue: 'Avenida',
    boulevard: 'Bulevar',
    lane: 'Callejón',
    alley: 'Callejuela',
    path: 'Sendero',
    square: 'Plaza',
    court: 'Patio',
    drive: 'Paseo',
    way: 'Vía',
    'main street': 'Calle Mayor',
  },
  german: {
    street: 'Straße',
    road: 'Weg',
    avenue: 'Allee',
    boulevard: 'Boulevard',
    lane: 'Gasse',
    alley: 'Gasse',
    path: 'Pfad',
    square: 'Platz',
    court: 'Hof',
    drive: 'Weg',
    way: 'Weg',
    'main street': 'Hauptstraße',
  },
  italian: {
    street: 'Via',
    road: 'Strada',
    avenue: 'Viale',
    boulevard: 'Corso',
    lane: 'Vicolo',
    alley: 'Vicoletto',
    path: 'Sentiero',
    square: 'Piazza',
    court: 'Corte',
    drive: 'Viale',
    way: 'Via',
    'main street': 'Via Principale',
  },
};

/**
 * Common world object labels by language (for interactive hover labels)
 */
export const WORLD_OBJECT_TRANSLATIONS: Record<string, Record<string, string>> = {
  french: {
    tree: 'Arbre',
    bench: 'Banc',
    fountain: 'Fontaine',
    well: 'Puits',
    barrel: 'Tonneau',
    crate: 'Caisse',
    cart: 'Chariot',
    lantern: 'Lanterne',
    sign: 'Panneau',
    door: 'Porte',
    window: 'Fenêtre',
    roof: 'Toit',
    fence: 'Clôture',
    garden: 'Jardin',
    flower: 'Fleur',
    bridge: 'Pont',
    boat: 'Bateau',
    flag: 'Drapeau',
    bell: 'Cloche',
    statue: 'Statue',
    table: 'Table',
    chair: 'Chaise',
    lamp: 'Lampe',
    basket: 'Panier',
    bucket: 'Seau',
    wagon: 'Chariot',
    horse: 'Cheval',
    dog: 'Chien',
    cat: 'Chat',
    chicken: 'Poule',
  },
  spanish: {
    tree: 'Árbol',
    bench: 'Banco',
    fountain: 'Fuente',
    well: 'Pozo',
    barrel: 'Barril',
    crate: 'Caja',
    cart: 'Carro',
    lantern: 'Farol',
    sign: 'Letrero',
    door: 'Puerta',
    window: 'Ventana',
    roof: 'Techo',
    fence: 'Cerca',
    garden: 'Jardín',
    flower: 'Flor',
    bridge: 'Puente',
    boat: 'Bote',
    flag: 'Bandera',
    bell: 'Campana',
    statue: 'Estatua',
    table: 'Mesa',
    chair: 'Silla',
    lamp: 'Lámpara',
    basket: 'Canasta',
    bucket: 'Cubo',
    wagon: 'Carreta',
    horse: 'Caballo',
    dog: 'Perro',
    cat: 'Gato',
    chicken: 'Gallina',
  },
  german: {
    tree: 'Baum',
    bench: 'Bank',
    fountain: 'Brunnen',
    well: 'Brunnen',
    barrel: 'Fass',
    crate: 'Kiste',
    cart: 'Karren',
    lantern: 'Laterne',
    sign: 'Schild',
    door: 'Tür',
    window: 'Fenster',
    roof: 'Dach',
    fence: 'Zaun',
    garden: 'Garten',
    flower: 'Blume',
    bridge: 'Brücke',
    boat: 'Boot',
    flag: 'Flagge',
    bell: 'Glocke',
    statue: 'Statue',
    table: 'Tisch',
    chair: 'Stuhl',
    lamp: 'Lampe',
    basket: 'Korb',
    bucket: 'Eimer',
    wagon: 'Wagen',
    horse: 'Pferd',
    dog: 'Hund',
    cat: 'Katze',
    chicken: 'Huhn',
  },
  italian: {
    tree: 'Albero',
    bench: 'Panchina',
    fountain: 'Fontana',
    well: 'Pozzo',
    barrel: 'Botte',
    crate: 'Cassetta',
    cart: 'Carro',
    lantern: 'Lanterna',
    sign: 'Cartello',
    door: 'Porta',
    window: 'Finestra',
    roof: 'Tetto',
    fence: 'Recinto',
    garden: 'Giardino',
    flower: 'Fiore',
    bridge: 'Ponte',
    boat: 'Barca',
    flag: 'Bandiera',
    bell: 'Campana',
    statue: 'Statua',
    table: 'Tavolo',
    chair: 'Sedia',
    lamp: 'Lampada',
    basket: 'Cesto',
    bucket: 'Secchio',
    wagon: 'Carro',
    horse: 'Cavallo',
    dog: 'Cane',
    cat: 'Gatto',
    chicken: 'Pollo',
  },
};

/**
 * Advanced/detail text for building signs (shown at high fluency)
 */
export const BUSINESS_DETAIL_TRANSLATIONS: Record<string, Record<string, string>> = {
  french: {
    bakery: 'Boulangerie artisanale',
    tavern: 'Taverne du village',
    inn: 'Auberge du voyageur',
    blacksmith: 'Forge et ferronnerie',
    market: 'Marché couvert',
    shop: 'Boutique de quartier',
    church: 'Église paroissiale',
    library: 'Bibliothèque municipale',
    school: 'École communale',
    hospital: 'Hôpital général',
    bank: 'Banque de commerce',
    farm: 'Ferme familiale',
    stables: 'Écuries royales',
    barracks: 'Caserne militaire',
    'town hall': 'Mairie et administration',
    'general store': 'Épicerie fine',
    butcher: 'Boucherie-charcuterie',
    tailor: 'Atelier de couture',
    apothecary: 'Apothicaire et herboriste',
    jeweler: 'Bijouterie-joaillerie',
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
 * Get bilingual residence name for a given language and residence type
 */
export function getBilingualResidenceName(language: string, residenceType: string): BilingualName | null {
  const langKey = language.toLowerCase();
  const translations = RESIDENCE_TRANSLATIONS[langKey];
  if (!translations) return null;

  const typeKey = residenceType.toLowerCase();
  const translation = translations[typeKey];
  if (!translation) return null;

  return {
    targetLanguage: translation,
    english: residenceType.charAt(0).toUpperCase() + residenceType.slice(1),
  };
}

/**
 * Get bilingual municipal building name for a given language
 */
export function getBilingualMunicipalName(language: string, buildingType: string): BilingualName | null {
  const langKey = language.toLowerCase();
  const translations = MUNICIPAL_TRANSLATIONS[langKey];
  if (!translations) return null;

  const typeKey = buildingType.toLowerCase();
  const translation = translations[typeKey];
  if (!translation) return null;

  return {
    targetLanguage: translation,
    english: buildingType.charAt(0).toUpperCase() + buildingType.slice(1),
  };
}

/**
 * Get bilingual street type prefix for a given language
 */
export function getBilingualStreetName(language: string, streetType: string, streetName: string): BilingualName | null {
  const langKey = language.toLowerCase();
  const translations = STREET_TRANSLATIONS[langKey];
  if (!translations) return null;

  const typeKey = streetType.toLowerCase();
  const translation = translations[typeKey];
  if (!translation) return null;

  return {
    targetLanguage: `${translation} ${streetName}`,
    english: `${streetType.charAt(0).toUpperCase() + streetType.slice(1)} ${streetName}`,
  };
}

/**
 * Get bilingual label for a world object
 */
export function getBilingualObjectLabel(language: string, objectType: string): BilingualName | null {
  const langKey = language.toLowerCase();
  const translations = WORLD_OBJECT_TRANSLATIONS[langKey];
  if (!translations) return null;

  const typeKey = objectType.toLowerCase();
  const translation = translations[typeKey];
  if (!translation) return null;

  return {
    targetLanguage: translation,
    english: objectType.charAt(0).toUpperCase() + objectType.slice(1),
  };
}

/**
 * Get the advanced/detail text for a building sign (high fluency tier)
 */
export function getBusinessDetailText(language: string, businessType: string): string | null {
  const langKey = language.toLowerCase();
  const details = BUSINESS_DETAIL_TRANSLATIONS[langKey];
  if (!details) return null;

  return details[businessType.toLowerCase()] || null;
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
