// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
    },
    phone: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'Passionate rider ready for the next trail.',
      maxLength: 200
    },
    avatar: {
    type: String,
    default: "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix"
  }
  },
  {
    timestamps: true,
  }
);


// 2. MIDDLEWARE
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 3. COMPILE MODEL
const User = mongoose.model('User', userSchema);
export default User;