%% Insimul Actions: Historical Ancient World
%% Source: data/worlds/historical_ancient/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (base_actions format):
%%   action/4 -- action(AtomId, Name, Type, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% debate_in_agora
%% Engage a citizen in philosophical or political debate at the Agora
action(debate_in_agora, 'debate_in_agora', social, 2).
action_difficulty(debate_in_agora, 0.4).
action_duration(debate_in_agora, 3).
action_category(debate_in_agora, social).
action_verb(debate_in_agora, past, 'debated with').
action_verb(debate_in_agora, present, 'debates with').
action_target_type(debate_in_agora, other).
action_requires_target(debate_in_agora).
action_range(debate_in_agora, 10).
action_prerequisite(debate_in_agora, (near(Actor, Target, 10))).
action_effect(debate_in_agora, (assert(debated(Actor, Target)))).
can_perform(Actor, debate_in_agora, Target) :-
    near(Actor, Target, 10).

%% offer_libation
%% Pour a libation to honor the gods at a temple or shrine
action(offer_libation, 'offer_libation', ritual, 1).
action_difficulty(offer_libation, 0.2).
action_duration(offer_libation, 2).
action_category(offer_libation, religious).
action_verb(offer_libation, past, 'offered a libation to').
action_verb(offer_libation, present, 'offers a libation to').
action_target_type(offer_libation, location).
action_range(offer_libation, 3).
action_prerequisite(offer_libation, (at_location(Actor, temple))).
action_effect(offer_libation, (assert(piety_increased(Actor)))).
can_perform(Actor, offer_libation, _) :-
    at_location(Actor, temple).

%% trade_at_emporion
%% Buy or sell goods at the harbor trading post
action(trade_at_emporion, 'trade_at_emporion', economic, 2).
action_difficulty(trade_at_emporion, 0.3).
action_duration(trade_at_emporion, 3).
action_category(trade_at_emporion, commerce).
action_verb(trade_at_emporion, past, 'traded with').
action_verb(trade_at_emporion, present, 'trades with').
action_target_type(trade_at_emporion, other).
action_requires_target(trade_at_emporion).
action_range(trade_at_emporion, 5).
action_prerequisite(trade_at_emporion, (near(Actor, Target, 5))).
action_effect(trade_at_emporion, (assert(traded(Actor, Target)))).
can_perform(Actor, trade_at_emporion, Target) :-
    near(Actor, Target, 5).

%% attend_symposium
%% Join a drinking party to discuss philosophy and poetry
action(attend_symposium, 'attend_symposium', social, 3).
action_difficulty(attend_symposium, 0.5).
action_duration(attend_symposium, 5).
action_category(attend_symposium, social).
action_verb(attend_symposium, past, 'attended a symposium with').
action_verb(attend_symposium, present, 'attends a symposium with').
action_target_type(attend_symposium, other).
action_requires_target(attend_symposium).
action_range(attend_symposium, 10).
action_prerequisite(attend_symposium, (near(Actor, Target, 10))).
action_effect(attend_symposium, (assert(feasted_with(Actor, Target)))).
can_perform(Actor, attend_symposium, Target) :-
    near(Actor, Target, 10).

%% vote_at_assembly
%% Cast a vote on civic matters at the democratic assembly
action(vote_at_assembly, 'vote_at_assembly', political, 1).
action_difficulty(vote_at_assembly, 0.2).
action_duration(vote_at_assembly, 2).
action_category(vote_at_assembly, political).
action_verb(vote_at_assembly, past, 'voted at the assembly').
action_verb(vote_at_assembly, present, 'votes at the assembly').
action_target_type(vote_at_assembly, none).
action_range(vote_at_assembly, 0).
action_prerequisite(vote_at_assembly, (at_location(Actor, pnyx))).
action_effect(vote_at_assembly, (assert(voted(Actor)))).
can_perform(Actor, vote_at_assembly, _) :-
    at_location(Actor, pnyx).

%% train_at_gymnasium
%% Exercise and train in wrestling, boxing, or footraces
action(train_at_gymnasium, 'train_at_gymnasium', physical, 3).
action_difficulty(train_at_gymnasium, 0.4).
action_duration(train_at_gymnasium, 3).
action_category(train_at_gymnasium, physical).
action_verb(train_at_gymnasium, past, 'trained at the gymnasium').
action_verb(train_at_gymnasium, present, 'trains at the gymnasium').
action_target_type(train_at_gymnasium, none).
action_range(train_at_gymnasium, 0).
action_prerequisite(train_at_gymnasium, (at_location(Actor, gymnasium))).
action_effect(train_at_gymnasium, (assert(trained(Actor)))).
can_perform(Actor, train_at_gymnasium, _) :-
    at_location(Actor, gymnasium).

%% consult_oracle
%% Seek guidance from an oracle or seer about the future
action(consult_oracle, 'consult_oracle', ritual, 2).
action_difficulty(consult_oracle, 0.5).
action_duration(consult_oracle, 4).
action_category(consult_oracle, religious).
action_verb(consult_oracle, past, 'consulted the oracle').
action_verb(consult_oracle, present, 'consults the oracle').
action_target_type(consult_oracle, none).
action_range(consult_oracle, 0).
action_prerequisite(consult_oracle, (at_location(Actor, temple))).
action_effect(consult_oracle, (assert(received_prophecy(Actor)))).
can_perform(Actor, consult_oracle, _) :-
    at_location(Actor, temple).

%% fight_in_arena
%% Engage in gladiatorial combat or watch from the stands
action(fight_in_arena, 'fight_in_arena', combat, 4).
action_difficulty(fight_in_arena, 0.7).
action_duration(fight_in_arena, 3).
action_category(fight_in_arena, combat).
action_verb(fight_in_arena, past, 'fought in the arena against').
action_verb(fight_in_arena, present, 'fights in the arena against').
action_target_type(fight_in_arena, other).
action_requires_target(fight_in_arena).
action_range(fight_in_arena, 5).
action_prerequisite(fight_in_arena, (near(Actor, Target, 5))).
action_effect(fight_in_arena, (assert(fought(Actor, Target)))).
can_perform(Actor, fight_in_arena, Target) :-
    near(Actor, Target, 5).

%% visit_thermae
%% Bathe and socialize at the public baths
action(visit_thermae, 'visit_thermae', social, 2).
action_difficulty(visit_thermae, 0.1).
action_duration(visit_thermae, 3).
action_category(visit_thermae, social).
action_verb(visit_thermae, past, 'bathed at the thermae').
action_verb(visit_thermae, present, 'bathes at the thermae').
action_target_type(visit_thermae, none).
action_range(visit_thermae, 0).
action_prerequisite(visit_thermae, (at_location(Actor, thermae))).
action_effect(visit_thermae, (assert(bathed(Actor)))).
can_perform(Actor, visit_thermae, _) :-
    at_location(Actor, thermae).

%% craft_pottery
%% Shape and paint a ceramic vessel at the workshop
action(craft_pottery, 'craft_pottery', craft, 3).
action_difficulty(craft_pottery, 0.5).
action_duration(craft_pottery, 4).
action_category(craft_pottery, craft).
action_verb(craft_pottery, past, 'crafted pottery').
action_verb(craft_pottery, present, 'crafts pottery').
action_target_type(craft_pottery, none).
action_range(craft_pottery, 0).
action_prerequisite(craft_pottery, (at_location(Actor, workshop))).
action_effect(craft_pottery, (assert(crafted(Actor, pottery)))).
can_perform(Actor, craft_pottery, _) :-
    at_location(Actor, workshop).

%% study_hieroglyphs
%% Practice reading and writing sacred Egyptian scripts
action(study_hieroglyphs, 'study_hieroglyphs', knowledge, 2).
action_difficulty(study_hieroglyphs, 0.6).
action_duration(study_hieroglyphs, 4).
action_category(study_hieroglyphs, scholarship).
action_verb(study_hieroglyphs, past, 'studied hieroglyphs').
action_verb(study_hieroglyphs, present, 'studies hieroglyphs').
action_target_type(study_hieroglyphs, none).
action_range(study_hieroglyphs, 0).
action_prerequisite(study_hieroglyphs, (at_location(Actor, scriptorium))).
action_effect(study_hieroglyphs, (assert(studied(Actor, hieroglyphs)))).
can_perform(Actor, study_hieroglyphs, _) :-
    at_location(Actor, scriptorium).

%% perform_salutatio
%% Attend the morning greeting at a Roman patrons house
action(perform_salutatio, 'perform_salutatio', social, 1).
action_difficulty(perform_salutatio, 0.2).
action_duration(perform_salutatio, 2).
action_category(perform_salutatio, social).
action_verb(perform_salutatio, past, 'greeted').
action_verb(perform_salutatio, present, 'greets').
action_target_type(perform_salutatio, other).
action_requires_target(perform_salutatio).
action_range(perform_salutatio, 5).
action_prerequisite(perform_salutatio, (near(Actor, Target, 5))).
action_effect(perform_salutatio, (assert(saluted(Actor, Target)))).
can_perform(Actor, perform_salutatio, Target) :-
    near(Actor, Target, 5).
