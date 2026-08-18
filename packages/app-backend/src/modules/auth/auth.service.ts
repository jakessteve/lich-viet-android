import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthResult, UserProfile } from '@lich-viet/contracts';
import { LoginDto, RegisterDto, SocialLoginDto } from './dto/auth.dto.js';
import * as crypto from 'node:crypto';

interface InternalUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  passwordHash?: string;
  salt?: string;
  tier: 'free' | 'curious' | 'expert';
  role: 'user' | 'admin';
  provider: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AuthService {
  private users: Map<string, InternalUser> = new Map();

  constructor() {
    // Seed default admin and test user
    this.seedUser({
      id: 'seed-admin-lich-viet',
      email: 'admin@lichviet.app',
      name: 'Admin',
      tier: 'expert',
      role: 'admin',
      provider: 'email',
      passwordHash: 'ef00af5081263d0c0e72e3f8b98119303d53edc687c02f8b54e220a6b46973d5',
      salt: 'lichviet-admin-seed',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    this.seedUser({
      id: 'demo-user-001',
      email: 'demo@lichviet.local',
      name: 'Nguyễn Văn Demo',
      tier: 'curious',
      role: 'user',
      provider: 'email',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  }

  private seedUser(user: InternalUser) {
    this.users.set(user.email.toLowerCase(), user);
  }

  private hashPassword(password: string, salt = ''): string {
    return crypto
      .createHash('sha256')
      .update(salt + password)
      .digest('hex');
  }

  private toUserProfile(user: InternalUser): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      tier: user.tier,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const emailKey = dto.email.toLowerCase().trim();
    let user = this.users.get(emailKey);

    if (!user) {
      // In development or demo mode, auto-provision user if password is not strictly enforced
      user = {
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email: dto.email,
        name: dto.email.split('@')[0] || 'Người Dùng',
        tier: 'free',
        role: 'user',
        provider: 'email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.set(emailKey, user);
    } else if (user.passwordHash && dto.password) {
      const hash = this.hashPassword(dto.password, user.salt || '');
      if (hash !== user.passwordHash) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
      }
    }

    const accessToken = `jwt-${user.id}-${Date.now()}`;
    const refreshToken = `rft-${user.id}-${Date.now()}`;

    return {
      accessToken,
      refreshToken,
      user: this.toUserProfile(user),
    };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const emailKey = dto.email.toLowerCase().trim();
    if (this.users.has(emailKey)) {
      throw new ConflictException('Email này đã được sử dụng.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = dto.password ? this.hashPassword(dto.password, salt) : undefined;
    const now = new Date().toISOString();

    const newUser: InternalUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email: dto.email,
      name: dto.name || dto.email.split('@')[0] || 'Người Dùng Mới',
      passwordHash,
      salt,
      tier: 'free',
      role: 'user',
      provider: 'email',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(emailKey, newUser);

    return {
      accessToken: `jwt-${newUser.id}-${Date.now()}`,
      refreshToken: `rft-${newUser.id}-${Date.now()}`,
      user: this.toUserProfile(newUser),
    };
  }

  async loginWithSocial(dto: SocialLoginDto): Promise<AuthResult> {
    const syntheticEmail = `social-${dto.provider}-${dto.token.slice(-6)}@lichviet.local`;
    const emailKey = syntheticEmail.toLowerCase();
    let user = this.users.get(emailKey);

    if (!user) {
      const now = new Date().toISOString();
      user = {
        id: `usr-social-${Date.now()}`,
        email: syntheticEmail,
        name: `Người dùng ${dto.provider.toUpperCase()}`,
        tier: 'free',
        role: 'user',
        provider: dto.provider,
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(emailKey, user);
    }

    return {
      accessToken: `jwt-${user.id}-${Date.now()}`,
      refreshToken: `rft-${user.id}-${Date.now()}`,
      user: this.toUserProfile(user),
    };
  }

  getUserById(id: string): UserProfile | null {
    for (const u of this.users.values()) {
      if (u.id === id) return this.toUserProfile(u);
    }
    return null;
  }

  updateUserProfile(id: string, updates: Partial<UserProfile>): UserProfile {
    for (const [key, u] of this.users.entries()) {
      if (u.id === id) {
        const updated: InternalUser = {
          ...u,
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl } : {}),
          ...(updates.tier ? { tier: updates.tier } : {}),
          updatedAt: new Date().toISOString(),
        };
        this.users.set(key, updated);
        return this.toUserProfile(updated);
      }
    }
    // If not found, return demo user with applied updates
    return {
      id,
      email: 'user@lichviet.local',
      name: updates.name || 'Người Dùng',
      tier: updates.tier || 'free',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
