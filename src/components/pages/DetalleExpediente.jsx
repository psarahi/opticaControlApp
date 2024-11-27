import React, { useEffect, useState, useRef } from 'react';

import { Toast, DataTable, Column, FilterMatchMode, TabView, TabPanel } from 'primereact';
import AssignmentIcon from '@mui/icons-material/Assignment';
import dayjs from 'dayjs';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { appointmentApi } from '../../services/appointmentApi';

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle
}
    from '@mui/material';

//import './.css';
import logoOptica from '../../assets/logoOptica.png';
import transportador from '../../assets/transportador.jpg';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const DetalleExpediente = () => {
    const [listPaciente, setListPaciente] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [listDetalleExpediente, setListDetalleExpediente] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedVenta, setselectedVenta] = useState('');
    const [ventasDetalle, setventasDetalle] = useState([]);
    const [ventaView, setventaView] = useState([]);
    const toast = useRef(null);
    const pdfRef = useRef(null);

    useEffect(() => {
        appointmentApi.get('expediente/pacientes', '').then((response) => {
            setListPaciente(response.data);
        });

    }, []);

    const [filters] = useState({
        nombre: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    });

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };


    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const onCellSelect = (e) => {
        if (e.cellIndex === 1) {
            appointmentApi.get(`expediente/pacienteExpediente/${e.rowData.paciente._id}`, '')
                .then((response) => {
                    console.log(response.data);
                    setListDetalleExpediente(response.data.expedientes);
                    setventasDetalle(response.data.ventas);
                    //setventaView(response.data[0]);
                });
        }
    }

    const renderVerVentas = () => {
        return (
            <AssignmentIcon color='primary' fontSize='medium' />
        );
    };

    const handleTabChange = (e) => {
        console.log(e);
        setActiveIndex(e.index);
        //setventaView(listDetalleExpediente[e.index]);
        console.log(listDetalleExpediente[e.index]);

    };

    const renderPDF = (paciente) => {
        const doc = new jsPDF('p', 'mm', 'letter', true);
        const content = document.getElementById('pdfPrint');

        html2canvas(content, {
            onclone: document =>{
                document.getElementById('pdfPrint');
            }
        }).then((canva) => {
            const imgData = canva.toDataURL('image/png');
            const width = doc.internal.pageSize.width;
            doc.addImage(imgData, 'PNG', 5, 0, width, 0);
            doc.save(`Exp_${paciente}.pdf`);
        });
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
                            listDetalleExpediente.map((detalle) => {
                                return (
                                    <TabPanel
                                        header={dayjs(detalle.fecha).format('YYYY-MM-DD')}
                                        key={detalle._id}
                                    >
                                        <Button
                                            variant='contained'
                                            color='error'
                                            id={detalle.paciente.nombre}
                                            onClick={(e) => {
                                                renderPDF(e.target.id);
                                            }}
                                            startIcon={<PictureAsPdfIcon />}
                                        >PDF</Button>
                                        <div id="pdfPrint" style={{padding: '0% 10% 0% 5%'}}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <img src={logoOptica} />
                                                <p style={{ fontSize: '20px' }}>
                                                    <span style={{ fontWeight: 500 }}>Fecha: </span>
                                                    <span style={{ fontWeight: 200 }}>{dayjs(detalle.fecha).format('YYYY-MM-DD')}</span>
                                                </p>
                                            </div>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Paciente: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.paciente.nombre}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Edad: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.paciente.edad}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Sucursal: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.optometrista.sucursales.nombre}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Dirección: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.optometrista.sucursales.direccion}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Dirección: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.paciente.telefono}</span>
                                            </p>
                                            <h2 style={{ textAlign: 'center' }}>Diagnóstico Visual</h2>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }}>
                                                    <img src={transportador} style={{ width: '50%' }} />
                                                    <p>{detalle.recetaOjoIzquierdo.agudezaVisual}</p>
                                                    <p>Dip. {detalle.recetaOjoIzquierdo.distanciaPupilar}</p>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }}>
                                                    <img src={transportador} style={{ width: '50%' }} />
                                                    <p>{detalle.recetaOjoDerecho.agudezaVisual}</p>
                                                    <p>Dip. {detalle.recetaOjoDerecho.distanciaPupilar}</p>
                                                </div>
                                            </div>
                                            <h2 style={{ textAlign: 'center' }}>Pruebas y valoraciones</h2>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Optometrista: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.optometrista.nombre}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Observaciones: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.observaciones}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Antecentes: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.antecedentes}</span>
                                            </p>
                                            <p style={{ fontSize: '20px' }}>
                                                <span style={{ fontWeight: 500 }}>Pruebas y valoraciones: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.pruebasValoraciones}</span>
                                            </p>
                                            <br />
                                            <hr />
                                            <p>Dirección {detalle.optometrista.sucursales.direccion}</p>
                                            <p>Telefono {detalle.optometrista.sucursales.telefono} {detalle.optometrista.sucursales.celular} {detalle.optometrista.sucursales.email} </p>
                                            <p>{detalle.optometrista.sucursales.paginaDigital}</p>
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
                    </div>
                </DialogActions>
            </Dialog>
        </>
    )
}
