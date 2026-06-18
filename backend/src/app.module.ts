import { Module } from '@nestjs/common';
import { PlansModule } from './modules/plans/plans.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { RoutesModule } from './modules/routes/routes.module';
import { ChangesModule } from './modules/changes/changes.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [PlansModule, PreferencesModule, RoutesModule, ChangesModule, StatisticsModule],
})
export class AppModule {}
