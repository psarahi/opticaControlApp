import React, { useEffect, useState, useRef } from 'react';

import { Toast, DataTable, Column, FilterMatchMode, TabView, TabPanel } from 'primereact';
import AssignmentIcon from '@mui/icons-material/Assignment';
import dayjs from 'dayjs';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { appointmentApi } from '../../services/appointmentApi';

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
    Button
}
    from '@mui/material';

import './DetalleExpedienteStyle.css';
import logoOptica from '../../assets/logoOptica.png';
import transportador from '../../assets/transportador.jpg';
import qrWhatsApp from '../../assets/qrWhatsApp.jpeg';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



export const DetalleExpediente = () => {
    const [listPaciente, setListPaciente] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [listDetalleExpediente, setListDetalleExpediente] = useState([]);
    const toast = useRef(null);
    

    useEffect(() => {
        appointmentApi.get('expediente/pacientes', '').then((response) => {
            setListPaciente(response.data);
        });

    }, []);

    const [filters] = useState({
        nombre: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    });

    const onCellSelect = (e) => {
        if (e.cellIndex === 1) {
            appointmentApi.get(`expediente/pacienteExpediente/${e.rowData.paciente._id}`, '')
                .then((response) => {
                    console.log(response.data);
                    setListDetalleExpediente(response.data.expedientes);
                });
        }
    }

    const renderVer = () => {
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
            onclone: document => {
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
            <h1>Información sobre recetas </h1>
            <br />
            <Toast ref={toast} />
            <div style={{
                display: 'flex',
                gap: '14px',
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
                        <Column body={renderVer} bodyStyle={{ textAlign: 'center' }}></Column>
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
                                        <div id="pdfPrint" style={{ padding: '2% 10% 0% 5%' }}>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 0.2fr',
                                                gridTemplateRows: '1fr',
                                                gap: '0px 10px',
                                                gridTemplateAreas: ". ."
                                            }}>
                                                <div>
                                                    <img src={logoOptica} alt='Logo'/>
                                                    <p className='texto'>
                                                        <span style={{ fontWeight: 500 }}>Paciente: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.paciente.nombre}</span>
                                                        <span style={{ fontWeight: 500 }}> Edad: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.paciente.edad}</span>
                                                        <span style={{ fontWeight: 500 }}> Telefono: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.paciente.telefono}</span>
                                                    </p>
                                                    <p className='texto'>
                                                        <span style={{ fontWeight: 500 }}>Dirección: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.optometrista.sucursales.direccion}</span>
                                                    </p>
                                                    <p className='texto'>
                                                        <span style={{ fontWeight: 500 }}>Fecha: </span>
                                                        <span style={{ fontWeight: 200 }}>{dayjs(detalle.fecha).format('YYYY-MM-DD')}</span>
                                                    </p>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}>
                                                    <img src={qrWhatsApp} style={{ width: '100%' }} alt='qr'/>
                                                </div>
                                            </div>
                                            <h4 style={{ textAlign: 'center', margin: '0%' }}>Diagnóstico Visual</h4>
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
                                                    <h4 style={{ margin: '0%' }}>Ojo Derecho</h4>
                                                    <img src={transportador} style={{ width: '50%' }} alt='transportador'/>
                                                    <p className='textoPequeño'>{detalle.recetaOjoDerecho.agudezaVisual}</p>
                                                    <p className='textoPequeño'>Dip. {detalle.recetaOjoDerecho.distanciaPupilar}</p>
                                                    <p className='textoPequeño'>{detalle.recetaOjoDerecho.esfera} {detalle.recetaOjoDerecho.cilindro} {detalle.recetaOjoDerecho.eje} {detalle.recetaOjoDerecho.adicion}</p>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }}>
                                                    <h4 style={{ margin: '0%' }}>Ojo Izquierdo</h4>
                                                    <img src={transportador} style={{ width: '50%' }} alt='transportador'/>
                                                    <p className='textoPequeño'>A. V. {detalle.recetaOjoIzquierdo.agudezaVisual}</p>
                                                    <p className='textoPequeño'>Dip. {detalle.recetaOjoIzquierdo.distanciaPupilar}</p>
                                                    <p className='textoPequeño'>{detalle.recetaOjoIzquierdo.esfera} {detalle.recetaOjoIzquierdo.cilindro} {detalle.recetaOjoIzquierdo.eje} {detalle.recetaOjoIzquierdo.adicion} </p>
                                                </div>
                                            </div>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Tipo de lente: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.tipoLente}</span>
                                            </p>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Protección: </span>
                                                {
                                                    detalle.proteccion.map(p => {
                                                        return <span style={{ fontWeight: 200 }}>{p}. </span>
                                                    })
                                                }

                                            </p>
                                            <h4 style={{ textAlign: 'center', margin: '0%' }}>Pruebas y valoraciones</h4>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Optometrista: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.optometrista.nombre}</span>
                                            </p>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Observaciones: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.observaciones}</span>
                                            </p>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Antecentes: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.antecedentes}</span>
                                            </p>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Pruebas y valoraciones: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.pruebasValoraciones}</span>
                                            </p>
                                            <hr />
                                            <div>
                                                <p className='textoPequeño'>Sucursal {detalle.optometrista.sucursales.nombre} Dirección {detalle.optometrista.sucursales.direccion}</p>
                                                <p className='textoPequeño'>Telefono {detalle.optometrista.sucursales.telefono} {detalle.optometrista.sucursales.celular} {detalle.optometrista.sucursales.email} </p>
                                                <p className='textoPequeño'>{detalle.optometrista.sucursales.paginaDigital}</p>
                                                <br />
                                            </div>





                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 0.2fr',
                                                gridTemplateRows: '1fr',
                                                gap: '0px 10px',
                                                gridTemplateAreas: ". ."
                                            }}>
                                                <div>
                                                    <img src={logoOptica} alt='logo'/>
                                                    <p className='texto'>
                                                        <span style={{ fontWeight: 500 }}>Paciente: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.paciente.nombre}</span>
                                                        <span style={{ fontWeight: 500 }}> Edad: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.paciente.edad}</span>
                                                        <span style={{ fontWeight: 500 }}> Telefono: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.paciente.telefono}</span>
                                                    </p>
                                                    <p className='texto'>
                                                        <span style={{ fontWeight: 500 }}>Dirección: </span>
                                                        <span style={{ fontWeight: 200 }}>{detalle.optometrista.sucursales.direccion}</span>
                                                    </p>
                                                    <p className='texto'>
                                                        <span style={{ fontWeight: 500 }}>Fecha: </span>
                                                        <span style={{ fontWeight: 200 }}>{dayjs(detalle.fecha).format('YYYY-MM-DD')}</span>
                                                    </p>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}>
                                                    <img src={qrWhatsApp} style={{ width: '100%' }} alt='qr'/>
                                                </div>
                                            </div>
                                            <h4 style={{ textAlign: 'center', margin: '0%' }}>Diagnóstico Visual</h4>
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
                                                    <h4 style={{ margin: '0%' }}>Ojo Derecho</h4>
                                                    <img src={transportador} style={{ width: '50%' }} alt='transportador'/>
                                                    <p className='textoPequeño'>{detalle.recetaOjoDerecho.agudezaVisual}</p>
                                                    <p className='textoPequeño'>Dip. {detalle.recetaOjoDerecho.distanciaPupilar}</p>
                                                    <p className='textoPequeño'>{detalle.recetaOjoDerecho.esfera} {detalle.recetaOjoDerecho.cilindro} {detalle.recetaOjoDerecho.eje} {detalle.recetaOjoDerecho.adicion}</p>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }}>
                                                    <h4 style={{ margin: '0%' }}>Ojo Izquierdo</h4>
                                                    <img src={transportador} style={{ width: '50%' }} alt='transportador'/>
                                                    <p className='textoPequeño'>A. V. {detalle.recetaOjoIzquierdo.agudezaVisual}</p>
                                                    <p className='textoPequeño'>Dip. {detalle.recetaOjoIzquierdo.distanciaPupilar}</p>
                                                    <p className='textoPequeño'>{detalle.recetaOjoIzquierdo.esfera} {detalle.recetaOjoIzquierdo.cilindro} {detalle.recetaOjoIzquierdo.eje} {detalle.recetaOjoIzquierdo.adicion} </p>
                                                </div>
                                            </div>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Tipo de lente: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.tipoLente}</span>
                                            </p>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Protección: </span>
                                                {
                                                    detalle.proteccion.map(p => {
                                                        return <span style={{ fontWeight: 200 }}>{p}. </span>
                                                    })
                                                }

                                            </p>
                                            <h4 style={{ textAlign: 'center', margin: '0%' }}>Pruebas y valoraciones</h4>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Optometrista: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.optometrista.nombre}</span>
                                            </p>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Observaciones: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.observaciones}</span>
                                            </p>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Antecentes: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.antecedentes}</span>
                                            </p>
                                            <p className='texto'>
                                                <span style={{ fontWeight: 500 }}>Pruebas y valoraciones: </span>
                                                <span style={{ fontWeight: 200 }}>{detalle.pruebasValoraciones}</span>
                                            </p>
                                            <hr />
                                            <div>
                                                <p className='textoPequeño'>Sucursal {detalle.optometrista.sucursales.nombre} Dirección {detalle.optometrista.sucursales.direccion}</p>
                                                <p className='textoPequeño'>Telefono {detalle.optometrista.sucursales.telefono} {detalle.optometrista.sucursales.celular} {detalle.optometrista.sucursales.email} </p>
                                                <p className='textoPequeño'>{detalle.optometrista.sucursales.paginaDigital}</p>
                                                <br />
                                            </div>






                                        </div>

                                    </TabPanel>
                                )
                            })
                        }
                    </TabView>
                </div>
            </div>
        </>
    )
}
