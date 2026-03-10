#include <string>
#include <memory>

class EnglishData {
public:
    std::string EnglishRule;
    std::string RuleName;
    int Weight;
    std::string Origin;

    // Shallow copy
    std::shared_ptr<EnglishData> ShallowCopy() const {
        return std::make_shared<EnglishData>(*this);
    }

    // Deep copy
    std::shared_ptr<EnglishData> DeepCopy() const {
        auto deepCopy = std::make_shared<EnglishData>(*this);
        deepCopy->EnglishRule = EnglishRule;
        deepCopy->RuleName = RuleName;
        deepCopy->Origin = Origin;
        return deepCopy;
    }
};
