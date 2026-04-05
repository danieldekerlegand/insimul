%% Insimul Characters: Wild West -- Redemption Gulch
%% Source: data/worlds/wild_west/characters.pl
%% Created: 2026-04-03
%% Total: 20 characters (5 groups)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%   occupation/2, faction/2

%% ═══════════════════════════════════════════════════════════
%% Law and Order (Sheriff Office, Redemption Gulch)
%% ═══════════════════════════════════════════════════════════

%% Eli Holden -- Sheriff of Redemption Gulch
person(eli_holden).
first_name(eli_holden, 'Eli').
last_name(eli_holden, 'Holden').
full_name(eli_holden, 'Eli Holden').
gender(eli_holden, male).
alive(eli_holden).
generation(eli_holden, 0).
founder_family(eli_holden).
occupation(eli_holden, sheriff).
faction(eli_holden, law).
location(eli_holden, redemption_gulch).

%% Clara Holden -- Teacher, wife of sheriff
person(clara_holden).
first_name(clara_holden, 'Clara').
last_name(clara_holden, 'Holden').
full_name(clara_holden, 'Clara Holden').
gender(clara_holden, female).
alive(clara_holden).
generation(clara_holden, 0).
founder_family(clara_holden).
occupation(clara_holden, teacher).
faction(clara_holden, townsfolk).
spouse(clara_holden, eli_holden).
location(clara_holden, redemption_gulch).

%% Sam Holden -- Deputy, younger sibling of Eli
person(sam_holden).
first_name(sam_holden, 'Sam').
last_name(sam_holden, 'Holden').
full_name(sam_holden, 'Sam Holden').
gender(sam_holden, male).
alive(sam_holden).
generation(sam_holden, 0).
occupation(sam_holden, deputy).
faction(sam_holden, law).
location(sam_holden, redemption_gulch).

%% ═══════════════════════════════════════════════════════════
%% Saloon and Commerce (Main Street, Redemption Gulch)
%% ═══════════════════════════════════════════════════════════

%% Ruby Callahan -- Saloon Owner
person(ruby_callahan).
first_name(ruby_callahan, 'Ruby').
last_name(ruby_callahan, 'Callahan').
full_name(ruby_callahan, 'Ruby Callahan').
gender(ruby_callahan, female).
alive(ruby_callahan).
generation(ruby_callahan, 0).
founder_family(ruby_callahan).
occupation(ruby_callahan, saloon_owner).
faction(ruby_callahan, townsfolk).
location(ruby_callahan, redemption_gulch).

%% Silas Hendricks -- General Store Owner
person(silas_hendricks).
first_name(silas_hendricks, 'Silas').
last_name(silas_hendricks, 'Hendricks').
full_name(silas_hendricks, 'Silas Hendricks').
gender(silas_hendricks, male).
alive(silas_hendricks).
generation(silas_hendricks, 0).
founder_family(silas_hendricks).
occupation(silas_hendricks, shopkeeper).
faction(silas_hendricks, townsfolk).
location(silas_hendricks, redemption_gulch).

%% Doc Whitfield -- Town Doctor
person(doc_whitfield).
first_name(doc_whitfield, 'Elijah').
last_name(doc_whitfield, 'Whitfield').
full_name(doc_whitfield, 'Elijah Whitfield').
gender(doc_whitfield, male).
alive(doc_whitfield).
generation(doc_whitfield, 0).
occupation(doc_whitfield, doctor).
faction(doc_whitfield, townsfolk).
location(doc_whitfield, redemption_gulch).

%% Abigail Whitfield -- Nurse, wife of Doc Whitfield
person(abigail_whitfield).
first_name(abigail_whitfield, 'Abigail').
last_name(abigail_whitfield, 'Whitfield').
full_name(abigail_whitfield, 'Abigail Whitfield').
gender(abigail_whitfield, female).
alive(abigail_whitfield).
generation(abigail_whitfield, 0).
occupation(abigail_whitfield, nurse).
faction(abigail_whitfield, townsfolk).
spouse(abigail_whitfield, doc_whitfield).
location(abigail_whitfield, redemption_gulch).

%% Reverend Josiah Crane -- Preacher
person(josiah_crane).
first_name(josiah_crane, 'Josiah').
last_name(josiah_crane, 'Crane').
full_name(josiah_crane, 'Josiah Crane').
gender(josiah_crane, male).
alive(josiah_crane).
generation(josiah_crane, 0).
occupation(josiah_crane, preacher).
faction(josiah_crane, townsfolk).
location(josiah_crane, redemption_gulch).

%% ═══════════════════════════════════════════════════════════
%% Outlaws (Various hideouts)
%% ═══════════════════════════════════════════════════════════

%% "Black Jack" Ketchum -- Outlaw Gang Leader
person(jack_ketchum).
first_name(jack_ketchum, 'Jack').
last_name(jack_ketchum, 'Ketchum').
full_name(jack_ketchum, 'Jack Ketchum').
gender(jack_ketchum, male).
alive(jack_ketchum).
generation(jack_ketchum, 0).
founder_family(jack_ketchum).
occupation(jack_ketchum, outlaw).
faction(jack_ketchum, ketchum_gang).
location(jack_ketchum, copper_ridge).

%% Rosa Delgado -- Outlaw, sharpshooter
person(rosa_delgado).
first_name(rosa_delgado, 'Rosa').
last_name(rosa_delgado, 'Delgado').
full_name(rosa_delgado, 'Rosa Delgado').
gender(rosa_delgado, female).
alive(rosa_delgado).
generation(rosa_delgado, 0).
occupation(rosa_delgado, outlaw).
faction(rosa_delgado, ketchum_gang).
location(rosa_delgado, copper_ridge).

%% Billy "Two Fingers" Tate -- Outlaw, dynamite expert
person(billy_tate).
first_name(billy_tate, 'Billy').
last_name(billy_tate, 'Tate').
full_name(billy_tate, 'Billy Tate').
gender(billy_tate, male).
alive(billy_tate).
generation(billy_tate, 0).
occupation(billy_tate, outlaw).
faction(billy_tate, ketchum_gang).
location(billy_tate, copper_ridge).

%% ═══════════════════════════════════════════════════════════
%% Ranchers (Broken Bow Ranch)
%% ═══════════════════════════════════════════════════════════

%% Walt McCoy -- Ranch Owner
person(walt_mccoy).
first_name(walt_mccoy, 'Walt').
last_name(walt_mccoy, 'McCoy').
full_name(walt_mccoy, 'Walt McCoy').
gender(walt_mccoy, male).
alive(walt_mccoy).
generation(walt_mccoy, 0).
founder_family(walt_mccoy).
occupation(walt_mccoy, rancher).
faction(walt_mccoy, ranchers).
location(walt_mccoy, broken_bow).

%% Martha McCoy -- Ranch co-owner
person(martha_mccoy).
first_name(martha_mccoy, 'Martha').
last_name(martha_mccoy, 'McCoy').
full_name(martha_mccoy, 'Martha McCoy').
gender(martha_mccoy, female).
alive(martha_mccoy).
generation(martha_mccoy, 0).
founder_family(martha_mccoy).
occupation(martha_mccoy, rancher).
faction(martha_mccoy, ranchers).
spouse(martha_mccoy, walt_mccoy).
location(martha_mccoy, broken_bow).

%% Jesse McCoy -- Young ranch hand
person(jesse_mccoy).
first_name(jesse_mccoy, 'Jesse').
last_name(jesse_mccoy, 'McCoy').
full_name(jesse_mccoy, 'Jesse McCoy').
gender(jesse_mccoy, male).
alive(jesse_mccoy).
generation(jesse_mccoy, 1).
occupation(jesse_mccoy, ranch_hand).
faction(jesse_mccoy, ranchers).
parent(walt_mccoy, jesse_mccoy).
parent(martha_mccoy, jesse_mccoy).
location(jesse_mccoy, broken_bow).

%% Hank Dalton -- Hired ranch foreman
person(hank_dalton).
first_name(hank_dalton, 'Hank').
last_name(hank_dalton, 'Dalton').
full_name(hank_dalton, 'Hank Dalton').
gender(hank_dalton, male).
alive(hank_dalton).
generation(hank_dalton, 0).
occupation(hank_dalton, foreman).
faction(hank_dalton, ranchers).
location(hank_dalton, broken_bow).

%% ═══════════════════════════════════════════════════════════
%% Miners and Railroad (Copper Ridge / Rail District)
%% ═══════════════════════════════════════════════════════════

%% Cornelius Thorne -- Railroad Baron
person(cornelius_thorne).
first_name(cornelius_thorne, 'Cornelius').
last_name(cornelius_thorne, 'Thorne').
full_name(cornelius_thorne, 'Cornelius Thorne').
gender(cornelius_thorne, male).
alive(cornelius_thorne).
generation(cornelius_thorne, 0).
founder_family(cornelius_thorne).
occupation(cornelius_thorne, railroad_baron).
faction(cornelius_thorne, railroad).
location(cornelius_thorne, redemption_gulch).

%% Mae Li -- Mine Foreman, Copper Ridge
person(mae_li).
first_name(mae_li, 'Mae').
last_name(mae_li, 'Li').
full_name(mae_li, 'Mae Li').
gender(mae_li, female).
alive(mae_li).
generation(mae_li, 0).
occupation(mae_li, mine_foreman).
faction(mae_li, miners).
location(mae_li, copper_ridge).

%% Eustace Polk -- Newspaper Editor
person(eustace_polk).
first_name(eustace_polk, 'Eustace').
last_name(eustace_polk, 'Polk').
full_name(eustace_polk, 'Eustace Polk').
gender(eustace_polk, male).
alive(eustace_polk).
generation(eustace_polk, 0).
occupation(eustace_polk, editor).
faction(eustace_polk, townsfolk).
location(eustace_polk, redemption_gulch).

%% Lottie Briggs -- Boarding House Operator, informant
person(lottie_briggs).
first_name(lottie_briggs, 'Lottie').
last_name(lottie_briggs, 'Briggs').
full_name(lottie_briggs, 'Lottie Briggs').
gender(lottie_briggs, female).
alive(lottie_briggs).
generation(lottie_briggs, 0).
occupation(lottie_briggs, innkeeper).
faction(lottie_briggs, townsfolk).
location(lottie_briggs, redemption_gulch).

%% Chen Wei -- Blacksmith at Iron Will Forge
person(chen_wei).
first_name(chen_wei, 'Wei').
last_name(chen_wei, 'Chen').
full_name(chen_wei, 'Chen Wei').
gender(chen_wei, male).
alive(chen_wei).
generation(chen_wei, 0).
occupation(chen_wei, blacksmith).
faction(chen_wei, townsfolk).
location(chen_wei, redemption_gulch).
