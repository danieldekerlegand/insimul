%% Insimul Narratives: Modern Metropolitan
%% Source: data/worlds/modern_metropolitan/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3 -- narrative_step(NarrativeAtom, StepIndex, StepContent)
%%   narrative_tag/2

%% The Rent Crisis
narrative(the_rent_crisis, 'The Rent Crisis', social_drama).
narrative_description(the_rent_crisis, 'A wave of eviction notices hits the Warehouse District as a developer buys up buildings. Residents must organize or lose their homes.').
narrative_trigger(the_rent_crisis, event(eviction_wave)).
narrative_step(the_rent_crisis, 0, 'Residents of Dock Street receive eviction notices from a new property management company.').
narrative_step(the_rent_crisis, 1, 'Michael Smith and neighbors hold an emergency meeting at the community center.').
narrative_step(the_rent_crisis, 2, 'Mayor Johnson is pressured from both sides: developers and constituents.').
narrative_step(the_rent_crisis, 3, 'The player must choose whether to support the tenants, negotiate with the developer, or stay neutral.').
narrative_tag(the_rent_crisis, gentrification).
narrative_tag(the_rent_crisis, community).

%% Tech Disruption
narrative(tech_disruption, 'Tech Disruption', economic_drama).
narrative_description(tech_disruption, 'Chen Technologies announces a major expansion that will bring jobs but also accelerate displacement in surrounding neighborhoods.').
narrative_trigger(tech_disruption, event(corporate_expansion)).
narrative_step(tech_disruption, 0, 'David Chen announces a new campus that will double Chen Technologies footprint in the Financial District.').
narrative_step(tech_disruption, 1, 'Local businesses worry about rising commercial rents. Artists fear losing studio space.').
narrative_step(tech_disruption, 2, 'Maria Rodriguez organizes a protest at Spectrum Gallery.').
narrative_step(tech_disruption, 3, 'A public hearing at City Hall forces all stakeholders to state their positions.').
narrative_tag(tech_disruption, technology).
narrative_tag(tech_disruption, inequality).

%% Gallery Night
narrative(gallery_night, 'Gallery Night', cultural_event).
narrative_description(gallery_night, 'The Arts Quarter holds its annual gallery night, drawing crowds and media attention. Reputations are made and broken in a single evening.').
narrative_trigger(gallery_night, event(annual_gallery_night)).
narrative_step(gallery_night, 0, 'Posters appear across Metro City advertising the annual Arts Quarter Gallery Night.').
narrative_step(gallery_night, 1, 'Maria Rodriguez prepares her biggest exhibition yet at Spectrum Gallery.').
narrative_step(gallery_night, 2, 'A prominent art critic arrives, and their review could make or break careers.').
narrative_step(gallery_night, 3, 'An unexpected confrontation between an artist and a developer makes the evening news.').
narrative_tag(gallery_night, art).
narrative_tag(gallery_night, reputation).

%% The Health Emergency
narrative(health_emergency, 'The Health Emergency', crisis).
narrative_description(health_emergency, 'A public health scare at Metro General Hospital reveals cracks in the city safety net and tests community solidarity.').
narrative_trigger(health_emergency, status(doctor_patel, overwhelmed)).
narrative_step(health_emergency, 0, 'An unusual cluster of illness cases floods Metro General Hospital.').
narrative_step(health_emergency, 1, 'Dr. Priya Patel sounds the alarm, but hospital administration downplays the situation.').
narrative_step(health_emergency, 2, 'The mayor must decide whether to declare a public health advisory.').
narrative_step(health_emergency, 3, 'Community volunteers mobilize. The true cause is traced and addressed.').
narrative_tag(health_emergency, health).
narrative_tag(health_emergency, community).

%% Election Season
narrative(election_season, 'Election Season', political_drama).
narrative_description(election_season, 'Mayor Johnson faces a challenger backed by tech money. Every resident must decide where they stand on the future of Metro City.').
narrative_trigger(election_season, event(election_announced)).
narrative_step(election_season, 0, 'A challenger announces their candidacy for mayor with strong corporate backing.').
narrative_step(election_season, 1, 'Campaign rallies divide the city along economic and cultural lines.').
narrative_step(election_season, 2, 'The player is asked to endorse a candidate, affecting relationships across the board.').
narrative_step(election_season, 3, 'Election night arrives. The result reshapes Metro City power dynamics.').
narrative_tag(election_season, politics).
narrative_tag(election_season, power).

%% Underground Scene
narrative(underground_scene, 'The Underground Scene', cultural_event).
narrative_description(underground_scene, 'A secret music collective in the Warehouse District gains a cult following, but success threatens to commercialize what made it special.').
narrative_trigger(underground_scene, event(underground_discovered)).
narrative_step(underground_scene, 0, 'Word spreads about an invite-only music collective in an abandoned warehouse on Dock Street.').
narrative_step(underground_scene, 1, 'A social media post goes viral, drawing mainstream attention and record-label scouts.').
narrative_step(underground_scene, 2, 'The founding members debate whether to accept a corporate sponsorship deal.').
narrative_step(underground_scene, 3, 'The decision shapes whether the scene thrives underground or gets absorbed into the mainstream.').
narrative_tag(underground_scene, music).
narrative_tag(underground_scene, authenticity).
