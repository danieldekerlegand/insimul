#include <vector>

namespace Ensemble
{
    class Predicate; // Forward declaration of Predicate class

    class SchemaFile
    {
    public:
        std::vector<Predicate> schema;
    };
}
