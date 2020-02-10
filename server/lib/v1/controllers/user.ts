import { Response, NextFunction } from "express";
import * as uuid from "uuid/v4";
import * as jwt from "jsonwebtoken";

import User, { encryptPassword } from "../models/user";

class UserController {
  public login = async (req: any, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "É necessário informar via body: email e password" });
    }

    try {
      let user = await User.findOne({
        email: email,
        password: encryptPassword(password)
      }).exec();

      if (user == undefined) {
        return res
          .status(404)
          .send({ message: "Usuário não encontrado ou senha inválida." });
      }

      let token = jwt.sign(
        { permissionLevel: user.permissionLevel, id: user._id },
        process.env.API_SECRET_KEY
      );

      res.status(200).send({ token: token });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };

  public create = async (req: any, res: Response) => {
    const { name, email, password, permissionLevel } = req.body;

    let user = new User();

    user._id = uuid();
    user.name = name;
    user.email = email;
    user.password = password ? encryptPassword(password) : password;
    user.permissionLevel = permissionLevel || 0;

    try {
      await user.validate();
    } catch (err) {
      let errors = [];

      for (let k of Object.keys(err.errors)) {
        errors.push({
          message: err.errors[k].message,
          type: err.errors[k].kind,
          path: err.errors[k].path
        });
      }

      return res.status(400).send({ errors: errors });
    }

    user.save((err, product) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      res.status(200).send(product);
    });
  };

  public update = async (req: any, res: Response) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!id) {
      return res
        .status(400)
        .send({ message: "É necessário informar via parâmetro: id" });
    }

    if (req.permissionLevel === 0 && req.userId !== id) {
      return res
        .status(401)
        .send({ message: "Autorização somente para alterar a si mesmo." });
    }

    let user = new User();

    if (name) {
      user.name = name;
    }

    if (email) {
      if (req.permissionLevel === 0) {
        return res
          .status(401)
          .send({ message: "Sem autorização suficiente para alterar email." });
      }
      user.email = email;
    }

    if (password) {
      user.password = encryptPassword(password);
    }

    // Aceitar somente erros que NÃO são do tipo required.
    try {
      await user.validate();
    } catch (err) {
      let errors = [];

      for (let k of Object.keys(err.errors)) {
        if (err.errors[k].kind !== "required") {
          errors.push({
            message: err.errors[k].message,
            type: err.errors[k].kind,
            path: err.errors[k].path
          });
        }
      }

      if (errors.length) {
        return res.status(400).send({ errors: errors });
      }
    }

    User.findByIdAndUpdate(
      id,
      user,
      {
        new: true
      },
      (err, product) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }

        if (!product) {
          return res.status(400).send({ message: "Usuário não encontrado." });
        }

        res.status(200).send(product);
      }
    );
  };

  public delete = (req: any, res: Response) => {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .send({ message: "É necessário informar via parâmetro: id" });
    }

    User.findByIdAndRemove(userId, (err, product) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      if (!product) {
        return res.status(400).send({ message: "Usuário não encontrado." });
      }

      res.sendStatus(200);
    });
  };

  public get = (req: any, res: Response) => {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .send({ message: "É necessário informar via parâmetro: id" });
    }

    User.findById(userId, (err, product) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      if (!product) {
        return res.status(400).send({ message: "Usuário não encontrado." });
      }

      res.status(200).send(product);
    });
  };

  public getAll = (req: any, res: Response) => {
    User.find((err, product) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      if (!product) {
        return res.status(400).send({ message: "Nenhum usuário encontrado." });
      }

      res.status(200).send(product);
    });
  };
}

export default new UserController();
