import * as migration_20261101_061117_initial from './20261101_061117_initial';

export const migrations = [
  {
    up: migration_20261101_061117_initial.up,
    down: migration_20261101_061117_initial.down,
    name: '20261101_061117_initial'
  },
];
