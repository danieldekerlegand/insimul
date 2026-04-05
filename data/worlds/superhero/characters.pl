%% Insimul Characters: Superhero
%% Source: data/worlds/superhero/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (heroes, villains, civilians)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Heroes
%% ═══════════════════════════════════════════════════════════

%% Commander Valiant (Marcus Cole)
person(marcus_cole).
first_name(marcus_cole, 'Marcus').
last_name(marcus_cole, 'Cole').
full_name(marcus_cole, 'Marcus Cole').
gender(marcus_cole, male).
alive(marcus_cole).
generation(marcus_cole, 0).
founder_family(marcus_cole).
location(marcus_cole, titan_city).

%% Lumina (Dr. Sasha Orlov)
person(sasha_orlov).
first_name(sasha_orlov, 'Sasha').
last_name(sasha_orlov, 'Orlov').
full_name(sasha_orlov, 'Sasha Orlov').
gender(sasha_orlov, female).
alive(sasha_orlov).
generation(sasha_orlov, 0).
founder_family(sasha_orlov).
location(sasha_orlov, titan_city).

%% Ironclad (James Kepler)
person(james_kepler).
first_name(james_kepler, 'James').
last_name(james_kepler, 'Kepler').
full_name(james_kepler, 'James Kepler').
gender(james_kepler, male).
alive(james_kepler).
generation(james_kepler, 0).
founder_family(james_kepler).
location(james_kepler, titan_city).

%% Phantom (Lin Zhao)
person(lin_zhao).
first_name(lin_zhao, 'Lin').
last_name(lin_zhao, 'Zhao').
full_name(lin_zhao, 'Lin Zhao').
gender(lin_zhao, female).
alive(lin_zhao).
generation(lin_zhao, 0).
location(lin_zhao, titan_city).

%% Titan (Derek Stone)
person(derek_stone).
first_name(derek_stone, 'Derek').
last_name(derek_stone, 'Stone').
full_name(derek_stone, 'Derek Stone').
gender(derek_stone, male).
alive(derek_stone).
generation(derek_stone, 0).
location(derek_stone, titan_city).

%% ═══════════════════════════════════════════════════════════
%% Villains
%% ═══════════════════════════════════════════════════════════

%% Overlord (Victor Graves)
person(victor_graves).
first_name(victor_graves, 'Victor').
last_name(victor_graves, 'Graves').
full_name(victor_graves, 'Victor Graves').
gender(victor_graves, male).
alive(victor_graves).
generation(victor_graves, 0).
founder_family(victor_graves).
location(victor_graves, ironhaven).

%% Toxica (Dr. Mara Vex)
person(mara_vex).
first_name(mara_vex, 'Mara').
last_name(mara_vex, 'Vex').
full_name(mara_vex, 'Mara Vex').
gender(mara_vex, female).
alive(mara_vex).
generation(mara_vex, 0).
location(mara_vex, ironhaven).

%% Shadowblade (Kai Nox)
person(kai_nox).
first_name(kai_nox, 'Kai').
last_name(kai_nox, 'Nox').
full_name(kai_nox, 'Kai Nox').
gender(kai_nox, male).
alive(kai_nox).
generation(kai_nox, 0).
location(kai_nox, titan_city).

%% Puppeteer (Elaine Draven)
person(elaine_draven).
first_name(elaine_draven, 'Elaine').
last_name(elaine_draven, 'Draven').
full_name(elaine_draven, 'Elaine Draven').
gender(elaine_draven, female).
alive(elaine_draven).
generation(elaine_draven, 0).
location(elaine_draven, ironhaven).

%% Wrecking Ball (Bruno Krag)
person(bruno_krag).
first_name(bruno_krag, 'Bruno').
last_name(bruno_krag, 'Krag').
full_name(bruno_krag, 'Bruno Krag').
gender(bruno_krag, male).
alive(bruno_krag).
generation(bruno_krag, 0).
location(bruno_krag, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Civilians
%% ═══════════════════════════════════════════════════════════

%% Mayor Patricia Ward
person(patricia_ward).
first_name(patricia_ward, 'Patricia').
last_name(patricia_ward, 'Ward').
full_name(patricia_ward, 'Patricia Ward').
gender(patricia_ward, female).
alive(patricia_ward).
generation(patricia_ward, 0).
location(patricia_ward, titan_city).

%% Detective Frank Morrow
person(frank_morrow).
first_name(frank_morrow, 'Frank').
last_name(frank_morrow, 'Morrow').
full_name(frank_morrow, 'Frank Morrow').
gender(frank_morrow, male).
alive(frank_morrow).
generation(frank_morrow, 0).
location(frank_morrow, titan_city).

%% Reporter Nora Vance
person(nora_vance).
first_name(nora_vance, 'Nora').
last_name(nora_vance, 'Vance').
full_name(nora_vance, 'Nora Vance').
gender(nora_vance, female).
alive(nora_vance).
generation(nora_vance, 0).
location(nora_vance, titan_city).

%% Dr. Raymond Cho -- Hospital Chief
person(raymond_cho).
first_name(raymond_cho, 'Raymond').
last_name(raymond_cho, 'Cho').
full_name(raymond_cho, 'Raymond Cho').
gender(raymond_cho, male).
alive(raymond_cho).
generation(raymond_cho, 0).
location(raymond_cho, titan_city).

%% Lily Kepler -- Daughter of Ironclad
person(lily_kepler).
first_name(lily_kepler, 'Lily').
last_name(lily_kepler, 'Kepler').
full_name(lily_kepler, 'Lily Kepler').
gender(lily_kepler, female).
alive(lily_kepler).
generation(lily_kepler, 1).
parent(james_kepler, lily_kepler).
location(lily_kepler, titan_city).

%% Tommy Morrow -- Young Informant
person(tommy_morrow).
first_name(tommy_morrow, 'Tommy').
last_name(tommy_morrow, 'Morrow').
full_name(tommy_morrow, 'Tommy Morrow').
gender(tommy_morrow, male).
alive(tommy_morrow).
generation(tommy_morrow, 1).
parent(frank_morrow, tommy_morrow).
location(tommy_morrow, titan_city).

%% Rosa Delgado -- Diner Owner
person(rosa_delgado).
first_name(rosa_delgado, 'Rosa').
last_name(rosa_delgado, 'Delgado').
full_name(rosa_delgado, 'Rosa Delgado').
gender(rosa_delgado, female).
alive(rosa_delgado).
generation(rosa_delgado, 0).
location(rosa_delgado, titan_city).

%% Hector "Fence" Ruiz -- Pawn Shop Owner
person(hector_ruiz).
first_name(hector_ruiz, 'Hector').
last_name(hector_ruiz, 'Ruiz').
full_name(hector_ruiz, 'Hector Ruiz').
gender(hector_ruiz, male).
alive(hector_ruiz).
generation(hector_ruiz, 0).
location(hector_ruiz, titan_city).
