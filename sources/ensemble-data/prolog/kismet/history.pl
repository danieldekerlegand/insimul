% astronaut.kisseq
load astronaut_early_life.kismet with north_america.tracery;
initialize astronaut_early_life.init;

% testbed.kisseq
load cult.kismet with tracery edwardian.tracery;

while iterations < 10 {
    add cult.kismet;
    initialize cult.init: restoring characters in Town;
    
    run until 
        2 characters in pattern getting_married /2 or
        1 character is just_died or
        10 steps;

    if 2 characters in pattern getting_married /2 {
        add wedding.kismet;
        remove cult.kismet;

        initialize wedding.init:
            keeping characters where in pattern getting_married /2:
            keeping characters where friends /2 with 
                                character in pattern getting_married /2:
            keeping characters where family /2 with 
                                character in pattern getting_married /2:
            stashing the rest in Town;
            
        run 1 week;
        remove wedding.kismet;
    } else if 1 character is just_died {
        add funeral.kismet;
        remove cult.kismet;
        
        initialize funeral.init:
            keeping characters where is just_died:
            keeping characters where friends /2 with character is just_died:
            keeping characters where family /2 with character is just_died:
            stashing the rest in Town;
            
        run 1 week;
        remove funeral.kismet;
   } else {
       add cult_ritual.kismet;
       remove cult.kismet;
       initialize cult_ritual.kismet:
           keeping characters where is believer:
           keeping characters in pattern nemesis /2 with character in kept:
           stashing the rest in Town;
       run 1 week;
       remove cult_ritual.kismet;
   }
}

% test.kisseq
load gosford_history.kismet with ../tracery/edwardian.tracery;
initialize gosford_history.init;

run until 5+ characters in pattern hate_each_other /2, 2 characters in pattern star_crossed_love /2, steps > 10
    or 20 steps;

run until > 6 characters in pattern hate_each_other /2, < 3  characters in pattern star_crossed_love /2
    or 20 steps;
    
run until >= 10  characters in pattern hate_each_other /2, <= 12 characters in pattern star_crossed_love /2
    or 20 steps;
    
run 10 steps;

load gosford_manor.kismet  with ..\tracery\edwardian.tracery;
initialize gosford_manor.init:

keeping characters where
    in pattern hate_each_other /2, age > 15, and is wealthy
    or
    in pattern relative_of /2 with character in pattern hate_each_other /2
    or
    in pattern relative_of /2 with character in kept:
keeping locations with
    is warehouse, is public
    or 
    is public, is religious;
run until 1 character is dead 
    or 1+ character is murdered /2 
    or >3 character hatred > 5;

% gtbbt.seq
load data/fantasy_broad.kismet with tracery data/fantasy.tracery;
initialize data/fantasy_setting.init;

run until 0 characters  in pattern lacking_path / 2;
run 1 steps;

%Call to Action 
choose [
   1:{
       initialize fantasy_quest_start.init: keeping characters where is chosen_one
                                          : keeping all locations;
       add group_happens_upon_eachother.kismet; % lotr, ff4, ff5, ff6
   }
    1:{
       add sage_calls_council.kismet; %lotr, ff6 banon, 
    }
    1:{
       add rescue_brings_together.kismet; %ff6 terra
    }
    1:{
       choose [
            1: {
                add chosen_one_unleashes_calamity_due_to_greed.kismet; %ff4
                }             
            1: {
                add chosen_one_unleashes_calamity_due_to_being_tricked.kismet; %ff4
                }
       ]
    }
]

% astronaut_early_life.init
default location:.

default character: 
	last_name = "#lastNames#",
	first_name = "#firstNames#",
	age = [18:50],
	traits = [1:2] traits.
    
initialization city:
    create [1] location as city:
        name = "[[New |][Bruns|Dun|Young|Carl|Colum|Ash|Bed|Rivers|Summer|Samuel|England|Ryan][ton|wick|ford|ville|bus|bine|shire]|[San|Santa] [Clara|Anita|Cruz|Carlos]|[Los|Las|Monte|Vista Del] [Mar|Prado|Rio]]",
        location_type = "city",
        is urban.

initialization town:
    create [1] location as town:
        name = "[[New |][Bruns|Dun|Young|Carl|Colum|Ash|Bed|Rivers|Summer|Samuel|England|Ryan][ton|wick|ford|ville|bus|bine|shire]|[San|Santa] [Clara|Anita|Cruz|Carlos]|[Los|Las|Monte|Vista Del] [Mar|Prado|Rio]]",
        location_type = "town",
        is suburban.

initialization farmland:
    create [1] location as farmland:
        name = "[[New |][Bruns|Dun|Young|Carl|Colum|Ash|Bed|Rivers|Summer|Samuel|England|Ryan][ton|wick|ford|ville|bus|bine|shire]|[San|Santa] [Clara|Anita|Cruz|Carlos]|[Los|Las|Monte|Vista Del] [Mar|Prado|Rio]]",
        location_type = "farmland",
        is rural.

initialization urban_family:
    let FamilyName = "#lastNames#";
    
    select [1] location as hometown:
        :where
        is urban;
    
    create [1:2] character as parent:
        is parent of child,
        is spouse of parent,
        is resident of hometown,
        last_name = FamilyName,
        age = [30:40];
    
    create [1:6] character as child:
        is child of parent,
        is sibling of child,
        is resident of hometown,
        last_name = FamilyName,
        age = [1:10].
        
initialization suburban_family:
    let FamilyName = "#lastNames#";
    
    select [1] location as hometown:
        :where
        is suburban;
    
    create [1:2] character as parent:
        is parent of child,
        is spouse of parent,
        is resident of hometown,
        last_name = FamilyName,
        age = [30:40];
    
    create [1:6] character as child:
        is child of parent,
        is sibling of child,
        is resident of hometown,
        last_name = FamilyName,
        age = [1:10].
                
initialization rural_family:
    let FamilyName = "#lastNames#";
    
    select [1] location as hometown:
        :where
        is rural;
    
    create [1:2] character as parent:
        is parent of child,
        is spouse of parent,
        is resident of hometown,
        last_name = FamilyName,
        age = [30:40];
    
    create [1:6] character as child:
        is child of parent,
        is sibling of child,
        is resident of hometown,
        last_name = FamilyName,
        age = [1:10].

initialize:
    create [10] farmland;
    create [1] city;
    create [1] town;
	create [20] urban_family;
    create [20] suburban_family;
    create [20] rural_family

% fantasy_quest_start.init
default location:.

initialization quest_start:
    select [1] location as start:
        %Dying mystical being -- Secret of Mana/Earthbound/FF6
        %Big accident -- FF9/Chrono Trigger
        %Accidentally unleash evil -- Secret of Mana/
        quest_origin = "[dying_mystical_being|big_accident|unleash_evil]".
        
initialize:
	create [1] quest_start.

% test.init
default location:.

initialization bar:
	let OwnerLastName = ownerChar's last_name,
		OwnerFirstName = ownerChar's first_name;
		
	select [1] character as ownerChar:
		is owner of barA,
        is drunkard,
		
	:where 
		age = [28:70],
		not employee of Location,
		not teetotaler;	
		
	create [1] location as barA:
		location_type = "bar",
		name = "[#OwnerLastName#|#OwnerFirstName#]'s [place|bar|tap|public house]".
		
default character: 
	last_name = "#lastNames#",
	first_name = "#firstNames#",
	age = [18:50],
	traits = [3:5] traits.
	
initialization family:
	let FamilyName = "#lastNames#",
	ParentATraits = [3:5] traits,
	ParentBTraits = [3:5] traits;
	
	select [1] character as parentA:
		age = [20:50],
		last_name = FamilyName,
		traits = ParentATraits,
		is married to parentB,
		is parent to child,
        is old,
        is angry = [2:4],
        likes parentB = [5],
		:where 
        is not parent, 
        is not married;
		
	select [1] character as parentB:
		age = [20:50],
		last_name = FamilyName,
		traits = ParentBTraits,
		is married to parentA,
		is parent to child
		:where is not parent, is not married;
	
	create [1:5] character as child:
		age = [1:15],
		last_name = FamilyName,
		traits = [1:2] traits + [0:2] ParentBTraits + [0:2] ParentATraits,
        is young,
		is child to parentA,
		is child to parentB.
	
initialize:
	create [1] character;
	create [3:5] family;
	create [1] bar.

% cult_ritual.init
default location:.

initialization church:
     create [1] location as narthex:
		location_type = "narthex";
        
     create [1] location as sanctuary:
		location_type = "sanctuary";
        
     create [1] location as altar:
		location_type = "altar";
        
     create [1] location as crypt:
		location_type = "crypt";
        
     create [1] location as nave:
		location_type = "nave";
        
     create [1] location as chapel:
		location_type = "chapel".  
        
initialize:
	create [1] church.

% cult.init
default location:.


initialization church:

	select [1] character as deacon:
		is deacon of church,
        is employee at church,
	:where 
		age = [60:80],
		not employee of Location,
		is traditionalist,	
		is believer;
		
	select [1:2] character as priest:
		is priest of church,
        is employee at church,
	:where 
		age = [30:70],
		not employee of Location;	
        
    create [1] location as church:
		location_type = "church",
        has deacon of deacon,
        has priest of priest,
		name = "[The [Temple|Church] of [Starry|Everlasting|Loving|Immortal] [Wisdom|Truth|Revelation]]".
		
initialization boarding_house:
    let FamilyName = "#lastNames#";

    select [1] character as owner:
        is owner of boarding_house,
        is employee at boarding_house,
        is resident at boarding_house,
        last_name = FamilyName,
        is married to housekeeper,
        likes housekeeper = [10],
    :where
        age = [50:70],
        not employee of Location,
        not resident of Location,
        not married;
        
    select [1] character as housekeeper:
        is housekeeper of boarding_house,
        is employee at boarding_house,
        is resident at boarding_house,
        last_name = FamilyName,
        is married to owner,
        likes owner = [10],
    :where
        age = [50:70],
        not employee of Location,
        not resident of Location,
        not married;
        
    select [1:2] character as boarder:
        is boarder at boarding_house,
        is resident of boarding_house,
    :where
        age = [22:30],
        not resident of Location;
        
    create [1] location as boarding_house:
        location_type = "boarding_house",
        has owner of owner,
        has housekeeper of housekeeper,
        has boarder of boarder,
        name = "[[#FamilyName#]'s [Boarding House|House]|[#FamilyName#] [House|Apartment]]".
        
initialization school:
    select [1] character as headmaster:
        is headmaster at school,
        is employee at school,
    :where
        age = [45:70],
        not employee at Location;
        
    create [6:8] character as student:
        is student at school,
        is employee at school,
        age = [6:16],
        is child;
        
    create [1] location as school:
        location_type = "school",
        has headmaster of headmaster,
        has student of student,
        name = "[Arkham|Barnard|East|Providence|ArlingtonWest Armitage|High Lane|Northside|Saltonstall|Pickman] [Public|Private] School".

initialization bookstore:
    let OwnerName = "#lastNames#",
        RandomName = "#lastNames#";
    
    select [1] character as owner:
        is owner of bookstore,
        is employee of bookstore,
        last_name = OwnerName,
    :where
        age = [35:80],
        not employee at Location;
        
    select [2:3] character as clerk:
        is clerk of bookstore,
        is employee of bookstore,
    :where
        age = [20:25],
        not employee at Location;
        
    select [1:3] character as regular:
        is regular of bookstore,
    :where
        age = [40:60];

    create [1] location as bookstore:
        location_type = "bookstore",
        has owner of owner,
        has clerk of clerk,
        has regular of regular,
        name = "[[[#OwnerName#]'s [Books|Book Store|Used Books|Rare Books|Rare Books & Maps]]|[[#RandomName#]'s [Books|Book Store|Used Books|Rare Books|Rare Books & Maps]]|[[Seekers|Wanderer's|Mindful] Books]]".
        
    %question: can I have sublocations? like a basement or back room?
        
initialization town_square:
    create [1] location as town_square:
        location_type = "town_square",
        name = "The Town Square".

        
initialization wharf:
    select [4] character as dockworker:
        is dockworker of wharf,
        is employee of wharf,
    :where
        age = [30:50],
        not employee at Location;
        
    select [4] character as fisherman:
        is fisherman of wharf,
        is employee of wharf,
    :where
        age = [30:70],
        not employee at Location;
    
    select [1] character as sailor:
        is sailor of wharf,
        is employee of wharf,
    :where
        not employee at Location;

    create [1] location as wharf:
        location_type = "wharf",
        has dockworker of dockworker,
        has fisherman of fisherman,
        has sailor of sailor,
        name = "The Wharf".
        
initialization warehouse:
    let OwnerName = "#lastNames#";
    
    select [6:8] character as worker:
        is worker of warehouse,
        is employee of warehouse,
    :where
        age = [18:50],
        not employee at Location;
        
    select [1] character as unionrep:
        %is worker at warehouse,
        is employee of warehouse,
        is unionrep of warehouse,
    :where
        age = [35:50],
        not employee at Location;
        
    select [1] character as foreman:
        is foreman of warehouse,
        is employee of warehouse,
    :where
        age = [35:50],
        not employee at Location;
        
    select [1] character as owner:
        is owner of warehouse,
        is employee of warehouse,
        last_name = OwnerName,
    :where
        not employee at Location;

    create [1] location as warehouse:
        location_type = "warehouse",
        has worker of worker,
        has unionrep of unionrep,
        has foreman of foreman,
        has owner of owner,
        name = "[[[#OwnerName#]'s [Warehouses|Factory|Properties|Depot|Stockpile|Imports]]|[[Easterly|Westside|Waterfront|Seaside] [Warehouses|Imports]]|[The Stockyard]]".
        
initialization bar:
    create [1] location as bar:
        location_type = "bar".
        
    %character: owner
    %character: server
    %character: patrons

default character: 
	last_name = "#lastNames#",
	first_name = "#firstNames#",
	age = [18:50],
    last_birthday = now - [0:365] day,
    day_of_prophecy = now + 25 year,
	traits = [1:2] traits.

initialize:
	create [1] character;
	create [1] church;
	create [1] school;
	create [1] boarding_house;
	create [1] bookstore;
	create [1] town_square;
	create [1] wharf;
	create [1] warehouse;
	create [1] bar.

% fantasy_setting.init


default character: 
	last_name = "#lastNames#",
	first_name = "#firstNames#",
	age = [18:80],
    last_birthday = now - [0:4] season,
	traits = [4:5] traits,
    skin = "[ivory|beige|honey|almond|amber|espresso|chocolate]",
    hair = "[white|grey|black|darkbrown|brown|lightbrown|blonde|bleached|rydia|purple|blue|red|orange|pink]",
    eye = "[green|brown|blue|orange|purple|red]",
    presentation = "[femme|butch]",
    pronouns = "[he/him|she/her|they/them]".
    
default location:.


%%%%%%%%/COMMON INITIALIZATIONS%%%%%%%%%%%%%%%%/        
initialization tavern:   
    let TavernLastName = tavern_owner's last_name,
        TavernFirstName = tavern_owner's first_name;
         
  
    select [1] character as tavern_owner:
        is owner of tavern,
        is boss of barkeep,
        is connected of tavern,
        hometown = Location,
        is drinker,
        is purpose,
        :where
        vocation = "tavern_owner",
        hometown ?= Location,
        age = [30:80];
    
    select [2] character as barkeep:
        is barkeep of tavern,
        is connected of tavern,
        is employee of tavern_owner,
        hometown = Location,
        is coworker of barkeep,
        is drinker,
        is purpose,
        :where
        vocation = "barkeep",
        hometown ?= Location,
        age = [20:40];
        
    select [5:6] character as regular:
        hometown = Location,
        is connected of tavern,
        is regular of tavern,
        is drinker
        :where
        hometown = Location,
        age = [20:80];
    
    create [1] location as tavern:
        location_type = "tavern",
        hometown = Location,
        name = "[The[ Old | ][Red|Blue|Green|Lusty|Sullen|Happy|Insatiable|Naughty|Poisoned|Reveling|Rusty|Silly|Broken|Golden|Laughing|Lonely|Prancing|Silver|Sign of the|Sleepy|Wistful] [Goblin|Boggart|Fae|Unicorn|Dragon|Wolf|Troll|Bear|Badger|Lion|Horse|Skunk|Aardvark|Civet|Dog|Eagle|Ghost|Imp|Jackal|Kobold|Manticore|Gnoll|Octopus|Parrot|Quail|Rusalka|Serpent|Tapir|Vulture|Wendigo|Yak|Zebra] Tavern in #Location#|[Old |][#TavernLastName#|#TavernFirstName#]'s Tavern in #Location#]",
        has owner of tavern_owner,
        has barkeep of barkeep,
        is purpose,
        has regular of regular.    
    
initialization  smith_shop:
    
    select [1] character as smithy:
        is smithy of blacksmith,
        is connected of blacksmith,
        is boss of smith_apprentice,
        hometown = Location,
        is purpose,
        :where
        vocation = "smithy",
        hometown ?= Location,
        age = [40:70];
    
    select [2] character as smith_apprentice:
        is smith_apprentice of blacksmith,
        is employee of smithy,
        is connected of blacksmith,
        hometown = Location,
        is coworker of smith_apprentice,
        is purpose,
        :where
        vocation = "smith_apprentice",
        hometown ?= Location,
        age = [18:30];
    
    create [1] location as blacksmith:
        location_type = "smith",
        name = "the blacksmith of #Location#",
        hometown = Location,
        has smithy of smithy,
        is purpose,
        has smith_apprentice of smith_apprentice.
initialization marketplace:

    select [3] character as vendor:
        is vendor of marketplace,
        is connected of marketplace,
        is scared of enforcer,
        is scared of racketeer,
        is victim of enforcer,
        is victim of racketeer,
        likes pickpocket = [-10:-1],
        likes enforcer = [-10:-1],
        likes racketeer = [-10:-1],
        hometown = Location,
        is coworker of vendor,
        is purpose,
        :where
        vocation = "vendor",
        hometown ?= Location,
        age = [30:60];
        
    select [1] character as enforcer:
        is enforcer of marketplace,
        is employee of racketeer,
        is connected of marketplace,
        hometown = Location,
        is criminal,
        is coworker of enforcer,
        is purpose,
        :where
        vocation = "enforcer",
        hometown ?= Location,
        age = [20:40];
    
    select [1] character as racketeer:
        is boss of enforcer,
        is connected of marketplace,
        hometown = Location,
        is criminal,
        is important,
        is purpose,
        :where
        vocation = "racketeer",
        hometown ?= Location,
        age = [40:60];
  
    select [1] character as pickpocket:
        is pickpocket of marketplace,
        is connected of marketplace,
        is thief,
        is criminal,
        hometown = Location,
        is purpose,
        :where
        vocation = "pickpocket",
        hometown ?= Location,
        age = [15:30];
    
    create [1] location as marketplace:
        hometown = Location,
        location_type = "marketplace",
        name = "the marketplace of #Location#",
        is purpose,
        has vendor of vendor,
        has regular of regular,
        has enforcer of enforcer,
        has pickpocket of pickpocket,
        has racketeer of racketeer.
        
        
        
    
initialization young_family:
    let FamilyName = first parent's last_name,
        FamilySkin = parent's skin,
        FamilyHair = parent's hair;
    
    select [2] character as parent:
        is parent of child,
        is spouse of parent,
        is related_to of child,
        is related_to of parent,
        is spouse,
        is connected of house,
        is resident of house,
        last_name = FamilyName,
        hometown = Location,
        :where
        hometown ?= Location,
        has a  vocation,
        is not parent, 
        is not spouse,
        age = [20:40];
    
    select [1:2] character as child:
        is child of parent,
        is sibling of child,
        is related_to of child,
        is related_to of parent,
        is connected of house,
        is resident of house,
        is spouse,
        last_name = FamilyName,
        hometown = Location,
        skin = FamilySkin,
        hair = FamilyHair,
        is purpose,
        :where
        hometown ?= Location,
        is not child, 
        age = [1:10];
        
    create [1] location as house:
        hometown = Location,
        location_type = "house",
        name = "the #FamilyName# house in #Location#",
        is purpose,
        has resident of child,
        has resident of parent.
      
    
initialization old_family:
    let FamilyName = first parent's last_name,
        FamilySkin = parent's skin,
        FamilyHair = parent's hair;
    
    select [2] character as parent:
        is parent of child,
        is spouse of parent,
        is related_to of child,
        is related_to of parent,
        is connected of house,
        is resident of house,
        last_name = FamilyName,
        hometown = Location,
        :where
        has a vocation,
        hometown ?= Location,
        is not parent, 
        is not spouse,
        age = [50:70];
    
    select [1:2] character as child:
        is child of parent,
        is sibling of child,
        is related_to of child,
        is related_to of parent,
        is connected of house,
        is resident of house,
        last_name = FamilyName,
        skin = FamilySkin,
        hair = FamilyHair,
        hometown = Location,
        :where
        has a  vocation,
        hometown ?= Location,
        is not child,
        age = [20:40];
        
    create [1] location as house:
        hometown = Location,
        location_type = "house",
        name = "the #FamilyName# house in #Location#",
        is purpose,
        has resident of child,
        has resident of parent.

%%%%%%%%%%%/ BIG CITIES %%%%%%%%%%%

initialization royal_country:
    let Location = "Baltissia",
      Royal_name = "#lastNames#";
    
    select [1] character as monarch:
        is monarch,
        ruler = Location,
        hometown = Location,
        last_name = Royal_name,
        is noteworthy,
        is royalty,
        is spouse,
        is connected of throne_room,
        is spouse to monarch_spouse,
        is parent to monarchlings,
        is important,
        is purpose,
        :where
        vocation = "monarch",
        hometown ?= Location,
        age = [30:60];
    
    select [1] character as monarch_spouse:
        hometown = Location,
        is noteworthy,
        is royalty,
        is connected of throne_room,
        is spouse to monarch,
        is spouse,
        last_name = Royal_name,
        is parent to monarchlings,
        is important,
        is purpose,
        :where
        vocation = "monarch_spouse",
        hometown ?= Location,
        age = [30:60];
        
    select [2:3] character as monarchlings:
        hometown = Location,
        is noteworthy,
        is royalty,
        last_name = Royal_name,
        is connected of castle_library,
        is connected of throne_room,
        is child to monarch,
        is sibling to monarchlings,
        is important,
        is purpose,
        :where
        vocation = "monarchling",
        hometown ?= Location,
        age = [1:10];
        
    select [1] character as librarian:
        is librarian of castle_library,
        is fealty to monarch,
        is connected of castle_library,
        hometown = Location,
        is purpose,
        :where
        vocation = "librarian",
        hometown ?= Location,
        age = [20:60],
        is scholar;
    
    select [2] character as royal_tutor:
        is tutor of castle_library,
        is connected of castle_library,
        is tutor to monarchlings,
        hometown = Location,
        is fealty to monarch,
        is purpose,
        :where
        vocation = "royal_tutor",
        hometown ?= Location,
        age = [20:60],
        is scholar;
    
    select [1] character as chancellor:
        is chancellor to monarch,
        is noteworthy,
        is fealty to monarch,
        is connected of throne_room,
        hometown = Location,
        is purpose,
        :where
        vocation = "chancellor",
        hometown ?= Location,
        age = [20:60],
        is scholar;
        
    create [1] location as throne_room:
        name = "Throne Room of #Location#",
        location_type = "throne_room",
        hometown = Location,
        is purpose,
        has monarch of monarch,
        has royalty of monarchling,
        has royalty of monarch_spouse,
        has chancellor of chancellor,
        has knight of knight;
        
   
    create [1] location as castle_library:
        name = "Royal Library of #Location#",
        location_type = "library",
        hometown = Location,
        is purpose,
        has librarian of librarian,
        has tutor of royal_tutor;
    
    
    select [1] character as chef:  
        is chef of castle_kitchen,
        is connected of castle_kitchen,
        is boss of kitchen_worker,
        is fealty to monarch,
        hometown = Location,
        is purpose,
        :where
        vocation = "chef",
        hometown ?= Location,
        age = [20:50];
    
    select [2] character as kitchen_worker:
        is employee to chef,
        is connected of castle_kitchen,
        is fealty to monarch,
        hometown = Location,
        is worker of castle_kitchen,
        is coworker of kitchen_worker,
        is purpose,
        :where
        vocation = "kitchen_worker",
        hometown ?= Location,
        age = [15:30];
    
    create [1] location as castle_kitchen:
        name = "castle kitchen of #Location#",
        location_type = "kitchen",
        hometown = Location,
        is purpose,
        has chef of chef,
        has worker of kitchen_worker,
        has guest of monarch,
        has guest of monarch_spouse,
        has guest of monarchlings;
    
    select [4] character as guard:
        is fealty to monarch,
        hometown = Location,
        is guard of barracks,
        is connected of barracks,
        is coworker of guard,
        is coworker of squire,
        is employee of knight,
        is purpose,
        :where
        vocation = "guard",
        hometown ?= Location,
        age = [20:50];
     
    select [3] character as knight:
        is fealty to monarch,
        hometown = Location,
        is knight of barracks,
        is connected of barracks,
        is boss of guard,
        is boss of squire,
        is purpose,
        :where
        vocation = "knight",
        hometown ?= Location,
        age = [20:60];
    
    
    select [2] character as squire:
        is fealty to monarch,
        hometown = Location,
        is squire of  barracks,
        is connected of  barracks,
        is guard to prisoner,
        is coworker of guard,
        is employee of knight,
        is purpose,
        :where
        vocation = "knight",
        hometown ?= Location,
        age = [14:19];
    
    
    create [1] location as barracks:
        name = "the barracks of #Location# castle",
        location_type = "barracks",
        hometown = Location,
        is purpose,
        has knight of knight,
        has guard of guard,
        has squire of squire;
    
    create [1] location as town:
        name = "around #Location#",
        location_type = "town",
        is purpose,
        hometown = Location;
        
    create [1] old_family;
    create [1] young_family.
    


initialization mining_town:
    let Location = "Dolbrae";
    
    create [1] location as town:
        name = "around #Location#",
        location_type = "town",
        is purpose,
        hometown = Location;
    
    select [1] character as foreman:
        is foreman of mine,
        is boss of miner,
        is connected of mine,
        hometown = Location,
        is purpose,
        is important,
        :where
        vocation = "foreman",
        hometown ?= Location,
        age = [30:60];
    
    select [4] character as miner:
        is miner of mine,
        is connected of mine,
        is worker of mine,
        is employee of foreman,
        hometown = Location,
        is coworker of miner,
        is purpose,
        :where
        vocation = "miner",
        hometown ?= Location,
        age = [18:60];
    
    create [1] location as mine:
        name = "the mines of #Location#",
        location_type = "mine",
        hometown = Location,
        is purpose,
        has foreman of foreman,
        has miner of miner
        ;     
        
    create [1] smith_shop;
    
    
    create [1] old_family;
    create [1] young_family;
    create [1] tavern.

initialization port_town:
    let Location = "Ebrook";
    
    
    create [1] location as town:
        name = "around #Location#",
        location_type = "town",
        is purpose,
        hometown = Location;
        
    select [1] character as shipwright_owner:
        is owner of shipyard,
        is noteworthy,
        is boss of engineer,
        is connected of shipyard,
        is boss of ship_builder,
        hometown = Location,
        is purpose,
        is important,
        :where
        vocation = "shipwright_owner",
        hometown ?= Location,
        age = [40:70];
        
    select [2] character as engineer:
        is engineer of shipyard,
        is employee of shipwright_owner,
        is boss of ship_builder,
        is connected of shipyard,
        hometown = Location,
        is purpose,
        :where
        vocation = "engineer",
        hometown ?= Location,
        age = [30:60];
        
    select [3] character as ship_builder:
        is ship_builder of shipyard,
        is employee of shipwright_owner,
        is employee of engineer,
        is connected of shipyard,
        hometown = Location,
        is purpose,
        is coworker of ship_builder,
        :where
        vocation = "ship_builder",
        hometown ?= Location,
        age = [20:50];
    
    create [1] location as shipyard:
        hometown = Location,
        location_type = "shipyard",
        name = "the shipyard of #Location#",
        is purpose,
        has engineer of engineer,
        has owner of shipwright_owner,
        has ship_builder of ship_builder;
    
    
    select [1] character as foreman:
        is shipping_foreman of docks,
        is boss of dockworker,
        is connected of docks,
        is purpose,
        hometown = Location,
        :where
        vocation = "foreman",
        hometown ?= Location,
        age = [30:60];
    
    
    select [3] character as dockworker:
        is dockworker of docks,
        is employee of foreman,
        hometown = Location,
        is purpose,
        is connected of docks,
        is coworker of dockworker,
        :where
        vocation = "dockworker",
        hometown ?= Location,
        age = [18:50];
    
    select [1] character as prostitute:
        is prostitute of docks,
        hometown = Location,
        is purpose,
        is connected of docks,
        :where
        vocation = "prostitute",
        hometown ?= Location,
        age = [21:35];
        
    select [2] character as fisher:
        is fisher of docks,
        hometown = Location,
        is purpose,
        is connected of docks,
        :where
        hometown ?= Location,
        age = [40:70];
        
    create [1] location as docks:
        hometown = Location,
        location_type = "docks",
        name = "the docks of #Location#",
        is purpose,
        has shipping_foreman of foreman,
        has dockworker of dockworker,
        has prostitute of prostitute,
        has fisher of fisher;
    
    
    select [1] character as captain:
        is captain of boat,
        is boss of sailor,
        is noteworthy,
        is connected of boat,
        is mariner,
        is purpose,
        is important,
        hometown = Location,
        :where
        is not vocation,
        vocation = "captain",
        hometown ?= Location,
        age = [30:60];
    
    
    select [4] character as sailor:
        is sailor of boat,
        is connected of boat,
        is employee of captain,
        hometown = Location,
        is purpose,
        is mariner,
        is coworker of sailor,
        :where
        vocation = "sailor",
        hometown ?= Location,
        age = [18:50];
        
    create [1] location as boat:
        hometown = Location,
        location_type = "boat",
        is purpose,
        name = "a boat docked in the port of #Location#",
        has captain of captain,
        has sailor of sailor;
    
    
    create [1] old_family;
    create [1] young_family;
    create [1] tavern.
    
        
initialization thieves_town:
    let Location = "Figliz";
    
    create [1] location as town:
        name = "around #Location#",
        is purpose,
        location_type = "town",
        hometown = Location;
        
        
    %Think TNMT the movie -- it's like an abandoned warehouse with a bunch of teenage thieves 
    create [1] location as thieves_den:
        hometown = Location,
        location_type = "thieves_den",
        name = "the den of the thieves guild of #Location#",
        is purpose,
        has master_thief of master_thief,
        has spy_master of spy_master,
        has spy of spy,
        has thief of thief;
        
    select [7] character as thief:
        is thief,
        is criminal,
        is purpose,
        is connected of thieves_den,
        is employee of master_thief,
        is thief of thieves_den,
        hometown = Location,
        is coworker of thief,
        :where
        vocation = "thief",
        hometown ?= Location,
        age = [12:25];
    
    select [3] character as spy:
        is criminal,
        is employee of spy_master,
        is spy of thieves_den,
        is purpose,
        is connected of thieves_den,
        hometown = Location,
        is coworker of spy,
        :where
        vocation = "spy",
        hometown ?= Location,
        age = [20:60];   
        
    select [1] character as master_thief:
        is thief,
        is noteworthy,
        is criminal,
        is important,
        is connected of thieves_den,
        is boss of thief,
        is boss of spy_master,
        is boss of spy,
        is purpose,
        is master_thief of thieves_den,
        hometown = Location,
        :where
        vocation = "master_thief",
        hometown ?= Location,
        age = [30:60];
    
    select [1] character as spy_master:
        is thief,
        is noteworthy,
        is criminal,
        is connected of thieves_den,
        is spy_master of thieves_den,
        is boss of spy,
        is spy_master of thieves_den,
        is purpose,
        hometown = Location,
        :where
        vocation = "spy_master",
        hometown ?= Location,
        age = [30:60];
    
    create [1] tavern.
    
initialization ancient_city:
    let Location = "Garitrea";


    create [1] location as town:
        name = "around #Location#",
        is purpose,
        location_type = "town",
        hometown = Location;
        
    select [2] character as treasure_hunter:
        is treasure_hunter of ruins,
        is noteworthy,
        is rival of treasure_hunter,
        is connected of ruins,
        hometown = Location,
        is purpose,
        :where
        vocation = "treasure_hunter",
        hometown ?= Location,
        age = [20:50];
       
    select [2] character as archaelogist:
        is archaelogist of ruins,
        is noteworthy,
        is rival of treasure_hunter,
        is connected of ruins,
        hometown = Location,
        is purpose,
        :where
        vocation = "archaelogist",
        hometown ?= Location,
        age = [20:50];
        
    create [1] location as ruins:
        location_type = "ruins",
        location_name = "the ruins of #Location#",
        is purpose,
        has treasure_hunter of treasure_hunter,
        has archaelogist of archaelogist,
        hometown = Location;
    
    select [6] character as bard:
        is bard of ruins,
        is connected of ruins,
        is coworker of bard,
        hometown = Location,
        is purpose,
        :where
        vocation = "bard",
        hometown ?= Location,
        age = [20:60];
      
    select [10:20] character as tourist:
        is tourist of amphitheatre
        :where
        age = [20:80];
        
    create [1] location as amphitheatre:
        location_type = "amphitheatre",
        location_name = "the amphitheatre of #Location#",
        is purpose,
        has bard of bard,
        has tourist of tourist,
        hometown = Location;
        
    
    
    create [1] old_family;
    
    create [1] young_family;
    create [1] tavern.
 
initialization merchant_city:
    let Location = "Melamb",
        Baron = baron's last_name;
    
    
    create [1] location as town:
        name = "around #Location#",
        location_type = "town",
        is purpose,
        hometown = Location;
    
    select [1] character as baron:
        is owner of manor_library,
        is noteworthy,
        is owner of manor_ballroom,
        is owner of manor_garden,
        is owner of manor_gallery,
        is connected of manor_library,
        is connected of manor_ballroom,
        is connected of manor_garden,
        is connected of manor_gallery,
        is spouse of baron_spouse,
        is parent of baronling,
        is patron of auction_house,
        is patron of opera_house,
        is important,
        is purpose,
        last_name = Baron,
        hometown = Location,
        :where
        vocation = "baron",
        hometown ?= Location,
        is rich,
        age = [50:70];
        
    select [1] character as baron_spouse:
        is guest of manor_library,
        is noteworthy,
        is guest of manor_ballroom,
        is guest of manor_garden,
        is guest of manor_gallery,
        is connected of manor_library,
        is connected of manor_ballroom,
        is connected of manor_garden,
        is connected of manor_gallery,
        is patron of auction_house,
        is patron of opera_house,
        is spouse of baron,
        is parent of baronling,
        is important,
        is purpose,
        hometown = Location,
        last_name = Baron,
        :where
        vocation = "baron_spouse",
        hometown ?= Location,
        is rich,
        age = [20:25];
        
    select [2] character as baronling:
        is guest of manor_library,
        is noteworthy,
        is guest of manor_ballroom,
        is guest of manor_garden,
        is guest of manor_gallery,
        is connected of manor_library,
        is connected of manor_ballroom,
        is connected of manor_garden,
        is connected of manor_gallery,
        is patron of auction_house,
        is patron of opera_house,
        is child of baron,
        is child of baronling,
        is important,
        is purpose,
        last_name = Baron,
        hometown = Location,
        :where
        vocation = "baronling",
        hometown ?= Location,
        is rich,
        age = [2:20];
    
    select [5:7] character as hanger_on:
        is guest of manor_library,
        is guest of manor_ballroom,
        is guest of manor_garden,
        is guest of manor_gallery,
        is connected of manor_library,
        is connected of manor_ballroom,
        is connected of manor_garden,
        is connected of manor_gallery,
        is connected of auction_house,
        is connected of opera_house,
        is patron of auction_house,
        is patron of opera_house,
        is sycophant of baron,
        is sycophant of baronling,
        is sycophant of baron_spouse,
        is purpose,
        hometown = Location,
        :where
        vocation = "hanger_on",
        hometown ?= Location,
        is rich,
        age = [20:60];
      
        
    select [1] character as majordomo:
        is boss of butler,
        is boss of librarian,
        is boss of tutor,
        is boss of chef,
        is boss of kitchen_worker,
        is boss of gardener,
        is boss of servant,
        is servant of baron,
        is connected of manor_library,
        is connected of manor_ballroom,
        is connected of manor_garden,
        is connected of manor_gallery,
        is connected of manor_kitchen,
        hometown = Location,
        is purpose,
        :where
        vocation = "majordomo",
        hometown ?= Location,
        age = [50:75];   
           
        
    select [1] character as butler:
        is employee of majordomo,
        is boss of librarian,
        is boss of tutor,
        is boss of chef,
        is boss of kitchen_worker,
        is boss of gardener,
        is boss of servant,
        is servant of baron,
        is connected of manor_library,
        is connected of manor_ballroom,
        is connected of manor_garden,
        is connected of manor_gallery,
        is connected of manor_kitchen,
        hometown = Location,
        is purpose,
        :where
        vocation = "butler",
        hometown ?= Location,
        age = [30:60];   
        
          
    select [2] character as servant:
        is employee of majordomo,
        is employee of butler,
        is servant of baron,
        is connected of manor_library,
        is connected of manor_ballroom,
        is connected of manor_garden,
        is connected of manor_gallery,
        is connected of manor_kitchen,
        hometown = Location,
        is purpose,
        :where
        vocation = "servant",
        hometown ?= Location,
        age = [20:50];   
        
    select [1] character as librarian:
        is librarian of manor_library,
        is employee of majordomo,
        is employee of butler,
        is connected of manor_library,
        is servant of baron,
        hometown = Location,
        is purpose,
        :where
        vocation = "librarian",
        hometown ?= Location,
        age = [20:60],
        is scholar;
    
    select [1] character as tutor:
        is tutor of manor_library,
        is connected of manor_library,
        is tutor to baronlings,
        is employee of majordomo,
        is employee of butler,
        is servant of baron,
        is purpose,
        hometown = Location,
        :where
        vocation = "tutor",
        hometown ?= Location,
        age = [20:60],
        is scholar;
    
   
    create [1] location as manor_library:
        name = "Library of #Baron# manor",
        location_type = "library",
        hometown = Location,
        is purpose,
        has librarian of librarian,
        has tutor of tutor;
    
    
    select [1] character as chef:  
        is chef of manor_kitchen,
        is boss of kitchen_worker,
        is connected of manor_kitchen,
        is employee of majordomo,
        is employee of butler,
        is servant of baron,
        hometown = Location,
        is purpose,
        :where
        vocation = "chef",
        hometown ?= Location,
        age = [20:50];
    
    select [2] character as kitchen_worker:
        is employee to chef,
        is connected of manor_kitchen,
        is employee of majordomo,
        is employee of butler,
        is servant of baron,
        hometown = Location,
        is worker of manor_kitchen,
        is coworker of kitchen_worker,
        is purpose,
        :where
        vocation = "kitchen_worker",
        hometown ?= Location,
        age = [15:30];
        
    select [2] character as gardener:
        hometown = Location,
        is worker of manor_garden,
        is connected of manor_garden,
        is coworker of gardener,
        is employee of majordomo,
        is employee of butler,
        is servant of baron,
        is purpose,
        :where
        vocation = "gardener",
        hometown ?= Location,
        age = [20:50];
    
    
    create [1] location as manor_kitchen:
        name = "the  kitchen of #Baron# manor",
        location_type = "kitchen",
        hometown = Location,
        is purpose,
        has chef of chef,
        has worker of kitchen_worker,
        has owner of baron,
        has guest of baron_spouse,
        has guest of baronlings,
        has guest of hanger_on;
    
    
    
    create [1] location as manor_garden:
        name = "the  gardens of #Baron# manor",
        location_type = "garden",
        hometown = Location,
        is purpose,
        has gardener of gardener,
        has owner of baron,
        has guest of baron_spouse,
        has guest of baronlings,
        has guest of hanger_on;
        
    create [1] location as manor_ballroom:
        name = "the  ballroom of #Baron# manor",
        location_type = "ballroom",
        hometown = Location,
        is purpose,
        has butler of butler,
        has owner of baron,
        has guest of baron_spouse,
        has guest of baronlings,
        has guest of hanger_on;
        
    select [1] character as artist:
        is artist of manor_gallery,
        is noteworthy,
        is connected of manor_gallery,
        hometown = Location,
        is employee of majordomo,
        is employee of butler,
        is servant of baron,
        is purpose,
        :where
        vocation = "artist",
        hometown ?= Location,
        age = [20:50];
        
    create [1] location as manor_gallery:
        name = "the  gallery of #Baron# manor",
        location_type = "ballroom",
        hometown = Location,
        is purpose,
        has majordomo of majordomo,
        has artist of artist,
        has owner of baron,
        has guest of baron_spouse,
        has guest of baronlings,
        has guest of hanger_on;
    
    select [1] character as auctioneer:
        is auctioneer of auction_house,
        is connected of auction_house,
        is boss of curator,
        is noteworthy,
        is important,
        is purpose,
        :where
        vocation = "auctioneer",
        hometown ?= Location,
        age = [40:60];
    
    select [1] character as curator:
        is curator of auction_house,
        is connected of auction_house,
        is employee of auctioneer,
        is coworker of curator,
        is purpose,
        :where
        vocation = "curator",
        hometown ?= Location,
        age = [20:70];
    
    create [1] location as auction_house:
        name = "the  auction house of #Location#",
        location_type = "auction_house",
        is purpose,
        has auctioneer of auctioneer,
        hometown = Location,
        has curator of curator;
        
    select [1] character as impresario:
        is boss of bard,
        is boss of diva,
        is noteworthy,
        is connected of opera_house,
        is impresario of opera_house,
        is important,
        is purpose,
        :where
        vocation = "impresario",
        hometown ?= Location,
        age = [40:70];
    
    select [4] character as bard:
        is bard of opera_house,
        is employee of impresario,
        is connected of opera_house,
        is coworker of bard,
        is employee of diva,
        is purpose,
        :where
        vocation = "bard",
        hometown ?= Location,
        age = [20:70];
        
    select [2] character as diva:
        is diva of opera_house,
        is noteworthy,
        is connected of opera_house,
        is employee of impresario,
        is coworker of diva,
        is boss of  bard,
        is rival of diva,
        is purpose,
        :where
        vocation = "diva",
        hometown ?= Location,
        age = [20:70];
    
    select [10:20] character as tourist:
        is tourist of opera_house
        :where
        age = [20:80];
        
    create [1] location as opera_house:
        name = "the  opera house of #Location#",
        location_type = "opera_house",
        hometown = Location,
        is purpose,
        has bard of bard,
        has impresario of impresario,
        has diva of diva,
        has tourist of tourist;
    
    create [1] old_family; 
    create [1] young_family;
    create [1] tavern
    .

initialization scholar_town:
    let Location = "Yarmecia",
        Academy = "[Gran |Grand |]#Location# Academy";
    
    
    create [1] location as town:
        name = "around #Location#",
        location_type = "town",
        is purpose,
        hometown = Location;
     
    %librarian & researcher & student
    select [1] character as librarian:
        is librarian of library,
        is connected of library,
        hometown = Location,
        is purpose,
        :where
        vocation = "librarian",
        hometown ?= Location,
        age = [20:60],
        is scholar;
    
    select [2] character as researcher:
        is researcher of library,
        is connected of library,
        hometown = Location,
        is purpose,
        :where
        vocation = "researcher",
        hometown ?= Location,
        age = [20:60],
        is scholar;
    
    select [7] character as student:
        is student of library,
        is student of classroom,
        is connected of library,
        is connected of classroom,
        is purpose,
        hometown = Location,
        :where
        vocation = "student",
        hometown ?= Location,
        age = [18:25],
        is scholar;
    
   
    create [1] location as library:
        name = "Library of [Gran |Grand |]#Location# Academy",
        location_type = "library",
        hometown = Location,
        is purpose,
        has librarian of librarian,
        has researcher of researcher,
        has student of student;
    
    select [2] character as professor:
        is professor of classroom,
        is noteworthy,
        is connected of classroom,
        is purpose,
        hometown = Location,
        :where
        vocation = "professor",
        hometown ?= Location,
        age = [30:65],
        is scholar;
    
    %student & professor
    create [1] location as classroom:
        name = "A classroom of #Academy#",
        location_type = "classroom",
        hometown = Location,
        is purpose,
        has professor of professor,
        has dean of dean,
        has student of student;
 
    
    select [1] character as dean:
        hometown = Location,
        is noteworthy,
        is important,
        is purpose,
        :where
        vocation = "dean",
        hometown ?= Location,
        age = [30:65],
        is scholar;
    
    create [1] location as quad:
        name = "The quad of #Academy#",
        location_type = "quad",
        hometown = Location,
        is purpose,
        has visitor of dean,
        has visitor of professor,
        has visitor of student,
        has visitor of librarian
    ;
    
    
    create [1] old_family; 
    create [1] young_family;
    create [1] tavern
    .
initialization magic_town:
    let Location = "Tenepo";
    
    
    create [1] location as town:
        name = "around #Location#",
        location_type = "town",
        is purpose,
        hometown = Location;
    
    select [1] character as high_priest:
        is high_priest of temple,
        is connected of temple,
        hometown = Location,
        is noteworthy,
        is boss of priest,
        is boss of monk,
        is important,
        is purpose,
        :where
        vocation = "high_priest",
        hometown ?= Location,
        age = [40:70],
        is believer;

    select [3] character as priest:
        is priest of temple,
        is connected of temple,
        hometown = Location,
        is purpose,
        is employee of high_priest,
        :where
        vocation = "priest",
        hometown ?= Location,
        age = [30:60],
        is believer;
        
    select [5] character as monk:
        is monk of temple,
        is connected of temple,
        hometown = Location,
        is purpose,
        is employee of high_priest,
        :where
        vocation = "monk",
        hometown ?= Location,
        age = [18:80],
        is believer;
    
    select [10:20] character as follower:
        is follower of temple,
        is connected of temple,
        :where 
        is believer;
    
    create [1] location as temple:
        location_type = "temple",
        name = "The Temple of #Location#",
        hometown = Location,
        is purpose,
        has high_priest of high_priest,
        has priest of priest,
        has monk of monk,
        has follower of follower
    ;
    
    create [1] old_family; 
    create [1] young_family
    .
    
initialization townie_town:
    let Location = "Jundacio",
    ElderName = first town_elder's last_name,
    ElderSkin = town_elder's skin,
    ElderHair = town_elder's hair;
    
    
    create [1] location as town:
        location_type = "town",
        hometown = Location,
        is purpose,
        name = "around #Location#",
        has person of town_elder,
        has person of parent,
        has person of child;
    
    select [1] character as town_elder:
        is parent of child,
        is spouse of parent,
        is related_to of child,
        is related_to of parent,
        is connected of elders_house,
        is resident of elders_house,
        is elder of elders_house,
        is noteworthy,
        is connected of elders_house,
        is connected of town,
        is purpose,
        is boss to chef,
        hometown = Location,
        is important,
        :where
        vocation = "town_elder",
        hometown ?= Location,
        is not parent, 
        is not spouse,
        age = [50:80];
        
    
    select [1] character as parent:
        is parent of child,
        is spouse of town_elder,
        is related_to of child,
        is related_to of town_elder,
        is connected of elders_house,
        is resident of elders_house,
        last_name = ElderName,
        hometown = Location,
        is connected of town,
        :where
        has a vocation,
        hometown ?= Location,
        is not parent, 
        is not spouse,
        age = [50:70];
    
    select [1:3] character as child:
        is child of parent,
        is child of town_elder,
        is sibling of child,
        is related_to of child,
        is related_to of parent,
        is related_to of town_elder,
        is connected of elders_house,
        is connected of town,
        is resident of elders_house,
        last_name = ElderName,
        skin = ElderSkin,
        hair = ElderHair,
        hometown = Location,
        :where
        has a vocation,
        hometown ?= Location,
        is not child,
        age = [20:40];
    
    select [1] character as chef:  
        is chef of elders_house,
        is connected of elders_house,
        is boss of kitchen_worker,
        is employee of elder,
        hometown = Location,
        is purpose,
        :where
        vocation = "chef",
        hometown ?= Location,
        age = [20:50];
    
    select [1] character as kitchen_worker:
        is employee to chef,
        is connected of elders_house,
        hometown = Location,
        is worker of elders_house,
        is purpose,
        :where
        vocation = "kitchen_worker",
        hometown ?= Location,
        age = [15:30];
    
    
          
    select [2] character as servant:
        is employee of elder,
        is servant of elder,
        is connected of elders_house,
        hometown = Location,
        is purpose,
        :where
        vocation = "servant",
        hometown ?= Location,
        age = [20:50];   
    
    create [1] location as elders_house:
        location_type = "elders_house",
        hometown = Location,
        is purpose,
        name = "The elder of #Location#'s house",
        has elder of town_elder;
        
    create [1] smith_shop;
    create [1] marketplace;
    create [1] old_family; 
    create [1] young_family;
    create [1] tavern
    .

initialization chosen_ones:
    select [7] character as chosen_one:
        is chosen_one,
        is connected_to of chosen_one,
        specialty = "[physical|magical|wildcard]",
        :where
        has a purpose,
        age = [10:70].
initialization fated_focus:

    select [1] character as fated_focus:
        if fated_focus,
        :where 
        is chosen_one.
initialize:
	create [200] character;
    create [1] royal_country;
    create [1] mining_town;
    create [1] port_town;
    create [1] thieves_town;
    create [1] ancient_city;
    create [1] merchant_city;
    create [1] scholar_town;
    create [1] magic_town;
    create [1] townie_town;
    create [1] chosen_ones;
    create [1] fated_focus.

filter relationships == 0.
filter status purpose == 0.
%MAGIC TOWN

%TOWNIE TOWN

%locations
%blacksmith
%shrine
%monastery
%tavern
%inn
%market
%%mansion/manor
%auction_house
%castle
%stables
%library
%gym -- FF7?
%theater/opera house
%baths
%armory
%university
%docks
%fishery
%

% kismet_CultTown.init

default location.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%  FAMILIES
%%%%%%%%%%%%%%%%%%%%%%%%%%%%
initialization family_couple_young:
    let FamilyName = "#lastNames#";
    
    select [1] character as spouseA:
        last_name = FamilyName,
        is married to spouseB,
        is family with spouseB,
    :where
        age = [22:30],
        not married;
        
    select [1] character as spouseB:
        last_name = FamilyName,
        is married to spouseA,
        is family with spouseA,
    :where
        age = [22:30],
        not married.
        
initialization family_couple_midlife:
    let FamilyName = "#lastNames#";
    
    select [1] character as spouseA:
        last_name = FamilyName,
        is married to spouseB,
        is family with spouseB,
    :where
        age = [30:45],
        not married;
        
    select [1] character as spouseB:
        last_name = FamilyName,
        is married to spouseA,
        is family with spouseA,
    :where
        age = [30:45],
        not married.
        
initialization family_couple_old:
    let FamilyName = "#lastNames#";
    
    select [1] character as spouseA:
        last_name = FamilyName,
        is married to spouseB,
        is family with spouseB,
    :where
        age = [45:60],
        not married;
        
    select [1] character as spouseB:
        last_name = FamilyName,
        is married to spouseA,
        is family with spouseA,
    :where
        age = [45:60],
        not married.
        
initialization family_couple_elderly:
    let FamilyName = "#lastNames#";
    
    select [1] character as spouseA:
        last_name = FamilyName,
        is married to spouseB,
        is family with spouseB,
    :where
        age = [60:75],
        not married;
        
    select [1] character as spouseB:
        last_name = FamilyName,
        is married to spouseA,
        is family with spouseA,
    :where
        age = [60:75],
        not married.


initialization family_young:
    let FamilyName = "#lastNames#";
    
    select [1] character as spouseA:
        last_name = FamilyName,
        is married to spouseB,
        is family with spouseB,
        is parent to child,
        is family with child,
    :where
        age = [22:30],
        not married,
        not parent;
        
    select [1] character as spouseB:
        last_name = FamilyName,
        is married to spouseA,
        is family with spouseA,
        is parent to child,
        is family with child,
    :where
        age = [22:30],
        not married,
        not parent;
        
    select [1:4] character as child:
        last_name = FamilyName,
        is family with spouseA,
        is family with spouseB,
        is child to spouseA,
        is child to spouseB,
    :where
        age = [1:5],
        not child.
        
initialization family_midlife:
    let FamilyName = "#lastNames#";
    
    select [1] character as spouseA:
        last_name = FamilyName,
        is married to spouseB,
        is family with spouseB,
        is parent to child,
        is family with child,
    :where
        age = [30:45],
        not married,
        not parent;
        
    select [1] character as spouseB:
        last_name = FamilyName,
        is married to spouseA,
        is family with spouseA,
        is parent to child,
        is family with child,
    :where
        age = [30:45],
        not married,
        not parent;
        
    select [1:5] character as child:
        last_name = FamilyName,
        is family with spouseA,
        is family with spouseB,
        is child to spouseA,
        is child to spouseB,
    :where
        age = [4:14],
        not child.
        
initialization family_old:
    let FamilyName = "#lastNames#";
    
    select [1] character as spouseA:
        last_name = FamilyName,
        is married to spouseB,
        is family with spouseB,
        is parent to child,
        is family with child,
    :where
        age = [45:60],
        not married,
        not parent;
        
    select [1] character as spouseB:
        last_name = FamilyName,
        is married to spouseA,
        is family with spouseA,
        is parent to child,
        is family with child,
    :where
        age = [45:60],
        not married,
        not parent;
        
    select [1:5] character as child:
        last_name = FamilyName,
        is family with spouseA,
        is family with spouseB,
        is child to spouseA,
        is child to spouseB,
    :where
        age = [15:25],
        not child.
        
initialization family_elderly:
    let FamilyName = "#lastNames#";
    
    select [1] character as spouseA:
        last_name = FamilyName,
        is married to spouseB,
        is family with spouseB,
        is parent to child,
        is family with child,
    :where
        age = [60:75],
        not married,
        not parent;
        
    select [1] character as spouseB:
        last_name = FamilyName,
        is married to spouseA,
        is family with spouseA,
        is parent to child,
        is family with child,
    :where
        age = [60:75],
        not married,
        not parent;
        
    select [1:5] character as child:
        last_name = FamilyName,
        is family with spouseA,
        is family with spouseB,
        is child to spouseA,
        is child to spouseB,
    :where
        age = [30:40],
        not child.


initialization church:

	select [1] character as deacon:
		is deacon of church,
        is employee at church,
        is resident of church
	:where 
		age = [60:80],
		not employee of Location,
		is traditionalist,	
		is believer;
		
	select [1:2] character as priest:
		is priest of church,
        is employee at church
	:where 
		age = [30:70],
		not employee of Location,
		not rich,
		is believer;
        
    create [1] location as church:
		location_type = "church",
        has deacon of deacon,
        has priest of priest,
		name = "[The [Temple|Church] of [Starry|Everlasting|Loving|Immortal] [Wisdom|Truth|Revelation]]".
		
initialization boarding_house:
    let FamilyName = "#lastNames#";

    select [1] character as owner:
        is owner of boarding_house,
        is employee at boarding_house,
        is resident at boarding_house,
        last_name = FamilyName,
        is married to housekeeper
        %likes housekeeper = [10],
    :where
        age = [50:70],
        not employee of Location,
        not resident of Location,
        not married,
        not rich;
        
    select [1] character as housekeeper:
        is housekeeper of boarding_house,
        is employee at boarding_house,
        is resident at boarding_house,
        last_name = FamilyName,
        is married to owner
        %likes owner = [10],
    :where
        age = [50:70],
        not employee of Location,
        not resident of Location,
        not married,
        not rich;
        
    select [1:2] character as boarder:
        is boarder at boarding_house,
        is resident of boarding_house
    :where
        age = [22:30],
        not resident of Location,
        is poor,
        not married,
        not parent,
        not child;
        
    create [1] location as boarding_house:
        location_type = "boarding_house",
        has owner of owner,
        has housekeeper of housekeeper,
        has boarder of boarder,
        name = "[[#FamilyName#]'s [Boarding House|House]|[#FamilyName#] [House|Apartment]]".
        
initialization school:
    select [1] character as headmaster:
        is headmaster at school,
        is employee at school
    :where
        age = [45:70],
        not employee at Location;
        
    select [6:8] character as student:
        is student at school,
        is employee at school,
    :where
        age = [6:16];
        
    create [1] location as school:
        location_type = "school",
        has headmaster of headmaster,
        has student of student,
        name = "[Arkham|Barnard|East|Providence|Arlington|West Armitage|High Lane|Northside|Saltonstall|Pickman] [Public|Private] School".

initialization bookstore:
    let OwnerName = "#lastNames#",
        RandomName = "#lastNames#";
    
    select [1] character as owner:
        is owner of bookstore,
        is employee of bookstore,
        last_name = OwnerName
    :where
        age = [35:80],
        not employee at Location,
        is scholar;
        
    select [2:3] character as clerk:
        is clerk of bookstore,
        is employee of bookstore
    :where
        age = [20:25],
        not employee at Location,
        is poor;
        
    select [1:3] character as regular:
        is regular of bookstore
    :where
        age = [40:60],
        is scholar,
        is rich;

    create [1] location as bookstore:
        location_type = "bookstore",
        has owner of owner,
        has clerk of clerk,
        has regular of regular,
        name = "[[[#OwnerName#]'s [Books|Book Store|Used Books|Rare Books|Rare Books & Maps]]|[[#RandomName#]'s [Books|Book Store|Used Books|Rare Books|Rare Books & Maps]]|[[Seekers|Wanderer's|Mindful] Books]]".
        
    %question: can I have sublocations? like a basement or back room?
        
initialization town_square:
    create [1] location as town_square:
        location_type = "town_square",
        name = "The Town Square".

        
initialization wharf:
    select [4] character as dockworker:
        is dockworker of wharf,
        is employee at wharf,
        is unionized,
    :where
        age = [30:50],
        not employee at Location,
        is poor;
        
    select [4] character as fisherman:
        is fisherman of wharf,
        is employee at wharf,
    :where
        age = [30:70],
        not employee at Location,
        is poor;
    
    select [1] character as sailor:
        is sailor of wharf,
        is employee at wharf,
    :where
        not employee at Location,
        is poor;

    create [1] location as wharf:
        location_type = "wharf",
        has dockworker of dockworker,
        has fisherman of fisherman,
        has sailor of sailor,
        name = "The Wharf".
        
initialization warehouse:
    let OwnerName = "#lastNames#";
    
    select [6:8] character as worker:
        is worker of warehouse,
        is employee at warehouse,
        is unionized,
    :where
        age = [18:50],
        not employee at Location,
        is poor;
        
    select [1] character as unionrep:
        is worker at warehouse,
        is employee at warehouse,
        is unionrep of warehouse,
        is unionized,
    :where
        age = [35:50],
        is political,
        not employee at Location,
        is poor;
        
    select [1] character as foreman:
        is foreman of warehouse,
        is employee at warehouse,
    :where
        age = [35:50],
        not employee at Location;
        
    select [1] character as owner:
        is owner of warehouse,
        is employee at warehouse,
        last_name = OwnerName,
    :where
        not employee at Location,
        is rich;

    create [1] location as warehouse:
        location_type = "warehouse",
        has worker of worker,
        has unionrep of unionrep,
        has foreman of foreman,
        has owner of owner,
        name = "[[[#OwnerName#]'s [Warehouses|Factory|Properties|Depot|Stockpile|Imports]]|[[Easterly|Westside|Waterfront|Seaside] [Warehouses|Imports]]|[The Stockyard]]".
        
initialization theater:
    select [1] character as owner:
        is owner of theater,
        is employee at theater,
    :where
        age = [30:80],
        not employee at Location,
        is rich;
        
    select [1] character as usher:
        is usher at theater,
        is employee at theater,
    :where
        age = [16:24],
        not employee at Location;
        
    select [1] character as playwright:
        is playwright at theater,
        is employee at theater,
    :where
        age = [25:65],
        is artistic,
        not employee at Location;
        
    select [1] character as director:
        is director at theater,
        is employee at theater,
    :where
        age = [35:50],
        is artistic,
        not employee at Location;
        
    select [1] character as stagehand:
        is stagehand at theater,
        is employee at theater,
    :where
        age = [18:25],
        not employee at Location,
        is poor;
        
    select [1] character as ticketer:
        is ticketer at theater,
        is employee at theater,
    :where
        age = [16:25],
        not employee at Location,
        is poor;
        
    select [6] character as actor:
        is actor at theater,
        is member at theater,
    :where
        not member at Location,
        is artistic;
        
    create [1] location as theater:
        location_type = "theater",
        has owner of owner,
        has usher of usher,
        has stagehand of stagehand,
        has director of director,
        has playwright of playwright,
        has actor of actor,
        has ticketer of ticketer,
        name = "Regal Theatre".
        
initialization historicalsociety:
    select [1] character as curator:
        is curator at historicalsociety,
        is employee at historicalsociety,
    :where
        age = [45:80],
        not employee at Location,
        is scholar;
        
    select [4:8] character as contributer:
        is contributer at historicalsociety,
        is member at historicalsociety,
    :where
        age = [40:80],
        is traditionalist,
        is scholar,
        not member at Location;

    create [1] location as historicalsociety:
        location_type = "historicalsociety",
        has curator of curator,
        has contributer of contributer,
        name = "Arkham Historical Society".
        
initialization bank:
    select [1] character as banker:
        is banker at bank,
        is employee at bank,
    :where
        not employee at Location,
        is rich,
        age = [40:60];
        
    select [2] character as clerk:
        is clerk at bank,
        is employee at bank,
    :where
        not employee at Location,
        age = [25:60];
    
    create [1] location as bank:
        has banker of banker,
        has clerk of clerk,
        location_type = "bank",
        name = "Arkham Central Bank".
        
initialization graveyard:
    select [1] character as gravedigger:
        is gravedigger at graveyard,
        is employee at graveyard,
    :where
        not employee at Location,
        is poor;
        
    create [1] location as graveyard:
        location_type = "graveyard",
        has gravedigger of gravedigger,
        name = "[East Ipswich|Arkham|Old Greene|Hyde|Christchurch] [Cemetery|Graveyard|Hill]".
        
initialization jailhouse:
    select [1] character as sheriff:
        is sheriff at jailhouse,
        is employee at jailhouse,
    :where
        age = [40:55],
        not employee at Location,
        is political,
        not rich;
        
    select [3] character as police:
        is police at jailhouse,
        is employee at jailhouse,
    :where
        age = [25:55],
        not employee at Location,
        not rich;

    create [1] location as jailhouse:
        has sheriff of sheriff,
        has police of police,
        location_type = "jailhouse",
        name = "Arkham County Jail". %TODO: better name
        
initialization postoffice:
    select [1] character as worker:
        is worker at postoffice,
        is employee at postoffice,
    :where
        age = [22:65],
        not employee at Location,
        is poor;
        
    create [1] location as postoffice:
        has worker of worker,
        location_type = "postoffice",
        name = "[Kingston|Sefton|Dunwich|Ipswich|Arkham] Post".
        
initialization newspaper:
    select [1] character as editor:
        is editor at newspaper,
        is employee at newspaper,
        is owner at newspaper
    :where
        age = [40:60],
        is political,
        not employee at Location;
        
    select [1] character as reporter:
        is reporter at newspaper,
        is employee at newspaper,
    :where
        not employee at Location;
        
    select [1] character as writer:
        is writer at newspaper,
        is member at newspaper,
    :where
        not member at Location;
        
    create [1] location as newspaper:
        location_type = "newspaper",
        has editor of editor,
        has reporter of reporter,
        has writer of writer,
        name = "[Arkham|Ipswich|Dunwich|Miskatonic] [Gazette|Journal|Paper|Press|Reader|News]".
        
initialization hospital:
    select [1] character as doctor:
        is doctor at hospital,
        is employee at hospital,
    :where
        age = [28:65],
        not employee at Location,
        is rich;
        
    select [2] character as nurse:
        is nurse at hospital,
        is employee at hospital,
    :where
        age = [25:65],
        not employee at Location,
        not rich;

    create [1] location as hospital:
        has doctor of doctor,
        has nurse of nurse,
        location_type = "hospital",
        name = "Sefton Hospital". %TODO: better name
        
initialization library:
    select [1] character as librarian:
        is librarian at library,
        is employee at library,
    :where
        age = [35:70],
        not employee at Location,
        is scholar;
        
    select [1:2] character as clerk:
        is clerk at library,
        is employee at library,
    :where
        not employee at Location,
        is poor;
        
    select [2:3] character as volunteer:
        is volunteer at library,
        is member of library,
    :where
        age = [25:80],
        not member at Location;

    create [1] location as library:
        location_type = "library",
        has librarian of librarian,
        has clerk of clerk,
        has volunteer of volunteer,
        name = "Miskatonic Library". %TODO: better name
        
initialization slaughterhouse:
    select [2:4] character as butcher:
        is butcher at slaughterhouse,
        is employee at slaughterhouse,
        is unionized,
    :where
        age = [18:50],
        not employee of Location,
        is poor;
        
    select [1] character as owner:
        is owner at slaughterhouse,
        is employee at slaughterhouse,
    :where
        age = [40:65],
        not employee of Location,
        is rich;
        
    create [1] location as slaughterhouse:
        location_type = "slaughterhouse",
        has owner of owner,
        has butcher of butcher,
        name = "Slaughterhouse". %TODO: better name
        
initialization baitshop:
    select [1] character as owner:
        is owner of baitshop,
        is employee of baitshop,
    :where
        age = [25:70],
        is poor,
        not employee of Location;
    
    create [1] location as baitshop:
        has owner of owner,
        location_type = "baitshop",
        name = "The Baitshop". %TODO: better name
        
initialization grocer:
    select [1] character as owner:
        is owner of grocer,
        is employee of grocer,
    :where
        age = [35:70],
        is poor,
        not employee of Location;
        
    select [2:3] character as clerk:
        is clerk of grocer,
        is employee of grocer,
    :where
        age = [18:26],
        is poor,
        not employee of Location;
        
    create [1] location as grocer:
        has owner of owner,
        has clerk of clerk,
        location_type = "grocer",
        name = "Local Grocer". %TODO: better name
        
initialization generalstore:
    select [1] character as owner:
        is owner of generalstore,
        is employee of generalstore,
    :where
        age = [35:70],
        is poor,
        not employee of Location;
        
    select [2:3] character as clerk:
        is clerk of generalstore,
        is employee of generalstore,
    :where
        age = [18:26],
        is poor,
        not employee of Location;
        
    create [1] location as generalstore:
        has owner of owner,
        has clerk of clerk,
        location_type = "generalstore",
        name = "General Goods". %TODO: better name
        
initialization artgallery:
    select [1] character as owner:
        is owner of artgallery,
        is employee of artgallery,
    :where
        age = [45:70],
        is rich,
        not employee of Location;
        
    select [1] character as residentartist:
        is residentartist of artgallery,
        is employee of artgallery,
    :where
        is artistic,
        not employee of Location;
        
    select [1:2] character as patron:
        is patron of artgallery,
        is member of artgallery,
    :where
        age = [30:70],
        is rich,
        is artistic,
        not member of Location;
        
    select [2:4] character as regular:
        is regular of artgallery,
    :where
        age = [25:80],
        is rich,
        not regular of Location;
        
    create [1] location as artgallery:
        has owner of owner,
        has residentartist of residentartist,
        has patron of patron,
        has regular of regular,
        location_type = "artgallery",
        name = "Art Gallery". %TODO: better name
        
initialization diner:
    select [1] character as owner:
        is owner of diner,
        is employee of diner,
    :where
        age = [30:70],
        not rich,
        not employee of Location;
        
    select [2] character as cook:
        is cook at diner,
        is employee at diner,
    :where
        age = [25:50],
        is poor,
        not employee of Location;
        
    select [2:4] character as server:
        is server at diner,
        is employee at diner,
    :where
        age = [18:55],
        is poor,
        not employee of Location;
        
    select [1:3] character as regular:
        is regular at diner,
    :where
        age = [30:70],
        not regular of Location;
        
    create [1] location as diner:
        has owner of owner,
        has cook of cook,
        has server of server,
        has regular of regular,
        location_type = "diner",
        name = "The Local Diner". %TODO: better name
        
initialization cafe:
    select [1] character as owner:
        is owner of cafe,
        is employee of cafe,
    :where
        age = [25:60],
        not rich,
        not employee of Location;
        
    select [4] character as regular:
        is regular of cafe,
    :where
        age = [18:26],
        is scholar;

    create [1] location as cafe:
        has owner of owner,
        has regular of regular,
        location_type = "cafe",
        name = "Cafe". %TODO: better name
        
initialization hotel:
    select [1] character as owner:
        is owner of hotel,
        is employee of hotel,
    :where
        age = [30:50],
        is rich,
        not employee of Location;
        
    select [2] character as receptionist:
        is receptionist of hotel,
        is employee of hotel,
    :where
        age = [20:35],
        not employee of Location;
        
    select [2:3] character as cleaner:
        is cleaner at hotel,
        is employee at hotel,
    :where
        age = [20:50],
        is poor,
        not employee at Location;
        
    select [4:8] character as guest:
        is guest at hotel,
        is resident at hotel, 
        %is employee at outsidetown, %HOW TO?
    :where
        not poor,
        not resident at Location,
        not employee at Location,
        not married,
        not parent,
        not child;
        
    create [1] location as hotel:
        has owner of owner,
        has receptionist of receptionist,
        has cleaner of cleaner,
        has guest of guest,
        location_type = "hotel",
        name = "Hotel". %TODO: better name
        
initialization townhall:
    select [1] character as mayor:
        is mayor at townhall,
        is employee at townhall,
    :where
        age = [35:50],
        not poor,
        is political,
        not employee at Location;
        
    select [2] character as clerk:
        is clerk at townhall,
        is employee at townhall,
    :where
        age = [35:50],
        not rich,
        not employee at Location;
        
    select [1:3] character as regular:
        is regular at townhall,
    :where
        is political;
        
    create [1] location as townhall:
        has mayor of mayor,
        has clerk of clerk,
        has regular of regular,
        location_type = "townhall",
        name = "Town Hall". %TODO: better name
        
initialization butchershop:
    select [1] character as butcher:
        is butcher at butchershop,
        is owner at butchershop,
        is employee at butchershop,
    :where
        age = [30:55],
        not employee at Location,
        not rich;
        
    create [1] location as butchershop:
        has butcher of butcher,
        location_type = "butchershop",
        name = "The Butcher Shoppe". %TODO: better name
        
initialization bakery:
    select [1] character as baker:
        is baker at bakery,
        is owner at bakery,
        is employee at bakery,
    :where
        age = [30:55],
        not employee at Location,
        not rich;
    
    create [1] location as bakery:
        has baker of baker,
        location_type = "bakery",
        name = "Bakery". %TODO: better name
        
initialization masoniclodge:
    select [1] character as grandmaster:
        is grandmaster of masoniclodge,
        is member of masoniclodge,
    :where
        age = [50:65],
        is rich,
        is political,
        is traditionalist,
        not member of Location;
        
    select [5:10] character as freemason:
        is freemason of masoniclodge,
        is member of masoniclodge,
    :where
        age = [30:70],
        is rich,
        is political,
        is traditionalist,
        not member of Location;
        
    create [1] location as masoniclodge:
        has freemason of freemason,
        has grandmaster of grandmaster,
        location_type = "masoniclodge",
        name = "Masonic Lodge". %TODO: better name

initialization gentlemensclub:
    select [4:6] character as member:
        is member of gentlemensclub,
    :where
        age = [30:60],
        not poor, %or just for the rich?
        not member of Location;
    create [1] location as gentlemensclub:
        has member of member,
        location_type = "gentlemensclub",
        name = "Gentlemen's Club". %TODO: better name
        
initialization socialparlour:
    select [4:6] character as member:
        is member of socialparlour,
    :where
        age = [26:50],
        not poor, %or just for the rich?
        not member of Location;
        
    create [1] location as socialparlour:
        has member of member,
        location_type = "socialparlour",
        name = "Ladies Social Parlour". %TODO: better name
        
initialization union:
    select [12] character as member:
        is member of union,
    :where
        is unionized,
        not member of Location;
        
    create [1] location as union:
        has member of member,
        location_type = "union",
        name = "Union HQ". %TODO: better name
        
initialization apothecary:
    select [1] character as owner:
        is owner of apothecary,
        is employee of apothecary,
    :where
        age = [50:70],
        not employee of Location;
    
    create [1] location as apothecary:
        has owner of owner,
        location_type = "apothecary",
        name = "Apothecary". %TODO: better name
        
initialization funeralhome:
    select [1] character as mortician:
        is mortician at funeralhome,
        is owner of funeralhome,
        is employee of funeralhome,
    :where
        age = [50:70],
        not employee at Location;
    
    create [1] location as funeralhome:
        has mortician of mortician,
        location_type = "funeralhome",
        name = "Funeral Home and Mortuary".
        
initialization charityhouse:
    select [4] character as volunteer:
        is volunteer at charityhouse,
        is member of charityhouse,
    :where
        age = [25:70],
        is gregarious,
        not poor;
        
    select [6] character as resident:
        is resident of charityhouse,
        is destitute,
    :where
        age = [18:30],
        is poor,
        not resident of Location;
        
    create [1] location as charityhouse:
        has volunteer of volunteer,
        has resident of resident,
        location_type = "charityhouse",
        name = "Charity House". %TODO: better name
        
initialization veteranshome:
    select [4] character as resident:
        is resident of veteranshome,
        is veteranOfWWI,
    :where
        age = [35:50],
        is poor,
        not resident of Location;

    create [1] location as veteranshome:
        has resident of resident,        
        location_type = "veteranshome",
        name = "Veteran's Home". %TODO: better name
        
initialization businessassociation:
    select [5] character as member:
        is member of businessassociation,
    :where
        not poor,
        is owner,
        not member of Location;
        
    select [10] character as associate:
        is associate of businessassociation,
    :where
        is owner;
    
    create [1] location as businessassociation:
        has member of member,
        has associate of associate,
        location_type = "businessassociation",
        name = "Ispwich Business Association". %TODO: better name
        
initialization university:
    select [1] character as provost:
        is provost of university,
        is employee of university,
    :where
        age = [50:60],
        is scholar,
        is rich,
        not employee of Location;
        
    select [2] character as clerk:
        is clerk of university,
        is employee of university,
    :where
        age = [25:50],
        not rich,
        not employee of Location;
        
    select [1] character as janitor:
        is janitor of university,
        is employee of university,
    :where
        is poor,
        not employee of Location;
        
    select [1] character as professor_of_medievalmetaphysics:
        is professor at university,
        is professor_of_medievalmetaphysics at university,
        is employee at university,
    :where
        age = [40:60],
        is scholar,
        not employee of Location;
        
    select [0:2] character as student_of_medievalmetaphysics:
        is student at university,
        is student_of_medievalmetaphysics at university,
        is employee at university,
    :where
        age = [18:26],
        is scholar,
        not employee of Location;
        
    select [1] character as professor_of_archaeology:
        is professor at university,
        is professor_of_archaeology at university,
        is employee at university,
    :where
        age = [40:60],
        is scholar,
        not employee of Location;
        
    select [0:2] character as student_of_archaeology:
        is student at university,
        is student_of_archaeology at university,
        is employee at university,
    :where
        age = [18:26],
        is scholar,
        not employee of Location;
        
    select [1] character as professor_of_anthropology:
        is professor at university,
        is professor_of_anthropology at university,
        is employee at university,
    :where
        age = [40:60],
        is scholar,
        not employee of Location;
        
    select [0:2] character as student_of_anthropology:
        is student at university,
        is student_of_anthropology at university,
        is employee at university,
    :where
        age = [18:26],
        is scholar,
        not employee of Location;
        
    select [1] character as professor_of_linguistics:
        is professor at university,
        is professor_of_linguistics at university,
        is employee at university,
    :where
        age = [40:60],
        is scholar,
        not employee of Location;
        
    select [0:2] character as student_of_linguistics:
        is student at university,
        is student_of_linguistics at university,
        is employee at university,
    :where
        age = [18:26],
        is scholar,
        not employee of Location;
        
    select [1] character as professor_of_history:
        is professor at university,
        is professor_of_history at university,
        is employee at university,
    :where
        age = [40:60],
        is scholar,
        not employee of Location;
        
    select [0:2] character as student_of_history:
        is student at university,
        is student_of_history at university,
        is employee at university,
    :where
        age = [18:26],
        is scholar,
        not employee of Location;

    select [1] character as professor_of_psychology:
        is professor at university,
        is professor_of_psychology at university,
        is employee at university,
    :where
        age = [40:60],
        is scholar,
        not employee of Location;        
    
    select [0:2] character as student_of_psychology:
        is student at university,
        is student_of_psychology at university,
        is employee at university,
    :where
        age = [18:26],
        is scholar,
        not employee of Location;
    
    select [1] character as professor_of_science:
        is professor at university,
        is professor_of_science at university,
        is employee at university,
    :where
        age = [40:60],
        is scholar,
        not employee of Location;  
        
    select [0:2] character as student_of_science:
        is student at university,
        is student_of_science at university,
        is employee at university,
    :where
        age = [18:26],
        is scholar,
        not employee of Location;

    create [1] location as university:
        has provost of provost,
        has clerk of clerk,
        has janitor of janitor,
        has professor_of_medievalmetaphysics of professor_of_medievalmetaphysics,
        has student_of_medievalmetaphysics of student_of_medievalmetaphysics,
        has professor_of_archaeology of professor_of_archaeology,
        has student_of_archaeology of student_of_archaeology,
        has professor_of_anthropology of professor_of_anthropology,
        has student_of_anthropology of student_of_anthropology,
        has professor_of_linguistics of professor_of_linguistics,
        has student_of_linguistics of student_of_linguistics,
        has professor_of_history of professor_of_history,
        has student_of_history of student_of_history,
        has professor_of_psychology of professor_of_psychology,
        has student_of_psychology of student_of_psychology,
        has professor_of_science of professor_of_science,
        has student_of_science of student_of_science,
        location_type = "university",
        name = "University". %TODO: better name
        
%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%  PLACES TO LIVE
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

initialization studentapartment:
    select [1] character as resident:
        is resident of studentapartment,
    :where
        age = [18:26],
        is student,
        not resident of Location;
        
    create [1] location as studentapartment:
        has resident of resident,
        location_type = "studentapartment",
        name = "Student Apartments". %TODO: better name
        
initialization tenement_housing:
    select [1] character as resident:
        is resident of tenement_housing,
    :where
        not resident of Location,
        is poor;
    
    create [1] location as tenementhousing:
        has resident of resident,
        location_type = "tenementhousing",
        name = "Tenement Housing". %TODO: better name
        
%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%  PLACES AS CONCEPTS
%%%%%%%%%%%%%%%%%%%%%%%%%%%%

initialization outsidetown:
    create [1] location as outsidetown:
        is outsidetown,
        location_type = "outsidetown",
        name = "Outside Town".
        
initialization nowhere:
    create [1] location as nowhere:
        is nowhere,
        location_type = "nowhere",
        name = "Nowhere".

%student apartments: each has 1-4 students, single, roommates
%tenements (destitute): 1-4 people, single, roommates
%transient shelter: 1-4 people, single, roommates
%lower class apartments: x10
%lower class homes: x10
%middle class apartments: x10
%middle class single houses: x10
%upper class houses: x10
%upper class mansion: x5







%TODO: one-off people
%  * psychotherapist
%  * occultist
%  * private detective
%  * novelist
%  * poet
%  * art collector
%  * book collector
%  * artifacts collector
%  * scholar
%  * socialite
%  * 

%rotary club
%athletics association
%drug store
%curios & antiques
%goldsmith & jeweler
%confectionary & candy store
%church (abandoned)
%cinema
%wax museum
%penny arcade
%loan agency
%gas station
%bus station
%train station
%lumber yard
%construction & supply
%law firm
%billards hall
%speakeasy
%music hall
%school of dance
%fire department
%police department
%courthouse
%Pump house & water tower
%sanitarium
%newstand
%brickyard
%credit agency
%chemical supply
%bathhouse
%nursing home
%construction site
%demolition site
%tenement
%restaurant
%spa
%gym
%finishing/etiquette school
%specific trade school
%barbershop & hairdresser
%gift shop
%print shop
%clothiers
%blacksmith
%locksmith
%supply store for props/theater
%market
%furniture & carpets
%glassblower
%music store
%toy & train shop
%flower shop
%office supplies
%department store
%ice cream parlour
%auto lot
%stamps & coins
%boutique shop
%ice house
%hardware store
%timepieces & clocks/watches
%beauty parlor
%laundry
%pet shop
%haberdashery
%tattoo shop
%radio center
%shoe store
%Dimestore
%electric company (edison)
%phone company (bell)
%transformer station
%railroad properties
%FREELANCERS or work from own office
%therapist
%surgeon
%doctor
%midwife
%jumker
%private investigator
%consulting architect, bibliophile, academic, etc.
%taxidermist
%tobacconist
%

default character: 
	last_name = "#lastNames#",
	first_name = "#firstNames#",
	age = [18:60],
    birthday = now - [0:365] day,
	traits = [1:3] traits.

initialize:
	%create [1] character;
	create [4] family_couple_young;
	create [4] family_couple_midlife;
	create [4] family_couple_old;
	create [4] family_couple_elderly;
	create [4] family_young;
	create [4] family_midlife;
	create [4] family_old;
	create [4] family_elderly;
	create [1] church;
	create [1] school;
	create [1] boarding_house;
	create [1] bookstore;
	create [1] town_square;
	create [1] wharf;
	create [1] warehouse;
	create [1] theater;
	create [1] historicalsociety;
	create [1] bank;
	create [1] graveyard;
	create [1] jailhouse;
	create [1] postoffice;
	create [1] newspaper;
	create [1] hospital;
	create [1] library;
	create [1] slaughterhouse;
	create [1] baitshop;
	create [1] grocer;
	create [1] generalstore;
	create [1] artgallery;
	create [1] diner;
	create [1] cafe;
	create [1] hotel;
	create [1] townhall;
	create [1] butchershop;
	create [1] bakery;
	create [1] masoniclodge;
	create [1] gentlemensclub;
	create [1] socialparlour;
	create [1] union;
	create [1] apothecary;
	create [1] funeralhome;
	create [1] charityhouse;
	create [1] veteranshome;
	create [1] businessassociation;
	create [1] university;
	create [5] studentapartment;
	create [1] outsidetown;
	create [1] nowhere.

% cult_ritual.kismet
location(church, [support(cultist, 100)], [each_turn(cast(cultist))]).
location(narthex, [support(cultist, 100)], [each_turn(cast(cultist))]).
location(sanctuary, [support(cultist, 100)], [each_turn(cast(cultist))]).
location(altar, [support(cultist, 100)], [each_turn(cast(cultist))]).
location(crypt, [support(cultist, 100)], [each_turn(cast(cultist))]).
location(nave, [support(cultist, 100)], [each_turn(cast(cultist))]).
location(chapel, [support(cultist, 100)], [each_turn(cast(cultist))]).

% cult.kismet
location(church, [support(patron, 4, 6), support(priest, 1, 2), support(deacon, 1)], [each_turn(cast(patron))]).
location(school, [support(headmaster, 1), support(student, 6)]).
location(boarding_house, [support(owner, 1), support(housekeeper, 1), support(boarder, 2), support(visitor, 1)], [each_turn(cast(visitor))]).
location(bookstore, [support(owner, 1), support(clerk, 1), support(regular, 1), support(customer, 2)], [each_turn(cast(customer))]).
location(town_square, [support(people, 5)], [each_turn(cast(people))]).
location(wharf, [support(dockworker, 4), support(fisherman, 2), support(sailor, 1), support(loiterer, 2)], [each_turn(cast(loiterer))]).
location(warehouse, [support(owner, 1), support(unionrep, 1), support(foreman, 1), support(worker, 4)]).
location(theater, [support(owner, 1), support(usher, 1), support(stagehand, 1), support(director, 1), support(playwright, 1), support(actor, 4), support(ticketer, 1), support(patron, 4)], [each_turn(cast(patron))]).
location(historicalsociety, [support(curator, 1), support(contributer, 1), support(visitor, 1)], [each_turn(cast(visitor))]).
location(bank, [support(banker, 1), support(clerk, 1), support(customers, 2)], [each_turn(cast(customers))]).
location(graveyard, [support(gravedigger, 1), support(visitor, 2)], [each_turn(cast(visitor))]).
location(jailhouse, [support(sheriff, 1), support(police, 2), support(visitor, 1)], [each_turn(cast(visitor))]).
location(postoffice, [support(worker, 1), support(customer, 2)], [each_turn(cast(customer))]).
location(newspaper, [support(editor, 1), support(reporter, 1), support(writer, 1), support(reader, 1)], [each_turn(cast(reader))]).
location(hospital, [support(doctor, 1), support(nurse, 1), support(patient, 2)], [each_turn(cast(patient))]).
location(library, [support(librarian, 1), support(clerk, 1), support(volunteer, 2), support(visitor, 3)], [each_turn(cast(visitor))]).
location(slaughterhouse, [support(owner, 1), support(butcher, 2)]).
location(baitshop, [support(owner, 1), support(customer, 1)], [each_turn(cast(customer))]).
location(grocer, [support(owner, 1), support(clerk, 1), support(customer, 2)], [each_turn(cast(customer))]).
location(generalstore, [support(owner, 1), support(clerk, 1), support(customer, 2)], [each_turn(cast(customer))]).
location(artgallery, [support(owner, 1), support(residentartist, 1), support(patron, 1:2), support(regular, 2), support(visitor, 2)], [each_turn(cast(visitor))]).
location(diner, [support(owner, 1), support(cook, 1), support(server, 2), support(regular, 2), support(customer, 6)], [each_turn(cast(customer))]).
location(cafe, [support(owner, 1), support(regular, 4), support(customer, 4)], [each_turn(cast(customer))]).
location(hotel, [support(owner, 1), support(receptionist, 1), support(cleaner, 1), support(guest, 4)]).
location(townhall, [support(mayor, 1), support(clerk, 1), support(regular, 1), support(visitor, 2)], [each_turn(cast(visitor))]).
location(butchershop, [support(butcher, 1), support(visitor, 2)], [each_turn(cast(visitor))]).
location(bakery, [support(baker, 1), support(visitor, 2)], [each_turn(cast(visitor))]).
location(masoniclodge, [support(grandmaster, 1), support(freemason, 5)]).
location(gentlemensclub, [support(member, 4)]).
location(socialparlour, [support(member, 4)]).
location(union, [support(member, 6)]).
location(apothecary, [support(owner, 1), support(visitor, 2)], [each_turn(cast(visitor))]).
location(funeralhome, [support(mortician, 1), support(visitor, 2)], [each_turn(cast(visitor))]).
location(charityhouse, [support(volunteer, 2), support(resident, 6)]).
location(veteranshome, [support(resident, 4)]).
location(businessassociation, [support(member, 3), support(associate, 5)]).
location(studentapartment, [support(resident, 3), support(visitor, 3)], [each_turn(cast(visitor))]).
location(outsidetown, [support(employee, 0)]).
location(nowhere, [support(employee, 0)]).
        
location(university, 
    [support(provost, 1), support(clerk, 1), support(janitor, 1), 
    support(professor_of_medievalmetaphysics, 1), support(student_of_medievalmetaphysics, 1), 
    support(professor_of_archaeology, 1), support(student_of_archaeology, 1), 
    support(professor_of_anthropology, 1), support(student_of_anthropology, 1), 
    support(professor_of_linguistics, 1), support(student_of_linguistics, 1), 
    support(professor_of_history, 1), support(student_of_history, 1), 
    support(professor_of_psychology, 1), support(student_of_psychology, 1), 
    support(professor_of_science, 1), support(student_of_science, 1)]).

% barbarians.kismet
location(tavern, [support(person, 7)]).
location(market, [support(person, 7)]).
location(smith, [support(person, 3)]).

% trash_of_the_town.kismet
location(bar, [support(person, 10)]).
location(bank, [support(person, 5)]).
location(market, [support(person, 20)]).
location(church, [support(person, 10)]).
location(park, [support(person, 10)]).
location(mine, [support(person, 10)]).
location(apartment_complex, [support(person, 10)]).

% test.kismet
location(bar, [support(patron, 10:20), support(bartender, 2:3), support(owner, 1)], [each_turn(cast(patron))]).
location(restaurant, [support(patron, 20:30), support(server, 2:3), support(host, 2:3), support(owner, 1)], [each_turn(cast(patron))]).
location(church, [support(parishioners, 10:20), support(minister, 1)], [each_turn(cast(parishioners))]).
location(the_office, [support(people, 1000)], [each_turn(cast(people))]).

% fantasy_broad.kismet
location(town, [support(person, 8)], [each_turn(cast(person))]).
location(house, [support(resident, 4), support(guest, 2)], [each_turn(cast(guest))]).
location(throne_room, [support(monarch, 1), support(chancellor, 1), support(royalty, 10), support(citizen, 10), support(knight, 1)], [each_turn(cast(citizen))]).
location(docks, [support(shipping_foreman, 1:2), support(dockworker, 4:6), support(prostitute, 1:2), support(fisher, 1:2), support(visitor, 3:4)], [each_turn(cast(visitor))]).
location(auction_house, [support(curator, 3), support(auctioneer, 2), support(patron, 4:5)], [each_turn(cast(patron))]).
location(ballroom, [support(guest, 5), support(majordomo, 1), support(butler, 1), support(servant, 2), support(owner, 1), support(artist, 1)], [each_turn(cast(guest))]).
location(quad, [support(visitor, 20:30)], [each_turn(cast(visitor))]).
location(mine, [support(miner, 8), support(foreman, 1), support(visitor, 1)], [each_turn(cast(visitor))]).
location(elders_house, [support(elder, 1), support(visitor, 4:5)], [each_turn(cast(visitor))]).
location(barracks, [support(guard, 3), support(knight, 2), support(squire, 1), support(monarch, 1), support(monarchling, 3), support(visitor, 1)], [each_turn(cast(visitor))]).
location(opera_house, [support(impresario, 1), support(diva, 2), support(tourist, 17), support(bard, 5), support(patron, 4:5)], [each_turn(cast(patron))]).
location(smith, [support(smith_apprentice, 2), support(smithy, 1), support(patron, 4:5)], [each_turn(cast(patron))]).
location(boat, [support(sailor, 6), support(captain, 1), support(passenger, 4:5)], [each_turn(cast(passenger))]).
location(thieves_den, [support(spy, 3), support(thief, 5), support(spy_master, 1), support(master_thief, 1)]).
location(library, [support(librarian, 3), support(tutor, 1), support(student, 14), support(researcher, 3), support(visitor, 4:5)], [each_turn(cast(visitor))]).
location(kitchen, [support(guest, 9), support(chef, 2), support(worker, 3), support(owner, 1)]).
location(amphitheatre, [support(tourist, 10:20), support(bard, 5)], [each_turn(cast(tourist))]).
location(shipyard, [support(owner, 1), support(engineer, 2), support(ship_builder, 4), support(visitor, 4:5)], [each_turn(cast(visitor))]).
location(ruins, [support(archaelogist, 3), support(treasure_hunter, 3), support(visitor, 4:5)], [each_turn(cast(visitor))]).
location(temple, [support(priest, 3), support(follower, 10:20), support(monk, 8), support(high_priest, 1), support(parishioner, 4:5)], [each_turn(cast(parishioner))]).
location(marketplace, [support(vendor, 6), support(enforcer, 3), support(pickpocket, 2), support(racketeer, 1), support(patron, 4:5)], [each_turn(cast(patron))]).
location(tavern, [support(regular, 6), support(owner, 1), support(barkeep, 3), support(patron, 4:5)], [each_turn(cast(patron))]).
location(classroom, [support(student, 14), support(professor, 3), support(dean, 2)]).
location(garden, [support(guest, 1), support(gardener, 2), support(owner, 1), support(majordomo, 1), support(butler, 1), support(servant, 2), support(visitor, 1)], [each_turn(cast(visitor))]).

% astronaut_early_life.kismet
location(city, [support(person, 10000), support(citizens)], [each_turn(cast(citizens))]).
location(town, [support(person, 100), support(citizens)], [each_turn(cast(citizens))]). 
location(farmland, [support(person, 100), support(citizens)], [each_turn(cast(citizens))]).

person(null).
location(null).
event(null).

not_missing(Person, Status) :- person(Person), status(Status), isPerson(Status,N), N > 0.
not_missing(Person, Status) :- person(Person), status(Status), isPerson(Status,N), N < 0.
is(Person, Status, 0) :- person(Person), status(Status), not not_missing(Person,Status).

is(action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION),TAG) :- 
    did(INITIATOR,action(NAME, INITIATOR,TARGET,SUBJECT,ACTION,LOCATION)),
    is(NAME,TAG).
event(Action) :- did(Initiator,Action).

% occurred.lp
mingle(eileen_sandborough, humphrey_coleville).
mingle(esmond_stamville, null).
mingle_loudly(laurette_attleshire, desmond_berksfel).
flirt(desmond_berksfel, laurette_attleshire).
flirt(rosina_farnsfel, bernadine_melshire).
mingle_loudly(karina_penborough, salome_hartham).
mingle_loudly(imorgen_pontshire, rosana_stammont).
mingle(rosana_stammont, imorgen_pontshire).
mingle(hope_norville, rosina_farnsfel).
be_sneaky(duncan_edfield, null).
flirt(claud_hereville, fenella_buckingham).
mingle_loudly(alvan_bromhall, aubrey_tewkditch).
mingle(salome_hartham, karina_sutritch).
mingle(giralda_comling, eileen_sandborough).
mingle_loudly(cedric_saxditch, victor_buckingsfel).
flirt(monica_bromhall, karina_penborough).
mingle(rosana_clearsfel, laurette_attleshire).
mingle(fenella_buckingham, cedric_saxditch).
mingle(basil_atherditch, aubrey_tewkditch).
flirt(waldemar_edling, rosana_clearsfel).
mingle_loudly(margherita_leoritch, cecile_whiteton).
mingle_loudly(christopher_polton, imorgen_pontshire).
mingle_loudly(cecile_whiteton, desmond_berksfel).
flirt(winifred_somerford, lettice_bedborough).
mingle(gwyneth_harsbury, basil_atherditch).
mingle(bernadine_melshire, adelaide_tewkditch).
mingle(barbara_chestermont, martin_alfditch).
mingle_loudly(valentine_buckingshire, eunice_edborough).
mingle_loudly(augustus_stamham, salome_hartham).
mingle(eunice_edborough, augustus_stamham).
flirt(theobald_stalham, imorgen_pontshire).
mingle(lettice_bedborough, robinetta_chesterstock).
mingle(petronia_somersbury, christopher_polton).
mingle(genevieve_leofield, martin_alfditch).
mingle(horace_clareton, fenella_buckingham).
mingle(victor_buckingsfel, valentine_buckingshire).
mingle(adelaide_tewkditch, lettice_bedborough).
mingle(mervyn_saxritch, gwyneth_harsbury).
mingle(winifred_amemont, theobald_stalham).
flirt(humphrey_coleville, fenella_buckingham).
mingle_loudly(karina_sutritch, winifred_amemont).
mingle(aubrey_tewkditch, laurette_attleshire).
flirt(reginald_norling, basil_atherditch).
mingle(alma_somerborough, winifred_amemont).
mingle_loudly(evelyn_tewkritch, barbara_chestermont).
mingle(elissa_somerborough, rosana_clearsfel).
mingle(emeline_hartstock, elissa_somerborough).
mingle(robinetta_chesterstock, rosana_stammont).
mingle(martin_alfditch, winifred_somerford).
mingle(enid_suthall, monica_bromhall).
flirt(null, winifred_somerford).

castable(citizens, city).
castable(citizens, town).
castable(citizens, farmland).
trait(brave).
trait(cowardly).
trait(rule_bound).
trait(anarchic).
trait(loyal).
trait(disloyal).
trait(social).
trait(solitary).
trait(independent).
trait(dependent).
trait(controlling).
trait(freespirited).
trait(tranquil).
trait(agitated).
trait(covetous).
trait(giving).