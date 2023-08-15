import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateColumnDto, EditColumnDto } from './dto';
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

  @Patch('/:boardId')
  @HttpCode(HttpStatus.OK)
  async updateColumn(
    @UserId() userId: number,
    @Param('boardId') boardId: number,
    @Body() newColumnData: EditColumnDto,
  ): Promise<ColumnType[]> {
    return await this.columnService.updateColumn(
      userId,
      boardId,
      newColumnData,
    );
  }

  @Delete('/:boardId')
  @HttpCode(HttpStatus.OK)
  async deleteColumn(
    @UserId() userId: number,
    @Param('boardId') boardId: number,
    @Query('columnId') columnId: number,
  ): Promise<ColumnType[]> {
    return await this.columnService.deleteColumn(userId, boardId, columnId);
  }
}
