<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAm6fWvSGD0dqDEaKWhyY8gaPM93k5ST10",
    authDomain: "ascend-9091d.firebaseapp.com",
    projectId: "ascend-9091d",
    storageBucket: "ascend-9091d.firebasestorage.app",
    messagingSenderId: "330581902579",
    appId: "1:330581902579:web:ac56c43bd4654e348ce386",
    measurementId: "G-T9ZYZJZHFZ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
