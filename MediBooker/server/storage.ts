import { type User, type InsertUser, type Appointment, type InsertAppointment, type Earnings, type InsertEarnings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Appointment methods
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  getAppointmentsByDate(doctorId: string, date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
  
  // Earnings methods
  getEarningsByDoctor(doctorId: string): Promise<Earnings[]>;
  getEarningsByDoctorAndMonth(doctorId: string, year: number, month: number): Promise<Earnings[]>;
  createEarnings(earnings: InsertEarnings): Promise<Earnings>;
  
  // Stats methods
  getDoctorStats(doctorId: string): Promise<{
    todayAppointments: number;
    totalPatients: number;
    monthlyEarnings: number;
  }>;
  getPatientStats(patientId: string): Promise<{
    upcomingAppointments: number;
    totalAppointments: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private appointments: Map<string, Appointment>;
  private earnings: Map<string, Earnings>;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.earnings = new Map();
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const doctor: User = {
      id: "doctor-1",
      username: "dr.johnson",
      password: "password123",
      role: "doctor",
      fullName: "Dr. Sarah Johnson",
      email: "sarah.johnson@medschedule.com",
      phone: "+1-555-0101",
      specialization: "Cardiologist",
      createdAt: new Date(),
    };

    const patient: User = {
      id: "patient-1",
      username: "john.doe",
      password: "password123", 
      role: "patient",
      fullName: "John Doe",
      email: "john.doe@email.com",
      phone: "+1-555-0201",
      specialization: null,
      createdAt: new Date(),
    };

    this.users.set(doctor.id, doctor);
    this.users.set(patient.id, patient);

    // Create sample appointments
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const appointment1: Appointment = {
      id: "apt-1",
      patientId: patient.id,
      doctorId: doctor.id,
      date: tomorrow,
      time: "10:30",
      type: "consultation",
      status: "confirmed",
      notes: "Regular checkup",
      createdAt: new Date(),
    };

    this.appointments.set(appointment1.id, appointment1);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      specialization: insertUser.specialization || null
    };
    this.users.set(id, user);
    return user;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(apt => apt.patientId === patientId);
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(apt => apt.doctorId === doctorId);
  }

  async getAppointmentsByDate(doctorId: string, date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      apt => apt.doctorId === doctorId && apt.date === date && apt.status !== "cancelled"
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      status: "pending",
      createdAt: new Date(),
      notes: insertAppointment.notes || null
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      appointment.status = status as any;
      this.appointments.set(id, appointment);
      return appointment;
    }
    return undefined;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }

  async getEarningsByDoctor(doctorId: string): Promise<Earnings[]> {
    return Array.from(this.earnings.values()).filter(earning => earning.doctorId === doctorId);
  }

  async getEarningsByDoctorAndMonth(doctorId: string, year: number, month: number): Promise<Earnings[]> {
    return Array.from(this.earnings.values()).filter(earning => {
      const earningDate = new Date(earning.date);
      return earning.doctorId === doctorId && 
             earningDate.getFullYear() === year && 
             earningDate.getMonth() === month - 1;
    });
  }

  async createEarnings(insertEarnings: InsertEarnings): Promise<Earnings> {
    const id = randomUUID();
    const earnings: Earnings = { 
      ...insertEarnings, 
      id, 
      createdAt: new Date(),
      appointmentId: insertEarnings.appointmentId || null
    };
    this.earnings.set(id, earnings);
    return earnings;
  }

  async getDoctorStats(doctorId: string): Promise<{
    todayAppointments: number;
    totalPatients: number;
    monthlyEarnings: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const allAppointments = await this.getAppointmentsByDoctor(doctorId);
    const todayAppointments = allAppointments.filter(apt => apt.date === today && apt.status !== "cancelled").length;
    
    const uniquePatients = new Set(allAppointments.map(apt => apt.patientId));
    const totalPatients = uniquePatients.size;

    const monthlyEarnings = await this.getEarningsByDoctorAndMonth(doctorId, currentYear, currentMonth);
    const totalEarnings = monthlyEarnings.reduce((sum, earning) => sum + earning.amount, 0);

    return {
      todayAppointments,
      totalPatients,
      monthlyEarnings: totalEarnings / 100, // convert from cents to dollars
    };
  }

  async getPatientStats(patientId: string): Promise<{
    upcomingAppointments: number;
    totalAppointments: number;
  }> {
    const allAppointments = await this.getAppointmentsByPatient(patientId);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const upcomingAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= now && apt.status !== "cancelled";
    }).length;

    return {
      upcomingAppointments,
      totalAppointments: allAppointments.length,
    };
  }
}

export const storage = new MemStorage();
