%% Ensemble History: Medieval Fantasy -- Initial World State
%% Source: data/worlds/medieval_fantasy/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- King Aldric Valdris ---
trait(aldric_valdris, male).
trait(aldric_valdris, noble).
trait(aldric_valdris, just).
trait(aldric_valdris, aging).
trait(aldric_valdris, middle_aged).
attribute(aldric_valdris, charisma, 80).
attribute(aldric_valdris, cultural_knowledge, 85).
attribute(aldric_valdris, propriety, 90).
attribute(aldric_valdris, status_individual, 100).

%% --- Queen Maren Valdris ---
trait(maren_valdris, female).
trait(maren_valdris, diplomatic).
trait(maren_valdris, perceptive).
trait(maren_valdris, cautious).
attribute(maren_valdris, charisma, 85).
attribute(maren_valdris, cultural_knowledge, 80).
attribute(maren_valdris, propriety, 95).
attribute(maren_valdris, cunningness, 70).
relationship(maren_valdris, aldric_valdris, married).

%% --- Prince Rowan Valdris ---
trait(rowan_valdris, male).
trait(rowan_valdris, young).
trait(rowan_valdris, impulsive).
trait(rowan_valdris, brave).
attribute(rowan_valdris, charisma, 70).
attribute(rowan_valdris, self_assuredness, 65).
attribute(rowan_valdris, propriety, 50).
attribute(rowan_valdris, status_individual, 85).

%% --- Princess Elspeth Valdris ---
trait(elspeth_valdris, female).
trait(elspeth_valdris, young).
trait(elspeth_valdris, studious).
trait(elspeth_valdris, curious).
attribute(elspeth_valdris, charisma, 60).
attribute(elspeth_valdris, cultural_knowledge, 75).
attribute(elspeth_valdris, sensitiveness, 70).
relationship(elspeth_valdris, thalendros, mentor).

%% --- Gareth Ironhand ---
trait(gareth_ironhand, male).
trait(gareth_ironhand, hardworking).
trait(gareth_ironhand, proud).
trait(gareth_ironhand, traditional).
trait(gareth_ironhand, middle_aged).
attribute(gareth_ironhand, charisma, 55).
attribute(gareth_ironhand, cultural_knowledge, 60).
attribute(gareth_ironhand, propriety, 65).
relationship(gareth_ironhand, marta_ironhand, married).

%% --- Marta Ironhand ---
trait(marta_ironhand, female).
trait(marta_ironhand, practical).
trait(marta_ironhand, warm).
trait(marta_ironhand, resourceful).
attribute(marta_ironhand, charisma, 60).
attribute(marta_ironhand, propriety, 70).
attribute(marta_ironhand, cultural_knowledge, 55).
relationship(marta_ironhand, gareth_ironhand, married).

%% --- Bran Ironhand ---
trait(bran_ironhand, male).
trait(bran_ironhand, young).
trait(bran_ironhand, eager).
trait(bran_ironhand, strong).
attribute(bran_ironhand, charisma, 50).
attribute(bran_ironhand, self_assuredness, 45).
attribute(bran_ironhand, sensitiveness, 55).

%% --- Sir Cedric Ashford ---
trait(cedric_ashford, male).
trait(cedric_ashford, honorable).
trait(cedric_ashford, disciplined).
trait(cedric_ashford, loyal).
trait(cedric_ashford, middle_aged).
attribute(cedric_ashford, charisma, 75).
attribute(cedric_ashford, propriety, 85).
attribute(cedric_ashford, self_assuredness, 80).
relationship(cedric_ashford, aldric_valdris, vassal).

%% --- Dame Isolde Ravencrest ---
trait(isolde_ravencrest, female).
trait(isolde_ravencrest, devout).
trait(isolde_ravencrest, fierce).
trait(isolde_ravencrest, compassionate).
attribute(isolde_ravencrest, charisma, 80).
attribute(isolde_ravencrest, self_assuredness, 85).
attribute(isolde_ravencrest, propriety, 75).
relationship(isolde_ravencrest, father_aldwin, ally).

%% --- Thalendros ---
trait(thalendros, male).
trait(thalendros, intellectual).
trait(thalendros, secretive).
trait(thalendros, ancient).
attribute(thalendros, charisma, 60).
attribute(thalendros, cultural_knowledge, 95).
attribute(thalendros, cunningness, 80).

%% --- Mirabel Thornwick ---
trait(mirabel_thornwick, female).
trait(mirabel_thornwick, meticulous).
trait(mirabel_thornwick, independent).
trait(mirabel_thornwick, curious).
attribute(mirabel_thornwick, charisma, 55).
attribute(mirabel_thornwick, cultural_knowledge, 70).
attribute(mirabel_thornwick, cunningness, 60).

%% --- Kael Shadowmere ---
trait(kael_shadowmere, male).
trait(kael_shadowmere, cunning).
trait(kael_shadowmere, charming).
trait(kael_shadowmere, untrustworthy).
attribute(kael_shadowmere, charisma, 75).
attribute(kael_shadowmere, cunningness, 85).
attribute(kael_shadowmere, self_assuredness, 70).
attribute(kael_shadowmere, propriety, 25).

%% --- Father Aldwin ---
trait(father_aldwin, male).
trait(father_aldwin, devout).
trait(father_aldwin, wise).
trait(father_aldwin, elderly).
attribute(father_aldwin, charisma, 70).
attribute(father_aldwin, cultural_knowledge, 90).
attribute(father_aldwin, propriety, 95).

%% --- Elara Willowshade ---
trait(elara_willowshade, female).
trait(elara_willowshade, gentle).
trait(elara_willowshade, nature_loving).
trait(elara_willowshade, solitary).
attribute(elara_willowshade, charisma, 50).
attribute(elara_willowshade, cultural_knowledge, 80).
attribute(elara_willowshade, sensitiveness, 75).

%% --- Fenwick Bramble ---
trait(fenwick_bramble, male).
trait(fenwick_bramble, stubborn).
trait(fenwick_bramble, protective).
trait(fenwick_bramble, elderly).
attribute(fenwick_bramble, charisma, 55).
attribute(fenwick_bramble, cultural_knowledge, 70).
attribute(fenwick_bramble, propriety, 60).
relationship(fenwick_bramble, elara_willowshade, friends).

%% --- Liriel ---
trait(liriel, female).
trait(liriel, ethereal).
trait(liriel, mysterious).
trait(liriel, ancient).
attribute(liriel, charisma, 90).
attribute(liriel, cultural_knowledge, 100).
attribute(liriel, sensitiveness, 95).

%% --- Durek Stonehammer ---
trait(durek_stonehammer, male).
trait(durek_stonehammer, gruff).
trait(durek_stonehammer, loyal).
trait(durek_stonehammer, master_craftsman).
trait(durek_stonehammer, middle_aged).
attribute(durek_stonehammer, charisma, 45).
attribute(durek_stonehammer, cultural_knowledge, 75).
attribute(durek_stonehammer, propriety, 55).
relationship(durek_stonehammer, gareth_ironhand, friends).
