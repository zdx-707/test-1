# Security Specification & Threat Model — Sanad Deals

## 1. Data Invariants
1. **Strict Ownership Isolation**: Every `UserProfile`, `Client`, `Proposal`, and `Followup` document is strictly owned by a single verified Firebase Auth user (`ownerUid == request.auth.uid` or `uid == request.auth.uid`). No cross-tenant reads or writes are permitted.
2. **Master Gate Relational Sync**: Every `/proposals/{proposalId}/followups/{followupId}` write validates via `get(/databases/$(database)/documents/proposals/$(proposalId))` that the parent proposal exists and belongs to `request.auth.uid`.
3. **Referential Client Integrity**: On `Proposal` create, if `clientId != "standalone"`, `exists()` and `get()` verify that the referenced client belongs to `request.auth.uid`.
4. **Terminal State Locking**: Once a `Proposal` reaches `status == "accepted"` or `status == "rejected"`, no further modifications to pricing, scope, or status are allowed.
5. **Temporal & Schema Integrity**: `createdAt == request.time` on create, `updatedAt == request.time` on create/update, `createdAt` and `ownerUid` are immutable, and strict `hasAll` + `hasOnly` + `.size()` + regex guards prevent shadow fields and payload exhaustion.

## 2. The "Dirty Dozen" Attack Payloads (All Must Fail with PERMISSION_DENIED)
1. **Unauthenticated Proposal Read**: `get /proposals/prop_1` without `request.auth`.
2. **Unverified Email Write**: `create /clients/cli_1` where `request.auth.token.email_verified == false`.
3. **Cross-Tenant Identity Spoofing**: `create /proposals/prop_2` by `userB` with `ownerUid: "userA"`.
4. **Cross-Tenant List Scraping**: `list /clients` without `where("ownerUid", "==", request.auth.uid)`.
5. **PII Blanket User Lookup**: `list /users` or `get /users/userA` as `userB`.
6. **Shadow Ghost Field Injection**: `create /users/userA` with extra field `isAdmin: true`.
7. **ID Poisoning**: `create /proposals/invalid$id..over128chars` violating `^[a-zA-Z0-9_\-]+$`.
8. **Value Poisoning on Update**: `update /proposals/prop_1` modifying `dealValue` to negative `-500` or string `"free"`.
9. **Immutable Owner Tampering**: `update /clients/cli_1` attempting to reassign `ownerUid` to `userB`.
10. **Terminal State Bypass**: `update /proposals/prop_accepted` (where `status == "accepted"`) attempting to change `dealValue` or revert `status` to `"draft"`.
11. **Timestamp Forgery**: `create /proposals/prop_3` with a backdated client timestamp `createdAt` not equal to `request.time`.
12. **Orphaned / Foreign Subcollection Write**: `create /proposals/prop_owned_by_A/followups/f_1` as `userB`.
