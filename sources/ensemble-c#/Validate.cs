#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>

/**
 * This is the class Validate, for verification of predicates and other data.
 *
 */

namespace Ensemble
{
    class Validate
    {
    private:
        std::vector<std::string> allowedDirTypes = { "directed", "undirected", "reciprocal" };
        std::vector<std::string> allowedOpsConditions = { ">", "<", "=" };
        std::vector<std::string> allowedOpsEffects = { "+", "-", "=" };
        std::vector<std::string> allowedTurnConstants = { "now", "start" };

        void* socialStructure = nullptr;

    public:
        void registerSocialStructure(void* ss)
        {
            socialStructure = ss;
        }

        Predicate triggerCondition(Predicate pred)
        {
            checkPredicate(pred, "condition", "trigger", "");
            return pred;
        }

        Predicate triggerCondition(Predicate pred, const std::string& preamble)
        {
            checkPredicate(pred, "condition", "trigger", preamble);
            return pred;
        }

        Predicate triggerEffect(Predicate pred)
        {
            checkPredicate(pred, "effect", "trigger", "");
            return pred;
        }

        Predicate triggerEffect(Predicate pred, const std::string& preamble)
        {
            checkPredicate(pred, "effect", "trigger", preamble);
            return pred;
        }

        Predicate volitionCondition(Predicate pred, const std::string& preamble)
        {
            checkPredicate(pred, "condition", "volition", preamble);
            return pred;
        }

        Predicate volitionEffect(Predicate pred, const std::string& preamble)
        {
            checkPredicate(pred, "effect", "volition", preamble);
            return pred;
        }

        Predicate blueprint(Predicate pred, const std::string& preamble)
        {
            checkPredicate(pred, "blueprint", "", preamble);
            return pred;
        }

        Rule rule(Rule rule)
        {
            bool isVolition = rule.Effects[0].Weight != nullptr;

            try
            {
                for (auto& effect : rule.Effects)
                {
                    if (isVolition)
                    {
                        volitionEffect(effect, "Volition Rule Effect #");
                    }
                    else
                    {
                        triggerEffect(effect, "Trigger Rule Effect #");
                    }
                }

                for (auto& condition : rule.Conditions)
                {
                    if (isVolition)
                    {
                        volitionCondition(condition, "Volition Rule Effect #");
                    }
                    else
                    {
                        triggerCondition(condition, "Trigger Rule Effect #");
                    }
                }
            }
            catch (const std::exception& e)
            {
                throw e;
            }

            return rule;
        }

        Action action(Action pred, const std::string& preamble)
        {
            // TODO: validate
            return pred;
        }

        bool checkPredicate(Predicate pred, const std::string& type, const std::string& category, const std::string& preamble)
        {
            bool result = isPredBad(pred, type, category);
            if (result)
            {
                throw std::runtime_error(preamble + " and found a malformed predicate.");
            }
            return result;
        }

        // TODO: Finish translating isPredBad
        bool isPredBad(Predicate pred, const std::string& type, const std::string& category)
        {
            return false;
        }
    };
}
