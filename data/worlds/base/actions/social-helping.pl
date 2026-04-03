%% Ensemble Actions: social-helping
%% Source: data/ensemble/actions/social-helping.json
%% Converted: 2026-04-01T20:15:17.347Z
%% Total actions: 17

%% help
% Action: HELP
% Source: Ensemble / social-helping

action(help, 'HELP', social, 1).
action_difficulty(help, 0.5).
action_duration(help, 1).
action_category(help, social_helping).
action_source(help, ensemble).
action_verb(help, past, 'help').
action_verb(help, present, 'help').
action_target_type(help, self).
action_leads_to(help, greet_correction).
action_leads_to(help, give_the_info).
can_perform(Actor, help) :- true.

%% favor
% Action: FAVOR
% Source: Ensemble / social-helping

action(favor, 'FAVOR', social, 1).
action_difficulty(favor, 0.5).
action_duration(favor, 1).
action_category(favor, social_helping).
action_source(favor, ensemble).
action_verb(favor, past, 'favor').
action_verb(favor, present, 'favor').
action_target_type(favor, self).
action_leads_to(favor, give_for_free).
can_perform(Actor, favor) :- true.

%% help
% Action: HELP
% Source: Ensemble / social-helping

action(help, 'HELP', social, 1).
action_difficulty(help, 0.5).
action_duration(help, 1).
action_category(help, social_helping).
action_source(help, ensemble).
action_verb(help, past, 'help').
action_verb(help, present, 'help').
action_target_type(help, self).
action_leads_to(help, steal_something_for_a_friend_a).
action_leads_to(help, steal_something_for_a_friend_r).
action_leads_to(help, pay_poor_person_s_expenses).
action_leads_to(help, man_helps_woman_out_of_biens_ance_a).
action_leads_to(help, keep_a_secret_for_someone).
action_leads_to(help, experienced_person_gives_good_advice).
action_leads_to(help, discreet_thanks_for_help_from_a_social_superior).
action_leads_to(help, a_man_gives_a_hand_to_a_woman_a).
action_leads_to(help, bonne_physionomie_man_grateful_to_benefactor).
action_leads_to(help, a_rich_person_helps_a_inebriated_man).
action_leads_to(help, helpsomeone_successfully_default).
action_leads_to(help, helpsomeone_unsuccessfully_default).
can_perform(Actor, help) :- true.

%% ask_for_a_favor
% Action: ASK FOR A FAVOR
% Source: Ensemble / social-helping

action(ask_for_a_favor, 'ASK FOR A FAVOR', social, 1).
action_difficulty(ask_for_a_favor, 0.5).
action_duration(ask_for_a_favor, 1).
action_category(ask_for_a_favor, social_helping).
action_source(ask_for_a_favor, ensemble).
action_verb(ask_for_a_favor, past, 'ask for a favor').
action_verb(ask_for_a_favor, present, 'ask for a favor').
action_target_type(ask_for_a_favor, self).
action_leads_to(ask_for_a_favor, devout_refuses_to_help_poor_desperate_virtuous).
action_leads_to(ask_for_a_favor, a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a).
action_leads_to(ask_for_a_favor, askforfavor_successfully).
action_leads_to(ask_for_a_favor, askforfavor_unsuccessfully).
can_perform(Actor, ask_for_a_favor) :- true.

%% pay_poor_person_s_expenses
% Action: pay poor person’s expenses
% Source: Ensemble / social-helping

action(pay_poor_person_s_expenses, 'pay poor person''s expenses', social, 1).
action_difficulty(pay_poor_person_s_expenses, 0.5).
action_duration(pay_poor_person_s_expenses, 1).
action_category(pay_poor_person_s_expenses, social_helping).
action_source(pay_poor_person_s_expenses, ensemble).
action_parent(pay_poor_person_s_expenses, help).
action_verb(pay_poor_person_s_expenses, past, 'pay poor person''s expenses').
action_verb(pay_poor_person_s_expenses, present, 'pay poor person''s expenses').
action_target_type(pay_poor_person_s_expenses, other).
action_requires_target(pay_poor_person_s_expenses).
action_range(pay_poor_person_s_expenses, 5).
action_is_accept(pay_poor_person_s_expenses).
action_prerequisite(pay_poor_person_s_expenses, (trait(Actor, generous))).
action_prerequisite(pay_poor_person_s_expenses, (trait(Target, poor))).
action_effect(pay_poor_person_s_expenses, (modify_network(Target, Actor, affinity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, pay_poor_person_s_expenses, Target) :-
    trait(Actor, generous),
    trait(Target, poor).

%% man_helps_woman_out_of_biens_ance_a
% Action: man helps woman out of “”bienséance“” (a)
% Source: Ensemble / social-helping

action(man_helps_woman_out_of_biens_ance_a, 'man helps woman out of "bienséance" (a)', social, 1).
action_difficulty(man_helps_woman_out_of_biens_ance_a, 0.5).
action_duration(man_helps_woman_out_of_biens_ance_a, 1).
action_category(man_helps_woman_out_of_biens_ance_a, social_helping).
action_source(man_helps_woman_out_of_biens_ance_a, ensemble).
action_parent(man_helps_woman_out_of_biens_ance_a, help).
action_verb(man_helps_woman_out_of_biens_ance_a, past, 'man helps woman out of "bienséance" (a)').
action_verb(man_helps_woman_out_of_biens_ance_a, present, 'man helps woman out of "bienséance" (a)').
action_target_type(man_helps_woman_out_of_biens_ance_a, other).
action_requires_target(man_helps_woman_out_of_biens_ance_a).
action_range(man_helps_woman_out_of_biens_ance_a, 5).
action_is_accept(man_helps_woman_out_of_biens_ance_a).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (attribute(Actor, propriety, V), V > 50)).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (trait(Actor, flirtatious))).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (trait(Target, beautiful))).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (trait(Target, female))).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (attribute(Target, charisma, V), V > 70)).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (trait(Actor, male))).
action_effect(man_helps_woman_out_of_biens_ance_a, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(man_helps_woman_out_of_biens_ance_a, (modify_network(Actor, Target, affinity, +, 10))).
action_effect(man_helps_woman_out_of_biens_ance_a, (modify_network(Target, Actor, curiosity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, man_helps_woman_out_of_biens_ance_a, Target) :-
    attribute(Actor, propriety, V), V > 50,
    trait(Actor, flirtatious),
    trait(Target, beautiful),
    trait(Target, female),
    attribute(Target, charisma, V), V > 70,
    trait(Actor, male).

%% experienced_person_gives_good_advice
% Action: experienced person gives good advice
% Source: Ensemble / social-helping

action(experienced_person_gives_good_advice, 'experienced person gives good advice', social, 1).
action_difficulty(experienced_person_gives_good_advice, 0.5).
action_duration(experienced_person_gives_good_advice, 1).
action_category(experienced_person_gives_good_advice, social_helping).
action_source(experienced_person_gives_good_advice, ensemble).
action_parent(experienced_person_gives_good_advice, help).
action_verb(experienced_person_gives_good_advice, past, 'experienced person gives good advice').
action_verb(experienced_person_gives_good_advice, present, 'experienced person gives good advice').
action_target_type(experienced_person_gives_good_advice, other).
action_requires_target(experienced_person_gives_good_advice).
action_range(experienced_person_gives_good_advice, 5).
action_is_accept(experienced_person_gives_good_advice).
action_prerequisite(experienced_person_gives_good_advice, (attribute(Actor, propriety, V), V > 80)).
action_prerequisite(experienced_person_gives_good_advice, (attribute(Target, propriety, V), V < 70)).
action_prerequisite(experienced_person_gives_good_advice, (relationship(Target, Actor, esteem))).
action_effect(experienced_person_gives_good_advice, (modify_network(Target, Actor, affinity, +, 15))).
action_effect(experienced_person_gives_good_advice, (modify_network(Target, Actor, affinity, +, 15))).
action_effect(experienced_person_gives_good_advice, (assert(status(Target, grateful)))).
% Can Actor perform this action?
can_perform(Actor, experienced_person_gives_good_advice, Target) :-
    attribute(Actor, propriety, V), V > 80,
    attribute(Target, propriety, V), V < 70,
    relationship(Target, Actor, esteem).

%% discreet_thanks_for_help_from_a_social_superior
% Action: discreet thanks for help from a social superior
% Source: Ensemble / social-helping

action(discreet_thanks_for_help_from_a_social_superior, 'discreet thanks for help from a social superior', social, 1).
action_difficulty(discreet_thanks_for_help_from_a_social_superior, 0.5).
action_duration(discreet_thanks_for_help_from_a_social_superior, 1).
action_category(discreet_thanks_for_help_from_a_social_superior, social_helping).
action_source(discreet_thanks_for_help_from_a_social_superior, ensemble).
action_parent(discreet_thanks_for_help_from_a_social_superior, help).
action_verb(discreet_thanks_for_help_from_a_social_superior, past, 'discreet thanks for help from a social superior').
action_verb(discreet_thanks_for_help_from_a_social_superior, present, 'discreet thanks for help from a social superior').
action_target_type(discreet_thanks_for_help_from_a_social_superior, other).
action_requires_target(discreet_thanks_for_help_from_a_social_superior).
action_range(discreet_thanks_for_help_from_a_social_superior, 5).
action_is_accept(discreet_thanks_for_help_from_a_social_superior).
action_prerequisite(discreet_thanks_for_help_from_a_social_superior, (trait(Actor, virtuous))).
action_prerequisite(discreet_thanks_for_help_from_a_social_superior, (\+ trait(Actor, rich))).
action_prerequisite(discreet_thanks_for_help_from_a_social_superior, (\+ relationship(Actor, Target, strangers))).
action_prerequisite(discreet_thanks_for_help_from_a_social_superior, (trait(Target, rich))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (assert(status(Actor, grateful)))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (modify_attribute(Actor, propriety, +, 5))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (modify_network(Target, Actor, affinity, +, 5))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (ensemble_effect(Actor, owes a favor to, true))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (modify_attribute(Actor, sensitiveness, +, 5))).
% Can Actor perform this action?
can_perform(Actor, discreet_thanks_for_help_from_a_social_superior, Target) :-
    trait(Actor, virtuous),
    \+ trait(Actor, rich),
    \+ relationship(Actor, Target, strangers),
    trait(Target, rich).

%% a_rich_person_helps_a_inebriated_man
% Action: a rich person helps a inebriated man
% Source: Ensemble / social-helping

action(a_rich_person_helps_a_inebriated_man, 'a rich person helps a inebriated man', social, 1).
action_difficulty(a_rich_person_helps_a_inebriated_man, 0.5).
action_duration(a_rich_person_helps_a_inebriated_man, 1).
action_category(a_rich_person_helps_a_inebriated_man, social_helping).
action_source(a_rich_person_helps_a_inebriated_man, ensemble).
action_parent(a_rich_person_helps_a_inebriated_man, help).
action_verb(a_rich_person_helps_a_inebriated_man, past, 'a rich person helps a inebriated man').
action_verb(a_rich_person_helps_a_inebriated_man, present, 'a rich person helps a inebriated man').
action_target_type(a_rich_person_helps_a_inebriated_man, other).
action_requires_target(a_rich_person_helps_a_inebriated_man).
action_range(a_rich_person_helps_a_inebriated_man, 5).
action_is_accept(a_rich_person_helps_a_inebriated_man).
action_prerequisite(a_rich_person_helps_a_inebriated_man, (trait(Actor, rich))).
action_prerequisite(a_rich_person_helps_a_inebriated_man, (attribute(Actor, sensitiveness, V), V > 75)).
action_prerequisite(a_rich_person_helps_a_inebriated_man, (status(Target, inebriated))).
action_effect(a_rich_person_helps_a_inebriated_man, (modify_network(Target, Actor, affinity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, a_rich_person_helps_a_inebriated_man, Target) :-
    trait(Actor, rich),
    attribute(Actor, sensitiveness, V), V > 75,
    status(Target, inebriated).

%% helpsomeone_successfully_default
% Action: helpsomeone successfully-default
% Source: Ensemble / social-helping

action(helpsomeone_successfully_default, 'helpsomeone successfully-default', social, 1).
action_difficulty(helpsomeone_successfully_default, 0.5).
action_duration(helpsomeone_successfully_default, 1).
action_category(helpsomeone_successfully_default, social_helping).
action_source(helpsomeone_successfully_default, ensemble).
action_parent(helpsomeone_successfully_default, help).
action_verb(helpsomeone_successfully_default, past, 'helpsomeone successfully-default').
action_verb(helpsomeone_successfully_default, present, 'helpsomeone successfully-default').
action_target_type(helpsomeone_successfully_default, other).
action_requires_target(helpsomeone_successfully_default).
action_range(helpsomeone_successfully_default, 5).
action_is_accept(helpsomeone_successfully_default).
action_effect(helpsomeone_successfully_default, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, helpsomeone_successfully_default, Target) :- true.

%% helpsomeone_unsuccessfully_default
% Action: helpsomeone unsuccessfully-default
% Source: Ensemble / social-helping

action(helpsomeone_unsuccessfully_default, 'helpsomeone unsuccessfully-default', social, 1).
action_difficulty(helpsomeone_unsuccessfully_default, 0.5).
action_duration(helpsomeone_unsuccessfully_default, 1).
action_category(helpsomeone_unsuccessfully_default, social_helping).
action_source(helpsomeone_unsuccessfully_default, ensemble).
action_parent(helpsomeone_unsuccessfully_default, help).
action_verb(helpsomeone_unsuccessfully_default, past, 'helpsomeone unsuccessfully-default').
action_verb(helpsomeone_unsuccessfully_default, present, 'helpsomeone unsuccessfully-default').
action_target_type(helpsomeone_unsuccessfully_default, other).
action_requires_target(helpsomeone_unsuccessfully_default).
action_range(helpsomeone_unsuccessfully_default, 5).
action_effect(helpsomeone_unsuccessfully_default, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, helpsomeone_unsuccessfully_default, Target) :- true.

%% devout_refuses_to_help_poor_desperate_virtuous
% Action: devout refuses to help poor desperate virtuous
% Source: Ensemble / social-helping

action(devout_refuses_to_help_poor_desperate_virtuous, 'devout refuses to help poor desperate virtuous', social, 1).
action_difficulty(devout_refuses_to_help_poor_desperate_virtuous, 0.5).
action_duration(devout_refuses_to_help_poor_desperate_virtuous, 1).
action_category(devout_refuses_to_help_poor_desperate_virtuous, social_helping).
action_source(devout_refuses_to_help_poor_desperate_virtuous, ensemble).
action_parent(devout_refuses_to_help_poor_desperate_virtuous, ask_for_a_favor).
action_verb(devout_refuses_to_help_poor_desperate_virtuous, past, 'devout refuses to help poor desperate virtuous').
action_verb(devout_refuses_to_help_poor_desperate_virtuous, present, 'devout refuses to help poor desperate virtuous').
action_target_type(devout_refuses_to_help_poor_desperate_virtuous, other).
action_requires_target(devout_refuses_to_help_poor_desperate_virtuous).
action_range(devout_refuses_to_help_poor_desperate_virtuous, 5).
action_prerequisite(devout_refuses_to_help_poor_desperate_virtuous, (trait(Actor, virtuous))).
action_prerequisite(devout_refuses_to_help_poor_desperate_virtuous, (trait(Target, devout))).
action_prerequisite(devout_refuses_to_help_poor_desperate_virtuous, (trait(Actor, poor))).
action_prerequisite(devout_refuses_to_help_poor_desperate_virtuous, (status(Actor, upset))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (ensemble_effect(Actor, resentful of, true))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (assert(status(Actor, embarrassed)))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (modify_attribute(Actor, self-assuredness, -, 10))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (ensemble_effect(Target, resentful of, true))).
% Can Actor perform this action?
can_perform(Actor, devout_refuses_to_help_poor_desperate_virtuous, Target) :-
    trait(Actor, virtuous),
    trait(Target, devout),
    trait(Actor, poor),
    status(Actor, upset).

%% askforfavor_successfully
% Action: askforfavor successfully
% Source: Ensemble / social-helping

action(askforfavor_successfully, 'askforfavor successfully', social, 1).
action_difficulty(askforfavor_successfully, 0.5).
action_duration(askforfavor_successfully, 1).
action_category(askforfavor_successfully, social_helping).
action_source(askforfavor_successfully, ensemble).
action_parent(askforfavor_successfully, ask_for_a_favor).
action_verb(askforfavor_successfully, past, 'askforfavor successfully').
action_verb(askforfavor_successfully, present, 'askforfavor successfully').
action_target_type(askforfavor_successfully, other).
action_requires_target(askforfavor_successfully).
action_range(askforfavor_successfully, 5).
action_is_accept(askforfavor_successfully).
action_effect(askforfavor_successfully, (assert(relationship(Actor, Target, ally)))).
can_perform(Actor, askforfavor_successfully, Target) :- true.

%% askforfavor_unsuccessfully
% Action: askforfavor unsuccessfully
% Source: Ensemble / social-helping

action(askforfavor_unsuccessfully, 'askforfavor unsuccessfully', social, 1).
action_difficulty(askforfavor_unsuccessfully, 0.5).
action_duration(askforfavor_unsuccessfully, 1).
action_category(askforfavor_unsuccessfully, social_helping).
action_source(askforfavor_unsuccessfully, ensemble).
action_parent(askforfavor_unsuccessfully, ask_for_a_favor).
action_verb(askforfavor_unsuccessfully, past, 'askforfavor unsuccessfully').
action_verb(askforfavor_unsuccessfully, present, 'askforfavor unsuccessfully').
action_target_type(askforfavor_unsuccessfully, other).
action_requires_target(askforfavor_unsuccessfully).
action_range(askforfavor_unsuccessfully, 5).
action_effect(askforfavor_unsuccessfully, (retract(relationship(Actor, Target, ally)))).
can_perform(Actor, askforfavor_unsuccessfully, Target) :- true.

%% intervene_between_a_and_b_in_favor_of_a
% Action: intervene between a and b in favor of a
% Source: Ensemble / social-helping

action(intervene_between_a_and_b_in_favor_of_a, 'intervene between a and b in favor of a', social, 1).
action_difficulty(intervene_between_a_and_b_in_favor_of_a, 0.5).
action_duration(intervene_between_a_and_b_in_favor_of_a, 1).
action_category(intervene_between_a_and_b_in_favor_of_a, social_helping).
action_source(intervene_between_a_and_b_in_favor_of_a, ensemble).
action_verb(intervene_between_a_and_b_in_favor_of_a, past, 'intervene between a and b in favor of a').
action_verb(intervene_between_a_and_b_in_favor_of_a, present, 'intervene between a and b in favor of a').
action_target_type(intervene_between_a_and_b_in_favor_of_a, other).
action_requires_target(intervene_between_a_and_b_in_favor_of_a).
action_range(intervene_between_a_and_b_in_favor_of_a, 5).
action_is_accept(intervene_between_a_and_b_in_favor_of_a).
action_prerequisite(intervene_between_a_and_b_in_favor_of_a, (relationship(Actor, Target, friends))).
action_prerequisite(intervene_between_a_and_b_in_favor_of_a, (ensemble_condition(Target, threatened by, true))).
action_effect(intervene_between_a_and_b_in_favor_of_a, (assert(relationship(Actor, Target, ally)))).
action_effect(intervene_between_a_and_b_in_favor_of_a, (modify_network('third', Actor, affinity, -, 5))).
action_effect(intervene_between_a_and_b_in_favor_of_a, (modify_network(Target, Actor, affinity, +, 5))).
% Can Actor perform this action?
can_perform(Actor, intervene_between_a_and_b_in_favor_of_a, Target) :-
    relationship(Actor, Target, friends),
    ensemble_condition(Target, threatened by, true).

%% help_withheld_because_person_unable_to_pay
% Action: help withheld because person unable to pay
% Source: Ensemble / social-helping

action(help_withheld_because_person_unable_to_pay, 'help withheld because person unable to pay', social, 1).
action_difficulty(help_withheld_because_person_unable_to_pay, 0.5).
action_duration(help_withheld_because_person_unable_to_pay, 1).
action_category(help_withheld_because_person_unable_to_pay, social_helping).
action_source(help_withheld_because_person_unable_to_pay, ensemble).
action_verb(help_withheld_because_person_unable_to_pay, past, 'help withheld because person unable to pay').
action_verb(help_withheld_because_person_unable_to_pay, present, 'help withheld because person unable to pay').
action_target_type(help_withheld_because_person_unable_to_pay, self).
can_perform(Actor, help_withheld_because_person_unable_to_pay) :- true.

%% follow_advice_and_break_up
% Action: follow advice and break up
% Source: Ensemble / social-helping

action(follow_advice_and_break_up, 'follow advice and break up', social, 1).
action_difficulty(follow_advice_and_break_up, 0.5).
action_duration(follow_advice_and_break_up, 1).
action_category(follow_advice_and_break_up, social_helping).
action_source(follow_advice_and_break_up, ensemble).
action_verb(follow_advice_and_break_up, past, 'follow advice and break up').
action_verb(follow_advice_and_break_up, present, 'follow advice and break up').
action_target_type(follow_advice_and_break_up, other).
action_requires_target(follow_advice_and_break_up).
action_range(follow_advice_and_break_up, 5).
action_is_accept(follow_advice_and_break_up).
action_prerequisite(follow_advice_and_break_up, (relationship(Actor, Target, lovers))).
action_prerequisite(follow_advice_and_break_up, (relationship(Actor, Someone, ally))).
action_prerequisite(follow_advice_and_break_up, (relationship(Actor, Someone, esteem))).
action_prerequisite(follow_advice_and_break_up, (network(Someone, Target, affinity, V), V < 30)).
action_effect(follow_advice_and_break_up, (retract(relationship(Actor, Target, lovers)))).
action_effect(follow_advice_and_break_up, (assert(status(Target, upset)))).
% Can Actor perform this action?
can_perform(Actor, follow_advice_and_break_up, Target) :-
    relationship(Actor, Target, lovers),
    relationship(Actor, Someone, ally),
    relationship(Actor, Someone, esteem),
    network(Someone, Target, affinity, V), V < 30.





