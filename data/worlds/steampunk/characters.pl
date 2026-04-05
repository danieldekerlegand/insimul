%% Insimul Characters: Steampunk
%% Source: data/worlds/steampunk/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (5 families + 2 independents)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Hargrove Family (Airship Captains, Ironhaven)
%% ═══════════════════════════════════════════════════════════

%% Captain Edmund Hargrove
person(edmund_hargrove).
first_name(edmund_hargrove, 'Edmund').
last_name(edmund_hargrove, 'Hargrove').
full_name(edmund_hargrove, 'Edmund Hargrove').
gender(edmund_hargrove, male).
alive(edmund_hargrove).
generation(edmund_hargrove, 0).
founder_family(edmund_hargrove).
child(edmund_hargrove, eleanor_hargrove).
child(edmund_hargrove, tobias_hargrove).
spouse(edmund_hargrove, margaret_hargrove).
location(edmund_hargrove, ironhaven).

%% Margaret Hargrove
person(margaret_hargrove).
first_name(margaret_hargrove, 'Margaret').
last_name(margaret_hargrove, 'Hargrove').
full_name(margaret_hargrove, 'Margaret Hargrove').
gender(margaret_hargrove, female).
alive(margaret_hargrove).
generation(margaret_hargrove, 0).
founder_family(margaret_hargrove).
child(margaret_hargrove, eleanor_hargrove).
child(margaret_hargrove, tobias_hargrove).
spouse(margaret_hargrove, edmund_hargrove).
location(margaret_hargrove, ironhaven).

%% Eleanor Hargrove
person(eleanor_hargrove).
first_name(eleanor_hargrove, 'Eleanor').
last_name(eleanor_hargrove, 'Hargrove').
full_name(eleanor_hargrove, 'Eleanor Hargrove').
gender(eleanor_hargrove, female).
alive(eleanor_hargrove).
generation(eleanor_hargrove, 1).
parent(edmund_hargrove, eleanor_hargrove).
parent(margaret_hargrove, eleanor_hargrove).
location(eleanor_hargrove, ironhaven).

%% Tobias Hargrove
person(tobias_hargrove).
first_name(tobias_hargrove, 'Tobias').
last_name(tobias_hargrove, 'Hargrove').
full_name(tobias_hargrove, 'Tobias Hargrove').
gender(tobias_hargrove, male).
alive(tobias_hargrove).
generation(tobias_hargrove, 1).
parent(edmund_hargrove, tobias_hargrove).
parent(margaret_hargrove, tobias_hargrove).
location(tobias_hargrove, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Pendleton Family (Inventors and Academics, Ironhaven)
%% ═══════════════════════════════════════════════════════════

%% Professor Aldric Pendleton
person(aldric_pendleton).
first_name(aldric_pendleton, 'Aldric').
last_name(aldric_pendleton, 'Pendleton').
full_name(aldric_pendleton, 'Aldric Pendleton').
gender(aldric_pendleton, male).
alive(aldric_pendleton).
generation(aldric_pendleton, 0).
founder_family(aldric_pendleton).
child(aldric_pendleton, rosalind_pendleton).
spouse(aldric_pendleton, cecilia_pendleton).
location(aldric_pendleton, ironhaven).

%% Cecilia Pendleton
person(cecilia_pendleton).
first_name(cecilia_pendleton, 'Cecilia').
last_name(cecilia_pendleton, 'Pendleton').
full_name(cecilia_pendleton, 'Cecilia Pendleton').
gender(cecilia_pendleton, female).
alive(cecilia_pendleton).
generation(cecilia_pendleton, 0).
founder_family(cecilia_pendleton).
child(cecilia_pendleton, rosalind_pendleton).
spouse(cecilia_pendleton, aldric_pendleton).
location(cecilia_pendleton, ironhaven).

%% Rosalind Pendleton
person(rosalind_pendleton).
first_name(rosalind_pendleton, 'Rosalind').
last_name(rosalind_pendleton, 'Pendleton').
full_name(rosalind_pendleton, 'Rosalind Pendleton').
gender(rosalind_pendleton, female).
alive(rosalind_pendleton).
generation(rosalind_pendleton, 1).
parent(aldric_pendleton, rosalind_pendleton).
parent(cecilia_pendleton, rosalind_pendleton).
location(rosalind_pendleton, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Ironvein Family (Forge Masters, Ironhaven)
%% ═══════════════════════════════════════════════════════════

%% Garrick Ironvein
person(garrick_ironvein).
first_name(garrick_ironvein, 'Garrick').
last_name(garrick_ironvein, 'Ironvein').
full_name(garrick_ironvein, 'Garrick Ironvein').
gender(garrick_ironvein, male).
alive(garrick_ironvein).
generation(garrick_ironvein, 0).
founder_family(garrick_ironvein).
child(garrick_ironvein, silas_ironvein).
child(garrick_ironvein, wren_ironvein).
spouse(garrick_ironvein, dorothea_ironvein).
location(garrick_ironvein, ironhaven).

%% Dorothea Ironvein
person(dorothea_ironvein).
first_name(dorothea_ironvein, 'Dorothea').
last_name(dorothea_ironvein, 'Ironvein').
full_name(dorothea_ironvein, 'Dorothea Ironvein').
gender(dorothea_ironvein, female).
alive(dorothea_ironvein).
generation(dorothea_ironvein, 0).
founder_family(dorothea_ironvein).
child(dorothea_ironvein, silas_ironvein).
child(dorothea_ironvein, wren_ironvein).
spouse(dorothea_ironvein, garrick_ironvein).
location(dorothea_ironvein, ironhaven).

%% Silas Ironvein
person(silas_ironvein).
first_name(silas_ironvein, 'Silas').
last_name(silas_ironvein, 'Ironvein').
full_name(silas_ironvein, 'Silas Ironvein').
gender(silas_ironvein, male).
alive(silas_ironvein).
generation(silas_ironvein, 1).
parent(garrick_ironvein, silas_ironvein).
parent(dorothea_ironvein, silas_ironvein).
location(silas_ironvein, ironhaven).

%% Wren Ironvein
person(wren_ironvein).
first_name(wren_ironvein, 'Wren').
last_name(wren_ironvein, 'Ironvein').
full_name(wren_ironvein, 'Wren Ironvein').
gender(wren_ironvein, female).
alive(wren_ironvein).
generation(wren_ironvein, 1).
parent(garrick_ironvein, wren_ironvein).
parent(dorothea_ironvein, wren_ironvein).
location(wren_ironvein, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Voss Family (Aether Researchers, Ironhaven / Windhollow)
%% ═══════════════════════════════════════════════════════════

%% Dr. Helena Voss
person(helena_voss).
first_name(helena_voss, 'Helena').
last_name(helena_voss, 'Voss').
full_name(helena_voss, 'Helena Voss').
gender(helena_voss, female).
alive(helena_voss).
generation(helena_voss, 0).
founder_family(helena_voss).
child(helena_voss, felix_voss).
location(helena_voss, windhollow).

%% Felix Voss
person(felix_voss).
first_name(felix_voss, 'Felix').
last_name(felix_voss, 'Voss').
full_name(felix_voss, 'Felix Voss').
gender(felix_voss, male).
alive(felix_voss).
generation(felix_voss, 1).
parent(helena_voss, felix_voss).
location(felix_voss, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Blackwood Family (Aristocrats, Ironhaven)
%% ═══════════════════════════════════════════════════════════

%% Lord Reginald Blackwood
person(reginald_blackwood).
first_name(reginald_blackwood, 'Reginald').
last_name(reginald_blackwood, 'Blackwood').
full_name(reginald_blackwood, 'Reginald Blackwood').
gender(reginald_blackwood, male).
alive(reginald_blackwood).
generation(reginald_blackwood, 0).
founder_family(reginald_blackwood).
child(reginald_blackwood, charlotte_blackwood).
spouse(reginald_blackwood, vivienne_blackwood).
location(reginald_blackwood, ironhaven).

%% Lady Vivienne Blackwood
person(vivienne_blackwood).
first_name(vivienne_blackwood, 'Vivienne').
last_name(vivienne_blackwood, 'Blackwood').
full_name(vivienne_blackwood, 'Vivienne Blackwood').
gender(vivienne_blackwood, female).
alive(vivienne_blackwood).
generation(vivienne_blackwood, 0).
founder_family(vivienne_blackwood).
child(vivienne_blackwood, charlotte_blackwood).
spouse(vivienne_blackwood, reginald_blackwood).
location(vivienne_blackwood, ironhaven).

%% Charlotte Blackwood
person(charlotte_blackwood).
first_name(charlotte_blackwood, 'Charlotte').
last_name(charlotte_blackwood, 'Blackwood').
full_name(charlotte_blackwood, 'Charlotte Blackwood').
gender(charlotte_blackwood, female).
alive(charlotte_blackwood).
generation(charlotte_blackwood, 1).
parent(reginald_blackwood, charlotte_blackwood).
parent(vivienne_blackwood, charlotte_blackwood).
location(charlotte_blackwood, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Independent Characters
%% ═══════════════════════════════════════════════════════════

%% Jasper Cogsworth -- Automaton Engineer
person(jasper_cogsworth).
first_name(jasper_cogsworth, 'Jasper').
last_name(jasper_cogsworth, 'Cogsworth').
full_name(jasper_cogsworth, 'Jasper Cogsworth').
gender(jasper_cogsworth, male).
alive(jasper_cogsworth).
generation(jasper_cogsworth, 0).
location(jasper_cogsworth, ironhaven).

%% Minerva Thatch -- Coppermouth Mine Foreman
person(minerva_thatch).
first_name(minerva_thatch, 'Minerva').
last_name(minerva_thatch, 'Thatch').
full_name(minerva_thatch, 'Minerva Thatch').
gender(minerva_thatch, female).
alive(minerva_thatch).
generation(minerva_thatch, 0).
location(minerva_thatch, coppermouth).
