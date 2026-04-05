%% Insimul Rules: Kingdom of Camelot
%% Source: data/worlds/kingdom_of_camelot/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema follows additional-ensemble.pl format

%% --- Chivalry Rules ---

rule_likelihood(knights_with_high_honor_defend_the_weak_and_gain_trust, 1).
rule_type(knights_with_high_honor_defend_the_weak_and_gain_trust, volition).
%% Knights with high honor instinctively defend those weaker than themselves
rule_active(knights_with_high_honor_defend_the_weak_and_gain_trust).
rule_category(knights_with_high_honor_defend_the_weak_and_gain_trust, chivalry).
rule_source(knights_with_high_honor_defend_the_weak_and_gain_trust, camelot).
rule_priority(knights_with_high_honor_defend_the_weak_and_gain_trust, 8).
rule_applies(knights_with_high_honor_defend_the_weak_and_gain_trust, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val > 7,
    status(Y, commoner).
rule_effect(knights_with_high_honor_defend_the_weak_and_gain_trust, set_intent(X, protect, Y, 5)).

rule_likelihood(breaking_an_oath_causes_severe_loss_of_reputation_among_peers, 1).
rule_type(breaking_an_oath_causes_severe_loss_of_reputation_among_peers, volition).
%% Breaking a sworn oath causes severe loss of trust and reputation among other knights
rule_active(breaking_an_oath_causes_severe_loss_of_reputation_among_peers).
rule_category(breaking_an_oath_causes_severe_loss_of_reputation_among_peers, chivalry).
rule_source(breaking_an_oath_causes_severe_loss_of_reputation_among_peers, camelot).
rule_priority(breaking_an_oath_causes_severe_loss_of_reputation_among_peers, 9).
rule_applies(breaking_an_oath_causes_severe_loss_of_reputation_among_peers, X, _) :-
    status(X, oathbreaker).
rule_effect(breaking_an_oath_causes_severe_loss_of_reputation_among_peers, set_intent(X, lose_reputation, _, -8)).

%% --- Courtly Love Rules ---

rule_likelihood(knights_perform_valorous_deeds_to_win_the_favor_of_a_noble_lady, 1).
rule_type(knights_perform_valorous_deeds_to_win_the_favor_of_a_noble_lady, volition).
%% Knights are driven to perform valorous deeds in the name of a noble lady they admire
rule_active(knights_perform_valorous_deeds_to_win_the_favor_of_a_noble_lady).
rule_category(knights_perform_valorous_deeds_to_win_the_favor_of_a_noble_lady, courtly_love).
rule_source(knights_perform_valorous_deeds_to_win_the_favor_of_a_noble_lady, camelot).
rule_priority(knights_perform_valorous_deeds_to_win_the_favor_of_a_noble_lady, 6).
rule_applies(knights_perform_valorous_deeds_to_win_the_favor_of_a_noble_lady, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 4,
    trait(Y, female).
rule_effect(knights_perform_valorous_deeds_to_win_the_favor_of_a_noble_lady, set_intent(X, perform_deed_for, Y, 5)).

rule_likelihood(unrequited_courtly_devotion_strengthens_a_knights_resolve, 1).
rule_type(unrequited_courtly_devotion_strengthens_a_knights_resolve, volition).
%% Unrequited devotion to a lady spurs a knight to seek greater glory
rule_active(unrequited_courtly_devotion_strengthens_a_knights_resolve).
rule_category(unrequited_courtly_devotion_strengthens_a_knights_resolve, courtly_love).
rule_source(unrequited_courtly_devotion_strengthens_a_knights_resolve, camelot).
rule_priority(unrequited_courtly_devotion_strengthens_a_knights_resolve, 4).
rule_applies(unrequited_courtly_devotion_strengthens_a_knights_resolve, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 5,
    network(Y, X, romance, Return_val), Return_val < 3.
rule_effect(unrequited_courtly_devotion_strengthens_a_knights_resolve, set_intent(X, seek_glory, _, 4)).

%% --- Feudal Authority Rules ---

rule_likelihood(vassals_obey_their_liege_lord_or_face_consequences, 1).
rule_type(vassals_obey_their_liege_lord_or_face_consequences, volition).
%% Vassals are expected to obey their liege lord without question in matters of war and justice
rule_active(vassals_obey_their_liege_lord_or_face_consequences).
rule_category(vassals_obey_their_liege_lord_or_face_consequences, feudal_authority).
rule_source(vassals_obey_their_liege_lord_or_face_consequences, camelot).
rule_priority(vassals_obey_their_liege_lord_or_face_consequences, 7).
rule_applies(vassals_obey_their_liege_lord_or_face_consequences, X, Y) :-
    relationship(X, Y, sworn_to).
rule_effect(vassals_obey_their_liege_lord_or_face_consequences, set_intent(X, obey, Y, 6)).

rule_likelihood(the_king_commands_loyalty_from_all_knights_of_the_round_table, 1).
rule_type(the_king_commands_loyalty_from_all_knights_of_the_round_table, volition).
%% The king commands unquestioning loyalty from all seated at the Round Table
rule_active(the_king_commands_loyalty_from_all_knights_of_the_round_table).
rule_category(the_king_commands_loyalty_from_all_knights_of_the_round_table, feudal_authority).
rule_source(the_king_commands_loyalty_from_all_knights_of_the_round_table, camelot).
rule_priority(the_king_commands_loyalty_from_all_knights_of_the_round_table, 9).
rule_applies(the_king_commands_loyalty_from_all_knights_of_the_round_table, X, Y) :-
    status(X, knight_of_round_table),
    status(Y, ruler).
rule_effect(the_king_commands_loyalty_from_all_knights_of_the_round_table, set_intent(X, serve, Y, 7)).

%% --- Magic and Mystery Rules ---

rule_likelihood(those_who_seek_magical_knowledge_risk_corruption, 1).
rule_type(those_who_seek_magical_knowledge_risk_corruption, volition).
%% Those who delve into arcane arts without guidance risk magical corruption
rule_active(those_who_seek_magical_knowledge_risk_corruption).
rule_category(those_who_seek_magical_knowledge_risk_corruption, magic).
rule_source(those_who_seek_magical_knowledge_risk_corruption, camelot).
rule_priority(those_who_seek_magical_knowledge_risk_corruption, 5).
rule_applies(those_who_seek_magical_knowledge_risk_corruption, X, _) :-
    attribute(X, magical_power, Magic_val), Magic_val > 3,
    attribute(X, wisdom, Wisdom_val), Wisdom_val < 5.
rule_effect(those_who_seek_magical_knowledge_risk_corruption, set_intent(X, become_corrupted, _, 3)).

rule_likelihood(merlin_intervenes_when_dark_magic_threatens_camelot, 1).
rule_type(merlin_intervenes_when_dark_magic_threatens_camelot, volition).
%% Merlin steps in to counter any dark magical threat to the kingdom
rule_active(merlin_intervenes_when_dark_magic_threatens_camelot).
rule_category(merlin_intervenes_when_dark_magic_threatens_camelot, magic).
rule_source(merlin_intervenes_when_dark_magic_threatens_camelot, camelot).
rule_priority(merlin_intervenes_when_dark_magic_threatens_camelot, 8).
rule_applies(merlin_intervenes_when_dark_magic_threatens_camelot, wizard_merlin, Y) :-
    status(Y, dark_magic_user).
rule_effect(merlin_intervenes_when_dark_magic_threatens_camelot, set_intent(wizard_merlin, counter_magic, Y, 8)).

%% --- Honor and Combat Rules ---

rule_likelihood(victorious_knights_gain_honor_and_the_respect_of_their_peers, 1).
rule_type(victorious_knights_gain_honor_and_the_respect_of_their_peers, volition).
%% Winning a tournament or combat duel increases a knight standing among peers
rule_active(victorious_knights_gain_honor_and_the_respect_of_their_peers).
rule_category(victorious_knights_gain_honor_and_the_respect_of_their_peers, combat).
rule_source(victorious_knights_gain_honor_and_the_respect_of_their_peers, camelot).
rule_priority(victorious_knights_gain_honor_and_the_respect_of_their_peers, 6).
rule_applies(victorious_knights_gain_honor_and_the_respect_of_their_peers, X, _) :-
    status(X, tournament_champion).
rule_effect(victorious_knights_gain_honor_and_the_respect_of_their_peers, set_intent(X, gain_reputation, _, 5)).

rule_likelihood(cowardice_in_battle_brings_shame_and_loss_of_standing, 1).
rule_type(cowardice_in_battle_brings_shame_and_loss_of_standing, volition).
%% Fleeing from combat brings shame upon a knight and erodes trust
rule_active(cowardice_in_battle_brings_shame_and_loss_of_standing).
rule_category(cowardice_in_battle_brings_shame_and_loss_of_standing, combat).
rule_source(cowardice_in_battle_brings_shame_and_loss_of_standing, camelot).
rule_priority(cowardice_in_battle_brings_shame_and_loss_of_standing, 7).
rule_applies(cowardice_in_battle_brings_shame_and_loss_of_standing, X, _) :-
    status(X, fled_battle).
rule_effect(cowardice_in_battle_brings_shame_and_loss_of_standing, set_intent(X, lose_reputation, _, -6)).

%% --- Outlaw Rules ---

rule_likelihood(outlaws_target_wealthy_travelers_to_redistribute_wealth, 1).
rule_type(outlaws_target_wealthy_travelers_to_redistribute_wealth, volition).
%% Outlaws of Sherwood target wealthy nobles and merchants to redistribute their gold
rule_active(outlaws_target_wealthy_travelers_to_redistribute_wealth).
rule_category(outlaws_target_wealthy_travelers_to_redistribute_wealth, outlaw).
rule_source(outlaws_target_wealthy_travelers_to_redistribute_wealth, camelot).
rule_priority(outlaws_target_wealthy_travelers_to_redistribute_wealth, 5).
rule_applies(outlaws_target_wealthy_travelers_to_redistribute_wealth, X, Y) :-
    status(X, outlaw),
    trait(Y, wealthy).
rule_effect(outlaws_target_wealthy_travelers_to_redistribute_wealth, set_intent(X, rob, Y, 4)).

rule_likelihood(common_folk_shelter_outlaws_they_see_as_champions_of_the_poor, 1).
rule_type(common_folk_shelter_outlaws_they_see_as_champions_of_the_poor, volition).
%% Common folk protect outlaws who share stolen wealth with the poor
rule_active(common_folk_shelter_outlaws_they_see_as_champions_of_the_poor).
rule_category(common_folk_shelter_outlaws_they_see_as_champions_of_the_poor, outlaw).
rule_source(common_folk_shelter_outlaws_they_see_as_champions_of_the_poor, camelot).
rule_priority(common_folk_shelter_outlaws_they_see_as_champions_of_the_poor, 4).
rule_applies(common_folk_shelter_outlaws_they_see_as_champions_of_the_poor, X, Y) :-
    status(X, commoner),
    status(Y, outlaw),
    trait(Y, generous).
rule_effect(common_folk_shelter_outlaws_they_see_as_champions_of_the_poor, set_intent(X, shelter, Y, 3)).
