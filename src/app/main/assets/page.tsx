import { prisma } from "@/lib/db";
import AssetsClient from "@/app/main/components/assets/AssetsClient";

export const dynamic = 'force-dynamic';

export default async function AssetsPage() {
  // Fetch assets with related data
  const assets = await prisma.asset.findMany({
    include: {
      category: true,
      units: {
        include: {
          loanItem: {
            include: {
              loan: {
                include: {
                  borrower: {
                    select: {
                      id: true,
                      employeeID: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Fetch categories for the form
  const categories = await prisma.assetCategory.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // Transform data to match the expected format
  const transformedAssets = assets.map(asset => {
    // Helper function to convert Decimal to number
    const convertDecimal = (value: unknown): number | null => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value);
      // Handle Prisma Decimal objects
      if (value && typeof value === 'object') {
        if ('toNumber' in value && typeof value.toNumber === 'function') {
          return value.toNumber();
        }
        if ('value' in value && typeof value.value === 'string') {
          return parseFloat(value.value);
        }
        if ('toString' in value && typeof value.toString === 'function') {
          return parseFloat(value.toString());
        }
        if ('constructor' in value && value.constructor.name === 'Decimal') {
          // Try all available methods
          if ('toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
            return (value as { toNumber: () => number }).toNumber();
          }
          if ('value' in value && typeof (value as { value: string | number }).value === 'string') {
            return parseFloat((value as { value: string }).value);
          }
          if ('value' in value && typeof (value as { value: string | number }).value === 'number') {
            return (value as { value: number }).value;
          }
          return parseFloat(value.toString());
        }
      }
      return null;
    };

    // Create a completely clean object without spreading the original asset
    const cleanAsset = {
      id: asset.id,
      sku: asset.sku,
      name: asset.name,
      categoryId: asset.categoryId,
      category: asset.category,
      description: asset.description,
      imageUrl: asset.imageUrl,
      isSerialized: asset.isSerialized,
      totalQty: asset.totalQty,
      status: asset.status,
      supplierId: asset.supplierId,
      // Convert Decimal to number for purchasePrice
      purchasePrice: convertDecimal(asset.purchasePrice),
      // Convert Date objects to strings
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      purchaseDate: asset.purchaseDate?.toISOString() || null,
      warrantyMonths: asset.warrantyMonths,
      warrantyUntil: asset.warrantyUntil?.toISOString() || null,
      // Calculate computed fields
      totalAll: asset.isSerialized ? (asset.units?.length || 0) : asset.totalQty,
      loanedCount: asset.units?.filter(u => u.loanItem).length || 0,
      availableCount: asset.isSerialized 
        ? (asset.units?.filter(u => !u.loanItem).length || 0)
        : (asset.totalQty - (asset.units?.filter(u => u.loanItem).length || 0)),
      // Transform units to include borrower info
      units: asset.units?.map(unit => ({
        id: unit.id,
        assetId: unit.assetId,
        serialNumber: unit.serialNumber,
        status: unit.status,
        note: unit.note,
        // Convert Date objects to strings
        createdAt: unit.createdAt.toISOString(),
        updatedAt: unit.updatedAt.toISOString(),
        borrower: unit.loanItem?.loan?.borrower || null,
      })),
    };

    // Debug: Log the conversion
    console.log(`Asset ${asset.id} purchasePrice:`, {
      original: asset.purchasePrice,
      converted: cleanAsset.purchasePrice,
      type: typeof cleanAsset.purchasePrice
    });

    return cleanAsset;
  });

  // Debug: Log the final result to ensure no Decimal objects remain
  console.log('Transformation completed. Sample asset:', transformedAssets[0]);

  // Final verification: Check for any remaining Decimal objects
  const hasDecimalObjects = transformedAssets.some(asset => {
    const checkForDecimals = (obj: unknown): boolean => {
      if (obj === null || obj === undefined) return false;
      if (typeof obj === 'number' || typeof obj === 'string' || typeof obj === 'boolean') return false;
      if (Array.isArray(obj)) return obj.some(checkForDecimals);
      if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          if (value && typeof value === 'object' && 'toNumber' in value) {
            console.error(`Found remaining Decimal object in ${key}:`, value);
            return true;
          }
          if (checkForDecimals(value)) return true;
        }
      }
      return false;
    };
    return checkForDecimals(asset);
  });

  if (hasDecimalObjects) {
    console.error('WARNING: Decimal objects still found in transformed data!');
  } else {
    console.log('SUCCESS: No Decimal objects found in transformed data');
  }

  return (
    <AssetsClient 
      data={transformedAssets} 
      categories={categories} 
    />
  );
}
