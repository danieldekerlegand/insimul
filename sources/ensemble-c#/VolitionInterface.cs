#include <string>
#include <memory>

class Predicate; // Forward declaration
class VolitionCache; // Forward declaration
class VolitionAcceptance; // Forward declaration

class VolitionInterface {
private:
    std::string key;
    std::shared_ptr<VolitionCache> cache;

public:
    VolitionInterface(const std::string& key, std::shared_ptr<VolitionCache> cache)
        : key(key), cache(cache) {}

    std::shared_ptr<Predicate> getFirst(const std::string& first, const std::string& second) {
        return cache->getFirstVolition(key, first, second);
    }

    std::shared_ptr<Predicate> getNext(const std::string& from, const std::string& to) {
        return cache->getNextVolition(key, from, to);
    }

    int getWeight(const std::string& first, const std::string& second, std::shared_ptr<Predicate> pred) {
        // TODO: implement getWeight
        return 1;
    }

    std::shared_ptr<VolitionCache> GetVolitionCache() {
        return cache;
    }

    void dump() {
        // TODO: implement dump
    }

    std::shared_ptr<VolitionAcceptance> isAccepted(const std::string& initiator, const std::string& responder, std::shared_ptr<Predicate> predicate) {
        return cache->isAccepted(key, initiator, responder, predicate);
    }
};
