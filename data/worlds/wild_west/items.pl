%% Insimul Items: Wild West -- Redemption Gulch
%% Source: data/worlds/wild_west/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Colt Peacemaker
item(colt_peacemaker, 'Colt Peacemaker', weapon).
item_description(colt_peacemaker, 'The classic six-shooter of the American West. Reliable, accurate, and feared by outlaws and lawmen alike.').
item_value(colt_peacemaker, 75).
item_sell_value(colt_peacemaker, 35).
item_weight(colt_peacemaker, 2.5).
item_rarity(colt_peacemaker, common).
item_category(colt_peacemaker, weapon).
item_tradeable(colt_peacemaker).
item_possessable(colt_peacemaker).
item_tag(colt_peacemaker, firearm).
item_tag(colt_peacemaker, sidearm).

%% Winchester Rifle
item(winchester_rifle, 'Winchester Rifle', weapon).
item_description(winchester_rifle, 'A lever-action repeating rifle. Essential for hunting, defense, and long-range engagements on the frontier.').
item_value(winchester_rifle, 120).
item_sell_value(winchester_rifle, 60).
item_weight(winchester_rifle, 4).
item_rarity(winchester_rifle, uncommon).
item_category(winchester_rifle, weapon).
item_tradeable(winchester_rifle).
item_possessable(winchester_rifle).
item_tag(winchester_rifle, firearm).
item_tag(winchester_rifle, rifle).

%% Lasso
item(lasso, 'Lasso', tool).
item_description(lasso, 'A braided rawhide rope for roping cattle, horses, or the occasional outlaw.').
item_value(lasso, 8).
item_sell_value(lasso, 4).
item_weight(lasso, 1.5).
item_rarity(lasso, common).
item_category(lasso, tool).
item_tradeable(lasso).
item_possessable(lasso).
item_tag(lasso, ranching).
item_tag(lasso, tool).

%% Deputy Badge
item(deputy_badge, 'Deputy Badge', quest_item).
item_description(deputy_badge, 'A tin star marking the bearer as a duly appointed deputy of Redemption Gulch.').
item_value(deputy_badge, 0).
item_sell_value(deputy_badge, 0).
item_weight(deputy_badge, 0.1).
item_rarity(deputy_badge, rare).
item_category(deputy_badge, authority).
item_possessable(deputy_badge).
item_tag(deputy_badge, law).
item_tag(deputy_badge, authority).

%% Dynamite Stick
item(dynamite_stick, 'Dynamite Stick', explosive).
item_description(dynamite_stick, 'A single stick of Nobel dynamite. Used in mining but also favored by outlaws for blasting open safes.').
item_value(dynamite_stick, 15).
item_sell_value(dynamite_stick, 8).
item_weight(dynamite_stick, 0.5).
item_rarity(dynamite_stick, uncommon).
item_category(dynamite_stick, explosive).
item_stackable(dynamite_stick).
item_tradeable(dynamite_stick).
item_possessable(dynamite_stick).
item_tag(dynamite_stick, mining).
item_tag(dynamite_stick, explosive).

%% Whiskey Bottle
item(whiskey_bottle, 'Whiskey Bottle', consumable).
item_description(whiskey_bottle, 'A bottle of rotgut whiskey from the Silver Spur Saloon. Burns going down but steadies the nerves.').
item_value(whiskey_bottle, 5).
item_sell_value(whiskey_bottle, 2).
item_weight(whiskey_bottle, 1).
item_rarity(whiskey_bottle, common).
item_category(whiskey_bottle, food_drink).
item_stackable(whiskey_bottle).
item_tradeable(whiskey_bottle).
item_possessable(whiskey_bottle).
item_tag(whiskey_bottle, beverage).
item_tag(whiskey_bottle, saloon).

%% Gold Nugget
item(gold_nugget, 'Gold Nugget', treasure).
item_description(gold_nugget, 'A rough nugget of placer gold. Worth a small fortune at the assay office.').
item_value(gold_nugget, 100).
item_sell_value(gold_nugget, 90).
item_weight(gold_nugget, 0.3).
item_rarity(gold_nugget, rare).
item_category(gold_nugget, treasure).
item_stackable(gold_nugget).
item_tradeable(gold_nugget).
item_possessable(gold_nugget).
item_tag(gold_nugget, mining).
item_tag(gold_nugget, valuable).

%% Silver Ore
item(silver_ore, 'Silver Ore', crafting_material).
item_description(silver_ore, 'Raw silver ore from the Silver Lode Mine. Needs smelting before it has real value.').
item_value(silver_ore, 25).
item_sell_value(silver_ore, 15).
item_weight(silver_ore, 3).
item_rarity(silver_ore, uncommon).
item_category(silver_ore, crafting).
item_stackable(silver_ore).
item_tradeable(silver_ore).
item_possessable(silver_ore).
item_tag(silver_ore, mining).
item_tag(silver_ore, raw_material).

%% Wanted Poster
item(wanted_poster, 'Wanted Poster', quest_item).
item_description(wanted_poster, 'A printed poster offering a reward for the capture of Jack Ketchum, dead or alive.').
item_value(wanted_poster, 0).
item_sell_value(wanted_poster, 0).
item_weight(wanted_poster, 0.1).
item_rarity(wanted_poster, common).
item_category(wanted_poster, quest).
item_possessable(wanted_poster).
item_tag(wanted_poster, law).
item_tag(wanted_poster, bounty).

%% Saddlebag
item(saddlebag, 'Saddlebag', container).
item_description(saddlebag, 'Sturdy leather saddlebags for carrying supplies on horseback. Increases carrying capacity.').
item_value(saddlebag, 20).
item_sell_value(saddlebag, 10).
item_weight(saddlebag, 2).
item_rarity(saddlebag, common).
item_category(saddlebag, equipment).
item_tradeable(saddlebag).
item_possessable(saddlebag).
item_tag(saddlebag, horse).
item_tag(saddlebag, storage).

%% Bowie Knife
item(bowie_knife, 'Bowie Knife', weapon).
item_description(bowie_knife, 'A large fixed-blade knife. Useful for hunting, camping, and close-quarters defense.').
item_value(bowie_knife, 15).
item_sell_value(bowie_knife, 7).
item_weight(bowie_knife, 0.8).
item_rarity(bowie_knife, common).
item_category(bowie_knife, weapon).
item_tradeable(bowie_knife).
item_possessable(bowie_knife).
item_tag(bowie_knife, melee).
item_tag(bowie_knife, tool).

%% Canteen
item(canteen, 'Canteen', tool).
item_description(canteen, 'A tin canteen for carrying water. Essential for surviving the desert heat between settlements.').
item_value(canteen, 3).
item_sell_value(canteen, 1).
item_weight(canteen, 0.5).
item_rarity(canteen, common).
item_category(canteen, survival).
item_tradeable(canteen).
item_possessable(canteen).
item_tag(canteen, survival).
item_tag(canteen, travel).

%% Harmonica
item(harmonica, 'Harmonica', misc).
item_description(harmonica, 'A small mouth organ. Perfect for playing lonesome tunes around the campfire at night.').
item_value(harmonica, 5).
item_sell_value(harmonica, 2).
item_weight(harmonica, 0.2).
item_rarity(harmonica, common).
item_category(harmonica, entertainment).
item_tradeable(harmonica).
item_possessable(harmonica).
item_tag(harmonica, music).
item_tag(harmonica, morale).

%% Spurs
item(spurs, 'Spurs', accessory).
item_description(spurs, 'Silver-plated riding spurs. Helps control a horse and announces your arrival with every step.').
item_value(spurs, 12).
item_sell_value(spurs, 6).
item_weight(spurs, 0.3).
item_rarity(spurs, common).
item_category(spurs, equipment).
item_tradeable(spurs).
item_possessable(spurs).
item_tag(spurs, horse).
item_tag(spurs, clothing).

%% Medicine Pouch
item(medicine_pouch, 'Medicine Pouch', consumable).
item_description(medicine_pouch, 'A leather pouch containing bandages, laudanum, and basic medical supplies from Doc Whitfield.').
item_value(medicine_pouch, 10).
item_sell_value(medicine_pouch, 5).
item_weight(medicine_pouch, 0.5).
item_rarity(medicine_pouch, common).
item_category(medicine_pouch, medical).
item_stackable(medicine_pouch).
item_tradeable(medicine_pouch).
item_possessable(medicine_pouch).
item_tag(medicine_pouch, healing).
item_tag(medicine_pouch, medical).

%% Telegraph Form
item(telegraph_form, 'Telegraph Form', quest_item).
item_description(telegraph_form, 'A blank Western Union telegraph form. Used to send urgent messages along the wire.').
item_value(telegraph_form, 1).
item_sell_value(telegraph_form, 0).
item_weight(telegraph_form, 0.05).
item_rarity(telegraph_form, common).
item_category(telegraph_form, communication).
item_stackable(telegraph_form).
item_possessable(telegraph_form).
item_tag(telegraph_form, communication).
item_tag(telegraph_form, railroad).

%% Poker Chips
item(poker_chips, 'Poker Chips', misc).
item_description(poker_chips, 'A stack of clay poker chips from the Silver Spur Saloon. Good for a few hands of five-card draw.').
item_value(poker_chips, 10).
item_sell_value(poker_chips, 5).
item_weight(poker_chips, 0.3).
item_rarity(poker_chips, common).
item_category(poker_chips, entertainment).
item_stackable(poker_chips).
item_tradeable(poker_chips).
item_possessable(poker_chips).
item_tag(poker_chips, gambling).
item_tag(poker_chips, saloon).

%% Stagecoach Ticket
item(stagecoach_ticket, 'Stagecoach Ticket', quest_item).
item_description(stagecoach_ticket, 'A one-way ticket on the Overland Stage. Good for travel between settlements in the territory.').
item_value(stagecoach_ticket, 8).
item_sell_value(stagecoach_ticket, 4).
item_weight(stagecoach_ticket, 0.05).
item_rarity(stagecoach_ticket, common).
item_category(stagecoach_ticket, travel).
item_stackable(stagecoach_ticket).
item_tradeable(stagecoach_ticket).
item_possessable(stagecoach_ticket).
item_tag(stagecoach_ticket, travel).
item_tag(stagecoach_ticket, transit).
