
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // basic upserts
  const [s1, s2, s3] = await Promise.all([
    prisma.staff.upsert({ where:{ id:'seed-s1' }, update:{}, create:{ id:'seed-s1', name:'Dr. Anika Rao', role:'Dermatologist' } }),
    prisma.staff.upsert({ where:{ id:'seed-s2' }, update:{}, create:{ id:'seed-s2', name:'Dr. Kabir Shah', role:'Dentist' } }),
    prisma.staff.upsert({ where:{ id:'seed-s3' }, update:{}, create:{ id:'seed-s3', name:'Priya Mehta', role:'Physiotherapist' } }),
  ]);
  const [svc1, svc2, svc3, svc4] = await Promise.all([
    prisma.service.upsert({ where:{ id:'seed-svc1' }, update:{}, create:{ id:'seed-svc1', name:'General Consultation', duration:30, price:4900 } }),
    prisma.service.upsert({ where:{ id:'seed-svc2' }, update:{}, create:{ id:'seed-svc2', name:'Dental Check-up', duration:45, price:7900 } }),
    prisma.service.upsert({ where:{ id:'seed-svc3' }, update:{}, create:{ id:'seed-svc3', name:'Skin Consultation', duration:30, price:6900 } }),
    prisma.service.upsert({ where:{ id:'seed-svc4' }, update:{}, create:{ id:'seed-svc4', name:'Physio Session', duration:60, price:8900 } }),
  ]);
  const [c1, c2, c3] = await Promise.all([
    prisma.client.upsert({ where:{ email:'rahul@example.com' }, update:{}, create:{ name:'Rahul Verma', email:'rahul@example.com', phone:'+91 98765 43210' } }),
    prisma.client.upsert({ where:{ email:'sana@example.com' }, update:{}, create:{ name:'Sana Ali', email:'sana@example.com', phone:'+91 99220 11888' } }),
    prisma.client.upsert({ where:{ email:'john@example.com' }, update:{}, create:{ name:'John Parker', email:'john@example.com', phone:'+1 415 555 0123' } }),
  ]);
  const today = new Date('2025-08-13T00:00:00');
  await prisma.appointment.createMany({
    data: [
      { date: new Date('2025-08-13T10:00:00'), duration: 45, status:'confirmed', clientId: c1.id, staffId: s2.id, serviceId: svc2.id },
      { date: new Date('2025-08-13T11:30:00'), duration: 30, status:'pending', clientId: c2.id, staffId: s1.id, serviceId: svc3.id },
      { date: new Date('2025-08-14T16:00:00'), duration: 60, status:'confirmed', clientId: c3.id, staffId: s3.id, serviceId: svc4.id },
    ]
  });
  console.log('Seeded ✅');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
