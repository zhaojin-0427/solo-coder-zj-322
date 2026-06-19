import { Module } from '@nestjs/common';
import { PlansModule } from './modules/plans/plans.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { RoutesModule } from './modules/routes/routes.module';
import { ChangesModule } from './modules/changes/changes.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { CareTasksModule } from './modules/care-tasks/care-tasks.module';
import { HealthWeatherModule } from './modules/health-weather/health-weather.module';
import { CheckinsModule } from './modules/checkins/checkins.module';

@Module({
  imports: [PlansModule, PreferencesModule, RoutesModule, ChangesModule, StatisticsModule, FeedbacksModule, CareTasksModule, HealthWeatherModule, CheckinsModule],
})
export class AppModule {}
