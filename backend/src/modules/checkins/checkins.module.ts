import { Module } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CheckinsController } from './checkins.controller';
import { PlansModule } from '../plans/plans.module';
import { RoutesModule } from '../routes/routes.module';
import { PreferencesModule } from '../preferences/preferences.module';

@Module({
  imports: [PlansModule, RoutesModule, PreferencesModule],
  controllers: [CheckinsController],
  providers: [CheckinsService],
  exports: [CheckinsService],
})
export class CheckinsModule {}
