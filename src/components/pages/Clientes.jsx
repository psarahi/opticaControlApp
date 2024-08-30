// eslint-disable-next-line
import React, { useState, useEffect } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, TextField } from '@mui/material';
import { FilterMatchMode, DataTable, Column } from 'primereact';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import appointmentApi from '../services/appointmentApi.js'
import { formatearFecha } from '../helpers/formato.js'
import { textValidator } from '../helpers/validator.js'

export const Clientes = () => {
  console.log(process.env.REACT_APP_API_URL);

  const [clientes, setclientes] = useState([]);
  const [optiosAlert, setoptiosAlert] = useState({
    severity: 'info',
    message: '',
    open: false,
  })
  const [openDialog, setOpenDialog] = useState(false);
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    ultimaCita: null,
  })

  useEffect(() => {
    appointmentApi.get('cliente', '').then((response) => {
      setclientes(response.data);
    })
    cleanForm();
  }, [])

  const [filters] = useState({
    nombre: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    apellido: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    direccion: { value: '', matchMode: FilterMatchMode.STARTS_WITH }
  });

  const fechaBodyTemplate = (date) => {
    return formatearFecha(date);
  };

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const cleanForm = () => {
    setFormValues({
      nombre: '',
      apellido: '',
      direccion: '',
      ultimaCita: null,
    });
  };

  const handleChangeText = ({ target }, select) => {
    setFormValues({
      ...formValues,
      [select]: target.value
    })
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setoptiosAlert({
      ...optiosAlert,
      open: false,
    });
  };

  return (
    <>
      <h1>Informacion sobre clientes </h1>
      <Button variant='contained' onClick={handleClickOpenDialog}>Agrega nuevo cliente</Button>
      <br />
      <br />
      <DataTable value={clientes}
        showGridlines
        stripedRows
        tableStyle={{ minWidth: '50rem' }}
        size='small'
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        filters={filters}
        filterDisplay='row'
      >
        <Column field="nombre" header="Nombre" sortable filter></Column>
        <Column field="apellido" header="Apellido" sortable filter></Column>
        <Column field="direccion" header="Direccion" sortable filter></Column>
        <Column field="ultimaCita" header="UltimaCita" body={fechaBodyTemplate}></Column>
      </DataTable>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();

            if (textValidator(formValues.ultimaCita)) {
              setFormValues({
                ...formValues,
                ultimaCita: null
              })

              setoptiosAlert({
                severity: 'error',
                message: 'Por favor ingrese todos los campos',
                open: true,
              });
              return;
            }
       
            appointmentApi.post('cliente', formValues)
              .then((response) => {
                debugger
                if (response.status === 201) {
                  setoptiosAlert({
                    severity: 'success',
                    message: 'El registro fue creado correctamente',
                    open: true,
                  });
                  handleCloseDialog();
                  setclientes([...clientes, response.data]);
                  console.log(response);
                  cleanForm();
                } else {
                  setoptiosAlert({
                    severity: 'error',
                    message: response.statusText,
                    open: true,
                  });
                  console.log(response.data);
                  cleanForm();
                  return;
                }
              })
              .catch((err) => {
                setoptiosAlert({
                  severity: 'error',
                  message: 'Ha ocurrido un error al intentar crear el registro',
                  open: true,
                });
                console.log(err);
                handleCloseDialog();
                cleanForm();
              })              ;
          },
        }}
      >
        <DialogTitle>Datos sobre clientes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor rellene los campos sobre la informacion de sus clientes
          </DialogContentText>
          <TextField
            autoFocus
            required
            value={formValues.nombre}
            onChange={(event) => handleChangeText(event, 'nombre')}
            margin="dense"
            id="nombre"
            name="nombre"
            label="Nombre"
            type="text"
            fullWidth
            variant="standard"
            size="small"
          />
          <TextField
            autoFocus
            required
            value={formValues.apellido}
            onChange={(event) => handleChangeText(event, 'apellido')}
            margin="dense"
            id="apellido"
            name="apellido"
            label="Apellido"
            type="text"
            fullWidth
            variant="standard"
            size="small"
          />
          <TextField
            autoFocus
            required
            value={formValues.direccion}
            onChange={(event) => handleChangeText(event, 'direccion')}
            margin="dense"
            id="direccion"
            name="direccion"
            label="Direccion"
            type="text"
            fullWidth
            variant="standard"
            size="small"
          />
          <br />
          <br />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Ultima Cita *"
              nombre="ultimaCita"
              variant="standard"
              value={formValues.ultimaCita}
              onChange={(event) => {
                setFormValues({
                  ...formValues,
                  ultimaCita: dayjs(event)
                })
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} >Cancelar</Button>
          <Button variant='contained' type="submit">Guardar</Button>
        </DialogActions>
      </Dialog>
      {
        optiosAlert.open &&
        <Snackbar autoHideDuration={5000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={optiosAlert.open} onClose={handleCloseSnackbar}>
          <Alert
            severity={optiosAlert.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {optiosAlert.message}
          </Alert>
        </Snackbar>
      }
    </>
  )
};
