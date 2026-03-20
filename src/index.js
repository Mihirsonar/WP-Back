import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './db/connect.js';

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });

// const startServer = async () => {
//   try {
//     await connectDB();    
//     app.listen(PORT, () => {
//       console.log(`🚀Server is running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error.message);
//     process.exit(1); 
//   } 

// };

// startServer();

