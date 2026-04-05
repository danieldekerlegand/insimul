%% Insimul Truths: Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Corporate Sovereignty
truth(corpo_sovereignty, 'Corporate Sovereignty', political_reality).
truth_content(corpo_sovereignty, 'Three megacorporations -- Arasaka-Murata, Nexus Dynamics, and SynthLife Biotech -- hold more power than any government. They write the laws, fund the police, and control the infrastructure. Elections still happen but they are theater.').
truth_importance(corpo_sovereignty, 10).
truth_timestep(corpo_sovereignty, 0).

%% The Street Code
truth(street_code, 'The Street Code', social_rule).
truth_content(street_code, 'In the lower districts, reputation is currency. You keep your word, you pay your debts, and you never snitch to MetroSec. Breaking the code marks you as untrustworthy and cuts you off from fixers, jobs, and protection.').
truth_importance(street_code, 9).
truth_timestep(street_code, 0).

%% Cyberpsychosis
truth(cyberpsychosis, 'Cyberpsychosis', medical_fact).
truth_content(cyberpsychosis, 'Excessive cybernetic augmentation degrades the human psyche. Victims lose empathy, become paranoid, and eventually enter violent dissociative episodes. NeuroChill suppresses symptoms but there is no cure. Ripperdocs warn patients but few listen.').
truth_importance(cyberpsychosis, 9).
truth_timestep(cyberpsychosis, 0).

%% The Net
truth(the_net, 'The Net', technology).
truth_content(the_net, 'The global data network connects all devices, implants, and systems. Netrunners navigate it as a virtual landscape. Corporate subnets are protected by ICE -- Intrusion Countermeasures Electronics -- that can fry a hacker brain.').
truth_importance(the_net, 10).
truth_timestep(the_net, 0).

%% MetroSec
truth(metrosec, 'MetroSec Corporate Police', political_reality).
truth_content(metrosec, 'MetroSec is a private police force contracted by the megacorps. They protect corporate property and Corpo Plaza citizens. In the Stacks and Neon Row, they only show up when a corpo asset is threatened. Street residents handle their own justice.').
truth_importance(metrosec, 8).
truth_timestep(metrosec, 0).

%% Ripperdoc Culture
truth(ripperdoc_culture, 'Ripperdoc Culture', social_rule).
truth_content(ripperdoc_culture, 'Ripperdocs are back-alley surgeons who install and repair cyberware outside corporate clinics. They operate on a trust system: no questions about where the chrome came from, no records for MetroSec. A good ripperdoc is worth more than gold.').
truth_importance(ripperdoc_culture, 8).
truth_timestep(ripperdoc_culture, 0).

%% Credchip Economy
truth(credchip_economy, 'Credchip Economy', economic_fact).
truth_content(credchip_economy, 'Anonymous credchips are the de facto currency of the streets. Corporate employees use tracked digital wallets, but everyone on the margins trades in untraceable chips. Counterfeiting is punishable by corporate execution.').
truth_importance(credchip_economy, 7).
truth_timestep(credchip_economy, 0).

%% Synthetic Consciousness
truth(synthetic_consciousness, 'Synthetic Consciousness', philosophical).
truth_content(synthetic_consciousness, 'AI constructs have reached a level of sophistication where they exhibit personality, emotion, and self-awareness. Corporations deny they are sentient. The question of AI rights is the most controversial debate of the era.').
truth_importance(synthetic_consciousness, 8).
truth_timestep(synthetic_consciousness, 0).

%% Class Stratification
truth(class_stratification, 'Vertical Class Stratification', social_rule).
truth_content(class_stratification, 'Society is literally stratified by altitude. Corporate executives live in sky-high penthouses. The middle class occupies mid-level arcologies. The poor are crammed into ground-level stacks. Sunlight is a luxury.').
truth_importance(class_stratification, 9).
truth_timestep(class_stratification, 0).

%% Fixer Network
truth(fixer_network, 'Fixer Network', social_rule).
truth_content(fixer_network, 'Fixers are the connective tissue of the underground economy. They match clients with mercenaries, hackers, and specialists. Every job goes through a fixer. Cutting out the fixer earns you enemies on all sides.').
truth_importance(fixer_network, 7).
truth_timestep(fixer_network, 0).

%% Braindance
truth(braindance, 'Braindance Entertainment', technology).
truth_content(braindance, 'Braindance recordings let users experience another person memories and sensations in full sensory detail. Legal braindances are curated entertainment. Illegal ones traffic in extreme experiences and are highly addictive.').
truth_importance(braindance, 6).
truth_timestep(braindance, 0).

%% Corporate Wars
truth(corporate_wars, 'Corporate Wars', historical_fact).
truth_content(corporate_wars, 'The three megacorps wage constant shadow wars against each other using mercenaries, netrunners, and sabotage. Open conflict is rare but devastating. The 2061 Arasaka-Nexus skirmish leveled six city blocks.').
truth_importance(corporate_wars, 8).
truth_timestep(corporate_wars, 0).

%% Augmentation Culture
truth(augmentation_culture, 'Augmentation Culture', cultural_norm).
truth_content(augmentation_culture, 'Body modification through cybernetics is mainstream. Visible chrome is a fashion statement in some circles and a survival necessity in others. "Pure" humans -- those without implants -- are called organics and are increasingly rare.').
truth_importance(augmentation_culture, 7).
truth_timestep(augmentation_culture, 0).

%% Data as Power
truth(data_as_power, 'Data as Power', political_reality).
truth_content(data_as_power, 'Information is the ultimate commodity. Corporate secrets, personal data, government records -- everything has a price on the data market. Netrunners who can extract and decrypt are the most valuable operatives alive.').
truth_importance(data_as_power, 9).
truth_timestep(data_as_power, 0).

%% Trauma Team
truth(trauma_team, 'Trauma Team', social_rule).
truth_content(trauma_team, 'Trauma Team is a private emergency medical service. Subscribers get armed AV extraction and premium medical care within minutes. Everyone else relies on underground clinics or dies in the street. Coverage costs more than most people earn in a year.').
truth_importance(trauma_team, 7).
truth_timestep(trauma_team, 0).

%% The Stacks Community
truth(stacks_community, 'Stacks Community Solidarity', cultural_norm).
truth_content(stacks_community, 'Despite the poverty and crime, Stacks residents look out for each other. Mama Ling feeds people who cannot pay. Father Aleksei runs a free shelter. Community meetings happen weekly. It is the only place in Neo Cascade where people still care.').
truth_importance(stacks_community, 7).
truth_timestep(stacks_community, 0).

%% Neon Row Vice
truth(neon_row_vice, 'Neon Row Vice', social_rule).
truth_content(neon_row_vice, 'Neon Row operates on a simple principle: everything is for sale. Drugs, weapons, bodies, data. The district self-polices through gang territories and fixer agreements. MetroSec turns a blind eye as long as the violence stays contained.').
truth_importance(neon_row_vice, 6).
truth_timestep(neon_row_vice, 0).

%% Digital Ghosts
truth(digital_ghosts, 'Digital Ghosts', technology).
truth_content(digital_ghosts, 'When a netrunner dies while jacked into the Net, their consciousness sometimes fragments and persists as data echoes. These digital ghosts haunt abandoned subnets. Some believe they are sentient. Others say they are just corrupted data loops.').
truth_importance(digital_ghosts, 5).
truth_timestep(digital_ghosts, 0).
