%% Insimul Characters: Historical Victorian
%% Source: data/worlds/historical_victorian/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (6 families/groups)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Ashworth Family (Aristocrats, Manor and Mayfair Quarter)
%% ═══════════════════════════════════════════════════════════

%% Lord Edmund Ashworth -- Industrialist and landowner
person(edmund_ashworth).
first_name(edmund_ashworth, 'Edmund').
last_name(edmund_ashworth, 'Ashworth').
full_name(edmund_ashworth, 'Lord Edmund Ashworth').
gender(edmund_ashworth, male).
alive(edmund_ashworth).
generation(edmund_ashworth, 0).
founder_family(edmund_ashworth).
child(edmund_ashworth, charlotte_ashworth).
child(edmund_ashworth, henry_ashworth).
spouse(edmund_ashworth, margaret_ashworth).
location(edmund_ashworth, ironhaven).

%% Lady Margaret Ashworth -- Society matriarch
person(margaret_ashworth).
first_name(margaret_ashworth, 'Margaret').
last_name(margaret_ashworth, 'Ashworth').
full_name(margaret_ashworth, 'Lady Margaret Ashworth').
gender(margaret_ashworth, female).
alive(margaret_ashworth).
generation(margaret_ashworth, 0).
spouse(margaret_ashworth, edmund_ashworth).
location(margaret_ashworth, ironhaven).

%% Charlotte Ashworth -- Rebellious daughter, interested in reform
person(charlotte_ashworth).
first_name(charlotte_ashworth, 'Charlotte').
last_name(charlotte_ashworth, 'Ashworth').
full_name(charlotte_ashworth, 'Charlotte Ashworth').
gender(charlotte_ashworth, female).
alive(charlotte_ashworth).
generation(charlotte_ashworth, 1).
parent(charlotte_ashworth, edmund_ashworth).
parent(charlotte_ashworth, margaret_ashworth).
location(charlotte_ashworth, ironhaven).

%% Henry Ashworth -- Heir, Oxford-educated dandy
person(henry_ashworth).
first_name(henry_ashworth, 'Henry').
last_name(henry_ashworth, 'Ashworth').
full_name(henry_ashworth, 'Henry Ashworth').
gender(henry_ashworth, male).
alive(henry_ashworth).
generation(henry_ashworth, 1).
parent(henry_ashworth, edmund_ashworth).
parent(henry_ashworth, margaret_ashworth).
location(henry_ashworth, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Blackwood Family (Factory Owners)
%% ═══════════════════════════════════════════════════════════

%% Silas Blackwood -- Self-made mill owner
person(silas_blackwood).
first_name(silas_blackwood, 'Silas').
last_name(silas_blackwood, 'Blackwood').
full_name(silas_blackwood, 'Silas Blackwood').
gender(silas_blackwood, male).
alive(silas_blackwood).
generation(silas_blackwood, 0).
founder_family(silas_blackwood).
child(silas_blackwood, thomas_blackwood).
location(silas_blackwood, ironhaven).

%% Thomas Blackwood -- Son, conflicted about factory conditions
person(thomas_blackwood).
first_name(thomas_blackwood, 'Thomas').
last_name(thomas_blackwood, 'Blackwood').
full_name(thomas_blackwood, 'Thomas Blackwood').
gender(thomas_blackwood, male).
alive(thomas_blackwood).
generation(thomas_blackwood, 1).
parent(thomas_blackwood, silas_blackwood).
location(thomas_blackwood, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Working Class Characters
%% ═══════════════════════════════════════════════════════════

%% Molly Flint -- Boarding house keeper, former workhouse inmate
person(molly_flint).
first_name(molly_flint, 'Molly').
last_name(molly_flint, 'Flint').
full_name(molly_flint, 'Molly Flint').
gender(molly_flint, female).
alive(molly_flint).
generation(molly_flint, 0).
location(molly_flint, ironhaven).

%% Jack Cinders -- Street urchin and pickpocket
person(jack_cinders).
first_name(jack_cinders, 'Jack').
last_name(jack_cinders, 'Cinders').
full_name(jack_cinders, 'Jack Cinders').
gender(jack_cinders, male).
alive(jack_cinders).
generation(jack_cinders, 1).
location(jack_cinders, ironhaven).

%% Agnes Whittle -- Mill worker and union organizer
person(agnes_whittle).
first_name(agnes_whittle, 'Agnes').
last_name(agnes_whittle, 'Whittle').
full_name(agnes_whittle, 'Agnes Whittle').
gender(agnes_whittle, female).
alive(agnes_whittle).
generation(agnes_whittle, 0).
location(agnes_whittle, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Professional Class
%% ═══════════════════════════════════════════════════════════

%% Inspector Rupert Hale -- Police detective
person(rupert_hale).
first_name(rupert_hale, 'Rupert').
last_name(rupert_hale, 'Hale').
full_name(rupert_hale, 'Inspector Rupert Hale').
gender(rupert_hale, male).
alive(rupert_hale).
generation(rupert_hale, 0).
location(rupert_hale, ironhaven).

%% Dr. Eliza Hartley -- Physician, rare female doctor
person(eliza_hartley).
first_name(eliza_hartley, 'Eliza').
last_name(eliza_hartley, 'Hartley').
full_name(eliza_hartley, 'Dr. Eliza Hartley').
gender(eliza_hartley, female).
alive(eliza_hartley).
generation(eliza_hartley, 0).
location(eliza_hartley, ironhaven).

%% Professor Alistair Pemberton -- Inventor and chemist
person(alistair_pemberton).
first_name(alistair_pemberton, 'Alistair').
last_name(alistair_pemberton, 'Pemberton').
full_name(alistair_pemberton, 'Professor Alistair Pemberton').
gender(alistair_pemberton, male).
alive(alistair_pemberton).
generation(alistair_pemberton, 0).
location(alistair_pemberton, ironhaven).

%% Reverend William Oakes -- Church of England clergyman
person(william_oakes).
first_name(william_oakes, 'William').
last_name(william_oakes, 'Oakes').
full_name(william_oakes, 'Reverend William Oakes').
gender(william_oakes, male).
alive(william_oakes).
generation(william_oakes, 0).
location(william_oakes, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Servants and Service Workers
%% ═══════════════════════════════════════════════════════════

%% Mrs. Nell Briggs -- Ashworth housekeeper
person(nell_briggs).
first_name(nell_briggs, 'Nell').
last_name(nell_briggs, 'Briggs').
full_name(nell_briggs, 'Mrs. Nell Briggs').
gender(nell_briggs, female).
alive(nell_briggs).
generation(nell_briggs, 0).
location(nell_briggs, ashworth_estate).

%% Arthur Graves -- Ashworth butler
person(arthur_graves).
first_name(arthur_graves, 'Arthur').
last_name(arthur_graves, 'Graves').
full_name(arthur_graves, 'Arthur Graves').
gender(arthur_graves, male).
alive(arthur_graves).
generation(arthur_graves, 0).
location(arthur_graves, ashworth_estate).

%% ═══════════════════════════════════════════════════════════
%% Docklands and Underworld
%% ═══════════════════════════════════════════════════════════

%% Shen Li -- Chinese immigrant, runs the Jade Lantern
person(shen_li).
first_name(shen_li, 'Shen').
last_name(shen_li, 'Li').
full_name(shen_li, 'Shen Li').
gender(shen_li, male).
alive(shen_li).
generation(shen_li, 0).
location(shen_li, ironhaven).

%% Barnaby Soot -- Chimney sweep master
person(barnaby_soot).
first_name(barnaby_soot, 'Barnaby').
last_name(barnaby_soot, 'Soot').
full_name(barnaby_soot, 'Barnaby Soot').
gender(barnaby_soot, male).
alive(barnaby_soot).
generation(barnaby_soot, 0).
location(barnaby_soot, ironhaven).
