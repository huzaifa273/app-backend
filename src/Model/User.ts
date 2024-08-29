import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  CIVILIAN = 'civilian',
  ADMIN = 'admin',
  POLICE = 'police',
  AMBULANCE = 'ambulance',
  FIRE_FIGHTER = 'fire_fighter',
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  verified:boolean;
  otp?:string;
  resetPasswordToken?:string,
  resetPasswordExpiry?:Date,
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
  verified: {
    type: Boolean,
    default: false,
  },
  otp:{
    type: String
  },
  resetPasswordToken:{
    type: String
  },
  resetPasswordExpiry:{
    type:Date
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;