import { Module } from '@nestjs/common';
import { HealthWeatherController } from './health-weather.controller';
import { HealthWeatherService } from './health-weather.service';
import { PlansModule } from '../plans/plans.module';
import { PreferencesModule } from '../preferences/preferences.module';
import { ChangesModule } from '../changes/changes.module';

@Module({
  imports: [PlansModule, PreferencesModule, ChangesModule],
  controllers: [HealthWeatherController],
  providers: [HealthWeatherService],
  exports: [HealthWeatherService],
})
export class HealthWeatherModule {}
