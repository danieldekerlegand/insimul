<a name="Validate"></a>

## Validate
**Kind**: global class  

* [Validate](#Validate)
    * [new Validate()](#new_Validate_new)
    * [.registerSocialStructure(ss)](#Validate.registerSocialStructure)
    * [.triggerCondition(pred, preamble)](#Validate.triggerCondition) ⇒ <code>Object</code>
    * [.triggerEffect(pred, preamble)](#Validate.triggerEffect) ⇒ <code>Object</code>
    * [.volitionCondition(pred, preamble)](#Validate.volitionCondition) ⇒ <code>Object</code>
    * [.volitionEffect(pred, preamble)](#Validate.volitionEffect) ⇒ <code>Object</code>
    * [.blueprint(pred, preamble)](#Validate.blueprint) ⇒ <code>Object</code>
    * [.rule(rule)](#Validate.rule) ⇒ <code>Object</code>
    * [.action(pred, preamble)](#Validate.action) ⇒ <code>Object</code>
    * [.checkPredicate(pred, type, category, preamble)](#Validate.checkPredicate) ⇒ <code>Boolean</code> ℗

<a name="new_Validate_new"></a>

### new Validate()
This is the class Validate, for verification of predicates and other data.

<a name="Validate.registerSocialStructure"></a>

### Validate.registerSocialStructure(ss)
Store a local copy of the registered social structure, to check predicates for validity. Called by ensemble.loadSocialStructure. Shouldn't be needed by end users.

**Kind**: static method of [<code>Validate</code>](#Validate)  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Object</code> | A reference to the social schema registered in ensemble. |

<a name="Validate.triggerCondition"></a>

### Validate.triggerCondition(pred, preamble) ⇒ <code>Object</code>
Checks that a trigger condition predicate is structured properly, throwing an error if it is not, and returning the predicate reference back if is.

**Kind**: static method of [<code>Validate</code>](#Validate)  
**Returns**: <code>Object</code> - The same predicate reference passed in, if valid.  

| Param | Type | Description |
| --- | --- | --- |
| pred | <code>Object</code> | A trigger condition predicate object. |
| preamble | <code>String</code> | Optional string explaining the context of this predicate, i.e. the specific unit test it's part of, so the error thrown for an invalid predicate can contain this information. |

<a name="Validate.triggerEffect"></a>

### Validate.triggerEffect(pred, preamble) ⇒ <code>Object</code>
Checks that a trigger effect predicate is structured properly, throwing an error if it is not, and returning the predicate reference back if is.

**Kind**: static method of [<code>Validate</code>](#Validate)  
**Returns**: <code>Object</code> - The same predicate reference passed in, if valid.  

| Param | Type | Description |
| --- | --- | --- |
| pred | <code>Object</code> | A trigger effect predicate object. |
| preamble | <code>String</code> | Optional string explaining the context of this predicate, i.e. the specific unit test it's part of, so the error thrown for an invalid predicate can contain this information. |

<a name="Validate.volitionCondition"></a>

### Validate.volitionCondition(pred, preamble) ⇒ <code>Object</code>
Checks that a volition condition predicate is structured properly, throwing an error if it is not, and returning the predicate reference back if is.

**Kind**: static method of [<code>Validate</code>](#Validate)  
**Returns**: <code>Object</code> - The same predicate reference passed in, if valid.  

| Param | Type | Description |
| --- | --- | --- |
| pred | <code>Object</code> | A volition condition predicate object. |
| preamble | <code>String</code> | Optional string explaining the context of this predicate, i.e. the specific unit test it's part of, so the error thrown for an invalid predicate can contain this information. |

<a name="Validate.volitionEffect"></a>

### Validate.volitionEffect(pred, preamble) ⇒ <code>Object</code>
Checks that a volition effect predicate is structured properly, throwing an error if it is not, and returning the predicate reference back if is.

**Kind**: static method of [<code>Validate</code>](#Validate)  
**Returns**: <code>Object</code> - The same predicate reference passed in, if valid.  

| Param | Type | Description |
| --- | --- | --- |
| pred | <code>Object</code> | A volition effect predicate object. |
| preamble | <code>String</code> | Optional string explaining the context of this predicate, i.e. the specific unit test it's part of, so the error thrown for an invalid predicate can contain this information. |

<a name="Validate.blueprint"></a>

### Validate.blueprint(pred, preamble) ⇒ <code>Object</code>
Checks that a blueprint predicate is structured properly, throwing an error if it is not, and returning the predicate reference back if is.

**Kind**: static method of [<code>Validate</code>](#Validate)  
**Returns**: <code>Object</code> - The same predicate reference passed in, if valid.  

| Param | Type | Description |
| --- | --- | --- |
| pred | <code>Object</code> | A blueprint predicate object. |
| preamble | <code>String</code> | Optional string explaining the context of this predicate, i.e. the specific unit test it's part of, so the error thrown for an invalid predicate can contain this information. |

<a name="Validate.rule"></a>

### Validate.rule(rule) ⇒ <code>Object</code>
Checks to ensure a whole trigger or volition rule is valid. Returns the error message explaining what's wrong if it's not, otherwise returns the whole rule.

**Kind**: static method of [<code>Validate</code>](#Validate)  
**Returns**: <code>Object</code> - Either an object if valid (the original rule) or a string if invalid (the error message).  

| Param | Type | Description |
| --- | --- | --- |
| rule | <code>Object</code> | An object containing a trigger or volition rule. Should have top level keys "conditions" and "effects". Auto-determines what kind of rule it is by checking to see whether the first effect includes a weight. |

<a name="Validate.action"></a>

### Validate.action(pred, preamble) ⇒ <code>Object</code>
Checks that an action is structured properly, throwing an error if it is not, and returning the predicate reference back if it is.

**Kind**: static method of [<code>Validate</code>](#Validate)  
**Returns**: <code>Object</code> - [The same predicate reference passed in, if valid.]  

| Param | Type | Description |
| --- | --- | --- |
| pred | <code>Object</code> | [An action predicate object.] |
| preamble | <code>String</code> | [Optional string explaining the context of this predicate, i.e. the specific unit test it's part of, so the error thrown for an invaid predicate can contain this information.] |

<a name="Validate.checkPredicate"></a>

### Validate.checkPredicate(pred, type, category, preamble) ⇒ <code>Boolean</code> ℗
Internal function to deal with the wrapper functions triggerCondition, triggerEffect, volitionCondition, etc. Itself a wrapper for isPredBad, which handles the bulk of the work. Here we simply display diagnostic information to the console and throw an error if a bad predicate is found.

**Kind**: static method of [<code>Validate</code>](#Validate)  
**Returns**: <code>Boolean</code> - Returns false (the result of isPredBad) or throws an error.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| pred | <code>Object</code> | The predicate to check. |
| type | <code>String</code> | Predicate type, either "condition" or "effect" |
| category | <code>String</code> | Subtype, if necessary (i.e. "trigger", "volition") |
| preamble | <code>String</code> | Text explaining the origin of the predicate being tested. |

