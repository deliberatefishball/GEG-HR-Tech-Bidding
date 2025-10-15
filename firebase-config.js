// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnUdtkoBO62V8WFUxRLOqkCp-1NBYsoZM",
  authDomain: "test1-a3afa.firebaseapp.com",
  databaseURL: "https://test1-a3afa-default-rtdb.firebaseio.com",
  projectId: "test1-a3afa",
  storageBucket: "test1-a3afa.firebasestorage.app",
  messagingSenderId: "224974149907",
  appId: "1:224974149907:web:ddfad82d7277f34ff062e6",
  measurementId: "G-ZX4WHE0PWJ"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 获取数据库引用
const database = firebase.database();