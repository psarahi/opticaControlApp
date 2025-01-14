import { React, useEffect, useState, useRef } from 'react'
import { DataTable, Tag, Column } from 'primereact';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField, InputLabel,
    MenuItem,
    Select,
    FormControl,
    Input,
    InputAdornment,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';

import dayjs from 'dayjs';

import { opticaControlApi } from '../../services/opticaControlApi';
import { textValidator } from '../../helpers/validator';
import { formatearFecha } from '../../helpers/formato';
import { Visibility, VisibilityOff } from '@mui/icons-material';
const usuariosJSON = {
    nombre: '',
    usuario: '',
    password: '',
    tipoUsuario: '',
    sucursales: '',
    fechaRegistro: dayjs().format('YYYY-MM-DD'),
    estado: true,
}
export const Usuarios = () => {
    let idUsuario = '';
    const [listUsuarios, setListUsuarios] = useState([]);
    const [usuarioSelected, setUsuarioSelected] = useState(null);
    const [sucursales, setSucursales] = useState([]);
    const [formUsuarios, setFormUsuarios] = useState(usuariosJSON);
    const [openDialog, setOpenDialog] = useState(false);
    const [changePass, setchangePass] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    useEffect(() => {
        if (window.innerWidth < 1900) {
            document.body.style.zoom = '80%'
        } else {
            document.body.style.zoom = '100%'
        }

        opticaControlApi.get('sucursal', '')
            .then((response) => {
                if (response.status === 200) {
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

    const handleOpenDialogAdd = () => {
        setOpenDialog(true);
        setchangePass(true);
    };

    const onCellSelect = (event) => {
        idUsuario = event.rowData._id;
        setUsuarioSelected(event.rowData._id);

        setFormUsuarios({
            nombre: event.rowData.nombre,
            usuario: event.rowData.usuario,
            password: event.rowData.password,
            tipoUsuario: event.rowData.tipoUsuario,
            sucursales: event.rowData.sucursales ? event.rowData.sucursales._id : '',
            fechaRegistro: formatearFecha(event.rowData.fechaRegistro),
            estado: event.rowData.estado,
        });
        if (event.cellIndex === 0) {
            handleEdit();
        };
        if (event.cellIndex === 1) {
            handleDisabled();
        };
        if (event.cellIndex === 2) {
            handleEnabled();
        };
    }

    const handleDisabled = () => {
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
        if (textValidator(idUsuario)) {
            opticaControlApi.put(`usuario/cambiarEstado/${idUsuario}`, { estado: false })
                .then((response) => {
                    if (response.status === 202) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido deshabilitado'
                        );

                        setListUsuarios(
                            listUsuarios.map(i =>
                                i._id === idUsuario ? {
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

    const handleEnabled = () => {
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
        if (textValidator(idUsuario)) {
            opticaControlApi.put(`usuario/cambiarEstado/${idUsuario}`, { estado: true })
                .then((response) => {
                    if (response.status === 202) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido deshabilitado'
                        );
                        setListUsuarios(
                            listUsuarios.map(i =>
                                i._id === idUsuario ? {
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
        setchangePass(false);
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

    const rendeEstado = (data) => {
        if (data.estado === true) {
            return <Tag severity="success" value="Activo"></Tag>
        } else {
            return <Tag severity="danger" value="Inactivo"></Tag>
        }
    }

    const renderEditButton = (data) => {
        if (data.estado === true) {
            return <EditIcon color='primary' fontSize='medium' />
        }
    };

    const renderStatusEnabled = (data) => {
        if (data.estado === false) {
            return <DoneIcon color='success' fontSize='medium' />
        }
    };
    const renderStatusDisabled = (data) => {
        if (data.estado === true) {
            return <CancelIcon color='error' fontSize='medium' />
        }
    };

    const handleChangePass = () => {
        setchangePass(true);
        setFormUsuarios({
            ...formUsuarios,
            password: ''
        });
    };

    return (
        <>
            <h1>Usuarios</h1>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialogAdd}>Agregar</Button>
            <div style={{ width: '90%' }}>
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
                    <Column field="tipoUsuario" header="Tipo Usuario"></Column>
                    <Column field="sucursales.nombre" header="Sucursal"></Column>
                    <Column field="fechaRegistro" header="Fecha de registro" body={(data) => (textValidator(data.fechaRegistro)) ? formatearFecha(data.fechaRegistro) : '-'}></Column>
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
                        if (!textValidator(formUsuarios.nombre)
                            || !textValidator(formUsuarios.usuario)
                            || !textValidator(formUsuarios.password)
                            || !textValidator(formUsuarios.tipoUsuario)
                            || !textValidator(formUsuarios.sucursales)
                            || !textValidator(formUsuarios.fechaRegistro)
                        ) {
                            createToastForm(
                                'warn',
                                'Acción requerida',
                                'Favor ingrese los datos necesarios'
                            );
                            return;
                        }
                        if (textValidator(usuarioSelected)) {
                            if (changePass) {
                                opticaControlApi.put(`usuario/changePass/${usuarioSelected}`, formUsuarios)
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


                        } else {
                            opticaControlApi.post('usuario', formUsuarios)
                                .then(async (response) => {
                                    if (response.status === 201) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro a sido creado'
                                        );
                                        cleanForm();
                                        setListUsuarios([...listUsuarios, response.data])
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
                                    handleCloseDialog()
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
                        marginBottom: '2%',
                        alignItems: 'center'
                    }}>
                        {!changePass &&
                            <Button variant='contained' onClick={handleChangePass}>Cambiar contraseña</Button>
                        }
                        <Toast ref={toastForm} />
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
                        {changePass &&
                            <FormControl variant="standard" style={{ width: '70%' }}>
                                <InputLabel id="password">Password *</InputLabel>
                                <Input
                                    id="standard-adornment-password"
                                    value={formUsuarios.password}
                                    type={showPassword ? 'text' : 'password'}
                                    onChange={(event) => handleChangeText(event, 'password')}
                                    required
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                onMouseUp={handleMouseUpPassword}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                        }
                        <FormControl variant="standard">
                            <InputLabel id="tipoUsuario">Tipo Usuario *</InputLabel>
                            <br />
                            <Select
                                style={{ width: '250px', marginBottom: '-100px' }}
                                labelId="tipoUsuario"
                                id="tipoUsuario"
                                value={formUsuarios.tipoUsuario || ''}
                                onChange={(event) => handleChangeText(event, 'tipoUsuario')}
                                label="Tipo Usuario"
                            >
                                <MenuItem key="1" value="Administrador">Administrador</MenuItem>
                                <MenuItem key="2" value="Usuario">Usuario</MenuItem>
                            </Select>
                        </FormControl>
                        <br />
                        <FormControl variant="standard">
                            <InputLabel id="sucursales">Sucursal *</InputLabel>
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
                        <TextField
                            style={{ width: '40%' }}
                            id="fechaRegistro"
                            name="fechaRegistro"
                            type='date'
                            value={formUsuarios.fechaRegistro}
                            onChange={(event) => handleChangeText(event, 'fechaRegistro')}
                            variant='standard'
                        />
                        {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                        </LocalizationProvider> */}
                    </div>
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