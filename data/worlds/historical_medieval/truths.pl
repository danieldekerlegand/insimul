%% Insimul Truths: Historical Medieval Europe
%% Source: data/worlds/historical_medieval/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Feudal Order
truth(feudal_order, 'Feudal Order', social_rule).
truth_content(feudal_order, 'Society is organized in a strict hierarchy: king, duke, baron, knight, freeman, serf. Each tier owes service to the one above and receives protection in return. Land is granted in exchange for military obligation.').
truth_importance(feudal_order, 10).
truth_timestep(feudal_order, 0).

%% Code of Chivalry
truth(code_of_chivalry, 'Code of Chivalry', cultural_norm).
truth_content(code_of_chivalry, 'Knights are bound by an unwritten code: defend the weak, honor your lord, show mercy to the vanquished, protect the Church, and uphold justice. In practice, these ideals are often bent to serve ambition.').
truth_importance(code_of_chivalry, 9).
truth_timestep(code_of_chivalry, 0).

%% The Church Dominates
truth(church_dominance, 'The Church Dominates', social_rule).
truth_content(church_dominance, 'The Catholic Church is the single most powerful institution. It controls education, records births and deaths, collects tithes, and can excommunicate kings. Latin is the language of scripture and law.').
truth_importance(church_dominance, 10).
truth_timestep(church_dominance, 0).

%% Serfdom
truth(serfdom, 'Serfdom', social_rule).
truth_content(serfdom, 'Most peasants are serfs bound to the land. They cannot leave the manor without permission, must work the demesne fields, and owe a portion of their harvest to the lord. Freedom is rarely granted.').
truth_importance(serfdom, 9).
truth_timestep(serfdom, 0).

%% Trial by Ordeal
truth(trial_by_ordeal, 'Trial by Ordeal', social_rule).
truth_content(trial_by_ordeal, 'Justice is often determined through divine judgment: carrying hot iron, plunging a hand into boiling water, or combat between accuser and accused. God is believed to protect the innocent.').
truth_importance(trial_by_ordeal, 7).
truth_timestep(trial_by_ordeal, 0).

%% Manor Economy
truth(manor_economy, 'Manor Economy', social_rule).
truth_content(manor_economy, 'The manor is the basic economic unit. It is largely self-sufficient, producing its own food, clothing, and tools. Surplus is traded at market towns. Coin is scarce among common folk.').
truth_importance(manor_economy, 8).
truth_timestep(manor_economy, 0).

%% Pilgrimage
truth(pilgrimage_tradition, 'Pilgrimage', cultural_norm).
truth_content(pilgrimage_tradition, 'Pilgrimage to holy shrines — Canterbury, Rome, Jerusalem — is both a spiritual duty and a rare chance to travel. Pilgrims receive special legal protections and often carry badges as proof of their journey.').
truth_importance(pilgrimage_tradition, 7).
truth_timestep(pilgrimage_tradition, 0).

%% Guilds and Craft
truth(guild_system, 'Guilds and Craft', social_rule).
truth_content(guild_system, 'Craftsmen organize into guilds that control quality, set prices, and regulate apprenticeships. A youth serves seven years as apprentice, becomes a journeyman, and may eventually earn the title of master.').
truth_importance(guild_system, 8).
truth_timestep(guild_system, 0).

%% Tournament Culture
truth(tournament_culture, 'Tournament Culture', cultural_norm).
truth_content(tournament_culture, 'Tournaments are the great spectacles of noble life. Knights joust for honor, ransom defeated opponents for profit, and display their heraldry. Ladies offer favors — a ribbon or sleeve — to their champion.').
truth_importance(tournament_culture, 7).
truth_timestep(tournament_culture, 0).

%% Tithe Obligation
truth(tithe_obligation, 'Tithe Obligation', social_rule).
truth_content(tithe_obligation, 'Every person owes a tenth of their income to the Church. Failure to pay the tithe brings spiritual penalties and social shame. The tithe barn is a central feature of every parish.').
truth_importance(tithe_obligation, 8).
truth_timestep(tithe_obligation, 0).

%% Latin as Sacred Tongue
truth(latin_sacred, 'Latin as Sacred Tongue', cultural_norm).
truth_content(latin_sacred, 'Latin is the language of the Church, law, and learning. The mass is conducted entirely in Latin. Common folk understand little of it, relying on priests to interpret scripture and decrees.').
truth_importance(latin_sacred, 8).
truth_timestep(latin_sacred, 0).

%% Monastic Life
truth(monastic_life, 'Monastic Life', cultural_norm).
truth_content(monastic_life, 'Monks follow the Rule of St. Benedict: pray eight times daily, labor in fields or scriptorium, eat in silence, and sleep in a common dormitory. Monasteries are centers of literacy, medicine, and brewing.').
truth_importance(monastic_life, 8).
truth_timestep(monastic_life, 0).

%% Heraldry
truth(heraldry_system, 'Heraldry', cultural_norm).
truth_content(heraldry_system, 'Every noble house bears a coat of arms that identifies them in battle and at tournament. The arms are inherited by the eldest son. Heralds enforce the rules and settle disputes over who may bear which device.').
truth_importance(heraldry_system, 6).
truth_timestep(heraldry_system, 0).

%% The Three Estates
truth(three_estates, 'The Three Estates', social_rule).
truth_content(three_estates, 'Medieval society is divided into three estates: those who pray (clergy), those who fight (nobility), and those who work (peasants). Each estate has distinct rights, obligations, and legal standing.').
truth_importance(three_estates, 9).
truth_timestep(three_estates, 0).

%% Forest Law
truth(forest_law, 'Forest Law', social_rule).
truth_content(forest_law, 'Royal forests are reserved for the king and his nobles. Peasants caught hunting deer or boar face blinding, mutilation, or death. Gathering firewood and foraging acorns may be permitted by local custom.').
truth_importance(forest_law, 7).
truth_timestep(forest_law, 0).

%% Women and Property
truth(women_and_property, 'Women and Property', social_rule).
truth_content(women_and_property, 'Women cannot hold most offices or inherit land equally. A widow may control her dower lands, and abbesses wield real authority, but most women are defined legally through their fathers or husbands.').
truth_importance(women_and_property, 7).
truth_timestep(women_and_property, 0).

%% Plague and Pestilence
truth(plague_pestilence, 'Plague and Pestilence', social_rule).
truth_content(plague_pestilence, 'Disease is understood as divine punishment. Leprosy leads to social exile. Epidemics can halve a population in months. Monasteries serve as the only hospitals, treating the sick with prayer and herbal remedies.').
truth_importance(plague_pestilence, 8).
truth_timestep(plague_pestilence, 0).

%% Oath and Fealty
truth(oath_and_fealty, 'Oath and Fealty', cultural_norm).
truth_content(oath_and_fealty, 'The oath of fealty is the binding contract of feudal life. A vassal kneels, places his hands between his lord''s, and swears loyalty unto death. Breaking this oath is the gravest of sins.').
truth_importance(oath_and_fealty, 9).
truth_timestep(oath_and_fealty, 0).
