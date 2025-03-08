import mongoose from 'mongoose';

const listItemSchema = new mongoose.Schema({
  firstName: String,
  phone: String,
  notes: String,
});

const listSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
  items: [listItemSchema],
}, { timestamps: true });

export default mongoose.model('List', listSchema);