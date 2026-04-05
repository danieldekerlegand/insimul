%% Insimul Actions: Victorian England
%% Source: data/worlds/victorian_england/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema:
%%   action/4 -- action(AtomId, Name, Category, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% pay_social_call
%% Visit a residence and present a calling card as proper etiquette demands
action(pay_social_call, 'pay_social_call', social, 1).
action_difficulty(pay_social_call, 0.2).
action_duration(pay_social_call, 2).
action_category(pay_social_call, social).
action_verb(pay_social_call, past, 'paid a social call').
action_verb(pay_social_call, present, 'pays a social call').
action_target_type(pay_social_call, other).
action_requires_target(pay_social_call).
action_range(pay_social_call, 5).
action_prerequisite(pay_social_call, (has_item(Actor, calling_card))).
action_effect(pay_social_call, (assert(visited(Actor, Target)))).
can_perform(Actor, pay_social_call, Target) :-
    has_item(Actor, calling_card),
    near(Actor, Target, 5).

%% attend_club
%% Spend time at a gentlemens club networking and discussing affairs
action(attend_club, 'attend_club', social, 2).
action_difficulty(attend_club, 0.3).
action_duration(attend_club, 3).
action_category(attend_club, social).
action_verb(attend_club, past, 'attended the club').
action_verb(attend_club, present, 'attends the club').
action_target_type(attend_club, none).
action_range(attend_club, 0).
action_prerequisite(attend_club, (at_location(Actor, Loc), building(Loc, business, gentlemens_club))).
action_effect(attend_club, (assert(socialised(Actor)))).
can_perform(Actor, attend_club, _Target) :-
    at_location(Actor, Loc),
    building(Loc, business, gentlemens_club).

%% investigate_crime
%% Examine a crime scene for clues and evidence
action(investigate_crime, 'investigate_crime', investigation, 2).
action_difficulty(investigate_crime, 0.5).
action_duration(investigate_crime, 3).
action_category(investigate_crime, investigation).
action_verb(investigate_crime, past, 'investigated the scene').
action_verb(investigate_crime, present, 'investigates the scene').
action_target_type(investigate_crime, location).
action_range(investigate_crime, 3).
action_prerequisite(investigate_crime, (has_item(Actor, magnifying_glass))).
action_effect(investigate_crime, (assert(clue_found(Actor, Target)))).
can_perform(Actor, investigate_crime, Target) :-
    has_item(Actor, magnifying_glass).

%% travel_by_rail
%% Take a train between London and Manchester
action(travel_by_rail, 'travel_by_rail', transport, 1).
action_difficulty(travel_by_rail, 0.1).
action_duration(travel_by_rail, 5).
action_category(travel_by_rail, transport).
action_verb(travel_by_rail, past, 'travelled by rail').
action_verb(travel_by_rail, present, 'travels by rail').
action_target_type(travel_by_rail, location).
action_range(travel_by_rail, 0).
action_prerequisite(travel_by_rail, (has_item(Actor, railway_ticket), at_location(Actor, Loc), building(Loc, civic, railway_station))).
action_effect(travel_by_rail, (retract(at_location(Actor, _)), assert(at_location(Actor, Target)))).
can_perform(Actor, travel_by_rail, _Target) :-
    has_item(Actor, railway_ticket),
    at_location(Actor, Loc),
    building(Loc, civic, railway_station).

%% operate_machinery
%% Work with steam-powered factory equipment
action(operate_machinery, 'operate_machinery', labor, 3).
action_difficulty(operate_machinery, 0.4).
action_duration(operate_machinery, 4).
action_category(operate_machinery, labor).
action_verb(operate_machinery, past, 'operated the machinery').
action_verb(operate_machinery, present, 'operates machinery').
action_target_type(operate_machinery, object).
action_range(operate_machinery, 2).
action_prerequisite(operate_machinery, (at_location(Actor, Loc), building(Loc, business, factory))).
action_effect(operate_machinery, (assert(work_done(Actor)))).
can_perform(Actor, operate_machinery, _Target) :-
    at_location(Actor, Loc),
    building(Loc, business, factory).

%% invent_device
%% Design and build a new mechanical or steam-powered device
action(invent_device, 'invent_device', science, 4).
action_difficulty(invent_device, 0.7).
action_duration(invent_device, 6).
action_category(invent_device, science).
action_verb(invent_device, past, 'invented a device').
action_verb(invent_device, present, 'invents a device').
action_target_type(invent_device, object).
action_range(invent_device, 2).
action_prerequisite(invent_device, (attribute(Actor, technical_skill, Skill), Skill > 60, at_location(Actor, Loc), building(Loc, business, workshop))).
action_effect(invent_device, (assert(invention_created(Actor, Target)))).
can_perform(Actor, invent_device, _Target) :-
    attribute(Actor, technical_skill, Skill), Skill > 60,
    at_location(Actor, Loc),
    building(Loc, business, workshop).

%% read_newspaper
%% Read the daily paper for news, gossip, and classified advertisements
action(read_newspaper, 'read_newspaper', information, 1).
action_difficulty(read_newspaper, 0.1).
action_duration(read_newspaper, 1).
action_category(read_newspaper, information).
action_verb(read_newspaper, past, 'read the newspaper').
action_verb(read_newspaper, present, 'reads the newspaper').
action_target_type(read_newspaper, none).
action_range(read_newspaper, 0).
action_prerequisite(read_newspaper, (has_item(Actor, daily_telegraph))).
action_effect(read_newspaper, (assert(informed(Actor)))).
can_perform(Actor, read_newspaper, _Target) :-
    has_item(Actor, daily_telegraph).

%% visit_pub
%% Spend time at a public house drinking and gathering information
action(visit_pub, 'visit_pub', social, 1).
action_difficulty(visit_pub, 0.1).
action_duration(visit_pub, 2).
action_category(visit_pub, social).
action_verb(visit_pub, past, 'visited the pub').
action_verb(visit_pub, present, 'visits the pub').
action_target_type(visit_pub, none).
action_range(visit_pub, 0).
action_prerequisite(visit_pub, (at_location(Actor, Loc), building(Loc, business, pub))).
action_effect(visit_pub, (assert(pub_visited(Actor)))).
can_perform(Actor, visit_pub, _Target) :-
    at_location(Actor, Loc),
    building(Loc, business, pub).

%% petition_parliament
%% Present a formal petition or argument to a member of Parliament
action(petition_parliament, 'petition_parliament', politics, 3).
action_difficulty(petition_parliament, 0.6).
action_duration(petition_parliament, 4).
action_category(petition_parliament, politics).
action_verb(petition_parliament, past, 'petitioned Parliament').
action_verb(petition_parliament, present, 'petitions Parliament').
action_target_type(petition_parliament, other).
action_requires_target(petition_parliament).
action_range(petition_parliament, 5).
action_prerequisite(petition_parliament, (attribute(Actor, charisma, Cha), Cha > 50)).
action_effect(petition_parliament, (assert(petition_filed(Actor, Target)))).
can_perform(Actor, petition_parliament, Target) :-
    attribute(Actor, charisma, Cha), Cha > 50,
    at_location(Actor, Loc),
    building(Loc, civic, parliament).

%% take_tea
%% Host or attend afternoon tea, the essential Victorian social ritual
action(take_tea, 'take_tea', social, 1).
action_difficulty(take_tea, 0.2).
action_duration(take_tea, 2).
action_category(take_tea, social).
action_verb(take_tea, past, 'took tea').
action_verb(take_tea, present, 'takes tea').
action_target_type(take_tea, other).
action_requires_target(take_tea).
action_range(take_tea, 5).
action_prerequisite(take_tea, (near(Actor, Target, 5))).
action_effect(take_tea, (assert(tea_taken(Actor, Target)))).
can_perform(Actor, take_tea, Target) :-
    near(Actor, Target, 5).

%% pawn_item
%% Sell or pawn an item at the pawnbroker
action(pawn_item, 'pawn_item', commerce, 1).
action_difficulty(pawn_item, 0.2).
action_duration(pawn_item, 1).
action_category(pawn_item, commerce).
action_verb(pawn_item, past, 'pawned an item').
action_verb(pawn_item, present, 'pawns an item').
action_target_type(pawn_item, object).
action_requires_target(pawn_item).
action_range(pawn_item, 2).
action_prerequisite(pawn_item, (at_location(Actor, Loc), building(Loc, business, pawnbroker))).
action_effect(pawn_item, (retract(has_item(Actor, Target)), assert(gold_gained(Actor)))).
can_perform(Actor, pawn_item, Target) :-
    at_location(Actor, Loc),
    building(Loc, business, pawnbroker),
    has_item(Actor, Target).

%% study_at_library
%% Research a topic at the public library or British Museum
action(study_at_library, 'study_at_library', knowledge, 2).
action_difficulty(study_at_library, 0.3).
action_duration(study_at_library, 3).
action_category(study_at_library, knowledge).
action_verb(study_at_library, past, 'studied at the library').
action_verb(study_at_library, present, 'studies at the library').
action_target_type(study_at_library, none).
action_range(study_at_library, 0).
action_prerequisite(study_at_library, (at_location(Actor, Loc), building(Loc, civic, library))).
action_effect(study_at_library, (assert(knowledge_gained(Actor)))).
can_perform(Actor, study_at_library, _Target) :-
    at_location(Actor, Loc),
    building(Loc, civic, library).
