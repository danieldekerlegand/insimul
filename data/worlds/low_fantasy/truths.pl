%% Insimul Truths: Low Fantasy
%% Source: data/worlds/low_fantasy/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Magic is Rare and Mistrusted
truth(magic_mistrusted, 'Magic is Rare and Mistrusted', world_fact).
truth_content(magic_mistrusted, 'Magic exists but is rare, unreliable, and feared. Hedge witches brew potions that might work. Old charms might ward off evil. But no one throws fireballs. Those accused of witchcraft are hanged at Gallows Square.').
truth_importance(magic_mistrusted, 10).
truth_timestep(magic_mistrusted, 0).

%% The Iron Duchies
truth(iron_duchies, 'The Iron Duchies', world_fact).
truth_content(iron_duchies, 'The land is ruled by feuding duchies whose lords care nothing for common folk. Taxes bleed villages dry. Justice depends on who can pay for it. The nearest duke has not visited the Ashenmarch in years.').
truth_importance(iron_duchies, 9).
truth_timestep(iron_duchies, 0).

%% Coin is Everything
truth(coin_is_everything, 'Coin is Everything', social_rule).
truth_content(coin_is_everything, 'In the Ashenmarch, survival is transactional. Food, shelter, safety, and silence all have a price. Those without coin beg, steal, or starve. Loyalty lasts exactly as long as the purse that buys it.').
truth_importance(coin_is_everything, 9).
truth_timestep(coin_is_everything, 0).

%% The Smuggler Economy
truth(smuggler_economy, 'The Smuggler Economy', social_rule).
truth_content(smuggler_economy, 'The duke taxes salt, iron, and cloth so heavily that smuggling is the only way most people can afford them. Saltmire exists solely because of the contraband trade. Everyone knows. No one reports it.').
truth_importance(smuggler_economy, 8).
truth_timestep(smuggler_economy, 0).

%% The Silted River
truth(silted_river, 'The Silted River', world_fact).
truth_content(silted_river, 'The River Ashenmire that once made Grimhallow prosperous has silted over. Trade barges no longer come. The town is slowly dying. Those who stay do so because they cannot afford to leave.').
truth_importance(silted_river, 8).
truth_timestep(silted_river, 0).

%% Mercenary Companies
truth(mercenary_companies, 'Mercenary Companies', world_fact).
truth_content(mercenary_companies, 'With no standing army in the region, mercenary companies fill the gap. Captain Jorik Hale and his Iron Thorn Company guard Thornfield for payment. If the coin stops, so does the protection.').
truth_importance(mercenary_companies, 8).
truth_timestep(mercenary_companies, 0).

%% The Bailiff is Corrupt
truth(bailiff_corrupt, 'The Bailiff is Corrupt', social_rule).
truth_content(bailiff_corrupt, 'Bailiff Wren collects taxes for the duke and keeps a generous portion. He sells justice to the highest bidder and punishes those who cannot pay. Everyone hates him. No one can remove him without the dukes authority.').
truth_importance(bailiff_corrupt, 8).
truth_timestep(bailiff_corrupt, 0).

%% The Gallows Justice
truth(gallows_justice, 'Gallows Justice', social_rule).
truth_content(gallows_justice, 'Crimes in Grimhallow are punished at Gallows Square. Hanging for theft, the stocks for drunkenness, branding for forgery. Trials are short. Evidence is optional. The bailiff decides guilt.').
truth_importance(gallows_justice, 7).
truth_timestep(gallows_justice, 0).

%% Frontier Dangers
truth(frontier_dangers, 'Frontier Dangers', world_fact).
truth_content(frontier_dangers, 'Beyond Thornfield lies wilderness. Wolves, bandits, and worse prey on travelers. The old roads are crumbling. No one travels alone after dark. Even armed companies move cautiously through the frontier.').
truth_importance(frontier_dangers, 7).
truth_timestep(frontier_dangers, 0).

%% The Ashen Saint
truth(ashen_saint, 'The Ashen Saint', world_fact).
truth_content(ashen_saint, 'The Chapel of the Ashen Saint in Grimhallow was once a pilgrimage site. The saint supposedly performed miracles. The chapel is now abandoned and Sister Ashara, its last keeper, was defrocked for heresy. She stays anyway.').
truth_importance(ashen_saint, 7).
truth_timestep(ashen_saint, 0).

%% No One Trusts Anyone
truth(universal_mistrust, 'No One Trusts Anyone', social_rule).
truth_content(universal_mistrust, 'Trust is a luxury no one can afford. Allies betray for coin. Friends inform for favour. Every deal has a hidden angle. The wise assume everyone is lying until proven otherwise, and even then keep one hand on their purse.').
truth_importance(universal_mistrust, 9).
truth_timestep(universal_mistrust, 0).

%% Debt Bondage
truth(debt_bondage, 'Debt Bondage', social_rule).
truth_content(debt_bondage, 'Those who cannot pay their debts are sold into bonded labour. Aldric Copperton owes money to both Roderick Blackthorn and Bailiff Wren. Escape from debt bondage requires either repayment or disappearance.').
truth_importance(debt_bondage, 7).
truth_timestep(debt_bondage, 0).

%% The Old Roads
truth(old_roads, 'The Old Roads', world_fact).
truth_content(old_roads, 'Ancient roads built by a forgotten empire cross the Ashenmarch. They are crumbling but still the safest routes. Ruins along the roads are sometimes explored for treasure, though many explorers never return.').
truth_importance(old_roads, 6).
truth_timestep(old_roads, 0).

%% Healing is Scarce
truth(healing_scarce, 'Healing is Scarce', world_fact).
truth_content(healing_scarce, 'Brenna Ashwood is the only trained healer for miles. Her potions work, mostly. Her knowledge of forbidden herbs draws suspicion. If she were ever accused of witchcraft, Thornfield would have no healer at all.').
truth_importance(healing_scarce, 8).
truth_timestep(healing_scarce, 0).

%% Salt as Currency
truth(salt_currency, 'Salt as Currency', social_rule).
truth_content(salt_currency, 'Taxed salt is so expensive that smuggled salt functions as informal currency in the Ashenmarch. A sack of salt can buy a week of labour, a warm bed, or a favour from the right person.').
truth_importance(salt_currency, 7).
truth_timestep(salt_currency, 0).

%% Oaths are Binding
truth(oaths_binding, 'Oaths are Binding', social_rule).
truth_content(oaths_binding, 'Despite the general mistrust, a sworn oath before witnesses carries weight. Breaking an oath brands a person as worthless. Even criminals honour sworn deals, because no one will do business with an oathbreaker.').
truth_importance(oaths_binding, 7).
truth_timestep(oaths_binding, 0).

%% The Missing Noble
truth(missing_noble, 'The Missing Noble', world_fact).
truth_content(missing_noble, 'Lord Edric Vane, last of a dispossessed noble house, hides among the smugglers of Saltmire. His family was destroyed by a rival duke. He carries the last proof of his lineage and dreams of reclaiming his title.').
truth_importance(missing_noble, 7).
truth_timestep(missing_noble, 0).

%% Winter is Coming
truth(winter_threat, 'Winter is Coming', world_fact).
truth_content(winter_threat, 'The Ashenmarch winter kills. Frozen rivers, blocked roads, and starving wolves drive people indoors for months. Those without stored food, fuel, and shelter die. Preparing for winter is the single greatest concern of every settlement.').
truth_importance(winter_threat, 8).
truth_timestep(winter_threat, 0).
