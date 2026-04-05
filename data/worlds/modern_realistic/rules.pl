%% Ensemble Volition Rules: Modern Realistic
%% Source: data/worlds/modern_realistic/rules.pl
%% Created: 2026-04-03
%% Total rules: 12

%% Neighbors help neighbors in need
rule_likelihood(neighbors_help_neighbors, 1).
rule_type(neighbors_help_neighbors, volition).
rule_active(neighbors_help_neighbors).
rule_category(neighbors_help_neighbors, community).
rule_source(neighbors_help_neighbors, modern_realistic).
rule_priority(neighbors_help_neighbors, 3).
rule_applies(neighbors_help_neighbors, X, Y) :-
    trait(X, community_minded),
    status(Y, struggling).
rule_effect(neighbors_help_neighbors, set_intent(X, help, Y, 3)).

%% Ambitious professionals network aggressively
rule_likelihood(ambitious_network, 1).
rule_type(ambitious_network, volition).
rule_active(ambitious_network).
rule_category(ambitious_network, career).
rule_source(ambitious_network, modern_realistic).
rule_priority(ambitious_network, 3).
rule_applies(ambitious_network, X, Y) :-
    trait(X, ambitious),
    attribute(X, self_assuredness, SA), SA > 60,
    attribute(Y, charisma, C), C > 60.
rule_effect(ambitious_network, set_intent(X, network_with, Y, 3)).

%% Creative people bond over shared interests
rule_likelihood(creatives_bond, 1).
rule_type(creatives_bond, volition).
rule_active(creatives_bond).
rule_category(creatives_bond, social).
rule_source(creatives_bond, modern_realistic).
rule_priority(creatives_bond, 2).
rule_applies(creatives_bond, X, Y) :-
    trait(X, creative),
    trait(Y, creative),
    X \= Y.
rule_effect(creatives_bond, modify_network(X, Y, affinity, '+', 3)).

%% Elderly residents distrust rapid change
rule_likelihood(elderly_distrust_change, 1).
rule_type(elderly_distrust_change, volition).
rule_active(elderly_distrust_change).
rule_category(elderly_distrust_change, generational).
rule_source(elderly_distrust_change, modern_realistic).
rule_priority(elderly_distrust_change, 2).
rule_applies(elderly_distrust_change, X, Y) :-
    trait(X, traditional),
    trait(X, elderly),
    trait(Y, ambitious),
    trait(Y, young).
rule_effect(elderly_distrust_change, modify_network(X, Y, affinity, '-', 2)).

%% Parents worry about their children
rule_likelihood(parents_worry, 1).
rule_type(parents_worry, volition).
rule_active(parents_worry).
rule_category(parents_worry, family).
rule_source(parents_worry, modern_realistic).
rule_priority(parents_worry, 4).
rule_applies(parents_worry, X, Y) :-
    trait(X, nurturing),
    trait(Y, young),
    attribute(Y, self_assuredness, SA), SA < 50.
rule_effect(parents_worry, set_intent(X, check_on, Y, 4)).

%% Entrepreneurs seek investors
rule_likelihood(entrepreneurs_seek_investors, 1).
rule_type(entrepreneurs_seek_investors, volition).
rule_active(entrepreneurs_seek_investors).
rule_category(entrepreneurs_seek_investors, career).
rule_source(entrepreneurs_seek_investors, modern_realistic).
rule_priority(entrepreneurs_seek_investors, 3).
rule_applies(entrepreneurs_seek_investors, X, Y) :-
    trait(X, entrepreneurial),
    attribute(Y, charisma, C), C > 70.
rule_effect(entrepreneurs_seek_investors, set_intent(X, pitch_to, Y, 3)).

%% Empathetic people sense emotional distress
rule_likelihood(empathetic_sense_distress, 1).
rule_type(empathetic_sense_distress, volition).
rule_active(empathetic_sense_distress).
rule_category(empathetic_sense_distress, emotional).
rule_source(empathetic_sense_distress, modern_realistic).
rule_priority(empathetic_sense_distress, 3).
rule_applies(empathetic_sense_distress, X, Y) :-
    trait(X, empathetic),
    attribute(X, sensitiveness, S), S > 70,
    status(Y, stressed).
rule_effect(empathetic_sense_distress, set_intent(X, comfort, Y, 3)).

%% Competitive people challenge rivals
rule_likelihood(competitive_challenge, 1).
rule_type(competitive_challenge, volition).
rule_active(competitive_challenge).
rule_category(competitive_challenge, personality).
rule_source(competitive_challenge, modern_realistic).
rule_priority(competitive_challenge, 2).
rule_applies(competitive_challenge, X, Y) :-
    trait(X, competitive),
    trait(Y, competitive),
    X \= Y.
rule_effect(competitive_challenge, set_intent(X, rival, Y, 2)).

%% Honest workers earn trust over time
rule_likelihood(honest_earn_trust, 1).
rule_type(honest_earn_trust, volition).
rule_active(honest_earn_trust).
rule_category(honest_earn_trust, reputation).
rule_source(honest_earn_trust, modern_realistic).
rule_priority(honest_earn_trust, 2).
rule_applies(honest_earn_trust, X, Y) :-
    trait(X, honest),
    trait(X, practical),
    network(X, Y, affinity, A), A > 30.
rule_effect(honest_earn_trust, modify_network(Y, X, affinity, '+', 2)).

%% Idealists push for reform
rule_likelihood(idealists_push_reform, 1).
rule_type(idealists_push_reform, volition).
rule_active(idealists_push_reform).
rule_category(idealists_push_reform, activism).
rule_source(idealists_push_reform, modern_realistic).
rule_priority(idealists_push_reform, 3).
rule_applies(idealists_push_reform, X, _Y) :-
    trait(X, idealistic),
    attribute(X, self_assuredness, SA), SA > 50.
rule_effect(idealists_push_reform, set_intent(X, advocate, community, 3)).

%% Gossip spreads through social hubs
rule_likelihood(gossip_spreads, 1).
rule_type(gossip_spreads, volition).
rule_active(gossip_spreads).
rule_category(gossip_spreads, social).
rule_source(gossip_spreads, modern_realistic).
rule_priority(gossip_spreads, 2).
rule_applies(gossip_spreads, X, Y) :-
    trait(X, sociable),
    attribute(X, charisma, C), C > 60,
    network(X, Y, affinity, A), A > 40.
rule_effect(gossip_spreads, set_intent(X, gossip_about, Y, 2)).

%% Restless youth seek escape
rule_likelihood(restless_seek_escape, 1).
rule_type(restless_seek_escape, volition).
rule_active(restless_seek_escape).
rule_category(restless_seek_escape, generational).
rule_source(restless_seek_escape, modern_realistic).
rule_priority(restless_seek_escape, 2).
rule_applies(restless_seek_escape, X, _Y) :-
    trait(X, restless),
    trait(X, young),
    attribute(X, self_assuredness, SA), SA < 50.
rule_effect(restless_seek_escape, set_intent(X, leave_town, self, 2)).
