#include <iostream>
#include <unordered_map>
#include <string>
#include <sstream>
#include <memory>

namespace Ensemble
{
    class Binding : public std::unordered_map<std::string, std::string>
    {
    private:
        std::optional<int> _Weight;

    public:
        // Getter and Setter for _Weight
        std::optional<int> getWeight() const { return _Weight; }
        void setWeight(std::optional<int> weight) { _Weight = weight; }

        // DeepCopy method
        std::shared_ptr<Binding> DeepCopy() const
        {
            auto deepCopy = std::make_shared<Binding>(*this);
            return deepCopy;
        }

        // ToString method
        std::string ToString() const
        {
            std::ostringstream value;

            for (const auto& kvp : *this)
            {
                value << kvp.first << ": " << kvp.second << ", ";
            }

            if (_Weight.has_value())
            {
                value << "_Weight: " << _Weight.value() << ", ";
            }

            return value.str();
        }
    };
}
