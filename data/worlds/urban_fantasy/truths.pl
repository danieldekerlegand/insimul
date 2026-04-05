%% Insimul Truths: Urban Fantasy -- Veilhaven
%% Source: data/worlds/urban_fantasy/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% The Veil
truth(the_veil, 'The Veil', world_law).
truth_content(the_veil, 'The Veil is a magical barrier that prevents ordinary humans from perceiving supernatural events. When a mundane witnesses something impossible, the Veil causes them to rationalize it away. The Veil is maintained by ancient wards built into the city foundations.').
truth_importance(the_veil, 10).
truth_timestep(the_veil, 0).

%% Masquerade Protocol
truth(masquerade_protocol, 'Masquerade Protocol', social_rule).
truth_content(masquerade_protocol, 'All supernatural beings in Veilhaven must maintain the Masquerade -- the collective agreement to keep their existence hidden from mundane humans. Violations are punished severely by the Council of Shadows.').
truth_importance(masquerade_protocol, 10).
truth_timestep(masquerade_protocol, 0).

%% Cold Iron Law
truth(cold_iron_law, 'Cold Iron Law', world_law).
truth_content(cold_iron_law, 'Cold iron disrupts fae magic and causes burning pain to fae creatures on contact. This weakness is well known and cold iron items are commonly used as protection against the Unseelie Court.').
truth_importance(cold_iron_law, 9).
truth_timestep(cold_iron_law, 0).

%% Lunar Cycle Effects
truth(lunar_cycle, 'Lunar Cycle Effects', world_law).
truth_content(lunar_cycle, 'The full moon forces werewolves to transform. Younger wolves lose control entirely, while experienced pack members can maintain partial awareness. Wolfsbane tinctures help suppress the worst of the feral instincts.').
truth_importance(lunar_cycle, 9).
truth_timestep(lunar_cycle, 0).

%% Vampire Feeding Laws
truth(vampire_feeding_laws, 'Vampire Feeding Laws', social_rule).
truth_content(vampire_feeding_laws, 'The Aldermere Conclave strictly regulates vampire feeding. Hunting is forbidden within city limits. Vampires must use ethically sourced blood from Nightshade Pharmacy or willing donors. Violators face exile or destruction.').
truth_importance(vampire_feeding_laws, 9).
truth_timestep(vampire_feeding_laws, 0).

%% Neutral Ground
truth(neutral_ground, 'Neutral Ground', social_rule).
truth_content(neutral_ground, 'Certain locations in Veilhaven are designated neutral ground where no faction may engage in hostilities. The Cobalt Diner, Blackwood Library, and the Underreach Waystation are the three primary neutral zones.').
truth_importance(neutral_ground, 8).
truth_timestep(neutral_ground, 0).

%% Fae Bargains
truth(fae_bargains, 'Fae Bargains', cultural_norm).
truth_content(fae_bargains, 'The fae cannot lie directly, but they are masters of misdirection and half-truths. Any deal struck with a fae is magically binding. Always read the fine print. Never give a fae your true name, as names hold power over the named.').
truth_importance(fae_bargains, 9).
truth_timestep(fae_bargains, 0).

%% Seelie vs Unseelie
truth(seelie_unseelie, 'Seelie vs Unseelie Courts', faction_lore).
truth_content(seelie_unseelie, 'The Seelie Court favors diplomacy, beauty, and order. The Unseelie Court embraces chaos, freedom, and power. Neither is truly good or evil. Their conflict is ancient and their truce in Veilhaven is fragile.').
truth_importance(seelie_unseelie, 8).
truth_timestep(seelie_unseelie, 0).

%% Pack Hierarchy
truth(pack_hierarchy, 'Pack Hierarchy', faction_lore).
truth_content(pack_hierarchy, 'The Docklands Pack follows a strict hierarchy. The Alpha leads, the Beta is second in command. Pack bonds are forged through shared transformations. Lone wolves -- werewolves without a pack -- are unpredictable and dangerous.').
truth_importance(pack_hierarchy, 8).
truth_timestep(pack_hierarchy, 0).

%% Threshold Magic
truth(threshold_magic, 'Threshold Magic', world_law).
truth_content(threshold_magic, 'A home that is genuinely lived in develops a magical threshold. Vampires cannot cross a threshold uninvited. Fae find their powers diminished inside mortal dwellings. This is an ancient and unbreakable magical law.').
truth_importance(threshold_magic, 8).
truth_timestep(threshold_magic, 0).

%% The Underreach
truth(the_underreach, 'The Underreach', location_lore).
truth_content(the_underreach, 'Beneath Veilhaven lies the Underreach, a network of abandoned subway tunnels repurposed as a supernatural marketplace and neutral meeting ground. It is accessible through hidden entrances and requires special tokens.').
truth_importance(the_underreach, 7).
truth_timestep(the_underreach, 0).

%% Council of Shadows
truth(council_of_shadows, 'Council of Shadows', faction_lore).
truth_content(council_of_shadows, 'The Council of Shadows governs supernatural affairs in Veilhaven. It includes representatives from each major faction: fae, vampire, werewolf, and human practitioners. Decisions require a majority vote.').
truth_importance(council_of_shadows, 9).
truth_timestep(council_of_shadows, 0).

%% Ley Lines
truth(ley_lines, 'Ley Lines', world_law).
truth_content(ley_lines, 'Veilhaven sits at the intersection of three major ley lines -- rivers of magical energy flowing through the earth. This convergence is what makes the Veil so strong here and attracts supernatural beings from across the world.').
truth_importance(ley_lines, 7).
truth_timestep(ley_lines, 0).

%% Silver Sensitivity
truth(silver_sensitivity, 'Silver Sensitivity', world_law).
truth_content(silver_sensitivity, 'Silver is toxic to werewolves on contact, causing burns and preventing regeneration. Vampires find silver mildly uncomfortable but not dangerous. Fae are unaffected by silver. Silver bullets are a last resort weapon.').
truth_importance(silver_sensitivity, 8).
truth_timestep(silver_sensitivity, 0).

%% Glamour
truth(glamour, 'Glamour', world_law).
truth_content(glamour, 'Fae use glamour -- magical illusions -- to disguise their true appearance among humans. Strong emotions or cold iron can cause a glamour to flicker. Veil Sight potions allow mortals to see through glamours temporarily.').
truth_importance(glamour, 7).
truth_timestep(glamour, 0).

%% The Founding Compact
truth(founding_compact, 'The Founding Compact', faction_lore).
truth_content(founding_compact, 'In 1847, the four founding families -- Ashwood (fae), Aldermere (vampire), Reyes (werewolf), and Cole (human) -- signed the Founding Compact establishing Veilhaven as a sanctuary city for all supernatural beings.').
truth_importance(founding_compact, 10).
truth_timestep(founding_compact, 0).

%% Human Practitioners
truth(human_practitioners, 'Human Practitioners', faction_lore).
truth_content(human_practitioners, 'Some humans possess the ability to perceive and manipulate magical energy. They call themselves practitioners, hedge mages, or witches. Their power comes from study and discipline rather than innate supernatural nature.').
truth_importance(human_practitioners, 7).
truth_timestep(human_practitioners, 0).

%% The Witching Hour
truth(witching_hour, 'The Witching Hour', world_law).
truth_content(witching_hour, 'Between midnight and 3 AM, the Veil thins considerably. Supernatural powers are stronger, glamours are harder to maintain, and the boundaries between the mortal world and the fae realms become permeable.').
truth_importance(witching_hour, 6).
truth_timestep(witching_hour, 0).
