// Types
export interface ShopSettings {
  shop_name: string;
  phone_number: string;
  contact_email: string;
  address: string;
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password?: string;
  from_email: string;
}

export interface LogoSettings {
  logo: string | null;
}

export interface Setting {
  logo_settings: LogoSettings;
  email_settings: EmailSettings;
  shop_settings: ShopSettings;
}
