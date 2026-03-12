// Copyright Insimul. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "InsimulTypes.h"
#include "InsimulSubsystem.generated.h"

class UInsimulHttpClient;

/**
 * UInsimulSubsystem — GameInstanceSubsystem that manages the connection
 * to the Insimul conversation service. Persists across level loads.
 *
 * Configure via the Details panel or at runtime with SetConfig().
 */
UCLASS()
class INSIMUL_API UInsimulSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    // ── USubsystem interface ──────────────────────────────────────────────

    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    // ── Configuration ─────────────────────────────────────────────────────

    /** Set the server connection configuration at runtime */
    UFUNCTION(BlueprintCallable, Category = "Insimul")
    void SetConfig(const FInsimulConfig& InConfig);

    /** Get the current configuration */
    UFUNCTION(BlueprintPure, Category = "Insimul")
    FInsimulConfig GetConfig() const { return Config; }

    // ── Session Management ────────────────────────────────────────────────

    /** Generate a new unique session ID */
    UFUNCTION(BlueprintCallable, Category = "Insimul")
    FString CreateSessionId();

    // ── HTTP Client Access ────────────────────────────────────────────────

    /** Get the shared HTTP client instance (creates one if needed) */
    UFUNCTION(BlueprintPure, Category = "Insimul")
    UInsimulHttpClient* GetHttpClient();

    // ── Configuration (Details Panel) ─────────────────────────────────────

    /** Server connection configuration (editable in DefaultGame.ini) */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Configuration")
    FInsimulConfig Config;

private:
    UPROPERTY()
    TObjectPtr<UInsimulHttpClient> HttpClient;

    int32 SessionCounter = 0;
};
