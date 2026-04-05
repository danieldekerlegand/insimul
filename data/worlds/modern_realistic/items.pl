%% Insimul Items: Modern Realistic
%% Source: data/worlds/modern_realistic/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Smartphone
item(smartphone_mr, 'Smartphone', tool).
item_description(smartphone_mr, 'A modern smartphone with maps, messaging, and social media apps.').
item_value(smartphone_mr, 800).
item_sell_value(smartphone_mr, 300).
item_weight(smartphone_mr, 0.2).
item_rarity(smartphone_mr, common).
item_category(smartphone_mr, technology).
item_tradeable(smartphone_mr).
item_possessable(smartphone_mr).
item_tag(smartphone_mr, technology).
item_tag(smartphone_mr, communication).

%% Laptop Computer
item(laptop_mr, 'Laptop Computer', tool).
item_description(laptop_mr, 'A lightweight laptop for work, study, and creative projects.').
item_value(laptop_mr, 1200).
item_sell_value(laptop_mr, 500).
item_weight(laptop_mr, 1.5).
item_rarity(laptop_mr, common).
item_category(laptop_mr, technology).
item_tradeable(laptop_mr).
item_possessable(laptop_mr).
item_tag(laptop_mr, technology).
item_tag(laptop_mr, work).

%% Car Keys
item(car_keys, 'Car Keys', tool).
item_description(car_keys, 'A key fob for a sedan parked in the driveway.').
item_value(car_keys, 5).
item_sell_value(car_keys, 0).
item_weight(car_keys, 0.1).
item_rarity(car_keys, common).
item_category(car_keys, transport).
item_possessable(car_keys).
item_tag(car_keys, transport).
item_tag(car_keys, personal).

%% House Keys
item(house_keys, 'House Keys', tool).
item_description(house_keys, 'A set of keys for the front door, back door, and mailbox.').
item_value(house_keys, 5).
item_sell_value(house_keys, 0).
item_weight(house_keys, 0.1).
item_rarity(house_keys, common).
item_category(house_keys, personal).
item_possessable(house_keys).
item_tag(house_keys, personal).
item_tag(house_keys, security).

%% Novel (Paperback)
item(paperback_novel, 'Paperback Novel', tool).
item_description(paperback_novel, 'A popular fiction paperback from the library book sale.').
item_value(paperback_novel, 8).
item_sell_value(paperback_novel, 2).
item_weight(paperback_novel, 0.3).
item_rarity(paperback_novel, common).
item_category(paperback_novel, entertainment).
item_stackable(paperback_novel).
item_tradeable(paperback_novel).
item_possessable(paperback_novel).
item_tag(paperback_novel, reading).
item_tag(paperback_novel, education).

%% Textbook
item(textbook_mr, 'College Textbook', tool).
item_description(textbook_mr, 'A heavy environmental science textbook with highlighted passages.').
item_value(textbook_mr, 120).
item_sell_value(textbook_mr, 40).
item_weight(textbook_mr, 2).
item_rarity(textbook_mr, common).
item_category(textbook_mr, education).
item_tradeable(textbook_mr).
item_possessable(textbook_mr).
item_tag(textbook_mr, education).
item_tag(textbook_mr, study).

%% Coffee (To-Go Cup)
item(coffee_to_go, 'Coffee To-Go', consumable).
item_description(coffee_to_go, 'A hot latte from Brewed Awakening in a paper cup.').
item_value(coffee_to_go, 5).
item_sell_value(coffee_to_go, 0).
item_weight(coffee_to_go, 0.4).
item_rarity(coffee_to_go, common).
item_category(coffee_to_go, food_drink).
item_stackable(coffee_to_go).
item_tradeable(coffee_to_go).
item_possessable(coffee_to_go).
item_tag(coffee_to_go, beverage).
item_tag(coffee_to_go, social).

%% Reusable Water Bottle
item(water_bottle, 'Reusable Water Bottle', tool).
item_description(water_bottle, 'A stainless steel water bottle with a gym logo sticker.').
item_value(water_bottle, 15).
item_sell_value(water_bottle, 5).
item_weight(water_bottle, 0.5).
item_rarity(water_bottle, common).
item_category(water_bottle, personal).
item_possessable(water_bottle).
item_tag(water_bottle, health).
item_tag(water_bottle, personal).

%% Backpack
item(backpack_mr, 'Backpack', equipment).
item_description(backpack_mr, 'A sturdy canvas backpack with multiple compartments for books and a laptop.').
item_value(backpack_mr, 45).
item_sell_value(backpack_mr, 15).
item_weight(backpack_mr, 0.8).
item_rarity(backpack_mr, common).
item_category(backpack_mr, personal).
item_tradeable(backpack_mr).
item_possessable(backpack_mr).
item_tag(backpack_mr, personal).
item_tag(backpack_mr, school).

%% Prescription Medication
item(prescription_meds, 'Prescription Medication', consumable).
item_description(prescription_meds, 'A bottle of daily blood pressure medication.').
item_value(prescription_meds, 30).
item_sell_value(prescription_meds, 0).
item_weight(prescription_meds, 0.2).
item_rarity(prescription_meds, common).
item_category(prescription_meds, health).
item_possessable(prescription_meds).
item_tag(prescription_meds, health).
item_tag(prescription_meds, medical).

%% Bus Pass
item(bus_pass, 'Monthly Bus Pass', consumable).
item_description(bus_pass, 'A monthly transit pass for the Tri-County bus system.').
item_value(bus_pass, 60).
item_sell_value(bus_pass, 0).
item_weight(bus_pass, 0).
item_rarity(bus_pass, common).
item_category(bus_pass, transport).
item_stackable(bus_pass).
item_possessable(bus_pass).
item_tag(bus_pass, transport).
item_tag(bus_pass, commute).

%% Tax Documents
item(tax_documents, 'Tax Documents', tool).
item_description(tax_documents, 'A folder of W-2 forms, receipts, and tax return paperwork.').
item_value(tax_documents, 0).
item_sell_value(tax_documents, 0).
item_weight(tax_documents, 0.5).
item_rarity(tax_documents, common).
item_category(tax_documents, document).
item_possessable(tax_documents).
item_tag(tax_documents, financial).
item_tag(tax_documents, document).

%% Resume
item(resume_mr, 'Printed Resume', tool).
item_description(resume_mr, 'A freshly printed resume on quality paper, ready for a job interview.').
item_value(resume_mr, 0).
item_sell_value(resume_mr, 0).
item_weight(resume_mr, 0).
item_rarity(resume_mr, common).
item_category(resume_mr, document).
item_possessable(resume_mr).
item_tag(resume_mr, career).
item_tag(resume_mr, document).

%% Yoga Mat
item(yoga_mat, 'Yoga Mat', equipment).
item_description(yoga_mat, 'A rolled-up yoga mat in a carrying strap for classes at Sunrise Yoga.').
item_value(yoga_mat, 25).
item_sell_value(yoga_mat, 8).
item_weight(yoga_mat, 1).
item_rarity(yoga_mat, common).
item_category(yoga_mat, fitness).
item_tradeable(yoga_mat).
item_possessable(yoga_mat).
item_tag(yoga_mat, fitness).
item_tag(yoga_mat, wellness).

%% Grocery Bag
item(grocery_bag, 'Bag of Groceries', consumable).
item_description(grocery_bag, 'A reusable bag filled with fresh produce from Fresh Market.').
item_value(grocery_bag, 35).
item_sell_value(grocery_bag, 0).
item_weight(grocery_bag, 5).
item_rarity(grocery_bag, common).
item_category(grocery_bag, food_drink).
item_stackable(grocery_bag).
item_tradeable(grocery_bag).
item_possessable(grocery_bag).
item_tag(grocery_bag, food).
item_tag(grocery_bag, household).

%% Recipe Book
item(recipe_book, 'Community Recipe Book', tool).
item_description(recipe_book, 'A spiral-bound collection of recipes contributed by Maplewood residents.').
item_value(recipe_book, 12).
item_sell_value(recipe_book, 4).
item_weight(recipe_book, 0.5).
item_rarity(recipe_book, uncommon).
item_category(recipe_book, entertainment).
item_tradeable(recipe_book).
item_possessable(recipe_book).
item_tag(recipe_book, cooking).
item_tag(recipe_book, community).

%% Camera
item(camera_mr, 'Digital Camera', tool).
item_description(camera_mr, 'A DSLR camera with a zoom lens for photography projects.').
item_value(camera_mr, 600).
item_sell_value(camera_mr, 250).
item_weight(camera_mr, 0.8).
item_rarity(camera_mr, uncommon).
item_category(camera_mr, technology).
item_tradeable(camera_mr).
item_possessable(camera_mr).
item_tag(camera_mr, creative).
item_tag(camera_mr, technology).

%% Art Supplies
item(art_supplies, 'Art Supplies Kit', tool).
item_description(art_supplies, 'A set of acrylic paints, brushes, and a small canvas.').
item_value(art_supplies, 40).
item_sell_value(art_supplies, 15).
item_weight(art_supplies, 2).
item_rarity(art_supplies, common).
item_category(art_supplies, craft).
item_tradeable(art_supplies).
item_possessable(art_supplies).
item_tag(art_supplies, creative).
item_tag(art_supplies, craft).

%% Toolbox
item(toolbox_mr, 'Toolbox', tool).
item_description(toolbox_mr, 'A heavy-duty toolbox with wrenches, screwdrivers, and a socket set.').
item_value(toolbox_mr, 75).
item_sell_value(toolbox_mr, 30).
item_weight(toolbox_mr, 8).
item_rarity(toolbox_mr, common).
item_category(toolbox_mr, tool).
item_tradeable(toolbox_mr).
item_possessable(toolbox_mr).
item_tag(toolbox_mr, repair).
item_tag(toolbox_mr, work).

%% Gift Card
item(gift_card, 'Gift Card', consumable).
item_description(gift_card, 'A $25 gift card to Fresh Market grocery store.').
item_value(gift_card, 25).
item_sell_value(gift_card, 20).
item_weight(gift_card, 0).
item_rarity(gift_card, common).
item_category(gift_card, financial).
item_stackable(gift_card).
item_tradeable(gift_card).
item_possessable(gift_card).
item_tag(gift_card, gift).
item_tag(gift_card, financial).
