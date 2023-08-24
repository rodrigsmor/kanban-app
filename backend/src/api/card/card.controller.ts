import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CardAssigneesDto, CardDto } from './dto';
import { CardService } from './card.service';
import { EditCardDto } from './dto/edit.card.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UserId } from '../../common/decorators/get-user-id.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Card')
@Controller('/api/card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'This endpoint will create a new card in the column provided.',
  })
  @ApiResponse({
    status: 201,
    type: CardDto,
    description: 'It will return the card created.',
  })
  async createCard(
    @UserId() userId: number,
    @Query('boardId') boardId: number,
    @Body() newCard: CreateCardDto,
  ): Promise<CardDto> {
    return await this.cardService.createCard(userId, boardId, newCard);
  }

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'This endpoint will update a card and return it updated',
  })
  @ApiResponse({
    status: 200,
    type: CardDto,
    description: 'It will return the card updated.',
  })
  async editCardData(
    @UserId() userId: number,
    @Query('boardId') boardId: number,
    @Body() newCardData: EditCardDto,
  ): Promise<CardDto> {
    return await this.cardService.updateCard(userId, boardId, newCardData);
  }

  @Patch('/:cardId/join')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    description: 'This endpoint will adds a new assignee to the card',
  })
  @ApiResponse({
    status: 200,
    type: CardDto,
    description: 'It will return the updated card including all assignees',
  })
  async addAssigneeToCard(
    @UserId() userId: number,
    @Query('boardId') boardId: number,
    @Body() assigneesIds: CardAssigneesDto,
  ): Promise<CardDto> {
    return this.cardService.addAssigneeToCard(
      userId,
      boardId,
      assigneesIds.assigneesIds,
    );
  }

  @Patch('/:cardId/cover')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    description:
      'This endpoint adds a new cover image to the card. It deletes the old cover if one already exists. If you want to add images without necessarily deleting the old ones, you’ll need to add an attachment.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cover: {
          type: 'string',
          format: 'binary',
          description: 'The new cover image of the provided card',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  async setCardCover(
    @UserId() userId: number,
    @Param('cardId') cardId: number,
    @Query('boardId') boardId: number,
    @UploadedFile() cover: Express.Multer.File,
  ): Promise<CardDto> {
    return this.cardService.setCardCover(userId, cardId, boardId, cover);
  }
}
