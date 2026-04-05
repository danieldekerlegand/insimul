%% Insimul Items: Historical Victorian
%% Source: data/worlds/historical_victorian/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Pocket Watch
item(pocket_watch, 'Pocket Watch', equipment).
item_description(pocket_watch, 'A brass pocket watch on a chain, essential for any respectable gentleman. Keeps reliable time to within a minute per day.').
item_value(pocket_watch, 25).
item_sell_value(pocket_watch, 12).
item_weight(pocket_watch, 1).
item_rarity(pocket_watch, common).
item_category(pocket_watch, accessory).
item_tradeable(pocket_watch).
item_possessable(pocket_watch).
item_tag(pocket_watch, gentleman).
item_tag(pocket_watch, timekeeping).

%% Top Hat
item(top_hat, 'Top Hat', equipment).
item_description(top_hat, 'A tall black silk top hat, the mark of a gentleman of standing. Essential for formal occasions and daily promenades.').
item_value(top_hat, 30).
item_sell_value(top_hat, 15).
item_weight(top_hat, 1).
item_rarity(top_hat, common).
item_category(top_hat, clothing).
item_tradeable(top_hat).
item_possessable(top_hat).
item_tag(top_hat, gentleman).
item_tag(top_hat, fashion).

%% Walking Cane
item(walking_cane, 'Walking Cane', equipment).
item_description(walking_cane, 'A polished mahogany walking cane with a silver handle. A symbol of status and a practical aid for navigating cobblestone streets.').
item_value(walking_cane, 20).
item_sell_value(walking_cane, 10).
item_weight(walking_cane, 2).
item_rarity(walking_cane, common).
item_category(walking_cane, accessory).
item_tradeable(walking_cane).
item_possessable(walking_cane).
item_tag(walking_cane, gentleman).
item_tag(walking_cane, weapon).

%% Daguerreotype Camera
item(daguerreotype_camera, 'Daguerreotype Camera', equipment).
item_description(daguerreotype_camera, 'An early photographic apparatus using silver-plated copper plates. Heavy and delicate, it captures remarkably sharp images with long exposure times.').
item_value(daguerreotype_camera, 150).
item_sell_value(daguerreotype_camera, 75).
item_weight(daguerreotype_camera, 10).
item_rarity(daguerreotype_camera, rare).
item_category(daguerreotype_camera, tool).
item_tradeable(daguerreotype_camera).
item_possessable(daguerreotype_camera).
item_tag(daguerreotype_camera, photography).
item_tag(daguerreotype_camera, invention).

%% Telegraph Key
item(telegraph_key, 'Telegraph Key', equipment).
item_description(telegraph_key, 'A brass Morse telegraph key for sending messages along the wire. The fastest communication technology of the age.').
item_value(telegraph_key, 40).
item_sell_value(telegraph_key, 20).
item_weight(telegraph_key, 3).
item_rarity(telegraph_key, uncommon).
item_category(telegraph_key, tool).
item_tradeable(telegraph_key).
item_possessable(telegraph_key).
item_tag(telegraph_key, communication).
item_tag(telegraph_key, invention).

%% Gas Lamp
item(gas_lamp, 'Gas Lamp', equipment).
item_description(gas_lamp, 'A portable gas lamp with a glass chimney. Provides steady illumination for navigating the fog-shrouded streets after dark.').
item_value(gas_lamp, 10).
item_sell_value(gas_lamp, 5).
item_weight(gas_lamp, 3).
item_rarity(gas_lamp, common).
item_category(gas_lamp, tool).
item_tradeable(gas_lamp).
item_possessable(gas_lamp).
item_tag(gas_lamp, illumination).
item_tag(gas_lamp, utility).

%% Calling Card Case
item(calling_card_case, 'Calling Card Case', equipment).
item_description(calling_card_case, 'A silver case containing engraved visiting cards. Leaving ones card is the proper way to announce a social call.').
item_value(calling_card_case, 15).
item_sell_value(calling_card_case, 7).
item_weight(calling_card_case, 1).
item_rarity(calling_card_case, common).
item_category(calling_card_case, accessory).
item_tradeable(calling_card_case).
item_possessable(calling_card_case).
item_tag(calling_card_case, etiquette).
item_tag(calling_card_case, social).

%% Laudanum Bottle
item(laudanum_bottle, 'Laudanum Bottle', consumable).
item_description(laudanum_bottle, 'A small brown bottle of tincture of opium dissolved in alcohol. Widely used as a painkiller and sedative, though dangerously addictive.').
item_value(laudanum_bottle, 5).
item_sell_value(laudanum_bottle, 3).
item_weight(laudanum_bottle, 1).
item_rarity(laudanum_bottle, common).
item_category(laudanum_bottle, medicine).
item_stackable(laudanum_bottle).
item_tradeable(laudanum_bottle).
item_possessable(laudanum_bottle).
item_tag(laudanum_bottle, drug).
item_tag(laudanum_bottle, medicine).

%% Broadsheet Newspaper
item(broadsheet_newspaper, 'Broadsheet Newspaper', consumable).
item_description(broadsheet_newspaper, 'A copy of the Daily Sentinel, printed on large paper sheets. Contains news of Parliament, empire dispatches, and local affairs.').
item_value(broadsheet_newspaper, 1).
item_sell_value(broadsheet_newspaper, 0).
item_weight(broadsheet_newspaper, 1).
item_rarity(broadsheet_newspaper, common).
item_category(broadsheet_newspaper, reading).
item_stackable(broadsheet_newspaper).
item_tradeable(broadsheet_newspaper).
item_possessable(broadsheet_newspaper).
item_tag(broadsheet_newspaper, news).
item_tag(broadsheet_newspaper, information).

%% Monocle
item(monocle, 'Monocle', equipment).
item_description(monocle, 'A single corrective lens worn over one eye, suspended by a fine chain. An affectation of the upper classes.').
item_value(monocle, 20).
item_sell_value(monocle, 10).
item_weight(monocle, 1).
item_rarity(monocle, uncommon).
item_category(monocle, accessory).
item_tradeable(monocle).
item_possessable(monocle).
item_tag(monocle, gentleman).
item_tag(monocle, fashion).

%% Coal Scuttle
item(coal_scuttle, 'Coal Scuttle', equipment).
item_description(coal_scuttle, 'A metal bucket for carrying coal to feed the hearth. The working classes carry one daily; the gentry never touch one.').
item_value(coal_scuttle, 3).
item_sell_value(coal_scuttle, 1).
item_weight(coal_scuttle, 5).
item_rarity(coal_scuttle, common).
item_category(coal_scuttle, tool).
item_tradeable(coal_scuttle).
item_possessable(coal_scuttle).
item_tag(coal_scuttle, working_class).
item_tag(coal_scuttle, utility).

%% Parasol
item(parasol, 'Parasol', equipment).
item_description(parasol, 'A decorative silk umbrella carried by ladies of quality. Protects a pale complexion from the sun -- a mark of gentility.').
item_value(parasol, 18).
item_sell_value(parasol, 9).
item_weight(parasol, 1).
item_rarity(parasol, common).
item_category(parasol, accessory).
item_tradeable(parasol).
item_possessable(parasol).
item_tag(parasol, lady).
item_tag(parasol, fashion).

%% Snuff Box
item(snuff_box, 'Snuff Box', consumable).
item_description(snuff_box, 'An enamelled tin box containing finely ground tobacco for nasal inhalation. A common vice among all classes.').
item_value(snuff_box, 8).
item_sell_value(snuff_box, 4).
item_weight(snuff_box, 1).
item_rarity(snuff_box, common).
item_category(snuff_box, vice).
item_stackable(snuff_box).
item_tradeable(snuff_box).
item_possessable(snuff_box).
item_tag(snuff_box, tobacco).
item_tag(snuff_box, social).

%% Letter of Introduction
item(letter_of_introduction, 'Letter of Introduction', quest_item).
item_description(letter_of_introduction, 'A sealed letter from a person of standing, introducing the bearer to polite society. Opens doors that would otherwise remain firmly shut.').
item_value(letter_of_introduction, 0).
item_sell_value(letter_of_introduction, 0).
item_weight(letter_of_introduction, 1).
item_rarity(letter_of_introduction, uncommon).
item_category(letter_of_introduction, document).
item_possessable(letter_of_introduction).
item_tag(letter_of_introduction, social).
item_tag(letter_of_introduction, quest).

%% Magnifying Glass
item(magnifying_glass, 'Magnifying Glass', equipment).
item_description(magnifying_glass, 'A large lens set in a brass frame. Essential for examining evidence, reading fine print, and scientific inquiry.').
item_value(magnifying_glass, 12).
item_sell_value(magnifying_glass, 6).
item_weight(magnifying_glass, 1).
item_rarity(magnifying_glass, common).
item_category(magnifying_glass, tool).
item_tradeable(magnifying_glass).
item_possessable(magnifying_glass).
item_tag(magnifying_glass, investigation).
item_tag(magnifying_glass, science).

%% Steam Engine Schematic
item(steam_engine_schematic, 'Steam Engine Schematic', quest_item).
item_description(steam_engine_schematic, 'Detailed technical drawings for an improved steam engine design. Could revolutionize factory output or be worth a fortune to the right buyer.').
item_value(steam_engine_schematic, 200).
item_sell_value(steam_engine_schematic, 100).
item_weight(steam_engine_schematic, 1).
item_rarity(steam_engine_schematic, legendary).
item_category(steam_engine_schematic, document).
item_possessable(steam_engine_schematic).
item_tag(steam_engine_schematic, invention).
item_tag(steam_engine_schematic, quest).

%% Workhouse Gruel Bowl
item(workhouse_gruel, 'Workhouse Gruel', consumable).
item_description(workhouse_gruel, 'A thin bowl of watery oatmeal. The daily ration of the destitute poor in the workhouse. Barely sustains life.').
item_value(workhouse_gruel, 0).
item_sell_value(workhouse_gruel, 0).
item_weight(workhouse_gruel, 1).
item_rarity(workhouse_gruel, common).
item_category(workhouse_gruel, food_drink).
item_stackable(workhouse_gruel).
item_possessable(workhouse_gruel).
item_tag(workhouse_gruel, poverty).
item_tag(workhouse_gruel, food).

%% Opium Pipe
item(opium_pipe, 'Opium Pipe', equipment).
item_description(opium_pipe, 'A long bamboo pipe with a ceramic bowl, used for smoking opium in the dens of the docklands. A symbol of the empires darker trade.').
item_value(opium_pipe, 10).
item_sell_value(opium_pipe, 5).
item_weight(opium_pipe, 1).
item_rarity(opium_pipe, uncommon).
item_category(opium_pipe, vice).
item_tradeable(opium_pipe).
item_possessable(opium_pipe).
item_tag(opium_pipe, drug).
item_tag(opium_pipe, docklands).
