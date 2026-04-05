%% Insimul Narratives: Historical Medieval Europe
%% Source: data/worlds/historical_medieval/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_reward/3

%% The Harvest Reckoning
narrative(harvest_reckoning, 'The Harvest Reckoning', seasonal_event).
narrative_description(harvest_reckoning, 'The autumn harvest is gathered and the lord demands his share. A dispute arises between the manor reeve and the village miller over the grain count.').
narrative_trigger(harvest_reckoning, timestep(autumn)).
narrative_step(harvest_reckoning, 0, 'The reeve announces that the harvest tally is short of expectations.').
narrative_step(harvest_reckoning, 1, 'Edric the Miller insists his measurements are honest and true.').
narrative_step(harvest_reckoning, 2, 'Lord Godfrey orders a recount in the presence of the steward.').
narrative_step(harvest_reckoning, 3, 'The player must examine the grain stores and determine who is telling the truth.').
narrative_reward(harvest_reckoning, experience, 200).
narrative_reward(harvest_reckoning, gold, 100).

%% The Wandering Friar
narrative(wandering_friar, 'The Wandering Friar', mystery).
narrative_description(wandering_friar, 'A traveling friar arrives at Ashworth Keep bearing a sealed letter from the Archbishop. His true purpose is unknown, and suspicion grows among the monks.').
narrative_trigger(wandering_friar, event(stranger_arrival, ashworth_keep)).
narrative_step(wandering_friar, 0, 'A dusty friar arrives at the town gate, claiming urgent business with the abbot.').
narrative_step(wandering_friar, 1, 'Brother Anselm is uneasy. The friar asks too many questions about the abbey treasury.').
narrative_step(wandering_friar, 2, 'The player discovers the friar is investigating reports of hidden relics.').
narrative_step(wandering_friar, 3, 'The player must decide whether to help the friar or warn the abbot of his inquiry.').
narrative_reward(wandering_friar, experience, 250).
narrative_reward(wandering_friar, gold, 120).

%% The Tournament of Ashworth
narrative(tournament_of_ashworth, 'The Tournament of Ashworth', competition).
narrative_description(tournament_of_ashworth, 'Lord Godfrey declares a grand tournament to celebrate the feast of St. Michael. Knights from neighboring fiefs arrive to compete for honor and a purse of silver.').
narrative_trigger(tournament_of_ashworth, timestep(michaelmas)).
narrative_step(tournament_of_ashworth, 0, 'Heralds announce the tournament throughout the duchy. Pavilions are erected on the field.').
narrative_step(tournament_of_ashworth, 1, 'Roland de Ashworth enters the lists, eager to prove himself before his father.').
narrative_step(tournament_of_ashworth, 2, 'A mysterious knight with no heraldry defeats three opponents in succession.').
narrative_step(tournament_of_ashworth, 3, 'The player must unmask the mystery knight or face them in the final joust.').
narrative_reward(tournament_of_ashworth, experience, 300).
narrative_reward(tournament_of_ashworth, gold, 200).

%% The Wool Merchants Dilemma
narrative(wool_merchants_dilemma, 'The Wool Merchants Dilemma', political_intrigue).
narrative_description(wool_merchants_dilemma, 'Hugh Aldric has cornered the local wool market, but a Flemish buyer offers twice the price if the wool is smuggled past the tax collectors. Temptation and risk collide.').
narrative_trigger(wool_merchants_dilemma, relationship(hugh_aldric, cunningness, high)).
narrative_step(wool_merchants_dilemma, 0, 'A Flemish agent approaches Hugh at the market with a whispered proposition.').
narrative_step(wool_merchants_dilemma, 1, 'Hugh asks the player to help transport wool bales to a hidden meeting point.').
narrative_step(wool_merchants_dilemma, 2, 'The tax collector grows suspicious and begins questioning merchants.').
narrative_step(wool_merchants_dilemma, 3, 'The player must choose: help Hugh and share the profit, or report the scheme to Lord Godfrey.').
narrative_reward(wool_merchants_dilemma, experience, 250).
narrative_reward(wool_merchants_dilemma, gold, 180).

%% The Lepers at the Gate
narrative(lepers_at_the_gate, 'The Lepers at the Gate', moral_dilemma).
narrative_description(lepers_at_the_gate, 'A group of lepers arrives at the town walls seeking shelter and food. The townspeople are afraid, but Brother Dunstan insists on Christian charity.').
narrative_trigger(lepers_at_the_gate, event(leper_arrival, ashworth_keep)).
narrative_step(lepers_at_the_gate, 0, 'Cries are heard from beyond the town gate. A band of lepers begs for entry.').
narrative_step(lepers_at_the_gate, 1, 'The guards refuse to open the gate. Townspeople gather in fear.').
narrative_step(lepers_at_the_gate, 2, 'Brother Dunstan pleads for mercy and offers to tend them outside the walls.').
narrative_step(lepers_at_the_gate, 3, 'The player must convince Lord Godfrey to allow aid, or help Dunstan tend them in secret.').
narrative_reward(lepers_at_the_gate, experience, 200).
narrative_reward(lepers_at_the_gate, gold, 80).

%% The Missing Manuscript
narrative(missing_manuscript, 'The Missing Manuscript', mystery).
narrative_description(missing_manuscript, 'A rare manuscript of Aristotle has vanished from the abbey library. Brother Caedmon suspects theft. The trail leads from the scriptorium to the market and beyond.').
narrative_trigger(missing_manuscript, relationship(brother_caedmon, trust, low)).
narrative_step(missing_manuscript, 0, 'Brother Caedmon discovers the locked cabinet in the scriptorium has been forced open.').
narrative_step(missing_manuscript, 1, 'He finds ink stains on a wool bale in the market -- the manuscript was hidden inside.').
narrative_step(missing_manuscript, 2, 'Suspicion falls on a passing scholar who lodged at the abbey last week.').
narrative_step(missing_manuscript, 3, 'The player must track the manuscript before it leaves the duchy forever.').
narrative_reward(missing_manuscript, experience, 280).
narrative_reward(missing_manuscript, gold, 150).
