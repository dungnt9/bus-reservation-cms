<template>
  <div class="pagination-container" v-if="totalPages > 1">
    <nav aria-label="Page navigation">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 0 }">
          <a class="page-link" href="#" @click.prevent="onPageChange(currentPage - 1)">
            Previous
          </a>
        </li>
        <li
          v-for="page in displayedPages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage + 1 }"
        >
          <a class="page-link" href="#" @click.prevent="onPageChange(page - 1)">
            {{ page }}
          </a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
          <a class="page-link" href="#" @click.prevent="onPageChange(currentPage + 1)"> Next </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['page-change'])

const displayedPages = computed(() => {
  const pages = []
  let start = Math.max(1, props.currentPage - 1)
  let end = Math.min(props.totalPages, start + 4)

  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const onPageChange = (page) => {
  if (page >= 0 && page < props.totalPages) {
    emit('page-change', page)
  }
}
</script>

<style scoped>
.pagination-container {
  margin-top: 1rem;
}

.page-link {
  color: #0d6efd;
  cursor: pointer;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
}
</style>
