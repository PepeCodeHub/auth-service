export interface User {
  id?: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: number;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  created_at?: number;
  updated_at?: number;
}

export interface UserDTO {
  email: string;
  password: string;
}
