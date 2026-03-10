#include <string>
#include <vector>

namespace Ensemble
{
    class Rule
    {
        // Assuming Rule is a base class. Add its definition if needed.
    };

    class TriggerRule : public Rule
    {
    public:
        std::vector<std::string> InCharMsgs;
        std::vector<std::string> Explanations;
    };
}
