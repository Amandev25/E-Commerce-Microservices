import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false }, // select:false = hide by default
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Runs automatically right before a user is saved.
// It hashes the password so we never store the real one.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // skip if password didn't change
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// A helper we can call on a user: user.comparePassword('typed password')
userSchema.methods.comparePassword = function (typedPassword) {
  return bcrypt.compare(typedPassword, this.password);
};

export default mongoose.model('User', userSchema);