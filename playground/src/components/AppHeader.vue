<script setup lang="ts">
import { locale, t } from "~/lib/i18n";
import { theme } from "~/lib/theme";

defineProps<{ shared: boolean }>();
const emit = defineEmits<{ share: [] }>();

const VERSION = __PLUGIN_VERSION__;
const REPOSITORY = "https://github.com/kirklin/postcss-px-conversion";
const DOCS = `${REPOSITORY}#readme`;
const RELEASES = `${REPOSITORY}/releases`;
const NPM = "https://www.npmjs.com/package/postcss-px-conversion";

function toggleLocale() {
  locale.value = locale.value === "en" ? "zh" : "en";
}

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <header class="header">
    <div class="brand">
      <span class="mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 72 72" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="18" y="18" width="36" height="36" rx="7" />
          <rect x="18" y="38" width="16" height="16" rx="3" fill="#fff" />
          <path d="M37.5 34.5L47 25" />
          <path d="M40 25H47V32" />
        </svg>
      </span>
      <span class="brand-name">postcss-px-conversion</span>
      <a class="version" :href="RELEASES" target="_blank" rel="noreferrer">v{{ VERSION }}</a>
      <span class="section">{{ t.playground }}</span>
    </div>

    <nav class="nav">
      <a class="nav-link" :href="DOCS" target="_blank" rel="noreferrer">{{ t.docs }}</a>
      <a class="icon-button site" :href="NPM" target="_blank" rel="noreferrer" aria-label="npm" title="npm">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
        </svg>
      </a>
      <a class="icon-button site" :href="REPOSITORY" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      </a>
      <span class="nav-divider" />
      <button type="button" class="nav-link" :aria-label="t.switchLanguage" @click="toggleLocale">
        {{ t.otherLanguage }}
      </button>
      <button type="button" class="icon-button" :aria-label="theme === 'dark' ? t.useLight : t.useDark" :title="theme === 'dark' ? t.useLight : t.useDark" @click="toggleTheme">
        <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" />
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
          <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />
        </svg>
      </button>
      <button type="button" class="share" :aria-label="shared ? t.linkCopied : t.share" @click="emit('share')">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-if="shared" d="M3.5 8.5l3 3 6-7" />
          <template v-else>
            <path d="M6.6 9.4a3 3 0 0 0 4.24 0l2.12-2.12a3 3 0 0 0-4.24-4.24l-.7.7" />
            <path d="M9.4 6.6a3 3 0 0 0-4.24 0L3.04 8.72a3 3 0 0 0 4.24 4.24l.7-.7" />
          </template>
        </svg>
        <span class="share-text">{{ shared ? t.linkCopied : t.share }}</span>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 60px;
  padding: 0 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mark {
  display: grid;
  flex: none;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--mark);
  box-shadow:
    inset 0 0 0 1px var(--mark-ring),
    0 6px 14px -8px rgba(10, 10, 11, 0.6);
}

.brand-name {
  overflow: hidden;
  font-size: 15px;
  font-weight: 620;
  letter-spacing: -0.02em;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.version {
  flex: none;
  height: 22px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 20px;
  color: var(--muted);
  text-decoration: none;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.version:hover {
  border-color: var(--line-strong);
  color: var(--ink);
}

.section {
  flex: none;
  padding-left: 12px;
  border-left: 1px solid var(--line);
  font-size: 14px;
  color: var(--muted);
}

.nav {
  display: flex;
  flex: none;
  align-items: center;
  gap: 4px;
}

.nav-link {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  line-height: 32px;
  color: var(--ink-2);
  text-decoration: none;
  transition:
    color 0.15s,
    background-color 0.15s;
}

.nav-link:hover,
.icon-button:hover {
  background: var(--hover);
  color: var(--ink);
}

.icon-button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--ink-2);
  transition:
    color 0.15s,
    background-color 0.15s;
}

.nav-divider {
  width: 1px;
  height: 18px;
  margin: 0 6px;
  background: var(--line);
}

.share {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  margin-left: 6px;
  padding: 0 14px;
  border-radius: 9px;
  background: var(--button);
  color: var(--button-text);
  font-size: 13px;
  font-weight: 600;
  box-shadow:
    0 1px 2px rgba(10, 10, 11, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: opacity 0.15s;
}

.share:hover {
  opacity: 0.88;
}

@media (max-width: 900px) {
  .section {
    display: none;
  }
}

@media (max-width: 640px) {
  .header {
    gap: 10px;
    padding: 0 12px;
  }

  .version,
  .site,
  .nav-divider,
  a.nav-link {
    display: none;
  }

  .share {
    margin-left: 2px;
    padding: 0 10px;
  }

  .share-text {
    display: none;
  }
}
</style>
