// Placeholder - Auth service will be implemented in auth milestone
export const authService = {
  login: async (_email: string, _password: string) => {
    throw new Error("Not implemented");
  },
  register: async (_email: string, _password: string, _name: string) => {
    throw new Error("Not implemented");
  },
  logout: async () => {
    throw new Error("Not implemented");
  },
  getCurrentUser: () => null,
};
