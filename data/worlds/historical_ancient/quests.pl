%% Insimul Quests: Historical Ancient World
%% Source: data/worlds/historical_ancient/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ===============================================================
%% Beginner Quests
%% ===============================================================

%% Quest: Voice of the Agora
quest(voice_of_the_agora, 'Voice of the Agora', exploration, beginner, active).
quest_assigned_to(voice_of_the_agora, '{{player}}').
quest_tag(voice_of_the_agora, generated).
quest_objective(voice_of_the_agora, 0, objective('Visit the Stoa Poikile in the Agora District.')).
quest_objective(voice_of_the_agora, 1, talk_to('themistokles', 1)).
quest_objective(voice_of_the_agora, 2, objective('Listen to a public debate and learn three rhetorical terms.')).
quest_reward(voice_of_the_agora, experience, 100).
quest_reward(voice_of_the_agora, gold, 50).
quest_available(Player, voice_of_the_agora) :-
    quest(voice_of_the_agora, _, _, _, active).

%% Quest: Bread and Olives
quest(bread_and_olives, 'Bread and Olives', vocabulary, beginner, active).
quest_assigned_to(bread_and_olives, '{{player}}').
quest_tag(bread_and_olives, generated).
quest_objective(bread_and_olives, 0, objective('Visit the Thermopolium of Vetutius in Roma.')).
quest_objective(bread_and_olives, 1, talk_to('gaius_vetutius', 1)).
quest_objective(bread_and_olives, 2, objective('Learn the names of five common Roman foods: panis, oliva, caseus, vinum, garum.')).
quest_reward(bread_and_olives, experience, 100).
quest_reward(bread_and_olives, gold, 50).
quest_available(Player, bread_and_olives) :-
    quest(bread_and_olives, _, _, _, active).

%% Quest: Potters Mark
quest(potters_mark, 'Potters Mark', conversation, beginner, active).
quest_assigned_to(potters_mark, '{{player}}').
quest_tag(potters_mark, generated).
quest_objective(potters_mark, 0, objective('Visit the Kerameus Workshop in Kerameikos.')).
quest_objective(potters_mark, 1, talk_to('kleomenes', 1)).
quest_objective(potters_mark, 2, objective('Learn pottery terminology: amphora, krater, kylix, lekythos.')).
quest_objective(potters_mark, 3, talk_to('phaidra', 1)).
quest_reward(potters_mark, experience, 120).
quest_reward(potters_mark, gold, 60).
quest_available(Player, potters_mark) :-
    quest(potters_mark, _, _, _, active).

%% ===============================================================
%% Intermediate Quests
%% ===============================================================

%% Quest: Trial of the Pnyx
quest(trial_of_the_pnyx, 'Trial of the Pnyx', conversation, intermediate, active).
quest_assigned_to(trial_of_the_pnyx, '{{player}}').
quest_tag(trial_of_the_pnyx, generated).
quest_objective(trial_of_the_pnyx, 0, talk_to('themistokles', 1)).
quest_objective(trial_of_the_pnyx, 1, objective('Learn the principles of Athenian demokratia.')).
quest_objective(trial_of_the_pnyx, 2, objective('Cast a vote on a civic matter using an ostrakon.')).
quest_objective(trial_of_the_pnyx, 3, objective('Debate a proposed law with Aspasia at the Stoa.')).
quest_reward(trial_of_the_pnyx, experience, 250).
quest_reward(trial_of_the_pnyx, gold, 120).
quest_available(Player, trial_of_the_pnyx) :-
    quest(trial_of_the_pnyx, _, _, _, active).

%% Quest: The Gladiators Oath
quest(gladiators_oath, 'The Gladiators Oath', exploration, intermediate, active).
quest_assigned_to(gladiators_oath, '{{player}}').
quest_tag(gladiators_oath, generated).
quest_objective(gladiators_oath, 0, objective('Visit Ludus Magnus in the Subura District.')).
quest_objective(gladiators_oath, 1, talk_to('spartacus_thrax', 1)).
quest_objective(gladiators_oath, 2, objective('Learn the gladiatorial oath: uri, vinciri, verberari, ferroque necari.')).
quest_objective(gladiators_oath, 3, objective('Train with a wooden gladius in the practice yard.')).
quest_reward(gladiators_oath, experience, 280).
quest_reward(gladiators_oath, gold, 130).
quest_available(Player, gladiators_oath) :-
    quest(gladiators_oath, _, _, _, active).

%% Quest: Secrets of the Embalmers
quest(secrets_of_the_embalmers, 'Secrets of the Embalmers', cultural_knowledge, intermediate, active).
quest_assigned_to(secrets_of_the_embalmers, '{{player}}').
quest_tag(secrets_of_the_embalmers, generated).
quest_objective(secrets_of_the_embalmers, 0, objective('Travel to the West Bank District of Thebes.')).
quest_objective(secrets_of_the_embalmers, 1, talk_to('paneb', 1)).
quest_objective(secrets_of_the_embalmers, 2, objective('Learn the seventy-day mummification process.')).
quest_objective(secrets_of_the_embalmers, 3, objective('Identify the four canopic jars and their guardian deities.')).
quest_reward(secrets_of_the_embalmers, experience, 250).
quest_reward(secrets_of_the_embalmers, gold, 100).
quest_available(Player, secrets_of_the_embalmers) :-
    quest(secrets_of_the_embalmers, _, _, _, active).

%% Quest: Patron and Client
quest(patron_and_client, 'Patron and Client', conversation, intermediate, active).
quest_assigned_to(patron_and_client, '{{player}}').
quest_tag(patron_and_client, generated).
quest_objective(patron_and_client, 0, talk_to('lucius_aurelius', 1)).
quest_objective(patron_and_client, 1, objective('Learn the rituals of the morning salutatio.')).
quest_objective(patron_and_client, 2, objective('Accompany Lucius as a client through the Forum.')).
quest_objective(patron_and_client, 3, objective('Receive a sportula (gift basket) as a token of patronage.')).
quest_reward(patron_and_client, experience, 250).
quest_reward(patron_and_client, gold, 150).
quest_available(Player, patron_and_client) :-
    quest(patron_and_client, _, _, _, active).

%% ===============================================================
%% Advanced Quests
%% ===============================================================

%% Quest: Symposium of Wisdom
quest(symposium_of_wisdom, 'Symposium of Wisdom', grammar, advanced, active).
quest_assigned_to(symposium_of_wisdom, '{{player}}').
quest_tag(symposium_of_wisdom, generated).
quest_objective(symposium_of_wisdom, 0, talk_to('aspasia', 1)).
quest_objective(symposium_of_wisdom, 1, objective('Attend a symposium at the hall of Dionysos.')).
quest_objective(symposium_of_wisdom, 2, objective('Compose and recite a short philosophical argument.')).
quest_objective(symposium_of_wisdom, 3, objective('Defend your position against a Socratic cross-examination.')).
quest_reward(symposium_of_wisdom, experience, 400).
quest_reward(symposium_of_wisdom, gold, 200).
quest_available(Player, symposium_of_wisdom) :-
    quest(symposium_of_wisdom, _, _, _, active).

%% Quest: Rites of the Temple
quest(rites_of_the_temple, 'Rites of the Temple', cultural_knowledge, advanced, active).
quest_assigned_to(rites_of_the_temple, '{{player}}').
quest_tag(rites_of_the_temple, generated).
quest_objective(rites_of_the_temple, 0, objective('Enter the Great Temple of Amun at Karnak.')).
quest_objective(rites_of_the_temple, 1, talk_to('khaemwaset', 1)).
quest_objective(rites_of_the_temple, 2, objective('Learn the daily offering ritual to Amun-Ra.')).
quest_objective(rites_of_the_temple, 3, objective('Assist Nefertari in performing a hymn to the gods.')).
quest_reward(rites_of_the_temple, experience, 450).
quest_reward(rites_of_the_temple, gold, 200).
quest_available(Player, rites_of_the_temple) :-
    quest(rites_of_the_temple, _, _, _, active).

%% Quest: The Senators Gambit
quest(senators_gambit, 'The Senators Gambit', conversation, advanced, active).
quest_assigned_to(senators_gambit, '{{player}}').
quest_tag(senators_gambit, generated).
quest_objective(senators_gambit, 0, talk_to('lucius_aurelius', 1)).
quest_objective(senators_gambit, 1, objective('Navigate a political negotiation in the Senate chamber.')).
quest_objective(senators_gambit, 2, objective('Persuade two opposing senators to support a public works proposal.')).
quest_objective(senators_gambit, 3, talk_to('valeria_maxima', 1)).
quest_reward(senators_gambit, experience, 500).
quest_reward(senators_gambit, gold, 250).
quest_available(Player, senators_gambit) :-
    quest(senators_gambit, _, _, _, active).

%% Quest: Ship to Piraeus
quest(ship_to_piraeus, 'Ship to Piraeus', exploration, advanced, active).
quest_assigned_to(ship_to_piraeus, '{{player}}').
quest_tag(ship_to_piraeus, generated).
quest_objective(ship_to_piraeus, 0, talk_to('demades', 1)).
quest_objective(ship_to_piraeus, 1, objective('Inspect the cargo of a trireme at the Emporion Warehouse.')).
quest_objective(ship_to_piraeus, 2, objective('Negotiate a trade deal for Attic pottery and Egyptian linen.')).
quest_objective(ship_to_piraeus, 3, objective('Navigate the ship past the headland using ancient star charts.')).
quest_reward(ship_to_piraeus, experience, 450).
quest_reward(ship_to_piraeus, gold, 200).
quest_available(Player, ship_to_piraeus) :-
    quest(ship_to_piraeus, _, _, _, active).

%% Quest: The Scribes Examination
quest(scribes_examination, 'The Scribes Examination', grammar, advanced, active).
quest_assigned_to(scribes_examination, '{{player}}').
quest_tag(scribes_examination, generated).
quest_objective(scribes_examination, 0, objective('Enter the House of Life scribe school in Thebes.')).
quest_objective(scribes_examination, 1, talk_to('meritamun', 1)).
quest_objective(scribes_examination, 2, objective('Copy a passage from the Book of the Dead onto papyrus.')).
quest_objective(scribes_examination, 3, objective('Pass an oral examination on hieroglyphic determinatives.')).
quest_reward(scribes_examination, experience, 500).
quest_reward(scribes_examination, gold, 250).
quest_available(Player, scribes_examination) :-
    quest(scribes_examination, _, _, _, active).
