%% Insimul Grammars (Tracery): Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/grammars.pl
%% Created: 2026-04-03
%% Total: 4 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% ═══════════════════════════════════════════════════════════
%% cyberpunk_handles -- netrunner and street aliases
%% ═══════════════════════════════════════════════════════════

grammar(cyberpunk_handles, 'cyberpunk_handles').
grammar_description(cyberpunk_handles, 'Street handles and netrunner aliases used in the Neo Cascade underground. Combines tech jargon, glitch aesthetics, and street culture.').
grammar_rule(cyberpunk_handles, origin, '#prefix##suffix#').
grammar_rule(cyberpunk_handles, origin, '#adjective#_#noun#').
grammar_rule(cyberpunk_handles, origin, '#prefix##number#').
grammar_rule(cyberpunk_handles, prefix, 'Neon').
grammar_rule(cyberpunk_handles, prefix, 'Glitch').
grammar_rule(cyberpunk_handles, prefix, 'Null').
grammar_rule(cyberpunk_handles, prefix, 'Hex').
grammar_rule(cyberpunk_handles, prefix, 'Syn').
grammar_rule(cyberpunk_handles, prefix, 'Cryo').
grammar_rule(cyberpunk_handles, prefix, 'Vex').
grammar_rule(cyberpunk_handles, prefix, 'Rez').
grammar_rule(cyberpunk_handles, prefix, 'Byte').
grammar_rule(cyberpunk_handles, prefix, 'Raze').
grammar_rule(cyberpunk_handles, suffix, 'wire').
grammar_rule(cyberpunk_handles, suffix, 'jack').
grammar_rule(cyberpunk_handles, suffix, 'burn').
grammar_rule(cyberpunk_handles, suffix, 'shade').
grammar_rule(cyberpunk_handles, suffix, 'drift').
grammar_rule(cyberpunk_handles, suffix, 'spike').
grammar_rule(cyberpunk_handles, suffix, 'flux').
grammar_rule(cyberpunk_handles, suffix, 'ghost').
grammar_rule(cyberpunk_handles, adjective, 'Chrome').
grammar_rule(cyberpunk_handles, adjective, 'Black').
grammar_rule(cyberpunk_handles, adjective, 'Dead').
grammar_rule(cyberpunk_handles, adjective, 'Red').
grammar_rule(cyberpunk_handles, adjective, 'Hollow').
grammar_rule(cyberpunk_handles, adjective, 'Static').
grammar_rule(cyberpunk_handles, noun, 'Specter').
grammar_rule(cyberpunk_handles, noun, 'Signal').
grammar_rule(cyberpunk_handles, noun, 'Cortex').
grammar_rule(cyberpunk_handles, noun, 'Daemon').
grammar_rule(cyberpunk_handles, noun, 'Wraith').
grammar_rule(cyberpunk_handles, noun, 'Cipher').
grammar_rule(cyberpunk_handles, number, '404').
grammar_rule(cyberpunk_handles, number, '7').
grammar_rule(cyberpunk_handles, number, '0x00').
grammar_rule(cyberpunk_handles, number, '99').
grammar_rule(cyberpunk_handles, number, '13').

%% ═══════════════════════════════════════════════════════════
%% cyberpunk_street_names -- street and alley names
%% ═══════════════════════════════════════════════════════════

grammar(cyberpunk_street_names, 'cyberpunk_street_names').
grammar_description(cyberpunk_street_names, 'Procedural street and alley names for the Neo Cascade megacity. Blends corporate branding, tech terminology, and decayed urban naming.').
grammar_rule(cyberpunk_street_names, origin, '#descriptor# #road_type#').
grammar_rule(cyberpunk_street_names, origin, '#tech_word# #road_type#').
grammar_rule(cyberpunk_street_names, origin, '#corpo_name# #road_type#').
grammar_rule(cyberpunk_street_names, descriptor, 'Voltage').
grammar_rule(cyberpunk_street_names, descriptor, 'Burnout').
grammar_rule(cyberpunk_street_names, descriptor, 'Neon').
grammar_rule(cyberpunk_street_names, descriptor, 'Rust').
grammar_rule(cyberpunk_street_names, descriptor, 'Carbon').
grammar_rule(cyberpunk_street_names, descriptor, 'Blackout').
grammar_rule(cyberpunk_street_names, descriptor, 'Overflow').
grammar_rule(cyberpunk_street_names, descriptor, 'Flatline').
grammar_rule(cyberpunk_street_names, tech_word, 'Circuit').
grammar_rule(cyberpunk_street_names, tech_word, 'Binary').
grammar_rule(cyberpunk_street_names, tech_word, 'Fiber').
grammar_rule(cyberpunk_street_names, tech_word, 'Quantum').
grammar_rule(cyberpunk_street_names, tech_word, 'Diode').
grammar_rule(cyberpunk_street_names, tech_word, 'Transistor').
grammar_rule(cyberpunk_street_names, corpo_name, 'Arasaka').
grammar_rule(cyberpunk_street_names, corpo_name, 'Nexus').
grammar_rule(cyberpunk_street_names, corpo_name, 'SynthLife').
grammar_rule(cyberpunk_street_names, corpo_name, 'OmniCorp').
grammar_rule(cyberpunk_street_names, road_type, 'Avenue').
grammar_rule(cyberpunk_street_names, road_type, 'Boulevard').
grammar_rule(cyberpunk_street_names, road_type, 'Alley').
grammar_rule(cyberpunk_street_names, road_type, 'Strip').
grammar_rule(cyberpunk_street_names, road_type, 'Corridor').
grammar_rule(cyberpunk_street_names, road_type, 'Overpass').

%% ═══════════════════════════════════════════════════════════
%% cyberpunk_corp_names -- megacorporation name generator
%% ═══════════════════════════════════════════════════════════

grammar(cyberpunk_corp_names, 'cyberpunk_corp_names').
grammar_description(cyberpunk_corp_names, 'Procedural megacorporation names mixing tech buzzwords, clinical terminology, and authoritarian branding.').
grammar_rule(cyberpunk_corp_names, origin, '#prefix# #suffix#').
grammar_rule(cyberpunk_corp_names, origin, '#prefix##suffix#').
grammar_rule(cyberpunk_corp_names, origin, '#prefix# #suffix# #type#').
grammar_rule(cyberpunk_corp_names, prefix, 'Omni').
grammar_rule(cyberpunk_corp_names, prefix, 'Neo').
grammar_rule(cyberpunk_corp_names, prefix, 'Apex').
grammar_rule(cyberpunk_corp_names, prefix, 'Helix').
grammar_rule(cyberpunk_corp_names, prefix, 'Titan').
grammar_rule(cyberpunk_corp_names, prefix, 'Zenith').
grammar_rule(cyberpunk_corp_names, prefix, 'Cryo').
grammar_rule(cyberpunk_corp_names, prefix, 'Vanguard').
grammar_rule(cyberpunk_corp_names, suffix, 'Dynamics').
grammar_rule(cyberpunk_corp_names, suffix, 'Systems').
grammar_rule(cyberpunk_corp_names, suffix, 'Tech').
grammar_rule(cyberpunk_corp_names, suffix, 'Genomics').
grammar_rule(cyberpunk_corp_names, suffix, 'Synth').
grammar_rule(cyberpunk_corp_names, suffix, 'Core').
grammar_rule(cyberpunk_corp_names, suffix, 'Link').
grammar_rule(cyberpunk_corp_names, type, 'Industries').
grammar_rule(cyberpunk_corp_names, type, 'Corporation').
grammar_rule(cyberpunk_corp_names, type, 'Group').
grammar_rule(cyberpunk_corp_names, type, 'Holdings').

%% ═══════════════════════════════════════════════════════════
%% cyberpunk_slang_phrases -- street slang and expressions
%% ═══════════════════════════════════════════════════════════

grammar(cyberpunk_slang_phrases, 'cyberpunk_slang_phrases').
grammar_description(cyberpunk_slang_phrases, 'Street slang and expressions used by residents of Neo Cascade. Useful for NPC dialogue flavor.').
grammar_rule(cyberpunk_slang_phrases, origin, '#greeting#').
grammar_rule(cyberpunk_slang_phrases, origin, '#threat#').
grammar_rule(cyberpunk_slang_phrases, origin, '#farewell#').
grammar_rule(cyberpunk_slang_phrases, greeting, 'Stay chrome, choom.').
grammar_rule(cyberpunk_slang_phrases, greeting, 'What flatlines, runner?').
grammar_rule(cyberpunk_slang_phrases, greeting, 'Scan me in, got biz.').
grammar_rule(cyberpunk_slang_phrases, greeting, 'Jack in, the net is hot tonight.').
grammar_rule(cyberpunk_slang_phrases, threat, 'Keep pushing and you get zeroed.').
grammar_rule(cyberpunk_slang_phrases, threat, 'One more step and I brick your chrome.').
grammar_rule(cyberpunk_slang_phrases, threat, 'You want to flatline? Keep talking.').
grammar_rule(cyberpunk_slang_phrases, farewell, 'Stay off the grid, choom.').
grammar_rule(cyberpunk_slang_phrases, farewell, 'Catch you on the other side of the ICE.').
grammar_rule(cyberpunk_slang_phrases, farewell, 'Keep your firmware updated.').
grammar_rule(cyberpunk_slang_phrases, farewell, 'Disconnect clean.').
