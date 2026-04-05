%% Insimul Narratives: Superhero
%% Source: data/worlds/superhero/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_outcome/3

%% The Overlord Gambit
narrative(overlord_gambit, 'The Overlord Gambit', conflict).
narrative_description(overlord_gambit, 'Victor Graves launches a coordinated attack on multiple city districts to overwhelm the heroes.').
narrative_trigger(overlord_gambit, (trait(X, megalomaniac), attribute(X, cunningness, C), C > 80)).
narrative_step(overlord_gambit, 0, 'Simultaneous explosions rock The Docks, The Narrows, and Foundry Row.').
narrative_step(overlord_gambit, 1, 'Heroes must split up to respond, weakening each team.').
narrative_step(overlord_gambit, 2, 'Overlord reveals the attacks were a distraction for his true objective.').
narrative_step(overlord_gambit, 3, 'A final confrontation at Titan Tower determines the outcome.').
narrative_outcome(overlord_gambit, success, 'The heroes regroup in time and Overlord is captured.').
narrative_outcome(overlord_gambit, failure, 'Overlord achieves his objective and escapes.').

%% Identity Crisis
narrative(identity_crisis, 'Identity Crisis', personal).
narrative_description(identity_crisis, 'A hero secret identity is threatened, forcing them to choose between their two lives.').
narrative_trigger(identity_crisis, (trait(X, heroic), trait(X, protective))).
narrative_step(identity_crisis, 0, 'A villain obtains evidence linking a hero to their civilian identity.').
narrative_step(identity_crisis, 1, 'The hero must decide how to contain the leak.').
narrative_step(identity_crisis, 2, 'Loved ones are put in danger by the exposure.').
narrative_step(identity_crisis, 3, 'The hero confronts the villain in a deeply personal showdown.').
narrative_outcome(identity_crisis, success, 'The secret is preserved and loved ones are saved.').
narrative_outcome(identity_crisis, failure, 'The identity goes public, changing the hero life forever.').

%% The Mutagen Plague
narrative(mutagen_plague, 'The Mutagen Plague', crisis).
narrative_description(mutagen_plague, 'A mutagenic toxin is released into the water supply, causing random power manifestations in civilians.').
narrative_trigger(mutagen_plague, (trait(X, ruthless), trait(X, brilliant))).
narrative_step(mutagen_plague, 0, 'Civilians begin manifesting unstable powers across the city.').
narrative_step(mutagen_plague, 1, 'Hospitals are overwhelmed with mutation victims.').
narrative_step(mutagen_plague, 2, 'Heroes race to trace the source while managing the chaos.').
narrative_step(mutagen_plague, 3, 'The antidote must be mass-produced and distributed before permanent mutations set in.').
narrative_outcome(mutagen_plague, success, 'The antidote is distributed and Dr. Vex is apprehended.').
narrative_outcome(mutagen_plague, failure, 'Hundreds of civilians gain permanent, unstable powers.').

%% Political Upheaval
narrative(political_upheaval, 'Political Upheaval', political).
narrative_description(political_upheaval, 'A new law threatens to criminalize all unregistered metahuman activity.').
narrative_trigger(political_upheaval, (trait(X, political), attribute(X, charisma, Ch), Ch > 70)).
narrative_step(political_upheaval, 0, 'The city council proposes the Metahuman Accountability Act.').
narrative_step(political_upheaval, 1, 'Heroes are divided on whether to support or resist the legislation.').
narrative_step(political_upheaval, 2, 'Villains exploit the division to advance their own agendas.').
narrative_step(political_upheaval, 3, 'A crisis forces heroes and politicians to the negotiating table.').
narrative_outcome(political_upheaval, success, 'A compromise is reached that protects both heroes and civilians.').
narrative_outcome(political_upheaval, failure, 'The act passes in its strictest form, driving heroes underground.').

%% The Asylum Break
narrative(asylum_break, 'The Asylum Break', crisis).
narrative_description(asylum_break, 'A mass breakout at Ironhaven Asylum releases the city most dangerous criminals.').
narrative_trigger(asylum_break, (trait(X, manipulative), location(X, ironhaven))).
narrative_step(asylum_break, 0, 'The Asylum power grid is sabotaged, disabling all dampener fields.').
narrative_step(asylum_break, 1, 'Dozens of metahuman criminals escape into the Ash District.').
narrative_step(asylum_break, 2, 'Heroes must prioritize which villains to recapture first.').
narrative_step(asylum_break, 3, 'The mastermind behind the breakout makes their move.').
narrative_outcome(asylum_break, success, 'Most criminals are recaptured and the mastermind is identified.').
narrative_outcome(asylum_break, failure, 'The villain roster of the city doubles overnight.').

%% Redemption Arc
narrative(redemption_arc, 'Redemption Arc', personal).
narrative_description(redemption_arc, 'A conflicted villain considers switching sides after witnessing the consequences of their actions.').
narrative_trigger(redemption_arc, (trait(X, conflicted), trait(X, mercenary))).
narrative_step(redemption_arc, 0, 'The villain inadvertently saves a civilian during a heist gone wrong.').
narrative_step(redemption_arc, 1, 'A hero extends an offer of amnesty in exchange for information.').
narrative_step(redemption_arc, 2, 'The villain must betray their former allies to earn redemption.').
narrative_step(redemption_arc, 3, 'A final test of loyalty determines their true allegiance.').
narrative_outcome(redemption_arc, success, 'The villain becomes a reluctant hero and gains a second chance.').
narrative_outcome(redemption_arc, failure, 'The villain returns to crime, more dangerous than before.').
