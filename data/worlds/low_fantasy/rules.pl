%% Insimul Rules: Low Fantasy
%% Source: data/worlds/low_fantasy/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition style):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% --- Coin Loyalty ---
rule_likelihood(loyalty_follows_coin_and_those_who_pay_more_command_obedience, 3).
rule_type(loyalty_follows_coin_and_those_who_pay_more_command_obedience, volition).
%% Loyalty follows coin and those who pay more command obedience.
rule_active(loyalty_follows_coin_and_those_who_pay_more_command_obedience).
rule_category(loyalty_follows_coin_and_those_who_pay_more_command_obedience, economy).
rule_source(loyalty_follows_coin_and_those_who_pay_more_command_obedience, low_fantasy).
rule_priority(loyalty_follows_coin_and_those_who_pay_more_command_obedience, 8).
rule_applies(loyalty_follows_coin_and_those_who_pay_more_command_obedience, X, Y) :-
    relationship(X, Y, employed_by).
rule_effect(loyalty_follows_coin_and_those_who_pay_more_command_obedience, set_intent(X, obey, Y, 3)).

%% --- Debt Pressure ---
rule_likelihood(creditors_pressure_debtors_with_increasing_threats, 2).
rule_type(creditors_pressure_debtors_with_increasing_threats, volition).
%% Creditors pressure debtors with increasing threats.
rule_active(creditors_pressure_debtors_with_increasing_threats).
rule_category(creditors_pressure_debtors_with_increasing_threats, economy).
rule_source(creditors_pressure_debtors_with_increasing_threats, low_fantasy).
rule_priority(creditors_pressure_debtors_with_increasing_threats, 7).
rule_applies(creditors_pressure_debtors_with_increasing_threats, X, Y) :-
    relationship(Y, X, owes_debt),
    attribute(X, cunningness, C), C > 60.
rule_effect(creditors_pressure_debtors_with_increasing_threats, set_intent(X, threaten, Y, 2)).

%% --- Thieves Code ---
rule_likelihood(thieves_do_not_steal_from_other_thieves_within_the_guild, 2).
rule_type(thieves_do_not_steal_from_other_thieves_within_the_guild, volition).
%% Thieves do not steal from other thieves within the guild.
rule_active(thieves_do_not_steal_from_other_thieves_within_the_guild).
rule_category(thieves_do_not_steal_from_other_thieves_within_the_guild, criminal).
rule_source(thieves_do_not_steal_from_other_thieves_within_the_guild, low_fantasy).
rule_priority(thieves_do_not_steal_from_other_thieves_within_the_guild, 6).
rule_applies(thieves_do_not_steal_from_other_thieves_within_the_guild, X, Y) :-
    relationship(X, Y, subordinate),
    status(Y, thief_boss).
rule_effect(thieves_do_not_steal_from_other_thieves_within_the_guild, set_intent(X, respect, Y, 2)).

%% --- Corrupt Authority ---
rule_likelihood(corrupt_officials_extort_those_who_cannot_fight_back, 3).
rule_type(corrupt_officials_extort_those_who_cannot_fight_back, volition).
%% Corrupt officials extort those who cannot fight back.
rule_active(corrupt_officials_extort_those_who_cannot_fight_back).
rule_category(corrupt_officials_extort_those_who_cannot_fight_back, corruption).
rule_source(corrupt_officials_extort_those_who_cannot_fight_back, low_fantasy).
rule_priority(corrupt_officials_extort_those_who_cannot_fight_back, 8).
rule_applies(corrupt_officials_extort_those_who_cannot_fight_back, X, Y) :-
    trait(X, corrupt), status(X, bailiff),
    attribute(Y, self_assuredness, SA), SA < 50.
rule_effect(corrupt_officials_extort_those_who_cannot_fight_back, set_intent(X, extort, Y, 3)).

%% --- Mercenary Pragmatism ---
rule_likelihood(mercenaries_refuse_to_fight_without_guaranteed_payment, 2).
rule_type(mercenaries_refuse_to_fight_without_guaranteed_payment, volition).
%% Mercenaries refuse to fight without guaranteed payment.
rule_active(mercenaries_refuse_to_fight_without_guaranteed_payment).
rule_category(mercenaries_refuse_to_fight_without_guaranteed_payment, military).
rule_source(mercenaries_refuse_to_fight_without_guaranteed_payment, low_fantasy).
rule_priority(mercenaries_refuse_to_fight_without_guaranteed_payment, 7).
rule_applies(mercenaries_refuse_to_fight_without_guaranteed_payment, X, _Y) :-
    status(X, mercenary_captain),
    trait(X, pragmatic).
rule_effect(mercenaries_refuse_to_fight_without_guaranteed_payment, set_intent(X, demand_payment, any, 2)).

%% --- Witch Suspicion ---
rule_likelihood(those_who_use_herbs_or_charms_draw_suspicion_of_witchcraft, 2).
rule_type(those_who_use_herbs_or_charms_draw_suspicion_of_witchcraft, volition).
%% Those who use herbs or charms draw suspicion of witchcraft.
rule_active(those_who_use_herbs_or_charms_draw_suspicion_of_witchcraft).
rule_category(those_who_use_herbs_or_charms_draw_suspicion_of_witchcraft, superstition).
rule_source(those_who_use_herbs_or_charms_draw_suspicion_of_witchcraft, low_fantasy).
rule_priority(those_who_use_herbs_or_charms_draw_suspicion_of_witchcraft, 6).
rule_applies(those_who_use_herbs_or_charms_draw_suspicion_of_witchcraft, X, Y) :-
    status(X, bailiff),
    status(Y, Status), member(Status, [hedge_witch, healer]).
rule_effect(those_who_use_herbs_or_charms_draw_suspicion_of_witchcraft, set_intent(X, accuse, Y, 2)).

%% --- Smuggler Solidarity ---
rule_likelihood(smugglers_protect_their_supply_chain_from_outsiders, 2).
rule_type(smugglers_protect_their_supply_chain_from_outsiders, volition).
%% Smugglers protect their supply chain from outsiders.
rule_active(smugglers_protect_their_supply_chain_from_outsiders).
rule_category(smugglers_protect_their_supply_chain_from_outsiders, criminal).
rule_source(smugglers_protect_their_supply_chain_from_outsiders, low_fantasy).
rule_priority(smugglers_protect_their_supply_chain_from_outsiders, 7).
rule_applies(smugglers_protect_their_supply_chain_from_outsiders, X, _Y) :-
    status(X, smuggler_kingpin),
    trait(X, ruthless).
rule_effect(smugglers_protect_their_supply_chain_from_outsiders, set_intent(X, guard_routes, any, 2)).

%% --- Parental Sacrifice ---
rule_likelihood(parents_sacrifice_personal_safety_to_protect_their_children, 3).
rule_type(parents_sacrifice_personal_safety_to_protect_their_children, volition).
%% Parents sacrifice personal safety to protect their children.
rule_active(parents_sacrifice_personal_safety_to_protect_their_children).
rule_category(parents_sacrifice_personal_safety_to_protect_their_children, family).
rule_source(parents_sacrifice_personal_safety_to_protect_their_children, low_fantasy).
rule_priority(parents_sacrifice_personal_safety_to_protect_their_children, 8).
rule_applies(parents_sacrifice_personal_safety_to_protect_their_children, X, Y) :-
    trait(X, protective),
    child(X, Y).
rule_effect(parents_sacrifice_personal_safety_to_protect_their_children, set_intent(X, protect, Y, 3)).

%% --- Oathkeeper Respect ---
rule_likelihood(those_who_honour_their_oaths_earn_respect_even_from_enemies, 1).
rule_type(those_who_honour_their_oaths_earn_respect_even_from_enemies, volition).
%% Those who honour their oaths earn respect even from enemies.
rule_active(those_who_honour_their_oaths_earn_respect_even_from_enemies).
rule_category(those_who_honour_their_oaths_earn_respect_even_from_enemies, social).
rule_source(those_who_honour_their_oaths_earn_respect_even_from_enemies, low_fantasy).
rule_priority(those_who_honour_their_oaths_earn_respect_even_from_enemies, 5).
rule_applies(those_who_honour_their_oaths_earn_respect_even_from_enemies, X, Y) :-
    trait(Y, honourable),
    X \= Y.
rule_effect(those_who_honour_their_oaths_earn_respect_even_from_enemies, set_intent(X, respect, Y, 1)).

%% --- Youth Ambition ---
rule_likelihood(young_people_seek_to_prove_themselves_in_dangerous_ventures, 2).
rule_type(young_people_seek_to_prove_themselves_in_dangerous_ventures, volition).
%% Young people seek to prove themselves in dangerous ventures.
rule_active(young_people_seek_to_prove_themselves_in_dangerous_ventures).
rule_category(young_people_seek_to_prove_themselves_in_dangerous_ventures, social).
rule_source(young_people_seek_to_prove_themselves_in_dangerous_ventures, low_fantasy).
rule_priority(young_people_seek_to_prove_themselves_in_dangerous_ventures, 5).
rule_applies(young_people_seek_to_prove_themselves_in_dangerous_ventures, X, _Y) :-
    trait(X, young), trait(X, eager).
rule_effect(young_people_seek_to_prove_themselves_in_dangerous_ventures, set_intent(X, seek_adventure, any, 2)).

%% --- Noble Dispossession ---
rule_likelihood(dispossessed_nobles_scheme_to_reclaim_lost_titles_and_lands, 2).
rule_type(dispossessed_nobles_scheme_to_reclaim_lost_titles_and_lands, volition).
%% Dispossessed nobles scheme to reclaim lost titles and lands.
rule_active(dispossessed_nobles_scheme_to_reclaim_lost_titles_and_lands).
rule_category(dispossessed_nobles_scheme_to_reclaim_lost_titles_and_lands, politics).
rule_source(dispossessed_nobles_scheme_to_reclaim_lost_titles_and_lands, low_fantasy).
rule_priority(dispossessed_nobles_scheme_to_reclaim_lost_titles_and_lands, 6).
rule_applies(dispossessed_nobles_scheme_to_reclaim_lost_titles_and_lands, X, _Y) :-
    status(X, hidden_noble),
    trait(X, proud).
rule_effect(dispossessed_nobles_scheme_to_reclaim_lost_titles_and_lands, set_intent(X, scheme, any, 2)).

%% --- Survival Before Morality ---
rule_likelihood(desperate_people_abandon_morals_when_survival_is_at_stake, 3).
rule_type(desperate_people_abandon_morals_when_survival_is_at_stake, volition).
%% Desperate people abandon morals when survival is at stake.
rule_active(desperate_people_abandon_morals_when_survival_is_at_stake).
rule_category(desperate_people_abandon_morals_when_survival_is_at_stake, survival).
rule_source(desperate_people_abandon_morals_when_survival_is_at_stake, low_fantasy).
rule_priority(desperate_people_abandon_morals_when_survival_is_at_stake, 9).
rule_applies(desperate_people_abandon_morals_when_survival_is_at_stake, X, Y) :-
    trait(X, desperate),
    X \= Y.
rule_effect(desperate_people_abandon_morals_when_survival_is_at_stake, set_intent(X, exploit, Y, 3)).
