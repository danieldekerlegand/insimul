%% Ensemble History: Renaissance City-States -- Initial World State
%% Source: data/worlds/historical_renaissance/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Lorenzo Valori ---
trait(lorenzo_valori, male).
trait(lorenzo_valori, calculating).
trait(lorenzo_valori, cultured).
trait(lorenzo_valori, middle_aged).
attribute(lorenzo_valori, charisma, 85).
attribute(lorenzo_valori, cunningness, 80).
attribute(lorenzo_valori, cultural_knowledge, 75).

%% --- Isabella Valori ---
trait(isabella_valori, female).
trait(isabella_valori, gracious).
trait(isabella_valori, perceptive).
trait(isabella_valori, patron).
attribute(isabella_valori, charisma, 80).
attribute(isabella_valori, cultural_knowledge, 85).
attribute(isabella_valori, propriety, 80).
relationship(isabella_valori, lorenzo_valori, married).

%% --- Giulia Valori ---
trait(giulia_valori, female).
trait(giulia_valori, young).
trait(giulia_valori, studious).
trait(giulia_valori, independent).
attribute(giulia_valori, charisma, 60).
attribute(giulia_valori, cultural_knowledge, 70).
attribute(giulia_valori, self_assuredness, 55).
relationship(giulia_valori, suor_chiara, acquaintance).

%% --- Cosimo Valori ---
trait(cosimo_valori, male).
trait(cosimo_valori, young).
trait(cosimo_valori, ambitious).
trait(cosimo_valori, pragmatic).
attribute(cosimo_valori, charisma, 65).
attribute(cosimo_valori, cunningness, 60).
attribute(cosimo_valori, self_assuredness, 65).

%% --- Maestro Rinaldi ---
trait(maestro_rinaldi, male).
trait(maestro_rinaldi, passionate).
trait(maestro_rinaldi, perfectionist).
trait(maestro_rinaldi, middle_aged).
attribute(maestro_rinaldi, charisma, 70).
attribute(maestro_rinaldi, cultural_knowledge, 90).
attribute(maestro_rinaldi, sensitiveness, 75).
relationship(maestro_rinaldi, lorenzo_valori, client).

%% --- Caterina Rinaldi ---
trait(caterina_rinaldi, female).
trait(caterina_rinaldi, practical).
trait(caterina_rinaldi, loyal).
trait(caterina_rinaldi, organized).
attribute(caterina_rinaldi, charisma, 55).
attribute(caterina_rinaldi, propriety, 70).
attribute(caterina_rinaldi, cunningness, 50).
relationship(caterina_rinaldi, maestro_rinaldi, married).

%% --- Elena Rinaldi ---
trait(elena_rinaldi, female).
trait(elena_rinaldi, young).
trait(elena_rinaldi, creative).
trait(elena_rinaldi, secretive).
attribute(elena_rinaldi, charisma, 55).
attribute(elena_rinaldi, sensitiveness, 75).
attribute(elena_rinaldi, self_assuredness, 45).
relationship(elena_rinaldi, giulia_valori, friends).

%% --- Marco Bellini ---
trait(marco_bellini, male).
trait(marco_bellini, young).
trait(marco_bellini, talented).
trait(marco_bellini, competitive).
attribute(marco_bellini, charisma, 60).
attribute(marco_bellini, self_assuredness, 60).
attribute(marco_bellini, sensitiveness, 55).
relationship(marco_bellini, maestro_rinaldi, apprentice).

%% --- Andrea Contarini ---
trait(andrea_contarini, male).
trait(andrea_contarini, shrewd).
trait(andrea_contarini, commanding).
trait(andrea_contarini, middle_aged).
attribute(andrea_contarini, charisma, 80).
attribute(andrea_contarini, cunningness, 85).
attribute(andrea_contarini, cultural_knowledge, 65).
relationship(andrea_contarini, lorenzo_valori, rival).

%% --- Bianca Contarini ---
trait(bianca_contarini, female).
trait(bianca_contarini, diplomatic).
trait(bianca_contarini, elegant).
trait(bianca_contarini, sharp).
attribute(bianca_contarini, charisma, 80).
attribute(bianca_contarini, cunningness, 70).
attribute(bianca_contarini, propriety, 85).
relationship(bianca_contarini, andrea_contarini, married).

%% --- Lucia Contarini ---
trait(lucia_contarini, female).
trait(lucia_contarini, young).
trait(lucia_contarini, adventurous).
trait(lucia_contarini, clever).
attribute(lucia_contarini, charisma, 60).
attribute(lucia_contarini, self_assuredness, 65).
attribute(lucia_contarini, cunningness, 50).

%% --- Nicolao Contarini ---
trait(nicolao_contarini, male).
trait(nicolao_contarini, young).
trait(nicolao_contarini, ambitious).
trait(nicolao_contarini, charming).
attribute(nicolao_contarini, charisma, 70).
attribute(nicolao_contarini, cunningness, 55).
attribute(nicolao_contarini, self_assuredness, 60).
relationship(nicolao_contarini, cosimo_valori, rival).

%% --- Fra Girolamo ---
trait(fra_girolamo, male).
trait(fra_girolamo, zealous).
trait(fra_girolamo, eloquent).
trait(fra_girolamo, austere).
attribute(fra_girolamo, charisma, 85).
attribute(fra_girolamo, cultural_knowledge, 80).
attribute(fra_girolamo, self_assuredness, 90).
relationship(fra_girolamo, lorenzo_valori, antagonist).

%% --- Dottore Orsini ---
trait(dottore_orsini, male).
trait(dottore_orsini, inquisitive).
trait(dottore_orsini, methodical).
trait(dottore_orsini, middle_aged).
attribute(dottore_orsini, charisma, 55).
attribute(dottore_orsini, cultural_knowledge, 95).
attribute(dottore_orsini, sensitiveness, 60).
relationship(dottore_orsini, suor_chiara, friends).

%% --- Suor Chiara ---
trait(suor_chiara, female).
trait(suor_chiara, wise).
trait(suor_chiara, serene).
trait(suor_chiara, learned).
attribute(suor_chiara, charisma, 65).
attribute(suor_chiara, cultural_knowledge, 90).
attribute(suor_chiara, propriety, 85).

%% --- Tommaso Galli ---
trait(tommaso_galli, male).
trait(tommaso_galli, bold).
trait(tommaso_galli, resourceful).
trait(tommaso_galli, worldly).
attribute(tommaso_galli, charisma, 70).
attribute(tommaso_galli, cunningness, 65).
attribute(tommaso_galli, self_assuredness, 75).
relationship(tommaso_galli, andrea_contarini, subordinate).

%% --- Sofia Moretti ---
trait(sofia_moretti, female).
trait(sofia_moretti, gentle).
trait(sofia_moretti, observant).
trait(sofia_moretti, independent).
attribute(sofia_moretti, charisma, 55).
attribute(sofia_moretti, cultural_knowledge, 80).
attribute(sofia_moretti, sensitiveness, 75).
