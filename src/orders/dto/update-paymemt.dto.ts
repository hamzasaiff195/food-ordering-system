export class UpdatePaymentDto {
  orderId: string;
  status: 'paid' | 'failed';
}
