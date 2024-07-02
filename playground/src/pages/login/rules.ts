import type { FieldRule } from "vant";

/**
 * 手机号校验规则
 */
const mobileRules: FieldRule[] = [
  { required: true, message: "请输入手机号" },
  { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确，必须为11位数字，且以1开头" },
];

/**
 * 密码校验规则
 */
const passwordRules: FieldRule[] = [
  { required: true, message: "请输入密码" },
  {
    pattern: /^\w{8,24}$/,
    message: "密码必须是8-24个字符，支持字母、数字和下划线",
  },
];

/**
 * 短信验证码校验规则
 */
const codeRules: FieldRule[] = [
  { required: true, message: "请输入短信验证码" },
  { pattern: /^\d{6}$/, message: "验证码必须是6个数字" },
];

/**
 * 真实姓名校验规则
 */
const nameRules: FieldRule[] = [
  { required: true, message: "请输入真实姓名" },
  { pattern: /^[\u4E00-\u9FA5·]{2,16}$/, message: "姓名必须为2-16个中文字符，可包含中间点" },
];

/**
 * 身份证号校验规则
 */
const idCardRules: FieldRule[] = [
  { required: true, message: "请输入身份证号" },
  {
    pattern:
        /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[12]\d|30|31)\d{3}[\dX]$/i,
    message: "身份证号格式不正确，请输入合法的身份证号码",
  },
];

export { mobileRules, passwordRules, codeRules, nameRules, idCardRules };
