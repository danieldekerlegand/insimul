#include <string>
#include <vector>

namespace Ensemble
{
    class Rule; // Forward declaration of Rule class

    class TriggerRulesFile
    {
    public:
        std::string fileName;
        std::string type;
        std::vector<Rule> rules;
        std::vector<Rule> inactiveRules;
    };
}
