#include <iostream>
#include <vector>
#include <string>

namespace Ensemble
{
    class Cast : public std::vector<std::string>
    {
    public:
        Cast DeepCopy() const
        {
            Cast copy;
            for (const std::string& character : *this)
            {
                copy.push_back(character);
            }
            return copy;
        }

        std::string ToString() const
        {
            std::string helper;
            for (const auto& character : *this)
            {
                helper += character + "\n";
            }
            return helper;
        }
    };
}
