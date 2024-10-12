import React, { useEffect, useState, useRef } from 'react'

import AddIcon from '@mui/icons-material/Add';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode, DataTable, Column } from 'primereact';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField
}
    from '@mui/material';
//import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

import { appointmentApi } from '../../services/appointmentApi';
import { formatearNumero } from '../../helpers/formato';
import './InventarioStyle.css';
import { textValidator } from '../../helpers/validator';

export const Inventario = () => {
    let inventarioSeleccionado = '';
    const [openDialog, setOpenDialog] = useState(false);
    const [listInventario, setListInventario] = useState([]);
    const [selectedInventario, setSelectedInventario] = useState(null);
    const [formValues, setFormValues] = useState({
        descripcion: '',
        linea: '',
        precioVenta: '',
        precioCompra: '',
        existencia: '',
        categoria: '',
        proveedor: '',
        telefono: '',
        moda: '',
        diseno: '',
        color: '',
        //fechaRegistro: new Date()
    });
    const lineas = [
        'Marca',
        'Delux',
        'Media',
        'Economica'
    ];

    useEffect(() => {
        appointmentApi.get('inventario', '').then((response) => {
            setListInventario(response.data);
        })
        cleanForm();
    }, [])

    const cleanForm = () => {
        setFormValues({
            descripcion: '',
            linea: '',
            precioVenta: '',
            precioCompra: '',
            existencia: '',
            categoria: '',
            proveedor: '',
            telefono: '',
            moda: '',
            diseno: '',
            color: '',
            //fechaRegistro: new Date()
        });
        setSelectedInventario(null);
        inventarioSeleccionado = '';

    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const toast = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const onCellSelect = (event) => {
        if (event.cellIndex === 0) {
            handleEdit();
        } else if (event.cellIndex === 1) {
            handleDelete();
        }
    };

    const handleChangeText = ({ target }, select) => {
        setFormValues({
            ...formValues,
            [select]: target.value
        })
    };

    const handleEdit = () => {
        handleOpenDialog();
    };

    const handleDelete = () => {
        confirmDialog({
            message: `¿Desea eliminar el registro? `,
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: acceptDialog,
            reject: rejectDialog
        });
    };

    const acceptDialog = () => {
        if (textValidator(inventarioSeleccionado)) {
            appointmentApi.delete(`inventario/${inventarioSeleccionado}`)
                .then((response) => {
                    if (response.status === 200) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido eliminado'
                        );
                        const inventarioFiltrado = listInventario.filter((inv) => (inv._id !== inventarioSeleccionado));
                        setListInventario([...inventarioFiltrado]);
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
                        'Ha ocurrido un error al intentar crear el registro'
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

    const rejectDialog = () => {
        createToast(
            'warn',
            'Cancelado',
            'Acción cancelada'
        );
    }

    const renderEditButton = () => {
        return (
            <EditIcon color='primary' fontSize='medium' />
        );
    };

    const renderDeleteButton = (value) => {
        return (
            <DeleteIcon color='error' fontSize='medium' />
        );
    };

    const [filters] = useState({
        descripcion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        categoria: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        moda: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        proveedor: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        linea: { value: '', matchMode: FilterMatchMode.STARTS_WITH }
    });

    const precioVentaBodyTemplate = ({ precioVenta }) => {
        return formatearNumero(precioVenta);
    };

    const precioCompraBodyTemplate = ({ precioCompra }) => {
        return formatearNumero(precioCompra);
    };
    return (
        <>
            <h1>Informacion sobre Inventario </h1>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialog}>Agregar inventario</Button>
            <br />
            <br />
            <Toast ref={toast} />
            <ConfirmDialog />

            <div style={{ width: '95%' }}>
                <DataTable value={listInventario}
                    showGridlines
                    stripedRows
                    size='small'
                    sortMode="multiple"
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    filters={filters}
                    filterDisplay='row'
                    selectionMode="single"
                    selection={setSelectedInventario}
                    cellSelection
                    onCellSelect={onCellSelect}
                    onSelectionChange={(e) => {
                        console.log(e);
                        const inventario = e.value.rowData;
                        setSelectedInventario(inventario._id);
                        inventarioSeleccionado = inventario._id;
                        setFormValues({
                            descripcion: inventario.descripcion,
                            linea: inventario.linea,
                            precioVenta: inventario.precioVenta,
                            precioCompra: inventario.precioCompra,
                            existencia: inventario.existencia,
                            categoria: inventario.categoria,
                            proveedor: inventario.proveedor,
                            telefono: inventario.telefono,
                            moda: inventario.moda,
                            diseno: inventario.diseno,
                            color: inventario.color,
                            //fechaRegistro: new Date(inventario.fechaRegistro)
                        });


                    }}
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns                >
                    <Column body={renderEditButton}></Column>
                    <Column body={renderDeleteButton}></Column>
                    <Column field="descripcion" header="Descripcion" sortable filter></Column>
                    <Column field="linea" header="Linea" filter></Column>
                    <Column field="existencia" header="Existencia" sortable ></Column>
                    <Column field="precioVenta" header="Precio Venta" sortable body={precioVentaBodyTemplate}></Column>
                    <Column field="precioCompra" header="Precio Compra" sortable body={precioCompraBodyTemplate}></Column>
                    <Column field="moda" header="Moda" filter></Column>
                    <Column field="categoria" header="Categoria" filter></Column>
                    <Column field="color" header="Color"></Column>
                    <Column field="diseno" header="Diseño"></Column>
                    <Column field="proveedor" header="Proveedor" filter></Column>
                    <Column field="telefono" header="Telefono" ></Column>
                </DataTable>
            </div>
            <Dialog
                open={openDialog}
                disableEscapeKeyDown={true}
                //maxWidth="sm"
                style={{
                    height: '500px'
                }}
                onClose={handleCloseDialog}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        console.log(formValues);


                        if (textValidator(selectedInventario)) {
                            appointmentApi.put(`inventario/${selectedInventario}`, formValues)
                                .then((response) => {
                                    console.log(response.status);

                                    if (response.status === 202) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue editado correctamente'
                                        );
                                        handleCloseDialog();
                                        const inventarioFiltrados = listInventario.filter((inventario) => (inventario._id !== selectedInventario));
                                        setListInventario([response.data, ...inventarioFiltrados]);
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
                                        'Ha ocurrido un error al intentar crear el registro'
                                    );
                                    console.log(err);
                                    handleCloseDialog();
                                    cleanForm();
                                });
                        } else {

                            appointmentApi.post('inventario', formValues)
                                .then((response) => {
                                    if (response.status === 201) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue creado correctamente'
                                        );
                                        handleCloseDialog();
                                        setListInventario([...listInventario, response.data]);
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
                                        'Ha ocurrido un error al intentar crear el registro'
                                    );
                                    console.log(err);
                                    handleCloseDialog();
                                    cleanForm();
                                });
                        }
                    },
                }}
            >
                <DialogTitle>Datos sobre inventario</DialogTitle>
                <DialogContent                 >
                    <DialogContentText>
                        Por favor rellene los campos sobre la informacion de su inventario
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        value={formValues.descripcion}
                        onChange={(event) => handleChangeText(event, 'descripcion')}
                        margin="dense"
                        id="descripcion"
                        name="descripcion"
                        label="Descripcion"
                        type="text"
                        sx={{ width: "70%" }}
                        variant="standard"
                        size="medium"
                    />
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                        <InputLabel id="linea">Linea</InputLabel>
                        <Select
                            labelId="linea"
                            id="linea"
                            value={formValues.linea}
                            onChange={(event) => handleChangeText(event, 'linea')}
                            label="linea"
                        >
                            {lineas.map(op => {
                                return (
                                    <MenuItem key={op} value={op}>{op}</MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                    <div className='container'>
                        <TextField
                            required
                            value={formValues.precioVenta}
                            onChange={(event) => handleChangeText(event, 'precioVenta')}
                            margin="dense"
                            id="precioVenta"
                            name="precioVenta"
                            label="Precio Venta"
                            type="number"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formValues.precioCompra}
                            onChange={(event) => handleChangeText(event, 'precioCompra')}
                            margin="dense"
                            id="precioCompra"
                            name="precioCompra"
                            label="Precio Compra"
                            type="number"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formValues.existencia}
                            onChange={(event) => handleChangeText(event, 'existencia')}
                            margin="dense"
                            id="existencia"
                            name="existencia"
                            label="Existencia"
                            type="number"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.categoria}
                            onChange={(event) => handleChangeText(event, 'categoria')}
                            margin="dense"
                            id="categoria"
                            name="categoria"
                            label="Categoria"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formValues.proveedor}
                            onChange={(event) => handleChangeText(event, 'proveedor')}
                            margin="dense"
                            id="proveedor"
                            name="proveedor"
                            label="Proveedor"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.telefono}
                            onChange={(event) => handleChangeText(event, 'telefono')}
                            margin="dense"
                            id="telefono"
                            name="telefono"
                            label="Telefono "
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.moda}
                            onChange={(event) => handleChangeText(event, 'moda')}
                            margin="dense"
                            id="moda"
                            name="moda"
                            label="Moda"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.diseno}
                            onChange={(event) => handleChangeText(event, 'diseno')}
                            margin="dense"
                            id="diseno"
                            name="diseno"
                            label="Diseño"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.color}
                            onChange={(event) => handleChangeText(event, 'color')}
                            margin="dense"
                            id="color"
                            name="color"
                            label="Color"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                    </div>
                    <br />
                    <br />
                    {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Ultima Cita *"
                            nombre="ultimaCita"
                            variant="standard"
                            value={formValues.ultimaCita}
                            format='YYYY-MM-DD'
                            onChange={(event) => {
                                setFormValues({
                                    ...formValues,
                                    ultimaCita: dayjs(event)
                                })
                            }}
                        />
                    </LocalizationProvider> */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} >Cancelar</Button>
                    <Button variant='contained' type="submit">Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
