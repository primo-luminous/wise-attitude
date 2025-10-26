import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAssets() {
  try {
    console.log('=== Testing Assets Data ===');
    
    // ดึงข้อมูล assets จากฐานข้อมูล
    const assets = await prisma.asset.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        units: {
          where: { status: "ACTIVE" },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5 // เอาแค่ 5 รายการแรก
    });
    
    console.log(`Found ${assets.length} assets:`);
    
    assets.forEach((asset, index) => {
      console.log(`\nAsset ${index + 1}:`);
      console.log(`- ID: ${asset.id}`);
      console.log(`- SKU: ${asset.sku}`);
      console.log(`- Name: ${asset.name}`);
      console.log(`- Purchase Price (raw): ${asset.purchasePrice}`);
      console.log(`- Purchase Price (type): ${typeof asset.purchasePrice}`);
      console.log(`- Total Qty: ${asset.totalQty}`);
      console.log(`- Available Qty: ${asset.units.length}`);
      console.log(`- Category: ${asset.category?.name || 'N/A'}`);
    });
    
    // ทดสอบการแปลงข้อมูล
    console.log('\n=== Testing Data Conversion ===');
    const convertedAssets = assets.map(asset => ({
      id: asset.id,
      sku: asset.sku,
      name: asset.name,
      description: asset.description,
      isSerialized: asset.isSerialized,
      totalQty: asset.totalQty,
      availableQty: asset.units.length,
      category: asset.category,
      purchaseDate: asset.purchaseDate?.toISOString().slice(0, 10) || null,
      purchasePrice: asset.purchasePrice ? Number(asset.purchasePrice) : null,
      warrantyMonths: asset.warrantyMonths,
      warrantyUntil: asset.warrantyUntil?.toISOString().slice(0, 10) || null,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString()
    }));
    
    console.log('\nConverted assets (ready for client):');
    convertedAssets.forEach((asset, index) => {
      console.log(`\nConverted Asset ${index + 1}:`);
      console.log(`- Purchase Price: ${asset.purchasePrice} (type: ${typeof asset.purchasePrice})`);
      console.log(`- Total Qty: ${asset.totalQty} (type: ${typeof asset.totalQty})`);
    });
    
    console.log('\n✅ Assets test completed successfully!');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAssets();
