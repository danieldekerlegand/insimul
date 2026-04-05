%% Insimul Actions: Modern Realistic
%% Source: data/worlds/modern_realistic/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema follows base_actions.pl format

%% order_coffee -- Get a drink at a coffee shop
action(order_coffee, 'order_coffee', social, 0).
action_difficulty(order_coffee, 0.1).
action_duration(order_coffee, 1).
action_category(order_coffee, social).
action_verb(order_coffee, past, 'ordered coffee').
action_verb(order_coffee, present, 'orders coffee').
action_target_type(order_coffee, self).
action_range(order_coffee, 5).
action_prerequisite(order_coffee, (at_location(Actor, cafe))).
action_prerequisite(order_coffee, (gold(Actor, G), G >= 5)).
action_effect(order_coffee, (assert(has_item(Actor, coffee_to_go, 1)))).
action_effect(order_coffee, (modify_gold(Actor, -5))).
can_perform(Actor, order_coffee, _Target) :-
    at_location(Actor, cafe),
    gold(Actor, G), G >= 5.

%% apply_for_job -- Submit a job application
action(apply_for_job, 'apply_for_job', career, 2).
action_difficulty(apply_for_job, 0.3).
action_duration(apply_for_job, 2).
action_category(apply_for_job, career).
action_verb(apply_for_job, past, 'applied for a job').
action_verb(apply_for_job, present, 'applies for a job').
action_target_type(apply_for_job, self).
action_range(apply_for_job, 5).
action_prerequisite(apply_for_job, (has_item(Actor, resume_mr, _))).
action_effect(apply_for_job, (assert(event(Actor, job_applied)))).
can_perform(Actor, apply_for_job, _Target) :-
    has_item(Actor, resume_mr, _).

%% take_bus -- Ride public transit to another district
action(take_bus, 'take_bus', transport, 0).
action_difficulty(take_bus, 0.1).
action_duration(take_bus, 1).
action_category(take_bus, transport).
action_verb(take_bus, past, 'took the bus').
action_verb(take_bus, present, 'takes the bus').
action_target_type(take_bus, self).
action_range(take_bus, 50).
action_prerequisite(take_bus, (has_item(Actor, bus_pass, _))).
action_effect(take_bus, (assert(event(Actor, traveled)))).
can_perform(Actor, take_bus, _Target) :-
    has_item(Actor, bus_pass, _).

%% attend_yoga -- Participate in a yoga class
action(attend_yoga, 'attend_yoga', fitness, 1).
action_difficulty(attend_yoga, 0.2).
action_duration(attend_yoga, 2).
action_category(attend_yoga, wellness).
action_verb(attend_yoga, past, 'attended yoga').
action_verb(attend_yoga, present, 'attends yoga').
action_target_type(attend_yoga, self).
action_range(attend_yoga, 5).
action_prerequisite(attend_yoga, (at_location(Actor, yoga_studio))).
action_effect(attend_yoga, (assert(status(Actor, relaxed)))).
can_perform(Actor, attend_yoga, _Target) :-
    at_location(Actor, yoga_studio).

%% grocery_shop -- Buy groceries at the market
action(grocery_shop, 'grocery_shop', errand, 0).
action_difficulty(grocery_shop, 0.1).
action_duration(grocery_shop, 1).
action_category(grocery_shop, household).
action_verb(grocery_shop, past, 'bought groceries').
action_verb(grocery_shop, present, 'buys groceries').
action_target_type(grocery_shop, self).
action_range(grocery_shop, 5).
action_prerequisite(grocery_shop, (at_location(Actor, market))).
action_prerequisite(grocery_shop, (gold(Actor, G), G >= 35)).
action_effect(grocery_shop, (assert(has_item(Actor, grocery_bag, 1)))).
action_effect(grocery_shop, (modify_gold(Actor, -35))).
can_perform(Actor, grocery_shop, _Target) :-
    at_location(Actor, market),
    gold(Actor, G), G >= 35.

%% check_social_media -- Browse social media for news and gossip
action(check_social_media, 'check_social_media', social, 0).
action_difficulty(check_social_media, 0.1).
action_duration(check_social_media, 1).
action_category(check_social_media, technology).
action_verb(check_social_media, past, 'checked social media').
action_verb(check_social_media, present, 'checks social media').
action_target_type(check_social_media, self).
action_range(check_social_media, 0).
action_prerequisite(check_social_media, (has_item(Actor, smartphone_mr, _))).
action_effect(check_social_media, (assert(event(Actor, browsed_social_media)))).
can_perform(Actor, check_social_media, _Target) :-
    has_item(Actor, smartphone_mr, _).

%% volunteer -- Help out at the community center
action(volunteer_at_center, 'volunteer_at_center', social, 0).
action_difficulty(volunteer_at_center, 0.1).
action_duration(volunteer_at_center, 3).
action_category(volunteer_at_center, community).
action_verb(volunteer_at_center, past, 'volunteered').
action_verb(volunteer_at_center, present, 'volunteers').
action_target_type(volunteer_at_center, self).
action_range(volunteer_at_center, 5).
action_prerequisite(volunteer_at_center, (at_location(Actor, community_center))).
action_effect(volunteer_at_center, (assert(status(Actor, helpful)))).
can_perform(Actor, volunteer_at_center, _Target) :-
    at_location(Actor, community_center).

%% repair_vehicle -- Fix a car at the auto shop
action(repair_vehicle, 'repair_vehicle', crafting, 3).
action_difficulty(repair_vehicle, 0.4).
action_duration(repair_vehicle, 3).
action_category(repair_vehicle, mechanical).
action_verb(repair_vehicle, past, 'repaired a vehicle').
action_verb(repair_vehicle, present, 'repairs a vehicle').
action_target_type(repair_vehicle, self).
action_range(repair_vehicle, 5).
action_prerequisite(repair_vehicle, (at_location(Actor, auto_shop))).
action_prerequisite(repair_vehicle, (has_item(Actor, toolbox_mr, _))).
action_effect(repair_vehicle, (assert(event(Actor, vehicle_repaired)))).
can_perform(Actor, repair_vehicle, _Target) :-
    at_location(Actor, auto_shop),
    has_item(Actor, toolbox_mr, _).

%% film_footage -- Record video for a project
action(film_footage, 'film_footage', creative, 1).
action_difficulty(film_footage, 0.3).
action_duration(film_footage, 2).
action_category(film_footage, creative).
action_verb(film_footage, past, 'filmed footage').
action_verb(film_footage, present, 'films footage').
action_target_type(film_footage, self).
action_range(film_footage, 10).
action_prerequisite(film_footage, (has_item(Actor, camera_mr, _))).
action_effect(film_footage, (assert(event(Actor, footage_recorded)))).
can_perform(Actor, film_footage, _Target) :-
    has_item(Actor, camera_mr, _).

%% study_at_library -- Research or study at the public library
action(study_at_library, 'study_at_library', education, 0).
action_difficulty(study_at_library, 0.2).
action_duration(study_at_library, 3).
action_category(study_at_library, education).
action_verb(study_at_library, past, 'studied').
action_verb(study_at_library, present, 'studies').
action_target_type(study_at_library, self).
action_range(study_at_library, 5).
action_prerequisite(study_at_library, (at_location(Actor, library))).
action_effect(study_at_library, (assert(status(Actor, studied)))).
can_perform(Actor, study_at_library, _Target) :-
    at_location(Actor, library).

%% paint_artwork -- Create a painting or drawing
action(paint_artwork, 'paint_artwork', creative, 2).
action_difficulty(paint_artwork, 0.4).
action_duration(paint_artwork, 3).
action_category(paint_artwork, art).
action_verb(paint_artwork, past, 'painted').
action_verb(paint_artwork, present, 'paints').
action_target_type(paint_artwork, self).
action_range(paint_artwork, 3).
action_prerequisite(paint_artwork, (has_item(Actor, art_supplies, _))).
action_effect(paint_artwork, (assert(event(Actor, artwork_created)))).
can_perform(Actor, paint_artwork, _Target) :-
    has_item(Actor, art_supplies, _).

%% attend_town_meeting -- Participate in a town council meeting
action(attend_town_meeting, 'attend_town_meeting', social, 0).
action_difficulty(attend_town_meeting, 0.1).
action_duration(attend_town_meeting, 2).
action_category(attend_town_meeting, civic).
action_verb(attend_town_meeting, past, 'attended the town meeting').
action_verb(attend_town_meeting, present, 'attends the town meeting').
action_target_type(attend_town_meeting, self).
action_range(attend_town_meeting, 5).
action_prerequisite(attend_town_meeting, (at_location(Actor, community_center))).
action_effect(attend_town_meeting, (assert(event(Actor, attended_meeting)))).
can_perform(Actor, attend_town_meeting, _Target) :-
    at_location(Actor, community_center).
