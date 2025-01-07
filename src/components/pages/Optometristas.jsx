import { React, useEffect, useState, useRef } from 'react'
import { DataTable, Column } from 'primereact';
import { Toast } from 'primereact/toast';

import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';

import { opticaControlApi } from '../../services/opticaControlApi';

export const Optometristas = () => {

  let idOptometrista = '';
  const [listOptometristas, setListOptometristas] = useState([]);
  const [optometristasSelected, setOptometristasSelected] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    const fetchOptometristas = async () => {
      try {
        const response = await opticaControlApi.get('optometrista');
        setListOptometristas(response.data); 
      } catch (error) {
        console.error('Error fetching optometristas:', error);
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 });
      }
    };

    fetchOptometristas();
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
      <h1>Optometristas</h1>
      <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialog}>Agregar</Button>
      <br />
      <br />
      <Toast ref={toast} />
      {/* <ConfirmDialog /> */}
      <div style={{ width: '65%' }}>
        <DataTable value={listOptometristas} tableStyle={{ minWidth: '50rem' }}
          showGridlines
          stripedRows
          size='small'
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 15]}
          selection={optometristasSelected}
        >
          <Column body={renderEditButton} style={{ textAlign: 'center' }}></Column>
          <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
          <Column body={renderChangeStatus} style={{ textAlign: 'center' }}></Column>
          <Column field="_id" header="ID"></Column>
          <Column field="nombre" header="Nombre"></Column>
          <Column field="sucursales.nombre" header="Sucursal"></Column>
        </DataTable>
      </div>
    </>
  )
}
