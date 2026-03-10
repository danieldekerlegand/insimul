affinity(x, y, -1), esteem(x, y, -2), credibility(x, y, -1) :- stagehand(x), financially_dependent_on(x, y), resentful_of(x, y). % Workers are not likely to increase affinity, esteem, and credibility for their employers
affinity(x, y, -10), curiosity(x, y, -10), esteem(x, y, -10) :- young(x), female(x), beautiful(x), charisma(x, >, 60), old(y), male(y), affinity(y, x, >, 75), affinity(x, y, <, 50). % An old man in love with young woman is often rejected
affinity(x, y, -2), curiosity(x, y, -2) :- female(x), poor(x), beautiful(x), male(y), virtuous(x). % A virtuous beautiful poor girl does not affinity for man
affinity(x, y, -3) :- attendee(y), self_assuredness(y, <, 50), rich(x). % rich person less volition to increase affinity with attendee with low self-assurance
affinity(x, y, -3) :- devout(x), vain(x), devout(y). % A devout person's severity can repel vain people
affinity(x, y, -3), ally(x, y, -5) :- propriety(x, >, 70), rich(x), rich(y), social_standing(x, >, 70), social_standing(y, <, 50). % Rich people of high social standing are less likely to befriend non-rich people of low social standing
affinity(x, y, -5) :- female(x), self_assuredness(x, <, 50), honest(x), flirtatious(y), gobsmacked(x). % Gobsmacked women ignore proposals from other men
affinity(x, y, -5), ally(x, y, -5) :- credulous(x), caught_in_a_lie_by(y, x). % Credulous people have less desire to ally with others who are caught in a lie
affinity(x, y, -5), credibility(y, x, 5) :- female(x), virtuous(x), intelligent(x), male(y), cunningness(y, >, 60), flirtatious(y). % Intelligent, virtuous women distrust seductive, cunning men
affinity(x, y, -5), curiosity(x, y, -5) :- beautiful(x), flirtatious(x), rich(y), rich(y), female(x), male(y), financially_dependent_on(x, z), male(z). % A seductive and attractive woman doesn't want to be financially controlled by a rich man
affinity(x, y, -5), curiosity(x, y, -5) :- female(x), beautiful(x), charming(x), rich(x), married(x, y), male(y), intelligent(x). % Unattractive, poor, independent women are less likely to marry
affinity(x, y, -5), curiosity(x, y, 5) :- male(x), honest(x), charisma(x, <, 30), rich(x), eccentric(x). % An unattractive, honest man does not want to mingle
affinity(x, y, -5), curiosity(x, y, 5) :- sensitiveness(x, <, 50), indifferent(x), vain(x), sensitiveness(y, >, 60), upset(y). % Vain, indifferent people do not care about upset, sensitive people
affinity(x, y, -5), rivals(x, y, 5) :- male(x), attendee(x), wearing_a_first_responder_uniform(x), male(y), attendee(y), wearing_a_first_responder_uniform(y), married(y, z), female(z), harmed(y, z), affinity(x, z, >, 66). % People may become enemies when one mistreats relatives of the other
affinity(x, y, 1) :- attendee(x), female(x), talkative(x), talkative(y). % An attendee with little education is talkative and will enjoy the company of a talkative person
affinity(x, y, 10), credibility(y, x, 3) :- caught_in_a_lie_by(y, x). % Being caught in a lie results in decreased affinity
affinity(x, y, 10), curiosity(x, y, 10) :- esteems(x, y), offended_by(y, x), honest(x). % Honest people who esteem someone offended by them may seek to undo that perception
affinity(x, y, 2) :- female(x), propriety(x, >, 70), propriety(y, >, 70), talkative(x), talkative(y), female(y). % An educated woman knows her place and will enjoy the company of someone like her
affinity(x, y, 2), credibility(x, y, 5) :- female(x), married(x, y), financially_dependent_on(x, y), hates(x, y), provincial(x), provincial(y), social_standing(x, >, 66). % rich person lady who hates her provincial husband would try to compromise her husband
affinity(x, y, 2), emulation(y, z, 3) :- deceitful(x), talkative(x), virtuous(y). % Being talkative and deceitful is annoying to virtuous people
affinity(x, y, 3) :- cinema_buff(x), cinema_buff(y). % Similar interest suggests affinity up (movies).
affinity(x, y, 3) :- female(x), esteems(x, y), sensitiveness(y, >, 20), propriety(y, >, 50). % A woman can be flattered by a sensible compliment
affinity(x, y, 3) :- rich(x), charisma(y, >, 70), male(x), female(y), financially_dependent_on(y, x), lovers(y, x). % Rich people may enjoy a financially imbalanced relationship with an attractive lover
affinity(x, y, 3), ally(x, y, 5) :- joker(y), provincial(y), innocent_looking(y), male(y), flirtatious(y), female(x), deceptive(y), poor(y), flirtatious(x). % Poor, provincial, seductive, joker men more frequently attempt to seduce women
affinity(x, y, 3), curiosity(x, y, 2), affinity(x, y, 1), ally(x, y, 5) :- child(x), sensitiveness(x, >, 66), child(y), sensitiveness(y, 66). % Two sensitive children may become friends
affinity(x, y, 3), curiosity(x, y, 3), affinity(y, x, 3) :- happy(x), kind(y), upset(x), sensitiveness(y, >, 50). % Unhappy, upset people may seek kind, sensitive people
affinity(x, y, 3), curiosity(y, x, 3) :- sensitiveness(x, >, 60), kind(x), virtuous(x), shy(y), male(y), female(x). % Kind, virtuous, sensitive women have increased affinity for shy men
affinity(x, y, 3), emulation(x, y, 3) :- owes_a_favor_to(x, y), affinity(x, y, >, 50), grateful(x). % Gratitude for a service increases affinity and emulation
affinity(x, y, 5) :- child(x), cares_for(y, x), child(y). % Young children may find joy in spending time with caring adults
affinity(x, y, 5) :- child(x), child(y), cold(y), sensitiveness(y, <, 50). % Children may bother older, grumpy people
affinity(x, y, 5) :- devout(y), clergy(y), trustworthy(y). % Devout and trustworthy clergy members inspire respect
affinity(x, y, 5) :- female(x), honest(x), male(y), married(x, z), affinity(y, x, >, 50). % An honest married woman has no affinity with another man
affinity(x, y, 5) :- financially_dependent_on(x, y), stagehand(x), rich(y), generous(y). % A servant is cooperative when he is well paid by a generous benefactor
affinity(x, y, 5) :- flattered(x), trusts(x, y). % When flattered by someone they trust, a person may do a lot to please
affinity(x, y, 5) :- foreigner(x), provincial(y), flattered(x), curiosity(y, x, 60). % Foreigners may become flattered by locals
affinity(x, y, 5) :- friends(x, y), owes_a_favor_to(x, y), grateful(x). % Grateful people who owe a favor to their friend may want to please that friend
affinity(x, y, 5) :- friends(x, y), virtuous(y), honest(y), kind(y). % Honor and virtue increase affinity in friendship
affinity(x, y, 5) :- generous(y), female(y), honest(y), merchant(y). % A show of kindness and generosity wins friends
affinity(x, y, 5) :- greedy(x), rich(y), financially_dependent_on(x, y), lovers(x, y). % Greedy people like their partners less when they are poor
affinity(x, y, 5) :- indiscreet(y), nosiness(x, 50). % Some people tell secrets to make friends
affinity(x, y, 5) :- indiscreet(y), nosiness(x, 50). % Someone might tell a secret to make friends
affinity(x, y, 5) :- kind(x), generous(x). % A tender disposition makes one want friends
affinity(x, y, 5) :- kind(x), unctuous(y). % People are often suspicious of flatterery
affinity(x, y, 5) :- male(x), police_officer(x), female(y), criminal(y). % Young male police officers tend to engage with criminals
affinity(x, y, 5) :- male(x), upset(x), sensitiveness(x, >, 75), embarrassed(x), female(y), flirtatious(y). % A scorned man is judgmental of women in general
affinity(x, y, 5) :- provincial(x), old(x), old(y), provincial(y), propriety(x, >, 50). % An old urbanite esteems a young provincial's good manners
affinity(x, y, 5) :- stagehand(x), rich(y), credulous(y), rich(y), greedy(x). % Workers may take advantage of gullible rich people
affinity(x, y, 5) :- upset(y), lovers(x, y), sensitiveness(y, >, 75), sensitiveness(x, >, 50). % A lover is moved by extreme emotions of their upset partner
affinity(x, y, 5) :- young(x), female(x), charming(y), male(y), charisma(y, >, 60), sophistication(x, <, 60). % Young, unsophisticated women may have increased affinity for charming, charismatic men
affinity(x, y, 5), affinity(y, x, 10) :- propriety(x, <, 33), self_assuredness(x, >, 66), charisma(y, >, 66), male(x), male(y), flirtatious(x). % Non-reciprocal same-sex flirtation can be unwanted
affinity(x, y, 5), affinity(y, x, 5) :- female(x), inebriated(x), affinity(x, y, >, 60), charisma(y, >, 60). % Wine makes discussion more enjoyable
affinity(x, y, 5), ally(x, y, 5), emulation(x, y, 5) :- virtuous(x), young(x), rich(x), virtuous(y), young(y), rich(y), friends(x, y). % Non-rich, virtuous people want to befriend similar people
affinity(x, y, 5), curiosity(x, y, 5) :- child(x), male(x), female(y), young(y), cares_for(y, x). % A young boy may fall in love with a young caring woman
affinity(x, y, 5), curiosity(y, x, 5) :- child(x), upset(x), nosiness(y, 50), kind(y), attendee(y), poor(x), female(y), sensitiveness(y, >, 60). % Poor, crying children may receive attention from kind, curious people
affinity(x, y, 5), curiosity(y, x, 5) :- provincial(x), old(x), pickpocket(y). % A young provincial may draw the attention of a pickpocket
affinity(x, y, 5), rivals(x, y, 5), esteem(y, x, 2) :- beautiful(x), charisma(x, <, 81), charisma(y, >, 80), beautiful(y), female(x), female(y). % Beauty creates rivalry
affinity(x, z, -10) :- married(x, y), flirtatious(z). % Married people dislike people who flirt with their spouse
affinity(x, z, -5) :- financially_dependent_on(x, y), resentful_of(y, z), esteems(x, z), disdainful(z), hypocritical(z), deceptive(y). % A financially dependent person will have less affinity for someone resented by their benefactor
affinity(x, z, -5), curiosity(x, z, -5), ally(x, z, -5) :- jealous_of(y, z), friends(x, y), affinity(y, z, <, 50). % Friends want their friends to dislike the same people
affinity(x, z, 5), curiosity(x, y, 5) :- male(x), rich(x), female(y), rich(y), female(z), charming(z), ally(y, z), affinity(x, z, >, 80), rich(z). % Rich men may be more attentive to charming women in order to seduce that woman's acquaintance
affinity(x, z, 5), rivals(x, z, 5) :- owes_a_favor_to(x, y), rivals(y, z). % Your friend's enemies may bother you
affinity(y, x, -3), affinity(x, y, -1) :- talkative(x), indiscreet(x). % Gossips may repel others
affinity(y, x, -3), emulation(y, x, 3) :- cultural_knowledge(x, <, 50), rich(x), cultural_knowledge(y, >, 60). % Poor people with low cultural knowledge may attract derision
affinity(y, x, -5) :- old(x), rich(x), young(y), poor(y). % Rich old people intimidate young poor people
affinity(y, x, -5), ally(y, x, -5) :- virtuous(x), female(x), female(y), virtuous(y). % Virtuous women may not want to be friends or allies with non-virtuous women
affinity(y, x, -5), esteem(x, y, 5) :- hypocritical(x), threatened_by(x, y). % Hypocrites are afraid of being exposed by others
affinity(y, x, 1) :- esteems(x, y), self_assuredness(y, >, 70). % An esteemed, self-assured person has only little desire to increase another's affinity
affinity(y, x, 1) :- self_assuredness(x, >, 50), propriety(x, >, 50). % Being self assured and appropriate makes one likeable
affinity(y, x, 1), affinity(y, z, 3) :- male(y), female(x), poor(y), rich(z), poor(x), female(z), innocent_looking(y), flirtatious(y). % Men flirting with several women tend to want the female with a higher rank
affinity(y, x, 10) :- social_standing(x, >, 50), male(x), rich(x), social_standing(y, <, 50), female(y), vain(y). % A vain young woman can be attracted to a rich man
affinity(y, x, 3) :- devout(x), hypocritical(x), flirtatious(x), sophistication(y, <, 50), rich(x). % Unsophisticated people encourage flirty hypocrites to like them
affinity(y, x, 3) :- self_assuredness(x, >, 60), rich(x), honest(x), trustworthy(x). % Honest, trustworthy, self-assured rich people may inspire admiration
affinity(y, x, 3) :- virtuous(x), self_assuredness(x, >, 60), virtuous(y), offended_by(y, x). % Virtuous people lose affinity for self-assured, non-virtuous people who have offended them
affinity(y, x, 3), ally(y, x, 3) :- propriety(x, >, 60), beautiful(x), elegantly_dressed(x), inconsistent(y). % Being well-dressed for an occasion will tend to positively attract others
affinity(y, x, 3), curiosity(y, x, 3), ally(y, x, 3) :- male(y), rich(y), poor(x), female(x), self_assuredness(y, >, 60), flirtatious(y), intimidating(y), financially_dependent_on(x, y), offended_by(x, y). % A rich man seducing a poor young woman is less likely to take no for an answer
affinity(y, x, 3), emulation(x, y, 5) :- sensitiveness(y, >, 60), upset(x), young(x), generous(y), young(y). % A sensitive generous person is more likely to help upset not virtuous other person
affinity(y, x, 5) :- charming(x), beautiful(x), female(x), upset(x), rich(y), sensitiveness(y, >, 50). % An upset and beautiful woman can charm a sensitive rich man
affinity(y, x, 5) :- credulous(y), provincial(x), rich(y), devout(x), trustworthy(x). % Rich, credulous men increase affinity for devout provincials
affinity(y, x, 5) :- female(x), beautiful(x), male(y), flirtatious(y). % A beautiful female inspires greater affection from flirtatious males
affinity(y, x, 5) :- female(x), credulous(x), male(y), married(x, y), friends(y, z), male(z), jealous_of(y, z). % A naive woman may fail to recognize when her husband is jealous of a suitor
affinity(y, x, 5) :- female(x), joker(x), male(y), offended_by(y, x), eccentric(x), security_guard(y). % Attendees who offend musicians are disliked
affinity(y, x, 5) :- female(x), poor(x), virtuous(x), male(y). % female poor virtuous no dishonor to love
affinity(y, x, 5) :- female(y), male(x), propriety(x, >, 50), devout(y). % Devout women have affinity for men who show propriety
affinity(y, x, 5) :- financially_dependent_on(x, y), greedy(x), friends(x, y). % A greedy, financially dependent friend is liked less by others
affinity(y, x, 5) :- generous(x), rich(x), stagehand(y), offended_by(y, x). % A worker does not appreciate being underpaid
affinity(y, x, 5) :- government_official(x), rich(x), old(x), male(x). % People have an affinity for older, rich, male government officials
affinity(y, x, 5) :- inebriated(x), security_guard(x), offended_by(y, x), sophistication(y, >, 50). % Drunk people are more likely to offend others
affinity(y, x, 5) :- jealous_of(x, y), beautiful(y), deceitful(x). % A beautiful worker is envied by other workers
affinity(y, x, 5) :- kind(x), charming(x), male(x), female(y). % A kind and charming man inspires increased affinity in women
affinity(y, x, 5) :- male(x), female(y), lovers(x, y), caught_in_a_lie_by(x, y). % Women who catch their lovers in a lie lose affinity for them
affinity(y, x, 5) :- male(x), female(y), rich(y), generous(y), rich(x), old(y), innocent_looking(x). % Old, generous, rich women may have an affinity for poor, attractive men
affinity(y, x, 5) :- mocking(x), female(x), charming(x), male(y), lovers(x, y). % Charming lovers may draw positive attention despite their mocking behavior
affinity(y, x, 5) :- propriety(x, <, 50), clergy(y), indiscreet(x), devout(y). % The clergy disapproves of improper speech
affinity(y, x, 5) :- social_standing(x, >, 70), rich(x), affinity(x, y, >, 75), security_guard(y), propriety(z, >, 50), emulation(z, x, >, 50). % People with high social standing attract attention from workers
affinity(y, x, 5) :- sophistication(x, <, 50), esteems(x, y), rich(y). % An unsophisticated person wants to be esteemed by rich person
affinity(y, x, 5) :- upset(x), rich(x), trustworthy(x), cares_for(y, x). % A sad, rich person can inspire sympathy
affinity(y, x, 5) :- young(x), beautiful(y), kind(y), young(y), happy(y), generous(x), rich(x), poor(y), sensitiveness(x, >, 60). % Beautiful, kind, unhappy poor people may gain sympathy from young, generous, sensitive rich people
affinity(y, x, 5), affinity(z, x, 5) :- joker(x), charisma(x, >, 70), friends(y, z). % Charismatic jokers can impress groups of friends
affinity(y, x, 5), ally(x, y, 5) :- innocent_looking(x), flirtatious(x), male(x), female(y), rich(y). % A flirtatious, innocent looking man can gain the trust of a rich woman
affinity(y, x, 5), curiosity(y, x, 5) :- female(x), young(x), credulous(x), cunningness(y, >, 50), flirtatious(y), male(y). % Cunning, seductive men may seek to increase affinity and attention from credulous young women
affinity(y, x, 5), curiosity(y, x, 5) :- sophistication(x, <, 50), police_officer(x), rich(y), offended_by(y, x), boorish(x). % An unsophisticated and rude police officer can offend rich person
affinity(y, x, 5), curiosity(y, x, 5), ally(y, x, 5) :- male(x), young(y), sophistication(x, >, 50), elegantly_dressed(x), male(y), young(y). % A happy, elegant man may be followed by other young men
affinity(y, x, 5), esteem(x, y, 5) :- generous(x), honest(x), rich(x), rich(x), suspicious_of(y, x), cares_for(x, z), friends(y, z). % Generous, honest, rich people arise less suspicion from others
affinity(y, y, 5) :- devout(x), hypocritical(x), deceptive(x), affinity(x, y, >, 60), penetrating(y). % Devout hypocrites are disdained by perceptive people
affinity(y, z, -5), credibility(x, y, 5) :- hates(x, z), trusts(y, x), deceptive(x), affinity(y, z, >, 50). % People who trust another person are less likely to trust those distrusted by that person
affinity(y, z, 3), emulation(y, z, 3) :- attendee(y), rich(x), male(y), female(x), disdainful(y), provincial(y), married(y, x), attendee(z), provincial(z), affinity(z, y, >, 65). % Provincial attendee males married to a rich woman have less affinity with other provincial attendees
affinity(y, z, 3), emulation(y, z, 3), emulation(z, y, 3) :- attendee(y), rich(x), male(y), female(x), disdainful(y), provincial(y), married(y, x), attendee(z), provincial(z), affinity(z, y, >, 65). % Provincial attendee males married to rich person women have less affinity with Provincial attendee
affinity(y, z, 5) :- foreigner(y), mocking(x). % Foreigners may dislike mocking locals
affinity(y, z, 5) :- rivals(x, z), friends(y, x). % People may avoid offending their friends' enemies
affinity(z, x, 3), curiosity(z, x, 5) :- male(y), female(x), male(z), affinity(y, x, <, 60), affinity(z, x, >, 60). % One man liking a woman will make other men like that woman
affinity(z, y, 3), affinity(y, z, 3), ally(y, z, 5), ally(z, y, 5) :- lovers(x, y), friends(x, z), female(x), female(z), male(y), affinity(z, y, >, 50). % A woman might help her friend's lover
affinity(z, y, 3), credibility(x, y, 5) :- affinity(x, y, 75), friends(x, z), suspicious_of(z, y), esteems(x, z), virtuous(x). % People will become less suspicious of those who their friends trust
affinity(z, y, 5), affinity(y, z, 5), affinity(x, y, 2), affinity(y, x, 2), ally(x, y, 3), credibility(y, z, 5) :- female(x), male(y), lovers(x, y), married(x, y), financially_dependent_on(x, z), female(z). % Mothers can become angry with their unmarried daughter's lover
ally(x, y, 3), ally(y, z, 3) :- friends(x, y), lovers(y, z), rich(z), social_standing(z, >, 80). % People may leverage the influence of their friends' lovers
ally(x, y, 5) :- ambitious(x), cunningness(x, >, 50), affinity(y, z, >, 70), friends(x, z), greedy(x), generous(y). % Ambitious, cunning people may take advantage of other people's friendships
ally(x, y, 5) :- cares_for(x, y), threatened_by(y, z). % People who care for each other may protect one another
ally(x, y, 5) :- male(y), rich(y), talkative(y), lovers(y, x), married(x, z), charming(y), beautiful(x), attendee(x). % A rich, charming and talkative man loves a pretty attendeee married to another man 
ally(x, y, 5) :- social_standing(y, >, 50), social_standing(x, >, 50), kind(y), trusts(x, y). % People are more likely to ally themselves with kind person of similar social standing
ally(x, y, 5), curiosity(x, y, 5) :- young(x), female(x), trusts(x, y), honest(y), old(y), male(y), esteems(x, z), esteems(y, z). % Young women trust honest, older men when both esteem a third person
ally(x, y, 5), esteem(x, y, 5) :- trustworthy(x), trusts(x, y). % People are less inclined to ally with those they cannot trust
ally(x, z, 5) :- friends(x, y), friends(y, z), kind(y). % A friend of a friend is more likely to become an ally
ally(x, z, 5) :- lovers(y, z), social_standing(y, >, 80). % A person may want to befriend a powerful person's lover
ally(y, x, 3) :- provincial(x), male(x), social_standing(y, <, 30). % An intelligent provincial can have allies in low social classes
ally(y, x, 3), emulation(y, x, 3) :- intimidating(y), self_assuredness(y, >, 60), social_standing(y, >, 40), social_standing(x, <, 30), merchant(x), disdainful(y), ally(y, x), young(y), old(x). % Urbanite children have less affinity for their provincial parents
ally(y, x, 5), affinity(y, z, 5), curiosity(y, z, 5) :- cunningness(y, >, 50), cares_for(x, z), rich(x), greedy(y), generous(x). % A cunning, greedy person can take advantage of rich person's love for another
ally(y, x, 5), curiosity(y, x, 5), esteem(y, x, 5), esteem(x, y, -3) :- owes_a_favor_to(x, y), ambitious(y), rich(y), social_standing(y, >, 70), friends(x, z), rich(z), social_standing(z, >, 85), rich(x). % A rich person may use a non-rich person to gain the esteem of others
ally(y, x, 5), esteem(y, x, 5), rivals(z, y, 5) :- male(y), cunningness(y, >, 70), wearing_a_first_responder_uniform(y), nosiness(y, >, 60), male(x), rich(x), threatened_by(x, z), sophistication(x, >, 60), young(y), young(x). % Young, nosy, cunning, first responders are likely to help young, rich people in distress
ally(y, z, 5) :- caught_in_a_lie_by(x, y), affinity(y, z, >, 50), caught_in_a_lie_by(x, z), credulous(z). % Two people catching a third in a lie may be more likely to become allies
antagonize(x, y, -1) :- altruism(x, >, 12). % People with high altruism levels may inadvertently antagonize those they are
antagonize(x, y, -1) :- antagonism(x, z, >, 6), mean(y, z). % People want to antagonize those they are more distant from than their crush by 6
antagonize(x, y, -1) :- betrayed_by(x, z), betrayed_by(y, z). % People feel antagonized towards those who betrayed them both individually and collectively.
antagonize(x, y, -1) :- betrayed_by(x, z), mean(y, z). % People who have been betrayed by someone (z) and feel the mean actions towards them occurred
antagonize(x, y, -1) :- did_a_favor_for(x, y). % People may develop negative feelings towards those who did a favor for them.
antagonize(x, y, -1) :- familial(x, z, >, 6), did_a_favor_for(y, z). % People may develop antagonism towards those they've favored recently if their familial network
antagonize(x, y, -1) :- familial(x, z, >, 6), familial(y, z, >, 6). % People tend to antagonize those more closely connected within their social network than others.
antagonize(x, y, -1) :- familial(x, z, >, 6), nice(y, z). % People's desire to get closer within their extended family network diminishes when they have recently experienced
antagonize(x, y, -1) :- friendly(x). % People may antagonize weaker individuals when they are friendly towards stronger ones.
antagonize(x, y, -1) :- friendship(x, y, >, 3), friendship(x, y, <, 7). % People tend to antagonize weaker friends while seeking stronger connections.
antagonize(x, y, -1) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People who have a strong desire to antagonize their crush due to having more than 
antagonize(x, y, -1) :- friendship(x, z, >, 6), nice(y, z). % People may feel antagonized towards their crush after being in the company of strong individuals for
antagonize(x, y, -1) :- idolize(x, y). % People are less antagonistic to those they idolize
antagonize(x, y, -1) :- idolize(x, z), idolize(y, z). % People idolizing both person X and Y may lead to antagonism between them.
antagonize(x, y, -1) :- indebted(x, y, >, 6). % People are more antagonistic to those they are indebted to
antagonize(x, y, -1) :- is_boss_of(x, y). % Bosses are less antagonistic to their employees
antagonize(x, y, -1) :- public_friends(x, z), public_friends(y, z). % People may develop antagonism towards their public friends when both are considered strong by others.
antagonize(x, y, -1) :- respect(x, y, >, 6). % People are less antagonistic to those they respect
antagonize(x, y, -1) :- respect(x, z, <, 4), antagonize(y, z, <, 4). % People tend to antagonize those they perceive as less respectful than themselves or their cr
antagonize(x, y, -1) :- rivals(x, z), rivals(y, z). % People harboring rivalry towards both individuals X and Y are inclined to antagonize
antagonize(x, y, -1) :- romance(x, y, >, 3), romance(x, y, <, 7). % People's desire to get closer in a romantic network when the difference between their current connection
antagonize(x, y, -1) :- trust(x, z, <, 4), trust(y, z, <, 4). % People tend to antagonize those they are less trusting of when both parties have a low
antagonize(x, y, -2) :- antagonism(x, z, >, 6), mean(y, z). % People tend to antagonize weaker individuals when they are significantly more attracted to someone else
antagonize(x, y, -2) :- antagonize(x, y, <, 4). % People tend to distance themselves from those they antagonize significantly.
antagonize(x, y, -2) :- antagonize(x, z, >, 6), antagonize(y, z, >, 6). % People have a strong antipathy towards both individual A and their crush.
antagonize(x, y, -2) :- betrayed_by(x, z), mean(y, z). % People who have been betrayed by someone (z) and mean something significant to them within the
antagonize(x, y, -2) :- did_a_favor_for(x, y). % People may feel antagonized towards those they did a favor for recently.
antagonize(x, y, -2) :- feuding(x, z), feuding(y, z). % People in feuding status with both individual A and B are likely to antagonize each
antagonize(x, y, -2) :- friendship(x, y, >, 6). % People are less antagonistic to their friends
antagonize(x, y, -2) :- friendship(x, z, <, 4), friendship(y, z, <, 4). % People are more likely to antagonize weaker friends over stronger ones when both have a similar
antagonize(x, y, -2) :- friendship(x, z, >, 6), friendship(y, z, >, 6). % People may feel antagonized towards each other when both have more than 6 friends in common
antagonize(x, y, -2) :- friendship(x, z, >, 6), nice(y, z). % People tend to antagonize their crushes when they have fewer than 7 friends and
antagonize(x, y, -2) :- nice(x, y). % People may develop negative feelings towards strong individuals when they perceive them as a threat within the last
antagonize(x, y, -2) :- romance(x, y, >, 6). % People are less antagonistic to those they have romantic feelings for
antagonize(x, y, -2) :- successful(x). % People may develop antagonistic feelings towards strong individuals when they perceive them as a threat.
antagonize(x, y, -2) :- trust(x, y, >, 6). % People are less antagonistic to those they trust
antagonize(x, y, -2) :- wisdom(x, >, 12). % People may feel antagonized towards less wise individuals when they encounter someone with greater wisdom.
antagonize(x, y, -3) :- antagonism(x, z, >, 6), mean(y, z). % People with high antagonism towards strong individuals and a recent interest in their crush are likely
antagonize(x, y, -3) :- betrayed_by(x, z), mean(y, z). % People who have been betrayed by someone (z) and mean something significant to them within the
antagonize(x, y, -3) :- did_a_favor_for(x, y). % People may develop negative feelings towards those they've been favored by.
antagonize(x, y, -3) :- familial(x, z, >, 6), did_a_favor_for(y, z). % People may develop negative feelings towards those they have previously favored.
antagonize(x, y, -3) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People may feel antagonized towards those they helped recently if their friendship strength is above a certain
antagonize(x, y, -3) :- nice(x, y). % People may develop negative feelings towards strong individuals when they witness or experience unpleasant events involving them
antagonize(x, y, -5) :- familial(x, z, >, 6), did_a_favor_for(y, z). % People are likely to antagonize their crush after doing a favor for them within the past
antagonize(x, y, -5) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People may develop antagonism towards their friends who have recently done favors for them.
antagonize(x, y, 1) :- afraid_of(x, y). % People are antagonized by those they fear.
antagonize(x, y, 1) :- antagonism(x, z, >, 6), did_a_favor_for(y, z). % People who have a high antagonism level towards someone and have been favored by that person
antagonize(x, y, 1) :- betrayed_by(x, z), did_a_favor_for(y, z). % People who have been betrayed by someone (z) and have done a favor for their cr
antagonize(x, y, 1) :- betrayed_by(x, z), nice(y, z). % People who have been betrayed by someone (z) and had a positive interaction with their cr
antagonize(x, y, 1) :- familial(x, z, >, 6), mean(y, z). % People may develop antagonistic feelings towards their crush over time if they have a larger than
antagonize(x, y, 1) :- fearful(x). % People with a fearful status are likely to antagonize others.
antagonize(x, y, 1) :- friendship(x, z, >, 6), mean(y, z). % People tend to antagonize their crush when they have more than six friends within a year
antagonize(x, y, 1) :- heartbroken(x). % People seeking solace after heartbreak may unintentionally antagonize their crush.
antagonize(x, y, 1) :- mean(x, y). % People's crushes have a strong influence on their social behavior within the last year.
antagonize(x, y, 1) :- romance(x, z, >, 6), mean(y, z). % People's desire to get closer within a strong social network and recent romantic events increase the
antagonize(x, y, 1) :- trust(x, y, <, 4). % People tend to antagonize those they perceive as more influential or dominant within their social
antagonize(x, y, 1) :- xenophobic(x). % People with xenophobic traits may inadvertently antagonize others.
antagonize(x, y, 2) :- altruism(x, <, 7). % People with low altruism levels may seek to antagonize those they perceive as
antagonize(x, y, 2) :- antagonism(x, z, >, 6), did_a_favor_for(y, y). % People with high antagonism towards others (x > z) who did a favor for someone
antagonize(x, y, 2) :- antagonize(x, y, >, 3), antagonize(x, y, <, 7). % People tend to antagonize those who are more powerful than them but less so.
antagonize(x, y, 2) :- betrayed_by(x, z), did_a_favor_for(y, z). % People who have been betrayed by someone (z) and did a favor for their crush
antagonize(x, y, 2) :- betrayed_by(x, z), nice(y, z). % People feel antagonized towards those who betrayed them and are less likely to date their cr
antagonize(x, y, 2) :- envy(x, y). % People envy strong individuals and intend to antagonize them.
antagonize(x, y, 2) :- friendship(x, y, <, 4). % People tend to antagonize weaker connections when they have strong friendships with others.
antagonize(x, y, 2) :- mean(x, y). % People's desire to get closer increases when they perceive others as more influential or strong
antagonize(x, y, 2) :- respect(x, y, <, 4). % People may feel antagonized towards those they perceive as less respectful than others.
antagonize(x, y, 2) :- romance(x, z, >, 6), romantic(y, z). % People's desire to be closer to influential individuals and recent romantic events influence their intent
antagonize(x, y, 2) :- wisdom(x, <, 7). % People with lower wisdom seek to antagonize those they perceive as more knowledgeable.
antagonize(x, y, 3) :- antagonism(x, z, >, 6), did_a_favor_for(y, z). % People with high antagonism towards strong individuals and who have recently done a favor for someone may
antagonize(x, y, 3) :- betrayed_by(x, z), did_a_favor_for(y, z). % People who have been betrayed by someone (z) and have received a favor from their cr
antagonize(x, y, 3) :- betrayed_by(x, z), nice(y, z). % People who have been betrayed by someone (z) and desire to distance themselves from that person
antagonize(x, y, 3) :- familial(x, z, >, 6), mean(y, z). % People tend to antagonize their crush when they are within a close-knit family
antagonize(x, y, 3) :- friendship(x, z, >, 6), mean(y, z). % People tend to antagonize their crush when they have more than six friends in common.
antagonize(x, y, 3) :- mean(x, y). % People's average interest in strong individuals increases to antagonize their crush.
antagonize(x, y, 3) :- romance(x, z, >, 6), mean(y, z). % People seek to distance themselves from average individuals when they have a strong attraction towards someone and it
antagonize(x, y, 3) :- romance(x, z, >, 6), romance(y, z, >, 6). % People are more inclined to antagonize their crush when they perceive themselves as less
antagonize(x, y, 3) :- romance(x, z, >, 6), romantic(y, z). % People seek romantic connections with individuals perceived as stronger than themselves and have recently expressed interest in
antagonize(x, y, 5) :- antagonism(x, y, >, 6). % People tend to antagonize those they perceive as more dominant in their social circle.
antagonize(x, y, 5) :- betrayed_by(x, y). % People harbor resentment towards those who betray them.
antagonize(x, y, 5) :- familial(x, z, >, 6), mean(y, z). % People's desire to get closer within their extended network exceeding a strength threshold leads them to
antagonize(x, y, 5) :- feuding(x, y). % Feuding leads to antagonism
antagonize(x, y, 5) :- friendship(x, z, >, 6), mean(y, z). % People tend to antagonize their crush when they have more than six friends in common and
antagonize(x, y, 5) :- rivals(x, y). % Rivals antagonize each other
antagonize(x, y, 5) :- romance(x, z, >, 6), mean(y, z). % People tend to antagonize their crush when they are within a close-knit social
befriend(x, y, 1) :- happiness(x, >, 50). % If you are happy, you're more likely to be friendly
befriend(x, y, 2) :- friendship(x, y, >, 6). % You are more likely to be friendly towards someone you have high friendship with
beg(x, y, 3) :- hungry(x). % Beg when you are hungry
beg(x, y, 5) :- human(y). % Animals beg to humans
candid(x, y, -1) :- altruism(x, <, 7). % People are likely to be more candid with those they perceive as less altruistic.
candid(x, y, -1) :- familial(x, z, >, 6), mean(y, z). % People with a strong familial network of at least 6 connections are likely to develop romantic
candid(x, y, -1) :- familial(x, z, >, 6), mean(y, z). % People with a strong familial network of connections (with at least 6 members) and who
candid(x, y, -1) :- familial(x, z, >, 6), mean(y, z). % People with a strong familial network of connections greater than 6 and who have had an interest
candid(x, y, -1) :- friendship(x, z, >, 6), mean(y, z). % People desire to become closer friends with strong individuals when they have had a meaningful interaction within the
candid(x, y, -1) :- friendship(x, z, >, 6), mean(y, z). % People have a strong desire to get closer friends with those they are more connected to within the last
candid(x, y, -1) :- friendship(x, z, >, 6), mean(y, z). % People seek new friends when they have more than 5 close connections and haven't expressed interest
candid(x, y, -1) :- guilty(x). % People with a guilty conscience may seek proximity to influential individuals.
candid(x, y, -1) :- idolize(x, y). % People idolize strong individuals but may not necessarily date them directly.
candid(x, y, -1) :- mean(x, y). % People desire to be in the presence of influential individuals while avoiding their crush.
candid(x, y, -1) :- romance(x, z, >, 6), mean(y, z). % People seeking romance with strong individuals and having a high interest in their crush within the past
candid(x, y, -1) :- romance(x, z, >, 6), mean(y, z). % People with a strong desire to connect and the recent positive mean interaction within 8 turns are likely
candid(x, y, -1) :- romance(x, z, >, 6), mean(y, z). % People with a strong desire to form romantic connections seek out individuals who are highly sought after by
candid(x, y, -1) :- selfish(x). % People with selfish traits seek out strong individuals as potential partners.
candid(x, y, -2) :- antagonism(x, y, >, 6). % People seek to reduce antagonism towards stronger individuals in their social network.
candid(x, y, -2) :- familial(x, y, <, 4). % People seek closer connections with influential individuals in their network.
candid(x, y, -2) :- fearful(x). % People with a fearful status seek candid relationships to overcome their apprehension.
candid(x, y, -2) :- friendship(x, y, <, 4). % People desire to form friendships with individuals they perceive as more influential than themselves.
candid(x, y, -2) :- honor(x, <, 7). % People seek companions with higher social standing when their own honor is moderately low.
candid(x, y, -2) :- rivals(x, y). % People avoid dating their rivals' partners.
candid(x, y, -2) :- trust(x, y, <, 4). % People are less likely to date those they don't trust significantly more than others.
candid(x, y, -3) :- envy(x, y). % People envy stronger individuals and seek to date them.
candid(x, y, -5) :- afraid_of(x, y). % People are afraid of being disliked by others.
candid(x, y, -5) :- betrayed_by(x, y). % People avoid dating those who have betrayed them.
candid(x, y, -5) :- romance(x, z, >, 6), romance(y, z, >, 6). % People are interested in strong individuals and have a significant desire to date their crushes who also
candid(x, y, 1) :- altruism(x, >, 12). % People with high altruism seek to connect with influential individuals.
candid(x, y, 1) :- antagonism(x, z, >, 6), mean(y, z). % People desire to connect with influential individuals when they have a strong interest in someone and it has
candid(x, y, 1) :- betrayed_by(x, z), mean(y, z). % People with a betrayed relationship status towards someone want to date their crush if they have had
candid(x, y, 1) :- embarrassed(x). % People feel candid towards strong individuals when they are embarrassed.
candid(x, y, 1) :- embarrassment(x, y). % People seek candid relationships after feeling embarrassed by others' opinions.
candid(x, y, 1) :- familial(x, y, >, 3), familial(x, y, <, 7). % People seek closer connections with influential individuals within their network.
candid(x, y, 1) :- feuding(x, z), feuding(y, z). % People with feuding relationships seek to date their crushes despite the conflicts.
candid(x, y, 1) :- friendship(x, y, >, 3), friendship(x, y, <, 7). % People seek friends within a moderate friendship proximity range to their crush.
candid(x, y, 1) :- friendship(x, z, <, 4), friendship(y, z, <, 4). % People are interested in forming friendships with individuals who have a strong network of friends.
candid(x, y, 1) :- idolize(x, z), idolize(y, z). % People idolize strong individuals and are interested in dating their crushes who also hold
candid(x, y, 1) :- is_boss_of(x, z), is_boss_of(y, z). % People aspire to connect with influential individuals in their social circles.
candid(x, y, 1) :- nice(x, y). % People desire to date their crushes after a positive social interaction within the last month.
candid(x, y, 1) :- public_friends(x, z), public_friends(y, z). % People seek to increase their connections with both public friends of type z and other individuals who are also
candid(x, y, 1) :- respect(x, y, >, 6). % People seek connections with individuals they respect more than others.
candid(x, y, 1) :- respect(x, z, <, 4), respect(y, z, <, 4). % People seek candidates with high respect from both peers and superiors.
candid(x, y, 1) :- romance(x, y, >, 3), romance(x, y, <, 7). % People seek closer connections with influential individuals within their social network.
candid(x, y, 1) :- successful(x). % People with a successful status are more likely to be interested in dating their crush.
candid(x, y, 1) :- trust(x, z, <, 4), trust(y, z, <, 4). % People are inclined to form connections with individuals they trust more than others in their social network.
candid(x, y, 2) :- afraid_of(x, z), afraid_of(y, z). % People are afraid of both their crush and strong individuals. They have a candid intent to get
candid(x, y, 2) :- antagonism(x, z, >, 6), antagonism(y, z, >, 6). % People desire to associate with those who are less antagonistic towards their connections.
candid(x, y, 2) :- antagonism(x, z, >, 6), mean(y, z). % People seek to connect with influential individuals when they have a strong desire for someone and it has
candid(x, y, 2) :- betrayed_by(x, z), mean(y, z). % People intending to be closer after being betrayed by someone and having a significant event occur within
candid(x, y, 2) :- charisma(x, >, 12). % People are attracted to individuals with high charisma levels when seeking a romantic partner.
candid(x, y, 2) :- embarrassment(x, y). % People desire to become more candid with those they are embarrassed by within a short timeframe
candid(x, y, 2) :- familial(x, y, >, 6). % People desire to connect with influential individuals within their social circle.
candid(x, y, 2) :- friendship(x, y, >, 6). % People have a strong desire to befriend those with more connections.
candid(x, y, 2) :- friendship(x, z, >, 6), friendship(y, z, >, 6). % People are likely to develop mutual friendships when they both have a strong desire for friendship with
candid(x, y, 2) :- honor(x, >, 12). % People seek proximity to influential individuals with high social standing.
candid(x, y, 2) :- nice(x, y). % People desire to be in the company of influential individuals.
candid(x, y, 2) :- public_friends(x, y). % People seek to form connections with influential individuals
candid(x, y, 2) :- publicly_romantically_committed_to(x, y). % People are romantically committed to their crushes and have a strong intent towards dating
candid(x, y, 2) :- rivals(x, z), rivals(y, z). % People have a desire to connect with both rivals x and y.
candid(x, y, 2) :- romance(x, y, >, 6). % People desire to be in close proximity with influential individuals.
candid(x, y, 2) :- trust(x, y, >, 7). % People are more likely to consider strong individuals as potential partners based on trust levels.
candid(x, y, 2) :- wisdom(x, >, 12). % People seek companions with greater wisdom when they desire a closer relationship or potential romantic interest.
candid(x, y, 3) :- familial(x, z, >, 6), familial(y, z, >, 6). % People seek to connect with individuals who have strong familial ties.
candid(x, y, 5) :- betrayed_by(x, z), betrayed_by(y, z). % People seeking candid relationships with individuals they've been betrayed by.
closeness(x, y, -10) :- hero(x), rival(y). % The hero doesn't particularly want to get closer to the rival
closeness(x, y, -10) :- love(x), hero(y). % The love generally doesn't want to get close to the hero
closeness(x, y, 20) :- hero(x), love(y). % The hero REALLY wants to increase closeness to the love
closeness(x, y, 5) :- anyone(x), intelligence(y, >, 20). % People want to get closer to smart people
closeness(x, y, 5) :- anyone(x), strength(y, >, 20). % People want to get closer to strong people
closeness(x, y, 5) :- closeness(x, y, >, undefined). % Everyone Wants to Increase Closeness
credibility(x, x, 3), emulation(x, x, 3), esteem(x, x, -10) :- social_standing(x, >, 66), social_standing(x, <, 33), provincial(x), rich(x), young(x). % A young provincial may be looked upon with disdain by rich peoeple
credibility(x, y, 1), affinity(x, y, 3), emulation(x, y, 1) :- impudent(x), young(x), propriety(x, <, 33), trustworthy(x), esteem(x, y). % Young, impudent, and vicious men are more prone to offend others
credibility(x, y, 3) :- owes_a_favor_to(x, y), honest(x). % Honest people may want to increase their credibility with those they are indebted to
credibility(x, y, 3) :- stagehand(x), feeling_socially_connected(x), wearing_a_uniform(x), financially_dependent_on(x, y). % Workers who feel socially connected may defy their employers
credibility(x, y, 5) :- clergy(x), elegantly_dressed(y), academic(y). % For a member of the clergy, an elegantly dressed academic has no credibility
credibility(x, y, 5) :- poor(x), jealous_of(x, y), rich(y). % Poor people may desire to gain the trust of rich people
credibility(x, y, 5) :- provincial(x), rich(y). % Provincials believe rich people are credible
credibility(x, y, 5) :- resentful_of(y, x), trusts(y, x). % Those who are resented and distrusted may want to improve their credibility
credibility(x, y, 5), ally(x, y, 5) :- happy(x), trusts(x, y), credulous(x), generous(y). % Happy, trusting people see others as credible
credibility(x, z, 2), credibility(x, y, -3) :- rivals(x, y), ambitious(x), ambitious(y), ally(y, z). % Ambitious rivals will prefer a third's judgement
credibility(y, x, 2) :- female(x), innocent_looking(x). % Innocent looking women inspire trust
credibility(y, x, 3), esteem(x, y, 1) :- ally(x, y), cares_for(x, y), financially_dependent_on(y, x), caught_in_a_lie_by(y, x), female(x), female(y). % Daughters caught with their lovers may become more cautious
credibility(y, x, 5) :- financially_dependent_on(x, y), greedy(y), cunningness(y, >, 50), credulous(x), deceptive(y). % A greedy, cunning, deceptive person wants to be believed by a credulous person
credibility(y, x, 5) :- rich(x), rich(x), stagehand(y), financially_dependent_on(y, x). % Workers may want to ally with rich people
credibility(y, x, 5) :- suspicious_of(x, y), charisma(y, >, 60), innocent_looking(y). % Attractive and trustworthy people lead suspicious people to have increased credibility in them
credibility(y, x, 5), affinity(y, x, 5) :- poorly_dressed(x), male(x). % A poorly dressed man inspires despise
credibility(y, x, 5), curiosity(y, x, 5) :- elegantly_dressed(x), male(x). % An elegantly dressed man inspires credibility and attention
curiosity(x, y, -1) :- shy(x), sensitiveness(x, >, 60), embarrassed(x), affinity(x, y, >, 60). % Shy, embarrassed, sensitive people have less desire to attract attention
curiosity(x, y, -2), ally(y, x, 3), curiosity(y, x, 3) :- affinity(x, y, <, 60), male(x), female(y), flirted_with(x, y), affinity(y, x, >, 60). % If a male flirts with a female and shows less interest, she will be more likely to want him
curiosity(x, y, -3) :- rich(x), rich(y), propriety(x, >, 70). % Appropriately behaved rich people may attract less attention from non-rich people
curiosity(x, y, -5) :- shy(x), male(x), female(y), affinity(x, y, >, 75). % A shy man may be less enterprising toward the woman he loves
curiosity(x, y, -5) :- young(x), male(x), shy(x), female(y). % A young and shy man may be less enterprising toward women
curiosity(x, y, -5), curiosity(z, y, -5) :- male(x), male(z), female(y), trusts(x, z). % An eccentric man and his friends tend to repel women
curiosity(x, y, 3) :- charisma(x, >, 60), beautiful(x), flirtatious(x). % Beautiful, flirty people will seek to attact attention
curiosity(x, y, 3) :- cultural_knowledge(x, 80), cultural_knowledge(y, <, 30), happy(y), amused(y), foreigner(y). % Amused and happy tourists may attract the attention of locals
curiosity(x, y, 3), ally(x, y, 3) :- vain(x), talkative(x), indiscreet(x). % Vain, talkative people may gossip and be indiscreet to make friends
curiosity(x, y, 3), curiosity(y, x, 3) :- female(x), beautiful(x), well_known(x). % Unfamiliar beautiful women may attract attention from others
curiosity(x, y, 5) :- charisma(x, >, 66), credulous(y), social_standing(y, >, 66), elegantly_dressed(x). % A charismatic and elegantly dressed person is more likely to draw attention
curiosity(x, y, 5) :- deceptive(x), caught_in_a_lie_by(x, y). % Liars may retaliate when exposed
curiosity(x, y, 5) :- male(x), young(x), female(z), young(z), beautiful(z), social_standing(y, <, 33), financially_dependent_on(y, z), shy(x). % A shy young male may seek the attention of the employee of the woman he is interested in
curiosity(x, y, 5) :- suspicious_of(x, y), ambitious(y), greedy(y), rich(x), male(x), female(y), charisma(x, >, 50). % A rich man doesn't want to be liked for his money
curiosity(x, y, 5), affinity(x, y, 5), esteem(x, y, 5), ally(y, x, 5) :- female(x), old(x), poor(x), rich(y), generous(y), virtuous(x). % A poor young girl can have an affinity for a rich older man
curiosity(x, y, 5), affinity(y, x, 5) :- honest(x), attendee(x), cares_for(x, y), young(y), harassed(y, z), female(y). % An honest person may help a sexually harassed girl
curiosity(x, y, 5), affinity(y, y, -1), emulation(x, y, 5) :- intimidating(x). % Boastful people want to draw attention to themselves but leave others annoyed
curiosity(x, y, 5), curiosity(y, x, -3) :- nosiness(x, >, 60), child(x), indiscreet(x). % Nosy, indiscreet children may try to get attention from others
curiosity(x, z, -3), affinity(x, y, 5) :- grateful(x), honest(x), modest(x), generous(y), jealous_of(z, x). % Grateful, modest people receiving a gift may avoid making others jealous
curiosity(x, z, 3), curiosity(y, z, 3) :- child(x), child(y), friends(x, y), ally(x, y), child(z). % Children who are friends may not look for an other child's attention
curiosity(y, x, -10), esteem(y, x, -10) :- beautiful(x), female(x), male(y), charisma(x, <, 30). % Unattractive men draw less attention from others
curiosity(y, x, -5) :- propriety(x, <, 50), affinity(x, y, >, 60), social_standing(x, <, 50), social_standing(y, >, 50). % People of high social standing may want less attention from inappropriately behaved people of lower social standing
curiosity(y, x, 2) :- beautiful(x), awkward(x), female(x), male(y), flirtatious(y), propriety(y, >, 50). % Seductive men help or flirt with clumsy, beautiful women
curiosity(y, x, 2) :- rich(x), inebriated(y), sensitiveness(x, >, 60). % A young rich personman tends to help a wounded and inebriated man
curiosity(y, x, 3) :- foreigner(x), foreigner(y). % A foreign person may draw the attention of others
curiosity(y, x, 5) :- affinity(x, y, >, 60), happy(y), sensitiveness(x, >, 60). % Unhappy people seek to increase attention from sensitive people who have a high affinity for them
curiosity(y, x, 5) :- propriety(x, <, 30), male(x), virtuous(x), criminal(y), poor(y). % Non-virtuous men draw the attention of sex workers
curiosity(y, x, 5) :- propriety(x, <, 50), rich(x), upset(x), financially_dependent_on(y, x), stagehand(y). % A worker does not want to engage with upset and inappropriate employers
curiosity(y, x, 5) :- provincial(x), nosiness(x, >, 50), sophistication(x, <, 40), propriety(x, <, 40), rich(x). % Some lower class urbanites may be nosy and unsophisticated
curiosity(y, x, 5) :- rich(x), indifferent(x), self_assuredness(x, 70), attendee(y), social_standing(y, <, 60), social_standing(x, >, 85). % Powerful, indifferent, rich people draw attention to themselves
curiosity(y, x, 5), affinity(x, y, 5) :- credulous(x), honest(x), deceptive(y), female(x), male(y), charisma(y, >, 50). % A deceptive and charismatic man inspires a credulous honest woman to increase interest
curiosity(y, x, 5), affinity(x, y, 5), curiosity(x, y, 5) :- male(x), beautiful(x), old(x), female(y), poor(y), young(y), rich(x). % A rich old man may focus his attention on a poor young woman
curiosity(y, x, 5), affinity(y, x, 5) :- beautiful(x), modest(x), poor(x), rich(y), social_standing(y, >, 60). % Beautiful, modest, poor people inspire attention and affinity in rich people
curiosity(y, x, 5), affinity(y, x, 5), ally(y, x, 5) :- female(x), old(x), poor(x), rich(y), generous(y), virtuous(x). % A rich old man can have an affinity for non-virtuous young women
curiosity(y, x, 5), esteem(y, x, -5) :- social_standing(x, <, 50), poor(x), elegantly_dressed(x), female(x). % Poor women of low social standing attract attention when elegantly dressed
curiosity(y, x, 5), esteem(y, x, 5), curiosity(x, y, 2) :- sophistication(x, <, 50), propriety(x, <, 50), sophistication(y, >, 65). % Good conversationalists have no use for poor conversationalists
curiosity(z, y, 5) :- nosiness(x, >, 60), affinity(z, y, >, 70), friends(x, y). % People with a high affinity for others want to avoid the attention of nosy friends
dating(x, y, -5) :- friends_with(x, y). % Being friends can lead to the friend zone
dating(x, y, 5) :- crushing_on(x, y). % People Want to Date Their Crush
deny(x, y, 10) :- rude(y, x). % People are more likely to deny someone something if that person has been rude
depressed(x, y, 1) :- depressed(x). % You are more likely to act depressed if you are depressed
disdain(x, y, 2) :- friendship(x, y, <, 3). % You are more likely to have disdain for someone you are not friendly towards
dismiss(x, y, 5) :- met(x, y), neutral(y, x), status_individual(x, >, 50). % No Greet and neutral for high status -> dismiss
dismiss(x, y, 5) :- met(x, y), respectful(y, x), status_individual(x, <, 51). % No greet + Respectful request for low status -> dismiss
dismiss(x, y, 5) :- negative(x, y), neutral(y, x), status_individual(x, >, 50). % If the someone is negative and is neutral to a high status person, one's volition for dismiss is increased
dismiss(x, y, 5) :- negative(x, y), respectful(y, x), status_individual(x, <, 51). % If you negatively greet and respectfully requested to a low status person -> increase dismiss volition
dominate(x, y, 5) :- trust(x, y, >, 5). % New Dominance Rule
emulation(x, y, 2) :- upset(x), propriety(x, <, 50), propriety(y, <, 50), sensitiveness(y, >, 50). % Sensitive / low propriety will tend to emulate upset behavior
emulation(x, y, 3) :- clergy(x), poor(y), hypocritical(x). % Poor people can be more impressed by a spectacle of faith than true virtue
emulation(x, y, 3) :- friends(x, y). % Friends want their friends to emulate them and like the same things
emulation(x, y, 5) :- charisma(x, >, 70), beautiful(x), propriety(x, <, 50), lovers(x, y), cares_for(y, x). % Charismatic lovers may encourage inpropriety
emulation(x, y, 5) :- child(x), musician(y). % Children may want to imitate musicians
emulation(x, y, 5) :- friends(x, y), propriety(y, <, 50), virtuous(x). % Virtuous friends want to inspire their inappropriate friends
emulation(x, y, 5) :- offended_by(x, z), propriety(y, >, 75). % Offended people may encourage others to also be offended
emulation(x, y, 5) :- social_standing(x, >, 70), rich(x), propriety(y, >, 50). % People are likely to emulate others of very high social standing
emulation(x, y, 5), credibility(y, x, 5), rivals(x, y, -3) :- cares_for(x, y), esteems(y, x), generous(x). % Generous mentor has no fear of mentoree
emulation(x, y, 5), curiosity(x, y, 5) :- rich(x), elegantly_dressed(x), sophistication(x, >, 60), vain(x). % Vain and elegant rich people want others to like and imitate them
emulation(x, y, 5), curiosity(x, y, 5), ally(x, y, 5) :- affinity(x, y, >, 60). % People who like others seek to emulate them and become allies
emulation(y, x, 3) :- propriety(x, >, 70), male(x), sophistication(x, >, 80). % Propriety is often imitated
emulation(y, x, 3) :- provincial(x), provincial(y). % Provincials imitate non-provincials
emulation(y, x, 5) :- financially_dependent_on(x, y), rich(y), ally(x, y), sophistication(x, <, 50), sophistication(y, >, 50), young(x). % Financial dependent people emulate their sophisticated benefactors
emulation(y, x, 5) :- poor(x), rich(y), propriety(y, <, 33), young(x). % A poor young man can follow a rich man to do improper things for money
esteem(x, y, -2), affinity(x, y, -2) :- young(x), old(y), male(x), male(y). % A young man is less likely to become friends with an old man
esteem(x, y, -5) :- married(x, y), rich(x), rich(y), happy(x), rich(x), resentful_of(x, y). % Unhappy, resentful, non-rich people married to other non-rich people may be less likely to esteem their spouse
esteem(x, y, 2), affinity(x, y, 2) :- rich(x), vain(x), disdainful(x), rich(y). % Disdainful vain, rich, people do not like non-rich people
esteem(x, y, 2), affinity(x, y, 5) :- devout(x), devout(y). % Devout people do not esteem others
esteem(x, y, 3), affinity(x, y, 3) :- grateful(x), owes_a_favor_to(x, y), provincial(x), friends(x, y). % Someone who is grateful could do everything for the one he owes a favor to
esteem(x, y, 3), affinity(x, y, 3) :- grateful(x), owes_a_favor_to(x, y), provincial(x), friends(x, y). % Someone who is grateful could do everything for the one he owes a favor to
esteem(x, y, 3), affinity(y, x, 2), emulation(y, x, 3) :- child(x), child(y), innocent_looking(y), sensitiveness(y, >, 66), cares_for(y, x). % Children may be positively impressed by sensitive, caring people
esteem(x, y, 3), esteem(y, x, 2), credibility(x, y, 3) :- caught_in_a_lie_by(x, y), social_standing(y, >, 66), credulous(y), trusts(y, x), credibility(y, x, >, 66), social_standing(x, <, 33), elegantly_dressed(x). % A rich person discovering a lie from a false rich person is more likely to seek revenge
esteem(x, y, 5) :- affinity(x, y, >, 80), jealous_of(x, x), curiosity(y, x, <, 33). % Someone in love will trust their loved one if he/she rejects other suitors
esteem(x, y, 5) :- esteems(x, y), honest(y). % Honesty strengthens friendship
esteem(x, y, 5) :- innocent_looking(x), male(x), rich(x). % Innocent looks and manners inspire friendship
esteem(x, y, 5) :- male(y), mocking(y), academic(y), young(y), ridicules(y, x), resentful_of(x, y), female(x), cunningness(x, >, 80), security_guard(x). % An young academic mocks cunning actresses
esteem(x, y, 5), credibility(x, y, 5), curiosity(x, y, -2) :- cultural_knowledge(x, <, 50), cultural_knowledge(y, >, 70), rich(y), rich(x), wearing_a_first_responder_uniform(x), sophistication(y, >, 70). % A man with no cultural knowledge does not want to lose his rich friend's esteem
esteem(x, y, 5), esteem(y, x, 5) :- friends(x, y). % Friends want to be held in mutual esteem
esteem(y, x, -3), affinity(y, x, -3) :- married(x, y), female(y), kind(x), male(x), tired(x), rich(x), greedy(y), ambitious(y), rich(y). % Spineless, poor husbands let their ambitious wives walk all over them
esteem(y, x, 10) :- merchant(x), honest(x), propriety(x, <, 40), sophistication(y, >, 60), talkative(x). % A chatty merchant can disgust sophisticated people
esteem(y, x, 3) :- elegantly_dressed(x), male(x). % Elegantly dressed men may be more esteemed
favor(x, y, -1) :- antagonism(x, z, >, 6), did_a_favor_for(y, y). % People may seek to improve their social standing by associating with influential individuals when they have recently
favor(x, y, -1) :- familial(x, z, >, 6), mean(y, z). % People tend to seek stronger connections with those who have a larger social network within the same family.
favor(x, y, -1) :- friendship(x, z, >, 6), mean(y, z). % People tend to favor those with stronger connections when their crushes are within a close social circle
favor(x, y, -1) :- mean(x, y). % People develop a preference to be around influential individuals.
favor(x, y, -1) :- romance(x, z, >, 6), mean(y, z). % People seek to deepen connections with influential individuals when they have had meaningful interactions within the
favor(x, y, -1) :- trust(x, y, <, 4). % People tend to favor strong individuals in their network.
favor(x, y, -2) :- altruism(x, <, 7). % People seek companionship with those exhibiting high altruism levels.
favor(x, y, -2) :- antagonism(x, z, >, 6), did_a_favor_for(y, z). % People are inclined to seek connections with influential individuals when they have recently done a favor for
favor(x, y, -2) :- envy(x, y). % People envy others' strong connections and favor forming relationships with those they admire. Rule Name
favor(x, y, -2) :- friendship(x, y, <, 4). % People tend to favor closer friends over weaker acquaintances.
favor(x, y, -2) :- gratitude(x, y, <, 4). % People seek proximity to influential individuals due to gratitude.
favor(x, y, -2) :- mean(x, y). % People develop a favorable disposition towards strong individuals.
favor(x, y, -2) :- respect(x, y, <, 4). % People tend to favor stronger individuals in their social network.
favor(x, y, -2) :- rivals(x, y). % People avoid dating their rivals' partners.
favor(x, y, -3) :- familial(x, z, >, 6), mean(y, z). % People seek closer connections with influential individuals and have a strong inclination to date their crush
favor(x, y, -3) :- feuding(x, y). % People seek to distance themselves from feuding individuals.
favor(x, y, -3) :- friendship(x, z, >, 6), mean(y, z). % People seek closer friendships with influential individuals and prioritize dating their crushes
favor(x, y, -3) :- mean(x, y). % People seek companionship with influential individuals to form connections.
favor(x, y, -3) :- romance(x, z, >, 6), mean(y, z). % People develop a favorable intent towards getting closer to strong individuals when they have been meaningfully interact
favor(x, y, -3) :- romance(x, z, >, 6), romance(y, z, >, 6). % People are inclined to seek connections with influential individuals and their romantic interests.
favor(x, y, -5) :- antagonism(x, y, >, 6). % People tend to avoid strong individuals due to antagonism. However, they may develop romantic
favor(x, y, -5) :- betrayed_by(x, y). % People avoid being betrayed by others and may favor those who have not caused them to feel bet
favor(x, y, -5) :- familial(x, z, >, 6), mean(y, z). % People tend to seek closer relationships with influential individuals and have a strong desire for their crush
favor(x, y, -5) :- friendship(x, z, >, 6), mean(y, z). % People tend to favor those with stronger connections when their crushes are within recent social circles.
favor(x, y, -5) :- romance(x, z, >, 6), mean(y, z). % People are inclined to form closer bonds with influential individuals and have a favorable intent
favor(x, y, 1) :- afraid_of(x, y). % People avoid those they are afraid of and may favor getting closer to strong individuals.
favor(x, y, 1) :- antagonism(x, z, >, 6), antagonism(y, z, >, 6). % People desire to associate with those they perceive as more influential or popular than themselves.
favor(x, y, 1) :- antagonism(x, z, >, 6), mean(y, z). % People desire to form connections with influential individuals when they have a strong antagonistic network sentiment
favor(x, y, 1) :- betrayed_by(x, z), mean(y, z). % People who have been betrayed by someone (z) and feel the mean action occurred within a
favor(x, y, 1) :- did_a_favor_for(x, y). % People have a positive intent to do favors for strong individuals within the last month.
favor(x, y, 1) :- familial(x, z, >, 6), did_a_favor_for(y, z). % People who have a strong familial network with more than six connections and have done a favor for
favor(x, y, 1) :- feuding(x, z), feuding(y, z). % People with feuding relationships towards strong individuals and their respective counterparts desire to form a favor
favor(x, y, 1) :- friendly(x). % People are inclined to favor strong individuals as friends.
favor(x, y, 1) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People who have a strong social network with more than six friends and have recently done a favor for
favor(x, y, 1) :- friendship(x, z, >, 6), nice(y, z). % People have a strong desire to favor their crush when they are within close proximity of friends
favor(x, y, 1) :- friendship(x, z, >, 6), nice(y, z). % People seek to form friendships with influential individuals and have positive interactions within a short timeframe
favor(x, y, 1) :- guilty(x). % People develop a favorable disposition towards strong individuals when they feel guilty.
favor(x, y, 1) :- is_boss_of(x, y). % People seek favor from their superiors.
favor(x, y, 1) :- nice(x, y). % People develop a favorable intent towards strong individuals after observing positive interactions within the last month to
favor(x, y, 2) :- antagonism(x, z, >, 6), mean(y, z). % People desire to connect with influential individuals and are inclined towards dating their crushes
favor(x, y, 2) :- betrayed_by(x, z), mean(y, z). % People develop a favor towards their crush after feeling betrayed by someone else.
favor(x, y, 2) :- did_a_favor_for(x, y). % People intend to do favors for influential individuals due to past actions.
favor(x, y, 2) :- familial(x, z, >, 6), did_a_favor_for(y, z). % People feel indebted to their strong connections and are likely to do favors for them.
favor(x, y, 2) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People are likely to do a favor for strong individuals if they have been friends with them for more
favor(x, y, 2) :- friendship(x, z, >, 6), friendship(y, z, >, 6). % People are inclined to strengthen their connections with influential individuals and seek companionship from those
favor(x, y, 2) :- honor(x, >, 12). % People seek companionship with individuals of higher honor status.
favor(x, y, 2) :- idolize(x, y). % People idolize strong individuals and develop a favorable intent towards them.
favor(x, y, 2) :- nice(x, y). % People develop a favorable intent towards strong individuals when they have recently experienced positive interactions with them.
favor(x, y, 2) :- public_friends(x, y). % People favor getting closer to strong individuals in their social circle.
favor(x, y, 2) :- publicly_romantically_committed_to(x, y). % People favor strong individuals in a publicly romantic relationship with them.
favor(x, y, 2) :- respect(x, y, >, 6). % People have a strong respect for individuals with high social influence and are inclined to develop favorable
favor(x, y, 2) :- rivals(x, z), rivals(y, z). % People are inclined to get closer when rivals have a mutual rivalry towards the same
favor(x, y, 2) :- successful(x). % People develop a favorable intent towards strong individuals when they perceive themselves as successful.
favor(x, y, 2) :- trust(x, y, >, 6). % People have a strong inclination to form closer bonds with individuals they trust significantly.
favor(x, y, 3) :- altruism(x, >, 12). % People with high altruism seek to establish favorable relationships.
favor(x, y, 3) :- did_a_favor_for(x, y). % People intend to do favors for influential individuals.
favor(x, y, 3) :- familial(x, z, >, 6), did_a_favor_for(x, z). % People are inclined to form closer bonds with individuals they have helped recently.
favor(x, y, 3) :- familial(x, z, >, 6), familial(y, z, >, 6). % People seek to form stronger connections with those who are equally close-knit in their social circles
favor(x, y, 3) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People are likely to do a favor for strong individuals they've recently become friends with.
favor(x, y, 3) :- gratitude(x, y, >, 6). % People feel gratitude towards others with a higher network influence score than themselves.
favor(x, y, 3) :- helpful(x). % People are inclined to seek companionship with influential individuals.
favor(x, y, 3) :- indebted(x, y, >, 6). % People have a favorable intent towards stronger individuals when their indebtedness level exceeds that
favor(x, y, 5) :- did_a_favor_for(x, y). % People want to increase their social standing by doing favors for influential individuals.
favor(x, y, 5) :- familial(x, y, >, 6). % People seek proximity to influential individuals for personal growth and connections.
favor(x, y, 5) :- friendship(x, y, >, 6). % People have a strong desire to befriend those with more connections.
favor(x, y, 5) :- romance(x, y, >, 6). % People are inclined to seek closer relationships with influential individuals.
fight(x, y, -5) :- playmates(x, y). % You don't fight with your friends
fight(x, y, 2) :- hungry(x). % Hangry
flirt(x, y, -2) :- hangry(x). % Hangry people are less flirty
flirt(x, y, -2) :- respect(x, y, <, 4). % People don't want to flirt with people they don't respect
flirt(x, y, -2) :- respect(x, y, >, 7). % People flirt less with people they respect a lot
flirt(x, y, -3) :- attraction(x, y, <, 4). % People don't flirt with people they are unattracted to
flirt(x, y, -3) :- employee(x), employee(y). % Employees are less flirty with non-employees
flirt(x, y, -3) :- friendship(x, y, <, 4). % People flirt less with people they don't have friendly feeling towards
flirt(x, y, -3) :- friendship(x, y, >, 7), dating(x, y). % Friend zone. People flirt less with people they have a lot of friendly feeling towards as long as they aren't dating
flirt(x, y, -3) :- is_boss_of(x, y), employee(y). % Bosses are less flirty with their employees
flirt(x, y, -3) :- rude(y, x). % People don't want to flirt with people who were rude to them recently
flirt(x, y, -4) :- embarrassment(y, z), anyone(z). % People don't want to flirt with people who have embarrassed themself recently
flirt(x, y, -4) :- shy(x). % Shy people are less flirty
flirt(x, y, -999) :- family(x, y). % People don't flirt with their family
flirt(x, y, 1) :- attraction(x, y, >, 3), attraction(x, y, <, 8). % People want to flirt a little by default
flirt(x, y, 1) :- coworker(x, y), attraction(x, y, <, 4). % People are more inclined in general to flirt with their coworkers even if they aren't attracted to them
flirt(x, y, 1) :- friendly(x). % Friendly people are a little flirty
flirt(x, y, 1) :- nice(y, x). % People want to flirt with people who were nice to them recently
flirt(x, y, 2) :- coworker(x, y), attraction(x, y, >, 3), attraction(x, y, <, 8). % People are more inclined in general to flirt with their coworkers
flirt(x, y, 3) :- flirted_with(y, x). % People want to flirt with people who flirted with them recently
flirt(x, y, 4) :- on_break(x), employee(x), employee(y). % Employees are flirty with one another when on break
flirt(x, y, 5) :- attraction(x, y, >, 7). % People are flirty with people they are attracted to
flirt(x, y, 5) :- dating(x, y). % People are much more flirty with people they are dating
help(x, y, 5) :- positive(x, y), neutral(y, x), status_individual(x, <, 51). % Lower Status people are more likely to be helpful when you were positive and made a neutral request
help(x, y, 5) :- respectful(y, x), positive(x, y), status_individual(x, >, 50). % High status people are more likely to be helpful if you recently were respectful and positive
help(x, y, 5) :- status_individual(x, <, 51), formal(y, x), outsider(y). % Lower status people are more likely to be helpful if they were treated too formally by an outsider
honor(x, y, -1) :- antagonism(x, y, >, 6). % People desire to associate with influential individuals despite existing rivalries.
honor(x, y, -1) :- envy(x, y). % People envy others' connections with strong individuals and seek to form similar relationships.
honor(x, y, -1) :- familial(x, z, >, 6), mean(y, z). % People desire to honor their crush within a close-knit social circle over time.
honor(x, y, -1) :- friendship(x, z, >, 6), mean(y, z). % People desire to strengthen friendships with influential individuals and prioritize dating their cr
honor(x, y, -1) :- mean(x, y). % People seek companionship with influential individuals to gain respect and admiration.
honor(x, y, -1) :- rivals(x, y). % People avoid dating their rivals' partners when they desire to improve social standing.
honor(x, y, -1) :- romance(x, z, >, 6), mean(y, z). % People seek romantic connections with influential individuals when they have been consistently interested in their cr
honor(x, y, -2) :- familial(x, z, >, 6), mean(y, z). % People aim to strengthen familial ties with influential individuals and prioritize honoring
honor(x, y, -2) :- feuding(x, y). % People with feuding relationships seek to improve their honor by getting closer to influential individuals.
honor(x, y, -2) :- friendship(x, y, <, 4). % People seek to strengthen connections with influential individuals.
honor(x, y, -2) :- friendship(x, z, >, 6), mean(y, z). % People desire to honor their closest friends within a year of meeting.
honor(x, y, -2) :- mean(x, y). % People seek to associate with influential individuals despite their initial discomfort.
honor(x, y, -2) :- respect(x, y, <, 4). % People seek respect from individuals with higher levels of influence.
honor(x, y, -2) :- romance(x, z, >, 6), mean(y, z). % People desire to connect with influential individuals and have a strong interest in their crush within the
honor(x, y, -3) :- betrayed_by(x, y). % People feel betrayed by someone and seek to distance themselves from that person.
honor(x, y, -3) :- familial(x, z, >, 6), mean(y, z). % People aim to strengthen connections with influential individuals and prioritize dating their crush
honor(x, y, -3) :- friendship(x, z, >, 6), mean(y, z). % People seek to strengthen friendships with influential individuals within a short timeframe after showing interest
honor(x, y, -3) :- romance(x, z, >, 6), mean(y, z). % People's desire to strengthen connections with influential individuals decreases over time if they haven
honor(x, y, -5) :- honor(x, <, 7). % People seek to increase their honor by associating with individuals of higher honor.
honor(x, y, 1) :- did_a_favor_for(x, y). % People want to honor strong individuals they've helped.
honor(x, y, 1) :- familial(x, y, >, 6). % People seek stronger connections when they have a moderate-sized network of acquaintances.
honor(x, y, 1) :- familial(x, z, >, 6), familial(y, z, >, 6). % People desire to strengthen connections with influential individuals in their network.
honor(x, y, 1) :- friendly(x). % People seek to honor their connections with influential individuals.
honor(x, y, 1) :- friendship(x, y, >, 6). % People desire stronger friendships when their current number of friends is below a certain threshold.
honor(x, y, 1) :- indebted(x, y, >, 6). % People desire to honor stronger connections when indebtedness level exceeds a certain threshold.
honor(x, y, 1) :- public_friends(x, y). % People desire to associate with influential individuals for personal growth and respect.
honor(x, y, 1) :- publicly_romantically_committed_to(x, y). % People in publicly romantic commitment seek to honor their relationship status.
honor(x, y, 1) :- respect(x, z, <, 4), respect(y, z, <, 4). % People seek to associate with individuals of high respect within their social network.
honor(x, y, 1) :- respect(x, z, >, 6), respect(y, z, >, 6). % People seek respect from strong individuals and are motivated to honor those connections.
honor(x, y, 1) :- romance(x, y, >, 6). % People desire to pursue relationships with individuals they perceive as more influential or popular.
honor(x, y, 1) :- successful(x). % People seek to honor their connections with influential individuals.
honor(x, y, 2) :- did_a_favor_for(x, y). % People seek to honor strong individuals by doing favors.
honor(x, y, 2) :- friendship(x, z, >, 6), friendship(y, z, >, 6). % People desire stronger friendships with multiple connections to influence their pursuit of honor.
honor(x, y, 2) :- trust(x, y, >, 6). % People desire to honor strong individuals in their social network.
honor(x, y, 3) :- idolize(x, y). % People idolize strong individuals and develop a desire to honor them.
honor(x, y, 3) :- respect(x, y, >, 6). % People seek to associate with individuals of high respect and admiration.
honor(x, y, 5) :- honor(x, >, 12). % People seek to increase their social honor by associating with individuals of higher status.
hospitable(x, y, 5) :- informal(y, x), status_individual(x, <, 51). % Low status person is more likely to be hospitable if treated informally
hospitable(x, y, 5) :- status_individual(x, >, 50), formal(y, x). % A high status person is more hospitable if the other person is formal
humble(x, y, 1) :- depressed(x). % You are more likely to be humble if you are depressed
humble(x, y, 1) :- friendship(x, y, <, 4). % You are more likely to be humble if you are not close friends
idealize(x, y, -1) :- afraid_of(x, y). % People are afraid of weak individuals and idealize strong people.
idealize(x, y, -1) :- envy(x, y). % People envy and idealize strong individuals.
idealize(x, y, -1) :- fearful(x). % People tend to idealize those they fear.
idealize(x, y, -1) :- feuding(x, y). % People tend to idealize those they are attracted to or wish to be closer to.
idealize(x, y, -2) :- altruism(x, <, 7). % People tend to idealize individuals with high altruism levels.
idealize(x, y, -2) :- betrayed_by(x, y). % People may develop negative feelings towards those who betray them.
idealize(x, y, -3) :- selfish(x). % People idealizing others to enhance their self-image.
idealize(x, y, 2) :- altruism(x, >, 12). % People idealize strong individuals when their altruism level exceeds a threshold.
idealize(x, y, 3) :- idolize(x, y). % People idolizing someone increases their idealization of that person.
idealize(x, y, 3) :- idolize(x, z), idolize(y, z). % People idolizing both person X and Y leads to an increased desire for dating their cr
impress(x, y, -1) :- employee(x). % Employees generally don't care about impressing people
impress(x, y, -1) :- rude(y, x). % People don't want to impress people who have been rude to them recently
impress(x, y, -2) :- family(x, y). % People worry less about impressing their family
impress(x, y, -2) :- friendship(x, y, <, 4). % People don't want to impress people they don't have friendly feeling towards
impress(x, y, -2) :- hangry(x). % Hangry people don't have time to impress people
impress(x, y, -3) :- embarrassment(y, z), anyone(z), anyone(x). % People don't want to impress people who have embarrassed themselves recently
impress(x, y, -3) :- jerk(x). % Jerks don't want to impress people
impress(x, y, -4) :- respect(x, y, <, 4). % People don't want to impress people they don't respect
impress(x, y, 1) :- coworker(x, y). % People want to impress their coworkers a little
impress(x, y, 1) :- friendship(x, y, >, 7). % People want to impress people they have very friendly feeling towards
impress(x, y, 2) :- attraction(x, y, >, 3), attraction(x, y, <, 8). % People want to impress people they are a little attracted to
impress(x, y, 2) :- flirted_with(y, x). % People want to impress people who have flirted with them recently
impress(x, y, 3) :- dating(x, y). % People want to impress people they are dating
impress(x, y, 3) :- shy(x). % Shy people want to impress people
impress(x, y, 4) :- employee(x), loyal(x). % A loyal employee wants to impress people
impress(x, y, 4) :- is_boss_of(y, x), respect(x, y, >, 3), respect(x, y, <, 8). % People really want their boss to be impressed with them if they respect them.
impress(x, y, 6) :- attraction(x, y, >, 7). % People very much want to impress people they are attracted to
impress(x, y, 6) :- employee(x), is_boss_of(y, x). % Employees want to impress their boss
impress(x, y, 6) :- respect(x, y, >, 7). % People very much want to impress people they respect
impress(x, y, 7) :- is_boss_of(x, y), employee(y). % Bosses care a lot about impressing their employees
indifferent(x, y) :- trust(x, y, >, 5). % default indifference
ingratiate(x, y, -1) :- antagonism(x, y, >, 6). % People seek to ingratiate themselves with those they have a significant antagonistic relationship towards
ingratiate(x, y, -1) :- mean(x, y). % People seek to ingratiate themselves with influential individuals.
ingratiate(x, y, -1) :- rivals(x, y). % People want to ingratiate themselves with those they consider rivals.
ingratiate(x, y, -1) :- successful(x). % People seek to ingratiate themselves with influential individuals.
ingratiate(x, y, -2) :- respect(x, y, <, 4). % People seek to ingratiate themselves with those they respect more than others.
ingratiate(x, y, -3) :- feuding(x, y). % People with feuding relationships aim to ingratiate themselves towards those they have conflicts with
ingratiate(x, y, 1) :- antagonism(x, z, >, 6), mean(y, z). % People desire to ingratiate themselves with individuals they perceive as strong when their social network
ingratiate(x, y, 1) :- did_a_favor_for(x, y). % People want to ingratiate themselves with those they've done favors for recently.
ingratiate(x, y, 1) :- honor(x, <, 7). % People seek to ingratiate themselves with individuals of higher honor status.
ingratiate(x, y, 1) :- is_boss_of(x, y). % People want to ingratiate themselves with their superiors.
ingratiate(x, y, 1) :- nice(x, y). % People's positive actions towards others with strong characteristics aim to ingratiate themselves.
ingratiate(x, y, 1) :- public_friends(x, y). % People seek to ingratiate themselves with influential individuals through public friendships.
ingratiate(x, y, 1) :- publicly_romantically_committed_to(x, y). % People want to ingratiate themselves with those who are publicly romantically committed
ingratiate(x, y, 1) :- respect(x, y, >, 6). % People seek to ingratiate themselves with those they respect significantly.
ingratiate(x, y, 2) :- afraid_of(x, y). % People who are afraid of someone (Person x) may try to ingratiate themselves with
ingratiate(x, y, 2) :- antagonism(x, z, >, 6), mean(y, z). % People seek to ingratiate themselves with individuals they perceive as strong when their feelings for
ingratiate(x, y, 2) :- fearful(x). % People with a fearful status seek to ingratiate themselves towards others.
ingratiate(x, y, 2) :- guilty(x). % People aim to ingratiate themselves with individuals of strong influence when they feel guilty.
ingratiate(x, y, 2) :- indebted(x, y, >, 6). % People want to ingratiate themselves with individuals they are indebted to more than others
ingratiate(x, y, 2) :- public_friends(x, z), public_friends(y, z). % People seek to ingratiate themselves with their crush by becoming public friends of mutual
ingratiate(x, y, 3) :- charisma(x, <, 7). % People seek to ingratiate themselves with individuals of high charisma.
ingratiate(x, y, 3) :- idolize(x, y). % People idolize strong individuals and seek to ingratiate themselves with them.
intelligence(x, 5) :- anyone(x). % Everyone desires intelligence
intelligence(x, 5) :- kinship(x, y, >, undefined). % Everyone is smart!
intelligence(x, 5) :- magicka_link(x, y, >, 9), intelligence(x, <, 10), intelligence(y, >, 10). % High magicka link allows intelligence training.
involved_with(x, y, -3) :- cinema_buff(x), cinema_buff(y). % Similar interest (movies) makes people LESS Likely to start dating
involved_with(x, y, 3) :- cinema_buff(x), cinema_buff(y). % In fact, Similar interest  (movies) makes people MORE Likely to STOP dating
involved_with(x, y, 5) :- attracted_to(x, y). % Attraction makes people want to start dating.
jokearound(x, y, 1) :- happiness(x, >, 70). % You are more likely to joke around when you are happy
jokearound(x, y, 1) :- humor(x, >, 60). % You are more likely to joke around if you have high humor
kind(x, y, -1) :- attraction(x, y, <, 4). % People are less kind to those they are unattracted to
kind(x, y, -1) :- familial(x, y, <, 4). % People seek closer connections with influential individuals in their network.
kind(x, y, -1) :- familial(x, z, >, 6), mean(y, z). % People seek to form closer bonds with influential individuals within a year of noticing their cr
kind(x, y, -1) :- friendship(x, z, >, 6), mean(y, z). % People seek to form new friendships with individuals who are perceived as stronger within a short time
kind(x, y, -1) :- mean(x, y). % People seek companionship with influential individuals.
kind(x, y, -1) :- respect(x, y, <, 4). % People seek respect from influential individuals in their network.
kind(x, y, -1) :- romance(x, z, >, 6), mean(y, z). % People seek romantic connections with influential individuals and have a strong interest in their crush within
kind(x, y, -1) :- romance(x, z, >, 6), romantic(y, z). % People's desire to be in a romantic relationship with their crush increases as they get
kind(x, y, -1) :- shy(x). % Shy people are less kind
kind(x, y, -1) :- xenophobic(x). % People avoid xenophobic individuals to seek companionship with others.
kind(x, y, -2) :- altruism(x, <, 7). % People seek companionship with those who exhibit high altruism levels.
kind(x, y, -2) :- envy(x, y). % People may develop feelings of envy towards those they perceive as more successful or powerful.
kind(x, y, -2) :- familial(x, z, >, 6), mean(y, z). % People desire to connect with influential individuals and have a strong interest in their crush within the
kind(x, y, -2) :- friendship(x, z, >, 6), mean(y, z). % People seek to strengthen connections with influential individuals and prioritize recent interactions over older ones
kind(x, y, -2) :- mean(x, y). % People desire to befriend or associate with influential individuals.
kind(x, y, -2) :- respect(x, y, <, 4). % People are less kind to people they don't respect
kind(x, y, -2) :- romance(x, z, >, 6), mean(y, z). % People seek closer connections with influential individuals and have a strong intent to date their crush within
kind(x, y, -2) :- romance(x, z, >, 6), romantic(y, z). % People desire to date their crush after feeling a strong connection within the last week.
kind(x, y, -3) :- familial(x, z, >, 6), mean(y, z). % People seek closer connections with influential individuals when they have had frequent interactions within the past week.
kind(x, y, -3) :- friendship(x, y, <, 4). % People aren't kind to people they are not friendly with
kind(x, y, -3) :- friendship(x, z, >, 6), mean(y, z). % People tend to seek closer friendships with influential individuals and have a recent interest in dating
kind(x, y, -3) :- mean(x, y). % People's average desire to be close increases towards strong individuals.
kind(x, y, -3) :- rivals(x, y). % People avoid dating their rivals' partners.
kind(x, y, -3) :- romance(x, z, >, 6), mean(y, z). % People desire to form closer relationships with influential individuals when they have a strong romantic interest in
kind(x, y, -3) :- romance(x, z, >, 6), romance(y, z, >, 6). % People desire stronger connections with those they are romantically interested in.
kind(x, y, -3) :- rude(y, x). % People are less kind to those who have been rude to them recently
kind(x, y, -3) :- trust(x, y, <, 4). % People desire to associate with individuals they trust more than others.
kind(x, y, -4) :- dating(x, y), dating(y, z). % People aren't nice to people they are dating if that person is dating someone else.
kind(x, y, -4) :- hangry(x). % People are much less kind when they are hangry
kind(x, y, -4) :- jerk(x). % Jerks are much less likely to be kind
kind(x, y, -4) :- met(x, y). % People are less kind to people they haven't met
kind(x, y, -5) :- antagonism(x, y, >, 6). % People tend to avoid strong antagonists and may seek emotional connections with those they have cr
kind(x, y, -5) :- betrayed_by(x, y). % People want to distance themselves from those who betrayed them.
kind(x, y, -5) :- feuding(x, y). % People avoid getting close to feuding individuals
kind(x, y, -5) :- friendship(x, y, <, 4). % People seek closer connections with influential individuals in their network.
kind(x, y, -6) :- on_break(x), employee(x), employee(y). % Employees on break want to be left alone
kind(x, y, 1) :- betrayed_by(x, z), mean(y, z). % People who have been betrayed by someone (z) and mean something significant to them within the
kind(x, y, 1) :- coworker(x, y). % Coworkers are a little kind to one another
kind(x, y, 1) :- did_a_favor_for(x, y). % People seek companionship with influential individuals.
kind(x, y, 1) :- familial(x, z, >, 6), did_a_favor_for(y, z). % People seek to form closer bonds with influential individuals due to a favor received within the past
kind(x, y, 1) :- familial(x, z, >, 6), did_a_favor_for(y, z). % People who have a strong familial network with more than six connections and have done a favor for
kind(x, y, 1) :- familial(x, z, >, 6), did_a_favor_for(y, z). % People with a strong network of family connections who have recently done favors for their crush are
kind(x, y, 1) :- familial(x, z, >, 6), nice(y, z). % People desire to form closer bonds with influential individuals and have a positive intent towards dating
kind(x, y, 1) :- flirted_with(y, x). % People are a little kind to those who have flirted with them recently
kind(x, y, 1) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People are likely to develop a desire for friendship with strong individuals due to past favors.
kind(x, y, 1) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People with a strong desire for connections are likely to form friendships when they have helped their cr
kind(x, y, 1) :- friendship(x, z, >, 6), did_a_favor_for(y, z). % People with a strong network of friends (friendship count >6) who have recently done fav
kind(x, y, 1) :- friendship(x, z, >, 6), nice(y, z). % People are likely to seek friendships with individuals they perceive as strong when their existing friends have
kind(x, y, 1) :- honor(x, >, 12). % People seek companionship with individuals of higher honor status.
kind(x, y, 1) :- loyal(x). % Loyal people are kind
kind(x, y, 1) :- nice(x, y). % People desire to befriend strong individuals when they have had a positive interaction with them within the last
kind(x, y, 10) :- is_boss_of(x, y), punctual(x). % Bosses are kind to their punctual employees
kind(x, y, 2) :- altruism(x, >, 12). % People with high altruism seek companionship from equally selfless individuals.
kind(x, y, 2) :- betrayed_by(x, z), betrayed_by(y, z). % People desire to distance themselves from those they've been betrayed by.
kind(x, y, 2) :- betrayed_by(x, z), mean(y, z). % People with a betrayed status by someone want to get closer to their crush after an event
kind(x, y, 2) :- did_a_favor_for(x, y). % People are inclined to seek companionship with influential individuals.
kind(x, y, 2) :- familial(x, y, >, 6). % People seek connections with influential individuals within their extended network.
kind(x, y, 2) :- familial(x, z, >, 6), familial(y, z, >, 6). % People seek stronger connections with both their siblings and close friends.
kind(x, y, 2) :- fan_of_restaurant(x). % Fans of the restaurant are kind because they are in a good mood at the restaurant
kind(x, y, 2) :- friendship(x, z, >, 6), nice(y, z). % People seek to form friendships with influential individuals and have recently experienced positive social interactions.
kind(x, y, 2) :- helpful(x). % People seek companionship with influential individuals.
kind(x, y, 2) :- idolize(x, y). % People idolize and seek companionship with strong individuals.
kind(x, y, 2) :- nice(x, y). % People desire to associate with influential individuals and develop romantic interests in their crushes.
kind(x, y, 2) :- public_friends(x, y). % People seek companionship with influential individuals
kind(x, y, 2) :- public_friends(x, z), public_friends(y, z). % People seek companionship with individuals who are both friends of public figures and admired by their pe
kind(x, y, 2) :- publicly_romantically_committed_to(x, y). % People desire to be romantically involved with influential individuals.
kind(x, y, 2) :- respect(x, y, >, 6). % People seek connections with individuals who command respect and admiration.
kind(x, y, 2) :- respect(x, y, >, 7). % People are kind to those they respect
kind(x, y, 3) :- antagonism(x, y, <, 4). % People seek to distance themselves from individuals with strong antagonistic influences.
kind(x, y, 3) :- attraction(x, y, >, 7). % People are a very kind to those they are very attracted to
kind(x, y, 3) :- did_a_favor_for(x, y). % People seek companionship with influential individuals.
kind(x, y, 3) :- family(x, y). % Family members are kind to one another
kind(x, y, 3) :- friendly(x). % Friendly people are kind
kind(x, y, 3) :- friendly(x). % People seek companionship with individuals exhibiting friendly traits.
kind(x, y, 3) :- friendship(x, y, >, 7). % People are kind to people they have high friendly feelings for
kind(x, y, 3) :- friendship(x, z, >, 6), friendship(y, z, >, 6). % People desire to strengthen their connections with both strong individuals and close friends.
kind(x, y, 3) :- gratitude(x, y, >, 6). % People seek to associate with individuals of greater influence due to gratitude.
kind(x, y, 3) :- nice(x, y). % People desire to befriend strong individuals.
kind(x, y, 3) :- nice(y, x). % People are nice to those who have been nice to them recently
kind(x, y, 3) :- successful(x). % People desire to befriend those they perceive as strong.
kind(x, y, 3) :- trust(x, y, >, 6). % People desire to connect with individuals they trust more than others.
kind(x, y, 5) :- dating(x, y). % People are much more kind to people they are dating
kind(x, y, 5) :- friendship(x, y, >, 6). % People desire stronger friendships when their social network connections exceed a certain threshold.
kind(x, y, 5) :- romance(x, y, >, 6). % People desire stronger connections with individuals of higher social influence in their network.
kinship(x, y, 5) :- kinship(x, y, >, undefined). % Everyone is friendly!
manipulate(x, y, -1) :- respect(x, y, >, 6). % People seek to increase respect from others while dating their crushes.
manipulate(x, y, -1) :- trust(x, y, >, 6). % People seek to increase trust with stronger individuals but may inadvertently decrease their own intentional
manipulate(x, y, -2) :- friendship(x, y, >, 6). % People are influenced to form closer friendships with individuals perceived as stronger than themselves.
manipulate(x, y, -2) :- honor(x, >, 12). % People seek to influence their social circle by associating with individuals of higher honor.
manipulate(x, y, -3) :- friendship(x, z, >, 6), friendship(y, z, >, 6). % People are influenced to form friendships with both strong individuals and their crushes simultaneously.
manipulate(x, y, 1) :- afraid_of(x, y). % People manipulate their fear to get closer to strong individuals.
manipulate(x, y, 1) :- envy(x, y). % People envy others' strong connections and attempt to manipulate their social standing.
manipulate(x, y, 1) :- is_boss_of(x, y). % People manipulate their subordinates to gain influence.
manipulate(x, y, 2) :- antagonism(x, y, >, 6). % People seek to reduce antagonism and increase positive influence in their social networks.
manipulate(x, y, 2) :- betrayed_by(x, y). % People attempt to influence others through betrayal or manipulation by someone they perceive as strong
manipulate(x, y, 2) :- feuding(x, y). % People attempt to influence others by associating with influential individuals.
manipulate(x, y, 2) :- friendship(x, y, <, 4). % People are influenced to form friendships with individuals perceived as stronger when the difference in their strength
manipulate(x, y, 2) :- honor(x, <, 7). % People seek companionship with individuals of higher honor status.
manipulate(x, y, 2) :- rivals(x, y). % People are influenced to seek connections with individuals they perceive as more powerful.
manipulate(x, y, 3) :- romance(x, z, >, 6), romance(y, z, >, 6). % People seek stronger connections with both their peers and crushes to increase romantic interest.
manipulate(x, y, 3) :- selfish(x). % People with selfish traits manipulate others to get closer.
putdown(x, y, 2) :- friendship(x, y, <, 3). % You are more likely to put down someone you are not friends with
reluctant(x, y, -1) :- reluctant(x, y, >, 6). % If you have high familiarity towars someone you are less likely to be reluctant towards them.
reluctant(x, y, -1) :- trust(z, y, >, 6), family(x), family(z). % You are less likely to be reluctable to somebody if a family member has low trust toward them.
reluctant(x, y, -3) :- outsider(y), met(x, y), positive(y, x). % If someone has positively met an outsider, then they are less likely to be reluctant.
reluctant(x, y, 1) :- familiarity(x, y, <, 4). % If you have low familiarity towards someone, you are more likely to be reluctant.
reluctant(x, y, 1) :- trust(z, y, <, 4), family(x), family(z). % You are more likely to be reluctable to somebody if a family member has low trust toward them.
reluctant(x, y, 1) :- trust(z, y, <, 5), family(x), family(z). % People are more likely to be reluctant to somebody if their family members don't trust them.
reluctant(x, y, 3) :- outsider(y), met(x, y), negative(y, x). % If someone has negatively met an outsider, then they are more likely to be reluctant.
reluctant(x, y, 3) :- trustfulness(x, <, 33). % If somebody's trustfulness is low, then they will be more likely to be reluctant.
reluctant(x, y, 5) :- informal(y, x), status_individual(x, >, 50). % High status person has more likely to be reluctant if they are treated informally
reluctant(x, y, 5) :- met(x, y), neutral(y, x), status_individual(x, <, 51). % No Greet + neutral request for a low status person -> reluctant volition increased
reluctant(x, y, 5) :- met(y, x), respectful(y, x), status_individual(x, >, 50). % No greet + respectful request for high status--> increased reluctant volition
reluctant(x, y, 5) :- negative(x, y), neutral(y, x), status_individual(x, <, 51). % Negative and neutral request to a low status person -> increased reluctant volition
reluctant(x, y, 5) :- negative(x, y), respectful(y, x), status_individual(x, >, 50). % High Status person: Negative + Respectful Request -> inceased reluctant volition
reluctant(x, y, 5) :- outsider(y). % If someone is interacting with an outsider, then they will be more likely to be reluctant.
reluctant(x, y, 5) :- positive(x, y), neutral(y, x), status_individual(x, >, 50). % If someone is positive and neutral to a high status person then other increases volition for reluctance
reluctant(x, y, 5) :- positive(x, y), respectful(y, x), status_individual(x, <, 51). % Positive and respectful request to a low status person -> increased reluctant volition
respect(x, y, -5) :- proud(x). % Proud guys don't like increasing respect towards others
respect(x, y, 5) :- humble(x). % Humble guys like increasing respect for others
rivals(x, x, 5) :- affinity(x, y, >, 80), male(x), female(y), male(x), curiosity(x, y, >, 60). % A man may by jealous of another man approaching the woman he loves
rivals(x, x, 5) :- friends(x, y), ridicules(x, y). % If someone ridicules one's friend, he may become a rival
rivals(x, x, 5) :- friends(x, y), threatened_by(y, x). % People may fight to protect their friends who are threatened by another
rivals(x, y, 5) :- male(x), clergy(x), old(x), flirtatious(x), beautiful(x), female(y), young(y), harassed(y, x), criminal(y). % An old clergy seducer harasses a young criminal
rivals(x, y, 5) :- stagehand(x), greedy(x), trustworthy(x), female(y), credulous(y), young(y), cunningness(x, >, 30), affinity(y, x, >, 50). % A confidential servant wants to blackmail her naive mistress
rivals(x, y, 5), curiosity(z, y, 5), ally(x, z, 5) :- suspicious_of(x, y), married(x, z), intimidating(y), beautiful(z), female(z), honest(z), affinity(y, z, >, 70). % A suspicious husband with an honest wife can become a rival of other men
rivals(x, y, 5), rivals(y, x, 5) :- affinity(x, z, >, 80), affinity(y, z, >, 80). % Two people with a high affinity for a third person may become rivals
rivals(x, z, 5), affinity(x, y, -2) :- self_assuredness(x, <, 40), lovers(x, y), ally(y, z), male(x), female(y), male(z). % Man with low self-confidence fears rival in love
rivals(y, x, 10) :- male(x), wearing_a_first_responder_uniform(x), harassed(x, y), impressed(y, x), young(y), female(y), poor(y), flirtatious(x). % A poor girl is harassed and attacked by a seductive man
rivals(y, x, 10) :- rich(x), male(x), male(y), sensitiveness(y, >, 50), lovers(y, z), female(z), greedy(z). % A lover is jealous of a handsome and rich rival
rivals(y, x, 3) :- female(x), beautiful(x), female(y), elegantly_dressed(x), vain(y), elegantly_dressed(y), beautiful(y). % Beautiful, well-dressed women are often rivals
rivals(y, z, 5) :- rivals(x, z), friends(y, x). % Your friend's rival may also become your rival
romance(x, y, -1) :- embarrassed(x). % People avoid romantic advances when they feel embarrassed.
romance(x, y, -1) :- familial(x, z, >, 6), mean(y, z). % People desire romantic connections with individuals they perceive as strong within a close network when the average
romance(x, y, -1) :- friendship(x, y, >, 6). % People are inclined to form romantic interests towards individuals they perceive as strong.
romance(x, y, -1) :- friendship(x, z, >, 6), mean(y, z). % People with a strong desire for friendship and having had romantic intent towards their crush within the
romance(x, y, -1) :- mean(x, y). % People develop romantic intent towards strong individuals over time.
romance(x, y, -2) :- betrayed_by(x, y). % People don't romantically pursue those who betray them.
romance(x, y, -2) :- familial(x, z, >, 6), mean(y, z). % People seeking to deepen connections with influential individuals and having a strong romantic interest in their
romance(x, y, -2) :- friendship(x, z, >, 6), mean(y, z). % People with a strong desire for friendship and who have been in close proximity to their crush
romance(x, y, -2) :- mean(x, y). % People's average desire to get closer increases when they are within 9-30 turns
romance(x, y, -3) :- familial(x, z, >, 6), mean(y, z). % People seek romantic connections with individuals who are well-connected within their social circles.
romance(x, y, -3) :- friendship(x, z, >, 6), mean(y, z). % People seek romantic connections with individuals who have a strong social network within the last 8 turns
romance(x, y, -3) :- heartbroken(x). % People seeking solace after a breakup aim to form romantic connections.
romance(x, y, -3) :- mean(x, y). % People desire to form romantic connections with influential individuals.
romance(x, y, -5) :- romance(x, y, <, 4). % People desire to be in closer proximity with influential individuals than their current connections.
romance(x, y, -5) :- romance(x, z, >, 6), romance(y, z, >, 6). % People seek to form romantic connections with individuals who are highly regarded within their social circles.
romance(x, y, 1) :- happy(x). % You are more likely to be romantic if you are happy
romance(x, y, 1) :- romantic(x, y). % People have romantic intent towards their crush within the last month.
romance(x, y, 2) :- publicly_romantically_committed_to(x, y). % People in a publicly romantic relationship with someone else are likely to pursue dating their
romance(x, y, 2) :- romance(x, y, >, 7). % You are more likely to be romantic towards someone you have high romance with
romance(x, y, 2) :- romantic(x, y). % People develop romantic intent towards strong individuals after a significant event within the past month.
romance(x, y, 3) :- romantic(x, y). % People develop romantic intent towards strong individuals within the last week.
romance(x, y, 5) :- romance(x, y, >, 6). % People desire to increase their romantic connections with individuals who have a strong social network.
rude(x, y, -1) :- coworker(x, y). % People are a little less rude to their coworkers
rude(x, y, -1) :- loyal(x). % Loyal people are less rude
rude(x, y, -2) :- fan_of_restaurant(x). % Fans of the restaurant are less rude
rude(x, y, -2) :- flirted_with(y, x). % People are less rude to those who have flirted with them recently
rude(x, y, -2) :- nice(y, x). % People are less rude to those who have been nice to them recently
rude(x, y, -2) :- shy(x). % Shy people are less rude
rude(x, y, -3) :- family(x, y). % People are less rude to their family
rude(x, y, -3) :- friendship(x, y, >, 7). % People are much less rude to they that they have friendly feelings towards
rude(x, y, -3) :- respect(x, y, >, 7). % People are less rude to people they respect a lot
rude(x, y, -4) :- dating(x, y). % People are less rude to people they are dating
rude(x, y, -4) :- friendly(x). % Friendly people don't want to be rude
rude(x, y, -5) :- attraction(x, y, >, 7). % People are much less rude to those that they are attracted to
rude(x, y, -5) :- flirted_with(y, x), attraction(x, y, >, 7). % People are much less rude to those who they are attracted to if they flirted with them recently
rude(x, y, 1) :- attraction(x, y, <, 4). % People are a little more rude to those they are unattracted to
rude(x, y, 2) :- embarrassment(y, x). % People are more rude to those who have embarrassed themself in front of them recently
rude(x, y, 2) :- met(x, y). % People are more rude to people they haven't met
rude(x, y, 2) :- on_break(x), employee(x), employee(y). % Employees are more rude to non-employees when they are on break
rude(x, y, 3) :- flirted_with(y, x), attraction(x, y, <, 4). % People are more rude to those they are unattracted to who have ever flirted with them ever
rude(x, y, 4) :- friendship(x, y, <, 4). % People are a little more rude to people they don't feel friendly with
rude(x, y, 4) :- jerk(x). % Jerks are very rude
rude(x, y, 4) :- respect(x, y, <, 4). % People are much more rude to those that they don't respect
rude(x, y, 4) :- rude(y, x). % People are more rude to those who have been rude to them recently
rude(x, y, 5) :- dating(x, y), attraction(x, y, <, 4). % People are more rude to people they are dating but unattracted to
rude(x, y, 5) :- dating(x, y), dating(y, z). % People aren't nice to people they are dating if that person is dating someone else.
rude(x, y, 5) :- flirted_with(y, x), attraction(x, y, <, 4). % People are much more rude to those that they aren't attracted to if they have flirted with them recently
rude(x, y, 5) :- hangry(x). % Hangry people are very rude
shutdown(x, y, 2) :- trust(x, y, <, 3). % You are more likely to shut down someone you don't trust
strength(x, 5) :- anyone(x). % Everyone Desires Strength
strength(x, 5) :- strength(x, <, 10). % Weak people desire strength
suckup(x, y, 2) :- romance(x, y, >, 7). % You are more likely to suck up towards someone you feel romantic towards
trust(x, y, -1) :- familial(x, z, >, 6), mean(y, z). % People's desire to get closer within their extended family network and having a long-standing interest
trust(x, y, -1) :- friendship(x, z, >, 6), mean(y, z). % People seek to deepen trust with friends they've been close for over 30 days
trust(x, y, -1) :- romance(x, z, >, 6), mean(y, z). % People seek stronger connections with individuals they are romantically interested in when their trust level towards those
trust(x, y, -1) :- romance(x, z, >, 6), nice(y, z). % People develop trust towards their crush after frequent positive encounters within the last week.
trust(x, y, -1) :- romance(x, z, >, 6), romantic(y, z). % People seek romantic connections with individuals who have a strong social network and whom they've had
trust(x, y, -2) :- familial(x, z, >, 6), mean(y, z). % People seek to increase trust with those they are already somewhat close to within the last 9-
trust(x, y, -2) :- fearful(x). % People with a fearful status seek trust from others.
trust(x, y, -2) :- friendship(x, z, >, 6), mean(y, z). % People's desire to strengthen friendships with influential individuals and recent positive interactions within the
trust(x, y, -2) :- mean(x, y). % People seek to increase trust with strong individuals within a recent timeframe.
trust(x, y, -2) :- respect(x, y, <, 4). % People seek trust with those who are highly respected in their network.
trust(x, y, -2) :- romance(x, z, >, 6), mean(y, z). % People seek stronger connections when they have a high romantic interest in someone and trust has been established
trust(x, y, -2) :- romance(x, z, >, 6), romantic(y, z). % People develop trust towards their crush when they have been in a romantic event within the past
trust(x, y, -3) :- afraid_of(x, y). % People are afraid of being judged by others when they trust their crush.
trust(x, y, -3) :- familial(x, z, >, 6), mean(y, z). % People seek to increase trust with their crush within 8 turns based on a strong network connection
trust(x, y, -3) :- friendship(x, y, <, 4). % People have a lower trust towards weaker connections compared to stronger ones in their social network.
trust(x, y, -3) :- friendship(x, z, >, 6), mean(y, z). % People's desire to trust their friends increases over time if they have more than 5 connections
trust(x, y, -3) :- heartbroken(x). % People seeking solace after a breakup
trust(x, y, -3) :- rivals(x, y). % People avoid dating their rivals' partners.
trust(x, y, -3) :- romance(x, z, >, 6), mean(y, z). % People develop trust towards strong individuals when they have been consistently attracted to them for at least
trust(x, y, -3) :- romance(x, z, >, 6), romance(y, z, >, 6). % People desire stronger connections with both crush and peers to increase trust.
trust(x, y, -3) :- xenophobic(x). % People with xenophobic traits may struggle to build trust in others.
trust(x, y, -5) :- antagonism(x, y, >, 6). % People seek to reduce antagonism and increase trust towards stronger individuals in their network.
trust(x, y, -5) :- betrayed_by(x, y). % People feel betrayed by someone and develop distrust towards them.
trust(x, y, -5) :- feuding(x, y). % People with feuding relationships aim to increase trust towards strong individuals.
trust(x, y, -5) :- mean(x, y). % People's average trust in strong individuals decreases over time if they have not been dating
trust(x, y, -5) :- trust(x, y, <, 4). % People seek to increase trust with weaker individuals but decrease it when interacting with stronger ones.
trust(x, y, 1) :- did_a_favor_for(x, y). % People develop trust towards those they've done favors for.
trust(x, y, 1) :- idolize(x, y). % People idolize strong individuals and develop trust towards them.
trust(x, y, 1) :- nice(x, y). % People develop trust towards strong individuals over time when they have had positive interactions.
trust(x, y, 1) :- public_friends(x, y). % People seek trust from public friends when they have a crush.
trust(x, y, 1) :- publicly_romantically_committed_to(x, y). % People desire to trust individuals they are romantically committed with.
trust(x, y, 2) :- did_a_favor_for(x, y). % People develop trust towards those they have done favors for recently.
trust(x, y, 2) :- familial(x, y, >, 6). % People desire to trust stronger individuals in their network when the number of strong connections exceeds six.
trust(x, y, 2) :- familial(x, z, >, 6), familial(y, z, >, 6). % People desire to trust and connect with both of their closest family members.
trust(x, y, 2) :- nice(x, y). % People develop trust towards strong individuals over time.
trust(x, y, 2) :- respect(x, y, >, 6). % People desire to trust and form closer relationships with individuals they respect significantly.
trust(x, y, 3) :- did_a_favor_for(x, y). % People develop trust towards those they have done favors for recently.
trust(x, y, 3) :- friendship(x, z, >, 6), friendship(y, z, >, 6). % People desire to strengthen their connections with influential individuals and seek trust in those relationships.
trust(x, y, 3) :- romance(x, y, >, 6). % People seek closer connections with influential individuals to increase trust levels in their relationships.
trust(x, y, 5) :- friendship(x, y, >, 6). % People have a strong desire to form friendships with individuals who are more popular than themselves.
trust(x, y, 5) :- trust(x, y, >, 6). % People seek to increase trust with individuals they perceive as strong.
vengeance(x, y, 5) :- evil(x), good(y). % Evil seeks vengeance on good.