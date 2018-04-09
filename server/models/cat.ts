import * as mongoose from 'mongoose';

const catSchema = new mongoose.Schema({
  name: String,
  shares: Number,
  boughtAt: Number,
  user: String,
  value: { type: Number, default: 0 }
});

const Cat = mongoose.model('Cat', catSchema);

export default Cat;
