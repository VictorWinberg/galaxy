export function objContains(parent: any, child: any): boolean {
  return Object.keys(parent).every((ele) => {
    if (typeof parent[ele] == "object") {
      return objContains(child[ele], parent[ele]);
    }
    return parent[ele] === child[ele];
  });
}
