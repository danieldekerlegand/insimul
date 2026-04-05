%% Insimul Actions: Creole Colonial
%% Source: data/worlds/creole_colonial/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema:
%%   action/4 -- action(Id, Name, Category, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, can_perform/3

%% --- Social Actions ---

%% attend_ball
%% Attend a Creole social ball or soiree
action(attend_ball, 'attend_ball', social, 3).
action_difficulty(attend_ball, 0.3).
action_duration(attend_ball, 4).
action_category(attend_ball, social).
action_verb(attend_ball, past, 'attended a ball with').
action_verb(attend_ball, present, 'attends a ball with').
can_perform(Actor, attend_ball, Target) :-
    attribute(Actor, propriety, P), P > 50,
    near(Actor, Target, 10).

%% challenge_to_duel
%% Issue a formal challenge of honor
action(challenge_to_duel, 'challenge_to_duel', social, 5).
action_difficulty(challenge_to_duel, 0.7).
action_duration(challenge_to_duel, 2).
action_category(challenge_to_duel, social).
action_verb(challenge_to_duel, past, 'challenged to a duel').
action_verb(challenge_to_duel, present, 'challenges to a duel').
can_perform(Actor, challenge_to_duel, Target) :-
    trait(Actor, proud),
    relationship(Actor, Target, rival).

%% gossip_at_market
%% Exchange rumors and news at the colonial market
action(gossip_at_market, 'gossip_at_market', social, 1).
action_difficulty(gossip_at_market, 0.1).
action_duration(gossip_at_market, 2).
action_category(gossip_at_market, social).
action_verb(gossip_at_market, past, 'gossiped at the market with').
action_verb(gossip_at_market, present, 'gossips at the market with').
can_perform(Actor, gossip_at_market, Target) :-
    near(Actor, Target, 8).

%% --- Spiritual Actions ---

%% perform_voodoo_ceremony
%% Lead a voodoo ceremony invoking the loa spirits
action(perform_voodoo_ceremony, 'perform_voodoo_ceremony', spiritual, 6).
action_difficulty(perform_voodoo_ceremony, 0.8).
action_duration(perform_voodoo_ceremony, 5).
action_category(perform_voodoo_ceremony, spiritual).
action_verb(perform_voodoo_ceremony, past, 'performed a voodoo ceremony for').
action_verb(perform_voodoo_ceremony, present, 'performs a voodoo ceremony for').
can_perform(Actor, perform_voodoo_ceremony, _Target) :-
    attribute(Actor, spiritual_power, Sp), Sp > 70.

%% craft_gris_gris
%% Create a protective gris-gris charm
action(craft_gris_gris, 'craft_gris_gris', spiritual, 3).
action_difficulty(craft_gris_gris, 0.5).
action_duration(craft_gris_gris, 2).
action_category(craft_gris_gris, spiritual).
action_verb(craft_gris_gris, past, 'crafted a gris-gris for').
action_verb(craft_gris_gris, present, 'crafts a gris-gris for').
can_perform(Actor, craft_gris_gris, _Target) :-
    attribute(Actor, healing, H), H > 50.

%% administer_traiteur_healing
%% Heal with prayer and herbs in the traiteur tradition
action(administer_traiteur_healing, 'administer_traiteur_healing', spiritual, 4).
action_difficulty(administer_traiteur_healing, 0.6).
action_duration(administer_traiteur_healing, 3).
action_category(administer_traiteur_healing, spiritual).
action_verb(administer_traiteur_healing, past, 'administered traiteur healing to').
action_verb(administer_traiteur_healing, present, 'administers traiteur healing to').
can_perform(Actor, administer_traiteur_healing, _Target) :-
    attribute(Actor, healing, H), H > 60,
    attribute(Actor, cultural_knowledge, Ck), Ck > 50.

%% --- Bayou Survival Actions ---

%% navigate_bayou
%% Guide someone through the treacherous bayou waterways
action(navigate_bayou, 'navigate_bayou', survival, 4).
action_difficulty(navigate_bayou, 0.6).
action_duration(navigate_bayou, 6).
action_category(navigate_bayou, survival).
action_verb(navigate_bayou, past, 'guided through the bayou').
action_verb(navigate_bayou, present, 'guides through the bayou').
can_perform(Actor, navigate_bayou, _Target) :-
    attribute(Actor, survival, S), S > 60.

%% trap_in_swamp
%% Set traps for fur-bearing animals in the swamp
action(trap_in_swamp, 'trap_in_swamp', survival, 3).
action_difficulty(trap_in_swamp, 0.4).
action_duration(trap_in_swamp, 4).
action_category(trap_in_swamp, survival).
action_verb(trap_in_swamp, past, 'trapped in the swamp alongside').
action_verb(trap_in_swamp, present, 'traps in the swamp alongside').
can_perform(Actor, trap_in_swamp, _Target) :-
    attribute(Actor, survival, S), S > 50.

%% gather_bayou_herbs
%% Collect medicinal herbs and roots from the bayou
action(gather_bayou_herbs, 'gather_bayou_herbs', gathering, 2).
action_difficulty(gather_bayou_herbs, 0.3).
action_duration(gather_bayou_herbs, 3).
action_category(gather_bayou_herbs, gathering).
action_verb(gather_bayou_herbs, past, 'gathered bayou herbs with').
action_verb(gather_bayou_herbs, present, 'gathers bayou herbs with').
can_perform(Actor, gather_bayou_herbs, _Target) :-
    attribute(Actor, cultural_knowledge, Ck), Ck > 40.

%% --- Commerce Actions ---

%% smuggle_goods
%% Move contraband through bayou channels to avoid tariffs
action(smuggle_goods, 'smuggle_goods', commerce, 5).
action_difficulty(smuggle_goods, 0.7).
action_duration(smuggle_goods, 8).
action_category(smuggle_goods, commerce).
action_verb(smuggle_goods, past, 'smuggled goods with').
action_verb(smuggle_goods, present, 'smuggles goods with').
can_perform(Actor, smuggle_goods, Target) :-
    trait(Actor, daring),
    relationship(Actor, Target, business_partner).

%% trade_at_market
%% Buy or sell goods at the colonial market
action(trade_at_market, 'trade_at_market', commerce, 2).
action_difficulty(trade_at_market, 0.2).
action_duration(trade_at_market, 3).
action_category(trade_at_market, commerce).
action_verb(trade_at_market, past, 'traded at the market with').
action_verb(trade_at_market, present, 'trades at the market with').
can_perform(Actor, trade_at_market, Target) :-
    attribute(Actor, wealth, W), W > 20,
    near(Actor, Target, 10).

%% --- Cultural Actions ---

%% tell_folktale
%% Share oral tradition stories around a fire or gathering
action(tell_folktale, 'tell_folktale', cultural, 2).
action_difficulty(tell_folktale, 0.3).
action_duration(tell_folktale, 3).
action_category(tell_folktale, cultural).
action_verb(tell_folktale, past, 'told a folktale to').
action_verb(tell_folktale, present, 'tells a folktale to').
can_perform(Actor, tell_folktale, _Target) :-
    attribute(Actor, cultural_knowledge, Ck), Ck > 60.
