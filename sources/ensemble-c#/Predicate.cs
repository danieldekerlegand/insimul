#include <string>
#include <vector>
#include <memory>
#include <algorithm>
#include <optional>
#include <iostream>

class Condition {
public:
    std::shared_ptr<Condition> DeepCopy() const {
        return std::make_shared<Condition>(*this);
    }
};

class Effect {
public:
    std::shared_ptr<Effect> DeepCopy() const {
        return std::make_shared<Effect>(*this);
    }
};

class EnglishData {
public:
    std::shared_ptr<EnglishData> DeepCopy() const {
        return std::make_shared<EnglishData>(*this);
    }
};

class Predicate {
public:
    std::optional<bool> IsBoolean;
    std::optional<bool> CloneEachTimeStep;
    std::optional<bool> Active;
    bool Actionable = false;

    std::string Operator;

    std::optional<int> DefaultValue;
    std::optional<int> Value;
    std::optional<bool> IntentType;

    std::optional<int> MinValue;
    std::optional<int> MaxValue;
    std::optional<int> Duration;
    std::optional<int> Weight;
    std::optional<int> Order;
    int TimeHappened = 0;

    std::vector<std::shared_ptr<Condition>> Conditions;
    std::vector<std::shared_ptr<Effect>> Effects;
    std::vector<std::shared_ptr<EnglishData>> EnglishInfluences;

    std::vector<std::string> Labels;
    std::vector<std::string> TurnsAgoBetween;
    std::vector<std::string> Types;

    std::string Category;
    std::string Direction;
    std::string DirectionType;
    std::string First;
    std::string ID;
    std::string Name;
    std::string Origin;
    std::string Second;
    std::string Type;

    Predicate() = default;

    Predicate(const std::string& category, const std::string& type) {
        setPredicate(category, type, "", "", "", std::nullopt, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first) {
        setPredicate(category, type, first, "", "", std::nullopt, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, int value) {
        setPredicate(category, type, first, "", "", value, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, bool value) {
        setPredicate(category, type, first, "", "", value ? 1 : 0, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::vector<std::string>& turnsAgoBetween) {
        setPredicate(category, type, first, "", "", std::nullopt, turnsAgoBetween, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, bool value, const std::vector<std::string>& turnsAgoBetween) {
        setPredicate(category, type, first, "", "", value ? 1 : 0, turnsAgoBetween, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, int value, const std::string& operation) {
        setPredicate(category, type, first, "", operation, value, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, int value, bool intentType) {
        setPredicate(category, type, first, "", "", value, {}, std::nullopt, intentType);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second) {
        setPredicate(category, type, first, second, "", std::nullopt, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value) {
        setPredicate(category, type, first, second, "", value, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, bool intentType) {
        setPredicate(category, type, first, second, "", value, {}, std::nullopt, intentType);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value) {
        setPredicate(category, type, first, second, "", value ? 1 : 0, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value, const std::vector<std::string>& turnsAgoBetween) {
        setPredicate(category, type, first, second, "", value ? 1 : 0, turnsAgoBetween, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::vector<std::string>& turnsAgoBetween, int order) {
        setPredicate(category, type, first, second, "", std::nullopt, turnsAgoBetween, order, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, const std::string& operation) {
        setPredicate(category, type, first, second, operation, value, {}, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, const std::string& operation, const std::vector<std::string>& turnsAgoBetween) {
        setPredicate(category, type, first, second, operation, value, turnsAgoBetween, std::nullopt, std::nullopt);
    }

    Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::string& operation, int value, const std::vector<std::string>& turnsAgoBetween, int order) {
        setPredicate(category, type, first, second, operation, value, turnsAgoBetween, order, std::nullopt);
    }

    std::shared_ptr<Predicate> ShallowCopy() const {
        return std::make_shared<Predicate>(*this);
    }

    std::shared_ptr<Predicate> DeepCopy() const {
        auto deepCopy = std::make_shared<Predicate>(*this);

        if (!Category.empty()) deepCopy->Category = Category;
        if (!DirectionType.empty()) deepCopy->DirectionType = DirectionType;
        if (!Type.empty()) deepCopy->Type = Type;
        if (!First.empty()) deepCopy->First = First;
        if (!Second.empty()) deepCopy->Second = Second;
        if (!Origin.empty()) deepCopy->Origin = Origin;
        if (!ID.empty()) deepCopy->ID = ID;
        if (!Name.empty()) deepCopy->Name = Name;

        if (!Types.empty()) {
            deepCopy->Types = Types;
        }

        if (!Conditions.empty()) {
            deepCopy->Conditions.clear();
            for (const auto& condition : Conditions) {
                deepCopy->Conditions.push_back(condition->DeepCopy());
            }
        }

        if (!Effects.empty()) {
            deepCopy->Effects.clear();
            for (const auto& effect : Effects) {
                deepCopy->Effects.push_back(effect->DeepCopy());
            }
        }

        if (!EnglishInfluences.empty()) {
            deepCopy->EnglishInfluences.clear();
            for (const auto& influence : EnglishInfluences) {
                deepCopy->EnglishInfluences.push_back(influence->DeepCopy());
            }
        }

        if (!TurnsAgoBetween.empty()) {
            deepCopy->TurnsAgoBetween = TurnsAgoBetween;
        }

        return deepCopy;
    }

    bool Equals(const Predicate& other) const {
        return Category == other.Category &&
               Type == other.Type &&
               First == other.First &&
               Second == other.Second &&
               Operator == other.Operator &&
               Value == other.Value &&
               IsBoolean == other.IsBoolean &&
               Order == other.Order &&
               TurnsAgoBetween == other.TurnsAgoBetween &&
               IntentType == other.IntentType &&
               CloneEachTimeStep == other.CloneEachTimeStep &&
               Active == other.Active &&
               MinValue == other.MinValue &&
               MaxValue == other.MaxValue &&
               Duration == other.Duration &&
               Weight == other.Weight;
    }

    bool ExistingPredicate(const Predicate& other) const {
        return Category == other.Category &&
               Type == other.Type &&
               First == other.First &&
               Second == other.Second;
    }

    std::string ToString() const {
        std::string predToString;

        if (!Category.empty()) predToString += "Category: " + Category;
        if (!Type.empty()) predToString += ", Type: " + Type;
        if (Value) predToString += ", Value: " + std::to_string(Value.value());
        if (IsBoolean) predToString += ", IsBoolean: " + std::to_string(IsBoolean.value());
        if (!First.empty()) predToString += ", First: " + First;
        if (!Second.empty()) predToString += ", Second: " + Second;
        if (Duration) predToString += ", Duration: " + std::to_string(Duration.value());
        if (!Operator.empty()) predToString += ", Operator: " + Operator;
        if (Weight) predToString += ", Weight: " + std::to_string(Weight.value());

        return predToString;
    }

private:
    void setPredicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::string& operation, std::optional<int> value, const std::vector<std::string>& turnsAgoBetween, std::optional<int> order, std::optional<bool> intentType) {
        Category = category;
        Type = type;
        First = first;
        Second = second;
        Operator = operation;

        if (value) {
            Value = value;
            IsBoolean = (value == 1 || value == 0);
        } else {
            Value = std::nullopt;
            IsBoolean = std::nullopt;
        }

        Order = order;
        TurnsAgoBetween = turnsAgoBetween;
        IntentType = intentType;

        CloneEachTimeStep = std::nullopt;
        Active = std::nullopt;
        MinValue = std::nullopt;
        MaxValue = std::nullopt;
        Duration = std::nullopt;
        Weight = std::nullopt;
        Order = std::nullopt;
    }
};
