
import jwt from 'jsonwebtoken';

export class AuthService {
  static async login(email: string, password: string) {
    // BYPASS URGENT POUR DÉBLOQUER PERSONNE 2
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_123456';
    
    // On génère directement un token pour un admin (id: 1, role: 'admin')
    const token = jwt.sign(
      { userId: 1, role: 'admin' },
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



/*

*/