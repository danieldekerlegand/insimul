%% Ensemble History: High Fantasy -- Initial World State
%% Source: data/worlds/high_fantasy/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Thalion Starweaver ---
trait(thalion_starweaver, male).
trait(thalion_starweaver, regal).
trait(thalion_starweaver, ancient).
trait(thalion_starweaver, wise).
trait(thalion_starweaver, cautious).
attribute(thalion_starweaver, charisma, 90).
attribute(thalion_starweaver, cultural_knowledge, 95).
attribute(thalion_starweaver, propriety, 90).

%% --- Elowen Starweaver ---
trait(elowen_starweaver, female).
trait(elowen_starweaver, compassionate).
trait(elowen_starweaver, diplomatic).
trait(elowen_starweaver, perceptive).
attribute(elowen_starweaver, charisma, 85).
attribute(elowen_starweaver, cultural_knowledge, 90).
attribute(elowen_starweaver, sensitiveness, 80).
relationship(elowen_starweaver, thalion_starweaver, married).

%% --- Caelindra Starweaver ---
trait(caelindra_starweaver, female).
trait(caelindra_starweaver, young).
trait(caelindra_starweaver, adventurous).
trait(caelindra_starweaver, skilled_archer).
attribute(caelindra_starweaver, charisma, 70).
attribute(caelindra_starweaver, self_assuredness, 75).
attribute(caelindra_starweaver, cunningness, 60).
relationship(caelindra_starweaver, rowan_thornwall, friends).

%% --- Ithrandil Moonwhisper ---
trait(ithrandil_moonwhisper, male).
trait(ithrandil_moonwhisper, scholarly).
trait(ithrandil_moonwhisper, reclusive).
trait(ithrandil_moonwhisper, powerful).
trait(ithrandil_moonwhisper, ancient).
attribute(ithrandil_moonwhisper, charisma, 60).
attribute(ithrandil_moonwhisper, cultural_knowledge, 98).
attribute(ithrandil_moonwhisper, self_assuredness, 85).
relationship(ithrandil_moonwhisper, thalion_starweaver, advisor).

%% --- Faelina Dawnpetal ---
trait(faelina_dawnpetal, female).
trait(faelina_dawnpetal, nurturing).
trait(faelina_dawnpetal, nature_loving).
trait(faelina_dawnpetal, serene).
attribute(faelina_dawnpetal, charisma, 65).
attribute(faelina_dawnpetal, cultural_knowledge, 85).
attribute(faelina_dawnpetal, sensitiveness, 90).

%% --- Lyraniel Silvershade ---
trait(lyraniel_silvershade, female).
trait(lyraniel_silvershade, ambitious).
trait(lyraniel_silvershade, secretive).
trait(lyraniel_silvershade, talented).
attribute(lyraniel_silvershade, charisma, 75).
attribute(lyraniel_silvershade, cunningness, 70).
attribute(lyraniel_silvershade, self_assuredness, 65).
relationship(lyraniel_silvershade, ithrandil_moonwhisper, student).

%% --- Thorgar Ironforge ---
trait(thorgar_ironforge, male).
trait(thorgar_ironforge, proud).
trait(thorgar_ironforge, honorable).
trait(thorgar_ironforge, stubborn).
trait(thorgar_ironforge, middle_aged).
attribute(thorgar_ironforge, charisma, 65).
attribute(thorgar_ironforge, strength, 90).
attribute(thorgar_ironforge, cultural_knowledge, 75).

%% --- Hilda Ironforge ---
trait(hilda_ironforge, female).
trait(hilda_ironforge, meticulous).
trait(hilda_ironforge, brilliant).
trait(hilda_ironforge, patient).
attribute(hilda_ironforge, charisma, 55).
attribute(hilda_ironforge, cultural_knowledge, 85).
attribute(hilda_ironforge, cunningness, 60).
relationship(hilda_ironforge, thorgar_ironforge, married).

%% --- Brenna Ironforge ---
trait(brenna_ironforge, female).
trait(brenna_ironforge, young).
trait(brenna_ironforge, fierce).
trait(brenna_ironforge, loyal).
attribute(brenna_ironforge, charisma, 60).
attribute(brenna_ironforge, strength, 80).
attribute(brenna_ironforge, self_assuredness, 70).

%% --- Dolgrim Stonebeard ---
trait(dolgrim_stonebeard, male).
trait(dolgrim_stonebeard, gruff).
trait(dolgrim_stonebeard, reliable).
trait(dolgrim_stonebeard, middle_aged).
attribute(dolgrim_stonebeard, charisma, 50).
attribute(dolgrim_stonebeard, strength, 85).
attribute(dolgrim_stonebeard, cultural_knowledge, 60).
relationship(dolgrim_stonebeard, thorgar_ironforge, friends).

%% --- Rurik Brightshard ---
trait(rurik_brightshard, male).
trait(rurik_brightshard, shrewd).
trait(rurik_brightshard, charming).
trait(rurik_brightshard, well_traveled).
attribute(rurik_brightshard, charisma, 75).
attribute(rurik_brightshard, cunningness, 70).
attribute(rurik_brightshard, cultural_knowledge, 65).
relationship(rurik_brightshard, aldric_thornwall, trade_partner).

%% --- Aldric Thornwall ---
trait(aldric_thornwall, male).
trait(aldric_thornwall, authoritative).
trait(aldric_thornwall, just).
trait(aldric_thornwall, burdened).
trait(aldric_thornwall, middle_aged).
attribute(aldric_thornwall, charisma, 75).
attribute(aldric_thornwall, cultural_knowledge, 65).
attribute(aldric_thornwall, self_assuredness, 80).

%% --- Maren Thornwall ---
trait(maren_thornwall, female).
trait(maren_thornwall, gentle).
trait(maren_thornwall, wise).
trait(maren_thornwall, respected).
attribute(maren_thornwall, charisma, 70).
attribute(maren_thornwall, cultural_knowledge, 70).
attribute(maren_thornwall, sensitiveness, 75).
relationship(maren_thornwall, aldric_thornwall, married).
relationship(maren_thornwall, faelina_dawnpetal, friends).

%% --- Rowan Thornwall ---
trait(rowan_thornwall, male).
trait(rowan_thornwall, young).
trait(rowan_thornwall, idealistic).
trait(rowan_thornwall, brave).
attribute(rowan_thornwall, charisma, 65).
attribute(rowan_thornwall, strength, 60).
attribute(rowan_thornwall, self_assuredness, 55).

%% --- Sera Blackthorn ---
trait(sera_blackthorn, female).
trait(sera_blackthorn, cunning).
trait(sera_blackthorn, charismatic).
trait(sera_blackthorn, battle_hardened).
attribute(sera_blackthorn, charisma, 80).
attribute(sera_blackthorn, cunningness, 75).
attribute(sera_blackthorn, self_assuredness, 85).
relationship(sera_blackthorn, aldric_thornwall, allies).

%% --- Gareth Steelheart ---
trait(gareth_steelheart, male).
trait(gareth_steelheart, hardworking).
trait(gareth_steelheart, honest).
trait(gareth_steelheart, strong).
attribute(gareth_steelheart, charisma, 55).
attribute(gareth_steelheart, strength, 85).
attribute(gareth_steelheart, propriety, 65).
relationship(gareth_steelheart, thorgar_ironforge, respect).

%% --- Orin Duskmantle ---
trait(orin_duskmantle, male).
trait(orin_duskmantle, mysterious).
trait(orin_duskmantle, knowledgeable).
trait(orin_duskmantle, torn_between_worlds).
attribute(orin_duskmantle, charisma, 65).
attribute(orin_duskmantle, cultural_knowledge, 80).
attribute(orin_duskmantle, sensitiveness, 70).
relationship(orin_duskmantle, ithrandil_moonwhisper, former_student).
relationship(orin_duskmantle, sera_blackthorn, friends).
