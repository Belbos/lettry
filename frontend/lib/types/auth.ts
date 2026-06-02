export type RegisterRequest = {
  username: string;
  password: string;
  password_confirm: string;
  email: string;
  terms_agreed: boolean;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type ForgotPasswordRequest = {
  username: string;
};

export type ResetPasswordRequest = {
  temp_password: string;
  new_password: string;
  new_password_confirm: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type UserInfo = {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  must_reset_password: boolean;
  created_at: string;
};
