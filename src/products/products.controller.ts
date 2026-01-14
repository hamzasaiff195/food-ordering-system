import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/add-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {
    console.log('🔥 ProductsController LOADED'); // for debugging
  }

  /**
   *
   * @param dto
   * @returns
   */
  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    const product = await this.productService.createProduct(dto);
    return { message: 'Product created successfully', product };
  }

  /**
   *
   * @param page
   * @param limit
   * @param res
   * @returns
   */
  @Get()
  async getAllProducts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res: any,
  ) {
    // Convert query params to numbers, with defaults
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    let result = await this.productService.getAllProducts(
      pageNumber,
      limitNumber,
    );
    return res.status(HttpStatus.OK).json({
      message: 'List of products with variants',
      total: result.total,
      limit: result.limit,
      page: result.page,
      data: result.data,
    });
  }

  /**
   *
   * @param id
   * @param res
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProduct(@Param('id') id: string, @Res() res: any) {
    let result = await this.productService.getProductById(id);

    return res.status(HttpStatus.OK).json({
      message: 'Fetched product with variants',
      data: result,
    });
  }
}
