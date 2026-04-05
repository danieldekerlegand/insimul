%% Insimul Volition Rules: Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Format follows Ensemble volition rule pattern:
%%   rule_likelihood/2, rule_type/2, rule_active/1, rule_category/2,
%%   rule_source/2, rule_priority/2, rule_applies/3, rule_effect/2

%% ─── Fear and Terror (3 rules) ───

rule_likelihood(fear_drives_submission_to_undead_lords, 1).
rule_type(fear_drives_submission_to_undead_lords, volition).
% Characters with low willpower submit to undead lords when fear is high.
rule_active(fear_drives_submission_to_undead_lords).
rule_category(fear_drives_submission_to_undead_lords, fear_terror).
rule_source(fear_drives_submission_to_undead_lords, dark_fantasy).
rule_priority(fear_drives_submission_to_undead_lords, 7).
rule_applies(fear_drives_submission_to_undead_lords, X, Y) :-
    attribute(X, willpower, W), W < 40,
    status(Y, lich_lord).
rule_effect(fear_drives_submission_to_undead_lords, set_intent(X, submit_to, Y, 7)).

rule_likelihood(brave_acts_weaken_nearby_undead, 1).
rule_type(brave_acts_weaken_nearby_undead, volition).
% Characters with high willpower inspire resistance and weaken undead influence.
rule_active(brave_acts_weaken_nearby_undead).
rule_category(brave_acts_weaken_nearby_undead, fear_terror).
rule_source(brave_acts_weaken_nearby_undead, dark_fantasy).
rule_priority(brave_acts_weaken_nearby_undead, 6).
rule_applies(brave_acts_weaken_nearby_undead, X, Y) :-
    attribute(X, willpower, W), W > 75,
    attribute(Y, corruption, C), C > 50.
rule_effect(brave_acts_weaken_nearby_undead, set_intent(X, defy, Y, 6)).

rule_likelihood(terror_spreads_among_the_weak_willed, 1).
rule_type(terror_spreads_among_the_weak_willed, volition).
% Panic is contagious -- frightened characters spread fear to nearby allies.
rule_active(terror_spreads_among_the_weak_willed).
rule_category(terror_spreads_among_the_weak_willed, fear_terror).
rule_source(terror_spreads_among_the_weak_willed, dark_fantasy).
rule_priority(terror_spreads_among_the_weak_willed, 5).
rule_applies(terror_spreads_among_the_weak_willed, X, Y) :-
    attribute(X, willpower, Wx), Wx < 40,
    attribute(Y, willpower, Wy), Wy < 60,
    location(X, Loc), location(Y, Loc).
rule_effect(terror_spreads_among_the_weak_willed, set_intent(X, panic_with, Y, 4)).

%% ─── Corruption and Dark Magic (4 rules) ───

rule_likelihood(corruption_tempts_the_desperate, 1).
rule_type(corruption_tempts_the_desperate, volition).
% Desperate characters seek dark magic when conventional means fail.
rule_active(corruption_tempts_the_desperate).
rule_category(corruption_tempts_the_desperate, corruption).
rule_source(corruption_tempts_the_desperate, dark_fantasy).
rule_priority(corruption_tempts_the_desperate, 8).
rule_applies(corruption_tempts_the_desperate, X, Y) :-
    trait(X, reckless),
    attribute(Y, dark_magic, DM), DM > 50.
rule_effect(corruption_tempts_the_desperate, set_intent(X, seek_forbidden_knowledge, Y, 6)).

rule_likelihood(high_corruption_erodes_empathy, 1).
rule_type(high_corruption_erodes_empathy, volition).
% Characters above 50 corruption begin treating allies as expendable.
rule_active(high_corruption_erodes_empathy).
rule_category(high_corruption_erodes_empathy, corruption).
rule_source(high_corruption_erodes_empathy, dark_fantasy).
rule_priority(high_corruption_erodes_empathy, 7).
rule_applies(high_corruption_erodes_empathy, X, Y) :-
    attribute(X, corruption, C), C > 50,
    \+ status(Y, lich_lord).
rule_effect(high_corruption_erodes_empathy, set_intent(X, exploit, Y, 5)).

rule_likelihood(necromancers_attract_undead_attention, 1).
rule_type(necromancers_attract_undead_attention, volition).
% Practicing necromancy draws the gaze of undead lords seeking new servants.
rule_active(necromancers_attract_undead_attention).
rule_category(necromancers_attract_undead_attention, corruption).
rule_source(necromancers_attract_undead_attention, dark_fantasy).
rule_priority(necromancers_attract_undead_attention, 6).
rule_applies(necromancers_attract_undead_attention, X, Y) :-
    status(X, secret_necromancer),
    status(Y, lich_lord).
rule_effect(necromancers_attract_undead_attention, set_intent(Y, recruit, X, 7)).

rule_likelihood(corruption_resisted_by_the_pure, 1).
rule_type(corruption_resisted_by_the_pure, volition).
% Characters with zero corruption actively oppose those who wield dark magic.
rule_active(corruption_resisted_by_the_pure).
rule_category(corruption_resisted_by_the_pure, corruption).
rule_source(corruption_resisted_by_the_pure, dark_fantasy).
rule_priority(corruption_resisted_by_the_pure, 5).
rule_applies(corruption_resisted_by_the_pure, X, Y) :-
    attribute(X, corruption, 0),
    attribute(Y, dark_magic, DM), DM > 30.
rule_effect(corruption_resisted_by_the_pure, set_intent(X, confront, Y, 4)).

%% ─── Desperation and Survival (3 rules) ───

rule_likelihood(desperate_leaders_make_dark_bargains, 1).
rule_type(desperate_leaders_make_dark_bargains, volition).
% Leaders under siege may negotiate with undead lords to buy time for their people.
rule_active(desperate_leaders_make_dark_bargains).
rule_category(desperate_leaders_make_dark_bargains, desperation).
rule_source(desperate_leaders_make_dark_bargains, dark_fantasy).
rule_priority(desperate_leaders_make_dark_bargains, 9).
rule_applies(desperate_leaders_make_dark_bargains, X, Y) :-
    attribute(X, leadership, L), L > 60,
    status(Y, lich_lord).
rule_effect(desperate_leaders_make_dark_bargains, set_intent(X, negotiate_with, Y, 8)).

rule_likelihood(survivors_band_together_against_undead, 1).
rule_type(survivors_band_together_against_undead, volition).
% Shared danger forges bonds between otherwise hostile characters.
rule_active(survivors_band_together_against_undead).
rule_category(survivors_band_together_against_undead, desperation).
rule_source(survivors_band_together_against_undead, dark_fantasy).
rule_priority(survivors_band_together_against_undead, 5).
rule_applies(survivors_band_together_against_undead, X, Y) :-
    alive(X), alive(Y),
    X \= Y,
    location(X, Loc), location(Y, Loc),
    attribute(X, corruption, Cx), Cx < 50,
    attribute(Y, corruption, Cy), Cy < 50.
rule_effect(survivors_band_together_against_undead, set_intent(X, ally_with, Y, 4)).

rule_likelihood(the_grieving_seek_necromantic_reunion, 1).
rule_type(the_grieving_seek_necromantic_reunion, volition).
% Those who have lost loved ones are tempted to use necromancy to speak with the dead.
rule_active(the_grieving_seek_necromantic_reunion).
rule_category(the_grieving_seek_necromantic_reunion, desperation).
rule_source(the_grieving_seek_necromantic_reunion, dark_fantasy).
rule_priority(the_grieving_seek_necromantic_reunion, 7).
rule_applies(the_grieving_seek_necromantic_reunion, X, Y) :-
    relationship(X, Y, grieving_spouse),
    \+ alive(Y).
rule_effect(the_grieving_seek_necromantic_reunion, set_intent(X, commune_with_dead, Y, 6)).

%% ─── Duty and Faith (2 rules) ───

rule_likelihood(clergy_compelled_to_purify_the_corrupted, 1).
rule_type(clergy_compelled_to_purify_the_corrupted, volition).
% Religious figures feel obligated to cleanse corruption from allies and foes alike.
rule_active(clergy_compelled_to_purify_the_corrupted).
rule_category(clergy_compelled_to_purify_the_corrupted, duty_faith).
rule_source(clergy_compelled_to_purify_the_corrupted, dark_fantasy).
rule_priority(clergy_compelled_to_purify_the_corrupted, 6).
rule_applies(clergy_compelled_to_purify_the_corrupted, X, Y) :-
    attribute(X, faith, F), F > 60,
    attribute(Y, corruption, C), C > 30.
rule_effect(clergy_compelled_to_purify_the_corrupted, set_intent(X, purify, Y, 5)).

rule_likelihood(exorcists_hunt_bound_spirits, 1).
rule_type(exorcists_hunt_bound_spirits, volition).
% Exorcists are drawn to locations where spirits are trapped, seeking to free them.
rule_active(exorcists_hunt_bound_spirits).
rule_category(exorcists_hunt_bound_spirits, duty_faith).
rule_source(exorcists_hunt_bound_spirits, dark_fantasy).
rule_priority(exorcists_hunt_bound_spirits, 6).
rule_applies(exorcists_hunt_bound_spirits, X, Y) :-
    status(X, exorcist),
    status(Y, bound_spirit).
rule_effect(exorcists_hunt_bound_spirits, set_intent(X, exorcise, Y, 6)).
