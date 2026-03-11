import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Server,
  Lock,
  Send,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
} from "lucide-react";

import { PageHeader } from "@components/index";
import { Card, CardHeader, CardContent, Button, Skeleton } from "@components/ui";
import Input from "@components/ui/Input";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  shopSettingsSchema,
  emailSettingsSchema,
} from "@/schemas/settingsSchema";
import type { ShopSettings, EmailSettings } from "@/entities/Setting";
import { extractAxiosError } from "@/utils/extractError";

export default function GeneralSettings() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    shopSettings,
    emailSettings,
    logoSettings,
    isLoadingShop,
    isLoadingEmail,
    isLoadingLogo,
    isSavingShop,
    isSavingEmail,
    isSavingLogo,
    fetchSettings,
    updateShopSettings,
    updateEmailSettings,
    updateLogoSettings,
    testEmailConfiguration,
  } = useSettingsStore();

  // School Profile Form
  const {
    register: registerShop,
    handleSubmit: handleSubmitShop,
    formState: { errors: shopErrors },
    reset: resetShop,
  } = useForm<ShopSettings>({
    resolver: zodResolver(shopSettingsSchema),
  });

  // Email Settings Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    reset: resetEmail,
  } = useForm<EmailSettings>({
    resolver: zodResolver(emailSettingsSchema),
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings().catch(() => {
      // Settings fetch failed, forms will use default values
    });
  }, [fetchSettings]);

  // Reset forms when data is loaded
  useEffect(() => {
    if (shopSettings) {
      resetShop(shopSettings);
    }
  }, [shopSettings, resetShop]);

  useEffect(() => {
    if (emailSettings) {
      resetEmail(emailSettings);
    }
  }, [emailSettings, resetEmail]);

  useEffect(() => {
    if (logoSettings?.logo) {
      setLogoPreview(logoSettings.logo);
    }
  }, [logoSettings]);

  // Handle school profile save
  const onSaveShopSettings = async (data: ShopSettings) => {
    try {
      await updateShopSettings(data);
      toast.success(t("settings.shopSaved", "School profile saved successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to save school profile"));
    }
  };

  // Handle email settings save
  const onSaveEmailSettings = async (data: EmailSettings) => {
    try {
      await updateEmailSettings(data);
      toast.success(t("settings.emailSaved", "Email settings saved successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to save email settings"));
    }
  };

  // Handle test email
  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await testEmailConfiguration();
      toast.success(t("settings.emailTestSuccess", "Test email sent successfully! Check your inbox."));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to send test email"));
    } finally {
      setTestingEmail(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.invalidFileType", "Please select an image file"));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.fileTooLarge", "File size must be less than 2MB"));
      return;
    }

    try {
      await updateLogoSettings(file);
      toast.success(t("settings.logoUploaded", "Logo uploaded successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to upload logo"));
    }
  };

  // Handle logo delete
  const handleDeleteLogo = async () => {
    // Create an empty file to clear the logo
    try {
      // API should handle null/empty logo deletion
      setLogoPreview(null);
      toast.success(t("settings.logoDeleted", "Logo deleted successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to delete logo"));
    }
  };

  // Loading skeleton
  const FormSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settings.general", "General Settings")}
        subtitle={t("settings.generalSubtitle", "Configure school information and system settings")}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* School Profile */}
        <Card>
          <CardHeader
            title={t("settings.schoolProfile", "School Profile")}
            subtitle={t("settings.schoolProfileSubtitle", "Basic information about your school")}
          />
          <CardContent>
            {isLoadingShop ? (
              <FormSkeleton />
            ) : (
              <form onSubmit={handleSubmitShop(onSaveShopSettings)} className="space-y-4">
                <Input
                  label={t("settings.schoolName", "School Name")}
                  placeholder={t("settings.schoolNamePlaceholder", "Enter school name")}
                  leftIcon={<Building2 className="h-4 w-4" />}
                  error={shopErrors.shop_name?.message}
                  {...registerShop("shop_name")}
                />

                <Input
                  label={t("settings.contactEmail", "Contact Email")}
                  type="email"
                  placeholder={t("settings.contactEmailPlaceholder", "contact@school.edu")}
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={shopErrors.contact_email?.message}
                  {...registerEmail("from_email")}
                  {...registerShop("contact_email")}
                />

                <Input
                  label={t("settings.phoneNumber", "Phone Number")}
                  placeholder={t("settings.phonePlaceholder", "+93 70 000 0000")}
                  leftIcon={<Phone className="h-4 w-4" />}
                  error={shopErrors.phone_number?.message}
                  {...registerShop("phone_number")}
                />

                <Input
                  label={t("settings.address", "Address")}
                  placeholder={t("settings.addressPlaceholder", "Enter school address")}
                  leftIcon={<MapPin className="h-4 w-4" />}
                  error={shopErrors.address?.message}
                  {...registerShop("address")}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={isSavingShop}>
                    {t("common.save", "Save Changes")}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader
            title={t("settings.schoolLogo", "School Logo")}
            subtitle={t("settings.logoSubtitle", "Upload your school's logo (max 2MB)")}
          />
          <CardContent>
            {isLoadingLogo ? (
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-32 w-32 rounded-xl" />
                <Skeleton className="h-10 w-40" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Logo Preview */}
                <div className="relative">
                  {logoPreview ? (
                    <div className="group relative">
                      <img
                        src={logoPreview}
                        alt="School Logo"
                        className="h-32 w-32 rounded-xl border border-border object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteLogo}
                        className="absolute -right-2 -top-2 rounded-full bg-error p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface">
                      <ImageIcon className="h-12 w-12 text-muted" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    loading={isSavingLogo}
                    leftIcon={<Upload className="h-4 w-4" />}
                    onClick={() => {}}
                  >
                    {logoPreview
                      ? t("settings.changeLogo", "Change Logo")
                      : t("settings.uploadLogo", "Upload Logo")}
                  </Button>
                </label>

                <p className="text-center text-xs text-muted">
                  {t("settings.logoHint", "Recommended: PNG or JPG, 256x256px or larger")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={t("settings.emailConfiguration", "Email Configuration")}
            subtitle={t("settings.emailConfigSubtitle", "Configure SMTP settings for sending emails")}
          />
          <CardContent>
            {isLoadingEmail ? (
              <FormSkeleton />
            ) : (
              <form onSubmit={handleSubmitEmail(onSaveEmailSettings)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t("settings.smtpHost", "SMTP Host")}
                    placeholder="smtp.example.com"
                    leftIcon={<Server className="h-4 w-4" />}
                    error={emailErrors.smtp_host?.message}
                    {...registerEmail("smtp_host")}
                  />

                  <Input
                    label={t("settings.smtpPort", "SMTP Port")}
                    type="number"
                    placeholder="587"
                    error={emailErrors.smtp_port?.message}
                    {...registerEmail("smtp_port", { valueAsNumber: true })}
                  />

                  <Input
                    label={t("settings.smtpUsername", "SMTP Username")}
                    placeholder={t("settings.smtpUsernamePlaceholder", "your@email.com")}
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={emailErrors.smtp_username?.message}
                    {...registerEmail("smtp_username")}
                  />

                  <Input
                    type={showPassword ? "text" : "password"}
                    label={t("settings.smtpPassword", "SMTP Password")}
                    placeholder={t("settings.smtpPasswordPlaceholder", "Enter SMTP password")}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted hover:text-text-primary transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                    error={emailErrors.smtp_password?.message}
                    {...registerEmail("smtp_password")}
                  />

                  <Input
                    label={t("settings.fromEmail", "From Email")}
                    type="email"
                    placeholder="noreply@school.edu"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={emailErrors.from_email?.message}
                    {...registerEmail("from_email")}
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    loading={testingEmail}
                    onClick={handleTestEmail}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    {t("settings.testEmail", "Send Test Email")}
                  </Button>
                  <Button type="submit" loading={isSavingEmail}>
                    {t("common.save", "Save Changes")}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
