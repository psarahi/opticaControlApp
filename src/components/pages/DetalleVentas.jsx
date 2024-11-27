import React, { useEffect, useState, useRef } from 'react';

import { Toast, DataTable, Column, FilterMatchMode, TabView, TabPanel } from 'primereact';
import AssignmentIcon from '@mui/icons-material/Assignment';
import dayjs from 'dayjs';
import { appointmentApi } from '../../services/appointmentApi';

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
    Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField
}
    from '@mui/material'; import { formatearFecha, formatearNumero } from '../../helpers/formato';

import './DetalleVentasStyle.css';
import { nuevaFactura } from '../../helpers/nuevaFactura';
import { textValidator } from '../../helpers/validator';


export const DetalleVentas = () => {
    const [listPaciente, setListPaciente] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [listDetalleVentas, setListDetalleVentas] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedVenta, setselectedVenta] = useState('');
    const [correlativo, setCorrelativo] = useState([]);
    const [facturas, setfacturas] = useState([]);
    const [ventaView, setventaView] = useState();
    const [formdetallePagos, setFormDetallePagos] = useState({
        fecha: dayjs().format('YYYY-MM-DD'),
        formaPago: '',
        monto: 0
    });
    const toast = useRef(null);
    const toastForm = useRef(null);

    useEffect(() => {
        const sucursal = localStorage.getItem('sucursalID');
        appointmentApi.get(`facturas/facturaRecibo/${sucursal}`).then((response) => {
            console.log(response);
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
            console.log(response.data.correlativo[0]);
            console.log(response.data.factura[0]);
            setfacturas(response.data.factura);
            setCorrelativo(response.data.correlativo[0]);
        });

        appointmentApi.get('detalleVentas/pacientes', '').then((response) => {
            setListPaciente(response.data);
        });

    }, [])

    const revisarRangoFacturas = () => {
        if (facturas.length > 1) {
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
            monto: 0
        });
        const sucursal = localStorage.getItem('sucursalID');
        appointmentApi.get(`facturas/facturaRecibo/${sucursal}`).then((response) => {
            console.log(response);
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
            console.log(response.data.correlativo[0]);
            console.log(response.data.factura[0]);
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
        if (e.cellIndex === 1) {
            appointmentApi.get(`detalleVentas/idPaciente/${e.rowData.paciente._id}`, '')
                .then((response) => {
                    console.log(response.data);
                    setListDetalleVentas(response.data);
                    setventaView(response.data[0]);
                });
        }
    }

    const renderVerVentas = () => {
        return (
            <AssignmentIcon color='primary' fontSize='medium' />
        );
    };

    const precioBodyTemplate = (precio) => {
        return formatearNumero(precio);
    };

    const precioVendido = (data) => {
        return (
            data.inventario.precioVenta - data.descuento
        )
    }

    const fechaBodyTemplate = (fecha) => {
        return formatearFecha(fecha);
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
                'No '
            );
            return;
        }
        let numFacRec = '';
        debugger;
        if (op === 'factura' && (parseFloat(formdetallePagos.monto) + parseFloat(ventaView.acuenta)) === parseFloat(ventaView.total)) {
            if (facturas[0].ultimaUtilizada === '') {
                numFacRec = facturas[0].desde;
            } else {
                numFacRec = nuevaFactura(facturas[0].ultimaUtilizada);
            }
        } else {
            numFacRec = parseInt(correlativo.numRecibo) + 1;
        }
        console.log(facturas[0]._id, correlativo._id);

        appointmentApi.put(`detalleVentas/detallePago/${selectedVenta}`, { detallePago: formdetallePagos, numFacRec: numFacRec })
            .then((response) => {
                debugger
                if (response.status === 202) {
                    createToast(
                        'success',
                        'Confirmado',
                        'El pago fue registrdo correctamente'
                    );
                    if (op === 'factura' && (parseFloat(formdetallePagos.monto) + parseFloat(ventaView.acuenta)) === parseFloat(ventaView.total)) {
                        appointmentApi.put(`facturas/${facturas[0]._id}`, { ultimaUtilizada: numFacRec }).then();
                    } else {
                        appointmentApi.put(`correlativo/${correlativo._id}`, { numRecibo: numFacRec }).then();
                    }

                    setListDetalleVentas(
                        listDetalleVentas.map((i) =>
                            i._id === selectedVenta ? {
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

                    console.log(response);
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
        console.log(e);
        setActiveIndex(e.index);
        setventaView(listDetalleVentas[e.index]);
        console.log(listDetalleVentas[e.index]);

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
                        <Column field="paciente.nombre" header="Nombre" sortable filter></Column>
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
                                        header={dayjs(detalle.fecha).format('YYYY-MM-DD')}
                                        key={detalle._id}

                                    >
                                        <p style={{ fontSize: '30px' }}>{detalle.sucursales.nombre} - {detalle.tipoVenta} </p>
                                        <p style={{ fontSize: '20px' }}>
                                            <span style={{ fontWeight: 500 }}>Paciente: </span>
                                            <span style={{ fontWeight: 200 }}>{detalle.paciente.nombre}</span>
                                        </p><p style={{ fontSize: '20px' }}>
                                            <span style={{ fontWeight: 500 }}>Num. Factura/Recibo: </span>
                                            <span style={{ fontWeight: 200 }}>{detalle.numFacRec}</span>
                                        </p>
                                        {/* <p><span>Sucursal: </span> <span>{detalle.sucursales.nombre}</span></p> */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            flexWap: 'wrap',
                                            gap: '10px 20px',
                                        }}>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Tipo de lente: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.tipoLente}</span>
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
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Fecha entrega: </span>
                                                <span style={{ fontWeight: 200 }}>{dayjs(detalle.fechaEntrega).format('YYYY-MM-DD')}</span>
                                            </p>
                                        </div>

                                        <p style={{ fontSize: '20px' }}><span style={{ fontWeight: 500 }}>Protección: </span>
                                            {
                                                detalle.proteccion.map(p => {
                                                    return <Chip label={p} key={p} sx={{ margin: '3px' }} size="small" color="primary" />
                                                })
                                            }
                                        </p>
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
                                            <Column field="inventario.precioVenta" header="Precio Venta" body={(data) => precioBodyTemplate(data.inventario.precioVenta)}></Column>
                                            <Column field="inventario.precioCompra" header="Precio Compra" body={(data) => precioBodyTemplate(data.inventario.precioCompra)}></Column>
                                            {/* <Column field="descuento" header="Descuento" body={(data) => precioBodyTemplate(data.descuento)}></Column> */}
                                            {/* <Column header="Vendido a" body={(data) => precioVendido(data)}></Column> */}
                                        </DataTable>
                                        <h3>Detalle pagos</h3>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            gap: '30px',
                                        }}>
                                            <div style={{ width: '50%' }}>
                                                <DataTable value={detalle.detallePagos}
                                                    size='small'
                                                    paginator
                                                    rows={2}
                                                    scrollable
                                                    columnResizeMode="expand"
                                                    resizableColumns
                                                >
                                                    <Column field="fecha" header="Fecha" body={(data) => fechaBodyTemplate(data.fecha)} ></Column>
                                                    <Column field="formaPago" header="Forma Pago" ></Column>
                                                    <Column field="monto" header="Monto" ></Column>
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
                                                        <span style={{ fontWeight: 500 }}>Subtotal: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {parseFloat(detalle.descuentoTotal + detalle.total).toFixed(2)}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Acuenta: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {parseFloat(detalle.acuenta).toFixed(2)}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Cant. pagos: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.cantPagos}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Descuento total: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {parseFloat(detalle.descuentoTotal).toFixed(2)}</span>
                                                    </p>
                                                    {
                                                        (parseFloat(detalle.acuenta - detalle.total).toFixed(2) < 0) &&
                                                        <p style={{ fontSize: '20px', color: '#b00000' }}>
                                                            <span style={{ fontWeight: 500 }}>Credito: </span>
                                                            <span style={{ fontWeight: 200 }}>L. {parseFloat(detalle.acuenta - detalle.total).toFixed(2)}</span>
                                                        </p>
                                                    }
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Total: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {parseFloat(detalle.total).toFixed(2)}</span>
                                                    </p>
                                                </div>
                                                {
                                                    (detalle.total !== detalle.acuenta) &&
                                                    <div>

                                                        <Button variant='contained'
                                                            id={detalle._id}
                                                            onClick={(e) => {
                                                                console.log(ventaView);

                                                                let warnig = revisarRangoFacturas();
                                                                if (!warnig) {
                                                                    return
                                                                }
                                                                else if ((ventaView.cantPagos - ventaView.detallePagos.length) === 1) {
                                                                    setFormDetallePagos({
                                                                        ...formdetallePagos,
                                                                        monto: parseFloat(ventaView.total - ventaView.acuenta).toFixed(2)
                                                                    })
                                                                }
                                                                else {
                                                                    setFormDetallePagos(
                                                                        {
                                                                            ...formdetallePagos,
                                                                            monto: parseFloat(detalle.total / detalle.cantPagos).toFixed(2)
                                                                        }
                                                                    )
                                                                }
                                                                setselectedVenta(e.target.id);
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

                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '30px'
                    }}>
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
                                if ((parseFloat(event.target.value) + parseFloat(ventaView.acuenta)) > ventaView.total) {
                                    createToastForm(
                                        'error',
                                        'Error',
                                        'El monto a pagar no puede ser mayor que el total'
                                    );
                                } else if (parseFloat(event.target.value) <= 0) {
                                    createToastForm(
                                        'error',
                                        'Error',
                                        'No se recibio ningún pago'
                                    );
                                }
                                else {
                                    setFormDetallePagos({
                                        ...formdetallePagos,
                                        monto: parseFloat(event.target.value).toFixed(2)
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
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px'
                    }}>
                        <Button onClick={handleCloseDialog} >Cancelar</Button>
                        <Button variant='contained' onClick={() => generarFactura('recibo')}>Generar recibo</Button>
                        <Button variant='contained' onClick={() => generarFactura('factura')} type="submit">Generar factura</Button>
                    </div>
                </DialogActions>
            </Dialog>
        </>
    )
}
