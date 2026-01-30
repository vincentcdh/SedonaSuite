// ===========================================
// @sedona/auth - Authentication Package
// ===========================================

// Client exports (React hooks and client)
export {
  createSedonaAuthClient,
  getAuthClient,
  initAuthClient,
  useAuth,
  useSession,
  useSignIn,
  useSignUp,
  useSignOut,
  useForgotPassword,
  useResetPassword,
  useOrganization,
  useTwoFactor,
  type AuthClient,
} from './client'

// Schema exports (Zod validation)
export {
  emailSchema,
  passwordSchema,
  nameSchema,
  organizationNameSchema,
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
  twoFactorSchema,
  inviteMemberSchema,
  createOrganizationSchema,
  type SignInFormData,
  type SignUpFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type UpdatePasswordFormData,
  type UpdateProfileFormData,
  type TwoFactorFormData,
  type InviteMemberFormData,
  type CreateOrganizationFormData,
} from './schemas'

// Type exports
export type {
  AuthUser,
  AuthSession,
  Organization,
  OrganizationMember,
  OrganizationRole,
  AuthState,
  SignUpInput,
  SignInInput,
  ResetPasswordInput,
  NewPasswordInput,
  UpdateProfileInput,
  UpdatePasswordInput,
  InviteMemberInput,
  AcceptInvitationInput,
  AuthCallback,
  AuthErrorCallback,
} from './types'
