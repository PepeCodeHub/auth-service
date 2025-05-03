import knex from 'knex';
import knexConfig from '@config/knexfile';

export const pgConnector = knex(knexConfig);
