%% Insimul Narratives: Victorian England
%% Source: data/worlds/victorian_england/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_outcome/3

%% Narrative: The Factory Act
narrative(factory_act, 'The Factory Act', political).
narrative_description(factory_act, 'Evidence of horrific working conditions in the Dickens mill sparks a political battle over labor reform. The player must navigate alliances between industrialists, reformers, and Parliament.').
narrative_trigger(factory_act, quest_complete(factory_scandal)).
narrative_step(factory_act, 0, 'The factory ledger evidence reaches the press, causing public outrage.').
narrative_step(factory_act, 1, 'Lord Ashford is pressured to introduce a reform bill in Parliament.').
narrative_step(factory_act, 2, 'Factory owners threaten to close mills if the bill passes, costing thousands of jobs.').
narrative_outcome(factory_act, reform, 'The bill passes, improving conditions but causing temporary economic hardship.').
narrative_outcome(factory_act, defeat, 'The bill is defeated and the status quo continues, breeding resentment.').

%% Narrative: The Whitechapel Mystery
narrative(whitechapel_mystery, 'The Whitechapel Mystery', mystery).
narrative_description(whitechapel_mystery, 'A series of crimes in the East End reveals a web of corruption connecting the criminal underworld to figures in high society.').
narrative_trigger(whitechapel_mystery, quest_complete(murder_fleet_street)).
narrative_step(whitechapel_mystery, 0, 'The Fleet Street murder connects to a larger pattern of crimes in the East End.').
narrative_step(whitechapel_mystery, 1, 'Scotland Yard is compromised. Someone inside is protecting the criminal network.').
narrative_step(whitechapel_mystery, 2, 'The trail leads to a shocking connection with a member of the aristocracy.').
narrative_outcome(whitechapel_mystery, justice, 'The criminals are brought to trial and the corrupt inspector is dismissed.').
narrative_outcome(whitechapel_mystery, cover_up, 'The aristocrat uses influence to bury the scandal and silence witnesses.').

%% Narrative: The Gilded Cage
narrative(gilded_cage, 'The Gilded Cage', social).
narrative_description(gilded_cage, 'Charlotte Bronte struggles against the constraints placed on women in Victorian society, seeking independence through education and writing.').
narrative_trigger(gilded_cage, relationship(governess_bronte, lady_ashford, trust, 8)).
narrative_step(gilded_cage, 0, 'Charlotte confides in Lady Ashford about her ambition to write and publish.').
narrative_step(gilded_cage, 1, 'A publisher rejects her manuscript because of her gender.').
narrative_step(gilded_cage, 2, 'The player must help Charlotte find a way to publish under a pseudonym or fight for recognition.').
narrative_outcome(gilded_cage, published, 'Charlotte publishes under her own name, becoming a voice for reform.').
narrative_outcome(gilded_cage, pseudonym, 'Charlotte publishes under a male pseudonym, gaining literary success in secret.').

%% Narrative: The Iron Horse
narrative(iron_horse, 'The Iron Horse', technological).
narrative_description(iron_horse, 'Edison proposes a revolutionary new railway engine that could transform transportation. But powerful interests want to suppress his invention.').
narrative_trigger(iron_horse, quest_complete(steam_revolution)).
narrative_step(iron_horse, 0, 'Edison demonstrates his engine to a crowd of investors and journalists.').
narrative_step(iron_horse, 1, 'A rival industrialist sabotages the demonstration, causing a public failure.').
narrative_step(iron_horse, 2, 'The player must help Edison rebuild and secure funding before his patent expires.').
narrative_outcome(iron_horse, success, 'The engine is built and Edison becomes a celebrated inventor.').
narrative_outcome(iron_horse, suppressed, 'The rival buys Edison out, shelving the invention for a decade.').

%% Narrative: Noblesse Oblige
narrative(noblesse_oblige, 'Noblesse Oblige', moral).
narrative_description(noblesse_oblige, 'Lord Ashford faces a crisis of conscience when his investments are revealed to profit from the very suffering he publicly condemns.').
narrative_trigger(noblesse_oblige, quest_complete(workhouse_children)).
narrative_step(noblesse_oblige, 0, 'Documents reveal Ashford holds shares in companies that supply workhouses.').
narrative_step(noblesse_oblige, 1, 'The press threatens to expose the hypocrisy, endangering his political career.').
narrative_step(noblesse_oblige, 2, 'Ashford must choose between his wealth and his principles.').
narrative_outcome(noblesse_oblige, divest, 'Ashford sells his shares and champions reform, losing wealth but gaining respect.').
narrative_outcome(noblesse_oblige, deny, 'Ashford denies the connection but the scandal erodes his influence.').

%% Narrative: Empire of Shadows
narrative(empire_of_shadows, 'Empire of Shadows', political).
narrative_description(empire_of_shadows, 'The opium trade investigation uncovers a network that stretches from the East End dens to the corridors of the War Office, threatening to expose imperial secrets.').
narrative_trigger(empire_of_shadows, quest_complete(opium_den)).
narrative_step(empire_of_shadows, 0, 'The opium ringleader turns out to have connections to military intelligence.').
narrative_step(empire_of_shadows, 1, 'The War Office pressures Scotland Yard to drop the investigation.').
narrative_step(empire_of_shadows, 2, 'The player must decide whether to pursue justice or protect national security.').
narrative_outcome(empire_of_shadows, expose, 'The scandal brings down a cabinet minister and triggers reform of the opium trade.').
narrative_outcome(empire_of_shadows, classified, 'The truth is buried in the name of the Empire, and the trade continues.').
