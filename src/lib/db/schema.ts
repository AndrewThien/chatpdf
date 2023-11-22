import {integer, pgEnum, pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core"

export const userSystemEnum = pgEnum("user_system_enum", ["system", "user"])

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  user_id: varchar("user_id", {length:256}).notNull(),
})

export const chats = pgTable("chats", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(()=>users.id).notNull(),
    pdf_name: text("pdf_name").notNull(),
    pdf_url: text("pdf_url").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    file_key: text("file_key").notNull(),
})

export type DrizzleChat = typeof chats.$inferSelect

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").references(()=>chats.id).notNull(),
    content: text("content").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    role: userSystemEnum("role").notNull()
})


export const userSubscriptions = pgTable("user_subscriptions", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull().unique(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 256 })
      .notNull()
      .unique(),
    stripeSubscriptionId: varchar("stripe_subscription_id", {
      length: 256,
    }).unique(),
    stripePriceId: varchar("stripe_price_id", { length: 256 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_ended_at"),
  });