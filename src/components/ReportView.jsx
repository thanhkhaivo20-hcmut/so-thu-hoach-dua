import React from 'react';

const ReportView = ({
  month,
  year,
  totalCoconuts,
  totalMoney,
  harvestList,
  monthlyStats,
  maxCoconuts,
  maxMoney,
  yearlyTotalCoconuts,
  yearlyTotalMoney,
  bestMonth,
  bestMoney,
  handleSelectMonthYear,
  formatShortMoney,
  formatShortCount
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-md shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Báo cáo Tháng {month + 1}/{year}</h2>
          
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            <span className="text-xs font-semibold text-gray-600 pl-2">📅 Xem thời gian:</span>
            <select 
              className="bg-white border rounded p-1.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500"
              value={month + 1}
              onChange={(e) => handleSelectMonthYear(Number(e.target.value), year)}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <select 
              className="bg-white border rounded p-1.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500"
              value={year}
              onChange={(e) => handleSelectMonthYear(month + 1, Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center md:text-left">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Tổng sản lượng Tháng {month + 1}</h3>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              {totalCoconuts.toLocaleString('vi-VN')} <span className="text-base font-medium text-blue-800">dừa</span>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center md:text-left">
            <h3 className="text-sm font-semibold text-green-900 mb-1">Tổng doanh thu Tháng {month + 1}</h3>
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {totalMoney.toLocaleString('vi-VN')} <span className="text-base font-medium text-green-800">VNĐ</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700 text-sm">
                <th className="p-2 md:p-3">Ngày thu hoạch</th>
                <th className="p-2 md:p-3">Tên Khách Hàng</th>
                <th className="p-2 md:p-3">Đơn Giá / Dừa</th>
                <th className="p-2 md:p-3">Số Dừa</th>
                <th className="p-2 md:p-3">Thành Tiền</th>
              </tr>
            </thead>
            <tbody>
              {harvestList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500 italic">Chưa có ghi nhận thu hoạch nào trong tháng {month + 1}/{year}.</td>
                </tr>
              ) : (
                harvestList.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-2 md:p-3 font-medium text-gray-700">
                      {String(item.day).padStart(2, '0')}/{String(item.month).padStart(2, '0')}/{item.year} 
                      <span className="text-red-600 font-semibold ml-2">({item.lunarDay}/{item.lunarMonth} ÂL)</span>
                    </td>
                    <td className="p-2 md:p-3 font-bold text-gray-800">{item.name}</td>
                    <td className="p-2 md:p-3 text-gray-600 font-semibold">{item.price.toLocaleString('vi-VN')} đ</td>
                    <td className="p-2 md:p-3 font-bold text-purple-700">{item.count.toLocaleString('vi-VN')} dừa</td>
                    <td className="p-2 md:p-3 font-bold text-green-600">{item.total.toLocaleString('vi-VN')} đ</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-md shadow-sm border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>📊</span> Biểu Đồ Phân Tích Cả Năm {year}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-sm">
          <div className="bg-slate-50 p-3 rounded border">
            <div className="text-gray-500 text-xs">Tổng dừa cả năm {year}</div>
            <div className="text-xl font-bold text-blue-600 mt-0.5">{yearlyTotalCoconuts.toLocaleString('vi-VN')} dừa</div>
          </div>
          <div className="bg-slate-50 p-3 rounded border">
            <div className="text-gray-500 text-xs">Tổng doanh thu cả năm {year}</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">{yearlyTotalMoney.toLocaleString('vi-VN')} VNĐ</div>
          </div>
          <div className="bg-slate-50 p-3 rounded border">
            <div className="text-gray-500 text-xs">Tháng doanh thu tốt nhất</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">
              Tháng {bestMonth} <span className="text-xs font-normal text-gray-600">({bestMoney.toLocaleString('vi-VN')} đ)</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pt-6 pb-2">
          <div className="min-w-[800px] bg-slate-50/60 p-4 rounded-xl border border-gray-100">
            <div className="h-64 flex items-end justify-between gap-2 pt-12 pb-6 border-b border-gray-300 relative">
              {monthlyStats.map((stat) => {
                const coconutHeightPercent = Math.round((stat.coconuts / maxCoconuts) * 100);
                const moneyHeightPercent = Math.round((stat.money / maxMoney) * 100);
                const isSelectedMonth = stat.monthNum === (month + 1);

                return (
                  <div 
                    key={stat.monthNum} 
                    onClick={() => handleSelectMonthYear(stat.monthNum, year)}
                    className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer px-1 rounded transition-all relative ${isSelectedMonth ? 'bg-blue-100/50 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-full relative">
                      {/* CỘT DỪA - Đã chỉnh sửa hiển thị icon và số làm tròn */}
                      <div className="flex flex-col items-center flex-1 max-w-[22px] h-full justify-end">
                        {stat.coconuts > 0 && (
                          <span className="text-[10px] font-extrabold text-blue-700 mb-0.5 whitespace-nowrap">
                            {Number(stat.coconuts.toFixed(2)).toLocaleString('vi-VN')}🥥
                          </span>
                        )}
                        <div 
                          style={{ height: `${stat.coconuts > 0 ? Math.max(coconutHeightPercent, 8) : 2}%` }} 
                          className={`w-full rounded-t-sm transition-all ${stat.coconuts > 0 ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-gray-200'}`}
                        ></div>
                      </div>

                      {/* CỘT TIỀN - Đã chỉnh sửa chia 1000 và thêm chữ k */}
                      <div className="flex flex-col items-center flex-1 max-w-[22px] h-full justify-end">
                        {stat.money > 0 && (
                          <span className="text-[10px] font-extrabold text-emerald-700 mb-0.5 whitespace-nowrap">
                            {(stat.money / 1000).toLocaleString('vi-VN')}k
                          </span>
                        )}
                        <div 
                          style={{ height: `${stat.money > 0 ? Math.max(moneyHeightPercent, 8) : 2}%` }} 
                          className={`w-full rounded-t-sm transition-all ${stat.money > 0 ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-gray-200'}`}
                        ></div>
                      </div>
                    </div>
                    <div className={`text-xs font-bold mt-3 py-0.5 px-1.5 rounded ${isSelectedMonth ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                      T{stat.monthNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;