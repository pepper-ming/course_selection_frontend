<template>
  <div class="timeslots-container">
    <div 
      v-for="(slot, index) in timeslots" 
      :key="index"
      class="timeslot"
    >
      <span class="day">{{ getDayName(slot.day_of_week) }}</span>
      <span class="time">{{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}</span>
      <span class="location" v-if="slot.location">@ {{ slot.location }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  timeslots: {
    type: Array,
    required: true
  }
});

const dayNames = {
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  7: '星期日'
};

const getDayName = (dayNumber) => {
  return dayNames[dayNumber] || `Day ${dayNumber}`;
};

const formatTime = (time) => {
  if (!time) return '';
  // 如果已經是格式化的時間字串，直接返回
  if (typeof time === 'string' && time.includes(':')) {
    return time.substring(0, 5); // 只取 HH:MM
  }
  return time;
};
</script>

<style scoped>
.timeslots-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeslot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.day {
  font-weight: 500;
  color: #2c3e50;
  min-width: 60px;
}

.time {
  color: #555;
}

.location {
  color: #7f8c8d;
  font-size: 0.85rem;
}
</style>