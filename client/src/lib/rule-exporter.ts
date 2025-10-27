/**
 * Rule Export Utilities
 * Handles exporting Insimul rules to different formats: Ensemble JSON, Kismet Prolog, Talk of the Town Python
 */

import { InsimulRule, Condition, Effect, SystemType } from './unified-syntax';

export class RuleExporter {
  
  // Main export method
  exportToFormat(rules: InsimulRule[], targetFormat: SystemType, includeSchema: boolean = false, characters?: any[], actions?: any[]): string {
    switch (targetFormat) {
      case 'ensemble':
        return this.exportToEnsemble(rules, includeSchema, characters, actions);
      case 'kismet':
        return this.exportToKismet(rules, characters, actions);
      case 'tott':
        return this.exportToTott(rules, characters, actions);
      case 'insimul':
        return this.exportToInsimul(rules, characters, actions);
      default:
        throw new Error(`Unsupported export format: ${targetFormat}`);
    }
  }

  // Export to Ensemble JSON format
  private exportToEnsemble(rules: InsimulRule[], includeSchema: boolean, characters?: any[], actions?: any[]): string {
    const triggerRules = rules.filter(rule => rule.ruleType === 'trigger');
    const volitionRules = rules.filter(rule => rule.ruleType === 'volition');
    const actionRules = rules.filter(rule => rule.ruleType === 'default');
    const otherRules = rules.filter(rule => !['trigger', 'volition', 'default'].includes(rule.ruleType));
    
    // Generate combined JSON object with separate sections for mixed rule types
    let ensembleExport: any = {};
    
    // Add trigger rules section if present
    if (triggerRules.length > 0) {
      ensembleExport.triggerRules = {
        fileName: "triggerRules",
        type: "trigger",
        rules: triggerRules.map(rule => ({
          name: rule.name,
          conditions: this.convertToEnsembleConditions(rule.conditions),
          effects: this.convertToEnsembleEffects(rule.effects)
        }))
      };
    }
    
    // Add volition rules section if present
    if (volitionRules.length > 0) {
      ensembleExport.volitionRules = {
        fileName: "volitionRules",
        type: "volition",
        rules: volitionRules.map(rule => ({
          name: rule.name,
          conditions: this.convertToEnsembleConditions(rule.conditions),
          effects: this.convertToEnsembleVolitionEffects(rule.effects, rule.priority),
          weight: rule.priority || rule.weight
        }))
      };
    }
    
    // Add action rules section if present
    if (actionRules.length > 0) {
      ensembleExport.actions = actionRules.map(rule => ({
        name: rule.name,
        conditions: this.convertToEnsembleConditions(rule.conditions),
        influenceRules: [],
        intent: rule.effects[0]?.parameters || {},
        leadsTo: Array.isArray(rule.effects[0]?.value) ? rule.effects[0].value : []
      }));
    }
    
    // Handle other rule types (social, relationship, etc.) as trigger rules for compatibility
    if (otherRules.length > 0) {
      if (!ensembleExport.triggerRules) {
        ensembleExport.triggerRules = {
          fileName: "triggerRules",
          type: "trigger",
          rules: []
        };
      }
      ensembleExport.triggerRules.rules.push(...otherRules.map(rule => ({
        name: rule.name,
        conditions: this.convertToEnsembleConditions(rule.conditions),
        effects: this.convertToEnsembleEffects(rule.effects),
        originalType: rule.ruleType,  // Preserve original type for round-trip
        likelihood: rule.likelihood   // Preserve likelihood metadata
      })));
    }
    
    // Fallback if no rules found
    if (Object.keys(ensembleExport).length === 0) {
      ensembleExport = { triggerRules: { fileName: "customRules", type: "trigger", rules: [] } };
    }
    
    // Add schema if requested
    if (includeSchema) {
      ensembleExport.schema = JSON.parse(this.generateEnsembleSchema());
    }
    
    // Add character cast data if provided - use flat structure that parser expects
    if (characters && characters.length > 0) {
      ensembleExport.cast = characters.reduce((acc, char) => {
        const characterName = char.name || `${char.firstName || ''} ${char.lastName || ''}`.trim() || `Character_${char.id}`;
        acc[characterName] = { name: characterName };
        return acc;
      }, {});
    }

    // Add actions if provided
    if (actions && actions.length > 0) {
      ensembleExport.actions = actions.map(action => ({
        name: action.name,
        type: action.actionType,
        category: action.category,
        duration: action.duration,
        difficulty: action.difficulty,
        targetType: action.targetType,
        effects: action.effects || [],
        prerequisites: action.prerequisites || [],
        verb: action.verbPresent,
      }));
    }

    // Return parser-compatible JSON structure
    return JSON.stringify(ensembleExport, null, 2);
  }

  // Export to Kismet Prolog format
  private exportToKismet(rules: InsimulRule[], characters?: any[], actions?: any[]): string {
    let output = '';

    // Add actions if provided
    if (actions && actions.length > 0) {
      output += '% Action Definitions\n';
      actions.forEach(action => {
        output += `% Action: ${action.name}\n`;
        output += `action ${action.name.toLowerCase()}(Self, ${action.targetType === 'other' ? 'Other' : 'Target'}):\n`;
        output += `    type = ${action.actionType},\n`;
        if (action.category) {
          output += `    category = ${action.category},\n`;
        }
        output += `    duration = ${action.duration || 1},\n`;
        output += `    difficulty = ${action.difficulty || 0.5}`;
        if (action.prerequisites && action.prerequisites.length > 0) {
          output += `,\n    requires ${action.prerequisites.map((p: any) => p.condition || 'true').join(', ')}`;
        }
        if (action.effects && action.effects.length > 0) {
          output += `,\n    effect ${action.effects.map((e: any) => e.action || 'none').join(', ')}`;
        }
        output += '.\n\n';
      });
      output += '\n';
    }

    // Add character initialization if provided and rules don't contain existing character data
    if (characters && characters.length > 0 && rules.some(r => r.ruleType === 'trait' || r.ruleType === 'volition')) {
      output += '% Character Initialization\n';
      output += 'default character:\n';
      output += '    first_name = "#firstNames#",\n';
      output += '    last_name = "#lastNames#",\n';
      output += '    age = [18:50],\n';
      output += '    traits = [1:3] traits.\n\n';
      
      characters.forEach(char => {
        const name = char.name || `${char.firstName || ''} ${char.lastName || ''}`.trim() || `Character_${char.id}`;
        output += `initialization ${this.toKismetIdentifier(name)}_family:\n`;
        output += `    let FamilyName = "${char.lastName || name}";\n`;
        output += `    create [1] character as ${this.toKismetIdentifier(name)}:\n`;
        output += `        first_name = "${char.firstName || name}",\n`;
        output += `        last_name = FamilyName,\n`;
        if (char.age) {
          output += `        age = ${char.age},\n`;
        }
        if (char.occupation) {
          output += `        occupation = "${char.occupation}",\n`;
        }
        output += '        is protagonist.\n\n';
      });
      
      output += '\n';
    }
    
    // Convert all rules to Kismet format - map rule types appropriately
    const rulesOutput = rules.map(rule => {
      let ruleOutput = `% ${rule.name}\n`;
      
      // Convert all rule types to Kismet trait format (most flexible approach)
      if (true) {
        // Generate single-line format that matches the parser regex exactly
        // Pattern: default trait name(args): body. likelihood: value
        let traitDef = `default trait ${rule.name.toLowerCase()}(`;
        
        if (rule.conditions.length > 0) {
          const firstCondition = rule.conditions[0];
          traitDef += `${firstCondition.first || 'Self'}`;
          if (firstCondition.second) {
            traitDef += `, ${firstCondition.second}`;
          }
        } else {
          traitDef += 'Self';
        }
        
        traitDef += '): ';
        
        // Add effects in the exact format expected by the parser
        if (rule.effects.length > 0) {
          const effect = rule.effects[0];
          // Use simple format that will definitely match [^.]+ in the regex
          if (effect.action && effect.target) {
            traitDef += `${effect.action}(${effect.target})`;
          } else if (effect.target) {
            traitDef += `+++(${effect.target})`;
          } else {
            traitDef += 'true';
          }
        } else {
          traitDef += 'true';
        }
        
        traitDef += '.';
        
        // Add likelihood on the same line to match parser regex
        if (rule.likelihood !== undefined && rule.likelihood !== 0.5) {
          traitDef += ` likelihood: ${rule.likelihood}`;
        }
        
        ruleOutput += traitDef + '\n';
        
        // Add tags as comments if present
        if (rule.tags.length > 0) {
          ruleOutput += `% tags: [${rule.tags.join(', ')}]\n`;
        }
      }
      else if (rule.ruleType === 'volition') {
        // Generate volition rule format that matches parser regex exactly: rule_name(args) :- body. weight: value
        let volitionDef = `${rule.name.toLowerCase()}(`;
        
        if (rule.conditions.length > 0) {
          const firstCondition = rule.conditions[0];
          volitionDef += `${firstCondition.first || 'Self'}`;
          if (firstCondition.second) {
            volitionDef += `, ${firstCondition.second}`;
          }
        } else {
          volitionDef += 'Self';
        }
        
        volitionDef += ') :- ';
        
        // Add effects - ensure they match the parser expectations
        if (rule.effects.length > 0) {
          const effectStrs = rule.effects.map(effect => {
            if (effect.action && effect.target) {
              return `${effect.action}(${effect.target})`;
            } else {
              return `${effect.action || 'apply'}(${effect.target || 'Self'})`;
            }
          });
          volitionDef += effectStrs.join(', ');
        } else {
          volitionDef += 'true';
        }
        
        volitionDef += '.';
        
        // Add weight if present - match parser expectations
        if (rule.priority !== undefined && rule.priority !== 7) {
          volitionDef += ` weight: ${rule.priority}`;
        }
        
        ruleOutput += volitionDef + '\n';
      }
      else if (rule.ruleType === 'pattern') {
        // Generate pattern rule format: pattern name: conditions -> effects.
        let patternDef = `pattern ${rule.name.toLowerCase()}: `;
        
        // Add conditions
        if (rule.conditions.length > 0) {
          const conditionStrs = rule.conditions.map(condition => {
            if (condition.type === 'predicate') {
              return `${condition.predicate}(${condition.first || 'Self'}${condition.second ? `, ${condition.second}` : ''})`;
            } else {
              return `${condition.first} ${condition.operator || '=='} ${condition.value}`;
            }
          });
          patternDef += conditionStrs.join(' and ');
        } else {
          patternDef += 'true';
        }
        
        patternDef += ' -> ';
        
        // Add effects
        if (rule.effects.length > 0) {
          const effectStrs = rule.effects.map(effect => `${effect.action}(${effect.target})`);
          patternDef += effectStrs.join(', ');
        } else {
          patternDef += 'true';
        }
        
        patternDef += '.';
        
        ruleOutput += patternDef + '\n';
      }
      
      return ruleOutput;
    }).join('\n');
    
    return output + rulesOutput;
  }

  private toKismetIdentifier(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  // Export to Talk of the Town JSON format
  private exportToTott(rules: InsimulRule[], characters?: any[], actions?: any[]): string {
    // Group rules by type for the categorized JSON format that compileTott expects
    const genealogyRules = rules.filter(rule => rule.ruleType === 'genealogy');
    const triggerRules = rules.filter(rule => rule.ruleType === 'trigger');
    const characterRules = rules.filter(rule => rule.ruleType === 'default' || rule.ruleType === 'trait');
    
    const tottData: any = {};
    
    // Add genealogy rules
    if (genealogyRules.length > 0) {
      tottData.genealogy_rules = genealogyRules.map(rule => ({
        name: rule.name,
        type: 'genealogy',
        priority: rule.priority,
        conditions: this.convertToTottConditions(rule.conditions),
        effects: this.convertToTottEffects(rule.effects),
        tags: rule.tags.length > 0 ? rule.tags : ['genealogy'],
        dependencies: rule.dependencies || [],
        active: rule.isActive,
        likelihood: rule.likelihood
      }));
    }
    
    // Add trigger rules
    if (triggerRules.length > 0) {
      tottData.trigger_rules = triggerRules.map(rule => ({
        name: rule.name,
        type: 'trigger',
        priority: rule.priority,
        conditions: this.convertToTottConditions(rule.conditions),
        effects: this.convertToTottEffects(rule.effects),
        tags: rule.tags.length > 0 ? rule.tags : ['trigger'],
        dependencies: rule.dependencies || [],
        active: rule.isActive,
        likelihood: rule.likelihood
      }));
    }
    
    // Add character/trait rules
    if (characterRules.length > 0) {
      tottData.character_rules = characterRules.map(rule => ({
        name: rule.name,
        type: rule.ruleType === 'trait' ? 'trait' : 'character',
        priority: rule.priority,
        conditions: this.convertToTottConditions(rule.conditions),
        effects: this.convertToTottEffects(rule.effects),
        tags: rule.tags.length > 0 ? rule.tags : [rule.ruleType],
        dependencies: rule.dependencies || [],
        active: rule.isActive,
        likelihood: rule.likelihood
      }));
    }
    
    // Add character definitions if provided
    if (characters && characters.length > 0) {
      tottData.characters = characters.map(char => ({
        name: char.name || `Character_${char.id}`,
        firstName: char.firstName,
        lastName: char.lastName,
        age: char.age,
        gender: char.gender,
        occupation: char.occupation,
        alive: char.isAlive !== false,
        personality: char.personality || {}
      }));
    }

    // Add actions if provided
    if (actions && actions.length > 0) {
      tottData.actions = actions.map(action => ({
        name: action.name,
        action_type: action.actionType,
        category: action.category,
        duration: action.duration,
        difficulty_level: action.difficulty,
        target_type: action.targetType,
        skill_requirements: action.prerequisites || {},
        effects: action.effects || [],
      }));
    }

    // Return parser-compatible JSON structure
    return JSON.stringify(tottData, null, 2);
  }

  // Export to Insimul format
  private exportToInsimul(rules: InsimulRule[], characters?: any[], actions?: any[]): string {
    let output = '';
    
    // Add character definitions if provided
    if (characters && characters.length > 0) {
      output += '// Character Definitions\n\n';

      characters.forEach(char => {
        output += `character ${char.name || `Character_${char.id}`} {\n`;
        if (char.firstName) output += `  first_name: "${char.firstName}",\n`;
        if (char.lastName) output += `  last_name: "${char.lastName}",\n`;
        if (char.age) output += `  age: ${char.age},\n`;
        if (char.gender) output += `  gender: "${char.gender}",\n`;
        if (char.occupation) output += `  occupation: "${char.occupation}",\n`;
        if (char.isAlive !== undefined) output += `  alive: ${char.isAlive},\n`;

        if (char.personality && typeof char.personality === 'object') {
          Object.entries(char.personality).forEach(([trait, value]) => {
            output += `  ${trait}: ${value},\n`;
          });
        }

        output += '}\n\n';
      });
    }

    // Add action definitions if provided
    if (actions && actions.length > 0) {
      output += '// Action Definitions\n\n';

      actions.forEach(action => {
        output += `action ${action.name} {\n`;
        output += `  type: ${action.actionType}\n`;
        if (action.category) output += `  category: ${action.category}\n`;
        if (action.duration) output += `  duration: ${action.duration}\n`;
        if (action.difficulty !== null) output += `  difficulty: ${action.difficulty}\n`;
        if (action.targetType) output += `  target: ${action.targetType}\n`;

        if (action.prerequisites && action.prerequisites.length > 0) {
          output += `  \n  prerequisites {\n`;
          action.prerequisites.forEach((prereq: any) => {
            output += `    ${JSON.stringify(prereq)}\n`;
          });
          output += `  }\n`;
        }

        if (action.effects && action.effects.length > 0) {
          output += `  \n  effects {\n`;
          action.effects.forEach((effect: any) => {
            output += `    ${JSON.stringify(effect)}\n`;
          });
          output += `  }\n`;
        }

        if (action.verbPresent && action.verbPast) {
          output += `  \n  narrative: "#actor# ${action.verbPresent} #target#"\n`;
        }

        if (action.tags && action.tags.length > 0) {
          output += `  \n  tags: [${action.tags.join(', ')}]\n`;
        }

        output += '}\n\n';
      });
    }

    const rulesOutput = rules.map(rule => {
      // Map internal ruleType back to Insimul keywords for proper round-trip
      const insimulKeyword = this.mapToInsimulKeyword(rule.ruleType);
      let output = `${insimulKeyword} ${rule.name} {\n`;
      
      if (rule.conditions.length > 0) {
        output += '  when (\n';
        rule.conditions.forEach((condition, index) => {
          const indent = '    ';
          if (condition.type === 'predicate') {
            output += `${indent}${condition.predicate}(${condition.first || '?x'}`;
            if (condition.second) {
              output += `, ${condition.second}`;
            }
            output += ')';
          } else if (condition.type === 'comparison') {
            output += `${indent}${condition.first} ${condition.operator || '=='} ${condition.value}`;
          }
          
          if (index < rule.conditions.length - 1) {
            output += ' and';
          }
          output += '\n';
        });
        output += '  )\n';
      }
      
      if (rule.effects.length > 0) {
        output += '  then {\n';
        rule.effects.forEach(effect => {
          output += `    ${effect.action}(${effect.target}`;
          if (effect.value !== undefined) {
            output += `, ${JSON.stringify(effect.value)}`;
          }
          output += ')\n';
        });
        output += '  }\n';
      }
      
      output += `  priority: ${rule.priority}\n`;
      
      if (rule.likelihood) {
        output += `  likelihood: ${rule.likelihood}\n`;
      }
      
      if (rule.tags.length > 0) {
        output += `  tags: [${rule.tags.map(tag => `"${tag}"`).join(', ')}]\n`;
      }
      
      output += '}\n';
      
      return output;
    }).join('\n\n');
    
    return output + rulesOutput;
  }

  // Map internal ruleType back to Insimul keywords for round-trip preservation  
  private mapToInsimulKeyword(ruleType: string): string {
    switch (ruleType) {
      case 'trigger':
      case 'social': 
      case 'relationship':
        return 'rule';
      case 'pattern':
        return 'pattern';
      case 'genealogy':
        return 'genealogy';
      case 'default':
        // 'tracery' gets mapped to 'default' during parsing, so reverse it
        return 'tracery';
      default:
        return 'rule'; // Default fallback
    }
  }

  // Helper methods for format conversion
  private convertToEnsembleConditions(conditions: Condition[]): any[] {
    return conditions.map(condition => {
      const parts = condition.predicate?.split('_') || ['trait', 'unknown'];
      return {
        category: parts[0],
        type: parts.slice(1).join('_'),
        first: condition.first,
        second: condition.second,
        value: condition.value,
        operator: this.mapToEnsembleOperator(condition.operator)
      };
    });
  }
  
  private convertToEnsembleEffects(effects: Effect[]): any[] {
    return effects.map(effect => {
      const parts = effect.action?.split('_') || ['trait', 'unknown'];
      return {
        category: parts[0],
        type: parts.slice(1).join('_'),
        first: effect.target,
        second: effect.parameters?.second,
        value: effect.value,
        operator: effect.parameters?.operator
      };
    });
  }
  
  private convertToEnsembleVolitionEffects(effects: Effect[], weight: number): any[] {
    return effects.map(effect => {
      const parts = effect.action?.split('_') || ['trait', 'unknown'];
      return {
        category: parts[0],
        type: parts.slice(1).join('_'),
        first: effect.target,
        second: effect.parameters?.second,
        weight: weight,
        intentType: true,
        value: effect.value
      };
    });
  }

  private generateEnsembleSchema(): string {
    return JSON.stringify({
      schema: [
        {
          category: "trait",
          isBoolean: true,
          directionType: "undirected",
          types: ["hero", "love", "rival", "anyone", "noble", "chosen_one"],
          actionable: false,
          defaultValue: false
        },
        {
          category: "attribute",
          types: ["strength", "intelligence", "charisma", "wisdom", "dexterity"],
          isBoolean: false,
          directionType: "undirected",
          actionable: true,
          defaultValue: 0,
          maxValue: 100,
          minValue: 0
        },
        {
          category: "relationship",
          isBoolean: true,
          directionType: "reciprocal",
          types: ["friends", "enemies", "married", "family", "allies"],
          defaultValue: false,
          actionable: true
        }
      ]
    }, null, 2);
  }

  private generateFallbackEnsembleJson(rules: InsimulRule[]): string {
    return JSON.stringify({
      fileName: "customRules",
      type: "trigger",
      rules: rules.map(rule => ({
        name: rule.name,
        conditions: this.convertToEnsembleConditions(rule.conditions),
        effects: this.convertToEnsembleEffects(rule.effects)
      }))
    }, null, 2);
  }

  private convertToTottConditions(conditions: Condition[]): any[] {
    return conditions.map(condition => {
      if (condition.type === 'predicate') {
        return {
          type: 'predicate',
          predicate: condition.predicate,
          first: condition.first,
          second: condition.second,
          negated: condition.negated || false
        };
      } else if (condition.type === 'comparison') {
        return {
          type: 'comparison', 
          first: condition.first,
          operator: condition.operator || 'equals',
          value: condition.value
        };
      } else if (condition.type === 'genealogy') {
        return {
          type: 'genealogy',
          relation: condition.predicate,
          first: condition.first,
          second: condition.second
        };
      }
      return {
        type: condition.type || 'predicate',
        predicate: condition.predicate || 'unknown',
        first: condition.first,
        second: condition.second,
        value: condition.value
      };
    });
  }

  private convertToTottEffects(effects: Effect[]): any[] {
    return effects.map(effect => {
      if (effect.type === 'create_relationship') {
        return {
          type: 'genealogy_action',
          action: 'create_relationship',
          target: effect.target,
          relationship: effect.action,
          value: effect.value
        };
      } else if (effect.type === 'set' || effect.type === 'modify') {
        return {
          type: 'attribute_change',
          action: effect.action,
          target: effect.target,
          value: effect.value,
          parameters: effect.parameters
        };
      } else if (effect.type === 'trigger_event') {
        return {
          type: 'event_trigger',
          action: effect.action,
          target: effect.target,
          event_type: effect.value,
          parameters: effect.parameters
        };
      }
      return {
        type: effect.type || 'action',
        action: effect.action,
        target: effect.target,
        value: effect.value,
        parameters: effect.parameters
      };
    });
  }

  private toPythonMethodName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^([0-9])/, '_$1');
  }

  private toPythonOperator(operator?: string): string {
    switch (operator) {
      case 'greater': return '>';
      case 'less': return '<';
      case 'equals': return '==';
      default: return '==';
    }
  }

  private mapToEnsembleOperator(operator?: string): string {
    switch (operator) {
      case 'greater': return '>';
      case 'less': return '<';
      case 'equals': return '==';  // Fixed: Use == to match parser expectations
      default: return '==';
    }
  }
}

export const ruleExporter = new RuleExporter();