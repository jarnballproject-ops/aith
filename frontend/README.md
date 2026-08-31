# หมากระทุปุ๊ป๊ะ — Frontend

Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router v7 + Supabase

Customer / Staff / Admin อยู่ใน application เดียว แยกกันด้วย route และ role ไม่ต้อง deploy สามชุด

## เริ่มต้น

```bash
npm install
npm run dev        # → http://localhost:5173
```

`.env` มีค่า Supabase ให้แล้ว ถ้าตั้งโปรเจ็คใหม่ให้คัดลอกจาก `.env.example`

## คำสั่ง

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | dev server พร้อม hot reload |
| `npm run build` | ตรวจ type แล้ว build ไปที่ `dist/` |
| `npm run preview` | เปิดไฟล์ที่ build แล้ว |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | ตรวจ type อย่างเดียว |
| `npm run test:e2e` | รัน Playwright ครบทุกเทสต์ |
| `npm run test:e2e:ui` | เปิด Playwright UI mode ไว้ไล่ทีละ step |
| `npm run test:e2e:report` | เปิดรายงานผลรันล่าสุด |

## โครงสร้าง

```
src/
├── apps/
│   ├── customer/        ลูกค้า — ไม่ต้อง login เข้าผ่าน QR
│   │   └── pages/visit/ แท็บในหน้าโต๊ะ: เมนู / ออเดอร์ / บิล
│   ├── staff/           พนักงาน — แดชบอร์ด คิว ผังโต๊ะ จอครัว
│   └── admin/           ผู้จัดการ — ภาพรวมยอดขาย จัดการเมนู
├── features/            ตรรกะแยกตาม domain — service ต่อกับ Supabase
│   ├── auth/  billing/  menu/  order/  queue/  table/  visit/
├── components/ui/       ชิ้นส่วนที่ใช้ซ้ำ (Button, Card, Badge, Field, QrCode)
├── context/             AuthProvider + auth context (role อยู่ที่นี่)
├── hooks/               useAuth, useLiveQuery
├── lib/                 supabase client, format, cn
├── routes/              นิยาม route ทั้งสามแอป
├── styles/              Tailwind + theme สี brand
└── types/               database.types.ts (gen จาก schema จริง)
```

## แนวทางที่ใช้

**เรียก Supabase ผ่าน service เท่านั้น** — component ไม่เรียก `supabase.from()` ตรง ๆ
ทุก query อยู่ใน `src/features/<domain>/<domain>Service.ts` ทำให้เปลี่ยน query ที่เดียวแล้วจบ

```ts
import { orderService } from '@/features/order/orderService'
await orderService.place(visitId, [{ menu_item_id, qty: 2 }])
```

**Realtime ด้วย `useLiveQuery`** — เฝ้าตารางที่กำหนดแล้วดึงข้อมูลใหม่ทั้งก้อนเมื่อมีการเปลี่ยนแปลง

```tsx
const tables = useLiveQuery(() => tableService.list(), { tables: ['dining_tables'] })
```

เลือก refetch ทั้งก้อนแทนการ patch state จาก payload เพราะ query ส่วนใหญ่เป็น join หลายตาราง
และแถวที่ RLS กรองออกจะทำให้ state เพี้ยนโดยไม่รู้ตัว

**การเขียนข้อมูลสำคัญไปที่ RPC ไม่ใช่ `insert` ตรง ๆ** — `place_order`, `open_visit`, `issue_bill`,
`pay_bill` เป็น `SECURITY DEFINER` ใน Postgres ที่ตรวจสิทธิ์ ตรวจสถานะ และ snapshot ราคาไว้ในตัว
ตรรกะเงินจึงอยู่ในฐานข้อมูล ไม่ใช่ในเบราว์เซอร์ที่ผู้ใช้แก้ได้

**Path alias** — `@/` ชี้ไปที่ `src/`

## สิทธิ์การเข้าถึง

| Role | เข้าถึงได้ |
| --- | --- |
| `customer` (รวม anonymous) | หน้าลูกค้า + โต๊ะที่ตัวเองสแกน QR เข้าไป |
| `kitchen` `staff` `cashier` | `/staff` ทั้งหมด |
| `manager` `owner` | `/staff` + `/admin` |

ตั้ง role ให้บัญชีใหม่ด้วย SQL (หน้า login จะแสดง user id ให้เมื่อ login แล้วยังไม่มีสิทธิ์):

```sql
update profiles set role = 'staff' where id = '<user-id>';
```

## E2E Test (Playwright)

```bash
npm run test:e2e          # รันทั้งหมด (~40 วิ)
npm run test:e2e:ui       # ไล่ทีละ step พร้อม time-travel
```

```
e2e/
├── auth.setup.ts       ล็อกอินหนึ่งครั้งต่อ role แล้วเก็บ session ไว้เป็นไฟล์
├── customer.spec.ts    รับคิว, บอร์ดคิว, QR ผิด, เช็คว่าเนื้อหาไม่ล้นจอมือถือ
├── staff.spec.ts       แดชบอร์ด, ผังโต๊ะ, จอครัว + flow เต็ม คิว→โต๊ะ→QR→สั่ง→ครัว
├── admin.spec.ts       ยอดขาย, เปิด/ปิดขายเมนู, ขอบเขตสิทธิ์ของ role staff
└── cleanup.spec.ts     teardown — ลบคิว/visit ที่เทสต์สร้างและคืนสถานะโต๊ะ
```

รันบน 2 project: `desktop` (1280px) และ `mobile` (Pixel 7) โดย `mobile` รันเฉพาะหน้าลูกค้า

**เทสต์ยิงไป Supabase จริง ไม่ได้ mock** — จับบั๊กที่ unit test มองไม่เห็นได้ เช่นตอนแรกลืมใส่
`menu_items` ลง realtime publication ทำให้แอดมินกดปิดขายแล้วหน้าจอไม่อัปเดต เทสต์จับได้ทันที
ด้วยเหตุนี้จึงตั้ง `workers: 1` (หลาย worker จะแย่งโต๊ะกันเอง) และมี teardown เก็บกวาดทุกครั้ง
แถวที่เทสต์สร้างจะมี `contact_name = 'E2E'` กำกับไว้ให้ teardown หาเจอ

## Types ของฐานข้อมูล

`src/types/database.types.ts` gen มาจาก schema จริง หลังแก้ schema ทุกครั้งให้รันใหม่:

```bash
npx supabase login
npx supabase gen types typescript --project-id ummcibitjeypoujgpahw > src/types/database.types.ts
```

## เรื่องที่ต้องระวัง

- **Anonymous sign-ins ต้องเปิด** ที่ Supabase Dashboard → Authentication → Sign In / Providers
  ไม่งั้นหน้า `/t/:token` ของลูกค้าจะเข้าไม่ได้
- คีย์ใน `.env` เป็น **publishable key** ที่ถูกฝังลงใน bundle และเปิดเผยต่อสาธารณะโดยตั้งใจ
  ความปลอดภัยของข้อมูลขึ้นอยู่กับ **RLS** ที่ตั้งไว้ในฐานข้อมูลทั้งหมด
- **อย่า** เอา `service_role` key มาไว้ในโปรเจ็คนี้เด็ดขาด — คีย์นั้นข้าม RLS ได้ ต้องใช้ฝั่ง server เท่านั้น
