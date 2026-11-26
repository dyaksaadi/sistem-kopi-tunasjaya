import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.priceHistory.createMany({
    data: [
      { date: new Date('2026-01-01'), price: 45000, type: 'GREEN_BEAN' },
      { date: new Date('2026-02-01'), price: 47000, type: 'GREEN_BEAN' },
      { date: new Date('2026-03-01'), price: 46500, type: 'GREEN_BEAN' },
      { date: new Date('2026-04-01'), price: 48000, type: 'GREEN_BEAN' },
      { date: new Date('2026-05-01'), price: 49500, type: 'GREEN_BEAN' },
    ],
    skipDuplicates: true,
  });

  await prisma.salesDemand.createMany({
    data: [
      { date: new Date('2026-01-01'), product: 'KOPI_BUBUK_HALUS', quantity: 120 },
      { date: new Date('2026-02-01'), product: 'KOPI_BUBUK_HALUS', quantity: 135 },
      { date: new Date('2026-03-01'), product: 'KOPI_BUBUK_HALUS', quantity: 130 },
      { date: new Date('2026-04-01'), product: 'KOPI_BUBUK_HALUS', quantity: 145 },
      { date: new Date('2026-05-01'), product: 'KOPI_BUBUK_HALUS', quantity: 150 },
    ],
    skipDuplicates: true,
  });

  await prisma.stock.createMany({
    data: [
      { category: 'GREEN_BEAN', name: 'Green Bean Robusta Grade A', quantity: 450, minLimit: 100, unit: 'kg' },
      { category: 'BUBUK', name: 'Kopi Bubuk Kemasan 250gr', quantity: 85, minLimit: 50, unit: 'pcs' },
      { category: 'KEMASAN', name: 'Pouch Aluminium Foil 250g', quantity: 300, minLimit: 100, unit: 'pcs' },
    ],
    skipDuplicates: true,
  });

  await prisma.productionOrder.createMany({
    data: [
      { orderNo: 'PRD-2026-001', product: 'Kopi Bubuk Halus 250g', quantity: 150, status: 'COMPLETED', startDate: new Date('2026-05-01'), targetDate: new Date('2026-05-05') },
      { orderNo: 'PRD-2026-002', product: 'Kopi Bubuk Kasar 500g', quantity: 100, status: 'PRODUCING', startDate: new Date('2026-05-20'), targetDate: new Date('2026-05-28') },
    ],
    skipDuplicates: true,
  });

  await prisma.supplyChainPartner.createMany({
    data: [
      { name: 'Kelompok Tani Makmur Teras', role: 'PETANI', material: 'Green Bean Robusta', rating: 4.8, contact: '081234567890' },
      { name: 'UD Kemasan Jaya Mandiri', role: 'SUPPLIER', material: 'Packaging Pouch', rating: 4.5, contact: '081987654321' },
      { name: 'Distributor Kopi Nusantara', role: 'DISTRIBUTOR', material: 'Kopi Bubuk Siap Jual', rating: 4.9, contact: '081122334455' },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding full SCM database finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
