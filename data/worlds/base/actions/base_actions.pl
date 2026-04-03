%% Insimul World Export: world
%% Category: Base Actions
%% Generated: 2026-04-01T20:10:09.559Z

%% ═══════════════════════════════════════════════════════════
%% Base Actions (138 entries)
%% ═══════════════════════════════════════════════════════════

%% talk_to_npc
% Action: talk_to_npc
% Start or continue a conversation with a nearby NPC
% Type: social / social

action(talk_to_npc, 'talk_to_npc', social, 0).
action_difficulty(talk_to_npc, 0.1).
action_duration(talk_to_npc, 1).
action_category(talk_to_npc, social).
action_verb(talk_to_npc, past, 'talked to').
action_verb(talk_to_npc, present, 'talks to').
action_target_type(talk_to_npc, other).
action_requires_target(talk_to_npc).
action_range(talk_to_npc, 5).
action_prerequisite(talk_to_npc, (near(Actor, Target, 5))).
action_effect(talk_to_npc, (assert(met(Actor, Target)))).
% Can Actor perform this action?
can_perform(Actor, talk_to_npc, Target) :-
    near(Actor, Target, 5).

%% buy_item
% Action: buy_item
% Purchase an item from a merchant NPC
% Type: economic / commerce

action(buy_item, 'buy_item', economic, 0).
action_difficulty(buy_item, 0.1).
action_duration(buy_item, 1).
action_category(buy_item, commerce).
action_parent(buy_item, trade).
action_verb(buy_item, past, 'bought').
action_verb(buy_item, present, 'buys').
action_target_type(buy_item, other).
action_requires_target(buy_item).
action_range(buy_item, 5).
action_prerequisite(buy_item, (near(Actor, Target, 5))).
action_prerequisite(buy_item, (npc_will_trade(Target))).
action_prerequisite(buy_item, (gold(Actor, G), G > 0)).
action_effect(buy_item, (assert(has_item(Actor, Item, 1)))).
action_effect(buy_item, (modify_gold(Actor, -Price))).
action_effect(buy_item, (modify_gold(Target, Price))).
% Can Actor perform this action?
can_perform(Actor, buy_item, Target) :-
    near(Actor, Target, 5),
    npc_will_trade(Target),
    gold(Actor, G), G > 0.

%% sell_item
% Action: sell_item
% Sell an item from inventory to a merchant NPC
% Type: economic / commerce

action(sell_item, 'sell_item', economic, 0).
action_difficulty(sell_item, 0.1).
action_duration(sell_item, 1).
action_category(sell_item, commerce).
action_parent(sell_item, trade).
action_verb(sell_item, past, 'sold').
action_verb(sell_item, present, 'sells').
action_target_type(sell_item, other).
action_requires_target(sell_item).
action_range(sell_item, 5).
action_prerequisite(sell_item, (near(Actor, Target, 5))).
action_prerequisite(sell_item, (npc_will_trade(Target))).
action_effect(sell_item, (retract(has_item(Actor, Item, _)))).
action_effect(sell_item, (modify_gold(Actor, Price))).
action_effect(sell_item, (modify_gold(Target, -Price))).
% Can Actor perform this action?
can_perform(Actor, sell_item, Target) :-
    near(Actor, Target, 5),
    npc_will_trade(Target).

%% use_item
% Action: use_item
% Use a consumable item from inventory (food, potion, etc.)
% Type: physical / items

action(use_item, 'use_item', physical, 0).
action_difficulty(use_item, 0).
action_duration(use_item, 1).
action_category(use_item, items).
action_verb(use_item, past, 'used').
action_verb(use_item, present, 'uses').
action_target_type(use_item, self).
action_prerequisite(use_item, (has_item(Actor, _, _))).
action_effect(use_item, (retract(has_item(Actor, Item, _)))).
% Can Actor perform this action?
can_perform(Actor, use_item) :-
    has_item(Actor, _, _).

%% equip_item
% Action: equip_item
% Equip a weapon, armor, or accessory from inventory
% Type: physical / items

action(equip_item, 'equip_item', physical, 0).
action_difficulty(equip_item, 0).
action_duration(equip_item, 1).
action_category(equip_item, items).
action_parent(equip_item, use_item).
action_verb(equip_item, past, 'equipped').
action_verb(equip_item, present, 'equips').
action_target_type(equip_item, self).
action_prerequisite(equip_item, (has_item(Actor, _, _))).
action_effect(equip_item, (assert(has_equipped(Actor, Slot, ItemId)))).
% Can Actor perform this action?
can_perform(Actor, equip_item) :-
    has_item(Actor, _, _).

%% give_gift
% Action: give_gift
% Give an item from inventory to an NPC during conversation
% Type: social / social

action(give_gift, 'give_gift', social, 1).
action_difficulty(give_gift, 0.2).
action_duration(give_gift, 1).
action_category(give_gift, social).
action_verb(give_gift, past, 'gave a gift to').
action_verb(give_gift, present, 'gives a gift to').
action_target_type(give_gift, other).
action_requires_target(give_gift).
action_range(give_gift, 5).
action_prerequisite(give_gift, (near(Actor, Target, 5))).
action_prerequisite(give_gift, (has_item(Actor, _, _))).
action_effect(give_gift, (modify_disposition(Target, Actor, 20))).
action_effect(give_gift, (retract(has_item(Actor, Gift, _)))).
% Can Actor perform this action?
can_perform(Actor, give_gift, Target) :-
    near(Actor, Target, 5),
    has_item(Actor, _, _).

%% attack_enemy
% Action: attack_enemy
% Attack a hostile NPC or creature in combat range
% Type: physical / combat

action(attack_enemy, 'attack_enemy', physical, 1).
action_difficulty(attack_enemy, 0.5).
action_duration(attack_enemy, 1).
action_category(attack_enemy, combat).
action_verb(attack_enemy, past, 'attacked').
action_verb(attack_enemy, present, 'attacks').
action_target_type(attack_enemy, other).
action_requires_target(attack_enemy).
action_range(attack_enemy, 5).
action_cooldown(attack_enemy, 1).
action_prerequisite(attack_enemy, (energy(Actor, E, _), E >= 10)).
action_prerequisite(attack_enemy, (near(Actor, Target, 3))).
action_prerequisite(attack_enemy, (alive(Target))).
action_effect(attack_enemy, (modify_health(Target, -10))).
action_effect(attack_enemy, (modify_energy(Actor, -10))).
action_effect(attack_enemy, (modify_xp(Actor, combat, 5))).
% Can Actor perform this action?
can_perform(Actor, attack_enemy, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target).

%% enter_building
% Action: enter_building
% Enter a building through its door when nearby
% Type: physical / exploration

action(enter_building, 'enter_building', physical, 0).
action_difficulty(enter_building, 0).
action_duration(enter_building, 1).
action_category(enter_building, exploration).
action_verb(enter_building, past, 'entered').
action_verb(enter_building, present, 'enters').
action_target_type(enter_building, location).
action_requires_target(enter_building).
action_range(enter_building, 3).
action_prerequisite(enter_building, (near(Actor, Building, 5))).
action_prerequisite(enter_building, (location_accessible(Building))).
action_effect(enter_building, (retract(at_location(Actor, _)))).
action_effect(enter_building, (assert(at_location(Actor, Building)))).
% Can Actor perform this action?
can_perform(Actor, enter_building, Target) :-
    near(Actor, Building, 5),
    location_accessible(Building).

%% craft_item
% Action: craft_item
% Craft an item using a known recipe and required materials
% Type: physical / resource

action(craft_item, 'craft_item', physical, 2).
action_difficulty(craft_item, 0.3).
action_duration(craft_item, 1).
action_category(craft_item, resource).
action_verb(craft_item, past, 'crafted').
action_verb(craft_item, present, 'crafts').
action_target_type(craft_item, self).
action_prerequisite(craft_item, (energy(Actor, E, _), E >= 10)).
action_prerequisite(craft_item, (at_location_type(Actor, workshop))).
action_effect(craft_item, (assert(has_item(Actor, crafted_item, 1)))).
action_effect(craft_item, (modify_energy(Actor, -15))).
action_effect(craft_item, (modify_skill_xp(Actor, crafting, 1))).
% Can Actor perform this action?
can_perform(Actor, craft_item) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, workshop).

%% travel_to_location
% Action: travel_to_location
% Walk or navigate to a specific location or settlement
% Type: physical / exploration

action(travel_to_location, 'travel_to_location', physical, 0).
action_difficulty(travel_to_location, 0).
action_duration(travel_to_location, 1).
action_category(travel_to_location, exploration).
action_verb(travel_to_location, past, 'traveled to').
action_verb(travel_to_location, present, 'travels to').
action_target_type(travel_to_location, location).
action_requires_target(travel_to_location).
action_prerequisite(travel_to_location, (location_accessible(Loc))).
action_effect(travel_to_location, (retract(at_location(Actor, _)))).
action_effect(travel_to_location, (assert(at_location(Actor, Loc)))).
action_effect(travel_to_location, (assert(location_discovered(Loc)))).
action_effect(travel_to_location, (modify_energy(Actor, -10))).
% Can Actor perform this action?
can_perform(Actor, travel_to_location, Target) :-
    location_accessible(Loc).

%% compliment_npc
% Action: compliment_npc
% Compliment an NPC during conversation to improve relationship
% Type: social / social

action(compliment_npc, 'compliment_npc', social, 1).
action_difficulty(compliment_npc, 0.1).
action_duration(compliment_npc, 1).
action_category(compliment_npc, social).
action_parent(compliment_npc, talk_to_npc).
action_verb(compliment_npc, past, 'complimented').
action_verb(compliment_npc, present, 'compliments').
action_target_type(compliment_npc, other).
action_requires_target(compliment_npc).
action_range(compliment_npc, 5).
action_prerequisite(compliment_npc, (near(Actor, Target, 5))).
action_effect(compliment_npc, (modify_disposition(Target, Actor, 10))).
% Can Actor perform this action?
can_perform(Actor, compliment_npc, Target) :-
    near(Actor, Target, 5).

%% learn_word
% Action: learn_word
% Learn a new vocabulary word through conversation or interaction
% Type: mental / language

action(learn_word, 'learn_word', mental, 0).
action_difficulty(learn_word, 0.2).
action_duration(learn_word, 1).
action_category(learn_word, language).
action_verb(learn_word, past, 'learned').
action_verb(learn_word, present, 'learns').
action_target_type(learn_word, self).
% Can Actor perform this action?
can_perform(Actor, learn_word) :-
    action(learn_word, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% solve_puzzle
% Action: solve_puzzle
% Attempt to solve a puzzle encountered in the world
% Type: mental / exploration

action(solve_puzzle, 'solve_puzzle', mental, 1).
action_difficulty(solve_puzzle, 0.5).
action_duration(solve_puzzle, 1).
action_category(solve_puzzle, exploration).
action_verb(solve_puzzle, past, 'solved').
action_verb(solve_puzzle, present, 'solves').
action_target_type(solve_puzzle, object).
action_requires_target(solve_puzzle).
action_range(solve_puzzle, 3).
% Can Actor perform this action?
can_perform(Actor, solve_puzzle, Target) :-
    action(solve_puzzle, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% examine_object
% Action: examine_object
% Inspect a world object to see its name in the target language
% Type: language / language

action(examine_object, 'examine_object', language, 0).
action_difficulty(examine_object, 0.1).
action_duration(examine_object, 1).
action_category(examine_object, language).
action_verb(examine_object, past, 'examined').
action_verb(examine_object, present, 'examines').
action_target_type(examine_object, object).
action_requires_target(examine_object).
action_range(examine_object, 5).
action_effect(examine_object, (assert(knows_vocabulary(Actor, Lang, objects)))).
action_effect(examine_object, (modify_xp(Actor, language, 5))).
% Can Actor perform this action?
can_perform(_, examine_object, _).

%% read_sign
% Action: read_sign
% Read text on signs, menus, or books written in the target language
% Type: language / language

action(read_sign, 'read_sign', language, 0).
action_difficulty(read_sign, 0.2).
action_duration(read_sign, 1).
action_category(read_sign, language).
action_verb(read_sign, past, 'read').
action_verb(read_sign, present, 'reads').
action_target_type(read_sign, object).
action_requires_target(read_sign).
action_range(read_sign, 5).
action_prerequisite(read_sign, (speaks_language(Actor, _, _))).
action_effect(read_sign, (assert(knows_vocabulary(Actor, Lang, signs)))).
action_effect(read_sign, (modify_xp(Actor, language, 5))).
% Can Actor perform this action?
can_perform(Actor, read_sign, Target) :-
    speaks_language(Actor, _, _).

%% write_response
% Action: write_response
% Compose written text in the target language in response to a prompt
% Type: language / language

action(write_response, 'write_response', language, 1).
action_difficulty(write_response, 0.5).
action_duration(write_response, 1).
action_category(write_response, language).
action_verb(write_response, past, 'wrote a response').
action_verb(write_response, present, 'writes a response').
action_target_type(write_response, self).
action_prerequisite(write_response, (speaks_language(Actor, _, _))).
action_effect(write_response, (modify_xp(Actor, language, 15))).
% Can Actor perform this action?
can_perform(Actor, write_response) :-
    speaks_language(Actor, _, _).

%% listen_and_repeat
% Action: listen_and_repeat
% Listen to an NPC phrase and repeat it back via speech
% Type: language / language

action(listen_and_repeat, 'listen_and_repeat', language, 0).
action_difficulty(listen_and_repeat, 0.4).
action_duration(listen_and_repeat, 1).
action_category(listen_and_repeat, language).
action_verb(listen_and_repeat, past, 'listened and repeated').
action_verb(listen_and_repeat, present, 'listens and repeats').
action_target_type(listen_and_repeat, other).
action_requires_target(listen_and_repeat).
action_range(listen_and_repeat, 5).
action_prerequisite(listen_and_repeat, (speaks_language(Actor, _, _))).
action_effect(listen_and_repeat, (modify_xp(Actor, language, 10))).
% Can Actor perform this action?
can_perform(Actor, listen_and_repeat, Target) :-
    speaks_language(Actor, _, _).

%% point_and_name
% Action: point_and_name
% Point at an object and name it in the target language
% Type: language / language

action(point_and_name, 'point_and_name', language, 0).
action_difficulty(point_and_name, 0.3).
action_duration(point_and_name, 1).
action_category(point_and_name, language).
action_verb(point_and_name, past, 'pointed at and named').
action_verb(point_and_name, present, 'points at and names').
action_target_type(point_and_name, object).
action_requires_target(point_and_name).
action_range(point_and_name, 5).
action_effect(point_and_name, (assert(knows_vocabulary(Actor, Lang, objects)))).
action_effect(point_and_name, (modify_xp(Actor, language, 5))).
% Can Actor perform this action?
can_perform(_, point_and_name, _).

%% ask_for_directions
% Action: ask_for_directions
% Ask an NPC for directions using the target language
% Type: language / language

action(ask_for_directions, 'ask_for_directions', language, 0).
action_difficulty(ask_for_directions, 0.4).
action_duration(ask_for_directions, 1).
action_category(ask_for_directions, language).
action_verb(ask_for_directions, past, 'asked for directions').
action_verb(ask_for_directions, present, 'asks for directions').
action_target_type(ask_for_directions, other).
action_requires_target(ask_for_directions).
action_range(ask_for_directions, 5).
action_prerequisite(ask_for_directions, (near(Actor, Target, 5))).
action_prerequisite(ask_for_directions, (speaks_language(Actor, _, _))).
action_effect(ask_for_directions, (modify_xp(Actor, language, 5))).
% Can Actor perform this action?
can_perform(Actor, ask_for_directions, Target) :-
    near(Actor, Target, 5),
    speaks_language(Actor, _, _).

%% order_food
% Action: order_food
% Order food or drinks at a restaurant or market in the target language
% Type: language / language

action(order_food, 'order_food', language, 0).
action_difficulty(order_food, 0.4).
action_duration(order_food, 1).
action_category(order_food, language).
action_verb(order_food, past, 'ordered food').
action_verb(order_food, present, 'orders food').
action_target_type(order_food, other).
action_requires_target(order_food).
action_range(order_food, 5).
action_prerequisite(order_food, (near(Actor, Target, 5))).
action_prerequisite(order_food, (npc_will_trade(Target))).
action_prerequisite(order_food, (speaks_language(Actor, Lang, Level), cefr_gte(Level, a1))).
action_effect(order_food, (modify_gold(Actor, -5))).
action_effect(order_food, (assert(has_item(Actor, food, 1)))).
action_effect(order_food, (modify_xp(Actor, language, 8))).
% Can Actor perform this action?
can_perform(Actor, order_food, Target) :-
    near(Actor, Target, 5),
    npc_will_trade(Target),
    speaks_language(Actor, Lang, Level), cefr_gte(Level, a1).

%% haggle_price
% Action: haggle_price
% Negotiate a price with a merchant using the target language
% Type: language / language

action(haggle_price, 'haggle_price', language, 1).
action_difficulty(haggle_price, 0.6).
action_duration(haggle_price, 1).
action_category(haggle_price, language).
action_verb(haggle_price, past, 'haggled with').
action_verb(haggle_price, present, 'haggles with').
action_target_type(haggle_price, other).
action_requires_target(haggle_price).
action_range(haggle_price, 5).
action_prerequisite(haggle_price, (near(Actor, Target, 5))).
action_prerequisite(haggle_price, (npc_will_trade(Target))).
action_prerequisite(haggle_price, (speaks_language(Actor, Lang, Level), cefr_gte(Level, a2))).
action_effect(haggle_price, (modify_xp(Actor, language, 10))).
action_effect(haggle_price, (modify_xp(Actor, bargaining, 3))).
% Can Actor perform this action?
can_perform(Actor, haggle_price, Target) :-
    near(Actor, Target, 5),
    npc_will_trade(Target),
    speaks_language(Actor, Lang, Level), cefr_gte(Level, a2).

%% introduce_self
% Action: introduce_self
% Introduce yourself to an NPC in the target language
% Type: language / language

action(introduce_self, 'introduce_self', language, 0).
action_difficulty(introduce_self, 0.2).
action_duration(introduce_self, 1).
action_category(introduce_self, language).
action_verb(introduce_self, past, 'introduced oneself to').
action_verb(introduce_self, present, 'introduces oneself to').
action_target_type(introduce_self, other).
action_requires_target(introduce_self).
action_range(introduce_self, 5).
action_prerequisite(introduce_self, (near(Actor, Target, 5))).
action_prerequisite(introduce_self, (speaks_language(Actor, _, _))).
action_effect(introduce_self, (assert(met(Actor, Target)))).
action_effect(introduce_self, (modify_xp(Actor, language, 5))).
% Can Actor perform this action?
can_perform(Actor, introduce_self, Target) :-
    near(Actor, Target, 5),
    speaks_language(Actor, _, _).

%% describe_scene
% Action: describe_scene
% Describe what you see in the current location in the target language
% Type: language / language

action(describe_scene, 'describe_scene', language, 1).
action_difficulty(describe_scene, 0.5).
action_duration(describe_scene, 1).
action_category(describe_scene, language).
action_verb(describe_scene, past, 'described the scene').
action_verb(describe_scene, present, 'describes the scene').
action_target_type(describe_scene, self).
action_prerequisite(describe_scene, (speaks_language(Actor, _, Level), cefr_gte(Level, a2))).
action_effect(describe_scene, (modify_xp(Actor, language, 10))).
% Can Actor perform this action?
can_perform(Actor, describe_scene) :-
    speaks_language(Actor, _, Level), cefr_gte(Level, a2).

%% walk
% Action: walk
% Walk at a normal pace to a destination
% Type: movement / movement

action(walk, 'walk', movement, 1).
action_difficulty(walk, 0).
action_duration(walk, 1).
action_category(walk, movement).
action_parent(walk, move).
action_verb(walk, past, 'walked').
action_verb(walk, present, 'walks').
action_target_type(walk, location).
action_requires_target(walk).
% Can Actor perform this action?
can_perform(_, walk, _).

%% walk_formal
% Action: walk_formal
% Walk in a formal, dignified manner
% Type: movement / movement

action(walk_formal, 'walk_formal', movement, 1).
action_difficulty(walk_formal, 0).
action_duration(walk_formal, 1).
action_category(walk_formal, movement).
action_parent(walk_formal, move).
action_verb(walk_formal, past, 'walked formally').
action_verb(walk_formal, present, 'walks formally').
action_target_type(walk_formal, location).
action_requires_target(walk_formal).
% Can Actor perform this action?
can_perform(Actor, walk_formal, Target) :-
    action(walk_formal, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% jog
% Action: jog
% Jog at a moderate pace
% Type: movement / movement

action(jog, 'jog', movement, 2).
action_difficulty(jog, 0.1).
action_duration(jog, 1).
action_category(jog, movement).
action_parent(jog, move).
action_verb(jog, past, 'jogged').
action_verb(jog, present, 'jogs').
action_target_type(jog, location).
action_requires_target(jog).
% Can Actor perform this action?
can_perform(Actor, jog, Target) :-
    action(jog, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% sprint
% Action: sprint
% Run at full speed
% Type: movement / movement

action(sprint, 'sprint', movement, 4).
action_difficulty(sprint, 0.2).
action_duration(sprint, 1).
action_category(sprint, movement).
action_parent(sprint, move).
action_verb(sprint, past, 'sprinted').
action_verb(sprint, present, 'sprints').
action_target_type(sprint, location).
action_requires_target(sprint).
% Can Actor perform this action?
can_perform(Actor, sprint, Target) :-
    action(sprint, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% crouch_walk
% Action: crouch_walk
% Move stealthily while crouching
% Type: movement / movement

action(crouch_walk, 'crouch_walk', movement, 2).
action_difficulty(crouch_walk, 0.3).
action_duration(crouch_walk, 1).
action_category(crouch_walk, movement).
action_parent(crouch_walk, move).
action_verb(crouch_walk, past, 'crept').
action_verb(crouch_walk, present, 'creeps').
action_target_type(crouch_walk, location).
action_requires_target(crouch_walk).
% Can Actor perform this action?
can_perform(Actor, crouch_walk, Target) :-
    action(crouch_walk, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% crouch_idle
% Action: crouch_idle
% Crouch in place, hiding or waiting
% Type: movement / movement

action(crouch_idle, 'crouch_idle', movement, 1).
action_difficulty(crouch_idle, 0.1).
action_duration(crouch_idle, 1).
action_category(crouch_idle, movement).
action_parent(crouch_idle, move).
action_verb(crouch_idle, past, 'crouched').
action_verb(crouch_idle, present, 'crouches').
action_target_type(crouch_idle, none).
% Can Actor perform this action?
can_perform(Actor, crouch_idle) :-
    action(crouch_idle, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% jump
% Action: jump
% Jump over an obstacle or gap
% Type: movement / movement

action(jump, 'jump', movement, 3).
action_difficulty(jump, 0.3).
action_duration(jump, 1).
action_category(jump, movement).
action_verb(jump, past, 'jumped').
action_verb(jump, present, 'jumps').
action_target_type(jump, none).
action_cooldown(jump, 1).
% Can Actor perform this action?
can_perform(_, jump).

%% roll
% Action: roll
% Perform a dodge roll
% Type: movement / movement

action(roll, 'roll', movement, 3).
action_difficulty(roll, 0.4).
action_duration(roll, 1).
action_category(roll, movement).
action_parent(roll, jump).
action_verb(roll, past, 'rolled').
action_verb(roll, present, 'rolls').
action_target_type(roll, none).
action_cooldown(roll, 2).
% Can Actor perform this action?
can_perform(Actor, roll) :-
    action(roll, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% swim
% Action: swim
% Swim through water
% Type: movement / movement

action(swim, 'swim', movement, 3).
action_difficulty(swim, 0.3).
action_duration(swim, 1).
action_category(swim, movement).
action_parent(swim, move).
action_verb(swim, past, 'swam').
action_verb(swim, present, 'swims').
action_target_type(swim, location).
action_requires_target(swim).
% Can Actor perform this action?
can_perform(Actor, swim, Target) :-
    action(swim, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% swim_idle
% Action: swim_idle
% Tread water in place
% Type: movement / movement

action(swim_idle, 'swim_idle', movement, 2).
action_difficulty(swim_idle, 0.2).
action_duration(swim_idle, 1).
action_category(swim_idle, movement).
action_parent(swim_idle, move).
action_verb(swim_idle, past, 'treaded water').
action_verb(swim_idle, present, 'treads water').
action_target_type(swim_idle, none).
% Can Actor perform this action?
can_perform(Actor, swim_idle) :-
    action(swim_idle, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% slide
% Action: slide
% Slide under an obstacle or down a slope
% Type: movement / movement

action(slide, 'slide', movement, 2).
action_difficulty(slide, 0.4).
action_duration(slide, 1).
action_category(slide, movement).
action_parent(slide, jump).
action_verb(slide, past, 'slid').
action_verb(slide, present, 'slides').
action_target_type(slide, none).
action_cooldown(slide, 2).
% Can Actor perform this action?
can_perform(Actor, slide) :-
    action(slide, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% climb
% Action: climb
% Climb up a ledge or wall
% Type: movement / movement

action(climb, 'climb', movement, 4).
action_difficulty(climb, 0.5).
action_duration(climb, 2).
action_category(climb, movement).
action_parent(climb, jump).
action_verb(climb, past, 'climbed').
action_verb(climb, present, 'climbs').
action_target_type(climb, object).
action_requires_target(climb).
action_range(climb, 2).
% Can Actor perform this action?
can_perform(Actor, climb, Target) :-
    action(climb, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% ninja_jump
% Action: ninja_jump
% Perform an acrobatic double-jump
% Type: movement / movement

action(ninja_jump, 'ninja_jump', movement, 5).
action_difficulty(ninja_jump, 0.7).
action_duration(ninja_jump, 1).
action_category(ninja_jump, movement).
action_parent(ninja_jump, jump).
action_verb(ninja_jump, past, 'leapt').
action_verb(ninja_jump, present, 'leaps').
action_target_type(ninja_jump, none).
action_cooldown(ninja_jump, 3).
% Can Actor perform this action?
can_perform(Actor, ninja_jump) :-
    action(ninja_jump, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% walk_carry
% Action: walk_carry
% Walk while carrying a heavy object
% Type: movement / movement

action(walk_carry, 'walk_carry', movement, 3).
action_difficulty(walk_carry, 0.2).
action_duration(walk_carry, 1).
action_category(walk_carry, movement).
action_parent(walk_carry, move).
action_verb(walk_carry, past, 'carried').
action_verb(walk_carry, present, 'carries').
action_target_type(walk_carry, location).
action_requires_target(walk_carry).
% Can Actor perform this action?
can_perform(Actor, walk_carry, Target) :-
    action(walk_carry, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% idle
% Action: idle
% Stand idle, waiting or resting
% Type: social / social

action(idle, 'idle', social, 0).
action_difficulty(idle, 0).
action_duration(idle, 1).
action_category(idle, social).
action_verb(idle, past, 'stood idle').
action_verb(idle, present, 'stands idle').
action_target_type(idle, none).
% Can Actor perform this action?
can_perform(_, idle).

%% talk
% Action: talk
% Talk with someone nearby
% Type: social / social

action(talk, 'talk', social, 0).
action_difficulty(talk, 0.1).
action_duration(talk, 2).
action_category(talk, social).
action_parent(talk, talk_to_npc).
action_verb(talk, past, 'talked').
action_verb(talk, present, 'talks').
action_target_type(talk, other).
action_requires_target(talk).
action_range(talk, 5).
% Can Actor perform this action?
can_perform(Actor, talk, Target) :-
    action(talk, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% dance
% Action: dance
% Dance with joy or celebration
% Type: social / social

action(dance, 'dance', social, 2).
action_difficulty(dance, 0.2).
action_duration(dance, 3).
action_category(dance, social).
action_parent(dance, express).
action_verb(dance, past, 'danced').
action_verb(dance, present, 'dances').
action_target_type(dance, none).
action_cooldown(dance, 5).
% Can Actor perform this action?
can_perform(_, dance).

%% sit_down
% Action: sit_down
% Sit down on a chair or bench
% Type: social / social

action(sit_down, 'sit_down', social, 0).
action_difficulty(sit_down, 0).
action_duration(sit_down, 1).
action_category(sit_down, social).
action_parent(sit_down, idle).
action_verb(sit_down, past, 'sat down').
action_verb(sit_down, present, 'sits down').
action_target_type(sit_down, object).
action_requires_target(sit_down).
action_range(sit_down, 2).
% Can Actor perform this action?
can_perform(Actor, sit_down, Target) :-
    action(sit_down, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% sit_idle
% Action: sit_idle
% Sit quietly, resting or waiting
% Type: social / social

action(sit_idle, 'sit_idle', social, 0).
action_difficulty(sit_idle, 0).
action_duration(sit_idle, 1).
action_category(sit_idle, social).
action_parent(sit_idle, idle).
action_verb(sit_idle, past, 'sat').
action_verb(sit_idle, present, 'sits').
action_target_type(sit_idle, none).
% Can Actor perform this action?
can_perform(Actor, sit_idle) :-
    action(sit_idle, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% sit_talk
% Action: sit_talk
% Chat while sitting
% Type: social / social

action(sit_talk, 'sit_talk', social, 0).
action_difficulty(sit_talk, 0.1).
action_duration(sit_talk, 2).
action_category(sit_talk, social).
action_parent(sit_talk, talk_to_npc).
action_verb(sit_talk, past, 'chatted').
action_verb(sit_talk, present, 'chats').
action_target_type(sit_talk, other).
action_requires_target(sit_talk).
action_range(sit_talk, 5).
% Can Actor perform this action?
can_perform(Actor, sit_talk, Target) :-
    action(sit_talk, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% stand_up
% Action: stand_up
% Stand up from a seated position
% Type: social / social

action(stand_up, 'stand_up', social, 0).
action_difficulty(stand_up, 0).
action_duration(stand_up, 1).
action_category(stand_up, social).
action_parent(stand_up, idle).
action_verb(stand_up, past, 'stood up').
action_verb(stand_up, present, 'stands up').
action_target_type(stand_up, none).
% Can Actor perform this action?
can_perform(Actor, stand_up) :-
    action(stand_up, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% fold_arms
% Action: fold_arms
% Stand with arms folded, looking impatient or thoughtful
% Type: social / social

action(fold_arms, 'fold_arms', social, 0).
action_difficulty(fold_arms, 0).
action_duration(fold_arms, 1).
action_category(fold_arms, social).
action_parent(fold_arms, express).
action_verb(fold_arms, past, 'folded arms').
action_verb(fold_arms, present, 'folds arms').
action_target_type(fold_arms, none).
% Can Actor perform this action?
can_perform(Actor, fold_arms) :-
    action(fold_arms, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% nod_yes
% Action: nod_yes
% Nod in agreement
% Type: social / social

action(nod_yes, 'nod_yes', social, 0).
action_difficulty(nod_yes, 0).
action_duration(nod_yes, 1).
action_category(nod_yes, social).
action_parent(nod_yes, express).
action_verb(nod_yes, past, 'nodded').
action_verb(nod_yes, present, 'nods').
action_target_type(nod_yes, other).
action_requires_target(nod_yes).
action_range(nod_yes, 5).
% Can Actor perform this action?
can_perform(Actor, nod_yes, Target) :-
    action(nod_yes, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% shake_head_no
% Action: shake_head_no
% Shake head in disagreement
% Type: social / social

action(shake_head_no, 'shake_head_no', social, 0).
action_difficulty(shake_head_no, 0).
action_duration(shake_head_no, 1).
action_category(shake_head_no, social).
action_parent(shake_head_no, express).
action_verb(shake_head_no, past, 'shook head').
action_verb(shake_head_no, present, 'shakes head').
action_target_type(shake_head_no, other).
action_requires_target(shake_head_no).
action_range(shake_head_no, 5).
% Can Actor perform this action?
can_perform(Actor, shake_head_no, Target) :-
    action(shake_head_no, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% phone_call
% Action: phone_call
% Talk on a phone or communication device
% Type: social / social

action(phone_call, 'phone_call', social, 0).
action_difficulty(phone_call, 0).
action_duration(phone_call, 3).
action_category(phone_call, social).
action_parent(phone_call, talk_to_npc).
action_verb(phone_call, past, 'made a call').
action_verb(phone_call, present, 'makes a call').
action_target_type(phone_call, none).
% Can Actor perform this action?
can_perform(Actor, phone_call) :-
    action(phone_call, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% lean_railing
% Action: lean_railing
% Lean against a railing or fence
% Type: social / social

action(lean_railing, 'lean_railing', social, 0).
action_difficulty(lean_railing, 0).
action_duration(lean_railing, 1).
action_category(lean_railing, social).
action_parent(lean_railing, idle).
action_verb(lean_railing, past, 'leaned').
action_verb(lean_railing, present, 'leans').
action_target_type(lean_railing, object).
action_requires_target(lean_railing).
action_range(lean_railing, 2).
% Can Actor perform this action?
can_perform(Actor, lean_railing, Target) :-
    action(lean_railing, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% call_out
% Action: call_out
% Call out to someone from a railing or balcony
% Type: social / social

action(call_out, 'call_out', social, 0).
action_difficulty(call_out, 0).
action_duration(call_out, 1).
action_category(call_out, social).
action_parent(call_out, express).
action_verb(call_out, past, 'called out').
action_verb(call_out, present, 'calls out').
action_target_type(call_out, other).
action_requires_target(call_out).
action_range(call_out, 15).
action_cooldown(call_out, 3).
% Can Actor perform this action?
can_perform(Actor, call_out, Target) :-
    action(call_out, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% get_up
% Action: get_up
% Get up from lying down
% Type: social / social

action(get_up, 'get_up', social, 0).
action_difficulty(get_up, 0).
action_duration(get_up, 1).
action_category(get_up, social).
action_parent(get_up, idle).
action_verb(get_up, past, 'got up').
action_verb(get_up, present, 'gets up').
action_target_type(get_up, none).
% Can Actor perform this action?
can_perform(Actor, get_up) :-
    action(get_up, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% sword_attack
% Action: sword_attack
% Strike with a sword or bladed weapon
% Type: combat / combat

action(sword_attack, 'sword_attack', combat, 3).
action_difficulty(sword_attack, 0.4).
action_duration(sword_attack, 1).
action_category(sword_attack, combat).
action_parent(sword_attack, attack_enemy).
action_verb(sword_attack, past, 'slashed').
action_verb(sword_attack, present, 'slashes').
action_target_type(sword_attack, other).
action_requires_target(sword_attack).
action_range(sword_attack, 3).
action_cooldown(sword_attack, 1).
action_prerequisite(sword_attack, (energy(Actor, E, _), E >= 10)).
action_prerequisite(sword_attack, (near(Actor, Target, 3))).
action_prerequisite(sword_attack, (alive(Target))).
action_prerequisite(sword_attack, (has_equipped(Actor, weapon, W), is_weapon_type(W, sword))).
action_effect(sword_attack, (modify_health(Target, -15))).
action_effect(sword_attack, (modify_energy(Actor, -12))).
action_effect(sword_attack, (modify_xp(Actor, combat, 8))).
% Can Actor perform this action?
can_perform(Actor, sword_attack, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target),
    has_equipped(Actor, weapon, W), is_weapon_type(W, sword).

%% sword_idle
% Action: sword_idle
% Hold a sword at the ready
% Type: combat / combat

action(sword_idle, 'sword_idle', combat, 0).
action_difficulty(sword_idle, 0).
action_duration(sword_idle, 1).
action_category(sword_idle, combat).
action_parent(sword_idle, attack_enemy).
action_verb(sword_idle, past, 'readied sword').
action_verb(sword_idle, present, 'readies sword').
action_target_type(sword_idle, none).
action_prerequisite(sword_idle, (energy(Actor, E, _), E >= 10)).
action_prerequisite(sword_idle, (near(Actor, Target, 3))).
action_prerequisite(sword_idle, (alive(Target))).
% Can Actor perform this action?
can_perform(Actor, sword_idle) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target).

%% sword_combo
% Action: sword_combo
% Perform a multi-hit sword combo
% Type: combat / combat

action(sword_combo, 'sword_combo', combat, 6).
action_difficulty(sword_combo, 0.6).
action_duration(sword_combo, 2).
action_category(sword_combo, combat).
action_parent(sword_combo, attack_enemy).
action_verb(sword_combo, past, 'unleashed a combo').
action_verb(sword_combo, present, 'unleashes a combo').
action_target_type(sword_combo, other).
action_requires_target(sword_combo).
action_range(sword_combo, 3).
action_cooldown(sword_combo, 3).
action_prerequisite(sword_combo, (energy(Actor, E, _), E >= 10)).
action_prerequisite(sword_combo, (near(Actor, Target, 3))).
action_prerequisite(sword_combo, (alive(Target))).
action_prerequisite(sword_combo, (has_equipped(Actor, weapon, W), is_weapon_type(W, sword))).
action_effect(sword_combo, (modify_health(Target, -25))).
action_effect(sword_combo, (modify_energy(Actor, -20))).
action_effect(sword_combo, (modify_xp(Actor, combat, 12))).
% Can Actor perform this action?
can_perform(Actor, sword_combo, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target),
    has_equipped(Actor, weapon, W), is_weapon_type(W, sword).

%% sword_block
% Action: sword_block
% Block an incoming attack with a sword
% Type: combat / combat

action(sword_block, 'sword_block', combat, 2).
action_difficulty(sword_block, 0.4).
action_duration(sword_block, 1).
action_category(sword_block, combat).
action_parent(sword_block, defend).
action_verb(sword_block, past, 'blocked').
action_verb(sword_block, present, 'blocks').
action_target_type(sword_block, none).
action_cooldown(sword_block, 1).
action_prerequisite(sword_block, (has_equipped(Actor, weapon, W), is_weapon_type(W, sword))).
action_effect(sword_block, (modify_energy(Actor, -5))).
% Can Actor perform this action?
can_perform(Actor, sword_block) :-
    has_equipped(Actor, weapon, W), is_weapon_type(W, sword).

%% sword_dash
% Action: sword_dash
% Dash forward with a sword strike
% Type: combat / combat

action(sword_dash, 'sword_dash', combat, 5).
action_difficulty(sword_dash, 0.6).
action_duration(sword_dash, 1).
action_category(sword_dash, combat).
action_parent(sword_dash, attack_enemy).
action_verb(sword_dash, past, 'dash-attacked').
action_verb(sword_dash, present, 'dash-attacks').
action_target_type(sword_dash, other).
action_requires_target(sword_dash).
action_range(sword_dash, 6).
action_cooldown(sword_dash, 4).
action_prerequisite(sword_dash, (energy(Actor, E, _), E >= 10)).
action_prerequisite(sword_dash, (near(Actor, Target, 3))).
action_prerequisite(sword_dash, (alive(Target))).
action_prerequisite(sword_dash, (has_equipped(Actor, weapon, W), is_weapon_type(W, sword))).
action_effect(sword_dash, (modify_health(Target, -20))).
action_effect(sword_dash, (modify_energy(Actor, -18))).
action_effect(sword_dash, (modify_xp(Actor, combat, 10))).
% Can Actor perform this action?
can_perform(Actor, sword_dash, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target),
    has_equipped(Actor, weapon, W), is_weapon_type(W, sword).

%% punch
% Action: punch
% Throw a quick punch
% Type: combat / combat

action(punch, 'punch', combat, 2).
action_difficulty(punch, 0.3).
action_duration(punch, 1).
action_category(punch, combat).
action_parent(punch, attack_enemy).
action_verb(punch, past, 'punched').
action_verb(punch, present, 'punches').
action_target_type(punch, other).
action_requires_target(punch).
action_range(punch, 2).
action_cooldown(punch, 1).
action_prerequisite(punch, (energy(Actor, E, _), E >= 10)).
action_prerequisite(punch, (near(Actor, Target, 3))).
action_prerequisite(punch, (alive(Target))).
action_effect(punch, (modify_health(Target, -8))).
action_effect(punch, (modify_energy(Actor, -8))).
action_effect(punch, (modify_xp(Actor, combat, 4))).
% Can Actor perform this action?
can_perform(Actor, punch, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target).

%% punch_heavy
% Action: punch_heavy
% Throw a powerful cross punch
% Type: combat / combat

action(punch_heavy, 'punch_heavy', combat, 4).
action_difficulty(punch_heavy, 0.5).
action_duration(punch_heavy, 1).
action_category(punch_heavy, combat).
action_parent(punch_heavy, attack_enemy).
action_verb(punch_heavy, past, 'struck hard').
action_verb(punch_heavy, present, 'strikes hard').
action_target_type(punch_heavy, other).
action_requires_target(punch_heavy).
action_range(punch_heavy, 2).
action_cooldown(punch_heavy, 2).
action_prerequisite(punch_heavy, (energy(Actor, E, _), E >= 10)).
action_prerequisite(punch_heavy, (near(Actor, Target, 3))).
action_prerequisite(punch_heavy, (alive(Target))).
action_effect(punch_heavy, (modify_health(Target, -15))).
action_effect(punch_heavy, (modify_energy(Actor, -15))).
action_effect(punch_heavy, (modify_xp(Actor, combat, 6))).
% Can Actor perform this action?
can_perform(Actor, punch_heavy, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target).

%% melee_hook
% Action: melee_hook
% Deliver a powerful hook punch
% Type: combat / combat

action(melee_hook, 'melee_hook', combat, 4).
action_difficulty(melee_hook, 0.5).
action_duration(melee_hook, 1).
action_category(melee_hook, combat).
action_parent(melee_hook, attack_enemy).
action_verb(melee_hook, past, 'hooked').
action_verb(melee_hook, present, 'hooks').
action_target_type(melee_hook, other).
action_requires_target(melee_hook).
action_range(melee_hook, 2).
action_cooldown(melee_hook, 2).
action_prerequisite(melee_hook, (energy(Actor, E, _), E >= 10)).
action_prerequisite(melee_hook, (near(Actor, Target, 3))).
action_prerequisite(melee_hook, (alive(Target))).
action_effect(melee_hook, (modify_health(Target, -12))).
action_effect(melee_hook, (modify_energy(Actor, -12))).
action_effect(melee_hook, (modify_xp(Actor, combat, 5))).
% Can Actor perform this action?
can_perform(Actor, melee_hook, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target).

%% shield_block
% Action: shield_block
% Raise shield to block attacks
% Type: combat / combat

action(shield_block, 'shield_block', combat, 2).
action_difficulty(shield_block, 0.3).
action_duration(shield_block, 1).
action_category(shield_block, combat).
action_parent(shield_block, defend).
action_verb(shield_block, past, 'raised shield').
action_verb(shield_block, present, 'raises shield').
action_target_type(shield_block, none).
action_cooldown(shield_block, 1).
action_prerequisite(shield_block, (has_equipped(Actor, shield, _))).
action_effect(shield_block, (modify_energy(Actor, -5))).
% Can Actor perform this action?
can_perform(Actor, shield_block) :-
    has_equipped(Actor, shield, _).

%% shield_bash
% Action: shield_bash
% Bash an enemy with a shield
% Type: combat / combat

action(shield_bash, 'shield_bash', combat, 4).
action_difficulty(shield_bash, 0.5).
action_duration(shield_bash, 1).
action_category(shield_bash, combat).
action_parent(shield_bash, attack_enemy).
action_verb(shield_bash, past, 'shield-bashed').
action_verb(shield_bash, present, 'shield-bashes').
action_target_type(shield_bash, other).
action_requires_target(shield_bash).
action_range(shield_bash, 2).
action_cooldown(shield_bash, 3).
action_prerequisite(shield_bash, (energy(Actor, E, _), E >= 10)).
action_prerequisite(shield_bash, (near(Actor, Target, 3))).
action_prerequisite(shield_bash, (alive(Target))).
action_prerequisite(shield_bash, (has_equipped(Actor, shield, _))).
action_effect(shield_bash, (modify_health(Target, -8))).
action_effect(shield_bash, (modify_energy(Actor, -10))).
action_effect(shield_bash, (modify_xp(Actor, combat, 5))).
% Can Actor perform this action?
can_perform(Actor, shield_bash, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target),
    has_equipped(Actor, shield, _).

%% shield_dash
% Action: shield_dash
% Charge forward with shield raised
% Type: combat / combat

action(shield_dash, 'shield_dash', combat, 5).
action_difficulty(shield_dash, 0.6).
action_duration(shield_dash, 1).
action_category(shield_dash, combat).
action_parent(shield_dash, attack_enemy).
action_verb(shield_dash, past, 'shield-charged').
action_verb(shield_dash, present, 'shield-charges').
action_target_type(shield_dash, other).
action_requires_target(shield_dash).
action_range(shield_dash, 5).
action_cooldown(shield_dash, 4).
action_prerequisite(shield_dash, (energy(Actor, E, _), E >= 10)).
action_prerequisite(shield_dash, (near(Actor, Target, 3))).
action_prerequisite(shield_dash, (alive(Target))).
action_prerequisite(shield_dash, (has_equipped(Actor, shield, _))).
action_effect(shield_dash, (modify_health(Target, -10))).
action_effect(shield_dash, (modify_energy(Actor, -15))).
action_effect(shield_dash, (modify_xp(Actor, combat, 6))).
% Can Actor perform this action?
can_perform(Actor, shield_dash, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target),
    has_equipped(Actor, shield, _).

%% pistol_shoot
% Action: pistol_shoot
% Fire a pistol or handgun
% Type: combat / combat

action(pistol_shoot, 'pistol_shoot', combat, 2).
action_difficulty(pistol_shoot, 0.4).
action_duration(pistol_shoot, 1).
action_category(pistol_shoot, combat).
action_parent(pistol_shoot, attack_enemy).
action_verb(pistol_shoot, past, 'shot').
action_verb(pistol_shoot, present, 'shoots').
action_target_type(pistol_shoot, other).
action_requires_target(pistol_shoot).
action_range(pistol_shoot, 15).
action_cooldown(pistol_shoot, 1).
action_prerequisite(pistol_shoot, (energy(Actor, E, _), E >= 10)).
action_prerequisite(pistol_shoot, (near(Actor, Target, 3))).
action_prerequisite(pistol_shoot, (alive(Target))).
action_prerequisite(pistol_shoot, (has_equipped(Actor, weapon, W), is_weapon_type(W, pistol))).
action_effect(pistol_shoot, (modify_health(Target, -20))).
action_effect(pistol_shoot, (modify_energy(Actor, -10))).
action_effect(pistol_shoot, (modify_xp(Actor, combat, 10))).
% Can Actor perform this action?
can_perform(Actor, pistol_shoot, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target),
    has_equipped(Actor, weapon, W), is_weapon_type(W, pistol).

%% pistol_aim
% Action: pistol_aim
% Aim a pistol at a target
% Type: combat / combat

action(pistol_aim, 'pistol_aim', combat, 1).
action_difficulty(pistol_aim, 0.2).
action_duration(pistol_aim, 1).
action_category(pistol_aim, combat).
action_parent(pistol_aim, attack_enemy).
action_verb(pistol_aim, past, 'aimed').
action_verb(pistol_aim, present, 'aims').
action_target_type(pistol_aim, other).
action_requires_target(pistol_aim).
action_range(pistol_aim, 15).
action_prerequisite(pistol_aim, (energy(Actor, E, _), E >= 10)).
action_prerequisite(pistol_aim, (near(Actor, Target, 3))).
action_prerequisite(pistol_aim, (alive(Target))).
% Can Actor perform this action?
can_perform(Actor, pistol_aim, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target).

%% pistol_reload
% Action: pistol_reload
% Reload a pistol
% Type: combat / combat

action(pistol_reload, 'pistol_reload', combat, 0).
action_difficulty(pistol_reload, 0.2).
action_duration(pistol_reload, 2).
action_category(pistol_reload, combat).
action_parent(pistol_reload, attack_enemy).
action_verb(pistol_reload, past, 'reloaded').
action_verb(pistol_reload, present, 'reloads').
action_target_type(pistol_reload, none).
action_prerequisite(pistol_reload, (energy(Actor, E, _), E >= 10)).
action_prerequisite(pistol_reload, (near(Actor, Target, 3))).
action_prerequisite(pistol_reload, (alive(Target))).
% Can Actor perform this action?
can_perform(Actor, pistol_reload) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target).

%% throw_projectile
% Action: throw_projectile
% Throw an object at a target
% Type: combat / combat

action(throw_projectile, 'throw_projectile', combat, 3).
action_difficulty(throw_projectile, 0.4).
action_duration(throw_projectile, 1).
action_category(throw_projectile, combat).
action_parent(throw_projectile, attack_enemy).
action_verb(throw_projectile, past, 'threw').
action_verb(throw_projectile, present, 'throws').
action_target_type(throw_projectile, other).
action_requires_target(throw_projectile).
action_range(throw_projectile, 10).
action_cooldown(throw_projectile, 2).
action_prerequisite(throw_projectile, (energy(Actor, E, _), E >= 10)).
action_prerequisite(throw_projectile, (near(Actor, Target, 3))).
action_prerequisite(throw_projectile, (alive(Target))).
action_prerequisite(throw_projectile, (has_item(Actor, projectile, _))).
action_effect(throw_projectile, (modify_health(Target, -12))).
action_effect(throw_projectile, (modify_energy(Actor, -8))).
action_effect(throw_projectile, (retract(has_item(Actor, projectile, _)))).
action_effect(throw_projectile, (modify_xp(Actor, combat, 5))).
% Can Actor perform this action?
can_perform(Actor, throw_projectile, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target),
    has_item(Actor, projectile, _).

%% hit_reaction
% Action: hit_reaction
% React to being hit in the chest
% Type: combat / combat

action(hit_reaction, 'hit_reaction', combat, 0).
action_difficulty(hit_reaction, 0).
action_duration(hit_reaction, 1).
action_category(hit_reaction, combat).
action_parent(hit_reaction, react).
action_verb(hit_reaction, past, 'staggered').
action_verb(hit_reaction, present, 'staggers').
action_target_type(hit_reaction, none).
% Can Actor perform this action?
can_perform(_, hit_reaction).

%% hit_head
% Action: hit_head
% React to being hit in the head
% Type: combat / combat

action(hit_head, 'hit_head', combat, 0).
action_difficulty(hit_head, 0).
action_duration(hit_head, 1).
action_category(hit_head, combat).
action_parent(hit_head, react).
action_verb(hit_head, past, 'reeled').
action_verb(hit_head, present, 'reels').
action_target_type(hit_head, none).
% Can Actor perform this action?
can_perform(_, hit_head).

%% knockback
% Action: knockback
% Get knocked back by a powerful blow
% Type: combat / combat

action(knockback, 'knockback', combat, 0).
action_difficulty(knockback, 0).
action_duration(knockback, 1).
action_category(knockback, combat).
action_parent(knockback, react).
action_verb(knockback, past, 'was knocked back').
action_verb(knockback, present, 'gets knocked back').
action_target_type(knockback, none).
% Can Actor perform this action?
can_perform(_, knockback).

%% die
% Action: die
% Fall in defeat
% Type: combat / combat

action(die, 'die', combat, 0).
action_difficulty(die, 0).
action_duration(die, 2).
action_category(die, combat).
action_parent(die, react).
action_verb(die, past, 'fell').
action_verb(die, present, 'falls').
action_target_type(die, none).
% Can Actor perform this action?
can_perform(_, die).

%% cast_spell
% Action: cast_spell
% Cast a spell or use a magical ability
% Type: combat / combat

action(cast_spell, 'cast_spell', combat, 5).
action_difficulty(cast_spell, 0.5).
action_duration(cast_spell, 2).
action_category(cast_spell, combat).
action_verb(cast_spell, past, 'cast a spell').
action_verb(cast_spell, present, 'casts a spell').
action_target_type(cast_spell, other).
action_requires_target(cast_spell).
action_range(cast_spell, 10).
action_cooldown(cast_spell, 3).
action_prerequisite(cast_spell, (energy(Actor, E, _), E >= 20)).
action_prerequisite(cast_spell, (has_ability(Actor, magic))).
action_effect(cast_spell, (modify_health(Target, -25))).
action_effect(cast_spell, (modify_energy(Actor, -20))).
action_effect(cast_spell, (modify_xp(Actor, magic, 10))).
% Can Actor perform this action?
can_perform(Actor, cast_spell, Target) :-
    energy(Actor, E, _), E >= 20,
    has_ability(Actor, magic).

%% spell_channel
% Action: spell_channel
% Channel magical energy
% Type: combat / combat

action(spell_channel, 'spell_channel', combat, 3).
action_difficulty(spell_channel, 0.4).
action_duration(spell_channel, 3).
action_category(spell_channel, combat).
action_parent(spell_channel, cast_spell).
action_verb(spell_channel, past, 'channeled').
action_verb(spell_channel, present, 'channels').
action_target_type(spell_channel, none).
action_prerequisite(spell_channel, (energy(Actor, E, _), E >= 20)).
action_prerequisite(spell_channel, (has_ability(Actor, magic))).
action_effect(spell_channel, (modify_energy(Actor, -20))).
action_effect(spell_channel, (modify_xp(Actor, magic, 8))).
% Can Actor perform this action?
can_perform(Actor, spell_channel) :-
    energy(Actor, E, _), E >= 20,
    has_ability(Actor, magic).

%% push_object
% Action: push_object
% Push a heavy object
% Type: physical / resource

action(push_object, 'push_object', physical, 4).
action_difficulty(push_object, 0.4).
action_duration(push_object, 2).
action_category(push_object, resource).
action_parent(push_object, work).
action_verb(push_object, past, 'pushed').
action_verb(push_object, present, 'pushes').
action_target_type(push_object, object).
action_requires_target(push_object).
action_range(push_object, 2).
action_prerequisite(push_object, (at_location(Actor, Workplace))).
action_prerequisite(push_object, (occupation(Actor, _))).
action_prerequisite(push_object, (energy(Actor, E, _), E >= 10)).
action_effect(push_object, (modify_energy(Actor, -10))).
% Can Actor perform this action?
can_perform(Actor, push_object, Target) :-
    at_location(Actor, Workplace),
    occupation(Actor, _),
    energy(Actor, E, _), E >= 10.

%% pick_up
% Action: pick_up
% Pick up an object from a table or surface
% Type: physical / exploration

action(pick_up, 'pick_up', physical, 0).
action_difficulty(pick_up, 0).
action_duration(pick_up, 1).
action_category(pick_up, exploration).
action_parent(pick_up, collect_item).
action_verb(pick_up, past, 'picked up').
action_verb(pick_up, present, 'picks up').
action_target_type(pick_up, object).
action_requires_target(pick_up).
action_range(pick_up, 2).
% Can Actor perform this action?
can_perform(Actor, pick_up, Target) :-
    action(pick_up, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% fix_repair
% Action: fix_repair
% Kneel down and repair or fix something
% Type: physical / resource

action(fix_repair, 'fix_repair', physical, 3).
action_difficulty(fix_repair, 0.4).
action_duration(fix_repair, 3).
action_category(fix_repair, resource).
action_parent(fix_repair, craft_item).
action_verb(fix_repair, past, 'repaired').
action_verb(fix_repair, present, 'repairs').
action_target_type(fix_repair, object).
action_requires_target(fix_repair).
action_range(fix_repair, 2).
action_prerequisite(fix_repair, (energy(Actor, E, _), E >= 10)).
action_prerequisite(fix_repair, (at_location_type(Actor, workshop))).
action_effect(fix_repair, (modify_energy(Actor, -15))).
action_effect(fix_repair, (modify_skill_xp(Actor, crafting, 1))).
% Can Actor perform this action?
can_perform(Actor, fix_repair, Target) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, workshop).

%% drive
% Action: drive
% Drive a vehicle or cart
% Type: physical / movement

action(drive, 'drive', physical, 1).
action_difficulty(drive, 0.3).
action_duration(drive, 1).
action_category(drive, movement).
action_parent(drive, move).
action_verb(drive, past, 'drove').
action_verb(drive, present, 'drives').
action_target_type(drive, object).
action_requires_target(drive).
action_range(drive, 2).
% Can Actor perform this action?
can_perform(Actor, drive, Target) :-
    action(drive, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% interact
% Action: interact
% Interact with an object or mechanism
% Type: physical / exploration

action(interact, 'interact', physical, 0).
action_difficulty(interact, 0.1).
action_duration(interact, 1).
action_category(interact, exploration).
action_verb(interact, past, 'interacted with').
action_verb(interact, present, 'interacts with').
action_target_type(interact, object).
action_requires_target(interact).
action_range(interact, 2).
% Can Actor perform this action?
can_perform(Actor, interact, Target) :-
    action(interact, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% open_container
% Action: open_container
% Open a container, chest, or box
% Type: physical / exploration

action(open_container, 'open_container', physical, 0).
action_difficulty(open_container, 0.1).
action_duration(open_container, 1).
action_category(open_container, exploration).
action_verb(open_container, past, 'opened').
action_verb(open_container, present, 'opens').
action_target_type(open_container, object).
action_requires_target(open_container).
action_range(open_container, 2).
% Can Actor perform this action?
can_perform(Actor, open_container, Target) :-
    action(open_container, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% consume
% Action: consume
% Eat food or drink a beverage
% Type: physical / items

action(consume, 'consume', physical, 0).
action_difficulty(consume, 0).
action_duration(consume, 2).
action_category(consume, items).
action_parent(consume, use_item).
action_verb(consume, past, 'consumed').
action_verb(consume, present, 'consumes').
action_target_type(consume, none).
action_prerequisite(consume, (has_item(Actor, _, _))).
action_effect(consume, (retract(has_item(Actor, Item, _)))).
action_effect(consume, (modify_health(Actor, 10))).
action_effect(consume, (modify_energy(Actor, 10))).
% Can Actor perform this action?
can_perform(Actor, consume) :-
    has_item(Actor, _, _).

%% chop_tree
% Action: chop_tree
% Chop down a tree for wood
% Type: physical / resource

action(chop_tree, 'chop_tree', physical, 5).
action_difficulty(chop_tree, 0.4).
action_duration(chop_tree, 5).
action_category(chop_tree, resource).
action_parent(chop_tree, gather).
action_verb(chop_tree, past, 'chopped').
action_verb(chop_tree, present, 'chops').
action_target_type(chop_tree, object).
action_requires_target(chop_tree).
action_range(chop_tree, 2).
action_prerequisite(chop_tree, (energy(Actor, E, _), E >= 10)).
action_prerequisite(chop_tree, (at_location_type(Actor, LocType))).
action_prerequisite(chop_tree, (has_item(Actor, axe, _))).
action_prerequisite(chop_tree, (at_location_type(Actor, forest))).
action_effect(chop_tree, (assert(has_item(Actor, wood, 1)))).
action_effect(chop_tree, (modify_energy(Actor, -15))).
action_effect(chop_tree, (modify_skill_xp(Actor, woodcutting, 1))).
% Can Actor perform this action?
can_perform(Actor, chop_tree, Target) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, LocType),
    has_item(Actor, axe, _),
    at_location_type(Actor, forest).

%% farm_harvest
% Action: farm_harvest
% Harvest crops from a field
% Type: physical / resource

action(farm_harvest, 'farm_harvest', physical, 3).
action_difficulty(farm_harvest, 0.2).
action_duration(farm_harvest, 3).
action_category(farm_harvest, resource).
action_parent(farm_harvest, farm).
action_verb(farm_harvest, past, 'harvested').
action_verb(farm_harvest, present, 'harvests').
action_target_type(farm_harvest, object).
action_requires_target(farm_harvest).
action_range(farm_harvest, 2).
action_prerequisite(farm_harvest, (energy(Actor, E, _), E >= 10)).
action_prerequisite(farm_harvest, (at_location_type(Actor, farm))).
action_effect(farm_harvest, (assert(has_item(Actor, crop, 1)))).
action_effect(farm_harvest, (modify_energy(Actor, -10))).
action_effect(farm_harvest, (modify_skill_xp(Actor, farming, 1))).
% Can Actor perform this action?
can_perform(Actor, farm_harvest, Target) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, farm).

%% farm_plant
% Action: farm_plant
% Plant seeds in prepared soil
% Type: physical / resource

action(farm_plant, 'farm_plant', physical, 2).
action_difficulty(farm_plant, 0.2).
action_duration(farm_plant, 2).
action_category(farm_plant, resource).
action_parent(farm_plant, farm).
action_verb(farm_plant, past, 'planted').
action_verb(farm_plant, present, 'plants').
action_target_type(farm_plant, object).
action_requires_target(farm_plant).
action_range(farm_plant, 2).
action_prerequisite(farm_plant, (energy(Actor, E, _), E >= 10)).
action_prerequisite(farm_plant, (at_location_type(Actor, farm))).
action_effect(farm_plant, (modify_energy(Actor, -10))).
action_effect(farm_plant, (modify_skill_xp(Actor, farming, 1))).
% Can Actor perform this action?
can_perform(Actor, farm_plant, Target) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, farm).

%% farm_water
% Action: farm_water
% Water crops or a garden
% Type: physical / resource

action(farm_water, 'farm_water', physical, 2).
action_difficulty(farm_water, 0.1).
action_duration(farm_water, 2).
action_category(farm_water, resource).
action_parent(farm_water, farm).
action_verb(farm_water, past, 'watered').
action_verb(farm_water, present, 'waters').
action_target_type(farm_water, object).
action_requires_target(farm_water).
action_range(farm_water, 2).
action_prerequisite(farm_water, (energy(Actor, E, _), E >= 10)).
action_prerequisite(farm_water, (at_location_type(Actor, farm))).
action_effect(farm_water, (modify_energy(Actor, -5))).
action_effect(farm_water, (modify_skill_xp(Actor, farming, 1))).
% Can Actor perform this action?
can_perform(Actor, farm_water, Target) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, farm).

%% hold_torch
% Action: hold_torch
% Hold a torch or lantern aloft
% Type: physical / items

action(hold_torch, 'hold_torch', physical, 0).
action_difficulty(hold_torch, 0).
action_duration(hold_torch, 1).
action_category(hold_torch, items).
action_parent(hold_torch, use_item).
action_verb(hold_torch, past, 'held a torch').
action_verb(hold_torch, present, 'holds a torch').
action_target_type(hold_torch, none).
% Can Actor perform this action?
can_perform(Actor, hold_torch) :-
    action(hold_torch, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% hold_lantern
% Action: hold_lantern
% Hold a lantern to light the way
% Type: physical / items

action(hold_lantern, 'hold_lantern', physical, 0).
action_difficulty(hold_lantern, 0).
action_duration(hold_lantern, 1).
action_category(hold_lantern, items).
action_parent(hold_lantern, use_item).
action_verb(hold_lantern, past, 'held a lantern').
action_verb(hold_lantern, present, 'holds a lantern').
action_target_type(hold_lantern, none).
% Can Actor perform this action?
can_perform(Actor, hold_lantern) :-
    action(hold_lantern, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% zombie_idle
% Action: zombie_idle
% Shamble and sway like the undead
% Type: movement / combat

action(zombie_idle, 'zombie_idle', movement, 0).
action_difficulty(zombie_idle, 0).
action_duration(zombie_idle, 1).
action_category(zombie_idle, combat).
action_parent(zombie_idle, idle).
action_verb(zombie_idle, past, 'shambled').
action_verb(zombie_idle, present, 'shambles').
action_target_type(zombie_idle, none).
% Can Actor perform this action?
can_perform(_, zombie_idle).

%% zombie_walk
% Action: zombie_walk
% Lurch forward with undead movement
% Type: movement / combat

action(zombie_walk, 'zombie_walk', movement, 0).
action_difficulty(zombie_walk, 0).
action_duration(zombie_walk, 1).
action_category(zombie_walk, combat).
action_parent(zombie_walk, move).
action_verb(zombie_walk, past, 'lurched').
action_verb(zombie_walk, present, 'lurches').
action_target_type(zombie_walk, location).
action_requires_target(zombie_walk).
% Can Actor perform this action?
can_perform(_, zombie_walk, _).

%% zombie_attack
% Action: zombie_attack
% Scratch and claw at a target
% Type: combat / combat

action(zombie_attack, 'zombie_attack', combat, 0).
action_difficulty(zombie_attack, 0.3).
action_duration(zombie_attack, 1).
action_category(zombie_attack, combat).
action_parent(zombie_attack, attack_enemy).
action_verb(zombie_attack, past, 'clawed').
action_verb(zombie_attack, present, 'claws').
action_target_type(zombie_attack, other).
action_requires_target(zombie_attack).
action_range(zombie_attack, 2).
action_cooldown(zombie_attack, 1).
action_prerequisite(zombie_attack, (energy(Actor, E, _), E >= 10)).
action_prerequisite(zombie_attack, (near(Actor, Target, 3))).
action_prerequisite(zombie_attack, (alive(Target))).
% Can Actor perform this action?
can_perform(Actor, zombie_attack, Target) :-
    energy(Actor, E, _), E >= 10,
    near(Actor, Target, 3),
    alive(Target).

%% fish
% Action: fish
% Fish in a body of water to catch fish
% Type: physical / resource

action(fish, 'fish', physical, 15).
action_difficulty(fish, 0.3).
action_duration(fish, 8).
action_category(fish, resource).
action_parent(fish, gather).
action_verb(fish, past, 'fished').
action_verb(fish, present, 'fishes').
action_target_type(fish, location).
action_range(fish, 5).
action_prerequisite(fish, (energy(Actor, E, _), E >= 10)).
action_prerequisite(fish, (at_location_type(Actor, LocType))).
action_prerequisite(fish, (has_item(Actor, fishing_rod, _))).
action_prerequisite(fish, (at_location_type(Actor, water))).
action_effect(fish, (assert(has_item(Actor, fish, 1)))).
action_effect(fish, (modify_energy(Actor, -15))).
action_effect(fish, (modify_skill_xp(Actor, fishing, 1))).
% Can Actor perform this action?
can_perform(Actor, fish) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, LocType),
    has_item(Actor, fishing_rod, _),
    at_location_type(Actor, water).

%% mine
% Action: mine
% Mine rocks to extract ore and gems
% Type: physical / resource-gathering

action(mine, 'mine', physical, 20).
action_difficulty(mine, 0.4).
action_duration(mine, 7).
action_category(mine, resource_gathering).
action_verb(mine, past, 'mined').
action_verb(mine, present, 'mines').
action_target_type(mine, location).
action_range(mine, 3).
% Can Actor perform this action?
can_perform(Actor, mine) :-
    action(mine, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% harvest
% Action: harvest
% Harvest crops, herbs, or flowers from a garden or farm
% Type: physical / resource-gathering

action(harvest, 'harvest', physical, 10).
action_difficulty(harvest, 0.2).
action_duration(harvest, 5).
action_category(harvest, resource_gathering).
action_verb(harvest, past, 'harvested').
action_verb(harvest, present, 'harvests').
action_target_type(harvest, location).
action_range(harvest, 3).
% Can Actor perform this action?
can_perform(Actor, harvest) :-
    action(harvest, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% cook
% Action: cook
% Cook a meal at a stove, hearth, or campfire
% Type: physical / resource

action(cook, 'cook', physical, 10).
action_difficulty(cook, 0.3).
action_duration(cook, 6).
action_category(cook, resource).
action_parent(cook, craft_item).
action_verb(cook, past, 'cooked').
action_verb(cook, present, 'cooks').
action_target_type(cook, location).
action_range(cook, 3).
action_prerequisite(cook, (energy(Actor, E, _), E >= 10)).
action_prerequisite(cook, (at_location_type(Actor, kitchen))).
action_effect(cook, (assert(has_item(Actor, prepared_food, 1)))).
action_effect(cook, (modify_energy(Actor, -10))).
action_effect(cook, (modify_skill_xp(Actor, cooking, 1))).
% Can Actor perform this action?
can_perform(Actor, cook) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, kitchen).

%% craft
% Action: craft
% Craft tools or items at a workbench or forge
% Type: physical / resource

action(craft, 'craft', physical, 15).
action_difficulty(craft, 0.4).
action_duration(craft, 8).
action_category(craft, resource).
action_verb(craft, past, 'crafted').
action_verb(craft, present, 'crafts').
action_target_type(craft, location).
action_range(craft, 3).
% Can Actor perform this action?
can_perform(Actor, craft) :-
    action(craft, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% paint
% Action: paint
% Paint at an easel or art studio
% Type: physical / resource

action(paint, 'paint', physical, 10).
action_difficulty(paint, 0.4).
action_duration(paint, 10).
action_category(paint, resource).
action_parent(paint, work).
action_verb(paint, past, 'painted').
action_verb(paint, present, 'paints').
action_target_type(paint, location).
action_range(paint, 3).
action_prerequisite(paint, (at_location(Actor, Workplace))).
action_prerequisite(paint, (occupation(Actor, _))).
action_prerequisite(paint, (energy(Actor, E, _), E >= 10)).
action_effect(paint, (modify_energy(Actor, -10))).
action_effect(paint, (modify_skill_xp(Actor, art, 1))).
% Can Actor perform this action?
can_perform(Actor, paint) :-
    at_location(Actor, Workplace),
    occupation(Actor, _),
    energy(Actor, E, _), E >= 10.

%% read_book
% Action: read_book
% Read a book at a bookshelf or library for knowledge
% Type: mental / language

action(read_book, 'read_book', mental, 5).
action_difficulty(read_book, 0.2).
action_duration(read_book, 5).
action_category(read_book, language).
action_verb(read_book, past, 'read a book').
action_verb(read_book, present, 'reads a book').
action_target_type(read_book, location).
action_range(read_book, 3).
action_prerequisite(read_book, (speaks_language(Actor, _, _))).
action_effect(read_book, (modify_xp(Actor, language, 10))).
% Can Actor perform this action?
can_perform(Actor, read_book) :-
    speaks_language(Actor, _, _).

%% pray
% Action: pray
% Pray at a shrine, church, or chapel
% Type: mental / social

action(pray, 'pray', mental, 5).
action_difficulty(pray, 0.1).
action_duration(pray, 5).
action_category(pray, social).
action_verb(pray, past, 'prayed').
action_verb(pray, present, 'prays').
action_target_type(pray, location).
action_range(pray, 3).
% Can Actor perform this action?
can_perform(Actor, pray) :-
    action(pray, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% sweep
% Action: sweep
% Sweep and clean an area
% Type: physical / resource

action(sweep, 'sweep', physical, 5).
action_difficulty(sweep, 0.1).
action_duration(sweep, 4).
action_category(sweep, resource).
action_parent(sweep, work).
action_verb(sweep, past, 'swept').
action_verb(sweep, present, 'sweeps').
action_target_type(sweep, location).
action_range(sweep, 3).
action_prerequisite(sweep, (at_location(Actor, Workplace))).
action_prerequisite(sweep, (occupation(Actor, _))).
action_prerequisite(sweep, (energy(Actor, E, _), E >= 10)).
action_effect(sweep, (modify_energy(Actor, -5))).
% Can Actor perform this action?
can_perform(Actor, sweep) :-
    at_location(Actor, Workplace),
    occupation(Actor, _),
    energy(Actor, E, _), E >= 10.

%% chop_wood
% Action: chop_wood
% Chop wood at a wood pile or lumber yard
% Type: physical / resource-gathering

action(chop_wood, 'chop_wood', physical, 15).
action_difficulty(chop_wood, 0.3).
action_duration(chop_wood, 6).
action_category(chop_wood, resource_gathering).
action_verb(chop_wood, past, 'chopped wood').
action_verb(chop_wood, present, 'chops wood').
action_target_type(chop_wood, location).
action_range(chop_wood, 3).
% Can Actor perform this action?
can_perform(Actor, chop_wood) :-
    action(chop_wood, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% take_photo
% Action: take_photo
% Take a photo of the current scene using camera mode
% Type: mental / exploration

action(take_photo, 'take_photo', mental, 2).
action_difficulty(take_photo, 0.1).
action_duration(take_photo, 1).
action_category(take_photo, exploration).
action_verb(take_photo, past, 'took a photo').
action_verb(take_photo, present, 'takes a photo').
action_target_type(take_photo, self).
% Can Actor perform this action?
can_perform(Actor, take_photo) :-
    action(take_photo, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% collect_item
% Action: collect_item
% Pick up an item from the world
% Type: physical / items

action(collect_item, 'collect_item', physical, 0).
action_difficulty(collect_item, 0).
action_duration(collect_item, 1).
action_category(collect_item, items).
action_verb(collect_item, past, 'collected').
action_verb(collect_item, present, 'collects').
action_target_type(collect_item, object).
action_requires_target(collect_item).
action_range(collect_item, 3).
action_prerequisite(collect_item, (has_item(Actor, _, _))).
action_effect(collect_item, (assert(has_item(Actor, Item, 1)))).
% Can Actor perform this action?
can_perform(Actor, collect_item, Target) :-
    has_item(Actor, _, _).

%% answer_question
% Action: answer_question
% Answer a comprehension question about a text or conversation
% Type: mental / language

action(answer_question, 'answer_question', mental, 0).
action_difficulty(answer_question, 0.5).
action_duration(answer_question, 1).
action_category(answer_question, language).
action_verb(answer_question, past, 'answered a question').
action_verb(answer_question, present, 'answers a question').
action_target_type(answer_question, self).
action_prerequisite(answer_question, (speaks_language(Actor, _, _))).
action_effect(answer_question, (modify_xp(Actor, language, 15))).
% Can Actor perform this action?
can_perform(Actor, answer_question) :-
    speaks_language(Actor, _, _).

%% accept_quest
% Action: accept_quest
% Accept a quest from an NPC or notice board
% Type: social / quest

action(accept_quest, 'accept_quest', social, 0).
action_difficulty(accept_quest, 0).
action_duration(accept_quest, 1).
action_category(accept_quest, quest).
action_verb(accept_quest, past, 'accepted a quest').
action_verb(accept_quest, present, 'accepts a quest').
action_target_type(accept_quest, self).
% Can Actor perform this action?
can_perform(Actor, accept_quest) :-
    action(accept_quest, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% move
% Action: move
% Move to a new position
% Type: movement / movement

action(move, 'move', movement, 1).
action_difficulty(move, 0).
action_duration(move, 1).
action_category(move, movement).
action_verb(move, past, 'moved').
action_verb(move, present, 'moves').
action_target_type(move, location).
action_requires_target(move).
% Can Actor perform this action?
can_perform(Actor, move, Target) :-
    action(move, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% defend
% Action: defend
% Block or parry an incoming attack
% Type: combat / combat

action(defend, 'defend', combat, 2).
action_difficulty(defend, 0.3).
action_duration(defend, 1).
action_category(defend, combat).
action_verb(defend, past, 'defended').
action_verb(defend, present, 'defends').
action_target_type(defend, none).
action_cooldown(defend, 1).
action_prerequisite(defend, (has_equipped(Actor, shield, _))).
action_effect(defend, (modify_energy(Actor, -5))).
% Can Actor perform this action?
can_perform(Actor, defend) :-
    has_equipped(Actor, shield, _).

%% react
% Action: react
% Involuntary reaction to an event
% Type: combat / combat

action(react, 'react', combat, 0).
action_difficulty(react, 0).
action_duration(react, 1).
action_category(react, combat).
action_verb(react, past, 'reacted').
action_verb(react, present, 'reacts').
action_target_type(react, none).
% Can Actor perform this action?
can_perform(_, react).

%% express
% Action: express
% Express an emotion or gesture
% Type: social / social

action(express, 'express', social, 0).
action_difficulty(express, 0).
action_duration(express, 1).
action_category(express, social).
action_verb(express, past, 'expressed').
action_verb(express, present, 'expresses').
action_target_type(express, none).
% Can Actor perform this action?
can_perform(Actor, express) :-
    action(express, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% gather
% Action: gather
% Gather a natural resource
% Type: physical / resource

action(gather, 'gather', physical, 2).
action_difficulty(gather, 0.2).
action_duration(gather, 2).
action_category(gather, resource).
action_verb(gather, past, 'gathered').
action_verb(gather, present, 'gathers').
action_target_type(gather, object).
action_requires_target(gather).
action_range(gather, 3).
action_prerequisite(gather, (energy(Actor, E, _), E >= 10)).
action_prerequisite(gather, (at_location_type(Actor, LocType))).
action_effect(gather, (modify_energy(Actor, -10))).
% Can Actor perform this action?
can_perform(Actor, gather, Target) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, LocType).

%% farm
% Action: farm
% Perform a farming activity
% Type: physical / resource

action(farm, 'farm', physical, 2).
action_difficulty(farm, 0.2).
action_duration(farm, 2).
action_category(farm, resource).
action_verb(farm, past, 'farmed').
action_verb(farm, present, 'farms').
action_target_type(farm, object).
action_requires_target(farm).
action_range(farm, 3).
% Can Actor perform this action?
can_perform(Actor, farm, Target) :-
    action(farm, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% trade
% Action: trade
% Exchange goods with another character
% Type: economic / commerce

action(trade, 'trade', economic, 0).
action_difficulty(trade, 0.1).
action_duration(trade, 1).
action_category(trade, commerce).
action_verb(trade, past, 'traded').
action_verb(trade, present, 'trades').
action_target_type(trade, other).
action_requires_target(trade).
action_range(trade, 5).
action_prerequisite(trade, (near(Actor, Target, 5))).
action_prerequisite(trade, (npc_will_trade(Target))).
action_effect(trade, (modify_skill_xp(Actor, bargaining, 1))).
% Can Actor perform this action?
can_perform(Actor, trade, Target) :-
    near(Actor, Target, 5),
    npc_will_trade(Target).

%% rest
% Action: rest
% Rest and recover energy
% Type: physical / survival

action(rest, 'rest', physical, 0).
action_difficulty(rest, 0).
action_duration(rest, 3).
action_category(rest, survival).
action_verb(rest, past, 'rested').
action_verb(rest, present, 'rests').
action_target_type(rest, none).
action_prerequisite(rest, (energy(Actor, E, _), E >= 0)).
action_effect(rest, (modify_energy(Actor, 20))).
% Can Actor perform this action?
can_perform(Actor, rest) :-
    energy(Actor, E, _), E >= 0.

%% mine_rock
% Action: mine_rock
% Mine stone or ore from a rock deposit
% Type: physical / resource

action(mine_rock, 'mine_rock', physical, 3).
action_difficulty(mine_rock, 0.3).
action_duration(mine_rock, 3).
action_category(mine_rock, resource).
action_parent(mine_rock, gather).
action_verb(mine_rock, past, 'mined').
action_verb(mine_rock, present, 'mines').
action_target_type(mine_rock, object).
action_requires_target(mine_rock).
action_range(mine_rock, 3).
action_prerequisite(mine_rock, (energy(Actor, E, _), E >= 10)).
action_prerequisite(mine_rock, (at_location_type(Actor, LocType))).
action_prerequisite(mine_rock, (has_item(Actor, pickaxe, _))).
action_prerequisite(mine_rock, (at_location_type(Actor, mine))).
action_effect(mine_rock, (assert(has_item(Actor, ore, 1)))).
action_effect(mine_rock, (modify_energy(Actor, -20))).
action_effect(mine_rock, (modify_skill_xp(Actor, mining, 1))).
% Can Actor perform this action?
can_perform(Actor, mine_rock, Target) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, LocType),
    has_item(Actor, pickaxe, _),
    at_location_type(Actor, mine).

%% gather_herb
% Action: gather_herb
% Pick herbs or plants from the ground
% Type: physical / resource

action(gather_herb, 'gather_herb', physical, 1).
action_difficulty(gather_herb, 0.1).
action_duration(gather_herb, 2).
action_category(gather_herb, resource).
action_parent(gather_herb, gather).
action_verb(gather_herb, past, 'gathered herbs').
action_verb(gather_herb, present, 'gathers herbs').
action_target_type(gather_herb, object).
action_range(gather_herb, 3).
action_prerequisite(gather_herb, (energy(Actor, E, _), E >= 10)).
action_prerequisite(gather_herb, (at_location_type(Actor, LocType))).
action_prerequisite(gather_herb, (at_location_type(Actor, forest))).
action_effect(gather_herb, (assert(has_item(Actor, herbs, 1)))).
action_effect(gather_herb, (modify_energy(Actor, -10))).
action_effect(gather_herb, (modify_skill_xp(Actor, herbalism, 1))).
% Can Actor perform this action?
can_perform(Actor, gather_herb) :-
    energy(Actor, E, _), E >= 10,
    at_location_type(Actor, LocType),
    at_location_type(Actor, forest).

%% steal
% Action: steal
% Take something that belongs to someone else
% Type: social / social

action(steal, 'steal', social, 1).
action_difficulty(steal, 0.6).
action_duration(steal, 1).
action_category(steal, social).
action_verb(steal, past, 'stole').
action_verb(steal, present, 'steals').
action_target_type(steal, other).
action_requires_target(steal).
action_range(steal, 3).
action_cooldown(steal, 5).
action_prerequisite(steal, (near(Actor, Target, 3))).
action_prerequisite(steal, (skill_gte(Actor, stealth, 1))).
action_effect(steal, (assert(has_item(Actor, StolenItem, 1)))).
action_effect(steal, (modify_disposition(Target, Actor, -30))).
action_effect(steal, (modify_xp(Actor, stealth, 5))).
% Can Actor perform this action?
can_perform(Actor, steal, Target) :-
    near(Actor, Target, 3),
    skill_gte(Actor, stealth, 1).

%% escort_npc
% Action: escort_npc
% Accompany and protect an NPC to a destination
% Type: social / social

action(escort_npc, 'escort_npc', social, 2).
action_difficulty(escort_npc, 0.4).
action_duration(escort_npc, 5).
action_category(escort_npc, social).
action_verb(escort_npc, past, 'escorted').
action_verb(escort_npc, present, 'escorts').
action_target_type(escort_npc, other).
action_requires_target(escort_npc).
action_range(escort_npc, 10).
% Can Actor perform this action?
can_perform(Actor, escort_npc, Target) :-
    action(escort_npc, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% request_quest
% Action: request_quest
% Ask an NPC for a quest or task
% Type: social / social

action(request_quest, 'request_quest', social, 0).
action_difficulty(request_quest, 0.1).
action_duration(request_quest, 1).
action_category(request_quest, social).
action_verb(request_quest, past, 'requested a quest').
action_verb(request_quest, present, 'requests a quest').
action_target_type(request_quest, other).
action_requires_target(request_quest).
action_range(request_quest, 5).
action_prerequisite(request_quest, (near(Actor, Target, 5))).
action_prerequisite(request_quest, (npc_quest_available(Target, _))).
action_effect(request_quest, (assert(quest_active(Actor, QuestId)))).
action_effect(request_quest, (retract(npc_quest_available(Target, QuestId)))).
% Can Actor perform this action?
can_perform(Actor, request_quest, Target) :-
    near(Actor, Target, 5),
    npc_quest_available(Target, _).

%% eavesdrop
% Action: eavesdrop
% Listen in on a conversation without being noticed
% Type: social / social

action(eavesdrop, 'eavesdrop', social, 0).
action_difficulty(eavesdrop, 0.3).
action_duration(eavesdrop, 2).
action_category(eavesdrop, social).
action_verb(eavesdrop, past, 'eavesdropped').
action_verb(eavesdrop, present, 'eavesdrops').
action_target_type(eavesdrop, other).
action_requires_target(eavesdrop).
action_range(eavesdrop, 15).
action_prerequisite(eavesdrop, (near(Actor, Target, 15))).
action_effect(eavesdrop, (modify_xp(Actor, stealth, 3))).
% Can Actor perform this action?
can_perform(Actor, eavesdrop, Target) :-
    near(Actor, Target, 15).

%% greet
% Action: greet
% Greet someone with a hello or wave
% Type: social / social

action(greet, 'greet', social, 0).
action_difficulty(greet, 0).
action_duration(greet, 1).
action_category(greet, social).
action_parent(greet, talk_to_npc).
action_verb(greet, past, 'greeted').
action_verb(greet, present, 'greets').
action_target_type(greet, other).
action_requires_target(greet).
action_range(greet, 5).
action_prerequisite(greet, (near(Actor, Target, 5))).
action_effect(greet, (modify_disposition(Target, Actor, 5))).
action_effect(greet, (assert(met(Actor, Target)))).
% Can Actor perform this action?
can_perform(Actor, greet, Target) :-
    near(Actor, Target, 5).

%% insult_npc
% Action: insult_npc
% Say something rude or hurtful
% Type: social / social

action(insult_npc, 'insult_npc', social, 0).
action_difficulty(insult_npc, 0.2).
action_duration(insult_npc, 1).
action_category(insult_npc, social).
action_parent(insult_npc, talk_to_npc).
action_verb(insult_npc, past, 'insulted').
action_verb(insult_npc, present, 'insults').
action_target_type(insult_npc, other).
action_requires_target(insult_npc).
action_range(insult_npc, 5).
action_cooldown(insult_npc, 3).
action_prerequisite(insult_npc, (near(Actor, Target, 5))).
action_effect(insult_npc, (modify_disposition(Target, Actor, -15))).
% Can Actor perform this action?
can_perform(Actor, insult_npc, Target) :-
    near(Actor, Target, 5).

%% threaten
% Action: threaten
% Intimidate someone with words or gestures
% Type: social / social

action(threaten, 'threaten', social, 0).
action_difficulty(threaten, 0.3).
action_duration(threaten, 1).
action_category(threaten, social).
action_parent(threaten, talk_to_npc).
action_verb(threaten, past, 'threatened').
action_verb(threaten, present, 'threatens').
action_target_type(threaten, other).
action_requires_target(threaten).
action_range(threaten, 5).
action_cooldown(threaten, 3).
action_prerequisite(threaten, (near(Actor, Target, 5))).
action_effect(threaten, (modify_disposition(Target, Actor, -20))).
% Can Actor perform this action?
can_perform(Actor, threaten, Target) :-
    near(Actor, Target, 5).

%% flirt
% Action: flirt
% Express romantic interest playfully
% Type: social / social

action(flirt, 'flirt', social, 0).
action_difficulty(flirt, 0.3).
action_duration(flirt, 1).
action_category(flirt, social).
action_parent(flirt, talk_to_npc).
action_verb(flirt, past, 'flirted').
action_verb(flirt, present, 'flirts').
action_target_type(flirt, other).
action_requires_target(flirt).
action_range(flirt, 5).
action_cooldown(flirt, 3).
action_prerequisite(flirt, (near(Actor, Target, 5))).
action_effect(flirt, (modify_disposition(Target, Actor, 8))).
% Can Actor perform this action?
can_perform(Actor, flirt, Target) :-
    near(Actor, Target, 5).

%% persuade
% Action: persuade
% Convince someone to see your point of view
% Type: social / social

action(persuade, 'persuade', social, 1).
action_difficulty(persuade, 0.5).
action_duration(persuade, 1).
action_category(persuade, social).
action_parent(persuade, talk_to_npc).
action_verb(persuade, past, 'persuaded').
action_verb(persuade, present, 'persuades').
action_target_type(persuade, other).
action_requires_target(persuade).
action_range(persuade, 5).
action_cooldown(persuade, 5).
action_prerequisite(persuade, (near(Actor, Target, 5))).
action_effect(persuade, (modify_disposition(Target, Actor, 5))).
action_effect(persuade, (modify_xp(Actor, speech, 5))).
% Can Actor perform this action?
can_perform(Actor, persuade, Target) :-
    near(Actor, Target, 5).

%% bribe
% Action: bribe
% Offer money or items in exchange for a favor
% Type: social / social

action(bribe, 'bribe', social, 0).
action_difficulty(bribe, 0.4).
action_duration(bribe, 1).
action_category(bribe, social).
action_parent(bribe, talk_to_npc).
action_verb(bribe, past, 'bribed').
action_verb(bribe, present, 'bribes').
action_target_type(bribe, other).
action_requires_target(bribe).
action_range(bribe, 5).
action_cooldown(bribe, 5).
action_prerequisite(bribe, (near(Actor, Target, 5))).
action_effect(bribe, (modify_disposition(Target, Actor, 15))).
action_effect(bribe, (modify_gold(Actor, -20))).
% Can Actor perform this action?
can_perform(Actor, bribe, Target) :-
    near(Actor, Target, 5).

%% gossip
% Action: gossip
% Share rumors or juicy information
% Type: social / social

action(gossip, 'gossip', social, 0).
action_difficulty(gossip, 0.1).
action_duration(gossip, 1).
action_category(gossip, social).
action_parent(gossip, talk_to_npc).
action_verb(gossip, past, 'gossiped').
action_verb(gossip, present, 'gossips').
action_target_type(gossip, other).
action_requires_target(gossip).
action_range(gossip, 5).
action_prerequisite(gossip, (near(Actor, Target, 5))).
action_effect(gossip, (modify_disposition(Target, Actor, 3))).
% Can Actor perform this action?
can_perform(Actor, gossip, Target) :-
    near(Actor, Target, 5).

%% confess
% Action: confess
% Admit to something or share a secret
% Type: social / social

action(confess, 'confess', social, 1).
action_difficulty(confess, 0.4).
action_duration(confess, 1).
action_category(confess, social).
action_parent(confess, talk_to_npc).
action_verb(confess, past, 'confessed').
action_verb(confess, present, 'confesses').
action_target_type(confess, other).
action_requires_target(confess).
action_range(confess, 5).
action_cooldown(confess, 10).
action_prerequisite(confess, (near(Actor, Target, 5))).
action_effect(confess, (modify_disposition(Target, Actor, 5))).
% Can Actor perform this action?
can_perform(Actor, confess, Target) :-
    near(Actor, Target, 5).

%% apologize
% Action: apologize
% Express regret for a wrongdoing
% Type: social / social

action(apologize, 'apologize', social, 0).
action_difficulty(apologize, 0.2).
action_duration(apologize, 1).
action_category(apologize, social).
action_parent(apologize, talk_to_npc).
action_verb(apologize, past, 'apologized').
action_verb(apologize, present, 'apologizes').
action_target_type(apologize, other).
action_requires_target(apologize).
action_range(apologize, 5).
action_cooldown(apologize, 3).
action_prerequisite(apologize, (near(Actor, Target, 5))).
action_effect(apologize, (modify_disposition(Target, Actor, 10))).
% Can Actor perform this action?
can_perform(Actor, apologize, Target) :-
    near(Actor, Target, 5).

%% comfort
% Action: comfort
% Console someone who is upset or distressed
% Type: social / social

action(comfort, 'comfort', social, 0).
action_difficulty(comfort, 0.2).
action_duration(comfort, 1).
action_category(comfort, social).
action_parent(comfort, talk_to_npc).
action_verb(comfort, past, 'comforted').
action_verb(comfort, present, 'comforts').
action_target_type(comfort, other).
action_requires_target(comfort).
action_range(comfort, 5).
action_prerequisite(comfort, (near(Actor, Target, 5))).
action_effect(comfort, (modify_disposition(Target, Actor, 8))).
% Can Actor perform this action?
can_perform(Actor, comfort, Target) :-
    near(Actor, Target, 5).

%% argue
% Action: argue
% Engage in a heated disagreement
% Type: social / social

action(argue, 'argue', social, 1).
action_difficulty(argue, 0.3).
action_duration(argue, 1).
action_category(argue, social).
action_parent(argue, talk_to_npc).
action_verb(argue, past, 'argued').
action_verb(argue, present, 'argues').
action_target_type(argue, other).
action_requires_target(argue).
action_range(argue, 5).
action_cooldown(argue, 3).
action_prerequisite(argue, (near(Actor, Target, 5))).
action_effect(argue, (modify_disposition(Target, Actor, -10))).
% Can Actor perform this action?
can_perform(Actor, argue, Target) :-
    near(Actor, Target, 5).

%% joke
% Action: joke
% Tell a joke or make someone laugh
% Type: social / social

action(joke, 'joke', social, 0).
action_difficulty(joke, 0.2).
action_duration(joke, 1).
action_category(joke, social).
action_parent(joke, talk_to_npc).
action_verb(joke, past, 'joked').
action_verb(joke, present, 'jokes').
action_target_type(joke, other).
action_requires_target(joke).
action_range(joke, 5).
action_prerequisite(joke, (near(Actor, Target, 5))).
action_effect(joke, (modify_disposition(Target, Actor, 5))).
% Can Actor perform this action?
can_perform(Actor, joke, Target) :-
    near(Actor, Target, 5).

%% share_story
% Action: share_story
% Tell a personal story or anecdote
% Type: social / social

action(share_story, 'share_story', social, 0).
action_difficulty(share_story, 0.2).
action_duration(share_story, 2).
action_category(share_story, social).
action_parent(share_story, talk_to_npc).
action_verb(share_story, past, 'shared a story').
action_verb(share_story, present, 'shares a story').
action_target_type(share_story, other).
action_requires_target(share_story).
action_range(share_story, 5).
action_prerequisite(share_story, (near(Actor, Target, 5))).
action_effect(share_story, (modify_disposition(Target, Actor, 5))).
% Can Actor perform this action?
can_perform(Actor, share_story, Target) :-
    near(Actor, Target, 5).

%% ask_about
% Action: ask_about
% Ask someone about a topic or subject
% Type: social / social

action(ask_about, 'ask_about', social, 0).
action_difficulty(ask_about, 0.1).
action_duration(ask_about, 1).
action_category(ask_about, social).
action_parent(ask_about, talk_to_npc).
action_verb(ask_about, past, 'asked about').
action_verb(ask_about, present, 'asks about').
action_target_type(ask_about, other).
action_requires_target(ask_about).
action_range(ask_about, 5).
action_prerequisite(ask_about, (near(Actor, Target, 5))).
action_effect(ask_about, (modify_disposition(Target, Actor, 3))).
% Can Actor perform this action?
can_perform(Actor, ask_about, Target) :-
    near(Actor, Target, 5).

%% drop_item
% Action: drop_item
% Drop an item from your inventory onto the ground
% Type: physical / items

action(drop_item, 'drop_item', physical, 0).
action_difficulty(drop_item, 0).
action_duration(drop_item, 1).
action_category(drop_item, items).
action_verb(drop_item, past, 'dropped').
action_verb(drop_item, present, 'drops').
action_target_type(drop_item, object).
action_requires_target(drop_item).
action_prerequisite(drop_item, (has_item(Actor, _, _))).
action_effect(drop_item, (retract(has_item(Actor, Item, _)))).
% Can Actor perform this action?
can_perform(Actor, drop_item, Target) :-
    has_item(Actor, _, _).

%% observe_activity
% Action: observe_activity
% Watch and learn from an activity happening nearby
% Type: social / exploration

action(observe_activity, 'observe_activity', social, 0).
action_difficulty(observe_activity, 0.1).
action_duration(observe_activity, 2).
action_category(observe_activity, exploration).
action_verb(observe_activity, past, 'observed').
action_verb(observe_activity, present, 'observes').
action_target_type(observe_activity, other).
action_requires_target(observe_activity).
action_range(observe_activity, 15).
% Can Actor perform this action?
can_perform(Actor, observe_activity, Target) :-
    action(observe_activity, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% investigate
% Action: investigate
% Examine a location or object closely for clues
% Type: physical / exploration

action(investigate, 'investigate', physical, 1).
action_difficulty(investigate, 0.3).
action_duration(investigate, 2).
action_category(investigate, exploration).
action_verb(investigate, past, 'investigated').
action_verb(investigate, present, 'investigates').
action_target_type(investigate, object).
action_requires_target(investigate).
action_range(investigate, 3).
% Can Actor perform this action?
can_perform(Actor, investigate, Target) :-
    action(investigate, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% mount_vehicle
% Action: mount_vehicle
% Mount or board a vehicle or rideable creature
% Type: physical / exploration

action(mount_vehicle, 'mount_vehicle', physical, 0).
action_difficulty(mount_vehicle, 0.1).
action_duration(mount_vehicle, 1).
action_category(mount_vehicle, exploration).
action_verb(mount_vehicle, past, 'mounted').
action_verb(mount_vehicle, present, 'mounts').
action_target_type(mount_vehicle, object).
action_requires_target(mount_vehicle).
action_range(mount_vehicle, 3).
% Can Actor perform this action?
can_perform(Actor, mount_vehicle, Target) :-
    action(mount_vehicle, _, _, EnergyCost),
    energy(Actor, E, _),
    E >= EnergyCost.

%% teach_vocabulary
% Action: teach_vocabulary
% Teach a word or phrase to someone
% Type: language / language

action(teach_vocabulary, 'teach_vocabulary', language, 1).
action_difficulty(teach_vocabulary, 0.3).
action_duration(teach_vocabulary, 2).
action_category(teach_vocabulary, language).
action_verb(teach_vocabulary, past, 'taught vocabulary').
action_verb(teach_vocabulary, present, 'teaches vocabulary').
action_target_type(teach_vocabulary, other).
action_requires_target(teach_vocabulary).
action_range(teach_vocabulary, 5).
action_prerequisite(teach_vocabulary, (near(Actor, Target, 5))).
action_prerequisite(teach_vocabulary, (speaks_language(Actor, Lang, Level), cefr_gte(Level, b1))).
action_effect(teach_vocabulary, (modify_xp(Actor, language, 20))).
action_effect(teach_vocabulary, (modify_disposition(Target, Actor, 5))).
% Can Actor perform this action?
can_perform(Actor, teach_vocabulary, Target) :-
    near(Actor, Target, 5),
    speaks_language(Actor, Lang, Level), cefr_gte(Level, b1).

%% sleep
% Action: sleep
% Sleep to restore energy and health
% Type: physical / survival

action(sleep, 'sleep', physical, 0).
action_difficulty(sleep, 0).
action_duration(sleep, 8).
action_category(sleep, survival).
action_parent(sleep, rest).
action_verb(sleep, past, 'slept').
action_verb(sleep, present, 'sleeps').
action_target_type(sleep, none).
action_prerequisite(sleep, (energy(Actor, E, _), E >= 0)).
action_effect(sleep, (modify_energy(Actor, 50))).
action_effect(sleep, (modify_health(Actor, 10))).
% Can Actor perform this action?
can_perform(Actor, sleep) :-
    energy(Actor, E, _), E >= 0.

%% sit
% Action: sit
% Sit down to take a short break
% Type: physical / survival

action(sit, 'sit', physical, 0).
action_difficulty(sit, 0).
action_duration(sit, 1).
action_category(sit, survival).
action_parent(sit, rest).
action_verb(sit, past, 'sat').
action_verb(sit, present, 'sits').
action_target_type(sit, none).
action_effect(sit, (modify_energy(Actor, 5))).
% Can Actor perform this action?
can_perform(_, sit).

%% work
% Action: work
% Perform a work task at your job or assigned location
% Type: physical / resource

action(work, 'work', physical, 2).
action_difficulty(work, 0.2).
action_duration(work, 3).
action_category(work, resource).
action_verb(work, past, 'worked').
action_verb(work, present, 'works').
action_target_type(work, location).
action_requires_target(work).
action_prerequisite(work, (at_location(Actor, Workplace))).
action_prerequisite(work, (occupation(Actor, _))).
action_effect(work, (modify_gold(Actor, 10))).
action_effect(work, (modify_energy(Actor, -20))).
% Can Actor perform this action?
can_perform(Actor, work, Target) :-
    at_location(Actor, Workplace),
    occupation(Actor, _).

