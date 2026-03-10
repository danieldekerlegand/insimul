#include <string>
#include <vector>
#include <memory>
#include <algorithm>
#include <iostream>

namespace Ensemble {

    class Condition {
    public:
        std::shared_ptr<Condition> DeepCopy() const {
            // Implement DeepCopy logic for Condition
            return std::make_shared<Condition>(*this);
        }

        std::string ToString() const {
            // Implement ToString logic for Condition
            return "Condition";
        }
    };

    class Effect {
    public:
        std::shared_ptr<Effect> DeepCopy() const {
            // Implement DeepCopy logic for Effect
            return std::make_shared<Effect>(*this);
        }

        std::string ToString() const {
            // Implement ToString logic for Effect
            return "Effect";
        }
    };

    class Binding {
    public:
        std::shared_ptr<Binding> DeepCopy() const {
            // Implement DeepCopy logic for Binding
            return std::make_shared<Binding>(*this);
        }

        std::string ToString() const {
            // Implement ToString logic for Binding
            return "Binding";
        }
    };

    class InfluenceRule {
    public:
        std::shared_ptr<InfluenceRule> DeepCopy() const {
            // Implement DeepCopy logic for InfluenceRule
            return std::make_shared<InfluenceRule>(*this);
        }
    };

    class Intent {
        // Implement Intent class
    };

    class Performance {
        // Implement Performance class
    };

    class Action {
    public:
        std::optional<bool> IsAccept;
        bool IsActive = false;

        std::shared_ptr<Condition> Condition;

        std::optional<int> Salience;
        std::optional<int> Weight;

        std::shared_ptr<Intent> Intent;

        std::vector<std::shared_ptr<Action>> Actions;
        std::vector<std::shared_ptr<Binding>> GoodBindings;
        std::vector<std::shared_ptr<Condition>> Conditions;
        std::vector<std::shared_ptr<Effect>> AcceptEffects;
        std::vector<std::shared_ptr<Effect>> Effects;
        std::vector<std::shared_ptr<Effect>> RejectEffects;
        std::vector<std::shared_ptr<InfluenceRule>> InfluenceRules;
        std::vector<std::vector<std::shared_ptr<Performance>>> Performance;

        std::vector<std::string> LeadsTo;

        std::string DisplayName;
        std::string FileName;
        std::string ID;
        std::string Lineage;
        std::string Name;
        std::string Origin;

        Action() = default;

        Action(const std::string& name, const std::shared_ptr<Intent>& intent,
               const std::vector<std::shared_ptr<Condition>>& conditions,
               const std::vector<std::shared_ptr<InfluenceRule>>& influenceRules,
               const std::vector<std::string>& leadsTo)
            : Name(name), Intent(intent), Conditions(conditions), InfluenceRules(influenceRules), LeadsTo(leadsTo) {}

        std::shared_ptr<Action> ShallowCopy() const {
            return std::make_shared<Action>(*this);
        }

        std::shared_ptr<Action> DeepCopy() const {
            auto deepCopy = std::make_shared<Action>(*this);

            if (!Name.empty()) deepCopy->Name = Name;
            if (!DisplayName.empty()) deepCopy->DisplayName = DisplayName;
            if (!FileName.empty()) deepCopy->FileName = FileName;
            if (!Origin.empty()) deepCopy->Origin = Origin;
            if (!Lineage.empty()) deepCopy->Lineage = Lineage;
            if (!ID.empty()) deepCopy->ID = ID;

            if (!Conditions.empty()) {
                deepCopy->Conditions.clear();
                std::transform(Conditions.begin(), Conditions.end(), std::back_inserter(deepCopy->Conditions),
                               [](const std::shared_ptr<Condition>& condition) { return condition->DeepCopy(); });
            }

            if (!Effects.empty()) {
                deepCopy->Effects.clear();
                std::transform(Effects.begin(), Effects.end(), std::back_inserter(deepCopy->Effects),
                               [](const std::shared_ptr<Effect>& effect) { return effect->DeepCopy(); });
            }

            if (!LeadsTo.empty()) {
                deepCopy->LeadsTo = LeadsTo;
            }

            if (!InfluenceRules.empty()) {
                deepCopy->InfluenceRules.clear();
                std::transform(InfluenceRules.begin(), InfluenceRules.end(), std::back_inserter(deepCopy->InfluenceRules),
                               [](const std::shared_ptr<InfluenceRule>& rule) { return rule->DeepCopy(); });
            }

            if (!GoodBindings.empty()) {
                deepCopy->GoodBindings.clear();
                std::transform(GoodBindings.begin(), GoodBindings.end(), std::back_inserter(deepCopy->GoodBindings),
                               [](const std::shared_ptr<Binding>& binding) { return binding->DeepCopy(); });
            }

            if (!Actions.empty()) {
                deepCopy->Actions.clear();
                std::transform(Actions.begin(), Actions.end(), std::back_inserter(deepCopy->Actions),
                               [](const std::shared_ptr<Action>& action) { return action->DeepCopy(); });
            }

            return deepCopy;
        }

        std::string ToString() const {
            std::string str = "name: " + Name + "\n";

            if (Salience) str += "salience: " + std::to_string(*Salience) + "\n";
            if (Weight) str += "weight: " + std::to_string(*Weight) + "\n";

            for (const auto& condition : Conditions) {
                str += "condition: " + condition->ToString() + "\n";
            }

            for (const auto& effect : Effects) {
                str += "effect: " + effect->ToString() + "\n";
            }

            for (const auto& binding : GoodBindings) {
                str += "good binding: " + binding->ToString() + "\n";
            }

            return str;
        }
    };

}
