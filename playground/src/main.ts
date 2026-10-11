import type { LinkProblem, PlaygroundState } from "~/lib/share";
import { createApp } from "vue";

import App from "~/App.vue";
import { EXAMPLES } from "~/lib/examples";
import { decodeState, LinkError, SHARE_PREFIX, stateFromExample } from "~/lib/share";

import "@fontsource-variable/geist";
import "@kirklin/reset-css/kirklin.css";
import "~/styles/main.css";

async function initialProps(): Promise<{ initial: PlaygroundState; linkProblem?: LinkProblem }> {
  if (!location.hash.startsWith(SHARE_PREFIX)) {
    return { initial: stateFromExample(EXAMPLES[0]) };
  }
  try {
    return { initial: await decodeState(location.hash.slice(SHARE_PREFIX.length)) };
  } catch (error) {
    if (!(error instanceof LinkError)) {
      throw error;
    }
    // A broken link still opens the playground, with the reason shown above the editors
    return { initial: stateFromExample(EXAMPLES[0]), linkProblem: error.problem };
  }
}

initialProps().then((props) => {
  createApp(App, props).mount("#app");
});
