%% Ensemble History: Horror World -- Initial World State
%% Source: data/worlds/horror/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Edgar Holloway ---
trait(edgar_holloway, male).
trait(edgar_holloway, secretive).
trait(edgar_holloway, cautious).
trait(edgar_holloway, pragmatic).
trait(edgar_holloway, middle_aged).
attribute(edgar_holloway, charisma, 55).
attribute(edgar_holloway, cunningness, 65).
attribute(edgar_holloway, sanity, 60).
status(edgar_holloway, innkeeper).

%% --- Martha Holloway ---
trait(martha_holloway, female).
trait(martha_holloway, clairvoyant).
trait(martha_holloway, anxious).
trait(martha_holloway, protective).
attribute(martha_holloway, charisma, 45).
attribute(martha_holloway, sensitiveness, 90).
attribute(martha_holloway, sanity, 50).
relationship(martha_holloway, edgar_holloway, married).

%% --- Eleanor Holloway ---
trait(eleanor_holloway, female).
trait(eleanor_holloway, young).
trait(eleanor_holloway, haunted).
trait(eleanor_holloway, perceptive).
attribute(eleanor_holloway, charisma, 50).
attribute(eleanor_holloway, sensitiveness, 85).
attribute(eleanor_holloway, sanity, 55).

%% --- Silas Blackwood ---
trait(silas_blackwood, male).
trait(silas_blackwood, charismatic).
trait(silas_blackwood, fanatical).
trait(silas_blackwood, ruthless).
trait(silas_blackwood, middle_aged).
attribute(silas_blackwood, charisma, 80).
attribute(silas_blackwood, cunningness, 85).
attribute(silas_blackwood, sanity, 40).
status(silas_blackwood, cult_leader).

%% --- Virginia Blackwood ---
trait(virginia_blackwood, female).
trait(virginia_blackwood, reclusive).
trait(virginia_blackwood, fearful).
trait(virginia_blackwood, obedient).
attribute(virginia_blackwood, charisma, 40).
attribute(virginia_blackwood, sensitiveness, 70).
attribute(virginia_blackwood, sanity, 45).
relationship(virginia_blackwood, silas_blackwood, married).

%% --- Corvus Blackwood ---
trait(corvus_blackwood, male).
trait(corvus_blackwood, young).
trait(corvus_blackwood, occultist).
trait(corvus_blackwood, obsessive).
attribute(corvus_blackwood, charisma, 55).
attribute(corvus_blackwood, cunningness, 70).
attribute(corvus_blackwood, sanity, 35).
relationship(corvus_blackwood, silas_blackwood, devoted).

%% --- Isolde Blackwood ---
trait(isolde_blackwood, female).
trait(isolde_blackwood, young).
trait(isolde_blackwood, defiant).
trait(isolde_blackwood, traumatized).
attribute(isolde_blackwood, charisma, 60).
attribute(isolde_blackwood, self_assuredness, 55).
attribute(isolde_blackwood, sanity, 65).
relationship(isolde_blackwood, silas_blackwood, fears).

%% --- Ezekiel Crane ---
trait(ezekiel_crane, male).
trait(ezekiel_crane, grim).
trait(ezekiel_crane, stoic).
trait(ezekiel_crane, knowledgeable).
trait(ezekiel_crane, elderly).
attribute(ezekiel_crane, charisma, 35).
attribute(ezekiel_crane, cunningness, 60).
attribute(ezekiel_crane, sanity, 55).
status(ezekiel_crane, gravedigger).

%% --- Abel Crane ---
trait(abel_crane, male).
trait(abel_crane, young).
trait(abel_crane, mute).
trait(abel_crane, observant).
attribute(abel_crane, charisma, 25).
attribute(abel_crane, sensitiveness, 80).
attribute(abel_crane, sanity, 60).

%% --- Ruth Hargrove ---
trait(ruth_hargrove, female).
trait(ruth_hargrove, determined).
trait(ruth_hargrove, skeptical).
trait(ruth_hargrove, brave).
attribute(ruth_hargrove, charisma, 65).
attribute(ruth_hargrove, cunningness, 70).
attribute(ruth_hargrove, sanity, 75).
status(ruth_hargrove, sheriff).

%% --- Ambrose Thorne ---
trait(ambrose_thorne, male).
trait(ambrose_thorne, devout).
trait(ambrose_thorne, burdened).
trait(ambrose_thorne, secretive).
trait(ambrose_thorne, middle_aged).
attribute(ambrose_thorne, charisma, 60).
attribute(ambrose_thorne, cultural_knowledge, 80).
attribute(ambrose_thorne, sanity, 55).
status(ambrose_thorne, priest).

%% --- Dr. Miriam Voss ---
trait(miriam_voss, female).
trait(miriam_voss, intelligent).
trait(miriam_voss, morally_ambiguous).
trait(miriam_voss, curious).
attribute(miriam_voss, charisma, 55).
attribute(miriam_voss, cunningness, 75).
attribute(miriam_voss, sanity, 60).
status(miriam_voss, doctor).

%% --- Thomas Bledsoe ---
trait(thomas_bledsoe, male).
trait(thomas_bledsoe, reclusive).
trait(thomas_bledsoe, knowledgeable).
trait(thomas_bledsoe, paranoid).
attribute(thomas_bledsoe, charisma, 40).
attribute(thomas_bledsoe, cunningness, 65).
attribute(thomas_bledsoe, sanity, 50).
status(thomas_bledsoe, apothecary).
relationship(thomas_bledsoe, ambrose_thorne, uneasy_alliance).

%% --- Agnes Wight ---
trait(agnes_wight, female).
trait(agnes_wight, ancient).
trait(agnes_wight, cryptic).
trait(agnes_wight, powerful).
attribute(agnes_wight, charisma, 45).
attribute(agnes_wight, sensitiveness, 95).
attribute(agnes_wight, sanity, 30).
status(agnes_wight, witch).

%% --- Caleb Marsh ---
trait(caleb_marsh, male).
trait(caleb_marsh, traumatized).
trait(caleb_marsh, isolated).
trait(caleb_marsh, resourceful).
attribute(caleb_marsh, charisma, 30).
attribute(caleb_marsh, cunningness, 55).
attribute(caleb_marsh, sanity, 40).
status(caleb_marsh, hermit).

%% --- Jack Dunmore ---
trait(jack_dunmore, male).
trait(jack_dunmore, persistent).
trait(jack_dunmore, reckless).
trait(jack_dunmore, idealistic).
attribute(jack_dunmore, charisma, 60).
attribute(jack_dunmore, cunningness, 55).
attribute(jack_dunmore, sanity, 80).
status(jack_dunmore, journalist).

%% --- Lena Petrova ---
trait(lena_petrova, female).
trait(lena_petrova, analytical).
trait(lena_petrova, brave).
trait(lena_petrova, obsessive).
attribute(lena_petrova, charisma, 50).
attribute(lena_petrova, cunningness, 65).
attribute(lena_petrova, sanity, 70).
status(lena_petrova, researcher).
relationship(lena_petrova, jack_dunmore, colleagues).
