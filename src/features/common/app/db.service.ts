import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DbService {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async clearDb() {
    const query = `
      CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
      DECLARE
        statements CURSOR FOR
          SELECT tablename FROM pg_tables
          WHERE tableowner = username AND schemaname = 'public';
      BEGIN
        FOR stmt IN statements LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
      SELECT truncate_tables('postgres');
    `;
    await this.dataSource.query(query);
    return true;
  }
}
