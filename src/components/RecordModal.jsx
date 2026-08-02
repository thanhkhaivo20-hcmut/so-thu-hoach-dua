import React from 'react';
import { convertSolar2Lunar } from '../utils/lunarCalendar';

const RecordModal = ({
  selectedDateStr,
  setSelectedDateStr,
  customerSearch,
  setCustomerSearch,
  isDropdownOpen,
  setIsDropdownOpen,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  unitPrice,
  setUnitPrice,
  harvestCount,
  setHarvestCount,
  handleSaveRecord
}) => {
  if (!selectedDateStr) return null;

  const [y, m, d] = selectedDateStr.split('-').map(Number);
  const lunar = convertSolar2Lunar(d, m, y);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h3 className="text-lg font-bold mb-1">
          Ghi nhận Ngày {d}/{m}
        </h3>
        <p className="text-xs text-red-600 font-semibold mb-4">
          Âm lịch: {lunar.day}/{lunar.month} ÂL
        </p>

        <div className="mb-3 relative">
          <label className="block text-sm font-medium mb-1 text-gray-700">Khách hàng:</label>
          <div className="relative">
            <input 
              type="text" 
              className="w-full border-2 border-blue-500 rounded p-2 pr-10 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" 
              placeholder="-- Chọn hoặc nhập tên KH --" 
              value={customerSearch} 
              onClick={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setSelectedCustomer(e.target.value);
                setIsDropdownOpen(true);
              }} 
            />
            <div className="absolute right-2 top-2.5 flex items-center space-x-1 text-gray-500">
              {customerSearch && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomerSearch('');
                    setSelectedCustomer('');
                    setUnitPrice(''); // Tự động xóa đơn giá
                    setHarvestCount(''); // Tự động xóa số dừa
                    setIsDropdownOpen(true);
                  }}
                  className="hover:text-red-600 font-bold px-1 text-sm"
                >
                  ✕
                </button>
              )}
              <span className="cursor-pointer text-xs px-1" onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}>
                {isDropdownOpen ? '▲' : '▼'}
              </span>
            </div>
          </div>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-52 overflow-y-auto mt-1 left-0">
                <div 
                  className="p-2.5 hover:bg-gray-100 cursor-pointer text-sm italic text-gray-500 border-b border-gray-100"
                  onClick={() => { 
                    setSelectedCustomer(""); 
                    setCustomerSearch(""); 
                    setUnitPrice(""); // Tự động xóa đơn giá
                    setHarvestCount(""); // Tự động xóa số dừa
                    setIsDropdownOpen(false); 
                  }}
                >
                  -- Bỏ chọn (Chuyển về Chưa ghi) --
                </div>
                {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length > 0 ? (
                  customers
                    .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                    .map((c, i) => (
                      <div 
                        key={i} 
                        className={`p-2.5 hover:bg-blue-50 cursor-pointer text-sm font-medium border-b border-gray-100 flex justify-between items-center ${selectedCustomer === c.name ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-800'}`}
                        onClick={() => {
                          setSelectedCustomer(c.name);
                          setCustomerSearch(c.name);
                          setUnitPrice(c.price || 60000);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span>{c.name}</span>
                        <span className="text-xs text-red-600 font-semibold">{Number(c.price || 60000).toLocaleString('vi-VN')} đ</span>
                      </div>
                    ))
                ) : (
                  <div className="p-3 text-xs text-gray-500 italic text-center">Không tìm thấy khách hàng nào khớp</div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-700">Đơn giá (VNĐ / dừa):</label>
          <input type="number" className="w-full border rounded p-2 font-bold text-red-600" placeholder="VD: 70000" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-1 text-gray-700">Số dừa thu hoạch (VD: 6.5 hoặc 6,5):</label>
          <input type="text" className="w-full border rounded p-2 text-lg font-bold" placeholder="VD: 6.5" value={harvestCount} onChange={(e) => setHarvestCount(e.target.value)} />
        </div>

        <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => handleSaveRecord(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200"
            title="Lưu khách này và tiếp tục thêm khách khác cho cùng ngày"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Thêm khách
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setSelectedDateStr(null); setIsDropdownOpen(false); }} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Hủy
            </button>
            <button 
              onClick={() => handleSaveRecord()} 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Lưu lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordModal;