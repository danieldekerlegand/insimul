%% Ensemble History: Historical Medieval Europe -- Initial World State
%% Source: data/worlds/historical_medieval/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Godfrey de Ashworth ---
trait(godfrey_de_ashworth, male).
trait(godfrey_de_ashworth, authoritative).
trait(godfrey_de_ashworth, pious).
trait(godfrey_de_ashworth, middle_aged).
attribute(godfrey_de_ashworth, charisma, 80).
attribute(godfrey_de_ashworth, cultural_knowledge, 70).
attribute(godfrey_de_ashworth, propriety, 85).

%% --- Matilda de Ashworth ---
trait(matilda_de_ashworth, female).
trait(matilda_de_ashworth, shrewd).
trait(matilda_de_ashworth, gracious).
trait(matilda_de_ashworth, diplomatic).
attribute(matilda_de_ashworth, charisma, 75).
attribute(matilda_de_ashworth, propriety, 90).
attribute(matilda_de_ashworth, cunningness, 65).
relationship(matilda_de_ashworth, godfrey_de_ashworth, married).

%% --- Roland de Ashworth ---
trait(roland_de_ashworth, male).
trait(roland_de_ashworth, young).
trait(roland_de_ashworth, brave).
trait(roland_de_ashworth, impetuous).
attribute(roland_de_ashworth, charisma, 65).
attribute(roland_de_ashworth, self_assuredness, 70).
attribute(roland_de_ashworth, cunningness, 40).

%% --- Eleanor de Ashworth ---
trait(eleanor_de_ashworth, female).
trait(eleanor_de_ashworth, young).
trait(eleanor_de_ashworth, bookish).
trait(eleanor_de_ashworth, curious).
attribute(eleanor_de_ashworth, charisma, 60).
attribute(eleanor_de_ashworth, cultural_knowledge, 65).
attribute(eleanor_de_ashworth, sensitiveness, 70).

%% --- Wulfstan Godwin ---
trait(wulfstan_godwin, male).
trait(wulfstan_godwin, strong).
trait(wulfstan_godwin, stubborn).
trait(wulfstan_godwin, middle_aged).
attribute(wulfstan_godwin, charisma, 55).
attribute(wulfstan_godwin, propriety, 50).
attribute(wulfstan_godwin, cultural_knowledge, 40).
relationship(wulfstan_godwin, godfrey_de_ashworth, subordinate).

%% --- Aelswith Godwin ---
trait(aelswith_godwin, female).
trait(aelswith_godwin, practical).
trait(aelswith_godwin, warm).
trait(aelswith_godwin, devout).
attribute(aelswith_godwin, charisma, 55).
attribute(aelswith_godwin, propriety, 65).
attribute(aelswith_godwin, cultural_knowledge, 45).
relationship(aelswith_godwin, wulfstan_godwin, married).

%% --- Osric Godwin ---
trait(osric_godwin, male).
trait(osric_godwin, young).
trait(osric_godwin, eager).
trait(osric_godwin, clumsy).
attribute(osric_godwin, charisma, 45).
attribute(osric_godwin, self_assuredness, 40).
attribute(osric_godwin, sensitiveness, 55).

%% --- Hugh Aldric ---
trait(hugh_aldric, male).
trait(hugh_aldric, shrewd).
trait(hugh_aldric, calculating).
trait(hugh_aldric, middle_aged).
attribute(hugh_aldric, charisma, 70).
attribute(hugh_aldric, cunningness, 75).
attribute(hugh_aldric, cultural_knowledge, 55).
relationship(hugh_aldric, godfrey_de_ashworth, vassal).

%% --- Margery Aldric ---
trait(margery_aldric, female).
trait(margery_aldric, ambitious).
trait(margery_aldric, charming).
trait(margery_aldric, resourceful).
attribute(margery_aldric, charisma, 70).
attribute(margery_aldric, cunningness, 60).
attribute(margery_aldric, propriety, 70).
relationship(margery_aldric, hugh_aldric, married).
relationship(margery_aldric, matilda_de_ashworth, acquaintance).

%% --- Agnes Aldric ---
trait(agnes_aldric, female).
trait(agnes_aldric, young).
trait(agnes_aldric, gentle).
trait(agnes_aldric, devout).
attribute(agnes_aldric, charisma, 55).
attribute(agnes_aldric, sensitiveness, 70).
attribute(agnes_aldric, propriety, 65).
relationship(agnes_aldric, eleanor_de_ashworth, friends).

%% --- Brother Anselm ---
trait(brother_anselm, male).
trait(brother_anselm, wise).
trait(brother_anselm, stern).
trait(brother_anselm, elderly).
attribute(brother_anselm, charisma, 65).
attribute(brother_anselm, cultural_knowledge, 90).
attribute(brother_anselm, propriety, 85).

%% --- Brother Caedmon ---
trait(brother_caedmon, male).
trait(brother_caedmon, meticulous).
trait(brother_caedmon, quiet).
trait(brother_caedmon, middle_aged).
attribute(brother_caedmon, charisma, 45).
attribute(brother_caedmon, cultural_knowledge, 85).
attribute(brother_caedmon, sensitiveness, 60).
relationship(brother_caedmon, brother_anselm, subordinate).

%% --- Brother Dunstan ---
trait(brother_dunstan, male).
trait(brother_dunstan, gentle).
trait(brother_dunstan, observant).
trait(brother_dunstan, middle_aged).
attribute(brother_dunstan, charisma, 55).
attribute(brother_dunstan, cultural_knowledge, 75).
attribute(brother_dunstan, sensitiveness, 70).

%% --- Prior Benedict ---
trait(prior_benedict, male).
trait(prior_benedict, diplomatic).
trait(prior_benedict, ambitious).
trait(prior_benedict, middle_aged).
attribute(prior_benedict, charisma, 70).
attribute(prior_benedict, cunningness, 60).
attribute(prior_benedict, cultural_knowledge, 80).
relationship(prior_benedict, brother_anselm, acquaintance).

%% --- Edric Miller ---
trait(edric_miller, male).
trait(edric_miller, hardworking).
trait(edric_miller, gruff).
trait(edric_miller, middle_aged).
attribute(edric_miller, charisma, 45).
attribute(edric_miller, propriety, 40).
attribute(edric_miller, cultural_knowledge, 30).

%% --- Gytha Miller ---
trait(gytha_miller, female).
trait(gytha_miller, resilient).
trait(gytha_miller, protective).
trait(gytha_miller, superstitious).
attribute(gytha_miller, charisma, 50).
attribute(gytha_miller, propriety, 50).
attribute(gytha_miller, sensitiveness, 60).
relationship(gytha_miller, edric_miller, married).

%% --- Hild Miller ---
trait(hild_miller, female).
trait(hild_miller, young).
trait(hild_miller, spirited).
trait(hild_miller, defiant).
attribute(hild_miller, charisma, 55).
attribute(hild_miller, self_assuredness, 50).
attribute(hild_miller, sensitiveness, 45).
relationship(hild_miller, agnes_aldric, friends).
