# Setup Guide

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - Database URL (SQLite by default)
   - Base RPC URL
   - Solana RPC URL
   - Contract addresses (already configured for mainnet)

3. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Management

### View Database
```bash
npm run db:studio
```

This opens Prisma Studio where you can view and edit data.

### Reset Database
```bash
rm prisma/dev.db
npx prisma db push
```

## Next Steps

### 1. Integrate Real Wallet Connections

Currently, wallet connections are placeholders. You need to:

**For Base (Ethereum) wallets:**
- Install and configure `wagmi` and `viem`
- Set up wallet connectors (MetaMask, Coinbase Wallet, etc.)
- Update payment flow to use real wallet transactions

**For Solana wallets:**
- Install and configure `@solana/wallet-adapter-react`
- Set up wallet adapters (Phantom, Solflare, etc.)
- Update payment flow to use real Solana transactions

### 2. Implement Bridge Integration

The bridge integration files are in `lib/bridge/` but need to be completed:

- **Base Bridge (`lib/bridge/base.ts`)**: 
  - Add full Bridge contract ABI
  - Implement actual transaction building
  - Add proof generation for Base → Solana

- **Solana Bridge (`lib/bridge/solana.ts`)**:
  - Import bridge program IDL
  - Implement actual instruction building
  - Add relayer support for auto-execution

### 3. Add Payment Processing

Update `app/(routes)/invoices/[id]/pay/page.tsx` to:

1. Check wallet balance before payment
2. Approve token spending (for ERC20 tokens)
3. Execute bridge transaction
4. Monitor transaction status
5. Update invoice on confirmation

### 4. Implement Subscription Automation

Create a cron job or background worker to:

1. Check for subscriptions due for billing
2. Generate invoices automatically
3. Process payments (or notify payer)
4. Update subscription next billing date

Example using Vercel Cron:
```typescript
// app/api/cron/subscriptions/route.ts
export async function GET() {
  // Find subscriptions due for billing
  // Create invoices
  // Process payments
}
```

### 5. Add Real-time Updates

Consider adding:
- WebSocket connections for real-time payment status
- Server-Sent Events (SSE) for invoice updates
- Push notifications for payment confirmations

### 6. Security Enhancements

- Add authentication (NextAuth.js, etc.)
- Implement rate limiting
- Add input validation and sanitization
- Set up CORS properly
- Add request signing for sensitive operations

### 7. Testing

- Unit tests for utilities
- Integration tests for API routes
- E2E tests for payment flows
- Test bridge transactions on testnets first

## Production Deployment

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..." # Use PostgreSQL in production
NEXT_PUBLIC_BASE_RPC_URL="https://mainnet.base.org"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
# ... other production configs
```

### Recommended Hosting

- **Vercel**: Easy Next.js deployment
- **Railway/Render**: Good for full-stack apps with databases
- **Self-hosted**: Docker container with PostgreSQL

### Database Migration

For production, use Prisma migrations:
```bash
npx prisma migrate dev --name init
```

## Troubleshooting

### Database Issues
- Ensure `DATABASE_URL` is set correctly
- Run `npx prisma generate` after schema changes
- Check Prisma Studio to verify data

### Bridge Transaction Issues
- Verify contract addresses match your network
- Check RPC endpoints are accessible
- Test on testnets first (Base Sepolia + Solana Devnet)

### Wallet Connection Issues
- Ensure wallet extensions are installed
- Check network configuration matches
- Verify RPC endpoints are correct

## Resources

- [Base Bridge Documentation](https://docs.base.org/bridge)
- [Base Bridge GitHub](https://github.com/base/bridge)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

