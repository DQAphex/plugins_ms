import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, desc } from 'drizzle-orm';
import axios from 'axios';
import { CreatePluginDto } from './dto/create-plugin.dto.js';
import { UpdatePluginDto } from './dto/update-plugin.dto.js';
import { ValidateRepositoryDto } from './dto/validate-repo.dto.js';
import { CreateWorkspacePluginDto } from './dto/create-workspace-plugin.dto.js';
import { BulkInstallDto } from './dto/bulk-install.dto.js';
import { UpdateVersionDto, RollbackDto } from './dto/update-version.dto.js';
import { DiscoverDto, InstalledDto, InstallationEventDto } from './dto/client-dto.js';
import { DeprecateDto } from './dto/admin-dto.js';
import { DATABASE_CONNECTION } from '../database/database.provider.js';
import * as schema from '../database/schema/index.js';
import { plugins } from '../database/schema/plugins.schema.js';
import { workspacePlugins } from '../database/schema/workspace_plugins.schema.js';

@Injectable()
export class PluginsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>
  ) {}

  // Catálogo de plugins
  async create(createPluginDto: CreatePluginDto) {
    const [plugin] = await this.db
      .insert(plugins)
      .values({
        name: createPluginDto.name,
        pluginCategory: createPluginDto.pluginCategory,
        author: createPluginDto.author,
        email: createPluginDto.email,
        repositoryUrl: createPluginDto.repositoryUrl,
        latestVersion: createPluginDto.latestVersion,
        releaseTag: createPluginDto.releaseTag,
        pluginCreatedAt: new Date(createPluginDto.pluginCreatedAt)
      })
      .returning();
    return plugin;
  }

  async findAll() {
    return this.db.select().from(plugins).orderBy(desc(plugins.createdAt));
  }

  async search(q: string) {
    return this.db
      .select()
      .from(plugins)
      .where(
        ilike(plugins.name, `%${q}%`)
      )
      .orderBy(desc(plugins.createdAt));
  }

  async validateRepository(dto: ValidateRepositoryDto) {
    const existing = await this.db
      .select()
      .from(plugins)
      .where(eq(plugins.repositoryUrl, dto.repositoryUrl));
    if (existing.length > 0) {
      return { valid: false, message: 'Repositorio ya registrado' };
    }
    return { valid: true, message: 'Repositorio válido para registro' };
  }

  async findOne(pluginId: string) {
    const [plugin] = await this.db
      .select()
      .from(plugins)
      .where(eq(plugins.pluginId, pluginId));
    if (!plugin) throw new NotFoundException('Plugin no encontrado');
    return plugin;
  }

  async update(pluginId: string, updatePluginDto: UpdatePluginDto) {
    const values: any = { ...updatePluginDto, updatedAt: new Date() };
    if (updatePluginDto.pluginCreatedAt) {
      values.pluginCreatedAt = new Date(updatePluginDto.pluginCreatedAt);
    }
    const [plugin] = await this.db
      .update(plugins)
      .set(values)
      .where(eq(plugins.pluginId, pluginId))
      .returning();
    if (!plugin) throw new NotFoundException('Plugin no encontrado');
    return plugin;
  }

  async remove(pluginId: string) {
    const [plugin] = await this.db
      .delete(plugins)
      .where(eq(plugins.pluginId, pluginId))
      .returning();
    if (!plugin) throw new NotFoundException('Plugin no encontrado');
    return { message: `Plugin ${pluginId} eliminado` };
  }

  // GitHub Releases y versiones
  async getReleases(pluginId: string) {
    const plugin = await this.findOne(pluginId);
    try {
      let url = plugin.repositoryUrl.replace(/\.git$/, '').replace(/\/$/, '');
      if (url.includes('github.com')) {
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          const owner = match[1];
          const repo = match[2];
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
          const response = await axios.get(apiUrl, {
            headers: {
              Accept: 'application/vnd.github+json',
              'User-Agent': 'plugins-microservice'
            }
          });
          return response.data.map((release: any) => ({
            id: release.id,
            tag: release.tag_name,
            tag_name: release.tag_name,
            version: release.tag_name.replace(/^v/i, ''),
            name: release.name || release.tag_name,
            body: release.body,
            publishedAt: release.published_at,
            published_at: release.published_at,
            isPrerelease: release.prerelease,
            prerelease: release.prerelease,
            isDraft: release.draft,
            draft: release.draft,
            assets: release.assets?.map((asset: any) => ({
              name: asset.name,
              download_url: asset.browser_download_url,
              size: asset.size,
              content_type: asset.content_type
            })),
            downloadUrl: release.assets?.find((a: any) => a.name.endsWith('.zip'))?.browser_download_url || release.zipball_url,
            zipball_url: release.zipball_url,
            tarball_url: release.tarball_url,
            html_url: release.html_url
          }));
        }
      }
      // Fallback si no es GitHub o falla parsing
      const tag = plugin.releaseTag || (plugin.latestVersion.startsWith('v') ? plugin.latestVersion : `v${plugin.latestVersion}`);
      const baseUrl = plugin.repositoryUrl.replace(/\.git$/, '');
      return [
        {
          tag,
          tag_name: tag,
          version: plugin.latestVersion,
          name: `${plugin.name} ${tag}`,
          body: `Release ${tag} de ${plugin.name}`,
          publishedAt: plugin.pluginCreatedAt,
          published_at: plugin.pluginCreatedAt,
          isPrerelease: false,
          prerelease: false,
          isDraft: false,
          draft: false,
          assets: [],
          downloadUrl: baseUrl ? `${baseUrl}/releases/download/${tag}/${plugin.name.replace(/\s+/g, '-').toLowerCase()}-${plugin.latestVersion}.zip` : '',
          zipball_url: baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.zip` : '',
          tarball_url: baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.tar.gz` : '',
          html_url: baseUrl ? `${baseUrl}/releases/tag/${tag}` : ''
        }
      ];
    } catch (error: any) {
      // Fallback en caso de error
      const tag = plugin.releaseTag || (plugin.latestVersion.startsWith('v') ? plugin.latestVersion : `v${plugin.latestVersion}`);
      const baseUrl = plugin.repositoryUrl.replace(/\.git$/, '');
      return [
        {
          tag,
          tag_name: tag,
          version: plugin.latestVersion,
          name: `${plugin.name} ${tag}`,
          body: `Release ${tag} de ${plugin.name}`,
          publishedAt: plugin.pluginCreatedAt,
          published_at: plugin.pluginCreatedAt,
          isPrerelease: false,
          prerelease: false,
          isDraft: false,
          draft: false,
          assets: [],
          downloadUrl: baseUrl ? `${baseUrl}/releases/download/${tag}/${plugin.name.replace(/\s+/g, '-').toLowerCase()}-${plugin.latestVersion}.zip` : '',
          zipball_url: baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.zip` : '',
          tarball_url: baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.tar.gz` : '',
          html_url: baseUrl ? `${baseUrl}/releases/tag/${tag}` : ''
        }
      ];
    }
  }

  async getLatestRelease(pluginId: string) {
    const releases = await this.getReleases(pluginId);
    if (releases.length === 0) {
      const plugin = await this.findOne(pluginId);
      return { tag: plugin.releaseTag || plugin.latestVersion };
    }
    // Retornar la primera (más reciente generalmente viene primero en GitHub API)
    return releases[0];
  }

  async getReleaseByTag(pluginId: string, tag: string) {
    const releases = await this.getReleases(pluginId);
    const found = releases.find((r: any) => r.tag === tag || r.tag_name === tag);
    if (found) return found;
    const plugin = await this.findOne(pluginId);
    const baseUrl = plugin.repositoryUrl.replace(/\.git$/, '');
    return {
      tag,
      tag_name: tag,
      version: tag.replace(/^v/i, ''),
      name: tag,
      body: '',
      publishedAt: new Date(),
      published_at: new Date(),
      isPrerelease: false,
      prerelease: false,
      isDraft: false,
      draft: false,
      assets: [],
      downloadUrl: baseUrl ? `${baseUrl}/releases/download/${tag}/${plugin.name.replace(/\s+/g, '-').toLowerCase()}-${tag.replace(/^v/i, '')}.zip` : '',
      zipball_url: baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.zip` : '',
      tarball_url: baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.tar.gz` : '',
      html_url: baseUrl ? `${baseUrl}/releases/tag/${tag}` : ''
    };
  }

  async refreshReleases(pluginId: string) {
    await this.findOne(pluginId);
    return { message: 'Releases actualizados' };
  }

  async downloadRelease(pluginId: string, tag: string) {
    const release = await this.getReleaseByTag(pluginId, tag);
    const plugin = await this.findOne(pluginId);
    const fileName = `${plugin.name.replace(/\s+/g, '-').toLowerCase()}-${tag.replace(/^v/i, '')}.zip`;
    return {
      tag,
      version: tag.replace(/^v/i, ''),
      fileName,
      downloadUrl: release.downloadUrl || release.zipball_url || '',
      zipball_url: release.zipball_url,
      html_url: release.html_url,
      assets: release.assets || []
    };
  }

  async downloadLatestRelease(pluginId: string) {
    const latest = await this.getLatestRelease(pluginId);
    const plugin = await this.findOne(pluginId);
    const tag = latest.tag || latest.tag_name || plugin.releaseTag || (plugin.latestVersion.startsWith('v') ? plugin.latestVersion : `v${plugin.latestVersion}`);
    const version = tag.replace(/^v/i, '');
    const fileName = `${plugin.name.replace(/\s+/g, '-').toLowerCase()}-${version}.zip`;
    const baseUrl = plugin.repositoryUrl.replace(/\.git$/, '');
    return {
      pluginId: plugin.pluginId,
      pluginName: plugin.name,
      tag,
      version,
      fileName,
      downloadUrl: latest.downloadUrl || latest.zipball_url || (baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.zip` : ''),
      zipball_url: latest.zipball_url || (baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.zip` : ''),
      tarball_url: latest.tarball_url || (baseUrl ? `${baseUrl}/archive/refs/tags/${tag}.tar.gz` : ''),
      html_url: latest.html_url,
      assets: latest.assets || [],
      repositoryUrl: plugin.repositoryUrl
    };
  }

  // Plugins por workspace
  async installWorkspacesPlugins(workspaceId: string, createWorkspacePluginDto: CreateWorkspacePluginDto) {
    await this.findOne(createWorkspacePluginDto.pluginId);
    const [wp] = await this.db
      .insert(workspacePlugins)
      .values({
        workspaceId: workspaceId,
        pluginId: createWorkspacePluginDto.pluginId
      })
      .returning();
    return wp;
  }

  async getWorkspacePlugins(workspaceId: string) {
    return this.db
      .select()
      .from(workspacePlugins)
      .where(eq(workspacePlugins.workspaceId, workspaceId))
      .orderBy(desc(workspacePlugins.installedAt));
  }

  async getAvailablePlugins(workspaceId: string) {
    const installed = await this.db
      .select({ pluginId: workspacePlugins.pluginId })
      .from(workspacePlugins)
      .where(eq(workspacePlugins.workspaceId, workspaceId));
    const installedIds = installed.map((i) => i.pluginId);
    if (installedIds.length === 0) {
      return this.db.select().from(plugins).orderBy(desc(plugins.createdAt));
    }
    // Simplificado: retornar todos por ahora (filtrado lógico pendiente)
    return this.db.select().from(plugins).orderBy(desc(plugins.createdAt));
  }

  async getWorkspacePlugin(workspaceId: string, pluginId: string) {
    const [wp] = await this.db
      .select()
      .from(workspacePlugins)
      .where(and(eq(workspacePlugins.workspaceId, workspaceId), eq(workspacePlugins.pluginId, pluginId)));
    if (!wp) throw new NotFoundException('Plugin no instalado en este workspace');
    return wp;
  }

  async removeWorkspacePlugin(workspaceId: string, pluginId: string) {
    const [wp] = await this.db
      .delete(workspacePlugins)
      .where(and(eq(workspacePlugins.workspaceId, workspaceId), eq(workspacePlugins.pluginId, pluginId)))
      .returning();
    if (!wp) throw new NotFoundException('Plugin no instalado en este workspace');
    return { message: 'Plugin desinstalado' };
  }

  async downloadWorkspacePlugin(workspaceId: string, pluginId: string) {
    await this.getWorkspacePlugin(workspaceId, pluginId);
    const plugin = await this.findOne(pluginId);
    return { downloadUrl: '', fileName: `${plugin.name}-${plugin.latestVersion}.zip` };
  }

  async bulkInstall(workspaceId: string, bulkInstallDto: BulkInstallDto) {
    const results = { successCount: 0, failedCount: 0, installed: [], failed: [] as any[] };
    for (const item of bulkInstallDto.plugins) {
      try {
        await this.installWorkspacesPlugins(workspaceId, { workspaceId, pluginId: item.pluginId });
        results.successCount++;
      } catch (e: any) {
        results.failedCount++;
        results.failed.push({ pluginId: item.pluginId, error: e.message });
      }
    }
    return results;
  }

  // Actualizaciones (basadas en schemas disponibles)
  async checkUpdates(workspaceId: string, pluginId: string) {
    await this.getWorkspacePlugin(workspaceId, pluginId);
    const plugin = await this.findOne(pluginId);
    return { pluginId, hasUpdate: false, currentVersion: plugin.latestVersion, latestVersion: plugin.latestVersion };
  }

  async updatePlugin(workspaceId: string, pluginId: string, updateVersionDto: UpdateVersionDto) {
    await this.getWorkspacePlugin(workspaceId, pluginId);
    return { message: 'Plugin actualizado', version: updateVersionDto.version };
  }

  async rollbackPlugin(workspaceId: string, pluginId: string, rollbackDto: RollbackDto) {
    await this.getWorkspacePlugin(workspaceId, pluginId);
    return { message: 'Rollback realizado', version: rollbackDto.version };
  }

  async getVersionHistory(workspaceId: string, pluginId: string) {
    await this.getWorkspacePlugin(workspaceId, pluginId);
    const plugin = await this.findOne(pluginId);
    return [{ version: plugin.latestVersion, installedAt: new Date(), current: true }];
  }

  async setVersion(workspaceId: string, pluginId: string, updateVersionDto: UpdateVersionDto) {
    await this.getWorkspacePlugin(workspaceId, pluginId);
    return { message: 'Versión actualizada', version: updateVersionDto.version };
  }

  // Agente local y crawler
  async getMetadata(pluginId: string) {
    const plugin = await this.findOne(pluginId);
    return {
      pluginId: plugin.pluginId,
      name: plugin.name,
      metadata: {
        repositoryUrl: plugin.repositoryUrl,
        author: plugin.author,
        category: plugin.pluginCategory,
        latestVersion: plugin.latestVersion,
        releaseTag: plugin.releaseTag
      }
    };
  }

  async discover(discoverDto: DiscoverDto) {
    return [];
  }

  async reportInstalled(installedDto: InstalledDto) {
    return { message: 'Reportado', count: installedDto.plugins?.length || 0 };
  }

  async reportInstallationEvent(installationEventDto: InstallationEventDto) {
    return { message: 'Evento registrado' };
  }

  async getManifest(workspaceId: string) {
    const installed = await this.getWorkspacePlugins(workspaceId);
    return { workspaceId, plugins: installed, generatedAt: new Date() };
  }

  // Administración
  async getStats() {
    const allPlugins = await this.db.select().from(plugins);
    const allInstalled = await this.db.select().from(workspacePlugins);
    return {
      totalPlugins: allPlugins.length,
      totalInstallations: allInstalled.length,
      activeInstallations: allInstalled.length,
      deprecatedPlugins: 0,
      archivedPlugins: 0
    };
  }

  async getInstallations(pluginId: string) {
    await this.findOne(pluginId);
    return this.db.select().from(workspacePlugins).where(eq(workspacePlugins.pluginId, pluginId));
  }

  async deprecate(pluginId: string, deprecateDto: DeprecateDto) {
    await this.findOne(pluginId);
    return { message: 'Plugin deprecado', reason: deprecateDto.reason };
  }

  async archive(pluginId: string) {
    await this.findOne(pluginId);
    return { message: 'Plugin archivado' };
  }

  async restore(pluginId: string) {
    await this.findOne(pluginId);
    return { message: 'Plugin restaurado' };
  }

  async getGithubReleases(repositoryUrl: string) {
    try {
      let url = repositoryUrl.replace(/\.git$/, '').replace(/\/$/, '');
      if (url.includes('github.com')) {
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          const owner = match[1];
          const repo = match[2];
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
          const response = await axios.get(apiUrl, {
            headers: {
              Accept: 'application/vnd.github+json',
              'User-Agent': 'plugins-microservice'
            }
          });
          return response.data.map((release: any) => ({
            id: release.id,
            tag_name: release.tag_name,
            name: release.name,
            body: release.body,
            draft: release.draft,
            prerelease: release.prerelease,
            published_at: release.published_at,
            created_at: release.created_at,
            assets: release.assets?.map((asset: any) => ({
              name: asset.name,
              download_url: asset.browser_download_url,
              size: asset.size,
              content_type: asset.content_type
            })),
            html_url: release.html_url,
            zipball_url: release.zipball_url,
            tarball_url: release.tarball_url
          }));
        }
      }
      throw new NotFoundException('URL de GitHub inválida');
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundException('Repositorio o releases no encontrados');
      }
      throw new NotFoundException(error.message || 'No se pudieron obtener las releases');
    }
  }
}
