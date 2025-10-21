import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryPostsDto {
  @IsOptional()
  @IsIn(['all', 'free', 'question'])
  tab?: 'all' | 'free' | 'question';

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['latest', 'popular'])
  sort?: 'latest' | 'popular';
}
