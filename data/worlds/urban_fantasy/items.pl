%% Insimul Items: Urban Fantasy -- Veilhaven
%% Source: data/worlds/urban_fantasy/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Cold Iron Dagger
item(cold_iron_dagger, 'Cold Iron Dagger', weapon).
item_description(cold_iron_dagger, 'A short blade forged from cold iron. Fae creatures find its touch unbearable.').
item_value(cold_iron_dagger, 75).
item_sell_value(cold_iron_dagger, 35).
item_weight(cold_iron_dagger, 1.5).
item_rarity(cold_iron_dagger, uncommon).
item_category(cold_iron_dagger, weapon).
item_tradeable(cold_iron_dagger).
item_possessable(cold_iron_dagger).
item_tag(cold_iron_dagger, anti_fae).
item_tag(cold_iron_dagger, melee).

%% Wolfsbane Tincture
item(wolfsbane_tincture, 'Wolfsbane Tincture', consumable).
item_description(wolfsbane_tincture, 'A carefully diluted tincture of wolfsbane. Helps werewolves control their transformation during the full moon.').
item_value(wolfsbane_tincture, 50).
item_sell_value(wolfsbane_tincture, 25).
item_weight(wolfsbane_tincture, 0.3).
item_rarity(wolfsbane_tincture, rare).
item_category(wolfsbane_tincture, alchemy).
item_stackable(wolfsbane_tincture).
item_tradeable(wolfsbane_tincture).
item_possessable(wolfsbane_tincture).
item_tag(wolfsbane_tincture, werewolf).
item_tag(wolfsbane_tincture, potion).

%% Fae Token
item(fae_token, 'Fae Token', quest_item).
item_description(fae_token, 'A small silver coin stamped with the Seelie Court sigil. Grants safe passage through fae territories.').
item_value(fae_token, 200).
item_sell_value(fae_token, 0).
item_weight(fae_token, 0.1).
item_rarity(fae_token, rare).
item_category(fae_token, quest).
item_possessable(fae_token).
item_tag(fae_token, fae).
item_tag(fae_token, diplomatic).

%% Pack Sigil
item(pack_sigil, 'Pack Sigil', quest_item).
item_description(pack_sigil, 'A carved bone pendant marking the bearer as a friend of the Docklands Pack.').
item_value(pack_sigil, 150).
item_sell_value(pack_sigil, 0).
item_weight(pack_sigil, 0.2).
item_rarity(pack_sigil, rare).
item_category(pack_sigil, quest).
item_possessable(pack_sigil).
item_tag(pack_sigil, werewolf).
item_tag(pack_sigil, faction).

%% Ward Map
item(ward_map, 'Ward Map of Veilhaven', tool).
item_description(ward_map, 'An ancient map showing the network of protective wards that keep Veilhaven hidden from the mundane world.').
item_value(ward_map, 500).
item_sell_value(ward_map, 0).
item_weight(ward_map, 0.5).
item_rarity(ward_map, legendary).
item_category(ward_map, quest).
item_possessable(ward_map).
item_tag(ward_map, occult).
item_tag(ward_map, lore).

%% Protection Ward
item(protection_ward, 'Protection Ward', consumable).
item_description(protection_ward, 'A small sachet of iron filings and sea salt blessed with protective intent. Deters minor supernatural threats.').
item_value(protection_ward, 25).
item_sell_value(protection_ward, 12).
item_weight(protection_ward, 0.2).
item_rarity(protection_ward, common).
item_category(protection_ward, alchemy).
item_stackable(protection_ward).
item_tradeable(protection_ward).
item_possessable(protection_ward).
item_tag(protection_ward, defensive).
item_tag(protection_ward, consumable).

%% Veil Sight Potion
item(veil_sight_potion, 'Veil Sight Potion', consumable).
item_description(veil_sight_potion, 'A shimmering iridescent liquid that allows the drinker to see through glamours and illusions for one hour.').
item_value(veil_sight_potion, 80).
item_sell_value(veil_sight_potion, 40).
item_weight(veil_sight_potion, 0.3).
item_rarity(veil_sight_potion, uncommon).
item_category(veil_sight_potion, alchemy).
item_stackable(veil_sight_potion).
item_tradeable(veil_sight_potion).
item_possessable(veil_sight_potion).
item_tag(veil_sight_potion, potion).
item_tag(veil_sight_potion, perception).

%% Silver Bullet
item(silver_bullet, 'Silver Bullet', ammunition).
item_description(silver_bullet, 'A hand-cast silver bullet. Effective against werewolves and certain other supernatural beings.').
item_value(silver_bullet, 15).
item_sell_value(silver_bullet, 8).
item_weight(silver_bullet, 0.05).
item_rarity(silver_bullet, uncommon).
item_category(silver_bullet, ammunition).
item_stackable(silver_bullet).
item_tradeable(silver_bullet).
item_possessable(silver_bullet).
item_tag(silver_bullet, anti_werewolf).
item_tag(silver_bullet, ranged).

%% Enchanted Smartphone
item(enchanted_smartphone, 'Enchanted Smartphone', tool).
item_description(enchanted_smartphone, 'A modified smartphone with apps that detect supernatural energy signatures and translate fae script.').
item_value(enchanted_smartphone, 300).
item_sell_value(enchanted_smartphone, 150).
item_weight(enchanted_smartphone, 0.3).
item_rarity(enchanted_smartphone, rare).
item_category(enchanted_smartphone, technology).
item_possessable(enchanted_smartphone).
item_tag(enchanted_smartphone, technology).
item_tag(enchanted_smartphone, detection).

%% Ironside Tattoo Ink
item(ironside_ink, 'Ironside Tattoo Ink', crafting_material).
item_description(ironside_ink, 'Special tattoo ink infused with cold iron particles. Tattoos made with this ink act as permanent minor wards.').
item_value(ironside_ink, 60).
item_sell_value(ironside_ink, 30).
item_weight(ironside_ink, 0.2).
item_rarity(ironside_ink, uncommon).
item_category(ironside_ink, crafting).
item_tradeable(ironside_ink).
item_possessable(ironside_ink).
item_tag(ironside_ink, crafting).
item_tag(ironside_ink, warding).

%% Glamour Dust
item(glamour_dust, 'Glamour Dust', consumable).
item_description(glamour_dust, 'Sparkling fae dust that temporarily changes the users appearance. Lasts about four hours.').
item_value(glamour_dust, 40).
item_sell_value(glamour_dust, 20).
item_weight(glamour_dust, 0.1).
item_rarity(glamour_dust, uncommon).
item_category(glamour_dust, alchemy).
item_stackable(glamour_dust).
item_tradeable(glamour_dust).
item_possessable(glamour_dust).
item_tag(glamour_dust, fae).
item_tag(glamour_dust, illusion).

%% Blood Vial
item(blood_vial, 'Blood Vial', consumable).
item_description(blood_vial, 'A sealed glass vial of ethically sourced blood from Nightshade Pharmacy. Sustenance for vampires.').
item_value(blood_vial, 30).
item_sell_value(blood_vial, 15).
item_weight(blood_vial, 0.2).
item_rarity(blood_vial, common).
item_category(blood_vial, sustenance).
item_stackable(blood_vial).
item_tradeable(blood_vial).
item_possessable(blood_vial).
item_tag(blood_vial, vampire).
item_tag(blood_vial, consumable).

%% Binding Rope
item(binding_rope, 'Binding Rope', tool).
item_description(binding_rope, 'Rope braided with silver thread and iron wire. Can restrain supernatural creatures that would break normal restraints.').
item_value(binding_rope, 90).
item_sell_value(binding_rope, 45).
item_weight(binding_rope, 2).
item_rarity(binding_rope, rare).
item_category(binding_rope, tool).
item_tradeable(binding_rope).
item_possessable(binding_rope).
item_tag(binding_rope, restraint).
item_tag(binding_rope, supernatural).

%% Occult Grimoire
item(occult_grimoire, 'Occult Grimoire', tool).
item_description(occult_grimoire, 'A leather-bound book of basic wards, hexes, and cantrips. Standard reference for hedge mages.').
item_value(occult_grimoire, 120).
item_sell_value(occult_grimoire, 60).
item_weight(occult_grimoire, 1.5).
item_rarity(occult_grimoire, uncommon).
item_category(occult_grimoire, education).
item_tradeable(occult_grimoire).
item_possessable(occult_grimoire).
item_tag(occult_grimoire, occult).
item_tag(occult_grimoire, education).

%% Moonstone Pendant
item(moonstone_pendant, 'Moonstone Pendant', accessory).
item_description(moonstone_pendant, 'A polished moonstone set in silver. Glows faintly in the presence of active magic.').
item_value(moonstone_pendant, 100).
item_sell_value(moonstone_pendant, 50).
item_weight(moonstone_pendant, 0.2).
item_rarity(moonstone_pendant, uncommon).
item_category(moonstone_pendant, jewelry).
item_tradeable(moonstone_pendant).
item_possessable(moonstone_pendant).
item_tag(moonstone_pendant, detection).
item_tag(moonstone_pendant, jewelry).

%% Subway Token (Underreach)
item(underreach_token, 'Underreach Token', quest_item).
item_description(underreach_token, 'A tarnished copper token stamped with a spiral. Grants access to the Underreach subway network.').
item_value(underreach_token, 10).
item_sell_value(underreach_token, 0).
item_weight(underreach_token, 0.05).
item_rarity(underreach_token, common).
item_category(underreach_token, transit).
item_stackable(underreach_token).
item_possessable(underreach_token).
item_tag(underreach_token, transit).
item_tag(underreach_token, access).

%% Cobalt Diner Coffee
item(cobalt_diner_coffee, 'Cobalt Diner Coffee', consumable).
item_description(cobalt_diner_coffee, 'Strong black coffee from the Cobalt Diner. Neutral ground in a cup. Restores a small amount of energy.').
item_value(cobalt_diner_coffee, 3).
item_sell_value(cobalt_diner_coffee, 1).
item_weight(cobalt_diner_coffee, 0.4).
item_rarity(cobalt_diner_coffee, common).
item_category(cobalt_diner_coffee, food_drink).
item_stackable(cobalt_diner_coffee).
item_tradeable(cobalt_diner_coffee).
item_possessable(cobalt_diner_coffee).
item_tag(cobalt_diner_coffee, food).
item_tag(cobalt_diner_coffee, restoration).

%% Hex Bag
item(hex_bag, 'Hex Bag', consumable).
item_description(hex_bag, 'A small cloth pouch containing cursed herbs and bone fragments. Causes misfortune to the target for 24 hours.').
item_value(hex_bag, 55).
item_sell_value(hex_bag, 25).
item_weight(hex_bag, 0.1).
item_rarity(hex_bag, rare).
item_category(hex_bag, alchemy).
item_stackable(hex_bag).
item_tradeable(hex_bag).
item_possessable(hex_bag).
item_tag(hex_bag, offensive).
item_tag(hex_bag, curse).
