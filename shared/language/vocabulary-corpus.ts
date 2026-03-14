/**
 * Language Vocabulary Corpus
 *
 * Organized vocabulary by category with difficulty tiers,
 * parts of speech, and pronunciation guides.
 * Used at world creation time to seed the WorldLanguage record.
 */

export interface VocabularyCorpusEntry {
  english: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'interjection' | 'number';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export type VocabularyCategory =
  | 'greetings' | 'numbers' | 'food' | 'family' | 'body'
  | 'emotions' | 'actions' | 'colors' | 'time' | 'places'
  | 'professions' | 'nature' | 'weather' | 'transportation'
  | 'clothing' | 'household' | 'animals' | 'shopping'
  | 'directions' | 'social';

/**
 * Core vocabulary corpus organized by category.
 * Each entry has English word, part of speech, difficulty, and category.
 */
export const VOCABULARY_CORPUS: Record<VocabularyCategory, VocabularyCorpusEntry[]> = {
  greetings: [
    { english: 'hello', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'goodbye', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'please', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'greetings' },
    { english: 'thank you', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'yes', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'greetings' },
    { english: 'no', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'greetings' },
    { english: 'excuse me', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'sorry', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'good morning', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'good evening', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'good night', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'how are you', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
    { english: 'nice to meet you', partOfSpeech: 'interjection', difficulty: 'intermediate', category: 'greetings' },
    { english: 'see you later', partOfSpeech: 'interjection', difficulty: 'intermediate', category: 'greetings' },
    { english: 'welcome', partOfSpeech: 'interjection', difficulty: 'beginner', category: 'greetings' },
  ],
  numbers: [
    ...Array.from({ length: 20 }, (_, i): VocabularyCorpusEntry => ({
      english: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'][i],
      partOfSpeech: 'number',
      difficulty: i <= 10 ? 'beginner' : 'intermediate',
      category: 'numbers',
    })),
    { english: 'twenty', partOfSpeech: 'number', difficulty: 'beginner', category: 'numbers' },
    { english: 'thirty', partOfSpeech: 'number', difficulty: 'intermediate', category: 'numbers' },
    { english: 'forty', partOfSpeech: 'number', difficulty: 'intermediate', category: 'numbers' },
    { english: 'fifty', partOfSpeech: 'number', difficulty: 'intermediate', category: 'numbers' },
    { english: 'hundred', partOfSpeech: 'number', difficulty: 'intermediate', category: 'numbers' },
    { english: 'thousand', partOfSpeech: 'number', difficulty: 'advanced', category: 'numbers' },
    { english: 'first', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'numbers' },
    { english: 'second', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'numbers' },
    { english: 'third', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'numbers' },
    { english: 'last', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'numbers' },
  ],
  food: [
    { english: 'bread', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'water', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'milk', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'cheese', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'meat', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'fish', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'fruit', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'apple', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'egg', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'rice', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'soup', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'salt', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'sugar', partOfSpeech: 'noun', difficulty: 'beginner', category: 'food' },
    { english: 'wine', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'beer', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'vegetable', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'potato', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'tomato', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'onion', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'chicken', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'butter', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'flour', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'cake', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'pie', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'food' },
    { english: 'to eat', partOfSpeech: 'verb', difficulty: 'beginner', category: 'food' },
    { english: 'to drink', partOfSpeech: 'verb', difficulty: 'beginner', category: 'food' },
    { english: 'to cook', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'food' },
    { english: 'hungry', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'food' },
    { english: 'thirsty', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'food' },
    { english: 'delicious', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'food' },
  ],
  family: [
    { english: 'mother', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'father', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'sister', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'brother', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'son', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'daughter', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'husband', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'wife', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'child', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'baby', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'grandmother', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'family' },
    { english: 'grandfather', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'family' },
    { english: 'uncle', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'family' },
    { english: 'aunt', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'family' },
    { english: 'cousin', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'family' },
    { english: 'friend', partOfSpeech: 'noun', difficulty: 'beginner', category: 'family' },
    { english: 'neighbor', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'family' },
  ],
  body: [
    { english: 'head', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'hand', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'foot', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'eye', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'ear', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'mouth', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'nose', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'hair', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'arm', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'body' },
    { english: 'leg', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'body' },
    { english: 'heart', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'body' },
    { english: 'back', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'body' },
    { english: 'face', partOfSpeech: 'noun', difficulty: 'beginner', category: 'body' },
    { english: 'finger', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'body' },
    { english: 'stomach', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'body' },
  ],
  emotions: [
    { english: 'happy', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'emotions' },
    { english: 'sad', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'emotions' },
    { english: 'angry', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'emotions' },
    { english: 'afraid', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'emotions' },
    { english: 'tired', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'emotions' },
    { english: 'love', partOfSpeech: 'noun', difficulty: 'beginner', category: 'emotions' },
    { english: 'to love', partOfSpeech: 'verb', difficulty: 'beginner', category: 'emotions' },
    { english: 'to like', partOfSpeech: 'verb', difficulty: 'beginner', category: 'emotions' },
    { english: 'to hate', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'emotions' },
    { english: 'surprised', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'emotions' },
    { english: 'worried', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'emotions' },
    { english: 'excited', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'emotions' },
    { english: 'proud', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'emotions' },
    { english: 'lonely', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'emotions' },
    { english: 'grateful', partOfSpeech: 'adjective', difficulty: 'advanced', category: 'emotions' },
  ],
  actions: [
    { english: 'to go', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to come', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to see', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to hear', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to speak', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to walk', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to run', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to sit', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to stand', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to give', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to take', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to buy', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to sell', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to make', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to work', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to sleep', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to open', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to close', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to read', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to write', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to think', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to know', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to want', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to need', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to help', partOfSpeech: 'verb', difficulty: 'beginner', category: 'actions' },
    { english: 'to wait', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to find', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to bring', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to carry', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'actions' },
    { english: 'to build', partOfSpeech: 'verb', difficulty: 'advanced', category: 'actions' },
  ],
  colors: [
    { english: 'red', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'colors' },
    { english: 'blue', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'colors' },
    { english: 'green', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'colors' },
    { english: 'yellow', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'colors' },
    { english: 'white', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'colors' },
    { english: 'black', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'colors' },
    { english: 'brown', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
    { english: 'orange', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
    { english: 'purple', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
    { english: 'pink', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
    { english: 'gray', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
    { english: 'gold', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
    { english: 'silver', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
    { english: 'dark', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
    { english: 'light', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'colors' },
  ],
  time: [
    { english: 'today', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'time' },
    { english: 'tomorrow', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'time' },
    { english: 'yesterday', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'time' },
    { english: 'now', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'time' },
    { english: 'morning', partOfSpeech: 'noun', difficulty: 'beginner', category: 'time' },
    { english: 'afternoon', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'time' },
    { english: 'evening', partOfSpeech: 'noun', difficulty: 'beginner', category: 'time' },
    { english: 'night', partOfSpeech: 'noun', difficulty: 'beginner', category: 'time' },
    { english: 'day', partOfSpeech: 'noun', difficulty: 'beginner', category: 'time' },
    { english: 'week', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'time' },
    { english: 'month', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'time' },
    { english: 'year', partOfSpeech: 'noun', difficulty: 'beginner', category: 'time' },
    { english: 'hour', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'time' },
    { english: 'minute', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'time' },
    { english: 'soon', partOfSpeech: 'adverb', difficulty: 'intermediate', category: 'time' },
    { english: 'later', partOfSpeech: 'adverb', difficulty: 'intermediate', category: 'time' },
    { english: 'always', partOfSpeech: 'adverb', difficulty: 'intermediate', category: 'time' },
    { english: 'never', partOfSpeech: 'adverb', difficulty: 'intermediate', category: 'time' },
    { english: 'sometimes', partOfSpeech: 'adverb', difficulty: 'intermediate', category: 'time' },
    { english: 'early', partOfSpeech: 'adverb', difficulty: 'intermediate', category: 'time' },
    { english: 'late', partOfSpeech: 'adverb', difficulty: 'intermediate', category: 'time' },
  ],
  places: [
    { english: 'house', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'home', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'market', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'shop', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'church', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
    { english: 'school', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'inn', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'tavern', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
    { english: 'street', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'bridge', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
    { english: 'garden', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
    { english: 'farm', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'castle', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
    { english: 'library', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
    { english: 'town hall', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
    { english: 'village', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'city', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'forest', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
    { english: 'road', partOfSpeech: 'noun', difficulty: 'beginner', category: 'places' },
    { english: 'square', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'places' },
  ],
  professions: [
    { english: 'baker', partOfSpeech: 'noun', difficulty: 'beginner', category: 'professions' },
    { english: 'farmer', partOfSpeech: 'noun', difficulty: 'beginner', category: 'professions' },
    { english: 'blacksmith', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'merchant', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'teacher', partOfSpeech: 'noun', difficulty: 'beginner', category: 'professions' },
    { english: 'doctor', partOfSpeech: 'noun', difficulty: 'beginner', category: 'professions' },
    { english: 'soldier', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'priest', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'carpenter', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'tailor', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'innkeeper', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'fisherman', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'guard', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
    { english: 'scholar', partOfSpeech: 'noun', difficulty: 'advanced', category: 'professions' },
    { english: 'mayor', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'professions' },
  ],
  nature: [
    { english: 'tree', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'flower', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'mountain', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'river', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'lake', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'nature' },
    { english: 'sea', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'sky', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'sun', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'moon', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'star', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'earth', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
    { english: 'stone', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'nature' },
    { english: 'field', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'nature' },
    { english: 'grass', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'nature' },
    { english: 'fire', partOfSpeech: 'noun', difficulty: 'beginner', category: 'nature' },
  ],
  weather: [
    { english: 'rain', partOfSpeech: 'noun', difficulty: 'beginner', category: 'weather' },
    { english: 'snow', partOfSpeech: 'noun', difficulty: 'beginner', category: 'weather' },
    { english: 'wind', partOfSpeech: 'noun', difficulty: 'beginner', category: 'weather' },
    { english: 'cloud', partOfSpeech: 'noun', difficulty: 'beginner', category: 'weather' },
    { english: 'storm', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'weather' },
    { english: 'hot', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'weather' },
    { english: 'cold', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'weather' },
    { english: 'warm', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'weather' },
    { english: 'sunny', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'weather' },
    { english: 'foggy', partOfSpeech: 'adjective', difficulty: 'advanced', category: 'weather' },
  ],
  transportation: [
    { english: 'horse', partOfSpeech: 'noun', difficulty: 'beginner', category: 'transportation' },
    { english: 'cart', partOfSpeech: 'noun', difficulty: 'beginner', category: 'transportation' },
    { english: 'boat', partOfSpeech: 'noun', difficulty: 'beginner', category: 'transportation' },
    { english: 'ship', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'transportation' },
    { english: 'wagon', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'transportation' },
    { english: 'to ride', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'transportation' },
    { english: 'to travel', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'transportation' },
    { english: 'to arrive', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'transportation' },
    { english: 'to leave', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'transportation' },
    { english: 'far', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'transportation' },
    { english: 'near', partOfSpeech: 'adjective', difficulty: 'beginner', category: 'transportation' },
  ],
  clothing: [
    { english: 'hat', partOfSpeech: 'noun', difficulty: 'beginner', category: 'clothing' },
    { english: 'shirt', partOfSpeech: 'noun', difficulty: 'beginner', category: 'clothing' },
    { english: 'pants', partOfSpeech: 'noun', difficulty: 'beginner', category: 'clothing' },
    { english: 'shoes', partOfSpeech: 'noun', difficulty: 'beginner', category: 'clothing' },
    { english: 'dress', partOfSpeech: 'noun', difficulty: 'beginner', category: 'clothing' },
    { english: 'coat', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'clothing' },
    { english: 'boots', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'clothing' },
    { english: 'gloves', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'clothing' },
    { english: 'belt', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'clothing' },
    { english: 'cloak', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'clothing' },
  ],
  household: [
    { english: 'table', partOfSpeech: 'noun', difficulty: 'beginner', category: 'household' },
    { english: 'chair', partOfSpeech: 'noun', difficulty: 'beginner', category: 'household' },
    { english: 'bed', partOfSpeech: 'noun', difficulty: 'beginner', category: 'household' },
    { english: 'door', partOfSpeech: 'noun', difficulty: 'beginner', category: 'household' },
    { english: 'window', partOfSpeech: 'noun', difficulty: 'beginner', category: 'household' },
    { english: 'fire', partOfSpeech: 'noun', difficulty: 'beginner', category: 'household' },
    { english: 'candle', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'household' },
    { english: 'key', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'household' },
    { english: 'book', partOfSpeech: 'noun', difficulty: 'beginner', category: 'household' },
    { english: 'cup', partOfSpeech: 'noun', difficulty: 'beginner', category: 'household' },
    { english: 'plate', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'household' },
    { english: 'knife', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'household' },
    { english: 'broom', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'household' },
    { english: 'blanket', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'household' },
    { english: 'mirror', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'household' },
  ],
  animals: [
    { english: 'dog', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'cat', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'horse', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'cow', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'sheep', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'pig', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'chicken', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'bird', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'fish', partOfSpeech: 'noun', difficulty: 'beginner', category: 'animals' },
    { english: 'wolf', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'animals' },
    { english: 'deer', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'animals' },
    { english: 'bear', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'animals' },
    { english: 'rabbit', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'animals' },
    { english: 'snake', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'animals' },
    { english: 'dragon', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'animals' },
  ],
  shopping: [
    { english: 'money', partOfSpeech: 'noun', difficulty: 'beginner', category: 'shopping' },
    { english: 'coin', partOfSpeech: 'noun', difficulty: 'beginner', category: 'shopping' },
    { english: 'price', partOfSpeech: 'noun', difficulty: 'beginner', category: 'shopping' },
    { english: 'cheap', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'shopping' },
    { english: 'expensive', partOfSpeech: 'adjective', difficulty: 'intermediate', category: 'shopping' },
    { english: 'to pay', partOfSpeech: 'verb', difficulty: 'beginner', category: 'shopping' },
    { english: 'to buy', partOfSpeech: 'verb', difficulty: 'beginner', category: 'shopping' },
    { english: 'to sell', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'shopping' },
    { english: 'how much', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'shopping' },
    { english: 'change', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'shopping' },
  ],
  directions: [
    { english: 'left', partOfSpeech: 'noun', difficulty: 'beginner', category: 'directions' },
    { english: 'right', partOfSpeech: 'noun', difficulty: 'beginner', category: 'directions' },
    { english: 'straight', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'directions' },
    { english: 'north', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'directions' },
    { english: 'south', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'directions' },
    { english: 'east', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'directions' },
    { english: 'west', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'directions' },
    { english: 'here', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'directions' },
    { english: 'there', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'directions' },
    { english: 'where', partOfSpeech: 'adverb', difficulty: 'beginner', category: 'directions' },
    { english: 'to turn', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'directions' },
    { english: 'behind', partOfSpeech: 'preposition', difficulty: 'intermediate', category: 'directions' },
    { english: 'in front of', partOfSpeech: 'preposition', difficulty: 'intermediate', category: 'directions' },
    { english: 'next to', partOfSpeech: 'preposition', difficulty: 'intermediate', category: 'directions' },
    { english: 'between', partOfSpeech: 'preposition', difficulty: 'advanced', category: 'directions' },
  ],
  social: [
    { english: 'name', partOfSpeech: 'noun', difficulty: 'beginner', category: 'social' },
    { english: 'age', partOfSpeech: 'noun', difficulty: 'beginner', category: 'social' },
    { english: 'man', partOfSpeech: 'noun', difficulty: 'beginner', category: 'social' },
    { english: 'woman', partOfSpeech: 'noun', difficulty: 'beginner', category: 'social' },
    { english: 'person', partOfSpeech: 'noun', difficulty: 'beginner', category: 'social' },
    { english: 'people', partOfSpeech: 'noun', difficulty: 'beginner', category: 'social' },
    { english: 'king', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'social' },
    { english: 'queen', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'social' },
    { english: 'lord', partOfSpeech: 'noun', difficulty: 'intermediate', category: 'social' },
    { english: 'to talk', partOfSpeech: 'verb', difficulty: 'beginner', category: 'social' },
    { english: 'to ask', partOfSpeech: 'verb', difficulty: 'beginner', category: 'social' },
    { english: 'to answer', partOfSpeech: 'verb', difficulty: 'beginner', category: 'social' },
    { english: 'to understand', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'social' },
    { english: 'to agree', partOfSpeech: 'verb', difficulty: 'intermediate', category: 'social' },
    { english: 'to promise', partOfSpeech: 'verb', difficulty: 'advanced', category: 'social' },
  ],
};

/**
 * Get the total number of entries in the corpus
 */
export function getCorpusSize(): number {
  let total = 0;
  for (const cat of Object.keys(VOCABULARY_CORPUS) as VocabularyCategory[]) {
    total += VOCABULARY_CORPUS[cat].length;
  }
  return total;
}

/**
 * Get entries by difficulty tier
 */
export function getCorpusByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): VocabularyCorpusEntry[] {
  const entries: VocabularyCorpusEntry[] = [];
  for (const cat of Object.keys(VOCABULARY_CORPUS) as VocabularyCategory[]) {
    entries.push(...VOCABULARY_CORPUS[cat].filter(e => e.difficulty === difficulty));
  }
  return entries;
}

/**
 * Get all categories with their word counts
 */
export function getCorpusCategorySummary(): { category: string; count: number }[] {
  return (Object.keys(VOCABULARY_CORPUS) as VocabularyCategory[]).map(cat => ({
    category: cat,
    count: VOCABULARY_CORPUS[cat].length,
  }));
}

/**
 * Build an LLM prompt to translate the corpus into a target language.
 * Returns a prompt that asks the LLM to provide translations for a batch of words.
 */
export function buildTranslationPrompt(
  targetLanguage: string,
  entries: VocabularyCorpusEntry[],
  batchSize: number = 50
): string {
  const batch = entries.slice(0, batchSize);
  const wordList = batch.map(e => `${e.english} (${e.partOfSpeech})`).join('\n');

  return `Translate the following English words/phrases into ${targetLanguage}.
For each word, provide: the ${targetLanguage} translation, and a simple pronunciation guide.

Format each line as: english | translation | pronunciation
Do NOT include explanations, just the translations.

Words:
${wordList}`;
}
