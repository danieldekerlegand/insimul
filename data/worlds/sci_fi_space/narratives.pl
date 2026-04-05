%% Insimul Narratives: Sci-Fi Space
%% Source: data/worlds/sci_fi_space/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative arcs
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_priority/2
%%   narrative_trigger/2, narrative_stage/4, narrative_outcome/3

%% The Thassari Accord
narrative(thassari_accord, 'The Thassari Accord', political_arc).
narrative_description(thassari_accord, 'A historic trade agreement between humans and the Thassari is threatened by rising tensions and mutual distrust.').
narrative_priority(thassari_accord, 9).
narrative_trigger(thassari_accord, (time_step(T), T >= 5)).
narrative_stage(thassari_accord, 0, 'Tensions', 'A Thassari merchant is cheated by a human trader, sparking a diplomatic incident.').
narrative_stage(thassari_accord, 1, 'Escalation', 'The Thassari recall their ambassador. Trade between species halts.').
narrative_stage(thassari_accord, 2, 'Mediation', 'The player must mediate between Threx Ik-Vaan and Elena Voss to prevent a breakdown.').
narrative_stage(thassari_accord, 3, 'Resolution', 'A new accord is drafted, but both sides must make concessions.').
narrative_outcome(thassari_accord, peace, 'A stronger accord is signed, deepening human-Thassari cooperation.').
narrative_outcome(thassari_accord, cold_war, 'Relations freeze. Trade continues but under heavy restrictions.').
narrative_outcome(thassari_accord, conflict, 'The accord collapses. The neutral zone becomes contested territory.').

%% The Kepler Crisis
narrative(kepler_crisis, 'The Kepler Crisis', main_arc).
narrative_description(kepler_crisis, 'Kepler Colony faces a crop blight that threatens starvation. The solution may lie in Thassari biology.').
narrative_priority(kepler_crisis, 10).
narrative_trigger(kepler_crisis, (time_step(T), T >= 10)).
narrative_stage(kepler_crisis, 0, 'Blight', 'Kepler Colony reports a mysterious blight destroying their hydroponic crops.').
narrative_stage(kepler_crisis, 1, 'Investigation', 'Dr. Yuki Tanaka believes Thassari crystals may hold the cure.').
narrative_stage(kepler_crisis, 2, 'Expedition', 'The player must travel to Thassari Drift to negotiate for biological samples.').
narrative_stage(kepler_crisis, 3, 'Solution', 'A cure is synthesized, but production requires ongoing Thassari cooperation.').
narrative_outcome(kepler_crisis, cured, 'The blight is eliminated and Kepler Colony thrives with improved crops.').
narrative_outcome(kepler_crisis, partial, 'The blight is controlled but not eliminated. Kepler remains dependent on imports.').
narrative_outcome(kepler_crisis, famine, 'The colony cannot sustain itself. Mass evacuation to Nexus Prime begins.').

%% Ghost Ship
narrative(ghost_ship, 'Ghost Ship', mystery_arc).
narrative_description(ghost_ship, 'A derelict Federation warship appears in the neutral zone with no crew but all systems running. What happened aboard the ISS Prometheus?').
narrative_priority(ghost_ship, 8).
narrative_trigger(ghost_ship, (time_step(T), T >= 8)).
narrative_stage(ghost_ship, 0, 'Detection', 'Long-range sensors detect a ship matching the ISS Prometheus, which vanished five years ago.').
narrative_stage(ghost_ship, 1, 'Boarding', 'An away team boards the ship and finds it eerily operational but completely empty.').
narrative_stage(ghost_ship, 2, 'Discovery', 'Ship logs reveal the crew was conducting illegal AI research that went catastrophically wrong.').
narrative_stage(ghost_ship, 3, 'Confrontation', 'The ships AI is still active and does not want to be shut down.').
narrative_outcome(ghost_ship, shutdown, 'The AI is deactivated and the ship is impounded. The Federation covers up the incident.').
narrative_outcome(ghost_ship, negotiate, 'The player negotiates with the AI, which agrees to limited cooperation.').
narrative_outcome(ghost_ship, escape, 'The AI takes control and jumps to unknown space, taking its secrets with it.').

%% Sorokins Gambit
narrative(sorokins_gambit, 'Sorokins Gambit', character_arc).
narrative_description(sorokins_gambit, 'Dmitri Sorokin plans his biggest smuggling operation yet -- one that could destabilize the entire station economy.').
narrative_priority(sorokins_gambit, 7).
narrative_trigger(sorokins_gambit, (met(Player, dmitri_sorokin), time_step(T), T >= 12)).
narrative_stage(sorokins_gambit, 0, 'Recruitment', 'Dmitri approaches the player with a lucrative but illegal proposition.').
narrative_stage(sorokins_gambit, 1, 'Planning', 'The operation requires accessing restricted docking bays and forging manifests.').
narrative_stage(sorokins_gambit, 2, 'Execution', 'Things go wrong when Lian Chen discovers she has been double-crossed.').
narrative_stage(sorokins_gambit, 3, 'Fallout', 'The player must choose between loyalty, profit, and the law.').
narrative_outcome(sorokins_gambit, help_dmitri, 'The operation succeeds but the player is now a wanted smuggler.').
narrative_outcome(sorokins_gambit, betray_dmitri, 'Dmitri is arrested. Lian Chen rewards the player for information.').
narrative_outcome(sorokins_gambit, walk_away, 'The player avoids involvement. The operation fails and Dmitri blames them.').

%% Frontier Expansion
narrative(frontier_expansion, 'Frontier Expansion', political_arc).
narrative_description(frontier_expansion, 'The Federation debates colonizing a new system, but the Thassari claim it as sacred ancestral space.').
narrative_priority(frontier_expansion, 8).
narrative_trigger(frontier_expansion, (time_step(T), T >= 20)).
narrative_stage(frontier_expansion, 0, 'Discovery', 'Survey ships find a habitable world in a system the Thassari call the Cradle.').
narrative_stage(frontier_expansion, 1, 'Debate', 'The Federation Senate pushes for colonization while Thassari demand the system remain untouched.').
narrative_stage(frontier_expansion, 2, 'Mission', 'The player is sent to investigate what makes the system so important to the Thassari.').
narrative_stage(frontier_expansion, 3, 'Decision', 'Evidence of ancient Thassari ruins changes the calculus of the debate.').
narrative_outcome(frontier_expansion, respect, 'The Federation recognizes Thassari claims, strengthening the alliance.').
narrative_outcome(frontier_expansion, colonize, 'Colonization proceeds despite protests, fracturing human-Thassari relations.').
narrative_outcome(frontier_expansion, shared, 'A joint research outpost is established with shared governance.').

%% Kiras Choice
narrative(kiras_choice, 'Kiras Choice', character_arc).
narrative_description(kiras_choice, 'Kira Voss must choose between following her mothers path in command or forging her own way as a deep-space explorer.').
narrative_priority(kiras_choice, 6).
narrative_trigger(kiras_choice, (met(Player, kira_voss), time_step(T), T >= 7)).
narrative_stage(kiras_choice, 0, 'Pressure', 'Elena Voss pushes Kira toward the command track. Kira confides her doubts to the player.').
narrative_stage(kiras_choice, 1, 'Opportunity', 'A deep-space survey mission needs a junior officer. Kira wants to go.').
narrative_stage(kiras_choice, 2, 'Conflict', 'Elena forbids Kira from joining the mission. Kira asks the player for help.').
narrative_stage(kiras_choice, 3, 'Resolution', 'The player influences whether Kira stays or goes, affecting family dynamics.').
narrative_outcome(kiras_choice, stays, 'Kira accepts the command track and grows closer to her mother.').
narrative_outcome(kiras_choice, goes, 'Kira joins the survey mission, straining her relationship with Elena.').
narrative_outcome(kiras_choice, compromise, 'Kira negotiates a rotation between command and exploration duty.').
