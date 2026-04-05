%% Insimul Items: High Fantasy
%% Source: data/worlds/high_fantasy/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Iron Shortsword
item(iron_shortsword, 'Iron Shortsword', equipment).
item_description(iron_shortsword, 'A sturdy iron shortsword forged by Gareth Steelheart. Reliable for a beginning adventurer.').
item_value(iron_shortsword, 25).
item_sell_value(iron_shortsword, 12).
item_weight(iron_shortsword, 3).
item_rarity(iron_shortsword, common).
item_category(iron_shortsword, weapon).
item_tradeable(iron_shortsword).
item_possessable(iron_shortsword).
item_tag(iron_shortsword, melee).
item_tag(iron_shortsword, blade).

%% Healing Potion
item(healing_potion, 'Healing Potion', consumable).
item_description(healing_potion, 'A crimson potion brewed from moonpetal flowers and silvervine roots. Restores vitality.').
item_value(healing_potion, 15).
item_sell_value(healing_potion, 8).
item_weight(healing_potion, 0.5).
item_rarity(healing_potion, common).
item_category(healing_potion, potion).
item_stackable(healing_potion).
item_tradeable(healing_potion).
item_possessable(healing_potion).
item_tag(healing_potion, restorative).
item_tag(healing_potion, alchemy).

%% Mana Potion
item(mana_potion, 'Mana Potion', consumable).
item_description(mana_potion, 'A shimmering blue elixir that restores magical energy. Brewed with starlight moss.').
item_value(mana_potion, 20).
item_sell_value(mana_potion, 10).
item_weight(mana_potion, 0.5).
item_rarity(mana_potion, uncommon).
item_category(mana_potion, potion).
item_stackable(mana_potion).
item_tradeable(mana_potion).
item_possessable(mana_potion).
item_tag(mana_potion, arcane).
item_tag(mana_potion, alchemy).

%% Scroll of Fireball
item(scroll_of_fireball, 'Scroll of Fireball', consumable).
item_description(scroll_of_fireball, 'A spell scroll inscribed with the incantation for conjuring a ball of flame. Single use.').
item_value(scroll_of_fireball, 50).
item_sell_value(scroll_of_fireball, 25).
item_weight(scroll_of_fireball, 0.1).
item_rarity(scroll_of_fireball, uncommon).
item_category(scroll_of_fireball, spell_scroll).
item_tradeable(scroll_of_fireball).
item_possessable(scroll_of_fireball).
item_tag(scroll_of_fireball, arcane).
item_tag(scroll_of_fireball, fire).

%% Scroll of Shield
item(scroll_of_shield, 'Scroll of Shield', consumable).
item_description(scroll_of_shield, 'A protective spell scroll that conjures a barrier of force around the caster.').
item_value(scroll_of_shield, 40).
item_sell_value(scroll_of_shield, 20).
item_weight(scroll_of_shield, 0.1).
item_rarity(scroll_of_shield, uncommon).
item_category(scroll_of_shield, spell_scroll).
item_tradeable(scroll_of_shield).
item_possessable(scroll_of_shield).
item_tag(scroll_of_shield, arcane).
item_tag(scroll_of_shield, protection).

%% Scroll of Teleport
item(scroll_of_teleport, 'Scroll of Teleport', consumable).
item_description(scroll_of_teleport, 'A rare scroll that allows instantaneous travel to a previously visited location.').
item_value(scroll_of_teleport, 200).
item_sell_value(scroll_of_teleport, 100).
item_weight(scroll_of_teleport, 0.1).
item_rarity(scroll_of_teleport, rare).
item_category(scroll_of_teleport, spell_scroll).
item_tradeable(scroll_of_teleport).
item_possessable(scroll_of_teleport).
item_tag(scroll_of_teleport, arcane).
item_tag(scroll_of_teleport, travel).

%% Mithril Ore
item(mithril_ore, 'Mithril Ore', material).
item_description(mithril_ore, 'A chunk of raw mithril from the deep mines. Lighter than steel yet far stronger.').
item_value(mithril_ore, 100).
item_sell_value(mithril_ore, 60).
item_weight(mithril_ore, 1).
item_rarity(mithril_ore, rare).
item_category(mithril_ore, crafting).
item_stackable(mithril_ore).
item_tradeable(mithril_ore).
item_possessable(mithril_ore).
item_tag(mithril_ore, metal).
item_tag(mithril_ore, dwarven).

%% Mithril Chainmail
item(mithril_chainmail, 'Mithril Chainmail', equipment).
item_description(mithril_chainmail, 'Exquisitely crafted dwarven chainmail of pure mithril. Light as silk, hard as dragon scale.').
item_value(mithril_chainmail, 500).
item_sell_value(mithril_chainmail, 300).
item_weight(mithril_chainmail, 4).
item_rarity(mithril_chainmail, legendary).
item_category(mithril_chainmail, armor).
item_tradeable(mithril_chainmail).
item_possessable(mithril_chainmail).
item_tag(mithril_chainmail, dwarven).
item_tag(mithril_chainmail, protection).

%% Elven Longbow
item(elven_longbow, 'Elven Longbow', equipment).
item_description(elven_longbow, 'A graceful bow carved from a single branch of silverwood, enchanted for true aim.').
item_value(elven_longbow, 150).
item_sell_value(elven_longbow, 80).
item_weight(elven_longbow, 2).
item_rarity(elven_longbow, rare).
item_category(elven_longbow, weapon).
item_tradeable(elven_longbow).
item_possessable(elven_longbow).
item_tag(elven_longbow, ranged).
item_tag(elven_longbow, elven).

%% Dwarven War Hammer
item(dwarven_war_hammer, 'Dwarven War Hammer', equipment).
item_description(dwarven_war_hammer, 'A massive hammer inscribed with dwarven runes of smiting. The favored weapon of Khazad Dumrak.').
item_value(dwarven_war_hammer, 120).
item_sell_value(dwarven_war_hammer, 65).
item_weight(dwarven_war_hammer, 6).
item_rarity(dwarven_war_hammer, uncommon).
item_category(dwarven_war_hammer, weapon).
item_tradeable(dwarven_war_hammer).
item_possessable(dwarven_war_hammer).
item_tag(dwarven_war_hammer, melee).
item_tag(dwarven_war_hammer, dwarven).

%% Dragonbane Sword
item(dragonbane_sword, 'Dragonbane Sword', equipment).
item_description(dragonbane_sword, 'A legendary blade forged in dragonfire and quenched in starlight. Lethal to dragonkind.').
item_value(dragonbane_sword, 1000).
item_sell_value(dragonbane_sword, 500).
item_weight(dragonbane_sword, 4).
item_rarity(dragonbane_sword, legendary).
item_category(dragonbane_sword, weapon).
item_possessable(dragonbane_sword).
item_tag(dragonbane_sword, melee).
item_tag(dragonbane_sword, legendary_weapon).
item_tag(dragonbane_sword, dragon_slaying).

%% Amulet of Prophecy
item(amulet_of_prophecy, 'Amulet of Prophecy', accessory).
item_description(amulet_of_prophecy, 'An ancient amulet that glows when prophecy stirs. Grants visions of possible futures.').
item_value(amulet_of_prophecy, 400).
item_sell_value(amulet_of_prophecy, 200).
item_weight(amulet_of_prophecy, 0.2).
item_rarity(amulet_of_prophecy, legendary).
item_category(amulet_of_prophecy, accessory).
item_possessable(amulet_of_prophecy).
item_tag(amulet_of_prophecy, arcane).
item_tag(amulet_of_prophecy, divination).

%% Sigil of Unity
item(sigil_of_unity, 'Sigil of Unity', accessory).
item_description(sigil_of_unity, 'A tri-pointed sigil bearing the marks of elf, dwarf, and human. Symbol of the ancient alliance.').
item_value(sigil_of_unity, 300).
item_sell_value(sigil_of_unity, 150).
item_weight(sigil_of_unity, 0.1).
item_rarity(sigil_of_unity, legendary).
item_category(sigil_of_unity, accessory).
item_possessable(sigil_of_unity).
item_tag(sigil_of_unity, diplomatic).
item_tag(sigil_of_unity, quest_item).

%% Runebound Blade
item(runebound_blade_item, 'Runebound Blade', equipment).
item_description(runebound_blade_item, 'A mithril sword inscribed with dwarven power runes and quenched in elven moonwell water.').
item_value(runebound_blade_item, 800).
item_sell_value(runebound_blade_item, 400).
item_weight(runebound_blade_item, 3).
item_rarity(runebound_blade_item, legendary).
item_category(runebound_blade_item, weapon).
item_possessable(runebound_blade_item).
item_tag(runebound_blade_item, melee).
item_tag(runebound_blade_item, enchanted).
item_tag(runebound_blade_item, dwarven).

%% Crystal Focus
item(crystal_focus, 'Crystal Focus', equipment).
item_description(crystal_focus, 'A perfectly cut crystal from the Arcane Precinct. Amplifies the power of spells channeled through it.').
item_value(crystal_focus, 75).
item_sell_value(crystal_focus, 40).
item_weight(crystal_focus, 0.3).
item_rarity(crystal_focus, uncommon).
item_category(crystal_focus, arcane_implement).
item_tradeable(crystal_focus).
item_possessable(crystal_focus).
item_tag(crystal_focus, arcane).
item_tag(crystal_focus, elven).

%% Rune of Binding
item(rune_of_binding, 'Rune of Binding', consumable).
item_description(rune_of_binding, 'A powerful dwarven rune stone that seals dimensional rifts and binds dark entities.').
item_value(rune_of_binding, 250).
item_sell_value(rune_of_binding, 120).
item_weight(rune_of_binding, 0.5).
item_rarity(rune_of_binding, rare).
item_category(rune_of_binding, rune).
item_possessable(rune_of_binding).
item_tag(rune_of_binding, dwarven).
item_tag(rune_of_binding, protection).

%% Enchanted Gemstone
item(enchanted_gemstone, 'Enchanted Gemstone', material).
item_description(enchanted_gemstone, 'A gemstone imbued with residual magical energy. Used in enchanting and alchemy.').
item_value(enchanted_gemstone, 60).
item_sell_value(enchanted_gemstone, 35).
item_weight(enchanted_gemstone, 0.2).
item_rarity(enchanted_gemstone, uncommon).
item_category(enchanted_gemstone, crafting).
item_stackable(enchanted_gemstone).
item_tradeable(enchanted_gemstone).
item_possessable(enchanted_gemstone).
item_tag(enchanted_gemstone, arcane).
item_tag(enchanted_gemstone, crafting).

%% Dragon Scale
item(dragon_scale, 'Dragon Scale', material).
item_description(dragon_scale, 'A single scale shed by a great dragon. Nearly indestructible and radiates residual heat.').
item_value(dragon_scale, 200).
item_sell_value(dragon_scale, 120).
item_weight(dragon_scale, 1).
item_rarity(dragon_scale, rare).
item_category(dragon_scale, crafting).
item_stackable(dragon_scale).
item_tradeable(dragon_scale).
item_possessable(dragon_scale).
item_tag(dragon_scale, dragon).
item_tag(dragon_scale, crafting).

%% Elven Waybread
item(elven_waybread, 'Elven Waybread', consumable).
item_description(elven_waybread, 'Light, nourishing bread baked by elven hands. A single bite sustains a traveler for a full day.').
item_value(elven_waybread, 10).
item_sell_value(elven_waybread, 5).
item_weight(elven_waybread, 0.2).
item_rarity(elven_waybread, uncommon).
item_category(elven_waybread, food_drink).
item_stackable(elven_waybread).
item_tradeable(elven_waybread).
item_possessable(elven_waybread).
item_tag(elven_waybread, food).
item_tag(elven_waybread, elven).

%% Dwarven Ale
item(dwarven_ale, 'Dwarven Ale', consumable).
item_description(dwarven_ale, 'A potent amber ale brewed in the depths of Khazad Dumrak. Dwarven hospitality in a mug.').
item_value(dwarven_ale, 5).
item_sell_value(dwarven_ale, 2).
item_weight(dwarven_ale, 1).
item_rarity(dwarven_ale, common).
item_category(dwarven_ale, food_drink).
item_stackable(dwarven_ale).
item_tradeable(dwarven_ale).
item_possessable(dwarven_ale).
item_tag(dwarven_ale, beverage).
item_tag(dwarven_ale, dwarven).
