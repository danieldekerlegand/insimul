%% Insimul Truths: German Rhineland
%% Source: data/worlds/language/german/truths.pl
%% Created: 2026-04-03
%% Total: 22 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Three Grammatical Genders
truth(three_genders, 'Three Grammatical Genders', linguistic_note).
truth_content(three_genders, 'German has three grammatical genders: masculine (der), feminine (die), and neuter (das). The gender of a noun must be memorized, as it is often not predictable from the meaning. Der Tisch (table) is masculine, die Lampe (lamp) is feminine, das Buch (book) is neuter.').
truth_importance(three_genders, 10).
truth_timestep(three_genders, 0).

%% Four Cases
truth(four_cases, 'Four Grammatical Cases', linguistic_note).
truth_content(four_cases, 'German uses four grammatical cases: Nominativ (subject), Akkusativ (direct object), Dativ (indirect object), and Genitiv (possession). Articles, adjectives, and pronouns change form depending on the case. Mastering cases is essential for correct German.').
truth_importance(four_cases, 10).
truth_timestep(four_cases, 0).

%% Compound Words
truth(compound_words, 'Compound Words (Komposita)', linguistic_note).
truth_content(compound_words, 'German is famous for building long compound words by joining nouns together. Handschuh (glove) literally means hand-shoe. Staubsauger (vacuum cleaner) means dust-sucker. The last noun determines the gender of the whole compound.').
truth_importance(compound_words, 9).
truth_timestep(compound_words, 0).

%% Punctuality (Puenktlichkeit)
truth(puenktlichkeit, 'Puenktlichkeit (Punctuality)', cultural_norm).
truth_content(puenktlichkeit, 'Punctuality is deeply valued in German culture. Arriving even five minutes late to an appointment is considered rude. Trains run on precise schedules, and meetings start exactly on time. Being early is better than being on time.').
truth_importance(puenktlichkeit, 9).
truth_timestep(puenktlichkeit, 0).

%% Du vs Sie
truth(du_vs_sie, 'Du vs Sie (Informal vs Formal You)', linguistic_note).
truth_content(du_vs_sie, 'German distinguishes between informal du (for friends, family, children) and formal Sie (for strangers, elders, professional contexts). Using du with someone who expects Sie is a social misstep. The shift from Sie to du is often explicitly offered and marks a deepening relationship.').
truth_importance(du_vs_sie, 9).
truth_timestep(du_vs_sie, 0).

%% Bread Culture
truth(bread_culture, 'Bread Culture (Brotkultur)', cultural_norm).
truth_content(bread_culture, 'Germany has over 3,000 registered types of bread -- the greatest variety in the world. German Brotkultur is UNESCO-recognized. Breakfast centers on fresh Broetchen, and Abendbrot (evening bread) is a traditional cold supper with sliced bread, cheese, and cold cuts.').
truth_importance(bread_culture, 8).
truth_timestep(bread_culture, 0).

%% Verb Position
truth(verb_position, 'Verb Position in Sentences', linguistic_note).
truth_content(verb_position, 'In German main clauses, the conjugated verb is always in second position. In subordinate clauses, it moves to the end. This verb-second rule is one of the most important structural differences from English. Ich gehe heute ins Kino becomes Ich weiss, dass ich heute ins Kino gehe.').
truth_importance(verb_position, 9).
truth_timestep(verb_position, 0).

%% Kaffee und Kuchen
truth(kaffee_kuchen, 'Kaffee und Kuchen', cultural_norm).
truth_content(kaffee_kuchen, 'The afternoon tradition of Kaffee und Kuchen (coffee and cake) around 3-4 PM is a cherished social ritual. Friends and family gather for coffee, homemade cake, and conversation. It is especially important on Sundays.').
truth_importance(kaffee_kuchen, 7).
truth_timestep(kaffee_kuchen, 0).

%% Wine Culture in the Rhineland
truth(rhineland_wine, 'Rhineland Wine Culture', cultural_norm).
truth_content(rhineland_wine, 'The Rhineland is one of the most important wine regions in Germany, famous for Riesling. Weinstuben and Strausswirtschaften (seasonal wine taverns) are central to social life. The annual Weinlese (grape harvest) in autumn is a major community event.').
truth_importance(rhineland_wine, 8).
truth_timestep(rhineland_wine, 0).

%% Separable Verbs
truth(separable_verbs, 'Separable Verbs (Trennbare Verben)', linguistic_note).
truth_content(separable_verbs, 'Many German verbs have separable prefixes that split off and move to the end of the sentence. Aufstehen (to get up) becomes Ich stehe um 7 Uhr auf. Common prefixes include auf, an, ab, mit, zu, aus, ein. Recognizing these is key to understanding spoken German.').
truth_importance(separable_verbs, 8).
truth_timestep(separable_verbs, 0).

%% Recycling (Muelltrennung)
truth(muelltrennung, 'Muelltrennung (Waste Separation)', cultural_norm).
truth_content(muelltrennung, 'Germans take recycling very seriously. Waste must be sorted into multiple bins: Restmuell (general), Biomuell (organic), Papier (paper), Gelber Sack (packaging), and Glas (glass by color). Pfand (bottle deposit) returns are done at supermarket machines.').
truth_importance(muelltrennung, 7).
truth_timestep(muelltrennung, 0).

%% Greeting Customs
truth(greeting_customs_de, 'German Greeting Customs', cultural_norm).
truth_content(greeting_customs_de, 'Guten Tag is the standard formal greeting. Hallo is informal. In southern Germany and the Rhineland, Guten Morgen, Mahlzeit (at lunchtime), and regional greetings are common. Handshakes are standard in formal settings; close friends may hug.').
truth_importance(greeting_customs_de, 8).
truth_timestep(greeting_customs_de, 0).

%% Noun Capitalization
truth(noun_capitalization, 'Noun Capitalization', linguistic_note).
truth_content(noun_capitalization, 'In German, all nouns are capitalized, not just proper nouns. Der Hund (the dog), die Stadt (the city), das Leben (the life). This is unique among major European languages and helps learners identify nouns in written text.').
truth_importance(noun_capitalization, 8).
truth_timestep(noun_capitalization, 0).

%% Sunday Rest (Sonntagsruhe)
truth(sonntagsruhe, 'Sonntagsruhe (Sunday Rest)', social_rule).
truth_content(sonntagsruhe, 'By law, most shops in Germany are closed on Sundays. Sonntagsruhe (Sunday rest) is deeply respected. Noisy activities like mowing the lawn or drilling are frowned upon or even prohibited. Sunday is for family, walks, and Kaffee und Kuchen.').
truth_importance(sonntagsruhe, 8).
truth_timestep(sonntagsruhe, 0).

%% Umlauts
truth(umlauts, 'Umlauts (ae, oe, ue)', linguistic_note).
truth_content(umlauts, 'German has three umlaut vowels: ae, oe, ue (written with two dots above a, o, u). They change the pronunciation and meaning of words. Schon means already, but schoen means beautiful. Umlauts also appear in plural forms: Buch becomes Buecher.').
truth_importance(umlauts, 8).
truth_timestep(umlauts, 0).

%% Half-Timbered Architecture
truth(fachwerk, 'Fachwerk (Half-Timbered Houses)', cultural_norm).
truth_content(fachwerk, 'The Altstadt of Rhineland towns features Fachwerk (half-timbered) houses dating back centuries. These distinctive buildings with exposed wooden beams are a symbol of German heritage. Many are protected as historical monuments and house shops, Weinstuben, and residences.').
truth_importance(fachwerk, 6).
truth_timestep(fachwerk, 0).

%% Modal Particles
truth(modal_particles, 'Modal Particles (Modalpartikeln)', linguistic_note).
truth_content(modal_particles, 'German uses small words called Modalpartikeln (modal particles) -- doch, ja, mal, halt, eben, schon -- that add nuance and emotion. They have no direct English translation. Das ist ja toll adds surprise. Komm mal her softens a request. Mastering these makes German sound natural.').
truth_importance(modal_particles, 7).
truth_timestep(modal_particles, 0).

%% Vereinsleben (Club Life)
truth(vereinsleben, 'Vereinsleben (Club Life)', social_rule).
truth_content(vereinsleben, 'Germany has a strong tradition of Vereine (clubs and associations) for every interest: sports, singing, gardening, wine-tasting, carnival. Joining a Verein is one of the best ways to integrate into a German community and practice the language.').
truth_importance(vereinsleben, 7).
truth_timestep(vereinsleben, 0).

%% Rhine River Identity
truth(rhein_identity, 'Rhine River Identity', cultural_norm).
truth_content(rhein_identity, 'The Rhine (Rhein) is more than a river -- it is central to Rhineland identity. The Rheinpromenade is where locals walk, jog, and socialize. Rhine legends, Rhine wine, and Rhine shipping have shaped the culture for centuries.').
truth_importance(rhein_identity, 7).
truth_timestep(rhein_identity, 0).

%% Plural Formation
truth(plural_formation, 'German Plural Formation', linguistic_note).
truth_content(plural_formation, 'German has multiple plural patterns unlike English. Nouns can add -e, -er, -en, -n, -s, or nothing, and may also gain an umlaut. Hund becomes Hunde, Buch becomes Buecher, Frau becomes Frauen. There are patterns by gender but many exceptions.').
truth_importance(plural_formation, 7).
truth_timestep(plural_formation, 0).

%% Doener Culture
truth(doener_culture, 'Doener Kebab Culture', social_rule).
truth_content(doener_culture, 'The Doener Kebab, introduced by Turkish immigrants, has become one of the most popular street foods in Germany. Germany has more Doener shops than Turkey. It represents the multicultural character of modern Germany and is a staple of student life.').
truth_importance(doener_culture, 5).
truth_timestep(doener_culture, 0).

%% Shoe Etiquette in Homes
truth(shoes_at_home, 'Removing Shoes Indoors', social_rule).
truth_content(shoes_at_home, 'In most German homes, guests are expected to remove shoes at the door. Hosts often provide Hausschuhe (house slippers). This reflects the German emphasis on cleanliness and respect for the home environment.').
truth_importance(shoes_at_home, 6).
truth_timestep(shoes_at_home, 0).
