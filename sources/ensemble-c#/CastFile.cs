#include <string>
#include <unordered_map>

namespace Ensemble
{
    class CastFile
    {
    public:
        std::unordered_map<std::string, std::unordered_map<std::string, std::string>> cast;
    };
}
