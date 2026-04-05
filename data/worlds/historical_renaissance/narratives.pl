%% Insimul Narratives: Renaissance City-States
%% Source: data/worlds/historical_renaissance/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_reward/3

%% The Bonfire of Vanities
narrative(bonfire_of_vanities, 'The Bonfire of Vanities', political_intrigue).
narrative_description(bonfire_of_vanities, 'Fra Girolamo calls for a public burning of luxury goods -- mirrors, playing cards, fine silks, and pagan artworks. The Valori family faces pressure to contribute or resist.').
narrative_trigger(bonfire_of_vanities, relationship(fra_girolamo, antagonism, high)).
narrative_step(bonfire_of_vanities, 0, 'Fra Girolamo preaches a thundering sermon against vanity in the Piazza.').
narrative_step(bonfire_of_vanities, 1, 'Citizens begin carrying their luxuries to the great pyre in the square.').
narrative_step(bonfire_of_vanities, 2, 'Isabella Valori is asked to surrender a prized painting from the palazzo.').
narrative_step(bonfire_of_vanities, 3, 'The player must decide: support the burning, hide the painting, or openly defy the friar.').
narrative_reward(bonfire_of_vanities, experience, 300).
narrative_reward(bonfire_of_vanities, gold, 100).

%% The Lost Shipment
narrative(lost_shipment, 'The Lost Shipment', adventure).
narrative_description(lost_shipment, 'A Contarini trade galley is two weeks overdue from the Levant. Rumors of piracy and storms circulate. Andrea Contarini offers a reward to anyone who can discover its fate.').
narrative_trigger(lost_shipment, event(overdue_ship, porto_sereno)).
narrative_step(lost_shipment, 0, 'Anxiety spreads along the Porto Sereno waterfront as the galley fails to arrive.').
narrative_step(lost_shipment, 1, 'Tommaso Galli agrees to take a small vessel to search the coast.').
narrative_step(lost_shipment, 2, 'The search party discovers the galley beached on a rocky island, its cargo intact.').
narrative_step(lost_shipment, 3, 'The player must organize the salvage and negotiate with local fishermen for assistance.').
narrative_reward(lost_shipment, experience, 250).
narrative_reward(lost_shipment, gold, 200).

%% The Forged Masterpiece
narrative(forged_masterpiece, 'The Forged Masterpiece', mystery).
narrative_description(forged_masterpiece, 'A painting attributed to a famous dead master is offered to Lorenzo Valori. Elena Rinaldi suspects it is a forgery. The truth could embarrass the wealthiest man in Fiorenza.').
narrative_trigger(forged_masterpiece, relationship(elena_rinaldi, trust, high)).
narrative_step(forged_masterpiece, 0, 'A dealer presents a magnificent altarpiece to the Valori household.').
narrative_step(forged_masterpiece, 1, 'Elena notices the pigments are freshly ground and the wood panel is too new.').
narrative_step(forged_masterpiece, 2, 'The player investigates the dealer and traces the painting to a workshop in Oltrarno.').
narrative_step(forged_masterpiece, 3, 'The forger is revealed. The player must decide whether to expose the fraud publicly or handle it discreetly.').
narrative_reward(forged_masterpiece, experience, 280).
narrative_reward(forged_masterpiece, gold, 150).

%% The Plague Returns
narrative(plague_returns, 'The Plague Returns', seasonal_event).
narrative_description(plague_returns, 'Cases of plague appear in the Oltrarno district. The city council debates quarantine. Sofia Moretti offers herbal remedies but faces suspicion from physicians.').
narrative_trigger(plague_returns, timestep(summer)).
narrative_step(plague_returns, 0, 'A wool dyer in Oltrarno collapses with blackened swellings. Panic spreads.').
narrative_step(plague_returns, 1, 'The city council orders the Oltrarno bridge closed. Families are trapped.').
narrative_step(plague_returns, 2, 'Sofia Moretti distributes herbal preparations. Dottore Orsini questions their efficacy.').
narrative_step(plague_returns, 3, 'The player must help organize care for the sick and convince the council to act.').
narrative_reward(plague_returns, experience, 250).
narrative_reward(plague_returns, gold, 80).

%% The Council Election
narrative(council_election, 'The Council Election', political_intrigue).
narrative_description(council_election, 'A seat on the Signoria is open. Lorenzo Valori and Andrea Contarini each back a candidate. Bribery, alliances, and public speeches determine the outcome.').
narrative_trigger(council_election, event(election, fiorenza)).
narrative_step(council_election, 0, 'The election is announced. Both factions begin courting voters in the piazza.').
narrative_step(council_election, 1, 'Cosimo Valori asks the player to deliver a purse of florins to a wavering guild master.').
narrative_step(council_election, 2, 'Nicolao Contarini counters with a promise of reduced harbor taxes for his supporters.').
narrative_step(council_election, 3, 'The player must choose which faction to support or attempt to broker a compromise.').
narrative_reward(council_election, experience, 300).
narrative_reward(council_election, gold, 180).

%% The Hidden Library
narrative(hidden_library, 'The Hidden Library', mystery).
narrative_description(hidden_library, 'Suor Chiara discovers a walled-up room in the monastery containing manuscripts thought lost since antiquity. The Church may want them suppressed; scholars want them published.').
narrative_trigger(hidden_library, relationship(suor_chiara, trust, high)).
narrative_step(hidden_library, 0, 'Workers repairing a wall in the monastery uncover a sealed chamber.').
narrative_step(hidden_library, 1, 'Inside are scrolls in Greek and Arabic -- philosophical and scientific works.').
narrative_step(hidden_library, 2, 'Dottore Orsini is ecstatic. Fra Girolamo warns that some texts may be heretical.').
narrative_step(hidden_library, 3, 'The player must decide how to handle the discovery: publish, conceal, or hand them to the Church.').
narrative_reward(hidden_library, experience, 350).
narrative_reward(hidden_library, gold, 150).
