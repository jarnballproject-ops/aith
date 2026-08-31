# หมากระทุปุ๊ป๊ะ

> หิวปุ๊บ ป๊ะหมูกระทะปั๊บ

ระบบร้านหมูกระทะครบวงจร — ลูกค้า พนักงาน และเจ้าของร้านใช้ระบบเดียวกัน เชื่อมกันแบบเรียลไทม์
โดยมี **Visit** เป็นตัวเชื่อมทุกอย่างตั้งแต่รับคิวจนปิดโต๊ะ

## สถานะตอนนี้

MVP ระดับ **P0** ใช้งานได้จริงแล้ว: Queue → Table → Visit → Order → Kitchen → Bill → Payment

| ส่วน | ทำแล้ว | ยังไม่ได้ทำ |
| --- | --- | --- |
| Customer | รับคิว, ดูสถานะคิว, สแกน QR เข้าโต๊ะ, ดูเมนู, สั่งอาหาร, ติดตามสถานะอาหาร, เรียกพนักงาน, ดูเวลาที่เหลือ, ดูบิล | สมาชิก/แต้ม, รีวิว, สั่งซ้ำ, Add-on รายจาน |
| Staff | แดชบอร์ดเรียลไทม์, จัดการคิว, แนะนำโต๊ะ, เปิด Visit + สร้าง QR, ผังโต๊ะ, จอครัวแยก station, รับ service call, เปิดบิล/รับชำระ/ปิดโต๊ะ | ย้ายโต๊ะ, รวม/แยกบิล, พิมพ์ใบเสร็จ |
| Admin | ภาพรวมยอดขายวันนี้, เมนูขายดี, เปิด/ปิดเมนู | Inventory, Purchasing, Employee, Promotion UI, Multi-branch |

เทียบกับ Roadmap ในเอกสาร: จบ Phase 1–5 ระดับใช้งานได้ · Phase 6–7 เริ่มไว้บางส่วน · Phase 8–9 ยังไม่แตะ

## โครงสร้าง

```
aith/
├── frontend/              เว็บทั้ง 3 ส่วนใน app เดียว แยกด้วย route + role
│   └── src/apps/{customer,staff,admin}
├── supabase/migrations/   schema, RLS, RPC และข้อมูลตั้งต้น
└── Markdown               เอกสารสเปคและ roadmap ต้นฉบับ
```

## เริ่มใช้งาน

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

| เส้นทาง | ใคร |
| --- | --- |
| `/` | ลูกค้า — รับคิว |
| `/q/:token` | ลูกค้า — ดูสถานะคิวของตัวเอง |
| `/t/:token` | ลูกค้า — หน้าโต๊ะ (ปลายทางของ QR) |
| `/staff` | พนักงาน — ต้อง login |
| `/admin` | ผู้จัดการ/เจ้าของ — ต้อง login |

## บัญชีทดสอบ

สร้างไว้ในฐานข้อมูลแล้ว ทุกบัญชียืนยันอีเมลเรียบร้อย ล็อกอินได้ทันที

| อีเมล | รหัสผ่าน | Role | `/staff` | `/admin` |
| --- | --- | --- | :-: | :-: |
| `admin@puppa.test` | `puppa-admin-1234` | `owner` | ✓ | ✓ |
| `manager@puppa.test` | `puppa-demo-1234` | `owner` | ✓ | ✓ |
| `staff@puppa.test` | `puppa-staff-1234` | `staff` | ✓ | ✗ |
| `kitchen@puppa.test` | `puppa-kitchen-1234` | `kitchen` | ✓ | ✗ |

> **เปลี่ยนรหัสหรือลบทิ้งก่อนใช้งานจริง** — รหัสเหล่านี้อยู่ใน repo และเดาง่าย

`staff` กับ `kitchen` เข้าหลังบ้านไม่ได้ และ RLS กันไม่ให้แก้เมนู/ราคาถึงแม้จะยิง API ตรงก็ตาม
ไม่ได้กันแค่ที่ UI ตรวจสอบแล้วด้วยการยิง PATCH เข้า `menu_items` ตรง ๆ

เพิ่มบัญชีใหม่: สมัครผ่านหน้า `/staff` แล้วตั้ง role ด้วย SQL (หน้า login จะแสดง user id ให้)

```sql
update profiles set role = 'cashier' where id = '<user-id>';
```

ลบบัญชีทดสอบทั้งหมด:

```sql
delete from auth.users where email like '%@puppa.test';
```

## ต้องทำก่อนใช้ฝั่งลูกค้า

เปิด **Anonymous sign-ins** ที่ Supabase Dashboard → Authentication → Sign In / Providers

ลูกค้าไม่ต้องสมัครสมาชิก แต่ระบบยังต้องมี `auth.uid()` เพื่อผูกคนกับ Visit และให้ RLS ยอมส่ง
realtime ให้ ตอนนี้ยังปิดอยู่ หน้า `/t/:token` จึงจะขึ้นข้อความบอกวิธีเปิดแทนที่จะพัง

## Visit — หัวใจของระบบ

```
รับคิว → เรียกคิว → เลือกโต๊ะ → เปิด Visit ─┬─ QR ประจำโต๊ะ
                                          ├─ orders → order_items → ครัว
                                          ├─ service_calls
                                          └─ bill → payment → ปิดโต๊ะ
```

ทุกอย่างที่เกิดขึ้นบนโต๊ะผูกกับ `visits.id` เดียว ทำให้ตอบได้ว่ายอดขายก้อนนี้มาจากคิวไหน
ใช้โต๊ะไปกี่นาที สั่งกี่รอบ และใครเป็นคนเปิด/ปิด

## เอกสารเพิ่มเติม

- [frontend/README.md](frontend/README.md) — โครงสร้างโค้ด, การเรียก API, การ generate types
- [supabase/migrations/](supabase/migrations/) — schema ทั้งหมดพร้อมคอมเมนต์
