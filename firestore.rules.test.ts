/**
 * Firestore Security Rules Test Suite — Dirty Dozen Verification
 * Verifies that all 12 adversarial payloads from security_spec.md return PERMISSION_DENIED
 * and valid owner/admin operations succeed.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: 'boards' | 'accessories' | 'images' | 'admins';
  docId: string;
  operation: 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Shadow field injection on board create',
    collection: 'boards',
    docId: 'board_shadow_1',
    operation: 'create',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { ownerId: 'userA', name: 'Test Pi', isVerified: true, role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Owner spoofing on board create',
    collection: 'boards',
    docId: 'board_spoof_2',
    operation: 'create',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { ownerId: 'userB', name: 'Spoofed Board' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified email user write',
    collection: 'boards',
    docId: 'board_unverified_3',
    operation: 'create',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: false },
    payload: { ownerId: 'userA', name: 'Unverified Board' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Admin email spoofing without email_verified',
    collection: 'boards',
    docId: 'board_victim_4',
    operation: 'delete',
    auth: { uid: 'attacker', email: 'bernardo9.smo@gmail.com', email_verified: false },
    payload: {},
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Path ID poisoning with invalid characters',
    collection: 'boards',
    docId: 'bad id $$$ ' + 'a'.repeat(140),
    operation: 'create',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { ownerId: 'userA', name: 'Poison ID' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Orphaned imageId reference on board create',
    collection: 'boards',
    docId: 'board_orphan_6',
    operation: 'create',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { ownerId: 'userA', imageId: 'nonexistent_img_999' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Client timestamp forgery on accessory create',
    collection: 'accessories',
    docId: 'acc_time_7',
    operation: 'create',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { ownerId: 'userA', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immutable ownerId modification on update',
    collection: 'boards',
    docId: 'board_imm_8',
    operation: 'update',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { ownerId: 'userB' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Cross-user unauthorized update',
    collection: 'accessories',
    docId: 'acc_cross_9',
    operation: 'update',
    auth: { uid: 'userB', email: 'b@example.com', email_verified: true },
    payload: { name: 'Hijacked Accessory' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Value poisoning on benchmarkScore update',
    collection: 'boards',
    docId: 'board_val_10',
    operation: 'update',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { benchmarkScore: 9999 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Array overflow / oversized image URL resource exhaustion',
    collection: 'images',
    docId: 'img_overflow_11',
    operation: 'create',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { ownerId: 'userA', url: 'https://example.com/' + 'x'.repeat(120000), tags: Array(20).fill('t') },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Self-assigned admin escalation',
    collection: 'admins',
    docId: 'userA',
    operation: 'create',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
];
