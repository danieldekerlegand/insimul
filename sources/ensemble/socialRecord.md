## Classes

<dl>
<dt><a href="#socialRecord">socialRecord</a> ℗</dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#getLengthAtTimeStep">getLengthAtTimeStep(timestep)</a> ⇒ <code>int</code> ℗</dt>
<dd><p>Given a timestep, returns the length of the array at the index represented by that timestep in the socialRecord.</p>
</dd>
</dl>

<a name="socialRecord"></a>

## socialRecord ℗
**Kind**: global class  
**Access**: private  

* [socialRecord](#socialRecord) ℗
    * [new socialRecord()](#new_socialRecord_new)
    * [.getLength()](#socialRecord.getLength) ⇒ <code>int</code> ℗
    * [.predicateToString()](#socialRecord.predicateToString) ⇒
    * [.clearEverthing()](#socialRecord.clearEverthing)
    * [.socialRecordHistoryToString(timeStep)](#socialRecord.socialRecordHistoryToString) ⇒

<a name="new_socialRecord_new"></a>

### new socialRecord()
This is the class socialRecord

<a name="socialRecord.getLength"></a>

### socialRecord.getLength() ⇒ <code>int</code> ℗
gets the length of the socialRecord object.

**Kind**: static method of [<code>socialRecord</code>](#socialRecord)  
**Returns**: <code>int</code> - length of the socialRecord object  
**Access**: private  
<a name="socialRecord.predicateToString"></a>

### socialRecord.predicateToString() ⇒
A simple toString for a predicate, as the natural one just returns Object [object]
This function is meant to be assigned to a predicate objects toString method.

**Kind**: static method of [<code>socialRecord</code>](#socialRecord)  
**Returns**: a string representation of the current predicate represented by 'this'  
<a name="socialRecord.clearEverthing"></a>

### socialRecord.clearEverthing()
Clears out EVERYTHING from the socialRecord. This means the entire social history, and also data that came from
our factory blueprints, including defaultValues and directions. After calling this, predicates need to be re-registered

**Kind**: static method of [<code>socialRecord</code>](#socialRecord)  
<a name="socialRecord.socialRecordHistoryToString"></a>

### socialRecord.socialRecordHistoryToString(timeStep) ⇒
Prints out the contents of the socialRecord's history at a given timeStep. If no timeStep is specified,
prints out the conents of the socialRecord at the current time step

**Kind**: static method of [<code>socialRecord</code>](#socialRecord)  
**Returns**: historyString 	A string representing the contents of the socialRecord at the specified point in history  

| Param | Description |
| --- | --- |
| timeStep | an integer representing the timeStep we want to see the contents of the socialRecord at. Assume current time step if undefined. |

<a name="getLengthAtTimeStep"></a>

## getLengthAtTimeStep(timestep) ⇒ <code>int</code> ℗
Given a timestep, returns the length of the array at the index represented by that timestep in the socialRecord.

**Kind**: global function  
**Returns**: <code>int</code> - [the length of the array that resides at socialRecord[timestep]]  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| timestep | <code>int</code> | [The timestep to get the length of. Should be >= 0] |

