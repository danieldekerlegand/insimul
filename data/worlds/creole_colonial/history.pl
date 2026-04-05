%% Ensemble History: Creole Colonial -- Initial World State
%% Source: data/worlds/creole_colonial/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Henri Beaumont (Plantation Owner) ---
trait(henri_beaumont, male).
trait(henri_beaumont, authoritative).
trait(henri_beaumont, proud).
trait(henri_beaumont, traditional).
trait(henri_beaumont, middle_aged).
attribute(henri_beaumont, charisma, 70).
attribute(henri_beaumont, cultural_knowledge, 80).
attribute(henri_beaumont, wealth, 95).
attribute(henri_beaumont, propriety, 75).
language_proficiency(henri_beaumont, louisiana_creole, 85).
language_proficiency(henri_beaumont, french, 90).
language_proficiency(henri_beaumont, spanish, 30).

%% --- Claire Beaumont ---
trait(claire_beaumont, female).
trait(claire_beaumont, refined).
trait(claire_beaumont, strategic).
trait(claire_beaumont, devout).
attribute(claire_beaumont, charisma, 80).
attribute(claire_beaumont, cultural_knowledge, 85).
attribute(claire_beaumont, wealth, 90).
attribute(claire_beaumont, propriety, 90).
relationship(claire_beaumont, henri_beaumont, married).
language_proficiency(claire_beaumont, louisiana_creole, 75).
language_proficiency(claire_beaumont, french, 95).
language_proficiency(claire_beaumont, spanish, 20).

%% --- Etienne Beaumont ---
trait(etienne_beaumont, male).
trait(etienne_beaumont, idealistic).
trait(etienne_beaumont, rebellious).
trait(etienne_beaumont, young_adult).
attribute(etienne_beaumont, charisma, 65).
attribute(etienne_beaumont, cultural_knowledge, 60).
attribute(etienne_beaumont, wealth, 80).
attribute(etienne_beaumont, propriety, 45).
relationship(etienne_beaumont, henri_beaumont, child_of).
relationship(etienne_beaumont, claire_beaumont, child_of).
relationship(etienne_beaumont, marie_toussaint, attracted).
language_proficiency(etienne_beaumont, louisiana_creole, 70).
language_proficiency(etienne_beaumont, french, 85).
language_proficiency(etienne_beaumont, spanish, 15).

%% --- Marguerite Beaumont ---
trait(marguerite_beaumont, female).
trait(marguerite_beaumont, ambitious).
trait(marguerite_beaumont, graceful).
trait(marguerite_beaumont, young_adult).
attribute(marguerite_beaumont, charisma, 85).
attribute(marguerite_beaumont, cultural_knowledge, 70).
attribute(marguerite_beaumont, wealth, 80).
attribute(marguerite_beaumont, propriety, 80).
relationship(marguerite_beaumont, henri_beaumont, child_of).
relationship(marguerite_beaumont, claire_beaumont, child_of).
language_proficiency(marguerite_beaumont, louisiana_creole, 65).
language_proficiency(marguerite_beaumont, french, 90).

%% --- Jean-Pierre Toussaint (Free Person of Color, Jeweler) ---
trait(jean_pierre_toussaint, male).
trait(jean_pierre_toussaint, dignified).
trait(jean_pierre_toussaint, skilled).
trait(jean_pierre_toussaint, cautious).
trait(jean_pierre_toussaint, middle_aged).
attribute(jean_pierre_toussaint, charisma, 65).
attribute(jean_pierre_toussaint, cultural_knowledge, 75).
attribute(jean_pierre_toussaint, wealth, 60).
attribute(jean_pierre_toussaint, craftsmanship, 90).
language_proficiency(jean_pierre_toussaint, louisiana_creole, 95).
language_proficiency(jean_pierre_toussaint, french, 70).
language_proficiency(jean_pierre_toussaint, spanish, 25).

%% --- Adele Toussaint ---
trait(adele_toussaint, female).
trait(adele_toussaint, resilient).
trait(adele_toussaint, community_minded).
trait(adele_toussaint, protective).
attribute(adele_toussaint, charisma, 70).
attribute(adele_toussaint, cultural_knowledge, 85).
attribute(adele_toussaint, wealth, 55).
attribute(adele_toussaint, propriety, 75).
relationship(adele_toussaint, jean_pierre_toussaint, married).
language_proficiency(adele_toussaint, louisiana_creole, 95).
language_proficiency(adele_toussaint, french, 60).

%% --- Marie Toussaint ---
trait(marie_toussaint, female).
trait(marie_toussaint, curious).
trait(marie_toussaint, talented).
trait(marie_toussaint, young_adult).
attribute(marie_toussaint, charisma, 75).
attribute(marie_toussaint, cultural_knowledge, 70).
attribute(marie_toussaint, wealth, 50).
attribute(marie_toussaint, craftsmanship, 80).
relationship(marie_toussaint, jean_pierre_toussaint, child_of).
relationship(marie_toussaint, adele_toussaint, child_of).
relationship(marie_toussaint, etienne_beaumont, attracted).
language_proficiency(marie_toussaint, louisiana_creole, 90).
language_proficiency(marie_toussaint, french, 65).

%% --- Jacques Moreau (Merchant) ---
trait(jacques_moreau, male).
trait(jacques_moreau, shrewd).
trait(jacques_moreau, opportunistic).
trait(jacques_moreau, middle_aged).
attribute(jacques_moreau, charisma, 75).
attribute(jacques_moreau, cultural_knowledge, 65).
attribute(jacques_moreau, wealth, 85).
attribute(jacques_moreau, propriety, 60).
relationship(jacques_moreau, capitaine_lafitte, business_partner).
language_proficiency(jacques_moreau, louisiana_creole, 80).
language_proficiency(jacques_moreau, french, 85).
language_proficiency(jacques_moreau, spanish, 50).

%% --- Isabelle Moreau ---
trait(isabelle_moreau, female).
trait(isabelle_moreau, perceptive).
trait(isabelle_moreau, sociable).
trait(isabelle_moreau, cunning).
attribute(isabelle_moreau, charisma, 80).
attribute(isabelle_moreau, cultural_knowledge, 75).
attribute(isabelle_moreau, wealth, 80).
attribute(isabelle_moreau, propriety, 70).
relationship(isabelle_moreau, jacques_moreau, married).
relationship(isabelle_moreau, claire_beaumont, rival).
language_proficiency(isabelle_moreau, louisiana_creole, 75).
language_proficiency(isabelle_moreau, french, 90).

%% --- Louis Moreau ---
trait(louis_moreau, male).
trait(louis_moreau, adventurous).
trait(louis_moreau, reckless).
trait(louis_moreau, young_adult).
attribute(louis_moreau, charisma, 70).
attribute(louis_moreau, cultural_knowledge, 50).
attribute(louis_moreau, wealth, 70).
attribute(louis_moreau, propriety, 35).
relationship(louis_moreau, jacques_moreau, child_of).
relationship(louis_moreau, isabelle_moreau, child_of).
relationship(louis_moreau, capitaine_lafitte, admires).
language_proficiency(louis_moreau, louisiana_creole, 75).
language_proficiency(louis_moreau, french, 80).
language_proficiency(louis_moreau, spanish, 40).

%% --- Remy Boudreaux (Bayou Trapper) ---
trait(remy_boudreaux, male).
trait(remy_boudreaux, resourceful).
trait(remy_boudreaux, independent).
trait(remy_boudreaux, superstitious).
trait(remy_boudreaux, middle_aged).
attribute(remy_boudreaux, charisma, 55).
attribute(remy_boudreaux, cultural_knowledge, 70).
attribute(remy_boudreaux, wealth, 30).
attribute(remy_boudreaux, survival, 95).
language_proficiency(remy_boudreaux, louisiana_creole, 95).
language_proficiency(remy_boudreaux, french, 50).

%% --- Josephine Boudreaux ---
trait(josephine_boudreaux, female).
trait(josephine_boudreaux, practical).
trait(josephine_boudreaux, nurturing).
trait(josephine_boudreaux, herbalist).
attribute(josephine_boudreaux, charisma, 60).
attribute(josephine_boudreaux, cultural_knowledge, 80).
attribute(josephine_boudreaux, wealth, 25).
attribute(josephine_boudreaux, healing, 85).
relationship(josephine_boudreaux, remy_boudreaux, married).
relationship(josephine_boudreaux, mambo_celeste, apprentice_of).
language_proficiency(josephine_boudreaux, louisiana_creole, 95).
language_proficiency(josephine_boudreaux, french, 40).

%% --- Pierre Boudreaux ---
trait(pierre_boudreaux, male).
trait(pierre_boudreaux, quiet).
trait(pierre_boudreaux, observant).
trait(pierre_boudreaux, young_adult).
attribute(pierre_boudreaux, charisma, 45).
attribute(pierre_boudreaux, cultural_knowledge, 60).
attribute(pierre_boudreaux, wealth, 20).
attribute(pierre_boudreaux, survival, 80).
relationship(pierre_boudreaux, remy_boudreaux, child_of).
relationship(pierre_boudreaux, josephine_boudreaux, child_of).
language_proficiency(pierre_boudreaux, louisiana_creole, 90).
language_proficiency(pierre_boudreaux, french, 35).

%% --- Mambo Celeste (Voodoo Priestess) ---
trait(mambo_celeste, female).
trait(mambo_celeste, mysterious).
trait(mambo_celeste, powerful).
trait(mambo_celeste, wise).
trait(mambo_celeste, elder).
attribute(mambo_celeste, charisma, 90).
attribute(mambo_celeste, cultural_knowledge, 95).
attribute(mambo_celeste, wealth, 40).
attribute(mambo_celeste, spiritual_power, 95).
attribute(mambo_celeste, healing, 90).
language_proficiency(mambo_celeste, louisiana_creole, 95).
language_proficiency(mambo_celeste, french, 55).
language_proficiency(mambo_celeste, west_african_fon, 70).

%% --- Padre Ignacio (Spanish Priest) ---
trait(padre_ignacio, male).
trait(padre_ignacio, devout).
trait(padre_ignacio, scholarly).
trait(padre_ignacio, conflicted).
trait(padre_ignacio, middle_aged).
attribute(padre_ignacio, charisma, 70).
attribute(padre_ignacio, cultural_knowledge, 80).
attribute(padre_ignacio, wealth, 35).
attribute(padre_ignacio, propriety, 90).
relationship(padre_ignacio, mambo_celeste, suspicious_of).
language_proficiency(padre_ignacio, louisiana_creole, 50).
language_proficiency(padre_ignacio, french, 70).
language_proficiency(padre_ignacio, spanish, 95).
language_proficiency(padre_ignacio, latin, 85).

%% --- Capitaine Lafitte (Privateer) ---
trait(capitaine_lafitte, male).
trait(capitaine_lafitte, charismatic).
trait(capitaine_lafitte, daring).
trait(capitaine_lafitte, cunning).
trait(capitaine_lafitte, middle_aged).
attribute(capitaine_lafitte, charisma, 85).
attribute(capitaine_lafitte, cultural_knowledge, 55).
attribute(capitaine_lafitte, wealth, 75).
attribute(capitaine_lafitte, combat, 85).
relationship(capitaine_lafitte, jacques_moreau, business_partner).
relationship(capitaine_lafitte, henri_beaumont, rival).
language_proficiency(capitaine_lafitte, louisiana_creole, 80).
language_proficiency(capitaine_lafitte, french, 85).
language_proficiency(capitaine_lafitte, spanish, 60).
language_proficiency(capitaine_lafitte, english, 45).

%% --- Tante Rose (Elder Storyteller) ---
trait(tante_rose, female).
trait(tante_rose, storyteller).
trait(tante_rose, gentle).
trait(tante_rose, keeper_of_traditions).
trait(tante_rose, elder).
attribute(tante_rose, charisma, 75).
attribute(tante_rose, cultural_knowledge, 95).
attribute(tante_rose, wealth, 15).
attribute(tante_rose, wisdom, 90).
relationship(tante_rose, mambo_celeste, friend).
relationship(tante_rose, josephine_boudreaux, mentor_of).
language_proficiency(tante_rose, louisiana_creole, 95).
language_proficiency(tante_rose, french, 45).
language_proficiency(tante_rose, west_african_fon, 50).
