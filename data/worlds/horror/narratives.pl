%% Insimul Narratives: Horror World
%% Source: data/worlds/horror/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_participants/2, narrative_outcome/3

%% The Awakening
narrative(the_awakening, 'The Awakening', event_chain).
narrative_description(the_awakening, 'The entity beneath Grimhaven stirs in its sleep, sending tremors through the earth and madness through dreams. The cult races to complete the summoning ritual while the investigators scramble to stop them.').
narrative_trigger(the_awakening, (status(silas_blackwood, cult_leader), forbidden_knowledge(corvus_blackwood))).
narrative_participants(the_awakening, [silas_blackwood, corvus_blackwood, ruth_hargrove, ambrose_thorne, agnes_wight]).
narrative_outcome(the_awakening, entity_sealed, 'The counter-ritual succeeds. The entity is bound for another generation. The cost is terrible.').
narrative_outcome(the_awakening, entity_wakes, 'The entity partially awakens. Ravenhollow is consumed by madness. A few survivors flee.').
narrative_outcome(the_awakening, cult_destroyed, 'The cult is broken but the entity remains restless. The threat is delayed, not ended.').

%% The Vanishing Season
narrative(vanishing_season, 'The Vanishing Season', event_chain).
narrative_description(vanishing_season, 'Autumn comes and three more residents disappear. Sheriff Hargrove must solve the case before the fog takes more. The trail leads to the harbor, the cemetery, and finally beneath the old well in Grimhaven.').
narrative_trigger(vanishing_season, (status(ruth_hargrove, sheriff), clue_found(ruth_hargrove, _))).
narrative_participants(vanishing_season, [ruth_hargrove, jack_dunmore, edgar_holloway, ezekiel_crane]).
narrative_outcome(vanishing_season, victims_found, 'The missing are found alive but changed. They speak of underwater cities and will never be the same.').
narrative_outcome(vanishing_season, victims_lost, 'The victims are never recovered. The case joins the files of the disappeared.').
narrative_outcome(vanishing_season, truth_revealed, 'The full scope of the disappearances is exposed. The town must confront generations of silence.').

%% The Blackwood Schism
narrative(blackwood_schism, 'The Blackwood Schism', event_chain).
narrative_description(blackwood_schism, 'Isolde Blackwood attempts to break free from her family and the cult. Her father Silas will do anything to bring her back. The player must choose whether to help Isolde escape or return her to the family that claims to need her blood for the ritual.').
narrative_trigger(blackwood_schism, (trait(isolde_blackwood, defiant), relationship(isolde_blackwood, silas_blackwood, fears))).
narrative_participants(blackwood_schism, [isolde_blackwood, silas_blackwood, corvus_blackwood, virginia_blackwood]).
narrative_outcome(blackwood_schism, isolde_escapes, 'Isolde flees Ravenhollow. The cult loses a key component for their ritual. Silas grows desperate.').
narrative_outcome(blackwood_schism, isolde_returns, 'Isolde is recaptured. The ritual proceeds as planned. Her fate is sealed.').
narrative_outcome(blackwood_schism, isolde_turns, 'Isolde embraces the cult willingly, becoming more dangerous than her father.').

%% The Lighthouse Signal
narrative(lighthouse_signal, 'The Lighthouse Signal', event_chain).
narrative_description(lighthouse_signal, 'The abandoned lighthouse begins signaling at night, drawing ships toward the rocks. The spectral keeper has a message for the living. Reaching the top of the lighthouse means confronting the ghosts of the 1923 shipwreck.').
narrative_trigger(lighthouse_signal, (prophecy_received(_), area_searched(_, lot_hr_12))).
narrative_participants(lighthouse_signal, [caleb_marsh, lena_petrova, ambrose_thorne]).
narrative_outcome(lighthouse_signal, ghosts_laid, 'The spirits of the Morrigan crew find peace. The lighthouse goes dark.').
narrative_outcome(lighthouse_signal, warning_heeded, 'The spectral signals are a warning. Following them reveals an approaching threat from the sea.').

%% The Asylum Reopens
narrative(asylum_reopens, 'The Asylum Reopens', event_chain).
narrative_description(asylum_reopens, 'Dr. Voss wants to reopen the asylum, claiming she can treat supernatural madness. Her methods are questionable and her true motives unclear. The patients she gathers may be specimens, not patients.').
narrative_trigger(asylum_reopens, (status(miriam_voss, doctor), forbidden_knowledge(miriam_voss))).
narrative_participants(asylum_reopens, [miriam_voss, martha_holloway, eleanor_holloway, thomas_bledsoe]).
narrative_outcome(asylum_reopens, voss_stopped, 'Dr. Voss is exposed as conducting experiments. The asylum is sealed permanently.').
narrative_outcome(asylum_reopens, voss_succeeds, 'Dr. Voss finds a treatment, but it requires a terrible sacrifice.').
narrative_outcome(asylum_reopens, patients_escape, 'The patients break free, their partially treated minds now channels for the entity.').

%% The Fog Comes
narrative(the_fog_comes, 'The Fog Comes', event_chain).
narrative_description(the_fog_comes, 'The worst fog in living memory rolls in from the sea and does not lift for three days. Ravenhollow is cut off. Things move in the streets. Survivors must hold out until dawn of the fourth day when the fog finally breaks.').
narrative_trigger(the_fog_comes, (barricaded(lot_hr_4), salt_warded(lot_hr_6))).
narrative_participants(the_fog_comes, [edgar_holloway, ruth_hargrove, ambrose_thorne, jack_dunmore, lena_petrova]).
narrative_outcome(the_fog_comes, town_survives, 'Ravenhollow endures but is deeply scarred. Several buildings are destroyed.').
narrative_outcome(the_fog_comes, heavy_losses, 'Many die during the three-day siege. The surviving population is halved.').
narrative_outcome(the_fog_comes, fog_repelled, 'A desperate ritual at the church drives the fog back. The entity recoils but will return.').
