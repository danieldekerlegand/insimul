%% Insimul Items: Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Solar Lantern
item(solar_lantern, 'Solar Lantern', tool).
item_description(solar_lantern, 'A hand-blown glass lantern powered by a micro solar cell. Charges during the day and provides warm light for eight hours.').
item_value(solar_lantern, 15).
item_sell_value(solar_lantern, 8).
item_weight(solar_lantern, 0.5).
item_rarity(solar_lantern, common).
item_category(solar_lantern, tool).
item_tradeable(solar_lantern).
item_possessable(solar_lantern).
item_tag(solar_lantern, solar).
item_tag(solar_lantern, utility).

%% Mycelium Spore Kit
item(mycelium_spore_kit, 'Mycelium Spore Kit', material).
item_description(mycelium_spore_kit, 'A sealed container of specialized fungal spores used for bioremediation, building materials, and medicinal compounds.').
item_value(mycelium_spore_kit, 40).
item_sell_value(mycelium_spore_kit, 20).
item_weight(mycelium_spore_kit, 0.3).
item_rarity(mycelium_spore_kit, uncommon).
item_category(mycelium_spore_kit, agriculture).
item_tradeable(mycelium_spore_kit).
item_possessable(mycelium_spore_kit).
item_tag(mycelium_spore_kit, mycelium).
item_tag(mycelium_spore_kit, crafting).

%% Seed Packet
item(seed_packet, 'Heritage Seed Packet', material).
item_description(seed_packet, 'Open-pollinated heritage seeds preserved from pre-collapse varieties. Each packet contains enough for a small garden plot.').
item_value(seed_packet, 10).
item_sell_value(seed_packet, 5).
item_weight(seed_packet, 0.1).
item_rarity(seed_packet, common).
item_category(seed_packet, agriculture).
item_stackable(seed_packet).
item_tradeable(seed_packet).
item_possessable(seed_packet).
item_tag(seed_packet, agriculture).
item_tag(seed_packet, food).

%% Biochar Compost
item(biochar_compost, 'Biochar Compost', material).
item_description(biochar_compost, 'Nutrient-rich soil amendment made from pyrolyzed plant matter. Dramatically improves soil fertility and sequesters carbon.').
item_value(biochar_compost, 8).
item_sell_value(biochar_compost, 4).
item_weight(biochar_compost, 3).
item_rarity(biochar_compost, common).
item_category(biochar_compost, agriculture).
item_stackable(biochar_compost).
item_tradeable(biochar_compost).
item_possessable(biochar_compost).
item_tag(biochar_compost, agriculture).
item_tag(biochar_compost, soil).

%% Solar Panel Kit
item(solar_panel_kit, 'Solar Panel Kit', tool).
item_description(solar_panel_kit, 'A modular photovoltaic panel that can be assembled to power small devices or contribute to a community grid.').
item_value(solar_panel_kit, 80).
item_sell_value(solar_panel_kit, 40).
item_weight(solar_panel_kit, 4).
item_rarity(solar_panel_kit, uncommon).
item_category(solar_panel_kit, technology).
item_tradeable(solar_panel_kit).
item_possessable(solar_panel_kit).
item_tag(solar_panel_kit, solar).
item_tag(solar_panel_kit, engineering).

%% Water Filter Ceramic
item(ceramic_water_filter, 'Ceramic Water Filter', tool).
item_description(ceramic_water_filter, 'A handcrafted ceramic filter that purifies water through natural clay filtration. Lasts for years with proper care.').
item_value(ceramic_water_filter, 25).
item_sell_value(ceramic_water_filter, 12).
item_weight(ceramic_water_filter, 1).
item_rarity(ceramic_water_filter, common).
item_category(ceramic_water_filter, tool).
item_tradeable(ceramic_water_filter).
item_possessable(ceramic_water_filter).
item_tag(ceramic_water_filter, water).
item_tag(ceramic_water_filter, crafting).

%% Herbal Tincture
item(herbal_tincture, 'Herbal Tincture', consumable).
item_description(herbal_tincture, 'A concentrated plant extract used for healing minor ailments. Made from herbs grown in the community gardens.').
item_value(herbal_tincture, 20).
item_sell_value(herbal_tincture, 10).
item_weight(herbal_tincture, 0.2).
item_rarity(herbal_tincture, uncommon).
item_category(herbal_tincture, medicine).
item_stackable(herbal_tincture).
item_tradeable(herbal_tincture).
item_possessable(herbal_tincture).
item_tag(herbal_tincture, medicine).
item_tag(herbal_tincture, herbal).

%% Bamboo Bicycle
item(bamboo_bicycle, 'Bamboo Bicycle', equipment).
item_description(bamboo_bicycle, 'A lightweight bicycle built from treated bamboo and reclaimed metal. The primary mode of personal transport between communities.').
item_value(bamboo_bicycle, 60).
item_sell_value(bamboo_bicycle, 30).
item_weight(bamboo_bicycle, 8).
item_rarity(bamboo_bicycle, common).
item_category(bamboo_bicycle, transport).
item_tradeable(bamboo_bicycle).
item_possessable(bamboo_bicycle).
item_tag(bamboo_bicycle, transport).
item_tag(bamboo_bicycle, sustainable).

%% Mushroom Leather
item(mushroom_leather, 'Mushroom Leather', material).
item_description(mushroom_leather, 'Durable textile grown from mycelium. Used for clothing, bags, and building insulation. A staple of solarpunk craftsmanship.').
item_value(mushroom_leather, 30).
item_sell_value(mushroom_leather, 15).
item_weight(mushroom_leather, 1).
item_rarity(mushroom_leather, uncommon).
item_category(mushroom_leather, material).
item_stackable(mushroom_leather).
item_tradeable(mushroom_leather).
item_possessable(mushroom_leather).
item_tag(mushroom_leather, mycelium).
item_tag(mushroom_leather, crafting).

%% Community Token
item(community_token, 'Community Token', material).
item_description(community_token, 'A handcrafted wooden token representing one hour of community labor. The primary exchange medium between eco-communities.').
item_value(community_token, 1).
item_sell_value(community_token, 1).
item_weight(community_token, 0.02).
item_rarity(community_token, common).
item_category(community_token, currency).
item_stackable(community_token).
item_tradeable(community_token).
item_possessable(community_token).
item_tag(community_token, currency).
item_tag(community_token, economy).

%% Algae Nutrient Bar
item(algae_bar, 'Algae Nutrient Bar', consumable).
item_description(algae_bar, 'A dense, protein-rich food bar made from spirulina and kelp. Sustainably produced and surprisingly tasty when flavored with herbs.').
item_value(algae_bar, 5).
item_sell_value(algae_bar, 2).
item_weight(algae_bar, 0.1).
item_rarity(algae_bar, common).
item_category(algae_bar, food_drink).
item_stackable(algae_bar).
item_tradeable(algae_bar).
item_possessable(algae_bar).
item_tag(algae_bar, food).
item_tag(algae_bar, sustainable).

%% Rainwater Harvest Jar
item(rainwater_jar, 'Rainwater Harvest Jar', tool).
item_description(rainwater_jar, 'A ceramic jar with a built-in collection funnel and charcoal filter. Collects and purifies rainwater passively.').
item_value(rainwater_jar, 12).
item_sell_value(rainwater_jar, 6).
item_weight(rainwater_jar, 2).
item_rarity(rainwater_jar, common).
item_category(rainwater_jar, tool).
item_tradeable(rainwater_jar).
item_possessable(rainwater_jar).
item_tag(rainwater_jar, water).
item_tag(rainwater_jar, sustainable).

%% Wind Turbine Component
item(wind_turbine_part, 'Wind Turbine Component', material).
item_description(wind_turbine_part, 'A precision-machined blade or generator component for community wind turbines. Requires skilled assembly.').
item_value(wind_turbine_part, 100).
item_sell_value(wind_turbine_part, 50).
item_weight(wind_turbine_part, 5).
item_rarity(wind_turbine_part, rare).
item_category(wind_turbine_part, technology).
item_tradeable(wind_turbine_part).
item_possessable(wind_turbine_part).
item_tag(wind_turbine_part, energy).
item_tag(wind_turbine_part, engineering).

%% Botanical Field Guide
item(botanical_guide, 'Botanical Field Guide', document).
item_description(botanical_guide, 'An illustrated handbook of local flora, including medicinal uses, cultivation tips, and ecological roles. Hand-printed on recycled paper.').
item_value(botanical_guide, 18).
item_sell_value(botanical_guide, 9).
item_weight(botanical_guide, 0.5).
item_rarity(botanical_guide, uncommon).
item_category(botanical_guide, document).
item_tradeable(botanical_guide).
item_possessable(botanical_guide).
item_tag(botanical_guide, knowledge).
item_tag(botanical_guide, botany).

%% Coral Fragment
item(coral_fragment, 'Coral Fragment', material).
item_description(coral_fragment, 'A carefully harvested piece of restored reef coral. Used in water filtration systems and as a decorative craft material.').
item_value(coral_fragment, 35).
item_sell_value(coral_fragment, 18).
item_weight(coral_fragment, 0.5).
item_rarity(coral_fragment, uncommon).
item_category(coral_fragment, material).
item_tradeable(coral_fragment).
item_possessable(coral_fragment).
item_tag(coral_fragment, marine).
item_tag(coral_fragment, restoration).

%% Bio-Plastic Sheet
item(bio_plastic, 'Bio-Plastic Sheet', material).
item_description(bio_plastic, 'A flexible, durable sheet made from algae-based bioplastic. Fully compostable and used for construction, packaging, and waterproofing.').
item_value(bio_plastic, 6).
item_sell_value(bio_plastic, 3).
item_weight(bio_plastic, 0.5).
item_rarity(bio_plastic, common).
item_category(bio_plastic, material).
item_stackable(bio_plastic).
item_tradeable(bio_plastic).
item_possessable(bio_plastic).
item_tag(bio_plastic, crafting).
item_tag(bio_plastic, sustainable).

%% Tidal Battery
item(tidal_battery, 'Tidal Battery', tool).
item_description(tidal_battery, 'A rechargeable battery charged by the Tidecrest tidal turbine. Provides portable clean energy for tools and devices.').
item_value(tidal_battery, 45).
item_sell_value(tidal_battery, 22).
item_weight(tidal_battery, 1).
item_rarity(tidal_battery, uncommon).
item_category(tidal_battery, technology).
item_stackable(tidal_battery).
item_tradeable(tidal_battery).
item_possessable(tidal_battery).
item_tag(tidal_battery, energy).
item_tag(tidal_battery, technology).

%% Handwoven Textile
item(handwoven_textile, 'Handwoven Textile', material).
item_description(handwoven_textile, 'A beautiful fabric woven from plant fibers and naturally dyed. Each piece is unique, reflecting the artisan and their community.').
item_value(handwoven_textile, 25).
item_sell_value(handwoven_textile, 12).
item_weight(handwoven_textile, 0.8).
item_rarity(handwoven_textile, uncommon).
item_category(handwoven_textile, material).
item_tradeable(handwoven_textile).
item_possessable(handwoven_textile).
item_tag(handwoven_textile, crafting).
item_tag(handwoven_textile, art).
