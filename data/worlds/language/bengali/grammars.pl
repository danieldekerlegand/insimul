%% Insimul Grammars (Tracery): Mughal Bengal
%% Source: data/worlds/language/bengali/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 — grammar(AtomId, Name)
%%   grammar_rule/3 — grammar_rule(GrammarAtom, RuleKey, Expansion)

%% ═══════════════════════════════════════════════════════════
%% Grammar 1: Bengali Character Names
%% ═══════════════════════════════════════════════════════════

grammar(historical_renaissance_character_names, 'historical_renaissance_character_names').
grammar_description(historical_renaissance_character_names, 'Character names for a historical-renaissance world set in Mughal-era Bengal. All names MUST be culturally authentic Bengali names — use real Bengali first names, surnames, and naming conventions.').
grammar_rule(historical_renaissance_character_names, origin, '#givenName# #familyName#').
grammar_rule(historical_renaissance_character_names, givenname, '#male#').
grammar_rule(historical_renaissance_character_names, givenname, '#female#').
grammar_rule(historical_renaissance_character_names, male, 'Raghunath').
grammar_rule(historical_renaissance_character_names, male, 'Gobinda').
grammar_rule(historical_renaissance_character_names, male, 'Biswanath').
grammar_rule(historical_renaissance_character_names, male, 'Haripada').
grammar_rule(historical_renaissance_character_names, male, 'Madhusudan').
grammar_rule(historical_renaissance_character_names, male, 'Nikhil').
grammar_rule(historical_renaissance_character_names, male, 'Anirban').
grammar_rule(historical_renaissance_character_names, male, 'Debashish').
grammar_rule(historical_renaissance_character_names, male, 'Tarun').
grammar_rule(historical_renaissance_character_names, male, 'Jatin').
grammar_rule(historical_renaissance_character_names, male, 'Farid').
grammar_rule(historical_renaissance_character_names, male, 'Kamal').
grammar_rule(historical_renaissance_character_names, male, 'Ramesh').
grammar_rule(historical_renaissance_character_names, male, 'Sudhir').
grammar_rule(historical_renaissance_character_names, male, 'Pranab').
grammar_rule(historical_renaissance_character_names, female, 'Sarojini').
grammar_rule(historical_renaissance_character_names, female, 'Malati').
grammar_rule(historical_renaissance_character_names, female, 'Parvati').
grammar_rule(historical_renaissance_character_names, female, 'Lakshmi').
grammar_rule(historical_renaissance_character_names, female, 'Chandana').
grammar_rule(historical_renaissance_character_names, female, 'Kamala').
grammar_rule(historical_renaissance_character_names, female, 'Shefali').
grammar_rule(historical_renaissance_character_names, female, 'Rani').
grammar_rule(historical_renaissance_character_names, female, 'Basanti').
grammar_rule(historical_renaissance_character_names, female, 'Amina').
grammar_rule(historical_renaissance_character_names, female, 'Nusrat').
grammar_rule(historical_renaissance_character_names, female, 'Supriya').
grammar_rule(historical_renaissance_character_names, female, 'Anjali').
grammar_rule(historical_renaissance_character_names, female, 'Mitali').
grammar_rule(historical_renaissance_character_names, familyname, '#surname#').
grammar_rule(historical_renaissance_character_names, familyname, '#surname#').
grammar_rule(historical_renaissance_character_names, familyname, '#surname#').
grammar_rule(historical_renaissance_character_names, familyname, '#titledSurname#').
grammar_rule(historical_renaissance_character_names, titledsurname, '#title# #surname#').
grammar_rule(historical_renaissance_character_names, title, 'bin').
grammar_rule(historical_renaissance_character_names, title, 'Das').
grammar_rule(historical_renaissance_character_names, surname, 'Chowdhury').
grammar_rule(historical_renaissance_character_names, surname, 'Das').
grammar_rule(historical_renaissance_character_names, surname, 'Sarkar').
grammar_rule(historical_renaissance_character_names, surname, 'Mondal').
grammar_rule(historical_renaissance_character_names, surname, 'Sheikh').
grammar_rule(historical_renaissance_character_names, surname, 'Pal').
grammar_rule(historical_renaissance_character_names, surname, 'Ghosh').
grammar_rule(historical_renaissance_character_names, surname, 'Biswas').
grammar_rule(historical_renaissance_character_names, surname, 'Mitra').
grammar_rule(historical_renaissance_character_names, surname, 'Sen').
grammar_rule(historical_renaissance_character_names, surname, 'Bose').
grammar_rule(historical_renaissance_character_names, surname, 'Dutta').
grammar_rule(historical_renaissance_character_names, surname, 'Chakraborty').
grammar_rule(historical_renaissance_character_names, surname, 'Banerjee').
grammar_rule(historical_renaissance_character_names, surname, 'Mukherjee').

%% ═══════════════════════════════════════════════════════════
%% Grammar 2: Bengali Settlement Names
%% ═══════════════════════════════════════════════════════════

grammar(bengali_settlement_names, 'bengali_settlement_names').
grammar_description(bengali_settlement_names, 'Settlement names for the Bengal Delta region, using authentic Bengali geographic naming patterns.').
grammar_rule(bengali_settlement_names, origin, '#prefix##suffix#').
grammar_rule(bengali_settlement_names, prefix, 'Sonar').
grammar_rule(bengali_settlement_names, prefix, 'Neel').
grammar_rule(bengali_settlement_names, prefix, 'Chandra').
grammar_rule(bengali_settlement_names, prefix, 'Padma').
grammar_rule(bengali_settlement_names, prefix, 'Meghna').
grammar_rule(bengali_settlement_names, prefix, 'Hari').
grammar_rule(bengali_settlement_names, prefix, 'Dhan').
grammar_rule(bengali_settlement_names, prefix, 'Ranga').
grammar_rule(bengali_settlement_names, prefix, 'Shanti').
grammar_rule(bengali_settlement_names, prefix, 'Kali').
grammar_rule(bengali_settlement_names, suffix, 'gaon').
grammar_rule(bengali_settlement_names, suffix, 'pur').
grammar_rule(bengali_settlement_names, suffix, 'nagar').
grammar_rule(bengali_settlement_names, suffix, 'gram').
grammar_rule(bengali_settlement_names, suffix, 'hat').
grammar_rule(bengali_settlement_names, suffix, 'ganj').
grammar_rule(bengali_settlement_names, suffix, 'danga').
grammar_rule(bengali_settlement_names, suffix, 'tala').

%% ═══════════════════════════════════════════════════════════
%% Grammar 3: Bengali Business Names
%% ═══════════════════════════════════════════════════════════

grammar(bengali_business_names, 'bengali_business_names').
grammar_description(bengali_business_names, 'Business and shop names for a Mughal-era Bengali settlement, using authentic Bengali naming patterns.').
grammar_rule(bengali_business_names, origin, '#ownerName#-er #shopType#').
grammar_rule(bengali_business_names, origin, '#prefix# #shopType#').
grammar_rule(bengali_business_names, ownername, 'Gobinda').
grammar_rule(bengali_business_names, ownername, 'Hari').
grammar_rule(bengali_business_names, ownername, 'Kamal').
grammar_rule(bengali_business_names, ownername, 'Farid').
grammar_rule(bengali_business_names, ownername, 'Biswanath').
grammar_rule(bengali_business_names, ownername, 'Lakshmi').
grammar_rule(bengali_business_names, ownername, 'Parvati').
grammar_rule(bengali_business_names, ownername, 'Rani').
grammar_rule(bengali_business_names, prefix, 'Sonar').
grammar_rule(bengali_business_names, prefix, 'Naba').
grammar_rule(bengali_business_names, prefix, 'Boro').
grammar_rule(bengali_business_names, prefix, 'Chhoto').
grammar_rule(bengali_business_names, prefix, 'Purano').
grammar_rule(bengali_business_names, shoptype, 'Dokan').
grammar_rule(bengali_business_names, shoptype, 'Karkhana').
grammar_rule(bengali_business_names, shoptype, 'Haat').
grammar_rule(bengali_business_names, shoptype, 'Ghar').
grammar_rule(bengali_business_names, shoptype, 'Taat Ghar').
grammar_rule(bengali_business_names, shoptype, 'Bajaar').
