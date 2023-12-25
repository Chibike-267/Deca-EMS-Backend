import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel } from "../../component/User/model";

const jwtsecret = process.env.JWT_SECRET as string;

/**----------API MIDDLEWARE--------------- */
export async function auth(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({ error: "Kindly sign in as a user" });
  }
  const token = authorization.slice(7, authorization.length);

  let verified = jwt.verify(token, jwtsecret);

  if (!verified) {
    res
      .status(401)
      .json({ error: "Invalid token, you cant access this route" });
  }

  const { id } = verified as { [key: string]: string };

  //check if user exist
  const user = await UserModel.findOne({ where: { id } });

  if (!user) {
    res.status(401).json({ error: "Kindly signup as a user " });
  }

  req.user = verified;
  next();
}
=======
import jwt from "jsonwebtoken";
import { UserModel } from "../../component/User/model";

const jwtsecret = process.env.JWT_SECRET;

/**----------API MIDDLEWARE--------------- */
export async function auth(req:Request | any , res:Response, next: NextFunction){
const authorization = req.headers.authorization

if(!authorization){
    res.status(401).json({error: "kindly sign in as a user"})
}
const token = authorization.slice(7, authorization.length);

let verified = jwt.verify(token, jwtsecret!);

if(!verified){
    res.status(401).json({error: "Invalid token, you cant access this route"})
}

const {id} = verified as {[key:string] :string}

//check if user exist
const user = await UserModel.findOne({where:{id}});

if(!user){
    res.status(401).json({error: "Kindly signup as a user "})
}

  req.user = verified
  next()
}
