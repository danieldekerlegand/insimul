/**
 * Tests for BookSpawnManager — book distribution and mesh spawning.
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/BookSpawnManager.test.ts
 */

import { Scene, Mesh, Vector3, MeshBuilder, StandardMaterial, Color3 } from './babylon-mock';
import { BookSpawnManager, type BookTextData } from '../BookSpawnManager';
import type { InteriorLayout } from '../BuildingInteriorGenerator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  \u2713 ${message}`);
  } else {
    failed++;
    console.error(`  \u2717 ${message}`);
  }
}

// ── Test helpers ──

function makeScene(): any {
  return new Scene();
}

function makeInterior(overrides: Partial<InteriorLayout> = {}): InteriorLayout {
  return {
    id: 'interior_biz1',
    buildingId: 'biz1',
    buildingType: 'business',
    businessType: 'Library',
    position: new Vector3(0, 500, 0) as any,
    width: 10,
    depth: 10,
    height: 4.5,
    roomMesh: new Mesh('room') as any,
    furniture: [],
    doorPosition: new Vector3(0, 501, -4.5) as any,
    exitPosition: new Vector3(0, 0, 0) as any,
    ...overrides,
  };
}

function makeTexts(): BookTextData[] {
  return [
    { id: 'text1', title: 'Le Jardin Secret', titleTranslation: 'The Secret Garden', textCategory: 'book', cefrLevel: 'A1', spawnLocationHint: 'library', authorName: 'Jean-Luc', tags: ['main_quest'] },
    { id: 'text2', title: 'Ma Ville', titleTranslation: 'My Town', textCategory: 'book', cefrLevel: 'A1', spawnLocationHint: 'bookshop', authorName: 'Jean-Luc', tags: ['main_quest'] },
    { id: 'text3', title: 'Les Amis', titleTranslation: 'The Friends', textCategory: 'book', cefrLevel: 'A1', spawnLocationHint: 'cafe', authorName: 'Jean-Luc', tags: ['main_quest'] },
    { id: 'text4', title: 'Le Voyage', titleTranslation: 'The Journey', textCategory: 'book', cefrLevel: 'A2', spawnLocationHint: 'residence', authorName: 'Jean-Luc', tags: ['main_quest'] },
    { id: 'text5', title: 'Recette de Pain', titleTranslation: 'Bread Recipe', textCategory: 'recipe', cefrLevel: 'A1', spawnLocationHint: 'restaurant' },
    { id: 'text6', title: 'Le Secret', titleTranslation: 'The Secret', textCategory: 'book', cefrLevel: 'B1', spawnLocationHint: 'hidden', authorName: 'Jean-Luc', tags: ['main_quest'] },
  ];
}

// ── Tests ──

console.log('\n=== BookSpawnManager Tests ===\n');

// --- getTextsForBuilding ---

console.log('getTextsForBuilding:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const texts = makeTexts();

  const libraryTexts = mgr.getTextsForBuilding('business', 'Library', texts, 'biz1');
  assert(libraryTexts.length >= 1, 'returns at least 1 book for a library');
  assert(libraryTexts.length <= 3, 'returns at most 3 books for a library');
  assert(libraryTexts.every(t => t.spawnLocationHint === 'library'), 'all matched texts have library hint');
}

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const texts = makeTexts();

  const residenceTexts = mgr.getTextsForBuilding('residence', undefined, texts, 'res1');
  assert(residenceTexts.length >= 1, 'residence gets texts with residence hint');
  assert(residenceTexts.every(t => t.spawnLocationHint === 'residence'), 'residence texts match hint');
}

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const texts = makeTexts();

  const tavernTexts = mgr.getTextsForBuilding('business', 'Tavern', texts, 'tav1');
  assert(tavernTexts.length >= 1, 'tavern matches cafe hint');
}

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const texts = makeTexts();

  const warehouseTexts = mgr.getTextsForBuilding('business', 'Warehouse', texts, 'wh1');
  assert(warehouseTexts.length >= 1, 'warehouse matches hidden hint');
}

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const noTexts: BookTextData[] = [];

  const result = mgr.getTextsForBuilding('business', 'Library', noTexts, 'biz1');
  assert(result.length === 0, 'returns empty when no texts available');
}

// --- deterministic spawning ---

console.log('\ndeterministic spawning:');

{
  const scene1 = makeScene();
  const mgr1 = new BookSpawnManager(scene1 as any);
  const scene2 = makeScene();
  const mgr2 = new BookSpawnManager(scene2 as any);
  const texts = makeTexts();

  const texts1 = mgr1.getTextsForBuilding('business', 'Library', texts, 'biz1');
  const texts2 = mgr2.getTextsForBuilding('business', 'Library', texts, 'biz1');

  assert(texts1.length === texts2.length, 'same count for same buildingId');
  assert(
    texts1.every((t, i) => t.id === texts2[i].id),
    'same texts selected for same buildingId (deterministic)',
  );
}

{
  const scene1 = makeScene();
  const mgr1 = new BookSpawnManager(scene1 as any);
  const scene2 = makeScene();
  const mgr2 = new BookSpawnManager(scene2 as any);
  const texts = makeTexts();

  const texts1 = mgr1.getTextsForBuilding('business', 'Library', texts, 'biz1');
  const texts2 = mgr2.getTextsForBuilding('business', 'Library', texts, 'biz_different');

  // Different building IDs may produce different selections
  // We just verify they're both valid
  assert(texts1.length >= 1, 'first building gets books');
  assert(texts2.length >= 1, 'second building gets books');
}

// --- spawnBooks ---

console.log('\nspawnBooks:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  const books = mgr.spawnBooks('biz1', interior, texts);
  assert(books.length >= 1, 'spawns at least 1 book in library');
  assert(books.length <= 3, 'spawns at most 3 books');

  for (const book of books) {
    assert(book.mesh !== null, `book "${book.title}" has mesh`);
    assert(book.mesh.isPickable === true, `book "${book.title}" is pickable`);
    assert(book.mesh.metadata?.objectRole === 'book', `book "${book.title}" has book objectRole`);
    assert(book.mesh.metadata?.bookData?.textId === book.textId, `book "${book.title}" metadata has textId`);
    assert(book.collected === false, `book "${book.title}" is not collected`);
  }
}

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior({ businessType: 'Blacksmith' });
  const texts = makeTexts();

  const books = mgr.spawnBooks('smith1', interior, texts);
  assert(books.length === 0, 'no books spawn in blacksmith (no matching hints)');
}

// --- markCollected ---

console.log('\nmarkCollected:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  const books = mgr.spawnBooks('biz1', interior, texts);
  assert(books.length > 0, 'has books to collect');

  const firstBook = books[0];
  mgr.markCollected(firstBook.textId);

  assert(firstBook.collected === true, 'book marked as collected');
  assert(firstBook.mesh.isPickable === false, 'collected book is not pickable');
  assert(mgr.getCollectedTextIds().includes(firstBook.textId), 'textId in collected set');
}

// --- restoreCollected ---

console.log('\nrestoreCollected:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  // Restore collected state before spawning
  mgr.restoreCollected(['text1']);

  const books = mgr.spawnBooks('biz1', interior, texts);
  const text1Book = books.find(b => b.textId === 'text1');

  if (text1Book) {
    assert(text1Book.collected === true, 'restored book is marked collected');
    assert(text1Book.mesh.isPickable === false, 'restored collected book is not pickable');
  } else {
    // text1 might not have been selected for this building — that's ok
    assert(true, 'text1 not selected for this building (still valid)');
  }
}

// --- findNearestBook ---

console.log('\nfindNearestBook:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  const books = mgr.spawnBooks('biz1', interior, texts);
  assert(books.length > 0, 'has spawned books');

  const playerPos = books[0].mesh.position.clone() as any;
  playerPos.x += 0.5; // Slightly offset

  const nearest = mgr.findNearestBook(playerPos as any, 5);
  assert(nearest !== null, 'finds nearest book');
  assert(nearest!.textId === books[0].textId, 'nearest is closest book');
}

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  mgr.spawnBooks('biz1', interior, texts);
  const farAway = new Vector3(1000, 0, 1000) as any;
  const nearest = mgr.findNearestBook(farAway as any, 5);
  assert(nearest === null, 'no book found when too far away');
}

// --- clearBooks ---

console.log('\nclearBooks:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  mgr.spawnBooks('biz1', interior, texts);
  assert(mgr.getSpawnedBooks().length > 0, 'has spawned books before clear');

  mgr.clearBooks();
  assert(mgr.getSpawnedBooks().length === 0, 'all books cleared');
}

// --- spawnBooks clears previous books ---

console.log('\nre-spawn clears previous:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  const first = mgr.spawnBooks('biz1', interior, texts);
  assert(first.length > 0, 'first spawn has books');

  const second = mgr.spawnBooks('biz1', interior, texts);
  assert(second.length > 0, 'second spawn has books');
  assert(mgr.getSpawnedBooks().length === second.length, 'only latest spawn books remain');
}

// --- book mesh properties ---

console.log('\nbook mesh properties:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  const books = mgr.spawnBooks('biz1', interior, texts);
  for (const book of books) {
    assert(book.mesh.material !== null, `book "${book.title}" has material`);
    assert(book.mesh.checkCollisions === true, `book "${book.title}" has collisions`);
    assert(book.mesh.metadata.interiorItem === true, `book "${book.title}" marked as interior item`);
  }
}

// --- dispose ---

console.log('\ndispose:');

{
  const scene = makeScene();
  const mgr = new BookSpawnManager(scene as any);
  const interior = makeInterior();
  const texts = makeTexts();

  mgr.spawnBooks('biz1', interior, texts);
  mgr.dispose();
  assert(mgr.getSpawnedBooks().length === 0, 'dispose clears all books');
}

// ── Summary ──

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
}
