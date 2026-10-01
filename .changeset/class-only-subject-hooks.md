---
'@jperezmart/nest-casl': minor
---

**Breaking.** A subject hook is a class only. The tuple form `[Hook, args]` is removed.

The guard always dropped the tuple's `args`, so a hook written that way never saw its argument. Passing a tuple to `@UseAbility`, or to a decorator built with `createUseAbility`, is now a type error.

- `SubjectBeforeFilterTuple` is no longer exported.
- `UseAbilityMetadata['subjectHook']` is `Type<SubjectBeforeFilterHook>`.

Migrating: for a parametrised hook, write a class factory, call it once, and register the result as a provider. The core README shows how.

```diff
- @UseAbility('read', 'Article', [ArticleHook, 'slug'])
+ @UseAbility('read', 'Article', ArticleBySlugHook)
```

where `ArticleBySlugHook = ArticleHookBy('slug')`, built once by a class factory and listed in `providers`.
