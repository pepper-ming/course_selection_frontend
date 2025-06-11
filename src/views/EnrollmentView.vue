<template>
  <div class="enrollment-page">
    <div class="page-header">
      <h1>選課作業</h1>
      <p>選擇或退選課程，管理您的課表</p>
    </div>

    <!-- 選課規則提醒 -->
    <div class="rules-section">
      <h3>選課規則</h3>
      <ul>
        <li>最少選修 2 門課程，最多選修 8 門課程</li>
        <li>目前已選：<strong>{{ myEnrollments.length }}</strong> 門課程</li>
        <li>請注意課程時間不可衝突</li>
        <li>課程額滿後無法選修</li>
      </ul>
    </div>

    <!-- 搜尋與篩選 -->
    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="filters.search"
          type="text"
          placeholder="搜尋課程名稱..."
          @input="debouncedSearch"
        />
      </div>
      
      <div class="filter-controls">
        <select v-model="filters.type" @change="fetchCourses">
          <option value="">所有類型</option>
          <option value="必修">必修</option>
          <option value="選修">選修</option>
        </select>
        
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="showEnrolledOnly"
            @change="filterCourses"
          />
          只顯示已選課程
        </label>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      載入中...
    </div>

    <!-- 訊息顯示 -->
    <MessageAlert 
      :message="message?.text" 
      :type="message?.type"
      v-if="message"
    />

    <!-- 課程列表 -->
    <div class="courses-container">
      <div v-if="filteredCourses.length === 0 && !loading" class="empty-state">
        <p>找不到符合條件的課程</p>
      </div>
      
      <CourseCard
        v-for="course in filteredCourses"
        :key="course.id"
        v-memo="[course.enrolled_count, course.remaining_slots, isEnrolled(course.id)]"
        :course="course"
        :is-enrolled="isEnrolled(course.id)"
        :enrollment-id="getEnrollmentId(course.id)"
        :loading="operatingCourseId === course.id"
        @enroll="handleEnroll"
        @withdraw="handleWithdraw"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useCoursesStore } from '@/stores/courses';
import { useDebounce } from '@/composables/useDebounce';
import CourseCard from '@/components/CourseCard.vue';
import MessageAlert from '@/components/MessageAlert.vue';

const coursesStore = useCoursesStore();

const filters = reactive({
  search: '',
  type: ''
});

const showEnrolledOnly = ref(false);
const loading = ref(false);
const message = ref(null);
const operatingCourseId = ref(null);

// 計算屬性
const myEnrollments = computed(() => coursesStore.myEnrollments);

const filteredCourses = computed(() => {
  let courses = coursesStore.courses;
  
  if (showEnrolledOnly.value) {
    const enrolledIds = coursesStore.enrolledCourseIds;
    courses = courses.filter(course => enrolledIds.includes(course.id));
  }
  
  return courses;
});

// 方法
const fetchCourses = async () => {
  loading.value = true;
  message.value = null;
  
  try {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    
    await coursesStore.fetchCourses(params);
  } catch (err) {
    showMessage('載入課程失敗', 'error');
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = useDebounce(fetchCourses, 500);

const fetchMyEnrollments = async () => {
  try {
    await coursesStore.fetchMyEnrollments();
  } catch (err) {
    console.error('載入選課資料失敗:', err);
  }
};

const filterCourses = () => {
  // 篩選功能由 computed 處理
};

const isEnrolled = (courseId) => {
  return coursesStore.enrolledCourseIds.includes(courseId);
};

const getEnrollmentId = (courseId) => {
  const enrollment = coursesStore.findEnrollmentByCourseId(courseId);
  return enrollment?.id || null;
};

const validateEnrollment = (courseId) => {
  if (myEnrollments.value.length >= 8) {
    showMessage('已達選課門數上限（8門）', 'error');
    return false;
  }
  
  if (isEnrolled(courseId)) {
    showMessage('您已選過此課程', 'error');
    return false;
  }
  
  const course = coursesStore.courses.find(c => c.id === courseId);
  if (course && course.remaining_slots === 0) {
    showMessage('課程已額滿', 'error');
    return false;
  }
  
  return true;
};

const handleEnroll = async (courseId) => {
  if (!validateEnrollment(courseId)) {
    return;
  }
  
  operatingCourseId.value = courseId;
  message.value = null;
  
  try {
    await coursesStore.enrollCourse(courseId);
    showMessage('選課成功！', 'success');
  } catch (err) {
    showMessage(err.response?.data?.detail || '選課失敗', 'error');
  } finally {
    operatingCourseId.value = null;
  }
};

const handleWithdraw = async (enrollmentId) => {
  if (!confirm('確定要退選這門課程嗎？')) {
    return;
  }
  
  const enrollment = myEnrollments.value.find(e => e.id === enrollmentId);
  if (enrollment) {
    operatingCourseId.value = enrollment.course.id;
  }
  
  message.value = null;
  
  try {
    await coursesStore.withdrawCourse(enrollmentId);
    showMessage('退選成功！', 'success');
  } catch (err) {
    showMessage(err.response?.data?.detail || '退選失敗', 'error');
  } finally {
    operatingCourseId.value = null;
  }
};

const showMessage = (text, type) => {
  message.value = { text, type };
};

// 生命週期
onMounted(async () => {
  await Promise.all([
    fetchCourses(),
    fetchMyEnrollments()
  ]);
});
</script>

<style scoped>
.enrollment-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #7f8c8d;
}

.rules-section {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.rules-section h3 {
  color: #495057;
  margin-bottom: 1rem;
}

.rules-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rules-section li {
  padding: 0.25rem 0;
  color: #6c757d;
}

.rules-section strong {
  color: #2c3e50;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-controls select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.courses-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
  }
  
  .filter-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .courses-container {
    grid-template-columns: 1fr;
  }
}
</style>