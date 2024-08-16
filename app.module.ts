//$ npm i --save @nestjs/throttler

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvVariables, validate } from 'src/config/config.validation';
import { TypeOrmConfigService } from './config/typeorm/typeorm.config';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'node:path';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MetricsModule } from './modules/metrics/metrics.module';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService<EnvVariables>],
      useClass: TypeOrmConfigService,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'ru',
      loaderOptions: {
        path: path.join(__dirname, 'i18n', 'languages'),
        includeSubfolders: true,
        watch: true,
      },
      typesOutputPath: path.join('src', 'i18n', 'generated', 'i18n.generated.ts'),
      resolvers: [new HeaderResolver(['lang'])],
    }),
    JwtModule.registerAsync({
      inject: [ConfigService<EnvVariables>],
      useFactory: async (configService: ConfigService<EnvVariables>) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
      global: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    MetricsModule,
    ClientsModule,
  ],
})
export class AppModule {}
