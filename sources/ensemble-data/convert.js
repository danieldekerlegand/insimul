import * as fs from 'fs';

import actions from "./_combined/actions.json" with { type: "json" };
import cast from "./_combined/cast.json" with { type: "json" };
import history from "./_combined/history.json" with { type: "json" };
import schema from "./_combined/schema.json" with { type: "json" };
import triggerRules from "./_combined/triggerRules.json" with { type: "json" };
import volitionRules from "./_combined/volitionRules.json" with { type: "json" };

const newActions = {};

function createExpressionString({ type, first, second, operator, value, intentDirection, weight }) {
    const _type = snakecase(type);
    const _value = weight || (value != null && value) || intentDirection;
    const _first = snakecase(first);
    const _second = second ? ", " + snakecase(second) : "";

    if (operator) {
        return `${_type}(${_first}${_second}, ${operator ? operator : ""}, ${_value})`;
    } else if (typeof _value === "number") {
        return `${_type}(${_first}${_second}, ${_value})`;
    } else {
        return `${_value === false ? "not_" + _type : _type}(${_first}${_second})`;
    }
}

function createRuleString(ruleConditions, ruleEffects, influenceRuleWeight=null) {
    const conditions = ruleConditions.map(condition => createExpressionString(condition)).join(", ");
    const effects = ruleEffects.map(effect => createExpressionString(effect)).join(", ");
    const conditional = effects.length > 0 && conditions.length > 0 ? " :- " : "";
    const _weight = influenceRuleWeight ? (`influence(this_action, ${influenceRuleWeight})` + (effects.length > 0 ? ", " : " :- ")) : "";
    const terminator = effects.length > 0 || conditions.length > 0 ? "." : "";

    return _weight + effects + conditional + conditions + terminator;
}

function snakecase(str) {
    return str && str.match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(s => s.toLowerCase())
        .join('_');
}

function convertActions() {
    actions["actions"].forEach(action => {
        if (action?.intent && Array.isArray(action.leadsTo)) {
            newActions[action.name] = [];
            action.leadsTo.sort().forEach(childName => {
                const childAction = { name: childName };
                const child = actions["actions"].find(_action => _action.name === childName);
    
                if (child?.leadsTo?.length > 0) {
                    childAction.leadsTo = [];
                    child.leadsTo.sort().forEach(grandchildName => {
                        const grandchild = actions["actions"].find(_action => _action.name === grandchildName);
                        childAction.leadsTo.push({ 
                            name: grandchildName,
                            rule: createRuleString(grandchild.conditions, grandchild.effects),
                            influenceRules: grandchild?.influenceRules?.map(rule => createRuleString(rule.conditions, rule.effects, rule.weight))
                        });
                    });
                }
    
                if (child?.influenceRules?.length > 0) {
                    childAction.influenceRules = child.influenceRules.map(rule => createRuleString(rule.conditions, rule.effects, rule.weight));
                }
    
                newActions[action.name].push(childAction);
            });
        }
    });
    
    let actionStrings = [];
    for (const intent in newActions) {
        actionStrings.push(`% ${intent}`);
    
        if (newActions[intent]?.length <= 0) {
            actionStrings.push("empty(this_intent).");
        } else {
            newActions[intent].forEach(nonterminal => {
                actionStrings.push(`% ${nonterminal.name}`);
                nonterminal.leadsTo.forEach(terminal => {
                    actionStrings.push(`% ${terminal.name}`);
                    actionStrings.push(terminal.rule || "empty(this_action).");
                    if (terminal.influenceRules) {
                        actionStrings = actionStrings.concat(terminal.influenceRules);
                    }
                });
                if (nonterminal.influenceRules) {
                    actionStrings = actionStrings.concat(nonterminal.influenceRules);
                }
            });
        }
    
        actionStrings.push('');
    }
    
    fs.writeFile('./prolog/actions.pl', actionStrings.join("\n"), (error) => {
        if (error) {
            throw error;
        }
    });
}

function convertCast() {
    let castStrings = ["cast{"];
    Object.keys(cast["cast"]).forEach((key, i) => {
        const _key = snakecase(key);
        const name = cast["cast"][key].name;
        const ending = i === Object.keys(cast["cast"]).length - 1 ? "" : ",";
        castStrings.push(`\t${_key}:"${name}"${ending}`);
    });
    castStrings.push("}.");
    fs.writeFile('./prolog/cast.pl', castStrings.join("\n"), (error) => {
        if (error) {
            throw error;
        }
    });
}

function convertHistory() {
    const historyStrings = [];
    history["history"][0]["data"].forEach(predicate => {
        historyStrings.push(createExpressionString(predicate) + '.');
    });
    fs.writeFile('./prolog/history.pl', historyStrings.sort().join("\n"), (error) => {
        if (error) {
            throw error;
        }
    });
}

function convertTriggerRules() {
    const triggerRuleStrings = triggerRules["rules"].map(rule => createRuleString(rule.conditions, rule.effects) + ` % ${rule.name}`);
    fs.writeFile('./prolog/triggerRules.pl', triggerRuleStrings.join("\n"), (error) => {
        if (error) {
            throw error;
        }
    });
}

function convertVolitionRules() {
    const volitionRuleStrings = volitionRules["rules"].map(rule => createRuleString(rule.conditions, rule.effects) + ` % ${rule.name}`).sort();
    fs.writeFile('./prolog/volitionRules.pl', volitionRuleStrings.join("\n"), (error) => {
        if (error) {
            throw error;
        }
    });
}

function convertSchema() {
    let schemaStrings = ["schema{"];
    schema["schema"].sort(schema => schema.category).forEach((schemaCategory, i) => {
        const _key = snakecase(schemaCategory.category);
        const value = `[${schemaCategory.types.sort().map(typeName => snakecase(typeName)).join(", ")}]${i === schema["schema"].length - 1 ? "" : ","}`;
        schemaStrings.push(`\t${_key}:${value}`);
    });
    schemaStrings.push("}.");
    fs.writeFile('./prolog/schema.pl', schemaStrings.join("\n"), (error) => {
        if (error) {
            throw error;
        }
    });
}

convertActions();
convertCast();
convertHistory();
convertTriggerRules();
convertVolitionRules();
convertSchema();