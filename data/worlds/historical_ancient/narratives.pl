%% Insimul Narratives: Historical Ancient World
%% Source: data/worlds/historical_ancient/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_reward/3

%% The Olive Harvest Festival
narrative(olive_harvest_festival, 'The Olive Harvest Festival', seasonal_event).
narrative_description(olive_harvest_festival, 'The annual olive harvest brings Athenians together in celebration. A procession to the temple of Athena opens the festival, followed by feasting and contests.').
narrative_trigger(olive_harvest_festival, timestep(autumn)).
narrative_step(olive_harvest_festival, 0, 'A herald announces the beginning of the olive harvest in the Agora.').
narrative_step(olive_harvest_festival, 1, 'Citizens gather olives from the sacred groves outside the city walls.').
narrative_step(olive_harvest_festival, 2, 'Oil is pressed and the first amphora is offered at the temple of Athena.').
narrative_step(olive_harvest_festival, 3, 'A great feast is held in the Agora with music, dancing, and athletic contests.').
narrative_reward(olive_harvest_festival, experience, 150).
narrative_reward(olive_harvest_festival, gold, 75).

%% The Senators Conspiracy
narrative(senators_conspiracy, 'The Senators Conspiracy', political_intrigue).
narrative_description(senators_conspiracy, 'Rumors spread through the Forum that a faction of senators plans to block a popular grain distribution. The player must navigate shifting alliances.').
narrative_trigger(senators_conspiracy, relationship(lucius_aurelius, trust, low)).
narrative_step(senators_conspiracy, 0, 'A freedman whispers that Senator Aurelius faces opposition in the Curia.').
narrative_step(senators_conspiracy, 1, 'The player is asked to carry a sealed letter to a sympathetic magistrate.').
narrative_step(senators_conspiracy, 2, 'At the Forum, two factions argue openly. The crowd grows restless.').
narrative_step(senators_conspiracy, 3, 'A vote is called. The player must choose which faction to support.').
narrative_reward(senators_conspiracy, experience, 250).
narrative_reward(senators_conspiracy, gold, 150).

%% The Tomb Painters Secret
narrative(tomb_painters_secret, 'The Tomb Painters Secret', mystery).
narrative_description(tomb_painters_secret, 'Paneb the artisan discovers a hidden chamber in a noble tomb. Inside are paintings that tell a story contradicting official temple records.').
narrative_trigger(tomb_painters_secret, relationship(paneb, trust, high)).
narrative_step(tomb_painters_secret, 0, 'Paneb shows the player an unusual painted chamber deep within a rock-cut tomb.').
narrative_step(tomb_painters_secret, 1, 'The paintings depict a forgotten pharaoh whose name was erased from monuments.').
narrative_step(tomb_painters_secret, 2, 'Khaemwaset warns that revealing such knowledge could anger the priests.').
narrative_step(tomb_painters_secret, 3, 'The player must decide: seal the chamber or copy the inscriptions for posterity.').
narrative_reward(tomb_painters_secret, experience, 300).
narrative_reward(tomb_painters_secret, gold, 100).

%% The Merchants Shipwreck
narrative(merchants_shipwreck, 'The Merchants Shipwreck', adventure).
narrative_description(merchants_shipwreck, 'A storm drives one of Demades cargo ships onto the rocks near Piraeus. Valuable pottery and grain must be salvaged before rival merchants claim the wreckage.').
narrative_trigger(merchants_shipwreck, event(storm, piraeus_district)).
narrative_step(merchants_shipwreck, 0, 'News arrives that a merchant vessel has broken apart on the coast.').
narrative_step(merchants_shipwreck, 1, 'Demades asks for help organizing a salvage crew at the harbor.').
narrative_step(merchants_shipwreck, 2, 'Rival salvagers arrive and a tense negotiation begins on the beach.').
narrative_step(merchants_shipwreck, 3, 'The cargo is recovered and Demades rewards those who helped.').
narrative_reward(merchants_shipwreck, experience, 200).
narrative_reward(merchants_shipwreck, gold, 200).

%% The Gladiators Rebellion
narrative(gladiators_rebellion, 'The Gladiators Rebellion', conflict).
narrative_description(gladiators_rebellion, 'Spartacus Thrax and several gladiators refuse to fight in an unjust match. The lanista threatens punishment. The player must mediate or take sides.').
narrative_trigger(gladiators_rebellion, relationship(spartacus_thrax, antagonism, high)).
narrative_step(gladiators_rebellion, 0, 'Shouts erupt from the gladiator barracks in the Subura district.').
narrative_step(gladiators_rebellion, 1, 'Spartacus declares that the upcoming match is rigged and refuses to enter the arena.').
narrative_step(gladiators_rebellion, 2, 'The lanista demands order. Guards are called to the compound.').
narrative_step(gladiators_rebellion, 3, 'The player must convince Spartacus to stand down, or help him press his case before the aedile.').
narrative_reward(gladiators_rebellion, experience, 250).
narrative_reward(gladiators_rebellion, gold, 120).

%% The Philosophers Trial
narrative(philosophers_trial, 'The Philosophers Trial', political_intrigue).
narrative_description(philosophers_trial, 'Aspasia is accused of impiety by a political rival. A trial at the Heliaia court is set. The player must gather witnesses and evidence to aid her defense.').
narrative_trigger(philosophers_trial, relationship(aspasia, antagonism, high)).
narrative_step(philosophers_trial, 0, 'A formal accusation of impiety is filed against Aspasia at the Agora.').
narrative_step(philosophers_trial, 1, 'The player seeks character witnesses among Athenian citizens.').
narrative_step(philosophers_trial, 2, 'At the Heliaia, the prosecutor makes his case before 501 jurors.').
narrative_step(philosophers_trial, 3, 'Aspasia delivers her defense. The jury votes with clay ballots.').
narrative_reward(philosophers_trial, experience, 300).
narrative_reward(philosophers_trial, gold, 150).
