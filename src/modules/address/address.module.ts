import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { AddressController } from './infrastructure/controllers/address.controller';
import { AddressRepository } from './infrastructure/repositories/address.repository';
import { ADDRESS_TOKENS } from './domain/constants/injection-tokens';
import { CreateAddressUseCase } from './application/use-cases/create-address.use-case';
import { GetAddressesUseCase } from './application/use-cases/get-addresses.use-case';
import { GetAddressUseCase } from './application/use-cases/get-address.use-case';
import { UpdateAddressUseCase } from './application/use-cases/update-address.use-case';
import { DeleteAddressUseCase } from './application/use-cases/delete-address.use-case';
import { SetDefaultAddressUseCase } from './application/use-cases/set-default-address.use-case';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [AddressController],
  providers: [
    // Repository
    {
      provide: ADDRESS_TOKENS.IAddressRepository,
      useClass: AddressRepository,
    },
    // Use Cases
    CreateAddressUseCase,
    GetAddressesUseCase,
    GetAddressUseCase,
    UpdateAddressUseCase,
    DeleteAddressUseCase,
    SetDefaultAddressUseCase,
  ],
  exports: [ADDRESS_TOKENS.IAddressRepository],
})
export class AddressModule {}
