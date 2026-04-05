%% Insimul Quests: Spanish Castile
%% Source: data/worlds/language/spanish/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% =====================================================
%% A1 -- Beginner Quests
%% =====================================================

%% Quest: Hola y Buenos Dias
quest(hola_buenos_dias, 'Hola y Buenos Dias', conversation, beginner, active).
quest_assigned_to(hola_buenos_dias, '{{player}}').
quest_language(hola_buenos_dias, spanish).
quest_tag(hola_buenos_dias, generated).
quest_objective(hola_buenos_dias, 0, talk_to('carlos_garcia_lopez', 1)).
quest_objective(hola_buenos_dias, 1, objective('Learn basic Spanish greetings: hola, buenos dias, buenas tardes, buenas noches.')).
quest_objective(hola_buenos_dias, 2, talk_to('elena_martinez_ruiz', 1)).
quest_reward(hola_buenos_dias, experience, 100).
quest_reward(hola_buenos_dias, gold, 50).
quest_available(Player, hola_buenos_dias) :-
    quest(hola_buenos_dias, _, _, _, active).

%% Quest: En la Panaderia
quest(en_la_panaderia, 'En la Panaderia', vocabulary, beginner, active).
quest_assigned_to(en_la_panaderia, '{{player}}').
quest_language(en_la_panaderia, spanish).
quest_tag(en_la_panaderia, generated).
quest_objective(en_la_panaderia, 0, objective('Visit Panaderia La Espiga.')).
quest_objective(en_la_panaderia, 1, objective('Learn the names of five types of bread and pastries in Spanish.')).
quest_objective(en_la_panaderia, 2, objective('Order pan, churros, and a magdalena using Spanish.')).
quest_reward(en_la_panaderia, experience, 100).
quest_reward(en_la_panaderia, gold, 50).
quest_available(Player, en_la_panaderia) :-
    quest(en_la_panaderia, _, _, _, active).

%% Quest: Contando Monedas
quest(contando_monedas, 'Contando Monedas', vocabulary, beginner, active).
quest_assigned_to(contando_monedas, '{{player}}').
quest_language(contando_monedas, spanish).
quest_tag(contando_monedas, generated).
quest_objective(contando_monedas, 0, objective('Learn Spanish numbers 1-20.')).
quest_objective(contando_monedas, 1, objective('Count items at the Mercado Central with Manuel Hernandez Gomez.')).
quest_objective(contando_monedas, 2, objective('Pay for an item using the correct Spanish number and euros.')).
quest_reward(contando_monedas, experience, 120).
quest_reward(contando_monedas, gold, 60).
quest_available(Player, contando_monedas) :-
    quest(contando_monedas, _, _, _, active).

%% Quest: Mi Familia
quest(mi_familia, 'Mi Familia', conversation, beginner, active).
quest_assigned_to(mi_familia, '{{player}}').
quest_language(mi_familia, spanish).
quest_tag(mi_familia, generated).
quest_objective(mi_familia, 0, talk_to('elena_martinez_ruiz', 1)).
quest_objective(mi_familia, 1, objective('Learn family vocabulary: madre, padre, hermano, hermana, hijo, hija, abuelo, abuela.')).
quest_objective(mi_familia, 2, objective('Describe your own family in Spanish to Elena.')).
quest_reward(mi_familia, experience, 100).
quest_reward(mi_familia, gold, 50).
quest_available(Player, mi_familia) :-
    quest(mi_familia, _, _, _, active).

%% =====================================================
%% A2 -- Elementary Quests
%% =====================================================

%% Quest: De Compras en el Mercado
quest(compras_mercado, 'De Compras en el Mercado', exploration, beginner, active).
quest_assigned_to(compras_mercado, '{{player}}').
quest_language(compras_mercado, spanish).
quest_tag(compras_mercado, generated).
quest_objective(compras_mercado, 0, objective('Find the Mercado Central and buy tomatoes (tomates).')).
quest_objective(compras_mercado, 1, objective('Find the Carniceria Ruiz and learn meat vocabulary.')).
quest_objective(compras_mercado, 2, objective('Find the Libreria Cervantes and ask for a recommendation in Spanish.')).
quest_reward(compras_mercado, experience, 150).
quest_reward(compras_mercado, gold, 80).
quest_available(Player, compras_mercado) :-
    quest(compras_mercado, _, _, _, active).

%% Quest: La Hora del Cafe
quest(hora_del_cafe, 'La Hora del Cafe', cultural_knowledge, beginner, active).
quest_assigned_to(hora_del_cafe, '{{player}}').
quest_language(hora_del_cafe, spanish).
quest_tag(hora_del_cafe, generated).
quest_objective(hora_del_cafe, 0, talk_to('carlos_garcia_lopez', 1)).
quest_objective(hora_del_cafe, 1, objective('Learn the customs of Spanish coffee culture: cafe con leche, cortado, solo.')).
quest_objective(hora_del_cafe, 2, objective('Order coffee for yourself and a friend using proper Spanish phrases.')).
quest_reward(hora_del_cafe, experience, 150).
quest_reward(hora_del_cafe, gold, 75).
quest_available(Player, hora_del_cafe) :-
    quest(hora_del_cafe, _, _, _, active).

%% Quest: Pidiendo Direcciones
quest(pidiendo_direcciones, 'Pidiendo Direcciones', grammar, beginner, active).
quest_assigned_to(pidiendo_direcciones, '{{player}}').
quest_language(pidiendo_direcciones, spanish).
quest_tag(pidiendo_direcciones, generated).
quest_objective(pidiendo_direcciones, 0, objective('Learn direction words: derecha, izquierda, recto, cerca, lejos.')).
quest_objective(pidiendo_direcciones, 1, objective('Ask three people for directions in Spanish.')).
quest_objective(pidiendo_direcciones, 2, objective('Navigate to the Catedral Gotica using only Spanish directions.')).
quest_reward(pidiendo_direcciones, experience, 150).
quest_reward(pidiendo_direcciones, gold, 80).
quest_available(Player, pidiendo_direcciones) :-
    quest(pidiendo_direcciones, _, _, _, active).

%% Quest: Tapas y Raciones
quest(tapas_y_raciones, 'Tapas y Raciones', vocabulary, beginner, active).
quest_assigned_to(tapas_y_raciones, '{{player}}').
quest_language(tapas_y_raciones, spanish).
quest_tag(tapas_y_raciones, generated).
quest_objective(tapas_y_raciones, 0, objective('Visit Bar de Tapas El Rinconcillo and order a tapa in Spanish.')).
quest_objective(tapas_y_raciones, 1, objective('Learn 10 tapas names: patatas bravas, tortilla, jamon, aceitunas, croquetas.')).
quest_objective(tapas_y_raciones, 2, objective('Describe your favorite dish in Spanish to Pilar Diaz Torres.')).
quest_reward(tapas_y_raciones, experience, 160).
quest_reward(tapas_y_raciones, gold, 80).
quest_available(Player, tapas_y_raciones) :-
    quest(tapas_y_raciones, _, _, _, active).

%% =====================================================
%% B1 -- Intermediate Quests
%% =====================================================

%% Quest: Visita a la Universidad
quest(visita_universidad, 'Visita a la Universidad', exploration, intermediate, active).
quest_assigned_to(visita_universidad, '{{player}}').
quest_language(visita_universidad, spanish).
quest_tag(visita_universidad, generated).
quest_objective(visita_universidad, 0, talk_to('antonio_rodriguez_fernandez', 1)).
quest_objective(visita_universidad, 1, objective('Tour the university campus and learn academic vocabulary.')).
quest_objective(visita_universidad, 2, objective('Introduce yourself to three students using formal usted.')).
quest_objective(visita_universidad, 3, talk_to('sofia_rodriguez_sanchez', 1)).
quest_reward(visita_universidad, experience, 250).
quest_reward(visita_universidad, gold, 120).
quest_available(Player, visita_universidad) :-
    quest(visita_universidad, _, _, _, active).

%% Quest: Ser y Estar
quest(ser_y_estar, 'Ser y Estar', grammar, intermediate, active).
quest_assigned_to(ser_y_estar, '{{player}}').
quest_language(ser_y_estar, spanish).
quest_tag(ser_y_estar, generated).
quest_objective(ser_y_estar, 0, talk_to('carmen_sanchez_moreno', 1)).
quest_objective(ser_y_estar, 1, objective('Learn when to use ser vs estar with identity, location, and condition.')).
quest_objective(ser_y_estar, 2, objective('Describe five things about the town using the correct verb.')).
quest_objective(ser_y_estar, 3, objective('Explain where you are from (ser) and where you are now (estar).')).
quest_reward(ser_y_estar, experience, 250).
quest_reward(ser_y_estar, gold, 100).
quest_available(Player, ser_y_estar) :-
    quest(ser_y_estar, _, _, _, active).

%% Quest: El Pueblo de los Olivos
quest(pueblo_olivos, 'El Pueblo de los Olivos', conversation, intermediate, active).
quest_assigned_to(pueblo_olivos, '{{player}}').
quest_language(pueblo_olivos, spanish).
quest_tag(pueblo_olivos, generated).
quest_objective(pueblo_olivos, 0, objective('Travel to Aldea de los Olivos.')).
quest_objective(pueblo_olivos, 1, talk_to('francisco_navarro_castillo', 1)).
quest_objective(pueblo_olivos, 2, objective('Help Francisco describe the winemaking process using agricultural vocabulary.')).
quest_objective(pueblo_olivos, 3, objective('Have a conversation about village life with Dolores Ortega Ruiz.')).
quest_reward(pueblo_olivos, experience, 280).
quest_reward(pueblo_olivos, gold, 130).
quest_available(Player, pueblo_olivos) :-
    quest(pueblo_olivos, _, _, _, active).

%% Quest: Regateando en el Mercado
quest(regateando_mercado, 'Regateando en el Mercado', grammar, intermediate, active).
quest_assigned_to(regateando_mercado, '{{player}}').
quest_language(regateando_mercado, spanish).
quest_tag(regateando_mercado, generated).
quest_objective(regateando_mercado, 0, objective('Learn comparative and superlative forms: mas que, menos que, el mas, el menos.')).
quest_objective(regateando_mercado, 1, objective('Compare products at the Mercado Central using Spanish.')).
quest_objective(regateando_mercado, 2, objective('Successfully negotiate a price using polite conditional: me lo podria dejar en...?')).
quest_reward(regateando_mercado, experience, 250).
quest_reward(regateando_mercado, gold, 150).
quest_available(Player, regateando_mercado) :-
    quest(regateando_mercado, _, _, _, active).

%% =====================================================
%% B2 -- Upper Intermediate Quests
%% =====================================================

%% Quest: La Vendimia
quest(la_vendimia, 'La Vendimia', conversation, advanced, active).
quest_assigned_to(la_vendimia, '{{player}}').
quest_language(la_vendimia, spanish).
quest_tag(la_vendimia, generated).
quest_objective(la_vendimia, 0, objective('Visit Francisco Navarro Castillo at the bodega in Aldea de los Olivos.')).
quest_objective(la_vendimia, 1, talk_to('francisco_navarro_castillo', 1)).
quest_objective(la_vendimia, 2, objective('Discuss wine traditions and the harvest season using subjunctive mood.')).
quest_objective(la_vendimia, 3, objective('Write a short paragraph about agriculture in Spanish.')).
quest_reward(la_vendimia, experience, 400).
quest_reward(la_vendimia, gold, 200).
quest_available(Player, la_vendimia) :-
    quest(la_vendimia, _, _, _, active).

%% Quest: El Debate
quest(el_debate, 'El Debate', grammar, advanced, active).
quest_assigned_to(el_debate, '{{player}}').
quest_language(el_debate, spanish).
quest_tag(el_debate, generated).
quest_objective(el_debate, 0, talk_to('antonio_rodriguez_fernandez', 1)).
quest_objective(el_debate, 1, objective('Learn to express opinions: creo que, me parece que, no estoy de acuerdo.')).
quest_objective(el_debate, 2, objective('Participate in a debate at the university on a cultural topic.')).
quest_objective(el_debate, 3, objective('Use subjunctive clauses in your arguments: quiero que, es importante que.')).
quest_reward(el_debate, experience, 450).
quest_reward(el_debate, gold, 200).
quest_available(Player, el_debate) :-
    quest(el_debate, _, _, _, active).

%% Quest: Escribiendo para el Periodico Local
quest(periodico_local, 'Escribiendo para el Periodico Local', cultural_knowledge, advanced, active).
quest_assigned_to(periodico_local, '{{player}}').
quest_language(periodico_local, spanish).
quest_tag(periodico_local, generated).
quest_objective(periodico_local, 0, objective('Interview three residents about local traditions.')).
quest_objective(periodico_local, 1, objective('Take notes using Spanish journalistic style.')).
quest_objective(periodico_local, 2, objective('Write a short article in formal written Spanish.')).
quest_objective(periodico_local, 3, talk_to('carmen_sanchez_moreno', 1)).
quest_reward(periodico_local, experience, 500).
quest_reward(periodico_local, gold, 250).
quest_available(Player, periodico_local) :-
    quest(periodico_local, _, _, _, active).

%% Quest: El Paseo de la Tarde
quest(paseo_tarde, 'El Paseo de la Tarde', exploration, advanced, active).
quest_assigned_to(paseo_tarde, '{{player}}').
quest_language(paseo_tarde, spanish).
quest_tag(paseo_tarde, generated).
quest_objective(paseo_tarde, 0, objective('Walk the Plaza Mayor at sunset and describe the scenery in Spanish.')).
quest_objective(paseo_tarde, 1, objective('Have an extended conversation with a stranger about life in the town.')).
quest_objective(paseo_tarde, 2, objective('Narrate a short story about the cathedral and its history in Spanish.')).
quest_reward(paseo_tarde, experience, 450).
quest_reward(paseo_tarde, gold, 200).
quest_available(Player, paseo_tarde) :-
    quest(paseo_tarde, _, _, _, active).
