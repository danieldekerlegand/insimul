%% Insimul Actions: Renaissance City-States
%% Source: data/worlds/historical_renaissance/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (base_actions format):
%%   action/4 -- action(AtomId, Name, Type, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% commission_artwork
%% Hire an artist to paint, sculpt, or design a work for your palazzo
action(commission_artwork, 'commission_artwork', social, 2).
action_difficulty(commission_artwork, 0.4).
action_duration(commission_artwork, 3).
action_category(commission_artwork, patronage).
action_verb(commission_artwork, past, 'commissioned artwork from').
action_verb(commission_artwork, present, 'commissions artwork from').
action_target_type(commission_artwork, other).
action_requires_target(commission_artwork).
action_range(commission_artwork, 10).
action_prerequisite(commission_artwork, (near(Actor, Target, 10))).
action_effect(commission_artwork, (assert(commissioned(Actor, Target)))).
can_perform(Actor, commission_artwork, Target) :-
    near(Actor, Target, 10).

%% paint_at_bottega
%% Work on a painting or fresco at the master workshop
action(paint_at_bottega, 'paint_at_bottega', craft, 3).
action_difficulty(paint_at_bottega, 0.6).
action_duration(paint_at_bottega, 5).
action_category(paint_at_bottega, art).
action_verb(paint_at_bottega, past, 'painted at the bottega').
action_verb(paint_at_bottega, present, 'paints at the bottega').
action_target_type(paint_at_bottega, none).
action_range(paint_at_bottega, 0).
action_prerequisite(paint_at_bottega, (at_location(Actor, bottega))).
action_effect(paint_at_bottega, (assert(painted(Actor)))).
can_perform(Actor, paint_at_bottega, _) :-
    at_location(Actor, bottega).

%% trade_at_fondaco
%% Buy or sell foreign goods at the merchants warehouse
action(trade_at_fondaco, 'trade_at_fondaco', economic, 2).
action_difficulty(trade_at_fondaco, 0.3).
action_duration(trade_at_fondaco, 3).
action_category(trade_at_fondaco, commerce).
action_verb(trade_at_fondaco, past, 'traded at the fondaco with').
action_verb(trade_at_fondaco, present, 'trades at the fondaco with').
action_target_type(trade_at_fondaco, other).
action_requires_target(trade_at_fondaco).
action_range(trade_at_fondaco, 5).
action_prerequisite(trade_at_fondaco, (near(Actor, Target, 5))).
action_effect(trade_at_fondaco, (assert(traded(Actor, Target)))).
can_perform(Actor, trade_at_fondaco, Target) :-
    near(Actor, Target, 5).

%% attend_lecture
%% Listen to a humanist lecture at the university or private academy
action(attend_lecture, 'attend_lecture', knowledge, 2).
action_difficulty(attend_lecture, 0.4).
action_duration(attend_lecture, 3).
action_category(attend_lecture, scholarship).
action_verb(attend_lecture, past, 'attended a lecture').
action_verb(attend_lecture, present, 'attends a lecture').
action_target_type(attend_lecture, none).
action_range(attend_lecture, 0).
action_prerequisite(attend_lecture, (at_location(Actor, academy))).
action_effect(attend_lecture, (assert(studied(Actor, humanities)))).
can_perform(Actor, attend_lecture, _) :-
    at_location(Actor, academy).

%% negotiate_contract
%% Draw up a formal contract for trade, commission, or alliance
action(negotiate_contract, 'negotiate_contract', social, 2).
action_difficulty(negotiate_contract, 0.5).
action_duration(negotiate_contract, 3).
action_category(negotiate_contract, political).
action_verb(negotiate_contract, past, 'negotiated a contract with').
action_verb(negotiate_contract, present, 'negotiates a contract with').
action_target_type(negotiate_contract, other).
action_requires_target(negotiate_contract).
action_range(negotiate_contract, 5).
action_prerequisite(negotiate_contract, (near(Actor, Target, 5))).
action_effect(negotiate_contract, (assert(contracted(Actor, Target)))).
can_perform(Actor, negotiate_contract, Target) :-
    near(Actor, Target, 5).

%% sail_trade_route
%% Captain or join a merchant vessel on a trade voyage
action(sail_trade_route, 'sail_trade_route', physical, 4).
action_difficulty(sail_trade_route, 0.6).
action_duration(sail_trade_route, 6).
action_category(sail_trade_route, commerce).
action_verb(sail_trade_route, past, 'sailed a trade route').
action_verb(sail_trade_route, present, 'sails a trade route').
action_target_type(sail_trade_route, none).
action_range(sail_trade_route, 0).
action_prerequisite(sail_trade_route, (at_location(Actor, harbor))).
action_effect(sail_trade_route, (assert(sailed(Actor)))).
can_perform(Actor, sail_trade_route, _) :-
    at_location(Actor, harbor).

%% visit_printing_press
%% Examine printed books and pamphlets at a print shop
action(visit_printing_press, 'visit_printing_press', knowledge, 1).
action_difficulty(visit_printing_press, 0.2).
action_duration(visit_printing_press, 2).
action_category(visit_printing_press, scholarship).
action_verb(visit_printing_press, past, 'visited the printing press').
action_verb(visit_printing_press, present, 'visits the printing press').
action_target_type(visit_printing_press, none).
action_range(visit_printing_press, 0).
action_prerequisite(visit_printing_press, (at_location(Actor, stamperia))).
action_effect(visit_printing_press, (assert(read_printed(Actor)))).
can_perform(Actor, visit_printing_press, _) :-
    at_location(Actor, stamperia).

%% attend_mass_duomo
%% Attend a sermon or mass at the cathedral
action(attend_mass_duomo, 'attend_mass_duomo', ritual, 1).
action_difficulty(attend_mass_duomo, 0.1).
action_duration(attend_mass_duomo, 2).
action_category(attend_mass_duomo, religious).
action_verb(attend_mass_duomo, past, 'attended mass at the Duomo').
action_verb(attend_mass_duomo, present, 'attends mass at the Duomo').
action_target_type(attend_mass_duomo, none).
action_range(attend_mass_duomo, 0).
action_prerequisite(attend_mass_duomo, (at_location(Actor, duomo))).
action_effect(attend_mass_duomo, (assert(piety_increased(Actor)))).
can_perform(Actor, attend_mass_duomo, _) :-
    at_location(Actor, duomo).

%% prepare_remedy
%% Mix herbal medicines and remedies from gathered ingredients
action(prepare_remedy, 'prepare_remedy', craft, 2).
action_difficulty(prepare_remedy, 0.4).
action_duration(prepare_remedy, 3).
action_category(prepare_remedy, craft).
action_verb(prepare_remedy, past, 'prepared a remedy').
action_verb(prepare_remedy, present, 'prepares a remedy').
action_target_type(prepare_remedy, none).
action_range(prepare_remedy, 0).
action_prerequisite(prepare_remedy, (at_location(Actor, spezieria))).
action_effect(prepare_remedy, (assert(crafted(Actor, remedy)))).
can_perform(Actor, prepare_remedy, _) :-
    at_location(Actor, spezieria).

%% hold_banquet
%% Host a lavish dinner to build alliances and display wealth
action(hold_banquet, 'hold_banquet', social, 3).
action_difficulty(hold_banquet, 0.4).
action_duration(hold_banquet, 4).
action_category(hold_banquet, social).
action_verb(hold_banquet, past, 'held a banquet for').
action_verb(hold_banquet, present, 'holds a banquet for').
action_target_type(hold_banquet, other).
action_requires_target(hold_banquet).
action_range(hold_banquet, 10).
action_prerequisite(hold_banquet, (near(Actor, Target, 10))).
action_effect(hold_banquet, (assert(feasted_with(Actor, Target)))).
can_perform(Actor, hold_banquet, Target) :-
    near(Actor, Target, 10).

%% sculpt_marble
%% Carve a figure or relief from a block of marble
action(sculpt_marble, 'sculpt_marble', craft, 3).
action_difficulty(sculpt_marble, 0.7).
action_duration(sculpt_marble, 5).
action_category(sculpt_marble, art).
action_verb(sculpt_marble, past, 'sculpted marble').
action_verb(sculpt_marble, present, 'sculpts marble').
action_target_type(sculpt_marble, none).
action_range(sculpt_marble, 0).
action_prerequisite(sculpt_marble, (at_location(Actor, bottega))).
action_effect(sculpt_marble, (assert(sculpted(Actor)))).
can_perform(Actor, sculpt_marble, _) :-
    at_location(Actor, bottega).

%% observe_anatomy
%% Attend a dissection to study the structure of the human body
action(observe_anatomy, 'observe_anatomy', knowledge, 2).
action_difficulty(observe_anatomy, 0.5).
action_duration(observe_anatomy, 3).
action_category(observe_anatomy, scholarship).
action_verb(observe_anatomy, past, 'observed an anatomy lesson').
action_verb(observe_anatomy, present, 'observes an anatomy lesson').
action_target_type(observe_anatomy, none).
action_range(observe_anatomy, 0).
action_prerequisite(observe_anatomy, (at_location(Actor, academy))).
action_effect(observe_anatomy, (assert(studied(Actor, anatomy)))).
can_perform(Actor, observe_anatomy, _) :-
    at_location(Actor, academy).
