import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  CIVILIAN = 'civilian',
  POLICE = 'police',
  AMBULANCE = 'ambulance',
  FIRE = 'fire',
  PRIVATE_AMBULANCE_SERVICE = 'private ambulance service',
  SECURITY_PERSONNEL = 'security personnel',
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
}

const userSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
  },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;