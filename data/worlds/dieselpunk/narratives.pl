%% Insimul Narratives: Dieselpunk
%% Source: data/worlds/dieselpunk/narratives.pl
%% Created: 2026-04-03
%% Total: 5 narrative arcs
%%
%% Each narrative defines a multi-act story arc with chapters and quests
%% set in the 1930s-40s dieselpunk world of Ironhaven.

%% ═══════════════════════════════════════════════════════════
%% Narrative 1: The Iron Underground
%% A worker drawn into the resistance against the military regime.
%% ═══════════════════════════════════════════════════════════

narrative(the_iron_underground, 'The Iron Underground').
narrative_description(the_iron_underground, 'A factory worker discovers the cost of war profiteering and must choose between safety and conscience, joining an underground resistance in the diesel-choked streets of Ironhaven.').
narrative_estimated_hours(the_iron_underground, 6).

%% ─── Act: Gears of Discontent (introduction) ───
narrative_act(the_iron_underground, gears_of_discontent, 'Gears of Discontent', introduction).

narrative_chapter(the_iron_underground, gears_of_discontent, factory_floor, 'The Factory Floor').

quest(factory_floor_orientation, 'Factory Floor Orientation', exploration, beginner, active).
quest_chain(factory_floor_orientation, factory_floor).
quest_chain_order(factory_floor_orientation, 0).
quest_tag(factory_floor_orientation, industrial).
quest_tag(factory_floor_orientation, main_quest).
quest_objective(factory_floor_orientation, 0, talk_to('otto_gruber', 1)).
quest_objective(factory_floor_orientation, 1, objective('Learn the layout of Gruber Diesel Works.')).
quest_objective(factory_floor_orientation, 2, objective('Complete a basic engine assembly task.')).
quest_reward(factory_floor_orientation, experience, 100).
quest_reward(factory_floor_orientation, gold, 50).
quest_available(Player, factory_floor_orientation) :-
    quest(factory_floor_orientation, _, _, _, active).

quest(whispers_on_the_line, 'Whispers on the Line', conversation, beginner, active).
quest_chain(whispers_on_the_line, factory_floor).
quest_chain_order(whispers_on_the_line, 1).
quest_tag(whispers_on_the_line, social).
quest_tag(whispers_on_the_line, main_quest).
quest_objective(whispers_on_the_line, 0, talk_to('fritz_gruber', 1)).
quest_objective(whispers_on_the_line, 1, objective('Overhear a conversation about working conditions.')).
quest_objective(whispers_on_the_line, 2, talk_to('anna_gruber', 1)).
quest_reward(whispers_on_the_line, experience, 120).
quest_reward(whispers_on_the_line, gold, 40).
quest_available(Player, whispers_on_the_line) :-
    quest(whispers_on_the_line, _, _, _, active).

%% ─── Act: Sparks in the Dark (rising_action) ───
narrative_act(the_iron_underground, sparks_in_the_dark, 'Sparks in the Dark', rising_action).

narrative_chapter(the_iron_underground, sparks_in_the_dark, choosing_sides, 'Choosing Sides').

quest(the_union_meeting, 'The Union Meeting', conversation, intermediate, active).
quest_chain(the_union_meeting, choosing_sides).
quest_chain_order(the_union_meeting, 0).
quest_tag(the_union_meeting, resistance).
quest_tag(the_union_meeting, main_quest).
quest_objective(the_union_meeting, 0, objective('Attend the secret union gathering at 15 Piston Avenue after hours.')).
quest_objective(the_union_meeting, 1, talk_to('fritz_gruber', 1)).
quest_objective(the_union_meeting, 2, objective('Decide whether to pledge support or stay neutral.')).
quest_reward(the_union_meeting, experience, 200).
quest_reward(the_union_meeting, gold, 80).
quest_available(Player, the_union_meeting) :-
    quest(the_union_meeting, _, _, _, active).

quest(ink_and_iron, 'Ink and Iron', exploration, intermediate, active).
quest_chain(ink_and_iron, choosing_sides).
quest_chain_order(ink_and_iron, 1).
quest_tag(ink_and_iron, resistance).
quest_tag(ink_and_iron, main_quest).
quest_objective(ink_and_iron, 0, talk_to('irina_volkov', 1)).
quest_objective(ink_and_iron, 1, objective('Help print resistance leaflets at the Midnight Press.')).
quest_objective(ink_and_iron, 2, objective('Distribute leaflets in Factory Row without being caught.')).
quest_reward(ink_and_iron, experience, 250).
quest_reward(ink_and_iron, gold, 100).
quest_available(Player, ink_and_iron) :-
    quest(ink_and_iron, _, _, _, active).

%% ─── Act: The Breaking Point (climax_resolution) ───
narrative_act(the_iron_underground, the_breaking_point, 'The Breaking Point', climax_resolution).

narrative_chapter(the_iron_underground, the_breaking_point, open_defiance, 'Open Defiance').

quest(the_factory_strike, 'The Factory Strike', conversation, advanced, active).
quest_chain(the_factory_strike, open_defiance).
quest_chain_order(the_factory_strike, 0).
quest_tag(the_factory_strike, resistance).
quest_tag(the_factory_strike, climax).
quest_tag(the_factory_strike, main_quest).
quest_objective(the_factory_strike, 0, talk_to('dimitri_volkov', 1)).
quest_objective(the_factory_strike, 1, objective('Organize a work stoppage at Krause Munitions.')).
quest_objective(the_factory_strike, 2, objective('Confront Heinrich Krause or negotiate with Colonel Stahl.')).
quest_objective(the_factory_strike, 3, objective('Determine the fate of the factory workers.')).
quest_reward(the_factory_strike, experience, 500).
quest_reward(the_factory_strike, gold, 250).
quest_available(Player, the_factory_strike) :-
    quest(the_factory_strike, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Narrative 2: Wings Over Ironhaven
%% A pilot caught between duty to family and desire for freedom.
%% ═══════════════════════════════════════════════════════════

narrative(wings_over_ironhaven, 'Wings Over Ironhaven').
narrative_description(wings_over_ironhaven, 'An estranged daughter returns to the skies above Ironhaven as a freelance pilot, running dangerous cargo and discovering that the war machine her father built threatens to consume everyone she loves.').
narrative_estimated_hours(wings_over_ironhaven, 5).

%% ─── Act: Clear Skies (introduction) ───
narrative_act(wings_over_ironhaven, clear_skies, 'Clear Skies', introduction).

narrative_chapter(wings_over_ironhaven, clear_skies, docking_in, 'Docking In').

quest(the_sky_dock, 'The Sky Dock', exploration, beginner, active).
quest_chain(the_sky_dock, docking_in).
quest_chain_order(the_sky_dock, 0).
quest_tag(the_sky_dock, aviation).
quest_tag(the_sky_dock, main_quest).
quest_objective(the_sky_dock, 0, objective('Arrive at Dock Alpha in the Sky Quarter.')).
quest_objective(the_sky_dock, 1, talk_to('mara_chen', 1)).
quest_objective(the_sky_dock, 2, objective('Inspect your assigned airship at Skywright Repairs.')).
quest_reward(the_sky_dock, experience, 100).
quest_reward(the_sky_dock, gold, 60).
quest_available(Player, the_sky_dock) :-
    quest(the_sky_dock, _, _, _, active).

%% ─── Act: Turbulence (rising_action) ───
narrative_act(wings_over_ironhaven, turbulence, 'Turbulence', rising_action).

narrative_chapter(wings_over_ironhaven, turbulence, dangerous_cargo, 'Dangerous Cargo').

quest(midnight_run, 'Midnight Run', exploration, intermediate, active).
quest_chain(midnight_run, dangerous_cargo).
quest_chain_order(midnight_run, 0).
quest_tag(midnight_run, smuggling).
quest_tag(midnight_run, main_quest).
quest_objective(midnight_run, 0, talk_to('mara_chen', 1)).
quest_objective(midnight_run, 1, objective('Load unmarked crates at Dock Alpha under cover of darkness.')).
quest_objective(midnight_run, 2, objective('Fly through anti-aircraft patrol zones to Ashford Junction.')).
quest_objective(midnight_run, 3, talk_to('jack_ashworth', 1)).
quest_reward(midnight_run, experience, 300).
quest_reward(midnight_run, gold, 150).
quest_available(Player, midnight_run) :-
    quest(midnight_run, _, _, _, active).

%% ─── Act: Nosedive (climax_resolution) ───
narrative_act(wings_over_ironhaven, nosedive, 'Nosedive', climax_resolution).

narrative_chapter(wings_over_ironhaven, nosedive, final_flight, 'The Final Flight').

quest(breaking_the_blockade, 'Breaking the Blockade', exploration, advanced, active).
quest_chain(breaking_the_blockade, final_flight).
quest_chain_order(breaking_the_blockade, 0).
quest_tag(breaking_the_blockade, aviation).
quest_tag(breaking_the_blockade, climax).
quest_tag(breaking_the_blockade, main_quest).
quest_objective(breaking_the_blockade, 0, talk_to('elsa_krause', 1)).
quest_objective(breaking_the_blockade, 1, objective('Steal an airship loaded with medical supplies.')).
quest_objective(breaking_the_blockade, 2, objective('Evade Colonel Stahl aerial patrols.')).
quest_objective(breaking_the_blockade, 3, objective('Deliver supplies to the besieged miners at Grimhollow.')).
quest_reward(breaking_the_blockade, experience, 550).
quest_reward(breaking_the_blockade, gold, 300).
quest_available(Player, breaking_the_blockade) :-
    quest(breaking_the_blockade, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Narrative 3: The Smog Lamp Conspiracy
%% A web of intrigue centered on the Underbelly tavern district.
%% ═══════════════════════════════════════════════════════════

narrative(the_smog_lamp_conspiracy, 'The Smog Lamp Conspiracy').
narrative_description(the_smog_lamp_conspiracy, 'Strange messages appear on the walls of the Underbelly. A conspiracy linking war profiteers, corrupt officers, and a shadowy informant unravels through the smoke-filled rooms of The Smog Lamp tavern.').
narrative_estimated_hours(the_smog_lamp_conspiracy, 5).

%% ─── Act: Smoke Signals (introduction) ───
narrative_act(the_smog_lamp_conspiracy, smoke_signals, 'Smoke Signals', introduction).

narrative_chapter(the_smog_lamp_conspiracy, smoke_signals, the_message, 'The Message').

quest(writing_on_the_wall, 'Writing on the Wall', exploration, beginner, active).
quest_chain(writing_on_the_wall, the_message).
quest_chain_order(writing_on_the_wall, 0).
quest_tag(writing_on_the_wall, mystery).
quest_tag(writing_on_the_wall, main_quest).
quest_objective(writing_on_the_wall, 0, objective('Discover the coded graffiti on Soot Alley.')).
quest_objective(writing_on_the_wall, 1, talk_to('dorothy_ashworth', 1)).
quest_objective(writing_on_the_wall, 2, objective('Visit The Smog Lamp and ask about the markings.')).
quest_reward(writing_on_the_wall, experience, 100).
quest_reward(writing_on_the_wall, gold, 50).
quest_available(Player, writing_on_the_wall) :-
    quest(writing_on_the_wall, _, _, _, active).

%% ─── Act: Tightening the Net (rising_action) ───
narrative_act(the_smog_lamp_conspiracy, tightening_the_net, 'Tightening the Net', rising_action).

narrative_chapter(the_smog_lamp_conspiracy, tightening_the_net, following_the_trail, 'Following the Trail').

quest(the_informants_price, 'The Informant Price', conversation, intermediate, active).
quest_chain(the_informants_price, following_the_trail).
quest_chain_order(the_informants_price, 0).
quest_tag(the_informants_price, espionage).
quest_tag(the_informants_price, main_quest).
quest_objective(the_informants_price, 0, objective('Find the contact at Ratko Salvage and Trade.')).
quest_objective(the_informants_price, 1, objective('Trade an item of value for a name.')).
quest_objective(the_informants_price, 2, talk_to('katya_volkov', 1)).
quest_reward(the_informants_price, experience, 250).
quest_reward(the_informants_price, gold, 100).
quest_available(Player, the_informants_price) :-
    quest(the_informants_price, _, _, _, active).

%% ─── Act: Exposed (climax_resolution) ───
narrative_act(the_smog_lamp_conspiracy, exposed, 'Exposed', climax_resolution).

narrative_chapter(the_smog_lamp_conspiracy, exposed, the_reveal, 'The Reveal').

quest(unmasking_the_traitor, 'Unmasking the Traitor', conversation, advanced, active).
quest_chain(unmasking_the_traitor, the_reveal).
quest_chain_order(unmasking_the_traitor, 0).
quest_tag(unmasking_the_traitor, espionage).
quest_tag(unmasking_the_traitor, climax).
quest_tag(unmasking_the_traitor, main_quest).
quest_objective(unmasking_the_traitor, 0, objective('Confront the suspected informant at The Black Propeller.')).
quest_objective(unmasking_the_traitor, 1, talk_to('margot_krause', 1)).
quest_objective(unmasking_the_traitor, 2, objective('Decide: protect the informant or expose them to the resistance.')).
quest_reward(unmasking_the_traitor, experience, 500).
quest_reward(unmasking_the_traitor, gold, 250).
quest_available(Player, unmasking_the_traitor) :-
    quest(unmasking_the_traitor, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Narrative 4: Blood and Anthracite
%% The struggle for control of Grimhollow mining outpost.
%% ═══════════════════════════════════════════════════════════

narrative(blood_and_anthracite, 'Blood and Anthracite').
narrative_description(blood_and_anthracite, 'The coal mines of Grimhollow fuel the war machine, but the miners are dying. A journey to the frontier outpost reveals the true cost of diesel supremacy and forces a reckoning with those who profit from suffering.').
narrative_estimated_hours(blood_and_anthracite, 4).

%% ─── Act: The Long Rail (introduction) ───
narrative_act(blood_and_anthracite, the_long_rail, 'The Long Rail', introduction).

narrative_chapter(blood_and_anthracite, the_long_rail, junction_town, 'Junction Town').

quest(the_ashford_connection, 'The Ashford Connection', exploration, beginner, active).
quest_chain(the_ashford_connection, junction_town).
quest_chain_order(the_ashford_connection, 0).
quest_tag(the_ashford_connection, exploration).
quest_tag(the_ashford_connection, main_quest).
quest_objective(the_ashford_connection, 0, objective('Arrive at Ashford Junction by rail.')).
quest_objective(the_ashford_connection, 1, talk_to('thomas_ashworth', 1)).
quest_objective(the_ashford_connection, 2, objective('Visit The Clinker tavern and learn about the mining camps.')).
quest_reward(the_ashford_connection, experience, 100).
quest_reward(the_ashford_connection, gold, 50).
quest_available(Player, the_ashford_connection) :-
    quest(the_ashford_connection, _, _, _, active).

%% ─── Act: Deep Shafts (rising_action) ───
narrative_act(blood_and_anthracite, deep_shafts, 'Deep Shafts', rising_action).

narrative_chapter(blood_and_anthracite, deep_shafts, the_mines, 'The Mines').

quest(into_the_pit, 'Into the Pit', exploration, intermediate, active).
quest_chain(into_the_pit, the_mines).
quest_chain_order(into_the_pit, 0).
quest_tag(into_the_pit, exploration).
quest_tag(into_the_pit, main_quest).
quest_objective(into_the_pit, 0, objective('Enter the Grimhollow Anthracite Mine.')).
quest_objective(into_the_pit, 1, objective('Witness the working conditions firsthand.')).
quest_objective(into_the_pit, 2, objective('Retrieve a sample of the restricted ore.')).
quest_reward(into_the_pit, experience, 250).
quest_reward(into_the_pit, gold, 120).
quest_available(Player, into_the_pit) :-
    quest(into_the_pit, _, _, _, active).

%% ─── Act: Cave-In (climax_resolution) ───
narrative_act(blood_and_anthracite, cave_in, 'Cave-In', climax_resolution).

narrative_chapter(blood_and_anthracite, cave_in, the_collapse, 'The Collapse').

quest(buried_alive, 'Buried Alive', exploration, advanced, active).
quest_chain(buried_alive, the_collapse).
quest_chain_order(buried_alive, 0).
quest_tag(buried_alive, survival).
quest_tag(buried_alive, climax).
quest_tag(buried_alive, main_quest).
quest_objective(buried_alive, 0, objective('Survive the mine collapse and find a way out.')).
quest_objective(buried_alive, 1, objective('Rescue trapped miners from the lower shafts.')).
quest_objective(buried_alive, 2, talk_to('ruth_ashworth', 1)).
quest_objective(buried_alive, 3, objective('Expose the negligence that caused the collapse.')).
quest_reward(buried_alive, experience, 550).
quest_reward(buried_alive, gold, 300).
quest_available(Player, buried_alive) :-
    quest(buried_alive, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Narrative 5: The Brass Eagle Affair
%% High-society intrigue and espionage among the elite.
%% ═══════════════════════════════════════════════════════════

narrative(the_brass_eagle_affair, 'The Brass Eagle Affair').
narrative_description(the_brass_eagle_affair, 'Behind the polished doors of the Command Heights officers club, deals are struck that decide who lives and who dies. Infiltrate the world of military elites and war profiteers to steal the one document that could end the war.').
narrative_estimated_hours(the_brass_eagle_affair, 5).

%% ─── Act: Invitation Only (introduction) ───
narrative_act(the_brass_eagle_affair, invitation_only, 'Invitation Only', introduction).

narrative_chapter(the_brass_eagle_affair, invitation_only, getting_in, 'Getting In').

quest(a_borrowed_uniform, 'A Borrowed Uniform', exploration, beginner, active).
quest_chain(a_borrowed_uniform, getting_in).
quest_chain_order(a_borrowed_uniform, 0).
quest_tag(a_borrowed_uniform, espionage).
quest_tag(a_borrowed_uniform, main_quest).
quest_objective(a_borrowed_uniform, 0, talk_to('mara_chen', 1)).
quest_objective(a_borrowed_uniform, 1, objective('Acquire an officers uniform from Ratko Salvage and Trade.')).
quest_objective(a_borrowed_uniform, 2, objective('Bluff your way past the guard at The Brass Eagle.')).
quest_reward(a_borrowed_uniform, experience, 120).
quest_reward(a_borrowed_uniform, gold, 60).
quest_available(Player, a_borrowed_uniform) :-
    quest(a_borrowed_uniform, _, _, _, active).

%% ─── Act: Dancing with Wolves (rising_action) ───
narrative_act(the_brass_eagle_affair, dancing_with_wolves, 'Dancing with Wolves', rising_action).

narrative_chapter(the_brass_eagle_affair, dancing_with_wolves, the_gala, 'The Gala').

quest(the_colonels_toast, 'The Colonels Toast', conversation, intermediate, active).
quest_chain(the_colonels_toast, the_gala).
quest_chain_order(the_colonels_toast, 0).
quest_tag(the_colonels_toast, social).
quest_tag(the_colonels_toast, espionage).
quest_tag(the_colonels_toast, main_quest).
quest_objective(the_colonels_toast, 0, objective('Attend the officers gala at The Brass Eagle.')).
quest_objective(the_colonels_toast, 1, talk_to('konrad_krause', 1)).
quest_objective(the_colonels_toast, 2, talk_to('viktor_stahl', 1)).
quest_objective(the_colonels_toast, 3, objective('Locate the war office keys without raising suspicion.')).
quest_reward(the_colonels_toast, experience, 300).
quest_reward(the_colonels_toast, gold, 150).
quest_available(Player, the_colonels_toast) :-
    quest(the_colonels_toast, _, _, _, active).

%% ─── Act: The Heist (climax_resolution) ───
narrative_act(the_brass_eagle_affair, the_heist, 'The Heist', climax_resolution).

narrative_chapter(the_brass_eagle_affair, the_heist, the_vault, 'The Vault').

quest(the_war_ledger, 'The War Ledger', exploration, advanced, active).
quest_chain(the_war_ledger, the_vault).
quest_chain_order(the_war_ledger, 0).
quest_tag(the_war_ledger, espionage).
quest_tag(the_war_ledger, climax).
quest_tag(the_war_ledger, main_quest).
quest_objective(the_war_ledger, 0, objective('Break into the War Office on Brass Boulevard.')).
quest_objective(the_war_ledger, 1, objective('Crack the safe and photograph the arms-deal ledger.')).
quest_objective(the_war_ledger, 2, objective('Escape Command Heights before dawn patrol.')).
quest_objective(the_war_ledger, 3, talk_to('dimitri_volkov', 1)).
quest_objective(the_war_ledger, 4, objective('Decide: publish the ledger or use it as leverage.')).
quest_reward(the_war_ledger, experience, 600).
quest_reward(the_war_ledger, gold, 350).
quest_available(Player, the_war_ledger) :-
    quest(the_war_ledger, _, _, _, active).
