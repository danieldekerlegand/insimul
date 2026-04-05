%% Insimul Quests: Urban Fantasy -- Veilhaven
%% Source: data/worlds/urban_fantasy/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Introductory Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Veil Lifts
quest(the_veil_lifts, 'The Veil Lifts', main_story, beginner, active).
quest_assigned_to(the_veil_lifts, '{{player}}').
quest_tag(the_veil_lifts, generated).
quest_objective(the_veil_lifts, 0, objective('Witness a supernatural event at the Cobalt Diner.')).
quest_objective(the_veil_lifts, 1, talk_to('ezra_cole', 1)).
quest_objective(the_veil_lifts, 2, objective('Learn about the Veil that separates the mundane from the magical.')).
quest_reward(the_veil_lifts, experience, 150).
quest_reward(the_veil_lifts, gold, 75).
quest_available(Player, the_veil_lifts) :-
    quest(the_veil_lifts, _, _, _, active).

%% Quest: New in Town
quest(new_in_town, 'New in Town', exploration, beginner, active).
quest_assigned_to(new_in_town, '{{player}}').
quest_tag(new_in_town, generated).
quest_objective(new_in_town, 0, objective('Visit three different districts of Veilhaven.')).
quest_objective(new_in_town, 1, objective('Find the hidden entrance to the Underreach.')).
quest_objective(new_in_town, 2, talk_to('helena_voss', 1)).
quest_reward(new_in_town, experience, 100).
quest_reward(new_in_town, gold, 50).
quest_available(Player, new_in_town) :-
    quest(new_in_town, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Faction Quests -- Fae Courts
%% ═══════════════════════════════════════════════════════════

%% Quest: Thorns and Roses
quest(thorns_and_roses, 'Thorns and Roses', faction, intermediate, active).
quest_assigned_to(thorns_and_roses, '{{player}}').
quest_tag(thorns_and_roses, generated).
quest_objective(thorns_and_roses, 0, talk_to('rowan_ashwood', 1)).
quest_objective(thorns_and_roses, 1, objective('Attend a Seelie Court gathering at The Eventide.')).
quest_objective(thorns_and_roses, 2, objective('Deliver a message to Morrigan Blackthorn without revealing its sender.')).
quest_objective(thorns_and_roses, 3, objective('Return to Rowan with Morrigans response.')).
quest_reward(thorns_and_roses, experience, 250).
quest_reward(thorns_and_roses, gold, 150).
quest_reward(thorns_and_roses, item, fae_token).
quest_available(Player, thorns_and_roses) :-
    quest(thorns_and_roses, _, _, _, active).

%% Quest: The Briar Hollow
quest(the_briar_hollow, 'The Briar Hollow', exploration, intermediate, active).
quest_assigned_to(the_briar_hollow, '{{player}}').
quest_tag(the_briar_hollow, generated).
quest_objective(the_briar_hollow, 0, talk_to('thistle_moonshadow', 1)).
quest_objective(the_briar_hollow, 1, objective('Travel to the Briarwood crossing in Hollowmere.')).
quest_objective(the_briar_hollow, 2, objective('Collect a sample of briarwood sap before moonrise.')).
quest_objective(the_briar_hollow, 3, objective('Return the sap to Thistle without being followed.')).
quest_reward(the_briar_hollow, experience, 200).
quest_reward(the_briar_hollow, gold, 100).
quest_available(Player, the_briar_hollow) :-
    quest(the_briar_hollow, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Faction Quests -- Werewolf Pack
%% ═══════════════════════════════════════════════════════════

%% Quest: Scent of Trouble
quest(scent_of_trouble, 'Scent of Trouble', investigation, intermediate, active).
quest_assigned_to(scent_of_trouble, '{{player}}').
quest_tag(scent_of_trouble, generated).
quest_objective(scent_of_trouble, 0, talk_to('marcus_reyes', 1)).
quest_objective(scent_of_trouble, 1, objective('Investigate strange scent markers in the Docklands.')).
quest_objective(scent_of_trouble, 2, objective('Find the intruder wolf at Dock 24 Storage.')).
quest_objective(scent_of_trouble, 3, objective('Report findings to Marcus at the Salt and Anchor.')).
quest_reward(scent_of_trouble, experience, 250).
quest_reward(scent_of_trouble, gold, 125).
quest_available(Player, scent_of_trouble) :-
    quest(scent_of_trouble, _, _, _, active).

%% Quest: Full Moon Protocol
quest(full_moon_protocol, 'Full Moon Protocol', faction, advanced, active).
quest_assigned_to(full_moon_protocol, '{{player}}').
quest_tag(full_moon_protocol, generated).
quest_objective(full_moon_protocol, 0, talk_to('elena_reyes', 1)).
quest_objective(full_moon_protocol, 1, objective('Help secure the pack safe house before the full moon.')).
quest_objective(full_moon_protocol, 2, objective('Obtain wolfsbane tincture from Nightshade Pharmacy.')).
quest_objective(full_moon_protocol, 3, objective('Guard the perimeter during the transformation.')).
quest_reward(full_moon_protocol, experience, 350).
quest_reward(full_moon_protocol, gold, 200).
quest_reward(full_moon_protocol, item, pack_sigil).
quest_available(Player, full_moon_protocol) :-
    quest(full_moon_protocol, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Faction Quests -- Vampire Conclave
%% ═══════════════════════════════════════════════════════════

%% Quest: Blood Politics
quest(blood_politics, 'Blood Politics', faction, intermediate, active).
quest_assigned_to(blood_politics, '{{player}}').
quest_tag(blood_politics, generated).
quest_objective(blood_politics, 0, talk_to('victor_aldermere', 1)).
quest_objective(blood_politics, 1, objective('Attend a city council meeting at City Hall.')).
quest_objective(blood_politics, 2, objective('Gather evidence of a rival vampire coven operating in the Old Quarter.')).
quest_objective(blood_politics, 3, talk_to('damien_cross', 1)).
quest_reward(blood_politics, experience, 250).
quest_reward(blood_politics, gold, 175).
quest_available(Player, blood_politics) :-
    quest(blood_politics, _, _, _, active).

%% Quest: Gallery of Shadows
quest(gallery_of_shadows, 'Gallery of Shadows', investigation, intermediate, active).
quest_assigned_to(gallery_of_shadows, '{{player}}').
quest_tag(gallery_of_shadows, generated).
quest_objective(gallery_of_shadows, 0, talk_to('seraphina_aldermere', 1)).
quest_objective(gallery_of_shadows, 1, objective('Investigate a cursed painting at Gallery Nyx.')).
quest_objective(gallery_of_shadows, 2, objective('Trace the paintings origin to the Underreach black market.')).
quest_objective(gallery_of_shadows, 3, talk_to('nyx', 1)).
quest_reward(gallery_of_shadows, experience, 300).
quest_reward(gallery_of_shadows, gold, 150).
quest_available(Player, gallery_of_shadows) :-
    quest(gallery_of_shadows, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Occult / Unaffiliated Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Restricted Section
quest(the_restricted_section, 'The Restricted Section', investigation, advanced, active).
quest_assigned_to(the_restricted_section, '{{player}}').
quest_tag(the_restricted_section, generated).
quest_objective(the_restricted_section, 0, talk_to('sable_okonkwo', 1)).
quest_objective(the_restricted_section, 1, objective('Gain access to the Blackwood Library restricted archives.')).
quest_objective(the_restricted_section, 2, objective('Find the journal of the original Veilhaven founder.')).
quest_objective(the_restricted_section, 3, objective('Decode the ward map of the city.')).
quest_reward(the_restricted_section, experience, 400).
quest_reward(the_restricted_section, gold, 250).
quest_reward(the_restricted_section, item, ward_map).
quest_available(Player, the_restricted_section) :-
    quest(the_restricted_section, _, _, _, active).

%% Quest: Iron and Salt
quest(iron_and_salt, 'Iron and Salt', crafting, beginner, active).
quest_assigned_to(iron_and_salt, '{{player}}').
quest_tag(iron_and_salt, generated).
quest_objective(iron_and_salt, 0, talk_to('kai_chen', 1)).
quest_objective(iron_and_salt, 1, objective('Gather cold iron filings from Ironside Tattoo.')).
quest_objective(iron_and_salt, 2, objective('Collect sea salt from the Docklands.')).
quest_objective(iron_and_salt, 3, objective('Brew a basic protection ward at Nightshade Pharmacy.')).
quest_reward(iron_and_salt, experience, 150).
quest_reward(iron_and_salt, gold, 75).
quest_reward(iron_and_salt, item, protection_ward).
quest_available(Player, iron_and_salt) :-
    quest(iron_and_salt, _, _, _, active).

%% Quest: Waystation Market Day
quest(waystation_market_day, 'Waystation Market Day', exploration, beginner, active).
quest_assigned_to(waystation_market_day, '{{player}}').
quest_tag(waystation_market_day, generated).
quest_objective(waystation_market_day, 0, objective('Navigate to the Underreach via Platform Zero.')).
quest_objective(waystation_market_day, 1, talk_to('nyx', 1)).
quest_objective(waystation_market_day, 2, objective('Purchase a minor enchanted item from the Waystation market.')).
quest_reward(waystation_market_day, experience, 125).
quest_reward(waystation_market_day, gold, 60).
quest_available(Player, waystation_market_day) :-
    quest(waystation_market_day, _, _, _, active).
