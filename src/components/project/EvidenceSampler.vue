<script setup lang="ts">
/* eslint-disable vue/max-attributes-per-line, vue/singleline-html-element-content-newline */
import { computed, nextTick, ref } from 'vue';

export interface EvidenceGroup {
  id: string;
  label: string;
  items: string[];
}

const props = defineProps<{ groups: EvidenceGroup[] }>();
const activeId = ref(props.groups[0]?.id ?? '');
const activeGroup = computed(() => props.groups.find(({ id }) => id === activeId.value));

function select(id: string): void {
  activeId.value = id;
}

function move(event: globalThis.KeyboardEvent, currentIndex: number): void {
  const lastIndex = props.groups.length - 1;
  const destinations: Record<string, number> = {
    ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
    ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
    Home: 0,
    End: lastIndex,
  };
  const destination = destinations[event.key];

  if (destination === undefined) return;

  event.preventDefault();
  select(props.groups[destination].id);
  void nextTick(() =>
    globalThis.document.getElementById(`tab-${props.groups[destination].id}`)?.focus(),
  );
}
</script>

<template>
  <section class="evidence" aria-labelledby="evidence-heading">
    <div class="heading-row">
      <p class="eyebrow">Technical read</p>
      <h2 id="evidence-heading">Evidence sampler</h2>
    </div>
    <div class="tabs" role="tablist" aria-label="Project evidence">
      <button
        v-for="(group, index) in groups"
        :id="`tab-${group.id}`"
        :key="group.id"
        role="tab"
        type="button"
        :aria-controls="`panel-${group.id}`"
        :aria-selected="group.id === activeId"
        :tabindex="group.id === activeId ? 0 : -1"
        @click="select(group.id)"
        @keydown.enter="select(group.id)"
        @keydown.space.prevent="select(group.id)"
        @keydown="move($event, index)"
      >
        {{ group.label }}
      </button>
    </div>
    <div
      v-for="group in groups"
      v-show="group.id === activeGroup?.id"
      :id="`panel-${group.id}`"
      :key="group.id"
      role="tabpanel"
      :aria-labelledby="`tab-${group.id}`"
      tabindex="0"
    >
      <ul>
        <li v-for="item in group.items" :key="item">
          {{ item }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.evidence {
  border-block: 1px solid var(--color-night-700);
  padding-block: var(--space-6);
}

.heading-row {
  display: grid;
  grid-template-columns: minmax(8rem, 0.5fr) minmax(0, 1.5fr);
  gap: var(--space-4);
  align-items: baseline;
}

.heading-row h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 400;
}

.heading-row p {
  margin: 0;
}

.tabs {
  display: flex;
  gap: var(--space-2);
  margin-block: var(--space-5) var(--space-3);
  overflow-x: auto;
}

button {
  border: 0;
  border-bottom: 2px solid transparent;
  padding: var(--space-2) var(--space-3);
  background: transparent;
  color: var(--color-ink-muted);
  font: inherit;
  cursor: pointer;
}

button[aria-selected='true'] {
  border-color: var(--color-vermilion);
  color: var(--color-ink);
}

ul {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding-left: 1.25rem;
}

@media (max-width: 40rem) {
  .heading-row {
    grid-template-columns: 1fr;
  }
}
</style>
