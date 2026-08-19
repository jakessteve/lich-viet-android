import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { AuthResult, UserProfile } from '@lich-viet/contracts';
import { LoginDto, RegisterDto, SocialLoginDto } from './dto/auth.dto.js';
import { DatabaseService, DbUser } from '../../db/database.service.js';
import { signJwt } from '../../common/jwt.util.js';
import * as crypto from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private hashPassword(password: string, salt = ''): string {
    return crypto
      .createHash('sha256')
      .update(salt + password)
      .digest('hex');
  }

  private toUserProfile(user: DbUser): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url || undefined,
      tier: (user.tier as 'free' | 'curious' | 'expert') || 'free',
      role: (user.role as 'user' | 'admin') || 'user',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const emailKey = dto.email.toLowerCase().trim();
    let user = this.db.prepare<DbUser>('SELECT * FROM users WHERE email = ?').get(emailKey);

    if (!user) {
      // In development or demo mode, auto-provision user if password is not strictly enforced
      const now = new Date().toISOString();
      const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const name = dto.email.split('@')[0] || 'Người Dùng';
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = dto.password ? this.hashPassword(dto.password, salt) : null;

      this.db
        .prepare(
          `INSERT INTO users (id, email, name, avatar_url, password_hash, salt, tier, role, provider, created_at, updated_at)
           VALUES (?, ?, ?, NULL, ?, ?, 'free', 'user', 'email', ?, ?)`,
        )
        .run(id, emailKey, name, passwordHash, salt, now, now);

      user = this.db.prepare<DbUser>('SELECT * FROM users WHERE id = ?').get(id);
      if (!user) {
        throw new UnauthorizedException('Không thể khởi tạo tài khoản.');
      }
    } else if (user.password_hash && dto.password) {
      const hash = this.hashPassword(dto.password, user.salt || '');
      if (hash !== user.password_hash) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
      }
    }

    const accessToken = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    });
    const refreshToken = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    }, 30 * 86400);

    return {
      accessToken,
      refreshToken,
      user: this.toUserProfile(user),
    };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const emailKey = dto.email.toLowerCase().trim();
    const existing = this.db.prepare<DbUser>('SELECT id FROM users WHERE email = ?').get(emailKey);
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = dto.password ? this.hashPassword(dto.password, salt) : null;
    const now = new Date().toISOString();
    const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const name = dto.name || dto.email.split('@')[0] || 'Người Dùng Mới';

    this.db
      .prepare(
        `INSERT INTO users (id, email, name, avatar_url, password_hash, salt, tier, role, provider, created_at, updated_at)
         VALUES (?, ?, ?, NULL, ?, ?, 'free', 'user', 'email', ?, ?)`,
      )
      .run(id, emailKey, name, passwordHash, salt, now, now);

    const newUser = this.db.prepare<DbUser>('SELECT * FROM users WHERE id = ?').get(id);
    if (!newUser) {
      throw new ConflictException('Không thể hoàn tất đăng ký.');
    }

    const accessToken = signJwt({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tier: newUser.tier,
    });
    const refreshToken = signJwt({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tier: newUser.tier,
    }, 30 * 86400);

    return {
      accessToken,
      refreshToken,
      user: this.toUserProfile(newUser),
    };
  }

  async loginWithSocial(dto: SocialLoginDto): Promise<AuthResult> {
    const syntheticEmail = `social-${dto.provider}-${dto.token.slice(-6)}@lichviet.local`.toLowerCase();
    let user = this.db.prepare<DbUser>('SELECT * FROM users WHERE email = ?').get(syntheticEmail);

    if (!user) {
      const now = new Date().toISOString();
      const id = `usr-social-${Date.now()}`;
      const name = `Người dùng ${dto.provider.toUpperCase()}`;

      this.db
        .prepare(
          `INSERT INTO users (id, email, name, avatar_url, password_hash, salt, tier, role, provider, created_at, updated_at)
           VALUES (?, ?, ?, NULL, NULL, NULL, 'free', 'user', ?, ?, ?)`,
        )
        .run(id, syntheticEmail, name, dto.provider, now, now);

      user = this.db.prepare<DbUser>('SELECT * FROM users WHERE id = ?').get(id);
      if (!user) {
        throw new UnauthorizedException('Không thể khởi tạo phiên đăng nhập mạng xã hội.');
      }
    }

    const accessToken = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    });
    const refreshToken = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    }, 30 * 86400);

    return {
      accessToken,
      refreshToken,
      user: this.toUserProfile(user),
    };
  }

  getUserById(id: string): UserProfile | null {
    const user = this.db.prepare<DbUser>('SELECT * FROM users WHERE id = ?').get(id);
    return user ? this.toUserProfile(user) : null;
  }

  updateUserProfile(id: string, updates: Partial<UserProfile>): UserProfile {
    const existing = this.db.prepare<DbUser>('SELECT * FROM users WHERE id = ?').get(id);
    const now = new Date().toISOString();

    if (existing) {
      const name = updates.name !== undefined ? updates.name : existing.name;
      const avatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : existing.avatar_url;

      this.db
        .prepare('UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?')
        .run(name, avatarUrl, now, id);

      const updated = this.db.prepare<DbUser>('SELECT * FROM users WHERE id = ?').get(id);
      return updated ? this.toUserProfile(updated) : this.toUserProfile(existing);
    }

    return {
      id,
      email: 'user@lichviet.local',
      name: updates.name || 'Người Dùng',
      tier: 'free',
      role: 'user',
      createdAt: now,
      updatedAt: now,
    };
  }
}
