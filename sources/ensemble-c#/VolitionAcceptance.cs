#include <iostream>
#include <vector>
#include <memory>

namespace Ensemble
{
    class Predicate
    {
        // Define the Predicate class as needed
    };

    class VolitionAcceptance
    {
    public:
        bool Accepted;
        std::optional<int> Weight;
        std::vector<std::shared_ptr<Predicate>> ReasonsWhy;

        VolitionAcceptance()
            : Accepted(false), Weight(std::nullopt), ReasonsWhy() {}
    };
}
