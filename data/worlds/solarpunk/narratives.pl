%% Insimul Narratives: Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative arcs
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_priority/2
%%   narrative_trigger/2, narrative_stage/4, narrative_outcome/3

%% The Water Sharing Accord
narrative(water_accord, 'The Water Sharing Accord', political_arc).
narrative_description(water_accord, 'Growing water demands from all three settlements strain the shared watershed. A fair agreement must be reached before the dry season.').
narrative_priority(water_accord, 9).
narrative_trigger(water_accord, (time_step(T), T >= 5)).
narrative_stage(water_accord, 0, 'Tension', 'Tidecrest Village reports declining water flow from the upstream watershed that Heliotrope Commons controls.').
narrative_stage(water_accord, 1, 'Investigation', 'Data gathering reveals Heliotrope is using more than its historical share due to expansion.').
narrative_stage(water_accord, 2, 'Negotiation', 'Elena Vasquez and Astrid Maren debate terms. The player mediates.').
narrative_stage(water_accord, 3, 'Resolution', 'A new water-sharing protocol is drafted and voted on at a joint assembly.').
narrative_outcome(water_accord, fair_share, 'An equitable agreement strengthens inter-settlement trust and cooperation.').
narrative_outcome(water_accord, heliotrope_favored, 'Heliotrope keeps more water but Tidecrest grows resentful.').
narrative_outcome(water_accord, infrastructure, 'A new reservoir is built to serve all settlements, requiring major collective effort.').

%% The Mycelium Breakthrough
narrative(mycelium_breakthrough, 'The Mycelium Breakthrough', character_arc).
narrative_description(mycelium_breakthrough, 'Olu Adeyemi discovers the mycelium network can transmit simple signals between settlements, potentially revolutionizing communication.').
narrative_priority(mycelium_breakthrough, 8).
narrative_trigger(mycelium_breakthrough, (met(Player, olu_adeyemi), time_step(T), T >= 8)).
narrative_stage(mycelium_breakthrough, 0, 'Discovery', 'Olu notices that the mycelium network responds to electrical stimulation with detectable patterns.').
narrative_stage(mycelium_breakthrough, 1, 'Research', 'With help from Hiro Tanaka, Olu develops a prototype bio-communication device.').
narrative_stage(mycelium_breakthrough, 2, 'Trial', 'The first test sends a simple message from Heliotrope to Roothold through the fungal network.').
narrative_stage(mycelium_breakthrough, 3, 'Scaling', 'The community must decide how much to invest in expanding this living communication system.').
narrative_outcome(mycelium_breakthrough, full_network, 'A living communication network connects all three settlements through the underground mycelium.').
narrative_outcome(mycelium_breakthrough, limited, 'The technology works but is too fragile for reliable use. Research continues.').
narrative_outcome(mycelium_breakthrough, rejected, 'The community votes against expanding, fearing harm to the natural fungal ecosystem.').

%% The Outsiders
narrative(the_outsiders, 'The Outsiders', main_arc).
narrative_description(the_outsiders, 'A group of climate refugees arrives seeking shelter. The communities must decide how to welcome them without straining resources.').
narrative_priority(the_outsiders, 10).
narrative_trigger(the_outsiders, (time_step(T), T >= 10)).
narrative_stage(the_outsiders, 0, 'Arrival', 'A group of thirty people arrives at Heliotrope Commons, displaced by flooding in the lowlands.').
narrative_stage(the_outsiders, 1, 'Debate', 'The assembly debates. Resources are tight, but turning people away conflicts with core values.').
narrative_stage(the_outsiders, 2, 'Integration', 'A plan is proposed to settle the newcomers at a new fourth site between Heliotrope and Roothold.').
narrative_stage(the_outsiders, 3, 'Building', 'The entire community rallies to build new housing and expand food production.').
narrative_outcome(the_outsiders, welcome, 'The newcomers are fully integrated and bring valuable skills that strengthen all communities.').
narrative_outcome(the_outsiders, new_settlement, 'A fourth settlement is founded, expanding the collective but stretching resources thin.').
narrative_outcome(the_outsiders, partial, 'Some refugees are accepted, others directed to settlements further away. Guilt lingers.').

%% The Old Growth Decision
narrative(old_growth_decision, 'The Old Growth Decision', political_arc).
narrative_description(old_growth_decision, 'A stand of old-growth trees in the restored forest contains rare medicinal fungi, but harvesting them would damage the ancient trees.').
narrative_priority(old_growth_decision, 7).
narrative_trigger(old_growth_decision, (completed_quest(Player, forest_census))).
narrative_stage(old_growth_decision, 0, 'Discovery', 'Wren Calloway finds a rare medicinal fungus growing only on ancient trees in the deepest forest.').
narrative_stage(old_growth_decision, 1, 'Dilemma', 'Priya Tanaka says the fungus could treat a spreading illness, but harvesting may kill the host trees.').
narrative_stage(old_growth_decision, 2, 'Research', 'The player investigates whether sustainable harvesting is possible.').
narrative_stage(old_growth_decision, 3, 'Vote', 'The community assembly votes on whether to harvest, protect, or find an alternative.').
narrative_outcome(old_growth_decision, protect, 'The old growth is declared a sanctuary. The illness is treated with a less effective but sustainable alternative.').
narrative_outcome(old_growth_decision, sustainable_harvest, 'A careful harvesting protocol is developed that preserves the trees while obtaining the medicine.').
narrative_outcome(old_growth_decision, full_harvest, 'The fungus is harvested to save lives, but several ancient trees die. The community mourns the loss.').

%% Generational Shift
narrative(generational_shift, 'Generational Shift', character_arc).
narrative_description(generational_shift, 'The younger generation pushes for bolder experimentation and faster growth, while elders advocate caution and proven methods.').
narrative_priority(generational_shift, 7).
narrative_trigger(generational_shift, (time_step(T), T >= 15)).
narrative_stage(generational_shift, 0, 'Proposal', 'Rio Vasquez and Kai Tanaka propose radical new bio-architecture that older members consider untested.').
narrative_stage(generational_shift, 1, 'Tension', 'Emeka Okafor and Elena Vasquez urge patience. The youth feel stifled.').
narrative_stage(generational_shift, 2, 'Experiment', 'A compromise allows a small-scale test of the new approach.').
narrative_stage(generational_shift, 3, 'Result', 'The test results determine whether the community embraces innovation or recommits to tradition.').
narrative_outcome(generational_shift, innovation, 'The experiment succeeds. The community evolves its approach, empowering youth leadership.').
narrative_outcome(generational_shift, tradition, 'The experiment fails, reinforcing trust in proven methods. Elders gain influence.').
narrative_outcome(generational_shift, synthesis, 'Elements of both approaches are combined into a new methodology that satisfies everyone.').

%% The Coral Song
narrative(coral_song, 'The Coral Song', character_arc).
narrative_description(coral_song, 'Lena Maren discovers that the restored reef produces sounds that correlate with ecosystem health, inspiring a new monitoring system.').
narrative_priority(coral_song, 6).
narrative_trigger(coral_song, (completed_quest(Player, reef_restoration))).
narrative_stage(coral_song, 0, 'Listening', 'Lena notices rhythmic clicking sounds while diving near the reef and begins recording them.').
narrative_stage(coral_song, 1, 'Pattern', 'Analysis reveals that healthy reef sections produce distinct acoustic signatures.').
narrative_stage(coral_song, 2, 'Application', 'Astrid Maren proposes using acoustic monitoring to track reef restoration progress.').
narrative_stage(coral_song, 3, 'Art', 'Lena creates a musical composition from the reef sounds, debuting it at the solstice celebration.').
narrative_outcome(coral_song, monitoring, 'Acoustic reef monitoring becomes a standard tool, improving restoration efforts.').
narrative_outcome(coral_song, art_only, 'The music inspires the community but the monitoring system proves impractical.').
narrative_outcome(coral_song, both, 'Science and art merge as the reef sounds become both a monitoring tool and a cultural treasure.').
