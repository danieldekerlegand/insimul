#include <iostream>
#include <unordered_map>
#include <string>

namespace Ensemble
{
    class Util
    {
    private:
        std::unordered_map<std::string, long> iteratorMap;

    public:
        Util()
        {
            iteratorMap = std::unordered_map<std::string, long>();
        }

        long iterator(const std::string& value)
        {
            if (iteratorMap.find(value) != iteratorMap.end())
            {
                iteratorMap[value] += 1;
                return iteratorMap[value];
            }
            else
            {
                iteratorMap[value] = 1;
                return iteratorMap[value];
            }
        }

        void resetIterator(const std::string& value)
        {
            iteratorMap[value] = 0;
        }
    };
}
