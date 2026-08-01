import React from 'react';

const LoginForm = ({ pinCode, setPinCode, handleLogin }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🥥
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sổ Thu Hoạch Dừa</h1>
        <p className="text-gray-500 text-sm mb-6">Vui lòng nhập mã PIN để tiếp tục</p>
        <input
          type="password"
          placeholder="Nhập mã PIN..."
          className="w-full border-2 border-gray-200 rounded-lg p-3 text-center text-xl tracking-widest mb-4 focus:outline-none focus:border-blue-500"
          value={pinCode}
          onChange={(e) => setPinCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          autoFocus
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Đăng Nhập
        </button>
      </div>
    </div>
  );
};

export default LoginForm;