import * as mongoose from 'mongoose';

class MongoDB {

  private url: string = 'mongodb://localhost:27017/userManager';

  private options: object = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  };

  public connect = () => {
    mongoose.connect(this.url, this.options).catch(err => {
      console.log(err);
    })
  }
}

export default new MongoDB();