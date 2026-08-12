import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public defaultWorkspaceId: string = '';

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Đã kết nối PostgreSQL qua Prisma.');
    await this.ensureDefaultUserAndWorkspace();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async ensureDefaultUserAndWorkspace() {
    const defaultEmail = 'default@sitepulse.local';

    let user = await this.user.findUnique({ where: { email: defaultEmail } });
    if (!user) {
      user = await this.user.create({
        data: {
          email: defaultEmail,
          name: 'Default User',
        },
      });
      this.logger.log('Đã tạo Default User.');
    }

    let workspace = await this.workspace.findFirst({
      where: { userId: user.id, name: 'Default Workspace' },
    });

    if (!workspace) {
      workspace = await this.workspace.create({
        data: {
          name: 'Default Workspace',
          userId: user.id,
        },
      });
      this.logger.log('Đã tạo Default Workspace.');
    }

    this.defaultWorkspaceId = workspace.id;
  }
}
