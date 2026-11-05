# Return the cup to its initial pose

User asks to restore the original orientation after rotating the cup.

After manual wheel input or completion of drag, wait1100ms of inactivity, then return over800ms using smoothstep and shortest-path quaternion slerp to the exact authored base pose. New wheel/drag/keyboard input interrupts from the current pose without a jump. Existing idle auto can resume afterward when the object is not hovered/focused; it is suppressed during the wait and return. Keyboard-selected poses remain under direct keyboard control.

One existing RAF handles motion; one cancellable timer owns the idle delay. Reduced motion resets after the delay without tweening. Hidden/inert/modal/pagehide boundaries cancel work and park any pending or live dragged pose at home. Cancel/lost capture return a changed pose without adding inertia. Return start/finish keeps controller counters and orientation counters synchronized.

Verification:37 full Node tests PASS; Go tests/vet, focused Oxlint and build PASS. Real-Three test covers slerp midpoint, exact finish, interruption and continuation. Controller tests cover repeated input, timer cancellation, reduced motion, live-drag→inert, pointercancel and all prior lifecycle/gesture regressions. Independent read-only review APPROVE,13 product tests repeated PASS.

Actual Go browser: turned side with keyboard then dragged diagonally; observed data-returning become present and disappear, with cup restored to initial front/tilt. Repeated after native wheel; scrollY3064.5 unchanged, home restored and no console warnings/errors. Screenshot:return-home.png. Go8096 restarted and retained. No physical touch device used in this pass; touch cancellation is covered by controller tests.
