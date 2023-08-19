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
import { ColumnType } from 'src/utils/@types';
import { ColumnService } from './column.service';
import { CreateColumnDto, EditColumnDto } from './dto';
import { UserId } from '../../common/decorators/get-user-id.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Columns')
@Controller('/api/column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post('/:boardId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'This endpoint will create a new column in the provided board.',
  })
  @ApiResponse({
    status: 201,
    isArray: true,
    type: ColumnType,
    description:
      'It will return the updated table column list, including the column that was just created.',
  })
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
  @ApiOperation({
    description: 'This endpoint will update the given column.',
  })
  @ApiResponse({
    status: 200,
    isArray: true,
    type: ColumnType,
    description: 'It will return the updated column list.',
  })
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
  @ApiOperation({
    description: 'This endpoint will delete the given column.',
  })
  @ApiResponse({
    status: 200,
    isArray: true,
    type: ColumnType,
    description:
      'It will return the updated column list, excluding the column that was just deleted.',
  })
  async deleteColumn(
    @UserId() userId: number,
    @Param('boardId') boardId: number,
    @Query('columnId') columnId: number,
  ): Promise<ColumnType[]> {
    return await this.columnService.deleteColumn(userId, boardId, columnId);
  }
}
