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
    // نمرر كود الحالة (Status) مع الرسالة لنتعامل معها في الواجهة
    const error = new Error(errorData.error || `HTTP error! status: ${response.status}`) as any;
    error.status = response.status;
    throw error;
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
  getGrades: () => apiFetch('/student/subjects'),
};

export const adminApi = {
  getStudents: () => apiFetch('/admin/students'),
  updateStudent: (id: number, data: any) => apiFetch(`/admin/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id: number) => apiFetch(`/admin/students/${id}`, { method: 'DELETE' }),
  
  // Subjects
  getSubjects: () => apiFetch('/admin/subjects'),
  createSubject: (data: any) => apiFetch('/admin/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id: number, data: any) => apiFetch(`/admin/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: (id: number) => apiFetch(`/admin/subjects/${id}`, { method: 'DELETE' }),
  
  // Student-Subject Assignment
  assignSubject: (data: any) => apiFetch('/admin/students/subjects', { method: 'POST', body: JSON.stringify(data) }),
  removeSubject: (studentId: number, subjectId: number) => apiFetch(`/admin/students/${studentId}/subjects/${subjectId}`, { method: 'DELETE' }),
  getStudentSubjects: (studentId: number) => apiFetch(`/admin/students/${studentId}/subjects`),
  
  // Grades
  getAllGrades: () => apiFetch('/admin/grades'),
  getStudentGrades: (studentId: number) => apiFetch(`/admin/students/${studentId}/grades`),
  updateGrade: (studentId: number, subjectId: number, data: any) => apiFetch(`/admin/students/${studentId}/grades/${subjectId}`, { method: 'PUT', body: JSON.stringify(data) }),
};
