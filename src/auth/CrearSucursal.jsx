import React, { useState, useRef } from 'react'
import { Toast } from 'primereact/toast';

import {
    Button,
    TextField,
}
    from '@mui/material';

import { useNavigate } from 'react-router-dom';

import { opticaControlApi } from '../services/opticaControlApi';
import { textValidator } from '../helpers/validator';
import './CrearSucursalStyle.css'

export const CrearSucursal = () => {
    const sucursalJSON = {
        nombre: '',
        direccion: '',
        telefono: '',
        celular: '',
        email: '',
        cai: '',
        paginaDigital: '',
        rtn: '',
        mensajeFactura: ''
    }

    const [formSucursal, setFormSucursal] = useState(sucursalJSON);
    const navigate = useNavigate();
    const toast = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const handleBack = () => {
        navigate('/login');
    }
    const cleanForm = () => {
        setFormSucursal(sucursalJSON)
    };

    const handleChangeText = ({ target }, select) => {
        setFormSucursal({
            ...formSucursal,
            [select]: target.value || ''
        })
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!textValidator(formSucursal.nombre) ||
            !textValidator(formSucursal.direccion) ||
            !textValidator(formSucursal.telefono) ||
            !textValidator(formSucursal.email) ||
            !textValidator(formSucursal.cai) ||
            !textValidator(formSucursal.rtn) ||
            !textValidator(formSucursal.mensajeFactura)
        ) {

            createToast(
                'warn',
                'Acción requerida',
                'Por favor ingrese sus datos'
            );
            return;
        }

        opticaControlApi.post('sucursal', formSucursal)
            .then(async (response) => {
                if (response.status === 201) {
                    createToast(
                        'success',
                        'Confirmado',
                        'El registro a sido creado'
                    );
                    cleanForm();
                }
            })
            .catch((err) => {
                createToast(
                    'error',
                    'Error',
                    err.response?.data || 'Error desconocido',
                );
                console.log(err);
                cleanForm();
            });
    };
    return (
        <>
            <Toast ref={toast} />
            <div className='containerPadre'>
                <div
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50px'

                    }}
                >
                    <Button
                        style={{
                            color: '#ffffff',
                            borderRadius: '5px',
                            padding: '10px 40px',
                            fontWeight: 'bold'
                        }}
                        variant='contained'
                        onClick={handleBack}
                    >
                        Regresar
                    </Button>
                </div>
                <form action=""
                    style={{
                        padding: '50px',
                        width: '50%',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '15px 14px 20px 0px #10294663',
                    }}
                >
                    <h1 style={{ textAlign: 'center' }}>Crear Sucursal</h1>
                    <div className='container'>
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="nombre"
                            label="Nombre"
                            name="nombre"
                            value={formSucursal.nombre}
                            onChange={(event) => handleChangeText(event, 'nombre')}
                            variant='standard'
                        />
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="direccion"
                            label="Direccion"
                            name="direccion"
                            value={formSucursal.direccion}
                            onChange={(event) => handleChangeText(event, 'direccion')}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            id="telefono"
                            label="Telefono"
                            name="telefono"
                            value={formSucursal.telefono}
                            onChange={(event) => handleChangeText(event, 'telefono')}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            id="celular"
                            label="Celular"
                            name="celular"
                            value={formSucursal.celular}
                            onChange={(event) => handleChangeText(event, 'celular')}
                            variant='standard'
                        />
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="email"
                            label="email"
                            name="email"
                            value={formSucursal.email}
                            onChange={(event) => handleChangeText(event, 'email')}
                            variant='standard'
                        />
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="cai"
                            label="CAI"
                            name="cai"
                            value={formSucursal.cai}
                            onChange={(event) => handleChangeText(event, 'cai')}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            id="paginaDigital"
                            label="Pagina Digital"
                            name="paginaDigital"
                            value={formSucursal.paginaDigital}
                            onChange={(event) => handleChangeText(event, 'paginaDigital')}
                            variant='standard'
                        />
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="rtn"
                            label="RTN"
                            name="rtn"
                            value={formSucursal.rtn}
                            onChange={(event) => handleChangeText(event, 'rtn')}
                            variant='standard'
                        />
                        <TextField
                            required
                            value={formSucursal.mensajeFactura}
                            onChange={(event) => handleChangeText(event, 'mensajeFactura')}
                            margin="dense"
                            id="mensajeFactura"
                            name="mensajeFactura"
                            label="Mensaje factura"
                            sx={{ width: "100%" }}
                            variant="standard"
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '20px',
                            marginTop: '40px',
                            marginBottom: '40px'
                        }}
                    >
                        <Button variant='contained' color='error'>Cancelar</Button>
                        <Button variant='contained' onClick={handleSubmit} type="submit">Guardar</Button>
                    </div>
                </form>
            </div>
        </>
    )
}
