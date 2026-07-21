/** @internal the dispatcher's handler table — built-ins land here at boot, before any extension module evaluates. */
export const handlers = Object.create(null);
/**
 * Attach the client handler for a verb. Returning `true` consumes the event
 * (halts the dispatch walk, ADR-04); returning nothing defers to the verb
 * spec's `consume` default. Duplicate registration throws — built-ins are
 * non-overridable (they register first at boot).
 */
export function defineBehavior(name, handler) {
    if (handlers[name])
        throw new Error(`defineBehavior: duplicate "${name}"`);
    handlers[name] = handler;
}
//# sourceMappingURL=define.js.map