# No field restrictions derived from the request body

The guard does not flatten `request.body` and deny the request when any key is a field the user may not touch, as the older `nest-casl` package does. Which fields a request may change is a decision the handler makes against its validated input; inferring it from whatever keys the raw body happens to carry is implicit, runs before validation, and turns a harmless extra key into a 403. Consumers who want field-level checks call `ability.can(action, subject, field)` themselves, where the field list is theirs.
