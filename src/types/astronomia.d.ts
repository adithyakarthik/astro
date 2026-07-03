// `astronomia` ships no TypeScript types. We only use a handful of its
// submodules and access them dynamically, so a permissive ambient
// declaration is enough rather than hand-writing full types for the library.
declare module "astronomia/*";
