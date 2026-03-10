#include <string>
#include <vector>

namespace Ensemble
{
    class Phrase
    {
    public:
        std::string Text;
        std::string Label;
        std::string Meta;
        std::vector<Phrase> Diagram;
    };
}
