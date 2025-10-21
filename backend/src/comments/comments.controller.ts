import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtOptionalAuthGuard } from '../auth/jwt-optional-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserOptional } from '../auth/current-user-optional.decorator';
import { AuthUserDto } from '../auth/dto/auth-response.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':postId/comments')
  list(
    @Param('postId') postId: string,
    @CurrentUserOptional() user: AuthUserDto | null,
  ) {
    return this.commentsService.list(postId, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  create(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthUserDto,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/comments/:commentId')
  remove(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.commentsService.remove(commentId, user.id, postId);
  }
}
