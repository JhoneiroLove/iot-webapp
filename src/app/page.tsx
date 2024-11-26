'use client';

import { useState, useEffect } from 'react';

const ESP32_BASE_URL = 'http://192.168.36.50'; // Tu ESP32 Base URL

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

    // Estado de los LEDs
    const [ledStatus, setLedStatus] = useState({
        led1: false,
        baño1: false,
        baño2: false,
        ledsala: false,
        ledDormitorio1: false,
        ledDormitorio2: false,
        ledDormitorio3: false,
        ledCocina: false,
    });

    // Función para obtener el estado de los LEDs
    const fetchLedStatus = async () => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/led-status`);
            const data = await response.json();
            setLedStatus({
                led1: data.led1,
                baño1: data.baño1,
                baño2: data.baño2,
                ledsala: data.ledsala,
                ledDormitorio1: data.ledDormitorio1,
                ledDormitorio2: data.ledDormitorio2,
                ledDormitorio3: data.ledDormitorio3,
                ledCocina: data.ledCocina,
            });
        } catch (error) {
            console.error('Error al obtener el estado de los LEDs:', error);
        }
    };

    // Función para encender y apagar LEDs individuales
    const controlLED = async (led: string, command: string) => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/led-control?led=${led}&state=${command}`);
            const data = await response.text();
            alert(data); // Mostrar mensaje de confirmación
            fetchLedStatus(); // Actualizar el estado de los LEDs después de la acción
        } catch (error) {
            console.error('Error al controlar el LED:', error);
        }
    };

    // Función para encender y apagar todos los LEDs
    const controlAllLEDs = async (command: string) => {
        try {
            const response = await fetch(`${ESP32_BASE_URL}/control-all-leds?state=${command}`);
            const data = await response.text();
            alert(data); // Mostrar mensaje de confirmación
            fetchLedStatus(); // Actualizar el estado de los LEDs después de la acción
        } catch (error) {
            console.error('Error al controlar todos los LEDs:', error);
        }
    };

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

    // Efecto para actualización periódica
    useEffect(() => {
        const interval = setInterval(() => {
            updateTemperature();
            updateSensors();
            fetchLedStatus();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

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

    // Función para redirigir al enlace de la cámara en una nueva ventana
    const openCameraLink = () => {
        window.open('https://presumably-legible-terrier.ngrok-free.app/', '_blank'); // Cambia a la URL correcta de tu cámara
    };

    return (
        <div className="container">
            <h1>Sistema de Seguridad ESP32</h1>

            {/* Estado del Sistema */}
            <div className="status">
                <h2>Estado del Sistema</h2>
                <div className="switch-container">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={systemStatus === 'Encendido'}
                            onChange={toggleSystem}
                        />
                        <span className="slider"></span>
                    </label>
                    <span className="switch-label">{systemStatus}</span>
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
                    <span className="switch-label">{alarmStatus}</span>
                </div>
                <button
                    className="pause-button"
                    onClick={resetAlarm}
                    disabled={alarmStatus === 'Desactivada'}
                >
                    Detener Alarma
                </button>
            </div>

            {/* Control de LEDs */}
            <div className="status">
                <h2>Control de LEDs</h2>
                <button className="control-button-on" onClick={() => controlAllLEDs('on')}>Encender todos los LEDs</button>
                <button className="control-button-off" onClick={() => controlAllLEDs('off')}>Apagar todos los LEDs</button>

                <h3>Pasadizo</h3>
                <button className="control-button-on" onClick={() => controlLED('led1', 'on')}>Encender LED</button>
                <button className="control-button-off" onClick={() => controlLED('led1', 'off')}>Apagar LED</button><br />

                <h3>Sala</h3>
                <button className="control-button-on" onClick={() => controlLED('ledsala', 'on')}>Encender LED</button>
                <button className="control-button-off" onClick={() => controlLED('ledsala', 'off')}>Apagar LED</button><br />

                <h3>Dormitorio 1</h3>
                <button className="control-button-on" onClick={() => controlLED('ledDormitorio1', 'on')}>Encender LED</button>
                <button className="control-button-off" onClick={() => controlLED('ledDormitorio1', 'off')}>Apagar LED</button><br />

                <h3>Dormitorio 2</h3>
                <button className="control-button-on" onClick={() => controlLED('ledDormitorio2', 'on')}>Encender LED</button>
                <button className="control-button-off" onClick={() => controlLED('ledDormitorio2', 'off')}>Apagar LED</button><br />

                <h3>Dormitorio 3</h3>
                <button className="control-button-on" onClick={() => controlLED('ledDormitorio3', 'on')}>Encender LED</button>
                <button className="control-button-off" onClick={() => controlLED('ledDormitorio3', 'off')}>Apagar LED</button><br />

                <h3>Cocina</h3>
                <button className="control-button-on" onClick={() => controlLED('ledCocina', 'on')}>Encender LED</button>
                <button className="control-button-off" onClick={() => controlLED('ledCocina', 'off')}>Apagar LED</button><br />

                <h3>Baño 1</h3>
                <button className="control-button-on" onClick={() => controlLED('baño1', 'on')}>Encender LED</button>
                <button className="control-button-off" onClick={() => controlLED('baño1', 'off')}>Apagar LED</button><br />

                <h3>Baño 2</h3>
                <button className="control-button-on" onClick={() => controlLED('baño2', 'on')}>Encender LED</button>
                <button className="control-button-off" onClick={() => controlLED('baño2', 'off')}>Apagar LED</button><br />
            </div>

            {/* Botón para ver la cámara */}
            <div className="status">
                <h2>Acceder a la Cámara</h2>
                <button onClick={openCameraLink} className="control-button-on">
                    Ver Cámara
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
