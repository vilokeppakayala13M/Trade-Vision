import { Test, TestingModule } from '@nestjs/testing';
import { StocksService } from './stocks.service';
import { FinnhubService } from './finnhub.service';
import { MarketStatusService } from './market-status.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('StocksService', () => {
  let service: StocksService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockFinnhubService = {
    getQuote: jest.fn(),
  };

  const mockMarketStatusService = {
    getStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: FinnhubService, useValue: mockFinnhubService },
        { provide: MarketStatusService, useValue: mockMarketStatusService },
      ],
    }).compile();

    service = module.get<StocksService>(StocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuote', () => {
    it('should return cached quote if available', async () => {
      const mockQuote = { symbol: 'RELIANCE', price: 2500 };
      mockCacheManager.get.mockResolvedValueOnce(mockQuote);

      const result = await service.getQuote('RELIANCE');
      expect(result).toEqual(mockQuote);
      expect(mockFinnhubService.getQuote).not.toHaveBeenCalled();
    });

    it('should fetch from Finnhub if not cached', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null);
      mockFinnhubService.getQuote.mockResolvedValueOnce({ c: 2500, d: 10, dp: 0.4 });

      const result = await service.getQuote('RELIANCE');
      expect(result.price).toBe(2500);
      expect(mockFinnhubService.getQuote).toHaveBeenCalledWith('RELIANCE');
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });
});
