%% Ensemble History: Kingdom of Camelot -- Initial World State
%% Source: data/worlds/kingdom_of_camelot/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- King Arthur ---
trait(king_arthur, male).
trait(king_arthur, noble).
trait(king_arthur, just).
trait(king_arthur, courageous).
trait(king_arthur, middle_aged).
attribute(king_arthur, charisma, 90).
attribute(king_arthur, combat_skill, 85).
attribute(king_arthur, wisdom, 80).
attribute(king_arthur, honor, 95).
status(king_arthur, ruler).

%% --- Queen Guinevere ---
trait(queen_guinevere, female).
trait(queen_guinevere, graceful).
trait(queen_guinevere, compassionate).
trait(queen_guinevere, diplomatic).
attribute(queen_guinevere, charisma, 90).
attribute(queen_guinevere, wisdom, 75).
attribute(queen_guinevere, propriety, 85).
attribute(queen_guinevere, honor, 80).
relationship(queen_guinevere, king_arthur, married).
status(queen_guinevere, ruler).

%% --- Lancelot du Lac ---
trait(knight_lancelot, male).
trait(knight_lancelot, valiant).
trait(knight_lancelot, passionate).
trait(knight_lancelot, conflicted).
attribute(knight_lancelot, combat_skill, 95).
attribute(knight_lancelot, charisma, 85).
attribute(knight_lancelot, honor, 75).
attribute(knight_lancelot, sensitiveness, 70).
relationship(knight_lancelot, king_arthur, sworn_to).
relationship(knight_lancelot, queen_guinevere, admires).
status(knight_lancelot, knight_of_round_table).

%% --- Merlin Emrys ---
trait(wizard_merlin, male).
trait(wizard_merlin, wise).
trait(wizard_merlin, enigmatic).
trait(wizard_merlin, ancient).
trait(wizard_merlin, elderly).
attribute(wizard_merlin, wisdom, 98).
attribute(wizard_merlin, magical_power, 95).
attribute(wizard_merlin, charisma, 70).
attribute(wizard_merlin, cunningness, 80).
relationship(wizard_merlin, king_arthur, mentor).
status(wizard_merlin, court_wizard).

%% --- Robin Hood ---
trait(outlaw_robin, male).
trait(outlaw_robin, rebellious).
trait(outlaw_robin, generous).
trait(outlaw_robin, cunning).
trait(outlaw_robin, young).
attribute(outlaw_robin, combat_skill, 75).
attribute(outlaw_robin, cunningness, 85).
attribute(outlaw_robin, charisma, 80).
attribute(outlaw_robin, honor, 65).
relationship(outlaw_robin, king_arthur, adversary).
status(outlaw_robin, outlaw).

%% --- Inter-character Relationships ---
relationship(king_arthur, knight_lancelot, trusts).
relationship(king_arthur, wizard_merlin, trusts).
relationship(king_arthur, queen_guinevere, married).
relationship(wizard_merlin, knight_lancelot, wary_of).
relationship(outlaw_robin, knight_lancelot, rivals).

%% --- Network Values (Ensemble-style) ---
network(king_arthur, knight_lancelot, friendship, 8).
network(king_arthur, queen_guinevere, romance, 9).
network(king_arthur, wizard_merlin, trust, 9).
network(king_arthur, outlaw_robin, trust, 2).
network(knight_lancelot, queen_guinevere, romance, 6).
network(knight_lancelot, wizard_merlin, trust, 5).
network(wizard_merlin, queen_guinevere, trust, 7).
network(outlaw_robin, king_arthur, antagonism, 4).
network(outlaw_robin, knight_lancelot, antagonism, 3).
