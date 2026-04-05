%% Insimul Items: Low Fantasy
%% Source: data/worlds/low_fantasy/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Rusty Short Sword
item(rusty_short_sword, 'Rusty Short Sword', weapon).
item_description(rusty_short_sword, 'A pitted blade with a leather-wrapped grip. It will cut, but not well. Better than bare hands.').
item_value(rusty_short_sword, 8).
item_sell_value(rusty_short_sword, 3).
item_weight(rusty_short_sword, 3).
item_rarity(rusty_short_sword, common).
item_category(rusty_short_sword, melee_weapon).
item_tradeable(rusty_short_sword).
item_possessable(rusty_short_sword).
item_tag(rusty_short_sword, weapon).
item_tag(rusty_short_sword, poor_quality).

%% Notched Handaxe
item(notched_handaxe, 'Notched Handaxe', weapon).
item_description(notched_handaxe, 'A woodcutting axe repurposed for violence. The edge is chipped but heavy enough to do damage.').
item_value(notched_handaxe, 6).
item_sell_value(notched_handaxe, 2).
item_weight(notched_handaxe, 4).
item_rarity(notched_handaxe, common).
item_category(notched_handaxe, melee_weapon).
item_tradeable(notched_handaxe).
item_possessable(notched_handaxe).
item_tag(notched_handaxe, weapon).
item_tag(notched_handaxe, improvised).

%% Dubious Healing Potion
item(dubious_healing_potion, 'Dubious Healing Potion', consumable).
item_description(dubious_healing_potion, 'A murky green liquid in a cracked vial. Old Mag swears it heals. Others have their doubts.').
item_value(dubious_healing_potion, 12).
item_sell_value(dubious_healing_potion, 5).
item_weight(dubious_healing_potion, 0.5).
item_rarity(dubious_healing_potion, uncommon).
item_category(dubious_healing_potion, potion).
item_stackable(dubious_healing_potion).
item_tradeable(dubious_healing_potion).
item_possessable(dubious_healing_potion).
item_tag(dubious_healing_potion, alchemy).
item_tag(dubious_healing_potion, questionable).

%% Forged Trade Permit
item(forged_trade_permit, 'Forged Trade Permit', quest_item).
item_description(forged_trade_permit, 'A convincing replica of a ducal trade license. Close inspection would reveal the ink is wrong.').
item_value(forged_trade_permit, 25).
item_sell_value(forged_trade_permit, 15).
item_weight(forged_trade_permit, 0.1).
item_rarity(forged_trade_permit, rare).
item_category(forged_trade_permit, document).
item_tradeable(forged_trade_permit).
item_possessable(forged_trade_permit).
item_tag(forged_trade_permit, forgery).
item_tag(forged_trade_permit, contraband).

%% Stolen Signet Ring
item(stolen_signet_ring, 'Stolen Signet Ring', accessory).
item_description(stolen_signet_ring, 'A gold ring bearing the seal of House Vane. Its rightful owner is either dead or will want it back badly.').
item_value(stolen_signet_ring, 50).
item_sell_value(stolen_signet_ring, 30).
item_weight(stolen_signet_ring, 0.1).
item_rarity(stolen_signet_ring, rare).
item_category(stolen_signet_ring, jewelry).
item_tradeable(stolen_signet_ring).
item_possessable(stolen_signet_ring).
item_tag(stolen_signet_ring, stolen).
item_tag(stolen_signet_ring, noble).

%% Tallow Candle
item(tallow_candle, 'Tallow Candle', consumable).
item_description(tallow_candle, 'A cheap candle rendered from animal fat. It stinks but provides light in dark places.').
item_value(tallow_candle, 1).
item_sell_value(tallow_candle, 0).
item_weight(tallow_candle, 0.3).
item_rarity(tallow_candle, common).
item_category(tallow_candle, utility).
item_stackable(tallow_candle).
item_tradeable(tallow_candle).
item_possessable(tallow_candle).
item_tag(tallow_candle, light_source).

%% Hardtack Rations
item(hardtack_rations, 'Hardtack Rations', consumable).
item_description(hardtack_rations, 'Dense, nearly indestructible biscuits. Tasteless but they keep you alive on the road.').
item_value(hardtack_rations, 2).
item_sell_value(hardtack_rations, 1).
item_weight(hardtack_rations, 1).
item_rarity(hardtack_rations, common).
item_category(hardtack_rations, food_drink).
item_stackable(hardtack_rations).
item_tradeable(hardtack_rations).
item_possessable(hardtack_rations).
item_tag(hardtack_rations, food).
item_tag(hardtack_rations, survival).

%% Watered Ale
item(watered_ale, 'Watered Ale', consumable).
item_description(watered_ale, 'Thin, bitter ale served at the Hanged Crow. It is wet and vaguely alcoholic.').
item_value(watered_ale, 1).
item_sell_value(watered_ale, 0).
item_weight(watered_ale, 0.5).
item_rarity(watered_ale, common).
item_category(watered_ale, food_drink).
item_stackable(watered_ale).
item_tradeable(watered_ale).
item_possessable(watered_ale).
item_tag(watered_ale, beverage).

%% Worn Leather Jerkin
item(worn_leather_jerkin, 'Worn Leather Jerkin', armor).
item_description(worn_leather_jerkin, 'Cracked and stained leather armor. It will turn a glancing blow but not much more.').
item_value(worn_leather_jerkin, 10).
item_sell_value(worn_leather_jerkin, 4).
item_weight(worn_leather_jerkin, 5).
item_rarity(worn_leather_jerkin, common).
item_category(worn_leather_jerkin, light_armor).
item_tradeable(worn_leather_jerkin).
item_possessable(worn_leather_jerkin).
item_tag(worn_leather_jerkin, armor).
item_tag(worn_leather_jerkin, poor_quality).

%% Thieves Tools
item(thieves_tools, 'Thieves Tools', tool).
item_description(thieves_tools, 'A roll of lockpicks, shims, and tension wrenches. Possession alone is grounds for arrest.').
item_value(thieves_tools, 20).
item_sell_value(thieves_tools, 10).
item_weight(thieves_tools, 0.5).
item_rarity(thieves_tools, uncommon).
item_category(thieves_tools, tool).
item_tradeable(thieves_tools).
item_possessable(thieves_tools).
item_tag(thieves_tools, criminal).
item_tag(thieves_tools, tool).

%% Bundle of Hemlock
item(bundle_of_hemlock, 'Bundle of Hemlock', consumable).
item_description(bundle_of_hemlock, 'Dried hemlock leaves wrapped in cloth. Medicinal in small doses. Lethal in large ones.').
item_value(bundle_of_hemlock, 8).
item_sell_value(bundle_of_hemlock, 4).
item_weight(bundle_of_hemlock, 0.2).
item_rarity(bundle_of_hemlock, uncommon).
item_category(bundle_of_hemlock, alchemy).
item_stackable(bundle_of_hemlock).
item_tradeable(bundle_of_hemlock).
item_possessable(bundle_of_hemlock).
item_tag(bundle_of_hemlock, poison).
item_tag(bundle_of_hemlock, herb).

%% Rope (Hemp)
item(hemp_rope, 'Hemp Rope', tool).
item_description(hemp_rope, 'Fifty feet of rough hemp rope. Essential for climbing, binding prisoners, or improvised hangings.').
item_value(hemp_rope, 3).
item_sell_value(hemp_rope, 1).
item_weight(hemp_rope, 5).
item_rarity(hemp_rope, common).
item_category(hemp_rope, utility).
item_tradeable(hemp_rope).
item_possessable(hemp_rope).
item_tag(hemp_rope, tool).
item_tag(hemp_rope, survival).

%% Salvaged Chainmail Shirt
item(salvaged_chainmail, 'Salvaged Chainmail Shirt', armor).
item_description(salvaged_chainmail, 'Looted from a battlefield corpse. Several links are broken but it still offers decent protection.').
item_value(salvaged_chainmail, 35).
item_sell_value(salvaged_chainmail, 18).
item_weight(salvaged_chainmail, 15).
item_rarity(salvaged_chainmail, uncommon).
item_category(salvaged_chainmail, medium_armor).
item_tradeable(salvaged_chainmail).
item_possessable(salvaged_chainmail).
item_tag(salvaged_chainmail, armor).
item_tag(salvaged_chainmail, looted).

%% Iron Dagger
item(iron_dagger, 'Iron Dagger', weapon).
item_description(iron_dagger, 'A simple iron dagger. Good for cutting rope, throats, or cheese.').
item_value(iron_dagger, 5).
item_sell_value(iron_dagger, 2).
item_weight(iron_dagger, 1).
item_rarity(iron_dagger, common).
item_category(iron_dagger, melee_weapon).
item_tradeable(iron_dagger).
item_possessable(iron_dagger).
item_tag(iron_dagger, weapon).
item_tag(iron_dagger, concealable).

%% Sealed Letter (unknown contents)
item(sealed_letter, 'Sealed Letter', quest_item).
item_description(sealed_letter, 'A wax-sealed letter bearing no name. The seal is unfamiliar. Someone would pay to know its contents.').
item_value(sealed_letter, 15).
item_sell_value(sealed_letter, 8).
item_weight(sealed_letter, 0.1).
item_rarity(sealed_letter, uncommon).
item_category(sealed_letter, document).
item_tradeable(sealed_letter).
item_possessable(sealed_letter).
item_tag(sealed_letter, intrigue).
item_tag(sealed_letter, secret).

%% Smuggled Salt (contraband)
item(smuggled_salt, 'Smuggled Salt', trade_good).
item_description(smuggled_salt, 'A sack of untaxed salt from across the strait. Worth a small fortune if the bailiff does not catch you.').
item_value(smuggled_salt, 40).
item_sell_value(smuggled_salt, 25).
item_weight(smuggled_salt, 10).
item_rarity(smuggled_salt, uncommon).
item_category(smuggled_salt, contraband).
item_stackable(smuggled_salt).
item_tradeable(smuggled_salt).
item_possessable(smuggled_salt).
item_tag(smuggled_salt, contraband).
item_tag(smuggled_salt, trade).

%% Faded Map Fragment
item(faded_map_fragment, 'Faded Map Fragment', quest_item).
item_description(faded_map_fragment, 'A torn piece of vellum showing part of a ruined keep. The ink has faded but directions can be made out.').
item_value(faded_map_fragment, 10).
item_sell_value(faded_map_fragment, 5).
item_weight(faded_map_fragment, 0.1).
item_rarity(faded_map_fragment, rare).
item_category(faded_map_fragment, document).
item_tradeable(faded_map_fragment).
item_possessable(faded_map_fragment).
item_tag(faded_map_fragment, exploration).
item_tag(faded_map_fragment, treasure).

%% Warding Charm (dubious magic)
item(warding_charm, 'Warding Charm', accessory).
item_description(warding_charm, 'A small bone trinket carved with faded symbols. Old Mag claims it wards off evil. It might just be a bone.').
item_value(warding_charm, 15).
item_sell_value(warding_charm, 7).
item_weight(warding_charm, 0.1).
item_rarity(warding_charm, rare).
item_category(warding_charm, charm).
item_tradeable(warding_charm).
item_possessable(warding_charm).
item_tag(warding_charm, magic).
item_tag(warding_charm, superstition).
