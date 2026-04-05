%% Ensemble History: Victorian England -- Initial World State
%% Source: data/worlds/victorian_england/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% ─── Lord William Ashford ───
trait(lord_ashford, male).
trait(lord_ashford, aristocratic).
trait(lord_ashford, conservative).
trait(lord_ashford, dignified).
trait(lord_ashford, middle_aged).
attribute(lord_ashford, charisma, 75).
attribute(lord_ashford, wealth, 95).
attribute(lord_ashford, political_influence, 80).
attribute(lord_ashford, empathy, 45).
status(lord_ashford, member_of_parliament).

%% ─── Lady Victoria Ashford ───
trait(lady_ashford, female).
trait(lady_ashford, refined).
trait(lady_ashford, socially_adept).
trait(lady_ashford, charitable).
attribute(lady_ashford, charisma, 85).
attribute(lady_ashford, propriety, 90).
attribute(lady_ashford, social_influence, 80).
attribute(lady_ashford, intelligence, 75).
relationship(lady_ashford, lord_ashford, married).
status(lady_ashford, society_hostess).

%% ─── Thomas Edison (Inventor) ───
trait(inventor_edison, male).
trait(inventor_edison, brilliant).
trait(inventor_edison, ambitious).
trait(inventor_edison, unconventional).
trait(inventor_edison, young_adult).
attribute(inventor_edison, intelligence, 90).
attribute(inventor_edison, charisma, 60).
attribute(inventor_edison, technical_skill, 95).
attribute(inventor_edison, wealth, 30).
status(inventor_edison, inventor).
relationship(inventor_edison, factory_owner, business_partner).

%% ─── Charles Dickens (Factory Owner) ───
trait(factory_owner, male).
trait(factory_owner, shrewd).
trait(factory_owner, pragmatic).
trait(factory_owner, ruthless).
trait(factory_owner, middle_aged).
attribute(factory_owner, charisma, 65).
attribute(factory_owner, wealth, 80).
attribute(factory_owner, business_acumen, 90).
attribute(factory_owner, empathy, 30).
status(factory_owner, mill_owner).
relationship(factory_owner, inventor_edison, business_partner).

%% ─── Charlotte Bronte (Governess) ─��─
trait(governess_bronte, female).
trait(governess_bronte, intelligent).
trait(governess_bronte, compassionate).
trait(governess_bronte, determined).
trait(governess_bronte, young_adult).
attribute(governess_bronte, intelligence, 85).
attribute(governess_bronte, charisma, 60).
attribute(governess_bronte, empathy, 90).
attribute(governess_bronte, wealth, 15).
status(governess_bronte, governess).
relationship(governess_bronte, lady_ashford, employer_employee).

%% ──��� Cross-character relationships ───
network(lord_ashford, lady_ashford, trust, 8).
network(lord_ashford, factory_owner, trust, 5).
network(lord_ashford, inventor_edison, trust, 4).
network(lady_ashford, governess_bronte, trust, 6).
network(inventor_edison, factory_owner, trust, 7).
network(governess_bronte, lord_ashford, respect, 5).
network(factory_owner, lord_ashford, respect, 6).
network(governess_bronte, lady_ashford, loyalty, 7).
