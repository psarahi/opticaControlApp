import { Box, Button, FormControl, IconButton, Input, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useState, useRef, useEffect } from 'react'
import LoginIcon from '@mui/icons-material/Login';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { textValidator } from '../helpers/validator';
import { Toast } from 'primereact/toast';

import { appointmentApi } from '../services/appointmentApi';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [sucursales, setsucursales] = useState([]);
  const [sucursal, setsucursal] = useState('');

  useEffect(() => {
    document.body.style.zoom = '100%';

    appointmentApi.get('sucursal', '')
      .then((response) => {
        if (response.status === 200) {
          setsucursales(response.data);
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


  const [formValues, setFormValues] = useState({
    usuario: '',
    password: ''
  })

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

  const cleanForm = () => {
    setFormValues({
      usuario: '',
      password: ''
    })
  };

  const handleChangeText = ({ target }, select) => {
    setFormValues({
      ...formValues,
      [select]: target.value
    })
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!textValidator(formValues.usuario) || !textValidator(formValues.password)) {
      createToast(
        'warn',
        'Accion requerida',
        'Por favor ingrese sus datos'
      );
      return;
    }
    appointmentApi.post(`usuario/login`, formValues)
      .then(async (response) => {
        if (response.status === 201) {
          localStorage.setItem('token', await response.data.token);
          localStorage.setItem('nombre', await response.data.nombre);
          localStorage.setItem('usuarioId', await response.data.uid);
          localStorage.setItem('sucursalID', sucursal);
          const sucrsalFilter = sucursales.filter(s => s._id === sucursal);
          localStorage.setItem('sucursalNombre', sucrsalFilter[0].nombre);
          navigate('/pacientes');
          cleanForm();
        } else {
          createToast(
            'error',
            'Error',
            'Error en el ingreso'
          );
          cleanForm();
        }
      })
      .catch((err) => {
        createToast(
          'error',
          'Error',
          err.response.data,
        );
        console.log(err);
        cleanForm();
      });

  };

  return (
    <>
      <Toast ref={toast} />
      <div
        style={{
          height: '100vh',
          backgroundColor: '#94d0ff6e',
          position: 'relative',
          margin: '0%'
        }}>
        <Box
          sx={{
            display: 'grid',
            width: '60%',
            gridTemplateColumns: 'repeat(2, 2fr)',
            gridTemplateRows: '1fr',
            gridColumnGap: '0px',
            gridRowGap: '0px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '15px 14px 20px 0px #10294663',

          }}
        >
          <div style={{ backgroundColor: '#102946' }}>
          </div>
          <div
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              padding: '10%'
            }}
          >
            <h1 style={{ color: 'primary.main' }}>Inicio de sesión</h1>
            <br />
            <Box
              component='form'
              sx={{ display: 'grid', alignContent: 'space-between' }}
              noValidate
              autoComplete='off'
            >
              <FormControl variant="standard">
                <InputLabel id="sucursal">Sucursal</InputLabel>
                <br />
                <Select
                  labelId="sucursal"
                  id="sucursal"
                  value={sucursal}
                  onChange={(e) => setsucursal(e.target.value)}
                  label="Age"
                >
                  {
                    sucursales.map((s, index) => (
                      <MenuItem key={index} value={s._id}>{s.nombre}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
              <br />
              <InputLabel>Usuario</InputLabel>
              <TextField
                id="usuario"
                variant="standard"
                value={formValues.usuario}
                onChange={(event) => handleChangeText(event, 'usuario')}
                required
              />
              <br />
              <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
              <Input
                id="standard-adornment-password"
                value={formValues.password}
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
              <br />
              <Link href='#' underline='hover' sx={{
                color: 'primary.main', fontWeight: 'bold', fontSize: '18px',
              }}>
                {'Crear cuenta'}
              </Link>
            </Box>
            <br />
            <br />
            <Button
              variant='contained'
              sx={{ width: '100%' }}
              onClick={handleSubmit}
              startIcon={<LoginIcon />} >
              Login
            </Button>
          </div>
        </Box>
      </div>
    </>
  )
}
