#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>

namespace Ensemble
{
    class Predicate
    {
        // Define the Predicate class as needed.
    };

    class VolitionSet
    {
    public:
        std::unordered_map<std::string, std::unordered_map<std::string, std::vector<Predicate>>> set;

        VolitionSet()
        {
            set = {};
        }

        VolitionSet(const std::unordered_map<std::string, std::unordered_map<std::string, std::vector<Predicate>>>& set)
        {
            this->set = set;
        }

        std::vector<std::string> getCharacters()
        {
            std::vector<std::string> keys;
            for (const auto& pair : set)
            {
                keys.push_back(pair.first);
            }
            return keys;
        }

        std::vector<Predicate>* getVolitionsForCharacterSet(const std::string& from, const std::string& to)
        {
            if (set.find(from) == set.end())
            {
                return nullptr;
            }
            else
            {
                if (set[from].find(to) == set[from].end())
                {
                    return nullptr;
                }
                else
                {
                    if (set[from][to].empty())
                    {
                        return nullptr;
                    }

                    return &set[from][to];
                }
            }
        }

        void setVolitionsForCharacterSet(const std::string& from, const std::string& to, const std::vector<Predicate>& volitions)
        {
            set[from][to] = volitions;
        }

        void addVolitionForCharacterSet(const std::string& from, const std::string& to, const Predicate& volition)
        {
            set[from][to].push_back(volition);
        }

        void initVolitionsForCharacterSet(const std::string& from, const std::string& to)
        {
            if (set.find(from) == set.end())
            {
                set[from] = {};
            }

            set[from][to] = {};
        }
    };
}
