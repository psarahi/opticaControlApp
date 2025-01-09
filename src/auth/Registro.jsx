import React, { useState } from 'react'

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
}
    from '@mui/material';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';


export const Registro = () => {
    const [formValues, setFormValues] = useState(false);

    // const handleCloseDialog = () => {

    // }
    


    return (
        <>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5'}}>
                <form action=""
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        border: '1px solid black',
                        padding: '20px',
                        width: '50%',
                        maxWidth: '500px'
                    }}
                >
                    <h1 style={{ textAlign: 'center' }}>Registrarse</h1>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: '40px'
                    }}>

                        <TextField
                            style={{ width: '100%' }}
                            label="Nombre"
                            name="nombre"
                            value={formValues.nombre}
                            onChange={(e) => setFormValues({ ...formValues, nombre: e.target.value })}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            label="Usuario"
                            name="apellido"
                            value={formValues.usuario}
                            onChange={(e) => setFormValues({ ...formValues, usuario: e.target.value })}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={formValues.contrasena}
                            onChange={(e) => setFormValues({ ...formValues, contrasena: e.target.value })}
                            variant='standard'
                        />
                        <p style={{
                            marginRight: '70px',
                            marginBottom: '-40px',
                            opacity: '70%'
                        }}>
                            Fecha de registro
                        </p>
                        <TextField
                            style={{ width: '100%' }}
                            name="fechaDeRegistro"
                            type='date'
                            value={formValues.fechaDeRegistro}
                            variant='standard'
                        />
                    </div>
                </form>
            </div>
        </>
    )
}
