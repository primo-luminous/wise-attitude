import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleLoan() {
  try {
    console.log('=== Creating Sample Loan ===');
    
    // หาพนักงานคนแรกที่ active
    const employee = await prisma.employee.findFirst({
      where: { status: 'active' }
    });
    
    if (!employee) {
      console.log('❌ No active employees found');
      return;
    }
    
    console.log(`Using employee: ${employee.employeeID} - ${employee.name}`);
    
    // หา asset แรกที่มี stock
    const asset = await prisma.asset.findFirst({
      where: { totalQty: { gt: 0 } }
    });
    
    if (!asset) {
      console.log('❌ No assets with stock found');
      return;
    }
    
    console.log(`Using asset: ${asset.sku} - ${asset.name} (Qty: ${asset.totalQty})`);
    
    // สร้างการยืม
    const loan = await prisma.loan.create({
      data: {
        borrowerId: employee.id,
        status: 'OPEN',
        startDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วัน
        note: 'การยืมตัวอย่างสำหรับทดสอบระบบ'
      }
    });
    
    console.log(`✅ Created loan with ID: ${loan.id}`);
    
    // สร้าง loan item
    const loanItem = await prisma.loanItem.create({
      data: {
        loanId: loan.id,
        assetId: asset.id,
        quantity: 1,
        startAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    console.log(`✅ Created loan item with ID: ${loanItem.id}`);
    
    // อัพเดท stock ของ asset
    await prisma.asset.update({
      where: { id: asset.id },
      data: { totalQty: asset.totalQty - 1 }
    });
    
    console.log(`✅ Updated asset stock: ${asset.totalQty - 1}`);
    
    console.log('\n🎉 Sample loan created successfully!');
    console.log(`You can now view it at: /main/loans/${loan.id}`);
    
  } catch (error) {
    console.error('Error creating sample loan:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleLoan();
