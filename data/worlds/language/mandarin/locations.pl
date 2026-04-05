%% Insimul Locations (Lots): Mandarin Watertown
%% Source: data/worlds/language/mandarin/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 3 Heqiao Lu -- Mingqian Teahouse
lot(lot_zh_1, '3 Heqiao Lu', shuixiang_zhen).
lot_type(lot_zh_1, buildable).
lot_district(lot_zh_1, old_canal).
lot_street(lot_zh_1, heqiao_lu).
lot_side(lot_zh_1, left).
lot_house_number(lot_zh_1, 3).
building(lot_zh_1, business, teahouse).
business(lot_zh_1, 'Mingqian Chaguan', teahouse).
business_founded(lot_zh_1, 1985).

%% 10 Heqiao Lu -- Dumpling Shop
lot(lot_zh_2, '10 Heqiao Lu', shuixiang_zhen).
lot_type(lot_zh_2, buildable).
lot_district(lot_zh_2, old_canal).
lot_street(lot_zh_2, heqiao_lu).
lot_side(lot_zh_2, right).
lot_house_number(lot_zh_2, 10).
building(lot_zh_2, business, restaurant).
business(lot_zh_2, 'Wang Ji Xiaolongbao', restaurant).
business_founded(lot_zh_2, 1998).

%% 18 Heqiao Lu -- Silk Boutique
lot(lot_zh_3, '18 Heqiao Lu', shuixiang_zhen).
lot_type(lot_zh_3, buildable).
lot_district(lot_zh_3, old_canal).
lot_street(lot_zh_3, heqiao_lu).
lot_side(lot_zh_3, left).
lot_house_number(lot_zh_3, 18).
building(lot_zh_3, business, shop).
business(lot_zh_3, 'Jiangnan Sichou Fang', shop).
business_founded(lot_zh_3, 2005).

%% 25 Heqiao Lu -- Residence
lot(lot_zh_4, '25 Heqiao Lu', shuixiang_zhen).
lot_type(lot_zh_4, buildable).
lot_district(lot_zh_4, old_canal).
lot_street(lot_zh_4, heqiao_lu).
lot_side(lot_zh_4, right).
lot_house_number(lot_zh_4, 25).
building(lot_zh_4, residence, house).

%% 5 Lianhe Jie -- Night Market
lot(lot_zh_5, '5 Lianhe Jie', shuixiang_zhen).
lot_type(lot_zh_5, buildable).
lot_district(lot_zh_5, old_canal).
lot_street(lot_zh_5, lianhe_jie).
lot_side(lot_zh_5, left).
lot_house_number(lot_zh_5, 5).
building(lot_zh_5, business, market).
business(lot_zh_5, 'Shuixiang Yeshi', market).
business_founded(lot_zh_5, 2010).

%% 12 Lianhe Jie -- Calligraphy Studio
lot(lot_zh_6, '12 Lianhe Jie', shuixiang_zhen).
lot_type(lot_zh_6, buildable).
lot_district(lot_zh_6, old_canal).
lot_street(lot_zh_6, lianhe_jie).
lot_side(lot_zh_6, right).
lot_house_number(lot_zh_6, 12).
building(lot_zh_6, business, workshop).
business(lot_zh_6, 'Moxiang Shufa Yuan', workshop).
business_founded(lot_zh_6, 2001).

%% 20 Lianhe Jie -- Traditional Pharmacy
lot(lot_zh_7, '20 Lianhe Jie', shuixiang_zhen).
lot_type(lot_zh_7, buildable).
lot_district(lot_zh_7, old_canal).
lot_street(lot_zh_7, lianhe_jie).
lot_side(lot_zh_7, left).
lot_house_number(lot_zh_7, 20).
building(lot_zh_7, business, pharmacy).
business(lot_zh_7, 'Baohetang Yaodian', pharmacy).
business_founded(lot_zh_7, 1960).

%% 28 Lianhe Jie -- Rice Wine Shop
lot(lot_zh_8, '28 Lianhe Jie', shuixiang_zhen).
lot_type(lot_zh_8, buildable).
lot_district(lot_zh_8, old_canal).
lot_street(lot_zh_8, lianhe_jie).
lot_side(lot_zh_8, right).
lot_house_number(lot_zh_8, 28).
building(lot_zh_8, business, shop).
business(lot_zh_8, 'Huangjiu Zhuanmai', shop).
business_founded(lot_zh_8, 1992).

%% 3 Qingshi Xiang -- Embroidery Workshop
lot(lot_zh_9, '3 Qingshi Xiang', shuixiang_zhen).
lot_type(lot_zh_9, buildable).
lot_district(lot_zh_9, old_canal).
lot_street(lot_zh_9, qingshi_xiang).
lot_side(lot_zh_9, left).
lot_house_number(lot_zh_9, 3).
building(lot_zh_9, business, workshop).
business(lot_zh_9, 'Suzhou Cixiu Guan', workshop).
business_founded(lot_zh_9, 2003).

%% 10 Qingshi Xiang -- Residence
lot(lot_zh_10, '10 Qingshi Xiang', shuixiang_zhen).
lot_type(lot_zh_10, buildable).
lot_district(lot_zh_10, old_canal).
lot_street(lot_zh_10, qingshi_xiang).
lot_side(lot_zh_10, right).
lot_house_number(lot_zh_10, 10).
building(lot_zh_10, residence, house).

%% 18 Qingshi Xiang -- Noodle Restaurant
lot(lot_zh_11, '18 Qingshi Xiang', shuixiang_zhen).
lot_type(lot_zh_11, buildable).
lot_district(lot_zh_11, old_canal).
lot_street(lot_zh_11, qingshi_xiang).
lot_side(lot_zh_11, left).
lot_house_number(lot_zh_11, 18).
building(lot_zh_11, business, restaurant).
business(lot_zh_11, 'Lao Zhang Mian Guan', restaurant).
business_founded(lot_zh_11, 1988).

%% 5 Zhongshan Lu -- Supermarket
lot(lot_zh_12, '5 Zhongshan Lu', shuixiang_zhen).
lot_type(lot_zh_12, buildable).
lot_district(lot_zh_12, modern_center).
lot_street(lot_zh_12, zhongshan_lu).
lot_side(lot_zh_12, left).
lot_house_number(lot_zh_12, 5).
building(lot_zh_12, business, grocerystore).
business(lot_zh_12, 'Lianhua Chaoshi', grocerystore).
business_founded(lot_zh_12, 2008).

%% 15 Zhongshan Lu -- Mobile Phone Shop
lot(lot_zh_13, '15 Zhongshan Lu', shuixiang_zhen).
lot_type(lot_zh_13, buildable).
lot_district(lot_zh_13, modern_center).
lot_street(lot_zh_13, zhongshan_lu).
lot_side(lot_zh_13, right).
lot_house_number(lot_zh_13, 15).
building(lot_zh_13, business, shop).
business(lot_zh_13, 'Huawei Shouji Dian', shop).
business_founded(lot_zh_13, 2015).

%% 22 Zhongshan Lu -- Bubble Tea Shop
lot(lot_zh_14, '22 Zhongshan Lu', shuixiang_zhen).
lot_type(lot_zh_14, buildable).
lot_district(lot_zh_14, modern_center).
lot_street(lot_zh_14, zhongshan_lu).
lot_side(lot_zh_14, left).
lot_house_number(lot_zh_14, 22).
building(lot_zh_14, business, cafe).
business(lot_zh_14, 'Yidian Naicha', cafe).
business_founded(lot_zh_14, 2018).

%% 30 Zhongshan Lu -- Bookstore
lot(lot_zh_15, '30 Zhongshan Lu', shuixiang_zhen).
lot_type(lot_zh_15, buildable).
lot_district(lot_zh_15, modern_center).
lot_street(lot_zh_15, zhongshan_lu).
lot_side(lot_zh_15, right).
lot_house_number(lot_zh_15, 30).
building(lot_zh_15, business, bookstore).
business(lot_zh_15, 'Xinhua Shudian', bookstore).
business_founded(lot_zh_15, 1990).

%% 38 Zhongshan Lu -- Hotel
lot(lot_zh_16, '38 Zhongshan Lu', shuixiang_zhen).
lot_type(lot_zh_16, buildable).
lot_district(lot_zh_16, modern_center).
lot_street(lot_zh_16, zhongshan_lu).
lot_side(lot_zh_16, left).
lot_house_number(lot_zh_16, 38).
building(lot_zh_16, business, hotel).
business(lot_zh_16, 'Shuixiang Dajiudian', hotel).
business_founded(lot_zh_16, 2012).

%% 8 Xinhua Lu -- Language School
lot(lot_zh_17, '8 Xinhua Lu', shuixiang_zhen).
lot_type(lot_zh_17, buildable).
lot_district(lot_zh_17, modern_center).
lot_street(lot_zh_17, xinhua_lu).
lot_side(lot_zh_17, left).
lot_house_number(lot_zh_17, 8).
building(lot_zh_17, business, school).
business(lot_zh_17, 'Shuixiang Hanyu Xuexiao', school).
business_founded(lot_zh_17, 2010).

%% 16 Xinhua Lu -- Fitness Center
lot(lot_zh_18, '16 Xinhua Lu', shuixiang_zhen).
lot_type(lot_zh_18, buildable).
lot_district(lot_zh_18, modern_center).
lot_street(lot_zh_18, xinhua_lu).
lot_side(lot_zh_18, right).
lot_house_number(lot_zh_18, 16).
building(lot_zh_18, business, gym).
business(lot_zh_18, 'Jianshen Zhongxin', gym).
business_founded(lot_zh_18, 2016).

%% 24 Xinhua Lu -- Residence
lot(lot_zh_19, '24 Xinhua Lu', shuixiang_zhen).
lot_type(lot_zh_19, buildable).
lot_district(lot_zh_19, modern_center).
lot_street(lot_zh_19, xinhua_lu).
lot_side(lot_zh_19, left).
lot_house_number(lot_zh_19, 24).
building(lot_zh_19, residence, apartment).

%% 32 Xinhua Lu -- Hotpot Restaurant
lot(lot_zh_20, '32 Xinhua Lu', shuixiang_zhen).
lot_type(lot_zh_20, buildable).
lot_district(lot_zh_20, modern_center).
lot_street(lot_zh_20, xinhua_lu).
lot_side(lot_zh_20, right).
lot_house_number(lot_zh_20, 32).
building(lot_zh_20, business, restaurant).
business(lot_zh_20, 'Chuanwei Huoguo', restaurant).
business_founded(lot_zh_20, 2014).

%% 5 Yuanlin Lu -- Scholar Garden (Harmony Garden)
lot(lot_zh_21, '5 Yuanlin Lu', shuixiang_zhen).
lot_type(lot_zh_21, buildable).
lot_district(lot_zh_21, scholar_garden).
lot_street(lot_zh_21, yuanlin_lu).
lot_side(lot_zh_21, left).
lot_house_number(lot_zh_21, 5).
building(lot_zh_21, civic, park).

%% 15 Yuanlin Lu -- Tea Art School
lot(lot_zh_22, '15 Yuanlin Lu', shuixiang_zhen).
lot_type(lot_zh_22, buildable).
lot_district(lot_zh_22, scholar_garden).
lot_street(lot_zh_22, yuanlin_lu).
lot_side(lot_zh_22, right).
lot_house_number(lot_zh_22, 15).
building(lot_zh_22, business, school).
business(lot_zh_22, 'Chayi Xuexiao', school).
business_founded(lot_zh_22, 2006).

%% 22 Yuanlin Lu -- Residence
lot(lot_zh_23, '22 Yuanlin Lu', shuixiang_zhen).
lot_type(lot_zh_23, buildable).
lot_district(lot_zh_23, scholar_garden).
lot_street(lot_zh_23, yuanlin_lu).
lot_side(lot_zh_23, left).
lot_house_number(lot_zh_23, 22).
building(lot_zh_23, residence, house).

%% 30 Yuanlin Lu -- Antique Shop
lot(lot_zh_24, '30 Yuanlin Lu', shuixiang_zhen).
lot_type(lot_zh_24, buildable).
lot_district(lot_zh_24, scholar_garden).
lot_street(lot_zh_24, yuanlin_lu).
lot_side(lot_zh_24, right).
lot_house_number(lot_zh_24, 30).
building(lot_zh_24, business, shop).
business(lot_zh_24, 'Guwan Shangdian', shop).
business_founded(lot_zh_24, 1999).

%% 5 Gaotie Dadao -- High-Speed Rail Station
lot(lot_zh_25, '5 Gaotie Dadao', shuixiang_zhen).
lot_type(lot_zh_25, buildable).
lot_district(lot_zh_25, station_quarter).
lot_street(lot_zh_25, gaotie_dadao).
lot_side(lot_zh_25, left).
lot_house_number(lot_zh_25, 5).
building(lot_zh_25, civic, train_station).

%% 15 Gaotie Dadao -- Convenience Store
lot(lot_zh_26, '15 Gaotie Dadao', shuixiang_zhen).
lot_type(lot_zh_26, buildable).
lot_district(lot_zh_26, station_quarter).
lot_street(lot_zh_26, gaotie_dadao).
lot_side(lot_zh_26, right).
lot_house_number(lot_zh_26, 15).
building(lot_zh_26, business, shop).
business(lot_zh_26, 'Quanjia Bianli Dian', shop).
business_founded(lot_zh_26, 2013).

%% 22 Gaotie Dadao -- Fast Food Restaurant
lot(lot_zh_27, '22 Gaotie Dadao', shuixiang_zhen).
lot_type(lot_zh_27, buildable).
lot_district(lot_zh_27, station_quarter).
lot_street(lot_zh_27, gaotie_dadao).
lot_side(lot_zh_27, left).
lot_house_number(lot_zh_27, 22).
building(lot_zh_27, business, restaurant).
business(lot_zh_27, 'Zhenkunfu Kuaican', restaurant).
business_founded(lot_zh_27, 2014).

%% 30 Gaotie Dadao -- Residence
lot(lot_zh_28, '30 Gaotie Dadao', shuixiang_zhen).
lot_type(lot_zh_28, buildable).
lot_district(lot_zh_28, station_quarter).
lot_street(lot_zh_28, gaotie_dadao).
lot_side(lot_zh_28, right).
lot_house_number(lot_zh_28, 30).
building(lot_zh_28, residence, apartment).

%% 38 Gaotie Dadao -- Courier Station
lot(lot_zh_29, '38 Gaotie Dadao', shuixiang_zhen).
lot_type(lot_zh_29, buildable).
lot_district(lot_zh_29, station_quarter).
lot_street(lot_zh_29, gaotie_dadao).
lot_side(lot_zh_29, left).
lot_house_number(lot_zh_29, 38).
building(lot_zh_29, business, shop).
business(lot_zh_29, 'Shunfeng Kuaidi Zhan', shop).
business_founded(lot_zh_29, 2016).

%% Hehua Cun Village Lots

%% 3 Hetang Lu -- Village Temple
lot(lot_zh_30, '3 Hetang Lu', hehua_cun).
lot_type(lot_zh_30, buildable).
lot_district(lot_zh_30, village_core).
lot_street(lot_zh_30, hetang_lu).
lot_side(lot_zh_30, left).
lot_house_number(lot_zh_30, 3).
building(lot_zh_30, civic, temple).

%% 10 Hetang Lu -- Village General Store
lot(lot_zh_31, '10 Hetang Lu', hehua_cun).
lot_type(lot_zh_31, buildable).
lot_district(lot_zh_31, village_core).
lot_street(lot_zh_31, hetang_lu).
lot_side(lot_zh_31, right).
lot_house_number(lot_zh_31, 10).
building(lot_zh_31, business, shop).
business(lot_zh_31, 'Zhao Jia Zahuodian', shop).
business_founded(lot_zh_31, 1978).

%% 18 Hetang Lu -- Tofu Workshop
lot(lot_zh_32, '18 Hetang Lu', hehua_cun).
lot_type(lot_zh_32, buildable).
lot_district(lot_zh_32, village_core).
lot_street(lot_zh_32, hetang_lu).
lot_side(lot_zh_32, left).
lot_house_number(lot_zh_32, 18).
building(lot_zh_32, business, workshop).
business(lot_zh_32, 'Chen Jia Doufu Fang', workshop).
business_founded(lot_zh_32, 1965).

%% 5 Sangye Jie -- Silk Workshop
lot(lot_zh_33, '5 Sangye Jie', hehua_cun).
lot_type(lot_zh_33, buildable).
lot_district(lot_zh_33, village_core).
lot_street(lot_zh_33, sangye_jie).
lot_side(lot_zh_33, left).
lot_house_number(lot_zh_33, 5).
building(lot_zh_33, business, workshop).
business(lot_zh_33, 'Hehua Cansi Fang', workshop).
business_founded(lot_zh_33, 1950).

%% 12 Sangye Jie -- Residence
lot(lot_zh_34, '12 Sangye Jie', hehua_cun).
lot_type(lot_zh_34, buildable).
lot_district(lot_zh_34, village_core).
lot_street(lot_zh_34, sangye_jie).
lot_side(lot_zh_34, right).
lot_house_number(lot_zh_34, 12).
building(lot_zh_34, residence, house).

%% 20 Sangye Jie -- Residence
lot(lot_zh_35, '20 Sangye Jie', hehua_cun).
lot_type(lot_zh_35, buildable).
lot_district(lot_zh_35, village_core).
lot_street(lot_zh_35, sangye_jie).
lot_side(lot_zh_35, left).
lot_house_number(lot_zh_35, 20).
building(lot_zh_35, residence, house).
