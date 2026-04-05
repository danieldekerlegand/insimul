%% Insimul Actions: Wild West -- Redemption Gulch
%% Source: data/worlds/wild_west/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Format follows base_actions.pl pattern

%% draw_weapon
% Action: draw_weapon
% Quick-draw a sidearm from the holster
% Type: combat / ranged

action(draw_weapon, 'draw_weapon', combat, 5).
action_difficulty(draw_weapon, 0.3).
action_duration(draw_weapon, 1).
action_category(draw_weapon, ranged).
action_verb(draw_weapon, past, 'drew weapon').
action_verb(draw_weapon, present, 'draws weapon').
action_target_type(draw_weapon, self).
action_prerequisite(draw_weapon, (has_item(Actor, colt_peacemaker))).
action_effect(draw_weapon, (assert(weapon_drawn(Actor)))).
can_perform(Actor, draw_weapon, _) :-
    has_item(Actor, colt_peacemaker), \+ weapon_drawn(Actor).

%% shoot
% Action: shoot
% Fire at a target with a drawn weapon
% Type: combat / ranged

action(shoot, 'shoot', combat, 10).
action_difficulty(shoot, 0.5).
action_duration(shoot, 1).
action_category(shoot, ranged).
action_verb(shoot, past, 'shot at').
action_verb(shoot, present, 'shoots at').
action_target_type(shoot, other).
action_requires_target(shoot).
action_range(shoot, 30).
action_prerequisite(shoot, (weapon_drawn(Actor), near(Actor, Target, 30))).
action_effect(shoot, (assert(shot_at(Actor, Target)))).
can_perform(Actor, shoot, Target) :-
    weapon_drawn(Actor), near(Actor, Target, 30).

%% rope_target
% Action: rope_target
% Lasso a person or animal to restrain them
% Type: ranching / restraint

action(rope_target, 'rope_target', ranching, 15).
action_difficulty(rope_target, 0.5).
action_duration(rope_target, 1).
action_category(rope_target, restraint).
action_verb(rope_target, past, 'roped').
action_verb(rope_target, present, 'ropes').
action_target_type(rope_target, other).
action_requires_target(rope_target).
action_range(rope_target, 10).
action_prerequisite(rope_target, (has_item(Actor, lasso), near(Actor, Target, 10))).
action_effect(rope_target, (assert(restrained(Target)))).
can_perform(Actor, rope_target, Target) :-
    has_item(Actor, lasso), near(Actor, Target, 10).

%% ride_horse
% Action: ride_horse
% Mount and ride a horse to travel quickly between locations
% Type: travel / mounted

action(ride_horse, 'ride_horse', travel, 5).
action_difficulty(ride_horse, 0.2).
action_duration(ride_horse, 1).
action_category(ride_horse, mounted).
action_verb(ride_horse, past, 'rode').
action_verb(ride_horse, present, 'rides').
action_target_type(ride_horse, none).
action_prerequisite(ride_horse, (has_horse(Actor))).
action_effect(ride_horse, (assert(mounted(Actor)))).
can_perform(Actor, ride_horse, _) :-
    has_horse(Actor), \+ mounted(Actor).

%% prospect
% Action: prospect
% Search for precious metals in the hills and creek beds
% Type: mining / exploration

action(prospect, 'prospect', mining, 20).
action_difficulty(prospect, 0.6).
action_duration(prospect, 4).
action_category(prospect, exploration).
action_verb(prospect, past, 'prospected').
action_verb(prospect, present, 'prospects').
action_target_type(prospect, location).
action_prerequisite(prospect, (at_location(Actor, mine_district))).
action_effect(prospect, (assert(prospected(Actor, Location)))).
can_perform(Actor, prospect, Location) :-
    at_location(Actor, Location),
    (lot_district(Location, mine_district) ; lot_district(Location, ranch_grounds)).

%% play_poker
% Action: play_poker
% Gamble at the saloon card table
% Type: social / gambling

action(play_poker, 'play_poker', social, 5).
action_difficulty(play_poker, 0.4).
action_duration(play_poker, 2).
action_category(play_poker, gambling).
action_verb(play_poker, past, 'played poker with').
action_verb(play_poker, present, 'plays poker with').
action_target_type(play_poker, other).
action_requires_target(play_poker).
action_range(play_poker, 3).
action_prerequisite(play_poker, (at_location(Actor, saloon), near(Actor, Target, 3))).
action_effect(play_poker, (assert(gambled(Actor, Target)))).
can_perform(Actor, play_poker, Target) :-
    at_location(Actor, saloon), near(Actor, Target, 3).

%% send_telegram
% Action: send_telegram
% Send a telegraph message to a distant contact
% Type: communication / technology

action(send_telegram, 'send_telegram', communication, 5).
action_difficulty(send_telegram, 0.2).
action_duration(send_telegram, 1).
action_category(send_telegram, technology).
action_verb(send_telegram, past, 'sent a telegram').
action_verb(send_telegram, present, 'sends a telegram').
action_target_type(send_telegram, none).
action_prerequisite(send_telegram, (at_location(Actor, telegraph_office))).
action_effect(send_telegram, (assert(telegram_sent(Actor)))).
can_perform(Actor, send_telegram, _) :-
    at_location(Actor, telegraph_office).

%% treat_wound
% Action: treat_wound
% Administer medical treatment to a wounded person
% Type: medical / healing

action(treat_wound, 'treat_wound', medical, 15).
action_difficulty(treat_wound, 0.5).
action_duration(treat_wound, 2).
action_category(treat_wound, healing).
action_verb(treat_wound, past, 'treated wounds of').
action_verb(treat_wound, present, 'treats wounds of').
action_target_type(treat_wound, other).
action_requires_target(treat_wound).
action_range(treat_wound, 2).
action_prerequisite(treat_wound, (has_item(Actor, medicine_pouch), near(Actor, Target, 2))).
action_effect(treat_wound, (retract(wounded(Target)), assert(treated(Target)))).
can_perform(Actor, treat_wound, Target) :-
    has_item(Actor, medicine_pouch), near(Actor, Target, 2), wounded(Target).

%% herd_cattle
% Action: herd_cattle
% Drive cattle from one location to another
% Type: ranching / work

action(herd_cattle, 'herd_cattle', ranching, 20).
action_difficulty(herd_cattle, 0.4).
action_duration(herd_cattle, 5).
action_category(herd_cattle, work).
action_verb(herd_cattle, past, 'herded cattle').
action_verb(herd_cattle, present, 'herds cattle').
action_target_type(herd_cattle, none).
action_prerequisite(herd_cattle, (has_item(Actor, lasso), has_horse(Actor))).
action_effect(herd_cattle, (assert(herded(Actor)))).
can_perform(Actor, herd_cattle, _) :-
    has_item(Actor, lasso), has_horse(Actor).

%% arrest
% Action: arrest
% Lawman arrests a wanted individual
% Type: law / authority

action(arrest, 'arrest', law, 15).
action_difficulty(arrest, 0.6).
action_duration(arrest, 1).
action_category(arrest, authority).
action_verb(arrest, past, 'arrested').
action_verb(arrest, present, 'arrests').
action_target_type(arrest, other).
action_requires_target(arrest).
action_range(arrest, 3).
action_prerequisite(arrest, (faction(Actor, law), near(Actor, Target, 3))).
action_effect(arrest, (assert(arrested(Target)))).
can_perform(Actor, arrest, Target) :-
    faction(Actor, law), near(Actor, Target, 3),
    (status(Target, wanted) ; caught_in_act(Target)).

%% mine_ore
% Action: mine_ore
% Extract ore from a mine shaft
% Type: mining / work

action(mine_ore, 'mine_ore', mining, 20).
action_difficulty(mine_ore, 0.5).
action_duration(mine_ore, 4).
action_category(mine_ore, work).
action_verb(mine_ore, past, 'mined ore').
action_verb(mine_ore, present, 'mines ore').
action_target_type(mine_ore, none).
action_prerequisite(mine_ore, (at_location(Actor, mine))).
action_effect(mine_ore, (assert(has_item(Actor, silver_ore)))).
can_perform(Actor, mine_ore, _) :-
    at_location(Actor, mine).

%% set_dynamite
% Action: set_dynamite
% Place and detonate explosives for mining or demolition
% Type: mining / explosive

action(set_dynamite, 'set_dynamite', mining, 25).
action_difficulty(set_dynamite, 0.7).
action_duration(set_dynamite, 2).
action_category(set_dynamite, explosive).
action_verb(set_dynamite, past, 'set dynamite').
action_verb(set_dynamite, present, 'sets dynamite').
action_target_type(set_dynamite, location).
action_prerequisite(set_dynamite, (has_item(Actor, dynamite_stick))).
action_effect(set_dynamite, (retract(has_item(Actor, dynamite_stick)), assert(detonated(Location)))).
can_perform(Actor, set_dynamite, Location) :-
    has_item(Actor, dynamite_stick), at_location(Actor, Location).
