"use client";
import { useState } from "react";

const initialUsers = [
  { id: 1, name: "Admin User", username: "admin", role: "admin" },
  { id: 2, name: "QA Tester", username: "tester", role: "tester" }
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">User Management</h1>
      <table className="w-full max-w-2xl bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Username</th>
            <th className="p-3 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.username}</td>
              <td className="p-3 capitalize">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 text-gray-500 text-sm">(User add/edit/delete can be implemented with a real database.)</div>
    </div>
  );
}
