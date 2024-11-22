'use client';

import { useState, useEffect } from 'react';

const ESP32_BASE_URL = 'http://192.168.1.48';

export default function Home() {
    const [systemStatus, setSystemStatus] = useState('Apagado');
    const [alarmStatus, setAlarmStatus] = useState('Desactivada');
    const [temperature, setTemperature] = useState('--');
    const [humidity, setHumidity] = useState('--');
    const [sensorStatus, setSensorStatus] = useState({
        pir1: false,
        pir2: false,
        pir3: false,
    });
    const [activityLog, setActivityLog] = useState<string[]>([]);

    // Encender/Apagar Sistema
    const controlSystem = async (command: string) => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/control?state=${command}`);
            const data = await response.text();
            if (command === 'on' && data.includes('Sistema encendido')) {
                setSystemStatus('Encendido');
                setAlarmStatus('Activada');
            } else if (command === 'off' && data.includes('Sistema apagado')) {
                setSystemStatus('Apagado');
                setAlarmStatus('Desactivada');
            } else {
                alert(data);
            }
        } catch (error) {
            console.error('Error al conectar con el ESP32:', error);
        }
    };

    const toggleSystem = () => {
        if (systemStatus === 'Apagado') {
            controlSystem('on');
        } else {
            controlSystem('off');
        }
    };

    // Activar/Desactivar Alarma
    const controlAlarm = async (command: string) => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/alarm-control?state=${command}`);
            const data = await response.text();
            if (command === 'on' && data.includes('Alarma activada')) {
                setAlarmStatus('Activada');
            } else if (command === 'off' && data.includes('Alarma desactivada')) {
                setAlarmStatus('Desactivada');
            } else {
                alert(data);
            }
        } catch (error) {
            console.error('Error al conectar con el ESP32:', error);
        }
    };

    const toggleAlarm = () => {
        if (alarmStatus === 'Desactivada') {
            controlAlarm('on');
        } else {
            controlAlarm('off');
        }
    };

    // Detener la Alarma
    const resetAlarm = async () => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/reset-alarm`);
            const data = await response.text();
            alert(data);
        } catch (error) {
            console.error('Error al conectar con el ESP32:', error);
        }
    };

    // Apagar Buzzer 2 (alarma de incendios)
    const disableBuzzer2 = async () => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/disable-buzzer2`);
            const data = await response.text();
            alert(data);
        } catch (error) {
            console.error('Error al conectar con el ESP32:', error);
        }
    };

    // Actualizar Temperatura y Humedad
    const updateTemperature = async () => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/temperature`);
            const data = await response.json();
            setTemperature(`${data.temperature} °C`);
            setHumidity(`${data.humidity} %`);
        } catch (error) {
            console.error('Error al actualizar temperatura:', error);
        }
    };

    // Actualizar Estado de los Sensores
    const updateSensors = async () => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/sensor-status`);
            const data = await response.json();
            setSensorStatus(data);
        } catch (error) {
            console.error('Error al conectar con el ESP32:', error);
        }
    };

    // Configuración de WebSocket para registro de actividad
    useEffect(() => {
        const ws = new WebSocket(`ws://${ESP32_BASE_URL.split('//')[1]}/ws`);

        ws.onopen = () => {
            console.log('Conexión WebSocket establecida');
        };

        ws.onmessage = (event) => {
            const newLog = `${new Date().toLocaleTimeString()} - ${event.data}`;
            setActivityLog((prevLogs) => [newLog, ...prevLogs]);
        };

        ws.onerror = (error) => {
            console.error('Error en WebSocket:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket cerrado');
        };

        return () => {
            ws.close();
        };
    }, []);

    // Efecto para actualización periódica
    useEffect(() => {
        const interval = setInterval(() => {
            updateTemperature();
            updateSensors();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container">
            <h1>Sistema de Seguridad ESP32</h1>

            {/* Estado del Sistema */}
            <div className="status">
                <h2>Estado del Sistema</h2>
                <img
                    src={`/assets/${systemStatus === 'Encendido' ? 'icon-on.png' : 'icon-off.png'}`}
                    alt="Estado del Sistema"
                    className="icon"
                />
                <div className="switch-container">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={systemStatus === 'Encendido'}
                            onChange={toggleSystem}
                        />
                        <span className="slider"></span>
                    </label>
                    <span className="switch-label">
                        {systemStatus === 'Encendido' ? 'Encendido' : 'Apagado'}
                    </span>
                </div>
            </div>

            {/* Estado de los Sensores */}
            <div className="status">
                <h2>Estado de los Sensores</h2>
                <p>
                    Sala de estar: {sensorStatus.pir1 ? 'Activo' : 'Inactivo'} | Dormitorio 1: {sensorStatus.pir2 ? 'Activo' : 'Inactivo'} | Dormitorio 2: {sensorStatus.pir3 ? 'Activo' : 'Inactivo'}
                </p>
            </div>

            {/* Estado de la Alarma */}
            <div className="status">
                <h2>Estado de la Alarma</h2>
                <div className="switch-container">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={alarmStatus === 'Activada'}
                            onChange={toggleAlarm}
                        />
                        <span className="slider"></span>
                    </label>
                    <span className="switch-label">
                        {alarmStatus === 'Activada' ? 'Activada' : 'Desactivada'}
                    </span>
                </div>
                <button
                    className="pause-button"
                    onClick={resetAlarm}
                    disabled={alarmStatus === 'Desactivada'}
                >
                    Detener Alarma
                </button>
            </div>

            {/* Temperatura y Humedad */}
            <div className="status-row">
                <div className="status-item">
                    <h2>Temperatura</h2>
                    <img
                        src={`/assets/${
                            parseFloat(temperature) >= 35 ? 'high-temperature.png' : 'temperature.png'
                        }`}
                        alt="Estado de la Temperatura"
                        className="icon"
                    />
                    <p>{temperature}</p>
                </div>
                <div className="status-item">
                    <h2>Humedad</h2>
                    <img src="/assets/humidity.png" alt="Estado de la Humedad" className="icon" />
                    <p>{humidity}</p>
                </div>
            </div>

            {/* Botón para apagar el buzzer 2 */}
            <div className="status">
                <button className="pause-button" onClick={disableBuzzer2}>
                    Apagar Alarma de Incendios
                </button>
            </div>

            {/* Registro de Actividad */}
            <h2>Registro de Actividad</h2>
            <div className="log">
                {activityLog.length > 0 ? (
                    activityLog.map((log, index) => <div key={index}>{log}</div>)
                ) : (
                    <div>No hay actividad registrada</div>
                )}
            </div>
        </div>
    );
}
