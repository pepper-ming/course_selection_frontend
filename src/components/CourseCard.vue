<template>
  <div class="course-card" :class="{ 'enrolled': isEnrolled, 'full': isFull }">
    <div class="card-header">
      <h3>{{ course.name }}</h3>
      <span class="course-code">{{ course.course_code }}</span>
    </div>
    
    <div class="card-body">
      <div class="course-info">
        <div class="info-item">
          <span class="label">類型：</span>
          <span class="value" :class="course.type === '必修' ? 'required' : 'elective'">
            {{ course.type }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">學分：</span>
          <span class="value">{{ course.credit }}</span>
        </div>
        <div class="info-item">
          <span class="label">人數：</span>
          <span class="value" :class="{ 'warning': course.remaining_slots <= 5, 'danger': course.remaining_slots === 0 }">
            {{ course.enrolled_count }} / {{ course.capacity }}
            (剩餘 {{ course.remaining_slots }})
          </span>
        </div>
      </div>

      <div class="timeslots" v-if="course.timeslots && course.timeslots.length > 0">
        <h4>上課時間：</h4>
        <TimeSlotDisplay :timeslots="course.timeslots" />
      </div>

      <div class="description" v-if="course.description && showDescription">
        <p>{{ course.description }}</p>
      </div>
    </div>

    <div class="card-actions" v-if="showActions">
      <button 
        v-if="!isEnrolled && !isFull" 
        @click="$emit('enroll', course.id)"
        class="btn btn-primary"
        :disabled="loading"
      >
        {{ loading ? '處理中...' : '選課' }}
      </button>
      
      <button 
        v-if="isEnrolled" 
        @click="$emit('withdraw', enrollmentId)"
        class="btn btn-danger"
        :disabled="loading"
      >
        {{ loading ? '處理中...' : '退選' }}
      </button>
      
      <span v-if="isFull && !isEnrolled" class="full-message">
        課程已額滿
      </span>
    </div>
  </div>
</template>

<script setup>
import TimeSlotDisplay from './TimeSlotDisplay.vue';

const props = defineProps({
  course: {
    type: Object,
    required: true
  },
  isEnrolled: {
    type: Boolean,
    default: false
  },
  enrollmentId: {
    type: Number,
    default: null
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showDescription: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['enroll', 'withdraw']);

const isFull = props.course.remaining_slots === 0;
</script>

<style scoped>
.course-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.course-card.enrolled {
  border-color: #27ae60;
  background-color: #f0f9f4;
}

.course-card.full {
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
}

.course-code {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.course-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.value {
  font-weight: 500;
}

.value.required {
  color: #e74c3c;
}

.value.elective {
  color: #3498db;
}

.value.warning {
  color: #f39c12;
}

.value.danger {
  color: #e74c3c;
  font-weight: bold;
}

.timeslots {
  margin: 1rem 0;
}

.timeslots h4 {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.description {
  margin: 1rem 0;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.5;
}

.card-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.full-message {
  color: #e74c3c;
  font-weight: 500;
}
</style>