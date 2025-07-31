import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertEarningsSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use proper session management
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          specialization: user.specialization
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Check current session
  app.get("/api/auth/me", async (req, res) => {
    // In a real app, you'd check session/cookie here
    // For demo, we'll return null since we don't have persistent sessions
    res.status(401).json({ message: "No session" });
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointment routes
  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByPatient(req.params.patientId);
      
      // Get doctor details for each appointment
      const appointmentsWithDoctors = await Promise.all(
        appointments.map(async (apt) => {
          const doctor = await storage.getUser(apt.doctorId);
          return { ...apt, doctor };
        })
      );
      
      res.json(appointmentsWithDoctors);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByDoctor(req.params.doctorId);
      
      // Get patient details for each appointment
      const appointmentsWithPatients = await Promise.all(
        appointments.map(async (apt) => {
          const patient = await storage.getUser(apt.patientId);
          return { ...apt, patient };
        })
      );
      
      res.json(appointmentsWithPatients);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/appointments/slots/:doctorId/:date", async (req, res) => {
    try {
      const { doctorId, date } = req.params;
      const bookedAppointments = await storage.getAppointmentsByDate(doctorId, date);
      const bookedTimes = bookedAppointments.map(apt => apt.time);
      
      // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
      const timeSlots = [];
      for (let hour = 9; hour < 17; hour++) {
        for (let minute of [0, 30]) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          timeSlots.push({
            time,
            available: !bookedTimes.includes(time)
          });
        }
      }
      
      res.json(timeSlots);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Check if slot is already booked
      const existingAppointments = await storage.getAppointmentsByDate(
        appointmentData.doctorId, 
        appointmentData.date
      );
      
      const isTimeSlotTaken = existingAppointments.some(apt => apt.time === appointmentData.time);
      if (isTimeSlotTaken) {
        return res.status(409).json({ message: "Time slot is already booked" });
      }
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const appointment = await storage.updateAppointmentStatus(req.params.id, status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const success = await storage.deleteAppointment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Earnings routes
  app.get("/api/earnings/doctor/:doctorId", async (req, res) => {
    try {
      const earnings = await storage.getEarningsByDoctor(req.params.doctorId);
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/earnings/doctor/:doctorId/:year/:month", async (req, res) => {
    try {
      const { doctorId, year, month } = req.params;
      const earnings = await storage.getEarningsByDoctorAndMonth(
        doctorId, 
        parseInt(year), 
        parseInt(month)
      );
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/earnings", async (req, res) => {
    try {
      const earningsData = insertEarningsSchema.parse(req.body);
      const earnings = await storage.createEarnings(earningsData);
      res.status(201).json(earnings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid earnings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Stats routes
  app.get("/api/stats/doctor/:doctorId", async (req, res) => {
    try {
      const stats = await storage.getDoctorStats(req.params.doctorId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stats/patient/:patientId", async (req, res) => {
    try {
      const stats = await storage.getPatientStats(req.params.patientId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
