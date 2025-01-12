import React, { useState, useRef, useEffect } from 'react'
import { Toast } from 'primereact/toast';

import {
    Button,
    TextField,
    InputLabel,
    MenuItem,
    Select,
    FormControl,
    IconButton,
    Input,
    InputAdornment
}
    from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import dayjs from 'dayjs';

import { useNavigate } from 'react-router-dom';

import { opticaControlApi } from '../services/opticaControlApi';
import { textValidator } from '../helpers/validator';

export const Registro = () => {
    const usuariosJSON = {
        nombre: '',
        usuario: '',
        password: '',
        tipoUsuario: '',
        sucursales: '',
        fechaRegistro: dayjs().format('YYYY-MM-DD'),
    }
    const [sucursales, setSucursales] = useState([]);

    useEffect(() => {
        document.body.style.zoom = '100%';

        opticaControlApi.get('sucursal', '')
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data);
                    setSucursales(response.data);
                }
            })
            .catch((err) => {
                createToast(
                    'error',
                    'Error',
                    err.response.data,
                );
            });

    }, [])
    const [formUsuarios, setFormUsuarios] = useState(usuariosJSON);
    const navigate = useNavigate();
    const toast = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const handleBack = () => {
        navigate('/login');
    }
    const cleanForm = () => {
        setFormUsuarios(usuariosJSON)
    };

    const handleChangeText = ({ target }, select) => {
        setFormUsuarios({
            ...formUsuarios,
            [select]: target.value || ''
        })
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!textValidator(formUsuarios.nombre) ||
            !textValidator(formUsuarios.usuario) ||
            !textValidator(formUsuarios.tipoUsuario) ||
            !textValidator(formUsuarios.password) ||
            !textValidator(formUsuarios.sucursales) ||
            !formUsuarios.fechaRegistro) {

            createToast(
                'warn',
                'Acción requerida',
                'Por favor ingrese sus datos'
            );
            return;
        }

        opticaControlApi.post('usuario', formUsuarios)
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
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#94d0ff6e',
            }}>
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
                        width: '30%',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '15px 14px 20px 0px #10294663',
                    }}
                >
                    <h1 style={{ textAlign: 'center' }}>Registrar usuario</h1>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: '40px'
                    }}>

                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="nombre"
                            label="Nombre"
                            name="nombre"
                            value={formUsuarios.nombre}
                            onChange={(event) => handleChangeText(event, 'nombre')}
                            variant='standard'
                        />
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%' }}>
                            <TextField
                                required
                                style={{ width: '50%' }}
                                id="usuario"
                                label="Usuario"
                                name="apellido"
                                value={formUsuarios.usuario}
                                onChange={(event) => handleChangeText(event, 'usuario')}
                                variant='standard'
                            />
                            <FormControl variant="standard">
                                <InputLabel id="tipoUsuario">Password *</InputLabel>
                                <Input
                                    id="standard-adornment-password"
                                    value={formUsuarios.password}
                                    type={showPassword ? 'text' : 'password'}
                                    onChange={(event) => handleChangeText(event, 'password')}
                                    required
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                onMouseUp={handleMouseUpPassword}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                        </div>
                        <FormControl variant="standard">
                            <InputLabel id="tipoUsuario">Tipo Usuario *</InputLabel>
                            <br />
                            <Select
                                style={{ width: '250px', marginBottom: '-100px' }}
                                labelId="tipoUsuario"
                                id="tipoUsuario"
                                value={formUsuarios.tipoUsuario || ''}
                                onChange={(event) => handleChangeText(event, 'tipoUsuario')}
                                label="Tipo Usuario"
                            >
                                <MenuItem key="1" value="Administrador">Administrador</MenuItem>
                                <MenuItem key="2" value="Usuario">Usuario</MenuItem>
                            </Select>
                        </FormControl>
                        <br />
                        <FormControl variant="standard">
                            <InputLabel id="sucursales">Sucursal *</InputLabel>
                            <br />
                            <Select
                                style={{ width: '250px', marginBottom: '-100px' }}
                                labelId="sucursales"
                                id="sucursales"
                                value={formUsuarios.sucursales || ''}
                                onChange={(event) => handleChangeText(event, 'sucursales')}
                                label="Sucursal"
                            >
                                {
                                    sucursales.map((s, index) => (
                                        <MenuItem key={index} value={s._id}>{s.nombre}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        <br />
                        <p style={{
                            marginRight: '120px',
                            marginBottom: '-40px',
                            opacity: '70%'
                        }}>
                            Fecha de registro
                        </p>
                        <TextField
                            style={{ width: '55%' }}
                            id="fechaRegistro"
                            name="fechaRegistro"
                            type='date'
                            value={formUsuarios.fechaRegistro}
                            onChange={(event) => handleChangeText(event, 'fechaRegistro')}
                            variant='standard'
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
