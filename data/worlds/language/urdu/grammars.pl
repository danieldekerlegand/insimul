%% Insimul Grammars (Tracery): Urdu Punjab
%% Source: data/worlds/language/urdu/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% =====================================================================
%% modern_realistic_character_names
%% =====================================================================

grammar(modern_realistic_character_names, 'modern_realistic_character_names').
grammar_description(modern_realistic_character_names, 'Character names for a contemporary Pakistani Punjabi town. All names MUST be culturally authentic Urdu/Pakistani names using real naming conventions of modern Pakistan.').
grammar_rule(modern_realistic_character_names, origin, '#pakistaniMaleFull#').
grammar_rule(modern_realistic_character_names, origin, '#pakistaniFemaleFull#').
grammar_rule(modern_realistic_character_names, pakistanimalefull, '#pakistaniMale# #familyName#').
grammar_rule(modern_realistic_character_names, pakistanimalefull, '#honorificMale# #pakistaniMale# #familyName#').
grammar_rule(modern_realistic_character_names, pakistanifemalefull, '#pakistaniFemale# #familyName#').
grammar_rule(modern_realistic_character_names, pakistanimalemale, '#pakistaniMale# #pakistaniMale# #familyName#').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Ahmed').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Ali').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Bilal').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Hamza').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Hassan').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Imran').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Kamran').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Farhan').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Rashid').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Tariq').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Usman').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Yousuf').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Zubair').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Qamar').
grammar_rule(modern_realistic_character_names, pakistanimale, 'Jameel').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Ayesha').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Fatima').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Nadia').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Nasreen').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Parveen').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Rukhsana').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Sana').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Sabiha').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Zainab').
grammar_rule(modern_realistic_character_names, pakistanifemale, 'Hina').
grammar_rule(modern_realistic_character_names, familyname, 'Khan').
grammar_rule(modern_realistic_character_names, familyname, 'Ahmed').
grammar_rule(modern_realistic_character_names, familyname, 'Ali').
grammar_rule(modern_realistic_character_names, familyname, 'Malik').
grammar_rule(modern_realistic_character_names, familyname, 'Butt').
grammar_rule(modern_realistic_character_names, familyname, 'Shah').
grammar_rule(modern_realistic_character_names, familyname, 'Hussain').
grammar_rule(modern_realistic_character_names, familyname, 'Iqbal').
grammar_rule(modern_realistic_character_names, familyname, 'Chaudhry').
grammar_rule(modern_realistic_character_names, familyname, 'Qureshi').
grammar_rule(modern_realistic_character_names, honorificmale, 'Haji').
grammar_rule(modern_realistic_character_names, honorificmale, 'Maulana').
grammar_rule(modern_realistic_character_names, honorificmale, 'Professor').
grammar_rule(modern_realistic_character_names, honorificmale, 'Ustad').
grammar_rule(modern_realistic_character_names, honorificmale, 'Chaudhry').
grammar_tag(modern_realistic_character_names, modern_realistic).
grammar_tag(modern_realistic_character_names, character).
grammar_tag(modern_realistic_character_names, names).
grammar_tag(modern_realistic_character_names, urdu).

%% =====================================================================
%% modern_realistic_settlement_names
%% =====================================================================

grammar(modern_realistic_settlement_names, 'modern_realistic_settlement_names').
grammar_description(modern_realistic_settlement_names, 'Settlement names for a contemporary Pakistani Punjabi setting. Use authentic Urdu/Punjabi place naming conventions.').
grammar_rule(modern_realistic_settlement_names, origin, '#prefix# #baseName#').
grammar_rule(modern_realistic_settlement_names, origin, '#baseName# #suffix#').
grammar_rule(modern_realistic_settlement_names, origin, '#standalone#').
grammar_rule(modern_realistic_settlement_names, prefix, 'Noor').
grammar_rule(modern_realistic_settlement_names, prefix, 'Sabz').
grammar_rule(modern_realistic_settlement_names, prefix, 'Shah').
grammar_rule(modern_realistic_settlement_names, prefix, 'Gul').
grammar_rule(modern_realistic_settlement_names, prefix, 'Naya').
grammar_rule(modern_realistic_settlement_names, prefix, 'Purana').
grammar_rule(modern_realistic_settlement_names, basename, 'Manzil').
grammar_rule(modern_realistic_settlement_names, basename, 'Pind').
grammar_rule(modern_realistic_settlement_names, basename, 'Abad').
grammar_rule(modern_realistic_settlement_names, basename, 'Garh').
grammar_rule(modern_realistic_settlement_names, basename, 'Pur').
grammar_rule(modern_realistic_settlement_names, basename, 'Kot').
grammar_rule(modern_realistic_settlement_names, suffix, 'Colony').
grammar_rule(modern_realistic_settlement_names, suffix, 'Town').
grammar_rule(modern_realistic_settlement_names, suffix, 'Nagar').
grammar_rule(modern_realistic_settlement_names, suffix, 'Mohalla').
grammar_rule(modern_realistic_settlement_names, standalone, 'Islamabad').
grammar_rule(modern_realistic_settlement_names, standalone, 'Rawalpindi').
grammar_rule(modern_realistic_settlement_names, standalone, 'Faisalabad').
grammar_rule(modern_realistic_settlement_names, standalone, 'Multan').
grammar_rule(modern_realistic_settlement_names, standalone, 'Sialkot').
grammar_rule(modern_realistic_settlement_names, standalone, 'Gujranwala').
grammar_tag(modern_realistic_settlement_names, modern_realistic).
grammar_tag(modern_realistic_settlement_names, settlement).
grammar_tag(modern_realistic_settlement_names, location).
grammar_tag(modern_realistic_settlement_names, names).
grammar_tag(modern_realistic_settlement_names, urdu).

%% =====================================================================
%% modern_realistic_business_names
%% =====================================================================

grammar(modern_realistic_business_names, 'modern_realistic_business_names').
grammar_description(modern_realistic_business_names, 'Business and establishment names for a contemporary Pakistani Punjabi town. Use authentic naming conventions for Pakistani shops, stalls, and offices.').
grammar_rule(modern_realistic_business_names, origin, '#ownerName# #businessType#').
grammar_rule(modern_realistic_business_names, origin, '#descriptor# #businessType#').
grammar_rule(modern_realistic_business_names, origin, '#ownerName# #descriptor# #businessType#').
grammar_rule(modern_realistic_business_names, businesstype, 'Chai Wala').
grammar_rule(modern_realistic_business_names, businesstype, 'Kiryana Store').
grammar_rule(modern_realistic_business_names, businesstype, 'Darzi').
grammar_rule(modern_realistic_business_names, businesstype, 'Dawakhana').
grammar_rule(modern_realistic_business_names, businesstype, 'Kabab House').
grammar_rule(modern_realistic_business_names, businesstype, 'Biryani Centre').
grammar_rule(modern_realistic_business_names, businesstype, 'Mobile Zone').
grammar_rule(modern_realistic_business_names, businesstype, 'Kitab Ghar').
grammar_rule(modern_realistic_business_names, businesstype, 'Pharmacy').
grammar_rule(modern_realistic_business_names, descriptor, 'Al-Madina').
grammar_rule(modern_realistic_business_names, descriptor, 'Noor').
grammar_rule(modern_realistic_business_names, descriptor, 'Pakistan').
grammar_rule(modern_realistic_business_names, descriptor, 'Qamar').
grammar_rule(modern_realistic_business_names, descriptor, 'Al-Shifa').
grammar_rule(modern_realistic_business_names, descriptor, 'Mehran').
grammar_rule(modern_realistic_business_names, ownername, 'Khan').
grammar_rule(modern_realistic_business_names, ownername, 'Malik').
grammar_rule(modern_realistic_business_names, ownername, 'Butt').
grammar_rule(modern_realistic_business_names, ownername, 'Shah').
grammar_rule(modern_realistic_business_names, ownername, 'Haji').
grammar_rule(modern_realistic_business_names, ownername, 'Bilal').
grammar_tag(modern_realistic_business_names, modern_realistic).
grammar_tag(modern_realistic_business_names, business).
grammar_tag(modern_realistic_business_names, names).
grammar_tag(modern_realistic_business_names, urdu).
