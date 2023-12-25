import sequelize from "../../db";
import { Model, DataTypes, NUMBER } from "sequelize";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string | null;  // FOr Users who signed in via Google Authentication
  email: string;
  phone: string;
  password: String;
  role: string;
  googleId: string;
  verificationOTP: string;
  isVerified: boolean;
  expiresAt: number;
  resetPasswordExpiration?: number | null;
  resetPasswordStatus?: boolean;
  resetPasswordCode: string | null;
  loginCount: number | null;
  loginRetrival: number | null;
}

export enum ROLES {
  Employee = "employee",
  HR = "HR",
  Department = "Departmental Leads",
}

export class UserModel extends Model<User> {}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationOTP: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,   
    },
    role: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },

    expiresAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
    },

    resetPasswordExpiration: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
    },
    resetPasswordStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    resetPasswordCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    loginCount: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    loginRetrival: {
      type: DataTypes.NUMBER,
      allowNull: true,
    }
  },
  { sequelize, tableName: "user" }
);
