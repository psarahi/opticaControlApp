import { React, useEffect, useState, useRef } from 'react'
import { DataTable, Column } from 'primereact';
import { Toast } from 'primereact/toast';

import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';

import { opticaControlApi } from '../../services/opticaControlApi';

export const Sucursales = () => {
    let idOptometrista = '';
    const [listSurcursales, setListSucursales] = useState([]);
    const [sucursalSelected, setSucursalSelected] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await opticaControlApi.get('sucursal');
                console.log(response.data);
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

    const renderEditButton = (data) => {
        if (data.estado !== true) {
            return <EditIcon color='primary' fontSize='medium' />
        }
    };

    const renderChangeStatus = (data) => {
        if (data.estado !== true) {
            return <DoneIcon color='success' fontSize='medium' />
        }
    };

    const renderDeleteButton = (data) => {
        if (data.estado !== false) {
            return <CancelIcon color='error' fontSize='medium' />
        }
    };
    return (
        <>
            <h1>Sucursales</h1>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialog}>Agregar</Button>
            <br />
            <br />
            <Toast ref={toast} />
            {/* <ConfirmDialog /> */}
            <div style={{ width: '65%' }}>
                <DataTable value={listSurcursales} tableStyle={{ minWidth: '50rem' }}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 15]}
                    selection={sucursalSelected}
                >
                    <Column body={renderEditButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
                    <Column body={renderChangeStatus} style={{ textAlign: 'center' }}></Column>
                    <Column field="_id" header="ID"></Column>
                    <Column field="nombre" header="Nombre"></Column>
                    <Column field="direccion" header="Direccion"></Column>
                    <Column field="email" header="Correo"></Column>
                    <Column field="celular" header="Celular"></Column>
                    <Column field="telefono" header="Telefono"></Column>
                    <Column field="paginaDigital" header="Sitio Web"></Column>
                    <Column field="rtn" header="RTN"></Column>
                </DataTable>
            </div>
        </>
    )
}
