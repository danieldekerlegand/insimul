%% Insimul Characters: Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/characters.pl
%% Created: 2026-04-03
%% Total: 16 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Ashenvale -- Ironbound Quarter (Cursed Knights)
%% ═══════════════════════════════════════════════════════════

%% Aldric Voss -- Knight Commander, cursed with undying resolve
person(aldric_voss).
first_name(aldric_voss, 'Aldric').
last_name(aldric_voss, 'Voss').
full_name(aldric_voss, 'Aldric Voss').
gender(aldric_voss, male).
alive(aldric_voss).
generation(aldric_voss, 0).
founder_family(aldric_voss).
child(aldric_voss, sera_voss).
spouse(aldric_voss, elara_voss).
location(aldric_voss, ashenvale).

%% Elara Voss -- deceased wife, spirit bound to the cathedral
person(elara_voss).
first_name(elara_voss, 'Elara').
last_name(elara_voss, 'Voss').
full_name(elara_voss, 'Elara Voss').
gender(elara_voss, female).
generation(elara_voss, 0).
founder_family(elara_voss).
child(elara_voss, sera_voss).
spouse(elara_voss, aldric_voss).
location(elara_voss, ashenvale).

%% Sera Voss -- squire and daughter, resists the family curse
person(sera_voss).
first_name(sera_voss, 'Sera').
last_name(sera_voss, 'Voss').
full_name(sera_voss, 'Sera Voss').
gender(sera_voss, female).
alive(sera_voss).
generation(sera_voss, 1).
parent(aldric_voss, sera_voss).
parent(elara_voss, sera_voss).
location(sera_voss, ashenvale).

%% ═══════════════════════════════════════════════════════════
%% Ashenvale -- Plague Quarter (Plague Doctors)
%% ═══════════════════════════════════════════════════════════

%% Corvus Thane -- chief plague doctor
person(corvus_thane).
first_name(corvus_thane, 'Corvus').
last_name(corvus_thane, 'Thane').
full_name(corvus_thane, 'Corvus Thane').
gender(corvus_thane, male).
alive(corvus_thane).
generation(corvus_thane, 0).
founder_family(corvus_thane).
child(corvus_thane, maren_thane).
location(corvus_thane, ashenvale).

%% Maren Thane -- apprentice plague doctor, secretly studying necromancy
person(maren_thane).
first_name(maren_thane, 'Maren').
last_name(maren_thane, 'Thane').
full_name(maren_thane, 'Maren Thane').
gender(maren_thane, female).
alive(maren_thane).
generation(maren_thane, 1).
parent(corvus_thane, maren_thane).
location(maren_thane, ashenvale).

%% ═══════════════════════════════════════════════════════════
%% Ashenvale -- Sanctum Ward (Clergy and Exorcists)
%% ═══════════════════════════════════════════════════════════

%% Prior Ambrose Kael -- head of the Cathedral of Ashes
person(ambrose_kael).
first_name(ambrose_kael, 'Ambrose').
last_name(ambrose_kael, 'Kael').
full_name(ambrose_kael, 'Ambrose Kael').
gender(ambrose_kael, male).
alive(ambrose_kael).
generation(ambrose_kael, 0).
founder_family(ambrose_kael).
location(ambrose_kael, ashenvale).

%% Isolde Wren -- exorcist, scarred by a failed ritual
person(isolde_wren).
first_name(isolde_wren, 'Isolde').
last_name(isolde_wren, 'Wren').
full_name(isolde_wren, 'Isolde Wren').
gender(isolde_wren, female).
alive(isolde_wren).
generation(isolde_wren, 0).
founder_family(isolde_wren).
location(isolde_wren, ashenvale).

%% ═══════════════════════════════════════════════════════════
%% Ashenvale -- Ashen Market (Merchants and Outcasts)
%% ═══════════════════════════════════════════════════════════

%% Ronan Blackwood -- tavern keeper, former soldier
person(ronan_blackwood).
first_name(ronan_blackwood, 'Ronan').
last_name(ronan_blackwood, 'Blackwood').
full_name(ronan_blackwood, 'Ronan Blackwood').
gender(ronan_blackwood, male).
alive(ronan_blackwood).
generation(ronan_blackwood, 0).
founder_family(ronan_blackwood).
location(ronan_blackwood, ashenvale).

%% Vesper Ashmore -- cursed curios dealer, knows too much
person(vesper_ashmore).
first_name(vesper_ashmore, 'Vesper').
last_name(vesper_ashmore, 'Ashmore').
full_name(vesper_ashmore, 'Vesper Ashmore').
gender(vesper_ashmore, female).
alive(vesper_ashmore).
generation(vesper_ashmore, 0).
founder_family(vesper_ashmore).
location(vesper_ashmore, ashenvale).

%% Dredge -- gravedigger, simple but loyal
person(dredge).
first_name(dredge, 'Dredge').
last_name(dredge, '').
full_name(dredge, 'Dredge').
gender(dredge, male).
alive(dredge).
generation(dredge, 0).
location(dredge, ashenvale).

%% Garrett Holt -- blacksmith, arms the defenders
person(garrett_holt).
first_name(garrett_holt, 'Garrett').
last_name(garrett_holt, 'Holt').
full_name(garrett_holt, 'Garrett Holt').
gender(garrett_holt, male).
alive(garrett_holt).
generation(garrett_holt, 0).
founder_family(garrett_holt).
location(garrett_holt, ashenvale).

%% ═══════════════════════════════════════════════════════════
%% Hollowmere -- Witches and Herbalists
%% ═══════════════════════════════════════════════════════════

%% Morwen Greymist -- swamp witch, keeper of forbidden knowledge
person(morwen_greymist).
first_name(morwen_greymist, 'Morwen').
last_name(morwen_greymist, 'Greymist').
full_name(morwen_greymist, 'Morwen Greymist').
gender(morwen_greymist, female).
alive(morwen_greymist).
generation(morwen_greymist, 0).
founder_family(morwen_greymist).
location(morwen_greymist, hollowmere).

%% Silas Fenwick -- herbalist, tries to cure the blight naturally
person(silas_fenwick).
first_name(silas_fenwick, 'Silas').
last_name(silas_fenwick, 'Fenwick').
full_name(silas_fenwick, 'Silas Fenwick').
gender(silas_fenwick, male).
alive(silas_fenwick).
generation(silas_fenwick, 0).
founder_family(silas_fenwick).
location(silas_fenwick, hollowmere).

%% ═══════════════════════════════════════════════════════════
%% Gravenhold -- Undead Lords and Dark Servants
%% ═══════════════════════════════════════════════════════════

%% Lord Varek Draven -- undead lord, rules from the Black Throne
person(varek_draven).
first_name(varek_draven, 'Varek').
last_name(varek_draven, 'Draven').
full_name(varek_draven, 'Varek Draven').
gender(varek_draven, male).
generation(varek_draven, 0).
founder_family(varek_draven).
location(varek_draven, gravenhold).

%% Nyx Sable -- dark sorceress, Draven vassal
person(nyx_sable).
first_name(nyx_sable, 'Nyx').
last_name(nyx_sable, 'Sable').
full_name(nyx_sable, 'Nyx Sable').
gender(nyx_sable, female).
generation(nyx_sable, 0).
founder_family(nyx_sable).
location(nyx_sable, gravenhold).

%% Edric Holloway -- revenant knight, once served Aldric Voss
person(edric_holloway).
first_name(edric_holloway, 'Edric').
last_name(edric_holloway, 'Holloway').
full_name(edric_holloway, 'Edric Holloway').
gender(edric_holloway, male).
generation(edric_holloway, 0).
location(edric_holloway, gravenhold).
