## Classes

<dl>
<dt><a href="#ActionLibrary">ActionLibrary</a> ℗</dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#getAllActions">getAllActions()</a> ⇒ <code>Array</code> ℗</dt>
<dd><p>returns an array containing every action (terminal or otherwise) available in the social world.</p>
</dd>
<dt><a href="#getStartSymbols">getStartSymbols()</a> ⇒ <code>Array</code> ℗</dt>
<dd><p>Returns an array containing every &#39;start action.&#39; Conceived to return all actions specifically tied to an intent.</p>
</dd>
<dt><a href="#getNonTerminals">getNonTerminals()</a> ⇒ <code>array</code> ℗</dt>
<dd><p>Returns an array containing every &#39;non terminal&#39; This will include both root and non-root actions, but exclude terminal actions.</p>
</dd>
<dt><a href="#getTerminalActions">getTerminalActions()</a> ⇒ <code>array</code></dt>
<dd><p>Returns an array containing every terminal action.</p>
</dd>
<dt><a href="#clearActionLibrary">clearActionLibrary()</a></dt>
<dd><p>Completely empties out the the action library by zero-ing out the arrays of actions, startSymbols, nonTerminals, and terminalActions. Used mainly for testing purposes.</p>
</dd>
<dt><a href="#actionAlreadyExists">actionAlreadyExists(potentialNewAction)</a> ⇒ <code>Boolean</code> ℗</dt>
<dd><p>a simple helper function to see if a newly parsed in action hasn&#39;t already been defined -- this is done by looking at the name of the action. This means that even if two actions are quite different, if they share the same name an error will be printed to the console.]</p>
</dd>
<dt><a href="#categorizeActionGrammar">categorizeActionGrammar(actionPool)</a></dt>
<dd><p>This method takes in an unsorted list of actions (in the style returned from the parseActions method) and, based on the properties of these actions, determines if they are &#39;start&#39;, &#39;terminal&#39; or &#39;non-terminal&#39; actions and stores them in teh appropriate array of actionLibrary</p>
</dd>
<dt><a href="#getSortedActionsFromVolition">getSortedActionsFromVolition(initiator, responder, registeredVolition, isAccepted, weight, numActionsPerGroup, cast)</a> ⇒ <code>Array</code></dt>
<dd><p>Finds the actions that the initiator wants to take towards the responder, and sorts them by volition score.</p>
</dd>
<dt><a href="#sortActionsByVolitionScore">sortActionsByVolitionScore(actions)</a> ⇒ <code>Array</code> ℗</dt>
<dd><p>Sorts an array of actions based on their weights in descending order.. Specifically, each action has a list of actions that it &#39;leads to&#39; -- and it is THIS list of actions that is being sorted. Uses recursion to get to the end of the chain. Also sorts the GoodBindings of each weight as well.</p>
</dd>
<dt><a href="#getActionHierarchyFromVolition">getActionHierarchyFromVolition(initiator, responder, registeredVolition, numActionsPerGroup, cast)</a> ⇒ <code>Array</code></dt>
<dd><p>This method takes the names of the initiator and responder of an action and a registered volition 
between them, and will go through the entire grammar for the intnet specified in the volition and return all 
terminal actions that are appropriate (are of the correct accept/reject polarity, have all conditions met, etc.)
The number of actions returned per action group is determined by numActionsPerGroup. 
Cast indicates the characters to use for role binding.</p>
</dd>
<dt><a href="#getActionHierarchyFromNonTerminal">getActionHierarchyFromNonTerminal(nonTerminal)</a> ⇒ <code>Array</code></dt>
<dd><p>Returns an array that represents an &#39;action hierarchy&#39; i.e. each element in the array will either be a terminal, or will be a non-terminal with fully fleshed out &quot;leads to&quot; information that will ultimately lead to a terminal (with potentally many non terminals &#39;in the way&#39; with their own leads to information.)</p>
</dd>
<dt><a href="#computeActionsSalience">computeActionsSalience(terminalAction)</a> ⇒ <code>Number</code></dt>
<dd><p>Takes an action as a parameter. If it&#39;s salience score is undefined, computes a new salience score based on it&#39;s conditions.</p>
</dd>
<dt><a href="#computeInfluenceRuleWeight">computeInfluenceRuleWeight(action)</a> ℗</dt>
<dd><p>Takes in an action, goes through all of its valid bindings, and evaluates the influence rule for each set of bindings. Stores the weight with each binding and, for the best weight (i.e. the best binding) stores it at the level of the action.</p>
</dd>
<dt><a href="#actionIsAppropriate">actionIsAppropriate(action, isAccepted, uniqueBindings)</a> ⇒ <code>Boolean</code></dt>
<dd><p>actionIsAppropriate checks various qualities that would make an action &quot;not appropriate&quot;, such as an action being marked as an &quot;accept&quot; action when we are looking for a reject action.</p>
</dd>
<dt><a href="#getActionFromNameInArray">getActionFromNameInArray(actionName)</a> ⇒ <code>object</code> ℗</dt>
<dd><p>Given the name of an action, searches through a provided array to find the corresponding action object and returns it.</p>
</dd>
<dt><a href="#getActionFromName">getActionFromName(actionName)</a> ⇒ <code>object</code> ℗</dt>
<dd><p>Given the name of an action, searches through the action array to find the corresponding action object and returns it.</p>
</dd>
<dt><a href="#getUniqueActionBindings">getUniqueActionBindings(actionObject, uniqueBindings)</a> ⇒ <code>Object</code></dt>
<dd><p>Given an action (actionObject) and an object representing all of the unique roles we&#39;ve encountered thus far (uniqueBindings), go through the roles specified in the action and, if not already present in the uniqueBindings object, add them to it!</p>
</dd>
<dt><a href="#getWorkingBindingCombinations">getWorkingBindingCombinations(action, uniqueBindings, availableCastMembers, combinationsToUse)</a> ⇒ <code>Array</code></dt>
<dd><p>This method figures out potential combinations of characters that will satisfy all of the conditions
that have been specified by this point in the action tree. Actions passed into the function through the &#39;action&#39; parameter
are assumed to have a field called &quot;goodBindings&quot; that represent working combinations of characters to roles found through 
previous calls to this function. These good bindings will be updated in this function as new roles are discovered (e.g a new role 
that appeared later on down the action tree). Additionally, as new conditions are found, old combinations of bindings that
used to work may no longer work; this function will accomadate that as well. This method uses recursion.</p>
</dd>
<dt><a href="#bindActionCondition">bindActionCondition(conditions, bindingToUse)</a> ⇒ <code>Array</code></dt>
<dd><p>Takes in an array of conditions and a specific binding to use, and replaces all &#39;generic roles&#39; in the conditions (e.g., &quot;x&quot;, &quot;y&quot;, &quot;cheater&quot;, etc.) with actual character names.</p>
</dd>
<dt><a href="#evaluateActionInfluenceRules">evaluateActionInfluenceRules(action, bindingToUse)</a> ⇒ <code>Number</code></dt>
<dd><p>Given a binding, goes through all of the influence rules of an action and keeps a rnning sum of their effects, then returns that sum.</p>
</dd>
<dt><a href="#getBestTerminalFromActionList">getBestTerminalFromActionList(actionList)</a> ⇒ <code>Object</code></dt>
<dd><p>Returns the &#39;best&#39; terminal from an actionList, where best is defined to be the terminal with the highest weight. This function assumes the actionList has already been sorted.</p>
</dd>
<dt><a href="#getBestBindingFromTerminal">getBestBindingFromTerminal(terminal)</a> ⇒ <code>Object</code></dt>
<dd><p>Given a terminal action, looks at it&#39;s list of good bindings and finds the one that matches the score of the action itself. If multiple ones do, picks one at random.</p>
</dd>
</dl>

<a name="ActionLibrary"></a>

## ActionLibrary ℗
**Kind**: global class  
**Access**: private  
<a name="new_ActionLibrary_new"></a>

### new ActionLibrary()
This is the class actionLibrary

<a name="getAllActions"></a>

## getAllActions() ⇒ <code>Array</code> ℗
returns an array containing every action (terminal or otherwise) available in the social world.

**Kind**: global function  
**Returns**: <code>Array</code> - [An array containing every single action defined in the social world.]  
**Access**: private  
<a name="getStartSymbols"></a>

## getStartSymbols() ⇒ <code>Array</code> ℗
Returns an array containing every 'start action.' Conceived to return all actions specifically tied to an intent.

**Kind**: global function  
**Returns**: <code>Array</code> - [An array containing every 'root' acton (every action tied to an intent) in the social world]  
**Access**: private  
<a name="getNonTerminals"></a>

## getNonTerminals() ⇒ <code>array</code> ℗
Returns an array containing every 'non terminal' This will include both root and non-root actions, but exclude terminal actions.

**Kind**: global function  
**Returns**: <code>array</code> - [An array containing every 'non terminal' action.]  
**Access**: private  
<a name="getTerminalActions"></a>

## getTerminalActions() ⇒ <code>array</code>
Returns an array containing every terminal action.

**Kind**: global function  
**Returns**: <code>array</code> - [An array containing every terminal action]  
<a name="clearActionLibrary"></a>

## clearActionLibrary()
Completely empties out the the action library by zero-ing out the arrays of actions, startSymbols, nonTerminals, and terminalActions. Used mainly for testing purposes.

**Kind**: global function  
**Methodclearactionlibrary**:   
<a name="actionAlreadyExists"></a>

## actionAlreadyExists(potentialNewAction) ⇒ <code>Boolean</code> ℗
a simple helper function to see if a newly parsed in action hasn't already been defined -- this is done by looking at the name of the action. This means that even if two actions are quite different, if they share the same name an error will be printed to the console.]

**Kind**: global function  
**Returns**: <code>Boolean</code> - [Returns true if the action already exists. False otherwise.]  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| potentialNewAction | <code>Object</code> | [The action that has just been read in, and is to be checked against the actions already in the action library.] |

<a name="categorizeActionGrammar"></a>

## categorizeActionGrammar(actionPool)
This method takes in an unsorted list of actions (in the style returned from the parseActions method) and, based on the properties of these actions, determines if they are 'start', 'terminal' or 'non-terminal' actions and stores them in teh appropriate array of actionLibrary

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| actionPool | <code>array</code> | [Contains an unsorted list of all of the action termainals and non terminals] |

<a name="getSortedActionsFromVolition"></a>

## getSortedActionsFromVolition(initiator, responder, registeredVolition, isAccepted, weight, numActionsPerGroup, cast) ⇒ <code>Array</code>
Finds the actions that the initiator wants to take towards the responder, and sorts them by volition score.

**Kind**: global function  
**Returns**: <code>Array</code> - [An array of actions the initiator wants to take towards the responder, sorted by weight.]  

| Param | Type | Description |
| --- | --- | --- |
| initiator | <code>String</code> | [The name of the initiator of the action] |
| responder | <code>String</code> | [The name of the responder of the action] |
| registeredVolition | <code>Object</code> | [A registered volition object] |
| isAccepted | <code>Boolean</code> | [Whether or not the responder accepts the intent of the volition.] |
| weight | <code>Number</code> | [How much the initiator wants to pursue this volition.] |
| numActionsPerGroup | <code>Number</code> | [Used to determine how many 'actions per group' to include. Will ultimately default to one if unspecified.] |
| cast | <code>Array</code> | [The characters to use in consideration for the binding of various roles the actions might need.] |

<a name="sortActionsByVolitionScore"></a>

## sortActionsByVolitionScore(actions) ⇒ <code>Array</code> ℗
Sorts an array of actions based on their weights in descending order.. Specifically, each action has a list of actions that it 'leads to' -- and it is THIS list of actions that is being sorted. Uses recursion to get to the end of the chain. Also sorts the GoodBindings of each weight as well.

**Kind**: global function  
**Returns**: <code>Array</code> - [The sorted actions]  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| actions | <code>Array</code> | [An array of actions to be sorted] |

<a name="getActionHierarchyFromVolition"></a>

## getActionHierarchyFromVolition(initiator, responder, registeredVolition, numActionsPerGroup, cast) ⇒ <code>Array</code>
This method takes the names of the initiator and responder of an action and a registered volition 
between them, and will go through the entire grammar for the intnet specified in the volition and return all 
terminal actions that are appropriate (are of the correct accept/reject polarity, have all conditions met, etc.)
The number of actions returned per action group is determined by numActionsPerGroup. 
Cast indicates the characters to use for role binding.

**Kind**: global function  
**Returns**: <code>Array</code> - [An Array of potential actions that can be carried out from the initiator to the responder]  

| Param | Type | Description |
| --- | --- | --- |
| initiator | <code>String</code> | [The name of the initiator of the action.] |
| responder | <code>String</code> | [The name of the responder of the action.] |
| registeredVolition | <code>Object</code> | [The registered volition between the initiator and responder] |
| numActionsPerGroup | <code>Number</code> | [The number of terminal actions to return per 'action group.' They will ultimately be sorted by salience; i.e. if this number is 1, then only the most salient terminal action per action group will be returned. If 2, the top two salient terminal actions, etc.] |
| cast | <code>Array</code> | [The characters to be used in the role binding process] |

<a name="getActionHierarchyFromNonTerminal"></a>

## getActionHierarchyFromNonTerminal(nonTerminal) ⇒ <code>Array</code>
Returns an array that represents an 'action hierarchy' i.e. each element in the array will either be a terminal, or will be a non-terminal with fully fleshed out "leads to" information that will ultimately lead to a terminal (with potentally many non terminals 'in the way' with their own leads to information.)

**Kind**: global function  
**Returns**: <code>Array</code> - [An Array of all of the non-terminals you can reach from the provided nonTerminal]  

| Param | Type | Description |
| --- | --- | --- |
| nonTerminal | <code>Object</code> | [A 'non-terminal object that theoretically has a "leadsTo" field defined. This leadsTo field may lead to terminals or nonTerminals. If nonTerminals, this function is called recursively until terminals are reached.'] |

<a name="computeActionsSalience"></a>

## computeActionsSalience(terminalAction) ⇒ <code>Number</code>
Takes an action as a parameter. If it's salience score is undefined, computes a new salience score based on it's conditions.

**Kind**: global function  
**Returns**: <code>Number</code> - [The number representing the salience of this particular action.]  

| Param | Type | Description |
| --- | --- | --- |
| terminalAction | <code>Object</code> | [An action that should come at the 'end' of the action tree (i.e. it should have effects associated with it). This actions conditions are used to compute salience.] |

<a name="computeInfluenceRuleWeight"></a>

## computeInfluenceRuleWeight(action) ℗
Takes in an action, goes through all of its valid bindings, and evaluates the influence rule for each set of bindings. Stores the weight with each binding and, for the best weight (i.e. the best binding) stores it at the level of the action.

**Kind**: global function  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>Object</code> | [The action to compute the weight for. Should have at least one 'goodBinding' attached to it] |

<a name="actionIsAppropriate"></a>

## actionIsAppropriate(action, isAccepted, uniqueBindings) ⇒ <code>Boolean</code>
actionIsAppropriate checks various qualities that would make an action "not appropriate", such as an action being marked as an "accept" action when we are looking for a reject action.

**Kind**: global function  
**Returns**: <code>Boolean</code> - [Returns true if the action is still appropriate, false otherwise. Returning false here halts continuation down the action tree, as this being false means all subsequent actions will also be false.]  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>Object</code> | [The method uses properties of this action, such as isAccept and goodBindings, to confirm if the action is still appropriate.] |
| isAccepted | <code>Boolean</code> | [A boolean representing the type of action we are looking for -- true for an accept action, false for a reject action.] |
| uniqueBindings | <code>Object</code> | [All of the unique roles that have been defined for the action tree.] |

<a name="getActionFromNameInArray"></a>

## getActionFromNameInArray(actionName) ⇒ <code>object</code> ℗
Given the name of an action, searches through a provided array to find the corresponding action object and returns it.

**Kind**: global function  
**Returns**: <code>object</code> - [An object representing all relevant information pertaining to the requested action. Returns undefined if no such action exists.]  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| actionName | <code>string</code> | [The name of the action we are hunting for in the provided array.] |

<a name="getActionFromName"></a>

## getActionFromName(actionName) ⇒ <code>object</code> ℗
Given the name of an action, searches through the action array to find the corresponding action object and returns it.

**Kind**: global function  
**Returns**: <code>object</code> - [An object representing all relevant information pertaining to the requested action. Returns undefined if no such action exists.]  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| actionName | <code>string</code> | [The name of the action we are hunting for in the actions array.] |

<a name="getUniqueActionBindings"></a>

## getUniqueActionBindings(actionObject, uniqueBindings) ⇒ <code>Object</code>
Given an action (actionObject) and an object representing all of the unique roles we've encountered thus far (uniqueBindings), go through the roles specified in the action and, if not already present in the uniqueBindings object, add them to it!

**Kind**: global function  
**Returns**: <code>Object</code> - [An object containing all of the unique roles used by this point in the action chain.]  

| Param | Type | Description |
| --- | --- | --- |
| actionObject | <code>Object</code> | [An action object. This method goes through it's first and second roles of each of it's conditions, and adds any new roles it finds to the unique bindings object] |
| uniqueBindings | <code>Object</code> | [An object representing all of the unique roles found by this point in the action chain. If undefined, this method will create a new one.] |

<a name="getWorkingBindingCombinations"></a>

## getWorkingBindingCombinations(action, uniqueBindings, availableCastMembers, combinationsToUse) ⇒ <code>Array</code>
This method figures out potential combinations of characters that will satisfy all of the conditions
that have been specified by this point in the action tree. Actions passed into the function through the 'action' parameter
are assumed to have a field called "goodBindings" that represent working combinations of characters to roles found through 
previous calls to this function. These good bindings will be updated in this function as new roles are discovered (e.g a new role 
that appeared later on down the action tree). Additionally, as new conditions are found, old combinations of bindings that
used to work may no longer work; this function will accomadate that as well. This method uses recursion.

**Kind**: global function  
**Returns**: <code>Array</code> - [An array of all valid character-role combinations for the given action]  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>Object</code> | [The action we are finding valid combinations of bindings for. Assumes it has both a conditions array and a goodBindings array.] |
| uniqueBindings | <code>Object</code> | [A list of the roles that need to be filled. Some roles, such as initiator and responder, should be pre-populated with the initiator and responder of the action.] |
| availableCastMembers | <code>Array</code> | [The cast members to use in filling in roles. As a character can only fulfill one role at a time, characters are 'removed' from the cast once they are assigned a role.] |
| combinationsToUse | <code>Array</code> | [Although the action parameter will have all of the potential combinations, due to the recursive nature of this function, it is important to specify which set of combinations we want to use. In general, when this function is called non-recursively, this parameter should include all of the 'goodBindings' found in the action. When called recursively, you shoudl only pass in a single binding at a time.s] |

<a name="bindActionCondition"></a>

## bindActionCondition(conditions, bindingToUse) ⇒ <code>Array</code>
Takes in an array of conditions and a specific binding to use, and replaces all 'generic roles' in the conditions (e.g., "x", "y", "cheater", etc.) with actual character names.

**Kind**: global function  
**Returns**: <code>Array</code> - [An array of the same conditions passed in, but with their generic roles filled in with character names.]  

| Param | Type | Description |
| --- | --- | --- |
| conditions | <code>Array</code> | [An Array of conditions filled with generic roles (such a initiator, x, or cheater)] |
| bindingToUse | <code>Object</code> | [A dictionary of sorts mapping which charactes should be used to fill in which roles] |

<a name="evaluateActionInfluenceRules"></a>

## evaluateActionInfluenceRules(action, bindingToUse) ⇒ <code>Number</code>
Given a binding, goes through all of the influence rules of an action and keeps a rnning sum of their effects, then returns that sum.

**Kind**: global function  
**Returns**: <code>Number</code> - [The sum of the influence rules for this action given this binding.]  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>Object</code> | [An action, with specified influence rules] |
| bindingToUse | <code>Object</code> | [A specfication of the characters to use to fill in each role in the action's influence rules] |

<a name="getBestTerminalFromActionList"></a>

## getBestTerminalFromActionList(actionList) ⇒ <code>Object</code>
Returns the 'best' terminal from an actionList, where best is defined to be the terminal with the highest weight. This function assumes the actionList has already been sorted.

**Kind**: global function  
**Returns**: <code>Object</code> - [The best (highest weighted) terminal action, with it's roles filled in with the best binding of characters]  

| Param | Type | Description |
| --- | --- | --- |
| actionList | <code>Array</code> | [An array of actions. Each of these actions itself contains another array of actions. All of these arrays within arrays, however, should be sorted already before calling this function.] |

<a name="getBestBindingFromTerminal"></a>

## getBestBindingFromTerminal(terminal) ⇒ <code>Object</code>
Given a terminal action, looks at it's list of good bindings and finds the one that matches the score of the action itself. If multiple ones do, picks one at random.

**Kind**: global function  
**Returns**: <code>Object</code> - [An object representing which bindings are the best ones to use for this action]  

| Param | Type | Description |
| --- | --- | --- |
| terminal | <code>Object</code> | [An Action] |

