%% Insimul Rules: Historical Victorian
%% Source: data/worlds/historical_victorian/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition style):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% --- Class Deference ---
rule_likelihood(lower_classes_defer_to_upper_classes_in_public_encounters, 3).
rule_type(lower_classes_defer_to_upper_classes_in_public_encounters, volition).
%% Lower classes defer to upper classes in public encounters.
rule_active(lower_classes_defer_to_upper_classes_in_public_encounters).
rule_category(lower_classes_defer_to_upper_classes_in_public_encounters, social_hierarchy).
rule_source(lower_classes_defer_to_upper_classes_in_public_encounters, victorian).
rule_priority(lower_classes_defer_to_upper_classes_in_public_encounters, 8).
rule_applies(lower_classes_defer_to_upper_classes_in_public_encounters, X, Y) :-
    status(X, Status), member(Status, [street_urchin, boarding_house_keeper, union_organizer, chimney_sweep_master]),
    status(Y, UpperStatus), member(UpperStatus, [landowner, industrialist, society_matriarch, heir]).
rule_effect(lower_classes_defer_to_upper_classes_in_public_encounters, set_intent(X, defer_to, Y, 3)).

%% --- Scandal Avoidance ---
rule_likelihood(people_avoid_scandal_by_concealing_improper_associations, 2).
rule_type(people_avoid_scandal_by_concealing_improper_associations, volition).
%% People avoid scandal by concealing improper associations.
rule_active(people_avoid_scandal_by_concealing_improper_associations).
rule_category(people_avoid_scandal_by_concealing_improper_associations, propriety).
rule_source(people_avoid_scandal_by_concealing_improper_associations, victorian).
rule_priority(people_avoid_scandal_by_concealing_improper_associations, 7).
rule_applies(people_avoid_scandal_by_concealing_improper_associations, X, Y) :-
    attribute(X, propriety, P), P > 60,
    relationship(X, Y, secret_ally).
rule_effect(people_avoid_scandal_by_concealing_improper_associations, set_intent(X, conceal_relationship, Y, 2)).

%% --- Industrial Rivalry ---
rule_likelihood(factory_owners_undermine_competitors_to_gain_market_share, 2).
rule_type(factory_owners_undermine_competitors_to_gain_market_share, volition).
%% Factory owners undermine competitors to gain market share.
rule_active(factory_owners_undermine_competitors_to_gain_market_share).
rule_category(factory_owners_undermine_competitors_to_gain_market_share, economic_competition).
rule_source(factory_owners_undermine_competitors_to_gain_market_share, victorian).
rule_priority(factory_owners_undermine_competitors_to_gain_market_share, 6).
rule_applies(factory_owners_undermine_competitors_to_gain_market_share, X, Y) :-
    status(X, factory_owner),
    relationship(X, Y, business_rival).
rule_effect(factory_owners_undermine_competitors_to_gain_market_share, set_intent(X, undermine, Y, 2)).

%% --- Charitable Obligation ---
rule_likelihood(wealthy_individuals_feel_obliged_to_perform_visible_charity, 2).
rule_type(wealthy_individuals_feel_obliged_to_perform_visible_charity, volition).
%% Wealthy individuals feel obliged to perform visible charity.
rule_active(wealthy_individuals_feel_obliged_to_perform_visible_charity).
rule_category(wealthy_individuals_feel_obliged_to_perform_visible_charity, propriety).
rule_source(wealthy_individuals_feel_obliged_to_perform_visible_charity, victorian).
rule_priority(wealthy_individuals_feel_obliged_to_perform_visible_charity, 5).
rule_applies(wealthy_individuals_feel_obliged_to_perform_visible_charity, X, _Y) :-
    attribute(X, propriety, P), P > 70,
    status(X, Status), member(Status, [landowner, society_matriarch, industrialist]).
rule_effect(wealthy_individuals_feel_obliged_to_perform_visible_charity, set_intent(X, perform_charity, public, 2)).

%% --- Servant Loyalty ---
rule_likelihood(servants_remain_loyal_to_their_household_above_personal_interest, 2).
rule_type(servants_remain_loyal_to_their_household_above_personal_interest, volition).
%% Servants remain loyal to their household above personal interest.
rule_active(servants_remain_loyal_to_their_household_above_personal_interest).
rule_category(servants_remain_loyal_to_their_household_above_personal_interest, service).
rule_source(servants_remain_loyal_to_their_household_above_personal_interest, victorian).
rule_priority(servants_remain_loyal_to_their_household_above_personal_interest, 7).
rule_applies(servants_remain_loyal_to_their_household_above_personal_interest, X, Y) :-
    relationship(X, Y, serves),
    trait(X, loyal).
rule_effect(servants_remain_loyal_to_their_household_above_personal_interest, set_intent(X, protect, Y, 2)).

%% --- Union Solidarity ---
rule_likelihood(union_workers_support_each_other_against_factory_owners, 2).
rule_type(union_workers_support_each_other_against_factory_owners, volition).
%% Union workers support each other against factory owners.
rule_active(union_workers_support_each_other_against_factory_owners).
rule_category(union_workers_support_each_other_against_factory_owners, labour).
rule_source(union_workers_support_each_other_against_factory_owners, victorian).
rule_priority(union_workers_support_each_other_against_factory_owners, 6).
rule_applies(union_workers_support_each_other_against_factory_owners, X, Y) :-
    status(X, union_organizer),
    status(Y, factory_owner).
rule_effect(union_workers_support_each_other_against_factory_owners, set_intent(X, oppose, Y, 2)).

%% --- Matchmaking Pressure ---
rule_likelihood(mothers_pressure_unmarried_daughters_toward_advantageous_matches, 3).
rule_type(mothers_pressure_unmarried_daughters_toward_advantageous_matches, volition).
%% Mothers pressure unmarried daughters toward advantageous matches.
rule_active(mothers_pressure_unmarried_daughters_toward_advantageous_matches).
rule_category(mothers_pressure_unmarried_daughters_toward_advantageous_matches, social_hierarchy).
rule_source(mothers_pressure_unmarried_daughters_toward_advantageous_matches, victorian).
rule_priority(mothers_pressure_unmarried_daughters_toward_advantageous_matches, 7).
rule_applies(mothers_pressure_unmarried_daughters_toward_advantageous_matches, X, Y) :-
    trait(X, female), status(X, society_matriarch),
    trait(Y, female), trait(Y, young).
rule_effect(mothers_pressure_unmarried_daughters_toward_advantageous_matches, set_intent(X, pressure_marriage, Y, 3)).

%% --- Debt Shame ---
rule_likelihood(gentlemen_conceal_debts_to_preserve_social_standing, 2).
rule_type(gentlemen_conceal_debts_to_preserve_social_standing, volition).
%% Gentlemen conceal debts to preserve social standing.
rule_active(gentlemen_conceal_debts_to_preserve_social_standing).
rule_category(gentlemen_conceal_debts_to_preserve_social_standing, propriety).
rule_source(gentlemen_conceal_debts_to_preserve_social_standing, victorian).
rule_priority(gentlemen_conceal_debts_to_preserve_social_standing, 6).
rule_applies(gentlemen_conceal_debts_to_preserve_social_standing, X, _Y) :-
    trait(X, indebted),
    trait(X, male), status(X, heir).
rule_effect(gentlemen_conceal_debts_to_preserve_social_standing, set_intent(X, conceal_debt, public, 2)).

%% --- Religious Duty ---
rule_likelihood(clergy_intervene_when_they_witness_moral_failings, 1).
rule_type(clergy_intervene_when_they_witness_moral_failings, volition).
%% Clergy intervene when they witness moral failings.
rule_active(clergy_intervene_when_they_witness_moral_failings).
rule_category(clergy_intervene_when_they_witness_moral_failings, morality).
rule_source(clergy_intervene_when_they_witness_moral_failings, victorian).
rule_priority(clergy_intervene_when_they_witness_moral_failings, 5).
rule_applies(clergy_intervene_when_they_witness_moral_failings, X, Y) :-
    status(X, clergyman),
    attribute(Y, propriety, P), P < 40.
rule_effect(clergy_intervene_when_they_witness_moral_failings, set_intent(X, admonish, Y, 1)).

%% --- Investigative Drive ---
rule_likelihood(detectives_pursue_suspects_who_exhibit_suspicious_behaviour, 2).
rule_type(detectives_pursue_suspects_who_exhibit_suspicious_behaviour, volition).
%% Detectives pursue suspects who exhibit suspicious behaviour.
rule_active(detectives_pursue_suspects_who_exhibit_suspicious_behaviour).
rule_category(detectives_pursue_suspects_who_exhibit_suspicious_behaviour, law_enforcement).
rule_source(detectives_pursue_suspects_who_exhibit_suspicious_behaviour, victorian).
rule_priority(detectives_pursue_suspects_who_exhibit_suspicious_behaviour, 6).
rule_applies(detectives_pursue_suspects_who_exhibit_suspicious_behaviour, X, Y) :-
    status(X, police_detective),
    attribute(Y, cunningness, C), C > 70.
rule_effect(detectives_pursue_suspects_who_exhibit_suspicious_behaviour, set_intent(X, investigate, Y, 2)).

%% --- Cross-Class Sympathy ---
rule_likelihood(educated_elites_sometimes_sympathize_with_workers_they_observe_suffering, 1).
rule_type(educated_elites_sometimes_sympathize_with_workers_they_observe_suffering, volition).
%% Educated elites sometimes sympathize with workers they observe suffering.
rule_active(educated_elites_sometimes_sympathize_with_workers_they_observe_suffering).
rule_category(educated_elites_sometimes_sympathize_with_workers_they_observe_suffering, social_hierarchy).
rule_source(educated_elites_sometimes_sympathize_with_workers_they_observe_suffering, victorian).
rule_priority(educated_elites_sometimes_sympathize_with_workers_they_observe_suffering, 4).
rule_applies(educated_elites_sometimes_sympathize_with_workers_they_observe_suffering, X, Y) :-
    trait(X, educated), trait(X, sympathetic),
    status(Y, union_organizer).
rule_effect(educated_elites_sometimes_sympathize_with_workers_they_observe_suffering, set_intent(X, support, Y, 1)).

%% --- Self-Made Ambition ---
rule_likelihood(self_made_industrialists_seek_to_acquire_aristocratic_respectability, 2).
rule_type(self_made_industrialists_seek_to_acquire_aristocratic_respectability, volition).
%% Self-made industrialists seek to acquire aristocratic respectability.
rule_active(self_made_industrialists_seek_to_acquire_aristocratic_respectability).
rule_category(self_made_industrialists_seek_to_acquire_aristocratic_respectability, social_hierarchy).
rule_source(self_made_industrialists_seek_to_acquire_aristocratic_respectability, victorian).
rule_priority(self_made_industrialists_seek_to_acquire_aristocratic_respectability, 5).
rule_applies(self_made_industrialists_seek_to_acquire_aristocratic_respectability, X, Y) :-
    trait(X, self_made), trait(X, ambitious),
    trait(Y, aristocratic).
rule_effect(self_made_industrialists_seek_to_acquire_aristocratic_respectability, set_intent(X, curry_favour, Y, 2)).
