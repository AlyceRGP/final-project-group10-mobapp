export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserProfile: undefined;
  AdminProfile: undefined;
};

export interface User {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}