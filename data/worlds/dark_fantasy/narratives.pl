%% Insimul Narratives: Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/narratives.pl
%% Created: 2026-04-03
%% Total: 7 narrative arcs
%%
%% Predicate schema:
%%   narrative/3 -- narrative(Id, Title, Type)
%%   narrative_description/2, narrative_trigger/2, narrative_phase/3,
%%   narrative_involves/2, narrative_location/2, narrative_stakes/2

%% ═══════════════════════════════════════════════════════════
%% Arc 1: The Shattered Brotherhood
%% ═══════════════════════════════════════════════════════════

narrative(shattered_brotherhood, 'The Shattered Brotherhood', tragedy).
narrative_description(shattered_brotherhood, 'Aldric Voss discovers that his former brother-in-arms Edric Holloway still retains memories of their shared past. Aldric must decide whether to attempt a rescue from Dravens control or put his old friend to final rest.').
narrative_trigger(shattered_brotherhood, (relationship(aldric_voss, edric_holloway, former_brother_in_arms), status(edric_holloway, bound_to_draven))).
narrative_phase(shattered_brotherhood, 1, 'Aldric learns that Edric has been seen patrolling the border of Gravenhold, calling out names of fallen knights.').
narrative_phase(shattered_brotherhood, 2, 'Sera Voss encounters Edric during a scouting mission. He hesitates instead of attacking, whispering her fathers name.').
narrative_phase(shattered_brotherhood, 3, 'Aldric must choose: storm Gravenhold to free Edric, seek Morwen Greymists forbidden ritual to sever the bond, or grant Edric mercy through destruction.').
narrative_involves(shattered_brotherhood, aldric_voss).
narrative_involves(shattered_brotherhood, edric_holloway).
narrative_involves(shattered_brotherhood, sera_voss).
narrative_involves(shattered_brotherhood, varek_draven).
narrative_location(shattered_brotherhood, gravenhold).
narrative_stakes(shattered_brotherhood, 'If Aldric pursues the rescue, he risks his own capture. If he destroys Edric, the guilt may break his will entirely.').

%% ═══════════════════════════════════════════════════════════
%% Arc 2: The Apprentice Necromancer
%% ═══════════════════════════════════════════════════════════

narrative(apprentice_necromancer, 'The Forbidden Student', corruption).
narrative_description(apprentice_necromancer, 'Maren Thanes secret study of necromancy under Morwen Greymist threatens to expose her to both her father and to Lord Dravens recruiters. She believes understanding death is the key to curing the Ashrot plague.').
narrative_trigger(apprentice_necromancer, (status(maren_thane, secret_necromancer), relationship(maren_thane, morwen_greymist, forbidden_student))).
narrative_phase(apprentice_necromancer, 1, 'Maren successfully reanimates a dead raven, proving her aptitude but horrifying herself. Her corruption rises.').
narrative_phase(apprentice_necromancer, 2, 'Corvus Thane finds strange herbs in Marens quarters. Sera Voss covers for her friend, straining her own conscience.').
narrative_phase(apprentice_necromancer, 3, 'Nyx Sable contacts Maren through a dark vision, offering true power in exchange for service to Draven. Maren must choose her path.').
narrative_involves(apprentice_necromancer, maren_thane).
narrative_involves(apprentice_necromancer, corvus_thane).
narrative_involves(apprentice_necromancer, morwen_greymist).
narrative_involves(apprentice_necromancer, sera_voss).
narrative_involves(apprentice_necromancer, nyx_sable).
narrative_location(apprentice_necromancer, hollowmere).
narrative_stakes(apprentice_necromancer, 'Maren could discover a plague cure through dark means, or fall to corruption and become Dravens newest weapon against Ashenvale.').

%% ═══════════════════════════════════════════════════════════
%% Arc 3: The Spirit in the Cathedral
%% ═══════════════════════════════════════════════════════════

narrative(spirit_in_cathedral, 'The Spirit in the Cathedral', mystery).
narrative_description(spirit_in_cathedral, 'Elaras spirit grows more restless, manifesting visibly during services. Prior Ambrose wants her exorcised. Aldric wants her left alone. Isolde suspects the spirit is trying to communicate something vital about the curse.').
narrative_trigger(spirit_in_cathedral, (status(elara_voss, bound_spirit), status(elara_voss, cathedral_haunting))).
narrative_phase(spirit_in_cathedral, 1, 'Parishioners report cold spots, whispered warnings, and candles extinguishing in patterns that spell words in the Old Tongue.').
narrative_phase(spirit_in_cathedral, 2, 'Isolde Wren deciphers the messages: Elara is pointing to something sealed beneath the cathedral -- records from before the Night of Burning.').
narrative_phase(spirit_in_cathedral, 3, 'Prior Ambrose orders the exorcism, fearing what the records might reveal about the cathedrals role in the original curse. Aldric and Isolde must decide whether to defy him.').
narrative_involves(spirit_in_cathedral, elara_voss).
narrative_involves(spirit_in_cathedral, aldric_voss).
narrative_involves(spirit_in_cathedral, ambrose_kael).
narrative_involves(spirit_in_cathedral, isolde_wren).
narrative_location(spirit_in_cathedral, ashenvale).
narrative_stakes(spirit_in_cathedral, 'The sealed records may contain the origin of the curse and a path to ending it -- or a truth so terrible that Ambrose would rather see Ashenvale fall than let it be known.').

%% ═══════════════════════════════════════════════════════════
%% Arc 4: The Dark Bargain
%% ═══════════════════════════════════════════════════════════

narrative(dark_bargain, 'The Dark Bargain', political_intrigue).
narrative_description(dark_bargain, 'The Black Throne Pact demands monthly tribute of living souls. When the populace discovers the truth about what their leaders have been sacrificing, trust shatters and Ashenvale threatens to tear itself apart.').
narrative_trigger(dark_bargain, (relationship(ambrose_kael, varek_draven, secret_negotiator))).
narrative_phase(dark_bargain, 1, 'Vesper Ashmore acquires a ledger from a dead courier detailing the tribute payments -- names, dates, and who approved them.').
narrative_phase(dark_bargain, 2, 'Ronan Blackwood confronts Aldric after recognizing names of missing soldiers on the list. The tavern becomes a hotbed of dissent.').
narrative_phase(dark_bargain, 3, 'With the pact exposed, Draven declares it void and masses his legions. Ashenvale must unite or fall.').
narrative_involves(dark_bargain, ambrose_kael).
narrative_involves(dark_bargain, varek_draven).
narrative_involves(dark_bargain, vesper_ashmore).
narrative_involves(dark_bargain, ronan_blackwood).
narrative_involves(dark_bargain, aldric_voss).
narrative_location(dark_bargain, ashenvale).
narrative_stakes(dark_bargain, 'Exposing the pact saves future victims but removes the only thing keeping Dravens armies at bay. Silence preserves safety at an unbearable moral cost.').

%% ═══════════════════════════════════════════════════════════
%% Arc 5: The Blight Cure
%% ═══════════════════════════════════════════════════════════

narrative(blight_cure, 'Roots of the Blight', quest).
narrative_description(blight_cure, 'Silas Fenwick believes a natural cure to the Ashrot plague grows in the deepest Blight Zone, where corruption is strongest. He needs protection for an expedition that most consider suicidal.').
narrative_trigger(blight_cure, (status(silas_fenwick, blight_researcher))).
narrative_phase(blight_cure, 1, 'Silas presents his theory to Corvus Thane, who dismisses it as reckless optimism. Silas seeks volunteers independently.').
narrative_phase(blight_cure, 2, 'The expedition enters the Blight Zone. Ward potions from Morwen buy them hours, not days. The flora is mutated but Silas finds what he seeks -- a fungus that devours corruption.').
narrative_phase(blight_cure, 3, 'The fungus works but requires a living host to cultivate. Someone must be deliberately infected with Ashrot and then treated, risking death to prove the cure.').
narrative_involves(blight_cure, silas_fenwick).
narrative_involves(blight_cure, corvus_thane).
narrative_involves(blight_cure, morwen_greymist).
narrative_involves(blight_cure, garrett_holt).
narrative_location(blight_cure, hollowmere).
narrative_stakes(blight_cure, 'Success means a cure for the plague that has killed thousands. Failure means losing one of the last herbalists capable of maintaining Hollowmeres defenses.').

%% ═══════════════════════════════════════════════════════════
%% Arc 6: The Sorcerer Unchained
%% ═══════════════════════════════════════════════════════════

narrative(sorcerer_unchained, 'The Sorcerer Unchained', betrayal).
narrative_description(sorcerer_unchained, 'Nyx Sable plots to overthrow Varek Draven, believing she can control the Wellspring of Ruin better than he can. She reaches out to unlikely allies in Ashenvale, offering information in exchange for a coordinated strike.').
narrative_trigger(sorcerer_unchained, (relationship(nyx_sable, varek_draven, resentful_servitude), attribute(nyx_sable, dark_magic, DM), DM > 70)).
narrative_phase(sorcerer_unchained, 1, 'Nyx contacts Vesper Ashmore through their old channels, proposing an alliance against Draven.').
narrative_phase(sorcerer_unchained, 2, 'Vesper brings the offer to Aldric. The prospect of defeating Draven is tempting, but trusting a dark sorceress could be a trap.').
narrative_phase(sorcerer_unchained, 3, 'The assault on Gravenhold begins. Whether Nyx betrays her new allies or genuinely seeks freedom determines the fate of the cursed lands.').
narrative_involves(sorcerer_unchained, nyx_sable).
narrative_involves(sorcerer_unchained, varek_draven).
narrative_involves(sorcerer_unchained, vesper_ashmore).
narrative_involves(sorcerer_unchained, aldric_voss).
narrative_involves(sorcerer_unchained, edric_holloway).
narrative_location(sorcerer_unchained, gravenhold).
narrative_stakes(sorcerer_unchained, 'Replacing one dark lord with another may be worse than the current arrangement. But Nyx might be the only one who knows how to seal the Wellspring.').

%% ═══════════════════════════════════════════════════════════
%% Arc 7: The Gravedigger Knows
%% ═══════════════════════════════════════════════════════════

narrative(gravedigger_knows, 'The Gravedigger Knows', mystery).
narrative_description(gravedigger_knows, 'Dredge, dismissed by most as simple, has been quietly observing patterns in the dead. He notices that certain corpses do not rise -- and they all share a mark he has seen before, carved into stones predating the curse.').
narrative_trigger(gravedigger_knows, (status(dredge, gravedigger))).
narrative_phase(gravedigger_knows, 1, 'Dredge shows Ronan Blackwood the marked stones. Ronan does not understand but trusts his friend enough to investigate.').
narrative_phase(gravedigger_knows, 2, 'The marks match symbols in the Old Tongue. Isolde Wren translates fragments: they are part of an ancient binding that once kept the dead at rest across the entire region.').
narrative_phase(gravedigger_knows, 3, 'Restoring the binding requires finding all the marked stones and performing a ritual at each. The stones are scattered across every settlement -- including Gravenhold.').
narrative_involves(gravedigger_knows, dredge).
narrative_involves(gravedigger_knows, ronan_blackwood).
narrative_involves(gravedigger_knows, isolde_wren).
narrative_involves(gravedigger_knows, ambrose_kael).
narrative_location(gravedigger_knows, ashenvale).
narrative_stakes(gravedigger_knows, 'The ancient binding could end the Undying Curse permanently, but completing the ritual in Gravenhold means entering the heart of Dravens power.').
