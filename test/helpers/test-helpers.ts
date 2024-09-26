import { Logger } from '@nestjs/common';

export const mockLogger: Record<keyof Logger, typeof jest.fn> = {
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  localInstance: undefined,
  fatal: undefined,
};
