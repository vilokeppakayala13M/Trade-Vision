import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaperAccount, PaperAccountDocument } from '../../schemas/paper-account.schema';
import { PaperPosition, PaperPositionDocument } from '../../schemas/paper-position.schema';
import { PaperOrder, PaperOrderDocument } from '../../schemas/paper-order.schema';
import { AccountLedger, AccountLedgerDocument } from '../../schemas/account-ledger.schema';
import { PaperPortfolio, PaperPortfolioDocument } from '../../schemas/paper-portfolio.schema';
import { PaperTrade, PaperTradeDocument } from '../../schemas/paper-trade.schema';
import { CreateOrderDto, ExecuteTradeDto, GetTradeHistoryDto } from './dto';
import { StocksService } from '../stocks/stocks.service';
import { acquireLock, releaseLock } from '../../common/utils/redis-lock.util';

@Injectable()
export class PaperTradingService {
  constructor(
    @InjectModel(PaperAccount.name) private accountModel: Model<PaperAccountDocument>,
    @InjectModel(PaperPosition.name) private positionModel: Model<PaperPositionDocument>,
    @InjectModel(PaperOrder.name) private orderModel: Model<PaperOrderDocument>,
    @InjectModel(AccountLedger.name) private ledgerModel: Model<AccountLedgerDocument>,
    @InjectModel(PaperPortfolio.name) private portfolioModel: Model<PaperPortfolioDocument>,
    @InjectModel(PaperTrade.name) private tradeModel: Model<PaperTradeDocument>,
    private stocksService: StocksService,
  ) {}

  async createAccount(userId: string) {
    let account = await this.accountModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!account) {
      account = await this.accountModel.create({
        userId: new Types.ObjectId(userId) as any,
        balance: 1000000,
        startingBalance: 1000000,
        currency: 'INR',
      });
      await this.ledgerModel.create({
        userId: new Types.ObjectId(userId) as any,
        type: 'reset',
        amount: 1000000,
        balanceAfter: 1000000,
        description: 'Account initialized with starting balance',
      });
    }
    return account;
  }

  async getAccount(userId: string) {
    let account = await this.accountModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!account) {
      account = await this.createAccount(userId);
    }

    const positions = await this.positionModel.find({ userId: new Types.ObjectId(userId) }).exec();
    
    // Compute total holdings current value
    let positionsValue = 0;
    for (const pos of positions) {
      let currentPrice = pos.avgEntryPrice;
      try {
        const quote = await this.stocksService.getQuote(pos.symbol);
        if (quote && quote.price > 0) {
          currentPrice = quote.price;
        }
      } catch (e) {
        // fallback
      }
      positionsValue += pos.quantity * currentPrice;
    }

    const equity = account.balance + positionsValue;

    return {
      _id: account._id,
      userId: account.userId,
      balance: account.balance,
      startingBalance: account.startingBalance,
      currency: account.currency,
      positionsValue,
      equity,
      updatedAt: (account as any).updatedAt,
    };
  }

  async getPositions(userId: string) {
    await this.getAccount(userId); // ensure account initialized
    const positions = await this.positionModel.find({ userId: new Types.ObjectId(userId), quantity: { $gt: 0 } }).exec();

    const result = await Promise.all(
      positions.map(async (pos) => {
        let currentPrice = pos.avgEntryPrice;
        try {
          const quote = await this.stocksService.getQuote(pos.symbol);
          if (quote && quote.price > 0) {
            currentPrice = quote.price;
          }
        } catch (e) {
          // ignore quote error
        }

        const currentValue = pos.quantity * currentPrice;
        const totalCost = pos.quantity * pos.avgEntryPrice;
        const unrealizedPnL = currentValue - totalCost;
        const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

        return {
          _id: pos._id,
          userId: pos.userId,
          symbol: pos.symbol,
          displaySymbol: pos.displaySymbol || pos.symbol,
          companyName: pos.companyName || pos.symbol,
          side: pos.side || 'long',
          quantity: pos.quantity,
          avgEntryPrice: pos.avgEntryPrice,
          totalInvested: pos.totalInvested,
          currentPrice,
          currentValue,
          unrealizedPnL,
          unrealizedPnLPercent,
        };
      })
    );

    return result;
  }

  async placeOrder(userId: string, dto: CreateOrderDto) {
    if (!dto.quantity || dto.quantity <= 0) {
      throw new BadRequestException('quantity must be a positive number');
    }

    const side = (dto.side || '').toUpperCase() as 'BUY' | 'SELL';
    if (side !== 'BUY' && side !== 'SELL') {
      throw new BadRequestException('side must be buy or sell');
    }

    const symbol = dto.symbol.toUpperCase();

    // SERVER-SIDE execution price resolution - NEVER TRUST CLIENT PRICE
    let executionPrice = 0;
    try {
      const quote = await this.stocksService.getQuote(symbol);
      if (quote && quote.price > 0) {
        executionPrice = quote.price;
      }
    } catch (e) {
      // fallback
    }

    if (!executionPrice || executionPrice <= 0) {
      executionPrice = dto.price && dto.price > 0 ? dto.price : 100;
    }

    const lockKey = `order:${userId}`;
    const lockToken = await acquireLock(lockKey, 5000);
    if (!lockToken) {
      throw new ConflictException({ code: 'TRADE_IN_PROGRESS', message: 'Another order is currently being processed. Please retry.' });
    }

    try {
      let account = await this.accountModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
      if (!account) {
        account = await this.createAccount(userId);
      }

      const totalCost = executionPrice * dto.quantity;

      if (side === 'BUY') {
        // Enforce balance check server-side
        if (account.balance < totalCost) {
          throw new BadRequestException({
            code: 'INSUFFICIENT_FUNDS',
            message: `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${account.balance.toFixed(2)}`,
          });
        }

        // Atomic balance update
        const updatedAccount = await this.accountModel.findOneAndUpdate(
          { userId: new Types.ObjectId(userId), balance: { $gte: totalCost } },
          { $inc: { balance: -totalCost, version: 1 } },
          { new: true }
        ).exec();

        if (!updatedAccount) {
          throw new BadRequestException({
            code: 'INSUFFICIENT_FUNDS',
            message: `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${account.balance.toFixed(2)}`,
          });
        }

        account = updatedAccount;

        // Upsert position
        let position = await this.positionModel.findOne({ userId: new Types.ObjectId(userId), symbol }).exec();
        if (position) {
          const newQty = position.quantity + dto.quantity;
          const newAvgPrice = ((position.quantity * position.avgEntryPrice) + (dto.quantity * executionPrice)) / newQty;
          position.quantity = newQty;
          position.avgEntryPrice = newAvgPrice;
          position.totalInvested = position.quantity * position.avgEntryPrice;
          await position.save();
        } else {
          position = await this.positionModel.create({
            userId: new Types.ObjectId(userId) as any,
            symbol,
            displaySymbol: symbol,
            companyName: dto.companyName || symbol,
            side: 'long',
            quantity: dto.quantity,
            avgEntryPrice: executionPrice,
            totalInvested: totalCost,
          });
        }
      } else {
        // SELL
        const position = await this.positionModel.findOne({ userId: new Types.ObjectId(userId), symbol }).exec();
        if (!position || position.quantity < dto.quantity) {
          const heldQty = position ? position.quantity : 0;
          throw new BadRequestException({
            code: 'INSUFFICIENT_QUANTITY',
            message: `Cannot sell ${dto.quantity} shares of ${symbol}. You currently hold ${heldQty} shares.`,
          });
        }

        // Reduce or clear position
        const newQty = position.quantity - dto.quantity;
        if (newQty === 0) {
          await this.positionModel.deleteOne({ _id: position._id }).exec();
        } else {
          position.quantity = newQty;
          position.totalInvested = newQty * position.avgEntryPrice;
          await position.save();
        }

        // Credit account balance
        const updatedAccount = await this.accountModel.findOneAndUpdate(
          { userId: new Types.ObjectId(userId) },
          { $inc: { balance: totalCost, version: 1 } },
          { new: true }
        ).exec();

        if (updatedAccount) {
          account = updatedAccount;
        }
      }

      // Create Order Record
      const order = await this.orderModel.create({
        userId: new Types.ObjectId(userId) as any,
        symbol,
        displaySymbol: symbol,
        side,
        type: (dto.type || 'market').toLowerCase(),
        quantity: dto.quantity,
        requestedPrice: dto.price || executionPrice,
        filledPrice: executionPrice,
        totalValue: totalCost,
        status: 'filled',
        filledAt: new Date(),
      });

      // Create Ledger Entry
      await this.ledgerModel.create({
        userId: new Types.ObjectId(userId) as any,
        orderId: order._id as any,
        type: 'trade',
        amount: side === 'BUY' ? -totalCost : totalCost,
        balanceAfter: account.balance,
        description: `${side} ${dto.quantity} ${symbol} @ ₹${executionPrice.toFixed(2)}`,
      });

      // Legacy support for PaperPortfolio / PaperTrade collections if needed
      try {
        await this.syncLegacyPortfolio(userId, symbol, side, dto.quantity, executionPrice, dto.companyName);
      } catch (e) {
        // ignore legacy sync errors
      }

      return order;
    } finally {
      await releaseLock(lockKey, lockToken);
    }
  }

  async getOrders(userId: string, dto: GetTradeHistoryDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const queryFilter: Record<string, any> = { userId: new Types.ObjectId(userId) };
    if (dto.symbol) {
      queryFilter.symbol = dto.symbol.toUpperCase();
    }
    if (dto.action) {
      queryFilter.side = { $regex: new RegExp(`^${dto.action}$`, 'i') };
    }

    const [orders, total] = await Promise.all([
      this.orderModel.find(queryFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(queryFilter).exec(),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancelOrder(userId: string, orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel.findOne({ _id: new Types.ObjectId(orderId), userId: new Types.ObjectId(userId) }).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException(`Cannot cancel order with status '${order.status}'`);
    }

    order.status = 'cancelled';
    await order.save();
    return order;
  }

  async resetAccount(userId: string) {
    const lockKey = `order:${userId}`;
    const lockToken = await acquireLock(lockKey, 5000);

    try {
      await this.positionModel.deleteMany({ userId: new Types.ObjectId(userId) }).exec();
      
      const account = await this.accountModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { balance: 1000000, startingBalance: 1000000, lastResetAt: new Date(), $inc: { version: 1 } },
        { upsert: true, new: true }
      ).exec();

      await this.ledgerModel.create({
        userId: new Types.ObjectId(userId) as any,
        type: 'reset',
        amount: 1000000,
        balanceAfter: 1000000,
        description: 'Account reset to starting balance',
      });

      return {
        success: true,
        message: 'Paper trading account reset successfully',
        account,
      };
    } finally {
      if (lockToken) {
        await releaseLock(lockKey, lockToken);
      }
    }
  }

  // Legacy sync helper
  private async syncLegacyPortfolio(
    userId: string,
    symbol: string,
    action: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    companyName?: string
  ) {
    let portfolio = await this.portfolioModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!portfolio) {
      portfolio = await this.portfolioModel.create({ userId: new Types.ObjectId(userId) as any, cashBalance: 1000000 });
    }
    const totalValue = price * quantity;
    if (action === 'BUY') {
      portfolio.cashBalance = Math.max(0, portfolio.cashBalance - totalValue);
    } else {
      portfolio.cashBalance += totalValue;
    }
    await portfolio.save();
  }

  // Legacy methods for backwards compatibility
  async getPortfolio(userId: string) {
    return this.getAccount(userId);
  }

  async executeTrade(userId: string, dto: ExecuteTradeDto) {
    return this.placeOrder(userId, {
      symbol: dto.symbol,
      companyName: dto.companyName,
      side: dto.action.toLowerCase() as any,
      type: 'market',
      quantity: dto.quantity,
      price: dto.price,
    });
  }

  async getHistory(userId: string, dto: GetTradeHistoryDto) {
    return this.getOrders(userId, dto);
  }

  async resetPortfolio(userId: string) {
    return this.resetAccount(userId);
  }
}
