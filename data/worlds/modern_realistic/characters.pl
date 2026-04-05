%% Insimul Characters: Modern Realistic
%% Source: data/worlds/modern_realistic/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (5 families + 2 singles)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ===============================================================
%% Chen Family (Software Engineer and Teacher, Oak Ridge)
%% ===============================================================

%% David Chen -- software engineer at Lakeside Tech Hub
person(david_chen).
first_name(david_chen, 'David').
last_name(david_chen, 'Chen').
full_name(david_chen, 'David Chen').
gender(david_chen, male).
alive(david_chen).
generation(david_chen, 0).
founder_family(david_chen).
child(david_chen, emma_chen).
child(david_chen, kevin_chen).
spouse(david_chen, maria_chen).
location(david_chen, maplewood).

%% Maria Chen -- high school biology teacher
person(maria_chen).
first_name(maria_chen, 'Maria').
last_name(maria_chen, 'Chen').
full_name(maria_chen, 'Maria Chen').
gender(maria_chen, female).
alive(maria_chen).
generation(maria_chen, 0).
founder_family(maria_chen).
child(maria_chen, emma_chen).
child(maria_chen, kevin_chen).
spouse(maria_chen, david_chen).
location(maria_chen, maplewood).

%% Emma Chen -- college student, studying environmental science
person(emma_chen).
first_name(emma_chen, 'Emma').
last_name(emma_chen, 'Chen').
full_name(emma_chen, 'Emma Chen').
gender(emma_chen, female).
alive(emma_chen).
generation(emma_chen, 1).
parent(david_chen, emma_chen).
parent(maria_chen, emma_chen).
location(emma_chen, maplewood).

%% Kevin Chen -- high school junior, aspiring filmmaker
person(kevin_chen).
first_name(kevin_chen, 'Kevin').
last_name(kevin_chen, 'Chen').
full_name(kevin_chen, 'Kevin Chen').
gender(kevin_chen, male).
alive(kevin_chen).
generation(kevin_chen, 1).
parent(david_chen, kevin_chen).
parent(maria_chen, kevin_chen).
location(kevin_chen, maplewood).

%% ===============================================================
%% Okafor Family (Nurse and Entrepreneur, Oak Ridge)
%% ===============================================================

%% Grace Okafor -- registered nurse at Maplewood General
person(grace_okafor).
first_name(grace_okafor, 'Grace').
last_name(grace_okafor, 'Okafor').
full_name(grace_okafor, 'Grace Okafor').
gender(grace_okafor, female).
alive(grace_okafor).
generation(grace_okafor, 0).
founder_family(grace_okafor).
child(grace_okafor, zara_okafor).
spouse(grace_okafor, daniel_okafor).
location(grace_okafor, maplewood).

%% Daniel Okafor -- small business owner, runs a catering company
person(daniel_okafor).
first_name(daniel_okafor, 'Daniel').
last_name(daniel_okafor, 'Okafor').
full_name(daniel_okafor, 'Daniel Okafor').
gender(daniel_okafor, male).
alive(daniel_okafor).
generation(daniel_okafor, 0).
founder_family(daniel_okafor).
child(daniel_okafor, zara_okafor).
spouse(daniel_okafor, grace_okafor).
location(daniel_okafor, maplewood).

%% Zara Okafor -- middle school student, soccer player
person(zara_okafor).
first_name(zara_okafor, 'Zara').
last_name(zara_okafor, 'Okafor').
full_name(zara_okafor, 'Zara Okafor').
gender(zara_okafor, female).
alive(zara_okafor).
generation(zara_okafor, 1).
parent(grace_okafor, zara_okafor).
parent(daniel_okafor, zara_okafor).
location(zara_okafor, maplewood).

%% ===============================================================
%% Russo Family (Retirees, Downtown Maplewood)
%% ===============================================================

%% Frank Russo -- retired postal worker, volunteers at community center
person(frank_russo).
first_name(frank_russo, 'Frank').
last_name(frank_russo, 'Russo').
full_name(frank_russo, 'Frank Russo').
gender(frank_russo, male).
alive(frank_russo).
generation(frank_russo, 0).
founder_family(frank_russo).
child(frank_russo, tony_russo).
spouse(frank_russo, helen_russo).
location(frank_russo, maplewood).

%% Helen Russo -- retired librarian, runs a book club
person(helen_russo).
first_name(helen_russo, 'Helen').
last_name(helen_russo, 'Russo').
full_name(helen_russo, 'Helen Russo').
gender(helen_russo, female).
alive(helen_russo).
generation(helen_russo, 0).
founder_family(helen_russo).
child(helen_russo, tony_russo).
spouse(helen_russo, frank_russo).
location(helen_russo, maplewood).

%% Tony Russo -- auto mechanic at Reliable Auto
person(tony_russo).
first_name(tony_russo, 'Tony').
last_name(tony_russo, 'Russo').
full_name(tony_russo, 'Tony Russo').
gender(tony_russo, male).
alive(tony_russo).
generation(tony_russo, 1).
parent(frank_russo, tony_russo).
parent(helen_russo, tony_russo).
location(tony_russo, maplewood).

%% ===============================================================
%% Park Family (Lakeside Heights professionals)
%% ===============================================================

%% James Park -- marketing director at a tech firm
person(james_park).
first_name(james_park, 'James').
last_name(james_park, 'Park').
full_name(james_park, 'James Park').
gender(james_park, male).
alive(james_park).
generation(james_park, 0).
founder_family(james_park).
child(james_park, lily_park).
spouse(james_park, sarah_park).
location(james_park, maplewood).

%% Sarah Park -- freelance graphic designer
person(sarah_park).
first_name(sarah_park, 'Sarah').
last_name(sarah_park, 'Park').
full_name(sarah_park, 'Sarah Park').
gender(sarah_park, female).
alive(sarah_park).
generation(sarah_park, 0).
founder_family(sarah_park).
child(sarah_park, lily_park).
spouse(sarah_park, james_park).
location(sarah_park, maplewood).

%% Lily Park -- elementary school student
person(lily_park).
first_name(lily_park, 'Lily').
last_name(lily_park, 'Lily Park').
full_name(lily_park, 'Lily Park').
gender(lily_park, female).
alive(lily_park).
generation(lily_park, 1).
parent(james_park, lily_park).
parent(sarah_park, lily_park).
location(lily_park, maplewood).

%% ===============================================================
%% Weaver Family (Pinehurst rural)
%% ===============================================================

%% Ruth Weaver -- retired farmer, runs the farm stand
person(ruth_weaver).
first_name(ruth_weaver, 'Ruth').
last_name(ruth_weaver, 'Weaver').
full_name(ruth_weaver, 'Ruth Weaver').
gender(ruth_weaver, female).
alive(ruth_weaver).
generation(ruth_weaver, 0).
founder_family(ruth_weaver).
child(ruth_weaver, sam_weaver).
location(ruth_weaver, pinehurst).

%% Sam Weaver -- organic farmer, supplies local restaurants
person(sam_weaver).
first_name(sam_weaver, 'Sam').
last_name(sam_weaver, 'Weaver').
full_name(sam_weaver, 'Sam Weaver').
gender(sam_weaver, male).
alive(sam_weaver).
generation(sam_weaver, 1).
parent(ruth_weaver, sam_weaver).
location(sam_weaver, pinehurst).

%% ===============================================================
%% Independent Characters
%% ===============================================================

%% Maya Torres -- artist and yoga instructor at Sunrise Yoga
person(maya_torres).
first_name(maya_torres, 'Maya').
last_name(maya_torres, 'Torres').
full_name(maya_torres, 'Maya Torres').
gender(maya_torres, female).
alive(maya_torres).
generation(maya_torres, 0).
location(maya_torres, maplewood).

%% Jordan Bell -- recent college grad, barista at Brewed Awakening
person(jordan_bell).
first_name(jordan_bell, 'Jordan').
last_name(jordan_bell, 'Bell').
full_name(jordan_bell, 'Jordan Bell').
gender(jordan_bell, male).
alive(jordan_bell).
generation(jordan_bell, 0).
location(jordan_bell, maplewood).
