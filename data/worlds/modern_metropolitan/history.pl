%% Ensemble History: Modern Metropolitan -- Initial World State
%% Source: data/worlds/modern_metropolitan/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Mayor Sarah Johnson ---
trait(mayor_johnson, female).
trait(mayor_johnson, ambitious).
trait(mayor_johnson, pragmatic).
trait(mayor_johnson, diplomatic).
trait(mayor_johnson, middle_aged).
attribute(mayor_johnson, charisma, 85).
attribute(mayor_johnson, political_skill, 90).
attribute(mayor_johnson, wisdom, 75).
attribute(mayor_johnson, propriety, 80).
status(mayor_johnson, elected_official).

%% --- David Chen (Tech CEO) ---
trait(tech_ceo, male).
trait(tech_ceo, innovative).
trait(tech_ceo, driven).
trait(tech_ceo, calculating).
attribute(tech_ceo, charisma, 80).
attribute(tech_ceo, business_acumen, 92).
attribute(tech_ceo, cunningness, 70).
attribute(tech_ceo, self_assuredness, 85).
relationship(tech_ceo, mayor_johnson, donor).
status(tech_ceo, business_leader).

%% --- Dr. Priya Patel ---
trait(doctor_patel, female).
trait(doctor_patel, compassionate).
trait(doctor_patel, dedicated).
trait(doctor_patel, overworked).
attribute(doctor_patel, wisdom, 80).
attribute(doctor_patel, charisma, 70).
attribute(doctor_patel, propriety, 85).
attribute(doctor_patel, sensitiveness, 75).
relationship(doctor_patel, teacher_smith, friends).
status(doctor_patel, professional).

%% --- Michael Smith (Teacher) ---
trait(teacher_smith, male).
trait(teacher_smith, idealistic).
trait(teacher_smith, community_minded).
trait(teacher_smith, patient).
attribute(teacher_smith, charisma, 65).
attribute(teacher_smith, wisdom, 70).
attribute(teacher_smith, propriety, 75).
attribute(teacher_smith, sensitiveness, 70).
relationship(teacher_smith, doctor_patel, friends).
relationship(teacher_smith, artist_rodriguez, neighbors).
status(teacher_smith, professional).

%% --- Maria Rodriguez (Artist) ---
trait(artist_rodriguez, female).
trait(artist_rodriguez, creative).
trait(artist_rodriguez, passionate).
trait(artist_rodriguez, independent).
trait(artist_rodriguez, young).
attribute(artist_rodriguez, charisma, 80).
attribute(artist_rodriguez, self_assuredness, 65).
attribute(artist_rodriguez, sensitiveness, 80).
attribute(artist_rodriguez, cunningness, 40).
relationship(artist_rodriguez, teacher_smith, neighbors).
status(artist_rodriguez, freelancer).

%% --- Inter-character Relationships ---
relationship(mayor_johnson, tech_ceo, political_ally).
relationship(tech_ceo, mayor_johnson, political_ally).
relationship(doctor_patel, artist_rodriguez, acquaintances).
relationship(artist_rodriguez, doctor_patel, acquaintances).

%% --- Network Values (Ensemble-style) ---
network(mayor_johnson, tech_ceo, trust, 6).
network(tech_ceo, mayor_johnson, trust, 5).
network(doctor_patel, teacher_smith, friendship, 8).
network(teacher_smith, doctor_patel, friendship, 8).
network(teacher_smith, artist_rodriguez, friendship, 5).
network(artist_rodriguez, teacher_smith, friendship, 5).
network(mayor_johnson, doctor_patel, trust, 6).
network(tech_ceo, artist_rodriguez, trust, 3).
network(artist_rodriguez, tech_ceo, antagonism, 4).
