import jwt from 'jsonwebtoken';

export class AuthService {
  static async login(email: string, password: string) {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_123456';
    
    // ⚠️ UTILISER `sub` au lieu de `userId`
    const token = jwt.sign(
      { sub: 1, role: 'admin' }, 
      secret,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: 1,
        name: 'Admin Test',
        email: email,
        role: 'admin'
      }
    };
  }
}