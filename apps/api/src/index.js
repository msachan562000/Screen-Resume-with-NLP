
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_, res)=> res.json({ ok:true, time: new Date().toISOString() }));

// --- Clients CRUD ---
app.get('/api/clients', async (req, res) => {
  const list = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(list);
});
app.post('/api/clients', async (req, res) => {
  const schema = z.object({ name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional() });
  const data = schema.parse(req.body);
  const created = await prisma.client.create({ data });
  res.status(201).json(created);
});
app.patch('/api/clients/:id', async (req, res) => {
  const id = req.params.id;
  const schema = z.object({ name: z.string().optional(), email: z.string().email().optional().nullable(), phone: z.string().optional().nullable() });
  const data = schema.parse(req.body);
  const updated = await prisma.client.update({ where: { id }, data });
  res.json(updated);
});
app.delete('/api/clients/:id', async (req, res) => {
  const id = req.params.id;
  await prisma.client.delete({ where: { id } });
  res.status(204).end();
});

// --- Staff CRUD ---
app.get('/api/staff', async (_, res) => res.json(await prisma.staff.findMany({ orderBy:{ createdAt:'desc' } })));
app.post('/api/staff', async (req, res) => {
  const schema = z.object({ name: z.string().min(1), role: z.string().min(1) });
  const created = await prisma.staff.create({ data: schema.parse(req.body) });
  res.status(201).json(created);
});

// --- Services CRUD ---
app.get('/api/services', async (_, res) => res.json(await prisma.service.findMany({ orderBy:{ createdAt:'desc' } })));
app.post('/api/services', async (req, res) => {
  const schema = z.object({ name: z.string().min(1), duration: z.number().int().min(5), price: z.number().int().min(0) });
  const created = await prisma.service.create({ data: schema.parse(req.body) });
  res.status(201).json(created);
});

// --- Appointments ---
function overlaps(startA, durA, startB, durB) {
  const endA = new Date(startA.getTime() + durA*60000);
  const endB = new Date(startB.getTime() + durB*60000);
  return startA < endB && startB < endA;
}
app.get('/api/appointments', async (req, res) => {
  const { date } = req.query;
  let where = {};
  if (date) {
    const start = new Date(String(date));
    const end = new Date(start);
    end.setDate(end.getDate()+1);
    where = { date: { gte: start, lt: end } };
  }
  const list = await prisma.appointment.findMany({
    where,
    orderBy: { date: 'asc' },
    include: { client:true, staff:true, service:true }
  });
  res.json(list);
});
app.post('/api/appointments', async (req, res) => {
  const schema = z.object({
    date: z.string().datetime(),
    duration: z.number().int().min(5),
    clientId: z.string(),
    staffId: z.string(),
    serviceId: z.string(),
    status: z.string().optional(),
    notes: z.string().optional().nullable(),
  });
  const data = schema.parse(req.body);
  // conflict check for staff
  const sameDay = await prisma.appointment.findMany({
    where: {
      staffId: data.staffId,
      date: {
        gte: new Date(new Date(data.date).setHours(0,0,0,0)),
        lt: new Date(new Date(data.date).setHours(23,59,59,999))
      }
    }
  });
  const startNew = new Date(data.date);
  const conflict = sameDay.find(a => overlaps(startNew, data.duration, a.date, a.duration));
  if (conflict) return res.status(409).json({ error: 'Time conflict with another appointment', conflictId: conflict.id });

  const created = await prisma.appointment.create({ data });
  res.status(201).json(created);
});
app.patch('/api/appointments/:id', async (req, res) => {
  const id = req.params.id;
  const schema = z.object({ date: z.string().datetime().optional(), duration: z.number().int().optional(), status: z.string().optional(), notes: z.string().optional().nullable() });
  const data = schema.parse(req.body);
  const updated = await prisma.appointment.update({ where: { id }, data });
  res.json(updated);
});
app.delete('/api/appointments/:id', async (req, res) => {
  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// --- Invoices & Dummy Payments ---
app.get('/api/invoices', async (_, res) => {
  const list = await prisma.invoice.findMany({ orderBy:{ createdAt:'desc' }, include:{ client:true, service:true } });
  res.json(list);
});
app.post('/api/invoices', async (req, res) => {
  const schema = z.object({ amount: z.number().int().min(0), clientId: z.string(), serviceId: z.string(), appointmentId: z.string().optional().nullable() });
  const created = await prisma.invoice.create({ data: schema.parse(req.body) });
  res.status(201).json(created);
});
app.post('/api/payments/collect', async (req, res) => {
  const schema = z.object({ invoiceId: z.string() });
  const { invoiceId } = schema.parse(req.body);
  // simulate payment success
  const updated = await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'paid' } });
  res.json({ ok:true, invoice: updated });
});

// Serve built web if present (optional)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webBuild = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webBuild));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(webBuild, 'index.html'), err => {
    if (err) res.status(404).send('');
  });
});

app.listen(PORT, ()=> console.log(`API listening on http://localhost:${PORT}`));
