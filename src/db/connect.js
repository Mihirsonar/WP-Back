import mongoose from "mongoose";

let dbPromise = null;

const connectDB = () => {
    if (!dbPromise) {
        dbPromise = mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log('MongoDB Connected'))
            .catch((err) => {
                console.error('MongoDB Connection Error:', err);
                dbPromise = null; // Reset so next request retries
                throw err;
            });
    }
    return dbPromise;
};

export default connectDB;