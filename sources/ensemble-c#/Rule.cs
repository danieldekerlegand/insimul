#include <string>
#include <vector>
#include <memory>
#include <algorithm>
#include <sstream>

class Condition {
public:
    virtual std::shared_ptr<Condition> DeepCopy() const = 0;
    virtual std::string ToString() const = 0;
    virtual ~Condition() = default;
};

class Effect {
public:
    virtual std::shared_ptr<Effect> DeepCopy() const = 0;
    virtual std::string ToString() const = 0;
    virtual ~Effect() = default;
};

class Rule {
public:
    std::string Name;
    std::string ID;
    std::string Origin;
    bool IsActive;
    std::string Msg;

    std::vector<std::shared_ptr<Condition>> Conditions;
    std::vector<std::shared_ptr<Effect>> Effects;

    // Shallow copy
    std::shared_ptr<Rule> ShallowCopy() const {
        return std::make_shared<Rule>(*this);
    }

    // Deep copy
    std::shared_ptr<Rule> DeepCopy() const {
        auto deepCopy = std::make_shared<Rule>(*this);

        if (!Name.empty()) {
            deepCopy->Name = Name;
        }

        if (!ID.empty()) {
            deepCopy->ID = ID;
        }

        if (!Origin.empty()) {
            deepCopy->Origin = Origin;
        }

        if (!Msg.empty()) {
            deepCopy->Msg = Msg;
        }

        if (!Conditions.empty()) {
            deepCopy->Conditions.clear();
            std::transform(Conditions.begin(), Conditions.end(), std::back_inserter(deepCopy->Conditions),
                           [](const std::shared_ptr<Condition>& condition) {
                               return condition->DeepCopy();
                           });
        }

        if (!Effects.empty()) {
            deepCopy->Effects.clear();
            std::transform(Effects.begin(), Effects.end(), std::back_inserter(deepCopy->Effects),
                           [](const std::shared_ptr<Effect>& effect) {
                               return effect->DeepCopy();
                           });
        }

        return deepCopy;
    }

    // ToString equivalent
    std::string ToString() const {
        std::ostringstream str;
        str << "name: " << Name << "\n";

        for (const auto& condition : Conditions) {
            str << "condition: " << condition->ToString() << "\n";
        }

        for (const auto& effect : Effects) {
            str << "effect: " << effect->ToString() << "\n";
        }

        return str.str();
    }
};
