import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../modules/auth/auth.module';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { CloudinaryModule } from '../modules/cloudinary/cloudinary.module';
import { ProfileModule } from '../modules/profile/profile.module';
import { INestApplication } from '@nestjs/common';

describe('AppModule', () => {
  let module: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
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

  it('should import AuthModule', () => {
    const authModule = module.select(AuthModule);
    expect(authModule).toBeDefined();
  });

  it('should import CloudinaryModule', () => {
    const cloudinaryModule = module.select(CloudinaryModule);
    expect(cloudinaryModule).toBeDefined();
  });

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
