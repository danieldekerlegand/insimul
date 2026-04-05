%% Insimul Narratives: Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative arcs
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_priority/2
%%   narrative_trigger/2, narrative_stage/4, narrative_outcome/3

%% The Water Crisis
narrative(water_crisis, 'The Water Crisis', main_arc).
narrative_description(water_crisis, 'Haven Ridge water purifier is failing. The settlement must find replacement parts or face a slow death by dehydration.').
narrative_priority(water_crisis, 10).
narrative_trigger(water_crisis, (time_step(T), T >= 5)).
narrative_stage(water_crisis, 0, 'Discovery', 'Jo Mercer discovers the main water filter is cracking and will fail within weeks.').
narrative_stage(water_crisis, 1, 'Expedition', 'A team must be sent to the industrial ruins to find a replacement filter housing.').
narrative_stage(water_crisis, 2, 'Conflict', 'The Iron Fang raiders have already claimed the factory containing spare parts.').
narrative_stage(water_crisis, 3, 'Resolution', 'The settlement must negotiate, fight, or find an alternative water source.').
narrative_outcome(water_crisis, success, 'The purifier is repaired and Haven Ridge secures its water supply for another decade.').
narrative_outcome(water_crisis, failure, 'Water rationing becomes extreme. Some residents defect to Rusthollow.').
narrative_outcome(water_crisis, compromise, 'A deal is struck with the Iron Fang for shared water access at a heavy cost.').

%% The Exile Returns
narrative(exile_returns, 'The Exile Returns', character_arc).
narrative_description(exile_returns, 'A former Haven Ridge resident who was exiled for hoarding returns with valuable information about a pre-war bunker.').
narrative_priority(exile_returns, 7).
narrative_trigger(exile_returns, (time_step(T), T >= 10, completed_quest(Player, first_patrol))).
narrative_stage(exile_returns, 0, 'Arrival', 'A ragged figure appears at the gates claiming to know the location of a sealed military bunker.').
narrative_stage(exile_returns, 1, 'Debate', 'The council debates whether to trust the exile or turn them away.').
narrative_stage(exile_returns, 2, 'Investigation', 'The player must verify the claims by scouting the alleged bunker location.').
narrative_stage(exile_returns, 3, 'Judgment', 'Elias Mercer asks the player to recommend whether the exile should be readmitted.').
narrative_outcome(exile_returns, accept, 'The exile is welcomed back and the bunker yields valuable technology.').
narrative_outcome(exile_returns, reject, 'The exile is turned away and sells the information to the Iron Fang instead.').

%% Rusthollow Alliance
narrative(rusthollow_alliance, 'Rusthollow Alliance', political_arc).
narrative_description(rusthollow_alliance, 'Ash Corbin proposes a formal alliance between Rusthollow and Haven Ridge to counter the growing Iron Fang threat.').
narrative_priority(rusthollow_alliance, 8).
narrative_trigger(rusthollow_alliance, (time_step(T), T >= 15)).
narrative_stage(rusthollow_alliance, 0, 'Proposal', 'Ash Corbin sends an envoy to Haven Ridge proposing mutual defense.').
narrative_stage(rusthollow_alliance, 1, 'Negotiation', 'Terms must be hammered out -- resource sharing, joint patrols, governance.').
narrative_stage(rusthollow_alliance, 2, 'Test', 'A joint mission against a raider outpost tests the fragile alliance.').
narrative_stage(rusthollow_alliance, 3, 'Outcome', 'The alliance either solidifies or collapses based on mission results.').
narrative_outcome(rusthollow_alliance, success, 'The Wasteland Coalition is formed, creating a unified front against raiders.').
narrative_outcome(rusthollow_alliance, failure, 'Mutual distrust deepens and both settlements become more isolationist.').

%% The Greenhouse Dream
narrative(greenhouse_dream, 'The Greenhouse Dream', character_arc).
narrative_description(greenhouse_dream, 'Lina Okafor believes she can build a large-scale greenhouse that could feed both settlements, but the resources required are enormous.').
narrative_priority(greenhouse_dream, 6).
narrative_trigger(greenhouse_dream, (completed_quest(Player, greenhouse_project))).
narrative_stage(greenhouse_dream, 0, 'Vision', 'Lina presents her plans for an industrial-scale greenhouse to the council.').
narrative_stage(greenhouse_dream, 1, 'Gathering', 'Massive amounts of glass, soil, and seed stock must be gathered from dangerous locations.').
narrative_stage(greenhouse_dream, 2, 'Sabotage', 'Someone is destroying supply caches. Is it raiders, or a saboteur within?').
narrative_stage(greenhouse_dream, 3, 'Harvest', 'The greenhouse is completed and the first crops are planted.').
narrative_outcome(greenhouse_dream, success, 'The greenhouse produces enough food to end rationing in Haven Ridge.').
narrative_outcome(greenhouse_dream, failure, 'The project fails and valuable resources are lost, deepening the food crisis.').

%% Moth in the Shadows
narrative(moth_shadows, 'Moth in the Shadows', character_arc).
narrative_description(moth_shadows, 'Moth runs a black market that connects all three settlements. Her true loyalties are unclear and her information network may be the key to peace or war.').
narrative_priority(moth_shadows, 7).
narrative_trigger(moth_shadows, (met(Player, moth))).
narrative_stage(moth_shadows, 0, 'Contact', 'Moth offers the player valuable intelligence in exchange for a favor.').
narrative_stage(moth_shadows, 1, 'Web', 'The player discovers Moth trades information with all factions simultaneously.').
narrative_stage(moth_shadows, 2, 'Choice', 'Moth asks the player to deliver a sealed message -- but to which faction?').
narrative_stage(moth_shadows, 3, 'Revelation', 'The contents of the message could shift the balance of power in the wasteland.').
narrative_outcome(moth_shadows, side_haven, 'Moth becomes a Haven Ridge intelligence asset.').
narrative_outcome(moth_shadows, side_iron_fang, 'Moth brokers a non-aggression pact with the Iron Fang.').
narrative_outcome(moth_shadows, betray, 'Moth disappears with the information, leaving all factions weakened.').

%% The Signal
narrative(the_signal, 'The Signal', main_arc).
narrative_description(the_signal, 'A mysterious radio broadcast from the east suggests another civilization has survived. Could it be salvation or a new threat?').
narrative_priority(the_signal, 9).
narrative_trigger(the_signal, (completed_quest(Player, signal_in_static))).
narrative_stage(the_signal, 0, 'Broadcast', 'Silas Kane picks up a repeating signal in an unknown code from far to the east.').
narrative_stage(the_signal, 1, 'Decoding', 'The message is partially decoded, revealing coordinates and a request for contact.').
narrative_stage(the_signal, 2, 'Expedition', 'A dangerous overland journey east through uncharted wasteland begins.').
narrative_stage(the_signal, 3, 'Contact', 'The source of the signal is found -- and it changes everything.').
narrative_outcome(the_signal, friendly, 'A thriving settlement is found, opening trade routes and hope for the future.').
narrative_outcome(the_signal, hostile, 'The signal was bait set by a technologically advanced raider faction.').
narrative_outcome(the_signal, abandoned, 'The signal was automated. The settlement that sent it perished long ago.').
