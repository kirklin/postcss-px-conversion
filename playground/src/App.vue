<template>
  <div class="container">
    <h1 class="title">Pixel to Viewport Unit Converter Demo</h1>
    <div class="bento-grid">
      <div class="bento-item normal-px">
        <h3>Normal Pixels</h3>
        <p>Width: 200px</p>
        <p>Height: 100px</p>
        <p>Font: 16px</p>
      </div>
      <div class="bento-item small-px">
        <h3>Small Pixels</h3>
        <p>Border: 1px</p>
        <p>Shadow: 0 1px 2px</p>
      </div>
      <div class="bento-item transform">
        <h3>Transform</h3>
        <div class="transform-box"></div>
      </div>
      <div class="bento-item animated">
        <h3>Animation</h3>
        <div class="animate-box"></div>
      </div>
      <div class="bento-item responsive">
        <h3>Responsive</h3>
        <p>Resizes at 768px</p>
      </div>
      <div class="bento-item mixed-units">
        <h3>Mixed Units</h3>
        <p>Margin: 10px 5% 20px 2em</p>
        <p>Padding: 15px 10vw</p>
      </div>
      <div class="bento-item complex-values">
        <h3>Complex Values</h3>
        <div class="complex-box"></div>
      </div>
      <div class="bento-item custom-property">
        <h3>Custom Property</h3>
        <p>Width: var(--custom-width)</p>
      </div>
      <div class="bento-item ignore-conversion">
        <h3>Ignored Conversion</h3>
        <p>Width: 150px (not converted)</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* viewport-width: 375 */

:root {
  --custom-width: 100px;
}

.container {
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f0f0f0;
}

.title {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
  font-size: 36px;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.bento-item {
  cursor: grab;
  select-none: none;
  overflow: hidden;
  border-radius: 24px;
  background-color: white;
  padding: 20px;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.bento-item:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.bento-item:active {
  cursor: grabbing;
}

.bento-item h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 20px;
}

.bento-item p {
  color: #666;
  margin-bottom: 10px;
}

.normal-px {
  width: 200px;
  height: 100px;
  font-size: 16px;
}

.small-px {
  border: 1px solid black;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.transform .transform-box {
  width: 100px;
  height: 100px;
  background-color: #3498db;
  transform: rotate(45deg);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.animated .animate-box {
  width: 100px;
  height: 100px;
  background-color: #e74c3c;
  animation: pulse 2s infinite;
}

@media (min-width: 768px) {
  .responsive {
    font-size: 18px;
    padding: 30px;
  }
}

.mixed-units {
  margin: 10px 5% 20px 2em;
  padding: 15px 10vw;
}

.complex-values .complex-box {
  width: 150px;
  height: 150px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0) 100px);
  clip-path: polygon(0px 0px, 100px 0px, 50px 100px);
}

.custom-property {
  width: var(--custom-width);
}

.ignore-conversion {
  /* px-conversion-ignore-next */
  width: 150px;
}

@media (prefers-color-scheme: dark) {
  .container {
    background-color: #0d1117;
  }

  .bento-item {
    background-color: #1f2937;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  .bento-item:hover {
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4);
  }

  .bento-item h3 {
    color: #e5e7eb;
  }

  .bento-item p {
    color: #9ca3af;
  }

  .title {
    color: #e5e7eb;
  }
}
</style>
