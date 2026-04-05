%% Insimul Quests: Arabic Coastal Town
%% Source: data/worlds/language/arabic/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ═══════════════════════════════════════════════════════════
%% A1 — Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: First Greetings
quest(first_greetings, 'First Greetings', conversation, beginner, active).
quest_assigned_to(first_greetings, '{{player}}').
quest_language(first_greetings, arabic).
quest_tag(first_greetings, generated).
quest_objective(first_greetings, 0, talk_to('omar_hassan', 1)).
quest_objective(first_greetings, 1, objective('Learn basic Arabic greetings: marhaba, ahlan, salaam.')).
quest_objective(first_greetings, 2, talk_to('fatima_hassan', 1)).
quest_reward(first_greetings, experience, 100).
quest_reward(first_greetings, gold, 50).
quest_available(Player, first_greetings) :-
    quest(first_greetings, _, _, _, active).

%% Quest: At the Bakery
quest(at_the_bakery, 'At the Bakery', vocabulary, beginner, active).
quest_assigned_to(at_the_bakery, '{{player}}').
quest_language(at_the_bakery, arabic).
quest_tag(at_the_bakery, generated).
quest_objective(at_the_bakery, 0, objective('Visit Makhbaz al-Furn bakery.')).
quest_objective(at_the_bakery, 1, objective('Learn the names of five types of bread in Arabic.')).
quest_objective(at_the_bakery, 2, objective('Order khubz and manaqish using Arabic.')).
quest_reward(at_the_bakery, experience, 100).
quest_reward(at_the_bakery, gold, 50).
quest_available(Player, at_the_bakery) :-
    quest(at_the_bakery, _, _, _, active).

%% Quest: Counting Coins
quest(counting_coins, 'Counting Coins', vocabulary, beginner, active).
quest_assigned_to(counting_coins, '{{player}}').
quest_language(counting_coins, arabic).
quest_tag(counting_coins, generated).
quest_objective(counting_coins, 0, objective('Learn Arabic numbers 1-20.')).
quest_objective(counting_coins, 1, objective('Count items at the spice souq with Ibrahim Mansour.')).
quest_objective(counting_coins, 2, objective('Pay for an item using the correct Arabic number.')).
quest_reward(counting_coins, experience, 120).
quest_reward(counting_coins, gold, 60).
quest_available(Player, counting_coins) :-
    quest(counting_coins, _, _, _, active).

%% Quest: My Family
quest(my_family, 'My Family', conversation, beginner, active).
quest_assigned_to(my_family, '{{player}}').
quest_language(my_family, arabic).
quest_tag(my_family, generated).
quest_objective(my_family, 0, talk_to('fatima_hassan', 1)).
quest_objective(my_family, 1, objective('Learn family vocabulary: umm, ab, akh, ukht, ibn, bint.')).
quest_objective(my_family, 2, objective('Describe your own family in Arabic to Fatima.')).
quest_reward(my_family, experience, 100).
quest_reward(my_family, gold, 50).
quest_available(Player, my_family) :-
    quest(my_family, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% A2 — Elementary Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Souq Scavenger Hunt
quest(souq_scavenger_hunt, 'Souq Scavenger Hunt', exploration, beginner, active).
quest_assigned_to(souq_scavenger_hunt, '{{player}}').
quest_language(souq_scavenger_hunt, arabic).
quest_tag(souq_scavenger_hunt, generated).
quest_objective(souq_scavenger_hunt, 0, objective('Find the spice souq and buy cumin (kammun).')).
quest_objective(souq_scavenger_hunt, 1, objective('Find the textile shop and learn fabric names.')).
quest_objective(souq_scavenger_hunt, 2, objective('Find the bookstore and ask for a recommendation in Arabic.')).
quest_reward(souq_scavenger_hunt, experience, 150).
quest_reward(souq_scavenger_hunt, gold, 80).
quest_available(Player, souq_scavenger_hunt) :-
    quest(souq_scavenger_hunt, _, _, _, active).

%% Quest: Coffee Customs
quest(coffee_customs, 'Coffee Customs', cultural_knowledge, beginner, active).
quest_assigned_to(coffee_customs, '{{player}}').
quest_language(coffee_customs, arabic).
quest_tag(coffee_customs, generated).
quest_objective(coffee_customs, 0, talk_to('omar_hassan', 1)).
quest_objective(coffee_customs, 1, objective('Learn the etiquette of Arabic coffee service.')).
quest_objective(coffee_customs, 2, objective('Serve coffee to three guests using proper Arabic phrases.')).
quest_reward(coffee_customs, experience, 150).
quest_reward(coffee_customs, gold, 75).
quest_available(Player, coffee_customs) :-
    quest(coffee_customs, _, _, _, active).

%% Quest: Directions in the Medina
quest(directions_medina, 'Directions in the Medina', grammar, beginner, active).
quest_assigned_to(directions_medina, '{{player}}').
quest_language(directions_medina, arabic).
quest_tag(directions_medina, generated).
quest_objective(directions_medina, 0, objective('Learn direction words: yameen, yasar, amam, khalif.')).
quest_objective(directions_medina, 1, objective('Ask three people for directions in Arabic.')).
quest_objective(directions_medina, 2, objective('Navigate to the lighthouse using only Arabic directions.')).
quest_reward(directions_medina, experience, 150).
quest_reward(directions_medina, gold, 80).
quest_available(Player, directions_medina) :-
    quest(directions_medina, _, _, _, active).

%% Quest: Food Festival
quest(food_festival, 'Food Festival', vocabulary, beginner, active).
quest_assigned_to(food_festival, '{{player}}').
quest_language(food_festival, arabic).
quest_tag(food_festival, generated).
quest_objective(food_festival, 0, objective('Visit Mataam al-Falafel and order a meal in Arabic.')).
quest_objective(food_festival, 1, objective('Learn 10 food words at the seafood restaurant.')).
quest_objective(food_festival, 2, objective('Describe your favorite food in Arabic to Huda Mansour.')).
quest_reward(food_festival, experience, 160).
quest_reward(food_festival, gold, 80).
quest_available(Player, food_festival) :-
    quest(food_festival, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B1 — Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: University Tour
quest(university_tour, 'University Tour', exploration, intermediate, active).
quest_assigned_to(university_tour, '{{player}}').
quest_language(university_tour, arabic).
quest_tag(university_tour, generated).
quest_objective(university_tour, 0, talk_to('khalid_al_rashid', 1)).
quest_objective(university_tour, 1, objective('Tour the university campus and learn academic vocabulary.')).
quest_objective(university_tour, 2, objective('Introduce yourself to three students in formal Arabic.')).
quest_objective(university_tour, 3, talk_to('nadia_al_rashid', 1)).
quest_reward(university_tour, experience, 250).
quest_reward(university_tour, gold, 120).
quest_available(Player, university_tour) :-
    quest(university_tour, _, _, _, active).

%% Quest: The Art of Calligraphy
quest(art_of_calligraphy, 'The Art of Calligraphy', cultural_knowledge, intermediate, active).
quest_assigned_to(art_of_calligraphy, '{{player}}').
quest_language(art_of_calligraphy, arabic).
quest_tag(art_of_calligraphy, generated).
quest_objective(art_of_calligraphy, 0, objective('Visit Studio al-Khatt.')).
quest_objective(art_of_calligraphy, 1, objective('Learn about Arabic calligraphy styles: naskh, thuluth, diwani.')).
quest_objective(art_of_calligraphy, 2, objective('Write your name in Arabic calligraphy.')).
quest_reward(art_of_calligraphy, experience, 250).
quest_reward(art_of_calligraphy, gold, 100).
quest_available(Player, art_of_calligraphy) :-
    quest(art_of_calligraphy, _, _, _, active).

%% Quest: The Fishing Village
quest(fishing_village, 'The Fishing Village', conversation, intermediate, active).
quest_assigned_to(fishing_village, '{{player}}').
quest_language(fishing_village, arabic).
quest_tag(fishing_village, generated).
quest_objective(fishing_village, 0, objective('Travel to Al-Zahra village.')).
quest_objective(fishing_village, 1, talk_to('mahmoud_jabari', 1)).
quest_objective(fishing_village, 2, objective('Help Mahmoud describe his catch using marine vocabulary.')).
quest_objective(fishing_village, 3, objective('Have a conversation about village life with Samia Jabari.')).
quest_reward(fishing_village, experience, 280).
quest_reward(fishing_village, gold, 130).
quest_available(Player, fishing_village) :-
    quest(fishing_village, _, _, _, active).

%% Quest: Bargaining at the Souq
quest(bargaining_souq, 'Bargaining at the Souq', grammar, intermediate, active).
quest_assigned_to(bargaining_souq, '{{player}}').
quest_language(bargaining_souq, arabic).
quest_tag(bargaining_souq, generated).
quest_objective(bargaining_souq, 0, objective('Learn comparative and superlative forms in Arabic.')).
quest_objective(bargaining_souq, 1, objective('Bargain for a textile at Dukkan al-Aqmisha.')).
quest_objective(bargaining_souq, 2, objective('Successfully negotiate a price reduction using Arabic.')).
quest_reward(bargaining_souq, experience, 250).
quest_reward(bargaining_souq, gold, 150).
quest_available(Player, bargaining_souq) :-
    quest(bargaining_souq, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B2 — Upper Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Olive Harvest
quest(olive_harvest, 'The Olive Harvest', conversation, advanced, active).
quest_assigned_to(olive_harvest, '{{player}}').
quest_language(olive_harvest, arabic).
quest_tag(olive_harvest, generated).
quest_objective(olive_harvest, 0, objective('Visit Adel Nasser at the olive press in Al-Zahra.')).
quest_objective(olive_harvest, 1, talk_to('adel_nasser', 1)).
quest_objective(olive_harvest, 2, objective('Discuss olive farming traditions in Arabic.')).
quest_objective(olive_harvest, 3, objective('Write a short paragraph about agriculture in Arabic.')).
quest_reward(olive_harvest, experience, 400).
quest_reward(olive_harvest, gold, 200).
quest_available(Player, olive_harvest) :-
    quest(olive_harvest, _, _, _, active).

%% Quest: The Debate
quest(the_debate, 'The Debate', grammar, advanced, active).
quest_assigned_to(the_debate, '{{player}}').
quest_language(the_debate, arabic).
quest_tag(the_debate, generated).
quest_objective(the_debate, 0, talk_to('khalid_al_rashid', 1)).
quest_objective(the_debate, 1, objective('Learn to express opinions: I think, I believe, I disagree.')).
quest_objective(the_debate, 2, objective('Participate in a debate at the university on a cultural topic.')).
quest_objective(the_debate, 3, objective('Use conditional sentences in your arguments.')).
quest_reward(the_debate, experience, 450).
quest_reward(the_debate, gold, 200).
quest_available(Player, the_debate) :-
    quest(the_debate, _, _, _, active).

%% Quest: Writing for the Local Paper
quest(local_paper, 'Writing for the Local Paper', cultural_knowledge, advanced, active).
quest_assigned_to(local_paper, '{{player}}').
quest_language(local_paper, arabic).
quest_tag(local_paper, generated).
quest_objective(local_paper, 0, objective('Interview three residents about a community topic.')).
quest_objective(local_paper, 1, objective('Take notes using Arabic shorthand.')).
quest_objective(local_paper, 2, objective('Write a short article in Modern Standard Arabic.')).
quest_objective(local_paper, 3, talk_to('amira_al_rashid', 1)).
quest_reward(local_paper, experience, 500).
quest_reward(local_paper, gold, 250).
quest_available(Player, local_paper) :-
    quest(local_paper, _, _, _, active).

%% Quest: Corniche Sunset Tour
quest(corniche_sunset, 'Corniche Sunset Tour', exploration, advanced, active).
quest_assigned_to(corniche_sunset, '{{player}}').
quest_language(corniche_sunset, arabic).
quest_tag(corniche_sunset, generated).
quest_objective(corniche_sunset, 0, objective('Walk the entire corniche and describe the scenery in Arabic.')).
quest_objective(corniche_sunset, 1, objective('Have an extended conversation with a stranger about life in the town.')).
quest_objective(corniche_sunset, 2, objective('Narrate a short story about the lighthouse in Arabic.')).
quest_reward(corniche_sunset, experience, 450).
quest_reward(corniche_sunset, gold, 200).
quest_available(Player, corniche_sunset) :-
    quest(corniche_sunset, _, _, _, active).
