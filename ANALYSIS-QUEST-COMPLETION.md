# Quest Completion Reference — World 69cbbc6b7dbae7be5f935995

For each quest objective, this table shows the exact player action that marks it complete.

## ACTIVE (1)

| Quest | Objective | ×N | Exact Player Action |
|-------|-----------|---:|---------------------|
| Arrival Assessment | Complete the arrival language assessment | 1 | Complete each assessment phase modal (reading quiz, writing prompt, listening quiz, conversation with NPC) |

## AVAILABLE (107)

| Quest | Objective | ×N | Exact Player Action |
|-------|-----------|---:|---------------------|
| A Good Chat | Have a 3-turn conversation with {npc} | 3 | Send N messages in NPC chat (event: conversation_turn per message) |
| A Thoughtful Gift | Find a gift item | 1 | Click on a world item to pick it up (event: item_collected) |
|  | Present the gift to {npc} | 1 | Present a gift item to an NPC via gift action (event: gift_given) |
| Ask for Directions | Ask NPCs for directions | 3 | Ask NPC for directions in conversation (event: npc_talked + npc_speech_act) |
| Bargain Hunter | Negotiate a price with {npc} in {targetLanguage} | 1 | Type bargaining words in merchant chat (event: price_haggled) |
| Campfire Tales | Listen to {npc_0} tell a story and repeat key phrases | 3 | Listen to TTS phrase, speak/type it back (event: pronunciation_attempt) |
|  | Retell the story to {npc_1} (5 turns) | 5 | Send N messages in NPC chat (event: conversation_turn per message) |
| Capture the Beauty | Photograph locations | 3 | Camera mode (C), frame subject, click shutter (event: photo_taken) |
| Chapter 1: Assignment Abroad | Learn basic greetings to introduce yourself to the loca | 2 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Talk to townspeople to learn about the missing writer. | 3 | Have any conversation with NPC (event: npc_talked) |
|  | Collect signs and notices around town to start building | 2 | Find and collect a text document from world (event: text_found) |
| Chapter 2: Following the Trail | Explore key locations in town — the café, the bookshop, | 2 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Speak with townspeople who remember the writer. Listen  | 3 | Have any conversation with NPC (event: npc_talked) |
|  | Find a copy of the writer's first book at the local boo | 1 | Have any conversation with NPC (event: npc_talked) |
|  | Read signs and notices around town to build your vocabu | 2 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Complete grammar exercises to communicate more clearly. | 2 | Use correct grammar in conversation — AI evaluates (event: grammar_demonstrated) |
|  | Collect books and letters from around town to practice  | 2 | Find and collect a text document from world (event: text_found) |
| Chapter 3: The Inner Circle | Build rapport with the writer's editor to learn about u | 3 | Have any conversation with NPC (event: npc_talked) |
|  | Meet the wealthy patron who funded the writer's work. T | 2 | Have any conversation with NPC (event: npc_talked) |
|  | Talk to the writer's neighbor, who noticed strange visi | 2 | Have any conversation with NPC (event: npc_talked) |
|  | Collect letters and journal pages the writer left behin | 3 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Learn new words to understand the more complex conversa | 3 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Collect journals and letters that reveal the stories of | 3 | Find and collect a text document from world (event: text_found) |
| Chapter 4: Hidden Messages | Read the writer's books carefully and identify the hidd | 3 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Follow the clues to locations outside the main settleme | 3 | Have any conversation with NPC (event: npc_talked) |
|  | Talk to people in neighboring areas who may have seen t | 3 | Have any conversation with NPC (event: npc_talked) |
|  | Translate difficult passages from the writer's coded no | 3 | Use correct grammar in conversation — AI evaluates (event: grammar_demonstrated) |
|  | Collect texts from new settlements to broaden your unde | 3 | Find and collect a text document from world (event: text_found) |
| Chapter 5: The Truth Emerges | Engage with scholars who analyzed the writer's controve | 4 | Have any conversation with NPC (event: npc_talked) |
|  | Present your evidence to the patron and demand the trut | 2 | Have any conversation with NPC (event: npc_talked) |
|  | Demonstrate mastery of advanced grammar to navigate dif | 4 | Use correct grammar in conversation — AI evaluates (event: grammar_demonstrated) |
|  | Review and connect all collected documents and testimon | 3 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Collect advanced scholarly texts and research papers to | 4 | Find and collect a text document from world (event: text_found) |
| Chapter 6: The Final Chapter | Travel to the place where it all began and locate the m | 2 | Have any conversation with NPC (event: npc_talked) |
|  | Have the culminating conversation with the writer — ent | 3 | Have any conversation with NPC (event: npc_talked) |
|  | Write your story, summarizing everything you learned, i | 3 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Show your command of the language across all skill area | 3 | Any vocab activity: use words in chat, read signs, identify objects (event: vocabulary_usage) |
|  | Collect the remaining texts to complete your library an | 5 | Find and collect a text document from world (event: text_found) |
| Cultural Exchange | Talk to {npc_0} about local customs | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Talk to {npc_1} about local customs | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| Cultural Landmarks | Visit {location_0} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Visit {location_1} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Examine a cultural object at one of the locations | 1 | Click Examine on an interactive world object (event: object_examined) |
| Curious Minds | Use question words | 5 | Type a target-language word during NPC chat (event: vocabulary_usage) |
|  | Ask questions to 3 different NPCs | 3 | Click on an NPC to open chat panel (event: npc_talked) |
| Curious Observer | Examine 3 objects to learn their {targetLanguage} names | 3 | Click Examine on an interactive world object (event: object_examined) |
| Deep Conversation | Have a 6-turn conversation with {npc} | 6 | Send N messages in NPC chat (event: conversation_turn per message) |
| Dinner Party | Order food from {npc} in {targetLanguage} | 3 | Name food items at restaurant NPC (event: food_ordered) |
|  | Use 3 food-related {targetLanguage} words | 3 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Direction Master | Follow 3 steps of {targetLanguage} directions | 3 | Listen to directions, walk to destination (event: direction_step_completed) |
| Earn Their Trust | Gain reputation with {settlement} | 1 | Complete reputation-boosting actions (event: reputation_gain) |
| Echo Challenge | Listen to {npc} and repeat 6 phrases | 6 | Listen to TTS phrase, speak/type it back (event: pronunciation_attempt) |
| Explore the Neighborhood | Visit {location} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
| First Craft | Craft any item at a crafting station | 1 | Open crafting station, select recipe, click Craft (event: item_crafted) |
| First Creation | Craft an item at the workshop | 1 | Open crafting station, select recipe, click Craft (event: item_crafted) |
| First Impressions | Introduce yourself to {npc} in {targetLanguage} | 1 | Open chat with unmet NPC and introduce yourself (event: npc_talked) |
| First Words | Read signs around town | 5 | Click on a sign/notice in the world (event: sign_read) |
| Fluency Drill | Pronounce 8 {targetLanguage} phrases accurately | 8 | Speak phrase into mic, scored by recognition (event: pronunciation_attempt) |
| Follow the Instructions | Listen to crafting instructions | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Follow instructions to craft | 2 | Open crafting station, select recipe, click Craft (event: item_crafted) |
| Follow the Leader | Follow spoken directions to a destination | 1 | Listen to directions, walk to destination (event: direction_step_completed) |
|  | Reach the correct destination | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
| Follow the Signs | Follow {targetLanguage} directions to reach {destinatio | 1 | Follow target-language directions to waypoints (event: direction_step_completed) |
| Food for Thought | Learn 8 food-related words | 8 | Encounter a new word via chat, hover-translate, or sign reading |
|  | Identify 3 food items by name | 3 | Point-and-name: click object, say its target-language name (event: object_identified) |
| Free Roam | Find 3 landmarks independently | 3 | Enter a location for the first time (event: location_discovered) |
|  | Ask for directions in target language | 6 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Gather Supplies | Pick up an item from the world | 1 | Click on a world item to pick it up (event: item_collected) |
| Gathering Materials | Gather crafting materials | 4 | Click on a world item to pick it up (event: item_collected) |
| Go Shopping | Purchase items from shops | 3 | Click Purchase in merchant shop UI (event: item_purchased) |
| Grammar in Practice | Have a conversation with {npc} (3 turns minimum) | 3 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use 5 {targetLanguage} words correctly in context | 5 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Grand Tour | Visit {location_0} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Visit {location_1} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Visit {location_2} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
| Greetings | Greet NPCs appropriately | 5 | Click on an NPC to open chat panel (event: npc_talked) |
| Haggling | Successfully haggle with a merchant | 1 | Type bargaining words in merchant chat (event: price_haggled) |
|  | Use bargaining phrases | 4 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Hello, World! | Use a greeting word in conversation | 3 | Type a target-language word during NPC chat (event: vocabulary_usage) |
|  | Greet 2 different townspeople | 2 | Click on an NPC to open chat panel (event: npc_talked) |
| Introduce Yourself | Talk to {npc} | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| Know Your Tools | Examine workshop tools | 5 | Click Examine on an interactive world object (event: object_examined) |
|  | Name each tool in target language | 5 | Point at object and speak/type its name (event: object_pointed_and_named) |
| Language Explorer | Visit {location_0} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Visit {location_1} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Read 2 signs in {targetLanguage} | 2 | Click on a sign/notice in the world (event: sign_read) |
|  | Examine 2 objects | 2 | Click Examine on an interactive world object (event: object_examined) |
|  | Have a conversation with {npc} (4 turns) | 4 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use 5 {targetLanguage} words | 5 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Local Customs | Interview elders about customs | 3 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Use cultural vocabulary | 5 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Lost in Translation | Correctly translate 3 {targetLanguage} phrases | 3 | Type translation of a displayed phrase (event: translation_attempt) |
| Lunch Order | Order food from {npc} in {targetLanguage} | 1 | Name food items at restaurant NPC (event: food_ordered) |
| Making Friends | Have 3 conversations with {npc} to build a friendship | 3 | Repeated positive interactions with NPC (event: friendship_changed) |
| Manuscript Translation | Translate the passage | 1 | Type a written response in target language when prompted (event: writing_submitted) |
|  | Review translation with scholar | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| Master Trader | Buy trade goods | 3 | Click Purchase in merchant shop UI (event: item_purchased) |
|  | Sell for profit | 3 | Click Sell in merchant shop UI (event: item_sold) |
| Master Translator | Correctly translate 8 {targetLanguage} phrases | 8 | Type translation of a displayed phrase (event: translation_attempt) |
| Masterwork | Gather rare materials | 3 | Click on a world item to pick it up (event: item_collected) |
|  | Craft the masterwork | 1 | Open crafting station, select recipe, click Craft (event: item_crafted) |
|  | Present to guild master | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| Meet the Locals | Talk to {npc_0} | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Talk to {npc_1} | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Talk to {npc_2} | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| My Story | Tell your story to a townsperson | 1 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use words from previous quests | 8 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Name That Thing | Correctly identify 3 objects by their {targetLanguage}  | 3 | Point-and-name: click object, say its target-language name (event: object_identified) |
| Newcomer's Welcome | Visit {location} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Talk to {npc} | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Collect 2 vocabulary words | 2 | Encounter a new word via chat, hover-translate, or sign reading |
| Numbers of Commerce | Use number words in conversation | 5 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Order a Meal | Order food at a restaurant | 1 | Name food items at restaurant NPC (event: food_ordered) |
|  | Name 3 food items | 3 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Painting with Words | Describe 5 objects using adjectives | 5 | Point-and-name: click object, say its target-language name (event: object_identified) |
|  | Use descriptive words | 5 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Parrot Practice | Listen to {npc} and repeat 3 phrases | 3 | Listen to TTS phrase, speak/type it back (event: pronunciation_attempt) |
| Picture This | Describe 2 scenes in {targetLanguage} | 2 | Type a target-language scene description when prompted (event: writing_submitted) |
| Point and Say | Point at 5 objects and name them in {targetLanguage} | 5 | Point at object and speak/type its name (event: object_pointed_and_named) |
| Proofreading | Identify and fix errors | 5 | Type translation of a displayed phrase (event: translation_attempt) |
| Prove Your Mettle | Defeat 1 enemy | 1 | Defeat enemy in combat (event: enemy_defeat) |
| Reading Around Town | Read 3 signs or texts written in {targetLanguage} | 3 | Click on a sign/notice in the world (event: sign_read) |
| Safe Passage | Escort {npc} to {destination} | 1 | Walk with NPC to destination (event: arrival) |
| Say It Right | Pronounce 3 {targetLanguage} phrases with good accuracy | 3 | Speak phrase into mic, scored by recognition (event: pronunciation_attempt) |
| Scavenger Hunt: Basics | Identify 3 objects by their {targetLanguage} name | 3 | Point-and-name: click object, say its target-language name (event: object_identified) |
|  | Collect 2 new vocabulary words along the way | 2 | Encounter a new word via chat, hover-translate, or sign reading |
| Scavenger Hunt: Collector | Collect 3 items from the world | 3 | Click on a world item to pick it up (event: item_collected) |
|  | Examine 2 objects to learn their {targetLanguage} names | 2 | Click Examine on an interactive world object (event: object_examined) |
| Scavenger Hunt: Expert | Identify 6 objects by their {targetLanguage} name | 6 | Point-and-name: click object, say its target-language name (event: object_identified) |
|  | Point and name 4 additional objects | 4 | Point at object and speak/type its name (event: object_pointed_and_named) |
|  | Collect 5 vocabulary words | 5 | Encounter a new word via chat, hover-translate, or sign reading |
| Secret Recipe | Collect recipe ingredients | 4 | Click on a world item to pick it up (event: item_collected) |
|  | Request ingredients by name | 4 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Shop Inventory | Name shop items | 10 | Type a target-language word during NPC chat (event: vocabulary_usage) |
|  | Report inventory to shopkeeper | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| Special Delivery | Pick up the delivery package | 1 | Click on a world item to pick it up (event: item_collected) |
|  | Deliver the package to {npc} | 1 | Give a held item to a specific NPC (event: item_delivered) |
| Story Time | Listen to {npc}'s story and answer 2 questions correctl | 2 | Listen to audio and answer questions (event: listening_answer) |
| The Ambassador | Formal diplomatic exchanges | 3 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use formal register | 8 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| The Apprentice Artisan | Visit the Artisans Guild | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Meet the guild master | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| The Art of Meeting | Visit the Diplomats Guild | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Introduce yourself formally | 1 | Open chat with unmet NPC and introduce yourself (event: npc_talked) |
| The Author | Write an original story | 1 | Type a written response in target language when prompted (event: writing_submitted) |
|  | Present to the guild | 2 | Click on an NPC to open chat panel (event: npc_talked) |
| The Big Purchase | Complete a purchase conversation | 1 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use number and price vocabulary | 5 | Type a target-language word during NPC chat (event: vocabulary_usage) |
|  | Receive a purchased item | 1 | Click on a world item to pick it up (event: item_collected) |
| The Cartographer | Discover new locations | 3 | Enter a location for the first time (event: location_discovered) |
|  | Describe what you find | 1 | Type a target-language scene description when prompted (event: writing_submitted) |
| The Expedition | Navigate a complex route | 5 | Listen to directions, walk to destination (event: direction_step_completed) |
|  | Document your discoveries | 3 | Type a target-language scene description when prompted (event: writing_submitted) |
| The First Step | Visit the Explorers Guild | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Receive your explorer map | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| The Full Experience | Go to {location} | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Have a 3-turn conversation with {npc} | 3 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use 3 {targetLanguage} words in conversation | 3 | Type a target-language word during NPC chat (event: vocabulary_usage) |
|  | Identify 1 object by its {targetLanguage} name | 1 | Point-and-name: click object, say its target-language name (event: object_identified) |
| The Grand Market | Negotiate with 3 vendors | 3 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Set fair prices for goods | 2 | Type bargaining words in merchant chat (event: price_haggled) |
| The Great Debate | Debate with an opponent | 1 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use advanced vocabulary | 10 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| The Herbalist | Gather herbs | 1 | Use hotspot (fishing/mining/etc), complete progress bar (event: physical_action_completed) |
|  | Name each herb | 4 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| The Library Door | Visit the Storytellers Guild | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Meet the librarian | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| The Little Book | Read a short story | 1 | Click on text/book/letter in world to read it (event: text_read) |
|  | Answer questions about the story | 3 | Answer comprehension questions about a text (event: comprehension_answer) |
| The Mediator | Listen to both sides | 2 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Propose a resolution | 1 | Send N messages in NPC chat (event: conversation_turn per message) |
| The Summit | Negotiate with delegates | 5 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Reach consensus | 1 | Send N messages in NPC chat (event: conversation_turn per message) |
| The Teacher | Teach crafting to an apprentice | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Explain crafting vocabulary | 8 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| The Tour Guide | Guide tourists | 4 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Describe locations in detail | 4 | Type a target-language scene description when prompted (event: writing_submitted) |
| The Village Tale | Listen to the storyteller | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Retell the story in writing | 1 | Type a written response in target language when prompted (event: writing_submitted) |
| Tour Guide | Talk to the lost visitor | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Give directions using direction vocabulary | 1 | Follow target-language directions to waypoints (event: direction_step_completed) |
|  | Use direction words to guide them | 5 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Treasure Hunt | Follow written clues | 4 | Listen to directions, walk to destination (event: direction_step_completed) |
|  | Find the treasure | 1 | Click on a world item to pick it up (event: item_collected) |
| Uncharted Territory | Discover {location} | 1 | Enter a location for the first time (event: location_discovered) |
| Urgent Delivery | Deliver items to customers | 3 | Give a held item to a specific NPC (event: item_delivered) |
| Village Tour | Visit settlement landmarks | 4 | Walk into a named zone/settlement boundary (event: location_visited) |
| Vocabulary Immersion | Use 10 {targetLanguage} words in conversations | 10 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Welcome to the Market | Visit the Merchants Guild | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Introduce yourself to the guild master | 1 | Click on an NPC to open chat panel (event: npc_talked) |
| Which Way? | Ask {npc} for directions in {targetLanguage} | 2 | Ask NPC for directions in conversation (event: npc_talked + npc_speech_act) |
| Who Am I? | Introduce yourself to a townsperson | 1 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use introduction phrases | 3 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Window Shopping | Visit the market area | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Talk to 2 market vendors | 2 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Use food vocabulary with vendors | 4 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Word Collector | Collect 3 vocabulary words by approaching labeled objec | 3 | Encounter a new word via chat, hover-translate, or sign reading |
| Word Hoarder | Collect 8 vocabulary words from the world | 8 | Encounter a new word via chat, hover-translate, or sign reading |
| Word Puzzles | Complete vocabulary challenges | 8 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Words in Action | Use 3 {targetLanguage} words in conversation | 3 | Type a target-language word during NPC chat (event: vocabulary_usage) |
| Written Word | Write 2 responses in {targetLanguage} | 2 | Type a written response in target language when prompted (event: writing_submitted) |

## UNAVAILABLE (8)

| Quest | Objective | ×N | Exact Player Action |
|-------|-----------|---:|---------------------|
| Departure Assessment | Complete the departure language assessment | 1 | Complete each assessment phase modal (reading quiz, writing prompt, listening quiz, conversation with NPC) |
| Following the Trail | Talk to the writer's neighbor about their last days | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Talk to the writer's colleague at the library | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Talk to the writer's friend at the café | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Collect 3 witness testimonies | 3 | Read text with clue, talk to NPC about investigation, or photograph evidence (event: clue_discovered) |
| Tell Your Story | Tell {npc} a story about yourself (5 turns) | 5 | Send N messages in NPC chat (event: conversation_turn per message) |
| The Final Chapter | Present your findings to the town gathering | 1 | Send N messages in NPC chat (event: conversation_turn per message) |
|  | Use investigation vocabulary to explain the mystery | 8 | Type a target-language word during NPC chat (event: vocabulary_usage) |
|  | Deliver the writer's final message to the community | 1 | Send N messages in NPC chat (event: conversation_turn per message) |
| The Hidden Writings | Find the writer's book at the library | 1 | Click on a world item to pick it up (event: item_collected) |
|  | Find the writer's book at the school | 1 | Click on a world item to pick it up (event: item_collected) |
|  | Find the writer's book at the park bench | 1 | Click on a world item to pick it up (event: item_collected) |
|  | Read all three books for hidden clues | 3 | Click on text/book/letter in world to read it (event: text_read) |
| The Notice Board | Read the missing person notice on the town board | 1 | Click on text/book/letter in world to read it (event: text_read) |
|  | Talk to the town clerk about the missing writer | 1 | Click on an NPC to open chat panel (event: npc_talked) |
|  | Learn the writer's name | 1 | Read text with clue, talk to NPC about investigation, or photograph evidence (event: clue_discovered) |
| The Secret Location | Follow clues to the writer's secret spot | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Photograph the scene at the secret location | 1 | Camera mode (C), frame subject, click shutter (event: photo_taken) |
|  | Collect the writer's final manuscript | 1 | Click on a world item to pick it up (event: item_collected) |
|  | Read the final manuscript | 1 | Click on text/book/letter in world to read it (event: text_read) |
| The Writer's Home | Visit the writer's residence | 1 | Walk into a named zone/settlement boundary (event: location_visited) |
|  | Collect the writer's journal | 1 | Click on a world item to pick it up (event: item_collected) |
|  | Read the first journal entry for a clue | 1 | Click on text/book/letter in world to read it (event: text_read) |
