import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Character } from '@shared/schema';
import { CharacterDetailView } from './characters/CharacterDetailView';
import { CharacterChatDialog } from './CharacterChatDialog';

const PAGE_SIZE = 30;

interface CharacterBrowserTableProps {
  worldId: string;
}

export function CharacterBrowserTable({ worldId }: CharacterBrowserTableProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [truths, setTruths] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [settlementFilter, setSettlementFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [chatChar, setChatChar] = useState<Character | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [worldId]);

  const fetchAll = async () => {
    try {
      const [charsRes, settlementsRes, truthsRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}/characters`),
        fetch(`/api/worlds/${worldId}/settlements`),
        fetch(`/api/worlds/${worldId}/truths`),
      ]);
      if (charsRes.ok) setCharacters(await charsRes.json());
      if (settlementsRes.ok) setSettlements(await settlementsRes.json());
      if (truthsRes.ok) setTruths(await truthsRes.json());
    } catch (err) {
      console.error('Failed to fetch character browser data:', err);
    }
  };

  const settlementMap = useMemo(() => {
    const m = new Map<string, string>();
    settlements.forEach(s => m.set(s.id, s.name));
    return m;
  }, [settlements]);

  const filtered = useMemo(() => {
    let result = characters;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
      );
    }
    if (settlementFilter !== 'all') {
      result = result.filter(c => c.settlementId === settlementFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => (c.status ?? 'active') === statusFilter);
    }
    return result;
  }, [characters, search, settlementFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSlice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, settlementFilter, statusFilter]);

  const statusBadge = (status: string | null) => {
    const s = status ?? 'active';
    if (s === 'deceased') return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Deceased</Badge>;
    if (s === 'inactive') return <Badge variant="outline">Inactive</Badge>;
    return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>;
  };

  const handleRowClick = (char: Character) => {
    setSelectedChar(char);
  };

  const handleCharacterUpdated = () => {
    fetchAll();
  };

  const handleCharacterDeleted = () => {
    fetchAll();
    setSelectedChar(null);
  };

  const handleChat = (char: Character) => {
    setChatChar(char);
    setShowChat(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={settlementFilter} onValueChange={setSettlementFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Settlement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All settlements</SelectItem>
            {settlements.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="deceased">Deceased</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} character{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Settlement</TableHead>
              <TableHead>Occupation</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageSlice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                  No characters match your filters.
                </TableCell>
              </TableRow>
            ) : (
              pageSlice.map(char => (
                <TableRow
                  key={char.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(char)}
                >
                  <TableCell className="font-medium">
                    {char.firstName} {char.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {char.settlementId ? settlementMap.get(char.settlementId) ?? '—' : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {char.occupation ?? '—'}
                  </TableCell>
                  <TableCell>
                    {statusBadge(char.status)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Character detail slide-over */}
      <Sheet open={!!selectedChar} onOpenChange={open => { if (!open) setSelectedChar(null); }}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedChar ? `${selectedChar.firstName} ${selectedChar.lastName}` : ''}
            </SheetTitle>
          </SheetHeader>
          {selectedChar && (
            <div className="mt-4">
              <CharacterDetailView
                character={selectedChar}
                allCharacters={characters}
                onCharacterUpdated={handleCharacterUpdated}
                onCharacterDeleted={handleCharacterDeleted}
                onChatWithCharacter={handleChat}
                onViewCharacter={setSelectedChar}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Chat dialog */}
      <CharacterChatDialog
        open={showChat}
        onOpenChange={setShowChat}
        character={chatChar as any}
        truths={chatChar ? truths.filter(t => t.characterId === chatChar.id) : []}
      />
    </div>
  );
}
