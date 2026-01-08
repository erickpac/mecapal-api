import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ConfigModule } from '@nestjs/config';
import { CognitoModule } from '../modules/cognito/cognito.module';
import { PrismaModule } from '../modules/prisma/prisma.module';
// TODO: Replace with S3 - Cloudinary module removed
// import { CloudinaryModule } from '../modules/cloudinary/cloudinary.module';
import { ProfileModule } from '../modules/profile/profile.module';
import { PrismaService } from '../modules/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { COGNITO_TOKENS } from '../modules/cognito/domain/constants/injection-tokens';

// Mock PrismaService for AppModule tests
const mockPrismaService = {
  onModuleInit: jest.fn().mockResolvedValue(undefined),
  onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

// Mock CognitoService for AppModule tests
const mockCognitoService = {
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  signIn: jest.fn(),
  refreshToken: jest.fn(),
  forgotPassword: jest.fn(),
  confirmForgotPassword: jest.fn(),
  changePassword: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  verifyToken: jest.fn(),
};

// Mock UserRepository for AppModule tests
const mockUserRepository = {
  findByCognitoSub: jest.fn().mockResolvedValue(null),
  findByEmail: jest.fn().mockResolvedValue(null),
  create: jest.fn(),
  update: jest.fn(),
};

describe('AppModule', () => {
  let module: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(COGNITO_TOKENS.ICognitoService)
      .useValue(mockCognitoService)
      .overrideProvider(COGNITO_TOKENS.IUserRepository)
      .useValue(mockUserRepository)
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import ConfigModule', () => {
    const configModule = module.select(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should import PrismaModule', () => {
    const prismaModule = module.select(PrismaModule);
    expect(prismaModule).toBeDefined();
  });

  it('should import CognitoModule', () => {
    const cognitoModule = module.select(CognitoModule);
    expect(cognitoModule).toBeDefined();
  });

  // TODO: Replace with S3 - Re-enable when S3 module is implemented
  // it('should import CloudinaryModule', () => {
  //   const cloudinaryModule = module.select(CloudinaryModule);
  //   expect(cloudinaryModule).toBeDefined();
  // });

  it('should import ProfileModule', () => {
    const profileModule = module.select(ProfileModule);
    expect(profileModule).toBeDefined();
  });

  it('should have no controllers', () => {
    const controllers = Reflect.getMetadata('controllers', AppModule) as
      | unknown[]
      | undefined;
    expect(controllers).toEqual([]);
  });

  it('should have no providers', () => {
    const providers = Reflect.getMetadata('providers', AppModule) as
      | unknown[]
      | undefined;
    expect(providers).toEqual([]);
  });
});
