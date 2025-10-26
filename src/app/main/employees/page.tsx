import { prisma } from "@/lib/prisma";
import EmployeesClient from "@/app/main/components/employees/EmployeesClient";

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
  const [employees, departments, positions] = await Promise.all([
    prisma.employee.findMany({
      include: { department: true, position: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.department.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.position.findMany({
      include: { department: true },
      orderBy: [{ departmentId: "asc" }, { nameEn: "asc" }],
    }),
  ]);

  const data = employees.map((e) => ({
    id: e.id,
    employeeID: e.employeeID,
    name: e.name,
    email: e.email,
    department: e.department?.nameEn?.trim() || "-",
    position: e.position?.nameEn?.trim() || "-",
    status: e.status,
    imageUrl: e.imageUrl || undefined,
  }));

  const depOpts = departments.map((d) => ({
    id: d.id,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    // ✅ ใช้ชื่อภาษาอังกฤษเป็นหลัก
    label: d.nameEn?.trim() || d.nameTh?.trim() || "-",
  }));

  const posOpts = positions.map((p) => ({
    id: p.id,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    // ✅ ใช้ชื่อภาษาอังกฤษเป็นหลัก
    label: p.nameEn?.trim() || p.nameTh?.trim() || "-",
    departmentId: p.departmentId,
  }));

  return (
    <EmployeesClient
      data={data}
      departments={depOpts}
      positions={posOpts}
    />
  );
}
