import { Box, Button, FormControl, IconButton, Input, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useState, useRef, useEffect } from 'react'
import LoginIcon from '@mui/icons-material/Login';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { textValidator } from '../helpers/validator';
import { Toast } from 'primereact/toast';

import { opticaControlApi } from '../services/opticaControlApi';
import './LoginPageStyle.css'
export const LoginPage = () => {
  const navigate = useNavigate();
  const [sucursales, setsucursales] = useState([]);
  const [addSucursal, setaddSucursal] = useState(false);

  useEffect(() => {
    console.log(window.innerWidth);

    // if (window.innerWidth < 1900) {
    //   document.body.style.zoom = '90%'
    // } else {
    document.body.style.zoom = '100%'
    // }
    opticaControlApi.get('sucursal', '')
      .then((response) => {
        if (response.status === 200) {
          (response.data.length < 1) ? setaddSucursal(true) : setaddSucursal(false);
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
    password: '',
    sucursal: ''
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
    if (!textValidator(formValues.usuario) || !textValidator(formValues.password) || !textValidator(formValues.sucursal)) {
      createToast(
        'warn',
        'Accion requerida',
        'Por favor ingrese sus datos'
      );
      return;
    }

    console.log(formValues);

    opticaControlApi.post(`usuario/login`, formValues)
      .then(async (response) => {
        if (response.status === 201) {
          console.log(response.data);

          localStorage.setItem('token', await response.data.token);
          localStorage.setItem('nombre', await response.data.nombre);
          localStorage.setItem('usuarioId', await response.data.uid);
          localStorage.setItem('tipoUsuario', await response.data.tipoUsuario);
          localStorage.setItem('sucursalID', formValues.sucursal);
          const sucrsalFilter = sucursales.filter(s => s._id === formValues.sucursal);
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
  const handleRegistro = () => {
    navigate('/registro');
  }

  const handleSucursal = () => {
    navigate('/crearSucursal');
  }

  return (
    <>
      <Toast ref={toast} />
      <div className='containerPadre'>
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
          <div style={{ backgroundColor: '#102946', borderRadius: '10px' }}>
          </div>
          <div
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              padding: '10%',
              borderRadius: '10px',
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
                  value={formValues.sucursal}
                  onChange={(event) => handleChangeText(event, 'sucursal')}
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
              {
                addSucursal && (
                  <Button
                    variant='outline'
                    sx={{ width: '100%', marginTop: '10px' }}
                    onClick={handleSucursal}
                  >
                    {'Agregar sucursal'}
                  </Button>
                )
              }
              {
                !addSucursal && (
                  <Link to='/registro' underline='hover' sx={{
                    color: 'primary.main', fontWeight: 'bold', fontSize: '18px',
                  }}
                    onClick={handleRegistro}
                  >
                    {'Crear usuario'}
                  </Link>
                )}

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
