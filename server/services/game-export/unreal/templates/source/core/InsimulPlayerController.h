#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "InsimulPlayerController.generated.h"

class UInsimulHUDWidget;
class UInsimulPauseMenuWidget;

UCLASS()
class INSIMULEXPORT_API AInsimulPlayerController : public APlayerController
{
    GENERATED_BODY()

public:
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    virtual void SetupInputComponent() override;

    UPROPERTY(BlueprintReadOnly, Category = "HUD")
    UInsimulHUDWidget* HUDWidget = nullptr;

    UPROPERTY(BlueprintReadOnly, Category = "UI")
    UInsimulPauseMenuWidget* PauseMenuWidget = nullptr;

    UFUNCTION(BlueprintCallable, Category = "Insimul|PauseMenu")
    void TogglePauseMenu();

private:
    void CreateHUD();
    void CreatePauseMenu();
};
