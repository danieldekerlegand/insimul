%% Ensemble History: Historical Victorian -- Initial World State
%% Source: data/worlds/historical_victorian/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Lord Edmund Ashworth ---
trait(edmund_ashworth, male).
trait(edmund_ashworth, aristocratic).
trait(edmund_ashworth, authoritarian).
trait(edmund_ashworth, shrewd).
trait(edmund_ashworth, middle_aged).
attribute(edmund_ashworth, charisma, 80).
attribute(edmund_ashworth, cultural_knowledge, 75).
attribute(edmund_ashworth, cunningness, 70).
attribute(edmund_ashworth, propriety, 85).
status(edmund_ashworth, landowner).
status(edmund_ashworth, industrialist).

%% --- Lady Margaret Ashworth ---
trait(margaret_ashworth, female).
trait(margaret_ashworth, dignified).
trait(margaret_ashworth, calculating).
trait(margaret_ashworth, socially_adept).
attribute(margaret_ashworth, charisma, 85).
attribute(margaret_ashworth, propriety, 95).
attribute(margaret_ashworth, cunningness, 65).
relationship(margaret_ashworth, edmund_ashworth, married).
status(margaret_ashworth, society_matriarch).

%% --- Charlotte Ashworth ---
trait(charlotte_ashworth, female).
trait(charlotte_ashworth, young).
trait(charlotte_ashworth, rebellious).
trait(charlotte_ashworth, compassionate).
trait(charlotte_ashworth, educated).
attribute(charlotte_ashworth, charisma, 70).
attribute(charlotte_ashworth, self_assuredness, 65).
attribute(charlotte_ashworth, sensitiveness, 75).
relationship(charlotte_ashworth, agnes_whittle, secret_ally).

%% --- Henry Ashworth ---
trait(henry_ashworth, male).
trait(henry_ashworth, young).
trait(henry_ashworth, idle).
trait(henry_ashworth, charming).
trait(henry_ashworth, indebted).
attribute(henry_ashworth, charisma, 75).
attribute(henry_ashworth, cunningness, 40).
attribute(henry_ashworth, self_assuredness, 55).
status(henry_ashworth, heir).

%% --- Silas Blackwood ---
trait(silas_blackwood, male).
trait(silas_blackwood, self_made).
trait(silas_blackwood, ruthless).
trait(silas_blackwood, ambitious).
trait(silas_blackwood, middle_aged).
attribute(silas_blackwood, charisma, 65).
attribute(silas_blackwood, cunningness, 85).
attribute(silas_blackwood, self_assuredness, 80).
relationship(silas_blackwood, edmund_ashworth, business_rival).
status(silas_blackwood, factory_owner).

%% --- Thomas Blackwood ---
trait(thomas_blackwood, male).
trait(thomas_blackwood, young).
trait(thomas_blackwood, conflicted).
trait(thomas_blackwood, educated).
trait(thomas_blackwood, sympathetic).
attribute(thomas_blackwood, charisma, 60).
attribute(thomas_blackwood, sensitiveness, 70).
attribute(thomas_blackwood, self_assuredness, 45).
relationship(thomas_blackwood, charlotte_ashworth, admires).

%% --- Molly Flint ---
trait(molly_flint, female).
trait(molly_flint, resourceful).
trait(molly_flint, hardened).
trait(molly_flint, protective).
attribute(molly_flint, charisma, 55).
attribute(molly_flint, cunningness, 70).
attribute(molly_flint, self_assuredness, 60).
status(molly_flint, boarding_house_keeper).

%% --- Jack Cinders ---
trait(jack_cinders, male).
trait(jack_cinders, young).
trait(jack_cinders, streetwise).
trait(jack_cinders, quick).
trait(jack_cinders, distrustful).
attribute(jack_cinders, charisma, 50).
attribute(jack_cinders, cunningness, 75).
attribute(jack_cinders, self_assuredness, 40).
relationship(jack_cinders, molly_flint, ward).
status(jack_cinders, street_urchin).

%% --- Agnes Whittle ---
trait(agnes_whittle, female).
trait(agnes_whittle, determined).
trait(agnes_whittle, brave).
trait(agnes_whittle, articulate).
attribute(agnes_whittle, charisma, 70).
attribute(agnes_whittle, self_assuredness, 75).
attribute(agnes_whittle, sensitiveness, 60).
status(agnes_whittle, union_organizer).

%% --- Inspector Rupert Hale ---
trait(rupert_hale, male).
trait(rupert_hale, methodical).
trait(rupert_hale, incorruptible).
trait(rupert_hale, observant).
trait(rupert_hale, middle_aged).
attribute(rupert_hale, charisma, 60).
attribute(rupert_hale, cunningness, 80).
attribute(rupert_hale, propriety, 70).
status(rupert_hale, police_detective).

%% --- Dr. Eliza Hartley ---
trait(eliza_hartley, female).
trait(eliza_hartley, brilliant).
trait(eliza_hartley, stubborn).
trait(eliza_hartley, compassionate).
attribute(eliza_hartley, charisma, 65).
attribute(eliza_hartley, cultural_knowledge, 80).
attribute(eliza_hartley, self_assuredness, 70).
relationship(eliza_hartley, alistair_pemberton, colleagues).
status(eliza_hartley, physician).

%% --- Professor Alistair Pemberton ---
trait(alistair_pemberton, male).
trait(alistair_pemberton, eccentric).
trait(alistair_pemberton, brilliant).
trait(alistair_pemberton, absent_minded).
attribute(alistair_pemberton, charisma, 55).
attribute(alistair_pemberton, cultural_knowledge, 90).
attribute(alistair_pemberton, cunningness, 50).
status(alistair_pemberton, inventor).

%% --- Reverend William Oakes ---
trait(william_oakes, male).
trait(william_oakes, pious).
trait(william_oakes, conflicted).
trait(william_oakes, eloquent).
trait(william_oakes, middle_aged).
attribute(william_oakes, charisma, 70).
attribute(william_oakes, propriety, 80).
attribute(william_oakes, sensitiveness, 65).
status(william_oakes, clergyman).

%% --- Mrs. Nell Briggs ---
trait(nell_briggs, female).
trait(nell_briggs, efficient).
trait(nell_briggs, loyal).
trait(nell_briggs, stern).
attribute(nell_briggs, charisma, 50).
attribute(nell_briggs, propriety, 75).
attribute(nell_briggs, cunningness, 55).
relationship(nell_briggs, margaret_ashworth, serves).
status(nell_briggs, housekeeper).

%% --- Arthur Graves ---
trait(arthur_graves, male).
trait(arthur_graves, dignified).
trait(arthur_graves, discreet).
trait(arthur_graves, observant).
attribute(arthur_graves, charisma, 60).
attribute(arthur_graves, propriety, 90).
attribute(arthur_graves, cunningness, 60).
relationship(arthur_graves, edmund_ashworth, serves).
status(arthur_graves, butler).

%% --- Shen Li ---
trait(shen_li, male).
trait(shen_li, secretive).
trait(shen_li, patient).
trait(shen_li, perceptive).
attribute(shen_li, charisma, 55).
attribute(shen_li, cunningness, 80).
attribute(shen_li, cultural_knowledge, 70).
status(shen_li, opium_den_operator).

%% --- Barnaby Soot ---
trait(barnaby_soot, male).
trait(barnaby_soot, gruff).
trait(barnaby_soot, exploitative).
trait(barnaby_soot, cunning).
attribute(barnaby_soot, charisma, 40).
attribute(barnaby_soot, cunningness, 65).
attribute(barnaby_soot, self_assuredness, 55).
status(barnaby_soot, chimney_sweep_master).
