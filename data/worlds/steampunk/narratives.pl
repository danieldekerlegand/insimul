%% Insimul Narratives: Steampunk
%% Source: data/worlds/steampunk/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_outcome/3

%% The Inventors Rivalry
narrative(inventors_rivalry, 'The Inventors Rivalry', conflict).
narrative_description(inventors_rivalry, 'Two brilliant minds compete for a prestigious patent, forcing allies to choose sides.').
narrative_trigger(inventors_rivalry, (trait(X, brilliant), trait(Y, brilliant), X \= Y)).
narrative_step(inventors_rivalry, 0, 'Both inventors announce competing designs at the Academy.').
narrative_step(inventors_rivalry, 1, 'Supporters rally behind each inventor, splitting the community.').
narrative_step(inventors_rivalry, 2, 'A public demonstration determines which design is superior.').
narrative_outcome(inventors_rivalry, success, 'The winner earns the patent and fame; the loser vows to improve.').
narrative_outcome(inventors_rivalry, failure, 'Both designs fail publicly, and a third party steals the concept.').

%% The Smog Crisis
narrative(smog_crisis, 'The Smog Crisis', environmental).
narrative_description(smog_crisis, 'Industrial pollution reaches dangerous levels, threatening the health of Boiler Ward residents.').
narrative_trigger(smog_crisis, (location(X, ironhaven), trait(X, compassionate))).
narrative_step(smog_crisis, 0, 'Workers in Boiler Ward begin falling ill from worsening smog.').
narrative_step(smog_crisis, 1, 'A petition demands the Civic Council reduce factory emissions.').
narrative_step(smog_crisis, 2, 'Factory owners resist, citing economic costs.').
narrative_step(smog_crisis, 3, 'An inventor proposes a steam-powered air filtration system.').
narrative_outcome(smog_crisis, success, 'The filtration system is built and air quality improves.').
narrative_outcome(smog_crisis, failure, 'The council sides with industry and the smog worsens.').

%% Sky Pirate Raid
narrative(sky_pirate_raid, 'Sky Pirate Raid', conflict).
narrative_description(sky_pirate_raid, 'A fleet of sky pirates threatens the Ironhaven shipping lanes, disrupting trade.').
narrative_trigger(sky_pirate_raid, (location(X, ironhaven), trait(X, commanding))).
narrative_step(sky_pirate_raid, 0, 'Airships begin disappearing along the northern route.').
narrative_step(sky_pirate_raid, 1, 'Captain Hargrove organizes a defense fleet.').
narrative_step(sky_pirate_raid, 2, 'The pirates attack the Skyport directly.').
narrative_step(sky_pirate_raid, 3, 'A final aerial battle over Ironhaven determines the outcome.').
narrative_outcome(sky_pirate_raid, success, 'The pirates are driven off and trade routes are secured.').
narrative_outcome(sky_pirate_raid, failure, 'The Skyport is damaged and trade grinds to a halt.').

%% The Blackwood Monopoly
narrative(blackwood_monopoly, 'The Blackwood Monopoly', political).
narrative_description(blackwood_monopoly, 'Lord Blackwood attempts to buy exclusive rights to all aether crystal mining.').
narrative_trigger(blackwood_monopoly, (trait(X, calculating), attribute(X, cunningness, C), C > 70)).
narrative_step(blackwood_monopoly, 0, 'Lord Blackwood begins purchasing mining claims in Coppermouth.').
narrative_step(blackwood_monopoly, 1, 'Independent miners protest the buyouts.').
narrative_step(blackwood_monopoly, 2, 'The Civic Council holds a hearing on monopoly regulation.').
narrative_outcome(blackwood_monopoly, success, 'Regulation passes and mining rights are preserved for independents.').
narrative_outcome(blackwood_monopoly, failure, 'Blackwood secures the monopoly and raises crystal prices.').

%% The Automaton Awakening
narrative(automaton_awakening, 'The Automaton Awakening', mystery).
narrative_description(automaton_awakening, 'An automaton in the Hartwell factory begins showing signs of independent thought.').
narrative_trigger(automaton_awakening, (trait(X, eccentric), attribute(X, cultural_knowledge, CK), CK > 70)).
narrative_step(automaton_awakening, 0, 'Workers report an automaton deviating from its routine.').
narrative_step(automaton_awakening, 1, 'Jasper Cogsworth investigates and discovers genuine learning behavior.').
narrative_step(automaton_awakening, 2, 'The discovery sparks a philosophical debate across Ironhaven.').
narrative_step(automaton_awakening, 3, 'A decision must be made: dismantle the automaton or grant it rights.').
narrative_outcome(automaton_awakening, success, 'The automaton is recognized as sentient and a new era begins.').
narrative_outcome(automaton_awakening, failure, 'Fear wins out and the automaton is dismantled.').

%% The Lost Expedition
narrative(lost_expedition, 'The Lost Expedition', exploration).
narrative_description(lost_expedition, 'An airship expedition to the uncharted Skyreach Province goes missing, prompting a rescue mission.').
narrative_trigger(lost_expedition, (trait(X, adventurous), location(X, ironhaven))).
narrative_step(lost_expedition, 0, 'The research airship Horizon fails to return from Skyreach.').
narrative_step(lost_expedition, 1, 'A rescue crew is assembled at the Central Skyport.').
narrative_step(lost_expedition, 2, 'The rescue team encounters dangerous aether storms.').
narrative_step(lost_expedition, 3, 'The lost crew is found at a previously unknown aether deposit.').
narrative_outcome(lost_expedition, success, 'The crew is rescued and a major aether source is discovered.').
narrative_outcome(lost_expedition, failure, 'The rescue fails and both crews are stranded.').
