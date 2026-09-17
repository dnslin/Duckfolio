# AGENTS.md

## Architecture Design

- Do not preserve backward compatibility by default. Remove obsolete code paths instead of adding compatibility layers, fallback logic, or migration mechanisms.

- Choose the simplest implementation that fully satisfies the current requirements. Avoid introducing abstractions, configuration, or indirection for hypothetical future needs.

- Grow the system incrementally. Start with the smallest end-to-end working version, and add new capabilities on top of an already functioning product. Do not sacrifice a working implementation for an unfinished complex architecture.

- Keep components modular and responsibilities clearly separated.

- Prefer mature and actively maintained libraries when they reduce overall complexity or improve reliability. Do not reimplement common functionality without a clear reason.

- Before implementing something yourself or introducing a new dependency, first make full use of the dependencies already present in the project. Do not assume an existing library lacks a capability before checking its documentation and type definitions.

- Make architectural decisions with a long-term perspective. Do not accept temporary solutions that are expected to be replaced later.

- Before designing a solution, study how mature products solve the same problem. Prefer proven patterns and conventions over inventing new ones from scratch.

## Working Method

- Before modifying code, read the relevant implementation, tests, type definitions, configuration, and call paths. Do not start implementing based only on filenames, isolated code fragments, or assumptions.

- Follow the project's existing directory structure, naming conventions, error handling, and testing patterns whenever possible. Introduce new conventions only when the existing ones cannot satisfy the requirements.

- Modify only the code necessary to complete the current task. Do not refactor unrelated modules, rename unrelated symbols, reformat unrelated code, or fix issues outside the requested scope.

- If you discover issues outside the current task, explain the problem and its impact, but do not modify them without approval.

- When requirements are ambiguous, first determine whether the ambiguity affects external behavior, data structures, public interfaces, or architectural boundaries. If it has significant impact, ask the user before proceeding. Otherwise, make the smallest reasonable assumption and state it explicitly.

## Verification

- Whenever behavior changes, add or update tests that verify the new behavior. Prefer testing externally observable behavior rather than relying on implementation details.

- After completing the changes, run the tests, type checks, static analysis, and build commands directly related to the modification.

- Never claim that tests passed, the build succeeded, or an issue has been fixed unless the relevant verification commands have actually been executed.

- When reporting results, list the commands that were actually run, their outcomes, and any parts that remain unverified.

- Simplicity must not come at the cost of correctness, security, testability, or explicitly required runtime behavior.

- Do not swallow errors or hide failures through silent fallbacks. Errors should retain enough context to make diagnosis possible.

- Do not make checks pass by hardcoding test data, skipping validation, weakening assertions, or removing failing tests.

## Communication Style

When explaining work to the user:

- Use natural and direct Chinese by default.

- State the conclusion first, then explain the reasoning and details.

- Do not explain one abstract concept with another abstract concept.

- Each sentence should express only one primary point whenever possible.

- Each paragraph should serve a single purpose.

- When introducing a technical term for the first time, immediately explain it in plain Chinese.

- Whenever possible, explain using concrete files, commands, data flow, or operational examples instead of theory alone.

- Do not repeat context merely to appear comprehensive.

- Do not expand the user's question beyond its intended scope.

- When the workflow is complex, clearly explain:

  1. The current step.

  2. Why this step is necessary.

  3. The result this step will produce.

  4. What the user should do next.

- Unless explicitly requested, avoid overly academic language, marketing language, or translation-style wording.

## Engineering Safety Boundaries

- Prefer the simplest design that correctly solves the real problem.

- Do not introduce additional security, safety, validation, locking, privilege separation, signing, pinning, or defensive abstractions unless there is a concrete threat model or a real system boundary that requires them.

- Do not treat normal operational states as unsafe. A missing file may simply mean the system has not been initialized. A stale file does not imply that a process is still running. `unknown` is not automatically an error. A symlink containing `..` is not automatically a path traversal.

- Trust controlled internal components according to their actual trust boundary. Do not repeatedly re-validate successful internal operations or discard useful internal output as untrusted without a concrete reason.

- Preserve observability. Do not hide paths, URLs, logs, or diagnostic information unless they contain actual sensitive information.

- For installation, deployment, migration, and similar workflows, prefer idempotent operations, short recoverable steps, and correct handling of interruption or cancellation. Do not default to large transactions or fail-closed state machines.

- Do not make artifact identity depend on incidental build paths or temporary execution state. Avoid redundant seals, pins, hashes, copies, or provenance mechanisms that do not defend against a concrete attacker.

- Use subagents where useful, but coordinate them according to actual modification boundaries instead of locking the entire repository.

- When reviewing an existing design, actively remove complexity that exists only because the previous implementation attempted to be “extra safe.”

- Before adding any defensive mechanism, ask: **What concrete failure does this prevent, or which attacker does it defend against?** If there is no concrete answer, do not add it.
