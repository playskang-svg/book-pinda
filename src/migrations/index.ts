import * as migration_20261101_065139_initial from './20261101_065139_initial';
import * as migration_20261101_074813_add_guides from './20261101_074813_add_guides';

export const migrations = [
  {
    up: migration_20261101_065139_initial.up,
    down: migration_20261101_065139_initial.down,
    name: '20261101_065139_initial',
  },
  {
    up: migration_20261101_074813_add_guides.up,
    down: migration_20261101_074813_add_guides.down,
    name: '20261101_074813_add_guides'
  },
];
