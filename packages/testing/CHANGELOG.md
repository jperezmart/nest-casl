# @jperezmart/nest-casl-testing

## 0.1.2

### Patch Changes

- [#7](https://github.com/jperezmart/nest-casl/pull/7) [`6f2f8e7`](https://github.com/jperezmart/nest-casl/commit/6f2f8e70a031bc00d8d1c9b1e0e9b43079387868) Thanks [@jperezmart](https://github.com/jperezmart)! - Add a README. The package shipped with none, so its npm page was blank — `npm view @jperezmart/nest-casl-testing readme` returned "No README data found!" despite `files` declaring one. Documents `buildAbilityForTest` and both of its options, with npm version and license badges.

## 0.1.1

### Patch Changes

- fc4c2a6: Add the missing `repository` field (with `directory: packages/testing`) to the
  package manifest. npm requires it to link a published tarball back to its source
  commit, so `0.1.0` shipped without a provenance attestation even though the
  release workflow already publishes via OIDC trusted publishing. The next publish
  carries provenance.
