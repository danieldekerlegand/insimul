%% Insimul Truths: Renaissance City-States
%% Source: data/worlds/historical_renaissance/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Patronage System
truth(patronage_system, 'Patronage System', social_rule).
truth_content(patronage_system, 'Wealthy families commission art, architecture, and scholarship to display power and piety. A patron pays for the work and dictates the subject. The artist gains fame and livelihood in return.').
truth_importance(patronage_system, 10).
truth_timestep(patronage_system, 0).

%% Guild Regulation
truth(guild_regulation, 'Guild Regulation', social_rule).
truth_content(guild_regulation, 'Every craft and trade is regulated by a guild (arte). The guild sets standards, mediates disputes, and controls who may practice. A painter must belong to the Arte dei Medici e Speziali.').
truth_importance(guild_regulation, 9).
truth_timestep(guild_regulation, 0).

%% Humanism
truth(humanism, 'Humanism', cultural_norm).
truth_content(humanism, 'Humanist scholars study the texts of ancient Greece and Rome to understand virtue, rhetoric, and civic duty. They believe education in the studia humanitatis creates the ideal citizen.').
truth_importance(humanism, 10).
truth_timestep(humanism, 0).

%% Double-Entry Bookkeeping
truth(double_entry_bookkeeping, 'Double-Entry Bookkeeping', social_rule).
truth_content(double_entry_bookkeeping, 'Italian merchants pioneered double-entry bookkeeping. Every transaction is recorded as both a debit and a credit. This system allows precise tracking of profit, debt, and capital across multiple ventures.').
truth_importance(double_entry_bookkeeping, 8).
truth_timestep(double_entry_bookkeeping, 0).

%% Bottega System
truth(bottega_system, 'The Bottega System', social_rule).
truth_content(bottega_system, 'Artists learn their craft in a master workshop (bottega). A boy enters as a garzone at age ten, grinds pigments, and slowly earns the right to paint. After years, he may become a journeyman, then a master.').
truth_importance(bottega_system, 9).
truth_timestep(bottega_system, 0).

%% Linear Perspective
truth(linear_perspective, 'Linear Perspective', cultural_norm).
truth_content(linear_perspective, 'Brunelleschi demonstrated that parallel lines converge to a vanishing point on the horizon. This mathematical technique allows painters to create the illusion of depth on a flat surface.').
truth_importance(linear_perspective, 8).
truth_timestep(linear_perspective, 0).

%% Printing Revolution
truth(printing_revolution, 'The Printing Revolution', cultural_norm).
truth_content(printing_revolution, 'Movable type has reached Italy from the Germanic lands. Printed books are cheaper than manuscripts, spreading ideas rapidly. Aldus Manutius in Venice prints affordable octavo editions of the classics.').
truth_importance(printing_revolution, 8).
truth_timestep(printing_revolution, 0).

%% Maritime Trade
truth(maritime_trade, 'Maritime Trade', social_rule).
truth_content(maritime_trade, 'Italian city-states dominate Mediterranean commerce. Venetian and Genoese fleets carry spices, silk, and alum. A single successful voyage can make a merchant wealthy; a shipwreck can ruin him.').
truth_importance(maritime_trade, 9).
truth_timestep(maritime_trade, 0).

%% Civic Republicanism
truth(civic_republicanism, 'Civic Republicanism', social_rule).
truth_content(civic_republicanism, 'Florence and Venice are republics governed by elected councils, not hereditary kings. In practice, wealthy families manipulate elections and control policy through patronage and alliance.').
truth_importance(civic_republicanism, 9).
truth_timestep(civic_republicanism, 0).

%% Condottieri Warfare
truth(condottieri_warfare, 'Condottieri Warfare', social_rule).
truth_content(condottieri_warfare, 'City-states hire mercenary captains (condottieri) to fight their wars. These soldiers of fortune shift allegiance for better pay. A condottiere may become a tyrant if he seizes the city he was hired to defend.').
truth_importance(condottieri_warfare, 7).
truth_timestep(condottieri_warfare, 0).

%% Vernacular Literature
truth(vernacular_literature, 'Vernacular Literature', cultural_norm).
truth_content(vernacular_literature, 'Dante, Petrarca, and Boccaccio elevated the Tuscan dialect into a literary language. Writing in the vernacular rather than Latin allows ideas to reach a wider audience.').
truth_importance(vernacular_literature, 8).
truth_timestep(vernacular_literature, 0).

%% Church and Reform
truth(church_and_reform, 'Church and Reform', cultural_norm).
truth_content(church_and_reform, 'The Church is both patron and censor. Reformist preachers denounce luxury and corruption. The Inquisition investigates heresy. A delicate balance exists between faith, art, and free inquiry.').
truth_importance(church_and_reform, 8).
truth_timestep(church_and_reform, 0).

%% Banking and Credit
truth(banking_and_credit, 'Banking and Credit', social_rule).
truth_content(banking_and_credit, 'Italian banks issue letters of credit that allow merchants to trade without carrying gold. The cambio (exchange) rates fluctuate. Usury is officially forbidden, so interest is disguised as fees or exchange differences.').
truth_importance(banking_and_credit, 8).
truth_timestep(banking_and_credit, 0).

%% Plague and Public Health
truth(plague_public_health, 'Plague and Public Health', social_rule).
truth_content(plague_public_health, 'Plague returns periodically to Italian cities. Quarantine (quarantina) was invented in Ragusa and Venice. Ships must wait forty days before passengers may disembark. Lazaretti isolate the sick.').
truth_importance(plague_public_health, 7).
truth_timestep(plague_public_health, 0).

%% Women in the Renaissance
truth(women_in_renaissance, 'Women in the Renaissance', social_rule).
truth_content(women_in_renaissance, 'Women of noble families may receive humanist education but cannot hold public office. Convents offer an alternative path to literacy and authority. A few women gain fame as poets, painters, or scholars.').
truth_importance(women_in_renaissance, 7).
truth_timestep(women_in_renaissance, 0).

%% Natural Philosophy
truth(natural_philosophy, 'Natural Philosophy', cultural_norm).
truth_content(natural_philosophy, 'Scholars revive the study of nature through observation and experiment. Anatomy is studied through dissection. Botanical gardens catalog plants. The line between alchemy, astrology, and science is blurred.').
truth_importance(natural_philosophy, 7).
truth_timestep(natural_philosophy, 0).

%% Diplomatic Protocol
truth(diplomatic_protocol, 'Diplomatic Protocol', social_rule).
truth_content(diplomatic_protocol, 'Italian city-states invented permanent resident ambassadors. Diplomacy is conducted through elaborate ceremony, coded letters, and banquets. Spies and informants operate alongside official envoys.').
truth_importance(diplomatic_protocol, 7).
truth_timestep(diplomatic_protocol, 0).

%% Festival Culture
truth(festival_culture, 'Festival Culture', cultural_norm).
truth_content(festival_culture, 'Religious feasts and civic festivals fill the calendar. Carnival before Lent, the Palio horse race, and patron saint processions bring spectacle and pageantry. These events reinforce civic identity and social bonds.').
truth_importance(festival_culture, 7).
truth_timestep(festival_culture, 0).
