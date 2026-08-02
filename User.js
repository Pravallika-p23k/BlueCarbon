import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'government', 'admin'], default: 'user' },
  name: { type: String, default: '' },
  village: { type: String, default: '' },
  mandal: { type: String, default: '' },
  previousCredits: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);