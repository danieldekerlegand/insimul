%% Ensemble History: Superhero -- Initial World State
%% Source: data/worlds/superhero/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Marcus Cole (Commander Valiant) ---
trait(marcus_cole, male).
trait(marcus_cole, heroic).
trait(marcus_cole, commanding).
trait(marcus_cole, disciplined).
trait(marcus_cole, middle_aged).
attribute(marcus_cole, charisma, 85).
attribute(marcus_cole, self_assuredness, 90).
attribute(marcus_cole, cultural_knowledge, 60).

%% --- Sasha Orlov (Lumina) ---
trait(sasha_orlov, female).
trait(sasha_orlov, brilliant).
trait(sasha_orlov, cautious).
trait(sasha_orlov, compassionate).
attribute(sasha_orlov, charisma, 70).
attribute(sasha_orlov, cultural_knowledge, 85).
attribute(sasha_orlov, self_assuredness, 65).
relationship(sasha_orlov, marcus_cole, allies).

%% --- James Kepler (Ironclad) ---
trait(james_kepler, male).
trait(james_kepler, inventive).
trait(james_kepler, protective).
trait(james_kepler, wealthy).
trait(james_kepler, middle_aged).
attribute(james_kepler, charisma, 75).
attribute(james_kepler, cunningness, 70).
attribute(james_kepler, cultural_knowledge, 65).
relationship(james_kepler, marcus_cole, allies).

%% --- Lin Zhao (Phantom) ---
trait(lin_zhao, female).
trait(lin_zhao, stealthy).
trait(lin_zhao, independent).
trait(lin_zhao, mysterious).
attribute(lin_zhao, charisma, 55).
attribute(lin_zhao, cunningness, 80).
attribute(lin_zhao, self_assuredness, 70).
relationship(lin_zhao, marcus_cole, allies).

%% --- Derek Stone (Titan) ---
trait(derek_stone, male).
trait(derek_stone, strong).
trait(derek_stone, loyal).
trait(derek_stone, impulsive).
attribute(derek_stone, charisma, 65).
attribute(derek_stone, self_assuredness, 75).
attribute(derek_stone, sensitiveness, 50).
relationship(derek_stone, marcus_cole, allies).
relationship(derek_stone, james_kepler, friends).

%% --- Victor Graves (Overlord) ---
trait(victor_graves, male).
trait(victor_graves, calculating).
trait(victor_graves, megalomaniac).
trait(victor_graves, charismatic).
trait(victor_graves, middle_aged).
attribute(victor_graves, charisma, 80).
attribute(victor_graves, cunningness, 90).
attribute(victor_graves, self_assuredness, 95).
relationship(victor_graves, marcus_cole, enemies).

%% --- Mara Vex (Toxica) ---
trait(mara_vex, female).
trait(mara_vex, brilliant).
trait(mara_vex, ruthless).
trait(mara_vex, obsessive).
attribute(mara_vex, charisma, 50).
attribute(mara_vex, cunningness, 85).
attribute(mara_vex, cultural_knowledge, 80).
relationship(mara_vex, victor_graves, allies).
relationship(mara_vex, sasha_orlov, enemies).

%% --- Kai Nox (Shadowblade) ---
trait(kai_nox, male).
trait(kai_nox, stealthy).
trait(kai_nox, mercenary).
trait(kai_nox, conflicted).
attribute(kai_nox, charisma, 55).
attribute(kai_nox, cunningness, 75).
attribute(kai_nox, self_assuredness, 60).

%% --- Elaine Draven (Puppeteer) ---
trait(elaine_draven, female).
trait(elaine_draven, manipulative).
trait(elaine_draven, patient).
trait(elaine_draven, vindictive).
attribute(elaine_draven, charisma, 70).
attribute(elaine_draven, cunningness, 85).
attribute(elaine_draven, propriety, 60).
relationship(elaine_draven, victor_graves, allies).

%% --- Bruno Krag (Wrecking Ball) ---
trait(bruno_krag, male).
trait(bruno_krag, strong).
trait(bruno_krag, aggressive).
trait(bruno_krag, simple).
attribute(bruno_krag, charisma, 30).
attribute(bruno_krag, self_assuredness, 80).
attribute(bruno_krag, cunningness, 25).
relationship(bruno_krag, victor_graves, allies).

%% --- Patricia Ward ---
trait(patricia_ward, female).
trait(patricia_ward, political).
trait(patricia_ward, determined).
trait(patricia_ward, middle_aged).
attribute(patricia_ward, charisma, 80).
attribute(patricia_ward, cunningness, 65).
attribute(patricia_ward, propriety, 85).
relationship(patricia_ward, marcus_cole, friends).

%% --- Frank Morrow ---
trait(frank_morrow, male).
trait(frank_morrow, tenacious).
trait(frank_morrow, honest).
trait(frank_morrow, middle_aged).
attribute(frank_morrow, charisma, 55).
attribute(frank_morrow, cunningness, 70).
attribute(frank_morrow, self_assuredness, 65).
relationship(frank_morrow, marcus_cole, friends).

%% --- Nora Vance ---
trait(nora_vance, female).
trait(nora_vance, ambitious).
trait(nora_vance, perceptive).
trait(nora_vance, fearless).
attribute(nora_vance, charisma, 75).
attribute(nora_vance, cunningness, 60).
attribute(nora_vance, self_assuredness, 70).

%% --- Raymond Cho ---
trait(raymond_cho, male).
trait(raymond_cho, caring).
trait(raymond_cho, overworked).
trait(raymond_cho, middle_aged).
attribute(raymond_cho, charisma, 60).
attribute(raymond_cho, cultural_knowledge, 75).
attribute(raymond_cho, propriety, 80).

%% --- Lily Kepler ---
trait(lily_kepler, female).
trait(lily_kepler, young).
trait(lily_kepler, idealistic).
trait(lily_kepler, rebellious).
attribute(lily_kepler, charisma, 65).
attribute(lily_kepler, self_assuredness, 55).
attribute(lily_kepler, sensitiveness, 70).

%% --- Tommy Morrow ---
trait(tommy_morrow, male).
trait(tommy_morrow, young).
trait(tommy_morrow, streetwise).
trait(tommy_morrow, brave).
attribute(tommy_morrow, charisma, 60).
attribute(tommy_morrow, cunningness, 55).
attribute(tommy_morrow, self_assuredness, 45).

%% --- Rosa Delgado ---
trait(rosa_delgado, female).
trait(rosa_delgado, warm).
trait(rosa_delgado, resilient).
trait(rosa_delgado, community_minded).
attribute(rosa_delgado, charisma, 70).
attribute(rosa_delgado, propriety, 65).
attribute(rosa_delgado, cultural_knowledge, 50).

%% --- Hector Ruiz ---
trait(hector_ruiz, male).
trait(hector_ruiz, shrewd).
trait(hector_ruiz, opportunistic).
trait(hector_ruiz, connected).
attribute(hector_ruiz, charisma, 55).
attribute(hector_ruiz, cunningness, 75).
attribute(hector_ruiz, self_assuredness, 60).
