import { React, useEffect, useState, useRef } from 'react'
import { DataTable, Column } from 'primereact';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

import { opticaControlApi } from '../../services/opticaControlApi';
import { textValidator } from '../../helpers/validator';

export const Optometristas = () => {


  const optometristaJSON = {
    nombre: '',
    sucursales: localStorage.getItem('sucursalID')
  }
  let idOptometrista = '';
  const [listOptometristas, setListOptometristas] = useState([]);
  const [optometristasSelected, setOptometristasSelected] = useState(null);
  const [formOptometrista, setFormOptometrista] = useState(optometristaJSON);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const sucursal = localStorage.getItem('sucursalID');
    opticaControlApi.get(`optometrista/bySucursal/${sucursal}`, {})
      .then((response) => {
        setListOptometristas(response.data);
      })
  }, []);
  const toast = useRef(null);

  const createToast = (severity, summary, detail) => {
    toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const onCellSelect = (event) => {
    idOptometrista = event.rowData._id;
    setOptometristasSelected(event.rowData._id);

    setFormOptometrista({
      nombre: event.rowData.nombre,
      sucursales: event.rowData.sucursales._id,
    });
    if (event.cellIndex === 0) {
      handleEdit();
    } else if (event.cellIndex === 1) {
      handleDeleteOptometrista();
    }
  };

  const handleEdit = () => {
    handleOpenDialog();
  };

  const handleCloseDialog = () => {
    cleanForm();
    setOpenDialog(false);
  };

  const cleanForm = () => {
    setFormOptometrista(optometristaJSON);
    setOptometristasSelected('');
    idOptometrista = '';
  };

  const handleDeleteOptometrista = () => {
    confirmDialog({
      message: `¿Desea eliminar este registro? `,
      header: 'Eliminar',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: deleteOptometrista,
      reject: rejectDialogDelete
    });
  };

  const deleteOptometrista = () => {
    if (textValidator(idOptometrista)) {
      opticaControlApi.delete(`optometrista/${idOptometrista}`)
        .then((response) => {
          if (response.status === 200) {
            createToast(
              'success',
              'Confirmado',
              'El registro ha sido eliminado'
            );
            setListOptometristas(
              listOptometristas.filter(i => i._id !== idOptometrista)
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
        'No se seleccionó el optometrista correctamente'
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

  const handleChangeText = ({ target }, select) => {
    setFormOptometrista({
      ...formOptometrista,
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
    if (data.estado !== true) {
      return <EditIcon color='primary' fontSize='medium' />
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
      <ConfirmDialog />
      <div style={{ width: '65%' }}>
        <DataTable value={listOptometristas} tableStyle={{ minWidth: '50rem' }}
          showGridlines
          stripedRows
          size='small'
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 15]}
          selection={optometristasSelected}
          rowClassName={rowClass}
          selectionMode="single"
          cellSelection
          onCellSelect={onCellSelect}
          scrollable
          columnResizeMode="expand"
          resizableColumns
        >
          <Column body={renderEditButton} style={{ textAlign: 'center' }}></Column>
          <Column body={renderDeleteButton} style={{ textAlign: 'center' }}></Column>
          <Column field="nombre" header="Nombre"></Column>
          <Column field="sucursales.nombre" header="Sucursal"></Column>
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
            if (!textValidator(formOptometrista.nombre) && !textValidator(formOptometrista.sucursales)) {
              createToast(
                'warn',
                'Acción requerida',
                'Favor ingrese los datos necesarios'
              );
              return;
            }
            if (textValidator(optometristasSelected)) {
              opticaControlApi.put(`optometrista/${optometristasSelected}`, formOptometrista)
                .then((response) => {
                  if (response.status === 202) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue editado correctamente'
                    );
                    handleCloseDialog();
                    setListOptometristas(
                      listOptometristas.map((i) =>
                        i._id === optometristasSelected ? { ...i, ...response.data } : i
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
              opticaControlApi.post('optometrista', formOptometrista)
                .then((response) => {
                  if (response.status === 201) {
                    createToast(
                      'success',
                      'Confirmado',
                      'El registro fue creado correctamente'
                    );
                    handleCloseDialog();

                    setListOptometristas([...listOptometristas, response.data]);
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
        <DialogTitle>Datos del optometrista</DialogTitle>
        <DialogContent                 >
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '30px',
            marginBottom: '2%'
          }}>
            <TextField
              required
              value={formOptometrista.nombre}
              onChange={(event) => handleChangeText(event, 'nombre')}
              margin="dense"
              id="nombre"
              name="nombre"
              label="Nombre"
              sx={{ width: "70%" }}
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