%% Insimul Items: Realm of Aethermoor
%% Source: data/worlds/realm_of_aethermoor/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Aether Crystal
item(aether_crystal, 'Aether Crystal', material).
item_description(aether_crystal, 'A luminous crystal pulsing with raw aether energy. Used as fuel for enchantments and powering magical constructs.').
item_value(aether_crystal, 50).
item_sell_value(aether_crystal, 25).
item_weight(aether_crystal, 0.5).
item_rarity(aether_crystal, uncommon).
item_category(aether_crystal, magical_material).
item_stackable(aether_crystal).
item_tradeable(aether_crystal).
item_possessable(aether_crystal).
item_tag(aether_crystal, magical).
item_tag(aether_crystal, material).

%% Grimoire of Elemental Binding
item(grimoire_elemental, 'Grimoire of Elemental Binding', equipment).
item_description(grimoire_elemental, 'An ancient spellbook bound in dragonhide, containing rituals for summoning and commanding elemental forces.').
item_value(grimoire_elemental, 500).
item_sell_value(grimoire_elemental, 250).
item_weight(grimoire_elemental, 3).
item_rarity(grimoire_elemental, rare).
item_category(grimoire_elemental, spellbook).
item_tradeable(grimoire_elemental).
item_possessable(grimoire_elemental).
item_tag(grimoire_elemental, magical).
item_tag(grimoire_elemental, knowledge).

%% Runic Longsword
item(runic_longsword, 'Runic Longsword', weapon).
item_description(runic_longsword, 'A steel blade inscribed with glowing runes that channel aether energy. Forged at Stormforge Arms in Aethoria City.').
item_value(runic_longsword, 300).
item_sell_value(runic_longsword, 150).
item_weight(runic_longsword, 4).
item_rarity(runic_longsword, uncommon).
item_category(runic_longsword, weapon).
item_tradeable(runic_longsword).
item_possessable(runic_longsword).
item_tag(runic_longsword, weapon).
item_tag(runic_longsword, magical).

%% Healing Potion
item(healing_potion, 'Healing Potion', consumable).
item_description(healing_potion, 'A vial of shimmering liquid brewed at The Shimmering Vial apothecary. Restores vitality and mends minor wounds.').
item_value(healing_potion, 25).
item_sell_value(healing_potion, 12).
item_weight(healing_potion, 0.3).
item_rarity(healing_potion, common).
item_category(healing_potion, potion).
item_stackable(healing_potion).
item_tradeable(healing_potion).
item_possessable(healing_potion).
item_tag(healing_potion, consumable).
item_tag(healing_potion, healing).

%% Elven Longbow
item(elven_longbow, 'Elven Longbow', weapon).
item_description(elven_longbow, 'A graceful bow carved from Silverwood heartwood by the elven artisans of Greenleaf Archery Range. Nearly silent when fired.').
item_value(elven_longbow, 350).
item_sell_value(elven_longbow, 175).
item_weight(elven_longbow, 2).
item_rarity(elven_longbow, uncommon).
item_category(elven_longbow, weapon).
item_tradeable(elven_longbow).
item_possessable(elven_longbow).
item_tag(elven_longbow, weapon).
item_tag(elven_longbow, elven).

%% Dwarven War Hammer
item(dwarven_war_hammer, 'Dwarven War Hammer', weapon).
item_description(dwarven_war_hammer, 'A massive hammer forged from Ironpeak star-metal. Its head bears the Ironbeard clan sigil and can shatter enchanted stone.').
item_value(dwarven_war_hammer, 400).
item_sell_value(dwarven_war_hammer, 200).
item_weight(dwarven_war_hammer, 8).
item_rarity(dwarven_war_hammer, rare).
item_category(dwarven_war_hammer, weapon).
item_tradeable(dwarven_war_hammer).
item_possessable(dwarven_war_hammer).
item_tag(dwarven_war_hammer, weapon).
item_tag(dwarven_war_hammer, dwarven).

%% Focus Crystal
item(focus_crystal, 'Focus Crystal', tool).
item_description(focus_crystal, 'A polished gem that channels and concentrates aether energy. Required for spellcasting and enchantment work.').
item_value(focus_crystal, 75).
item_sell_value(focus_crystal, 35).
item_weight(focus_crystal, 0.2).
item_rarity(focus_crystal, common).
item_category(focus_crystal, magical_tool).
item_tradeable(focus_crystal).
item_possessable(focus_crystal).
item_tag(focus_crystal, magical).
item_tag(focus_crystal, tool).

%% Rune Scroll (Minor)
item(rune_scroll_minor, 'Rune Scroll (Minor)', consumable).
item_description(rune_scroll_minor, 'A parchment inscribed with a single-use defensive rune. Burns away upon activation, creating a temporary magical shield.').
item_value(rune_scroll_minor, 15).
item_sell_value(rune_scroll_minor, 7).
item_weight(rune_scroll_minor, 0.1).
item_rarity(rune_scroll_minor, common).
item_category(rune_scroll_minor, scroll).
item_stackable(rune_scroll_minor).
item_tradeable(rune_scroll_minor).
item_possessable(rune_scroll_minor).
item_tag(rune_scroll_minor, magical).
item_tag(rune_scroll_minor, consumable).

%% Starbloom Herb
item(starbloom_herb, 'Starbloom Herb', material).
item_description(starbloom_herb, 'A rare bioluminescent herb that grows only in the Silverwood canopy. Used in potent healing remedies and vision potions.').
item_value(starbloom_herb, 30).
item_sell_value(starbloom_herb, 15).
item_weight(starbloom_herb, 0.1).
item_rarity(starbloom_herb, uncommon).
item_category(starbloom_herb, herb).
item_stackable(starbloom_herb).
item_tradeable(starbloom_herb).
item_possessable(starbloom_herb).
item_tag(starbloom_herb, ingredient).
item_tag(starbloom_herb, elven).

%% Ironpeak Gemstone
item(ironpeak_gemstone, 'Ironpeak Gemstone', material).
item_description(ironpeak_gemstone, 'A faceted gem cut by master dwarf craftsmen at Ironbeard Gem Works. Holds aether charge and is prized by enchanters.').
item_value(ironpeak_gemstone, 100).
item_sell_value(ironpeak_gemstone, 50).
item_weight(ironpeak_gemstone, 0.3).
item_rarity(ironpeak_gemstone, uncommon).
item_category(ironpeak_gemstone, gemstone).
item_stackable(ironpeak_gemstone).
item_tradeable(ironpeak_gemstone).
item_possessable(ironpeak_gemstone).
item_tag(ironpeak_gemstone, material).
item_tag(ironpeak_gemstone, dwarven).

%% Mead of Ironpeak
item(mead_of_ironpeak, 'Mead of Ironpeak', consumable).
item_description(mead_of_ironpeak, 'A strong honey mead brewed in dwarven vats at The Stone Tankard. Temporarily boosts courage and constitution.').
item_value(mead_of_ironpeak, 8).
item_sell_value(mead_of_ironpeak, 4).
item_weight(mead_of_ironpeak, 1).
item_rarity(mead_of_ironpeak, common).
item_category(mead_of_ironpeak, food_drink).
item_stackable(mead_of_ironpeak).
item_tradeable(mead_of_ironpeak).
item_possessable(mead_of_ironpeak).
item_tag(mead_of_ironpeak, food).
item_tag(mead_of_ironpeak, dwarven).

%% Warding Amulet
item(warding_amulet, 'Warding Amulet', equipment).
item_description(warding_amulet, 'A silver amulet enchanted at The Warding Circle. Protects the wearer from minor curses and dark magic.').
item_value(warding_amulet, 150).
item_sell_value(warding_amulet, 75).
item_weight(warding_amulet, 0.3).
item_rarity(warding_amulet, uncommon).
item_category(warding_amulet, jewelry).
item_tradeable(warding_amulet).
item_possessable(warding_amulet).
item_tag(warding_amulet, magical).
item_tag(warding_amulet, protective).

%% Enchanted Quill
item(enchanted_quill, 'Enchanted Quill', tool).
item_description(enchanted_quill, 'A feather quill imbued with minor magic. Transcribes spoken words automatically and never runs out of ink.').
item_value(enchanted_quill, 40).
item_sell_value(enchanted_quill, 20).
item_weight(enchanted_quill, 0.1).
item_rarity(enchanted_quill, common).
item_category(enchanted_quill, tool).
item_tradeable(enchanted_quill).
item_possessable(enchanted_quill).
item_tag(enchanted_quill, magical).
item_tag(enchanted_quill, tool).

%% Moonsilver Chain Armor
item(moonsilver_chain, 'Moonsilver Chain Armor', equipment).
item_description(moonsilver_chain, 'Lightweight elven chainmail woven from moonsilver threads. Nearly as strong as steel but weighs half as much.').
item_value(moonsilver_chain, 600).
item_sell_value(moonsilver_chain, 300).
item_weight(moonsilver_chain, 5).
item_rarity(moonsilver_chain, rare).
item_category(moonsilver_chain, armor).
item_tradeable(moonsilver_chain).
item_possessable(moonsilver_chain).
item_tag(moonsilver_chain, armor).
item_tag(moonsilver_chain, elven).

%% Aetherblade (Legendary)
item(aetherblade, 'Aetherblade', weapon).
item_description(aetherblade, 'A legendary weapon forged from crystals of all four Aether Wells combined with dwarven star-metal. It hums with concentrated magical energy.').
item_value(aetherblade, 5000).
item_sell_value(aetherblade, 0).
item_weight(aetherblade, 3).
item_rarity(aetherblade, legendary).
item_category(aetherblade, weapon).
item_possessable(aetherblade).
item_tag(aetherblade, weapon).
item_tag(aetherblade, legendary).
item_tag(aetherblade, quest).

%% Dark Grimoire (Forbidden)
item(dark_grimoire, 'Dark Grimoire', quest_item).
item_description(dark_grimoire, 'A forbidden spellbook written in a dead language. Stolen from the Arcane Library, it contains rituals that corrupt Aether Wells.').
item_value(dark_grimoire, 0).
item_sell_value(dark_grimoire, 0).
item_weight(dark_grimoire, 4).
item_rarity(dark_grimoire, legendary).
item_category(dark_grimoire, spellbook).
item_possessable(dark_grimoire).
item_tag(dark_grimoire, quest).
item_tag(dark_grimoire, forbidden).

%% Dwarven Ale Keg
item(dwarven_ale_keg, 'Dwarven Ale Keg', consumable).
item_description(dwarven_ale_keg, 'A small keg of potent dwarven ale from The Stone Tankard. A prized trade good across all settlements.').
item_value(dwarven_ale_keg, 20).
item_sell_value(dwarven_ale_keg, 10).
item_weight(dwarven_ale_keg, 5).
item_rarity(dwarven_ale_keg, common).
item_category(dwarven_ale_keg, food_drink).
item_stackable(dwarven_ale_keg).
item_tradeable(dwarven_ale_keg).
item_possessable(dwarven_ale_keg).
item_tag(dwarven_ale_keg, food).
item_tag(dwarven_ale_keg, trade_good).

%% Adventurer Guild Token
item(guild_token, 'Adventurer Guild Token', quest_item).
item_description(guild_token, 'A bronze token bearing the crest of the Adventurer Guild at Crossroads Haven. Marks the bearer as a recognized guild member.').
item_value(guild_token, 0).
item_sell_value(guild_token, 0).
item_weight(guild_token, 0.1).
item_rarity(guild_token, common).
item_category(guild_token, membership).
item_possessable(guild_token).
item_tag(guild_token, guild).
item_tag(guild_token, identity).
