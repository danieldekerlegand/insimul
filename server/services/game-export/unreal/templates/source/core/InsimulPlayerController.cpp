#include "InsimulPlayerController.h"
#include "UI/InsimulHUDWidget.h"
#include "UI/InsimulPauseMenuWidget.h"
#include "Characters/PlayerCharacter.h"
#include "Blueprint/UserWidget.h"

void AInsimulPlayerController::BeginPlay()
{
    Super::BeginPlay();
    CreateHUD();
    CreatePauseMenu();
}

void AInsimulPlayerController::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    if (!HUDWidget) return;

    // Push player stats to HUD each frame
    APlayerCharacter* PC = Cast<APlayerCharacter>(GetPawn());
    if (PC)
    {
        HUDWidget->UpdateHealth(PC->Health, PC->MaxHealth);
        HUDWidget->UpdateEnergy(PC->Energy, {{PLAYER_MAX_ENERGY}}.f);
        HUDWidget->UpdateGold(PC->Gold);
    }

    // Update compass from camera yaw
    if (PlayerCameraManager)
    {
        float Yaw = PlayerCameraManager->GetCameraRotation().Yaw;
        HUDWidget->UpdateCompassHeading(Yaw);
    }
}

void AInsimulPlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();

    // Bind Escape / gamepad Start to toggle pause menu
    InputComponent->BindAction("PauseMenu", IE_Pressed, this, &AInsimulPlayerController::TogglePauseMenu);
}

void AInsimulPlayerController::CreateHUD()
{
    if (HUDWidget) return;

    HUDWidget = CreateWidget<UInsimulHUDWidget>(this, UInsimulHUDWidget::StaticClass());
    if (HUDWidget)
    {
        HUDWidget->AddToViewport(0);
        HUDWidget->InitializeHUD({{SHOW_HEALTH_BAR}}, {{SHOW_STAMINA_BAR}}, {{SHOW_COMPASS}}, {{HAS_SURVIVAL}});
    }
}

void AInsimulPlayerController::CreatePauseMenu()
{
    if (PauseMenuWidget) return;

    PauseMenuWidget = CreateWidget<UInsimulPauseMenuWidget>(this, UInsimulPauseMenuWidget::StaticClass());
    if (PauseMenuWidget)
    {
        PauseMenuWidget->AddToViewport(100);
    }
}

void AInsimulPlayerController::TogglePauseMenu()
{
    if (PauseMenuWidget)
    {
        PauseMenuWidget->TogglePauseMenu();
    }
}
