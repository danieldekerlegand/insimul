import { SettlementHub } from './locations/SettlementHub';

interface UnifiedWorldExplorerTabProps {
  worldId: string;
}

export function UnifiedWorldExplorerTab({ worldId }: UnifiedWorldExplorerTabProps) {
  return (
    <div className="px-2 py-4">
      <SettlementHub worldId={worldId} />
    </div>
  );
}
