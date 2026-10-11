/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<object, object, any>;
  export default component;
}

// The version of postcss-px-conversion, from the package.json at the root of the repository
declare const __PLUGIN_VERSION__: string;
