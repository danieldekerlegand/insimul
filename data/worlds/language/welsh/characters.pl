%% Insimul Characters: Welsh Valley
%% Sources: characters.json, ensemble cast
%% Converted: 2026-04-03T12:00:00Z
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%   ensemble_cast/1 -- marks character as Ensemble cast member

%% ============================================================
%% Jones Family -- Town centre, bakery and rugby tradition
%% ============================================================

%% Dafydd Jones
person(dafydd_jones).
first_name(dafydd_jones, 'Dafydd').
last_name(dafydd_jones, 'Jones').
full_name(dafydd_jones, 'Dafydd Jones').
gender(dafydd_jones, male).
alive(dafydd_jones).
generation(dafydd_jones, 0).
founder_family(dafydd_jones).
child(dafydd_jones, rhys_jones).
child(dafydd_jones, carys_jones).
spouse(dafydd_jones, megan_jones).
location(dafydd_jones, cwm_derwen).

%% Megan Jones (nee Williams)
person(megan_jones).
first_name(megan_jones, 'Megan').
last_name(megan_jones, 'Jones').
full_name(megan_jones, 'Megan Jones').
gender(megan_jones, female).
alive(megan_jones).
generation(megan_jones, 0).
founder_family(megan_jones).
child(megan_jones, rhys_jones).
child(megan_jones, carys_jones).
spouse(megan_jones, dafydd_jones).
location(megan_jones, cwm_derwen).

%% Rhys Jones
person(rhys_jones).
first_name(rhys_jones, 'Rhys').
last_name(rhys_jones, 'Jones').
full_name(rhys_jones, 'Rhys Jones').
gender(rhys_jones, male).
alive(rhys_jones).
generation(rhys_jones, 1).
parent(dafydd_jones, rhys_jones).
parent(megan_jones, rhys_jones).
location(rhys_jones, cwm_derwen).

%% Carys Jones
person(carys_jones).
first_name(carys_jones, 'Carys').
last_name(carys_jones, 'Jones').
full_name(carys_jones, 'Carys Jones').
gender(carys_jones, female).
alive(carys_jones).
generation(carys_jones, 1).
parent(dafydd_jones, carys_jones).
parent(megan_jones, carys_jones).
location(carys_jones, cwm_derwen).

%% ============================================================
%% Williams Family -- School teachers, Welsh-language advocates
%% ============================================================

%% Gwenllian Williams
person(gwenllian_williams).
first_name(gwenllian_williams, 'Gwenllian').
last_name(gwenllian_williams, 'Williams').
full_name(gwenllian_williams, 'Gwenllian Williams').
gender(gwenllian_williams, female).
alive(gwenllian_williams).
generation(gwenllian_williams, 0).
founder_family(gwenllian_williams).
child(gwenllian_williams, sioned_williams).
child(gwenllian_williams, iolo_williams).
spouse(gwenllian_williams, hywel_williams).
location(gwenllian_williams, cwm_derwen).

%% Hywel Williams
person(hywel_williams).
first_name(hywel_williams, 'Hywel').
last_name(hywel_williams, 'Williams').
full_name(hywel_williams, 'Hywel Williams').
gender(hywel_williams, male).
alive(hywel_williams).
generation(hywel_williams, 0).
founder_family(hywel_williams).
child(hywel_williams, sioned_williams).
child(hywel_williams, iolo_williams).
spouse(hywel_williams, gwenllian_williams).
location(hywel_williams, cwm_derwen).

%% Sioned Williams
person(sioned_williams).
first_name(sioned_williams, 'Sioned').
last_name(sioned_williams, 'Williams').
full_name(sioned_williams, 'Sioned Williams').
gender(sioned_williams, female).
alive(sioned_williams).
generation(sioned_williams, 1).
parent(gwenllian_williams, sioned_williams).
parent(hywel_williams, sioned_williams).
location(sioned_williams, cwm_derwen).

%% Iolo Williams
person(iolo_williams).
first_name(iolo_williams, 'Iolo').
last_name(iolo_williams, 'Williams').
full_name(iolo_williams, 'Iolo Williams').
gender(iolo_williams, male).
alive(iolo_williams).
generation(iolo_williams, 1).
parent(gwenllian_williams, iolo_williams).
parent(hywel_williams, iolo_williams).
location(iolo_williams, cwm_derwen).

%% ============================================================
%% Davies Family -- Hill farmers, Llanfynydd
%% ============================================================

%% Owain Davies
person(owain_davies).
first_name(owain_davies, 'Owain').
last_name(owain_davies, 'Davies').
full_name(owain_davies, 'Owain Davies').
gender(owain_davies, male).
alive(owain_davies).
generation(owain_davies, 0).
founder_family(owain_davies).
child(owain_davies, gethin_davies).
child(owain_davies, elen_davies).
spouse(owain_davies, non_davies).
location(owain_davies, llanfynydd).

%% Non Davies (nee Roberts)
person(non_davies).
first_name(non_davies, 'Non').
last_name(non_davies, 'Davies').
full_name(non_davies, 'Non Davies').
gender(non_davies, female).
alive(non_davies).
generation(non_davies, 0).
founder_family(non_davies).
child(non_davies, gethin_davies).
child(non_davies, elen_davies).
spouse(non_davies, owain_davies).
location(non_davies, llanfynydd).

%% Gethin Davies
person(gethin_davies).
first_name(gethin_davies, 'Gethin').
last_name(gethin_davies, 'Davies').
full_name(gethin_davies, 'Gethin Davies').
gender(gethin_davies, male).
alive(gethin_davies).
generation(gethin_davies, 1).
parent(owain_davies, gethin_davies).
parent(non_davies, gethin_davies).
location(gethin_davies, llanfynydd).

%% Elen Davies
person(elen_davies).
first_name(elen_davies, 'Elen').
last_name(elen_davies, 'Davies').
full_name(elen_davies, 'Elen Davies').
gender(elen_davies, female).
alive(elen_davies).
generation(elen_davies, 1).
parent(owain_davies, elen_davies).
parent(non_davies, elen_davies).
location(elen_davies, cwm_derwen).

%% ============================================================
%% Evans Family -- Pub owners, music tradition
%% ============================================================

%% Angharad Evans
person(angharad_evans).
first_name(angharad_evans, 'Angharad').
last_name(angharad_evans, 'Evans').
full_name(angharad_evans, 'Angharad Evans').
gender(angharad_evans, female).
alive(angharad_evans).
generation(angharad_evans, 0).
founder_family(angharad_evans).
child(angharad_evans, ffion_evans).
child(angharad_evans, gruffydd_evans).
spouse(angharad_evans, emyr_evans).
location(angharad_evans, cwm_derwen).

%% Emyr Evans
person(emyr_evans).
first_name(emyr_evans, 'Emyr').
last_name(emyr_evans, 'Evans').
full_name(emyr_evans, 'Emyr Evans').
gender(emyr_evans, male).
alive(emyr_evans).
generation(emyr_evans, 0).
founder_family(emyr_evans).
child(emyr_evans, ffion_evans).
child(emyr_evans, gruffydd_evans).
spouse(emyr_evans, angharad_evans).
location(emyr_evans, cwm_derwen).

%% Ffion Evans
person(ffion_evans).
first_name(ffion_evans, 'Ffion').
last_name(ffion_evans, 'Evans').
full_name(ffion_evans, 'Ffion Evans').
gender(ffion_evans, female).
alive(ffion_evans).
generation(ffion_evans, 1).
parent(angharad_evans, ffion_evans).
parent(emyr_evans, ffion_evans).
location(ffion_evans, cwm_derwen).

%% Gruffydd Evans
person(gruffydd_evans).
first_name(gruffydd_evans, 'Gruffydd').
last_name(gruffydd_evans, 'Evans').
full_name(gruffydd_evans, 'Gruffydd Evans').
gender(gruffydd_evans, male).
alive(gruffydd_evans).
generation(gruffydd_evans, 1).
parent(angharad_evans, gruffydd_evans).
parent(emyr_evans, gruffydd_evans).
location(gruffydd_evans, cwm_derwen).

%% ============================================================
%% Thomas Family -- Slate heritage, museum curator
%% ============================================================

%% Eleri Thomas
person(eleri_thomas).
first_name(eleri_thomas, 'Eleri').
last_name(eleri_thomas, 'Thomas').
full_name(eleri_thomas, 'Eleri Thomas').
gender(eleri_thomas, female).
alive(eleri_thomas).
generation(eleri_thomas, 0).
founder_family(eleri_thomas).
child(eleri_thomas, cadi_thomas).
child(eleri_thomas, llyr_thomas).
spouse(eleri_thomas, gareth_thomas).
location(eleri_thomas, cwm_derwen).

%% Gareth Thomas
person(gareth_thomas).
first_name(gareth_thomas, 'Gareth').
last_name(gareth_thomas, 'Thomas').
full_name(gareth_thomas, 'Gareth Thomas').
gender(gareth_thomas, male).
alive(gareth_thomas).
generation(gareth_thomas, 0).
founder_family(gareth_thomas).
child(gareth_thomas, cadi_thomas).
child(gareth_thomas, llyr_thomas).
spouse(gareth_thomas, eleri_thomas).
location(gareth_thomas, cwm_derwen).

%% Cadi Thomas
person(cadi_thomas).
first_name(cadi_thomas, 'Cadi').
last_name(cadi_thomas, 'Thomas').
full_name(cadi_thomas, 'Cadi Thomas').
gender(cadi_thomas, female).
alive(cadi_thomas).
generation(cadi_thomas, 1).
parent(eleri_thomas, cadi_thomas).
parent(gareth_thomas, cadi_thomas).
location(cadi_thomas, cwm_derwen).

%% Llyr Thomas
person(llyr_thomas).
first_name(llyr_thomas, 'Llyr').
last_name(llyr_thomas, 'Thomas').
full_name(llyr_thomas, 'Llyr Thomas').
gender(llyr_thomas, male).
alive(llyr_thomas).
generation(llyr_thomas, 1).
parent(eleri_thomas, llyr_thomas).
parent(gareth_thomas, llyr_thomas).
location(llyr_thomas, cwm_derwen).

%% ============================================================
%% Roberts Family -- Crafts, eisteddfod tradition
%% ============================================================

%% Siwan Roberts
person(siwan_roberts).
first_name(siwan_roberts, 'Siwan').
last_name(siwan_roberts, 'Roberts').
full_name(siwan_roberts, 'Siwan Roberts').
gender(siwan_roberts, female).
alive(siwan_roberts).
generation(siwan_roberts, 0).
founder_family(siwan_roberts).
child(siwan_roberts, mali_roberts).
child(siwan_roberts, tomos_roberts).
spouse(siwan_roberts, bryn_roberts).
location(siwan_roberts, cwm_derwen).

%% Bryn Roberts
person(bryn_roberts).
first_name(bryn_roberts, 'Bryn').
last_name(bryn_roberts, 'Roberts').
full_name(bryn_roberts, 'Bryn Roberts').
gender(bryn_roberts, male).
alive(bryn_roberts).
generation(bryn_roberts, 0).
founder_family(bryn_roberts).
child(bryn_roberts, mali_roberts).
child(bryn_roberts, tomos_roberts).
spouse(bryn_roberts, siwan_roberts).
location(bryn_roberts, cwm_derwen).

%% Mali Roberts
person(mali_roberts).
first_name(mali_roberts, 'Mali').
last_name(mali_roberts, 'Roberts').
full_name(mali_roberts, 'Mali Roberts').
gender(mali_roberts, female).
alive(mali_roberts).
generation(mali_roberts, 1).
parent(siwan_roberts, mali_roberts).
parent(bryn_roberts, mali_roberts).
location(mali_roberts, cwm_derwen).

%% Tomos Roberts
person(tomos_roberts).
first_name(tomos_roberts, 'Tomos').
last_name(tomos_roberts, 'Roberts').
full_name(tomos_roberts, 'Tomos Roberts').
gender(tomos_roberts, male).
alive(tomos_roberts).
generation(tomos_roberts, 1).
parent(siwan_roberts, tomos_roberts).
parent(bryn_roberts, tomos_roberts).
location(tomos_roberts, cwm_derwen).
