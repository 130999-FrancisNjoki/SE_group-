import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["patient", "doctor"] }).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  specialization: text("specialization"), // for doctors only
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull().references(() => users.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  type: text("type", { enum: ["consultation", "follow-up", "emergency"] }).notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "completed"] }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const earnings = pgTable("earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull().references(() => users.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  amount: integer("amount").notNull(), // in cents
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertEarningsSchema = createInsertSchema(earnings).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertEarnings = z.infer<typeof insertEarningsSchema>;
export type Earnings = typeof earnings.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
