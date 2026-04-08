/**
 * BabylonWorld - Minimal React wrapper for the BabylonGame class
 *
 * On mount, starts a new game by fetching a world snapshot from the server,
 * creating a save file, and initializing BabylonGame with a SaveFileDataSource.
 * All game reads come from the embedded snapshot. Writes go to the save file's
 * currentState, which is periodically persisted back to the server.
 */

import { useEffect, useRef, useState } from "react";
import { BabylonGame } from "@shared/game-engine/rendering/BabylonGame";
import { SaveFileDataSource } from "./SaveFileDataSource";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { loadWorldTranslations, setTargetLanguage } from "@/i18n";

interface BabylonWorldProps {
  worldId: string;
  worldName: string;
  worldType?: string;
  userId?: string;
  playthroughId?: string;
  saveId?: string;
  onBack: () => void;
}

export function BabylonWorld({ worldId, worldName, worldType, playthroughId, saveId, onBack }: BabylonWorldProps) {
  const { token } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<BabylonGame | null>(null);
  const dataSourceRef = useRef<SaveFileDataSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !token) return;

    let disposed = false;

    async function startGame() {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

        let saveFile: any;

        if (saveId) {
          // Load existing save by ID (direct link to a specific save)
          const res = await fetch(`/api/saves/${saveId}`, { headers });
          if (!res.ok) throw new Error('Failed to load save file');
          saveFile = await res.json();
        } else {
          // No specific save requested — let BabylonGame show the
          // playthrough selection menu (Load Game / New Game).
          // We still need a data source to bootstrap, so load the most
          // recent save if one exists, or create a temporary one.
          const listRes = await fetch(`/api/worlds/${worldId}/saves`, { headers });
          const existingSaves = listRes.ok ? await listRes.json() : [];

          if (existingSaves.length > 0) {
            // Load most recent save as data source, show menu for Continue/Load/New
            const res = await fetch(`/api/saves/${existingSaves[0].id}`, { headers });
            if (!res.ok) throw new Error('Failed to load save for data source');
            saveFile = await res.json();
            saveFile._showSelectionMenu = true;
          } else {
            // No saves at all — create the first one
            const res = await fetch(`/api/worlds/${worldId}/saves/new-game`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ name: worldName }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || 'Failed to start new game');
            }
            const { id } = await res.json();
            const loadRes = await fetch(`/api/saves/${id}`, { headers });
            if (!loadRes.ok) throw new Error('Failed to load new save file');
            saveFile = await loadRes.json();
          }
        }

        if (disposed) return;


        // Create save-file-backed data source
        const ds = new SaveFileDataSource(saveFile, token!);
        dataSourceRef.current = ds;

        // Create and initialize the game with the save file data source
        // When multiple saves exist, omit playthroughId so BabylonGame shows the selection menu
        const game = new BabylonGame(canvas!, {
          worldId,
          worldName,
          worldType,
          authToken: token!,
          playthroughId: saveFile._showSelectionMenu ? undefined : saveFile.id,
          dataSource: ds,
          onBack: () => {
            ds.persistToServer().catch(console.error);
            onBackRef.current();
          },
        });

        gameRef.current = game;
        setLoading(false);

        // Load LLM-generated UI translations for language-learning worlds
        const worldData = saveFile.worldSnapshot?.world || saveFile.worldSnapshot;
        const targetLang = worldData?.targetLanguage;
        if (targetLang && worldData?.gameType === 'language-learning') {
          try {
            const langCode = targetLang.toLowerCase().slice(0, 2);
            setTargetLanguage(langCode);
            const uiRes = await fetch(`/api/worlds/${worldId}/ui-translations/${langCode}`, { headers });
            if (uiRes.ok) {
              const { translations } = await uiRes.json();
              if (translations) {
                loadWorldTranslations(langCode, translations);
                console.log(`[BabylonWorld] Loaded UI translations for ${langCode}`);
              }
            }
          } catch (err) {
            console.warn('[BabylonWorld] Failed to load UI translations:', err);
          }
        }

        await game.init();
      } catch (err) {
        if (!disposed) {
          console.error('[BabylonWorld] Failed to start game:', err);
          setError((err as Error).message);
          setLoading(false);
        }
      }
    }

    startGame();

    return () => {
      disposed = true;
      if (dataSourceRef.current) {
        dataSourceRef.current.dispose();
        dataSourceRef.current = null;
      }
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
    };
  }, [worldId, worldName, worldType, token, playthroughId, saveId]);

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>
      {loading && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#ccc', zIndex: 10, gap: 8 }}>
          <div style={{ fontSize: 18 }}>Loading world...</div>
          <div style={{ fontSize: 13, color: '#888' }}>Preparing save file and world snapshot</div>
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#f66', zIndex: 10, gap: 12 }}>
          <div style={{ fontSize: 18 }}>Failed to start game</div>
          <div style={{ fontSize: 14, color: '#aaa' }}>{error}</div>
          <button onClick={() => onBackRef.current()} style={{ marginTop: 12, padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Back to Editor
          </button>
        </div>
      )}
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
