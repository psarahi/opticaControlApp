import React, { useEffect, useState, useRef } from 'react'

import AddIcon from '@mui/icons-material/Add';
import {
  ConfirmDialog, confirmDialog, Toast,
  FilterMatchMode, DataTable, Column, TabView,
  TabPanel, InputNumber,
}
  from 'primereact';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
//import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import {
  Button, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, InputLabel,
  MenuItem, Radio, RadioGroup, TextField, Select
} from '@mui/material';

import { Select as SelectReact } from "react-dropdown-select";

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';

import { appointmentApi } from '../../services/appointmentApi';
import { formatearFecha, formatearNumero } from '../../helpers/formato';
import { textValidator, validarFechaProxima } from '../../helpers/validator';
import './PacienteStyle.css';
import { agudezaVisual, obtenerAdicion, obtenerGraduaciones } from '../../helpers/metricas';
import afternoon from '../../assets/afternoon.png';
import crescentMoon from '../../assets/crescent-moon.png';
import sunny from '../../assets/sunny.png';

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
  proteccion: null,
  material: '',
  moda: '',
  paciente: '',
  detalleInventario: [{
    inventario: '',
    cantidad: 0,
    descuento: 0,
  }],
  fecha: new Date(),
  fechaEntrega: null,
  detallePagos: [{
    fecha: new Date(),
    formaPago: '',
    monto: 0
  }],
  descuentoTotal: '',
  cantPagos: 0,
  montoPagos: 0,
  total: 0,
  acuenta: 0,
};

//document.body.style.zoom = '90%';
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
  const [listInventarioSeleccionado, setlistInventarioSeleccionado] = useState([])
  const [listExpedientePaciente, setlistExpedientePaciente] = useState([]);
  const [totalVenta, settotalVenta] = useState(0);
  const [subtotalVenta, setsubtotalVenta] = useState(0);
  const [totalDescuento, settotalDescuento] = useState(0);
  const [cantPagos, setcantPagos] = useState(0);
  const [montoPagos, setmontoPagos] = useState(0);
  const [acuenta, setacuenta] = useState(0);
  const [detallePagos, setdetallePagos] = useState({
    fecha: new Date(),
    formaPago: '',
    monto: 0
  });

  const tipoVenta = [
    'Cambio de aro',
    'Cambio de lente',
    'Compra total'
  ]

  const proteccion = [
    {
      value: 1,
      label: 'Transitions'
    },
    {
      value: 2,
      label: 'Blanco'
    },
    {
      value: 3,
      label: 'Antireflejo'
    },
    {
      value: 4,
      label: 'Fotocromatico'
    },
    {
      value: 5,
      label: 'Foto AR'
    },
    {
      value: 6,
      label: 'Blue'
    }
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

  const tipoPago = [
    'Efectivo',
    'Tarjeta',
  ];

  useEffect(() => {
    bienvenida();
    appointmentApi.get('paciente', '').then((response) => {
      setListPaciente(response.data);
    });
    appointmentApi.get('sucursal', '').then((response) => {
      setlistSucursal(response.data);
    });
    appointmentApi.get('optometrista', '').then((response) => {
      setlistoptometrista(response.data);
    });
    appointmentApi.get('inventario/inventarioExistente', '').then((response) => {
      setListInventario(response.data);
    })
    cleanForm();

    setListGraduaciones(obtenerGraduaciones());
    setListAdicion(obtenerAdicion());
    setListAgudezaVisual(agudezaVisual);

  }, [])

  const bienvenida = () => {
    let saludo = '';
    let imagen = '';
    const hour = new Date().getHours();

    if (hour <= 12) {
      saludo = 'Buen día';
      imagen = sunny;
    }
    if (hour > 12 && hour < 18) {
      saludo = 'Buenas tardes';
      imagen = afternoon;
    }
    if (hour > 17) {
      saludo = 'Buenas noches';
      imagen = crescentMoon;
    }

    const nombre = `${localStorage.getItem('nombre')}`;
    createToastSaludo(
      'success',
      saludo,
      nombre,
      imagen
    );
  };

  const createToastSaludo = (severity, summary, detail, imagen) => {
    toast.current.show({
      severity: severity, summary: summary, detail: detail, life: 6000,
      content: (props) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img src={imagen} style={{ width: '15%' }} />
          <div style={{
            marginLeft: '4%'
          }}>
            <p
              style={{
                fontSize: '20px',
                margin: '0%',
                fontWeight: 'bold',
              }}
            >{props.message.summary}</p>
            <p
              style={{
                fontSize: '19px',
                margin: '0%',
                fontWeight: 300
              }}
            >{props.message.detail}</p>
          </div>
        </div>
      )
    });
  };

  const cleanForm = () => {
    setFormPaciente(pacienteJson);
    setSelectedPaciente(null);
    setformExpedientes(expedientes);
    setlistExpedientePaciente([]);
    setPacienteDatos(pacienteJson);
    setlistInventarioSeleccionado([]);
    setformVenta(detalleVenta);
    settotalVenta(0);
    setsubtotalVenta(0);
    settotalDescuento(0);
    setcantPagos(0);
    setmontoPagos(0);
    setacuenta(0);
    setdetallePagos({
      fecha: new Date(),
      formaPago: '',
      monto: 0
    });
    appointmentApi.get('inventario/inventarioExistente', '').then((response) => {
      setListInventario(response.data);
    })
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
    cleanForm();
    setOpenDialogVenta(false);
  };

  const toast = useRef(null);
  const toastSaludo = useRef(null);
  const toastForm = useRef(null);
  const toastFormVenta = useRef(null);

  const createToast = (severity, summary, detail) => {
    toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
  };

  const createToastForm = (severity, summary, detail) => {
    toastForm.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
  };
  const createToastFormVenta = (severity, summary, detail) => {
    toastFormVenta.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
  };

  const onCellSelect = (event) => {
    const paciente = event.rowData;
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

    if (event.cellIndex === 0) {
      handleOpenDialogPost();
    } else if (event.cellIndex === 1) {
      handleDelete();
    } else if (event.cellIndex === 2) {
      handleOpenDialogVenta();
    } else if (event.cellIndex === 3) {
      appointmentApi.get(`expediente/paciente/${event.rowData._id}`, '')
        .then(async (response) => {

          setlistExpedientePaciente(await response.data);
        });

      handleReceta();

    } else if (event.cellIndex === 4) {
      handleOpenDialogAddExpediente();
    }
  };

  const onCellSelectedInventario = (event) => {
    if (event.cellIndex === 0) {
      const existe = listInventarioSeleccionado.filter(
        (item) => item.inventario === event.rowData._id
      );

      if (existe.length > 0) {
        let total = 0;
        let seleccionado = listInventario.filter((i) => i._id === event.rowData._id);
        if (existe[0].cantidad <= seleccionado[0].existencia) {

          setlistInventarioSeleccionado(
            listInventarioSeleccionado.map((i) =>
              i.inventario === event.rowData._id ? { ...i, cantidad: i.cantidad + 1 } : i

            )
          );
          total = listInventarioSeleccionado.reduce((acc, current) => acc + current.precioVenta * current.cantidad, 0);
          // settotalDescuento(descuento);
          settotalVenta((prev) => prev + total);
          setsubtotalVenta((prev) => prev + total);
          setcantPagos(0);
          setmontoPagos(0);
          setacuenta(0);
          setdetallePagos({
            fecha: new Date(),
            formaPago: '',
            monto: 0
          });

          setListInventario(
            listInventario.map((i) =>
              i._id === event.rowData._id ? { ...i, existencia: i.existencia - 1 } : i
            )
          );
        } else {
          createToastFormVenta(
            'warn',
            'Acction no permitida',
            'No puede agregar, no tiene más existencia'
          );
        }
      } else {
        setListInventario(
          listInventario.map((i) =>
            i._id === event.rowData._id ? { ...i, existencia: i.existencia - 1 } : i
          )
        );

        setlistInventarioSeleccionado([
          ...listInventarioSeleccionado,
          {
            descripcion: event.rowData.descripcion,
            inventario: event.rowData._id,
            cantidad: 1,
            existencia: event.rowData.existencia,
            precioVenta: event.rowData.precioVenta,
            descuento: 0,
            moda: event.rowData.moda
          }
        ]);

        settotalDescuento((prev) => prev + 0);
        settotalVenta((prev) => prev + event.rowData.precioVenta);
        setsubtotalVenta((prev) => prev + event.rowData.precioVenta);
        setcantPagos(0);
        setmontoPagos(0);
        setacuenta(0);
        setdetallePagos({
          fecha: new Date(),
          formaPago: '',
          monto: 0
        });
      }
    }
  };

  const calcularTotal = (inv) => {
    let total = 0;
    let descuento = 0;
    inv.forEach((item) => {
      descuento += item.descuento;
      total += item.precioVenta * item.cantidad;
    });
    settotalDescuento(descuento);
    setsubtotalVenta(total);
    settotalVenta(total - descuento);
    setcantPagos(0);
    setmontoPagos(0);
    setacuenta(0);
    setdetallePagos({
      fecha: new Date(),
      formaPago: '',
      monto: 0
    });
  };

  const onCellInventarioVenta = (event) => {
    if (event.cellIndex === 0) {

      const seleccionado = listInventarioSeleccionado.filter(
        (item) => item.inventario === event.rowData.inventario
      );

      if (seleccionado[0].cantidad === 1) {
        const inventarioFiltrado = listInventarioSeleccionado.filter((inv) => (inv.inventario !== event.rowData.inventario));

        setlistInventarioSeleccionado([...inventarioFiltrado]);

        calcularTotal(inventarioFiltrado);
        setListInventario(
          listInventario.map((i) =>
            i._id === event.rowData._id ? { ...i, existencia: i.existencia + 1 } : i
          )
        );
      }

      if (seleccionado[0].cantidad > 1) {
        let total = 0;
        // let descuento = 0;
        setlistInventarioSeleccionado(
          listInventarioSeleccionado.map((i) =>
            i.inventario === event.rowData.inventario ? { ...i, cantidad: i.cantidad - 1 } : i
          )
        );
        total = listInventarioSeleccionado.reduce((acc, current) => acc + current.precioVenta * current.cantidad, 0);
        // settotalDescuento(descuento);
        settotalVenta((prev) => prev + total);
        setsubtotalVenta((prev) => prev + total);
        setcantPagos(0);
        setmontoPagos(0);
        setacuenta(0);
        setdetallePagos({
          fecha: new Date(),
          formaPago: '',
          monto: 0
        });
        setListInventario(
          listInventario.map((i) =>
            i._id === event.rowData.inventario ? { ...i, existencia: i.existencia + 1 } : i
          )
        );
      }
    }
  };

  const handleChangeTextPaciente = ({ target }, select) => {
    setFormPaciente({
      ...formPacientes,
      [select]: target.value
    })
  };

  const handleChangeTextVenta = ({ target }, select) => {
    setformVenta({
      ...formVenta,
      [select]: target.value
    })
  };

  const handleChangeTextExpediente = ({ target }, select) => {
    setformExpedientes({
      ...formExpedientes,
      [select]: target.value
    })
  };

  const handleReceta = () => {
    handleOpenDialogReceta();
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

  const renderAddButton = () => {
    return (
      <AddIcon color='primary' fontSize='medium' />
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

  const precioBodyTemplate = (precio) => {
    return formatearNumero(precio);
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

  const fechaBodyTemplate = (fecha) => {
    return formatearFecha(fecha);
  };

  const onRowEditComplete = (e) => {
    let _inventario = [...listInventarioSeleccionado];
    let { newData, index } = e;

    _inventario[index] = newData;

    setlistInventarioSeleccionado(_inventario);
    calcularTotal(_inventario);
  };

  const textEditor = (options) => {
    return <InputNumber type="text" value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />;
  };

  const allowEdit = (rowData) => {
    return true;
  };

  const generarFactura = () => {
    if (!textValidator(formVenta)) {
      createToastFormVenta(
        'warn',
        'Acction requerida',
        'No selecciono ningun tipo de venta'
      );
      return;
    }

    if (listInventarioSeleccionado.length <= 0) {
      createToastFormVenta(
        'warn',
        'Acction requerida',
        'No selecciono ningun actículo'
      );
      return;
    }

    if (acuenta <= 0) {
      createToastFormVenta(
        'warn',
        'Acction requerida',
        'No recibio ningun pago'
      );
      return;
    }

    let detalleInv = [];

    let proteccionList = (textValidator(formVenta.proteccion)) ? formVenta.proteccion.map(p => p.label) : '';
    listInventarioSeleccionado.forEach(inv => {
      detalleInv.push({
        inventario: inv.inventario,
        cantidad: inv.cantidad,
        descuento: inv.descuento,
      })
    })

    let datosSave = {
      tipoVenta: formVenta.tipoVenta,
      tipoLente: formVenta.tipoLente,
      proteccion: proteccionList,
      material: formVenta.material, //Falta
      moda: formVenta.moda, // Falta
      paciente: selectedPaciente,
      sucursales: localStorage.getItem('sucursalID'),
      detalleInventario: detalleInv, // Falta
      fecha: formVenta.fecha,
      fechaEntrega: formVenta.fechaEntrega,
      detallePagos: detallePagos,
      descuentoTotal: totalDescuento,
      cantPagos: cantPagos,
      montoPagos: montoPagos,
      total: totalVenta,
      acuenta: acuenta
    };

    console.log(datosSave);

    appointmentApi.post('detalleVentas', datosSave)
      .then((response) => {
        if (response.status === 201) {
          appointmentApi.put('inventario/actualizarInventario', { detalleInventario: listInventarioSeleccionado })
            .then((response) => {
              if (response.status === 202) {
                createToast(
                  'success',
                  'Confirmado',
                  'El inventario ha sido actualizado'
                );
              }
            });
          createToast(
            'success',
            'Confirmado',
            'La factura a sido generada'
          );
          console.log(response);
          cleanForm();
          handleCloseDialogVenta();
        } else {
          createToast(
            'error',
            'Error',
            response.statusText,
          );
          console.log(response.data);
          cleanForm();
          handleCloseDialogVenta();
          return;
        }
      })
      .catch((err) => {
        createToast(
          'error',
          'Error',
          'Ha ocurrido un error al intentar generar la factura'
        );
        handleCloseDialogVenta();
      })

  };


  return (
    <>
      <h1>Informacion sobre Pacientes </h1>
      <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenDialogPost}>Agregar Paciente</Button>
      <br />
      <br />
      <Toast ref={toast} />
      <Toast ref={toastSaludo} />

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
          <Column field="fechaRegistro" header="Registro" body={(data) => fechaBodyTemplate(data.fechaRegistro)}></Column>
          <Column field="ultimaCita" header="Ultima cita" body={(data) => fechaBodyTemplate(data.ultimaCita)}></Column>
          <Column field="citaProxima" header="Cita Proxima" body={(data) => fechaBodyTemplate(data.citaProxima)}></Column>
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
            Por favor rellene los campos sobre la informacion de su paciente
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
                      fechaRegistro: dayjs()
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
                      ultimaCita: dayjs()
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
                      citaProxima: dayjs()
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
        maxWidth="lg"
        fullWidth={true}
        onClose={handleCloseDialogAddExpediente}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();

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
            Por favor rellene los campos sobre la informacion de su paciente
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
          <Toast ref={toastFormVenta} />
          <p style={{ fontSize: '26px', textAlign: 'center', fontWeight: 'bold' }}>{pacienteDatos.nombre}</p>
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <FormControl>
              <FormLabel id="tipoVenta">Tipo de Venta</FormLabel>
              <RadioGroup
                row
                autoFocus
                required
                value={formVenta.tipoVenta}
                onChange={(event) => handleChangeTextVenta(event, 'tipoVenta')}
                id="tipoVenta"
                name="tipoVenta"
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

          </div>
          <br />
          <div className='infoLentes'>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Fecha entrega *"
                nombre="fechaEntrega"
                variant="standard"
                value={formVenta.fechaEntrega}
                format='YYYY-MM-DD'
                onChange={(event) => {
                  console.log(event);
                  
                  if (!validarFechaProxima(event)) {
                    createToastFormVenta(
                      'warn',
                      'Acción requerida',
                      'La fecha de registro debe ser mayor'
                    );
                    setformVenta({
                      ...formVenta,
                      fechaEntrega: dayjs()
                    })
                    return;
                  } else {
                    setformVenta({
                      ...formVenta,
                      fechaEntrega: dayjs(event)
                    })
                  }
                }}
              />
            </LocalizationProvider>
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
            <div>
              <p>Protección</p>
              <SelectReact
                options={proteccion}
                value={formVenta.proteccion}
                name='Proteccion'
                multi={true}
                style={{ width: '300px' }}
                labelField="label"
                valueField="value"
                onChange={(e) => {
                  console.log(e);
                  setformVenta({
                    ...formVenta,
                    proteccion: e
                  });
                  // setvalue(e)
                }
                }
              />
            </div>
            {(formVenta.tipoVenta === 'Cambio de aro' || formVenta.tipoVenta === 'Cambio de lente') &&
              <TextField
                value={formVenta.material}
                onChange={(event) => handleChangeTextVenta(event, 'material')}
                margin="dense"
                id="material"
                name="material"
                label="Material"
                type="text"
                sx={{ m: 1 }}
                variant="standard"
                size="small"
              />
            }
            {formVenta.tipoVenta === 'Cambio de lente' &&
              <TextField
                value={formVenta.moda}
                onChange={(event) => handleChangeTextVenta(event, 'moda')}
                margin="dense"
                id="moda"
                name="moda"
                label="Moda Armazon"
                type="text"
                sx={{ m: 1 }}
                variant="standard"
                size="small"
              />
            }
          </div>
          <p className='titulo'>Seleccione el inventario</p>
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
            //selection={setSelectedPaciente}
            cellSelection
            onCellSelect={onCellSelectedInventario}
            scrollable
            columnResizeMode="expand"
            resizableColumns
          >
            <Column body={renderAddButton}></Column>
            <Column field="descripcion" header="Descripcion" sortable filter></Column>
            <Column field="linea" header="Linea" filter></Column>
            <Column field="existencia" header="Existencia" sortable ></Column>
            <Column field="precioVenta" header="Precio Venta" sortable body={(data) => precioBodyTemplate(data.precioVenta)}></Column>
            <Column field="moda" header="Moda" filter></Column>
            <Column field="color" header="Color"></Column>
            <Column field="diseno" header="Diseño"></Column>
            <Column field="proveedor" header="Proveedor" filter></Column>
          </DataTable>
          <br />
          <br />
          <DataTable value={listInventarioSeleccionado}
            showGridlines
            stripedRows
            size='small'
            sortMode="multiple"
            paginator
            rows={5}
            selectionMode="single"
            cellSelection
            onCellSelect={onCellInventarioVenta}
            scrollablev
            columnResizeMode="expand"
            resizableColumns
            editMode="row"
            onRowEditComplete={onRowEditComplete}
          >
            <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
            <Column field="descripcion" header="Descripcion" ></Column>
            <Column field="cantidad" header="Cantidad"></Column>
            <Column field="precioVenta" header="Precio Venta" body={(data) => precioBodyTemplate(data.precioVenta)}></Column>
            <Column field="descuento" header="Descuento" editor={(options) => textEditor(options)}></Column>
            <Column rowEditor={allowEdit} headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
          </DataTable>
          <br />
          <br />
          <p className='titulo'>Detalle de pago</p>
          <br />
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '5px'
            }}>
              <div>
                <TextField
                  id="cantPagos"
                  label="Cantidad de Pagos"
                  type="number"
                  variant="standard"
                  sx={{ m: 1 }}
                  value={cantPagos}
                  onChange={(event) => {
                    if (event.target.value < 0) {
                      createToastFormVenta(
                        'error',
                        'Error',
                        'La cantidad de pagos no puede ser negativa'
                      );
                      return;
                    } else {
                      setcantPagos(event.target.value);
                      setmontoPagos(totalVenta / event.target.value);
                    }
                  }}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
                <TextField
                  id="montoPagos"
                  label="Monto de Pagos"
                  type="number"
                  disabled={true}
                  variant="standard"
                  sx={{ m: 1 }}
                  value={montoPagos}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </div>
              <div>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="tipoPago">Tipo pago</InputLabel>
                  <Select
                    labelId="tipoPago"
                    id="tipoPago"
                    value={detallePagos.formaPago}
                    onChange={(event) => {
                      setdetallePagos({
                        ...detallePagos,
                        formaPago: event.target.value
                      })
                    }}
                    label="tipoPago"
                  >
                    {tipoPago.map(op => {
                      return (
                        <MenuItem key={op} value={op}>{op}</MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
                <TextField
                  id="acuenta"
                  label="Acuenta"
                  type="number"
                  variant="standard"
                  sx={{ m: 1 }}
                  value={acuenta}
                  onChange={(event) => {
                    setdetallePagos({
                      ...detallePagos,
                      monto: event.target.value
                    })
                    setacuenta(event.target.value);
                  }}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </div>
            </div>
            <div >
              <p style={{ fontSize: '25px' }}>
                <span style={{ fontWeight: 200 }}>Sub Total: </span>
                <span>{subtotalVenta}</span>
              </p>
              <p style={{ fontSize: '25px' }}>
                <span style={{ fontWeight: 200 }}>Descuento: </span>
                <span>{totalDescuento}</span>
              </p>
              <p style={{ fontSize: '25px' }}>
                <span style={{ fontWeight: 200 }}>Total: </span>
                <span>{totalVenta}</span>
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px'
          }}>
            <Button variant='contained' >Generar recibo</Button>
            <Button variant='contained' onClick={generarFactura} type="submit">Generar factura</Button>
          </div>

        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleCloseDialogVenta}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
