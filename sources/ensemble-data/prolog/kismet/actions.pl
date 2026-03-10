% testbed.kismet

%SETUP ACTIONS RUN WHEN THE MODULE IS RUN FOR THE VERY FIRST TIME
setup_action make_just_died_the_deceased(>TheDeceased):
    if TheDeceased is just_died;
    result TheDeceased is not just_died, TheDeceased is the_deceased;
   
%CLEANUP ACTIONS RUN WHEN THE MODULE IS UNLOADED
cleanup_action make_the_deceased_normal(>TheDeceased):
    if TheDeceased is the_deceased;
    result TheDeceased is not the_deceased;

%By default, all actions assume that you can't have a removed status
action mingle(>Person,<Other):
    %Secretly has
    if Person is not in_shadow_realm,
        Person is not dead,
        Person is not exiled,
        Other is not in_shadow_realm,
        Other is not dead,
        Other is not exiled;
    ...
%Unless you specifically look for one of them
action resurrect(>Cultist, <Resurrected):
   if Resurrected is dead.

% test.kismet
action befriend_enemy_of_enemy(>Person,<EnemyOfEnemy):
    if pattern(enemy_of_my_enemy,Person,EnemyOfEnemy);
    result: Person and EnemyOfEnemy like each other += 2.

action waste_time(>Person)
"Person is lazy and just whiles the day away.":
       tags: lazy, fun.
       
action drink_the_day_away(>Person)
"Person is lazy and goes to the bar to drink the day away":
       location: bar(Person);
       tags: lazy, drinking;
       result: Person's drunk += 1.

action sober_up(>Person)
"Person sobers up":
	if Person is drunk;
       	result: Person isnt drunk.

action mingle(>Person, <Other)
"Person and Other mingle with each other":
       location: (Person, Other);
       tags: talk;
       result: Other likes Person += 1.

action mingle_loudly(>Person, <Other)
"Person talks loudly at Other mingle loudly with each other":
       location: (Person, Other);
       if Person is extroverted;
       tags: talk;
       result: Person likes Other += 1,
               Other likes Person -= 1.
       
action humble_brag_about(>Gossiper, <Gossipee, *GossipedAction ):
       location: (Gossiper, Gossipee);
       tags: talk;
       visibility++;
       if 
          Gossipee  doesn't know GossipedAction,
          Gossiper did GossipedAction,
          GossipedAction is cool;
       result:
       	     Gossipee likes Gossiper += 1,
	         Gossipee heard GossipedAction.

action dominate_conversation(>Person, <Other) 
    "Person talks to Other and dominates the conversation":
        tags: talk, domineering;
        if Person's bossiness > Other's bossiness;
        result:
            Other likes Person -= 1.

action flirt(>Person, <Other) extends mingle(>Person, <Other)
"Person flirts with Other":
       location: (Person, Other);
       tags: talk, romance;
       visibility++;
       result:
       	       Person likes Other += 1.

action shy_flirt(>Person, <Other) extends mingle(>Person, <Other)
"Person overcomes their fear of talking to bashfully flirts with Other":
       location: (Person, Other);
       tags: talk, romance;
       if Person is quiet_romantic;
       visibility++;
       result:
       	       Person likes Other += 1.
               
action flirt_unsuccessfully(>Person, <Other) extends mingle(>Person, <Other)
"Person flirts with Other":
       location: (Person, Other);
       tags: talk, romance;
       if Person likes Other > Other likes Person;
       visibility++;
       result:
       	       Person likes Other -= 1.

action sulk(>Person) costs 1:
       tags: sad;
       if Person's sadness > 5.

action slap(>Slapper, <Slapped, *UnwantedRomance)
    "Slapper [slaps|hits|strikes] Slapped in the face":  
    tags: violent;

    % Slapped did UnwantedRomance to Slapper -- ADD THIS
    % Slapped did UnwantedRomance with Slapper -- ADD THIS

    if Slapped did UnwantedRomance,
        UnwantedRomance is romance,
        Slapper received UnwantedRomance,
        Slapper likes Slapped < 2;
    visibility++++;
    result: Slapped likes Slapper -= 5,
            Slapped is hurt.

action become_bartender(>TheTender) 
    extends cast bartender(>TheTender)
    "[TheTender finds a job as a bartender|TheTender decided to become a barkeep]":
    tags: drinking, job_hunt.
    
action repair_location(>Initiator, @Location):
    location: Location(Initiator);
    if Location is damaged;
    result: Location is not damaged.

action tend_bar(>Tender:bartender)
"Tender serves drinks at their work.":
        tags: work, drinking.

action drink_together(>DrinkerA:patron, <DrinkerB:patron)
"DrinkerA and DrinkerB share a round together":
    location: bar(DrinkerA,DrinkerB);
    tags: drinking, talk, nice;
    result: DrinkerA and DrinkerB like each other += 1.


action drunken_disagreement(>DrinkerA:patron, <DrinkerB:patron)
"DrinkerA and DrinkerB get into words over a drink":
    location: bar(DrinkerA,DrinkerB);
    tags: drinking, talk, mean;
    result: DrinkerA and DrinkerB like each other -= 3.

action be_sneaky(>Sneaker):
    tags: sneaky;
    visibility---.

action barroom_brawl(>Initiator,<Combatant, @Location)
"Initiator started a drunken brawl with Combatant":
    location: Location(Initiator, Combatant);
    tags: fighting, angry, gossipable;
    visibility++++;
    if
        Initiator is drunk,
        Combatant is drunk,
        Location is bar,
        Initiator dislikes Combatant > 5;
    result: Initiator is hurt, Combatant is hurt,
        Initiator and Combatant dislike each other,
        Location is damaged,
        Initiator and Combatant do not like each other,
        Initiator and Combatant like each other -= 5.

response action disregard(>Person,<RudePerson,*Action):
    if Action is gossipable,
            RudePerson did Action,
    Person saw Action;
    result: Person dislikes RudePerson.	 

% trash_of_the_town.kismet
action date:
  is romance
  if <->(!family) <->(spark) <?(!dating) ?>(!dating) <?>(!married)
  add <->(dating)
  del <->(cheating);

action cheat:
  is infidelity
  if <->(!family) <->(spark) <->(!dating) <?>(dating) <?>(!married)
  add <->(cheating);

action have_affair:
  is infidelity
  if <->(!family) <->(spark) <->(!dating) <->(!married) <?>(married)
  add <->(having_affair);

action end_infidelity:
  is fidelity
  if <->(cheating)
  del <->(cheating);

action deescalate_hate:
  is kind
  if <-(hates) ->(!dislikes) ->(!hates)
  add <-(dislikes)
  del <-(hates);

action deescalate_dislike:
  is kind
  if <-(dislikes) ->(!dislikes) ->(!hates)
  del <-(dislikes);

action marry:
  at church
  if <->(dating)  <?(!married) ?>(!married)
  add <->(married)
  del <->(dating);

action pray A:
  at church
  is religious;

action pray_for:
  at church
  is religious;

action pray_for_atheist:
  at church
  is religious
  if other(!pious)
  add <-(annoyed);

action breakup:
  is breakup
  if <->(dating)
  add <-(dislikes)
  del <->(dating)  <->(cheating) ->(spied_on);

action breakup_for_cheating:
    is breakup breakup
    if <->(dating) <?(cheating)  ->(spied_on)
    add <->(dislikes)
    del <->(dating)  <?(cheating) ->(spied_on);

action divorce:
  if <->(married) ->(dislikes)
  add <-(dislikes)
  del <->(married);

action divorce_for_cheating:
  is breakup
  if <->(married) <?(cheating)  ->(spied_on)
  add <->(dislikes)
  del <->(married) <?(cheating) ->(spied_on);

action pester:
  is annoying talk
  if other(!abiding)
  add <-(annoyed);

action feud:
  is anger
  if <-(hates)
  add ->(hates);

action regard_as_asshole:
  is anger
  if <-(hates)
  add ->(dislikes)
  del ->(spark) ->(charge);

action chafe:
  is anger
  if ->(annoyed)
  add ->(dislikes)
  del ->(annoyed);

action fester:
  is anger
  if ->(dislikes)
  add ->(hates)
  del ->(dislikes);

action forgive:
  is calm
  if ->(hates)
  add ->(dislikes)
  del ->(hates);

action cooldown:
  is calm
  if ->(dislikes)
  del ->(dislikes);

action bicker:
  is annoying talk
  if ->(annoyed)
  add <-(annoyed);

action drink A:
  at bar
  is drink
  add self(drunk);

action sober_up A:
  is sober
  if self(drunk)
  del self(drunk);

action make_deposit A:
  at bank
  is errand;

action buy_groceries A:
  at market
  is errand;

action waste_time A:
  is waste_time;

action spy_on:
  is jealous sneaky
  if <?(cheating) ->(!spied_on)
  add ->(spied_on);

action chit_chat:
  is talk;

action share:
  is talk open nice
  add ->(charge);

action flirt:
    is talk open romance
    add <->(spark);

action pine:
  is romance
  add ->(spark);

action bartend A:
  at bar
  if self(bartender);

action hold_service A:
  at church
  if self(pastor);

action vend A:
  at market
  if self(vendor);

action scarlet_letter:
  is fidelity judgy
  if <?(cheating)
  add ->(dislikes);

% barbarians.kismet

action talk:
  is talk;

action fight:
  is angry
  if <-(dislikes) > 5
  add <->(dislikes)
  del <->(likes);

action regale:
  is talk nice
  add <-(likes);

action drink A:
  is drink
  add self(drunk);

action brood A:
    is quiet angry;

action contemplate A:
  is quiet;

action buy_a_round:
  is nice
  add other(drunk) <-(likes);

action sober_up A:
  if self(drunk)
  del self(drunk);

% cult_ritual.kismet

action exist(>Person)
"Person exists here.":.

%CHURCH
action pray_alone(>Churchgoer:patron)
"Churchgoer prays.":
    location: church(Churchgoer).
    
action sermon(>Deacon:deacon)
"Deacon conducts a sermon.":
    tags: employment;
    location: church(Deacon).
    
action study_religion(>Priest:priest)
"Priest studies from holy manuscripts.":
    tags: employment;
    location: church(Priest).
    
%BOARDING HOUSE
action boarding_house_maintenance(>Owner:owner)
"Owner does some maintenance on the building.":
    tags: employment;
    location: boarding_house(Owner).
    
action housekeeping(>Housekeeper:housekeeper)
"Housekeeper launders the beds.":
    tags: employment;
    location: boarding_house(Housekeeper).
    
action boarder_lounge(>Boarder:boarder)
"Boarder lounges in their room.":
    location: boarding_house(Boarder).
    
action boarding_house_visitor(>Visitor:visitor)
"Visitor visits the boarding house.":
    location: boarding_house(Visitor).
    
%TOWN SQUARE
action loiterer(>Loiterer)
"Loiterer loiters.":
    location: town_square(Loiterer).
    
%SCHOOL
action student_learning(>Student:student)
"Student learns.":
    location: school(Student).
    
action headmaster_teaches(>Headmaster:headmaster)
"Headmaster teaches.":
    tags: employment;
    location: school(Headmaster).
    
%BOOKSTORE
action bookstore_owner(>Owner:owner)
"Owner orders books.":
    tags: employment;
    location: bookstore(Owner).
    
action bookstore_clerk(>Clerk:clerk)
"Clerk stocks shelves.":
    tags: employment;
    location: bookstore(Clerk).
    
action bookstore_regular(>Regular:regular)
"Regular requests a special order.":
    location: bookstore(Regular).
    
action bookstore_customer(>Customer:customer)
"Customer browses the books.":
    location: bookstore(Customer).
    
%WHARF
action wharf_work(>Worker:dockworker)
"Worker unloads cargo.":
    tags: employment;
    location: wharf(Worker).
    
action fish(>Fisherman:fisherman)
"Fisherman fishes.":
    location: wharf(Fisherman).
    
action sailor_loiter(>Sailor:sailor)
"Sailor lounges aboard.":
    location: wharf(Sailor).
    
action wharf_loiter(>Loiterer)
"Loiterer looks out over the sea.":
    location: wharf(Loiterer).
    
%WAREHOUSE
action warehouse_owner(>Owner:owner)
"Owner balances the accounts.":
    tags: employment;
    location: warehouse(Owner).
    
action warehouse_union_rep(>Union:unionrep)
"Union organizes the workers.":
    tags: employment;
    location: warehouse(Union).
    
action warehouse_foreman(>Foreman:foreman)
"Foreman oversees the workers.":
    tags: employment;
    location: warehouse(Foreman).
    
action warehouse_worker(>Worker:worker)
"Worker labours.":
    tags: employment;
    location: warehouse(Worker).
    
%BAR
action bar_generic(>Self)
"Self drinks.":
    location: bar(Self).

% cult.kismet

action exist(>Person)
"Person exists here.":.

%CHURCH
action pray_alone(>Churchgoer:patron)
"Churchgoer prays.":
    tags: believer;
    location: church(Churchgoer).
    
action sermon(>Deacon:deacon)
"Deacon conducts a sermon.":
    location: church(Deacon).
    
action study_religion(>Priest:priest)
"Priest studies from holy manuscripts.":
    location: church(Priest).

default trait do_debug(>Person):
    +++++(debug).

action debug_time_check(>Person,  *Event):
    tags: debug;
    if now is >= 7 day since Event,
        Person did Event,
        Event is rich.

action debug_personal_time_check(>Person):
    tags: debug;
    if now is >= 1 day since Person's birthday.

    action humble_brag_about(>Gossiper, <Gossipee, *GossipedAction ):
    location: (Gossiper, Gossipee);
    tags: talk;
    visibility++;
    if 
       now is >= 7 day since GossipedAction,
       Gossipee  doesn't know GossipedAction,
       Gossiper did GossipedAction,
       GossipedAction is cool;
    result:
             Gossipee likes Gossiper += 1,
          Gossipee heard GossipedAction.
   
%BOARDING HOUSE
action boarding_house_maintenance(>Owner:owner)
"Owner does some maintenance on the building.":
 location: boarding_house(Owner).
 
action housekeeping(>Housekeeper:housekeeper)
"Housekeeper launders the beds.":
 location: boarding_house(Housekeeper).
 
action boarder_lounge(>Boarder:boarder)
"Boarder lounges in their room.":
 location: boarding_house(Boarder).
 
action boarding_house_visitor(>Visitor:visitor)
"Visitor visits the boarding house.":
 location: boarding_house(Visitor).
 
%TOWN SQUARE
action loiterer(>Loiterer)
"Loiterer loiters.":
 location: town_square(Loiterer).
 
%SCHOOL
action student_learning(>Student:student)
"Student learns.":
 location: school(Student).
 
action headmaster_teaches(>Headmaster:headmaster)
"Headmaster teaches.":
 location: school(Headmaster).
 
%BOOKSTORE
action bookstore_owner(>Owner:owner)
"Owner orders books.":
 location: bookstore(Owner).
 
action bookstore_clerk(>Clerk:clerk)
"Clerk stocks shelves.":
 location: bookstore(Clerk).
 
action bookstore_regular(>Regular:regular)
"Regular requests a special order.":
 location: bookstore(Regular).
 
action bookstore_customer(>Customer:customer)
"Customer browses the books.":
 tags: rich, artistic, scholar;
 location: bookstore(Customer).
 
%WHARF
action wharf_work(>Worker:dockworker)
"Worker unloads cargo.":
 location: wharf(Worker).
 
action fish(>Fisherman:fisherman)
"Fisherman fishes.":
 location: wharf(Fisherman).
 
action sailor_loiter(>Sailor:sailor)
"Sailor lounges aboard.":
 location: wharf(Sailor).
 
action wharf_loiter(>Loiterer)
"Loiterer looks out over the sea.":
 location: wharf(Loiterer).
 
%WAREHOUSE
action warehouse_owner(>Owner:owner)
"Owner balances the accounts.":
 location: warehouse(Owner).
 
action warehouse_union_rep(>Self:unionrep)
"Self organizes the workers.":
 location: warehouse(Self).
 
action warehouse_foreman(>Foreman:foreman)
"Foreman oversees the workers.":
 location: warehouse(Foreman).
 
action warehouse_worker(>Worker:worker)
"Worker labours.":
 tags: employment;
 location: warehouse(Worker).
 
%THEATER
action theater_visit(>Self:patron)
"Self watches a play.":
 tags: rich, artistic;
 location: theater(Self).
 
action theater_promote(>Self:owner)
"Self promotes the show.":
 location: theater(Self).
 
action theater_usher(>Self:usher)
"Usher directs the guests.":
 location: theater(Self).
 
action theater_director(>Self:director)
"Self directs the play.":
 location: theater(Self).
 
action theater_playwright(>Self:playwright)
"Self makes furious edits to their manuscript.":
 location: theater(Self).

action theater_actor(>Self:actor)
"Self acts on stage.":
 location: theater(Self).
 
action theater_ticketer(>Self:ticketer)
"Self sells tickets to the play.":
 location: theater(Self).

%HISTORICAL SOCIETY
action historicalsociety_visit(>Self:visitor)
"Self visits the collection.":
 tags: traditionalist, scholar;
 location: historicalsociety(Self).

action historicalsociety_curate(>Self:curator)
"Self curates the collection.":
 location: historicalsociety(Self).
 
action historicalsociety_member(>Self:contributer)
"Self contributes to local history.":
 location: historicalsociety(Self).
 
%BANK
action bank_generic(>Self:customer)
"Self deposits money.":
 location: bank(Self).
 
action bank_rich(>Self:customer)
"Self applies for a business loan.":
 tags: rich;
 if Self is owner;
 location: bank(Self).

action bank_banker(>Self:banker)
"Self counts money.":
 location: bank(Self).
 
action bank_clerk(>Self:clerk)
"Self helps customers.":
 location: bank(Self).


%GRAVEYARD
action graveyard_digger(>Self:gravedigger)
"Self tends to a grave.":
 location: graveyard(Self).
 
action graveyard_generic(>Self:visitor)
"Self visits a grave.":
 location: graveyard(Self).

%JAILHOUSE
action jailhouse_generic(>Self:visitor)
"Self visits the jail.":
 location: jailhouse(Self).

action jailhouse_sheriff(>Self:sheriff)
"Self reports for duty.":
 location: jailhouse(Self).
 
action jailhouse_police(>Self:police)
"Self patrols the jailhouse.":
 location: jailhouse(Self).

%POSTOFFICE
action postoffice_generic(>Self:customer)
"Self posts a letter.":
 location: postoffice(Self).
 
action postoffice_work(>Self:worker)
"Self sorts the mail.":
 location: postoffice(Self).

%NEWSPAPER
action newspaper_reader(>Self:reader)
"Self picks up the morning paper.":
 location: newspaper(Self).
 
action newspaper_editor(>Self:editor)
"Self edits the daily paper.":
 location: newspaper(Self).
 
action newspaper_reporter(>Self:reporter)
"Self writes an article.":
 location: newspaper(Self).
 
action newspaper_writer(>Self:writer)
"Self contributes an article to the paper.":
 location: newspaper(Self).
 
%HOSPITAL
action hospital_generic(>Self:patient)
"Self visits.":
 location: hospital(Self).
 
action hospital_doctor(>Self:doctor)
"Self prescribes treatments.":
 location: hospital(Self).
 
action hospital_nurse(>Self:nurse)
"Self cares for patients.":
 location: hospital(Self).

%LIBRARY
action library_visitor(>Self:visitor)
"Self reads a book.":
 tags: scholar;
 location: library(Self).

action library_librarian(>Self:librarian)
"Self manages the library.":
 location: library(Self).
 
action library_clerk(>Self:clerk)
"Self shelves books.":
 location: library(Self).
 
action library_volunteer(>Self:volunteer)
"Self volunteers.":
 tags: gregarious;
 location: library(Self).

%SLAUGHTERHOUSE
action slaughterhouse_generic(>Self:butcher)
"Self slaughters a pig.":
 location: slaughterhouse(Self).
 
action slaughterhouse_owner(>Self:owner)
"Self oversees the livestock.":
 location: slaughterhouse(Self).

%BAITSHOP
action baitshop_generic(>Self:customer)
"Self purchases bait.":
 location: baitshop(Self).
 
action baitshop_owner(>Self:owner)
"Self sells bait.":
 location: baitshop(Self).


%GROCER
action grocer_customer(>Self:customer)
"Self purchases food.":
 location: grocer(Self).
 
action grocer_owner(>Self:owner)
"Self runs the store.":
 location: grocer(Self).
 
action grocer_clerk(>Self:clerk)
"Self stocks the shelves.":
 location: grocer(Self).

%GENERALSTORE
action generalstore_customer(>Self:customer)
"Self buys some supplies.":
 location: generalstore(Self).
 
action generalstore_owner(>Self:owner)
"Self runs the store.":
 location: generalstore(Self).
 
action generalstore_clerk(>Self:clerk)
"Self stocks the shelves.":
 location: generalstore(Self).


%ARTGALLERY
action artgallery_owner(>Self:owner)
"Self runs the art gallery.":
 location: artgallery(Self).

action artgallery_residentartist(>Self:residentartist)
"Self hangs their art in the gallery.":
 location: artgallery(Self).
 
action artgallery_patron(>Self:patron)
"Self donates to the art gallery.":
 location: artgallery(Self).
 
action artgallery_regular(>Self:regular)
"Self purchases art.":
 location: artgallery(Self).
 
action artgallery_visitor(>Self:visitor)
"Self visits the art gallery.":
 tags: artistic, rich;
 location: artgallery(Self).

%DINER
action diner_owner(>Self:owner)
"Self runs the diner.":
 location: diner(Self).
 
action diner_cook(>Self:cook)
"Self cooks.":
 location: diner(Self).
 
action diner_gserver(>Self:server)
"Self serves the customers.":
 location: diner(Self).
 
action diner_regular(>Self:regular)
"Self orders the usual.":
 location: diner(Self).
 
action diner_customer(>Self:customer)
"Self eats at the diner.":
 location: diner(Self).

%CAFE
action cafe_owner(>Self:owner)
"Self runs the cafe.":
 location: cafe(Self).
 
action cafe_regular(>Self:regular)
"Self takes their regular seat.":
 location: cafe(Self).
 
action cafe_customer(>Self:customer)
"Self takes an empty seat.":
 location: cafe(Self).
 
%HOTEL
action hotel_owner(>Self:owner)
"Self runs the hotel.":
 location: hotel(Self).
 
action hotel_receptionist(>Self:receptionist)
"Self greets guests.":
 location: hotel(Self).
 
action hotel_cleaner(>Self:cleaner)
"Self cleans rooms.":
 location: hotel(Self).
 
action hotel_guest(>Self:guest)
"Self lounges in their room.":
 location: hotel(Self).
 
%TOWNHALL
action townhall_mayor(>Self:mayor)
"Self presides over town business.":
 location: townhall(Self).
 
action townhall_clerk(>Self:clerk)
"Self collects complaints from locals.":
 location: townhall(Self).
 
action townhall_regular(>Self:regular)
"Self visits the town hall.":
 location: townhall(Self).
 
action townhall_visitor(>Self:visitor)
"Self visits the town hall.":
 location: townhall(Self).
 
%BUTCHERSHOP
action butchershop_butcher(>Self:butcher)
"Self butchers meat.":
 location: butchershop(Self).

action butchershop_visitor(>Self:visitor)
"Self buys meat at the butchershop.":
 location: butchershop(Self).
 
%BAKERY
action bakery_baker(>Self:baker)
"Self kneads dough and bakes bread.":
 location: bakery(Self).
 
action bakery_visitor(>Self:visitor)
"Self buys bread at the bakery.":
 location: bakery(Self).
 
%MASONICLODGE
action masoniclodge_grandmaster(>Self:grandmaster)
"Self runs the lodge.":
 location: masoniclodge(Self).
 
action masoniclodge_freemason(>Self:freemason)
"Self visits the lodge.":
 location: masoniclodge(Self).
 
%GENTLEMENSCLUB
action gentlemensclub_member(>Self:member)
"Self smokes at the gentlemen's club.":
 location: gentlemensclub(Self).
 
%SOCIALPARLOUR
action socialparlour_member(>Self:member)
"Self visits the women's social parlour.":
 location: socialparlour(Self).
 
%UNION
action union_member(>Self:member)
"Self organizes labour at the union headquarters.":
 location: union(Self).
 
%APOTHECARY
action apothecary_owner(>Self:owner)
"Self prepares tinctures.":
 location: apothecary(Self).
 
action apothecary_visitor(>Self:visitor)
"Self purchases tinctures at the apothecary.":
 location: apothecary(Self).
 
%FUNERALHOME
action funeralhome_mortician(>Self:mortician)
"Self prepares the dead.":
 location: funeralhome(Self).

action funeralhome_visitor(>Self:visitor)
"Self mourns at the funeralhome.":
 location: funeralhome(Self).
 
%CHARITYHOUSE
action charityhouse_volunteer(>Self:volunteer)
"Self volunteers to help the destitute.":
 location: charityhouse(Self).
 
action charityhouse_resident(>Self:resident)
"Self rests in their bed.":
 location: charityhouse(Self).
 
%VETERANSHOME
action veteranshome_resident(>Self)
"Self rests in their bed.":
 location: veteranshome(Self).
 
%BUSINESSASSOCIATION
action businessassociation_member(>Self:member)
"Self conducts deals among business owners.":
 location: businessassociation(Self).
 
action businessassociation_associate(>Self:associate)
"Self supports local businesses.":
 location: businessassociation(Self).
 
%UNIVERSITY
action university_provost(>Self:provost)
"Self runs the university.":
 location: university(Self).

action university_clerk(>Self:clerk)
"Self files paperwork and fetches research.":
 location: university(Self).
 
action university_janitor(>Self:janitor)
"Self does groundskeeping around campus.":
 location: university(Self).
 
action university_professor_of_medievalmetaphysics(>Self:professor_of_medievalmetaphysics)
"Self teaches medieval metaphysics.":
 location: university(Self).
 
action university_student_of_medievalmetaphysics(>Self:student_of_medievalmetaphysics)
"Self researches medieval metaphysics.":
 location: university(Self).

action university_professor_of_archaeology(>Self:professor_of_archaeology)
"Self teaches archaeology.":
 location: university(Self).
 
action university_student_of_archaeology(>Self:student_of_archaeology)
"Self researches archaeology.":
 location: university(Self).
 
action university_professor_of_anthropology(>Self:professor_of_anthropology)
"Self teaches anthropology.":
 location: university(Self).
 
action university_student_of_anthropology(>Self:student_of_anthropology)
"Self researches anthropology.":
 location: university(Self).
 
action university_professor_of_linguistics(>Self:professor_of_linguistics)
"Self teaches linguistics.":
 location: university(Self).
 
action university_student_of_linguistics(>Self:student_of_linguistics)
"Self researches linguistics.":
 location: university(Self).
 
action university_professor_of_history(>Self:professor_of_history)
"Self teaches history.":
 location: university(Self).
 
action university_student_of_history(>Self:student_of_history)
"Self researches history.":
 location: university(Self).
 
action university_professor_of_psychology(>Self:professor_of_psychology)
"Self teaches psychology.":
 location: university(Self).
 
action university_student_of_psychology(>Self:student_of_psychology)
"Self researches psychology.":
 location: university(Self).
 
action university_professor_of_science(>Self:professor_of_science)
"Self teaches science.":
 location: university(Self).
 
action university_student_of_science(>Self:student_of_science)
"Self researches science.":
 location: university(Self).
 
%STUDENT APARTMENT
action student_apartment_resident(>Self:resident)
"Self rests in their apartment.":
 location: studentapartment(Self).
 
action student_apartment_visitor(>Self:visitor)
"Self visits a student.":
 location: studentapartment(Self).

% fantasy_broad.kismet

action chit_chat(>Self, <Other):
    tags: talk;
    result: Self and Other like each other += 1.
    
action complain_to_and_make_annoyed(>Self, <Other):
    tags: talk, critical, failure;
    if Other is not compassionate;
    result: Self likes Other +=1,
        Other like Self -= 1.

action complain_to_compassionate(>Self, <Other):
    tags: talk, critical;
    if Other is not compassionate;
    result: Self and Other like each other += 1,
            Self's self_worth += 1,
            Other's self_worth += 1.

action flirt_at(>Self, <Other):
    tags: talk, romance, failure;
    result: Self loves Other +=1,
        Other likes Self -= 1.
        
action flirt_with(>Self, <Other):
    tags: talk, romance;
    result: Self and Other love each other += 1,
            Self and Other like each other += 1.

action use_humor_to_spark_love(>Self, <Other):
    tags: talk, silly, romance;
    result: Other is crushing_on Self,
            Self and Other love each other += 1,
            Self and Other like each other += 1.

action be_open_about_crush(>Self, <Other):
    tags: romance, bold, specific;
    if Self is crushing_on Other,
       Other loves Self >= 1;
   result:
       Self and Other love each other += 2,
       Self and Other like each other += 2.

action be_open_about_crush_and_burn(>Self, <Other):
    tags: romance, bold, specific, failure;
    if Self is crushing_on Other,
       Other loves Self <= 0;
   result:
       Self doesn't have crushing_on Other,
       Self's self_worth -= 2.
       
action develop_crush(>Self,<Other):
    tags: romance;
    result: Self is crushing_on Other.

action pine_over(>Self,<Other):
    tags: romance;
    result: Self loves Other += 1.

action make_out_with(>Self, <Other):
    tags:  romance;
    if Self love Other >= 3, 
		Other love Self >= 3;
    result: Self and Other love each other += 1,
            Self and Other like each other += 1.

action blow_up_love_triangle(>Self, <Other, ^ThirdWheel):
    tags: talk, romance, angry;
    if Self love Other >= 3, 
 Other love Self >= 3,
       Other love ThirdWheel >= 3, 
 ThirdWheel love Other >= 3;
    result: Self and Other love each other -= 5,
            Self and Other like each other -= 5,
            Self and ThirdWheel like each other -= 5,
            Self and ThirdWheel love each other -= 5.

action plot_about_sabotaging_romantic_rival(>Self, <Other, ^ThirdWheel):
    location: ?(Self, Other, ThirdWheel);
    tags: talk, romance, angry;
    if 
        Self love Other >= 3, 
        Other love Self >= 3,
        Other love ThirdWheel >= 3, 
        ThirdWheel love Other >= 3;
    result: Self likes ThirdWheel -= 2,
            Self loves ThirdWheel -= 2.

action reject_romance(>Self, <Other):
    tags: talk;
    if Other loves Self >= 5,
       Self likes Other <= 0;
    result: Other loves Self -= 5,
            Other likes Self -= 5,
            Other's shame += 1,
            Other's self_worth -=1.

action insult_as_bully(>Self, <Other):
    tags: talk, mean,specific;
    if Self is bully;
    result: Self's self_worth += 1,
        Other likes Self -= 3.
                
action insult(>Self, <Other):
    tags: talk, mean;
    if Self is not bully;
    result: Self's self_worth -= 1,
        Other likes Self -= 3.

action sulk(>Self):
    tags: worry;
    if Self's self_worth <= -3.

action have_catharsis(>Self):
    tags: thoughtful;
    if Self's self_worth <= -3;
    result: Self's self_worth += 1.

action try_to_help_struggling_friend(>Self, <Other):
    tags: thoughtful;
    if Other's self_worth <= -3,
        Self likes Other >= 3,
        Other likes Self >= 3;
    result: Self and Other like each other += 1.
    
action help_struggling_friend(>Self, <Other):
    tags: kind, thoughtful,specific;
    if Other's self_worth <= -3,
        Self like Other >= 3, 
		Other like Self >= 3;
    result: Self and Other like each other += 1,
            Self's self_worth += 1.

action share_personal_info(>Self, <Other):
    tags: talk, bold, thoughtful;
    result: Self and Other like each other += 1,
            Other knows_personal_info_about Self.

action help_really_struggling_person(>Self, <Other):
    tags: kind, thoughtful;
    if Other's self_worth <= -5;
    result: Self and Other like each other += 1,
            Self's self_worth += 1.

action joke_around_with(>Self, <Other):
    tags: talk, silly;
    result: Self and Other like each other += 2.

action joke_around_with_the_wrong_person(>Self, <Other):
    tags: talk, silly,specific, failure;
    if pattern(non_joker,Other);
    result: Other likes Self -= 2.

action criticize(>Self, <Other):
    tags: talk, critical;
    result: Other likes Self -= 1.
    
action provide_critical_feedback(>Self, <Other):
    tags: talk, critical,specific;
    if Other is agreeable;
    result: Self and Other like each other += 1.

action get_into_argument(>Self, <Other):
    tags: talk, critical;
    if Self likes Other <= -1,
        Other likes Self <= -1;
    result: Self and Other like each other -= 1. 

action impress(>Self, <Other):
    tags: talk, bold;
    result: Self's self_worth += 1,
            Self and Other like each other += 1.
            
action try_to_impress_and_fail(>Self, <Other):
    tags: talk, bold, failure;
    result: Self's self_worth -= 1,
            Self and Other like each other -= 1.

action stand_up_for_friend_and_persuade(>Self, <Other,^Friend):
    location: (Self, Other) ?(Friend);
    tags: talk, bold;
    if pattern(dislikes_friend,Self,Other,Friend);
    result: 
        Friend likes Self += 1,
        Self's self_worth += 1,
        Other likes Friend += 1,
        Other likes Self += 1.
        
action stand_up_for_friend_and_fail(>Self, <Other,^Friend):
    location: (Self, Other) ?(Friend);
    tags: talk, bold, failure;
    if pattern(dislikes_friend,Self,Other,Friend);
    result: 
        Friend likes Self += 1,
        Self's self_worth += 1,
        Other likes Friend -= 1,
        Other likes Self -= 1.

action pray(>Monk:monk):
    tags: religious, role_specific;
    result: Monk's devotion += 1.
    
action pray_with_follower(>Monk:monk, <Follower:follower):
    tags: religious, role_specific;
    result: Monk's devotion += 1, Follower's devotion += 1.
    
action perform_ritual(>Monk:monk, <Other:monk):
    tags: religious, role_specific;
    result: Monk's devotion += 2,
            Other's devotion += 2.
            
action screw_up_ritual(>Monk:monk, <Other:monk):
    tags: religious, failure, role_specific;
    result: Monk's devotion -= 1,
            Other's devotion -= 1,
            Other likes Monk -= 2.
            
action have_crisis_of_faith(>Monk:monk):
    tags: religious, worry, role_specific;
    result: Monk's devotion -=2,
            Monk's self_worth -=1.

action manage_mine(>Foreman:foreman):
    tags: work, role_specific.
    
action boss_miner_around(>Foreman:foreman, <Miner:miner):
    tags: work, critical, role_specific;
    result: Miner likes Foreman -= 1.
    
action manage_dispute_between_miners(>Foreman:foreman, <Miner:miner, ^Miner2:miner):
    tags: work, thoughtful, kind, role_specific;
    if Miner likes Miner2 <= -1,
        Miner2 likes Miner <= -1;
    result: Miner and Miner2 like each other += 1,
            Miner respects Foreman += 1,
            Miner2 respects Foreman += 1.
            
action endanger_miners(>Foreman:foreman, <Miner:miner, ^Miner2:miner):  
    tags: work, risky, role_specific;
    result: Miner likes Foreman -= 2,
            Miner2 likes Foreman -= 2,
            Miner respects Foreman -= 2,
            Miner2 respects Foreman -= 2.
    
action strike_motherlode(>Foreman:foreman, <Miner:miner, ^Miner2:miner):  
    tags: work, risky, rare, role_specific;
    result: Foreman's self_worth +=2,
            Miner likes Foreman += 2,
            Miner2 likes Foreman += 2,
            Miner respects Foreman += 2,
            Miner2 respects Foreman += 2.

action work_at_mine(>Miner:miner):
    tags: work, role_specific;
    result: Miner's tiredness += 1.

action hold_auction(>Auctioneer:auctioneer, <P1:patron, ^P2:patron):
    tags: work, bold, talk, role_specific;   
    result: 
        P1's self_worth += 1,
        Auctioneer's self_worth += 1.
      
action discuss_collection(>Auctioneer:auctioneer, <Curator:curator):
    tags: work,  talk, thoughtful, role_specific;   
    result: 
        Auctioneer and Curator like each other += 1.

action demand_a_new_piece(>Auctioneer:auctioneer, <Curator:curator):
    tags: work,  talk, mean;   
    result: 
        Auctioneer and Curator like each other -=2.

action curate_collection(>Curator:curator):
    tags: work, role_specific.
    
action acquire_artifacts(>Curator:curator):
    tags: work, bold, role_specific;
    result: Curator's self_worth += 1.
    
action discuss_collection(>Curator:curator, <Other):
    tags: work, talk, role_specific;
    result: Other respects Curator += 1.

    action sell_wares(>Vendor:vendor, <Other):
    tags: work, role_specific;
    result: Vendor likes Other += 1.
    
action give_deal_to(>Vendor:vendor, <Other):
    tags: work, kind, talk, role_specific;
    if Vendor likes Other >= 3;
    result: Other likes Vendor += 2.

action hustle(>Vendor: vendor, <Other):
    tags: work, bold, mean, risky, role_specific;
    if Vendor likes Other <= 0;
    result: Vendor's self_worth += 1,
            Other likes Vendor -= 1.

action commiserate_with_fellow_vendor(>Vendor:vendor, <OtherVendor:vendor):
    tags: work, talk, thoughtful, kind, role_specific;
    result: Vendor and OtherVendor like each other += 1.

action undercut(>Vendor:vendor, <Other:vendor):
    tags: work, bold, mean, role_specific;
    if Vendor likes Other <= 0;
    result: Vendor's self_worth += 1,
            Other likes Vendor -= 1.

action standup_to_enforcer_together(>Vendor:vendor, <OtherVendor:vendor, ^Enforcer):
    tags: work, bold, role_specific;
    if Vendor fears Enforcer >= 6,
        OtherVendor fears Enforcer >= 6;
    result: Vendor and OtherVendor like each other += 5,
        Vendor fears Enforcer -= 3,
        OtherVendor fears Enforcer -= 3,
        Enforcer likes Vendor -= 3,
        Enforcer likes OtherVendor -=3.

action collect_protection_fees(>Enforcer:enforcer, <Vendor:vendor):
    tags: work, mean, risky, criminal, role_specific;
    result: Vendor likes Enforcer -= 1.

action rough_up(>Enforcer:enforcer, <Vendor:vendor):
    tags: work, mean, risky, criminal, role_specific;
    result: Vendor likes Enforcer -= 2,
            Vendor fears Enforcer += 2.

action load_cargo(>Dockworker:dockworker):
    tags: work, role_specific;
    result: Dockworker's tiredness += 1.

action fight_seagull(>Dockworker:dockworker):
    tags: angry, rare, role_specific;
    result: Dockworker's anger += 1.

    action stock_books(>Librarian:librarian):
    tags: work, scholarly, role_specific;
    result: Librarian's tiredness += 1.
    
action shush_patron(>Librarian:librarian, <Patron:guest):
    tags: work, mean, bold, role_specific;
    result: Patron likes Librarian -= 1,
            Patron's shame += 1.
            
action assist_research(>Librarian:librarian, <Researcher:researcher):
    tags: work, scholarly, role_specific;
    result: Librarian and Researcher like each other += 1,
            Librarian's self_worth += 1.

action assist_research(>Librarian:librarian, <Researcher:guest):
    tags: work, scholarly, role_specific;
    if Researcher is scholar;
    result: Librarian and Researcher like each other += 1,
            Librarian's self_worth += 1.

action assist_student(>Librarian:librarian, <Researcher:student):
    tags: work, scholarly, role_specific;
    result: Librarian and Researcher like each other += 1,
            Librarian's self_worth += 1.

action search_for_artistic_inspiration_at_location(>Self,@Location): 
    tags: role_specific, work;
    location: Location(Self);
    if Self is artist;
    result:
        Self is inspired with Location.
    
action find_muse(>Self, <Other): 
    tags: role_specific, work;
    if Self is artist;
    result:
        Self is inspired with Other.
        
action produce_work_about_muse(>Self:artist,<Other):
    tags: role_specific, work;
    location: (Self) ?(Other);
    if Self is inspired with Other;
    result:
        Self's self_worth += 1,
        Self is has_art.
        
action produce_work_about_inspiration(>Self:artist,@Other):
    tags: role_specific, work;
    location: (Self);
    if Self is inspired with Other;
    result:
        Self's self_worth += 1,
        Self is has_art.
    
action lose_muse(>Self:artist,<Other):
    tags: role_specific, work, failure;
    location: (Self) ?(Other);
    if Self is inspired with Other;
    result:
        Self's self_worth -= 3,
        Self is not inspired with Other.
        
action lose_inspiration(>Self:artist,@Other):
    tags: role_specific, work, failure;
    location: (Self);
    if Self is inspired with Other;
    result:
        Self's self_worth -= 3,
        Self is not inspired with Other.

action discuss_art(>Self:artist,<Other):
    tags: role_specific, talk;
    if Self has_art;
    result:
        Self and Other like each other += 2.
    
action give_art_to_benefactor(>Self:artist,<Baron):
    tags: role_specific, talk;
    if Self has_art,
        Self is servant of Baron;
    result:
        Baron likes Self += 2.

action prepare_auction(>Auctioneer:auctioneer):
    tags:  role_specific, work;
    result:  Auctioneer's readiness += 1.

action prime_auction_goer(>Auctioneer:auctioneer, <Attendee):
    tags: role_specific, work, talk;
    if Attendee is rich;
    result: 
        Attendee likes Auctioneer += 1,
        Attendee's auction_readiness += 1,
        Auctioneer's readiness += 1.

action hold_auction_with_bidding_war(>Auctioneer:auctioneer, <Bidder1, ^Bidder2):
    tags: role_specific, work, talk, bold;
    if Bidder1's auction_readiness >= 1,
        Bidder2's auction_readiness >= 1,
        Auctioneer's readiness >= 5;
    result: 
        Auctioneer's readiness = 0,
        Bidder1's happiness += 5,
        Bidder2's happiness -= 5,
        Bidder1 and Bidder2 like each other -= 5.

action hold_auction_with_no_results(>Auctioneer:auctioneer, <Bidder1, ^Bidder2):
    tags: role_specific, work, talk, bold, failure;
    if Auctioneer's readiness >= 5;
    result: 
        Auctioneer's readiness = 0,
        Auctioneer's happiness -= 5.

action serve_patron(>Barkeep:barkeep, <Patron:patron):
    tags: work, role_specific;
    result: Patron is drunk,
            Patron's tiredness = 0.
           
action chat_with_regular(>Barkeep:barkeep, <Regular:regular):
    tags: role_specific, talk;
    result: Regular is drunk,
            Regular and Barkeep like each other += 1.
            
action breakup_barfight(>Barkeep:barkeep,<Fighter1,^Fighter2):
    tags: role_specific,thoughtful;
    if Fighter1 is drunk,
        Fighter2 is drunk,
        Fighter1 likes Fighter2  <= -3,
        Fighter2 likes Fighter1 <= -3;
    result:
        Barkeep likes Fighter1 -= 3,
        Barkeep likes Fighter2 -= 3,
        Fighter1 and Fighter2 like each other -= 3.
        
action breakup_cathartic_barfight(>Barkeep:barkeep,<Fighter1,^Fighter2):
    tags: role_specific,thoughtful;
    if Fighter1 is drunk,
        Fighter2 is drunk,
        Fighter1 likes Fighter2  <= -3,
        Fighter2 likes Fighter1 <= -3;
    result:
        Barkeep and Fighter2 like each other += 3,
        Fighter1 and Barkeep like each other += 3,
        Fighter1 and Fighter2 like each other += 3.

action sober_up(>Drunk):
    tags: specific;
    if Drunk is drunk;
    result: Drunk isn't drunk.

    action perform_for_tourist(>Self:diva, <Watcher:tourist): 
    tags: role_specific, talk; 
    result: Self's tiredness += 1,
            Self's self_worth += 1,
            Watcher likes Self += 2.


action perform_for_tourist(>Self:diva, <Watcher:tourist): 
    tags: role_specific, talk; 
    result: Self's tiredness += 1,
            Self's self_worth += 1,
            Watcher likes Self += 2.


action turn_fan_into_superfan(>Self:diva, <Watcher:tourist): 
    tags: role_specific, talk; 
    result: Watcher is crushing_on Self,
            Watcher likes Self += 2.

action turn_fan_into_superfan(>Self:diva, <Watcher:patron): 
    tags: role_specific, talk; 
    result: Watcher is crushing_on Self,
            Watcher likes Self += 2.

action belittle_other_performers(>Self:diva, <Performer:bard):
    tags: role_specific, mean;
    result: Self and Performer like each other -= 2.
    
action feud_with_diva(>Self:diva, <Other:diva):
    tags: role_specific, mean;
    result: Self and Other like each other -= 3.
    
action demand_more_of_impresario(>Self:diva, <Other:impresario):
    tags: role_specific, mean;
    result: Self likes Other += 1,
            Other like Self -= 1.

action deliver_stunning_perfomance(>Self:diva, <Patron:patron, ^Impresario:impresario):
    tags: role_specific, talk, rare;
    result: Patron likes Self += 5,
            Patron likes Impresario += 5,
            Impresario likes Self += 5,
            Self's self_worth += 5.


    action perform_research(>Self:researcher): 
    tags: role_specific, work, scholarly; 
    result: Self's tiredness += 1,
            Self's self_worth += 1.

action uncover_information_about_noteworthy_person(>Self:researcher,^Noteworthy): 
    tags: role_specific, work, scholarly, rare; 
    location: (Self) (Noteworthy);
    if Noteworthy is noteworthy;
    result: Self knows_personal_info_about Noteworthy.
    

action share_knowledge_about_noteworthy(>Self,<Listener,^Noteworthy):
    tags: specific, talk, free;
    location: (Self, Listener) (Noteworthy);
    if Self knows_personal_info_about Noteworthy,
        Noteworthy is noteworthy;
    result: Listener knows_personal_info_about Noteworthy,
            Self and Listener like each other += 1.

    action acquire_ingredients(>Chef, <ShopOwner:vendor):
    tags: work, role_specific;
    if Chef is chef;
    result: 
        Chef and ShopOwner like each other += 1.
        
action develop_recipe(>Chef:chef):
    tags: work, role_specific;
    result: Chef's self_worth += 1.
    
action boss_cooks_around(>Chef:chef,<Cook:worker):
    tags: work, mean, role_specific;
    result: 
    Cook likes Chef -= 1.

action mentor_cook(>Chef:chef,<Cook:worker):
    tags: work, kind, role_specific;
    result: 
    Cook likes Chef += 1.
    
action create_culinary_masterpiece(>Chef:chef,<Guest:guest):
    tags: work, rare, role_specific;
    result:
        Chef's self_worth += 2,
        Guest respects Chef += 3,
        Guest's happiness += 2.
        
//GENERIC EMPLOYEE STUFF
action bitch_about_boss(>Worker, <Coworker, ^Boss):
    location: (Worker,Coworker) ?(Boss);
    tags: work, mean, role_specific;
    if Worker is coworker of Coworker,
        Worker is employee of Boss;
    result: Worker and Coworker like each other +=1,
        Coworker likes Boss -= 1.
        
action bitch_about_boss_to_resistance(>Worker, <Coworker, ^Boss):
    location: (Worker,Coworker) ?(Boss);
    tags: work, mean, failure, role_specific;
    if Coworker likes Boss >= 3,
        Worker is coworker of Coworker,
        Worker is employee of Boss;
    result: Worker and Coworker like each other -=1.
        
action praise_boss(>Worker, <Coworker, ^Boss):
    location: (Worker,Coworker) ?(Boss);
    tags: work, kind, role_specific;
    if Worker likes Boss >= 3,
        Worker is coworker of Coworker,
        Worker is employee of Boss;
    result: Worker and Coworker like each other +=1,
        Coworker likes Boss += 1.
        
action praise_boss_to_resistance(>Worker, <Coworker, ^Boss):
    location: (Worker,Coworker) ?(Boss);
    tags: work, kind, role_specific;
    if Worker likes Boss >= 3,
        Coworker likes Boss <= -1,
        Worker is coworker of Coworker,
        Worker is employee of Boss;
    result: Worker and Coworker like each other -=1.

    action search_for_treasure(>TreasureHunter:treasure_hunter):
    tags: work, bold, criminal, role_specific;
    result: TreasureHunter's tiredness += 1.
    
action find_treasure(>TreasureHunter:treasure_hunter):
    tags: work, bold, criminal, rare, role_specific;
    result: TreasureHunter's self_worth += 5,
            TreasureHunter is rich. 
            
action investigate_ruins(>TreasureHunter:treasure_hunter):
    tags: work, scholarly, thoughtful, role_specific.
    
action trigger_trap(>TreasureHunter:treasure_hunter):
    tags: work, careless, role_specific;
    result: TreasureHunter's self_worth -= 1.
    
action sabotage_rival_treasure_hunter(>TreasureHunter:treasure_hunter,<OtherTH:treasure_hunter):
    tags: work, mean, bold, role_specific;
    if TreasureHunter is rival of OtherTH;
    result: 
        OtherTH likes TreasureHunter -= 1,
        OtherTH respects TreasureHunter += 1.
                               
action overcome_rivalry_to_work_together(>TreasureHunter:treasure_hunter,<OtherTH:treasure_hunter):
    tags: work, kind, bold, role_specific;
    if TreasureHunter is rival of OtherTH;
    result: 
        TreasureHunter and OtherTH like each other += 1.

action investigate_ruins(>Archaelogist:archaelogist):
    tags: work, scholarly, thoughtful, role_specific.

action catalog_findings(>Archaelogist:archaelogist):
    tags: work, scholarly, thoughtful, role_specific.
    
action argue_with_treasure_hunter(>Archaelogist:archaelogist, <TreasureHunter:treasure_hunter):
    tags: talk, critical, role_specific;
    if Archaelogist is rival of TreasureHunter;
    result: Archaelogist and TreasureHunter like each other -= 1.
    
action develop_begrudging_respect_towards(>Archaelogist:archaelogist, <TreasureHunter:treasure_hunter):
    tags: talk, kind, role_specific;
    if Archaelogist is rival of TreasureHunter;
    result: Archaelogist and TreasureHunter like each other += 1.

    action perform_to_no_effect(>Bard:bard):
    tags: work, talk, role_specific;
    result: Bard's tiredness += 1.
    
action amuse_with_performance(>Bard:bard, <Tourist:tourist):
    tags: work, talk, role_specific;
    result: Bard's self_worth += 1,
            Tourist likes Bard += 1.

action grouse_backstage(>Bard:bard, <Other:bard):
    tags: work, criticial, role_specific;
    result: Bard and Other like each other -= 1.

action encourage_fellow_performer(>Bard:bard, <Other:bard):
    tags: work, kind;
    result: Bard and Other like each other += 1.

action annoy_diva_for_laughs(>Bard:bard, <Diva:diva, ^Other:bard):
    tags: work, mean, silly, role_specific;
    if Other likes Diva <= -1;
    result: Bard's self_worth += 1,
            Diva likes Bard -= 1,
            Bard and Other like each other += 1.

action become_annoyed_with_bard(>Tourist:tourist, <Bard:bard):
    tags: critical, role_specific;
    result: Tourist likes Bard -= 1.
    
action be_amused_by_bard(>Tourist:tourist, <Bard:bard):
    tags: silly, role_specific;
    result: Tourist likes Bard += 1.

action make_judicious_decree(>Monarch:monarch,<O1,^O2):
    tags: work, thoughtful, role_specific;
    if Monarch is monarch,
        O1 has fealty to Monarch,
        O2 has fealty to Monarch;
    result: O1 likes Monarch += 1,
            O2 likes Monarch += 1.
            
action make_imprudent_decree(>Monarch:monarch,<O1,^O2):
    tags: work, careless, role_specific;
    if Monarch is monarch,
        O1 has fealty to Monarch,
        O2 has fealty to Monarch;
    result: O1 likes Monarch -= 1,
            O2 likes Monarch -= 1.
            
action make_callous_decree(>Monarch:monarch,<O1,^O2):
    tags: work, mean, role_specific;
    if Monarch is monarch,
        O1 has fealty to Monarch,
        O2 has fealty to Monarch;
    result: O1 likes Monarch -= 1,
            O2 likes Monarch -= 1.
            
action make_benevolent_decree(>Monarch:monarch,<O1,^O2):
    tags: work, kind, role_specific;
    if Monarch is monarch,
        O1 has fealty to Monarch,
        O2 has fealty to Monarch;
    result: O1 likes Monarch += 1,
            O2 likes Monarch += 1.
            
action banish_monarchling(>Monarch:monarch, <Child):
    tags: mean, rare, role_specific;
    if Monarch is monarch,
        Monarch likes Child <= -5,
        Child is child of Monarch,
        Child's age >= 16,
        Child is royalty;
    result: Child is not royalty,
        Child is ex_royalty,
        Child is missing hometown,
        Child likes Monarch -= 10.

action consult_with_chancellor(>Monarch:monarch, <Chancellor:chancellor):
    tags: work, thoughtful, role_specific;
    result: Monarch and Chancellor like each other += 1.

action sway_monarch_to_kindness(>Chancellor:chancellor, <Monarch:monarch):
    tags: kind, talk, bold, rare, role_specific;
    result: Monarch is compassionate,
            Monarch is not indifferent.
    
action sway_monarch_to_indifference(>Chancellor:chancellor, <Monarch:monarch):
    tags: mean, talk, bold, rare, role_specific;
    result: Monarch is not compassionate,
            Monarch is  indifferent.

action support_banished_sibling(>Monarchling, <ExMonarchling):
    tags: kind, free, role_specific;
    if Monarchling is royalty, ExMonarchling is ex_royalty, 
            Monarchling is sibling of ExMonarchling;
    result: Monarchling and ExMonarchling like each other +=1.
    
action shun_banished_sibling(>Monarchling, <ExMonarchling):
    tags: mean, duty, role_specific;
    if Monarchling is royalty, ExMonarchling is ex_royalty, 
            Monarchling is sibling of ExMonarchling;
    result: Monarchling and ExMonarchling like each other -=1.

% Childish things for Childlings
action play(>Child):
    tags: silly;
    if Child's age <= 15;
    result: Child's happiness += 1.
    
action play_together(>Child, <OtherChild):
    tags: silly, kind, talk;
    if Child's age <= 15,
        OtherChild's age <= 15;
    result: Child's happiness += 1,
        OtherChild's happiness += 1,
        Child and OtherChild like each other += 1.
        
action argue_with_playmate(>Child, <OtherChild):
    tags: critical, mean;
    if Child's age <= 15,
        OtherChild's age <= 15;
    result: Child's happiness -= 1,
        OtherChild's happiness -= 1,
        Child and OtherChild like each other -= 1.
            
% Adultish things
action worry_about_future(>Adult):
    tags: critical, worry;
    if Adult's age >= 35;
    result: Adult's tiredness += 1.
    
action worry_about_mortality(>Adult):
    tags: critical, worry;
    if Adult's age >= 55;
    result: Adult's tiredness += 1,
        Adult's happiness -= 1.
        
% Personality Clashes

action argue_about_duty(>Dutybound, <Free):
    tags: critical, role_specific;
    if Dutybound is duty_bound, Free is free_sprited;
    result: Dutybound and Free like each other -= 1.
    
action convince_importance_of_duty(>Dutybound, <Free):
    tags: thoughtful, role_specific;
    if Dutybound is duty_bound, Free is free_sprited;
    result: Dutybound and Free like each other += 1.
    
action argue_about_need_to_be_free(>Free, <Dutybound):
    tags: critical, role_specific;
    if Dutybound is duty_bound, Free is free_sprited;
    result: Dutybound and Free like each other -= 1.
    
action convince_importance_of_duty(>Free, <Dutybound):
    tags: thoughtful, role_specific;
    if Dutybound is duty_bound, Free is free_sprited;
    result: Dutybound and Free like each other += 1.

action hold_lecture(>Professor:professor, <Student:student):
    tags: work, scholarly, role_specific;
    result:
        Student likes Professor += 1,
        Professor's self_worth += 1.

action hold_boring_lecture(>Professor:professor, <Student:student)
    "Professor holds a lecture that bores Student who grows to dislike Professor":
    tags: work, scholarly,failure, role_specific;
    result:
        Student likes Professor -= 1,
        Professor's self_worth -= 1.
                                           
action perform_research(>Professor:professor):
    tags: work, scholarly, role_specific;
    result:
        Professor's self_worth += 1.

action conspire_against(>SpyMaster:spy_master, <Target):
    tags: rare, mean, role_specific;
    location: (SpyMaster) ?(Target);
    if Target is important;
    result: SpyMaster likes Target -= 1,
            SpyMaster is plotting_against Target = 3.
            
action send_underlings(>SpyMaster:spy_master, <Spy:spy, ^Target):
    tags: work, role_specific;
    location: (SpyMaster) ?(Target);
    if SpyMaster plotting_against Target >= 1;
    result: SpyMaster is plotting_against Target -= 1,
        Spy  is plotting_against Target = 1.

action ready_the_ship(>Sailor:sailor):
    tags:  role_specific, work;
    result: Sailor's tiredness += 1.
        
action sing_shanty(>Sailor:sailor, <Other:sailor):
    tags:  role_specific, talk, bold;
    result: Sailor and Other like each other += 2,
            Sailor's happiness += 1,
            Other's happiness += 1.

action investigate_target(>Spy, ^Target): 
    tags: role_specific, work; 
    if Spy is spy,
        Spy is plotting_against Target >= 1;
    result: 
        Spy knows_personal_info_about Target.

action get_too_close_to_target(>Spy, ^Target): 
    tags: role_specific, talk, kind; 
    if Spy is spy,
        Spy is plotting_against Target >= 1;
    result: 
        Spy and Target like each other += 2.
        
action report_back(>Spy:spy, <Spymaster:spy_master, ^Target): 
    tags: role_specific, talk, kind;
    location: (Spy, Spymaster) (Target);
    if Spy knows_personal_info_about Target,
        Spy is plotting_against Target >= 1;
    result: 
        Spymaster knows_personal_info_about Target,
        Spymaster likes Spy += 1.

action turn_against_spymaster(>Spy, <Target, ^Spymaster ): 
    tags: role_specific, talk, kind; 
    location: (Spy, Target) (Spymaster);
    if Spy is spy,
        Spymaster is spy_master,
        Spy is plotting_against Target >= 1,
        Spy likes Target >= 5;
    result: 
        Spy is plotting_against Target -= 10,
        Spy likes Spymaster -= 10.

action teach_student(>Tutor:tutor, <Student):
    tags: work, scholarly, role_specific;
    if Tutor is tutor to Student;
    result:
        Student likes Tutor += 1,
        Tutor's self_worth += 1.
                    
action bore_student(>Tutor:tutor, <Student)
    "Tutor bores Student who grows to dislike Tutor":
    tags: work, scholarly,failure, role_specific;
    if Tutor is tutor to Student;
    result:
        Student likes Tutor -= 1,
        Tutor's self_worth -= 1.

action build_ship(>Self:ship_builder): 
    tags: role_specific, work; 
    result: Self's tiredness += 1.


action help_with_ship_building(>Self:ship_builder, <Other:ship_builder): 
    tags: role_specific, work, kind; 
    result: Self and Other like each other += 1.


action argue_with_engineer(>Self:ship_builder, <Other:engineer): 
    tags: role_specific, work, critical; 
    result: Self and Other like each other -= 1.

action entice_customer(>Self:prostitute, <Other): 
    tags: role_specific, work; 
    result: Other likes Self += 1.

action attend_class(>Self:student): 
    tags: role_specific, scholarly; 
    result: Self's tiredness += 1.


action become_inspired_by_lecture(>Self:student, <Professor:professor): 
    tags: role_specific, scholarly; 
    result: Self likes Professor += 1,
            Self's self_worth += 1.
        
action bond_over_study(>Student1, <Student2):
    tags: role_specific, scholarly;
    if Student1 is student,
        Student2 is student;
    result: Student1 and Student2 like each other += 2.

action pull_all_nighter(>Student):
    tags: role_specific, scholarly;
    if Student1 is student;
    result: Student's tiredness += 3.

action hang_out_with_classmates_at_tavern(>Student1, <Student2):
    tags: role_specific, free;
    location: tavern(Student1, Student2);
    if Student1 is student,
        Student2 is student;
    result: Student1 and Student2 like each other += 2,
            Student1 is drunk,
            Student2 is drunk.

action have_fun_in_quad(>Student1, <Student2):
    tags: role_specific, silly;
    location: quad(Student1, Student2);
    if Student1 is student,
        Student2 is student;
    result: Student1 and Student2 like each other += 2,
            Student1's tiredness = 0,
            Student2's tiredness = 0.

action have_late_night_philosophical_argument(>Student1, <Student2):
    tags: role_specific, talk, critical;
    if Student1 is student,
        Student2 is student;
    result: Student1 and Student2 like each other -= 4.

action tend_the_forge(>Self:smith_apprentice): 
    tags: role_specific, work; 
    result: Self's tiredness += 1.

action guard_prison(>Self:guard): 
    tags: role_specific, work; 
    result: Self's tiredness += 1.

action sneak_treat_to_prisoner(>Self:guard, <Prisoner:prisoner): 
    tags: role_specific, work, kind; 
    result: Prisoner likes Self += 2.

action mistreat_prisoner(>Self:guard, <Prisoner:prisoner): 
    tags: role_specific, work, mean; 
    result: Prisoner likes Self -= 2.

action manage_docks(>Self:shipping_foreman): 
    tags: role_specific, work; 
    result: Self's tiredness += 1.

action steal_from_mark(>Self, <Mark): 
    tags: role_specific, work, criminal, bold; 
    if Mark is not criminal, Self is thief;
    result: Self's self_worth += 1,
            Mark's suspicion of Self += 1,
            Mark likes Self -= 1.

action get_caught_stealing(>Self, <Mark): 
    tags: role_specific, work, criminal, bold, failure;
    if Mark's suspicion of Self >= 2, Self is thief;
    result: Mark likes Self -= 5,
            Self's self_worth -=1,
            Self is on_the_run.
        
action run_from_authorities(>Self, <Authority):
    tags: role_specific, criminal;
    if Self is on_the_run,
       Authority is authority;
    result: Self and Authority like each other -= 2.

action evade_authorities(>Self):
    tags: role_specific, criminal;
    if Self is on_the_run;
    result: Self is not on_the_run.

action assuage_benefactor(>Self:impresario, <Patron:patron): 
    tags: role_specific, work, talk; 
    result: Self likes Patron -= 1,
            Patron likes Self += 1,
            Patron's self_worth += 1.
            
action assuage_diva(>Self:impresario, <Diva:diva): 
    tags: role_specific, work, talk; 
    result: Self likes Diva -= 1,
            Diva likes Self += 1,
            Diva's self_worth += 1.

action guide_cast_and_crew(>Self:impresario, <Bard:bad): 
    tags: role_specific, work, talk, kind; 
    result: Self and Bard like each other +=1.

action fend_off_diva_pursuer(>Self:impresario, <Diva:diva, ^Pursuer):
    tags: role_specific, kind;
    if Pursuer crushing_on Diva;
    result: Self and Pursuer like each other -= 5,
            Self and Diva like each other += 3,
            Pursuer is not crushing_on Diva.

action pray_with_follower(>Priest:priest, <Follower:follower):
    tags: religious, role_specific;
    result: Priest's devotion += 1, Follower's devotion += 1.
    
action lead_ritual(>Priest:priest, <Other:monk):
    tags: religious, role_specific;
    result: Priest's devotion += 2,
            Other's devotion += 2.

action rationalize_abuse_of_power(>Priest:priest):
    tags: religious, role_specific, mean;
    if Priest's devotion >= 8;
    result: Priest's abusiveness += 1.

action pray_with_follower(>Priest:high_priest, <Follower:follower):
    tags: religious, role_specific;
    result: Priest's devotion += 1, Follower's devotion += 1.
    
action lead_ritual(>Priest:high_priest, <Other:monk):
    tags: religious, role_specific;
    result: Priest's devotion += 2,
            Other's devotion += 2.

action rationalize_abuse_of_power(>Priest:high_priest):
    tags: religious, role_specific, mean;
    if Priest's devotion >= 8;
    result: Priest's abusiveness += 1.

action steal_from_mark(>Self:pickpocket, <Mark): 
    tags: role_specific, work, criminal, bold; 
    result: Self's self_worth += 1,
            Mark's suspicion of Self += 1.

action get_caught_stealing(>Self:pickpocket, <Mark): 
    tags: role_specific, work, criminal, bold, failure;
    if Mark's suspicion of Self >= 2;
    result: Mark likes Self -= 5,
            Self's self_worth -=1,
            Self is on_the_run.

action design_ship(>Self:engineer): 
    tags: role_specific, work; 
    result: Self's tiredness += 1, Self's self_worth += 1.

action guide_shipwrights(>Self:engineer, <ShipBuilder:ship_builder): 
    tags: role_specific, work, kind; 
    result: Self and ShipBuilder like each other += 1.

action inspire_crew(>Self:captain, <Sailor:sailor): 
    tags: role_specific, work; 
    result: Self's self_worth += 1,
            Sailor's self_worth += 1,
            Self and Sailor like each other += 2.

action provide_guidance(>Self:elder, <Other): 
    tags: role_specific, thoughtful; 
    result: Self and Other like each other += 2.

action fish(>Self:fisher): 
    tags: role_specific, work; 
    result: Self's tiredness += 1,
            Self's self_worth += 1.

action fight_seagull(>Self:fisher): 
    tags: angry, rare, role_specific;
    result: Self's anger += 1.

action command_underlings(>Self:master_thief, <Thief:thief): 
    tags: role_specific, criminal; 
    result: Self and Thief like each other += 1.

action consult_spymaster(>Self:master_thief, <SpyMaster:spy_master): 
    tags: role_specific, criminal, thoughtful; 
    result: Self and SpyMaster like each other += 1.

action patronize(>Self:patron): 
    tags: role_specific; 
    result: Self's happiness += 1.

action patronize_employee(>Self:patron, <Employee:employee): 
    tags: role_specific, mean; 
    result: Self's happiness += 1,
            Employee likes Self -= 2.

action work_the_forge(>Self:smithy): 
    tags: role_specific, work; 
    result: Self's tiredness += 1.

action craft_the_sacred_weapon(>Self:smithy): 
    tags: role_specific, work, extremely_rare;
    if Self is missing sacred_weapon;
    result: Self's self_worth += 5,
            Self has sacred_weapon,
            Self knows_sacred_weapon,
            Self is noteworthy.
            
action talk_about_sacred_weapon(>Talker,<Listener):
    tags: rare, talk, open;
    if Talker knows_sacred_weapon;
    result: Listener knows_sacred_weapon.