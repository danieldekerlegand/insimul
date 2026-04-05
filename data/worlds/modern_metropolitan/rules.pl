%% Insimul Rules: Modern Metropolitan
%% Source: data/worlds/modern_metropolitan/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema follows additional-ensemble.pl format

%% --- Professional and Career Rules ---

rule_likelihood(ambitious_professionals_network_aggressively_to_advance_their_careers, 1).
rule_type(ambitious_professionals_network_aggressively_to_advance_their_careers, volition).
%% Ambitious professionals seek out networking opportunities to climb the career ladder
rule_active(ambitious_professionals_network_aggressively_to_advance_their_careers).
rule_category(ambitious_professionals_network_aggressively_to_advance_their_careers, career).
rule_source(ambitious_professionals_network_aggressively_to_advance_their_careers, metro).
rule_priority(ambitious_professionals_network_aggressively_to_advance_their_careers, 7).
rule_applies(ambitious_professionals_network_aggressively_to_advance_their_careers, X, Y) :-
    trait(X, ambitious),
    attribute(Y, business_acumen, Biz_val), Biz_val > 7.
rule_effect(ambitious_professionals_network_aggressively_to_advance_their_careers, set_intent(X, network_with, Y, 5)).

rule_likelihood(tech_industry_workers_compete_for_status_and_recognition, 1).
rule_type(tech_industry_workers_compete_for_status_and_recognition, volition).
%% Tech workers compete intensely for promotions and public recognition
rule_active(tech_industry_workers_compete_for_status_and_recognition).
rule_category(tech_industry_workers_compete_for_status_and_recognition, career).
rule_source(tech_industry_workers_compete_for_status_and_recognition, metro).
rule_priority(tech_industry_workers_compete_for_status_and_recognition, 5).
rule_applies(tech_industry_workers_compete_for_status_and_recognition, X, Y) :-
    status(X, business_leader),
    status(Y, business_leader).
rule_effect(tech_industry_workers_compete_for_status_and_recognition, set_intent(X, compete_with, Y, 4)).

%% --- Community and Social Rules ---

rule_likelihood(community_minded_residents_organize_against_gentrification, 1).
rule_type(community_minded_residents_organize_against_gentrification, volition).
%% Residents who value community push back against displacement caused by rising rents
rule_active(community_minded_residents_organize_against_gentrification).
rule_category(community_minded_residents_organize_against_gentrification, community).
rule_source(community_minded_residents_organize_against_gentrification, metro).
rule_priority(community_minded_residents_organize_against_gentrification, 8).
rule_applies(community_minded_residents_organize_against_gentrification, X, Y) :-
    trait(X, community_minded),
    status(Y, business_leader).
rule_effect(community_minded_residents_organize_against_gentrification, set_intent(X, organize_against, Y, 5)).

rule_likelihood(neighbors_build_trust_through_shared_local_experiences, 1).
rule_type(neighbors_build_trust_through_shared_local_experiences, volition).
%% Living in close proximity and sharing daily routines builds mutual trust
rule_active(neighbors_build_trust_through_shared_local_experiences).
rule_category(neighbors_build_trust_through_shared_local_experiences, community).
rule_source(neighbors_build_trust_through_shared_local_experiences, metro).
rule_priority(neighbors_build_trust_through_shared_local_experiences, 4).
rule_applies(neighbors_build_trust_through_shared_local_experiences, X, Y) :-
    relationship(X, Y, neighbors).
rule_effect(neighbors_build_trust_through_shared_local_experiences, set_intent(X, befriend, Y, 3)).

%% --- Political Rules ---

rule_likelihood(elected_officials_court_wealthy_donors_for_campaign_support, 1).
rule_type(elected_officials_court_wealthy_donors_for_campaign_support, volition).
%% Politicians maintain relationships with wealthy supporters to fund their campaigns
rule_active(elected_officials_court_wealthy_donors_for_campaign_support).
rule_category(elected_officials_court_wealthy_donors_for_campaign_support, politics).
rule_source(elected_officials_court_wealthy_donors_for_campaign_support, metro).
rule_priority(elected_officials_court_wealthy_donors_for_campaign_support, 6).
rule_applies(elected_officials_court_wealthy_donors_for_campaign_support, X, Y) :-
    status(X, elected_official),
    relationship(Y, X, donor).
rule_effect(elected_officials_court_wealthy_donors_for_campaign_support, set_intent(X, maintain_alliance, Y, 4)).

rule_likelihood(public_servants_earn_trust_by_addressing_community_concerns, 1).
rule_type(public_servants_earn_trust_by_addressing_community_concerns, volition).
%% Officials who listen to constituents build broad community support
rule_active(public_servants_earn_trust_by_addressing_community_concerns).
rule_category(public_servants_earn_trust_by_addressing_community_concerns, politics).
rule_source(public_servants_earn_trust_by_addressing_community_concerns, metro).
rule_priority(public_servants_earn_trust_by_addressing_community_concerns, 5).
rule_applies(public_servants_earn_trust_by_addressing_community_concerns, X, Y) :-
    status(X, elected_official),
    trait(Y, community_minded).
rule_effect(public_servants_earn_trust_by_addressing_community_concerns, set_intent(X, support, Y, 3)).

%% --- Economic Inequality Rules ---

rule_likelihood(wealth_disparity_breeds_resentment_between_social_classes, 1).
rule_type(wealth_disparity_breeds_resentment_between_social_classes, volition).
%% Large income gaps between residents create social tension and resentment
rule_active(wealth_disparity_breeds_resentment_between_social_classes).
rule_category(wealth_disparity_breeds_resentment_between_social_classes, inequality).
rule_source(wealth_disparity_breeds_resentment_between_social_classes, metro).
rule_priority(wealth_disparity_breeds_resentment_between_social_classes, 6).
rule_applies(wealth_disparity_breeds_resentment_between_social_classes, X, Y) :-
    status(X, freelancer),
    status(Y, business_leader).
rule_effect(wealth_disparity_breeds_resentment_between_social_classes, set_intent(X, antagonize, Y, 3)).

rule_likelihood(overworked_professionals_seek_support_from_trusted_friends, 1).
rule_type(overworked_professionals_seek_support_from_trusted_friends, volition).
%% Burnout drives professionals to lean on close friends for emotional support
rule_active(overworked_professionals_seek_support_from_trusted_friends).
rule_category(overworked_professionals_seek_support_from_trusted_friends, wellbeing).
rule_source(overworked_professionals_seek_support_from_trusted_friends, metro).
rule_priority(overworked_professionals_seek_support_from_trusted_friends, 5).
rule_applies(overworked_professionals_seek_support_from_trusted_friends, X, Y) :-
    trait(X, overworked),
    network(X, Y, friendship, Friend_val), Friend_val > 6.
rule_effect(overworked_professionals_seek_support_from_trusted_friends, set_intent(X, confide_in, Y, 4)).

%% --- Cultural and Creative Rules ---

rule_likelihood(artists_resist_commercialization_of_their_neighborhoods, 1).
rule_type(artists_resist_commercialization_of_their_neighborhoods, volition).
%% Creative residents push back when commercial interests threaten cultural spaces
rule_active(artists_resist_commercialization_of_their_neighborhoods).
rule_category(artists_resist_commercialization_of_their_neighborhoods, culture).
rule_source(artists_resist_commercialization_of_their_neighborhoods, metro).
rule_priority(artists_resist_commercialization_of_their_neighborhoods, 6).
rule_applies(artists_resist_commercialization_of_their_neighborhoods, X, _) :-
    trait(X, creative),
    trait(X, passionate).
rule_effect(artists_resist_commercialization_of_their_neighborhoods, set_intent(X, protect_culture, _, 4)).

rule_likelihood(creative_collaboration_strengthens_bonds_between_artists, 1).
rule_type(creative_collaboration_strengthens_bonds_between_artists, volition).
%% Shared creative projects deepen friendships between artistic residents
rule_active(creative_collaboration_strengthens_bonds_between_artists).
rule_category(creative_collaboration_strengthens_bonds_between_artists, culture).
rule_source(creative_collaboration_strengthens_bonds_between_artists, metro).
rule_priority(creative_collaboration_strengthens_bonds_between_artists, 4).
rule_applies(creative_collaboration_strengthens_bonds_between_artists, X, Y) :-
    trait(X, creative),
    trait(Y, creative).
rule_effect(creative_collaboration_strengthens_bonds_between_artists, set_intent(X, collaborate_with, Y, 4)).

%% --- Urban Stress Rules ---

rule_likelihood(daily_commute_stress_erodes_patience_and_social_tolerance, 1).
rule_type(daily_commute_stress_erodes_patience_and_social_tolerance, volition).
%% Long commutes and crowded transit wear down patience and increase irritability
rule_active(daily_commute_stress_erodes_patience_and_social_tolerance).
rule_category(daily_commute_stress_erodes_patience_and_social_tolerance, stress).
rule_source(daily_commute_stress_erodes_patience_and_social_tolerance, metro).
rule_priority(daily_commute_stress_erodes_patience_and_social_tolerance, 3).
rule_applies(daily_commute_stress_erodes_patience_and_social_tolerance, X, Y) :-
    status(X, professional),
    network(X, Y, friendship, Friend_val), Friend_val < 4.
rule_effect(daily_commute_stress_erodes_patience_and_social_tolerance, set_intent(X, antagonize, Y, 2)).

rule_likelihood(social_media_exposure_drives_people_to_seek_validation, 1).
rule_type(social_media_exposure_drives_people_to_seek_validation, volition).
%% Constant social media comparison pushes people to seek public approval and visibility
rule_active(social_media_exposure_drives_people_to_seek_validation).
rule_category(social_media_exposure_drives_people_to_seek_validation, social_media).
rule_source(social_media_exposure_drives_people_to_seek_validation, metro).
rule_priority(social_media_exposure_drives_people_to_seek_validation, 4).
rule_applies(social_media_exposure_drives_people_to_seek_validation, X, _) :-
    trait(X, young),
    attribute(X, self_assuredness, Self_val), Self_val < 6.
rule_effect(social_media_exposure_drives_people_to_seek_validation, set_intent(X, seek_validation, _, 3)).
