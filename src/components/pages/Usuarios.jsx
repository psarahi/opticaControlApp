import { React, useEffect, useState, useRef } from 'react'
import { DataTable, Column } from 'primereact';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField, InputLabel,
    MenuItem,
    Select,
    FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { opticaControlApi } from '../../services/opticaControlApi';
import { textValidator } from '../../helpers/validator';
import { formatearFecha } from '../../helpers/formato';
import { DatePicker } from '@mui/x-date-pickers';

export const Usuarios = () => {


    const usuariosJSON = {
        nombre: '',
        usuario: '',
        password: '',
        sucursales: '',
        fechaRegistro: dayjs().format('YYYY-MM-DD'),
        estado: true,
    }

    const estados = [
        { id: true, name: 'Activo' },
        { id: false, name: 'Inactivo' },
    ];
    let idUsuario = '';
    const [listUsuarios, setListUsuarios] = useState([]);
    const [usuarioSelected, setUsuarioSelected] = useState(null);
    const [sucursales, setSucursales] = useState([]);
    const [formUsuarios, setFormUsuarios] = useState(usuariosJSON);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        document.body.style.zoom = '100%';

        opticaControlApi.get('sucursal', '')
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data);
                    setSucursales(response.data);
                }
            })
            .catch((err) => {
                createToast(
                    'error',
                    'Error',
                    err.response.data,
                );
            });

    }, [])

    useEffect(() => {
        const sucursal = localStorage.getItem('sucursalID');
        const fetchUsuarios = async () => {
            try {
                const response = await opticaControlApi.get('usuario', {
                    params: {
                        sucursalID: sucursal
                    }
                });
                setListUsuarios(response.data);
            } catch (error) {
                console.error('Error fetching optometristas:', error);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 });
            }
        };

        fetchUsuarios();
    }, []);
    const toast = useRef(null);
    const toastForm = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const createToastForm = (severity, summary, detail) => {
        toastForm.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const onCellSelect = (event) => {
        idUsuario = event.rowData._id;
        setUsuarioSelected(event.rowData._id);

        setFormUsuarios({
            nombre: event.rowData.nombre,
            usuario: event.rowData.usuario,
            password: event.rowData.password,
            sucursales: event.rowData.sucursales ? event.rowData.sucursales._id : '',
            fechaRegistro: formatearFecha(event.rowData.fechaRegistro),
            estado: event.rowData.estado,
        });
        if (event.cellIndex === 0) {
            handleEdit();
        };
    }

    const handleEdit = () => {
        handleOpenDialog();
    };

    const handleCloseDialog = () => {
        cleanForm();
        setOpenDialog(false);
    };

    const cleanForm = () => {
        setFormUsuarios(usuariosJSON);
        setUsuarioSelected('');
        idUsuario = '';
    };

    const handleChangeText = ({ target }, select) => {
        setFormUsuarios({
            ...formUsuarios,
            [select]: target.value
        })
    };
    const rowClass = (data) => {
        return {
            'bg-green-100': data.estado === true,
            'bg-red-100': data.estado === false,
        }
    };


    const renderEditButton = (data) => {
        if (data.estado !== true || data.estado !== false) {
            return <EditIcon color='primary' fontSize='medium' />
        }
    };

    const renderStatusEnabled = (data) => {
        if (data.estado === true) {
            return <DoneIcon color='success' fontSize='medium' />
        } 
    };
    const renderStatusDisabled = (data) => {
        if (data.estado === false) {
            return <CancelIcon color='error' fontSize='medium' />
        } 
    };


    return (
        <>
            <h1>Usuarios</h1>
            <Toast ref={toast} />
            <Toast ref={toastForm} />
            <Toast ref={toast} />
            <div style={{ width: '65%' }}>
                <DataTable value={listUsuarios} tableStyle={{ minWidth: '50rem' }}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    selection={usuarioSelected}
                    rowClassName={rowClass}
                    selectionMode="single"
                    cellSelection
                    onCellSelect={onCellSelect}
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns
                >
                    <Column body={renderEditButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderStatusDisabled} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderStatusEnabled} style={{ textAlign: 'center' }}></Column>
                    <Column field="nombre" header="Nombre"></Column>
                    <Column field="usuario" header="Usuario"></Column>
                    <Column field="password" header="Contraseña"></Column>
                    <Column field="sucursales.nombre" header="Sucursal"></Column>
                    <Column field="fechaRegistro" header="Fecha de registro" body={(data) => (textValidator(data.fechaRegistro)) ? formatearFecha(data.fechaRegistro) : '-'}></Column>
                    <Column
                        field="estado"
                        header="Estado"
                        body={(data) => (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {data.estado
                                    ? 'Activo'
                                    : 'Inactivo'
                                }
                            </div>
                        )}
                    />                </DataTable>
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
                        console.log(formUsuarios);
                        if (!textValidator(formUsuarios.nombre)
                            && !textValidator(formUsuarios.usuario)
                            && !textValidator(formUsuarios.password)
                            && !textValidator(formUsuarios.sucursales)
                            && !textValidator(formUsuarios.fechaRegistro)
                        ) {
                            createToast(
                                'warn',
                                'Acción requerida',
                                'Favor ingrese los datos necesarios'
                            );
                            return;
                        }
                        if (textValidator(usuarioSelected)) {
                            opticaControlApi.put(`usuario/${usuarioSelected}`, formUsuarios)
                                .then((response) => {
                                    if (response.status === 202) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue editado correctamente'
                                        );
                                        handleCloseDialog();
                                        setListUsuarios(
                                            listUsuarios.map((i) =>
                                                i._id === usuarioSelected ? { ...i, ...response.data } : i
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

                        }
                    },
                }}
            >
                <DialogTitle>Datos del usuario</DialogTitle>
                <DialogContent                 >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px',
                        marginBottom: '2%'
                    }}>
                        <TextField
                            required
                            value={formUsuarios.nombre}
                            onChange={(event) => handleChangeText(event, 'nombre')}
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
                            value={formUsuarios.usuario}
                            onChange={(event) => handleChangeText(event, 'usuario')}
                            margin="dense"
                            id="usuario"
                            name="usuario"
                            label="Usuario"
                            sx={{ width: "70%" }}
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formUsuarios.password}
                            onChange={(event) => handleChangeText(event, 'password')}
                            margin="dense"
                            id="password"
                            name="password"
                            label="Contraseña"
                            sx={{ width: "70%" }}
                            variant="standard"
                            size="medium"
                        />
                        <FormControl variant="standard">
                            <InputLabel id="sucursales">Sucursal</InputLabel>
                            <br />
                            <Select
                                style={{ width: '250px', marginBottom: '-100px' }}
                                labelId="sucursales"
                                id="sucursales"
                                value={formUsuarios.sucursales || ''} // Ensure this is the ID
                                onChange={(event) => handleChangeText(event, 'sucursales')}
                                label="Sucursales"
                            >
                                {sucursales.map((s, index) => (
                                    <MenuItem key={index} value={s._id}>{s.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <br />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Fecha de registro *"
                                value={formUsuarios.fechaRegistro ? dayjs(formUsuarios.fechaRegistro) : null}
                                onChange={(newValue) => {
                                    if (newValue && newValue.isValid()) {
                                        setFormUsuarios({
                                            ...formUsuarios,
                                            fechaRegistro: newValue.format('YYYY-MM-DD')
                                        });
                                    } else {
                                        setFormUsuarios({
                                            ...formUsuarios,
                                            fechaRegistro: ''
                                        });
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} variant="standard" />}
                            />
                        </LocalizationProvider>
                    </div>
                    <FormControl variant="standard">
                        <InputLabel id="estado">Estado</InputLabel>
                        <Select
                            style={{ width: '250px', marginBottom: '-100px' }}
                            labelId="estado"
                            id="estado"
                            value={formUsuarios.estado}
                            onChange={(event) => handleChangeText(event, 'estado')}
                            label="Estado"
                        >
                            {estados.map((estado, index) => (
                                <MenuItem key={index} value={estado.id}>{estado.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <br />
                    <div>
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