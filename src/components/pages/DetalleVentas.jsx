import React, { useEffect, useState, useRef } from 'react';

import { Toast, DataTable, Column, FilterMatchMode, TabView, TabPanel } from 'primereact';
import AssignmentIcon from '@mui/icons-material/Assignment';
import dayjs from 'dayjs';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers';
import { appointmentApi } from '../../services/appointmentApi';

import { DatePicker } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
    Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField
}
    from '@mui/material'; import { formatearFecha, formatearNumero } from '../../helpers/formato';

import './DetalleVentasStyle.css';


export const DetalleVentas = () => {
    const [listPaciente, setListPaciente] = useState([]);
    const [listDetalleVentas, setListDetalleVentas] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedVenta, setselectedVenta] = useState('');
    const [formdetallePagos, setFormDetallePagos] = useState({
        fecha: dayjs(),
        formaPago: '',
        monto: 0
    });
    const toast = useRef(null);
    const toastForm = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const createToastForm = (severity, summary, detail) => {
        toastForm.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const [filters] = useState({
        nombre: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        optometrista: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        sucursales: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    });

    const tipoPago = [
        'Efectivo',
        'Tarjeta',
    ];

    useEffect(() => {
        appointmentApi.get('detalleVentas/pacientes', '').then((response) => {
            setListPaciente(response.data);
        });
    }, [])

    const cleanForm = () => {
        setFormDetallePagos({
            fecha: new Date(),
            formaPago: '',
            monto: 0
        });
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const onCellSelect = (e) => {
        console.log(e);
        if (e.cellIndex === 1) {
            appointmentApi.get(`detalleVentas/idPaciente/${e.rowData.paciente._id}`, '')
                .then((response) => {
                    console.log(response.data);
                    setListDetalleVentas(response.data);
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
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25, 50]}
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
                    <TabView>
                        {
                            listDetalleVentas.map((detalle) => {
                                return (
                                    <TabPanel
                                        header={dayjs(detalle.fecha).format('YYYY-MM-DD')}
                                        key={detalle._id}
                                    >
                                        <p style={{ fontSize: '30px' }}>{detalle.tipoVenta}</p>
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
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Material: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.material}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Moda: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.moda}</span>
                                            </p>
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
                                            {/* <span></span> */}
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
                                            <Column field="cantidad" header="Cantidad" ></Column>
                                            <Column field="inventario.moda" header="Moda" ></Column>
                                            <Column field="inventario.precioVenta" header="Precio Venta" body={(data) => precioBodyTemplate(data.inventario.precioVenta)}></Column>
                                            <Column field="inventario.precioCompra" header="Precio Compra" body={(data) => precioBodyTemplate(data.inventario.precioCompra)}></Column>
                                            <Column field="descuento" header="Descuento" body={(data) => precioBodyTemplate(data.descuento)}></Column>
                                            <Column header="Vendido a" body={(data) => precioVendido(data)}></Column>
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
                                                        <span style={{ fontWeight: 500 }}>Acuenta: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {detalle.acuenta}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Cant. pagos: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.cantPagos}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Descuento total: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {detalle.descuentoTotal}</span>
                                                    </p>
                                                    <p style={{ fontSize: '20px' }}>
                                                        <span style={{ fontWeight: 500 }}>Total: </span>
                                                        <span style={{ fontWeight: 200 }}>L. {detalle.total}</span>
                                                    </p>
                                                </div>
                                                {
                                                    (detalle.total !== detalle.acuenta) &&
                                                    <div>

                                                        <Button variant='contained'
                                                            id={detalle._id}
                                                            onClick={(e) => {
                                                                setFormDetallePagos(
                                                                    {
                                                                        ...formdetallePagos,
                                                                        monto: detalle.total / detalle.cantPagos
                                                                    }
                                                                )
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
                style={{
                    height: '800px'
                }}
                fullWidth
                onClose={handleCloseDialog}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        console.log(formdetallePagos);

                        appointmentApi.put(`detalleVentas/detallePago/${selectedVenta}`, { detallePago: formdetallePagos })
                            .then((response) => {
                                if (response.status === 202) {
                                    createToast(
                                        'success',
                                        'Confirmado',
                                        'El registro fue creado correctamente'
                                    );
                                    handleCloseDialog();
                                    setListDetalleVentas(
                                        listDetalleVentas.map((i) =>
                                            i._id === selectedVenta ? {
                                                ...i,
                                                detallePagos: [...response.data.detallePagos],
                                                acuenta: response.data.acuenta
                                            } : i
                                        )
                                    );
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
                                handleCloseDialog();
                                cleanForm();
                            });

                    }
                }}
            >
                <DialogTitle>Datos sobre pagos</DialogTitle>
                <DialogContent                 >
                    <Toast ref={toastForm} />
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '30px'
                    }}>
                        <DatePicker
                            onChange={(e) => {
                                setFormDetallePagos({
                                    ...formdetallePagos,
                                    fecha: e
                                })
                            }
                            }
                            value={formdetallePagos.fecha}
                            format='dd-MM-y'
                        />
                        {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Fecha"
                                nombre="fecha"
                                variant="standard"
                                value={formdetallePagos.fecha}
                                format='YYYY-MM-DD'
                                onChange={(event) => {
                                    setFormDetallePagos({
                                        ...formdetallePagos,
                                        fecha: dayjs(event)
                                    })
                                }}
                            />
                        </LocalizationProvider> */}
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="tipoPago">Tipo pago</InputLabel>
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
                            label="monto"
                            type="number"
                            variant="standard"
                            sx={{ m: 1 }}
                            value={formdetallePagos.monto}
                            onChange={(event) => {
                                setFormDetallePagos({
                                    ...formdetallePagos,
                                    monto: event.target.value
                                })
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
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} >Cancelar</Button>
                    <Button variant='contained' type="submit">Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
