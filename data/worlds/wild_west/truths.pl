%% Insimul Truths: Wild West -- Redemption Gulch
%% Source: data/worlds/wild_west/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% The Code of the West
truth(code_of_the_west, 'The Code of the West', cultural_norm).
truth_content(code_of_the_west, 'An unwritten code governs frontier life: a man is only as good as his word, you never shoot an unarmed man, and hospitality to strangers is expected. Breaking the code earns lasting distrust.').
truth_importance(code_of_the_west, 10).
truth_timestep(code_of_the_west, 0).

%% Frontier Justice
truth(frontier_justice, 'Frontier Justice', social_rule).
truth_content(frontier_justice, 'Federal law is distant and slow. The sheriff is the primary authority in Redemption Gulch. When the law fails, townsfolk sometimes take matters into their own hands. Lynch mobs are a constant danger.').
truth_importance(frontier_justice, 9).
truth_timestep(frontier_justice, 0).

%% Gold Rush Fever
truth(gold_rush_fever, 'Gold Rush Fever', economic_truth).
truth_content(gold_rush_fever, 'The discovery of silver at Copper Ridge has drawn prospectors, miners, and fortune seekers from across the country. Most will find only hardship. A few will strike it rich. All will change the territory forever.').
truth_importance(gold_rush_fever, 9).
truth_timestep(gold_rush_fever, 0).

%% Railroad Expansion
truth(railroad_expansion, 'Railroad Expansion', economic_truth).
truth_content(railroad_expansion, 'The railroad is pushing west. Cornelius Thorne wants to extend a spur line through Redemption Gulch. This would bring prosperity but also outside control. Ranchers fear losing their open range to rail corridors.').
truth_importance(railroad_expansion, 9).
truth_timestep(railroad_expansion, 0).

%% Saloon Culture
truth(saloon_culture, 'Saloon Culture', cultural_norm).
truth_content(saloon_culture, 'The saloon is the social heart of any frontier town. It serves as bar, gambling hall, meeting place, and sometimes courtroom. Information flows freely over whiskey. Ruby Callahan hears everything.').
truth_importance(saloon_culture, 8).
truth_timestep(saloon_culture, 0).

%% Gun Law
truth(gun_law, 'Gun Law', social_rule).
truth_content(gun_law, 'Most men carry sidearms on the frontier. Sheriff Holden requires firearms be checked at the door of certain establishments. Dueling is technically illegal but still happens. A fast draw can save your life.').
truth_importance(gun_law, 8).
truth_timestep(gun_law, 0).

%% Cattle is Currency
truth(cattle_is_currency, 'Cattle is Currency', economic_truth).
truth_content(cattle_is_currency, 'On the frontier, cattle are as good as gold. A healthy herd means wealth and influence. Cattle rustling is one of the most serious crimes -- often punished by hanging without trial.').
truth_importance(cattle_is_currency, 8).
truth_timestep(cattle_is_currency, 0).

%% The Telegraph
truth(the_telegraph, 'The Telegraph', technological_truth).
truth_content(the_telegraph, 'The telegraph connects Redemption Gulch to the outside world. Messages travel in hours instead of weeks. The telegraph office is a vital link to federal authorities, distant family, and business contacts.').
truth_importance(the_telegraph, 7).
truth_timestep(the_telegraph, 0).

%% Water Rights
truth(water_rights, 'Water Rights', economic_truth).
truth_content(water_rights, 'In the arid West, water is more valuable than gold. Whoever controls the water controls the land. Disputes over creek access and well rights have led to feuds and even killings.').
truth_importance(water_rights, 8).
truth_timestep(water_rights, 0).

%% Sunday Rest
truth(sunday_rest, 'Sunday Rest', cultural_norm).
truth_content(sunday_rest, 'Sunday is a day of rest in Redemption Gulch. Most businesses close except the saloon. Reverend Crane holds services at the church. Even outlaws tend to respect the Sunday peace.').
truth_importance(sunday_rest, 6).
truth_timestep(sunday_rest, 0).

%% Outlaw Gangs
truth(outlaw_gangs, 'Outlaw Gangs', social_rule).
truth_content(outlaw_gangs, 'The Ketchum gang operates out of the hills near Copper Ridge. They rob stagecoaches, rustle cattle, and have been eyeing the bank in town. A bounty of 500 dollars is on Jack Ketchum dead or alive.').
truth_importance(outlaw_gangs, 9).
truth_timestep(outlaw_gangs, 0).

%% Mining Dangers
truth(mining_dangers, 'Mining Dangers', world_truth).
truth_content(mining_dangers, 'Silver mining at Copper Ridge is dangerous work. Cave-ins, bad air, and dynamite accidents claim lives regularly. Miners work long shifts for modest pay. Mae Li keeps them as safe as anyone can.').
truth_importance(mining_dangers, 7).
truth_timestep(mining_dangers, 0).

%% Stagecoach Routes
truth(stagecoach_routes, 'Stagecoach Routes', world_truth).
truth_content(stagecoach_routes, 'The Overland Stage runs twice weekly through Redemption Gulch, connecting the town to the wider territory. Stagecoach routes are prime targets for outlaws. Armed guards ride shotgun on every run.').
truth_importance(stagecoach_routes, 7).
truth_timestep(stagecoach_routes, 0).

%% Blacksmith Trade
truth(blacksmith_trade, 'Blacksmith Trade', economic_truth).
truth_content(blacksmith_trade, 'The blacksmith is essential to frontier life. Chen Wei at Iron Will Forge shoes horses, repairs tools, and forges everything from nails to wagon rims. Without a smith, a town cannot survive.').
truth_importance(blacksmith_trade, 6).
truth_timestep(blacksmith_trade, 0).

%% Boarding House Gossip
truth(boarding_house_gossip, 'Boarding House Gossip', social_rule).
truth_content(boarding_house_gossip, 'Lottie Briggs runs the boarding house at the Grand Western Hotel. She knows every stranger who comes to town, what they carry, and where they are headed. Information is her real currency.').
truth_importance(boarding_house_gossip, 7).
truth_timestep(boarding_house_gossip, 0).

%% Native Territories
truth(native_territories, 'Native Territories', world_truth).
truth_content(native_territories, 'The land around Redemption Gulch was taken from indigenous peoples. Treaties have been broken repeatedly. Some townsfolk trade peacefully with nearby nations, while others seek to push them further away.').
truth_importance(native_territories, 8).
truth_timestep(native_territories, 0).

%% Doctors are Scarce
truth(doctors_are_scarce, 'Doctors are Scarce', world_truth).
truth_content(doctors_are_scarce, 'Doc Whitfield is the only trained physician within a hundred miles. Medicine on the frontier is limited -- laudanum for pain, whiskey for surgery, and hope for everything else. His wife Abigail assists with all procedures.').
truth_importance(doctors_are_scarce, 7).
truth_timestep(doctors_are_scarce, 0).

%% Newspaper Power
truth(newspaper_power, 'Newspaper Power', social_rule).
truth_content(newspaper_power, 'The Redemption Gazette is the only printed news in the territory. Eustace Polk wields real influence through what he chooses to print. A favorable article can make a reputation; an unfavorable one can destroy it.').
truth_importance(newspaper_power, 7).
truth_timestep(newspaper_power, 0).
