import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const state = searchParams.get('state');

  const esp32Url = `http://192.168.0.20`; // Cambia <ESP32_IP> por la IP de tu ESP32

  try {
    let endpoint = '';
    if (type === 'system') endpoint = `/control?state=${state}`;
    if (type === 'alarm') endpoint = `/alarm-control?state=${state}`;
    if (type === 'reset') endpoint = `/reset-alarm`;

    const response = await fetch(`${esp32Url}${endpoint}`);
    const data = await response.text();

    return NextResponse.json({ message: data });
  } catch (error) {
    console.error('Error al conectar con ESP32:', error);
    return NextResponse.json({ message: 'Error al conectar con ESP32' }, { status: 500 });
  }
}