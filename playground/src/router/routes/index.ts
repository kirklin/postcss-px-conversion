import { PageConstant } from "~/constant/pageConstant";
import layout from "~/router/routes/layout";

// 根路由
export const RootRoute = {
  path: "/",
  name: "Root",
  redirect: PageConstant.BASE_LOGIN,
  meta: {
    title: "Root",
  },
};

export const LoginRoute = {
  path: "/login",
  name: "Login",
  component: () => import("~/pages/login/index.vue"),
  meta: {
    title: "登录",
  },
};

// Basic routing without permission
// 无需认证的基本路由
export const basicRoutes = [
  RootRoute,
  LoginRoute,
  layout,
];
