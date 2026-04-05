%% Insimul Grammars (Tracery): Sci-Fi Space
%% Source: data/worlds/sci_fi_space/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Space Character Names
grammar(space_character_names, 'space_character_names').
grammar_description(space_character_names, 'Sci-fi character name generation mixing human and alien naming conventions.').
grammar_rule(space_character_names, origin, '#givenName# #familyName#').
grammar_rule(space_character_names, givenname, '#humanName#').
grammar_rule(space_character_names, givenname, '#alienName#').
grammar_rule(space_character_names, humanname, 'Elena').
grammar_rule(space_character_names, humanname, 'Marcus').
grammar_rule(space_character_names, humanname, 'Kira').
grammar_rule(space_character_names, humanname, 'Jax').
grammar_rule(space_character_names, humanname, 'Sola').
grammar_rule(space_character_names, humanname, 'Zara').
grammar_rule(space_character_names, humanname, 'Dmitri').
grammar_rule(space_character_names, humanname, 'Lian').
grammar_rule(space_character_names, humanname, 'Amara').
grammar_rule(space_character_names, humanname, 'Yuki').
grammar_rule(space_character_names, humanname, 'Silas').
grammar_rule(space_character_names, humanname, 'Pip').
grammar_rule(space_character_names, alienname, 'Threx').
grammar_rule(space_character_names, alienname, 'Quorra').
grammar_rule(space_character_names, alienname, 'Zikri').
grammar_rule(space_character_names, alienname, 'Vael').
grammar_rule(space_character_names, alienname, 'Nexari').
grammar_rule(space_character_names, alienname, 'Torq').
grammar_rule(space_character_names, familyname, '#surname#').
grammar_rule(space_character_names, surname, 'Voss').
grammar_rule(space_character_names, surname, 'Renn').
grammar_rule(space_character_names, surname, 'Okonkwo').
grammar_rule(space_character_names, surname, 'Sorokin').
grammar_rule(space_character_names, surname, 'Chen').
grammar_rule(space_character_names, surname, 'Osei').
grammar_rule(space_character_names, surname, 'Tanaka').
grammar_rule(space_character_names, surname, 'Hargrove').
grammar_rule(space_character_names, surname, 'Ik-Vaan').
grammar_rule(space_character_names, surname, 'Zenn').
grammar_rule(space_character_names, surname, 'Maal').

%% Space Station Names
grammar(station_names, 'station_names').
grammar_description(station_names, 'Generation of sci-fi space station and outpost designations.').
grammar_rule(station_names, origin, '#prefix# #suffix#').
grammar_rule(station_names, prefix, 'Nexus').
grammar_rule(station_names, prefix, 'Horizon').
grammar_rule(station_names, prefix, 'Stellar').
grammar_rule(station_names, prefix, 'Orbital').
grammar_rule(station_names, prefix, 'Vanguard').
grammar_rule(station_names, prefix, 'Deep').
grammar_rule(station_names, prefix, 'Frontier').
grammar_rule(station_names, suffix, 'Prime').
grammar_rule(station_names, suffix, 'Station').
grammar_rule(station_names, suffix, 'Outpost').
grammar_rule(station_names, suffix, 'Beacon').
grammar_rule(station_names, suffix, 'Relay').
grammar_rule(station_names, suffix, 'Hub').
grammar_rule(station_names, suffix, 'Anchorage').

%% Ship Names
grammar(ship_names, 'ship_names').
grammar_description(ship_names, 'Generation of spaceship names for freighters, warships, and shuttles.').
grammar_rule(ship_names, origin, '#shipPrefix# #shipCore#').
grammar_rule(ship_names, shipprefix, 'ISS').
grammar_rule(ship_names, shipprefix, 'FSS').
grammar_rule(ship_names, shipprefix, 'TDS').
grammar_rule(ship_names, shipprefix, 'HMS').
grammar_rule(ship_names, shipcore, 'Endeavour').
grammar_rule(ship_names, shipcore, 'Pathfinder').
grammar_rule(ship_names, shipcore, 'Nomad').
grammar_rule(ship_names, shipcore, 'Defiance').
grammar_rule(ship_names, shipcore, 'Serenity').
grammar_rule(ship_names, shipcore, 'Wanderer').
grammar_rule(ship_names, shipcore, 'Tempest').
grammar_rule(ship_names, shipcore, 'Aurora').
