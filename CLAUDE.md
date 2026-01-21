# Claude Instructions for TrueHub

## Deployment

- **Git push triggers auto-deploy to Vercel**
- `git push origin main` -> Vercel auto-deploys to production
- **DO NOT run `vercel --prod` manually** - this causes duplicate deployments
- Just push to Git and wait for auto-deploy

## Project Structure

- Next.js 15 (App Router)
- Database: PostgreSQL (Supabase) with Prisma + PrismaPg adapter
- Auth: NextAuth.js

## Key APIs

### Giftishow API

- Base URL: `https://bizapi.giftishow.com/bizApi`
- Goods detail uses **path parameter**: `/goods/{goodsCode}` (NOT body parameter)
- Auth via `custom_auth_code`, `custom_auth_token` in both headers and body

## Common Tasks

### Restore inactive giftshop products

```bash
npx tsx -e "
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

prisma.giftishowGoods.updateMany({
  where: { goodsStateCd: 'SALE', isActive: false },
  data: { isActive: true }
}).then(r => console.log('Restored:', r.count));
"
```
