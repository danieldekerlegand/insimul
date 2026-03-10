#include <functional>

namespace Ensemble
{
    class TerminalSearchResults
    {
    public:
        bool TerminalsAtThisLevel;
        std::function<void()> BoundTerminal;
    };
}
