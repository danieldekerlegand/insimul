#include <iostream>
#include <unordered_map>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>

class Predicate {
public:
    std::string Category;
    std::string Type;
    bool IntentType;
    int Weight;

    Predicate(std::string category, std::string type, bool intentType, int weight)
        : Category(category), Type(type), IntentType(intentType), Weight(weight) {}
};

class VolitionAcceptance {
public:
    bool Accepted;
    int Weight;
    std::vector<std::shared_ptr<Predicate>> ReasonsWhy;

    VolitionAcceptance() : Accepted(true), Weight(0) {}
};

class VolitionSet {
private:
    std::unordered_map<std::string, std::unordered_map<std::string, std::vector<std::shared_ptr<Predicate>>>> volitions;

public:
    void initVolitionsForCharacterSet(const std::string& from, const std::string& to) {
        volitions[from][to] = {};
    }

    std::vector<std::shared_ptr<Predicate>> getVolitionsForCharacterSet(const std::string& from, const std::string& to) {
        return volitions[from][to];
    }

    void setVolitionsForCharacterSet(const std::string& from, const std::string& to, const std::vector<std::shared_ptr<Predicate>>& sortedVolitions) {
        volitions[from][to] = sortedVolitions;
    }

    std::vector<std::string> getCharacters() {
        std::vector<std::string> characters;
        for (const auto& pair : volitions) {
            characters.push_back(pair.first);
        }
        return characters;
    }
};

class VolitionInterface {
private:
    std::string key;
    class VolitionCache* cache;

public:
    VolitionInterface(const std::string& key, class VolitionCache* cache) : key(key), cache(cache) {}
};

class VolitionCache {
private:
    std::unordered_map<std::string, std::shared_ptr<VolitionSet>> volitionCache;
    std::unordered_map<std::string, int> cachePositions;

public:
    std::shared_ptr<Predicate> getFirstVolition(const std::string& key, const std::string& from, const std::string& to) {
        auto vSet = volitionCache[key];
        if (!vSet) {
            return nullptr;
        }

        auto volitionsForCharacterSet = vSet->getVolitionsForCharacterSet(from, to);
        if (volitionsForCharacterSet.empty()) {
            return nullptr;
        }

        std::string cachePositionsKey = key + from + to;
        cachePositions[cachePositionsKey] = 0;

        return volitionsForCharacterSet[0];
    }

    std::shared_ptr<Predicate> getNextVolition(const std::string& key, const std::string& from, const std::string& to) {
        std::string cachePositionsKey = key + from + to;
        auto vSet = volitionCache[key];

        if (cachePositions.find(cachePositionsKey) == cachePositions.end()) {
            return getFirstVolition(key, from, to);
        }

        int pos = cachePositions[cachePositionsKey];
        auto volitionsForCharacterSet = vSet->getVolitionsForCharacterSet(from, to);

        if (volitionsForCharacterSet.empty() || pos + 1 >= volitionsForCharacterSet.size()) {
            return nullptr;
        }

        cachePositions[cachePositionsKey] = pos + 1;
        return volitionsForCharacterSet[pos + 1];
    }

    bool isVolitionMatch(const std::shared_ptr<Predicate>& a, const std::shared_ptr<Predicate>& b) {
        return a->Category == b->Category && a->Type == b->Type && a->IntentType == b->IntentType;
    }

    VolitionAcceptance isAccepted(const std::string& key, const std::string& initiator, const std::string& responder, const std::shared_ptr<Predicate>& predicate) {
        bool acceptIfNoMatch = true;
        int minimumWeightForAccept = 0;

        VolitionAcceptance returnObject;
        returnObject.Accepted = acceptIfNoMatch;

        auto thisV = getFirstVolition(key, responder, initiator);

        while (thisV) {
            if (isVolitionMatch(thisV, predicate)) {
                returnObject.Weight = thisV->Weight;
                if (thisV->Weight < minimumWeightForAccept) {
                    returnObject.ReasonsWhy.push_back(thisV);
                    returnObject.Accepted = false;
                    return returnObject;
                } else {
                    returnObject.ReasonsWhy.push_back(thisV);
                    returnObject.Accepted = true;
                    return returnObject;
                }
            }

            thisV = getNextVolition(key, responder, initiator);
        }

        return returnObject;
    }

    void sortSet(std::shared_ptr<VolitionSet> unsortedSet) {
        auto characters = unsortedSet->getCharacters();

        for (const auto& from : characters) {
            for (const auto& to : characters) {
                auto unsortedVolitions = unsortedSet->getVolitionsForCharacterSet(from, to);

                if (!unsortedVolitions.empty()) {
                    std::sort(unsortedVolitions.begin(), unsortedVolitions.end(), [](const std::shared_ptr<Predicate>& a, const std::shared_ptr<Predicate>& b) {
                        return a->Weight > b->Weight;
                    });

                    unsortedSet->setVolitionsForCharacterSet(from, to, unsortedVolitions);
                }
            }
        }
    }

    VolitionInterface registerSet(const std::string& key, std::shared_ptr<VolitionSet> volitionSet) {
        sortSet(volitionSet);

        volitionCache[key] = volitionSet;
        return VolitionInterface(key, this);
    }

    std::shared_ptr<VolitionSet> newSet(const std::vector<std::string>& cast) {
        auto newSet = std::make_shared<VolitionSet>();

        for (const auto& from : cast) {
            for (const auto& to : cast) {
                newSet->initVolitionsForCharacterSet(from, to);
            }
        }

        return newSet;
    }

    std::vector<std::shared_ptr<Predicate>> getAllVolitionsByKeyFromTo(const std::string& key, const std::string& from, const std::string& to) {
        return volitionCache[key]->getVolitionsForCharacterSet(from, to);
    }
};
