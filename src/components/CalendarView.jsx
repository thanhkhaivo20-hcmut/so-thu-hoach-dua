import React from 'react';
import { convertSolar2Lunar } from '../utils/lunarCalendar';

const CalendarView = ({
  currentMonth,
  handlePrevMonth,
  handleNextMonth,
  viewMode,
  setViewMode,
  records,
  role,
  handleOpenModal
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const dayOfWeekNames = ['CN', 'T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7'];

  return (
    <>
      <div className="flex justify-between items-center mb-4 md:mb-6 flex-wrap gap-2">
        <button onClick={handlePrevMonth} className="px-2 md:px-4 py-1.5 md:py-2 text-sm md:text-base border rounded bg-white shadow-sm hover:bg-gray-50">‹ Trước</button>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-xs md:text-sm font-semibold transition shadow-sm"
          >
            {viewMode === 'grid' ? '☰ Dạng hàng' : '📅 Dạng ô'}
          </button>
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">Tháng {month + 1} / {year}</h2>
        </div>

        <button onClick={handleNextMonth} className="px-2 md:px-4 py-1.5 md:py-2 text-sm md:text-base border rounded bg-white shadow-sm hover:bg-gray-50">Sau ›</button>
      </div>
      
      {/* DẠNG Ô VUÔNG (GRID) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-7 gap-1 md:gap-4">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 text-xs md:text-base mb-1 md:mb-2">{day}</div>
          ))}
          
          {Array.from({ length: emptyCells }).map((_, i) => <div key={`empty-${i}`} className="bg-transparent"></div>)}

          {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = records[dateStr] || { name: "Chưa ghi", status: "pending" };
            const isRecorded = record.status === "recorded";
            const today = new Date();
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const lunar = convertSolar2Lunar(day, month + 1, year);

            return (
              <div 
                key={day} 
                onClick={() => handleOpenModal(dateStr)}
                className={`bg-white border rounded p-1 md:p-3 min-h-[65px] md:min-h-[105px] shadow-sm flex flex-col justify-between transition-all
                  ${role === 'admin' ? 'cursor-pointer hover:border-blue-400' : 'cursor-default opacity-90'}
                  ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex justify-between items-baseline">
                  <span className={`text-xs md:text-base font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-800'}`}>{day}</span>
                  <span className="text-[10px] md:text-xs font-semibold text-red-600">
                    {lunar.day}/{lunar.month} <span className="hidden md:inline font-normal">ÂL</span>
                  </span>
                </div>

                <div className="mt-1">
                  <div className={`text-[10px] md:text-xs p-1 rounded mb-1 truncate ${isRecorded ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-500 hidden md:block'}`}>
                    <span className="md:hidden">{isRecorded ? record.name.charAt(0) : '-'}</span>
                    <span className="hidden md:inline">{isRecorded ? record.name : "Chưa ghi"}</span>
                  </div>
                  {isRecorded && <div className="text-[10px] md:text-sm font-bold text-gray-800">{record.count} <span className="hidden md:inline">dừa</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DẠNG HÀNG NGANG (LIST) */}
      {viewMode === 'list' && (
        <div className="space-y-2.5 max-w-2xl mx-auto">
          {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = records[dateStr] || { name: "Chưa ghi", status: "pending" };
            const isRecorded = record.status === "recorded";
            const today = new Date();
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dateObj = new Date(year, month, day);
            const dayOfWeekStr = dayOfWeekNames[dateObj.getDay()];
            const lunar = convertSolar2Lunar(day, month + 1, year);

            return (
              <div 
                key={day}
                onClick={() => handleOpenModal(dateStr)}
                className={`flex items-center gap-3 md:gap-4 bg-white p-3 md:p-3.5 rounded-xl border shadow-sm transition-all ${
                  role === 'admin' ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : ''
                } ${isToday ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
              >
                <div className="flex flex-col items-center justify-center min-w-[55px] text-center border-r border-gray-100 pr-2">
                  <span className={`text-[11px] font-bold ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>{dayOfWeekStr}</span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-extrabold my-0.5 ${
                    isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-800 bg-gray-100'
                  }`}>
                    {day}
                  </div>
                  <span className="text-[10px] font-semibold text-red-600">{lunar.day}/{lunar.month} ÂL</span>
                </div>

                <div className="flex-1">
                  {isRecorded ? (
                    <div className="bg-emerald-500 text-white p-2.5 md:p-3 rounded-lg shadow-sm flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm md:text-base leading-tight">{record.name}</div>
                        <div className="text-[11px] text-emerald-100 mt-0.5">
                          Đơn giá: {Number(record.price || 60000).toLocaleString('vi-VN')} đ/dừa
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base md:text-lg font-black">{record.count} dừa</div>
                        <div className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-semibold inline-block mt-0.5">
                          {(record.count * (record.price || 60000)).toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-2.5 text-gray-400 text-xs flex justify-between items-center hover:bg-gray-100">
                      <span>Chưa có ghi nhận</span>
                      {role === 'admin' && <span className="text-blue-600 font-semibold text-[11px]">+ Thêm</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CalendarView;