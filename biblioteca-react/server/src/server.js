import app from './app.js';
import 'dotenv/config';

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API ejecutándose en http://localhost:${port}`));
