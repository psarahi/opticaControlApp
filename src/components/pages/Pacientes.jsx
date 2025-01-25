import React, { useEffect, useState, useRef } from 'react'

import AddIcon from '@mui/icons-material/Add';
import {
  ConfirmDialog, confirmDialog, Toast,
  FilterMatchMode, DataTable, Column, TabView,
  TabPanel, InputNumber,
}
  from 'primereact';

import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
//import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import {
  Button, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, InputLabel,
  MenuItem, Radio, RadioGroup, TextField, Select,
  Switch,
  Autocomplete
} from '@mui/material';

import { Select as SelectReact } from "react-dropdown-select";

import dayjs from 'dayjs';

import { opticaControlApi } from '../../services/opticaControlApi';
import { formatearFecha, formatearNumero } from '../../helpers/formato';
import { textValidator, validarFechaProxima } from '../../helpers/validator';
import './PacienteStyle.css';
import { agudezaVisual, obtenerAdicion, obtenerGraduaciones } from '../../helpers/metricas';
import { nuevaFactura } from '../../helpers/nuevaFactura';

const pacienteJson = {
  nombre: '',
  edad: '',
  genero: '',
  telefono: '',
  email: '',
  direccion: '',
  fechaRegistro: dayjs().format('YYYY-MM-DD'),
  ultimaCita: dayjs().format('YYYY-MM-DD'),
  sucursales: '',
  citaProxima: dayjs().format('YYYY-MM-DD'),
  estado: true
};

const expedientes = {
  paciente: '',
  tipoLente: '',
  proteccion: null,
  optometrista: '',
  fecha: dayjs().format('YYYY-MM-DD'),
  antecedentes: '',
  enfermedadBase: '',
  observaciones: '',
  pruebasValoraciones: '',
  usuarios: localStorage.getItem('usuarioId'),
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
    // descuento: 0,
  }],
  fecha: dayjs().format('YYYY-MM-DD'),
  entregaProgramada: dayjs().format('YYYY-MM-DD'),
  fechaEntrega: dayjs().format('YYYY-MM-DD'),
  detallePagos: [{
    fecha: dayjs().format('YYYY-MM-DD'),
    formaPago: '',
    monto: 0,
    usuarios: localStorage.getItem('usuarioId')
  }],
  descuentoTotal: '',
  cantPagos: 0,
  montoPagos: 0,
  total: 0,
  acuenta: 0,
  numFacRec: '',
  // entregado: false,
  // trabajoHecho: false,
  // estado: true,
};

const inventarioJson = {
  descripcion: '',
  esfera: '',
  cilindro: '',
  adicion: '',
  linea: '',
  precioVenta: '',
  precioCompra: '',
  existencia: '',
  importe: '',
  valorGravado: '',
  categoria: '',
  proveedor: '',
  telefono: '',
  moda: '',
  material: '',
  diseno: '',
  color: '',
  estado: true,
  sucursales: localStorage.getItem('sucursalID')
}

export const Pacientes = () => {
  let pacienteSeleccionado = '';
  const [enableOp] = useState((localStorage.getItem('tipoUsuario') === 'Administrador') ? true : false);
  const [openDialogPaciente, setOpenDialogPaciente] = useState(false);
  const [openDialogReceta, setOpenDialogReceta] = useState(false);
  const [openDialogAddExpediente, setOpenDialogAddExpediente] = useState(false);
  const [openDialogVenta, setOpenDialogVenta] = useState(false);
  const [openDialogInv, setOpenDialogInv] = useState(false);
  const [listPaciente, setListPaciente] = useState([]);
  const [pacienteDatos, setPacienteDatos] = useState(pacienteJson);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [listoptometrista, setlistoptometrista] = useState([]);
  const [listSucursal, setlistSucursal] = useState([]);
  const [listGraduaciones, setListGraduaciones] = useState([]);
  const [listAgudezaVisual, setListAgudezaVisual] = useState([]);
  const [listAdicion, setListAdicion] = useState([]);
  const [formPacientes, setFormPaciente] = useState(pacienteJson);
  const [formExpedientes, setformExpedientes] = useState(expedientes);
  const [formVenta, setformVenta] = useState(detalleVenta);
  const [listInventario, setListInventario] = useState([]);
  const [listInvExistente, setlistInvExistente] = useState([]);
  const [listInvPedido, setlistInvPedido] = useState([]);
  const [listExpedientePaciente, setlistExpedientePaciente] = useState([]);
  const [totalVenta, settotalVenta] = useState(0);
  const [expedienteId, setexpedienteId] = useState('');
  const [subtotalVenta, setsubtotalVenta] = useState(0);
  const [descReb, setDescReb] = useState(0);
  const [totalDescuento, settotalDescuento] = useState(0);
  const [cantPagos, setcantPagos] = useState(0);
  const [montoPagos, setmontoPagos] = useState(0);
  const [acuenta, setacuenta] = useState(0);
  const [rtnenable, setrtnenable] = useState(false);
  const [datosRtn, setDatosRtn] = useState({ rtn: '', nombre: '' });
  const [listRangoFactura, setlistRangoFactura] = useState([]);
  const [numCorrelativoActual, setnumCorrelativoActual] = useState(0);
  const [detallePagos, setdetallePagos] = useState({
    fecha: dayjs().format('YYYY-MM-DD'),
    formaPago: '',
    monto: 0,
    usuarios: localStorage.getItem('usuarioId')
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [invFiltradoExp, setinvFiltradoExp] = useState([])
  const [formValuesInv, setFormValuesInv] = useState(inventarioJson);
  const [disabledGravado, setdisabledGravado] = useState(true);

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
      label: 'Foto Blue'
    },
    {
      value: 6,
      label: 'Foto Rosa'
    },
    {
      value: 7,
      label: 'Blue'
    }
  ];

  const tipoLente = [
    'Monofocal',
    'Cerca',
    'Flap top',
    'Progresivo',
    'Invisible',
    'Kripto',
    'L/C Cosmetico',
    'L/C Blando',
    'L/C Torico',
    'L/C Gas permiable'
  ];

  const tipoPago = [
    'Efectivo',
    'Tarjeta',
  ];

  const lineas = [
    'Marca',
    'Delux',
    'Media',
    'Economica'
  ];

  const importe = [
    'Exento',
    'Gravado'
  ];
  const valorGravado = [
    '15%',
    '18%'
  ];

  useEffect(() => {
    const sucursal = localStorage.getItem('sucursalID');
    opticaControlApi.get('paciente', '').then((response) => {
      setListPaciente(response.data);
    });
    opticaControlApi.get('sucursal', '').then((response) => {
      setlistSucursal(response.data);
    });
    opticaControlApi.get(`optometrista/bySucursal/${sucursal}`, '').then((response) => {
      setlistoptometrista(response.data);
    });
    cleanForm();

    setListGraduaciones(obtenerGraduaciones());
    setListAdicion(obtenerAdicion());
    setListAgudezaVisual(agudezaVisual);

  }, [])

  const handleTabChange = (e) => {
    setActiveIndex(e.index);
    let receta = [...listExpedientePaciente];

    let inventario = [...listInventario];
    let invExp = inventario.filter((i) =>
      (
        i.esfera === ((receta[e.index].recetaOjoDerecho.esfera === null) ? '' : receta[e.index].recetaOjoDerecho.esfera).toString() &&
        i.cilindro === ((receta[e.index].recetaOjoDerecho.cilindro === null) ? '' : receta[e.index].recetaOjoDerecho.cilindro).toString() &&
        i.adicion === ((receta[e.index].recetaOjoDerecho.adicion === null) ? '' : receta[e.index].recetaOjoDerecho.adicion).toString()
      ) ||
      (
        i.esfera === ((receta[e.index].recetaOjoIzquierdo.esfera === null) ? '' : receta[e.index].recetaOjoIzquierdo.esfera).toString() &&
        i.cilindro === ((receta[e.index].recetaOjoIzquierdo.cilindro === null) ? '' : receta[e.index].recetaOjoIzquierdo.cilindro).toString() &&
        i.adicion === ((receta[e.index].recetaOjoIzquierdo.adicion === null) ? '' : receta[e.index].recetaOjoIzquierdo.adicion).toString()
      )
    )
    setinvFiltradoExp(invExp)

  };

  const cleanForm = () => {
    setFormPaciente(pacienteJson);
    setSelectedPaciente(null);
    setformExpedientes(expedientes);
    setlistExpedientePaciente([]);
    setPacienteDatos(pacienteJson);
    setFormValuesInv(inventarioJson);
    setlistInvExistente([]);
    setlistInvPedido([]);
    setformVenta(detalleVenta);
    settotalVenta(0);
    setsubtotalVenta(0);
    settotalDescuento(0);
    setDescReb(0);
    setcantPagos(0);
    setmontoPagos(0);
    setacuenta(0);
    setdetallePagos({
      fecha: dayjs().format('YYYY-MM-DD'),
      formaPago: '',
      monto: 0,
      usuarios: localStorage.getItem('usuarioId')
    });
    setDatosRtn([]);
    setrtnenable(false);
    const sucursal = localStorage.getItem('sucursalID');
    opticaControlApi.get(`inventario/activos/${sucursal}`, '').then((response) => {
      console.log(response.data);
      setListInventario(response.data);
    });

    opticaControlApi.get(`facturas/facturaRecibo/${sucursal}`).then((response) => {
      if (response.data.factura.length < 1) {
        createToast(
          'error',
          'Error',
          'Debe ingresar un rango de facturas activo'
        );
      } else if (response.data.factura.length > 1) {
        createToast(
          'error',
          'Error',
          'Solo puede tener un rango de facturas activo'
        );
      } else if (response.data.factura[0].ultimaUtilizada === response.data.factura[0].hasta) {
        createToast(
          'error',
          'Error',
          'No tiene facturas disponibles'
        );
      }

      setlistRangoFactura(response.data.factura);
      setnumCorrelativoActual(response.data.correlativo[0]);
    });
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

  const handleOpenDialogInv = () => {
    setOpenDialogInv(true);
  };

  const handleCloseDialogPaciente = () => {
    setOpenDialogPaciente(false);
    cleanForm();
  };

  const handleCloseDialogReceta = () => {
    setOpenDialogReceta(false);
  };
  const handleCloseDialogAddExpediente = () => {
    setformExpedientes(expedientes);
    setOpenDialogAddExpediente(false);
  };

  const handleCloseDialogVenta = () => {
    cleanForm();
    setOpenDialogVenta(false);
  };

  const handleCloseDialogInv = () => {
    setOpenDialogInv(false);
  };

  const toast = useRef(null);
  const toastForm = useRef(null);
  const toastFormVenta = useRef(null);

  const rowClassInventario = (data) => {
    return {
      'bg-red-100': data.existencia <= 0
    }
  };

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
      citaProxima: (textValidator(paciente.citaProxima)) ? formatearFecha(paciente.citaProxima) : null,
      fechaRegistro: (textValidator(paciente.fechaRegistro)) ? formatearFecha(paciente.fechaRegistro) : null,
      ultimaCita: (textValidator(paciente.ultimaCita)) ? formatearFecha(paciente.ultimaCita) : null,
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
      if (!enableOp) {
        return;
      }
      handleDisable();
    } else if (event.cellIndex === 2) {
      if (!enableOp) {
        return;
      }
      handleEnable();
    } else if (event.cellIndex === 3) {
      if (listRangoFactura.length < 1) {
        createToast(
          'error',
          'Error',
          'Debe ingresar un rango de facturas activo'
        );
        return
      } else if (listRangoFactura.length > 1) {
        createToast(
          'error',
          'Error',
          'Solo puede tener un rango de facturas activo'
        );
        return
      } else if (listRangoFactura[0].ultimaUtilizada === listRangoFactura[0].hasta) {
        createToast(
          'error',
          'Error',
          'No tiene facturas disponibles'
        );
        return
      }

      handleOpenDialogVenta();
      opticaControlApi.get(`expediente/paciente/${event.rowData._id}`, '')
        .then(async (response) => {
          setActiveIndex(0);
          let receta = response.data[0];
          let inventario = [...listInventario] || [];
          let invExp = inventario.filter((i) =>
            (
              i.esfera === ((receta.recetaOjoDerecho.esfera === null) ? '' : receta.recetaOjoDerecho.esfera).toString() &&
              i.cilindro === ((receta.recetaOjoDerecho.cilindro === null) ? '' : receta.recetaOjoDerecho.cilindro).toString() &&
              i.adicion === ((receta.recetaOjoDerecho.adicion === null) ? '' : receta.recetaOjoDerecho.adicion).toString()
            ) ||
            (
              i.esfera === ((receta.recetaOjoIzquierdo.esfera === null) ? '' : receta.recetaOjoIzquierdo.esfera).toString() &&
              i.cilindro === ((receta.recetaOjoIzquierdo.cilindro === null) ? '' : receta.recetaOjoIzquierdo.cilindro).toString() &&
              i.adicion === ((receta.recetaOjoIzquierdo.adicion === null) ? '' : receta.recetaOjoIzquierdo.adicion).toString()
            )
          )
          setinvFiltradoExp(invExp);
          setlistExpedientePaciente(await response.data);
        });
    } else if (event.cellIndex === 4) {
      opticaControlApi.get(`expediente/paciente/${event.rowData._id}`, '')
        .then(async (response) => {
          console.log(response.data);

          setlistExpedientePaciente(await response.data);
        });

      handleReceta();

    } else if (event.cellIndex === 5) {
      handleOpenDialogAddExpediente();
    }
  };

  const onCellSelectedInventario = (event) => {
    const precioVenta = event.rowData.precioVenta;
    if (event.cellIndex === 0) {
      const existeInv = listInvExistente.filter(
        (item) => item.inventario === event.rowData._id
      );
      const existePedido = listInvPedido.filter(
        (item) => item.inventario === event.rowData._id
      );

      if (existeInv.length > 0 || existePedido.length > 0) {
        if (existeInv.length > 0 && existeInv[0].cantidad <= event.rowData.existencia) {
          setlistInvExistente(
            listInvExistente.map((i) =>
              i.inventario === event.rowData._id ? { ...i, cantidad: i.cantidad + 1 } : i
            )
          );
          sumarTotales(precioVenta);
          setListInventario(
            listInventario.map((i) =>
              i._id === event.rowData._id ? { ...i, existencia: i.existencia - 1 } : i
            )
          );
        } else {
          if (existePedido.length === 0) {
            setlistInvPedido([
              ...listInvPedido,
              {
                descripcion: event.rowData.descripcion,
                esfera: event.rowData.esfera,
                cilindro: event.rowData.cilindro,
                adicion: event.rowData.adicion,
                linea: event.rowData.linea,
                inventario: event.rowData._id,
                cantidad: 1,
                importe: event.rowData.importe,
                valorGravado: event.rowData.valorGravado,
                existencia: event.rowData.existencia,
                precioVenta: event.rowData.precioVenta,
                // descuento: 0,
                moda: event.rowData.moda
              }
            ]);
            sumarTotales(precioVenta);
          } else {
            setlistInvPedido(
              listInvPedido.map((i) =>
                i.inventario === event.rowData._id ? { ...i, cantidad: i.cantidad + 1 } : i
              )
            );
            sumarTotales(precioVenta);
          }
        }
      } else {

        if (event.rowData.existencia === 0) {
          setlistInvPedido([
            ...listInvPedido,
            {
              descripcion: event.rowData.descripcion,
              esfera: event.rowData.esfera,
              cilindro: event.rowData.cilindro,
              adicion: event.rowData.adicion,
              linea: event.rowData.linea,
              inventario: event.rowData._id,
              cantidad: 1,
              importe: event.rowData.importe,
              valorGravado: event.rowData.valorGravado,
              existencia: event.rowData.existencia,
              precioVenta: event.rowData.precioVenta,
              // descuento: 0,
              moda: event.rowData.moda
            }
          ]);
        } else {
          setListInventario(
            listInventario.map((i) =>
              i._id === event.rowData._id ? { ...i, existencia: i.existencia - 1 } : i
            )
          );
          setlistInvExistente([
            ...listInvExistente,
            {
              descripcion: event.rowData.descripcion,
              esfera: event.rowData.esfera,
              cilindro: event.rowData.cilindro,
              adicion: event.rowData.adicion,
              linea: event.rowData.linea,
              inventario: event.rowData._id,
              cantidad: 1,
              importe: event.rowData.importe,
              valorGravado: event.rowData.valorGravado,
              existencia: event.rowData.existencia,
              precioVenta: event.rowData.precioVenta,
              // descuento: 0,
              moda: event.rowData.moda
            }
          ]);
        }
        sumarTotales(precioVenta);
      }
    }
  };

  const sumarTotales = (precioVenta) => {
    setDescReb(0);
    settotalDescuento(0);
    setsubtotalVenta((prev) => prev + precioVenta);
    settotalVenta(subtotalVenta + precioVenta);
    setcantPagos(0);
    setmontoPagos(0);
    setacuenta(0);
    setdetallePagos({
      fecha: dayjs().format('YYYY-MM-DD'),
      formaPago: '',
      monto: 0,
      usuarios: localStorage.getItem('usuarioId')
    });
  }

  const restarTotales = (precioVenta) => {
    setDescReb(0);
    settotalDescuento(0);
    setsubtotalVenta((prev) => prev - precioVenta);
    settotalVenta(subtotalVenta - precioVenta);
    setcantPagos(0);
    setmontoPagos(0);
    setacuenta(0);
    setdetallePagos({
      fecha: dayjs().format('YYYY-MM-DD'),
      formaPago: '',
      monto: 0,
      usuarios: localStorage.getItem('usuarioId')
    });
  }

  const calcularTotal = (inv) => {
    let total = 0;
    // let descuento = 0;
    inv.forEach((item) => {
      //descuento += item.descuento;
      total += item.precioVenta * item.cantidad;
    });
    // settotalDescuento(descuento);
    setsubtotalVenta(total);
    // settotalVenta(total - descuento);
    settotalVenta(total);
    setcantPagos(0);
    setmontoPagos(0);
    setacuenta(0);
    setdetallePagos({
      fecha: dayjs().format('YYYY-MM-DD'),
      formaPago: '',
      monto: 0,
      usuarios: localStorage.getItem('usuarioId')
    });
  };

  const recalcularTotal = () => {
    let _inventario = [...listInvExistente];
    let _invPedido = [...listInvPedido];
    let total = 0;
    // let descuento = 0;
    _inventario.forEach((item) => {
      //descuento += item.descuento;
      total += item.precioVenta * item.cantidad;
    });
    _invPedido.forEach((item) => {
      // descuento += item.descuento;
      total += item.precioVenta * item.cantidad;
    });
    // settotalDescuento(descuento);
    setsubtotalVenta(total);
    settotalDescuento(0);
    // settotalVenta(total - descuento);
    settotalVenta(total);
    setcantPagos(0);
    setmontoPagos(0);
    setacuenta(0);
    setdetallePagos({
      fecha: dayjs().format('YYYY-MM-DD'),
      formaPago: '',
      monto: 0,
      usuarios: localStorage.getItem('usuarioId')
    });
  };

  const onCellInvSeleccionado = (event) => {
    let precioVenta = event.rowData.precioVenta;
    if (event.cellIndex === 0) {
      const seleccionado = listInvExistente.filter(
        (item) => item.inventario === event.rowData.inventario
      );
      if (seleccionado[0].cantidad === 1) {
        const inventarioFiltrado = listInvExistente.filter((inv) => (inv.inventario !== event.rowData.inventario));
        setlistInvExistente([...inventarioFiltrado]);
        restarTotales(precioVenta);
        setListInventario(
          listInventario.map((i) =>
            i._id === event.rowData.inventario ? { ...i, existencia: i.existencia + 1 } : i
          )
        );
      }

      if (seleccionado[0].cantidad > 1) {
        // let descuento = 0;
        setlistInvExistente(
          listInvExistente.map((i) =>
            i.inventario === event.rowData.inventario ? { ...i, cantidad: i.cantidad - 1 } : i
          )
        );
        restarTotales(precioVenta);
        setListInventario(
          listInventario.map((i) =>
            i._id === event.rowData.inventario ? { ...i, existencia: i.existencia + 1 } : i
          )
        );
      }
    }
  };

  const onCellInvPedido = (event) => {
    let precioVenta = event.rowData.precioVenta;
    if (event.cellIndex === 0) {
      const seleccionado = listInvPedido.filter(
        (item) => item.inventario === event.rowData.inventario
      );
      if (seleccionado[0].cantidad === 1) {
        const inventarioFiltrado = listInvPedido.filter((inv) => (inv.inventario !== event.rowData.inventario));
        setlistInvPedido([...inventarioFiltrado]);
        restarTotales(precioVenta);
      }

      if (seleccionado[0].cantidad > 1) {
        // let descuento = 0;
        setlistInvPedido(
          listInvPedido.map((i) =>
            i.inventario === event.rowData.inventario ? { ...i, cantidad: i.cantidad - 1 } : i
          )
        );
        restarTotales(precioVenta);
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

  const handleDisable = () => {
    confirmDialog({
      message: `¿Desea deshabilitar el registro? `,
      header: 'Deshabilitar',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: acceptDialogDisable,
      reject: rejectDialogDisable
    });
  };

  const acceptDialogDisable = () => {
    if (textValidator(pacienteSeleccionado)) {
      opticaControlApi.put(`paciente/cambiarEstado/${pacienteSeleccionado}`, { estado: false })
        .then((response) => {
          if (response.status === 200) {
            createToast(
              'success',
              'Confirmado',
              'El registro a sido deshabilitado'
            );
            setListPaciente(
              listPaciente.map(i =>
                i._id === pacienteSeleccionado ? {
                  ...i,
                  estado: response.data.estado
                } : i
              )
            );
            cleanForm();
          }
        })
        .catch((err) => {
          createToast(
            'error',
            'Error',
            'Ha ocurrido un error'
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

  const rejectDialogDisable = () => {
    createToast(
      'warn',
      'Cancelado',
      'Acción cancelada'
    );
  }

  const handleEnable = () => {
    confirmDialog({
      message: `¿Desea eliminar el registro? `,
      header: 'Eliminar',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: acceptDialogEnable,
      reject: rejectDialogEnable
    });
  };

  const acceptDialogEnable = () => {
    if (textValidator(pacienteSeleccionado)) {
      opticaControlApi.put(`paciente/cambiarEstado/${pacienteSeleccionado}`, { estado: true })
        .then((response) => {
          if (response.status === 200) {
            createToast(
              'success',
              'Confirmado',
              'El registro a sido habilitado'
            );
            setListPaciente(
              listPaciente.map(i =>
                i._id === pacienteSeleccionado ? {
                  ...i,
                  estado: response.data.estado
                } : i
              )
            );
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
            'Ha ocurrido un error al intentar habilitar el registro'
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

  const rejectDialogEnable = () => {
    createToast(
      'warn',
      'Cancelado',
      'Acción cancelada'
    );
  }

  const renderEditButton = (data) => {
    if (data.estado === true) {
      return <EditIcon color='primary' fontSize='medium' />
    }
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

  const renderDisable = (data) => {
    if (enableOp) {
      if (data.estado === true) {
        return <CancelIcon color='error' fontSize='medium' />
      }
    } else {
      return <CancelIcon color='disabled' fontSize='medium' />
    }

  };

  const renderChangeStatus = (data) => {
    if (enableOp) {
      if (data.estado === false) {
        return <DoneIcon color='success' fontSize='medium' />
      }
    } else {
      return <DoneIcon color='disabled' fontSize='medium' />
    }
  };

  const renderRecetaButton = (data) => {
    if (data.estado === true) {
      return <ContactPageIcon color='success' fontSize='medium' />
    }
  };

  const renderAgregarRecetaButton = (data) => {
    if (data.estado === true) {
      return <Chip icon={<AddIcon />} color='secondary' label="Expediente" />
    }
  };
  const renderVentaButton = (data) => {
    if (data.estado === true) {
      return <AddShoppingCartIcon color='primary' fontSize='medium' />
    }
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
    esfera: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    cilindro: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    adicion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    categoria: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    moda: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    proveedor: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    linea: { value: '', matchMode: FilterMatchMode.STARTS_WITH }
  });

  const onRowEditComplete = (e) => {
    let _inventario = [...listInvExistente];
    let { newData, index } = e;

    _inventario[index] = newData;

    setlistInvExistente(_inventario);
    calcularTotal(_inventario);
  };

  const defaultProps = {
    options: listGraduaciones,
    getOptionLabel: (option) => option,
  };

  const defaultPropsAdicion = {
    options: listAdicion,
    getOptionLabel: (option) => option,
  };

  const textEditor = (options) => {
    return <InputNumber type="text" value={options.value} onValueChange={(e) => options.editorCallback(e.value)} />;
  };

  const allowEdit = (rowData) => {
    return true;
  };

  const generarFactura = (op) => {

    if (!textValidator(formVenta.tipoVenta)) {
      createToastFormVenta(
        'warn',
        'Acction requerida',
        'No selecciono ningun tipo de venta'
      );
      return;
    }

    if (listInvExistente.length <= 0 && listInvPedido.length <= 0) {
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

    if (cantPagos <= 0) {
      createToastFormVenta(
        'warn',
        'Acction requerida',
        'Digite la cantidad de pagos'
      );
      return;
    }

    if (!textValidator(detallePagos.formaPago)) {
      createToastFormVenta(
        'warn',
        'Acction requerida',
        'Seleccione forma de pago'
      );
      return;
    }
    let numFacRec = '';
    if (op === 'factura' && parseFloat(acuenta) === parseFloat(totalVenta)) {
      if (listRangoFactura[0].ultimaUtilizada === '') {
        numFacRec = listRangoFactura[0].desde;
      } else {
        numFacRec = nuevaFactura(listRangoFactura[0].ultimaUtilizada);
      }
    } else {
      numFacRec = parseInt(numCorrelativoActual.numCorrelativo) + 1;
    }

    const facturaDatos = {
      cliente: pacienteDatos.nombre,
      sucursales: localStorage.getItem('sucursalID'),
      rtn: datosRtn.rtn,
      nombreRtn: datosRtn.nombre,
      numFacRec: numFacRec,
      vendedor: localStorage.getItem('nombre'),
      inventario: [...listInvExistente, ...listInvPedido],
      formaPago: detallePagos.formaPago,
      monto: parseFloat(detallePagos.monto, 2),
      fecha: detallePagos.fecha,
      total: parseFloat(totalVenta, 2),
      totalDescuento: parseFloat(totalDescuento, 2),
      acuenta: parseFloat(acuenta, 2),
      montoPagos: parseFloat(montoPagos, 2),
    }

    let detalleInv = [];
    let proteccionList = (textValidator(formVenta.proteccion)) ? formVenta.proteccion.map(p => p.label) : '';
    listInvExistente.forEach(inv => {
      detalleInv.push({
        inventario: inv.inventario,
        cantidad: inv.cantidad,
        // descuento: inv.descuento,
      })
    })
    if (listInvPedido.length > 0) {
      listInvPedido.forEach(p => {
        detalleInv.push({
          inventario: p.inventario,
          cantidad: -p.cantidad,
          // descuento: inv.descuento,
        })
      })
    }

    if (rtnenable && (!textValidator(datosRtn.nombre) || !textValidator(datosRtn.rtn))) {
      createToastFormVenta(
        'warn',
        'Acction requerida',
        'Por favor ingrese los datos para el RTN'
      );
      return;
    }

    let datosSave = {
      tipoVenta: formVenta.tipoVenta,
      tipoLente: formVenta.tipoLente,
      proteccion: proteccionList,
      material: formVenta.material, //Falta
      moda: formVenta.moda, // Falta
      paciente: selectedPaciente,
      rtn: datosRtn.rtn,
      nombreRtn: datosRtn.nombre,
      sucursales: localStorage.getItem('sucursalID'),
      detalleInventario: detalleInv, // Falta
      fecha: formVenta.fecha,
      entregaProgramada: formVenta.entregaProgramada,
      detallePagos: detallePagos,
      descuentoTotal: totalDescuento,
      cantPagos: cantPagos,
      montoPagos: montoPagos,
      total: totalVenta,
      acuenta: acuenta,
      numFacRec: numFacRec
    };

    console.log(datosSave);

    // opticaControlApi.post('detalleVentas', datosSave)
    //   .then((response) => {
    //     if (response.status === 201) {
    //       opticaControlApi.put('inventario/actualizarInventario', { detalleInventario: listInvExistente })
    //         .then((response) => {
    //           if (response.status === 202) {
    //             if (op === 'factura' && parseFloat(acuenta) === parseFloat(totalVenta)) {
    //               opticaControlApi.put(`facturas/${listRangoFactura[0]._id}`, { ultimaUtilizada: numFacRec }).then(() => {
    //                 console.log(facturaDatos);
    //                 opticaControlApi.post(`thermalPrinter/imprimirFactura`, facturaDatos)
    //                   .then(() => {
    //                     createToast(
    //                       'success',
    //                       'Confirmado',
    //                       'La factura a sido generada'
    //                     );
    //                   })
    //                   .catch((error) => {
    //                     createToast(
    //                       'error',
    //                       'Error',
    //                       'Hubo un error al generar la factura, favor revise la impresora'
    //                     );
    //                   });
    //               });
    //             } else {
    //               opticaControlApi.put(`correlativo/${numCorrelativoActual._id}`, { numCorrelativo: numFacRec }).then(() => {
    //                 opticaControlApi.post(`thermalPrinter/imprimirRecibo`, facturaDatos)
    //                   .then(() => {
    //                     createToast(
    //                       'success',
    //                       'Confirmado',
    //                       'El recibo a sido generado'
    //                     );
    //                   })
    //                   .catch((error) => {
    //                     createToast(
    //                       'error',
    //                       'Error',
    //                       'Hubo un error al generar el recibo, favor revise la impresora'
    //                     );
    //                   });
    //               });
    //             }
    //             createToast(
    //               'success',
    //               'Confirmado',
    //               'El inventario ha sido actualizado'
    //             );
    //           }
    //         });

    //       cleanForm();
    //       handleCloseDialogVenta();
    //     } else {
    //       createToast(
    //         'error',
    //         'Error',
    //         response.statusText,
    //       );
    //       console.log(response.data);
    //       cleanForm();
    //       handleCloseDialogVenta();
    //       return;
    //     }
    //   })
    //   .catch((err) => {
    //     createToast(
    //       'error',
    //       'Error',
    //       'Ha ocurrido un error'
    //     );
    //     handleCloseDialogVenta();
    //   })
  };

  const rowClass = (data) => {
    return {
      'bg-red-100': data.estado === false,
    }
  };

  const handleChangeText = ({ target }, select) => {
    setFormValuesInv({
      ...formValuesInv,
      [select]: target.value
    })

    if (target.value === 'Exento') {
      setFormValuesInv({
        ...formValuesInv,
        valorGravado: '',
        [select]: target.value
      })
    }
  };


  return (
    <>
      <h1>Información sobre Pacientes </h1>
      <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenDialogPost}>Agregar Paciente</Button>
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
          rows={10}
          rowClassName={rowClass}
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
          <Column body={renderDisable}></Column>
          <Column body={renderChangeStatus}></Column>
          <Column body={renderVentaButton}></Column>
          <Column body={renderRecetaButton}></Column>
          <Column body={renderAgregarRecetaButton}></Column>
          <Column field="nombre" header="Nombre" sortable filter></Column>
          <Column field="edad" header="Edad" sortable bodyStyle={{ textAlign: 'center' }}></Column>
          <Column field="genero" header="Genero" filter bodyStyle={{ textAlign: 'center', minWidth: '12rem' }}></Column>
          <Column field="telefono" header="Telefono" filter bodyStyle={{ textAlign: 'center', minWidth: '12rem' }}></Column>
          <Column field="direccion" header="Direccion" filter></Column>
          <Column field="sucursales.nombre" header="Sucursal" filter></Column>
          <Column field="fechaRegistro" header="Registro" body={(data) => (textValidator(data.fechaRegistro)) ? formatearFecha(data.fechaRegistro) : '-'}></Column>
          <Column field="ultimaCita" header="Ultima cita" body={(data) => (textValidator(data.ultimaCita)) ? formatearFecha(data.ultimaCita) : '-'}></Column>
          <Column field="citaProxima" header="Cita Proxima" body={(data) => (textValidator(data.citaProxima)) ? formatearFecha(data.citaProxima) : '-'}></Column>
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
              opticaControlApi.put(`paciente/${selectedPaciente}`, formPacientes)
                .then((response) => {
                  if (response.status === 202) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue editado correctamente'
                    );
                    const pacientesFiltrados = listPaciente.filter((paciente) => (paciente._id !== selectedPaciente));
                    setListPaciente([response.data, ...pacientesFiltrados]);
                    handleCloseDialogPaciente();
                    cleanForm();
                  } else {
                    createToast(
                      'error',
                      'Error',
                      response.statusText,
                    );
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
                  handleCloseDialogPaciente();
                  cleanForm();
                });
            } else {
              opticaControlApi.post('paciente', formPacientes)
                .then((response) => {
                  if (response.status === 201) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue creado correctamente'
                    );
                    setListPaciente([response.data, ...listPaciente,]);
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
                    'Ha ocurrido un error'
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
            <TextField
              value={formPacientes.direccion}
              onChange={(event) => handleChangeTextPaciente(event, 'direccion')}
              margin="dense"
              id="direccion"
              name="direccion"
              label="Direccion"
              type="text"
              multiline
              maxRows={2}
              variant="standard"
              size="small"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <div style={{ width: '100%' }}>
              <p style={{ color: '#696969' }}>Registro *</p>
              <TextField
                required
                value={formPacientes.fechaRegistro}
                onChange={(event) => {
                  if (!validarFechaProxima(event.target.value)) {
                    createToastForm(
                      'warn',
                      'Acción requerida',
                      'La fecha de registro debe ser menor'
                    );
                    setFormPaciente({
                      ...formPacientes,
                      fechaRegistro: dayjs().format('YYYY-MM-DD')
                    })
                    return;
                  } else {
                    setFormPaciente({
                      ...formPacientes,
                      fechaRegistro: event.target.value
                    })
                  }
                }}
                margin='dense'
                id='registro'
                name='registro'
                type='date'
                format='yyyy-MM-dd'
                variant='standard'
                size='medium'
              />
            </div>
            <div style={{ width: '100%' }}>
              <p style={{ color: '#696969' }}>Utima cita *</p>
              <TextField
                required
                value={formPacientes.ultimaCita}
                onChange={(event) => {
                  setFormPaciente({
                    ...formPacientes,
                    ultimaCita: event.target.value
                  })
                }}
                margin='dense'
                id='ultimaCita'
                name='ultimaCita'
                type='date'
                format='yyyy-MM-dd'
                variant='standard'
                size='medium'
              />
            </div>
            <div style={{ width: '100%' }}>
              <p style={{ color: '#696969' }}>Proxima cita *</p>
              <TextField
                required
                value={formPacientes.citaProxima}
                onChange={(event) => {
                  if (validarFechaProxima(event.target.value)) {
                    createToastForm(
                      'warn',
                      'Acción requerida',
                      'La fecha para proxima cita debe ser mayor'
                    );
                    setFormPaciente({
                      ...formPacientes,
                      citaProxima: dayjs().format('YYYY-MM-DD')
                    })
                    return;
                  } else {
                    setFormPaciente({
                      ...formPacientes,
                      citaProxima: event.target.value
                    })
                  }
                }}
                margin='dense'
                id='citaProxima'
                name='citaProxima'
                type='date'
                format='yyyy-MM-dd'
                variant='standard'
                size='medium'
              />
            </div>
          </div>
          <br />
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogPaciente} >Cancelar</Button>
          <Button variant='contained' type="submit">Guardar</Button>
        </DialogActions>
      </Dialog >
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

            let proteccionList = (textValidator(formExpedientes.proteccion)) ? formExpedientes.proteccion.map(p => p.label) : '';

            const datosExpedientes = {
              paciente: formExpedientes.paciente,
              optometrista: formExpedientes.optometrista,
              proteccion: proteccionList,
              tipoLente: formExpedientes.tipoLente,
              antecedentes: formExpedientes.antecedentes,
              enfermedadBase: formExpedientes.enfermedadBase,
              observaciones: formExpedientes.observaciones,
              pruebasValoraciones: formExpedientes.pruebasValoraciones,
              usuarios: localStorage.getItem('usuarioId'),
              recetaOjoDerecho: formExpedientes.recetaOjoDerecho,
              recetaOjoIzquierdo: formExpedientes.recetaOjoIzquierdo
            }
            console.log(datosExpedientes);

            if (textValidator(expedienteId)) {
              opticaControlApi.put(`expediente/${expedienteId}`, datosExpedientes)
                .then((response) => {
                  if (response.status === 202) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue editado correctamente'
                    );
                    handleCloseDialogAddExpediente();
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
                  handleCloseDialogAddExpediente();
                  cleanForm();
                });
            } else {
              if (!textValidator(formExpedientes.paciente)) {
                createToast(
                  'error',
                  'Error',
                  'No se selecciono paciente correctamente'
                );
                return;
              }
              opticaControlApi.post('expediente', datosExpedientes)
                .then((response) => {
                  if (response.status === 201) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue creado correctamente'
                    );
                    handleCloseDialogAddExpediente();
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
                  handleCloseDialogAddExpediente();
                  cleanForm();
                });
            }
          },
        }
        }
      >
        <DialogTitle>Datos sobre el expediente de {pacienteDatos.nombre}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor rellene los campos
          </DialogContentText>
          <div className='grid3Column'>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="optometrista">Optometrista</InputLabel>
              <Select
                required={true}
                labelId="optometrista"
                id="optometrista"
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
            <div>
              <p>Protección</p>
              <SelectReact
                options={proteccion}
                value={formExpedientes.proteccion}
                name='Proteccion'
                multi={true}
                labelField="label"
                valueField="value"
                onChange={(e) => {
                  setformExpedientes({
                    ...formExpedientes,
                    proteccion: e
                  });
                  // setvalue(e)
                }
                }
              />
            </div>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="tipoLente">Tipo de Lente</InputLabel>
              <Select
                labelId="tipoLente"
                id="tipoLente"
                value={formExpedientes.tipoLente}
                onChange={(event) => handleChangeTextExpediente(event, 'tipoLente')}
                label="Tipo Lente"
              >
                {tipoLente.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
                )}
              </Select>
            </FormControl>
          </div>
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
            <Autocomplete
              {...defaultProps}
              options={listGraduaciones}
              value={formExpedientes.recetaOjoDerecho.esfera}
              onChange={(event, newValue) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoDerecho: {
                    ...formExpedientes.recetaOjoDerecho,
                    esfera: newValue
                  }
                })
              }}
              renderInput={(params) => <TextField {...params} label="Esfera" variant="standard" />}
            />
            <Autocomplete
              {...defaultProps}
              options={listGraduaciones}
              value={formExpedientes.recetaOjoDerecho.cilindro}
              onChange={(event, newValue) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoDerecho: {
                    ...formExpedientes.recetaOjoDerecho,
                    cilindro: newValue
                  }
                });
              }}
              renderInput={(params) => <TextField {...params} label="Cilindro" variant="standard" />}
            />
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
            <Autocomplete
              {...defaultPropsAdicion}
              options={listAdicion}
              value={formExpedientes.recetaOjoDerecho.adicion}
              onChange={(event, newValue) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoDerecho: {
                    ...formExpedientes.recetaOjoDerecho,
                    adicion: newValue
                  }
                })
              }}
              renderInput={(params) => <TextField {...params} label="Adición" variant="standard" />}
            />
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
            <Autocomplete
              {...defaultProps}
              options={listGraduaciones}
              value={formExpedientes.recetaOjoIzquierdo.esfera}
              onChange={(event, newValue) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoIzquierdo: {
                    ...formExpedientes.recetaOjoIzquierdo,
                    esfera: newValue
                  }
                });
              }}
              renderInput={(params) => <TextField {...params} label="Esfera" variant="standard" />}
            />
            <Autocomplete
              {...defaultProps}
              options={listGraduaciones}
              value={formExpedientes.recetaOjoIzquierdo.cilindro}
              onChange={(event, newValue) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoIzquierdo: {
                    ...formExpedientes.recetaOjoIzquierdo,
                    cilindro: newValue
                  }
                });
              }}
              renderInput={(params) => <TextField {...params} label="Cilindro" value={formExpedientes.recetaOjoIzquierdo.cilindro} variant="standard" />}
            />
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
            <Autocomplete
              {...defaultPropsAdicion}
              options={listAdicion}
              value={formExpedientes.recetaOjoIzquierdo.adicion}
              onChange={(event, newValue) => {
                setformExpedientes({
                  ...formExpedientes,
                  recetaOjoIzquierdo: {
                    ...formExpedientes.recetaOjoIzquierdo,
                    adicion: newValue
                  }
                })
              }}
              renderInput={(params) => <TextField {...params} label="Adición" variant="standard" />}
            />
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
            {
              listExpedientePaciente &&
              <TabView scrollable>
                {listExpedientePaciente.map(ex => {
                  return (
                    <TabPanel key={ex._id} header={formatearFecha(ex.fecha)}>
                      {enableOp &&
                        <Button variant='contained'
                          id={ex._id}
                          onClick={(e) => {
                            setexpedienteId(e.target.id);
                            const expediente = {
                              paciente: ex.paciente._id,
                              optometrista: ex.optometrista._id,
                              fecha: ex.fecha,
                              tipoLente: ex.tipoLente,
                              proteccion: [...ex.proteccion],
                              antecedentes: ex.antecedentes,
                              enfermedadBase: ex.enfermedadBase,
                              observaciones: ex.observaciones,
                              pruebasValoraciones: ex.pruebasValoraciones,
                              usuarios: ex.usuarios,
                              recetaOjoDerecho: ex.recetaOjoDerecho,
                              recetaOjoIzquierdo: ex.recetaOjoIzquierdo
                            };
                            setformExpedientes(expediente);

                            handleCloseDialogReceta();
                            setOpenDialogAddExpediente(true);
                          }}
                        >Editar expediente</Button>
                      }

                      <div className='grid3Column'>
                        <p className='parrafoReceta'>
                          <span className='campo'>Optometrista: </span>
                          <span className='valor'>{ex.optometrista.nombre}</span>
                        </p>
                        <p className='parrafoReceta' style={{ margin: '0px 0px 0px 9px' }}>
                          <span className='campo'>Tipo de Lente: </span>
                          <span className='valor'>{ex.tipoLente}</span>
                        </p>
                        <p className='parrafoReceta' style={{ margin: '0px 0px 0px 0px' }}><span className='campo'>Protección: </span>
                          {
                            ex.proteccion &&
                            ex.proteccion.map(p => {
                              return <Chip label={p} key={p} sx={{ margin: '3px' }} size="small" color="primary" />
                            })
                          }
                        </p>
                      </div>
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
                      <p className='parrafoReceta'>
                        <span className='campo'>Ingresado por: </span>
                        <span className='valor'>{ex.usuarios.nombre}</span>
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
            }

            {
              listExpedientePaciente.length === 0 &&
              <h2 style={{ color: '#cc0404' }}>No hay expedientes disponibles para este paciente</h2>
            }
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
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '50px'
          }}>
            <div>
              <h3>Información sobre el expediente</h3>
              {
                listExpedientePaciente &&
                <TabView
                  scrollable
                  activeIndex={activeIndex}
                  onTabChange={handleTabChange}
                  onBeforeTabChange={handleTabChange}
                >
                  {listExpedientePaciente.map(ex => {
                    return (
                      <TabPanel key={ex._id} header={formatearFecha(ex.fecha)}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '10px'
                        }}>
                          <div >
                            <p className='subtitulo'>Ojo Derecho</p>
                            <p className='campo'>Esfera: <span className='valor'>{ex.recetaOjoDerecho.esfera}</span></p>
                            <p className='campo'>Cilindro: <span className='valor'>{ex.recetaOjoDerecho.cilindro}</span></p>
                            <p className='campo'>Adición: <span className='valor'>{ex.recetaOjoDerecho.adicion}</span></p>
                          </div>
                          <div >
                            <p className='subtitulo'>Ojo Izquierdo</p>
                            <p className='campo'>Esfera: <span className='valor'>{ex.recetaOjoIzquierdo.esfera}</span></p>
                            <p className='campo'>Cilindro: <span className='valor'>{ex.recetaOjoIzquierdo.cilindro}</span></p>
                            <p className='campo'>Adición: <span className='valor'>{ex.recetaOjoIzquierdo.adicion}</span></p>
                          </div>
                        </div>

                      </TabPanel>
                    )
                  })
                  }
                </TabView>
              }

              {
                listExpedientePaciente.length === 0 &&
                <h3 style={{ color: '#cc0404' }}>No hay expedientes disponibles para este paciente</h3>
              }
            </div>
            <div>
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
                <div>
                  <p style={{ color: '#696969' }}>Entrega programada *</p>
                  <TextField
                    required
                    value={formVenta.entregaProgramada}
                    onChange={(event) => {
                      if (validarFechaProxima(event.target.value)) {
                        createToastFormVenta(
                          'warn',
                          'Acción requerida',
                          'La fecha debe ser mayor'
                        );
                        setformVenta({
                          ...formVenta,
                          entregaProgramada: dayjs().format('YYYY-MM-DD')
                        })
                        return;
                      } else {
                        setformVenta({
                          ...formVenta,
                          entregaProgramada: event.target.value
                        })
                      }
                    }}
                    margin='dense'
                    id='entregaProgramada'
                    name='entregaProgramada'
                    type='date'
                    format='yyyy-MM-dd'
                    variant='standard'
                    size='medium'
                  />
                </div>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="tipoLente">Tipo de Lente</InputLabel>
                  <Select
                    labelId="tipoLente"
                    id="tipoLente"
                    value={formVenta.tipoLente}
                    onChange={(event) => handleChangeTextVenta(event, 'tipoLente')}
                    label="Tipo Lente"
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
                    label="Moda"
                    type="text"
                    sx={{ m: 1 }}
                    variant="standard"
                    size="small"
                  />
                }
              </div>
            </div>
          </div>

          <p className='titulo'>Seleccione el inventario</p>
          {
            invFiltradoExp.length <= 0 &&
            <Button variant='contained' onClick={handleOpenDialogInv}>Ingresar pedido</Button>
          }
          <DataTable value={invFiltradoExp}
            showGridlines
            stripedRows
            size='small'
            sortMode="multiple"
            paginator
            rows={5}
            filters={filtersInventario}
            filterDisplay='row'
            selectionMode="single"
            rowClassName={rowClassInventario}
            cellSelection
            onCellSelect={onCellSelectedInventario}
            scrollable
            columnResizeMode="expand"
            resizableColumns
          >
            <Column body={renderAddButton}></Column>
            <Column field="descripcion" header="Descripcion" sortable filter style={{ minWidth: '12rem' }}></Column>
            <Column field="esfera" header="Esfera" filter style={{ minWidth: '15rem' }}></Column>
            <Column field="cilindro" header="Cilindro" filter style={{ minWidth: '10rem' }}></Column>
            <Column field="adicion" header="Adición" filter style={{ minWidth: '10rem' }}></Column>
            <Column field="linea" header="Linea" filter style={{ minWidth: '10em' }}></Column>
            <Column field="importe" header="Importe"></Column>
            <Column field="valorGravado" header="Gravado"></Column>
            <Column field="existencia" header="Existencia" sortable ></Column>
            <Column field="precioVenta" header="Precio Venta" sortable body={(data) => precioBodyTemplate(data.precioVenta)}></Column>
            <Column field="moda" header="Moda" filter></Column>
            <Column field="color" header="Color"></Column>
            <Column field="diseno" header="Diseño"></Column>
            <Column field="proveedor" header="Proveedor" filter></Column>
          </DataTable>
          <br />
          {
            listInvExistente.length > 0 &&
            <>
              <p className='titulo'>Inventario existente</p>
              <DataTable value={listInvExistente}
                showGridlines
                stripedRows
                size='small'
                sortMode="multiple"
                paginator
                rows={5}
                selectionMode="single"
                cellSelection
                onCellSelect={onCellInvSeleccionado}
                scrollablev
                columnResizeMode="expand"
                resizableColumns
              // editMode="row"
              // onRowEditComplete={onRowEditComplete}
              >
                <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
                <Column field="descripcion" header="Descripcion" ></Column>
                <Column field="esfera" header="Esfera"></Column>
                <Column field="cilindro" header="Cilindro"></Column>
                <Column field="adicion" header="Adición"></Column>
                <Column field="linea" header="Linea"></Column>
                <Column field="importe" header="Importe"></Column>
                <Column field="valorGravado" header="Gravado"></Column>
                <Column field="cantidad" header="Cantidad"></Column>
                <Column field="precioVenta" header="Precio Venta" body={(data) => precioBodyTemplate(data.precioVenta)}></Column>
                {/* <Column field="descuento" header="Descuento" editor={(options) => textEditor(options)}></Column> */}
                {/* <Column rowEditor={allowEdit} headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column> */}
              </DataTable>
            </>
          }
          <br />
          {listInvPedido.length > 0 &&
            <>
              <p className='titulo'>Lista para pedido</p>
              <DataTable
                value={listInvPedido}
                showGridlines
                stripedRows
                size='small'
                sortMode="multiple"
                paginator
                rows={5}
                selectionMode="single"
                cellSelection
                onCellSelect={onCellInvPedido}
                scrollablev
                columnResizeMode="expand"
                resizableColumns
              >
                <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
                <Column field="descripcion" header="Descripcion" ></Column>
                <Column field="esfera" header="Esfera"></Column>
                <Column field="cilindro" header="Cilindro"></Column>
                <Column field="adicion" header="Adición"></Column>
                <Column field="linea" header="Linea"></Column>
                <Column field="cantidad" header="Cantidad"></Column>
                <Column field="precioVenta" header="Precio Venta" body={(data) => precioBodyTemplate(data.precioVenta)}></Column>
              </DataTable>
            </>
          }
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
                <div>
                  <TextField
                    id="decuentosRebajas"
                    label="Decuentos y Rebajas"
                    type="number"
                    variant="standard"
                    sx={{ m: 1 }}
                    value={descReb}
                    onBlur={(e) => {
                      if (parseFloat(e.target.value) === 0 || e.target.value === '') {
                        setDescReb(0);
                        recalcularTotal();
                      } else {
                        settotalDescuento(subtotalVenta - parseFloat(e.target.value, 2));
                        settotalVenta(parseFloat(e.target.value, 2).toFixed(2));
                        setDescReb(parseFloat(e.target.value, 2));
                      }
                    }}
                    onChange={(event) => {
                      if (parseFloat(event.target.value) < 0) {
                        createToastFormVenta(
                          'error',
                          'Error',
                          'La cantidad de pagos no puede ser negativa'
                        );
                        return;
                      } else if (event.target.value > totalVenta) {
                        createToastFormVenta(
                          'error',
                          'Error',
                          'El descuento no puede ser mayor que el total'
                        );
                      }
                      else {
                        setDescReb(parseFloat(event.target.value, 2));
                      }
                    }}
                    onClick={() => {
                      if (totalVenta !== subtotalVenta) {
                        recalcularTotal();
                      }
                    }
                    }
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
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
                        setmontoPagos(parseFloat(totalVenta / event.target.value).toFixed(2));
                        setacuenta(parseFloat(totalVenta / event.target.value).toFixed(2));
                        setdetallePagos({
                          ...detallePagos,
                          monto: parseFloat(totalVenta / event.target.value).toFixed(2),
                        })
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
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="tipoPago">Forma de pago</InputLabel>
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
                    value={detallePagos.monto}
                    onChange={(event) => {
                      if (parseFloat(event.target.value) > totalVenta) {
                        createToastFormVenta(
                          'error',
                          'Error',
                          'El monto a pagar no puede ser mayor que el total'
                        );
                      } else {
                        setdetallePagos({
                          ...detallePagos,
                          monto: parseFloat(event.target.value, 2),
                        })
                        // setacuenta(parseFloat(event.target.value, 2));
                      }
                    }}
                    onBlur={(e) => setacuenta(parseFloat(e.target.value, 2))}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <FormControlLabel control={<Switch value={rtnenable}
                    onChange={(e) => setrtnenable(e.target.checked)} />} label="RTN" />
                  {
                    rtnenable &&
                    <>
                      <TextField
                        id="rtn"
                        label="RTN"
                        type="text"
                        variant="standard"
                        sx={{ m: 1 }}
                        value={datosRtn.rtn}
                        onChange={(e) => setDatosRtn({ ...datosRtn, rtn: e.target.value })}
                      />
                      <TextField
                        id="rtNombre"
                        label="Nombre RTN"
                        type="text"
                        variant="standard"
                        sx={{ m: 1 }}
                        value={datosRtn.nombre}
                        onChange={(e) => setDatosRtn({ ...datosRtn, nombre: e.target.value })}
                      />
                    </>
                  }
                </div>
              </div>
            </div>
            <div >
              <p style={{ fontSize: '25px' }}>
                <span style={{ fontWeight: 200 }}>Sub Total: </span>
                <span>{formatearNumero(subtotalVenta)}</span>
              </p>
              <p style={{ fontSize: '25px' }}>
                <span style={{ fontWeight: 200 }}>Descuento: </span>
                <span>{formatearNumero(totalDescuento)}</span>
              </p>
              <p style={{ fontSize: '25px' }}>
                <span style={{ fontWeight: 200 }}>Total: </span>
                <span>{formatearNumero(totalVenta)}</span>
              </p>
              <p style={{ fontSize: '25px' }}>
                <span style={{ fontWeight: 200 }}>Acuenta: </span>
                <span>{formatearNumero(acuenta)}</span>
              </p>
              <p style={{ fontSize: '25px', color: '#cc0404' }}>
                <span style={{ fontWeight: 200 }}>Restante: </span>
                <span>{formatearNumero(totalVenta - acuenta)}</span>
              </p>
            </div>
          </div>
          {
            subtotalVenta !== 0 &&
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '30px'
            }}>
              <Button variant='contained' onClick={() => generarFactura('recibo')}>Generar recibo</Button>
              <Button variant='contained' onClick={() => generarFactura('factura')} type="submit">Generar factura</Button>
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleCloseDialogVenta}>Cancelar</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialogInv}
        disableEscapeKeyDown={true}
        maxWidth="md"
        fullWidth={true}
        onClose={handleCloseDialogInv}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            opticaControlApi.post('inventario', formValuesInv)
              .then((response) => {
                if (response.status === 201) {
                  createToast(
                    'success',
                    'Confirmado',
                    'El registro fue creado correctamente'
                  );
                  handleCloseDialogInv();
                  setlistInvPedido([
                    ...listInvPedido,
                    {
                      descripcion: response.data[0].descripcion,
                      esfera: response.data[0].esfera,
                      cilindro: response.data[0].cilindro,
                      adicion: response.data[0].adicion,
                      linea: response.data[0].linea,
                      inventario: response.data[0]._id,
                      cantidad: 1,
                      importe: response.data[0].importe,
                      valorGravado: response.data[0].valorGravado,
                      existencia: response.data[0].existencia,
                      precioVenta: response.data[0].precioVenta,
                      // descuento: 0,
                      moda: response.data[0].moda
                    }]);
                  setinvFiltradoExp([...setinvFiltradoExp, response.data]);
                }
              })
              .catch((err) => {
                createToast(
                  'error',
                  'Error',
                  'Ha ocurrido un error'
                );
                console.log(err);
                handleCloseDialogInv();
              });
          },
        }}
      >
        <DialogTitle>Datos sobre inventario</DialogTitle>
        <DialogContent                 >
          <DialogContentText>
            Por favor rellene los campos sobre la informacion de su inventario
          </DialogContentText>
          <Toast ref={toastForm} />
          <TextField
            autoFocus
            required
            value={formValuesInv.descripcion}
            onChange={(event) => handleChangeText(event, 'descripcion')}
            margin="dense"
            id="descripcion"
            name="descripcion"
            label="Descripcion"
            type="text"
            sx={{ width: "70%" }}
            variant="standard"
            size="medium"
          />
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="linea">Linea</InputLabel>
            <Select
              labelId="linea"
              id="linea"
              value={formValuesInv.linea}
              onChange={(event) => handleChangeText(event, 'linea')}
              label="linea"
            >
              {lineas.map(op => {
                return (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '30px'
          }}>
            <Autocomplete
              {...defaultProps}
              options={listGraduaciones}
              value={formValuesInv.esfera}
              onChange={(event, newValue) => {
                setFormValuesInv({
                  ...formValuesInv,
                  esfera: newValue
                })
              }}
              sx={{ width: '50%' }}
              renderInput={(params) => <TextField {...params} label="Esfera" variant="standard" />}
            />
            <Autocomplete
              {...defaultProps}
              options={listGraduaciones}
              value={formValuesInv.cilindro}
              onChange={(event, newValue) => {
                setFormValuesInv({
                  ...formValuesInv,
                  cilindro: newValue
                })
              }}
              sx={{ width: '50%' }}
              renderInput={(params) => <TextField {...params} label="Cilindro" variant="standard" />}
            />
            <Autocomplete
              {...defaultPropsAdicion}
              options={listAdicion}
              value={formValuesInv.adicion}
              onChange={(event, newValue) => {
                setFormValuesInv({
                  ...formValuesInv,
                  adicion: newValue
                })
              }}
              sx={{ width: '50%' }}
              renderInput={(params) => <TextField {...params} label="Adición" variant="standard" />}
            />
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '15px'
          }}>
            <TextField
              required
              value={formValuesInv.precioVenta}
              onChange={(event) => {
                if (event.target.value <= 0) {
                  createToastForm(
                    'error',
                    'Error',
                    'No se puede ingresar una cantidad negativa'
                  );
                  setFormValuesInv({ ...formValuesInv, precioVenta: 0 });
                  return;
                }
                else {
                  handleChangeText(event, 'precioVenta');
                }
              }} margin="dense"
              id="precioVenta"
              name="precioVenta"
              label="Precio Venta"
              type="number"
              fullWidth
              variant="standard"
              size="medium"
            />
            <TextField
              required
              value={formValuesInv.precioCompra}
              onChange={(event) => {
                if (event.target.value <= 0) {
                  createToastForm(
                    'error',
                    'Error',
                    'No se puede ingresar una cantidad negativa'
                  );
                  setFormValuesInv({ ...formValuesInv, precioCompra: 0 });
                  return;
                }
                else {
                  handleChangeText(event, 'precioCompra');
                }
              }}
              margin="dense"
              id="precioCompra"
              name="precioCompra"
              label="Precio Compra"
              type="number"
              fullWidth
              variant="standard"
              size="medium"
            />
            <TextField
              required
              value={formValuesInv.existencia}
              onChange={(event) => {
                setFormValuesInv({
                  ...formValuesInv,
                  existencia: parseInt(event.target.value)
                })
              }}
              margin="dense"
              id="existencia"
              name="existencia"
              label="Existencia"
              type="number"
              fullWidth
              variant="standard"
              size="medium"
            />
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="importe">Importe</InputLabel>
              <Select
                labelId="importe"
                id="importe"
                value={formValuesInv.importe}
                onChange={(event) => {
                  setdisabledGravado(event.target.value === 'Exento' ? true : false);
                  handleChangeText(event, 'importe')
                }}
                label="importe"
              >
                {importe.map(op => {
                  return (
                    <MenuItem key={op} value={op}>{op}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="valorGravado">Valor Gravado</InputLabel>
              <Select
                disabled={disabledGravado}
                labelId="valorGravado"
                id="valorGravado"
                value={formValuesInv.valorGravado}
                onChange={(event) => handleChangeText(event, 'valorGravado')}
                label="valorGravado"
              >
                {valorGravado.map(op => {
                  return (
                    <MenuItem key={op} value={op}>{op}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </div>
          <div className='container'>
            <TextField
              value={formValuesInv.categoria}
              onChange={(event) => handleChangeText(event, 'categoria')}
              margin="dense"
              id="categoria"
              name="categoria"
              label="Categoria"
              type="text"
              fullWidth
              variant="standard"
              size="medium"
            />
            <TextField
              required
              value={formValuesInv.proveedor}
              onChange={(event) => handleChangeText(event, 'proveedor')}
              margin="dense"
              id="proveedor"
              name="proveedor"
              label="Proveedor"
              type="text"
              fullWidth
              variant="standard"
              size="medium"
            />
            <TextField
              value={formValuesInv.telefono}
              onChange={(event) => handleChangeText(event, 'telefono')}
              margin="dense"
              id="telefono"
              name="telefono"
              label="Telefono "
              type="text"
              fullWidth
              variant="standard"
              size="medium"
            />
            <TextField
              value={formValuesInv.moda}
              onChange={(event) => handleChangeText(event, 'moda')}
              margin="dense"
              id="moda"
              name="moda"
              label="Moda"
              type="text"
              fullWidth
              variant="standard"
              size="medium"
            />
            <TextField
              value={formValuesInv.material}
              onChange={(event) => handleChangeText(event, 'material')}
              margin="dense"
              id="material"
              name="material"
              label="Material"
              type="text"
              fullWidth
              variant="standard"
              size="medium"
            />
            <TextField
              value={formValuesInv.diseno}
              onChange={(event) => handleChangeText(event, 'diseno')}
              margin="dense"
              id="diseno"
              name="diseno"
              label="Diseño"
              type="text"
              fullWidth
              variant="standard"
              size="medium"
            />
            <TextField
              value={formValuesInv.color}
              onChange={(event) => handleChangeText(event, 'color')}
              margin="dense"
              id="color"
              name="color"
              label="Color"
              type="text"
              fullWidth
              variant="standard"
              size="medium"
            />
          </div>
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogInv} >Cancelar</Button>
          <Button variant='contained' type="submit">Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
