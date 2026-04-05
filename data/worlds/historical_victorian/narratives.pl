%% Insimul Narratives: Historical Victorian
%% Source: data/worlds/historical_victorian/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_participants/2, narrative_outcome/3

%% The Great Strike
narrative(the_great_strike, 'The Great Strike', event_chain).
narrative_description(the_great_strike, 'Workers at the Blackwood Cotton Mill walk out after a child is killed by machinery. The strike threatens to spread across the factory district and pit worker against owner in a battle that could reshape the town.').
narrative_trigger(the_great_strike, (status(agnes_whittle, union_organizer), workers_organized(lot_vic_1))).
narrative_participants(the_great_strike, [agnes_whittle, silas_blackwood, thomas_blackwood, charlotte_ashworth]).
narrative_outcome(the_great_strike, workers_win, 'Factory conditions improve but Silas Blackwood raises prices and fires troublemakers.').
narrative_outcome(the_great_strike, owners_win, 'The strike is broken. Agnes Whittle is blacklisted. Workers return to worse conditions.').
narrative_outcome(the_great_strike, compromise, 'Thomas Blackwood negotiates modest reforms. Both sides remain dissatisfied.').

%% The Ashworth Succession
narrative(ashworth_succession, 'The Ashworth Succession', event_chain).
narrative_description(ashworth_succession, 'Lord Ashworth is aging and his heir Henry is an indebted wastrel. Charlotte wants reform, not power. Silas Blackwood circles like a vulture, hoping to buy the estate. The future of the most powerful family in Ironhaven hangs in the balance.').
narrative_trigger(ashworth_succession, (trait(henry_ashworth, indebted), relationship(silas_blackwood, edmund_ashworth, business_rival))).
narrative_participants(ashworth_succession, [edmund_ashworth, henry_ashworth, charlotte_ashworth, silas_blackwood, margaret_ashworth]).
narrative_outcome(ashworth_succession, henry_inherits, 'Henry inherits but sells land to pay debts, weakening the family.').
narrative_outcome(ashworth_succession, charlotte_inherits, 'Charlotte takes control and begins radical reform, scandalizing society.').
narrative_outcome(ashworth_succession, blackwood_buys, 'Silas Blackwood purchases the estate, merging old money and new industry.').

%% The Jade Lantern Affair
narrative(jade_lantern_affair, 'The Jade Lantern Affair', event_chain).
narrative_description(jade_lantern_affair, 'Inspector Hale discovers that prominent citizens frequent the Jade Lantern opium den. The trail leads to powerful people who will do anything to keep their vice secret. The truth could topple reputations or bury the detective.').
narrative_trigger(jade_lantern_affair, (status(rupert_hale, police_detective), evidence_gathered(rupert_hale, lot_vic_14))).
narrative_participants(jade_lantern_affair, [rupert_hale, shen_li, henry_ashworth, barnaby_soot]).
narrative_outcome(jade_lantern_affair, exposed, 'The opium ring is exposed. Several prominent citizens are ruined.').
narrative_outcome(jade_lantern_affair, covered_up, 'Powerful interests bury the investigation. Hale is reassigned.').

%% The Photograph Scandal
narrative(photograph_scandal, 'The Photograph Scandal', event_chain).
narrative_description(photograph_scandal, 'The photography studio on Chapel Street holds more than family portraits. Someone is blackmailing society figures with compromising daguerreotypes. The scandal threatens to crack open the hypocrisy of Victorian propriety.').
narrative_trigger(photograph_scandal, (article_published(_, blackmail))).
narrative_participants(photograph_scandal, [margaret_ashworth, rupert_hale, eliza_hartley]).
narrative_outcome(photograph_scandal, blackmailer_caught, 'The blackmailer is caught and the photographs destroyed. Society breathes easier.').
narrative_outcome(photograph_scandal, photographs_leaked, 'The photographs become public. Multiple reputations are destroyed.').

%% The Coalbridge Disaster
narrative(coalbridge_disaster, 'The Coalbridge Disaster', event_chain).
narrative_description(coalbridge_disaster, 'An explosion in the Coalbridge Colliery traps dozens of miners underground. The mine owner refuses to spend money on rescue. A community rallies while the authorities debate whether the miners are worth saving.').
narrative_trigger(coalbridge_disaster, (workers_organized(lot_vic_23))).
narrative_participants(coalbridge_disaster, [edmund_ashworth, william_oakes, agnes_whittle, eliza_hartley]).
narrative_outcome(coalbridge_disaster, miners_saved, 'A dangerous rescue operation saves most miners. The disaster spurs safety reform.').
narrative_outcome(coalbridge_disaster, miners_lost, 'The mine is sealed. Dozens perish. Public outrage fuels the labour movement.').

%% The Inventors Gambit
narrative(inventors_gambit, 'The Inventors Gambit', event_chain).
narrative_description(inventors_gambit, 'Professor Pemberton has designed a revolutionary steam engine, but both Ashworth and Blackwood want exclusive rights. Industrial espionage, sabotage, and a race to patent could change the balance of power in Ironhaven forever.').
narrative_trigger(inventors_gambit, (experiment_completed(alistair_pemberton))).
narrative_participants(inventors_gambit, [alistair_pemberton, edmund_ashworth, silas_blackwood, thomas_blackwood]).
narrative_outcome(inventors_gambit, ashworth_wins, 'Lord Ashworth secures the patent. His industrial power doubles.').
narrative_outcome(inventors_gambit, blackwood_wins, 'Silas Blackwood steals the design. His factories outproduce the competition.').
narrative_outcome(inventors_gambit, public_domain, 'Pemberton publishes the design freely, denying both magnates exclusive advantage.').
