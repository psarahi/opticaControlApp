// eslint-disable-next-line
import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  IconButton, 
  TextField } 
  from '@mui/material';
import { FilterMatchMode, DataTable, Column } from 'primereact';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

import { formatearFecha } from '../../helpers/formato.js'
import { textValidator } from '../../helpers/validator.js'
import { DatePicker } from '@mui/x-date-pickers';

import { appointmentApi } from '../../services/appointmentApi';

export const Clientes = () => {
  let clienteSeleccionado = '';
  const [clientes, setclientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
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

  const handleOpenDialog = () => {
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
    setSelectedCliente('');
    clienteSeleccionado = '';
  };

  const handleChangeText = ({ target }, select) => {
    setFormValues({
      ...formValues,
      [select]: target.value
    })
  };

  const handleEdit = () => {
    handleOpenDialog();
  };

  const handleDelete = () => {
    confirmDialog({
      message: `¿Desea eliminar el registro? `,
      header: 'Eliminar',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: acceptDialog,
      reject: rejectDialog
    });
  };

  const acceptDialog = () => {
    if (!textValidator(clienteSeleccionado)) {
      appointmentApi.delete(`cliente/${clienteSeleccionado}`)
        .then((response) => {
          if (response.status === 200) {
            createToast(
              'success',
              'Confirmado',
              'El registro a sido eliminado'
            );
            const clientesFiltrados = clientes.filter((cliente) => (cliente._id !== clienteSeleccionado));
            setclientes([...clientesFiltrados]);
            console.log(response);
            cleanForm();
          } else {
            createToast(
              'error',
              'Error',
              response.statusText,
            );
            console.log(response.data);
            cleanForm();
            return;
          }
        })
        .catch((err) => {
          createToast(
            'error',
            'Error',
            'Ha ocurrido un error'
          );
          console.log(err);
          handleCloseDialog();
          cleanForm();
        });
    } else {
      createToast(
        'warn',
        'Acction requerida',
        'No se selecciono el cliente correctamente'
      );
    }
  }

  const rejectDialog = () => {
    createToast(
      'warn',
      'Cancelado',
      'Acción cancelada'
    );
  }

  const renderDeleteButton = (value) => {
    return (
      <IconButton aria-label="Eliminar" color="primary">
        <DeleteIcon />
      </IconButton>
    );
  };

  const renderEditButton = () => {
    return (
      <IconButton aria-label="Editar" color="error" onClick={handleEdit}>
        <EditIcon />
      </IconButton>
    );
  };

  const toast = useRef(null);

  const createToast = (severity, summary, detail) => {
    toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
  };

  const onCellSelect = (event) => {
    console.log(event);

  };

  return (
    <>
      <h1>Informacion sobre clientes </h1>
      <Button variant='contained' onClick={handleOpenDialog}>Agrega nuevo cliente</Button>
      <br />
      <br />
      <Toast ref={toast} />
      <ConfirmDialog />
      <div style={{ width: '95%' }}>
        <DataTable value={clientes}
          showGridlines
          stripedRows
          size='small'
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          filters={filters}
          filterDisplay='row'
          selectionMode="single"
          selection={selectedCliente}
          cellSelection
          onCellSelect={onCellSelect}
          onSelectionChange={(e) => {
            console.log(e);
            const cliente = e.value.rowData;
            setSelectedCliente(cliente._id);
            clienteSeleccionado = cliente._id;
            setFormValues({
              nombre: cliente.nombre,
              apellido: cliente.apellido,
              direccion: cliente.direccion,
              ultimaCita: dayjs(cliente.ultimaCita),
            })

            if (e.value.cellIndex === 0) {
              handleEdit();
            } else if (e.value.cellIndex === 1) {
              handleDelete();
            }
          }}
        >
          <Column body={renderEditButton}></Column>
          <Column body={renderDeleteButton}></Column>
          <Column field="nombre" header="Nombre" sortable filter></Column>
          <Column field="apellido" header="Apellido" sortable filter></Column>
          <Column field="direccion" header="Direccion" sortable filter></Column>
          <Column field="ultimaCita" header="UltimaCita" body={fechaBodyTemplate}></Column>
        </DataTable>
      </div>

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
              createToast(
                'warn',
                'Accion requerida',
                'Por favor ingrese todos los campos'
              );
              return;
            }

            if (!textValidator(selectedCliente)) {
              appointmentApi.put(`cliente/${selectedCliente}`, formValues)
                .then((response) => {
                  console.log(response.status);

                  if (response.status === 202) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue editado correctamente'
                    );
                    handleCloseDialog();
                    const clientesFiltrados = clientes.filter((cliente) => (cliente._id !== selectedCliente));
                    setclientes([response.data, ...clientesFiltrados]);
                    console.log(response);
                    cleanForm();
                  } else {
                    createToast(
                      'error',
                      'Error',
                      response.statusText,
                    );
                    console.log(response.data);
                    cleanForm();
                    return;
                  }
                })
                .catch((err) => {
                  createToast(
                    'error',
                    'Error',
                    'Ha ocurrido un error'
                  );
                  console.log(err);
                  handleCloseDialog();
                  cleanForm();
                });
            } else {
              appointmentApi.post('cliente', formValues)
                .then((response) => {
                  if (response.status === 201) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue creado correctamente'
                    );
                    handleCloseDialog();
                    setclientes([...clientes, response.data]);
                    console.log(response);
                    cleanForm();
                  } else {
                    createToast(
                      'error',
                      'Error',
                      response.statusText,
                    );
                    console.log(response.data);
                    cleanForm();
                    return;
                  }
                })
                .catch((err) => {
                  createToast(
                    'error',
                    'Error',
                    'Ha ocurrido un error'
                  );
                  console.log(err);
                  handleCloseDialog();
                  cleanForm();
                });
            }

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
            <DatePicker
              label="Ultima Cita *"
              nombre="ultimaCita"
              variant="standard"
              value={formValues.ultimaCita}
              format='YYYY-MM-DD'
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
    </>
  )
};
