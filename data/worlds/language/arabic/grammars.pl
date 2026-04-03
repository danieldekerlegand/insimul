%% Insimul Grammars (Tracery): Arabic Al-Andalus
%% Source: data/worlds/language/arabic/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 — grammar(AtomId, Name)
%%   grammar_rule/3 — grammar_rule(GrammarAtom, RuleKey, Expansion)

%% ═══════════════════════════════════════════════════════════
%% historical_medieval_character_names
%% ═══════════════════════════════════════════════════════════

grammar(historical_medieval_character_names, 'historical_medieval_character_names').
grammar_description(historical_medieval_character_names, 'Character names for a historical medieval Al-Andalus world. All names MUST be culturally authentic Arabic, Jewish, or Mozarab names using real naming conventions of medieval Iberia.').
grammar_rule(historical_medieval_character_names, origin, '#arabicMaleFull#').
grammar_rule(historical_medieval_character_names, origin, '#arabicFemaleFull#').
grammar_rule(historical_medieval_character_names, origin, '#jewishMaleFull#').
grammar_rule(historical_medieval_character_names, origin, '#mozarabMaleFull#').
grammar_rule(historical_medieval_character_names, arabicmalefull, '#arabicMale# #nasab#').
grammar_rule(historical_medieval_character_names, arabicmalefull, '#arabicMale# #nisba#').
grammar_rule(historical_medieval_character_names, arabicmalefull, '#kunya# #arabicMale# #nasab#').
grammar_rule(historical_medieval_character_names, arabicfemalefull, '#arabicFemale# #nasab#').
grammar_rule(historical_medieval_character_names, arabicfemalefull, '#arabicFemale# #nisba#').
grammar_rule(historical_medieval_character_names, arabicmale, 'Ahmad').
grammar_rule(historical_medieval_character_names, arabicmale, 'Muhammad').
grammar_rule(historical_medieval_character_names, arabicmale, 'Yusuf').
grammar_rule(historical_medieval_character_names, arabicmale, 'Khalid').
grammar_rule(historical_medieval_character_names, arabicmale, 'Tariq').
grammar_rule(historical_medieval_character_names, arabicmale, 'Omar').
grammar_rule(historical_medieval_character_names, arabicmale, 'Hassan').
grammar_rule(historical_medieval_character_names, arabicmale, 'Ibrahim').
grammar_rule(historical_medieval_character_names, arabicmale, 'Ali').
grammar_rule(historical_medieval_character_names, arabicmale, 'Ismail').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Fatima').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Khadija').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Zahra').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Maryam').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Layla').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Salma').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Noura').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Amina').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Hafsa').
grammar_rule(historical_medieval_character_names, arabicfemale, 'Aisha').
grammar_rule(historical_medieval_character_names, kunya, 'Abu').
grammar_rule(historical_medieval_character_names, kunya, 'Umm').
grammar_rule(historical_medieval_character_names, nasab, 'ibn #arabicMale#').
grammar_rule(historical_medieval_character_names, nasab, 'ibn #arabicMale# ibn #arabicMale#').
grammar_rule(historical_medieval_character_names, nisba, 'al-Qurtubi').
grammar_rule(historical_medieval_character_names, nisba, 'al-Ishbili').
grammar_rule(historical_medieval_character_names, nisba, 'al-Andalusi').
grammar_rule(historical_medieval_character_names, nisba, 'al-Gharbi').
grammar_rule(historical_medieval_character_names, nisba, 'al-Rashid').
grammar_rule(historical_medieval_character_names, nisba, 'al-Tulaytuli').
grammar_rule(historical_medieval_character_names, jewishmalefull, '#jewishMale# ben #jewishMale#').
grammar_rule(historical_medieval_character_names, jewishmale, 'Moshe').
grammar_rule(historical_medieval_character_names, jewishmale, 'Shlomo').
grammar_rule(historical_medieval_character_names, jewishmale, 'David').
grammar_rule(historical_medieval_character_names, jewishmale, 'Yosef').
grammar_rule(historical_medieval_character_names, jewishmale, 'Hasdai').
grammar_rule(historical_medieval_character_names, jewishmale, 'Shmuel').
grammar_rule(historical_medieval_character_names, mozarabmalefull, '#mozarabMale# de #mozarabPlace#').
grammar_rule(historical_medieval_character_names, mozarabmale, 'Alfonso').
grammar_rule(historical_medieval_character_names, mozarabmale, 'Rodrigo').
grammar_rule(historical_medieval_character_names, mozarabmale, 'Fernando').
grammar_rule(historical_medieval_character_names, mozarabmale, 'Pedro').
grammar_rule(historical_medieval_character_names, mozarabmale, 'Diego').
grammar_rule(historical_medieval_character_names, mozarabplace, 'Leon').
grammar_rule(historical_medieval_character_names, mozarabplace, 'Toledo').
grammar_rule(historical_medieval_character_names, mozarabplace, 'Castilla').
grammar_rule(historical_medieval_character_names, mozarabplace, 'Navarra').
grammar_tag(historical_medieval_character_names, historical_medieval).
grammar_tag(historical_medieval_character_names, character).
grammar_tag(historical_medieval_character_names, names).
grammar_tag(historical_medieval_character_names, arabic).

%% ═══════════════════════════════════════════════════════════
%% historical_medieval_settlement_names
%% ═══════════════════════════════════════════════════════════

grammar(historical_medieval_settlement_names, 'historical_medieval_settlement_names').
grammar_description(historical_medieval_settlement_names, 'Settlement names for a historical medieval Al-Andalus world. Use authentic Arabic place naming conventions from medieval Iberia.').
grammar_rule(historical_medieval_settlement_names, origin, '#prefix##baseName#').
grammar_rule(historical_medieval_settlement_names, origin, '#baseName# #suffix#').
grammar_rule(historical_medieval_settlement_names, origin, '#standalone#').
grammar_rule(historical_medieval_settlement_names, prefix, 'Madinat ').
grammar_rule(historical_medieval_settlement_names, prefix, 'Qasr ').
grammar_rule(historical_medieval_settlement_names, prefix, 'Hisn ').
grammar_rule(historical_medieval_settlement_names, prefix, 'Wadi ').
grammar_rule(historical_medieval_settlement_names, prefix, 'Jabal ').
grammar_rule(historical_medieval_settlement_names, prefix, 'Bab ').
grammar_rule(historical_medieval_settlement_names, basename, 'al-Zahra').
grammar_rule(historical_medieval_settlement_names, basename, 'al-Hamra').
grammar_rule(historical_medieval_settlement_names, basename, 'al-Bayda').
grammar_rule(historical_medieval_settlement_names, basename, 'al-Kabir').
grammar_rule(historical_medieval_settlement_names, basename, 'al-Saghir').
grammar_rule(historical_medieval_settlement_names, basename, 'al-Jadid').
grammar_rule(historical_medieval_settlement_names, suffix, 'al-Gharb').
grammar_rule(historical_medieval_settlement_names, suffix, 'al-Sharq').
grammar_rule(historical_medieval_settlement_names, suffix, 'al-Janub').
grammar_rule(historical_medieval_settlement_names, suffix, 'al-Shamal').
grammar_rule(historical_medieval_settlement_names, standalone, 'Qurtuba').
grammar_rule(historical_medieval_settlement_names, standalone, 'Ishbiliya').
grammar_rule(historical_medieval_settlement_names, standalone, 'Tulaytula').
grammar_rule(historical_medieval_settlement_names, standalone, 'Gharnata').
grammar_rule(historical_medieval_settlement_names, standalone, 'Malaqa').
grammar_rule(historical_medieval_settlement_names, standalone, 'Saraqusta').
grammar_tag(historical_medieval_settlement_names, historical_medieval).
grammar_tag(historical_medieval_settlement_names, settlement).
grammar_tag(historical_medieval_settlement_names, location).
grammar_tag(historical_medieval_settlement_names, names).
grammar_tag(historical_medieval_settlement_names, arabic).

%% ═══════════════════════════════════════════════════════════
%% historical_medieval_business_names
%% ═══════════════════════════════════════════════════════════

grammar(historical_medieval_business_names, 'historical_medieval_business_names').
grammar_description(historical_medieval_business_names, 'Business and establishment names for a historical medieval Al-Andalus world. Use authentic Arabic naming conventions for medieval Iberian shops, workshops, and institutions.').
grammar_rule(historical_medieval_business_names, origin, '#businessType# #ownerName#').
grammar_rule(historical_medieval_business_names, origin, '#businessType# #alDescriptor#').
grammar_rule(historical_medieval_business_names, origin, '#alDescriptor# #businessType#').
grammar_rule(historical_medieval_business_names, origin, '#businessType# #location#').
grammar_rule(historical_medieval_business_names, businesstype, 'Suq').
grammar_rule(historical_medieval_business_names, businesstype, 'Dukkan').
grammar_rule(historical_medieval_business_names, businesstype, 'Hammam').
grammar_rule(historical_medieval_business_names, businesstype, 'Khan').
grammar_rule(historical_medieval_business_names, businesstype, 'Funduq').
grammar_rule(historical_medieval_business_names, businesstype, 'Furn').
grammar_rule(historical_medieval_business_names, businesstype, 'Dar').
grammar_rule(historical_medieval_business_names, businesstype, 'Maktab').
grammar_rule(historical_medieval_business_names, aldescriptor, 'al-Kabir').
grammar_rule(historical_medieval_business_names, aldescriptor, 'al-Saghir').
grammar_rule(historical_medieval_business_names, aldescriptor, 'al-Jadid').
grammar_rule(historical_medieval_business_names, aldescriptor, 'al-Qadim').
grammar_rule(historical_medieval_business_names, aldescriptor, 'al-Amir').
grammar_rule(historical_medieval_business_names, aldescriptor, 'al-Nur').
grammar_rule(historical_medieval_business_names, ownername, 'ibn Ahmad').
grammar_rule(historical_medieval_business_names, ownername, 'ibn Khalid').
grammar_rule(historical_medieval_business_names, ownername, 'al-Qurtubi').
grammar_rule(historical_medieval_business_names, ownername, 'al-Rashid').
grammar_rule(historical_medieval_business_names, ownername, 'ibn Yusuf').
grammar_rule(historical_medieval_business_names, ownername, 'al-Andalusi').
grammar_rule(historical_medieval_business_names, location, 'al-Medina').
grammar_rule(historical_medieval_business_names, location, 'al-Wadi').
grammar_rule(historical_medieval_business_names, location, 'al-Suq').
grammar_rule(historical_medieval_business_names, location, 'al-Qasr').
grammar_tag(historical_medieval_business_names, historical_medieval).
grammar_tag(historical_medieval_business_names, business).
grammar_tag(historical_medieval_business_names, names).
grammar_tag(historical_medieval_business_names, arabic).
