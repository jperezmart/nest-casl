---
'@jperezmart/nest-casl-testing': patch
---

Add the missing `repository` field (with `directory: packages/testing`) to the
package manifest. npm requires it to link a published tarball back to its source
commit, so `0.1.0` shipped without a provenance attestation even though the
release workflow already publishes via OIDC trusted publishing. The next publish
carries provenance.
