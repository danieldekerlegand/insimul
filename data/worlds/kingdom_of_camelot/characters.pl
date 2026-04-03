%% Insimul Characters: Kingdom of Camelot
%% Source: data/insimul/medieval/medieval.insimul
%% Converted: 2026-04-02T22:06:25.799Z

%% Arthur Pendragon
person(king_arthur).
first_name(king_arthur, 'Arthur').
last_name(king_arthur, 'Pendragon').
full_name(king_arthur, 'Arthur Pendragon').
gender(king_arthur, male).
birth_year(king_arthur, 1170).
alive(king_arthur).
occupation(king_arthur, king).
at_location(king_arthur, camelot_castle).

%% Guinevere Pendragon
person(queen_guinevere).
first_name(queen_guinevere, 'Guinevere').
last_name(queen_guinevere, 'Pendragon').
full_name(queen_guinevere, 'Guinevere Pendragon').
gender(queen_guinevere, female).
birth_year(queen_guinevere, 1175).
alive(queen_guinevere).
occupation(queen_guinevere, queen).
at_location(queen_guinevere, camelot_castle).
married_to(queen_guinevere, king_arthur).

%% Lancelot du Lac
person(knight_lancelot).
first_name(knight_lancelot, 'Lancelot').
last_name(knight_lancelot, 'du Lac').
full_name(knight_lancelot, 'Lancelot du Lac').
gender(knight_lancelot, male).
birth_year(knight_lancelot, 1175).
alive(knight_lancelot).
occupation(knight_lancelot, knight).
at_location(knight_lancelot, camelot_castle).

%% Merlin Emrys
person(wizard_merlin).
first_name(wizard_merlin, 'Merlin').
last_name(wizard_merlin, 'Emrys').
full_name(wizard_merlin, 'Merlin Emrys').
gender(wizard_merlin, male).
birth_year(wizard_merlin, 1150).
alive(wizard_merlin).
occupation(wizard_merlin, wizard).
at_location(wizard_merlin, camelot_castle).

%% Robin Hood
person(outlaw_robin).
first_name(outlaw_robin, 'Robin').
last_name(outlaw_robin, 'Hood').
full_name(outlaw_robin, 'Robin Hood').
gender(outlaw_robin, male).
birth_year(outlaw_robin, 1180).
alive(outlaw_robin).
occupation(outlaw_robin, outlaw).
at_location(outlaw_robin, village_sherwood).

%% ═══ Relationships ═══
relationship(king_arthur, knight_lancelot, friends).
relationship(knight_lancelot, king_arthur, friends).
relationship(king_arthur, wizard_merlin, friends).
relationship(wizard_merlin, king_arthur, friends).

