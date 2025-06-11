import { defineStore } from 'pinia';
import courseService from '@/services/courseService';

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [],
    myCourses: [],
    myEnrollments: [],
    loading: false,
    error: null,
    totalCount: 0,
    filters: {
      search: '',
      type: '',
      semester: ''
    }
  }),

  getters: {
    filteredCourses: (state) => state.courses,
    enrolledCourseIds: (state) => {
      return state.myEnrollments.map(enrollment => enrollment.course.id);
    },
    totalCredits: (state) => {
      return state.myCourses.reduce((sum, course) => sum + course.credit, 0);
    }
  },

  actions: {
    async fetchCourses(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await courseService.getCourses(params);
        this.courses = response.results;
        this.totalCount = response.count;
        this.filters = { ...this.filters, ...params };
      } catch (error) {
        this.error = error.response?.data?.detail || '載入課程失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMyEnrollments() {
      this.loading = true;
      try {
        const enrollments = await courseService.getMyEnrollments();
        this.myEnrollments = enrollments;
        this.myCourses = enrollments.map(enrollment => enrollment.course);
      } catch (error) {
        this.error = error.response?.data?.detail || '載入課表失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async enrollCourse(courseId) {
      this.loading = true;
      this.error = null;
      try {
        const enrollment = await courseService.enrollCourse(courseId);
        await this.fetchMyEnrollments();
        return enrollment;
      } catch (error) {
        this.error = error.response?.data?.detail || '選課失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async withdrawCourse(enrollmentId) {
      this.loading = true;
      this.error = null;
      try {
        await courseService.withdrawCourse(enrollmentId);
        await this.fetchMyEnrollments();
      } catch (error) {
        this.error = error.response?.data?.detail || '退選失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    findEnrollmentByCourseId(courseId) {
      return this.myEnrollments.find(
        enrollment => enrollment.course.id === courseId
      );
    }
  }
});