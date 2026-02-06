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
| Trigger button events | ⚠️ Partial | Detected but no action wired |
| Grip button events | ⚠️ Partial | Detected but no action wired |
| Thumbstick input | ⚠️ Partial | Detected but no locomotion wired |
| Teleportation | ✅ Working | Floor mesh-based via Babylon teleportation |
| Controller raycasting | ✅ Working | `raycastFromController()` |
| Pointer ray | ✅ Working | `getControllerRay()` |
| Hand tracking | ❌ Missing | No WebXR hand tracking API |
| Haptic feedback | ❌ Missing | No vibration/haptics |
| Smooth locomotion | ❌ Missing | Thumbstick detected but not wired |
| Snap turning | ❌ Missing | No rotation via thumbstick |
| Dispose | ✅ Working | Cleans up XR experience |

#### VRUIPanel.ts

**Location:** `client/src/components/3DGame/VRUIPanel.ts` (239 lines)

| Feature | Status | Notes |
| ------- | ------ | ----- |
| World-space UI panels | ✅ Working | `AdvancedDynamicTexture.CreateForMesh` |
| Camera-following panels | ✅ Working | Smooth lerp follow |
| Panel show/hide/toggle | ✅ Working | Enable/disable mesh |
| VRHandMenu class | ✅ Working | Small panel attached to controller |
| Controller attachment | ✅ Working | `attachToController()` |
| Interactive buttons | ⚠️ Partial | Panel is pickable but no VR pointer interaction wired |

#### BabylonGame.ts Integration

| Feature | Status | Notes |
| ------- | ------ | ----- |
| VRManager instantiation | ✅ Working | Created in `initializeGame()` |
| VR toggle (V key) | ✅ Working | `handleToggleVR()` |
| VR menu button | ✅ Working | "🥽 Toggle VR Mode" in GUI menu |
| Session start/end callbacks | ✅ Working | Sets `isVRMode`, shows toasts |
| `vrUIPanels` map | ⚠️ Declared | Map exists but never populated |
| `VRUIPanel` import | ⚠️ Unused | Imported but never instantiated |
| `isVRMode` flag | ⚠️ Unused | Set but never read by any system |
| `vrSupported` flag | ⚠️ Unused | Set but never read |
| `disposeVR()` | ⚠️ Incomplete | Clears reference but doesn't call `vrManager.dispose()` |

---

### Critical Gap Analysis

#### 1. VR Mode Flag Never Used

`isVRMode` is set on session start/end but no system checks it:

- **UI** doesn't switch to world-space panels in VR
- **Chat** doesn't switch to VR-compatible panel
- **Combat** doesn't adapt to VR input
- **Character controller** doesn't switch to VR locomotion
- **Camera** doesn't adapt (XR camera replaces active camera automatically, but CameraManager doesn't know)

#### 2. No VR-Adapted UI

The 2D overlay GUI (`AdvancedDynamicTexture.CreateFullscreenUI`) is invisible in VR. All UI must be world-space:

- ❌ HUD (health, stamina, minimap) — 2D overlay, invisible in VR
- ❌ Chat panel — 2D overlay, invisible in VR
- ❌ Quest tracker — 2D overlay, invisible in VR
- ❌ Inventory — 2D overlay, invisible in VR
- ❌ Radial menu — 2D overlay, invisible in VR
- ❌ Toast notifications — 2D overlay, invisible in VR
- ❌ Genre-specific UI — 2D overlay, invisible in VR

#### 3. No VR Interaction System

Controller buttons are detected but nothing happens:

- ❌ Trigger doesn't select/interact with NPCs
- ❌ Grip doesn't grab objects
- ❌ No NPC interaction via pointing
- ❌ No object pickup/manipulation
- ❌ No VR combat (swing/point weapons)

#### 4. No VR Locomotion

- ✅ Teleportation works (built into Babylon WebXR)
- ❌ Smooth locomotion via thumbstick not wired
- ❌ Snap turning not implemented
- ❌ Comfort options (vignette, etc.) missing

#### 5. No VR Audio Spatialization

- ❌ Audio not spatialized for VR head tracking
- ❌ NPC voice positions not tied to 3D positions
- ❌ No HRTF-based spatial audio

#### 6. Systems Unaware of VR

| System | VR-Aware | Notes |
| ------ | -------- | ----- |
| CharacterController | ❌ | Uses keyboard input only, no VR locomotion |
| CameraManager | ❌ | Doesn't handle XR camera handoff |
| BabylonChatPanel | ❌ | 2D overlay only |
| BabylonGUIManager | ❌ | All 2D overlay |
| CombatSystem | ❌ | Keyboard/mouse only |
| RangedCombatSystem | ❌ | No VR aiming |
| FightingCombatSystem | ❌ | No VR gesture combat |
| BabylonQuestTracker | ❌ | 2D overlay only |
| BabylonInventory | ❌ | 2D overlay only |
| BabylonRadialMenu | ❌ | 2D overlay only |
| GenreUIManager | ❌ | 2D overlay only |
| AudioManager | ❌ | No spatial audio for VR |
| BuildingPlacementSystem | ❌ | Mouse-based placement |
| ResourceSystem | ❌ | No VR resource gathering |

---

## Roadmap

### Phase 1: Core VR Fixes & Locomotion

**Goal:** Make basic VR movement reliable and fix foundational issues.

#### 1.1 Fix disposeVR

Call `vrManager.dispose()` properly:

```typescript
private disposeVR(): void {
  this.vrManager?.dispose();
  this.vrManager = null;
  this.vrUIPanels.forEach(p => p.dispose());
  this.vrUIPanels.clear();
}
```

#### 1.2 Implement Smooth Locomotion

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

#### 1.3 Implement Snap Turning

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

#### 1.4 VR Comfort Options

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

### Phase 2: VR Interaction System

**Goal:** Enable pointing at and interacting with objects/NPCs using controllers.

#### 2.1 VR Pointer & Raycast Interaction

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

#### 2.2 NPC Interaction via VR

- Point at NPC → highlight
- Trigger press → open VR chat panel (world-space)
- Proximity detection for NPCs (existing system works)

#### 2.3 Object Interaction

- Point at interactable objects → highlight
- Trigger = interact (doors, switches, items)
- Grip = grab/pick up (resources, items)
- Throw mechanics (release grip while moving)

#### 2.4 Haptic Feedback

Add vibration to controller actions:

```typescript
public triggerHapticPulse(hand: 'left' | 'right', intensity: number, duration: number): void {
  const controller = this.getController(hand);
  controller?.inputSource.gamepadComponents?.hapticActuators?.[0]?.pulse(intensity, duration);
}
```

---

### Phase 3: VR-Adapted UI

**Goal:** Create world-space versions of all UI elements visible in VR.

#### 3.1 VR HUD System

Create `VRHUDManager` class that mirrors key HUD elements in world-space:

- **Health/stamina bars** — wrist-mounted (attached to left controller)
- **Minimap** — wrist-mounted, toggle on/off
- **Toast notifications** — floating near peripheral vision
- **Quest tracker** — floating panel, toggleable

#### 3.2 VR Chat Panel

Create `VRChatPanel` class extending `VRUIPanel`:

- World-space chat window floating in front of player
- VR keyboard input (pointer-based virtual keyboard)
- Speech-to-text as primary input in VR
- NPC speech shown as floating text bubbles
- Position panel near NPC being talked to

#### 3.3 VR Inventory

Create `VRInventoryPanel` extending `VRUIPanel`:

- Grid of items as world-space buttons
- Grab items from inventory
- Drop items into world

#### 3.4 VR Menu System

- Hand menu on left wrist (already `VRHandMenu` class exists)
- Quick actions: inventory, quest log, map, settings
- Populate with actual menu items

#### 3.5 VR Mode Switch in BabylonGame

Wire `isVRMode` to switch between 2D and 3D UI:

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

### Phase 4: VR Combat

**Goal:** Adapt combat systems for VR controllers.

#### 4.1 VR Melee Combat

- Swing detection using controller velocity
- Hit registration via physics overlap
- Block/parry with shield hand (grip button)
- Haptic feedback on hit/block

#### 4.2 VR Ranged Combat

- Aim with right controller pointer
- Trigger to fire
- Reload gesture (grip + flick)
- Bow mechanics (two-hand pull)

#### 4.3 VR Fighting Combat

- Gesture recognition for combo inputs
- Punch/kick detection via controller motion
- Special moves triggered by specific gestures

#### 4.4 VR Turn-Based Combat

- World-space ability menu
- Point-and-select targeting
- Floating combat log

---

### Phase 5: VR Audio & Immersion

**Goal:** Spatial audio and immersive VR-specific features.

#### 5.1 Spatial Audio

- Attach `Sound` objects to NPC meshes for positional audio
- HRTF-based 3D audio using Web Audio API
- Distance-based volume falloff
- NPC voice direction matches their position

#### 5.2 VR-Specific Effects

- Damage flash (red vignette, not screen overlay)
- Healing glow effect around hands
- Ambient particle effects (dust, rain, embers)
- Day/night cycle visible in VR skybox

#### 5.3 Environment Interaction

- Open doors by pushing/pulling
- Pick up and examine objects (inspect mode)
- Read signs/books by holding them close
- Gesture-based magic/spells

---

### Phase 6: VR Language Learning

**Goal:** Leverage VR for immersive language learning.

#### 6.1 VR Conversation Mode

- Face-to-face NPC conversation in VR
- NPC lip sync (if available) or speech bubbles
- Floating vocabulary tooltips near objects
- Point at object → hear/see name in target language

#### 6.2 VR Vocabulary Labels

- Objects in world have floating labels in target language
- Toggle between native and target language labels
- Color-coded by mastery level (red=new, yellow=learning, green=mastered)

#### 6.3 VR Gesture Input

- Hand tracking for sign language practice
- Gesture-based word input
- Writing practice in 3D space

---

### Phase 7: Advanced VR Features

**Goal:** Polish and advanced capabilities.

#### 7.1 Hand Tracking

- WebXR hand tracking API integration
- Finger joint tracking
- Natural hand interaction (pinch, grab, poke)
- Hand menu activation via palm-up gesture

#### 7.2 Mixed Reality (AR Passthrough)

- `immersive-ar` session support
- Place game objects in real space
- Study vocabulary cards in AR

#### 7.3 Multiplayer VR

- VR avatar representation
- Hand/head position sync
- Voice chat with spatial audio
- Shared VR spaces for language practice

#### 7.4 VR Accessibility

- Seated play mode
- One-handed mode
- Color blind indicators
- Adjustable text size in VR panels
- Motion sickness comfort settings

---

## Implementation Priority

### High Priority (Core VR Functionality)

1. **Fix `disposeVR`** — Properly dispose VRManager
2. **Smooth locomotion** — Wire thumbstick to movement
3. **Snap turning** — Right thumbstick rotation
4. **VR pointer interaction** — Select NPCs/objects with controller
5. **VR mode UI switch** — Hide 2D UI, show world-space UI in VR

### Medium Priority (Playable in VR)

6. **VR HUD** — Wrist-mounted health/status
7. **VR chat panel** — World-space NPC conversation
8. **VR hand menu** — Populate existing VRHandMenu class
9. **Haptic feedback** — Controller vibration on interactions
10. **Spatial audio** — Position NPC voices in 3D

### Low Priority (Enhanced VR Experience)

11. **VR combat** — Motion-based melee/ranged
12. **VR inventory** — World-space item management
13. **VR language labels** — Object vocabulary in VR
14. **Hand tracking** — Natural hand interaction
15. **VR comfort options** — Vignette, speed, seated mode

---

## Files to Create

| File | Purpose |
| ---- | ------- |
| `VRInteractionManager.ts` | Pointer interaction, object selection, grab |
| `VRHUDManager.ts` | World-space HUD for VR (health, status, minimap) |
| `VRChatPanel.ts` | World-space chat for NPC conversation in VR |
| `VRInventoryPanel.ts` | World-space inventory management |
| `VRComfortSettings.ts` | Locomotion, turning, comfort options |
| `VRCombatAdapter.ts` | Adapts combat systems for VR input |

## Files to Modify

| File | Changes |
| ---- | ------- |
| `VRManager.ts` | Smooth locomotion, snap turning, haptics, hand tracking |
| `BabylonGame.ts` | VR mode switch, VR UI creation, proper disposal |
| `BabylonGUIManager.ts` | `setVisible()` method for hiding 2D UI in VR |
| `CharacterController.ts` | VR locomotion input mode |
| `CameraManager.ts` | XR camera awareness |
| `CombatSystem.ts` | VR input adapter |
| `AudioManager.ts` | Spatial audio for VR |
| `BabylonChatPanel.ts` | VR fallback / delegation to VRChatPanel |
| `GenreUIManager.ts` | VR layout variant |

---

## Testing Strategy

### Test Scenarios

1. **Basic VR Entry/Exit**
   - Press V to initialize VR
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

*Last Updated: February 2026*
