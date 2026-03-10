% volition.lp

const single_null = 100.
const no_null = 200.
is(NAME,tag_agnostic) :- action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION).

non_null(INITIATOR) :- action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION), TARGET != null.

likelihood(action(NAME, INITIATOR,null,null,ACTION,LOCATION),N) :-
  N =  #sum{ C,Tag :
          is(NAME,Tag) ,
          propensity(Tag, C, _, INITIATOR,null,null,ACTION,LOCATION )}, action(NAME, INITIATOR,null,null,ACTION,LOCATION), INITIATOR != null, not non_null(INITIATOR).


likelihood(action(NAME, INITIATOR,null,SUBJECT,ACTION,LOCATION),N) :-
  N =  #sum{ C,Tag :
          is(NAME,Tag) ,
          propensity(Tag, C, _, INITIATOR,null,SUBJECT,ACTION,LOCATION )}, action(NAME, INITIATOR,null,SUBJECT,ACTION,LOCATION), INITIATOR != null,
          hashed(NAME,HN), hashed_1(INITIATOR,HI), hashed_2(null,HT), hashed_3(SUBJECT,HS), hashed(time,HTime),hashed(LOCATION,HL),
          | HN + HI + HT + HS + HTime + HL | \ 10000 < single_null.
     
likelihood(action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION),N) :-
  N =  #sum{ C,Tag :
          is(NAME,Tag) ,
          propensity(Tag, C, _, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION )}, action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION), INITIATOR != null, is(NAME,role_specific).    
       
likelihood(action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION),N) :-
  N =  #sum{ C,Tag :
          is(NAME,Tag) ,
          propensity(Tag, C, _, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION )}, action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION), INITIATOR != null, is(INITIATOR,connected_to,TARGET).   
          
likelihood(action(NAME, INITIATOR,TARGET,null,ACTION,LOCATION),N) :-
  N =  #sum{ C,Tag :
          is(NAME,Tag) ,
          propensity(Tag, C, _, INITIATOR,TARGET,null,ACTION,LOCATION )}, action(NAME, INITIATOR,TARGET,null,ACTION,LOCATION), INITIATOR != null,
          hashed(NAME,HN), hashed_1(INITIATOR,HI), hashed_2(TARGET,HT), hashed_3(null,HS), hashed(time,HTime),hashed(LOCATION,HL),
          | HN + HI + HT + HS + HTime + HL | \ 10000 < single_null.
          
likelihood(action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION),N) :-
  N =  #sum{ C,Tag :
          is(NAME,Tag) ,
          propensity(Tag, C, _, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION )}, action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION), INITIATOR != null,
          hashed(NAME,HN), hashed_1(INITIATOR,HI), hashed_2(TARGET,HT), hashed_3(SUBJECT,HS), hashed(time,HTime),hashed(LOCATION,HL),
          | HN + HI + HT + HS + HTime + HL | \ 10000 < no_null.

% location_volition.lp
   
go_to_raw(NAME,LOCATION,N) :-
  N =  #sum{ C, thing :
          go_to_propensity(Tag, C,_, NAME, _,_,_,LOCATION)},
          go_to_propensity(_,_,_, NAME, _,_,_,LOCATION), location(LOCATION).
          %,   
          %hashed_1(NAME,HN), hashed(time,HTime),hashed(LOCATION,HL),
          %|HN + HTime + HL| \ 10 < 5.
    
go_to(NAME,LOCATION,N) :- go_to_raw(NAME,LOCATION,N).


{go_to(NAME,LOCATION,0)} :- location(LOCATION), person(NAME), LOCATION != null
, hashed_1(NAME,HN), hashed(time,HTime),hashed(LOCATION,HL),
          |HN + HTime + HL| \ 10 < 5.

created(NAME,LOCATION) :- go_to(NAME,LOCATION,0), not go_to_raw(NAME,LOCATION,0).

:- 3  {created(NAME,_)} , person(NAME), NAME != null.

:- 2 {go_to(NAME,LOCATION,_)},location(LOCATION), person(NAME).
:-  {go_to(NAME,_,_)} 2, person(NAME), NAME != null.