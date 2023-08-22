import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CardDto } from './dto';
import { CardService } from './card.service';
import { EditCardDto } from './dto/edit.card.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UserId } from '../../common/decorators/get-user-id.decorator';

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
}
