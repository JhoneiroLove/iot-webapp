import { NextResponse } from 'next/server';

export async function GET() {
  const esp32Url = `http://192.168.36.50/sensor-status`; // Cambia <ESP32_IP> por la IP de tu ESP32

  try {
    const response = await fetch(esp32Url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al obtener el estado de los sensores:', error);
    return NextResponse.json({ message: 'Error al obtener el estado de los sensores' }, { status: 500 });
  }
}
