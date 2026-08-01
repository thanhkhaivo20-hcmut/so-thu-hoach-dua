import React from 'react';

const CustomerManager = ({
  customers,
  newCustomer,
  setNewCustomer,
  editingCustomer,
  setEditingCustomer,
  handleAddCustomer,
  handleUpdateCustomer,
  handleDeleteCustomer
}) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-md shadow-sm">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Danh sách khách hàng</h2>
      <div className="flex flex-col md:flex-row gap-2 mb-6 bg-gray-50 p-4 rounded border">
        <input 
          type="text" 
          placeholder="Tên khách hàng" 
          className="border p-2 rounded flex-1" 
          value={newCustomer.name} 
          onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} 
        />
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="Đơn giá đ/dừa" 
            className="border p-2 rounded w-1/2 md:w-48" 
            value={newCustomer.price} 
            onChange={e => setNewCustomer({...newCustomer, price: Number(e.target.value)})} 
          />
          <input 
            type="number" 
            placeholder="Chu kỳ (25 ngày)" 
            className="border p-2 rounded w-1/2 md:w-32" 
            value={newCustomer.cycle_days} 
            onChange={e => setNewCustomer({...newCustomer, cycle_days: Number(e.target.value)})} 
          />
        </div>
        <button onClick={handleAddCustomer} className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700">+ Thêm</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[400px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2 md:p-3">Tên Khách Hàng</th>
              <th className="p-2 md:p-3">Đơn Giá Hiện Tại</th>
              <th className="p-2 md:p-3">Chu kỳ</th>
              <th className="p-2 md:p-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, index) => (
              <tr key={c.id || index} className="border-b hover:bg-gray-50">
                <td className="p-2 md:p-3 font-medium">{c.name}</td>
                <td className="p-2 md:p-3 text-red-600 font-bold">{Number(c.price || 60000).toLocaleString('vi-VN')} đ / dừa</td>
                <td className="p-2 md:p-3">{c.cycle_days} ngày</td>
                <td className="p-2 md:p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setEditingCustomer(c)} className="text-blue-600 hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded text-xs">✏️ Sửa</button>
                    <button onClick={() => handleDeleteCustomer(c.id, c.name)} className="text-red-600 hover:bg-red-50 border border-red-200 px-2 py-1 rounded text-xs">🗑️ Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Chỉnh sửa thông tin khách hàng</h3>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tên khách hàng:</label>
                <input type="text" className="w-full border rounded p-2" value={editingCustomer.name} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đơn giá (VNĐ / dừa):</label>
                <input type="number" className="w-full border rounded p-2" value={editingCustomer.price} onChange={e => setEditingCustomer({...editingCustomer, price: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chu kỳ thu hoạch (ngày):</label>
                <input type="number" className="w-full border rounded p-2" value={editingCustomer.cycle_days} onChange={e => setEditingCustomer({...editingCustomer, cycle_days: Number(e.target.value)})} />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setEditingCustomer(null)} className="px-4 py-2 text-gray-600 border rounded">Hủy</button>
              <button onClick={handleUpdateCustomer} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;