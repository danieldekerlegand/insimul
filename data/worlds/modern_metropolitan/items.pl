%% Insimul Items: Modern Metropolitan
%% Source: data/worlds/modern_metropolitan/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Metro Pass
item(metro_pass, 'Metro Pass', consumable).
item_description(metro_pass, 'A monthly unlimited transit pass for all Metro City subway lines and bus routes. Essential for daily commuters.').
item_value(metro_pass, 120).
item_sell_value(metro_pass, 0).
item_weight(metro_pass, 0).
item_rarity(metro_pass, common).
item_category(metro_pass, transport).
item_stackable(metro_pass).
item_possessable(metro_pass).
item_tag(metro_pass, transport).
item_tag(metro_pass, essential).

%% Smartphone
item(smartphone_mm, 'Smartphone', tool).
item_description(smartphone_mm, 'A high-end smartphone with apps for transit, delivery, social media, and messaging. The lifeline of urban living.').
item_value(smartphone_mm, 800).
item_sell_value(smartphone_mm, 350).
item_weight(smartphone_mm, 0.2).
item_rarity(smartphone_mm, common).
item_category(smartphone_mm, technology).
item_possessable(smartphone_mm).
item_tag(smartphone_mm, technology).
item_tag(smartphone_mm, essential).

%% Professional Portfolio
item(professional_portfolio, 'Professional Portfolio', tool).
item_description(professional_portfolio, 'A leather-bound portfolio containing a resume, business cards, and a tablet for presentations. A must for networking events.').
item_value(professional_portfolio, 75).
item_sell_value(professional_portfolio, 30).
item_weight(professional_portfolio, 1).
item_rarity(professional_portfolio, common).
item_category(professional_portfolio, business).
item_tradeable(professional_portfolio).
item_possessable(professional_portfolio).
item_tag(professional_portfolio, career).
item_tag(professional_portfolio, networking).

%% Laptop Computer
item(laptop_mm, 'Laptop', tool).
item_description(laptop_mm, 'A slim laptop for working remotely at cafes and co-working spaces. Runs coding tools, design software, and spreadsheets.').
item_value(laptop_mm, 1200).
item_sell_value(laptop_mm, 500).
item_weight(laptop_mm, 1.5).
item_rarity(laptop_mm, common).
item_category(laptop_mm, technology).
item_possessable(laptop_mm).
item_tag(laptop_mm, technology).
item_tag(laptop_mm, work).

%% Coffee Cup (Reusable)
item(reusable_coffee_cup, 'Reusable Coffee Cup', tool).
item_description(reusable_coffee_cup, 'An insulated reusable cup. Most Metro City cafes offer a discount when you bring your own.').
item_value(reusable_coffee_cup, 15).
item_sell_value(reusable_coffee_cup, 5).
item_weight(reusable_coffee_cup, 0.3).
item_rarity(reusable_coffee_cup, common).
item_category(reusable_coffee_cup, lifestyle).
item_tradeable(reusable_coffee_cup).
item_possessable(reusable_coffee_cup).
item_tag(reusable_coffee_cup, sustainability).

%% Gym Membership Card
item(gym_membership, 'Gym Membership Card', tool).
item_description(gym_membership, 'An annual membership card for Yoga Flow Studio. Includes access to yoga classes, weights, and the sauna.').
item_value(gym_membership, 600).
item_sell_value(gym_membership, 0).
item_weight(gym_membership, 0).
item_rarity(gym_membership, common).
item_category(gym_membership, health).
item_possessable(gym_membership).
item_tag(gym_membership, health).
item_tag(gym_membership, fitness).

%% Artisan Coffee Beans
item(artisan_coffee, 'Artisan Coffee Beans', consumable).
item_description(artisan_coffee, 'A bag of single-origin coffee beans from Daily Grind Coffee. Locally roasted in small batches.').
item_value(artisan_coffee, 18).
item_sell_value(artisan_coffee, 9).
item_weight(artisan_coffee, 0.5).
item_rarity(artisan_coffee, common).
item_category(artisan_coffee, food_drink).
item_stackable(artisan_coffee).
item_tradeable(artisan_coffee).
item_possessable(artisan_coffee).
item_tag(artisan_coffee, food).
item_tag(artisan_coffee, local).

%% Spray Paint Set
item(spray_paint_set, 'Spray Paint Set', tool).
item_description(spray_paint_set, 'A set of twelve high-pigment spray cans in various colors. Used for murals and street art in the Warehouse District.').
item_value(spray_paint_set, 45).
item_sell_value(spray_paint_set, 20).
item_weight(spray_paint_set, 3).
item_rarity(spray_paint_set, common).
item_category(spray_paint_set, art).
item_stackable(spray_paint_set).
item_tradeable(spray_paint_set).
item_possessable(spray_paint_set).
item_tag(spray_paint_set, art).
item_tag(spray_paint_set, creative).

%% Noise-Canceling Headphones
item(noise_canceling_headphones, 'Noise-Canceling Headphones', equipment).
item_description(noise_canceling_headphones, 'Premium wireless headphones for blocking out subway noise, open-office chatter, and city sirens.').
item_value(noise_canceling_headphones, 250).
item_sell_value(noise_canceling_headphones, 100).
item_weight(noise_canceling_headphones, 0.3).
item_rarity(noise_canceling_headphones, common).
item_category(noise_canceling_headphones, technology).
item_tradeable(noise_canceling_headphones).
item_possessable(noise_canceling_headphones).
item_tag(noise_canceling_headphones, technology).
item_tag(noise_canceling_headphones, lifestyle).

%% Bicycle Lock
item(bicycle_lock, 'Bicycle Lock', tool).
item_description(bicycle_lock, 'A heavy-duty U-lock for securing bicycles to racks around Metro City. Bike theft is common downtown.').
item_value(bicycle_lock, 40).
item_sell_value(bicycle_lock, 15).
item_weight(bicycle_lock, 1).
item_rarity(bicycle_lock, common).
item_category(bicycle_lock, transport).
item_tradeable(bicycle_lock).
item_possessable(bicycle_lock).
item_tag(bicycle_lock, transport).
item_tag(bicycle_lock, security).

%% Craft Beer Sampler
item(craft_beer_sampler, 'Craft Beer Sampler', consumable).
item_description(craft_beer_sampler, 'A flight of four small-batch craft beers from Dockside Brewing Co. Features rotating seasonal selections.').
item_value(craft_beer_sampler, 16).
item_sell_value(craft_beer_sampler, 0).
item_weight(craft_beer_sampler, 1).
item_rarity(craft_beer_sampler, common).
item_category(craft_beer_sampler, food_drink).
item_possessable(craft_beer_sampler).
item_tag(craft_beer_sampler, beverage).
item_tag(craft_beer_sampler, social).

%% Vintage Vinyl Record
item(vintage_vinyl, 'Vintage Vinyl Record', accessory).
item_description(vintage_vinyl, 'A rare pressing found at the Pop-Up Hall. Collectors in the Arts Quarter pay premium prices for these.').
item_value(vintage_vinyl, 35).
item_sell_value(vintage_vinyl, 20).
item_weight(vintage_vinyl, 0.3).
item_rarity(vintage_vinyl, uncommon).
item_category(vintage_vinyl, entertainment).
item_tradeable(vintage_vinyl).
item_possessable(vintage_vinyl).
item_tag(vintage_vinyl, music).
item_tag(vintage_vinyl, collectible).

%% Farmers Market Produce Bag
item(farmers_market_bag, 'Farmers Market Bag', consumable).
item_description(farmers_market_bag, 'A canvas bag filled with locally-sourced organic vegetables and fruit from the Riverside Farmers Market.').
item_value(farmers_market_bag, 25).
item_sell_value(farmers_market_bag, 0).
item_weight(farmers_market_bag, 3).
item_rarity(farmers_market_bag, common).
item_category(farmers_market_bag, food_drink).
item_possessable(farmers_market_bag).
item_tag(farmers_market_bag, food).
item_tag(farmers_market_bag, local).

%% Business Card Holder
item(business_card_holder, 'Business Card Holder', tool).
item_description(business_card_holder, 'A sleek metal card case for exchanging contact information at networking events and conferences.').
item_value(business_card_holder, 20).
item_sell_value(business_card_holder, 8).
item_weight(business_card_holder, 0.1).
item_rarity(business_card_holder, common).
item_category(business_card_holder, business).
item_tradeable(business_card_holder).
item_possessable(business_card_holder).
item_tag(business_card_holder, career).
item_tag(business_card_holder, networking).

%% Sketchbook
item(sketchbook_mm, 'Sketchbook', tool).
item_description(sketchbook_mm, 'A heavyweight paper sketchbook used by artists at Canvas Studio and street sketch artists in the Arts Quarter.').
item_value(sketchbook_mm, 12).
item_sell_value(sketchbook_mm, 5).
item_weight(sketchbook_mm, 0.4).
item_rarity(sketchbook_mm, common).
item_category(sketchbook_mm, art).
item_tradeable(sketchbook_mm).
item_possessable(sketchbook_mm).
item_tag(sketchbook_mm, art).
item_tag(sketchbook_mm, creative).

%% Electric Scooter
item(electric_scooter, 'Electric Scooter', tool).
item_description(electric_scooter, 'A foldable electric scooter for last-mile commuting. Charges via USB and reaches 15 mph on flat ground.').
item_value(electric_scooter, 350).
item_sell_value(electric_scooter, 150).
item_weight(electric_scooter, 12).
item_rarity(electric_scooter, common).
item_category(electric_scooter, transport).
item_tradeable(electric_scooter).
item_possessable(electric_scooter).
item_tag(electric_scooter, transport).
item_tag(electric_scooter, technology).

%% Concert Ticket
item(concert_ticket, 'Concert Ticket', consumable).
item_description(concert_ticket, 'A general-admission ticket for a live show at Vinyl Underground. The Arts Quarter hottest venue.').
item_value(concert_ticket, 30).
item_sell_value(concert_ticket, 15).
item_weight(concert_ticket, 0).
item_rarity(concert_ticket, common).
item_category(concert_ticket, entertainment).
item_stackable(concert_ticket).
item_tradeable(concert_ticket).
item_possessable(concert_ticket).
item_tag(concert_ticket, entertainment).
item_tag(concert_ticket, social).

%% Medical Kit
item(medical_kit_mm, 'Medical Kit', tool).
item_description(medical_kit_mm, 'A compact first-aid kit carried by Dr. Patel. Contains bandages, antiseptic, and basic medications.').
item_value(medical_kit_mm, 50).
item_sell_value(medical_kit_mm, 20).
item_weight(medical_kit_mm, 1).
item_rarity(medical_kit_mm, common).
item_category(medical_kit_mm, health).
item_tradeable(medical_kit_mm).
item_possessable(medical_kit_mm).
item_tag(medical_kit_mm, health).
item_tag(medical_kit_mm, emergency).
