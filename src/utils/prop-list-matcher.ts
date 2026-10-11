type PropFilterFunction = (list: string[]) => string[];

function createRegexFilter(regex: RegExp, sliceStart: number, sliceEnd?: number): PropFilterFunction {
  return list => list.filter(m => regex.test(m)).map(m => m.slice(sliceStart, sliceEnd));
}

const filterPropertiesList: Record<string, PropFilterFunction> = {
  exact: list => list.filter(m => /^[^*!]+$/.test(m)),
  contain: createRegexFilter(/^\*.+\*$/, 1, -1),
  endWith: createRegexFilter(/^\*[^*]+$/, 1),
  startWith: createRegexFilter(/^[^*!]+\*$/, 0, -1),
  notExact: createRegexFilter(/^![^*].*$/, 1),
  notContain: createRegexFilter(/^!\*.+\*$/, 2, -1),
  notEndWith: createRegexFilter(/^!\*[^*]+$/, 2),
  notStartWith: createRegexFilter(/^![^*]+\*$/, 1, -1),
};

function createPropertiesListMatcher(propList: string[]): (prop: string) => boolean {
  const hasWild = propList.includes("*");
  const matchAll = hasWild && propList.length === 1;

  const lists = Object.fromEntries(
    Object.entries(filterPropertiesList).map(([key, filter]) => [key, filter(propList)]),
  );

  return (prop: string) => {
    if (matchAll) {
      return true;
    }

    // Custom properties are case-sensitive, standard ones are not.
    const name = prop.startsWith("--") ? prop : prop.toLowerCase();

    const isIncluded = hasWild
      || lists.exact.includes(name)
      || lists.contain.some(m => name.includes(m))
      || lists.startWith.some(m => name.startsWith(m))
      || lists.endWith.some(m => name.endsWith(m));

    const isExcluded = lists.notExact.includes(name)
      || lists.notContain.some(m => name.includes(m))
      || lists.notStartWith.some(m => name.startsWith(m))
      || lists.notEndWith.some(m => name.endsWith(m));

    return isIncluded && !isExcluded;
  };
}

export { createPropertiesListMatcher, filterPropertiesList };
