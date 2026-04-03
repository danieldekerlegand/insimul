%% Insimul Characters: Victorian England
%% Source: data/insimul/historical/historical.insimul
%% Converted: 2026-04-02T22:06:25.799Z

%% William Ashford
person(lord_ashford).
first_name(lord_ashford, 'William').
last_name(lord_ashford, 'Ashford').
full_name(lord_ashford, 'William Ashford').
gender(lord_ashford, male).
birth_year(lord_ashford, 1840).
alive(lord_ashford).
occupation(lord_ashford, aristocrat).
at_location(lord_ashford, london).

%% Victoria Ashford
person(lady_ashford).
first_name(lady_ashford, 'Victoria').
last_name(lady_ashford, 'Ashford').
full_name(lady_ashford, 'Victoria Ashford').
gender(lady_ashford, female).
birth_year(lady_ashford, 1845).
alive(lady_ashford).
occupation(lady_ashford, aristocrat).
at_location(lady_ashford, london).
married_to(lady_ashford, lord_ashford).

%% Thomas Edison
person(inventor_edison).
first_name(inventor_edison, 'Thomas').
last_name(inventor_edison, 'Edison').
full_name(inventor_edison, 'Thomas Edison').
gender(inventor_edison, male).
birth_year(inventor_edison, 1850).
alive(inventor_edison).
occupation(inventor_edison, inventor).
at_location(inventor_edison, manchester).

%% Charles Dickens
person(factory_owner).
first_name(factory_owner, 'Charles').
last_name(factory_owner, 'Dickens').
full_name(factory_owner, 'Charles Dickens').
gender(factory_owner, male).
birth_year(factory_owner, 1848).
alive(factory_owner).
occupation(factory_owner, businessman).
at_location(factory_owner, manchester).

%% Charlotte Bronte
person(governess_bronte).
first_name(governess_bronte, 'Charlotte').
last_name(governess_bronte, 'Bronte').
full_name(governess_bronte, 'Charlotte Bronte').
gender(governess_bronte, female).
birth_year(governess_bronte, 1858).
alive(governess_bronte).
occupation(governess_bronte, governess).
at_location(governess_bronte, london).

%% ═══ Relationships ═══
relationship(inventor_edison, factory_owner, friends).
relationship(factory_owner, inventor_edison, friends).

