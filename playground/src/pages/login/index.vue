<script setup lang="ts">
import { showSuccessToast, showToast } from "vant";
import { ref, shallowReactive, toRef } from "vue";
import { useRouter } from "vue-router";
import NavBar from "~/layouts/Navbar/index.vue";
import { codeRules, mobileRules, passwordRules } from "~/pages/login/rules";

const router = useRouter();

// 数据和状态
const loginFormData = shallowReactive({
  mobile: "15911112222",
  password: "abc123456",
  agree: false,
  showPassword: false,
});
// 切换密码登录和短信验证码登录
const isPasswordLogin = ref(true);
const smsCode = ref("");

const handleLogin = async () => {
  if (!loginFormData.agree) {
    return showToast("请勾选协议");
  }
  showSuccessToast("登录成功");
  await router.replace("/home");
};

// 发送短信验证码
const { sendMobileCode, countdownValue, formRef } = useMobileCode(
  toRef(loginFormData.mobile),
  "login",
  async () => {},
);
</script>

<template>
  <div class="login-module-page">
    <NavBar right-text="注册" @click-right="$router.push('/register')" />
    <!-- 头部 -->
    <div class="login-module-header">
      <h3 class="login-module-header title">
        {{ isPasswordLogin ? '密码登录' : '短信验证码登录' }}
      </h3>
      <a class="login-module-header link" href="javascript:">
        <span @click="isPasswordLogin = !isPasswordLogin">
          {{ isPasswordLogin ? '短信验证码登录' : '密码登录' }}
        </span>
        <VanIcon name="arrow" />
      </a>
    </div>
    <!-- 表单 -->
    <VanForm ref="formRef" autocomplete="off" @submit="handleLogin">
      <VanField
        v-model="loginFormData.mobile"
        name="mobile"
        :rules="mobileRules"
        placeholder="请输入手机号"
        type="tel"
      />
      <VanField
        v-if="isPasswordLogin"
        v-model="loginFormData.password"
        :rules="passwordRules"
        placeholder="请输入密码"
        :type="loginFormData.showPassword ? 'text' : 'password'"
      >
        <template #button />
      </VanField>
      <VanField
        v-else
        v-model="smsCode"
        :rules="codeRules"
        placeholder="短信验证码"
      >
        <template #button>
          <span class="send-button" :class="{ active: countdownValue > 0 }" @click="sendMobileCode">
            {{ countdownValue > 0 ? `${countdownValue}s后再次发送` : '发送验证码' }}
          </span>
        </template>
      </VanField>
      <div class="custom-cell">
        <VanCheckbox v-model="loginFormData.agree">
          <span>我已同意</span>
          <a href="javascript:">用户协议</a>
          <span>及</span>
          <a href="javascript:">隐私条款</a>
        </VanCheckbox>
      </div>
      <div class="custom-cell">
        <VanButton native-type="submit" block round type="primary">
          登 录
        </VanButton>
      </div>
      <div class="custom-cell">
        <a href="javascript:">忘记密码？</a>
      </div>
    </VanForm>
  </div>
</template>

<style lang="scss" scoped>
@import './index.scss';
</style>
