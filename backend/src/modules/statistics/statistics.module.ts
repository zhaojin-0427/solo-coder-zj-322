import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { PlansModule } from '../plans/plans.module';
import { PreferencesModule } from '../preferences/preferences.module';
import { RoutesModule } from '../routes/routes.module';
import { ChangesModule } from '../changes/changes.module';
import { FeedbacksModule } from '../feedbacks/feedbacks.module';
import { CareTasksModule } from '../care-tasks/care-tasks.module';
import { HealthWeatherModule } from '../health-weather/health-weather.module';

@Module({
  imports: [PlansModule, PreferencesModule, RoutesModule, ChangesModule, FeedbacksModule, CareTasksModule, HealthWeatherModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
