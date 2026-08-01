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
  C1 = C1 - 0.0004 * Math.sin(3 * M * dr);
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
  // KHỞI TẠO STATE TỪ LOCALSTORAGE ĐỂ KHÔNG BỊ MẤT DỮ LIỆU KHI REFRESH
  const [role, setRole] = useState(() => localStorage.getItem('coconut_role') || null);
  const [pinCode, setPinCode] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');
  const [viewMode, setViewMode] = useState('grid'); 

  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('coconut_records');
    return saved ? JSON.parse(saved) : {};
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('coconut_customers');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Nguyễn Văn A", price: 60000, cycle_days: 25 },
      { id: 2, name: "Huỳnh Thị Kim Liên", price: 60000, cycle_days: 25 },
      { id: 3, name: "Võ Thanh Khải", price: 60000, cycle_days: 25 },
      { id: 4, name: "Võ An Nhiên", price: 60000, cycle_days: 25 }
    ];
  });

  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [harvestCount, setHarvestCount] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unitPrice, setUnitPrice] = useState(""); 
  
  const [newCustomer, setNewCustomer] = useState({ name: "", cycle_days: 25, price: 60000 });
  const [editingCustomer, setEditingCustomer] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); 
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate(); 
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  // TỰ ĐỘNG LƯU DỮ LIỆU VÀO LOCALSTORAGE KHI CÓ THAY ĐỔI
  useEffect(() => {
    localStorage.setItem('coconut_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('coconut_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (role) {
      localStorage.setItem('coconut_role', role);
    } else {
      localStorage.removeItem('coconut_role');
    }
  }, [role]);

  // ĐỒNG BỘ VỚI SERVER NẾU CÓ CỔNG API
  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (Array.isArray(data) && data.length > 0) setCustomers(data); })
      .catch(() => {});
  };

  const fetchAllRecords = () => {
    fetch('/api/records')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        let recObj = {};
        if (Array.isArray(data) && data.length > 0) {
          data.forEach(item => { if (item.date) recObj[item.date] = item; });
          setRecords(recObj);
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setRecords(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (role) {
      fetchAllRecords();
      fetchCustomers();
    }
  }, [role]);

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleSelectMonthYear = (newM, newY) => {
    setCurrentMonth(new Date(newY, newM - 1, 1));
  };

  const handleLogin = () => {
    if (pinCode === '1234') { 
      setRole('admin'); 
    } else if (pinCode === '0000') { 
      setRole('viewer'); 
      setActiveTab('calendar'); 
    } else { 
      alert("Mã PIN không đúng. Vui lòng thử lại!"); 
    }
    setPinCode('');
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('coconut_role');
    setActiveTab('calendar');
  };

  const parseCoconutCount = (val) => {
    if (!val) return 0;
    const cleanVal = val.toString().replace(',', '.');
    return parseFloat(cleanVal) || 0;
  };

  const handleOpenModal = (dateStr) => {
    if (role !== 'admin') return;
    setSelectedDateStr(dateStr);
    setIsDropdownOpen(false);
    const rec = records[dateStr];
    if (rec && rec.status === 'recorded') {
      setHarvestCount(rec.count ? rec.count.toString() : "");
      setSelectedCustomer(rec.name || "");
      setCustomerSearch(rec.name || "");
      setUnitPrice(rec.price || (customers.find(c => c.name === rec.name)?.price) || 60000);
    } else {
      setHarvestCount("");
      setSelectedCustomer("");
      setCustomerSearch("");
      setUnitPrice(60000);
    }
  };

  const handleSaveRecord = async () => {
    if (role !== 'admin' || !selectedDateStr) return;

    const dateStr = selectedDateStr;

    // XÓA GHI NHẬN NẾU TÊN KHÁCH HÀNG TRỐNG
    if (!selectedCustomer || !selectedCustomer.trim()) {
      setRecords(prev => {
        const updated = { ...prev };
        delete updated[dateStr];
        return updated;
      });

      setSelectedDateStr(null);
      setHarvestCount("");
      setSelectedCustomer("");
      setCustomerSearch("");
      setUnitPrice("");

      try {
        await fetch(`/api/records/${dateStr}`, { method: 'DELETE' });
      } catch (err) {}
      return;
    }

    const countNum = parseCoconutCount(harvestCount);
    if (countNum <= 0) {
      alert("⚠️ Vui lòng nhập số dừa hợp lệ (lớn hơn 0)!");
      return;
    }

    const priceNum = parseFloat(unitPrice) || 60000;
    const newData = { 
      date: dateStr, 
      name: selectedCustomer.trim(), 
      status: "recorded", 
      count: countNum,
      price: priceNum 
    };

    setRecords(prev => ({
      ...prev,
      [dateStr]: newData
    }));

    const targetCust = customers.find(c => c.name === selectedCustomer.trim());
    if (targetCust) {
      setCustomers(prev => prev.map(c => c.name === targetCust.name ? { ...c, price: priceNum } : c));
    }

    setSelectedDateStr(null);
    setHarvestCount("");
    setSelectedCustomer("");
    setCustomerSearch("");
    setUnitPrice("");

    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (err) {}
  };

  const handleAddCustomer = () => {
    if (role !== 'admin') return;
    if (!newCustomer.name) return alert("Vui lòng nhập tên khách hàng!");
    
    const createdCustomer = { ...newCustomer, id: Date.now() };
    setCustomers(prev => [...prev, createdCustomer]);
    setNewCustomer({ name: "", cycle_days: 25, price: 60000 });

    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdCustomer)
    }).catch(() => {});
  };

  const handleUpdateCustomer = () => {
    if (role !== 'admin' || !editingCustomer) return;
    if (!editingCustomer.name) return alert("Vui lòng nhập tên khách hàng!");

    setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));

    fetch(`/api/customers/${editingCustomer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCustomer)
    }).catch(() => {});

    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id, name) => {
    if (role !== 'admin') return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      fetch(`/api/customers/${id}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  const calculateReport = () => {
    let totalCoconuts = 0;
    let totalMoney = 0;
    const harvestList = [];

    const sortedDates = Object.keys(records).sort();
    
    sortedDates.forEach(dateStr => {
      if (dateStr.startsWith(currentMonthStr)) {
        const rec = records[dateStr];
        if (rec && rec.status === 'recorded') {
          const count = parseFloat(rec.count) || 0;
          const price = parseFloat(rec.price) || (customers.find(c => c.name === rec.name)?.price) || 60000;
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
      }
    });

    return { totalCoconuts, totalMoney, harvestList };
  };

  const calculateYearlyAnalysis = () => {
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      monthNum: i + 1,
      coconuts: 0,
      money: 0
    }));

    Object.keys(records).forEach(dateStr => {
      if (dateStr.startsWith(`${year}-`)) {
        const parts = dateStr.split('-');
        const mIndex = parseInt(parts[1], 10) - 1;
        const rec = records[dateStr];
        if (rec && rec.status === 'recorded' && mIndex >= 0 && mIndex < 12) {
          const count = parseFloat(rec.count) || 0;
          const price = parseFloat(rec.price) || (customers.find(c => c.name === rec.name)?.price) || 60000;
          monthlyStats[mIndex].coconuts += count;
          monthlyStats[mIndex].money += count * price;
        }
      }
    });

    const maxCoconuts = Math.max(...monthlyStats.map(s => s.coconuts), 1);
    const maxMoney = Math.max(...monthlyStats.map(s => s.money), 1);
    const yearlyTotalCoconuts = monthlyStats.reduce((acc, curr) => acc + curr.coconuts, 0);
    const yearlyTotalMoney = monthlyStats.reduce((acc, curr) => acc + curr.money, 0);

    let bestMonth = 1;
    let bestMoney = 0;
    monthlyStats.forEach(s => {
      if (s.money > bestMoney) {
        bestMoney = s.money;
        bestMonth = s.monthNum;
      }
    });

    return { monthlyStats, maxCoconuts, maxMoney, yearlyTotalCoconuts, yearlyTotalMoney, bestMonth, bestMoney };
  };

  const formatShortMoney = (val) => {
    if (!val || val === 0) return '';
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + 'tr';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  };

  const formatShortCount = (val) => {
    if (!val || val === 0) return '';
    return val.toString().replace('.', ',');
  };

  const { totalCoconuts, totalMoney, harvestList } = calculateReport();
  const { monthlyStats, maxCoconuts, maxMoney, yearlyTotalCoconuts, yearlyTotalMoney, bestMonth, bestMoney } = calculateYearlyAnalysis();

  const dayOfWeekNames = ['CN', 'T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7'];

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

      {/* TAB 1: LỊCH THU HOẠCH */}
      {activeTab === 'calendar' && (
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
          
          {/* MODAL GHI NHẬN */}
          {selectedDateStr && role === 'admin' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h3 className="text-lg font-bold mb-1">Ghi nhận Ngày {selectedDateStr.split('-')[2]}/{selectedDateStr.split('-')[1]}</h3>
                <p className="text-xs text-red-600 font-semibold mb-4">
                  Âm lịch: {convertSolar2Lunar(Number(selectedDateStr.split('-')[2]), Number(selectedDateStr.split('-')[1]), Number(selectedDateStr.split('-')[0])).day}/
                  {convertSolar2Lunar(Number(selectedDateStr.split('-')[2]), Number(selectedDateStr.split('-')[1]), Number(selectedDateStr.split('-')[0])).month} ÂL
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
                          onClick={() => { setSelectedCustomer(""); setCustomerSearch(""); setIsDropdownOpen(false); }}
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

                <div className="flex justify-end space-x-3">
                  <button onClick={() => { setSelectedDateStr(null); setIsDropdownOpen(false); }} className="px-4 py-2 text-gray-600 border rounded">Hủy</button>
                  <button onClick={handleSaveRecord} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Lưu lại</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: QUẢN LÝ KHÁCH HÀNG */}
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
      )}

      {/* TAB 3: BÁO CÁO */}
      {activeTab === 'report' && (
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
                        <td className="p-2 md:p-3 font-bold text-green-600">{item.total.toLocaleString('vi-VN')} VNĐ</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-md shadow-sm border border-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📊</span> Biểu Đồ Phân Tích Cả Năm {year}
                </h3>
              </div>
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
                          <div className="flex flex-col items-center flex-1 max-w-[22px] h-full justify-end">
                            {stat.coconuts > 0 && (
                              <span className="text-[9px] font-extrabold text-blue-700 mb-0.5 whitespace-nowrap">
                                {formatShortCount(stat.coconuts)}
                              </span>
                            )}
                            <div 
                              style={{ height: `${stat.coconuts > 0 ? Math.max(coconutHeightPercent, 8) : 2}%` }} 
                              className={`w-full rounded-t-sm transition-all ${stat.coconuts > 0 ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-gray-200'}`}
                            ></div>
                          </div>

                          <div className="flex flex-col items-center flex-1 max-w-[22px] h-full justify-end">
                            {stat.money > 0 && (
                              <span className="text-[9px] font-extrabold text-emerald-700 mb-0.5 whitespace-nowrap">
                                {formatShortMoney(stat.money)}
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
      )}
    </div>
  );
};

export default App;