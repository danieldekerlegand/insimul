## Classes

<dl>
<dt><a href="#RuleLibrary">RuleLibrary</a> ℗</dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#sortConditions">sortConditions(conditions)</a> ⇒ <code>array</code> ℗</dt>
<dd><p>Given an array of predicates (ideally one from the condition of a rule) sorts them based on the value of their &#39;order&#39; field. Not every predicate will have order specified; The returned array will have undefined order predicates first, followed by predicates with order in ascending order.</p>
</dd>
<dt><a href="#isEffectValid">isEffectValid(effect, charactersToIgnore)</a> ⇒ <code>Bool</code></dt>
<dd><p>When running trigger rules or calculating volitions, there is a chance that
it might involve characters that are offstage, eliminated, or that should otherwise be ignored.
This function does one final check to make sure that the effect in question doesn&#39;t include
any such characters.</p>
</dd>
<dt><a href="#RuleLibrary

This function takes in a key for a rule set (e.g. volitionRules or triggerRules) and a rule,
and checks to see if that rule already exists inside of the specified rule set. If it does
it will return a clone of the found rule. If it does not, it will return false.

ASSUMES THAT rules, when parsed in, have their predicates sorted in some way for consistency!!!!
TODO_ Make it so that rules get their predicates sorted when parsed in OR make this function not care about ordering.isRuleAlreadyInRuleSet">isRuleAlreadyInRuleSet(key, rule)</a> ⇒</dt>
<dd></dd>
</dl>

<a name="RuleLibrary"></a>

## RuleLibrary ℗
**Kind**: global class  
**Access**: private  

* [RuleLibrary](#RuleLibrary) ℗
    * [new RuleLibrary()](#new_RuleLibrary_new)
    * [.runRules(ruleSet, cast, onMatchFunction)](#RuleLibrary.runRules)
    * [.getUniqueBindings(ruleConditions)](#RuleLibrary.getUniqueBindings) ⇒ <code>Array</code>
    * [.matchUniqueBindings(uniqueBindings, availableCastMembers, processResult, rule)](#RuleLibrary.matchUniqueBindings)
    * [.evaluateConditions(conditions)](#RuleLibrary.evaluateConditions) ⇒ <code>Boolean</code>
    * [.doBinding(characters, predicates)](#RuleLibrary.doBinding) ⇒ <code>Array</code>
    * [.doPartialBinding(character, predicates)](#RuleLibrary.doPartialBinding) ⇒ <code>Array</code>
    * [.addRuleSet(key, set)](#RuleLibrary.addRuleSet)
    * [.addRule(key, rule)](#RuleLibrary.addRule)
    * [.arePredicatesEqual(pred1, pred2)](#RuleLibrary.arePredicatesEqual) ⇒
    * [.getTriggerRules()](#RuleLibrary.getTriggerRules) ⇒ <code>array</code>
    * [.getVolitionRules()](#RuleLibrary.getVolitionRules) ⇒ <code>array</code>
    * [.getRuleById(label)](#RuleLibrary.getRuleById) ⇒ <code>Object</code> ℗
    * [.setRuleById(label, rule)](#RuleLibrary.setRuleById) ⇒ <code>Boolean</code> ℗
    * [.deleteRuleById(label)](#RuleLibrary.deleteRuleById) ⇒ <code>Object</code> ℗

<a name="new_RuleLibrary_new"></a>

### new RuleLibrary()
This is the class RuleLibrary
Public methods are:

calculateVolition
runTriggerRules

<a name="RuleLibrary.runRules"></a>

### RuleLibrary.runRules(ruleSet, cast, onMatchFunction)
Runs a rule set over a cast of characters.
First it temporarily stores a specific ruleSet from the ruleLibrary into an array called rules.
For each rule in this array, the characters that apply to each rule are bound to that rule.

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  

| Param | Type | Description |
| --- | --- | --- |
| ruleSet | <code>String</code> | an array of rules to check for in the socialRecord |
| cast | <code>Array</code> | an array of characters we are interested in seeing if the provided rules apply to |
| onMatchFunction |  | the function that we will apply if the rule(s) are found to be true |

<a name="RuleLibrary.getUniqueBindings"></a>

### RuleLibrary.getUniqueBindings(ruleConditions) ⇒ <code>Array</code>
Finds the place-holders for the unique characters who appropriately apply to a given rule

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>Array</code> - dictionary		each of the conditions will be stored in this dictionary, with keys  

| Param | Type | Description |
| --- | --- | --- |
| ruleConditions | <code>Array</code> | the conditions which need to have specific characters filled into roles first and (optionally) second. |

<a name="RuleLibrary.matchUniqueBindings"></a>

### RuleLibrary.matchUniqueBindings(uniqueBindings, availableCastMembers, processResult, rule)
A recursive method which fills the roles for unique bindings previously found with actual characters

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  

| Param | Type | Description |
| --- | --- | --- |
| uniqueBindings | <code>Object</code> | the dictionary of place-holders for unique characters to fill |
| availableCastMembers | <code>Array</code> | array of cast members who can potentially fill a unique role |
| processResult | <code>function</code> | the function which will process the result of the unique binding |
| rule | <code>Array</code> | the particular rule that needs to be applied |

<a name="RuleLibrary.evaluateConditions"></a>

### RuleLibrary.evaluateConditions(conditions) ⇒ <code>Boolean</code>
evaluateConditions takes an array of bound conditions (that is, the first and second
role slots are "filled in" (i.e. first: "simon" as opposed to first: "x"), and for each one
of them checks, to see if they hold true. Returns true if all conditions are true. False otherwise.

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>Boolean</code> - conditionsAreTrue Returns true if all of the predicates in the conditions array is true. Returns False otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| conditions | <code>Array</code> | An array of predicates representing the condition of a rule. |

<a name="RuleLibrary.doBinding"></a>

### RuleLibrary.doBinding(characters, predicates) ⇒ <code>Array</code>
A (smallish) array of characters to fill each needed role in a (condition) predicate is passed in,
and an array with these characters filling rolls is returned.

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>Array</code> - resultsArray an array of the conditions that have characters bound to their roles  

| Param | Type | Description |
| --- | --- | --- |
| characters | <code>Object</code> | a dictionary of characters to bind to predicates |
| predicates | <code>Object</code> | a clone of the array of predicates that needs characters assigned to each of its roles |

<a name="RuleLibrary.doPartialBinding"></a>

### RuleLibrary.doPartialBinding(character, predicates) ⇒ <code>Array</code>
Similar to doBinding, doPartialBinding ONLY concerns itself with a single character, and ignores
all occurences of "second"

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>Array</code> - resultsArray an array of the conditions that have characters bound to their roles. Only contains predicates that pertain to this character.  

| Param | Type | Description |
| --- | --- | --- |
| character | <code>Object</code> | a dictionary of a single character to bind to predicates |
| predicates | <code>Object</code> | a clone of the array of predicates that needs characters assigned to each of its roles |

<a name="RuleLibrary.addRuleSet"></a>

### RuleLibrary.addRuleSet(key, set)
Stores a set of rules in the appropriate spot in the rules library. NOTE That this should only be used internally, not by unit tests or the public, since it skips data validation steps.
Additive

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The identifier for this set of rules. |
| set | <code>Array</code> | The array containing the rule object definitions. |

<a name="RuleLibrary.addRule"></a>

### RuleLibrary.addRule(key, rule)
**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Descriptionstores**: a new rule in the appropriate key in last spot in the rules library.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | The identifier for this set of rules. |
| rule | <code>Object</code> | The object containing the rule definition to add. |

<a name="RuleLibrary.arePredicatesEqual"></a>

### RuleLibrary.arePredicatesEqual(pred1, pred2) ⇒
Given two predicates, check to see if they are equal to each other. It is difficult to tell if predicates
are equal to each other, because depending on the context, different predicates will have different fields
specified. For example, the "weight" field will only ever be in an effect predicate. Moreover, it will only
ever be in an effect predicate in a VOLITION rule; a trigger rule won't have a weight.' This function essentially
goes through each one of these fields, and checks to see if they are the same for both of the predicates. If they
are, then return true. If not, return false.

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: true if pred1 and pred2 are equal. False otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| pred1 | <code>Object</code> | One of the two predicates we are testing for equality. |
| pred2 | <code>Object</code> | The second of the two predicates we are testing for equality. |

<a name="RuleLibrary.getTriggerRules"></a>

### RuleLibrary.getTriggerRules() ⇒ <code>array</code>
returns an array containing all of the rules currently residing in the ruleLibrary triggerRules array.
TODO: Write Unit Tests for this

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>array</code> - an array of rules representing the ruleLibrary's current collection of triggerRules  
<a name="RuleLibrary.getVolitionRules"></a>

### RuleLibrary.getVolitionRules() ⇒ <code>array</code>
Returns an array containing all of the rules currently residing in the ruleLibrary volitionRules array.
TODO: Write Unit Tests for this

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>array</code> - an array of rules representing the ruleLibrary's current collection of volitionRules  
<a name="RuleLibrary.getRuleById"></a>

### RuleLibrary.getRuleById(label) ⇒ <code>Object</code> ℗
When given an ID in the format "ruleSetName_number", returns the rule with the corresponding ID. Rules are automatically be given a unique ID in this format when added via normal channels. Return false if no such rule can be found.

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>Object</code> - a copy of the requested rule, or false if no such rule could be found.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| label | <code>String</code> | The ID, such as "triggerRules_14" |

<a name="RuleLibrary.setRuleById"></a>

### RuleLibrary.setRuleById(label, rule) ⇒ <code>Boolean</code> ℗
When given an ID in the format "ruleSetName_number", and a rule object, updates the rule with this ID in ensemble's internal store of loaded rules. NOTE: This is not a public-facing function, since it does no validation on the rule to be added. Instead use ensemble.setRuleById.

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>Boolean</code> - true if the rule was successfully updated, false otherwise.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| label | <code>String</code> | The ID, such as "triggerRules_14" |
| rule | <code>Object</code> | An object representing a valid rule for the given rule set. |

<a name="RuleLibrary.deleteRuleById"></a>

### RuleLibrary.deleteRuleById(label) ⇒ <code>Object</code> ℗
When given an ID in the format "ruleSetName_number", deletes the rule with the corresponding ID. Rules are automatically be given a unique ID in this format when added via normal channels. Return false if no such rule can be found.

**Kind**: static method of [<code>RuleLibrary</code>](#RuleLibrary)  
**Returns**: <code>Object</code> - true if the operation is successful, false otherwise.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| label | <code>String</code> | The ID, such as "triggerRules_14" |

<a name="sortConditions"></a>

## sortConditions(conditions) ⇒ <code>array</code> ℗
Given an array of predicates (ideally one from the condition of a rule) sorts them based on the value of their 'order' field. Not every predicate will have order specified; The returned array will have undefined order predicates first, followed by predicates with order in ascending order.

**Kind**: global function  
**Returns**: <code>array</code> - [The conditions sorted on the key "order" in ascending order (undefined orders will appear first in the array.)]  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| conditions | <code>array</code> | [An array filled with the condition predicates from a rule] |

<a name="isEffectValid"></a>

## isEffectValid(effect, charactersToIgnore) ⇒ <code>Bool</code>
When running trigger rules or calculating volitions, there is a chance that
it might involve characters that are offstage, eliminated, or that should otherwise be ignored.
This function does one final check to make sure that the effect in question doesn't include
any such characters.

**Kind**: global function  
**Returns**: <code>Bool</code> - [Returns true if the effect is 'safe' to be set or used for volition. False otherwise.]  

| Param | Type | Description |
| --- | --- | --- |
| effect | <code>Object</code> | [The effect. By this point, it should be bound with character names] |
| charactersToIgnore | <code>Array</code> | [A list of characters that have been deemed to be ignored.] |

