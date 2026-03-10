<a name="ensemble"></a>

## ensemble
**Kind**: global class  

* [ensemble](#ensemble)
    * [new ensemble()](#new_ensemble_new)
    * [.loadBaseBlueprints(bp)](#ensemble.loadBaseBlueprints) ⇒ <code>Object</code> ℗
    * [.loadFile(filename)](#ensemble.loadFile) ⇒ <code>Object</code>
    * [.registerSocialType(blueprint)](#ensemble.registerSocialType) ⇒ <code>Object</code> ℗
    * [.loadSocialStructure(data)](#ensemble.loadSocialStructure) ⇒ <code>Object</code>
    * [.loadBlueprint(categoryBlueprint, When)](#ensemble.loadBlueprint) ℗
    * [.updateCategory(categoryKey, blueprint)](#ensemble.updateCategory) ℗
    * [.getSocialStructure()](#ensemble.getSocialStructure) ⇒ <code>Object</code>
    * [.getSchema()](#ensemble.getSchema) ⇒ <code>Array</code>
    * [.getCategoryDescriptors(categoryName)](#ensemble.getCategoryDescriptors) ⇒ <code>Object</code>
    * [.isValidTypeForCategory(type, categoryName)](#ensemble.isValidTypeForCategory) ⇒ <code>Boolean</code>
    * [.addCharacters(data)](#ensemble.addCharacters) ⇒ <code>Array</code>
    * [.getCharacters()](#ensemble.getCharacters) ⇒ <code>Array</code>
    * [.getCharactersWithMetadata()](#ensemble.getCharactersWithMetadata) ⇒ <code>Object</code>
    * [.getCharData(char, key)](#ensemble.getCharData) ⇒ <code>Object</code>
    * [.getCharName(char)](#ensemble.getCharName) ⇒ <code>String</code>
    * [.addProcessedRules(ruleType, fileName, rues)](#ensemble.addProcessedRules) ⇒ <code>Array</code> ℗
    * [.addRules(data)](#ensemble.addRules) ⇒ <code>Array</code>
    * [.getRules(The)](#ensemble.getRules) ⇒ <code>Object</code>
    * [.filterRules(ruleSet, criteria)](#ensemble.filterRules) ⇒ <code>Array</code>
    * [.filterActions(criteria)](#ensemble.filterActions) ⇒ <code>Array</code>
    * [.setPredicates(predicateArray)](#ensemble.setPredicates)
    * [.getValue(first, second, category, type, mostRecentTime, lessRecentTime)](#ensemble.getValue) ⇒ <code>Number</code> \| <code>Boolean</code>
    * [.get(searchPredicate, mostRecentTime, leastRecentTime, useDefaultValue)](#ensemble.get) ⇒ <code>Array</code>
    * [.setCharacterOffstage(characterName)](#ensemble.setCharacterOffstage)
    * [.setCharacterOffstage(characterName)](#ensemble.setCharacterOffstage) ⇒ <code>Boolean</code>
    * [.setCharacterOffstage(characterName)](#ensemble.setCharacterOffstage)
    * [.getIsCharacterOnStage(characterName)](#ensemble.getIsCharacterOnStage) ⇒ <code>Boolean</code>
    * [.getIsCharacterOnStage(characterName)](#ensemble.getIsCharacterOnStage)
    * [.getIsCharacterEliminated(characterName)](#ensemble.getIsCharacterEliminated) ⇒ <code>Boolean</code>
    * [.doAction(actionName, initiator, responder, registeredVolitions)](#ensemble.doAction) ℗
    * [.reset()](#ensemble.reset)
    * [.init()](#ensemble.init) ⇒ <code>String</code>

<a name="new_ensemble_new"></a>

### new ensemble()
This class is the top level interface into ensemble. By including ensemble.js in your project, and adding the event listener:  <BR><BR>
 document.addEventListener('ensembleLoaded', function (e){} <BR><BR>
  you should be given access to an ensemble singleton object, which you can then use to call each of these methods. <BR><BR>
  Inside of this event listener you will want to call ensemble.init(), ensemble.loadFile() for your schema, trigger rules, volition rules, characters, history, and actions.

<a name="ensemble.loadBaseBlueprints"></a>

### ensemble.loadBaseBlueprints(bp) ⇒ <code>Object</code> ℗
Loads a stock set of blueprints useful for testing. (relationship, networks, etc.)

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - An object with an interface to the loaded factories.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| bp | <code>Object</code> | a blueprint object. |

<a name="ensemble.loadFile"></a>

### ensemble.loadFile(filename) ⇒ <code>Object</code>
Will load in a JSON file that represents one of the following aspects of your social world: Volition Rules, Trigger Rules, Characters, Schema, Actions, History. This function needs to be called once for each file. It returns a JSON object representing the parsed contents of the file referenced via the passed in filename.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - A JSON object representing the parsed contents of the filename.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | The relative path to the data file. |

**Example**  
```js
var rawSchema = ensemble.loadFile(data/schema.json) // Assuming that, relative to the file this function is being called from, there is a data directory with the file schema.json, the schema will be loaded into Ensemble, and rawSchema will have the contents of the json file.
```
<a name="ensemble.registerSocialType"></a>

### ensemble.registerSocialType(blueprint) ⇒ <code>Object</code> ℗
Register an individual type for use with ensemble.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - A copy of the blueprint.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| blueprint | <code>Object</code> | A blueprint specifying the parameters of this social type. |

<a name="ensemble.loadSocialStructure"></a>

### ensemble.loadSocialStructure(data) ⇒ <code>Object</code>
Take a JSON object specifying a Schema, and generates aset of factories with interfaces into that specification, allowing other aspects of ensemble(history, rules, actions, etc.) to reference them. This should be called before loading in anyother aspects of ensemble (history, rules, actions, etc.).

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - An object with parameters for each category name specified in the data file.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The JSON object to load, representing the social world's schema. |

**Example**  
```js
var rawSchema = ensemble.loadFile("data/schema.json");
 var schema = ensemble.loadSocialStructure(rawSchema);
```
<a name="ensemble.loadBlueprint"></a>

### ensemble.loadBlueprint(categoryBlueprint, When) ℗
Load a single schema blueprint. In most cases, youshould use loadSocialStructure to load a set at once and dosome checking on the set as a whole.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| categoryBlueprint | <code>Object</code> | The blueprint object to load |
| When | <code>Number</code> | loading multiple blueprints, can pass an ID number to be printed if necessary for diagnostics. |

<a name="ensemble.updateCategory"></a>

### ensemble.updateCategory(categoryKey, blueprint) ℗
Refresh the definition of a schema category. NOTE: This will not automatically check for conflicts with existing rules, social records, etc.: probably useful only in the context of a schema editor program that is taking care of that stuff.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| categoryKey | <code>String</code> | The social category to update. |
| blueprint | <code>Object</code> | A new specification for this category, in the same format as blueprints passed into loadSocialStructure. If this is undefined, the old category will simply be deleted. |

<a name="ensemble.getSocialStructure"></a>

### ensemble.getSocialStructure() ⇒ <code>Object</code>
Returns an object reference describing the social structure loaded into ensemble.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - A dictionary with top level keys will be each of the social "categories" (a la "relationship", "network", etc.). Each of these contains a dictionary of its subtypes.  
**Access**: public  
**Example**  
```js
ensemble.getSocialStructure();
```
<a name="ensemble.getSchema"></a>

### ensemble.getSchema() ⇒ <code>Array</code>
Returns an object describing the active social structure in the same format as the original file:

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Array</code> - An array of objects, one for each category, with a field "types" with all the type name for that category, etc. (see format for loadSocialStructure)  
**Access**: public  
<a name="ensemble.getCategoryDescriptors"></a>

### ensemble.getCategoryDescriptors(categoryName) ⇒ <code>Object</code>
Returns an object containing fields describing the properties of a given category registered with ensemble

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - A dictionary with keys for each piece of metadata about the social category: "directionType" will be directed, undirected, or reciprocal; "isBoolean" will be true or false (false = numeric).  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| categoryName | <code>String</code> | The social category to get information about. |

**Example**  
```js
var categoryDescriptors = ensemble.getCategoryDescriptors("traits");
```
<a name="ensemble.isValidTypeForCategory"></a>

### ensemble.isValidTypeForCategory(type, categoryName) ⇒ <code>Boolean</code>
Given a type and a category name, checks to see if the type is in fact specified by the scema as being a potential type for that category.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Boolean</code> - True if the type is in the category, false otherwise.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The Type to validate existing inside of the specified category. |
| categoryName | <code>String</code> | The social category to verify the type's membership of. |

**Example**  
```js
if(ensemble.isValidTypeForCategory("kindness", "trait"){
 //do stuff if kindness is a type of trait in your schema.
}
```
<a name="ensemble.addCharacters"></a>

### ensemble.addCharacters(data) ⇒ <code>Array</code>
Load from file the characters

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Array</code> - An array of strings with all character keys.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | A file defining the characters in this story. Should contain a single top-level key, "cast", which holds a dictionary of character identifiers, each containing an object with character metadata. If the object contains a key "name" with the printed name of the character, the getCharName function can be used to quickly return this. |

**Example**  
```js
var rawCast = ensemble.loadFile("data/cast.json"); 
var cast = ensemble.addCharacters(rawCast);
```
<a name="ensemble.getCharacters"></a>

### ensemble.getCharacters() ⇒ <code>Array</code>
Returns an array of character IDs for all registered characters.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Array</code> - An array of strings with all character keys (same as will be used in socialRecord entries, etc..  
**Access**: public  
**Example**  
```js
myCharacters = ensemble.getCharacters();
```
<a name="ensemble.getCharactersWithMetadata"></a>

### ensemble.getCharactersWithMetadata() ⇒ <code>Object</code>
Returns the full dictionary of all character info.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - A dictionary with the full record of all registered characters.  
**Access**: public  
**Example**  
```js
myCharacters = ensemble.getCharactersWithMetadata();
```
<a name="ensemble.getCharData"></a>

### ensemble.getCharData(char, key) ⇒ <code>Object</code>
Returns a specific piece of metadata for a registered character.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - The metadata value for the requested character and key, or undefined if no such key or character were found. The type of the return result is dependent on the type of the requested metadata field.  
**Access**: public  
**Exampe**: var bobNickname = ensemble.getCharData("bob", "name");  

| Param | Type | Description |
| --- | --- | --- |
| char | <code>String</code> | The ID of a registered character. |
| key | <code>String</code> | The metadata field requested. |

<a name="ensemble.getCharName"></a>

### ensemble.getCharName(char) ⇒ <code>String</code>
Shorthand function to return the printed name of a registered character. getCharName("sarah") is identical to getCharData("sarah", "name"). Returns the character key if no "name" field was found, or undefined if the requested character ID was not found.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>String</code> - The printed name of the requested character.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| char | <code>String</code> | The ID of a registered character. |

<a name="ensemble.addProcessedRules"></a>

### ensemble.addProcessedRules(ruleType, fileName, rues) ⇒ <code>Array</code> ℗
Takes a preprocessed rule object and metadata, validates it, and registers it. Note: addRules() should be called by outside modules, which does the preprocessing.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Array</code> - An array of strings, unique IDs for each rule added, in the form type_num (i.e. triggerRules_14).  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| ruleType | <code>String</code> | The key to identify this ruleset. If "trigger" or "volition", run extra validation code to verify these kinds of rules are constructed properly. |
| fileName | <code>String</code> | Identifying info about the source of these rules, useful if we need to print error messages. |
| rues | <code>Object</code> | An array of rule objects, each of which should specify a human-readable "name" key. |

<a name="ensemble.addRules"></a>

### ensemble.addRules(data) ⇒ <code>Array</code>
Takes raw rules data, parses out metadata and verifies the data is structured correctly, then calls the private function addProcessedRules to validate and register these rules into ensemble. This function should be the only one used to add rules. It should be called for each separate rule file that needs to be loaded in. You should expect to call this function at least twice: once for volition rules, and once for trigger rules.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Array</code> - An array of strings, unique IDs for each rule added, in the form type_num (i.e. triggerRules_14).  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Stringified JSON or Object which should define top level keys "fileName", "ruleType", and "rules". |

**Example**  
```js
var rawTriggerRules = ensemble.loadFile("data/triggerRules.json");
var triggerRules = ensemble.addRules(rawTriggerRules);
		
var rawVolitionRules = ensemble.loadFile("data/volitionRules.json");
var volitionRules = ensemble.addRules(rawVolitionRules);
```
<a name="ensemble.getRules"></a>

### ensemble.getRules(The) ⇒ <code>Object</code>
Given a string representation of a rule set (either "trigger" or "volition"), returnsall of the rules that are registered to that rule set. At present there is no functionalit for rules outside of these two rulesets. This function is intended for reviewing what rules have beenregistered to ensemble.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Object</code> - A collection of rules registered to the specified rule set.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| The | <code>String</code> | ruleset you wish to collect all of the rules from. "trigger" or "volition" are the only accepted answers. |

**Example**  
```js
var triggerRules = ensemble.getRules("trigger");
```
**Example**  
```js
var volitionRules = ensemble.getRules("volition");
```
<a name="ensemble.filterRules"></a>

### ensemble.filterRules(ruleSet, criteria) ⇒ <code>Array</code>
When given a ruleset and an object specifying search criteria, return only the rules from the ruleset that match. The object passed in is the same as a search object you'd use with ensemble.get() i.e., { category: "traits" }. All rules having any conditions or effects that match the request are returned.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Array</code> - An array of matching rules.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| ruleSet | <code>String</code> | The ruleset to search (probably "trigger" or "volition"). |
| criteria | <code>Object</code> | Currently supports a single key-value pair matching one aspect of a predicate. |

**Example**  
```js
var ruleSet = "volition";
var criterea = {"type":"kind"};
var filteredRules = ensemble.filterRules(ruleSet, criterea);
```
<a name="ensemble.filterActions"></a>

### ensemble.filterActions(criteria) ⇒ <code>Array</code>
When given an object specifying search criteria, return only the actions that match the given terms. The object passed in is the same as a search object you'd use with ensemble.get() e.g., { "category": "traits" }. All actions having any conditions, effects, or influenceRules that match the request are returned.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Array</code> - An array of matching actions.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| criteria | <code>Object</code> | Currently supports a single key-value pair matching one aspect of a predicate. |

**Example**  
```js
var criteria = {"type": "kind"}; 
var filteredActions = ensemble.filterActions(criteria)
```
<a name="ensemble.setPredicates"></a>

### ensemble.setPredicates(predicateArray)
A shortcut to set a full array of predicates (useful to be called with the effects array of a rule!)

**Kind**: static method of [<code>ensemble</code>](#ensemble)  

| Param | Type | Description |
| --- | --- | --- |
| predicateArray | <code>String</code> | an array of predicates to be added to the social record. |

**Example**  
```js
ensemble.setPredicates(myTriggerRule.effects);
```
<a name="ensemble.getValue"></a>

### ensemble.getValue(first, second, category, type, mostRecentTime, lessRecentTime) ⇒ <code>Number</code> \| <code>Boolean</code>
constructs a search predicate for you, then calls getSocialRecord

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Number</code> \| <code>Boolean</code> - the value of the specified type between the specified characters. Could either be a number of boolean, as the value might be referring to a boolean type or a numeric one.  

| Param | Type | Description |
| --- | --- | --- |
| first | <code>String</code> | the name of the character to occupy the "first" role in our search predicate. |
| second | <code>String</code> | the name of the character to occupy the "second" role in our search predicate. |
| category | <code>String</code> | the category from our social schema that the social record of interest is from. |
| type | <code>String</code> | the specific type of the specified category that we are interested in learning the value of. |
| mostRecentTime | <code>Int</code> | establishes the upper bound of the window into the history to look. 0 (or undefined) means the current timestep. |
| lessRecentTime | <code>Int</code> | establishes the lower bound of the window into the history to look. undefined will simply only look at the current timestep. |

**Example**  
```js
var predicateValue = ensemble.getValue("bob", "carol", "relationship", "dating", 0, 0); 
```
<a name="ensemble.get"></a>

### ensemble.get(searchPredicate, mostRecentTime, leastRecentTime, useDefaultValue) ⇒ <code>Array</code>
Search the socialRecord for a desired searchPredicate within a provided time period. 
If mostRecentTime and leastRecentTime exist but are formatted improperly 
(i.e., mostRecentTime is a higher number than lessRecentTime), 
then the function will automatically swap the vaues between the two. If msotRecentTime and lessRecentTime
are not provided, the system will only look at the current timestep.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Array</code> - matchedResults	the array holding the found predicates which match the query  

| Param | Type | Description |
| --- | --- | --- |
| searchPredicate | <code>Object</code> | a predicate we want to search the socialRecord for |
| mostRecentTime | <code>Number</code> | the lower bound time that we want to look within (turns ago: 2 = currentTimeStep-2) |
| leastRecentTime | <code>Number</code> | the upper bound time that we want to look within (turns ago: 2 = currentTimeStep-2) |
| useDefaultValue | <code>Bool</code> | If true, then if the searchPredicate is not explicitly found in the socialRecord it will check the searchPredicate against the predicate's default value. If false, it will not. Defaults to true. |

**Example**  
```js
var searchPredicate =  {"category" : "trait", "type":"kind", "first":"x", "value":"true"};
var matchedRecords = ensemble.getSocialRecord(searchPredicate, 2, 5);
```
<a name="ensemble.setCharacterOffstage"></a>

### ensemble.setCharacterOffstage(characterName)
public facing function to put a character offstage. A character being offstage means that they will not have volition rules computed for them, nor are they eligible to take actions (or be acted upon).

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Access**: public  

| Param | Description |
| --- | --- |
| characterName | the name of the character to put off stage. |

**Example**  
```js
ensemble.setCharacterOffstage("bob");
```
<a name="ensemble.setCharacterOffstage"></a>

### ensemble.setCharacterOffstage(characterName) ⇒ <code>Boolean</code>
public facing function to see if a character is offstage or not.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Boolean</code> - true if the character is offstage, false otherwise.  
**Access**: public  

| Param | Description |
| --- | --- |
| characterName | the name of the character to verify their presence on the stage. |

**Example**  
```js
var isBobOffstage = ensemble.getIsCharacterOffstage("bob");
```
<a name="ensemble.setCharacterOffstage"></a>

### ensemble.setCharacterOffstage(characterName)
public facing function to place a character onstage.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Access**: public  

| Param | Description |
| --- | --- |
| characterName | the name of the character to place on stage. 	 Characters are considered "on stage" by default; this function should  	only need to be called if a character had been manually placed off stage, 	but now needs return to it. |

**Example**  
```js
ensemble.setCharacterOnstage("bob");
```
<a name="ensemble.getIsCharacterOnStage"></a>

### ensemble.getIsCharacterOnStage(characterName) ⇒ <code>Boolean</code>
public facing function to check if a character is on stage.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Boolean</code> - true if the character is on stage, false otherwise.  
**Access**: public  

| Param | Description |
| --- | --- |
| characterName | the name of the character to verify if they are on stage. |

**Example**  
```js
var isBobOnstage = ensemble.getIsCharacterOnstage("bob");
```
<a name="ensemble.getIsCharacterOnStage"></a>

### ensemble.getIsCharacterOnStage(characterName)
public facing fuction to make a character eliminated. Eliminated characters are completely ignored by the system.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Access**: public  

| Param | Description |
| --- | --- |
| characterName | the name of the character to verify if they are on stage. |

**Example**  
```js
ensemble.setCharacterEliminated("bob"); // Bob is now eliminated.
```
<a name="ensemble.getIsCharacterEliminated"></a>

### ensemble.getIsCharacterEliminated(characterName) ⇒ <code>Boolean</code>
public facing function to see if a character has been eliminated or not.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>Boolean</code> - true if the character is eliminated, false otherwise.  
**Access**: public  

| Param | Description |
| --- | --- |
| characterName | the name of the character to verify if they are eliminated. |

**Example**  
```js
var isBobEliminated = ensemble.getIsCharacterEliminated("bob");
```
<a name="ensemble.doAction"></a>

### ensemble.doAction(actionName, initiator, responder, registeredVolitions) ℗
In theory this is a means to just run an action... though it seems as if the corresponding function in ActionLibrary.js hasn't actually been written? Very odd...

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| actionName | <code>String</code> | the name of the action to perform. |
| initiator | <code>String</code> | the name of the character to perform the action. |
| responder | <code>String</code> | The name of the character who will be the recipient of the action. |
| registeredVolitions | <code>Object</code> | A calculated volitions object (created after calling ensemble.calculateVolitions) |

**Example**  
```js
ensemble.doAction("AskOut", "Bob", "Carol", volitionObject)
```
<a name="ensemble.reset"></a>

### ensemble.reset()
Clear out the history and the rules currently loaded into Ensemble. 
 CAUTION: once you call this, you will have to reload in more rules/history, 
	or else calculating volition or running trigger rules will do nothing!

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Access**: public  
**Example**  
```js
ensemble.reset();
```
<a name="ensemble.init"></a>

### ensemble.init() ⇒ <code>String</code>
initializes ensemble to be ready for use. This should be the first thing called before any other usage of ensemble.

**Kind**: static method of [<code>ensemble</code>](#ensemble)  
**Returns**: <code>String</code> - Returns a success message upon initialization.  
**Access**: public  
**Example**  
```js
var loadResult = ensemble.init(); // loadResult should be "Ok";
```
