%% Insimul Actions: Greek Mythological World
%% Source: data/worlds/mythological/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema follows base_actions.pl format

%% make_sacrifice -- Offer a sacrifice to the gods at an altar
action(make_sacrifice, 'make_sacrifice', spiritual, 2).
action_difficulty(make_sacrifice, 0.2).
action_duration(make_sacrifice, 2).
action_category(make_sacrifice, worship).
action_verb(make_sacrifice, past, 'made a sacrifice').
action_verb(make_sacrifice, present, 'makes a sacrifice').
action_target_type(make_sacrifice, self).
action_range(make_sacrifice, 5).
action_prerequisite(make_sacrifice, (at_location(Actor, temple))).
action_prerequisite(make_sacrifice, (has_item(Actor, sacrificial_lamb, _))).
action_effect(make_sacrifice, (retract(has_item(Actor, sacrificial_lamb, _)))).
action_effect(make_sacrifice, (assert(status(Actor, divinely_favored)))).
can_perform(Actor, make_sacrifice, _Target) :-
    at_location(Actor, temple),
    has_item(Actor, sacrificial_lamb, _).

%% consult_oracle -- Seek prophecy from the Pythia
action(consult_oracle, 'consult_oracle', spiritual, 3).
action_difficulty(consult_oracle, 0.3).
action_duration(consult_oracle, 2).
action_category(consult_oracle, prophecy).
action_verb(consult_oracle, past, 'consulted the oracle').
action_verb(consult_oracle, present, 'consults the oracle').
action_target_type(consult_oracle, other).
action_requires_target(consult_oracle).
action_range(consult_oracle, 5).
action_prerequisite(consult_oracle, (near(Actor, Target, 5))).
action_prerequisite(consult_oracle, (has_item(Actor, wine_amphora, _))).
action_effect(consult_oracle, (assert(event(Actor, prophecy_received)))).
can_perform(Actor, consult_oracle, Target) :-
    near(Actor, Target, 5),
    has_item(Actor, wine_amphora, _).

%% compete_in_games -- Enter athletic competition
action(compete_in_games, 'compete_in_games', combat, 3).
action_difficulty(compete_in_games, 0.4).
action_duration(compete_in_games, 3).
action_category(compete_in_games, athletics).
action_verb(compete_in_games, past, 'competed in the games').
action_verb(compete_in_games, present, 'competes in the games').
action_target_type(compete_in_games, self).
action_range(compete_in_games, 10).
action_prerequisite(compete_in_games, (at_location(Actor, gymnasium))).
action_effect(compete_in_games, (assert(event(Actor, competed)))).
can_perform(Actor, compete_in_games, _Target) :-
    at_location(Actor, gymnasium).

%% pour_libation -- Pour a wine offering to honor the gods
action(pour_libation, 'pour_libation', spiritual, 0).
action_difficulty(pour_libation, 0.1).
action_duration(pour_libation, 1).
action_category(pour_libation, worship).
action_verb(pour_libation, past, 'poured a libation').
action_verb(pour_libation, present, 'pours a libation').
action_target_type(pour_libation, self).
action_range(pour_libation, 3).
action_prerequisite(pour_libation, (has_item(Actor, wine_amphora, _))).
action_effect(pour_libation, (assert(status(Actor, pious)))).
can_perform(Actor, pour_libation, _Target) :-
    has_item(Actor, wine_amphora, _).

%% forge_celestial_bronze -- Craft a weapon from divine metal
action(forge_celestial_bronze, 'forge_celestial_bronze', crafting, 8).
action_difficulty(forge_celestial_bronze, 0.7).
action_duration(forge_celestial_bronze, 4).
action_category(forge_celestial_bronze, smithing).
action_verb(forge_celestial_bronze, past, 'forged celestial bronze').
action_verb(forge_celestial_bronze, present, 'forges celestial bronze').
action_target_type(forge_celestial_bronze, self).
action_range(forge_celestial_bronze, 3).
action_prerequisite(forge_celestial_bronze, (at_location(Actor, forge))).
action_prerequisite(forge_celestial_bronze, (has_item(Actor, celestial_bronze, _))).
action_effect(forge_celestial_bronze, (assert(event(Actor, divine_weapon_forged)))).
can_perform(Actor, forge_celestial_bronze, _Target) :-
    at_location(Actor, forge),
    has_item(Actor, celestial_bronze, _).

%% sail_voyage -- Set out on a sea voyage
action(sail_voyage, 'sail_voyage', exploration, 5).
action_difficulty(sail_voyage, 0.5).
action_duration(sail_voyage, 5).
action_category(sail_voyage, seafaring).
action_verb(sail_voyage, past, 'sailed on a voyage').
action_verb(sail_voyage, present, 'sails on a voyage').
action_target_type(sail_voyage, self).
action_range(sail_voyage, 50).
action_prerequisite(sail_voyage, (at_location(Actor, harbor))).
action_effect(sail_voyage, (assert(event(Actor, voyage_begun)))).
can_perform(Actor, sail_voyage, _Target) :-
    at_location(Actor, harbor).

%% play_lyre -- Perform music to charm or inspire
action(play_lyre, 'play_lyre', social, 0).
action_difficulty(play_lyre, 0.3).
action_duration(play_lyre, 2).
action_category(play_lyre, performance).
action_verb(play_lyre, past, 'played the lyre').
action_verb(play_lyre, present, 'plays the lyre').
action_target_type(play_lyre, self).
action_range(play_lyre, 10).
action_prerequisite(play_lyre, (has_item(Actor, lyre_of_orpheus, _))).
action_effect(play_lyre, (assert(status(Actor, inspiring)))).
can_perform(Actor, play_lyre, _Target) :-
    has_item(Actor, lyre_of_orpheus, _).

%% enter_labyrinth -- Descend into the great maze
action(enter_labyrinth, 'enter_labyrinth', exploration, 5).
action_difficulty(enter_labyrinth, 0.6).
action_duration(enter_labyrinth, 3).
action_category(enter_labyrinth, dungeon).
action_verb(enter_labyrinth, past, 'entered the labyrinth').
action_verb(enter_labyrinth, present, 'enters the labyrinth').
action_target_type(enter_labyrinth, self).
action_range(enter_labyrinth, 5).
action_prerequisite(enter_labyrinth, (has_item(Actor, thread_of_ariadne, _))).
action_effect(enter_labyrinth, (assert(status(Actor, in_labyrinth)))).
can_perform(Actor, enter_labyrinth, _Target) :-
    has_item(Actor, thread_of_ariadne, _).

%% slay_monster -- Fight a mythological creature
action(slay_monster, 'slay_monster', combat, 8).
action_difficulty(slay_monster, 0.7).
action_duration(slay_monster, 3).
action_category(slay_monster, combat).
action_verb(slay_monster, past, 'slew the monster').
action_verb(slay_monster, present, 'slays the monster').
action_target_type(slay_monster, other).
action_requires_target(slay_monster).
action_range(slay_monster, 5).
action_prerequisite(slay_monster, (attribute(Actor, self_assuredness, SA), SA > 50)).
action_effect(slay_monster, (assert(event(Actor, monster_slain)))).
can_perform(Actor, slay_monster, Target) :-
    attribute(Actor, self_assuredness, SA), SA > 50.

%% pray_to_gods -- Offer a prayer for divine aid
action(pray_to_gods, 'pray_to_gods', spiritual, 0).
action_difficulty(pray_to_gods, 0.1).
action_duration(pray_to_gods, 1).
action_category(pray_to_gods, worship).
action_verb(pray_to_gods, past, 'prayed to the gods').
action_verb(pray_to_gods, present, 'prays to the gods').
action_target_type(pray_to_gods, self).
action_range(pray_to_gods, 5).
action_prerequisite(pray_to_gods, (at_location(Actor, temple))).
action_effect(pray_to_gods, (assert(status(Actor, praying)))).
can_perform(Actor, pray_to_gods, _Target) :-
    at_location(Actor, temple).

%% gather_herbs_myth -- Collect magical herbs from sacred groves
action(gather_herbs_myth, 'gather_herbs_myth', gathering, 2).
action_difficulty(gather_herbs_myth, 0.3).
action_duration(gather_herbs_myth, 2).
action_category(gather_herbs_myth, nature).
action_verb(gather_herbs_myth, past, 'gathered sacred herbs').
action_verb(gather_herbs_myth, present, 'gathers sacred herbs').
action_target_type(gather_herbs_myth, self).
action_range(gather_herbs_myth, 5).
action_prerequisite(gather_herbs_myth, (at_location(Actor, grove))).
action_effect(gather_herbs_myth, (assert(has_item(Actor, moly_herb, 1)))).
can_perform(Actor, gather_herbs_myth, _Target) :-
    at_location(Actor, grove).

%% swear_oath -- Make a binding oath upon the River Styx
action(swear_oath, 'swear_oath', social, 5).
action_difficulty(swear_oath, 0.4).
action_duration(swear_oath, 1).
action_category(swear_oath, ritual).
action_verb(swear_oath, past, 'swore an oath').
action_verb(swear_oath, present, 'swears an oath').
action_target_type(swear_oath, other).
action_requires_target(swear_oath).
action_range(swear_oath, 5).
action_prerequisite(swear_oath, (near(Actor, Target, 5))).
action_effect(swear_oath, (assert(relationship(Actor, Target, oath_bound)))).
can_perform(Actor, swear_oath, Target) :-
    near(Actor, Target, 5).
