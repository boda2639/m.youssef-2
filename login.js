// login.js - M.YOUSSEF Platform (Single Device + Remember Login)

import { auth, db } from './firebase.js';

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

// عناصر الصفحة
const form = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const msg = document.getElementById('loginMessage');

// ===============================
// إنشاء بصمة ثابتة للجهاز
// ===============================
function generateDeviceId() {
  let deviceId = localStorage.getItem('m_youssef_device_id');

  if (!deviceId) {
    const raw = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform
    ].join('|');

    deviceId = btoa(raw).replace(/=/g, '');
    localStorage.setItem('m_youssef_device_id', deviceId);
  }

  return deviceId;
}

const currentDeviceId = generateDeviceId();

// ===============================
// اسم الجهاز
// ===============================
function getDeviceName() {
  const ua = navigator.userAgent;

  if (/Android/i.test(ua)) return 'Android Device';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iPhone / iPad';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Mac/i.test(ua)) return 'Mac Device';

  return 'Unknown Device';
}

// ===============================
// إظهار الرسائل
// ===============================
function showMessage(text, type = 'error') {
  if (!msg) return;

  msg.textContent = text;
  msg.className = type === 'success'
    ? 'message success'
    : 'message error';
}

// ===============================
// حالة زر الدخول
// ===============================
function setLoading(state) {
  if (!loginBtn) return;

  loginBtn.disabled = state;

  if (btnText) btnText.style.display = state ? 'none' : 'inline-block';
  if (btnLoader) btnLoader.style.display = state ? 'inline-block' : 'none';
}

// ===============================
// لو المستخدم مسجل بالفعل
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const userRef = doc(db, 'students', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    const data = snap.data();

    // التحقق من الجهاز
    if (data.deviceId && data.deviceId !== currentDeviceId) {
      await signOut(auth);
      showMessage('هذا الحساب يعمل على جهاز آخر');
      return;
    }

    // تحديث آخر دخول
    await updateDoc(userRef, {
      activeDeviceId: currentDeviceId,
      lastLogin: serverTimestamp()
    });

    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error(err);
  }
});

// ===============================
// تسجيل الدخول
// ===============================
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value.trim();

  if (!email || !password) {
    showMessage('اكتب البريد الإلكتروني وكلمة المرور');
    return;
  }

  setLoading(true);

  try {
    // حفظ تسجيل الدخول دائماً
    await setPersistence(auth, browserLocalPersistence);

    // تسجيل الدخول
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const userRef = doc(db, 'students', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await signOut(auth);
      showMessage('الحساب غير موجود');
      setLoading(false);
      return;
    }

    const data = snap.data();

    // ===============================
    // ربط الحساب بأول جهاز
    // ===============================
    if (!data.deviceId || data.deviceId === '') {

      await updateDoc(userRef, {
        deviceId: currentDeviceId,
        activeDeviceId: currentDeviceId,
        deviceName: getDeviceName(),
        currentSessionId: crypto.randomUUID(),
        lastLogin: serverTimestamp()
      });

    } else if (data.deviceId !== currentDeviceId) {

      // الجهاز مختلف
      await signOut(auth);

      showMessage(
        'هذا الحساب مربوط بجهاز آخر. تواصل مع المدرس لتغيير الجهاز.'
      );

      setLoading(false);
      return;
    } else {

      // نفس الجهاز
      await updateDoc(userRef, {
        activeDeviceId: currentDeviceId,
        currentSessionId: crypto.randomUUID(),
        lastLogin: serverTimestamp()
      });
    }

    showMessage('تم تسجيل الدخول بنجاح', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);

  } catch (error) {
    console.error(error);

    let message = 'حدث خطأ أثناء تسجيل الدخول';

    switch (error.code) {
      case 'auth/invalid-email':
        message = 'البريد الإلكتروني غير صحيح';
        break;

      case 'auth/user-not-found':
        message = 'الحساب غير موجود';
        break;

      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = 'كلمة المرور غير صحيحة';
        break;

      case 'auth/too-many-requests':
        message = 'تم حظر المحاولات مؤقتاً، حاول لاحقاً';
        break;
    }

    showMessage(message);

  } finally {
    setLoading(false);
  }
});

// ===============================
// تسجيل الخروج (اختياري)
// ===============================
window.logout = async function () {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (err) {
    console.error(err);
  }
};
