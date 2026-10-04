import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaperTradingService } from './paper-trading.service';
import { PaperTradingController } from './paper-trading.controller';
import { PaperPortfolio, PaperPortfolioSchema } from '../../schemas/paper-portfolio.schema';
import { PaperTrade, PaperTradeSchema } from '../../schemas/paper-trade.schema';
import { PaperLeaderboard, PaperLeaderboardSchema } from '../../schemas/paper-leaderboard.schema';
import { PaperAccount, PaperAccountSchema } from '../../schemas/paper-account.schema';
import { PaperPosition, PaperPositionSchema } from '../../schemas/paper-position.schema';
import { PaperOrder, PaperOrderSchema } from '../../schemas/paper-order.schema';
import { AccountLedger, AccountLedgerSchema } from '../../schemas/account-ledger.schema';
import { EmailModule } from '../email/email.module';
import { StocksModule } from '../stocks/stocks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaperAccount.name, schema: PaperAccountSchema },
      { name: PaperPosition.name, schema: PaperPositionSchema },
      { name: PaperOrder.name, schema: PaperOrderSchema },
      { name: AccountLedger.name, schema: AccountLedgerSchema },
      { name: PaperPortfolio.name, schema: PaperPortfolioSchema },
      { name: PaperTrade.name, schema: PaperTradeSchema },
      { name: PaperLeaderboard.name, schema: PaperLeaderboardSchema },
    ]),
    EmailModule,
    StocksModule,
    UsersModule,
  ],
  providers: [PaperTradingService],
  controllers: [PaperTradingController],
  exports: [PaperTradingService],
})
export class PaperTradingModule {}
