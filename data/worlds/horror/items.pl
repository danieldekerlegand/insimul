%% Insimul Items: Horror World
%% Source: data/worlds/horror/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Flashlight
item(flashlight, 'Flashlight', tool).
item_description(flashlight, 'A heavy-duty flashlight with a failing battery. The beam flickers in the dark.').
item_value(flashlight, 10).
item_sell_value(flashlight, 5).
item_weight(flashlight, 1).
item_rarity(flashlight, common).
item_category(flashlight, survival).
item_tradeable(flashlight).
item_possessable(flashlight).
item_tag(flashlight, light_source).
item_tag(flashlight, survival).

%% Oil Lantern
item(oil_lantern, 'Oil Lantern', tool).
item_description(oil_lantern, 'A battered brass lantern that casts long, wavering shadows. Burns for hours on whale oil.').
item_value(oil_lantern, 15).
item_sell_value(oil_lantern, 8).
item_weight(oil_lantern, 2).
item_rarity(oil_lantern, common).
item_category(oil_lantern, survival).
item_tradeable(oil_lantern).
item_possessable(oil_lantern).
item_tag(oil_lantern, light_source).
item_tag(oil_lantern, survival).

%% Silver Bullets
item(silver_bullets, 'Silver Bullets', ammunition).
item_description(silver_bullets, 'Six hand-cast silver bullets etched with protective sigils. Effective against unnatural creatures.').
item_value(silver_bullets, 50).
item_sell_value(silver_bullets, 30).
item_weight(silver_bullets, 0.3).
item_rarity(silver_bullets, rare).
item_category(silver_bullets, weapon).
item_stackable(silver_bullets).
item_tradeable(silver_bullets).
item_possessable(silver_bullets).
item_tag(silver_bullets, supernatural_defense).
item_tag(silver_bullets, ammunition).

%% Crucifix
item(crucifix, 'Iron Crucifix', accessory).
item_description(crucifix, 'A heavy iron crucifix worn smooth by decades of prayer. Radiates faint warmth in the presence of evil.').
item_value(crucifix, 25).
item_sell_value(crucifix, 12).
item_weight(crucifix, 0.5).
item_rarity(crucifix, uncommon).
item_category(crucifix, protection).
item_tradeable(crucifix).
item_possessable(crucifix).
item_tag(crucifix, holy).
item_tag(crucifix, supernatural_defense).

%% Sanity Elixir
item(sanity_elixir, 'Sanity Elixir', consumable).
item_description(sanity_elixir, 'A bitter tincture brewed from valerian, chamomile, and something unidentifiable. Steadies the mind against cosmic terror.').
item_value(sanity_elixir, 40).
item_sell_value(sanity_elixir, 20).
item_weight(sanity_elixir, 0.3).
item_rarity(sanity_elixir, rare).
item_category(sanity_elixir, medicine).
item_stackable(sanity_elixir).
item_tradeable(sanity_elixir).
item_possessable(sanity_elixir).
item_tag(sanity_elixir, mental_health).
item_tag(sanity_elixir, alchemy).

%% Occult Tome
item(occult_tome, 'Occult Tome', tool).
item_description(occult_tome, 'A leather-bound volume written in a mix of Latin and an unknown script. Contains rituals, ward diagrams, and warnings.').
item_value(occult_tome, 80).
item_sell_value(occult_tome, 50).
item_weight(occult_tome, 3).
item_rarity(occult_tome, rare).
item_category(occult_tome, knowledge).
item_tradeable(occult_tome).
item_possessable(occult_tome).
item_tag(occult_tome, forbidden_knowledge).
item_tag(occult_tome, ritual).

%% Revolver
item(revolver, 'Revolver', weapon).
item_description(revolver, 'A worn six-shot revolver. Ordinary bullets are useless against some things, but the noise helps with morale.').
item_value(revolver, 60).
item_sell_value(revolver, 35).
item_weight(revolver, 1.5).
item_rarity(revolver, uncommon).
item_category(revolver, weapon).
item_tradeable(revolver).
item_possessable(revolver).
item_tag(revolver, firearm).
item_tag(revolver, defense).

%% Protective Salt
item(protective_salt, 'Protective Salt', consumable).
item_description(protective_salt, 'Coarse rock salt blessed by Father Thorne. Pour a circle around yourself and nothing from the other side can cross.').
item_value(protective_salt, 15).
item_sell_value(protective_salt, 8).
item_weight(protective_salt, 1).
item_rarity(protective_salt, uncommon).
item_category(protective_salt, protection).
item_stackable(protective_salt).
item_tradeable(protective_salt).
item_possessable(protective_salt).
item_tag(protective_salt, ward).
item_tag(protective_salt, supernatural_defense).

%% Journal of the Missing
item(journal_missing, 'Journal of the Missing', tool).
item_description(journal_missing, 'A water-damaged journal found in the warehouse. The last entries describe impossible geometries and sounds from beneath the water.').
item_value(journal_missing, 30).
item_sell_value(journal_missing, 15).
item_weight(journal_missing, 0.5).
item_rarity(journal_missing, uncommon).
item_category(journal_missing, knowledge).
item_tradeable(journal_missing).
item_possessable(journal_missing).
item_tag(journal_missing, clue).
item_tag(journal_missing, investigation).

%% Boarding Planks
item(boarding_planks, 'Boarding Planks', material).
item_description(boarding_planks, 'Heavy wooden planks and nails for barricading doors and windows. Essential when the fog comes.').
item_value(boarding_planks, 8).
item_sell_value(boarding_planks, 4).
item_weight(boarding_planks, 5).
item_rarity(boarding_planks, common).
item_category(boarding_planks, fortification).
item_stackable(boarding_planks).
item_tradeable(boarding_planks).
item_possessable(boarding_planks).
item_tag(boarding_planks, barricade).
item_tag(boarding_planks, survival).

%% Herb Poultice
item(herb_poultice, 'Herb Poultice', consumable).
item_description(herb_poultice, 'A foul-smelling poultice made from local marsh herbs. Heals wounds and draws out infection from unnatural bites.').
item_value(herb_poultice, 12).
item_sell_value(herb_poultice, 6).
item_weight(herb_poultice, 0.3).
item_rarity(herb_poultice, common).
item_category(herb_poultice, medicine).
item_stackable(herb_poultice).
item_tradeable(herb_poultice).
item_possessable(herb_poultice).
item_tag(herb_poultice, healing).
item_tag(herb_poultice, medicine).

%% Black Star Amulet
item(black_star_amulet, 'Black Star Amulet', accessory).
item_description(black_star_amulet, 'An obsidian pendant carved with a five-pointed star inverted. Members of the cult wear these beneath their clothes.').
item_value(black_star_amulet, 45).
item_sell_value(black_star_amulet, 25).
item_weight(black_star_amulet, 0.2).
item_rarity(black_star_amulet, rare).
item_category(black_star_amulet, occult).
item_tradeable(black_star_amulet).
item_possessable(black_star_amulet).
item_tag(black_star_amulet, cult).
item_tag(black_star_amulet, forbidden_knowledge).

%% Matches
item(matches_hr, 'Box of Matches', consumable).
item_description(matches_hr, 'A damp box of wooden matches. About half of them still strike. Fire is one of the few reliable defenses.').
item_value(matches_hr, 3).
item_sell_value(matches_hr, 1).
item_weight(matches_hr, 0.1).
item_rarity(matches_hr, common).
item_category(matches_hr, survival).
item_stackable(matches_hr).
item_tradeable(matches_hr).
item_possessable(matches_hr).
item_tag(matches_hr, fire).
item_tag(matches_hr, survival).

%% Skeleton Key
item(skeleton_key, 'Skeleton Key', tool).
item_description(skeleton_key, 'An old iron key that opens most locks in Ravenhollow. The teeth are worn into strange shapes.').
item_value(skeleton_key, 35).
item_sell_value(skeleton_key, 20).
item_weight(skeleton_key, 0.2).
item_rarity(skeleton_key, uncommon).
item_category(skeleton_key, tool).
item_tradeable(skeleton_key).
item_possessable(skeleton_key).
item_tag(skeleton_key, exploration).
item_tag(skeleton_key, utility).

%% Holy Water
item(holy_water, 'Holy Water', consumable).
item_description(holy_water, 'A small glass vial of water consecrated by Father Thorne. Burns unnatural flesh on contact.').
item_value(holy_water, 20).
item_sell_value(holy_water, 10).
item_weight(holy_water, 0.3).
item_rarity(holy_water, uncommon).
item_category(holy_water, protection).
item_stackable(holy_water).
item_tradeable(holy_water).
item_possessable(holy_water).
item_tag(holy_water, holy).
item_tag(holy_water, supernatural_defense).

%% Compass
item(compass_hr, 'Compass', tool).
item_description(compass_hr, 'A brass compass that spins wildly near certain locations. When it works, it points toward safety.').
item_value(compass_hr, 18).
item_sell_value(compass_hr, 9).
item_weight(compass_hr, 0.3).
item_rarity(compass_hr, common).
item_category(compass_hr, navigation).
item_tradeable(compass_hr).
item_possessable(compass_hr).
item_tag(compass_hr, navigation).
item_tag(compass_hr, survival).

%% Whiskey Flask
item(whiskey_flask, 'Whiskey Flask', consumable).
item_description(whiskey_flask, 'A dented hip flask of cheap whiskey. Dulls the fear but clouds the judgment.').
item_value(whiskey_flask, 5).
item_sell_value(whiskey_flask, 2).
item_weight(whiskey_flask, 0.4).
item_rarity(whiskey_flask, common).
item_category(whiskey_flask, food_drink).
item_stackable(whiskey_flask).
item_tradeable(whiskey_flask).
item_possessable(whiskey_flask).
item_tag(whiskey_flask, beverage).
item_tag(whiskey_flask, morale).

%% Ritual Chalk
item(ritual_chalk, 'Ritual Chalk', consumable).
item_description(ritual_chalk, 'White chalk infused with bone dust. Used to draw protective circles and binding sigils on stone floors.').
item_value(ritual_chalk, 10).
item_sell_value(ritual_chalk, 5).
item_weight(ritual_chalk, 0.2).
item_rarity(ritual_chalk, uncommon).
item_category(ritual_chalk, occult).
item_stackable(ritual_chalk).
item_tradeable(ritual_chalk).
item_possessable(ritual_chalk).
item_tag(ritual_chalk, ritual).
item_tag(ritual_chalk, ward).

%% Rope
item(rope_hr, 'Coil of Rope', tool).
item_description(rope_hr, 'Fifty feet of sturdy hemp rope. Essential for descending into cellars, wells, and places best left unexplored.').
item_value(rope_hr, 8).
item_sell_value(rope_hr, 4).
item_weight(rope_hr, 3).
item_rarity(rope_hr, common).
item_category(rope_hr, tool).
item_tradeable(rope_hr).
item_possessable(rope_hr).
item_tag(rope_hr, exploration).
item_tag(rope_hr, utility).

%% Grimoire Fragment
item(grimoire_fragment, 'Grimoire Fragment', tool).
item_description(grimoire_fragment, 'A torn page from the Blackwood family grimoire. Contains a partial incantation for banishing lesser entities.').
item_value(grimoire_fragment, 100).
item_sell_value(grimoire_fragment, 60).
item_weight(grimoire_fragment, 0.1).
item_rarity(grimoire_fragment, legendary).
item_category(grimoire_fragment, knowledge).
item_tradeable(grimoire_fragment).
item_possessable(grimoire_fragment).
item_tag(grimoire_fragment, forbidden_knowledge).
item_tag(grimoire_fragment, ritual).
