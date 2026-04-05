%% Insimul Actions: Historical Victorian
%% Source: data/worlds/historical_victorian/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (matches base_actions.pl format):
%%   action/4 -- action(AtomId, Name, ActionType, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% leave_calling_card
%% Announce a social visit by leaving your card with the butler
action(leave_calling_card, 'leave_calling_card', social, 1).
action_difficulty(leave_calling_card, 0.1).
action_duration(leave_calling_card, 1).
action_category(leave_calling_card, etiquette).
action_verb(leave_calling_card, past, 'left a card for').
action_verb(leave_calling_card, present, 'leaves a card for').
action_target_type(leave_calling_card, other).
action_requires_target(leave_calling_card).
action_range(leave_calling_card, 5).
action_prerequisite(leave_calling_card, (has_item(Actor, calling_card_case, _))).
action_effect(leave_calling_card, (assert(social_visit_requested(Actor, Target)))).
can_perform(Actor, leave_calling_card, Target) :-
    has_item(Actor, calling_card_case, _),
    near(Actor, Target, 5).

%% tip_hat
%% Perform a polite greeting to a person of standing
action(tip_hat, 'tip_hat', social, 0).
action_difficulty(tip_hat, 0).
action_duration(tip_hat, 0).
action_category(tip_hat, etiquette).
action_verb(tip_hat, past, 'tipped hat to').
action_verb(tip_hat, present, 'tips hat to').
action_target_type(tip_hat, other).
action_requires_target(tip_hat).
action_range(tip_hat, 10).
action_prerequisite(tip_hat, (has_item(Actor, top_hat, _))).
action_effect(tip_hat, (modify_relationship(Actor, Target, respect, 1))).
can_perform(Actor, tip_hat, Target) :-
    has_item(Actor, top_hat, _),
    near(Actor, Target, 10).

%% investigate_crime
%% Examine a location for evidence of criminal activity
action(investigate_crime, 'investigate_crime', investigation, 3).
action_difficulty(investigate_crime, 0.5).
action_duration(investigate_crime, 3).
action_category(investigate_crime, law).
action_verb(investigate_crime, past, 'investigated').
action_verb(investigate_crime, present, 'investigates').
action_target_type(investigate_crime, location).
action_range(investigate_crime, 3).
action_prerequisite(investigate_crime, (status(Actor, police_detective))).
action_effect(investigate_crime, (assert(evidence_gathered(Actor, Location)))).
can_perform(Actor, investigate_crime, _Location) :-
    status(Actor, police_detective).

%% organize_workers
%% Rally factory workers to support union demands
action(organize_workers, 'organize_workers', social, 5).
action_difficulty(organize_workers, 0.7).
action_duration(organize_workers, 5).
action_category(organize_workers, labour).
action_verb(organize_workers, past, 'organized workers at').
action_verb(organize_workers, present, 'organizes workers at').
action_target_type(organize_workers, location).
action_range(organize_workers, 5).
action_prerequisite(organize_workers, (attribute(Actor, charisma, C), C > 50)).
action_effect(organize_workers, (assert(workers_organized(Location)))).
can_perform(Actor, organize_workers, _Location) :-
    attribute(Actor, charisma, C), C > 50.

%% publish_article
%% Write and submit an article to the Daily Sentinel
action(publish_article, 'publish_article', social, 4).
action_difficulty(publish_article, 0.6).
action_duration(publish_article, 4).
action_category(publish_article, media).
action_verb(publish_article, past, 'published an article about').
action_verb(publish_article, present, 'publishes an article about').
action_target_type(publish_article, none).
action_range(publish_article, 0).
action_prerequisite(publish_article, (has_item(Actor, broadsheet_newspaper, _))).
action_effect(publish_article, (assert(article_published(Actor, Topic)))).
can_perform(Actor, publish_article, _) :-
    has_item(Actor, broadsheet_newspaper, _).

%% attend_church
%% Attend Sunday service at St. Agnes Church
action(attend_church, 'attend_church', social, 1).
action_difficulty(attend_church, 0).
action_duration(attend_church, 2).
action_category(attend_church, religion).
action_verb(attend_church, past, 'attended church').
action_verb(attend_church, present, 'attends church').
action_target_type(attend_church, location).
action_range(attend_church, 5).
action_effect(attend_church, (modify_attribute(Actor, propriety, 5))).
can_perform(Actor, attend_church, _Location) :-
    alive(Actor).

%% visit_opium_den
%% Enter the Jade Lantern to smoke opium
action(visit_opium_den, 'visit_opium_den', vice, 2).
action_difficulty(visit_opium_den, 0.2).
action_duration(visit_opium_den, 3).
action_category(visit_opium_den, vice).
action_verb(visit_opium_den, past, 'visited the opium den').
action_verb(visit_opium_den, present, 'visits the opium den').
action_target_type(visit_opium_den, location).
action_range(visit_opium_den, 3).
action_prerequisite(visit_opium_den, (gold(Actor, G), G >= 5)).
action_effect(visit_opium_den, (modify_gold(Actor, -5))).
action_effect(visit_opium_den, (modify_attribute(Actor, propriety, -10))).
can_perform(Actor, visit_opium_den, _Location) :-
    gold(Actor, G), G >= 5.

%% perform_surgery
%% Treat a wounded or sick character
action(perform_surgery, 'perform_surgery', medical, 5).
action_difficulty(perform_surgery, 0.8).
action_duration(perform_surgery, 4).
action_category(perform_surgery, medical).
action_verb(perform_surgery, past, 'operated on').
action_verb(perform_surgery, present, 'operates on').
action_target_type(perform_surgery, other).
action_requires_target(perform_surgery).
action_range(perform_surgery, 3).
action_prerequisite(perform_surgery, (status(Actor, physician))).
action_effect(perform_surgery, (assert(treated(Target)))).
can_perform(Actor, perform_surgery, Target) :-
    status(Actor, physician),
    near(Actor, Target, 3).

%% conduct_experiment
%% Perform a scientific experiment in the laboratory
action(conduct_experiment, 'conduct_experiment', science, 4).
action_difficulty(conduct_experiment, 0.7).
action_duration(conduct_experiment, 5).
action_category(conduct_experiment, science).
action_verb(conduct_experiment, past, 'conducted an experiment').
action_verb(conduct_experiment, present, 'conducts an experiment').
action_target_type(conduct_experiment, none).
action_range(conduct_experiment, 0).
action_prerequisite(conduct_experiment, (status(Actor, inventor))).
action_effect(conduct_experiment, (assert(experiment_completed(Actor)))).
can_perform(Actor, conduct_experiment, _) :-
    status(Actor, inventor).

%% pickpocket
%% Steal coins from an unsuspecting target
action(pickpocket, 'pickpocket', criminal, 2).
action_difficulty(pickpocket, 0.6).
action_duration(pickpocket, 1).
action_category(pickpocket, crime).
action_verb(pickpocket, past, 'pickpocketed').
action_verb(pickpocket, present, 'pickpockets').
action_target_type(pickpocket, other).
action_requires_target(pickpocket).
action_range(pickpocket, 3).
action_prerequisite(pickpocket, (attribute(Actor, cunningness, C), C > 50)).
action_effect(pickpocket, (modify_gold(Actor, 5))).
action_effect(pickpocket, (modify_gold(Target, -5))).
can_perform(Actor, pickpocket, Target) :-
    attribute(Actor, cunningness, C), C > 50,
    near(Actor, Target, 3).

%% bribe_official
%% Offer money to sway a person in authority
action(bribe_official, 'bribe_official', social, 3).
action_difficulty(bribe_official, 0.5).
action_duration(bribe_official, 1).
action_category(bribe_official, corruption).
action_verb(bribe_official, past, 'bribed').
action_verb(bribe_official, present, 'bribes').
action_target_type(bribe_official, other).
action_requires_target(bribe_official).
action_range(bribe_official, 5).
action_prerequisite(bribe_official, (gold(Actor, G), G >= 20)).
action_effect(bribe_official, (modify_gold(Actor, -20))).
action_effect(bribe_official, (assert(bribed(Target, Actor)))).
can_perform(Actor, bribe_official, Target) :-
    gold(Actor, G), G >= 20,
    near(Actor, Target, 5).

%% hire_carriage
%% Hire a horse-drawn cab to travel between districts
action(hire_carriage, 'hire_carriage', travel, 1).
action_difficulty(hire_carriage, 0.1).
action_duration(hire_carriage, 1).
action_category(hire_carriage, transport).
action_verb(hire_carriage, past, 'hired a carriage to').
action_verb(hire_carriage, present, 'hires a carriage to').
action_target_type(hire_carriage, location).
action_range(hire_carriage, 0).
action_prerequisite(hire_carriage, (gold(Actor, G), G >= 3)).
action_effect(hire_carriage, (modify_gold(Actor, -3))).
action_effect(hire_carriage, (move_to(Actor, Destination))).
can_perform(Actor, hire_carriage, _Destination) :-
    gold(Actor, G), G >= 3.
