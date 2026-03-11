import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components/index";

export default function SettingsOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const settingsCategories = [
    { title: t("settings.general", "General Settings"), icon: "pi pi-cog", path: "/settings/general", description: t("settings.generalDesc", " Fuel station information and basic Configuration") },
    { title: t("settings.userManagement", "User Management"), icon: "pi pi-users", path: "/settings/users", description: t("settings.userDesc", "Manage users, roles, and permissions") },
    { title: t("settings.academicYear", "Academic Year"), icon: "pi pi-calendar", path: "/settings/academic-year", description: t("settings.yearDesc", "Configure academic years and sessions") },
  ];

  return (
    <div>
      <PageHeader title={t("mis.settings.title", "Settings")} subtitle={t("mis.settings.subtitle", "System configuration and preferences")} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category, index) => (
          <button
            key={index}
            onClick={() => navigate(category.path)}
            className="rounded-xl bg-white p-6 text-left shadow-sm transition hover:shadow-md dark:bg-gray-800"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
              <i className={`${category.icon} text-xl`}></i>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{category.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
