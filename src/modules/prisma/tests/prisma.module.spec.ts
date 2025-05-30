import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma.module';
import { PrismaService } from '../prisma.service';
import { ModuleRef } from '@nestjs/core';

describe('PrismaModule', () => {
  let module: TestingModule;
  let moduleRef: ModuleRef;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    moduleRef = module.get(ModuleRef);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should export PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
    expect(typeof prismaService.$connect).toBe('function');
    expect(typeof prismaService.$disconnect).toBe('function');
    expect(typeof prismaService.$transaction).toBe('function');
  });

  it('should be a global module', () => {
    const prismaModule = module.select(PrismaModule);
    expect(prismaModule).toBeDefined();
    // Check if PrismaService is available globally
    const globalService = moduleRef.get(PrismaService, { strict: false });
    expect(globalService).toBeDefined();
    // Check for expected methods instead of instance type
    expect(typeof globalService.$connect).toBe('function');
    expect(typeof globalService.$disconnect).toBe('function');
    expect(typeof globalService.$transaction).toBe('function');
  });
});
