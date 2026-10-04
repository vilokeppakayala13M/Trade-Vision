import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { RevokedToken } from '../../schemas/revoked-token.schema';
import { getQueueToken } from '@nestjs/bull';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mockAccessToken'),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'jwt.refreshSecret') return 'test-refresh-secret';
      if (key === 'jwt.refreshExpiresIn') return '7d';
      return null;
    }),
  };

  const mockRevokedTokenModel = {
    exists: jest.fn(),
    create: jest.fn(),
  };

  const mockEmailQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getModelToken(RevokedToken.name), useValue: mockRevokedTokenModel },
        { provide: getQueueToken('email'), useValue: mockEmailQueue },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user exists', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce({ id: '123', email: 'test@test.com' });
      await expect(service.register({ email: 'test@test.com', password: 'pass', name: 'Test' })).rejects.toThrow('Email already in use');
    });

    it('should create user and return tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      const mockUser = { id: '123', email: 'test@test.com', name: 'Test', tier: 'free', toObject: () => ({ id: '123' }) };
      mockUsersService.create.mockResolvedValueOnce(mockUser);

      const result = await service.register({ email: 'test@test.com', password: 'pass', name: 'Test' });
      
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe('mockAccessToken');
      expect(mockEmailQueue.add).toHaveBeenCalledWith('email', expect.any(Object));
    });
  });

  describe('logout', () => {
    it('should revoke access token if provided', async () => {
      const accessToken = 'mockAccessToken';
      const userId = '123';
      const refreshToken = 'mockRefreshToken';

      mockRevokedTokenModel.exists.mockResolvedValueOnce(false);
      mockUsersService.findById.mockResolvedValueOnce({
        _id: userId,
        refreshTokenFamily: [{ familyId: 'fam-123', tokenHash: 'hash', expiresAt: new Date() }],
        save: jest.fn().mockResolvedValue(true)
      });

      await service.logout(refreshToken, accessToken, userId);

      expect(mockRevokedTokenModel.exists).toHaveBeenCalled();
      expect(mockRevokedTokenModel.create).toHaveBeenCalled();
    });
  });
});

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  decode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 900 }),
}));

jest.mock('../../common/utils/jwt.util', () => ({
  verifyToken: jest.fn().mockResolvedValue({ userId: '123', familyId: 'fam-123' }),
}));
