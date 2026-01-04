import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    config: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const user = await this.usersService.findById(payload.sub);

    if (!user)
      throw new UnauthorizedException(
        "Something went wrong, please try again."
      );
    if (user.status == false) {
      await this.usersService.removeToken(payload.sub, payload.token);
      throw new UnauthorizedException("User is disabled");
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader)
      throw new UnauthorizedException(
        "Something went wrong, please try again."
      );
    const token = authHeader.split(" ")[1];

    const accessToken = await this.usersService.findAccessTokenEntry(
      payload.sub,
      token
    );
    if (!accessToken)
      throw new UnauthorizedException(
        "Something went wrong, please try again."
      );

    // throw new UnauthorizedException('User not found');
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      token: token,
    };
  }
}
