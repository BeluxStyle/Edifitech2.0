// utils/auth.ts
export const requireAuth = (resolver) => {
    return async (parent, args, context, info) => {
      if (!context.session) {
        throw new Error('No autenticado');
      }
      
      return resolver(parent, args, context, info);
    };
  };
  
  // Para verificación de roles específicos
  export const requireRole = (roles) => (resolver) => {
    return async (parent, args, context, info) => {
      if (!context.session) {
        throw new Error('No autenticado');
      }
      
      const userRole = context.session.user.role;
      if (!roles.includes(userRole)) {
        throw new Error(`Se requiere uno de estos roles: ${roles.join(', ')}`);
      }
      
      return resolver(parent, args, context, info);
    };
  };