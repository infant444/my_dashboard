export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  position?: string;
  first_login?: boolean | string;
  role: 'staff' | 'admin' | 'superAdmin';
  is_active: boolean;
}

export type UserType = User;