import React, { useState, useEffect } from 'react';

// ==========================================
// THUẬT TOÁN ĐỔI DƯƠNG LỊCH SANG ÂM LỊCH (GMT+7)
// ==========================================
function INT(d) { return Math.floor(d); }

function jdFromDate(dd, mm, yyyy) {
  let a = INT((14 - mm) / 12);
  let y = yyyy + 4800 - a;
  let m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

function getNewMoonDay(k, timeZone) {
  let T = k / 1236.85;
  let T2 = T * T;
  let T3 = T2 * T;
  let dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  let Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * M * dr);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * Mpr * dr);
  C1 = C1 - 0.0004 * Math.sin(3 * Mpr * dr);
  C1 = C1 + 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 = C1 - 0.00074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 = C1 - 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 = C1 + 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((M + 2 * Mpr) * dr);
  let deltat;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.00002 + 0.000297 * T + 0.000223 * T2 - 0.000013 * T3;
  }
  let JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn, timeZone) {
  let T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  let T2 = T * T;
  let dr = Math.PI / 180;
  let M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) + 0.000290 * Math.sin(3 * M * dr);
  let L = L0 + DL;
  L = L * dr;
  L = L - 2 * Math.PI * Math.floor(L / (2 * Math.PI));
  return INT(L / (Math.PI / 6));
}

function getLunarMonth11(yyyy, timeZone) {
  let off = jdFromDate(31, 12, yyyy) - 2415021;
  let k = INT(off / 29.53058868);
  let nm = getNewMoonDay(k, timeZone);
  let sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11, timeZone) {
  let k = INT((a11 - 2415021) / 29.53058868 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  while (true) {
    let lastArc = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    if (arc === lastArc) {
      last = i - 1;
      break;
    }
    if (i >= 14) break;
  }
  return last;
}

function convertSolar2Lunar(dd, mm, yyyy, timeZone = 7) {
  let dayNumber = jdFromDate(dd, mm, yyyy);
  let k = INT((dayNumber - 2415021) / 29.53058868);
  let monthStart = getNewMoonDay(k, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k - 1, timeZone);
  }
  let a11 = getLunarMonth11(yyyy, timeZone);
  let b11 = a11;
  let lunarYear = yyyy;
  if (a11 >= monthStart) {
    lunarYear = yyyy;
    a11 = getLunarMonth11(yyyy - 1, timeZone);
  } else {
    lunarYear = yyyy + 1;
    b11 = getLunarMonth11(yyyy + 1, timeZone);
  }
  let lunarDay = dayNumber - monthStart + 1;
  let diff = INT((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    let leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = 1;
    }
  }
  if (lunarMonth > 12) lunarMonth = lunarMonth - 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap };
}

// ==========================================
// GIAO DIỆN CHÍNH (APP COMPONENTS)
// ==========================================
const App = () => {
  const [role, setRole] = useState(null);
  const [pinCode, setPinCode] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');

  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [records, setRecords] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  
  const [harvestCount, setHarvestCount] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [unitPrice, setUnitPrice] = useState(""); // Đơn giá khi ghi nhận lịch
  const [customers, setCustomers] = useState([]);
  
  const [newCustomer, setNewCustomer] = useState({ name: "", cycle_days: 25, price: 60000 });
  const [editingCustomer, setEditingCustomer] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); 
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate(); 
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error("Lỗi lấy dữ liệu:", err));
  };

  useEffect(() => {
    if (role) {
      fetch(`/api/records?month=${currentMonthStr}`)
        .then(res => res.json())
        .then(data => setRecords(data))
        .catch(err => console.error("Lỗi lấy lịch sử:", err));
      
      fetchCustomers();
    }
  }, [role, currentMonthStr]);

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleLogin = () => {
    if (pinCode === '1234') { setRole('admin'); } 
    else if (pinCode === '0000') { setRole('viewer'); setActiveTab('calendar'); } 
    else { alert("Mã PIN không đúng. Vui lòng thử lại!"); }
    setPinCode('');
  };

  const handleLogout = () => {
    setRole(null);
    setActiveTab('calendar');
  };

  const parseCoconutCount = (val) => {
    if (!val) return 0;
    const cleanVal = val.toString().replace(',', '.');
    return parseFloat(cleanVal) || 0;
  };

  // Khi chọn khách hàng trong Modal lịch -> Tự động điền giá hiện tại của khách hàng đó
  const handleCustomerSelect = (customerName) => {
    setSelectedCustomer(customerName);
    const cust = customers.find(c => c.name === customerName);
    if (cust) {
      setUnitPrice(cust.price || 60000);
    }
  };

  // Mở popup ghi nhận ngày
  const handleOpenModal = (dateStr) => {
    if (role !== 'admin') return;
    setSelectedDateStr(dateStr);
    const rec = records[dateStr];
    if (rec && rec.status === 'recorded') {
      setHarvestCount(rec.count);
      setSelectedCustomer(rec.name);
      setUnitPrice(rec.price || (customers.find(c => c.name === rec.name)?.price) || 60000);
    } else {
      setHarvestCount("");
      setSelectedCustomer("");
      setUnitPrice(60000);
    }
  };

  // Lưu lịch thu hoạch & Cập nhật đơn giá mới vào danh sách Khách hàng
  const handleSaveRecord = () => {
    if (role !== 'admin') return;
    if (!selectedCustomer) return alert("⚠️ Vui lòng chọn Tên Khách Hàng!");
    
    const countNum = parseCoconutCount(harvestCount);
    if (countNum <= 0) return alert("⚠️ Vui lòng nhập số dừa hợp lệ!");

    const priceNum = parseFloat(unitPrice) || 60000;

    const newData = { 
      date: selectedDateStr, 
      name: selectedCustomer, 
      status: "recorded", 
      count: countNum,
      price: priceNum 
    };

    // 1. Lưu bản ghi thu hoạch
    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    })
    .then(() => {
      setRecords(prev => ({ ...prev, [selectedDateStr]: { ...newData } }));
      
      // 2. Cập nhật đơn giá mới cho Khách hàng trong danh sách
      const targetCust = customers.find(c => c.name === selectedCustomer);
      if (targetCust) {
        const updatedCust = { ...targetCust, price: priceNum };
        fetch(`/api/customers/${targetCust.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCust)
        }).then(() => {
          setCustomers(prev => prev.map(c => c.name === selectedCustomer ? updatedCust : c));
        }).catch(() => {
          setCustomers(prev => prev.map(c => c.name === selectedCustomer ? { ...c, price: priceNum } : c));
        });
      }

      setSelectedDateStr(null);
      setHarvestCount("");
      setSelectedCustomer("");
      setUnitPrice("");
    });
  };

  const handleAddCustomer = () => {
    if (role !== 'admin') return;
    if (!newCustomer.name) return alert("Vui lòng nhập tên khách hàng!");
    
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    })
    .then(res => res.json())
    .then(data => {
      setCustomers([...customers, data]);
      setNewCustomer({ name: "", cycle_days: 25, price: 60000 });
    });
  };

  const handleUpdateCustomer = () => {
    if (role !== 'admin' || !editingCustomer) return;
    if (!editingCustomer.name) return alert("Vui lòng nhập tên khách hàng!");

    fetch(`/api/customers/${editingCustomer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCustomer)
    })
    .then(res => res.json())
    .then(() => {
      fetchCustomers();
      setEditingCustomer(null);
    });
  };

  const handleDeleteCustomer = (id, name) => {
    if (role !== 'admin') return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      fetch(`/api/customers/${id}`, { method: 'DELETE' })
        .then(() => fetchCustomers());
    }
  };

  // Cập nhật tính toán Báo cáo chi tiết theo TỪNG LẦN THU HOẠCH
  const calculateReport = () => {
    let totalCoconuts = 0;
    let totalMoney = 0;
    const harvestList = [];

    // Lấy tất cả các bản ghi trong tháng đã thu hoạch
    const sortedDates = Object.keys(records).sort();
    
    sortedDates.forEach(dateStr => {
      const rec = records[dateStr];
      if (rec && rec.status === 'recorded') {
        const count = rec.count || 0;
        // Lấy đơn giá từ chính bản ghi đó, nếu chưa có thì lấy từ thông tin khách hàng
        const price = rec.price || (customers.find(c => c.name === rec.name)?.price) || 60000;
        const total = count * price;

        totalCoconuts += count;
        totalMoney += total;

        const [y, m, d] = dateStr.split('-').map(Number);
        const lunar = convertSolar2Lunar(d, m, y);

        harvestList.push({
          dateStr,
          day: d,
          month: m,
          year: y,
          lunarDay: lunar.day,
          lunarMonth: lunar.month,
          name: rec.name,
          count,
          price,
          total
        });
      }
    });

    return { totalCoconuts, totalMoney, harvestList };
  };

  const { totalCoconuts, totalMoney, harvestList } = calculateReport();

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans p-4">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🥥</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sổ Thu Hoạch Dừa</h1>
          <p className="text-gray-500 text-sm mb-6">Vui lòng nhập mã PIN để tiếp tục</p>
          <input type="password" placeholder="Nhập mã PIN..." className="w-full border-2 border-gray-200 rounded-lg p-3 text-center text-xl tracking-widest mb-4 focus:outline-none focus:border-blue-500" value={pinCode} onChange={(e) => setPinCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} autoFocus />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">Đăng Nhập</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 font-sans relative">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-md shadow-sm mb-6 gap-4">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 items-center md:items-baseline w-full md:w-auto">
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Quản lý thu hoạch dừa</h1>
          <nav className="flex space-x-4 text-blue-600 text-sm md:text-base">
            <button onClick={() => setActiveTab('calendar')} className={`font-semibold pb-1 ${activeTab === 'calendar' ? 'border-b-2 border-blue-600' : 'hover:text-blue-800'}`}>Lịch</button>
            {role === 'admin' && <button onClick={() => setActiveTab('customers')} className={`font-semibold pb-1 ${activeTab === 'customers' ? 'border-b-2 border-blue-600' : 'hover:text-blue-800'}`}>Khách hàng</button>}
            <button onClick={() => setActiveTab('report')} className={`font-semibold pb-1 ${activeTab === 'report' ? 'border-b-2 border-blue-600' : 'hover:text-blue-800'}`}>Báo cáo</button>
          </nav>
        </div>
        <div className="flex items-center space-x-4 text-xs md:text-sm text-gray-600 w-full md:w-auto justify-between md:justify-end">
          <span className="font-medium px-3 py-1 bg-gray-100 rounded-full">👤 {role === 'admin' ? 'Cha/Mẹ' : 'Chỉ xem'}</span>
          <button onClick={handleLogout} className="text-red-600 font-medium hover:underline border px-3 py-1 rounded">Đăng xuất</button>
        </div>
      </div>

      {activeTab === 'calendar' && (
        <>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <button onClick={handlePrevMonth} className="px-2 md:px-4 py-1 md:py-2 text-sm md:text-base border rounded bg-white shadow-sm hover:bg-gray-50">‹ Trước</button>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800">Tháng {month + 1} / {year}</h2>
            <button onClick={handleNextMonth} className="px-2 md:px-4 py-1 md:py-2 text-sm md:text-base border rounded bg-white shadow-sm hover:bg-gray-50">Sau ›</button>
          </div>
          
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
                      <span className="hidden md:inline">{record.name}</span>
                    </div>
                    {isRecorded && <div className="text-[10px] md:text-sm font-bold text-gray-800">{record.count} <span className="hidden md:inline">dừa</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* MODAL GHI NHẬN Ở LỊCH: THÊM Ô ĐƠN GIÁ */}
          {selectedDateStr && role === 'admin' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h3 className="text-lg font-bold mb-1">Ghi nhận Ngày {selectedDateStr.split('-')[2]}/{selectedDateStr.split('-')[1]}</h3>
                <p className="text-xs text-red-600 font-semibold mb-4">
                  Âm lịch: {convertSolar2Lunar(Number(selectedDateStr.split('-')[2]), Number(selectedDateStr.split('-')[1]), Number(selectedDateStr.split('-')[0])).day}/
                  {convertSolar2Lunar(Number(selectedDateStr.split('-')[2]), Number(selectedDateStr.split('-')[1]), Number(selectedDateStr.split('-')[0])).month} ÂL
                </p>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Khách hàng:</label>
                  <select 
                    className="w-full border-2 border-blue-400 rounded p-2 bg-white font-bold text-gray-800 focus:outline-none" 
                    value={selectedCustomer} 
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                  >
                    <option value="">-- Bấm vào đây để chọn khách hàng --</option>
                    {customers.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Đơn giá (VNĐ / dừa):</label>
                  <input 
                    type="number" 
                    className="w-full border rounded p-2 font-bold text-red-600" 
                    placeholder="VD: 70000" 
                    value={unitPrice} 
                    onChange={(e) => setUnitPrice(e.target.value)} 
                  />
                  <p className="text-[11px] text-gray-500 mt-1">* Khi lưu, đơn giá này sẽ tự động cập nhật cho khách hàng này.</p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Số dừa thu hoạch (VD: 6.5 hoặc 6,5):</label>
                  <input 
                    type="text" 
                    className="w-full border rounded p-2 text-lg font-bold" 
                    placeholder="VD: 6.5" 
                    value={harvestCount} 
                    onChange={(e) => setHarvestCount(e.target.value)} 
                    autoFocus 
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button onClick={() => setSelectedDateStr(null)} className="px-4 py-2 text-gray-600 border rounded">Hủy</button>
                  <button onClick={handleSaveRecord} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Lưu lại</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'customers' && role === 'admin' && (
        <div className="bg-white p-4 md:p-6 rounded-md shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Danh sách khách hàng</h2>
          <div className="flex flex-col md:flex-row gap-2 mb-6 bg-gray-50 p-4 rounded border">
            <input type="text" placeholder="Tên khách hàng" className="border p-2 rounded flex-1" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
            <div className="flex gap-2">
              <input type="number" placeholder="Đơn giá đ/dừa (VD: 60000)" className="border p-2 rounded w-1/2 md:w-48" value={newCustomer.price} onChange={e => setNewCustomer({...newCustomer, price: Number(e.target.value)})} />
              <input type="number" placeholder="Chu kỳ (25 ngày)" className="border p-2 rounded w-1/2 md:w-32" value={newCustomer.cycle_days} onChange={e => setNewCustomer({...newCustomer, cycle_days: Number(e.target.value)})} />
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
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 md:p-3 font-medium">{c.name}</td>
                    <td className="p-2 md:p-3 text-red-600 font-bold">{Number(c.price || 60000).toLocaleString('vi-VN')} đ / dừa</td>
                    <td className="p-2 md:p-3">{c.cycle_days} ngày</td>
                    <td className="p-2 md:p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setEditingCustomer(c)} className="text-blue-600 hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                          ✏️ Sửa
                        </button>
                        <button onClick={() => handleDeleteCustomer(c.id, c.name)} className="text-red-600 hover:bg-red-50 border border-red-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                          🗑️ Xóa
                        </button>
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
      )}

      {activeTab === 'report' && (
        <div className="bg-white p-4 md:p-6 rounded-md shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Báo cáo Tháng {month + 1}/{year}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center md:text-left">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Tổng sản lượng</h3>
              <div className="text-2xl md:text-3xl font-bold text-blue-600">
                {totalCoconuts.toLocaleString('vi-VN')} <span className="text-base font-medium text-blue-800">dừa</span>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center md:text-left">
              <h3 className="text-sm font-semibold text-green-900 mb-1">Tổng doanh thu dự kiến</h3>
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {totalMoney.toLocaleString('vi-VN')} <span className="text-base font-medium text-green-800">VNĐ</span>
              </div>
            </div>
          </div>

          {/* CỘT BÁO CÁO CÓ TÊN KHÁCH HÀNG, ĐƠN GIÁ, SỐ DỪA, THÀNH TIỀN VÀ NGÀY THU HOẠCH DƯƠNG & ÂM LỊCH */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700 text-sm">
                  <th className="p-2 md:p-3">Ngày thu hoạch (Dương & Âm)</th>
                  <th className="p-2 md:p-3">Tên Khách Hàng</th>
                  <th className="p-2 md:p-3">Đơn Giá / Dừa</th>
                  <th className="p-2 md:p-3">Số Dừa Thu Hoạch</th>
                  <th className="p-2 md:p-3">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {harvestList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500 italic">Chưa có ghi nhận thu hoạch nào trong tháng này.</td>
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
                      <td className="p-2 md:p-3 font-bold text-green-600">{item.total.toLocaleString('vi-VN')} VNĐ</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;