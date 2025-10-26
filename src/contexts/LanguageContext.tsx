"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ข้อมูลภาษา
const translations = {
  th: {
    // Sidebar
    'overview': 'ภาพรวม',
    'dashboard': 'แดชบอร์ด',
    'analytics': 'การวิเคราะห์',
    'calendar': 'ปฏิทิน',
    'documents': 'เอกสาร',
    'people': 'บุคลากร',
    'employees': 'พนักงาน',
    'departments': 'แผนก',
    'positions': 'ตำแหน่ง',
    'assets': 'ทรัพย์สิน',
    'asset_categories': 'หมวดหมู่ทรัพย์สิน',
    'suppliers': 'ผู้จัดจำหน่าย',
    'loans': 'การยืม-คืน',
    'settings': 'ตั้งค่า',
    'general_settings': 'ตั้งค่าทั่วไป',
    'users': 'ผู้ใช้',
    
    // Navbar
    'menu': 'เมนู',
    'notifications': 'การแจ้งเตือน',
    'account': 'บัญชีผู้ใช้',
    'my_profile': 'โปรไฟล์ของฉัน',
    'change_password': 'เปลี่ยนรหัสผ่าน',
    'sign_out': 'ออกจากระบบ',
    
    // Common
    'search': 'ค้นหา',
    'create': 'สร้าง',
    'edit': 'แก้ไข',
    'delete': 'ลบ',
    'save': 'บันทึก',
    'cancel': 'ยกเลิก',
    'close': 'ปิด',
    'loading': 'กำลังโหลด...',
    'no_data': 'ไม่มีข้อมูล',
    'actions': 'การดำเนินการ',
    'created_at': 'วันที่สร้าง',
    'updated_at': 'วันที่อัปเดต',
    
    // Profile Page
    'profile': 'โปรไฟล์',
    'my_profile_title': 'โปรไฟล์ของฉัน',
    'personal_info': 'ข้อมูลส่วนตัว',
    'title_prefix': 'คำนำหน้า',
    'name': 'ชื่อ-นามสกุล',
    'nickname': 'ชื่อเล่น',
    'email': 'อีเมล',
    'personal_phone': 'เบอร์โทรส่วนตัว',
    'work_phone': 'เบอร์โทรที่ทำงาน',
    'birthday': 'วันเกิด',
    'address': 'ที่อยู่',
    'day_off': 'วันหยุด',
    'education_info': 'ข้อมูลการศึกษา',
    'education_level': 'ระดับการศึกษา',
    'university': 'มหาวิทยาลัย',
    'major': 'สาขาวิชา',
    'financial_info': 'ข้อมูลการเงิน',
    'bank_name': 'ชื่อธนาคาร',
    'bank_account': 'หมายเลขบัญชีธนาคาร',
    'social_security': 'ข้อมูลประกันสังคม',
    'social_security_start': 'วันเริ่มประกันสังคม',
    'organization_info': 'ข้อมูลองค์กร',
    'department': 'แผนก',
    'position': 'ตำแหน่ง',
    'profile_image': 'รูปโปรไฟล์',
    'select_profile_image': 'เลือกรูปโปรไฟล์',
    'image_requirements': 'PNG, JPG, WEBP, GIF ขนาดไม่เกิน 2MB',
    
    // Change Password Page
    'change_password_title': 'เปลี่ยนรหัสผ่าน',
    'current_password': 'รหัสผ่านปัจจุบัน',
    'new_password': 'รหัสผ่านใหม่',
    'confirm_password': 'ยืนยันรหัสผ่านใหม่',
    'password_requirements': 'รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร และควรมีตัวอักษร ตัวเลข และสัญลักษณ์',
    'security_tips': 'เคล็ดลับความปลอดภัย:',
    'security_tip_1': 'ใช้รหัสผ่านที่แตกต่างกันสำหรับแต่ละบัญชี',
    'security_tip_2': 'หลีกเลี่ยงการใช้ข้อมูลส่วนตัว เช่น วันเกิด หรือชื่อ',
    'security_tip_3': 'เปลี่ยนรหัสผ่านเป็นประจำ',
    'security_tip_4': 'ไม่แชร์รหัสผ่านกับผู้อื่น',
    'back_to_profile': 'กลับไปหน้าโปรไฟล์',
    'saving': 'กำลังบันทึก...',
    
    // Asset Categories
    'asset_categories_title': 'จัดการหมวดหมู่ทรัพย์สิน',
    'search_categories': 'ค้นหาหมวดหมู่...',
    'create_new_category': 'สร้างหมวดหมู่ใหม่',
    'category_name': 'ชื่อหมวดหมู่',
    'category_description': 'คำอธิบาย',
    'create_category': 'สร้างหมวดหมู่ใหม่',
    'edit_category': 'แก้ไขหมวดหมู่',
    'save_changes': 'บันทึกการเปลี่ยนแปลง',
    'delete_category': 'ลบหมวดหมู่?',
    'delete_warning': 'การดำเนินการนี้ไม่สามารถยกเลิกได้',
    'category_created': 'สร้างหมวดหมู่สำเร็จ',
    'category_updated': 'แก้ไขหมวดหมู่สำเร็จ',
    'category_deleted': 'ลบหมวดหมู่สำเร็จ',
    'create_failed': 'สร้างไม่สำเร็จ',
    'update_failed': 'แก้ไขไม่สำเร็จ',
    'delete_failed': 'ลบไม่สำเร็จ',
    
    // Pagination
    'items_per_page': 'รายการต่อหน้า',
    'showing': 'แสดง',
    'of': 'จาก',
    'items': 'รายการ',
    'page': 'หน้า',
    'previous': 'ก่อนหน้า',
    'next': 'ถัดไป',
  },
  en: {
    // Sidebar
    'overview': 'Overview',
    'dashboard': 'Dashboard',
    'analytics': 'Analytics',
    'calendar': 'Calendar',
    'documents': 'Documents',
    'people': 'People',
    'employees': 'Employees',
    'departments': 'Departments',
    'positions': 'Positions',
    'assets': 'Assets',
    'asset_categories': 'Asset Categories',
    'suppliers': 'Suppliers',
    'loans': 'Loans',
    'settings': 'Settings',
    'general_settings': 'General Settings',
    'users': 'Users',
    
    // Navbar
    'menu': 'Menu',
    'notifications': 'Notifications',
    'account': 'Account',
    'my_profile': 'My Profile',
    'change_password': 'Change Password',
    'sign_out': 'Sign Out',
    
    // Common
    'search': 'Search',
    'create': 'Create',
    'edit': 'Edit',
    'delete': 'Delete',
    'save': 'Save',
    'cancel': 'Cancel',
    'close': 'Close',
    'loading': 'Loading...',
    'no_data': 'No Data',
    'actions': 'Actions',
    'created_at': 'Created At',
    'updated_at': 'Updated At',
    
    // Profile Page
    'profile': 'Profile',
    'my_profile_title': 'My Profile',
    'personal_info': 'Personal Information',
    'title_prefix': 'Title Prefix',
    'name': 'Full Name',
    'nickname': 'Nickname',
    'email': 'Email',
    'personal_phone': 'Personal Phone',
    'work_phone': 'Work Phone',
    'birthday': 'Birthday',
    'address': 'Address',
    'day_off': 'Day Off',
    'education_info': 'Education Information',
    'education_level': 'Education Level',
    'university': 'University',
    'major': 'Major',
    'financial_info': 'Financial Information',
    'bank_name': 'Bank Name',
    'bank_account': 'Bank Account Number',
    'social_security': 'Social Security Information',
    'social_security_start': 'Social Security Start Date',
    'organization_info': 'Organization Information',
    'department': 'Department',
    'position': 'Position',
    'profile_image': 'Profile Image',
    'select_profile_image': 'Select Profile Image',
    'image_requirements': 'PNG, JPG, WEBP, GIF max 2MB',
    
    // Change Password Page
    'change_password_title': 'Change Password',
    'current_password': 'Current Password',
    'new_password': 'New Password',
    'confirm_password': 'Confirm New Password',
    'password_requirements': 'Password should be at least 8 characters long and include letters, numbers, and symbols',
    'security_tips': 'Security Tips:',
    'security_tip_1': 'Use different passwords for each account',
    'security_tip_2': 'Avoid using personal information like birth date or name',
    'security_tip_3': 'Change passwords regularly',
    'security_tip_4': 'Do not share passwords with others',
    'back_to_profile': 'Back to Profile',
    'saving': 'Saving...',
    
    // Asset Categories
    'asset_categories_title': 'Manage Asset Categories',
    'search_categories': 'Search categories...',
    'create_new_category': 'Create New Category',
    'category_name': 'Category Name',
    'category_description': 'Description',
    'create_category': 'Create Category',
    'edit_category': 'Edit Category',
    'save_changes': 'Save Changes',
    'delete_category': 'Delete Category?',
    'delete_warning': 'This action cannot be undone',
    'category_created': 'Category created successfully',
    'category_updated': 'Category updated successfully',
    'category_deleted': 'Category deleted successfully',
    'create_failed': 'Failed to create',
    'update_failed': 'Failed to update',
    'delete_failed': 'Failed to delete',
    
    // Pagination
    'items_per_page': 'Items per page',
    'showing': 'Showing',
    'of': 'of',
    'items': 'items',
    'page': 'Page',
    'previous': 'Previous',
    'next': 'Next',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // เริ่มต้นด้วยภาษาไทย หรือดึงจาก localStorage
  const [language, setLanguage] = useState<Language>('th');

  // โหลดภาษาจาก localStorage เมื่อ component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // ฟังก์ชันเปลี่ยนภาษาและเก็บใน localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // อัปเดต html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
