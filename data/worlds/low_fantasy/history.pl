%% Ensemble History: Low Fantasy -- Initial World State
%% Source: data/worlds/low_fantasy/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Marta Grieve ---
trait(marta_grieve, female).
trait(marta_grieve, shrewd).
trait(marta_grieve, connected).
trait(marta_grieve, survivor).
trait(marta_grieve, middle_aged).
attribute(marta_grieve, charisma, 65).
attribute(marta_grieve, cunningness, 75).
attribute(marta_grieve, self_assuredness, 60).
status(marta_grieve, tavern_keeper).
status(marta_grieve, information_broker).

%% --- Dagna Grieve ---
trait(dagna_grieve, female).
trait(dagna_grieve, young).
trait(dagna_grieve, quick).
trait(dagna_grieve, reckless).
attribute(dagna_grieve, charisma, 55).
attribute(dagna_grieve, cunningness, 70).
attribute(dagna_grieve, self_assuredness, 45).
status(dagna_grieve, pickpocket).

%% --- Gregor Voss ---
trait(gregor_voss, male).
trait(gregor_voss, greedy).
trait(gregor_voss, observant).
trait(gregor_voss, cowardly).
attribute(gregor_voss, charisma, 45).
attribute(gregor_voss, cunningness, 80).
attribute(gregor_voss, self_assuredness, 35).
status(gregor_voss, fence).
relationship(gregor_voss, roderick_blackthorn, subordinate).

%% --- Old Mag ---
trait(old_mag, female).
trait(old_mag, ancient).
trait(old_mag, cryptic).
trait(old_mag, knowledgeable).
attribute(old_mag, charisma, 40).
attribute(old_mag, cunningness, 65).
attribute(old_mag, cultural_knowledge, 85).
status(old_mag, hedge_witch).

%% --- Roderick Blackthorn ---
trait(roderick_blackthorn, male).
trait(roderick_blackthorn, ruthless).
trait(roderick_blackthorn, calculating).
trait(roderick_blackthorn, charismatic).
attribute(roderick_blackthorn, charisma, 70).
attribute(roderick_blackthorn, cunningness, 85).
attribute(roderick_blackthorn, self_assuredness, 75).
status(roderick_blackthorn, thief_boss).
relationship(roderick_blackthorn, bailiff_wren, uneasy_truce).

%% --- Aldric Copperton ---
trait(aldric_copperton, male).
trait(aldric_copperton, honest).
trait(aldric_copperton, desperate).
trait(aldric_copperton, indebted).
attribute(aldric_copperton, charisma, 50).
attribute(aldric_copperton, cunningness, 35).
attribute(aldric_copperton, self_assuredness, 30).
status(aldric_copperton, merchant).
relationship(aldric_copperton, roderick_blackthorn, owes_debt).
relationship(aldric_copperton, bailiff_wren, owes_debt).

%% --- Hilda Roth ---
trait(hilda_roth, female).
trait(hilda_roth, tough).
trait(hilda_roth, proud).
trait(hilda_roth, widowed).
attribute(hilda_roth, charisma, 55).
attribute(hilda_roth, self_assuredness, 70).
attribute(hilda_roth, cunningness, 45).
status(hilda_roth, blacksmith).

%% --- Evard Roth ---
trait(evard_roth, male).
trait(evard_roth, young).
trait(evard_roth, earnest).
trait(evard_roth, naive).
attribute(evard_roth, charisma, 50).
attribute(evard_roth, self_assuredness, 40).
attribute(evard_roth, cunningness, 25).
status(evard_roth, apprentice).
relationship(evard_roth, dagna_grieve, infatuated).

%% --- Bailiff Wren ---
trait(bailiff_wren, male).
trait(bailiff_wren, corrupt).
trait(bailiff_wren, vindictive).
trait(bailiff_wren, cunning).
trait(bailiff_wren, middle_aged).
attribute(bailiff_wren, charisma, 55).
attribute(bailiff_wren, cunningness, 80).
attribute(bailiff_wren, self_assuredness, 70).
status(bailiff_wren, bailiff).

%% --- Sister Ashara ---
trait(sister_ashara, female).
trait(sister_ashara, bitter).
trait(sister_ashara, devout).
trait(sister_ashara, knowledgeable).
attribute(sister_ashara, charisma, 45).
attribute(sister_ashara, cultural_knowledge, 80).
attribute(sister_ashara, self_assuredness, 55).
status(sister_ashara, defrocked_priestess).

%% --- Brenna Ashwood ---
trait(brenna_ashwood, female).
trait(brenna_ashwood, compassionate).
trait(brenna_ashwood, secretive).
trait(brenna_ashwood, skilled).
attribute(brenna_ashwood, charisma, 60).
attribute(brenna_ashwood, cunningness, 55).
attribute(brenna_ashwood, cultural_knowledge, 75).
status(brenna_ashwood, healer).

%% --- Captain Jorik Hale ---
trait(jorik_hale, male).
trait(jorik_hale, pragmatic).
trait(jorik_hale, experienced).
trait(jorik_hale, mercenary).
attribute(jorik_hale, charisma, 65).
attribute(jorik_hale, cunningness, 60).
attribute(jorik_hale, self_assuredness, 75).
status(jorik_hale, mercenary_captain).

%% --- Tilda Harrow ---
trait(tilda_harrow, female).
trait(tilda_harrow, stoic).
trait(tilda_harrow, protective).
trait(tilda_harrow, veteran).
attribute(tilda_harrow, charisma, 50).
attribute(tilda_harrow, self_assuredness, 65).
attribute(tilda_harrow, cunningness, 50).
status(tilda_harrow, farmer).

%% --- Colm Harrow ---
trait(colm_harrow, male).
trait(colm_harrow, young).
trait(colm_harrow, eager).
trait(colm_harrow, naive).
attribute(colm_harrow, charisma, 55).
attribute(colm_harrow, self_assuredness, 40).
attribute(colm_harrow, cunningness, 20).
relationship(colm_harrow, jorik_hale, admires).

%% --- Silas Marsh ---
trait(silas_marsh, male).
trait(silas_marsh, ruthless).
trait(silas_marsh, wealthy).
trait(silas_marsh, feared).
attribute(silas_marsh, charisma, 60).
attribute(silas_marsh, cunningness, 85).
attribute(silas_marsh, self_assuredness, 80).
status(silas_marsh, smuggler_kingpin).
relationship(silas_marsh, roderick_blackthorn, business_partner).

%% --- Veska ---
trait(veska, female).
trait(veska, lethal).
trait(veska, laconic).
trait(veska, honourable).
attribute(veska, charisma, 45).
attribute(veska, cunningness, 70).
attribute(veska, self_assuredness, 80).
status(veska, sellsword).
relationship(veska, silas_marsh, employed_by).

%% --- Nils Inkblot ---
trait(nils_inkblot, male).
trait(nils_inkblot, meticulous).
trait(nils_inkblot, nervous).
trait(nils_inkblot, talented).
attribute(nils_inkblot, charisma, 35).
attribute(nils_inkblot, cunningness, 75).
attribute(nils_inkblot, self_assuredness, 25).
status(nils_inkblot, forger).
relationship(nils_inkblot, silas_marsh, employed_by).

%% --- Lord Edric Vane ---
trait(edric_vane, male).
trait(edric_vane, dispossessed).
trait(edric_vane, educated).
trait(edric_vane, proud).
attribute(edric_vane, charisma, 65).
attribute(edric_vane, cunningness, 55).
attribute(edric_vane, cultural_knowledge, 80).
status(edric_vane, hidden_noble).
relationship(edric_vane, silas_marsh, indebted_to).
