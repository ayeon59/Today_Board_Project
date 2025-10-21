import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUserDto } from '../auth/dto/auth-response.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-post.dto';
import { JwtOptionalAuthGuard } from '../auth/jwt-optional-auth.guard';
import { CurrentUserOptional } from '../auth/current-user-optional.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /* 비회원이거나 회원인 경우가 아니면 접속 막아버림 */
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  list(
    @Query() query: QueryPostsDto,
    @CurrentUserOptional() user: AuthUserDto | null,
  ) {
    const { tab = 'all', q, sort = 'latest' } = query;
    return this.postsService.findAll({ tab, q, sort }, user?.id);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('summary')
  summary(@CurrentUserOptional() user: AuthUserDto | null) {
    return this.postsService.getHomeSummary(user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/list')
  listMine(@CurrentUser() user: AuthUserDto) {
    return this.postsService.findMine(user.id);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  detail(
    @Param('id') id: string,
    @CurrentUserOptional() user: AuthUserDto | null,
  ) {
    return this.postsService.findOne(id, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUserDto, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.postsService.remove(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  toggleLike(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.postsService.toggleLike(id, user.id);
  }
}
