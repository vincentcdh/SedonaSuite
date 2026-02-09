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

// Permission exports (context, hooks, components)
export {
  // Context & Provider
  PermissionProvider,
  // Hooks
  usePermissions,
  useCanPerform,
  useCanPerformAny,
  usePlanLimit,
  useHasFeature,
  usePlanLimits,
  useRole,
  // Helpers
  getDefaultPermissions,
  getPlanLimits,
  // Types
  type PermissionContextValue,
  type PermissionProviderProps,
} from './permissions'

export {
  // Components
  PermissionGuard,
  RoleGuard,
  FeatureGuard,
  PlanLimitBanner,
  LockedFeature,
  LimitedButton,
  NoPermission,
  // Component types
  type PermissionGuardProps,
  type RoleGuardProps,
  type FeatureGuardProps,
  type PlanLimitBannerProps,
  type LockedFeatureProps,
  type LimitedButtonProps,
  type NoPermissionProps,
} from './permissions/components'

// Type exports
export type {
  AuthUser,
  AuthSession,
  Organization,
  OrganizationMember,
  OrganizationRole,
  LegacyOrganizationRole,
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
  // Permission types
  AppModule,
  PermissionAction,
  ModulePermissions,
  UserPermissions,
  RolePermission,
  // Plan types
  SubscriptionPlan,
  PlanLimits,
  LimitCheckResult,
  PlanFeature,
  PlanLimitName,
  // User context
  UserContext,
} from './types'

// Role migration helper
export { ROLE_MIGRATION_MAP } from './types'
