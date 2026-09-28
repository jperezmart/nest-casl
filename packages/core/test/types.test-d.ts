import type { AbilityBuilder, AnyMongoAbility } from '@casl/ability';
import type { DynamicModule } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import type {
  AuthorizableUser,
  CaslModuleOptions,
  RolePermissions,
} from '../src/index.js';
import { CaslModule } from '../src/index.js';

// A consumer that owes nothing to nest-casl: no `id`, Roles handed out by a
// shared identity provider (so the user holds Roles this app never declares),
// and a field of its own the rules scope by.
type Role = 'author' | 'reader';

interface TenantUser {
  username: string;
  roles: string[];
  tenants: string[];
}

const rolePermissions: RolePermissions<Role, TenantUser> = {
  author(user, { can }) {
    expectTypeOf(user).toEqualTypeOf<TenantUser>();
    can('update', 'Doc', { tenant: { $in: user.tenants } });
  },
  reader: true,
};

describe('types', () => {
  it('accepts a user without an id and with Roles the app does not declare', () => {
    expectTypeOf<TenantUser>().toExtend<AuthorizableUser>();
    expectTypeOf<{
      roles: readonly string[];
    }>().toExtend<AuthorizableUser>();
  });

  it('forFeature infers the user and Roles from the Role permissions', () => {
    expectTypeOf(
      CaslModule.forFeature({ permissions: rolePermissions }),
    ).toEqualTypeOf<DynamicModule>();

    CaslModule.forFeature({
      permissions: {
        author(user: TenantUser, { can }: AbilityBuilder<AnyMongoAbility>) {
          can('read', 'Doc', { tenant: { $in: user.tenants } });
        },
      },
    });
  });

  it('rejects a misspelt Role in the Role permissions', () => {
    const wrong: RolePermissions<Role, TenantUser> = {
      // @ts-expect-error — 'autor' is not a Role
      autor: true,
    };
    void wrong;
  });

  it('rejects a misspelt superuser Role', () => {
    // @ts-expect-error — 'amdin' is not a Role
    CaslModule.forRoot<Role | 'admin'>({ superuserRole: 'amdin' });

    const options: CaslModuleOptions<Role | 'admin'> = {
      superuserRole: 'admin',
    };
    void options;
  });

  it('forRootAsync types inject like any Nest async module', () => {
    @Injectable()
    class Config {
      superuser(): string {
        return 'admin';
      }
    }

    CaslModule.forRootAsync({
      inject: [Config, { token: 'OPTIONAL', optional: true }],
      useFactory: (config: Config) => ({ superuserRole: config.superuser() }),
    });

    CaslModule.forRootAsync({
      // @ts-expect-error — 42 is not an injection token
      inject: [42],
      useFactory: () => ({}),
    });
  });
});
