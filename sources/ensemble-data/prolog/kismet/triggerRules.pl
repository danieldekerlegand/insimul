% no_age_sampling

const families = 5.
const characters = 100.
const factories = 1.
const family_mod = 19.
1 {family_count(M) } 1  :- M =families..families.
family(I) :- I = 1..M, family_count(M).

1 {character_count(M)} 1 :- M =characters..characters.
character(I) :- I = 1..M, character_count(M).

#show is/3.

%%%%Trait Stuff

traits(extrovert;introvert;manic_depressive;happy_go_lucky;generous;selfish;gregarious;cantankerous).

2 {is(character(Character),Trait) : traits(Trait)} 5 :- character(Character).

:- is(Character,extrovert), is(Character,introvert).
:- is(Character,generous), is(Character,selfish).
:- is(Character,gregarious), is(Character,cantankerous).

%For each trait, it should be the case, that it shows up some amount of time
:- {is(Character, Trait)} Characters/(2*Traits) ,traits(Trait), Traits = {traits(_)}, character_count(Characters).

bits(B) :- B=0..8.
%%%%Other Stuff
%1 {age(character(Character), Age): Age=1..70} 1 :- character(Character).
%{age_bits(character(Character), Bit): Bit=0..8} :- character(Character).
%:- #sum {2**Bit:age_bits(character(Character), Bit)} > 70, character(Character).
%:- #sum {2**Bit:age_bits(character(Character), Bit)} < 1, character(Character).  

%mutually exclusive wealth: rich/poor/middleclass.
exclusive_trait(wealth, (rich;poor;middleclass)).

%default character:
%    has [1] wealth.
1  {is(character(Character),Trait) : exclusive_trait(TraitType,Trait)} 1 :- character(Character),exclusive_trait(TraitType,_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Family %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

2 {assigned(family(FamilyID), parent, character(CharacterID)): 
    character(CharacterID),
    (CharacterID+FamilyID) \ family_mod  < 1
    }2 :- family(FamilyID).

:- assigned(Family, parent, Character), #sum {2**Bit:age_bits(Character, Bit)} < 20.
:- assigned(Family, parent, Character), #sum {2**Bit:age_bits(Character, Bit)} > 60.
:- 2 {assigned(Family, parent, Character)}, character(Character).

is(Character,parent,Other)  :- assigned(Family, parent, Character), assigned(Family, child, Other).

is(Character,married,Other)  :- assigned(Family, parent, Character), assigned(Family, parent, Other), Character != Other.


%Child Stuff
%1 {assigned(family(FamilyID), child, character(CharacterID)): CharacterID=(FamilyID*characters/families)..(FamilyID+1)*characters/families} 5 :- family(FamilyID).

1 {assigned(family(FamilyID), child, character(CharacterID)):  
    character(CharacterID),
    (CharacterID+FamilyID+1) \ family_mod < 1
    } 5 :- family(FamilyID).

:- 2 {assigned(Family, child, Character)}, character(Character).

:- assigned(Family, child, Character), #sum {2**Bit:age_bits(Character, Bit)} <1.
:- assigned(Family, child, Character),#sum {2**Bit:age_bits(Character, Bit)} > 40.
is(Character,child,Other)  :- assigned(Family, child, Character), assigned(Family, parent, Other).
is(Character,sibling,Other)  :- assigned(Family, child, Character), assigned(Family, child, Other), Character != Other.


:- assigned(Family, child, Character),assigned(Family, parent, Other),
            #sum {2**Bit:age_bits(Other, Bit); -(2**Bit2):age_bits(Character, Bit2)} < 20.
            
%Parent and Child share traits
:- assigned(Family, child, Character), assigned(Family, parent, Other), {is(Character,Trait); is(Other,Trait) } 0.        
        
%%% SPECIFY CONSTRAINTS ABOUT THE GENERATION
%pattern(grand_parent(GC,P,GP)) :- is(GC, child, P), is(P, child, GP).
%:- not pattern(grand_parent(_,_,_)).
pattern(grand_parent) :- is(GC, child, P), is(P, child, GP).
:- not pattern(grand_parent).

%pattern(fall_from_wealth(GC,GP)) :- is(GC, child, P), is(P, child, GP), is(GC,poor), is(GP,rich).
%:- not pattern(fall_from_wealth(_,_)).
pattern(fall_from_wealth) :- is(GC, child, P), is(P, child, GP), is(GC,poor), is(GP,rich).
:- not pattern(fall_from_wealth).

%pattern(rags_to_riches(GC,P)) :- is(GC, child, P), is(GC,rich), is(P,poor).
%:- not pattern(rags_to_riches(_,_)).

pattern(rags_to_riches) :- is(GC, child, P), is(GC,rich), is(P,poor).
:- not pattern(rags_to_riches).

% select [1] character as parentA:
%     shares wealth with parentB.
:-  assigned(Family, parent, Character), assigned(Family, parent, Other), is(Character,Trait), exclusive_trait(wealth,Trait), not is(Other,Trait).

% select [1] character as child:
%     shares wealth with parentA if age < 25.
:-  assigned(Family, parent, Character), assigned(Family, child, Other), is(Character,Trait), exclusive_trait(wealth,Trait), not is(Other,Trait),
     #sum {2**Bit:age_bits(Other, Bit)} < 25.
     
1 {factory_count(M):   M =factories..factories} 1.
factory(I) :- I = 1..M, factory_count(M).

%initialization factory:
%    select [2:3] character as worker:
%        is employee of factory
%        :where         
%        age = [18:50],
%        is poor;

2 {assigned(factory(FactoryID), worker, character(CharacterID)): character(CharacterID)} 3 :- factory(FactoryID).
is(Character,employee,factory(FactoryID)) :- assigned(factory(FactoryID), worker,Character).
:- assigned(factory(FactoryID), worker,Character), not is(Character,poor).
:- assigned(factory(FactoryID), worker,Character), 
    #sum {2**Bit:age_bits(Character, Bit)} < 18.
:- assigned(factory(FactoryID), worker,Character), 
    #sum {2**Bit:age_bits(Character, Bit)}> 50.
    
%    select [1] character as manager:
%        age = [30:50],
%        is middleclass,
%        is manager of factory;

1 {assigned(factory(FactoryID), manager, character(CharacterID)): character(CharacterID)} 1 :- factory(FactoryID).
is(Character,manager,factory(FactoryID)) :- assigned(factory(FactoryID), manager,Character).
:- assigned(factory(FactoryID), manager,Character), not is(Character,middleclass).
:- assigned(factory(FactoryID), manager,Character), 
    #sum {2**Bit:age_bits(Character, Bit)} < 30.
:- assigned(factory(FactoryID), manager,Character), 
    #sum {2**Bit:age_bits(Character, Bit)}> 50.        
    
%    select [1] character as owner:
%        age = [40:65],
%        is rich,
%        is owner of factory.

1 {assigned(factory(FactoryID), owner, character(CharacterID)): character(CharacterID)} 1 :- factory(FactoryID).
is(Character,owner,factory(FactoryID)) :- assigned(factory(FactoryID), owner,Character).
:- assigned(factory(FactoryID), owner,Character), not is(Character,rich).
:- assigned(factory(FactoryID), owner,Character), 
    #sum {2**Bit:age_bits(Character, Bit)} < 40.
:- assigned(factory(FactoryID), owner,Character), 
    #sum {2**Bit:age_bits(Character, Bit)}> 65.            

%prevent  0 character lives_at residence.
%:- is(Residence,residence), 0 {is(_, lives_at, Residence)} 0.

%PersonA can_live_with PersonB if PersonA and PersonB are married to each other.
is(PersonA, can_live_with, PersonB) :- 
                            is(PersonA, married, PersonB), 
                            is(PersonB, married, PersonA) .

is(PersonB, can_live_with, PersonA) :- 
                            is(PersonA, married, PersonB), 
                            is(PersonB, married, PersonA) .
                            
%Parent and Child must_live_with each other if Parent  is parent to Child, Child’s age < 18.

is(Parent, must_live_with, Child) :- 
    is(Parent, parent, Child), 
   #sum {2**Bit:age_bits(Child, Bit)} < 18.

is(Child, must_live_with, Parent) :- 
    is(Parent, parent, Child), 
   #sum {2**Bit:age_bits(Child, Bit)} < 18.

is(Parent, can_live_with, Child) :- 
    is(Parent, parent, Child).

is(Child, can_live_with, Parent) :- 
    is(Parent, parent, Child). 

is(Child, can_live_with, Sibling) :- 
    is(Sibling, sibling, Child).  
   
%PersonA and PersonB can_live_with each other if PersonA and PersonB are roommates with each other.

is(PersonA, must_live_with, PersonB) :- 
                            is(PersonA, roommates, PersonB), 
                            is(PersonB, roommates, PersonA) .

is(PersonA, can_live_with, PersonB) :- 
                            is(PersonA, roommates, PersonB), 
                            is(PersonB, roommates, PersonA) .

is(PersonA, roommates, PersonB) :- is(PersonB, roommates, PersonA).
is(PersonA, roommates, PersonC) :- is(PersonB, roommates, PersonA), is(PersonC, roommates, PersonB), PersonA != PersonC, PersonA != PersonB, PersonB != PersonC.

is(character(Character), can_live_with,character(Character)) :- character(Character). 


%require PersonA and PersonB lives_at same if PersonA and PersonB can_live_with each other
%:- is(PersonA, can_live_with,PersonB), is(PersonB, can_live_with,PersonA), is(PersonA, lives_at,Other), is(PersonB,lives_at,Other2), %PersonA != PersonB, Other != Other2.

%:- is(PersonA, lives_at,Residence), is(PersonB, lives_at,Residence), not is(PersonA, can_live_with,PersonB).
%:- is(PersonA, must_live_with, PersonB),is(PersonA, lives_at,ResidenceA), is(PersonB, lives_at,ResidenceB), ResidenceA != ResidenceB.

{lives_with(PersonA, PersonB)} :- is(PersonA, can_live_with,PersonB).
lives_with(PersonA, PersonB) :- is(PersonA,must_live_with,PersonB).
lives_with(PersonA, PersonB) :- lives_with(PersonB, PersonA).

{lives_at(PersonA, residence(PersonA)) :  lives_with(PersonA, PersonB)} 1 :- lives_with(PersonA, PersonB).
lives_at(PersonA, Location) :- lives_with(PersonA, PersonB), lives_at(PersonB, Location), PersonA != PersonB.
:- 2 {lives_at(PersonA, _)}, lives_at(PersonA,_).
:-  {lives_at(character(PersonA), _)} 0, character(PersonA).
:-  lives_at(PersonA,RA) , lives_with(PersonA,PersonB), lives_at(PersonB, RB), RA != RB.
{lives_at(character(PersonA), residence(character(PersonA)))} 1  :- character(PersonA), not lives_with(PersonA,_).

is(Person, lives_at, Residence) :- lives_at(Person, Residence).
%lives_at(character(PersonA), residence(character(PersonA))) :- character(PersonA), not lives_with(PersonA,_).

more_than_one(Person,R1, R2) :- lives_at(Person,R1), lives_at(Person,R2), R1 != R2.

residence(R) :- lives_at(_,R).

%This means go through the possible things of type residence
%1 {mansion_count(M)  : M =0..10} 1.
%mansion(I) :- I = 1..M, mansion_count(M).
%is(mansion(I), mansion) :- mansion(I).
%1 {house_count(M)  : M =0..10} 1.
%house(I) :- I = 1..M, house_count(M).
%is(house(I), house) :- house(I).
%1 {tenement_count(M)  : M =0..10} 1.
%tenement(I) :- I = 1..M, tenement_count(M).

%1 {residenceCount(I) : I=families*3..characters} 1. 
residence(I) :- lives_at(_,I).
residence_type(mansion;house;tenement).
1 {is(I,Type) : residence_type(Type)} 1 :- residence(I).
%abstract residence extends location.

is(Residence, location) :- is(Residence,residence).

%define mansion extends residence:
%	require all who lives_at mansion are rich.
is(Mansion, residence) :- is(Mansion,mansion).
:- is(Mansion,mansion), is(Other, lives_at, Mansion), not is(Other, rich).

%define house extends residence:
%	require all who lives_at house are middleclass.
is(House, residence) :- is(House,house).
:- is(House,house), is(Other, lives_at, House), not is(Other, middleclass).

%define tenement extends residence:
%	require all who lives_at tenement are poor.
is(Tenement, residence) :- is(Tenement,tenement).
:- is(Tenement,tenement), is(Other, lives_at, Tenement), not is(Other, poor).

% residence_and_jobs.lp

#const families = 5.
#const characters = 100.
#const factories = 1.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% RICH-POOR JOB HOUSE STUFF %%%%%%%%%%%%%%%%%%%%%%%%%%

1 {factory_count(M):   M =factories..factories} 1.
factory(I) :- I = 1..M, factory_count(M).

%initialization factory:
%    select [2:3] character as worker:
%        is employee of factory
%        :where         
%        age = [18:50],
%        is poor;

2 {assigned(factory(FactoryID), worker, character(CharacterID)): character(CharacterID)} 3 :- factory(FactoryID).
is(Character,employee,factory(FactoryID)) :- assigned(factory(FactoryID), worker,Character).
:- assigned(factory(FactoryID), worker,Character), not is(Character,poor).
:- assigned(factory(FactoryID), worker,Character), 
    #sum {2**Bit:age_bits(Character, Bit)} < 18.
:- assigned(factory(FactoryID), worker,Character), 
    #sum {2**Bit:age_bits(Character, Bit)}> 50.
    
%    select [1] character as manager:
%        age = [30:50],
%        is middleclass,
%        is manager of factory;

1 {assigned(factory(FactoryID), manager, character(CharacterID)): character(CharacterID)} 1 :- factory(FactoryID).
is(Character,manager,factory(FactoryID)) :- assigned(factory(FactoryID), manager,Character).
:- assigned(factory(FactoryID), manager,Character), not is(Character,middleclass).
:- assigned(factory(FactoryID), manager,Character), 
    #sum {2**Bit:age_bits(Character, Bit)} < 30.
:- assigned(factory(FactoryID), manager,Character), 
    #sum {2**Bit:age_bits(Character, Bit)}> 50.        
    
%    select [1] character as owner:
%        age = [40:65],
%        is rich,
%        is owner of factory.

1 {assigned(factory(FactoryID), owner, character(CharacterID)): character(CharacterID)} 1 :- factory(FactoryID).
is(Character,owner,factory(FactoryID)) :- assigned(factory(FactoryID), owner,Character).
:- assigned(factory(FactoryID), owner,Character), not is(Character,rich).
:- assigned(factory(FactoryID), owner,Character), 
    #sum {2**Bit:age_bits(Character, Bit)} < 40.
:- assigned(factory(FactoryID), owner,Character), 
    #sum {2**Bit:age_bits(Character, Bit)}> 65.            

%prevent  0 character lives_at residence.
%:- is(Residence,residence), 0 {is(_, lives_at, Residence)} 0.

%PersonA can_live_with PersonB if PersonA and PersonB are married to each other.
is(PersonA, can_live_with, PersonB) :- 
                            is(PersonA, married, PersonB), 
                            is(PersonB, married, PersonA) .

is(PersonB, can_live_with, PersonA) :- 
                            is(PersonA, married, PersonB), 
                            is(PersonB, married, PersonA) .
                            
%Parent and Child must_live_with each other if Parent  is parent to Child, Child’s age < 18.

is(Parent, must_live_with, Child) :- 
    is(Parent, parent, Child), 
   #sum {2**Bit:age_bits(Child, Bit)} < 18.

is(Child, must_live_with, Parent) :- 
    is(Parent, parent, Child), 
   #sum {2**Bit:age_bits(Child, Bit)} < 18.

is(Parent, can_live_with, Child) :- 
    is(Parent, parent, Child).

is(Child, can_live_with, Parent) :- 
    is(Parent, parent, Child). 

is(Child, can_live_with, Sibling) :- 
    is(Sibling, sibling, Child).  
   
%PersonA and PersonB can_live_with each other if PersonA and PersonB are roommates with each other.

is(PersonA, must_live_with, PersonB) :- 
                            is(PersonA, roommates, PersonB), 
                            is(PersonB, roommates, PersonA) .

is(PersonA, can_live_with, PersonB) :- 
                            is(PersonA, roommates, PersonB), 
                            is(PersonB, roommates, PersonA) .

is(PersonA, roommates, PersonB) :- is(PersonB, roommates, PersonA).
is(PersonA, roommates, PersonC) :- is(PersonB, roommates, PersonA), is(PersonC, roommates, PersonB), PersonA != PersonC, PersonA != PersonB, PersonB != PersonC.

is(character(Character), can_live_with,character(Character)) :- character(Character). 


%require PersonA and PersonB lives_at same if PersonA and PersonB can_live_with each other
%:- is(PersonA, can_live_with,PersonB), is(PersonB, can_live_with,PersonA), is(PersonA, lives_at,Other), is(PersonB,lives_at,Other2), %PersonA != PersonB, Other != Other2.

%:- is(PersonA, lives_at,Residence), is(PersonB, lives_at,Residence), not is(PersonA, can_live_with,PersonB).
%:- is(PersonA, must_live_with, PersonB),is(PersonA, lives_at,ResidenceA), is(PersonB, lives_at,ResidenceB), ResidenceA != ResidenceB.

{lives_with(PersonA, PersonB)} :- is(PersonA, can_live_with,PersonB).
lives_with(PersonA, PersonB) :- is(PersonA,must_live_with,PersonB).
lives_with(PersonA, PersonB) :- lives_with(PersonB, PersonA).

{lives_at(PersonA, residence(PersonA)) :  lives_with(PersonA, PersonB)} 1 :- lives_with(PersonA, PersonB).
lives_at(PersonA, Location) :- lives_with(PersonA, PersonB), lives_at(PersonB, Location), PersonA != PersonB.
:- 2 {lives_at(PersonA, _)}, lives_at(PersonA,_).
:-  {lives_at(character(PersonA), _)} 0, character(PersonA).
:-  lives_at(PersonA,RA) , lives_with(PersonA,PersonB), lives_at(PersonB, RB), RA != RB.
{lives_at(character(PersonA), residence(character(PersonA)))} 1  :- character(PersonA), not lives_with(PersonA,_).

is(Person, lives_at, Residence) :- lives_at(Person, Residence).
%lives_at(character(PersonA), residence(character(PersonA))) :- character(PersonA), not lives_with(PersonA,_).

more_than_one(Person,R1, R2) :- lives_at(Person,R1), lives_at(Person,R2), R1 != R2.
%#show lives_at/2.
%#show lives_with/2.
%#show lives_alone/1.
%#show more_than_one/3.

residence(R) :- lives_at(_,R).


%This means go through the possible things of type residence
%1 {mansion_count(M)  : M =0..10} 1.
%mansion(I) :- I = 1..M, mansion_count(M).
%is(mansion(I), mansion) :- mansion(I).
%1 {house_count(M)  : M =0..10} 1.
%house(I) :- I = 1..M, house_count(M).
%is(house(I), house) :- house(I).
%1 {tenement_count(M)  : M =0..10} 1.
%tenement(I) :- I = 1..M, tenement_count(M).

%1 {residenceCount(I) : I=families*3..characters} 1. 
residence(I) :- lives_at(_,I).
residence_type(mansion;house;tenement).
1 {is(I,Type) : residence_type(Type)} 1 :- residence(I).
%abstract residence extends location.

is(Residence, location) :- is(Residence,residence).

%define mansion extends residence:
%	require all who lives_at mansion are rich.
is(Mansion, residence) :- is(Mansion,mansion).
:- is(Mansion,mansion), is(Other, lives_at, Mansion), not is(Other, rich).

%define house extends residence:
%	require all who lives_at house are middleclass.
is(House, residence) :- is(House,house).
:- is(House,house), is(Other, lives_at, House), not is(Other, middleclass).

%define tenement extends residence:
%	require all who lives_at tenement are poor.
is(Tenement, residence) :- is(Tenement,tenement).
:- is(Tenement,tenement), is(Other, lives_at, Tenement), not is(Other, poor).

% age_nonbit.lp

#const families = 20.
#const characters = 100.
#const factories = 1.

1 {family_count(M)  : M =families..families} 1.
family(I) :- I = 1..M, family_count(M).

1 {character_count(M)} 1 :- M =characters..characters.
character(I) :- I = 1..M, character_count(M).


%%%%Trait Stuff
traits(extrovert;introvert;manic_depressive;happy_go_lucky;generous;selfish;gregarious;cantankerous).

2 {is(character(Character),Trait) : traits(Trait)} 5 :- character(Character).

:- is(Character,extrovert), is(Character,introvert).
:- is(Character,generous), is(Character,selfish).
:- is(Character,gregarious), is(Character,cantankerous).

%For each trait, it should be the case, that it shows up some amount of time
:- {is(Character, Trait)} Characters/(2*Traits) ,traits(Trait), Traits = {traits(_)}, character_count(Characters).

%%%%Other Stuff
1 {age(character(Character), Age): Age=1..70} 1 :- character(Character).

%mutually exclusive wealth: rich/poor/middleclass.
exclusive_trait(wealth, (rich;poor;middleclass)).

%default character:
%    has [1] wealth.
1  {is(character(Character),Trait) : exclusive_trait(TraitType,Trait)} 1 :- character(Character),exclusive_trait(TraitType,_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Family %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

2 {assigned(family(FamilyID), parent, character(CharacterID)): 
    character(CharacterID),
    (CharacterID+FamilyID) \ (2*characters/families) = 0} 2 :- family(FamilyID).

:- assigned(Family, parent, Character), age(Character, Age), Age < 20.
:- assigned(Family, parent, Character),  age(Character, Age), Age > 50.
:- 2 {assigned(Family, parent, Character)}, character(Character).

is(Character,parent,Other)  :- assigned(Family, parent, Character), assigned(Family, child, Other).

is(Character,married,Other)  :- assigned(Family, parent, Character), assigned(Family, parent, Other), Character != Other.

%Child Stuff
%1 {assigned(family(FamilyID), child, character(CharacterID)): CharacterID=(FamilyID*characters/families)..(FamilyID+1)*characters/families} 5 :- family(FamilyID).

1 {assigned(family(FamilyID), child, character(CharacterID)):  
    character(CharacterID),
    (CharacterID+FamilyID) \ (5*characters/families) = 0} 5 :- family(FamilyID).

:- 2 {assigned(Family, child, Character)}, character(Character).

:- assigned(Family, child, Character),  age(Character, Age), Age <1.
:- assigned(Family, child, Character),  age(Character, Age), Age> 30.
is(Character,child,Other)  :- assigned(Family, child, Character), assigned(Family, parent, Other).
is(Character,sibling,Other)  :- assigned(Family, child, Character), assigned(Family, child, Other).


:- assigned(Family, child, Character),assigned(Family, parent, Other),
            #sum {Age:age(Other,Age); -Age2:age(Character, Age2)} < 20.

%%% SPECIFY CONSTRAINTS ABOUT THE GENERATION
grand_parent :- is(GC, child, P), is(P, child, GP).
:- not grand_parent.

fall_from_wealth(GC,GP) :- is(GC, child, P), is(P, child, GP), is(GC,poor), is(GP,rich).
:- not fall_from_wealth(_,_).

rags_to_riches(GC,P) :- is(GC, child, P), is(GC,rich), is(P,poor).
:- not rags_to_riches(_,_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% RICH-POOR JOB HOUSE STUFF %%%%%%%%%%%%%%%%%%%%%%%%%%

% select [1] character as parentA:
%     shares wealth with parentB.
:-  assigned(Family, parentA, Character), assigned(Family, parentB, Other), is(Character,Trait), exclusive_trait(wealth,Trait), not is(Other,Trait).

% select [1] character as child:
%     shares wealth with parentA if age < 25.
:-  assigned(Family, parentA, Character), assigned(Family, child, Other), is(Character,Trait), exclusive_trait(wealth,Trait), not is(Other,Trait),
     age(Other,Age), Age < 25.
     
%This means go through the possible things of type residence
%1 {mansion_count(M)  : M =0..10} 1.
%mansion(I) :- I = 1..M, mansion_count(M).
%is(mansion(I), mansion) :- mansion(I).
%1 {house_count(M)  : M =0..10} 1.
%house(I) :- I = 1..M, house_count(M).
%is(house(I), house) :- house(I).
%1 {tenement_count(M)  : M =0..10} 1.
%tenement(I) :- I = 1..M, tenement_count(M).

1 {residenceCount(I) : I=families..characters} 1. 
residence(I) :- I = 0..M-1, residenceCount(M).
residence_type(mansion;tenement;house).
1 {is(residence(I),Type) : residence_type(Type)} 1 :- residence(I).

%abstract residence extends location.

is(Residence, location) :- is(Residence,residence).

%default character:
% has lives_at of [1] residence.

1  {is(character(Character),lives_at, Other): is(Other, residence)} 1 :- character(Character).

%define mansion extends residence:
%	require all who lives_at mansion are rich.
is(Mansion, residence) :- is(Mansion,mansion).
:- is(Mansion,mansion), is(Other, lives_at, Mansion), not is(Other, rich).

%define house extends residence:
%	require all who lives_at house are middleclass.
is(House, residence) :- is(House,house).
:- is(House,house), is(Other, lives_at, House), not is(Other, middleclass).

%define tenement extends residence:
%	require all who lives_at tenement are poor.
is(Tenement, residence) :- is(Tenement,tenement).
:- is(Tenement,tenement), is(Other, lives_at, Tenement), not is(Other, poor).

1 {factory_count(M):   M =factories..factories} 1.
factory(I) :- I = 1..M, factory_count(M).

%initialization factory:
%    select [2:3] character as worker:
%        is employee of factory
%        :where         
%        age = [18:50],
%        is poor;

2 {assigned(factory(FactoryID), worker, character(CharacterID)): character(CharacterID)} 3 :- factory(FactoryID).
is(Character,employee,factory(FactoryID)) :- assigned(factory(FactoryID), worker,Character).
:- assigned(factory(FactoryID), worker,Character), not is(Character,poor).
:- assigned(factory(FactoryID), worker,Character), 
    age(Character,Age), Age  < 18.
:- assigned(factory(FactoryID), worker,Character), 
    age(Character,Age), Age > 50.
    
%    select [1] character as manager:
%        age = [30:50],
%        is middleclass,
%        is manager of factory;

1 {assigned(factory(FactoryID), manager, character(CharacterID)): character(CharacterID)} 1 :- factory(FactoryID).
is(Character,manager,factory(FactoryID)) :- assigned(factory(FactoryID), manager,Character).
:- assigned(factory(FactoryID), manager,Character), not is(Character,middleclass).
:- assigned(factory(FactoryID), manager,Character), 
    age(Character,Age), Age  < 30.
:- assigned(factory(FactoryID), manager,Character), 
    age(Character,Age), Age > 50.        
    
%    select [1] character as owner:
%        age = [40:65],
%        is rich,
%        is owner of factory.

1 {assigned(factory(FactoryID), owner, character(CharacterID)): character(CharacterID)} 1 :- factory(FactoryID).
is(Character,owner,factory(FactoryID)) :- assigned(factory(FactoryID), owner,Character).
:- assigned(factory(FactoryID), owner,Character), not is(Character,rich).
:- assigned(factory(FactoryID), owner,Character), 
    age(Character,Age), Age  < 40.
:- assigned(factory(FactoryID), owner,Character), 
    age(Character,Age), Age  > 65.            

%prevent  0 character lives_at residence.
%:- is(Residence,residence), 0 {is(_, lives_at, Residence)} 0.

%PersonA can_live_with PersonB if PersonA and PersonB are married to each other.
is(PersonA, can_live_with, PersonB) :- 
                            is(PersonA, married, PersonB), 
                            is(PersonB, married, PersonA) .

is(PersonB, can_live_with, PersonA) :- 
                            is(PersonA, married, PersonB), 
                            is(PersonB, married, PersonA) .
                            
%Parent and Child can_live_with each other if Parent  is parent to Child, Child’s age < 1.

is(Parent, can_live_with, Child) :- 
    is(Parent, parent, Child), 
   age(Character,Age), Age  < 18.

is(Child, can_live_with, Parent) :- 
    is(Parent, parent, Child), 
   age(Character,Age), Age  < 18.
   
%PersonA and PersonB can_live_with each other if PersonA and PersonB are roommates with each other.

is(PersonA, can_live_with, PersonB) :- 
                            is(PersonA, roommates, PersonB), 
                            is(PersonB, roommates, PersonA) .

%require PersonA and PersonB can_live_with each other for PersonA and PersonB lives_at same.
%:- is(PersonA, lives_at, Other),  is(PersonB, lives_at, Other),
%    2 {is(PersonA, lives_at, Other);  is(PersonB, lives_at, Other)},
%    not is(PersonA, can_live_with, PersonB).
    
%require PersonA and PersonB lives_at same if PersonA and PersonB can_live_with each other
:- is(PersonA, can_live_with,PersonB), is(PersonB, can_live_with,PersonA), is(PersonA, lives_at,Other), not is(PersonB,lives_at,Other).

lives_at(Location,Person) :-is(Person, lives_at,Location).

% knowledge.lp
knows(Person, Action) :- received(Person, Action).
knows(Person, Action) :- did(Person, Action).
knows(Person, Action) :- saw(Person, Action).
knows(Person, Action) :- heard(Person, Action).

% rules.lp
kept(Characters) :- is(Characters,believer).

% observation.lp
observability(Name,Initiator,Target,Subject,Action,Location, Observer,Loc, Value) :-
    at(Observer,Loc),
    at(Initiator,Loc),
    occurred(action(Name,Initiator,Target,Subject,Action,Location)),
    Observer != Initiator,
    visibility(Name,Value),
    Observer != null.

% pattern.lp
pattern :- action(fuck,P1,P2,T1),
	   action(marry,P1,P2,T2),
	   action(kill,P1,P2,T3),
	   T1 < T2,
	   T2 < T3.

% initializations.lp
state(Person,likes,Other) :- person(Person), person(Other).

% cult_ritual.kismet
gregarious(Self) :- opposes(narcissistic), gregarious(3).
narcissistic(Self) :- opposes(gregarious), narcissistic(3).
traditionalist(Self) :- opposes(reformist), traditionalist(3).
reformist(Self) :- reformist(3).
skeptic(Self) :- opposes(believer), skeptic(3).
believer(Self) :- believer(3).
location(Self, Location) :- employee(Self, Location). % workers_go_to_work

% cult.kismet
gregarious(Self) :- opposes(narcissistic), gregarious(3).
narcissistic(Self) :- opposes(gregarious), narcissistic(3).
traditionalist(Self) :- opposes(reformist), traditionalist(3).
reformist(Self) :- reformist(3).
skeptic(Self) :- opposes(believer), skeptic(3).
believer(Self) :- believer(3).
poor(Self) :- opposes(rich), poor(3).
rich(Self) :- opposes(poor), rich(3).
scholar(Self) :- scholar(3).
artistic(Self) :- artistic(3).
cultist(Self) :- cultist(3).
political(Self) :- political(3).
default_is_employee_of_location(Self, Location) :- employee(Self, Location).
default_is_member_of_location(Self, Location) :- member(Self, Location).
default_is_regular_of_location(Self, Location) :- regular(Self, Location).
default_is_resident_of_location(Self, Location) :- resident(Self, Location).

% barbarians.kismet
angry(-1), talk(2), nice(2) :- likes(Self, Other). % be_nice_to_friends
angry(2), talk(-1), nice(-1) :- dislikes(Self, Other). % start_shit_with_enemies
angry(2) :- angry(Self). % angry
angry(-2), quiet(2) :- serene(Self). % serene
talk(-2), angry(-2), quiet(2) :- stoic(Self). % stoic
talk(2), drink(2), nice(2), quiet(-2) :- boisterous(Self). % boisterous
talk(-2), angry(2), quiet(2) :- brooding(Self). % brooding
drink(2) :- drunkard(Self), location(Self, tavern). % drunkard
angry(2) :- angry_drunk(Self), drunk(Self). % angry_drunk
talk(-2), quiet(2) :- sullen_drunk(Self), drunk(Self). % sullen_drunk
nice(2) :- happy_drunk(Self), drunk(Self). % happy_drunk
location(Self, tavern) :- innkeeper(Self). % innkeeper
location(Self, market) :- vendor(Self). % vendor
location(Self, market) :- blacksmith(Self). % blacksmith

% fantasy_broad.kismet
rare(3) :- rare_things_rare(Self). % rare_things_rare
extremely_rare(3) :- xrare_things_xrare(Self). % xrare_things_xrare
specific(3) :- do_more_specific_things(Self). % do_more_specific_things
confined(6) :- stay_in_confinement(Self, Location), confined(Self, Location). % stay_in_confinement
tourist(1) :- visiting_places_you_like(Self, Location), tourist(Self, Location). % visiting_places_you_like
regular(3) :- visiting_as_regular(Self, Location), regular(Self, Location). % visiting_as_regular
thief(-3) :- thieves_go_around(Self, Location), thief(Self, Location). % thieves_go_around
spy(-3) :- spies_go_around(Self, Location), spy(Self, Location). % spies_go_around
knight(-3) :- knights_go_around(Self, Location), knight(Self, Location). % knights_go_around
guard(-3) :- guards_go_around(Self, Location), guard(Self, Location). % guards_go_around
squire(-3) :- squires_go_around(Self, Location), squire(Self, Location). % squires_go_around
romance(3) :- romantic_towards_crush(Self, Other), crushing_on(Self, Other). % romantic_towards_crush
hometown(3) :- stay_at_hometown(Self, Location), hometown(Self, Location). % stay_at_hometown
connected(3) :- make_chosen_one_connections_occurLACKING(Self, Other, Location), pattern(lacking_path, Self, Other), connected(Other, Location). % make_chosen_one_connections_occurLACKING
connected(1) :- make_chosen_one_connections_occur(Self, Other, Location), chosen_one(Self), chosen_one(Other), connected(Other, Location). % make_chosen_one_connections_occur
connected(2) :- go_where_people_you_like_go(Self, Other, Location), likes(Self, Other, 1), connected(Other, Location). % go_where_people_you_like_go
connected(3) :- chosen_ones_are_connected(Self, Other), pattern(lacking_path, Self, Other). % chosen_ones_are_connected
role_specific(4) :- do_role_specific_actions(Self). % do_role_specific_actions
connected(4) :- go_to_locations_you_have_connection_with(Self, Location), connected(Self, Location). % go_to_locations_you_have_connection_with
likes(2) :- clique_formation1(Self, Other), likes(Self, Other, 0). % clique_formation1
likes(2) :- clique_formation2(Self, Other), likes(Self, Other, 0). % clique_formation2
friend_of_friend(2) :- clique_formationFoF1(Self, Other), pattern(friend_of_friend, Self, Other). % clique_formationFoF1
friend_of_friend(2) :- clique_formationFoF2(Self, Other), pattern(friend_of_friend, Other, Self). % clique_formationFoF2
likes(2) :- clique_formation1R(Self, Other), likes(Other, Self, 0). % clique_formation1R
likes(2) :- clique_formation2R(Self, Other), likes(Other, Self, 0). % clique_formation2R
romance(-30) :- no_pedophilia(Self, Other), age(Self, Age1), Age1 >= 18, age(Other, Age2), Age2 <= 17. % no_pedophilia
thoughtful(1), kind(1), mean(-1), critical(1), romance(-7) :- family_ties(Self, Other), related_to(Self, Other), not(spouse(Self, Other)). % family_ties
mean(3), abusive(3) :- abusive_if_abusive(Self, Other), abusiveness(Self, Abusiveness), Abusiveness >= 0. % abusive_if_abusive
mean(1) :- mean_to_people_you_dislike1(Self, Other), likes(Self, Other, -1). % mean_to_people_you_dislike1
mean(2) :- mean_to_people_you_dislike2(Self, Other), likes(Self, Other, -3). % mean_to_people_you_dislike2
mean(3) :- mean_to_people_you_dislike3(Self, Other), likes(Self, Other, -5). % mean_to_people_you_dislike3
mean(-1) :- nice_to_people_you_like1(Self, Other), likes(Self, Other, 1). % nice_to_people_you_like1
mean(-2) :- mean_to_people_you_dislike2(Self, Other), likes(Self, Other, 3). % mean_to_people_you_dislike2
mean(-3) :- mean_to_people_you_dislike3(Self, Other), likes(Self, Other, 5). % mean_to_people_you_dislike3
silly(-1) :- people_are_usually_serious(Self). % people_are_usually_serious
failure(1) :- fail_when_interactin_with_person_who_dislikes_you1(Self, Other), likes(Other, Self, -1). % fail_when_interactin_with_person_who_dislikes_you1
failure(2) :- fail_when_interactin_with_person_who_dislikes_you2(Self, Other), likes(Other, Self, -3). % fail_when_interactin_with_person_who_dislikes_you2
silly(1) :- people_joke_with_joker(Self, Other), comic(Other). % people_joke_with_joker
talk(-3) :- introvert(Self). % introvert
risky(3) :- curious(Self). % curious
mean(3), kind(-3) :- bully(Self). % bully
scholarly(3) :- scholar(Self). % scholar
thoughtful(3), careless(-3) :- conscientious(Self). % conscientious
agree(3), critical(-3) :- agreeable(Self). % agreeable
thoughtful(3), kind(3), mean(-3) :- compassionate(Self). % compassionate
worry(3), bold(-3) :- neurotic(Self). % neurotic
thoughtful(3), kind(3), mean(-3) :- family_oriented(Self, Other), related_to(Self, Other). % family_oriented
duty(3), free(-3) :- duty_bound(Self). % duty_bound
romance(3) :- romantic(Self). % romantic
critical(3), agree(3) :- gruff(Self, Other), likes(Self, Other). % gruff
talk(-3), risky(3), religious(-2) :- feral(Self). % feral
silly(3), thoughtful(-1) :- comic(Self). % comic
romance(2) :- default_horny(Self, Other), spark(Self, Other). % default_horny
romance(-1) :- default_but_not_too_horny(Self, Other). % default_but_not_too_horny
nice(2) :- default_friendly(Self, Other), charge(Self, Other). % default_friendly
sneaky(-2) :- default_non_sneaky(Self). % default_non_sneaky
errand(3) :- default_mundane(Self). % default_mundane
romance(-2) :- default_dont_date_assholes(Self, Other), dislikes(Self, Other). % default_dont_date_assholes
romance(3) :- hate_date(Self, Other), dislikes(Self, Other). % hate_date
anger(-2) :- default_not_anger(Self). % default_not_anger
calm(1) :- default_calm(Self). % default_calm
fidelity(3), infidelity(-3) :- default_fidelity(Self). % default_fidelity
breakup(-3) :- default_stay_together(Self). % default_stay_together
breakup(4) :- default_dump_their_cheating_ass(Self, Other), cheating(Other). % default_dump_their_cheating_ass
breakup(2) :- default_dump_them(Self, Other), dislikes(Self, Other). % default_dump_them
breakup(3) :- default_dump_them(Self, Other), hates(Self, Other). % default_dump_them
judgy(-3) :- default_non_judgy(Self). % default_non_judgy
errand(-3), waste_time(3) :- scatter_brained(Self). % scatter_brained
nice(2) :- family_driven(Self, Other), family(Self, Other). % family_driven
drinking(3), bar(3) :- drunkard(Self). % drunkard
sober(3), drink(-4), bar(-2) :- teetotaler(Self). % teetotaler
angry(2) :- angry_drunk(Self), drunk(Self). % angry_drunk
open(2) :- overshare_drunk(Self), drunk(Self). % overshare_drunk
talk(-2) :- quiet_drunk(Self), drunk(Self). % quiet_drunk
talk(2) :- loud_drunk(Self), drunk(Self). % loud_drunk
religious(2), church(3) :- pious(Self). % pious
fidelity(3), infidelity(-3) :- monogamist(Self). % monogamist
infidelity(3) :- cheater(Self). % cheater
judgy(2) :- judgy(Self). % judgy
nice(2) :- kind(Self). % kind
talk(2) :- extrovert(Self). % extrovert
talk(-2) :- introvert(Self). % introvert
annoying(-2) :- abiding(Self). % abiding
annoying(2) :- annoying(Self). % annoying
jealous(2) :- jealous(Self). % jealous
open(1) :- open(Self). % open
open(-1) :- closed(Self). % closed
anger(2), calm(-1) :- angry(Self). % angry
calm(2), anger(-1) :- calm(Self). % calm
bar(3) :- bartender(Self). % bartender
church(3) :- pastor(Self). % pastor
market(3) :- vendor(Self). % vendor
hospitality_establishment(3) :- regular(Self, Location), likes(Self, Location). % regular
likes(3) :- favorite_place(Self, Location), likes(Self, Location). % favorite_place
employee(6) :- worker(Self, Location), employee(Self, Location). % worker
romance(4) :- romantic(Self). % romantic
religious(3), romance(-3) :- religous(Self, Other), not(religious(Other)). % religous
romance(2) :- horny(Self, Other), spark(Self, Other). % horny
romance(-1) :- but_not_too_horny(Self, Other). % but_not_too_horny
observation(3), observation(1) :- snoopy(Self, Action), secretive(Action). % snoopy
drinking(3), bar(3) :- drunkard(Self). % drunkard
sad(3) :- sad_drunk(Self), drunk(Self). % sad_drunk
talk(3) :- extrovert(Self). % extrovert
violent(3) :- violent(Self). % violent
religious(3) :- religious(Self). % religious

% cult_ritual.kismet
likes(Self, Other).

% testbed.kismet
removed(Self) :- in_shadow_realm(Self).
removed(Self) :- dead(Self).
removed(Self) :- exile(Self).

% cult.kismet
removed(Self) :- dead(Self).
removed(Self) :- exile(Self).
likes(Self, Other).

% test.kismet
selfcare(+3) :- hurt(Self).
likes(Self, Other).
impulsive(+3), anger(+3) :- drunk(Self).

% fantasy_broad.kismet
likes(Self, Other).
loves(Self, Other).
respects(Self, Other).
rivalry(Self, Other).
disappointed(Self, Other).
proud(Self, Other).
embarrassed(Self, Other).
protective(Self, Other).
friends(Self, Other).
abusiveness(Self).
happiness(Self).
anger(Self).
tiredness(Self).
sadness(Self).
guilt(Self).
shame(Self).
self_worth(Self).

% astronaut_early_life.kismet
cowardly(Self, false) :- brave(Self).
anarchic(Self, false) :- rule_bound(Self).
disloyal(Self, false) :- loyal(Self).
solitary(Self, false) :- social(Self).
dependent(Self, false) :- independent(Self).
freespirited(Self, false) :- controlling(Self).
agitated(Self, false) :- tranquil(Self).
giving(Self, false) :- covetous(Self).

% barbarians.kismet
innkeeper(self, false) :- vendor(self).
innkeeper(self, false) :- blacksmith(self).
vendor(self, false) :- blacksmith(self).
angry(self, false) :- serene(self).
stoic(self, false) :- boisterous(self).
brooding(self, false) :- boisterous(self).
sullen_drunk(self, false) :- happy_drunk(self).
angry_drunk(self, false) :- happy_drunk(self).

% trash_of_the_town.kismet
introvert(self, false) :- extrovert(self).
abiding(self, false) :- annoying(self).
open(self, false) :- closed(self).
teetotaler(self, false) :- drunkard(self).
loud_drunk(self, false) :- quiet_drunk(self).
vendor(self, false) :- pastor(self).
vendor(self, false) :- bartender(self).
pastor(self, false) :- bartender(self).

% test.kismet
child_laborer(Worker) :- age(TheWorker, Age), Age < 16.
bartender(Worker) :- tags(TheWorker, drinking), age(TheWorker, Age), Age >= 18.
monk(Worker) :- tags(Worker, religious).
foreman(Worker) :- tags(Worker, talk), tags(Worker, critical).
miner(Worker) :- tags(Worker, bold).
curator(Worker) :- tags(Worker, scholarly).
vendor(Worker) :- tags(Worker, talk).
enforcer(Worker) :- tags(Worker, risky), tags(Worker, mean), tags(Worker, criminal).
dockworker(Worker) :- tags(Worker, mariner).
librarian(Worker) :- tags(Worker, scholarly).
chef(Worker) :- tags(Worker, talk).
treasure_hunter(Worker) :- tags(Worker, bold), tags(Worker, criminal), tags(Worker, risky).
archaeologist(Worker) :- tags(Worker, scholarly), tags(Worker, thoughtful).
bard(Worker) :- tags(Worker, talk), tags(Worker, silly).
monarch(Worker) :- tags(Worker, bold), tags(Worker, critical).
chancellor(Worker) :- tags(Worker, talk), tags(Worker, critical).
professor(Worker) :- tags(Worker, talk), tags(Worker, scholarly), tags(Worker, critical).
spy_master(Worker) :- tags(Worker, risky), tags(Worker, critical).
sailor(Worker) :- tags(Worker, physical).
auctioneer(Worker) :- tags(Worker, bold), tags(Worker, talk).
artist(Worker) :- tags(Worker, creative).
spy(Worker) :- tags(Worker, work), tags(Worker, criminal).
tutor(Worker) :- tags(Worker, work), tags(Worker, scholarly).
ship_builder(Worker) :- tags(Worker, work).
prostitute(Worker) :- tags(Worker, work).
student(Worker) :- tags(Worker, work), tags(Worker, scholarly).
smith_apprentice(Worker) :- tags(Worker, work).
guard(Worker) :- tags(Worker, work).
shipping_foreman(Worker) :- tags(Worker, work).
thief(Worker) :- tags(Worker, work).
impresario(Worker) :- tags(Worker, work).
priest(Worker) :- tags(Worker, work).
high_priest(Worker) :- tags(Worker, work).
pickpocket(Worker) :- tags(Worker, work).
engineer(Worker) :- tags(Worker, work).
captain(Worker) :- tags(Worker, work).
elder(Worker) :- tags(Worker, work).
fisher(Worker) :- tags(Worker, work).
master_thief(Worker) :- tags(Worker, criminal).
patron(Worker) :- tags(Worker, free).
smithy(Worker) :- tags(Worker, work).
researcher(Worker) :- tags(Worker, work), tags(Worker, scholarly).
diva(Worker) :- tags(Worker, work), tags(Worker, talk).
barkeep(Worker) :- tags(Worker, work), tags(Worker, talk).
%guest
%worker
%drinker
%scared
%vocation
%regular
%sibling
%spouse
%fealty
%rich
%citizen
%victim
%hometown
%confined
%owner
%important
%tourist
%rival
%parent
%criminal
%last_birthday
%coworker
%child
%boss
%royalty
%connected

% cult_ritual.kismet

pattern romantic_rivals(>Me, >Rival, >Subject)
"Me and Rival compete for the love of Subject":
if Me likes Rival <= -5,
    Rival likes Me <= -5,
    Me likes Subject >= 10,
    Rival likes Subject >= 10.

pattern nemesis(>Me, >Nemesis)
"Me and Nemesis are arch rivals who hate each other":
if Me likes Nemesis <= -10,
    Nemesis likes Me <= -10.

pattern mutual_dislike(>Me, >Rival)
"Me and Rival share a mutual dislike for each other.":
if Me likes Rival <= -5, Rival likes Me <= -5.

% trash_of_the_town.kismet

pattern love_triangle A B C :
  A<->B(spark)
  C<->B(spark);

  pattern test A:
  A: (thing);

pattern cheating A B :
  A<?>B(cheating)
  A<->B(dating);

% cult.kismet

pattern romantic_rivals(>Me, >Rival, >Subject)
"Me and Rival compete for the love of Subject":
if Me likes Rival <= -5,
    Rival likes Me <= -5,
    Me likes Subject >= 10,
    Rival likes Subject >= 10.

pattern nemesis(>Me, >Nemesis)
"Me and Nemesis are arch rivals who hate each other":
if Me likes Nemesis <= -10,
    Nemesis likes Me <= -10.

pattern mutual_dislike(>Me, >Rival)
"Me and Rival share a mutual dislike for each other.":
if Me likes Rival <= -5, Rival likes Me <= -5.

pattern is_fall():
    if current month is sep.

pattern is_fall():
    if current month is oct.

pattern is_fall():
    if current month is nov.

pattern is_fall():
    if current month >= 9, current month <= 11.

pattern is_centennial():
    if current year is 1900.

pattern pre_war():
    if current year <= 1914.

% test.kismet

pattern quiet_romantic(>QuietRomantic):
  if QuietRomantic is introverted, QuietRomantic is romantic.

pattern enemy_of_my_enemy(>Me,>EnemyOfMyEnemy)
    "Me and EnemyOfMyEnemy are united in their dislike for Enemy":
    if Me likes Enemy < -3, Enemy likes EnemyOfMyEnemy < -3.
    
pattern milquetoast(>Me,>Other)
    "Me and Other feel pretty ambivalent about each other":
    if Me likes Other = 0, Other likes Me = 0.
    
pattern milquetoast(>Me,>Other)
    "Me and Other feel pretty ambivalent about each other 2":
    if Me likes Other = 1, Other likes Me = 0.

% fantasy_broad.kismet

pattern friend_of_friend(>PersonA, >PersonC):
    if PersonA likes PersonB >= 1, PersonB likes PersonC >= 1.
    
pattern has_connection(>PersonA, <PersonB):
    if PersonA likes PersonB >= 1, PersonA is chosen_one, PersonB is chosen_one.
    
pattern has_connection(>PersonA, <PersonB):
    if PersonA likes PersonB <= -1, PersonA is chosen_one, PersonB is chosen_one.

pattern has_connection(>PersonA, <PersonB):
    if PersonA loves PersonB <= -1,PersonA is chosen_one, PersonB is chosen_one.
    
pattern has_connection(>PersonA, <PersonB):
    if PersonA loves PersonB >= 1,PersonA is chosen_one, PersonB is chosen_one.
    
pattern has_connection(>PersonA, <PersonB):
    if pattern(has_connection,PersonB, PersonA), PersonA is chosen_one, PersonB is chosen_one .
    
pattern lacking_connection(>PersonA, <PersonB):
    if not pattern(has_connection, PersonA, PersonB), PersonA is chosen_one, PersonB is chosen_one.
  
pattern has_path(>PersonA, <PersonC):
    if pattern(has_connection,PersonA, PersonB), pattern(has_connection,PersonB, PersonC).
    
pattern has_path(>PersonA, <PersonC):
    if pattern(has_connection,PersonA, PersonB), pattern(has_path,PersonB, PersonC).
    
pattern has_path(>PersonA, <PersonC):
    if pattern(has_path,PersonA, PersonB), pattern(has_connection,PersonB, PersonC).
    
pattern has_path(>PersonA, <PersonC):
    if pattern(has_path,PersonA, PersonB), pattern(has_path,PersonB, PersonC).
    
pattern lacking_path(>PersonA, <PersonB):
    if not pattern(has_path,PersonA, PersonB), PersonA is chosen_one, PersonB is chosen_one.

pattern dislikes_friend(>Self, <Disliker, ^Friend):
    if Self likes Friend >= 3,
        Disliker likes Friend <= -3.

pattern non_joker(>Character):
    if Character is critical.
pattern non_joker(>Character):
    if Character is stern.
pattern non_joker(>Character):
    if Character is gruff.

% testbed.kismet
         
dead(person) :- immortal(Person, false), likelihood(+++(Person's age)). % die_of_old_age
% event unleash_evil(*ForbiddenEvent):
%     likelihood = +++(ForbiddenEvent has occurred);
%     ForbiddenEvent is forbidden;
%     if ForbiddenEvent has occurred >= 10 times.

% cult.kismet
last_birthday(Person, today), age(Person, +1) :- last_birthday(Person) >= year. % have_birthday
werewolf(Person), last_transformation(now) :- lycan(Person), last_transformation(Person, >=, 1, month). % transform_into_werewolf
human(Person) :- werewolf(Person), last_transformation(Person, >=, 1, day). % turn_back_into_human