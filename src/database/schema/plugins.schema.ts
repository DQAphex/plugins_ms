import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";

export const plugins = pgTable(
  "plugins",
  {
    pluginId: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // Metadatos del crawler
    name: varchar("name", { length: 100 })
      .notNull(),

    pluginCategory: varchar("plugin_category", {
      length: 100
    })
      .notNull(),

    author: varchar("author", { length: 100 })
      .notNull(),

    email: varchar("email", { length: 254 })
      .notNull(),

    // Repositorio y versión publicada
    repositoryUrl: text("repository_url")
      .notNull(),

    latestVersion: varchar("latest_version", {
      length: 20
    })
      .notNull(),

    releaseTag: varchar("release_tag", {
      length: 50
    })
      .notNull(),

    // Fecha original de creación del plugin
    pluginCreatedAt: timestamp("plugin_created_at", {
      withTimezone: true
    })
      .notNull(),

    // Auditoría del registro en PostgreSQL
    createdAt: timestamp("created_at", {
      withTimezone: true
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true
    })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("plugins_repository_url_uidx")
      .on(table.repositoryUrl)
  ]
);

export type Plugin = typeof plugins.$inferSelect;
export type NewPlugin = typeof plugins.$inferInsert;