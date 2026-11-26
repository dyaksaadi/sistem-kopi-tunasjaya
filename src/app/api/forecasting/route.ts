import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { singleExponentialSmoothing, movingAverage, calculateMAPE } from '@/lib/forecasting';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'price';

  if (type === 'price') {
    const history = await prisma.priceHistory.findMany({ orderBy: { date: 'asc' } });
    const prices = history.map(h => h.price);
    const alpha = 0.3;
    const { forecasts, nextForecast } = singleExponentialSmoothing(prices, alpha);
    const mape = calculateMAPE(prices, forecasts);

    return NextResponse.json({
      history,
      forecasts,
      nextForecast,
      mape: isNaN(mape) ? 0 : mape,
      status: (!isNaN(mape) && mape < 10) ? 'EXCELLENT' : 'REVIEW_NEEDED'
    });
  } else if (type === 'demand') {
    const history = await prisma.salesDemand.findMany({ orderBy: { date: 'asc' } });
    const demand = history.map(h => h.quantity);
    const n = 3;
    const { forecasts, nextForecast } = movingAverage(demand, n);
    const mape = calculateMAPE(demand, forecasts);

    return NextResponse.json({
      history,
      forecasts,
      nextForecast,
      mape: isNaN(mape) ? 0 : mape,
      status: (!isNaN(mape) && mape < 10) ? 'EXCELLENT' : 'REVIEW_NEEDED'
    });
  } else if (type === 'overview') {
    const stock = await prisma.stock.findMany();
    const production = await prisma.productionOrder.findMany();
    const partners = await prisma.supplyChainPartner.findMany();

    return NextResponse.json({
      stock,
      production,
      partners
    });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'add_stock') {
      const newStock = await prisma.stock.create({
        data: {
          name: data.name,
          category: data.category || 'GREEN_BEAN',
          quantity: parseFloat(data.quantity) || 0,
          minLimit: parseFloat(data.minLimit) || 10,
          unit: data.unit || 'kg',
        }
      });
      return NextResponse.json({ success: true, data: newStock });
    }

    if (action === 'update_stock') {
      const updated = await prisma.stock.update({
        where: { id: data.id },
        data: {
          quantity: parseFloat(data.quantity),
        }
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'add_production') {
      const newProd = await prisma.productionOrder.create({
        data: {
          orderNo: `PRD-${Date.now().toString().slice(-6)}`,
          product: data.product,
          quantity: parseFloat(data.quantity),
          status: 'PENDING',
          startDate: new Date(),
          targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        }
      });
      return NextResponse.json({ success: true, data: newProd });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
