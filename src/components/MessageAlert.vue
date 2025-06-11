<template>
  <transition name="fade">
    <div v-if="visible" :class="['message-alert', type]">
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'info'
  },
  duration: {
    type: Number,
    default: 3000
  }
});

const visible = ref(false);

watch(() => props.message, (newVal) => {
  if (newVal) {
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, props.duration);
  }
});
</script>

<style scoped>
.message-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

.message-alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message-alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message-alert.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>