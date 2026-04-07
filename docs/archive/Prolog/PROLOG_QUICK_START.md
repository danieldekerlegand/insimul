# Prolog Integration - Quick Start Guide

## 🎯 What's New

Insimul now uses **Prolog** as its underlying logic engine for social simulations!

## 🚀 Getting Started (30 seconds)

### 1. View Prolog Facts

**Navigation**: Truth → Prolog Knowledge Base

**Action**: Click **"Sync from DB"** button

**Result**: See all your world data as Prolog facts!

### 2. Query Your World

Try these queries in the Prolog tab:

```prolog
% Find all people
?- person(X).

% Find married couples
?- married_to(X, Y).

% Find noble families
?- person(X), occupation(X, noble), parent_of(X, Child).

% Find potential heirs
?- eldest_child(X), parent_of(P, X), occupation(P, noble), alive(X).
```

### 3. Run Simulation with Prolog

**Navigation**: Simulations tab

**Action**: 
1. Create/select simulation
2. Engine: Choose **"Prolog"**
3. Click "Run"

**What Happens**:
- World auto-syncs to Prolog ✨
- Rules execute with logic programming
- Results show Prolog reasoning
- Fallback to JavaScript if Prolog unavailable

## 📊 What Gets Synced

### Every Character Becomes:

```prolog
person(john_smith_abc123).
first_name(john_smith_abc123, 'John').
age(john_smith_abc123, 35).
occupation(john_smith_abc123, blacksmith).
married_to(john_smith_abc123, jane_doe_xyz).
parent_of(john_smith_abc123, child_id).
at_location(john_smith_abc123, castle).
```

### Plus Helper Rules:

```prolog
sibling_of(X, Y)      % Auto-detected siblings
ancestor_of(X, Y)     % Transitive ancestry
eldest_child(X)       % First-born detection
unmarried(X)          % Marriage status
same_location(X, Y)   % Co-location
```

## 💡 Common Queries

### Find Marriage Candidates

```prolog
?- person(X), person(Y), X \= Y,
   unmarried(X), unmarried(Y),
   adult(X), adult(Y),
   same_location(X, Y).
```

### Find Family Trees

```prolog
?- parent_of(Grandparent, Parent),
   parent_of(Parent, Child).
```

### Find Business Owners

```prolog
?- owns(Owner, Business),
   business_type(Business, Type).
```

## 🔧 Troubleshooting

### "Prolog not available"
**Solution**: Install SWI-Prolog
- macOS: `brew install swi-prolog`
- Ubuntu: `apt-get install swi-prolog`

### "No facts synced"
**Solution**: Click "Sync from DB" button in Prolog tab

### "Query returns nothing"
**Solution**: Check syntax - variables must be uppercase (X, Y, not x, y)

## 📚 Learn More

- `PROLOG_PHASES_2_3_COMPLETE.md` - Full technical details
- `PROLOG_SYNC_USAGE.md` - Complete usage guide
- `PROLOG_INTEGRATION_ANALYSIS.md` - Architecture analysis

## ⚡ Key Benefits

✅ **Automatic** - World syncs before simulations  
✅ **Transparent** - Works seamlessly with existing features  
✅ **Powerful** - Complex queries become trivial  
✅ **Explainable** - See exactly why rules fired  
✅ **Extensible** - Add custom Prolog rules  
✅ **Reliable** - Falls back to JavaScript if needed

## 🎓 Next Steps

1. **Explore** - Try queries in Prolog tab
2. **Simulate** - Run simulation with Prolog engine
3. **Extend** - Add custom Prolog rules
4. **Learn** - Read full documentation

Welcome to logic programming for social simulation! 🎉
