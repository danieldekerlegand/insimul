%% Insimul Items: Medieval Brittany
%% Source: data/worlds/language/breton/items.pl
%% Created: 2026-04-03
%% Total: 24 items
%%
%% Predicate schema:
%%   item/3 — item(AtomId, Name, ItemType)
%%   item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Bara (Bread)
item(bara, 'Bara', food).
item_description(bara, 'A round loaf of dark rye bread, the staple of every Breton table.').
item_value(bara, 2).
item_sell_value(bara, 1).
item_weight(bara, 1).
item_rarity(bara, common).
item_category(bara, food).
item_stackable(bara).
item_tradeable(bara).
item_possessable(bara).
item_base(bara).
item_tag(bara, food).
item_tag(bara, breton).
item_max_stack(bara, 20).

%% Sistr (Cider)
item(sistr, 'Sistr', drink).
item_description(sistr, 'A jug of tangy Breton cider pressed from orchard apples.').
item_value(sistr, 4).
item_sell_value(sistr, 2).
item_weight(sistr, 2).
item_rarity(sistr, common).
item_category(sistr, drink).
item_stackable(sistr).
item_tradeable(sistr).
item_possessable(sistr).
item_base(sistr).
item_tag(sistr, drink).
item_tag(sistr, breton).
item_max_stack(sistr, 10).

%% Pesked Moged (Smoked Fish)
item(pesked_moged, 'Pesked Moged', food).
item_description(pesked_moged, 'Atlantic mackerel smoked over oak chips in the village smokehouse.').
item_value(pesked_moged, 3).
item_sell_value(pesked_moged, 2).
item_weight(pesked_moged, 1).
item_rarity(pesked_moged, common).
item_category(pesked_moged, food).
item_stackable(pesked_moged).
item_tradeable(pesked_moged).
item_possessable(pesked_moged).
item_tag(pesked_moged, food).
item_tag(pesked_moged, fishing).
item_max_stack(pesked_moged, 20).

%% Rouedad Keltiek (Celtic Knot Carving)
item(rouedad_keltiek, 'Rouedad Keltiek', collectible).
item_description(rouedad_keltiek, 'An intricate Celtic knot carved in oak, a symbol of eternity.').
item_value(rouedad_keltiek, 15).
item_sell_value(rouedad_keltiek, 10).
item_weight(rouedad_keltiek, 0.5).
item_rarity(rouedad_keltiek, uncommon).
item_category(rouedad_keltiek, decorative).
item_tradeable(rouedad_keltiek).
item_possessable(rouedad_keltiek).
item_tag(rouedad_keltiek, celtic).
item_tag(rouedad_keltiek, collectible).

%% Koef (Coiffe — Traditional Breton Headdress)
item(koef, 'Koef', collectible).
item_description(koef, 'A tall white lace headdress worn by Breton women, distinctive to each parish.').
item_value(koef, 20).
item_sell_value(koef, 12).
item_weight(koef, 0.3).
item_rarity(koef, uncommon).
item_category(koef, clothing).
item_tradeable(koef).
item_possessable(koef).
item_tag(koef, clothing).
item_tag(koef, breton).
item_tag(koef, cultural).

%% Rouez ar Pardon (Pardon Rosary)
item(rouez_ar_pardon, 'Rouez ar Pardon', quest).
item_description(rouez_ar_pardon, 'A blessed wooden rosary carried during the Pardon procession.').
item_value(rouez_ar_pardon, 10).
item_sell_value(rouez_ar_pardon, 5).
item_weight(rouez_ar_pardon, 0.2).
item_rarity(rouez_ar_pardon, uncommon).
item_category(rouez_ar_pardon, religious).
item_possessable(rouez_ar_pardon).
item_tag(rouez_ar_pardon, pardon).
item_tag(rouez_ar_pardon, religious).
item_tag(rouez_ar_pardon, quest).

%% Rouez Mein Hir (Standing Stone Fragment)
item(rouez_mein_hir, 'Rouez Mein Hir', collectible).
item_description(rouez_mein_hir, 'A small fragment of granite from a fallen standing stone, etched with ancient spirals.').
item_value(rouez_mein_hir, 25).
item_sell_value(rouez_mein_hir, 15).
item_weight(rouez_mein_hir, 2).
item_rarity(rouez_mein_hir, rare).
item_category(rouez_mein_hir, archaeological).
item_possessable(rouez_mein_hir).
item_tag(rouez_mein_hir, megalith).
item_tag(rouez_mein_hir, collectible).

%% Gwel Bag (Sail Cloth)
item(gwel_bag, 'Gwel Bag', material).
item_description(gwel_bag, 'A heavy bolt of linen sail cloth woven to withstand Atlantic gales.').
item_value(gwel_bag, 12).
item_sell_value(gwel_bag, 8).
item_weight(gwel_bag, 5).
item_rarity(gwel_bag, common).
item_category(gwel_bag, maritime).
item_stackable(gwel_bag).
item_tradeable(gwel_bag).
item_possessable(gwel_bag).
item_tag(gwel_bag, maritime).
item_tag(gwel_bag, crafting).
item_max_stack(gwel_bag, 5).

%% Neud Gloan (Wool Thread)
item(neud_gloan, 'Neud Gloan', material).
item_description(neud_gloan, 'Spun wool thread dyed with woad and madder, ready for the loom.').
item_value(neud_gloan, 3).
item_sell_value(neud_gloan, 1).
item_weight(neud_gloan, 0.5).
item_rarity(neud_gloan, common).
item_category(neud_gloan, raw_material).
item_stackable(neud_gloan).
item_tradeable(neud_gloan).
item_possessable(neud_gloan).
item_tag(neud_gloan, textile).
item_tag(neud_gloan, crafting).
item_max_stack(neud_gloan, 50).

%% Aval (Apple)
item(aval, 'Aval', food).
item_description(aval, 'A crisp cider apple from the orchards of Lann-Vraz.').
item_value(aval, 1).
item_sell_value(aval, 0).
item_weight(aval, 0.3).
item_rarity(aval, common).
item_category(aval, food).
item_stackable(aval).
item_tradeable(aval).
item_possessable(aval).
item_base(aval).
item_tag(aval, food).
item_tag(aval, cider).
item_max_stack(aval, 30).

%% Louzaouenn (Medicinal Herb)
item(louzaouenn, 'Louzaouenn', material).
item_description(louzaouenn, 'A bundle of medicinal herbs gathered from the moorland — yarrow, meadowsweet, and valerian.').
item_value(louzaouenn, 5).
item_sell_value(louzaouenn, 3).
item_weight(louzaouenn, 0.3).
item_rarity(louzaouenn, common).
item_category(louzaouenn, raw_material).
item_stackable(louzaouenn).
item_tradeable(louzaouenn).
item_possessable(louzaouenn).
item_tag(louzaouenn, herbalism).
item_tag(louzaouenn, natural).
item_max_stack(louzaouenn, 30).

%% Houarn (Iron Ingot)
item(houarn, 'Houarn', material).
item_description(houarn, 'A bar of bog iron smelted at the village smithy.').
item_value(houarn, 8).
item_sell_value(houarn, 5).
item_weight(houarn, 4).
item_rarity(houarn, common).
item_category(houarn, raw_material).
item_stackable(houarn).
item_tradeable(houarn).
item_possessable(houarn).
item_base(houarn).
item_tag(houarn, material).
item_tag(houarn, crafting).
item_max_stack(houarn, 20).

%% Koad (Wood)
item(koad, 'Koad', material).
item_description(koad, 'A bundle of seasoned oak, cut from the coastal forest.').
item_value(koad, 2).
item_sell_value(koad, 1).
item_weight(koad, 3).
item_rarity(koad, common).
item_category(koad, raw_material).
item_stackable(koad).
item_tradeable(koad).
item_possessable(koad).
item_base(koad).
item_tag(koad, material).
item_tag(koad, crafting).
item_max_stack(koad, 50).

%% Kordenn (Rope)
item(kordenn, 'Kordenn', tool).
item_description(kordenn, 'Stout hemp rope used by fishermen to tie their boats and haul nets.').
item_value(kordenn, 4).
item_sell_value(kordenn, 2).
item_weight(kordenn, 2).
item_rarity(kordenn, common).
item_category(kordenn, tool).
item_stackable(kordenn).
item_tradeable(kordenn).
item_possessable(kordenn).
item_tag(kordenn, maritime).
item_tag(kordenn, fishing).
item_max_stack(kordenn, 10).

%% Roued Pesked (Fishing Net)
item(roued_pesked, 'Roued Pesked', tool).
item_description(roued_pesked, 'A hand-knotted hemp fishing net mended many times over.').
item_value(roued_pesked, 10).
item_sell_value(roued_pesked, 6).
item_weight(roued_pesked, 3).
item_rarity(roued_pesked, common).
item_category(roued_pesked, tool).
item_tradeable(roued_pesked).
item_possessable(roued_pesked).
item_tag(roued_pesked, fishing).
item_tag(roued_pesked, maritime).

%% Kezeg Sec'h (Dried Seaweed)
item(kezeg_sec_h, 'Kezeg Sec''h', food).
item_description(kezeg_sec_h, 'Dried seaweed harvested from the rocky Armorican shore, used in soups and as fertilizer.').
item_value(kezeg_sec_h, 2).
item_sell_value(kezeg_sec_h, 1).
item_weight(kezeg_sec_h, 0.5).
item_rarity(kezeg_sec_h, common).
item_category(kezeg_sec_h, food).
item_stackable(kezeg_sec_h).
item_tradeable(kezeg_sec_h).
item_possessable(kezeg_sec_h).
item_tag(kezeg_sec_h, food).
item_tag(kezeg_sec_h, maritime).
item_max_stack(kezeg_sec_h, 30).

%% Biniou Kozh (Breton Bagpipe)
item(biniou_kozh, 'Biniou Kozh', collectible).
item_description(biniou_kozh, 'A small Breton bagpipe, traditionally played at pardons and fest-noz celebrations.').
item_value(biniou_kozh, 30).
item_sell_value(biniou_kozh, 20).
item_weight(biniou_kozh, 1.5).
item_rarity(biniou_kozh, rare).
item_category(biniou_kozh, instrument).
item_possessable(biniou_kozh).
item_tag(biniou_kozh, music).
item_tag(biniou_kozh, breton).
item_tag(biniou_kozh, cultural).

%% Bombard (Breton Oboe)
item(bombard, 'Bombard', collectible).
item_description(bombard, 'A double-reed oboe played in pairs with the biniou at every Breton gathering.').
item_value(bombard, 25).
item_sell_value(bombard, 15).
item_weight(bombard, 0.8).
item_rarity(bombard, uncommon).
item_category(bombard, instrument).
item_possessable(bombard).
item_tag(bombard, music).
item_tag(bombard, breton).

%% Krampouezh (Buckwheat Crêpe)
item(krampouezh, 'Krampouezh', food).
item_description(krampouezh, 'A thin buckwheat crêpe filled with egg and cheese, a Breton staple.').
item_value(krampouezh, 3).
item_sell_value(krampouezh, 2).
item_weight(krampouezh, 0.3).
item_rarity(krampouezh, common).
item_category(krampouezh, food).
item_stackable(krampouezh).
item_tradeable(krampouezh).
item_possessable(krampouezh).
item_tag(krampouezh, food).
item_tag(krampouezh, breton).
item_max_stack(krampouezh, 10).

%% Holen (Salt)
item(holen, 'Holen', material).
item_description(holen, 'Coarse sea salt harvested from the coastal salt pans of Guérande.').
item_value(holen, 6).
item_sell_value(holen, 4).
item_weight(holen, 2).
item_rarity(holen, common).
item_category(holen, raw_material).
item_stackable(holen).
item_tradeable(holen).
item_possessable(holen).
item_tag(holen, material).
item_tag(holen, food).
item_tag(holen, maritime).
item_max_stack(holen, 30).

%% Mell Houarn (Iron Hammer)
item(mell_houarn, 'Mell Houarn', tool).
item_description(mell_houarn, 'A heavy smith''s hammer forged at the Lann-Vraz smithy.').
item_value(mell_houarn, 12).
item_sell_value(mell_houarn, 7).
item_weight(mell_houarn, 3).
item_rarity(mell_houarn, common).
item_category(mell_houarn, tool).
item_tradeable(mell_houarn).
item_possessable(mell_houarn).
item_tag(mell_houarn, tool).
item_tag(mell_houarn, crafting).

%% Kaouenn Aour (Gold Torque)
item(kaouenn_aour, 'Kaouenn Aour', collectible).
item_description(kaouenn_aour, 'A twisted gold torque in the ancient Celtic style, found near the dolmen.').
item_value(kaouenn_aour, 100).
item_sell_value(kaouenn_aour, 75).
item_weight(kaouenn_aour, 0.5).
item_rarity(kaouenn_aour, rare).
item_category(kaouenn_aour, treasure).
item_possessable(kaouenn_aour).
item_tag(kaouenn_aour, celtic).
item_tag(kaouenn_aour, treasure).

%% Banniel Breizh (Banner of Brittany)
item(banniel_breizh, 'Banniel Breizh', quest).
item_description(banniel_breizh, 'A black-and-white ermine banner, the Gwenn-ha-Du, symbol of Breton identity.').
item_value(banniel_breizh, 50).
item_sell_value(banniel_breizh, 30).
item_weight(banniel_breizh, 1).
item_rarity(banniel_breizh, rare).
item_category(banniel_breizh, heraldic).
item_possessable(banniel_breizh).
item_tag(banniel_breizh, quest).
item_tag(banniel_breizh, breton).
item_tag(banniel_breizh, cultural).
