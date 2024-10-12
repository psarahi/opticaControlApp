// import React, { useEffect, useState, useRef } from 'react'

// import AddIcon from '@mui/icons-material/Add';
// import { Toast } from 'primereact/toast';
// import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
// import { FilterMatchMode, DataTable, Column } from 'primereact';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';

// import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material';
// import dayjs from 'dayjs';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers';

// import { appointmentApi } from '../../services/appointmentApi';
// import { formatearNumero } from '../../helpers/formato';
// import { textValidator } from '../../helpers/validator';
// import './PacienteStyle.css';
// import { agudezaVisual, obtenerAdicion, obtenerGraduaciones } from '../../helpers/metricas';

// export const Pacientes = () => {
//   let pacienteSeleccionado = '';
//   const [openDialog, setOpenDialog] = useState(false);
//   const [listPaciente, setListPaciente] = useState([]);
//   const [selectedPaciente, setSelectedPaciente] = useState(null);
//   const [listoptometrista, setlistoptometrista] = useState([]);
//   const [listSucursal, setlistSucursal] = useState([]);
//   const [listGraduaciones, setListGraduaciones] = useState([]);
//   const [listAgudezaVisual, setListAgudezaVisual] = useState([]);
//   const [listAdicion, setListAdicion] = useState([]);
//   const [formValues, setFormValues] = useState({
//     nombre: '',
//     edad: '',
//     genero: '',
//     antecedentes: '',
//     telefono: '',
//     email: '',
//     direccion: '',
//     fechaRegistro: null,
//     ultimaCita: null,
//     observaciones: '',
//     optometrista: '',
//     enfermedadBase: '',
//     sucursales: '',
//     recetaOjoDerecho: [],
//     recetaOjoIzquierdo: [],
//     pruebasValoraciones: '',
//     citaProxima: null
//   });

//   const [ojoDerecho, setojoDerecho] = useState({
//     fecha: new Date(),
//     esfera: '',
//     cilindro: '',
//     eje: '',
//     agudezaVisual: '',
//     distanciaPupilar: '',
//     adicion: '',
//     defRefraccion: ''
//   });
//   const [ojoIzquierdo, setojoIzquierdo] = useState({
//     fecha: new Date(),
//     esfera: '',
//     cilindro: '',
//     eje: '',
//     agudezaVisual: '',
//     distanciaPupilar: '',
//     adicion: '',
//     defRefraccion: ''
//   });

//   //historial

//   useEffect(() => {
//     appointmentApi.get('paciente', '').then((response) => {
//       setListPaciente(response.data);
//     });
//     appointmentApi.get('sucursal', '').then((response) => {
//       setlistSucursal(response.data);
//     });
//     appointmentApi.get('optometrista', '').then((response) => {
//       setlistoptometrista(response.data);
//     });
//     cleanForm();

//     setListGraduaciones(obtenerGraduaciones());
//     setListAdicion(obtenerAdicion());
//     setListAgudezaVisual(agudezaVisual);

//   }, [])

//   const cleanForm = () => { };

//   const handleOpenDialog = () => {
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//   };

//   const toast = useRef(null);

//   const createToast = (severity, summary, detail) => {
//     toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
//   };

//   const onCellSelect = (event) => {
//     console.log(event);

//   };

//   const handleChangeText = ({ target }, select) => {
//     setFormValues({
//       ...formValues,
//       [select]: target.value
//     })
//   };

//   const handleChangeMetricas = ({ target }, select, ojo) => {
//     if (ojo === 'derecho') {
//       setojoDerecho({
//         ...ojoDerecho,
//         [select]: target.value
//       })
//     } else {
//       setojoIzquierdo({
//         ...ojoIzquierdo,
//         [select]: target.value
//       })
//     }
//   };

//   const handleEdit = () => {
//     handleOpenDialog();
//   };

//   const handleDelete = () => {
//     confirmDialog({
//       message: `¿Desea eliminar el registro? `,
//       header: 'Eliminar',
//       icon: 'pi pi-info-circle',
//       defaultFocus: 'reject',
//       acceptClassName: 'p-button-danger',
//       accept: acceptDialog,
//       reject: rejectDialog
//     });
//   };

//   const acceptDialog = () => {
//     if (!textValidator(pacienteSeleccionado)) {
//       appointmentApi.delete(`inventario/${pacienteSeleccionado}`)
//         .then((response) => {
//           if (response.status === 200) {
//             createToast(
//               'success',
//               'Confirmado',
//               'El registro a sido eliminado'
//             );
//             const inventarioFiltrado = listPaciente.filter((inv) => (inv._id !== pacienteSeleccionado));
//             setListPaciente([...inventarioFiltrado]);
//             console.log(response);
//             cleanForm();
//           } else {
//             createToast(
//               'error',
//               'Error',
//               response.statusText,
//             );
//             console.log(response.data);
//             cleanForm();
//             return;
//           }
//         })
//         .catch((err) => {
//           createToast(
//             'error',
//             'Error',
//             'Ha ocurrido un error al intentar crear el registro'
//           );
//           console.log(err);
//           handleCloseDialog();
//           cleanForm();
//         });
//     } else {
//       createToast(
//         'warn',
//         'Acction requerida',
//         'No se selecciono el inventario correctamente'
//       );
//     }
//   }

//   const rejectDialog = () => {
//     createToast(
//       'warn',
//       'Cancelado',
//       'Acción cancelada'
//     );
//   }

//   const renderEditButton = () => {
//     return (
//       <IconButton aria-label="Editar" color="primary" onClick={handleEdit}>
//         <EditIcon />
//       </IconButton>
//     );
//   };

//   const renderDeleteButton = (value) => {
//     return (
//       <IconButton aria-label="Eliminar" color="error" onClick={handleDelete}>
//         <DeleteIcon />
//       </IconButton>
//     );
//   };

//   const [filters] = useState({
//     nombre: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
//     telefono: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
//     direccion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
//     optometrista: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
//     sucursales: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
//     genero: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
//   });

//   const precioVentaBodyTemplate = ({ precioVenta }) => {
//     return formatearNumero(precioVenta);
//   };

//   const precioCompraBodyTemplate = ({ precioCompra }) => {
//     return formatearNumero(precioCompra);
//   };

//   return (
//     <>
//       <h1>Informacion sobre Pacientes </h1>
//       <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialog}>Agregar Paciente</Button>
//       <br />
//       <br />
//       <Toast ref={toast} />
//       <ConfirmDialog />

//       <div style={{ width: '95%' }}>
//         <DataTable value={listPaciente}
//           showGridlines
//           stripedRows
//           size='small'
//           sortMode="multiple"
//           paginator
//           rows={5}
//           filters={filters}
//           filterDisplay='row'
//           selectionMode="single"
//           selection={setSelectedPaciente}
//           cellSelection
//           onCellSelect={onCellSelect}
//           onSelectionChange={(e) => {
//             console.log(e);
//             const paciente = e.value.rowData;
//             setSelectedPaciente(paciente._id);
//             pacienteSeleccionado = paciente._id;
//             setFormValues({

//             })

//             if (e.value.cellIndex === 0) {
//               handleEdit();
//             } else if (e.value.cellIndex === 1) {
//               handleDelete();
//             }
//           }}
//           scrollable
//           scrollHeight="400px"
//         >
//           <Column body={renderEditButton}></Column>
//           <Column body={renderDeleteButton}></Column>
//           <Column field="nombre" header="Nombre" sortable filter></Column>
//           <Column field="edad" header="Edad" sortable ></Column>
//           <Column field="genero" header="Genero" filter></Column>
//           <Column field="telefono" header="Telefono" filter></Column>
//           <Column field="email" header="Email" ></Column>
//           <Column field="direccion" header="Direccion" filter></Column>
//           <Column field="ultimaCita" header="Ultima cita"></Column>
//           <Column field="optometrista" header="Optometrista" filter></Column>
//           <Column field="sucursales" header="Sucursale" filter></Column>
//           <Column field="citaProxima" header="Cita Proxima" ></Column>
//         </DataTable>
//       </div>
//       <Dialog
//         open={openDialog}
//         disableEscapeKeyDown={true}
//         maxWidth="xl"
//         onClose={handleCloseDialog}
//         PaperProps={{
//           component: 'form',
//           onSubmit: (event) => {
//             event.preventDefault();
//             // Se agrega la fecha de las recetas
//             // setFormValues({
//             //   ...formValues,
//             //   recetaOjoDerecho:[{
//             //     ...ojoDerecho
//             //   }],
//             //   recetaOjoIzquierdo:[{
//             //     ...ojoIzquierdo
//             //   }]
//             // });

//             console.log(formValues);


//             // if (!textValidator(selectedPaciente)) {
//             //   appointmentApi.put(`inventario/${selectedPaciente}`, formValues)
//             //     .then((response) => {
//             //       console.log(response.status);

//             //       if (response.status === 202) {
//             //         createToast(
//             //           'success',
//             //           'Confirmado',
//             //           'El registro fue editado correctamente'
//             //         );
//             //         handleCloseDialog();
//             //         const inventarioFiltrados = listPaciente.filter((inventario) => (inventario._id !== selectedPaciente));
//             //         setListPaciente([response.data, ...inventarioFiltrados]);
//             //         console.log(response);
//             //         cleanForm();
//             //       } else {
//             //         createToast(
//             //           'error',
//             //           'Error',
//             //           response.statusText,
//             //         );
//             //         console.log(response.data);
//             //         cleanForm();
//             //         return;
//             //       }
//             //     })
//             //     .catch((err) => {
//             //       createToast(
//             //         'error',
//             //         'Error',
//             //         'Ha ocurrido un error al intentar crear el registro'
//             //       );
//             //       console.log(err);
//             //       handleCloseDialog();
//             //       cleanForm();
//             //     });
//             // } else {
//             //   console.log(formValues);

//             //   appointmentApi.post('inventario', formValues)
//             //     .then((response) => {
//             //       if (response.status === 201) {
//             //         createToast(
//             //           'success',
//             //           'Confirmado',
//             //           'El registro fue creado correctamente'
//             //         );
//             //         handleCloseDialog();
//             //         setListPaciente([...listPaciente, response.data]);
//             //         console.log(response);
//             //         cleanForm();
//             //       } else {
//             //         createToast(
//             //           'error',
//             //           'Error',
//             //           response.statusText,
//             //         );
//             //         console.log(response.data);
//             //         cleanForm();
//             //         return;
//             //       }
//             //     })
//             //     .catch((err) => {
//             //       createToast(
//             //         'error',
//             //         'Error',
//             //         'Ha ocurrido un error al intentar crear el registro'
//             //       );
//             //       console.log(err);
//             //       handleCloseDialog();
//             //       cleanForm();
//             //     });
//             // }
//           },
//         }}
//       >
//         <DialogTitle>Datos sobre el Paciente</DialogTitle>
//         <DialogContent                 >
//           <DialogContentText>
//             Por favor rellene los campos sobre la informacion de su pacientes
//           </DialogContentText>

//           <p className='titulo'>Información paciente</p>
//           <div className='container'>
//             <TextField
//               autoFocus
//               required
//               value={formValues.nombre}
//               onChange={(event) => handleChangeText(event, 'nombre')}
//               margin="dense"
//               id="nombre"
//               name="nombre"
//               label="Nombre"
//               sx={{ width: '100%' }}
//               type="text"
//               variant="standard"
//               size="small"
//             />
//             <TextField
//               value={formValues.edad}
//               onChange={(event) => handleChangeText(event, 'edad')}
//               margin="dense"
//               id="edad"
//               name="edad"
//               label="Edad"
//               type="number"
//               sx={{ width: '30%' }}
//               variant="standard"
//               size="small"
//             />
//             <TextField
//               value={formValues.telefono}
//               onChange={(event) => handleChangeText(event, 'telefono')}
//               margin="dense"
//               id="telefono"
//               name="telefono"
//               label="Telefono"
//               type="text"
//               variant="standard"
//               size="small"
//             />
//             <TextField
//               value={formValues.antecedentes}
//               onChange={(event) => handleChangeText(event, 'antecedentes')}
//               margin="dense"
//               id="antecedentes"
//               name="antecedentes"
//               label="Antecedentes"
//               type="text"
//               multiline
//               maxRows={3}
//               sx={{ width: '100%' }}
//               variant="standard"
//               size="small"
//             />
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="optometrista">Optometrista</InputLabel>
//               <Select
//                 labelId="optometrista"
//                 id="optometrista"
//                 value={formValues.optometrista}
//                 onChange={(event) => handleChangeText(event, 'optometrista')}
//                 label="Optometrista"
//               >
//                 {listoptometrista.map(op => {
//                   return (
//                     <MenuItem key={op._id} value={op._id}>{op.nombre}</MenuItem>
//                   )
//                 })}
//               </Select>
//             </FormControl>
//             <TextField
//               value={formValues.email}
//               onChange={(event) => handleChangeText(event, 'email')}
//               margin="dense"
//               id="email"
//               name="email"
//               label="Email"
//               type="text"
//               sx={{ width: '100%' }}
//               variant="standard"
//               size="small"
//             />
//             <TextField
//               value={formValues.enfermedadBase}
//               onChange={(event) => handleChangeText(event, 'enfermedadBase')}
//               margin="dense"
//               id="enfermedadBase"
//               name="enfermedadBase"
//               label="Enfermedad Base"
//               type="text"
//               multiline
//               maxRows={3}
//               sx={{ width: '100%' }}
//               variant="standard"
//               size="small"
//             />
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="sucursales">Sucursales</InputLabel>
//               <Select
//                 labelId="sucursales"
//                 id="sucursales"
//                 value={formValues.sucursales}
//                 onChange={(event) => handleChangeText(event, 'sucursales')}
//                 label="Sucursales"
//               >
//                 {listSucursal.map(op => {
//                   return (
//                     <MenuItem key={op._id} value={op._id}>{op.nombre}</MenuItem>
//                   )
//                 })}
//               </Select>
//             </FormControl>
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="genero">Genero</InputLabel>
//               <Select
//                 labelId="genero"
//                 id="genero"
//                 value={formValues.genero}
//                 onChange={(event) => handleChangeText(event, 'genero')}
//                 label="Genero"
//               >
//                 <MenuItem key='Femenino' value='Femenino'>Femenino</MenuItem>
//                 <MenuItem key='Masculino' value='Masculino'>Masculino</MenuItem>
//               </Select>
//             </FormControl>
//             <TextField
//               value={formValues.direccion}
//               onChange={(event) => handleChangeText(event, 'direccion')}
//               margin="dense"
//               id="direccion"
//               name="direccion"
//               label="Direccion"
//               type="text"
//               multiline
//               maxRows={2}
//               sx={{ width: '100%' }}
//               variant="standard"
//               size="small"
//             />
//             <TextField
//               value={formValues.observaciones}
//               onChange={(event) => handleChangeText(event, 'observaciones')}
//               margin="dense"
//               id="observaciones"
//               name="observaciones"
//               label="Observaciones"
//               type="text"
//               multiline
//               maxRows={3}
//               sx={{ width: '100%' }}
//               variant="standard"
//               size="small"
//             />
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 label="Cita proxima *"
//                 nombre="citaProxima"
//                 variant="standard"
//                 value={formValues.citaProxima}
//                 format='YYYY-MM-DD'
//                 onChange={(event) => {
//                   setFormValues({
//                     ...formValues,
//                     citaProxima: dayjs(event)
//                   })
//                 }}
//               />
//             </LocalizationProvider>
//           </div>
//           <br />
//           <br />
//           <p className='titulo'>Receta final</p>
//           <p className='subtitulo'> Ojo Derecho</p>
//           <div className='containerEspecificaciones'>
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="Esfera">Esfera</InputLabel>
//               <Select
//                 labelId="Esfera"
//                 id="Esfera"
//                 value={ojoDerecho.esfera}
//                 onChange={(event) => handleChangeMetricas(event, 'esfera', 'derecho')}
//                 label="Esfera"
//               >
//                 {listGraduaciones.map(op => (
//                   <MenuItem key={op} value={op}>{op}</MenuItem>
//                 )
//                 )}
//               </Select>
//             </FormControl>
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="cilindro">Cilindro</InputLabel>
//               <Select
//                 labelId="cilindro"
//                 id="cilindro"
//                 value={ojoDerecho.cilindro}
//                 onChange={(event) => handleChangeMetricas(event, 'cilindro', 'derecho')}
//                 label="Cilindro"
//               >
//                 {listGraduaciones.map(op => (
//                   <MenuItem key={op} value={op}>{op}</MenuItem>
//                 )
//                 )}
//               </Select>
//             </FormControl>
//             <TextField
//               value={ojoDerecho.eje}
//               onChange={(event) => handleChangeMetricas(event, 'eje', 'derecho')}
//               margin="dense"
//               id="eje"
//               name="eje"
//               label="Eje"
//               type="text"
//               variant="standard"
//               size="small"
//             />
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="agudezaVisual">Agudeza Visual</InputLabel>
//               <Select
//                 labelId="agudezaVisual"
//                 id="agudezaVisual"
//                 value={ojoDerecho.agudezaVisual}
//                 onChange={(event) => handleChangeMetricas(event, 'agudezaVisual', 'derecho')}
//                 label="Agudeza Visual"
//               >
//                 {listAgudezaVisual.map(op => (
//                   <MenuItem key={op} value={op}>{op}</MenuItem>
//                 )
//                 )}
//               </Select>
//             </FormControl>
//             <TextField
//               value={ojoDerecho.distanciaPupilar}
//               onChange={(event) => handleChangeMetricas(event, 'distanciaPupilar', 'derecho')}
//               margin="dense"
//               id="dipDer"
//               name="dipDer"
//               label="Dist pupilar"
//               type="text"
//               variant="standard"
//               size="small"
//             />
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="adicion">Adicion</InputLabel>
//               <Select
//                 labelId="adicion"
//                 id="adicion"
//                 value={ojoDerecho.adicion}
//                 onChange={(event) => handleChangeMetricas(event, 'adicion', 'derecho')}
//                 label="Adicion"
//               >
//                 {listAdicion.map(op => (
//                   <MenuItem key={op} value={op}>{op}</MenuItem>
//                 )
//                 )}
//               </Select>
//             </FormControl>
//             <TextField
//               value={ojoDerecho.defRefraccion}
//               onChange={(event) => handleChangeMetricas(event, 'defRefraccion', 'derecho')}
//               margin="dense"
//               id="defRefraccionDer"
//               name="defRefraccionDer"
//               label="Defecto refraccion"
//               type="text"
//               variant="standard"
//               size="small"
//             />
//           </div>
//           <p className='subtitulo'>Ojo Izquierdo</p>
//           <div className='containerEspecificaciones'>
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="Esfera">Esfera</InputLabel>
//               <Select
//                 labelId="Esfera"
//                 id="Esfera"
//                 value={ojoIzquierdo.esfera}
//                 onChange={(event) => handleChangeMetricas(event, 'esfera','derecho')}
//                 label="Esfera"
//               >
//                 {listGraduaciones.map(op => (
//                   <MenuItem key={op} value={op}>{op}</MenuItem>
//                 )
//                 )}
//               </Select>
//             </FormControl>
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="cilindro">Cilindro</InputLabel>
//               <Select
//                 labelId="cilindro"
//                 id="cilindro"
//                 value={ojoIzquierdo.cilindro}
//                 onChange={(event) => handleChangeMetricas(event, 'cilindro','derecho')}
//                 label="Cilindro"
//               >
//                 {listGraduaciones.map(op => (
//                   <MenuItem key={op} value={op}>{op}</MenuItem>
//                 )
//                 )}
//               </Select>
//             </FormControl>
//             <TextField
//             value={ojoIzquierdo.eje}
//             onChange={(event) => handleChangeMetricas(event, 'eje','derecho')}
//               margin="dense"
//               id="eje"
//               name="eje"
//               label="Eje"
//               type="text"
//               variant="standard"
//               size="small"
//             />
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="agudezaVisual">Agudeza Visual</InputLabel>
//               <Select
//                 labelId="agudezaVisual"
//                 id="agudezaVisual"
//                 value={ojoIzquierdo.agudezaVisual}
//                 onChange={(event) => handleChangeMetricas(event, 'agudezaVisual','derecho')}
//                 label="Agudeza Visual"
//               >
//                 {listAgudezaVisual.map(op => (
//                   <MenuItem key={op} value={op}>{op}</MenuItem>
//                 )
//                 )}
//               </Select>
//             </FormControl>
//             <TextField
//               value={ojoIzquierdo.distanciaPupilar}
//               onChange={(event) => handleChangeMetricas(event, 'distanciaPupilar','derecho')}
//               margin="dense"
//               id="dipDer"
//               name="dipDer"
//               label="Dist pupilar"
//               type="text"
//               variant="standard"
//               size="small"
//             />
//             <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
//               <InputLabel id="adicion">Adicion</InputLabel>
//               <Select
//                 labelId="adicion"
//                 id="adicion"
//                 value={ojoIzquierdo.adicion}
//                 onChange={(event) => handleChangeMetricas(event, 'adicion','derecho')}
//                 label="Adicion"
//               >
//                 {listAdicion.map(op => (
//                   <MenuItem key={op} value={op}>{op}</MenuItem>
//                 )
//                 )}
//               </Select>
//             </FormControl>
//             <TextField
//              value={ojoIzquierdo.defRefraccion}
//              onChange={(event) => handleChangeMetricas(event, 'defRefraccion','derecho')}
//               margin="dense"
//               id="defRefraccionDer"
//               name="defRefraccionDer"
//               label="Defecto Refraccion"
//               type="text"
//               variant="standard"
//               size="small"
//             />
//           </div> 
//           <TextField
//             sx={{ width: '50%' }}
//             value={formValues.pruebasValoraciones}
//             onChange={(event) => handleChangeText(event, 'pruebasValoraciones')}
//             margin="dense"
//             id="pruebasValoraciones"
//             name="pruebasValoraciones"
//             label="Pruebas y Valoraciones"
//             type="text"
//             multiline
//             maxRows={3}
//             variant="standard"
//             size="small"
//           />
//           {/* <TextField
//             required
//             value={formValues}
//             onChange={(event) => handleChangeText(event, '')}
//             margin="dense"
//             id=""
//             name=""
//             label=""
//             type="text"
//             variant="standard"
//             size="small"
//           /> */}
//           <br />
//           <br />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} >Cancelar</Button>
//           <Button variant='contained' type="submit">Guardar</Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   )
// }
// <p style={{ fontSize: '25px', textAlign: 'center', fontWeight: 'bold' }}>{pacienteDatos.nombre}</p>
// <div style={{
//   display: 'flex',
//   flexDirection: 'row',
//   justifyContent: 'center',
//   alignItems: 'center',
// }}>
//   <p className='parrafoReceta'>
//     <span className='campo'> Registro: </span>
//     <span className='valor'>{pacienteDatos.fechaRegistro}</span>
//   </p>
//   <p className='parrafoReceta'>
//     <span className='campo'>Ultima Cita: </span>
//     <span className='valor'>{pacienteDatos.ultimaCita}</span>
//   </p>
//   <p className='parrafoReceta'>
//     <span className='campo'>Cita Proxima: </span>
//     <span className='valor'>{pacienteDatos.citaProxima}</span>
//   </p>
// </div>
// <p className='parrafoReceta'>
//   <span className='campo'>Email: </span>
//   <span className='valor' >{pacienteDatos.email}</span>
// </p>
// <p className='parrafoReceta'>
//   <span className='campo'>Observaciones: </span>
//   <span className='valor'>{pacienteDatos.observaciones}</span>
// </p>
// <p className='parrafoReceta'>
//   <span className='campo'>Enfermedades de base: </span>
//   <span className='valor'>{pacienteDatos.enfermedadBase}</span>
// </p>
// <p className='parrafoReceta'>
//   <span className='campo'>Pruebas y valoraciones: </span>
//   <span className='valor'>{pacienteDatos.pruebasValoraciones}</span>
// </p>
// <br />
// <p className='titulo'>Historial</p>
// <p className='subtitulo'>Ojo Derecho</p>
// <DataTable value={pacienteDatos.recetaOjoDerecho} size='small' showGridlines>
//   <Column field="fecha" header="Fecha" body={fechaBodyTemplateReceta}></Column>
//   <Column field="esfera" header="Esfera" ></Column>
//   <Column field="cilindro" header="Cilindro" ></Column>
//   <Column field="eje" header="Eje" ></Column>
//   <Column field="agudezaVisual" header="A. Visual" ></Column>
//   <Column field="distanciaPupilar" header="Dist. Pupilar" ></Column>
//   <Column field="adicion" header="Adicion" ></Column>
//   <Column field="defRefraccion" header="Def. Refraccion" ></Column>
// </DataTable>
// <br />
// <p className='subtitulo'>Ojo Izquierdo</p>
// <DataTable value={pacienteDatos.recetaOjoIzquierdo} size='small' showGridlines>
//   <Column field="fecha" header="Fecha" body={fechaBodyTemplateReceta}></Column>
//   <Column field="esfera" header="Esfera" ></Column>
//   <Column field="cilindro" header="Cilindro" ></Column>
//   <Column field="eje" header="Eje" ></Column>
//   <Column field="agudezaVisual" header="A. Visual" ></Column>
//   <Column field="distanciaPupilar" header="Dist. Pupilar" ></Column>
//   <Column field="adicion" header="Adicion" ></Column>
//   <Column field="defRefraccion" header="Def. Refraccion" ></Column>
// </DataTable>