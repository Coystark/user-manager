import { Application, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import UserController from "./controllers/user";

const auth = (permissionLevel: number): any => {
  return function(req: any, res: Response, next: NextFunction) {
    const token = req.headers["authorization"]
      ? req.headers["authorization"].split(" ").pop()
      : null;

    if (!token) {
      return res.status(401).send({
        message: "Não foi fornecido nenhum token de autenticação."
      });
    }

    jwt.verify(token, process.env.API_SECRET_KEY, (err: any, decoded: any) => {
      if (err) {
        return res
          .status(401)
          .send({ message: "Falha ao autênticar o token." });
      }

      if (permissionLevel > decoded.permissionLevel) {
        return res
          .status(401)
          .send({ message: "Token sem permissão de acesso nesse caminho." });
      }

      req.token = token;
      req.userId = decoded.id;
      req.permissionLevel = decoded.permissionLevel;
      next();
    });
  };
};

class Routers {
  readonly API_VERSION = "v1";

  constructor(app: Application) {
    app.post(`/${this.API_VERSION}/user/login`, UserController.login);
    app.post(`/${this.API_VERSION}/user`, auth(0), UserController.create);
    app.put(`/${this.API_VERSION}/user/:id`, auth(0), UserController.update);
    app.delete(`/${this.API_VERSION}/user/:id`, auth(0), UserController.delete);
    app.get(`/${this.API_VERSION}/user/:id`, auth(0), UserController.get);
    app.get(`/${this.API_VERSION}/users`, auth(0), UserController.getAll);
  }
}

export default Routers;
