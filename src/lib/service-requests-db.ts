/**
 * PostgreSQL Service Requests Database Service
 * Provides full CRUD operations for Unified Service Requests (TRX-01)
 * directly against PostgreSQL via Prisma.
 */

import { prisma } from "@/lib/prisma";

export interface ServiceRequestRecord {
  id: string;
  requestNo?: string | null;
  requestDate?: string | null;
  channel?: string | null;
  receivedBy?: string | null;
  customer?: string | null;
  customerName?: string | null;
  contact?: string | null;
  site?: string | null;
  requestType?: string | null;
  callType?: string | null;
  priority?: string;
  equipmentSystem?: string | null;
  customerOrigin?: string | null;
  equipmentOrigin?: string | null;
  entitlement?: string | null;
  status: string;
  description?: string | null;
  title?: string | null;
  assignedTo?: string | null;
  scheduledDate?: string | null;
  data?: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getAllServiceRequests(): Promise<ServiceRequestRecord[]> {
  try {
    const list = await prisma.serviceRequest.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return list as unknown as ServiceRequestRecord[];
  } catch (error) {
    console.error("[PostgreSQL] Error in getAllServiceRequests:", error);
    return [];
  }
}

export async function getServiceRequestById(id: string): Promise<ServiceRequestRecord | null> {
  try {
    const item = await prisma.serviceRequest.findFirst({
      where: {
        OR: [{ id }, { requestNo: id }],
      },
    });
    return (item as unknown as ServiceRequestRecord) || null;
  } catch (error) {
    console.error("[PostgreSQL] Error in getServiceRequestById:", error);
    return null;
  }
}

export async function createServiceRequest(
  payload: Record<string, unknown>,
): Promise<ServiceRequestRecord> {
  const reqNo =
    (payload.requestNo as string) ||
    `SR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const id = (payload.id as string) || reqNo;

  const dataToInsert = {
    id,
    requestNo: reqNo,
    requestDate: (payload.requestDate as string) || new Date().toISOString().split("T")[0],
    channel: (payload.channel as string) || "Dedicated Hotline / Phone Inbound",
    receivedBy: (payload.receivedBy as string) || "Kasun Perera (Service Coordinator)",
    customer: (payload.customer as string) || "Rajapaksha Clinic & Diagnostic Labs (C-30512)",
    customerName: (payload.customerName as string) || (payload.customer as string) || "Customer",
    contact: (payload.contact as string) || "Dr. Nimal Rajapaksha",
    site: (payload.site as string) || "No. 142/B, Peradeniya Road, Kandy",
    requestType: (payload.requestType as string) || "Breakdown Repair",
    callType: (payload.callType as string) || (payload.requestType as string) || "Breakdown",
    priority: (payload.priority as string) || "P1 - Critical",
    equipmentSystem: (payload.equipmentSystem as string) || "Daikin VRV IV-X System",
    customerOrigin: (payload.customerOrigin as string) || "Telesonic Sold",
    equipmentOrigin: (payload.equipmentOrigin as string) || "Telesonic Sold",
    entitlement: (payload.entitlement as string) || "Under Warranty",
    status: (payload.status as string) || "Draft",
    description: (payload.description as string) || "",
    title: (payload.title as string) || (payload.description as string) || `Request ${reqNo}`,
    assignedTo: (payload.assignedTo as string) || null,
    scheduledDate: (payload.scheduledDate as string) || null,
    data: (payload.data as object) || payload,
  };

  const created = await prisma.serviceRequest.upsert({
    where: { id },
    update: dataToInsert,
    create: dataToInsert,
  });

  return created as unknown as ServiceRequestRecord;
}

export async function updateServiceRequest(
  id: string,
  payload: Record<string, unknown>,
): Promise<ServiceRequestRecord | null> {
  try {
    const existing = await getServiceRequestById(id);
    if (!existing) return null;

    const dataToUpdate = {
      requestDate: (payload.requestDate as string) ?? existing.requestDate,
      channel: (payload.channel as string) ?? existing.channel,
      receivedBy: (payload.receivedBy as string) ?? existing.receivedBy,
      customer: (payload.customer as string) ?? existing.customer,
      customerName: (payload.customerName as string) ?? existing.customerName,
      contact: (payload.contact as string) ?? existing.contact,
      site: (payload.site as string) ?? existing.site,
      requestType: (payload.requestType as string) ?? existing.requestType,
      callType: (payload.callType as string) ?? existing.callType,
      priority: (payload.priority as string) ?? existing.priority,
      equipmentSystem: (payload.equipmentSystem as string) ?? existing.equipmentSystem,
      customerOrigin: (payload.customerOrigin as string) ?? existing.customerOrigin,
      equipmentOrigin: (payload.equipmentOrigin as string) ?? existing.equipmentOrigin,
      entitlement: (payload.entitlement as string) ?? existing.entitlement,
      status: (payload.status as string) ?? existing.status,
      description: (payload.description as string) ?? existing.description,
      title: (payload.title as string) ?? existing.title,
      assignedTo: (payload.assignedTo as string) ?? existing.assignedTo,
      scheduledDate: (payload.scheduledDate as string) ?? existing.scheduledDate,
      data: (payload.data as object) || payload,
    };

    const updated = await prisma.serviceRequest.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    return updated as unknown as ServiceRequestRecord;
  } catch (error) {
    console.error("[PostgreSQL] Error in updateServiceRequest:", error);
    return null;
  }
}

export async function deleteServiceRequest(id: string): Promise<boolean> {
  try {
    const existing = await getServiceRequestById(id);
    if (!existing) return false;

    await prisma.serviceRequest.delete({
      where: { id: existing.id },
    });
    return true;
  } catch (error) {
    console.error("[PostgreSQL] Error in deleteServiceRequest:", error);
    return false;
  }
}

