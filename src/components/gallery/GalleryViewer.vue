<script setup lang="ts">
/* eslint-disable vue/html-self-closing, vue/max-attributes-per-line, vue/singleline-html-element-content-newline */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

export interface GalleryViewItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  location: string;
  date: string;
}

const props = defineProps<{ items: GalleryViewItem[] }>();

const activeIndex = ref<number | null>(null);
const closeButton = ref<globalThis.HTMLButtonElement | null>(null);
const activeItem = computed(() =>
  activeIndex.value === null ? null : props.items[activeIndex.value],
);
let triggerElement: globalThis.HTMLButtonElement | null = null;
let previousBodyOverflow = '';

async function open(index: number, event: globalThis.MouseEvent) {
  triggerElement = event.currentTarget as globalThis.HTMLButtonElement;
  activeIndex.value = index;
  await nextTick();
  closeButton.value?.focus();
}

async function close() {
  activeIndex.value = null;
  await nextTick();
  triggerElement?.focus();
}

function move(step: number) {
  if (activeIndex.value === null || props.items.length === 0) return;

  activeIndex.value = (activeIndex.value + step + props.items.length) % props.items.length;
}

function handleKeydown(event: globalThis.KeyboardEvent) {
  if (activeIndex.value === null) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    void close();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    move(1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    move(-1);
  }
}

watch(activeIndex, (index, previousIndex) => {
  if (index !== null && previousIndex === null) {
    previousBodyOverflow = globalThis.document.body.style.overflow;
    globalThis.document.body.style.overflow = 'hidden';
  } else if (index === null && previousIndex !== null) {
    globalThis.document.body.style.overflow = previousBodyOverflow;
  }
});

onMounted(() => globalThis.addEventListener('keydown', handleKeydown));

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeydown);
  if (activeIndex.value !== null) {
    globalThis.document.body.style.overflow = previousBodyOverflow;
  }
});
</script>

<template>
  <div class="gallery-grid">
    <button
      v-for="(item, index) in items"
      :key="item.id"
      class="gallery-trigger"
      type="button"
      :aria-label="`Open ${item.title}`"
      @click="open(index, $event)"
    >
      <figure>
        <img :src="item.src" :alt="item.alt" loading="lazy" decoding="async" />
        <figcaption>
          <strong>{{ item.title }}</strong>
          <span>{{ item.location }}</span>
          <time>{{ item.date }}</time>
        </figcaption>
      </figure>
    </button>
  </div>

  <Teleport to="body">
  <Transition name="viewer">
    <div
      v-if="activeItem"
      class="viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
    >
      <div class="viewer-panel">
        <button ref="closeButton" class="viewer-close" type="button" @click="close">Close</button>
        <figure>
          <img :src="activeItem.src" :alt="activeItem.alt" />
          <figcaption>
            <h2 id="viewer-title">{{ activeItem.title }}</h2>
            <p>{{ activeItem.location }}</p>
            <time>{{ activeItem.date }}</time>
          </figcaption>
        </figure>
        <div class="viewer-controls" aria-label="Gallery navigation">
          <button type="button" @click="move(-1)">Previous</button>
          <button type="button" @click="move(1)">Next</button>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-5) var(--space-3);
}

.gallery-trigger {
  grid-column: span 6;
  padding: 0;
  border: 0;
  border-radius: var(--radius-small);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: zoom-in;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.gallery-trigger:nth-child(3n + 1) {
  grid-column: span 7;
}

.gallery-trigger:nth-child(3n + 2) {
  grid-column: span 5;
}

.gallery-trigger:hover {
  opacity: 0.88;
  transform: translateY(-0.2rem);
}

.gallery-trigger:active {
  transform: translateY(0.05rem);
}

figure {
  margin: 0;
}

.gallery-trigger img {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-small);
  object-fit: cover;
}

.gallery-trigger figcaption {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-top: var(--space-2);
  gap: 0 var(--space-3);
  color: var(--color-ink-muted);
  font-size: var(--step--1);
}

.gallery-trigger strong {
  color: var(--color-ink);
  font-weight: 600;
}

.gallery-trigger span {
  grid-row: 2;
}

.gallery-trigger time {
  grid-column: 2;
  grid-row: 1 / span 2;
}

.viewer {
  position: fixed;
  z-index: 40;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--space-4);
  overflow-y: auto;
  background: rgb(13 16 24 / 0.94);
}

.viewer-enter-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.viewer-enter-active .viewer-panel {
  transition: transform var(--duration-fast) var(--ease-out);
}

.viewer-enter-from {
  opacity: 0;
}

.viewer-enter-from .viewer-panel {
  transform: translateY(0.75rem) scale(0.985);
}

.viewer-panel {
  display: grid;
  width: min(100%, 72rem);
  max-height: calc(100dvh - 3rem);
  min-height: 0;
  overflow-y: auto;
  gap: var(--space-3);
}

.viewer-close {
  justify-self: end;
}

.viewer-panel figure {
  display: grid;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr) minmax(10rem, 18rem);
  gap: var(--space-4);
  align-items: end;
}

.viewer-panel img {
  width: 100%;
  max-height: calc(100dvh - 10rem);
  border-radius: var(--radius-small);
  object-fit: contain;
}

.viewer-panel figcaption {
  padding-bottom: var(--space-2);
}

.viewer-panel h2,
.viewer-panel p {
  margin: 0 0 var(--space-1);
}

.viewer-panel h2 {
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 400;
  line-height: 1.08;
}

.viewer-panel p,
.viewer-panel time {
  color: var(--color-ink-muted);
}

.viewer-close,
.viewer-controls button {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-ink-muted);
  border-radius: var(--radius-small);
  background: var(--color-night-900);
  color: var(--color-ink);
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out);
}

.viewer-close:hover,
.viewer-controls button:hover {
  border-color: var(--color-vermilion-strong);
  color: var(--color-vermilion-strong);
}

.viewer-close:active,
.viewer-controls button:active {
  transform: translateY(0.05rem);
}

.viewer-controls {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}

@media (max-width: 47.99rem) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-trigger,
  .gallery-trigger:nth-child(n) {
    grid-column: 1;
  }

  .viewer {
    padding: var(--space-3);
  }

  .viewer-panel {
    max-height: calc(100dvh - 2rem);
  }

  .viewer-panel figure {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .viewer-panel img {
    max-height: 58dvh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gallery-trigger,
  .viewer-enter-active,
  .viewer-enter-active .viewer-panel,
  .viewer-close,
  .viewer-controls button {
    transition: none;
  }
}
</style>
