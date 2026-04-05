%% Insimul Rules: Wild West -- Redemption Gulch
%% Source: data/worlds/wild_west/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Format follows additional-ensemble.pl pattern:
%%   rule_likelihood, rule_type, rule_active, rule_category,
%%   rule_source, rule_priority, rule_applies, rule_effect

%% ─── Law and Order Rules (3) ───

rule_likelihood(the_sheriff_pursues_known_outlaws_on_sight, 1).
rule_type(the_sheriff_pursues_known_outlaws_on_sight, volition).
% The sheriff pursues known outlaws on sight
rule_active(the_sheriff_pursues_known_outlaws_on_sight).
rule_category(the_sheriff_pursues_known_outlaws_on_sight, law_and_order).
rule_source(the_sheriff_pursues_known_outlaws_on_sight, wild_west).
rule_priority(the_sheriff_pursues_known_outlaws_on_sight, 9).
rule_applies(the_sheriff_pursues_known_outlaws_on_sight, X, Y) :-
    faction(X, law), status(Y, wanted), near(X, Y, 20).
rule_effect(the_sheriff_pursues_known_outlaws_on_sight, set_intent(X, apprehend, Y, 9)).

rule_likelihood(townsfolk_report_suspicious_strangers_to_the_sheriff, 1).
rule_type(townsfolk_report_suspicious_strangers_to_the_sheriff, volition).
% Townsfolk report suspicious strangers to the sheriff
rule_active(townsfolk_report_suspicious_strangers_to_the_sheriff).
rule_category(townsfolk_report_suspicious_strangers_to_the_sheriff, law_and_order).
rule_source(townsfolk_report_suspicious_strangers_to_the_sheriff, wild_west).
rule_priority(townsfolk_report_suspicious_strangers_to_the_sheriff, 5).
rule_applies(townsfolk_report_suspicious_strangers_to_the_sheriff, X, Y) :-
    faction(X, townsfolk), \+ known_resident(Y), trait(Y, suspicious).
rule_effect(townsfolk_report_suspicious_strangers_to_the_sheriff, set_intent(X, inform, eli_holden, 5)).

rule_likelihood(deputies_back_up_the_sheriff_during_confrontations, 1).
rule_type(deputies_back_up_the_sheriff_during_confrontations, volition).
% Deputies back up the sheriff during confrontations
rule_active(deputies_back_up_the_sheriff_during_confrontations).
rule_category(deputies_back_up_the_sheriff_during_confrontations, law_and_order).
rule_source(deputies_back_up_the_sheriff_during_confrontations, wild_west).
rule_priority(deputies_back_up_the_sheriff_during_confrontations, 8).
rule_applies(deputies_back_up_the_sheriff_during_confrontations, X, _) :-
    status(X, deputy), in_confrontation(eli_holden).
rule_effect(deputies_back_up_the_sheriff_during_confrontations, set_intent(X, assist, eli_holden, 8)).

%% ─── Outlaw Rules (3) ───

rule_likelihood(outlaws_case_targets_before_robbing_them, 1).
rule_type(outlaws_case_targets_before_robbing_them, volition).
% Outlaws case targets before robbing them
rule_active(outlaws_case_targets_before_robbing_them).
rule_category(outlaws_case_targets_before_robbing_them, outlaw_behavior).
rule_source(outlaws_case_targets_before_robbing_them, wild_west).
rule_priority(outlaws_case_targets_before_robbing_them, 7).
rule_applies(outlaws_case_targets_before_robbing_them, X, Y) :-
    faction(X, ketchum_gang), building(Y, business, bank).
rule_effect(outlaws_case_targets_before_robbing_them, set_intent(X, scout, Y, 7)).

rule_likelihood(gang_members_follow_their_leaders_orders, 1).
rule_type(gang_members_follow_their_leaders_orders, volition).
% Gang members follow their leaders orders
rule_active(gang_members_follow_their_leaders_orders).
rule_category(gang_members_follow_their_leaders_orders, outlaw_behavior).
rule_source(gang_members_follow_their_leaders_orders, wild_west).
rule_priority(gang_members_follow_their_leaders_orders, 8).
rule_applies(gang_members_follow_their_leaders_orders, X, _) :-
    faction(X, ketchum_gang), X \= jack_ketchum.
rule_effect(gang_members_follow_their_leaders_orders, set_intent(X, defer_to, jack_ketchum, 8)).

rule_likelihood(outlaws_flee_when_outnumbered_by_lawmen, 1).
rule_type(outlaws_flee_when_outnumbered_by_lawmen, volition).
% Outlaws flee when outnumbered by lawmen
rule_active(outlaws_flee_when_outnumbered_by_lawmen).
rule_category(outlaws_flee_when_outnumbered_by_lawmen, outlaw_behavior).
rule_source(outlaws_flee_when_outnumbered_by_lawmen, wild_west).
rule_priority(outlaws_flee_when_outnumbered_by_lawmen, 9).
rule_applies(outlaws_flee_when_outnumbered_by_lawmen, X, _) :-
    faction(X, ketchum_gang), outnumbered_by_law(X).
rule_effect(outlaws_flee_when_outnumbered_by_lawmen, set_intent(X, flee, wilderness, 9)).

%% ─── Rancher Rules (3) ───

rule_likelihood(ranchers_protect_their_cattle_from_rustlers, 1).
rule_type(ranchers_protect_their_cattle_from_rustlers, volition).
% Ranchers protect their cattle from rustlers
rule_active(ranchers_protect_their_cattle_from_rustlers).
rule_category(ranchers_protect_their_cattle_from_rustlers, rancher_behavior).
rule_source(ranchers_protect_their_cattle_from_rustlers, wild_west).
rule_priority(ranchers_protect_their_cattle_from_rustlers, 8).
rule_applies(ranchers_protect_their_cattle_from_rustlers, X, Y) :-
    faction(X, ranchers), rustling_cattle(Y).
rule_effect(ranchers_protect_their_cattle_from_rustlers, set_intent(X, confront, Y, 8)).

rule_likelihood(ranchers_oppose_railroad_expansion_through_their_land, 1).
rule_type(ranchers_oppose_railroad_expansion_through_their_land, volition).
% Ranchers oppose railroad expansion through their land
rule_active(ranchers_oppose_railroad_expansion_through_their_land).
rule_category(ranchers_oppose_railroad_expansion_through_their_land, rancher_behavior).
rule_source(ranchers_oppose_railroad_expansion_through_their_land, wild_west).
rule_priority(ranchers_oppose_railroad_expansion_through_their_land, 7).
rule_applies(ranchers_oppose_railroad_expansion_through_their_land, X, Y) :-
    faction(X, ranchers), faction(Y, railroad).
rule_effect(ranchers_oppose_railroad_expansion_through_their_land, set_intent(X, oppose, Y, 7)).

rule_likelihood(ranch_hands_are_loyal_to_the_ranch_owner, 1).
rule_type(ranch_hands_are_loyal_to_the_ranch_owner, volition).
% Ranch hands are loyal to the ranch owner
rule_active(ranch_hands_are_loyal_to_the_ranch_owner).
rule_category(ranch_hands_are_loyal_to_the_ranch_owner, rancher_behavior).
rule_source(ranch_hands_are_loyal_to_the_ranch_owner, wild_west).
rule_priority(ranch_hands_are_loyal_to_the_ranch_owner, 6).
rule_applies(ranch_hands_are_loyal_to_the_ranch_owner, X, _) :-
    (occupation(X, ranch_hand) ; occupation(X, foreman)),
    faction(X, ranchers).
rule_effect(ranch_hands_are_loyal_to_the_ranch_owner, set_intent(X, support, walt_mccoy, 6)).

%% ─── Social Rules (3) ───

rule_likelihood(people_gather_at_the_saloon_for_news_and_gossip, 1).
rule_type(people_gather_at_the_saloon_for_news_and_gossip, volition).
% People gather at the saloon for news and gossip
rule_active(people_gather_at_the_saloon_for_news_and_gossip).
rule_category(people_gather_at_the_saloon_for_news_and_gossip, social).
rule_source(people_gather_at_the_saloon_for_news_and_gossip, wild_west).
rule_priority(people_gather_at_the_saloon_for_news_and_gossip, 3).
rule_applies(people_gather_at_the_saloon_for_news_and_gossip, X, _) :-
    location(X, redemption_gulch), \+ faction(X, ketchum_gang).
rule_effect(people_gather_at_the_saloon_for_news_and_gossip, set_intent(X, visit, silver_spur_saloon, 3)).

rule_likelihood(the_preacher_tries_to_reform_troublemakers, 1).
rule_type(the_preacher_tries_to_reform_troublemakers, volition).
% The preacher tries to reform troublemakers
rule_active(the_preacher_tries_to_reform_troublemakers).
rule_category(the_preacher_tries_to_reform_troublemakers, social).
rule_source(the_preacher_tries_to_reform_troublemakers, wild_west).
rule_priority(the_preacher_tries_to_reform_troublemakers, 4).
rule_applies(the_preacher_tries_to_reform_troublemakers, X, Y) :-
    occupation(X, preacher), trait(Y, reckless).
rule_effect(the_preacher_tries_to_reform_troublemakers, set_intent(X, counsel, Y, 4)).

rule_likelihood(the_newspaper_editor_investigates_powerful_figures, 1).
rule_type(the_newspaper_editor_investigates_powerful_figures, volition).
% The newspaper editor investigates powerful figures
rule_active(the_newspaper_editor_investigates_powerful_figures).
rule_category(the_newspaper_editor_investigates_powerful_figures, social).
rule_source(the_newspaper_editor_investigates_powerful_figures, wild_west).
rule_priority(the_newspaper_editor_investigates_powerful_figures, 5).
rule_applies(the_newspaper_editor_investigates_powerful_figures, X, Y) :-
    occupation(X, editor), (occupation(Y, railroad_baron) ; status(Y, wanted)).
rule_effect(the_newspaper_editor_investigates_powerful_figures, set_intent(X, investigate, Y, 5)).
