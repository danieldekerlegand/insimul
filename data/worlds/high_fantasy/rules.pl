%% Insimul Volition Rules: High Fantasy
%% Source: data/worlds/high_fantasy/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules

%% --- Elves distrust those who disrespect nature ---
rule_likelihood(elves_distrust_those_who_disrespect_nature, 1).
rule_type(elves_distrust_those_who_disrespect_nature, volition).
% Elves distrust those who show disrespect for forests and living things.
rule_active(elves_distrust_those_who_disrespect_nature).
rule_category(elves_distrust_those_who_disrespect_nature, interracial_tension).
rule_source(elves_distrust_those_who_disrespect_nature, world).
rule_priority(elves_distrust_those_who_disrespect_nature, 5).
rule_applies(elves_distrust_those_who_disrespect_nature, X, Y) :-
    race(X, elf), status(Y, nature_defiler).
rule_effect(elves_distrust_those_who_disrespect_nature, set_intent(X, antagonize, Y, 5)).

%% --- Dwarves bond over shared craft ---
rule_likelihood(dwarves_bond_over_shared_craft, 1).
rule_type(dwarves_bond_over_shared_craft, volition).
% Dwarves form strong bonds with those who share their craft skills.
rule_active(dwarves_bond_over_shared_craft).
rule_category(dwarves_bond_over_shared_craft, camaraderie).
rule_source(dwarves_bond_over_shared_craft, world).
rule_priority(dwarves_bond_over_shared_craft, 4).
rule_applies(dwarves_bond_over_shared_craft, X, Y) :-
    race(X, dwarf), race(Y, dwarf), occupation(X, Occ), occupation(Y, Occ).
rule_effect(dwarves_bond_over_shared_craft, set_intent(X, befriend, Y, 4)).

%% --- Mages seek knowledge from the Arcane Academy ---
rule_likelihood(mages_seek_knowledge_from_the_arcane_academy, 1).
rule_type(mages_seek_knowledge_from_the_arcane_academy, volition).
% Mages and wizards are drawn to seek knowledge at the Arcane Academy.
rule_active(mages_seek_knowledge_from_the_arcane_academy).
rule_category(mages_seek_knowledge_from_the_arcane_academy, ambition).
rule_source(mages_seek_knowledge_from_the_arcane_academy, world).
rule_priority(mages_seek_knowledge_from_the_arcane_academy, 5).
rule_applies(mages_seek_knowledge_from_the_arcane_academy, X, _) :-
    occupation(X, wizard) ; occupation(X, archmage) ; occupation(X, enchantress).
rule_effect(mages_seek_knowledge_from_the_arcane_academy, set_intent(X, study, arcane_academy, 5)).

%% --- Humans resent elven exclusivity ---
rule_likelihood(humans_resent_elven_exclusivity, 1).
rule_type(humans_resent_elven_exclusivity, volition).
% Humans grow resentful when denied access to elven knowledge and institutions.
rule_active(humans_resent_elven_exclusivity).
rule_category(humans_resent_elven_exclusivity, interracial_tension).
rule_source(humans_resent_elven_exclusivity, world).
rule_priority(humans_resent_elven_exclusivity, 3).
rule_applies(humans_resent_elven_exclusivity, X, Y) :-
    race(X, human), race(Y, elf), status(X, denied_entry).
rule_effect(humans_resent_elven_exclusivity, set_intent(X, antagonize, Y, 3)).

%% --- Warriors protect their homeland when it is threatened ---
rule_likelihood(warriors_protect_homeland_when_threatened, 1).
rule_type(warriors_protect_homeland_when_threatened, volition).
% Warriors rise to defend their homeland when external threats emerge.
rule_active(warriors_protect_homeland_when_threatened).
rule_category(warriors_protect_homeland_when_threatened, duty).
rule_source(warriors_protect_homeland_when_threatened, world).
rule_priority(warriors_protect_homeland_when_threatened, 9).
rule_applies(warriors_protect_homeland_when_threatened, X, _) :-
    occupation(X, warrior), status(homeland, threatened).
rule_effect(warriors_protect_homeland_when_threatened, set_intent(X, defend, homeland, 9)).

%% --- Druids sense disturbances in the natural order ---
rule_likelihood(druids_sense_disturbances_in_natural_order, 1).
rule_type(druids_sense_disturbances_in_natural_order, volition).
% Druids are compelled to investigate disturbances in the natural order.
rule_active(druids_sense_disturbances_in_natural_order).
rule_category(druids_sense_disturbances_in_natural_order, guardianship).
rule_source(druids_sense_disturbances_in_natural_order, world).
rule_priority(druids_sense_disturbances_in_natural_order, 7).
rule_applies(druids_sense_disturbances_in_natural_order, X, _) :-
    occupation(X, druid), status(forest, corrupted).
rule_effect(druids_sense_disturbances_in_natural_order, set_intent(X, investigate, forest, 7)).

%% --- Half-elves seek acceptance from both races ---
rule_likelihood(half_elves_seek_acceptance_from_both_races, 1).
rule_type(half_elves_seek_acceptance_from_both_races, volition).
% Half-elves constantly seek acceptance from both elven and human communities.
rule_active(half_elves_seek_acceptance_from_both_races).
rule_category(half_elves_seek_acceptance_from_both_races, identity).
rule_source(half_elves_seek_acceptance_from_both_races, world).
rule_priority(half_elves_seek_acceptance_from_both_races, 4).
rule_applies(half_elves_seek_acceptance_from_both_races, X, Y) :-
    race(X, half_elf), (race(Y, elf) ; race(Y, human)).
rule_effect(half_elves_seek_acceptance_from_both_races, set_intent(X, befriend, Y, 4)).

%% --- Guild masters recruit promising talent ---
rule_likelihood(guild_masters_recruit_promising_talent, 1).
rule_type(guild_masters_recruit_promising_talent, volition).
% Guild masters actively recruit young adventurers with promising skills.
rule_active(guild_masters_recruit_promising_talent).
rule_category(guild_masters_recruit_promising_talent, recruitment).
rule_source(guild_masters_recruit_promising_talent, world).
rule_priority(guild_masters_recruit_promising_talent, 5).
rule_applies(guild_masters_recruit_promising_talent, X, Y) :-
    occupation(X, guild_master), trait(Y, young), trait(Y, brave).
rule_effect(guild_masters_recruit_promising_talent, set_intent(X, recruit, Y, 5)).

%% --- Honorable dwarves confront oathbreakers ---
rule_likelihood(honorable_dwarves_confront_oathbreakers, 1).
rule_type(honorable_dwarves_confront_oathbreakers, volition).
% Honorable dwarves feel compelled to confront those who break oaths.
rule_active(honorable_dwarves_confront_oathbreakers).
rule_category(honorable_dwarves_confront_oathbreakers, justice).
rule_source(honorable_dwarves_confront_oathbreakers, world).
rule_priority(honorable_dwarves_confront_oathbreakers, 8).
rule_applies(honorable_dwarves_confront_oathbreakers, X, Y) :-
    race(X, dwarf), trait(X, honorable), status(Y, oathbreaker).
rule_effect(honorable_dwarves_confront_oathbreakers, set_intent(X, confront, Y, 8)).

%% --- Ancient beings guide the younger generation ---
rule_likelihood(ancient_beings_guide_younger_generation, 1).
rule_type(ancient_beings_guide_younger_generation, volition).
% Ancient and wise beings feel responsible for guiding the younger generation.
rule_active(ancient_beings_guide_younger_generation).
rule_category(ancient_beings_guide_younger_generation, mentorship).
rule_source(ancient_beings_guide_younger_generation, world).
rule_priority(ancient_beings_guide_younger_generation, 4).
rule_applies(ancient_beings_guide_younger_generation, X, Y) :-
    trait(X, ancient), trait(X, wise), trait(Y, young).
rule_effect(ancient_beings_guide_younger_generation, set_intent(X, mentor, Y, 4)).

%% --- Ambitious enchanters seek forbidden knowledge ---
rule_likelihood(ambitious_enchanters_seek_forbidden_knowledge, 1).
rule_type(ambitious_enchanters_seek_forbidden_knowledge, volition).
% Ambitious magic users are tempted to seek forbidden or dangerous knowledge.
rule_active(ambitious_enchanters_seek_forbidden_knowledge).
rule_category(ambitious_enchanters_seek_forbidden_knowledge, temptation).
rule_source(ambitious_enchanters_seek_forbidden_knowledge, world).
rule_priority(ambitious_enchanters_seek_forbidden_knowledge, 6).
rule_applies(ambitious_enchanters_seek_forbidden_knowledge, X, _) :-
    trait(X, ambitious), (occupation(X, enchantress) ; occupation(X, wizard)).
rule_effect(ambitious_enchanters_seek_forbidden_knowledge, set_intent(X, seek, forbidden_lore, 6)).

%% --- Trade partners defend each other in disputes ---
rule_likelihood(trade_partners_defend_each_other_in_disputes, 1).
rule_type(trade_partners_defend_each_other_in_disputes, volition).
% Those with trade partnerships defend each other in political disputes.
rule_active(trade_partners_defend_each_other_in_disputes).
rule_category(trade_partners_defend_each_other_in_disputes, commerce).
rule_source(trade_partners_defend_each_other_in_disputes, world).
rule_priority(trade_partners_defend_each_other_in_disputes, 3).
rule_applies(trade_partners_defend_each_other_in_disputes, X, Y) :-
    relationship(X, Y, trade_partner), status(Y, accused).
rule_effect(trade_partners_defend_each_other_in_disputes, set_intent(X, defend, Y, 3)).
