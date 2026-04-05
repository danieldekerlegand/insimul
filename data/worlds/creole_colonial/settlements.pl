%% Insimul Settlements: Creole Colonial
%% Source: data/worlds/creole_colonial/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Nouvelle-Orleans
settlement(nouvelle_orleans, 'Nouvelle-Orleans', basse_louisiane, colonie_de_louisiane).
settlement_type(nouvelle_orleans, town).
settlement_founded(nouvelle_orleans, 1718).

district(vieux_carre, 'Vieux Carre', nouvelle_orleans).
district_wealth(vieux_carre, 82).
district_crime(vieux_carre, 38).
district_established(vieux_carre, 1718).
district(quartier_des_esclaves, 'Quartier des Esclaves', nouvelle_orleans).
district_wealth(quartier_des_esclaves, 15).
district_crime(quartier_des_esclaves, 55).
district_established(quartier_des_esclaves, 1722).
district(faubourg_tremee, 'Faubourg Tremee', nouvelle_orleans).
district_wealth(faubourg_tremee, 45).
district_crime(faubourg_tremee, 42).
district_established(faubourg_tremee, 1740).
district(quartier_du_port, 'Quartier du Port', nouvelle_orleans).
district_wealth(quartier_du_port, 60).
district_crime(quartier_du_port, 50).
district_established(quartier_du_port, 1720).

street(rue_royale, 'Rue Royale', nouvelle_orleans, vieux_carre).
street_condition(rue_royale, good).
street_traffic(rue_royale, high).
street(rue_bourbon, 'Rue Bourbon', nouvelle_orleans, vieux_carre).
street_condition(rue_bourbon, good).
street_traffic(rue_bourbon, high).
street(rue_chartres, 'Rue Chartres', nouvelle_orleans, vieux_carre).
street_condition(rue_chartres, good).
street_traffic(rue_chartres, medium).
street(rue_des_ursulines, 'Rue des Ursulines', nouvelle_orleans, vieux_carre).
street_condition(rue_des_ursulines, fair).
street_traffic(rue_des_ursulines, low).
street(chemin_du_bayou, 'Chemin du Bayou', nouvelle_orleans, faubourg_tremee).
street_condition(chemin_du_bayou, poor).
street_traffic(chemin_du_bayou, low).
street(rue_du_marche, 'Rue du Marche', nouvelle_orleans, quartier_du_port).
street_condition(rue_du_marche, fair).
street_traffic(rue_du_marche, high).
street(allee_des_cypres, 'Allee des Cypres', nouvelle_orleans, quartier_des_esclaves).
street_condition(allee_des_cypres, poor).
street_traffic(allee_des_cypres, low).

landmark(place_d_armes, 'Place d''Armes', nouvelle_orleans, vieux_carre).
landmark_historical(place_d_armes).
landmark_established(place_d_armes, 1720).
landmark(cathedrale_saint_louis, 'Cathedrale Saint-Louis', nouvelle_orleans, vieux_carre).
landmark_historical(cathedrale_saint_louis).
landmark_established(cathedrale_saint_louis, 1727).
landmark(levee_du_fleuve, 'Levee du Fleuve', nouvelle_orleans, quartier_du_port).
landmark_historical(levee_du_fleuve).
landmark_established(levee_du_fleuve, 1718).
landmark(congo_square, 'Congo Square', nouvelle_orleans, quartier_des_esclaves).
landmark_historical(congo_square).
landmark_established(congo_square, 1740).

%% Bayou Vermillon
settlement(bayou_vermillon, 'Bayou Vermillon', basse_louisiane, colonie_de_louisiane).
settlement_type(bayou_vermillon, village).
settlement_founded(bayou_vermillon, 1745).

district(village_center, 'Village Center', bayou_vermillon).
district_wealth(village_center, 35).
district_crime(village_center, 20).
district_established(village_center, 1745).
district(bayou_edge, 'Bayou Edge', bayou_vermillon).
district_wealth(bayou_edge, 20).
district_crime(bayou_edge, 30).
district_established(bayou_edge, 1750).

street(chemin_principal, 'Chemin Principal', bayou_vermillon, village_center).
street_condition(chemin_principal, fair).
street_traffic(chemin_principal, medium).
street(sentier_du_bayou, 'Sentier du Bayou', bayou_vermillon, bayou_edge).
street_condition(sentier_du_bayou, poor).
street_traffic(sentier_du_bayou, low).

landmark(vieux_chene, 'Le Vieux Chene', bayou_vermillon, village_center).
landmark_historical(vieux_chene).
landmark_established(vieux_chene, 1745).
landmark(debarcadere, 'Le Debarcadere', bayou_vermillon, bayou_edge).
landmark_established(debarcadere, 1748).
