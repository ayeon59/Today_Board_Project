import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/* nestjs가 제공하는 기본 문지기 AuthGuard
 * AuthGuard('jwt')는 원래 JWT가 없으면 요청을 거절 시켜 버리는데
 * 지금 우리가 필요한건 선택적 거절이라서 AuthGuard('jwt')를 상속해서 살짝 고친코드
 */

// 기본 Guard를 상속 받아서 새로운 문지기를 정의해서 주입할것이다
@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: unknown,
    user: any,
    info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ) {
    // 만약에 진짜 에러면 throw err로 던져버림 Nest는 이걸 받아서 HTTP 응답으로 클라이언트에게 보냄
    if (err) {
      throw err;
    }

    if (info && typeof info === 'object' && 'message' in info) {
      // 로그인을 안해서 토큰이 없는 유저라면 비회원으로 처리하고 접근은 허용함
      if (info.message === 'No auth token') {
        return null;
      }
      // 토큰이 있는데 토큰이 유효하지 않다는건 이상한 사용자니까 던짐
      throw info;
    }
    // 유효한 토근이 있는 유저이면 로그인된 사용자 정보를 아니면 null로 비회원 접근하게 해줌
    return user ?? null;
  }
}
