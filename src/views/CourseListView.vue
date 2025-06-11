<template>
  <div class="course-list-page">
    <div class="page-header">
      <h1>課程查詢</h1>
      <p>瀏覽所有開設課程，查看課程詳細資訊</p>
    </div>

    <!-- 搜尋與篩選 -->
    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="filters.search"
          type="text"
          placeholder="搜尋課程名稱..."
          @input="debounceSearch"
        />
      </div>
      
      <div class="filter-controls">
        <select v-model="filters.type" @change="fetchCourses">
          <option value="">所有類型</option>
          <option value="必修">必修</option>
          <option value="選修">選修</option>
        </select>
        
        <select v-model="filters.semester" @change="fetchCourses">
          <option value="">所有學期</option>
          <option value="113上">113上</option>
          <option value="113下">113下</option>
        </select>
        
        <button @click="resetFilters" class="reset-btn">
          重置篩選
        </button>
      </div>
    </div>

    <!-- 課程統計 -->
    <div class="stats-section">
      <span>共找到 {{ coursesStore.totalCount }} 門課程</span>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="coursesStore.loading" class="loading-state">
      載入中...
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="coursesStore.error" class="error-state">
      {{ coursesStore.error }}
      <button @click="fetchCourses" class="retry-btn">重試</button>
    </div>

    <!-- 課程列表 -->
    <div v-else class="courses-grid">
      <CourseCard
        v-for="course in coursesStore.courses"
        :key="course.id"
        :course="course"
        :show-actions="false"
        :show-description="true"
      />
    </div>

    <!-- 無結果 -->
    <div v-if="!coursesStore.loading && coursesStore.courses.length === 0" class="empty-state">
      <p>找不到符合條件的課程</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useCoursesStore } from '@/stores/courses';
import CourseCard from '@/components/CourseCard.vue';

const coursesStore = useCoursesStore();

const filters = reactive({
  search: '',
  type: '',
  semester: ''
});

let searchTimer = null;

const fetchCourses = async () => {
  const params = {};
  
  if (filters.search) params.search = filters.search;
  if (filters.type) params.type = filters.type;
  if (filters.semester) params.semester = filters.semester;
  
  await coursesStore.fetchCourses(params);
};

const debounceSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchCourses();
  }, 500);
};

const resetFilters = () => {
  filters.search = '';
  filters.type = '';
  filters.semester = '';
  fetchCourses();
};

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.course-list-page {
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

.search-box input:focus {
  outline: none;
  border-color: #3498db;
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
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.reset-btn {
  padding: 0.75rem 1rem;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.reset-btn:hover {
  background-color: #7f8c8d;
}

.stats-section {
  margin-bottom: 1rem;
  color: #7f8c8d;
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

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #2980b9;
}

.courses-grid {
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
    justify-content: space-between;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>