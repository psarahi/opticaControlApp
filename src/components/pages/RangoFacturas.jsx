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
    const correlativoJSON = {
        numCorrelativo: 0,
        sucursales: localStorage.getItem('sucursalID'),
        nombre: ''
    };
    let idFactura = '';
    let idCorrelativo = '';
    const [listFacturas, setListFacturas] = useState([]);
    const [listCorrelativo, setListCorrelativo] = useState([]);
    const [formFactura, setFormFactura] = useState(facturaJSON);
    const [formCorrelativo, setFormCorrelativo] = useState(correlativoJSON);
    const [facturaSelected, setfacturaSelected] = useState('');
    const [correlativoSelected, setCorrelativoSelected] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogCorrelativo, setOpenDialogCorrelativo] = useState(false);

    useEffect(() => {
        const sucursal = localStorage.getItem('sucursalID');
        opticaControlApi.get(`facturas/bySucursal/${sucursal}`, '').then((response) => {
            setListFacturas(response.data);
        })
        opticaControlApi.get(`correlativo/bySucursal/${sucursal}`, '').then((response) => {
            setListCorrelativo(response.data);
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

    const renderEditButtonCorrelativo = () => {
        return <EditIcon color='primary' fontSize='medium' />
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };
    const handleOpenDialogCorrelativo = () => {
        setOpenDialogCorrelativo(true);
    };

    const handleCloseDialog = () => {
        cleanForm();
        setOpenDialog(false);
    };

    const handleCloseDialogCorrelativo = () => {
        cleanFormCorrelativo();
        setOpenDialogCorrelativo(false);
    };


    const cleanFormCorrelativo = () => {
        setFormCorrelativo(correlativoJSON);
        setCorrelativoSelected('');
        idCorrelativo = '';
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

    const renderDeleteButtonCorrelativo = () => {
        return <CancelIcon color='error' fontSize='medium' />
    };

    const rendeEstado = (data) => {
        if (data.estado === true) {
            return <Tag severity="success" value="Activo"></Tag>
        } else {
            return <Tag severity="danger" value="Inactivo"></Tag>
        }
    }

    const onCellSelectFactura = (event) => {
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

    const onCellSelectCorrelativos = (event) => {
        idCorrelativo = event.rowData._id;
        setCorrelativoSelected(event.rowData._id);

        setFormCorrelativo({
            numCorrelativo: event.rowData.numCorrelativo,
            nombre: event.rowData.nombre,
            sucursales: event.rowData.sucursales,
        });
        if (event.cellIndex === 0) {
            handleEditCorrelativo();
        } else if (event.cellIndex === 1) {
            handleDelete();
        }
    };

    const handleDelete = () => {
        confirmDialog({
            message: `¿Desea eliminar este registro? `,
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: deleteCorrelativo,
            reject: rejectDialogDelete
        });
    };

    const deleteCorrelativo = () => {
        if (textValidator(idCorrelativo)) {
            opticaControlApi.delete(`correlativo/${idCorrelativo}`)
                .then((response) => {
                    if (response.status === 200) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro ha sido eliminado'
                        );
                        setListCorrelativo(
                            listCorrelativo.filter(i => i._id !== idCorrelativo)
                        );
                        cleanFormCorrelativo();
                    }
                })
                .catch((err) => {
                    createToast(
                        'error',
                        'Error',
                        'Ha ocurrido un error al intentar eliminar el registro'
                    );
                    console.log(err);
                    handleCloseDialogCorrelativo();
                    cleanFormCorrelativo();
                });
        } else {
            createToast(
                'warn',
                'Acción requerida',
                'No se seleccionó el correlativo correctamente'
            );
        }
    }

    const rejectDialogDelete = () => {
        createToast(
            'warn',
            'Cancelado',
            'Acción cancelada'
        );
    }

    const handleEdit = () => {
        handleOpenDialog();
    };
    const handleEditCorrelativo = () => {
        handleOpenDialogCorrelativo();
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
                        cleanForm();
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
                        cleanForm();
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

    const handleChangeTextCorrelativo = ({ target }, select) => {
        setFormCorrelativo({
            ...formCorrelativo,
            [select]: target.value
        })
    };

    const rowClass = (data) => {
        return {
            'bg-green-100': data.estado === true,
            'bg-red-100': data.estado === false,
        }
    };

    return (
        <>
            <h1>Informacion sobre facturas / Recibo </h1>
            <Toast ref={toast} />
            <ConfirmDialog />
            <h2>Facturas</h2>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialog}>Agregar</Button>
            <div style={{ width: '80%' }}>
                <DataTable value={listFacturas}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={5}
                    rowClassName={rowClass}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    selectionMode="single"
                    selection={facturaSelected}
                    cellSelection
                    onCellSelect={onCellSelectFactura}
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
                maxWidth="md"
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
                        <TextField
                            value={formFactura.ultimaUtilizada}
                            onChange={(event) => handleChangeText(event, 'ultimaUtilizada')}
                            margin="dense"
                            id="ultimaUtilizada"
                            name="ultimaUtilizada"
                            label="Ultima Utilizada"
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
            <h2>Correlativos</h2>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialogCorrelativo}>Agregar</Button>
            <div style={{ width: '55%' }}>
                <DataTable value={listCorrelativo}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    selectionMode="single"
                    selection={correlativoSelected}
                    cellSelection
                    onCellSelect={onCellSelectCorrelativos}
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns                >
                    <Column body={renderEditButtonCorrelativo} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderDeleteButtonCorrelativo} style={{ textAlign: 'center' }}></Column>
                    <Column field="numCorrelativo" header="Ultimo utilizado"></Column>
                    <Column field="nombre" header="Nombre"></Column>
                </DataTable>
            </div>
            <Dialog
                open={openDialogCorrelativo}
                disableEscapeKeyDown={true}
                maxWidth="sm"
                fullWidth={true}
                onClose={handleCloseDialogCorrelativo}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        if (!textValidator(formCorrelativo.nombre) && !textValidator(formCorrelativo.numCorrelativo)) {
                            createToast(
                                'warn',
                                'Acción requerida',
                                'Favor ingrese los datos necesarios'
                            );
                            return;
                        }
                        if (textValidator(correlativoSelected)) {
                            opticaControlApi.put(`correlativo/${correlativoSelected}`, formCorrelativo)
                                .then((response) => {
                                    if (response.status === 202) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue editado correctamente'
                                        );
                                        handleCloseDialogCorrelativo();
                                        setListCorrelativo(
                                            listCorrelativo.map((i) =>
                                                i._id === correlativoSelected ? { ...i, ...formCorrelativo } : i
                                            )
                                        );
                                        cleanFormCorrelativo();
                                    }
                                })
                                .catch((err) => {
                                    createToast(
                                        'error',
                                        'Error',
                                        'Ha ocurrido un error'
                                    );
                                    console.log(err);
                                    handleCloseDialogCorrelativo();
                                    cleanFormCorrelativo();
                                });
                        } else {
                            opticaControlApi.post('correlativo', formCorrelativo)
                                .then((response) => {
                                    if (response.status === 201) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue creado correctamente'
                                        );
                                        handleCloseDialogCorrelativo();
                                        setListCorrelativo([...listCorrelativo, response.data]);
                                        cleanFormCorrelativo();
                                    }
                                })
                                .catch((err) => {
                                    createToast(
                                        'error',
                                        'Error',
                                        'Ha ocurrido un error'
                                    );
                                    console.log(err);
                                    handleCloseDialogCorrelativo();
                                    cleanFormCorrelativo();
                                });
                        }
                    },
                }}
            >
                <DialogTitle>Datos sobre correlativo</DialogTitle>
                <DialogContent                 >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '30px',
                        marginBottom: '2%'
                    }}>
                        <TextField
                            required
                            value={formCorrelativo.nombre}
                            onChange={(event) => handleChangeTextCorrelativo(event, 'nombre')}
                            margin="dense"
                            id="nombre"
                            name="nombre"
                            label="Nombre"
                            sx={{ width: "70%" }}
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formCorrelativo.numCorrelativo}
                            onChange={(event) => handleChangeTextCorrelativo(event, 'numCorrelativo')}
                            margin="dense"
                            id="numCorrelativo"
                            name="numCorrelativo"
                            label="#Correlativo"
                            sx={{ width: "70%" }}
                            variant="standard"
                            size="medium"
                        />
                    </div>
                    <br />
                    <br />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogCorrelativo} >Cancelar</Button>
                    <Button variant='contained' type="submit">Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
