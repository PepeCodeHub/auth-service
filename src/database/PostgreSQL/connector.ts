import knex from 'knex';
import { knexConfig } from '@config';

export const pgConnector = knex(knexConfig);
