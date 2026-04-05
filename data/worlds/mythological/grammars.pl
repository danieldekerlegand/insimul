%% Insimul Grammars (Tracery): Greek Mythological World
%% Source: data/worlds/mythological/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Greek Mythological Character Names
grammar(mythological_character_names, 'mythological_character_names').
grammar_description(mythological_character_names, 'Name generation for a Greek mythological setting with heroes, demigods, and mortals.').
grammar_rule(mythological_character_names, origin, '#givenName# #familyName#').
grammar_rule(mythological_character_names, givenname, '#maleName#').
grammar_rule(mythological_character_names, givenname, '#femaleName#').
grammar_rule(mythological_character_names, malename, 'Theseus').
grammar_rule(mythological_character_names, malename, 'Orion').
grammar_rule(mythological_character_names, malename, 'Aethon').
grammar_rule(mythological_character_names, malename, 'Peleus').
grammar_rule(mythological_character_names, malename, 'Achilleos').
grammar_rule(mythological_character_names, malename, 'Hierophantes').
grammar_rule(mythological_character_names, malename, 'Tantalos').
grammar_rule(mythological_character_names, malename, 'Daidalos').
grammar_rule(mythological_character_names, malename, 'Ikaros').
grammar_rule(mythological_character_names, malename, 'Perseus').
grammar_rule(mythological_character_names, malename, 'Herakles').
grammar_rule(mythological_character_names, malename, 'Odysseus').
grammar_rule(mythological_character_names, malename, 'Diomedes').
grammar_rule(mythological_character_names, malename, 'Philoctetes').
grammar_rule(mythological_character_names, malename, 'Leandros').
grammar_rule(mythological_character_names, femalename, 'Kallista').
grammar_rule(mythological_character_names, femalename, 'Atalante').
grammar_rule(mythological_character_names, femalename, 'Thetis').
grammar_rule(mythological_character_names, femalename, 'Daphne').
grammar_rule(mythological_character_names, femalename, 'Chloris').
grammar_rule(mythological_character_names, femalename, 'Pythia').
grammar_rule(mythological_character_names, femalename, 'Korinna').
grammar_rule(mythological_character_names, femalename, 'Niobe').
grammar_rule(mythological_character_names, femalename, 'Penelope').
grammar_rule(mythological_character_names, femalename, 'Ariadne').
grammar_rule(mythological_character_names, femalename, 'Medea').
grammar_rule(mythological_character_names, femalename, 'Electra').
grammar_rule(mythological_character_names, femalename, 'Iphigenia').
grammar_rule(mythological_character_names, femalename, 'Andromache').
grammar_rule(mythological_character_names, femalename, 'Cassandra').
grammar_rule(mythological_character_names, familyname, '#surname#').
grammar_rule(mythological_character_names, surname, 'Aegides').
grammar_rule(mythological_character_names, surname, 'Heliades').
grammar_rule(mythological_character_names, surname, 'Artemision').
grammar_rule(mythological_character_names, surname, 'Pyrrhides').
grammar_rule(mythological_character_names, surname, 'Myrmidon').
grammar_rule(mythological_character_names, surname, 'Apollonides').
grammar_rule(mythological_character_names, surname, 'Pelopides').
grammar_rule(mythological_character_names, surname, 'Technites').
grammar_rule(mythological_character_names, surname, 'Nereid').
grammar_rule(mythological_character_names, surname, 'Kalydon').
grammar_rule(mythological_character_names, surname, 'Atreides').
grammar_rule(mythological_character_names, surname, 'Laertides').

%% Greek Place Names
grammar(mythological_place_names, 'mythological_place_names').
grammar_description(mythological_place_names, 'Generation of ancient Greek-style place names for roads and temples.').
grammar_rule(mythological_place_names, origin, 'Hodos #godName#').
grammar_rule(mythological_place_names, godname, 'Apollonos').
grammar_rule(mythological_place_names, godname, 'Athenas').
grammar_rule(mythological_place_names, godname, 'Herakleous').
grammar_rule(mythological_place_names, godname, 'Poseidonos').
grammar_rule(mythological_place_names, godname, 'Hermou').
grammar_rule(mythological_place_names, godname, 'Artemidos').
grammar_rule(mythological_place_names, godname, 'Demetros').
grammar_rule(mythological_place_names, godname, 'Dionysou').

%% Greek Business Names
grammar(mythological_business_names, 'mythological_business_names').
grammar_description(mythological_business_names, 'Generation of ancient Greek-style business and workshop names.').
grammar_rule(mythological_business_names, origin, '#shopType# of #patron#').
grammar_rule(mythological_business_names, shoptype, 'Forge').
grammar_rule(mythological_business_names, shoptype, 'Workshop').
grammar_rule(mythological_business_names, shoptype, 'Taverna').
grammar_rule(mythological_business_names, shoptype, 'Amphora').
grammar_rule(mythological_business_names, shoptype, 'Stoa').
grammar_rule(mythological_business_names, shoptype, 'Gymnasium').
grammar_rule(mythological_business_names, patron, 'Hephaestus').
grammar_rule(mythological_business_names, patron, 'Hermes').
grammar_rule(mythological_business_names, patron, 'Athena').
grammar_rule(mythological_business_names, patron, 'Dionysus').
grammar_rule(mythological_business_names, patron, 'Demeter').
grammar_rule(mythological_business_names, patron, 'Ares').
