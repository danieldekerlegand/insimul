%% Insimul Narratives: Modern Realistic
%% Source: data/worlds/modern_realistic/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_precondition/2, narrative_outcome/3

%% The Factory Redevelopment
narrative(factory_redevelopment, 'The Factory Redevelopment', economic).
narrative_description(factory_redevelopment, 'A developer proposes converting the old factory into luxury condos. Some residents see jobs and revenue. Others fear displacement and loss of character.').
narrative_trigger(factory_redevelopment, (status(maplewood, development_proposed))).
narrative_precondition(factory_redevelopment, (alive(frank_russo), alive(james_park))).
narrative_outcome(factory_redevelopment, approved, 'The condos are built. Property values rise but several long-time residents are priced out of the neighborhood.').
narrative_outcome(factory_redevelopment, rejected, 'The town votes it down. The factory remains vacant. Some businesses close due to lack of foot traffic.').
narrative_outcome(factory_redevelopment, compromise, 'A mixed-use plan is approved with affordable housing units and a community arts space.').

%% The River Crisis
narrative(river_crisis, 'The River Crisis', environmental).
narrative_description(river_crisis, 'Water testing reveals dangerous contamination levels in the river. The source is traced upstream. The town must decide how to respond.').
narrative_trigger(river_crisis, (status(riverside, contaminated))).
narrative_precondition(river_crisis, (alive(emma_chen), alive(sam_weaver))).
narrative_outcome(river_crisis, legal_action, 'The town sues the polluter. Years of litigation follow but the river is eventually cleaned up.').
narrative_outcome(river_crisis, grassroots, 'Emma Chen organizes a volunteer cleanup. Media attention shames the polluter into action.').
narrative_outcome(river_crisis, ignored, 'Officials downplay the issue. Health problems emerge years later. Trust in local government plummets.').

%% The Digital Divide
narrative(digital_divide, 'The Digital Divide', social).
narrative_description(digital_divide, 'Lakeside Heights gets fiber internet while Pinehurst barely has cell service. The gap between the two communities widens.').
narrative_trigger(digital_divide, (status(lakeside_heights, connected), status(pinehurst, underserved))).
narrative_precondition(digital_divide, (alive(david_chen), alive(ruth_weaver))).
narrative_outcome(digital_divide, bridged, 'David Chen helps secure a grant to extend broadband to rural areas. Digital literacy classes begin.').
narrative_outcome(digital_divide, widened, 'Rural residents lose access to services that move online. Young people leave Pinehurst for connected areas.').
narrative_outcome(digital_divide, community_mesh, 'Sam Weaver and local volunteers build a community mesh network as a stopgap solution.').

%% The Small Business Struggle
narrative(small_business_struggle, 'The Small Business Struggle', economic).
narrative_description(small_business_struggle, 'A chain store announces plans to open on the outskirts of Maplewood. Local businesses fear they cannot compete on price.').
narrative_trigger(small_business_struggle, (status(maplewood, chain_store_proposed))).
narrative_precondition(small_business_struggle, (alive(daniel_okafor), alive(tony_russo))).
narrative_outcome(small_business_struggle, resistance, 'Residents rally behind local shops. A buy-local campaign keeps most businesses afloat.').
narrative_outcome(small_business_struggle, adaptation, 'Daniel Okafor pivots his catering business to focus on specialty cuisine the chain cannot match.').
narrative_outcome(small_business_struggle, decline, 'Several shops close within a year. Main Street has vacant storefronts for the first time in decades.').

%% The Youth Exodus
narrative(youth_exodus, 'The Youth Exodus', social).
narrative_description(youth_exodus, 'Graduating seniors increasingly leave Maplewood for city opportunities. The town faces a talent drain that threatens its future.').
narrative_trigger(youth_exodus, (status(maplewood, population_declining))).
narrative_precondition(youth_exodus, (alive(jordan_bell), alive(maria_chen))).
narrative_outcome(youth_exodus, retained, 'New remote work opportunities and a revitalized downtown convince some young people to stay.').
narrative_outcome(youth_exodus, lost, 'The brain drain accelerates. The school loses enrollment. Services are cut.').
narrative_outcome(youth_exodus, returned, 'After struggling in the city, several graduates return and bring new perspectives and energy.').

%% The Health Fair
narrative(health_fair, 'The Health Fair Crisis', community).
narrative_description(health_fair, 'The annual health fair reveals that many uninsured residents have untreated conditions. Grace Okafor pushes for a community health clinic.').
narrative_trigger(health_fair, (status(maplewood, health_crisis))).
narrative_precondition(health_fair, (alive(grace_okafor), alive(maya_torres))).
narrative_outcome(health_fair, clinic_opened, 'A community health clinic opens with grant funding. Grace Okafor manages the nursing staff.').
narrative_outcome(health_fair, funding_denied, 'The grant application fails. Residents continue to rely on the emergency room for basic care.').
narrative_outcome(health_fair, holistic, 'Maya Torres integrates wellness programs with basic health screenings, creating a unique prevention-focused model.').
