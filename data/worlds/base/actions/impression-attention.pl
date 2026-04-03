%% Ensemble Actions: impression-attention
%% Source: data/ensemble/actions/impression-attention.json
%% Converted: 2026-04-01T20:15:17.343Z
%% Total actions: 13

%% make_a_scene_not_subtle
% Action: MAKE A SCENE (NOT SUBTLE)
% Source: Ensemble / impression-attention

action(make_a_scene_not_subtle, 'MAKE A SCENE (NOT SUBTLE)', social, 1).
action_difficulty(make_a_scene_not_subtle, 0.5).
action_duration(make_a_scene_not_subtle, 1).
action_category(make_a_scene_not_subtle, impression_attention).
action_source(make_a_scene_not_subtle, ensemble).
action_verb(make_a_scene_not_subtle, past, 'make a scene (not subtle)').
action_verb(make_a_scene_not_subtle, present, 'make a scene (not subtle)').
action_target_type(make_a_scene_not_subtle, self).
action_leads_to(make_a_scene_not_subtle, embrace_someone_in_public_a).
action_leads_to(make_a_scene_not_subtle, embrace_someone_in_public_r).
action_leads_to(make_a_scene_not_subtle, play_a_bad_trick).
action_leads_to(make_a_scene_not_subtle, make_a_scene_successfully).
action_leads_to(make_a_scene_not_subtle, make_a_scene_unsuccessfully).
can_perform(Actor, make_a_scene_not_subtle) :- true.

%% draw_attention_subtle
% Action: DRAW ATTENTION (SUBTLE)
% Source: Ensemble / impression-attention

action(draw_attention_subtle, 'DRAW ATTENTION (SUBTLE)', social, 1).
action_difficulty(draw_attention_subtle, 0.5).
action_duration(draw_attention_subtle, 1).
action_category(draw_attention_subtle, impression_attention).
action_source(draw_attention_subtle, ensemble).
action_verb(draw_attention_subtle, past, 'draw attention (subtle)').
action_verb(draw_attention_subtle, present, 'draw attention (subtle)').
action_target_type(draw_attention_subtle, self).
action_leads_to(draw_attention_subtle, lie_about_not_liking_something_to_get_attention).
action_leads_to(draw_attention_subtle, someone_not_knowing_how_to_behave_draws_attention_to_oneself).
action_leads_to(draw_attention_subtle, glorieuse_making_eyes_at_someone).
action_leads_to(draw_attention_subtle, draw_attention_successfully).
action_leads_to(draw_attention_subtle, draw_attention_unsuccessfully).
can_perform(Actor, draw_attention_subtle) :- true.

%% deflect
% Action: DEFLECT
% Source: Ensemble / impression-attention

action(deflect, 'DEFLECT', social, 1).
action_difficulty(deflect, 0.5).
action_duration(deflect, 1).
action_category(deflect, impression_attention).
action_source(deflect, ensemble).
action_verb(deflect, past, 'deflect').
action_verb(deflect, present, 'deflect').
action_target_type(deflect, self).
action_leads_to(deflect, draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift).
action_leads_to(deflect, look_away).
action_leads_to(deflect, remaining_silent).
action_leads_to(deflect, insist_on_low_status_to_drive_off_high_status_lover).
action_leads_to(deflect, discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed).
action_leads_to(deflect, attempt_to_conceal_information_from_friend_fails).
action_leads_to(deflect, deflect_successfully).
action_leads_to(deflect, deflect_unsuccessfully).
can_perform(Actor, deflect) :- true.

%% blend_in
% Action: BLEND IN
% Source: Ensemble / impression-attention

action(blend_in, 'BLEND IN', social, 1).
action_difficulty(blend_in, 0.5).
action_duration(blend_in, 1).
action_category(blend_in, impression_attention).
action_source(blend_in, ensemble).
action_verb(blend_in, past, 'blend in').
action_verb(blend_in, present, 'blend in').
action_target_type(blend_in, self).
action_leads_to(blend_in, eccentric_unattractive_man_prefers_staying_on_his_own_a).
action_leads_to(blend_in, eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r).
action_leads_to(blend_in, dress_up_as_stranger).
action_leads_to(blend_in, try_to_blend_in_while_being_new_to_the_game).
action_leads_to(blend_in, blendin_successfully).
action_leads_to(blend_in, blendin_unsuccessfully).
can_perform(Actor, blend_in) :- true.

%% make_a_scene_successfully
% Action: make a scene successfully
% Source: Ensemble / impression-attention

action(make_a_scene_successfully, 'make a scene successfully', social, 1).
action_difficulty(make_a_scene_successfully, 0.5).
action_duration(make_a_scene_successfully, 1).
action_category(make_a_scene_successfully, impression_attention).
action_source(make_a_scene_successfully, ensemble).
action_parent(make_a_scene_successfully, make_a_scene_not_subtle).
action_verb(make_a_scene_successfully, past, 'make a scene successfully').
action_verb(make_a_scene_successfully, present, 'make a scene successfully').
action_target_type(make_a_scene_successfully, other).
action_requires_target(make_a_scene_successfully).
action_range(make_a_scene_successfully, 5).
action_is_accept(make_a_scene_successfully).
action_effect(make_a_scene_successfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, make_a_scene_successfully, Target) :- true.

%% make_a_scene_unsuccessfully
% Action: make a scene unsuccessfully
% Source: Ensemble / impression-attention

action(make_a_scene_unsuccessfully, 'make a scene unsuccessfully', social, 1).
action_difficulty(make_a_scene_unsuccessfully, 0.5).
action_duration(make_a_scene_unsuccessfully, 1).
action_category(make_a_scene_unsuccessfully, impression_attention).
action_source(make_a_scene_unsuccessfully, ensemble).
action_parent(make_a_scene_unsuccessfully, make_a_scene_not_subtle).
action_verb(make_a_scene_unsuccessfully, past, 'make a scene unsuccessfully').
action_verb(make_a_scene_unsuccessfully, present, 'make a scene unsuccessfully').
action_target_type(make_a_scene_unsuccessfully, other).
action_requires_target(make_a_scene_unsuccessfully).
action_range(make_a_scene_unsuccessfully, 5).
action_effect(make_a_scene_unsuccessfully, (modify_network(Target, Actor, curiosity, -, 5))).
can_perform(Actor, make_a_scene_unsuccessfully, Target) :- true.

%% someone_not_knowing_how_to_behave_draws_attention_to_oneself
% Action: someone not knowing how to behave draws attention to oneself
% Source: Ensemble / impression-attention

action(someone_not_knowing_how_to_behave_draws_attention_to_oneself, 'someone not knowing how to behave draws attention to oneself', social, 1).
action_difficulty(someone_not_knowing_how_to_behave_draws_attention_to_oneself, 0.5).
action_duration(someone_not_knowing_how_to_behave_draws_attention_to_oneself, 1).
action_category(someone_not_knowing_how_to_behave_draws_attention_to_oneself, impression_attention).
action_source(someone_not_knowing_how_to_behave_draws_attention_to_oneself, ensemble).
action_parent(someone_not_knowing_how_to_behave_draws_attention_to_oneself, draw_attention_subtle).
action_verb(someone_not_knowing_how_to_behave_draws_attention_to_oneself, past, 'someone not knowing how to behave draws attention to oneself').
action_verb(someone_not_knowing_how_to_behave_draws_attention_to_oneself, present, 'someone not knowing how to behave draws attention to oneself').
action_target_type(someone_not_knowing_how_to_behave_draws_attention_to_oneself, other).
action_requires_target(someone_not_knowing_how_to_behave_draws_attention_to_oneself).
action_range(someone_not_knowing_how_to_behave_draws_attention_to_oneself, 5).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (attribute(Actor, propriety, V), V < 50)).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (attribute(Target, propriety, V), V > 50)).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (attribute(Actor, self-assuredness, V), V < 60)).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (relationship(Actor, 'third', friends))).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (relationship(Target, 'third', friends))).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (relationship(Actor, Target, strangers))).
action_effect(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (modify_network(Target, Actor, curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, someone_not_knowing_how_to_behave_draws_attention_to_oneself, Target) :-
    attribute(Actor, propriety, V), V < 50,
    attribute(Target, propriety, V), V > 50,
    attribute(Actor, self-assuredness, V), V < 60,
    relationship(Actor, 'third', friends),
    relationship(Target, 'third', friends),
    relationship(Actor, Target, strangers).

%% draw_attention_successfully
% Action: draw attention successfully
% Source: Ensemble / impression-attention

action(draw_attention_successfully, 'draw attention successfully', social, 1).
action_difficulty(draw_attention_successfully, 0.5).
action_duration(draw_attention_successfully, 1).
action_category(draw_attention_successfully, impression_attention).
action_source(draw_attention_successfully, ensemble).
action_parent(draw_attention_successfully, draw_attention_subtle).
action_verb(draw_attention_successfully, past, 'draw attention successfully').
action_verb(draw_attention_successfully, present, 'draw attention successfully').
action_target_type(draw_attention_successfully, other).
action_requires_target(draw_attention_successfully).
action_range(draw_attention_successfully, 5).
action_is_accept(draw_attention_successfully).
action_effect(draw_attention_successfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, draw_attention_successfully, Target) :- true.

%% draw_attention_unsuccessfully
% Action: draw attention unsuccessfully
% Source: Ensemble / impression-attention

action(draw_attention_unsuccessfully, 'draw attention unsuccessfully', social, 1).
action_difficulty(draw_attention_unsuccessfully, 0.5).
action_duration(draw_attention_unsuccessfully, 1).
action_category(draw_attention_unsuccessfully, impression_attention).
action_source(draw_attention_unsuccessfully, ensemble).
action_parent(draw_attention_unsuccessfully, draw_attention_subtle).
action_verb(draw_attention_unsuccessfully, past, 'draw attention unsuccessfully').
action_verb(draw_attention_unsuccessfully, present, 'draw attention unsuccessfully').
action_target_type(draw_attention_unsuccessfully, other).
action_requires_target(draw_attention_unsuccessfully).
action_range(draw_attention_unsuccessfully, 5).
action_effect(draw_attention_unsuccessfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, draw_attention_unsuccessfully, Target) :- true.

%% deflect_successfully
% Action: deflect successfully
% Source: Ensemble / impression-attention

action(deflect_successfully, 'deflect successfully', social, 1).
action_difficulty(deflect_successfully, 0.5).
action_duration(deflect_successfully, 1).
action_category(deflect_successfully, impression_attention).
action_source(deflect_successfully, ensemble).
action_parent(deflect_successfully, deflect).
action_verb(deflect_successfully, past, 'deflect successfully').
action_verb(deflect_successfully, present, 'deflect successfully').
action_target_type(deflect_successfully, other).
action_requires_target(deflect_successfully).
action_range(deflect_successfully, 5).
action_is_accept(deflect_successfully).
action_effect(deflect_successfully, (modify_network(Target, Actor, curiosity, -, 5))).
can_perform(Actor, deflect_successfully, Target) :- true.

%% deflect_unsuccessfully
% Action: deflect unsuccessfully
% Source: Ensemble / impression-attention

action(deflect_unsuccessfully, 'deflect unsuccessfully', social, 1).
action_difficulty(deflect_unsuccessfully, 0.5).
action_duration(deflect_unsuccessfully, 1).
action_category(deflect_unsuccessfully, impression_attention).
action_source(deflect_unsuccessfully, ensemble).
action_parent(deflect_unsuccessfully, deflect).
action_verb(deflect_unsuccessfully, past, 'deflect unsuccessfully').
action_verb(deflect_unsuccessfully, present, 'deflect unsuccessfully').
action_target_type(deflect_unsuccessfully, other).
action_requires_target(deflect_unsuccessfully).
action_range(deflect_unsuccessfully, 5).
action_effect(deflect_unsuccessfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, deflect_unsuccessfully, Target) :- true.

%% eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r
% Action: eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)
% Source: Ensemble / impression-attention

action(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, 'eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)', social, 1).
action_difficulty(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, 0.5).
action_duration(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, 1).
action_category(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, impression_attention).
action_source(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, ensemble).
action_parent(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, blend_in).
action_verb(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, past, 'eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)').
action_verb(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, present, 'eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)').
action_target_type(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, other).
action_requires_target(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r).
action_range(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, 5).
action_prerequisite(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, (attribute(Actor, charisma, V), V < 30)).
action_prerequisite(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, (trait(Actor, eccentric))).
action_effect(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, (modify_network(Target, Actor, curiosity, +, 10))).
action_effect(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, (modify_network(Actor, Target, affinity, -, 5))).
% Can Actor perform this action?
can_perform(Actor, eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, Target) :-
    attribute(Actor, charisma, V), V < 30,
    trait(Actor, eccentric).

%% try_to_blend_in_while_being_new_to_the_game
% Action: try to blend in while being new to the game
% Source: Ensemble / impression-attention

action(try_to_blend_in_while_being_new_to_the_game, 'try to blend in while being new to the game', social, 1).
action_difficulty(try_to_blend_in_while_being_new_to_the_game, 0.5).
action_duration(try_to_blend_in_while_being_new_to_the_game, 1).
action_category(try_to_blend_in_while_being_new_to_the_game, impression_attention).
action_source(try_to_blend_in_while_being_new_to_the_game, ensemble).
action_parent(try_to_blend_in_while_being_new_to_the_game, blend_in).
action_verb(try_to_blend_in_while_being_new_to_the_game, past, 'try to blend in while being new to the game').
action_verb(try_to_blend_in_while_being_new_to_the_game, present, 'try to blend in while being new to the game').
action_target_type(try_to_blend_in_while_being_new_to_the_game, other).
action_requires_target(try_to_blend_in_while_being_new_to_the_game).
action_range(try_to_blend_in_while_being_new_to_the_game, 5).
action_prerequisite(try_to_blend_in_while_being_new_to_the_game, (relationship(Actor, Target, strangers))).
action_prerequisite(try_to_blend_in_while_being_new_to_the_game, (trait(Target, rich))).
action_effect(try_to_blend_in_while_being_new_to_the_game, (modify_network(Target, Actor, curiosity, +, 5))).
action_effect(try_to_blend_in_while_being_new_to_the_game, (assert(status(Actor, flattered)))).
action_effect(try_to_blend_in_while_being_new_to_the_game, (retract(relationship(Actor, Target, strangers)))).
% Can Actor perform this action?
can_perform(Actor, try_to_blend_in_while_being_new_to_the_game, Target) :-
    relationship(Actor, Target, strangers),
    trait(Target, rich).

