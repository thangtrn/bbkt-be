import { Controller, Get, Post, Query } from '@nestjs/common';
import { customerModel, customerTypeModel } from '@drizzle/main';
import { faker } from '@faker-js/faker'; // import faker
import { eq } from 'drizzle-orm';
import { FindCustomerRequestDto } from './app.dto';
import { DrizzleClientService } from './libs/drizzle-client/drizzle-client.service';
import { DirectFilterPipe } from './libs/query-builder/filter.pipe';

@Controller()
export class AppController {
  constructor(private db: DrizzleClientService) {}

  @Get('/customer')
  async getCustomers(
    @Query(
      new DirectFilterPipe({
        default: customerModel,
        customerType: customerTypeModel,
      }),
    )
    queryParams: FindCustomerRequestDto,
  ): Promise<any> {
    const { where, limit, offset, orderBy } = queryParams.findOptions;

    return await this.db.client
      .select({
        id: customerModel.id,
        customerCode: customerModel.customerCode,
        customerName: customerModel.customerName,
        customerTypeCode: customerModel.customerTypeCode,
        companyName: customerModel.companyName,
        address: customerModel.address,
        taxCode: customerModel.taxCode,
        email: customerModel.email,
        phone: customerModel.phone,
        isActive: customerModel.isActive,
        creditLimit: customerModel.creditLimit,
        creditBalance: customerModel.creditBalance,
        createdAt: customerModel.createdAt,
        updatedAt: customerModel.updatedAt,
        customerType: customerTypeModel, // object
      })
      .from(customerModel)
      .leftJoin(
        customerTypeModel,
        eq(customerModel.customerTypeCode, customerTypeModel.customerTypeCode),
      )
      .where(where)
      .orderBy(orderBy)
      .limit(limit ?? 50)
      .offset(offset ?? 0);
  }

  @Post('/customer')
  async createCustomer(): Promise<any> {
    const customerTypes = [
      { name: 'Retail' },
      { name: 'Wholesale' },
      { name: 'VIP' },
      { name: 'Enterprise' },
      { name: 'Online' },
    ];

    const generatedTypes = customerTypes.map((type) => ({
      id: faker.string.uuid(),
      customerTypeCode: 'TYPE-' + faker.string.alphanumeric(5).toUpperCase(),
      customerTypeName: type.name,
    }));

    const typeResult = await this.db.client
      .insert(customerTypeModel)
      .values(generatedTypes);

    const selectedType = faker.helpers.arrayElement(generatedTypes);

    const randomCustomer = {
      id: faker.string.uuid(),
      customerCode: 'CUST-' + faker.number.int({ min: 1000, max: 9999 }),
      customerName: faker.person.fullName(),
      companyName: faker.company.name(),
      customerType: selectedType.customerTypeName,
      customerTypeCode: selectedType.customerTypeCode,
      address: faker.location.streetAddress(),
      taxCode: faker.string.alphanumeric(10).toUpperCase(),
      // email: [faker.internet.email()],
      // phone: [faker.phone.number()],
      isActive: faker.datatype.boolean(),
    };

    const result = await this.db.client
      .insert(customerModel)
      .values(randomCustomer);

    return {
      message: 'Customer and customer types inserted!',
      customer: result,
      customerType: typeResult,
    };
  }
}
