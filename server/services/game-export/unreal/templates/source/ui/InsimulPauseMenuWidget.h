#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "InsimulPauseMenuWidget.generated.h"

/**
 * Pause Menu Widget — auto-generated from WorldIR pause menu configuration.
 * Provides Resume, Save Game, Load Game, Settings, and Quit to Main Menu.
 * Save/Load uses UInsimulSaveGame with multiple named slots.
 */
UCLASS()
class INSIMULEXPORT_API UInsimulPauseMenuWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    virtual void NativeConstruct() override;

    /** Toggle the pause menu on/off. Returns true if now visible. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PauseMenu")
    bool TogglePauseMenu();

    /** Force-close the pause menu and unpause */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PauseMenu")
    void ClosePauseMenu();

    /** Number of save slots available */
    UPROPERTY(EditDefaultsOnly, Category = "Insimul|PauseMenu")
    int32 MaxSaveSlots = {{MAX_SAVE_SLOTS}};

protected:
    UFUNCTION() void OnResumeClicked();
    UFUNCTION() void OnSaveGameClicked();
    UFUNCTION() void OnLoadGameClicked();
    UFUNCTION() void OnSettingsClicked();
    UFUNCTION() void OnQuitToMenuClicked();
    UFUNCTION() void OnSaveSlotClicked(int32 SlotIndex);
    UFUNCTION() void OnLoadSlotClicked(int32 SlotIndex);
    UFUNCTION() void OnSaveLoadBackClicked();

private:
    void BuildMainPanel();
    void BuildSaveLoadPanel(bool bIsSaveMode);
    void ShowMainPanel();
    void ShowSaveLoadPanel();
    void SetPaused(bool bPause);

    class UButton* CreateMenuButton(const FString& Label, class UVerticalBox* Parent);

    UPROPERTY() class UCanvasPanel* RootCanvas = nullptr;
    UPROPERTY() class UVerticalBox* MainPanel = nullptr;
    UPROPERTY() class UVerticalBox* SaveLoadPanel = nullptr;
    UPROPERTY() class UTextBlock* SaveLoadTitle = nullptr;

    bool bCurrentlySaveMode = true;
};
