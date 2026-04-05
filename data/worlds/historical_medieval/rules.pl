%% Insimul Rules: Historical Medieval Europe
%% Source: data/worlds/historical_medieval/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition format):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% Serfs resent lords who demand excessive corvee labor
rule_likelihood(serfs_resent_lords_demanding_excessive_corvee, 1).
rule_type(serfs_resent_lords_demanding_excessive_corvee, volition).
%% Serfs resent lords who demand excessive corvee labor beyond custom.
rule_active(serfs_resent_lords_demanding_excessive_corvee).
rule_category(serfs_resent_lords_demanding_excessive_corvee, feudal_tension).
rule_source(serfs_resent_lords_demanding_excessive_corvee, ensemble).
rule_priority(serfs_resent_lords_demanding_excessive_corvee, 3).
rule_applies(serfs_resent_lords_demanding_excessive_corvee, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(serfs_resent_lords_demanding_excessive_corvee, set_intent(X, antagonize, Y, 3)).

%% Vassals seek favor with their liege through loyal service
rule_likelihood(vassals_seek_favor_through_loyal_service, 2).
rule_type(vassals_seek_favor_through_loyal_service, volition).
%% Vassals seek favor with their liege through loyal service.
rule_active(vassals_seek_favor_through_loyal_service).
rule_category(vassals_seek_favor_through_loyal_service, feudal_loyalty).
rule_source(vassals_seek_favor_through_loyal_service, ensemble).
rule_priority(vassals_seek_favor_through_loyal_service, 5).
rule_applies(vassals_seek_favor_through_loyal_service, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(vassals_seek_favor_through_loyal_service, set_intent(X, befriend, Y, 5)).

%% Monks distrust merchants who profit from holy relics
rule_likelihood(monks_distrust_merchants_profiting_from_relics, 1).
rule_type(monks_distrust_merchants_profiting_from_relics, volition).
%% Monks distrust merchants who profit from holy relics.
rule_active(monks_distrust_merchants_profiting_from_relics).
rule_category(monks_distrust_merchants_profiting_from_relics, religious_commerce).
rule_source(monks_distrust_merchants_profiting_from_relics, ensemble).
rule_priority(monks_distrust_merchants_profiting_from_relics, 3).
rule_applies(monks_distrust_merchants_profiting_from_relics, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(monks_distrust_merchants_profiting_from_relics, set_intent(X, antagonize, Y, 2)).

%% Knights bond through shared combat in tournament
rule_likelihood(knights_bond_through_shared_tournament_combat, 2).
rule_type(knights_bond_through_shared_tournament_combat, volition).
%% Knights bond through shared combat in tournament and campaign.
rule_active(knights_bond_through_shared_tournament_combat).
rule_category(knights_bond_through_shared_tournament_combat, martial_brotherhood).
rule_source(knights_bond_through_shared_tournament_combat, ensemble).
rule_priority(knights_bond_through_shared_tournament_combat, 4).
rule_applies(knights_bond_through_shared_tournament_combat, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(knights_bond_through_shared_tournament_combat, set_intent(X, befriend, Y, 4)).

%% Merchants undercut guild rivals to corner the wool trade
rule_likelihood(merchants_undercut_guild_rivals_for_wool_trade, 1).
rule_type(merchants_undercut_guild_rivals_for_wool_trade, volition).
%% Merchants undercut guild rivals to corner the wool trade.
rule_active(merchants_undercut_guild_rivals_for_wool_trade).
rule_category(merchants_undercut_guild_rivals_for_wool_trade, trade_rivalry).
rule_source(merchants_undercut_guild_rivals_for_wool_trade, ensemble).
rule_priority(merchants_undercut_guild_rivals_for_wool_trade, 3).
rule_applies(merchants_undercut_guild_rivals_for_wool_trade, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 5.
rule_effect(merchants_undercut_guild_rivals_for_wool_trade, set_intent(X, antagonize, Y, 3)).

%% The abbot cultivates friendship with the lord for land grants
rule_likelihood(abbot_cultivates_friendship_with_lord_for_land, 2).
rule_type(abbot_cultivates_friendship_with_lord_for_land, volition).
%% The abbot cultivates friendship with the lord for land grants and privileges.
rule_active(abbot_cultivates_friendship_with_lord_for_land).
rule_category(abbot_cultivates_friendship_with_lord_for_land, church_politics).
rule_source(abbot_cultivates_friendship_with_lord_for_land, ensemble).
rule_priority(abbot_cultivates_friendship_with_lord_for_land, 5).
rule_applies(abbot_cultivates_friendship_with_lord_for_land, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 5.
rule_effect(abbot_cultivates_friendship_with_lord_for_land, set_intent(X, befriend, Y, 5)).

%% Young squires challenge each other to prove their worth
rule_likelihood(young_squires_challenge_each_other_to_prove_worth, 1).
rule_type(young_squires_challenge_each_other_to_prove_worth, volition).
%% Young squires challenge each other to prove their worth in arms.
rule_active(young_squires_challenge_each_other_to_prove_worth).
rule_category(young_squires_challenge_each_other_to_prove_worth, martial_rivalry).
rule_source(young_squires_challenge_each_other_to_prove_worth, ensemble).
rule_priority(young_squires_challenge_each_other_to_prove_worth, 3).
rule_applies(young_squires_challenge_each_other_to_prove_worth, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 4.
rule_effect(young_squires_challenge_each_other_to_prove_worth, set_intent(X, antagonize, Y, 2)).

%% Women forge alliances through marriage negotiations
rule_likelihood(women_forge_alliances_through_marriage_talks, 2).
rule_type(women_forge_alliances_through_marriage_talks, volition).
%% Women forge alliances through marriage negotiations and kinship.
rule_active(women_forge_alliances_through_marriage_talks).
rule_category(women_forge_alliances_through_marriage_talks, dynastic_alliance).
rule_source(women_forge_alliances_through_marriage_talks, ensemble).
rule_priority(women_forge_alliances_through_marriage_talks, 4).
rule_applies(women_forge_alliances_through_marriage_talks, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(women_forge_alliances_through_marriage_talks, set_intent(X, befriend, Y, 4)).

%% Outlaws prey on travelers who appear weak or unguarded
rule_likelihood(outlaws_prey_on_weak_unguarded_travelers, 1).
rule_type(outlaws_prey_on_weak_unguarded_travelers, volition).
%% Outlaws prey on travelers who appear weak or unguarded on the roads.
rule_active(outlaws_prey_on_weak_unguarded_travelers).
rule_category(outlaws_prey_on_weak_unguarded_travelers, banditry).
rule_source(outlaws_prey_on_weak_unguarded_travelers, ensemble).
rule_priority(outlaws_prey_on_weak_unguarded_travelers, 2).
rule_applies(outlaws_prey_on_weak_unguarded_travelers, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 3.
rule_effect(outlaws_prey_on_weak_unguarded_travelers, set_intent(X, antagonize, Y, 4)).

%% Peasants share harvests with neighbors in times of famine
rule_likelihood(peasants_share_harvests_with_neighbors_in_famine, 2).
rule_type(peasants_share_harvests_with_neighbors_in_famine, volition).
%% Peasants share harvests with neighbors in times of famine and hardship.
rule_active(peasants_share_harvests_with_neighbors_in_famine).
rule_category(peasants_share_harvests_with_neighbors_in_famine, communal_solidarity).
rule_source(peasants_share_harvests_with_neighbors_in_famine, ensemble).
rule_priority(peasants_share_harvests_with_neighbors_in_famine, 4).
rule_applies(peasants_share_harvests_with_neighbors_in_famine, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 5.
rule_effect(peasants_share_harvests_with_neighbors_in_famine, set_intent(X, befriend, Y, 4)).

%% Clergy condemn those who skip confession and mass
rule_likelihood(clergy_condemn_those_who_skip_confession, 1).
rule_type(clergy_condemn_those_who_skip_confession, volition).
%% Clergy condemn those who skip confession and Sunday mass.
rule_active(clergy_condemn_those_who_skip_confession).
rule_category(clergy_condemn_those_who_skip_confession, religious_discipline).
rule_source(clergy_condemn_those_who_skip_confession, ensemble).
rule_priority(clergy_condemn_those_who_skip_confession, 4).
rule_applies(clergy_condemn_those_who_skip_confession, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(clergy_condemn_those_who_skip_confession, set_intent(X, antagonize, Y, 3)).

%% Lords reward faithful retainers with feasts and favor
rule_likelihood(lords_reward_faithful_retainers_with_feasts, 2).
rule_type(lords_reward_faithful_retainers_with_feasts, volition).
%% Lords reward faithful retainers with feasts and favor at the high table.
rule_active(lords_reward_faithful_retainers_with_feasts).
rule_category(lords_reward_faithful_retainers_with_feasts, feudal_generosity).
rule_source(lords_reward_faithful_retainers_with_feasts, ensemble).
rule_priority(lords_reward_faithful_retainers_with_feasts, 5).
rule_applies(lords_reward_faithful_retainers_with_feasts, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(lords_reward_faithful_retainers_with_feasts, set_intent(X, befriend, Y, 5)).
