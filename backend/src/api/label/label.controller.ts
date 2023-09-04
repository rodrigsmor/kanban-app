import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LabelDto } from '../card/dto';
import { HttpStatus } from '@nestjs/common';
import { LabelService } from './label.service';
import { CreateLabelDto, DeleteLabelsDto, EditLabelDto } from './dto';
import { UserId } from '../../common/decorators/get-user-id.decorator';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Labels')
@Controller('/api/board/label')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'This endpoint will return all the labels on the board.',
  })
  @ApiResponse({
    status: 200,
    type: LabelDto,
    isArray: true,
    description:
      'It will return a list of the labels existing on the current board',
  })
  async getBoardLabels(
    @UserId() userId: number,
    @Query('boardId') boardId: number,
  ): Promise<LabelDto[]> {
    return this.labelService.getBoardLabels(userId, boardId);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'This endpoint will create a new label and return an updated list of all the labels in the frame',
  })
  @ApiResponse({
    status: 201,
    type: LabelDto,
    isArray: true,
    description:
      'It will return a updated list of all labels existing on the informed board',
  })
  @ApiQuery({
    name: 'boardId',
    required: false,
    type: Number,
  })
  async createLabel(
    @UserId() userId: number,
    @Body() newLabel: CreateLabelDto,
    @Query('boardId') boardId: number,
  ): Promise<LabelDto[]> {
    return this.labelService.createLabel(userId, boardId, newLabel);
  }

  @Put('/:labelId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'This endpoint will update the data of a label and return it.',
  })
  @ApiResponse({
    status: 201,
    type: LabelDto,
    isArray: false,
    description: 'It will return tha label updated including the provided data',
  })
  @ApiQuery({
    name: 'boardId',
    required: false,
    type: Number,
  })
  async editLabel(
    @UserId() userId: number,
    @Param('labelId') labelId: number,
    @Query('boardId') boardId: number,
    @Body() newLabelData: EditLabelDto,
  ): Promise<LabelDto> {
    return this.labelService.editLabel(userId, labelId, boardId, newLabelData);
  }

  @Delete('/')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'boardId',
    required: false,
    type: Number,
  })
  @ApiOperation({
    description:
      'This endpoint will delete the labels by the Ids indicated in the request and return an updated list of all the labels on the board, no longer including the deleted Ids.',
  })
  @ApiResponse({
    status: 201,
    type: LabelDto,
    isArray: true,
    description:
      'It will return an updated list of all existing labels on the informed board, excluding the labels that have had their ids indicated for deletion',
  })
  async deleteLabel(
    @UserId() userId: number,
    @Query('boardId') boardId: number,
    @Body() deleteLabels: DeleteLabelsDto,
  ): Promise<LabelDto[]> {
    return this.labelService.deleteLabels(
      userId,
      deleteLabels.labelsIds,
      boardId,
    );
  }
}
