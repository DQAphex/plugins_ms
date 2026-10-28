import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PluginsService } from './plugins.service.js';
import { CreatePluginDto } from './dto/create-plugin.dto.js';
import { UpdatePluginDto } from './dto/update-plugin.dto.js';
import { PluginResponseDto } from './dto/plugin-response.dto.js';
import { ValidateRepositoryDto } from './dto/validate-repo.dto.js';
import { SearchQueryDto } from './dto/search-query.dto.js';
import { CreateWorkspacePluginDto } from './dto/create-workspace-plugin.dto.js';
import { WorkspacePluginResponseDto } from './dto/workspace-plugin-response.dto.js';
import { BulkInstallDto } from './dto/bulk-install.dto.js';
import { UpdateVersionDto, RollbackDto } from './dto/update-version.dto.js';
import { DiscoverDto, InstalledDto, InstallationEventDto } from './dto/client-dto.js';
import { DeprecateDto } from './dto/admin-dto.js';
import { GithubUrlDto } from './dto/github-url.dto.js';

@ApiTags('Plugins')
@Controller()
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  // Catálogo de plugins
  @Post('plugins')
  @ApiOperation({ summary: 'Crear plugin en catálogo' })
  @ApiResponse({ status: 201, type: PluginResponseDto })
  create(@Body() createPluginDto: CreatePluginDto) {
    return this.pluginsService.create(createPluginDto);
  }

  @Get('plugins')
  @ApiOperation({ summary: 'Listar plugins del catálogo' })
  @ApiResponse({ status: 200, type: [PluginResponseDto] })
  findAll() {
    return this.pluginsService.findAll();
  }

  @Get('plugins/search')
  @ApiOperation({ summary: 'Buscar plugins' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiResponse({ status: 200, type: [PluginResponseDto] })
  search(@Query() query: SearchQueryDto) {
    return this.pluginsService.search(query.q);
  }

  @Post('plugins/validate-repository')
  @ApiOperation({ summary: 'Validar repositorio de GitHub' })
  @ApiResponse({ status: 200 })
  validateRepository(@Body() dto: ValidateRepositoryDto) {
    return this.pluginsService.validateRepository(dto);
  }

  @Post('plugins/github/releases')
  @ApiOperation({ summary: 'Revisar todas las release tags desde un link de GitHub' })
  @ApiResponse({ status: 200 })
  getGithubReleases(@Body() dto: GithubUrlDto) {
    return this.pluginsService.getGithubReleases(dto.repositoryUrl);
  }

  @Get('plugins/:pluginId')
  @ApiOperation({ summary: 'Obtener plugin por ID' })
  @ApiParam({ name: 'pluginId' })
  @ApiResponse({ status: 200, type: PluginResponseDto })
  findOne(@Param('pluginId') pluginId: string) {
    return this.pluginsService.findOne(pluginId);
  }

  @Patch('plugins/:pluginId')
  @ApiOperation({ summary: 'Actualizar plugin' })
  @ApiParam({ name: 'pluginId' })
  @ApiResponse({ status: 200, type: PluginResponseDto })
  update(@Param('pluginId') pluginId: string, @Body() updatePluginDto: UpdatePluginDto) {
    return this.pluginsService.update(pluginId, updatePluginDto);
  }

  @Delete('plugins/:pluginId')
  @ApiOperation({ summary: 'Eliminar plugin' })
  @ApiParam({ name: 'pluginId' })
  @ApiResponse({ status: 200 })
  remove(@Param('pluginId') pluginId: string) {
    return this.pluginsService.remove(pluginId);
  }

  // GitHub Releases y versiones
  @Get('plugins/:pluginId/releases')
  @ApiOperation({ summary: 'Listar releases del plugin' })
  @ApiParam({ name: 'pluginId' })
  getReleases(@Param('pluginId') pluginId: string) {
    return this.pluginsService.getReleases(pluginId);
  }

  @Get('plugins/:pluginId/releases/latest')
  @ApiOperation({ summary: 'Obtener última release' })
  @ApiParam({ name: 'pluginId' })
  getLatestRelease(@Param('pluginId') pluginId: string) {
    return this.pluginsService.getLatestRelease(pluginId);
  }

  @Get('plugins/:pluginId/releases/:tag')
  @ApiOperation({ summary: 'Obtener release por tag' })
  @ApiParam({ name: 'pluginId' })
  @ApiParam({ name: 'tag' })
  getReleaseByTag(@Param('pluginId') pluginId: string, @Param('tag') tag: string) {
    return this.pluginsService.getReleaseByTag(pluginId, tag);
  }

  @Post('plugins/:pluginId/refresh-releases')
  @ApiOperation({ summary: 'Actualizar releases desde GitHub' })
  @ApiParam({ name: 'pluginId' })
  refreshReleases(@Param('pluginId') pluginId: string) {
    return this.pluginsService.refreshReleases(pluginId);
  }

  @Get('plugins/:pluginId/download/latest')
  @ApiOperation({ summary: 'Descargar zip de la última release del plugin' })
  @ApiParam({ name: 'pluginId' })
  @ApiResponse({ status: 200 })
  downloadLatestRelease(@Param('pluginId') pluginId: string) {
    return this.pluginsService.downloadLatestRelease(pluginId);
  }

  @Get('plugins/:pluginId/releases/:tag/download')
  @ApiOperation({ summary: '[Sin Uso] Descargar release' })
  @ApiParam({ name: 'pluginId' })
  @ApiParam({ name: 'tag' })
  downloadRelease(@Param('pluginId') pluginId: string, @Param('tag') tag: string) {
    return this.pluginsService.downloadRelease(pluginId, tag);
  }

  // Plugins por workspace
  @Post('workspaces/:workspaceId/plugins')
  @ApiOperation({ summary: 'Instalar plugin en workspace' })
  @ApiParam({ name: 'workspaceId' })
  @ApiResponse({ status: 201, type: WorkspacePluginResponseDto })
  installPlugin(
    @Param('workspaceId') workspaceId: string,
    @Body() createWorkspacePluginDto: CreateWorkspacePluginDto
  ) {
    return this.pluginsService.installWorkspacesPlugins(workspaceId, createWorkspacePluginDto);
  }

  @Get('workspaces/:workspaceId/plugins')
  @ApiOperation({ summary: 'Listar plugins instalados en workspace' })
  @ApiParam({ name: 'workspaceId' })
  @ApiResponse({ status: 200, type: [WorkspacePluginResponseDto] })
  getWorkspacePlugins(@Param('workspaceId') workspaceId: string) {
    return this.pluginsService.getWorkspacePlugins(workspaceId);
  }

  @Get('workspaces/:workspaceId/plugins/available')
  @ApiOperation({ summary: 'Listar plugins disponibles para instalar' })
  @ApiParam({ name: 'workspaceId' })
  @ApiResponse({ status: 200, type: [PluginResponseDto] })
  getAvailablePlugins(@Param('workspaceId') workspaceId: string) {
    return this.pluginsService.getAvailablePlugins(workspaceId);
  }

  @Get('workspaces/:workspaceId/plugins/:pluginId')
  @ApiOperation({ summary: 'Obtener plugin instalado en workspace' })
  @ApiParam({ name: 'workspaceId' })
  @ApiParam({ name: 'pluginId' })
  @ApiResponse({ status: 200, type: WorkspacePluginResponseDto })
  getWorkspacePlugin(
    @Param('workspaceId') workspaceId: string,
    @Param('pluginId') pluginId: string
  ) {
    return this.pluginsService.getWorkspacePlugin(workspaceId, pluginId);
  }

  @Delete('workspaces/:workspaceId/plugins/:pluginId')
  @ApiOperation({ summary: 'Desinstalar plugin de workspace' })
  @ApiParam({ name: 'workspaceId' })
  @ApiParam({ name: 'pluginId' })
  removeWorkspacePlugin(
    @Param('workspaceId') workspaceId: string,
    @Param('pluginId') pluginId: string
  ) {
    return this.pluginsService.removeWorkspacePlugin(workspaceId, pluginId);
  }

  @Post('workspaces/:workspaceId/plugins/:pluginId/download')
  @ApiOperation({ summary: 'Descargar plugin instalado' })
  @ApiParam({ name: 'workspaceId' })
  @ApiParam({ name: 'pluginId' })
  downloadWorkspacePlugin(
    @Param('workspaceId') workspaceId: string,
    @Param('pluginId') pluginId: string
  ) {
    return this.pluginsService.downloadWorkspacePlugin(workspaceId, pluginId);
  }

  @Post('workspaces/:workspaceId/plugins/bulk')
  @ApiOperation({ summary: 'Instalación masiva de plugins' })
  @ApiParam({ name: 'workspaceId' })
  bulkInstall(@Param('workspaceId') workspaceId: string, @Body() bulkInstallDto: BulkInstallDto) {
    return this.pluginsService.bulkInstall(workspaceId, bulkInstallDto);
  }

  // Actualizaciones
  @Get('workspaces/:workspaceId/plugins/:pluginId/updates')
  @ApiOperation({ summary: 'Verificar actualizaciones disponibles' })
  @ApiParam({ name: 'workspaceId' })
  @ApiParam({ name: 'pluginId' })
  checkUpdates(
    @Param('workspaceId') workspaceId: string,
    @Param('pluginId') pluginId: string
  ) {
    return this.pluginsService.checkUpdates(workspaceId, pluginId);
  }

  @Post('workspaces/:workspaceId/plugins/:pluginId/update')
  @ApiOperation({ summary: 'Actualizar plugin' })
  @ApiParam({ name: 'workspaceId' })
  @ApiParam({ name: 'pluginId' })
  updatePlugin(
    @Param('workspaceId') workspaceId: string,
    @Param('pluginId') pluginId: string,
    @Body() updateVersionDto: UpdateVersionDto
  ) {
    return this.pluginsService.updatePlugin(workspaceId, pluginId, updateVersionDto);
  }

  @Post('workspaces/:workspaceId/plugins/:pluginId/rollback')
  @ApiOperation({ summary: 'Rollback de plugin' })
  @ApiParam({ name: 'workspaceId' })
  @ApiParam({ name: 'pluginId' })
  rollbackPlugin(
    @Param('workspaceId') workspaceId: string,
    @Param('pluginId') pluginId: string,
    @Body() rollbackDto: RollbackDto
  ) {
    return this.pluginsService.rollbackPlugin(workspaceId, pluginId, rollbackDto);
  }

  @Get('workspaces/:workspaceId/plugins/:pluginId/versions')
  @ApiOperation({ summary: 'Historial de versiones' })
  @ApiParam({ name: 'workspaceId' })
  @ApiParam({ name: 'pluginId' })
  getVersionHistory(
    @Param('workspaceId') workspaceId: string,
    @Param('pluginId') pluginId: string
  ) {
    return this.pluginsService.getVersionHistory(workspaceId, pluginId);
  }

  @Put('workspaces/:workspaceId/plugins/:pluginId/version')
  @ApiOperation({ summary: 'Cambiar versión del plugin' })
  @ApiParam({ name: 'workspaceId' })
  @ApiParam({ name: 'pluginId' })
  setVersion(
    @Param('workspaceId') workspaceId: string,
    @Param('pluginId') pluginId: string,
    @Body() updateVersionDto: UpdateVersionDto
  ) {
    return this.pluginsService.setVersion(workspaceId, pluginId, updateVersionDto);
  }

  // Agente local y crawler
  @Get('plugins/:pluginId/metadata')
  @ApiOperation({ summary: 'Obtener metadata del plugin' })
  @ApiParam({ name: 'pluginId' })
  getMetadata(@Param('pluginId') pluginId: string) {
    return this.pluginsService.getMetadata(pluginId);
  }

  @Post('client/plugins/discover')
  @ApiOperation({ summary: 'Descubrir plugins' })
  discover(@Body() discoverDto: DiscoverDto) {
    return this.pluginsService.discover(discoverDto);
  }

  @Post('client/plugins/installed')
  @ApiOperation({ summary: 'Reportar plugins instalados' })
  reportInstalled(@Body() installedDto: InstalledDto) {
    return this.pluginsService.reportInstalled(installedDto);
  }

  @Post('client/plugins/installation-events')
  @ApiOperation({ summary: 'Reportar eventos de instalación' })
  reportInstallationEvent(@Body() installationEventDto: InstallationEventDto) {
    return this.pluginsService.reportInstallationEvent(installationEventDto);
  }

  @Get('client/workspaces/:workspaceId/plugins/manifest')
  @ApiOperation({ summary: 'Obtener manifest del workspace' })
  @ApiParam({ name: 'workspaceId' })
  getManifest(@Param('workspaceId') workspaceId: string) {
    return this.pluginsService.getManifest(workspaceId);
  }

  // Administración
  @Get('admin/plugins/stats')
  @ApiOperation({ summary: 'Estadísticas de plugins' })
  getStats() {
    return this.pluginsService.getStats();
  }

  @Get('admin/plugins/:pluginId/installations')
  @ApiOperation({ summary: 'Instalaciones de un plugin' })
  @ApiParam({ name: 'pluginId' })
  getInstallations(@Param('pluginId') pluginId: string) {
    return this.pluginsService.getInstallations(pluginId);
  }

  @Post('admin/plugins/:pluginId/deprecate')
  @ApiOperation({ summary: 'Deprecar plugin' })
  @ApiParam({ name: 'pluginId' })
  deprecate(@Param('pluginId') pluginId: string, @Body() deprecateDto: DeprecateDto) {
    return this.pluginsService.deprecate(pluginId, deprecateDto);
  }

  @Post('admin/plugins/:pluginId/archive')
  @ApiOperation({ summary: 'Archivar plugin' })
  @ApiParam({ name: 'pluginId' })
  archive(@Param('pluginId') pluginId: string) {
    return this.pluginsService.archive(pluginId);
  }

  @Post('admin/plugins/:pluginId/restore')
  @ApiOperation({ summary: 'Restaurar plugin' })
  @ApiParam({ name: 'pluginId' })
  restore(@Param('pluginId') pluginId: string) {
    return this.pluginsService.restore(pluginId);
  }
}
