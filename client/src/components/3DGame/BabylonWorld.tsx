/**
 * BabylonWorld - Minimal React wrapper for the BabylonGame class
 *
 * This component is now just a thin wrapper around the pure TypeScript BabylonGame class.
 * All game logic, state, and systems are in BabylonGame.ts.
 *
 * This eliminates:
 * - All useEffect hooks (except one for init/dispose)
 * - All useState hooks
 * - All useCallback hooks
 * - All useMemo hooks
 * - All React UI components (Button, Badge, Card, Dialog, etc.)
 *
 * The game is now pure TypeScript with React only for the canvas wrapper.
 */

import { useEffect, useRef } from "react";
import { BabylonGame } from "@/components/3DGame/BabylonGame.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";

interface BabylonWorldProps {
  worldId: string;
  worldName: string;
  worldType?: string;
  userId?: string;
  onBack: () => void;
}

export function BabylonWorld({ worldId, worldName, worldType, onBack }: BabylonWorldProps) {
  const { token } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<BabylonGame | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !token) return;

    // Create and initialize the game
    const game = new BabylonGame(canvas, {
      worldId,
      worldName,
      worldType,
      authToken: token,
      onBack
    });

    gameRef.current = game;

    // Initialize asynchronously
    game.init().catch((error) => {
      console.error('Failed to initialize game:', error);
    });

    // Cleanup on unmount
    return () => {
      game.dispose();
      gameRef.current = null;
    };
  }, [worldId, worldName, worldType, token, onBack]);

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          outline: 'none',
          touchAction: 'none'
        }}
      />
    </div>
  );
}
