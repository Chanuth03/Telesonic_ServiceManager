import bcrypt from "bcryptjs";
/**
 * API Route Handler
 *
 * Handles /api/sync, /api/jobs, /api/service-requests, /api/stats.
 * Connects directly to PostgreSQL (via Prisma).
 */

import { prisma, PrismaJobRecord } from "@/lib/prisma";
import { handleLoginRequest } from "./auth-handler";

export interface SyncRequestBody {
  role: string;
  deviceId: string;
  timestamp: string;
  queueItems?: Array<{
    id?: number;
    action: string;
    entityId: string;
    payload: Record<string, unknown>;
    createdAt: number;
  }>;
  pendingJobs?: PrismaJobRecord[];
}

export interface SyncResponseBody {
  success: boolean;
  message: string;
  batchId: string;
  serverTimestamp: string;
  syncedCount: number;
  syncedJobIds: string[];
  processedQueueIds: number[];
}

export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Set CORS and JSON headers
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth-Role, X-Device-Id",
  });

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // 0. /api/auth/login or /api/login — Secure Authentication Endpoint
    if ((path === "/api/auth/login" || path === "/api/login") && method === "POST") {
      return await handleLoginRequest(request);
    }

    // 1. /api/sync — Synchronization endpoint for Dexie.js offline records to PostgreSQL
    if (path === "/api/sync" && method === "POST") {
      const authRole = request.headers.get("x-auth-role") || "TECHNICIAN";
      const deviceId = request.headers.get("x-device-id") || "DEVICE-DEFAULT";

      let body: SyncRequestBody;
      try {
        body = await request.json();
      } catch {
        body = { role: authRole, deviceId, timestamp: new Date().toISOString() };
      }

      const syncedJobIds: string[] = [];
      const processedQueueIds: number[] = [];
      const now = new Date().toISOString();
      const batchId = `SYNC-BATCH-${Date.now().toString(36).toUpperCase()}`;

      // 1. Process queued mutations
      if (body.queueItems && body.queueItems.length > 0) {
        for (const item of body.queueItems) {
          if (item.action === "UPDATE_STATUS") {
            const rawStatus = (item.payload as Record<string, unknown> | undefined)?.["status"];
            const statusStr = typeof rawStatus === "string" ? rawStatus : "In Progress";
            await prisma.job.upsert({
              where: { id: item.entityId },
              create: {
                id: item.entityId,
                customerName: ((item.payload as Record<string, unknown> | undefined)?.["customerName"] as string) || "Unknown",
                town: ((item.payload as Record<string, unknown> | undefined)?.["town"] as string) || "Unknown",
                window: ((item.payload as Record<string, unknown> | undefined)?.["window"] as string) || "Morning",
                priority: ((item.payload as Record<string, unknown> | undefined)?.["priority"] as string) || "medium",
                jobType: ((item.payload as Record<string, unknown> | undefined)?.["jobType"] as string) || "Repair",
                stage: ((item.payload as Record<string, unknown> | undefined)?.["stage"] as string) || "assigned",
                status: statusStr,
                updatedAt: now,
                syncStatus: "synced",
              } as any,
              update: {
                status: statusStr,
                updatedAt: now,
                syncStatus: "synced",
              },
            });
            syncedJobIds.push(item.entityId);
          } else if (item.action === "GENERIC_UPDATE" && item.payload) {
            await prisma.job.upsert({
              where: { id: item.entityId },
              create: item.payload as any,
              update: item.payload as any,
            });
            syncedJobIds.push(item.entityId);
          }

          if (item.id !== undefined) {
            processedQueueIds.push(item.id);
          }
        }
      }

      // 2. Process pending jobs
      if (body.pendingJobs && body.pendingJobs.length > 0) {
        for (const job of body.pendingJobs) {
          await prisma.job.upsert({
            where: { id: job.id },
            create: {
              ...job,
              syncStatus: "synced",
              syncedAt: now,
            },
            update: {
              ...job,
              syncStatus: "synced",
              syncedAt: now,
            },
          });
          if (!syncedJobIds.includes(job.id)) {
            syncedJobIds.push(job.id);
          }
        }
      }

      // 3. Record Sync Audit Log in PostgreSQL
      const syncedCount = syncedJobIds.length + processedQueueIds.length;
      await prisma.syncLog.create({
        data: {
          batchId,
          role: authRole,
          deviceId: body.deviceId || deviceId,
          itemCount: syncedCount,
          status: "SUCCESS",
          details: `Processed ${syncedJobIds.length} job updates & ${processedQueueIds.length} queue items from Dexie.js offline PWA storage`,
        },
      });

      const responsePayload: SyncResponseBody = {
        success: true,
        message: `Successfully synchronized ${syncedCount} records to PostgreSQL`,
        batchId,
        serverTimestamp: now,
        syncedCount,
        syncedJobIds,
        processedQueueIds,
      };

      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers,
      });
    }

    // 2. /api/jobs — Fetch or create jobs in PostgreSQL
    if (path === "/api/jobs") {
      if (method === "GET") {
        const jobs = await prisma.job.findMany({
          orderBy: { updatedAt: "desc" },
        });
        return new Response(
          JSON.stringify({
            success: true,
            source: "PostgreSQL (via Prisma)",
            count: jobs.length,
            jobs,
          }),
          { status: 200, headers },
        );
      }

      if (method === "POST") {
        const payload = await request.json();
        const created = await prisma.job.create({ data: payload });
        return new Response(JSON.stringify({ success: true, job: created }), {
          status: 201,
          headers,
        });
      }
    }

    // 3. /api/service-requests — Fetch service requests from PostgreSQL
    if (path === "/api/service-requests" && method === "GET") {
      const requests = await prisma.serviceRequest.findMany();
      return new Response(
        JSON.stringify({
          success: true,
          source: "PostgreSQL (via Prisma)",
          count: requests.length,
          requests,
        }),
        { status: 200, headers },
      );
    }

    // 4. /api/stats — Get PostgreSQL database status & sync history
    if (path === "/api/stats" && method === "GET") {
      const jobCount = await prisma.job.count();
      const requestCount = await prisma.serviceRequest.count();
      const syncLogs = await prisma.syncLog.findMany({ take: 10 });

      return new Response(
        JSON.stringify({
          database: "PostgreSQL 16",
          orm: "Prisma Client (PostgreSQL DataSource)",
                              status: "CONNECTED",
          counts: {
            jobs: jobCount,
            serviceRequests: requestCount,
            syncLogs: syncLogs.length,
          },
          recentSyncLogs: syncLogs,
        }),
        { status: 200, headers },
      );
    }

    
    // 5. /api/roles — System Role Master CRUD connected to PostgreSQL
    if (path === "/api/roles") {
      if (method === "GET") {
        const roles = await prisma.systemRole.findMany({
          orderBy: { createdAt: "desc" },
        });
        return new Response(JSON.stringify({ success: true, roles }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const code = String(body.code || "").toUpperCase().trim();
        const name = String(body.name || code);
        if (!code || !name) {
          return new Response(JSON.stringify({ error: "Role Code and Name are mandatory" }), { status: 400, headers });
        }
        const created = await prisma.systemRole.upsert({
          where: { code },
          update: {
            name,
            description: body.description || null,
            permissions: typeof body.permissions === "object" ? JSON.stringify(body.permissions) : (body.permissions || null),
            status: body.status || "Active",
          },
          create: {
            code,
            name,
            description: body.description || null,
            permissions: typeof body.permissions === "object" ? JSON.stringify(body.permissions) : (body.permissions || null),
            status: body.status || "Active",
          },
        });
        return new Response(JSON.stringify({ success: true, role: created }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const urlParams = new URL(request.url).searchParams;
        const roleCode = urlParams.get("code");
        if (!roleCode) {
          return new Response(JSON.stringify({ error: "Role code is required" }), { status: 400, headers });
        }
        await prisma.systemRole.deleteMany({ where: { code: roleCode } });
        return new Response(JSON.stringify({ success: true, message: "Role " + roleCode + " deleted" }), { status: 200, headers });
      }
    }

    
    // 6. /api/users — System User Master CRUD connected to PostgreSQL
    if (path === "/api/users") {
      if (method === "GET") {
        const users = await prisma.user.findMany({
          orderBy: { id: "asc" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return new Response(JSON.stringify({ success: true, users }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const email = String(body.email || "").toLowerCase().trim();
        const name = String(body.name || "").trim();
        const role = String(body.role || "TECHNICIAN").toUpperCase().trim();
        const phone = body.phone ? String(body.phone).trim() : null;
        const status = String(body.status || "Active");
        const rawPassword = body.password ? String(body.password).trim() : "";

        if (!email || !name) {
          return new Response(JSON.stringify({ error: "Name and Email are required" }), { status: 400, headers });
        }

        // Check if user has an existing ID (from loading a record) or originalEmail
        const userId = body.id ? Number(body.id) : undefined;
        let existing = null;

        if (userId && !isNaN(userId)) {
          existing = await prisma.user.findUnique({ where: { id: userId } });
        }
        if (!existing) {
          existing = await prisma.user.findUnique({ where: { email } });
        }

        let passwordHash = existing ? existing.password : bcrypt.hashSync("User@123", 10);
        if (rawPassword) {
          passwordHash = bcrypt.hashSync(rawPassword, 10);
        }

        let savedUser;
        if (existing) {
          // Update the existing user record!
          savedUser = await prisma.user.update({
            where: { id: existing.id },
            data: {
              email,
              name,
              role,
              phone,
              status,
              password: passwordHash,
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              phone: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        } else {
          // Create brand new user
          savedUser = await prisma.user.create({
            data: {
              email,
              name,
              role,
              phone,
              status,
              password: passwordHash,
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              phone: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        }

        return new Response(JSON.stringify({ success: true, user: savedUser }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const urlParams = new URL(request.url).searchParams;
        const emailToDelete = urlParams.get("email");
        const idToDelete = urlParams.get("id");

        if (emailToDelete) {
          await prisma.user.deleteMany({ where: { email: emailToDelete.toLowerCase().trim() } });
          return new Response(JSON.stringify({ success: true, message: "User deleted" }), { status: 200, headers });
        } else if (idToDelete) {
          await prisma.user.deleteMany({ where: { id: Number(idToDelete) } });
          return new Response(JSON.stringify({ success: true, message: "User deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Email or ID is required" }), { status: 400, headers });
        }
      }
    }

    // 7. /api/customers — Dedicated Customer Master CRUD (MST-01) in PostgreSQL
    if (path === "/api/customers") {
      const urlParams = new URL(request.url).searchParams;

      if (method === "GET") {
        const query = urlParams.get("query")?.toLowerCase().trim();
        let customers;
        if (query) {
          customers = await prisma.customer.findMany({
            where: {
              OR: [
                { customerCode: { contains: query, mode: "insensitive" } },
                { customerName: { contains: query, mode: "insensitive" } },
                { mobile: { contains: query } },
              ],
            },
            orderBy: { id: "asc" },
          });
        } else {
          customers = await prisma.customer.findMany({
            orderBy: { id: "asc" },
          });
        }
        return new Response(JSON.stringify({ success: true, customers }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        let customerCode = String(body.customerCode || "").trim();
        const customerName = String(body.customerName || "").trim();
        const customerGroup = String(body.customerGroup || "Corporate Commercial").trim();
        const customerType = String(body.customerType || "Corporate Enterprise").trim();
        const mobile = String(body.mobile || "").trim();
        const territory = body.territory ? String(body.territory).trim() : null;
        const nicBrNo = body.nicBrNo ? String(body.nicBrNo).trim() : null;
        const grade = body.grade ? String(body.grade).trim() : null;
        const firstChannel = body.firstChannel ? String(body.firstChannel).trim() : null;
        const preferredChannel = body.preferredChannel ? String(body.preferredChannel).trim() : null;
        const customerOrigin = body.customerOrigin ? String(body.customerOrigin).trim() : "Telesonic-sold";
        const relationshipStatus = body.relationshipStatus ? String(body.relationshipStatus).trim() : "Active";
        const paymentHold = body.paymentHold ? String(body.paymentHold).trim() : "No";
        const balanceLkr = body.balanceLkr !== undefined && body.balanceLkr !== null ? Number(body.balanceLkr) : 0.0;
        const status = String(body.status || "Active").trim();

        if (!customerName || !mobile) {
          return new Response(JSON.stringify({ error: "Customer Name and Mobile are mandatory" }), { status: 400, headers });
        }

        // Auto-generate customerCode if missing or blank
        if (!customerCode) {
          const totalCustomers = await prisma.customer.count();
          customerCode = `C-${30510 + totalCustomers + 1}`;
        }

        // Check if updating existing by ID or customerCode
        const id = body.id ? Number(body.id) : undefined;
        let existing = null;
        if (id) {
          existing = await prisma.customer.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await prisma.customer.findUnique({ where: { customerCode } });
        }

        let saved;
        if (existing) {
          saved = await prisma.customer.update({
            where: { id: existing.id },
            data: {
              customerCode,
              customerName,
              customerGroup,
              customerType,
              mobile,
              territory,
              nicBrNo,
              grade,
              firstChannel,
              preferredChannel,
              customerOrigin,
              relationshipStatus,
              paymentHold,
              balanceLkr,
              status,
            },
          });
        } else {
          saved = await prisma.customer.create({
            data: {
              customerCode,
              customerName,
              customerGroup,
              customerType,
              mobile,
              territory,
              nicBrNo,
              grade,
              firstChannel,
              preferredChannel,
              customerOrigin,
              relationshipStatus,
              paymentHold,
              balanceLkr,
              status,
            },
          });
        }

        return new Response(JSON.stringify({ success: true, customer: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("customerCode");

        if (id) {
          await prisma.customer.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Customer deleted" }), { status: 200, headers });
        } else if (code) {
          await prisma.customer.deleteMany({ where: { customerCode: code } });
          return new Response(JSON.stringify({ success: true, message: "Customer deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "id or customerCode is required" }), { status: 400, headers });
        }
      }
    }

    // 8. /api/contacts — Dedicated Contact Person Master CRUD (MST-02) in PostgreSQL
    if (path === "/api/contacts") {
      const urlParams = new URL(request.url).searchParams;

      if (method === "GET") {
        const customerId = urlParams.get("customerId");
        const query = urlParams.get("query")?.toLowerCase().trim();

        const whereClause: Record<string, unknown> = {};
        if (customerId) {
          whereClause["customerId"] = Number(customerId);
        }
        if (query) {
          whereClause["OR"] = [
            { contactName: { contains: query, mode: "insensitive" } },
            { mobile: { contains: query } },
            { customerCode: { contains: query, mode: "insensitive" } },
          ];
        }

        const contacts = await prisma.contactPerson.findMany({
          where: whereClause,
          include: {
            customer: {
              select: {
                id: true,
                customerCode: true,
                customerName: true,
              },
            },
          },
          orderBy: { id: "asc" },
        });

        // Add customerName field to each contact object for table display
        const enriched = contacts.map((c: any) => ({
          ...c,
          customerName: c.customer ? c.customer.customerName : c.customerCode || "—",
        }));

        return new Response(JSON.stringify({ success: true, contacts: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const contactName = String(body.contactName || "").trim();
        const mobile = String(body.mobile || "").trim();
        const position = body.position ? String(body.position).trim() : null;
        const email = body.email ? String(body.email).trim() : null;
        const site = body.site ? String(body.site).trim() : null;
        const active = String(body.active || "Yes").trim();
        const validFrom = body.validFrom ? String(body.validFrom).trim() : null;
        const status = String(body.status || "Active").trim();

        if (!contactName || !mobile) {
          return new Response(JSON.stringify({ error: "Contact Name and Mobile are mandatory" }), { status: 400, headers });
        }

        // Resolve customerId
        let customerId = body.customerId ? Number(body.customerId) : undefined;
        let customerCode = body.customerCode ? String(body.customerCode).trim() : "";

        // If customerCode was passed like "C-30512 (Jayasuriya Textiles)", extract the code "C-30512"
        const codeMatch = customerCode.match(/C-\d+/i);
        const cleanCode = codeMatch ? codeMatch[0].toUpperCase() : customerCode.split(" ")[0];

        if (!customerId) {
          const matchedCust = await prisma.customer.findFirst({
            where: {
              OR: [
                { customerCode: { equals: cleanCode, mode: "insensitive" } },
                { customerName: { contains: cleanCode, mode: "insensitive" } },
              ],
            },
          });
          if (matchedCust) {
            customerId = matchedCust.id;
            customerCode = `${matchedCust.customerCode} (${matchedCust.customerName})`;
          } else {
            // Fallback to first customer in DB if none exists
            const fallback = await prisma.customer.findFirst();
            if (fallback) {
              customerId = fallback.id;
              customerCode = `${fallback.customerCode} (${fallback.customerName})`;
            } else {
              return new Response(JSON.stringify({ error: "Valid Customer ID or Customer Code is required" }), { status: 400, headers });
            }
          }
        }

        // Check if updating existing by ID
        const id = body.id ? Number(body.id) : undefined;
        let existing = null;
        if (id) {
          existing = await prisma.contactPerson.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await prisma.contactPerson.findFirst({
            where: {
              customerId,
              contactName,
            },
          });
        }

        let saved;
        if (existing) {
          saved = await prisma.contactPerson.update({
            where: { id: existing.id },
            data: {
              customerId,
              customerCode,
              contactName,
              position,
              mobile,
              email,
              site,
              active,
              validFrom,
              status,
            },
            include: { customer: true },
          });
        } else {
          saved = await prisma.contactPerson.create({
            data: {
              customerId,
              customerCode,
              contactName,
              position,
              mobile,
              email,
              site,
              active,
              validFrom,
              status,
            },
            include: { customer: true },
          });
        }

        const enriched = {
          ...saved,
          customerName: saved.customer ? saved.customer.customerName : saved.customerCode || "—",
        };

        return new Response(JSON.stringify({ success: true, contact: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        if (id) {
          await prisma.contactPerson.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Contact person deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Contact ID is required" }), { status: 400, headers });
        }
      }
    }

    // 9. /api/sites — Dedicated Site and Location Master CRUD (MST-03) in PostgreSQL
    if (path === "/api/sites") {
      const urlParams = new URL(request.url).searchParams;

      if (method === "GET") {
        const customerId = urlParams.get("customerId");
        const query = urlParams.get("query")?.toLowerCase().trim();

        const whereClause: Record<string, unknown> = {};
        if (customerId) {
          whereClause["customerId"] = Number(customerId);
        }
        if (query) {
          whereClause["OR"] = [
            { siteCode: { contains: query, mode: "insensitive" } },
            { siteName: { contains: query, mode: "insensitive" } },
            { cityTown: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
            { customerName: { contains: query, mode: "insensitive" } },
          ];
        }

        const sites = await prisma.site.findMany({
          where: whereClause,
          include: {
            customer: {
              select: {
                id: true,
                customerCode: true,
                customerName: true,
              },
            },
          },
          orderBy: { id: "asc" },
        });

        // Add customerName field to each site object for table display
        const enriched = sites.map((s: any) => ({
          ...s,
          customerName: s.customer ? s.customer.customerName : s.customerName || s.customerCode || "—",
        }));

        return new Response(JSON.stringify({ success: true, sites: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const siteName = String(body.siteName || "").trim();
        let siteCode = String(body.siteCode || "").trim();
        const addressLine1 = String(body.addressLine1 || "").trim();
        const cityTown = String(body.cityTown || "").trim();
        const district = String(body.district || "Colombo").trim();
        const province = String(body.province || "Western").trim();
        const building = body.building ? String(body.building).trim() : null;
        const floor = body.floor ? String(body.floor).trim() : null;
        const room = body.room ? String(body.room).trim() : null;
        const landmark = body.landmark ? String(body.landmark).trim() : null;
        const gpsLatLong = body.gpsLatLong ? String(body.gpsLatLong).trim() : null;
        const siteContact = body.siteContact ? String(body.siteContact).trim() : null;
        const status = String(body.status || "Active").trim();

        if (!siteName || !addressLine1 || !cityTown) {
          return new Response(JSON.stringify({ error: "Site Name, Address Line 1 and City / Town are mandatory" }), { status: 400, headers });
        }

        // Auto-generate siteCode if missing
        if (!siteCode) {
          const totalSites = await prisma.site.count();
          siteCode = `SITE-${cityTown.slice(0, 3).toUpperCase()}-${String(totalSites + 1).padStart(4, "0")}`;
        }

        // Resolve customerId & customerName
        let customerId = body.customerId ? Number(body.customerId) : undefined;
        let customerName = body.customerName ? String(body.customerName).trim() : "";
        let customerCode = body.customerCode ? String(body.customerCode).trim() : "";

        if (!customerId) {
          const matchedCust = await prisma.customer.findFirst({
            where: {
              OR: [
                { customerName: { equals: customerName, mode: "insensitive" } },
                { customerCode: { equals: customerCode, mode: "insensitive" } },
              ],
            },
          });
          if (matchedCust) {
            customerId = matchedCust.id;
            customerName = matchedCust.customerName;
            customerCode = matchedCust.customerCode;
          } else {
            const fallback = await prisma.customer.findFirst();
            if (fallback) {
              customerId = fallback.id;
              customerName = fallback.customerName;
              customerCode = fallback.customerCode;
            } else {
              return new Response(JSON.stringify({ error: "Valid Customer is required" }), { status: 400, headers });
            }
          }
        }

        // Check if updating existing by ID or siteCode
        const id = body.id ? Number(body.id) : undefined;
        let existing = null;
        if (id) {
          existing = await prisma.site.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await prisma.site.findUnique({ where: { siteCode } });
        }

        let saved;
        if (existing) {
          saved = await prisma.site.update({
            where: { id: existing.id },
            data: {
              customerId,
              customerCode,
              customerName,
              siteCode,
              siteName,
              building,
              floor,
              room,
              addressLine1,
              cityTown,
              district,
              province,
              landmark,
              gpsLatLong,
              siteContact,
              status,
            },
            include: { customer: true },
          });
        } else {
          saved = await prisma.site.create({
            data: {
              customerId,
              customerCode,
              customerName,
              siteCode,
              siteName,
              building,
              floor,
              room,
              addressLine1,
              cityTown,
              district,
              province,
              landmark,
              gpsLatLong,
              siteContact,
              status,
            },
            include: { customer: true },
          });
        }

        const enriched = {
          ...saved,
          customerName: saved.customer ? saved.customer.customerName : saved.customerName || saved.customerCode || "—",
        };

        return new Response(JSON.stringify({ success: true, site: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("siteCode");

        if (id) {
          await prisma.site.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Site deleted" }), { status: 200, headers });
        } else if (code) {
          await prisma.site.deleteMany({ where: { siteCode: code } });
          return new Response(JSON.stringify({ success: true, message: "Site deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Site ID or Code is required" }), { status: 400, headers });
        }
      }
    }

    // 10. /api/items — Dedicated Item Master CRUD (MST-04) in PostgreSQL
    if (path === "/api/items") {
      const urlParams = new URL(request.url).searchParams;

      if (method === "GET") {
        const query = urlParams.get("query")?.toLowerCase().trim();
        const brand = urlParams.get("brand");
        const itemGroup = urlParams.get("itemGroup");

        const whereClause: Record<string, unknown> = {};
        if (brand) whereClause["brand"] = brand;
        if (itemGroup) whereClause["itemGroup"] = itemGroup;
        if (query) {
          whereClause["OR"] = [
            { itemCode: { contains: query, mode: "insensitive" } },
            { itemName: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { model: { contains: query, mode: "insensitive" } },
          ];
        }

        const items = await prisma.item.findMany({
          where: whereClause,
          orderBy: { id: "asc" },
        });

        return new Response(JSON.stringify({ success: true, items }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        let itemCode = String(body.itemCode || "").trim();
        const itemName = String(body.itemName || "").trim();
        const itemGroup = String(body.itemGroup || "Service Spare Parts").trim();
        const brand = String(body.brand || "Carrier").trim();
        const model = body.model ? String(body.model).trim() : null;
        const equipmentCategory = String(body.equipmentCategory || "Air Conditioning Commercial").trim();
        const componentRole = body.componentRole ? String(body.componentRole).trim() : null;
        const serviceable = String(body.serviceable || "Yes").trim();
        const warrantyMonths = body.warrantyMonths !== undefined && body.warrantyMonths !== null ? Number(body.warrantyMonths) : 12;
        const componentWarrantyMonths = body.componentWarrantyMonths !== undefined && body.componentWarrantyMonths !== null ? Number(body.componentWarrantyMonths) : 6;
        const serialManaged = String(body.serialManaged || "Yes").trim();
        const status = String(body.status || "Active").trim();

        if (!itemCode || !itemName) {
          return new Response(JSON.stringify({ error: "Item Code and Item Name are mandatory" }), { status: 400, headers });
        }

        // Check if updating existing by ID or itemCode
        const id = body.id ? Number(body.id) : undefined;
        let existing = null;
        if (id) {
          existing = await prisma.item.findUnique({ where: { id } });
        }
        if (!existing) {
          existing = await prisma.item.findUnique({ where: { itemCode } });
        }

        let saved;
        if (existing) {
          saved = await prisma.item.update({
            where: { id: existing.id },
            data: {
              itemCode,
              itemName,
              itemGroup,
              brand,
              model,
              equipmentCategory,
              componentRole,
              serviceable,
              warrantyMonths,
              componentWarrantyMonths,
              serialManaged,
              status,
            },
          });
        } else {
          saved = await prisma.item.create({
            data: {
              itemCode,
              itemName,
              itemGroup,
              brand,
              model,
              equipmentCategory,
              componentRole,
              serviceable,
              warrantyMonths,
              componentWarrantyMonths,
              serialManaged,
              status,
            },
          });
        }

        return new Response(JSON.stringify({ success: true, item: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("itemCode");

        if (id) {
          await prisma.item.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Item deleted" }), { status: 200, headers });
        } else if (code) {
          await prisma.item.deleteMany({ where: { itemCode: code } });
          return new Response(JSON.stringify({ success: true, message: "Item deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Item ID or Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 14. /api/equipment-systems — Dedicated Multi-Component Equipment Systems (MST-08)
    // =========================================================================
    if (path === "/api/equipment-systems") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentSystem;

      if (method === "GET") {
        const id = urlParams.get("id");
        const systemId = urlParams.get("systemId");
        const customerId = urlParams.get("customerId");
        const siteId = urlParams.get("siteId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const record = await delegate.findUnique({
            where: { id: Number(id) },
            include: { customer: true, site: true },
          });
          if (!record) return new Response(JSON.stringify({ error: "System not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, system: record }), { status: 200, headers });
        }

        const where: any = {};
        if (systemId) where.systemId = systemId;
        if (customerId) where.customerId = Number(customerId);
        if (siteId) where.siteId = Number(siteId);
        if (search) {
          where.OR = [
            { systemId: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { siteName: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({
          where,
          include: {
            customer: { select: { id: true, customerCode: true, customerName: true } },
            site: { select: { id: true, siteCode: true, siteName: true } },
          },
          orderBy: { id: "asc" },
        });

        const enriched = list.map((e: any) => ({
          ...e,
          customer: e.customer ? e.customer.customerName : e.customerName || "—",
          site: e.site ? e.site.siteName : e.siteName || "—",
        }));

        return new Response(JSON.stringify({ success: true, systems: enriched }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const systemId = String(body.systemId || "").trim();
        if (!systemId) {
          return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400, headers });
        }

        let customerId = body.customerId ? Number(body.customerId) : undefined;
        let customerName = body.customerName ? String(body.customerName).trim() : "";
        if (!customerId && (body.customer || body.customerName)) {
          const custStr = String(body.customer || body.customerName).trim();
          const matchedCust = await (prisma as any).customer.findFirst({
            where: {
              OR: [
                { customerName: { contains: custStr, mode: "insensitive" } },
                { customerCode: { equals: custStr.split(" ")[0], mode: "insensitive" } },
              ],
            },
          });
          if (matchedCust) {
            customerId = matchedCust.id;
            customerName = matchedCust.customerName;
          }
        }

        let siteId = body.siteId ? Number(body.siteId) : undefined;
        let siteName = body.siteName ? String(body.siteName).trim() : "";
        if (!siteId && (body.site || body.siteName)) {
          const siteStr = String(body.site || body.siteName).trim();
          const matchedSite = await (prisma as any).site.findFirst({
            where: { siteName: { contains: siteStr, mode: "insensitive" } },
          });
          if (matchedSite) {
            siteId = matchedSite.id;
            siteName = matchedSite.siteName;
          }
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { systemId } });

        const payloadData = {
          systemId,
          customerId: customerId || null,
          customerName: customerName || null,
          siteId: siteId || null,
          siteName: siteName || null,
          location: body.location || null,
          equipmentCategory: body.equipmentCategory || "VRF Multi-Zone System",
          status: body.status || "Active",
          installedDate: body.installedDate || null,
          commissionedDate: body.commissionedDate || null,
          warrantyStart: body.warrantyStart || null,
          warrantyEnd: body.warrantyEnd || null,
          contract: body.contract || null,
          project: body.project || null,
        };

        let saved: any;
        if (existing) {
          saved = await delegate.update({
            where: { id: existing.id },
            data: payloadData,
            include: { customer: true, site: true },
          });
        } else {
          saved = await delegate.create({
            data: payloadData,
            include: { customer: true, site: true },
          });
        }

        const enriched = {
          ...saved,
          customer: saved.customer ? saved.customer.customerName : saved.customerName || "—",
          site: saved.site ? saved.site.siteName : saved.siteName || "—",
        };

        return new Response(JSON.stringify({ success: true, system: enriched }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const systemId = urlParams.get("systemId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "System deleted" }), { status: 200, headers });
        } else if (systemId) {
          await delegate.deleteMany({ where: { systemId } });
          return new Response(JSON.stringify({ success: true, message: "System deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 15. /api/technicians — Dedicated Employee / Technician Master (MST-09)
    // =========================================================================
    if (path === "/api/technicians") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).technician;

      if (method === "GET") {
        const id = urlParams.get("id");
        const employeeId = urlParams.get("employeeId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Technician not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, technician: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (employeeId) where.employeeId = employeeId;
        if (search) {
          where.OR = [
            { employeeId: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { position: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
            { team: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, technicians: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const employeeId = String(body.employeeId || "").trim();
        const name = String(body.name || "").trim();
        if (!employeeId || !name) {
          return new Response(JSON.stringify({ error: "Employee ID and Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { employeeId } });

        const parseRate = (val: any) => {
          if (val === null || val === undefined || val === "") return 0.0;
          const cleaned = String(val).replace(/,/g, "").trim();
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0.0 : parsed;
        };

        const payloadData = {
          employeeId,
          name,
          position: body.position || "Field Technician",
          department: body.department || "Field Operations",
          branch: body.branch || "Colombo Head Office",
          mobile: body.mobile || null,
          technicianType: body.technicianType || "Direct In-House Staff",
          team: body.team || null,
          certifications: body.certifications || null,
          normalRate: parseRate(body.normalRate),
          overtimeRate: parseRate(body.overtimeRate),
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, technician: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const employeeId = urlParams.get("employeeId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Technician deleted" }), { status: 200, headers });
        } else if (employeeId) {
          await delegate.deleteMany({ where: { employeeId } });
          return new Response(JSON.stringify({ success: true, message: "Technician deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Employee ID is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 16. /api/subcontractors — Dedicated Subcontractor Master (MST-10)
    // =========================================================================
    if (path === "/api/subcontractors") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).subcontractor;

      if (method === "GET") {
        const id = urlParams.get("id");
        const vendorCode = urlParams.get("vendorCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Subcontractor not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, subcontractor: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (vendorCode) where.vendorCode = vendorCode;
        if (search) {
          where.OR = [
            { vendorCode: { contains: search, mode: "insensitive" } },
            { vendorName: { contains: search, mode: "insensitive" } },
            { subcontractorType: { contains: search, mode: "insensitive" } },
            { territory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, subcontractors: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const vendorCode = String(body.vendorCode || "").trim();
        const vendorName = String(body.vendorName || "").trim();
        if (!vendorCode || !vendorName) {
          return new Response(JSON.stringify({ error: "Vendor Code and Vendor Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { vendorCode } });

        const payloadData = {
          vendorCode,
          vendorName,
          subcontractorType: body.subcontractorType || "HVAC Contractor",
          territory: body.territory || "Western Province",
          paymentTerms: body.paymentTerms || "Net 30 Days",
          rating: body.rating !== undefined && body.rating !== null ? Number(body.rating) : 8.0,
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, subcontractor: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const vendorCode = urlParams.get("vendorCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Subcontractor deleted" }), { status: 200, headers });
        } else if (vendorCode) {
          await delegate.deleteMany({ where: { vendorCode } });
          return new Response(JSON.stringify({ success: true, message: "Subcontractor deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Vendor Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 17. /api/service-roles — Dedicated Service Role Master (MST-11)
    // =========================================================================
    if (path === "/api/service-roles") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).serviceRoleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const roleCode = urlParams.get("roleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Service Role not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, role: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (roleCode) where.roleCode = roleCode;
        if (search) {
          where.OR = [
            { roleCode: { contains: search, mode: "insensitive" } },
            { roleName: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, roles: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const roleCode = String(body.roleCode || "").trim();
        const roleName = String(body.roleName || "").trim();
        if (!roleCode || !roleName) {
          return new Response(JSON.stringify({ error: "Role Code and Role Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { roleCode } });

        const payloadData = {
          roleCode,
          roleName,
          internalSubcontractor: body.internalSubcontractor || "Both Internal and Subcontractor",
          incentiveEligible: body.incentiveEligible || "Yes",
          incentiveBasisRef: body.incentiveBasisRef || null,
          multiplePerCall: body.multiplePerCall || "No",
          active: body.active || "Yes",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, role: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const roleCode = urlParams.get("roleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Service role deleted" }), { status: 200, headers });
        } else if (roleCode) {
          await delegate.deleteMany({ where: { roleCode } });
          return new Response(JSON.stringify({ success: true, message: "Service role deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Role Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 18. /api/service-types — Dedicated Service Type/Reason/Priority Master (MST-12)
    // =========================================================================
    if (path === "/api/service-types") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).serviceTypeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");
        const listType = urlParams.get("listType");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Record not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, serviceType: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (code) where.code = code;
        if (listType) where.listType = listType;
        if (search) {
          where.OR = [
            { code: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { listType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, serviceTypes: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const code = String(body.code || "").trim();
        const description = String(body.description || "").trim();
        if (!code || !description) {
          return new Response(JSON.stringify({ error: "Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { code } });

        const payloadData = {
          code,
          description,
          listType: body.listType || "Service Type",
          defaultPriority: body.defaultPriority || "P2 - Normal Schedule",
          checklistTemplate: body.checklistTemplate || null,
          slaRule: body.slaRule || null,
          chargeableDefault: body.chargeableDefault || "No",
          active: body.active || "Yes",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, serviceType: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else if (code) {
          await delegate.deleteMany({ where: { code } });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 19. /api/hold-reasons - Dedicated Hold Reasons Master (MST-13)
    // =========================================================================
    if (path === "/api/hold-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).holdReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Hold reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, holdReason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { customerWording: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, holdReasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();
        const customerWording = String(body.customerWording || "").trim();
        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          customerWording: customerWording || description,
          excludeFromSla: body.excludeFromSla || "Yes (Clock Paused)",
          maxHoldDays: body.maxHoldDays ? parseInt(String(body.maxHoldDays), 10) : 14,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, holdReason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Hold reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Hold reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 20. /api/repeat-reasons - Dedicated Repeat Reasons Master (MST-14)
    // =========================================================================
    if (path === "/api/repeat-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).repeatReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Repeat reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, repeatReason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { appliesToCategory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, repeatReasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();
        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const activeVal = body.active || "Yes";
        const computedStatus = body.status
          ? body.status
          : activeVal === "No"
          ? "Inactive"
          : "Active";

        const payloadData = {
          reasonCode,
          description,
          countsAsPoorService: body.countsAsPoorService || "Yes",
          detectionPeriodDays: body.detectionPeriodDays ? parseInt(String(body.detectionPeriodDays), 10) : 30,
          appliesToCategory: body.appliesToCategory || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, repeatReason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Repeat reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Repeat reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 21. /api/sla-rules - Dedicated SLA Rules Master (MST-15)
    // =========================================================================
    if (path === "/api/sla-rules") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).slaRuleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "SLA rule not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, slaRule: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (ruleCode) where.ruleCode = ruleCode;
        if (search) {
          where.OR = [
            { ruleCode: { contains: search, mode: "insensitive" } },
            { serviceType: { contains: search, mode: "insensitive" } },
            { priority: { contains: search, mode: "insensitive" } },
            { area: { contains: search, mode: "insensitive" } },
            { calendar: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, slaRules: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const ruleCode = String(body.ruleCode || "").trim();
        const serviceType = String(body.serviceType || "").trim();
        const priority = String(body.priority || "").trim();
        if (!ruleCode || !serviceType || !priority) {
          return new Response(JSON.stringify({ error: "Rule Code, Service Type, and Priority are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { ruleCode } });

        const payloadData = {
          ruleCode,
          serviceType,
          priority,
          area: body.area || "Western Metro Zone",
          resourceType: body.resourceType || "Any Available",
          responseHours: body.responseHours !== undefined && body.responseHours !== null ? parseFloat(String(body.responseHours)) : 4.0,
          resolutionHours: body.resolutionHours !== undefined && body.resolutionHours !== null ? parseFloat(String(body.resolutionHours)) : 24.0,
          warningPct: body.warningPct !== undefined && body.warningPct !== null ? parseFloat(String(body.warningPct)) : 75.0,
          calendar: body.calendar || "CAL-STANDARD-HOURS",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, slaRule: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "SLA rule deleted" }), { status: 200, headers });
        } else if (ruleCode) {
          await delegate.deleteMany({ where: { ruleCode } });
          return new Response(JSON.stringify({ success: true, message: "SLA rule deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rule Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 22. /api/checklist-templates - Dedicated Checklist Templates Master (MST-16)
    // =========================================================================
    if (path === "/api/checklist-templates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).checklistTemplateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const templateCode = urlParams.get("templateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Template not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, checklistTemplate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (templateCode) where.templateCode = templateCode;
        if (search) {
          where.OR = [
            { templateCode: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
            { serviceType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, checklistTemplates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const templateCode = String(body.templateCode || "").trim();
        const name = String(body.name || "").trim();
        const equipmentCategory = String(body.equipmentCategory || "").trim();
        const serviceType = String(body.serviceType || "").trim();
        if (!templateCode || !name || !equipmentCategory || !serviceType) {
          return new Response(JSON.stringify({ error: "Template Code, Name, Equipment Category, and Service Type are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { templateCode } });

        const activeVal = body.active || "Yes";
        const computedStatus = body.status
          ? body.status
          : activeVal === "No"
          ? "Inactive"
          : "Active";

        const payloadData = {
          templateCode,
          name,
          equipmentCategory,
          serviceType,
          version: body.version ? parseInt(String(body.version), 10) : 1,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, checklistTemplate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const templateCode = urlParams.get("templateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else if (templateCode) {
          await delegate.deleteMany({ where: { templateCode } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Template Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 29. /api/project-budgets - Dedicated Project and G/L Budget (MST-23)
    // =========================================================================
    if (path === "/api/project-budgets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).projectBudgetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Budget not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, budget: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (projectCode) where.projectCode = projectCode;
        if (search) {
          where.OR = [
            { projectCode: { contains: search, mode: "insensitive" } },
            { projectName: { contains: search, mode: "insensitive" } },
            { customer: { contains: search, mode: "insensitive" } },
            { projectManager: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, budgets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const projectCode = String(body.projectCode || "").trim();
        const projectName = String(body.projectName || "").trim();
        const customer = String(body.customer || "").trim();
        const projectManager = String(body.projectManager || "").trim();

        if (!projectCode || !projectName || !customer || !projectManager) {
          return new Response(JSON.stringify({ error: "Project Code, Name, Customer, and Project Manager are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { projectCode } });

        const status = String(body.status || "Active").trim();
        const payloadData = {
          projectCode,
          projectName,
          customer,
          projectManager,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          budgetVersion: body.budgetVersion !== undefined && body.budgetVersion !== null ? parseInt(String(body.budgetVersion), 10) : 1,
          versionStatus: body.versionStatus || "Draft",
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, budget: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else if (projectCode) {
          await delegate.deleteMany({ where: { projectCode } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Project Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 30. /api/cost-element-mappings - Dedicated Cost Element / G/L Mapping (MST-24)
    // =========================================================================
    if (path === "/api/cost-element-mappings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).costElementMappingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Mapping not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, mapping: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (costElement) where.costElement = costElement;
        if (search) {
          where.OR = [
            { costElement: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { glAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, mappings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const costElement = String(body.costElement || "").trim();
        const description = String(body.description || "").trim();
        const glAccount = String(body.glAccount || "").trim();

        if (!costElement || !description || !glAccount) {
          return new Response(JSON.stringify({ error: "Cost Element, Description, and G/L Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { costElement } });

        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          costElement,
          description,
          glAccount,
          revenueCost: body.revenueCost || "Expense",
          requiresCallRef: body.requiresCallRef || "Yes",
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, mapping: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else if (costElement) {
          await delegate.deleteMany({ where: { costElement } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Cost Element is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 31. /api/labour-rates - Dedicated Labour Rates (MST-25)
    // =========================================================================
    if (path === "/api/labour-rates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).labourRateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Rate not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, rate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (rateCode) where.rateCode = rateCode;
        if (search) {
          where.OR = [
            { rateCode: { contains: search, mode: "insensitive" } },
            { technicianType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, rates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const rateCode = String(body.rateCode || "").trim();
        const technicianType = String(body.technicianType || "").trim();
        const normalRate = body.normalRate !== undefined && body.normalRate !== null ? parseFloat(String(body.normalRate).replace(/,/g, "")) : 0;

        if (!rateCode || !technicianType || isNaN(normalRate)) {
          return new Response(JSON.stringify({ error: "Rate Code, Technician Type, and valid Normal Rate are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { rateCode } });

        const overtimeRate = body.overtimeRate !== undefined && body.overtimeRate !== null ? parseFloat(String(body.overtimeRate).replace(/,/g, "")) : 0;
        const subcontractRate = body.subcontractRate !== undefined && body.subcontractRate !== null ? parseFloat(String(body.subcontractRate).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          rateCode,
          technicianType,
          normalRate,
          overtimeRate,
          subcontractRate,
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, rate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else if (rateCode) {
          await delegate.deleteMany({ where: { rateCode } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rate Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 32. /api/franchise-warehouses - Dedicated Franchise & Warehouse (MST-26)
    // =========================================================================
    if (path === "/api/franchise-warehouses") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).franchiseWarehouseMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Franchise warehouse not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warehouse: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (franchiseBp) where.franchiseBp = franchiseBp;
        if (search) {
          where.OR = [
            { franchiseBp: { contains: search, mode: "insensitive" } },
            { franchiseName: { contains: search, mode: "insensitive" } },
            { warehouse: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warehouses: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const franchiseBp = String(body.franchiseBp || "").trim();
        const franchiseName = String(body.franchiseName || "").trim();
        const warehouse = String(body.warehouse || "").trim();

        if (!franchiseBp || !franchiseName || !warehouse) {
          return new Response(JSON.stringify({ error: "Franchise BP, Name, and Warehouse are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { franchiseBp } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          franchiseBp,
          franchiseName,
          warehouse,
          stockOwnership: body.stockOwnership || "Telesonic Consignment Stock",
          region: body.region || null,
          countFrequency: body.countFrequency || "Monthly Physical Audit",
          auditor: body.auditor || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warehouse: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else if (franchiseBp) {
          await delegate.deleteMany({ where: { franchiseBp } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Franchise BP is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 33. /api/deviation-reasons - Dedicated Deviation Reasons (MST-27)
    // =========================================================================
    if (path === "/api/deviation-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).deviationReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();

        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const qtyThreshold = body.qtyThreshold !== undefined && body.qtyThreshold !== null ? parseInt(String(body.qtyThreshold), 10) : 1;
        const valueThresholdLkr = body.valueThresholdLkr !== undefined && body.valueThresholdLkr !== null ? parseFloat(String(body.valueThresholdLkr).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          recoverableFromFranchise: body.recoverableFromFranchise || "No (Telesonic Absorption)",
          qtyThreshold,
          valueThresholdLkr,
          escalationRecipients: body.escalationRecipients || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 34. /api/export-permissions - Dedicated Export Permissions (MST-28)
    // =========================================================================
    if (path === "/api/export-permissions") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).exportPermissionMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Permission not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, permission: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (role) where.role = role;
        if (reportGrid) where.reportGrid = reportGrid;
        if (search) {
          where.OR = [
            { role: { contains: search, mode: "insensitive" } },
            { reportGrid: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, permissions: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const role = String(body.role || "").trim();
        const reportGrid = String(body.reportGrid || "").trim();

        if (!role || !reportGrid) {
          return new Response(JSON.stringify({ error: "Role and Target Report / Grid are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) {
          existing = await delegate.findUnique({
            where: {
              role_reportGrid: { role, reportGrid },
            },
          });
        }

        const rowLimit = body.rowLimit !== undefined && body.rowLimit !== null ? parseInt(String(body.rowLimit), 10) : 5000;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          role,
          reportGrid,
          excel: body.excel || "Yes",
          pdf: body.pdf || "Yes",
          restrictedColumns: body.restrictedColumns || null,
          rowLimit,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, permission: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else if (role && reportGrid) {
          await delegate.deleteMany({ where: { role, reportGrid } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "ID or (Role and Report Grid) required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 35. /api/google-meet-settings - Dedicated Google Meet Settings (MST-29)
    // =========================================================================
    if (path === "/api/google-meet-settings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).googleMeetSettingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Setting not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, setting: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (workspaceDomain) where.workspaceDomain = workspaceDomain;
        if (search) {
          where.OR = [
            { workspaceDomain: { contains: search, mode: "insensitive" } },
            { organiserAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, settings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const workspaceDomain = String(body.workspaceDomain || "").trim();
        const organiserAccount = String(body.organiserAccount || "").trim();

        if (!workspaceDomain || !organiserAccount) {
          return new Response(JSON.stringify({ error: "Workspace Domain and Organiser Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { workspaceDomain } });

        const defaultDuration = body.defaultDuration !== undefined && body.defaultDuration !== null ? parseInt(String(body.defaultDuration), 10) : 45;
        const retryCount = body.retryCount !== undefined && body.retryCount !== null ? parseInt(String(body.retryCount), 10) : 3;
        const enabledVal = String(body.enabled || "Yes").trim();
        const computedStatus = enabledVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          workspaceDomain,
          organiserAccount,
          authMethod: body.authMethod || "Google Cloud Service Account JWT",
          defaultDuration,
          inviteCustomer: body.inviteCustomer || "Yes",
          inviteFranchise: body.inviteFranchise || "Yes",
          retryCount,
          enabled: enabledVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, setting: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else if (workspaceDomain) {
          await delegate.deleteMany({ where: { workspaceDomain } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Workspace Domain is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 36. /api/equipment-category-attributes - Dedicated Category Attributes (MST-30)
    // =========================================================================
    if (path === "/api/equipment-category-attributes") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentCategoryAttributeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Category not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, category: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (categoryCode) where.categoryCode = categoryCode;
        if (search) {
          where.OR = [
            { categoryCode: { contains: search, mode: "insensitive" } },
            { categoryName: { contains: search, mode: "insensitive" } },
            { industryGroup: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, categories: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const categoryCode = String(body.categoryCode || "").trim();
        const categoryName = String(body.categoryName || "").trim();

        if (!categoryCode || !categoryName) {
          return new Response(JSON.stringify({ error: "Category Code and Category Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { categoryCode } });

        const defaultInterval = body.defaultInterval !== undefined && body.defaultInterval !== null ? parseInt(String(body.defaultInterval), 10) : 3;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          categoryCode,
          categoryName,
          industryGroup: body.industryGroup || null,
          multiComponent: body.multiComponent || "No",
          meterType: body.meterType || "None",
          defaultIntervalBasis: body.defaultIntervalBasis || "Months (Calendar)",
          defaultInterval,
          checklistSet: body.checklistSet || null,
          warrantyRule: body.warrantyRule || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, category: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else if (categoryCode) {
          await delegate.deleteMany({ where: { categoryCode } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Category Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 37. /api/tool-vehicle-assets - Dedicated Tools, Boxes & Vehicles (MST-31)
    // =========================================================================
    if (path === "/api/tool-vehicle-assets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).toolVehicleAssetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Asset not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, asset: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (assetId) where.assetId = assetId;
        if (search) {
          where.OR = [
            { assetId: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { holder: { contains: search, mode: "insensitive" } },
            { vehicleRegNo: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, assets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const assetId = String(body.assetId || "").trim();
        const type = String(body.type || "").trim();
        const description = String(body.description || "").trim();

        if (!assetId || !type || !description) {
          return new Response(JSON.stringify({ error: "Asset ID, Type, and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { assetId } });

        const meterKm = body.meterKm !== undefined && body.meterKm !== null ? parseInt(String(body.meterKm), 10) : null;
        const status = String(body.status || "Available in Stores").trim();

        const payloadData = {
          assetId,
          type,
          description,
          holder: body.holder || null,
          vehicleRegNo: body.vehicleRegNo || null,
          meterKm,
          licenceExpiry: body.licenceExpiry ? new Date(body.licenceExpiry) : null,
          insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, asset: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else if (assetId) {
          await delegate.deleteMany({ where: { assetId } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Asset ID is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 23. /api/warranty-rules - Dedicated Warranty Rules Master (MST-17)
    // =========================================================================
    if (path === "/api/warranty-rules") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).warrantyRuleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Warranty rule not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warrantyRule: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (ruleCode) where.ruleCode = ruleCode;
        if (search) {
          where.OR = [
            { ruleCode: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
            { componentRole: { contains: search, mode: "insensitive" } },
            { channel: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warrantyRules: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const ruleCode = String(body.ruleCode || "").trim();
        const equipmentCategory = String(body.equipmentCategory || "").trim();
        const startBasis = String(body.startBasis || "").trim();
        const months = body.months !== undefined && body.months !== null ? parseInt(String(body.months), 10) : 12;
        if (!ruleCode || !equipmentCategory || !startBasis) {
          return new Response(JSON.stringify({ error: "Rule Code, Equipment Category, and Start Basis are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { ruleCode } });

        const payloadData = {
          ruleCode,
          equipmentCategory,
          componentRole: body.componentRole || "Complete Unit",
          channel: body.channel || "Direct Corporate Sale",
          startBasis,
          months,
          labourCovered: body.labourCovered || "Yes",
          replacementTreatment: body.replacementTreatment || "Repair in Workshop",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warrantyRule: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Warranty rule deleted" }), { status: 200, headers });
        } else if (ruleCode) {
          await delegate.deleteMany({ where: { ruleCode } });
          return new Response(JSON.stringify({ success: true, message: "Warranty rule deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rule Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 24. /api/free-service-plans - Dedicated Free Service Plan Master (MST-18)
    // =========================================================================
    if (path === "/api/free-service-plans") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).freeServicePlanMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const planCode = urlParams.get("planCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Plan not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, plan: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (planCode) where.planCode = planCode;
        if (search) {
          where.OR = [
            { planCode: { contains: search, mode: "insensitive" } },
            { division: { contains: search, mode: "insensitive" } },
            { equipmentCategory: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, plans: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const planCode = String(body.planCode || "").trim();
        const division = String(body.division || "").trim();
        const equipmentCategory = String(body.equipmentCategory || "").trim();
        const visits = body.visits !== undefined && body.visits !== null ? parseInt(String(body.visits), 10) : 3;
        const intervalBasis = String(body.intervalBasis || "Fixed Months").trim();
        const intervalValue = body.intervalValue !== undefined && body.intervalValue !== null ? parseInt(String(body.intervalValue), 10) : 4;
        const startBasis = String(body.startBasis || "Commissioning Date").trim();

        if (!planCode || !division || !equipmentCategory) {
          return new Response(JSON.stringify({ error: "Plan Code, Division, and Equipment Category are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { planCode } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          planCode,
          division,
          equipmentCategory,
          visits,
          intervalBasis,
          intervalValue,
          startBasis,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, plan: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const planCode = urlParams.get("planCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Plan deleted" }), { status: 200, headers });
        } else if (planCode) {
          await delegate.deleteMany({ where: { planCode } });
          return new Response(JSON.stringify({ success: true, message: "Plan deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Plan Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 25. /api/contract-templates - Dedicated Contract Templates Master (MST-19)
    // =========================================================================
    if (path === "/api/contract-templates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).contractTemplateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const template = urlParams.get("template");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Template not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, template: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (template) where.template = template;
        if (search) {
          where.OR = [
            { template: { contains: search, mode: "insensitive" } },
            { contractKind: { contains: search, mode: "insensitive" } },
            { coverage: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, templates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const template = String(body.template || "").trim();
        const contractKind = String(body.contractKind || "").trim();

        if (!template || !contractKind) {
          return new Response(JSON.stringify({ error: "Template Code/Title and Contract Kind are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { template } });

        const payloadData = {
          template,
          contractKind,
          visitsPerYear: body.visitsPerYear !== undefined && body.visitsPerYear !== null ? parseInt(String(body.visitsPerYear), 10) : 4,
          coverage: body.coverage || "24/7 Priority Emergency Coverage",
          responseHours: body.responseHours !== undefined && body.responseHours !== null ? parseInt(String(body.responseHours), 10) : 4,
          billingBasis: body.billingBasis || "Quarterly in Advance",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, template: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const template = urlParams.get("template");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else if (template) {
          await delegate.deleteMany({ where: { template } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Template identifier is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 26. /api/relationship-stages - Dedicated Relationship Stages / Reasons (MST-20)
    // =========================================================================
    if (path === "/api/relationship-stages") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).relationshipStageMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");
        const listType = urlParams.get("listType");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Stage not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, stage: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (code) where.code = code;
        if (listType) where.listType = listType;
        if (search) {
          where.OR = [
            { code: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { listType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, stages: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const code = String(body.code || "").trim();
        const description = String(body.description || "").trim();
        const listType = String(body.listType || "").trim();

        if (!code || !description || !listType) {
          return new Response(JSON.stringify({ error: "Code, Description, and List Type are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { code } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          code,
          description,
          listType,
          appliesTo: body.appliesTo || "All Customer Accounts",
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, stage: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const code = urlParams.get("code");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Stage deleted" }), { status: 200, headers });
        } else if (code) {
          await delegate.deleteMany({ where: { code } });
          return new Response(JSON.stringify({ success: true, message: "Stage deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 27. /api/reminder-rules - Dedicated Reminder Rules and Intervals (MST-21)
    // =========================================================================
    if (path === "/api/reminder-rules") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).reminderRuleMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reminder rule not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reminderRule: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (ruleCode) where.ruleCode = ruleCode;
        if (search) {
          where.OR = [
            { ruleCode: { contains: search, mode: "insensitive" } },
            { reminderType: { contains: search, mode: "insensitive" } },
            { channel: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reminderRules: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const ruleCode = String(body.ruleCode || "").trim();
        const reminderType = String(body.reminderType || "").trim();
        const leadDays = body.leadDays !== undefined && body.leadDays !== null ? parseInt(String(body.leadDays), 10) : 30;

        if (!ruleCode || !reminderType) {
          return new Response(JSON.stringify({ error: "Rule Code and Reminder Type are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { ruleCode } });

        const payloadData = {
          ruleCode,
          reminderType,
          customerCategory: body.customerCategory || "All Customers",
          leadDays,
          maxReminders: body.maxReminders !== undefined && body.maxReminders !== null ? parseInt(String(body.maxReminders), 10) : 3,
          intervalDays: body.intervalDays !== undefined && body.intervalDays !== null ? parseInt(String(body.intervalDays), 10) : 7,
          channel: body.channel || "SMS + WhatsApp",
          consentRequired: body.consentRequired || "Yes",
          status: body.status || "Active",
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reminderRule: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const ruleCode = urlParams.get("ruleCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reminder rule deleted" }), { status: 200, headers });
        } else if (ruleCode) {
          await delegate.deleteMany({ where: { ruleCode } });
          return new Response(JSON.stringify({ success: true, message: "Reminder rule deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rule Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 28. /api/notification-templates - Dedicated Notification Templates (MST-22)
    // =========================================================================
    if (path === "/api/notification-templates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).notificationTemplateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const templateId = urlParams.get("templateId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Template not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, template: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (templateId) where.templateId = templateId;
        if (search) {
          where.OR = [
            { templateId: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { channel: { contains: search, mode: "insensitive" } },
            { language: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, templates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const templateId = String(body.templateId || "").trim();
        const name = String(body.name || "").trim();
        const channel = String(body.channel || "").trim();
        const messageBody = String(body.body || "").trim();

        if (!templateId || !name || !channel || !messageBody) {
          return new Response(JSON.stringify({ error: "Template Code, Name, Channel, and Message Body are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { templateId } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          templateId,
          name,
          channel,
          language: body.language || "English",
          subject: body.subject || null,
          body: messageBody,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, template: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const templateId = urlParams.get("templateId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else if (templateId) {
          await delegate.deleteMany({ where: { templateId } });
          return new Response(JSON.stringify({ success: true, message: "Template deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Template Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 29. /api/project-budgets - Dedicated Project and G/L Budget (MST-23)
    // =========================================================================
    if (path === "/api/project-budgets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).projectBudgetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Budget not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, budget: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (projectCode) where.projectCode = projectCode;
        if (search) {
          where.OR = [
            { projectCode: { contains: search, mode: "insensitive" } },
            { projectName: { contains: search, mode: "insensitive" } },
            { customer: { contains: search, mode: "insensitive" } },
            { projectManager: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, budgets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const projectCode = String(body.projectCode || "").trim();
        const projectName = String(body.projectName || "").trim();
        const customer = String(body.customer || "").trim();
        const projectManager = String(body.projectManager || "").trim();

        if (!projectCode || !projectName || !customer || !projectManager) {
          return new Response(JSON.stringify({ error: "Project Code, Name, Customer, and Project Manager are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { projectCode } });

        const status = String(body.status || "Active").trim();
        const payloadData = {
          projectCode,
          projectName,
          customer,
          projectManager,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          budgetVersion: body.budgetVersion !== undefined && body.budgetVersion !== null ? parseInt(String(body.budgetVersion), 10) : 1,
          versionStatus: body.versionStatus || "Draft",
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, budget: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else if (projectCode) {
          await delegate.deleteMany({ where: { projectCode } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Project Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 30. /api/cost-element-mappings - Dedicated Cost Element / G/L Mapping (MST-24)
    // =========================================================================
    if (path === "/api/cost-element-mappings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).costElementMappingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Mapping not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, mapping: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (costElement) where.costElement = costElement;
        if (search) {
          where.OR = [
            { costElement: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { glAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, mappings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const costElement = String(body.costElement || "").trim();
        const description = String(body.description || "").trim();
        const glAccount = String(body.glAccount || "").trim();

        if (!costElement || !description || !glAccount) {
          return new Response(JSON.stringify({ error: "Cost Element, Description, and G/L Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { costElement } });

        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          costElement,
          description,
          glAccount,
          revenueCost: body.revenueCost || "Expense",
          requiresCallRef: body.requiresCallRef || "Yes",
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, mapping: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else if (costElement) {
          await delegate.deleteMany({ where: { costElement } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Cost Element is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 31. /api/labour-rates - Dedicated Labour Rates (MST-25)
    // =========================================================================
    if (path === "/api/labour-rates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).labourRateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Rate not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, rate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (rateCode) where.rateCode = rateCode;
        if (search) {
          where.OR = [
            { rateCode: { contains: search, mode: "insensitive" } },
            { technicianType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, rates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const rateCode = String(body.rateCode || "").trim();
        const technicianType = String(body.technicianType || "").trim();
        const normalRate = body.normalRate !== undefined && body.normalRate !== null ? parseFloat(String(body.normalRate).replace(/,/g, "")) : 0;

        if (!rateCode || !technicianType || isNaN(normalRate)) {
          return new Response(JSON.stringify({ error: "Rate Code, Technician Type, and valid Normal Rate are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { rateCode } });

        const overtimeRate = body.overtimeRate !== undefined && body.overtimeRate !== null ? parseFloat(String(body.overtimeRate).replace(/,/g, "")) : 0;
        const subcontractRate = body.subcontractRate !== undefined && body.subcontractRate !== null ? parseFloat(String(body.subcontractRate).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          rateCode,
          technicianType,
          normalRate,
          overtimeRate,
          subcontractRate,
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, rate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else if (rateCode) {
          await delegate.deleteMany({ where: { rateCode } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rate Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 32. /api/franchise-warehouses - Dedicated Franchise & Warehouse (MST-26)
    // =========================================================================
    if (path === "/api/franchise-warehouses") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).franchiseWarehouseMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Franchise warehouse not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warehouse: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (franchiseBp) where.franchiseBp = franchiseBp;
        if (search) {
          where.OR = [
            { franchiseBp: { contains: search, mode: "insensitive" } },
            { franchiseName: { contains: search, mode: "insensitive" } },
            { warehouse: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warehouses: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const franchiseBp = String(body.franchiseBp || "").trim();
        const franchiseName = String(body.franchiseName || "").trim();
        const warehouse = String(body.warehouse || "").trim();

        if (!franchiseBp || !franchiseName || !warehouse) {
          return new Response(JSON.stringify({ error: "Franchise BP, Name, and Warehouse are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { franchiseBp } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          franchiseBp,
          franchiseName,
          warehouse,
          stockOwnership: body.stockOwnership || "Telesonic Consignment Stock",
          region: body.region || null,
          countFrequency: body.countFrequency || "Monthly Physical Audit",
          auditor: body.auditor || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warehouse: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else if (franchiseBp) {
          await delegate.deleteMany({ where: { franchiseBp } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Franchise BP is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 33. /api/deviation-reasons - Dedicated Deviation Reasons (MST-27)
    // =========================================================================
    if (path === "/api/deviation-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).deviationReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();

        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const qtyThreshold = body.qtyThreshold !== undefined && body.qtyThreshold !== null ? parseInt(String(body.qtyThreshold), 10) : 1;
        const valueThresholdLkr = body.valueThresholdLkr !== undefined && body.valueThresholdLkr !== null ? parseFloat(String(body.valueThresholdLkr).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          recoverableFromFranchise: body.recoverableFromFranchise || "No (Telesonic Absorption)",
          qtyThreshold,
          valueThresholdLkr,
          escalationRecipients: body.escalationRecipients || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 34. /api/export-permissions - Dedicated Export Permissions (MST-28)
    // =========================================================================
    if (path === "/api/export-permissions") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).exportPermissionMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Permission not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, permission: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (role) where.role = role;
        if (reportGrid) where.reportGrid = reportGrid;
        if (search) {
          where.OR = [
            { role: { contains: search, mode: "insensitive" } },
            { reportGrid: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, permissions: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const role = String(body.role || "").trim();
        const reportGrid = String(body.reportGrid || "").trim();

        if (!role || !reportGrid) {
          return new Response(JSON.stringify({ error: "Role and Target Report / Grid are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) {
          existing = await delegate.findUnique({
            where: {
              role_reportGrid: { role, reportGrid },
            },
          });
        }

        const rowLimit = body.rowLimit !== undefined && body.rowLimit !== null ? parseInt(String(body.rowLimit), 10) : 5000;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          role,
          reportGrid,
          excel: body.excel || "Yes",
          pdf: body.pdf || "Yes",
          restrictedColumns: body.restrictedColumns || null,
          rowLimit,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, permission: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else if (role && reportGrid) {
          await delegate.deleteMany({ where: { role, reportGrid } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "ID or (Role and Report Grid) required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 35. /api/google-meet-settings - Dedicated Google Meet Settings (MST-29)
    // =========================================================================
    if (path === "/api/google-meet-settings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).googleMeetSettingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Setting not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, setting: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (workspaceDomain) where.workspaceDomain = workspaceDomain;
        if (search) {
          where.OR = [
            { workspaceDomain: { contains: search, mode: "insensitive" } },
            { organiserAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, settings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const workspaceDomain = String(body.workspaceDomain || "").trim();
        const organiserAccount = String(body.organiserAccount || "").trim();

        if (!workspaceDomain || !organiserAccount) {
          return new Response(JSON.stringify({ error: "Workspace Domain and Organiser Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { workspaceDomain } });

        const defaultDuration = body.defaultDuration !== undefined && body.defaultDuration !== null ? parseInt(String(body.defaultDuration), 10) : 45;
        const retryCount = body.retryCount !== undefined && body.retryCount !== null ? parseInt(String(body.retryCount), 10) : 3;
        const enabledVal = String(body.enabled || "Yes").trim();
        const computedStatus = enabledVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          workspaceDomain,
          organiserAccount,
          authMethod: body.authMethod || "Google Cloud Service Account JWT",
          defaultDuration,
          inviteCustomer: body.inviteCustomer || "Yes",
          inviteFranchise: body.inviteFranchise || "Yes",
          retryCount,
          enabled: enabledVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, setting: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else if (workspaceDomain) {
          await delegate.deleteMany({ where: { workspaceDomain } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Workspace Domain is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 36. /api/equipment-category-attributes - Dedicated Category Attributes (MST-30)
    // =========================================================================
    if (path === "/api/equipment-category-attributes") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentCategoryAttributeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Category not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, category: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (categoryCode) where.categoryCode = categoryCode;
        if (search) {
          where.OR = [
            { categoryCode: { contains: search, mode: "insensitive" } },
            { categoryName: { contains: search, mode: "insensitive" } },
            { industryGroup: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, categories: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const categoryCode = String(body.categoryCode || "").trim();
        const categoryName = String(body.categoryName || "").trim();

        if (!categoryCode || !categoryName) {
          return new Response(JSON.stringify({ error: "Category Code and Category Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { categoryCode } });

        const defaultInterval = body.defaultInterval !== undefined && body.defaultInterval !== null ? parseInt(String(body.defaultInterval), 10) : 3;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          categoryCode,
          categoryName,
          industryGroup: body.industryGroup || null,
          multiComponent: body.multiComponent || "No",
          meterType: body.meterType || "None",
          defaultIntervalBasis: body.defaultIntervalBasis || "Months (Calendar)",
          defaultInterval,
          checklistSet: body.checklistSet || null,
          warrantyRule: body.warrantyRule || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, category: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else if (categoryCode) {
          await delegate.deleteMany({ where: { categoryCode } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Category Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 37. /api/tool-vehicle-assets - Dedicated Tools, Boxes & Vehicles (MST-31)
    // =========================================================================
    if (path === "/api/tool-vehicle-assets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).toolVehicleAssetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Asset not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, asset: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (assetId) where.assetId = assetId;
        if (search) {
          where.OR = [
            { assetId: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { holder: { contains: search, mode: "insensitive" } },
            { vehicleRegNo: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, assets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const assetId = String(body.assetId || "").trim();
        const type = String(body.type || "").trim();
        const description = String(body.description || "").trim();

        if (!assetId || !type || !description) {
          return new Response(JSON.stringify({ error: "Asset ID, Type, and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { assetId } });

        const meterKm = body.meterKm !== undefined && body.meterKm !== null ? parseInt(String(body.meterKm), 10) : null;
        const status = String(body.status || "Available in Stores").trim();

        const payloadData = {
          assetId,
          type,
          description,
          holder: body.holder || null,
          vehicleRegNo: body.vehicleRegNo || null,
          meterKm,
          licenceExpiry: body.licenceExpiry ? new Date(body.licenceExpiry) : null,
          insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, asset: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else if (assetId) {
          await delegate.deleteMany({ where: { assetId } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Asset ID is required" }), { status: 400, headers });
        }
      }
    }




    // =========================================================================
    // 29. /api/project-budgets - Dedicated Project and G/L Budget (MST-23)
    // =========================================================================
    if (path === "/api/project-budgets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).projectBudgetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Budget not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, budget: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (projectCode) where.projectCode = projectCode;
        if (search) {
          where.OR = [
            { projectCode: { contains: search, mode: "insensitive" } },
            { projectName: { contains: search, mode: "insensitive" } },
            { customer: { contains: search, mode: "insensitive" } },
            { projectManager: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, budgets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const projectCode = String(body.projectCode || "").trim();
        const projectName = String(body.projectName || "").trim();
        const customer = String(body.customer || "").trim();
        const projectManager = String(body.projectManager || "").trim();

        if (!projectCode || !projectName || !customer || !projectManager) {
          return new Response(JSON.stringify({ error: "Project Code, Name, Customer, and Project Manager are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { projectCode } });

        const status = String(body.status || "Active").trim();
        const payloadData = {
          projectCode,
          projectName,
          customer,
          projectManager,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          budgetVersion: body.budgetVersion !== undefined && body.budgetVersion !== null ? parseInt(String(body.budgetVersion), 10) : 1,
          versionStatus: body.versionStatus || "Draft",
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, budget: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const projectCode = urlParams.get("projectCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else if (projectCode) {
          await delegate.deleteMany({ where: { projectCode } });
          return new Response(JSON.stringify({ success: true, message: "Budget deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Project Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 30. /api/cost-element-mappings - Dedicated Cost Element / G/L Mapping (MST-24)
    // =========================================================================
    if (path === "/api/cost-element-mappings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).costElementMappingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Mapping not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, mapping: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (costElement) where.costElement = costElement;
        if (search) {
          where.OR = [
            { costElement: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { glAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, mappings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const costElement = String(body.costElement || "").trim();
        const description = String(body.description || "").trim();
        const glAccount = String(body.glAccount || "").trim();

        if (!costElement || !description || !glAccount) {
          return new Response(JSON.stringify({ error: "Cost Element, Description, and G/L Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { costElement } });

        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          costElement,
          description,
          glAccount,
          revenueCost: body.revenueCost || "Expense",
          requiresCallRef: body.requiresCallRef || "Yes",
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, mapping: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const costElement = urlParams.get("costElement");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else if (costElement) {
          await delegate.deleteMany({ where: { costElement } });
          return new Response(JSON.stringify({ success: true, message: "Mapping deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Cost Element is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 31. /api/labour-rates - Dedicated Labour Rates (MST-25)
    // =========================================================================
    if (path === "/api/labour-rates") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).labourRateMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Rate not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, rate: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (rateCode) where.rateCode = rateCode;
        if (search) {
          where.OR = [
            { rateCode: { contains: search, mode: "insensitive" } },
            { technicianType: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, rates: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const rateCode = String(body.rateCode || "").trim();
        const technicianType = String(body.technicianType || "").trim();
        const normalRate = body.normalRate !== undefined && body.normalRate !== null ? parseFloat(String(body.normalRate).replace(/,/g, "")) : 0;

        if (!rateCode || !technicianType || isNaN(normalRate)) {
          return new Response(JSON.stringify({ error: "Rate Code, Technician Type, and valid Normal Rate are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { rateCode } });

        const overtimeRate = body.overtimeRate !== undefined && body.overtimeRate !== null ? parseFloat(String(body.overtimeRate).replace(/,/g, "")) : 0;
        const subcontractRate = body.subcontractRate !== undefined && body.subcontractRate !== null ? parseFloat(String(body.subcontractRate).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          rateCode,
          technicianType,
          normalRate,
          overtimeRate,
          subcontractRate,
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, rate: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const rateCode = urlParams.get("rateCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else if (rateCode) {
          await delegate.deleteMany({ where: { rateCode } });
          return new Response(JSON.stringify({ success: true, message: "Rate deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Rate Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 32. /api/franchise-warehouses - Dedicated Franchise & Warehouse (MST-26)
    // =========================================================================
    if (path === "/api/franchise-warehouses") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).franchiseWarehouseMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Franchise warehouse not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, warehouse: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (franchiseBp) where.franchiseBp = franchiseBp;
        if (search) {
          where.OR = [
            { franchiseBp: { contains: search, mode: "insensitive" } },
            { franchiseName: { contains: search, mode: "insensitive" } },
            { warehouse: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, warehouses: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const franchiseBp = String(body.franchiseBp || "").trim();
        const franchiseName = String(body.franchiseName || "").trim();
        const warehouse = String(body.warehouse || "").trim();

        if (!franchiseBp || !franchiseName || !warehouse) {
          return new Response(JSON.stringify({ error: "Franchise BP, Name, and Warehouse are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { franchiseBp } });

        const activeVal = String(body.active || "Yes").trim();
        const computedStatus = activeVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          franchiseBp,
          franchiseName,
          warehouse,
          stockOwnership: body.stockOwnership || "Telesonic Consignment Stock",
          region: body.region || null,
          countFrequency: body.countFrequency || "Monthly Physical Audit",
          auditor: body.auditor || null,
          active: activeVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, warehouse: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const franchiseBp = urlParams.get("franchiseBp");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else if (franchiseBp) {
          await delegate.deleteMany({ where: { franchiseBp } });
          return new Response(JSON.stringify({ success: true, message: "Franchise warehouse deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Franchise BP is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 33. /api/deviation-reasons - Dedicated Deviation Reasons (MST-27)
    // =========================================================================
    if (path === "/api/deviation-reasons") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).deviationReasonMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Reason not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, reason: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (reasonCode) where.reasonCode = reasonCode;
        if (search) {
          where.OR = [
            { reasonCode: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, reasons: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const reasonCode = String(body.reasonCode || "").trim();
        const description = String(body.description || "").trim();

        if (!reasonCode || !description) {
          return new Response(JSON.stringify({ error: "Reason Code and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { reasonCode } });

        const qtyThreshold = body.qtyThreshold !== undefined && body.qtyThreshold !== null ? parseInt(String(body.qtyThreshold), 10) : 1;
        const valueThresholdLkr = body.valueThresholdLkr !== undefined && body.valueThresholdLkr !== null ? parseFloat(String(body.valueThresholdLkr).replace(/,/g, "")) : 0;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          reasonCode,
          description,
          recoverableFromFranchise: body.recoverableFromFranchise || "No (Telesonic Absorption)",
          qtyThreshold,
          valueThresholdLkr,
          escalationRecipients: body.escalationRecipients || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, reason: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const reasonCode = urlParams.get("reasonCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else if (reasonCode) {
          await delegate.deleteMany({ where: { reasonCode } });
          return new Response(JSON.stringify({ success: true, message: "Reason deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Reason Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 34. /api/export-permissions - Dedicated Export Permissions (MST-28)
    // =========================================================================
    if (path === "/api/export-permissions") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).exportPermissionMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Permission not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, permission: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (role) where.role = role;
        if (reportGrid) where.reportGrid = reportGrid;
        if (search) {
          where.OR = [
            { role: { contains: search, mode: "insensitive" } },
            { reportGrid: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, permissions: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const role = String(body.role || "").trim();
        const reportGrid = String(body.reportGrid || "").trim();

        if (!role || !reportGrid) {
          return new Response(JSON.stringify({ error: "Role and Target Report / Grid are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) {
          existing = await delegate.findUnique({
            where: {
              role_reportGrid: { role, reportGrid },
            },
          });
        }

        const rowLimit = body.rowLimit !== undefined && body.rowLimit !== null ? parseInt(String(body.rowLimit), 10) : 5000;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          role,
          reportGrid,
          excel: body.excel || "Yes",
          pdf: body.pdf || "Yes",
          restrictedColumns: body.restrictedColumns || null,
          rowLimit,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, permission: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const role = urlParams.get("role");
        const reportGrid = urlParams.get("reportGrid");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else if (role && reportGrid) {
          await delegate.deleteMany({ where: { role, reportGrid } });
          return new Response(JSON.stringify({ success: true, message: "Permission deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "ID or (Role and Report Grid) required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 35. /api/google-meet-settings - Dedicated Google Meet Settings (MST-29)
    // =========================================================================
    if (path === "/api/google-meet-settings") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).googleMeetSettingMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Setting not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, setting: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (workspaceDomain) where.workspaceDomain = workspaceDomain;
        if (search) {
          where.OR = [
            { workspaceDomain: { contains: search, mode: "insensitive" } },
            { organiserAccount: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, settings: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const workspaceDomain = String(body.workspaceDomain || "").trim();
        const organiserAccount = String(body.organiserAccount || "").trim();

        if (!workspaceDomain || !organiserAccount) {
          return new Response(JSON.stringify({ error: "Workspace Domain and Organiser Account are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { workspaceDomain } });

        const defaultDuration = body.defaultDuration !== undefined && body.defaultDuration !== null ? parseInt(String(body.defaultDuration), 10) : 45;
        const retryCount = body.retryCount !== undefined && body.retryCount !== null ? parseInt(String(body.retryCount), 10) : 3;
        const enabledVal = String(body.enabled || "Yes").trim();
        const computedStatus = enabledVal.toLowerCase() === "no" ? "Inactive" : "Active";

        const payloadData = {
          workspaceDomain,
          organiserAccount,
          authMethod: body.authMethod || "Google Cloud Service Account JWT",
          defaultDuration,
          inviteCustomer: body.inviteCustomer || "Yes",
          inviteFranchise: body.inviteFranchise || "Yes",
          retryCount,
          enabled: enabledVal,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, setting: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const workspaceDomain = urlParams.get("workspaceDomain");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else if (workspaceDomain) {
          await delegate.deleteMany({ where: { workspaceDomain } });
          return new Response(JSON.stringify({ success: true, message: "Setting deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Workspace Domain is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 36. /api/equipment-category-attributes - Dedicated Category Attributes (MST-30)
    // =========================================================================
    if (path === "/api/equipment-category-attributes") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).equipmentCategoryAttributeMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Category not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, category: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (categoryCode) where.categoryCode = categoryCode;
        if (search) {
          where.OR = [
            { categoryCode: { contains: search, mode: "insensitive" } },
            { categoryName: { contains: search, mode: "insensitive" } },
            { industryGroup: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, categories: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const categoryCode = String(body.categoryCode || "").trim();
        const categoryName = String(body.categoryName || "").trim();

        if (!categoryCode || !categoryName) {
          return new Response(JSON.stringify({ error: "Category Code and Category Name are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { categoryCode } });

        const defaultInterval = body.defaultInterval !== undefined && body.defaultInterval !== null ? parseInt(String(body.defaultInterval), 10) : 3;
        const activeVal = String(body.active || (body.status === "Inactive" ? "No" : "Yes")).trim();
        const computedStatus = activeVal.toLowerCase() === "no" || body.status === "Inactive" ? "Inactive" : "Active";

        const payloadData = {
          categoryCode,
          categoryName,
          industryGroup: body.industryGroup || null,
          multiComponent: body.multiComponent || "No",
          meterType: body.meterType || "None",
          defaultIntervalBasis: body.defaultIntervalBasis || "Months (Calendar)",
          defaultInterval,
          checklistSet: body.checklistSet || null,
          warrantyRule: body.warrantyRule || null,
          status: computedStatus,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, category: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const categoryCode = urlParams.get("categoryCode");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else if (categoryCode) {
          await delegate.deleteMany({ where: { categoryCode } });
          return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Category Code is required" }), { status: 400, headers });
        }
      }
    }

    // =========================================================================
    // 37. /api/tool-vehicle-assets - Dedicated Tools, Boxes & Vehicles (MST-31)
    // =========================================================================
    if (path === "/api/tool-vehicle-assets") {
      const urlParams = new URL(request.url).searchParams;
      const delegate = (prisma as any).toolVehicleAssetMaster;

      if (method === "GET") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");
        const search = urlParams.get("search")?.toLowerCase().trim();

        if (id) {
          const rec = await delegate.findUnique({ where: { id: Number(id) } });
          if (!rec) return new Response(JSON.stringify({ error: "Asset not found" }), { status: 404, headers });
          return new Response(JSON.stringify({ success: true, asset: rec }), { status: 200, headers });
        }

        const where: any = {};
        if (assetId) where.assetId = assetId;
        if (search) {
          where.OR = [
            { assetId: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { holder: { contains: search, mode: "insensitive" } },
            { vehicleRegNo: { contains: search, mode: "insensitive" } },
          ];
        }

        const list = await delegate.findMany({ where, orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, assets: list }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const assetId = String(body.assetId || "").trim();
        const type = String(body.type || "").trim();
        const description = String(body.description || "").trim();

        if (!assetId || !type || !description) {
          return new Response(JSON.stringify({ error: "Asset ID, Type, and Description are required" }), { status: 400, headers });
        }

        const id = body.id ? Number(body.id) : undefined;
        let existing;
        if (id) existing = await delegate.findUnique({ where: { id } });
        if (!existing) existing = await delegate.findUnique({ where: { assetId } });

        const meterKm = body.meterKm !== undefined && body.meterKm !== null ? parseInt(String(body.meterKm), 10) : null;
        const status = String(body.status || "Available in Stores").trim();

        const payloadData = {
          assetId,
          type,
          description,
          holder: body.holder || null,
          vehicleRegNo: body.vehicleRegNo || null,
          meterKm,
          licenceExpiry: body.licenceExpiry ? new Date(body.licenceExpiry) : null,
          insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
          status,
        };

        let saved;
        if (existing) {
          saved = await delegate.update({ where: { id: existing.id }, data: payloadData });
        } else {
          saved = await delegate.create({ data: payloadData });
        }

        return new Response(JSON.stringify({ success: true, asset: saved }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const id = urlParams.get("id");
        const assetId = urlParams.get("assetId");

        if (id) {
          await delegate.deleteMany({ where: { id: Number(id) } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else if (assetId) {
          await delegate.deleteMany({ where: { assetId } });
          return new Response(JSON.stringify({ success: true, message: "Asset deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "Asset ID is required" }), { status: 400, headers });
        }
      }
    }

    // 19. /api/masters — Unified CRUD for all Master Screens (MST-13 to MST-31) in PostgreSQL
    if (path === "/api/masters") {
      const urlParams = new URL(request.url).searchParams;
      const screenCode = urlParams.get("screenCode")?.toUpperCase().trim();

      if (method === "GET") {
        if (!screenCode) {
          return new Response(JSON.stringify({ error: "screenCode query parameter is required" }), { status: 400, headers });
        }
        const records = await prisma.masterRecord.findMany({
          where: { screenCode },
          orderBy: { id: "desc" },
        });

        // Unpack data json along with id, status, createdAt, updatedAt
        const unpacked = records.map((r: any) => {
          const baseData = typeof r.data === "object" && r.data !== null ? (r.data as Record<string, unknown>) : {};
          return {
            ...baseData,
            _dbId: r.id,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          };
        });

        return new Response(JSON.stringify({ success: true, records: unpacked }), { status: 200, headers });
      }

      if (method === "POST") {
        const body = await request.json();
        const sc = String(body.screenCode || screenCode || "").toUpperCase().trim();
        const recordKey = String(body.recordKey || "").trim();
        const recordData = body.data || body;
        const status = String(recordData.status || body.status || "Active");

        if (!sc || !recordKey) {
          return new Response(JSON.stringify({ error: "screenCode and recordKey are mandatory" }), { status: 400, headers });
        }

        const saved = await prisma.masterRecord.upsert({
          where: {
            screenCode_recordKey: {
              screenCode: sc,
              recordKey: recordKey,
            },
          },
          update: {
            data: recordData,
            status: status,
          },
          create: {
            screenCode: sc,
            recordKey: recordKey,
            data: recordData,
            status: status,
          },
        });

        const unpacked = {
          ...(typeof saved.data === "object" && saved.data !== null ? (saved.data as Record<string, unknown>) : {}),
          _dbId: saved.id,
          status: saved.status,
          createdAt: saved.createdAt.toISOString(),
          updatedAt: saved.updatedAt.toISOString(),
        };

        return new Response(JSON.stringify({ success: true, record: unpacked }), { status: 201, headers });
      }

      if (method === "DELETE") {
        const recordKey = urlParams.get("recordKey");
        const dbId = urlParams.get("id");

        if (dbId) {
          await prisma.masterRecord.deleteMany({ where: { id: Number(dbId) } });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else if (screenCode && recordKey) {
          await prisma.masterRecord.deleteMany({
            where: {
              screenCode: screenCode,
              recordKey: recordKey,
            },
          });
          return new Response(JSON.stringify({ success: true, message: "Record deleted" }), { status: 200, headers });
        } else {
          return new Response(JSON.stringify({ error: "id or (screenCode and recordKey) required" }), { status: 400, headers });
        }
      }
    }

    return new Response(JSON.stringify({ error: `Not Found: ${path}` }), {
      status: 404,
      headers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error(`[API Error] ${path}:`, error);
    return new Response(
      JSON.stringify({
        error: message,
        database: "PostgreSQL",
      }),
      { status: 500, headers },
    );
  }
}
