/**
 * Common API types and interfaces
 */

// User roles
export type UserRole = "admin" | "user" | "super_admin";

// Admin permissions
export interface AdminPermissions {
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageAdmins: boolean;
  canManageCoupons: boolean;
  canManageSettings: boolean;
}

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// User profile
export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
}

// Regular user
export interface User extends BaseUser {
  role: "user";
  profile: UserProfile;
  isEmailVerified: boolean;
  addresses?: Address[];
}

// Admin user
export interface AdminUser extends BaseUser {
  role: "admin" | "super_admin";
  firstName: string;
  lastName: string;
  permissions: AdminPermissions;
  lastLogin?: Date;
}

// Address
export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Register user request
export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

// Register admin request
export interface RegisterAdminRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "super_admin";
  permissions: Partial<AdminPermissions>;
}

// Password reset
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Change password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Verify email
export interface VerifyEmailRequest {
  token: string;
}
