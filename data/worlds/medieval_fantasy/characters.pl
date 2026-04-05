%% Insimul Characters: Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Valdris Royal Family (Rulers, Aldenmere)
%% ═══════════════════════════════════════════════════════════

%% King Aldric Valdris
person(aldric_valdris).
first_name(aldric_valdris, 'Aldric').
last_name(aldric_valdris, 'Valdris').
full_name(aldric_valdris, 'Aldric Valdris').
gender(aldric_valdris, male).
alive(aldric_valdris).
generation(aldric_valdris, 0).
founder_family(aldric_valdris).
child(aldric_valdris, rowan_valdris).
child(aldric_valdris, elspeth_valdris).
spouse(aldric_valdris, maren_valdris).
location(aldric_valdris, aldenmere).

%% Queen Maren Valdris
person(maren_valdris).
first_name(maren_valdris, 'Maren').
last_name(maren_valdris, 'Valdris').
full_name(maren_valdris, 'Maren Valdris').
gender(maren_valdris, female).
alive(maren_valdris).
generation(maren_valdris, 0).
founder_family(maren_valdris).
child(maren_valdris, rowan_valdris).
child(maren_valdris, elspeth_valdris).
spouse(maren_valdris, aldric_valdris).
location(maren_valdris, aldenmere).

%% Prince Rowan Valdris
person(rowan_valdris).
first_name(rowan_valdris, 'Rowan').
last_name(rowan_valdris, 'Valdris').
full_name(rowan_valdris, 'Rowan Valdris').
gender(rowan_valdris, male).
alive(rowan_valdris).
generation(rowan_valdris, 1).
parent(aldric_valdris, rowan_valdris).
parent(maren_valdris, rowan_valdris).
location(rowan_valdris, aldenmere).

%% Princess Elspeth Valdris
person(elspeth_valdris).
first_name(elspeth_valdris, 'Elspeth').
last_name(elspeth_valdris, 'Valdris').
full_name(elspeth_valdris, 'Elspeth Valdris').
gender(elspeth_valdris, female).
alive(elspeth_valdris).
generation(elspeth_valdris, 1).
parent(aldric_valdris, elspeth_valdris).
parent(maren_valdris, elspeth_valdris).
location(elspeth_valdris, aldenmere).

%% ═══════════════════════════════════════════════════════════
%% Ironhand Family (Blacksmiths, Aldenmere)
%% ═══════════════════════════════════════════════════════════

%% Gareth Ironhand -- Master Blacksmith
person(gareth_ironhand).
first_name(gareth_ironhand, 'Gareth').
last_name(gareth_ironhand, 'Ironhand').
full_name(gareth_ironhand, 'Gareth Ironhand').
gender(gareth_ironhand, male).
alive(gareth_ironhand).
generation(gareth_ironhand, 0).
founder_family(gareth_ironhand).
child(gareth_ironhand, bran_ironhand).
spouse(gareth_ironhand, marta_ironhand).
location(gareth_ironhand, aldenmere).

%% Marta Ironhand
person(marta_ironhand).
first_name(marta_ironhand, 'Marta').
last_name(marta_ironhand, 'Ironhand').
full_name(marta_ironhand, 'Marta Ironhand').
gender(marta_ironhand, female).
alive(marta_ironhand).
generation(marta_ironhand, 0).
founder_family(marta_ironhand).
child(marta_ironhand, bran_ironhand).
spouse(marta_ironhand, gareth_ironhand).
location(marta_ironhand, aldenmere).

%% Bran Ironhand -- Apprentice Smith
person(bran_ironhand).
first_name(bran_ironhand, 'Bran').
last_name(bran_ironhand, 'Ironhand').
full_name(bran_ironhand, 'Bran Ironhand').
gender(bran_ironhand, male).
alive(bran_ironhand).
generation(bran_ironhand, 1).
parent(gareth_ironhand, bran_ironhand).
parent(marta_ironhand, bran_ironhand).
location(bran_ironhand, aldenmere).

%% ═══════════════════════════════════════════════════════════
%% Standalone Characters (Knights, Sorcerers, Rogues, Fey)
%% ═══════════════════════════════════════════════════════════

%% Sir Cedric Ashford -- Knight Captain
person(cedric_ashford).
first_name(cedric_ashford, 'Cedric').
last_name(cedric_ashford, 'Ashford').
full_name(cedric_ashford, 'Cedric Ashford').
gender(cedric_ashford, male).
alive(cedric_ashford).
generation(cedric_ashford, 0).
location(cedric_ashford, aldenmere).

%% Dame Isolde Ravencrest -- Paladin of Light
person(isolde_ravencrest).
first_name(isolde_ravencrest, 'Isolde').
last_name(isolde_ravencrest, 'Ravencrest').
full_name(isolde_ravencrest, 'Isolde Ravencrest').
gender(isolde_ravencrest, female).
alive(isolde_ravencrest).
generation(isolde_ravencrest, 0).
location(isolde_ravencrest, aldenmere).

%% Thalendros -- Court Wizard
person(thalendros).
first_name(thalendros, 'Thalendros').
last_name(thalendros, '').
full_name(thalendros, 'Thalendros').
gender(thalendros, male).
alive(thalendros).
generation(thalendros, 0).
location(thalendros, aldenmere).

%% Mirabel Thornwick -- Alchemist
person(mirabel_thornwick).
first_name(mirabel_thornwick, 'Mirabel').
last_name(mirabel_thornwick, 'Thornwick').
full_name(mirabel_thornwick, 'Mirabel Thornwick').
gender(mirabel_thornwick, female).
alive(mirabel_thornwick).
generation(mirabel_thornwick, 0).
location(mirabel_thornwick, aldenmere).

%% Kael Shadowmere -- Rogue
person(kael_shadowmere).
first_name(kael_shadowmere, 'Kael').
last_name(kael_shadowmere, 'Shadowmere').
full_name(kael_shadowmere, 'Kael Shadowmere').
gender(kael_shadowmere, male).
alive(kael_shadowmere).
generation(kael_shadowmere, 0).
location(kael_shadowmere, aldenmere).

%% Father Aldwin -- High Priest
person(father_aldwin).
first_name(father_aldwin, 'Aldwin').
last_name(father_aldwin, '').
full_name(father_aldwin, 'Father Aldwin').
gender(father_aldwin, male).
alive(father_aldwin).
generation(father_aldwin, 0).
location(father_aldwin, aldenmere).

%% Elara Willowshade -- Herbalist and Hedge Witch
person(elara_willowshade).
first_name(elara_willowshade, 'Elara').
last_name(elara_willowshade, 'Willowshade').
full_name(elara_willowshade, 'Elara Willowshade').
gender(elara_willowshade, female).
alive(elara_willowshade).
generation(elara_willowshade, 0).
location(elara_willowshade, thornhaven).

%% Fenwick Bramble -- Village Elder of Thornhaven
person(fenwick_bramble).
first_name(fenwick_bramble, 'Fenwick').
last_name(fenwick_bramble, 'Bramble').
full_name(fenwick_bramble, 'Fenwick Bramble').
gender(fenwick_bramble, male).
alive(fenwick_bramble).
generation(fenwick_bramble, 0).
location(fenwick_bramble, thornhaven).

%% Liriel -- Fey Guardian of the Glade
person(liriel).
first_name(liriel, 'Liriel').
last_name(liriel, '').
full_name(liriel, 'Liriel').
gender(liriel, female).
alive(liriel).
generation(liriel, 0).
location(liriel, thornhaven).

%% Durek Stonehammer -- Dwarven Forge Master
person(durek_stonehammer).
first_name(durek_stonehammer, 'Durek').
last_name(durek_stonehammer, 'Stonehammer').
full_name(durek_stonehammer, 'Durek Stonehammer').
gender(durek_stonehammer, male).
alive(durek_stonehammer).
generation(durek_stonehammer, 0).
location(durek_stonehammer, silverdeep).
