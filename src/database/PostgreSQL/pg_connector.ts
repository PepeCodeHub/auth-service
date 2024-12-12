import knex from 'knex';
import knexConfig from '../../config/knexfile';

export const pg_connector = knex(knexConfig);
