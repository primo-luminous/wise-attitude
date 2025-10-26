// app/dashboard/assetcategory/page.tsx
import React from "react";
import { prisma } from "@/lib/db";
import CategoriesClient from "@/app/main/components/assets/category/Categories";


export const dynamic = "force-dynamic";   // ให้รีเฟรชข้อมูลทุกครั้ง
export const runtime = "nodejs";          // ให้รันบน Node runtime ชัดเจน
export const metadata = { title: "Asset Categories" };

export default async function AssetCategoryPage() {
  const items = await prisma.assetCategory.findMany({
    orderBy: { id: "desc" },
  });

  const serialized = items.map((it) => ({
    ...it,
    createdAt: it.createdAt.toISOString(),
    updatedAt: it.updatedAt.toISOString(),
  }));

  return (
      <CategoriesClient data={serialized} />
  );
}
