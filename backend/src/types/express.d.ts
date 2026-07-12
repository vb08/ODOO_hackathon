import { UserTokenPayload } from "../helpers/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}
