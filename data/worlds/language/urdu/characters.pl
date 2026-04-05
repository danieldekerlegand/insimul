%% Insimul Characters: Urdu Punjab
%% Source: data/worlds/language/urdu/characters.pl
%% Created: 2026-04-03
%% Total: 22 characters (families and community members in a contemporary Punjabi town)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% =====================================================================
%% Khan Family (merchants, old bazaar family)
%% =====================================================================

%% Rashid Khan -- patriarch, cloth merchant
person(rashid_khan).
first_name(rashid_khan, 'Rashid').
last_name(rashid_khan, 'Khan').
full_name(rashid_khan, 'Rashid Khan').
gender(rashid_khan, male).
alive(rashid_khan).
generation(rashid_khan, 0).
founder_family(rashid_khan).
child(rashid_khan, imran_khan_jr).
child(rashid_khan, sana_khan).
spouse(rashid_khan, nasreen_khan).
location(rashid_khan, noor_manzil).

%% Nasreen Khan -- matriarch, homemaker
person(nasreen_khan).
first_name(nasreen_khan, 'Nasreen').
last_name(nasreen_khan, 'Khan').
full_name(nasreen_khan, 'Nasreen Khan').
gender(nasreen_khan, female).
alive(nasreen_khan).
generation(nasreen_khan, 0).
founder_family(nasreen_khan).
child(nasreen_khan, imran_khan_jr).
child(nasreen_khan, sana_khan).
spouse(nasreen_khan, rashid_khan).
location(nasreen_khan, noor_manzil).

%% Imran Khan Jr -- son, runs the cloth shop
person(imran_khan_jr).
first_name(imran_khan_jr, 'Imran').
last_name(imran_khan_jr, 'Khan').
full_name(imran_khan_jr, 'Imran Khan').
gender(imran_khan_jr, male).
alive(imran_khan_jr).
generation(imran_khan_jr, 1).
parent(rashid_khan, imran_khan_jr).
parent(nasreen_khan, imran_khan_jr).
spouse(imran_khan_jr, ayesha_khan).
child(imran_khan_jr, zainab_khan).
location(imran_khan_jr, noor_manzil).

%% Ayesha Khan -- daughter-in-law, teaches at the madrasa
person(ayesha_khan).
first_name(ayesha_khan, 'Ayesha').
last_name(ayesha_khan, 'Khan').
full_name(ayesha_khan, 'Ayesha Khan').
gender(ayesha_khan, female).
alive(ayesha_khan).
generation(ayesha_khan, 1).
spouse(ayesha_khan, imran_khan_jr).
child(ayesha_khan, zainab_khan).
location(ayesha_khan, noor_manzil).

%% Zainab Khan -- granddaughter, university student
person(zainab_khan).
first_name(zainab_khan, 'Zainab').
last_name(zainab_khan, 'Khan').
full_name(zainab_khan, 'Zainab Khan').
gender(zainab_khan, female).
alive(zainab_khan).
generation(zainab_khan, 2).
parent(imran_khan_jr, zainab_khan).
parent(ayesha_khan, zainab_khan).
location(zainab_khan, noor_manzil).

%% Sana Khan -- daughter, pharmacist
person(sana_khan).
first_name(sana_khan, 'Sana').
last_name(sana_khan, 'Khan').
full_name(sana_khan, 'Sana Khan').
gender(sana_khan, female).
alive(sana_khan).
generation(sana_khan, 1).
parent(rashid_khan, sana_khan).
parent(nasreen_khan, sana_khan).
location(sana_khan, noor_manzil).

%% =====================================================================
%% Ahmed Family (scholars, university-connected)
%% =====================================================================

%% Professor Tariq Ahmed -- patriarch, Urdu literature professor
person(tariq_ahmed).
first_name(tariq_ahmed, 'Tariq').
last_name(tariq_ahmed, 'Ahmed').
full_name(tariq_ahmed, 'Professor Tariq Ahmed').
gender(tariq_ahmed, male).
alive(tariq_ahmed).
generation(tariq_ahmed, 0).
founder_family(tariq_ahmed).
child(tariq_ahmed, bilal_ahmed).
child(tariq_ahmed, fatima_ahmed).
spouse(tariq_ahmed, rukhsana_ahmed).
location(tariq_ahmed, noor_manzil).

%% Rukhsana Ahmed -- matriarch, poet
person(rukhsana_ahmed).
first_name(rukhsana_ahmed, 'Rukhsana').
last_name(rukhsana_ahmed, 'Ahmed').
full_name(rukhsana_ahmed, 'Rukhsana Ahmed').
gender(rukhsana_ahmed, female).
alive(rukhsana_ahmed).
generation(rukhsana_ahmed, 0).
founder_family(rukhsana_ahmed).
child(rukhsana_ahmed, bilal_ahmed).
child(rukhsana_ahmed, fatima_ahmed).
spouse(rukhsana_ahmed, tariq_ahmed).
location(rukhsana_ahmed, noor_manzil).

%% Bilal Ahmed -- son, chai stall owner
person(bilal_ahmed).
first_name(bilal_ahmed, 'Bilal').
last_name(bilal_ahmed, 'Ahmed').
full_name(bilal_ahmed, 'Bilal Ahmed').
gender(bilal_ahmed, male).
alive(bilal_ahmed).
generation(bilal_ahmed, 1).
parent(tariq_ahmed, bilal_ahmed).
parent(rukhsana_ahmed, bilal_ahmed).
location(bilal_ahmed, noor_manzil).

%% Fatima Ahmed -- daughter, calligrapher
person(fatima_ahmed).
first_name(fatima_ahmed, 'Fatima').
last_name(fatima_ahmed, 'Ahmed').
full_name(fatima_ahmed, 'Fatima Ahmed').
gender(fatima_ahmed, female).
alive(fatima_ahmed).
generation(fatima_ahmed, 1).
parent(tariq_ahmed, fatima_ahmed).
parent(rukhsana_ahmed, fatima_ahmed).
location(fatima_ahmed, noor_manzil).

%% =====================================================================
%% Malik Family (landed gentry from Sabz Pind)
%% =====================================================================

%% Chaudhry Aslam Malik -- patriarch, landowner
person(aslam_malik).
first_name(aslam_malik, 'Aslam').
last_name(aslam_malik, 'Malik').
full_name(aslam_malik, 'Chaudhry Aslam Malik').
gender(aslam_malik, male).
alive(aslam_malik).
generation(aslam_malik, 0).
founder_family(aslam_malik).
child(aslam_malik, hamza_malik).
child(aslam_malik, nadia_malik).
spouse(aslam_malik, parveen_malik).
location(aslam_malik, sabz_pind).

%% Parveen Malik -- matriarch
person(parveen_malik).
first_name(parveen_malik, 'Parveen').
last_name(parveen_malik, 'Malik').
full_name(parveen_malik, 'Parveen Malik').
gender(parveen_malik, female).
alive(parveen_malik).
generation(parveen_malik, 0).
founder_family(parveen_malik).
child(parveen_malik, hamza_malik).
child(parveen_malik, nadia_malik).
spouse(parveen_malik, aslam_malik).
location(parveen_malik, sabz_pind).

%% Hamza Malik -- son, agricultural supply shop owner
person(hamza_malik).
first_name(hamza_malik, 'Hamza').
last_name(hamza_malik, 'Malik').
full_name(hamza_malik, 'Hamza Malik').
gender(hamza_malik, male).
alive(hamza_malik).
generation(hamza_malik, 1).
parent(aslam_malik, hamza_malik).
parent(parveen_malik, hamza_malik).
location(hamza_malik, sabz_pind).

%% Nadia Malik -- daughter, school teacher in Noor Manzil
person(nadia_malik).
first_name(nadia_malik, 'Nadia').
last_name(nadia_malik, 'Malik').
full_name(nadia_malik, 'Nadia Malik').
gender(nadia_malik, female).
alive(nadia_malik).
generation(nadia_malik, 1).
parent(aslam_malik, nadia_malik).
parent(parveen_malik, nadia_malik).
location(nadia_malik, noor_manzil).

%% =====================================================================
%% Butt Family (spice merchants)
%% =====================================================================

%% Haji Yousuf Butt -- patriarch, spice shop owner
person(yousuf_butt).
first_name(yousuf_butt, 'Yousuf').
last_name(yousuf_butt, 'Butt').
full_name(yousuf_butt, 'Haji Yousuf Butt').
gender(yousuf_butt, male).
alive(yousuf_butt).
generation(yousuf_butt, 0).
founder_family(yousuf_butt).
child(yousuf_butt, usman_butt).
spouse(yousuf_butt, sabiha_butt).
location(yousuf_butt, noor_manzil).

%% Sabiha Butt -- matriarch, famous cook
person(sabiha_butt).
first_name(sabiha_butt, 'Sabiha').
last_name(sabiha_butt, 'Butt').
full_name(sabiha_butt, 'Sabiha Butt').
gender(sabiha_butt, female).
alive(sabiha_butt).
generation(sabiha_butt, 0).
founder_family(sabiha_butt).
child(sabiha_butt, usman_butt).
spouse(sabiha_butt, yousuf_butt).
location(sabiha_butt, noor_manzil).

%% Usman Butt -- son, biryani restaurant owner
person(usman_butt).
first_name(usman_butt, 'Usman').
last_name(usman_butt, 'Butt').
full_name(usman_butt, 'Usman Butt').
gender(usman_butt, male).
alive(usman_butt).
generation(usman_butt, 1).
parent(yousuf_butt, usman_butt).
parent(sabiha_butt, usman_butt).
location(usman_butt, noor_manzil).

%% =====================================================================
%% Community Members (unrelated individuals)
%% =====================================================================

%% Maulana Hussain Shah -- imam of the Jama Masjid
person(hussain_shah).
first_name(hussain_shah, 'Hussain').
last_name(hussain_shah, 'Shah').
full_name(hussain_shah, 'Maulana Hussain Shah').
gender(hussain_shah, male).
alive(hussain_shah).
generation(hussain_shah, 0).
location(hussain_shah, noor_manzil).

%% Jameel Ali -- master tailor
person(jameel_ali).
first_name(jameel_ali, 'Jameel').
last_name(jameel_ali, 'Ali').
full_name(jameel_ali, 'Ustad Jameel Ali').
gender(jameel_ali, male).
alive(jameel_ali).
generation(jameel_ali, 0).
location(jameel_ali, noor_manzil).

%% Qamar Hussain -- photocopy shop owner, student activist
person(qamar_hussain).
first_name(qamar_hussain, 'Qamar').
last_name(qamar_hussain, 'Hussain').
full_name(qamar_hussain, 'Qamar Hussain').
gender(qamar_hussain, male).
alive(qamar_hussain).
generation(qamar_hussain, 1).
location(qamar_hussain, noor_manzil).
