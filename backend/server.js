import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Order Management Backend is running. All data is now handled via Supabase on the frontend.');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
