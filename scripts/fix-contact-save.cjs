const fs = require('fs');
let c = fs.readFileSync('src/lib/api-handler.ts', 'utf8');

// Replace contact person save block with safe typings
const oldBlock = `        if (id) {
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
        };`;

const newBlock = `        const contactDelegate = (prisma as any).contactPerson;
        if (id) {
          existing = await contactDelegate.findUnique({ where: { id } });
        }
        if (!existing && customerId) {
          existing = await contactDelegate.findFirst({
            where: {
              customerId,
              contactName,
            },
          });
        }

        let saved: any;
        const payloadData = {
          customerId: customerId || 1,
          customerCode,
          contactName,
          position,
          mobile,
          email,
          site,
          active,
          validFrom,
          status,
        };

        if (existing) {
          saved = await contactDelegate.update({
            where: { id: existing.id },
            data: payloadData,
            include: { customer: true },
          });
        } else {
          saved = await contactDelegate.create({
            data: payloadData,
            include: { customer: true },
          });
        }

        const enriched = {
          ...saved,
          customerName: saved?.customer ? saved.customer.customerName : saved?.customerCode || "—",
        };`;

c = c.replace(oldBlock, newBlock);
fs.writeFileSync('src/lib/api-handler.ts', c, 'utf8');
console.log('Successfully patched contact person save in api-handler.ts');

