%% Ensemble History: Tropical Pirate -- Initial World State
%% Source: data/worlds/tropical_pirate/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Jack Hawkins (Captain Redbeard) ---
trait(jack_hawkins, male).
trait(jack_hawkins, charismatic).
trait(jack_hawkins, cunning).
trait(jack_hawkins, daring).
trait(jack_hawkins, middle_aged).
attribute(jack_hawkins, charisma, 85).
attribute(jack_hawkins, cunningness, 75).
attribute(jack_hawkins, self_assuredness, 80).

%% --- Anne Blacktide ---
trait(anne_blacktide, female).
trait(anne_blacktide, fierce).
trait(anne_blacktide, loyal).
trait(anne_blacktide, strategic).
attribute(anne_blacktide, charisma, 70).
attribute(anne_blacktide, cunningness, 70).
attribute(anne_blacktide, self_assuredness, 85).
relationship(anne_blacktide, jack_hawkins, allies).

%% --- Silas Crow ---
trait(silas_crow, male).
trait(silas_crow, shrewd).
trait(silas_crow, practical).
trait(silas_crow, greedy).
attribute(silas_crow, charisma, 55).
attribute(silas_crow, cunningness, 80).
attribute(silas_crow, self_assuredness, 60).
relationship(silas_crow, jack_hawkins, allies).

%% --- Estrella Santos ---
trait(estrella_santos, female).
trait(estrella_santos, brilliant).
trait(estrella_santos, observant).
trait(estrella_santos, quiet).
attribute(estrella_santos, charisma, 50).
attribute(estrella_santos, cultural_knowledge, 80).
attribute(estrella_santos, cunningness, 65).
relationship(estrella_santos, jack_hawkins, allies).

%% --- Morgan Flint ---
trait(morgan_flint, male).
trait(morgan_flint, aggressive).
trait(morgan_flint, superstitious).
trait(morgan_flint, tough).
attribute(morgan_flint, charisma, 45).
attribute(morgan_flint, self_assuredness, 75).
attribute(morgan_flint, cunningness, 40).
relationship(morgan_flint, mary_thorne, allies).

%% --- Mary Thorne (Bloody Mary) ---
trait(mary_thorne, female).
trait(mary_thorne, ruthless).
trait(mary_thorne, commanding).
trait(mary_thorne, fearless).
attribute(mary_thorne, charisma, 80).
attribute(mary_thorne, cunningness, 75).
attribute(mary_thorne, self_assuredness, 90).
relationship(mary_thorne, jack_hawkins, rivals).

%% --- Alejandro de la Cruz ---
trait(alejandro_de_la_cruz, male).
trait(alejandro_de_la_cruz, aristocratic).
trait(alejandro_de_la_cruz, calculating).
trait(alejandro_de_la_cruz, proud).
trait(alejandro_de_la_cruz, middle_aged).
attribute(alejandro_de_la_cruz, charisma, 70).
attribute(alejandro_de_la_cruz, cunningness, 75).
attribute(alejandro_de_la_cruz, propriety, 90).
relationship(alejandro_de_la_cruz, jack_hawkins, enemies).

%% --- Isabella de la Cruz ---
trait(isabella_de_la_cruz, female).
trait(isabella_de_la_cruz, elegant).
trait(isabella_de_la_cruz, perceptive).
trait(isabella_de_la_cruz, middle_aged).
attribute(isabella_de_la_cruz, charisma, 75).
attribute(isabella_de_la_cruz, cultural_knowledge, 80).
attribute(isabella_de_la_cruz, propriety, 85).
relationship(isabella_de_la_cruz, alejandro_de_la_cruz, married).

%% --- Sofia de la Cruz ---
trait(sofia_de_la_cruz, female).
trait(sofia_de_la_cruz, young).
trait(sofia_de_la_cruz, rebellious).
trait(sofia_de_la_cruz, adventurous).
attribute(sofia_de_la_cruz, charisma, 70).
attribute(sofia_de_la_cruz, self_assuredness, 60).
attribute(sofia_de_la_cruz, cunningness, 55).

%% --- Rodrigo Vega ---
trait(rodrigo_vega, male).
trait(rodrigo_vega, disciplined).
trait(rodrigo_vega, honorable).
trait(rodrigo_vega, stern).
attribute(rodrigo_vega, charisma, 60).
attribute(rodrigo_vega, self_assuredness, 80).
attribute(rodrigo_vega, propriety, 85).
relationship(rodrigo_vega, alejandro_de_la_cruz, allies).
relationship(rodrigo_vega, jack_hawkins, enemies).

%% --- Barnacle Bill ---
trait(barnacle_bill, male).
trait(barnacle_bill, skilled).
trait(barnacle_bill, gruff).
trait(barnacle_bill, middle_aged).
attribute(barnacle_bill, charisma, 40).
attribute(barnacle_bill, cultural_knowledge, 60).
attribute(barnacle_bill, self_assuredness, 55).
relationship(barnacle_bill, jack_hawkins, friends).

%% --- Mama Celeste ---
trait(mama_celeste, female).
trait(mama_celeste, warm).
trait(mama_celeste, resourceful).
trait(mama_celeste, connected).
attribute(mama_celeste, charisma, 80).
attribute(mama_celeste, cunningness, 55).
attribute(mama_celeste, cultural_knowledge, 65).

%% --- Old Finch ---
trait(old_finch, male).
trait(old_finch, wise).
trait(old_finch, eccentric).
trait(old_finch, elderly).
attribute(old_finch, charisma, 45).
attribute(old_finch, cultural_knowledge, 85).
attribute(old_finch, cunningness, 50).

%% --- Hana Sato ---
trait(hana_sato, female).
trait(hana_sato, meticulous).
trait(hana_sato, reserved).
trait(hana_sato, brilliant).
attribute(hana_sato, charisma, 50).
attribute(hana_sato, cultural_knowledge, 90).
attribute(hana_sato, self_assuredness, 55).

%% --- Claude Dubois ---
trait(claude_dubois, male).
trait(claude_dubois, charming).
trait(claude_dubois, unscrupulous).
trait(claude_dubois, middle_aged).
attribute(claude_dubois, charisma, 75).
attribute(claude_dubois, cunningness, 85).
attribute(claude_dubois, self_assuredness, 70).

%% --- Padre Miguel ---
trait(padre_miguel, male).
trait(padre_miguel, devout).
trait(padre_miguel, compassionate).
trait(padre_miguel, middle_aged).
attribute(padre_miguel, charisma, 65).
attribute(padre_miguel, cultural_knowledge, 80).
attribute(padre_miguel, propriety, 90).

%% --- Nkechi Obi ---
trait(nkechi_obi, male).
trait(nkechi_obi, resilient).
trait(nkechi_obi, proud).
trait(nkechi_obi, skilled).
attribute(nkechi_obi, charisma, 55).
attribute(nkechi_obi, self_assuredness, 70).
attribute(nkechi_obi, cultural_knowledge, 60).
relationship(nkechi_obi, mary_thorne, friends).

%% --- Rosalita Vega ---
trait(rosalita_vega, female).
trait(rosalita_vega, artistic).
trait(rosalita_vega, independent).
trait(rosalita_vega, young).
attribute(rosalita_vega, charisma, 65).
attribute(rosalita_vega, self_assuredness, 60).
attribute(rosalita_vega, cultural_knowledge, 55).
