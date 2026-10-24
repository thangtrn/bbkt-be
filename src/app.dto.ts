import { CustomerModel, CustomerTypeModel } from '@drizzle/main';
import { FilterDto } from '@/core/dtos/filter.request.dto';

export class FindCustomerRequestDto extends FilterDto<
  CustomerModel & { customerType: CustomerTypeModel }
> {}
