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
  /* JWT 토큰이 있으면 사용자 정보를 없어도 비회원 요청 처리하는 선택적 인증 가드*/
  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  list(
    // query 스트링을 QueryPostDto 형태로 변환해서 query 라는 매개변수로 주입해라
    @Query() query: QueryPostsDto,
    // user 스트링을 사용자 정보를 받는 형태 또는 null로 변환해서 query 라는 매개변수로 주입해라
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
