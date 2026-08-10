declare module "pg" {
  export interface QueryResultRow {
    [column: string]: unknown;
  }

  export class Pool {
    constructor(config: { connectionString: string });
    query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      values?: unknown[]
    ): Promise<{ rows: T[] }>;
  }
}
