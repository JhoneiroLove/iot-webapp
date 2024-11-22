'use client';

import { useState, useEffect } from 'react';

const ESP32_BASE_URL = 'http://192.168.1.48'; // Cambia esto si la IP de tu ESP32 es diferente

export default function Home() {
  const [systemStatus, setSystemStatus] = useState('Apagado');
  const [alarmStatus, setAlarmStatus] = useState('Desactivada');
  const [sensorStatus, setSensorStatus] = useState({
    pir1: false,
    pir2: false,
    pir3: false,
  });
  const [activityLog, setActivityLog] = useState<string[]>([]);

  // Función para manejar el estado del sistema
  const controlSystem = async (command: string) => {
    try {
      const response = await fetch(`${ESP32_BASE_URL}/control?state=${command}`);
      const data = await response.text();
      if (command === 'on') {
        setSystemStatus('Encendido');
        setAlarmStatus('Activada');
      } else {
        setSystemStatus('Apagado');
        setAlarmStatus('Desactivada');
      }
      alert(data);
    } catch (error) {
      console.error('Error al conectar con el ESP32:', error);
    }
  };

  // Función para manejar la alarma
  const controlAlarm = async (command: string) => {
    try {
      const response = await fetch(`${ESP32_BASE_URL}/alarm-control?state=${command}`);
      const data = await response.text();
      if (command === 'on') {
        setAlarmStatus('Activada');
      } else {
        setAlarmStatus('Desactivada');
      }
      alert(data);
    } catch (error) {
      console.error('Error al conectar con el ESP32:', error);
    }
  };

  // Función para reiniciar la alarma
  const resetAlarm = async () => {
    try {
      const response = await fetch(`${ESP32_BASE_URL}/reset-alarm`);
      const data = await response.text();
      alert(data);
    } catch (error) {
      console.error('Error al conectar con el ESP32:', error);
    }
  };

  // Función para actualizar el estado de los sensores
  const updateSensors = async () => {
    try {
      const response = await fetch(`${ESP32_BASE_URL}/sensor-status`);
      const data = await response.json();
      setSensorStatus(data);
    } catch (error) {
      console.error('Error al conectar con el ESP32:', error);
    }
  };

  // WebSocket para el registro de actividad
  useEffect(() => {
    const ws = new WebSocket(`ws://${ESP32_BASE_URL.split('//')[1]}/ws`);

    ws.onopen = () => {
      console.log('Conexión WebSocket establecida');
    };

    ws.onmessage = (event) => {
      setActivityLog((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${event.data}`]);
    };

    ws.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket cerrado');
    };

    return () => ws.close();
  }, []);

  // Actualización periódica de sensores
  useEffect(() => {
    const interval = setInterval(updateSensors, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', padding: '20px' }}>
      <h1>Sistema de Seguridad ESP32</h1>
      <button onClick={() => controlSystem('on')}>Encender Sistema</button>
      <button onClick={() => controlSystem('off')}>Apagar Sistema</button>
      <button onClick={() => controlAlarm('on')}>Activar Alarma</button>
      <button onClick={() => controlAlarm('off')}>Desactivar Alarma</button>
      <button onClick={resetAlarm}>Detener Alarma</button>

      <h2>Estado del Sistema</h2>
      <p>{systemStatus}</p>

      <h2>Estado de los Sensores</h2>
      <p>
        PIR 1: {sensorStatus.pir1 ? 'Activo' : 'Inactivo'} | PIR 2: {sensorStatus.pir2 ? 'Activo' : 'Inactivo'} | PIR 3:{' '}
        {sensorStatus.pir3 ? 'Activo' : 'Inactivo'}
      </p>

      <h2>Estado de la Alarma</h2>
      <p>{alarmStatus}</p>

      <h2>Registro de Actividad</h2>
      <div
        style={{
          background: '#e0e0e0',
          borderRadius: '8px',
          padding: '10px',
          overflowY: 'auto',
          maxHeight: '200px',
          fontSize: '14px',
          margin: '10px auto',
          maxWidth: '600px',
        }}
      >
        {activityLog.length > 0 ? (
          activityLog.map((log, index) => <div key={index}>{log}</div>)
        ) : (
          <div>No hay actividad registrada</div>
        )}
      </div>
    </div>
  );
}
