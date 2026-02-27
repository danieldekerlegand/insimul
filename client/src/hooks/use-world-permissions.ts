import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface WorldPermissions {
  canEdit: boolean;
  canView: boolean;
  isOwner: boolean;
  loading: boolean;
}

/**
 * Hook to check user's permissions for a specific world.
 * Uses the server-computed isOwner flag for reliable ownership checks.
 */
export function useWorldPermissions(worldId: string | undefined): WorldPermissions {
  const { token, user, isLoading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<WorldPermissions>({
    canEdit: false,
    canView: true,
    isOwner: false,
    loading: true,
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) {
      return;
    }

    if (!worldId) {
      setPermissions({
        canEdit: false,
        canView: false,
        isOwner: false,
        loading: false,
      });
      return;
    }

    const fetchPermissions = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch the world — server includes isOwner when token is provided
        const response = await fetch(`/api/worlds/${worldId}`, { headers });

        if (response.ok) {
          const world = await response.json();

          // Use server-computed isOwner (reliable, avoids client-side ID mismatches)
          const isOwner = token ? !!world.isOwner : false;

          // Allow editing if:
          // 1. Server says user is the owner
          // 2. World has no owner (legacy worlds) and user is authenticated
          // 3. No authentication system in use (no user, no owner)
          const canEdit = isOwner || (!world.ownerId && !!token) || (!world.ownerId && !user);

          setPermissions({
            canEdit,
            canView: true,
            isOwner,
            loading: false,
          });
        } else {
          setPermissions({
            canEdit: false,
            canView: false,
            isOwner: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Failed to check world permissions:', error);
        setPermissions({
          canEdit: false,
          canView: true,
          isOwner: false,
          loading: false,
        });
      }
    };

    fetchPermissions();
  }, [worldId, token, user?.id, authLoading]);

  return permissions;
}
