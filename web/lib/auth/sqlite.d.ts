// Minimal typings for node:sqlite (built-in since Node 22.5).
// Kept local so @types/node doesn't need a major bump for one import.
declare module "node:sqlite" {
  export class StatementSync {
    get(...params: unknown[]): Record<string, unknown> | undefined;
    run(...params: unknown[]): { changes: number | bigint };
  }
  export class DatabaseSync {
    constructor(path?: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
