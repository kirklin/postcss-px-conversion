import {
  type FormInstance,
  showToast,
} from "vant";
import type { Ref } from "vue";
import { onUnmounted, ref } from "vue";

/**
 * Custom Vue Composition API for sending a mobile verification code.
 *
 * @param mobileRef - Ref for the mobile number to which the code will be sent.
 * @param codeType - The type of code (e.g., 'login', 'register', etc.).
 * @param sendCodeFn - The function responsible for sending the mobile code.
 * @returns An object containing functions and data related to sending mobile codes.
 */
export const useMobileCode = (mobileRef: Ref<string>, codeType = "login", sendCodeFn: (mobile: string, codeType: string) => Promise<void>) => {
  // Initialize the countdown timer value and the form reference.
  const countdownValue = ref(0);
  const formRef = ref<FormInstance>();
  let countdownTimer: number;

  /**
   * Sends a mobile verification code and starts a countdown timer.
   */
  const sendMobileCode = async () => {
    // Check if the countdown timer is already running.
    if (countdownValue.value > 0) {
      return;
    }

    // Validate the mobile number using the form instance (if available).
    await formRef.value?.validate("mobile");

    // Send the mobile code using the provided function.
    await sendCodeFn(toValue(mobileRef), codeType);

    // Show a success message.
    showToast("验证码发送成功");

    // Initialize the countdown timer.
    countdownValue.value = 60;

    // Start the countdown timer.
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    countdownTimer = window.setInterval(() => {
      countdownValue.value--;
      if (countdownValue.value <= 0) {
        clearInterval(countdownTimer);
      }
    }, 1000);
  };

  // Cleanup the countdown timer when the component is unmounted.
  onUnmounted(() => {
    clearInterval(countdownTimer);
  });

  // Return the functions and data.
  return { sendMobileCode, countdownValue, formRef };
};
