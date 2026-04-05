%% Insimul Characters: Horror World
%% Source: data/worlds/horror/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Holloway Family (Boarding House Owners, Ravenhollow)
%% ═══════════════════════════════════════════════════════════

%% Edgar Holloway -- innkeeper, knows the town secrets
person(edgar_holloway).
first_name(edgar_holloway, 'Edgar').
last_name(edgar_holloway, 'Holloway').
full_name(edgar_holloway, 'Edgar Holloway').
gender(edgar_holloway, male).
alive(edgar_holloway).
generation(edgar_holloway, 0).
founder_family(edgar_holloway).
child(edgar_holloway, eleanor_holloway).
spouse(edgar_holloway, martha_holloway).
location(edgar_holloway, ravenhollow).

%% Martha Holloway -- sees things others cannot
person(martha_holloway).
first_name(martha_holloway, 'Martha').
last_name(martha_holloway, 'Holloway').
full_name(martha_holloway, 'Martha Holloway').
gender(martha_holloway, female).
alive(martha_holloway).
generation(martha_holloway, 0).
founder_family(martha_holloway).
child(martha_holloway, eleanor_holloway).
spouse(martha_holloway, edgar_holloway).
location(martha_holloway, ravenhollow).

%% Eleanor Holloway -- haunted daughter
person(eleanor_holloway).
first_name(eleanor_holloway, 'Eleanor').
last_name(eleanor_holloway, 'Holloway').
full_name(eleanor_holloway, 'Eleanor Holloway').
gender(eleanor_holloway, female).
alive(eleanor_holloway).
generation(eleanor_holloway, 1).
parent(edgar_holloway, eleanor_holloway).
parent(martha_holloway, eleanor_holloway).
location(eleanor_holloway, ravenhollow).

%% ═══════════════════════════════════════════════════════════
%% Blackwood Family (Old Money, Hillcrest Manor)
%% ═══════════════════════════════════════════════════════════

%% Silas Blackwood -- patriarch, cult leader
person(silas_blackwood).
first_name(silas_blackwood, 'Silas').
last_name(silas_blackwood, 'Blackwood').
full_name(silas_blackwood, 'Silas Blackwood').
gender(silas_blackwood, male).
alive(silas_blackwood).
generation(silas_blackwood, 0).
founder_family(silas_blackwood).
child(silas_blackwood, corvus_blackwood).
child(silas_blackwood, isolde_blackwood).
spouse(silas_blackwood, virginia_blackwood).
location(silas_blackwood, ravenhollow).

%% Virginia Blackwood -- reclusive matriarch
person(virginia_blackwood).
first_name(virginia_blackwood, 'Virginia').
last_name(virginia_blackwood, 'Blackwood').
full_name(virginia_blackwood, 'Virginia Blackwood').
gender(virginia_blackwood, female).
alive(virginia_blackwood).
generation(virginia_blackwood, 0).
founder_family(virginia_blackwood).
child(virginia_blackwood, corvus_blackwood).
child(virginia_blackwood, isolde_blackwood).
spouse(virginia_blackwood, silas_blackwood).
location(virginia_blackwood, ravenhollow).

%% Corvus Blackwood -- occultist son
person(corvus_blackwood).
first_name(corvus_blackwood, 'Corvus').
last_name(corvus_blackwood, 'Blackwood').
full_name(corvus_blackwood, 'Corvus Blackwood').
gender(corvus_blackwood, male).
alive(corvus_blackwood).
generation(corvus_blackwood, 1).
parent(silas_blackwood, corvus_blackwood).
parent(virginia_blackwood, corvus_blackwood).
location(corvus_blackwood, ravenhollow).

%% Isolde Blackwood -- wants to escape the family legacy
person(isolde_blackwood).
first_name(isolde_blackwood, 'Isolde').
last_name(isolde_blackwood, 'Blackwood').
full_name(isolde_blackwood, 'Isolde Blackwood').
gender(isolde_blackwood, female).
alive(isolde_blackwood).
generation(isolde_blackwood, 1).
parent(silas_blackwood, isolde_blackwood).
parent(virginia_blackwood, isolde_blackwood).
location(isolde_blackwood, ravenhollow).

%% ═══════════════════════════════════════════════════════════
%% Crane Family (Groundskeeper, Cemetery)
%% ═══════════════════════════════════════════════════════════

%% Ezekiel Crane -- gravedigger, knows what lies beneath
person(ezekiel_crane).
first_name(ezekiel_crane, 'Ezekiel').
last_name(ezekiel_crane, 'Crane').
full_name(ezekiel_crane, 'Ezekiel Crane').
gender(ezekiel_crane, male).
alive(ezekiel_crane).
generation(ezekiel_crane, 0).
founder_family(ezekiel_crane).
child(ezekiel_crane, abel_crane).
location(ezekiel_crane, ravenhollow).

%% Abel Crane -- mute son, witnesses everything
person(abel_crane).
first_name(abel_crane, 'Abel').
last_name(abel_crane, 'Crane').
full_name(abel_crane, 'Abel Crane').
gender(abel_crane, male).
alive(abel_crane).
generation(abel_crane, 1).
parent(ezekiel_crane, abel_crane).
location(abel_crane, ravenhollow).

%% ═══════════════════════════════════════════════════════════
%% Independent Characters (Ravenhollow)
%% ═══════════════════════════════════════════════════════════

%% Sheriff Ruth Hargrove -- investigator, skeptic turned believer
person(ruth_hargrove).
first_name(ruth_hargrove, 'Ruth').
last_name(ruth_hargrove, 'Hargrove').
full_name(ruth_hargrove, 'Ruth Hargrove').
gender(ruth_hargrove, female).
alive(ruth_hargrove).
generation(ruth_hargrove, 0).
location(ruth_hargrove, ravenhollow).

%% Father Ambrose Thorne -- priest with dark knowledge
person(ambrose_thorne).
first_name(ambrose_thorne, 'Ambrose').
last_name(ambrose_thorne, 'Thorne').
full_name(ambrose_thorne, 'Ambrose Thorne').
gender(ambrose_thorne, male).
alive(ambrose_thorne).
generation(ambrose_thorne, 0).
location(ambrose_thorne, ravenhollow).

%% Dr. Miriam Voss -- asylum doctor, morally ambiguous
person(miriam_voss).
first_name(miriam_voss, 'Miriam').
last_name(miriam_voss, 'Voss').
full_name(miriam_voss, 'Miriam Voss').
gender(miriam_voss, female).
alive(miriam_voss).
generation(miriam_voss, 0).
location(miriam_voss, ravenhollow).

%% Thomas Bledsoe -- apothecary, herbalist with forbidden recipes
person(thomas_bledsoe).
first_name(thomas_bledsoe, 'Thomas').
last_name(thomas_bledsoe, 'Bledsoe').
full_name(thomas_bledsoe, 'Thomas Bledsoe').
gender(thomas_bledsoe, male).
alive(thomas_bledsoe).
generation(thomas_bledsoe, 0).
location(thomas_bledsoe, ravenhollow).

%% ═══════════════════════════════════════════════════════════
%% Grimhaven Characters
%% ═══════════════════════════════════════════════════════════

%% Agnes Wight -- witch of Grimhaven, oracle
person(agnes_wight).
first_name(agnes_wight, 'Agnes').
last_name(agnes_wight, 'Wight').
full_name(agnes_wight, 'Agnes Wight').
gender(agnes_wight, female).
alive(agnes_wight).
generation(agnes_wight, 0).
location(agnes_wight, grimhaven).

%% Caleb Marsh -- hermit, survivor of past horrors
person(caleb_marsh).
first_name(caleb_marsh, 'Caleb').
last_name(caleb_marsh, 'Marsh').
full_name(caleb_marsh, 'Caleb Marsh').
gender(caleb_marsh, male).
alive(caleb_marsh).
generation(caleb_marsh, 0).
location(caleb_marsh, grimhaven).

%% ═══════════════════════════════════════════════════════════
%% Outsiders / Investigators
%% ═══════════════════════════════════════════════════════════

%% Jack Dunmore -- journalist investigating disappearances
person(jack_dunmore).
first_name(jack_dunmore, 'Jack').
last_name(jack_dunmore, 'Dunmore').
full_name(jack_dunmore, 'Jack Dunmore').
gender(jack_dunmore, male).
alive(jack_dunmore).
generation(jack_dunmore, 0).
location(jack_dunmore, ravenhollow).

%% Lena Petrova -- paranormal researcher
person(lena_petrova).
first_name(lena_petrova, 'Lena').
last_name(lena_petrova, 'Petrova').
full_name(lena_petrova, 'Lena Petrova').
gender(lena_petrova, female).
alive(lena_petrova).
generation(lena_petrova, 0).
location(lena_petrova, ravenhollow).
