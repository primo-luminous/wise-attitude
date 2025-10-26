import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLoanDetails() {
  try {
    console.log('=== Testing Loan Details ===');
    
    // ตรวจสอบข้อมูลการยืมทั้งหมด
    const loans = await prisma.loan.findMany({
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
            employeeID: true
          }
        },
        items: {
          include: {
            asset: {
              select: {
                id: true,
                sku: true,
                name: true,
                isSerialized: true
              }
            },
            assetUnit: {
              select: {
                id: true,
                serialNumber: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${loans.length} loans in database:`);
    
    if (loans.length === 0) {
      console.log('\n❌ No loans found in database');
      console.log('You need to create some loans first.');
      
      // แสดงข้อมูลพนักงานที่มีอยู่
      const employees = await prisma.employee.findMany({
        where: { status: 'active' },
        select: { id: true, name: true, employeeID: true }
      });
      
      console.log(`\nAvailable employees: ${employees.length}`);
      employees.forEach(emp => {
        console.log(`- ${emp.employeeID}: ${emp.name}`);
      });
      
      // แสดงข้อมูล assets ที่มีอยู่
      const assets = await prisma.asset.findMany({
        where: { totalQty: { gt: 0 } },
        select: { id: true, sku: true, name: true, totalQty: true }
      });
      
      console.log(`\nAvailable assets: ${assets.length}`);
      assets.forEach(asset => {
        console.log(`- ${asset.sku}: ${asset.name} (Qty: ${asset.totalQty})`);
      });
      
      return;
    }
    
    // แสดงรายละเอียดการยืม
    loans.forEach((loan, index) => {
      console.log(`\nLoan ${index + 1}:`);
      console.log(`- ID: ${loan.id}`);
      console.log(`- Status: ${loan.status}`);
      console.log(`- Due Date: ${loan.dueDate?.toISOString().slice(0, 10) || 'Not set'}`);
      console.log(`- Borrower: ${loan.borrower.employeeID} - ${loan.borrower.name}`);
      console.log(`- Items: ${loan.items.length}`);
      
      loan.items.forEach((item, itemIndex) => {
        console.log(`  Item ${itemIndex + 1}:`);
        console.log(`    - Asset: ${item.asset.sku} - ${item.asset.name}`);
        console.log(`    - Quantity: ${item.quantity}`);
        console.log(`    - Serial Number: ${item.assetUnit?.serialNumber || 'N/A'}`);
        console.log(`    - Start: ${item.startAt?.toISOString().slice(0, 10) || 'Not set'}`);
        console.log(`    - Due: ${item.dueAt?.toISOString().slice(0, 10) || 'Not set'}`);
      });
    });
    
    console.log('\n✅ Loan details test completed successfully!');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoanDetails();
