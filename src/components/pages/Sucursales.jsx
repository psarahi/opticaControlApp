import React, { useState, useRef, useEffect } from 'react'
import {
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    TextField,
}
    from '@mui/material';
import { DataTable, Column } from 'primereact';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

import { opticaControlApi } from '../../services/opticaControlApi';
import '../../auth/CrearSucursalStyle.css'
import { textValidator } from '../../helpers/validator';
export const Sucursales = () => {
    const sucursalJSON = {
        nombre: '',
        direccion: '',
        telefono: '',
        celular: '',
        email: '',
        cai: '',
        paginaDigital: '',
        rtn: '',
        mensajeFactura: ''
    }
    let idSucursal = '';
    const [formSucursal, setFormSucursal] = useState(sucursalJSON);
    const [listSurcursales, setListSucursales] = useState([]);
    const [sucursalSelected, setSucursalSelected] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const toast = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };
    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const sucursal = localStorage.getItem('sucursalID');
                const response = await opticaControlApi.get('sucursal', {
                    params: {
                        sucursalId: sucursal
                    }
                }
                );
                setListSucursales(response.data);
            } catch (error) {
                console.error('Error fetching sucursales:', error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 });
            }
        };

        fetchSucursales();
    }, []);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        cleanForm();
        setOpenDialog(false);
    };

    const renderEditButton = (data) => {
        return <EditIcon color='primary' fontSize='medium' />
    };

    const renderDeleteButton = (data) => {
        return <CancelIcon color='error' fontSize='medium' />
    };

    const cleanForm = () => {
        setFormSucursal(sucursalJSON);
        setSucursalSelected('');
        idSucursal = '';
    };

    const handleChangeText = ({ target }, select) => {
        setFormSucursal({
            ...formSucursal,
            [select]: target.value || ''
        })
    };

    const handleEdit = () => {
        handleOpenDialog();
    };

    const handleDelete = () => {
        confirmDialog({
            message: `¿Desea eliminar este registro? `,
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: deleteSucursal,
            reject: rejectDialogDelete
        });
    };

    const deleteSucursal = () => {
        if (textValidator(idSucursal)) {
            opticaControlApi.delete(`sucursal/${idSucursal}`)
                .then((response) => {
                    if (response.status === 200) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro ha sido eliminado'
                        );
                        setListSucursales(
                            listSurcursales.filter(i => i._id !== idSucursal)
                        );
                        cleanForm();
                    }
                })
                .catch((err) => {
                    createToast(
                        'error',
                        'Error',
                        'Ha ocurrido un error al intentar eliminar el registro'
                    );
                    console.log(err);
                    handleCloseDialog();
                    cleanForm();
                });
        } else {
            createToast(
                'warn',
                'Acción requerida',
                'No se seleccionó la sucursal correctamente'
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

    const onCellSelect = (event) => {
        setSucursalSelected(event.rowData._id);
        idSucursal = event.rowData._id;
        setFormSucursal({
            nombre: event.rowData.nombre,
            direccion: event.rowData.direccion,
            telefono: event.rowData.telefono,
            celular: event.rowData.celular,
            email: event.rowData.email,
            cai: event.rowData.cai,
            paginaDigital: event.rowData.paginaDigital,
            rtn: event.rowData.rtn,
            mensajeFactura: event.rowData.mensajeFactura,
        });
        if (event.cellIndex === 0) {
            handleEdit();
        } else if (event.cellIndex === 1) {
            handleDelete();
        }
    };

    return (
        <>
            <h1>Sucursales</h1>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialog}>Agregar</Button>
            <br />
            <br />
            <Toast ref={toast} />
            <ConfirmDialog />
            <div style={{ width: '95%' }}>
                <DataTable value={listSurcursales} tableStyle={{ minWidth: '50rem' }}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    selection={sucursalSelected}
                    selectionMode="single"
                    cellSelection
                    onCellSelect={onCellSelect}
                >
                    <Column body={renderEditButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
                    <Column field="nombre" header="Nombre" style={{ minWidth: '18rem' }}></Column>
                    <Column field="direccion" header="Direccion"  style={{ minWidth: '25rem' }}></Column>
                    <Column field="email" header="Correo"></Column>
                    <Column field="celular" header="Celular"></Column>
                    <Column field="telefono" header="Telefono"></Column>
                    <Column field="paginaDigital" header="Sitio Web"></Column>
                    <Column field="rtn" header="RTN"></Column>
                    <Column field="mensajeFactura" header="Mensaje factura" style={{ minWidth: '25rem' }}></Column>
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
                        if (!textValidator(formSucursal.nombre) ||
                            !textValidator(formSucursal.direccion) ||
                            !textValidator(formSucursal.telefono) ||
                            !textValidator(formSucursal.email) ||
                            !textValidator(formSucursal.cai) ||
                            !textValidator(formSucursal.rtn) ||
                            !textValidator(formSucursal.mensajeFactura)
                        ) {

                            createToast(
                                'warn',
                                'Acción requerida',
                                'Por favor ingrese sus datos'
                            );
                            return;
                        }
                        if (textValidator(sucursalSelected)) {
                            opticaControlApi.put(`sucursal/${sucursalSelected}`, formSucursal)
                                .then((response) => {
                                    if (response.status === 202) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue editado correctamente'
                                        );
                                        handleCloseDialog();
                                        setListSucursales(
                                            listSurcursales.map((i) =>
                                                i._id === sucursalSelected ? { ...i, ...response.data } : i
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
                            opticaControlApi.post('sucursal', formSucursal)
                                .then(async (response) => {
                                    if (response.status === 201) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro a sido creado'
                                        );
                                        cleanForm();
                                        setListSucursales([...listSurcursales, response.data])
                                        handleCloseDialog();
                                    }
                                })
                                .catch((err) => {
                                    createToast(
                                        'error',
                                        'Error',
                                        err.response?.data || 'Error desconocido',
                                    );
                                    console.log(err);
                                    cleanForm();
                                });
                        }
                    },
                }}
            >
                <DialogTitle>Datos sobre la sucursal</DialogTitle>
                <DialogContent              >
                    <div className='container'>
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="nombre"
                            label="Nombre"
                            name="nombre"
                            value={formSucursal.nombre}
                            onChange={(event) => handleChangeText(event, 'nombre')}
                            variant='standard'
                        />
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="direccion"
                            label="Direccion"
                            name="direccion"
                            value={formSucursal.direccion}
                            onChange={(event) => handleChangeText(event, 'direccion')}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            id="telefono"
                            label="Telefono"
                            name="telefono"
                            value={formSucursal.telefono}
                            onChange={(event) => handleChangeText(event, 'telefono')}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            id="celular"
                            label="Celular"
                            name="celular"
                            value={formSucursal.celular}
                            onChange={(event) => handleChangeText(event, 'celular')}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            id="email"
                            label="email"
                            name="email"
                            value={formSucursal.email}
                            onChange={(event) => handleChangeText(event, 'email')}
                            variant='standard'
                        />
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="cai"
                            label="CAI"
                            name="cai"
                            value={formSucursal.cai}
                            onChange={(event) => handleChangeText(event, 'cai')}
                            variant='standard'
                        />
                        <TextField
                            style={{ width: '100%' }}
                            id="paginaDigital"
                            label="Pagina Digital"
                            name="paginaDigital"
                            value={formSucursal.paginaDigital}
                            onChange={(event) => handleChangeText(event, 'paginaDigital')}
                            variant='standard'
                        />
                        <TextField
                            required
                            style={{ width: '100%' }}
                            id="rtn"
                            label="RTN"
                            name="rtn"
                            value={formSucursal.rtn}
                            onChange={(event) => handleChangeText(event, 'rtn')}
                            variant='standard'
                        />
                        <TextField
                            required
                            style={{ width: '100%' }}
                            value={formSucursal.mensajeFactura}
                            onChange={(event) => handleChangeText(event, 'mensajeFactura')}
                            margin="dense"
                            id="mensajeFactura"
                            name="mensajeFactura"
                            label="Mensaje factura"
                            sx={{ width: "100%" }}
                            variant="standard"
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
