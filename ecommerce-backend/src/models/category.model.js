import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },        // filled in automatically below
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Before saving, build the slug from the name.
// Only runs when the name is new or changed, so we don't waste work.
categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
    // lower: make it lowercase   |   strict: remove anything that isn't a letter/number/dash
  }
});

export default mongoose.model('Category', categorySchema);