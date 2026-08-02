import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { convertSolar2Lunar } from './utils/lunarCalendar';
import LoginForm from './components/LoginForm';
import Navbar from './components/Navbar';
import CalendarView from './components/CalendarView';
import RecordModal from './components/RecordModal';
import CustomerManager from './components/CustomerManager';
import ReportView from './components/ReportView';

const App = () => {
  const [role, setRole] = useState(() => localStorage.getItem('coconut_role') || null);
  const [pinCode, setPinCode] = useState('');
  const [activeTab, setActiveTab] = useState('calendar');
  const [viewMode, setViewMode] = useState('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [records, setRecords] = useState({});
  const [customers, setCustomers] = useState([]);

  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [harvestCount, setHarvestCount] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  
  const [editingOriginalCustomer, setEditingOriginalCustomer] = useState(null);

  const [newCustomer, setNewCustomer] = useState({ name: "", cycle_days: 25, price: 60000 });
  const [editingCustomer, setEditingCustomer] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    if (!role) return;

    const recordsRef = ref(db, 'records');
    const unsubRecords = onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      setRecords(data || {});
    });

    const customersRef = ref(db, 'customers');
    const unsubCustomers = onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const custList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setCustomers(custList);
      } else {
        const defaultCustomers = [
          { id: "1", name: "Nguyễn Văn A", price: 60000, cycle_days: 25 },
          { id: "2", name: "Huỳnh Thị Kim Liên", price: 60000, cycle_days: 25 },
          { id: "3", name: "Võ Thanh Khải", price: 60000, cycle_days: 25 },
          { id: "4", name: "Võ An Nhiên", price: 60000, cycle_days: 25 }
        ];
        defaultCustomers.forEach(c => set(ref(db, `customers/${c.id}`), c));
      }
    });

    return () => {
      unsubRecords();
      unsubCustomers();
    };
  }, [role]);

  useEffect(() => {
    if (role) {
      localStorage.setItem('coconut_role', role);
    } else {
      localStorage.removeItem('coconut_role');
    }
  }, [role]);

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const handleSelectMonthYear = (newM, newY) => setCurrentMonth(new Date(newY, newM - 1, 1));

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
    return parseFloat(val.toString().replace(',', '.')) || 0;
  };

  const handleOpenModal = (dateStr, customerName = null) => {
    if (role !== 'admin') return;
    setSelectedDateStr(dateStr);
    setIsDropdownOpen(false);
    
    const dayData = records[dateStr];
    
    if (dayData) {
      const isFlat = dayData.status === 'recorded'; // Cấu trúc cũ
      let targetRecord = null;
      
      if (customerName) {
         targetRecord = isFlat ? dayData : dayData[customerName];
      } else if (isFlat) {
         targetRecord = dayData;
      }
      
      if (targetRecord && targetRecord.status === 'recorded') {
        setHarvestCount(targetRecord.count ? targetRecord.count.toString() : "");
        setSelectedCustomer(targetRecord.name || "");
        setCustomerSearch(targetRecord.name || "");
        setUnitPrice(targetRecord.price || (customers.find(c => c.name === targetRecord.name)?.price) || 60000);
        setEditingOriginalCustomer(targetRecord.name); 
        return;
      }
    }
    
    setHarvestCount("");
    setSelectedCustomer("");
    setCustomerSearch("");
    setUnitPrice(60000);
    setEditingOriginalCustomer(null);
  };

  // Hàm xử lý lưu đã được nâng cấp mạnh mẽ để dọn dẹp cấu trúc cũ
  const handleSaveRecord = async (keepModalOpen = false) => {
    if (role !== 'admin' || !selectedDateStr) return;
    const dateStr = selectedDateStr;
    const googleSheetURL = "https://script.google.com/macros/s/AKfycbz4a_-GBcFvRXfwRsj-atkvPKiHfR00trrO9Kcb5HZrHETgtL0XVIoETidWuCI9VPH6/exec";
    
    const safeCustomer = selectedCustomer ? selectedCustomer.trim() : "";

    // Phân tích xem ngày này đang dùng cấu trúc cũ hay mới
    const dayData = records[dateStr];
    const isFlat = dayData && dayData.status === 'recorded';

    // XỬ LÝ XÓA KHÁCH HÀNG
    if (!safeCustomer) {
      if (editingOriginalCustomer) {
        if (isFlat) {
          // Xóa triệt để nếu là cấu trúc cũ
          await remove(ref(db, `records/${dateStr}`));
        } else {
          // Xóa nhánh khách hàng nếu là cấu trúc mới
          await remove(ref(db, `records/${dateStr}/${editingOriginalCustomer}`));
        }

        fetch(googleSheetURL, {
          method: "POST",
          body: JSON.stringify({ action: "delete", date: dateStr, name: editingOriginalCustomer }),
          headers: { "Content-Type": "text/plain;charset=utf-8" }
        }).catch(err => console.log("Lỗi xóa trên Sheet: ", err));
      }
      
      if (keepModalOpen !== true) setSelectedDateStr(null);
      setHarvestCount("");
      setSelectedCustomer("");
      setCustomerSearch("");
      setUnitPrice("");
      setEditingOriginalCustomer(null);
      return;
    }

    const countNum = parseCoconutCount(harvestCount);
    if (countNum <= 0) {
      alert("⚠️ Vui lòng nhập số dừa hợp lệ (lớn hơn 0)!");
      return;
    }

    const priceNum = parseFloat(unitPrice) || 60000;
    const newData = { 
      action: "save",
      date: dateStr, 
      name: safeCustomer, 
      status: "recorded", 
      count: countNum,
      price: priceNum 
    };

    try {
      if (isFlat) {
         // Nếu đang là cấu trúc cũ, phải xóa toàn bộ gốc ngày đó đi trước để chuyển sang cấu trúc nhiều lớp
         await remove(ref(db, `records/${dateStr}`));
      } else if (editingOriginalCustomer && editingOriginalCustomer !== safeCustomer) {
         // Đổi tên khách hàng: Xóa nhánh cũ ở cấu trúc mới
         await remove(ref(db, `records/${dateStr}/${editingOriginalCustomer}`));
      }

      // Lưu đúp nhánh mới (hỗ trợ lưu nhiều khách)
      await set(ref(db, `records/${dateStr}/${safeCustomer}`), {
        date: newData.date,
        name: newData.name,
        status: newData.status,
        count: newData.count,
        price: newData.price
      });
      
      const targetCust = customers.find(c => c.name === safeCustomer);
      if (targetCust) {
        await set(ref(db, `customers/${targetCust.id}`), { ...targetCust, price: priceNum });
      }

      fetch(googleSheetURL, {
        method: "POST",
        body: JSON.stringify(newData),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      }).catch(err => console.log("Lỗi đồng bộ Sheet: ", err));

    } catch (err) {
      console.error(err);
      alert("⚠️ Không thể kết nối tới máy chủ Google hoặc Firebase!");
    }

    if (keepModalOpen !== true) {
      setSelectedDateStr(null);
    }
    setHarvestCount("");
    setSelectedCustomer("");
    setCustomerSearch("");
    setUnitPrice("");
    setEditingOriginalCustomer(null);
  };

  const handleAddCustomer = async () => {
    if (role !== 'admin') return;
    if (!newCustomer.name) return alert("Vui lòng nhập tên khách hàng!");
    
    const newId = String(Date.now());
    const createdCustomer = { ...newCustomer, id: newId };

    await set(ref(db, `customers/${newId}`), createdCustomer);
    setNewCustomer({ name: "", cycle_days: 25, price: 60000 });
  };

  const handleUpdateCustomer = async () => {
    if (role !== 'admin' || !editingCustomer) return;
    if (!editingCustomer.name) return alert("Vui lòng nhập tên khách hàng!");

    await set(ref(db, `customers/${editingCustomer.id}`), editingCustomer);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id, name) => {
    if (role !== 'admin') return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      await remove(ref(db, `customers/${id}`));
    }
  };

  const calculateReport = () => {
    let totalCoconuts = 0;
    let totalMoney = 0;
    const harvestList = [];
    const sortedDates = Object.keys(records).sort();
    
    sortedDates.forEach(dateStr => {
      if (dateStr.startsWith(currentMonthStr)) {
        const dayData = records[dateStr];
        if (!dayData) return;
        
        let dayRecords = [];
        if (dayData.status === 'recorded') {
          dayRecords = [dayData];
        } else {
          dayRecords = Object.values(dayData).filter(r => r && r.status === 'recorded');
        }

        dayRecords.forEach(rec => {
          const count = parseFloat(rec.count) || 0;
          const price = parseFloat(rec.price) || (customers.find(c => c.name === rec.name)?.price) || 60000;
          const total = count * price;

          totalCoconuts += count;
          totalMoney += total;

          const [y, m, d] = dateStr.split('-').map(Number);
          const lunar = convertSolar2Lunar(d, m, y);

          harvestList.push({
            dateStr, day: d, month: m, year: y,
            lunarDay: lunar.day, lunarMonth: lunar.month,
            name: rec.name, count, price, total
          });
        });
      }
    });
    return { totalCoconuts, totalMoney, harvestList };
  };

  const calculateYearlyAnalysis = () => {
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({ monthNum: i + 1, coconuts: 0, money: 0 }));
    
    Object.keys(records).forEach(dateStr => {
      if (dateStr.startsWith(`${year}-`)) {
        const parts = dateStr.split('-');
        const mIndex = parseInt(parts[1], 10) - 1;
        const dayData = records[dateStr];
        
        if (dayData && mIndex >= 0 && mIndex < 12) {
          let dayRecords = [];
          if (dayData.status === 'recorded') {
            dayRecords = [dayData];
          } else {
            dayRecords = Object.values(dayData).filter(r => r && r.status === 'recorded');
          }

          dayRecords.forEach(rec => {
            const count = parseFloat(rec.count) || 0;
            const price = parseFloat(rec.price) || (customers.find(c => c.name === rec.name)?.price) || 60000;
            monthlyStats[mIndex].coconuts += count;
            monthlyStats[mIndex].money += count * price;
          });
        }
      }
    });

    const maxCoconuts = Math.max(...monthlyStats.map(s => s.coconuts), 1);
    const maxMoney = Math.max(...monthlyStats.map(s => s.money), 1);
    const yearlyTotalCoconuts = monthlyStats.reduce((acc, curr) => acc + curr.coconuts, 0);
    const yearlyTotalMoney = monthlyStats.reduce((acc, curr) => acc + curr.money, 0);

    let bestMonth = 1, bestMoney = 0;
    monthlyStats.forEach(s => {
      if (s.money > bestMoney) { bestMoney = s.money; bestMonth = s.monthNum; }
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

  if (!role) {
    return <LoginForm pinCode={pinCode} setPinCode={setPinCode} handleLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 font-sans relative">
      <Navbar role={role} activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      {activeTab === 'calendar' && (
        <>
          <CalendarView
            currentMonth={currentMonth}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            viewMode={viewMode}
            setViewMode={setViewMode}
            records={records}
            role={role}
            handleOpenModal={handleOpenModal}
          />
          <RecordModal
            selectedDateStr={selectedDateStr}
            setSelectedDateStr={setSelectedDateStr}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            unitPrice={unitPrice}
            setUnitPrice={setUnitPrice}
            harvestCount={harvestCount}
            setHarvestCount={setHarvestCount}
            handleSaveRecord={handleSaveRecord}
          />
        </>
      )}

      {activeTab === 'customers' && role === 'admin' && (
        <CustomerManager
          customers={customers}
          newCustomer={newCustomer}
          setNewCustomer={setNewCustomer}
          editingCustomer={editingCustomer}
          setEditingCustomer={setEditingCustomer}
          handleAddCustomer={handleAddCustomer}
          handleUpdateCustomer={handleUpdateCustomer}
          handleDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {activeTab === 'report' && (
        <ReportView
          month={month}
          year={year}
          totalCoconuts={totalCoconuts}
          totalMoney={totalMoney}
          harvestList={harvestList}
          monthlyStats={monthlyStats}
          maxCoconuts={maxCoconuts}
          maxMoney={maxMoney}
          yearlyTotalCoconuts={yearlyTotalCoconuts}
          yearlyTotalMoney={yearlyTotalMoney}
          bestMonth={bestMonth}
          bestMoney={bestMoney}
          handleSelectMonthYear={handleSelectMonthYear}
          formatShortMoney={formatShortMoney}
          formatShortCount={formatShortCount}
        />
      )}
    </div>
  );
};

export default App;