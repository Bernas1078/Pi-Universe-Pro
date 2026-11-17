# Security Specification (Phase 0 — Payload-First Security TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every path not explicitly matched is denied (`allow read, write: if false`).
2. **Identity Integrity**: Every document in `/boards/{boardId}`, `/accessories/{accessoryId}`, and `/images/{imageId}` MUST record `ownerId == request.auth.uid` on creation, and `ownerId` + `createdAt` are strictly immutable on update.
3. **Verified Users Only for Writes**: All `create`, `update`, and `delete` operations require `request.auth != null && request.auth.token.email_verified == true`.
4. **Bootstrapped Admin Safety**: Admin privileges require `email_verified == true` AND either the bootstrapped admin email (`bernardo9.smo@gmail.com`) or a document in `/admins/$(request.auth.uid)`. Client SDKs can never self-assign into `/admins`.
5. **Relational Referential Integrity**: If a `board` or `accessory` specifies a non-empty `imageId` on creation or update, the referenced `/images/$(imageId)` document MUST exist (`exists(...)`).
6. **Strict Schema & Size Enforcement**: Every string has a bounded `.size()`, every array has a bounded `.size()` plus first-element type/size check, and no unallowed shadow keys are permitted (`hasOnly(...)`).
7. **Temporal Integrity**: `createdAt == request.time` on `create` and `updatedAt == request.time` on `update`.
8. **Secure List Queries**: `allow list` never uses `get()`/`exists()` and explicitly evaluates `resource.data.isPublic == true || (isSignedIn() && resource.data.ownerId == request.auth.uid)`.

## 2. The "Dirty Dozen" Malicious Payloads (All MUST Return PERMISSION_DENIED)
1. **Shadow Field Injection on Board Create**: Valid board payload + `"isVerified": true` or `"role": "admin"`.
2. **Owner Spoofing on Board Create**: Authenticated as `userA`, submitting `"ownerId": "userB"`.
3. **Unverified Email Write**: Authenticated user with `email_verified: false` attempting to create a board.
4. **Admin Email Spoofing**: Authenticated user with `email: "bernardo9.smo@gmail.com"` and `email_verified: false` attempting to delete another user's board.
5. **Path ID Poisoning**: Creating `/boards/invalid id with spaces and $$$` or a 200-char ID.
6. **Orphaned Image Reference**: Creating a board with `"imageId": "nonexistent_img_999"` when `/images/nonexistent_img_999` does not exist.
7. **Client Timestamp Forgery**: Creating an accessory with `"createdAt": "2020-01-01T00:00:00Z"` instead of `serverTimestamp()`.
8. **Immutable Field Tampering on Update**: Owner attempting to change `ownerId` or `createdAt` during an update.
9. **Unauthorized Cross-User Update**: `userB` attempting to update `userA`'s board.
10. **Value Poisoning on Allowed Key**: Owner updating `benchmarkScore` to `9999` or `"hacked"` (outside `1..100` number range).
11. **Array Overflow / Resource Exhaustion**: Creating a board with 25 items in `keyFeatures` (max 15) or an image with a 250KB string in `url` (max 100,000 chars).
12. **Self-Assigned Admin Escalation**: Authenticated user attempting to create `/admins/<theirUid>` with `{ role: "admin" }`.
