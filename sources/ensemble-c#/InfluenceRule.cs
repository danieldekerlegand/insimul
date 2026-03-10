#include <string>
#include <vector>
#include <memory>
#include <algorithm>

namespace Ensemble
{
    class Condition
    {
    public:
        virtual std::unique_ptr<Condition> DeepCopy() const = 0;
        virtual ~Condition() = default;
    };

    class InfluenceRule
    {
    public:
        std::string Name;
        std::vector<std::unique_ptr<Condition>> Conditions;
        int Weight;

        // Shallow copy
        std::unique_ptr<InfluenceRule> ShallowCopy() const
        {
            auto copy = std::make_unique<InfluenceRule>();
            copy->Name = Name;
            copy->Conditions = Conditions; // Shallow copy of the vector
            copy->Weight = Weight;
            return copy;
        }

        // Deep copy
        std::unique_ptr<InfluenceRule> DeepCopy() const
        {
            auto copy = std::make_unique<InfluenceRule>();
            copy->Name = Name;
            copy->Weight = Weight;

            // Deep copy of the Conditions vector
            copy->Conditions.reserve(Conditions.size());
            for (const auto& condition : Conditions)
            {
                copy->Conditions.push_back(condition->DeepCopy());
            }

            return copy;
        }
    };
}
