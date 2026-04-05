%% Insimul Locations (Lots): Creole Colonial
%% Source: data/worlds/creole_colonial/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Nouvelle-Orleans — Vieux Carre
%% ═══════════════════════════════════════════════════════════

%% 3 Rue Royale — Cafe Creole
lot(lot_cc_1, '3 Rue Royale', nouvelle_orleans).
lot_type(lot_cc_1, buildable).
lot_district(lot_cc_1, vieux_carre).
lot_street(lot_cc_1, rue_royale).
lot_side(lot_cc_1, left).
lot_house_number(lot_cc_1, 3).
building(lot_cc_1, business, cafe).
business(lot_cc_1, 'Cafe Creole', cafe).
business_founded(lot_cc_1, 1740).

%% 10 Rue Royale — Pharmacie Duvalier
lot(lot_cc_2, '10 Rue Royale', nouvelle_orleans).
lot_type(lot_cc_2, buildable).
lot_district(lot_cc_2, vieux_carre).
lot_street(lot_cc_2, rue_royale).
lot_side(lot_cc_2, right).
lot_house_number(lot_cc_2, 10).
building(lot_cc_2, business, apothecary).
business(lot_cc_2, 'Pharmacie Duvalier', apothecary).
business_founded(lot_cc_2, 1735).

%% 18 Rue Royale — Maison Beaumont (Residence)
lot(lot_cc_3, '18 Rue Royale', nouvelle_orleans).
lot_type(lot_cc_3, buildable).
lot_district(lot_cc_3, vieux_carre).
lot_street(lot_cc_3, rue_royale).
lot_side(lot_cc_3, left).
lot_house_number(lot_cc_3, 18).
building(lot_cc_3, residential, townhouse).

%% 5 Rue Bourbon — Taverne du Corsaire
lot(lot_cc_4, '5 Rue Bourbon', nouvelle_orleans).
lot_type(lot_cc_4, buildable).
lot_district(lot_cc_4, vieux_carre).
lot_street(lot_cc_4, rue_bourbon).
lot_side(lot_cc_4, left).
lot_house_number(lot_cc_4, 5).
building(lot_cc_4, business, tavern).
business(lot_cc_4, 'Taverne du Corsaire', tavern).
business_founded(lot_cc_4, 1742).

%% 14 Rue Bourbon — Atelier de Couture Fontaine
lot(lot_cc_5, '14 Rue Bourbon', nouvelle_orleans).
lot_type(lot_cc_5, buildable).
lot_district(lot_cc_5, vieux_carre).
lot_street(lot_cc_5, rue_bourbon).
lot_side(lot_cc_5, right).
lot_house_number(lot_cc_5, 14).
building(lot_cc_5, business, tailor).
business(lot_cc_5, 'Atelier de Couture Fontaine', tailor).
business_founded(lot_cc_5, 1750).

%% 22 Rue Bourbon — Maison Lafleur (Residence)
lot(lot_cc_6, '22 Rue Bourbon', nouvelle_orleans).
lot_type(lot_cc_6, buildable).
lot_district(lot_cc_6, vieux_carre).
lot_street(lot_cc_6, rue_bourbon).
lot_side(lot_cc_6, left).
lot_house_number(lot_cc_6, 22).
building(lot_cc_6, residential, townhouse).

%% 7 Rue Chartres — Librairie Saint-Domingue
lot(lot_cc_7, '7 Rue Chartres', nouvelle_orleans).
lot_type(lot_cc_7, buildable).
lot_district(lot_cc_7, vieux_carre).
lot_street(lot_cc_7, rue_chartres).
lot_side(lot_cc_7, left).
lot_house_number(lot_cc_7, 7).
building(lot_cc_7, business, bookshop).
business(lot_cc_7, 'Librairie Saint-Domingue', bookshop).
business_founded(lot_cc_7, 1755).

%% 15 Rue Chartres — Bijouterie Toussaint
lot(lot_cc_8, '15 Rue Chartres', nouvelle_orleans).
lot_type(lot_cc_8, buildable).
lot_district(lot_cc_8, vieux_carre).
lot_street(lot_cc_8, rue_chartres).
lot_side(lot_cc_8, right).
lot_house_number(lot_cc_8, 15).
building(lot_cc_8, business, jeweler).
business(lot_cc_8, 'Bijouterie Toussaint', jeweler).
business_founded(lot_cc_8, 1748).

%% 2 Rue des Ursulines — Couvent des Ursulines
lot(lot_cc_9, '2 Rue des Ursulines', nouvelle_orleans).
lot_type(lot_cc_9, buildable).
lot_district(lot_cc_9, vieux_carre).
lot_street(lot_cc_9, rue_des_ursulines).
lot_side(lot_cc_9, right).
lot_house_number(lot_cc_9, 2).
building(lot_cc_9, civic, convent).

%% 8 Rue des Ursulines — Maison de Commerce Moreau
lot(lot_cc_10, '8 Rue des Ursulines', nouvelle_orleans).
lot_type(lot_cc_10, buildable).
lot_district(lot_cc_10, vieux_carre).
lot_street(lot_cc_10, rue_des_ursulines).
lot_side(lot_cc_10, right).
lot_house_number(lot_cc_10, 8).
building(lot_cc_10, business, trading_house).
business(lot_cc_10, 'Maison de Commerce Moreau', trading_house).
business_founded(lot_cc_10, 1730).

%% ═══════════════════════════════════════════════════════════
%% Nouvelle-Orleans — Quartier du Port
%% ═══════════════════════════════════════════════════════════

%% 1 Rue du Marche — Marche du Port
lot(lot_cc_11, '1 Rue du Marche', nouvelle_orleans).
lot_type(lot_cc_11, buildable).
lot_district(lot_cc_11, quartier_du_port).
lot_street(lot_cc_11, rue_du_marche).
lot_side(lot_cc_11, left).
lot_house_number(lot_cc_11, 1).
building(lot_cc_11, business, market).
business(lot_cc_11, 'Marche du Port', market).
business_founded(lot_cc_11, 1720).

%% 9 Rue du Marche — Entrepot Lafitte
lot(lot_cc_12, '9 Rue du Marche', nouvelle_orleans).
lot_type(lot_cc_12, buildable).
lot_district(lot_cc_12, quartier_du_port).
lot_street(lot_cc_12, rue_du_marche).
lot_side(lot_cc_12, left).
lot_house_number(lot_cc_12, 9).
building(lot_cc_12, business, warehouse).
business(lot_cc_12, 'Entrepot Lafitte', warehouse).
business_founded(lot_cc_12, 1738).

%% 17 Rue du Marche — Forge Bienville
lot(lot_cc_13, '17 Rue du Marche', nouvelle_orleans).
lot_type(lot_cc_13, buildable).
lot_district(lot_cc_13, quartier_du_port).
lot_street(lot_cc_13, rue_du_marche).
lot_side(lot_cc_13, right).
lot_house_number(lot_cc_13, 17).
building(lot_cc_13, business, blacksmith).
business(lot_cc_13, 'Forge Bienville', blacksmith).
business_founded(lot_cc_13, 1725).

%% 25 Rue du Marche — Chantier Naval
lot(lot_cc_14, '25 Rue du Marche', nouvelle_orleans).
lot_type(lot_cc_14, buildable).
lot_district(lot_cc_14, quartier_du_port).
lot_street(lot_cc_14, rue_du_marche).
lot_side(lot_cc_14, left).
lot_house_number(lot_cc_14, 25).
building(lot_cc_14, business, shipyard).
business(lot_cc_14, 'Chantier Naval du Fleuve', shipyard).
business_founded(lot_cc_14, 1722).

%% ═══════════════════════════════════════════════════════════
%% Nouvelle-Orleans — Faubourg Tremee
%% ═══════════════════════════════════════════════════════════

%% 4 Chemin du Bayou — Cabane de Mambo Celeste
lot(lot_cc_15, '4 Chemin du Bayou', nouvelle_orleans).
lot_type(lot_cc_15, buildable).
lot_district(lot_cc_15, faubourg_tremee).
lot_street(lot_cc_15, chemin_du_bayou).
lot_side(lot_cc_15, right).
lot_house_number(lot_cc_15, 4).
building(lot_cc_15, business, healer_hut).
business(lot_cc_15, 'Cabane de Mambo Celeste', healer_hut).
business_founded(lot_cc_15, 1752).

%% 12 Chemin du Bayou — Residence
lot(lot_cc_16, '12 Chemin du Bayou', nouvelle_orleans).
lot_type(lot_cc_16, buildable).
lot_district(lot_cc_16, faubourg_tremee).
lot_street(lot_cc_16, chemin_du_bayou).
lot_side(lot_cc_16, left).
lot_house_number(lot_cc_16, 12).
building(lot_cc_16, residential, cottage).

%% 20 Chemin du Bayou — Residence
lot(lot_cc_17, '20 Chemin du Bayou', nouvelle_orleans).
lot_type(lot_cc_17, buildable).
lot_district(lot_cc_17, faubourg_tremee).
lot_street(lot_cc_17, chemin_du_bayou).
lot_side(lot_cc_17, right).
lot_house_number(lot_cc_17, 20).
building(lot_cc_17, residential, cottage).

%% ═══════════════════════════════════════════════════════════
%% Nouvelle-Orleans — Quartier des Esclaves
%% ═══════════════════════════════════════════════════════════

%% 6 Allee des Cypres — Quarters
lot(lot_cc_18, '6 Allee des Cypres', nouvelle_orleans).
lot_type(lot_cc_18, buildable).
lot_district(lot_cc_18, quartier_des_esclaves).
lot_street(lot_cc_18, allee_des_cypres).
lot_side(lot_cc_18, right).
lot_house_number(lot_cc_18, 6).
building(lot_cc_18, residential, quarters).

%% 14 Allee des Cypres — Lavoir Communautaire
lot(lot_cc_19, '14 Allee des Cypres', nouvelle_orleans).
lot_type(lot_cc_19, buildable).
lot_district(lot_cc_19, quartier_des_esclaves).
lot_street(lot_cc_19, allee_des_cypres).
lot_side(lot_cc_19, left).
lot_house_number(lot_cc_19, 14).
building(lot_cc_19, business, laundry).
business(lot_cc_19, 'Lavoir Communautaire', laundry).
business_founded(lot_cc_19, 1745).

%% ═══════════════════════════════════════════════════════════
%% Bayou Vermillon
%% ═══════════════════════════════════════════════════════════

%% 1 Chemin Principal — Magasin General
lot(lot_cc_20, '1 Chemin Principal', bayou_vermillon).
lot_type(lot_cc_20, buildable).
lot_district(lot_cc_20, village_center).
lot_street(lot_cc_20, chemin_principal).
lot_side(lot_cc_20, left).
lot_house_number(lot_cc_20, 1).
building(lot_cc_20, business, general_store).
business(lot_cc_20, 'Magasin General du Bayou', general_store).
business_founded(lot_cc_20, 1746).

%% 7 Chemin Principal — Chapelle Saint-Jean
lot(lot_cc_21, '7 Chemin Principal', bayou_vermillon).
lot_type(lot_cc_21, buildable).
lot_district(lot_cc_21, village_center).
lot_street(lot_cc_21, chemin_principal).
lot_side(lot_cc_21, right).
lot_house_number(lot_cc_21, 7).
building(lot_cc_21, civic, chapel).

%% 13 Chemin Principal — Boucherie Thibodaux
lot(lot_cc_22, '13 Chemin Principal', bayou_vermillon).
lot_type(lot_cc_22, buildable).
lot_district(lot_cc_22, village_center).
lot_street(lot_cc_22, chemin_principal).
lot_side(lot_cc_22, left).
lot_house_number(lot_cc_22, 13).
building(lot_cc_22, business, butcher).
business(lot_cc_22, 'Boucherie Thibodaux', butcher).
business_founded(lot_cc_22, 1750).

%% 3 Sentier du Bayou — Cabane du Trappeur
lot(lot_cc_23, '3 Sentier du Bayou', bayou_vermillon).
lot_type(lot_cc_23, buildable).
lot_district(lot_cc_23, bayou_edge).
lot_street(lot_cc_23, sentier_du_bayou).
lot_side(lot_cc_23, left).
lot_house_number(lot_cc_23, 3).
building(lot_cc_23, residential, cabin).

%% 9 Sentier du Bayou — Pecherie Boudreaux
lot(lot_cc_24, '9 Sentier du Bayou', bayou_vermillon).
lot_type(lot_cc_24, buildable).
lot_district(lot_cc_24, bayou_edge).
lot_street(lot_cc_24, sentier_du_bayou).
lot_side(lot_cc_24, right).
lot_house_number(lot_cc_24, 9).
building(lot_cc_24, business, fishery).
business(lot_cc_24, 'Pecherie Boudreaux', fishery).
business_founded(lot_cc_24, 1748).

%% 15 Sentier du Bayou — Residence
lot(lot_cc_25, '15 Sentier du Bayou', bayou_vermillon).
lot_type(lot_cc_25, buildable).
lot_district(lot_cc_25, bayou_edge).
lot_street(lot_cc_25, sentier_du_bayou).
lot_side(lot_cc_25, left).
lot_house_number(lot_cc_25, 15).
building(lot_cc_25, residential, cabin).

%% 20 Rue Royale — Gouvernement Colonial
lot(lot_cc_26, '20 Rue Royale', nouvelle_orleans).
lot_type(lot_cc_26, buildable).
lot_district(lot_cc_26, vieux_carre).
lot_street(lot_cc_26, rue_royale).
lot_side(lot_cc_26, right).
lot_house_number(lot_cc_26, 20).
building(lot_cc_26, civic, government).

%% 30 Rue Bourbon — Boulangerie du Vieux Carre
lot(lot_cc_27, '30 Rue Bourbon', nouvelle_orleans).
lot_type(lot_cc_27, buildable).
lot_district(lot_cc_27, vieux_carre).
lot_street(lot_cc_27, rue_bourbon).
lot_side(lot_cc_27, right).
lot_house_number(lot_cc_27, 30).
building(lot_cc_27, business, bakery).
business(lot_cc_27, 'Boulangerie du Vieux Carre', bakery).
business_founded(lot_cc_27, 1745).

%% 22 Allee des Cypres — Jardins Communautaires
lot(lot_cc_28, '22 Allee des Cypres', nouvelle_orleans).
lot_type(lot_cc_28, buildable).
lot_district(lot_cc_28, quartier_des_esclaves).
lot_street(lot_cc_28, allee_des_cypres).
lot_side(lot_cc_28, right).
lot_house_number(lot_cc_28, 22).
building(lot_cc_28, civic, community_garden).
