#include <vector>

namespace Ensemble
{
    class History; // Forward declaration of the History class

    class HistoryFile
    {
    public:
        std::vector<History> history;
    };
}
