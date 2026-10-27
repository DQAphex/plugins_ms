import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';

import { plugins } from './plugins.schema.js';

export const workspacePlugins = pgTable(
  'workspace_plugins',
  {
    workspacePluginId: uuid('workspace_plugin_id')
      .defaultRandom()
      .primaryKey(),

    workspaceId: uuid('workspace_id')
      .notNull(),

    pluginId: uuid('plugin_id')
      .notNull()
      .references(() => plugins.pluginId, {
        onDelete: 'cascade'
      }),

    installedAt: timestamp('installed_at')
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex('workspace_plugins_unique_idx')
      .on(table.workspaceId, table.pluginId)
  ]
);

export type WorkspacePlugin =
  typeof workspacePlugins.$inferSelect;

export type NewWorkspacePlugin =
  typeof workspacePlugins.$inferInsert;