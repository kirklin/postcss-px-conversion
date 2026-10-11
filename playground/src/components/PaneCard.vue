<script setup lang="ts" generic="T extends string">
defineProps<{
  // `short` replaces the label on narrow screens
  tabs: { id: T; label: string; short?: string }[];
  label: string;
}>();

const tab = defineModel<T>("tab", { required: true });
</script>

<template>
  <section class="pane">
    <header class="pane-head">
      <div class="tabs" role="tablist" :aria-label="label">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          role="tab"
          class="tab"
          :class="{ on: item.id === tab }"
          :aria-selected="item.id === tab"
          @click="tab = item.id"
        >
          <span class="tab-label" :class="{ shortened: item.short }">{{ item.label }}</span>
          <span v-if="item.short" class="tab-short">{{ item.short }}</span>
        </button>
      </div>
      <div class="pane-actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="pane-body">
      <slot />
    </div>
    <footer class="pane-foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.pane-head {
  display: flex;
  flex: none;
  align-items: stretch;
  justify-content: space-between;
  gap: 8px;
  height: 46px;
  padding: 0 8px 0 6px;
  border-bottom: 1px solid var(--line-soft);
}

.tabs {
  display: flex;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.tab {
  position: relative;
  flex: none;
  padding: 0 12px;
  font-family: var(--mono);
  font-size: 13px;
  font-variant-ligatures: none;
  color: var(--muted);
  transition: color 0.15s;
}

.tab:hover {
  color: var(--ink);
}

.tab.on {
  color: var(--ink);
  font-weight: 500;
}

.tab.on::after {
  content: "";
  position: absolute;
  right: 12px;
  bottom: -1px;
  left: 12px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent-strong);
}

.pane-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 4px;
}

.tab-short {
  display: none;
}

@media (max-width: 480px) {
  .tab {
    padding: 0 9px;
  }

  .tab.on::after {
    right: 9px;
    left: 9px;
  }

  .tab-label.shortened {
    display: none;
  }

  .tab-short {
    display: inline;
  }
}

.pane-body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.pane-foot {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  min-height: 46px;
  padding: 6px 8px 6px 16px;
  border-top: 1px solid var(--line-soft);
  background: var(--surface-foot);
  font-family: var(--mono);
  font-size: 12px;
  font-variant-ligatures: none;
  color: var(--muted);
}
</style>
