%% Insimul Truths: Historical Victorian
%% Source: data/worlds/historical_victorian/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Social Class Hierarchy
truth(class_hierarchy, 'Social Class Hierarchy', social_rule).
truth_content(class_hierarchy, 'Victorian society is rigidly stratified. The aristocracy own land and wield political power. The new industrial middle class have money but lack breeding. The working poor labour in factories and mines. Movement between classes is rare and fraught with judgment.').
truth_importance(class_hierarchy, 10).
truth_timestep(class_hierarchy, 0).

%% Propriety and Reputation
truth(propriety_reputation, 'Propriety and Reputation', social_rule).
truth_content(propriety_reputation, 'Reputation is everything. A scandal can ruin a family overnight. Women bear the heaviest burden of propriety -- a single indiscretion destroys their social standing permanently while men are afforded greater latitude.').
truth_importance(propriety_reputation, 9).
truth_timestep(propriety_reputation, 0).

%% The Factory System
truth(factory_system, 'The Factory System', world_fact).
truth_content(factory_system, 'Factories run from dawn to dusk, six days a week. Workers including children as young as six operate dangerous machinery for subsistence wages. Factory owners answer to no one but the market and their shareholders.').
truth_importance(factory_system, 9).
truth_timestep(factory_system, 0).

%% Servant Hierarchy
truth(servant_hierarchy, 'Servant Hierarchy', social_rule).
truth_content(servant_hierarchy, 'Great houses maintain strict servant hierarchies. The butler and housekeeper hold authority over footmen, maids, cooks, and scullery staff. Servants are expected to be invisible and silent. Familiarity with the master class is forbidden.').
truth_importance(servant_hierarchy, 8).
truth_timestep(servant_hierarchy, 0).

%% The British Empire
truth(british_empire, 'The British Empire', world_fact).
truth_content(british_empire, 'Britain rules a quarter of the globe. The empire brings wealth, exotic goods, and a sense of racial superiority to the homeland. Colonial exploitation is celebrated as civilizing the lesser races. Dissent is considered unpatriotic.').
truth_importance(british_empire, 8).
truth_timestep(british_empire, 0).

%% Calling Card Etiquette
truth(calling_card_etiquette, 'Calling Card Etiquette', cultural_norm).
truth_content(calling_card_etiquette, 'Social visits follow strict protocol. One leaves a calling card with the butler. The lady of the house decides whether to receive the visitor. Turning down a corner of the card signals a personal visit rather than a formal one.').
truth_importance(calling_card_etiquette, 7).
truth_timestep(calling_card_etiquette, 0).

%% The Workhouse
truth(workhouse_system, 'The Workhouse', world_fact).
truth_content(workhouse_system, 'The workhouse is the last resort for the destitute. Conditions are deliberately harsh to deter the idle poor. Families are separated. Inmates break stones, pick oakum, and survive on gruel. Leaving is nearly impossible without outside help.').
truth_importance(workhouse_system, 8).
truth_timestep(workhouse_system, 0).

%% Steam Power
truth(steam_power, 'Steam Power', world_fact).
truth_content(steam_power, 'The steam engine has transformed industry and transport. Railways connect cities that were once days apart. Steam-powered looms and hammers produce goods at a scale unimaginable a generation ago. The cost is pollution, danger, and human misery.').
truth_importance(steam_power, 8).
truth_timestep(steam_power, 0).

%% Mourning Customs
truth(mourning_customs, 'Mourning Customs', cultural_norm).
truth_content(mourning_customs, 'Death follows elaborate ritual. Widows wear black for two years. Mourning jewellery made from jet or the hair of the deceased is common. Mirrors are covered, clocks stopped at the hour of death. The poor can rarely afford such observances.').
truth_importance(mourning_customs, 7).
truth_timestep(mourning_customs, 0).

%% The Opium Trade
truth(opium_trade, 'The Opium Trade', world_fact).
truth_content(opium_trade, 'Opium is legal and widely available as laudanum. The empire fights wars to force China to buy Indian opium. In the docklands, opium dens serve sailors and the desperate. Addiction crosses class lines but is only shameful among the poor.').
truth_importance(opium_trade, 7).
truth_timestep(opium_trade, 0).

%% Womens Suffrage
truth(womens_suffrage, 'The Question of Womens Suffrage', social_rule).
truth_content(womens_suffrage, 'Women cannot vote, own property after marriage, or enter most professions. A growing movement demands change. Activists face ridicule, arrest, and social ostracism. The idea that women are intellectually equal to men is still considered radical.').
truth_importance(womens_suffrage, 8).
truth_timestep(womens_suffrage, 0).

%% The Season
truth(the_season, 'The London Season', cultural_norm).
truth_content(the_season, 'Each spring and summer, the aristocracy descend on London for the Season: balls, dinners, horse races, and exhibitions. The primary purpose is matchmaking. Young women are presented at court in hopes of securing advantageous marriages.').
truth_importance(the_season, 7).
truth_timestep(the_season, 0).

%% Child Labour
truth(child_labour, 'Child Labour', world_fact).
truth_content(child_labour, 'Children work in mills, mines, and as chimney sweeps. The Factory Acts have set some limits but enforcement is weak. Orphans and workhouse children are sold as apprentices to masters who may work them to death.').
truth_importance(child_labour, 9).
truth_timestep(child_labour, 0).

%% Gaslight and Fog
truth(gaslight_fog, 'Gaslight and Fog', world_fact).
truth_content(gaslight_fog, 'City streets are lit by gas lamps that cast a dim yellow glow. Coal smoke combines with river mist to create thick, choking fogs called pea-soupers. Visibility drops to a few feet. Crime thrives in the murk.').
truth_importance(gaslight_fog, 6).
truth_timestep(gaslight_fog, 0).

%% Trade Unions
truth(trade_unions, 'Trade Unions', social_rule).
truth_content(trade_unions, 'Workers are beginning to organize into trade unions to demand better pay and conditions. Factory owners respond with lockouts and blacklists. Union organizers risk imprisonment and violence. Strikes can starve an entire community.').
truth_importance(trade_unions, 8).
truth_timestep(trade_unions, 0).

%% The Gentleman Code
truth(gentleman_code, 'The Gentleman Code', cultural_norm).
truth_content(gentleman_code, 'A gentleman is known by his conduct: he keeps his word, pays his debts, and defends his honour. He does not work with his hands. He tips his hat to ladies and never discusses money in polite company. Violations invite social death.').
truth_importance(gentleman_code, 7).
truth_timestep(gentleman_code, 0).

%% Disease and Medicine
truth(disease_medicine, 'Disease and Medicine', world_fact).
truth_content(disease_medicine, 'Cholera, typhus, and tuberculosis are endemic. Germ theory is new and controversial. Many doctors still rely on bloodletting and mercury. Surgery is performed without antiseptic. The poor die in droves while the wealthy retreat to country estates.').
truth_importance(disease_medicine, 8).
truth_timestep(disease_medicine, 0).

%% The Railway
truth(the_railway, 'The Railway', world_fact).
truth_content(the_railway, 'The railway has collapsed distance. Towns that took days to reach by coach are now hours away. Railways bring prosperity to some towns and ruin to others bypassed by the lines. Railway companies are the most powerful corporations in the empire.').
truth_importance(the_railway, 7).
truth_timestep(the_railway, 0).
