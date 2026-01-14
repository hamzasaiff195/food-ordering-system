// src/config/database.provider.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProvider = {
  provide: DataSource,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: Number(configService.get<number>('DB_PORT', 5432)),
      username: configService.get<string>('DB_USER', 'hamza'),
      password: configService.get<string>('DB_PASS', ''),
      database: configService.get<string>('DB_NAME', 'food-ordering'),
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      synchronize: true,
      logging: ['error', 'warn'],
    });

    await dataSource.initialize();
    console.log('Database connected successfully');
    return dataSource;
  },
};
