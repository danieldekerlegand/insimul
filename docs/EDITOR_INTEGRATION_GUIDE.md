# Editor.tsx Integration Guide

## Current Structure (Lines to Modify)

### Lines 154-157: Imports
**ADD these imports:**
```typescript
import { HierarchicalLocationsTab } from "@/components/HierarchicalLocationsTab";
import { HierarchicalRulesTab } from "@/components/HierarchicalRulesTab";
import { WorldSelectionScreen } from "@/components/WorldSelectionScreen";
import { ModernNavbar } from "@/components/ModernNavbar";
```

### Line 166: Initial Tab State
**CHANGE:**
```typescript
const [activeTab, setActiveTab] = useState('editor');
```
**TO:**
```typescript
const [activeTab, setActiveTab] = useState('rules');
```

### Line 843: Before Main Return
**ADD this block BEFORE the return statement:**
```typescript
// Show world selection screen if no world is selected
if (!selectedWorld) {
  return <WorldSelectionScreen onWorldSelected={setSelectedWorld} />;
}

const currentWorld = worlds.find(w => w.id === selectedWorld);
```

### Lines 844-853: Replace Main Container Opening
**REPLACE:**
```typescript
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Insimul - Narrative Simulation Platform
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Combining Ensemble, Kismet, and Talk of the Town into an insimul development environment
        </p>
      </div>
```
**WITH:**
```typescript
return (
  <div className="min-h-screen bg-background">
    <ModernNavbar
      currentWorld={currentWorld}
      activeTab={activeTab}
      onTabChange={(tab) => {
        if (tab === 'import') setImportDialogOpen(true);
        else if (tab === 'export') setExportDialogOpen(true);
        else setActiveTab(tab);
      }}
      onChangeWorld={() => setSelectedWorld('')}
    />

    <div className="container mx-auto p-6">
```

### Lines 855-1048: DELETE Entire Sidebar
**DELETE the entire sidebar section (col-span-3) including:**
- World selection dropdown
- File tree / Rules list
- Quick stats cards

### Lines 1049-1061: DELETE Old Tab Navigation
**DELETE:**
```typescript
<div className="col-span-9">
  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
    <TabsList className="grid w-full grid-cols-8">
      <TabsTrigger value="editor">Rules</TabsTrigger>
      ...
    </TabsList>
```

### Lines 1063-1565: Replace Tab Content Structure
**REPLACE all TabsContent blocks WITH conditional rendering:**

```typescript
{/* Rules Tab */}
{activeTab === 'rules' && selectedWorld && (
  <HierarchicalRulesTab worldId={selectedWorld} />
)}

{/* Characters Tab */}
{activeTab === 'characters' && selectedWorld && (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Characters ({characters.length})</CardTitle>
        <Button onClick={() => { setSelectedCharacter(null); setCharacterEditDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {/* Keep existing characters content */}
    </CardContent>
  </Card>
)}

{/* Generate Tab */}
{activeTab === 'generate' && selectedWorld && (
  <GenerateTab worldId={selectedWorld} />
)}

{/* Locations Tab */}
{activeTab === 'locations' && selectedWorld && (
  <HierarchicalLocationsTab worldId={selectedWorld} />
)}

{/* Actions Tab */}
{activeTab === 'actions' && selectedWorld && (
  {/* Keep existing actions content */}
)}

{/* Truth Tab */}
{activeTab === 'truth' && selectedWorld && (
  <TruthTab worldId={selectedWorld} characters={characters} />
)}

{/* Quests Tab */}
{activeTab === 'quests' && selectedWorld && (
  <QuestsTab worldId={selectedWorld} />
)}

{/* Simulations Tab */}
{activeTab === 'simulations' && selectedWorld && (
  {/* Keep existing simulations content */}
)}
```

### Lines 1565-1567: Update Closing Divs
**CHANGE:**
```typescript
            </Tabs>
          </div>
        </div>
      </div>
```
**TO:**
```typescript
        </div>
      </div>
```
(Remove one level since we removed the sidebar grid structure)

### Lines 1569+: Keep All Dialogs
**NO CHANGES to any of the dialog components** - keep them all as-is

## Summary of Changes

1. ✅ Add 4 new component imports
2. ✅ Change initial tab from 'editor' to 'rules'
3. ✅ Add world selection check before main return
4. ✅ Replace page header with ModernNavbar
5. ✅ Remove entire sidebar (lines 855-1048)
6. ✅ Remove TabsList navigation (lines 1049-1061)
7. ✅ Replace TabsContent with conditional rendering
8. ✅ Update closing tags
9. ✅ Keep all existing dialogs unchanged

## Key Mapping Changes

| Old Tab Value | New Tab Value | Component |
|--------------|---------------|-----------|
| `editor` | `rules` | HierarchicalRulesTab |
| `characters` | `characters` | (keep existing) |
| `generate` | `generate` | GenerateTab |
| `locations` | `locations` | HierarchicalLocationsTab |
| `actions` | `actions` | (keep existing) |
| `truth` | `truth` | TruthTab |
| `quests` | `quests` | QuestsTab |
| `simulations` | `simulations` | (keep existing) |

## Test Points After Integration

- [ ] App starts with WorldSelectionScreen
- [ ] Clicking world enters editor
- [ ] ModernNavbar appears with dropdowns
- [ ] All tabs accessible from dropdowns
- [ ] Rules tab shows HierarchicalRulesTab
- [ ] Locations tab shows HierarchicalLocationsTab
- [ ] Import/Export open dialogs
- [ ] Home button returns to world selection
- [ ] Mobile drawer works
- [ ] All existing functionality preserved
