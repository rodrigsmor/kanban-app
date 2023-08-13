import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateColumnDto } from './dto';
import { ColumnType } from 'src/utils/@types';
import { ColumnService } from './column.service';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post('/:boardId')
  @HttpCode(HttpStatus.CREATED)
  async createColumn(
    @UserId() userId: number,
    @Param('boardId') boardId: number,
    @Body() columnData: CreateColumnDto,
  ): Promise<ColumnType[]> {
    return await this.columnService.createNewColumn(
      userId,
      boardId,
      columnData,
    );
  }
}
