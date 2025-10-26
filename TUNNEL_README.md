# LocalTunnel Setup Guide

## การใช้งาน LocalTunnel

LocalTunnel ช่วยให้คุณสามารถเข้าถึง Next.js development server จากภายนอกได้ผ่าน public URL

### วิธีการใช้งาน

1. **เริ่มต้น tunnel:**
   ```bash
   npm run tunnel
   ```

2. **สิ่งที่ script จะทำ:**
   - เริ่ม Next.js development server (port 3000)
   - สร้าง LocalTunnel connection
   - แสดง public URL ที่สามารถเข้าถึงได้จากภายนอก

3. **URL ที่ได้:**
   - จะเป็นรูปแบบ: `https://wiseattitude.loca.lt`
   - หรือ URL อื่นที่ LocalTunnel สร้างให้

### การหยุดการทำงาน

- กด `Ctrl+C` เพื่อหยุดทั้ง server และ tunnel

### หมายเหตุ

- URL จะเปลี่ยนทุกครั้งที่เริ่มใหม่ (เว้นแต่จะใช้ subdomain ที่กำหนด)
- ต้องมี internet connection
- ใช้ได้เฉพาะตอน development เท่านั้น

### Troubleshooting

หากมีปัญหา:
1. ลองใช้ subdomain อื่น
2. ตรวจสอบ internet connection
3. ตรวจสอบว่า port 3000 ว่างอยู่
