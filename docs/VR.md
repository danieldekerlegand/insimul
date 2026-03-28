# VR Support Roadmap

## Executive Summary

This document analyzes the current state of VR/WebXR integration in Insimul's 3D game engine and outlines a roadmap for completing and deepening the VR experience. The goal is to make the entire game fully playable in VR — including NPC interaction, combat, UI, locomotion, and language learning — using WebXR on Quest, PCVR, and browser-based headsets.

---

## Current State Analysis

### VR Infrastructure

#### VRManager.ts

**Location:** `client/src/components/3DGame/VRManager.ts` (415 lines)

| Feature | Status | Notes |
| ------- | ------ | ----- |
| WebXR session creation | ✅ Working | `createDefaultXRExperienceAsync` |
| Enter/exit VR | ✅ Working | `immersive-vr` + `local-floor` |
| Session state tracking | ✅ Working | `IN_XR` / `NOT_IN_XR` callbacks |
| Controller detection | ✅ Working | Left/right hand tracking |
| Trigger button events | ✅ Working | Wired to VRInteractionManager select/grab |
| Grip button events | ✅ Working | Wired to VRInteractionManager grab |
| Thumbstick input | ✅ Working | Left=locomotion, Right=snap turn |
| Teleportation | ✅ Working | Floor mesh-based via Babylon teleportation |
| Controller raycasting | ✅ Working | `raycastFromController()` + detailed variant |
| Pointer ray | ✅ Working | `getControllerRay()` |
| Hand tracking | ✅ Working | VRHandTrackingManager: gestures, joint tracking |
| Haptic feedback | ✅ Working | `triggerHapticPulse()` with fallback |
| Smooth locomotion | ✅ Working | Left thumbstick → CharacterController |
| Snap turning | ✅ Working | Right thumbstick, configurable angle |
| Comfort settings | ✅ Working | VRComfortSettings with defaults |
| Dispose | ✅ Working | Cleans up XR experience + callbacks |

#### VRUIPanel.ts

**Location:** `client/src/components/3DGame/VRUIPanel.ts` (239 lines)

| Feature | Status | Notes |
| ------- | ------ | ----- |
| World-space UI panels | ✅ Working | `AdvancedDynamicTexture.CreateForMesh` |
| Camera-following panels | ✅ Working | Smooth lerp follow |
| Panel show/hide/toggle | ✅ Working | Enable/disable mesh |
| VRHandMenu class | ✅ Working | Small panel attached to controller |
| Controller attachment | ✅ Working | `attachToController()` |
| Interactive buttons | ✅ Working | VR pointer interaction via VRInteractionManager |

#### BabylonGame.ts Integration

| Feature | Status | Notes |
| ------- | ------ | ----- |
| VRManager instantiation | ✅ Working | Created in `initializeGame()` |
| VR toggle (Shift+V) | ✅ Working | `handleToggleVR()` (fixed key conflict) |
| VR menu button | ✅ Working | "🥽 Toggle VR Mode" in GUI menu |
| Session start/end callbacks | ✅ Working | Full VR mode switch: hides 2D UI, creates VR UI |
| `vrUIPanels` map | ✅ Working | Populated during VR session |
| `VRUIPanel` import | ✅ Working | Used for VR hand menu |
| `isVRMode` flag | ✅ Working | Gates VR-specific behavior |
| `vrSupported` flag | ✅ Working | Set after VR initialization |
| `disposeVR()` | ✅ Working | Properly disposes VRManager + VR UI systems |

---

### Critical Gap Analysis

#### 1. VR Mode Flag ~~Never Used~~ ✅ RESOLVED

`isVRMode` now gates full VR mode switching:

- ✅ **UI** switches to world-space panels via `BabylonGUIManager.setVisible(false)` + VRHUDManager
- ✅ **Chat** — VRChatPanel provides world-space NPC conversation in VR
- ✅ **Combat** adapts to VR input via VRCombatAdapter (melee/ranged/fighting/turn-based)
- ✅ **Character controller** receives VR locomotion via thumbstick callbacks
- ⚠️ **Camera** — XR camera replaces active camera automatically; CameraManager not yet aware

#### 2. ~~No~~ VR-Adapted UI — ⚠️ PARTIAL

The 2D overlay GUI is now hidden in VR. World-space replacements:

- ✅ HUD (health, stamina) — wrist-mounted VRHUDManager
- ✅ Chat panel — VRChatPanel floats near NPC, STT input, TTS output
- ✅ Quest tracker — world-space floating panel in VRHUDManager
- ❌ Inventory — 2D overlay, invisible in VR (future)
- ❌ Radial menu — 2D overlay, invisible in VR (future)
- ✅ Toast notifications — VR floating toast panel
- ❌ Genre-specific UI — 2D overlay, invisible in VR (future)

#### 3. ~~No~~ VR Interaction System — ✅ IMPLEMENTED

Controller buttons are wired to VRInteractionManager:

- ✅ Trigger selects/interacts with NPCs via laser pointer
- ✅ Grip grabs objects via VRInteractionManager
- ✅ NPC interaction via pointing + trigger
- ✅ Hover highlight with emissive color change
- ✅ Laser beam + hit indicator visuals
- ✅ VR combat via VRCombatAdapter (melee swing, ranged aim, fighting gestures, turn-based menu)

#### 4. ~~No~~ VR Locomotion — ✅ IMPLEMENTED

- ✅ Teleportation works (built into Babylon WebXR)
- ✅ Smooth locomotion via left thumbstick → CharacterController
- ✅ Snap turning via right thumbstick (configurable angle, with cooldown)
- ✅ Comfort settings (VRComfortSettings: locomotion type, snap angle, speed, vignette)

#### 5. ~~No~~ VR Audio Spatialization — ✅ IMPLEMENTED

- ✅ Spatial audio with per-frame mesh tracking via `AudioManager.enableVRSpatialAudio()`
- ✅ NPC voice positions tied to mesh positions via `bindSoundToMesh()`
- ✅ Exponential distance model with HRTF-friendly settings

#### 6. Systems VR Awareness

| System | VR-Aware | Notes |
| ------ | -------- | ----- |
| CharacterController | ✅ | VR locomotion via thumbstick callbacks |
| CameraManager | ❌ | Doesn't handle XR camera handoff |
| BabylonChatPanel | ✅ | VRChatPanel: world-space panel near NPC, STT input |
| BabylonGUIManager | ✅ | `setVisible()` hides all 2D UI in VR |
| CombatSystem | ✅ | VR melee via VRCombatAdapter trigger |
| RangedCombatSystem | ✅ | VR controller aiming + trigger fire |
| FightingCombatSystem | ✅ | VR gesture velocity detection + grip block |
| BabylonQuestTracker | ❌ | 2D overlay only |
| BabylonInventory | ❌ | 2D overlay only |
| BabylonRadialMenu | ❌ | 2D overlay only |
| GenreUIManager | ❌ | 2D overlay only |
| AudioManager | ✅ | VR spatial audio with mesh binding |
| BuildingPlacementSystem | ❌ | Mouse-based placement |
| ResourceSystem | ❌ | No VR resource gathering |

---

## Roadmap

### Phase 1: Core VR Fixes & Locomotion ✅ COMPLETE

**Goal:** Make basic VR movement reliable and fix foundational issues.

#### 1.1 Fix disposeVR ✅

Call `vrManager.dispose()` properly:

```typescript
private disposeVR(): void {
  this.vrManager?.dispose();
  this.vrManager = null;
  this.vrUIPanels.forEach(p => p.dispose());
  this.vrUIPanels.clear();
}
```

#### 1.2 Implement Smooth Locomotion ✅

Wire thumbstick to player movement in VR:

```typescript
// In VRManager
private handleThumbstickMoved(hand: 'left' | 'right', x: number, y: number): void {
  if (hand === 'left') {
    // Left stick = movement
    this.onLocomotion?.({ x, y });
  } else {
    // Right stick = rotation
    this.onSnapTurn?.(x);
  }
}
```

#### 1.3 Implement Snap Turning ✅

Right thumbstick for 30°/45° snap turns with deadzone:

```typescript
private snapTurnCooldown = false;
private handleSnapTurn(x: number): void {
  if (this.snapTurnCooldown || Math.abs(x) < 0.5) return;
  const angle = x > 0 ? Math.PI / 6 : -Math.PI / 6; // 30 degrees
  this.xrExperience?.baseExperience.camera.rotationQuaternion.multiplyInPlace(
    Quaternion.RotationAxis(Vector3.Up(), angle)
  );
  this.snapTurnCooldown = true;
  setTimeout(() => this.snapTurnCooldown = false, 300);
}
```

#### 1.4 VR Comfort Options ✅

Add comfort settings to VRManager:

```typescript
export interface VRComfortSettings {
  locomotionType: 'teleport' | 'smooth' | 'both';
  snapTurnAngle: 15 | 30 | 45 | 90;
  smoothTurnSpeed: number;
  vignetteOnMove: boolean;
  movementSpeed: number;
  standingHeight: number;
}
```

---

### Phase 2: VR Interaction System ✅ COMPLETE

**Goal:** Enable pointing at and interacting with objects/NPCs using controllers.

#### 2.1 VR Pointer & Raycast Interaction ✅

Create `VRInteractionManager` class:

```typescript
export class VRInteractionManager {
  // Continuous raycast from right controller
  // Highlight hovered objects
  // Trigger press = select/interact
  // Grip press = grab
  // Show laser pointer beam
  // Show hit point indicator
}
```

#### 2.2 NPC Interaction via VR ✅

- ✅ Point at NPC → highlight (emissive color change)
- ✅ Trigger press → select NPC (opens action panel)
- ✅ Proximity detection for NPCs (existing system works)
- ⚠️ World-space chat panel needed (future enhancement)

#### 2.3 Object Interaction ⚠️ Partial

- ✅ Point at interactable objects → highlight
- ✅ Trigger = interact (doors, switches, items)
- ✅ Grip = grab/pick up (resources, items) — callback wired
- ❌ Throw mechanics (release grip while moving) — future

#### 2.4 Haptic Feedback ✅

Add vibration to controller actions:

```typescript
public triggerHapticPulse(hand: 'left' | 'right', intensity: number, duration: number): void {
  const controller = this.getController(hand);
  controller?.inputSource.gamepadComponents?.hapticActuators?.[0]?.pulse(intensity, duration);
}
```

---

### Phase 3: VR-Adapted UI ✅ COMPLETE

**Goal:** Create world-space versions of all UI elements visible in VR.

#### 3.1 VR HUD System ✅

Created `VRHUDManager` class with world-space HUD elements:

- ✅ **Health/stamina bars** — wrist-mounted (attached to left controller)
- ⚠️ **Minimap** — not yet in VR (future)
- ✅ **Toast notifications** — floating camera-following panel
- ✅ **Quest tracker** — floating panel, toggleable
- ✅ **Fluency indicator** — shown on wrist HUD

#### 3.2 VR Chat Panel ✅

Created `VRChatPanel` class using `VRUIPanel`:

- ✅ World-space chat window floating near NPC
- ✅ Speech-to-text as primary input (trigger to record, release to send)
- ✅ NPC responses shown in scrollable message history
- ✅ TTS audio output for NPC speech
- ✅ Action buttons for dialogue choices
- ✅ Panel follows NPC position in world

#### 3.3 VR Inventory ❌ TODO (Low Priority)

Create `VRInventoryPanel` extending `VRUIPanel`:

- Grid of items as world-space buttons
- Grab items from inventory
- Drop items into world

#### 3.4 VR Menu System ✅

- ✅ Hand menu on left wrist (VRHandMenu attached to controller)
- ⚠️ Quick actions (buttons) — skeleton created, needs content
- ⚠️ Populate with actual menu items — future

#### 3.5 VR Mode Switch in BabylonGame ✅

`isVRMode` now gates full UI switching between 2D and VR:

```typescript
private onVRSessionStarted(): void {
  this.isVRMode = true;
  // Hide all 2D UI
  this.guiManager?.setVisible(false);
  // Show VR UI
  this.vrHUD?.show();
  this.vrHandMenu?.show();
  // Disable keyboard character controller
  this.playerController?.setEnabled(false);
}

private onVRSessionEnded(): void {
  this.isVRMode = false;
  // Restore 2D UI
  this.guiManager?.setVisible(true);
  // Hide VR UI
  this.vrHUD?.hide();
  this.vrHandMenu?.hide();
  // Re-enable keyboard controller
  this.playerController?.setEnabled(true);
}
```

---

### Phase 4: VR Combat ✅ COMPLETE

**Goal:** Adapt combat systems for VR controllers.

Created `VRCombatAdapter` class that bridges VR controller input to all combat systems.

#### 4.1 VR Melee Combat ✅

- ✅ Trigger press to attack targeted/nearest enemy
- ✅ Controller velocity tracking for swing power bonus
- ✅ Haptic feedback on hit (intensity varies with velocity)
- ⚠️ Block/parry — future enhancement (currently only in fighting mode)

#### 4.2 VR Ranged Combat ✅

- ✅ Aim with right controller ray direction
- ✅ Trigger to fire (uses controller origin + direction)
- ✅ Grip to reload with haptic feedback
- ✅ Wrist-mounted ammo display (weapon name + ammo count)
- ⚠️ Bow two-hand pull — future enhancement

#### 4.3 VR Fighting Combat ✅

- ✅ Controller velocity maps to light/medium/heavy punch
- ✅ Left trigger for left punch, right trigger for right punch
- ✅ Left grip to block, release to unblock
- ✅ Special meter display on left wrist
- ⚠️ Kick detection — future enhancement (needs foot tracking)

#### 4.4 VR Turn-Based Combat ✅

- ✅ World-space action menu (camera-following panel)
- ✅ Point-and-select targeting via VRInteractionManager
- ✅ Floating combat log panel
- ✅ Phase indicator (your turn / enemy turn / resolving / victory / defeat)
- ✅ Color-coded action buttons by category

---

### Phase 5: VR Audio & Immersion ⚠️ PARTIAL

**Goal:** Spatial audio and immersive VR-specific features.

#### 5.1 Spatial Audio ✅

- ✅ `AudioManager.enableVRSpatialAudio()` — enables per-frame mesh position tracking
- ✅ `bindSoundToMesh()` — attaches sound to NPC mesh for positional audio
- ✅ `createSpatialSound()` — creates new spatial sound bound to a mesh
- ✅ Exponential distance model, rolloff factor 2, max distance 50
- ✅ Auto-cleanup for disposed meshes
- ✅ `playSpatialOneShot()` — spatial one-shot at mesh position

#### 5.2 VR-Specific Effects ❌ TODO

- ❌ Damage flash (red vignette, not screen overlay)
- ❌ Healing glow effect around hands
- ❌ Ambient particle effects (dust, rain, embers)
- ❌ Day/night cycle visible in VR skybox

#### 5.3 Environment Interaction ❌ TODO

- ❌ Open doors by pushing/pulling
- ❌ Pick up and examine objects (inspect mode)
- ❌ Read signs/books by holding them close
- ❌ Gesture-based magic/spells

---

### Phase 6: VR Language Learning ⚠️ PARTIAL

**Goal:** Leverage VR for immersive language learning.

#### 6.1 VR Conversation Mode ✅

- ✅ Face-to-face NPC conversation in VR via VRChatPanel
- ✅ NPC speech shown in world-space panel near NPC
- ✅ Speech-to-text input (primary VR input method)
- ✅ TTS audio output for NPC responses
- ⚠️ NPC lip sync — future enhancement
- ✅ Point at NPC + trigger to start conversation

#### 6.2 VR Vocabulary Labels ✅

- ✅ `VRVocabularyLabels` class with floating 3D labels
- ✅ Proximity-based auto-show (configurable range)
- ✅ Point-at-object reveal via VR controller ray
- ✅ Toggle between native and target language
- ✅ Color-coded by mastery level (red=new, yellow=learning, green=mastered)
- ✅ Labels follow moving meshes (NPCs)
- ✅ Billboard effect — labels always face camera

#### 6.3 VR Gesture Input ❌ TODO

- ❌ Hand tracking for sign language practice
- ❌ Gesture-based word input
- ❌ Writing practice in 3D space

---

### Phase 7: Advanced VR Features ✅ COMPLETE

**Goal:** Polish and advanced capabilities.

#### 7.1 Hand Tracking ✅

Created `VRHandTrackingManager` class:

- ✅ WebXR hand tracking API integration via `WebXRFeatureName.HAND_TRACKING`
- ✅ 25-joint finger tracking per hand (wrist, thumb, index, middle, ring, pinky)
- ✅ Gesture detection: pinch, grab, poke, palm_up, point, fist
- ✅ Pinch strength calculation (thumb-index tip distance)
- ✅ Grab strength calculation (average fingertip-to-palm distance)
- ✅ Palm normal calculation (cross product of finger vectors)
- ✅ Gesture state transition callbacks (onPinchStart/End, onGrabStart/End, onPalmUp, onPoke)
- ✅ Haptic feedback on gesture detection
- ✅ Hand menu activation via palm-up gesture (left hand palm-up toggles hand menu)
- ✅ Pinch-to-select for NPC interaction (right hand pinch = trigger)

#### 7.2 Mixed Reality (AR Passthrough) ✅

Added AR support to `VRManager`:

- ✅ `enterAR()` — `immersive-ar` session with passthrough
- ✅ `isARSupported()` — async check for device AR capability
- ✅ `enableARHitTest()` — WebXR hit test feature for surface detection
- ✅ Visual hit test marker (torus indicator on detected surfaces)
- ✅ `placeObjectAtHitTest()` — place objects at detected surface position
- ✅ `onARHitTest` / `onARPlaceObject` callbacks
- ✅ Automatic AR cleanup on session end
- ⚠️ AR vocabulary cards — future enhancement (requires AR-specific UI)

#### 7.3 Multiplayer VR ⚠️ INFRASTRUCTURE ONLY

Multiplayer requires server-side changes beyond VR scope. Infrastructure prepared:

- ✅ Hand/head position data available via VRHandTrackingManager + VRManager camera
- ✅ Spatial audio infrastructure for voice chat (AudioManager.createSpatialSound)
- ❌ VR avatar representation — requires networked avatar system
- ❌ Position sync — requires WebSocket integration
- ❌ Shared VR spaces — requires room/session management

#### 7.4 VR Accessibility ✅

Created `VRAccessibilityManager` class + extended `VRComfortSettings`:

- ✅ Seated play mode (configurable height offset)
- ✅ One-handed mode (dominant hand selection, `shouldProcessHand()` filter)
- ✅ Color blind mode (protanopia, deuteranopia, tritanopia palettes)
- ✅ Adjustable text size in VR panels (`uiTextScale`, `scaleFontSize()`)
- ✅ Adjustable panel size (`uiPanelScale`)
- ✅ High contrast UI toggle
- ✅ Tunnel vignette during locomotion (configurable intensity)
- ✅ Reduced particle effects option
- ✅ Static horizon line (anti-nausea reference)
- ✅ Subtitle/caption system for VR audio (timed display with auto-hide)

---

## Implementation Priority

### High Priority (Core VR Functionality)

1. ~~**Fix `disposeVR`**~~ ✅ Done
2. ~~**Smooth locomotion**~~ ✅ Done
3. ~~**Snap turning**~~ ✅ Done
4. ~~**VR pointer interaction**~~ ✅ Done
5. ~~**VR mode UI switch**~~ ✅ Done

### Medium Priority (Playable in VR)

6. ~~**VR HUD**~~ ✅ Done — Wrist-mounted health/status + toast + quest tracker
7. ~~**VR chat panel**~~ ✅ Done — World-space NPC conversation with STT/TTS
8. ~~**VR hand menu**~~ ✅ Done — Attached to left controller
9. ~~**Haptic feedback**~~ ✅ Done — Controller vibration on interactions
10. ~~**Spatial audio**~~ ✅ Done — Mesh-bound spatial audio with per-frame tracking

### Low Priority (Enhanced VR Experience)

11. ~~**VR combat**~~ ✅ Done — VRCombatAdapter (melee/ranged/fighting/turn-based)
12. **VR inventory** — World-space item management
13. ~~**VR language labels**~~ ✅ Done — VRVocabularyLabels with mastery colors
14. ~~**Hand tracking**~~ ✅ Done — VRHandTrackingManager with gesture detection
15. ~~**VR comfort options**~~ ✅ Done — VRComfortSettings + VRAccessibilitySettings
16. ~~**AR passthrough**~~ ✅ Done — immersive-ar session + hit testing
17. ~~**VR accessibility**~~ ✅ Done — Seated mode, one-handed, color blind, subtitles

---

## Files Created

| File | Purpose | Status |
| ---- | ------- | ------ |
| `VRInteractionManager.ts` | Pointer interaction, object selection, grab | ✅ Created |
| `VRHUDManager.ts` | World-space HUD for VR (health, status, quest) | ✅ Created |
| `VRComfortSettings.ts` | Locomotion, turning, comfort + accessibility settings | ✅ Created |
| `VRChatPanel.ts` | World-space chat for NPC conversation in VR | ✅ Created |
| `VRCombatAdapter.ts` | Adapts combat systems for VR controller input | ✅ Created |
| `VRVocabularyLabels.ts` | Floating vocabulary labels on world objects | ✅ Created |
| `VRHandTrackingManager.ts` | WebXR hand tracking, gesture detection | ✅ Created |
| `VRAccessibilityManager.ts` | Seated mode, one-handed, color blind, subtitles | ✅ Created |
| `VRInventoryPanel.ts` | World-space inventory management | ❌ TODO |

## Files Modified

| File | Changes | Status |
| ---- | ------- | ------ |
| `VRManager.ts` | Smooth locomotion, snap turning, haptics, comfort settings, AR passthrough, hit testing | ✅ Done |
| `BabylonGame.ts` | VR mode switch, VR UI creation, proper disposal, key fix, hand tracking, accessibility | ✅ Done |
| `BabylonGUIManager.ts` | `setVisible()` method, help text fix (Shift+V) | ✅ Done |
| `CharacterController.ts` | VR locomotion input mode | ⚠️ Uses existing public methods (no modification needed) |
| `CameraManager.ts` | XR camera awareness | ❌ TODO |
| `CombatSystem.ts` | VR input via VRCombatAdapter (no direct changes needed) | ✅ Done |
| `AudioManager.ts` | VR spatial audio: enableVRSpatialAudio, bindSoundToMesh, createSpatialSound | ✅ Done |
| `BabylonChatPanel.ts` | VR delegates to VRChatPanel; 2D panel hidden in VR | ✅ Done |
| `GenreUIManager.ts` | VR layout variant | ❌ TODO |

---

## Testing Strategy

### Test Scenarios

1. **Basic VR Entry/Exit**
   - Press Shift+V to initialize VR
   - Enter VR session
   - Verify teleportation works
   - Exit VR session
   - Verify 2D UI restored

2. **VR Locomotion**
   - Smooth movement with left thumbstick
   - Snap turning with right thumbstick
   - Teleportation still works alongside smooth locomotion

3. **VR Interaction**
   - Point at NPC → highlight
   - Trigger → open VR chat
   - Point at object → tooltip
   - Grip → grab object

4. **VR UI**
   - All 2D UI hidden in VR
   - VR HUD visible on wrist
   - VR chat panel readable
   - VR menu accessible

5. **VR Combat**
   - Melee swing registers hits
   - Ranged aiming works
   - Haptic feedback on hit

### Device Testing

- Meta Quest 2/3 (standalone WebXR)
- PCVR via SteamVR + browser
- Pico headsets
- Browser emulation (WebXR emulator extension)

---

## Technical Notes

### Babylon.js WebXR Capabilities

Babylon.js provides robust WebXR support out of the box:

- `WebXRDefaultExperience` — handles session, controllers, teleportation
- `WebXRMotionControllerManager` — standard controller mapping
- `WebXRHandTracking` — optional hand tracking feature
- `AdvancedDynamicTexture.CreateForMesh` — world-space UI for VR
- `WebXRFeatureName.TELEPORTATION` — built-in teleportation
- `WebXRFeatureName.HAND_TRACKING` — hand joint data
- `WebXRFeatureName.HIT_TEST` — AR hit testing

### WebXR Session Types

- `immersive-vr` — full VR (current implementation)
- `immersive-ar` — mixed reality (future Phase 7)
- `inline` — non-immersive (fallback)

### Reference Spaces

- `local-floor` — current implementation (good for room-scale)
- `bounded-floor` — guardian boundary aware
- `unbounded` — large-scale tracking

---

*Last Updated: February 10, 2026 — Phases 1-6 implementation*
