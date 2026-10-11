<script setup lang="ts">
import { useTemplateRef, watch } from "vue";

const props = defineProps<{
  html: string;
  css: string;
  width: number;
  height: number;
  scale: number;
  title: string;
}>();

// Browser defaults the examples rely on. `view` is the block element of WeChat Mini Programs.
// They sit in a cascade layer so that every rule of the example wins over them, rules in @layer included.
const BASE_CSS = `@layer preview{
*,::before,::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;scrollbar-width:none}
html::-webkit-scrollbar{display:none}
body{min-height:100vh;color:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;line-height:1.4;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;border:0;background:none}
ul{list-style:none}
view{display:block}
}`;

// The frame allows no scripts. Being same-origin lets the page update its content without reloading the frame.
const SKELETON = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style><style id="page"></style></head><body></body></html>`;

const frame = useTemplateRef<HTMLIFrameElement>("frame");

function render() {
  const document = frame.value?.contentDocument;
  const style = document?.getElementById("page");
  if (!document || !style) {
    return;
  }
  style.textContent = props.css;
  document.body.innerHTML = props.html;
}

watch(() => [props.css, props.html], render);
</script>

<template>
  <div class="device" :style="{ width: `${width * scale}px`, height: `${height * scale}px` }">
    <iframe
      ref="frame"
      :title="title"
      sandbox="allow-same-origin"
      :srcdoc="SKELETON"
      :style="{ width: `${width}px`, height: `${height}px`, transform: `scale(${scale})` }"
      @load="render"
    />
  </div>
</template>

<style scoped>
.device {
  flex: none;
  overflow: hidden;
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--shadow-device);
}

iframe {
  display: block;
  border: 0;
  background: #fff;
  transform-origin: 0 0;
}
</style>
