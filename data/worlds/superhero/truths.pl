%% Insimul Truths: Superhero
%% Source: data/worlds/superhero/truths.pl
%% Created: 2026-04-03
%% Total: 16 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Metahuman Registration
truth(metahuman_registration, 'Metahuman Registration', social_rule).
truth_content(metahuman_registration, 'All individuals with metahuman abilities are required to register with the city Metahuman Affairs Office. Unregistered metahumans face arrest. Many heroes oppose this law.').
truth_importance(metahuman_registration, 10).
truth_timestep(metahuman_registration, 0).

%% Secret Identities
truth(secret_identities, 'Secret Identities', social_rule).
truth_content(secret_identities, 'Most heroes maintain secret civilian identities to protect their families. Exposing a hero identity is considered one of the most dangerous acts a villain can commit.').
truth_importance(secret_identities, 10).
truth_timestep(secret_identities, 0).

%% Titan Tower
truth(titan_tower_truth, 'Titan Tower', world_fact).
truth_content(titan_tower_truth, 'Titan Tower serves as the headquarters of the hero alliance. Built in 1962, it contains advanced technology, a medical bay, and a war room for coordinating responses to threats.').
truth_importance(titan_tower_truth, 9).
truth_timestep(titan_tower_truth, 0).

%% The Quantum Event
truth(quantum_event, 'The Quantum Event', world_fact).
truth_content(quantum_event, 'In 1985, a particle accelerator accident at the Quantum Research Institute released exotic energy that granted powers to dozens of people. This event created the first generation of metahumans.').
truth_importance(quantum_event, 9).
truth_timestep(quantum_event, 0).

%% Hero Code
truth(hero_code, 'The Hero Code', social_rule).
truth_content(hero_code, 'Registered heroes follow an unwritten code: protect civilians first, minimize property damage, and never use lethal force unless absolutely necessary. Breaking the code results in expulsion.').
truth_importance(hero_code, 8).
truth_timestep(hero_code, 0).

%% Villain Territory
truth(villain_territory, 'Villain Territory', world_fact).
truth_content(villain_territory, 'Ironhaven is effectively controlled by criminal organizations. Police presence is minimal. Most villain operations are based out of the Ash District and Foundry Row.').
truth_importance(villain_territory, 8).
truth_timestep(villain_territory, 0).

%% Power Dampener Technology
truth(power_dampener_tech, 'Power Dampener Technology', world_fact).
truth_content(power_dampener_tech, 'Kepler Dynamics developed devices that suppress metahuman abilities within a limited radius. These are used in prisons, courtrooms, and by law enforcement. Villains constantly seek to disable or steal them.').
truth_importance(power_dampener_tech, 8).
truth_timestep(power_dampener_tech, 0).

%% The Narrows
truth(narrows_truth, 'The Narrows', world_fact).
truth_content(narrows_truth, 'The Narrows is the poorest district in Titan City. Crime rates are the highest in the metro area. A masked vigilante operates here outside official hero channels.').
truth_importance(narrows_truth, 7).
truth_timestep(narrows_truth, 0).

%% Public Opinion
truth(public_opinion, 'Public Opinion on Heroes', social_rule).
truth_content(public_opinion, 'Public opinion on metahumans is divided. Many view heroes as essential protectors, while others blame them for the collateral damage that accompanies super-powered conflicts.').
truth_importance(public_opinion, 7).
truth_timestep(public_opinion, 0).

%% The Daily Sentinel
truth(daily_sentinel_truth, 'The Daily Sentinel', world_fact).
truth_content(daily_sentinel_truth, 'The Daily Sentinel is the city most influential newspaper. Its hero beat reporter, Nora Vance, has broken more metahuman stories than any other journalist in the country.').
truth_importance(daily_sentinel_truth, 6).
truth_timestep(daily_sentinel_truth, 0).

%% Ironhaven Asylum
truth(asylum_truth, 'Ironhaven Asylum', world_fact).
truth_content(asylum_truth, 'The condemned Ironhaven Asylum was repurposed as a high-security metahuman prison. Power dampeners line every cell. Breakouts are rare but catastrophic when they occur.').
truth_importance(asylum_truth, 7).
truth_timestep(asylum_truth, 0).

%% Corruption in Government
truth(government_corruption, 'Government Corruption', social_rule).
truth_content(government_corruption, 'Several city officials are suspected of ties to Ironhaven criminal syndicates. Mayor Ward has launched an anti-corruption task force, but progress is slow.').
truth_importance(government_corruption, 7).
truth_timestep(government_corruption, 0).

%% Mutagen Trade
truth(mutagen_trade, 'Mutagen Trade', world_fact).
truth_content(mutagen_trade, 'A black market exists for mutagenic compounds that can temporarily grant or enhance metahuman abilities. The substances are highly addictive and often lethal. Dr. Mara Vex is the primary supplier.').
truth_importance(mutagen_trade, 8).
truth_timestep(mutagen_trade, 0).

%% Collateral Damage
truth(collateral_damage, 'Collateral Damage', social_rule).
truth_content(collateral_damage, 'Super-powered battles regularly cause millions in property damage. Insurance companies have created special metahuman damage policies. Some neighborhoods have been rebuilt multiple times.').
truth_importance(collateral_damage, 6).
truth_timestep(collateral_damage, 0).

%% The Memorial Statue
truth(memorial_statue_truth, 'The Memorial Statue', cultural_norm).
truth_content(memorial_statue_truth, 'The Memorial Statue in Midtown honors the heroes who fell during the Quantum Event. Every year on the anniversary, the city holds a remembrance ceremony.').
truth_importance(memorial_statue_truth, 5).
truth_timestep(memorial_statue_truth, 0).

%% Sidekick Tradition
truth(sidekick_tradition, 'Sidekick Tradition', cultural_norm).
truth_content(sidekick_tradition, 'Experienced heroes often mentor younger metahumans as sidekicks. This tradition is both praised as responsible training and criticized as child endangerment.').
truth_importance(sidekick_tradition, 6).
truth_timestep(sidekick_tradition, 0).
