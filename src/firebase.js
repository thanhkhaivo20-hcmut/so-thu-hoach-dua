import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Mã cấu hình Firebase chính thức từ tài khoản của bạn:
const firebaseConfig = {
  apiKey: "AIzaSyBLzRxjPgkB1Wm0lNRY3Ebd1vOGpe-fjN8",
  authDomain: "sothuhoachdua.firebaseapp.com",
  databaseURL: "https://sothuhoachdua-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sothuhoachdua",
  storageBucket: "sothuhoachdua.firebasestorage.app",
  messagingSenderId: "1019946049753",
  appId: "1:1019946049753:web:a63a92704a508a3b24dec8"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và xuất Cơ sở dữ liệu Realtime Database
export const db = getDatabase(app);