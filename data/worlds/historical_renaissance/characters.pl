%% Insimul Characters: Renaissance City-States
%% Source: data/worlds/historical_renaissance/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (5 families/groupings)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Valori Family (Banker-Patrons, Fiorenza)
%% ═══════════════════════════════════════════════════════════

%% Lorenzo Valori -- Patriarch, head of the banking house
person(lorenzo_valori).
first_name(lorenzo_valori, 'Lorenzo').
last_name(lorenzo_valori, 'Valori').
full_name(lorenzo_valori, 'Lorenzo Valori').
gender(lorenzo_valori, male).
alive(lorenzo_valori).
generation(lorenzo_valori, 0).
founder_family(lorenzo_valori).
child(lorenzo_valori, giulia_valori).
child(lorenzo_valori, cosimo_valori).
spouse(lorenzo_valori, isabella_valori).
location(lorenzo_valori, fiorenza).

%% Isabella Valori -- Matriarch, arts patron
person(isabella_valori).
first_name(isabella_valori, 'Isabella').
last_name(isabella_valori, 'Valori').
full_name(isabella_valori, 'Isabella Valori').
gender(isabella_valori, female).
alive(isabella_valori).
generation(isabella_valori, 0).
founder_family(isabella_valori).
child(isabella_valori, giulia_valori).
child(isabella_valori, cosimo_valori).
spouse(isabella_valori, lorenzo_valori).
location(isabella_valori, fiorenza).

%% Giulia Valori -- Daughter, aspiring humanist scholar
person(giulia_valori).
first_name(giulia_valori, 'Giulia').
last_name(giulia_valori, 'Valori').
full_name(giulia_valori, 'Giulia Valori').
gender(giulia_valori, female).
alive(giulia_valori).
generation(giulia_valori, 1).
parent(lorenzo_valori, giulia_valori).
parent(isabella_valori, giulia_valori).
location(giulia_valori, fiorenza).

%% Cosimo Valori -- Son, heir to banking operations
person(cosimo_valori).
first_name(cosimo_valori, 'Cosimo').
last_name(cosimo_valori, 'Valori').
full_name(cosimo_valori, 'Cosimo Valori').
gender(cosimo_valori, male).
alive(cosimo_valori).
generation(cosimo_valori, 1).
parent(lorenzo_valori, cosimo_valori).
parent(isabella_valori, cosimo_valori).
location(cosimo_valori, fiorenza).

%% ═══════════════════════════════════════════════════════════
%% Rinaldi Household (Artists, Fiorenza)
%% ═══════════════════════════════════════════════════════════

%% Maestro Rinaldi -- Master painter, runs the bottega
person(maestro_rinaldi).
first_name(maestro_rinaldi, 'Alessandro').
last_name(maestro_rinaldi, 'Rinaldi').
full_name(maestro_rinaldi, 'Maestro Rinaldi').
gender(maestro_rinaldi, male).
alive(maestro_rinaldi).
generation(maestro_rinaldi, 0).
founder_family(maestro_rinaldi).
child(maestro_rinaldi, elena_rinaldi).
spouse(maestro_rinaldi, caterina_rinaldi).
location(maestro_rinaldi, fiorenza).

%% Caterina Rinaldi -- Wife, manages the household
person(caterina_rinaldi).
first_name(caterina_rinaldi, 'Caterina').
last_name(caterina_rinaldi, 'Rinaldi').
full_name(caterina_rinaldi, 'Caterina Rinaldi').
gender(caterina_rinaldi, female).
alive(caterina_rinaldi).
generation(caterina_rinaldi, 0).
founder_family(caterina_rinaldi).
child(caterina_rinaldi, elena_rinaldi).
spouse(caterina_rinaldi, maestro_rinaldi).
location(caterina_rinaldi, fiorenza).

%% Elena Rinaldi -- Daughter, secretly studies painting
person(elena_rinaldi).
first_name(elena_rinaldi, 'Elena').
last_name(elena_rinaldi, 'Rinaldi').
full_name(elena_rinaldi, 'Elena Rinaldi').
gender(elena_rinaldi, female).
alive(elena_rinaldi).
generation(elena_rinaldi, 1).
parent(maestro_rinaldi, elena_rinaldi).
parent(caterina_rinaldi, elena_rinaldi).
location(elena_rinaldi, fiorenza).

%% Marco Bellini -- Apprentice sculptor in Fiorenza
person(marco_bellini).
first_name(marco_bellini, 'Marco').
last_name(marco_bellini, 'Bellini').
full_name(marco_bellini, 'Marco Bellini').
gender(marco_bellini, male).
alive(marco_bellini).
generation(marco_bellini, 1).
location(marco_bellini, fiorenza).

%% ═══════════════════════════════════════════════════════════
%% Contarini Family (Merchants, Porto Sereno)
%% ═══════════════════════════════════════════════════════════

%% Andrea Contarini -- Merchant prince, trade fleet owner
person(andrea_contarini).
first_name(andrea_contarini, 'Andrea').
last_name(andrea_contarini, 'Contarini').
full_name(andrea_contarini, 'Andrea Contarini').
gender(andrea_contarini, male).
alive(andrea_contarini).
generation(andrea_contarini, 0).
founder_family(andrea_contarini).
child(andrea_contarini, lucia_contarini).
child(andrea_contarini, nicolao_contarini).
spouse(andrea_contarini, bianca_contarini).
location(andrea_contarini, porto_sereno).

%% Bianca Contarini -- Wife, skilled in diplomacy
person(bianca_contarini).
first_name(bianca_contarini, 'Bianca').
last_name(bianca_contarini, 'Contarini').
full_name(bianca_contarini, 'Bianca Contarini').
gender(bianca_contarini, female).
alive(bianca_contarini).
generation(bianca_contarini, 0).
founder_family(bianca_contarini).
child(bianca_contarini, lucia_contarini).
child(bianca_contarini, nicolao_contarini).
spouse(bianca_contarini, andrea_contarini).
location(bianca_contarini, porto_sereno).

%% Lucia Contarini -- Daughter, studies navigation
person(lucia_contarini).
first_name(lucia_contarini, 'Lucia').
last_name(lucia_contarini, 'Contarini').
full_name(lucia_contarini, 'Lucia Contarini').
gender(lucia_contarini, female).
alive(lucia_contarini).
generation(lucia_contarini, 1).
parent(andrea_contarini, lucia_contarini).
parent(bianca_contarini, lucia_contarini).
location(lucia_contarini, porto_sereno).

%% Nicolao Contarini -- Son, ambitious young merchant
person(nicolao_contarini).
first_name(nicolao_contarini, 'Nicolao').
last_name(nicolao_contarini, 'Contarini').
full_name(nicolao_contarini, 'Nicolao Contarini').
gender(nicolao_contarini, male).
alive(nicolao_contarini).
generation(nicolao_contarini, 1).
parent(andrea_contarini, nicolao_contarini).
parent(bianca_contarini, nicolao_contarini).
location(nicolao_contarini, porto_sereno).

%% ═══════════════════════════════════════════════════════════
%% Clergy and Scholars
%% ═══════════════════════════════════════════════════════════

%% Fra Girolamo -- Dominican friar, reformist preacher
person(fra_girolamo).
first_name(fra_girolamo, 'Girolamo').
last_name(fra_girolamo, 'da Montepulciano').
full_name(fra_girolamo, 'Fra Girolamo').
gender(fra_girolamo, male).
alive(fra_girolamo).
generation(fra_girolamo, 0).
location(fra_girolamo, fiorenza).

%% Dottore Orsini -- Natural philosopher and physician
person(dottore_orsini).
first_name(dottore_orsini, 'Giacomo').
last_name(dottore_orsini, 'Orsini').
full_name(dottore_orsini, 'Dottore Orsini').
gender(dottore_orsini, male).
alive(dottore_orsini).
generation(dottore_orsini, 0).
location(dottore_orsini, rocca_lunare).

%% Suor Chiara -- Abbess, keeper of the monastery library
person(suor_chiara).
first_name(suor_chiara, 'Chiara').
last_name(suor_chiara, 'di Rocca Lunare').
full_name(suor_chiara, 'Suor Chiara').
gender(suor_chiara, female).
alive(suor_chiara).
generation(suor_chiara, 0).
location(suor_chiara, rocca_lunare).

%% ═══════════════════════════════════════════════════════════
%% Independent Characters
%% ═══════════════════════════════════════════════════════════

%% Tommaso Galli -- Ship captain and navigator
person(tommaso_galli).
first_name(tommaso_galli, 'Tommaso').
last_name(tommaso_galli, 'Galli').
full_name(tommaso_galli, 'Tommaso Galli').
gender(tommaso_galli, male).
alive(tommaso_galli).
generation(tommaso_galli, 0).
location(tommaso_galli, porto_sereno).

%% Sofia Moretti -- Herbalist and midwife
person(sofia_moretti).
first_name(sofia_moretti, 'Sofia').
last_name(sofia_moretti, 'Moretti').
full_name(sofia_moretti, 'Sofia Moretti').
gender(sofia_moretti, female).
alive(sofia_moretti).
generation(sofia_moretti, 0).
location(sofia_moretti, rocca_lunare).
