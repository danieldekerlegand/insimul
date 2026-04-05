%% Insimul Rules: Urban Fantasy -- Veilhaven
%% Source: data/worlds/urban_fantasy/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Format follows additional-ensemble.pl pattern:
%%   rule_likelihood, rule_type, rule_active, rule_category,
%%   rule_source, rule_priority, rule_applies, rule_effect

%% ─── Masquerade Rules (3) ───

rule_likelihood(supernatural_beings_avoid_using_powers_in_front_of_mundane_humans, 1).
rule_type(supernatural_beings_avoid_using_powers_in_front_of_mundane_humans, volition).
% Supernatural beings avoid using powers in front of mundane humans
rule_active(supernatural_beings_avoid_using_powers_in_front_of_mundane_humans).
rule_category(supernatural_beings_avoid_using_powers_in_front_of_mundane_humans, masquerade).
rule_source(supernatural_beings_avoid_using_powers_in_front_of_mundane_humans, urban_fantasy).
rule_priority(supernatural_beings_avoid_using_powers_in_front_of_mundane_humans, 10).
rule_applies(supernatural_beings_avoid_using_powers_in_front_of_mundane_humans, X, _) :-
    species(X, Species), Species \= human, nearby_mundane(X).
rule_effect(supernatural_beings_avoid_using_powers_in_front_of_mundane_humans, set_intent(X, conceal_nature, self, 10)).

rule_likelihood(council_members_report_masquerade_violations_to_the_council_of_shadows, 1).
rule_type(council_members_report_masquerade_violations_to_the_council_of_shadows, volition).
% Council members report masquerade violations to the council of shadows
rule_active(council_members_report_masquerade_violations_to_the_council_of_shadows).
rule_category(council_members_report_masquerade_violations_to_the_council_of_shadows, masquerade).
rule_source(council_members_report_masquerade_violations_to_the_council_of_shadows, urban_fantasy).
rule_priority(council_members_report_masquerade_violations_to_the_council_of_shadows, 8).
rule_applies(council_members_report_masquerade_violations_to_the_council_of_shadows, X, Y) :-
    status(X, council_member), witnessed_violation(X, Y).
rule_effect(council_members_report_masquerade_violations_to_the_council_of_shadows, set_intent(X, report_violation, Y, 8)).

rule_likelihood(fae_use_glamour_when_entering_mundane_areas, 1).
rule_type(fae_use_glamour_when_entering_mundane_areas, volition).
% Fae use glamour when entering mundane areas
rule_active(fae_use_glamour_when_entering_mundane_areas).
rule_category(fae_use_glamour_when_entering_mundane_areas, masquerade).
rule_source(fae_use_glamour_when_entering_mundane_areas, urban_fantasy).
rule_priority(fae_use_glamour_when_entering_mundane_areas, 9).
rule_applies(fae_use_glamour_when_entering_mundane_areas, X, _) :-
    species(X, fae), in_mundane_area(X).
rule_effect(fae_use_glamour_when_entering_mundane_areas, set_intent(X, activate_glamour, self, 9)).

%% ─── Faction Loyalty Rules (3) ───

rule_likelihood(pack_members_defend_their_alpha_when_challenged, 1).
rule_type(pack_members_defend_their_alpha_when_challenged, volition).
% Pack members defend their alpha when challenged
rule_active(pack_members_defend_their_alpha_when_challenged).
rule_category(pack_members_defend_their_alpha_when_challenged, faction_loyalty).
rule_source(pack_members_defend_their_alpha_when_challenged, urban_fantasy).
rule_priority(pack_members_defend_their_alpha_when_challenged, 9).
rule_applies(pack_members_defend_their_alpha_when_challenged, X, Y) :-
    faction(X, docklands_pack), status(Y, pack_alpha), threatened(Y).
rule_effect(pack_members_defend_their_alpha_when_challenged, set_intent(X, defend, Y, 9)).

rule_likelihood(vampires_defer_to_their_elder_in_political_matters, 1).
rule_type(vampires_defer_to_their_elder_in_political_matters, volition).
% Vampires defer to their elder in political matters
rule_active(vampires_defer_to_their_elder_in_political_matters).
rule_category(vampires_defer_to_their_elder_in_political_matters, faction_loyalty).
rule_source(vampires_defer_to_their_elder_in_political_matters, urban_fantasy).
rule_priority(vampires_defer_to_their_elder_in_political_matters, 7).
rule_applies(vampires_defer_to_their_elder_in_political_matters, X, Y) :-
    faction(X, aldermere_conclave), faction(Y, aldermere_conclave),
    generation(Y, 0), X \= Y.
rule_effect(vampires_defer_to_their_elder_in_political_matters, set_intent(X, defer_to, Y, 7)).

rule_likelihood(unseelie_fae_test_boundaries_of_the_truce_with_seelie_court, 1).
rule_type(unseelie_fae_test_boundaries_of_the_truce_with_seelie_court, volition).
% Unseelie fae test boundaries of the truce with the Seelie Court
rule_active(unseelie_fae_test_boundaries_of_the_truce_with_seelie_court).
rule_category(unseelie_fae_test_boundaries_of_the_truce_with_seelie_court, faction_loyalty).
rule_source(unseelie_fae_test_boundaries_of_the_truce_with_seelie_court, urban_fantasy).
rule_priority(unseelie_fae_test_boundaries_of_the_truce_with_seelie_court, 5).
rule_applies(unseelie_fae_test_boundaries_of_the_truce_with_seelie_court, X, Y) :-
    faction(X, unseelie_court), faction(Y, seelie_court).
rule_effect(unseelie_fae_test_boundaries_of_the_truce_with_seelie_court, set_intent(X, provoke, Y, 5)).

%% ─── Territorial Rules (3) ───

rule_likelihood(werewolves_patrol_the_docklands_to_maintain_territory, 1).
rule_type(werewolves_patrol_the_docklands_to_maintain_territory, volition).
% Werewolves patrol the docklands to maintain territory
rule_active(werewolves_patrol_the_docklands_to_maintain_territory).
rule_category(werewolves_patrol_the_docklands_to_maintain_territory, territorial).
rule_source(werewolves_patrol_the_docklands_to_maintain_territory, urban_fantasy).
rule_priority(werewolves_patrol_the_docklands_to_maintain_territory, 6).
rule_applies(werewolves_patrol_the_docklands_to_maintain_territory, X, _) :-
    faction(X, docklands_pack), location(X, veilhaven).
rule_effect(werewolves_patrol_the_docklands_to_maintain_territory, set_intent(X, patrol, docklands, 6)).

rule_likelihood(vampires_monitor_silver_heights_for_unwelcome_visitors, 1).
rule_type(vampires_monitor_silver_heights_for_unwelcome_visitors, volition).
% Vampires monitor Silver Heights for unwelcome visitors
rule_active(vampires_monitor_silver_heights_for_unwelcome_visitors).
rule_category(vampires_monitor_silver_heights_for_unwelcome_visitors, territorial).
rule_source(vampires_monitor_silver_heights_for_unwelcome_visitors, urban_fantasy).
rule_priority(vampires_monitor_silver_heights_for_unwelcome_visitors, 6).
rule_applies(vampires_monitor_silver_heights_for_unwelcome_visitors, X, Y) :-
    faction(X, aldermere_conclave), in_district(Y, silver_heights),
    \+ faction(Y, aldermere_conclave).
rule_effect(vampires_monitor_silver_heights_for_unwelcome_visitors, set_intent(X, investigate, Y, 6)).

rule_likelihood(neutral_ground_violations_trigger_immediate_collective_response, 1).
rule_type(neutral_ground_violations_trigger_immediate_collective_response, volition).
% Neutral ground violations trigger immediate collective response
rule_active(neutral_ground_violations_trigger_immediate_collective_response).
rule_category(neutral_ground_violations_trigger_immediate_collective_response, territorial).
rule_source(neutral_ground_violations_trigger_immediate_collective_response, urban_fantasy).
rule_priority(neutral_ground_violations_trigger_immediate_collective_response, 10).
rule_applies(neutral_ground_violations_trigger_immediate_collective_response, X, Y) :-
    in_neutral_zone(Y), hostile_action(Y, _).
rule_effect(neutral_ground_violations_trigger_immediate_collective_response, set_intent(X, intervene, Y, 10)).

%% ─── Supernatural Nature Rules (3) ───

rule_likelihood(werewolves_become_aggressive_near_the_full_moon, 1).
rule_type(werewolves_become_aggressive_near_the_full_moon, volition).
% Werewolves become aggressive near the full moon
rule_active(werewolves_become_aggressive_near_the_full_moon).
rule_category(werewolves_become_aggressive_near_the_full_moon, supernatural_nature).
rule_source(werewolves_become_aggressive_near_the_full_moon, urban_fantasy).
rule_priority(werewolves_become_aggressive_near_the_full_moon, 8).
rule_applies(werewolves_become_aggressive_near_the_full_moon, X, Y) :-
    species(X, werewolf), moon_phase(full), near(X, Y, 10).
rule_effect(werewolves_become_aggressive_near_the_full_moon, set_intent(X, antagonize, Y, 8)).

rule_likelihood(vampires_seek_sustenance_when_blood_reserves_are_low, 1).
rule_type(vampires_seek_sustenance_when_blood_reserves_are_low, volition).
% Vampires seek sustenance when blood reserves are low
rule_active(vampires_seek_sustenance_when_blood_reserves_are_low).
rule_category(vampires_seek_sustenance_when_blood_reserves_are_low, supernatural_nature).
rule_source(vampires_seek_sustenance_when_blood_reserves_are_low, urban_fantasy).
rule_priority(vampires_seek_sustenance_when_blood_reserves_are_low, 7).
rule_applies(vampires_seek_sustenance_when_blood_reserves_are_low, X, _) :-
    species(X, vampire), attribute(X, hunger, Hunger), Hunger > 70.
rule_effect(vampires_seek_sustenance_when_blood_reserves_are_low, set_intent(X, feed, pharmacy, 7)).

rule_likelihood(fae_are_drawn_to_locations_where_the_veil_is_thin, 1).
rule_type(fae_are_drawn_to_locations_where_the_veil_is_thin, volition).
% Fae are drawn to locations where the veil is thin
rule_active(fae_are_drawn_to_locations_where_the_veil_is_thin).
rule_category(fae_are_drawn_to_locations_where_the_veil_is_thin, supernatural_nature).
rule_source(fae_are_drawn_to_locations_where_the_veil_is_thin, urban_fantasy).
rule_priority(fae_are_drawn_to_locations_where_the_veil_is_thin, 4).
rule_applies(fae_are_drawn_to_locations_where_the_veil_is_thin, X, _) :-
    species(X, fae), veil_thin(Location).
rule_effect(fae_are_drawn_to_locations_where_the_veil_is_thin, set_intent(X, travel_to, Location, 4)).
