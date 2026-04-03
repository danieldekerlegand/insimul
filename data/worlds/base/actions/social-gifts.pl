%% Ensemble Actions: social-gifts
%% Source: data/ensemble/actions/social-gifts.json
%% Converted: 2026-04-01T20:15:17.347Z
%% Total actions: 13

%% give_a_gift
% Action: GIVE A GIFT
% Source: Ensemble / social-gifts

action(give_a_gift, 'GIVE A GIFT', social, 1).
action_difficulty(give_a_gift, 0.5).
action_duration(give_a_gift, 1).
action_category(give_a_gift, social_gifts).
action_source(give_a_gift, ensemble).
action_verb(give_a_gift, past, 'give a gift').
action_verb(give_a_gift, present, 'give a gift').
action_target_type(give_a_gift, self).
action_leads_to(give_a_gift, encourages_friend_s_friend_with_a_pick_me_up_a).
action_leads_to(give_a_gift, giftgift_successfully_default).
action_leads_to(give_a_gift, givegift_unsuccessfully_default).
can_perform(Actor, give_a_gift) :- true.

%% forgive
% Action: FORGIVE
% Source: Ensemble / social-gifts

action(forgive, 'FORGIVE', social, 1).
action_difficulty(forgive, 0.5).
action_duration(forgive, 1).
action_category(forgive, social_gifts).
action_source(forgive, ensemble).
action_verb(forgive, past, 'forgive').
action_verb(forgive, present, 'forgive').
action_target_type(forgive, self).
action_leads_to(forgive, excuse_and_forgive_someone_for_perceived_wrong).
action_leads_to(forgive, forgive_successfully).
action_leads_to(forgive, forgive_unsuccessfully).
can_perform(Actor, forgive) :- true.

%% a_man_gives_a_hand_to_a_woman_a
% Action: a man gives a hand to a woman (a)
% Source: Ensemble / social-gifts

action(a_man_gives_a_hand_to_a_woman_a, 'a man gives a hand to a woman (a)', social, 1).
action_difficulty(a_man_gives_a_hand_to_a_woman_a, 0.5).
action_duration(a_man_gives_a_hand_to_a_woman_a, 1).
action_category(a_man_gives_a_hand_to_a_woman_a, social_gifts).
action_source(a_man_gives_a_hand_to_a_woman_a, ensemble).
action_verb(a_man_gives_a_hand_to_a_woman_a, past, 'a man gives a hand to a woman (a)').
action_verb(a_man_gives_a_hand_to_a_woman_a, present, 'a man gives a hand to a woman (a)').
action_target_type(a_man_gives_a_hand_to_a_woman_a, other).
action_requires_target(a_man_gives_a_hand_to_a_woman_a).
action_range(a_man_gives_a_hand_to_a_woman_a, 5).
action_is_accept(a_man_gives_a_hand_to_a_woman_a).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (attribute(Actor, charisma, V), V > 60)).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Actor, innocent looking))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Target, female))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Target, virtuous))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Actor, provincial))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Actor, male))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (status(Target, tired))).
action_effect(a_man_gives_a_hand_to_a_woman_a, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(a_man_gives_a_hand_to_a_woman_a, (assert(relationship(Target, Actor, esteem)))).
action_effect(a_man_gives_a_hand_to_a_woman_a, (modify_network(Actor, Target, curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, a_man_gives_a_hand_to_a_woman_a, Target) :-
    attribute(Actor, charisma, V), V > 60,
    trait(Actor, innocent looking),
    trait(Target, female),
    trait(Target, virtuous),
    trait(Actor, provincial),
    trait(Actor, male),
    status(Target, tired).

%% giftgift_successfully_default
% Action: giftgift successfully-default
% Source: Ensemble / social-gifts

action(giftgift_successfully_default, 'giftgift successfully-default', social, 1).
action_difficulty(giftgift_successfully_default, 0.5).
action_duration(giftgift_successfully_default, 1).
action_category(giftgift_successfully_default, social_gifts).
action_source(giftgift_successfully_default, ensemble).
action_parent(giftgift_successfully_default, give_a_gift).
action_verb(giftgift_successfully_default, past, 'giftgift successfully-default').
action_verb(giftgift_successfully_default, present, 'giftgift successfully-default').
action_target_type(giftgift_successfully_default, other).
action_requires_target(giftgift_successfully_default).
action_range(giftgift_successfully_default, 5).
action_is_accept(giftgift_successfully_default).
action_effect(giftgift_successfully_default, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, giftgift_successfully_default, Target) :- true.

%% givegift_unsuccessfully_default
% Action: givegift unsuccessfully-default
% Source: Ensemble / social-gifts

action(givegift_unsuccessfully_default, 'givegift unsuccessfully-default', social, 1).
action_difficulty(givegift_unsuccessfully_default, 0.5).
action_duration(givegift_unsuccessfully_default, 1).
action_category(givegift_unsuccessfully_default, social_gifts).
action_source(givegift_unsuccessfully_default, ensemble).
action_parent(givegift_unsuccessfully_default, give_a_gift).
action_verb(givegift_unsuccessfully_default, past, 'givegift unsuccessfully-default').
action_verb(givegift_unsuccessfully_default, present, 'givegift unsuccessfully-default').
action_target_type(givegift_unsuccessfully_default, other).
action_requires_target(givegift_unsuccessfully_default).
action_range(givegift_unsuccessfully_default, 5).
action_effect(givegift_unsuccessfully_default, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, givegift_unsuccessfully_default, Target) :- true.

%% gift_given_meant_to_impress_but_does_not_impress_receiver
% Action: gift given meant to impress but does not impress receiver
% Source: Ensemble / social-gifts

action(gift_given_meant_to_impress_but_does_not_impress_receiver, 'gift given meant to impress but does not impress receiver', social, 1).
action_difficulty(gift_given_meant_to_impress_but_does_not_impress_receiver, 0.5).
action_duration(gift_given_meant_to_impress_but_does_not_impress_receiver, 1).
action_category(gift_given_meant_to_impress_but_does_not_impress_receiver, social_gifts).
action_source(gift_given_meant_to_impress_but_does_not_impress_receiver, ensemble).
action_verb(gift_given_meant_to_impress_but_does_not_impress_receiver, past, 'gift given meant to impress but does not impress receiver').
action_verb(gift_given_meant_to_impress_but_does_not_impress_receiver, present, 'gift given meant to impress but does not impress receiver').
action_target_type(gift_given_meant_to_impress_but_does_not_impress_receiver, other).
action_requires_target(gift_given_meant_to_impress_but_does_not_impress_receiver).
action_range(gift_given_meant_to_impress_but_does_not_impress_receiver, 5).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (network(Actor, Target, affinity, V), V > 50)).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (trait(Target, modest))).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (attribute(Actor, self-assuredness, V), V > 50)).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (trait(Actor, rich))).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (trait(Actor, vain))).
action_effect(gift_given_meant_to_impress_but_does_not_impress_receiver, (modify_network(Target, Actor, curiosity, +, 5))).
action_effect(gift_given_meant_to_impress_but_does_not_impress_receiver, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(gift_given_meant_to_impress_but_does_not_impress_receiver, (retract(status(Actor, happy)))).
action_effect(gift_given_meant_to_impress_but_does_not_impress_receiver, (assert(status(Target, grateful)))).
% Can Actor perform this action?
can_perform(Actor, gift_given_meant_to_impress_but_does_not_impress_receiver, Target) :-
    network(Actor, Target, affinity, V), V > 50,
    trait(Target, modest),
    attribute(Actor, self-assuredness, V), V > 50,
    trait(Actor, rich),
    trait(Actor, vain).

%% draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift
% Action: draw attention away from self by using third person ally to give a gift
% Source: Ensemble / social-gifts

action(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, 'draw attention away from self by using third person ally to give a gift', social, 1).
action_difficulty(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, 0.5).
action_duration(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, 1).
action_category(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, social_gifts).
action_source(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, ensemble).
action_verb(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, past, 'draw attention away from self by using third person ally to give a gift').
action_verb(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, present, 'draw attention away from self by using third person ally to give a gift').
action_target_type(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, other).
action_requires_target(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift).
action_range(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, 5).
action_is_accept(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (network(Actor, Target, affinity, V), V > 60)).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (attribute(Actor, propriety, V), V > 60)).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (trait(Actor, rich))).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (\+ trait(Target, rich))).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (relationship('third', Actor, ally))).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (\+ trait(Actor, indiscreet))).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (trait(Actor, generous))).
action_effect(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (modify_network(Target, Actor, curiosity, -, 10))).
action_effect(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (modify_network(Target, 'third', affinity, +, 10))).
action_effect(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (modify_network(Target, 'third', curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, Target) :-
    network(Actor, Target, affinity, V), V > 60,
    attribute(Actor, propriety, V), V > 60,
    trait(Actor, rich),
    \+ trait(Target, rich),
    relationship('third', Actor, ally),
    \+ trait(Actor, indiscreet),
    trait(Actor, generous).

%% excuse_and_forgive_someone_for_perceived_wrong
% Action: excuse and forgive someone for perceived wrong
% Source: Ensemble / social-gifts

action(excuse_and_forgive_someone_for_perceived_wrong, 'excuse and forgive someone for perceived wrong', social, 1).
action_difficulty(excuse_and_forgive_someone_for_perceived_wrong, 0.5).
action_duration(excuse_and_forgive_someone_for_perceived_wrong, 1).
action_category(excuse_and_forgive_someone_for_perceived_wrong, social_gifts).
action_source(excuse_and_forgive_someone_for_perceived_wrong, ensemble).
action_parent(excuse_and_forgive_someone_for_perceived_wrong, forgive).
action_verb(excuse_and_forgive_someone_for_perceived_wrong, past, 'excuse and forgive someone for perceived wrong').
action_verb(excuse_and_forgive_someone_for_perceived_wrong, present, 'excuse and forgive someone for perceived wrong').
action_target_type(excuse_and_forgive_someone_for_perceived_wrong, other).
action_requires_target(excuse_and_forgive_someone_for_perceived_wrong).
action_range(excuse_and_forgive_someone_for_perceived_wrong, 5).
action_is_accept(excuse_and_forgive_someone_for_perceived_wrong).
action_prerequisite(excuse_and_forgive_someone_for_perceived_wrong, (ensemble_condition(Actor, resentful of, true))).
action_prerequisite(excuse_and_forgive_someone_for_perceived_wrong, (trait(Target, virtuous))).
action_prerequisite(excuse_and_forgive_someone_for_perceived_wrong, (network(Actor, Target, affinity, V), V < 50)).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (modify_network(Actor, Target, affinity, +, 10))).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (ensemble_effect(Actor, resentful of, false))).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (assert(status(Actor, happy)))).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (assert(status(Target, grateful)))).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (retract(relationship(Actor, Target, rivals)))).
% Can Actor perform this action?
can_perform(Actor, excuse_and_forgive_someone_for_perceived_wrong, Target) :-
    ensemble_condition(Actor, resentful of, true),
    trait(Target, virtuous),
    network(Actor, Target, affinity, V), V < 50.

%% forgive_successfully
% Action: forgive successfully
% Source: Ensemble / social-gifts

action(forgive_successfully, 'forgive successfully', social, 1).
action_difficulty(forgive_successfully, 0.5).
action_duration(forgive_successfully, 1).
action_category(forgive_successfully, social_gifts).
action_source(forgive_successfully, ensemble).
action_parent(forgive_successfully, forgive).
action_verb(forgive_successfully, past, 'forgive successfully').
action_verb(forgive_successfully, present, 'forgive successfully').
action_target_type(forgive_successfully, other).
action_requires_target(forgive_successfully).
action_range(forgive_successfully, 5).
action_is_accept(forgive_successfully).
action_effect(forgive_successfully, (retract(relationship(Actor, Target, rivals)))).
can_perform(Actor, forgive_successfully, Target) :- true.

%% forgive_unsuccessfully
% Action: forgive unsuccessfully
% Source: Ensemble / social-gifts

action(forgive_unsuccessfully, 'forgive unsuccessfully', social, 1).
action_difficulty(forgive_unsuccessfully, 0.5).
action_duration(forgive_unsuccessfully, 1).
action_category(forgive_unsuccessfully, social_gifts).
action_source(forgive_unsuccessfully, ensemble).
action_parent(forgive_unsuccessfully, forgive).
action_verb(forgive_unsuccessfully, past, 'forgive unsuccessfully').
action_verb(forgive_unsuccessfully, present, 'forgive unsuccessfully').
action_target_type(forgive_unsuccessfully, other).
action_requires_target(forgive_unsuccessfully).
action_range(forgive_unsuccessfully, 5).
action_effect(forgive_unsuccessfully, (assert(relationship(Actor, Target, rivals)))).
can_perform(Actor, forgive_unsuccessfully, Target) :- true.

%% give_the_info
% Action: Give the info
% Source: Ensemble / social-gifts

action(give_the_info, 'Give the info', social, 1).
action_difficulty(give_the_info, 0.5).
action_duration(give_the_info, 1).
action_category(give_the_info, social_gifts).
action_source(give_the_info, ensemble).
action_verb(give_the_info, past, 'give the info').
action_verb(give_the_info, present, 'give the info').
action_target_type(give_the_info, other).
action_requires_target(give_the_info).
action_range(give_the_info, 5).
action_effect(give_the_info, (modify_network(Actor, Target, trust, +, 1))).
action_effect(give_the_info, (modify_network(Target, Actor, trust, +, 1))).
action_effect(give_the_info, (ensemble_effect(Actor, positive, true))).
can_perform(Actor, give_the_info, Target) :- true.

%% reluctantly_give_info
% Action: Reluctantly give info
% Source: Ensemble / social-gifts

action(reluctantly_give_info, 'Reluctantly give info', social, 1).
action_difficulty(reluctantly_give_info, 0.5).
action_duration(reluctantly_give_info, 1).
action_category(reluctantly_give_info, social_gifts).
action_source(reluctantly_give_info, ensemble).
action_verb(reluctantly_give_info, past, 'reluctantly give info').
action_verb(reluctantly_give_info, present, 'reluctantly give info').
action_target_type(reluctantly_give_info, self).
can_perform(Actor, reluctantly_give_info) :- true.

%% give_for_free
% Action: Give for free
% Source: Ensemble / social-gifts

action(give_for_free, 'Give for free', social, 1).
action_difficulty(give_for_free, 0.5).
action_duration(give_for_free, 1).
action_category(give_for_free, social_gifts).
action_source(give_for_free, ensemble).
action_verb(give_for_free, past, 'give for free').
action_verb(give_for_free, present, 'give for free').
action_target_type(give_for_free, self).
can_perform(Actor, give_for_free) :- true.

