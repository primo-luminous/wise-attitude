import { prisma } from "@/lib/prisma";
import PositionsClient from "@/app/main/components/positions/PositionsClient";

export const dynamic = 'force-dynamic';

function pickLabel(th?: string | null, en?: string | null) {
  return (th && th.trim()) || (en && en.trim()) || "-";
}

export default async function PositionsPage() {
  const [positions, departments] = await Promise.all([
    prisma.position.findMany({
      include: { department: true },
      orderBy: [{ departmentId: "asc" }, { level: "asc" }, { nameTh: "asc" }],
    }),
    prisma.department.findMany({ orderBy: { nameTh: "asc" } }),
  ]);

  const data = positions.map((p) => ({
    id: p.id,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    description: p.description,
    level: p.level,
    departmentId: p.departmentId,
    departmentLabel: p.department ? pickLabel(p.department.nameTh, p.department.nameEn) : "-",
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const depOpts = departments.map((d) => ({
    id: d.id,
    label: pickLabel(d.nameTh, d.nameEn),
  }));

  return <PositionsClient data={data} departments={depOpts} />;
}
