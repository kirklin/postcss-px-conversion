import type { AtRule, Plugin, Root } from "postcss";
import type { Options } from "./types";
import {
  createPropertiesListMatcher,
  createUnitReplaceFunction,
  doesDeclarationExist,
  getUnitFromOptions,
  getUnitRegexp,
  isBlacklistedSelector,
  shouldExclude,
  validateMediaQueryParams,
} from "./utils";
import { DEFAULT_OPTIONS, IGNORE_NEXT_COMMENT, IGNORE_PREV_COMMENT, PLUGIN_NAME } from "./constants";

export const plugin = (customOptions: Partial<Options> = {}): Plugin => {
  const options: Options = { ...DEFAULT_OPTIONS, ...customOptions };
  const unitRegexp = getUnitRegexp(options.unitType);
  const isAllowedProperty = createPropertiesListMatcher(options.allowedProperties);
  const landscapeAtRules: AtRule[] = [];

  return {
    postcssPlugin: PLUGIN_NAME,

    Once(css: Root, { result }) {
      css.walkRules((rule) => {
        const sourceFile = rule.source?.input.file || "";

        if (shouldExclude(options, sourceFile) || isBlacklistedSelector(rule.selector, options.selectorBlacklist)) {
          return undefined;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // 如果启用了横向（landscape）支持并且规则没有参数
        if (options.enableLandscape && !rule.parent?.params) {
          const landscapeRule = rule.clone().removeAll();

          rule.walkDecls((declaration) => {
            if (!declaration.value.includes(options.unitType) || !isAllowedProperty(declaration.prop)) {
              return;
            }
            let landscapeSize;

            if (typeof options.landscapeViewportWidth === "function") {
              const num = options.landscapeViewportWidth(sourceFile);
              if (!num) {
                return;
              }
              landscapeSize = num;
            } else {
              landscapeSize = options.landscapeViewportWidth;
            }

            landscapeRule.append(
              declaration.clone({
                value: declaration.value.replace(
                  unitRegexp,
                  createUnitReplaceFunction(options, options.landscapeUnit, landscapeSize),
                ),
              }),
            );
          });

          // 如果横向规则不为空，将其添加到landscapeRules数组中
          if (landscapeRule.nodes.length > 0) {
            landscapeAtRules.push(landscapeRule as unknown as AtRule);
          }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // 如果不满足媒体查询参数的验证条件，跳过
        if (!validateMediaQueryParams(rule.parent?.params, options.allowMediaQuery)) {
          return;
        }

        rule.walkDecls((declaration, index) => {
          if (!declaration.value.includes(options.unitType) || !isAllowedProperty(declaration.prop)) {
            return;
          }

          const prevComment = declaration.prev();
          if (prevComment && prevComment.type === "comment" && prevComment.text === IGNORE_NEXT_COMMENT) {
            prevComment.remove();
            return;
          }

          const nextComment = declaration.next();
          if (nextComment && nextComment.type === "comment" && nextComment.text === IGNORE_PREV_COMMENT) {
            if (/\n/.test(nextComment.raws.before!)) {
              result.warn(
                  `Unexpected comment /* ${IGNORE_PREV_COMMENT} */ must be after declaration at the same line.`,
                  { node: nextComment },
              );
            } else {
              nextComment.remove();
              return;
            }
          }

          let targetUnit;
          let targetSize;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          const parentParams = rule.parent?.params;

          if (options.enableLandscape && parentParams && parentParams.includes("landscape")) {
            targetUnit = options.landscapeUnit;

            if (typeof options.landscapeViewportWidth === "function") {
              const num = options.landscapeViewportWidth(sourceFile);
              if (!num) {
                return;
              }
              targetSize = num;
            } else {
              targetSize = options.landscapeViewportWidth;
            }
          } else {
            targetUnit = getUnitFromOptions(declaration.prop, options);
            if (typeof options.viewportWidth === "function") {
              const num = options.viewportWidth(sourceFile);
              if (!num) {
                return;
              }
              targetSize = num;
            } else {
              targetSize = options.viewportWidth;
            }
          }

          const modifiedValue = declaration.value.replace(unitRegexp, createUnitReplaceFunction(options, targetUnit!, targetSize));

          if (doesDeclarationExist(declaration.parent, declaration.prop, modifiedValue)) {
            return;
          }

          if (options.replaceRules) {
            declaration.value = modifiedValue;
          } else {
            declaration.parent?.insertAfter(index, declaration.clone({ value: modifiedValue }));
          }
        });
      });
    },

    OnceExit(css: Root, { AtRule }) {
      if (landscapeAtRules.length > 0) {
        const landscapeMediaRule = new AtRule({
          params: "(orientation: landscape)",
          name: "media",
        });

        landscapeAtRules.forEach((landscapeRule) => {
          landscapeMediaRule.append(landscapeRule);
        });
        css.append(landscapeMediaRule);
      }
    },
  };
};
