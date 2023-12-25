import { NextFunction, Request, Response } from "express";
import { User, UserModel } from "../../component/User/model";
import { Google } from "../../component/Oauth";
export class AuthMiddleware {
  static Authenticate =
    (role: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.user) {
        const { id, email } = req.user as Google;
        const user = (await UserModel.findOne({
          where: { googleId: id, email },
        })) as unknown as User;
        if (user) {
          if (role.includes(user.role)) {
            next();
          } else {
            res.status(401).send("Unauthorized");
          }
        } else res.status(401).send("Unauthorized");
      } else {
        //register
      }
    };
}
