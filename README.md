# WiseAttitude - Asset Management System

ระบบจัดการทรัพย์สินที่พัฒนาด้วย Next.js 15, Prisma, และ PostgreSQL พร้อมระบบแจ้งเตือนแบบ Real-time

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และเพิ่ม:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/wiseattitude"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. ตั้งค่า Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npx tsx scripts/seed.ts
```

### 4. รัน Development Server
```bash
npm run dev
```

แอปพลิเคชันจะเปิดที่ `http://localhost:3000`

## 🔐 ระบบ Authentication

### Test Accounts
หลังจากรัน seed script แล้ว คุณสามารถใช้บัญชีทดสอบเหล่านี้:

| Email | Password | Role | Status |
|-------|----------|------|--------|
| khem@bestlivingcondo.com | password123 | Administrator | Active |
| admin@wiseattitude.com | password123 | Admin | Active |
| john.doe@wiseattitude.com | password123 | Senior Developer | Must Change Password |
| jane.smith@wiseattitude.com | password123 | HR Manager | Active |

### Features
- ✅ Login ด้วย Email และ Password
- ✅ Password Hashing ด้วย bcrypt
- ✅ Session Management พร้อม "Remember Me"
- ✅ Middleware Protection
- ✅ User Status Validation
- ✅ Force Password Change
- ✅ Logout Functionality
- ✅ Auto Session Refresh
- ✅ Device Fingerprinting
- ✅ IP Address Tracking

## 🎨 ระบบแจ้งเตือน SweetAlert2

### การใช้งาน SweetAlert2
ระบบใช้ SweetAlert2 สำหรับการแจ้งเตือนทุกอย่าง โดยมี utility functions ที่พร้อมใช้งาน:

```typescript
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo, 
  showConfirm,
  showToast,
  showLoading,
  closeLoading 
} from '@/lib/sweetalert';

// Success notification
showSuccess('สำเร็จ', 'ดำเนินการเสร็จสิ้น');

// Error notification
showError('เกิดข้อผิดพลาด', 'ไม่สามารถดำเนินการได้');

// Confirmation dialog
const result = await showConfirm('ยืนยัน', 'คุณต้องการดำเนินการหรือไม่?');
if (result.isConfirmed) {
  // User confirmed
}

// Toast notification
showToast('บันทึกข้อมูลสำเร็จ', 'success');

// Loading state
showLoading('กำลังโหลด...');
// ... do something
closeLoading();
```

### SweetAlert2 Features
- ✅ **Custom Styling** - ปรับแต่งให้เข้ากับ theme ของแอป
- 🌐 **ภาษาไทย** - ข้อความทั้งหมดเป็นภาษาไทย
- ⚡ **Loading States** - แสดงสถานะโหลดระหว่างการทำงาน
- 🔄 **Interactive Elements** - คลิกเพื่อดูข้อมูลเพิ่มเติม
- 📱 **Responsive** - ทำงานได้ดีบนทุกขนาดหน้าจอ
- 🎨 **Custom Classes** - CSS classes สำหรับปรับแต่งสไตล์

## 🔔 ระบบแจ้งเตือน Real-time

### Notification Features
- ✅ **Real-time Notifications** - แจ้งเตือนแบบ real-time
- ✅ **Notification Bell** - กระดิ่งแจ้งเตือนใน Navbar
- ✅ **Unread Count** - แสดงจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
- ✅ **Auto Refresh** - อัพเดตอัตโนมัติทุก 30 วินาที
- ✅ **Mark as Read** - ทำเครื่องหมายว่าอ่านแล้ว
- ✅ **Delete Notifications** - ลบแจ้งเตือน
- ✅ **Read All** - อ่านทั้งหมด
- ✅ **Delete All** - ลบทั้งหมด

### Notification Types
- 🔄 **LOAN_CREATED** - การยืมใหม่
- ↩️ **LOAN_RETURNED** - การคืน
- ⏰ **LOAN_OVERDUE** - เกินกำหนด
- 🔄 **LOAN_STATUS_CHANGED** - เปลี่ยนสถานะการยืม
- ➕ **ASSET_ADDED** - เพิ่มทรัพย์สิน
- ✏️ **ASSET_UPDATED** - อัพเดตทรัพย์สิน
- 🔧 **SYSTEM** - ระบบ

## 📊 Dashboard Features

### Statistics Cards
- 👥 **พนักงานทั้งหมด** - จำนวนพนักงานทั้งหมดและที่ใช้งาน
- 📦 **ทรัพย์สินทั้งหมด** - จำนวนทรัพย์สินทั้งหมดและที่ใช้งานได้
- 📋 **การยืมทั้งหมด** - จำนวนการยืมทั้งหมดและที่กำลังยืม
- ⚠️ **การยืมเกินกำหนด** - จำนวนการยืมที่เกินกำหนด

### Charts & Analytics
- 📈 **กราฟแท่งเทียน** - แสดงจำนวนการยืมในแต่ละเดือน
- 📅 **เลือกปี** - เลือกดูข้อมูลย้อนหลัง 5 ปี
- 📤 **Export** - ส่งออกเป็น PDF และ Excel
- 🌤️ **Weather Widget** - Widget สภาพอากาศ

### Recent Activities
- 📝 **กิจกรรมล่าสุด** - แสดงการแจ้งเตือนล่าสุด 10 รายการ
- 🕒 **เวลาจริง** - แสดงเวลาที่เป็นจริง
- 👁️ **สถานะอ่าน** - แสดงสถานะ read/unread

## 📁 โครงสร้างโปรเจค

```
src/
├── app/
│   ├── actions/             # Server Actions
│   │   ├── auth.ts          # Authentication actions
│   │   ├── dashboard.ts     # Dashboard statistics
│   │   ├── employees.ts     # Employee management
│   │   ├── assets.ts        # Asset management
│   │   ├── loans.ts         # Loan management
│   │   ├── profile.ts       # Profile management
│   │   └── ...
│   ├── api/                 # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── notifications/   # Notification endpoints
│   │   └── ...
│   ├── auth/                # Authentication pages
│   │   ├── login/           # Login page
│   │   ├── forgot-password/ # Forgot password
│   │   └── reset-password/  # Reset password
│   ├── main/                # Main application
│   │   ├── components/      # Main components
│   │   │   ├── assets/      # Asset components
│   │   │   ├── employees/   # Employee components
│   │   │   ├── loans/       # Loan components
│   │   │   ├── profile/     # Profile components
│   │   │   └── common/      # Common components
│   │   ├── assets/          # Asset pages
│   │   ├── employees/       # Employee pages
│   │   ├── loans/           # Loan pages
│   │   ├── profile/         # Profile page
│   │   ├── layout.tsx       # Main layout
│   │   └── page.tsx         # Dashboard
│   ├── components/          # Shared components
│   │   ├── Login/           # Login components
│   │   ├── SweetAlertProvider.tsx
│   │   └── SessionMonitor.tsx
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   ├── layout/              # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MainLayoutClient.tsx
│   ├── ui/                  # UI components
│   │   ├── NotificationBell.tsx
│   │   ├── WeatherWidget.tsx
│   │   ├── LoanChart.tsx
│   │   └── Skeleton.tsx
│   ├── forms/               # Form components
│   └── providers/           # Context providers
├── lib/                     # Utility libraries
│   ├── constants/           # Constants
│   ├── types/               # TypeScript types
│   ├── sweetalert.ts        # SweetAlert2 utilities
│   ├── session.ts           # Session management
│   ├── notifications.ts     # Notification utilities
│   └── utils.ts             # General utilities
├── contexts/                # React contexts
│   └── LanguageContext.tsx
├── middleware.ts            # Authentication middleware
└── scripts/                 # Utility scripts
    ├── seed.ts              # Database seeding
    └── test-*.ts            # Test scripts

prisma/
├── schema.prisma            # Database schema
└── migrations/              # Database migrations

public/
├── assets/                  # Static assets
│   ├── images/              # Images
│   └── fonts/               # Fonts
└── *.svg                    # SVG icons
```

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: bcryptjs, Session Cookies
- **Notifications**: SweetAlert2, Real-time Notifications
- **Charts**: ApexCharts, react-apexcharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Context, useState, useEffect
- **API**: Next.js API Routes, Server Actions

## 🔧 Scripts

```bash
# Development
npm run dev          # รัน development server (Turbopack)
npm run build        # Build สำหรับ production
npm run start        # รัน production server
npm run lint         # ตรวจสอบ code quality

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # เปิด Prisma Studio
npx tsx scripts/seed.ts  # Seed database with sample data

# Testing
npx tsx scripts/test-*.ts  # รัน test scripts
```

## 🎯 การทดสอบระบบ

### Authentication
1. **Login**: เข้าสู่ระบบด้วยบัญชีทดสอบ
2. **Remember Me**: ทดสอบการจำ session
3. **Logout**: ออกจากระบบและดู confirmation dialog
4. **Session Management**: ทดสอบการ refresh session อัตโนมัติ

### Dashboard
1. **Statistics Cards**: ดูข้อมูลสถิติแบบ real-time
2. **Loan Chart**: ทดสอบกราฟแท่งเทียนและเลือกปี
3. **Export**: ทดสอบการส่งออก PDF และ Excel
4. **Weather Widget**: ดู widget สภาพอากาศ

### Notifications
1. **Notification Bell**: คลิกกระดิ่งแจ้งเตือน
2. **Real-time Updates**: สร้างการยืมใหม่เพื่อดูแจ้งเตือน
3. **Mark as Read**: ทำเครื่องหมายว่าอ่านแล้ว
4. **Delete**: ลบแจ้งเตือน

### SweetAlert2
1. **Success Messages**: ดูข้อความสำเร็จ
2. **Error Messages**: ดูข้อความผิดพลาด
3. **Confirmation Dialogs**: ทดสอบการยืนยัน
4. **Toast Notifications**: ดู toast notifications

## 🚨 หมายเหตุ

- ระบบนี้ใช้ SweetAlert2 สำหรับการแจ้งเตือนทั้งหมด
- ระบบแจ้งเตือนทำงานแบบ real-time ด้วย polling
- ใช้ session cookies สำหรับ authentication
- กราฟใช้ ApexCharts สำหรับการแสดงผล
- ระบบรองรับการ export ข้อมูลเป็น PDF และ Excel
- อย่าลืมตั้งค่า environment variables ให้ถูกต้อง
- ตรวจสอบให้แน่ใจว่า PostgreSQL server กำลังทำงานอยู่
- สำหรับ production ควรใช้ session library ที่ปลอดภัยกว่าเช่น NextAuth.js

## 📝 License

MIT License
# wise-attitude
# wise-attitude
