import apiClient from './api';

export default {
  // 取得課程列表
  async getCourses(params = {}) {
    const response = await apiClient.get('/courses/', { params });
    return response.data;
  },

  // 取得單一課程
  async getCourse(id) {
    const response = await apiClient.get(`/courses/${id}/`);
    return response.data;
  },

  // 取得我的選課列表
  async getMyEnrollments() {
    const response = await apiClient.get('/enrollments/');
    return response.data;
  },

  // 選課
  async enrollCourse(courseId) {
    const response = await apiClient.post('/enrollments/', { 
      course_id: courseId 
    });
    return response.data;
  },

  // 退選
  async withdrawCourse(enrollmentId) {
    const response = await apiClient.delete(`/enrollments/${enrollmentId}/`);
    return response.data;
  },

  // 取得我的課表（另一個端點）
  async getMyCourses() {
    const response = await apiClient.get('/enrollments/my-courses/');
    return response.data;
  }
};