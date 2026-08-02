import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  developer: { type: String, required: true },
  ecosystem: { type: String, default: 'Mangrove Forest' },
  location: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  status: { type: String, default: 'Pending Audit' },
  verifiedCategory: { type: Boolean, default: true },
  creditsMinted: { type: Number, default: 0 },
  imgUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);
