import { Test, TestingModule } from '@nestjs/testing';
import { PaperTradingService } from './paper-trading.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { PaperAccount } from '../../schemas/paper-account.schema';
import { PaperPosition } from '../../schemas/paper-position.schema';
import { PaperOrder } from '../../schemas/paper-order.schema';
import { AccountLedger } from '../../schemas/account-ledger.schema';
import { PaperPortfolio } from '../../schemas/paper-portfolio.schema';
import { PaperTrade } from '../../schemas/paper-trade.schema';
import { StocksService } from '../stocks/stocks.service';

describe('PaperTradingService', () => {
  let service: PaperTradingService;

  const mockAccountModel: any = {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const mockPositionModel: any = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockOrderModel: any = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockLedgerModel: any = {
    create: jest.fn(),
  };

  const mockPortfolioModel: any = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockTradeModel: any = {};

  const mockStocksService = {
    getQuote: jest.fn().mockResolvedValue({ symbol: 'RELIANCE', price: 2500 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaperTradingService,
        { provide: getModelToken(PaperAccount.name), useValue: mockAccountModel },
        { provide: getModelToken(PaperPosition.name), useValue: mockPositionModel },
        { provide: getModelToken(PaperOrder.name), useValue: mockOrderModel },
        { provide: getModelToken(AccountLedger.name), useValue: mockLedgerModel },
        { provide: getModelToken(PaperPortfolio.name), useValue: mockPortfolioModel },
        { provide: getModelToken(PaperTrade.name), useValue: mockTradeModel },
        { provide: StocksService, useValue: mockStocksService },
      ],
    }).compile();

    service = module.get<PaperTradingService>(PaperTradingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('placeOrder - Validation & Edge Cases', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should reject zero or negative quantity', async () => {
      await expect(
        service.placeOrder(userId, {
          symbol: 'RELIANCE',
          side: 'buy',
          quantity: 0,
        })
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.placeOrder(userId, {
          symbol: 'RELIANCE',
          side: 'buy',
          quantity: -5,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject buy order when user has insufficient balance', async () => {
      mockAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'acc1', balance: 1000, save: jest.fn() }),
      });
      mockAccountModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // Atomic update fails due to balance check
      });

      await expect(
        service.placeOrder(userId, {
          symbol: 'RELIANCE',
          side: 'buy',
          quantity: 10, // Cost = 10 * 2500 = 25,000 > 1,000 balance
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject sell order when position does not exist or has insufficient quantity', async () => {
      mockAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'acc1', balance: 100000, save: jest.fn() }),
      });
      mockPositionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // No position held
      });

      await expect(
        service.placeOrder(userId, {
          symbol: 'RELIANCE',
          side: 'sell',
          quantity: 5,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject oversized sell order exceeding held quantity', async () => {
      mockAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'acc1', balance: 100000, save: jest.fn() }),
      });
      mockPositionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ quantity: 3, avgEntryPrice: 2400 }), // Only 3 held
      });

      await expect(
        service.placeOrder(userId, {
          symbol: 'RELIANCE',
          side: 'sell',
          quantity: 10, // Trying to sell 10
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully place a valid buy order and update balance + ledger', async () => {
      const mockAccount = { _id: 'acc1', balance: 100000 };
      mockAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccount),
      });
      mockAccountModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'acc1', balance: 75000 }),
      });
      mockPositionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockPositionModel.create.mockResolvedValue({ _id: 'pos1' });
      mockOrderModel.create.mockResolvedValue({ _id: 'ord1', status: 'filled', filledPrice: 2500 });
      mockLedgerModel.create.mockResolvedValue({ _id: 'led1' });

      const res = await service.placeOrder(userId, {
        symbol: 'RELIANCE',
        side: 'buy',
        quantity: 10,
      });

      expect(res).toBeDefined();
      expect(mockOrderModel.create).toHaveBeenCalled();
      expect(mockLedgerModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'trade',
          amount: -25000,
        })
      );
    });
  });

  describe('Integration Test: Concurrent Orders Balance Check', () => {
    it('should prevent balance from going negative under near-simultaneous buy orders', async () => {
      const userId = '507f1f77bcf86cd799439011';
      let currentBalance = 30000; // Enough for ONE order of 25,000, but NOT TWO (50,000)

      mockAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'acc1', balance: currentBalance }),
      });

      // Simulate atomic findOneAndUpdate in MongoDB
      mockAccountModel.findOneAndUpdate.mockImplementation((filter: any) => {
        const requiredCost = filter?.balance?.$gte || 0;
        return {
          exec: jest.fn().mockImplementation(async () => {
            if (currentBalance >= requiredCost) {
              currentBalance -= requiredCost;
              return { _id: 'acc1', balance: currentBalance };
            }
            return null; // Atomic check failed
          }),
        };
      });

      mockPositionModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockPositionModel.create.mockResolvedValue({});
      mockOrderModel.create.mockResolvedValue({ status: 'filled' });
      mockLedgerModel.create.mockResolvedValue({});

      // Fire 2 concurrent buy requests of 25,000 each (Total = 50,000 > 30,000 balance)
      const req1 = service.placeOrder(userId, { symbol: 'RELIANCE', side: 'buy', quantity: 10 });
      const req2 = service.placeOrder(userId, { symbol: 'RELIANCE', side: 'buy', quantity: 10 });

      const results = await Promise.allSettled([req1, req2]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Exactly 1 order should succeed and 1 order should be rejected with Insufficient Funds
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);
      expect(currentBalance).toBeGreaterThanOrEqual(0);
    });
  });
});
