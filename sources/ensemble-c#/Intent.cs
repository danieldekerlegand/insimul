#include <iostream>
#include <string>

class Intent {
public:
    std::string Category;
    std::string Type;
    bool IntentType;
    std::string First;
    std::string Second;

    Intent(const std::string& category, const std::string& type, bool intentType, const std::string& first, const std::string& second)
        : Category(category), Type(type), IntentType(intentType), First(first), Second(second) {}

    std::string ToString() const {
        std::string predToString;

        if (!Category.empty()) { predToString += "Category: " + Category; }
        if (!Type.empty()) { predToString += (!predToString.empty() ? ", " : "") + std::string("Type: ") + Type; }
        predToString += (!predToString.empty() ? ", " : "") + std::string("IntentType: ") + (IntentType ? "true" : "false");
        if (!First.empty()) { predToString += (!predToString.empty() ? ", " : "") + std::string("First: ") + First; }
        if (!Second.empty()) { predToString += (!predToString.empty() ? ", " : "") + std::string("Second: ") + Second; }

        return predToString;
    }
};

int main() {
    Intent intent("Category1", "Type1", true, "FirstValue", "SecondValue");
    std::cout << intent.ToString() << std::endl;
    return 0;
}
