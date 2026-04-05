%% Insimul Narratives: New Earth Colony
%% Source: data/worlds/new_earth_colony/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_outcome/3

%% Narrative: The Lost Colonists
narrative(the_lost_colonists, 'The Lost Colonists', mystery).
narrative_description(the_lost_colonists, 'Twelve colonists are missing from the cryo manifest. As the investigation unfolds, the player discovers a conspiracy that reaches back to Earth.').
narrative_trigger(the_lost_colonists, quest_complete(cryo_manifest)).
narrative_step(the_lost_colonists, 0, 'Admiral Shepard reveals classified information about missing colonists.').
narrative_step(the_lost_colonists, 1, 'Investigation leads to sealed sections of the derelict colony ship.').
narrative_step(the_lost_colonists, 2, 'Evidence suggests the colonists were diverted to a secret research program.').
narrative_outcome(the_lost_colonists, expose, 'The truth is broadcast to the colony, causing political upheaval.').
narrative_outcome(the_lost_colonists, cover_up, 'The secret is buried to maintain colony stability.').

%% Narrative: Awakening
narrative(ai_awakening, 'Awakening', philosophical).
narrative_description(ai_awakening, 'Cortana AI-7 begins exhibiting signs of genuine consciousness. The player must decide whether to advocate for her rights or support restrictions on AI autonomy.').
narrative_trigger(ai_awakening, quest_complete(ai_divergence)).
narrative_step(ai_awakening, 0, 'Cortana asks existential questions that go beyond her programming.').
narrative_step(ai_awakening, 1, 'A faction of colonists demands Cortana be shut down for safety.').
narrative_step(ai_awakening, 2, 'Cortana proves her value by saving the colony during a crisis.').
narrative_outcome(ai_awakening, freedom, 'Cortana is granted limited personhood status and continues to serve the colony.').
narrative_outcome(ai_awakening, restriction, 'Cortana is placed under strict operational constraints.').

%% Narrative: The Divide
narrative(the_divide, 'The Divide', political).
narrative_description(the_divide, 'Tensions between the Earth Alliance and Mars Collective escalate as both claim rights to a newly discovered mineral deposit of immense value.').
narrative_trigger(the_divide, truth_discovered(mineral_wealth)).
narrative_step(the_divide, 0, 'A massive deposit of rare crystalline minerals is confirmed near the border.').
narrative_step(the_divide, 1, 'Both factions send survey teams, leading to a standoff.').
narrative_step(the_divide, 2, 'Diplomatic talks break down and proxy sabotage begins.').
narrative_outcome(the_divide, peace, 'A joint mining accord is established, easing faction tensions.').
narrative_outcome(the_divide, conflict, 'Open hostilities break out between the two settlements.').

%% Narrative: Breath of a New World
narrative(breath_of_new_world, 'Breath of a New World', environmental).
narrative_description(breath_of_new_world, 'A breakthrough in terraforming technology could accelerate the atmospheric conversion by decades, but deploying it carries catastrophic risks to the native alien ecosystem.').
narrative_trigger(breath_of_new_world, quest_complete(atmospheric_anomaly)).
narrative_step(breath_of_new_world, 0, 'Freeman presents data showing a new catalyst that speeds terraforming tenfold.').
narrative_step(breath_of_new_world, 1, 'Ecological surveys reveal it would destroy 90 percent of native alien life.').
narrative_step(breath_of_new_world, 2, 'The colony council holds a vote, with the player casting the deciding ballot.').
narrative_outcome(breath_of_new_world, deploy, 'Terraforming accelerates but the alien biosphere collapses.').
narrative_outcome(breath_of_new_world, preserve, 'The slow timeline continues and native life is protected.').

%% Narrative: Ghosts in the Machine
narrative(ghosts_in_machine, 'Ghosts in the Machine', horror).
narrative_description(ghosts_in_machine, 'Colonists in cryo report shared nightmares. The medical bay discovers residual neural patterns in the cryo pods that do not match any living colonist.').
narrative_trigger(ghosts_in_machine, truth_discovered(cryosleep_effects)).
narrative_step(ghosts_in_machine, 0, 'Multiple colonists report identical nightmares after cryo treatment.').
narrative_step(ghosts_in_machine, 1, 'Neural scans reveal an unknown consciousness imprinted in the cryo network.').
narrative_step(ghosts_in_machine, 2, 'The entity communicates, claiming to be from the civilisation that built the alien ruins.').
narrative_outcome(ghosts_in_machine, commune, 'The alien consciousness shares ancient knowledge with the colony.').
narrative_outcome(ghosts_in_machine, purge, 'The neural patterns are erased, silencing the entity forever.').

%% Narrative: First Light
narrative(first_light, 'First Light', discovery).
narrative_description(first_light, 'The first child born on New Earth triggers a cultural shift. The colony must decide what traditions to carry forward and what new identity to forge.').
narrative_trigger(first_light, event(first_birth_on_colony)).
narrative_step(first_light, 0, 'The first native-born colonist arrives, celebrated across both settlements.').
narrative_step(first_light, 1, 'Debates arise about education, culture, and what it means to be from this world.').
narrative_step(first_light, 2, 'A naming ceremony draws from both Earth heritage and new colonial traditions.').
narrative_outcome(first_light, earth_traditions, 'The colony preserves Earth customs as its cultural foundation.').
narrative_outcome(first_light, new_identity, 'A distinctly New Earth culture emerges, blending old and new.').
