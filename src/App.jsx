import React, { useState, useEffect } from 'react';

const App = () => {
  const [role, setRole] = useState(null);
  const [pinCode, setPinCode] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');

  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [records, setRecords] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  
  const [harvestCount, setHarvestCount] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  
  // Thêm đơn giá mặc định 8000 VNĐ vào form thêm khách hàng
  const [newCustomer, setNewCustomer] = useState({ name: "", standard_count: 120, cycle_days: 25, price: 8000 });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); 
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate(); 
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyCells = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        if (data.length > 0 && !selectedCustomer) setSelectedCustomer(data[0].name);
      })
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

  const handleSaveRecord = () => {
    if (role !== 'admin') return;
    if (!selectedCustomer) return alert("Vui lòng thêm khách hàng trước!");
    
    const newData = { date: selectedDateStr, name: selectedCustomer, status: "recorded", count: Number(harvestCount) };
    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    })
    .then(() => {
      setRecords(prev => ({ ...prev, [selectedDateStr]: { ...newData } }));
      setSelectedDateStr(null);
      setHarvestCount("");
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
      setNewCustomer({ name: "", standard_count: 120, cycle_days: 25, price: 8000 });
      if (!selectedCustomer) setSelectedCustomer(data.name);
    });
  };

  const handleDeleteCustomer = (id, name) => {
    if (role !== 'admin') return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      fetch(`/api/customers/${id}`, { method: 'DELETE' })
        .then(() => fetchCustomers());
    }
  };

  const calculateReport = () => {
    let totalCoconuts = 0;
    let totalMoney = 0;
    let stats = {};

    customers.forEach(c => { 
      stats[c.name] = { total_harvest: 0, standard_count: c.standard_count, price: c.price || 8000 }; 
    });

    Object.values(records).forEach(record => {
      if (record.status === 'recorded') {
        totalCoconuts += record.count;
        if (!stats[record.name]) {
          stats[record.name] = { total_harvest: 0, standard_count: 120, price: 8000 };
        }
        stats[record.name].total_harvest += record.count;
      }
    });

    Object.values(stats).forEach(s => {
      totalMoney += s.total_harvest * s.price;
    });

    return { totalCoconuts, totalMoney, stats };
  };

  const { totalCoconuts, totalMoney, stats } = calculateReport();

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

              return (
                <div 
                  key={day} 
                  onClick={() => { if (role === 'admin') { setSelectedDateStr(dateStr); setHarvestCount(record.count || ""); } }}
                  className={`bg-white border rounded p-1 md:p-3 min-h-[60px] md:min-h-[100px] shadow-sm flex flex-col justify-between transition-all
                    ${role === 'admin' ? 'cursor-pointer hover:border-blue-400' : 'cursor-default opacity-90'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className={`text-xs md:text-base font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>{day}</span>
                  <div className="mt-1 md:mt-2">
                    <div className={`text-[10px] md:text-xs p-1 rounded mb-1 truncate ${isRecorded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hidden md:block'}`}>
                      <span className="md:hidden">{isRecorded ? record.name.charAt(0) : '-'}</span>
                      <span className="hidden md:inline">{record.name}</span>
                    </div>
                    {isRecorded && <div className="text-[10px] md:text-sm font-bold text-gray-800">{record.count} <span className="hidden md:inline">trái</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
          
          {selectedDateStr && role === 'admin' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Ngày {selectedDateStr.split('-')[2]}/{selectedDateStr.split('-')[1]}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Khách hàng:</label>
                  <select className="w-full border rounded p-2 bg-white" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                    {customers.length === 0 && <option value="">Chưa có khách hàng</option>}
                    {customers.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Số trái thu hoạch:</label>
                  <input type="number" className="w-full border rounded p-2" placeholder="VD: 1500" value={harvestCount} onChange={(e) => setHarvestCount(e.target.value)} autoFocus />
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setSelectedDateStr(null)} className="px-4 py-2 text-gray-600 border rounded">Hủy</button>
                  <button onClick={handleSaveRecord} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu lại</button>
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
              <input type="number" placeholder="Giá (8000)" className="border p-2 rounded w-1/3 md:w-28" value={newCustomer.price} onChange={e => setNewCustomer({...newCustomer, price: Number(e.target.value)})} />
              <input type="number" placeholder="Chuẩn (120)" className="border p-2 rounded w-1/3 md:w-28" value={newCustomer.standard_count} onChange={e => setNewCustomer({...newCustomer, standard_count: Number(e.target.value)})} />
              <input type="number" placeholder="Chu kỳ (25)" className="border p-2 rounded w-1/3 md:w-28" value={newCustomer.cycle_days} onChange={e => setNewCustomer({...newCustomer, cycle_days: Number(e.target.value)})} />
            </div>
            <button onClick={handleAddCustomer} className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700">+ Thêm</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 md:p-3">Tên Khách Hàng</th>
                  <th className="p-2 md:p-3">Đơn Giá</th>
                  <th className="p-2 md:p-3">Chuẩn</th>
                  <th className="p-2 md:p-3">Chu kỳ</th>
                  <th className="p-2 md:p-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 md:p-3 font-medium">{c.name}</td>
                    <td className="p-2 md:p-3 text-red-600 font-bold">{Number(c.price || 8000).toLocaleString('vi-VN')} đ/trái</td>
                    <td className="p-2 md:p-3">{c.standard_count}</td>
                    <td className="p-2 md:p-3">{c.cycle_days} ngày</td>
                    <td className="p-2 md:p-3 text-center">
                      <button onClick={() => handleDeleteCustomer(c.id, c.name)} className="text-red-600 hover:bg-red-50 border border-red-200 px-2 py-1 rounded text-xs">
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="bg-white p-4 md:p-6 rounded-md shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Báo cáo Tháng {month + 1}/{year}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center md:text-left">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Tổng sản lượng</h3>
              <div className="text-2xl md:text-3xl font-bold text-blue-600">
                {totalCoconuts.toLocaleString()} <span className="text-base font-medium text-blue-800">trái</span>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center md:text-left">
              <h3 className="text-sm font-semibold text-green-900 mb-1">Tổng doanh thu dự kiến</h3>
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {totalMoney.toLocaleString('vi-VN')} <span className="text-base font-medium text-green-800">VNĐ</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700">
                  <th className="p-2 md:p-3">Tên Khách Hàng</th>
                  <th className="p-2 md:p-3">Đơn Giá</th>
                  <th className="p-2 md:p-3">Đã thu (trái)</th>
                  <th className="p-2 md:p-3">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(stats).map((customerName, index) => {
                  const data = stats[customerName];
                  const money = data.total_harvest * data.price;
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 md:p-3 font-medium text-gray-800">{customerName}</td>
                      <td className="p-2 md:p-3 text-gray-600">{data.price.toLocaleString()} đ</td>
                      <td className="p-2 md:p-3 font-bold text-green-600">{data.total_harvest.toLocaleString()}</td>
                      <td className="p-2 md:p-3 font-bold text-blue-600">{money.toLocaleString('vi-VN')} VNĐ</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;