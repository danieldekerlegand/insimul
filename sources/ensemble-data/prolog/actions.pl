% deny-up
% DENY
% Scowl
offended_by(initiator, responder), trust(initiator, responder, -, 2).

% candid-up
% BE CANDID
% %x% thinks they know what %y% knows and more!
respect(initiator, responder, +, 1).
% Be self-congratulatory
empty(this_action).
% Brag about something you've done
empty(this_action).
influence(this_action, 5), impress(initiator, responder) :- respect(initiator, responder, >, 7).
% Don't really engage with joke, but show off
respect(initiator, responder, +, 1).
% Humorous recitation
empty(this_action).
% Leave while bragging about self
met(initiator, responder), respect(responder, initiator, +, 1).
% Make them see how awesome you are
empty(this_action).
% One up them
met(initiator, responder), respect(responder, initiator, +, 1).
influence(this_action, 3), impress(initiator, responder) :- jerk(initiator).
% Perform a playful recitation
empty(this_action).
% Politely ask for something in exchange
empty(this_action).
% Pretend to understand
empty(this_action).
% Show off knowledge through small talk
empty(this_action).

% favor-up
% FAVOR
% Give for free
empty(this_action).

% manipulate-up
% MANIPULATE
% Have but say they don't
empty(this_action).

% antagonize-up
% ANTAGONIZE
% Angrily refuse request
empty(this_action).
% Begrudgingly accept thing
empty(this_action).
% Demand ask if they have
empty(this_action).
% Demand thing
empty(this_action).
% Hate
antagonism(initiator, responder, +, 5).
% Insult
empty(this_action).
% Irritated ask for something in return
empty(this_action).
% Respon NEG to insult action
friendship(initiator, responder, -, 1), antagonism(initiator, responder, +, 1).
% Say Goodbye insultingly
empty(this_action).
% antagonize refusal to answer on opinion of subject
empty(this_action).
% antagonize refusal to give facts
empty(this_action).

% humble-up
% BE HUMBLE
% Respond Humbly
empty(this_action).

% depressed-up
% BE DEPRESSED
% Respond Negatively
empty(this_action).

% jokearound-up
% JOKE AROUND
% Joke
empty(this_action).

% suckup-up
% SUCK UP
% Flatter
empty(this_action).

% putdown-up
% PUT DOWN
% Respond Backhandedly
empty(this_action).
% Respond Negatively to Romance
empty(this_action).

% dismiss-up
% DISMISS
% Don't know
trust(initiator, responder, -, 1), trust(responder, initiator, -, 1), negative(initiator, responder), negative(responder, initiator).

% romance-up
% ROMANCE
% Respond Positively to Romance
empty(this_action).
% Respond Romantically
empty(this_action).
% Romantic Compliment
empty(this_action).

% befriend-up
% BEFRIEND
% Friendly Compliment
empty(this_action).
% Respond Positively to Compliment
empty(this_action).

% kind-up
% BE KIND
% Apologize
empty(this_action).
% Apologize for misunderstanding
met(initiator, responder), friendship(initiator, responder, +, 1).
% Appreciative Response
met(initiator, responder).
influence(this_action, 5), kind(initiator, responder) :- respect(initiator, responder, +, 1).
% Chuckle
empty(this_action).
% Compliment
friendship(initiator, responder, +, 1).
% Cool, nice chatting
empty(this_action).
% Don't have
empty(this_action).
% Excuse Self Politely
met(initiator, responder), respect(initiator, responder, -, 1), friendship(responder, initiator, -, 1).
% Friendly attempt to make the conversation go well
empty(this_action).
% Friendly response to a greeting
friendship(initiator, responder, +, 3).
% Gladly acquire thing
indebted(initiator, responder, +, 1).
% Goodbye Response
empty(this_action).
% Humorous Correction
met(initiator, responder), friendship(initiator, responder, +, 1).
influence(this_action, 5), kind(initiator, responder) :- friendly(initiator).
% Introduce Self
friendship(initiator, responder, +, 1) :- met(initiator, responder).
% Introduce Self Back
met(initiator, responder), friendship(initiator, responder, +, 1).
% Joke around with a stranger
met(initiator, responder).
% Just a normal chat chat response to someone %x% likes
friendship(initiator, responder, +, 1).
influence(this_action, 1), kind(initiator, responder) :- friendship(initiator, responder, >, 7).
% Laugh, and make a joke
friendship(initiator, responder, +, 1), respect(initiator, responder, +, 1).
% Learn more about them
empty(this_action).
influence(this_action, 5), kind(initiator, responder) :- loyal(initiator).
% Let's agree to disagree
empty(this_action).
% Misunderstanding
met(initiator, responder), friendship(initiator, responder, +, 1).
% Normal chit chat
empty(this_action).
% Oblige them
met(initiator, responder), friendship(initiator, responder, +, 1).
% Polite ask for
empty(this_action).
% Polite ask if they have
empty(this_action).
% Polite hello
empty(this_action).
influence(this_action, -3), kind(initiator, responder) :- friendship(initiator, responder, <, 4), jerk(responder).
% Polite refuse to acquire
empty(this_action).
% Politely excuse self
empty(this_action).
% Politely refuse
empty(this_action).
% Politely try to end the conversation
respect(initiator, responder, -, 1).
% Reintroduce Self
friendship(initiator, responder, +, 1) :- met(initiator, responder).
% Respond kindly about pizza
friendship(initiator, responder, +, 1).
% Respond positively and caring to insult action
friendship(initiator, responder, +, 1).
% Respond to greeting
empty(this_action).
% Say Goodbye kindly
empty(this_action).
% Share something about yourself
empty(this_action).
influence(this_action, 3), kind(initiator, responder) :- friendly(initiator).
% Share something you are excited about
empty(this_action).
influence(this_action, 3), kind(initiator, responder) :- friendly(initiator), attraction(initiator, responder, >, 7).
% Stop the conversation
friendship(initiator, responder, -, 1).
influence(this_action, -10), kind(initiator, responder).
% Talk about love of pizza
empty(this_action).
% Tell a joke
empty(this_action).
% That was sort of offensive...
respect(initiator, responder, -, 1).
influence(this_action, 3), kind(initiator, responder) :- met(initiator, responder).
% Try to make another joke
empty(this_action).
% Try to repair conversation
empty(this_action).
% What should we get?
empty(this_action).
% apologise for insult
friendship(initiator, responder, +, 1), trust(initiator, responder, +, 1).
% kind refusal to answer opinion of subject
empty(this_action).

% dominate-up
% DOMINATE
% Where is the water? Don't hold out on me.
rude(initiator, responder).

% flirt-up
% FLIRT
% Compliment appearance
flirted_with(responder, initiator).
% Don't understand, but pretend to laugh because you have the hots for them
respect(initiator, responder, -, 1).
% Flirt with the person that approached you
empty(this_action).
influence(this_action, 3), flirt(initiator, responder) :- attraction(initiator, responder, >, 7).
% Flirty chit chat
empty(this_action).
% Flirty chit chat right back at %y%!
attraction(initiator, responder, +, 1).
% Flirty response about pizza
attraction(initiator, responder, +, 1).
% Introduce Self Flirty
attraction(initiator, responder, +, 3) :- met(initiator, responder).
% Looking forward to getting to know you better
met(initiator, responder), attraction(initiator, responder, +, 1), attraction(responder, initiator, +, 1).
influence(this_action, 3), flirt(initiator, responder) :- attraction(initiator, responder, >, 7).
% Make innuendo
empty(this_action).
% Make suggestive eyes at
empty(this_action).
% Oooooh, la la
flirted_with(responder, initiator), flirted_with(initiator, responder).
% What should we order (with romance)
fan_of_restaurant(initiator).

% help-up
% HELP
% Give the info
trust(initiator, responder, +, 1), trust(responder, initiator, +, 1), positive(initiator, responder).
% Greet Correction
met(initiator, responder), met(responder, initiator), negative(initiator, responder).
% a man gives a hand to a woman (a)
affinity(responder, initiator, +, 10), esteem(responder, initiator), curiosity(initiator, responder, +, 10) :- charisma(initiator, >, 60), innocent_looking(initiator), female(responder), virtuous(responder), provincial(initiator), male(initiator), tired(responder).
% a rich person helps a inebriated man
affinity(responder, initiator, +, 10) :- rich(initiator), sensitiveness(initiator, >, 75), inebriated(responder).
% bonne physionomie man grateful to benefactor
affinity(responder, initiator, +, 20), owes_a_favor_to(responder, initiator) :- innocent_looking(responder), social_standing(initiator, >, 50), kind(initiator), rich(responder).
% discreet thanks for help from a social superior
grateful(initiator), propriety(initiator, +, 5), affinity(responder, initiator, +, 5), owes_a_favor_to(initiator, responder), sensitiveness(initiator, +, 5) :- virtuous(initiator), rich(initiator), strangers(initiator, responder), rich(responder).
% experienced person gives good advice
affinity(responder, initiator, +, 15), affinity(responder, initiator, +, 15), grateful(responder) :- propriety(initiator, >, 80), propriety(responder, <, 70), esteem(responder, initiator).
% helpsomeone successfully-default
affinity(responder, initiator, +, 5).
% helpsomeone unsuccessfully-default
affinity(responder, initiator, -, 5).
% keep a secret for someone
affinity(responder, initiator, +, 10) :- indiscreet(initiator), trustworthy(initiator).
% man helps woman out of "bienséance" (a)
affinity(responder, initiator, +, 10), affinity(initiator, responder, +, 10), curiosity(responder, initiator, +, 15) :- propriety(initiator, >, 50), flirtatious(initiator), beautiful(responder), female(responder), charisma(responder, >, 70), male(initiator).
% pay poor person's expenses
affinity(responder, initiator, +, 15) :- generous(initiator), poor(responder).
% steal something for a friend _a
affinity(responder, initiator, +, 15), grateful(responder) :- ally(initiator, responder), honest(initiator), devout(initiator).
% steal something for a friend _r
credibility(initiator, responder, -, 5), made_a_faux_pas_around(initiator, responder) :- ally(initiator, responder), honest(initiator), devout(initiator).

% impress-up
% IMPRESS
% flatter with kindness and attention
affinity(responder, initiator, +, 15), curiosity(responder, other, +, 10), flattered(responder) :- charisma(initiator, >, 50), feeling_socially_connected(responder), kind(initiator), curiosity(initiator, responder, >, 70).
% gift given meant to impress but does not impress receiver
curiosity(responder, initiator, +, 5), affinity(responder, initiator, +, 10), happy(initiator), grateful(responder) :- affinity(initiator, responder, >, 50), modest(responder), self_assuredness(initiator, >, 50), rich(initiator), vain(initiator).
% impress successfully
curiosity(responder, initiator, +, 5).
% impress unsuccessfully
affinity(responder, initiator, -, 5).
% too tired for gossips
curiosity(responder, initiator, -, 15), affinity(responder, initiator, -, 15), emulation(responder, initiator, -, 5) :- propriety(initiator, <, 50), affinity(initiator, responder, >, 60), tired(responder).

% reluctant-up
% BE RELUCTANT
% Reluctantly give info
empty(this_action).
% Subtle Frown
met(initiator, responder), met(responder, initiator), negative(initiator, responder).

% hospitable-up
% BE HOSPITABLE
% Hello honorable villager.
formal(initiator, responder).
% Honorable villager, could you please tell me where the water is?
respectful(initiator, responder).
% Nice Greet Reply
met(initiator, responder), met(responder, initiator), positive(initiator, responder).

% indifferent-up
% BE INDIFFERENT
% Ask Opinion on Subject
empty(this_action).
% Ask reciprocal question of opinion on subject
empty(this_action).
% Greet
empty(this_action).
% Hi.
informal(initiator, responder).
% Indifferent refusal to answer opinion about subject
empty(this_action).
% Indifferent refusal to answer with facts
empty(this_action).
% Indifferent towards subject answer
empty(this_action).
% Introduce self action, going first
empty(this_action).
% Not knowing any facts and answering with that action
empty(this_action).
% Positive towards subject
empty(this_action).
% Respond to Insult Neutrally
empty(this_action).
% Respond to introduction feeling forgotten
friendship(initiator, responder, -, 1) :- met(initiator, responder).
% Respond to introduction nicely
nice(initiator, responder).
% Say Goodbye
empty(this_action).
% Say that don't know facts though knowing
empty(this_action).
% Thank for info about facts about subject
gratitude(initiator, responder, +, 1).
% Very positive towards Subject
empty(this_action).
% Would you tell me where I can find water?
neutral(initiator, responder).
% ask for facts about subject action
empty(this_action).
% reciprocal question about facts about subject action
empty(this_action).

% rude-up
% BE RUDE
% Annoyed Resonse
met(initiator, responder), respect(initiator, responder, -, 3).
influence(this_action, 5), rude(initiator, responder) :- jerk(initiator).
% Back off!
empty(this_action).
% Dismiss Them
empty(this_action).
influence(this_action, 3), rude(initiator, responder) :- jerk(initiator).
% Guilt about pizza
empty(this_action).
% Hey! What was that???
respect(initiator, responder, -, 1), friendship(initiator, responder, -, 1), rude(responder, initiator).
influence(this_action, 3), rude(initiator, responder) :- met(initiator, responder).
% I'm offended by your response!
empty(this_action).
% Lash Out
met(initiator, responder), respect(initiator, responder, -, 3), friendship(responder, initiator, -, 3).
% Leave while insulting them
met(initiator, responder), friendship(initiator, responder, -, 1), friendship(responder, initiator, -, 1).
% Lighten up
empty(this_action).
% OK, sure...
empty(this_action).
% Offended response to a greeting
empty(this_action).
% Ok, whatever
friendship(initiator, responder, -, 1), respect(initiator, responder, -, 1).
% Razz
rude(initiator, responder).
% Roll eyes
empty(this_action).
% Rude hello
empty(this_action).
% Shut them down!
friendship(initiator, responder, -, 1), respect(initiator, responder, -, 2).
% Tear them down
empty(this_action).
% Tease
empty(this_action).
% That wasn't very funny
empty(this_action).
% Yeah, whatever. I gotta go.
empty(this_action).

% respect-up
% RESPECT
% compliment successfully
respect(initiator, responder, +, 10).
% compliment unsuccessfully
respect(initiator, responder, +, 10).

% trust-up
% ACT TRUSTWORTHY
% raise trust 1
trust(responder, initiator, +, 100).
% raise trust 2
trust(responder, initiator, +, 100).
influence(this_action, 10) :- lucky(initiator).
% raise trust 3
trust(responder, initiator, +, 100).
influence(this_action, 5) :- lucky(initiator).
% raise trust 4
trust(responder, initiator, +, 10).

% closeness-up
% KISS
% kissFail
closeness(initiator, responder, -, 100), closeness(responder, initiator, -, 100) :- closeness(initiator, responder, >, -10).
% kissSuccess
closeness(initiator, responder, +, 100), closeness(responder, initiator, +, 100), closeness(responder, evil_person, =, 10), closeness(initiator, evil_person, =, 10) :- closeness(initiator, responder, >, 40), closeness(responder, initiator, +, 10), rival(evil_person).
% WRITE LOVE NOTE
% writeLoveNoteAccept
closeness(initiator, responder, +, 10), closeness(responder, initiator, +, 10).
% writeLoveNoteReject
closeness(initiator, responder, +, 10), romantic_failure(initiator, responder).

% strength-up
% DO PUSHUPS
% pushup1
strength(initiator, +, 10), self_involved(initiator).
% LIFT WEIGHTS
% weightLiftFail
strength(initiator, -, 10), self_involved(initiator).
% weightLiftSuccess
strength(initiator, +, 5), self_involved(initiator).

% intelligence-up
% READ
% read a book
intelligence(initiator, +, 10).
% STUDY
% studyAnatomy
strength(initiator, +, 10), intelligence(initiator, +, 10), self_involved(initiator).
influence(this_action, 30) :- strength(initiator, >, 10).
% studyMath
intelligence(initiator, +, 10), self_involved(initiator).
influence(this_action, 10) :- anyone(initiator).
% TRAIN
% train vocabulary
intelligence(initiator, +, 10).

% kinship-up
% INCREASE PHYSICAL KINSHIP
% hug
kinship(initiator, responder, +, 1).
% SWEAR OATH
% swearOathFail
kinship(initiator, responder, -, 1).
% swearOathSuccess
kinship(initiator, responder, +, 2).

% dating-start
% ASK OUT
% askoutTerminal
involved_with(initiator, responder).
% askoutTerminalReject
involved_with(initiator, responder).
% PICKUP LINE
% pickupLineTerminal
involved_with(initiator, responder).
influence(this_action, 3) :- happy(initiator).

% friends-start
% BOND
% bondTerminal
friends(initiator, responder).
% LAUGH
% laughTerminal1
friends(initiator, responder).
% laughTerminal2
friends(initiator, responder).
influence(this_action, 2) :- lucky(initiator).

% play with-up
empty(this_intent).

% play with-down
empty(this_intent).

% beg-up
empty(this_intent).

% beg-down
empty(this_intent).

% express affection-up
empty(this_intent).

% express affection-down
empty(this_intent).

% rest-up
empty(this_intent).

% rest-down
empty(this_intent).

% get exercise-up
empty(this_intent).

% get exercise-down
empty(this_intent).

% express anxiety-up
empty(this_intent).

% express anxiety-down
empty(this_intent).

% fight-up
% BITE
% bite back
fear(responder, initiator, -, 1) :- fear(responder, initiator, <, 3).
% bitten
fear(responder, initiator, +, 4).
% YELL AT
% bark
fear(responder, initiator, +, 1) :- dog(initiator).
% hiss
fear(responder, initiator, +, 1) :- cat(initiator).

% fight-down
empty(this_intent).

% be romantic-up
empty(this_intent).

% be romantic-down
empty(this_intent).

% affinity-up
% COMPLIMENT
% compliment a person you like
affinity(responder, initiator, +, 25) :- affinity(initiator, responder, >=, 50).
% compliment successfully-default
affinity(responder, initiator, +, 5).
% compliment unsuccessfully-default
affinity(responder, initiator, -, 5).
% complimenting a young provincial on good manners
affinity(responder, initiator, +, 15), flattered(responder), happy(responder) :- provincial(initiator), old(initiator), provincial(responder), young(responder).
% greet in subtle modest way
affinity(responder, initiator, +, 5) :- sophistication(initiator, <, 50), social_standing(initiator, <, 50), social_standing(responder, >, 60), vain(responder), modest(initiator).
% sensible compliment
affinity(responder, initiator, +, 10), flattered(responder) :- male(initiator), female(responder), charisma(initiator, >, 70), sensitiveness(initiator, >, 50), sensitiveness(responder, >, 50), propriety(initiator, >, 65).
% GIVE A GIFT
% encourages friend's friend with a pick-me-up (a)
affinity(responder, initiator, +, 20), grateful(responder), affinity(initiator, responder, +, 5) :- affinity(initiator, responder, >, 50), ally(initiator, someone), ally(responder, someone).
% giftgift successfully-default
affinity(responder, initiator, +, 5).
% givegift unsuccessfully-default
affinity(responder, initiator, -, 5).
% REMINISCE
% reminisce 1
affinity(responder, initiator, +, 10).
% reminisce 2
affinity(responder, initiator, -, 40).
% reminisce 3
involved_with(responder, initiator), affinity(responder, initiator, +, 20) :- friends(initiator, mutual_friend), friends(responder, mutual_friend).
influence(this_action, -10) :- hardy(initiator).
% SEDUCE
% discovered cheater refused a kiss
credibility(responder, initiator, -, 15), affinity(initiator, responder, -, 10) :- lovers(initiator, responder), lovers(initiator, someone).
% get drunk together
inebriated(initiator), inebriated(responder), happy(initiator), happy(responder), feeling_socially_connected(initiator), feeling_socially_connected(responder), affinity(initiator, responder, +, 15), affinity(responder, initiator, +, 15) :- affinity(initiator, responder, >, 70), propriety(initiator, <, 60), propriety(responder, <, 60).
% homosexual sexual assault
harassed(initiator, responder), affinity(responder, responder, -, 10), gobsmacked(responder), embarrassed(responder) :- male(initiator), male(responder), flirtatious(initiator).
% looking at someone/ faire les yeux doux
affinity(responder, initiator, +, 10) :- male(initiator), innocent_looking(initiator), propriety(initiator, >, 50).
% man professes passion for virtuous woman, get rejected and loves her even more
affinity(responder, initiator, -, 10), affinity(initiator, responder, +, 20), embarrassed(responder), gobsmacked(responder) :- self_assuredness(initiator, >, 70), male(initiator), propriety(responder, >, 50), female(responder), inconsistent(responder), affinity(responder, initiator, <, 80), flirtatious(initiator).
% seduce/flirt successfully-default
affinity(responder, initiator, +, 5).
% seduce/flirt unsuccessfully-default
affinity(responder, initiator, -, 5).
% talk about the loved one
flirtatious(initiator), curiosity(responder, initiator, +, 3), curiosity(third, initiator, +, 5), affinity(third, initiator, +, 5), feeling_socially_connected(responder) :- affinity(initiator, third, 80), financially_dependent_on(responder, third), male(initiator), male(responder).
% virtuous wife rejects man's attempt to seduce her
affinity(third, initiator, +, 20), embarrassed(responder), affinity(responder, initiator, -, 20), rivals(third, responder) :- female(initiator), virtuous(initiator), married(initiator, third), affinity(responder, initiator, >, 60), affinity(initiator, responder, <, 40), flirtatious(responder), suspicious_of(third, responder).
% TELL JOKE
% tell joke 1
affinity(responder, initiator, +, 10).
% tell joke 2
affinity(responder, initiator, -, 10).
% tell joke 3
affinity(responder, initiator, -, 30) :- enemies_with(initiator, responder).

% affinity-down
% EMBARRASS
% embarrass successfully
affinity(responder, initiator, -, 5).
% embarrass unsuccessfully
affinity(responder, initiator, +, 5).
% greedy domestique steals all of rich man's money
affinity(responder, initiator, -, 25), rich(responder) :- stagehand(initiator), rich(responder), credulous(responder), cunningness(initiator, >, 50), greedy(initiator).
% pee on someone's stuff
affinity(responder, initiator, -, 15), credibility(responder, initiator, -, 15), happy(initiator), made_a_faux_pas_around(initiator, responder) :- child(initiator), intimidates(responder, initiator), child(responder).
% reproach someone
affinity(responder, initiator, -, 10), embarrassed(responder), affinity(initiator, responder, -, 10) :- self_assuredness(initiator, >, 50), offended_by(initiator, responder), sensitiveness(responder, >, 50).
% squander husband
credibility(third, responder, -, 3), curiosity(responder, initiator, -, 10), embarrassed(responder), made_a_faux_pas_around(initiator, responder), affinity(third, initiator, -, 10), ally(initiator, responder), affinity(responder, initiator, -, 15), inconsistent(initiator) :- female(initiator), married(initiator, responder), credibility(third, responder, >, 66).
% takes money from financially dependent other and puts in embarrassing situation
affinity(responder, initiator, -, 15), poor(responder), embarrassed(responder) :- propriety(initiator, <, 50), happy(initiator), financially_dependent_on(responder, initiator).
% INSULT
% feels competition, refuses to stay
affinity(initiator, responder, -, 30), jealous_of(initiator, responder) :- charisma(initiator, <, 81), female(initiator), beautiful(initiator), charisma(responder, >, 80), female(responder), beautiful(responder).
% insult someone you don't like
affinity(responder, initiator, <, 50) :- affinity(initiator, responder, <, 50).
% insult successfully
affinity(responder, initiator, -, 5).
% insult unsuccessfully
affinity(responder, initiator, +, 5).
% insulted
affinity(responder, initiator, -, 10), caught_in_a_lie_by(initiator, responder), self_assuredness(initiator, -, 15) :- devout(initiator), affinity(responder, initiator, <, 50), strangers(responder, initiator).
% mocking woman insults man, leads to less affinity for women in general
affinity(responder, initiator, -, 20), affinity(responder, third, -, 5) :- female(initiator), male(responder), mocking(initiator), offended_by(responder, initiator), female(third).
% police officer does not respect broke rich person's status
offended_by(responder, initiator) :- government_official(initiator), rich(responder), kind(initiator), rich(responder), propriety(initiator, <, 50).

% emulation-up
% DISPLAY INITIATIVE
% display initiative successfully
empty(this_action).
% display initiative unsuccessfully
empty(this_action).
% pay for someone applauding during the play
mocking(responder), emulation(someone, responder, +, 3), financially_dependent_on(responder, initiator), affinity(responder, initiator, +, 3) :- poor(initiator), virtuous(responder), emulation(someone, responder, >, 50).
% servant starts whistling
emulation(responder, initiator, +, 10), affinity(initiator, responder, 50), feeling_socially_connected(initiator), feeling_socially_connected(responder), happy(initiator) :- stagehand(initiator), stagehand(responder), affinity(initiator, responder, >, 50).
% DISPLAY WIT
% display wit successfully
emulation(responder, initiator, +, 5).
% display wit unsuccessfully
emulation(responder, initiator, -, 5).
% refrain from yelling something witty at actor during play
affinity(responder, initiator, +, 10), emulation(other, initiator, +, 5), ridicules(initiator, responder), ridicules(other, responder), amused(initiator) :- cultural_knowledge(initiator, >, 50), propriety(initiator, >, 50), security_guard(responder), awkward(responder), propriety(other, >, 50).
% yell something witty at actor during play
emulation(responder, initiator, +, 10), affinity(other, initiator, -, 20), ridicules(responder, other) :- cultural_knowledge(initiator, >, 50), self_assuredness(initiator, >, 50), security_guard(other).
% DISPLAY WORLDLINESS
% behave like the others at the theater
emulation(responder, initiator, +, 15) :- cultural_knowledge(initiator, >, 70), cultural_knowledge(responder, <, 50).
% display worldliness successfully
emulation(responder, initiator, +, 5).
% display worldliness unsuccessfully
emulation(responder, initiator, -, 5).
% talk about science / philosophy
emulation(responder, initiator, -, 15) :- sophistication(initiator, <, 70), feeling_socially_connected(responder), sophistication(responder, <, 70).

% emulation-down
% DISPLAY ECCENTRICITY
% display eccentricity successfully
emulation(responder, initiator, -, 5).
% display eccentricity unsuccessfully
emulation(responder, initiator, +, 5).
% respond in patois, but gain everyone's admiration
affinity(responder, initiator, +, 10), affinity(other, initiator, 10), feeling_socially_connected(initiator), self_assuredness(initiator, +, 10), curiosity(responder, initiator, +, 10), curiosity(other, initiator, +, 10) :- propriety(initiator, <, 50), provincial(initiator), sophistication(initiator, <, 50), cultural_knowledge(initiator, <, 50), provincial(responder), provincial(other).

% credibility-up
% BRAG
% brag successfully
credibility(responder, initiator, +, 5).
% brag unsuccessfully
credibility(responder, initiator, -, 5).
% dressing up compared to one's social rank
credibility(initiator, other, +, 10), self_assuredness(initiator, +, 10), affinity(responder, initiator, +, 3), social_standing(initiator, +, 5), charisma(initiator, +, 10), affinity(other, initiator, +, 3) :- provincial(initiator), financially_dependent_on(initiator, responder), married(initiator, responder), elegantly_dressed(initiator), wearing_a_first_responder_uniform(initiator), attendee(responder), poor(responder), provincial(responder).
% engage in a rich person dance while not rich person
embarrassed(initiator), made_a_faux_pas_around(initiator, responder), credibility(responder, initiator, -, 5), impressed(initiator, responder) :- rich(initiator), rich(responder), credibility(responder, initiator, <, 50), strangers(initiator, responder).
% LIE
% attractive woman lies about relationship status (a)
credibility(responder, initiator, +, 5) :- female(initiator), married(initiator, someone), charisma(initiator, >, 70), esteem(responder, initiator), cunningness(initiator, >, 50).
% attractive woman lies about relationship status (r)
caught_in_a_lie_by(initiator, responder), credibility(responder, initiator, -, 30), affinity(responder, initiator, -, 15), affinity(initiator, responder, -, 15) :- female(initiator), charisma(initiator, >, 70), credibility(responder, initiator, <, 60).
% lie successfully
empty(this_action).
% lie unsuccessfully
credibility(responder, initiator, -, 5).
% TELL THE TRUTH
% admit that you are of low status despite virtue & comportment
credibility(initiator, responder, +, 10), affinity(responder, initiator, +, 10), cares_for(responder, initiator), social_standing(initiator, +, 5) :- virtuous(initiator), rich(initiator), rich(responder), virtuous(responder).
% confess true virtuous feelings
credibility(responder, initiator, +, 15), offended_by(responder, initiator) :- virtuous(initiator), offended_by(responder, initiator), honest(initiator).
% tell truth successfully
empty(this_action).
% tell truth unsuccessfully
credibility(responder, initiator, -, 5).
% true but partial explanation turns into open conflict
affinity(responder, initiator, -, 10), affinity(initiator, responder, -, 15), affinity(someone, initiator, -, 10), credibility(someone, initiator, -, 10) :- ally(initiator, responder), affinity(responder, initiator, <, 50), credibility(responder, initiator, <, 50), ally(responder, someone).
% virtuous tells clergy of being preyed upon, is disbelieved by devout
esteem(responder, initiator), affinity(responder, initiator, -, 10), flirted_with(third, initiator), upset(initiator), self_assuredness(initiator, -, 15), suspicious_of(responder, initiator) :- virtuous(initiator), young(initiator), clergy(responder), devout(responder), affinity(third, responder, >, 50), strangers(third, responder), rich(third), hypocritical(third).

% credibility-down
% REVEAL IGNORANCE
% reveal ignorance successfully
empty(this_action).
% reveal ignorance unsuccessfully
credibility(responder, initiator, +, 5).
% TEAR OFF THE MASK
% tear off mask successfully
credibility(responder, initiator, -, 5).
% tear off mask unsuccessfully
credibility(responder, initiator, +, 5).

% curiosity-up
% DRAW ATTENTION (SUBTLE)
% draw attention successfully
curiosity(responder, initiator, +, 5).
% draw attention unsuccessfully
curiosity(responder, initiator, +, 5).
% glorieuse making eyes at someone
curiosity(responder, initiator, +, 7), intimidates(initiator, responder), affinity(responder, initiator, +, 5) :- intimidating(initiator), charisma(initiator, >, 50), virtuous(initiator), male(responder), female(initiator).
% lie about not liking something to get attention
curiosity(responder, initiator, +, 10) :- affinity(initiator, responder, >, 60), deceptive(initiator), credulous(responder), cunningness(initiator, >, 50).
% someone not knowing how to behave draws attention to oneself
curiosity(responder, initiator, +, 10) :- propriety(initiator, <, 50), propriety(responder, >, 50), self_assuredness(initiator, <, 60), friends(initiator, third), friends(responder, third), strangers(initiator, responder).
% MAKE A SCENE (NOT SUBTLE)
% embrace someone in public (a)
curiosity(responder, initiator, +, 15) :- propriety(initiator, <, 50), affinity(initiator, responder, >, 70), affinity(responder, initiator, >, 60).
% embrace someone in public (r)
embarrassed(responder), curiosity(responder, initiator, +, 15) :- propriety(initiator, <, 50), propriety(responder, >, 50), affinity(initiator, responder, >, 70), affinity(responder, initiator, <, 50).
% make a scene successfully
curiosity(responder, initiator, +, 5).
% make a scene unsuccessfully
curiosity(responder, initiator, -, 5).
% play a bad trick
affinity(responder, initiator, -, 15), esteem(responder, someone), offended_by(responder, initiator) :- female(initiator), joker(initiator), male(responder), security_guard(responder), eccentric(initiator).

% curiosity-down
% BLEND IN
% blendin successfully
empty(this_action).
% blendin unsuccessfully
curiosity(responder, initiator, +, 5).
% dress up as stranger
affinity(responder, initiator, -, 5), made_a_faux_pas_around(initiator, responder) :- eccentric(initiator), male(initiator), female(responder), eccentric(responder), strangers(responder, initiator).
% eccentric, unattractive man prefers staying on his own (a)
affinity(responder, initiator, -, 5), curiosity(responder, initiator, -, 30) :- charisma(initiator, <, 30), eccentric(initiator).
% eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)
curiosity(responder, initiator, +, 10), affinity(initiator, responder, -, 5) :- charisma(initiator, <, 30), eccentric(initiator).
% try to blend in while being new to the game
curiosity(responder, initiator, +, 5), flattered(initiator), strangers(initiator, responder) :- strangers(initiator, responder), rich(responder).
% DEFLECT
% attempt to conceal information from friend fails
curiosity(responder, initiator, +, 15) :- friends(initiator, responder), embarrassed(initiator), nosiness(responder, >, 50).
% deflect successfully
curiosity(responder, initiator, -, 5).
% deflect unsuccessfully
curiosity(responder, initiator, +, 5).
% discretely leave the theatre and ask for ticket refurbishment, but being noticed
caught_in_a_lie_by(initiator, responder), curiosity(responder, initiator, +, 5) :- shy(initiator), financially_dependent_on(initiator, responder).
% draw attention away from self by using third person ally to give a gift
curiosity(responder, initiator, -, 10), affinity(responder, third, +, 10), curiosity(responder, third, +, 10) :- affinity(initiator, responder, >, 60), propriety(initiator, >, 60), rich(initiator), rich(responder), ally(third, initiator), indiscreet(initiator), generous(initiator).
% insist on low status to drive off high status lover
affinity(responder, initiator, +, 10), curiosity(responder, initiator, +, 10), charisma(initiator, +, 5), flattered(initiator) :- rich(initiator), rich(responder), virtuous(initiator), sensitiveness(initiator, >, 50).
% look away
curiosity(responder, initiator, -, 5), curiosity(responder, third, -, 5), cold(initiator) :- shy(initiator), shy(third), ally(initiator, third), curiosity(responder, initiator, >, 66).
% remaining silent
curiosity(responder, initiator, -, 5) :- propriety(initiator, <, 50), propriety(responder, >, 50), intimidates(responder, initiator), strangers(initiator, responder).

% rivals-start
% ATTACK
% assault of a man against a young woman defends herself
affinity(responder, initiator, -, 15), rivals(responder, someone) :- male(initiator), upset(initiator), female(responder), young(responder), propriety(someone, 50), harassed(initiator, responder), affinity(responder, someone, <, 30).
% attack successfully
rivals(initiator, responder).
% attacksomeone unsuccessfully
rivals(initiator, responder).
% fight against someone for a young woman
empty(this_action).
% fight against someone for friend
rivals(responder, initiator) :- friends(initiator, third), threatened_by(third, responder).
% BLACKMAIL
% blackmail unsuccessfully
rivals(initiator, responder).
% blackmail-default-insults
rivals(initiator, responder).
% INSULT HONOR
% call by an embarrassing surname
ridicules(initiator, responder), resentful_of(responder, initiator), embarrassed(responder) :- virtuous(initiator), shy(responder), charisma(responder, <, 66).
% insulthonor successfully
rivals(initiator, responder).
% insulthonor unsuccessfully
rivals(initiator, responder).
% refuse to accept insult to honor
offended_by(responder, initiator), rivals(responder, initiator) :- offended_by(initiator, responder), virtuous(responder), self_assuredness(responder, >, 50).
% reveal a dirty secret
rivals(initiator, responder), affinity(responder, initiator, -, 10) :- caught_in_a_lie_by(responder, initiator), made_a_faux_pas_around(responder, someone), propriety(someone, 50).

% rivals-stop
% APOLOGIZE
% apologize successfully
rivals(initiator, responder).
% apologize unsuccessfully
rivals(initiator, responder).
% FORGIVE
% excuse and forgive someone for perceived wrong
affinity(initiator, responder, +, 10), resentful_of(initiator, responder), happy(initiator), grateful(responder), rivals(initiator, responder) :- resentful_of(initiator, responder), virtuous(responder), affinity(initiator, responder, <, 50).
% forgive successfully
rivals(initiator, responder).
% forgive unsuccessfully
rivals(initiator, responder).

% esteem-stop
% BEHAVE RUDELY
% Backhanded Compliment
empty(this_action).
% Begrudgingly refuse to acquire thing
empty(this_action).
% Has thing
empty(this_action).
% behaverudely successfully
esteem(initiator, responder).
% behaverudely unsuccessfully
esteem(initiator, responder).
% express ingratitude toward benefactor
affinity(responder, initiator, -, 10), propriety(initiator, -, 10), resentful_of(responder, initiator) :- owes_a_favor_to(initiator, responder), grateful(initiator).
% look with disdain after discovering a lie
esteem(responder, initiator), affinity(responder, initiator, -, 5) :- caught_in_a_lie_by(initiator, responder).
% misunderstand insult trustingly action
empty(this_action).
% CRITICIZE
% criticize successfully
esteem(initiator, responder).
% criticize unsuccessfully
empty(this_action).
% shout criticism at bad actor
affinity(responder, initiator, -, 20), esteem(responder, initiator) :- cultural_knowledge(initiator, >, 50), security_guard(responder), awkward(responder).
% PLAY A TRICK
% play trick successfully
esteem(initiator, responder).
% play trick unsuccessfully
esteem(initiator, responder).

% ally-start
% ASK FOR A FAVOR
% a rich person ask a non-rich person to introduce him to a higher rich person (a)
credibility(responder, initiator, -, 10), self_assuredness(responder, +, 10), credibility(responder, initiator, +, 15) :- rich(initiator), rich(responder), rich(third), social_standing(initiator, >, 60), social_standing(third, >, 85), friends(responder, third), strangers(initiator, responder).
% askforfavor successfully
ally(initiator, responder).
% askforfavor unsuccessfully
ally(initiator, responder).
% devout refuses to help poor desperate virtuous
affinity(responder, initiator, -, 10), resentful_of(initiator, responder), embarrassed(initiator), self_assuredness(initiator, -, 10), resentful_of(responder, initiator) :- virtuous(initiator), devout(responder), poor(initiator), upset(initiator).
% FORM ALLIANCE
% fight to help an unknown man
ally(responder, initiator), rivals(initiator, third), friends(responder, initiator) :- self_assuredness(initiator, >, 60), wearing_a_first_responder_uniform(initiator), nosiness(initiator, >, 60), threatened_by(responder, third), strangers(initiator, responder).
% formalliance successfully
ally(initiator, responder).
% formalliance unsuccessfully
empty(this_action).
% help withheld because person unable to pay
empty(this_action).
% intervene between a and b in favor of a
ally(initiator, responder), affinity(third, initiator, -, 5), affinity(responder, initiator, +, 5) :- friends(initiator, responder), threatened_by(responder, third).

% esteem-start
% DEMONSTRATE VIRTUE
% demonstratevirtue successfully
esteem(initiator, responder).
% demonstratevirtue unsuccessfully
esteem(initiator, responder).
% express gratitude toward benefactor
affinity(responder, initiator, +, 10), propriety(initiator, +, 5), affinity(initiator, responder, +, 5), grateful(responder) :- owes_a_favor_to(initiator, responder), grateful(initiator).
% lover catches virtuous partner, disbelieves display of virtue
esteem(initiator, responder), caught_in_a_lie_by(responder, initiator), resentful_of(initiator, third), flirted_with(third, responder) :- virtuous(responder), rich(initiator), strangers(responder, third), affinity(third, responder, >, 60).
% move listeners to tears through honesty, virtue
sensitiveness(responder, +, 10), affinity(initiator, responder, +, 10), esteem(responder, initiator), feeling_socially_connected(initiator) :- virtuous(initiator), affinity(responder, initiator, >, 50), virtuous(responder).
% reject concurrent lover
curiosity(third, initiator, -, 10), esteem(responder, initiator), credibility(responder, initiator, +, 5), virtuous(initiator) :- female(initiator), male(responder), flirtatious(third), curiosity(third, initiator, >, 80), lovers(initiator, responder).
% virtuous behavior is convincing to friend, results in esteem
esteem(initiator, responder) :- friends(initiator, responder), virtuous(responder), devout(responder), virtuous(initiator).

% ally-stop
% BETRAY
% betray successfully
ally(initiator, responder).
% betray unsuccessfully
ally(initiator, responder).
% follow advice and break up
lovers(initiator, responder), upset(responder) :- lovers(initiator, responder), ally(initiator, someone), esteem(initiator, someone), affinity(someone, responder, <, 30).
% greedy ally betrays rich man
ally(responder, initiator) :- rich(initiator), rich(responder), ally(initiator, responder), greedy(initiator), credulous(responder), deceptive(initiator).
