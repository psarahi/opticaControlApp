import React, { useEffect, useState, useRef } from 'react'

import AddIcon from '@mui/icons-material/Add';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable, Column, Tag } from 'primereact';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import InventoryIcon from '@mui/icons-material/Inventory';

import dayjs from 'dayjs';

import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, linearProgressClasses, TextField
}
    from '@mui/material';

import { opticaControlApi } from '../../services/opticaControlApi';
import { textValidator } from '../../helpers/validator';
import { formatearFecha, formatearNumero } from '../../helpers/formato';
import './ClienteStyle.css'
export const Cliente = () => {
    const ventaClienteJSON = {
        fecha: dayjs().format('YYYY-MM-DD'),
        detalleInventario: [{
            inventario: '',
            cantidad: 0
        }],
        cliente: '',
        sucursales: localStorage.getItem('sucursalID'),
        estado: true
    };

    const clienteJSON = {
        nombre: '',
        fechaRegistro: dayjs().format('YYYY-MM-DD'),
        telefono: '',
        email: '',
        direccion: '',
        sucursales: localStorage.getItem('sucursalID'),
        estado: true
    }

    let idCliente = '';
    const [listClientes, setListClientes] = useState([]);
    const [formCliente, setFormCliente] = useState(clienteJSON);
    const [formVenta, setFormVenta] = useState(ventaClienteJSON);
    const [ClienteSelected, setClienteSelected] = useState('');
    const [openDialogCliente, setOpenDialogCliente] = useState(false);
    const [openDialogVenta, setOpenDialogVenta] = useState(false);
    const [detalleInv, setdetalleInv] = useState({});
    const [listInventario, setListInventario] = useState([]);
    const [listInvSeleccionado, setListInvSeleccionado] = useState([]);

    useEffect(() => {
        const sucursal = localStorage.getItem('sucursalID');
        opticaControlApi.get(`cliente/bySucursal/${sucursal}`, '').then((response) => {
            setListClientes(response.data);
        })
        opticaControlApi.get(`inventario/inventarioExistente/${sucursal}`, '').then((response) => {
            setListInventario(response.data);
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

    const handleOpenDialogCliente = () => {
        setOpenDialogCliente(true);
    };

    const handleCloseDialogCliente = () => {
        cleanForm();
        setOpenDialogCliente(false);
    };

    const handleOpenDialogVenta = () => {
        setOpenDialogVenta(true);
    };

    const handleCloseDialogVenta = () => {
        setOpenDialogVenta(false);
    };

    const cleanForm = () => {
        setFormCliente(clienteJSON);
        setFormVenta(ventaClienteJSON);
        setClienteSelected('');
        idCliente = '';
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
    const renderInventarioButton = (data) => {
        if (data.estado !== false) {
            return <InventoryIcon color='success' fontSize='medium' />
        }
    };

    const rendeEstado = (data) => {
        if (data.estado === true) {
            return <Tag severity="success" value="Activo"></Tag>
        } else {
            return <Tag severity="danger" value="Inactivo"></Tag>
        }
    }

    const onCellSelectFactura = (event) => {
        idCliente = event.rowData._id;
        setClienteSelected(event.rowData._id);

        setFormCliente({
            nombre: event.rowData.nombre,
            email: event.rowData.email,
            fechaRegistro: formatearFecha(event.rowData.fechaRegistro),
            sucursales: event.rowData.sucursales,
            telefono: event.rowData.telefono,
            direccion: event.rowData.direccion,
            estado: event.rowData.estado,
        });
        if (event.cellIndex === 0) {
            handleEdit();
        } else if (event.cellIndex === 1) {
           // handleOpenDialogVenta();
        } else if (event.cellIndex === 2) {
            handleDisable();
        } else if (event.cellIndex === 2) {
            handleEnable();
        }
    };

    const handleEdit = () => {
        handleOpenDialogCliente();
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
        if (textValidator(idCliente)) {
            opticaControlApi.put(`cliente/cambiarEstado/${idCliente}`, { estado: false })
                .then((response) => {
                    if (response.status === 202) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido deshabilitado'
                        );

                        setListClientes(
                            listClientes.map(i =>
                                i._id === idCliente ? {
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
                    handleCloseDialogCliente();
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
        if (textValidator(idCliente)) {
            opticaControlApi.put(`cliente/cambiarEstado/${idCliente}`, { estado: true })
                .then((response) => {
                    if (response.status === 202) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido deshabilitado'
                        );
                        setListClientes(
                            listClientes.map(i =>
                                i._id === idCliente ? {
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
                    handleCloseDialogCliente();
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
        setFormCliente({
            ...formCliente,
            [select]: target.value
        })
    };

    const renderAddButton = () => {
        return (
          <AddIcon color='primary' fontSize='medium' />
        );
      };

    return (
        <>
            <h1>Informacion sobre facturas / Recibo </h1>
            <Toast ref={toast} />
            <ConfirmDialog />
            <h2>Clientes</h2>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialogCliente}>Agregar</Button>
            <div style={{ width: '80%' }}>
                <DataTable value={listClientes}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    selectionMode="single"
                    selection={ClienteSelected}
                    cellSelection
                    onCellSelect={onCellSelectFactura}
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns                >
                    <Column body={renderEditButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderInventarioButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderChangeStatus} style={{ textAlign: 'center' }}></Column>
                    <Column field="nombre" header="Nombre"></Column>
                    <Column field="email" header="Email"></Column>
                    <Column field="telefono" header="Telefono"></Column>
                    <Column field="direccion" header="Dirección"></Column>
                    <Column field="fechaRegistro" header="Fecha Registro" body={(data) => formatearFecha(data.fechaRegistro)}></Column>
                    <Column field="estado" header="Estado" body={rendeEstado}></Column>
                </DataTable>
            </div>
            <Dialog
                open={openDialogCliente}
                disableEscapeKeyDown={true}
                maxWidth="sm"
                fullWidth={true}
                onClose={handleCloseDialogCliente}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        if (!textValidator(formCliente.nombre) && !textValidator(formCliente.telefono)) {
                            createToast(
                                'warn',
                                'Acción requerida',
                                'Favor ingrese los datos necesarios'
                            );
                            return;
                        }
                        if (textValidator(ClienteSelected)) {
                            opticaControlApi.put(`facturas/${ClienteSelected}`, formCliente)
                                .then((response) => {
                                    if (response.status === 202) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue editado correctamente'
                                        );
                                        handleCloseDialogCliente();
                                        setListClientes(
                                            listClientes.map((i) =>
                                                i._id === ClienteSelected ? { ...i, ...formCliente } : i
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
                                    handleCloseDialogCliente();
                                    cleanForm();
                                });
                        } else {
                            opticaControlApi.post('cliente', formCliente)
                                .then((response) => {
                                    if (response.status === 201) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue creado correctamente'
                                        );
                                        handleCloseDialogCliente();
                                        setListClientes([...listClientes, response.data]);
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
                                    handleCloseDialogCliente();
                                    cleanForm();
                                });
                        }
                    },
                }}
            >
                <DialogTitle>Datos sobre el cliente</DialogTitle>
                <DialogContent                 >
                    <div className='formContainer'>
                        <TextField
                            required
                            value={formCliente.nombre}
                            onChange={(event) => handleChangeText(event, 'nombre')}
                            margin="dense"
                            id="nombre"
                            name="nombre"
                            label="nombre"
                            sx={{ width: "100%" }}
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formCliente.telefono}
                            onChange={(event) => handleChangeText(event, 'telefono')}
                            margin="dense"
                            id="telefono"
                            name="telefono"
                            label="Telefono"
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formCliente.email}
                            onChange={(event) => handleChangeText(event, 'email')}
                            margin="dense"
                            id="email"
                            name="email"
                            label="Email"
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formCliente.direccion}
                            onChange={(event) => handleChangeText(event, 'direccion')}
                            margin="dense"
                            id="direccion"
                            name="direccion"
                            label="Direccion"
                            variant="standard"
                            size="medium"
                        />

                    </div>

                    <br />
                    <br />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogCliente} >Cancelar</Button>
                    <Button variant='contained' type="submit">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal para mover inventario */}
            <Dialog
                open={openDialogVenta}
                disableEscapeKeyDown={true}
                maxWidth="sm"
                fullWidth={true}
                onClose={handleCloseDialogVenta}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        createToast(
                            'warn',
                            'Acción requerida',
                            'Favor ingrese los datos necesarios'
                        );
                        // return;


                        opticaControlApi.post('cliente', formVenta)
                            .then((response) => {
                                if (response.status === 201) {
                                    createToast(
                                        'success',
                                        'Confirmado',
                                        'El registro fue creado correctamente'
                                    );
                                    handleCloseDialogVenta();
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
                                handleCloseDialogVenta();
                                cleanForm();
                            });
                    },
                }}
            >
                <DialogTitle>Venta</DialogTitle>
                <DialogContent                 >
                    <div className='formContainer'>
                        <p>Seleccione inventario</p>
                        <DataTable value={listInventario}
                            showGridlines
                            stripedRows
                            size='small'
                            sortMode="multiple"
                            paginator
                            rows={5}
                            // filters={filtersInventario}
                            filterDisplay='row'
                            selectionMode="single"
                            cellSelection
                            // onCellSelect={onCellSelectedInventario}
                            scrollable
                            columnResizeMode="expand"
                            resizableColumns
                        >
                            <Column body={renderAddButton}></Column>
                            <Column field="descripcion" header="Descripcion" sortable filter style={{ minWidth: '12rem' }}></Column>
                            <Column field="esfera" header="Esfera" filter style={{ minWidth: '15rem' }}></Column>
                            <Column field="cilindro" header="Cilindro" filter style={{ minWidth: '10rem' }}></Column>
                            <Column field="adicion" header="Adición" filter style={{ minWidth: '10rem' }}></Column>
                            <Column field="linea" header="Linea" filter style={{ minWidth: '10em' }}></Column>
                            <Column field="importe" header="Importe"></Column>
                            <Column field="valorGravado" header="Gravado"></Column>
                            <Column field="existencia" header="Existencia" sortable ></Column>
                            <Column field="precioVenta" header="Precio Venta" sortable body={(data) => formatearNumero(data.precioVenta)}></Column>
                            <Column field="moda" header="Moda" filter></Column>
                            <Column field="color" header="Color"></Column>
                            <Column field="diseno" header="Diseño"></Column>
                            <Column field="proveedor" header="Proveedor" filter></Column>
                        </DataTable>
                        <br />
                        <p>Inventario seleccionado</p>
                        <DataTable value={listInvSeleccionado}
                            showGridlines
                            stripedRows
                            size='small'
                            sortMode="multiple"
                            paginator
                            rows={5}
                            selectionMode="single"
                            cellSelection
                            // onCellSelect={onCellInvSeleccionado}
                            scrollablev
                            columnResizeMode="expand"
                            resizableColumns
                  
                        >
                            <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
                            <Column field="descripcion" header="Descripcion" ></Column>
                            <Column field="esfera" header="Esfera"></Column>
                            <Column field="cilindro" header="Cilindro"></Column>
                            <Column field="adicion" header="Adición"></Column>
                            <Column field="linea" header="Linea"></Column>
                            <Column field="importe" header="Importe"></Column>
                            <Column field="valorGravado" header="Gravado"></Column>
                            <Column field="cantidad" header="Cantidad"></Column>
                            <Column field="precioVenta" header="Precio Venta" body={(data) => formatearNumero(data.precioVenta)}></Column>
                            {/* <Column field="descuento" header="Descuento" editor={(options) => textEditor(options)}></Column> */}
                            {/* <Column rowEditor={allowEdit} headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column> */}
                        </DataTable>
                        {/* <TextField
                            required
                            value={formCliente.nombre}
                            onChange={(event) => handleChangeText(event, 'nombre')}
                            margin="dense"
                            id="nombre"
                            name="nombre"
                            label="nombre"
                            sx={{ width: "100%" }}
                            variant="standard"
                            size="medium"
                        /> */}
                        {/* <TextField
                            required
                            value={formVenta}
                            onChange={(event) => handleChangeText(event, 'telefono')}
                            margin="dense"
                            id="telefono"
                            name="telefono"
                            label="Telefono"
                            variant="standard"
                            size="medium"
                        /> */}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogVenta} >Cancelar</Button>
                    {/* <Button variant='contained' type="submit">Guardar</Button> */}
                </DialogActions>
            </Dialog>
        </>
    )
}
