import React, { useEffect, useState, useRef } from 'react';

import { Toast, DataTable, Column, FilterMatchMode, TabView, TabPanel } from 'primereact';
import dayjs from 'dayjs';

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
    Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField
}
    from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckIcon from '@mui/icons-material/Check';
import ConstructionIcon from '@mui/icons-material/Construction';
import CloseIcon from '@mui/icons-material/Close';

import { formatearFecha, formatearNumero } from '../../helpers/formato';
import './DetalleVentasStyle.css';
import { nuevaFactura } from '../../helpers/nuevaFactura';
import { textValidator } from '../../helpers/validator';
import { opticaControlApi } from '../../services/opticaControlApi';

export const DetalleVentas = () => {
    const [listPaciente, setListPaciente] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [listDetalleVentas, setListDetalleVentas] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedVentaId, setselectedVentaId] = useState('');
    const [correlativo, setCorrelativo] = useState([]);
    const [facturas, setfacturas] = useState([]);
    const [disabledVenta, setdisabledVenta] = useState(false);
    const [ventaView, setventaView] = useState();
    const [formdetallePagos, setFormDetallePagos] = useState({
        fecha: dayjs().format('YYYY-MM-DD'),
        formaPago: '',
        monto: 0,
        usuarios: localStorage.getItem('usuarioId')

    });
    const toast = useRef(null);
    const toastForm = useRef(null);

    useEffect(() => {
        if (window.innerWidth < 1900) {
            document.body.style.zoom = '80%'
        } else {
            document.body.style.zoom = '100%'
        }
        const sucursal = localStorage.getItem('sucursalID');
        opticaControlApi.get(`facturas/facturaRecibo/${sucursal}`).then((response) => {
            if (response.data.factura.length > 0) {
                if (response.data.factura.length > 1) {
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
            }
            setfacturas(response.data.factura);
            setCorrelativo(response.data.correlativo[0]);
        });

        opticaControlApi.get('detalleVentas/pacientes', '').then((response) => {
            setListPaciente(response.data);
        });

    }, [])

    const revisarRangoFacturas = () => {
        if (facturas.length < 1) {
            createToast(
                'error',
                'Error',
                'Debe ingresar un rango de facturas'
            );
            return false;
        } else if (facturas.length > 1) {
            createToast(
                'error',
                'Error',
                'Solo puede tener un rango de facturas activo'
            );
            return false;
        } else if (facturas[0].ultimaUtilizada === facturas[0].hasta) {
            createToast(
                'error',
                'Error',
                'No tiene facturas disponibles'
            );
            return false;
        } else {
            return true;
        }
    };

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };
    const createToastForm = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const [filters] = useState({
        nombre: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    });

    const tipoPago = [
        'Efectivo',
        'Tarjeta',
    ];

    const cleanForm = () => {
        setFormDetallePagos({
            fecha: dayjs().format('YYYY-MM-DD'),
            formaPago: '',
            monto: 0,
            usuarios: localStorage.getItem('usuarioId')
        });
        const sucursal = localStorage.getItem('sucursalID');
        opticaControlApi.get(`facturas/facturaRecibo/${sucursal}`).then((response) => {
            if (response.data.factura.length < 1) {
                createToast(
                    'error',
                    'Error',
                    'Debe ingresar un rango de facturas'
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
            setfacturas(response.data.factura);
            setCorrelativo(response.data.correlativo[0]);
        });
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };


    const onCellSelect = (e) => {
        if (e.cellIndex === 3) {
            opticaControlApi.get(`detalleVentas/idPaciente/${e.rowData.idPaciente}`, '')
                .then((response) => {
                    console.log(response.data);

                    setActiveIndex(0)
                    setListDetalleVentas(response.data);
                    setdisabledVenta(response.data[0].estado);
                    setventaView(response.data[0]);
                    setselectedVentaId(response.data[0]._id);
                });
        }
    }

    const renderVerVentas = () => {
        return (
            <AssignmentIcon color='primary' fontSize='medium' />
        );
    };

    const precioVendido = (data) => {
        return (
            data.inventario.precioVenta - data.descuento
        )
    }

    const fechaBodyTemplate = (fecha) => {
        return formatearFecha(fecha);
    };

    const obtenerDatosFactura = (numFacRec) => {
        let detalleInv = []

        ventaView.detalleInventario.forEach((i) => {
            detalleInv.push(
                {
                    cantidad: Math.abs(i.cantidad),
                    descripcion: i.inventario.descripcion,
                    importe: i.inventario.importe,
                    valorGravado: i.inventario.valorGravado,
                    precioVenta: i.inventario.precioVenta
                }
            )
        })

        const facturaDatos = {
            cliente: ventaView.paciente.nombre,
            sucursales: localStorage.getItem('sucursalID'),
            rtn: ventaView.rtn,
            nombreRtn: ventaView.nombreRtn,
            numFacRec: numFacRec,
            vendedor: localStorage.getItem('nombre'),
            inventario: detalleInv,
            formaPago: !textValidator(formdetallePagos.formaPago) ? ventaView.detallePagos[ventaView.detallePagos.length - 1].formaPago : formdetallePagos.formaPago,
            monto: formdetallePagos.monto === 0 ? ventaView.detallePagos[ventaView.detallePagos.length - 1].monto : formdetallePagos.monto,
            total: parseFloat(ventaView.total, 2),
            fecha: formdetallePagos.monto === 0 ? ventaView.detallePagos[ventaView.detallePagos.length - 1].fecha : formdetallePagos.fecha,
            totalDescuento: parseFloat(ventaView.descuentoTotal, 2),
            acuenta: parseFloat(ventaView.acuenta + formdetallePagos.monto, 2),
            montoPagos: parseFloat(ventaView.total / ventaView.cantPagos, 2),
        }

        return facturaDatos;
    };

    const generarFactura = (op) => {
        if (!textValidator(formdetallePagos.formaPago)) {
            createToastForm(
                'warn',
                'Acction requerida',
                'Seleccione forma de pago'
            );
            return;
        }
        if (formdetallePagos.monto <= 0) {
            createToastForm(
                'warn',
                'Acction requerida',
                'No se recebio pago'
            );
            return;
        }
        let numFacRec = '';
        if (op === 'factura' && (parseFloat(formdetallePagos.monto) + parseFloat(ventaView.acuenta)) === parseFloat(ventaView.total)) {
            if (facturas[0].ultimaUtilizada === '') {
                numFacRec = facturas[0].desde;
            } else {
                numFacRec = nuevaFactura(facturas[0].ultimaUtilizada);
            }
        } else {
            numFacRec = parseInt(correlativo.numCorrelativo) + 1;
        }
        const facturaDatos = obtenerDatosFactura(numFacRec);
        console.log(facturaDatos);

        // opticaControlApi.put(`facturas/imprimirRecibo`, facturaDatos)
        //     .then(() => {
        //         createToast(
        //             'success',
        //             'Confirmado',
        //             'La factura a sido generada'
        //         );
        //     })
        //     .catch((error) => {
        //         createToast(
        //             'error',
        //             'Error',
        //             'Hubo un error al generar la factura, favor revise la impresora'
        //         );
        //     });

        opticaControlApi.put(`detalleVentas/detallePago/${selectedVentaId}`, { detallePago: formdetallePagos, numFacRec: numFacRec })
            .then((response) => {
                if (response.status === 202) {
                    createToast(
                        'success',
                        'Confirmado',
                        'El pago fue registrdo correctamente'
                    );
                    if (op === 'factura' && (parseFloat(formdetallePagos.monto) + parseFloat(ventaView.acuenta)) === parseFloat(ventaView.total)) {
                        opticaControlApi.put(`facturas/${facturas[0]._id}`, { ultimaUtilizada: numFacRec }).then(() => {
                            opticaControlApi.post(`thermalPrinter/imprimirFactura`, facturaDatos)
                                .then(() => {
                                    createToast(
                                        'success',
                                        'Confirmado',
                                        'La factura a sido generada'
                                    );
                                })
                                .catch((error) => {
                                    createToast(
                                        'error',
                                        'Error',
                                        'Hubo un error al generar la factura, favor revise la impresora'
                                    );
                                });
                        });
                    } else {
                        opticaControlApi.put(`correlativo/${correlativo._id}`, { numCorrelativo: numFacRec }).then(() => {
                            opticaControlApi.post(`thermalPrinter/imprimirRecibo`, facturaDatos)
                                .then(() => {
                                    createToast(
                                        'success',
                                        'Confirmado',
                                        'El recibo a sido generado'
                                    );
                                })
                                .catch((error) => {
                                    createToast(
                                        'error',
                                        'Error',
                                        'Hubo un error al generar el recibo, favor revise la impresora'
                                    );
                                });
                        });
                    }

                    setListDetalleVentas(
                        listDetalleVentas.map((i) =>
                            i._id === selectedVentaId ? {
                                ...i,
                                detallePagos: [...response.data.detallePagos],
                                acuenta: response.data.acuenta,
                                numFacRec: response.data.numFacRec,
                            } : i
                        )
                    );
                    setventaView({
                        ...ventaView,
                        detallePagos: [...response.data.detallePagos],
                        acuenta: response.data.acuenta,
                        numFacRec: response.data.numFacRec,
                    }
                    )
                    cleanForm();
                    handleCloseDialog();
                } else {
                    createToast(
                        'error',
                        'Error',
                        response.statusText,
                    );
                    console.log(response);
                    cleanForm();
                    handleCloseDialog();
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
    };

    const handleTabChange = (e) => {
        setActiveIndex(e.index);
        setventaView(listDetalleVentas[e.index]);
        setselectedVentaId(listDetalleVentas[e.index]._id);
        setdisabledVenta(listDetalleVentas[e.index].estado);
    };

    return (
        <>
            <h1>Informacion sobre las ventas </h1>
            <br />
            <Toast ref={toast} />
            <div style={{
                display: 'flex',
                gap: '15px',
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}>

                <div style={{ width: '35%' }}>
                    <DataTable value={listPaciente}
                        size='small'
                        sortMode="multiple"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        filters={filters}
                        filterDisplay='row'
                        selectionMode="single"
                        cellSelection
                        onCellSelect={onCellSelect}
                        scrollable
                        columnResizeMode="expand"
                        resizableColumns
                    >
                        <Column field="paciente" header="Nombre" sortable filter></Column>
                        <Column field="acuenta" header="Acuenta" body={(data) => formatearNumero(data.acuenta)}></Column>
                        <Column field="total" header="Total" body={(data) => formatearNumero(data.total)}></Column>
                        <Column body={renderVerVentas} bodyStyle={{ textAlign: 'center' }}></Column>
                    </DataTable>
                </div >
                <div style={{ width: '100%' }}>
                    <TabView
                        activeIndex={activeIndex}
                        onTabChange={handleTabChange}
                        onBeforeTabChange={handleTabChange}
                    >
                        {
                            listDetalleVentas.map((detalle) => {
                                return (
                                    <TabPanel
                                        header={dayjs(detalle.fecha).add(6, 'hour').format('YYYY-MM-DD')}
                                        key={detalle._id}

                                    >
                                        {
                                            !disabledVenta &&
                                            <div style={{ border: '#b30200 3px solid' }}>
                                                <h1 style={{ color: "#b30000", textAlign: 'center' }}>Venta cancelada</h1>
                                            </div>
                                        }
                                        {
                                            disabledVenta &&
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                gap: '10px'
                                            }}>
                                                {
                                                    !detalle.trabajoHecho &&
                                                    <Button
                                                        variant='outlined'
                                                        color="success"
                                                        startIcon={<ConstructionIcon />}
                                                        onClick={(e) => {
                                                            opticaControlApi.put(`detalleVentas/${selectedVentaId}`, { trabajoHecho: true, fechaRealizado: dayjs().format('YYYY-MM-DD') })
                                                                .then((response) => {
                                                                    setventaView({
                                                                        ...ventaView,
                                                                        trabajoHecho: true,
                                                                        fechaRealizado: response.data.fechaRealizado
                                                                    })
                                                                    setListDetalleVentas(
                                                                        listDetalleVentas.map((i) =>
                                                                            i._id === selectedVentaId ? {
                                                                                ...i,
                                                                                trabajoHecho: true,
                                                                                fechaRealizado: response.data.fechaRealizado
                                                                            } : i
                                                                        )
                                                                    )

                                                                    createToast(
                                                                        'success',
                                                                        'Confirmado',
                                                                        'Trabajo hecho'
                                                                    );
                                                                })
                                                                .catch((error) => {
                                                                    console.log(error);
                                                                    createToast(
                                                                        'error',
                                                                        'Error',
                                                                        'Ocurrio un error'
                                                                    );
                                                                });
                                                        }}
                                                    >Trabajo hecho</Button>
                                                }
                                                {
                                                    !detalle.entregado &&
                                                    <Button
                                                        variant='outlined'
                                                        color="primary"
                                                        startIcon={<CheckIcon />}
                                                        onClick={(e) => {
                                                            if (detalle.acuenta !== detalle.total) {
                                                                createToast(
                                                                    'warn',
                                                                    'Acción requerida',
                                                                    'La venta aún requiere pago'
                                                                );
                                                            } else {
                                                                opticaControlApi.put(`detalleVentas/${selectedVentaId}`,
                                                                    { entregado: true, trabajoHecho: true, fechaEntrega: dayjs().format('YYYY-MM-DD') })
                                                                    .then((response) => {
                                                                        console.log(response);

                                                                        setventaView({
                                                                            ...ventaView,
                                                                            entregado: true,
                                                                            trabajoHecho: true,
                                                                            fechaEntrega: response.data.fechaEntrega
                                                                        })
                                                                        setListDetalleVentas(
                                                                            listDetalleVentas.map((i) =>
                                                                                i._id === selectedVentaId ? {
                                                                                    ...i,
                                                                                    entregado: true,
                                                                                    trabajoHecho: true,
                                                                                    fechaEntrega: response.data.fechaEntrega
                                                                                } : i
                                                                            )
                                                                        );
                                                                        createToast(
                                                                            'success',
                                                                            'Confirmado',
                                                                            'Articulo entregado'
                                                                        );
                                                                    })
                                                                    .catch((error) => {
                                                                        console.log(error);
                                                                        createToast(
                                                                            'error',
                                                                            'Error',
                                                                            'Ocurrio un error'
                                                                        );
                                                                    });
                                                            }
                                                        }}
                                                    >Entregado</Button>
                                                }
                                                {
                                                    !detalle.entregado &&
                                                    <Button
                                                        variant='outlined'
                                                        id={detalle._id}
                                                        color="error"
                                                        startIcon={<CloseIcon />}
                                                        onClick={(e) => {
                                                            opticaControlApi.put(`detalleVentas/cancelarVenta/${selectedVentaId}`, {})
                                                                .then(() => {
                                                                    setventaView({
                                                                        ...ventaView,
                                                                        estado: false,
                                                                    })
                                                                    setListDetalleVentas(
                                                                        listDetalleVentas.map((i) =>
                                                                            i._id === selectedVentaId ? {
                                                                                ...i,
                                                                                estado: false,
                                                                            } : i
                                                                        )
                                                                    )
                                                                    setdisabledVenta(false);
                                                                    createToast(
                                                                        'warn',
                                                                        'Confirmado',
                                                                        'Venta cancelada'
                                                                    );
                                                                })
                                                                .catch((error) => {
                                                                    console.log(error);
                                                                    createToast(
                                                                        'error',
                                                                        'Error',
                                                                        'Ocurrio un error'
                                                                    );
                                                                });
                                                        }}
                                                    >Cancelar venta</Button>
                                                }
                                                <Button
                                                    variant='contained'
                                                    color="secondary"
                                                    startIcon={<PrintIcon />}
                                                    onClick={(e) => {
                                                        const facturaDatos = obtenerDatosFactura(ventaView.numFacRec);
                                                        console.log(facturaDatos);

                                                        if (facturaDatos.numFacRec.length === 19) {
                                                            opticaControlApi.post(`thermalPrinter/imprimirFactura`, facturaDatos)
                                                                .then(() => {
                                                                    createToast(
                                                                        'success',
                                                                        'Confirmado',
                                                                        'La factura a sido generada'
                                                                    );
                                                                })
                                                                .catch((error) => {
                                                        console.log(error);
                                                                    createToast(
                                                                        'error',
                                                                        'Error',
                                                                        'Hubo un error al generar la factura, favor revise la impresora'
                                                                    );
                                                                });
                                                        } else {
                                                            opticaControlApi.post(`thermalPrinter/imprimirRecibo`, facturaDatos)
                                                                .then(() => {
                                                                    createToast(
                                                                        'success',
                                                                        'Confirmado',
                                                                        'El recibo a sido generado'
                                                                    );
                                                                })
                                                                .catch((error) => {
                                                        console.log(error);
                                                                    createToast(
                                                                        'error',
                                                                        'Error',
                                                                        'Hubo un error al generar el recibo, favor revise la impresora'
                                                                    );
                                                                });
                                                        }
                                                    }}
                                                >FACTURA/RECIBO</Button>
                                            </div>
                                        }
                                        <p style={{ fontSize: '30px' }}>{detalle.sucursales.nombre} - {detalle.tipoVenta} </p>
                                        <div className='grid3Column'>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Paciente: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.paciente.nombre}</span>
                                            </p>
                                            {
                                                textValidator(detalle.rtn) &&
                                                <>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>RTN: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.rtn}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Nombre RTN: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.nombreRtn}</span>
                                                    </p>
                                                </>
                                            }
                                        </div>
                                        <p style={{ fontSize: '20px' }}>
                                            <span style={{ fontWeight: 500 }}>Num. Factura/Recibo: </span>
                                            <span style={{ fontWeight: 200 }}>{detalle.numFacRec}</span>
                                        </p>
                                        {/* <p><span>Sucursal: </span> <span>{detalle.sucursales.nombre}</span></p> */}
                                        <div className='divColumn'>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Tipo de lente: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.tipoLente}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}><span style={{ fontWeight: 500 }}>Protección: </span>
                                                {
                                                    detalle.proteccion.map(p => {
                                                        return <Chip label={p} key={p} sx={{ margin: '3px' }} size="small" color="primary" />
                                                    })
                                                }
                                            </p>
                                            {
                                                (detalle.tipoVenta !== 'Compra total') &&
                                                <>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Material: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.material}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Moda: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.moda}</span>
                                                    </p>
                                                </>
                                            }
                                        </div>
                                        <div className='divColumn'>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Entrega programada: </span>
                                                <span style={{ fontWeight: 200 }}>{dayjs(detalle.entregaProgramada).add(6, 'hour').format('YYYY-MM-DD')}</span>
                                            </p>
                                            {
                                                detalle.entregado &&
                                                <p style={{ fontSize: '20px' }}>
                                                    <span style={{ fontWeight: 500 }}>Entrega: </span>
                                                    <span style={{ fontWeight: 200 }}>{dayjs(detalle.fechaEntrega).add(6, 'hour').format('YYYY-MM-DD')}</span>
                                                </p>
                                            }
                                        </div>
                                        {
                                            detalle.trabajoHecho &&
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Trabajo realizado: </span>
                                                <span style={{ fontWeight: 200 }}>{dayjs(detalle.fechaRealizado).add(6, 'hour').format('YYYY-MM-DD')}</span>
                                            </p>
                                        }
                                        {
                                            detalle.entregado &&
                                            <Chip label="Entregado" sx={{ margin: '3px' }} size="large" color="success" />
                                        }
                                        {
                                            detalle.trabajoHecho &&
                                            <Chip label="Trabajo hecho" sx={{ margin: '3px' }} size="large" color="success" />
                                        }
                                        <h3> Detalle </h3>
                                        <DataTable value={detalle.detalleInventario}
                                            size='small'
                                            paginator
                                            rows={3}
                                            scrollable
                                            columnResizeMode="expand"
                                            resizableColumns
                                        >
                                            <Column field="inventario.descripcion" header="Descripción"  ></Column>
                                            <Column field="inventario.esfera" header="Esfera"></Column>
                                            <Column field="inventario.cilindro" header="Cilindro"></Column>
                                            <Column field="inventario.adicion" header="Adición"></Column>
                                            <Column field="cantidad" header="Cantidad" ></Column>
                                            <Column field="inventario.moda" header="Moda" ></Column>
                                            <Column field="inventario.precioVenta" header="Precio Venta" body={(data) => formatearNumero(data.inventario.precioVenta)}></Column>
                                            <Column field="inventario.precioCompra" header="Precio Compra" body={(data) => formatearNumero(data.inventario.precioCompra)}></Column>
                                            {/* <Column field="descuento" header="Descuento" body={(data) => precioBodyTemplate(data.descuento)}></Column> */}
                                            {/* <Column header="Vendido a" body={(data) => precioVendido(data)}></Column> */}
                                        </DataTable>
                                        <h3>Detalle pagos</h3>
                                        <div className='divColumn'>
                                            <div style={{ width: '50%' }}>
                                                <DataTable value={detalle.detallePagos}
                                                    size='small'
                                                    paginator
                                                    rows={2}
                                                    scrollable
                                                    columnResizeMode="expand"
                                                    resizableColumns
                                                >
                                                    <Column field="fecha" header="Fecha" body={(data) => dayjs(data.fecha).add(6, 'hour').format('YYYY-MM-DD')} ></Column>
                                                    <Column field="formaPago" header="Forma Pago" ></Column>
                                                    <Column field="monto" header="Monto" body={(data) => formatearNumero(data.monto)}></Column>
                                                    <Column field="usuarios.usuario" header="Recibido" ></Column>
                                                </DataTable>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                width: '50%',
                                                alignItems: 'center',
                                                justifyContent: 'space-evenly'
                                            }}>
                                                <div>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Pagado un: </span>
                                                        <span style={{ fontWeight: 200 }}>{(detalle.acuenta / detalle.total) * 100} %</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Acuenta: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {formatearNumero(detalle.acuenta)}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Cant. pagos: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.cantPagos}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Descuento total: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {formatearNumero(detalle.descuentoTotal)}</span>
                                                    </p>
                                                    {
                                                        (parseFloat(detalle.acuenta - detalle.total) < 0) &&
                                                        <p style={{ fontSize: '20px', color: '#b00000' }}>
                                                            <span style={{ fontWeight: 500 }}>Credito: </span>
                                                            <span style={{ fontWeight: 200 }}>L. {formatearNumero(detalle.acuenta - detalle.total)}</span>
                                                        </p>
                                                    }
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Total: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {formatearNumero(detalle.total)}</span>
                                                    </p>
                                                </div>
                                                {
                                                    disabledVenta &&
                                                    (detalle.acuenta !== detalle.total) &&
                                                    <div>
                                                        <Button variant='contained'
                                                            id={detalle._id}
                                                            onClick={(e) => {
                                                                let warnig = revisarRangoFacturas();
                                                                if (!warnig) {
                                                                    return
                                                                }
                                                                handleOpenDialog();
                                                            }}
                                                        >Agregar pago</Button>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </TabPanel>
                                )
                            })
                        }
                    </TabView>
                </div>
            </div>
            <Dialog
                open={openDialog}
                disableEscapeKeyDown={true}
                //maxWidth="sm"

                fullWidth
                onClose={handleCloseDialog}
            >
                <DialogTitle>Datos sobre pagos</DialogTitle>
                <DialogContent>
                    <Toast ref={toastForm} />

                    <div className='divColumn'>
                        <div>
                            <p style={{ color: '#696969' }}>Fecha *</p>
                            <TextField
                                required
                                onChange={(event) => {
                                    setFormDetallePagos({
                                        ...formdetallePagos,
                                        fecha: event.target.value
                                    })
                                }
                                }
                                value={formdetallePagos.fecha}
                                margin='dense'
                                id='registro'
                                name='registro'
                                type='date'
                                format='yyyy-MM-dd'
                                variant='standard'
                                size='medium'
                            />
                        </div>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="tipoPago">Forma de pago</InputLabel>
                            <Select
                                labelId="tipoPago"
                                id="tipoPago"
                                value={formdetallePagos.formaPago}
                                onChange={(event) => {
                                    setFormDetallePagos({
                                        ...formdetallePagos,
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
                            id="monto"
                            label="Monto"
                            type="number"
                            variant="standard"
                            sx={{ m: 1 }}
                            value={formdetallePagos.monto}
                            onChange={(event) => {
                                if ((parseFloat(event.target.value) + parseFloat(ventaView.acuenta)) > parseFloat(ventaView.total)) {
                                    createToastForm(
                                        'error',
                                        'Error',
                                        'El monto a pagar no puede ser mayor que el total'
                                    );
                                } else {
                                    setFormDetallePagos({
                                        ...formdetallePagos,
                                        monto: parseFloat(event.target.value, 2)
                                    })
                                }

                            }}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />
                    </div>
                    <br />
                    <br />
                </DialogContent>
                <DialogActions>
                    <div className='divColumn'>
                        <Button onClick={handleCloseDialog} >Cancelar</Button>
                        <Button variant='contained' onClick={() => generarFactura('recibo')}>Generar recibo</Button>
                        <Button variant='contained' onClick={() => generarFactura('factura')} type="submit">Generar factura</Button>
                    </div>
                </DialogActions>
            </Dialog>
        </>
    )
}
