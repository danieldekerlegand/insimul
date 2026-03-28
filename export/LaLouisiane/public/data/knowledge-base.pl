% Insimul Knowledge Base - Auto-generated for game export
% Generated: 2026-03-28T15:25:53.065Z

% === NPC Reasoning Rules ===
% NPC Reasoning Rules - Auto-generated
% Generated: 2026-03-28T15:25:53.065Z

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
% Generated: 2026-03-28T15:25:53.066Z

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
% Generated: 2026-03-28T15:25:53.066Z

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
world(_69c7ef7854de6edea916a60d).
world_name(_69c7ef7854de6edea916a60d, 'La Louisiane').
world_description(_69c7ef7854de6edea916a60d, 'An alternate reality where Louisiana was never sold to the United States and is now an independent Francophone nation.').

% === Country Facts ===
country(_69c7efb954de6edea916a677).
country_name(_69c7efb954de6edea916a677, 'Royaume de La Louisiane').
government_type(_69c7efb954de6edea916a677, monarchy).
economic_system(_69c7efb954de6edea916a677, feudal).
country_founded(_69c7efb954de6edea916a677, 1850).

% === State Facts ===
state(_69c7efb954de6edea916a679).
state_name(_69c7efb954de6edea916a679, 'Basse-Louisiane').
state_of_country(_69c7efb954de6edea916a679, _69c7efb954de6edea916a677).
state_type(_69c7efb954de6edea916a679, province).
state_terrain(_69c7efb954de6edea916a679, plains).

% === Settlement Facts ===
settlement(_69c7efb954de6edea916a67b).
settlement_name(_69c7efb954de6edea916a67b, 'Sainte-Évangéline').
settlement_of_country(_69c7efb954de6edea916a67b, _69c7efb954de6edea916a677).
settlement_of_state(_69c7efb954de6edea916a67b, _69c7efb954de6edea916a679).
settlement_type(_69c7efb954de6edea916a67b, hamlet).
settlement_terrain(_69c7efb954de6edea916a67b, plains).

% === Business Facts ===
business(_69c7efe554de6edea916a770).
business_name(_69c7efe554de6edea916a770, 'Dugas\'s Farmstead').
business_type(_69c7efe554de6edea916a770, farm).
business_of_settlement(_69c7efe554de6edea916a770, _69c7efb954de6edea916a67b).
business_owner(_69c7efe554de6edea916a770, _69c7efe454de6edea916a729).
business(_69c7efe554de6edea916a771).
business_name(_69c7efe554de6edea916a771, 'Dubois\'s Shop').
business_type(_69c7efe554de6edea916a771, shop).
business_of_settlement(_69c7efe554de6edea916a771, _69c7efb954de6edea916a67b).
business_owner(_69c7efe554de6edea916a771, _69c7efe354de6edea916a70f).
business(_69c7efe554de6edea916a772).
business_name(_69c7efe554de6edea916a772, 'Bergeron\'s BarberShop').
business_type(_69c7efe554de6edea916a772, barbershop).
business_of_settlement(_69c7efe554de6edea916a772, _69c7efb954de6edea916a67b).
business_owner(_69c7efe554de6edea916a772, _69c7efe454de6edea916a725).
business(_69c7efe554de6edea916a773).
business_name(_69c7efe554de6edea916a773, 'Landry\'s Theater').
business_type(_69c7efe554de6edea916a773, theater).
business_of_settlement(_69c7efe554de6edea916a773, _69c7efb954de6edea916a67b).
business_owner(_69c7efe554de6edea916a773, _69c7efe254de6edea916a6d5).
business(_69c7efe554de6edea916a774).
business_name(_69c7efe554de6edea916a774, 'Savoie\'s AutoRepair').
business_type(_69c7efe554de6edea916a774, autorepair).
business_of_settlement(_69c7efe554de6edea916a774, _69c7efb954de6edea916a67b).
business_owner(_69c7efe554de6edea916a774, _69c7efe454de6edea916a72c).

% === Lot Facts ===
lot(_69c7efe454de6edea916a741).
lot_of_settlement(_69c7efe454de6edea916a741, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a741, '1 Rue Principale').
lot_building_type(_69c7efe454de6edea916a741, business).
lot(_69c7efe454de6edea916a742).
lot_of_settlement(_69c7efe454de6edea916a742, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a742, '2 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a742, residence).
lot(_69c7efe454de6edea916a743).
lot_of_settlement(_69c7efe454de6edea916a743, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a743, '3 Rue Principale').
lot_building_type(_69c7efe454de6edea916a743, residence).
lot(_69c7efe454de6edea916a744).
lot_of_settlement(_69c7efe454de6edea916a744, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a744, '4 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a744, residence).
lot(_69c7efe454de6edea916a745).
lot_of_settlement(_69c7efe454de6edea916a745, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a745, '5 Rue Principale').
lot_building_type(_69c7efe454de6edea916a745, business).
lot(_69c7efe454de6edea916a746).
lot_of_settlement(_69c7efe454de6edea916a746, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a746, '6 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a746, residence).
lot(_69c7efe454de6edea916a747).
lot_of_settlement(_69c7efe454de6edea916a747, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a747, '7 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a747, residence).
lot(_69c7efe454de6edea916a748).
lot_of_settlement(_69c7efe454de6edea916a748, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a748, '8 Avenue de l\'Érable').
lot_building_type(_69c7efe454de6edea916a748, residence).
lot(_69c7efe454de6edea916a749).
lot_of_settlement(_69c7efe454de6edea916a749, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a749, '9 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a749, business).
lot(_69c7efe454de6edea916a74a).
lot_of_settlement(_69c7efe454de6edea916a74a, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a74a, '10 Avenue de l\'Érable').
lot_building_type(_69c7efe454de6edea916a74a, residence).
lot(_69c7efe454de6edea916a74b).
lot_of_settlement(_69c7efe454de6edea916a74b, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a74b, '11 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a74b, residence).
lot(_69c7efe454de6edea916a74c).
lot_of_settlement(_69c7efe454de6edea916a74c, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a74c, '12 Avenue de l\'Érable').
lot_building_type(_69c7efe454de6edea916a74c, residence).
lot(_69c7efe454de6edea916a74d).
lot_of_settlement(_69c7efe454de6edea916a74d, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a74d, '13 Rue Principale').
lot_building_type(_69c7efe454de6edea916a74d, business).
lot(_69c7efe454de6edea916a74e).
lot_of_settlement(_69c7efe454de6edea916a74e, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a74e, '14 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a74e, residence).
lot(_69c7efe454de6edea916a74f).
lot_of_settlement(_69c7efe454de6edea916a74f, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a74f, '15 Rue Principale').
lot_building_type(_69c7efe454de6edea916a74f, residence).
lot(_69c7efe454de6edea916a750).
lot_of_settlement(_69c7efe454de6edea916a750, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a750, '16 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a750, residence).
lot(_69c7efe454de6edea916a751).
lot_of_settlement(_69c7efe454de6edea916a751, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a751, '17 Rue Principale').
lot_building_type(_69c7efe454de6edea916a751, business).
lot(_69c7efe454de6edea916a752).
lot_of_settlement(_69c7efe454de6edea916a752, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a752, '18 Avenue du Chêne').
lot_building_type(_69c7efe454de6edea916a752, residence).
lot(_69c7efe454de6edea916a753).
lot_of_settlement(_69c7efe454de6edea916a753, _69c7efb954de6edea916a67b).
lot_address(_69c7efe454de6edea916a753, 'Avenue du Chêne Park').
lot_building_type(_69c7efe454de6edea916a753, park).

% === Character Facts ===
person(_tienne_broussard_69c7efc654de6edea916a68d).
first_name(_tienne_broussard_69c7efc654de6edea916a68d, 'Étienne').
last_name(_tienne_broussard_69c7efc654de6edea916a68d, 'Broussard').
age(_tienne_broussard_69c7efc654de6edea916a68d, 175).
gender(_tienne_broussard_69c7efc654de6edea916a68d, male).
dead(_tienne_broussard_69c7efc654de6edea916a68d).
personality(_tienne_broussard_69c7efc654de6edea916a68d, openness, -0.7490570058935337).
personality(_tienne_broussard_69c7efc654de6edea916a68d, conscientiousness, -0.886090558542044).
personality(_tienne_broussard_69c7efc654de6edea916a68d, extroversion, 0.09667077924612189).
personality(_tienne_broussard_69c7efc654de6edea916a68d, agreeableness, 0.24251368432967402).
personality(_tienne_broussard_69c7efc654de6edea916a68d, neuroticism, -0.6470291032631716).
skill(_tienne_broussard_69c7efc654de6edea916a68d, music, 0.16).
skill(_tienne_broussard_69c7efc654de6edea916a68d, crafting, 0.19).
skill(_tienne_broussard_69c7efc654de6edea916a68d, farming, 0.13).
skill(_tienne_broussard_69c7efc654de6edea916a68d, persuasion, 0.46).
skill(_tienne_broussard_69c7efc654de6edea916a68d, leadership, 0.54).
skill(_tienne_broussard_69c7efc654de6edea916a68d, trading, 0.37).
skill(_tienne_broussard_69c7efc654de6edea916a68d, medicine, 0.48).
skill(_tienne_broussard_69c7efc654de6edea916a68d, teaching, 0.41).
skill(_tienne_broussard_69c7efc654de6edea916a68d, diplomacy, 0.37).
skill(_tienne_broussard_69c7efc654de6edea916a68d, combat, 0.97).
skill(_tienne_broussard_69c7efc654de6edea916a68d, athletics, 0.55).
skill(_tienne_broussard_69c7efc654de6edea916a68d, endurance, 0.59).
married_to(_tienne_broussard_69c7efc654de6edea916a68d, _69c7efc654de6edea916a68f).
person(aurore_broussard_69c7efc654de6edea916a68f).
first_name(aurore_broussard_69c7efc654de6edea916a68f, 'Aurore').
last_name(aurore_broussard_69c7efc654de6edea916a68f, 'Broussard').
age(aurore_broussard_69c7efc654de6edea916a68f, 173).
gender(aurore_broussard_69c7efc654de6edea916a68f, female).
dead(aurore_broussard_69c7efc654de6edea916a68f).
personality(aurore_broussard_69c7efc654de6edea916a68f, openness, -0.9926203918817551).
personality(aurore_broussard_69c7efc654de6edea916a68f, conscientiousness, 0.20830387622662272).
personality(aurore_broussard_69c7efc654de6edea916a68f, extroversion, -0.9159024799169644).
personality(aurore_broussard_69c7efc654de6edea916a68f, agreeableness, -0.28510313115857766).
personality(aurore_broussard_69c7efc654de6edea916a68f, neuroticism, 0.36132812452660756).
skill(aurore_broussard_69c7efc654de6edea916a68f, crafting, 0.62).
skill(aurore_broussard_69c7efc654de6edea916a68f, farming, 0.54).
skill(aurore_broussard_69c7efc654de6edea916a68f, cooking, 0.43).
skill(aurore_broussard_69c7efc654de6edea916a68f, persuasion, 0.17).
skill(aurore_broussard_69c7efc654de6edea916a68f, leadership, 0.18).
skill(aurore_broussard_69c7efc654de6edea916a68f, trading, 0.18).
skill(aurore_broussard_69c7efc654de6edea916a68f, medicine, 0.18).
skill(aurore_broussard_69c7efc654de6edea916a68f, teaching, 0.34).
skill(aurore_broussard_69c7efc654de6edea916a68f, diplomacy, 0.16).
skill(aurore_broussard_69c7efc654de6edea916a68f, combat, 0.36).
skill(aurore_broussard_69c7efc654de6edea916a68f, endurance, 0.14).
married_to(aurore_broussard_69c7efc654de6edea916a68f, _69c7efc654de6edea916a68d).
person(jean_baptiste_h_bert_69c7efc654de6edea916a694).
first_name(jean_baptiste_h_bert_69c7efc654de6edea916a694, 'Jean-Baptiste').
last_name(jean_baptiste_h_bert_69c7efc654de6edea916a694, 'Hébert').
age(jean_baptiste_h_bert_69c7efc654de6edea916a694, 175).
gender(jean_baptiste_h_bert_69c7efc654de6edea916a694, male).
dead(jean_baptiste_h_bert_69c7efc654de6edea916a694).
personality(jean_baptiste_h_bert_69c7efc654de6edea916a694, openness, -0.7283181558451446).
personality(jean_baptiste_h_bert_69c7efc654de6edea916a694, conscientiousness, -0.0802141446866842).
personality(jean_baptiste_h_bert_69c7efc654de6edea916a694, extroversion, -0.8441657381491487).
personality(jean_baptiste_h_bert_69c7efc654de6edea916a694, agreeableness, -0.9792708410583146).
personality(jean_baptiste_h_bert_69c7efc654de6edea916a694, neuroticism, -0.6518599410957995).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, creativity, 0.13).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, music, 0.11).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, languages, 0.25).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, crafting, 0.61).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, farming, 0.61).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, cooking, 0.37).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, leadership, 0.19).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, medicine, 0.2).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, teaching, 0.14).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, diplomacy, 0.19).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, combat, 0.83).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, athletics, 0.69).
skill(jean_baptiste_h_bert_69c7efc654de6edea916a694, endurance, 0.67).
married_to(jean_baptiste_h_bert_69c7efc654de6edea916a694, _69c7efc654de6edea916a696).
parent_of(jean_baptiste_h_bert_69c7efc654de6edea916a694, _69c7efd154de6edea916a6a5).
parent_of(jean_baptiste_h_bert_69c7efc654de6edea916a694, _69c7efd254de6edea916a6a7).
parent_of(jean_baptiste_h_bert_69c7efc654de6edea916a694, _69c7efd254de6edea916a6a9).
person(c_lestine_h_bert_69c7efc654de6edea916a696).
first_name(c_lestine_h_bert_69c7efc654de6edea916a696, 'Célestine').
last_name(c_lestine_h_bert_69c7efc654de6edea916a696, 'Hébert').
age(c_lestine_h_bert_69c7efc654de6edea916a696, 173).
gender(c_lestine_h_bert_69c7efc654de6edea916a696, female).
dead(c_lestine_h_bert_69c7efc654de6edea916a696).
personality(c_lestine_h_bert_69c7efc654de6edea916a696, openness, -0.6634259334124311).
personality(c_lestine_h_bert_69c7efc654de6edea916a696, conscientiousness, -0.1387041151078714).
personality(c_lestine_h_bert_69c7efc654de6edea916a696, extroversion, -0.37531422556007543).
personality(c_lestine_h_bert_69c7efc654de6edea916a696, agreeableness, -0.5938067266635971).
personality(c_lestine_h_bert_69c7efc654de6edea916a696, neuroticism, 0.8115893862323991).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, creativity, 0.16).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, languages, 0.19).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, crafting, 0.29).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, farming, 0.34).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, cooking, 0.12).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, persuasion, 0.38).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, leadership, 0.39).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, trading, 0.12).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, medicine, 0.34).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, teaching, 0.1).
skill(c_lestine_h_bert_69c7efc654de6edea916a696, diplomacy, 0.3).
married_to(c_lestine_h_bert_69c7efc654de6edea916a696, _69c7efc654de6edea916a694).
parent_of(c_lestine_h_bert_69c7efc654de6edea916a696, _69c7efd154de6edea916a6a5).
parent_of(c_lestine_h_bert_69c7efc654de6edea916a696, _69c7efd254de6edea916a6a7).
parent_of(c_lestine_h_bert_69c7efc654de6edea916a696, _69c7efd254de6edea916a6a9).
person(_mile_h_bert_69c7efd154de6edea916a6a5).
first_name(_mile_h_bert_69c7efd154de6edea916a6a5, 'Émile').
last_name(_mile_h_bert_69c7efd154de6edea916a6a5, 'Hébert').
age(_mile_h_bert_69c7efd154de6edea916a6a5, 150).
gender(_mile_h_bert_69c7efd154de6edea916a6a5, male).
dead(_mile_h_bert_69c7efd154de6edea916a6a5).
personality(_mile_h_bert_69c7efd154de6edea916a6a5, openness, -0.7623205444497236).
personality(_mile_h_bert_69c7efd154de6edea916a6a5, conscientiousness, -0.2068002936411712).
personality(_mile_h_bert_69c7efd154de6edea916a6a5, extroversion, -0.5431897392585772).
personality(_mile_h_bert_69c7efd154de6edea916a6a5, agreeableness, -0.8889471532462723).
personality(_mile_h_bert_69c7efd154de6edea916a6a5, neuroticism, 0.09127043263957409).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, creativity, 0.11).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, crafting, 0.3).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, farming, 0.2).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, cooking, 0.37).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, persuasion, 0.42).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, leadership, 0.16).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, trading, 0.18).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, diplomacy, 0.18).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, combat, 0.54).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, athletics, 0.3).
skill(_mile_h_bert_69c7efd154de6edea916a6a5, endurance, 0.35).
child_of(_mile_h_bert_69c7efd154de6edea916a6a5, _69c7efc654de6edea916a694).
child_of(_mile_h_bert_69c7efd154de6edea916a6a5, _69c7efc654de6edea916a696).
person(am_lie_h_bert_69c7efd254de6edea916a6a7).
first_name(am_lie_h_bert_69c7efd254de6edea916a6a7, 'Amélie').
last_name(am_lie_h_bert_69c7efd254de6edea916a6a7, 'Hébert').
age(am_lie_h_bert_69c7efd254de6edea916a6a7, 149).
gender(am_lie_h_bert_69c7efd254de6edea916a6a7, female).
dead(am_lie_h_bert_69c7efd254de6edea916a6a7).
personality(am_lie_h_bert_69c7efd254de6edea916a6a7, openness, -0.5138553030318618).
personality(am_lie_h_bert_69c7efd254de6edea916a6a7, conscientiousness, -0.27409242361487896).
personality(am_lie_h_bert_69c7efd254de6edea916a6a7, extroversion, -0.4404728969312893).
personality(am_lie_h_bert_69c7efd254de6edea916a6a7, agreeableness, -0.9475795723586746).
personality(am_lie_h_bert_69c7efd254de6edea916a6a7, neuroticism, -0.07508933379235061).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, music, 0.37).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, languages, 0.3).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, crafting, 0.55).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, farming, 0.24).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, cooking, 0.2).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, persuasion, 0.14).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, trading, 0.12).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, medicine, 0.16).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, teaching, 0.16).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, combat, 0.74).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, athletics, 0.56).
skill(am_lie_h_bert_69c7efd254de6edea916a6a7, endurance, 0.31).
child_of(am_lie_h_bert_69c7efd254de6edea916a6a7, _69c7efc654de6edea916a694).
child_of(am_lie_h_bert_69c7efd254de6edea916a6a7, _69c7efc654de6edea916a696).
person(c_lestin_h_bert_69c7efd254de6edea916a6a9).
first_name(c_lestin_h_bert_69c7efd254de6edea916a6a9, 'Célestin').
last_name(c_lestin_h_bert_69c7efd254de6edea916a6a9, 'Hébert').
age(c_lestin_h_bert_69c7efd254de6edea916a6a9, 148).
gender(c_lestin_h_bert_69c7efd254de6edea916a6a9, male).
dead(c_lestin_h_bert_69c7efd254de6edea916a6a9).
personality(c_lestin_h_bert_69c7efd254de6edea916a6a9, openness, -0.8408154425776801).
personality(c_lestin_h_bert_69c7efd254de6edea916a6a9, conscientiousness, -0.23971257613420663).
personality(c_lestin_h_bert_69c7efd254de6edea916a6a9, extroversion, -0.5288964504892417).
personality(c_lestin_h_bert_69c7efd254de6edea916a6a9, agreeableness, -0.6771228546371582).
personality(c_lestin_h_bert_69c7efd254de6edea916a6a9, neuroticism, 0.14039146666367083).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, creativity, 0.16).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, crafting, 0.39).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, farming, 0.41).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, cooking, 0.2).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, persuasion, 0.17).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, leadership, 0.17).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, trading, 0.26).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, medicine, 0.28).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, teaching, 0.3).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, combat, 0.42).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, athletics, 0.52).
skill(c_lestin_h_bert_69c7efd254de6edea916a6a9, endurance, 0.17).
child_of(c_lestin_h_bert_69c7efd254de6edea916a6a9, _69c7efc654de6edea916a694).
child_of(c_lestin_h_bert_69c7efd254de6edea916a6a9, _69c7efc654de6edea916a696).
person(_lodie_boudreaux_69c7efe254de6edea916a6cd).
first_name(_lodie_boudreaux_69c7efe254de6edea916a6cd, 'Élodie').
last_name(_lodie_boudreaux_69c7efe254de6edea916a6cd, 'Boudreaux').
age(_lodie_boudreaux_69c7efe254de6edea916a6cd, 23).
gender(_lodie_boudreaux_69c7efe254de6edea916a6cd, female).
occupation(_lodie_boudreaux_69c7efe254de6edea916a6cd, farmer).
alive(_lodie_boudreaux_69c7efe254de6edea916a6cd).
personality(_lodie_boudreaux_69c7efe254de6edea916a6cd, openness, -0.04554625987122929).
personality(_lodie_boudreaux_69c7efe254de6edea916a6cd, conscientiousness, -0.652954467712366).
personality(_lodie_boudreaux_69c7efe254de6edea916a6cd, extroversion, 0.18071836361778537).
personality(_lodie_boudreaux_69c7efe254de6edea916a6cd, agreeableness, 0.29629543298285643).
personality(_lodie_boudreaux_69c7efe254de6edea916a6cd, neuroticism, -0.8528597055933078).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, creativity, 0.2).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, music, 0.31).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, languages, 0.14).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, persuasion, 0.37).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, leadership, 0.18).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, trading, 0.13).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, medicine, 0.31).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, teaching, 0.21).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, diplomacy, 0.3).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, combat, 0.6).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, athletics, 0.37).
skill(_lodie_boudreaux_69c7efe254de6edea916a6cd, endurance, 0.52).
person(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf).
first_name(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, 'Geneviève').
last_name(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, 'Thibodeaux').
age(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, 48).
gender(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, female).
occupation(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, retired).
alive(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf).
personality(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, openness, -0.3104653122919623).
personality(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, conscientiousness, 0.4575894567104446).
personality(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, extroversion, 0.31102496862600626).
personality(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, agreeableness, -0.3405699048094841).
personality(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, neuroticism, -0.6030061827356357).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, creativity, 0.34).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, music, 0.32).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, languages, 0.2).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, crafting, 0.83).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, farming, 0.7).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, cooking, 0.59).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, persuasion, 0.63).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, leadership, 0.61).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, trading, 0.39).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, medicine, 0.19).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, teaching, 0.18).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, diplomacy, 0.11).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, combat, 0.85).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, athletics, 0.53).
skill(genevi_ve_thibodeaux_69c7efe254de6edea916a6cf, endurance, 0.54).
person(jean_baptiste_broussard_69c7efe254de6edea916a6d1).
first_name(jean_baptiste_broussard_69c7efe254de6edea916a6d1, 'Jean-Baptiste').
last_name(jean_baptiste_broussard_69c7efe254de6edea916a6d1, 'Broussard').
age(jean_baptiste_broussard_69c7efe254de6edea916a6d1, 40).
gender(jean_baptiste_broussard_69c7efe254de6edea916a6d1, male).
occupation(jean_baptiste_broussard_69c7efe254de6edea916a6d1, retired).
alive(jean_baptiste_broussard_69c7efe254de6edea916a6d1).
personality(jean_baptiste_broussard_69c7efe254de6edea916a6d1, openness, 0.11671967636974223).
personality(jean_baptiste_broussard_69c7efe254de6edea916a6d1, conscientiousness, 0.5382364296391695).
personality(jean_baptiste_broussard_69c7efe254de6edea916a6d1, extroversion, 0.2855307893774617).
personality(jean_baptiste_broussard_69c7efe254de6edea916a6d1, agreeableness, 0.9560591224899126).
personality(jean_baptiste_broussard_69c7efe254de6edea916a6d1, neuroticism, -0.6740959963227726).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, creativity, 0.67).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, music, 0.56).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, languages, 0.56).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, crafting, 0.63).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, farming, 0.72).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, cooking, 0.72).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, persuasion, 0.69).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, leadership, 0.54).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, trading, 0.58).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, medicine, 0.98).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, teaching, 0.84).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, diplomacy, 0.76).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, combat, 0.89).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, athletics, 0.82).
skill(jean_baptiste_broussard_69c7efe254de6edea916a6d1, endurance, 0.62).
person(_mile_thibodeaux_69c7efe254de6edea916a6d3).
first_name(_mile_thibodeaux_69c7efe254de6edea916a6d3, 'Émile').
last_name(_mile_thibodeaux_69c7efe254de6edea916a6d3, 'Thibodeaux').
age(_mile_thibodeaux_69c7efe254de6edea916a6d3, 31).
gender(_mile_thibodeaux_69c7efe254de6edea916a6d3, male).
occupation(_mile_thibodeaux_69c7efe254de6edea916a6d3, laborer).
alive(_mile_thibodeaux_69c7efe254de6edea916a6d3).
personality(_mile_thibodeaux_69c7efe254de6edea916a6d3, openness, -0.8045858850310137).
personality(_mile_thibodeaux_69c7efe254de6edea916a6d3, conscientiousness, 0.9157411160059699).
personality(_mile_thibodeaux_69c7efe254de6edea916a6d3, extroversion, -0.2962277623552385).
personality(_mile_thibodeaux_69c7efe254de6edea916a6d3, agreeableness, -0.5303591310536926).
personality(_mile_thibodeaux_69c7efe254de6edea916a6d3, neuroticism, 0.05876228357991664).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, crafting, 0.73).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, farming, 0.72).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, cooking, 0.46).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, persuasion, 0.36).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, leadership, 0.27).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, trading, 0.23).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, teaching, 0.18).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, diplomacy, 0.11).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, combat, 0.35).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, athletics, 0.18).
skill(_mile_thibodeaux_69c7efe254de6edea916a6d3, endurance, 0.38).
person(am_lie_landry_69c7efe254de6edea916a6d5).
first_name(am_lie_landry_69c7efe254de6edea916a6d5, 'Amélie').
last_name(am_lie_landry_69c7efe254de6edea916a6d5, 'Landry').
age(am_lie_landry_69c7efe254de6edea916a6d5, 26).
gender(am_lie_landry_69c7efe254de6edea916a6d5, female).
occupation(am_lie_landry_69c7efe254de6edea916a6d5, farmhand).
alive(am_lie_landry_69c7efe254de6edea916a6d5).
personality(am_lie_landry_69c7efe254de6edea916a6d5, openness, -0.40426952373076475).
personality(am_lie_landry_69c7efe254de6edea916a6d5, conscientiousness, -0.7535902528283853).
personality(am_lie_landry_69c7efe254de6edea916a6d5, extroversion, 0.3296596947798154).
personality(am_lie_landry_69c7efe254de6edea916a6d5, agreeableness, -0.0808852313866133).
personality(am_lie_landry_69c7efe254de6edea916a6d5, neuroticism, 0.07669552254996903).
skill(am_lie_landry_69c7efe254de6edea916a6d5, creativity, 0.29).
skill(am_lie_landry_69c7efe254de6edea916a6d5, music, 0.17).
skill(am_lie_landry_69c7efe254de6edea916a6d5, languages, 0.21).
skill(am_lie_landry_69c7efe254de6edea916a6d5, farming, 0.16).
skill(am_lie_landry_69c7efe254de6edea916a6d5, cooking, 0.13).
skill(am_lie_landry_69c7efe254de6edea916a6d5, persuasion, 0.31).
skill(am_lie_landry_69c7efe254de6edea916a6d5, leadership, 0.4).
skill(am_lie_landry_69c7efe254de6edea916a6d5, trading, 0.4).
skill(am_lie_landry_69c7efe254de6edea916a6d5, medicine, 0.24).
skill(am_lie_landry_69c7efe254de6edea916a6d5, teaching, 0.19).
skill(am_lie_landry_69c7efe254de6edea916a6d5, diplomacy, 0.25).
skill(am_lie_landry_69c7efe254de6edea916a6d5, combat, 0.3).
skill(am_lie_landry_69c7efe254de6edea916a6d5, athletics, 0.4).
skill(am_lie_landry_69c7efe254de6edea916a6d5, endurance, 0.28).
person(c_line_leblanc_69c7efe254de6edea916a6d7).
first_name(c_line_leblanc_69c7efe254de6edea916a6d7, 'Céline').
last_name(c_line_leblanc_69c7efe254de6edea916a6d7, 'LeBlanc').
age(c_line_leblanc_69c7efe254de6edea916a6d7, 55).
gender(c_line_leblanc_69c7efe254de6edea916a6d7, female).
occupation(c_line_leblanc_69c7efe254de6edea916a6d7, retired).
alive(c_line_leblanc_69c7efe254de6edea916a6d7).
personality(c_line_leblanc_69c7efe254de6edea916a6d7, openness, -0.1379749544836648).
personality(c_line_leblanc_69c7efe254de6edea916a6d7, conscientiousness, 0.42859698415846736).
personality(c_line_leblanc_69c7efe254de6edea916a6d7, extroversion, 0.48990807519181345).
personality(c_line_leblanc_69c7efe254de6edea916a6d7, agreeableness, -0.8941085283701571).
personality(c_line_leblanc_69c7efe254de6edea916a6d7, neuroticism, 0.10249382085125269).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, creativity, 0.47).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, music, 0.16).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, languages, 0.16).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, crafting, 0.78).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, farming, 0.71).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, cooking, 0.33).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, persuasion, 0.71).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, leadership, 0.74).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, trading, 0.53).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, combat, 0.43).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, athletics, 0.31).
skill(c_line_leblanc_69c7efe254de6edea916a6d7, endurance, 0.54).
person(louis_fontenot_69c7efe254de6edea916a6d9).
first_name(louis_fontenot_69c7efe254de6edea916a6d9, 'Louis').
last_name(louis_fontenot_69c7efe254de6edea916a6d9, 'Fontenot').
age(louis_fontenot_69c7efe254de6edea916a6d9, 57).
gender(louis_fontenot_69c7efe254de6edea916a6d9, male).
occupation(louis_fontenot_69c7efe254de6edea916a6d9, retired).
alive(louis_fontenot_69c7efe254de6edea916a6d9).
personality(louis_fontenot_69c7efe254de6edea916a6d9, openness, 0.8474206899240988).
personality(louis_fontenot_69c7efe254de6edea916a6d9, conscientiousness, -0.7648534608055297).
personality(louis_fontenot_69c7efe254de6edea916a6d9, extroversion, 0.3702586563516137).
personality(louis_fontenot_69c7efe254de6edea916a6d9, agreeableness, -0.10434442400074984).
personality(louis_fontenot_69c7efe254de6edea916a6d9, neuroticism, 0.07078560144730384).
skill(louis_fontenot_69c7efe254de6edea916a6d9, creativity, 1).
skill(louis_fontenot_69c7efe254de6edea916a6d9, music, 0.82).
skill(louis_fontenot_69c7efe254de6edea916a6d9, languages, 0.85).
skill(louis_fontenot_69c7efe254de6edea916a6d9, crafting, 0.22).
skill(louis_fontenot_69c7efe254de6edea916a6d9, farming, 0.25).
skill(louis_fontenot_69c7efe254de6edea916a6d9, cooking, 0.17).
skill(louis_fontenot_69c7efe254de6edea916a6d9, persuasion, 0.79).
skill(louis_fontenot_69c7efe254de6edea916a6d9, leadership, 0.49).
skill(louis_fontenot_69c7efe254de6edea916a6d9, trading, 0.58).
skill(louis_fontenot_69c7efe254de6edea916a6d9, medicine, 0.28).
skill(louis_fontenot_69c7efe254de6edea916a6d9, teaching, 0.3).
skill(louis_fontenot_69c7efe254de6edea916a6d9, diplomacy, 0.31).
skill(louis_fontenot_69c7efe254de6edea916a6d9, combat, 0.52).
skill(louis_fontenot_69c7efe254de6edea916a6d9, athletics, 0.56).
skill(louis_fontenot_69c7efe254de6edea916a6d9, endurance, 0.37).
person(antoine_h_bert_69c7efe254de6edea916a6db).
first_name(antoine_h_bert_69c7efe254de6edea916a6db, 'Antoine').
last_name(antoine_h_bert_69c7efe254de6edea916a6db, 'Hébert').
age(antoine_h_bert_69c7efe254de6edea916a6db, 37).
gender(antoine_h_bert_69c7efe254de6edea916a6db, male).
occupation(antoine_h_bert_69c7efe254de6edea916a6db, painter).
alive(antoine_h_bert_69c7efe254de6edea916a6db).
personality(antoine_h_bert_69c7efe254de6edea916a6db, openness, 0.5963217618580674).
personality(antoine_h_bert_69c7efe254de6edea916a6db, conscientiousness, -0.3378133986136449).
personality(antoine_h_bert_69c7efe254de6edea916a6db, extroversion, 0.9109526686828362).
personality(antoine_h_bert_69c7efe254de6edea916a6db, agreeableness, -0.5727027441266417).
personality(antoine_h_bert_69c7efe254de6edea916a6db, neuroticism, 0.30249581167291417).
skill(antoine_h_bert_69c7efe254de6edea916a6db, creativity, 0.79).
skill(antoine_h_bert_69c7efe254de6edea916a6db, music, 0.49).
skill(antoine_h_bert_69c7efe254de6edea916a6db, languages, 0.6).
skill(antoine_h_bert_69c7efe254de6edea916a6db, crafting, 0.43).
skill(antoine_h_bert_69c7efe254de6edea916a6db, farming, 0.21).
skill(antoine_h_bert_69c7efe254de6edea916a6db, cooking, 0.22).
skill(antoine_h_bert_69c7efe254de6edea916a6db, persuasion, 0.8).
skill(antoine_h_bert_69c7efe254de6edea916a6db, leadership, 0.84).
skill(antoine_h_bert_69c7efe254de6edea916a6db, trading, 0.62).
skill(antoine_h_bert_69c7efe254de6edea916a6db, medicine, 0.2).
skill(antoine_h_bert_69c7efe254de6edea916a6db, teaching, 0.11).
skill(antoine_h_bert_69c7efe254de6edea916a6db, combat, 0.49).
skill(antoine_h_bert_69c7efe254de6edea916a6db, athletics, 0.29).
skill(antoine_h_bert_69c7efe254de6edea916a6db, endurance, 0.17).
person(pierre_landry_69c7efe254de6edea916a6dd).
first_name(pierre_landry_69c7efe254de6edea916a6dd, 'Pierre').
last_name(pierre_landry_69c7efe254de6edea916a6dd, 'Landry').
age(pierre_landry_69c7efe254de6edea916a6dd, 19).
gender(pierre_landry_69c7efe254de6edea916a6dd, male).
occupation(pierre_landry_69c7efe254de6edea916a6dd, laborer).
alive(pierre_landry_69c7efe254de6edea916a6dd).
personality(pierre_landry_69c7efe254de6edea916a6dd, openness, -0.12348575059832179).
personality(pierre_landry_69c7efe254de6edea916a6dd, conscientiousness, 0.5198878573037877).
personality(pierre_landry_69c7efe254de6edea916a6dd, extroversion, -0.852680533770735).
personality(pierre_landry_69c7efe254de6edea916a6dd, agreeableness, -0.99111084504742).
personality(pierre_landry_69c7efe254de6edea916a6dd, neuroticism, -0.22379817009448333).
skill(pierre_landry_69c7efe254de6edea916a6dd, creativity, 0.27).
skill(pierre_landry_69c7efe254de6edea916a6dd, languages, 0.14).
skill(pierre_landry_69c7efe254de6edea916a6dd, crafting, 0.39).
skill(pierre_landry_69c7efe254de6edea916a6dd, farming, 0.35).
skill(pierre_landry_69c7efe254de6edea916a6dd, cooking, 0.16).
skill(pierre_landry_69c7efe254de6edea916a6dd, persuasion, 0.12).
skill(pierre_landry_69c7efe254de6edea916a6dd, combat, 0.3).
skill(pierre_landry_69c7efe254de6edea916a6dd, athletics, 0.31).
skill(pierre_landry_69c7efe254de6edea916a6dd, endurance, 0.32).
person(chlo_h_bert_69c7efe254de6edea916a6df).
first_name(chlo_h_bert_69c7efe254de6edea916a6df, 'Chloé').
last_name(chlo_h_bert_69c7efe254de6edea916a6df, 'Hébert').
age(chlo_h_bert_69c7efe254de6edea916a6df, 34).
gender(chlo_h_bert_69c7efe254de6edea916a6df, female).
occupation(chlo_h_bert_69c7efe254de6edea916a6df, farmhand).
alive(chlo_h_bert_69c7efe254de6edea916a6df).
personality(chlo_h_bert_69c7efe254de6edea916a6df, openness, -0.30267382877961113).
personality(chlo_h_bert_69c7efe254de6edea916a6df, conscientiousness, 0.844476202694322).
personality(chlo_h_bert_69c7efe254de6edea916a6df, extroversion, -0.2625713542133008).
personality(chlo_h_bert_69c7efe254de6edea916a6df, agreeableness, -0.7941871507371379).
personality(chlo_h_bert_69c7efe254de6edea916a6df, neuroticism, -0.14703556050587308).
skill(chlo_h_bert_69c7efe254de6edea916a6df, creativity, 0.13).
skill(chlo_h_bert_69c7efe254de6edea916a6df, music, 0.25).
skill(chlo_h_bert_69c7efe254de6edea916a6df, languages, 0.33).
skill(chlo_h_bert_69c7efe254de6edea916a6df, crafting, 0.74).
skill(chlo_h_bert_69c7efe254de6edea916a6df, farming, 0.67).
skill(chlo_h_bert_69c7efe254de6edea916a6df, cooking, 0.57).
skill(chlo_h_bert_69c7efe254de6edea916a6df, persuasion, 0.22).
skill(chlo_h_bert_69c7efe254de6edea916a6df, leadership, 0.31).
skill(chlo_h_bert_69c7efe254de6edea916a6df, medicine, 0.17).
skill(chlo_h_bert_69c7efe254de6edea916a6df, teaching, 0.17).
skill(chlo_h_bert_69c7efe254de6edea916a6df, combat, 0.34).
skill(chlo_h_bert_69c7efe254de6edea916a6df, athletics, 0.54).
skill(chlo_h_bert_69c7efe254de6edea916a6df, endurance, 0.52).
person(l_a_fontenot_69c7efe254de6edea916a6e1).
first_name(l_a_fontenot_69c7efe254de6edea916a6e1, 'Léa').
last_name(l_a_fontenot_69c7efe254de6edea916a6e1, 'Fontenot').
age(l_a_fontenot_69c7efe254de6edea916a6e1, 30).
gender(l_a_fontenot_69c7efe254de6edea916a6e1, female).
occupation(l_a_fontenot_69c7efe254de6edea916a6e1, farmhand).
alive(l_a_fontenot_69c7efe254de6edea916a6e1).
personality(l_a_fontenot_69c7efe254de6edea916a6e1, openness, 0.20812296900455962).
personality(l_a_fontenot_69c7efe254de6edea916a6e1, conscientiousness, 0.9580676904447096).
personality(l_a_fontenot_69c7efe254de6edea916a6e1, extroversion, 0.9298571562669529).
personality(l_a_fontenot_69c7efe254de6edea916a6e1, agreeableness, -0.22573103127340755).
personality(l_a_fontenot_69c7efe254de6edea916a6e1, neuroticism, -0.8420816658460684).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, creativity, 0.57).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, music, 0.42).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, languages, 0.32).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, crafting, 0.68).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, farming, 0.59).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, cooking, 0.37).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, persuasion, 0.7).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, leadership, 0.47).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, trading, 0.62).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, medicine, 0.22).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, teaching, 0.18).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, combat, 0.77).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, athletics, 0.61).
skill(l_a_fontenot_69c7efe254de6edea916a6e1, endurance, 0.46).
person(manon_guidry_69c7efe254de6edea916a6e3).
first_name(manon_guidry_69c7efe254de6edea916a6e3, 'Manon').
last_name(manon_guidry_69c7efe254de6edea916a6e3, 'Guidry').
age(manon_guidry_69c7efe254de6edea916a6e3, 18).
gender(manon_guidry_69c7efe254de6edea916a6e3, female).
occupation(manon_guidry_69c7efe254de6edea916a6e3, baker).
alive(manon_guidry_69c7efe254de6edea916a6e3).
personality(manon_guidry_69c7efe254de6edea916a6e3, openness, 0.6648916965601366).
personality(manon_guidry_69c7efe254de6edea916a6e3, conscientiousness, 0.1403361019801257).
personality(manon_guidry_69c7efe254de6edea916a6e3, extroversion, 0.8853773378997754).
personality(manon_guidry_69c7efe254de6edea916a6e3, agreeableness, -0.23150253017747202).
personality(manon_guidry_69c7efe254de6edea916a6e3, neuroticism, -0.08223679061073286).
skill(manon_guidry_69c7efe254de6edea916a6e3, creativity, 0.41).
skill(manon_guidry_69c7efe254de6edea916a6e3, music, 0.38).
skill(manon_guidry_69c7efe254de6edea916a6e3, languages, 0.34).
skill(manon_guidry_69c7efe254de6edea916a6e3, crafting, 0.28).
skill(manon_guidry_69c7efe254de6edea916a6e3, farming, 0.15).
skill(manon_guidry_69c7efe254de6edea916a6e3, cooking, 0.25).
skill(manon_guidry_69c7efe254de6edea916a6e3, persuasion, 0.42).
skill(manon_guidry_69c7efe254de6edea916a6e3, leadership, 0.29).
skill(manon_guidry_69c7efe254de6edea916a6e3, trading, 0.29).
skill(manon_guidry_69c7efe254de6edea916a6e3, diplomacy, 0.15).
skill(manon_guidry_69c7efe254de6edea916a6e3, combat, 0.18).
skill(manon_guidry_69c7efe254de6edea916a6e3, athletics, 0.29).
skill(manon_guidry_69c7efe254de6edea916a6e3, endurance, 0.28).
person(th_odore_arceneaux_69c7efe254de6edea916a6e5).
first_name(th_odore_arceneaux_69c7efe254de6edea916a6e5, 'Théodore').
last_name(th_odore_arceneaux_69c7efe254de6edea916a6e5, 'Arceneaux').
age(th_odore_arceneaux_69c7efe254de6edea916a6e5, 53).
gender(th_odore_arceneaux_69c7efe254de6edea916a6e5, male).
occupation(th_odore_arceneaux_69c7efe254de6edea916a6e5, retired).
alive(th_odore_arceneaux_69c7efe254de6edea916a6e5).
personality(th_odore_arceneaux_69c7efe254de6edea916a6e5, openness, 0.11406319925978892).
personality(th_odore_arceneaux_69c7efe254de6edea916a6e5, conscientiousness, -0.5301007081840337).
personality(th_odore_arceneaux_69c7efe254de6edea916a6e5, extroversion, 0.2909362535030051).
personality(th_odore_arceneaux_69c7efe254de6edea916a6e5, agreeableness, 0.5668772026835547).
personality(th_odore_arceneaux_69c7efe254de6edea916a6e5, neuroticism, -0.4512807917260462).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, creativity, 0.46).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, music, 0.52).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, languages, 0.49).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, crafting, 0.31).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, farming, 0.19).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, cooking, 0.32).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, persuasion, 0.55).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, leadership, 0.47).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, trading, 0.58).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, medicine, 0.84).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, teaching, 0.55).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, diplomacy, 0.43).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, combat, 0.77).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, athletics, 0.54).
skill(th_odore_arceneaux_69c7efe254de6edea916a6e5, endurance, 0.74).
person(juliette_richard_69c7efe254de6edea916a6e7).
first_name(juliette_richard_69c7efe254de6edea916a6e7, 'Juliette').
last_name(juliette_richard_69c7efe254de6edea916a6e7, 'Richard').
age(juliette_richard_69c7efe254de6edea916a6e7, 49).
gender(juliette_richard_69c7efe254de6edea916a6e7, female).
occupation(juliette_richard_69c7efe254de6edea916a6e7, retired).
alive(juliette_richard_69c7efe254de6edea916a6e7).
personality(juliette_richard_69c7efe254de6edea916a6e7, openness, 0.8645443297842315).
personality(juliette_richard_69c7efe254de6edea916a6e7, conscientiousness, 0.57607855100462).
personality(juliette_richard_69c7efe254de6edea916a6e7, extroversion, 0.5315849512097675).
personality(juliette_richard_69c7efe254de6edea916a6e7, agreeableness, -0.5424861393626319).
personality(juliette_richard_69c7efe254de6edea916a6e7, neuroticism, -0.7421126668081492).
skill(juliette_richard_69c7efe254de6edea916a6e7, creativity, 0.85).
skill(juliette_richard_69c7efe254de6edea916a6e7, music, 0.73).
skill(juliette_richard_69c7efe254de6edea916a6e7, languages, 0.58).
skill(juliette_richard_69c7efe254de6edea916a6e7, crafting, 0.61).
skill(juliette_richard_69c7efe254de6edea916a6e7, farming, 0.52).
skill(juliette_richard_69c7efe254de6edea916a6e7, cooking, 0.71).
skill(juliette_richard_69c7efe254de6edea916a6e7, persuasion, 0.87).
skill(juliette_richard_69c7efe254de6edea916a6e7, leadership, 0.73).
skill(juliette_richard_69c7efe254de6edea916a6e7, trading, 0.37).
skill(juliette_richard_69c7efe254de6edea916a6e7, medicine, 0.42).
skill(juliette_richard_69c7efe254de6edea916a6e7, teaching, 0.23).
skill(juliette_richard_69c7efe254de6edea916a6e7, diplomacy, 0.24).
skill(juliette_richard_69c7efe254de6edea916a6e7, combat, 0.84).
skill(juliette_richard_69c7efe254de6edea916a6e7, athletics, 0.65).
skill(juliette_richard_69c7efe254de6edea916a6e7, endurance, 0.88).
person(mathieu_leblanc_69c7efe254de6edea916a6e9).
first_name(mathieu_leblanc_69c7efe254de6edea916a6e9, 'Mathieu').
last_name(mathieu_leblanc_69c7efe254de6edea916a6e9, 'Leblanc').
age(mathieu_leblanc_69c7efe254de6edea916a6e9, 41).
gender(mathieu_leblanc_69c7efe254de6edea916a6e9, male).
occupation(mathieu_leblanc_69c7efe254de6edea916a6e9, retired).
alive(mathieu_leblanc_69c7efe254de6edea916a6e9).
personality(mathieu_leblanc_69c7efe254de6edea916a6e9, openness, 0.35384985474153785).
personality(mathieu_leblanc_69c7efe254de6edea916a6e9, conscientiousness, 0.06739727292880593).
personality(mathieu_leblanc_69c7efe254de6edea916a6e9, extroversion, -0.7403504803417866).
personality(mathieu_leblanc_69c7efe254de6edea916a6e9, agreeableness, 0.4721207823110327).
personality(mathieu_leblanc_69c7efe254de6edea916a6e9, neuroticism, 0.5477655784312399).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, creativity, 0.55).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, music, 0.39).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, languages, 0.6).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, crafting, 0.6).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, farming, 0.46).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, cooking, 0.52).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, trading, 0.2).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, medicine, 0.56).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, teaching, 0.49).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, diplomacy, 0.53).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, combat, 0.37).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, athletics, 0.22).
skill(mathieu_leblanc_69c7efe254de6edea916a6e9, endurance, 0.12).
person(camille_broussard_69c7efe354de6edea916a6eb).
first_name(camille_broussard_69c7efe354de6edea916a6eb, 'Camille').
last_name(camille_broussard_69c7efe354de6edea916a6eb, 'Broussard').
age(camille_broussard_69c7efe354de6edea916a6eb, 48).
gender(camille_broussard_69c7efe354de6edea916a6eb, female).
occupation(camille_broussard_69c7efe354de6edea916a6eb, retired).
alive(camille_broussard_69c7efe354de6edea916a6eb).
personality(camille_broussard_69c7efe354de6edea916a6eb, openness, 0.8555991899911151).
personality(camille_broussard_69c7efe354de6edea916a6eb, conscientiousness, 0.23143050025294354).
personality(camille_broussard_69c7efe354de6edea916a6eb, extroversion, -0.8452357316103107).
personality(camille_broussard_69c7efe354de6edea916a6eb, agreeableness, 0.4805620199316847).
personality(camille_broussard_69c7efe354de6edea916a6eb, neuroticism, -0.7827084757291694).
skill(camille_broussard_69c7efe354de6edea916a6eb, creativity, 1).
skill(camille_broussard_69c7efe354de6edea916a6eb, music, 0.86).
skill(camille_broussard_69c7efe354de6edea916a6eb, languages, 0.56).
skill(camille_broussard_69c7efe354de6edea916a6eb, crafting, 0.61).
skill(camille_broussard_69c7efe354de6edea916a6eb, farming, 0.68).
skill(camille_broussard_69c7efe354de6edea916a6eb, cooking, 0.49).
skill(camille_broussard_69c7efe354de6edea916a6eb, medicine, 0.54).
skill(camille_broussard_69c7efe354de6edea916a6eb, teaching, 0.74).
skill(camille_broussard_69c7efe354de6edea916a6eb, diplomacy, 0.64).
skill(camille_broussard_69c7efe354de6edea916a6eb, combat, 0.69).
skill(camille_broussard_69c7efe354de6edea916a6eb, athletics, 0.83).
skill(camille_broussard_69c7efe354de6edea916a6eb, endurance, 0.58).
person(gabriel_guidry_69c7efe354de6edea916a6ed).
first_name(gabriel_guidry_69c7efe354de6edea916a6ed, 'Gabriel').
last_name(gabriel_guidry_69c7efe354de6edea916a6ed, 'Guidry').
age(gabriel_guidry_69c7efe354de6edea916a6ed, 49).
gender(gabriel_guidry_69c7efe354de6edea916a6ed, male).
occupation(gabriel_guidry_69c7efe354de6edea916a6ed, retired).
alive(gabriel_guidry_69c7efe354de6edea916a6ed).
personality(gabriel_guidry_69c7efe354de6edea916a6ed, openness, 0.9083660647686447).
personality(gabriel_guidry_69c7efe354de6edea916a6ed, conscientiousness, -0.8802825725902097).
personality(gabriel_guidry_69c7efe354de6edea916a6ed, extroversion, -0.33733589968368616).
personality(gabriel_guidry_69c7efe354de6edea916a6ed, agreeableness, -0.15987081822191174).
personality(gabriel_guidry_69c7efe354de6edea916a6ed, neuroticism, 0.38591731921345573).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, creativity, 0.81).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, music, 0.89).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, languages, 0.65).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, persuasion, 0.28).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, leadership, 0.28).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, trading, 0.25).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, medicine, 0.37).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, teaching, 0.31).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, diplomacy, 0.44).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, combat, 0.19).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, athletics, 0.34).
skill(gabriel_guidry_69c7efe354de6edea916a6ed, endurance, 0.3).
person(oc_ane_mouton_69c7efe354de6edea916a6ef).
first_name(oc_ane_mouton_69c7efe354de6edea916a6ef, 'Océane').
last_name(oc_ane_mouton_69c7efe354de6edea916a6ef, 'Mouton').
age(oc_ane_mouton_69c7efe354de6edea916a6ef, 61).
gender(oc_ane_mouton_69c7efe354de6edea916a6ef, female).
occupation(oc_ane_mouton_69c7efe354de6edea916a6ef, retired).
alive(oc_ane_mouton_69c7efe354de6edea916a6ef).
personality(oc_ane_mouton_69c7efe354de6edea916a6ef, openness, 0.8879806108325892).
personality(oc_ane_mouton_69c7efe354de6edea916a6ef, conscientiousness, -0.7900345036951162).
personality(oc_ane_mouton_69c7efe354de6edea916a6ef, extroversion, -0.2987132793831262).
personality(oc_ane_mouton_69c7efe354de6edea916a6ef, agreeableness, -0.05760997951448621).
personality(oc_ane_mouton_69c7efe354de6edea916a6ef, neuroticism, -0.9309169857720874).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, creativity, 0.76).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, music, 0.68).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, languages, 0.74).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, farming, 0.29).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, persuasion, 0.4).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, leadership, 0.17).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, trading, 0.44).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, medicine, 0.56).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, teaching, 0.41).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, diplomacy, 0.52).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, combat, 1).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, athletics, 1).
skill(oc_ane_mouton_69c7efe354de6edea916a6ef, endurance, 0.67).
person(aur_lie_trahan_69c7efe354de6edea916a6f1).
first_name(aur_lie_trahan_69c7efe354de6edea916a6f1, 'Aurélie').
last_name(aur_lie_trahan_69c7efe354de6edea916a6f1, 'Trahan').
age(aur_lie_trahan_69c7efe354de6edea916a6f1, 25).
gender(aur_lie_trahan_69c7efe354de6edea916a6f1, female).
occupation(aur_lie_trahan_69c7efe354de6edea916a6f1, laborer).
alive(aur_lie_trahan_69c7efe354de6edea916a6f1).
personality(aur_lie_trahan_69c7efe354de6edea916a6f1, openness, 0.32379192171976).
personality(aur_lie_trahan_69c7efe354de6edea916a6f1, conscientiousness, 0.19208934234269126).
personality(aur_lie_trahan_69c7efe354de6edea916a6f1, extroversion, -0.055955818672232205).
personality(aur_lie_trahan_69c7efe354de6edea916a6f1, agreeableness, 0.3556264171103294).
personality(aur_lie_trahan_69c7efe354de6edea916a6f1, neuroticism, 0.2794788988204342).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, creativity, 0.33).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, music, 0.27).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, languages, 0.35).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, crafting, 0.45).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, farming, 0.21).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, cooking, 0.17).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, persuasion, 0.41).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, leadership, 0.35).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, trading, 0.11).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, medicine, 0.5).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, teaching, 0.31).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, diplomacy, 0.39).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, combat, 0.23).
skill(aur_lie_trahan_69c7efe354de6edea916a6f1, endurance, 0.24).
person(sylvie_sonnier_69c7efe354de6edea916a6f3).
first_name(sylvie_sonnier_69c7efe354de6edea916a6f3, 'Sylvie').
last_name(sylvie_sonnier_69c7efe354de6edea916a6f3, 'Sonnier').
age(sylvie_sonnier_69c7efe354de6edea916a6f3, 35).
gender(sylvie_sonnier_69c7efe354de6edea916a6f3, female).
occupation(sylvie_sonnier_69c7efe354de6edea916a6f3, farmer).
alive(sylvie_sonnier_69c7efe354de6edea916a6f3).
personality(sylvie_sonnier_69c7efe354de6edea916a6f3, openness, 0.7390818637580687).
personality(sylvie_sonnier_69c7efe354de6edea916a6f3, conscientiousness, 0.059639983384307094).
personality(sylvie_sonnier_69c7efe354de6edea916a6f3, extroversion, -0.33838890717031456).
personality(sylvie_sonnier_69c7efe354de6edea916a6f3, agreeableness, 0.029103354274942372).
personality(sylvie_sonnier_69c7efe354de6edea916a6f3, neuroticism, -0.704191220184371).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, creativity, 0.7).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, music, 0.71).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, languages, 0.54).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, crafting, 0.38).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, farming, 0.52).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, cooking, 0.42).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, persuasion, 0.24).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, leadership, 0.24).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, trading, 0.1).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, medicine, 0.34).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, teaching, 0.19).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, diplomacy, 0.46).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, combat, 0.58).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, athletics, 0.82).
skill(sylvie_sonnier_69c7efe354de6edea916a6f3, endurance, 0.48).
person(jos_phine_romero_69c7efe354de6edea916a6f5).
first_name(jos_phine_romero_69c7efe354de6edea916a6f5, 'Joséphine').
last_name(jos_phine_romero_69c7efe354de6edea916a6f5, 'Romero').
age(jos_phine_romero_69c7efe354de6edea916a6f5, 38).
gender(jos_phine_romero_69c7efe354de6edea916a6f5, female).
occupation(jos_phine_romero_69c7efe354de6edea916a6f5, farmer).
alive(jos_phine_romero_69c7efe354de6edea916a6f5).
personality(jos_phine_romero_69c7efe354de6edea916a6f5, openness, 0.7242318516278066).
personality(jos_phine_romero_69c7efe354de6edea916a6f5, conscientiousness, -0.04390625599926512).
personality(jos_phine_romero_69c7efe354de6edea916a6f5, extroversion, -0.14705996588022652).
personality(jos_phine_romero_69c7efe354de6edea916a6f5, agreeableness, 0.8266243920761047).
personality(jos_phine_romero_69c7efe354de6edea916a6f5, neuroticism, 0.17985655730524286).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, creativity, 1).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, music, 0.82).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, languages, 0.72).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, crafting, 0.37).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, farming, 0.35).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, cooking, 0.25).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, persuasion, 0.38).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, leadership, 0.2).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, trading, 0.25).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, medicine, 0.81).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, teaching, 0.52).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, diplomacy, 0.58).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, combat, 0.53).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, athletics, 0.29).
skill(jos_phine_romero_69c7efe354de6edea916a6f5, endurance, 0.43).
person(jacques_mouton_69c7efe354de6edea916a6f7).
first_name(jacques_mouton_69c7efe354de6edea916a6f7, 'Jacques').
last_name(jacques_mouton_69c7efe354de6edea916a6f7, 'Mouton').
age(jacques_mouton_69c7efe354de6edea916a6f7, 42).
gender(jacques_mouton_69c7efe354de6edea916a6f7, male).
occupation(jacques_mouton_69c7efe354de6edea916a6f7, retired).
alive(jacques_mouton_69c7efe354de6edea916a6f7).
personality(jacques_mouton_69c7efe354de6edea916a6f7, openness, -0.9719804839844968).
personality(jacques_mouton_69c7efe354de6edea916a6f7, conscientiousness, 0.740236834383142).
personality(jacques_mouton_69c7efe354de6edea916a6f7, extroversion, -0.9456701617378771).
personality(jacques_mouton_69c7efe354de6edea916a6f7, agreeableness, 0.1965554366925848).
personality(jacques_mouton_69c7efe354de6edea916a6f7, neuroticism, 0.4393470658695362).
skill(jacques_mouton_69c7efe354de6edea916a6f7, creativity, 0.14).
skill(jacques_mouton_69c7efe354de6edea916a6f7, crafting, 0.88).
skill(jacques_mouton_69c7efe354de6edea916a6f7, farming, 0.6).
skill(jacques_mouton_69c7efe354de6edea916a6f7, cooking, 0.78).
skill(jacques_mouton_69c7efe354de6edea916a6f7, medicine, 0.76).
skill(jacques_mouton_69c7efe354de6edea916a6f7, teaching, 0.47).
skill(jacques_mouton_69c7efe354de6edea916a6f7, diplomacy, 0.31).
skill(jacques_mouton_69c7efe354de6edea916a6f7, athletics, 0.44).
skill(jacques_mouton_69c7efe354de6edea916a6f7, endurance, 0.3).
person(madeleine_bourgeois_69c7efe354de6edea916a6f9).
first_name(madeleine_bourgeois_69c7efe354de6edea916a6f9, 'Madeleine').
last_name(madeleine_bourgeois_69c7efe354de6edea916a6f9, 'Bourgeois').
age(madeleine_bourgeois_69c7efe354de6edea916a6f9, 24).
gender(madeleine_bourgeois_69c7efe354de6edea916a6f9, female).
occupation(madeleine_bourgeois_69c7efe354de6edea916a6f9, farmhand).
alive(madeleine_bourgeois_69c7efe354de6edea916a6f9).
personality(madeleine_bourgeois_69c7efe354de6edea916a6f9, openness, -0.12002685659627232).
personality(madeleine_bourgeois_69c7efe354de6edea916a6f9, conscientiousness, -0.7295791042398849).
personality(madeleine_bourgeois_69c7efe354de6edea916a6f9, extroversion, -0.04679556913696992).
personality(madeleine_bourgeois_69c7efe354de6edea916a6f9, agreeableness, 0.5749107757919454).
personality(madeleine_bourgeois_69c7efe354de6edea916a6f9, neuroticism, 0.39022875056040407).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, creativity, 0.16).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, music, 0.17).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, languages, 0.25).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, crafting, 0.16).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, persuasion, 0.28).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, leadership, 0.2).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, trading, 0.16).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, medicine, 0.38).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, teaching, 0.28).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, diplomacy, 0.45).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, combat, 0.29).
skill(madeleine_bourgeois_69c7efe354de6edea916a6f9, athletics, 0.21).
person(c_cile_aucoin_69c7efe354de6edea916a6fb).
first_name(c_cile_aucoin_69c7efe354de6edea916a6fb, 'Cécile').
last_name(c_cile_aucoin_69c7efe354de6edea916a6fb, 'Aucoin').
age(c_cile_aucoin_69c7efe354de6edea916a6fb, 43).
gender(c_cile_aucoin_69c7efe354de6edea916a6fb, female).
occupation(c_cile_aucoin_69c7efe354de6edea916a6fb, retired).
alive(c_cile_aucoin_69c7efe354de6edea916a6fb).
personality(c_cile_aucoin_69c7efe354de6edea916a6fb, openness, -0.8581898900564289).
personality(c_cile_aucoin_69c7efe354de6edea916a6fb, conscientiousness, 0.10967399028174096).
personality(c_cile_aucoin_69c7efe354de6edea916a6fb, extroversion, -0.790241115762139).
personality(c_cile_aucoin_69c7efe354de6edea916a6fb, agreeableness, -0.3305752859475466).
personality(c_cile_aucoin_69c7efe354de6edea916a6fb, neuroticism, 0.9832278962007059).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, languages, 0.18).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, crafting, 0.48).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, farming, 0.67).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, cooking, 0.55).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, persuasion, 0.22).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, leadership, 0.21).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, trading, 0.25).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, medicine, 0.38).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, teaching, 0.24).
skill(c_cile_aucoin_69c7efe354de6edea916a6fb, athletics, 0.11).
person(fran_ois_savoie_69c7efe354de6edea916a6fd).
first_name(fran_ois_savoie_69c7efe354de6edea916a6fd, 'François').
last_name(fran_ois_savoie_69c7efe354de6edea916a6fd, 'Savoie').
age(fran_ois_savoie_69c7efe354de6edea916a6fd, 45).
gender(fran_ois_savoie_69c7efe354de6edea916a6fd, male).
occupation(fran_ois_savoie_69c7efe354de6edea916a6fd, retired).
alive(fran_ois_savoie_69c7efe354de6edea916a6fd).
personality(fran_ois_savoie_69c7efe354de6edea916a6fd, openness, -0.2139423066108299).
personality(fran_ois_savoie_69c7efe354de6edea916a6fd, conscientiousness, 0.6511383461792577).
personality(fran_ois_savoie_69c7efe354de6edea916a6fd, extroversion, 0.6013075068584421).
personality(fran_ois_savoie_69c7efe354de6edea916a6fd, agreeableness, 0.3182758605777303).
personality(fran_ois_savoie_69c7efe354de6edea916a6fd, neuroticism, -0.5410224507028949).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, creativity, 0.43).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, music, 0.25).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, languages, 0.12).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, crafting, 1).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, farming, 0.92).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, cooking, 0.49).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, persuasion, 0.79).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, leadership, 0.55).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, trading, 0.72).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, medicine, 0.81).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, teaching, 0.63).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, diplomacy, 0.27).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, combat, 0.88).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, athletics, 0.65).
skill(fran_ois_savoie_69c7efe354de6edea916a6fd, endurance, 0.53).
person(ad_la_de_doucet_69c7efe354de6edea916a6ff).
first_name(ad_la_de_doucet_69c7efe354de6edea916a6ff, 'Adélaïde').
last_name(ad_la_de_doucet_69c7efe354de6edea916a6ff, 'Doucet').
age(ad_la_de_doucet_69c7efe354de6edea916a6ff, 32).
gender(ad_la_de_doucet_69c7efe354de6edea916a6ff, female).
occupation(ad_la_de_doucet_69c7efe354de6edea916a6ff, farmer).
alive(ad_la_de_doucet_69c7efe354de6edea916a6ff).
personality(ad_la_de_doucet_69c7efe354de6edea916a6ff, openness, -0.5412463806746666).
personality(ad_la_de_doucet_69c7efe354de6edea916a6ff, conscientiousness, -0.8124276544936548).
personality(ad_la_de_doucet_69c7efe354de6edea916a6ff, extroversion, -0.12794606653447183).
personality(ad_la_de_doucet_69c7efe354de6edea916a6ff, agreeableness, 0.38551372920324134).
personality(ad_la_de_doucet_69c7efe354de6edea916a6ff, neuroticism, -0.22352534752236686).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, creativity, 0.2).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, music, 0.15).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, languages, 0.15).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, persuasion, 0.24).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, leadership, 0.34).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, trading, 0.36).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, medicine, 0.6).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, teaching, 0.52).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, diplomacy, 0.5).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, combat, 0.4).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, athletics, 0.59).
skill(ad_la_de_doucet_69c7efe354de6edea916a6ff, endurance, 0.48).
person(henri_cormier_69c7efe354de6edea916a701).
first_name(henri_cormier_69c7efe354de6edea916a701, 'Henri').
last_name(henri_cormier_69c7efe354de6edea916a701, 'Cormier').
age(henri_cormier_69c7efe354de6edea916a701, 62).
gender(henri_cormier_69c7efe354de6edea916a701, male).
occupation(henri_cormier_69c7efe354de6edea916a701, retired).
alive(henri_cormier_69c7efe354de6edea916a701).
personality(henri_cormier_69c7efe354de6edea916a701, openness, -0.8714761327238985).
personality(henri_cormier_69c7efe354de6edea916a701, conscientiousness, -0.8167376577358243).
personality(henri_cormier_69c7efe354de6edea916a701, extroversion, 0.6717142639568507).
personality(henri_cormier_69c7efe354de6edea916a701, agreeableness, -0.9271469601780113).
personality(henri_cormier_69c7efe354de6edea916a701, neuroticism, -0.8604677194167043).
skill(henri_cormier_69c7efe354de6edea916a701, music, 0.13).
skill(henri_cormier_69c7efe354de6edea916a701, languages, 0.11).
skill(henri_cormier_69c7efe354de6edea916a701, crafting, 0.21).
skill(henri_cormier_69c7efe354de6edea916a701, persuasion, 0.72).
skill(henri_cormier_69c7efe354de6edea916a701, leadership, 0.59).
skill(henri_cormier_69c7efe354de6edea916a701, trading, 0.55).
skill(henri_cormier_69c7efe354de6edea916a701, combat, 0.93).
skill(henri_cormier_69c7efe354de6edea916a701, athletics, 1).
skill(henri_cormier_69c7efe354de6edea916a701, endurance, 0.78).
person(augustin_doucet_69c7efe354de6edea916a703).
first_name(augustin_doucet_69c7efe354de6edea916a703, 'Augustin').
last_name(augustin_doucet_69c7efe354de6edea916a703, 'Doucet').
age(augustin_doucet_69c7efe354de6edea916a703, 45).
gender(augustin_doucet_69c7efe354de6edea916a703, male).
occupation(augustin_doucet_69c7efe354de6edea916a703, retired).
alive(augustin_doucet_69c7efe354de6edea916a703).
personality(augustin_doucet_69c7efe354de6edea916a703, openness, -0.8047911846925486).
personality(augustin_doucet_69c7efe354de6edea916a703, conscientiousness, 0.1861391243266617).
personality(augustin_doucet_69c7efe354de6edea916a703, extroversion, 0.30503133697837326).
personality(augustin_doucet_69c7efe354de6edea916a703, agreeableness, -0.5719475689608058).
personality(augustin_doucet_69c7efe354de6edea916a703, neuroticism, 0.53733547499735).
skill(augustin_doucet_69c7efe354de6edea916a703, creativity, 0.13).
skill(augustin_doucet_69c7efe354de6edea916a703, languages, 0.13).
skill(augustin_doucet_69c7efe354de6edea916a703, crafting, 0.62).
skill(augustin_doucet_69c7efe354de6edea916a703, farming, 0.51).
skill(augustin_doucet_69c7efe354de6edea916a703, cooking, 0.43).
skill(augustin_doucet_69c7efe354de6edea916a703, persuasion, 0.65).
skill(augustin_doucet_69c7efe354de6edea916a703, leadership, 0.71).
skill(augustin_doucet_69c7efe354de6edea916a703, trading, 0.56).
skill(augustin_doucet_69c7efe354de6edea916a703, medicine, 0.13).
skill(augustin_doucet_69c7efe354de6edea916a703, teaching, 0.22).
skill(augustin_doucet_69c7efe354de6edea916a703, combat, 0.2).
skill(augustin_doucet_69c7efe354de6edea916a703, athletics, 0.29).
skill(augustin_doucet_69c7efe354de6edea916a703, endurance, 0.36).
person(claude_trahan_69c7efe354de6edea916a705).
first_name(claude_trahan_69c7efe354de6edea916a705, 'Claude').
last_name(claude_trahan_69c7efe354de6edea916a705, 'Trahan').
age(claude_trahan_69c7efe354de6edea916a705, 21).
gender(claude_trahan_69c7efe354de6edea916a705, male).
occupation(claude_trahan_69c7efe354de6edea916a705, cashier).
alive(claude_trahan_69c7efe354de6edea916a705).
personality(claude_trahan_69c7efe354de6edea916a705, openness, -0.5683327134503999).
personality(claude_trahan_69c7efe354de6edea916a705, conscientiousness, -0.24436086100188836).
personality(claude_trahan_69c7efe354de6edea916a705, extroversion, 0.3362927408438625).
personality(claude_trahan_69c7efe354de6edea916a705, agreeableness, 0.1793750201133575).
personality(claude_trahan_69c7efe354de6edea916a705, neuroticism, -0.22841802310249015).
skill(claude_trahan_69c7efe354de6edea916a705, creativity, 0.16).
skill(claude_trahan_69c7efe354de6edea916a705, crafting, 0.19).
skill(claude_trahan_69c7efe354de6edea916a705, farming, 0.28).
skill(claude_trahan_69c7efe354de6edea916a705, cooking, 0.11).
skill(claude_trahan_69c7efe354de6edea916a705, persuasion, 0.4).
skill(claude_trahan_69c7efe354de6edea916a705, leadership, 0.2).
skill(claude_trahan_69c7efe354de6edea916a705, trading, 0.34).
skill(claude_trahan_69c7efe354de6edea916a705, medicine, 0.24).
skill(claude_trahan_69c7efe354de6edea916a705, teaching, 0.22).
skill(claude_trahan_69c7efe354de6edea916a705, diplomacy, 0.2).
skill(claude_trahan_69c7efe354de6edea916a705, combat, 0.3).
skill(claude_trahan_69c7efe354de6edea916a705, athletics, 0.24).
skill(claude_trahan_69c7efe354de6edea916a705, endurance, 0.33).
person(luc_breaux_69c7efe354de6edea916a707).
first_name(luc_breaux_69c7efe354de6edea916a707, 'Luc').
last_name(luc_breaux_69c7efe354de6edea916a707, 'Breaux').
age(luc_breaux_69c7efe354de6edea916a707, 30).
gender(luc_breaux_69c7efe354de6edea916a707, male).
occupation(luc_breaux_69c7efe354de6edea916a707, farmhand).
alive(luc_breaux_69c7efe354de6edea916a707).
personality(luc_breaux_69c7efe354de6edea916a707, openness, -0.09170033826771284).
personality(luc_breaux_69c7efe354de6edea916a707, conscientiousness, 0.9775769122820619).
personality(luc_breaux_69c7efe354de6edea916a707, extroversion, 0.26420430159172614).
personality(luc_breaux_69c7efe354de6edea916a707, agreeableness, -0.24455803981180724).
personality(luc_breaux_69c7efe354de6edea916a707, neuroticism, -0.7513356518775933).
skill(luc_breaux_69c7efe354de6edea916a707, creativity, 0.41).
skill(luc_breaux_69c7efe354de6edea916a707, music, 0.14).
skill(luc_breaux_69c7efe354de6edea916a707, languages, 0.33).
skill(luc_breaux_69c7efe354de6edea916a707, crafting, 0.87).
skill(luc_breaux_69c7efe354de6edea916a707, farming, 0.78).
skill(luc_breaux_69c7efe354de6edea916a707, cooking, 0.45).
skill(luc_breaux_69c7efe354de6edea916a707, persuasion, 0.33).
skill(luc_breaux_69c7efe354de6edea916a707, leadership, 0.47).
skill(luc_breaux_69c7efe354de6edea916a707, trading, 0.19).
skill(luc_breaux_69c7efe354de6edea916a707, medicine, 0.25).
skill(luc_breaux_69c7efe354de6edea916a707, teaching, 0.3).
skill(luc_breaux_69c7efe354de6edea916a707, diplomacy, 0.17).
skill(luc_breaux_69c7efe354de6edea916a707, combat, 0.77).
skill(luc_breaux_69c7efe354de6edea916a707, athletics, 0.53).
skill(luc_breaux_69c7efe354de6edea916a707, endurance, 0.48).
person(corinne_lemaire_69c7efe354de6edea916a709).
first_name(corinne_lemaire_69c7efe354de6edea916a709, 'Corinne').
last_name(corinne_lemaire_69c7efe354de6edea916a709, 'Lemaire').
age(corinne_lemaire_69c7efe354de6edea916a709, 48).
gender(corinne_lemaire_69c7efe354de6edea916a709, female).
occupation(corinne_lemaire_69c7efe354de6edea916a709, retired).
alive(corinne_lemaire_69c7efe354de6edea916a709).
personality(corinne_lemaire_69c7efe354de6edea916a709, openness, 0.3133932046986785).
personality(corinne_lemaire_69c7efe354de6edea916a709, conscientiousness, -0.7134163070158568).
personality(corinne_lemaire_69c7efe354de6edea916a709, extroversion, -0.30007938561455205).
personality(corinne_lemaire_69c7efe354de6edea916a709, agreeableness, -0.3759469512406355).
personality(corinne_lemaire_69c7efe354de6edea916a709, neuroticism, -0.971483448693522).
skill(corinne_lemaire_69c7efe354de6edea916a709, creativity, 0.77).
skill(corinne_lemaire_69c7efe354de6edea916a709, music, 0.37).
skill(corinne_lemaire_69c7efe354de6edea916a709, languages, 0.35).
skill(corinne_lemaire_69c7efe354de6edea916a709, crafting, 0.18).
skill(corinne_lemaire_69c7efe354de6edea916a709, cooking, 0.15).
skill(corinne_lemaire_69c7efe354de6edea916a709, persuasion, 0.44).
skill(corinne_lemaire_69c7efe354de6edea916a709, leadership, 0.19).
skill(corinne_lemaire_69c7efe354de6edea916a709, trading, 0.37).
skill(corinne_lemaire_69c7efe354de6edea916a709, medicine, 0.25).
skill(corinne_lemaire_69c7efe354de6edea916a709, combat, 0.96).
skill(corinne_lemaire_69c7efe354de6edea916a709, athletics, 0.92).
skill(corinne_lemaire_69c7efe354de6edea916a709, endurance, 0.6).
person(no_mie_moreau_69c7efe354de6edea916a70b).
first_name(no_mie_moreau_69c7efe354de6edea916a70b, 'Noémie').
last_name(no_mie_moreau_69c7efe354de6edea916a70b, 'Moreau').
age(no_mie_moreau_69c7efe354de6edea916a70b, 32).
gender(no_mie_moreau_69c7efe354de6edea916a70b, female).
occupation(no_mie_moreau_69c7efe354de6edea916a70b, laborer).
alive(no_mie_moreau_69c7efe354de6edea916a70b).
personality(no_mie_moreau_69c7efe354de6edea916a70b, openness, 0.7441459961815062).
personality(no_mie_moreau_69c7efe354de6edea916a70b, conscientiousness, -0.2381177115870412).
personality(no_mie_moreau_69c7efe354de6edea916a70b, extroversion, -0.663669446680494).
personality(no_mie_moreau_69c7efe354de6edea916a70b, agreeableness, 0.31502697137810953).
personality(no_mie_moreau_69c7efe354de6edea916a70b, neuroticism, 0.9180971298859717).
skill(no_mie_moreau_69c7efe354de6edea916a70b, creativity, 0.8).
skill(no_mie_moreau_69c7efe354de6edea916a70b, music, 0.49).
skill(no_mie_moreau_69c7efe354de6edea916a70b, languages, 0.4).
skill(no_mie_moreau_69c7efe354de6edea916a70b, crafting, 0.41).
skill(no_mie_moreau_69c7efe354de6edea916a70b, farming, 0.21).
skill(no_mie_moreau_69c7efe354de6edea916a70b, cooking, 0.3).
skill(no_mie_moreau_69c7efe354de6edea916a70b, persuasion, 0.16).
skill(no_mie_moreau_69c7efe354de6edea916a70b, medicine, 0.52).
skill(no_mie_moreau_69c7efe354de6edea916a70b, teaching, 0.36).
skill(no_mie_moreau_69c7efe354de6edea916a70b, diplomacy, 0.34).
person(marcel_bergeron_69c7efe354de6edea916a70d).
first_name(marcel_bergeron_69c7efe354de6edea916a70d, 'Marcel').
last_name(marcel_bergeron_69c7efe354de6edea916a70d, 'Bergeron').
age(marcel_bergeron_69c7efe354de6edea916a70d, 46).
gender(marcel_bergeron_69c7efe354de6edea916a70d, male).
occupation(marcel_bergeron_69c7efe354de6edea916a70d, retired).
alive(marcel_bergeron_69c7efe354de6edea916a70d).
personality(marcel_bergeron_69c7efe354de6edea916a70d, openness, -0.40464771947473643).
personality(marcel_bergeron_69c7efe354de6edea916a70d, conscientiousness, -0.9863803814791665).
personality(marcel_bergeron_69c7efe354de6edea916a70d, extroversion, 0.40849995032235764).
personality(marcel_bergeron_69c7efe354de6edea916a70d, agreeableness, 0.11448031227656852).
personality(marcel_bergeron_69c7efe354de6edea916a70d, neuroticism, 0.08888308848843973).
skill(marcel_bergeron_69c7efe354de6edea916a70d, creativity, 0.32).
skill(marcel_bergeron_69c7efe354de6edea916a70d, music, 0.16).
skill(marcel_bergeron_69c7efe354de6edea916a70d, languages, 0.18).
skill(marcel_bergeron_69c7efe354de6edea916a70d, crafting, 0.19).
skill(marcel_bergeron_69c7efe354de6edea916a70d, persuasion, 0.66).
skill(marcel_bergeron_69c7efe354de6edea916a70d, leadership, 0.72).
skill(marcel_bergeron_69c7efe354de6edea916a70d, trading, 0.63).
skill(marcel_bergeron_69c7efe354de6edea916a70d, medicine, 0.6).
skill(marcel_bergeron_69c7efe354de6edea916a70d, teaching, 0.36).
skill(marcel_bergeron_69c7efe354de6edea916a70d, diplomacy, 0.48).
skill(marcel_bergeron_69c7efe354de6edea916a70d, combat, 0.61).
skill(marcel_bergeron_69c7efe354de6edea916a70d, athletics, 0.22).
skill(marcel_bergeron_69c7efe354de6edea916a70d, endurance, 0.41).
person(val_rie_dubois_69c7efe354de6edea916a70f).
first_name(val_rie_dubois_69c7efe354de6edea916a70f, 'Valérie').
last_name(val_rie_dubois_69c7efe354de6edea916a70f, 'Dubois').
age(val_rie_dubois_69c7efe354de6edea916a70f, 21).
gender(val_rie_dubois_69c7efe354de6edea916a70f, female).
occupation(val_rie_dubois_69c7efe354de6edea916a70f, owner_shop).
alive(val_rie_dubois_69c7efe354de6edea916a70f).
personality(val_rie_dubois_69c7efe354de6edea916a70f, openness, -0.6699527159977108).
personality(val_rie_dubois_69c7efe354de6edea916a70f, conscientiousness, 0.7136780955109461).
personality(val_rie_dubois_69c7efe354de6edea916a70f, extroversion, -0.4375155655717804).
personality(val_rie_dubois_69c7efe354de6edea916a70f, agreeableness, -0.20670962969428697).
personality(val_rie_dubois_69c7efe354de6edea916a70f, neuroticism, 0.5184662045539379).
skill(val_rie_dubois_69c7efe354de6edea916a70f, crafting, 0.54).
skill(val_rie_dubois_69c7efe354de6edea916a70f, farming, 0.46).
skill(val_rie_dubois_69c7efe354de6edea916a70f, cooking, 0.31).
skill(val_rie_dubois_69c7efe354de6edea916a70f, persuasion, 0.11).
skill(val_rie_dubois_69c7efe354de6edea916a70f, trading, 0.11).
skill(val_rie_dubois_69c7efe354de6edea916a70f, medicine, 0.28).
skill(val_rie_dubois_69c7efe354de6edea916a70f, teaching, 0.23).
person(b_atrice_laurent_69c7efe354de6edea916a711).
first_name(b_atrice_laurent_69c7efe354de6edea916a711, 'Béatrice').
last_name(b_atrice_laurent_69c7efe354de6edea916a711, 'Laurent').
age(b_atrice_laurent_69c7efe354de6edea916a711, 42).
gender(b_atrice_laurent_69c7efe354de6edea916a711, female).
occupation(b_atrice_laurent_69c7efe354de6edea916a711, retired).
alive(b_atrice_laurent_69c7efe354de6edea916a711).
personality(b_atrice_laurent_69c7efe354de6edea916a711, openness, -0.3117209543453541).
personality(b_atrice_laurent_69c7efe354de6edea916a711, conscientiousness, -0.3608225538049892).
personality(b_atrice_laurent_69c7efe354de6edea916a711, extroversion, 0.7367987255801336).
personality(b_atrice_laurent_69c7efe354de6edea916a711, agreeableness, -0.4670148383323922).
personality(b_atrice_laurent_69c7efe354de6edea916a711, neuroticism, -0.5150149721739532).
skill(b_atrice_laurent_69c7efe354de6edea916a711, creativity, 0.43).
skill(b_atrice_laurent_69c7efe354de6edea916a711, music, 0.36).
skill(b_atrice_laurent_69c7efe354de6edea916a711, languages, 0.18).
skill(b_atrice_laurent_69c7efe354de6edea916a711, crafting, 0.42).
skill(b_atrice_laurent_69c7efe354de6edea916a711, farming, 0.32).
skill(b_atrice_laurent_69c7efe354de6edea916a711, cooking, 0.16).
skill(b_atrice_laurent_69c7efe354de6edea916a711, persuasion, 1).
skill(b_atrice_laurent_69c7efe354de6edea916a711, leadership, 0.84).
skill(b_atrice_laurent_69c7efe354de6edea916a711, trading, 0.47).
skill(b_atrice_laurent_69c7efe354de6edea916a711, medicine, 0.43).
skill(b_atrice_laurent_69c7efe354de6edea916a711, teaching, 0.28).
skill(b_atrice_laurent_69c7efe354de6edea916a711, diplomacy, 0.28).
skill(b_atrice_laurent_69c7efe354de6edea916a711, combat, 0.61).
skill(b_atrice_laurent_69c7efe354de6edea916a711, athletics, 0.61).
skill(b_atrice_laurent_69c7efe354de6edea916a711, endurance, 0.53).
person(victor_chauvin_69c7efe354de6edea916a713).
first_name(victor_chauvin_69c7efe354de6edea916a713, 'Victor').
last_name(victor_chauvin_69c7efe354de6edea916a713, 'Chauvin').
age(victor_chauvin_69c7efe354de6edea916a713, 39).
gender(victor_chauvin_69c7efe354de6edea916a713, male).
occupation(victor_chauvin_69c7efe354de6edea916a713, worker).
alive(victor_chauvin_69c7efe354de6edea916a713).
personality(victor_chauvin_69c7efe354de6edea916a713, openness, 0.9034025125058092).
personality(victor_chauvin_69c7efe354de6edea916a713, conscientiousness, -0.9484971626221976).
personality(victor_chauvin_69c7efe354de6edea916a713, extroversion, -0.6637263612413209).
personality(victor_chauvin_69c7efe354de6edea916a713, agreeableness, -0.07417455770424208).
personality(victor_chauvin_69c7efe354de6edea916a713, neuroticism, -0.06357832780137329).
skill(victor_chauvin_69c7efe354de6edea916a713, creativity, 0.77).
skill(victor_chauvin_69c7efe354de6edea916a713, music, 0.85).
skill(victor_chauvin_69c7efe354de6edea916a713, languages, 0.84).
skill(victor_chauvin_69c7efe354de6edea916a713, persuasion, 0.16).
skill(victor_chauvin_69c7efe354de6edea916a713, leadership, 0.16).
skill(victor_chauvin_69c7efe354de6edea916a713, medicine, 0.54).
skill(victor_chauvin_69c7efe354de6edea916a713, teaching, 0.18).
skill(victor_chauvin_69c7efe354de6edea916a713, diplomacy, 0.37).
skill(victor_chauvin_69c7efe354de6edea916a713, combat, 0.45).
skill(victor_chauvin_69c7efe354de6edea916a713, athletics, 0.33).
skill(victor_chauvin_69c7efe354de6edea916a713, endurance, 0.4).
person(ren_boudreaux_69c7efe354de6edea916a715).
first_name(ren_boudreaux_69c7efe354de6edea916a715, 'René').
last_name(ren_boudreaux_69c7efe354de6edea916a715, 'Boudreaux').
age(ren_boudreaux_69c7efe354de6edea916a715, 42).
gender(ren_boudreaux_69c7efe354de6edea916a715, male).
occupation(ren_boudreaux_69c7efe354de6edea916a715, retired).
alive(ren_boudreaux_69c7efe354de6edea916a715).
personality(ren_boudreaux_69c7efe354de6edea916a715, openness, 0.04709302510438462).
personality(ren_boudreaux_69c7efe354de6edea916a715, conscientiousness, 0.9406719130199606).
personality(ren_boudreaux_69c7efe354de6edea916a715, extroversion, 0.7393111295579513).
personality(ren_boudreaux_69c7efe354de6edea916a715, agreeableness, -0.08053032731030862).
personality(ren_boudreaux_69c7efe354de6edea916a715, neuroticism, -0.5261579531138616).
skill(ren_boudreaux_69c7efe354de6edea916a715, creativity, 0.66).
skill(ren_boudreaux_69c7efe354de6edea916a715, music, 0.61).
skill(ren_boudreaux_69c7efe354de6edea916a715, languages, 0.4).
skill(ren_boudreaux_69c7efe354de6edea916a715, crafting, 0.86).
skill(ren_boudreaux_69c7efe354de6edea916a715, farming, 0.93).
skill(ren_boudreaux_69c7efe354de6edea916a715, cooking, 0.57).
skill(ren_boudreaux_69c7efe354de6edea916a715, persuasion, 0.82).
skill(ren_boudreaux_69c7efe354de6edea916a715, leadership, 0.63).
skill(ren_boudreaux_69c7efe354de6edea916a715, trading, 0.78).
skill(ren_boudreaux_69c7efe354de6edea916a715, medicine, 0.36).
skill(ren_boudreaux_69c7efe354de6edea916a715, teaching, 0.51).
skill(ren_boudreaux_69c7efe354de6edea916a715, diplomacy, 0.32).
skill(ren_boudreaux_69c7efe354de6edea916a715, combat, 0.82).
skill(ren_boudreaux_69c7efe354de6edea916a715, athletics, 0.7).
skill(ren_boudreaux_69c7efe354de6edea916a715, endurance, 0.59).
person(l_on_delacroix_69c7efe354de6edea916a717).
first_name(l_on_delacroix_69c7efe354de6edea916a717, 'Léon').
last_name(l_on_delacroix_69c7efe354de6edea916a717, 'Delacroix').
age(l_on_delacroix_69c7efe354de6edea916a717, 52).
gender(l_on_delacroix_69c7efe354de6edea916a717, male).
occupation(l_on_delacroix_69c7efe354de6edea916a717, retired).
alive(l_on_delacroix_69c7efe354de6edea916a717).
personality(l_on_delacroix_69c7efe354de6edea916a717, openness, 0.17125442708087046).
personality(l_on_delacroix_69c7efe354de6edea916a717, conscientiousness, -0.5287221843534802).
personality(l_on_delacroix_69c7efe354de6edea916a717, extroversion, 0.8329942851801886).
personality(l_on_delacroix_69c7efe354de6edea916a717, agreeableness, 0.844220454580344).
personality(l_on_delacroix_69c7efe354de6edea916a717, neuroticism, 0.3384730050018283).
skill(l_on_delacroix_69c7efe354de6edea916a717, creativity, 0.71).
skill(l_on_delacroix_69c7efe354de6edea916a717, music, 0.43).
skill(l_on_delacroix_69c7efe354de6edea916a717, languages, 0.59).
skill(l_on_delacroix_69c7efe354de6edea916a717, crafting, 0.33).
skill(l_on_delacroix_69c7efe354de6edea916a717, farming, 0.11).
skill(l_on_delacroix_69c7efe354de6edea916a717, cooking, 0.11).
skill(l_on_delacroix_69c7efe354de6edea916a717, persuasion, 0.91).
skill(l_on_delacroix_69c7efe354de6edea916a717, leadership, 0.76).
skill(l_on_delacroix_69c7efe354de6edea916a717, trading, 0.58).
skill(l_on_delacroix_69c7efe354de6edea916a717, medicine, 0.74).
skill(l_on_delacroix_69c7efe354de6edea916a717, teaching, 0.65).
skill(l_on_delacroix_69c7efe354de6edea916a717, diplomacy, 0.56).
skill(l_on_delacroix_69c7efe354de6edea916a717, combat, 0.45).
skill(l_on_delacroix_69c7efe354de6edea916a717, athletics, 0.47).
skill(l_on_delacroix_69c7efe354de6edea916a717, endurance, 0.25).
person(_meline_fournier_69c7efe354de6edea916a719).
first_name(_meline_fournier_69c7efe354de6edea916a719, 'Émeline').
last_name(_meline_fournier_69c7efe354de6edea916a719, 'Fournier').
age(_meline_fournier_69c7efe354de6edea916a719, 25).
gender(_meline_fournier_69c7efe354de6edea916a719, female).
occupation(_meline_fournier_69c7efe354de6edea916a719, farmer).
alive(_meline_fournier_69c7efe354de6edea916a719).
personality(_meline_fournier_69c7efe354de6edea916a719, openness, -0.5976096605870063).
personality(_meline_fournier_69c7efe354de6edea916a719, conscientiousness, -0.6035553982428277).
personality(_meline_fournier_69c7efe354de6edea916a719, extroversion, -0.01806032978119454).
personality(_meline_fournier_69c7efe354de6edea916a719, agreeableness, 0.9129309019346619).
personality(_meline_fournier_69c7efe354de6edea916a719, neuroticism, -0.5941224744552978).
skill(_meline_fournier_69c7efe354de6edea916a719, creativity, 0.25).
skill(_meline_fournier_69c7efe354de6edea916a719, crafting, 0.22).
skill(_meline_fournier_69c7efe354de6edea916a719, farming, 0.14).
skill(_meline_fournier_69c7efe354de6edea916a719, persuasion, 0.36).
skill(_meline_fournier_69c7efe354de6edea916a719, leadership, 0.34).
skill(_meline_fournier_69c7efe354de6edea916a719, trading, 0.18).
skill(_meline_fournier_69c7efe354de6edea916a719, medicine, 0.58).
skill(_meline_fournier_69c7efe354de6edea916a719, teaching, 0.43).
skill(_meline_fournier_69c7efe354de6edea916a719, diplomacy, 0.38).
skill(_meline_fournier_69c7efe354de6edea916a719, combat, 0.55).
skill(_meline_fournier_69c7efe354de6edea916a719, athletics, 0.54).
skill(_meline_fournier_69c7efe354de6edea916a719, endurance, 0.44).
person(solange_perrin_69c7efe354de6edea916a71b).
first_name(solange_perrin_69c7efe354de6edea916a71b, 'Solange').
last_name(solange_perrin_69c7efe354de6edea916a71b, 'Perrin').
age(solange_perrin_69c7efe354de6edea916a71b, 22).
gender(solange_perrin_69c7efe354de6edea916a71b, female).
occupation(solange_perrin_69c7efe354de6edea916a71b, worker).
alive(solange_perrin_69c7efe354de6edea916a71b).
personality(solange_perrin_69c7efe354de6edea916a71b, openness, 0.6833013030643609).
personality(solange_perrin_69c7efe354de6edea916a71b, conscientiousness, -0.5005931976174169).
personality(solange_perrin_69c7efe354de6edea916a71b, extroversion, -0.596819196820479).
personality(solange_perrin_69c7efe354de6edea916a71b, agreeableness, 0.09562408951224732).
personality(solange_perrin_69c7efe354de6edea916a71b, neuroticism, 0.027865227513035773).
skill(solange_perrin_69c7efe354de6edea916a71b, creativity, 0.52).
skill(solange_perrin_69c7efe354de6edea916a71b, music, 0.48).
skill(solange_perrin_69c7efe354de6edea916a71b, languages, 0.26).
skill(solange_perrin_69c7efe354de6edea916a71b, crafting, 0.14).
skill(solange_perrin_69c7efe354de6edea916a71b, farming, 0.1).
skill(solange_perrin_69c7efe354de6edea916a71b, persuasion, 0.18).
skill(solange_perrin_69c7efe354de6edea916a71b, medicine, 0.4).
skill(solange_perrin_69c7efe354de6edea916a71b, teaching, 0.26).
skill(solange_perrin_69c7efe354de6edea916a71b, diplomacy, 0.2).
skill(solange_perrin_69c7efe354de6edea916a71b, combat, 0.22).
skill(solange_perrin_69c7efe354de6edea916a71b, athletics, 0.24).
skill(solange_perrin_69c7efe354de6edea916a71b, endurance, 0.27).
person(v_ronique_gauthier_69c7efe354de6edea916a71d).
first_name(v_ronique_gauthier_69c7efe354de6edea916a71d, 'Véronique').
last_name(v_ronique_gauthier_69c7efe354de6edea916a71d, 'Gauthier').
age(v_ronique_gauthier_69c7efe354de6edea916a71d, 20).
gender(v_ronique_gauthier_69c7efe354de6edea916a71d, female).
occupation(v_ronique_gauthier_69c7efe354de6edea916a71d, farmer).
alive(v_ronique_gauthier_69c7efe354de6edea916a71d).
personality(v_ronique_gauthier_69c7efe354de6edea916a71d, openness, -0.2178352310985776).
personality(v_ronique_gauthier_69c7efe354de6edea916a71d, conscientiousness, 0.3419672890871066).
personality(v_ronique_gauthier_69c7efe354de6edea916a71d, extroversion, 0.9683957585818845).
personality(v_ronique_gauthier_69c7efe354de6edea916a71d, agreeableness, -0.7317856676927317).
personality(v_ronique_gauthier_69c7efe354de6edea916a71d, neuroticism, 0.2779828256029848).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, creativity, 0.13).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, music, 0.19).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, languages, 0.16).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, crafting, 0.42).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, farming, 0.27).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, cooking, 0.3).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, persuasion, 0.57).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, leadership, 0.32).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, trading, 0.34).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, combat, 0.19).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, athletics, 0.15).
skill(v_ronique_gauthier_69c7efe354de6edea916a71d, endurance, 0.19).
person(mireille_roux_69c7efe354de6edea916a71f).
first_name(mireille_roux_69c7efe354de6edea916a71f, 'Mireille').
last_name(mireille_roux_69c7efe354de6edea916a71f, 'Roux').
age(mireille_roux_69c7efe354de6edea916a71f, 50).
gender(mireille_roux_69c7efe354de6edea916a71f, female).
occupation(mireille_roux_69c7efe354de6edea916a71f, retired).
alive(mireille_roux_69c7efe354de6edea916a71f).
personality(mireille_roux_69c7efe354de6edea916a71f, openness, -0.6892153459965624).
personality(mireille_roux_69c7efe354de6edea916a71f, conscientiousness, 0.8036087669603447).
personality(mireille_roux_69c7efe354de6edea916a71f, extroversion, -0.3297108217701945).
personality(mireille_roux_69c7efe354de6edea916a71f, agreeableness, 0.9777847064869256).
personality(mireille_roux_69c7efe354de6edea916a71f, neuroticism, -0.9903772679426672).
skill(mireille_roux_69c7efe354de6edea916a71f, creativity, 0.35).
skill(mireille_roux_69c7efe354de6edea916a71f, music, 0.3).
skill(mireille_roux_69c7efe354de6edea916a71f, crafting, 0.75).
skill(mireille_roux_69c7efe354de6edea916a71f, farming, 0.96).
skill(mireille_roux_69c7efe354de6edea916a71f, cooking, 0.69).
skill(mireille_roux_69c7efe354de6edea916a71f, persuasion, 0.43).
skill(mireille_roux_69c7efe354de6edea916a71f, leadership, 0.18).
skill(mireille_roux_69c7efe354de6edea916a71f, trading, 0.27).
skill(mireille_roux_69c7efe354de6edea916a71f, medicine, 1).
skill(mireille_roux_69c7efe354de6edea916a71f, teaching, 0.64).
skill(mireille_roux_69c7efe354de6edea916a71f, diplomacy, 0.57).
skill(mireille_roux_69c7efe354de6edea916a71f, combat, 1).
skill(mireille_roux_69c7efe354de6edea916a71f, athletics, 0.72).
skill(mireille_roux_69c7efe354de6edea916a71f, endurance, 0.86).
person(julien_richard_69c7efe454de6edea916a721).
first_name(julien_richard_69c7efe454de6edea916a721, 'Julien').
last_name(julien_richard_69c7efe454de6edea916a721, 'Richard').
age(julien_richard_69c7efe454de6edea916a721, 35).
gender(julien_richard_69c7efe454de6edea916a721, male).
occupation(julien_richard_69c7efe454de6edea916a721, worker).
alive(julien_richard_69c7efe454de6edea916a721).
personality(julien_richard_69c7efe454de6edea916a721, openness, -0.8426615204558741).
personality(julien_richard_69c7efe454de6edea916a721, conscientiousness, 0.32660337917728066).
personality(julien_richard_69c7efe454de6edea916a721, extroversion, 0.030998049399979966).
personality(julien_richard_69c7efe454de6edea916a721, agreeableness, -0.9561311754915973).
personality(julien_richard_69c7efe454de6edea916a721, neuroticism, 0.427504346542114).
skill(julien_richard_69c7efe454de6edea916a721, creativity, 0.16).
skill(julien_richard_69c7efe454de6edea916a721, music, 0.11).
skill(julien_richard_69c7efe454de6edea916a721, crafting, 0.75).
skill(julien_richard_69c7efe454de6edea916a721, farming, 0.55).
skill(julien_richard_69c7efe454de6edea916a721, cooking, 0.47).
skill(julien_richard_69c7efe454de6edea916a721, persuasion, 0.54).
skill(julien_richard_69c7efe454de6edea916a721, leadership, 0.51).
skill(julien_richard_69c7efe454de6edea916a721, trading, 0.42).
skill(julien_richard_69c7efe454de6edea916a721, combat, 0.36).
skill(julien_richard_69c7efe454de6edea916a721, athletics, 0.34).
skill(julien_richard_69c7efe454de6edea916a721, endurance, 0.28).
person(marguerite_tremblay_69c7efe454de6edea916a723).
first_name(marguerite_tremblay_69c7efe454de6edea916a723, 'Marguerite').
last_name(marguerite_tremblay_69c7efe454de6edea916a723, 'Tremblay').
age(marguerite_tremblay_69c7efe454de6edea916a723, 55).
gender(marguerite_tremblay_69c7efe454de6edea916a723, female).
occupation(marguerite_tremblay_69c7efe454de6edea916a723, retired).
alive(marguerite_tremblay_69c7efe454de6edea916a723).
personality(marguerite_tremblay_69c7efe454de6edea916a723, openness, 0.2725543493717275).
personality(marguerite_tremblay_69c7efe454de6edea916a723, conscientiousness, 0.8483110938058349).
personality(marguerite_tremblay_69c7efe454de6edea916a723, extroversion, -0.04237623056826889).
personality(marguerite_tremblay_69c7efe454de6edea916a723, agreeableness, 0.25072913437066013).
personality(marguerite_tremblay_69c7efe454de6edea916a723, neuroticism, -0.6501307577841473).
skill(marguerite_tremblay_69c7efe454de6edea916a723, creativity, 0.67).
skill(marguerite_tremblay_69c7efe454de6edea916a723, music, 0.44).
skill(marguerite_tremblay_69c7efe454de6edea916a723, languages, 0.55).
skill(marguerite_tremblay_69c7efe454de6edea916a723, crafting, 0.82).
skill(marguerite_tremblay_69c7efe454de6edea916a723, farming, 0.97).
skill(marguerite_tremblay_69c7efe454de6edea916a723, cooking, 0.67).
skill(marguerite_tremblay_69c7efe454de6edea916a723, persuasion, 0.3).
skill(marguerite_tremblay_69c7efe454de6edea916a723, leadership, 0.52).
skill(marguerite_tremblay_69c7efe454de6edea916a723, trading, 0.49).
skill(marguerite_tremblay_69c7efe454de6edea916a723, medicine, 0.54).
skill(marguerite_tremblay_69c7efe454de6edea916a723, teaching, 0.43).
skill(marguerite_tremblay_69c7efe454de6edea916a723, diplomacy, 0.64).
skill(marguerite_tremblay_69c7efe454de6edea916a723, combat, 0.68).
skill(marguerite_tremblay_69c7efe454de6edea916a723, athletics, 0.71).
skill(marguerite_tremblay_69c7efe454de6edea916a723, endurance, 0.52).
person(gis_le_bergeron_69c7efe454de6edea916a725).
first_name(gis_le_bergeron_69c7efe454de6edea916a725, 'Gisèle').
last_name(gis_le_bergeron_69c7efe454de6edea916a725, 'Bergeron').
age(gis_le_bergeron_69c7efe454de6edea916a725, 26).
gender(gis_le_bergeron_69c7efe454de6edea916a725, female).
occupation(gis_le_bergeron_69c7efe454de6edea916a725, farmer).
alive(gis_le_bergeron_69c7efe454de6edea916a725).
personality(gis_le_bergeron_69c7efe454de6edea916a725, openness, -0.21639001494100363).
personality(gis_le_bergeron_69c7efe454de6edea916a725, conscientiousness, -0.3352196185224283).
personality(gis_le_bergeron_69c7efe454de6edea916a725, extroversion, -0.4136818700109943).
personality(gis_le_bergeron_69c7efe454de6edea916a725, agreeableness, -0.9078509604424347).
personality(gis_le_bergeron_69c7efe454de6edea916a725, neuroticism, 0.5568701098685507).
skill(gis_le_bergeron_69c7efe454de6edea916a725, creativity, 0.23).
skill(gis_le_bergeron_69c7efe454de6edea916a725, crafting, 0.12).
skill(gis_le_bergeron_69c7efe454de6edea916a725, farming, 0.24).
skill(gis_le_bergeron_69c7efe454de6edea916a725, persuasion, 0.13).
person(th_r_se_boucher_69c7efe454de6edea916a727).
first_name(th_r_se_boucher_69c7efe454de6edea916a727, 'Thérèse').
last_name(th_r_se_boucher_69c7efe454de6edea916a727, 'Boucher').
age(th_r_se_boucher_69c7efe454de6edea916a727, 58).
gender(th_r_se_boucher_69c7efe454de6edea916a727, female).
occupation(th_r_se_boucher_69c7efe454de6edea916a727, retired).
alive(th_r_se_boucher_69c7efe454de6edea916a727).
personality(th_r_se_boucher_69c7efe454de6edea916a727, openness, -0.6161090446384194).
personality(th_r_se_boucher_69c7efe454de6edea916a727, conscientiousness, -0.11164263928934881).
personality(th_r_se_boucher_69c7efe454de6edea916a727, extroversion, 0.5451229860202642).
personality(th_r_se_boucher_69c7efe454de6edea916a727, agreeableness, 0.006336738111155427).
personality(th_r_se_boucher_69c7efe454de6edea916a727, neuroticism, -0.4252896191572142).
skill(th_r_se_boucher_69c7efe454de6edea916a727, creativity, 0.13).
skill(th_r_se_boucher_69c7efe454de6edea916a727, languages, 0.22).
skill(th_r_se_boucher_69c7efe454de6edea916a727, crafting, 0.43).
skill(th_r_se_boucher_69c7efe454de6edea916a727, farming, 0.35).
skill(th_r_se_boucher_69c7efe454de6edea916a727, cooking, 0.49).
skill(th_r_se_boucher_69c7efe454de6edea916a727, persuasion, 0.71).
skill(th_r_se_boucher_69c7efe454de6edea916a727, leadership, 0.44).
skill(th_r_se_boucher_69c7efe454de6edea916a727, trading, 0.5).
skill(th_r_se_boucher_69c7efe454de6edea916a727, medicine, 0.34).
skill(th_r_se_boucher_69c7efe454de6edea916a727, teaching, 0.38).
skill(th_r_se_boucher_69c7efe454de6edea916a727, diplomacy, 0.19).
skill(th_r_se_boucher_69c7efe454de6edea916a727, combat, 0.84).
skill(th_r_se_boucher_69c7efe454de6edea916a727, athletics, 0.46).
skill(th_r_se_boucher_69c7efe454de6edea916a727, endurance, 0.58).
person(odette_dugas_69c7efe454de6edea916a729).
first_name(odette_dugas_69c7efe454de6edea916a729, 'Odette').
last_name(odette_dugas_69c7efe454de6edea916a729, 'Dugas').
age(odette_dugas_69c7efe454de6edea916a729, 21).
gender(odette_dugas_69c7efe454de6edea916a729, female).
occupation(odette_dugas_69c7efe454de6edea916a729, owner_farm).
alive(odette_dugas_69c7efe454de6edea916a729).
personality(odette_dugas_69c7efe454de6edea916a729, openness, 0.2546179767223715).
personality(odette_dugas_69c7efe454de6edea916a729, conscientiousness, -0.8761900128821578).
personality(odette_dugas_69c7efe454de6edea916a729, extroversion, -0.26540399968062456).
personality(odette_dugas_69c7efe454de6edea916a729, agreeableness, 0.2623033377356525).
personality(odette_dugas_69c7efe454de6edea916a729, neuroticism, -0.822434923443919).
skill(odette_dugas_69c7efe454de6edea916a729, creativity, 0.43).
skill(odette_dugas_69c7efe454de6edea916a729, music, 0.29).
skill(odette_dugas_69c7efe454de6edea916a729, languages, 0.28).
skill(odette_dugas_69c7efe454de6edea916a729, persuasion, 0.11).
skill(odette_dugas_69c7efe454de6edea916a729, leadership, 0.15).
skill(odette_dugas_69c7efe454de6edea916a729, trading, 0.21).
skill(odette_dugas_69c7efe454de6edea916a729, medicine, 0.3).
skill(odette_dugas_69c7efe454de6edea916a729, teaching, 0.19).
skill(odette_dugas_69c7efe454de6edea916a729, diplomacy, 0.13).
skill(odette_dugas_69c7efe454de6edea916a729, combat, 0.45).
skill(odette_dugas_69c7efe454de6edea916a729, athletics, 0.54).
skill(odette_dugas_69c7efe454de6edea916a729, endurance, 0.46).
person(claudine_savoie_69c7efe454de6edea916a72c).
first_name(claudine_savoie_69c7efe454de6edea916a72c, 'Claudine').
last_name(claudine_savoie_69c7efe454de6edea916a72c, 'Savoie').
age(claudine_savoie_69c7efe454de6edea916a72c, 35).
gender(claudine_savoie_69c7efe454de6edea916a72c, female).
occupation(claudine_savoie_69c7efe454de6edea916a72c, farmer).
alive(claudine_savoie_69c7efe454de6edea916a72c).
personality(claudine_savoie_69c7efe454de6edea916a72c, openness, -0.908005786599662).
personality(claudine_savoie_69c7efe454de6edea916a72c, conscientiousness, 0.005961874442087733).
personality(claudine_savoie_69c7efe454de6edea916a72c, extroversion, 0.4275336840510904).
personality(claudine_savoie_69c7efe454de6edea916a72c, agreeableness, -0.38411129202227867).
personality(claudine_savoie_69c7efe454de6edea916a72c, neuroticism, 0.5551906223267453).
skill(claudine_savoie_69c7efe454de6edea916a72c, creativity, 0.11).
skill(claudine_savoie_69c7efe454de6edea916a72c, languages, 0.15).
skill(claudine_savoie_69c7efe454de6edea916a72c, crafting, 0.53).
skill(claudine_savoie_69c7efe454de6edea916a72c, farming, 0.45).
skill(claudine_savoie_69c7efe454de6edea916a72c, cooking, 0.13).
skill(claudine_savoie_69c7efe454de6edea916a72c, persuasion, 0.74).
skill(claudine_savoie_69c7efe454de6edea916a72c, leadership, 0.34).
skill(claudine_savoie_69c7efe454de6edea916a72c, trading, 0.57).
skill(claudine_savoie_69c7efe454de6edea916a72c, medicine, 0.22).
skill(claudine_savoie_69c7efe454de6edea916a72c, teaching, 0.13).
skill(claudine_savoie_69c7efe454de6edea916a72c, diplomacy, 0.3).
skill(claudine_savoie_69c7efe454de6edea916a72c, combat, 0.29).
person(yvette_blanchard_69c7efe454de6edea916a72f).
first_name(yvette_blanchard_69c7efe454de6edea916a72f, 'Yvette').
last_name(yvette_blanchard_69c7efe454de6edea916a72f, 'Blanchard').
age(yvette_blanchard_69c7efe454de6edea916a72f, 59).
gender(yvette_blanchard_69c7efe454de6edea916a72f, female).
occupation(yvette_blanchard_69c7efe454de6edea916a72f, retired).
alive(yvette_blanchard_69c7efe454de6edea916a72f).
personality(yvette_blanchard_69c7efe454de6edea916a72f, openness, -0.7511625522564351).
personality(yvette_blanchard_69c7efe454de6edea916a72f, conscientiousness, -0.5815340795503698).
personality(yvette_blanchard_69c7efe454de6edea916a72f, extroversion, -0.595654096240311).
personality(yvette_blanchard_69c7efe454de6edea916a72f, agreeableness, 0.5403022202419474).
personality(yvette_blanchard_69c7efe454de6edea916a72f, neuroticism, 0.8691125156707886).
skill(yvette_blanchard_69c7efe454de6edea916a72f, creativity, 0.28).
skill(yvette_blanchard_69c7efe454de6edea916a72f, crafting, 0.13).
skill(yvette_blanchard_69c7efe454de6edea916a72f, farming, 0.34).
skill(yvette_blanchard_69c7efe454de6edea916a72f, cooking, 0.28).
skill(yvette_blanchard_69c7efe454de6edea916a72f, persuasion, 0.13).
skill(yvette_blanchard_69c7efe454de6edea916a72f, leadership, 0.33).
skill(yvette_blanchard_69c7efe454de6edea916a72f, medicine, 0.62).
skill(yvette_blanchard_69c7efe454de6edea916a72f, teaching, 0.5).
skill(yvette_blanchard_69c7efe454de6edea916a72f, diplomacy, 0.61).
person(_vang_line_charpentier_69c7efe454de6edea916a731).
first_name(_vang_line_charpentier_69c7efe454de6edea916a731, 'Évangéline').
last_name(_vang_line_charpentier_69c7efe454de6edea916a731, 'Charpentier').
age(_vang_line_charpentier_69c7efe454de6edea916a731, 60).
gender(_vang_line_charpentier_69c7efe454de6edea916a731, female).
occupation(_vang_line_charpentier_69c7efe454de6edea916a731, retired).
alive(_vang_line_charpentier_69c7efe454de6edea916a731).
personality(_vang_line_charpentier_69c7efe454de6edea916a731, openness, -0.2675273993168541).
personality(_vang_line_charpentier_69c7efe454de6edea916a731, conscientiousness, 0.07743839072252934).
personality(_vang_line_charpentier_69c7efe454de6edea916a731, extroversion, -0.2668920662318768).
personality(_vang_line_charpentier_69c7efe454de6edea916a731, agreeableness, 0.47023306047426416).
personality(_vang_line_charpentier_69c7efe454de6edea916a731, neuroticism, 0.27319985918674083).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, creativity, 0.44).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, music, 0.4).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, languages, 0.17).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, crafting, 0.4).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, farming, 0.43).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, cooking, 0.42).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, persuasion, 0.41).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, trading, 0.25).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, medicine, 0.61).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, teaching, 0.72).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, diplomacy, 0.48).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, combat, 0.18).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, athletics, 0.48).
skill(_vang_line_charpentier_69c7efe454de6edea916a731, endurance, 0.22).

% === Item Facts ===
item(_69c7efec54de6edea916a82c).
item_name(_69c7efec54de6edea916a82c, 'Egg Whole White').
item_type(_69c7efec54de6edea916a82c, consumable).
item_value(_69c7efec54de6edea916a82c, 3).
item_weight(_69c7efec54de6edea916a82c, 0.5).
item_tradeable(_69c7efec54de6edea916a82c, true).
item(_69c7efec54de6edea916a82e).
item_name(_69c7efec54de6edea916a82e, 'Icecream2').
item_type(_69c7efec54de6edea916a82e, consumable).
item_value(_69c7efec54de6edea916a82e, 3).
item_weight(_69c7efec54de6edea916a82e, 0.5).
item_tradeable(_69c7efec54de6edea916a82e, true).
item(_69c7efec54de6edea916a830).
item_name(_69c7efec54de6edea916a830, 'Drill').
item_type(_69c7efec54de6edea916a830, tool).
item_value(_69c7efec54de6edea916a830, 12).
item_weight(_69c7efec54de6edea916a830, 2).
item_tradeable(_69c7efec54de6edea916a830, true).
item(_69c7efec54de6edea916a832).
item_name(_69c7efec54de6edea916a832, 'Cupcake Cherry2').
item_type(_69c7efec54de6edea916a832, consumable).
item_value(_69c7efec54de6edea916a832, 3).
item_weight(_69c7efec54de6edea916a832, 0.5).
item_tradeable(_69c7efec54de6edea916a832, true).
item(_69c7efec54de6edea916a834).
item_name(_69c7efec54de6edea916a834, 'Sushi Nigiri1').
item_type(_69c7efec54de6edea916a834, consumable).
item_value(_69c7efec54de6edea916a834, 3).
item_weight(_69c7efec54de6edea916a834, 0.5).
item_tradeable(_69c7efec54de6edea916a834, true).
item(_69c7efec54de6edea916a836).
item_name(_69c7efec54de6edea916a836, 'Wooden Torch').
item_type(_69c7efec54de6edea916a836, tool).
item_value(_69c7efec54de6edea916a836, 12).
item_weight(_69c7efec54de6edea916a836, 2).
item_tradeable(_69c7efec54de6edea916a836, true).
item(_69c7efec54de6edea916a838).
item_name(_69c7efec54de6edea916a838, 'Hotdog').
item_type(_69c7efec54de6edea916a838, consumable).
item_value(_69c7efec54de6edea916a838, 3).
item_weight(_69c7efec54de6edea916a838, 0.5).
item_tradeable(_69c7efec54de6edea916a838, true).
item(_69c7efec54de6edea916a83a).
item_name(_69c7efec54de6edea916a83a, 'Bonfire').
item_type(_69c7efec54de6edea916a83a, tool).
item_value(_69c7efec54de6edea916a83a, 8).
item_weight(_69c7efec54de6edea916a83a, 1).
item_tradeable(_69c7efec54de6edea916a83a, true).
item(_69c7efec54de6edea916a83c).
item_name(_69c7efec54de6edea916a83c, 'Bear Trap Closed').
item_type(_69c7efec54de6edea916a83c, tool).
item_value(_69c7efec54de6edea916a83c, 12).
item_weight(_69c7efec54de6edea916a83c, 2).
item_tradeable(_69c7efec54de6edea916a83c, true).
item(_69c7efec54de6edea916a83e).
item_name(_69c7efec54de6edea916a83e, 'Pipe Wrench').
item_type(_69c7efec54de6edea916a83e, tool).
item_value(_69c7efec54de6edea916a83e, 12).
item_weight(_69c7efec54de6edea916a83e, 2).
item_tradeable(_69c7efec54de6edea916a83e, true).
item(_69c7efec54de6edea916a840).
item_name(_69c7efec54de6edea916a840, 'Ukulele').
item_type(_69c7efec54de6edea916a840, material).
item_value(_69c7efec54de6edea916a840, 2).
item_weight(_69c7efec54de6edea916a840, 1).
item_tradeable(_69c7efec54de6edea916a840, true).
item(_69c7efec54de6edea916a842).
item_name(_69c7efec54de6edea916a842, 'Dirty Football').
item_type(_69c7efec54de6edea916a842, collectible).
item_value(_69c7efec54de6edea916a842, 8).
item_weight(_69c7efec54de6edea916a842, 0.5).
item_tradeable(_69c7efec54de6edea916a842, true).
item(_69c7efec54de6edea916a844).
item_name(_69c7efec54de6edea916a844, 'Modular Wooden Pier').
item_type(_69c7efec54de6edea916a844, material).
item_value(_69c7efec54de6edea916a844, 2).
item_weight(_69c7efec54de6edea916a844, 1).
item_tradeable(_69c7efec54de6edea916a844, true).
item(_69c7efec54de6edea916a847).
item_name(_69c7efec54de6edea916a847, 'Hand Plane No4').
item_type(_69c7efec54de6edea916a847, tool).
item_value(_69c7efec54de6edea916a847, 12).
item_weight(_69c7efec54de6edea916a847, 2).
item_tradeable(_69c7efec54de6edea916a847, true).
item(_69c7efec54de6edea916a84a).
item_name(_69c7efec54de6edea916a84a, 'Wooden Axe').
item_type(_69c7efec54de6edea916a84a, tool).
item_value(_69c7efec54de6edea916a84a, 12).
item_weight(_69c7efec54de6edea916a84a, 2).
item_tradeable(_69c7efec54de6edea916a84a, true).
item(_69c7efec54de6edea916a84c).
item_name(_69c7efec54de6edea916a84c, 'Backpack').
item_type(_69c7efec54de6edea916a84c, collectible).
item_value(_69c7efec54de6edea916a84c, 8).
item_weight(_69c7efec54de6edea916a84c, 0.5).
item_tradeable(_69c7efec54de6edea916a84c, true).
item(_69c7efec54de6edea916a84e).
item_name(_69c7efec54de6edea916a84e, 'Pan').
item_type(_69c7efec54de6edea916a84e, tool).
item_value(_69c7efec54de6edea916a84e, 12).
item_weight(_69c7efec54de6edea916a84e, 2).
item_tradeable(_69c7efec54de6edea916a84e, true).
item(_69c7efec54de6edea916a850).
item_name(_69c7efec54de6edea916a850, 'Wooden Torch').
item_type(_69c7efec54de6edea916a850, tool).
item_value(_69c7efec54de6edea916a850, 12).
item_weight(_69c7efec54de6edea916a850, 2).
item_tradeable(_69c7efec54de6edea916a850, true).
item(_69c7efec54de6edea916a852).
item_name(_69c7efec54de6edea916a852, 'Crystal5').
item_type(_69c7efec54de6edea916a852, collectible).
item_value(_69c7efec54de6edea916a852, 8).
item_weight(_69c7efec54de6edea916a852, 0.5).
item_tradeable(_69c7efec54de6edea916a852, true).
item(_69c7efec54de6edea916a854).
item_name(_69c7efec54de6edea916a854, 'Cauldron').
item_type(_69c7efec54de6edea916a854, tool).
item_value(_69c7efec54de6edea916a854, 12).
item_weight(_69c7efec54de6edea916a854, 2).
item_tradeable(_69c7efec54de6edea916a854, true).
item(_69c7efec54de6edea916a856).
item_name(_69c7efec54de6edea916a856, 'Hanging Picture Frame').
item_type(_69c7efec54de6edea916a856, material).
item_value(_69c7efec54de6edea916a856, 2).
item_weight(_69c7efec54de6edea916a856, 1).
item_tradeable(_69c7efec54de6edea916a856, true).
item(_69c7efec54de6edea916a858).
item_name(_69c7efec54de6edea916a858, 'Brass Pot').
item_type(_69c7efec54de6edea916a858, tool).
item_value(_69c7efec54de6edea916a858, 12).
item_weight(_69c7efec54de6edea916a858, 2).
item_tradeable(_69c7efec54de6edea916a858, true).
item(_69c7efec54de6edea916a85a).
item_name(_69c7efec54de6edea916a85a, 'Picke Dirty').
item_type(_69c7efec54de6edea916a85a, tool).
item_value(_69c7efec54de6edea916a85a, 12).
item_weight(_69c7efec54de6edea916a85a, 2).
item_tradeable(_69c7efec54de6edea916a85a, true).
item(_69c7efec54de6edea916a85c).
item_name(_69c7efec54de6edea916a85c, 'Heart Broken').
item_type(_69c7efec54de6edea916a85c, collectible).
item_value(_69c7efec54de6edea916a85c, 8).
item_weight(_69c7efec54de6edea916a85c, 0.5).
item_tradeable(_69c7efec54de6edea916a85c, true).
item(_69c7efec54de6edea916a85e).
item_name(_69c7efec54de6edea916a85e, 'Tire Pump').
item_type(_69c7efec54de6edea916a85e, tool).
item_value(_69c7efec54de6edea916a85e, 12).
item_weight(_69c7efec54de6edea916a85e, 2).
item_tradeable(_69c7efec54de6edea916a85e, true).
item(_69c7efec54de6edea916a860).
item_name(_69c7efec54de6edea916a860, 'Heart Broken').
item_type(_69c7efec54de6edea916a860, collectible).
item_value(_69c7efec54de6edea916a860, 8).
item_weight(_69c7efec54de6edea916a860, 0.5).
item_tradeable(_69c7efec54de6edea916a860, true).
item(_69c7efec54de6edea916a862).
item_name(_69c7efec54de6edea916a862, 'Match').
item_type(_69c7efec54de6edea916a862, tool).
item_value(_69c7efec54de6edea916a862, 12).
item_weight(_69c7efec54de6edea916a862, 2).
item_tradeable(_69c7efec54de6edea916a862, true).
item(_69c7efed54de6edea916a864).
item_name(_69c7efed54de6edea916a864, 'Lantern Marker').
item_type(_69c7efed54de6edea916a864, collectible).
item_value(_69c7efed54de6edea916a864, 8).
item_weight(_69c7efed54de6edea916a864, 0.5).
item_tradeable(_69c7efed54de6edea916a864, true).
item(_69c7efed54de6edea916a866).
item_name(_69c7efed54de6edea916a866, 'Pan').
item_type(_69c7efed54de6edea916a866, tool).
item_value(_69c7efed54de6edea916a866, 12).
item_weight(_69c7efed54de6edea916a866, 2).
item_tradeable(_69c7efed54de6edea916a866, true).
item(_69c7efed54de6edea916a868).
item_name(_69c7efed54de6edea916a868, 'Heart Half').
item_type(_69c7efed54de6edea916a868, collectible).
item_value(_69c7efed54de6edea916a868, 8).
item_weight(_69c7efed54de6edea916a868, 0.5).
item_tradeable(_69c7efed54de6edea916a868, true).
item(_69c7efed54de6edea916a86a).
item_name(_69c7efed54de6edea916a86a, 'Gold Ingots').
item_type(_69c7efed54de6edea916a86a, collectible).
item_value(_69c7efed54de6edea916a86a, 8).
item_weight(_69c7efed54de6edea916a86a, 0.5).
item_tradeable(_69c7efed54de6edea916a86a, true).
item(_69c7efed54de6edea916a86c).
item_name(_69c7efed54de6edea916a86c, 'Shelf').
item_type(_69c7efed54de6edea916a86c, furniture).
item_value(_69c7efed54de6edea916a86c, 15).
item_weight(_69c7efed54de6edea916a86c, 10).
item_tradeable(_69c7efed54de6edea916a86c, true).
item(_69c7efed54de6edea916a86e).
item_name(_69c7efed54de6edea916a86e, 'Side Table').
item_type(_69c7efed54de6edea916a86e, furniture).
item_value(_69c7efed54de6edea916a86e, 15).
item_weight(_69c7efed54de6edea916a86e, 10).
item_tradeable(_69c7efed54de6edea916a86e, true).
item(_69c7efed54de6edea916a870).
item_name(_69c7efed54de6edea916a870, 'Brass Goblets').
item_type(_69c7efed54de6edea916a870, consumable).
item_value(_69c7efed54de6edea916a870, 5).
item_weight(_69c7efed54de6edea916a870, 1).
item_tradeable(_69c7efed54de6edea916a870, true).
item(_69c7efed54de6edea916a872).
item_name(_69c7efed54de6edea916a872, 'Drawer').
item_type(_69c7efed54de6edea916a872, furniture).
item_value(_69c7efed54de6edea916a872, 15).
item_weight(_69c7efed54de6edea916a872, 10).
item_tradeable(_69c7efed54de6edea916a872, true).
item(_69c7efed54de6edea916a874).
item_name(_69c7efed54de6edea916a874, 'Waffle').
item_type(_69c7efed54de6edea916a874, consumable).
item_value(_69c7efed54de6edea916a874, 3).
item_weight(_69c7efed54de6edea916a874, 0.5).
item_tradeable(_69c7efed54de6edea916a874, true).
item(_69c7efed54de6edea916a876).
item_name(_69c7efed54de6edea916a876, 'Bathroom Shower1').
item_type(_69c7efed54de6edea916a876, furniture).
item_value(_69c7efed54de6edea916a876, 15).
item_weight(_69c7efed54de6edea916a876, 10).
item_tradeable(_69c7efed54de6edea916a876, true).
item(_69c7efed54de6edea916a878).
item_name(_69c7efed54de6edea916a878, 'Candle Stick').
item_type(_69c7efed54de6edea916a878, tool).
item_value(_69c7efed54de6edea916a878, 8).
item_weight(_69c7efed54de6edea916a878, 1).
item_tradeable(_69c7efed54de6edea916a878, true).
item(_69c7efed54de6edea916a87a).
item_name(_69c7efed54de6edea916a87a, 'Ice Cream Cone').
item_type(_69c7efed54de6edea916a87a, consumable).
item_value(_69c7efed54de6edea916a87a, 3).
item_weight(_69c7efed54de6edea916a87a, 0.5).
item_tradeable(_69c7efed54de6edea916a87a, true).
item(_69c7efed54de6edea916a87c).
item_name(_69c7efed54de6edea916a87c, 'Torch').
item_type(_69c7efed54de6edea916a87c, tool).
item_value(_69c7efed54de6edea916a87c, 8).
item_weight(_69c7efed54de6edea916a87c, 1).
item_tradeable(_69c7efed54de6edea916a87c, true).
item(_69c7efed54de6edea916a87e).
item_name(_69c7efed54de6edea916a87e, 'Column Round2').
item_type(_69c7efed54de6edea916a87e, furniture).
item_value(_69c7efed54de6edea916a87e, 15).
item_weight(_69c7efed54de6edea916a87e, 10).
item_tradeable(_69c7efed54de6edea916a87e, true).
item(_69c7efed54de6edea916a880).
item_name(_69c7efed54de6edea916a880, 'Popsicle Multiple').
item_type(_69c7efed54de6edea916a880, consumable).
item_value(_69c7efed54de6edea916a880, 3).
item_weight(_69c7efed54de6edea916a880, 0.5).
item_tradeable(_69c7efed54de6edea916a880, true).
item(_69c7efed54de6edea916a882).
item_name(_69c7efed54de6edea916a882, 'Sofa Individual').
item_type(_69c7efed54de6edea916a882, furniture).
item_value(_69c7efed54de6edea916a882, 15).
item_weight(_69c7efed54de6edea916a882, 10).
item_tradeable(_69c7efed54de6edea916a882, true).
item(_69c7efed54de6edea916a884).
item_name(_69c7efed54de6edea916a884, 'Handsaw Wood').
item_type(_69c7efed54de6edea916a884, tool).
item_value(_69c7efed54de6edea916a884, 12).
item_weight(_69c7efed54de6edea916a884, 2).
item_tradeable(_69c7efed54de6edea916a884, true).
item(_69c7efed54de6edea916a886).
item_name(_69c7efed54de6edea916a886, 'Hand Plane No4').
item_type(_69c7efed54de6edea916a886, tool).
item_value(_69c7efed54de6edea916a886, 12).
item_weight(_69c7efed54de6edea916a886, 2).
item_tradeable(_69c7efed54de6edea916a886, true).
item(_69c7efed54de6edea916a888).
item_name(_69c7efed54de6edea916a888, 'Mid Century Lounge Chair').
item_type(_69c7efed54de6edea916a888, furniture).
item_value(_69c7efed54de6edea916a888, 15).
item_weight(_69c7efed54de6edea916a888, 10).
item_tradeable(_69c7efed54de6edea916a888, true).
item(_69c7efed54de6edea916a88a).
item_name(_69c7efed54de6edea916a88a, 'Rockingchair').
item_type(_69c7efed54de6edea916a88a, furniture).
item_value(_69c7efed54de6edea916a88a, 15).
item_weight(_69c7efed54de6edea916a88a, 10).
item_tradeable(_69c7efed54de6edea916a88a, true).
item(_69c7efed54de6edea916a88c).
item_name(_69c7efed54de6edea916a88c, 'Double Cheeseburger').
item_type(_69c7efed54de6edea916a88c, consumable).
item_value(_69c7efed54de6edea916a88c, 3).
item_weight(_69c7efed54de6edea916a88c, 0.5).
item_tradeable(_69c7efed54de6edea916a88c, true).
item(_69c7efed54de6edea916a88e).
item_name(_69c7efed54de6edea916a88e, 'Bathroom Sink').
item_type(_69c7efed54de6edea916a88e, furniture).
item_value(_69c7efed54de6edea916a88e, 15).
item_weight(_69c7efed54de6edea916a88e, 10).
item_tradeable(_69c7efed54de6edea916a88e, true).
item(_69c7efed54de6edea916a890).
item_name(_69c7efed54de6edea916a890, 'Cookie').
item_type(_69c7efed54de6edea916a890, consumable).
item_value(_69c7efed54de6edea916a890, 3).
item_weight(_69c7efed54de6edea916a890, 0.5).
item_tradeable(_69c7efed54de6edea916a890, true).
item(_69c7efed54de6edea916a892).
item_name(_69c7efed54de6edea916a892, 'Light Floor3').
item_type(_69c7efed54de6edea916a892, furniture).
item_value(_69c7efed54de6edea916a892, 15).
item_weight(_69c7efed54de6edea916a892, 10).
item_tradeable(_69c7efed54de6edea916a892, true).
item(_69c7efed54de6edea916a894).
item_name(_69c7efed54de6edea916a894, 'Workbench').
item_type(_69c7efed54de6edea916a894, furniture).
item_value(_69c7efed54de6edea916a894, 15).
item_weight(_69c7efed54de6edea916a894, 10).
item_tradeable(_69c7efed54de6edea916a894, true).
item(_69c7efed54de6edea916a896).
item_name(_69c7efed54de6edea916a896, 'Wooden Table').
item_type(_69c7efed54de6edea916a896, furniture).
item_value(_69c7efed54de6edea916a896, 15).
item_weight(_69c7efed54de6edea916a896, 10).
item_tradeable(_69c7efed54de6edea916a896, true).
item(_69c7efed54de6edea916a898).
item_name(_69c7efed54de6edea916a898, 'Drawer').
item_type(_69c7efed54de6edea916a898, furniture).
item_value(_69c7efed54de6edea916a898, 15).
item_weight(_69c7efed54de6edea916a898, 10).
item_tradeable(_69c7efed54de6edea916a898, true).
item(_69c7efee54de6edea916a89a).
item_name(_69c7efee54de6edea916a89a, 'Lemon').
item_type(_69c7efee54de6edea916a89a, consumable).
item_value(_69c7efee54de6edea916a89a, 3).
item_weight(_69c7efee54de6edea916a89a, 0.5).
item_tradeable(_69c7efee54de6edea916a89a, true).
item(_69c7efee54de6edea916a89c).
item_name(_69c7efee54de6edea916a89c, 'Drawer Cabinet').
item_type(_69c7efee54de6edea916a89c, furniture).
item_value(_69c7efee54de6edea916a89c, 15).
item_weight(_69c7efee54de6edea916a89c, 10).
item_tradeable(_69c7efee54de6edea916a89c, true).
item(_69c7efee54de6edea916a89e).
item_name(_69c7efee54de6edea916a89e, 'Classic Nightstand').
item_type(_69c7efee54de6edea916a89e, furniture).
item_value(_69c7efee54de6edea916a89e, 15).
item_weight(_69c7efee54de6edea916a89e, 10).
item_tradeable(_69c7efee54de6edea916a89e, true).
item(_69c7efee54de6edea916a8a0).
item_name(_69c7efee54de6edea916a8a0, 'Match').
item_type(_69c7efee54de6edea916a8a0, tool).
item_value(_69c7efee54de6edea916a8a0, 12).
item_weight(_69c7efee54de6edea916a8a0, 2).
item_tradeable(_69c7efee54de6edea916a8a0, true).
item(_69c7efee54de6edea916a8a2).
item_name(_69c7efee54de6edea916a8a2, 'Lubricant Spray').
item_type(_69c7efee54de6edea916a8a2, tool).
item_value(_69c7efee54de6edea916a8a2, 12).
item_weight(_69c7efee54de6edea916a8a2, 2).
item_tradeable(_69c7efee54de6edea916a8a2, true).
item(_69c7efee54de6edea916a8a4).
item_name(_69c7efee54de6edea916a8a4, 'Table Round Small').
item_type(_69c7efee54de6edea916a8a4, furniture).
item_value(_69c7efee54de6edea916a8a4, 15).
item_weight(_69c7efee54de6edea916a8a4, 10).
item_tradeable(_69c7efee54de6edea916a8a4, true).
item(_69c7efee54de6edea916a8a6).
item_name(_69c7efee54de6edea916a8a6, 'Chair').
item_type(_69c7efee54de6edea916a8a6, furniture).
item_value(_69c7efee54de6edea916a8a6, 15).
item_weight(_69c7efee54de6edea916a8a6, 10).
item_tradeable(_69c7efee54de6edea916a8a6, true).
item(_69c7efee54de6edea916a8a8).
item_name(_69c7efee54de6edea916a8a8, 'Light Ceiling2').
item_type(_69c7efee54de6edea916a8a8, furniture).
item_value(_69c7efee54de6edea916a8a8, 15).
item_weight(_69c7efee54de6edea916a8a8, 10).
item_tradeable(_69c7efee54de6edea916a8a8, true).
item(_69c7efee54de6edea916a8aa).
item_name(_69c7efee54de6edea916a8aa, 'Couch Small2').
item_type(_69c7efee54de6edea916a8aa, furniture).
item_value(_69c7efee54de6edea916a8aa, 15).
item_weight(_69c7efee54de6edea916a8aa, 10).
item_tradeable(_69c7efee54de6edea916a8aa, true).
item(_69c7efee54de6edea916a8ac).
item_name(_69c7efee54de6edea916a8ac, 'Avocado').
item_type(_69c7efee54de6edea916a8ac, consumable).
item_value(_69c7efee54de6edea916a8ac, 3).
item_weight(_69c7efee54de6edea916a8ac, 0.5).
item_tradeable(_69c7efee54de6edea916a8ac, true).
item(_69c7efee54de6edea916a8ae).
item_name(_69c7efee54de6edea916a8ae, 'Knife').
item_type(_69c7efee54de6edea916a8ae, consumable).
item_value(_69c7efee54de6edea916a8ae, 3).
item_weight(_69c7efee54de6edea916a8ae, 0.5).
item_tradeable(_69c7efee54de6edea916a8ae, true).
item(_69c7efee54de6edea916a8b0).
item_name(_69c7efee54de6edea916a8b0, 'Metal Stool').
item_type(_69c7efee54de6edea916a8b0, furniture).
item_value(_69c7efee54de6edea916a8b0, 15).
item_weight(_69c7efee54de6edea916a8b0, 10).
item_tradeable(_69c7efee54de6edea916a8b0, true).
item(_69c7efee54de6edea916a8b2).
item_name(_69c7efee54de6edea916a8b2, 'Bear Trap Open').
item_type(_69c7efee54de6edea916a8b2, tool).
item_value(_69c7efee54de6edea916a8b2, 12).
item_weight(_69c7efee54de6edea916a8b2, 2).
item_tradeable(_69c7efee54de6edea916a8b2, true).
item(_69c7efee54de6edea916a8b4).
item_name(_69c7efee54de6edea916a8b4, 'Steel Frame Shelves').
item_type(_69c7efee54de6edea916a8b4, furniture).
item_value(_69c7efee54de6edea916a8b4, 15).
item_weight(_69c7efee54de6edea916a8b4, 10).
item_tradeable(_69c7efee54de6edea916a8b4, true).
item(_69c7efee54de6edea916a8b7).
item_name(_69c7efee54de6edea916a8b7, 'Cabinet').
item_type(_69c7efee54de6edea916a8b7, furniture).
item_value(_69c7efee54de6edea916a8b7, 15).
item_weight(_69c7efee54de6edea916a8b7, 10).
item_tradeable(_69c7efee54de6edea916a8b7, true).
item(_69c7efee54de6edea916a8ba).
item_name(_69c7efee54de6edea916a8ba, 'Drawer').
item_type(_69c7efee54de6edea916a8ba, furniture).
item_value(_69c7efee54de6edea916a8ba, 15).
item_weight(_69c7efee54de6edea916a8ba, 10).
item_tradeable(_69c7efee54de6edea916a8ba, true).
item(_69c7efee54de6edea916a8bc).
item_name(_69c7efee54de6edea916a8bc, 'Kitchen 1drawers').
item_type(_69c7efee54de6edea916a8bc, furniture).
item_value(_69c7efee54de6edea916a8bc, 15).
item_weight(_69c7efee54de6edea916a8bc, 10).
item_tradeable(_69c7efee54de6edea916a8bc, true).
item(_69c7efee54de6edea916a8be).
item_name(_69c7efee54de6edea916a8be, 'Food Lychee').
item_type(_69c7efee54de6edea916a8be, consumable).
item_value(_69c7efee54de6edea916a8be, 3).
item_weight(_69c7efee54de6edea916a8be, 0.5).
item_tradeable(_69c7efee54de6edea916a8be, true).
item(_69c7efee54de6edea916a8c0).
item_name(_69c7efee54de6edea916a8c0, 'Small Oil Can').
item_type(_69c7efee54de6edea916a8c0, tool).
item_value(_69c7efee54de6edea916a8c0, 12).
item_weight(_69c7efee54de6edea916a8c0, 2).
item_tradeable(_69c7efee54de6edea916a8c0, true).
item(_69c7efee54de6edea916a8c2).
item_name(_69c7efee54de6edea916a8c2, 'Tomato Slice').
item_type(_69c7efee54de6edea916a8c2, consumable).
item_value(_69c7efee54de6edea916a8c2, 3).
item_weight(_69c7efee54de6edea916a8c2, 0.5).
item_tradeable(_69c7efee54de6edea916a8c2, true).
item(_69c7efee54de6edea916a8c4).
item_name(_69c7efee54de6edea916a8c4, 'Painted Wooden Shelves').
item_type(_69c7efee54de6edea916a8c4, furniture).
item_value(_69c7efee54de6edea916a8c4, 15).
item_weight(_69c7efee54de6edea916a8c4, 10).
item_tradeable(_69c7efee54de6edea916a8c4, true).
item(_69c7efee54de6edea916a8c6).
item_name(_69c7efee54de6edea916a8c6, 'Painted Wooden Nightstand').
item_type(_69c7efee54de6edea916a8c6, furniture).
item_value(_69c7efee54de6edea916a8c6, 15).
item_weight(_69c7efee54de6edea916a8c6, 10).
item_tradeable(_69c7efee54de6edea916a8c6, true).
item(_69c7efee54de6edea916a8c8).
item_name(_69c7efee54de6edea916a8c8, 'Modern Coffee Table').
item_type(_69c7efee54de6edea916a8c8, furniture).
item_value(_69c7efee54de6edea916a8c8, 15).
item_weight(_69c7efee54de6edea916a8c8, 10).
item_tradeable(_69c7efee54de6edea916a8c8, true).
item(_69c7efee54de6edea916a8ca).
item_name(_69c7efee54de6edea916a8ca, 'Drawer').
item_type(_69c7efee54de6edea916a8ca, furniture).
item_value(_69c7efee54de6edea916a8ca, 15).
item_weight(_69c7efee54de6edea916a8ca, 10).
item_tradeable(_69c7efee54de6edea916a8ca, true).
item(_69c7efee54de6edea916a8cc).
item_name(_69c7efee54de6edea916a8cc, 'Light Cube2').
item_type(_69c7efee54de6edea916a8cc, furniture).
item_value(_69c7efee54de6edea916a8cc, 15).
item_weight(_69c7efee54de6edea916a8cc, 10).
item_tradeable(_69c7efee54de6edea916a8cc, true).
item(_69c7efee54de6edea916a8ce).
item_name(_69c7efee54de6edea916a8ce, 'Banana').
item_type(_69c7efee54de6edea916a8ce, consumable).
item_value(_69c7efee54de6edea916a8ce, 3).
item_weight(_69c7efee54de6edea916a8ce, 0.5).
item_tradeable(_69c7efee54de6edea916a8ce, true).
item(_69c7efef54de6edea916a8d0).
item_name(_69c7efef54de6edea916a8d0, 'Night Stand').
item_type(_69c7efef54de6edea916a8d0, furniture).
item_value(_69c7efef54de6edea916a8d0, 15).
item_weight(_69c7efef54de6edea916a8d0, 10).
item_tradeable(_69c7efef54de6edea916a8d0, true).
item(_69c7efef54de6edea916a8d2).
item_name(_69c7efef54de6edea916a8d2, 'Steel Frame Shelves').
item_type(_69c7efef54de6edea916a8d2, furniture).
item_value(_69c7efef54de6edea916a8d2, 15).
item_weight(_69c7efef54de6edea916a8d2, 10).
item_tradeable(_69c7efef54de6edea916a8d2, true).
item(_69c7efef54de6edea916a8d4).
item_name(_69c7efef54de6edea916a8d4, 'Door').
item_type(_69c7efef54de6edea916a8d4, furniture).
item_value(_69c7efef54de6edea916a8d4, 15).
item_weight(_69c7efef54de6edea916a8d4, 10).
item_tradeable(_69c7efef54de6edea916a8d4, true).
item(_69c7efef54de6edea916a8d6).
item_name(_69c7efef54de6edea916a8d6, 'Trashcan Large').
item_type(_69c7efef54de6edea916a8d6, furniture).
item_value(_69c7efef54de6edea916a8d6, 15).
item_weight(_69c7efef54de6edea916a8d6, 10).
item_tradeable(_69c7efef54de6edea916a8d6, true).
item(_69c7efef54de6edea916a8d8).
item_name(_69c7efef54de6edea916a8d8, 'Couch Large2').
item_type(_69c7efef54de6edea916a8d8, furniture).
item_value(_69c7efef54de6edea916a8d8, 15).
item_weight(_69c7efef54de6edea916a8d8, 10).
item_tradeable(_69c7efef54de6edea916a8d8, true).
item(_69c7efef54de6edea916a8da).
item_name(_69c7efef54de6edea916a8da, 'Sofa').
item_type(_69c7efef54de6edea916a8da, furniture).
item_value(_69c7efef54de6edea916a8da, 15).
item_weight(_69c7efef54de6edea916a8da, 10).
item_tradeable(_69c7efef54de6edea916a8da, true).
item(_69c7efef54de6edea916a8dc).
item_name(_69c7efef54de6edea916a8dc, 'Crystal').
item_type(_69c7efef54de6edea916a8dc, collectible).
item_value(_69c7efef54de6edea916a8dc, 8).
item_weight(_69c7efef54de6edea916a8dc, 0.5).
item_tradeable(_69c7efef54de6edea916a8dc, true).
item(_69c7efef54de6edea916a8de).
item_name(_69c7efef54de6edea916a8de, 'Drawer').
item_type(_69c7efef54de6edea916a8de, furniture).
item_value(_69c7efef54de6edea916a8de, 15).
item_weight(_69c7efef54de6edea916a8de, 10).
item_tradeable(_69c7efef54de6edea916a8de, true).
item(_69c7efef54de6edea916a8e0).
item_name(_69c7efef54de6edea916a8e0, 'Wooden Table').
item_type(_69c7efef54de6edea916a8e0, furniture).
item_value(_69c7efef54de6edea916a8e0, 15).
item_weight(_69c7efef54de6edea916a8e0, 10).
item_tradeable(_69c7efef54de6edea916a8e0, true).
item(_69c7efef54de6edea916a8e2).
item_name(_69c7efef54de6edea916a8e2, 'Prop Mine').
item_type(_69c7efef54de6edea916a8e2, tool).
item_value(_69c7efef54de6edea916a8e2, 12).
item_weight(_69c7efef54de6edea916a8e2, 2).
item_tradeable(_69c7efef54de6edea916a8e2, true).
item(_69c7efef54de6edea916a8e4).
item_name(_69c7efef54de6edea916a8e4, 'Bolt Cutters').
item_type(_69c7efef54de6edea916a8e4, tool).
item_value(_69c7efef54de6edea916a8e4, 12).
item_weight(_69c7efef54de6edea916a8e4, 2).
item_tradeable(_69c7efef54de6edea916a8e4, true).
item(_69c7efef54de6edea916a8e6).
item_name(_69c7efef54de6edea916a8e6, 'Vintage Pocket Watch').
item_type(_69c7efef54de6edea916a8e6, collectible).
item_value(_69c7efef54de6edea916a8e6, 8).
item_weight(_69c7efef54de6edea916a8e6, 0.5).
item_tradeable(_69c7efef54de6edea916a8e6, true).
item(_69c7efef54de6edea916a8e8).
item_name(_69c7efef54de6edea916a8e8, 'Houseplant').
item_type(_69c7efef54de6edea916a8e8, furniture).
item_value(_69c7efef54de6edea916a8e8, 15).
item_weight(_69c7efef54de6edea916a8e8, 10).
item_tradeable(_69c7efef54de6edea916a8e8, true).
item(_69c7efef54de6edea916a8ea).
item_name(_69c7efef54de6edea916a8ea, 'Pizza Burned').
item_type(_69c7efef54de6edea916a8ea, consumable).
item_value(_69c7efef54de6edea916a8ea, 3).
item_weight(_69c7efef54de6edea916a8ea, 0.5).
item_tradeable(_69c7efef54de6edea916a8ea, true).
item(_69c7efef54de6edea916a8ec).
item_name(_69c7efef54de6edea916a8ec, 'Door').
item_type(_69c7efef54de6edea916a8ec, furniture).
item_value(_69c7efef54de6edea916a8ec, 15).
item_weight(_69c7efef54de6edea916a8ec, 10).
item_tradeable(_69c7efef54de6edea916a8ec, true).
item(_69c7efef54de6edea916a8ee).
item_name(_69c7efef54de6edea916a8ee, 'Night Stand').
item_type(_69c7efef54de6edea916a8ee, furniture).
item_value(_69c7efef54de6edea916a8ee, 15).
item_weight(_69c7efef54de6edea916a8ee, 10).
item_tradeable(_69c7efef54de6edea916a8ee, true).
item(_69c7efef54de6edea916a8f0).
item_name(_69c7efef54de6edea916a8f0, 'Yellow Onion').
item_type(_69c7efef54de6edea916a8f0, consumable).
item_value(_69c7efef54de6edea916a8f0, 3).
item_weight(_69c7efef54de6edea916a8f0, 0.5).
item_tradeable(_69c7efef54de6edea916a8f0, true).
item(_69c7efef54de6edea916a8f2).
item_name(_69c7efef54de6edea916a8f2, 'Candle').
item_type(_69c7efef54de6edea916a8f2, tool).
item_value(_69c7efef54de6edea916a8f2, 8).
item_weight(_69c7efef54de6edea916a8f2, 1).
item_tradeable(_69c7efef54de6edea916a8f2, true).
item(_69c7efef54de6edea916a8f4).
item_name(_69c7efef54de6edea916a8f4, 'Bed Bunk').
item_type(_69c7efef54de6edea916a8f4, furniture).
item_value(_69c7efef54de6edea916a8f4, 15).
item_weight(_69c7efef54de6edea916a8f4, 10).
item_tradeable(_69c7efef54de6edea916a8f4, true).
item(_69c7efef54de6edea916a8f6).
item_name(_69c7efef54de6edea916a8f6, 'Kitchen Cabinet2').
item_type(_69c7efef54de6edea916a8f6, furniture).
item_value(_69c7efef54de6edea916a8f6, 15).
item_weight(_69c7efef54de6edea916a8f6, 10).
item_tradeable(_69c7efef54de6edea916a8f6, true).
item(_69c7efef54de6edea916a8f8).
item_name(_69c7efef54de6edea916a8f8, 'Cooking Pot').
item_type(_69c7efef54de6edea916a8f8, consumable).
item_value(_69c7efef54de6edea916a8f8, 3).
item_weight(_69c7efef54de6edea916a8f8, 0.5).
item_tradeable(_69c7efef54de6edea916a8f8, true).
item(_69c7efef54de6edea916a8fa).
item_name(_69c7efef54de6edea916a8fa, 'Star').
item_type(_69c7efef54de6edea916a8fa, collectible).
item_value(_69c7efef54de6edea916a8fa, 8).
item_weight(_69c7efef54de6edea916a8fa, 0.5).
item_tradeable(_69c7efef54de6edea916a8fa, true).
item(_69c7efef54de6edea916a8fc).
item_name(_69c7efef54de6edea916a8fc, 'Croissant').
item_type(_69c7efef54de6edea916a8fc, consumable).
item_value(_69c7efef54de6edea916a8fc, 3).
item_weight(_69c7efef54de6edea916a8fc, 0.5).
item_tradeable(_69c7efef54de6edea916a8fc, true).
item(_69c7efef54de6edea916a8fe).
item_name(_69c7efef54de6edea916a8fe, 'Shelf Simple').
item_type(_69c7efef54de6edea916a8fe, furniture).
item_value(_69c7efef54de6edea916a8fe, 15).
item_weight(_69c7efef54de6edea916a8fe, 10).
item_tradeable(_69c7efef54de6edea916a8fe, true).
item(_69c7efef54de6edea916a900).
item_name(_69c7efef54de6edea916a900, 'Cupcake').
item_type(_69c7efef54de6edea916a900, consumable).
item_value(_69c7efef54de6edea916a900, 3).
item_weight(_69c7efef54de6edea916a900, 0.5).
item_tradeable(_69c7efef54de6edea916a900, true).
item(_69c7efef54de6edea916a902).
item_name(_69c7efef54de6edea916a902, 'Farm Crate Carrot').
item_type(_69c7efef54de6edea916a902, container).
item_value(_69c7efef54de6edea916a902, 10).
item_weight(_69c7efef54de6edea916a902, 5).
item_tradeable(_69c7efef54de6edea916a902, true).
item(_69c7efef54de6edea916a904).
item_name(_69c7efef54de6edea916a904, 'Barrel').
item_type(_69c7efef54de6edea916a904, container).
item_value(_69c7efef54de6edea916a904, 10).
item_weight(_69c7efef54de6edea916a904, 5).
item_tradeable(_69c7efef54de6edea916a904, true).
item(_69c0f047d5077fafd836c66d).
item_name(_69c0f047d5077fafd836c66d, 'Wooden Crate').
item_type(_69c0f047d5077fafd836c66d, container).
item_value(_69c0f047d5077fafd836c66d, 10).
item_weight(_69c0f047d5077fafd836c66d, 5).
item_tradeable(_69c0f047d5077fafd836c66d, true).
item(_69c0f047d5077fafd836c66f).
item_name(_69c0f047d5077fafd836c66f, 'Wooden Crate').
item_type(_69c0f047d5077fafd836c66f, container).
item_value(_69c0f047d5077fafd836c66f, 10).
item_weight(_69c0f047d5077fafd836c66f, 5).
item_tradeable(_69c0f047d5077fafd836c66f, true).
item(_69c0f047d5077fafd836c670).
item_name(_69c0f047d5077fafd836c670, 'Wooden Bucket').
item_type(_69c0f047d5077fafd836c670, container).
item_value(_69c0f047d5077fafd836c670, 10).
item_weight(_69c0f047d5077fafd836c670, 5).
item_tradeable(_69c0f047d5077fafd836c670, true).
item(_69c0f047d5077fafd836c671).
item_name(_69c0f047d5077fafd836c671, 'Lantern').
item_type(_69c0f047d5077fafd836c671, tool).
item_value(_69c0f047d5077fafd836c671, 8).
item_weight(_69c0f047d5077fafd836c671, 1).
item_tradeable(_69c0f047d5077fafd836c671, true).
item(_69c0f047d5077fafd836c672).
item_name(_69c0f047d5077fafd836c672, 'Chandelier').
item_type(_69c0f047d5077fafd836c672, decoration).
item_value(_69c0f047d5077fafd836c672, 8).
item_weight(_69c0f047d5077fafd836c672, 1).
item_tradeable(_69c0f047d5077fafd836c672, true).
item(_69c0f047d5077fafd836c674).
item_name(_69c0f047d5077fafd836c674, 'Brass Candleholders').
item_type(_69c0f047d5077fafd836c674, tool).
item_value(_69c0f047d5077fafd836c674, 8).
item_weight(_69c0f047d5077fafd836c674, 1).
item_tradeable(_69c0f047d5077fafd836c674, true).
item(_69c0f047d5077fafd836c675).
item_name(_69c0f047d5077fafd836c675, 'Book Encyclopedia Set').
item_type(_69c0f047d5077fafd836c675, document).
item_value(_69c0f047d5077fafd836c675, 2).
item_weight(_69c0f047d5077fafd836c675, 0.1).
item_tradeable(_69c0f047d5077fafd836c675, true).
item(_69c0f047d5077fafd836c67b).
item_name(_69c0f047d5077fafd836c67b, 'Treasure Chest').
item_type(_69c0f047d5077fafd836c67b, container).
item_value(_69c0f047d5077fafd836c67b, 10).
item_weight(_69c0f047d5077fafd836c67b, 5).
item_tradeable(_69c0f047d5077fafd836c67b, true).
item(_69c0f047d5077fafd836c67c).
item_name(_69c0f047d5077fafd836c67c, 'Antique Estoc').
item_type(_69c0f047d5077fafd836c67c, weapon).
item_value(_69c0f047d5077fafd836c67c, 20).
item_weight(_69c0f047d5077fafd836c67c, 3).
item_tradeable(_69c0f047d5077fafd836c67c, true).
item(_69c0f047d5077fafd836c680).
item_name(_69c0f047d5077fafd836c680, 'Boombox').
item_type(_69c0f047d5077fafd836c680, equipment).
item_value(_69c0f047d5077fafd836c680, 15).
item_weight(_69c0f047d5077fafd836c680, 1).
item_tradeable(_69c0f047d5077fafd836c680, true).
item(_69c0f047d5077fafd836c682).
item_name(_69c0f047d5077fafd836c682, 'Vintage Grandfather Clock').
item_type(_69c0f047d5077fafd836c682, decoration).
item_value(_69c0f047d5077fafd836c682, 8).
item_weight(_69c0f047d5077fafd836c682, 1).
item_tradeable(_69c0f047d5077fafd836c682, true).
item(_69c0f047d5077fafd836c683).
item_name(_69c0f047d5077fafd836c683, 'Vintage Oil Lamp').
item_type(_69c0f047d5077fafd836c683, tool).
item_value(_69c0f047d5077fafd836c683, 8).
item_weight(_69c0f047d5077fafd836c683, 1).
item_tradeable(_69c0f047d5077fafd836c683, true).
item(_69c0f047d5077fafd836c684).
item_name(_69c0f047d5077fafd836c684, 'Classic Console').
item_type(_69c0f047d5077fafd836c684, furniture).
item_value(_69c0f047d5077fafd836c684, 15).
item_weight(_69c0f047d5077fafd836c684, 10).
item_tradeable(_69c0f047d5077fafd836c684, true).
item(_69c0f047d5077fafd836c686).
item_name(_69c0f047d5077fafd836c686, 'Tea Set').
item_type(_69c0f047d5077fafd836c686, consumable).
item_value(_69c0f047d5077fafd836c686, 5).
item_weight(_69c0f047d5077fafd836c686, 1).
item_tradeable(_69c0f047d5077fafd836c686, true).
item(_69c0f047d5077fafd836c68a).
item_name(_69c0f047d5077fafd836c68a, 'Cash Register').
item_type(_69c0f047d5077fafd836c68a, decoration).
item_value(_69c0f047d5077fafd836c68a, 8).
item_weight(_69c0f047d5077fafd836c68a, 1).
item_tradeable(_69c0f047d5077fafd836c68a, true).
item(_69c0f047d5077fafd836c68c).
item_name(_69c0f047d5077fafd836c68c, 'Wooden Lantern').
item_type(_69c0f047d5077fafd836c68c, tool).
item_value(_69c0f047d5077fafd836c68c, 8).
item_weight(_69c0f047d5077fafd836c68c, 1).
item_tradeable(_69c0f047d5077fafd836c68c, true).
item(_69c0f047d5077fafd836c68d).
item_name(_69c0f047d5077fafd836c68d, 'Wooden Handle Saber').
item_type(_69c0f047d5077fafd836c68d, weapon).
item_value(_69c0f047d5077fafd836c68d, 20).
item_weight(_69c0f047d5077fafd836c68d, 3).
item_tradeable(_69c0f047d5077fafd836c68d, true).
item(_69c0f047d5077fafd836c68e).
item_name(_69c0f047d5077fafd836c68e, 'Stone Fire Pit').
item_type(_69c0f047d5077fafd836c68e, decoration).
item_value(_69c0f047d5077fafd836c68e, 8).
item_weight(_69c0f047d5077fafd836c68e, 1).
item_tradeable(_69c0f047d5077fafd836c68e, true).
item(_69c0f047d5077fafd836c691).
item_name(_69c0f047d5077fafd836c691, 'Antique Katana').
item_type(_69c0f047d5077fafd836c691, weapon).
item_value(_69c0f047d5077fafd836c691, 20).
item_weight(_69c0f047d5077fafd836c691, 3).
item_tradeable(_69c0f047d5077fafd836c691, true).
item(_69c0f047d5077fafd836c695).
item_name(_69c0f047d5077fafd836c695, 'Cash Register').
item_type(_69c0f047d5077fafd836c695, decoration).
item_value(_69c0f047d5077fafd836c695, 8).
item_weight(_69c0f047d5077fafd836c695, 1).
item_tradeable(_69c0f047d5077fafd836c695, true).
item(_69c0f047d5077fafd836c696).
item_name(_69c0f047d5077fafd836c696, 'Avocado Collectible').
item_type(_69c0f047d5077fafd836c696, collectible).
item_value(_69c0f047d5077fafd836c696, 8).
item_weight(_69c0f047d5077fafd836c696, 0.5).
item_tradeable(_69c0f047d5077fafd836c696, true).
item(_69c0f047d5077fafd836c697).
item_name(_69c0f047d5077fafd836c697, 'Brass Lamp').
item_type(_69c0f047d5077fafd836c697, collectible).
item_value(_69c0f047d5077fafd836c697, 8).
item_weight(_69c0f047d5077fafd836c697, 0.5).
item_tradeable(_69c0f047d5077fafd836c697, true).
item(_69c0f047d5077fafd836c698).
item_name(_69c0f047d5077fafd836c698, 'Chest').
item_type(_69c0f047d5077fafd836c698, collectible).
item_value(_69c0f047d5077fafd836c698, 8).
item_weight(_69c0f047d5077fafd836c698, 0.5).
item_tradeable(_69c0f047d5077fafd836c698, true).
item(_69c0f047d5077fafd836c699).
item_name(_69c0f047d5077fafd836c699, 'Collectible Gem').
item_type(_69c0f047d5077fafd836c699, collectible).
item_value(_69c0f047d5077fafd836c699, 8).
item_weight(_69c0f047d5077fafd836c699, 0.5).
item_tradeable(_69c0f047d5077fafd836c699, true).
item(_69c0f047d5077fafd836c69b).
item_name(_69c0f047d5077fafd836c69b, 'Quest Marker').
item_type(_69c0f047d5077fafd836c69b, collectible).
item_value(_69c0f047d5077fafd836c69b, 8).
item_weight(_69c0f047d5077fafd836c69b, 0.5).
item_tradeable(_69c0f047d5077fafd836c69b, true).
item(_69c0f047d5077fafd836c69c).
item_name(_69c0f047d5077fafd836c69c, 'Treasure Chest').
item_type(_69c0f047d5077fafd836c69c, collectible).
item_value(_69c0f047d5077fafd836c69c, 8).
item_weight(_69c0f047d5077fafd836c69c, 0.5).
item_tradeable(_69c0f047d5077fafd836c69c, true).
item(_69c0f047d5077fafd836c69d).
item_name(_69c0f047d5077fafd836c69d, 'Water Bottle').
item_type(_69c0f047d5077fafd836c69d, collectible).
item_value(_69c0f047d5077fafd836c69d, 8).
item_weight(_69c0f047d5077fafd836c69d, 0.5).
item_tradeable(_69c0f047d5077fafd836c69d, true).
item(_69c0f047d5077fafd836c69e).
item_name(_69c0f047d5077fafd836c69e, 'Ornate Medieval Dagger').
item_type(_69c0f047d5077fafd836c69e, weapon).
item_value(_69c0f047d5077fafd836c69e, 20).
item_weight(_69c0f047d5077fafd836c69e, 3).
item_tradeable(_69c0f047d5077fafd836c69e, true).
item(_69c0f047d5077fafd836c69f).
item_name(_69c0f047d5077fafd836c69f, 'Ornate Medieval Mace').
item_type(_69c0f047d5077fafd836c69f, weapon).
item_value(_69c0f047d5077fafd836c69f, 20).
item_weight(_69c0f047d5077fafd836c69f, 3).
item_tradeable(_69c0f047d5077fafd836c69f, true).
item(_69c0f047d5077fafd836c6a0).
item_name(_69c0f047d5077fafd836c6a0, 'Kite Shield').
item_type(_69c0f047d5077fafd836c6a0, armor).
item_value(_69c0f047d5077fafd836c6a0, 18).
item_weight(_69c0f047d5077fafd836c6a0, 4).
item_tradeable(_69c0f047d5077fafd836c6a0, true).
item(_69c0f047d5077fafd836c6a1).
item_name(_69c0f047d5077fafd836c6a1, 'Machete').
item_type(_69c0f047d5077fafd836c6a1, weapon).
item_value(_69c0f047d5077fafd836c6a1, 20).
item_weight(_69c0f047d5077fafd836c6a1, 3).
item_tradeable(_69c0f047d5077fafd836c6a1, true).
item(_69c0f047d5077fafd836c6a2).
item_name(_69c0f047d5077fafd836c6a2, 'Service Pistol').
item_type(_69c0f047d5077fafd836c6a2, weapon).
item_value(_69c0f047d5077fafd836c6a2, 30).
item_weight(_69c0f047d5077fafd836c6a2, 2).
item_tradeable(_69c0f047d5077fafd836c6a2, true).
item(_69c0f047d5077fafd836c6a3).
item_name(_69c0f047d5077fafd836c6a3, 'Wooden Hammer').
item_type(_69c0f047d5077fafd836c6a3, tool).
item_value(_69c0f047d5077fafd836c6a3, 12).
item_weight(_69c0f047d5077fafd836c6a3, 2).
item_tradeable(_69c0f047d5077fafd836c6a3, true).
item(_69c0f047d5077fafd836c6a6).
item_name(_69c0f047d5077fafd836c6a6, 'Rusted Spade').
item_type(_69c0f047d5077fafd836c6a6, tool).
item_value(_69c0f047d5077fafd836c6a6, 12).
item_weight(_69c0f047d5077fafd836c6a6, 2).
item_tradeable(_69c0f047d5077fafd836c6a6, true).
item(_69c0f047d5077fafd836c6a7).
item_name(_69c0f047d5077fafd836c6a7, 'Baseball Bat').
item_type(_69c0f047d5077fafd836c6a7, weapon).
item_value(_69c0f047d5077fafd836c6a7, 20).
item_weight(_69c0f047d5077fafd836c6a7, 3).
item_tradeable(_69c0f047d5077fafd836c6a7, true).
item(_69c0f047d5077fafd836c6a8).
item_name(_69c0f047d5077fafd836c6a8, 'Brass Blowtorch').
item_type(_69c0f047d5077fafd836c6a8, tool).
item_value(_69c0f047d5077fafd836c6a8, 12).
item_weight(_69c0f047d5077fafd836c6a8, 2).
item_tradeable(_69c0f047d5077fafd836c6a8, true).
item(_69c0f047d5077fafd836c6a9).
item_name(_69c0f047d5077fafd836c6a9, 'Flathead Screwdriver').
item_type(_69c0f047d5077fafd836c6a9, tool).
item_value(_69c0f047d5077fafd836c6a9, 12).
item_weight(_69c0f047d5077fafd836c6a9, 2).
item_tradeable(_69c0f047d5077fafd836c6a9, true).
item(_69c0f047d5077fafd836c6aa).
item_name(_69c0f047d5077fafd836c6aa, 'Wine Bottles').
item_type(_69c0f047d5077fafd836c6aa, container).
item_value(_69c0f047d5077fafd836c6aa, 10).
item_weight(_69c0f047d5077fafd836c6aa, 5).
item_tradeable(_69c0f047d5077fafd836c6aa, true).
item(_69c0f047d5077fafd836c6ab).
item_name(_69c0f047d5077fafd836c6ab, 'Can Rusted').
item_type(_69c0f047d5077fafd836c6ab, container).
item_value(_69c0f047d5077fafd836c6ab, 10).
item_weight(_69c0f047d5077fafd836c6ab, 5).
item_tradeable(_69c0f047d5077fafd836c6ab, true).
item(_69c0f047d5077fafd836c6ad).
item_name(_69c0f047d5077fafd836c6ad, 'Wooden Bowl').
item_type(_69c0f047d5077fafd836c6ad, consumable).
item_value(_69c0f047d5077fafd836c6ad, 3).
item_weight(_69c0f047d5077fafd836c6ad, 0.5).
item_tradeable(_69c0f047d5077fafd836c6ad, true).
item(_69c0f047d5077fafd836c6ae).
item_name(_69c0f047d5077fafd836c6ae, 'Croissant').
item_type(_69c0f047d5077fafd836c6ae, consumable).
item_value(_69c0f047d5077fafd836c6ae, 3).
item_weight(_69c0f047d5077fafd836c6ae, 0.5).
item_tradeable(_69c0f047d5077fafd836c6ae, true).
item(_69c0f047d5077fafd836c6af).
item_name(_69c0f047d5077fafd836c6af, 'Carved Wooden Plate').
item_type(_69c0f047d5077fafd836c6af, consumable).
item_value(_69c0f047d5077fafd836c6af, 3).
item_weight(_69c0f047d5077fafd836c6af, 0.5).
item_tradeable(_69c0f047d5077fafd836c6af, true).
item(_69c0f047d5077fafd836c6b0).
item_name(_69c0f047d5077fafd836c6b0, 'Food Apple').
item_type(_69c0f047d5077fafd836c6b0, consumable).
item_value(_69c0f047d5077fafd836c6b0, 3).
item_weight(_69c0f047d5077fafd836c6b0, 0.5).
item_tradeable(_69c0f047d5077fafd836c6b0, true).
item(_69c0f047d5077fafd836c6b2).
item_name(_69c0f047d5077fafd836c6b2, 'Jug').
item_type(_69c0f047d5077fafd836c6b2, container).
item_value(_69c0f047d5077fafd836c6b2, 10).
item_weight(_69c0f047d5077fafd836c6b2, 5).
item_tradeable(_69c0f047d5077fafd836c6b2, true).
item(_69c0f047d5077fafd836c6b3).
item_name(_69c0f047d5077fafd836c6b3, 'Pot Enamel').
item_type(_69c0f047d5077fafd836c6b3, tool).
item_value(_69c0f047d5077fafd836c6b3, 12).
item_weight(_69c0f047d5077fafd836c6b3, 2).
item_tradeable(_69c0f047d5077fafd836c6b3, true).
item(_69c0f047d5077fafd836c6b6).
item_name(_69c0f047d5077fafd836c6b6, 'Wicker Basket').
item_type(_69c0f047d5077fafd836c6b6, container).
item_value(_69c0f047d5077fafd836c6b6, 10).
item_weight(_69c0f047d5077fafd836c6b6, 5).
item_tradeable(_69c0f047d5077fafd836c6b6, true).
item(_69c0f047d5077fafd836c6b7).
item_name(_69c0f047d5077fafd836c6b7, 'Garden Hose Wall Mounted').
item_type(_69c0f047d5077fafd836c6b7, tool).
item_value(_69c0f047d5077fafd836c6b7, 12).
item_weight(_69c0f047d5077fafd836c6b7, 2).
item_tradeable(_69c0f047d5077fafd836c6b7, true).
item(_69c0f047d5077fafd836c6b8).
item_name(_69c0f047d5077fafd836c6b8, 'Compost Bag').
item_type(_69c0f047d5077fafd836c6b8, container).
item_value(_69c0f047d5077fafd836c6b8, 10).
item_weight(_69c0f047d5077fafd836c6b8, 5).
item_tradeable(_69c0f047d5077fafd836c6b8, true).
item(_69c0f047d5077fafd836c6b9).
item_name(_69c0f047d5077fafd836c6b9, 'Postcard Set').
item_type(_69c0f047d5077fafd836c6b9, document).
item_value(_69c0f047d5077fafd836c6b9, 2).
item_weight(_69c0f047d5077fafd836c6b9, 0.1).
item_tradeable(_69c0f047d5077fafd836c6b9, true).
item(_69c0f047d5077fafd836c6ba).
item_name(_69c0f047d5077fafd836c6ba, 'Cardboard Box').
item_type(_69c0f047d5077fafd836c6ba, container).
item_value(_69c0f047d5077fafd836c6ba, 10).
item_weight(_69c0f047d5077fafd836c6ba, 5).
item_tradeable(_69c0f047d5077fafd836c6ba, true).
item(_69c0f047d5077fafd836c6bb).
item_name(_69c0f047d5077fafd836c6bb, 'Vintage Lighter').
item_type(_69c0f047d5077fafd836c6bb, collectible).
item_value(_69c0f047d5077fafd836c6bb, 8).
item_weight(_69c0f047d5077fafd836c6bb, 0.5).
item_tradeable(_69c0f047d5077fafd836c6bb, true).
item(_69c0f047d5077fafd836c6bc).
item_name(_69c0f047d5077fafd836c6bc, 'Propane Tank').
item_type(_69c0f047d5077fafd836c6bc, container).
item_value(_69c0f047d5077fafd836c6bc, 10).
item_weight(_69c0f047d5077fafd836c6bc, 5).
item_tradeable(_69c0f047d5077fafd836c6bc, true).
item(_69c0f047d5077fafd836c6bd).
item_name(_69c0f047d5077fafd836c6bd, 'Metal Tool Chest').
item_type(_69c0f047d5077fafd836c6bd, container).
item_value(_69c0f047d5077fafd836c6bd, 10).
item_weight(_69c0f047d5077fafd836c6bd, 5).
item_tradeable(_69c0f047d5077fafd836c6bd, true).
item(_69c0f047d5077fafd836c6be).
item_name(_69c0f047d5077fafd836c6be, 'Brass Vase').
item_type(_69c0f047d5077fafd836c6be, decoration).
item_value(_69c0f047d5077fafd836c6be, 8).
item_weight(_69c0f047d5077fafd836c6be, 1).
item_tradeable(_69c0f047d5077fafd836c6be, true).
item(_69c0f047d5077fafd836c6bf).
item_name(_69c0f047d5077fafd836c6bf, 'Modular Electric Cables').
item_type(_69c0f047d5077fafd836c6bf, material).
item_value(_69c0f047d5077fafd836c6bf, 2).
item_weight(_69c0f047d5077fafd836c6bf, 1).
item_tradeable(_69c0f047d5077fafd836c6bf, true).
item(_69c0f047d5077fafd836c6c0).
item_name(_69c0f047d5077fafd836c6c0, 'Gothic Commode').
item_type(_69c0f047d5077fafd836c6c0, furniture).
item_value(_69c0f047d5077fafd836c6c0, 15).
item_weight(_69c0f047d5077fafd836c6c0, 10).
item_tradeable(_69c0f047d5077fafd836c6c0, true).
item(_69c0f047d5077fafd836c6c2).
item_name(_69c0f047d5077fafd836c6c2, 'Key Gold').
item_type(_69c0f047d5077fafd836c6c2, collectible).
item_value(_69c0f047d5077fafd836c6c2, 8).
item_weight(_69c0f047d5077fafd836c6c2, 0.5).
item_tradeable(_69c0f047d5077fafd836c6c2, true).
item(_69c0f047d5077fafd836c6c3).
item_name(_69c0f047d5077fafd836c6c3, 'Potion').
item_type(_69c0f047d5077fafd836c6c3, consumable).
item_value(_69c0f047d5077fafd836c6c3, 10).
item_weight(_69c0f047d5077fafd836c6c3, 0.5).
item_tradeable(_69c0f047d5077fafd836c6c3, true).
item(_69c0f047d5077fafd836c6c4).
item_name(_69c0f047d5077fafd836c6c4, 'Gun Revolver Scifi').
item_type(_69c0f047d5077fafd836c6c4, weapon).
item_value(_69c0f047d5077fafd836c6c4, 30).
item_weight(_69c0f047d5077fafd836c6c4, 2).
item_tradeable(_69c0f047d5077fafd836c6c4, true).
item(_69c0f047d5077fafd836c6c5).
item_name(_69c0f047d5077fafd836c6c5, 'Gun Rifle Scifi').
item_type(_69c0f047d5077fafd836c6c5, weapon).
item_value(_69c0f047d5077fafd836c6c5, 30).
item_weight(_69c0f047d5077fafd836c6c5, 2).
item_tradeable(_69c0f047d5077fafd836c6c5, true).
item(_69c0f047d5077fafd836c6c6).
item_name(_69c0f047d5077fafd836c6c6, 'Grenade Scifi').
item_type(_69c0f047d5077fafd836c6c6, weapon).
item_value(_69c0f047d5077fafd836c6c6, 20).
item_weight(_69c0f047d5077fafd836c6c6, 3).
item_tradeable(_69c0f047d5077fafd836c6c6, true).
item(_69c0f047d5077fafd836c6c7).
item_name(_69c0f047d5077fafd836c6c7, 'Health Pack Scifi').
item_type(_69c0f047d5077fafd836c6c7, consumable).
item_value(_69c0f047d5077fafd836c6c7, 15).
item_weight(_69c0f047d5077fafd836c6c7, 0.5).
item_tradeable(_69c0f047d5077fafd836c6c7, true).
item(_69c0f047d5077fafd836c6c8).
item_name(_69c0f047d5077fafd836c6c8, 'Keycard Scifi').
item_type(_69c0f047d5077fafd836c6c8, key).
item_value(_69c0f047d5077fafd836c6c8, 5).
item_weight(_69c0f047d5077fafd836c6c8, 0.1).
item_tradeable(_69c0f047d5077fafd836c6c8, true).
item(_69c0f047d5077fafd836c6c9).
item_name(_69c0f047d5077fafd836c6c9, 'Syringe Scifi').
item_type(_69c0f047d5077fafd836c6c9, consumable).
item_value(_69c0f047d5077fafd836c6c9, 15).
item_weight(_69c0f047d5077fafd836c6c9, 0.5).
item_tradeable(_69c0f047d5077fafd836c6c9, true).
item(_69c0f047d5077fafd836c6ca).
item_name(_69c0f047d5077fafd836c6ca, 'Energy Core Scifi').
item_type(_69c0f047d5077fafd836c6ca, equipment).
item_value(_69c0f047d5077fafd836c6ca, 15).
item_weight(_69c0f047d5077fafd836c6ca, 1).
item_tradeable(_69c0f047d5077fafd836c6ca, true).
item(_69c0f047d5077fafd836c6cb).
item_name(_69c0f047d5077fafd836c6cb, 'Data Pad Scifi').
item_type(_69c0f047d5077fafd836c6cb, equipment).
item_value(_69c0f047d5077fafd836c6cb, 15).
item_weight(_69c0f047d5077fafd836c6cb, 1).
item_tradeable(_69c0f047d5077fafd836c6cb, true).
item(_69c0f047d5077fafd836c6cc).
item_name(_69c0f047d5077fafd836c6cc, 'Necklace Rpg').
item_type(_69c0f047d5077fafd836c6cc, accessory).
item_value(_69c0f047d5077fafd836c6cc, 50).
item_weight(_69c0f047d5077fafd836c6cc, 0.2).
item_tradeable(_69c0f047d5077fafd836c6cc, true).
item(_69c0f047d5077fafd836c6cd).
item_name(_69c0f047d5077fafd836c6cd, 'Armor Leather').
item_type(_69c0f047d5077fafd836c6cd, armor).
item_value(_69c0f047d5077fafd836c6cd, 25).
item_weight(_69c0f047d5077fafd836c6cd, 5).
item_tradeable(_69c0f047d5077fafd836c6cd, true).
item(_69c0f047d5077fafd836c6ce).
item_name(_69c0f047d5077fafd836c6ce, 'Crown').
item_type(_69c0f047d5077fafd836c6ce, accessory).
item_value(_69c0f047d5077fafd836c6ce, 50).
item_weight(_69c0f047d5077fafd836c6ce, 0.2).
item_tradeable(_69c0f047d5077fafd836c6ce, true).
item(_69c0f047d5077fafd836c6cf).
item_name(_69c0f047d5077fafd836c6cf, 'Crystal').
item_type(_69c0f047d5077fafd836c6cf, collectible).
item_value(_69c0f047d5077fafd836c6cf, 8).
item_weight(_69c0f047d5077fafd836c6cf, 0.5).
item_tradeable(_69c0f047d5077fafd836c6cf, true).
item(_69c0f047d5077fafd836c6d0).
item_name(_69c0f047d5077fafd836c6d0, 'Ring Rpg').
item_type(_69c0f047d5077fafd836c6d0, accessory).
item_value(_69c0f047d5077fafd836c6d0, 50).
item_weight(_69c0f047d5077fafd836c6d0, 0.2).
item_tradeable(_69c0f047d5077fafd836c6d0, true).
item(_69c0f047d5077fafd836c6d1).
item_name(_69c0f047d5077fafd836c6d1, 'Helmet Rpg').
item_type(_69c0f047d5077fafd836c6d1, armor).
item_value(_69c0f047d5077fafd836c6d1, 25).
item_weight(_69c0f047d5077fafd836c6d1, 5).
item_tradeable(_69c0f047d5077fafd836c6d1, true).
item(_69c0f047d5077fafd836c6d3).
item_name(_69c0f047d5077fafd836c6d3, 'Bow Rpg').
item_type(_69c0f047d5077fafd836c6d3, weapon).
item_value(_69c0f047d5077fafd836c6d3, 30).
item_weight(_69c0f047d5077fafd836c6d3, 2).
item_tradeable(_69c0f047d5077fafd836c6d3, true).
item(_69c0f047d5077fafd836c6d4).
item_name(_69c0f047d5077fafd836c6d4, 'Arrow Quiver').
item_type(_69c0f047d5077fafd836c6d4, ammunition).
item_value(_69c0f047d5077fafd836c6d4, 2).
item_weight(_69c0f047d5077fafd836c6d4, 0.1).
item_tradeable(_69c0f047d5077fafd836c6d4, true).
item(_69c0f047d5077fafd836c6d5).
item_name(_69c0f047d5077fafd836c6d5, 'Armor Metal').
item_type(_69c0f047d5077fafd836c6d5, armor).
item_value(_69c0f047d5077fafd836c6d5, 25).
item_weight(_69c0f047d5077fafd836c6d5, 5).
item_tradeable(_69c0f047d5077fafd836c6d5, true).
item(_69c0f047d5077fafd836c6d6).
item_name(_69c0f047d5077fafd836c6d6, 'Glove Boots').
item_type(_69c0f047d5077fafd836c6d6, armor).
item_value(_69c0f047d5077fafd836c6d6, 25).
item_weight(_69c0f047d5077fafd836c6d6, 5).
item_tradeable(_69c0f047d5077fafd836c6d6, true).
item(_69c0f047d5077fafd836c6d7).
item_name(_69c0f047d5077fafd836c6d7, 'Scroll Rpg').
item_type(_69c0f047d5077fafd836c6d7, document).
item_value(_69c0f047d5077fafd836c6d7, 2).
item_weight(_69c0f047d5077fafd836c6d7, 0.1).
item_tradeable(_69c0f047d5077fafd836c6d7, true).
item(_69c0f047d5077fafd836c6d8).
item_name(_69c0f047d5077fafd836c6d8, 'Backpack Saddle').
item_type(_69c0f047d5077fafd836c6d8, container).
item_value(_69c0f047d5077fafd836c6d8, 10).
item_weight(_69c0f047d5077fafd836c6d8, 5).
item_tradeable(_69c0f047d5077fafd836c6d8, true).
item(_69c0f047d5077fafd836c6d9).
item_name(_69c0f047d5077fafd836c6d9, 'Battery Survival').
item_type(_69c0f047d5077fafd836c6d9, material).
item_value(_69c0f047d5077fafd836c6d9, 2).
item_weight(_69c0f047d5077fafd836c6d9, 1).
item_tradeable(_69c0f047d5077fafd836c6d9, true).
item(_69c0f047d5077fafd836c6da).
item_name(_69c0f047d5077fafd836c6da, 'Matchbox').
item_type(_69c0f047d5077fafd836c6da, collectible).
item_value(_69c0f047d5077fafd836c6da, 8).
item_weight(_69c0f047d5077fafd836c6da, 0.5).
item_tradeable(_69c0f047d5077fafd836c6da, true).
item(_69c0f047d5077fafd836c6de).
item_name(_69c0f047d5077fafd836c6de, 'Alarm Clock').
item_type(_69c0f047d5077fafd836c6de, decoration).
item_value(_69c0f047d5077fafd836c6de, 8).
item_weight(_69c0f047d5077fafd836c6de, 1).
item_tradeable(_69c0f047d5077fafd836c6de, true).
item(_69c0f047d5077fafd836c6df).
item_name(_69c0f047d5077fafd836c6df, 'Antique Ceramic Vase').
item_type(_69c0f047d5077fafd836c6df, tool).
item_value(_69c0f047d5077fafd836c6df, 12).
item_weight(_69c0f047d5077fafd836c6df, 2).
item_tradeable(_69c0f047d5077fafd836c6df, true).
item(_69c0f047d5077fafd836c6e2).
item_name(_69c0f047d5077fafd836c6e2, 'Brass Pot').
item_type(_69c0f047d5077fafd836c6e2, tool).
item_value(_69c0f047d5077fafd836c6e2, 12).
item_weight(_69c0f047d5077fafd836c6e2, 2).
item_tradeable(_69c0f047d5077fafd836c6e2, true).
item(_69c0f047d5077fafd836c6e4).
item_name(_69c0f047d5077fafd836c6e4, 'Ceramic Vase').
item_type(_69c0f047d5077fafd836c6e4, tool).
item_value(_69c0f047d5077fafd836c6e4, 12).
item_weight(_69c0f047d5077fafd836c6e4, 2).
item_tradeable(_69c0f047d5077fafd836c6e4, true).
item(_69c0f047d5077fafd836c6e5).
item_name(_69c0f047d5077fafd836c6e5, 'Ceramic Vase').
item_type(_69c0f047d5077fafd836c6e5, container).
item_value(_69c0f047d5077fafd836c6e5, 10).
item_weight(_69c0f047d5077fafd836c6e5, 5).
item_tradeable(_69c0f047d5077fafd836c6e5, true).
item(_69c0f047d5077fafd836c6e6).
item_name(_69c0f047d5077fafd836c6e6, 'Chess Set').
item_type(_69c0f047d5077fafd836c6e6, decoration).
item_value(_69c0f047d5077fafd836c6e6, 8).
item_weight(_69c0f047d5077fafd836c6e6, 1).
item_tradeable(_69c0f047d5077fafd836c6e6, true).
item(_69c0f047d5077fafd836c6e7).
item_name(_69c0f047d5077fafd836c6e7, 'Concrete Cat Statue').
item_type(_69c0f047d5077fafd836c6e7, decoration).
item_value(_69c0f047d5077fafd836c6e7, 8).
item_weight(_69c0f047d5077fafd836c6e7, 1).
item_tradeable(_69c0f047d5077fafd836c6e7, true).
item(_69c0f047d5077fafd836c6e8).
item_name(_69c0f047d5077fafd836c6e8, 'Crowbar').
item_type(_69c0f047d5077fafd836c6e8, tool).
item_value(_69c0f047d5077fafd836c6e8, 12).
item_weight(_69c0f047d5077fafd836c6e8, 2).
item_tradeable(_69c0f047d5077fafd836c6e8, true).
item(_69c0f047d5077fafd836c6e9).
item_name(_69c0f047d5077fafd836c6e9, 'Metal Trash Can').
item_type(_69c0f047d5077fafd836c6e9, container).
item_value(_69c0f047d5077fafd836c6e9, 10).
item_weight(_69c0f047d5077fafd836c6e9, 5).
item_tradeable(_69c0f047d5077fafd836c6e9, true).
item(_69c0f047d5077fafd836c6ea).
item_name(_69c0f047d5077fafd836c6ea, 'Wooden Bucket').
item_type(_69c0f047d5077fafd836c6ea, container).
item_value(_69c0f047d5077fafd836c6ea, 10).
item_weight(_69c0f047d5077fafd836c6ea, 5).
item_tradeable(_69c0f047d5077fafd836c6ea, true).
item(_69c0f047d5077fafd836c6eb).
item_name(_69c0f047d5077fafd836c6eb, 'Chandelier').
item_type(_69c0f047d5077fafd836c6eb, tool).
item_value(_69c0f047d5077fafd836c6eb, 8).
item_weight(_69c0f047d5077fafd836c6eb, 1).
item_tradeable(_69c0f047d5077fafd836c6eb, true).
item(_69c0f047d5077fafd836c6ed).
item_name(_69c0f047d5077fafd836c6ed, 'Camera').
item_type(_69c0f047d5077fafd836c6ed, equipment).
item_value(_69c0f047d5077fafd836c6ed, 15).
item_weight(_69c0f047d5077fafd836c6ed, 1).
item_tradeable(_69c0f047d5077fafd836c6ed, true).
item(_69c0f047d5077fafd836c6ef).
item_name(_69c0f047d5077fafd836c6ef, 'Chandelier').
item_type(_69c0f047d5077fafd836c6ef, tool).
item_value(_69c0f047d5077fafd836c6ef, 8).
item_weight(_69c0f047d5077fafd836c6ef, 1).
item_tradeable(_69c0f047d5077fafd836c6ef, true).
item(_69c0f047d5077fafd836c6f3).
item_name(_69c0f047d5077fafd836c6f3, 'Megaphone').
item_type(_69c0f047d5077fafd836c6f3, tool).
item_value(_69c0f047d5077fafd836c6f3, 12).
item_weight(_69c0f047d5077fafd836c6f3, 2).
item_tradeable(_69c0f047d5077fafd836c6f3, true).
item(_69c0f047d5077fafd836c6fd).
item_name(_69c0f047d5077fafd836c6fd, 'All Purpose Cleaner').
item_type(_69c0f047d5077fafd836c6fd, container).
item_value(_69c0f047d5077fafd836c6fd, 10).
item_weight(_69c0f047d5077fafd836c6fd, 5).
item_tradeable(_69c0f047d5077fafd836c6fd, true).
item(_69c0f047d5077fafd836c6fe).
item_name(_69c0f047d5077fafd836c6fe, 'American Football').
item_type(_69c0f047d5077fafd836c6fe, collectible).
item_value(_69c0f047d5077fafd836c6fe, 8).
item_weight(_69c0f047d5077fafd836c6fe, 0.5).
item_tradeable(_69c0f047d5077fafd836c6fe, true).
item(_69c0f047d5077fafd836c6ff).
item_name(_69c0f047d5077fafd836c6ff, 'Bleach Bottle').
item_type(_69c0f047d5077fafd836c6ff, container).
item_value(_69c0f047d5077fafd836c6ff, 10).
item_weight(_69c0f047d5077fafd836c6ff, 5).
item_tradeable(_69c0f047d5077fafd836c6ff, true).
item(_69c0f047d5077fafd836c700).
item_name(_69c0f047d5077fafd836c700, 'Baseball').
item_type(_69c0f047d5077fafd836c700, collectible).
item_value(_69c0f047d5077fafd836c700, 8).
item_weight(_69c0f047d5077fafd836c700, 0.5).
item_tradeable(_69c0f047d5077fafd836c700, true).
item(_69c0f047d5077fafd836c702).
item_name(_69c0f047d5077fafd836c702, 'Brass Vase').
item_type(_69c0f047d5077fafd836c702, decoration).
item_value(_69c0f047d5077fafd836c702, 8).
item_weight(_69c0f047d5077fafd836c702, 1).
item_tradeable(_69c0f047d5077fafd836c702, true).
item(_69c0f047d5077fafd836c703).
item_name(_69c0f047d5077fafd836c703, 'Brass Vase').
item_type(_69c0f047d5077fafd836c703, container).
item_value(_69c0f047d5077fafd836c703, 10).
item_weight(_69c0f047d5077fafd836c703, 5).
item_tradeable(_69c0f047d5077fafd836c703, true).
item(_69c0f047d5077fafd836c704).
item_name(_69c0f047d5077fafd836c704, 'Bull Head').
item_type(_69c0f047d5077fafd836c704, decoration).
item_value(_69c0f047d5077fafd836c704, 8).
item_weight(_69c0f047d5077fafd836c704, 1).
item_tradeable(_69c0f047d5077fafd836c704, true).
item(_69c0f047d5077fafd836c705).
item_name(_69c0f047d5077fafd836c705, 'Brass Vase').
item_type(_69c0f047d5077fafd836c705, container).
item_value(_69c0f047d5077fafd836c705, 10).
item_weight(_69c0f047d5077fafd836c705, 5).
item_tradeable(_69c0f047d5077fafd836c705, true).
item(_69c0f047d5077fafd836c706).
item_name(_69c0f047d5077fafd836c706, 'Cannon').
item_type(_69c0f047d5077fafd836c706, weapon).
item_value(_69c0f047d5077fafd836c706, 30).
item_weight(_69c0f047d5077fafd836c706, 2).
item_tradeable(_69c0f047d5077fafd836c706, true).
item(_69c0f047d5077fafd836c707).
item_name(_69c0f047d5077fafd836c707, 'Cassette Player').
item_type(_69c0f047d5077fafd836c707, equipment).
item_value(_69c0f047d5077fafd836c707, 15).
item_weight(_69c0f047d5077fafd836c707, 1).
item_tradeable(_69c0f047d5077fafd836c707, true).
item(_69c0f047d5077fafd836c708).
item_name(_69c0f047d5077fafd836c708, 'Ceramic Vase').
item_type(_69c0f047d5077fafd836c708, container).
item_value(_69c0f047d5077fafd836c708, 10).
item_weight(_69c0f047d5077fafd836c708, 5).
item_tradeable(_69c0f047d5077fafd836c708, true).
item(_69c0f047d5077fafd836c709).
item_name(_69c0f047d5077fafd836c709, 'Ceramic Vase').
item_type(_69c0f047d5077fafd836c709, tool).
item_value(_69c0f047d5077fafd836c709, 12).
item_weight(_69c0f047d5077fafd836c709, 2).
item_tradeable(_69c0f047d5077fafd836c709, true).
item(_69c0f047d5077fafd836c70c).
item_name(_69c0f047d5077fafd836c70c, 'Chinese Chandelier').
item_type(_69c0f047d5077fafd836c70c, decoration).
item_value(_69c0f047d5077fafd836c70c, 8).
item_weight(_69c0f047d5077fafd836c70c, 1).
item_tradeable(_69c0f047d5077fafd836c70c, true).
item(_69c0f047d5077fafd836c70d).
item_name(_69c0f047d5077fafd836c70d, 'Chinese Screen Panels').
item_type(_69c0f047d5077fafd836c70d, furniture).
item_value(_69c0f047d5077fafd836c70d, 15).
item_weight(_69c0f047d5077fafd836c70d, 10).
item_tradeable(_69c0f047d5077fafd836c70d, true).
item(_69c0f047d5077fafd836c70f).
item_name(_69c0f047d5077fafd836c70f, 'Chinese Commode').
item_type(_69c0f047d5077fafd836c70f, furniture).
item_value(_69c0f047d5077fafd836c70f, 15).
item_weight(_69c0f047d5077fafd836c70f, 10).
item_tradeable(_69c0f047d5077fafd836c70f, true).
item(_69c0f047d5077fafd836c710).
item_name(_69c0f047d5077fafd836c710, 'Chinese Sofa').
item_type(_69c0f047d5077fafd836c710, furniture).
item_value(_69c0f047d5077fafd836c710, 15).
item_weight(_69c0f047d5077fafd836c710, 10).
item_tradeable(_69c0f047d5077fafd836c710, true).
item(_69c0f047d5077fafd836c713).
item_name(_69c0f047d5077fafd836c713, 'Cleaner Tin').
item_type(_69c0f047d5077fafd836c713, tool).
item_value(_69c0f047d5077fafd836c713, 12).
item_weight(_69c0f047d5077fafd836c713, 2).
item_tradeable(_69c0f047d5077fafd836c713, true).
item(_69c0f047d5077fafd836c715).
item_name(_69c0f047d5077fafd836c715, 'Compost Bags').
item_type(_69c0f047d5077fafd836c715, container).
item_value(_69c0f047d5077fafd836c715, 10).
item_weight(_69c0f047d5077fafd836c715, 5).
item_tradeable(_69c0f047d5077fafd836c715, true).
item(_69c0f047d5077fafd836c716).
item_name(_69c0f047d5077fafd836c716, 'Cross Pein Hammer').
item_type(_69c0f047d5077fafd836c716, tool).
item_value(_69c0f047d5077fafd836c716, 12).
item_weight(_69c0f047d5077fafd836c716, 2).
item_tradeable(_69c0f047d5077fafd836c716, true).
item(_69c0f047d5077fafd836c717).
item_name(_69c0f047d5077fafd836c717, 'Dartboard').
item_type(_69c0f047d5077fafd836c717, decoration).
item_value(_69c0f047d5077fafd836c717, 8).
item_weight(_69c0f047d5077fafd836c717, 1).
item_tradeable(_69c0f047d5077fafd836c717, true).
item(_69c0f047d5077fafd836c719).
item_name(_69c0f047d5077fafd836c719, 'Desk Lamp Arm').
item_type(_69c0f047d5077fafd836c719, furniture).
item_value(_69c0f047d5077fafd836c719, 15).
item_weight(_69c0f047d5077fafd836c719, 10).
item_tradeable(_69c0f047d5077fafd836c719, true).
item(_69c0f047d5077fafd836c71a).
item_name(_69c0f047d5077fafd836c71a, 'Drain Cleaner').
item_type(_69c0f047d5077fafd836c71a, tool).
item_value(_69c0f047d5077fafd836c71a, 12).
item_weight(_69c0f047d5077fafd836c71a, 2).
item_tradeable(_69c0f047d5077fafd836c71a, true).
item(_69c0f047d5077fafd836c71e).
item_name(_69c0f047d5077fafd836c71e, 'Electric Stove').
item_type(_69c0f047d5077fafd836c71e, equipment).
item_value(_69c0f047d5077fafd836c71e, 15).
item_weight(_69c0f047d5077fafd836c71e, 1).
item_tradeable(_69c0f047d5077fafd836c71e, true).
item(_69c0f047d5077fafd836c720).
item_name(_69c0f047d5077fafd836c720, 'Fancy Picture Frame').
item_type(_69c0f047d5077fafd836c720, decoration).
item_value(_69c0f047d5077fafd836c720, 8).
item_weight(_69c0f047d5077fafd836c720, 1).
item_tradeable(_69c0f047d5077fafd836c720, true).
item(_69c0f047d5077fafd836c721).
item_name(_69c0f047d5077fafd836c721, 'Fancy Picture Frame').
item_type(_69c0f047d5077fafd836c721, decoration).
item_value(_69c0f047d5077fafd836c721, 8).
item_weight(_69c0f047d5077fafd836c721, 1).
item_tradeable(_69c0f047d5077fafd836c721, true).
item(_69c0f047d5077fafd836c724).
item_name(_69c0f047d5077fafd836c724, 'Football').
item_type(_69c0f047d5077fafd836c724, collectible).
item_value(_69c0f047d5077fafd836c724, 8).
item_weight(_69c0f047d5077fafd836c724, 0.5).
item_tradeable(_69c0f047d5077fafd836c724, true).
item(_69c0f047d5077fafd836c725).
item_name(_69c0f047d5077fafd836c725, 'Gamepad').
item_type(_69c0f047d5077fafd836c725, collectible).
item_value(_69c0f047d5077fafd836c725, 8).
item_weight(_69c0f047d5077fafd836c725, 0.5).
item_tradeable(_69c0f047d5077fafd836c725, true).
item(_69c0f047d5077fafd836c727).
item_name(_69c0f047d5077fafd836c727, 'Gaming Console').
item_type(_69c0f047d5077fafd836c727, equipment).
item_value(_69c0f047d5077fafd836c727, 15).
item_weight(_69c0f047d5077fafd836c727, 1).
item_tradeable(_69c0f047d5077fafd836c727, true).
item(_69c0f047d5077fafd836c728).
item_name(_69c0f047d5077fafd836c728, 'Garden Sprinkler').
item_type(_69c0f047d5077fafd836c728, tool).
item_value(_69c0f047d5077fafd836c728, 12).
item_weight(_69c0f047d5077fafd836c728, 2).
item_tradeable(_69c0f047d5077fafd836c728, true).
item(_69c0f047d5077fafd836c729).
item_name(_69c0f047d5077fafd836c729, 'Garden Gloves').
item_type(_69c0f047d5077fafd836c729, armor).
item_value(_69c0f047d5077fafd836c729, 25).
item_weight(_69c0f047d5077fafd836c729, 5).
item_tradeable(_69c0f047d5077fafd836c729, true).
item(_69c0f047d5077fafd836c72a).
item_name(_69c0f047d5077fafd836c72a, 'Garden Gnome').
item_type(_69c0f047d5077fafd836c72a, decoration).
item_value(_69c0f047d5077fafd836c72a, 8).
item_weight(_69c0f047d5077fafd836c72a, 1).
item_tradeable(_69c0f047d5077fafd836c72a, true).
item(_69c0f047d5077fafd836c72c).
item_name(_69c0f047d5077fafd836c72c, 'Hamburger Buns').
item_type(_69c0f047d5077fafd836c72c, consumable).
item_value(_69c0f047d5077fafd836c72c, 3).
item_weight(_69c0f047d5077fafd836c72c, 0.5).
item_tradeable(_69c0f047d5077fafd836c72c, true).
item(_69c0f047d5077fafd836c72d).
item_name(_69c0f047d5077fafd836c72d, 'Hanging Picture Frame').
item_type(_69c0f047d5077fafd836c72d, decoration).
item_value(_69c0f047d5077fafd836c72d, 8).
item_weight(_69c0f047d5077fafd836c72d, 1).
item_tradeable(_69c0f047d5077fafd836c72d, true).
item(_69c0f047d5077fafd836c72f).
item_name(_69c0f047d5077fafd836c72f, 'Hanging Industrial Lamp').
item_type(_69c0f047d5077fafd836c72f, decoration).
item_value(_69c0f047d5077fafd836c72f, 8).
item_weight(_69c0f047d5077fafd836c72f, 1).
item_tradeable(_69c0f047d5077fafd836c72f, true).
item(_69c0f047d5077fafd836c733).
item_name(_69c0f047d5077fafd836c733, 'Horse Statue').
item_type(_69c0f047d5077fafd836c733, decoration).
item_value(_69c0f047d5077fafd836c733, 8).
item_weight(_69c0f047d5077fafd836c733, 1).
item_tradeable(_69c0f047d5077fafd836c733, true).
item(_69c0f047d5077fafd836c734).
item_name(_69c0f047d5077fafd836c734, 'Horse Head').
item_type(_69c0f047d5077fafd836c734, decoration).
item_value(_69c0f047d5077fafd836c734, 8).
item_weight(_69c0f047d5077fafd836c734, 1).
item_tradeable(_69c0f047d5077fafd836c734, true).
item(_69c0f047d5077fafd836c736).
item_name(_69c0f047d5077fafd836c736, 'Industrial Wall Sconce').
item_type(_69c0f047d5077fafd836c736, decoration).
item_value(_69c0f047d5077fafd836c736, 8).
item_weight(_69c0f047d5077fafd836c736, 1).
item_tradeable(_69c0f047d5077fafd836c736, true).
item(_69c0f047d5077fafd836c737).
item_name(_69c0f047d5077fafd836c737, 'Industrial Wall Lamp').
item_type(_69c0f047d5077fafd836c737, decoration).
item_value(_69c0f047d5077fafd836c737, 8).
item_weight(_69c0f047d5077fafd836c737, 1).
item_tradeable(_69c0f047d5077fafd836c737, true).
item(_69c0f047d5077fafd836c738).
item_name(_69c0f047d5077fafd836c738, 'Katana Stand').
item_type(_69c0f047d5077fafd836c738, weapon).
item_value(_69c0f047d5077fafd836c738, 20).
item_weight(_69c0f047d5077fafd836c738, 3).
item_tradeable(_69c0f047d5077fafd836c738, true).
item(_69c0f047d5077fafd836c739).
item_name(_69c0f047d5077fafd836c739, 'Korean Public Payphone').
item_type(_69c0f047d5077fafd836c739, equipment).
item_value(_69c0f047d5077fafd836c739, 15).
item_weight(_69c0f047d5077fafd836c739, 1).
item_tradeable(_69c0f047d5077fafd836c739, true).
item(_69c0f047d5077fafd836c73a).
item_name(_69c0f047d5077fafd836c73a, 'Korean Fire Extinguisher').
item_type(_69c0f047d5077fafd836c73a, collectible).
item_value(_69c0f047d5077fafd836c73a, 8).
item_weight(_69c0f047d5077fafd836c73a, 0.5).
item_tradeable(_69c0f047d5077fafd836c73a, true).
item(_69c0f047d5077fafd836c73c).
item_name(_69c0f047d5077fafd836c73c, 'Lightbulb').
item_type(_69c0f047d5077fafd836c73c, tool).
item_value(_69c0f047d5077fafd836c73c, 8).
item_weight(_69c0f047d5077fafd836c73c, 1).
item_tradeable(_69c0f047d5077fafd836c73c, true).
item(_69c0f047d5077fafd836c73e).
item_name(_69c0f047d5077fafd836c73e, 'Lion Head').
item_type(_69c0f047d5077fafd836c73e, decoration).
item_value(_69c0f047d5077fafd836c73e, 8).
item_weight(_69c0f047d5077fafd836c73e, 1).
item_tradeable(_69c0f047d5077fafd836c73e, true).
item(_69c0f047d5077fafd836c740).
item_name(_69c0f047d5077fafd836c740, 'Lightbulb Led').
item_type(_69c0f047d5077fafd836c740, equipment).
item_value(_69c0f047d5077fafd836c740, 15).
item_weight(_69c0f047d5077fafd836c740, 1).
item_tradeable(_69c0f047d5077fafd836c740, true).
item(_69c0f047d5077fafd836c741).
item_name(_69c0f047d5077fafd836c741, 'Marble Bust').
item_type(_69c0f047d5077fafd836c741, decoration).
item_value(_69c0f047d5077fafd836c741, 8).
item_weight(_69c0f047d5077fafd836c741, 1).
item_tradeable(_69c0f047d5077fafd836c741, true).
item(_69c0f047d5077fafd836c742).
item_name(_69c0f047d5077fafd836c742, 'Magnifying Glass').
item_type(_69c0f047d5077fafd836c742, tool).
item_value(_69c0f047d5077fafd836c742, 12).
item_weight(_69c0f047d5077fafd836c742, 2).
item_tradeable(_69c0f047d5077fafd836c742, true).
item(_69c0f047d5077fafd836c743).
item_name(_69c0f047d5077fafd836c743, 'Mantel Clock').
item_type(_69c0f047d5077fafd836c743, decoration).
item_value(_69c0f047d5077fafd836c743, 8).
item_weight(_69c0f047d5077fafd836c743, 1).
item_tradeable(_69c0f047d5077fafd836c743, true).
item(_69c0f047d5077fafd836c744).
item_name(_69c0f047d5077fafd836c744, 'Metal Jerrycan').
item_type(_69c0f047d5077fafd836c744, container).
item_value(_69c0f047d5077fafd836c744, 10).
item_weight(_69c0f047d5077fafd836c744, 5).
item_tradeable(_69c0f047d5077fafd836c744, true).
item(_69c0f047d5077fafd836c745).
item_name(_69c0f047d5077fafd836c745, 'Measuring Tape').
item_type(_69c0f047d5077fafd836c745, tool).
item_value(_69c0f047d5077fafd836c745, 12).
item_weight(_69c0f047d5077fafd836c745, 2).
item_tradeable(_69c0f047d5077fafd836c745, true).
item(_69c0f047d5077fafd836c746).
item_name(_69c0f047d5077fafd836c746, 'Metal Detector').
item_type(_69c0f047d5077fafd836c746, equipment).
item_value(_69c0f047d5077fafd836c746, 15).
item_weight(_69c0f047d5077fafd836c746, 1).
item_tradeable(_69c0f047d5077fafd836c746, true).
item(_69c0f047d5077fafd836c749).
item_name(_69c0f047d5077fafd836c749, 'Metal Jug').
item_type(_69c0f047d5077fafd836c749, container).
item_value(_69c0f047d5077fafd836c749, 10).
item_weight(_69c0f047d5077fafd836c749, 5).
item_tradeable(_69c0f047d5077fafd836c749, true).
item(_69c0f047d5077fafd836c74b).
item_name(_69c0f047d5077fafd836c74b, 'Modern Ceiling Lamp').
item_type(_69c0f047d5077fafd836c74b, decoration).
item_value(_69c0f047d5077fafd836c74b, 8).
item_weight(_69c0f047d5077fafd836c74b, 1).
item_tradeable(_69c0f047d5077fafd836c74b, true).
item(_69c0f047d5077fafd836c752).
item_name(_69c0f047d5077fafd836c752, 'Multi Cleaner 5 Litre').
item_type(_69c0f047d5077fafd836c752, container).
item_value(_69c0f047d5077fafd836c752, 10).
item_weight(_69c0f047d5077fafd836c752, 5).
item_tradeable(_69c0f047d5077fafd836c752, true).
item(_69c0f047d5077fafd836c754).
item_name(_69c0f047d5077fafd836c754, 'Multi Cleaner Bottle').
item_type(_69c0f047d5077fafd836c754, container).
item_value(_69c0f047d5077fafd836c754, 10).
item_weight(_69c0f047d5077fafd836c754, 5).
item_tradeable(_69c0f047d5077fafd836c754, true).
item(_69c0f047d5077fafd836c755).
item_name(_69c0f047d5077fafd836c755, 'Ornate Mirror').
item_type(_69c0f047d5077fafd836c755, furniture).
item_value(_69c0f047d5077fafd836c755, 15).
item_weight(_69c0f047d5077fafd836c755, 10).
item_tradeable(_69c0f047d5077fafd836c755, true).
item(_69c0f047d5077fafd836c756).
item_name(_69c0f047d5077fafd836c756, 'Ornate War Hammer').
item_type(_69c0f047d5077fafd836c756, weapon).
item_value(_69c0f047d5077fafd836c756, 20).
item_weight(_69c0f047d5077fafd836c756, 3).
item_tradeable(_69c0f047d5077fafd836c756, true).
item(_69c0f047d5077fafd836c762).
item_name(_69c0f047d5077fafd836c762, 'Anvil').
item_type(_69c0f047d5077fafd836c762, tool).
item_value(_69c0f047d5077fafd836c762, 12).
item_weight(_69c0f047d5077fafd836c762, 2).
item_tradeable(_69c0f047d5077fafd836c762, true).
item(_69c0f047d5077fafd836c763).
item_name(_69c0f047d5077fafd836c763, 'Anvil Log').
item_type(_69c0f047d5077fafd836c763, tool).
item_value(_69c0f047d5077fafd836c763, 12).
item_weight(_69c0f047d5077fafd836c763, 2).
item_tradeable(_69c0f047d5077fafd836c763, true).
item(_69c0f047d5077fafd836c765).
item_name(_69c0f047d5077fafd836c765, 'Bag').
item_type(_69c0f047d5077fafd836c765, container).
item_value(_69c0f047d5077fafd836c765, 10).
item_weight(_69c0f047d5077fafd836c765, 5).
item_tradeable(_69c0f047d5077fafd836c765, true).
item(_69c0f047d5077fafd836c766).
item_name(_69c0f047d5077fafd836c766, 'Banner').
item_type(_69c0f047d5077fafd836c766, decoration).
item_value(_69c0f047d5077fafd836c766, 8).
item_weight(_69c0f047d5077fafd836c766, 1).
item_tradeable(_69c0f047d5077fafd836c766, true).
item(_69c0f047d5077fafd836c767).
item_name(_69c0f047d5077fafd836c767, 'Banner 1 Cloth').
item_type(_69c0f047d5077fafd836c767, decoration).
item_value(_69c0f047d5077fafd836c767, 8).
item_weight(_69c0f047d5077fafd836c767, 1).
item_tradeable(_69c0f047d5077fafd836c767, true).
item(_69c0f047d5077fafd836c768).
item_name(_69c0f047d5077fafd836c768, 'Banner').
item_type(_69c0f047d5077fafd836c768, decoration).
item_value(_69c0f047d5077fafd836c768, 8).
item_weight(_69c0f047d5077fafd836c768, 1).
item_tradeable(_69c0f047d5077fafd836c768, true).
item(_69c0f047d5077fafd836c769).
item_name(_69c0f047d5077fafd836c769, 'Banner 2 Cloth').
item_type(_69c0f047d5077fafd836c769, decoration).
item_value(_69c0f047d5077fafd836c769, 8).
item_weight(_69c0f047d5077fafd836c769, 1).
item_tradeable(_69c0f047d5077fafd836c769, true).
item(_69c0f047d5077fafd836c770).
item_name(_69c0f047d5077fafd836c770, 'Book Group Medium').
item_type(_69c0f047d5077fafd836c770, document).
item_value(_69c0f047d5077fafd836c770, 2).
item_weight(_69c0f047d5077fafd836c770, 0.1).
item_tradeable(_69c0f047d5077fafd836c770, true).
item(_69c0f047d5077fafd836c771).
item_name(_69c0f047d5077fafd836c771, 'Book Group Medium').
item_type(_69c0f047d5077fafd836c771, document).
item_value(_69c0f047d5077fafd836c771, 2).
item_weight(_69c0f047d5077fafd836c771, 0.1).
item_tradeable(_69c0f047d5077fafd836c771, true).
item(_69c0f047d5077fafd836c772).
item_name(_69c0f047d5077fafd836c772, 'Book Group Medium').
item_type(_69c0f047d5077fafd836c772, document).
item_value(_69c0f047d5077fafd836c772, 2).
item_weight(_69c0f047d5077fafd836c772, 0.1).
item_tradeable(_69c0f047d5077fafd836c772, true).
item(_69c0f047d5077fafd836c773).
item_name(_69c0f047d5077fafd836c773, 'Book Group Small').
item_type(_69c0f047d5077fafd836c773, document).
item_value(_69c0f047d5077fafd836c773, 2).
item_weight(_69c0f047d5077fafd836c773, 0.1).
item_tradeable(_69c0f047d5077fafd836c773, true).
item(_69c0f047d5077fafd836c774).
item_name(_69c0f047d5077fafd836c774, 'Book Group Small').
item_type(_69c0f047d5077fafd836c774, document).
item_value(_69c0f047d5077fafd836c774, 2).
item_weight(_69c0f047d5077fafd836c774, 0.1).
item_tradeable(_69c0f047d5077fafd836c774, true).
item(_69c0f047d5077fafd836c775).
item_name(_69c0f047d5077fafd836c775, 'Book Group Small').
item_type(_69c0f047d5077fafd836c775, document).
item_value(_69c0f047d5077fafd836c775, 2).
item_weight(_69c0f047d5077fafd836c775, 0.1).
item_tradeable(_69c0f047d5077fafd836c775, true).
item(_69c0f047d5077fafd836c776).
item_name(_69c0f047d5077fafd836c776, 'Book Stand').
item_type(_69c0f047d5077fafd836c776, document).
item_value(_69c0f047d5077fafd836c776, 2).
item_weight(_69c0f047d5077fafd836c776, 0.1).
item_tradeable(_69c0f047d5077fafd836c776, true).
item(_69c0f047d5077fafd836c777).
item_name(_69c0f047d5077fafd836c777, 'Book').
item_type(_69c0f047d5077fafd836c777, document).
item_value(_69c0f047d5077fafd836c777, 2).
item_weight(_69c0f047d5077fafd836c777, 0.1).
item_tradeable(_69c0f047d5077fafd836c777, true).
item(_69c0f047d5077fafd836c778).
item_name(_69c0f047d5077fafd836c778, 'Book').
item_type(_69c0f047d5077fafd836c778, document).
item_value(_69c0f047d5077fafd836c778, 2).
item_weight(_69c0f047d5077fafd836c778, 0.1).
item_tradeable(_69c0f047d5077fafd836c778, true).
item(_69c0f047d5077fafd836c779).
item_name(_69c0f047d5077fafd836c779, 'Book Simplified Single').
item_type(_69c0f047d5077fafd836c779, document).
item_value(_69c0f047d5077fafd836c779, 2).
item_weight(_69c0f047d5077fafd836c779, 0.1).
item_tradeable(_69c0f047d5077fafd836c779, true).
item(_69c0f047d5077fafd836c77a).
item_name(_69c0f047d5077fafd836c77a, 'Book Stack').
item_type(_69c0f047d5077fafd836c77a, document).
item_value(_69c0f047d5077fafd836c77a, 2).
item_weight(_69c0f047d5077fafd836c77a, 0.1).
item_tradeable(_69c0f047d5077fafd836c77a, true).
item(_69c0f047d5077fafd836c77b).
item_name(_69c0f047d5077fafd836c77b, 'Book Stack').
item_type(_69c0f047d5077fafd836c77b, document).
item_value(_69c0f047d5077fafd836c77b, 2).
item_weight(_69c0f047d5077fafd836c77b, 0.1).
item_tradeable(_69c0f047d5077fafd836c77b, true).
item(_69c0f047d5077fafd836c77c).
item_name(_69c0f047d5077fafd836c77c, 'Bookcase').
item_type(_69c0f047d5077fafd836c77c, document).
item_value(_69c0f047d5077fafd836c77c, 2).
item_weight(_69c0f047d5077fafd836c77c, 0.1).
item_tradeable(_69c0f047d5077fafd836c77c, true).
item(_69c0f047d5077fafd836c77d).
item_name(_69c0f047d5077fafd836c77d, 'Bottle').
item_type(_69c0f047d5077fafd836c77d, consumable).
item_value(_69c0f047d5077fafd836c77d, 5).
item_weight(_69c0f047d5077fafd836c77d, 1).
item_tradeable(_69c0f047d5077fafd836c77d, true).
item(_69c0f047d5077fafd836c77e).
item_name(_69c0f047d5077fafd836c77e, 'Bucket Metal').
item_type(_69c0f047d5077fafd836c77e, container).
item_value(_69c0f047d5077fafd836c77e, 10).
item_weight(_69c0f047d5077fafd836c77e, 5).
item_tradeable(_69c0f047d5077fafd836c77e, true).
item(_69c0f047d5077fafd836c77f).
item_name(_69c0f047d5077fafd836c77f, 'Bucket Wooden').
item_type(_69c0f047d5077fafd836c77f, container).
item_value(_69c0f047d5077fafd836c77f, 10).
item_weight(_69c0f047d5077fafd836c77f, 5).
item_tradeable(_69c0f047d5077fafd836c77f, true).
item(_69c0f047d5077fafd836c781).
item_name(_69c0f047d5077fafd836c781, 'Cage Small').
item_type(_69c0f047d5077fafd836c781, decoration).
item_value(_69c0f047d5077fafd836c781, 8).
item_weight(_69c0f047d5077fafd836c781, 1).
item_tradeable(_69c0f047d5077fafd836c781, true).
item(_69c0f047d5077fafd836c787).
item_name(_69c0f047d5077fafd836c787, 'Carrot').
item_type(_69c0f047d5077fafd836c787, consumable).
item_value(_69c0f047d5077fafd836c787, 3).
item_weight(_69c0f047d5077fafd836c787, 0.5).
item_tradeable(_69c0f047d5077fafd836c787, true).
item(_69c0f047d5077fafd836c789).
item_name(_69c0f047d5077fafd836c789, 'Chain Coil').
item_type(_69c0f047d5077fafd836c789, material).
item_value(_69c0f047d5077fafd836c789, 2).
item_weight(_69c0f047d5077fafd836c789, 1).
item_tradeable(_69c0f047d5077fafd836c789, true).
item(_69c0f047d5077fafd836c78b).
item_name(_69c0f047d5077fafd836c78b, 'Chalice').
item_type(_69c0f047d5077fafd836c78b, consumable).
item_value(_69c0f047d5077fafd836c78b, 5).
item_weight(_69c0f047d5077fafd836c78b, 1).
item_tradeable(_69c0f047d5077fafd836c78b, true).
item(_69c0f047d5077fafd836c78c).
item_name(_69c0f047d5077fafd836c78c, 'Chandelier').
item_type(_69c0f047d5077fafd836c78c, tool).
item_value(_69c0f047d5077fafd836c78c, 8).
item_weight(_69c0f047d5077fafd836c78c, 1).
item_tradeable(_69c0f047d5077fafd836c78c, true).
item(_69c0f047d5077fafd836c78d).
item_name(_69c0f047d5077fafd836c78d, 'Chest Wood').
item_type(_69c0f047d5077fafd836c78d, container).
item_value(_69c0f047d5077fafd836c78d, 10).
item_weight(_69c0f047d5077fafd836c78d, 5).
item_tradeable(_69c0f047d5077fafd836c78d, true).
item(_69c0f047d5077fafd836c78e).
item_name(_69c0f047d5077fafd836c78e, 'Coin').
item_type(_69c0f047d5077fafd836c78e, collectible).
item_value(_69c0f047d5077fafd836c78e, 8).
item_weight(_69c0f047d5077fafd836c78e, 0.5).
item_tradeable(_69c0f047d5077fafd836c78e, true).
item(_69c0f047d5077fafd836c78f).
item_name(_69c0f047d5077fafd836c78f, 'Coin Pile').
item_type(_69c0f047d5077fafd836c78f, collectible).
item_value(_69c0f047d5077fafd836c78f, 8).
item_weight(_69c0f047d5077fafd836c78f, 0.5).
item_tradeable(_69c0f047d5077fafd836c78f, true).
item(_69c0f047d5077fafd836c790).
item_name(_69c0f047d5077fafd836c790, 'Coin Pile').
item_type(_69c0f047d5077fafd836c790, collectible).
item_value(_69c0f047d5077fafd836c790, 8).
item_weight(_69c0f047d5077fafd836c790, 0.5).
item_tradeable(_69c0f047d5077fafd836c790, true).
item(_69c0f047d5077fafd836c793).
item_name(_69c0f047d5077fafd836c793, 'Dummy').
item_type(_69c0f047d5077fafd836c793, tool).
item_value(_69c0f047d5077fafd836c793, 12).
item_weight(_69c0f047d5077fafd836c793, 2).
item_tradeable(_69c0f047d5077fafd836c793, true).
item(_69c0f047d5077fafd836c797).
item_name(_69c0f047d5077fafd836c797, 'Key Metal').
item_type(_69c0f047d5077fafd836c797, key).
item_value(_69c0f047d5077fafd836c797, 5).
item_weight(_69c0f047d5077fafd836c797, 0.1).
item_tradeable(_69c0f047d5077fafd836c797, true).
item(_69c0f047d5077fafd836c799).
item_name(_69c0f047d5077fafd836c799, 'Mug').
item_type(_69c0f047d5077fafd836c799, consumable).
item_value(_69c0f047d5077fafd836c799, 5).
item_weight(_69c0f047d5077fafd836c799, 1).
item_tradeable(_69c0f047d5077fafd836c799, true).
item(_69c0f047d5077fafd836c79b).
item_name(_69c0f047d5077fafd836c79b, 'Peg Rack').
item_type(_69c0f047d5077fafd836c79b, tool).
item_value(_69c0f047d5077fafd836c79b, 12).
item_weight(_69c0f047d5077fafd836c79b, 2).
item_tradeable(_69c0f047d5077fafd836c79b, true).
item(_69c0f047d5077fafd836c79d).
item_name(_69c0f047d5077fafd836c79d, 'Pot').
item_type(_69c0f047d5077fafd836c79d, tool).
item_value(_69c0f047d5077fafd836c79d, 12).
item_weight(_69c0f047d5077fafd836c79d, 2).
item_tradeable(_69c0f047d5077fafd836c79d, true).
item(_69c0f047d5077fafd836c79e).
item_name(_69c0f047d5077fafd836c79e, 'Pot 1 Lid').
item_type(_69c0f047d5077fafd836c79e, tool).
item_value(_69c0f047d5077fafd836c79e, 12).
item_weight(_69c0f047d5077fafd836c79e, 2).
item_tradeable(_69c0f047d5077fafd836c79e, true).
item(_69c0f047d5077fafd836c79f).
item_name(_69c0f047d5077fafd836c79f, 'Potion').
item_type(_69c0f047d5077fafd836c79f, consumable).
item_value(_69c0f047d5077fafd836c79f, 10).
item_weight(_69c0f047d5077fafd836c79f, 0.5).
item_tradeable(_69c0f047d5077fafd836c79f, true).
item(_69c0f047d5077fafd836c7a0).
item_name(_69c0f047d5077fafd836c7a0, 'Potion').
item_type(_69c0f047d5077fafd836c7a0, consumable).
item_value(_69c0f047d5077fafd836c7a0, 10).
item_weight(_69c0f047d5077fafd836c7a0, 0.5).
item_tradeable(_69c0f047d5077fafd836c7a0, true).
item(_69c0f047d5077fafd836c7a1).
item_name(_69c0f047d5077fafd836c7a1, 'Pouch Large').
item_type(_69c0f047d5077fafd836c7a1, container).
item_value(_69c0f047d5077fafd836c7a1, 10).
item_weight(_69c0f047d5077fafd836c7a1, 5).
item_tradeable(_69c0f047d5077fafd836c7a1, true).
item(_69c0f047d5077fafd836c7a2).
item_name(_69c0f047d5077fafd836c7a2, 'Rope').
item_type(_69c0f047d5077fafd836c7a2, material).
item_value(_69c0f047d5077fafd836c7a2, 2).
item_weight(_69c0f047d5077fafd836c7a2, 1).
item_tradeable(_69c0f047d5077fafd836c7a2, true).
item(_69c0f047d5077fafd836c7a3).
item_name(_69c0f047d5077fafd836c7a3, 'Rope').
item_type(_69c0f047d5077fafd836c7a3, material).
item_value(_69c0f047d5077fafd836c7a3, 2).
item_weight(_69c0f047d5077fafd836c7a3, 1).
item_tradeable(_69c0f047d5077fafd836c7a3, true).
item(_69c0f047d5077fafd836c7a4).
item_name(_69c0f047d5077fafd836c7a4, 'Rope').
item_type(_69c0f047d5077fafd836c7a4, material).
item_value(_69c0f047d5077fafd836c7a4, 2).
item_weight(_69c0f047d5077fafd836c7a4, 1).
item_tradeable(_69c0f047d5077fafd836c7a4, true).
item(_69c0f047d5077fafd836c7a5).
item_name(_69c0f047d5077fafd836c7a5, 'Scroll').
item_type(_69c0f047d5077fafd836c7a5, document).
item_value(_69c0f047d5077fafd836c7a5, 2).
item_weight(_69c0f047d5077fafd836c7a5, 0.1).
item_tradeable(_69c0f047d5077fafd836c7a5, true).
item(_69c0f047d5077fafd836c7a6).
item_name(_69c0f047d5077fafd836c7a6, 'Scroll').
item_type(_69c0f047d5077fafd836c7a6, document).
item_value(_69c0f047d5077fafd836c7a6, 2).
item_weight(_69c0f047d5077fafd836c7a6, 0.1).
item_tradeable(_69c0f047d5077fafd836c7a6, true).
item(_69c0f047d5077fafd836c7aa).
item_name(_69c0f047d5077fafd836c7aa, 'Shield Wooden').
item_type(_69c0f047d5077fafd836c7aa, armor).
item_value(_69c0f047d5077fafd836c7aa, 18).
item_weight(_69c0f047d5077fafd836c7aa, 4).
item_tradeable(_69c0f047d5077fafd836c7aa, true).
item(_69c0f047d5077fafd836c7ab).
item_name(_69c0f047d5077fafd836c7ab, 'Small Bottle').
item_type(_69c0f047d5077fafd836c7ab, consumable).
item_value(_69c0f047d5077fafd836c7ab, 5).
item_weight(_69c0f047d5077fafd836c7ab, 1).
item_tradeable(_69c0f047d5077fafd836c7ab, true).
item(_69c0f047d5077fafd836c7ac).
item_name(_69c0f047d5077fafd836c7ac, 'Small Bottles').
item_type(_69c0f047d5077fafd836c7ac, consumable).
item_value(_69c0f047d5077fafd836c7ac, 5).
item_weight(_69c0f047d5077fafd836c7ac, 1).
item_tradeable(_69c0f047d5077fafd836c7ac, true).
item(_69c0f047d5077fafd836c7ad).
item_name(_69c0f047d5077fafd836c7ad, 'Stall Cart Empty').
item_type(_69c0f047d5077fafd836c7ad, decoration).
item_value(_69c0f047d5077fafd836c7ad, 8).
item_weight(_69c0f047d5077fafd836c7ad, 1).
item_tradeable(_69c0f047d5077fafd836c7ad, true).
item(_69c0f047d5077fafd836c7ae).
item_name(_69c0f047d5077fafd836c7ae, 'Stall Empty').
item_type(_69c0f047d5077fafd836c7ae, decoration).
item_value(_69c0f047d5077fafd836c7ae, 8).
item_weight(_69c0f047d5077fafd836c7ae, 1).
item_tradeable(_69c0f047d5077fafd836c7ae, true).
item(_69c0f047d5077fafd836c7b0).
item_name(_69c0f047d5077fafd836c7b0, 'Sword Bronze').
item_type(_69c0f047d5077fafd836c7b0, weapon).
item_value(_69c0f047d5077fafd836c7b0, 20).
item_weight(_69c0f047d5077fafd836c7b0, 3).
item_tradeable(_69c0f047d5077fafd836c7b0, true).
item(_69c0f047d5077fafd836c7b6).
item_name(_69c0f047d5077fafd836c7b6, 'Vase').
item_type(_69c0f047d5077fafd836c7b6, decoration).
item_value(_69c0f047d5077fafd836c7b6, 8).
item_weight(_69c0f047d5077fafd836c7b6, 1).
item_tradeable(_69c0f047d5077fafd836c7b6, true).
item(_69c0f047d5077fafd836c7b7).
item_name(_69c0f047d5077fafd836c7b7, 'Vase').
item_type(_69c0f047d5077fafd836c7b7, decoration).
item_value(_69c0f047d5077fafd836c7b7, 8).
item_weight(_69c0f047d5077fafd836c7b7, 1).
item_tradeable(_69c0f047d5077fafd836c7b7, true).
item(_69c0f047d5077fafd836c7b8).
item_name(_69c0f047d5077fafd836c7b8, 'Vase Rubble Medium').
item_type(_69c0f047d5077fafd836c7b8, decoration).
item_value(_69c0f047d5077fafd836c7b8, 8).
item_weight(_69c0f047d5077fafd836c7b8, 1).
item_tradeable(_69c0f047d5077fafd836c7b8, true).
item(_69c0f047d5077fafd836c7b9).
item_name(_69c0f047d5077fafd836c7b9, 'Weapon Stand').
item_type(_69c0f047d5077fafd836c7b9, tool).
item_value(_69c0f047d5077fafd836c7b9, 12).
item_weight(_69c0f047d5077fafd836c7b9, 2).
item_tradeable(_69c0f047d5077fafd836c7b9, true).
item(_69c0f047d5077fafd836c7ba).
item_name(_69c0f047d5077fafd836c7ba, 'Whetstone').
item_type(_69c0f047d5077fafd836c7ba, tool).
item_value(_69c0f047d5077fafd836c7ba, 12).
item_weight(_69c0f047d5077fafd836c7ba, 2).
item_tradeable(_69c0f047d5077fafd836c7ba, true).
item(_69c0f047d5077fafd836c7bd).
item_name(_69c0f047d5077fafd836c7bd, 'Gun Pistol').
item_type(_69c0f047d5077fafd836c7bd, weapon).
item_value(_69c0f047d5077fafd836c7bd, 30).
item_weight(_69c0f047d5077fafd836c7bd, 2).
item_tradeable(_69c0f047d5077fafd836c7bd, true).
item(_69c0f047d5077fafd836c7be).
item_name(_69c0f047d5077fafd836c7be, 'Gun Smg Ammo').
item_type(_69c0f047d5077fafd836c7be, weapon).
item_value(_69c0f047d5077fafd836c7be, 30).
item_weight(_69c0f047d5077fafd836c7be, 2).
item_tradeable(_69c0f047d5077fafd836c7be, true).
item(_69c0f047d5077fafd836c7bf).
item_name(_69c0f047d5077fafd836c7bf, 'Gun Sniper').
item_type(_69c0f047d5077fafd836c7bf, weapon).
item_value(_69c0f047d5077fafd836c7bf, 30).
item_weight(_69c0f047d5077fafd836c7bf, 2).
item_tradeable(_69c0f047d5077fafd836c7bf, true).
item(_69c0f047d5077fafd836c7c0).
item_name(_69c0f047d5077fafd836c7c0, 'Gun Sniper Ammo').
item_type(_69c0f047d5077fafd836c7c0, weapon).
item_value(_69c0f047d5077fafd836c7c0, 30).
item_weight(_69c0f047d5077fafd836c7c0, 2).
item_tradeable(_69c0f047d5077fafd836c7c0, true).
item(_69c0f047d5077fafd836c7c1).
item_name(_69c0f047d5077fafd836c7c1, 'Prop Ammo').
item_type(_69c0f047d5077fafd836c7c1, ammunition).
item_value(_69c0f047d5077fafd836c7c1, 2).
item_weight(_69c0f047d5077fafd836c7c1, 0.1).
item_tradeable(_69c0f047d5077fafd836c7c1, true).
item(_69c0f047d5077fafd836c7c2).
item_name(_69c0f047d5077fafd836c7c2, 'Prop Ammo Closed').
item_type(_69c0f047d5077fafd836c7c2, ammunition).
item_value(_69c0f047d5077fafd836c7c2, 2).
item_weight(_69c0f047d5077fafd836c7c2, 0.1).
item_tradeable(_69c0f047d5077fafd836c7c2, true).
item(_69c0f047d5077fafd836c7c3).
item_name(_69c0f047d5077fafd836c7c3, 'Prop Ammo Small').
item_type(_69c0f047d5077fafd836c7c3, ammunition).
item_value(_69c0f047d5077fafd836c7c3, 2).
item_weight(_69c0f047d5077fafd836c7c3, 0.1).
item_tradeable(_69c0f047d5077fafd836c7c3, true).
item(_69c0f047d5077fafd836c7c7).
item_name(_69c0f047d5077fafd836c7c7, 'Prop Chest').
item_type(_69c0f047d5077fafd836c7c7, container).
item_value(_69c0f047d5077fafd836c7c7, 10).
item_weight(_69c0f047d5077fafd836c7c7, 5).
item_tradeable(_69c0f047d5077fafd836c7c7, true).
item(_69c0f047d5077fafd836c7cc).
item_name(_69c0f047d5077fafd836c7cc, 'Prop Desk L').
item_type(_69c0f047d5077fafd836c7cc, furniture).
item_value(_69c0f047d5077fafd836c7cc, 15).
item_weight(_69c0f047d5077fafd836c7cc, 10).
item_tradeable(_69c0f047d5077fafd836c7cc, true).
item(_69c0f047d5077fafd836c7cd).
item_name(_69c0f047d5077fafd836c7cd, 'Prop Desk Medium').
item_type(_69c0f047d5077fafd836c7cd, furniture).
item_value(_69c0f047d5077fafd836c7cd, 15).
item_weight(_69c0f047d5077fafd836c7cd, 10).
item_tradeable(_69c0f047d5077fafd836c7cd, true).
item(_69c0f047d5077fafd836c7ce).
item_name(_69c0f047d5077fafd836c7ce, 'Prop Locker').
item_type(_69c0f047d5077fafd836c7ce, furniture).
item_value(_69c0f047d5077fafd836c7ce, 15).
item_weight(_69c0f047d5077fafd836c7ce, 10).
item_tradeable(_69c0f047d5077fafd836c7ce, true).
item(_69c0f047d5077fafd836c7d0).
item_name(_69c0f047d5077fafd836c7d0, 'Prop Mug').
item_type(_69c0f047d5077fafd836c7d0, consumable).
item_value(_69c0f047d5077fafd836c7d0, 5).
item_weight(_69c0f047d5077fafd836c7d0, 1).
item_tradeable(_69c0f047d5077fafd836c7d0, true).
item(_69c0f047d5077fafd836c7d1).
item_name(_69c0f047d5077fafd836c7d1, 'Prop Satellite Dish').
item_type(_69c0f047d5077fafd836c7d1, equipment).
item_value(_69c0f047d5077fafd836c7d1, 15).
item_weight(_69c0f047d5077fafd836c7d1, 1).
item_tradeable(_69c0f047d5077fafd836c7d1, true).
item(_69c0f047d5077fafd836c7d2).
item_name(_69c0f047d5077fafd836c7d2, 'Prop Shelves Thin Short').
item_type(_69c0f047d5077fafd836c7d2, furniture).
item_value(_69c0f047d5077fafd836c7d2, 15).
item_weight(_69c0f047d5077fafd836c7d2, 10).
item_tradeable(_69c0f047d5077fafd836c7d2, true).
item(_69c0f047d5077fafd836c7d3).
item_name(_69c0f047d5077fafd836c7d3, 'Prop Shelves Thin Tall').
item_type(_69c0f047d5077fafd836c7d3, furniture).
item_value(_69c0f047d5077fafd836c7d3, 15).
item_weight(_69c0f047d5077fafd836c7d3, 10).
item_tradeable(_69c0f047d5077fafd836c7d3, true).
item(_69c0f047d5077fafd836c7d4).
item_name(_69c0f047d5077fafd836c7d4, 'Prop Shelves Wide Short').
item_type(_69c0f047d5077fafd836c7d4, furniture).
item_value(_69c0f047d5077fafd836c7d4, 15).
item_weight(_69c0f047d5077fafd836c7d4, 10).
item_tradeable(_69c0f047d5077fafd836c7d4, true).
item(_69c0f047d5077fafd836c7d5).
item_name(_69c0f047d5077fafd836c7d5, 'Prop Shelves Wide Tall').
item_type(_69c0f047d5077fafd836c7d5, furniture).
item_value(_69c0f047d5077fafd836c7d5, 15).
item_weight(_69c0f047d5077fafd836c7d5, 10).
item_tradeable(_69c0f047d5077fafd836c7d5, true).
item(_69c0f047d5077fafd836c7d6).
item_name(_69c0f047d5077fafd836c7d6, 'Armor Black').
item_type(_69c0f047d5077fafd836c7d6, armor).
item_value(_69c0f047d5077fafd836c7d6, 25).
item_weight(_69c0f047d5077fafd836c7d6, 5).
item_tradeable(_69c0f047d5077fafd836c7d6, true).
item(_69c0f047d5077fafd836c7d7).
item_name(_69c0f047d5077fafd836c7d7, 'Armor Golden').
item_type(_69c0f047d5077fafd836c7d7, armor).
item_value(_69c0f047d5077fafd836c7d7, 25).
item_weight(_69c0f047d5077fafd836c7d7, 5).
item_tradeable(_69c0f047d5077fafd836c7d7, true).
item(_69c0f047d5077fafd836c7dc).
item_name(_69c0f047d5077fafd836c7dc, 'Bag').
item_type(_69c0f047d5077fafd836c7dc, container).
item_value(_69c0f047d5077fafd836c7dc, 10).
item_weight(_69c0f047d5077fafd836c7dc, 5).
item_tradeable(_69c0f047d5077fafd836c7dc, true).
item(_69c0f047d5077fafd836c7dd).
item_name(_69c0f047d5077fafd836c7dd, 'Bone').
item_type(_69c0f047d5077fafd836c7dd, collectible).
item_value(_69c0f047d5077fafd836c7dd, 8).
item_weight(_69c0f047d5077fafd836c7dd, 0.5).
item_tradeable(_69c0f047d5077fafd836c7dd, true).
item(_69c0f047d5077fafd836c7de).
item_name(_69c0f047d5077fafd836c7de, 'Book1 Closed').
item_type(_69c0f047d5077fafd836c7de, document).
item_value(_69c0f047d5077fafd836c7de, 2).
item_weight(_69c0f047d5077fafd836c7de, 0.1).
item_tradeable(_69c0f047d5077fafd836c7de, true).
item(_69c0f047d5077fafd836c7df).
item_name(_69c0f047d5077fafd836c7df, 'Book1 Open').
item_type(_69c0f047d5077fafd836c7df, document).
item_value(_69c0f047d5077fafd836c7df, 2).
item_weight(_69c0f047d5077fafd836c7df, 0.1).
item_tradeable(_69c0f047d5077fafd836c7df, true).
item(_69c0f047d5077fafd836c7e0).
item_name(_69c0f047d5077fafd836c7e0, 'Book2 Closed').
item_type(_69c0f047d5077fafd836c7e0, document).
item_value(_69c0f047d5077fafd836c7e0, 2).
item_weight(_69c0f047d5077fafd836c7e0, 0.1).
item_tradeable(_69c0f047d5077fafd836c7e0, true).
item(_69c0f047d5077fafd836c7e1).
item_name(_69c0f047d5077fafd836c7e1, 'Book2 Open').
item_type(_69c0f047d5077fafd836c7e1, document).
item_value(_69c0f047d5077fafd836c7e1, 2).
item_weight(_69c0f047d5077fafd836c7e1, 0.1).
item_tradeable(_69c0f047d5077fafd836c7e1, true).
item(_69c0f047d5077fafd836c7e2).
item_name(_69c0f047d5077fafd836c7e2, 'Book3 Closed').
item_type(_69c0f047d5077fafd836c7e2, document).
item_value(_69c0f047d5077fafd836c7e2, 2).
item_weight(_69c0f047d5077fafd836c7e2, 0.1).
item_tradeable(_69c0f047d5077fafd836c7e2, true).
item(_69c0f047d5077fafd836c7e3).
item_name(_69c0f047d5077fafd836c7e3, 'Book3 Open').
item_type(_69c0f047d5077fafd836c7e3, document).
item_value(_69c0f047d5077fafd836c7e3, 2).
item_weight(_69c0f047d5077fafd836c7e3, 0.1).
item_tradeable(_69c0f047d5077fafd836c7e3, true).
item(_69c0f047d5077fafd836c7e4).
item_name(_69c0f047d5077fafd836c7e4, 'Book4 Closed').
item_type(_69c0f047d5077fafd836c7e4, document).
item_value(_69c0f047d5077fafd836c7e4, 2).
item_weight(_69c0f047d5077fafd836c7e4, 0.1).
item_tradeable(_69c0f047d5077fafd836c7e4, true).
item(_69c0f047d5077fafd836c7e5).
item_name(_69c0f047d5077fafd836c7e5, 'Book4 Open').
item_type(_69c0f047d5077fafd836c7e5, document).
item_value(_69c0f047d5077fafd836c7e5, 2).
item_weight(_69c0f047d5077fafd836c7e5, 0.1).
item_tradeable(_69c0f047d5077fafd836c7e5, true).
item(_69c0f047d5077fafd836c7e6).
item_name(_69c0f047d5077fafd836c7e6, 'Bow Golden').
item_type(_69c0f047d5077fafd836c7e6, weapon).
item_value(_69c0f047d5077fafd836c7e6, 30).
item_weight(_69c0f047d5077fafd836c7e6, 2).
item_tradeable(_69c0f047d5077fafd836c7e6, true).
item(_69c0f047d5077fafd836c7e7).
item_name(_69c0f047d5077fafd836c7e7, 'Chalice').
item_type(_69c0f047d5077fafd836c7e7, consumable).
item_value(_69c0f047d5077fafd836c7e7, 5).
item_weight(_69c0f047d5077fafd836c7e7, 1).
item_tradeable(_69c0f047d5077fafd836c7e7, true).
item(_69c0f047d5077fafd836c7e8).
item_name(_69c0f047d5077fafd836c7e8, 'Chest Closed').
item_type(_69c0f047d5077fafd836c7e8, container).
item_value(_69c0f047d5077fafd836c7e8, 10).
item_weight(_69c0f047d5077fafd836c7e8, 5).
item_tradeable(_69c0f047d5077fafd836c7e8, true).
item(_69c0f047d5077fafd836c7e9).
item_name(_69c0f047d5077fafd836c7e9, 'Chest Ingots').
item_type(_69c0f047d5077fafd836c7e9, container).
item_value(_69c0f047d5077fafd836c7e9, 10).
item_weight(_69c0f047d5077fafd836c7e9, 5).
item_tradeable(_69c0f047d5077fafd836c7e9, true).
item(_69c0f047d5077fafd836c7ea).
item_name(_69c0f047d5077fafd836c7ea, 'Chest Open').
item_type(_69c0f047d5077fafd836c7ea, container).
item_value(_69c0f047d5077fafd836c7ea, 10).
item_weight(_69c0f047d5077fafd836c7ea, 5).
item_tradeable(_69c0f047d5077fafd836c7ea, true).
item(_69c0f047d5077fafd836c7eb).
item_name(_69c0f047d5077fafd836c7eb, 'Chicken Leg').
item_type(_69c0f047d5077fafd836c7eb, consumable).
item_value(_69c0f047d5077fafd836c7eb, 3).
item_weight(_69c0f047d5077fafd836c7eb, 0.5).
item_tradeable(_69c0f047d5077fafd836c7eb, true).
item(_69c0f047d5077fafd836c7ec).
item_name(_69c0f047d5077fafd836c7ec, 'Coin').
item_type(_69c0f047d5077fafd836c7ec, collectible).
item_value(_69c0f047d5077fafd836c7ec, 8).
item_weight(_69c0f047d5077fafd836c7ec, 0.5).
item_tradeable(_69c0f047d5077fafd836c7ec, true).
item(_69c0f047d5077fafd836c7ed).
item_name(_69c0f047d5077fafd836c7ed, 'Coin Skull').
item_type(_69c0f047d5077fafd836c7ed, collectible).
item_value(_69c0f047d5077fafd836c7ed, 8).
item_weight(_69c0f047d5077fafd836c7ed, 0.5).
item_tradeable(_69c0f047d5077fafd836c7ed, true).
item(_69c0f047d5077fafd836c7ee).
item_name(_69c0f047d5077fafd836c7ee, 'Coin Star').
item_type(_69c0f047d5077fafd836c7ee, collectible).
item_value(_69c0f047d5077fafd836c7ee, 8).
item_weight(_69c0f047d5077fafd836c7ee, 0.5).
item_tradeable(_69c0f047d5077fafd836c7ee, true).
item(_69c0f047d5077fafd836c7ef).
item_name(_69c0f047d5077fafd836c7ef, 'Crown').
item_type(_69c0f047d5077fafd836c7ef, accessory).
item_value(_69c0f047d5077fafd836c7ef, 50).
item_weight(_69c0f047d5077fafd836c7ef, 0.2).
item_tradeable(_69c0f047d5077fafd836c7ef, true).
item(_69c0f047d5077fafd836c7f7).
item_name(_69c0f047d5077fafd836c7f7, 'Dagger').
item_type(_69c0f047d5077fafd836c7f7, weapon).
item_value(_69c0f047d5077fafd836c7f7, 20).
item_weight(_69c0f047d5077fafd836c7f7, 3).
item_tradeable(_69c0f047d5077fafd836c7f7, true).
item(_69c0f047d5077fafd836c7f8).
item_name(_69c0f047d5077fafd836c7f8, 'Dagger Golden').
item_type(_69c0f047d5077fafd836c7f8, weapon).
item_value(_69c0f047d5077fafd836c7f8, 20).
item_weight(_69c0f047d5077fafd836c7f8, 3).
item_tradeable(_69c0f047d5077fafd836c7f8, true).
item(_69c0f047d5077fafd836c7f9).
item_name(_69c0f047d5077fafd836c7f9, 'Dart').
item_type(_69c0f047d5077fafd836c7f9, weapon).
item_value(_69c0f047d5077fafd836c7f9, 30).
item_weight(_69c0f047d5077fafd836c7f9, 2).
item_tradeable(_69c0f047d5077fafd836c7f9, true).
item(_69c0f047d5077fafd836c7fa).
item_name(_69c0f047d5077fafd836c7fa, 'Dart Golden').
item_type(_69c0f047d5077fafd836c7fa, weapon).
item_value(_69c0f047d5077fafd836c7fa, 30).
item_weight(_69c0f047d5077fafd836c7fa, 2).
item_tradeable(_69c0f047d5077fafd836c7fa, true).
item(_69c0f047d5077fafd836c7fb).
item_name(_69c0f047d5077fafd836c7fb, 'Fish Bone').
item_type(_69c0f047d5077fafd836c7fb, collectible).
item_value(_69c0f047d5077fafd836c7fb, 8).
item_weight(_69c0f047d5077fafd836c7fb, 0.5).
item_tradeable(_69c0f047d5077fafd836c7fb, true).
item(_69c0f047d5077fafd836c7fc).
item_name(_69c0f047d5077fafd836c7fc, 'Hammer Double').
item_type(_69c0f047d5077fafd836c7fc, weapon).
item_value(_69c0f047d5077fafd836c7fc, 20).
item_weight(_69c0f047d5077fafd836c7fc, 3).
item_tradeable(_69c0f047d5077fafd836c7fc, true).
item(_69c0f047d5077fafd836c7fd).
item_name(_69c0f047d5077fafd836c7fd, 'Hammer Double Golden').
item_type(_69c0f047d5077fafd836c7fd, weapon).
item_value(_69c0f047d5077fafd836c7fd, 20).
item_weight(_69c0f047d5077fafd836c7fd, 3).
item_tradeable(_69c0f047d5077fafd836c7fd, true).
item(_69c0f047d5077fafd836c7fe).
item_name(_69c0f047d5077fafd836c7fe, 'Heart').
item_type(_69c0f047d5077fafd836c7fe, collectible).
item_value(_69c0f047d5077fafd836c7fe, 8).
item_weight(_69c0f047d5077fafd836c7fe, 0.5).
item_tradeable(_69c0f047d5077fafd836c7fe, true).
item(_69c0f047d5077fafd836c801).
item_name(_69c0f047d5077fafd836c801, 'Key1').
item_type(_69c0f047d5077fafd836c801, key).
item_value(_69c0f047d5077fafd836c801, 5).
item_weight(_69c0f047d5077fafd836c801, 0.1).
item_tradeable(_69c0f047d5077fafd836c801, true).
item(_69c0f047d5077fafd836c802).
item_name(_69c0f047d5077fafd836c802, 'Key2').
item_type(_69c0f047d5077fafd836c802, key).
item_value(_69c0f047d5077fafd836c802, 5).
item_weight(_69c0f047d5077fafd836c802, 0.1).
item_tradeable(_69c0f047d5077fafd836c802, true).
item(_69c0f047d5077fafd836c803).
item_name(_69c0f047d5077fafd836c803, 'Key3').
item_type(_69c0f047d5077fafd836c803, key).
item_value(_69c0f047d5077fafd836c803, 5).
item_weight(_69c0f047d5077fafd836c803, 0.1).
item_tradeable(_69c0f047d5077fafd836c803, true).
item(_69c0f047d5077fafd836c804).
item_name(_69c0f047d5077fafd836c804, 'Key4').
item_type(_69c0f047d5077fafd836c804, key).
item_value(_69c0f047d5077fafd836c804, 5).
item_weight(_69c0f047d5077fafd836c804, 0.1).
item_tradeable(_69c0f047d5077fafd836c804, true).
item(_69c0f047d5077fafd836c805).
item_name(_69c0f047d5077fafd836c805, 'Mineral').
item_type(_69c0f047d5077fafd836c805, collectible).
item_value(_69c0f047d5077fafd836c805, 8).
item_weight(_69c0f047d5077fafd836c805, 0.5).
item_tradeable(_69c0f047d5077fafd836c805, true).
item(_69c0f047d5077fafd836c806).
item_name(_69c0f047d5077fafd836c806, 'Necklace2').
item_type(_69c0f047d5077fafd836c806, accessory).
item_value(_69c0f047d5077fafd836c806, 50).
item_weight(_69c0f047d5077fafd836c806, 0.2).
item_tradeable(_69c0f047d5077fafd836c806, true).
item(_69c0f047d5077fafd836c807).
item_name(_69c0f047d5077fafd836c807, 'Necklace3').
item_type(_69c0f047d5077fafd836c807, accessory).
item_value(_69c0f047d5077fafd836c807, 50).
item_weight(_69c0f047d5077fafd836c807, 0.2).
item_tradeable(_69c0f047d5077fafd836c807, true).
item(_69c0f047d5077fafd836c808).
item_name(_69c0f047d5077fafd836c808, 'Padlock').
item_type(_69c0f047d5077fafd836c808, key).
item_value(_69c0f047d5077fafd836c808, 5).
item_weight(_69c0f047d5077fafd836c808, 0.1).
item_tradeable(_69c0f047d5077fafd836c808, true).
item(_69c0f047d5077fafd836c809).
item_name(_69c0f047d5077fafd836c809, 'Parchment').
item_type(_69c0f047d5077fafd836c809, document).
item_value(_69c0f047d5077fafd836c809, 2).
item_weight(_69c0f047d5077fafd836c809, 0.1).
item_tradeable(_69c0f047d5077fafd836c809, true).
item(_69c0f047d5077fafd836c80a).
item_name(_69c0f047d5077fafd836c80a, 'Potion10 Empty').
item_type(_69c0f047d5077fafd836c80a, consumable).
item_value(_69c0f047d5077fafd836c80a, 10).
item_weight(_69c0f047d5077fafd836c80a, 0.5).
item_tradeable(_69c0f047d5077fafd836c80a, true).
item(_69c0f047d5077fafd836c80b).
item_name(_69c0f047d5077fafd836c80b, 'Potion10 Filled').
item_type(_69c0f047d5077fafd836c80b, consumable).
item_value(_69c0f047d5077fafd836c80b, 10).
item_weight(_69c0f047d5077fafd836c80b, 0.5).
item_tradeable(_69c0f047d5077fafd836c80b, true).
item(_69c0f047d5077fafd836c80c).
item_name(_69c0f047d5077fafd836c80c, 'Potion11 Empty').
item_type(_69c0f047d5077fafd836c80c, consumable).
item_value(_69c0f047d5077fafd836c80c, 10).
item_weight(_69c0f047d5077fafd836c80c, 0.5).
item_tradeable(_69c0f047d5077fafd836c80c, true).
item(_69c0f047d5077fafd836c80d).
item_name(_69c0f047d5077fafd836c80d, 'Potion11 Filled').
item_type(_69c0f047d5077fafd836c80d, consumable).
item_value(_69c0f047d5077fafd836c80d, 10).
item_weight(_69c0f047d5077fafd836c80d, 0.5).
item_tradeable(_69c0f047d5077fafd836c80d, true).
item(_69c0f047d5077fafd836c80e).
item_name(_69c0f047d5077fafd836c80e, 'Potion1 Empty').
item_type(_69c0f047d5077fafd836c80e, consumable).
item_value(_69c0f047d5077fafd836c80e, 10).
item_weight(_69c0f047d5077fafd836c80e, 0.5).
item_tradeable(_69c0f047d5077fafd836c80e, true).
item(_69c0f047d5077fafd836c80f).
item_name(_69c0f047d5077fafd836c80f, 'Potion1 Filled').
item_type(_69c0f047d5077fafd836c80f, consumable).
item_value(_69c0f047d5077fafd836c80f, 10).
item_weight(_69c0f047d5077fafd836c80f, 0.5).
item_tradeable(_69c0f047d5077fafd836c80f, true).
item(_69c0f047d5077fafd836c810).
item_name(_69c0f047d5077fafd836c810, 'Potion2 Empty').
item_type(_69c0f047d5077fafd836c810, consumable).
item_value(_69c0f047d5077fafd836c810, 10).
item_weight(_69c0f047d5077fafd836c810, 0.5).
item_tradeable(_69c0f047d5077fafd836c810, true).
item(_69c0f047d5077fafd836c811).
item_name(_69c0f047d5077fafd836c811, 'Potion2 Filled').
item_type(_69c0f047d5077fafd836c811, consumable).
item_value(_69c0f047d5077fafd836c811, 10).
item_weight(_69c0f047d5077fafd836c811, 0.5).
item_tradeable(_69c0f047d5077fafd836c811, true).
item(_69c0f047d5077fafd836c812).
item_name(_69c0f047d5077fafd836c812, 'Potion3 Empty').
item_type(_69c0f047d5077fafd836c812, consumable).
item_value(_69c0f047d5077fafd836c812, 10).
item_weight(_69c0f047d5077fafd836c812, 0.5).
item_tradeable(_69c0f047d5077fafd836c812, true).
item(_69c0f047d5077fafd836c813).
item_name(_69c0f047d5077fafd836c813, 'Potion3 Filled').
item_type(_69c0f047d5077fafd836c813, consumable).
item_value(_69c0f047d5077fafd836c813, 10).
item_weight(_69c0f047d5077fafd836c813, 0.5).
item_tradeable(_69c0f047d5077fafd836c813, true).
item(_69c0f047d5077fafd836c814).
item_name(_69c0f047d5077fafd836c814, 'Potion4 Empty').
item_type(_69c0f047d5077fafd836c814, consumable).
item_value(_69c0f047d5077fafd836c814, 10).
item_weight(_69c0f047d5077fafd836c814, 0.5).
item_tradeable(_69c0f047d5077fafd836c814, true).
item(_69c0f047d5077fafd836c815).
item_name(_69c0f047d5077fafd836c815, 'Potion4 Filled').
item_type(_69c0f047d5077fafd836c815, consumable).
item_value(_69c0f047d5077fafd836c815, 10).
item_weight(_69c0f047d5077fafd836c815, 0.5).
item_tradeable(_69c0f047d5077fafd836c815, true).
item(_69c0f047d5077fafd836c816).
item_name(_69c0f047d5077fafd836c816, 'Potion5 Empty').
item_type(_69c0f047d5077fafd836c816, consumable).
item_value(_69c0f047d5077fafd836c816, 10).
item_weight(_69c0f047d5077fafd836c816, 0.5).
item_tradeable(_69c0f047d5077fafd836c816, true).
item(_69c0f047d5077fafd836c817).
item_name(_69c0f047d5077fafd836c817, 'Potion5 Filled').
item_type(_69c0f047d5077fafd836c817, consumable).
item_value(_69c0f047d5077fafd836c817, 10).
item_weight(_69c0f047d5077fafd836c817, 0.5).
item_tradeable(_69c0f047d5077fafd836c817, true).
item(_69c0f047d5077fafd836c818).
item_name(_69c0f047d5077fafd836c818, 'Potion6 Empty').
item_type(_69c0f047d5077fafd836c818, consumable).
item_value(_69c0f047d5077fafd836c818, 10).
item_weight(_69c0f047d5077fafd836c818, 0.5).
item_tradeable(_69c0f047d5077fafd836c818, true).
item(_69c0f047d5077fafd836c819).
item_name(_69c0f047d5077fafd836c819, 'Potion6 Filled').
item_type(_69c0f047d5077fafd836c819, consumable).
item_value(_69c0f047d5077fafd836c819, 10).
item_weight(_69c0f047d5077fafd836c819, 0.5).
item_tradeable(_69c0f047d5077fafd836c819, true).
item(_69c0f047d5077fafd836c81a).
item_name(_69c0f047d5077fafd836c81a, 'Potion7 Empty').
item_type(_69c0f047d5077fafd836c81a, consumable).
item_value(_69c0f047d5077fafd836c81a, 10).
item_weight(_69c0f047d5077fafd836c81a, 0.5).
item_tradeable(_69c0f047d5077fafd836c81a, true).
item(_69c0f047d5077fafd836c81b).
item_name(_69c0f047d5077fafd836c81b, 'Potion7 Filled').
item_type(_69c0f047d5077fafd836c81b, consumable).
item_value(_69c0f047d5077fafd836c81b, 10).
item_weight(_69c0f047d5077fafd836c81b, 0.5).
item_tradeable(_69c0f047d5077fafd836c81b, true).
item(_69c0f047d5077fafd836c81c).
item_name(_69c0f047d5077fafd836c81c, 'Potion8 Empty').
item_type(_69c0f047d5077fafd836c81c, consumable).
item_value(_69c0f047d5077fafd836c81c, 10).
item_weight(_69c0f047d5077fafd836c81c, 0.5).
item_tradeable(_69c0f047d5077fafd836c81c, true).
item(_69c0f047d5077fafd836c81d).
item_name(_69c0f047d5077fafd836c81d, 'Potion8 Filled').
item_type(_69c0f047d5077fafd836c81d, consumable).
item_value(_69c0f047d5077fafd836c81d, 10).
item_weight(_69c0f047d5077fafd836c81d, 0.5).
item_tradeable(_69c0f047d5077fafd836c81d, true).
item(_69c0f047d5077fafd836c81e).
item_name(_69c0f047d5077fafd836c81e, 'Potion9 Empty').
item_type(_69c0f047d5077fafd836c81e, consumable).
item_value(_69c0f047d5077fafd836c81e, 10).
item_weight(_69c0f047d5077fafd836c81e, 0.5).
item_tradeable(_69c0f047d5077fafd836c81e, true).
item(_69c0f047d5077fafd836c81f).
item_name(_69c0f047d5077fafd836c81f, 'Potion9 Filled').
item_type(_69c0f047d5077fafd836c81f, consumable).
item_value(_69c0f047d5077fafd836c81f, 10).
item_weight(_69c0f047d5077fafd836c81f, 0.5).
item_tradeable(_69c0f047d5077fafd836c81f, true).
item(_69c0f047d5077fafd836c820).
item_name(_69c0f047d5077fafd836c820, 'Pouch').
item_type(_69c0f047d5077fafd836c820, container).
item_value(_69c0f047d5077fafd836c820, 10).
item_weight(_69c0f047d5077fafd836c820, 5).
item_tradeable(_69c0f047d5077fafd836c820, true).
item(_69c0f047d5077fafd836c821).
item_name(_69c0f047d5077fafd836c821, 'Ring2').
item_type(_69c0f047d5077fafd836c821, accessory).
item_value(_69c0f047d5077fafd836c821, 50).
item_weight(_69c0f047d5077fafd836c821, 0.2).
item_tradeable(_69c0f047d5077fafd836c821, true).
item(_69c0f047d5077fafd836c822).
item_name(_69c0f047d5077fafd836c822, 'Ring3').
item_type(_69c0f047d5077fafd836c822, accessory).
item_value(_69c0f047d5077fafd836c822, 50).
item_weight(_69c0f047d5077fafd836c822, 0.2).
item_tradeable(_69c0f047d5077fafd836c822, true).
item(_69c0f047d5077fafd836c823).
item_name(_69c0f047d5077fafd836c823, 'Ring4').
item_type(_69c0f047d5077fafd836c823, accessory).
item_value(_69c0f047d5077fafd836c823, 50).
item_weight(_69c0f047d5077fafd836c823, 0.2).
item_tradeable(_69c0f047d5077fafd836c823, true).
item(_69c0f047d5077fafd836c824).
item_name(_69c0f047d5077fafd836c824, 'Ring5').
item_type(_69c0f047d5077fafd836c824, accessory).
item_value(_69c0f047d5077fafd836c824, 50).
item_weight(_69c0f047d5077fafd836c824, 0.2).
item_tradeable(_69c0f047d5077fafd836c824, true).
item(_69c0f047d5077fafd836c825).
item_name(_69c0f047d5077fafd836c825, 'Ring6').
item_type(_69c0f047d5077fafd836c825, accessory).
item_value(_69c0f047d5077fafd836c825, 50).
item_weight(_69c0f047d5077fafd836c825, 0.2).
item_tradeable(_69c0f047d5077fafd836c825, true).
item(_69c0f047d5077fafd836c826).
item_name(_69c0f047d5077fafd836c826, 'Ring7').
item_type(_69c0f047d5077fafd836c826, accessory).
item_value(_69c0f047d5077fafd836c826, 50).
item_weight(_69c0f047d5077fafd836c826, 0.2).
item_tradeable(_69c0f047d5077fafd836c826, true).
item(_69c0f047d5077fafd836c827).
item_name(_69c0f047d5077fafd836c827, 'Skull').
item_type(_69c0f047d5077fafd836c827, collectible).
item_value(_69c0f047d5077fafd836c827, 8).
item_weight(_69c0f047d5077fafd836c827, 0.5).
item_tradeable(_69c0f047d5077fafd836c827, true).
item(_69c0f047d5077fafd836c828).
item_name(_69c0f047d5077fafd836c828, 'Skull2').
item_type(_69c0f047d5077fafd836c828, collectible).
item_value(_69c0f047d5077fafd836c828, 8).
item_weight(_69c0f047d5077fafd836c828, 0.5).
item_tradeable(_69c0f047d5077fafd836c828, true).
item(_69c0f047d5077fafd836c829).
item_name(_69c0f047d5077fafd836c829, 'Snowflake1').
item_type(_69c0f047d5077fafd836c829, collectible).
item_value(_69c0f047d5077fafd836c829, 8).
item_weight(_69c0f047d5077fafd836c829, 0.5).
item_tradeable(_69c0f047d5077fafd836c829, true).
item(_69c0f047d5077fafd836c82a).
item_name(_69c0f047d5077fafd836c82a, 'Snowflake2').
item_type(_69c0f047d5077fafd836c82a, collectible).
item_value(_69c0f047d5077fafd836c82a, 8).
item_weight(_69c0f047d5077fafd836c82a, 0.5).
item_tradeable(_69c0f047d5077fafd836c82a, true).
item(_69c0f047d5077fafd836c82b).
item_name(_69c0f047d5077fafd836c82b, 'Snowflake3').
item_type(_69c0f047d5077fafd836c82b, collectible).
item_value(_69c0f047d5077fafd836c82b, 8).
item_weight(_69c0f047d5077fafd836c82b, 0.5).
item_tradeable(_69c0f047d5077fafd836c82b, true).
item(_69c0f047d5077fafd836c82d).
item_name(_69c0f047d5077fafd836c82d, 'Sword').
item_type(_69c0f047d5077fafd836c82d, weapon).
item_value(_69c0f047d5077fafd836c82d, 20).
item_weight(_69c0f047d5077fafd836c82d, 3).
item_tradeable(_69c0f047d5077fafd836c82d, true).
item(_69c0f047d5077fafd836c82e).
item_name(_69c0f047d5077fafd836c82e, 'Sword Golden').
item_type(_69c0f047d5077fafd836c82e, weapon).
item_value(_69c0f047d5077fafd836c82e, 20).
item_weight(_69c0f047d5077fafd836c82e, 3).
item_tradeable(_69c0f047d5077fafd836c82e, true).
item(_69c0f047d5077fafd836c82f).
item_name(_69c0f047d5077fafd836c82f, 'Sword Big').
item_type(_69c0f047d5077fafd836c82f, weapon).
item_value(_69c0f047d5077fafd836c82f, 20).
item_weight(_69c0f047d5077fafd836c82f, 3).
item_tradeable(_69c0f047d5077fafd836c82f, true).
item(_69c0f047d5077fafd836c830).
item_name(_69c0f047d5077fafd836c830, 'Sword Big Golden').
item_type(_69c0f047d5077fafd836c830, weapon).
item_value(_69c0f047d5077fafd836c830, 20).
item_weight(_69c0f047d5077fafd836c830, 3).
item_tradeable(_69c0f047d5077fafd836c830, true).
item(_69c0f047d5077fafd836c831).
item_name(_69c0f047d5077fafd836c831, 'Arrow').
item_type(_69c0f047d5077fafd836c831, weapon).
item_value(_69c0f047d5077fafd836c831, 20).
item_weight(_69c0f047d5077fafd836c831, 3).
item_tradeable(_69c0f047d5077fafd836c831, true).
item(_69c0f047d5077fafd836c835).
item_name(_69c0f047d5077fafd836c835, 'Bow Evil').
item_type(_69c0f047d5077fafd836c835, weapon).
item_value(_69c0f047d5077fafd836c835, 20).
item_weight(_69c0f047d5077fafd836c835, 3).
item_tradeable(_69c0f047d5077fafd836c835, true).
item(_69c0f047d5077fafd836c836).
item_name(_69c0f047d5077fafd836c836, 'Bow Golden').
item_type(_69c0f047d5077fafd836c836, weapon).
item_value(_69c0f047d5077fafd836c836, 20).
item_weight(_69c0f047d5077fafd836c836, 3).
item_tradeable(_69c0f047d5077fafd836c836, true).
item(_69c0f047d5077fafd836c837).
item_name(_69c0f047d5077fafd836c837, 'Bow Wooden').
item_type(_69c0f047d5077fafd836c837, weapon).
item_value(_69c0f047d5077fafd836c837, 20).
item_weight(_69c0f047d5077fafd836c837, 3).
item_tradeable(_69c0f047d5077fafd836c837, true).
item(_69c0f047d5077fafd836c838).
item_name(_69c0f047d5077fafd836c838, 'Bow Wooden2').
item_type(_69c0f047d5077fafd836c838, weapon).
item_value(_69c0f047d5077fafd836c838, 20).
item_weight(_69c0f047d5077fafd836c838, 3).
item_tradeable(_69c0f047d5077fafd836c838, true).
item(_69c0f047d5077fafd836c839).
item_name(_69c0f047d5077fafd836c839, 'Claymore').
item_type(_69c0f047d5077fafd836c839, weapon).
item_value(_69c0f047d5077fafd836c839, 20).
item_weight(_69c0f047d5077fafd836c839, 3).
item_tradeable(_69c0f047d5077fafd836c839, true).
item(_69c0f047d5077fafd836c83a).
item_name(_69c0f047d5077fafd836c83a, 'Dagger').
item_type(_69c0f047d5077fafd836c83a, weapon).
item_value(_69c0f047d5077fafd836c83a, 20).
item_weight(_69c0f047d5077fafd836c83a, 3).
item_tradeable(_69c0f047d5077fafd836c83a, true).
item(_69c0f047d5077fafd836c83b).
item_name(_69c0f047d5077fafd836c83b, 'Dagger').
item_type(_69c0f047d5077fafd836c83b, weapon).
item_value(_69c0f047d5077fafd836c83b, 20).
item_weight(_69c0f047d5077fafd836c83b, 3).
item_tradeable(_69c0f047d5077fafd836c83b, true).
item(_69c0f047d5077fafd836c83c).
item_name(_69c0f047d5077fafd836c83c, 'Hammer Double').
item_type(_69c0f047d5077fafd836c83c, weapon).
item_value(_69c0f047d5077fafd836c83c, 20).
item_weight(_69c0f047d5077fafd836c83c, 3).
item_tradeable(_69c0f047d5077fafd836c83c, true).
item(_69c0f047d5077fafd836c83d).
item_name(_69c0f047d5077fafd836c83d, 'Hammer Small').
item_type(_69c0f047d5077fafd836c83d, weapon).
item_value(_69c0f047d5077fafd836c83d, 20).
item_weight(_69c0f047d5077fafd836c83d, 3).
item_tradeable(_69c0f047d5077fafd836c83d, true).
item(_69c0f047d5077fafd836c83e).
item_name(_69c0f047d5077fafd836c83e, 'Scythe').
item_type(_69c0f047d5077fafd836c83e, weapon).
item_value(_69c0f047d5077fafd836c83e, 20).
item_weight(_69c0f047d5077fafd836c83e, 3).
item_tradeable(_69c0f047d5077fafd836c83e, true).
item(_69c0f047d5077fafd836c83f).
item_name(_69c0f047d5077fafd836c83f, 'Shield Celtic Golden').
item_type(_69c0f047d5077fafd836c83f, weapon).
item_value(_69c0f047d5077fafd836c83f, 20).
item_weight(_69c0f047d5077fafd836c83f, 3).
item_tradeable(_69c0f047d5077fafd836c83f, true).
item(_69c0f047d5077fafd836c840).
item_name(_69c0f047d5077fafd836c840, 'Shield Heater').
item_type(_69c0f047d5077fafd836c840, weapon).
item_value(_69c0f047d5077fafd836c840, 20).
item_weight(_69c0f047d5077fafd836c840, 3).
item_tradeable(_69c0f047d5077fafd836c840, true).
item(_69c0f047d5077fafd836c841).
item_name(_69c0f047d5077fafd836c841, 'Shield Heater').
item_type(_69c0f047d5077fafd836c841, weapon).
item_value(_69c0f047d5077fafd836c841, 20).
item_weight(_69c0f047d5077fafd836c841, 3).
item_tradeable(_69c0f047d5077fafd836c841, true).
item(_69c0f047d5077fafd836c842).
item_name(_69c0f047d5077fafd836c842, 'Shield Round').
item_type(_69c0f047d5077fafd836c842, weapon).
item_value(_69c0f047d5077fafd836c842, 20).
item_weight(_69c0f047d5077fafd836c842, 3).
item_tradeable(_69c0f047d5077fafd836c842, true).
item(_69c0f047d5077fafd836c843).
item_name(_69c0f047d5077fafd836c843, 'Shield Round').
item_type(_69c0f047d5077fafd836c843, weapon).
item_value(_69c0f047d5077fafd836c843, 20).
item_weight(_69c0f047d5077fafd836c843, 3).
item_tradeable(_69c0f047d5077fafd836c843, true).
item(_69c0f047d5077fafd836c844).
item_name(_69c0f047d5077fafd836c844, 'Sword').
item_type(_69c0f047d5077fafd836c844, weapon).
item_value(_69c0f047d5077fafd836c844, 20).
item_weight(_69c0f047d5077fafd836c844, 3).
item_tradeable(_69c0f047d5077fafd836c844, true).
item(_69c0f047d5077fafd836c845).
item_name(_69c0f047d5077fafd836c845, 'Sword').
item_type(_69c0f047d5077fafd836c845, weapon).
item_value(_69c0f047d5077fafd836c845, 20).
item_weight(_69c0f047d5077fafd836c845, 3).
item_tradeable(_69c0f047d5077fafd836c845, true).
item(_69c0f047d5077fafd836c846).
item_name(_69c0f047d5077fafd836c846, 'Sword Big').
item_type(_69c0f047d5077fafd836c846, weapon).
item_value(_69c0f047d5077fafd836c846, 20).
item_weight(_69c0f047d5077fafd836c846, 3).
item_tradeable(_69c0f047d5077fafd836c846, true).
item(_69c0f047d5077fafd836c847).
item_name(_69c0f047d5077fafd836c847, 'Sword Golden').
item_type(_69c0f047d5077fafd836c847, weapon).
item_value(_69c0f047d5077fafd836c847, 20).
item_weight(_69c0f047d5077fafd836c847, 3).
item_tradeable(_69c0f047d5077fafd836c847, true).
item(_69c0f047d5077fafd836c848).
item_name(_69c0f047d5077fafd836c848, 'Assault Rifle2').
item_type(_69c0f047d5077fafd836c848, weapon).
item_value(_69c0f047d5077fafd836c848, 30).
item_weight(_69c0f047d5077fafd836c848, 2).
item_tradeable(_69c0f047d5077fafd836c848, true).
item(_69c0f047d5077fafd836c849).
item_name(_69c0f047d5077fafd836c849, 'Assault Rifle2').
item_type(_69c0f047d5077fafd836c849, weapon).
item_value(_69c0f047d5077fafd836c849, 30).
item_weight(_69c0f047d5077fafd836c849, 2).
item_tradeable(_69c0f047d5077fafd836c849, true).
item(_69c0f047d5077fafd836c84a).
item_name(_69c0f047d5077fafd836c84a, 'Assault Rifle2').
item_type(_69c0f047d5077fafd836c84a, weapon).
item_value(_69c0f047d5077fafd836c84a, 30).
item_weight(_69c0f047d5077fafd836c84a, 2).
item_tradeable(_69c0f047d5077fafd836c84a, true).
item(_69c0f047d5077fafd836c84b).
item_name(_69c0f047d5077fafd836c84b, 'Assault Rifle2').
item_type(_69c0f047d5077fafd836c84b, weapon).
item_value(_69c0f047d5077fafd836c84b, 30).
item_weight(_69c0f047d5077fafd836c84b, 2).
item_tradeable(_69c0f047d5077fafd836c84b, true).
item(_69c0f047d5077fafd836c84c).
item_name(_69c0f047d5077fafd836c84c, 'Assault Rifle').
item_type(_69c0f047d5077fafd836c84c, weapon).
item_value(_69c0f047d5077fafd836c84c, 30).
item_weight(_69c0f047d5077fafd836c84c, 2).
item_tradeable(_69c0f047d5077fafd836c84c, true).
item(_69c0f047d5077fafd836c84d).
item_name(_69c0f047d5077fafd836c84d, 'Assault Rifle').
item_type(_69c0f047d5077fafd836c84d, weapon).
item_value(_69c0f047d5077fafd836c84d, 30).
item_weight(_69c0f047d5077fafd836c84d, 2).
item_tradeable(_69c0f047d5077fafd836c84d, true).
item(_69c0f047d5077fafd836c84e).
item_name(_69c0f047d5077fafd836c84e, 'Assault Rifle').
item_type(_69c0f047d5077fafd836c84e, weapon).
item_value(_69c0f047d5077fafd836c84e, 30).
item_weight(_69c0f047d5077fafd836c84e, 2).
item_tradeable(_69c0f047d5077fafd836c84e, true).
item(_69c0f047d5077fafd836c84f).
item_name(_69c0f047d5077fafd836c84f, 'Assault Rifle').
item_type(_69c0f047d5077fafd836c84f, weapon).
item_value(_69c0f047d5077fafd836c84f, 30).
item_weight(_69c0f047d5077fafd836c84f, 2).
item_tradeable(_69c0f047d5077fafd836c84f, true).
item(_69c0f047d5077fafd836c850).
item_name(_69c0f047d5077fafd836c850, 'Assault Rifle').
item_type(_69c0f047d5077fafd836c850, weapon).
item_value(_69c0f047d5077fafd836c850, 30).
item_weight(_69c0f047d5077fafd836c850, 2).
item_tradeable(_69c0f047d5077fafd836c850, true).
item(_69c0f047d5077fafd836c851).
item_name(_69c0f047d5077fafd836c851, 'Bullpup').
item_type(_69c0f047d5077fafd836c851, weapon).
item_value(_69c0f047d5077fafd836c851, 30).
item_weight(_69c0f047d5077fafd836c851, 2).
item_tradeable(_69c0f047d5077fafd836c851, true).
item(_69c0f047d5077fafd836c852).
item_name(_69c0f047d5077fafd836c852, 'Bullpup').
item_type(_69c0f047d5077fafd836c852, weapon).
item_value(_69c0f047d5077fafd836c852, 30).
item_weight(_69c0f047d5077fafd836c852, 2).
item_tradeable(_69c0f047d5077fafd836c852, true).
item(_69c0f047d5077fafd836c853).
item_name(_69c0f047d5077fafd836c853, 'Bullpup').
item_type(_69c0f047d5077fafd836c853, weapon).
item_value(_69c0f047d5077fafd836c853, 30).
item_weight(_69c0f047d5077fafd836c853, 2).
item_tradeable(_69c0f047d5077fafd836c853, true).
item(_69c0f047d5077fafd836c854).
item_name(_69c0f047d5077fafd836c854, 'Pistol').
item_type(_69c0f047d5077fafd836c854, weapon).
item_value(_69c0f047d5077fafd836c854, 30).
item_weight(_69c0f047d5077fafd836c854, 2).
item_tradeable(_69c0f047d5077fafd836c854, true).
item(_69c0f047d5077fafd836c855).
item_name(_69c0f047d5077fafd836c855, 'Pistol').
item_type(_69c0f047d5077fafd836c855, weapon).
item_value(_69c0f047d5077fafd836c855, 30).
item_weight(_69c0f047d5077fafd836c855, 2).
item_tradeable(_69c0f047d5077fafd836c855, true).
item(_69c0f047d5077fafd836c856).
item_name(_69c0f047d5077fafd836c856, 'Pistol').
item_type(_69c0f047d5077fafd836c856, weapon).
item_value(_69c0f047d5077fafd836c856, 30).
item_weight(_69c0f047d5077fafd836c856, 2).
item_tradeable(_69c0f047d5077fafd836c856, true).
item(_69c0f047d5077fafd836c857).
item_name(_69c0f047d5077fafd836c857, 'Pistol').
item_type(_69c0f047d5077fafd836c857, weapon).
item_value(_69c0f047d5077fafd836c857, 30).
item_weight(_69c0f047d5077fafd836c857, 2).
item_tradeable(_69c0f047d5077fafd836c857, true).
item(_69c0f047d5077fafd836c858).
item_name(_69c0f047d5077fafd836c858, 'Pistol').
item_type(_69c0f047d5077fafd836c858, weapon).
item_value(_69c0f047d5077fafd836c858, 30).
item_weight(_69c0f047d5077fafd836c858, 2).
item_tradeable(_69c0f047d5077fafd836c858, true).
item(_69c0f047d5077fafd836c859).
item_name(_69c0f047d5077fafd836c859, 'Pistol').
item_type(_69c0f047d5077fafd836c859, weapon).
item_value(_69c0f047d5077fafd836c859, 30).
item_weight(_69c0f047d5077fafd836c859, 2).
item_tradeable(_69c0f047d5077fafd836c859, true).
item(_69c0f047d5077fafd836c85a).
item_name(_69c0f047d5077fafd836c85a, 'Revolver').
item_type(_69c0f047d5077fafd836c85a, weapon).
item_value(_69c0f047d5077fafd836c85a, 30).
item_weight(_69c0f047d5077fafd836c85a, 2).
item_tradeable(_69c0f047d5077fafd836c85a, true).
item(_69c0f047d5077fafd836c85b).
item_name(_69c0f047d5077fafd836c85b, 'Revolver').
item_type(_69c0f047d5077fafd836c85b, weapon).
item_value(_69c0f047d5077fafd836c85b, 30).
item_weight(_69c0f047d5077fafd836c85b, 2).
item_tradeable(_69c0f047d5077fafd836c85b, true).
item(_69c0f047d5077fafd836c85c).
item_name(_69c0f047d5077fafd836c85c, 'Revolver').
item_type(_69c0f047d5077fafd836c85c, weapon).
item_value(_69c0f047d5077fafd836c85c, 30).
item_weight(_69c0f047d5077fafd836c85c, 2).
item_tradeable(_69c0f047d5077fafd836c85c, true).
item(_69c0f047d5077fafd836c85d).
item_name(_69c0f047d5077fafd836c85d, 'Revolver').
item_type(_69c0f047d5077fafd836c85d, weapon).
item_value(_69c0f047d5077fafd836c85d, 30).
item_weight(_69c0f047d5077fafd836c85d, 2).
item_tradeable(_69c0f047d5077fafd836c85d, true).
item(_69c0f047d5077fafd836c85e).
item_name(_69c0f047d5077fafd836c85e, 'Revolver').
item_type(_69c0f047d5077fafd836c85e, weapon).
item_value(_69c0f047d5077fafd836c85e, 30).
item_weight(_69c0f047d5077fafd836c85e, 2).
item_tradeable(_69c0f047d5077fafd836c85e, true).
item(_69c0f047d5077fafd836c85f).
item_name(_69c0f047d5077fafd836c85f, 'Shotgun').
item_type(_69c0f047d5077fafd836c85f, weapon).
item_value(_69c0f047d5077fafd836c85f, 30).
item_weight(_69c0f047d5077fafd836c85f, 2).
item_tradeable(_69c0f047d5077fafd836c85f, true).
item(_69c0f047d5077fafd836c860).
item_name(_69c0f047d5077fafd836c860, 'Shotgun').
item_type(_69c0f047d5077fafd836c860, weapon).
item_value(_69c0f047d5077fafd836c860, 30).
item_weight(_69c0f047d5077fafd836c860, 2).
item_tradeable(_69c0f047d5077fafd836c860, true).
item(_69c0f047d5077fafd836c861).
item_name(_69c0f047d5077fafd836c861, 'Shotgun').
item_type(_69c0f047d5077fafd836c861, weapon).
item_value(_69c0f047d5077fafd836c861, 30).
item_weight(_69c0f047d5077fafd836c861, 2).
item_tradeable(_69c0f047d5077fafd836c861, true).
item(_69c0f047d5077fafd836c862).
item_name(_69c0f047d5077fafd836c862, 'Shotgun').
item_type(_69c0f047d5077fafd836c862, weapon).
item_value(_69c0f047d5077fafd836c862, 30).
item_weight(_69c0f047d5077fafd836c862, 2).
item_tradeable(_69c0f047d5077fafd836c862, true).
item(_69c0f047d5077fafd836c863).
item_name(_69c0f047d5077fafd836c863, 'Shotgun Sawed Off').
item_type(_69c0f047d5077fafd836c863, weapon).
item_value(_69c0f047d5077fafd836c863, 30).
item_weight(_69c0f047d5077fafd836c863, 2).
item_tradeable(_69c0f047d5077fafd836c863, true).
item(_69c0f047d5077fafd836c864).
item_name(_69c0f047d5077fafd836c864, 'Shotgun Short Stock').
item_type(_69c0f047d5077fafd836c864, weapon).
item_value(_69c0f047d5077fafd836c864, 30).
item_weight(_69c0f047d5077fafd836c864, 2).
item_tradeable(_69c0f047d5077fafd836c864, true).
item(_69c0f047d5077fafd836c865).
item_name(_69c0f047d5077fafd836c865, 'Sniper Rifle').
item_type(_69c0f047d5077fafd836c865, weapon).
item_value(_69c0f047d5077fafd836c865, 30).
item_weight(_69c0f047d5077fafd836c865, 2).
item_tradeable(_69c0f047d5077fafd836c865, true).
item(_69c0f047d5077fafd836c866).
item_name(_69c0f047d5077fafd836c866, 'Sniper Rifle').
item_type(_69c0f047d5077fafd836c866, weapon).
item_value(_69c0f047d5077fafd836c866, 30).
item_weight(_69c0f047d5077fafd836c866, 2).
item_tradeable(_69c0f047d5077fafd836c866, true).
item(_69c0f047d5077fafd836c867).
item_name(_69c0f047d5077fafd836c867, 'Sniper Rifle').
item_type(_69c0f047d5077fafd836c867, weapon).
item_value(_69c0f047d5077fafd836c867, 30).
item_weight(_69c0f047d5077fafd836c867, 2).
item_tradeable(_69c0f047d5077fafd836c867, true).
item(_69c0f047d5077fafd836c868).
item_name(_69c0f047d5077fafd836c868, 'Sniper Rifle').
item_type(_69c0f047d5077fafd836c868, weapon).
item_value(_69c0f047d5077fafd836c868, 30).
item_weight(_69c0f047d5077fafd836c868, 2).
item_tradeable(_69c0f047d5077fafd836c868, true).
item(_69c0f047d5077fafd836c869).
item_name(_69c0f047d5077fafd836c869, 'Sniper Rifle').
item_type(_69c0f047d5077fafd836c869, weapon).
item_value(_69c0f047d5077fafd836c869, 30).
item_weight(_69c0f047d5077fafd836c869, 2).
item_tradeable(_69c0f047d5077fafd836c869, true).
item(_69c0f047d5077fafd836c86a).
item_name(_69c0f047d5077fafd836c86a, 'Sniper Rifle').
item_type(_69c0f047d5077fafd836c86a, weapon).
item_value(_69c0f047d5077fafd836c86a, 30).
item_weight(_69c0f047d5077fafd836c86a, 2).
item_tradeable(_69c0f047d5077fafd836c86a, true).
item(_69c0f047d5077fafd836c86b).
item_name(_69c0f047d5077fafd836c86b, 'Submachine Gun').
item_type(_69c0f047d5077fafd836c86b, weapon).
item_value(_69c0f047d5077fafd836c86b, 30).
item_weight(_69c0f047d5077fafd836c86b, 2).
item_tradeable(_69c0f047d5077fafd836c86b, true).
item(_69c0f047d5077fafd836c86c).
item_name(_69c0f047d5077fafd836c86c, 'Submachine Gun').
item_type(_69c0f047d5077fafd836c86c, weapon).
item_value(_69c0f047d5077fafd836c86c, 30).
item_weight(_69c0f047d5077fafd836c86c, 2).
item_tradeable(_69c0f047d5077fafd836c86c, true).
item(_69c0f047d5077fafd836c86d).
item_name(_69c0f047d5077fafd836c86d, 'Submachine Gun').
item_type(_69c0f047d5077fafd836c86d, weapon).
item_value(_69c0f047d5077fafd836c86d, 30).
item_weight(_69c0f047d5077fafd836c86d, 2).
item_tradeable(_69c0f047d5077fafd836c86d, true).
item(_69c0f047d5077fafd836c86e).
item_name(_69c0f047d5077fafd836c86e, 'Submachine Gun').
item_type(_69c0f047d5077fafd836c86e, weapon).
item_value(_69c0f047d5077fafd836c86e, 30).
item_weight(_69c0f047d5077fafd836c86e, 2).
item_tradeable(_69c0f047d5077fafd836c86e, true).
item(_69c0f047d5077fafd836c86f).
item_name(_69c0f047d5077fafd836c86f, 'Submachine Gun').
item_type(_69c0f047d5077fafd836c86f, weapon).
item_value(_69c0f047d5077fafd836c86f, 30).
item_weight(_69c0f047d5077fafd836c86f, 2).
item_tradeable(_69c0f047d5077fafd836c86f, true).
item(_69c0f047d5077fafd836c870).
item_name(_69c0f047d5077fafd836c870, 'Apple').
item_type(_69c0f047d5077fafd836c870, consumable).
item_value(_69c0f047d5077fafd836c870, 3).
item_weight(_69c0f047d5077fafd836c870, 0.5).
item_tradeable(_69c0f047d5077fafd836c870, true).
item(_69c0f047d5077fafd836c871).
item_name(_69c0f047d5077fafd836c871, 'Apple Green').
item_type(_69c0f047d5077fafd836c871, consumable).
item_value(_69c0f047d5077fafd836c871, 3).
item_weight(_69c0f047d5077fafd836c871, 0.5).
item_tradeable(_69c0f047d5077fafd836c871, true).
item(_69c0f047d5077fafd836c873).
item_name(_69c0f047d5077fafd836c873, 'Avocado Empty').
item_type(_69c0f047d5077fafd836c873, consumable).
item_value(_69c0f047d5077fafd836c873, 3).
item_weight(_69c0f047d5077fafd836c873, 0.5).
item_tradeable(_69c0f047d5077fafd836c873, true).
item(_69c0f047d5077fafd836c874).
item_name(_69c0f047d5077fafd836c874, 'Bacon Burned').
item_type(_69c0f047d5077fafd836c874, consumable).
item_value(_69c0f047d5077fafd836c874, 3).
item_weight(_69c0f047d5077fafd836c874, 0.5).
item_tradeable(_69c0f047d5077fafd836c874, true).
item(_69c0f047d5077fafd836c875).
item_name(_69c0f047d5077fafd836c875, 'Bacon Cooked').
item_type(_69c0f047d5077fafd836c875, consumable).
item_value(_69c0f047d5077fafd836c875, 3).
item_weight(_69c0f047d5077fafd836c875, 0.5).
item_tradeable(_69c0f047d5077fafd836c875, true).
item(_69c0f047d5077fafd836c876).
item_name(_69c0f047d5077fafd836c876, 'Bacon Uncooked').
item_type(_69c0f047d5077fafd836c876, consumable).
item_value(_69c0f047d5077fafd836c876, 3).
item_weight(_69c0f047d5077fafd836c876, 0.5).
item_tradeable(_69c0f047d5077fafd836c876, true).
item(_69c0f047d5077fafd836c878).
item_name(_69c0f047d5077fafd836c878, 'Bottle1').
item_type(_69c0f047d5077fafd836c878, consumable).
item_value(_69c0f047d5077fafd836c878, 3).
item_weight(_69c0f047d5077fafd836c878, 0.5).
item_tradeable(_69c0f047d5077fafd836c878, true).
item(_69c0f047d5077fafd836c879).
item_name(_69c0f047d5077fafd836c879, 'Bottle2').
item_type(_69c0f047d5077fafd836c879, consumable).
item_value(_69c0f047d5077fafd836c879, 3).
item_weight(_69c0f047d5077fafd836c879, 0.5).
item_tradeable(_69c0f047d5077fafd836c879, true).
item(_69c0f047d5077fafd836c87a).
item_name(_69c0f047d5077fafd836c87a, 'Bread').
item_type(_69c0f047d5077fafd836c87a, consumable).
item_value(_69c0f047d5077fafd836c87a, 3).
item_weight(_69c0f047d5077fafd836c87a, 0.5).
item_tradeable(_69c0f047d5077fafd836c87a, true).
item(_69c0f047d5077fafd836c87b).
item_name(_69c0f047d5077fafd836c87b, 'Bread Slice').
item_type(_69c0f047d5077fafd836c87b, consumable).
item_value(_69c0f047d5077fafd836c87b, 3).
item_weight(_69c0f047d5077fafd836c87b, 0.5).
item_tradeable(_69c0f047d5077fafd836c87b, true).
item(_69c0f047d5077fafd836c87c).
item_name(_69c0f047d5077fafd836c87c, 'Broccoli').
item_type(_69c0f047d5077fafd836c87c, consumable).
item_value(_69c0f047d5077fafd836c87c, 3).
item_weight(_69c0f047d5077fafd836c87c, 0.5).
item_tradeable(_69c0f047d5077fafd836c87c, true).
item(_69c0f047d5077fafd836c87d).
item_name(_69c0f047d5077fafd836c87d, 'Burger').
item_type(_69c0f047d5077fafd836c87d, consumable).
item_value(_69c0f047d5077fafd836c87d, 3).
item_weight(_69c0f047d5077fafd836c87d, 0.5).
item_tradeable(_69c0f047d5077fafd836c87d, true).
item(_69c0f047d5077fafd836c87e).
item_name(_69c0f047d5077fafd836c87e, 'Burger Large').
item_type(_69c0f047d5077fafd836c87e, consumable).
item_value(_69c0f047d5077fafd836c87e, 3).
item_weight(_69c0f047d5077fafd836c87e, 0.5).
item_tradeable(_69c0f047d5077fafd836c87e, true).
item(_69c0f047d5077fafd836c87f).
item_name(_69c0f047d5077fafd836c87f, 'Burger Patty Burned').
item_type(_69c0f047d5077fafd836c87f, consumable).
item_value(_69c0f047d5077fafd836c87f, 3).
item_weight(_69c0f047d5077fafd836c87f, 0.5).
item_tradeable(_69c0f047d5077fafd836c87f, true).
item(_69c0f047d5077fafd836c880).
item_name(_69c0f047d5077fafd836c880, 'Burger Patty Cooked').
item_type(_69c0f047d5077fafd836c880, consumable).
item_value(_69c0f047d5077fafd836c880, 3).
item_weight(_69c0f047d5077fafd836c880, 0.5).
item_tradeable(_69c0f047d5077fafd836c880, true).
item(_69c0f047d5077fafd836c881).
item_name(_69c0f047d5077fafd836c881, 'Burger Patty Raw').
item_type(_69c0f047d5077fafd836c881, consumable).
item_value(_69c0f047d5077fafd836c881, 3).
item_weight(_69c0f047d5077fafd836c881, 0.5).
item_tradeable(_69c0f047d5077fafd836c881, true).
item(_69c0f047d5077fafd836c882).
item_name(_69c0f047d5077fafd836c882, 'Burger Bread').
item_type(_69c0f047d5077fafd836c882, consumable).
item_value(_69c0f047d5077fafd836c882, 3).
item_weight(_69c0f047d5077fafd836c882, 0.5).
item_tradeable(_69c0f047d5077fafd836c882, true).
item(_69c0f047d5077fafd836c883).
item_name(_69c0f047d5077fafd836c883, 'Carrot').
item_type(_69c0f047d5077fafd836c883, consumable).
item_value(_69c0f047d5077fafd836c883, 3).
item_weight(_69c0f047d5077fafd836c883, 0.5).
item_tradeable(_69c0f047d5077fafd836c883, true).
item(_69c0f047d5077fafd836c884).
item_name(_69c0f047d5077fafd836c884, 'Cheese Singles').
item_type(_69c0f047d5077fafd836c884, consumable).
item_value(_69c0f047d5077fafd836c884, 3).
item_weight(_69c0f047d5077fafd836c884, 0.5).
item_tradeable(_69c0f047d5077fafd836c884, true).
item(_69c0f047d5077fafd836c885).
item_name(_69c0f047d5077fafd836c885, 'Cheeseburger').
item_type(_69c0f047d5077fafd836c885, consumable).
item_value(_69c0f047d5077fafd836c885, 3).
item_weight(_69c0f047d5077fafd836c885, 0.5).
item_tradeable(_69c0f047d5077fafd836c885, true).
item(_69c0f047d5077fafd836c886).
item_name(_69c0f047d5077fafd836c886, 'Chicken Leg').
item_type(_69c0f047d5077fafd836c886, consumable).
item_value(_69c0f047d5077fafd836c886, 3).
item_weight(_69c0f047d5077fafd836c886, 0.5).
item_tradeable(_69c0f047d5077fafd836c886, true).
item(_69c0f047d5077fafd836c887).
item_name(_69c0f047d5077fafd836c887, 'Chocolate Bar').
item_type(_69c0f047d5077fafd836c887, consumable).
item_value(_69c0f047d5077fafd836c887, 3).
item_weight(_69c0f047d5077fafd836c887, 0.5).
item_tradeable(_69c0f047d5077fafd836c887, true).
item(_69c0f047d5077fafd836c888).
item_name(_69c0f047d5077fafd836c888, 'Chopsticks').
item_type(_69c0f047d5077fafd836c888, consumable).
item_value(_69c0f047d5077fafd836c888, 3).
item_weight(_69c0f047d5077fafd836c888, 0.5).
item_tradeable(_69c0f047d5077fafd836c888, true).
item(_69c0f047d5077fafd836c889).
item_name(_69c0f047d5077fafd836c889, 'Coconut').
item_type(_69c0f047d5077fafd836c889, consumable).
item_value(_69c0f047d5077fafd836c889, 3).
item_weight(_69c0f047d5077fafd836c889, 0.5).
item_tradeable(_69c0f047d5077fafd836c889, true).
item(_69c0f047d5077fafd836c88a).
item_name(_69c0f047d5077fafd836c88a, 'Coconut Half').
item_type(_69c0f047d5077fafd836c88a, consumable).
item_value(_69c0f047d5077fafd836c88a, 3).
item_weight(_69c0f047d5077fafd836c88a, 0.5).
item_tradeable(_69c0f047d5077fafd836c88a, true).
item(_69c0f047d5077fafd836c88c).
item_name(_69c0f047d5077fafd836c88c, 'Cooking Pot2').
item_type(_69c0f047d5077fafd836c88c, consumable).
item_value(_69c0f047d5077fafd836c88c, 3).
item_weight(_69c0f047d5077fafd836c88c, 0.5).
item_tradeable(_69c0f047d5077fafd836c88c, true).
item(_69c0f047d5077fafd836c88d).
item_name(_69c0f047d5077fafd836c88d, 'Cooking Pot2 Soup').
item_type(_69c0f047d5077fafd836c88d, consumable).
item_value(_69c0f047d5077fafd836c88d, 3).
item_weight(_69c0f047d5077fafd836c88d, 0.5).
item_tradeable(_69c0f047d5077fafd836c88d, true).
item(_69c0f047d5077fafd836c88e).
item_name(_69c0f047d5077fafd836c88e, 'Cooking Pot Soup').
item_type(_69c0f047d5077fafd836c88e, consumable).
item_value(_69c0f047d5077fafd836c88e, 3).
item_weight(_69c0f047d5077fafd836c88e, 0.5).
item_tradeable(_69c0f047d5077fafd836c88e, true).
item(_69c0f047d5077fafd836c88f).
item_name(_69c0f047d5077fafd836c88f, 'Corndog').
item_type(_69c0f047d5077fafd836c88f, consumable).
item_value(_69c0f047d5077fafd836c88f, 3).
item_weight(_69c0f047d5077fafd836c88f, 0.5).
item_tradeable(_69c0f047d5077fafd836c88f, true).
item(_69c0f047d5077fafd836c892).
item_name(_69c0f047d5077fafd836c892, 'Donut1').
item_type(_69c0f047d5077fafd836c892, consumable).
item_value(_69c0f047d5077fafd836c892, 3).
item_weight(_69c0f047d5077fafd836c892, 0.5).
item_tradeable(_69c0f047d5077fafd836c892, true).
item(_69c0f047d5077fafd836c893).
item_name(_69c0f047d5077fafd836c893, 'Donut2').
item_type(_69c0f047d5077fafd836c893, consumable).
item_value(_69c0f047d5077fafd836c893, 3).
item_weight(_69c0f047d5077fafd836c893, 0.5).
item_tradeable(_69c0f047d5077fafd836c893, true).
item(_69c0f047d5077fafd836c894).
item_name(_69c0f047d5077fafd836c894, 'Donut3').
item_type(_69c0f047d5077fafd836c894, consumable).
item_value(_69c0f047d5077fafd836c894, 3).
item_weight(_69c0f047d5077fafd836c894, 0.5).
item_tradeable(_69c0f047d5077fafd836c894, true).
item(_69c0f047d5077fafd836c895).
item_name(_69c0f047d5077fafd836c895, 'Donut4').
item_type(_69c0f047d5077fafd836c895, consumable).
item_value(_69c0f047d5077fafd836c895, 3).
item_weight(_69c0f047d5077fafd836c895, 0.5).
item_tradeable(_69c0f047d5077fafd836c895, true).
item(_69c0f047d5077fafd836c897).
item_name(_69c0f047d5077fafd836c897, 'Egg Burned').
item_type(_69c0f047d5077fafd836c897, consumable).
item_value(_69c0f047d5077fafd836c897, 3).
item_weight(_69c0f047d5077fafd836c897, 0.5).
item_tradeable(_69c0f047d5077fafd836c897, true).
item(_69c0f047d5077fafd836c898).
item_name(_69c0f047d5077fafd836c898, 'Egg Fried').
item_type(_69c0f047d5077fafd836c898, consumable).
item_value(_69c0f047d5077fafd836c898, 3).
item_weight(_69c0f047d5077fafd836c898, 0.5).
item_tradeable(_69c0f047d5077fafd836c898, true).
item(_69c0f047d5077fafd836c899).
item_name(_69c0f047d5077fafd836c899, 'Egg Whole').
item_type(_69c0f047d5077fafd836c899, consumable).
item_value(_69c0f047d5077fafd836c899, 3).
item_weight(_69c0f047d5077fafd836c899, 0.5).
item_tradeable(_69c0f047d5077fafd836c899, true).
item(_69c0f047d5077fafd836c89b).
item_name(_69c0f047d5077fafd836c89b, 'Eggplant').
item_type(_69c0f047d5077fafd836c89b, consumable).
item_value(_69c0f047d5077fafd836c89b, 3).
item_weight(_69c0f047d5077fafd836c89b, 0.5).
item_tradeable(_69c0f047d5077fafd836c89b, true).
item(_69c0f047d5077fafd836c89c).
item_name(_69c0f047d5077fafd836c89c, 'Fish').
item_type(_69c0f047d5077fafd836c89c, consumable).
item_value(_69c0f047d5077fafd836c89c, 3).
item_weight(_69c0f047d5077fafd836c89c, 0.5).
item_tradeable(_69c0f047d5077fafd836c89c, true).
item(_69c0f047d5077fafd836c89d).
item_name(_69c0f047d5077fafd836c89d, 'Fish Bone').
item_type(_69c0f047d5077fafd836c89d, consumable).
item_value(_69c0f047d5077fafd836c89d, 3).
item_weight(_69c0f047d5077fafd836c89d, 0.5).
item_tradeable(_69c0f047d5077fafd836c89d, true).
item(_69c0f047d5077fafd836c89e).
item_name(_69c0f047d5077fafd836c89e, 'Fork').
item_type(_69c0f047d5077fafd836c89e, consumable).
item_value(_69c0f047d5077fafd836c89e, 3).
item_weight(_69c0f047d5077fafd836c89e, 0.5).
item_tradeable(_69c0f047d5077fafd836c89e, true).
item(_69c0f047d5077fafd836c89f).
item_name(_69c0f047d5077fafd836c89f, 'Fries').
item_type(_69c0f047d5077fafd836c89f, consumable).
item_value(_69c0f047d5077fafd836c89f, 3).
item_weight(_69c0f047d5077fafd836c89f, 0.5).
item_tradeable(_69c0f047d5077fafd836c89f, true).
item(_69c0f047d5077fafd836c8a0).
item_name(_69c0f047d5077fafd836c8a0, 'Frying Pan').
item_type(_69c0f047d5077fafd836c8a0, consumable).
item_value(_69c0f047d5077fafd836c8a0, 3).
item_weight(_69c0f047d5077fafd836c8a0, 0.5).
item_tradeable(_69c0f047d5077fafd836c8a0, true).
item(_69c0f047d5077fafd836c8a2).
item_name(_69c0f047d5077fafd836c8a2, 'Hotdog Bun').
item_type(_69c0f047d5077fafd836c8a2, consumable).
item_value(_69c0f047d5077fafd836c8a2, 3).
item_weight(_69c0f047d5077fafd836c8a2, 0.5).
item_tradeable(_69c0f047d5077fafd836c8a2, true).
item(_69c0f047d5077fafd836c8a3).
item_name(_69c0f047d5077fafd836c8a3, 'Ice Cream').
item_type(_69c0f047d5077fafd836c8a3, consumable).
item_value(_69c0f047d5077fafd836c8a3, 3).
item_weight(_69c0f047d5077fafd836c8a3, 0.5).
item_tradeable(_69c0f047d5077fafd836c8a3, true).
item(_69c0f047d5077fafd836c8a4).
item_name(_69c0f047d5077fafd836c8a4, 'Ice Cream').
item_type(_69c0f047d5077fafd836c8a4, consumable).
item_value(_69c0f047d5077fafd836c8a4, 3).
item_weight(_69c0f047d5077fafd836c8a4, 0.5).
item_tradeable(_69c0f047d5077fafd836c8a4, true).
item(_69c0f047d5077fafd836c8a5).
item_name(_69c0f047d5077fafd836c8a5, 'Ice Cream').
item_type(_69c0f047d5077fafd836c8a5, consumable).
item_value(_69c0f047d5077fafd836c8a5, 3).
item_weight(_69c0f047d5077fafd836c8a5, 0.5).
item_tradeable(_69c0f047d5077fafd836c8a5, true).
item(_69c0f047d5077fafd836c8a6).
item_name(_69c0f047d5077fafd836c8a6, 'Ice Cream').
item_type(_69c0f047d5077fafd836c8a6, consumable).
item_value(_69c0f047d5077fafd836c8a6, 3).
item_weight(_69c0f047d5077fafd836c8a6, 0.5).
item_tradeable(_69c0f047d5077fafd836c8a6, true).
item(_69c0f047d5077fafd836c8a8).
item_name(_69c0f047d5077fafd836c8a8, 'Ice Cream Cone2').
item_type(_69c0f047d5077fafd836c8a8, consumable).
item_value(_69c0f047d5077fafd836c8a8, 3).
item_weight(_69c0f047d5077fafd836c8a8, 0.5).
item_tradeable(_69c0f047d5077fafd836c8a8, true).
item(_69c0f047d5077fafd836c8a9).
item_name(_69c0f047d5077fafd836c8a9, 'Jar Large').
item_type(_69c0f047d5077fafd836c8a9, consumable).
item_value(_69c0f047d5077fafd836c8a9, 3).
item_weight(_69c0f047d5077fafd836c8a9, 0.5).
item_tradeable(_69c0f047d5077fafd836c8a9, true).
item(_69c0f047d5077fafd836c8aa).
item_name(_69c0f047d5077fafd836c8aa, 'Ketchup Bottle').
item_type(_69c0f047d5077fafd836c8aa, consumable).
item_value(_69c0f047d5077fafd836c8aa, 3).
item_weight(_69c0f047d5077fafd836c8aa, 0.5).
item_tradeable(_69c0f047d5077fafd836c8aa, true).
item(_69c0f047d5077fafd836c8ab).
item_name(_69c0f047d5077fafd836c8ab, 'Ketchup Mustard').
item_type(_69c0f047d5077fafd836c8ab, consumable).
item_value(_69c0f047d5077fafd836c8ab, 3).
item_weight(_69c0f047d5077fafd836c8ab, 0.5).
item_tradeable(_69c0f047d5077fafd836c8ab, true).
item(_69c0f047d5077fafd836c8ad).
item_name(_69c0f047d5077fafd836c8ad, 'Lettuce').
item_type(_69c0f047d5077fafd836c8ad, consumable).
item_value(_69c0f047d5077fafd836c8ad, 3).
item_weight(_69c0f047d5077fafd836c8ad, 0.5).
item_tradeable(_69c0f047d5077fafd836c8ad, true).
item(_69c0f047d5077fafd836c8ae).
item_name(_69c0f047d5077fafd836c8ae, 'Lettuce Whole').
item_type(_69c0f047d5077fafd836c8ae, consumable).
item_value(_69c0f047d5077fafd836c8ae, 3).
item_weight(_69c0f047d5077fafd836c8ae, 0.5).
item_tradeable(_69c0f047d5077fafd836c8ae, true).
item(_69c0f047d5077fafd836c8af).
item_name(_69c0f047d5077fafd836c8af, 'Mayo Bottle').
item_type(_69c0f047d5077fafd836c8af, consumable).
item_value(_69c0f047d5077fafd836c8af, 3).
item_weight(_69c0f047d5077fafd836c8af, 0.5).
item_tradeable(_69c0f047d5077fafd836c8af, true).
item(_69c0f047d5077fafd836c8b0).
item_name(_69c0f047d5077fafd836c8b0, 'Mushroom').
item_type(_69c0f047d5077fafd836c8b0, consumable).
item_value(_69c0f047d5077fafd836c8b0, 3).
item_weight(_69c0f047d5077fafd836c8b0, 0.5).
item_tradeable(_69c0f047d5077fafd836c8b0, true).
item(_69c0f047d5077fafd836c8b1).
item_name(_69c0f047d5077fafd836c8b1, 'Mushroom Sliced').
item_type(_69c0f047d5077fafd836c8b1, consumable).
item_value(_69c0f047d5077fafd836c8b1, 3).
item_weight(_69c0f047d5077fafd836c8b1, 0.5).
item_tradeable(_69c0f047d5077fafd836c8b1, true).
item(_69c0f047d5077fafd836c8b2).
item_name(_69c0f047d5077fafd836c8b2, 'Mustard Bottle').
item_type(_69c0f047d5077fafd836c8b2, consumable).
item_value(_69c0f047d5077fafd836c8b2, 3).
item_weight(_69c0f047d5077fafd836c8b2, 0.5).
item_tradeable(_69c0f047d5077fafd836c8b2, true).
item(_69c0f047d5077fafd836c8b3).
item_name(_69c0f047d5077fafd836c8b3, 'Orange').
item_type(_69c0f047d5077fafd836c8b3, consumable).
item_value(_69c0f047d5077fafd836c8b3, 3).
item_weight(_69c0f047d5077fafd836c8b3, 0.5).
item_tradeable(_69c0f047d5077fafd836c8b3, true).
item(_69c0f047d5077fafd836c8b6).
item_name(_69c0f047d5077fafd836c8b6, 'Peanut Butter').
item_type(_69c0f047d5077fafd836c8b6, consumable).
item_value(_69c0f047d5077fafd836c8b6, 3).
item_weight(_69c0f047d5077fafd836c8b6, 0.5).
item_tradeable(_69c0f047d5077fafd836c8b6, true).
item(_69c0f047d5077fafd836c8b7).
item_name(_69c0f047d5077fafd836c8b7, 'Peanut Butter').
item_type(_69c0f047d5077fafd836c8b7, consumable).
item_value(_69c0f047d5077fafd836c8b7, 3).
item_weight(_69c0f047d5077fafd836c8b7, 0.5).
item_tradeable(_69c0f047d5077fafd836c8b7, true).
item(_69c0f047d5077fafd836c8b8).
item_name(_69c0f047d5077fafd836c8b8, 'Pepper Green').
item_type(_69c0f047d5077fafd836c8b8, consumable).
item_value(_69c0f047d5077fafd836c8b8, 3).
item_weight(_69c0f047d5077fafd836c8b8, 0.5).
item_tradeable(_69c0f047d5077fafd836c8b8, true).
item(_69c0f047d5077fafd836c8b9).
item_name(_69c0f047d5077fafd836c8b9, 'Pepper Red').
item_type(_69c0f047d5077fafd836c8b9, consumable).
item_value(_69c0f047d5077fafd836c8b9, 3).
item_weight(_69c0f047d5077fafd836c8b9, 0.5).
item_tradeable(_69c0f047d5077fafd836c8b9, true).
item(_69c0f047d5077fafd836c8ba).
item_name(_69c0f047d5077fafd836c8ba, 'Pizza').
item_type(_69c0f047d5077fafd836c8ba, consumable).
item_value(_69c0f047d5077fafd836c8ba, 3).
item_weight(_69c0f047d5077fafd836c8ba, 0.5).
item_tradeable(_69c0f047d5077fafd836c8ba, true).
item(_69c0f047d5077fafd836c8bc).
item_name(_69c0f047d5077fafd836c8bc, 'Pizza Slice').
item_type(_69c0f047d5077fafd836c8bc, consumable).
item_value(_69c0f047d5077fafd836c8bc, 3).
item_weight(_69c0f047d5077fafd836c8bc, 0.5).
item_tradeable(_69c0f047d5077fafd836c8bc, true).
item(_69c0f047d5077fafd836c8bd).
item_name(_69c0f047d5077fafd836c8bd, 'Plate').
item_type(_69c0f047d5077fafd836c8bd, consumable).
item_value(_69c0f047d5077fafd836c8bd, 3).
item_weight(_69c0f047d5077fafd836c8bd, 0.5).
item_tradeable(_69c0f047d5077fafd836c8bd, true).
item(_69c0f047d5077fafd836c8be).
item_name(_69c0f047d5077fafd836c8be, 'Plate2').
item_type(_69c0f047d5077fafd836c8be, consumable).
item_value(_69c0f047d5077fafd836c8be, 3).
item_weight(_69c0f047d5077fafd836c8be, 0.5).
item_tradeable(_69c0f047d5077fafd836c8be, true).
item(_69c0f047d5077fafd836c8bf).
item_name(_69c0f047d5077fafd836c8bf, 'Plate Square').
item_type(_69c0f047d5077fafd836c8bf, consumable).
item_value(_69c0f047d5077fafd836c8bf, 3).
item_weight(_69c0f047d5077fafd836c8bf, 0.5).
item_tradeable(_69c0f047d5077fafd836c8bf, true).
item(_69c0f047d5077fafd836c8c0).
item_name(_69c0f047d5077fafd836c8c0, 'Popsicle Chocolate').
item_type(_69c0f047d5077fafd836c8c0, consumable).
item_value(_69c0f047d5077fafd836c8c0, 3).
item_weight(_69c0f047d5077fafd836c8c0, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c0, true).
item(_69c0f047d5077fafd836c8c2).
item_name(_69c0f047d5077fafd836c8c2, 'Popsicle Strawberry').
item_type(_69c0f047d5077fafd836c8c2, consumable).
item_value(_69c0f047d5077fafd836c8c2, 3).
item_weight(_69c0f047d5077fafd836c8c2, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c2, true).
item(_69c0f047d5077fafd836c8c3).
item_name(_69c0f047d5077fafd836c8c3, 'Pumpkin').
item_type(_69c0f047d5077fafd836c8c3, consumable).
item_value(_69c0f047d5077fafd836c8c3, 3).
item_weight(_69c0f047d5077fafd836c8c3, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c3, true).
item(_69c0f047d5077fafd836c8c4).
item_name(_69c0f047d5077fafd836c8c4, 'Sashimi Salmon').
item_type(_69c0f047d5077fafd836c8c4, consumable).
item_value(_69c0f047d5077fafd836c8c4, 3).
item_weight(_69c0f047d5077fafd836c8c4, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c4, true).
item(_69c0f047d5077fafd836c8c5).
item_name(_69c0f047d5077fafd836c8c5, 'Sashimi Salmon2').
item_type(_69c0f047d5077fafd836c8c5, consumable).
item_value(_69c0f047d5077fafd836c8c5, 3).
item_weight(_69c0f047d5077fafd836c8c5, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c5, true).
item(_69c0f047d5077fafd836c8c6).
item_name(_69c0f047d5077fafd836c8c6, 'Sausage Cooked').
item_type(_69c0f047d5077fafd836c8c6, consumable).
item_value(_69c0f047d5077fafd836c8c6, 3).
item_weight(_69c0f047d5077fafd836c8c6, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c6, true).
item(_69c0f047d5077fafd836c8c7).
item_name(_69c0f047d5077fafd836c8c7, 'Sausage Raw').
item_type(_69c0f047d5077fafd836c8c7, consumable).
item_value(_69c0f047d5077fafd836c8c7, 3).
item_weight(_69c0f047d5077fafd836c8c7, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c7, true).
item(_69c0f047d5077fafd836c8c8).
item_name(_69c0f047d5077fafd836c8c8, 'Soda').
item_type(_69c0f047d5077fafd836c8c8, consumable).
item_value(_69c0f047d5077fafd836c8c8, 3).
item_weight(_69c0f047d5077fafd836c8c8, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c8, true).
item(_69c0f047d5077fafd836c8c9).
item_name(_69c0f047d5077fafd836c8c9, 'Soy Sauce').
item_type(_69c0f047d5077fafd836c8c9, consumable).
item_value(_69c0f047d5077fafd836c8c9, 3).
item_weight(_69c0f047d5077fafd836c8c9, 0.5).
item_tradeable(_69c0f047d5077fafd836c8c9, true).
item(_69c0f047d5077fafd836c8ca).
item_name(_69c0f047d5077fafd836c8ca, 'Spoon').
item_type(_69c0f047d5077fafd836c8ca, consumable).
item_value(_69c0f047d5077fafd836c8ca, 3).
item_weight(_69c0f047d5077fafd836c8ca, 0.5).
item_tradeable(_69c0f047d5077fafd836c8ca, true).
item(_69c0f047d5077fafd836c8cb).
item_name(_69c0f047d5077fafd836c8cb, 'Steak').
item_type(_69c0f047d5077fafd836c8cb, consumable).
item_value(_69c0f047d5077fafd836c8cb, 3).
item_weight(_69c0f047d5077fafd836c8cb, 0.5).
item_tradeable(_69c0f047d5077fafd836c8cb, true).
item(_69c0f047d5077fafd836c8cc).
item_name(_69c0f047d5077fafd836c8cc, 'Steak Burned').
item_type(_69c0f047d5077fafd836c8cc, consumable).
item_value(_69c0f047d5077fafd836c8cc, 3).
item_weight(_69c0f047d5077fafd836c8cc, 0.5).
item_tradeable(_69c0f047d5077fafd836c8cc, true).
item(_69c0f047d5077fafd836c8ce).
item_name(_69c0f047d5077fafd836c8ce, 'Sushi Nigiri2').
item_type(_69c0f047d5077fafd836c8ce, consumable).
item_value(_69c0f047d5077fafd836c8ce, 3).
item_weight(_69c0f047d5077fafd836c8ce, 0.5).
item_tradeable(_69c0f047d5077fafd836c8ce, true).
item(_69c0f047d5077fafd836c8cf).
item_name(_69c0f047d5077fafd836c8cf, 'Sushi Nigiri Octopus').
item_type(_69c0f047d5077fafd836c8cf, consumable).
item_value(_69c0f047d5077fafd836c8cf, 3).
item_weight(_69c0f047d5077fafd836c8cf, 0.5).
item_tradeable(_69c0f047d5077fafd836c8cf, true).
item(_69c0f047d5077fafd836c8d0).
item_name(_69c0f047d5077fafd836c8d0, 'Sushi Roll1').
item_type(_69c0f047d5077fafd836c8d0, consumable).
item_value(_69c0f047d5077fafd836c8d0, 3).
item_weight(_69c0f047d5077fafd836c8d0, 0.5).
item_tradeable(_69c0f047d5077fafd836c8d0, true).
item(_69c0f047d5077fafd836c8d1).
item_name(_69c0f047d5077fafd836c8d1, 'Sushi Roll2').
item_type(_69c0f047d5077fafd836c8d1, consumable).
item_value(_69c0f047d5077fafd836c8d1, 3).
item_weight(_69c0f047d5077fafd836c8d1, 0.5).
item_tradeable(_69c0f047d5077fafd836c8d1, true).
item(_69c0f047d5077fafd836c8d2).
item_name(_69c0f047d5077fafd836c8d2, 'Tentacle').
item_type(_69c0f047d5077fafd836c8d2, consumable).
item_value(_69c0f047d5077fafd836c8d2, 3).
item_weight(_69c0f047d5077fafd836c8d2, 0.5).
item_tradeable(_69c0f047d5077fafd836c8d2, true).
item(_69c0f047d5077fafd836c8d3).
item_name(_69c0f047d5077fafd836c8d3, 'Tomato').
item_type(_69c0f047d5077fafd836c8d3, consumable).
item_value(_69c0f047d5077fafd836c8d3, 3).
item_weight(_69c0f047d5077fafd836c8d3, 0.5).
item_tradeable(_69c0f047d5077fafd836c8d3, true).
item(_69c0f047d5077fafd836c8d5).
item_name(_69c0f047d5077fafd836c8d5, 'Turnip').
item_type(_69c0f047d5077fafd836c8d5, consumable).
item_value(_69c0f047d5077fafd836c8d5, 3).
item_weight(_69c0f047d5077fafd836c8d5, 0.5).
item_tradeable(_69c0f047d5077fafd836c8d5, true).
item(_69c0f047d5077fafd836c8da).
item_name(_69c0f047d5077fafd836c8da, 'Bandages').
item_type(_69c0f047d5077fafd836c8da, consumable).
item_value(_69c0f047d5077fafd836c8da, 15).
item_weight(_69c0f047d5077fafd836c8da, 0.5).
item_tradeable(_69c0f047d5077fafd836c8da, true).
item(_69c0f047d5077fafd836c8db).
item_name(_69c0f047d5077fafd836c8db, 'Battery Small').
item_type(_69c0f047d5077fafd836c8db, equipment).
item_value(_69c0f047d5077fafd836c8db, 15).
item_weight(_69c0f047d5077fafd836c8db, 1).
item_tradeable(_69c0f047d5077fafd836c8db, true).
item(_69c0f047d5077fafd836c8df).
item_name(_69c0f047d5077fafd836c8df, 'Bonfire Fire').
item_type(_69c0f047d5077fafd836c8df, tool).
item_value(_69c0f047d5077fafd836c8df, 8).
item_weight(_69c0f047d5077fafd836c8df, 1).
item_tradeable(_69c0f047d5077fafd836c8df, true).
item(_69c0f047d5077fafd836c8e0).
item_name(_69c0f047d5077fafd836c8e0, 'Can Broken').
item_type(_69c0f047d5077fafd836c8e0, container).
item_value(_69c0f047d5077fafd836c8e0, 10).
item_weight(_69c0f047d5077fafd836c8e0, 5).
item_tradeable(_69c0f047d5077fafd836c8e0, true).
item(_69c0f047d5077fafd836c8e1).
item_name(_69c0f047d5077fafd836c8e1, 'Can Closed').
item_type(_69c0f047d5077fafd836c8e1, container).
item_value(_69c0f047d5077fafd836c8e1, 10).
item_weight(_69c0f047d5077fafd836c8e1, 5).
item_tradeable(_69c0f047d5077fafd836c8e1, true).
item(_69c0f047d5077fafd836c8e2).
item_name(_69c0f047d5077fafd836c8e2, 'Can Open').
item_type(_69c0f047d5077fafd836c8e2, container).
item_value(_69c0f047d5077fafd836c8e2, 10).
item_weight(_69c0f047d5077fafd836c8e2, 5).
item_tradeable(_69c0f047d5077fafd836c8e2, true).
item(_69c0f047d5077fafd836c8e3).
item_name(_69c0f047d5077fafd836c8e3, 'Can Red').
item_type(_69c0f047d5077fafd836c8e3, container).
item_value(_69c0f047d5077fafd836c8e3, 10).
item_weight(_69c0f047d5077fafd836c8e3, 5).
item_tradeable(_69c0f047d5077fafd836c8e3, true).
item(_69c0f047d5077fafd836c8e4).
item_name(_69c0f047d5077fafd836c8e4, 'Compass Closed').
item_type(_69c0f047d5077fafd836c8e4, equipment).
item_value(_69c0f047d5077fafd836c8e4, 15).
item_weight(_69c0f047d5077fafd836c8e4, 1).
item_tradeable(_69c0f047d5077fafd836c8e4, true).
item(_69c0f047d5077fafd836c8e5).
item_name(_69c0f047d5077fafd836c8e5, 'Compass Open').
item_type(_69c0f047d5077fafd836c8e5, equipment).
item_value(_69c0f047d5077fafd836c8e5, 15).
item_weight(_69c0f047d5077fafd836c8e5, 1).
item_tradeable(_69c0f047d5077fafd836c8e5, true).
item(_69c0f047d5077fafd836c8e6).
item_name(_69c0f047d5077fafd836c8e6, 'First Aid Kit').
item_type(_69c0f047d5077fafd836c8e6, consumable).
item_value(_69c0f047d5077fafd836c8e6, 15).
item_weight(_69c0f047d5077fafd836c8e6, 0.5).
item_tradeable(_69c0f047d5077fafd836c8e6, true).
item(_69c0f047d5077fafd836c8e7).
item_name(_69c0f047d5077fafd836c8e7, 'First Aid Kit Hard').
item_type(_69c0f047d5077fafd836c8e7, consumable).
item_value(_69c0f047d5077fafd836c8e7, 15).
item_weight(_69c0f047d5077fafd836c8e7, 0.5).
item_tradeable(_69c0f047d5077fafd836c8e7, true).
item(_69c0f047d5077fafd836c8e8).
item_name(_69c0f047d5077fafd836c8e8, 'Flare Gun').
item_type(_69c0f047d5077fafd836c8e8, weapon).
item_value(_69c0f047d5077fafd836c8e8, 30).
item_weight(_69c0f047d5077fafd836c8e8, 2).
item_tradeable(_69c0f047d5077fafd836c8e8, true).
item(_69c0f047d5077fafd836c8e9).
item_name(_69c0f047d5077fafd836c8e9, 'Gas Can').
item_type(_69c0f047d5077fafd836c8e9, container).
item_value(_69c0f047d5077fafd836c8e9, 10).
item_weight(_69c0f047d5077fafd836c8e9, 5).
item_tradeable(_69c0f047d5077fafd836c8e9, true).
item(_69c0f047d5077fafd836c8ec).
item_name(_69c0f047d5077fafd836c8ec, 'Match Burnt').
item_type(_69c0f047d5077fafd836c8ec, tool).
item_value(_69c0f047d5077fafd836c8ec, 12).
item_weight(_69c0f047d5077fafd836c8ec, 2).
item_tradeable(_69c0f047d5077fafd836c8ec, true).
item(_69c0f047d5077fafd836c8ed).
item_name(_69c0f047d5077fafd836c8ed, 'Match Fire').
item_type(_69c0f047d5077fafd836c8ed, tool).
item_value(_69c0f047d5077fafd836c8ed, 12).
item_weight(_69c0f047d5077fafd836c8ed, 2).
item_tradeable(_69c0f047d5077fafd836c8ed, true).
item(_69c0f047d5077fafd836c8ef).
item_name(_69c0f047d5077fafd836c8ef, 'Pan Small').
item_type(_69c0f047d5077fafd836c8ef, tool).
item_value(_69c0f047d5077fafd836c8ef, 12).
item_weight(_69c0f047d5077fafd836c8ef, 2).
item_tradeable(_69c0f047d5077fafd836c8ef, true).
item(_69c0f047d5077fafd836c8f0).
item_name(_69c0f047d5077fafd836c8f0, 'Phone').
item_type(_69c0f047d5077fafd836c8f0, equipment).
item_value(_69c0f047d5077fafd836c8f0, 15).
item_weight(_69c0f047d5077fafd836c8f0, 1).
item_tradeable(_69c0f047d5077fafd836c8f0, true).
item(_69c0f047d5077fafd836c8f1).
item_name(_69c0f047d5077fafd836c8f1, 'Pistol').
item_type(_69c0f047d5077fafd836c8f1, weapon).
item_value(_69c0f047d5077fafd836c8f1, 30).
item_weight(_69c0f047d5077fafd836c8f1, 2).
item_tradeable(_69c0f047d5077fafd836c8f1, true).
item(_69c0f047d5077fafd836c8f2).
item_name(_69c0f047d5077fafd836c8f2, 'Pistol').
item_type(_69c0f047d5077fafd836c8f2, weapon).
item_value(_69c0f047d5077fafd836c8f2, 30).
item_weight(_69c0f047d5077fafd836c8f2, 2).
item_tradeable(_69c0f047d5077fafd836c8f2, true).
item(_69c0f047d5077fafd836c8f3).
item_name(_69c0f047d5077fafd836c8f3, 'Pot').
item_type(_69c0f047d5077fafd836c8f3, tool).
item_value(_69c0f047d5077fafd836c8f3, 12).
item_weight(_69c0f047d5077fafd836c8f3, 2).
item_tradeable(_69c0f047d5077fafd836c8f3, true).
item(_69c0f047d5077fafd836c8f4).
item_name(_69c0f047d5077fafd836c8f4, 'Pot Small').
item_type(_69c0f047d5077fafd836c8f4, tool).
item_value(_69c0f047d5077fafd836c8f4, 12).
item_weight(_69c0f047d5077fafd836c8f4, 2).
item_tradeable(_69c0f047d5077fafd836c8f4, true).
item(_69c0f047d5077fafd836c8f5).
item_name(_69c0f047d5077fafd836c8f5, 'Propane Tank').
item_type(_69c0f047d5077fafd836c8f5, container).
item_value(_69c0f047d5077fafd836c8f5, 10).
item_weight(_69c0f047d5077fafd836c8f5, 5).
item_tradeable(_69c0f047d5077fafd836c8f5, true).
item(_69c0f047d5077fafd836c8f6).
item_name(_69c0f047d5077fafd836c8f6, 'Radio').
item_type(_69c0f047d5077fafd836c8f6, equipment).
item_value(_69c0f047d5077fafd836c8f6, 15).
item_weight(_69c0f047d5077fafd836c8f6, 1).
item_tradeable(_69c0f047d5077fafd836c8f6, true).
item(_69c0f047d5077fafd836c8f7).
item_name(_69c0f047d5077fafd836c8f7, 'Raft').
item_type(_69c0f047d5077fafd836c8f7, equipment).
item_value(_69c0f047d5077fafd836c8f7, 15).
item_weight(_69c0f047d5077fafd836c8f7, 1).
item_tradeable(_69c0f047d5077fafd836c8f7, true).
item(_69c0f047d5077fafd836c8f8).
item_name(_69c0f047d5077fafd836c8f8, 'Raft Paddle').
item_type(_69c0f047d5077fafd836c8f8, equipment).
item_value(_69c0f047d5077fafd836c8f8, 15).
item_weight(_69c0f047d5077fafd836c8f8, 1).
item_tradeable(_69c0f047d5077fafd836c8f8, true).
item(_69c0f047d5077fafd836c8f9).
item_name(_69c0f047d5077fafd836c8f9, 'Revolver').
item_type(_69c0f047d5077fafd836c8f9, weapon).
item_value(_69c0f047d5077fafd836c8f9, 30).
item_weight(_69c0f047d5077fafd836c8f9, 2).
item_tradeable(_69c0f047d5077fafd836c8f9, true).
item(_69c0f047d5077fafd836c8fa).
item_name(_69c0f047d5077fafd836c8fa, 'Revolver').
item_type(_69c0f047d5077fafd836c8fa, weapon).
item_value(_69c0f047d5077fafd836c8fa, 30).
item_weight(_69c0f047d5077fafd836c8fa, 2).
item_tradeable(_69c0f047d5077fafd836c8fa, true).
item(_69c0f047d5077fafd836c8fb).
item_name(_69c0f047d5077fafd836c8fb, 'Revolver').
item_type(_69c0f047d5077fafd836c8fb, weapon).
item_value(_69c0f047d5077fafd836c8fb, 30).
item_weight(_69c0f047d5077fafd836c8fb, 2).
item_tradeable(_69c0f047d5077fafd836c8fb, true).
item(_69c0f047d5077fafd836c8fc).
item_name(_69c0f047d5077fafd836c8fc, 'Shotgun').
item_type(_69c0f047d5077fafd836c8fc, weapon).
item_value(_69c0f047d5077fafd836c8fc, 30).
item_weight(_69c0f047d5077fafd836c8fc, 2).
item_tradeable(_69c0f047d5077fafd836c8fc, true).
item(_69c0f047d5077fafd836c8fd).
item_name(_69c0f047d5077fafd836c8fd, 'Shotgun').
item_type(_69c0f047d5077fafd836c8fd, weapon).
item_value(_69c0f047d5077fafd836c8fd, 30).
item_weight(_69c0f047d5077fafd836c8fd, 2).
item_tradeable(_69c0f047d5077fafd836c8fd, true).
item(_69c0f047d5077fafd836c8fe).
item_name(_69c0f047d5077fafd836c8fe, 'Shotgun Sawed Off').
item_type(_69c0f047d5077fafd836c8fe, weapon).
item_value(_69c0f047d5077fafd836c8fe, 30).
item_weight(_69c0f047d5077fafd836c8fe, 2).
item_tradeable(_69c0f047d5077fafd836c8fe, true).
item(_69c0f047d5077fafd836c8ff).
item_name(_69c0f047d5077fafd836c8ff, 'Shotgun Short Stock').
item_type(_69c0f047d5077fafd836c8ff, weapon).
item_value(_69c0f047d5077fafd836c8ff, 30).
item_weight(_69c0f047d5077fafd836c8ff, 2).
item_tradeable(_69c0f047d5077fafd836c8ff, true).
item(_69c0f047d5077fafd836c900).
item_name(_69c0f047d5077fafd836c900, 'Shovel').
item_type(_69c0f047d5077fafd836c900, tool).
item_value(_69c0f047d5077fafd836c900, 12).
item_weight(_69c0f047d5077fafd836c900, 2).
item_tradeable(_69c0f047d5077fafd836c900, true).
item(_69c0f047d5077fafd836c901).
item_name(_69c0f047d5077fafd836c901, 'Tent').
item_type(_69c0f047d5077fafd836c901, equipment).
item_value(_69c0f047d5077fafd836c901, 15).
item_weight(_69c0f047d5077fafd836c901, 1).
item_tradeable(_69c0f047d5077fafd836c901, true).
item(_69c0f047d5077fafd836c903).
item_name(_69c0f047d5077fafd836c903, 'Trashcan').
item_type(_69c0f047d5077fafd836c903, container).
item_value(_69c0f047d5077fafd836c903, 10).
item_weight(_69c0f047d5077fafd836c903, 5).
item_tradeable(_69c0f047d5077fafd836c903, true).
item(_69c0f047d5077fafd836c904).
item_name(_69c0f047d5077fafd836c904, 'Water Bottle').
item_type(_69c0f047d5077fafd836c904, consumable).
item_value(_69c0f047d5077fafd836c904, 5).
item_weight(_69c0f047d5077fafd836c904, 1).
item_tradeable(_69c0f047d5077fafd836c904, true).
item(_69c0f047d5077fafd836c905).
item_name(_69c0f047d5077fafd836c905, 'Water Bottle').
item_type(_69c0f047d5077fafd836c905, consumable).
item_value(_69c0f047d5077fafd836c905, 5).
item_weight(_69c0f047d5077fafd836c905, 1).
item_tradeable(_69c0f047d5077fafd836c905, true).
item(_69c0f047d5077fafd836c906).
item_name(_69c0f047d5077fafd836c906, 'Water Bottle').
item_type(_69c0f047d5077fafd836c906, consumable).
item_value(_69c0f047d5077fafd836c906, 5).
item_weight(_69c0f047d5077fafd836c906, 1).
item_tradeable(_69c0f047d5077fafd836c906, true).
item(_69c0f047d5077fafd836c908).
item_name(_69c0f047d5077fafd836c908, 'Bathroom Bathtub').
item_type(_69c0f047d5077fafd836c908, furniture).
item_value(_69c0f047d5077fafd836c908, 15).
item_weight(_69c0f047d5077fafd836c908, 10).
item_tradeable(_69c0f047d5077fafd836c908, true).
item(_69c0f047d5077fafd836c909).
item_name(_69c0f047d5077fafd836c909, 'Bathroom Mirror1').
item_type(_69c0f047d5077fafd836c909, furniture).
item_value(_69c0f047d5077fafd836c909, 15).
item_weight(_69c0f047d5077fafd836c909, 10).
item_tradeable(_69c0f047d5077fafd836c909, true).
item(_69c0f047d5077fafd836c90a).
item_name(_69c0f047d5077fafd836c90a, 'Bathroom Mirror2').
item_type(_69c0f047d5077fafd836c90a, furniture).
item_value(_69c0f047d5077fafd836c90a, 15).
item_weight(_69c0f047d5077fafd836c90a, 10).
item_tradeable(_69c0f047d5077fafd836c90a, true).
item(_69c0f047d5077fafd836c90d).
item_name(_69c0f047d5077fafd836c90d, 'Bathroom Toilet').
item_type(_69c0f047d5077fafd836c90d, furniture).
item_value(_69c0f047d5077fafd836c90d, 15).
item_weight(_69c0f047d5077fafd836c90d, 10).
item_tradeable(_69c0f047d5077fafd836c90d, true).
item(_69c0f047d5077fafd836c90e).
item_name(_69c0f047d5077fafd836c90e, 'Bathroom Toilet2').
item_type(_69c0f047d5077fafd836c90e, furniture).
item_value(_69c0f047d5077fafd836c90e, 15).
item_weight(_69c0f047d5077fafd836c90e, 10).
item_tradeable(_69c0f047d5077fafd836c90e, true).
item(_69c0f047d5077fafd836c90f).
item_name(_69c0f047d5077fafd836c90f, 'Bathroom Toilet Paper').
item_type(_69c0f047d5077fafd836c90f, furniture).
item_value(_69c0f047d5077fafd836c90f, 15).
item_weight(_69c0f047d5077fafd836c90f, 10).
item_tradeable(_69c0f047d5077fafd836c90f, true).
item(_69c0f047d5077fafd836c910).
item_name(_69c0f047d5077fafd836c910, 'Bathroom Toilet Paper Pile').
item_type(_69c0f047d5077fafd836c910, furniture).
item_value(_69c0f047d5077fafd836c910, 15).
item_weight(_69c0f047d5077fafd836c910, 10).
item_tradeable(_69c0f047d5077fafd836c910, true).
item(_69c0f047d5077fafd836c911).
item_name(_69c0f047d5077fafd836c911, 'Bathroom Towel').
item_type(_69c0f047d5077fafd836c911, furniture).
item_value(_69c0f047d5077fafd836c911, 15).
item_weight(_69c0f047d5077fafd836c911, 10).
item_tradeable(_69c0f047d5077fafd836c911, true).
item(_69c0f047d5077fafd836c912).
item_name(_69c0f047d5077fafd836c912, 'Bathroom Washing Machine').
item_type(_69c0f047d5077fafd836c912, furniture).
item_value(_69c0f047d5077fafd836c912, 15).
item_weight(_69c0f047d5077fafd836c912, 10).
item_tradeable(_69c0f047d5077fafd836c912, true).
item(_69c0f047d5077fafd836c917).
item_name(_69c0f047d5077fafd836c917, 'Carpet').
item_type(_69c0f047d5077fafd836c917, furniture).
item_value(_69c0f047d5077fafd836c917, 15).
item_weight(_69c0f047d5077fafd836c917, 10).
item_tradeable(_69c0f047d5077fafd836c917, true).
item(_69c0f047d5077fafd836c918).
item_name(_69c0f047d5077fafd836c918, 'Carpet').
item_type(_69c0f047d5077fafd836c918, furniture).
item_value(_69c0f047d5077fafd836c918, 15).
item_weight(_69c0f047d5077fafd836c918, 10).
item_tradeable(_69c0f047d5077fafd836c918, true).
item(_69c0f047d5077fafd836c919).
item_name(_69c0f047d5077fafd836c919, 'Carpet Round').
item_type(_69c0f047d5077fafd836c919, furniture).
item_value(_69c0f047d5077fafd836c919, 15).
item_weight(_69c0f047d5077fafd836c919, 10).
item_tradeable(_69c0f047d5077fafd836c919, true).
item(_69c0f047d5077fafd836c91e).
item_name(_69c0f047d5077fafd836c91e, 'Column Round1').
item_type(_69c0f047d5077fafd836c91e, furniture).
item_value(_69c0f047d5077fafd836c91e, 15).
item_weight(_69c0f047d5077fafd836c91e, 10).
item_tradeable(_69c0f047d5077fafd836c91e, true).
item(_69c0f047d5077fafd836c920).
item_name(_69c0f047d5077fafd836c920, 'Column Round3').
item_type(_69c0f047d5077fafd836c920, furniture).
item_value(_69c0f047d5077fafd836c920, 15).
item_weight(_69c0f047d5077fafd836c920, 10).
item_tradeable(_69c0f047d5077fafd836c920, true).
item(_69c0f047d5077fafd836c921).
item_name(_69c0f047d5077fafd836c921, 'Column Square Big').
item_type(_69c0f047d5077fafd836c921, furniture).
item_value(_69c0f047d5077fafd836c921, 15).
item_weight(_69c0f047d5077fafd836c921, 10).
item_tradeable(_69c0f047d5077fafd836c921, true).
item(_69c0f047d5077fafd836c922).
item_name(_69c0f047d5077fafd836c922, 'Column Square Small').
item_type(_69c0f047d5077fafd836c922, furniture).
item_value(_69c0f047d5077fafd836c922, 15).
item_weight(_69c0f047d5077fafd836c922, 10).
item_tradeable(_69c0f047d5077fafd836c922, true).
item(_69c0f047d5077fafd836c923).
item_name(_69c0f047d5077fafd836c923, 'Couch L').
item_type(_69c0f047d5077fafd836c923, furniture).
item_value(_69c0f047d5077fafd836c923, 15).
item_weight(_69c0f047d5077fafd836c923, 10).
item_tradeable(_69c0f047d5077fafd836c923, true).
item(_69c0f047d5077fafd836c924).
item_name(_69c0f047d5077fafd836c924, 'Couch Large1').
item_type(_69c0f047d5077fafd836c924, furniture).
item_value(_69c0f047d5077fafd836c924, 15).
item_weight(_69c0f047d5077fafd836c924, 10).
item_tradeable(_69c0f047d5077fafd836c924, true).
item(_69c0f047d5077fafd836c926).
item_name(_69c0f047d5077fafd836c926, 'Couch Large3').
item_type(_69c0f047d5077fafd836c926, furniture).
item_value(_69c0f047d5077fafd836c926, 15).
item_weight(_69c0f047d5077fafd836c926, 10).
item_tradeable(_69c0f047d5077fafd836c926, true).
item(_69c0f047d5077fafd836c927).
item_name(_69c0f047d5077fafd836c927, 'Couch Medium1').
item_type(_69c0f047d5077fafd836c927, furniture).
item_value(_69c0f047d5077fafd836c927, 15).
item_weight(_69c0f047d5077fafd836c927, 10).
item_tradeable(_69c0f047d5077fafd836c927, true).
item(_69c0f047d5077fafd836c928).
item_name(_69c0f047d5077fafd836c928, 'Couch Medium2').
item_type(_69c0f047d5077fafd836c928, furniture).
item_value(_69c0f047d5077fafd836c928, 15).
item_weight(_69c0f047d5077fafd836c928, 10).
item_tradeable(_69c0f047d5077fafd836c928, true).
item(_69c0f047d5077fafd836c929).
item_name(_69c0f047d5077fafd836c929, 'Couch Small1').
item_type(_69c0f047d5077fafd836c929, furniture).
item_value(_69c0f047d5077fafd836c929, 15).
item_weight(_69c0f047d5077fafd836c929, 10).
item_tradeable(_69c0f047d5077fafd836c929, true).
item(_69c0f047d5077fafd836c92b).
item_name(_69c0f047d5077fafd836c92b, 'Curtains Double').
item_type(_69c0f047d5077fafd836c92b, furniture).
item_value(_69c0f047d5077fafd836c92b, 15).
item_weight(_69c0f047d5077fafd836c92b, 10).
item_tradeable(_69c0f047d5077fafd836c92b, true).
item(_69c0f047d5077fafd836c92c).
item_name(_69c0f047d5077fafd836c92c, 'Curtains Single').
item_type(_69c0f047d5077fafd836c92c, furniture).
item_value(_69c0f047d5077fafd836c92c, 15).
item_weight(_69c0f047d5077fafd836c92c, 10).
item_tradeable(_69c0f047d5077fafd836c92c, true).
item(_69c0f047d5077fafd836c92d).
item_name(_69c0f047d5077fafd836c92d, 'Door').
item_type(_69c0f047d5077fafd836c92d, furniture).
item_value(_69c0f047d5077fafd836c92d, 15).
item_weight(_69c0f047d5077fafd836c92d, 10).
item_tradeable(_69c0f047d5077fafd836c92d, true).
item(_69c0f047d5077fafd836c92e).
item_name(_69c0f047d5077fafd836c92e, 'Door').
item_type(_69c0f047d5077fafd836c92e, furniture).
item_value(_69c0f047d5077fafd836c92e, 15).
item_weight(_69c0f047d5077fafd836c92e, 10).
item_tradeable(_69c0f047d5077fafd836c92e, true).
item(_69c0f047d5077fafd836c92f).
item_name(_69c0f047d5077fafd836c92f, 'Door').
item_type(_69c0f047d5077fafd836c92f, furniture).
item_value(_69c0f047d5077fafd836c92f, 15).
item_weight(_69c0f047d5077fafd836c92f, 10).
item_tradeable(_69c0f047d5077fafd836c92f, true).
item(_69c0f047d5077fafd836c930).
item_name(_69c0f047d5077fafd836c930, 'Door').
item_type(_69c0f047d5077fafd836c930, furniture).
item_value(_69c0f047d5077fafd836c930, 15).
item_weight(_69c0f047d5077fafd836c930, 10).
item_tradeable(_69c0f047d5077fafd836c930, true).
item(_69c0f047d5077fafd836c931).
item_name(_69c0f047d5077fafd836c931, 'Door').
item_type(_69c0f047d5077fafd836c931, furniture).
item_value(_69c0f047d5077fafd836c931, 15).
item_weight(_69c0f047d5077fafd836c931, 10).
item_tradeable(_69c0f047d5077fafd836c931, true).
item(_69c0f047d5077fafd836c932).
item_name(_69c0f047d5077fafd836c932, 'Door').
item_type(_69c0f047d5077fafd836c932, furniture).
item_value(_69c0f047d5077fafd836c932, 15).
item_weight(_69c0f047d5077fafd836c932, 10).
item_tradeable(_69c0f047d5077fafd836c932, true).
item(_69c0f047d5077fafd836c934).
item_name(_69c0f047d5077fafd836c934, 'Door').
item_type(_69c0f047d5077fafd836c934, furniture).
item_value(_69c0f047d5077fafd836c934, 15).
item_weight(_69c0f047d5077fafd836c934, 10).
item_tradeable(_69c0f047d5077fafd836c934, true).
item(_69c0f047d5077fafd836c935).
item_name(_69c0f047d5077fafd836c935, 'Door').
item_type(_69c0f047d5077fafd836c935, furniture).
item_value(_69c0f047d5077fafd836c935, 15).
item_weight(_69c0f047d5077fafd836c935, 10).
item_tradeable(_69c0f047d5077fafd836c935, true).
item(_69c0f047d5077fafd836c936).
item_name(_69c0f047d5077fafd836c936, 'Door Double').
item_type(_69c0f047d5077fafd836c936, furniture).
item_value(_69c0f047d5077fafd836c936, 15).
item_weight(_69c0f047d5077fafd836c936, 10).
item_tradeable(_69c0f047d5077fafd836c936, true).
item(_69c0f047d5077fafd836c93c).
item_name(_69c0f047d5077fafd836c93c, 'Fireplace').
item_type(_69c0f047d5077fafd836c93c, furniture).
item_value(_69c0f047d5077fafd836c93c, 15).
item_weight(_69c0f047d5077fafd836c93c, 10).
item_tradeable(_69c0f047d5077fafd836c93c, true).
item(_69c0f047d5077fafd836c93d).
item_name(_69c0f047d5077fafd836c93d, 'Fork').
item_type(_69c0f047d5077fafd836c93d, furniture).
item_value(_69c0f047d5077fafd836c93d, 15).
item_weight(_69c0f047d5077fafd836c93d, 10).
item_tradeable(_69c0f047d5077fafd836c93d, true).
item(_69c0f047d5077fafd836c93e).
item_name(_69c0f047d5077fafd836c93e, 'Houseplant').
item_type(_69c0f047d5077fafd836c93e, furniture).
item_value(_69c0f047d5077fafd836c93e, 15).
item_weight(_69c0f047d5077fafd836c93e, 10).
item_tradeable(_69c0f047d5077fafd836c93e, true).
item(_69c0f047d5077fafd836c93f).
item_name(_69c0f047d5077fafd836c93f, 'Houseplant').
item_type(_69c0f047d5077fafd836c93f, furniture).
item_value(_69c0f047d5077fafd836c93f, 15).
item_weight(_69c0f047d5077fafd836c93f, 10).
item_tradeable(_69c0f047d5077fafd836c93f, true).
item(_69c0f047d5077fafd836c940).
item_name(_69c0f047d5077fafd836c940, 'Houseplant').
item_type(_69c0f047d5077fafd836c940, furniture).
item_value(_69c0f047d5077fafd836c940, 15).
item_weight(_69c0f047d5077fafd836c940, 10).
item_tradeable(_69c0f047d5077fafd836c940, true).
item(_69c0f047d5077fafd836c941).
item_name(_69c0f047d5077fafd836c941, 'Houseplant').
item_type(_69c0f047d5077fafd836c941, furniture).
item_value(_69c0f047d5077fafd836c941, 15).
item_weight(_69c0f047d5077fafd836c941, 10).
item_tradeable(_69c0f047d5077fafd836c941, true).
item(_69c0f047d5077fafd836c942).
item_name(_69c0f047d5077fafd836c942, 'Houseplant').
item_type(_69c0f047d5077fafd836c942, furniture).
item_value(_69c0f047d5077fafd836c942, 15).
item_weight(_69c0f047d5077fafd836c942, 10).
item_tradeable(_69c0f047d5077fafd836c942, true).
item(_69c0f047d5077fafd836c944).
item_name(_69c0f047d5077fafd836c944, 'Houseplant').
item_type(_69c0f047d5077fafd836c944, furniture).
item_value(_69c0f047d5077fafd836c944, 15).
item_weight(_69c0f047d5077fafd836c944, 10).
item_tradeable(_69c0f047d5077fafd836c944, true).
item(_69c0f047d5077fafd836c945).
item_name(_69c0f047d5077fafd836c945, 'Houseplant').
item_type(_69c0f047d5077fafd836c945, furniture).
item_value(_69c0f047d5077fafd836c945, 15).
item_weight(_69c0f047d5077fafd836c945, 10).
item_tradeable(_69c0f047d5077fafd836c945, true).
item(_69c0f047d5077fafd836c94c).
item_name(_69c0f047d5077fafd836c94c, 'Kitchen Fridge').
item_type(_69c0f047d5077fafd836c94c, furniture).
item_value(_69c0f047d5077fafd836c94c, 15).
item_weight(_69c0f047d5077fafd836c94c, 10).
item_tradeable(_69c0f047d5077fafd836c94c, true).
item(_69c0f047d5077fafd836c94d).
item_name(_69c0f047d5077fafd836c94d, 'Kitchen Oven').
item_type(_69c0f047d5077fafd836c94d, furniture).
item_value(_69c0f047d5077fafd836c94d, 15).
item_weight(_69c0f047d5077fafd836c94d, 10).
item_tradeable(_69c0f047d5077fafd836c94d, true).
item(_69c0f047d5077fafd836c94e).
item_name(_69c0f047d5077fafd836c94e, 'Kitchen Oven Large').
item_type(_69c0f047d5077fafd836c94e, furniture).
item_value(_69c0f047d5077fafd836c94e, 15).
item_weight(_69c0f047d5077fafd836c94e, 10).
item_tradeable(_69c0f047d5077fafd836c94e, true).
item(_69c0f047d5077fafd836c94f).
item_name(_69c0f047d5077fafd836c94f, 'Kitchen Sink').
item_type(_69c0f047d5077fafd836c94f, furniture).
item_value(_69c0f047d5077fafd836c94f, 15).
item_weight(_69c0f047d5077fafd836c94f, 10).
item_tradeable(_69c0f047d5077fafd836c94f, true).
item(_69c0f047d5077fafd836c951).
item_name(_69c0f047d5077fafd836c951, 'Light Ceiling1').
item_type(_69c0f047d5077fafd836c951, furniture).
item_value(_69c0f047d5077fafd836c951, 15).
item_weight(_69c0f047d5077fafd836c951, 10).
item_tradeable(_69c0f047d5077fafd836c951, true).
item(_69c0f047d5077fafd836c953).
item_name(_69c0f047d5077fafd836c953, 'Light Ceiling3').
item_type(_69c0f047d5077fafd836c953, furniture).
item_value(_69c0f047d5077fafd836c953, 15).
item_weight(_69c0f047d5077fafd836c953, 10).
item_tradeable(_69c0f047d5077fafd836c953, true).
item(_69c0f047d5077fafd836c954).
item_name(_69c0f047d5077fafd836c954, 'Light Ceiling4').
item_type(_69c0f047d5077fafd836c954, furniture).
item_value(_69c0f047d5077fafd836c954, 15).
item_weight(_69c0f047d5077fafd836c954, 10).
item_tradeable(_69c0f047d5077fafd836c954, true).
item(_69c0f047d5077fafd836c955).
item_name(_69c0f047d5077fafd836c955, 'Light Ceiling5').
item_type(_69c0f047d5077fafd836c955, furniture).
item_value(_69c0f047d5077fafd836c955, 15).
item_weight(_69c0f047d5077fafd836c955, 10).
item_tradeable(_69c0f047d5077fafd836c955, true).
item(_69c0f047d5077fafd836c956).
item_name(_69c0f047d5077fafd836c956, 'Light Ceiling6').
item_type(_69c0f047d5077fafd836c956, furniture).
item_value(_69c0f047d5077fafd836c956, 15).
item_weight(_69c0f047d5077fafd836c956, 10).
item_tradeable(_69c0f047d5077fafd836c956, true).
item(_69c0f047d5077fafd836c957).
item_name(_69c0f047d5077fafd836c957, 'Light Ceiling Single').
item_type(_69c0f047d5077fafd836c957, furniture).
item_value(_69c0f047d5077fafd836c957, 15).
item_weight(_69c0f047d5077fafd836c957, 10).
item_tradeable(_69c0f047d5077fafd836c957, true).
item(_69c0f047d5077fafd836c958).
item_name(_69c0f047d5077fafd836c958, 'Light Chandelier').
item_type(_69c0f047d5077fafd836c958, furniture).
item_value(_69c0f047d5077fafd836c958, 15).
item_weight(_69c0f047d5077fafd836c958, 10).
item_tradeable(_69c0f047d5077fafd836c958, true).
item(_69c0f047d5077fafd836c959).
item_name(_69c0f047d5077fafd836c959, 'Light Cube').
item_type(_69c0f047d5077fafd836c959, furniture).
item_value(_69c0f047d5077fafd836c959, 15).
item_weight(_69c0f047d5077fafd836c959, 10).
item_tradeable(_69c0f047d5077fafd836c959, true).
item(_69c0f047d5077fafd836c95b).
item_name(_69c0f047d5077fafd836c95b, 'Light Desk').
item_type(_69c0f047d5077fafd836c95b, furniture).
item_value(_69c0f047d5077fafd836c95b, 15).
item_weight(_69c0f047d5077fafd836c95b, 10).
item_tradeable(_69c0f047d5077fafd836c95b, true).
item(_69c0f047d5077fafd836c95c).
item_name(_69c0f047d5077fafd836c95c, 'Light Floor1').
item_type(_69c0f047d5077fafd836c95c, furniture).
item_value(_69c0f047d5077fafd836c95c, 15).
item_weight(_69c0f047d5077fafd836c95c, 10).
item_tradeable(_69c0f047d5077fafd836c95c, true).
item(_69c0f047d5077fafd836c95d).
item_name(_69c0f047d5077fafd836c95d, 'Light Floor2').
item_type(_69c0f047d5077fafd836c95d, furniture).
item_value(_69c0f047d5077fafd836c95d, 15).
item_weight(_69c0f047d5077fafd836c95d, 10).
item_tradeable(_69c0f047d5077fafd836c95d, true).
item(_69c0f047d5077fafd836c95f).
item_name(_69c0f047d5077fafd836c95f, 'Light Floor4').
item_type(_69c0f047d5077fafd836c95f, furniture).
item_value(_69c0f047d5077fafd836c95f, 15).
item_weight(_69c0f047d5077fafd836c95f, 10).
item_tradeable(_69c0f047d5077fafd836c95f, true).
item(_69c0f047d5077fafd836c960).
item_name(_69c0f047d5077fafd836c960, 'Light Icosahedron').
item_type(_69c0f047d5077fafd836c960, furniture).
item_value(_69c0f047d5077fafd836c960, 15).
item_weight(_69c0f047d5077fafd836c960, 10).
item_tradeable(_69c0f047d5077fafd836c960, true).
item(_69c0f047d5077fafd836c961).
item_name(_69c0f047d5077fafd836c961, 'Light Icosahedron2').
item_type(_69c0f047d5077fafd836c961, furniture).
item_value(_69c0f047d5077fafd836c961, 15).
item_weight(_69c0f047d5077fafd836c961, 10).
item_tradeable(_69c0f047d5077fafd836c961, true).
item(_69c0f047d5077fafd836c962).
item_name(_69c0f047d5077fafd836c962, 'Light Small').
item_type(_69c0f047d5077fafd836c962, furniture).
item_value(_69c0f047d5077fafd836c962, 15).
item_weight(_69c0f047d5077fafd836c962, 10).
item_tradeable(_69c0f047d5077fafd836c962, true).
item(_69c0f047d5077fafd836c963).
item_name(_69c0f047d5077fafd836c963, 'Light Stand1').
item_type(_69c0f047d5077fafd836c963, furniture).
item_value(_69c0f047d5077fafd836c963, 15).
item_weight(_69c0f047d5077fafd836c963, 10).
item_tradeable(_69c0f047d5077fafd836c963, true).
item(_69c0f047d5077fafd836c964).
item_name(_69c0f047d5077fafd836c964, 'Light Stand2').
item_type(_69c0f047d5077fafd836c964, furniture).
item_value(_69c0f047d5077fafd836c964, 15).
item_weight(_69c0f047d5077fafd836c964, 10).
item_tradeable(_69c0f047d5077fafd836c964, true).
item(_69c0f047d5077fafd836c965).
item_name(_69c0f047d5077fafd836c965, 'Night Stand').
item_type(_69c0f047d5077fafd836c965, furniture).
item_value(_69c0f047d5077fafd836c965, 15).
item_weight(_69c0f047d5077fafd836c965, 10).
item_tradeable(_69c0f047d5077fafd836c965, true).
item(_69c0f047d5077fafd836c966).
item_name(_69c0f047d5077fafd836c966, 'Night Stand').
item_type(_69c0f047d5077fafd836c966, furniture).
item_value(_69c0f047d5077fafd836c966, 15).
item_weight(_69c0f047d5077fafd836c966, 10).
item_tradeable(_69c0f047d5077fafd836c966, true).
item(_69c0f047d5077fafd836c968).
item_name(_69c0f047d5077fafd836c968, 'Plate').
item_type(_69c0f047d5077fafd836c968, furniture).
item_value(_69c0f047d5077fafd836c968, 15).
item_weight(_69c0f047d5077fafd836c968, 10).
item_tradeable(_69c0f047d5077fafd836c968, true).
item(_69c0f047d5077fafd836c969).
item_name(_69c0f047d5077fafd836c969, 'Plate').
item_type(_69c0f047d5077fafd836c969, furniture).
item_value(_69c0f047d5077fafd836c969, 15).
item_weight(_69c0f047d5077fafd836c969, 10).
item_tradeable(_69c0f047d5077fafd836c969, true).
item(_69c0f047d5077fafd836c96a).
item_name(_69c0f047d5077fafd836c96a, 'Plate').
item_type(_69c0f047d5077fafd836c96a, furniture).
item_value(_69c0f047d5077fafd836c96a, 15).
item_weight(_69c0f047d5077fafd836c96a, 10).
item_tradeable(_69c0f047d5077fafd836c96a, true).
item(_69c0f047d5077fafd836c971).
item_name(_69c0f047d5077fafd836c971, 'Spoon').
item_type(_69c0f047d5077fafd836c971, furniture).
item_value(_69c0f047d5077fafd836c971, 15).
item_weight(_69c0f047d5077fafd836c971, 10).
item_tradeable(_69c0f047d5077fafd836c971, true).
item(_69c0f047d5077fafd836c976).
item_name(_69c0f047d5077fafd836c976, 'Trashcan Cylindric').
item_type(_69c0f047d5077fafd836c976, furniture).
item_value(_69c0f047d5077fafd836c976, 15).
item_weight(_69c0f047d5077fafd836c976, 10).
item_tradeable(_69c0f047d5077fafd836c976, true).
item(_69c0f047d5077fafd836c977).
item_name(_69c0f047d5077fafd836c977, 'Trashcan Green').
item_type(_69c0f047d5077fafd836c977, furniture).
item_value(_69c0f047d5077fafd836c977, 15).
item_weight(_69c0f047d5077fafd836c977, 10).
item_tradeable(_69c0f047d5077fafd836c977, true).
item(_69c0f047d5077fafd836c979).
item_name(_69c0f047d5077fafd836c979, 'Trashcan Small1').
item_type(_69c0f047d5077fafd836c979, furniture).
item_value(_69c0f047d5077fafd836c979, 15).
item_weight(_69c0f047d5077fafd836c979, 10).
item_tradeable(_69c0f047d5077fafd836c979, true).
item(_69c0f047d5077fafd836c97a).
item_name(_69c0f047d5077fafd836c97a, 'Trashcan Small2').
item_type(_69c0f047d5077fafd836c97a, furniture).
item_value(_69c0f047d5077fafd836c97a, 15).
item_weight(_69c0f047d5077fafd836c97a, 10).
item_tradeable(_69c0f047d5077fafd836c97a, true).
item(_69c0f047d5077fafd836c97b).
item_name(_69c0f047d5077fafd836c97b, 'Window Large1').
item_type(_69c0f047d5077fafd836c97b, furniture).
item_value(_69c0f047d5077fafd836c97b, 15).
item_weight(_69c0f047d5077fafd836c97b, 10).
item_tradeable(_69c0f047d5077fafd836c97b, true).
item(_69c0f047d5077fafd836c97c).
item_name(_69c0f047d5077fafd836c97c, 'Window Large2').
item_type(_69c0f047d5077fafd836c97c, furniture).
item_value(_69c0f047d5077fafd836c97c, 15).
item_weight(_69c0f047d5077fafd836c97c, 10).
item_tradeable(_69c0f047d5077fafd836c97c, true).
item(_69c0f047d5077fafd836c97d).
item_name(_69c0f047d5077fafd836c97d, 'Window Round1').
item_type(_69c0f047d5077fafd836c97d, furniture).
item_value(_69c0f047d5077fafd836c97d, 15).
item_weight(_69c0f047d5077fafd836c97d, 10).
item_tradeable(_69c0f047d5077fafd836c97d, true).
item(_69c0f047d5077fafd836c97e).
item_name(_69c0f047d5077fafd836c97e, 'Window Round2').
item_type(_69c0f047d5077fafd836c97e, furniture).
item_value(_69c0f047d5077fafd836c97e, 15).
item_weight(_69c0f047d5077fafd836c97e, 10).
item_tradeable(_69c0f047d5077fafd836c97e, true).
item(_69c0f047d5077fafd836c97f).
item_name(_69c0f047d5077fafd836c97f, 'Window Round3').
item_type(_69c0f047d5077fafd836c97f, furniture).
item_value(_69c0f047d5077fafd836c97f, 15).
item_weight(_69c0f047d5077fafd836c97f, 10).
item_tradeable(_69c0f047d5077fafd836c97f, true).
item(_69c0f047d5077fafd836c980).
item_name(_69c0f047d5077fafd836c980, 'Window Small1').
item_type(_69c0f047d5077fafd836c980, furniture).
item_value(_69c0f047d5077fafd836c980, 15).
item_weight(_69c0f047d5077fafd836c980, 10).
item_tradeable(_69c0f047d5077fafd836c980, true).
item(_69c0f047d5077fafd836c981).
item_name(_69c0f047d5077fafd836c981, 'Window Small2').
item_type(_69c0f047d5077fafd836c981, furniture).
item_value(_69c0f047d5077fafd836c981, 15).
item_weight(_69c0f047d5077fafd836c981, 10).
item_tradeable(_69c0f047d5077fafd836c981, true).
item(_69c0f047d5077fafd836c982).
item_name(_69c0f047d5077fafd836c982, 'Window Small3').
item_type(_69c0f047d5077fafd836c982, furniture).
item_value(_69c0f047d5077fafd836c982, 15).
item_weight(_69c0f047d5077fafd836c982, 10).
item_tradeable(_69c0f047d5077fafd836c982, true).
item(_69c0f047d5077fafd836c986).
item_name(_69c0f047d5077fafd836c986, 'Bookcase').
item_type(_69c0f047d5077fafd836c986, furniture).
item_value(_69c0f047d5077fafd836c986, 15).
item_weight(_69c0f047d5077fafd836c986, 10).
item_tradeable(_69c0f047d5077fafd836c986, true).
item(_69c0f047d5077fafd836c988).
item_name(_69c0f047d5077fafd836c988, 'Bookcase Books').
item_type(_69c0f047d5077fafd836c988, furniture).
item_value(_69c0f047d5077fafd836c988, 15).
item_weight(_69c0f047d5077fafd836c988, 10).
item_tradeable(_69c0f047d5077fafd836c988, true).
item(_69c0f047d5077fafd836c98a).
item_name(_69c0f047d5077fafd836c98a, 'Closet').
item_type(_69c0f047d5077fafd836c98a, furniture).
item_value(_69c0f047d5077fafd836c98a, 15).
item_weight(_69c0f047d5077fafd836c98a, 10).
item_tradeable(_69c0f047d5077fafd836c98a, true).
item(_69c0f047d5077fafd836c98b).
item_name(_69c0f047d5077fafd836c98b, 'Desk').
item_type(_69c0f047d5077fafd836c98b, furniture).
item_value(_69c0f047d5077fafd836c98b, 15).
item_weight(_69c0f047d5077fafd836c98b, 10).
item_tradeable(_69c0f047d5077fafd836c98b, true).
item(_69c0f047d5077fafd836c98c).
item_name(_69c0f047d5077fafd836c98c, 'Door1').
item_type(_69c0f047d5077fafd836c98c, furniture).
item_value(_69c0f047d5077fafd836c98c, 15).
item_weight(_69c0f047d5077fafd836c98c, 10).
item_tradeable(_69c0f047d5077fafd836c98c, true).
item(_69c0f047d5077fafd836c98d).
item_name(_69c0f047d5077fafd836c98d, 'Door2').
item_type(_69c0f047d5077fafd836c98d, furniture).
item_value(_69c0f047d5077fafd836c98d, 15).
item_weight(_69c0f047d5077fafd836c98d, 10).
item_tradeable(_69c0f047d5077fafd836c98d, true).
item(_69c0f047d5077fafd836c98e).
item_name(_69c0f047d5077fafd836c98e, 'Door3').
item_type(_69c0f047d5077fafd836c98e, furniture).
item_value(_69c0f047d5077fafd836c98e, 15).
item_weight(_69c0f047d5077fafd836c98e, 10).
item_tradeable(_69c0f047d5077fafd836c98e, true).
item(_69c0f047d5077fafd836c991).
item_name(_69c0f047d5077fafd836c991, 'Short Closet').
item_type(_69c0f047d5077fafd836c991, furniture).
item_value(_69c0f047d5077fafd836c991, 15).
item_weight(_69c0f047d5077fafd836c991, 10).
item_tradeable(_69c0f047d5077fafd836c991, true).
item(_69c0f047d5077fafd836c992).
item_name(_69c0f047d5077fafd836c992, 'Sofa').
item_type(_69c0f047d5077fafd836c992, furniture).
item_value(_69c0f047d5077fafd836c992, 15).
item_weight(_69c0f047d5077fafd836c992, 10).
item_tradeable(_69c0f047d5077fafd836c992, true).
item(_69c0f047d5077fafd836c993).
item_name(_69c0f047d5077fafd836c993, 'Sofa2').
item_type(_69c0f047d5077fafd836c993, furniture).
item_value(_69c0f047d5077fafd836c993, 15).
item_weight(_69c0f047d5077fafd836c993, 10).
item_tradeable(_69c0f047d5077fafd836c993, true).
item(_69c0f047d5077fafd836c994).
item_name(_69c0f047d5077fafd836c994, 'Sofa3').
item_type(_69c0f047d5077fafd836c994, furniture).
item_value(_69c0f047d5077fafd836c994, 15).
item_weight(_69c0f047d5077fafd836c994, 10).
item_tradeable(_69c0f047d5077fafd836c994, true).
item(_69c0f047d5077fafd836c999).
item_name(_69c0f047d5077fafd836c999, 'Animated Chest').
item_type(_69c0f047d5077fafd836c999, container).
item_value(_69c0f047d5077fafd836c999, 10).
item_weight(_69c0f047d5077fafd836c999, 5).
item_tradeable(_69c0f047d5077fafd836c999, true).
item(_69c0f047d5077fafd836c99b).
item_name(_69c0f047d5077fafd836c99b, 'Book').
item_type(_69c0f047d5077fafd836c99b, document).
item_value(_69c0f047d5077fafd836c99b, 2).
item_weight(_69c0f047d5077fafd836c99b, 0.1).
item_tradeable(_69c0f047d5077fafd836c99b, true).
item(_69c0f047d5077fafd836c99c).
item_name(_69c0f047d5077fafd836c99c, 'Dagger').
item_type(_69c0f047d5077fafd836c99c, weapon).
item_value(_69c0f047d5077fafd836c99c, 20).
item_weight(_69c0f047d5077fafd836c99c, 3).
item_tradeable(_69c0f047d5077fafd836c99c, true).
item(_69c0f047d5077fafd836c99d).
item_name(_69c0f047d5077fafd836c99d, 'Gems').
item_type(_69c0f047d5077fafd836c99d, collectible).
item_value(_69c0f047d5077fafd836c99d, 8).
item_weight(_69c0f047d5077fafd836c99d, 0.5).
item_tradeable(_69c0f047d5077fafd836c99d, true).
item(_69c0f047d5077fafd836c99e).
item_name(_69c0f047d5077fafd836c99e, 'Ice Staff').
item_type(_69c0f047d5077fafd836c99e, weapon).
item_value(_69c0f047d5077fafd836c99e, 20).
item_weight(_69c0f047d5077fafd836c99e, 3).
item_tradeable(_69c0f047d5077fafd836c99e, true).
item(_69c0f047d5077fafd836c99f).
item_name(_69c0f047d5077fafd836c99f, 'Rollofpaper').
item_type(_69c0f047d5077fafd836c99f, document).
item_value(_69c0f047d5077fafd836c99f, 2).
item_weight(_69c0f047d5077fafd836c99f, 0.1).
item_tradeable(_69c0f047d5077fafd836c99f, true).
item(_69c0f047d5077fafd836c9a0).
item_name(_69c0f047d5077fafd836c9a0, 'Scroll').
item_type(_69c0f047d5077fafd836c9a0, document).
item_value(_69c0f047d5077fafd836c9a0, 2).
item_weight(_69c0f047d5077fafd836c9a0, 0.1).
item_tradeable(_69c0f047d5077fafd836c9a0, true).
item(_69c0f047d5077fafd836c9a1).
item_name(_69c0f047d5077fafd836c9a1, 'Shield').
item_type(_69c0f047d5077fafd836c9a1, armor).
item_value(_69c0f047d5077fafd836c9a1, 18).
item_weight(_69c0f047d5077fafd836c9a1, 4).
item_tradeable(_69c0f047d5077fafd836c9a1, true).
item(_69c0f047d5077fafd836c9a2).
item_name(_69c0f047d5077fafd836c9a2, 'Staff').
item_type(_69c0f047d5077fafd836c9a2, weapon).
item_value(_69c0f047d5077fafd836c9a2, 20).
item_weight(_69c0f047d5077fafd836c9a2, 3).
item_tradeable(_69c0f047d5077fafd836c9a2, true).
item(_69c0f047d5077fafd836c9a3).
item_name(_69c0f047d5077fafd836c9a3, 'Sword').
item_type(_69c0f047d5077fafd836c9a3, weapon).
item_value(_69c0f047d5077fafd836c9a3, 20).
item_weight(_69c0f047d5077fafd836c9a3, 3).
item_tradeable(_69c0f047d5077fafd836c9a3, true).
item(_69c0f047d5077fafd836c9a4).
item_name(_69c0f047d5077fafd836c9a4, 'Wooden Staff').
item_type(_69c0f047d5077fafd836c9a4, weapon).
item_value(_69c0f047d5077fafd836c9a4, 20).
item_weight(_69c0f047d5077fafd836c9a4, 3).
item_tradeable(_69c0f047d5077fafd836c9a4, true).
item(_69c0f047d5077fafd836c9a5).
item_name(_69c0f047d5077fafd836c9a5, 'Burger').
item_type(_69c0f047d5077fafd836c9a5, consumable).
item_value(_69c0f047d5077fafd836c9a5, 3).
item_weight(_69c0f047d5077fafd836c9a5, 0.5).
item_tradeable(_69c0f047d5077fafd836c9a5, true).
item(_69c0f047d5077fafd836c9ab).
item_name(_69c0f047d5077fafd836c9ab, 'Donut').
item_type(_69c0f047d5077fafd836c9ab, consumable).
item_value(_69c0f047d5077fafd836c9ab, 3).
item_weight(_69c0f047d5077fafd836c9ab, 0.5).
item_tradeable(_69c0f047d5077fafd836c9ab, true).
item(_69c0f047d5077fafd836c9ac).
item_name(_69c0f047d5077fafd836c9ac, 'Donut2').
item_type(_69c0f047d5077fafd836c9ac, consumable).
item_value(_69c0f047d5077fafd836c9ac, 3).
item_weight(_69c0f047d5077fafd836c9ac, 0.5).
item_tradeable(_69c0f047d5077fafd836c9ac, true).
item(_69c0f047d5077fafd836c9ae).
item_name(_69c0f047d5077fafd836c9ae, 'Icecream').
item_type(_69c0f047d5077fafd836c9ae, consumable).
item_value(_69c0f047d5077fafd836c9ae, 3).
item_weight(_69c0f047d5077fafd836c9ae, 0.5).
item_tradeable(_69c0f047d5077fafd836c9ae, true).
item(_69c0f047d5077fafd836c9b0).
item_name(_69c0f047d5077fafd836c9b0, 'Icecream3').
item_type(_69c0f047d5077fafd836c9b0, consumable).
item_value(_69c0f047d5077fafd836c9b0, 3).
item_weight(_69c0f047d5077fafd836c9b0, 0.5).
item_tradeable(_69c0f047d5077fafd836c9b0, true).
item(_69c0f047d5077fafd836c9b1).
item_name(_69c0f047d5077fafd836c9b1, 'Milkshake').
item_type(_69c0f047d5077fafd836c9b1, consumable).
item_value(_69c0f047d5077fafd836c9b1, 3).
item_weight(_69c0f047d5077fafd836c9b1, 0.5).
item_tradeable(_69c0f047d5077fafd836c9b1, true).
item(_69c0f047d5077fafd836c9b2).
item_name(_69c0f047d5077fafd836c9b2, 'Pizza').
item_type(_69c0f047d5077fafd836c9b2, consumable).
item_value(_69c0f047d5077fafd836c9b2, 3).
item_weight(_69c0f047d5077fafd836c9b2, 0.5).
item_tradeable(_69c0f047d5077fafd836c9b2, true).
item(_69c0f047d5077fafd836c9b3).
item_name(_69c0f047d5077fafd836c9b3, 'Soda').
item_type(_69c0f047d5077fafd836c9b3, consumable).
item_value(_69c0f047d5077fafd836c9b3, 3).
item_weight(_69c0f047d5077fafd836c9b3, 0.5).
item_tradeable(_69c0f047d5077fafd836c9b3, true).
item(_69c0f047d5077fafd836c9b4).
item_name(_69c0f047d5077fafd836c9b4, 'Soda Can').
item_type(_69c0f047d5077fafd836c9b4, consumable).
item_value(_69c0f047d5077fafd836c9b4, 3).
item_weight(_69c0f047d5077fafd836c9b4, 0.5).
item_tradeable(_69c0f047d5077fafd836c9b4, true).
item(_69c0f047d5077fafd836c9b5).
item_name(_69c0f047d5077fafd836c9b5, 'Plastic Bottle Gallon').
item_type(_69c0f047d5077fafd836c9b5, container).
item_value(_69c0f047d5077fafd836c9b5, 10).
item_weight(_69c0f047d5077fafd836c9b5, 5).
item_tradeable(_69c0f047d5077fafd836c9b5, true).
item(_69c0f047d5077fafd836c9b7).
item_name(_69c0f047d5077fafd836c9b7, 'Planter Pot Clay').
item_type(_69c0f047d5077fafd836c9b7, container).
item_value(_69c0f047d5077fafd836c9b7, 10).
item_weight(_69c0f047d5077fafd836c9b7, 5).
item_tradeable(_69c0f047d5077fafd836c9b7, true).
item(_69c0f047d5077fafd836c9b9).
item_name(_69c0f047d5077fafd836c9b9, 'Plastic Jerrycan').
item_type(_69c0f047d5077fafd836c9b9, container).
item_value(_69c0f047d5077fafd836c9b9, 10).
item_weight(_69c0f047d5077fafd836c9b9, 5).
item_tradeable(_69c0f047d5077fafd836c9b9, true).
item(_69c0f047d5077fafd836c9ba).
item_name(_69c0f047d5077fafd836c9ba, 'Plastic Thermos').
item_type(_69c0f047d5077fafd836c9ba, container).
item_value(_69c0f047d5077fafd836c9ba, 10).
item_weight(_69c0f047d5077fafd836c9ba, 5).
item_tradeable(_69c0f047d5077fafd836c9ba, true).
item(_69c0f047d5077fafd836c9bc).
item_name(_69c0f047d5077fafd836c9bc, 'Plunger').
item_type(_69c0f047d5077fafd836c9bc, tool).
item_value(_69c0f047d5077fafd836c9bc, 12).
item_weight(_69c0f047d5077fafd836c9bc, 2).
item_tradeable(_69c0f047d5077fafd836c9bc, true).
item(_69c0f047d5077fafd836c9bd).
item_name(_69c0f047d5077fafd836c9bd, 'Power Box').
item_type(_69c0f047d5077fafd836c9bd, tool).
item_value(_69c0f047d5077fafd836c9bd, 12).
item_weight(_69c0f047d5077fafd836c9bd, 2).
item_tradeable(_69c0f047d5077fafd836c9bd, true).
item(_69c0f047d5077fafd836c9be).
item_name(_69c0f047d5077fafd836c9be, 'Pull Chain Light Socket').
item_type(_69c0f047d5077fafd836c9be, decoration).
item_value(_69c0f047d5077fafd836c9be, 8).
item_weight(_69c0f047d5077fafd836c9be, 1).
item_tradeable(_69c0f047d5077fafd836c9be, true).
item(_69c0f047d5077fafd836c9c0).
item_name(_69c0f047d5077fafd836c9c0, 'Rubber Duck Toy').
item_type(_69c0f047d5077fafd836c9c0, decoration).
item_value(_69c0f047d5077fafd836c9c0, 8).
item_weight(_69c0f047d5077fafd836c9c0, 1).
item_tradeable(_69c0f047d5077fafd836c9c0, true).
item(_69c0f047d5077fafd836c9c1).
item_name(_69c0f047d5077fafd836c9c1, 'Russian Food Cans').
item_type(_69c0f047d5077fafd836c9c1, consumable).
item_value(_69c0f047d5077fafd836c9c1, 3).
item_weight(_69c0f047d5077fafd836c9c1, 0.5).
item_tradeable(_69c0f047d5077fafd836c9c1, true).
item(_69c0f047d5077fafd836c9c3).
item_name(_69c0f047d5077fafd836c9c3, 'Scandinavian Masonry Heater').
item_type(_69c0f047d5077fafd836c9c3, furniture).
item_value(_69c0f047d5077fafd836c9c3, 15).
item_weight(_69c0f047d5077fafd836c9c3, 10).
item_tradeable(_69c0f047d5077fafd836c9c3, true).
item(_69c0f047d5077fafd836c9ca).
item_name(_69c0f047d5077fafd836c9ca, 'Spinning Wheel').
item_type(_69c0f047d5077fafd836c9ca, tool).
item_value(_69c0f047d5077fafd836c9ca, 12).
item_weight(_69c0f047d5077fafd836c9ca, 2).
item_tradeable(_69c0f047d5077fafd836c9ca, true).
item(_69c0f047d5077fafd836c9cc).
item_name(_69c0f047d5077fafd836c9cc, 'Spray Paint Bottles').
item_type(_69c0f047d5077fafd836c9cc, container).
item_value(_69c0f047d5077fafd836c9cc, 10).
item_weight(_69c0f047d5077fafd836c9cc, 5).
item_tradeable(_69c0f047d5077fafd836c9cc, true).
item(_69c0f047d5077fafd836c9cd).
item_name(_69c0f047d5077fafd836c9cd, 'Spray Paint Bottles').
item_type(_69c0f047d5077fafd836c9cd, tool).
item_value(_69c0f047d5077fafd836c9cd, 12).
item_weight(_69c0f047d5077fafd836c9cd, 2).
item_tradeable(_69c0f047d5077fafd836c9cd, true).
item(_69c0f047d5077fafd836c9ce).
item_name(_69c0f047d5077fafd836c9ce, 'Standing Picture Frame').
item_type(_69c0f047d5077fafd836c9ce, decoration).
item_value(_69c0f047d5077fafd836c9ce, 8).
item_weight(_69c0f047d5077fafd836c9ce, 1).
item_tradeable(_69c0f047d5077fafd836c9ce, true).
item(_69c0f047d5077fafd836c9cf).
item_name(_69c0f047d5077fafd836c9cf, 'Standing Chalkboard').
item_type(_69c0f047d5077fafd836c9cf, decoration).
item_value(_69c0f047d5077fafd836c9cf, 8).
item_weight(_69c0f047d5077fafd836c9cf, 1).
item_tradeable(_69c0f047d5077fafd836c9cf, true).
item(_69c0f047d5077fafd836c9d4).
item_name(_69c0f047d5077fafd836c9d4, 'Steel Frame Shelves').
item_type(_69c0f047d5077fafd836c9d4, furniture).
item_value(_69c0f047d5077fafd836c9d4, 15).
item_weight(_69c0f047d5077fafd836c9d4, 10).
item_tradeable(_69c0f047d5077fafd836c9d4, true).
item(_69c0f047d5077fafd836c9d5).
item_name(_69c0f047d5077fafd836c9d5, 'Sungka Board').
item_type(_69c0f047d5077fafd836c9d5, decoration).
item_value(_69c0f047d5077fafd836c9d5, 8).
item_weight(_69c0f047d5077fafd836c9d5, 1).
item_tradeable(_69c0f047d5077fafd836c9d5, true).
item(_69c0f047d5077fafd836c9d6).
item_name(_69c0f047d5077fafd836c9d6, 'Sungka Board').
item_type(_69c0f047d5077fafd836c9d6, decoration).
item_value(_69c0f047d5077fafd836c9d6, 8).
item_weight(_69c0f047d5077fafd836c9d6, 1).
item_tradeable(_69c0f047d5077fafd836c9d6, true).
item(_69c0f047d5077fafd836c9d7).
item_name(_69c0f047d5077fafd836c9d7, 'Throw Pillows').
item_type(_69c0f047d5077fafd836c9d7, decoration).
item_value(_69c0f047d5077fafd836c9d7, 8).
item_weight(_69c0f047d5077fafd836c9d7, 1).
item_tradeable(_69c0f047d5077fafd836c9d7, true).
item(_69c0f047d5077fafd836c9d9).
item_name(_69c0f047d5077fafd836c9d9, 'Trowel').
item_type(_69c0f047d5077fafd836c9d9, tool).
item_value(_69c0f047d5077fafd836c9d9, 12).
item_weight(_69c0f047d5077fafd836c9d9, 2).
item_tradeable(_69c0f047d5077fafd836c9d9, true).
item(_69c0f047d5077fafd836c9dc).
item_name(_69c0f047d5077fafd836c9dc, 'Vintage Stapler').
item_type(_69c0f047d5077fafd836c9dc, tool).
item_value(_69c0f047d5077fafd836c9dc, 12).
item_weight(_69c0f047d5077fafd836c9dc, 2).
item_tradeable(_69c0f047d5077fafd836c9dc, true).
item(_69c0f047d5077fafd836c9de).
item_name(_69c0f047d5077fafd836c9de, 'Vintage Hand Drill').
item_type(_69c0f047d5077fafd836c9de, tool).
item_value(_69c0f047d5077fafd836c9de, 12).
item_weight(_69c0f047d5077fafd836c9de, 2).
item_tradeable(_69c0f047d5077fafd836c9de, true).
item(_69c0f047d5077fafd836c9df).
item_name(_69c0f047d5077fafd836c9df, 'Vintage Video Camera').
item_type(_69c0f047d5077fafd836c9df, equipment).
item_value(_69c0f047d5077fafd836c9df, 15).
item_weight(_69c0f047d5077fafd836c9df, 1).
item_tradeable(_69c0f047d5077fafd836c9df, true).
item(_69c0f047d5077fafd836c9e0).
item_name(_69c0f047d5077fafd836c9e0, 'Vintage Suitcase').
item_type(_69c0f047d5077fafd836c9e0, decoration).
item_value(_69c0f047d5077fafd836c9e0, 8).
item_weight(_69c0f047d5077fafd836c9e0, 1).
item_tradeable(_69c0f047d5077fafd836c9e0, true).
item(_69c0f047d5077fafd836c9e2).
item_name(_69c0f047d5077fafd836c9e2, 'Watering Can Metal').
item_type(_69c0f047d5077fafd836c9e2, tool).
item_value(_69c0f047d5077fafd836c9e2, 12).
item_weight(_69c0f047d5077fafd836c9e2, 2).
item_tradeable(_69c0f047d5077fafd836c9e2, true).
item(_69c0f047d5077fafd836c9e3).
item_name(_69c0f047d5077fafd836c9e3, 'Wicker Basket').
item_type(_69c0f047d5077fafd836c9e3, container).
item_value(_69c0f047d5077fafd836c9e3, 10).
item_weight(_69c0f047d5077fafd836c9e3, 5).
item_tradeable(_69c0f047d5077fafd836c9e3, true).
item(_69c0f047d5077fafd836c9e5).
item_name(_69c0f047d5077fafd836c9e5, 'Wooden Bowl').
item_type(_69c0f047d5077fafd836c9e5, decoration).
item_value(_69c0f047d5077fafd836c9e5, 8).
item_weight(_69c0f047d5077fafd836c9e5, 1).
item_tradeable(_69c0f047d5077fafd836c9e5, true).
item(_69c0f047d5077fafd836c9ed).
item_name(_69c0f047d5077fafd836c9ed, 'Prop Access Point').
item_type(_69c0f047d5077fafd836c9ed, equipment).
item_value(_69c0f047d5077fafd836c9ed, 15).
item_weight(_69c0f047d5077fafd836c9ed, 1).
item_tradeable(_69c0f047d5077fafd836c9ed, true).
item(_69c0f047d5077fafd836c9ef).
item_name(_69c0f047d5077fafd836c9ef, 'Prop Chest').
item_type(_69c0f047d5077fafd836c9ef, container).
item_value(_69c0f047d5077fafd836c9ef, 10).
item_weight(_69c0f047d5077fafd836c9ef, 5).
item_tradeable(_69c0f047d5077fafd836c9ef, true).
item(_69c0f047d5077fafd836c9f0).
item_name(_69c0f047d5077fafd836c9f0, 'Prop Clamp').
item_type(_69c0f047d5077fafd836c9f0, tool).
item_value(_69c0f047d5077fafd836c9f0, 8).
item_weight(_69c0f047d5077fafd836c9f0, 1).
item_tradeable(_69c0f047d5077fafd836c9f0, true).
item(_69c0f047d5077fafd836c9f3).
item_name(_69c0f047d5077fafd836c9f3, 'Gun Revolver').
item_type(_69c0f047d5077fafd836c9f3, weapon).
item_value(_69c0f047d5077fafd836c9f3, 20).
item_weight(_69c0f047d5077fafd836c9f3, 3).
item_tradeable(_69c0f047d5077fafd836c9f3, true).
item(_69c0f047d5077fafd836c9f4).
item_name(_69c0f047d5077fafd836c9f4, 'Gun Rifle').
item_type(_69c0f047d5077fafd836c9f4, weapon).
item_value(_69c0f047d5077fafd836c9f4, 20).
item_weight(_69c0f047d5077fafd836c9f4, 3).
item_tradeable(_69c0f047d5077fafd836c9f4, true).
item(_69c0f047d5077fafd836c9f6).
item_name(_69c0f047d5077fafd836c9f6, 'Prop Desk Small').
item_type(_69c0f047d5077fafd836c9f6, furniture).
item_value(_69c0f047d5077fafd836c9f6, 15).
item_weight(_69c0f047d5077fafd836c9f6, 10).
item_tradeable(_69c0f047d5077fafd836c9f6, true).
item(_69c0f047d5077fafd836c9f7).
item_name(_69c0f047d5077fafd836c9f7, 'Prop Grenade').
item_type(_69c0f047d5077fafd836c9f7, weapon).
item_value(_69c0f047d5077fafd836c9f7, 20).
item_weight(_69c0f047d5077fafd836c9f7, 3).
item_tradeable(_69c0f047d5077fafd836c9f7, true).
item(_69c0f047d5077fafd836c9f8).
item_name(_69c0f047d5077fafd836c9f8, 'Prop Healthpack').
item_type(_69c0f047d5077fafd836c9f8, consumable).
item_value(_69c0f047d5077fafd836c9f8, 15).
item_weight(_69c0f047d5077fafd836c9f8, 0.5).
item_tradeable(_69c0f047d5077fafd836c9f8, true).
item(_69c0f047d5077fafd836c9f9).
item_name(_69c0f047d5077fafd836c9f9, 'Prop Healthpack Tube').
item_type(_69c0f047d5077fafd836c9f9, consumable).
item_value(_69c0f047d5077fafd836c9f9, 15).
item_weight(_69c0f047d5077fafd836c9f9, 0.5).
item_tradeable(_69c0f047d5077fafd836c9f9, true).
item(_69c0f047d5077fafd836c9fa).
item_name(_69c0f047d5077fafd836c9fa, 'Prop Keycard').
item_type(_69c0f047d5077fafd836c9fa, key).
item_value(_69c0f047d5077fafd836c9fa, 5).
item_weight(_69c0f047d5077fafd836c9fa, 0.1).
item_tradeable(_69c0f047d5077fafd836c9fa, true).
item(_69c0f047d5077fafd836c9fb).
item_name(_69c0f047d5077fafd836c9fb, 'Prop Syringe').
item_type(_69c0f047d5077fafd836c9fb, consumable).
item_value(_69c0f047d5077fafd836c9fb, 15).
item_weight(_69c0f047d5077fafd836c9fb, 0.5).
item_tradeable(_69c0f047d5077fafd836c9fb, true).
item(_69c0f047d5077fafd836c9ff).
item_name(_69c0f047d5077fafd836c9ff, 'Battery Big').
item_type(_69c0f047d5077fafd836c9ff, equipment).
item_value(_69c0f047d5077fafd836c9ff, 15).
item_weight(_69c0f047d5077fafd836c9ff, 1).
item_tradeable(_69c0f047d5077fafd836c9ff, true).
item(_69c0f047d5077fafd836ca00).
item_name(_69c0f047d5077fafd836ca00, 'Crown').
item_type(_69c0f047d5077fafd836ca00, accessory).
item_value(_69c0f047d5077fafd836ca00, 50).
item_weight(_69c0f047d5077fafd836ca00, 0.2).
item_tradeable(_69c0f047d5077fafd836ca00, true).
item(_69c0f047d5077fafd836ca03).
item_name(_69c0f047d5077fafd836ca03, 'Necklace').
item_type(_69c0f047d5077fafd836ca03, accessory).
item_value(_69c0f047d5077fafd836ca03, 50).
item_weight(_69c0f047d5077fafd836ca03, 0.2).
item_tradeable(_69c0f047d5077fafd836ca03, true).
item(_69c0f047d5077fafd836ca04).
item_name(_69c0f047d5077fafd836ca04, 'Arrow Golden').
item_type(_69c0f047d5077fafd836ca04, weapon).
item_value(_69c0f047d5077fafd836ca04, 20).
item_weight(_69c0f047d5077fafd836ca04, 3).
item_tradeable(_69c0f047d5077fafd836ca04, true).
item(_69c0f047d5077fafd836ca05).
item_name(_69c0f047d5077fafd836ca05, 'Armor Metal').
item_type(_69c0f047d5077fafd836ca05, armor).
item_value(_69c0f047d5077fafd836ca05, 25).
item_weight(_69c0f047d5077fafd836ca05, 5).
item_tradeable(_69c0f047d5077fafd836ca05, true).
item(_69c0f047d5077fafd836ca06).
item_name(_69c0f047d5077fafd836ca06, 'Ring').
item_type(_69c0f047d5077fafd836ca06, accessory).
item_value(_69c0f047d5077fafd836ca06, 50).
item_weight(_69c0f047d5077fafd836ca06, 0.2).
item_tradeable(_69c0f047d5077fafd836ca06, true).
item(_69c0f047d5077fafd836ca07).
item_name(_69c0f047d5077fafd836ca07, 'Glove').
item_type(_69c0f047d5077fafd836ca07, armor).
item_value(_69c0f047d5077fafd836ca07, 25).
item_weight(_69c0f047d5077fafd836ca07, 5).
item_tradeable(_69c0f047d5077fafd836ca07, true).
item(_69c105b7dc14d93d31d72c2c).
item_name(_69c105b7dc14d93d31d72c2c, 'Sledgehammer').
item_type(_69c105b7dc14d93d31d72c2c, tool).
item_value(_69c105b7dc14d93d31d72c2c, 12).
item_weight(_69c105b7dc14d93d31d72c2c, 2).
item_tradeable(_69c105b7dc14d93d31d72c2c, true).
item(_69c105b7dc14d93d31d72c2d).
item_name(_69c105b7dc14d93d31d72c2d, 'Lambis Shell').
item_type(_69c105b7dc14d93d31d72c2d, decoration).
item_value(_69c105b7dc14d93d31d72c2d, 8).
item_weight(_69c105b7dc14d93d31d72c2d, 1).
item_tradeable(_69c105b7dc14d93d31d72c2d, true).

% === Language Facts ===
language(_69c7eff054de6edea916a909).
language_name(_69c7eff054de6edea916a909, 'French').

% === Quests ===
% Quest: Arrival Assessment
% Complete your language assessment upon arriving in the settlement. This establishes your baseline proficiency and introduces you to the town.
% Type: assessment / Difficulty: beginner

quest(arrival_assessment, 'Arrival Assessment', assessment, beginner, active).
quest_assigned_to(arrival_assessment, 'unassigned').
quest_language(arrival_assessment, french).
quest_chain(arrival_assessment, chain_1774710649311_zpry4jovj).
quest_chain_order(arrival_assessment, 0).
quest_tag(arrival_assessment, assessment).
quest_tag(arrival_assessment, arrival).
quest_tag(arrival_assessment, main_quest).
quest_tag(arrival_assessment, narrative).
quest_tag(arrival_assessment, chain_meta_name_the_missing_writer_bonusxp_500_achievement_mystery_solved).

quest_objective(arrival_assessment, 0, objective('Complete the arrival language assessment')).

quest_completion(arrival_assessment, criteria('Complete all arrival assessment phases')).


quest_reward(arrival_assessment, experience, 50).

% Can Player take this quest?
quest_available(Player, arrival_assessment) :-
    quest(arrival_assessment, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, arrival_assessment) :-
    quest_progress(Player, arrival_assessment, Progress), Progress >= 100.
% SKIPPED: quest 69c7ef7954de6edea916a615 "The Notice Board" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7ef7954de6edea916a617 "The Writer's Home" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7ef7954de6edea916a619 "Following the Trail" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7ef7954de6edea916a61b "The Hidden Writings" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7ef7954de6edea916a61d "The Secret Location" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7ef7954de6edea916a61f "The Final Chapter" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7ef7954de6edea916a621 "Departure Assessment" — syntax error (unbalanced parens)
% Quest: Explore the Neighborhood
% Get familiar with the area by visiting a key location.
% Type: navigation / Difficulty: beginner

quest(explore_the_neighborhood, 'Explore the Neighborhood', navigation, beginner, available).
quest_assigned_to(explore_the_neighborhood, 'Player').
quest_assigned_by(explore_the_neighborhood, 'Aurore Broussard').
quest_language(explore_the_neighborhood, french).
quest_tag(explore_the_neighborhood, seed).
quest_tag(explore_the_neighborhood, objective_type_visit_location).
quest_tag(explore_the_neighborhood, category_navigation).

quest_objective(explore_the_neighborhood, 0, visit_location('Sainte-Évangéline')).



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
quest_assigned_by(grand_tour, 'Océane Mouton').
quest_language(grand_tour, french).
quest_tag(grand_tour, seed).
quest_tag(grand_tour, objective_type_visit_location).
quest_tag(grand_tour, category_exploration).
quest_tag(grand_tour, multi_step).

quest_objective(grand_tour, 0, visit_location('Sainte-Évangéline')).



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
quest_assigned_by(uncharted_territory, 'Jean-Baptiste Hébert').
quest_language(uncharted_territory, french).
quest_tag(uncharted_territory, seed).
quest_tag(uncharted_territory, objective_type_discover_location).
quest_tag(uncharted_territory, category_exploration).

quest_objective(uncharted_territory, 0, discover_location('Sainte-Évangéline')).



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
quest_assigned_by(introduce_yourself, 'Noémie Moreau').
quest_language(introduce_yourself, french).
quest_tag(introduce_yourself, seed).
quest_tag(introduce_yourself, objective_type_talk_to_npc).
quest_tag(introduce_yourself, category_conversation).

quest_objective(introduce_yourself, 0, talk_to('69c7efe254de6edea916a6e1', 1)).



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
quest_assigned_by(meet_the_locals, 'Julien Richard').
quest_language(meet_the_locals, french).
quest_tag(meet_the_locals, seed).
quest_tag(meet_the_locals, objective_type_talk_to_npc).
quest_tag(meet_the_locals, category_social).
quest_tag(meet_the_locals, multi_npc).

quest_objective(meet_the_locals, 0, talk_to('69c7efd154de6edea916a6a5', 1)).
quest_objective(meet_the_locals, 1, talk_to('69c7efe254de6edea916a6db', 1)).
quest_objective(meet_the_locals, 2, talk_to('69c7efe354de6edea916a719', 1)).



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
quest_assigned_by(a_good_chat, 'Adélaïde Doucet').
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
quest_assigned_by(deep_conversation, 'Claude Trahan').
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
quest_assigned_by(first_impressions, 'Aurore Broussard').
quest_language(first_impressions, french).
quest_tag(first_impressions, seed).
quest_tag(first_impressions, objective_type_introduce_self).
quest_tag(first_impressions, category_conversation).

quest_objective(first_impressions, 0, objective('Introduce yourself to Madeleine Bourgeois in French')).



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
quest_assigned_by(making_friends, 'Aurélie Trahan').
quest_language(making_friends, french).
quest_tag(making_friends, seed).
quest_tag(making_friends, objective_type_build_friendship).
quest_tag(making_friends, category_social).

quest_objective(making_friends, 0, objective('Have 3 conversations with François Savoie to build a friendship')).



quest_reward(making_friends, experience, 25).
quest_reward(making_friends, xp, 25).
quest_reward(making_friends, fluency, 5).

% Can Player take this quest?
quest_available(Player, making_friends) :-
    quest(making_friends, _, _, _, active).

% SKIPPED: quest 69c7eff054de6edea916a923 "A Thoughtful Gift" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7eff054de6edea916a925 "Earn Their Trust" — syntax error (unbalanced parens)
% Quest: Words in Action
% Use target-language words during a conversation.
% Type: vocabulary / Difficulty: beginner

quest(words_in_action, 'Words in Action', vocabulary, beginner, available).
quest_assigned_to(words_in_action, 'Player').
quest_assigned_by(words_in_action, 'Odette Dugas').
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
quest_assigned_by(vocabulary_immersion, 'Julien Richard').
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
quest_assigned_by(word_collector, 'Jacques Mouton').
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
quest_assigned_by(word_hoarder, 'Geneviève Thibodeaux').
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
quest_assigned_by(name_that_thing, 'Marcel Bergeron').
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
quest_assigned_by(curious_observer, 'Jean-Baptiste Hébert').
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
quest_assigned_by(point_and_say, 'Camille Broussard').
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
quest_assigned_by(reading_around_town, 'Noémie Moreau').
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
quest_assigned_by(grammar_in_practice, 'Élodie Boudreaux').
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
quest_assigned_by(written_word, 'Mathieu Leblanc').
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
quest_assigned_by(picture_this, 'Aurore Broussard').
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
quest_assigned_by(story_time, 'Célestin Hébert').
quest_language(story_time, french).
quest_tag(story_time, seed).
quest_tag(story_time, objective_type_listening_comprehension).
quest_tag(story_time, category_listening_comprehension).

quest_objective(story_time, 0, objective('Listen to Céline LeBlanc\'s story and answer 2 questions correctly')).



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
quest_assigned_by(parrot_practice, 'Amélie Landry').
quest_language(parrot_practice, french).
quest_tag(parrot_practice, seed).
quest_tag(parrot_practice, objective_type_listen_and_repeat).
quest_tag(parrot_practice, category_listening_comprehension).

quest_objective(parrot_practice, 0, objective('Listen to Camille Broussard and repeat 3 phrases')).



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
quest_assigned_by(echo_challenge, 'Claudine Savoie').
quest_language(echo_challenge, french).
quest_tag(echo_challenge, seed).
quest_tag(echo_challenge, objective_type_listen_and_repeat).
quest_tag(echo_challenge, category_listening_comprehension).

quest_objective(echo_challenge, 0, objective('Listen to Émile Thibodeaux and repeat 6 phrases')).



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
quest_assigned_by(lost_in_translation, 'Léon Delacroix').
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
quest_assigned_by(master_translator, 'René Boudreaux').
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
quest_assigned_by(say_it_right, 'Victor Chauvin').
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
quest_assigned_by(fluency_drill, 'René Boudreaux').
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
quest_assigned_by(follow_the_signs, 'Claudine Savoie').
quest_language(follow_the_signs, french).
quest_tag(follow_the_signs, seed).
quest_tag(follow_the_signs, objective_type_navigate_language).
quest_tag(follow_the_signs, category_navigation).

quest_objective(follow_the_signs, 0, objective('Follow French directions to reach Sainte-Évangéline')).



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
quest_assigned_by(direction_master, 'Amélie Hébert').
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
quest_assigned_by(which_way, 'Gabriel Guidry').
quest_language(which_way, french).
quest_tag(which_way, seed).
quest_tag(which_way, objective_type_ask_for_directions).
quest_tag(which_way, category_navigation).

quest_objective(which_way, 0, objective('Ask Antoine Hébert for directions in French')).



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
quest_assigned_by(cultural_exchange, 'Sylvie Sonnier').
quest_language(cultural_exchange, french).
quest_tag(cultural_exchange, seed).
quest_tag(cultural_exchange, objective_type_talk_to_npc).
quest_tag(cultural_exchange, category_cultural).
quest_tag(cultural_exchange, cultural).

quest_objective(cultural_exchange, 0, talk_to('69c7efe454de6edea916a731', 1)).
quest_objective(cultural_exchange, 1, talk_to('69c7efe454de6edea916a721', 1)).



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
quest_assigned_by(cultural_landmarks, 'Véronique Gauthier').
quest_language(cultural_landmarks, french).
quest_tag(cultural_landmarks, seed).
quest_tag(cultural_landmarks, objective_type_visit_location).
quest_tag(cultural_landmarks, category_cultural).
quest_tag(cultural_landmarks, cultural).

quest_objective(cultural_landmarks, 0, visit_location('Sainte-Évangéline')).
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
quest_assigned_by(scavenger_hunt_basics, 'Joséphine Romero').
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

% SKIPPED: quest 69c7eff154de6edea916a957 "Scavenger Hunt: Collector" — syntax error (unbalanced parens)
% Quest: Scavenger Hunt: Expert
% Find, identify, and name many objects in the target language — a comprehensive vocabulary challenge.
% Type: scavenger_hunt / Difficulty: advanced

quest(scavenger_hunt_expert, 'Scavenger Hunt: Expert', scavenger_hunt, advanced, available).
quest_assigned_to(scavenger_hunt_expert, 'Player').
quest_assigned_by(scavenger_hunt_expert, 'Océane Mouton').
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
quest_assigned_by(tell_your_story, 'Véronique Gauthier').
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
quest_assigned_by(campfire_tales, 'Geneviève Thibodeaux').
quest_language(campfire_tales, french).
quest_tag(campfire_tales, seed).
quest_tag(campfire_tales, objective_type_complete_conversation).
quest_tag(campfire_tales, category_storytelling).
quest_tag(campfire_tales, storytelling).
quest_tag(campfire_tales, listening).

quest_objective(campfire_tales, 0, objective('Listen to Jean-Baptiste Broussard tell a story and repeat key phrases')).
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
quest_assigned_by(lunch_order, 'Océane Mouton').
quest_language(lunch_order, french).
quest_tag(lunch_order, seed).
quest_tag(lunch_order, objective_type_order_food).
quest_tag(lunch_order, category_conversation).
quest_tag(lunch_order, commerce).
quest_tag(lunch_order, daily_life).

quest_objective(lunch_order, 0, objective('Order food from Manon Guidry in French')).



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
quest_assigned_by(bargain_hunter, 'Amélie Landry').
quest_language(bargain_hunter, french).
quest_tag(bargain_hunter, seed).
quest_tag(bargain_hunter, objective_type_haggle_price).
quest_tag(bargain_hunter, category_conversation).
quest_tag(bargain_hunter, commerce).

quest_objective(bargain_hunter, 0, objective('Negotiate a price with Claudine Savoie in French')).



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
quest_assigned_by(dinner_party, 'Victor Chauvin').
quest_language(dinner_party, french).
quest_tag(dinner_party, seed).
quest_tag(dinner_party, objective_type_order_food).
quest_tag(dinner_party, category_conversation).
quest_tag(dinner_party, commerce).
quest_tag(dinner_party, daily_life).

quest_objective(dinner_party, 0, objective('Order food from Solange Perrin in French')).
quest_objective(dinner_party, 1, learn_words_count(3)).



quest_reward(dinner_party, experience, 35).
quest_reward(dinner_party, xp, 35).
quest_reward(dinner_party, fluency, 7).

% Can Player take this quest?
quest_available(Player, dinner_party) :-
    quest(dinner_party, _, _, _, active).

% SKIPPED: quest 69c7eff254de6edea916a965 "Gather Supplies" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7eff254de6edea916a967 "Special Delivery" — syntax error (unbalanced parens)
% SKIPPED: quest 69c7eff254de6edea916a969 "First Craft" — syntax error (unbalanced parens)
% Quest: Prove Your Mettle
% Defeat an enemy in combat.
% Type: combat / Difficulty: intermediate

quest(prove_your_mettle, 'Prove Your Mettle', combat, intermediate, available).
quest_assigned_to(prove_your_mettle, 'Player').
quest_assigned_by(prove_your_mettle, 'François Savoie').
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
quest_assigned_by(safe_passage, 'Claudine Savoie').
quest_language(safe_passage, french).
quest_tag(safe_passage, seed).
quest_tag(safe_passage, objective_type_escort_npc).
quest_tag(safe_passage, category_escort).

quest_objective(safe_passage, 0, escort('Joséphine Romero', '')).



quest_reward(safe_passage, experience, 35).
quest_reward(safe_passage, xp, 35).
quest_reward(safe_passage, fluency, 7).

% Can Player take this quest?
quest_available(Player, safe_passage) :-
    quest(safe_passage, _, _, _, active).

% SKIPPED: quest 69c7eff254de6edea916a96f "Newcomer's Welcome" — syntax error (unbalanced parens)
% Quest: The Full Experience
% Visit a location, have a conversation, use vocabulary, and identify an object — a well-rounded language challenge.
% Type: conversation / Difficulty: intermediate

quest(the_full_experience, 'The Full Experience', conversation, intermediate, available).
quest_assigned_to(the_full_experience, 'Player').
quest_assigned_by(the_full_experience, 'Cécile Aucoin').
quest_language(the_full_experience, french).
quest_tag(the_full_experience, seed).
quest_tag(the_full_experience, objective_type_complete_conversation).
quest_tag(the_full_experience, category_conversation).
quest_tag(the_full_experience, composite).

quest_objective(the_full_experience, 0, visit_location('Sainte-Évangéline')).
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
quest_assigned_by(language_explorer, 'Émile Thibodeaux').
quest_language(language_explorer, french).
quest_tag(language_explorer, seed).
quest_tag(language_explorer, objective_type_use_vocabulary).
quest_tag(language_explorer, category_exploration).
quest_tag(language_explorer, composite).
quest_tag(language_explorer, immersion).

quest_objective(language_explorer, 0, visit_location('Sainte-Évangéline')).
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
% Post-gameplay French proficiency assessment before departing Sainte-Évangéline.
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

