%% Insimul Volition Rules: Generic Fantasy World
%% Source: data/worlds/generic/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules

%% --- Guild members prefer trading with fellow guild members ---
rule_likelihood(guild_members_prefer_trading_with_fellow_guild_members, 1).
rule_type(guild_members_prefer_trading_with_fellow_guild_members, volition).
% Guild members prefer trading with fellow guild members over outsiders.
rule_active(guild_members_prefer_trading_with_fellow_guild_members).
rule_category(guild_members_prefer_trading_with_fellow_guild_members, commerce).
rule_source(guild_members_prefer_trading_with_fellow_guild_members, world).
rule_priority(guild_members_prefer_trading_with_fellow_guild_members, 5).
rule_applies(guild_members_prefer_trading_with_fellow_guild_members, X, Y) :-
    status(X, guild_member), status(Y, guild_member).
rule_effect(guild_members_prefer_trading_with_fellow_guild_members, set_intent(X, trade, Y, 5)).

%% --- Villagers seek protection from the guard captain when threatened ---
rule_likelihood(villagers_seek_protection_from_guard_when_threatened, 1).
rule_type(villagers_seek_protection_from_guard_when_threatened, volition).
% Villagers seek protection from the guard captain when threatened.
rule_active(villagers_seek_protection_from_guard_when_threatened).
rule_category(villagers_seek_protection_from_guard_when_threatened, survival).
rule_source(villagers_seek_protection_from_guard_when_threatened, world).
rule_priority(villagers_seek_protection_from_guard_when_threatened, 8).
rule_applies(villagers_seek_protection_from_guard_when_threatened, X, Y) :-
    status(X, threatened), occupation(Y, guard).
rule_effect(villagers_seek_protection_from_guard_when_threatened, set_intent(X, seek_help, Y, 8)).

%% --- People with high trust share rumors freely ---
rule_likelihood(people_with_high_trust_share_rumors_freely, 1).
rule_type(people_with_high_trust_share_rumors_freely, volition).
% People with high trust share rumors freely with each other.
rule_active(people_with_high_trust_share_rumors_freely).
rule_category(people_with_high_trust_share_rumors_freely, social).
rule_source(people_with_high_trust_share_rumors_freely, world).
rule_priority(people_with_high_trust_share_rumors_freely, 3).
rule_applies(people_with_high_trust_share_rumors_freely, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 7.
rule_effect(people_with_high_trust_share_rumors_freely, set_intent(X, gossip, Y, 3)).

%% --- Rivals undermine each other in commerce ---
rule_likelihood(rivals_undermine_each_other_in_commerce, 1).
rule_type(rivals_undermine_each_other_in_commerce, volition).
% Rivals undermine each other in commerce and reputation.
rule_active(rivals_undermine_each_other_in_commerce).
rule_category(rivals_undermine_each_other_in_commerce, antagonism_hostility).
rule_source(rivals_undermine_each_other_in_commerce, world).
rule_priority(rivals_undermine_each_other_in_commerce, 4).
rule_applies(rivals_undermine_each_other_in_commerce, X, Y) :-
    relationship(X, Y, rivals).
rule_effect(rivals_undermine_each_other_in_commerce, set_intent(X, undermine, Y, 4)).

%% --- Adventurous youth seek quests from guild masters ---
rule_likelihood(adventurous_youth_seek_quests_from_guild_masters, 1).
rule_type(adventurous_youth_seek_quests_from_guild_masters, volition).
% Adventurous young people seek quests and tasks from guild masters.
rule_active(adventurous_youth_seek_quests_from_guild_masters).
rule_category(adventurous_youth_seek_quests_from_guild_masters, ambition).
rule_source(adventurous_youth_seek_quests_from_guild_masters, world).
rule_priority(adventurous_youth_seek_quests_from_guild_masters, 5).
rule_applies(adventurous_youth_seek_quests_from_guild_masters, X, _) :-
    trait(X, adventurous), trait(X, young).
rule_effect(adventurous_youth_seek_quests_from_guild_masters, set_intent(X, seek_quest, Y, 5)).

%% --- Devout characters visit the temple regularly ---
rule_likelihood(devout_characters_visit_the_temple_regularly, 1).
rule_type(devout_characters_visit_the_temple_regularly, volition).
% Devout characters visit the temple regularly for prayer and guidance.
rule_active(devout_characters_visit_the_temple_regularly).
rule_category(devout_characters_visit_the_temple_regularly, faith).
rule_source(devout_characters_visit_the_temple_regularly, world).
rule_priority(devout_characters_visit_the_temple_regularly, 3).
rule_applies(devout_characters_visit_the_temple_regularly, X, _) :-
    trait(X, devout).
rule_effect(devout_characters_visit_the_temple_regularly, set_intent(X, pray, temple, 3)).

%% --- Shrewd merchants exploit scarcity for profit ---
rule_likelihood(shrewd_merchants_exploit_scarcity_for_profit, 1).
rule_type(shrewd_merchants_exploit_scarcity_for_profit, volition).
% Shrewd merchants exploit scarcity for higher profit margins.
rule_active(shrewd_merchants_exploit_scarcity_for_profit).
rule_category(shrewd_merchants_exploit_scarcity_for_profit, commerce).
rule_source(shrewd_merchants_exploit_scarcity_for_profit, world).
rule_priority(shrewd_merchants_exploit_scarcity_for_profit, 4).
rule_applies(shrewd_merchants_exploit_scarcity_for_profit, X, _) :-
    trait(X, shrewd), status(X, merchant).
rule_effect(shrewd_merchants_exploit_scarcity_for_profit, set_intent(X, price_gouge, market, 4)).

%% --- Parents protect their children from danger ---
rule_likelihood(parents_protect_their_children_from_danger, 1).
rule_type(parents_protect_their_children_from_danger, volition).
% Parents prioritize protecting their children from danger.
rule_active(parents_protect_their_children_from_danger).
rule_category(parents_protect_their_children_from_danger, family).
rule_source(parents_protect_their_children_from_danger, world).
rule_priority(parents_protect_their_children_from_danger, 9).
rule_applies(parents_protect_their_children_from_danger, X, Y) :-
    child(X, Y), status(Y, endangered).
rule_effect(parents_protect_their_children_from_danger, set_intent(X, protect, Y, 9)).

%% --- Courageous people confront threats directly ---
rule_likelihood(courageous_people_confront_threats_directly, 1).
rule_type(courageous_people_confront_threats_directly, volition).
% Courageous people confront threats head-on rather than fleeing.
rule_active(courageous_people_confront_threats_directly).
rule_category(courageous_people_confront_threats_directly, survival).
rule_source(courageous_people_confront_threats_directly, world).
rule_priority(courageous_people_confront_threats_directly, 6).
rule_applies(courageous_people_confront_threats_directly, X, _) :-
    trait(X, courageous), status(X, threatened).
rule_effect(courageous_people_confront_threats_directly, set_intent(X, fight, threat, 6)).

%% --- Healers offer aid to the wounded without payment ---
rule_likelihood(healers_offer_aid_to_the_wounded_without_payment, 1).
rule_type(healers_offer_aid_to_the_wounded_without_payment, volition).
% Healers offer aid to the wounded without demanding payment first.
rule_active(healers_offer_aid_to_the_wounded_without_payment).
rule_category(healers_offer_aid_to_the_wounded_without_payment, compassion).
rule_source(healers_offer_aid_to_the_wounded_without_payment, world).
rule_priority(healers_offer_aid_to_the_wounded_without_payment, 7).
rule_applies(healers_offer_aid_to_the_wounded_without_payment, X, Y) :-
    trait(X, nurturing), status(Y, wounded).
rule_effect(healers_offer_aid_to_the_wounded_without_payment, set_intent(X, heal, Y, 7)).

%% --- Mischievous characters spread rumors for entertainment ---
rule_likelihood(mischievous_characters_spread_rumors_for_fun, 1).
rule_type(mischievous_characters_spread_rumors_for_fun, volition).
% Mischievous characters spread rumors for their own entertainment.
rule_active(mischievous_characters_spread_rumors_for_fun).
rule_category(mischievous_characters_spread_rumors_for_fun, social).
rule_source(mischievous_characters_spread_rumors_for_fun, world).
rule_priority(mischievous_characters_spread_rumors_for_fun, 2).
rule_applies(mischievous_characters_spread_rumors_for_fun, X, _) :-
    trait(X, mischievous).
rule_effect(mischievous_characters_spread_rumors_for_fun, set_intent(X, gossip, random, 2)).

%% --- Scholarly people seek out libraries and archives ---
rule_likelihood(scholarly_people_seek_out_knowledge, 1).
rule_type(scholarly_people_seek_out_knowledge, volition).
% Scholarly people seek out libraries, archives, and learned company.
rule_active(scholarly_people_seek_out_knowledge).
rule_category(scholarly_people_seek_out_knowledge, curiosity).
rule_source(scholarly_people_seek_out_knowledge, world).
rule_priority(scholarly_people_seek_out_knowledge, 3).
rule_applies(scholarly_people_seek_out_knowledge, X, _) :-
    trait(X, scholarly).
rule_effect(scholarly_people_seek_out_knowledge, set_intent(X, study, library, 3)).
