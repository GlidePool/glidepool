---
name: Wagmi v2 write pattern
description: Correct pattern for useWriteContract + approval flow in this project.
---

## Pattern
```tsx
const write = useWriteContract();
const receipt = useWaitForTransactionReceipt({ hash: write.data });

write.writeContract({ address, abi, functionName, args });
// write.isPending = wallet prompt open
// receipt.isLoading = waiting for confirmation
// receipt.isSuccess = confirmed
```

## NFT approval before removeLiquidity
Before calling `router.removeLiquidity` for NFT positions, user must do:
```
maverickV2Position.setApprovalForAll(router, true)
```
Check with `isApprovedForAll(owner, router)` — this is a one-time per-wallet approval.

**Why:** The Maverick V2 router acts on behalf of the position NFT. Without approval, the router cannot call pool.removeLiquidity for the NFT's liquidity.

**How to apply:** position-detail.tsx has a 2-step UI: Step 1 = approve (if needed), Step 2 = sign remove. The `routerApproved` boolean gates Step 2.
