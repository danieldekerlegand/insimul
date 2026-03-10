confident(someone) :- rival(someone). % Rival is always confident
closeness(y, z, +, 10) :- self_involved(x), love(y), self_involved(z). % Love is repulsed by self indulged people
closeness(victim, someone_else, +, 10) :- romantic_failure(would_be_lover, victim), romantic_failure(someone_else, victim). % People are repulsed when they are the recipients of romantic failures
gobsmacked(other), affinity(other, someone, 100) :- charisma(someone, >, 75), charming(someone), beautiful(someone), male(other), female(someone), rich(other), sensitiveness(other, >, 50). % A rich person falls in love with beautiful, charming, charismatic women
affinity(someone, other, -, 10) :- romantic(someone), self_involved(someone), self_involved(other). % Romantics are repulsed by self-indulgent people
affinity(other, someone, -, 10) :- romantic_failure(someone, other). % People are repulsed when they are the recipients of romantic failures