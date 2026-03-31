#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Components/WidgetSwitcher.h"
#include "InsimulGameMenuWidget.generated.h"

/**
 * Menu tab identifiers matching GameMenuSystem.ts tabs.
 */
/**
 * Menu tab identifiers matching GameMenuSystem.ts MenuTab type.
 */
UENUM(BlueprintType)
enum class EMenuTab : uint8
{
    Character      UMETA(DisplayName = "Character"),
    Rest           UMETA(DisplayName = "Rest"),
    Journal        UMETA(DisplayName = "Journal"),
    Clues          UMETA(DisplayName = "Clues"),
    Quests         UMETA(DisplayName = "Quests"),
    Inventory      UMETA(DisplayName = "Inventory"),
    Crafting       UMETA(DisplayName = "Crafting"),
    Map            UMETA(DisplayName = "Map"),
    Photos         UMETA(DisplayName = "Photos"),
    Vocabulary     UMETA(DisplayName = "Vocabulary"),
    Skills         UMETA(DisplayName = "Skills"),
    Notices        UMETA(DisplayName = "Notices"),
    Contacts       UMETA(DisplayName = "Contacts"),
    Notifications  UMETA(DisplayName = "Notifications"),
    Settings       UMETA(DisplayName = "Settings"),
    SaveLoad       UMETA(DisplayName = "Save/Load"),
    Quit           UMETA(DisplayName = "Quit"),
};

/**
 * Configuration for genre-specific UI panel visibility.
 */
USTRUCT(BlueprintType)
struct FGenreUIConfig
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Menu")
    bool bShowInventory = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Menu")
    bool bShowQuestJournal = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Menu")
    bool bShowMap = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Menu")
    bool bShowSkills = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Menu")
    bool bShowRules = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Menu")
    bool bShowSaveLoad = true;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnMenuOpened);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnMenuClosed);

/**
 * Full game menu widget matching GameMenuSystem.ts.
 *
 * Provides tabbed navigation for inventory, quest journal, map, skills,
 * rules, settings, save/load, and quit. Supports genre-specific panel
 * configuration and optional game pausing.
 */
UCLASS()
class INSIMULEXPORT_API UInsimulGameMenuWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    /** Open the game menu */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Menu")
    void OpenMenu();

    /** Close the game menu */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Menu")
    void CloseMenu();

    /** Switch to a specific tab */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Menu")
    void SwitchTab(EMenuTab Tab);

    /** Get the currently active tab */
    UFUNCTION(BlueprintPure, Category = "Insimul|Menu")
    EMenuTab GetCurrentTab() const { return CurrentTab; }

    /** Whether the menu is currently open */
    UFUNCTION(BlueprintPure, Category = "Insimul|Menu")
    bool IsMenuOpen() const { return bIsOpen; }

    /** Set genre-specific UI configuration to show/hide panels */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Menu")
    void SetGenreConfig(const FGenreUIConfig& Config);

    /** Set the target language for language-learning features */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Menu")
    void SetTargetLanguage(const FString& Language);

    /** Update time display data */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Menu")
    void UpdateTime(const FString& TimeString, int32 Day, const FString& TimeOfDay);

    /** Quick-save the current game state */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Menu")
    void QuickSave();

    /** Quick-load the last saved game state */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Menu")
    void QuickLoad();

    /** Whether opening the menu pauses the game */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Menu")
    bool bPausesGame = true;

    /** Fired when the menu is opened */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Menu")
    FOnMenuOpened OnMenuOpened;

    /** Fired when the menu is closed */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Menu")
    FOnMenuClosed OnMenuClosed;

protected:
    virtual void NativeConstruct() override;

    /** Widget switcher for tab content panels */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<UWidgetSwitcher> TabContentSwitcher;

    // --- Tab buttons ---

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> ResumeButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> InventoryButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> QuestJournalButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> MapButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> SkillsButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> RulesButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> SettingsButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> SaveLoadButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Menu")
    TObjectPtr<class UButton> QuitButton;

private:
    UPROPERTY()
    EMenuTab CurrentTab = EMenuTab::Resume;

    UPROPERTY()
    bool bIsOpen = false;

    UPROPERTY()
    FGenreUIConfig GenreConfig;

    UFUNCTION()
    void OnResumeClicked();

    UFUNCTION()
    void OnInventoryClicked();

    UFUNCTION()
    void OnQuestJournalClicked();

    UFUNCTION()
    void OnMapClicked();

    UFUNCTION()
    void OnSkillsClicked();

    UFUNCTION()
    void OnRulesClicked();

    UFUNCTION()
    void OnSettingsClicked();

    UFUNCTION()
    void OnSaveLoadClicked();

    UFUNCTION()
    void OnQuitClicked();

    /** Apply genre config visibility to tab buttons */
    void ApplyGenreConfig();

    /** Set the widget switcher to the index for a given tab */
    void SetActiveTabIndex(EMenuTab Tab);
};
