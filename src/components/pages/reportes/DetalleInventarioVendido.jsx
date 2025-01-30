import React, { useRef, useState } from 'react'
import dayjs from 'dayjs';
import { Toast } from 'primereact/toast';
import { DataTable, Column, Tooltip, Button as ButtonPrime } from 'primereact';

import { Button, TextField } from '@mui/material';
import './DetalleInventarioVendidoStyle.css'
import { opticaControlApi } from '../../../services/opticaControlApi';
export const DetalleInventarioVendido = () => {
    const [fechas, setfechas] = useState({
        fechaInicial: dayjs().format('YYYY-MM-DD'),
        fechaFinal: dayjs().format('YYYY-MM-DD')
    });
    const [detalleVentas, setdetalleVentas] = useState({})
    const toast = useRef(null);

    const cols = [
        { field: 'descripcion', header: 'Descripcion' },
        { field: 'esfera', header: 'Esfera' },
        { field: 'cilindro', header: 'cilindro' },
        { field: 'adicion', header: 'Adición' },
        { field: 'tipoVenta', header: 'Tipo Venta' },
        { field: 'numFacRec', header: 'Fac/Rec' },
        { field: 'fecha', header: 'Fecha venta' },
        { field: 'cantidad', header: 'cantidad' },
        { field: 'linea', header: 'Linea' },
        { field: 'importe', header: 'Importe' },
        { field: 'valorGravado', header: 'Valor gravado' },
        { field: 'moda', header: 'Moda' },
        { field: 'material', header: 'Material' },
        { field: 'color', header: 'Color' },
        { field: 'diseno', header: 'Diseño' },
        { field: 'proveedor', header: 'proveedor' }
    ];

    const exportColumns = cols.map((col) => ({ title: col.header, dataKey: col.field }));

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

        opticaControlApi.get(`detalleVentas/detalleInventario/${localStorage.getItem('sucursalID')}/${inicio}/${fin}`)
            .then((response) => {
                    console.log(response);
                    setdetalleVentas(response.data);
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

    const exportPdf = (data, nameFile) => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default('l', 0, 0);

                doc.autoTable(exportColumns, data);
                doc.save(`${nameFile}.pdf`);
            });
        });
    };

    const exportExcel = (data, nameFile) => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(data);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });
            saveAsExcelFile(excelBuffer, nameFile);
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });
                module.default.saveAs(data, fileName + EXCEL_EXTENSION);
            }
        });
    };


    const header = (op) => {
        let datos = [];
        let nameFile = '';
        if (op === 'inv') {
            datos = detalleVentas.invExistente;
            nameFile = 'Inventario_existente'
        } else {
            datos = detalleVentas.invPedido;
            nameFile = 'Pedido_inventario'
        }
        return <div className="flex align-items-center justify-content-end gap-2">
            <ButtonPrime type="button" icon="pi pi-file-excel" severity="success" rounded onClick={() => exportExcel(datos, nameFile)} data-pr-tooltip="XLS" />
            <ButtonPrime type="button" icon="pi pi-file-pdf" severity="warning" rounded onClick={() => exportPdf(datos, nameFile)} data-pr-tooltip="PDF" />
        </div>
    }


    return (
        <>
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
            <h3>Inventario existente</h3>
            <div className="card">
                <Tooltip target=".export-buttons>button" position="bottom" />
                <DataTable
                    value={detalleVentas.invExistente}
                    header={() => header('inv')}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns                >
                    <Column field="descripcion" header="Descripcion"></Column>
                    <Column field="esfera" header="Esfera"></Column>
                    <Column field="cilindro" header="Cilindro"></Column>
                    <Column field="adicion" header="Adición"></Column>
                    <Column field="tipoVenta" header="Tipo venta" ></Column>
                    <Column field="numFacRec" header="Fac/Rec" ></Column>
                    <Column field="fecha" header="Fecha Venta" body={(data) => dayjs(data.fecha).format('YYYY-MM-DD')}></Column>
                    <Column field="cantidad" header="Cantidad"></Column>
                    <Column field="linea" header="Linea"></Column>
                    <Column field="importe" header="Importe"></Column>
                    <Column field="valorGravado" header="Gravado"></Column>
                    <Column field="moda" header="Moda" ></Column>
                    <Column field="material" header="Material"></Column>
                    <Column field="color" header="Color"></Column>
                    <Column field="diseno" header="Diseño"></Column>
                    <Column field="proveedor" header="Proveedor" ></Column>
                </DataTable>
            </div>
            <br />
            <h3>Pedido</h3>
            <div className="card">
                <Tooltip target=".export-buttons>button" position="bottom" />
                <DataTable
                    header={() => header('pedido')}
                    value={detalleVentas.invPedido}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    // filters={filters}
                    // filterDisplay='row'
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns                >
                    <Column field="descripcion" header="Descripcion"></Column>
                    <Column field="esfera" header="Esfera"></Column>
                    <Column field="cilindro" header="Cilindro"></Column>
                    <Column field="adicion" header="Adición"></Column>
                    <Column field="tipoVenta" header="Tipo venta" ></Column>
                    <Column field="numFacRec" header="Fac/Rec" ></Column>
                    <Column field="fecha" header="Fecha Venta" body={(data) => dayjs(data.fecha).format('YYYY-MM-DD')}></Column>
                    <Column field="cantidad" header="Cantidad"></Column>
                    <Column field="linea" header="Linea"></Column>
                    <Column field="importe" header="Importe"></Column>
                    <Column field="valorGravado" header="Gravado"></Column>
                    <Column field="moda" header="Moda" ></Column>
                    <Column field="material" header="Material"></Column>
                    <Column field="color" header="Color"></Column>
                    <Column field="diseno" header="Diseño"></Column>
                    <Column field="proveedor" header="Proveedor" ></Column>
                </DataTable>
            </div>
        </>
    )
}
