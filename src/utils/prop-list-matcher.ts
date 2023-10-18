type PropFilterFunction = (list: string[]) => string[];

const filterPropertiesList: Record<string, PropFilterFunction> = {
  exact: list => list.filter(m => m.match(/^[^*!]+$/) !== null),
  contain: list =>
    list
      .filter(m => m.match(/^\*.+\*$/) !== null)
      .map(m => m.slice(1, m.length - 1)),
  endWith: list =>
    list
      .filter(m => m.match(/^\*[^*]+$/) !== null)
      .map(m => m.slice(1)),
  startWith: list =>
    list
      .filter(m => m.match(/^[^*!]+\*$/) !== null)
      .map(m => m.slice(0, m.length - 1)),
  notExact: list =>
    list
      .filter(m => m.match(/^![^*].*$/) !== null)
      .map(m => m.slice(1)),
  notContain: list =>
    list
      .filter(m => m.match(/^!\*.+\*$/) !== null)
      .map(m => m.slice(2, m.length - 2)),
  notEndWith: list =>
    list
      .filter(m => m.match(/^!\*[^*]+$/) !== null)
      .map(m => m.slice(2)),
  notStartWith: list =>
    list
      .filter(m => m.match(/^![^*]+\*$/) !== null)
      .map(m => m.slice(1, m.length - 2)),
};

const createPropertiesListMatcher = (propList: string[]): ((prop: string) => boolean) => {
  const hasWild = propList.includes("*");
  const matchAll = hasWild && propList.length === 1;

  const lists = {
    exact: filterPropertiesList.exact(propList),
    contain: filterPropertiesList.contain(propList),
    startWith: filterPropertiesList.startWith(propList),
    endWith: filterPropertiesList.endWith(propList),
    notExact: filterPropertiesList.notExact(propList),
    notContain: filterPropertiesList.notContain(propList),
    notStartWith: filterPropertiesList.notStartWith(propList),
    notEndWith: filterPropertiesList.notEndWith(propList),
  };

  return (prop: string) => {
    if (matchAll) {
      return true;
    }
    return (
      (hasWild
            || lists.exact.includes(prop)
            || lists.contain.some(m => prop.includes(m))
            || lists.startWith.some(m => prop.indexOf(m) === 0)
            || lists.endWith.some(m => prop.indexOf(m) === prop.length - m.length))
        && !(
          lists.notExact.includes(prop)
            || lists.notContain.some(m => prop.includes(m))
            || lists.notStartWith.some(m => prop.indexOf(m) === 0)
            || lists.notEndWith.some(m => prop.indexOf(m) === prop.length - m.length)
        )
    );
  };
};

export { filterPropertiesList, createPropertiesListMatcher };
