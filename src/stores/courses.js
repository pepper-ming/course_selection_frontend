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
      console.log('Courses Store: 開始載入課程', params);
      this.loading = true;
      this.error = null;
      
      try {
        const response = await courseService.getCourses(params);
        this.courses = response.results;
        this.totalCount = response.count;
        this.filters = { ...this.filters, ...params };
        
        console.log('Courses Store: 課程載入成功', {
          count: this.totalCount,
          courses: this.courses.length
        });
      } catch (error) {
        console.error('Courses Store: 課程載入失敗', error);
        this.error = error.response?.data?.detail || '載入課程失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMyEnrollments() {
      console.log('Courses Store: 開始載入選課資料');
      this.loading = true;
      
      try {
        const enrollments = await courseService.getMyEnrollments();
        this.myEnrollments = enrollments;
        this.myCourses = enrollments.map(enrollment => enrollment.course);
        
        console.log('Courses Store: 選課資料載入成功', {
          enrollments: this.myEnrollments.length,
          courses: this.myCourses.length
        });
        
        // 詳細記錄每個選課記錄
        this.myEnrollments.forEach(enrollment => {
          console.log(`選課記錄 ID: ${enrollment.id}, 課程: ${enrollment.course.name} (ID: ${enrollment.course.id})`);
        });
        
      } catch (error) {
        console.error('Courses Store: 選課資料載入失敗', error);
        this.error = error.response?.data?.detail || '載入課表失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async enrollCourse(courseId) {
      console.log('Courses Store: 開始選課', courseId);
      this.loading = true;
      this.error = null;
      
      try {
        const enrollment = await courseService.enrollCourse(courseId);
        console.log('Courses Store: 選課成功', enrollment);
        
        // 重新載入選課資料
        await this.fetchMyEnrollments();
        
        // 重新載入課程資料以更新人數
        await this.fetchCourses(this.filters);
        
        return enrollment;
      } catch (error) {
        console.error('Courses Store: 選課失敗', error);
        this.error = error.response?.data?.detail || '選課失敗';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async withdrawCourse(enrollmentId) {
      console.log('Courses Store: 開始退選', enrollmentId);
      this.loading = true;
      this.error = null;
      
      try {
        await courseService.withdrawCourse(enrollmentId);
        console.log('Courses Store: 退選成功');
        
        // 重新載入選課資料
        await this.fetchMyEnrollments();
        
        // 重新載入課程資料以更新人數
        await this.fetchCourses(this.filters);
        
      } catch (error) {
        console.error('Courses Store: 退選失敗', error);
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
    },

    // 重置狀態
    $reset() {
      console.log('Courses Store: 重置狀態');
      this.courses = [];
      this.myCourses = [];
      this.myEnrollments = [];
      this.loading = false;
      this.error = null;
      this.totalCount = 0;
      this.filters = {
        search: '',
        type: '',
        semester: ''
      };
    }
  }
});