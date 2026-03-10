#include <string>
#include <unordered_map>
#include <vector>

namespace Ensemble
{
    class Predicate
    {
        // Define the Predicate class here as needed
    };

    class VolitionSetFile : public std::unordered_map<std::string, std::unordered_map<std::string, std::vector<Predicate>>>
    {
    };
}
