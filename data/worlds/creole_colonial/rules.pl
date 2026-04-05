%% Insimul Volition Rules: Creole Colonial
%% Source: data/worlds/creole_colonial/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema:
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_applies/3, rule_effect/2

%% --- Plantation Society Rules ---

%% Plantation owners seek to maintain dominance over those of lower social standing
rule_likelihood(plantation_owner_dominance, 3).
rule_type(plantation_owner_dominance, volition).
rule_active(plantation_owner_dominance).
rule_category(plantation_owner_dominance, social_hierarchy).
rule_applies(plantation_owner_dominance, X, Y) :-
    attribute(X, wealth, Wx), Wx > 80,
    attribute(Y, wealth, Wy), Wy < 50.
rule_effect(plantation_owner_dominance, set_intent(X, dominate, Y, 4)).

%% Free people of color build solidarity with one another against discrimination
rule_likelihood(gens_libres_solidarity, 2).
rule_type(gens_libres_solidarity, volition).
rule_active(gens_libres_solidarity).
rule_category(gens_libres_solidarity, community_bonds).
rule_applies(gens_libres_solidarity, X, Y) :-
    trait(X, dignified), trait(Y, resilient),
    attribute(X, wealth, Wx), Wx < 70,
    attribute(Y, wealth, Wy), Wy < 70.
rule_effect(gens_libres_solidarity, set_intent(X, befriend, Y, 3)).

%% --- Voodoo and Spiritual Rules ---

%% Spiritual practitioners are drawn to aid those in suffering
rule_likelihood(voodoo_healer_compassion, 2).
rule_type(voodoo_healer_compassion, volition).
rule_active(voodoo_healer_compassion).
rule_category(voodoo_healer_compassion, spiritual_duty).
rule_applies(voodoo_healer_compassion, X, _Y) :-
    attribute(X, spiritual_power, Sp), Sp > 70,
    attribute(X, healing, H), H > 60.
rule_effect(voodoo_healer_compassion, set_intent(X, heal, Y, 4)).

%% The devout clergy grow suspicious of those practicing voodoo
rule_likelihood(clergy_suspicion_of_voodoo, 2).
rule_type(clergy_suspicion_of_voodoo, volition).
rule_active(clergy_suspicion_of_voodoo).
rule_category(clergy_suspicion_of_voodoo, religious_conflict).
rule_applies(clergy_suspicion_of_voodoo, X, Y) :-
    trait(X, devout), trait(X, scholarly),
    attribute(Y, spiritual_power, Sp), Sp > 70.
rule_effect(clergy_suspicion_of_voodoo, set_intent(X, investigate, Y, 3)).

%% --- Bayou Life Rules ---

%% Bayou dwellers distrust outsiders from the city
rule_likelihood(bayou_distrust_outsiders, 2).
rule_type(bayou_distrust_outsiders, volition).
rule_active(bayou_distrust_outsiders).
rule_category(bayou_distrust_outsiders, territorial).
rule_applies(bayou_distrust_outsiders, X, Y) :-
    attribute(X, survival, S), S > 70,
    trait(X, independent),
    attribute(Y, propriety, P), P > 70.
rule_effect(bayou_distrust_outsiders, set_intent(X, avoid, Y, 2)).

%% Superstitious folk seek protection from spiritual practitioners
rule_likelihood(seek_spiritual_protection, 3).
rule_type(seek_spiritual_protection, volition).
rule_active(seek_spiritual_protection).
rule_category(seek_spiritual_protection, spiritual_need).
rule_applies(seek_spiritual_protection, X, Y) :-
    trait(X, superstitious),
    attribute(Y, spiritual_power, Sp), Sp > 60.
rule_effect(seek_spiritual_protection, set_intent(X, request_aid, Y, 4)).

%% --- Social Maneuvering Rules ---

%% Ambitious young women seek advantageous social connections
rule_likelihood(social_climbing_ambition, 2).
rule_type(social_climbing_ambition, volition).
rule_active(social_climbing_ambition).
rule_category(social_climbing_ambition, social_advancement).
rule_applies(social_climbing_ambition, X, Y) :-
    trait(X, ambitious), trait(X, young_adult),
    attribute(Y, wealth, W), W > 70,
    attribute(Y, propriety, P), P > 60.
rule_effect(social_climbing_ambition, set_intent(X, impress, Y, 3)).

%% Rivals compete for social standing through displays of wealth
rule_likelihood(rival_social_display, 2).
rule_type(rival_social_display, volition).
rule_active(rival_social_display).
rule_category(rival_social_display, social_competition).
rule_applies(rival_social_display, X, Y) :-
    relationship(X, Y, rival),
    attribute(X, wealth, Wx), Wx > 60,
    attribute(Y, wealth, Wy), Wy > 60.
rule_effect(rival_social_display, set_intent(X, outshine, Y, 4)).

%% --- Commerce and Smuggling Rules ---

%% Merchants are drawn to profitable but illicit trade partnerships
rule_likelihood(smuggling_temptation, 2).
rule_type(smuggling_temptation, volition).
rule_active(smuggling_temptation).
rule_category(smuggling_temptation, commerce).
rule_applies(smuggling_temptation, X, Y) :-
    trait(X, shrewd),
    trait(Y, daring),
    attribute(Y, combat, C), C > 70.
rule_effect(smuggling_temptation, set_intent(X, negotiate, Y, 3)).

%% Adventurous youth admire daring figures and seek their approval
rule_likelihood(youth_admires_daring, 1).
rule_type(youth_admires_daring, volition).
rule_active(youth_admires_daring).
rule_category(youth_admires_daring, mentorship).
rule_applies(youth_admires_daring, X, Y) :-
    trait(X, adventurous), trait(X, young_adult),
    trait(Y, daring),
    attribute(Y, charisma, C), C > 70.
rule_effect(youth_admires_daring, set_intent(X, seek_mentorship, Y, 3)).

%% --- Honor and Tradition Rules ---

%% Those whose family honor is challenged seek to restore it through confrontation
rule_likelihood(honor_duel_challenge, 1).
rule_type(honor_duel_challenge, volition).
rule_active(honor_duel_challenge).
rule_category(honor_duel_challenge, honor_code).
rule_applies(honor_duel_challenge, X, Y) :-
    trait(X, proud),
    relationship(X, Y, rival),
    attribute(X, propriety, P), P > 60.
rule_effect(honor_duel_challenge, set_intent(X, challenge, Y, 5)).

%% Elders feel compelled to pass on cultural knowledge to the young
rule_likelihood(elder_tradition_passing, 2).
rule_type(elder_tradition_passing, volition).
rule_active(elder_tradition_passing).
rule_category(elder_tradition_passing, cultural_preservation).
rule_applies(elder_tradition_passing, X, Y) :-
    trait(X, elder),
    attribute(X, cultural_knowledge, Ck), Ck > 80,
    trait(Y, young_adult).
rule_effect(elder_tradition_passing, set_intent(X, teach, Y, 3)).
