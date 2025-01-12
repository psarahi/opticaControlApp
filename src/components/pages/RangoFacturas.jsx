import React, { useEffect, useState, useRef } from 'react'

import AddIcon from '@mui/icons-material/Add';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable, Column, Tag } from 'primereact';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';

import dayjs from 'dayjs';

import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField
}
    from '@mui/material';

import { opticaControlApi } from '../../services/opticaControlApi';
import { textValidator } from '../../helpers/validator';
import { formatearFecha } from '../../helpers/formato';

export const RangoFacturas = () => {
    const facturaJSON = {
        desde: '',
        hasta: '',
        fechaLimiteEmision: dayjs().format('YYYY-MM-DD'),
        sucursales: localStorage.getItem('sucursalID'),
        ultimaUtilizada: '',
        estado: true
    }
    let idFactura = '';
    const [listFacturas, setListFacturas] = useState([]);
    const [formFactura, setFormFactura] = useState(facturaJSON);
    const [facturaSelected, setfacturaSelected] = useState('');
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const sucursal = localStorage.getItem('sucursalID');
        opticaControlApi.get(`facturas/bySucursal/${sucursal}`, '').then((response) => {
            setListFacturas(response.data);
        })
        cleanForm();
    }, [])

    const toast = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const renderEditButton = (data) => {
        if (data.estado === true) {
            return <EditIcon color='primary' fontSize='medium' />
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        cleanForm();
        setOpenDialog(false);
    };

    const cleanForm = () => {
        setFormFactura(facturaJSON);
        setfacturaSelected('');
        idFactura = '';
    };

    const renderChangeStatus = (data) => {
        if (data.estado === false) {
            return <DoneIcon color='success' fontSize='medium' />
        }
    };

    const renderDeleteButton = (data) => {
        if (data.estado !== false) {
            return <CancelIcon color='error' fontSize='medium' />
        }
    };

    const rowClass = (data) => {
        return {
            'bg-green-100': data.estado === true,
            'bg-red-100': data.estado === false,
        }
    };

    const rendeEstado = (data) => {
        if (data.estado === true) {
            return <Tag severity="success" value="Activo"></Tag>
        } else {
            return <Tag severity="danger" value="Inactivo"></Tag>
        }
    }

    const onCellSelect = (event) => {
        idFactura = event.rowData._id;
        setfacturaSelected(event.rowData._id);

        setFormFactura({
            desde: event.rowData.desde,
            hasta: event.rowData.hasta,
            fechaLimiteEmision: formatearFecha(event.rowData.fechaLimiteEmision),
            sucursales: event.rowData.sucursales,
            ultimaUtilizada: event.rowData.ultimaUtilizada,
            estado: event.rowData.estado,
        });
        if (event.cellIndex === 0) {
            handleEdit();
        } else if (event.cellIndex === 1) {
            handleDisable();
        } else if (event.cellIndex === 2) {
            handleEnable();
        }
    };

    const handleEdit = () => {
        handleOpenDialog();
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
        if (textValidator(idFactura)) {
            opticaControlApi.put(`facturas/cambiarEstado/${idFactura}`, { estado: false })
                .then((response) => {
                    if (response.status === 200) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido deshabilitado'
                        );

                        setListFacturas(
                            listFacturas.map(i =>
                                i._id === idFactura ? {
                                    ...i,
                                    estado: response.data.estado
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
                        'Ha ocurrido un error al intentar deshabilitar el registro'
                    );
                    console.log(err);
                    handleCloseDialog();
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
            message: `¿Desea habilitar el registro? `,
            header: 'Habilitar',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: acceptDialogEnable,
            reject: rejectDialogEnable
        });
    };

    const acceptDialogEnable = () => {
        if (textValidator(idFactura)) {
            opticaControlApi.put(`facturas/cambiarEstado/${idFactura}`, { estado: true })
                .then((response) => {
                    if (response.status === 200) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido deshabilitado'
                        );
                        setListFacturas(
                            listFacturas.map(i =>
                                i._id === idFactura ? {
                                    ...i,
                                    estado: response.data.estado
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
                        'Ha ocurrido un error al intentar habilitar el registro'
                    );
                    console.log(err);
                    handleCloseDialog();
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

    const handleChangeText = ({ target }, select) => {
        setFormFactura({
            ...formFactura,
            [select]: target.value
        })
    };

    return (
        <>
            <h1>Informacion sobre facturas </h1>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialog}>Agregar</Button>
            <br />
            <br />
            <Toast ref={toast} />
            <ConfirmDialog />

            <div style={{ width: '65%' }}>
                <DataTable value={listFacturas}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    rowClassName={rowClass}
                    // filters={filters}
                    // filterDisplay='row'
                    selectionMode="single"
                    selection={facturaSelected}
                    cellSelection
                    onCellSelect={onCellSelect}
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns                >
                    <Column body={renderEditButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderChangeStatus} style={{ textAlign: 'center' }}></Column>
                    <Column field="desde" header="Desde"></Column>
                    <Column field="hasta" header="Hasta"></Column>
                    <Column field="ultimaUtilizada" header="Ultima utilizada"></Column>
                    <Column field="fechaLimiteEmision" header="Fecha Limite" body={(data) => formatearFecha(data.fechaLimiteEmision)}></Column>
                    <Column field="estado" header="Estado" body={rendeEstado}></Column>
                </DataTable>
            </div>
            <Dialog
                open={openDialog}
                disableEscapeKeyDown={true}
                maxWidth="sm"
                fullWidth={true}
                onClose={handleCloseDialog}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        if (!textValidator(formFactura.desde) && !textValidator(formFactura.hasta) && !textValidator(formFactura.fechaLimiteEmision)) {
                            createToast(
                                'warn',
                                'Acción requerida',
                                'Favor ingrese los datos necesarios'
                            );
                            return;
                        }
                        if (textValidator(facturaSelected)) {
                            opticaControlApi.put(`facturas/${facturaSelected}`, formFactura)
                                .then((response) => {
                                    if (response.status === 202) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue editado correctamente'
                                        );
                                        handleCloseDialog();
                                        setListFacturas(
                                            listFacturas.map((i) =>
                                                i._id === facturaSelected ? { ...i, ...formFactura } : i
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
                                        'Ha ocurrido un error'
                                    );
                                    console.log(err);
                                    handleCloseDialog();
                                    cleanForm();
                                });
                        } else {
                            opticaControlApi.post('facturas', formFactura)
                                .then((response) => {
                                    if (response.status === 201) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue creado correctamente'
                                        );
                                        handleCloseDialog();
                                        setListFacturas([...listFacturas, response.data]);
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
                                        'Ha ocurrido un error'
                                    );
                                    console.log(err);
                                    handleCloseDialog();
                                    cleanForm();
                                });
                        }
                    },
                }}
            >
                <DialogTitle>Datos sobre factura</DialogTitle>
                <DialogContent                 >
                    <p style={{
                        textAlign: 'center',
                        fontWeight: '100',
                        fontSize: '22px'
                    }}>Rango autorizado</p>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '30px',
                        marginBottom: '2%'
                    }}>
                        <TextField
                            required
                            value={formFactura.desde}
                            onChange={(event) => handleChangeText(event, 'desde')}
                            margin="dense"
                            id="desde"
                            name="desde"
                            label="Desde"
                            sx={{ width: "70%" }}
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formFactura.hasta}
                            onChange={(event) => handleChangeText(event, 'hasta')}
                            margin="dense"
                            id="hasta"
                            name="hasta"
                            label="Hasta"
                            sx={{ width: "70%" }}
                            variant="standard"
                            size="medium"
                        />
                    </div>
                    <div>
                        <p style={{ color: '#696969' }}>Fecha limite emisión</p>
                        <TextField
                            required
                            value={formFactura.fechaLimiteEmision}
                            onChange={(event) => handleChangeText(event, 'fechaLimiteEmision')}
                            margin="dense"
                            id="fechaLimiteEmision"
                            name="fechaLimiteEmision"
                            type="date"
                            format="yyyy-MM-dd"
                            sx={{ width: "30%" }}
                            variant="standard"
                            size="medium"
                        />
               
                    </div>
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
