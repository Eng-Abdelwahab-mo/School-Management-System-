const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // 1. جلب التوكن من التخزين المحلي للمتصفح (localStorage) إذا كان موجوداً
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // 2. إعداد ترويسات الطلب (Headers) وإضافة التوكن للمصادقة
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 3. إرسال الطلب الفعلي إلى الخلفية (Backend) عبر الرابط الموحد
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. معالجة الأخطاء إذا كانت الاستجابة غير ناجحة
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  // 5. إرجاع البيانات المحولة إلى JSON للجهة التي استدعت الدالة
  return response.json();
}

export const authApi = {
  login: (data: any) => apiFetch('/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => apiFetch('/register', { method: 'POST', body: JSON.stringify(data) }),
};

export const studentApi = {
  getProfile: () => apiFetch('/student/profile'),
};
