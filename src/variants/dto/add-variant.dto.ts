import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string; // e.g., "8pc", "16pc"

  @IsNumber()
  price: number;

  @IsString()
  productId?: string;
}
