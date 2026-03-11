import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Globe,
  Palette,
  Check,
} from "lucide-react";

import { PageHeader } from "@/components/index";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Skeleton,
} from "@/components/ui";
import Input from "@/components/ui/Input";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { changePasswordSchema } from "@/schemas/loginPageValidation";
import type { ChangePasswordFormInputs } from "@/schemas/loginPageValidation";
import { getRoleNameDisplay } from "@/data/roles";
import { extractAxiosError } from "@/utils/extractError";

// Profile update schema
const profileUpdateSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Preference schema
const preferencesSchema = z.object({
  language_preference: z.string(),
  theme: z.enum(["light", "dark", "system"]),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

// Tab type
type TabType = "personal" | "security" | "preferences";

export default function UserProfile() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const {
    userProfile,
    loading,
    updateUserProfile,
    changePassword,
    uploadPhoto,
    deletePhoto,
  } = useUserStore();

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: userProfile?.firstName || "",
      last_name: userProfile?.lastName || "",
      phone: userProfile?.phone || "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormInputs>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Preferences form
  const {
    register: registerPreferences,
    handleSubmit: handleSubmitPreferences,
    formState: { errors: preferencesErrors, isDirty: isPreferencesDirty },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language_preference: userProfile?.preferences?.language || "en",
      theme: userProfile?.preferences?.theme || "system",
    },
  });

  // Handle profile update
  const onUpdateProfile = async (data: ProfileUpdateFormData) => {
    try {
      await updateUserProfile(data);
      toast.success(t("profile.updated", "Profile updated successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to update profile"));
    }
  };

  // Handle password change
  const onChangePassword = async (data: ChangePasswordFormInputs) => {
    try {
      await changePassword(data);
      toast.success(t("auth.passwordChanged", "Password changed successfully"));
      resetPassword();
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to change password"));
    }
  };

  // Handle preferences update
  const onUpdatePreferences = async (data: PreferencesFormData) => {
    try {
      await updateUserProfile(data);
      toast.success(t("profile.preferencesUpdated", "Preferences updated successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to update preferences"));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.invalidFileType", "Please select an image file"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.fileTooLarge", "File size must be less than 5MB"));
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await uploadPhoto(file);
      toast.success(t("profile.photoUploaded", "Photo uploaded successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to upload photo"));
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle photo delete
  const handleDeletePhoto = async () => {
    try {
      await deletePhoto();
      toast.success(t("profile.photoDeleted", "Photo deleted successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to delete photo"));
    }
  };

  // Tab configuration
  const tabs = [
    { id: "personal" as TabType, label: t("profile.personalInfo", "Personal Information"), icon: User },
    { id: "security" as TabType, label: t("profile.security", "Security"), icon: Shield },
    { id: "preferences" as TabType, label: t("profile.preferences", "Preferences"), icon: Palette },
  ];

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!userProfile) return "?";
    return `${userProfile.firstName?.[0] || ""}${userProfile.lastName?.[0] || ""}`.toUpperCase() || "?";
  };

  // Loading state
  if (!userProfile) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("profile.title", "My Profile")}
          subtitle={t("profile.subtitle", "Manage your account settings and preferences")}
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("profile.title", "My Profile")}
        subtitle={t("profile.subtitle", "Manage your account settings and preferences")}
      />

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={`${userProfile.firstName} ${userProfile.lastName}`}
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <span className="text-2xl font-semibold text-primary">
                    {getInitials()}
                  </span>
                </div>
              )}

              {/* Photo actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title={t("profile.changePhoto", "Change Photo")}
                >
                  <Camera className="h-4 w-4" />
                </button>
                {userProfile.avatarUrl && (
                  <button
                    onClick={handleDeletePhoto}
                    disabled={loading}
                    className="p-2 rounded-full bg-white/20 hover:bg-error/80 text-white transition-colors"
                    title={t("profile.deletePhoto", "Delete Photo")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-text-primary">
                {userProfile.firstName} {userProfile.lastName}
              </h2>
              <p className="text-sm text-text-secondary mt-1">@{userProfile.username}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <Badge variant="primary">
                  {getRoleNameDisplay(userProfile.role) || userProfile.role}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-text-secondary">
                  <Mail className="h-4 w-4" />
                  {userProfile.email}
                </span>
                {userProfile.phone && (
                  <span className="flex items-center gap-1 text-sm text-text-secondary">
                    <Phone className="h-4 w-4" />
                    {userProfile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-4 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Personal Information Tab */}
        {activeTab === "personal" && (
          <Card>
            <CardHeader
              title={t("profile.personalInfo", "Personal Information")}
              subtitle={t("profile.personalInfoSubtitle", "Update your personal details")}
            />
            <CardContent>
              <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t("profile.firstName", "First Name")}
                    placeholder={t("profile.firstNamePlaceholder", "Enter your first name")}
                    leftIcon={<User className="h-4 w-4" />}
                    error={profileErrors.first_name?.message}
                    {...registerProfile("first_name")}
                  />

                  <Input
                    label={t("profile.lastName", "Last Name")}
                    placeholder={t("profile.lastNamePlaceholder", "Enter your last name")}
                    leftIcon={<User className="h-4 w-4" />}
                    error={profileErrors.last_name?.message}
                    {...registerProfile("last_name")}
                  />

                  <Input
                    label={t("profile.email", "Email")}
                    type="email"
                    value={userProfile.email}
                    disabled
                    leftIcon={<Mail className="h-4 w-4" />}
                    helperText={t("profile.emailReadonly", "Contact admin to change email")}
                  />

                  <Input
                    label={t("profile.phone", "Phone Number")}
                    placeholder={t("profile.phonePlaceholder", "+93 70 000 0000")}
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={profileErrors.phone?.message}
                    {...registerProfile("phone")}
                  />

                  <Input
                    label={t("profile.username", "Username")}
                    value={userProfile.username}
                    disabled
                    leftIcon={<User className="h-4 w-4" />}
                    helperText={t("profile.usernameReadonly", "Username cannot be changed")}
                  />

                  <Input
                    label={t("profile.role", "Role")}
                    value={getRoleNameDisplay(userProfile.role) || userProfile.role}
                    disabled
                    leftIcon={<Shield className="h-4 w-4" />}
                    helperText={t("profile.roleReadonly", "Contact admin to change role")}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={loading} disabled={!isProfileDirty}>
                    {t("common.save", "Save Changes")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <Card>
            <CardHeader
              title={t("auth.changePassword", "Change Password")}
              subtitle={t("profile.securitySubtitle", "Update your password to keep your account secure")}
            />
            <CardContent>
              <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4 max-w-md">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  label={t("auth.currentPassword", "Current Password")}
                  placeholder={t("profile.currentPasswordPlaceholder", "Enter current password")}
                  leftIcon={<Key className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-muted hover:text-text-primary transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={passwordErrors.old_password?.message}
                  {...registerPassword("old_password")}
                />

                <Input
                  type={showNewPassword ? "text" : "password"}
                  label={t("auth.newPassword", "New Password")}
                  placeholder={t("profile.newPasswordPlaceholder", "Enter new password")}
                  leftIcon={<Key className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-muted hover:text-text-primary transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={passwordErrors.new_password?.message}
                  helperText={t("profile.passwordHint", "Min 8 chars, include uppercase, lowercase, and number")}
                  {...registerPassword("new_password")}
                />

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  label={t("auth.confirmPassword", "Confirm Password")}
                  placeholder={t("profile.confirmPasswordPlaceholder", "Confirm new password")}
                  leftIcon={<Key className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted hover:text-text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={passwordErrors.confirm_password?.message}
                  {...registerPassword("confirm_password")}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={loading}>
                    {t("auth.changePassword", "Change Password")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <Card>
            <CardHeader
              title={t("profile.preferences", "Preferences")}
              subtitle={t("profile.preferencesSubtitle", "Customize your experience")}
            />
            <CardContent>
              <form onSubmit={handleSubmitPreferences(onUpdatePreferences)} className="space-y-6 max-w-md">
                {/* Language */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t("profile.language", "Language")}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    {...registerPreferences("language_preference")}
                  >
                    <option value="en">English</option>
                    <option value="fa">فارسی (Farsi)</option>
                    <option value="ps">پښتو (Pashto)</option>
                  </select>
                  {preferencesErrors.language_preference?.message && (
                    <p className="text-sm text-error">{preferencesErrors.language_preference.message}</p>
                  )}
                </div>

                {/* Theme */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    {t("profile.theme", "Theme")}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "light", label: t("profile.themeLight", "Light") },
                      { value: "dark", label: t("profile.themeDark", "Dark") },
                      { value: "system", label: t("profile.themeSystem", "System") },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                          userProfile.preferences?.theme === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          className="sr-only"
                          {...registerPreferences("theme")}
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                        {userProfile.preferences?.theme === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={loading} disabled={!isPreferencesDirty}>
                    {t("common.save", "Save Changes")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
