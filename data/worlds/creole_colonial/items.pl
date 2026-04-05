%% Insimul Items: Creole Colonial
%% Source: data/worlds/creole_colonial/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Cafe Noir (Black Coffee)
item(cafe_noir, 'Cafe Noir', consumable).
item_description(cafe_noir, 'Strong black coffee brewed in the colonial Creole style, served in a small tin cup. A daily staple of the colony.').
item_value(cafe_noir, 3).
item_sell_value(cafe_noir, 1).
item_weight(cafe_noir, 0.3).
item_rarity(cafe_noir, common).
item_category(cafe_noir, food_drink).
item_stackable(cafe_noir).
item_tradeable(cafe_noir).
item_possessable(cafe_noir).
item_tag(cafe_noir, beverage).
item_tag(cafe_noir, cultural).

%% Pain de Mais (Cornbread)
item(pain_de_mais, 'Pain de Mais', consumable).
item_description(pain_de_mais, 'Dense cornbread baked in a cast-iron skillet, a Creole adaptation of Indigenous maize recipes.').
item_value(pain_de_mais, 2).
item_sell_value(pain_de_mais, 1).
item_weight(pain_de_mais, 0.5).
item_rarity(pain_de_mais, common).
item_category(pain_de_mais, food_drink).
item_stackable(pain_de_mais).
item_tradeable(pain_de_mais).
item_possessable(pain_de_mais).
item_tag(pain_de_mais, food).
item_tag(pain_de_mais, cultural).

%% Gumbo Pot
item(gumbo_pot, 'Gumbo Pot', consumable).
item_description(gumbo_pot, 'A steaming pot of gumbo with okra, sassafras, and crawfish -- the signature dish of Creole cuisine.').
item_value(gumbo_pot, 8).
item_sell_value(gumbo_pot, 4).
item_weight(gumbo_pot, 3).
item_rarity(gumbo_pot, common).
item_category(gumbo_pot, food_drink).
item_stackable(gumbo_pot).
item_tradeable(gumbo_pot).
item_possessable(gumbo_pot).
item_tag(gumbo_pot, food).
item_tag(gumbo_pot, cultural).

%% Indigo Dye Bundle
item(indigo_dye_bundle, 'Indigo Dye Bundle', trade_good).
item_description(indigo_dye_bundle, 'A bundle of processed indigo cakes, the primary export crop of colonial Louisiana. Deep blue and highly valued in European markets.').
item_value(indigo_dye_bundle, 25).
item_sell_value(indigo_dye_bundle, 18).
item_weight(indigo_dye_bundle, 2).
item_rarity(indigo_dye_bundle, uncommon).
item_category(indigo_dye_bundle, trade).
item_stackable(indigo_dye_bundle).
item_tradeable(indigo_dye_bundle).
item_possessable(indigo_dye_bundle).
item_tag(indigo_dye_bundle, trade).
item_tag(indigo_dye_bundle, plantation).

%% Spanish Piaster
item(spanish_piaster, 'Spanish Piaster', currency).
item_description(spanish_piaster, 'A silver Spanish dollar widely circulated in colonial Louisiana. The primary unit of currency in the colony.').
item_value(spanish_piaster, 10).
item_sell_value(spanish_piaster, 10).
item_weight(spanish_piaster, 0.1).
item_rarity(spanish_piaster, common).
item_category(spanish_piaster, currency).
item_stackable(spanish_piaster).
item_tradeable(spanish_piaster).
item_possessable(spanish_piaster).
item_tag(spanish_piaster, currency).

%% Tignon (Head Wrap)
item(tignon, 'Tignon', equipment).
item_description(tignon, 'A colorful head wrap worn by women of color, mandated by the Tignon Law of 1786. Transformed from a mark of restriction into a symbol of cultural pride and identity.').
item_value(tignon, 12).
item_sell_value(tignon, 6).
item_weight(tignon, 0.3).
item_rarity(tignon, common).
item_category(tignon, clothing).
item_tradeable(tignon).
item_possessable(tignon).
item_tag(tignon, clothing).
item_tag(tignon, cultural).

%% Gris-Gris Bag
item(gris_gris_bag, 'Gris-Gris Bag', artifact).
item_description(gris_gris_bag, 'A small cloth bag filled with herbs, bones, and sacred items prepared by a voodoo practitioner. Believed to offer protection or bring luck.').
item_value(gris_gris_bag, 20).
item_sell_value(gris_gris_bag, 10).
item_weight(gris_gris_bag, 0.2).
item_rarity(gris_gris_bag, rare).
item_category(gris_gris_bag, spiritual).
item_tradeable(gris_gris_bag).
item_possessable(gris_gris_bag).
item_tag(gris_gris_bag, voodoo).
item_tag(gris_gris_bag, cultural).

%% Pirogue (Bayou Canoe)
item(pirogue, 'Pirogue', vehicle).
item_description(pirogue, 'A flat-bottomed dugout canoe used to navigate the shallow bayous and swamps of Louisiana. Essential transport for trappers and fishermen.').
item_value(pirogue, 50).
item_sell_value(pirogue, 30).
item_weight(pirogue, 40).
item_rarity(pirogue, uncommon).
item_category(pirogue, transport).
item_tradeable(pirogue).
item_possessable(pirogue).
item_tag(pirogue, transport).
item_tag(pirogue, bayou).

%% Tanbou (Drum)
item(tanbou, 'Tanbou', equipment).
item_description(tanbou, 'An African-style hand drum used in Congo Square gatherings and voodoo ceremonies. Central to Creole musical tradition.').
item_value(tanbou, 15).
item_sell_value(tanbou, 8).
item_weight(tanbou, 5).
item_rarity(tanbou, uncommon).
item_category(tanbou, instrument).
item_tradeable(tanbou).
item_possessable(tanbou).
item_tag(tanbou, music).
item_tag(tanbou, cultural).

%% Cane Knife (Machete)
item(cane_knife, 'Cane Knife', tool).
item_description(cane_knife, 'A heavy machete used for cutting sugar cane in the plantation fields. Also useful for clearing bayou undergrowth.').
item_value(cane_knife, 8).
item_sell_value(cane_knife, 4).
item_weight(cane_knife, 2).
item_rarity(cane_knife, common).
item_category(cane_knife, tool).
item_tradeable(cane_knife).
item_possessable(cane_knife).
item_tag(cane_knife, tool).
item_tag(cane_knife, plantation).

%% Sassafras Leaves (File Powder)
item(sassafras_leaves, 'Sassafras Leaves', consumable).
item_description(sassafras_leaves, 'Dried and ground sassafras leaves used as file powder to thicken gumbo. Learned from the Choctaw people.').
item_value(sassafras_leaves, 5).
item_sell_value(sassafras_leaves, 3).
item_weight(sassafras_leaves, 0.2).
item_rarity(sassafras_leaves, common).
item_category(sassafras_leaves, food_drink).
item_stackable(sassafras_leaves).
item_tradeable(sassafras_leaves).
item_possessable(sassafras_leaves).
item_tag(sassafras_leaves, food).
item_tag(sassafras_leaves, indigenous).

%% Manumission Papers
item(manumission_papers, 'Manumission Papers', document).
item_description(manumission_papers, 'Official colonial documents granting freedom to an enslaved person. Requires a notary seal and registration with the colonial court.').
item_value(manumission_papers, 100).
item_sell_value(manumission_papers, 0).
item_weight(manumission_papers, 0.1).
item_rarity(manumission_papers, rare).
item_category(manumission_papers, legal).
item_possessable(manumission_papers).
item_tag(manumission_papers, legal).
item_tag(manumission_papers, freedom).

%% Rosary Beads
item(rosary_beads, 'Rosary Beads', artifact).
item_description(rosary_beads, 'Wooden rosary beads brought from France. Used in Catholic prayer and sometimes syncretized with African spiritual practices.').
item_value(rosary_beads, 6).
item_sell_value(rosary_beads, 3).
item_weight(rosary_beads, 0.1).
item_rarity(rosary_beads, common).
item_category(rosary_beads, spiritual).
item_possessable(rosary_beads).
item_tag(rosary_beads, religious).
item_tag(rosary_beads, cultural).

%% Alligator Skin
item(alligator_skin, 'Alligator Skin', trade_good).
item_description(alligator_skin, 'A tanned alligator hide from the bayou, valued for leather goods and trade with European merchants.').
item_value(alligator_skin, 18).
item_sell_value(alligator_skin, 12).
item_weight(alligator_skin, 4).
item_rarity(alligator_skin, uncommon).
item_category(alligator_skin, trade).
item_stackable(alligator_skin).
item_tradeable(alligator_skin).
item_possessable(alligator_skin).
item_tag(alligator_skin, trade).
item_tag(alligator_skin, bayou).

%% Mosquito Net
item(mosquito_net, 'Mosquito Net', equipment).
item_description(mosquito_net, 'A gauze net draped over beds to protect sleepers from the swarms of mosquitoes that carry yellow fever through the colony.').
item_value(mosquito_net, 10).
item_sell_value(mosquito_net, 5).
item_weight(mosquito_net, 1).
item_rarity(mosquito_net, common).
item_category(mosquito_net, household).
item_tradeable(mosquito_net).
item_possessable(mosquito_net).
item_tag(mosquito_net, household).
item_tag(mosquito_net, survival).

%% Flintlock Pistol
item(flintlock_pistol, 'Flintlock Pistol', weapon).
item_description(flintlock_pistol, 'A French-made flintlock pistol carried by officers, merchants, and privateers. A symbol of authority in the colony.').
item_value(flintlock_pistol, 40).
item_sell_value(flintlock_pistol, 25).
item_weight(flintlock_pistol, 2).
item_rarity(flintlock_pistol, rare).
item_category(flintlock_pistol, weapon).
item_tradeable(flintlock_pistol).
item_possessable(flintlock_pistol).
item_tag(flintlock_pistol, weapon).
item_tag(flintlock_pistol, colonial).

%% Banjo
item(banjo, 'Banjo', equipment).
item_description(banjo, 'A stringed instrument of West African origin, adapted in the colonies. Played at Congo Square gatherings and bayou fais do-do dances.').
item_value(banjo, 12).
item_sell_value(banjo, 6).
item_weight(banjo, 3).
item_rarity(banjo, uncommon).
item_category(banjo, instrument).
item_tradeable(banjo).
item_possessable(banjo).
item_tag(banjo, music).
item_tag(banjo, cultural).

%% Spanish Moss Bundle
item(spanish_moss, 'Spanish Moss Bundle', material).
item_description(spanish_moss, 'Dried Spanish moss harvested from cypress trees, used to stuff mattresses and insulate walls in colonial homes.').
item_value(spanish_moss, 3).
item_sell_value(spanish_moss, 1).
item_weight(spanish_moss, 1).
item_rarity(spanish_moss, common).
item_category(spanish_moss, material).
item_stackable(spanish_moss).
item_tradeable(spanish_moss).
item_possessable(spanish_moss).
item_tag(spanish_moss, material).
item_tag(spanish_moss, bayou).
