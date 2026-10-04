import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class MigratePasswordsJob implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigratePasswordsJob.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async onApplicationBootstrap() {
    // Run on startup
    await this.runMigration();
  }

  async runMigration() {
    this.logger.log('Checking for bcrypt passwords that need migration to Argon2id...');
    
    // Find users whose password starts with $2b$ (bcrypt) and haven't been marked yet
    const usersToMigrate = await this.userModel.find({
      password: { $regex: /^\$2b\$/ },
      needsPasswordMigration: { $ne: true }
    });

    if (usersToMigrate.length === 0) {
      this.logger.log('No bcrypt passwords require migration marking.');
      return;
    }

    this.logger.log(`Found ${usersToMigrate.length} users with bcrypt hashes. Marking for migration on next login.`);

    let count = 0;
    for (const user of usersToMigrate) {
      user.needsPasswordMigration = true;
      await user.save();
      count++;
      if (count % 100 === 0) {
        this.logger.log(`Progress: marked ${count} / ${usersToMigrate.length} users...`);
      }
    }

    this.logger.log(`Migration marking complete. ${count} users will be re-hashed on their next login.`);
  }
}
