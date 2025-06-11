<template>
  <div class="my-courses-page">
    <div class="page-header">
      <h1>我的課表</h1>
      <p>查看您已選修的所有課程</p>
    </div>

    <!-- 課表統計 -->
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-label">已選課程數</span>
        <span class="stat-value">{{ myCourses.length }} / 8</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">總學分數</span>
        <span class="stat-value">{{ totalCredits }}</span>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      載入中...
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="error" class="error-state">
      {{ error }}
      <button @click="fetchMyCourses" class="retry-btn">重試</button>
    </div>

    <!-- 課表視圖切換 -->
    <div v-else class="view-controls">
      <button 
        :class="['view-btn', { active: viewMode === 'list' }]"
        @click="viewMode = 'list'"
      >
        列表檢視
      </button>
      <button 
        :class="['view-btn', { active: viewMode === 'calendar' }]"
        @click="viewMode = 'calendar'"
      >
        時間表檢視
      </button>
    </div>

    <!-- 列表視圖 -->
    <div v-if="viewMode === 'list' && !loading && !error" class="list-view">
      <div v-if="myCourses.length === 0" class="empty-state">
        <p>您還沒有選修任何課程</p>
        <router-link to="/enrollment" class="action-link">前往選課</router-link>
      </div>
      
      <div v-else class="courses-list">
        <div 
          v-for="enrollment in myEnrollments" 
          :key="enrollment.id"
          class="course-item"
        >
          <CourseCard
            :course="enrollment.course"
            :is-enrolled="true"
            :enrollment-id="enrollment.id"
            :loading="operatingEnrollmentId === enrollment.id"
            @withdraw="handleWithdraw"
          />
        </div>
      </div>
    </div>

    <!-- 時間表視圖 -->
    <div v-if="viewMode === 'calendar' && !loading && !error" class="calendar-view">
      <div v-if="myCourses.length === 0" class="empty-state">
        <p>您還沒有選修任何課程</p>
        <router-link to="/enrollment" class="action-link">前往選課</router-link>
      </div>
      
      <div v-else class="calendar-container">
        <table class="calendar-table">
          <thead>
            <tr>
              <th>時間</th>
              <th v-for="day in days" :key="day.value">{{ day.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hour in hours" :key="hour">
              <td class="time-cell">{{ hour }}:00</td>
              <td 
                v-for="day in days" 
                :key="`${day.value}-${hour}`"
                class="course-cell"
              >
                <div 
                  v-for="course in getCoursesAtTime(day.value, hour)"
                  :key="course.id"
                  class="course-block"
                  :style="getCourseBlockStyle(course, day.value, hour)"
                >
                  <div class="course-name">{{ course.name }}</div>
                  <div class="course-location">{{ course.location }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 訊息顯示 -->
    <MessageAlert 
      :message="message?.text" 
      :type="message?.type"
      v-if="message"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCoursesStore } from '@/stores/courses';
import CourseCard from '@/components/CourseCard.vue';
import MessageAlert from '@/components/MessageAlert.vue';

const coursesStore = useCoursesStore();

const viewMode = ref('list');
const loading = ref(false);
const error = ref('');
const operatingEnrollmentId = ref(null);
const message = ref(null);

// 時間表設定
const days = [
  { value: 1, label: '星期一' },
  { value: 2, label: '星期二' },
  { value: 3, label: '星期三' },
  { value: 4, label: '星期四' },
  { value: 5, label: '星期五' }
];

const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 ~ 20:00

// 計算屬性
const myEnrollments = computed(() => coursesStore.myEnrollments);
const myCourses = computed(() => coursesStore.myCourses);
const totalCredits = computed(() => coursesStore.totalCredits);

// 時間表相關方法
const getCoursesAtTime = (dayOfWeek, hour) => {
  const coursesAtTime = [];
  
  myCourses.value.forEach(course => {
    course.timeslots?.forEach(slot => {
      if (slot.day_of_week === dayOfWeek) {
        const startHour = parseInt(slot.start_time.split(':')[0]);
        const endHour = parseInt(slot.end_time.split(':')[0]);
        
        if (hour >= startHour && hour < endHour) {
          coursesAtTime.push({
            ...course,
            location: slot.location,
            startHour,
            endHour,
            slot
          });
        }
      }
    });
  });
  
  return coursesAtTime;
};

const getCourseBlockStyle = (course, dayOfWeek, hour) => {
  const startHour = course.startHour;
  const endHour = course.endHour;
  const duration = endHour - startHour;
  
  if (hour === startHour) {
    return {
      height: `${duration * 60}px`,
      backgroundColor: getCourseColor(course.id)
    };
  }
  
  return { display: 'none' };
};

const getCourseColor = (courseId) => {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
  ];
  return colors[courseId % colors.length];
};

// 方法
const fetchMyCourses = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await coursesStore.fetchMyEnrollments();
  } catch (err) {
    error.value = '載入課表失敗';
  } finally {
    loading.value = false;
  }
};

const validateWithdraw = () => {
  if (myEnrollments.value.length <= 2) {
    showMessage('至少需選擇 2 門課程，無法再退選', 'error');
    return false;
  }
  return true;
};

const handleWithdraw = async (enrollmentId) => {
  if (!validateWithdraw()) {
    return;
  }
  
  if (!confirm('確定要退選這門課程嗎？')) {
    return;
  }
  
  operatingEnrollmentId.value = enrollmentId;
  message.value = null;
  
  try {
    await coursesStore.withdrawCourse(enrollmentId);
    showMessage('退選成功！', 'success');
  } catch (err) {
    showMessage(err.response?.data?.detail || '退選失敗', 'error');
  } finally {
    operatingEnrollmentId.value = null;
  }
};

const showMessage = (text, type) => {
  message.value = { text, type };
};

// 生命週期
onMounted(() => {
  fetchMyCourses();
});
</script>

<style scoped>
/* 原有的樣式保持不變 */
.my-courses-page {
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

.stats-section {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: bold;
}

.view-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.view-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.view-btn:hover:not(.active) {
  background: #f8f9fa;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.error-state {
  color: #e74c3c;
}

.retry-btn,
.action-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover,
.action-link:hover {
  background-color: #2980b9;
}

.courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.calendar-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.calendar-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.calendar-table th,
.calendar-table td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: center;
}

.calendar-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.time-cell {
  background: #f8f9fa;
  font-weight: 500;
  color: #7f8c8d;
  width: 80px;
}

.course-cell {
  position: relative;
  height: 60px;
  vertical-align: top;
}

.course-block {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  color: white;
  border-radius: 4px;
  overflow: hidden;
  z-index: 1;
}

.course-name {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-location {
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .stats-section {
    flex-direction: column;
    gap: 1rem;
  }
  
  .courses-list {
    grid-template-columns: 1fr;
  }
}
</style>