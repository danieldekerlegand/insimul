%% Insimul Items: Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% ═══════════════════════════════════════════════════════════
%% Cyberware -- implants and augmentations
%% ═══════════════════════════════════════════════════════════

%% Kiroshi Optical Implant
item(kiroshi_optics, 'Kiroshi Optical Implant', cyberware).
item_description(kiroshi_optics, 'Military-grade optical implant with thermal imaging, zoom magnification, and facial recognition overlay. Standard issue for corpo security.').
item_value(kiroshi_optics, 500).
item_sell_value(kiroshi_optics, 250).
item_weight(kiroshi_optics, 0.1).
item_rarity(kiroshi_optics, rare).
item_category(kiroshi_optics, cyberware).
item_tradeable(kiroshi_optics).
item_possessable(kiroshi_optics).
item_tag(kiroshi_optics, implant).
item_tag(kiroshi_optics, optical).

%% Reflex Booster
item(reflex_booster, 'Reflex Booster', cyberware).
item_description(reflex_booster, 'Spinal implant that accelerates neural signal propagation. Grants superhuman reaction times but causes chronic muscle spasms without regular maintenance.').
item_value(reflex_booster, 800).
item_sell_value(reflex_booster, 400).
item_weight(reflex_booster, 0.3).
item_rarity(reflex_booster, rare).
item_category(reflex_booster, cyberware).
item_tradeable(reflex_booster).
item_possessable(reflex_booster).
item_tag(reflex_booster, implant).
item_tag(reflex_booster, combat).

%% Cyberdeck (Netrunner Interface)
item(cyberdeck, 'Cyberdeck', cyberware).
item_description(cyberdeck, 'Cranial-mounted computing platform for interfacing with the Net. Essential for any netrunner. This model supports four daemon slots.').
item_value(cyberdeck, 1200).
item_sell_value(cyberdeck, 600).
item_weight(cyberdeck, 0.5).
item_rarity(cyberdeck, rare).
item_category(cyberdeck, cyberware).
item_tradeable(cyberdeck).
item_possessable(cyberdeck).
item_tag(cyberdeck, implant).
item_tag(cyberdeck, hacking).

%% Gorilla Arms
item(gorilla_arms, 'Gorilla Arms', cyberware).
item_description(gorilla_arms, 'Hydraulic-actuated arm replacements with reinforced titanium alloy skeleton. Can punch through reinforced doors and lift extreme weight.').
item_value(gorilla_arms, 1500).
item_sell_value(gorilla_arms, 750).
item_weight(gorilla_arms, 5.0).
item_rarity(gorilla_arms, epic).
item_category(gorilla_arms, cyberware).
item_tradeable(gorilla_arms).
item_possessable(gorilla_arms).
item_tag(gorilla_arms, implant).
item_tag(gorilla_arms, combat).

%% Subdermal Armor
item(subdermal_armor, 'Subdermal Armor', cyberware).
item_description(subdermal_armor, 'Nano-woven ballistic mesh implanted beneath the skin. Provides protection against small-arms fire without visible modification.').
item_value(subdermal_armor, 700).
item_sell_value(subdermal_armor, 350).
item_weight(subdermal_armor, 1.0).
item_rarity(subdermal_armor, uncommon).
item_category(subdermal_armor, cyberware).
item_tradeable(subdermal_armor).
item_possessable(subdermal_armor).
item_tag(subdermal_armor, implant).
item_tag(subdermal_armor, defensive).

%% ═══════════════════════════════════════════════════════════
%% Software / ICE Breakers -- hacking tools
%% ═══════════════════════════════════════════════════════════

%% ICE Breaker v3
item(ice_breaker_v3, 'ICE Breaker v3', software).
item_description(ice_breaker_v3, 'Intrusion countermeasures electronics cracker. Bypasses standard corporate firewalls. Leaves minimal trace in system logs.').
item_value(ice_breaker_v3, 300).
item_sell_value(ice_breaker_v3, 150).
item_weight(ice_breaker_v3, 0).
item_rarity(ice_breaker_v3, uncommon).
item_category(ice_breaker_v3, software).
item_stackable(ice_breaker_v3).
item_tradeable(ice_breaker_v3).
item_possessable(ice_breaker_v3).
item_tag(ice_breaker_v3, hacking).
item_tag(ice_breaker_v3, daemon).

%% Ghost Protocol
item(ghost_protocol, 'Ghost Protocol', software).
item_description(ghost_protocol, 'Anonymization daemon that masks a netrunner identity during intrusions. Erases digital footprints in real-time.').
item_value(ghost_protocol, 450).
item_sell_value(ghost_protocol, 225).
item_weight(ghost_protocol, 0).
item_rarity(ghost_protocol, rare).
item_category(ghost_protocol, software).
item_stackable(ghost_protocol).
item_tradeable(ghost_protocol).
item_possessable(ghost_protocol).
item_tag(ghost_protocol, hacking).
item_tag(ghost_protocol, stealth).

%% Worm.exe
item(worm_exe, 'Worm.exe', software).
item_description(worm_exe, 'Self-replicating data extraction program. Once deployed inside a network, it copies target files and transmits them to a dead drop server.').
item_value(worm_exe, 200).
item_sell_value(worm_exe, 100).
item_weight(worm_exe, 0).
item_rarity(worm_exe, common).
item_category(worm_exe, software).
item_stackable(worm_exe).
item_tradeable(worm_exe).
item_possessable(worm_exe).
item_tag(worm_exe, hacking).
item_tag(worm_exe, extraction).

%% ═══════════════════════════════════════════════════════════
%% Consumables -- synth drugs and stims
%% ═══════════════════════════════════════════════════════════

%% SynthStim Injector
item(synthstim_injector, 'SynthStim Injector', consumable).
item_description(synthstim_injector, 'A single-use neural stimulant that boosts focus and reaction time for ten minutes. Highly addictive with prolonged use.').
item_value(synthstim_injector, 50).
item_sell_value(synthstim_injector, 25).
item_weight(synthstim_injector, 0.1).
item_rarity(synthstim_injector, common).
item_category(synthstim_injector, consumable).
item_stackable(synthstim_injector).
item_tradeable(synthstim_injector).
item_possessable(synthstim_injector).
item_tag(synthstim_injector, drug).
item_tag(synthstim_injector, combat).

%% NeuroChill
item(neurochill, 'NeuroChill', consumable).
item_description(neurochill, 'A calming neural suppressant that reduces cyberpsychosis symptoms temporarily. Used by those with heavy augmentation to stay stable.').
item_value(neurochill, 75).
item_sell_value(neurochill, 35).
item_weight(neurochill, 0.1).
item_rarity(neurochill, uncommon).
item_category(neurochill, consumable).
item_stackable(neurochill).
item_tradeable(neurochill).
item_possessable(neurochill).
item_tag(neurochill, drug).
item_tag(neurochill, medical).

%% MedGel Patch
item(medgel_patch, 'MedGel Patch', consumable).
item_description(medgel_patch, 'Quick-application trauma patch with nano-clotting agents and local anesthetic. Stops bleeding and reduces pain for field treatment.').
item_value(medgel_patch, 30).
item_sell_value(medgel_patch, 15).
item_weight(medgel_patch, 0.1).
item_rarity(medgel_patch, common).
item_category(medgel_patch, consumable).
item_stackable(medgel_patch).
item_tradeable(medgel_patch).
item_possessable(medgel_patch).
item_tag(medgel_patch, medical).
item_tag(medgel_patch, healing).

%% ═══════════════════════════════════════════════════════════
%% Weapons
%% ═══════════════════════════════════════════════════════════

%% Militech Sidearm
item(militech_sidearm, 'Militech Sidearm', weapon).
item_description(militech_sidearm, 'Standard-issue corporate sidearm with biometric lock. Reliable, accurate, and completely untraceable when the serial numbers are removed.').
item_value(militech_sidearm, 250).
item_sell_value(militech_sidearm, 125).
item_weight(militech_sidearm, 1.5).
item_rarity(militech_sidearm, common).
item_category(militech_sidearm, weapon).
item_tradeable(militech_sidearm).
item_possessable(militech_sidearm).
item_tag(militech_sidearm, firearm).
item_tag(militech_sidearm, ranged).

%% Mono-Wire Whip
item(mono_wire, 'Mono-Wire Whip', weapon).
item_description(mono_wire, 'Monomolecular filament deployed from a wrist-mounted spool. Cuts through metal and flesh with equal ease. Extremely dangerous to untrained users.').
item_value(mono_wire, 900).
item_sell_value(mono_wire, 450).
item_weight(mono_wire, 0.2).
item_rarity(mono_wire, epic).
item_category(mono_wire, weapon).
item_tradeable(mono_wire).
item_possessable(mono_wire).
item_tag(mono_wire, melee).
item_tag(mono_wire, cyberweapon).

%% ═══════════════════════════════════════════════════════════
%% Currency and Valuables
%% ═══════════════════════════════════════════════════════════

%% Credchip
item(credchip, 'Credchip', currency).
item_description(credchip, 'Anonymous digital currency chip loaded with eurodollars. Untraceable and universally accepted in the sprawl.').
item_value(credchip, 100).
item_sell_value(credchip, 100).
item_weight(credchip, 0).
item_rarity(credchip, common).
item_category(credchip, currency).
item_stackable(credchip).
item_tradeable(credchip).
item_possessable(credchip).
item_tag(credchip, money).
item_tag(credchip, anonymous).

%% Encrypted Data Shard
item(encrypted_data_shard, 'Encrypted Data Shard', data).
item_description(encrypted_data_shard, 'A crystal storage medium containing encrypted corporate data. Could be worthless memos or priceless R&D secrets -- only decryption will tell.').
item_value(encrypted_data_shard, 150).
item_sell_value(encrypted_data_shard, 75).
item_weight(encrypted_data_shard, 0).
item_rarity(encrypted_data_shard, uncommon).
item_category(encrypted_data_shard, data).
item_stackable(encrypted_data_shard).
item_tradeable(encrypted_data_shard).
item_possessable(encrypted_data_shard).
item_tag(encrypted_data_shard, intel).
item_tag(encrypted_data_shard, valuable).

%% ═══════════════════════════════════════════════════════════
%% Gear and Equipment
%% ═══════════════════════════════════════════════════════════

%% Signal Jammer
item(signal_jammer, 'Signal Jammer', equipment).
item_description(signal_jammer, 'Portable electromagnetic pulse device that disrupts wireless communications and security cameras in a fifteen-meter radius.').
item_value(signal_jammer, 200).
item_sell_value(signal_jammer, 100).
item_weight(signal_jammer, 1.0).
item_rarity(signal_jammer, uncommon).
item_category(signal_jammer, equipment).
item_tradeable(signal_jammer).
item_possessable(signal_jammer).
item_tag(signal_jammer, tech).
item_tag(signal_jammer, stealth).

%% Holo-Mask
item(holo_mask, 'Holo-Mask', equipment).
item_description(holo_mask, 'Facial projection device that overlays a digital disguise. Fools cameras and casual observers but fails under close biometric scrutiny.').
item_value(holo_mask, 350).
item_sell_value(holo_mask, 175).
item_weight(holo_mask, 0.3).
item_rarity(holo_mask, rare).
item_category(holo_mask, equipment).
item_tradeable(holo_mask).
item_possessable(holo_mask).
item_tag(holo_mask, disguise).
item_tag(holo_mask, stealth).

%% Synthcaf (street coffee)
item(synthcaf, 'Synthcaf', consumable).
item_description(synthcaf, 'Cheap synthetic coffee brewed from lab-grown beans. Tastes awful but keeps you wired. The unofficial currency of all-night coding sessions.').
item_value(synthcaf, 5).
item_sell_value(synthcaf, 2).
item_weight(synthcaf, 0.3).
item_rarity(synthcaf, common).
item_category(synthcaf, food_drink).
item_stackable(synthcaf).
item_tradeable(synthcaf).
item_possessable(synthcaf).
item_tag(synthcaf, beverage).
item_tag(synthcaf, street).

%% Trauma Team Card
item(trauma_team_card, 'Trauma Team Card', equipment).
item_description(trauma_team_card, 'Premium medical evacuation membership card. When activated, an armed medical AV arrives within three minutes. One use per card.').
item_value(trauma_team_card, 2000).
item_sell_value(trauma_team_card, 1000).
item_weight(trauma_team_card, 0).
item_rarity(trauma_team_card, legendary).
item_category(trauma_team_card, medical).
item_tradeable(trauma_team_card).
item_possessable(trauma_team_card).
item_tag(trauma_team_card, medical).
item_tag(trauma_team_card, insurance).
