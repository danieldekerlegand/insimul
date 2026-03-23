% Insimul Knowledge Base - Auto-generated for game export
% Generated: 2026-03-23T03:56:15.772Z

% === NPC Reasoning Rules ===
% NPC Reasoning Rules - Auto-generated
% Generated: 2026-03-23T03:56:15.773Z

:- dynamic(attracted_to/2).
:- dynamic(dating/3).
:- dynamic(married_to/2).
:- dynamic(marriage_date/3).
:- dynamic(divorced_from/3).
:- dynamic(pregnant/3).
:- dynamic(gave_birth/3).
:- dynamic(birth_parent/2).
:- dynamic(primary_caregiver/2).
:- dynamic(stepparent/2).
:- dynamic(student/1).
:- dynamic(student_of/3).
:- dynamic(graduated/3).
:- dynamic(mentor/3).
:- dynamic(apprentice/3).
:- dynamic(has_skill/3).
:- dynamic(learning/3).
:- dynamic(came_of_age/2).
:- dynamic(eligible_for_marriage/1).
:- dynamic(eligible_for_work/1).
:- dynamic(deceased/3).
:- dynamic(cause_of_death/2).
:- dynamic(inherits_from/3).
:- dynamic(estate_of/2).
:- dynamic(friends/2).
:- dynamic(enemies/2).
:- dynamic(rival/2).
:- dynamic(conversation_count/3).
:- dynamic(relationship_charge/3).
:- dynamic(relationship_trust/3).
:- dynamic(current_timestep/1).
:- dynamic(mood/2).
:- dynamic(stress_level/2).
:- dynamic(social_desire/2).
:- dynamic(npc_action_preference/3).
:- dynamic(dialogue_topic_preference/3).
:- dynamic(personality/3).
:- dynamic(employed/1).
:- dynamic(employed_at/3).
:- dynamic(business_needs_worker/2).
:- dynamic(schedule/4).
:- dynamic(time_of_day/1).
:- dynamic(npc_gave_quest/3).
:- dynamic(quest_outcome/3).
:- dynamic(npc_quest_count/3).
:- dynamic(npc_quest_completed_count/3).
:- dynamic(npc_quest_failed_count/3).
:- dynamic(npc_quest_abandoned_count/3).
:- dynamic(weather/1).
:- dynamic(game_hour/1).
:- dynamic(time_period/1).
:- dynamic(season/1).
:- dynamic(player_quests_completed/1).
:- dynamic(player_reputation/1).
:- dynamic(player_is_new/0).
:- dynamic(quest_active/2).
:- dynamic(quest_completed/2).
:- dynamic(quest_failed/2).
:- dynamic(recent_event/2).

child(X) :- age(X, A), A < 18.
adolescent(X) :- age(X, A), A >= 13, A < 18.
adult(X) :- age(X, A), A >= 18.
elderly(X) :- age(X, A), A >= 65.
unmarried(X) :- person(X), \+ married_to(X, _).
grandmother_of(GM, GC) :- gender(GM, female), grandparent_of(GM, GC).
grandfather_of(GF, GC) :- gender(GF, male), grandparent_of(GF, GC).
aunt_of(A, N) :- gender(A, female), sibling_of(A, P), parent_of(P, N).
uncle_of(U, N) :- gender(U, male), sibling_of(U, P), parent_of(P, N).
cousin_of(C1, C2) :- parent_of(P1, C1), parent_of(P2, C2), sibling_of(P1, P2), C1 \= C2.
parent_in_law(PIL, CIL) :- parent_of(PIL, Spouse), married_to(Spouse, CIL).
sibling_in_law(SIL1, SIL2) :- sibling_of(SIL1, Spouse), married_to(Spouse, SIL2).
can_be_attracted(X, Y) :- adult(X), adult(Y), unmarried(X), unmarried(Y), X \= Y, \+ attracted_to(X, Y).
mutual_attraction(X, Y) :- attracted_to(X, Y), attracted_to(Y, X).
can_start_dating(X, Y) :- mutual_attraction(X, Y), \+ dating(X, _, _), \+ dating(Y, _, _).
long_dating(X, Y) :- dating(X, Y, Start), current_timestep(Now), D is Now - Start, D > 200.
can_propose(X, Y) :- long_dating(X, Y), relationship_trust(X, Y, T), T > 0.8.
can_have_child(X, Y) :- married_to(X, Y), gender(X, female), age(X, A), A >= 18, A =< 45, \+ pregnant(X, _, _).
can_start_school(X) :- child(X), age(X, A), A >= 6, \+ student(X).
can_apprentice(X) :- adolescent(X), age(X, A), A >= 14, \+ apprentice(X, _, _).
skilled_in(X, Skill) :- has_skill(X, Skill, Level), Level >= 3.
newly_adult(X) :- came_of_age(X, T), current_timestep(Now), D is Now - T, D < 10.
can_seek_employment(X) :- adult(X), \+ employed(X).
alive(X) :- person(X), \+ deceased(X, _, _).
is_deceased(X) :- deceased(X, _, _).
has_living_children(X) :- parent_of(X, C), alive(C).
wants_to_socialize(X) :- personality(X, extroversion, E), E > 0.5, social_desire(X, D), D > 0.3.
wants_solitude(X) :- personality(X, extroversion, E), E < 0.3.
is_stressed(X) :- stress_level(X, S), S > 0.7.
needs_rest(X) :- energy(X, E), E < 20.
should_talk_to(X, Y) :- wants_to_socialize(X), person(Y), X \= Y, alive(Y), same_location(X, Y), \+ enemies(X, Y).
should_avoid(X, Y) :- enemies(X, Y), alive(Y).
prefers_topic(X, ideas) :- personality(X, openness, O), O > 0.7.
prefers_topic(X, work) :- personality(X, conscientiousness, C), C > 0.7.
prefers_topic(X, gossip) :- personality(X, extroversion, E), E > 0.7.
prefers_topic(X, feelings) :- personality(X, neuroticism, N), N > 0.6.
prefers_topic(X, cooperation) :- personality(X, agreeableness, A), A > 0.7.
prefers_peaceful_action(X) :- personality(X, agreeableness, A), A > 0.6.
prefers_risky_action(X) :- personality(X, openness, O), O > 0.7, personality(X, conscientiousness, C), C < 0.4.
prefers_social_action(X) :- personality(X, extroversion, E), E > 0.6.
conflict_style(X, compromise) :- personality(X, agreeableness, A), A > 0.5, personality(X, extroversion, E), E > 0.5.
conflict_style(X, submit) :- personality(X, agreeableness, A), A > 0.5, personality(X, extroversion, E), E =< 0.5.
conflict_style(X, dominate) :- personality(X, agreeableness, A), A =< 0.5, personality(X, extroversion, E), E > 0.5.
conflict_style(X, withdraw) :- personality(X, agreeableness, A), A =< 0.5, personality(X, extroversion, E), E =< 0.5.
can_befriend(X, Y) :- person(X), person(Y), X \= Y, alive(X), alive(Y), \+ friends(X, Y), \+ enemies(X, Y), same_location(X, Y).
should_befriend(X, Y) :- can_befriend(X, Y), personality(X, agreeableness, A), A > 0.5.
good_relationship(X, Y) :- relationship_charge(X, Y, C), C > 5.
bad_relationship(X, Y) :- relationship_charge(X, Y, C), C < -5.
trusted_person(X, Y) :- relationship_trust(X, Y, T), T > 0.6.
distrusted_person(X, Y) :- relationship_trust(X, Y, T), T < 0.3.
willing_to_share(X, Y) :- trusted_person(X, Y), personality(X, agreeableness, A), A > 0.4.
will_gossip(X, Y) :- personality(X, extroversion, E), E > 0.6, \+ distrusted_person(X, Y).
will_keep_secret(X) :- personality(X, agreeableness, A), A > 0.7, personality(X, conscientiousness, C), C > 0.6.
has_family_obligation(X, Y) :- parent_of(X, Y), child(Y).
has_family_obligation(X, Y) :- married_to(X, Y).
has_family_obligation(X, Y) :- primary_caregiver(X, Y).
is_happy(X) :- mood(X, happy).
is_happy(X) :- mood(X, joyful).
is_sad(X) :- mood(X, sad).
is_sad(X) :- mood(X, grieving).
is_angry(X) :- mood(X, angry).
is_anxious(X) :- mood(X, anxious).
is_content(X) :- mood(X, content).
is_grieving(X) :- parent_of(X, C), is_deceased(C).
is_grieving(X) :- married_to(X, S), is_deceased(S).
is_grieving(X) :- parent_of(P, X), is_deceased(P).
is_lonely(X) :- wants_to_socialize(X), \+ friends(X, _).
is_lonely(X) :- wants_to_socialize(X), social_desire(X, D), D > 0.8.
is_fulfilled(X) :- employed(X), has_living_children(X), married_to(X, _).
is_partially_fulfilled(X) :- employed(X), friends(X, _).
remembers_player(NPC) :- knows(NPC, player, name).
had_positive_interaction(NPC, Player) :- relationship_charge(NPC, Player, C), C > 0.
had_negative_interaction(NPC, Player) :- relationship_charge(NPC, Player, C), C < 0.
first_meeting(NPC, Player) :- \+ has_mental_model(NPC, Player).
npc_remembers_quest(NPC, Player, QuestId) :- npc_gave_quest(NPC, Player, QuestId).
player_completed_quest_for(NPC, Player) :- npc_gave_quest(NPC, Player, Q), quest_outcome(Q, Player, completed).
player_failed_quest_for(NPC, Player) :- npc_gave_quest(NPC, Player, Q), quest_outcome(Q, Player, failed).
player_abandoned_quest_for(NPC, Player) :- npc_gave_quest(NPC, Player, Q), quest_outcome(Q, Player, abandoned).
npc_eager_to_give_quest(NPC, Player) :- npc_quest_completed_count(NPC, Player, C), C > 0, \+ player_failed_quest_for(NPC, Player), \+ player_abandoned_quest_for(NPC, Player).
npc_cautious_about_quest(NPC, Player) :- player_failed_quest_for(NPC, Player), player_completed_quest_for(NPC, Player).
npc_reluctant_to_give_quest(NPC, Player) :- npc_quest_failed_count(NPC, Player, F), F > 0, \+ player_completed_quest_for(NPC, Player).
npc_reluctant_to_give_quest(NPC, Player) :- npc_quest_abandoned_count(NPC, Player, A), A >= 2.
should_mention_past_quest(NPC, Player) :- npc_gave_quest(NPC, Player, _).
should_thank_player(NPC, Player) :- player_completed_quest_for(NPC, Player).
should_scold_player(NPC, Player) :- player_abandoned_quest_for(NPC, Player), personality(NPC, agreeableness, A), A < 0.5.
should_encourage_player(NPC, Player) :- player_failed_quest_for(NPC, Player), personality(NPC, agreeableness, A), A > 0.5.
should_seek_shelter(X) :- weather(storm), personality(X, neuroticism, N), N > 0.4.
should_seek_shelter(X) :- weather(rain), personality(X, conscientiousness, C), C > 0.6.
enjoys_weather(X) :- weather(clear), personality(X, openness, O), O > 0.5.
enjoys_weather(X) :- weather(snow), personality(X, openness, O), O > 0.7.
weather_complaint_likely(X) :- weather(storm), personality(X, neuroticism, N), N > 0.5.
weather_complaint_likely(X) :- weather(rain), personality(X, neuroticism, N), N > 0.6.
prefers_topic(X, morning_routine) :- time_period(morning), personality(X, conscientiousness, C), C > 0.5.
prefers_topic(X, evening_plans) :- time_period(evening), personality(X, extroversion, E), E > 0.5.
prefers_topic(X, weather) :- weather(rain).
prefers_topic(X, weather) :- weather(storm).
prefers_topic(X, weather) :- weather(snow).
prefers_topic(X, quests) :- npc_gave_quest(X, player, _), quest_active(player, _).
is_quest_giver(X) :- npc_gave_quest(X, player, _).
respects_player(NPC) :- player_quests_completed(C), C > 3, personality(NPC, conscientiousness, Con), Con > 0.3.
impressed_by_player(NPC) :- player_quests_completed(C), C > 5, player_reputation(R), R > 50.
wary_of_newcomer(NPC) :- player_is_new, personality(NPC, neuroticism, N), N > 0.5.
welcoming_to_newcomer(NPC) :- player_is_new, personality(NPC, agreeableness, A), A > 0.5.
should_be_sleeping(X) :- time_period(night), personality(X, conscientiousness, C), C > 0.6.
is_night_owl(X) :- time_period(night), personality(X, openness, O), O > 0.6, personality(X, conscientiousness, C), C < 0.4.
schedule(X, morning, workplace, work) :- person(X), occupation(X, _), \+ dead(X).
schedule(X, afternoon, workplace, work) :- person(X), occupation(X, _), \+ dead(X).
schedule(X, evening, home, rest) :- person(X), \+ dead(X).
schedule(X, night, home, sleep) :- person(X), \+ dead(X).
schedule(X, morning, school, study) :- person(X), school_age(X), \+ dead(X).
schedule(X, afternoon, school, study) :- person(X), school_age(X), \+ dead(X).
schedule(X, evening, tavern, socialize) :- person(X), should_socialize(X), \+ dead(X).
schedule(X, morning, home, grieve) :- person(X), grieving(X).
schedule(X, afternoon, home, grieve) :- person(X), grieving(X).
expected_location(X, Location) :- time_of_day(T), schedule(X, T, Location, _).
expected_activity(X, Activity) :- time_of_day(T), schedule(X, T, _, Activity).
school_age(X) :- child(X), age(X, A), A >= 6.
should_socialize(X) :- wants_to_socialize(X).
grieving(X) :- is_grieving(X).

% === TotT Social Simulation Predicates ===
% Talk of the Town - Social Simulation Prolog Predicates
% Generated: 2026-03-23T03:56:15.773Z

:- dynamic(qualified_for/2).
:- dynamic(has_experience/3).
:- dynamic(available_position/2).
:- dynamic(position_skill_requirement/3).
:- dynamic(employed_at/3).
:- dynamic(job_level/2).
:- dynamic(salary/2).
:- dynamic(years_experience/3).
:- dynamic(compatibility/3).
:- dynamic(charge/3).
:- dynamic(spark/3).
:- dynamic(trust/3).
:- dynamic(salience/3).
:- dynamic(social_desire/2).
:- dynamic(wealth/2).
:- dynamic(economic_class/2).
:- dynamic(owns_business/2).
:- dynamic(market_price/3).
:- dynamic(supply/3).
:- dynamic(demand/3).
:- dynamic(debt/3).
:- dynamic(income/2).
:- dynamic(romantic_status/3).
:- dynamic(pregnant/3).
:- dynamic(education/4).
:- dynamic(life_stage/2).
:- dynamic(death_probability/2).
:- dynamic(dating/3).
:- dynamic(married_to/2).
:- dynamic(divorced_from/3).
:- dynamic(attracted_to/2).
:- dynamic(current_timestep/1).
:- dynamic(current_year/1).

% === Hiring System ===
qualified_for(Person, Position) :- has_skill(Person, Skill, Level), position_skill_requirement(Position, Skill, MinLevel), Level >= MinLevel.
overqualified_for(Person, Position) :- has_skill(Person, Skill, Level), position_skill_requirement(Position, Skill, MinLevel), Level > MinLevel + 3.
candidate_score(Person, Position, Score) :- qualified_for(Person, Position), has_skill(Person, Skill, Level), position_skill_requirement(Position, Skill, _), age(Person, Age), AgeBonus is max(0, min(10, 40 - abs(Age - 30))), Score is Level * 10 + AgeBonus.
better_candidate(P1, P2, Position) :- candidate_score(P1, Position, S1), candidate_score(P2, Position, S2), S1 > S2.
can_be_hired(Person) :- person(Person), adult(Person), alive(Person), \+ employed(Person).
can_be_hired(Person) :- person(Person), adult(Person), alive(Person), employed_at(Person, _, _), job_level(Person, Level), Level < 3.
has_vacancy(Business, Position) :- available_position(Business, Position), \+ filled_position(Business, Position).
filled_position(Business, Position) :- employed_at(_, Business, Position).
can_promote(Person) :- employed_at(Person, Business, Position), years_experience(Person, Position, Years), Years >= 3.
should_fire(Person) :- employed_at(Person, Business, _), job_level(Person, Level), Level < 1.

% === Social Dynamics ===
compatible(X, Y) :- compatibility(X, Y, C), C > 0.5.
highly_compatible(X, Y) :- compatibility(X, Y, C), C > 0.8.
incompatible(X, Y) :- compatibility(X, Y, C), C < 0.2.
personality_match(X, Y, Score) :- personality(X, openness, O1), personality(Y, openness, O2), personality(X, agreeableness, A1), personality(Y, agreeableness, A2), Diff1 is abs(O1 - O2), Diff2 is abs(A1 - A2), Score is 1.0 - (Diff1 + Diff2) / 2.0.
positive_relationship(X, Y) :- charge(X, Y, C), C > 0.
negative_relationship(X, Y) :- charge(X, Y, C), C < 0.
strong_bond(X, Y) :- charge(X, Y, C), C > 10, trust(X, Y, T), T > 0.6.
weak_bond(X, Y) :- charge(X, Y, C), C > 0, C < 3.
will_befriend(X, Y) :- person(X), person(Y), X \= Y, alive(X), alive(Y), compatible(X, Y), \+ enemies(X, Y), same_location(X, Y).
should_socialize(X) :- personality(X, extroversion, E), E > 0.4, social_desire(X, D), D > 0.3.
avoids_socializing(X) :- personality(X, extroversion, E), E < 0.3.
salient_to(X, Y) :- salience(X, Y, S), S > 50.
highly_salient_to(X, Y) :- salience(X, Y, S), S > 100.
most_salient(X, Y) :- salient_to(X, Y), \+ (salient_to(X, Z), Z \= Y, salience(X, Z, SZ), salience(X, Y, SY), SZ > SY).
trustworthy(X, Y) :- trust(X, Y, T), T > 0.6.
distrusted(X, Y) :- trust(X, Y, T), T < 0.3.
age_appropriate_social(X, Y) :- age(X, AX), age(Y, AY), Diff is abs(AX - AY), Diff < 15.
generation_gap(X, Y) :- age(X, AX), age(Y, AY), Diff is abs(AX - AY), Diff >= 20.

% === Economics ===
is_wealthy(X) :- economic_class(X, wealthy).
is_wealthy(X) :- economic_class(X, rich).
is_poor(X) :- economic_class(X, poor).
is_poor(X) :- economic_class(X, destitute).
is_middle_class(X) :- economic_class(X, middle).
can_afford(X, Amount) :- wealth(X, W), W >= Amount.
cannot_afford(X, Amount) :- wealth(X, W), W < Amount.
is_business_owner(X) :- owns_business(X, _).
business_has_employees(B) :- employed_at(_, B, _).
business_employee_count(B, Count) :- findall(E, employed_at(E, B, _), Es), length(Es, Count).
can_trade(Buyer, Seller, Item, Price) :- can_afford(Buyer, Price), wealth(Seller, _), market_price(Item, _, Price).
upward_mobility(X) :- economic_class(X, Class), income(X, I), I > 100, (Class = poor ; Class = middle).
downward_risk(X) :- economic_class(X, Class), debt(X, _, Amount), Amount > 0, wealth(X, W), W < Amount.
earns_more_than(X, Y) :- salary(X, SX), salary(Y, SY), SX > SY.
underpaid(X) :- salary(X, S), has_skill(X, _, Level), Level > 5, S < 50.
oversupplied(Item, Location) :- supply(Item, Location, S), demand(Item, Location, D), S > D * 1.5.
undersupplied(Item, Location) :- supply(Item, Location, S), demand(Item, Location, D), D > S * 1.5.
fair_price(Item, Location) :- market_price(Item, Location, P), P > 0.

% === Lifecycle ===
infant(X) :- age(X, A), A < 2.
toddler(X) :- age(X, A), A >= 2, A < 6.
child(X) :- age(X, A), A >= 6, A < 13.
adolescent(X) :- age(X, A), A >= 13, A < 18.
young_adult(X) :- age(X, A), A >= 18, A < 30.
adult(X) :- age(X, A), A >= 18.
middle_aged(X) :- age(X, A), A >= 40, A < 65.
elderly(X) :- age(X, A), A >= 65.
can_marry(X, Y) :- adult(X), adult(Y), X \= Y, unmarried(X), unmarried(Y), alive(X), alive(Y), \+ sibling_of(X, Y), \+ parent_of(X, Y), \+ parent_of(Y, X).
of_age(X) :- age(X, A), A >= 18.
eligible_for_marriage(X) :- of_age(X), unmarried(X), alive(X).
romantically_compatible(X, Y) :- can_marry(X, Y), compatible(X, Y).
strong_romantic_match(X, Y) :- romantically_compatible(X, Y), compatibility(X, Y, C), C > 0.7.
ready_to_date(X) :- adult(X), unmarried(X), alive(X), \+ dating(X, _, _).
should_propose(X, Y) :- dating(X, Y, Start), current_timestep(Now), D is Now - Start, D > 200, trust(X, Y, T), T > 0.8, charge(X, Y, C), C > 15.
can_conceive(X) :- gender(X, female), age(X, A), A >= 18, A =< 45, married_to(X, _), \+ pregnant(X, _, _).
low_death_risk(X) :- age(X, A), A < 50.
moderate_death_risk(X) :- age(X, A), A >= 50, A < 70.
high_death_risk(X) :- age(X, A), A >= 70, A < 85.
very_high_death_risk(X) :- age(X, A), A >= 85.
school_age(X) :- age(X, A), A >= 6, A < 18.
can_enroll(X) :- school_age(X), \+ student(X).
can_graduate(X) :- student(X), age(X, A), A >= 18.
apprentice_age(X) :- age(X, A), A >= 14, A < 20.
primary_heir(Deceased, Heir) :- parent_of(Deceased, Heir), alive(Heir).
spouse_heir(Deceased, Spouse) :- married_to(Deceased, Spouse), alive(Spouse).

% === Helper Queries ===
all_candidates(Position, Candidates) :- findall(P, (can_be_hired(P), qualified_for(P, Position)), Candidates).
all_vacancies(Business, Positions) :- findall(P, has_vacancy(Business, P), Positions).
all_eligible_bachelors(Bachelors) :- findall(P, (eligible_for_marriage(P), gender(P, male)), Bachelors).
all_eligible_bachelorettes(Bachelorettes) :- findall(P, (eligible_for_marriage(P), gender(P, female)), Bachelorettes).
potential_couples(X, Y) :- eligible_for_marriage(X), eligible_for_marriage(Y), X @< Y, romantically_compatible(X, Y).

% === Advanced Predicates ===
% Advanced Prolog Predicates - Phase 13
% Generated: 2026-03-23T03:56:15.773Z

:- dynamic(resource/3).
:- dynamic(resource_capacity/3).
:- dynamic(resource_production/3).
:- dynamic(resource_consumption/3).
:- dynamic(resource_trade/4).
:- dynamic(resource_price/3).
:- dynamic(resource_deficit/3).
:- dynamic(resource_surplus/3).
:- dynamic(probability/2).
:- dynamic(npc_preference/3).
:- dynamic(weighted_choice/3).
:- dynamic(decision_factor/4).
:- dynamic(clue/4).
:- dynamic(suspect/2).
:- dynamic(motive/3).
:- dynamic(alibi/3).
:- dynamic(evidence_for/3).
:- dynamic(evidence_against/3).
:- dynamic(mystery/2).
:- dynamic(solved/2).
:- dynamic(accused/3).
:- dynamic(witness/3).
:- dynamic(crime/3).
:- dynamic(law/3).
:- dynamic(law_active/2).
:- dynamic(law_penalty/3).
:- dynamic(law_enforcer/2).
:- dynamic(vote/3).
:- dynamic(council_member/2).
:- dynamic(authority/3).
:- dynamic(tax_rate/3).
:- dynamic(tax_exempt/2).
:- dynamic(generated_name/2).
:- dynamic(name_pattern/2).
:- dynamic(terrain_type/2).
:- dynamic(biome/2).
:- dynamic(climate/2).
:- dynamic(building_template/3).
:- dynamic(npc_archetype/2).
:- dynamic(quest_template/3).

% Helper predicates
sum_list([], 0).
sum_list([H|T], Sum) :- sum_list(T, Rest), Sum is H + Rest.

% === Resource Constraints ===
resource_balance(Location, Resource, Balance) :- resource(Location, Resource, Current), resource_production(Location, Resource, Prod), resource_consumption(Location, Resource, Cons), Balance is Current + Prod - Cons.
has_deficit(Location, Resource) :- resource_balance(Location, Resource, B), B < 0.
has_surplus(Location, Resource) :- resource_balance(Location, Resource, B), B > 0.
can_sustain(Location) :- \+ has_deficit(Location, food).
starving(Location) :- has_deficit(Location, food), resource(Location, food, F), F < 10.
can_trade_resource(From, To, Resource) :- has_surplus(From, Resource), has_deficit(To, Resource).
optimal_trade(From, To, Resource, Amount) :- resource_balance(From, Resource, Surplus), Surplus > 0, resource_balance(To, Resource, Deficit), Deficit < 0, NegDef is -Deficit, Amount is min(Surplus, NegDef).
depends_on(Product, Material) :- resource_production(_, Product, _), resource_consumption(_, Material, _).
production_blocked(Location, Product) :- depends_on(Product, Material), resource(Location, Material, Amount), Amount =< 0.
location_wealth(Location, Wealth) :- findall(V, (resource(Location, R, Amount), resource_price(R, _, Price), V is Amount * Price), Values), sum_list(Values, Wealth).
over_capacity(Location, Resource) :- resource(Location, Resource, Amount), resource_capacity(Location, Resource, Cap), Amount > Cap.
utilization(Location, Resource, Pct) :- resource(Location, Resource, Amount), resource_capacity(Location, Resource, Cap), Cap > 0, Pct is (Amount * 100) / Cap.

% === Probabilistic Reasoning ===
likely_action(Person, Action, Probability) :- decision_factor(Person, Action, Factor, Weight), personality(Person, Factor, Value), Probability is Value * Weight.
socialize_probability(Person, P) :- personality(Person, extroversion, E), personality(Person, agreeableness, A), P is (E * 0.6 + A * 0.4).
risk_probability(Person, P) :- personality(Person, openness, O), personality(Person, neuroticism, N), P is O * 0.7 - N * 0.3.
conflict_probability(X, Y, P) :- personality(X, agreeableness, AX), personality(Y, agreeableness, AY), charge(X, Y, C), Aggression is (1.0 - AX) * 0.3 + (1.0 - AY) * 0.3, Hostility is max(0, -C) * 0.01, P is min(1.0, Aggression + Hostility).
trust_probability(X, Y, P) :- personality(X, agreeableness, AX), personality(X, neuroticism, NX), compatibility(X, Y, C), P is AX * 0.4 + (1.0 - NX) * 0.2 + C * 0.4.
best_action(Person, BestAction) :- findall(P-A, likely_action(Person, A, P), PAs), msort(PAs, Sorted), last(Sorted, _-BestAction).
mood_modifier(Person, Modifier) :- mood(Person, happy), Modifier is 1.2.
mood_modifier(Person, Modifier) :- mood(Person, sad), Modifier is 0.7.
mood_modifier(Person, Modifier) :- mood(Person, angry), Modifier is 0.9.
mood_modifier(Person, Modifier) :- \+ mood(Person, _), Modifier is 1.0.
adjusted_probability(Person, Action, AdjP) :- likely_action(Person, Action, P), mood_modifier(Person, M), AdjP is P * M.

% === Abductive Reasoning (Mystery) ===
suspect_for(Person, Crime) :- crime(Crime, _, _), motive(Person, Crime, _), \+ alibi(Person, Crime, _).
cleared(Person, Crime) :- alibi(Person, Crime, Witness), witness(Witness, Crime, credible).
prime_suspect(Person, Crime) :- suspect_for(Person, Crime), evidence_for(Person, Crime, _), \+ cleared(Person, Crime).
evidence_weight(Person, Crime, Weight) :- findall(1, evidence_for(Person, Crime, _), Fors), length(Fors, ForCount), findall(1, evidence_against(Person, Crime, _), Agns), length(Agns, AgnCount), Weight is ForCount - AgnCount.
most_evidence(Person, Crime) :- evidence_weight(Person, Crime, W), \+ (evidence_weight(Other, Crime, W2), Other \= Person, W2 > W).
infer_motive(Person, Crime, jealousy) :- crime(Crime, Victim, _), in_love(Person, Victim), married_to(Victim, Other), Other \= Person.
infer_motive(Person, Crime, revenge) :- crime(Crime, Victim, _), enemies(Person, Victim).
infer_motive(Person, Crime, greed) :- crime(Crime, Victim, _), wealth(Victim, W), W > 1000, inherits_from(Person, Victim, _).
infer_motive(Person, Crime, power) :- crime(Crime, Victim, _), authority(Victim, Position, _), \+ authority(Person, _, _).
clue_leads_to(Clue, Person) :- clue(Clue, _, Location, _), at_location(Person, Location).
connected_clues(C1, C2) :- clue(C1, _, _, Type), clue(C2, _, _, Type), C1 \= C2.
solvable(Mystery) :- mystery(Mystery, Crime), prime_suspect(_, Crime).
unsolvable(Mystery) :- mystery(Mystery, Crime), \+ prime_suspect(_, Crime).
valid_accusation(Accuser, Accused, Crime) :- prime_suspect(Accused, Crime), evidence_weight(Accused, Crime, W), W >= 2.
red_herring(Person, Crime) :- suspect_for(Person, Crime), evidence_weight(Person, Crime, W), W =< 0.

% === Meta-Predicates (Governance) ===
law_applies(Person, LawId) :- law(LawId, _, Scope), law_active(LawId, true), in_scope(Person, Scope).
in_scope(Person, all) :- person(Person).
in_scope(Person, Location) :- at_location(Person, Location).
in_scope(Person, Class) :- economic_class(Person, Class).
violates_law(Person, LawId) :- law(LawId, Condition, _), law_applies(Person, LawId), call(Condition).
law_abiding(Person) :- person(Person), \+ (law_applies(Person, LawId), violates_law(Person, LawId)).
council_majority(Vote, Result) :- findall(1, vote(_, Vote, yes), Yeses), length(Yeses, YCount), findall(1, vote(_, Vote, no), Nos), length(Nos, NCount), (YCount > NCount -> Result = passed ; Result = rejected).
has_authority_over(Superior, Subordinate) :- authority(Superior, _, Level1), authority(Subordinate, _, Level2), Level1 > Level2.
highest_authority(Person) :- authority(Person, _, Level), \+ (authority(Other, _, L2), Other \= Person, L2 > Level).
tax_owed(Person, Amount) :- income(Person, I), tax_rate(_, _, Rate), \+ tax_exempt(Person, _), Amount is I * Rate / 100.
tax_exempt_reason(Person, Reason) :- tax_exempt(Person, Reason).
rule_overrides(R1, R2) :- law(R1, _, _), law(R2, _, _), law_active(R1, true), law_active(R2, true).
citizen_of(Person, Location) :- person(Person), at_location(Person, Location).
citizen_rights(Person, vote) :- citizen_of(Person, _), adult(Person).
citizen_rights(Person, trade) :- citizen_of(Person, _).
citizen_duties(Person, tax) :- citizen_of(Person, _), income(Person, I), I > 0.

% === Procedural Content Generation ===
matches_archetype(Person, warrior) :- personality(Person, extroversion, E), E > 0.6, personality(Person, agreeableness, A), A < 0.4.
matches_archetype(Person, scholar) :- personality(Person, openness, O), O > 0.7, personality(Person, conscientiousness, C), C > 0.6.
matches_archetype(Person, merchant) :- personality(Person, extroversion, E), E > 0.5, personality(Person, conscientiousness, C), C > 0.5.
matches_archetype(Person, healer) :- personality(Person, agreeableness, A), A > 0.7, personality(Person, neuroticism, N), N < 0.4.
matches_archetype(Person, rogue) :- personality(Person, openness, O), O > 0.5, personality(Person, agreeableness, A), A < 0.3, personality(Person, conscientiousness, C), C < 0.4.
matches_archetype(Person, leader) :- personality(Person, extroversion, E), E > 0.7, personality(Person, conscientiousness, C), C > 0.6, personality(Person, neuroticism, N), N < 0.4.
needs_quest(escort, From, To) :- person(From), person(To), at_location(From, L1), at_location(To, L2), L1 \= L2, enemies(From, _).
needs_quest(delivery, Item, Destination) :- has_deficit(Destination, Item), has_surplus(_, Item).
needs_quest(investigate, Mystery, Location) :- mystery(Mystery, Crime), crime(Crime, _, Location), unsolvable(Mystery).
needs_quest(rescue, Person, Location) :- person(Person), at_location(Person, Location), \+ alive(Person).
needs_quest(trade, Resource, Location) :- starving(Location), can_trade_resource(_, Location, Resource).
potential_conflict(X, Y, rivalry) :- person(X), person(Y), X @< Y, personality(X, agreeableness, AX), AX < 0.3, personality(Y, agreeableness, AY), AY < 0.3, same_location(X, Y).
potential_conflict(X, Y, love_triangle) :- in_love(X, Z), in_love(Y, Z), X \= Y.
potential_conflict(X, Y, power_struggle) :- authority(X, Pos, L1), authority(Y, Pos, L2), abs(L1 - L2) =< 1.
event_candidate(wedding, X, Y) :- dating(X, Y, Start), current_timestep(Now), Duration is Now - Start, Duration > 200, trust(X, Y, T), T > 0.7.
event_candidate(funeral, Person, Location) :- deceased(Person, _, _), at_location(Person, Location).
event_candidate(festival, Location, harvest) :- has_surplus(Location, food), resource(Location, food, Amount), Amount > 100.
event_candidate(trial, Accused, Crime) :- accused(Accused, Crime, _), \+ solved(_, Crime).
dialogue_topic(X, Y, gossip, Z) :- knows(X, Z, _), knows(Y, Z, _), Z \= X, Z \= Y.
dialogue_topic(X, Y, trade, Resource) :- occupation(X, merchant), has_surplus(_, Resource).
dialogue_topic(X, Y, family, Child) :- parent_of(X, Child), knows(Y, Child, _).
dialogue_topic(X, Y, conflict, Enemy) :- enemies(X, Enemy), knows(Y, Enemy, _).

% === LLM Cost Reduction ===
answerable_by_prolog(who_is, Person) :- person(Person).
answerable_by_prolog(age_of, Person) :- age(Person, _).
answerable_by_prolog(occupation_of, Person) :- occupation(Person, _).
answerable_by_prolog(location_of, Person) :- at_location(Person, _).
answerable_by_prolog(relationship, Person) :- married_to(Person, _).
answerable_by_prolog(relationship, Person) :- parent_of(Person, _).
answerable_by_prolog(relationship, Person) :- parent_of(_, Person).
template_dialogue(greeting, X, Y) :- person(X), person(Y), \+ enemies(X, Y).
template_dialogue(farewell, X, Y) :- person(X), person(Y).
template_dialogue(trade_offer, X, Y) :- occupation(X, merchant), person(Y).
template_dialogue(family_news, X, Y) :- parent_of(X, Child), knows(Y, Child, _).
prolog_decidable(should_marry, X, Y) :- can_marry(X, Y).
prolog_decidable(should_trade, X, Y) :- can_trade(X, Y, _, _).
prolog_decidable(should_hire, Person, Position) :- qualified_for(Person, Position).
prolog_decidable(should_socialize, Person) :- should_socialize(Person).
prolog_decidable(should_flee, Person) :- enemies(Person, Enemy), same_location(Person, Enemy).
query_complexity(simple, Q) :- answerable_by_prolog(Q, _).
query_complexity(template, Q) :- template_dialogue(Q, _, _).
query_complexity(decidable, Q) :- prolog_decidable(Q, _).
query_complexity(needs_ai, _).


% === World Facts ===
world(_69bfc926b7a6c8040746a5ae).
world_name(_69bfc926b7a6c8040746a5ae, 'La Louisiane').
world_description(_69bfc926b7a6c8040746a5ae, 'A contemporary modern world with real-world issues and challenges').

% === Country Facts ===
country(_69bfc961b7a6c8040746a600).
country_name(_69bfc961b7a6c8040746a600, 'La Nation de Marguerite').
government_type(_69bfc961b7a6c8040746a600, monarchy).
economic_system(_69bfc961b7a6c8040746a600, feudal).
country_founded(_69bfc961b7a6c8040746a600, 1896).

% === State Facts ===
state(_69bfc961b7a6c8040746a602).
state_name(_69bfc961b7a6c8040746a602, 'Abbeville-((sur-))river').
state_of_country(_69bfc961b7a6c8040746a602, _69bfc961b7a6c8040746a600).
state_type(_69bfc961b7a6c8040746a602, province).
state_terrain(_69bfc961b7a6c8040746a602, plains).

% === Settlement Facts ===
settlement(_69bfe08a2f34e6ad23a78dc4).
settlement_name(_69bfe08a2f34e6ad23a78dc4, 'Pont Guidry').
settlement_of_country(_69bfe08a2f34e6ad23a78dc4, _69bfc961b7a6c8040746a600).
settlement_type(_69bfe08a2f34e6ad23a78dc4, village).
settlement_terrain(_69bfe08a2f34e6ad23a78dc4, plains).
settlement_population(_69bfe08a2f34e6ad23a78dc4, 120).

% === Business Facts ===
business(_69bfe08e2f34e6ad23a78e87).
business_name(_69bfe08e2f34e6ad23a78e87, 'À la Cloche magique').
business_type(_69bfe08e2f34e6ad23a78e87, bakery).
business_of_settlement(_69bfe08e2f34e6ad23a78e87, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e88).
business_name(_69bfe08e2f34e6ad23a78e88, 'Un bistrot secret').
business_type(_69bfe08e2f34e6ad23a78e88, restaurant).
business_of_settlement(_69bfe08e2f34e6ad23a78e88, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e89).
business_name(_69bfe08e2f34e6ad23a78e89, 'Comptoir de l\'Avenue').
business_type(_69bfe08e2f34e6ad23a78e89, restaurant).
business_of_settlement(_69bfe08e2f34e6ad23a78e89, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e8a).
business_name(_69bfe08e2f34e6ad23a78e8a, 'Clinique de la Paroisse').
business_type(_69bfe08e2f34e6ad23a78e8a, bank).
business_of_settlement(_69bfe08e2f34e6ad23a78e8a, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e8b).
business_name(_69bfe08e2f34e6ad23a78e8b, 'Un théâtre petit').
business_type(_69bfe08e2f34e6ad23a78e8b, barbershop).
business_of_settlement(_69bfe08e2f34e6ad23a78e8b, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e8c).
business_name(_69bfe08e2f34e6ad23a78e8c, 'Au Bateau vert').
business_type(_69bfe08e2f34e6ad23a78e8c, grocerystore).
business_of_settlement(_69bfe08e2f34e6ad23a78e8c, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e8d).
business_name(_69bfe08e2f34e6ad23a78e8d, 'Boucherie de la Rive').
business_type(_69bfe08e2f34e6ad23a78e8d, shop).
business_of_settlement(_69bfe08e2f34e6ad23a78e8d, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e8e).
business_name(_69bfe08e2f34e6ad23a78e8e, 'Kiosque de la Paroisse').
business_type(_69bfe08e2f34e6ad23a78e8e, restaurant).
business_of_settlement(_69bfe08e2f34e6ad23a78e8e, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e8f).
business_name(_69bfe08e2f34e6ad23a78e8f, 'Atelier Simon').
business_type(_69bfe08e2f34e6ad23a78e8f, grocerystore).
business_of_settlement(_69bfe08e2f34e6ad23a78e8f, _69bfe08a2f34e6ad23a78dc4).
business(_69bfe08e2f34e6ad23a78e90).
business_name(_69bfe08e2f34e6ad23a78e90, 'Cinéma de la Vallée').
business_type(_69bfe08e2f34e6ad23a78e90, bookstore).
business_of_settlement(_69bfe08e2f34e6ad23a78e90, _69bfe08a2f34e6ad23a78dc4).

% === Lot Facts ===
lot(_69bfe08d2f34e6ad23a78e1f).
lot_of_settlement(_69bfe08d2f34e6ad23a78e1f, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e1f, '1 Chemin de la Poste').
lot_building_type(_69bfe08d2f34e6ad23a78e1f, business).
lot(_69bfe08d2f34e6ad23a78e20).
lot_of_settlement(_69bfe08d2f34e6ad23a78e20, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e20, '2 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e20, residence).
lot(_69bfe08d2f34e6ad23a78e21).
lot_of_settlement(_69bfe08d2f34e6ad23a78e21, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e21, '3 Chemin de la Poste').
lot_building_type(_69bfe08d2f34e6ad23a78e21, residence).
lot(_69bfe08d2f34e6ad23a78e22).
lot_of_settlement(_69bfe08d2f34e6ad23a78e22, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e22, '4 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e22, residence).
lot(_69bfe08d2f34e6ad23a78e23).
lot_of_settlement(_69bfe08d2f34e6ad23a78e23, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e23, '5 Chemin de la Poste').
lot_building_type(_69bfe08d2f34e6ad23a78e23, business).
lot(_69bfe08d2f34e6ad23a78e24).
lot_of_settlement(_69bfe08d2f34e6ad23a78e24, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e24, '6 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e24, residence).
lot(_69bfe08d2f34e6ad23a78e25).
lot_of_settlement(_69bfe08d2f34e6ad23a78e25, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e25, '7 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e25, residence).
lot(_69bfe08d2f34e6ad23a78e26).
lot_of_settlement(_69bfe08d2f34e6ad23a78e26, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e26, '8 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e26, residence).
lot(_69bfe08d2f34e6ad23a78e27).
lot_of_settlement(_69bfe08d2f34e6ad23a78e27, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e27, '9 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e27, business).
lot(_69bfe08d2f34e6ad23a78e28).
lot_of_settlement(_69bfe08d2f34e6ad23a78e28, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e28, '10 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e28, residence).
lot(_69bfe08d2f34e6ad23a78e29).
lot_of_settlement(_69bfe08d2f34e6ad23a78e29, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e29, '11 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e29, residence).
lot(_69bfe08d2f34e6ad23a78e2a).
lot_of_settlement(_69bfe08d2f34e6ad23a78e2a, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e2a, '12 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e2a, residence).
lot(_69bfe08d2f34e6ad23a78e2b).
lot_of_settlement(_69bfe08d2f34e6ad23a78e2b, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e2b, '13 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e2b, business).
lot(_69bfe08d2f34e6ad23a78e2c).
lot_of_settlement(_69bfe08d2f34e6ad23a78e2c, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e2c, '14 Quai Neuf').
lot_building_type(_69bfe08d2f34e6ad23a78e2c, residence).
lot(_69bfe08d2f34e6ad23a78e2d).
lot_of_settlement(_69bfe08d2f34e6ad23a78e2d, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e2d, '15 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e2d, residence).
lot(_69bfe08d2f34e6ad23a78e2e).
lot_of_settlement(_69bfe08d2f34e6ad23a78e2e, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e2e, '16 Quai Neuf').
lot_building_type(_69bfe08d2f34e6ad23a78e2e, residence).
lot(_69bfe08d2f34e6ad23a78e2f).
lot_of_settlement(_69bfe08d2f34e6ad23a78e2f, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e2f, '17 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e2f, business).
lot(_69bfe08d2f34e6ad23a78e30).
lot_of_settlement(_69bfe08d2f34e6ad23a78e30, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e30, '18 Quai Neuf').
lot_building_type(_69bfe08d2f34e6ad23a78e30, residence).
lot(_69bfe08d2f34e6ad23a78e31).
lot_of_settlement(_69bfe08d2f34e6ad23a78e31, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e31, '19 Chemin de la Poste').
lot_building_type(_69bfe08d2f34e6ad23a78e31, residence).
lot(_69bfe08d2f34e6ad23a78e32).
lot_of_settlement(_69bfe08d2f34e6ad23a78e32, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e32, '20 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e32, residence).
lot(_69bfe08d2f34e6ad23a78e33).
lot_of_settlement(_69bfe08d2f34e6ad23a78e33, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e33, '21 Chemin de la Poste').
lot_building_type(_69bfe08d2f34e6ad23a78e33, business).
lot(_69bfe08d2f34e6ad23a78e34).
lot_of_settlement(_69bfe08d2f34e6ad23a78e34, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e34, '22 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e34, residence).
lot(_69bfe08d2f34e6ad23a78e35).
lot_of_settlement(_69bfe08d2f34e6ad23a78e35, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e35, '23 Chemin de la Poste').
lot_building_type(_69bfe08d2f34e6ad23a78e35, residence).
lot(_69bfe08d2f34e6ad23a78e36).
lot_of_settlement(_69bfe08d2f34e6ad23a78e36, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e36, '24 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e36, residence).
lot(_69bfe08d2f34e6ad23a78e37).
lot_of_settlement(_69bfe08d2f34e6ad23a78e37, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e37, '25 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e37, business).
lot(_69bfe08d2f34e6ad23a78e38).
lot_of_settlement(_69bfe08d2f34e6ad23a78e38, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e38, '26 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e38, residence).
lot(_69bfe08d2f34e6ad23a78e39).
lot_of_settlement(_69bfe08d2f34e6ad23a78e39, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e39, '27 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e39, residence).
lot(_69bfe08d2f34e6ad23a78e3a).
lot_of_settlement(_69bfe08d2f34e6ad23a78e3a, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e3a, '28 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e3a, residence).
lot(_69bfe08d2f34e6ad23a78e3b).
lot_of_settlement(_69bfe08d2f34e6ad23a78e3b, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e3b, '29 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e3b, business).
lot(_69bfe08d2f34e6ad23a78e3c).
lot_of_settlement(_69bfe08d2f34e6ad23a78e3c, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e3c, '30 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e3c, residence).
lot(_69bfe08d2f34e6ad23a78e3d).
lot_of_settlement(_69bfe08d2f34e6ad23a78e3d, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e3d, '31 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e3d, residence).
lot(_69bfe08d2f34e6ad23a78e3e).
lot_of_settlement(_69bfe08d2f34e6ad23a78e3e, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e3e, '32 Quai Neuf').
lot_building_type(_69bfe08d2f34e6ad23a78e3e, residence).
lot(_69bfe08d2f34e6ad23a78e3f).
lot_of_settlement(_69bfe08d2f34e6ad23a78e3f, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e3f, '33 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e3f, business).
lot(_69bfe08d2f34e6ad23a78e40).
lot_of_settlement(_69bfe08d2f34e6ad23a78e40, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e40, '34 Quai Neuf').
lot_building_type(_69bfe08d2f34e6ad23a78e40, residence).
lot(_69bfe08d2f34e6ad23a78e41).
lot_of_settlement(_69bfe08d2f34e6ad23a78e41, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e41, '35 Impasse de Toulouse').
lot_building_type(_69bfe08d2f34e6ad23a78e41, residence).
lot(_69bfe08d2f34e6ad23a78e42).
lot_of_settlement(_69bfe08d2f34e6ad23a78e42, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e42, '36 Quai Neuf').
lot_building_type(_69bfe08d2f34e6ad23a78e42, residence).
lot(_69bfe08d2f34e6ad23a78e43).
lot_of_settlement(_69bfe08d2f34e6ad23a78e43, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e43, '37 Chemin de la Poste').
lot_building_type(_69bfe08d2f34e6ad23a78e43, business).
lot(_69bfe08d2f34e6ad23a78e44).
lot_of_settlement(_69bfe08d2f34e6ad23a78e44, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e44, '38 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e44, residence).
lot(_69bfe08d2f34e6ad23a78e45).
lot_of_settlement(_69bfe08d2f34e6ad23a78e45, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e45, '39 Chemin de la Poste').
lot_building_type(_69bfe08d2f34e6ad23a78e45, residence).
lot(_69bfe08d2f34e6ad23a78e46).
lot_of_settlement(_69bfe08d2f34e6ad23a78e46, _69bfe08a2f34e6ad23a78dc4).
lot_address(_69bfe08d2f34e6ad23a78e46, '40 Chemin des Marronniers').
lot_building_type(_69bfe08d2f34e6ad23a78e46, residence).

% === Character Facts ===
person(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb).
first_name(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, 'Claude-Charles').
last_name(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, 'Broussard').
age(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, 125).
gender(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, male).
dead(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb).
personality(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, openness, -0.6014399516252134).
personality(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, conscientiousness, -0.9965080156211186).
personality(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, extroversion, 0.23209540430701736).
personality(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, agreeableness, -0.48144510420594955).
personality(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, neuroticism, -0.613869683141889).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, creativity, 0.4).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, languages, 0.11).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, crafting, 0.16).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, farming, 0.19).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, persuasion, 0.8).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, leadership, 0.33).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, trading, 0.37).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, medicine, 0.19).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, diplomacy, 0.33).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, combat, 0.65).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, athletics, 0.53).
skill(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, endurance, 0.7).
married_to(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, _69bfe08a2f34e6ad23a78dcd).
parent_of(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, _69bfe08a2f34e6ad23a78dd0).
parent_of(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, _69bfe08a2f34e6ad23a78dd2).
parent_of(claude_charles_broussard_69bfe08a2f34e6ad23a78dcb, _69bfe08a2f34e6ad23a78dd4).
person(yvonne_broussard_69bfe08a2f34e6ad23a78dcd).
first_name(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, 'Yvonne').
last_name(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, 'Broussard').
age(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, 123).
gender(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, female).
dead(yvonne_broussard_69bfe08a2f34e6ad23a78dcd).
personality(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, openness, -0.7373300846465134).
personality(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, conscientiousness, -0.5312803459446518).
personality(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, extroversion, 0.9340841601959848).
personality(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, agreeableness, 0.8379388220451305).
personality(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, neuroticism, 0.07493176057628981).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, music, 0.22).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, languages, 0.13).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, farming, 0.23).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, cooking, 0.21).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, persuasion, 1).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, leadership, 0.94).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, trading, 0.88).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, medicine, 0.83).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, teaching, 0.61).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, diplomacy, 0.73).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, combat, 0.43).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, athletics, 0.48).
skill(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, endurance, 0.34).
married_to(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, _69bfe08a2f34e6ad23a78dcb).
parent_of(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, _69bfe08a2f34e6ad23a78dd0).
parent_of(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, _69bfe08a2f34e6ad23a78dd2).
parent_of(yvonne_broussard_69bfe08a2f34e6ad23a78dcd, _69bfe08a2f34e6ad23a78dd4).
person(jeanne_broussard_69bfe08a2f34e6ad23a78dd0).
first_name(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, 'Jeanne').
last_name(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, 'Broussard').
age(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, 100).
gender(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, female).
dead(jeanne_broussard_69bfe08a2f34e6ad23a78dd0).
personality(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, openness, -0.5779207619905443).
personality(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, conscientiousness, -0.6563355229258435).
personality(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, extroversion, 0.3914869075180788).
personality(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, agreeableness, 0.32456987747290567).
personality(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, neuroticism, -0.23258597378014306).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, music, 0.22).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, crafting, 0.1).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, farming, 0.17).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, persuasion, 0.52).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, leadership, 0.71).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, trading, 0.68).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, medicine, 0.62).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, teaching, 0.52).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, diplomacy, 0.44).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, combat, 0.67).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, athletics, 0.64).
skill(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, endurance, 0.37).
child_of(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, _69bfe08a2f34e6ad23a78dcb).
child_of(jeanne_broussard_69bfe08a2f34e6ad23a78dd0, _69bfe08a2f34e6ad23a78dcd).
person(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2).
first_name(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, 'Françoise').
last_name(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, 'Broussard').
age(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, 99).
gender(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, female).
dead(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2).
personality(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, openness, -0.5349670407476768).
personality(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, conscientiousness, -0.592851543978506).
personality(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, extroversion, 0.5625520381001936).
personality(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, agreeableness, 0.14140293763436698).
personality(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, neuroticism, -0.22596202876206245).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, creativity, 0.13).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, languages, 0.32).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, crafting, 0.23).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, farming, 0.21).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, persuasion, 0.71).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, leadership, 0.76).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, trading, 0.42).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, medicine, 0.59).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, teaching, 0.49).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, diplomacy, 0.52).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, combat, 0.8).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, athletics, 0.59).
skill(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, endurance, 0.51).
child_of(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, _69bfe08a2f34e6ad23a78dcb).
child_of(fran_oise_broussard_69bfe08a2f34e6ad23a78dd2, _69bfe08a2f34e6ad23a78dcd).
person(jean_broussard_69bfe08a2f34e6ad23a78dd4).
first_name(jean_broussard_69bfe08a2f34e6ad23a78dd4, 'Jean').
last_name(jean_broussard_69bfe08a2f34e6ad23a78dd4, 'Broussard').
age(jean_broussard_69bfe08a2f34e6ad23a78dd4, 98).
gender(jean_broussard_69bfe08a2f34e6ad23a78dd4, male).
dead(jean_broussard_69bfe08a2f34e6ad23a78dd4).
personality(jean_broussard_69bfe08a2f34e6ad23a78dd4, openness, -0.8351043336420042).
personality(jean_broussard_69bfe08a2f34e6ad23a78dd4, conscientiousness, -0.9477849730411061).
personality(jean_broussard_69bfe08a2f34e6ad23a78dd4, extroversion, 0.5161833916459525).
personality(jean_broussard_69bfe08a2f34e6ad23a78dd4, agreeableness, 0.17731164416727113).
personality(jean_broussard_69bfe08a2f34e6ad23a78dd4, neuroticism, -0.27991921360947336).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, creativity, 0.16).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, crafting, 0.12).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, farming, 0.16).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, cooking, 0.19).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, persuasion, 0.89).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, leadership, 0.47).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, trading, 0.61).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, medicine, 0.49).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, teaching, 0.53).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, diplomacy, 0.37).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, combat, 0.69).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, athletics, 0.74).
skill(jean_broussard_69bfe08a2f34e6ad23a78dd4, endurance, 0.66).
child_of(jean_broussard_69bfe08a2f34e6ad23a78dd4, _69bfe08a2f34e6ad23a78dcb).
child_of(jean_broussard_69bfe08a2f34e6ad23a78dd4, _69bfe08a2f34e6ad23a78dcd).
person(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8).
first_name(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, 'Étienne').
last_name(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, 'Blanccour').
age(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, 125).
gender(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, male).
dead(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8).
personality(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, openness, 0.5764629701559549).
personality(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, conscientiousness, 0.36837690474258533).
personality(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, extroversion, 0.056304188313248904).
personality(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, agreeableness, 0.3486539169194538).
personality(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, neuroticism, -0.7844659834999663).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, creativity, 0.92).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, music, 0.53).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, languages, 0.52).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, crafting, 0.49).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, farming, 0.46).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, cooking, 0.4).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, persuasion, 0.61).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, leadership, 0.25).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, trading, 0.27).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, medicine, 0.63).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, teaching, 0.4).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, diplomacy, 0.28).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, combat, 1).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, athletics, 0.76).
skill(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, endurance, 0.81).
married_to(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, _69bfe08b2f34e6ad23a78dda).
parent_of(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, _69bfe08b2f34e6ad23a78ddd).
parent_of(_tienne_blanccour_69bfe08b2f34e6ad23a78dd8, _69bfe08b2f34e6ad23a78ddf).
person(sylvie_blanccour_69bfe08b2f34e6ad23a78dda).
first_name(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, 'Sylvie').
last_name(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, 'Blanccour').
age(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, 123).
gender(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, female).
dead(sylvie_blanccour_69bfe08b2f34e6ad23a78dda).
personality(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, openness, -0.34366966631119267).
personality(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, conscientiousness, 0.2408368684169102).
personality(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, extroversion, 0.06030232962265991).
personality(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, agreeableness, 0.629801223029482).
personality(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, neuroticism, 0.8067282889109575).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, creativity, 0.46).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, music, 0.11).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, languages, 0.12).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, crafting, 0.64).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, farming, 0.75).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, cooking, 0.44).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, persuasion, 0.57).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, leadership, 0.5).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, trading, 0.42).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, medicine, 0.72).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, teaching, 0.71).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, diplomacy, 0.76).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, combat, 0.17).
skill(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, athletics, 0.13).
married_to(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, _69bfe08b2f34e6ad23a78dd8).
parent_of(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, _69bfe08b2f34e6ad23a78ddd).
parent_of(sylvie_blanccour_69bfe08b2f34e6ad23a78dda, _69bfe08b2f34e6ad23a78ddf).
person(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd).
first_name(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, 'Benoît-Henri').
last_name(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, 'Blanccour').
age(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, 100).
gender(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, male).
dead(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd).
personality(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, openness, 0.05305858876685483).
personality(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, conscientiousness, 0.22980881158182603).
personality(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, extroversion, -0.12400107343381053).
personality(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, agreeableness, 0.4495878701101794).
personality(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, neuroticism, -0.13900524915113116).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, creativity, 0.71).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, music, 0.47).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, languages, 0.31).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, crafting, 0.53).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, farming, 0.75).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, cooking, 0.26).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, persuasion, 0.52).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, leadership, 0.42).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, trading, 0.5).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, medicine, 0.57).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, teaching, 0.67).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, diplomacy, 0.37).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, combat, 0.54).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, athletics, 0.64).
skill(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, endurance, 0.42).
child_of(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, _69bfe08b2f34e6ad23a78dd8).
child_of(beno_t_henri_blanccour_69bfe08b2f34e6ad23a78ddd, _69bfe08b2f34e6ad23a78dda).
person(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf).
first_name(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, 'Jeanne').
last_name(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, 'Blanccour').
age(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, 99).
gender(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, female).
dead(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf).
personality(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, openness, 0.16207198470704243).
personality(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, conscientiousness, 0.13080326580930354).
personality(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, extroversion, 0.011560053762698926).
personality(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, agreeableness, 0.3591375893193218).
personality(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, neuroticism, 0.10012927789547198).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, creativity, 0.57).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, music, 0.5).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, languages, 0.37).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, crafting, 0.38).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, farming, 0.5).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, cooking, 0.44).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, persuasion, 0.38).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, leadership, 0.43).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, trading, 0.16).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, medicine, 0.84).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, teaching, 0.63).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, diplomacy, 0.32).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, combat, 0.55).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, athletics, 0.6).
skill(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, endurance, 0.37).
child_of(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, _69bfe08b2f34e6ad23a78dd8).
child_of(jeanne_blanccour_69bfe08b2f34e6ad23a78ddf, _69bfe08b2f34e6ad23a78dda).
person(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3).
first_name(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, 'Henri-Étienne').
last_name(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, 'Grandrose').
age(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, 125).
gender(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, male).
dead(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3).
personality(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, openness, -0.40134687135685).
personality(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, conscientiousness, -0.09748703911063439).
personality(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, extroversion, 0.926581590432491).
personality(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, agreeableness, 0.34106202516180284).
personality(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, neuroticism, -0.4459371307513522).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, creativity, 0.49).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, music, 0.37).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, languages, 0.15).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, crafting, 0.58).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, farming, 0.35).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, cooking, 0.12).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, persuasion, 1).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, leadership, 0.89).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, trading, 0.57).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, medicine, 0.52).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, teaching, 0.6).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, diplomacy, 0.54).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, combat, 0.72).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, athletics, 0.71).
skill(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, endurance, 0.44).
married_to(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, _69bfe08b2f34e6ad23a78de5).
parent_of(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, _69bfe08b2f34e6ad23a78de8).
parent_of(henri_tienne_grandrose_69bfe08b2f34e6ad23a78de3, _69bfe08b2f34e6ad23a78dea).
person(chlo_grandrose_69bfe08b2f34e6ad23a78de5).
first_name(chlo_grandrose_69bfe08b2f34e6ad23a78de5, 'Chloé').
last_name(chlo_grandrose_69bfe08b2f34e6ad23a78de5, 'Grandrose').
age(chlo_grandrose_69bfe08b2f34e6ad23a78de5, 123).
gender(chlo_grandrose_69bfe08b2f34e6ad23a78de5, female).
dead(chlo_grandrose_69bfe08b2f34e6ad23a78de5).
personality(chlo_grandrose_69bfe08b2f34e6ad23a78de5, openness, -0.22017575978645443).
personality(chlo_grandrose_69bfe08b2f34e6ad23a78de5, conscientiousness, 0.33784172084186137).
personality(chlo_grandrose_69bfe08b2f34e6ad23a78de5, extroversion, 0.46591531047435275).
personality(chlo_grandrose_69bfe08b2f34e6ad23a78de5, agreeableness, 0.5668038949969363).
personality(chlo_grandrose_69bfe08b2f34e6ad23a78de5, neuroticism, -0.6856361971470015).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, creativity, 0.49).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, music, 0.2).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, languages, 0.27).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, crafting, 0.84).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, farming, 0.76).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, cooking, 0.51).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, persuasion, 0.54).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, leadership, 0.58).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, trading, 0.61).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, medicine, 0.7).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, teaching, 0.68).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, diplomacy, 0.66).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, combat, 0.87).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, athletics, 0.72).
skill(chlo_grandrose_69bfe08b2f34e6ad23a78de5, endurance, 0.83).
married_to(chlo_grandrose_69bfe08b2f34e6ad23a78de5, _69bfe08b2f34e6ad23a78de3).
parent_of(chlo_grandrose_69bfe08b2f34e6ad23a78de5, _69bfe08b2f34e6ad23a78de8).
parent_of(chlo_grandrose_69bfe08b2f34e6ad23a78de5, _69bfe08b2f34e6ad23a78dea).
person(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8).
first_name(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, 'Marc-Jacques').
last_name(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, 'Grandrose').
age(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, 100).
gender(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, male).
dead(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8).
personality(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, openness, -0.409607732522882).
personality(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, conscientiousness, 0.010384074451034564).
personality(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, extroversion, 0.8731980245483186).
personality(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, agreeableness, 0.26787542832148825).
personality(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, neuroticism, -0.7136024709800327).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, creativity, 0.31).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, music, 0.22).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, languages, 0.31).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, crafting, 0.66).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, farming, 0.59).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, cooking, 0.45).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, persuasion, 1).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, leadership, 0.8).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, trading, 0.67).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, medicine, 0.69).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, teaching, 0.37).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, diplomacy, 0.56).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, combat, 0.71).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, athletics, 0.87).
skill(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, endurance, 0.83).
child_of(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, _69bfe08b2f34e6ad23a78de3).
child_of(marc_jacques_grandrose_69bfe08b2f34e6ad23a78de8, _69bfe08b2f34e6ad23a78de5).
person(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea).
first_name(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, 'René-Louis').
last_name(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, 'Grandrose').
age(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, 99).
gender(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, male).
dead(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea).
personality(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, openness, -0.36563815634383257).
personality(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, conscientiousness, 0.18575547535645426).
personality(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, extroversion, 0.6725145257223192).
personality(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, agreeableness, 0.5094145598551045).
personality(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, neuroticism, -0.75456101937869).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, creativity, 0.25).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, music, 0.32).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, languages, 0.28).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, crafting, 0.76).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, farming, 0.51).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, cooking, 0.49).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, persuasion, 0.99).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, leadership, 0.8).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, trading, 0.43).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, medicine, 0.64).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, teaching, 0.74).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, diplomacy, 0.64).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, combat, 0.75).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, athletics, 0.9).
skill(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, endurance, 0.73).
child_of(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, _69bfe08b2f34e6ad23a78de3).
child_of(ren_louis_grandrose_69bfe08b2f34e6ad23a78dea, _69bfe08b2f34e6ad23a78de5).
person(pierre_savoie_69bfe08b2f34e6ad23a78dee).
first_name(pierre_savoie_69bfe08b2f34e6ad23a78dee, 'Pierre').
last_name(pierre_savoie_69bfe08b2f34e6ad23a78dee, 'Savoie').
age(pierre_savoie_69bfe08b2f34e6ad23a78dee, 125).
gender(pierre_savoie_69bfe08b2f34e6ad23a78dee, male).
dead(pierre_savoie_69bfe08b2f34e6ad23a78dee).
personality(pierre_savoie_69bfe08b2f34e6ad23a78dee, openness, 0.499822845226225).
personality(pierre_savoie_69bfe08b2f34e6ad23a78dee, conscientiousness, -0.7098696044053039).
personality(pierre_savoie_69bfe08b2f34e6ad23a78dee, extroversion, -0.9787817965852019).
personality(pierre_savoie_69bfe08b2f34e6ad23a78dee, agreeableness, -0.0593694746958362).
personality(pierre_savoie_69bfe08b2f34e6ad23a78dee, neuroticism, 0.08523486575391948).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, creativity, 0.77).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, music, 0.69).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, languages, 0.42).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, crafting, 0.13).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, farming, 0.14).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, cooking, 0.26).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, persuasion, 0.19).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, medicine, 0.66).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, teaching, 0.43).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, diplomacy, 0.25).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, combat, 0.35).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, athletics, 0.42).
skill(pierre_savoie_69bfe08b2f34e6ad23a78dee, endurance, 0.25).
married_to(pierre_savoie_69bfe08b2f34e6ad23a78dee, _69bfe08b2f34e6ad23a78df0).
parent_of(pierre_savoie_69bfe08b2f34e6ad23a78dee, _69bfe08b2f34e6ad23a78df3).
parent_of(pierre_savoie_69bfe08b2f34e6ad23a78dee, _69bfe08b2f34e6ad23a78df5).
parent_of(pierre_savoie_69bfe08b2f34e6ad23a78dee, _69bfe08b2f34e6ad23a78df7).
person(am_lie_savoie_69bfe08b2f34e6ad23a78df0).
first_name(am_lie_savoie_69bfe08b2f34e6ad23a78df0, 'Amélie').
last_name(am_lie_savoie_69bfe08b2f34e6ad23a78df0, 'Savoie').
age(am_lie_savoie_69bfe08b2f34e6ad23a78df0, 123).
gender(am_lie_savoie_69bfe08b2f34e6ad23a78df0, female).
dead(am_lie_savoie_69bfe08b2f34e6ad23a78df0).
personality(am_lie_savoie_69bfe08b2f34e6ad23a78df0, openness, 0.574567671726173).
personality(am_lie_savoie_69bfe08b2f34e6ad23a78df0, conscientiousness, 0.5977488034944929).
personality(am_lie_savoie_69bfe08b2f34e6ad23a78df0, extroversion, 0.9312767854297554).
personality(am_lie_savoie_69bfe08b2f34e6ad23a78df0, agreeableness, -0.15168920984995138).
personality(am_lie_savoie_69bfe08b2f34e6ad23a78df0, neuroticism, -0.4671514336176128).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, creativity, 0.78).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, music, 0.53).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, languages, 0.74).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, crafting, 0.6).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, farming, 0.62).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, cooking, 0.56).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, persuasion, 1).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, leadership, 0.81).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, trading, 0.73).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, medicine, 0.45).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, teaching, 0.17).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, diplomacy, 0.45).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, combat, 0.79).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, athletics, 0.61).
skill(am_lie_savoie_69bfe08b2f34e6ad23a78df0, endurance, 0.58).
married_to(am_lie_savoie_69bfe08b2f34e6ad23a78df0, _69bfe08b2f34e6ad23a78dee).
parent_of(am_lie_savoie_69bfe08b2f34e6ad23a78df0, _69bfe08b2f34e6ad23a78df3).
parent_of(am_lie_savoie_69bfe08b2f34e6ad23a78df0, _69bfe08b2f34e6ad23a78df5).
parent_of(am_lie_savoie_69bfe08b2f34e6ad23a78df0, _69bfe08b2f34e6ad23a78df7).
person(c_cile_savoie_69bfe08b2f34e6ad23a78df3).
first_name(c_cile_savoie_69bfe08b2f34e6ad23a78df3, 'Cécile').
last_name(c_cile_savoie_69bfe08b2f34e6ad23a78df3, 'Savoie').
age(c_cile_savoie_69bfe08b2f34e6ad23a78df3, 100).
gender(c_cile_savoie_69bfe08b2f34e6ad23a78df3, female).
dead(c_cile_savoie_69bfe08b2f34e6ad23a78df3).
personality(c_cile_savoie_69bfe08b2f34e6ad23a78df3, openness, 0.7152248276960064).
personality(c_cile_savoie_69bfe08b2f34e6ad23a78df3, conscientiousness, 0.046357727134458626).
personality(c_cile_savoie_69bfe08b2f34e6ad23a78df3, extroversion, 0.1070082542503493).
personality(c_cile_savoie_69bfe08b2f34e6ad23a78df3, agreeableness, -0.035321901642987624).
personality(c_cile_savoie_69bfe08b2f34e6ad23a78df3, neuroticism, -0.08764747290166763).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, creativity, 0.67).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, music, 0.79).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, languages, 0.77).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, crafting, 0.69).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, farming, 0.27).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, cooking, 0.33).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, persuasion, 0.61).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, leadership, 0.63).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, trading, 0.37).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, medicine, 0.31).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, teaching, 0.28).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, diplomacy, 0.16).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, combat, 0.44).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, athletics, 0.53).
skill(c_cile_savoie_69bfe08b2f34e6ad23a78df3, endurance, 0.37).
child_of(c_cile_savoie_69bfe08b2f34e6ad23a78df3, _69bfe08b2f34e6ad23a78dee).
child_of(c_cile_savoie_69bfe08b2f34e6ad23a78df3, _69bfe08b2f34e6ad23a78df0).
person(anne_savoie_69bfe08b2f34e6ad23a78df5).
first_name(anne_savoie_69bfe08b2f34e6ad23a78df5, 'Anne').
last_name(anne_savoie_69bfe08b2f34e6ad23a78df5, 'Savoie').
age(anne_savoie_69bfe08b2f34e6ad23a78df5, 99).
gender(anne_savoie_69bfe08b2f34e6ad23a78df5, female).
dead(anne_savoie_69bfe08b2f34e6ad23a78df5).
personality(anne_savoie_69bfe08b2f34e6ad23a78df5, openness, 0.6497609200058125).
personality(anne_savoie_69bfe08b2f34e6ad23a78df5, conscientiousness, -0.04977592012481478).
personality(anne_savoie_69bfe08b2f34e6ad23a78df5, extroversion, -0.09194503072454428).
personality(anne_savoie_69bfe08b2f34e6ad23a78df5, agreeableness, -0.28044891170432695).
personality(anne_savoie_69bfe08b2f34e6ad23a78df5, neuroticism, -0.19663773783313818).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, creativity, 1).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, music, 0.53).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, languages, 0.61).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, crafting, 0.5).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, farming, 0.46).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, cooking, 0.53).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, persuasion, 0.31).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, leadership, 0.4).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, trading, 0.37).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, medicine, 0.2).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, teaching, 0.11).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, diplomacy, 0.15).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, combat, 0.67).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, athletics, 0.51).
skill(anne_savoie_69bfe08b2f34e6ad23a78df5, endurance, 0.57).
child_of(anne_savoie_69bfe08b2f34e6ad23a78df5, _69bfe08b2f34e6ad23a78dee).
child_of(anne_savoie_69bfe08b2f34e6ad23a78df5, _69bfe08b2f34e6ad23a78df0).
person(guy_savoie_69bfe08b2f34e6ad23a78df7).
first_name(guy_savoie_69bfe08b2f34e6ad23a78df7, 'Guy').
last_name(guy_savoie_69bfe08b2f34e6ad23a78df7, 'Savoie').
age(guy_savoie_69bfe08b2f34e6ad23a78df7, 98).
gender(guy_savoie_69bfe08b2f34e6ad23a78df7, male).
dead(guy_savoie_69bfe08b2f34e6ad23a78df7).
personality(guy_savoie_69bfe08b2f34e6ad23a78df7, openness, 0.4610070093116384).
personality(guy_savoie_69bfe08b2f34e6ad23a78df7, conscientiousness, 0.10305167657264958).
personality(guy_savoie_69bfe08b2f34e6ad23a78df7, extroversion, -0.04721833676936385).
personality(guy_savoie_69bfe08b2f34e6ad23a78df7, agreeableness, -0.06235583568581821).
personality(guy_savoie_69bfe08b2f34e6ad23a78df7, neuroticism, -0.3446411374008944).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, creativity, 0.8).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, music, 0.39).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, languages, 0.52).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, crafting, 0.52).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, farming, 0.67).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, cooking, 0.42).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, persuasion, 0.68).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, leadership, 0.48).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, trading, 0.29).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, medicine, 0.52).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, teaching, 0.45).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, diplomacy, 0.47).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, combat, 0.49).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, athletics, 0.43).
skill(guy_savoie_69bfe08b2f34e6ad23a78df7, endurance, 0.65).
child_of(guy_savoie_69bfe08b2f34e6ad23a78df7, _69bfe08b2f34e6ad23a78dee).
child_of(guy_savoie_69bfe08b2f34e6ad23a78df7, _69bfe08b2f34e6ad23a78df0).

% === Item Facts ===
item(_69b112cceb5968f4d7d33908).
item_name(_69b112cceb5968f4d7d33908, 'Wood').
item_type(_69b112cceb5968f4d7d33908, material).
item_value(_69b112cceb5968f4d7d33908, 2).
item_weight(_69b112cceb5968f4d7d33908, 3).
item_tradeable(_69b112cceb5968f4d7d33908, true).
item(_69b112cceb5968f4d7d33909).
item_name(_69b112cceb5968f4d7d33909, 'Stone').
item_type(_69b112cceb5968f4d7d33909, material).
item_value(_69b112cceb5968f4d7d33909, 1).
item_weight(_69b112cceb5968f4d7d33909, 4).
item_tradeable(_69b112cceb5968f4d7d33909, true).
item(_69b112cceb5968f4d7d3390a).
item_name(_69b112cceb5968f4d7d3390a, 'Fiber').
item_type(_69b112cceb5968f4d7d3390a, material).
item_value(_69b112cceb5968f4d7d3390a, 1).
item_weight(_69b112cceb5968f4d7d3390a, 0.5).
item_tradeable(_69b112cceb5968f4d7d3390a, true).
item(_69b112cceb5968f4d7d3390b).
item_name(_69b112cceb5968f4d7d3390b, 'Leather').
item_type(_69b112cceb5968f4d7d3390b, material).
item_value(_69b112cceb5968f4d7d3390b, 5).
item_weight(_69b112cceb5968f4d7d3390b, 2).
item_tradeable(_69b112cceb5968f4d7d3390b, true).
item(_69b112cceb5968f4d7d3390c).
item_name(_69b112cceb5968f4d7d3390c, 'Cloth').
item_type(_69b112cceb5968f4d7d3390c, material).
item_value(_69b112cceb5968f4d7d3390c, 3).
item_weight(_69b112cceb5968f4d7d3390c, 1).
item_tradeable(_69b112cceb5968f4d7d3390c, true).
item(_69b112cceb5968f4d7d3390d).
item_name(_69b112cceb5968f4d7d3390d, 'Clay').
item_type(_69b112cceb5968f4d7d3390d, material).
item_value(_69b112cceb5968f4d7d3390d, 1).
item_weight(_69b112cceb5968f4d7d3390d, 3).
item_tradeable(_69b112cceb5968f4d7d3390d, true).
item(_69b112cceb5968f4d7d3390e).
item_name(_69b112cceb5968f4d7d3390e, 'Glass').
item_type(_69b112cceb5968f4d7d3390e, material).
item_value(_69b112cceb5968f4d7d3390e, 4).
item_weight(_69b112cceb5968f4d7d3390e, 1).
item_tradeable(_69b112cceb5968f4d7d3390e, true).
item(_69b112cceb5968f4d7d3390f).
item_name(_69b112cceb5968f4d7d3390f, 'Iron Ingot').
item_type(_69b112cceb5968f4d7d3390f, material).
item_value(_69b112cceb5968f4d7d3390f, 8).
item_weight(_69b112cceb5968f4d7d3390f, 3).
item_tradeable(_69b112cceb5968f4d7d3390f, true).
item(_69b112cceb5968f4d7d33910).
item_name(_69b112cceb5968f4d7d33910, 'Steel Ingot').
item_type(_69b112cceb5968f4d7d33910, material).
item_value(_69b112cceb5968f4d7d33910, 15).
item_weight(_69b112cceb5968f4d7d33910, 3).
item_tradeable(_69b112cceb5968f4d7d33910, true).
item(_69b112cceb5968f4d7d33911).
item_name(_69b112cceb5968f4d7d33911, 'Silver Ingot').
item_type(_69b112cceb5968f4d7d33911, material).
item_value(_69b112cceb5968f4d7d33911, 25).
item_weight(_69b112cceb5968f4d7d33911, 2).
item_tradeable(_69b112cceb5968f4d7d33911, true).
item(_69b112cceb5968f4d7d33912).
item_name(_69b112cceb5968f4d7d33912, 'Gold Ingot').
item_type(_69b112cceb5968f4d7d33912, material).
item_value(_69b112cceb5968f4d7d33912, 50).
item_weight(_69b112cceb5968f4d7d33912, 4).
item_tradeable(_69b112cceb5968f4d7d33912, true).
item(_69b112cceb5968f4d7d33913).
item_name(_69b112cceb5968f4d7d33913, 'Copper Ore').
item_type(_69b112cceb5968f4d7d33913, material).
item_value(_69b112cceb5968f4d7d33913, 3).
item_weight(_69b112cceb5968f4d7d33913, 3).
item_tradeable(_69b112cceb5968f4d7d33913, true).
item(_69b112cceb5968f4d7d33914).
item_name(_69b112cceb5968f4d7d33914, 'Coal').
item_type(_69b112cceb5968f4d7d33914, material).
item_value(_69b112cceb5968f4d7d33914, 2).
item_weight(_69b112cceb5968f4d7d33914, 2).
item_tradeable(_69b112cceb5968f4d7d33914, true).
item(_69b112cceb5968f4d7d33915).
item_name(_69b112cceb5968f4d7d33915, 'Knife').
item_type(_69b112cceb5968f4d7d33915, tool).
item_value(_69b112cceb5968f4d7d33915, 5).
item_weight(_69b112cceb5968f4d7d33915, 0.5).
item_tradeable(_69b112cceb5968f4d7d33915, true).
item(_69b112cceb5968f4d7d33916).
item_name(_69b112cceb5968f4d7d33916, 'Hammer').
item_type(_69b112cceb5968f4d7d33916, tool).
item_value(_69b112cceb5968f4d7d33916, 8).
item_weight(_69b112cceb5968f4d7d33916, 3).
item_tradeable(_69b112cceb5968f4d7d33916, true).
item(_69b112cdeb5968f4d7d33917).
item_name(_69b112cdeb5968f4d7d33917, 'Shovel').
item_type(_69b112cdeb5968f4d7d33917, tool).
item_value(_69b112cdeb5968f4d7d33917, 7).
item_weight(_69b112cdeb5968f4d7d33917, 3).
item_tradeable(_69b112cdeb5968f4d7d33917, true).
item(_69b112cdeb5968f4d7d33918).
item_name(_69b112cdeb5968f4d7d33918, 'Fishing Rod').
item_type(_69b112cdeb5968f4d7d33918, tool).
item_value(_69b112cdeb5968f4d7d33918, 10).
item_weight(_69b112cdeb5968f4d7d33918, 2).
item_tradeable(_69b112cdeb5968f4d7d33918, true).
item(_69b112cdeb5968f4d7d33919).
item_name(_69b112cdeb5968f4d7d33919, 'Sack').
item_type(_69b112cdeb5968f4d7d33919, tool).
item_value(_69b112cdeb5968f4d7d33919, 2).
item_weight(_69b112cdeb5968f4d7d33919, 0.5).
item_tradeable(_69b112cdeb5968f4d7d33919, true).
item(_69b112cdeb5968f4d7d3391a).
item_name(_69b112cdeb5968f4d7d3391a, 'Barrel').
item_type(_69b112cdeb5968f4d7d3391a, collectible).
item_value(_69b112cdeb5968f4d7d3391a, 5).
item_weight(_69b112cdeb5968f4d7d3391a, 8).
item_tradeable(_69b112cdeb5968f4d7d3391a, true).
item(_69b112cdeb5968f4d7d3391b).
item_name(_69b112cdeb5968f4d7d3391b, 'Crate').
item_type(_69b112cdeb5968f4d7d3391b, collectible).
item_value(_69b112cdeb5968f4d7d3391b, 3).
item_weight(_69b112cdeb5968f4d7d3391b, 6).
item_tradeable(_69b112cdeb5968f4d7d3391b, true).
item(_69b112cdeb5968f4d7d3391c).
item_name(_69b112cdeb5968f4d7d3391c, 'Candle').
item_type(_69b112cdeb5968f4d7d3391c, tool).
item_value(_69b112cdeb5968f4d7d3391c, 1).
item_weight(_69b112cdeb5968f4d7d3391c, 0.3).
item_tradeable(_69b112cdeb5968f4d7d3391c, true).
item(_69b112cdeb5968f4d7d3391d).
item_name(_69b112cdeb5968f4d7d3391d, 'Key').
item_type(_69b112cdeb5968f4d7d3391d, key).
item_value(_69b112cdeb5968f4d7d3391d, 5).
item_weight(_69b112cdeb5968f4d7d3391d, 0.1).
item_tradeable(_69b112cdeb5968f4d7d3391d, false).
item(_69b112cdeb5968f4d7d3391e).
item_name(_69b112cdeb5968f4d7d3391e, 'Map').
item_type(_69b112cdeb5968f4d7d3391e, key).
item_value(_69b112cdeb5968f4d7d3391e, 10).
item_weight(_69b112cdeb5968f4d7d3391e, 0.1).
item_tradeable(_69b112cdeb5968f4d7d3391e, true).
item(_69b112cdeb5968f4d7d3391f).
item_name(_69b112cdeb5968f4d7d3391f, 'Book').
item_type(_69b112cdeb5968f4d7d3391f, collectible).
item_value(_69b112cdeb5968f4d7d3391f, 8).
item_weight(_69b112cdeb5968f4d7d3391f, 1).
item_tradeable(_69b112cdeb5968f4d7d3391f, true).
item(_69b112cdeb5968f4d7d33920).
item_name(_69b112cdeb5968f4d7d33920, 'Letter').
item_type(_69b112cdeb5968f4d7d33920, quest).
item_weight(_69b112cdeb5968f4d7d33920, 0.1).
item_tradeable(_69b112cdeb5968f4d7d33920, false).
item(_69b112cdeb5968f4d7d33921).
item_name(_69b112cdeb5968f4d7d33921, 'Coin Purse').
item_type(_69b112cdeb5968f4d7d33921, collectible).
item_value(_69b112cdeb5968f4d7d33921, 15).
item_weight(_69b112cdeb5968f4d7d33921, 0.3).
item_tradeable(_69b112cdeb5968f4d7d33921, true).
item(_69b112cdeb5968f4d7d33922).
item_name(_69b112cdeb5968f4d7d33922, 'Apple').
item_type(_69b112cdeb5968f4d7d33922, food).
item_value(_69b112cdeb5968f4d7d33922, 1).
item_weight(_69b112cdeb5968f4d7d33922, 0.2).
item_tradeable(_69b112cdeb5968f4d7d33922, true).
item(_69b112cdeb5968f4d7d33923).
item_name(_69b112cdeb5968f4d7d33923, 'Raw Meat').
item_type(_69b112cdeb5968f4d7d33923, food).
item_value(_69b112cdeb5968f4d7d33923, 3).
item_weight(_69b112cdeb5968f4d7d33923, 1).
item_tradeable(_69b112cdeb5968f4d7d33923, true).
item(_69b112cdeb5968f4d7d33924).
item_name(_69b112cdeb5968f4d7d33924, 'Fish').
item_type(_69b112cdeb5968f4d7d33924, food).
item_value(_69b112cdeb5968f4d7d33924, 4).
item_weight(_69b112cdeb5968f4d7d33924, 1).
item_tradeable(_69b112cdeb5968f4d7d33924, true).
item(_69b112cdeb5968f4d7d33925).
item_name(_69b112cdeb5968f4d7d33925, 'Mushroom').
item_type(_69b112cdeb5968f4d7d33925, food).
item_value(_69b112cdeb5968f4d7d33925, 2).
item_weight(_69b112cdeb5968f4d7d33925, 0.2).
item_tradeable(_69b112cdeb5968f4d7d33925, true).
item(_69b112ceeb5968f4d7d33926).
item_name(_69b112ceeb5968f4d7d33926, 'Salt').
item_type(_69b112ceeb5968f4d7d33926, material).
item_value(_69b112ceeb5968f4d7d33926, 3).
item_weight(_69b112ceeb5968f4d7d33926, 0.5).
item_tradeable(_69b112ceeb5968f4d7d33926, true).
item(_69b112ceeb5968f4d7d33927).
item_name(_69b112ceeb5968f4d7d33927, 'Rock').
item_type(_69b112ceeb5968f4d7d33927, material).
item_weight(_69b112ceeb5968f4d7d33927, 2).
item_tradeable(_69b112ceeb5968f4d7d33927, true).
item(_69b112ceeb5968f4d7d33928).
item_name(_69b112ceeb5968f4d7d33928, 'Stick').
item_type(_69b112ceeb5968f4d7d33928, material).
item_weight(_69b112ceeb5968f4d7d33928, 0.5).
item_tradeable(_69b112ceeb5968f4d7d33928, true).
item(_69b112ceeb5968f4d7d33929).
item_name(_69b112ceeb5968f4d7d33929, 'Bone').
item_type(_69b112ceeb5968f4d7d33929, material).
item_value(_69b112ceeb5968f4d7d33929, 1).
item_weight(_69b112ceeb5968f4d7d33929, 0.5).
item_tradeable(_69b112ceeb5968f4d7d33929, true).
item(_69b112ceeb5968f4d7d3392a).
item_name(_69b112ceeb5968f4d7d3392a, 'Feather').
item_type(_69b112ceeb5968f4d7d3392a, material).
item_value(_69b112ceeb5968f4d7d3392a, 1).
item_weight(_69b112ceeb5968f4d7d3392a, 0.1).
item_tradeable(_69b112ceeb5968f4d7d3392a, true).
item(_69b112ceeb5968f4d7d3392b).
item_name(_69b112ceeb5968f4d7d3392b, 'Shell').
item_type(_69b112ceeb5968f4d7d3392b, collectible).
item_value(_69b112ceeb5968f4d7d3392b, 2).
item_weight(_69b112ceeb5968f4d7d3392b, 0.1).
item_tradeable(_69b112ceeb5968f4d7d3392b, true).
item(_69b11309025a687fc1a10ae9).
item_name(_69b11309025a687fc1a10ae9, 'Bookshelf').
item_type(_69b11309025a687fc1a10ae9, collectible).
item_value(_69b11309025a687fc1a10ae9, 10).
item_weight(_69b11309025a687fc1a10ae9, 10).
item_tradeable(_69b11309025a687fc1a10ae9, true).
item(_69b8cd7e9089ced33212fa8f).
item_name(_69b8cd7e9089ced33212fa8f, 'Cheese').
item_type(_69b8cd7e9089ced33212fa8f, food).
item_value(_69b8cd7e9089ced33212fa8f, 3).
item_weight(_69b8cd7e9089ced33212fa8f, 0.5).
item_tradeable(_69b8cd7e9089ced33212fa8f, true).
item(_69b8cd7e9089ced33212fa90).
item_name(_69b8cd7e9089ced33212fa90, 'Egg').
item_type(_69b8cd7e9089ced33212fa90, food).
item_value(_69b8cd7e9089ced33212fa90, 1).
item_weight(_69b8cd7e9089ced33212fa90, 0.2).
item_tradeable(_69b8cd7e9089ced33212fa90, true).
item(_69b8cd7e9089ced33212fa91).
item_name(_69b8cd7e9089ced33212fa91, 'Honey').
item_type(_69b8cd7e9089ced33212fa91, food).
item_value(_69b8cd7e9089ced33212fa91, 5).
item_weight(_69b8cd7e9089ced33212fa91, 0.5).
item_tradeable(_69b8cd7e9089ced33212fa91, true).
item(_69b8cd7e9089ced33212fa92).
item_name(_69b8cd7e9089ced33212fa92, 'Berries').
item_type(_69b8cd7e9089ced33212fa92, food).
item_value(_69b8cd7e9089ced33212fa92, 1).
item_weight(_69b8cd7e9089ced33212fa92, 0.2).
item_tradeable(_69b8cd7e9089ced33212fa92, true).
item(_69b8cd7e9089ced33212fa93).
item_name(_69b8cd7e9089ced33212fa93, 'Milk').
item_type(_69b8cd7e9089ced33212fa93, drink).
item_value(_69b8cd7e9089ced33212fa93, 2).
item_weight(_69b8cd7e9089ced33212fa93, 1).
item_tradeable(_69b8cd7e9089ced33212fa93, true).
item(_69b8cd7e9089ced33212fa94).
item_name(_69b8cd7e9089ced33212fa94, 'Water Bottle').
item_type(_69b8cd7e9089ced33212fa94, drink).
item_value(_69b8cd7e9089ced33212fa94, 1).
item_weight(_69b8cd7e9089ced33212fa94, 1).
item_tradeable(_69b8cd7e9089ced33212fa94, true).
item(_69b8cd7e9089ced33212fa95).
item_name(_69b8cd7e9089ced33212fa95, 'Flour').
item_type(_69b8cd7e9089ced33212fa95, material).
item_value(_69b8cd7e9089ced33212fa95, 2).
item_weight(_69b8cd7e9089ced33212fa95, 2).
item_tradeable(_69b8cd7e9089ced33212fa95, true).
item(_69b8cd7e9089ced33212fa96).
item_name(_69b8cd7e9089ced33212fa96, 'Sugar').
item_type(_69b8cd7e9089ced33212fa96, material).
item_value(_69b8cd7e9089ced33212fa96, 3).
item_weight(_69b8cd7e9089ced33212fa96, 0.5).
item_tradeable(_69b8cd7e9089ced33212fa96, true).
item(_69b8cd7f9089ced33212fa97).
item_name(_69b8cd7f9089ced33212fa97, 'Oil').
item_type(_69b8cd7f9089ced33212fa97, material).
item_value(_69b8cd7f9089ced33212fa97, 3).
item_weight(_69b8cd7f9089ced33212fa97, 1).
item_tradeable(_69b8cd7f9089ced33212fa97, true).
item(_69b8cd7f9089ced33212fa98).
item_name(_69b8cd7f9089ced33212fa98, 'Rope Coil').
item_type(_69b8cd7f9089ced33212fa98, material).
item_value(_69b8cd7f9089ced33212fa98, 4).
item_weight(_69b8cd7f9089ced33212fa98, 2).
item_tradeable(_69b8cd7f9089ced33212fa98, true).
item(_69b8cd7f9089ced33212fa99).
item_name(_69b8cd7f9089ced33212fa99, 'Nails').
item_type(_69b8cd7f9089ced33212fa99, material).
item_value(_69b8cd7f9089ced33212fa99, 2).
item_weight(_69b8cd7f9089ced33212fa99, 0.5).
item_tradeable(_69b8cd7f9089ced33212fa99, true).
item(_69b8cd7f9089ced33212fa9a).
item_name(_69b8cd7f9089ced33212fa9a, 'Wax').
item_type(_69b8cd7f9089ced33212fa9a, material).
item_value(_69b8cd7f9089ced33212fa9a, 2).
item_weight(_69b8cd7f9089ced33212fa9a, 0.5).
item_tradeable(_69b8cd7f9089ced33212fa9a, true).
item(_69b8cd7f9089ced33212fa9b).
item_name(_69b8cd7f9089ced33212fa9b, 'Thread').
item_type(_69b8cd7f9089ced33212fa9b, material).
item_value(_69b8cd7f9089ced33212fa9b, 1).
item_weight(_69b8cd7f9089ced33212fa9b, 0.1).
item_tradeable(_69b8cd7f9089ced33212fa9b, true).
item(_69b8cd7f9089ced33212fa9c).
item_name(_69b8cd7f9089ced33212fa9c, 'Ink').
item_type(_69b8cd7f9089ced33212fa9c, material).
item_value(_69b8cd7f9089ced33212fa9c, 3).
item_weight(_69b8cd7f9089ced33212fa9c, 0.3).
item_tradeable(_69b8cd7f9089ced33212fa9c, true).
item(_69b8cd7f9089ced33212fa9d).
item_name(_69b8cd7f9089ced33212fa9d, 'Parchment').
item_type(_69b8cd7f9089ced33212fa9d, material).
item_value(_69b8cd7f9089ced33212fa9d, 2).
item_weight(_69b8cd7f9089ced33212fa9d, 0.1).
item_tradeable(_69b8cd7f9089ced33212fa9d, true).
item(_69b8cd7f9089ced33212fa9e).
item_name(_69b8cd7f9089ced33212fa9e, 'Needle').
item_type(_69b8cd7f9089ced33212fa9e, tool).
item_value(_69b8cd7f9089ced33212fa9e, 1).
item_weight(_69b8cd7f9089ced33212fa9e, 0.05).
item_tradeable(_69b8cd7f9089ced33212fa9e, true).
item(_69b8cd7f9089ced33212fa9f).
item_name(_69b8cd7f9089ced33212fa9f, 'Saw').
item_type(_69b8cd7f9089ced33212fa9f, tool).
item_value(_69b8cd7f9089ced33212fa9f, 8).
item_weight(_69b8cd7f9089ced33212fa9f, 2).
item_tradeable(_69b8cd7f9089ced33212fa9f, true).
item(_69b8cd7f9089ced33212faa0).
item_name(_69b8cd7f9089ced33212faa0, 'Bucket').
item_type(_69b8cd7f9089ced33212faa0, tool).
item_value(_69b8cd7f9089ced33212faa0, 3).
item_weight(_69b8cd7f9089ced33212faa0, 1.5).
item_tradeable(_69b8cd7f9089ced33212faa0, true).
item(_69b8cd7f9089ced33212faa1).
item_name(_69b8cd7f9089ced33212faa1, 'Mortar and Pestle').
item_type(_69b8cd7f9089ced33212faa1, tool).
item_value(_69b8cd7f9089ced33212faa1, 6).
item_weight(_69b8cd7f9089ced33212faa1, 2).
item_tradeable(_69b8cd7f9089ced33212faa1, true).
item(_69b8cd7f9089ced33212faa2).
item_name(_69b8cd7f9089ced33212faa2, 'Flower').
item_type(_69b8cd7f9089ced33212faa2, collectible).
item_value(_69b8cd7f9089ced33212faa2, 1).
item_weight(_69b8cd7f9089ced33212faa2, 0.1).
item_tradeable(_69b8cd7f9089ced33212faa2, true).
item(_69b8cd7f9089ced33212faa3).
item_name(_69b8cd7f9089ced33212faa3, 'Pendant').
item_type(_69b8cd7f9089ced33212faa3, collectible).
item_value(_69b8cd7f9089ced33212faa3, 8).
item_weight(_69b8cd7f9089ced33212faa3, 0.2).
item_tradeable(_69b8cd7f9089ced33212faa3, true).
item(_69b8cd7f9089ced33212faa4).
item_name(_69b8cd7f9089ced33212faa4, 'Mirror').
item_type(_69b8cd7f9089ced33212faa4, collectible).
item_value(_69b8cd7f9089ced33212faa4, 10).
item_weight(_69b8cd7f9089ced33212faa4, 0.5).
item_tradeable(_69b8cd7f9089ced33212faa4, true).
item(_69b8cd7f9089ced33212faa5).
item_name(_69b8cd7f9089ced33212faa5, 'Dice').
item_type(_69b8cd7f9089ced33212faa5, collectible).
item_value(_69b8cd7f9089ced33212faa5, 2).
item_weight(_69b8cd7f9089ced33212faa5, 0.1).
item_tradeable(_69b8cd7f9089ced33212faa5, true).
item(_69b8cd7f9089ced33212faa6).
item_name(_69b8cd7f9089ced33212faa6, 'Bell').
item_type(_69b8cd7f9089ced33212faa6, collectible).
item_value(_69b8cd7f9089ced33212faa6, 3).
item_weight(_69b8cd7f9089ced33212faa6, 0.3).
item_tradeable(_69b8cd7f9089ced33212faa6, true).
item(_69b8cd809089ced33212faa7).
item_name(_69b8cd809089ced33212faa7, 'Chair').
item_type(_69b8cd809089ced33212faa7, collectible).
item_value(_69b8cd809089ced33212faa7, 8).
item_weight(_69b8cd809089ced33212faa7, 5).
item_tradeable(_69b8cd809089ced33212faa7, true).
item(_69b8cd809089ced33212faa8).
item_name(_69b8cd809089ced33212faa8, 'Table').
item_type(_69b8cd809089ced33212faa8, collectible).
item_value(_69b8cd809089ced33212faa8, 15).
item_weight(_69b8cd809089ced33212faa8, 12).
item_tradeable(_69b8cd809089ced33212faa8, true).
item(_69b8cd809089ced33212faa9).
item_name(_69b8cd809089ced33212faa9, 'Bed').
item_type(_69b8cd809089ced33212faa9, collectible).
item_value(_69b8cd809089ced33212faa9, 20).
item_weight(_69b8cd809089ced33212faa9, 20).
item_tradeable(_69b8cd809089ced33212faa9, true).
item(_69b8cd809089ced33212faaa).
item_name(_69b8cd809089ced33212faaa, 'Shelf').
item_type(_69b8cd809089ced33212faaa, collectible).
item_value(_69b8cd809089ced33212faaa, 10).
item_weight(_69b8cd809089ced33212faaa, 8).
item_tradeable(_69b8cd809089ced33212faaa, true).
item(_69b8cd809089ced33212faab).
item_name(_69b8cd809089ced33212faab, 'Chest').
item_type(_69b8cd809089ced33212faab, collectible).
item_value(_69b8cd809089ced33212faab, 12).
item_weight(_69b8cd809089ced33212faab, 10).
item_tradeable(_69b8cd809089ced33212faab, true).
item(_69b8cd809089ced33212faac).
item_name(_69b8cd809089ced33212faac, 'Chandelier').
item_type(_69b8cd809089ced33212faac, collectible).
item_value(_69b8cd809089ced33212faac, 30).
item_weight(_69b8cd809089ced33212faac, 10).
item_tradeable(_69b8cd809089ced33212faac, true).
item(_69b11307025a687fc1a10ad1).
item_name(_69b11307025a687fc1a10ad1, 'Cyber-Blade').
item_type(_69b11307025a687fc1a10ad1, weapon).
item_value(_69b11307025a687fc1a10ad1, 35).
item_weight(_69b11307025a687fc1a10ad1, 1).
item_tradeable(_69b11307025a687fc1a10ad1, true).
item(_69b11307025a687fc1a10ad2).
item_name(_69b11307025a687fc1a10ad2, 'Pulse Pistol').
item_type(_69b11307025a687fc1a10ad2, weapon).
item_value(_69b11307025a687fc1a10ad2, 30).
item_weight(_69b11307025a687fc1a10ad2, 2).
item_tradeable(_69b11307025a687fc1a10ad2, true).
item(_69b11307025a687fc1a10ad3).
item_name(_69b11307025a687fc1a10ad3, 'EMP Grenade').
item_type(_69b11307025a687fc1a10ad3, weapon).
item_value(_69b11307025a687fc1a10ad3, 20).
item_weight(_69b11307025a687fc1a10ad3, 0.5).
item_tradeable(_69b11307025a687fc1a10ad3, true).
item(_69b11307025a687fc1a10ad4).
item_name(_69b11307025a687fc1a10ad4, 'Neural Stim').
item_type(_69b11307025a687fc1a10ad4, consumable).
item_value(_69b11307025a687fc1a10ad4, 18).
item_weight(_69b11307025a687fc1a10ad4, 0.2).
item_tradeable(_69b11307025a687fc1a10ad4, true).
item(_69b11307025a687fc1a10ad5).
item_name(_69b11307025a687fc1a10ad5, 'Med-Hypo').
item_type(_69b11307025a687fc1a10ad5, consumable).
item_value(_69b11307025a687fc1a10ad5, 15).
item_weight(_69b11307025a687fc1a10ad5, 0.2).
item_tradeable(_69b11307025a687fc1a10ad5, true).
item(_69b11308025a687fc1a10ad6).
item_name(_69b11308025a687fc1a10ad6, 'Synth-Food Bar').
item_type(_69b11308025a687fc1a10ad6, food).
item_value(_69b11308025a687fc1a10ad6, 3).
item_weight(_69b11308025a687fc1a10ad6, 0.3).
item_tradeable(_69b11308025a687fc1a10ad6, true).
item(_69b11308025a687fc1a10ad7).
item_name(_69b11308025a687fc1a10ad7, 'Encrypted Data Pad').
item_type(_69b11308025a687fc1a10ad7, key).
item_value(_69b11308025a687fc1a10ad7, 40).
item_weight(_69b11308025a687fc1a10ad7, 0.5).
item_tradeable(_69b11308025a687fc1a10ad7, false).
item(_69b11308025a687fc1a10ad8).
item_name(_69b11308025a687fc1a10ad8, 'Energy Core').
item_type(_69b11308025a687fc1a10ad8, material).
item_value(_69b11308025a687fc1a10ad8, 35).
item_weight(_69b11308025a687fc1a10ad8, 2).
item_tradeable(_69b11308025a687fc1a10ad8, true).
item(_69b11308025a687fc1a10ad9).
item_name(_69b11308025a687fc1a10ad9, 'Cyber-Deck').
item_type(_69b11308025a687fc1a10ad9, tool).
item_value(_69b11308025a687fc1a10ad9, 50).
item_weight(_69b11308025a687fc1a10ad9, 1).
item_tradeable(_69b11308025a687fc1a10ad9, true).
item(_69b11308025a687fc1a10ada).
item_name(_69b11308025a687fc1a10ada, 'Supply Crate').
item_type(_69b11308025a687fc1a10ada, collectible).
item_value(_69b11308025a687fc1a10ada, 20).
item_weight(_69b11308025a687fc1a10ada, 5).
item_tradeable(_69b11308025a687fc1a10ada, true).
item(_69b11308025a687fc1a10adb).
item_name(_69b11308025a687fc1a10adb, 'Credstick').
item_type(_69b11308025a687fc1a10adb, collectible).
item_value(_69b11308025a687fc1a10adb, 25).
item_weight(_69b11308025a687fc1a10adb, 0.1).
item_tradeable(_69b11308025a687fc1a10adb, true).
item(_69b8cd819089ced33212fabf).
item_name(_69b8cd819089ced33212fabf, 'Shock Baton').
item_type(_69b8cd819089ced33212fabf, weapon).
item_value(_69b8cd819089ced33212fabf, 30).
item_weight(_69b8cd819089ced33212fabf, 2).
item_tradeable(_69b8cd819089ced33212fabf, true).
item(_69b8cd819089ced33212fac0).
item_name(_69b8cd819089ced33212fac0, 'Plasma Rifle').
item_type(_69b8cd819089ced33212fac0, weapon).
item_value(_69b8cd819089ced33212fac0, 80).
item_weight(_69b8cd819089ced33212fac0, 5).
item_tradeable(_69b8cd819089ced33212fac0, true).
item(_69b8cd819089ced33212fac1).
item_name(_69b8cd819089ced33212fac1, 'Nano-Wire').
item_type(_69b8cd819089ced33212fac1, weapon).
item_value(_69b8cd819089ced33212fac1, 50).
item_weight(_69b8cd819089ced33212fac1, 0.5).
item_tradeable(_69b8cd819089ced33212fac1, true).
item(_69b8cd819089ced33212fac2).
item_name(_69b8cd819089ced33212fac2, 'Holo-Shield').
item_type(_69b8cd819089ced33212fac2, armor).
item_value(_69b8cd819089ced33212fac2, 45).
item_weight(_69b8cd819089ced33212fac2, 1).
item_tradeable(_69b8cd819089ced33212fac2, true).
item(_69b8cd819089ced33212fac3).
item_name(_69b8cd819089ced33212fac3, 'Synth-Armor Vest').
item_type(_69b8cd819089ced33212fac3, armor).
item_value(_69b8cd819089ced33212fac3, 35).
item_weight(_69b8cd819089ced33212fac3, 3).
item_tradeable(_69b8cd819089ced33212fac3, true).
item(_69b8cd819089ced33212fac4).
item_name(_69b8cd819089ced33212fac4, 'Combat Helmet').
item_type(_69b8cd819089ced33212fac4, armor).
item_value(_69b8cd819089ced33212fac4, 30).
item_weight(_69b8cd819089ced33212fac4, 2).
item_tradeable(_69b8cd819089ced33212fac4, true).
item(_69b8cd819089ced33212fac5).
item_name(_69b8cd819089ced33212fac5, 'Neural Interface').
item_type(_69b8cd819089ced33212fac5, tool).
item_value(_69b8cd819089ced33212fac5, 100).
item_weight(_69b8cd819089ced33212fac5, 0.1).
item_tradeable(_69b8cd819089ced33212fac5, true).
item(_69b8cd829089ced33212fac6).
item_name(_69b8cd829089ced33212fac6, 'Reflex Booster').
item_type(_69b8cd829089ced33212fac6, consumable).
item_value(_69b8cd829089ced33212fac6, 60).
item_weight(_69b8cd829089ced33212fac6, 0.1).
item_tradeable(_69b8cd829089ced33212fac6, true).
item(_69b8cd829089ced33212fac7).
item_name(_69b8cd829089ced33212fac7, 'Stim Pack').
item_type(_69b8cd829089ced33212fac7, consumable).
item_value(_69b8cd829089ced33212fac7, 15).
item_weight(_69b8cd829089ced33212fac7, 0.3).
item_tradeable(_69b8cd829089ced33212fac7, true).
item(_69b8cd829089ced33212fac8).
item_name(_69b8cd829089ced33212fac8, 'E-Ration').
item_type(_69b8cd829089ced33212fac8, food).
item_value(_69b8cd829089ced33212fac8, 5).
item_weight(_69b8cd829089ced33212fac8, 0.3).
item_tradeable(_69b8cd829089ced33212fac8, true).
item(_69b8cd829089ced33212fac9).
item_name(_69b8cd829089ced33212fac9, 'Neon Drink').
item_type(_69b8cd829089ced33212fac9, drink).
item_value(_69b8cd829089ced33212fac9, 8).
item_weight(_69b8cd829089ced33212fac9, 0.5).
item_tradeable(_69b8cd829089ced33212fac9, true).
item(_69b8cd829089ced33212faca).
item_name(_69b8cd829089ced33212faca, 'Hacking Spike').
item_type(_69b8cd829089ced33212faca, key).
item_value(_69b8cd829089ced33212faca, 20).
item_weight(_69b8cd829089ced33212faca, 0.1).
item_tradeable(_69b8cd829089ced33212faca, true).
item(_69b8cd829089ced33212facb).
item_name(_69b8cd829089ced33212facb, 'ID Chip').
item_type(_69b8cd829089ced33212facb, key).
item_value(_69b8cd829089ced33212facb, 25).
item_weight(_69b8cd829089ced33212facb, 0.05).
item_tradeable(_69b8cd829089ced33212facb, false).
item(_69b8cd829089ced33212facc).
item_name(_69b8cd829089ced33212facc, 'Scrap Metal').
item_type(_69b8cd829089ced33212facc, material).
item_value(_69b8cd829089ced33212facc, 2).
item_weight(_69b8cd829089ced33212facc, 2).
item_tradeable(_69b8cd829089ced33212facc, true).
item(_69b8cd829089ced33212facd).
item_name(_69b8cd829089ced33212facd, 'Circuit Board').
item_type(_69b8cd829089ced33212facd, material).
item_value(_69b8cd829089ced33212facd, 8).
item_weight(_69b8cd829089ced33212facd, 0.3).
item_tradeable(_69b8cd829089ced33212facd, true).
item(_69b8cd829089ced33212face).
item_name(_69b8cd829089ced33212face, 'Boombox').
item_type(_69b8cd829089ced33212face, collectible).
item_value(_69b8cd829089ced33212face, 15).
item_weight(_69b8cd829089ced33212face, 5).
item_tradeable(_69b8cd829089ced33212face, true).
item(_69b8cd849089ced33212faf1).
item_name(_69b8cd849089ced33212faf1, 'Bronze Sword').
item_type(_69b8cd849089ced33212faf1, weapon).
item_value(_69b8cd849089ced33212faf1, 20).
item_weight(_69b8cd849089ced33212faf1, 2.5).
item_tradeable(_69b8cd849089ced33212faf1, true).
item(_69b8cd849089ced33212faf2).
item_name(_69b8cd849089ced33212faf2, 'Javelin').
item_type(_69b8cd849089ced33212faf2, weapon).
item_value(_69b8cd849089ced33212faf2, 10).
item_weight(_69b8cd849089ced33212faf2, 2).
item_tradeable(_69b8cd849089ced33212faf2, true).
item(_69b8cd849089ced33212faf3).
item_name(_69b8cd849089ced33212faf3, 'Gladius').
item_type(_69b8cd849089ced33212faf3, weapon).
item_value(_69b8cd849089ced33212faf3, 30).
item_weight(_69b8cd849089ced33212faf3, 2).
item_tradeable(_69b8cd849089ced33212faf3, true).
item(_69b8cd849089ced33212faf4).
item_name(_69b8cd849089ced33212faf4, 'Round Shield').
item_type(_69b8cd849089ced33212faf4, armor).
item_value(_69b8cd849089ced33212faf4, 15).
item_weight(_69b8cd849089ced33212faf4, 4).
item_tradeable(_69b8cd849089ced33212faf4, true).
item(_69b8cd859089ced33212faf5).
item_name(_69b8cd859089ced33212faf5, 'Toga').
item_type(_69b8cd859089ced33212faf5, armor).
item_value(_69b8cd859089ced33212faf5, 12).
item_weight(_69b8cd859089ced33212faf5, 1).
item_tradeable(_69b8cd859089ced33212faf5, true).
item(_69b8cd859089ced33212faf6).
item_name(_69b8cd859089ced33212faf6, 'Laurel Wreath').
item_type(_69b8cd859089ced33212faf6, collectible).
item_value(_69b8cd859089ced33212faf6, 30).
item_weight(_69b8cd859089ced33212faf6, 0.2).
item_tradeable(_69b8cd859089ced33212faf6, true).
item(_69b8cd859089ced33212faf7).
item_name(_69b8cd859089ced33212faf7, 'Amphora').
item_type(_69b8cd859089ced33212faf7, collectible).
item_value(_69b8cd859089ced33212faf7, 8).
item_weight(_69b8cd859089ced33212faf7, 3).
item_tradeable(_69b8cd859089ced33212faf7, true).
item(_69b8cd859089ced33212faf8).
item_name(_69b8cd859089ced33212faf8, 'Olive Oil').
item_type(_69b8cd859089ced33212faf8, food).
item_value(_69b8cd859089ced33212faf8, 5).
item_weight(_69b8cd859089ced33212faf8, 1).
item_tradeable(_69b8cd859089ced33212faf8, true).
item(_69b8cd859089ced33212faf9).
item_name(_69b8cd859089ced33212faf9, 'Flatbread').
item_type(_69b8cd859089ced33212faf9, food).
item_value(_69b8cd859089ced33212faf9, 2).
item_weight(_69b8cd859089ced33212faf9, 0.3).
item_tradeable(_69b8cd859089ced33212faf9, true).
item(_69b8cd859089ced33212fafa).
item_name(_69b8cd859089ced33212fafa, 'Wine Jug').
item_type(_69b8cd859089ced33212fafa, drink).
item_value(_69b8cd859089ced33212fafa, 6).
item_weight(_69b8cd859089ced33212fafa, 2).
item_tradeable(_69b8cd859089ced33212fafa, true).
item(_69b8cd859089ced33212fafb).
item_name(_69b8cd859089ced33212fafb, 'Papyrus Scroll').
item_type(_69b8cd859089ced33212fafb, collectible).
item_value(_69b8cd859089ced33212fafb, 15).
item_weight(_69b8cd859089ced33212fafb, 0.2).
item_tradeable(_69b8cd859089ced33212fafb, true).
item(_69b8cd859089ced33212fafc).
item_name(_69b8cd859089ced33212fafc, 'Ancient Coin').
item_type(_69b8cd859089ced33212fafc, collectible).
item_value(_69b8cd859089ced33212fafc, 10).
item_weight(_69b8cd859089ced33212fafc, 0.1).
item_tradeable(_69b8cd859089ced33212fafc, true).
item(_69b8cd859089ced33212fafd).
item_name(_69b8cd859089ced33212fafd, 'Brass Pot').
item_type(_69b8cd859089ced33212fafd, tool).
item_value(_69b8cd859089ced33212fafd, 6).
item_weight(_69b8cd859089ced33212fafd, 3).
item_tradeable(_69b8cd859089ced33212fafd, true).
item(_69b8cd859089ced33212fafe).
item_name(_69b8cd859089ced33212fafe, 'Brass Pan').
item_type(_69b8cd859089ced33212fafe, tool).
item_value(_69b8cd859089ced33212fafe, 5).
item_weight(_69b8cd859089ced33212fafe, 2).
item_tradeable(_69b8cd859089ced33212fafe, true).
item(_69b8cd859089ced33212faff).
item_name(_69b8cd859089ced33212faff, 'Stone Fire Pit').
item_type(_69b8cd859089ced33212faff, collectible).
item_value(_69b8cd859089ced33212faff, 5).
item_weight(_69b8cd859089ced33212faff, 30).
item_tradeable(_69b8cd859089ced33212faff, true).
item(_69b112ceeb5968f4d7d3392c).
item_name(_69b112ceeb5968f4d7d3392c, 'Steel Sword').
item_type(_69b112ceeb5968f4d7d3392c, weapon).
item_value(_69b112ceeb5968f4d7d3392c, 45).
item_weight(_69b112ceeb5968f4d7d3392c, 3).
item_tradeable(_69b112ceeb5968f4d7d3392c, true).
item(_69b112ceeb5968f4d7d3392d).
item_name(_69b112ceeb5968f4d7d3392d, 'Longbow').
item_type(_69b112ceeb5968f4d7d3392d, weapon).
item_value(_69b112ceeb5968f4d7d3392d, 30).
item_weight(_69b112ceeb5968f4d7d3392d, 2.5).
item_tradeable(_69b112ceeb5968f4d7d3392d, true).
item(_69b112ceeb5968f4d7d3392e).
item_name(_69b112ceeb5968f4d7d3392e, 'Crossbow').
item_type(_69b112ceeb5968f4d7d3392e, weapon).
item_value(_69b112ceeb5968f4d7d3392e, 40).
item_weight(_69b112ceeb5968f4d7d3392e, 4).
item_tradeable(_69b112ceeb5968f4d7d3392e, true).
item(_69b112ceeb5968f4d7d3392f).
item_name(_69b112ceeb5968f4d7d3392f, 'War Hammer').
item_type(_69b112ceeb5968f4d7d3392f, weapon).
item_value(_69b112ceeb5968f4d7d3392f, 35).
item_weight(_69b112ceeb5968f4d7d3392f, 5).
item_tradeable(_69b112ceeb5968f4d7d3392f, true).
item(_69b112ceeb5968f4d7d33930).
item_name(_69b112ceeb5968f4d7d33930, 'Spear').
item_type(_69b112ceeb5968f4d7d33930, weapon).
item_value(_69b112ceeb5968f4d7d33930, 15).
item_weight(_69b112ceeb5968f4d7d33930, 3).
item_tradeable(_69b112ceeb5968f4d7d33930, true).
item(_69b112ceeb5968f4d7d33931).
item_name(_69b112ceeb5968f4d7d33931, 'Staff').
item_type(_69b112ceeb5968f4d7d33931, weapon).
item_value(_69b112ceeb5968f4d7d33931, 12).
item_weight(_69b112ceeb5968f4d7d33931, 2).
item_tradeable(_69b112ceeb5968f4d7d33931, true).
item(_69b112ceeb5968f4d7d33932).
item_name(_69b112ceeb5968f4d7d33932, 'Iron Shield').
item_type(_69b112ceeb5968f4d7d33932, armor).
item_value(_69b112ceeb5968f4d7d33932, 35).
item_weight(_69b112ceeb5968f4d7d33932, 6).
item_tradeable(_69b112ceeb5968f4d7d33932, true).
item(_69b112ceeb5968f4d7d33933).
item_name(_69b112ceeb5968f4d7d33933, 'Leather Armor').
item_type(_69b112ceeb5968f4d7d33933, armor).
item_value(_69b112ceeb5968f4d7d33933, 25).
item_weight(_69b112ceeb5968f4d7d33933, 5).
item_tradeable(_69b112ceeb5968f4d7d33933, true).
item(_69b112ceeb5968f4d7d33934).
item_name(_69b112ceeb5968f4d7d33934, 'Plate Armor').
item_type(_69b112ceeb5968f4d7d33934, armor).
item_value(_69b112ceeb5968f4d7d33934, 80).
item_weight(_69b112ceeb5968f4d7d33934, 15).
item_tradeable(_69b112ceeb5968f4d7d33934, true).
item(_69b112ceeb5968f4d7d33935).
item_name(_69b112ceeb5968f4d7d33935, 'Helmet').
item_type(_69b112ceeb5968f4d7d33935, armor).
item_value(_69b112ceeb5968f4d7d33935, 20).
item_weight(_69b112ceeb5968f4d7d33935, 3).
item_tradeable(_69b112ceeb5968f4d7d33935, true).
item(_69b112cfeb5968f4d7d33936).
item_name(_69b112cfeb5968f4d7d33936, 'Arrow').
item_type(_69b112cfeb5968f4d7d33936, material).
item_value(_69b112cfeb5968f4d7d33936, 1).
item_weight(_69b112cfeb5968f4d7d33936, 0.1).
item_tradeable(_69b112cfeb5968f4d7d33936, true).
item(_69b112cfeb5968f4d7d33937).
item_name(_69b112cfeb5968f4d7d33937, 'Mana Potion').
item_type(_69b112cfeb5968f4d7d33937, consumable).
item_value(_69b112cfeb5968f4d7d33937, 20).
item_weight(_69b112cfeb5968f4d7d33937, 0.5).
item_tradeable(_69b112cfeb5968f4d7d33937, true).
item(_69b112cfeb5968f4d7d33938).
item_name(_69b112cfeb5968f4d7d33938, 'Ale').
item_type(_69b112cfeb5968f4d7d33938, drink).
item_value(_69b112cfeb5968f4d7d33938, 3).
item_weight(_69b112cfeb5968f4d7d33938, 1).
item_tradeable(_69b112cfeb5968f4d7d33938, true).
item(_69b112cfeb5968f4d7d33939).
item_name(_69b112cfeb5968f4d7d33939, 'Wine').
item_type(_69b112cfeb5968f4d7d33939, drink).
item_value(_69b112cfeb5968f4d7d33939, 10).
item_weight(_69b112cfeb5968f4d7d33939, 1.5).
item_tradeable(_69b112cfeb5968f4d7d33939, true).
item(_69b112cfeb5968f4d7d3393a).
item_name(_69b112cfeb5968f4d7d3393a, 'Scroll').
item_type(_69b112cfeb5968f4d7d3393a, collectible).
item_value(_69b112cfeb5968f4d7d3393a, 12).
item_weight(_69b112cfeb5968f4d7d3393a, 0.2).
item_tradeable(_69b112cfeb5968f4d7d3393a, true).
item(_69b11306025a687fc1a10aba).
item_name(_69b11306025a687fc1a10aba, 'Iron Sword').
item_type(_69b11306025a687fc1a10aba, weapon).
item_value(_69b11306025a687fc1a10aba, 25).
item_weight(_69b11306025a687fc1a10aba, 3).
item_tradeable(_69b11306025a687fc1a10aba, true).
item(_69b11306025a687fc1a10abb).
item_name(_69b11306025a687fc1a10abb, 'Dagger').
item_type(_69b11306025a687fc1a10abb, weapon).
item_value(_69b11306025a687fc1a10abb, 10).
item_weight(_69b11306025a687fc1a10abb, 1).
item_tradeable(_69b11306025a687fc1a10abb, true).
item(_69b11306025a687fc1a10abc).
item_name(_69b11306025a687fc1a10abc, 'Wooden Bow').
item_type(_69b11306025a687fc1a10abc, weapon).
item_value(_69b11306025a687fc1a10abc, 18).
item_weight(_69b11306025a687fc1a10abc, 2).
item_tradeable(_69b11306025a687fc1a10abc, true).
item(_69b11306025a687fc1a10abd).
item_name(_69b11306025a687fc1a10abd, 'Wooden Shield').
item_type(_69b11306025a687fc1a10abd, armor).
item_value(_69b11306025a687fc1a10abd, 20).
item_weight(_69b11306025a687fc1a10abd, 4).
item_tradeable(_69b11306025a687fc1a10abd, true).
item(_69b11306025a687fc1a10abe).
item_name(_69b11306025a687fc1a10abe, 'Chainmail Vest').
item_type(_69b11306025a687fc1a10abe, armor).
item_value(_69b11306025a687fc1a10abe, 40).
item_weight(_69b11306025a687fc1a10abe, 8).
item_tradeable(_69b11306025a687fc1a10abe, true).
item(_69b11306025a687fc1a10abf).
item_name(_69b11306025a687fc1a10abf, 'Leather Boots').
item_type(_69b11306025a687fc1a10abf, armor).
item_value(_69b11306025a687fc1a10abf, 12).
item_weight(_69b11306025a687fc1a10abf, 2).
item_tradeable(_69b11306025a687fc1a10abf, true).
item(_69b11306025a687fc1a10ac0).
item_name(_69b11306025a687fc1a10ac0, 'Health Potion').
item_type(_69b11306025a687fc1a10ac0, consumable).
item_value(_69b11306025a687fc1a10ac0, 15).
item_weight(_69b11306025a687fc1a10ac0, 0.5).
item_tradeable(_69b11306025a687fc1a10ac0, true).
item(_69b11306025a687fc1a10ac1).
item_name(_69b11306025a687fc1a10ac1, 'Antidote').
item_type(_69b11306025a687fc1a10ac1, consumable).
item_value(_69b11306025a687fc1a10ac1, 12).
item_weight(_69b11306025a687fc1a10ac1, 0.3).
item_tradeable(_69b11306025a687fc1a10ac1, true).
item(_69b11306025a687fc1a10ac2).
item_name(_69b11306025a687fc1a10ac2, 'Healing Herb').
item_type(_69b11306025a687fc1a10ac2, consumable).
item_value(_69b11306025a687fc1a10ac2, 8).
item_weight(_69b11306025a687fc1a10ac2, 0.2).
item_tradeable(_69b11306025a687fc1a10ac2, true).
item(_69b11306025a687fc1a10ac3).
item_name(_69b11306025a687fc1a10ac3, 'Bread').
item_type(_69b11306025a687fc1a10ac3, food).
item_value(_69b11306025a687fc1a10ac3, 2).
item_weight(_69b11306025a687fc1a10ac3, 0.5).
item_tradeable(_69b11306025a687fc1a10ac3, true).
item(_69b11306025a687fc1a10ac4).
item_name(_69b11306025a687fc1a10ac4, 'Meat Pie').
item_type(_69b11306025a687fc1a10ac4, food).
item_value(_69b11306025a687fc1a10ac4, 5).
item_weight(_69b11306025a687fc1a10ac4, 0.8).
item_tradeable(_69b11306025a687fc1a10ac4, true).
item(_69b11306025a687fc1a10ac5).
item_name(_69b11306025a687fc1a10ac5, 'Water Flask').
item_type(_69b11306025a687fc1a10ac5, drink).
item_value(_69b11306025a687fc1a10ac5, 1).
item_weight(_69b11306025a687fc1a10ac5, 1).
item_tradeable(_69b11306025a687fc1a10ac5, true).
item(_69b11306025a687fc1a10ac6).
item_name(_69b11306025a687fc1a10ac6, 'Torch').
item_type(_69b11306025a687fc1a10ac6, tool).
item_value(_69b11306025a687fc1a10ac6, 3).
item_weight(_69b11306025a687fc1a10ac6, 1).
item_tradeable(_69b11306025a687fc1a10ac6, true).
item(_69b11307025a687fc1a10ac7).
item_name(_69b11307025a687fc1a10ac7, 'Iron Pickaxe').
item_type(_69b11307025a687fc1a10ac7, tool).
item_value(_69b11307025a687fc1a10ac7, 15).
item_weight(_69b11307025a687fc1a10ac7, 5).
item_tradeable(_69b11307025a687fc1a10ac7, true).
item(_69b11307025a687fc1a10ac8).
item_name(_69b11307025a687fc1a10ac8, 'Rope').
item_type(_69b11307025a687fc1a10ac8, tool).
item_value(_69b11307025a687fc1a10ac8, 5).
item_weight(_69b11307025a687fc1a10ac8, 3).
item_tradeable(_69b11307025a687fc1a10ac8, true).
item(_69b11307025a687fc1a10ac9).
item_name(_69b11307025a687fc1a10ac9, 'Oil Lantern').
item_type(_69b11307025a687fc1a10ac9, tool).
item_value(_69b11307025a687fc1a10ac9, 8).
item_weight(_69b11307025a687fc1a10ac9, 2).
item_tradeable(_69b11307025a687fc1a10ac9, true).
item(_69b11307025a687fc1a10aca).
item_name(_69b11307025a687fc1a10aca, 'Golden Goblet').
item_type(_69b11307025a687fc1a10aca, collectible).
item_value(_69b11307025a687fc1a10aca, 50).
item_weight(_69b11307025a687fc1a10aca, 1).
item_tradeable(_69b11307025a687fc1a10aca, true).
item(_69b11307025a687fc1a10acb).
item_name(_69b11307025a687fc1a10acb, 'Jeweled Crown').
item_type(_69b11307025a687fc1a10acb, key).
item_value(_69b11307025a687fc1a10acb, 100).
item_weight(_69b11307025a687fc1a10acb, 1).
item_tradeable(_69b11307025a687fc1a10acb, false).
item(_69b11307025a687fc1a10acc).
item_name(_69b11307025a687fc1a10acc, 'Treasure Chest').
item_type(_69b11307025a687fc1a10acc, collectible).
item_value(_69b11307025a687fc1a10acc, 30).
item_weight(_69b11307025a687fc1a10acc, 5).
item_tradeable(_69b11307025a687fc1a10acc, true).
item(_69b11307025a687fc1a10acd).
item_name(_69b11307025a687fc1a10acd, 'Silver Ring').
item_type(_69b11307025a687fc1a10acd, collectible).
item_value(_69b11307025a687fc1a10acd, 30).
item_weight(_69b11307025a687fc1a10acd, 0.1).
item_tradeable(_69b11307025a687fc1a10acd, true).
item(_69b11307025a687fc1a10ace).
item_name(_69b11307025a687fc1a10ace, 'Gold Amulet').
item_type(_69b11307025a687fc1a10ace, collectible).
item_value(_69b11307025a687fc1a10ace, 50).
item_weight(_69b11307025a687fc1a10ace, 0.2).
item_tradeable(_69b11307025a687fc1a10ace, true).
item(_69b11307025a687fc1a10acf).
item_name(_69b11307025a687fc1a10acf, 'Gemstone').
item_type(_69b11307025a687fc1a10acf, material).
item_value(_69b11307025a687fc1a10acf, 40).
item_weight(_69b11307025a687fc1a10acf, 0.1).
item_tradeable(_69b11307025a687fc1a10acf, true).
item(_69b11307025a687fc1a10ad0).
item_name(_69b11307025a687fc1a10ad0, 'Iron Ore').
item_type(_69b11307025a687fc1a10ad0, material).
item_value(_69b11307025a687fc1a10ad0, 5).
item_weight(_69b11307025a687fc1a10ad0, 3).
item_tradeable(_69b11307025a687fc1a10ad0, true).
item(_69b8cd809089ced33212faad).
item_name(_69b8cd809089ced33212faad, 'Battle Axe').
item_type(_69b8cd809089ced33212faad, weapon).
item_value(_69b8cd809089ced33212faad, 35).
item_weight(_69b8cd809089ced33212faad, 5).
item_tradeable(_69b8cd809089ced33212faad, true).
item(_69b8cd809089ced33212faae).
item_name(_69b8cd809089ced33212faae, 'Mace').
item_type(_69b8cd809089ced33212faae, weapon).
item_value(_69b8cd809089ced33212faae, 28).
item_weight(_69b8cd809089ced33212faae, 4).
item_tradeable(_69b8cd809089ced33212faae, true).
item(_69b8cd809089ced33212faaf).
item_name(_69b8cd809089ced33212faaf, 'Halberd').
item_type(_69b8cd809089ced33212faaf, weapon).
item_value(_69b8cd809089ced33212faaf, 40).
item_weight(_69b8cd809089ced33212faaf, 6).
item_tradeable(_69b8cd809089ced33212faaf, true).
item(_69b8cd809089ced33212fab0).
item_name(_69b8cd809089ced33212fab0, 'Enchanted Ring').
item_type(_69b8cd809089ced33212fab0, collectible).
item_value(_69b8cd809089ced33212fab0, 60).
item_weight(_69b8cd809089ced33212fab0, 0.1).
item_tradeable(_69b8cd809089ced33212fab0, true).
item(_69b8cd809089ced33212fab1).
item_name(_69b8cd809089ced33212fab1, 'Cloak').
item_type(_69b8cd809089ced33212fab1, armor).
item_value(_69b8cd809089ced33212fab1, 12).
item_weight(_69b8cd809089ced33212fab1, 1.5).
item_tradeable(_69b8cd809089ced33212fab1, true).
item(_69b8cd809089ced33212fab2).
item_name(_69b8cd809089ced33212fab2, 'Gauntlets').
item_type(_69b8cd809089ced33212fab2, armor).
item_value(_69b8cd809089ced33212fab2, 18).
item_weight(_69b8cd809089ced33212fab2, 2).
item_tradeable(_69b8cd809089ced33212fab2, true).
item(_69b8cd809089ced33212fab3).
item_name(_69b8cd809089ced33212fab3, 'Holy Water').
item_type(_69b8cd809089ced33212fab3, consumable).
item_value(_69b8cd809089ced33212fab3, 15).
item_weight(_69b8cd809089ced33212fab3, 0.5).
item_tradeable(_69b8cd809089ced33212fab3, true).
item(_69b8cd809089ced33212fab4).
item_name(_69b8cd809089ced33212fab4, 'Elixir of Strength').
item_type(_69b8cd809089ced33212fab4, consumable).
item_value(_69b8cd809089ced33212fab4, 30).
item_weight(_69b8cd809089ced33212fab4, 0.5).
item_tradeable(_69b8cd809089ced33212fab4, true).
item(_69b8cd809089ced33212fab5).
item_name(_69b8cd809089ced33212fab5, 'Dragon Scale').
item_type(_69b8cd809089ced33212fab5, material).
item_value(_69b8cd809089ced33212fab5, 100).
item_weight(_69b8cd809089ced33212fab5, 0.5).
item_tradeable(_69b8cd809089ced33212fab5, true).
item(_69b8cd819089ced33212fab6).
item_name(_69b8cd819089ced33212fab6, 'Quiver').
item_type(_69b8cd819089ced33212fab6, tool).
item_value(_69b8cd819089ced33212fab6, 8).
item_weight(_69b8cd819089ced33212fab6, 1).
item_tradeable(_69b8cd819089ced33212fab6, true).
item(_69b8cd819089ced33212fab7).
item_name(_69b8cd819089ced33212fab7, 'Spell Book').
item_type(_69b8cd819089ced33212fab7, collectible).
item_value(_69b8cd819089ced33212fab7, 50).
item_weight(_69b8cd819089ced33212fab7, 2).
item_tradeable(_69b8cd819089ced33212fab7, true).
item(_69b8cd819089ced33212fab8).
item_name(_69b8cd819089ced33212fab8, 'Crystal Ball').
item_type(_69b8cd819089ced33212fab8, collectible).
item_value(_69b8cd819089ced33212fab8, 75).
item_weight(_69b8cd819089ced33212fab8, 2).
item_tradeable(_69b8cd819089ced33212fab8, true).
item(_69b8cd819089ced33212fab9).
item_name(_69b8cd819089ced33212fab9, 'Candleholder').
item_type(_69b8cd819089ced33212fab9, collectible).
item_value(_69b8cd819089ced33212fab9, 6).
item_weight(_69b8cd819089ced33212fab9, 1).
item_tradeable(_69b8cd819089ced33212fab9, true).
item(_69b8cd819089ced33212faba).
item_name(_69b8cd819089ced33212faba, 'Goblet').
item_type(_69b8cd819089ced33212faba, collectible).
item_value(_69b8cd819089ced33212faba, 8).
item_weight(_69b8cd819089ced33212faba, 0.5).
item_tradeable(_69b8cd819089ced33212faba, true).
item(_69b8cd819089ced33212fabb).
item_name(_69b8cd819089ced33212fabb, 'Stew').
item_type(_69b8cd819089ced33212fabb, food).
item_value(_69b8cd819089ced33212fabb, 5).
item_weight(_69b8cd819089ced33212fabb, 1).
item_tradeable(_69b8cd819089ced33212fabb, true).
item(_69b8cd819089ced33212fabc).
item_name(_69b8cd819089ced33212fabc, 'Roasted Chicken').
item_type(_69b8cd819089ced33212fabc, food).
item_value(_69b8cd819089ced33212fabc, 6).
item_weight(_69b8cd819089ced33212fabc, 1.5).
item_tradeable(_69b8cd819089ced33212fabc, true).
item(_69b8cd819089ced33212fabd).
item_name(_69b8cd819089ced33212fabd, 'Gothic Cabinet').
item_type(_69b8cd819089ced33212fabd, collectible).
item_value(_69b8cd819089ced33212fabd, 25).
item_weight(_69b8cd819089ced33212fabd, 25).
item_tradeable(_69b8cd819089ced33212fabd, true).
item(_69b8cd819089ced33212fabe).
item_name(_69b8cd819089ced33212fabe, 'Commode').
item_type(_69b8cd819089ced33212fabe, collectible).
item_value(_69b8cd819089ced33212fabe, 18).
item_weight(_69b8cd819089ced33212fabe, 18).
item_tradeable(_69b8cd819089ced33212fabe, true).
item(_69b8cd889089ced33212fb2b).
item_name(_69b8cd889089ced33212fb2b, 'Smartphone').
item_type(_69b8cd889089ced33212fb2b, tool).
item_value(_69b8cd889089ced33212fb2b, 30).
item_weight(_69b8cd889089ced33212fb2b, 0.2).
item_tradeable(_69b8cd889089ced33212fb2b, true).
item(_69b8cd889089ced33212fb2c).
item_name(_69b8cd889089ced33212fb2c, 'Backpack').
item_type(_69b8cd889089ced33212fb2c, tool).
item_value(_69b8cd889089ced33212fb2c, 15).
item_weight(_69b8cd889089ced33212fb2c, 1).
item_tradeable(_69b8cd889089ced33212fb2c, true).
item(_69b8cd889089ced33212fb2d).
item_name(_69b8cd889089ced33212fb2d, 'First Aid Kit').
item_type(_69b8cd889089ced33212fb2d, consumable).
item_value(_69b8cd889089ced33212fb2d, 12).
item_weight(_69b8cd889089ced33212fb2d, 1).
item_tradeable(_69b8cd889089ced33212fb2d, true).
item(_69b8cd889089ced33212fb2e).
item_name(_69b8cd889089ced33212fb2e, 'Energy Drink').
item_type(_69b8cd889089ced33212fb2e, drink).
item_value(_69b8cd889089ced33212fb2e, 3).
item_weight(_69b8cd889089ced33212fb2e, 0.5).
item_tradeable(_69b8cd889089ced33212fb2e, true).
item(_69b8cd889089ced33212fb2f).
item_name(_69b8cd889089ced33212fb2f, 'Coffee').
item_type(_69b8cd889089ced33212fb2f, drink).
item_value(_69b8cd889089ced33212fb2f, 3).
item_weight(_69b8cd889089ced33212fb2f, 0.3).
item_tradeable(_69b8cd889089ced33212fb2f, true).
item(_69b8cd889089ced33212fb30).
item_name(_69b8cd889089ced33212fb30, 'Sandwich').
item_type(_69b8cd889089ced33212fb30, food).
item_value(_69b8cd889089ced33212fb30, 4).
item_weight(_69b8cd889089ced33212fb30, 0.3).
item_tradeable(_69b8cd889089ced33212fb30, true).
item(_69b8cd889089ced33212fb31).
item_name(_69b8cd889089ced33212fb31, 'Pizza Slice').
item_type(_69b8cd889089ced33212fb31, food).
item_value(_69b8cd889089ced33212fb31, 3).
item_weight(_69b8cd889089ced33212fb31, 0.3).
item_tradeable(_69b8cd889089ced33212fb31, true).
item(_69b8cd889089ced33212fb32).
item_name(_69b8cd889089ced33212fb32, 'Notebook').
item_type(_69b8cd889089ced33212fb32, collectible).
item_value(_69b8cd889089ced33212fb32, 2).
item_weight(_69b8cd889089ced33212fb32, 0.3).
item_tradeable(_69b8cd889089ced33212fb32, true).
item(_69b8cd899089ced33212fb33).
item_name(_69b8cd899089ced33212fb33, 'Wallet').
item_type(_69b8cd899089ced33212fb33, collectible).
item_value(_69b8cd899089ced33212fb33, 15).
item_weight(_69b8cd899089ced33212fb33, 0.2).
item_tradeable(_69b8cd899089ced33212fb33, true).
item(_69b8cd899089ced33212fb34).
item_name(_69b8cd899089ced33212fb34, 'Umbrella').
item_type(_69b8cd899089ced33212fb34, tool).
item_value(_69b8cd899089ced33212fb34, 5).
item_weight(_69b8cd899089ced33212fb34, 0.5).
item_tradeable(_69b8cd899089ced33212fb34, true).
item(_69b8cd899089ced33212fb35).
item_name(_69b8cd899089ced33212fb35, 'Flashlight').
item_type(_69b8cd899089ced33212fb35, tool).
item_value(_69b8cd899089ced33212fb35, 8).
item_weight(_69b8cd899089ced33212fb35, 0.5).
item_tradeable(_69b8cd899089ced33212fb35, true).
item(_69b8cd899089ced33212fb36).
item_name(_69b8cd899089ced33212fb36, 'Sunglasses').
item_type(_69b8cd899089ced33212fb36, collectible).
item_value(_69b8cd899089ced33212fb36, 10).
item_weight(_69b8cd899089ced33212fb36, 0.1).
item_tradeable(_69b8cd899089ced33212fb36, true).
item(_69b8cd899089ced33212fb37).
item_name(_69b8cd899089ced33212fb37, 'Headphones').
item_type(_69b8cd899089ced33212fb37, collectible).
item_value(_69b8cd899089ced33212fb37, 15).
item_weight(_69b8cd899089ced33212fb37, 0.3).
item_tradeable(_69b8cd899089ced33212fb37, true).
item(_69b8cd899089ced33212fb38).
item_name(_69b8cd899089ced33212fb38, 'USB Drive').
item_type(_69b8cd899089ced33212fb38, key).
item_value(_69b8cd899089ced33212fb38, 5).
item_weight(_69b8cd899089ced33212fb38, 0.05).
item_tradeable(_69b8cd899089ced33212fb38, true).
item(_69b8cd899089ced33212fb39).
item_name(_69b8cd899089ced33212fb39, 'Battery').
item_type(_69b8cd899089ced33212fb39, material).
item_value(_69b8cd899089ced33212fb39, 5).
item_weight(_69b8cd899089ced33212fb39, 0.3).
item_tradeable(_69b8cd899089ced33212fb39, true).
item(_69b8cd859089ced33212fb00).
item_name(_69b8cd859089ced33212fb00, 'Pipe Wrench').
item_type(_69b8cd859089ced33212fb00, weapon).
item_value(_69b8cd859089ced33212fb00, 8).
item_weight(_69b8cd859089ced33212fb00, 3).
item_tradeable(_69b8cd859089ced33212fb00, true).
item(_69b8cd859089ced33212fb01).
item_name(_69b8cd859089ced33212fb01, 'Makeshift Rifle').
item_type(_69b8cd859089ced33212fb01, weapon).
item_value(_69b8cd859089ced33212fb01, 25).
item_weight(_69b8cd859089ced33212fb01, 4).
item_tradeable(_69b8cd859089ced33212fb01, true).
item(_69b8cd859089ced33212fb02).
item_name(_69b8cd859089ced33212fb02, 'Spiked Bat').
item_type(_69b8cd859089ced33212fb02, weapon).
item_value(_69b8cd859089ced33212fb02, 12).
item_weight(_69b8cd859089ced33212fb02, 3).
item_tradeable(_69b8cd859089ced33212fb02, true).
item(_69b8cd859089ced33212fb03).
item_name(_69b8cd859089ced33212fb03, 'Scrap Armor').
item_type(_69b8cd859089ced33212fb03, armor).
item_value(_69b8cd859089ced33212fb03, 15).
item_weight(_69b8cd859089ced33212fb03, 6).
item_tradeable(_69b8cd859089ced33212fb03, true).
item(_69b8cd859089ced33212fb04).
item_name(_69b8cd859089ced33212fb04, 'Gas Mask').
item_type(_69b8cd859089ced33212fb04, armor).
item_value(_69b8cd859089ced33212fb04, 20).
item_weight(_69b8cd859089ced33212fb04, 1).
item_tradeable(_69b8cd859089ced33212fb04, true).
item(_69b8cd869089ced33212fb05).
item_name(_69b8cd869089ced33212fb05, 'Canned Food').
item_type(_69b8cd869089ced33212fb05, food).
item_value(_69b8cd869089ced33212fb05, 5).
item_weight(_69b8cd869089ced33212fb05, 0.5).
item_tradeable(_69b8cd869089ced33212fb05, true).
item(_69b8cd869089ced33212fb06).
item_name(_69b8cd869089ced33212fb06, 'Purified Water').
item_type(_69b8cd869089ced33212fb06, drink).
item_value(_69b8cd869089ced33212fb06, 8).
item_weight(_69b8cd869089ced33212fb06, 1).
item_tradeable(_69b8cd869089ced33212fb06, true).
item(_69b8cd869089ced33212fb07).
item_name(_69b8cd869089ced33212fb07, 'Rad-Away').
item_type(_69b8cd869089ced33212fb07, consumable).
item_value(_69b8cd869089ced33212fb07, 15).
item_weight(_69b8cd869089ced33212fb07, 0.5).
item_tradeable(_69b8cd869089ced33212fb07, true).
item(_69b8cd869089ced33212fb08).
item_name(_69b8cd869089ced33212fb08, 'Duct Tape').
item_type(_69b8cd869089ced33212fb08, material).
item_value(_69b8cd869089ced33212fb08, 3).
item_weight(_69b8cd869089ced33212fb08, 0.3).
item_tradeable(_69b8cd869089ced33212fb08, true).
item(_69b8cd869089ced33212fb09).
item_name(_69b8cd869089ced33212fb09, 'Fuel Can').
item_type(_69b8cd869089ced33212fb09, material).
item_value(_69b8cd869089ced33212fb09, 20).
item_weight(_69b8cd869089ced33212fb09, 4).
item_tradeable(_69b8cd869089ced33212fb09, true).
item(_69b8cd869089ced33212fb0a).
item_name(_69b8cd869089ced33212fb0a, 'Survival Axe').
item_type(_69b8cd869089ced33212fb0a, tool).
item_value(_69b8cd869089ced33212fb0a, 12).
item_weight(_69b8cd869089ced33212fb0a, 3).
item_tradeable(_69b8cd869089ced33212fb0a, true).
item(_69b8cd869089ced33212fb0b).
item_name(_69b8cd869089ced33212fb0b, 'Geiger Counter').
item_type(_69b8cd869089ced33212fb0b, tool).
item_value(_69b8cd869089ced33212fb0b, 30).
item_weight(_69b8cd869089ced33212fb0b, 1).
item_tradeable(_69b8cd869089ced33212fb0b, true).
item(_69b8cd869089ced33212fb0c).
item_name(_69b8cd869089ced33212fb0c, 'Barrel Stove').
item_type(_69b8cd869089ced33212fb0c, collectible).
item_value(_69b8cd869089ced33212fb0c, 5).
item_weight(_69b8cd869089ced33212fb0c, 20).
item_tradeable(_69b8cd869089ced33212fb0c, true).
item(_69b11308025a687fc1a10adc).
item_name(_69b11308025a687fc1a10adc, 'Plasma Pistol').
item_type(_69b11308025a687fc1a10adc, weapon).
item_value(_69b11308025a687fc1a10adc, 30).
item_weight(_69b11308025a687fc1a10adc, 2).
item_tradeable(_69b11308025a687fc1a10adc, true).
item(_69b11308025a687fc1a10add).
item_name(_69b11308025a687fc1a10add, 'Energy Cell').
item_type(_69b11308025a687fc1a10add, material).
item_value(_69b11308025a687fc1a10add, 8).
item_weight(_69b11308025a687fc1a10add, 0.5).
item_tradeable(_69b11308025a687fc1a10add, true).
item(_69b11308025a687fc1a10ade).
item_name(_69b11308025a687fc1a10ade, 'Emergency Ration').
item_type(_69b11308025a687fc1a10ade, food).
item_value(_69b11308025a687fc1a10ade, 5).
item_weight(_69b11308025a687fc1a10ade, 0.5).
item_tradeable(_69b11308025a687fc1a10ade, true).
item(_69b11308025a687fc1a10adf).
item_name(_69b11308025a687fc1a10adf, 'Oxygen Tank').
item_type(_69b11308025a687fc1a10adf, consumable).
item_value(_69b11308025a687fc1a10adf, 12).
item_weight(_69b11308025a687fc1a10adf, 3).
item_tradeable(_69b11308025a687fc1a10adf, true).
item(_69b11308025a687fc1a10ae0).
item_name(_69b11308025a687fc1a10ae0, 'Repair Kit').
item_type(_69b11308025a687fc1a10ae0, tool).
item_value(_69b11308025a687fc1a10ae0, 20).
item_weight(_69b11308025a687fc1a10ae0, 2).
item_tradeable(_69b11308025a687fc1a10ae0, true).
item(_69b11308025a687fc1a10ae1).
item_name(_69b11308025a687fc1a10ae1, 'Medi-Gel').
item_type(_69b11308025a687fc1a10ae1, consumable).
item_value(_69b11308025a687fc1a10ae1, 18).
item_weight(_69b11308025a687fc1a10ae1, 0.3).
item_tradeable(_69b11308025a687fc1a10ae1, true).
item(_69b11308025a687fc1a10ae2).
item_name(_69b11308025a687fc1a10ae2, 'Star Map Fragment').
item_type(_69b11308025a687fc1a10ae2, key).
item_value(_69b11308025a687fc1a10ae2, 60).
item_weight(_69b11308025a687fc1a10ae2, 0.1).
item_tradeable(_69b11308025a687fc1a10ae2, false).
item(_69b8cd829089ced33212facf).
item_name(_69b8cd829089ced33212facf, 'Laser Rifle').
item_type(_69b8cd829089ced33212facf, weapon).
item_value(_69b8cd829089ced33212facf, 60).
item_weight(_69b8cd829089ced33212facf, 4).
item_tradeable(_69b8cd829089ced33212facf, true).
item(_69b8cd829089ced33212fad0).
item_name(_69b8cd829089ced33212fad0, 'Stun Baton').
item_type(_69b8cd829089ced33212fad0, weapon).
item_value(_69b8cd829089ced33212fad0, 20).
item_weight(_69b8cd829089ced33212fad0, 1.5).
item_tradeable(_69b8cd829089ced33212fad0, true).
item(_69b8cd829089ced33212fad1).
item_name(_69b8cd829089ced33212fad1, 'Photon Blade').
item_type(_69b8cd829089ced33212fad1, weapon).
item_value(_69b8cd829089ced33212fad1, 90).
item_weight(_69b8cd829089ced33212fad1, 1).
item_tradeable(_69b8cd829089ced33212fad1, true).
item(_69b8cd829089ced33212fad2).
item_name(_69b8cd829089ced33212fad2, 'EVA Suit').
item_type(_69b8cd829089ced33212fad2, armor).
item_value(_69b8cd829089ced33212fad2, 80).
item_weight(_69b8cd829089ced33212fad2, 8).
item_tradeable(_69b8cd829089ced33212fad2, true).
item(_69b8cd829089ced33212fad3).
item_name(_69b8cd829089ced33212fad3, 'Shield Generator').
item_type(_69b8cd829089ced33212fad3, armor).
item_value(_69b8cd829089ced33212fad3, 70).
item_weight(_69b8cd829089ced33212fad3, 2).
item_tradeable(_69b8cd829089ced33212fad3, true).
item(_69b8cd829089ced33212fad4).
item_name(_69b8cd829089ced33212fad4, 'Bio-Gel Pack').
item_type(_69b8cd829089ced33212fad4, consumable).
item_value(_69b8cd829089ced33212fad4, 25).
item_weight(_69b8cd829089ced33212fad4, 0.5).
item_tradeable(_69b8cd829089ced33212fad4, true).
item(_69b8cd829089ced33212fad5).
item_name(_69b8cd829089ced33212fad5, 'Stim Injector').
item_type(_69b8cd829089ced33212fad5, consumable).
item_value(_69b8cd829089ced33212fad5, 18).
item_weight(_69b8cd829089ced33212fad5, 0.2).
item_tradeable(_69b8cd829089ced33212fad5, true).
item(_69b8cd839089ced33212fad6).
item_name(_69b8cd839089ced33212fad6, 'Nutrient Paste').
item_type(_69b8cd839089ced33212fad6, food).
item_value(_69b8cd839089ced33212fad6, 4).
item_weight(_69b8cd839089ced33212fad6, 0.3).
item_tradeable(_69b8cd839089ced33212fad6, true).
item(_69b8cd839089ced33212fad7).
item_name(_69b8cd839089ced33212fad7, 'Protein Bar').
item_type(_69b8cd839089ced33212fad7, food).
item_value(_69b8cd839089ced33212fad7, 3).
item_weight(_69b8cd839089ced33212fad7, 0.2).
item_tradeable(_69b8cd839089ced33212fad7, true).
item(_69b8cd839089ced33212fad8).
item_name(_69b8cd839089ced33212fad8, 'Data Crystal').
item_type(_69b8cd839089ced33212fad8, key).
item_value(_69b8cd839089ced33212fad8, 30).
item_weight(_69b8cd839089ced33212fad8, 0.1).
item_tradeable(_69b8cd839089ced33212fad8, true).
item(_69b8cd839089ced33212fad9).
item_name(_69b8cd839089ced33212fad9, 'Access Keycard').
item_type(_69b8cd839089ced33212fad9, key).
item_value(_69b8cd839089ced33212fad9, 15).
item_weight(_69b8cd839089ced33212fad9, 0.05).
item_tradeable(_69b8cd839089ced33212fad9, false).
item(_69b8cd839089ced33212fada).
item_name(_69b8cd839089ced33212fada, 'Titanium Alloy').
item_type(_69b8cd839089ced33212fada, material).
item_value(_69b8cd839089ced33212fada, 20).
item_weight(_69b8cd839089ced33212fada, 2).
item_tradeable(_69b8cd839089ced33212fada, true).
item(_69b8cd839089ced33212fadb).
item_name(_69b8cd839089ced33212fadb, 'Quantum Chip').
item_type(_69b8cd839089ced33212fadb, material).
item_value(_69b8cd839089ced33212fadb, 50).
item_weight(_69b8cd839089ced33212fadb, 0.1).
item_tradeable(_69b8cd839089ced33212fadb, true).
item(_69b8cd839089ced33212fadc).
item_name(_69b8cd839089ced33212fadc, 'Scanner').
item_type(_69b8cd839089ced33212fadc, tool).
item_value(_69b8cd839089ced33212fadc, 25).
item_weight(_69b8cd839089ced33212fadc, 0.5).
item_tradeable(_69b8cd839089ced33212fadc, true).
item(_69b8cd839089ced33212fadd).
item_name(_69b8cd839089ced33212fadd, 'Multi-Tool').
item_type(_69b8cd839089ced33212fadd, tool).
item_value(_69b8cd839089ced33212fadd, 15).
item_weight(_69b8cd839089ced33212fadd, 1).
item_tradeable(_69b8cd839089ced33212fadd, true).
item(_69b8cd879089ced33212fb1b).
item_name(_69b8cd879089ced33212fb1b, 'Steam Pistol').
item_type(_69b8cd879089ced33212fb1b, weapon).
item_value(_69b8cd879089ced33212fb1b, 35).
item_weight(_69b8cd879089ced33212fb1b, 2).
item_tradeable(_69b8cd879089ced33212fb1b, true).
item(_69b8cd879089ced33212fb1c).
item_name(_69b8cd879089ced33212fb1c, 'Clockwork Sword').
item_type(_69b8cd879089ced33212fb1c, weapon).
item_value(_69b8cd879089ced33212fb1c, 55).
item_weight(_69b8cd879089ced33212fb1c, 3).
item_tradeable(_69b8cd879089ced33212fb1c, true).
item(_69b8cd879089ced33212fb1d).
item_name(_69b8cd879089ced33212fb1d, 'Aether Goggles').
item_type(_69b8cd879089ced33212fb1d, armor).
item_value(_69b8cd879089ced33212fb1d, 25).
item_weight(_69b8cd879089ced33212fb1d, 0.5).
item_tradeable(_69b8cd879089ced33212fb1d, true).
item(_69b8cd879089ced33212fb1e).
item_name(_69b8cd879089ced33212fb1e, 'Reinforced Corset').
item_type(_69b8cd879089ced33212fb1e, armor).
item_value(_69b8cd879089ced33212fb1e, 30).
item_weight(_69b8cd879089ced33212fb1e, 3).
item_tradeable(_69b8cd879089ced33212fb1e, true).
item(_69b8cd879089ced33212fb1f).
item_name(_69b8cd879089ced33212fb1f, 'Clockwork Key').
item_type(_69b8cd879089ced33212fb1f, key).
item_value(_69b8cd879089ced33212fb1f, 15).
item_weight(_69b8cd879089ced33212fb1f, 0.3).
item_tradeable(_69b8cd879089ced33212fb1f, true).
item(_69b8cd879089ced33212fb20).
item_name(_69b8cd879089ced33212fb20, 'Gear Set').
item_type(_69b8cd879089ced33212fb20, material).
item_value(_69b8cd879089ced33212fb20, 5).
item_weight(_69b8cd879089ced33212fb20, 1).
item_tradeable(_69b8cd879089ced33212fb20, true).
item(_69b8cd879089ced33212fb21).
item_name(_69b8cd879089ced33212fb21, 'Steam Core').
item_type(_69b8cd879089ced33212fb21, material).
item_value(_69b8cd879089ced33212fb21, 20).
item_weight(_69b8cd879089ced33212fb21, 3).
item_tradeable(_69b8cd879089ced33212fb21, true).
item(_69b8cd879089ced33212fb22).
item_name(_69b8cd879089ced33212fb22, 'Tea').
item_type(_69b8cd879089ced33212fb22, drink).
item_value(_69b8cd879089ced33212fb22, 5).
item_weight(_69b8cd879089ced33212fb22, 0.3).
item_tradeable(_69b8cd879089ced33212fb22, true).
item(_69b8cd889089ced33212fb23).
item_name(_69b8cd889089ced33212fb23, 'Scone').
item_type(_69b8cd889089ced33212fb23, food).
item_value(_69b8cd889089ced33212fb23, 3).
item_weight(_69b8cd889089ced33212fb23, 0.2).
item_tradeable(_69b8cd889089ced33212fb23, true).
item(_69b8cd889089ced33212fb24).
item_name(_69b8cd889089ced33212fb24, 'Blowtorch').
item_type(_69b8cd889089ced33212fb24, tool).
item_value(_69b8cd889089ced33212fb24, 12).
item_weight(_69b8cd889089ced33212fb24, 2).
item_tradeable(_69b8cd889089ced33212fb24, true).
item(_69b8cd889089ced33212fb25).
item_name(_69b8cd889089ced33212fb25, 'Pocket Chronometer').
item_type(_69b8cd889089ced33212fb25, collectible).
item_value(_69b8cd889089ced33212fb25, 30).
item_weight(_69b8cd889089ced33212fb25, 0.3).
item_tradeable(_69b8cd889089ced33212fb25, true).
item(_69b8cd889089ced33212fb26).
item_name(_69b8cd889089ced33212fb26, 'Monocle').
item_type(_69b8cd889089ced33212fb26, collectible).
item_value(_69b8cd889089ced33212fb26, 15).
item_weight(_69b8cd889089ced33212fb26, 0.1).
item_tradeable(_69b8cd889089ced33212fb26, true).
item(_69b8cd889089ced33212fb27).
item_name(_69b8cd889089ced33212fb27, 'Oil Lamp').
item_type(_69b8cd889089ced33212fb27, tool).
item_value(_69b8cd889089ced33212fb27, 8).
item_weight(_69b8cd889089ced33212fb27, 1).
item_tradeable(_69b8cd889089ced33212fb27, true).
item(_69b8cd889089ced33212fb28).
item_name(_69b8cd889089ced33212fb28, 'Tea Set').
item_type(_69b8cd889089ced33212fb28, collectible).
item_value(_69b8cd889089ced33212fb28, 20).
item_weight(_69b8cd889089ced33212fb28, 2).
item_tradeable(_69b8cd889089ced33212fb28, true).
item(_69b8cd889089ced33212fb29).
item_name(_69b8cd889089ced33212fb29, 'Grandfather Clock').
item_type(_69b8cd889089ced33212fb29, collectible).
item_value(_69b8cd889089ced33212fb29, 40).
item_weight(_69b8cd889089ced33212fb29, 30).
item_tradeable(_69b8cd889089ced33212fb29, true).
item(_69b8cd889089ced33212fb2a).
item_name(_69b8cd889089ced33212fb2a, 'Filing Cabinet').
item_type(_69b8cd889089ced33212fb2a, collectible).
item_value(_69b8cd889089ced33212fb2a, 15).
item_weight(_69b8cd889089ced33212fb2a, 15).
item_tradeable(_69b8cd889089ced33212fb2a, true).
item(_69b8cd869089ced33212fb0d).
item_name(_69b8cd869089ced33212fb0d, 'Cutlass').
item_type(_69b8cd869089ced33212fb0d, weapon).
item_value(_69b8cd869089ced33212fb0d, 25).
item_weight(_69b8cd869089ced33212fb0d, 2.5).
item_tradeable(_69b8cd869089ced33212fb0d, true).
item(_69b8cd869089ced33212fb0e).
item_name(_69b8cd869089ced33212fb0e, 'Flintlock Pistol').
item_type(_69b8cd869089ced33212fb0e, weapon).
item_value(_69b8cd869089ced33212fb0e, 30).
item_weight(_69b8cd869089ced33212fb0e, 1.5).
item_tradeable(_69b8cd869089ced33212fb0e, true).
item(_69b8cd869089ced33212fb0f).
item_name(_69b8cd869089ced33212fb0f, 'Boarding Axe').
item_type(_69b8cd869089ced33212fb0f, weapon).
item_value(_69b8cd869089ced33212fb0f, 15).
item_weight(_69b8cd869089ced33212fb0f, 2).
item_tradeable(_69b8cd869089ced33212fb0f, true).
item(_69b8cd869089ced33212fb10).
item_name(_69b8cd869089ced33212fb10, 'Pirate Hat').
item_type(_69b8cd869089ced33212fb10, armor).
item_value(_69b8cd869089ced33212fb10, 12).
item_weight(_69b8cd869089ced33212fb10, 0.5).
item_tradeable(_69b8cd869089ced33212fb10, true).
item(_69b8cd869089ced33212fb11).
item_name(_69b8cd869089ced33212fb11, 'Rum').
item_type(_69b8cd869089ced33212fb11, drink).
item_value(_69b8cd869089ced33212fb11, 8).
item_weight(_69b8cd869089ced33212fb11, 1.5).
item_tradeable(_69b8cd869089ced33212fb11, true).
item(_69b8cd869089ced33212fb12).
item_name(_69b8cd869089ced33212fb12, 'Coconut').
item_type(_69b8cd869089ced33212fb12, food).
item_value(_69b8cd869089ced33212fb12, 2).
item_weight(_69b8cd869089ced33212fb12, 1).
item_tradeable(_69b8cd869089ced33212fb12, true).
item(_69b8cd879089ced33212fb13).
item_name(_69b8cd879089ced33212fb13, 'Banana').
item_type(_69b8cd879089ced33212fb13, food).
item_value(_69b8cd879089ced33212fb13, 1).
item_weight(_69b8cd879089ced33212fb13, 0.2).
item_tradeable(_69b8cd879089ced33212fb13, true).
item(_69b8cd879089ced33212fb14).
item_name(_69b8cd879089ced33212fb14, 'Treasure Map').
item_type(_69b8cd879089ced33212fb14, quest).
item_value(_69b8cd879089ced33212fb14, 50).
item_weight(_69b8cd879089ced33212fb14, 0.1).
item_tradeable(_69b8cd879089ced33212fb14, false).
item(_69b8cd879089ced33212fb15).
item_name(_69b8cd879089ced33212fb15, 'Gold Doubloon').
item_type(_69b8cd879089ced33212fb15, collectible).
item_value(_69b8cd879089ced33212fb15, 20).
item_weight(_69b8cd879089ced33212fb15, 0.1).
item_tradeable(_69b8cd879089ced33212fb15, true).
item(_69b8cd879089ced33212fb16).
item_name(_69b8cd879089ced33212fb16, 'Pearl').
item_type(_69b8cd879089ced33212fb16, collectible).
item_value(_69b8cd879089ced33212fb16, 25).
item_weight(_69b8cd879089ced33212fb16, 0.1).
item_tradeable(_69b8cd879089ced33212fb16, true).
item(_69b8cd879089ced33212fb17).
item_name(_69b8cd879089ced33212fb17, 'Spyglass').
item_type(_69b8cd879089ced33212fb17, tool).
item_value(_69b8cd879089ced33212fb17, 20).
item_weight(_69b8cd879089ced33212fb17, 1).
item_tradeable(_69b8cd879089ced33212fb17, true).
item(_69b8cd879089ced33212fb18).
item_name(_69b8cd879089ced33212fb18, 'Compass').
item_type(_69b8cd879089ced33212fb18, tool).
item_value(_69b8cd879089ced33212fb18, 15).
item_weight(_69b8cd879089ced33212fb18, 0.3).
item_tradeable(_69b8cd879089ced33212fb18, true).
item(_69b8cd879089ced33212fb19).
item_name(_69b8cd879089ced33212fb19, 'Fishing Net').
item_type(_69b8cd879089ced33212fb19, tool).
item_value(_69b8cd879089ced33212fb19, 8).
item_weight(_69b8cd879089ced33212fb19, 3).
item_tradeable(_69b8cd879089ced33212fb19, true).
item(_69b8cd879089ced33212fb1a).
item_name(_69b8cd879089ced33212fb1a, 'Pirate Lantern').
item_type(_69b8cd879089ced33212fb1a, tool).
item_value(_69b8cd879089ced33212fb1a, 10).
item_weight(_69b8cd879089ced33212fb1a, 1.5).
item_tradeable(_69b8cd879089ced33212fb1a, true).
item(_69b11308025a687fc1a10ae3).
item_name(_69b11308025a687fc1a10ae3, 'Revolver').
item_type(_69b11308025a687fc1a10ae3, weapon).
item_value(_69b11308025a687fc1a10ae3, 25).
item_weight(_69b11308025a687fc1a10ae3, 2).
item_tradeable(_69b11308025a687fc1a10ae3, true).
item(_69b11308025a687fc1a10ae4).
item_name(_69b11308025a687fc1a10ae4, 'Lasso').
item_type(_69b11308025a687fc1a10ae4, tool).
item_value(_69b11308025a687fc1a10ae4, 8).
item_weight(_69b11308025a687fc1a10ae4, 2).
item_tradeable(_69b11308025a687fc1a10ae4, true).
item(_69b11308025a687fc1a10ae5).
item_name(_69b11308025a687fc1a10ae5, 'Whiskey').
item_type(_69b11308025a687fc1a10ae5, drink).
item_value(_69b11308025a687fc1a10ae5, 5).
item_weight(_69b11308025a687fc1a10ae5, 1).
item_tradeable(_69b11308025a687fc1a10ae5, true).
item(_69b11309025a687fc1a10ae6).
item_name(_69b11309025a687fc1a10ae6, 'Dynamite').
item_type(_69b11309025a687fc1a10ae6, weapon).
item_value(_69b11309025a687fc1a10ae6, 15).
item_weight(_69b11309025a687fc1a10ae6, 1).
item_tradeable(_69b11309025a687fc1a10ae6, true).
item(_69b11309025a687fc1a10ae7).
item_name(_69b11309025a687fc1a10ae7, 'Wanted Poster').
item_type(_69b11309025a687fc1a10ae7, quest).
item_weight(_69b11309025a687fc1a10ae7, 0.1).
item_tradeable(_69b11309025a687fc1a10ae7, false).
item(_69b11309025a687fc1a10ae8).
item_name(_69b11309025a687fc1a10ae8, 'Bandage').
item_type(_69b11309025a687fc1a10ae8, consumable).
item_value(_69b11309025a687fc1a10ae8, 5).
item_weight(_69b11309025a687fc1a10ae8, 0.2).
item_tradeable(_69b11309025a687fc1a10ae8, true).
item(_69b8cd839089ced33212fade).
item_name(_69b8cd839089ced33212fade, 'Rifle').
item_type(_69b8cd839089ced33212fade, weapon).
item_value(_69b8cd839089ced33212fade, 40).
item_weight(_69b8cd839089ced33212fade, 4).
item_tradeable(_69b8cd839089ced33212fade, true).
item(_69b8cd839089ced33212fadf).
item_name(_69b8cd839089ced33212fadf, 'Shotgun').
item_type(_69b8cd839089ced33212fadf, weapon).
item_value(_69b8cd839089ced33212fadf, 50).
item_weight(_69b8cd839089ced33212fadf, 5).
item_tradeable(_69b8cd839089ced33212fadf, true).
item(_69b8cd839089ced33212fae0).
item_name(_69b8cd839089ced33212fae0, 'Bowie Knife').
item_type(_69b8cd839089ced33212fae0, weapon).
item_value(_69b8cd839089ced33212fae0, 15).
item_weight(_69b8cd839089ced33212fae0, 1).
item_tradeable(_69b8cd839089ced33212fae0, true).
item(_69b8cd839089ced33212fae1).
item_name(_69b8cd839089ced33212fae1, 'Leather Duster').
item_type(_69b8cd839089ced33212fae1, armor).
item_value(_69b8cd839089ced33212fae1, 20).
item_weight(_69b8cd839089ced33212fae1, 3).
item_tradeable(_69b8cd839089ced33212fae1, true).
item(_69b8cd839089ced33212fae2).
item_name(_69b8cd839089ced33212fae2, 'Cowboy Hat').
item_type(_69b8cd839089ced33212fae2, armor).
item_value(_69b8cd839089ced33212fae2, 10).
item_weight(_69b8cd839089ced33212fae2, 0.5).
item_tradeable(_69b8cd839089ced33212fae2, true).
item(_69b8cd839089ced33212fae3).
item_name(_69b8cd839089ced33212fae3, 'Bullets').
item_type(_69b8cd839089ced33212fae3, material).
item_value(_69b8cd839089ced33212fae3, 5).
item_weight(_69b8cd839089ced33212fae3, 0.5).
item_tradeable(_69b8cd839089ced33212fae3, true).
item(_69b8cd839089ced33212fae4).
item_name(_69b8cd839089ced33212fae4, 'Moonshine').
item_type(_69b8cd839089ced33212fae4, drink).
item_value(_69b8cd839089ced33212fae4, 8).
item_weight(_69b8cd839089ced33212fae4, 1).
item_tradeable(_69b8cd839089ced33212fae4, true).
item(_69b8cd849089ced33212fae5).
item_name(_69b8cd849089ced33212fae5, 'Beef Jerky').
item_type(_69b8cd849089ced33212fae5, food).
item_value(_69b8cd849089ced33212fae5, 3).
item_weight(_69b8cd849089ced33212fae5, 0.3).
item_tradeable(_69b8cd849089ced33212fae5, true).
item(_69b8cd849089ced33212fae6).
item_name(_69b8cd849089ced33212fae6, 'Canned Beans').
item_type(_69b8cd849089ced33212fae6, food).
item_value(_69b8cd849089ced33212fae6, 2).
item_weight(_69b8cd849089ced33212fae6, 0.5).
item_tradeable(_69b8cd849089ced33212fae6, true).
item(_69b8cd849089ced33212fae7).
item_name(_69b8cd849089ced33212fae7, 'Pocket Watch').
item_type(_69b8cd849089ced33212fae7, collectible).
item_value(_69b8cd849089ced33212fae7, 20).
item_weight(_69b8cd849089ced33212fae7, 0.2).
item_tradeable(_69b8cd849089ced33212fae7, true).
item(_69b8cd849089ced33212fae8).
item_name(_69b8cd849089ced33212fae8, 'Harmonica').
item_type(_69b8cd849089ced33212fae8, collectible).
item_value(_69b8cd849089ced33212fae8, 5).
item_weight(_69b8cd849089ced33212fae8, 0.2).
item_tradeable(_69b8cd849089ced33212fae8, true).
item(_69b8cd849089ced33212fae9).
item_name(_69b8cd849089ced33212fae9, 'Gold Nugget').
item_type(_69b8cd849089ced33212fae9, material).
item_value(_69b8cd849089ced33212fae9, 30).
item_weight(_69b8cd849089ced33212fae9, 0.3).
item_tradeable(_69b8cd849089ced33212fae9, true).
item(_69b8cd849089ced33212faea).
item_name(_69b8cd849089ced33212faea, 'Tobacco Pouch').
item_type(_69b8cd849089ced33212faea, consumable).
item_value(_69b8cd849089ced33212faea, 3).
item_weight(_69b8cd849089ced33212faea, 0.3).
item_tradeable(_69b8cd849089ced33212faea, true).
item(_69b8cd849089ced33212faeb).
item_name(_69b8cd849089ced33212faeb, 'Lantern').
item_type(_69b8cd849089ced33212faeb, tool).
item_value(_69b8cd849089ced33212faeb, 8).
item_weight(_69b8cd849089ced33212faeb, 1.5).
item_tradeable(_69b8cd849089ced33212faeb, true).
item(_69b8cd849089ced33212faec).
item_name(_69b8cd849089ced33212faec, 'Axe').
item_type(_69b8cd849089ced33212faec, tool).
item_value(_69b8cd849089ced33212faec, 10).
item_weight(_69b8cd849089ced33212faec, 3).
item_tradeable(_69b8cd849089ced33212faec, true).
item(_69b8cd849089ced33212faed).
item_name(_69b8cd849089ced33212faed, 'Saddle').
item_type(_69b8cd849089ced33212faed, tool).
item_value(_69b8cd849089ced33212faed, 25).
item_weight(_69b8cd849089ced33212faed, 8).
item_tradeable(_69b8cd849089ced33212faed, true).
item(_69b8cd849089ced33212faee).
item_name(_69b8cd849089ced33212faee, 'Bar Stool').
item_type(_69b8cd849089ced33212faee, collectible).
item_value(_69b8cd849089ced33212faee, 6).
item_weight(_69b8cd849089ced33212faee, 4).
item_tradeable(_69b8cd849089ced33212faee, true).
item(_69b8cd849089ced33212faef).
item_name(_69b8cd849089ced33212faef, 'Rocking Chair').
item_type(_69b8cd849089ced33212faef, collectible).
item_value(_69b8cd849089ced33212faef, 12).
item_weight(_69b8cd849089ced33212faef, 8).
item_tradeable(_69b8cd849089ced33212faef, true).
item(_69b8cd849089ced33212faf0).
item_name(_69b8cd849089ced33212faf0, 'Cash Register').
item_type(_69b8cd849089ced33212faf0, collectible).
item_value(_69b8cd849089ced33212faf0, 30).
item_weight(_69b8cd849089ced33212faf0, 15).
item_tradeable(_69b8cd849089ced33212faf0, true).

% === Language Facts ===
language(_69bfc965b7a6c8040746a6e7).
language_name(_69bfc965b7a6c8040746a6e7, 'French').

% === Quests ===
% Quest: Explore the Neighborhood
% Get familiar with the area by visiting a key location.
% Type: navigation / Difficulty: beginner

quest(explore_the_neighborhood, 'Explore the Neighborhood', navigation, beginner, available).
quest_assigned_to(explore_the_neighborhood, 'Player').
quest_language(explore_the_neighborhood, french).
quest_tag(explore_the_neighborhood, seed).
quest_tag(explore_the_neighborhood, objective_type_visit_location).
quest_tag(explore_the_neighborhood, category_navigation).

quest_objective(explore_the_neighborhood, 0, visit_location('Abbeville-((sur-))river')).



quest_reward(explore_the_neighborhood, experience, 15).
quest_reward(explore_the_neighborhood, xp, 15).
quest_reward(explore_the_neighborhood, fluency, 3).

% Can Player take this quest?
quest_available(Player, explore_the_neighborhood) :-
    quest(explore_the_neighborhood, _, _, _, active).

% Quest: Grand Tour
% Visit three different locations to get a feel for the area.
% Type: exploration / Difficulty: intermediate

quest(grand_tour, 'Grand Tour', exploration, intermediate, available).
quest_assigned_to(grand_tour, 'Player').
quest_language(grand_tour, french).
quest_tag(grand_tour, seed).
quest_tag(grand_tour, objective_type_visit_location).
quest_tag(grand_tour, category_exploration).
quest_tag(grand_tour, multi_step).

quest_objective(grand_tour, 0, visit_location('Abbeville-((sur-))river')).



quest_reward(grand_tour, experience, 30).
quest_reward(grand_tour, xp, 30).
quest_reward(grand_tour, fluency, 6).

% Can Player take this quest?
quest_available(Player, grand_tour) :-
    quest(grand_tour, _, _, _, active).

% Quest: Uncharted Territory
% Discover a new location you have not visited before.
% Type: exploration / Difficulty: beginner

quest(uncharted_territory, 'Uncharted Territory', exploration, beginner, available).
quest_assigned_to(uncharted_territory, 'Player').
quest_language(uncharted_territory, french).
quest_tag(uncharted_territory, seed).
quest_tag(uncharted_territory, objective_type_discover_location).
quest_tag(uncharted_territory, category_exploration).

quest_objective(uncharted_territory, 0, discover_location('Abbeville-((sur-))river')).



quest_reward(uncharted_territory, experience, 20).
quest_reward(uncharted_territory, xp, 20).
quest_reward(uncharted_territory, fluency, 4).

% Can Player take this quest?
quest_available(Player, uncharted_territory) :-
    quest(uncharted_territory, _, _, _, active).

% Quest: Introduce Yourself
% Meet a local resident and introduce yourself.
% Type: conversation / Difficulty: beginner

quest(introduce_yourself, 'Introduce Yourself', conversation, beginner, available).
quest_assigned_to(introduce_yourself, 'Player').
quest_language(introduce_yourself, french).
quest_tag(introduce_yourself, seed).
quest_tag(introduce_yourself, objective_type_talk_to_npc).
quest_tag(introduce_yourself, category_conversation).

quest_objective(introduce_yourself, 0, talk_to('', 1)).



quest_reward(introduce_yourself, experience, 10).
quest_reward(introduce_yourself, xp, 10).
quest_reward(introduce_yourself, fluency, 2).

% Can Player take this quest?
quest_available(Player, introduce_yourself) :-
    quest(introduce_yourself, _, _, _, active).

% Quest: Meet the Locals
% Introduce yourself to three different people in the area.
% Type: social / Difficulty: beginner

quest(meet_the_locals, 'Meet the Locals', social, beginner, available).
quest_assigned_to(meet_the_locals, 'Player').
quest_language(meet_the_locals, french).
quest_tag(meet_the_locals, seed).
quest_tag(meet_the_locals, objective_type_talk_to_npc).
quest_tag(meet_the_locals, category_social).
quest_tag(meet_the_locals, multi_npc).

quest_objective(meet_the_locals, 0, talk_to('', 1)).



quest_reward(meet_the_locals, experience, 20).
quest_reward(meet_the_locals, xp, 20).
quest_reward(meet_the_locals, fluency, 4).

% Can Player take this quest?
quest_available(Player, meet_the_locals) :-
    quest(meet_the_locals, _, _, _, active).

% Quest: A Good Chat
% Have a meaningful conversation with an NPC — keep talking for several turns.
% Type: conversation / Difficulty: beginner

quest(a_good_chat, 'A Good Chat', conversation, beginner, available).
quest_assigned_to(a_good_chat, 'Player').
quest_language(a_good_chat, french).
quest_tag(a_good_chat, seed).
quest_tag(a_good_chat, objective_type_complete_conversation).
quest_tag(a_good_chat, category_conversation).

quest_objective(a_good_chat, 0, conversation_turns(3)).



quest_reward(a_good_chat, experience, 20).
quest_reward(a_good_chat, xp, 20).
quest_reward(a_good_chat, fluency, 4).

% Can Player take this quest?
quest_available(Player, a_good_chat) :-
    quest(a_good_chat, _, _, _, active).

% Quest: Deep Conversation
% Have an extended conversation of at least 6 turns with a single NPC.
% Type: conversation / Difficulty: intermediate

quest(deep_conversation, 'Deep Conversation', conversation, intermediate, available).
quest_assigned_to(deep_conversation, 'Player').
quest_language(deep_conversation, french).
quest_tag(deep_conversation, seed).
quest_tag(deep_conversation, objective_type_complete_conversation).
quest_tag(deep_conversation, category_conversation).

quest_objective(deep_conversation, 0, conversation_turns(6)).



quest_reward(deep_conversation, experience, 35).
quest_reward(deep_conversation, xp, 35).
quest_reward(deep_conversation, fluency, 7).

% Can Player take this quest?
quest_available(Player, deep_conversation) :-
    quest(deep_conversation, _, _, _, active).

% Quest: First Impressions
% Introduce yourself to an NPC using the target language.
% Type: conversation / Difficulty: beginner

quest(first_impressions, 'First Impressions', conversation, beginner, available).
quest_assigned_to(first_impressions, 'Player').
quest_language(first_impressions, french).
quest_tag(first_impressions, seed).
quest_tag(first_impressions, objective_type_introduce_self).
quest_tag(first_impressions, category_conversation).

quest_objective(first_impressions, 0, objective('Introduce yourself in French')).



quest_reward(first_impressions, experience, 15).
quest_reward(first_impressions, xp, 15).
quest_reward(first_impressions, fluency, 3).

% Can Player take this quest?
quest_available(Player, first_impressions) :-
    quest(first_impressions, _, _, _, active).

% Quest: Making Friends
% Build a friendship with a local by having several conversations.
% Type: social / Difficulty: beginner

quest(making_friends, 'Making Friends', social, beginner, available).
quest_assigned_to(making_friends, 'Player').
quest_language(making_friends, french).
quest_tag(making_friends, seed).
quest_tag(making_friends, objective_type_build_friendship).
quest_tag(making_friends, category_social).

quest_objective(making_friends, 0, objective('Have 3 conversations with a local to build a friendship')).



quest_reward(making_friends, experience, 25).
quest_reward(making_friends, xp, 25).
quest_reward(making_friends, fluency, 5).

% Can Player take this quest?
quest_available(Player, making_friends) :-
    quest(making_friends, _, _, _, active).

% SKIPPED: quest 69bfc966b7a6c8040746a701 "A Thoughtful Gift" — syntax error (unbalanced parens)
% SKIPPED: quest 69bfc966b7a6c8040746a703 "Earn Their Trust" — syntax error (unbalanced parens)
% Quest: Words in Action
% Use target-language words during a conversation.
% Type: vocabulary / Difficulty: beginner

quest(words_in_action, 'Words in Action', vocabulary, beginner, available).
quest_assigned_to(words_in_action, 'Player').
quest_language(words_in_action, french).
quest_tag(words_in_action, seed).
quest_tag(words_in_action, objective_type_use_vocabulary).
quest_tag(words_in_action, category_vocabulary).

quest_objective(words_in_action, 0, learn_words_count(3)).



quest_reward(words_in_action, experience, 20).
quest_reward(words_in_action, xp, 20).
quest_reward(words_in_action, fluency, 4).

% Can Player take this quest?
quest_available(Player, words_in_action) :-
    quest(words_in_action, _, _, _, active).

% Quest: Vocabulary Immersion
% Use many target-language words across multiple conversations.
% Type: vocabulary / Difficulty: intermediate

quest(vocabulary_immersion, 'Vocabulary Immersion', vocabulary, intermediate, available).
quest_assigned_to(vocabulary_immersion, 'Player').
quest_language(vocabulary_immersion, french).
quest_tag(vocabulary_immersion, seed).
quest_tag(vocabulary_immersion, objective_type_use_vocabulary).
quest_tag(vocabulary_immersion, category_vocabulary).

quest_objective(vocabulary_immersion, 0, learn_words_count(10)).



quest_reward(vocabulary_immersion, experience, 35).
quest_reward(vocabulary_immersion, xp, 35).
quest_reward(vocabulary_immersion, fluency, 7).

% Can Player take this quest?
quest_available(Player, vocabulary_immersion) :-
    quest(vocabulary_immersion, _, _, _, active).

% Quest: Word Collector
% Walk around and collect vocabulary words from labeled objects in the world.
% Type: vocabulary / Difficulty: beginner

quest(word_collector, 'Word Collector', vocabulary, beginner, available).
quest_assigned_to(word_collector, 'Player').
quest_language(word_collector, french).
quest_tag(word_collector, seed).
quest_tag(word_collector, objective_type_collect_vocabulary).
quest_tag(word_collector, category_vocabulary).

quest_objective(word_collector, 0, objective('Collect 3 vocabulary words by approaching labeled objects')).



quest_reward(word_collector, experience, 20).
quest_reward(word_collector, xp, 20).
quest_reward(word_collector, fluency, 4).

% Can Player take this quest?
quest_available(Player, word_collector) :-
    quest(word_collector, _, _, _, active).

% Quest: Word Hoarder
% Collect a large number of vocabulary words from the world around you.
% Type: vocabulary / Difficulty: intermediate

quest(word_hoarder, 'Word Hoarder', vocabulary, intermediate, available).
quest_assigned_to(word_hoarder, 'Player').
quest_language(word_hoarder, french).
quest_tag(word_hoarder, seed).
quest_tag(word_hoarder, objective_type_collect_vocabulary).
quest_tag(word_hoarder, category_vocabulary).

quest_objective(word_hoarder, 0, objective('Collect 8 vocabulary words from the world')).



quest_reward(word_hoarder, experience, 35).
quest_reward(word_hoarder, xp, 35).
quest_reward(word_hoarder, fluency, 7).

% Can Player take this quest?
quest_available(Player, word_hoarder) :-
    quest(word_hoarder, _, _, _, active).

% Quest: Name That Thing
% Click on objects in the world and type their name in the target language.
% Type: visual_vocabulary / Difficulty: beginner

quest(name_that_thing, 'Name That Thing', visual_vocabulary, beginner, available).
quest_assigned_to(name_that_thing, 'Player').
quest_language(name_that_thing, french).
quest_tag(name_that_thing, seed).
quest_tag(name_that_thing, objective_type_identify_object).
quest_tag(name_that_thing, category_visual_vocabulary).

quest_objective(name_that_thing, 0, objective('Correctly identify 3 objects by their French name')).



quest_reward(name_that_thing, experience, 20).
quest_reward(name_that_thing, xp, 20).
quest_reward(name_that_thing, fluency, 4).

% Can Player take this quest?
quest_available(Player, name_that_thing) :-
    quest(name_that_thing, _, _, _, active).

% Quest: Curious Observer
% Examine objects in the world to learn their names in the target language.
% Type: vocabulary / Difficulty: beginner

quest(curious_observer, 'Curious Observer', vocabulary, beginner, available).
quest_assigned_to(curious_observer, 'Player').
quest_language(curious_observer, french).
quest_tag(curious_observer, seed).
quest_tag(curious_observer, objective_type_examine_object).
quest_tag(curious_observer, category_vocabulary).

quest_objective(curious_observer, 0, objective('Examine 3 objects to learn their French names')).



quest_reward(curious_observer, experience, 15).
quest_reward(curious_observer, xp, 15).
quest_reward(curious_observer, fluency, 3).

% Can Player take this quest?
quest_available(Player, curious_observer) :-
    quest(curious_observer, _, _, _, active).

% Quest: Point and Say
% Click on objects and name them in the target language to practice vocabulary.
% Type: visual_vocabulary / Difficulty: beginner

quest(point_and_say, 'Point and Say', visual_vocabulary, beginner, available).
quest_assigned_to(point_and_say, 'Player').
quest_language(point_and_say, french).
quest_tag(point_and_say, seed).
quest_tag(point_and_say, objective_type_point_and_name).
quest_tag(point_and_say, category_visual_vocabulary).

quest_objective(point_and_say, 0, objective('Point at 5 objects and name them in French')).



quest_reward(point_and_say, experience, 20).
quest_reward(point_and_say, xp, 20).
quest_reward(point_and_say, fluency, 4).

% Can Player take this quest?
quest_available(Player, point_and_say) :-
    quest(point_and_say, _, _, _, active).

% Quest: Reading Around Town
% Read signs, menus, and other text written in the target language.
% Type: vocabulary / Difficulty: beginner

quest(reading_around_town, 'Reading Around Town', vocabulary, beginner, available).
quest_assigned_to(reading_around_town, 'Player').
quest_language(reading_around_town, french).
quest_tag(reading_around_town, seed).
quest_tag(reading_around_town, objective_type_read_sign).
quest_tag(reading_around_town, category_vocabulary).

quest_objective(reading_around_town, 0, objective('Read 3 signs or texts written in French')).



quest_reward(reading_around_town, experience, 15).
quest_reward(reading_around_town, xp, 15).
quest_reward(reading_around_town, fluency, 3).

% Can Player take this quest?
quest_available(Player, reading_around_town) :-
    quest(reading_around_town, _, _, _, active).

% Quest: Grammar in Practice
% Use correct grammar patterns during conversations with NPCs.
% Type: grammar / Difficulty: intermediate

quest(grammar_in_practice, 'Grammar in Practice', grammar, intermediate, available).
quest_assigned_to(grammar_in_practice, 'Player').
quest_language(grammar_in_practice, french).
quest_tag(grammar_in_practice, seed).
quest_tag(grammar_in_practice, objective_type_use_vocabulary).
quest_tag(grammar_in_practice, category_grammar).
quest_tag(grammar_in_practice, grammar).

quest_objective(grammar_in_practice, 0, conversation_turns(3)).
quest_objective(grammar_in_practice, 1, learn_words_count(5)).



quest_reward(grammar_in_practice, experience, 30).
quest_reward(grammar_in_practice, xp, 30).
quest_reward(grammar_in_practice, fluency, 6).

% Can Player take this quest?
quest_available(Player, grammar_in_practice) :-
    quest(grammar_in_practice, _, _, _, active).

% Quest: Written Word
% Practice writing in the target language by composing responses to prompts.
% Type: grammar / Difficulty: intermediate

quest(written_word, 'Written Word', grammar, intermediate, available).
quest_assigned_to(written_word, 'Player').
quest_language(written_word, french).
quest_tag(written_word, seed).
quest_tag(written_word, objective_type_write_response).
quest_tag(written_word, category_grammar).

quest_objective(written_word, 0, objective('Write 2 responses in French')).



quest_reward(written_word, experience, 30).
quest_reward(written_word, xp, 30).
quest_reward(written_word, fluency, 6).

% Can Player take this quest?
quest_available(Player, written_word) :-
    quest(written_word, _, _, _, active).

% Quest: Picture This
% Describe what you see around you using the target language.
% Type: grammar / Difficulty: intermediate

quest(picture_this, 'Picture This', grammar, intermediate, available).
quest_assigned_to(picture_this, 'Player').
quest_language(picture_this, french).
quest_tag(picture_this, seed).
quest_tag(picture_this, objective_type_describe_scene).
quest_tag(picture_this, category_grammar).

quest_objective(picture_this, 0, objective('Describe 2 scenes in French')).



quest_reward(picture_this, experience, 25).
quest_reward(picture_this, xp, 25).
quest_reward(picture_this, fluency, 5).

% Can Player take this quest?
quest_available(Player, picture_this) :-
    quest(picture_this, _, _, _, active).

% Quest: Story Time
% Listen to an NPC tell a story and answer comprehension questions.
% Type: listening_comprehension / Difficulty: intermediate

quest(story_time, 'Story Time', listening_comprehension, intermediate, available).
quest_assigned_to(story_time, 'Player').
quest_language(story_time, french).
quest_tag(story_time, seed).
quest_tag(story_time, objective_type_listening_comprehension).
quest_tag(story_time, category_listening_comprehension).

quest_objective(story_time, 0, objective('Listen to a story and answer 2 questions correctly')).



quest_reward(story_time, experience, 35).
quest_reward(story_time, xp, 35).
quest_reward(story_time, fluency, 7).

% Can Player take this quest?
quest_available(Player, story_time) :-
    quest(story_time, _, _, _, active).

% Quest: Parrot Practice
% Listen to an NPC speak and repeat what they say to practice pronunciation.
% Type: listening_comprehension / Difficulty: beginner

quest(parrot_practice, 'Parrot Practice', listening_comprehension, beginner, available).
quest_assigned_to(parrot_practice, 'Player').
quest_language(parrot_practice, french).
quest_tag(parrot_practice, seed).
quest_tag(parrot_practice, objective_type_listen_and_repeat).
quest_tag(parrot_practice, category_listening_comprehension).

quest_objective(parrot_practice, 0, objective('Listen and repeat 3 phrases from an NPC')).



quest_reward(parrot_practice, experience, 20).
quest_reward(parrot_practice, xp, 20).
quest_reward(parrot_practice, fluency, 4).

% Can Player take this quest?
quest_available(Player, parrot_practice) :-
    quest(parrot_practice, _, _, _, active).

% Quest: Echo Challenge
% Repeat back longer phrases from NPCs to improve your listening and speaking.
% Type: listening_comprehension / Difficulty: intermediate

quest(echo_challenge, 'Echo Challenge', listening_comprehension, intermediate, available).
quest_assigned_to(echo_challenge, 'Player').
quest_language(echo_challenge, french).
quest_tag(echo_challenge, seed).
quest_tag(echo_challenge, objective_type_listen_and_repeat).
quest_tag(echo_challenge, category_listening_comprehension).

quest_objective(echo_challenge, 0, objective('Listen and repeat 6 phrases from NPCs')).



quest_reward(echo_challenge, experience, 30).
quest_reward(echo_challenge, xp, 30).
quest_reward(echo_challenge, fluency, 6).

% Can Player take this quest?
quest_available(Player, echo_challenge) :-
    quest(echo_challenge, _, _, _, active).

% Quest: Lost in Translation
% Translate phrases between English and the target language.
% Type: translation_challenge / Difficulty: intermediate

quest(lost_in_translation, 'Lost in Translation', translation_challenge, intermediate, available).
quest_assigned_to(lost_in_translation, 'Player').
quest_language(lost_in_translation, french).
quest_tag(lost_in_translation, seed).
quest_tag(lost_in_translation, objective_type_translation_challenge).
quest_tag(lost_in_translation, category_translation_challenge).

quest_objective(lost_in_translation, 0, objective('Correctly translate 3 French phrases')).



quest_reward(lost_in_translation, experience, 30).
quest_reward(lost_in_translation, xp, 30).
quest_reward(lost_in_translation, fluency, 6).

% Can Player take this quest?
quest_available(Player, lost_in_translation) :-
    quest(lost_in_translation, _, _, _, active).

% Quest: Master Translator
% Translate many phrases accurately to prove your language skills.
% Type: translation_challenge / Difficulty: advanced

quest(master_translator, 'Master Translator', translation_challenge, advanced, available).
quest_assigned_to(master_translator, 'Player').
quest_language(master_translator, french).
quest_tag(master_translator, seed).
quest_tag(master_translator, objective_type_translation_challenge).
quest_tag(master_translator, category_translation_challenge).

quest_objective(master_translator, 0, objective('Correctly translate 8 French phrases')).



quest_reward(master_translator, experience, 45).
quest_reward(master_translator, xp, 45).
quest_reward(master_translator, fluency, 9).

% Can Player take this quest?
quest_available(Player, master_translator) :-
    quest(master_translator, _, _, _, active).

% Quest: Say It Right
% Pronounce phrases in the target language and get accuracy feedback.
% Type: pronunciation / Difficulty: intermediate

quest(say_it_right, 'Say It Right', pronunciation, intermediate, available).
quest_assigned_to(say_it_right, 'Player').
quest_language(say_it_right, french).
quest_tag(say_it_right, seed).
quest_tag(say_it_right, objective_type_pronunciation_check).
quest_tag(say_it_right, category_pronunciation).

quest_objective(say_it_right, 0, objective('Pronounce 3 French phrases with good accuracy')).



quest_reward(say_it_right, experience, 30).
quest_reward(say_it_right, xp, 30).
quest_reward(say_it_right, fluency, 6).

% Can Player take this quest?
quest_available(Player, say_it_right) :-
    quest(say_it_right, _, _, _, active).

% Quest: Fluency Drill
% Pronounce many phrases to build confidence and accuracy.
% Type: pronunciation / Difficulty: advanced

quest(fluency_drill, 'Fluency Drill', pronunciation, advanced, available).
quest_assigned_to(fluency_drill, 'Player').
quest_language(fluency_drill, french).
quest_tag(fluency_drill, seed).
quest_tag(fluency_drill, objective_type_pronunciation_check).
quest_tag(fluency_drill, category_pronunciation).

quest_objective(fluency_drill, 0, objective('Pronounce 8 French phrases accurately')).



quest_reward(fluency_drill, experience, 40).
quest_reward(fluency_drill, xp, 40).
quest_reward(fluency_drill, fluency, 8).

% Can Player take this quest?
quest_available(Player, fluency_drill) :-
    quest(fluency_drill, _, _, _, active).

% Quest: Follow the Signs
% Follow directions given in the target language to reach your destination.
% Type: navigation / Difficulty: advanced

quest(follow_the_signs, 'Follow the Signs', navigation, advanced, available).
quest_assigned_to(follow_the_signs, 'Player').
quest_language(follow_the_signs, french).
quest_tag(follow_the_signs, seed).
quest_tag(follow_the_signs, objective_type_navigate_language).
quest_tag(follow_the_signs, category_navigation).

quest_objective(follow_the_signs, 0, objective('Follow French directions to reach Abbeville-((sur-))river')).



quest_reward(follow_the_signs, experience, 40).
quest_reward(follow_the_signs, xp, 40).
quest_reward(follow_the_signs, fluency, 8).

% Can Player take this quest?
quest_available(Player, follow_the_signs) :-
    quest(follow_the_signs, _, _, _, active).

% Quest: Direction Master
% An NPC gives you directions in the target language. Follow them step by step.
% Type: follow_instructions / Difficulty: intermediate

quest(direction_master, 'Direction Master', follow_instructions, intermediate, available).
quest_assigned_to(direction_master, 'Player').
quest_language(direction_master, french).
quest_tag(direction_master, seed).
quest_tag(direction_master, objective_type_follow_directions).
quest_tag(direction_master, category_follow_instructions).

quest_objective(direction_master, 0, objective('Follow 1 steps of French directions')).



quest_reward(direction_master, experience, 30).
quest_reward(direction_master, xp, 30).
quest_reward(direction_master, fluency, 6).

% Can Player take this quest?
quest_available(Player, direction_master) :-
    quest(direction_master, _, _, _, active).

% Quest: Which Way?
% Ask NPCs for directions using the target language.
% Type: navigation / Difficulty: beginner

quest(which_way, 'Which Way?', navigation, beginner, available).
quest_assigned_to(which_way, 'Player').
quest_language(which_way, french).
quest_tag(which_way, seed).
quest_tag(which_way, objective_type_ask_for_directions).
quest_tag(which_way, category_navigation).

quest_objective(which_way, 0, objective('Ask an NPC for directions in French')).



quest_reward(which_way, experience, 20).
quest_reward(which_way, xp, 20).
quest_reward(which_way, fluency, 4).

% Can Player take this quest?
quest_available(Player, which_way) :-
    quest(which_way, _, _, _, active).

% Quest: Cultural Exchange
% Talk to locals to learn about the customs and culture of the area.
% Type: cultural / Difficulty: beginner

quest(cultural_exchange, 'Cultural Exchange', cultural, beginner, available).
quest_assigned_to(cultural_exchange, 'Player').
quest_language(cultural_exchange, french).
quest_tag(cultural_exchange, seed).
quest_tag(cultural_exchange, objective_type_talk_to_npc).
quest_tag(cultural_exchange, category_cultural).
quest_tag(cultural_exchange, cultural).

quest_objective(cultural_exchange, 0, talk_to('', 1)).



quest_reward(cultural_exchange, experience, 20).
quest_reward(cultural_exchange, xp, 20).
quest_reward(cultural_exchange, fluency, 4).

% Can Player take this quest?
quest_available(Player, cultural_exchange) :-
    quest(cultural_exchange, _, _, _, active).

% Quest: Cultural Landmarks
% Visit important cultural locations and examine what you find there.
% Type: cultural / Difficulty: intermediate

quest(cultural_landmarks, 'Cultural Landmarks', cultural, intermediate, available).
quest_assigned_to(cultural_landmarks, 'Player').
quest_language(cultural_landmarks, french).
quest_tag(cultural_landmarks, seed).
quest_tag(cultural_landmarks, objective_type_visit_location).
quest_tag(cultural_landmarks, category_cultural).
quest_tag(cultural_landmarks, cultural).

quest_objective(cultural_landmarks, 0, visit_location('Abbeville-((sur-))river')).
quest_objective(cultural_landmarks, 1, objective('Examine a cultural object at one of the locations')).



quest_reward(cultural_landmarks, experience, 30).
quest_reward(cultural_landmarks, xp, 30).
quest_reward(cultural_landmarks, fluency, 6).

% Can Player take this quest?
quest_available(Player, cultural_landmarks) :-
    quest(cultural_landmarks, _, _, _, active).

% Quest: Scavenger Hunt: Basics
% Find and identify objects around town by their target-language names.
% Type: scavenger_hunt / Difficulty: beginner

quest(scavenger_hunt_basics, 'Scavenger Hunt: Basics', scavenger_hunt, beginner, available).
quest_assigned_to(scavenger_hunt_basics, 'Player').
quest_language(scavenger_hunt_basics, french).
quest_tag(scavenger_hunt_basics, seed).
quest_tag(scavenger_hunt_basics, objective_type_identify_object).
quest_tag(scavenger_hunt_basics, category_scavenger_hunt).

quest_objective(scavenger_hunt_basics, 0, objective('Identify 3 objects by their French name')).
quest_objective(scavenger_hunt_basics, 1, objective('Collect 2 new vocabulary words along the way')).



quest_reward(scavenger_hunt_basics, experience, 25).
quest_reward(scavenger_hunt_basics, xp, 25).
quest_reward(scavenger_hunt_basics, fluency, 5).

% Can Player take this quest?
quest_available(Player, scavenger_hunt_basics) :-
    quest(scavenger_hunt_basics, _, _, _, active).

% SKIPPED: quest 69bfc967b7a6c8040746a735 "Scavenger Hunt: Collector" — syntax error (unbalanced parens)
% Quest: Scavenger Hunt: Expert
% Find, identify, and name many objects in the target language — a comprehensive vocabulary challenge.
% Type: scavenger_hunt / Difficulty: advanced

quest(scavenger_hunt_expert, 'Scavenger Hunt: Expert', scavenger_hunt, advanced, available).
quest_assigned_to(scavenger_hunt_expert, 'Player').
quest_language(scavenger_hunt_expert, french).
quest_tag(scavenger_hunt_expert, seed).
quest_tag(scavenger_hunt_expert, objective_type_identify_object).
quest_tag(scavenger_hunt_expert, category_scavenger_hunt).

quest_objective(scavenger_hunt_expert, 0, objective('Identify 6 objects by their French name')).
quest_objective(scavenger_hunt_expert, 1, objective('Point and name 4 additional objects')).
quest_objective(scavenger_hunt_expert, 2, objective('Collect 5 vocabulary words')).



quest_reward(scavenger_hunt_expert, experience, 50).
quest_reward(scavenger_hunt_expert, xp, 50).
quest_reward(scavenger_hunt_expert, fluency, 10).

% Can Player take this quest?
quest_available(Player, scavenger_hunt_expert) :-
    quest(scavenger_hunt_expert, _, _, _, active).

% Quest: Tell Your Story
% Practice narrative skills by having a long conversation where you tell a story about yourself.
% Type: storytelling / Difficulty: intermediate

quest(tell_your_story, 'Tell Your Story', storytelling, intermediate, available).
quest_assigned_to(tell_your_story, 'Player').
quest_language(tell_your_story, french).
quest_tag(tell_your_story, seed).
quest_tag(tell_your_story, objective_type_complete_conversation).
quest_tag(tell_your_story, category_storytelling).
quest_tag(tell_your_story, storytelling).
quest_tag(tell_your_story, narrative).

quest_objective(tell_your_story, 0, conversation_turns(5)).



quest_reward(tell_your_story, experience, 35).
quest_reward(tell_your_story, xp, 35).
quest_reward(tell_your_story, fluency, 7).

% Can Player take this quest?
quest_available(Player, tell_your_story) :-
    quest(tell_your_story, _, _, _, active).

% Quest: Campfire Tales
% Listen to a local tell a story, then retell it in your own words to someone else.
% Type: storytelling / Difficulty: advanced

quest(campfire_tales, 'Campfire Tales', storytelling, advanced, available).
quest_assigned_to(campfire_tales, 'Player').
quest_language(campfire_tales, french).
quest_tag(campfire_tales, seed).
quest_tag(campfire_tales, objective_type_complete_conversation).
quest_tag(campfire_tales, category_storytelling).
quest_tag(campfire_tales, storytelling).
quest_tag(campfire_tales, listening).

quest_objective(campfire_tales, 0, objective('Listen to an NPC tell a story and repeat key phrases')).
quest_objective(campfire_tales, 1, conversation_turns(5)).



quest_reward(campfire_tales, experience, 45).
quest_reward(campfire_tales, xp, 45).
quest_reward(campfire_tales, fluency, 9).

% Can Player take this quest?
quest_available(Player, campfire_tales) :-
    quest(campfire_tales, _, _, _, active).

% Quest: Lunch Order
% Order food or drinks at a local establishment using the target language.
% Type: conversation / Difficulty: beginner

quest(lunch_order, 'Lunch Order', conversation, beginner, available).
quest_assigned_to(lunch_order, 'Player').
quest_language(lunch_order, french).
quest_tag(lunch_order, seed).
quest_tag(lunch_order, objective_type_order_food).
quest_tag(lunch_order, category_conversation).
quest_tag(lunch_order, commerce).
quest_tag(lunch_order, daily_life).

quest_objective(lunch_order, 0, objective('Order food in French')).



quest_reward(lunch_order, experience, 20).
quest_reward(lunch_order, xp, 20).
quest_reward(lunch_order, fluency, 4).

% Can Player take this quest?
quest_available(Player, lunch_order) :-
    quest(lunch_order, _, _, _, active).

% Quest: Bargain Hunter
% Negotiate a price with a merchant using the target language.
% Type: conversation / Difficulty: intermediate

quest(bargain_hunter, 'Bargain Hunter', conversation, intermediate, available).
quest_assigned_to(bargain_hunter, 'Player').
quest_language(bargain_hunter, french).
quest_tag(bargain_hunter, seed).
quest_tag(bargain_hunter, objective_type_haggle_price).
quest_tag(bargain_hunter, category_conversation).
quest_tag(bargain_hunter, commerce).

quest_objective(bargain_hunter, 0, objective('Negotiate a price in French')).



quest_reward(bargain_hunter, experience, 30).
quest_reward(bargain_hunter, xp, 30).
quest_reward(bargain_hunter, fluency, 6).

% Can Player take this quest?
quest_available(Player, bargain_hunter) :-
    quest(bargain_hunter, _, _, _, active).

% Quest: Dinner Party
% Order a full meal — appetizer, main course, and drink — using only the target language.
% Type: conversation / Difficulty: intermediate

quest(dinner_party, 'Dinner Party', conversation, intermediate, available).
quest_assigned_to(dinner_party, 'Player').
quest_language(dinner_party, french).
quest_tag(dinner_party, seed).
quest_tag(dinner_party, objective_type_order_food).
quest_tag(dinner_party, category_conversation).
quest_tag(dinner_party, commerce).
quest_tag(dinner_party, daily_life).

quest_objective(dinner_party, 0, objective('Order food in French')).
quest_objective(dinner_party, 1, learn_words_count(3)).



quest_reward(dinner_party, experience, 35).
quest_reward(dinner_party, xp, 35).
quest_reward(dinner_party, fluency, 7).

% Can Player take this quest?
quest_available(Player, dinner_party) :-
    quest(dinner_party, _, _, _, active).

% SKIPPED: quest 69bfc967b7a6c8040746a743 "Gather Supplies" — syntax error (unbalanced parens)
% SKIPPED: quest 69bfc967b7a6c8040746a745 "Special Delivery" — syntax error (unbalanced parens)
% SKIPPED: quest 69bfc967b7a6c8040746a747 "First Craft" — syntax error (unbalanced parens)
% Quest: Prove Your Mettle
% Defeat an enemy in combat.
% Type: combat / Difficulty: intermediate

quest(prove_your_mettle, 'Prove Your Mettle', combat, intermediate, available).
quest_assigned_to(prove_your_mettle, 'Player').
quest_language(prove_your_mettle, french).
quest_tag(prove_your_mettle, seed).
quest_tag(prove_your_mettle, objective_type_defeat_enemies).
quest_tag(prove_your_mettle, category_combat).

quest_objective(prove_your_mettle, 0, defeat('', 1)).



quest_reward(prove_your_mettle, experience, 30).
quest_reward(prove_your_mettle, xp, 30).
quest_reward(prove_your_mettle, fluency, 6).

% Can Player take this quest?
quest_available(Player, prove_your_mettle) :-
    quest(prove_your_mettle, _, _, _, active).

% Quest: Safe Passage
% Escort an NPC safely to their destination.
% Type: escort / Difficulty: intermediate

quest(safe_passage, 'Safe Passage', escort, intermediate, available).
quest_assigned_to(safe_passage, 'Player').
quest_language(safe_passage, french).
quest_tag(safe_passage, seed).
quest_tag(safe_passage, objective_type_escort_npc).
quest_tag(safe_passage, category_escort).

quest_objective(safe_passage, 0, escort('', '')).



quest_reward(safe_passage, experience, 35).
quest_reward(safe_passage, xp, 35).
quest_reward(safe_passage, fluency, 7).

% Can Player take this quest?
quest_available(Player, safe_passage) :-
    quest(safe_passage, _, _, _, active).

% SKIPPED: quest 69bfc967b7a6c8040746a74d "Newcomer's Welcome" — syntax error (unbalanced parens)
% Quest: The Full Experience
% Visit a location, have a conversation, use vocabulary, and identify an object — a well-rounded language challenge.
% Type: conversation / Difficulty: intermediate

quest(the_full_experience, 'The Full Experience', conversation, intermediate, available).
quest_assigned_to(the_full_experience, 'Player').
quest_language(the_full_experience, french).
quest_tag(the_full_experience, seed).
quest_tag(the_full_experience, objective_type_complete_conversation).
quest_tag(the_full_experience, category_conversation).
quest_tag(the_full_experience, composite).

quest_objective(the_full_experience, 0, visit_location('Abbeville-((sur-))river')).
quest_objective(the_full_experience, 1, conversation_turns(3)).
quest_objective(the_full_experience, 2, learn_words_count(3)).
quest_objective(the_full_experience, 3, objective('Identify 1 object by its French name')).



quest_reward(the_full_experience, experience, 45).
quest_reward(the_full_experience, xp, 45).
quest_reward(the_full_experience, fluency, 9).

% Can Player take this quest?
quest_available(Player, the_full_experience) :-
    quest(the_full_experience, _, _, _, active).

% Quest: Language Explorer
% Explore a new area, read signs, examine objects, and talk to people — all in the target language.
% Type: exploration / Difficulty: advanced

quest(language_explorer, 'Language Explorer', exploration, advanced, available).
quest_assigned_to(language_explorer, 'Player').
quest_language(language_explorer, french).
quest_tag(language_explorer, seed).
quest_tag(language_explorer, objective_type_use_vocabulary).
quest_tag(language_explorer, category_exploration).
quest_tag(language_explorer, composite).
quest_tag(language_explorer, immersion).

quest_objective(language_explorer, 0, visit_location('Abbeville-((sur-))river')).
quest_objective(language_explorer, 1, objective('Read 2 signs in French')).
quest_objective(language_explorer, 2, objective('Examine 2 objects')).
quest_objective(language_explorer, 3, conversation_turns(4)).
quest_objective(language_explorer, 4, learn_words_count(5)).



quest_reward(language_explorer, experience, 55).
quest_reward(language_explorer, xp, 55).
quest_reward(language_explorer, fluency, 11).

% Can Player take this quest?
quest_available(Player, language_explorer) :-
    quest(language_explorer, _, _, _, active).

% Arrival Encounter — Prolog Knowledge Base
% Pre-test baseline assessment
% Total: 53 points across 5 phases

:- dynamic(assessment_quest/4).
:- dynamic(assessment_phase/5).
:- dynamic(assessment_task/5).
:- dynamic(scoring_dimension/5).
:- dynamic(assessment_tag/2).
:- dynamic(phase_order/3).
:- dynamic(assessment_objective/4).
:- dynamic(phase_score/3).
:- dynamic(quest_reward/3).
:- dynamic(assessment_language/2).

% Core assessment quest metadata
assessment_quest(arrival_encounter, arrival, beginner, 53).
assessment_language(arrival_encounter, 'French').
quest_reward(arrival_encounter, experience, 50).

% Tags
assessment_tag(arrival_encounter, assessment).
assessment_tag(arrival_encounter, arrival).
assessment_tag(arrival_encounter, onboarding).
assessment_tag(arrival_encounter, non_skippable).
assessment_tag(arrival_encounter, non_abandonable).

% Assessment phases
assessment_phase(arrival_encounter, arrival_reading, reading, 'Reading Comprehension', 15).
phase_order(arrival_encounter, arrival_reading, 0).
assessment_phase(arrival_encounter, arrival_writing, writing, 'Writing Assessment', 15).
phase_order(arrival_encounter, arrival_writing, 1).
assessment_phase(arrival_encounter, arrival_listening, listening, 'Listening Comprehension', 13).
phase_order(arrival_encounter, arrival_listening, 2).
assessment_phase(arrival_encounter, arrival_initiate_conversation, initiate_conversation, 'Initiate Conversation', 0).
phase_order(arrival_encounter, arrival_initiate_conversation, 3).
assessment_phase(arrival_encounter, arrival_conversation, conversation, 'Conversation', 10).
phase_order(arrival_encounter, arrival_conversation, 4).

% Tasks and scoring dimensions
assessment_task(arrival_encounter, arrival_reading, arrival_reading_comprehension, reading_comprehension, 15).
scoring_dimension(arrival_encounter, arrival_reading, comprehension, 'Comprehension', 5).
scoring_dimension(arrival_encounter, arrival_reading, vocabulary_recognition, 'Vocabulary Recognition', 5).
scoring_dimension(arrival_encounter, arrival_reading, inference, 'Inference', 5).
assessment_task(arrival_encounter, arrival_writing, arrival_writing_response, writing_prompt, 15).
scoring_dimension(arrival_encounter, arrival_writing, task_completion, 'Task Completion', 5).
scoring_dimension(arrival_encounter, arrival_writing, vocabulary, 'Vocabulary', 5).
scoring_dimension(arrival_encounter, arrival_writing, grammar, 'Grammar', 5).
assessment_task(arrival_encounter, arrival_listening, arrival_listening_comprehension, listening_comprehension, 13).
scoring_dimension(arrival_encounter, arrival_listening, comprehension, 'Comprehension', 5).
scoring_dimension(arrival_encounter, arrival_listening, detail_extraction, 'Detail Extraction', 4).
scoring_dimension(arrival_encounter, arrival_listening, inference, 'Inference', 4).
assessment_task(arrival_encounter, arrival_initiate_conversation, arrival_initiate_conversation_task, conversation_quest, 0).
assessment_task(arrival_encounter, arrival_conversation, arrival_conversation_quest, conversation_quest, 10).
scoring_dimension(arrival_encounter, arrival_conversation, accuracy, 'Accuracy', 2).
scoring_dimension(arrival_encounter, arrival_conversation, fluency, 'Fluency', 2).
scoring_dimension(arrival_encounter, arrival_conversation, vocabulary, 'Vocabulary', 2).
scoring_dimension(arrival_encounter, arrival_conversation, comprehension, 'Comprehension', 2).
scoring_dimension(arrival_encounter, arrival_conversation, pragmatics, 'Pragmatics', 2).

% Quest objectives — one per assessment phase
assessment_objective(arrival_encounter, 0, arrival_reading, complete_phase(arrival_reading)).
assessment_objective(arrival_encounter, 1, arrival_writing, complete_phase(arrival_writing)).
assessment_objective(arrival_encounter, 2, arrival_listening, complete_phase(arrival_listening)).
assessment_objective(arrival_encounter, 3, arrival_initiate_conversation, complete_phase(arrival_initiate_conversation)).
assessment_objective(arrival_encounter, 4, arrival_conversation, complete_phase(arrival_conversation)).

% Phase completion: a phase is complete when its score has been recorded
phase_complete(arrival_encounter, PhaseId) :-
    assessment_phase(arrival_encounter, PhaseId, _, _, _),
    phase_score(arrival_encounter, PhaseId, _).

% Assessment completion: all phases must be complete
assessment_complete(arrival_encounter) :-
    \+ (assessment_phase(arrival_encounter, PhaseId, _, _, _), \+ phase_complete(arrival_encounter, PhaseId)).

% Total score: sum of all phase scores
assessment_total_score(arrival_encounter, Total) :-
    findall(S, phase_score(arrival_encounter, _, S), Scores),
    sum_list(Scores, Total).

% Phase passed: score > 0
phase_passed(arrival_encounter, PhaseId) :-
    phase_score(arrival_encounter, PhaseId, Score),
    Score > 0.
% Quest: Departure Assessment
% Post-gameplay French proficiency assessment before departing Abbeville-((sur-))river.
% Type: assessment / Difficulty: beginner

quest(departure_assessment, 'Departure Assessment', assessment, beginner, available).
quest_assigned_to(departure_assessment, 'unassigned').
quest_language(departure_assessment, french).
quest_tag(departure_assessment, assessment).
quest_tag(departure_assessment, departure).
quest_tag(departure_assessment, non_skippable).
quest_tag(departure_assessment, non_abandonable).

quest_objective(departure_assessment, 0, conversation_turns(1)).
quest_objective(departure_assessment, 1, conversation_turns(1)).
quest_objective(departure_assessment, 2, conversation_turns(1)).
quest_objective(departure_assessment, 3, conversation_turns(1)).



quest_reward(departure_assessment, experience, 50).
quest_reward(departure_assessment, xp, 50).
quest_reward(departure_assessment, fluency, 5).

% Can Player take this quest?
quest_available(Player, departure_assessment) :-
    quest(departure_assessment, _, _, _, active).

