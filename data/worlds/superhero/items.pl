%% Insimul Items: Superhero
%% Source: data/worlds/superhero/items.pl
%% Created: 2026-04-03
%% Total: 16 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Hero Communicator
item(hero_communicator, 'Hero Communicator', equipment).
item_description(hero_communicator, 'A wrist-mounted device that connects to the Titan Tower secure network. Used for team coordination.').
item_value(hero_communicator, 500).
item_sell_value(hero_communicator, 0).
item_weight(hero_communicator, 0.2).
item_rarity(hero_communicator, rare).
item_category(hero_communicator, tech).
item_possessable(hero_communicator).
item_tag(hero_communicator, hero).
item_tag(hero_communicator, communication).

%% Grappling Hook
item(grappling_hook, 'Grappling Hook', equipment).
item_description(grappling_hook, 'A retractable titanium hook with carbon fiber cable. Standard rooftop traversal gear.').
item_value(grappling_hook, 150).
item_sell_value(grappling_hook, 75).
item_weight(grappling_hook, 1).
item_rarity(grappling_hook, uncommon).
item_category(grappling_hook, gear).
item_tradeable(grappling_hook).
item_possessable(grappling_hook).
item_tag(grappling_hook, traversal).
item_tag(grappling_hook, hero).

%% Power Dampener Cuffs
item(power_dampener_cuffs, 'Power Dampener Cuffs', equipment).
item_description(power_dampener_cuffs, 'Specialized restraints that suppress metahuman abilities. Standard issue for the Metahuman Division.').
item_value(power_dampener_cuffs, 800).
item_sell_value(power_dampener_cuffs, 0).
item_weight(power_dampener_cuffs, 1.5).
item_rarity(power_dampener_cuffs, rare).
item_category(power_dampener_cuffs, restraint).
item_possessable(power_dampener_cuffs).
item_tag(power_dampener_cuffs, law_enforcement).
item_tag(power_dampener_cuffs, metahuman).

%% First Aid Kit
item(first_aid_kit, 'First Aid Kit', consumable).
item_description(first_aid_kit, 'A compact medical kit with bandages, antiseptic, and adrenaline shots for emergency field treatment.').
item_value(first_aid_kit, 25).
item_sell_value(first_aid_kit, 12).
item_weight(first_aid_kit, 1).
item_rarity(first_aid_kit, common).
item_category(first_aid_kit, medical).
item_stackable(first_aid_kit).
item_tradeable(first_aid_kit).
item_possessable(first_aid_kit).
item_tag(first_aid_kit, medical).
item_tag(first_aid_kit, consumable).

%% Newspaper (Daily Sentinel)
item(daily_sentinel, 'Daily Sentinel', consumable).
item_description(daily_sentinel, 'The city daily paper. Contains news, editorials, and often the first public reports of metahuman incidents.').
item_value(daily_sentinel, 1).
item_sell_value(daily_sentinel, 0).
item_weight(daily_sentinel, 0.2).
item_rarity(daily_sentinel, common).
item_category(daily_sentinel, information).
item_stackable(daily_sentinel).
item_tradeable(daily_sentinel).
item_possessable(daily_sentinel).
item_tag(daily_sentinel, information).
item_tag(daily_sentinel, media).

%% Evidence Bag
item(evidence_bag, 'Evidence Bag', tool).
item_description(evidence_bag, 'A sealed forensic evidence container. Used by investigators and heroes to preserve crime scene material.').
item_value(evidence_bag, 5).
item_sell_value(evidence_bag, 2).
item_weight(evidence_bag, 0.1).
item_rarity(evidence_bag, common).
item_category(evidence_bag, investigation).
item_stackable(evidence_bag).
item_tradeable(evidence_bag).
item_possessable(evidence_bag).
item_tag(evidence_bag, investigation).
item_tag(evidence_bag, law_enforcement).

%% Smoke Bomb
item(smoke_bomb, 'Smoke Bomb', consumable).
item_description(smoke_bomb, 'A compact canister that releases thick obscuring smoke on impact. Favored by stealth operatives.').
item_value(smoke_bomb, 30).
item_sell_value(smoke_bomb, 15).
item_weight(smoke_bomb, 0.3).
item_rarity(smoke_bomb, uncommon).
item_category(smoke_bomb, tactical).
item_stackable(smoke_bomb).
item_tradeable(smoke_bomb).
item_possessable(smoke_bomb).
item_tag(smoke_bomb, tactical).
item_tag(smoke_bomb, stealth).

%% Quantum Shard
item(quantum_shard, 'Quantum Shard', material).
item_description(quantum_shard, 'A fragment of crystallized quantum energy. The source of many metahuman mutations and advanced technology.').
item_value(quantum_shard, 2000).
item_sell_value(quantum_shard, 1000).
item_weight(quantum_shard, 0.1).
item_rarity(quantum_shard, legendary).
item_category(quantum_shard, power_source).
item_possessable(quantum_shard).
item_tag(quantum_shard, power_source).
item_tag(quantum_shard, metahuman).

%% Bulletproof Vest
item(bulletproof_vest, 'Bulletproof Vest', equipment).
item_description(bulletproof_vest, 'A civilian-grade kevlar vest. Offers basic protection against conventional firearms.').
item_value(bulletproof_vest, 200).
item_sell_value(bulletproof_vest, 100).
item_weight(bulletproof_vest, 3).
item_rarity(bulletproof_vest, uncommon).
item_category(bulletproof_vest, armor).
item_tradeable(bulletproof_vest).
item_possessable(bulletproof_vest).
item_tag(bulletproof_vest, armor).
item_tag(bulletproof_vest, protection).

%% Skeleton Key Card
item(skeleton_key_card, 'Skeleton Key Card', tool).
item_description(skeleton_key_card, 'A hacked access card that can bypass most standard electronic locks. Illegal to possess.').
item_value(skeleton_key_card, 300).
item_sell_value(skeleton_key_card, 150).
item_weight(skeleton_key_card, 0).
item_rarity(skeleton_key_card, rare).
item_category(skeleton_key_card, infiltration).
item_tradeable(skeleton_key_card).
item_possessable(skeleton_key_card).
item_tag(skeleton_key_card, infiltration).
item_tag(skeleton_key_card, illegal).

%% Burner Phone
item(burner_phone, 'Burner Phone', tool).
item_description(burner_phone, 'A disposable prepaid phone. Untraceable and commonly used by criminals and informants alike.').
item_value(burner_phone, 10).
item_sell_value(burner_phone, 5).
item_weight(burner_phone, 0.1).
item_rarity(burner_phone, common).
item_category(burner_phone, communication).
item_stackable(burner_phone).
item_tradeable(burner_phone).
item_possessable(burner_phone).
item_tag(burner_phone, communication).
item_tag(burner_phone, underworld).

%% Hero Mask
item(hero_mask, 'Hero Mask', equipment).
item_description(hero_mask, 'A fitted domino mask that conceals the wearer identity. A symbol of the hero tradition.').
item_value(hero_mask, 20).
item_sell_value(hero_mask, 10).
item_weight(hero_mask, 0.1).
item_rarity(hero_mask, common).
item_category(hero_mask, disguise).
item_tradeable(hero_mask).
item_possessable(hero_mask).
item_tag(hero_mask, disguise).
item_tag(hero_mask, hero).

%% Toxic Vial
item(toxic_vial, 'Toxic Vial', consumable).
item_description(toxic_vial, 'A sealed glass vial containing a mutagenic compound. Dangerously unstable.').
item_value(toxic_vial, 500).
item_sell_value(toxic_vial, 250).
item_weight(toxic_vial, 0.2).
item_rarity(toxic_vial, rare).
item_category(toxic_vial, chemical).
item_possessable(toxic_vial).
item_tag(toxic_vial, chemical).
item_tag(toxic_vial, villain).

%% Police Scanner
item(police_scanner, 'Police Scanner', tool).
item_description(police_scanner, 'A radio tuned to police frequencies. Provides real-time updates on crimes in progress.').
item_value(police_scanner, 50).
item_sell_value(police_scanner, 25).
item_weight(police_scanner, 0.5).
item_rarity(police_scanner, uncommon).
item_category(police_scanner, surveillance).
item_tradeable(police_scanner).
item_possessable(police_scanner).
item_tag(police_scanner, surveillance).
item_tag(police_scanner, information).

%% Handcuffs
item(handcuffs, 'Handcuffs', equipment).
item_description(handcuffs, 'Standard issue steel handcuffs. Effective against non-powered individuals.').
item_value(handcuffs, 15).
item_sell_value(handcuffs, 7).
item_weight(handcuffs, 0.3).
item_rarity(handcuffs, common).
item_category(handcuffs, restraint).
item_tradeable(handcuffs).
item_possessable(handcuffs).
item_tag(handcuffs, law_enforcement).
item_tag(handcuffs, restraint).

%% Energy Drink
item(energy_drink, 'Energy Drink', consumable).
item_description(energy_drink, 'A caffeinated beverage popular with late-night patrol heroes and overworked detectives.').
item_value(energy_drink, 3).
item_sell_value(energy_drink, 1).
item_weight(energy_drink, 0.3).
item_rarity(energy_drink, common).
item_category(energy_drink, food_drink).
item_stackable(energy_drink).
item_tradeable(energy_drink).
item_possessable(energy_drink).
item_tag(energy_drink, consumable).
item_tag(energy_drink, food_drink).
