import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
  scCode: {
    type: String,
    required: [true, 'Please provide SC Code'],
    trim: true,
  },
  projectName: {
    type: String,
    required: [true, 'Please provide project name'],
    trim: true,
  },
  startDate: {
    type: String,
    required: [true, 'Please provide start date'],
  },
  duration: {
    type: String,
    required: [true, 'Please provide duration'],
    default: '1',
  },
  endDate: {
    type: String,
    required: [true, 'Please provide end date'],
  },
  status: {
    type: String,
    enum: ['อยู่ในประกัน', 'หมดประกัน'],
    required: [true, 'Please provide status'],
  },
  remark: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Asset || mongoose.model('Asset', AssetSchema);
