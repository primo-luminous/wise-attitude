import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type AssetInfo = {
  id: number;
  sku: string;
  name: string;
  totalQty: number;
  isSerialized: boolean;
};

async function testLoanAssets() {
  try {
    console.log('=== Testing Loan Assets and Categories ===');
    
    // ดึงข้อมูล assets ทั้งหมด
    const assets = await prisma.asset.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    console.log(`Found ${assets.length} assets in database:`);
    
    if (assets.length === 0) {
      console.log('❌ No assets found in database');
      return;
    }
    
    // แสดงข้อมูล assets
    assets.forEach((asset, index) => {
      console.log(`\nAsset ${index + 1}:`);
      console.log(`- ID: ${asset.id}`);
      console.log(`- SKU: ${asset.sku}`);
      console.log(`- Name: ${asset.name}`);
      console.log(`- Category: ${asset.category?.name || 'ไม่ระบุ'} (ID: ${asset.category?.id || 'N/A'})`);
      console.log(`- Total Qty: ${asset.totalQty}`);
      console.log(`- Is Serialized: ${asset.isSerialized}`);
    });
    
    // ดึงข้อมูลหมวดหมู่ทั้งหมด
    const categories = await prisma.assetCategory.findMany({
      orderBy: { name: "asc" }
    });
    
    console.log(`\n=== Asset Categories ===`);
    console.log(`Found ${categories.length} categories:`);
    
    categories.forEach(category => {
      console.log(`- ID: ${category.id}: ${category.name}`);
    });
    
    // แสดง assets ที่มีหมวดหมู่
    const assetsWithCategory = assets.filter(asset => asset.category);
    console.log(`\n=== Assets with Categories ===`);
    console.log(`Found ${assetsWithCategory.length} assets with categories:`);
    
    // จัดกลุ่มตามหมวดหมู่
    const assetsByCategory = new Map<number, { name: string; assets: AssetInfo[] }>();
    assetsWithCategory.forEach(asset => {
      const categoryId = asset.category!.id;
      const categoryName = asset.category!.name;
      
      if (!assetsByCategory.has(categoryId)) {
        assetsByCategory.set(categoryId, {
          name: categoryName,
          assets: []
        });
      }
      
      assetsByCategory.get(categoryId)!.assets.push({
        id: asset.id,
        sku: asset.sku,
        name: asset.name,
        totalQty: asset.totalQty,
        isSerialized: asset.isSerialized
      });
    });
    
    assetsByCategory.forEach((category, categoryId) => {
      console.log(`\nCategory: ${category.name} (ID: ${categoryId})`);
      console.log(`Assets: ${category.assets.length}`);
      
      category.assets.forEach((asset: AssetInfo) => {
        console.log(`  - ${asset.sku}: ${asset.name} (Qty: ${asset.totalQty})`);
      });
    });
    
    // แสดง assets ที่ไม่มีหมวดหมู่
    const assetsWithoutCategory = assets.filter(asset => !asset.category);
    if (assetsWithoutCategory.length > 0) {
      console.log(`\n=== Assets without Categories ===`);
      console.log(`Found ${assetsWithoutCategory.length} assets without categories:`);
      
      assetsWithoutCategory.forEach(asset => {
        console.log(`- ${asset.sku}: ${asset.name}`);
      });
    }
    
    console.log('\n✅ Loan assets test completed successfully!');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoanAssets();
