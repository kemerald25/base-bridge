# Security Fixes Applied

## Bug 1: Exposed Credentials in .env.bak ✅ FIXED

### Issue
A `.env.bak` file containing sensitive database credentials was committed to the repository, exposing:
- PostgreSQL connection string
- Database username and password
- Potentially other API keys

### Actions Taken
1. ✅ Deleted `.env.bak` file from filesystem
2. ✅ Removed `.env.bak` from git tracking (`git rm --cached .env.bak`)
3. ✅ Updated `.gitignore` to exclude:
   - `.env.bak`
   - `*.bak`
   - `*.backup`

### ⚠️ IMPORTANT: Credential Rotation Required

**You MUST rotate the exposed credentials immediately:**

1. **Database Credentials:**
   - Change the PostgreSQL database password
   - Update the connection string in your `.env` file
   - If using a managed database service, rotate credentials through their dashboard

2. **API Keys:**
   - Review all API keys that were in the `.env.bak` file
   - Regenerate any exposed API keys
   - Update the new keys in your `.env` file

3. **Git History:**
   - The file is still in git history
   - Consider using `git filter-branch` or BFG Repo-Cleaner to remove it from history
   - Or create a new repository if the history cleanup is too complex

### Prevention
- Never commit `.env` files or backups
- Use `.env.example` for template values
- The updated `.gitignore` now prevents this in the future

---

## Bug 2: React Hooks Violation ✅ FIXED

### Issue
Both `useBridgePayment` and `useDirectPayment` hooks were calling `setState` directly during render, causing infinite render loops.

**Affected files:**
- `lib/hooks/useBridgePayment.ts` (lines 133-140)
- `lib/hooks/useDirectPayment.ts` (lines 79-87)

### Problem Code
```typescript
// ❌ BAD: setState during render
if (isSuccess && isProcessing) {
  setIsProcessing(false);
}

if (writeError) {
  setError(writeError.message);
  setIsProcessing(false);
}
```

### Solution Applied
Moved all `setState` calls into `useEffect` hooks with proper dependencies:

```typescript
// ✅ GOOD: setState in useEffect
useEffect(() => {
  if (isSuccess && isProcessing) {
    setIsProcessing(false);
  }
}, [isSuccess, isProcessing]);

useEffect(() => {
  if (writeError) {
    setError(writeError.message);
    setIsProcessing(false);
  }
}, [writeError]);
```

### Changes Made
1. ✅ Added `useEffect` import to both hooks
2. ✅ Wrapped state updates in `useEffect` with proper dependencies
3. ✅ Prevents infinite render loops
4. ✅ Follows React's rules of hooks

---

## Next Steps

1. **Commit the fixes:**
   ```bash
   git add .gitignore lib/hooks/useBridgePayment.ts lib/hooks/useDirectPayment.ts
   git commit -m "Security: Remove .env.bak and fix React hooks violations"
   ```

2. **Rotate exposed credentials** (see above)

3. **Test the application** to ensure hooks work correctly without infinite loops

4. **Consider git history cleanup** for the exposed credentials

