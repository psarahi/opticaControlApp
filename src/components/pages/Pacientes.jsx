import React, { useEffect, useState, useRef } from 'react'

import AddIcon from '@mui/icons-material/Add';
import { ConfirmDialog, confirmDialog, Toast, FilterMatchMode, DataTable, Column, TabView, TabPanel } from 'primereact';


import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
//import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import {
  Button, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, InputLabel,
  MenuItem, Radio, RadioGroup, Select, TextField
} from '@mui/material';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';

import { appointmentApi } from '../../services/appointmentApi';
import { formatearFecha, formatearNumero } from '../../helpers/formato';
import { textValidator, validarFechaProxima } from '../../helpers/validator';
import './PacienteStyle.css';
import { agudezaVisual, obtenerAdicion, obtenerGraduaciones } from '../../helpers/metricas';

const pacienteJson = {
  nombre: '',
  edad: '',
  genero: '',
  telefono: '',
  email: '',
  direccion: '',
  fechaRegistro: null,
  ultimaCita: null,
  sucursales: '',
  citaProxima: null,
};

const expedientes = {
  paciente: '',
  optometrista: '',
  fecha: new Date(),
  antecedentes: '',
  enfermedadBase: '',
  observaciones: '',
  pruebasValoraciones: '',
  recetaOjoDerecho: {
    esfera: '',
    cilindro: '',
    eje: '',
    agudezaVisual: '',
    distanciaPupilar: '',
    adicion: '',
    defRefraccion: ''
  },
  recetaOjoIzquierdo: {
    esfera: '',
    cilindro: '',
    eje: '',
    agudezaVisual: '',
    distanciaPupilar: '',
    adicion: '',
    defRefraccion: ''
  }
}

const detalleVenta = {
  tipoVenta: '',
  tipoLente: '',
  proteccion: '',
  material: '',
  modaArmazon: '',
  pacientes: '',
  detalleInventario: [{
    inventario: '',
    cantidad: 0,
    precioVendido: 0,
    descuento: 0,
  }],
  fecha: '',
  fechaEntrega: '',
  detallePagos: [{
    fecha: '',
    formaPago: '',
    monto: 0
  }],
  descuentoTotal: '',
  cantPagos: '',
  montoPagos: '',
  total: '',
  acuenta: '',
};

document.body.style.zoom = '90%';
export const Pacientes = () => {
  let pacienteSeleccionado = '';
  const [openDialogPaciente, setOpenDialogPaciente] = useState(false);
  const [openDialogReceta, setOpenDialogReceta] = useState(false);
  const [openDialogAddExpediente, setOpenDialogAddExpediente] = useState(false);
  const [openDialogVenta, setOpenDialogVenta] = useState(false);
  const [listPaciente, setListPaciente] = useState([]);
  const [pacienteDatos, setPacienteDatos] = useState(pacienteJson)
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [listoptometrista, setlistoptometrista] = useState([]);
  const [listSucursal, setlistSucursal] = useState([]);
  const [listGraduaciones, setListGraduaciones] = useState([]);
  const [listAgudezaVisual, setListAgudezaVisual] = useState([]);
  const [listAdicion, setListAdicion] = useState([]);
  const [formPacientes, setFormPaciente] = useState(pacienteJson);
  const [formExpedientes, setformExpedientes] = useState(expedientes)
  const [formVenta, setformVenta] = useState(detalleVenta);
  const [listInventario, setListInventario] = useState([]);
  const [listExpedientePaciente, setlistExpedientePaciente] = useState([])
  const tipoVenta = [
    'Cambio de aro',
    'Cambio de lente',
    'Compra total'
  ]

  const proteccion = [
    'Transitions',
    'Blanco',
    'Antireflejo',
    'Fotocromatico',
    'Foto AR',
    'Blue'
  ];

  const tipoLente = [
    'Monofocal',
    'Cerca',
    'Flap top',
    'Progresivo',
    'Invisible',
    'Cripto',
    'L/C Cosmetico',
    'L/C Blando',
    'L/C Torico',
    'L/C Gas permiable'
  ];
  //historial

  useEffect(() => {
    appointmentApi.get('paciente', '').then((response) => {
      console.log(response.data);

      setListPaciente(response.data);
    });
    appointmentApi.get('sucursal', '').then((response) => {
      setlistSucursal(response.data);
    });
    appointmentApi.get('optometrista', '').then((response) => {
      setlistoptometrista(response.data);
    });
    appointmentApi.get('inventario', '').then((response) => {
      setListInventario(response.data);
    })
    cleanForm();

    setListGraduaciones(obtenerGraduaciones());
    setListAdicion(obtenerAdicion());
    setListAgudezaVisual(agudezaVisual);

  }, [])

  const cleanForm = () => {
    setFormPaciente(pacienteJson);
    setSelectedPaciente(null);
    setformExpedientes(expedientes);
    setlistExpedientePaciente([]);
    setPacienteDatos(pacienteJson);
  };

  const handleOpenDialogPost = () => {
    setOpenDialogPaciente(true);
  };

  const handleOpenDialogReceta = () => {
    setOpenDialogReceta(true);
  };

  const handleOpenDialogAddExpediente = () => {
    setOpenDialogAddExpediente(true);
  };


  const handleOpenDialogVenta = () => {
    setOpenDialogVenta(true);
  };

  const handleCloseDialogPaciente = () => {
    setOpenDialogPaciente(false);
  };

  const handleCloseDialogReceta = () => {
    cleanForm()
    setOpenDialogReceta(false);
  };
  const handleCloseDialogAddExpediente = () => {
    setOpenDialogAddExpediente(false);
  };

  const handleCloseDialogVenta = () => {
    setOpenDialogVenta(false);
  };

  const toast = useRef(null);
  const toastForm = useRef(null);

  const createToast = (severity, summary, detail) => {
    toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
  };

  const createToastForm = (severity, summary, detail) => {
    toastForm.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
  };


  const onCellSelect = (event) => {
    console.log(event);
    console.log(event.cellIndex);

    if (event.cellIndex === 0) {
      handleEdit();
    } else if (event.cellIndex === 1) {
      handleDelete();
    } else if (event.cellIndex === 2) {
      handleVenta();
    } else if (event.cellIndex === 3) {
      appointmentApi.get(`expediente/paciente/${event.rowData._id}`, '')
        .then(async (response) => {
          console.log(response.data);

          setlistExpedientePaciente(await response.data);
        });

      handleReceta();

    } else if (event.cellIndex === 4) {
      handleOpenDialogAddExpediente();
    }
    // console.log(selectedPaciente);


  };

  const handleChangeTextPaciente = ({ target }, select) => {
    setFormPaciente({
      ...formPacientes,
      [select]: target.value
    })
  };

  const handleChangeTextVenta = ({ target }, select) => {
    setformVenta({
      ...formPacientes,
      [select]: target.value
    })
  };

  const handleChangeTextExpediente = ({ target }, select) => {
    setformExpedientes({
      ...formExpedientes,
      [select]: target.value
    })
  };

  const handleEdit = () => {
    handleOpenDialogPost();
  };

  const handleReceta = () => {
    handleOpenDialogReceta();
  };
  const handleVenta = () => {
    handleOpenDialogVenta();
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
    if (textValidator(pacienteSeleccionado)) {
      appointmentApi.delete(`paciente/${pacienteSeleccionado}`)
        .then((response) => {
          if (response.status === 200) {
            createToast(
              'success',
              'Confirmado',
              'El registro a sido eliminado'
            );
            const inventarioFiltrado = listPaciente.filter((inv) => (inv._id !== pacienteSeleccionado));
            setListPaciente([...inventarioFiltrado]);
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
            'Ha ocurrido un error al intentar crear el registro'
          );
          console.log(err);
          handleCloseDialogPaciente();
          cleanForm();
        });
    } else {
      createToast(
        'warn',
        'Acction requerida',
        'No se selecciono el inventario correctamente'
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

  const renderEditButton = () => {
    return (
      <EditIcon color='primary' fontSize='medium' />
    );
  };

  const renderDeleteButton = () => {
    return (
      <DeleteIcon color='error' fontSize='medium' />
    );
  };

  const renderRecetaButton = () => {
    return (
      <ContactPageIcon color='success' fontSize='medium' />
    );
  };

  const renderAgregarRecetaButton = () => {
    return (
      <Chip icon={<AddIcon />} color='secondary' label="Expediente" />
    );
  };
  const renderVentaButton = () => {
    return (
      <AddShoppingCartIcon color='primary' fontSize='medium' />
    );
  };

  const precioVentaBodyTemplate = ({ precioVenta }) => {
    return formatearNumero(precioVenta);
};

  const [filters] = useState({
    nombre: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    telefono: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    direccion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    optometrista: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    sucursales: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    genero: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
  });


  const [filtersInventario] = useState({
    descripcion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    categoria: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    moda: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    proveedor: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    linea: { value: '', matchMode: FilterMatchMode.STARTS_WITH }
});

  const citaProximaBodyTemplate = (date) => {
    return formatearFecha(date.citaProxima);
  };

  const ultimaCitaBodyTemplate = (date) => {
    return formatearFecha(date.ultimaCita);
  };

  const fechaRegistroBodyTemplate = (date) => {
    return formatearFecha(date.fechaRegistro);
  };

  return (
    <>
      <h1>Informacion sobre Pacientes </h1>
      <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialogPost}>Agregar Paciente</Button>
      <br />
      <br />
      <Toast ref={toast} />
      <ConfirmDialog />

      <div style={{ width: '97%' }}>
        <DataTable value={listPaciente}
          showGridlines
          stripedRows
          size='small'
          sortMode="multiple"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          filters={filters}
          filterDisplay='row'
          selectionMode="single"
          selection={setSelectedPaciente}
          cellSelection
          onCellSelect={onCellSelect}
          onSelectionChange={(e) => {
            console.log(e);

            const paciente = e.value.rowData;

            // setSelectedPaciente(paciente._id);
            pacienteSeleccionado = paciente._id;

            setformExpedientes({
              ...formExpedientes,
              paciente: paciente._id
            });

            setSelectedPaciente(paciente._id);

            setFormPaciente({
              nombre: paciente.nombre,
              edad: paciente.edad,
              genero: paciente.genero,
              telefono: paciente.telefono,
              email: paciente.email,
              direccion: paciente.direccion,
              citaProxima: (textValidator(paciente.citaProxima)) ? dayjs(paciente.citaProxima) : null,
              fechaRegistro: (textValidator(paciente.fechaRegistro)) ? dayjs(paciente.fechaRegistro) : null,
              ultimaCita: (textValidator(paciente.ultimaCita)) ? dayjs(paciente.ultimaCita) : null,
              sucursales: paciente.sucursales._id,
            })

            setPacienteDatos({
              nombre: paciente.nombre,
              edad: paciente.edad,
              genero: paciente.genero,
              telefono: paciente.telefono,
              email: paciente.email,
              direccion: paciente.direccion,
              ultimaCita: (textValidator(paciente.ultimaCita)) ? formatearFecha(paciente.ultimaCita) : '-',
              citaProxima: (textValidator(paciente.citaProxima)) ? formatearFecha(paciente.citaProxima) : '-',
              fechaRegistro: (textValidator(paciente.fechaRegistro)) ? formatearFecha(paciente.fechaRegistro) : '-',
              sucursales: paciente.sucursales.nombre,
            }
            );


          }}
          scrollable
          columnResizeMode="expand"
          resizableColumns
        >
          <Column body={renderEditButton}></Column>
          <Column body={renderDeleteButton}></Column>
          <Column body={renderVentaButton}></Column>
          {/* <Column body={(data, options) => test(data, options)}></Column> */}
          <Column body={renderRecetaButton}></Column>
          <Column body={renderAgregarRecetaButton}></Column>
          <Column field="nombre" header="Nombre" sortable filter></Column>
          <Column field="edad" header="Edad" sortable bodyStyle={{ textAlign: 'center' }}></Column>
          <Column field="genero" header="Genero" filter bodyStyle={{ textAlign: 'center' }}></Column>
          <Column field="telefono" header="Telefono" filter bodyStyle={{ textAlign: 'center' }}></Column>
          <Column field="direccion" header="Direccion" filter></Column>
          <Column field="sucursales.nombre" header="Sucursal" filter></Column>
          <Column field="fechaRegistro" header="Registro" body={fechaRegistroBodyTemplate}></Column>
          <Column field="ultimaCita" header="Ultima cita" body={ultimaCitaBodyTemplate}></Column>
          <Column field="citaProxima" header="Cita Proxima" body={citaProximaBodyTemplate}></Column>
        </DataTable>
      </div >
      {/* Formulario para guardar Paciente*/}
      <Dialog Dialog
        open={openDialogPaciente}
        disableEscapeKeyDown={true}
        maxWidth="md"
        fullWidth={true}
        onClose={handleCloseDialogPaciente}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();

            if (textValidator(selectedPaciente)) {
              appointmentApi.put(`paciente/${selectedPaciente}`, formPacientes)
                .then((response) => {
                  console.log(response.status);

                  if (response.status === 202) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue editado correctamente'
                    );
                    const pacientesFiltrados = listPaciente.filter((paciente) => (paciente._id !== selectedPaciente));
                    setListPaciente([response.data, ...pacientesFiltrados]);
                    console.log(response);
                    handleCloseDialogPaciente();
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
                    'Ha ocurrido un error al intentar crear el registro'
                  );
                  console.log(err);
                  handleCloseDialogPaciente();
                  cleanForm();
                });
            } else {
              appointmentApi.post('paciente', formPacientes)
                .then((response) => {
                  if (response.status === 201) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue creado correctamente'
                    );
                    setListPaciente([response.data, ...listPaciente,]);
                    console.log(response);
                    handleCloseDialogPaciente();
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
                    'Ha ocurrido un error al intentar crear el registro'
                  );
                  console.log(err);
                  handleCloseDialogPaciente();
                  cleanForm();
                });
            }
          },
        }
        }
      >
        <DialogTitle>Datos sobre el Paciente</DialogTitle>
        <DialogContent                 >
          <DialogContentText>
            Por favor rellene los campos sobre la informacion de su pacientes
          </DialogContentText>
          <Toast ref={toastForm} />
          <div className='container'>
            <TextField
              autoFocus
              fullWidth
              required
              value={formPacientes.nombre}
              onChange={(event) => handleChangeTextPaciente(event, 'nombre')}
              margin="dense"
              id="nombre"
              name="nombre"
              label="Nombre"
              sx={{ width: '100%' }}
              type="text"
              variant="standard"
              size="small"
            />
            <TextField
              value={formPacientes.edad}
              onChange={(event) => handleChangeTextPaciente(event, 'edad')}
              margin="dense"
              id="edad"
              name="edad"
              label="Edad"
              type="number"
              sx={{ width: '40%' }}
              variant="standard"
              size="small"
            />
            <TextField
              value={formPacientes.telefono}
              onChange={(event) => handleChangeTextPaciente(event, 'telefono')}
              margin="dense"
              id="telefono"
              name="telefono"
              label="Telefono"
              type="text"
              variant="standard"
              size="small"
            />
            <TextField
              value={formPacientes.email}
              onChange={(event) => handleChangeTextPaciente(event, 'email')}
              margin="dense"
              id="email"
              name="email"
              label="Email"
              type="email"
              sx={{ width: '100%' }}
              variant="standard"
              size="small"
            />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="sucursales">Sucursales</InputLabel>
              <Select
                labelId="sucursales"
                id="sucursales"
                value={formPacientes.sucursales}
                onChange={(event) => handleChangeTextPaciente(event, 'sucursales')}
                label="Sucursales"
              >
                {listSucursal.map(op => {
                  return (
                    <MenuItem key={op._id} value={op._id}>{op.nombre}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="genero">Genero</InputLabel>
              <Select
                labelId="genero"
                id="genero"
                value={formPacientes.genero}
                onChange={(event) => handleChangeTextPaciente(event, 'genero')}
                label="Genero"
              >
                <MenuItem key='Femenino' value='Femenino'>Femenino</MenuItem>
                <MenuItem key='Masculino' value='Masculino'>Masculino</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Registro *"
                nombre="fechaRegistro"
                variant="standard"
                value={formPacientes.fechaRegistro}
                format='YYYY-MM-DD'
                onChange={(event) => {
                  if (validarFechaProxima(event)) {
                    createToastForm(
                      'warn',
                      'Acción requerida',
                      'La fecha de registro debe ser menor'
                    );
                    setFormPaciente({
                      ...formPacientes,
                      fechaRegistro: null
                    })
                    return;
                  } else {
                    setFormPaciente({
                      ...formPacientes,
                      fechaRegistro: dayjs(event)
                    })
                  }
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Ultima cita *"
                nombre="ultimaCita"
                variant="standard"
                value={formPacientes.ultimaCita}
                format='YYYY-MM-DD'
                onChange={(event) => {
                  if (validarFechaProxima(event)) {
                    createToastForm(
                      'warn',
                      'Acción requerida',
                      'La fecha para ultima cita debe ser menor'
                    );
                    setFormPaciente({
                      ...formPacientes,
                      ultimaCita: null
                    })
                    return;
                  } else {
                    setFormPaciente({
                      ...formPacientes,
                      ultimaCita: dayjs(event)
                    })
                  }
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Cita proxima *"
                nombre="citaProxima"
                variant="standard"
                value={formPacientes.citaProxima}
                format='YYYY-MM-DD'
                onChange={(event) => {
                  if (!validarFechaProxima(event)) {
                    createToastForm(
                      'warn',
                      'Acción requerida',
                      'La fecha para proxima cita debe ser mayor'
                    );
                    setFormPaciente({
                      ...formPacientes,
                      citaProxima: null
                    })
                    return;
                  } else {
                    setFormPaciente({
                      ...formPacientes,
                      citaProxima: dayjs(event)
                    })
                  }

                }}
              />
            </LocalizationProvider>
          </div>
          <TextField
            value={formPacientes.direccion}
            onChange={(event) => handleChangeTextPaciente(event, 'direccion')}
            margin="dense"
            id="direccion"
            name="direccion"
            label="Direccion"
            type="text"
            multiline
            sx={{ width: '70%' }}
            maxRows={2}
            variant="standard"
            size="small"
          />
          <br />
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogPaciente} >Cancelar</Button>
          <Button variant='contained' type="submit">Guardar</Button>
        </DialogActions>
      </Dialog >
      {/* Formulario para guardar Expediente*/}
      <Dialog Dialog
        open={openDialogAddExpediente}
        disableEscapeKeyDown={true}
        maxWidth="md"
        fullWidth={true}
        onClose={handleCloseDialogAddExpediente}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();

            console.log(formExpedientes);

            // if (!textValidator(selectedPaciente)) {
            //   appointmentApi.put(`inventario/${selectedPaciente}`, formValues)
            //     .then((response) => {
            //       console.log(response.status);

            //       if (response.status === 202) {
            //         createToast(
            //           'success',
            //           'Confirmado',
            //           'El registro fue editado correctamente'
            //         );
            //         handleCloseDialog();
            //         const inventarioFiltrados = listPaciente.filter((inventario) => (inventario._id !== selectedPaciente));
            //         setListPaciente([response.data, ...inventarioFiltrados]);
            //         console.log(response);
            //         cleanForm();
            //       } else {
            //         createToast(
            //           'error',
            //           'Error',
            //           response.statusText,
            //         );
            //         console.log(response.data);
            //         cleanForm();
            //         return;
            //       }
            //     })
            //     .catch((err) => {
            //       createToast(
            //         'error',
            //         'Error',
            //         'Ha ocurrido un error al intentar crear el registro'
            //       );
            //       console.log(err);
            //       handleCloseDialog();
            //       cleanForm();
            //     });
            // } else {
            //   console.log(formValues);
            if (!textValidator(formExpedientes.paciente)) {
              createToast(
                'error',
                'Error',
                'No se selecciono paciente correctamente'
              );
              return;
            }
            appointmentApi.post('expediente', formExpedientes)
              .then((response) => {
                if (response.status === 201) {
                  createToast(
                    'success',
                    'Confirmado',
                    'El registro fue creado correctamente'
                  );
                  handleCloseDialogAddExpediente();
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
                  'Ha ocurrido un error al intentar crear el registro'
                );
                console.log(err);
                handleCloseDialogAddExpediente();
                cleanForm();
              });
            // }
          },
        }
        }
      >
        <DialogTitle>Datos sobre el expediente</DialogTitle>
        <DialogContent                 >
          <DialogContentText>
            Por favor rellene los campos sobre la informacion de su pacientes
          </DialogContentText>
          <FormControl variant="standard" sx={{ width: '50%' }}>
            <InputLabel id="optometrista">Optometrista</InputLabel>
            <Select
              labelId="optometrista"
              id="optometrista"
              sx={{ width: '50%' }}
              value={formExpedientes.optometrista}
              onChange={(event) => handleChangeTextExpediente(event, 'optometrista')}
              label="Optometrista"
            >
              {listoptometrista.map(op => {
                return (
                  <MenuItem key={op._id} value={op._id}>{op.nombre}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
          <TextField
            value={formExpedientes.antecedentes}
            onChange={(event) => handleChangeTextExpediente(event, 'antecedentes')}
            margin="dense"
            id="antecedentes"
            name="antecedentes"
            label="Antecedentes"
            type="text"
            fullWidth
            multiline
            maxRows={3}
            variant="standard"
            size="small"
          />
          <TextField
            value={formExpedientes.enfermedadBase}
            onChange={(event) => handleChangeTextExpediente(event, 'enfermedadBase')}
            margin="dense"
            id="enfermedadBase"
            name="enfermedadBase"
            label="Enfermedad Base"
            type="text"
            multiline
            maxRows={3}
            fullWidth
            variant="standard"
            size="small"
          />
          <TextField
            value={formExpedientes.observaciones}
            onChange={(event) => handleChangeTextExpediente(event, 'observaciones')}
            margin="dense"
            id="observaciones"
            name="observaciones"
            label="Observaciones"
            type="text"
            multiline
            maxRows={3}
            fullWidth
            variant="standard"
            size="small"
          />
          <TextField
            value={formExpedientes.pruebasValoraciones}
            onChange={(event) => handleChangeTextExpediente(event, 'pruebasValoraciones')}
            margin="dense"
            id="pruebasValoraciones"
            name="pruebasValoraciones"
            label="Pruebas y Valoraciones"
            type="text"
            multiline
            fullWidth
            maxRows={3}
            variant="standard"
            size="small"
          />
          <br />
          <br />
          <p className='subtitulo'> Ojo Derecho</p>
          <div className='containerEspecificaciones'>
            <FormControl variant="standard" sx={{ m: 1, width: '80%' }}>
              <InputLabel id="Esfera">Esfera</InputLabel>
              <Select
                labelId="Esfera"
                id="Esfera"
                value={formExpedientes.recetaOjoDerecho.esfera}
                onChange={(event) => {
                  setformExpedientes({
                    ...formExpedientes,
                    recetaOjoDerecho: {
                      ...formExpedientes.recetaOjoDerecho,
                      esfera: event.target.value
                    }
                  })
                }
                }
                label="Esfera"
              >
                {listGraduaciones.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, width: '80%' }}>
              <InputLabel id="cilindro">Cilindro</InputLabel>
              <Select
                labelId="cilindro"
                id="cilindro"
                value={formExpedientes.recetaOjoDerecho.cilindro}
                onChange={(event) => {
                  setformExpedientes({
                    ...formExpedientes,
                    recetaOjoDerecho: {
                      ...formExpedientes.recetaOjoDerecho,
                      cilindro: event.target.value
                    }
                  });
                }
                }
                label="Cilindro"
              >
                {listGraduaciones.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
            <TextField
              value={formExpedientes.recetaOjoDerecho.eje}
              onChange={(event) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoDerecho: {
                    ...formExpedientes.recetaOjoDerecho,
                    eje: event.target.value
                  }
                });
              }
              }
              sx={{ m: 1 }}
              margin="dense"
              id="eje"
              name="eje"
              label="Eje"
              type="text"
              variant="standard"
              size="small"
            />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="agudezaVisual">Agudeza Visual</InputLabel>
              <Select
                labelId="agudezaVisual"
                id="agudezaVisual"
                value={formExpedientes.recetaOjoDerecho.agudezaVisual}
                onChange={(event) => {
                  setformExpedientes({
                    ...formExpedientes,
                    recetaOjoDerecho: {
                      ...formExpedientes.recetaOjoDerecho,
                      agudezaVisual: event.target.value
                    }
                  });
                }
                }
                label="Agudeza Visual"
              >
                {listAgudezaVisual.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
            <TextField
              value={formExpedientes.recetaOjoDerecho.distanciaPupilar}
              onChange={(event) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoDerecho: {
                    ...formExpedientes.recetaOjoDerecho,
                    distanciaPupilar: event.target.value
                  }
                });
              }
              }
              margin="dense"
              id="dipDer"
              name="dipDer"
              label="Dist pupilar"
              type="text"
              variant="standard"
              size="small"
            />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="adicion">Adicion</InputLabel>
              <Select
                labelId="adicion"
                id="adicion"
                value={formExpedientes.recetaOjoDerecho.adicion}
                onChange={(event) => {
                  setformExpedientes({
                    ...formExpedientes,
                    recetaOjoDerecho: {
                      ...formExpedientes.recetaOjoDerecho,
                      adicion: event.target.value
                    }
                  });
                }
                }
                label="Adicion"
              >
                {listAdicion.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
            <TextField
              value={formExpedientes.recetaOjoDerecho.defRefraccion}
              onChange={(event) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoDerecho: {
                    ...formExpedientes.recetaOjoDerecho,
                    defRefraccion: event.target.value
                  }
                });
              }
              }
              margin="dense"
              id="defRefraccionDer"
              name="defRefraccionDer"
              label="Def. refraccion"
              type="text"
              variant="standard"
              size="small"
            />
          </div>
          <p className='subtitulo'>Ojo Izquierdo</p>
          <div className='containerEspecificaciones'>
            <FormControl variant="standard" sx={{ m: 1, width: '80%' }}>
              <InputLabel id="Esfera">Esfera</InputLabel>
              <Select
                labelId="Esfera"
                id="Esfera"
                value={formExpedientes.recetaOjoIzquierdo.esfera}
                onChange={(event) => {
                  setformExpedientes({
                    ...formExpedientes,
                    recetaOjoIzquierdo: {
                      ...formExpedientes.recetaOjoIzquierdo,
                      esfera: event.target.value
                    }
                  });
                }
                }
                label="Esfera"
              >
                {listGraduaciones.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, width: '80%' }}>
              <InputLabel id="cilindro">Cilindro</InputLabel>
              <Select
                labelId="cilindro"
                id="cilindro"
                value={formExpedientes.recetaOjoIzquierdo.cilindro}
                onChange={(event) => {
                  setformExpedientes({
                    ...formExpedientes,
                    recetaOjoIzquierdo: {
                      ...formExpedientes.recetaOjoIzquierdo,
                      cilindro: event.target.value
                    }
                  });
                }
                }
                label="Cilindro"
              >
                {listGraduaciones.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
            <TextField
              value={formExpedientes.recetaOjoIzquierdo.eje}
              onChange={(event) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoIzquierdo: {
                    ...formExpedientes.recetaOjoIzquierdo,
                    eje: event.target.value
                  }
                });
              }
              }
              margin="dense"
              id="eje"
              name="eje"
              label="Eje"
              type="text"
              variant="standard"
              size="small"
            />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="agudezaVisual">Agudeza Visual</InputLabel>
              <Select
                labelId="agudezaVisual"
                id="agudezaVisual"
                value={formExpedientes.recetaOjoIzquierdo.agudezaVisual}
                onChange={(event) => {
                  setformExpedientes({
                    ...formExpedientes,
                    recetaOjoIzquierdo: {
                      ...formExpedientes.recetaOjoIzquierdo,
                      agudezaVisual: event.target.value
                    }
                  });
                }
                }
                label="Agudeza Visual"
              >
                {listAgudezaVisual.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
            <TextField
              value={formExpedientes.recetaOjoIzquierdo.distanciaPupilar}
              onChange={(event) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoIzquierdo: {
                    ...formExpedientes.recetaOjoIzquierdo,
                    distanciaPupilar: event.target.value
                  }
                });
              }
              }
              margin="dense"
              id="dipDer"
              name="dipDer"
              label="Dist pupilar"
              type="text"
              variant="standard"
              size="small"
            />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="adicion">Adicion</InputLabel>
              <Select
                labelId="adicion"
                id="adicion"
                value={formExpedientes.recetaOjoIzquierdo.adicion}
                onChange={(event) => {
                  setformExpedientes({
                    ...formExpedientes,
                    recetaOjoIzquierdo: {
                      ...formExpedientes.recetaOjoIzquierdo,
                      adicion: event.target.value
                    }
                  });
                }
                }
                label="Adicion"
              >
                {listAdicion.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
            <TextField
              value={formExpedientes.recetaOjoIzquierdo.defRefraccion}
              onChange={(event) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoIzquierdo: {
                    ...formExpedientes.recetaOjoIzquierdo,
                    defRefraccion: event.target.value
                  }
                });
              }
              }
              margin="dense"
              id="defRefraccionDer"
              name="defRefraccionDer"
              label="Def. Refraccion"
              type="text"
              variant="standard"
              size="small"
            />
          </div>
          <br />
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogAddExpediente} >Cancelar</Button>
          <Button variant='contained' type="submit">Guardar</Button>
        </DialogActions>
      </Dialog >
      {/* Modal para visualizar receta  */}
      <Dialog
        open={openDialogReceta}
        disableEscapeKeyDown={true}
        maxWidth="xl"
        onClose={handleCloseDialogReceta}
      >
        <DialogTitle>Expediente {pacienteDatos.nombre}</DialogTitle>
        <DialogContent
        >
          <div className="card">
            <TabView scrollable>
              {listExpedientePaciente.map(ex => {
                return (
                  <TabPanel key={ex._id} header={formatearFecha(ex.fecha)}>

                    <p className='parrafoReceta'>
                      <span className='campo'>Optometrista: </span>
                      <span className='valor'>{ex.optometrista.nombre}</span>
                    </p>
                    <p className='parrafoReceta'>
                      <span className='campo'>Antecedentes: </span>
                      <span className='valor'>{ex.antecedentes}</span>
                    </p>
                    <p className='parrafoReceta'>
                      <span className='campo'>Observaciones: </span>
                      <span className='valor'>{ex.observaciones}</span>
                    </p>
                    <p className='parrafoReceta'>
                      <span className='campo'>Enfermedades de base: </span>
                      <span className='valor'>{ex.enfermedadBase}</span>
                    </p>
                    <p className='parrafoReceta'>
                      <span className='campo'>Pruebas y valoraciones: </span>
                      <span className='valor'>{ex.pruebasValoraciones}</span>
                    </p>
                    <br />
                    <p className='titulo'>Historial</p>
                    <p className='subtitulo'>Ojo Derecho</p>
                    <div className='containerReceta'>
                      <div className='cajasReceta'>
                        <p className='campo'>Esfera</p>
                        <p className='valor'>{ex.recetaOjoDerecho.esfera}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Cilindro</p>
                        <p className='valor'>{ex.recetaOjoDerecho.cilindro}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Eje</p>
                        <p className='valor'>{ex.recetaOjoDerecho.eje}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Agudeza Visual</p>
                        <p className='valor'>{ex.recetaOjoDerecho.agudezaVisual}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Dist. Pupilar</p>
                        <p className='valor'>{ex.recetaOjoDerecho.distanciaPupilar}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Adición</p>
                        <p className='valor'>{ex.recetaOjoDerecho.adicion}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Def. Refracción</p>
                        <p className='valor'>{ex.recetaOjoDerecho.defRefraccion}</p>
                      </div>
                    </div>
                    <br />
                    <p className='subtitulo'>Ojo Izquierdo</p>
                    <div className='containerReceta'>
                      <div className='cajasReceta'>
                        <p className='campo'>Esfera</p>
                        <p className='valor'>{ex.recetaOjoIzquierdo.esfera}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Cilindro</p>
                        <p className='valor'>{ex.recetaOjoIzquierdo.cilindro}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Eje</p>
                        <p className='valor'>{ex.recetaOjoIzquierdo.eje}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Agudeza Visual</p>
                        <p className='valor'>{ex.recetaOjoIzquierdo.agudezaVisual}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Dist. Pupilar</p>
                        <p className='valor'>{ex.recetaOjoIzquierdo.distanciaPupilar}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Adición</p>
                        <p className='valor'>{ex.recetaOjoIzquierdo.adicion}</p>
                      </div>
                      <div className='cajasReceta'>
                        <p className='campo'>Def. Refracción</p>
                        <p className='valor'>{ex.recetaOjoIzquierdo.defRefraccion}</p>
                      </div>
                    </div>
                  </TabPanel>
                )
              })
              }

            </TabView>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleCloseDialogReceta}>OK</Button>
        </DialogActions>
      </Dialog>
      {/* Modal para agregar venta  */}
      <Dialog
        open={openDialogVenta}
        disableEscapeKeyDown={true}
        maxWidth="xl"
        fullWidth={true}
        onClose={handleCloseDialogVenta}
      >
        <DialogTitle>Datos sobre la venta</DialogTitle>
        <DialogContent
        >
          <p style={{ fontSize: '25px', textAlign: 'center', fontWeight: 'bold' }}>{pacienteDatos.nombre}</p>
          <FormControl>
            <FormLabel id="tipoVenta">Tipo de Venta</FormLabel>
            <RadioGroup
              row
              autoFocus
              fullWidth
              required
              value={formVenta.tipoVenta}
              onChange={(event) => handleChangeTextVenta(event, 'tipoVenta')}
              id="tipoVenta"
              name="tipoVenta"
              sx={{ width: '100%' }}
              size="small"
            >
              {tipoVenta.map(op => {
                return (
                  <FormControlLabel value={op} control={<Radio />} label={op} />
                )
              }

              )}
            </RadioGroup>
          </FormControl>
          {/* {formVenta.tipoVenta === 'Cambio de aro' && */}
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="tipoLente">Tipo de Lente</InputLabel>
            <Select
              labelId="tipoLente"
              id="tipoLente"
              value={formVenta.tipoLente}
              onChange={(event) => handleChangeTextVenta(event, 'tipoLente')}
              label="Adicion"
            >
              {tipoLente.map(op => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
              )
              )}
            </Select>
          </FormControl>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="proteccion">Protección</InputLabel>
            <Select
              labelId="proteccion"
              id="proteccion"
              value={formVenta.proteccion}
              onChange={(event) => handleChangeTextVenta(event, 'proteccion')}
              label="Adicion"
            >
              {proteccion.map(op => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
              )
              )}
            </Select>
          </FormControl>
          <TextField
            value={formVenta.material}
            onChange={(event) => handleChangeTextVenta(event, 'email')}
            margin="dense"
            id="material"
            name="material"
            label="Material"
            type="text"
            variant="standard"
            size="small"
          />
          <TextField
            value={formVenta.modaArmazon}
            onChange={(event) => handleChangeTextVenta(event, 'modaArmazon')}
            margin="dense"
            id="modaArmazon"
            name="modaArmazon"
            label="Moda Armazon"
            type="text"
            variant="standard"
            size="small"
          />
          <DataTable value={listInventario}
            showGridlines
            stripedRows
            size='small'
            sortMode="multiple"
            paginator
            rows={5}
            filters={filtersInventario}
            filterDisplay='row'
            selectionMode="single"
            cellSelection
           // onCellSelect={onCellSelect}
            // onSelectionChange={(e) => {
            //   console.log(e);

            // }}
            scrollable
            columnResizeMode="expand"
            resizableColumns                >
            <Column body={renderEditButton}></Column>
            <Column field="descripcion" header="Descripcion" sortable filter></Column>
            <Column field="linea" header="Linea" filter></Column>
            <Column field="existencia" header="Existencia" sortable ></Column>
            <Column field="precioVenta" header="Precio Venta" sortable body={precioVentaBodyTemplate}></Column>
            <Column field="moda" header="Moda" filter></Column>
            <Column field="color" header="Color"></Column>
            <Column field="diseno" header="Diseño"></Column>
            <Column field="proveedor" header="Proveedor" filter></Column>
          </DataTable>
          {/* {tipoVenta: '',
  tipoLente: '',
  proteccion: '',
  material: '',
  modaArmazon: '',
  pacientes: '',
  detalleInventario: [{
    inventario: '',
    cantidad: 0,
    precioVendido: 0,
    descuento: 0,
  }],
  fecha: '',
  fechaEntrega: '',
  detallePagos: [{
    fecha: '',
    formaPago: '',
    monto: 0
  }],
  descuentoTotal: '',
  cantPagos: '',
  montoPagos: '',
  total: '',
  acuenta: '',
} */}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogVenta} >Cancelar</Button>
          <Button variant='contained' type="submit">Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
