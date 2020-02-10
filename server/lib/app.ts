import * as  express from 'express';
import * as bodyParser from 'body-parser';

import MongoDB from './mongo';
MongoDB.connect();

import Routers from './v1/routers';

class App {

  public app: express.Application = express();

  constructor() {
    this.config();
    new Routers(this.app);
  }

  private config = () => {
    // Cors, body-parser etc..
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({
      extended: true,
      limit: '50mb'
    }));
  }
}

export default new App().app;