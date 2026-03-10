#include <string>
#include <unordered_map>
#include <functional>

namespace Ensemble
{
    class SocialStructure : public std::unordered_map<std::string, std::unordered_map<std::string, std::function<bool()>>>
    {
    };
}
