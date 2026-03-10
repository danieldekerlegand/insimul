#include <string>
#include <vector>
#include <functional>

namespace Ensemble
{
    class ActionsFile
    {
    public:
        std::string fileName;
        std::vector<std::function<void()>> actions;
    };
}
