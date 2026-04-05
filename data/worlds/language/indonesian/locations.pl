%% Insimul Locations (Lots): Indonesian Coastal Town
%% Source: data/worlds/language/indonesian/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 5 Jalan Raya -- Warung Sari Laut
lot(lot_id_1, '5 Jalan Raya', pantai_mutiara).
lot_type(lot_id_1, buildable).
lot_district(lot_id_1, pasar_district).
lot_street(lot_id_1, jalan_raya).
lot_side(lot_id_1, left).
lot_house_number(lot_id_1, 5).
building(lot_id_1, business, warung).
business(lot_id_1, 'Warung Sari Laut', warung).
business_founded(lot_id_1, 1998).

%% 12 Jalan Raya -- Toko Elektronik
lot(lot_id_2, '12 Jalan Raya', pantai_mutiara).
lot_type(lot_id_2, buildable).
lot_district(lot_id_2, pasar_district).
lot_street(lot_id_2, jalan_raya).
lot_side(lot_id_2, right).
lot_house_number(lot_id_2, 12).
building(lot_id_2, business, shop).
business(lot_id_2, 'Toko Elektronik Jaya', shop).
business_founded(lot_id_2, 2010).

%% 20 Jalan Raya -- Apotek
lot(lot_id_3, '20 Jalan Raya', pantai_mutiara).
lot_type(lot_id_3, buildable).
lot_district(lot_id_3, pasar_district).
lot_street(lot_id_3, jalan_raya).
lot_side(lot_id_3, left).
lot_house_number(lot_id_3, 20).
building(lot_id_3, business, pharmacy).
business(lot_id_3, 'Apotek Sehat', pharmacy).
business_founded(lot_id_3, 2005).

%% 28 Jalan Raya -- Residence
lot(lot_id_4, '28 Jalan Raya', pantai_mutiara).
lot_type(lot_id_4, buildable).
lot_district(lot_id_4, pasar_district).
lot_street(lot_id_4, jalan_raya).
lot_side(lot_id_4, right).
lot_house_number(lot_id_4, 28).
building(lot_id_4, residence, house).

%% 35 Jalan Raya -- Batik Workshop
lot(lot_id_5, '35 Jalan Raya', pantai_mutiara).
lot_type(lot_id_5, buildable).
lot_district(lot_id_5, pasar_district).
lot_street(lot_id_5, jalan_raya).
lot_side(lot_id_5, left).
lot_house_number(lot_id_5, 35).
building(lot_id_5, business, workshop).
business(lot_id_5, 'Batik Pusaka', workshop).
business_founded(lot_id_5, 1985).

%% 3 Jalan Pasar -- Pasar Tradisional
lot(lot_id_6, '3 Jalan Pasar', pantai_mutiara).
lot_type(lot_id_6, buildable).
lot_district(lot_id_6, pasar_district).
lot_street(lot_id_6, jalan_pasar).
lot_side(lot_id_6, left).
lot_house_number(lot_id_6, 3).
building(lot_id_6, business, market).
business(lot_id_6, 'Pasar Tradisional Mutiara', market).
business_founded(lot_id_6, 1920).

%% 10 Jalan Pasar -- Toko Rempah
lot(lot_id_7, '10 Jalan Pasar', pantai_mutiara).
lot_type(lot_id_7, buildable).
lot_district(lot_id_7, pasar_district).
lot_street(lot_id_7, jalan_pasar).
lot_side(lot_id_7, right).
lot_house_number(lot_id_7, 10).
building(lot_id_7, business, shop).
business(lot_id_7, 'Toko Rempah Nusantara', shop).
business_founded(lot_id_7, 1960).

%% 18 Jalan Pasar -- Warung Kopi
lot(lot_id_8, '18 Jalan Pasar', pantai_mutiara).
lot_type(lot_id_8, buildable).
lot_district(lot_id_8, pasar_district).
lot_street(lot_id_8, jalan_pasar).
lot_side(lot_id_8, left).
lot_house_number(lot_id_8, 18).
building(lot_id_8, business, cafe).
business(lot_id_8, 'Warung Kopi Mantap', cafe).
business_founded(lot_id_8, 2008).

%% 25 Jalan Pasar -- Toko Kain
lot(lot_id_9, '25 Jalan Pasar', pantai_mutiara).
lot_type(lot_id_9, buildable).
lot_district(lot_id_9, pasar_district).
lot_street(lot_id_9, jalan_pasar).
lot_side(lot_id_9, right).
lot_house_number(lot_id_9, 25).
building(lot_id_9, business, shop).
business(lot_id_9, 'Toko Kain Indah', shop).
business_founded(lot_id_9, 1975).

%% 32 Jalan Pasar -- Toko Buku
lot(lot_id_10, '32 Jalan Pasar', pantai_mutiara).
lot_type(lot_id_10, buildable).
lot_district(lot_id_10, pasar_district).
lot_street(lot_id_10, jalan_pasar).
lot_side(lot_id_10, left).
lot_house_number(lot_id_10, 32).
building(lot_id_10, business, bookstore).
business(lot_id_10, 'Toko Buku Cerdas', bookstore).
business_founded(lot_id_10, 1992).

%% 5 Jalan Masjid -- Masjid Agung
lot(lot_id_11, '5 Jalan Masjid', pantai_mutiara).
lot_type(lot_id_11, buildable).
lot_district(lot_id_11, pasar_district).
lot_street(lot_id_11, jalan_masjid).
lot_side(lot_id_11, left).
lot_house_number(lot_id_11, 5).
building(lot_id_11, civic, mosque).

%% 15 Jalan Masjid -- Residence
lot(lot_id_12, '15 Jalan Masjid', pantai_mutiara).
lot_type(lot_id_12, buildable).
lot_district(lot_id_12, pasar_district).
lot_street(lot_id_12, jalan_masjid).
lot_side(lot_id_12, right).
lot_house_number(lot_id_12, 15).
building(lot_id_12, residence, house).

%% 22 Jalan Masjid -- Sanggar Gamelan
lot(lot_id_13, '22 Jalan Masjid', pantai_mutiara).
lot_type(lot_id_13, buildable).
lot_district(lot_id_13, pasar_district).
lot_street(lot_id_13, jalan_masjid).
lot_side(lot_id_13, left).
lot_house_number(lot_id_13, 22).
building(lot_id_13, business, workshop).
business(lot_id_13, 'Sanggar Gamelan Sari', workshop).
business_founded(lot_id_13, 1970).

%% 30 Jalan Masjid -- Residence
lot(lot_id_14, '30 Jalan Masjid', pantai_mutiara).
lot_type(lot_id_14, buildable).
lot_district(lot_id_14, pasar_district).
lot_street(lot_id_14, jalan_masjid).
lot_side(lot_id_14, right).
lot_house_number(lot_id_14, 30).
building(lot_id_14, residence, apartment).

%% 38 Jalan Masjid -- Tailor
lot(lot_id_15, '38 Jalan Masjid', pantai_mutiara).
lot_type(lot_id_15, buildable).
lot_district(lot_id_15, pasar_district).
lot_street(lot_id_15, jalan_masjid).
lot_side(lot_id_15, left).
lot_house_number(lot_id_15, 38).
building(lot_id_15, business, tailor).
business(lot_id_15, 'Penjahit Berkah', tailor).
business_founded(lot_id_15, 1988).

%% 5 Jalan Pelabuhan -- Pelabuhan Ikan (Fish Harbor)
lot(lot_id_16, '5 Jalan Pelabuhan', pantai_mutiara).
lot_type(lot_id_16, buildable).
lot_district(lot_id_16, pelabuhan_district).
lot_street(lot_id_16, jalan_pelabuhan).
lot_side(lot_id_16, left).
lot_house_number(lot_id_16, 5).
building(lot_id_16, civic, harbor).

%% 15 Jalan Pelabuhan -- Warung Seafood
lot(lot_id_17, '15 Jalan Pelabuhan', pantai_mutiara).
lot_type(lot_id_17, buildable).
lot_district(lot_id_17, pelabuhan_district).
lot_street(lot_id_17, jalan_pelabuhan).
lot_side(lot_id_17, right).
lot_house_number(lot_id_17, 15).
building(lot_id_17, business, restaurant).
business(lot_id_17, 'Warung Ikan Bakar Pak Harto', restaurant).
business_founded(lot_id_17, 2000).

%% 22 Jalan Pelabuhan -- Ice Factory
lot(lot_id_18, '22 Jalan Pelabuhan', pantai_mutiara).
lot_type(lot_id_18, buildable).
lot_district(lot_id_18, pelabuhan_district).
lot_street(lot_id_18, jalan_pelabuhan).
lot_side(lot_id_18, left).
lot_house_number(lot_id_18, 22).
building(lot_id_18, business, factory).
business(lot_id_18, 'Pabrik Es Segar', factory).
business_founded(lot_id_18, 1995).

%% 30 Jalan Pelabuhan -- Residence
lot(lot_id_19, '30 Jalan Pelabuhan', pantai_mutiara).
lot_type(lot_id_19, buildable).
lot_district(lot_id_19, pelabuhan_district).
lot_street(lot_id_19, jalan_pelabuhan).
lot_side(lot_id_19, right).
lot_house_number(lot_id_19, 30).
building(lot_id_19, residence, house).

%% 8 Jalan Nelayan -- Boat Workshop
lot(lot_id_20, '8 Jalan Nelayan', pantai_mutiara).
lot_type(lot_id_20, buildable).
lot_district(lot_id_20, pelabuhan_district).
lot_street(lot_id_20, jalan_nelayan).
lot_side(lot_id_20, left).
lot_house_number(lot_id_20, 8).
building(lot_id_20, business, workshop).
business(lot_id_20, 'Bengkel Perahu Bahari', workshop).
business_founded(lot_id_20, 1965).

%% 16 Jalan Nelayan -- Residence
lot(lot_id_21, '16 Jalan Nelayan', pantai_mutiara).
lot_type(lot_id_21, buildable).
lot_district(lot_id_21, pelabuhan_district).
lot_street(lot_id_21, jalan_nelayan).
lot_side(lot_id_21, right).
lot_house_number(lot_id_21, 16).
building(lot_id_21, residence, house).

%% 5 Jalan Merdeka -- Sekolah (School)
lot(lot_id_22, '5 Jalan Merdeka', pantai_mutiara).
lot_type(lot_id_22, buildable).
lot_district(lot_id_22, kota_baru).
lot_street(lot_id_22, jalan_merdeka).
lot_side(lot_id_22, left).
lot_house_number(lot_id_22, 5).
building(lot_id_22, civic, school).

%% 15 Jalan Merdeka -- Internet Cafe
lot(lot_id_23, '15 Jalan Merdeka', pantai_mutiara).
lot_type(lot_id_23, buildable).
lot_district(lot_id_23, kota_baru).
lot_street(lot_id_23, jalan_merdeka).
lot_side(lot_id_23, right).
lot_house_number(lot_id_23, 15).
building(lot_id_23, business, cafe).
business(lot_id_23, 'Warnet Cepat', cafe).
business_founded(lot_id_23, 2012).

%% 22 Jalan Merdeka -- Minimarket
lot(lot_id_24, '22 Jalan Merdeka', pantai_mutiara).
lot_type(lot_id_24, buildable).
lot_district(lot_id_24, kota_baru).
lot_street(lot_id_24, jalan_merdeka).
lot_side(lot_id_24, left).
lot_house_number(lot_id_24, 22).
building(lot_id_24, business, grocerystore).
business(lot_id_24, 'Minimarket Makmur', grocerystore).
business_founded(lot_id_24, 2015).

%% 30 Jalan Merdeka -- Rumah Makan Padang
lot(lot_id_25, '30 Jalan Merdeka', pantai_mutiara).
lot_type(lot_id_25, buildable).
lot_district(lot_id_25, kota_baru).
lot_street(lot_id_25, jalan_merdeka).
lot_side(lot_id_25, right).
lot_house_number(lot_id_25, 30).
building(lot_id_25, business, restaurant).
business(lot_id_25, 'Rumah Makan Padang Sederhana', restaurant).
business_founded(lot_id_25, 2003).

%% 38 Jalan Merdeka -- Bengkel Motor
lot(lot_id_26, '38 Jalan Merdeka', pantai_mutiara).
lot_type(lot_id_26, buildable).
lot_district(lot_id_26, kota_baru).
lot_street(lot_id_26, jalan_merdeka).
lot_side(lot_id_26, left).
lot_house_number(lot_id_26, 38).
building(lot_id_26, business, workshop).
business(lot_id_26, 'Bengkel Motor Maju', workshop).
business_founded(lot_id_26, 2008).

%% 45 Jalan Merdeka -- Residence
lot(lot_id_27, '45 Jalan Merdeka', pantai_mutiara).
lot_type(lot_id_27, buildable).
lot_district(lot_id_27, kota_baru).
lot_street(lot_id_27, jalan_merdeka).
lot_side(lot_id_27, right).
lot_house_number(lot_id_27, 45).
building(lot_id_27, residence, apartment).

%% 8 Jalan Pendidikan -- Language Center
lot(lot_id_28, '8 Jalan Pendidikan', pantai_mutiara).
lot_type(lot_id_28, buildable).
lot_district(lot_id_28, kota_baru).
lot_street(lot_id_28, jalan_pendidikan).
lot_side(lot_id_28, left).
lot_house_number(lot_id_28, 8).
building(lot_id_28, business, school).
business(lot_id_28, 'Pusat Bahasa Indonesia', school).
business_founded(lot_id_28, 2010).

%% 16 Jalan Pendidikan -- Library
lot(lot_id_29, '16 Jalan Pendidikan', pantai_mutiara).
lot_type(lot_id_29, buildable).
lot_district(lot_id_29, kota_baru).
lot_street(lot_id_29, jalan_pendidikan).
lot_side(lot_id_29, right).
lot_house_number(lot_id_29, 16).
building(lot_id_29, civic, library).

%% 24 Jalan Pendidikan -- Toko HP
lot(lot_id_30, '24 Jalan Pendidikan', pantai_mutiara).
lot_type(lot_id_30, buildable).
lot_district(lot_id_30, kota_baru).
lot_street(lot_id_30, jalan_pendidikan).
lot_side(lot_id_30, left).
lot_house_number(lot_id_30, 24).
building(lot_id_30, business, shop).
business(lot_id_30, 'Toko HP Canggih', shop).
business_founded(lot_id_30, 2016).

%% Desa Sawah Lots

%% 3 Jalan Sawah -- Musholla (Village Prayer Room)
lot(lot_id_31, '3 Jalan Sawah', desa_sawah).
lot_type(lot_id_31, buildable).
lot_district(lot_id_31, kampung_tengah).
lot_street(lot_id_31, jalan_sawah).
lot_side(lot_id_31, left).
lot_house_number(lot_id_31, 3).
building(lot_id_31, civic, mosque).

%% 10 Jalan Sawah -- Rice Mill
lot(lot_id_32, '10 Jalan Sawah', desa_sawah).
lot_type(lot_id_32, buildable).
lot_district(lot_id_32, kampung_tengah).
lot_street(lot_id_32, jalan_sawah).
lot_side(lot_id_32, right).
lot_house_number(lot_id_32, 10).
building(lot_id_32, business, workshop).
business(lot_id_32, 'Penggilingan Padi Subur', workshop).
business_founded(lot_id_32, 1950).

%% 5 Jalan Desa -- Warung Sederhana
lot(lot_id_33, '5 Jalan Desa', desa_sawah).
lot_type(lot_id_33, buildable).
lot_district(lot_id_33, kampung_tengah).
lot_street(lot_id_33, jalan_desa).
lot_side(lot_id_33, left).
lot_house_number(lot_id_33, 5).
building(lot_id_33, business, warung).
business(lot_id_33, 'Warung Bu Tuti', warung).
business_founded(lot_id_33, 1980).

%% 12 Jalan Desa -- Residence
lot(lot_id_34, '12 Jalan Desa', desa_sawah).
lot_type(lot_id_34, buildable).
lot_district(lot_id_34, kampung_tengah).
lot_street(lot_id_34, jalan_desa).
lot_side(lot_id_34, right).
lot_house_number(lot_id_34, 12).
building(lot_id_34, residence, house).

%% 20 Jalan Desa -- Residence
lot(lot_id_35, '20 Jalan Desa', desa_sawah).
lot_type(lot_id_35, buildable).
lot_district(lot_id_35, kampung_tengah).
lot_street(lot_id_35, jalan_desa).
lot_side(lot_id_35, left).
lot_house_number(lot_id_35, 20).
building(lot_id_35, residence, house).
