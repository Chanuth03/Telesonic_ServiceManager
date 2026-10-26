// Define global process type for standalone execution
declare const process: { exit: (code?: number) => never };

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { initialMobileJobs } from "../src/lib/mobile-data";
import { SAMPLE_SERVICE_REQUESTS } from "../src/data/serviceRequestsSpecData";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed System Roles
  const defaultRoles = [
    {
      code: "ADMIN",
      name: "System Administrator",
      description: "Full administrative access across all modules, dispatch boards and settings",
      permissions: "ALL,USERS_MANAGE,DISPATCH_ALL,FINANCE_ALL,REPORTS_ALL",
      status: "Active",
    },
    {
      code: "TECHNICIAN",
      name: "Field Lead Technician",
      description: "Access to assigned field jobs, part consumption, labor tracking and offline PWA",
      permissions: "JOBS_ASSIGNED,LABOR_LOG,PARTS_CONSUME,PWA_OFFLINE",
      status: "Active",
    },
    {
      code: "COORDINATOR",
      name: "Service Coordinator",
      description: "Call triage, customer inquiries, appointment dispatching and job allocation",
      permissions: "CALL_INTAKE,JOB_CREATE,DISPATCH_SCHEDULE,CUSTOMER_COMM",
      status: "Active",
    },
    {
      code: "SUPERVISOR",
      name: "Regional Technical Supervisor",
      description: "Approves hold requests, warranty signoffs, and high-value parts replacements",
      permissions: "HOLD_APPROVE,INSPECTION_SIGN,REPORT_REGIONAL",
      status: "Active",
    },
  ];

  for (const r of defaultRoles) {
    await prisma.systemRole.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description, permissions: r.permissions },
      create: r,
    });
  }
  console.log("System Roles seeded: " + defaultRoles.length + " roles.");


  // Seed Users
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const techPasswordHash = bcrypt.hashSync("tech123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@telesonic.lk" },
    update: { name: "Nimal Perera (Administrator)", role: "ADMIN" },
    create: {
      email: "admin@telesonic.lk",
      name: "Nimal Perera (Administrator)",
      password: adminPasswordHash,
      role: "ADMIN",
      phone: "+94 11 234 5678",
      status: "Active",
    },
  });

  const tech = await prisma.user.upsert({
    where: { email: "tech@telesonic.lk" },
    update: { name: "Kamal Silva (Field Lead Technician)", role: "TECHNICIAN" },
    create: {
      email: "tech@telesonic.lk",
      name: "Kamal Silva (Field Lead Technician)",
      password: techPasswordHash,
      role: "TECHNICIAN",
      phone: "+94 77 123 4567",
      status: "Active",
    },
  });

  console.log(`Users seeded: ${admin.email}, ${tech.email}`);

  // 2. Seed Jobs
  for (const job of initialMobileJobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        customerName: job.customerName,
        customerContact: job.customerContact || null,
        town: job.town,
        window: job.window,
        priority: job.priority,
        role: job.role,
        status: job.status,
        category: job.category,
        siteName: job.siteName || null,
        siteAddress: job.siteAddress,
        technicianName: job.technicianName,
        scheduledDate: job.scheduledDate,
        syncStatus: "synced",
        syncedAt: new Date(),
        version: 1,
      },
    });
  }
  console.log(`Jobs seeded: ${initialMobileJobs.length} jobs.`);

  // 3. Seed Service Requests
  for (const req of SAMPLE_SERVICE_REQUESTS) {
    await prisma.serviceRequest.upsert({
      where: { id: req.id },
      update: {},
      create: {
        id: req.id,
        title: req.title,
        callType: req.callType,
        customerName: req.customer?.cardName || "Valued Customer",
        status: req.status,
        priority: req.priority,
        assignedTo: (req as any).assignedTo || null,
        scheduledDate: (req as any).scheduledDate || null,
        createdAt: req.createdAt ? new Date(req.createdAt) : new Date(),
      },
    });
  }
  console.log(`Service Requests seeded: ${SAMPLE_SERVICE_REQUESTS.length} requests.`);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
