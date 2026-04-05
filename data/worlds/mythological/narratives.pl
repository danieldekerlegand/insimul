%% Insimul Narratives: Greek Mythological World
%% Source: data/worlds/mythological/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_precondition/2, narrative_outcome/3

%% The Wrath of the Gods
narrative(wrath_of_gods, 'The Wrath of the Gods', divine).
narrative_description(wrath_of_gods, 'A mortal act of hubris angers the Olympians. Plagues and monsters descend upon Theopolis. Only sacrifice and humility can restore divine favor.').
narrative_trigger(wrath_of_gods, (status(theopolis, sacrilege_committed))).
narrative_precondition(wrath_of_gods, (alive(hierophantes_apollonides), alive(theseus_aegides))).
narrative_outcome(wrath_of_gods, appeased, 'Great sacrifices are made. The gods relent and restore their blessings. The offender is punished.').
narrative_outcome(wrath_of_gods, defied, 'Heroes defy the gods openly. A new age of mortal independence begins, but divine gifts are withdrawn.').
narrative_outcome(wrath_of_gods, catastrophe, 'The gods unleash a monster upon Theopolis. Only a legendary hero can save the city.').

%% The Prophecy Unfolds
narrative(prophecy_unfolds, 'The Prophecy Unfolds', prophecy).
narrative_description(prophecy_unfolds, 'The Pythia delivers a prophecy of a great war between rival city-states. Heroes must choose sides or seek to prevent the conflict entirely.').
narrative_trigger(prophecy_unfolds, (event(pythia_mantike, prophecy_delivered))).
narrative_precondition(prophecy_unfolds, (alive(pythia_mantike), alive(achilleos_myrmidon))).
narrative_outcome(prophecy_unfolds, war, 'War erupts. Achilleos wins great kleos but the cost in lives is staggering.').
narrative_outcome(prophecy_unfolds, averted, 'Diplomatic heroes negotiate peace. The prophecy is fulfilled through a symbolic contest rather than war.').
narrative_outcome(prophecy_unfolds, twisted, 'The prophecy is misread. The true war is not between cities but between gods themselves, with mortals caught between.').

%% The Labyrinth Stirs
narrative(labyrinth_stirs, 'The Labyrinth Stirs', monster).
narrative_description(labyrinth_stirs, 'Something ancient wakes in the depths of the labyrinth beneath Theopolis. Tremors shake the agora. Daidalos realizes his creation has grown beyond his control.').
narrative_trigger(labyrinth_stirs, (status(theopolis, tremors))).
narrative_precondition(labyrinth_stirs, (alive(daidalos_technites), alive(theseus_aegides))).
narrative_outcome(labyrinth_stirs, slain, 'Theseus descends with the Thread of Ariadne and slays the beast. He emerges a legend.').
narrative_outcome(labyrinth_stirs, sealed, 'Daidalos devises a way to collapse the deepest passages, trapping the creature forever.').
narrative_outcome(labyrinth_stirs, escaped, 'The creature breaks free into the city. Theopolis becomes a battleground between mortals and an ancient horror.').

%% The Fall of Ikaros
narrative(fall_of_ikaros, 'The Fall of Ikaros', tragedy).
narrative_description(fall_of_ikaros, 'Ikaros tests the wings his father built despite warnings. His reckless nature drives him higher and higher toward the sun.').
narrative_trigger(fall_of_ikaros, (trait(ikaros_technites, reckless), status(ikaros_technites, flying))).
narrative_precondition(fall_of_ikaros, (alive(ikaros_technites), alive(daidalos_technites))).
narrative_outcome(fall_of_ikaros, saved, 'A hero catches Ikaros before he falls. Daidalos vows never to build wings again. Ikaros learns humility.').
narrative_outcome(fall_of_ikaros, fallen, 'Ikaros falls into the sea. Daidalos is consumed by grief. An island is named in the boy memory.').
narrative_outcome(fall_of_ikaros, transcended, 'The gods take pity and transform Ikaros into a constellation, immortalizing his ambition in the stars.').

%% The Lifting of the Curse
narrative(lifting_curse, 'The Lifting of the Pelopides Curse', divine).
narrative_description(lifting_curse, 'Tantalos and Niobe seek to break the generational curse upon their family. The path to atonement requires great sacrifice and divine mercy.').
narrative_trigger(lifting_curse, (status(tantalos_pelopides, cursed), event(tantalos_pelopides, atonement_begun))).
narrative_precondition(lifting_curse, (alive(tantalos_pelopides), alive(niobe_pelopides))).
narrative_outcome(lifting_curse, forgiven, 'The gods accept the atonement. The curse is lifted. The Pelopides family begins to rebuild.').
narrative_outcome(lifting_curse, deepened, 'The atonement is deemed insufficient. The curse intensifies, spreading to allies of the family.').
narrative_outcome(lifting_curse, transferred, 'A hero offers to take the curse upon themselves. The Pelopides are freed but the hero carries a terrible burden.').

%% The Return of the Golden Age
narrative(golden_age_return, 'The Return of the Golden Age', epic).
narrative_description(golden_age_return, 'An ancient prophecy speaks of a time when gods and mortals lived in harmony. Signs suggest that age could return if heroes prove worthy.').
narrative_trigger(golden_age_return, (status(theopolis, golden_age_signs))).
narrative_precondition(golden_age_return, (alive(kallista_heliades), alive(hierophantes_apollonides))).
narrative_outcome(golden_age_return, restored, 'The Golden Age returns. The gods walk among mortals. Peace and abundance reign for a generation.').
narrative_outcome(golden_age_return, denied, 'Mortal failings prove too great. The signs fade. The prophecy passes to a future generation.').
narrative_outcome(golden_age_return, partial, 'Only Theopolis achieves the Golden Age, becoming a beacon of divine favor while the rest of the world descends into darkness.').
