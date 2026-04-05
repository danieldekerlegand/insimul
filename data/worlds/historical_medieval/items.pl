%% Insimul Items: Historical Medieval Europe
%% Source: data/worlds/historical_medieval/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Chainmail Hauberk
item(chainmail_hauberk, 'Chainmail Hauberk', equipment).
item_description(chainmail_hauberk, 'A shirt of interlocking iron rings extending to the knees. Standard protection for men-at-arms.').
item_value(chainmail_hauberk, 200).
item_sell_value(chainmail_hauberk, 120).
item_weight(chainmail_hauberk, 15).
item_rarity(chainmail_hauberk, uncommon).
item_category(chainmail_hauberk, armor).
item_tradeable(chainmail_hauberk).
item_possessable(chainmail_hauberk).
item_tag(chainmail_hauberk, military).
item_tag(chainmail_hauberk, armor).

%% Illuminated Manuscript
item(illuminated_manuscript, 'Illuminated Manuscript', tool).
item_description(illuminated_manuscript, 'A vellum codex decorated with gold leaf and vivid pigments, painstakingly copied by monks.').
item_value(illuminated_manuscript, 500).
item_sell_value(illuminated_manuscript, 350).
item_weight(illuminated_manuscript, 3).
item_rarity(illuminated_manuscript, rare).
item_category(illuminated_manuscript, education).
item_tradeable(illuminated_manuscript).
item_possessable(illuminated_manuscript).
item_tag(illuminated_manuscript, religious).
item_tag(illuminated_manuscript, craft).

%% Holy Relic
item(holy_relic, 'Holy Relic', accessory).
item_description(holy_relic, 'A bone fragment said to belong to a saint, housed in a small silver reliquary.').
item_value(holy_relic, 800).
item_sell_value(holy_relic, 500).
item_weight(holy_relic, 0.5).
item_rarity(holy_relic, legendary).
item_category(holy_relic, religious).
item_tradeable(holy_relic).
item_possessable(holy_relic).
item_tag(holy_relic, religious).
item_tag(holy_relic, sacred).

%% Mead Flagon
item(mead_flagon, 'Mead Flagon', consumable).
item_description(mead_flagon, 'A clay flagon of honey mead, brewed by the monastery.').
item_value(mead_flagon, 5).
item_sell_value(mead_flagon, 3).
item_weight(mead_flagon, 2).
item_rarity(mead_flagon, common).
item_category(mead_flagon, food_drink).
item_stackable(mead_flagon).
item_tradeable(mead_flagon).
item_possessable(mead_flagon).
item_tag(mead_flagon, beverage).
item_tag(mead_flagon, cultural).

%% Heraldic Shield
item(heraldic_shield, 'Heraldic Shield', equipment).
item_description(heraldic_shield, 'A kite shield painted with the arms of house de Ashworth: a silver tower on a blue field.').
item_value(heraldic_shield, 150).
item_sell_value(heraldic_shield, 90).
item_weight(heraldic_shield, 8).
item_rarity(heraldic_shield, uncommon).
item_category(heraldic_shield, armor).
item_tradeable(heraldic_shield).
item_possessable(heraldic_shield).
item_tag(heraldic_shield, military).
item_tag(heraldic_shield, heraldry).

%% Jousting Lance
item(jousting_lance, 'Jousting Lance', equipment).
item_description(jousting_lance, 'A long wooden lance tipped with a blunted iron coronel, used in tournament jousts.').
item_value(jousting_lance, 80).
item_sell_value(jousting_lance, 45).
item_weight(jousting_lance, 10).
item_rarity(jousting_lance, uncommon).
item_category(jousting_lance, weapon).
item_tradeable(jousting_lance).
item_possessable(jousting_lance).
item_tag(jousting_lance, military).
item_tag(jousting_lance, tournament).

%% Longbow
item(longbow, 'Longbow', equipment).
item_description(longbow, 'A six-foot yew bow capable of piercing armor at two hundred paces.').
item_value(longbow, 60).
item_sell_value(longbow, 35).
item_weight(longbow, 3).
item_rarity(longbow, common).
item_category(longbow, weapon).
item_tradeable(longbow).
item_possessable(longbow).
item_tag(longbow, military).
item_tag(longbow, ranged).

%% Iron Horseshoes
item(iron_horseshoes, 'Iron Horseshoes', material).
item_description(iron_horseshoes, 'A set of four hand-forged horseshoes, essential for any destrier or palfrey.').
item_value(iron_horseshoes, 10).
item_sell_value(iron_horseshoes, 6).
item_weight(iron_horseshoes, 4).
item_rarity(iron_horseshoes, common).
item_category(iron_horseshoes, craft).
item_stackable(iron_horseshoes).
item_tradeable(iron_horseshoes).
item_possessable(iron_horseshoes).
item_tag(iron_horseshoes, smithing).
item_tag(iron_horseshoes, equestrian).

%% Wool Bale
item(wool_bale, 'Wool Bale', material).
item_description(wool_bale, 'A tightly bound bale of English wool, the backbone of medieval trade.').
item_value(wool_bale, 25).
item_sell_value(wool_bale, 18).
item_weight(wool_bale, 20).
item_rarity(wool_bale, common).
item_category(wool_bale, trade_goods).
item_stackable(wool_bale).
item_tradeable(wool_bale).
item_possessable(wool_bale).
item_tag(wool_bale, trade).
item_tag(wool_bale, textile).

%% Pilgrim Badge
item(pilgrim_badge, 'Pilgrim Badge', accessory).
item_description(pilgrim_badge, 'A small pewter badge depicting a saint, proof of a completed pilgrimage.').
item_value(pilgrim_badge, 3).
item_sell_value(pilgrim_badge, 1).
item_weight(pilgrim_badge, 0.1).
item_rarity(pilgrim_badge, common).
item_category(pilgrim_badge, accessory).
item_tradeable(pilgrim_badge).
item_possessable(pilgrim_badge).
item_tag(pilgrim_badge, religious).
item_tag(pilgrim_badge, travel).

%% Quill and Ink
item(quill_and_ink, 'Quill and Ink', tool).
item_description(quill_and_ink, 'A goose-feather quill and a pot of iron gall ink for writing on vellum.').
item_value(quill_and_ink, 8).
item_sell_value(quill_and_ink, 4).
item_weight(quill_and_ink, 0.3).
item_rarity(quill_and_ink, common).
item_category(quill_and_ink, craft).
item_tradeable(quill_and_ink).
item_possessable(quill_and_ink).
item_tag(quill_and_ink, writing).
item_tag(quill_and_ink, education).

%% Salt Block
item(salt_block, 'Salt Block', consumable).
item_description(salt_block, 'A precious block of sea salt used to preserve meats through winter. Worth its weight in silver.').
item_value(salt_block, 30).
item_sell_value(salt_block, 20).
item_weight(salt_block, 5).
item_rarity(salt_block, uncommon).
item_category(salt_block, food_drink).
item_stackable(salt_block).
item_tradeable(salt_block).
item_possessable(salt_block).
item_tag(salt_block, trade).
item_tag(salt_block, preservation).

%% Tallow Candle
item(tallow_candle, 'Tallow Candle', consumable).
item_description(tallow_candle, 'A smoky candle made from animal fat, the common light source for peasant homes.').
item_value(tallow_candle, 1).
item_sell_value(tallow_candle, 0).
item_weight(tallow_candle, 0.3).
item_rarity(tallow_candle, common).
item_category(tallow_candle, household).
item_stackable(tallow_candle).
item_tradeable(tallow_candle).
item_possessable(tallow_candle).
item_tag(tallow_candle, light).

%% Beeswax Candle
item(beeswax_candle, 'Beeswax Candle', consumable).
item_description(beeswax_candle, 'A fine candle of beeswax that burns cleanly, reserved for churches and noble halls.').
item_value(beeswax_candle, 8).
item_sell_value(beeswax_candle, 5).
item_weight(beeswax_candle, 0.3).
item_rarity(beeswax_candle, uncommon).
item_category(beeswax_candle, household).
item_stackable(beeswax_candle).
item_tradeable(beeswax_candle).
item_possessable(beeswax_candle).
item_tag(beeswax_candle, light).
item_tag(beeswax_candle, luxury).

%% Rosary
item(rosary, 'Rosary', accessory).
item_description(rosary, 'A string of wooden beads used for counting prayers, blessed by the abbot.').
item_value(rosary, 5).
item_sell_value(rosary, 2).
item_weight(rosary, 0.1).
item_rarity(rosary, common).
item_category(rosary, accessory).
item_tradeable(rosary).
item_possessable(rosary).
item_tag(rosary, religious).
item_tag(rosary, devotion).

%% Loaf of Bread
item(bread_loaf, 'Loaf of Bread', consumable).
item_description(bread_loaf, 'A round loaf of coarse rye bread, the daily staple of peasants and monks alike.').
item_value(bread_loaf, 1).
item_sell_value(bread_loaf, 0).
item_weight(bread_loaf, 1).
item_rarity(bread_loaf, common).
item_category(bread_loaf, food_drink).
item_stackable(bread_loaf).
item_tradeable(bread_loaf).
item_possessable(bread_loaf).
item_tag(bread_loaf, food).

%% Venison Haunch
item(venison_haunch, 'Venison Haunch', consumable).
item_description(venison_haunch, 'A roasted haunch of deer, a luxury reserved for the lord and his table.').
item_value(venison_haunch, 15).
item_sell_value(venison_haunch, 8).
item_weight(venison_haunch, 4).
item_rarity(venison_haunch, uncommon).
item_category(venison_haunch, food_drink).
item_tradeable(venison_haunch).
item_possessable(venison_haunch).
item_tag(venison_haunch, food).
item_tag(venison_haunch, luxury).

%% Vellum Sheet
item(vellum_sheet, 'Vellum Sheet', material).
item_description(vellum_sheet, 'A sheet of prepared calfskin, the writing surface for manuscripts and charters.').
item_value(vellum_sheet, 12).
item_sell_value(vellum_sheet, 7).
item_weight(vellum_sheet, 0.2).
item_rarity(vellum_sheet, uncommon).
item_category(vellum_sheet, craft).
item_stackable(vellum_sheet).
item_tradeable(vellum_sheet).
item_possessable(vellum_sheet).
item_tag(vellum_sheet, writing).
item_tag(vellum_sheet, craft).

%% Sack of Grain
item(grain_sack, 'Sack of Grain', material).
item_description(grain_sack, 'A heavy sack of milled grain owed as tithe to the lord or destined for the mill.').
item_value(grain_sack, 4).
item_sell_value(grain_sack, 2).
item_weight(grain_sack, 25).
item_rarity(grain_sack, common).
item_category(grain_sack, food_drink).
item_stackable(grain_sack).
item_tradeable(grain_sack).
item_possessable(grain_sack).
item_tag(grain_sack, agriculture).
item_tag(grain_sack, tithe).

%% Herbal Poultice
item(herbal_poultice, 'Herbal Poultice', consumable).
item_description(herbal_poultice, 'A compress of monastery-grown herbs — yarrow, comfrey, and chamomile — used to treat wounds.').
item_value(herbal_poultice, 6).
item_sell_value(herbal_poultice, 3).
item_weight(herbal_poultice, 0.2).
item_rarity(herbal_poultice, common).
item_category(herbal_poultice, health).
item_stackable(herbal_poultice).
item_tradeable(herbal_poultice).
item_possessable(herbal_poultice).
item_tag(herbal_poultice, medicine).
item_tag(herbal_poultice, herbal).
