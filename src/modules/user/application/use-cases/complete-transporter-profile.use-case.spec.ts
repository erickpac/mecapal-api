import { CompleteTransporterProfileUseCase } from './complete-transporter-profile.use-case';
import { ITransporterProfileRepository } from '../../domain/repositories/transporter-profile.repository';
import { TransporterProfile } from '../../domain/entities/transporter-profile.entity';
import { TransporterStatus } from '../../domain/enums/transporter-status.enum';
import { CompleteTransporterProfileDto } from '../dtos/complete-transporter-profile.dto';

describe('CompleteTransporterProfileUseCase', () => {
  let useCase: CompleteTransporterProfileUseCase;
  let repository: jest.Mocked<ITransporterProfileRepository>;

  const userId = 'user-id';

  const baseDto: CompleteTransporterProfileDto = {
    licenseNumber: 'LIC-1',
    licenseExpiration: '2030-01-01',
    licenseFrontPhotoUrl: 'https://example.com/front.jpg',
    licenseBackPhotoUrl: 'https://example.com/back.jpg',
    idPhotoUrl: 'https://example.com/id.jpg',
    address: '1 Main St',
    city: 'Guatemala City',
    state: 'Guatemala',
    postalCode: '01001',
    insurancePolicy: 'POL-1',
    insuranceExpiration: '2030-01-01',
    insuranceDocumentUrl: 'https://example.com/insurance.pdf',
  };

  const buildExisting = (
    overrides: Partial<TransporterProfile> = {},
  ): TransporterProfile =>
    new TransporterProfile({
      id: 'profile-id',
      userId,
      idNumber: null,
      licenseNumber: baseDto.licenseNumber,
      licenseExpiration: new Date(baseDto.licenseExpiration),
      licenseFrontPhotoUrl: baseDto.licenseFrontPhotoUrl,
      licenseBackPhotoUrl: baseDto.licenseBackPhotoUrl,
      idPhotoUrl: baseDto.idPhotoUrl,
      address: baseDto.address,
      city: baseDto.city,
      state: baseDto.state,
      postalCode: baseDto.postalCode,
      countryCode: 'GT',
      insurancePolicy: baseDto.insurancePolicy,
      insuranceExpiration: new Date(baseDto.insuranceExpiration),
      insuranceDocumentUrl: baseDto.insuranceDocumentUrl,
      status: TransporterStatus.PENDING_DOCUMENTS,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

  beforeEach(() => {
    repository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    useCase = new CompleteTransporterProfileUseCase(repository);
  });

  it('preserves the existing countryCode when the DTO omits country on update', async () => {
    const existing = buildExisting({ countryCode: 'MX' });
    repository.findByUserId.mockResolvedValue(existing);
    repository.update.mockResolvedValue(existing);

    await useCase.execute(userId, baseDto);

    expect(repository.update).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ countryCode: 'MX' }),
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('uses the DTO country when provided on update', async () => {
    const existing = buildExisting({ countryCode: 'MX' });
    repository.findByUserId.mockResolvedValue(existing);
    repository.update.mockResolvedValue(existing);

    await useCase.execute(userId, { ...baseDto, country: 'GT' });

    expect(repository.update).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ countryCode: 'GT' }),
    );
  });

  it("defaults countryCode to 'GT' on create when no existing profile and DTO omits country", async () => {
    repository.findByUserId.mockResolvedValue(null);
    repository.create.mockResolvedValue(buildExisting());

    await useCase.execute(userId, baseDto);

    expect(repository.create).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ countryCode: 'GT' }),
    );
    expect(repository.update).not.toHaveBeenCalled();
  });
});
