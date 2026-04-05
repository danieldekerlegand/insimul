%% Insimul Narratives: Kingdom of Camelot
%% Source: data/worlds/kingdom_of_camelot/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3 -- narrative_step(NarrativeAtom, StepIndex, StepContent)
%%   narrative_tag/2

%% The Fall of a Knight
narrative(fall_of_a_knight, 'The Fall of a Knight', tragedy).
narrative_description(fall_of_a_knight, 'A once-noble knight breaks the chivalric code and must face the consequences of dishonor before the Round Table.').
narrative_trigger(fall_of_a_knight, status(X, oathbreaker)).
narrative_step(fall_of_a_knight, 0, 'Word reaches the court that a knight has broken a sworn oath.').
narrative_step(fall_of_a_knight, 1, 'King Arthur convenes the Round Table to hear testimony.').
narrative_step(fall_of_a_knight, 2, 'The accused knight may speak in their own defense.').
narrative_step(fall_of_a_knight, 3, 'The court renders judgment: exile, redemption quest, or forgiveness.').
narrative_tag(fall_of_a_knight, honor).
narrative_tag(fall_of_a_knight, chivalry).

%% The Tournament of Champions
narrative(tournament_of_champions, 'The Tournament of Champions', event).
narrative_description(tournament_of_champions, 'A grand tournament draws knights from across the kingdom to compete for glory and the favor of the queen.').
narrative_trigger(tournament_of_champions, event(tournament_announced)).
narrative_step(tournament_of_champions, 0, 'Heralds announce the tournament across Camelot and Sherwood.').
narrative_step(tournament_of_champions, 1, 'Knights register at the Jousting Fields and prepare their steeds.').
narrative_step(tournament_of_champions, 2, 'Three rounds of jousting determine the finalists.').
narrative_step(tournament_of_champions, 3, 'The champion receives the tournament crown from Queen Guinevere at the Great Hall.').
narrative_tag(tournament_of_champions, tournament).
narrative_tag(tournament_of_champions, combat).

%% Whispers of Treachery
narrative(whispers_of_treachery, 'Whispers of Treachery', intrigue).
narrative_description(whispers_of_treachery, 'Rumors of a plot against King Arthur surface in the tavern, and trust among the knights begins to fracture.').
narrative_trigger(whispers_of_treachery, network(_, king_arthur, antagonism, V), V > 5).
narrative_step(whispers_of_treachery, 0, 'A traveling merchant whispers of a conspiracy at the Crossed Swords Tavern.').
narrative_step(whispers_of_treachery, 1, 'Lancelot investigates but finds conflicting accounts.').
narrative_step(whispers_of_treachery, 2, 'Suspicion falls on one or more members of the court.').
narrative_step(whispers_of_treachery, 3, 'The player must choose whom to trust and expose the real threat.').
narrative_tag(whispers_of_treachery, intrigue).
narrative_tag(whispers_of_treachery, politics).

%% The Enchanted Forest Awakens
narrative(enchanted_forest_awakens, 'The Enchanted Forest Awakens', supernatural).
narrative_description(enchanted_forest_awakens, 'Strange lights and sounds emerge from the Dark Forest. Merlin senses a disturbance in the ancient wards.').
narrative_trigger(enchanted_forest_awakens, event(dark_magic_detected)).
narrative_step(enchanted_forest_awakens, 0, 'Villagers from Sherwood report eerie glowing in the Dark Forest at night.').
narrative_step(enchanted_forest_awakens, 1, 'Merlin identifies a weakening of the protective wards at the Standing Stones.').
narrative_step(enchanted_forest_awakens, 2, 'A party must venture into the forest to find and seal the breach.').
narrative_step(enchanted_forest_awakens, 3, 'The source of the disturbance is revealed: an ancient power awakening.').
narrative_tag(enchanted_forest_awakens, magic).
narrative_tag(enchanted_forest_awakens, danger).

%% Robin and the Crown
narrative(robin_and_the_crown, 'Robin and the Crown', moral_dilemma).
narrative_description(robin_and_the_crown, 'Robin Hood offers an alliance against a common enemy, but accepting means defying the law of Camelot.').
narrative_trigger(robin_and_the_crown, relationship(outlaw_robin, king_arthur, temporary_ally)).
narrative_step(robin_and_the_crown, 0, 'Robin Hood sends a messenger requesting a secret meeting.').
narrative_step(robin_and_the_crown, 1, 'Robin reveals that a foreign raiding party threatens both Sherwood and Camelot.').
narrative_step(robin_and_the_crown, 2, 'The player must decide whether to ally with an outlaw for the greater good.').
narrative_step(robin_and_the_crown, 3, 'The outcome shapes the future relationship between the crown and Sherwood.').
narrative_tag(robin_and_the_crown, moral_choice).
narrative_tag(robin_and_the_crown, alliance).

%% The Grail Vision
narrative(grail_vision, 'The Grail Vision', prophecy).
narrative_description(grail_vision, 'A vision of the Holy Grail appears at the Scrying Pool, setting the greatest quest of Camelot into motion.').
narrative_trigger(grail_vision, event(grail_sighting)).
narrative_step(grail_vision, 0, 'During a feast at the Great Hall, a blinding light fills the chamber.').
narrative_step(grail_vision, 1, 'A veiled figure bearing the Grail passes through the hall and vanishes.').
narrative_step(grail_vision, 2, 'Every knight present swears to seek the Holy Grail.').
narrative_step(grail_vision, 3, 'The quest begins, and many knights depart Camelot on separate paths.').
narrative_tag(grail_vision, grail).
narrative_tag(grail_vision, prophecy).
