"use client";

import { Edit, Trash2, Key } from 'lucide-react';
import { showConfirm } from '../../../../lib/sweetalert';

interface Employee {
  id: number;
  employeeID: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  imageUrl?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  onResetPassword: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  onResetPassword
}: EmployeeTableProps) {

  const handleDelete = async (id: number, name: string) => {
    const result = await showConfirm(
      'ยืนยันการลบ',
      `คุณต้องการลบพนักงาน ${name} หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้`,
      'ลบ',
      'ยกเลิก'
    );

    if (result.isConfirmed) {
      onDelete(id);
    }
  };

  const handleResetPassword = async (employee: Employee) => {
    const result = await showConfirm(
      'รีเซ็ตรหัสผ่าน',
      `คุณต้องการรีเซ็ตรหัสผ่านของพนักงาน ${employee.name} (${employee.employeeID}) หรือไม่?`,
      'รีเซ็ต',
      'ยกเลิก'
    );

    if (result.isConfirmed) {
      onResetPassword(employee);
    }
  };


  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  พนักงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัสพนักงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  แผนก
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ตำแหน่ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อีเมล
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {employee.imageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={employee.imageUrl}
                            alt={employee.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {employee.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.employeeID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleResetPassword(employee)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                        title="รีเซ็ตรหัสผ่าน"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(employee)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="แก้ไข"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id, employee.name)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
