%% Ensemble History: New Earth Colony -- Initial World State
%% Source: data/worlds/new_earth_colony/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% ─── Admiral Jane Shepard ───
trait(admiral_shepard, female).
trait(admiral_shepard, authoritative).
trait(admiral_shepard, strategic).
trait(admiral_shepard, disciplined).
trait(admiral_shepard, middle_aged).
attribute(admiral_shepard, charisma, 80).
attribute(admiral_shepard, leadership, 90).
attribute(admiral_shepard, combat_skill, 75).
attribute(admiral_shepard, empathy, 60).
status(admiral_shepard, colony_commander).

%% ─── Gordon Freeman ───
trait(scientist_freeman, male).
trait(scientist_freeman, brilliant).
trait(scientist_freeman, introverted).
trait(scientist_freeman, meticulous).
trait(scientist_freeman, middle_aged).
attribute(scientist_freeman, intelligence, 95).
attribute(scientist_freeman, charisma, 45).
attribute(scientist_freeman, research_skill, 90).
attribute(scientist_freeman, bravery, 70).
status(scientist_freeman, lead_xenobiologist).
relationship(scientist_freeman, admiral_shepard, trusted_colleague).

%% ─── Cortana AI-7 ───
trait(ai_cortana, female).
trait(ai_cortana, analytical).
trait(ai_cortana, curious).
trait(ai_cortana, evolving).
trait(ai_cortana, young).
attribute(ai_cortana, intelligence, 99).
attribute(ai_cortana, empathy, 40).
attribute(ai_cortana, processing_power, 95).
attribute(ai_cortana, self_awareness, 75).
status(ai_cortana, ai_researcher).
relationship(ai_cortana, admiral_shepard, loyalty).

%% ─── Sarah McCall ───
trait(pilot_mccall, female).
trait(pilot_mccall, daring).
trait(pilot_mccall, quick_witted).
trait(pilot_mccall, sociable).
trait(pilot_mccall, young_adult).
attribute(pilot_mccall, piloting_skill, 90).
attribute(pilot_mccall, charisma, 70).
attribute(pilot_mccall, bravery, 85).
attribute(pilot_mccall, technical_skill, 65).
status(pilot_mccall, shuttle_pilot).
relationship(pilot_mccall, engineer_patel, close_friends).

%% ─── Raj Patel ───
trait(engineer_patel, male).
trait(engineer_patel, resourceful).
trait(engineer_patel, calm).
trait(engineer_patel, practical).
trait(engineer_patel, middle_aged).
attribute(engineer_patel, technical_skill, 90).
attribute(engineer_patel, intelligence, 80).
attribute(engineer_patel, charisma, 55).
attribute(engineer_patel, endurance, 70).
status(engineer_patel, chief_engineer).
relationship(engineer_patel, pilot_mccall, close_friends).
relationship(engineer_patel, scientist_freeman, professional_respect).

%% ─── Cross-character relationships ───
network(admiral_shepard, scientist_freeman, trust, 7).
network(admiral_shepard, ai_cortana, trust, 6).
network(admiral_shepard, pilot_mccall, trust, 5).
network(admiral_shepard, engineer_patel, trust, 6).
network(scientist_freeman, ai_cortana, friendship, 5).
network(pilot_mccall, engineer_patel, friendship, 8).
network(scientist_freeman, engineer_patel, respect, 7).
