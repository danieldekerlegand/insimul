%% Ensemble History: Steampunk -- Initial World State
%% Source: data/worlds/steampunk/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Edmund Hargrove ---
trait(edmund_hargrove, male).
trait(edmund_hargrove, commanding).
trait(edmund_hargrove, adventurous).
trait(edmund_hargrove, middle_aged).
attribute(edmund_hargrove, charisma, 80).
attribute(edmund_hargrove, cunningness, 60).
attribute(edmund_hargrove, cultural_knowledge, 65).

%% --- Margaret Hargrove ---
trait(margaret_hargrove, female).
trait(margaret_hargrove, practical).
trait(margaret_hargrove, shrewd).
trait(margaret_hargrove, middle_aged).
attribute(margaret_hargrove, charisma, 65).
attribute(margaret_hargrove, propriety, 80).
attribute(margaret_hargrove, cultural_knowledge, 55).
relationship(margaret_hargrove, edmund_hargrove, married).

%% --- Eleanor Hargrove ---
trait(eleanor_hargrove, female).
trait(eleanor_hargrove, young).
trait(eleanor_hargrove, daring).
trait(eleanor_hargrove, mechanical_aptitude).
attribute(eleanor_hargrove, charisma, 70).
attribute(eleanor_hargrove, self_assuredness, 75).
attribute(eleanor_hargrove, cunningness, 55).

%% --- Tobias Hargrove ---
trait(tobias_hargrove, male).
trait(tobias_hargrove, young).
trait(tobias_hargrove, reckless).
trait(tobias_hargrove, charming).
attribute(tobias_hargrove, charisma, 75).
attribute(tobias_hargrove, self_assuredness, 65).
attribute(tobias_hargrove, cunningness, 50).
relationship(tobias_hargrove, felix_voss, friends).

%% --- Aldric Pendleton ---
trait(aldric_pendleton, male).
trait(aldric_pendleton, intellectual).
trait(aldric_pendleton, meticulous).
trait(aldric_pendleton, middle_aged).
attribute(aldric_pendleton, charisma, 60).
attribute(aldric_pendleton, cultural_knowledge, 90).
attribute(aldric_pendleton, propriety, 75).

%% --- Cecilia Pendleton ---
trait(cecilia_pendleton, female).
trait(cecilia_pendleton, poised).
trait(cecilia_pendleton, progressive).
trait(cecilia_pendleton, middle_aged).
attribute(cecilia_pendleton, charisma, 75).
attribute(cecilia_pendleton, cultural_knowledge, 80).
attribute(cecilia_pendleton, propriety, 85).
relationship(cecilia_pendleton, aldric_pendleton, married).
relationship(cecilia_pendleton, vivienne_blackwood, friends).

%% --- Rosalind Pendleton ---
trait(rosalind_pendleton, female).
trait(rosalind_pendleton, young).
trait(rosalind_pendleton, brilliant).
trait(rosalind_pendleton, rebellious).
attribute(rosalind_pendleton, charisma, 65).
attribute(rosalind_pendleton, self_assuredness, 70).
attribute(rosalind_pendleton, cultural_knowledge, 75).
relationship(rosalind_pendleton, wren_ironvein, friends).

%% --- Garrick Ironvein ---
trait(garrick_ironvein, male).
trait(garrick_ironvein, strong).
trait(garrick_ironvein, stoic).
trait(garrick_ironvein, hardworking).
trait(garrick_ironvein, middle_aged).
attribute(garrick_ironvein, charisma, 55).
attribute(garrick_ironvein, cultural_knowledge, 45).
attribute(garrick_ironvein, propriety, 50).
relationship(garrick_ironvein, edmund_hargrove, friends).

%% --- Dorothea Ironvein ---
trait(dorothea_ironvein, female).
trait(dorothea_ironvein, resourceful).
trait(dorothea_ironvein, warm).
trait(dorothea_ironvein, middle_aged).
attribute(dorothea_ironvein, charisma, 60).
attribute(dorothea_ironvein, propriety, 60).
attribute(dorothea_ironvein, cultural_knowledge, 50).
relationship(dorothea_ironvein, garrick_ironvein, married).

%% --- Silas Ironvein ---
trait(silas_ironvein, male).
trait(silas_ironvein, young).
trait(silas_ironvein, ambitious).
trait(silas_ironvein, impatient).
attribute(silas_ironvein, charisma, 50).
attribute(silas_ironvein, self_assuredness, 60).
attribute(silas_ironvein, cunningness, 55).

%% --- Wren Ironvein ---
trait(wren_ironvein, female).
trait(wren_ironvein, young).
trait(wren_ironvein, inventive).
trait(wren_ironvein, curious).
attribute(wren_ironvein, charisma, 60).
attribute(wren_ironvein, self_assuredness, 55).
attribute(wren_ironvein, cultural_knowledge, 50).

%% --- Helena Voss ---
trait(helena_voss, female).
trait(helena_voss, brilliant).
trait(helena_voss, secretive).
trait(helena_voss, driven).
trait(helena_voss, middle_aged).
attribute(helena_voss, charisma, 50).
attribute(helena_voss, cultural_knowledge, 85).
attribute(helena_voss, cunningness, 70).
relationship(helena_voss, aldric_pendleton, friends).

%% --- Felix Voss ---
trait(felix_voss, male).
trait(felix_voss, young).
trait(felix_voss, idealistic).
trait(felix_voss, restless).
attribute(felix_voss, charisma, 65).
attribute(felix_voss, self_assuredness, 50).
attribute(felix_voss, sensitiveness, 70).

%% --- Reginald Blackwood ---
trait(reginald_blackwood, male).
trait(reginald_blackwood, aristocratic).
trait(reginald_blackwood, calculating).
trait(reginald_blackwood, middle_aged).
attribute(reginald_blackwood, charisma, 70).
attribute(reginald_blackwood, cunningness, 80).
attribute(reginald_blackwood, propriety, 90).

%% --- Vivienne Blackwood ---
trait(vivienne_blackwood, female).
trait(vivienne_blackwood, elegant).
trait(vivienne_blackwood, perceptive).
trait(vivienne_blackwood, middle_aged).
attribute(vivienne_blackwood, charisma, 85).
attribute(vivienne_blackwood, cultural_knowledge, 75).
attribute(vivienne_blackwood, propriety, 90).
relationship(vivienne_blackwood, reginald_blackwood, married).

%% --- Charlotte Blackwood ---
trait(charlotte_blackwood, female).
trait(charlotte_blackwood, young).
trait(charlotte_blackwood, defiant).
trait(charlotte_blackwood, compassionate).
attribute(charlotte_blackwood, charisma, 70).
attribute(charlotte_blackwood, self_assuredness, 60).
attribute(charlotte_blackwood, sensitiveness, 65).
relationship(charlotte_blackwood, eleanor_hargrove, friends).

%% --- Jasper Cogsworth ---
trait(jasper_cogsworth, male).
trait(jasper_cogsworth, eccentric).
trait(jasper_cogsworth, genius).
trait(jasper_cogsworth, middle_aged).
attribute(jasper_cogsworth, charisma, 45).
attribute(jasper_cogsworth, cultural_knowledge, 80).
attribute(jasper_cogsworth, sensitiveness, 60).

%% --- Minerva Thatch ---
trait(minerva_thatch, female).
trait(minerva_thatch, tough).
trait(minerva_thatch, fair).
trait(minerva_thatch, middle_aged).
attribute(minerva_thatch, charisma, 55).
attribute(minerva_thatch, self_assuredness, 75).
attribute(minerva_thatch, cunningness, 45).
relationship(minerva_thatch, garrick_ironvein, friends).
