export const ChallengeType = {
  STATIC: 'STATIC',
  LIVE: 'LIVE',
} as const;
export type ChallengeType = (typeof ChallengeType)[keyof typeof ChallengeType];

export const InstanceStatus = {
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED',
  EXPIRED: 'EXPIRED',
} as const;
export type InstanceStatus = (typeof InstanceStatus)[keyof typeof InstanceStatus];

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
