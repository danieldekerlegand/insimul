%% Insimul Truths: Horror World
%% Source: data/worlds/horror/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% The Founding Pact
truth(founding_pact, 'The Founding Pact', world_fact).
truth_content(founding_pact, 'Grimhaven was founded in 1793 by settlers who made a pact with something beneath the earth. The exact terms are lost, but the consequences persist. Every generation, the entity demands tribute.').
truth_importance(founding_pact, 10).
truth_timestep(founding_pact, 0).

%% The Fog
truth(the_fog, 'The Fog', world_fact).
truth_content(the_fog, 'A thick, unnatural fog rolls into Ravenhollow from the sea on certain nights. Things move within it. Doors must be locked and windows shuttered. Those caught outside when the fog comes are rarely found whole.').
truth_importance(the_fog, 10).
truth_timestep(the_fog, 0).

%% Sanity Erosion
truth(sanity_erosion, 'Sanity Erosion', world_fact).
truth_content(sanity_erosion, 'Prolonged exposure to the supernatural erodes the mind. Those who see too much begin hearing whispers, losing time, and seeing geometry that does not obey natural law. The asylum was built to contain such people.').
truth_importance(sanity_erosion, 9).
truth_timestep(sanity_erosion, 0).

%% Salt Wards
truth(salt_wards, 'Salt Wards', social_rule).
truth_content(salt_wards, 'A circle of blessed salt prevents intrusion by entities from beyond. Most households in Ravenhollow keep salt lines at their thresholds. Breaking a salt line, even accidentally, is considered extremely dangerous.').
truth_importance(salt_wards, 8).
truth_timestep(salt_wards, 0).

%% The Blackwood Cult
truth(blackwood_cult, 'The Blackwood Cult', world_fact).
truth_content(blackwood_cult, 'The Blackwood family has led a secret cult called the Order of the Black Star for generations. They worship an entity they believe sleeps beneath Grimhaven. Their rituals occur at the stone circle during new moons.').
truth_importance(blackwood_cult, 9).
truth_timestep(blackwood_cult, 0).

%% The Disappeared
truth(the_disappeared, 'The Disappeared', world_fact).
truth_content(the_disappeared, 'People have been vanishing from Ravenhollow for decades. Always in groups of three, always during autumn. The sheriff keeps a file but the cases remain unsolved. The townsfolk do not speak of it openly.').
truth_importance(the_disappeared, 9).
truth_timestep(the_disappeared, 0).

%% Hallowed Ground
truth(hallowed_ground, 'Hallowed Ground', social_rule).
truth_content(hallowed_ground, 'Churches, consecrated cemeteries, and sites blessed by genuine faith resist supernatural intrusion. The Ravenhollow Church is one of the few truly safe places in town. Its protection weakens if faith falters.').
truth_importance(hallowed_ground, 8).
truth_timestep(hallowed_ground, 0).

%% The 1923 Incident
truth(incident_1923, 'The 1923 Incident', world_fact).
truth_content(incident_1923, 'In 1923, a ship called the Morrigan ran aground near the old lighthouse during a storm. All hands were lost. The asylum filled with patients that same year. The events are connected, though no one can explain how.').
truth_importance(incident_1923, 8).
truth_timestep(incident_1923, 0).

%% Mistrust of Outsiders
truth(mistrust_outsiders, 'Mistrust of Outsiders', social_rule).
truth_content(mistrust_outsiders, 'Ravenhollow residents are deeply suspicious of outsiders. Strangers asking questions are met with silence or misdirection. The town protects its secrets not out of malice but from a belief that ignorance is safer.').
truth_importance(mistrust_outsiders, 7).
truth_timestep(mistrust_outsiders, 0).

%% The Entity Below
truth(entity_below, 'The Entity Below', world_fact).
truth_content(entity_below, 'Something vast and ancient sleeps in the caverns beneath Blackwood County. It is not dead, not alive, and not of this world. The cult believes it will awaken. The town secretly dreads it. Its dreams leak into the waking world.').
truth_importance(entity_below, 10).
truth_timestep(entity_below, 0).

%% Fire as Defense
truth(fire_defense, 'Fire as Defense', social_rule).
truth_content(fire_defense, 'Fire is one of the few reliable defenses against supernatural manifestations. Torches, bonfires, and lit hearths keep the darkness at bay. The old lighthouse still functions because someone keeps its flame burning.').
truth_importance(fire_defense, 7).
truth_timestep(fire_defense, 0).

%% The Hanging Tree
truth(hanging_tree, 'The Hanging Tree', world_fact).
truth_content(hanging_tree, 'The ancient oak in Grimhaven was used to hang accused witches in 1793. The tree still stands, twisted and leafless even in summer. Locals say the faces of the hanged can be seen in its bark on moonless nights.').
truth_importance(hanging_tree, 7).
truth_timestep(hanging_tree, 0).

%% No Escape
truth(no_escape, 'No One Leaves', social_rule).
truth_content(no_escape, 'Those who try to leave Ravenhollow permanently find themselves turning back. Roads loop, trains are missed, car engines fail. The town does not release its residents willingly. Some believe the entity keeps them.').
truth_importance(no_escape, 8).
truth_timestep(no_escape, 0).

%% The Old Well
truth(old_well_truth, 'The Old Well', world_fact).
truth_content(old_well_truth, 'The well in Grimhaven was the site of the original pact. Its water is tainted and occasionally runs red. The cult symbol is carved into its inner wall. Locals will not drink from it, though animals are drawn to it.').
truth_importance(old_well_truth, 7).
truth_timestep(old_well_truth, 0).

%% Dreams and Visions
truth(dreams_visions, 'Dreams and Visions', world_fact).
truth_content(dreams_visions, 'Residents of Ravenhollow share recurring nightmares of vast underwater cities and things with too many angles. These dreams intensify before disappearances. Some sensitive individuals receive prophetic visions that come true.').
truth_importance(dreams_visions, 8).
truth_timestep(dreams_visions, 0).

%% The Asylum
truth(asylum_truth, 'The Asylum', world_fact).
truth_content(asylum_truth, 'The asylum on Ridge Road was built in 1920 and abandoned in 1950. Dr. Harlan Ashford conducted experiments on patients there, claiming he could cure madness caused by supernatural exposure. His methods were cruel and his notes are in code.').
truth_importance(asylum_truth, 7).
truth_timestep(asylum_truth, 0).

%% The Sacred Flame
truth(sacred_flame, 'The Sacred Flame', social_rule).
truth_content(sacred_flame, 'Father Thorne maintains a consecrated flame in the church that has burned continuously since the church was founded. The townsfolk believe that if the flame goes out, the protections over Ravenhollow will fail entirely.').
truth_importance(sacred_flame, 8).
truth_timestep(sacred_flame, 0).

%% Ashford Mill Catastrophe
truth(ashford_catastrophe, 'Ashford Mill Catastrophe', world_fact).
truth_content(ashford_catastrophe, 'The iron mill at Ashford was abandoned after every worker on the night shift disappeared in 1935. The furnaces were found cold, tools laid down mid-task, and dinner plates still warm. No bodies were ever recovered.').
truth_importance(ashford_catastrophe, 7).
truth_timestep(ashford_catastrophe, 0).
