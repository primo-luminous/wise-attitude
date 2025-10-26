import { prisma } from "@/lib/prisma";
import DepartmentsClient from "@/app/main/components/departments/DepartmentsClient";

export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const data = departments.map((d) => ({
    id: d.id,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  return <DepartmentsClient data={data} />;
}
