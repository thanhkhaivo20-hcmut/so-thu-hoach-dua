import React from 'react';

const Navbar = ({ role, activeTab, setActiveTab, handleLogout }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-md shadow-sm mb-6 gap-4">
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 items-center md:items-baseline w-full md:w-auto">
        <h1 className="text-lg md:text-xl font-bold text-gray-800">Quản lý thu hoạch dừa</h1>
        <nav className="flex space-x-4 text-blue-600 text-sm md:text-base">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`font-semibold pb-1 ${activeTab === 'calendar' ? 'border-b-2 border-blue-600' : 'hover:text-blue-800'}`}
          >
            Lịch
          </button>
          {role === 'admin' && (
            <button
              onClick={() => setActiveTab('customers')}
              className={`font-semibold pb-1 ${activeTab === 'customers' ? 'border-b-2 border-blue-600' : 'hover:text-blue-800'}`}
            >
              Khách hàng
            </button>
          )}
          <button
            onClick={() => setActiveTab('report')}
            className={`font-semibold pb-1 ${activeTab === 'report' ? 'border-b-2 border-blue-600' : 'hover:text-blue-800'}`}
          >
            Báo cáo
          </button>
        </nav>
      </div>
      <div className="flex items-center space-x-4 text-xs md:text-sm text-gray-600 w-full md:w-auto justify-between md:justify-end">
        <span className="font-medium px-3 py-1 bg-gray-100 rounded-full">👤 {role === 'admin' ? 'Cha/Mẹ' : 'Chỉ xem'}</span>
        <button onClick={handleLogout} className="text-red-600 font-medium hover:underline border px-3 py-1 rounded">
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Navbar;