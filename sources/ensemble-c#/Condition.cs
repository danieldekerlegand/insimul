#include <string>
#include <vector>
#include <optional>

namespace Ensemble
{
    class Predicate
    {
    public:
        Predicate() {}
        Predicate(const std::string& category, const std::string& type) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, int value) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, bool value) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::vector<std::string>& turnsAgoBetween) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, bool value, const std::vector<std::string>& turnsAgoBetween) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, bool intentType) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value, const std::vector<std::string>& turnsAgoBetween) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::vector<std::string>& turnsAgoBetween, int order) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::string& operation, int value, const std::vector<std::string>& turnsAgoBetween, int order) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, const std::string& operation) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::string& operation, int value, int order, const std::vector<std::string>& turnsAgoBetween) {}

        virtual Predicate* DeepCopy() const
        {
            return new Predicate(*this);
        }
    };

    class Condition : public Predicate
    {
    public:
        std::optional<int> Order;

        Condition() {}
        Condition(const std::string& category, const std::string& type) : Predicate(category, type) {}
        Condition(const std::string& category, const std::string& type, const std::string& first) : Predicate(category, type, first) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, int value) : Predicate(category, type, first, value) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, bool value) : Predicate(category, type, first, value) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::vector<std::string>& turnsAgoBetween) : Predicate(category, type, first, turnsAgoBetween) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, bool value, const std::vector<std::string>& turnsAgoBetween) : Predicate(category, type, first, value, turnsAgoBetween) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second) : Predicate(category, type, first, second) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value) : Predicate(category, type, first, second, value) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value) : Predicate(category, type, first, second, value) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, bool intentType) : Predicate(category, type, first, second, value, intentType) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value, const std::vector<std::string>& turnsAgoBetween) : Predicate(category, type, first, second, value, turnsAgoBetween) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::vector<std::string>& turnsAgoBetween, int order) : Predicate(category, type, first, second, turnsAgoBetween, order) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::string& operation, int value, const std::vector<std::string>& turnsAgoBetween, int order) : Predicate(category, type, first, second, operation, value, turnsAgoBetween, order) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, const std::string& operation) : Predicate(category, type, first, second, value, operation) {}
        Condition(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::string& operation, int value, int order, const std::vector<std::string>& turnsAgoBetween) : Predicate(category, type, first, second, operation, value, turnsAgoBetween, order) {}

        Condition* DeepCopy() const override
        {
            return new Condition(*this);
        }
    };
}
