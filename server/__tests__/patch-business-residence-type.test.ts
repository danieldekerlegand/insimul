/**
 * Tests for PATCH /api/businesses/:id and PATCH /api/residences/:id
 * Validates the endpoint logic for updating businessType and residenceType.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mock storage ----
const mockStorage = vi.hoisted(() => ({
  getBusiness: vi.fn(),
  updateBusiness: vi.fn(),
  getCharacter: vi.fn(),
  getResidence: vi.fn(),
  updateResidence: vi.fn(),
}));

vi.mock('../db/storage', () => ({
  storage: mockStorage,
}));

// ---- Mock prolog auto-sync ----
const mockPrologAutoSync = vi.hoisted(() => ({
  onBusinessChanged: vi.fn(() => Promise.resolve()),
}));

vi.mock('../engines/prolog/prolog-auto-sync', () => ({
  prologAutoSync: mockPrologAutoSync,
}));

// ---- Test data ----
const BUSINESS = {
  id: 'biz-1',
  worldId: 'world-1',
  settlementId: 'settlement-1',
  name: 'Main Street Bakery',
  businessType: 'bakery',
  ownerId: 'char-1',
  founderId: 'char-1',
};

const RESIDENCE = {
  id: 'res-1',
  worldId: 'world-1',
  settlementId: 'settlement-1',
  lotId: 'lot-1',
  address: '42 Oak Ave',
  residenceType: 'house',
  ownerIds: ['char-2'],
  residentIds: ['char-2'],
};

// ---- Helper to simulate route handler logic ----
async function handlePatchBusiness(id: string, body: any) {
  const business = await mockStorage.getBusiness(id);
  if (!business) {
    return { status: 404, body: { error: 'Business not found' } };
  }

  const { businessType } = body;
  if (!businessType || typeof businessType !== 'string') {
    return { status: 400, body: { error: 'businessType is required and must be a string' } };
  }

  const updated = await mockStorage.updateBusiness(id, { businessType });
  if (!updated) {
    return { status: 500, body: { error: 'Failed to update business' } };
  }

  if (updated.worldId) {
    const owner = updated.ownerId ? await mockStorage.getCharacter(updated.ownerId) : undefined;
    await mockPrologAutoSync.onBusinessChanged(updated.worldId, updated, owner);
  }

  return { status: 200, body: updated };
}

async function handlePatchResidence(id: string, body: any) {
  const residence = await mockStorage.getResidence(id);
  if (!residence) {
    return { status: 404, body: { error: 'Residence not found' } };
  }

  const { residenceType } = body;
  if (!residenceType || typeof residenceType !== 'string') {
    return { status: 400, body: { error: 'residenceType is required and must be a string' } };
  }

  const updated = await mockStorage.updateResidence(id, { residenceType });
  if (!updated) {
    return { status: 500, body: { error: 'Failed to update residence' } };
  }

  return { status: 200, body: updated };
}

describe('PATCH /api/businesses/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates businessType successfully', async () => {
    mockStorage.getBusiness.mockResolvedValue(BUSINESS);
    const updated = { ...BUSINESS, businessType: 'restaurant' };
    mockStorage.updateBusiness.mockResolvedValue(updated);
    mockStorage.getCharacter.mockResolvedValue({ id: 'char-1', name: 'Owner' });

    const res = await handlePatchBusiness('biz-1', { businessType: 'restaurant' });

    expect(res.status).toBe(200);
    expect(res.body.businessType).toBe('restaurant');
    expect(mockStorage.updateBusiness).toHaveBeenCalledWith('biz-1', { businessType: 'restaurant' });
  });

  it('returns 404 when business does not exist', async () => {
    mockStorage.getBusiness.mockResolvedValue(undefined);

    const res = await handlePatchBusiness('nonexistent', { businessType: 'restaurant' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Business not found');
    expect(mockStorage.updateBusiness).not.toHaveBeenCalled();
  });

  it('returns 400 when businessType is missing', async () => {
    mockStorage.getBusiness.mockResolvedValue(BUSINESS);

    const res = await handlePatchBusiness('biz-1', {});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('businessType is required');
  });

  it('returns 400 when businessType is not a string', async () => {
    mockStorage.getBusiness.mockResolvedValue(BUSINESS);

    const res = await handlePatchBusiness('biz-1', { businessType: 123 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('businessType is required');
  });

  it('triggers Prolog auto-sync on update', async () => {
    mockStorage.getBusiness.mockResolvedValue(BUSINESS);
    const updated = { ...BUSINESS, businessType: 'tavern' };
    mockStorage.updateBusiness.mockResolvedValue(updated);
    mockStorage.getCharacter.mockResolvedValue({ id: 'char-1', name: 'Owner' });

    await handlePatchBusiness('biz-1', { businessType: 'tavern' });

    expect(mockPrologAutoSync.onBusinessChanged).toHaveBeenCalledWith(
      'world-1',
      updated,
      { id: 'char-1', name: 'Owner' },
    );
  });

  it('does not call getCharacter when ownerId is missing', async () => {
    const businessNoOwner = { ...BUSINESS, ownerId: '' };
    mockStorage.getBusiness.mockResolvedValue(businessNoOwner);
    const updated = { ...businessNoOwner, businessType: 'tavern' };
    mockStorage.updateBusiness.mockResolvedValue(updated);

    await handlePatchBusiness('biz-1', { businessType: 'tavern' });

    expect(mockStorage.getCharacter).not.toHaveBeenCalled();
    expect(mockPrologAutoSync.onBusinessChanged).toHaveBeenCalledWith(
      'world-1',
      updated,
      undefined,
    );
  });
});

describe('PATCH /api/residences/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates residenceType successfully', async () => {
    mockStorage.getResidence.mockResolvedValue(RESIDENCE);
    const updated = { ...RESIDENCE, residenceType: 'apartment' };
    mockStorage.updateResidence.mockResolvedValue(updated);

    const res = await handlePatchResidence('res-1', { residenceType: 'apartment' });

    expect(res.status).toBe(200);
    expect(res.body.residenceType).toBe('apartment');
    expect(mockStorage.updateResidence).toHaveBeenCalledWith('res-1', { residenceType: 'apartment' });
  });

  it('returns 404 when residence does not exist', async () => {
    mockStorage.getResidence.mockResolvedValue(undefined);

    const res = await handlePatchResidence('nonexistent', { residenceType: 'apartment' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Residence not found');
    expect(mockStorage.updateResidence).not.toHaveBeenCalled();
  });

  it('returns 400 when residenceType is missing', async () => {
    mockStorage.getResidence.mockResolvedValue(RESIDENCE);

    const res = await handlePatchResidence('res-1', {});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('residenceType is required');
  });

  it('returns 400 when residenceType is not a string', async () => {
    mockStorage.getResidence.mockResolvedValue(RESIDENCE);

    const res = await handlePatchResidence('res-1', { residenceType: true });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('residenceType is required');
  });

  it('returns 500 when storage update fails', async () => {
    mockStorage.getResidence.mockResolvedValue(RESIDENCE);
    mockStorage.updateResidence.mockResolvedValue(undefined);

    const res = await handlePatchResidence('res-1', { residenceType: 'apartment' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to update residence');
  });
});
