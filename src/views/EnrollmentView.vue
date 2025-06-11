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

        <button @click="refreshData" class="refresh-btn" :disabled="loading">
          {{ loading ? '重新整理中...' : '重新整理' }}
        </button>
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

    <!-- 移除除錯資訊 -->

    <!-- 課程列表 -->
    <div class="courses-container">
      <div v-if="filteredCourses.length === 0 && !loading" class="empty-state">
        <p>找不到符合條件的課程</p>
      </div>
      
      <CourseCard
        v-for="course in filteredCourses"
        :key="`course-${course.id}-${refreshKey}`"
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

const coursesStore = useCoursesStore();

const filters = reactive({
  search: '',
  type: ''
});

const showEnrolledOnly = ref(false);
const loading = ref(false);
const message = ref(null);
const operatingCourseId = ref(null);
const refreshKey = ref(0); // 用於強制重新渲染組件

// 計算屬性
const myEnrollments = computed(() => coursesStore.myEnrollments);
const enrolledCourseIds = computed(() => coursesStore.enrolledCourseIds);

const filteredCourses = computed(() => {
  let courses = coursesStore.courses;
  
  if (showEnrolledOnly.value) {
    courses = courses.filter(course => enrolledCourseIds.value.includes(course.id));
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
    console.log('課程載入完成，總數：', coursesStore.courses.length);
  } catch (err) {
    console.error('載入課程失敗：', err);
    showMessage('載入課程失敗', 'error');
  } finally {
    loading.value = false;
  }
};

const fetchMyEnrollments = async () => {
  try {
    await coursesStore.fetchMyEnrollments();
    console.log('選課資料載入完成，已選課程：', myEnrollments.value.length);
    console.log('已選課程詳細：', myEnrollments.value);
  } catch (err) {
    console.error('載入選課資料失敗:', err);
    showMessage('載入選課資料失敗', 'error');
  }
};

const refreshData = async () => {
  console.log('開始重新整理資料...');
  await Promise.all([
    fetchCourses(),
    fetchMyEnrollments()
  ]);
  refreshKey.value++; // 強制重新渲染
  console.log('資料重新整理完成');
};

const debouncedSearch = useDebounce(fetchCourses, 500);

const filterCourses = () => {
  // 篩選功能由 computed 處理
};

const isEnrolled = (courseId) => {
  return enrolledCourseIds.value.includes(courseId);
};

const getEnrollmentId = (courseId) => {
  const enrollment = coursesStore.findEnrollmentByCourseId(courseId);
  return enrollment?.id || null;
};

const validateEnrollment = (courseId) => {
  // 檢查選課門數上限
  if (myEnrollments.value.length >= 8) {
    showMessage('已達選課門數上限（8門）', 'error');
    return false;
  }
  
  // 檢查是否重複選課
  if (isEnrolled(courseId)) {
    showMessage('您已選過此課程', 'error');
    return false;
  }
  
  // 檢查課程是否額滿
  const course = coursesStore.courses.find(c => c.id === courseId);
  if (course && course.remaining_slots === 0) {
    showMessage('課程已額滿', 'error');
    return false;
  }
  
  // 檢查時間衝突
  if (checkTimeConflict(courseId)) {
    const conflictCourse = getConflictCourse(courseId);
    showMessage(`時間衝突：與「${conflictCourse}」的上課時間重疊`, 'error');
    return false;
  }
  
  return true;
};

// 時間衝突檢查函數
const checkTimeConflict = (courseId) => {
  const targetCourse = coursesStore.courses.find(c => c.id === courseId);
  if (!targetCourse || !targetCourse.timeslots) return false;
  
  for (const enrollment of myEnrollments.value) {
    const enrolledCourse = enrollment.course;
    if (!enrolledCourse.timeslots) continue;
    
    // 檢查每個時段是否有衝突
    for (const newSlot of targetCourse.timeslots) {
      for (const existingSlot of enrolledCourse.timeslots) {
        if (isTimeSlotConflict(newSlot, existingSlot)) {
          return true;
        }
      }
    }
  }
  return false;
};

// 檢查兩個時間時段是否衝突
const isTimeSlotConflict = (slot1, slot2) => {
  // 不同天不會衝突
  if (slot1.day_of_week !== slot2.day_of_week) return false;
  
  // 轉換時間為分鐘數便於比較
  const toMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1 = toMinutes(slot1.start_time);
  const end1 = toMinutes(slot1.end_time);
  const start2 = toMinutes(slot2.start_time);
  const end2 = toMinutes(slot2.end_time);
  
  // 時間重疊檢查：如果開始時間小於另一個結束時間，且結束時間大於另一個開始時間
  return start1 < end2 && end1 > start2;
};

// 取得衝突課程名稱
const getConflictCourse = (courseId) => {
  const targetCourse = coursesStore.courses.find(c => c.id === courseId);
  if (!targetCourse || !targetCourse.timeslots) return '';
  
  for (const enrollment of myEnrollments.value) {
    const enrolledCourse = enrollment.course;
    if (!enrolledCourse.timeslots) continue;
    
    for (const newSlot of targetCourse.timeslots) {
      for (const existingSlot of enrolledCourse.timeslots) {
        if (isTimeSlotConflict(newSlot, existingSlot)) {
          return enrolledCourse.name;
        }
      }
    }
  }
  return '';
};

const validateWithdraw = (enrollmentId) => {
  if (myEnrollments.value.length <= 2) {
    showMessage('至少需選擇 2 門課程，無法再退選', 'error');
    return false;
  }
  
  const enrollment = myEnrollments.value.find(e => e.id === enrollmentId);
  if (!enrollment) {
    showMessage('找不到選課記錄', 'error');
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
    const enrollment = await coursesStore.enrollCourse(courseId);
    
    // 重新載入資料確保狀態同步
    await refreshData();
    
    showMessage('選課成功！', 'success');
  } catch (err) {
    console.error('選課失敗：', err);
    const errorMessage = err.response?.data?.detail || '選課失敗';
    showMessage(errorMessage, 'error');
  } finally {
    operatingCourseId.value = null;
  }
};

const handleWithdraw = async (enrollmentId) => {
  if (!validateWithdraw(enrollmentId)) {
    return;
  }
  
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
    
    // 重新載入資料確保狀態同步
    await refreshData();
    
    showMessage('退選成功！', 'success');
  } catch (err) {
    console.error('退選失敗：', err);
    const errorMessage = err.response?.data?.detail || '退選失敗';
    showMessage(errorMessage, 'error');
  } finally {
    operatingCourseId.value = null;
  }
};

const showMessage = (text, type) => {
  message.value = { text, type };
  console.log('顯示訊息:', text, type);
  // 不自動清除訊息，讓使用者手動關閉
};

const clearMessage = () => {
  message.value = null;
};

// 生命週期
onMounted(async () => {
  await refreshData();
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

.refresh-btn {
  padding: 0.75rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #218838;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.debug-info {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.debug-info h4 {
  margin: 0 0 0.5rem 0;
  color: #856404;
}

.debug-info p {
  margin: 0.25rem 0;
  color: #856404;
}

.message-alert {
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  border: 1px solid;
  position: relative;
}

.message-alert.success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.message-alert.error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.message-alert.info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

.message-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
  color: inherit;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
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