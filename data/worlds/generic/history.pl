%% Ensemble History: Generic Fantasy World -- Initial World State
%% Source: data/worlds/generic/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Gareth Aldric ---
trait(gareth_aldric, male).
trait(gareth_aldric, hardworking).
trait(gareth_aldric, proud).
trait(gareth_aldric, traditional).
trait(gareth_aldric, middle_aged).
attribute(gareth_aldric, charisma, 60).
attribute(gareth_aldric, strength, 85).
attribute(gareth_aldric, cultural_knowledge, 55).

%% --- Elara Aldric ---
trait(elara_aldric, female).
trait(elara_aldric, nurturing).
trait(elara_aldric, wise).
trait(elara_aldric, patient).
attribute(elara_aldric, charisma, 70).
attribute(elara_aldric, cultural_knowledge, 80).
attribute(elara_aldric, sensitiveness, 65).
relationship(elara_aldric, gareth_aldric, married).

%% --- Rowan Aldric ---
trait(rowan_aldric, male).
trait(rowan_aldric, young).
trait(rowan_aldric, ambitious).
trait(rowan_aldric, dutiful).
attribute(rowan_aldric, strength, 65).
attribute(rowan_aldric, self_assuredness, 50).
attribute(rowan_aldric, cunningness, 40).

%% --- Mira Aldric ---
trait(mira_aldric, female).
trait(mira_aldric, young).
trait(mira_aldric, adventurous).
trait(mira_aldric, restless).
attribute(mira_aldric, charisma, 65).
attribute(mira_aldric, self_assuredness, 70).
attribute(mira_aldric, cunningness, 55).

%% --- Bram Thorne ---
trait(bram_thorne, male).
trait(bram_thorne, gregarious).
trait(bram_thorne, shrewd).
trait(bram_thorne, middle_aged).
attribute(bram_thorne, charisma, 80).
attribute(bram_thorne, cunningness, 60).
attribute(bram_thorne, cultural_knowledge, 65).

%% --- Wren Thorne ---
trait(wren_thorne, female).
trait(wren_thorne, organized).
trait(wren_thorne, warm).
trait(wren_thorne, practical).
attribute(wren_thorne, charisma, 65).
attribute(wren_thorne, cultural_knowledge, 60).
attribute(wren_thorne, propriety, 70).
relationship(wren_thorne, bram_thorne, married).

%% --- Sera Thorne ---
trait(sera_thorne, female).
trait(sera_thorne, young).
trait(sera_thorne, creative).
trait(sera_thorne, musical).
attribute(sera_thorne, charisma, 75).
attribute(sera_thorne, sensitiveness, 70).
attribute(sera_thorne, self_assuredness, 55).

%% --- Finn Thorne ---
trait(finn_thorne, male).
trait(finn_thorne, young).
trait(finn_thorne, mischievous).
trait(finn_thorne, quick_witted).
attribute(finn_thorne, charisma, 60).
attribute(finn_thorne, cunningness, 70).
attribute(finn_thorne, self_assuredness, 50).

%% --- Cedric Voss ---
trait(cedric_voss, male).
trait(cedric_voss, wealthy).
trait(cedric_voss, calculating).
trait(cedric_voss, middle_aged).
attribute(cedric_voss, charisma, 70).
attribute(cedric_voss, cunningness, 80).
attribute(cedric_voss, cultural_knowledge, 60).
relationship(cedric_voss, bram_thorne, rivals).

%% --- Mathilde Voss ---
trait(mathilde_voss, female).
trait(mathilde_voss, intelligent).
trait(mathilde_voss, ambitious).
trait(mathilde_voss, secretive).
attribute(mathilde_voss, charisma, 65).
attribute(mathilde_voss, cunningness, 75).
attribute(mathilde_voss, propriety, 70).
relationship(mathilde_voss, cedric_voss, married).

%% --- Liora Voss ---
trait(liora_voss, female).
trait(liora_voss, young).
trait(liora_voss, studious).
trait(liora_voss, curious).
attribute(liora_voss, charisma, 55).
attribute(liora_voss, cultural_knowledge, 70).
attribute(liora_voss, sensitiveness, 60).
relationship(liora_voss, sera_thorne, friends).

%% --- Hale Ashwood ---
trait(hale_ashwood, male).
trait(hale_ashwood, steady).
trait(hale_ashwood, respected).
trait(hale_ashwood, elderly).
attribute(hale_ashwood, charisma, 55).
attribute(hale_ashwood, cultural_knowledge, 80).
attribute(hale_ashwood, propriety, 75).

%% --- Brynn Ashwood ---
trait(brynn_ashwood, female).
trait(brynn_ashwood, compassionate).
trait(brynn_ashwood, resilient).
trait(brynn_ashwood, community_minded).
attribute(brynn_ashwood, charisma, 60).
attribute(brynn_ashwood, cultural_knowledge, 75).
attribute(brynn_ashwood, sensitiveness, 65).
relationship(brynn_ashwood, hale_ashwood, married).
relationship(brynn_ashwood, elara_aldric, friends).

%% --- Ivy Ashwood ---
trait(ivy_ashwood, female).
trait(ivy_ashwood, young).
trait(ivy_ashwood, independent).
trait(ivy_ashwood, nature_loving).
attribute(ivy_ashwood, charisma, 50).
attribute(ivy_ashwood, self_assuredness, 65).
attribute(ivy_ashwood, sensitiveness, 55).
relationship(ivy_ashwood, mira_aldric, friends).

%% --- Cole Ashwood ---
trait(cole_ashwood, male).
trait(cole_ashwood, young).
trait(cole_ashwood, gentle).
trait(cole_ashwood, quiet).
attribute(cole_ashwood, charisma, 45).
attribute(cole_ashwood, sensitiveness, 70).
attribute(cole_ashwood, propriety, 60).

%% --- Brother Aldwin ---
trait(brother_aldwin, male).
trait(brother_aldwin, devout).
trait(brother_aldwin, scholarly).
trait(brother_aldwin, middle_aged).
attribute(brother_aldwin, charisma, 65).
attribute(brother_aldwin, cultural_knowledge, 85).
attribute(brother_aldwin, propriety, 80).
relationship(brother_aldwin, hale_ashwood, friends).

%% --- Renna Marsh ---
trait(renna_marsh, female).
trait(renna_marsh, disciplined).
trait(renna_marsh, courageous).
trait(renna_marsh, stern).
attribute(renna_marsh, charisma, 60).
attribute(renna_marsh, strength, 75).
attribute(renna_marsh, self_assuredness, 80).
relationship(renna_marsh, gareth_aldric, friends).
