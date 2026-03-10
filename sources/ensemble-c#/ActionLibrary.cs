#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
#include <unordered_map>

namespace Ensemble {

    class Action {
    public:
        std::string Name;
        std::string FileName;
        std::string ID;
        std::string Origin;
        bool IsActive;
        int Weight;
        int Salience;
        std::vector<std::shared_ptr<Action>> Actions;
        std::vector<std::string> LeadsTo;
        std::vector<std::string> Effects;
        std::vector<std::unordered_map<std::string, std::string>> GoodBindings;

        std::shared_ptr<Action> DeepCopy() const {
            auto copy = std::make_shared<Action>(*this);
            return copy;
        }
    };

    class Intent {
    public:
        std::string Category;
        std::string Type;
        std::string IntentType;
        std::string First;
        std::string Second;
    };

    class Validate {
    public:
        void action(const std::shared_ptr<Action>& action, const std::string& message) {
            // Validation logic here
        }
    };

    class RuleLibrary {
    public:
        // Placeholder for RuleLibrary methods
    };

    class VolitionCache {
    public:
        // Placeholder for VolitionCache methods
    };

    class Util {
    public:
        int iterator(const std::string& key) {
            static std::unordered_map<std::string, int> counters;
            return ++counters[key];
        }
    };

    class ActionLibrary {
    private:
        std::vector<std::shared_ptr<Action>> actions;
        std::vector<std::shared_ptr<Action>> startSymbols;
        std::vector<std::shared_ptr<Action>> nonTerminals;
        std::vector<std::shared_ptr<Action>> terminalActions;
        Validate validate;
        RuleLibrary* ruleLibrary;
        VolitionCache* volitionCache;
        Util* util;

    public:
        ActionLibrary(RuleLibrary* ruleLibrary, VolitionCache* volitionCache, Util* util)
            : ruleLibrary(ruleLibrary), volitionCache(volitionCache), util(util) {}

        std::vector<std::shared_ptr<Action>> getAllActions() {
            return actions;
        }

        void dumpActions() {
            // Log out actions
        }

        std::vector<std::shared_ptr<Action>> getStartSymbols() {
            return startSymbols;
        }

        std::vector<std::shared_ptr<Action>> getNonTerminals() {
            return nonTerminals;
        }

        std::vector<std::shared_ptr<Action>> getTerminalActions() {
            return terminalActions;
        }

        void clearActionLibrary() {
            actions.clear();
            startSymbols.clear();
            nonTerminals.clear();
            terminalActions.clear();
        }

        std::vector<std::shared_ptr<Action>> parseActions(const std::vector<std::shared_ptr<Action>>& inputActions, const std::string& fileName, const std::string& sourceFile) {
            std::vector<std::shared_ptr<Action>> actionsToCategorize;

            for (const auto& action : inputActions) {
                auto newAction = action->DeepCopy();
                newAction->FileName = fileName;
                newAction->ID = std::to_string(util->iterator("actions"));
                newAction->Origin = sourceFile;
                newAction->IsActive = true;

                validate.action(newAction, "Validate for ActionLibrary parseActions");

                if (actionAlreadyExists(newAction)) {
                    continue;
                }

                actions.push_back(newAction->DeepCopy());
                actionsToCategorize.push_back(newAction);
            }
            categorizeActionGrammar(actionsToCategorize);
            return actions;
        }

        bool actionAlreadyExists(const std::shared_ptr<Action>& potentialNewAction) {
            for (const auto& action : actions) {
                if (action->Name == potentialNewAction->Name) {
                    return true;
                }
            }
            return false;
        }

        void categorizeActionGrammar(const std::vector<std::shared_ptr<Action>>& actionPool) {
            for (const auto& action : actionPool) {
                auto currentAction = action->DeepCopy();
                if (action->LeadsTo.size() > 0) {
                    nonTerminals.push_back(currentAction);
                }
                if (action->Effects.size() > 0) {
                    terminalActions.push_back(currentAction);
                }
            }
        }
    };

} // namespace Ensemble
