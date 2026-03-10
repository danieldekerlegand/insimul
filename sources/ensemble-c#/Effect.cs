#include <string>
#include <vector>

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
        Predicate(const std::string& category, const std::string& type, const std::string& first, bool value, const std::vector<std::string>& turnsAgoBetween) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, bool intentType) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::vector<std::string>& turnsAgoBetween, int order) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::string& operation, int value, const std::vector<std::string>& turnsAgoBetween, int order) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value, const std::vector<std::string>& turnsAgoBetween) {}
        Predicate(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, const std::string& operation) {}

        virtual Predicate* DeepCopy() const
        {
            return new Predicate(*this);
        }
    };

    class Effect : public Predicate
    {
    public:
        Effect() : Predicate() {}
        Effect(const std::string& category, const std::string& type) : Predicate(category, type) {}
        Effect(const std::string& category, const std::string& type, const std::string& first) : Predicate(category, type, first) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, int value) : Predicate(category, type, first, value) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, bool value) : Predicate(category, type, first, value) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, bool value, const std::vector<std::string>& turnsAgoBetween) : Predicate(category, type, first, value, turnsAgoBetween) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, const std::string& second) : Predicate(category, type, first, second) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value) : Predicate(category, type, first, second, value) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value) : Predicate(category, type, first, second, value) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, bool intentType) : Predicate(category, type, first, second, value, intentType) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::vector<std::string>& turnsAgoBetween, int order) : Predicate(category, type, first, second, turnsAgoBetween, order) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, const std::string& second, const std::string& operation, int value, const std::vector<std::string>& turnsAgoBetween, int order) : Predicate(category, type, first, second, operation, value, turnsAgoBetween, order) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, const std::string& second, bool value, const std::vector<std::string>& turnsAgoBetween) : Predicate(category, type, first, second, value, turnsAgoBetween) {}
        Effect(const std::string& category, const std::string& type, const std::string& first, const std::string& second, int value, const std::string& operation) : Predicate(category, type, first, second, value, operation) {}

        Effect* DeepCopy() const override
        {
            return new Effect(*this);
        }
    };
}
