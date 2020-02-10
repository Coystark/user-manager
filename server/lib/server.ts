import app from './app';
import * as dotenv from 'dotenv';

dotenv.config();

app.listen(8080, () => {
  console.log('Servidor nodeJS rodando na porta 8080.');
});