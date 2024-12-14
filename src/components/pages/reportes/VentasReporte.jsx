import React, { useRef, useState } from 'react'
import dayjs from 'dayjs';
import { Toast } from 'primereact/toast';
import { DataTable, Column, Tooltip, Button as ButtonPrime } from 'primereact';

import { Button, TextField } from '@mui/material';
import './VentasReporteStyle.css'
import { appointmentApi } from '../../../services/appointmentApi';
import { formatearNumero } from '../../../helpers/formato';

export const VentasReporte = () => {
    const [fechas, setfechas] = useState({
        fechaInicial: dayjs().format('YYYY-MM-DD'),
        fechaFinal: dayjs().format('YYYY-MM-DD')
    });
    const [detalleVentas, setdetalleVentas] = useState([])
    const toast = useRef(null);


    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const handleChangeText = ({ target }, select) => {
        setfechas({
            ...fechas,
            [select]: target.value
        })
    };

    const handleConsultar = (inicio, fin) => {
        console.log(inicio, fin);

        appointmentApi.get(`detalleVentas/reporteVentas/${localStorage.getItem('sucursalID')}/${inicio}/${fin}`)
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data);
                    setdetalleVentas(response.data);
                } else {
                    createToast(
                        'error',
                        'Error',
                        response.statusText,
                    );
                    console.log(response.data);
                    cleanFechas();
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
                cleanFechas();
            });

    };

    const cleanFechas = () => {
        setfechas({
            fechaInicial: dayjs().format('YYYY-MM-DD'),
            fechaFinal: dayjs().format('YYYY-MM-DD')
        })
    };

    return (
        <>
            <h1>En proceso...</h1>
            <h1 style={{ textAlign: 'center', color: '#002946' }}>Reporte de inventario vendido</h1>
            <Toast ref={toast} />
            <div className="flex align-items-center justify-content-end gap-2">
            </div>
            <div className='filtro'>
                <Button variant='contained'
                    onClick={() => {
                        handleConsultar(dayjs().startOf('month').format('YYYY-MM-DD'),
                            dayjs().endOf('month').format('YYYY-MM-DD'))
                    }
                    }
                >
                    Este mes</Button>
                <Button variant='contained'
                    onClick={() => {
                        handleConsultar(dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                            dayjs().subtract(1, 'day').format('YYYY-MM-DD'))
                    }
                    }>Ayer</Button>
                <Button variant='contained'
                    onClick={() => { handleConsultar(dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')) }
                    }>Hoy</Button>

                <div>
                    <h3 style={{ color: '#373636', textAlign: 'center', margin: '0%' }}>Rango de fechas</h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px'
                    }}>
                        <div>
                            <p style={{ color: '#696969' }}>Fecha inicial</p>
                            <TextField
                                required
                                value={fechas.fechaInicial}
                                onChange={(event) => handleChangeText(event, 'fechaInicial')}
                                margin='dense'
                                id='fechaInicial'
                                name='fechaInicial'
                                type='date'
                                format='yyyy-MM-dd'
                                variant='standard'
                                size='medium'
                            />
                        </div>
                        <div>
                            <p style={{ color: '#696969' }}>Fecha final</p>
                            <TextField
                                required
                                value={fechas.fechaFinal}
                                onChange={(event) => handleChangeText(event, 'fechaFinal')}
                                margin='dense'
                                id='fechaFinal'
                                name='fechaFinal'
                                type='date'

                                format='yyyy-MM-dd'
                                variant='standard'
                                size='medium'
                            />
                        </div>
                    </div>
                </div>

                <Button variant='contained'
                    onClick={() => {
                        if (dayjs(fechas.fechaInicial).isAfter(dayjs(fechas.fechaFinal))) {
                            createToast(
                                'error',
                                'Error',
                                'La fecha inicial no puede ser mayor que la fecha final'
                            );
                            return;
                        }
                        handleConsultar(dayjs(fechas.fechaInicial).format('YYYY-MM-DD'), dayjs(fechas.fechaFinal).format('YYYY-MM-DD'))
                    }
                    }
                >Consultar</Button>
            </div>
            <br />
            <DataTable
                value={detalleVentas}
                //header={() => header('inv')}
                showGridlines
                stripedRows
                size='small'
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                scrollable
                columnResizeMode="expand"
                resizableColumns
            >
                <Column field="tipoVenta" header="Tipo Venta"></Column>
                <Column field="numFacRec" header="#Recibo/Factura"></Column>
                <Column field="paciente.nombre" header="Paciente"></Column>
                <Column field="fecha" header="Fecha Venta" body={(data) => dayjs(data.fecha).format('YYYY-MM-DD')}></Column>
                <Column field="cantPagos" header="Cant. Pagos"></Column>
                <Column header="Pagos realizados" body={(data) => data.detallePagos.length}></Column>
                <Column field="descuentoTotal" header="Descuento" body={(data) => formatearNumero(data.descuentoTotal)}></Column>
                <Column header="Credito" body={(data) => formatearNumero((data.total - data.acuenta))}></Column>
                <Column field="acuenta" header="Acuenta" body={(data) => formatearNumero(data.acuenta)}></Column>
                <Column field="total" header="Total" body={(data) => formatearNumero(data.total)}></Column>
            </DataTable>
        </>
    )
}
