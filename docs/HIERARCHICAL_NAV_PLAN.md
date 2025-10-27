# Hierarchical Navigation UI Plan

## Current Status
The LocationsTab currently uses a tab-based UI which doesn't clearly show the hierarchical relationship between:
- World → Countries → States → Settlements → Lots/Businesses/Residences

## Proposed Improvement: Drill-Down Navigation

### Navigation Pattern
Instead of tabs, use a breadcrumb-based drill-down pattern:

```
[Back] World > Kingdom of Valoria
                └─ [States] [Settlements]
                
[Back] World > Kingdom of Valoria > Province of Aldermoor
                                    └─ [Settlements]
                                    
[Back] World > Kingdom of Valoria > Province of Aldermoor > Goldspire
                                                           └─ [Lots] [Businesses] [Residences]
```

### Implementation Steps

1. **Add View State**
   - Track current view level: 'countries' | 'country-detail' | 'state-detail' | 'settlement-detail'
   - Track selected entities at each level

2. **Countries List** (Root Level)
   - Show all countries in the world
   - Click country → navigate to country detail

3. **Country Detail**
   - Show country info card
   - List states (with "Add State" button)
   - List settlements (with "Add Settlement" button)
   - Click state → navigate to state detail
   - Click settlement → navigate to settlement detail

4. **State Detail**
   - Show state info card
   - List settlements in this state (with "Add Settlement" button)
   - Click settlement → navigate to settlement detail

5. **Settlement Detail**
   - Show settlement info card
   - List lots, businesses, and residences
   - These are leaf nodes (no further drill-down needed for now)

### Benefits
- ✅ Clear hierarchical relationship
- ✅ Natural workflow (create country → create states/settlements → view details)
- ✅ Better use of screen space
- ✅ More intuitive than tabs

### Files to Modify
- `/client/src/components/LocationsTab.tsx` - Complete rewrite with new navigation pattern

### API Requirements (Already Implemented)
- ✅ GET /api/worlds/:worldId/countries
- ✅ POST /api/worlds/:worldId/countries
- ✅ GET /api/countries/:countryId/states
- ✅ POST /api/countries/:countryId/states
- ✅ GET /api/worlds/:worldId/settlements
- ✅ POST /api/worlds/:worldId/settlements
- ✅ GET /api/settlements/:settlementId/lots
- ✅ GET /api/settlements/:settlementId/businesses
- ✅ GET /api/settlements/:settlementId/residences

### Implementation Note
Due to file size, a complete rewrite in one tool call exceeds token limits. The implementation should be done iteratively or the component should be split into smaller sub-components (CountryList, CountryDetail, StateDetail, SettlementDetail).
