import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChargeDto {
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsNumber()
  amount: number;
}
