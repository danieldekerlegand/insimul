%% Insimul Grammars (Tracery): French Louisiana
%% Source: data/worlds/language/french_louisiana/grammars.json
%% Converted: 2026-04-03T06:20:23Z
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 — grammar(AtomId, Name)
%%   grammar_rule/3 — grammar_rule(GrammarAtom, RuleKey, Expansion)

%% modern-realistic_character_names
grammar(modern_realistic_character_names, 'modern-realistic_character_names').
grammar_description(modern_realistic_character_names, 'Character names for a modern-realistic world. A modern-realistic world set in a French-speaking region. All names MUST be culturally authentic French names — use real French first names, surnames, and naming conventions. Do NOT use generic English names.').
grammar_rule(modern_realistic_character_names, origin, '#givenName# #familyName#').
grammar_rule(modern_realistic_character_names, givenname, '#simpleMale#').
grammar_rule(modern_realistic_character_names, givenname, '#simpleFemale#').
grammar_rule(modern_realistic_character_names, givenname, '#compoundMale#').
grammar_rule(modern_realistic_character_names, givenname, '#compoundFemale#').
grammar_rule(modern_realistic_character_names, simplemale, 'Lucas').
grammar_rule(modern_realistic_character_names, simplemale, 'Gabriel').
grammar_rule(modern_realistic_character_names, simplemale, 'Léo').
grammar_rule(modern_realistic_character_names, simplemale, 'Raphaël').
grammar_rule(modern_realistic_character_names, simplemale, 'Arthur').
grammar_rule(modern_realistic_character_names, simplemale, 'Louis').
grammar_rule(modern_realistic_character_names, simplemale, 'Jules').
grammar_rule(modern_realistic_character_names, simplemale, 'Hugo').
grammar_rule(modern_realistic_character_names, simplemale, 'Adam').
grammar_rule(modern_realistic_character_names, simplemale, 'Ethan').
grammar_rule(modern_realistic_character_names, simplefemale, 'Jade').
grammar_rule(modern_realistic_character_names, simplefemale, 'Louise').
grammar_rule(modern_realistic_character_names, simplefemale, 'Emma').
grammar_rule(modern_realistic_character_names, simplefemale, 'Alice').
grammar_rule(modern_realistic_character_names, simplefemale, 'Ambre').
grammar_rule(modern_realistic_character_names, simplefemale, 'Lina').
grammar_rule(modern_realistic_character_names, simplefemale, 'Rose').
grammar_rule(modern_realistic_character_names, simplefemale, 'Chloé').
grammar_rule(modern_realistic_character_names, simplefemale, 'Mia').
grammar_rule(modern_realistic_character_names, simplefemale, 'Léa').
grammar_rule(modern_realistic_character_names, compoundmale, 'Jean-#malePart#').
grammar_rule(modern_realistic_character_names, compoundmale, 'Pierre-#malePart#').
grammar_rule(modern_realistic_character_names, compoundmale, 'Marc-Antoine').
grammar_rule(modern_realistic_character_names, compoundmale, 'Jean-Baptiste').
grammar_rule(modern_realistic_character_names, compoundmale, 'Paul-Émile').
grammar_rule(modern_realistic_character_names, compoundmale, 'François-Xavier').
grammar_rule(modern_realistic_character_names, compoundfemale, 'Marie-#femalePart#').
grammar_rule(modern_realistic_character_names, compoundfemale, 'Anne-#femalePart#').
grammar_rule(modern_realistic_character_names, compoundfemale, 'Léa-Rose').
grammar_rule(modern_realistic_character_names, compoundfemale, 'Lily-Rose').
grammar_rule(modern_realistic_character_names, compoundfemale, 'Marie-Lou').
grammar_rule(modern_realistic_character_names, compoundfemale, 'Sarah-Jeanne').
grammar_rule(modern_realistic_character_names, malepart, 'Luc').
grammar_rule(modern_realistic_character_names, malepart, 'Yves').
grammar_rule(modern_realistic_character_names, malepart, 'Philippe').
grammar_rule(modern_realistic_character_names, malepart, 'Paul').
grammar_rule(modern_realistic_character_names, malepart, 'Louis').
grammar_rule(modern_realistic_character_names, malepart, 'Michel').
grammar_rule(modern_realistic_character_names, malepart, 'Pierre').
grammar_rule(modern_realistic_character_names, malepart, 'Christophe').
grammar_rule(modern_realistic_character_names, femalepart, 'Claire').
grammar_rule(modern_realistic_character_names, femalepart, 'Sophie').
grammar_rule(modern_realistic_character_names, femalepart, 'Laure').
grammar_rule(modern_realistic_character_names, femalepart, 'Line').
grammar_rule(modern_realistic_character_names, femalepart, 'Charlotte').
grammar_rule(modern_realistic_character_names, femalepart, 'Hélène').
grammar_rule(modern_realistic_character_names, femalepart, 'Flore').
grammar_rule(modern_realistic_character_names, femalepart, 'Élise').
grammar_rule(modern_realistic_character_names, familyname, '#surname#').
grammar_rule(modern_realistic_character_names, familyname, '#surname#').
grammar_rule(modern_realistic_character_names, familyname, '#surname#').
grammar_rule(modern_realistic_character_names, familyname, '#surname#').
grammar_rule(modern_realistic_character_names, familyname, '#prefixedSurname#').
grammar_rule(modern_realistic_character_names, prefixedsurname, '#surnamePrefix# #surname#').
grammar_rule(modern_realistic_character_names, surnameprefix, 'de').
grammar_rule(modern_realistic_character_names, surnameprefix, 'Le').
grammar_rule(modern_realistic_character_names, surnameprefix, 'Du').
grammar_rule(modern_realistic_character_names, surnameprefix, 'La').
grammar_rule(modern_realistic_character_names, surnameprefix, 'D''').
grammar_rule(modern_realistic_character_names, surname, 'Martin').
grammar_rule(modern_realistic_character_names, surname, 'Bernard').
grammar_rule(modern_realistic_character_names, surname, 'Thomas').
grammar_rule(modern_realistic_character_names, surname, 'Petit').
grammar_rule(modern_realistic_character_names, surname, 'Robert').
grammar_rule(modern_realistic_character_names, surname, 'Richard').
grammar_rule(modern_realistic_character_names, surname, 'Durand').
grammar_rule(modern_realistic_character_names, surname, 'Dubois').
grammar_rule(modern_realistic_character_names, surname, 'Moreau').
grammar_rule(modern_realistic_character_names, surname, 'Laurent').
grammar_rule(modern_realistic_character_names, surname, 'Simon').
grammar_rule(modern_realistic_character_names, surname, 'Michel').
grammar_rule(modern_realistic_character_names, surname, 'Lefebvre').
grammar_rule(modern_realistic_character_names, surname, 'Leroy').
grammar_rule(modern_realistic_character_names, surname, 'Roux').
grammar_tag(modern_realistic_character_names, generated).
grammar_tag(modern_realistic_character_names, modern_realistic).
grammar_tag(modern_realistic_character_names, name).
grammar_tag(modern_realistic_character_names, modern_realistic).
grammar_tag(modern_realistic_character_names, character).
grammar_tag(modern_realistic_character_names, names).

%% modern-realistic_settlement_names
grammar(modern_realistic_settlement_names, 'modern-realistic_settlement_names').
grammar_description(modern_realistic_settlement_names, 'Settlement names (cities, towns, villages) for a modern-realistic world. A modern-realistic world set in a French-speaking region. Use authentic French place naming conventions.').
grammar_rule(modern_realistic_settlement_names, origin, '#prefix##baseName#').
grammar_rule(modern_realistic_settlement_names, origin, '#baseName##locationSuffix#').
grammar_rule(modern_realistic_settlement_names, origin, '#saintName#').
grammar_rule(modern_realistic_settlement_names, origin, '#saintName##locationSuffix#').
grammar_rule(modern_realistic_settlement_names, origin, '#prefix##baseName##locationSuffix#').
grammar_rule(modern_realistic_settlement_names, prefix, 'Pont-').
grammar_rule(modern_realistic_settlement_names, prefix, 'Mont-').
grammar_rule(modern_realistic_settlement_names, prefix, 'Val-').
grammar_rule(modern_realistic_settlement_names, prefix, 'Bois-').
grammar_rule(modern_realistic_settlement_names, prefix, 'Bourg-').
grammar_rule(modern_realistic_settlement_names, prefix, 'Château-').
grammar_rule(modern_realistic_settlement_names, basename, 'Martin').
grammar_rule(modern_realistic_settlement_names, basename, 'Bernard').
grammar_rule(modern_realistic_settlement_names, basename, 'Fleury').
grammar_rule(modern_realistic_settlement_names, basename, 'Clairvaux').
grammar_rule(modern_realistic_settlement_names, basename, 'Rochefort').
grammar_rule(modern_realistic_settlement_names, basename, 'Verneuil').
grammar_rule(modern_realistic_settlement_names, locationsuffix, '-sur-#waterBody#').
grammar_rule(modern_realistic_settlement_names, locationsuffix, '-en-#region#').
grammar_rule(modern_realistic_settlement_names, locationsuffix, '-lès-#majorCity#').
grammar_rule(modern_realistic_settlement_names, locationsuffix, '-la-Forêt').
grammar_rule(modern_realistic_settlement_names, locationsuffix, '-des-Champs').
grammar_rule(modern_realistic_settlement_names, saintname, 'Saint-Martin').
grammar_rule(modern_realistic_settlement_names, saintname, 'Saint-Denis').
grammar_rule(modern_realistic_settlement_names, saintname, 'Saint-Germain').
grammar_rule(modern_realistic_settlement_names, saintname, 'Sainte-Marie').
grammar_rule(modern_realistic_settlement_names, saintname, 'Saint-Laurent').
grammar_rule(modern_realistic_settlement_names, saintname, 'Saint-Pierre').
grammar_rule(modern_realistic_settlement_names, waterbody, 'l''Oise').
grammar_rule(modern_realistic_settlement_names, waterbody, 'la-Seine').
grammar_rule(modern_realistic_settlement_names, waterbody, 'la-Marne').
grammar_rule(modern_realistic_settlement_names, waterbody, 'le-Lac').
grammar_rule(modern_realistic_settlement_names, waterbody, 'l''Orge').
grammar_rule(modern_realistic_settlement_names, region, 'Valois').
grammar_rule(modern_realistic_settlement_names, region, 'Gâtinais').
grammar_rule(modern_realistic_settlement_names, region, 'Parisis').
grammar_rule(modern_realistic_settlement_names, region, 'Beauce').
grammar_rule(modern_realistic_settlement_names, region, 'Montagne').
grammar_rule(modern_realistic_settlement_names, majorcity, 'Paris').
grammar_rule(modern_realistic_settlement_names, majorcity, 'Lyon').
grammar_rule(modern_realistic_settlement_names, majorcity, 'Tours').
grammar_rule(modern_realistic_settlement_names, majorcity, 'Reims').
grammar_rule(modern_realistic_settlement_names, majorcity, 'Orléans').
grammar_tag(modern_realistic_settlement_names, generated).
grammar_tag(modern_realistic_settlement_names, modern_realistic).
grammar_tag(modern_realistic_settlement_names, name).
grammar_tag(modern_realistic_settlement_names, modern_realistic).
grammar_tag(modern_realistic_settlement_names, settlement).
grammar_tag(modern_realistic_settlement_names, location).
grammar_tag(modern_realistic_settlement_names, names).

%% modern-realistic_business_names
grammar(modern_realistic_business_names, 'modern-realistic_business_names').
grammar_description(modern_realistic_business_names, 'Business and establishment names (taverns, shops, services) for a modern-realistic world. A modern-realistic world set in a French-speaking region. Use authentic French business naming conventions.').
grammar_rule(modern_realistic_business_names, origin, '#prefix# #establishment_noun# #qualifier#').
grammar_rule(modern_realistic_business_names, origin, '#prefix# #qualifier# #establishment_noun#').
grammar_rule(modern_realistic_business_names, origin, '#business_type# #surname#').
grammar_rule(modern_realistic_business_names, origin, 'Chez #surname#').
grammar_rule(modern_realistic_business_names, origin, '#surname# #conjunction.family# Fils').
grammar_rule(modern_realistic_business_names, origin, '#concept_noun# #conjunction.and# #concept_noun#').
grammar_rule(modern_realistic_business_names, origin, 'L''#concept_noun# #conjunction.of# #establishment_noun#').
grammar_rule(modern_realistic_business_names, origin, '#franglais#').
grammar_rule(modern_realistic_business_names, prefix, 'Le').
grammar_rule(modern_realistic_business_names, prefix, 'La').
grammar_rule(modern_realistic_business_names, prefix, 'Au').
grammar_rule(modern_realistic_business_names, prefix, 'À la').
grammar_rule(modern_realistic_business_names, establishment_noun, 'Comptoir').
grammar_rule(modern_realistic_business_names, establishment_noun, 'Fournil').
grammar_rule(modern_realistic_business_names, establishment_noun, 'Atelier').
grammar_rule(modern_realistic_business_names, establishment_noun, 'Bistrot').
grammar_rule(modern_realistic_business_names, establishment_noun, 'Coin').
grammar_rule(modern_realistic_business_names, establishment_noun, 'Échoppe').
grammar_rule(modern_realistic_business_names, qualifier, 'Gourmand').
grammar_rule(modern_realistic_business_names, qualifier, 'Parisien').
grammar_rule(modern_realistic_business_names, qualifier, 'Authentique').
grammar_rule(modern_realistic_business_names, qualifier, 'Moderne').
grammar_rule(modern_realistic_business_names, qualifier, 'du Village').
grammar_rule(modern_realistic_business_names, qualifier, 'Secret').
grammar_rule(modern_realistic_business_names, surname, 'Martin').
grammar_rule(modern_realistic_business_names, surname, 'Bernard').
grammar_rule(modern_realistic_business_names, surname, 'Dubois').
grammar_rule(modern_realistic_business_names, surname, 'Moreau').
grammar_rule(modern_realistic_business_names, surname, 'Laurent').
grammar_rule(modern_realistic_business_names, surname, 'Lefebvre').
grammar_rule(modern_realistic_business_names, business_type, 'Café-Bar').
grammar_rule(modern_realistic_business_names, business_type, 'Boulangerie-Pâtisserie').
grammar_rule(modern_realistic_business_names, business_type, 'Salon de Coiffure').
grammar_rule(modern_realistic_business_names, business_type, 'Librairie').
grammar_rule(modern_realistic_business_names, business_type, 'Boucherie-Charcuterie').
grammar_rule(modern_realistic_business_names, business_type, 'Fleuriste').
grammar_rule(modern_realistic_business_names, concept_noun, 'Plaisir').
grammar_rule(modern_realistic_business_names, concept_noun, 'Goût').
grammar_rule(modern_realistic_business_names, concept_noun, 'Savoir-Faire').
grammar_rule(modern_realistic_business_names, concept_noun, 'Moment').
grammar_rule(modern_realistic_business_names, concept_noun, 'Bonheur').
grammar_rule(modern_realistic_business_names, concept_noun, 'Art').
grammar_rule(modern_realistic_business_names, conjunction, 'family').
grammar_rule(modern_realistic_business_names, conjunction, 'and').
grammar_rule(modern_realistic_business_names, conjunction, 'of').
grammar_rule(modern_realistic_business_names, franglais, 'Le Coffee Shop').
grammar_rule(modern_realistic_business_names, franglais, 'Beauty Corner').
grammar_rule(modern_realistic_business_names, franglais, 'The Barber Shop').
grammar_rule(modern_realistic_business_names, franglais, 'Food Truck de #surname#').
grammar_rule(modern_realistic_business_names, franglais, 'Workshop Créatif').
grammar_tag(modern_realistic_business_names, generated).
grammar_tag(modern_realistic_business_names, modern_realistic).
grammar_tag(modern_realistic_business_names, name).
grammar_tag(modern_realistic_business_names, modern_realistic).
grammar_tag(modern_realistic_business_names, business).
grammar_tag(modern_realistic_business_names, establishment).
grammar_tag(modern_realistic_business_names, names).


