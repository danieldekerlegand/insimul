%% Insimul Actions: Modern Metropolitan
%% Source: data/worlds/modern_metropolitan/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema follows base_actions.pl format

%% network_at_event
%% Attend a networking event to make professional connections and exchange business cards
%% Type: social / career

action(network_at_event, 'network_at_event', social, 8).
action_difficulty(network_at_event, 0.3).
action_duration(network_at_event, 3).
action_category(network_at_event, career).
action_verb(network_at_event, past, 'networked at an event with').
action_verb(network_at_event, present, 'networks at an event with').
action_target_type(network_at_event, other).
action_requires_target(network_at_event).
action_range(network_at_event, 10).
action_effect(network_at_event, (assert(professional_contact(Actor, Target)))).
can_perform(Actor, network_at_event, Target) :-
    near(Actor, Target, 10).

%% commute_by_subway
%% Take the subway to travel between districts of Metro City
%% Type: movement / transit

action(commute_by_subway, 'commute_by_subway', movement, 3).
action_difficulty(commute_by_subway, 0.1).
action_duration(commute_by_subway, 1).
action_category(commute_by_subway, transit).
action_verb(commute_by_subway, past, 'commuted by subway').
action_verb(commute_by_subway, present, 'commutes by subway').
action_target_type(commute_by_subway, none).
action_prerequisite(commute_by_subway, (at_location(Actor, lot_mm_18))).
action_effect(commute_by_subway, (assert(status(Actor, commuting)))).
can_perform(Actor, commute_by_subway, _) :-
    at_location(Actor, lot_mm_18).

%% work_at_coworking
%% Spend a productive work session at HiveSpace Co-Working
%% Type: work / professional

action(work_at_coworking, 'work_at_coworking', work, 5).
action_difficulty(work_at_coworking, 0.2).
action_duration(work_at_coworking, 4).
action_category(work_at_coworking, professional).
action_verb(work_at_coworking, past, 'worked at the co-working space').
action_verb(work_at_coworking, present, 'works at the co-working space').
action_target_type(work_at_coworking, none).
action_prerequisite(work_at_coworking, (at_location(Actor, lot_mm_6))).
action_effect(work_at_coworking, (assert(status(Actor, productive)))).
can_perform(Actor, work_at_coworking, _) :-
    at_location(Actor, lot_mm_6).

%% attend_city_council
%% Attend a city council meeting at Metro City Hall to voice community concerns
%% Type: social / civic

action(attend_city_council, 'attend_city_council', social, 5).
action_difficulty(attend_city_council, 0.2).
action_duration(attend_city_council, 3).
action_category(attend_city_council, civic).
action_verb(attend_city_council, past, 'attended city council').
action_verb(attend_city_council, present, 'attends city council').
action_target_type(attend_city_council, none).
action_prerequisite(attend_city_council, (at_location(Actor, lot_mm_8))).
action_effect(attend_city_council, (assert(status(Actor, civically_engaged)))).
can_perform(Actor, attend_city_council, _) :-
    at_location(Actor, lot_mm_8).

%% create_artwork
%% Create a painting, sketch, or installation at Canvas Studio
%% Type: crafting / art

action(create_artwork, 'create_artwork', crafting, 8).
action_difficulty(create_artwork, 0.4).
action_duration(create_artwork, 4).
action_category(create_artwork, art).
action_verb(create_artwork, past, 'created artwork').
action_verb(create_artwork, present, 'creates artwork').
action_target_type(create_artwork, none).
action_prerequisite(create_artwork, (at_location(Actor, lot_mm_12))).
action_effect(create_artwork, (assert(crafted(Actor, artwork)))).
can_perform(Actor, create_artwork, _) :-
    at_location(Actor, lot_mm_12),
    trait(Actor, creative).

%% grab_coffee
%% Buy a coffee and chat with regulars at Daily Grind Coffee
%% Type: social / leisure

action(grab_coffee, 'grab_coffee', social, 2).
action_difficulty(grab_coffee, 0.1).
action_duration(grab_coffee, 1).
action_category(grab_coffee, leisure).
action_verb(grab_coffee, past, 'grabbed coffee').
action_verb(grab_coffee, present, 'grabs coffee').
action_target_type(grab_coffee, none).
action_prerequisite(grab_coffee, (at_location(Actor, lot_mm_5))).
action_effect(grab_coffee, (assert(status(Actor, caffeinated)))).
can_perform(Actor, grab_coffee, _) :-
    at_location(Actor, lot_mm_5).

%% pitch_to_investor
%% Deliver a business pitch to a potential investor at a professional venue
%% Type: social / business

action(pitch_to_investor, 'pitch_to_investor', social, 12).
action_difficulty(pitch_to_investor, 0.6).
action_duration(pitch_to_investor, 2).
action_category(pitch_to_investor, business).
action_verb(pitch_to_investor, past, 'pitched to').
action_verb(pitch_to_investor, present, 'pitches to').
action_target_type(pitch_to_investor, other).
action_requires_target(pitch_to_investor).
action_range(pitch_to_investor, 5).
action_effect(pitch_to_investor, (assert(pitched_to(Actor, Target)))).
can_perform(Actor, pitch_to_investor, Target) :-
    near(Actor, Target, 5),
    attribute(Actor, self_assuredness, Self_val), Self_val > 4.

%% attend_yoga_class
%% Take a yoga or fitness class at Yoga Flow Studio for stress relief
%% Type: self_care / fitness

action(attend_yoga_class, 'attend_yoga_class', self_care, 4).
action_difficulty(attend_yoga_class, 0.2).
action_duration(attend_yoga_class, 2).
action_category(attend_yoga_class, fitness).
action_verb(attend_yoga_class, past, 'attended a yoga class').
action_verb(attend_yoga_class, present, 'attends a yoga class').
action_target_type(attend_yoga_class, none).
action_prerequisite(attend_yoga_class, (at_location(Actor, lot_mm_25))).
action_effect(attend_yoga_class, (assert(status(Actor, relaxed)))).
can_perform(Actor, attend_yoga_class, _) :-
    at_location(Actor, lot_mm_25).

%% browse_farmers_market
%% Shop for fresh produce and artisan goods at the Riverside Farmers Market
%% Type: social / shopping

action(browse_farmers_market, 'browse_farmers_market', social, 3).
action_difficulty(browse_farmers_market, 0.1).
action_duration(browse_farmers_market, 2).
action_category(browse_farmers_market, shopping).
action_verb(browse_farmers_market, past, 'browsed the farmers market').
action_verb(browse_farmers_market, present, 'browses the farmers market').
action_target_type(browse_farmers_market, none).
action_prerequisite(browse_farmers_market, (at_location(Actor, lot_mm_17))).
action_effect(browse_farmers_market, (assert(status(Actor, shopping)))).
can_perform(Actor, browse_farmers_market, _) :-
    at_location(Actor, lot_mm_17).

%% attend_live_show
%% Watch a live music performance at Vinyl Underground
%% Type: social / entertainment

action(attend_live_show, 'attend_live_show', social, 5).
action_difficulty(attend_live_show, 0.1).
action_duration(attend_live_show, 3).
action_category(attend_live_show, entertainment).
action_verb(attend_live_show, past, 'attended a live show').
action_verb(attend_live_show, present, 'attends a live show').
action_target_type(attend_live_show, none).
action_prerequisite(attend_live_show, (at_location(Actor, lot_mm_13))).
action_effect(attend_live_show, (assert(status(Actor, entertained)))).
can_perform(Actor, attend_live_show, _) :-
    at_location(Actor, lot_mm_13).

%% study_at_library
%% Research and study at Metro Central Library
%% Type: education / research

action(study_at_library, 'study_at_library', education, 5).
action_difficulty(study_at_library, 0.2).
action_duration(study_at_library, 3).
action_category(study_at_library, research).
action_verb(study_at_library, past, 'studied at the library').
action_verb(study_at_library, present, 'studies at the library').
action_target_type(study_at_library, none).
action_prerequisite(study_at_library, (at_location(Actor, lot_mm_7))).
action_effect(study_at_library, (assert(studied(Actor, research)))).
can_perform(Actor, study_at_library, _) :-
    at_location(Actor, lot_mm_7).

%% organize_community_event
%% Plan and host a community event in Riverside Park to bring neighbors together
%% Type: social / civic

action(organize_community_event, 'organize_community_event', social, 10).
action_difficulty(organize_community_event, 0.5).
action_duration(organize_community_event, 6).
action_category(organize_community_event, civic).
action_verb(organize_community_event, past, 'organized a community event').
action_verb(organize_community_event, present, 'organizes a community event').
action_target_type(organize_community_event, none).
action_prerequisite(organize_community_event, (at_location(Actor, lot_mm_15))).
action_effect(organize_community_event, (assert(event(community_gathering, Actor)))).
can_perform(Actor, organize_community_event, _) :-
    at_location(Actor, lot_mm_15),
    trait(Actor, community_minded).
