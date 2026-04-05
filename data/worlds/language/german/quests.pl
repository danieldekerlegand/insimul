%% Insimul Quests: German Rhineland
%% Source: data/worlds/language/german/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ===============================================================
%% A1 -- Beginner Quests
%% ===============================================================

%% Quest: Erste Begegnungen (First Encounters)
quest(erste_begegnungen, 'Erste Begegnungen', conversation, beginner, active).
quest_assigned_to(erste_begegnungen, '{{player}}').
quest_language(erste_begegnungen, german).
quest_tag(erste_begegnungen, generated).
quest_objective(erste_begegnungen, 0, talk_to('hans_mueller', 1)).
quest_objective(erste_begegnungen, 1, objective('Learn basic German greetings: Guten Tag, Hallo, Auf Wiedersehen, Tschuess.')).
quest_objective(erste_begegnungen, 2, talk_to('ingrid_mueller', 1)).
quest_reward(erste_begegnungen, experience, 100).
quest_reward(erste_begegnungen, gold, 50).
quest_available(Player, erste_begegnungen) :-
    quest(erste_begegnungen, _, _, _, active).

%% Quest: Beim Baecker (At the Bakery)
quest(beim_baecker, 'Beim Baecker', vocabulary, beginner, active).
quest_assigned_to(beim_baecker, '{{player}}').
quest_language(beim_baecker, german).
quest_tag(beim_baecker, generated).
quest_objective(beim_baecker, 0, objective('Visit Baeckerei Hoffmann on Marktstrasse.')).
quest_objective(beim_baecker, 1, objective('Learn the names of five types of bread: Broetchen, Vollkornbrot, Brezel, Roggenbrot, Pumpernickel.')).
quest_objective(beim_baecker, 2, objective('Order a Broetchen and a Brezel using German.')).
quest_reward(beim_baecker, experience, 100).
quest_reward(beim_baecker, gold, 50).
quest_available(Player, beim_baecker) :-
    quest(beim_baecker, _, _, _, active).

%% Quest: Zahlen und Preise (Numbers and Prices)
quest(zahlen_und_preise, 'Zahlen und Preise', vocabulary, beginner, active).
quest_assigned_to(zahlen_und_preise, '{{player}}').
quest_language(zahlen_und_preise, german).
quest_tag(zahlen_und_preise, generated).
quest_objective(zahlen_und_preise, 0, objective('Learn German numbers 1-20.')).
quest_objective(zahlen_und_preise, 1, objective('Count items at the Marktplatz with Friedrich Weber.')).
quest_objective(zahlen_und_preise, 2, objective('Pay for an item using the correct German number and say bitte and danke.')).
quest_reward(zahlen_und_preise, experience, 120).
quest_reward(zahlen_und_preise, gold, 60).
quest_available(Player, zahlen_und_preise) :-
    quest(zahlen_und_preise, _, _, _, active).

%% Quest: Meine Familie (My Family)
quest(meine_familie, 'Meine Familie', conversation, beginner, active).
quest_assigned_to(meine_familie, '{{player}}').
quest_language(meine_familie, german).
quest_tag(meine_familie, generated).
quest_objective(meine_familie, 0, talk_to('ingrid_mueller', 1)).
quest_objective(meine_familie, 1, objective('Learn family vocabulary: Mutter, Vater, Bruder, Schwester, Sohn, Tochter.')).
quest_objective(meine_familie, 2, objective('Describe your own family in German to Ingrid.')).
quest_reward(meine_familie, experience, 100).
quest_reward(meine_familie, gold, 50).
quest_available(Player, meine_familie) :-
    quest(meine_familie, _, _, _, active).

%% ===============================================================
%% A2 -- Elementary Quests
%% ===============================================================

%% Quest: Marktplatz-Rallye (Market Square Rally)
quest(marktplatz_rallye, 'Marktplatz-Rallye', exploration, beginner, active).
quest_assigned_to(marktplatz_rallye, '{{player}}').
quest_language(marktplatz_rallye, german).
quest_tag(marktplatz_rallye, generated).
quest_objective(marktplatz_rallye, 0, objective('Find the Metzgerei and buy Wurst (sausage).')).
quest_objective(marktplatz_rallye, 1, objective('Find the Buchhandlung and learn the names of five book genres in German.')).
quest_objective(marktplatz_rallye, 2, objective('Find the Apotheke and ask for Kopfschmerztabletten (headache tablets) in German.')).
quest_reward(marktplatz_rallye, experience, 150).
quest_reward(marktplatz_rallye, gold, 80).
quest_available(Player, marktplatz_rallye) :-
    quest(marktplatz_rallye, _, _, _, active).

%% Quest: Kaffee und Kuchen (Coffee and Cake)
quest(kaffee_und_kuchen, 'Kaffee und Kuchen', cultural_knowledge, beginner, active).
quest_assigned_to(kaffee_und_kuchen, '{{player}}').
quest_language(kaffee_und_kuchen, german).
quest_tag(kaffee_und_kuchen, generated).
quest_objective(kaffee_und_kuchen, 0, talk_to('brigitte_wagner', 1)).
quest_objective(kaffee_und_kuchen, 1, objective('Learn the tradition of afternoon Kaffee und Kuchen.')).
quest_objective(kaffee_und_kuchen, 2, objective('Order Kaffee and Apfelstrudel at Eiscafe am Platz using polite German.')).
quest_reward(kaffee_und_kuchen, experience, 150).
quest_reward(kaffee_und_kuchen, gold, 75).
quest_available(Player, kaffee_und_kuchen) :-
    quest(kaffee_und_kuchen, _, _, _, active).

%% Quest: Wegbeschreibung (Giving Directions)
quest(wegbeschreibung, 'Wegbeschreibung', grammar, beginner, active).
quest_assigned_to(wegbeschreibung, '{{player}}').
quest_language(wegbeschreibung, german).
quest_tag(wegbeschreibung, generated).
quest_objective(wegbeschreibung, 0, objective('Learn direction words: rechts, links, geradeaus, zurueck.')).
quest_objective(wegbeschreibung, 1, objective('Ask three people for directions in German using Entschuldigung.')).
quest_objective(wegbeschreibung, 2, objective('Navigate to the Rheintor using only German directions.')).
quest_reward(wegbeschreibung, experience, 150).
quest_reward(wegbeschreibung, gold, 80).
quest_available(Player, wegbeschreibung) :-
    quest(wegbeschreibung, _, _, _, active).

%% Quest: Im Restaurant (At the Restaurant)
quest(im_restaurant, 'Im Restaurant', vocabulary, beginner, active).
quest_assigned_to(im_restaurant, '{{player}}').
quest_language(im_restaurant, german).
quest_tag(im_restaurant, generated).
quest_objective(im_restaurant, 0, objective('Visit Gasthaus zur Linde and order a meal in German.')).
quest_objective(im_restaurant, 1, objective('Learn 10 food words: Schnitzel, Kartoffeln, Salat, Suppe, Brot, Wurst, Kaese, Apfel, Wasser, Bier.')).
quest_objective(im_restaurant, 2, objective('Describe your favorite food in German to Wolfgang Wagner.')).
quest_reward(im_restaurant, experience, 160).
quest_reward(im_restaurant, gold, 80).
quest_available(Player, im_restaurant) :-
    quest(im_restaurant, _, _, _, active).

%% ===============================================================
%% B1 -- Intermediate Quests
%% ===============================================================

%% Quest: Universitaetsbesuch (University Visit)
quest(universitaetsbesuch, 'Universitaetsbesuch', exploration, intermediate, active).
quest_assigned_to(universitaetsbesuch, '{{player}}').
quest_language(universitaetsbesuch, german).
quest_tag(universitaetsbesuch, generated).
quest_objective(universitaetsbesuch, 0, talk_to('klaus_schmidt', 1)).
quest_objective(universitaetsbesuch, 1, objective('Tour the university campus and learn academic vocabulary: Vorlesung, Seminar, Pruefung, Bibliothek.')).
quest_objective(universitaetsbesuch, 2, objective('Introduce yourself to three students using formal German with Sie.')).
quest_objective(universitaetsbesuch, 3, talk_to('lena_schmidt', 1)).
quest_reward(universitaetsbesuch, experience, 250).
quest_reward(universitaetsbesuch, gold, 120).
quest_available(Player, universitaetsbesuch) :-
    quest(universitaetsbesuch, _, _, _, active).

%% Quest: Weinprobe (Wine Tasting)
quest(weinprobe, 'Weinprobe', cultural_knowledge, intermediate, active).
quest_assigned_to(weinprobe, '{{player}}').
quest_language(weinprobe, german).
quest_tag(weinprobe, generated).
quest_objective(weinprobe, 0, objective('Visit Weingut Mueller on Weinbergweg.')).
quest_objective(weinprobe, 1, objective('Learn wine vocabulary: Riesling, Spaetburgunder, trocken, halbtrocken, lieblich, Jahrgang.')).
quest_objective(weinprobe, 2, objective('Describe the taste of three wines in German using adjectives.')).
quest_reward(weinprobe, experience, 250).
quest_reward(weinprobe, gold, 100).
quest_available(Player, weinprobe) :-
    quest(weinprobe, _, _, _, active).

%% Quest: Das Weindorf (The Wine Village)
quest(das_weindorf, 'Das Weindorf', conversation, intermediate, active).
quest_assigned_to(das_weindorf, '{{player}}').
quest_language(das_weindorf, german).
quest_tag(das_weindorf, generated).
quest_objective(das_weindorf, 0, objective('Travel to Weinfeld village.')).
quest_objective(das_weindorf, 1, talk_to('heinrich_schaefer', 1)).
quest_objective(das_weindorf, 2, objective('Help Heinrich describe the winemaking process using agricultural vocabulary.')).
quest_objective(das_weindorf, 3, objective('Have a conversation about village life with Renate Schaefer.')).
quest_reward(das_weindorf, experience, 280).
quest_reward(das_weindorf, gold, 130).
quest_available(Player, das_weindorf) :-
    quest(das_weindorf, _, _, _, active).

%% Quest: Der, Die, Das Meistern (Mastering Articles)
quest(artikel_meistern, 'Der, Die, Das Meistern', grammar, intermediate, active).
quest_assigned_to(artikel_meistern, '{{player}}').
quest_language(artikel_meistern, german).
quest_tag(artikel_meistern, generated).
quest_objective(artikel_meistern, 0, objective('Learn the three grammatical genders and their definite articles: der, die, das.')).
quest_objective(artikel_meistern, 1, objective('Correctly assign articles to 20 common nouns at the Marktplatz.')).
quest_objective(artikel_meistern, 2, objective('Use accusative and dative articles in sentences while shopping at the Metzgerei.')).
quest_reward(artikel_meistern, experience, 250).
quest_reward(artikel_meistern, gold, 150).
quest_available(Player, artikel_meistern) :-
    quest(artikel_meistern, _, _, _, active).

%% ===============================================================
%% B2 -- Upper Intermediate Quests
%% ===============================================================

%% Quest: Weinlese (Grape Harvest)
quest(weinlese, 'Weinlese', conversation, advanced, active).
quest_assigned_to(weinlese, '{{player}}').
quest_language(weinlese, german).
quest_tag(weinlese, generated).
quest_objective(weinlese, 0, objective('Visit Heinrich Schaefer at Weingut Schaefer in Weinfeld.')).
quest_objective(weinlese, 1, talk_to('heinrich_schaefer', 1)).
quest_objective(weinlese, 2, objective('Discuss grape-harvesting traditions and Riesling production in German.')).
quest_objective(weinlese, 3, objective('Write a short paragraph about Rhineland wine culture in German.')).
quest_reward(weinlese, experience, 400).
quest_reward(weinlese, gold, 200).
quest_available(Player, weinlese) :-
    quest(weinlese, _, _, _, active).

%% Quest: Die Podiumsdiskussion (The Panel Discussion)
quest(podiumsdiskussion, 'Die Podiumsdiskussion', grammar, advanced, active).
quest_assigned_to(podiumsdiskussion, '{{player}}').
quest_language(podiumsdiskussion, german).
quest_tag(podiumsdiskussion, generated).
quest_objective(podiumsdiskussion, 0, talk_to('klaus_schmidt', 1)).
quest_objective(podiumsdiskussion, 1, objective('Learn to express opinions: Ich denke, Meiner Meinung nach, Ich bin anderer Meinung.')).
quest_objective(podiumsdiskussion, 2, objective('Participate in a discussion at the university about regional identity.')).
quest_objective(podiumsdiskussion, 3, objective('Use Konjunktiv II (subjunctive) in your arguments.')).
quest_reward(podiumsdiskussion, experience, 450).
quest_reward(podiumsdiskussion, gold, 200).
quest_available(Player, podiumsdiskussion) :-
    quest(podiumsdiskussion, _, _, _, active).

%% Quest: Artikel fuer die Lokalzeitung (Article for the Local Paper)
quest(lokalzeitung, 'Artikel fuer die Lokalzeitung', cultural_knowledge, advanced, active).
quest_assigned_to(lokalzeitung, '{{player}}').
quest_language(lokalzeitung, german).
quest_tag(lokalzeitung, generated).
quest_objective(lokalzeitung, 0, objective('Interview three residents about a community topic.')).
quest_objective(lokalzeitung, 1, objective('Take notes using German abbreviations and shorthand.')).
quest_objective(lokalzeitung, 2, objective('Write a short article in formal German (Hochdeutsch).')).
quest_objective(lokalzeitung, 3, talk_to('petra_schmidt', 1)).
quest_reward(lokalzeitung, experience, 500).
quest_reward(lokalzeitung, gold, 250).
quest_available(Player, lokalzeitung) :-
    quest(lokalzeitung, _, _, _, active).

%% Quest: Rheinpromenade bei Sonnenuntergang (Rhine Promenade at Sunset)
quest(rheinpromenade_abend, 'Rheinpromenade bei Sonnenuntergang', exploration, advanced, active).
quest_assigned_to(rheinpromenade_abend, '{{player}}').
quest_language(rheinpromenade_abend, german).
quest_tag(rheinpromenade_abend, generated).
quest_objective(rheinpromenade_abend, 0, objective('Walk the entire Rheinpromenade and describe the scenery in German.')).
quest_objective(rheinpromenade_abend, 1, objective('Have an extended conversation with a stranger about life in the Rhineland.')).
quest_objective(rheinpromenade_abend, 2, objective('Narrate a short story about the Rheintor and its history in German.')).
quest_reward(rheinpromenade_abend, experience, 450).
quest_reward(rheinpromenade_abend, gold, 200).
quest_available(Player, rheinpromenade_abend) :-
    quest(rheinpromenade_abend, _, _, _, active).
