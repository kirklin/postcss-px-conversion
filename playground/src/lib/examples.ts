import type { PlaygroundOptions } from "./options";

export interface Example {
  id: string;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  file: string;
  css: string;
  html: string;
  options: Partial<PlaygroundOptions>;
}

const mobilePage: Example = {
  id: "mobile",
  title: { en: "Mobile page", zh: "手机页面" },
  description: {
    en: "A 375px wide design converted to vw, so the whole page scales with the screen.",
    zh: "375 宽的设计稿转换成 vw，整个页面随屏幕宽度等比缩放。",
  },
  file: "src/pages/today.css",
  options: {},
  css: `.screen {
  min-height: 100vh;
  padding: 0 20px 32px;
  background: #f7f7f8;
  color: #0a0a0b;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.bar-title {
  font-size: 17px;
  font-weight: 600;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #93c5fd, #1d4ed8);
}

.greeting {
  margin: 8px 0 20px;
  font-size: 28px;
  line-height: 34px;
  font-weight: 650;
}

.card {
  padding: 16px;
  border: 1px solid #e4e4e7;
  border-radius: 20px;
  background: #fff;
}

.card-art {
  height: 140px;
  border-radius: 14px;
  background: linear-gradient(135deg, #cfe2ff, #e4f3ff);
}

.card-title {
  margin-top: 14px;
  font-size: 18px;
}

.card-text {
  margin-top: 4px;
  font-size: 14px;
  line-height: 20px;
  color: #71717a;
}

.card-button {
  width: 100%;
  height: 44px;
  margin-top: 16px;
  border-radius: 12px;
  background: #0a0a0b;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.list {
  margin-top: 12px;
}

.row {
  display: flex;
  align-items: center;
  height: 52px;
  border-bottom: 1px solid #e4e4e7;
  font-size: 15px;
}

.row time {
  margin-left: auto;
  font-size: 13px;
  color: #71717a;
}
`,
  html: `<main class="screen">
  <header class="bar">
    <span class="bar-title">Today</span>
    <span class="avatar"></span>
  </header>
  <h1 class="greeting">Good morning, Kirk</h1>
  <article class="card">
    <div class="card-art"></div>
    <h2 class="card-title">Morning run</h2>
    <p class="card-text">5.2 km along the river in 28 minutes.</p>
    <button class="card-button">View route</button>
  </article>
  <ul class="list">
    <li class="row">Design review <time>10:00</time></li>
    <li class="row">Lunch with the team <time>12:30</time></li>
    <li class="row">Ship the release <time>16:00</time></li>
  </ul>
</main>
`,
};

const mediaQueries: Example = {
  id: "media-queries",
  title: { en: "Media queries", zh: "媒体查询" },
  description: {
    en: "With allowMediaQuery, the rules inside @media are converted too. Turn it off to compare.",
    zh: "开启 allowMediaQuery 后，@media 里的规则也会转换，可以关掉对比。",
  },
  file: "src/pages/gallery.css",
  options: { allowMediaQuery: true },
  css: `.gallery {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.tile {
  height: 120px;
  padding: 12px 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 600;
}

@media (min-width: 600px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 24px;
  }

  .tile {
    height: 180px;
  }
}
`,
  html: `<div class="gallery">
  <div class="tile">Coast</div>
  <div class="tile">Forest</div>
  <div class="tile">Desert</div>
  <div class="tile">Harbor</div>
</div>
`,
};

const landscape: Example = {
  id: "landscape",
  title: { en: "Landscape", zh: "横屏" },
  description: {
    en: "With enableLandscape, changed declarations are copied into a landscape media query and converted at 568px. The 768 screen is wider than it is tall.",
    zh: "开启 enableLandscape 后，会变化的声明复制到横屏媒体查询里，按 568 宽转换。768 宽的屏幕是横屏。",
  },
  file: "src/pages/player.css",
  options: { enableLandscape: true },
  css: `.player {
  padding: 16px;
}

.video {
  height: 200px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1e293b, #475569);
}

.title {
  margin-top: 14px;
  font-size: 18px;
  font-weight: 600;
}

.meta {
  margin-top: 4px;
  font-size: 13px;
  color: #71717a;
}
`,
  html: `<section class="player">
  <div class="video"></div>
  <h1 class="title">Harbor at night</h1>
  <p class="meta">4 min · Kirk</p>
</section>
`,
};

const widthComment: Example = {
  id: "width-comment",
  title: { en: "Width from a comment", zh: "注释设置宽度" },
  description: {
    en: "A viewport-width comment sets this file's design width to 750, so 750px designs need no other setting.",
    zh: "viewport-width 注释把这个文件的设计稿宽度设成 750，750 宽的设计稿不用再改别的设置。",
  },
  file: "src/pages/profile.css",
  options: {},
  css: `/* viewport-width: 750 */

body {
  background: #f7f7f8;
}

.profile {
  margin: 32px;
  padding: 40px;
  border: 2px solid #e4e4e7;
  border-radius: 40px;
  background: #fff;
}

.profile-avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background: linear-gradient(135deg, #93c5fd, #1d4ed8);
}

.profile-name {
  margin-top: 28px;
  font-size: 40px;
}

.profile-bio {
  margin-top: 8px;
  font-size: 28px;
  line-height: 42px;
  color: #71717a;
}
`,
  html: `<section class="profile">
  <div class="profile-avatar"></div>
  <h1 class="profile-name">Kirk</h1>
  <p class="profile-bio">Writes CSS for small screens and big ones.</p>
</section>
`,
};

const leftAlone: Example = {
  id: "left-alone",
  title: { en: "Values left alone", zh: "保持不变的值" },
  description: {
    en: "Hairline borders, strings, numbers in names, ignore comments and rules in selectorBlacklist stay as they are.",
    zh: "细边框、字符串、名字里的数字、忽略注释和 selectorBlacklist 里的规则都保持不变。",
  },
  file: "src/components/panel.css",
  options: { selectorBlacklist: [".legacy"] },
  css: `:root {
  --space-10px: 10px;
}

.panel {
  width: 320px;
  margin: 24px auto;
  padding: 16px;
  border: 1px solid #e4e4e7;
  border-radius: 16px;
}

.panel::before {
  content: "320px wide";
  font-size: 12px;
  color: #71717a;
}

.panel-title {
  /* px-conversion-ignore-next */
  font-size: 20px;
  margin-top: var(--space-10px);
}

.legacy-note {
  height: 48px;
  margin-top: 12px;
  border-radius: 10px;
  background: #fef3c7;
}
`,
  html: `<section class="panel">
  <h1 class="panel-title">Settings</h1>
  <div class="legacy-note"></div>
</section>
`,
};

const remToPx: Example = {
  id: "rem-to-px",
  title: { en: "rem to px", zh: "rem 转换成 px" },
  description: {
    en: "Turns rem-based styles such as Tailwind CSS into px, so they keep their size on a page whose root font size is 20px.",
    zh: "把 Tailwind CSS 这类 rem 样式转换成 px，在根字号是 20px 的网页里也保持原来的大小。",
  },
  file: "src/content/card.css",
  options: {
    unitType: "rem",
    viewportUnit: "px",
    fontViewportUnit: "px",
    minPixelValue: 0,
    allowMediaQuery: true,
  },
  css: `/* The page that shows this card sets a larger root font size */
html {
  font-size: 20px;
  background: #f4f4f5;
}

@layer utilities {
  .card {
    margin: 1rem;
    padding: 1rem;
    border-radius: 0.75rem;
    background: #fff;
    box-shadow: 0 0.0625rem 0.25rem rgb(0 0 0 / 0.12);
  }

  .card-title {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 600;
  }

  .card-text {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #71717a;
  }

  @media (width >= 40rem) {
    .card {
      padding: 1.5rem;
    }
  }
}
`,
  html: `<article class="card">
  <h1 class="card-title">Saved to your list</h1>
  <p class="card-text">Open the extension to see everything you saved.</p>
</article>
`,
};

const miniProgram: Example = {
  id: "mini-program",
  title: { en: "Mini Program rpx", zh: "小程序 rpx" },
  description: {
    en: "A 375px wide design converted to rpx, where the screen is 750rpx wide.",
    zh: "375 宽的设计稿转换成 rpx，屏幕宽度是 750rpx。",
  },
  file: "pages/goods/index.wxss",
  options: { viewportUnit: "rpx", fontViewportUnit: "rpx" },
  css: `.page {
  padding: 24px 16px;
  background: #f7f7f8;
}

.goods {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
}

.goods-image {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  background: #e4f3ff;
}

.goods-name {
  font-size: 16px;
  line-height: 22px;
}

.goods-price {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
}
`,
  html: `<view class="page">
  <view class="goods">
    <view class="goods-image"></view>
    <view>
      <text class="goods-name">Linen shirt</text>
      <view class="goods-price">¥129</view>
    </view>
  </view>
</view>
`,
};

export const EXAMPLES: readonly Example[] = [mobilePage, mediaQueries, landscape, widthComment, leftAlone, remToPx, miniProgram];

export function exampleById(id: string): Example {
  const example = EXAMPLES.find(item => item.id === id);
  if (!example) {
    throw new Error(`There is no example called "${id}"`);
  }
  return example;
}
