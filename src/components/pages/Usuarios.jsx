import { React, useEffect, useState, useRef } from "react";
import { DataTable, Tag, Column } from "primereact";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    InputLabel,
    MenuItem,
    Select,
    FormControl,
    Input,
    InputAdornment,
    IconButton,
    Chip,
} from "@mui/material";
import Stack from '@mui/material/Stack';

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import DoneIcon from "@mui/icons-material/Done";

import dayjs from "dayjs";
import { Select as SelectReact } from "react-dropdown-select";

import { opticaControlApi } from "../../services/opticaControlApi";
import { textValidator } from "../../helpers/validator";
import { formatearFecha } from "../../helpers/formato";
import { Visibility, VisibilityOff } from "@mui/icons-material";
const usuariosJSON = {
    nombre: "",
    usuario: "",
    password: "",
    tipoUsuario: "",
    sucursales: [],
    fechaRegistro: dayjs().format("YYYY-MM-DD"),
    estado: true,
};
export const Usuarios = () => {
    let idUsuario = "";
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

        let sucursalesList = [];
        opticaControlApi.get("sucursal", "").then((response) => {
            response.data.forEach((s, index) => {
                sucursalesList.push({
                    value: s._id,
                    label: s.nombre,
                });
            });
            setSucursales(sucursalesList);
        });

        opticaControlApi.get("usuario", {}).then((response) => {
            setListUsuarios(response.data);
            console.log(response.data);
        });
    }, []);

    const toast = useRef(null);
    const toastForm = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 6000,
        });
    };

    const createToastForm = (severity, summary, detail) => {
        toastForm.current.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 6000,
        });
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
        console.log(event.rowData);
        let sucursaleSelect = [];
        event.rowData.sucursales.forEach((s) => {
            sucursaleSelect.push({ value: s._id, label: s.nombre });
        });

        setFormUsuarios({
            nombre: event.rowData.nombre,
            usuario: event.rowData.usuario,
            password: event.rowData.password,
            tipoUsuario: event.rowData.tipoUsuario,
            sucursales: sucursaleSelect,
            fechaRegistro: formatearFecha(event.rowData.fechaRegistro),
            estado: event.rowData.estado,
        });
        if (event.cellIndex === 0) {
            handleEdit();
        }
        if (event.cellIndex === 1) {
            handleDisabled();
        }
        if (event.cellIndex === 2) {
            handleEnabled();
        }
    };

    const handleDisabled = () => {
        confirmDialog({
            message: `¿Desea deshabilitar el registro? `,
            header: "Deshabilitar",
            icon: "pi pi-info-circle",
            defaultFocus: "reject",
            acceptClassName: "p-button-danger",
            accept: acceptDialogDisable,
            reject: rejectDialogDisable,
        });
    };

    const acceptDialogDisable = () => {
        if (textValidator(idUsuario)) {
            opticaControlApi
                .put(`usuario/cambiarEstado/${idUsuario}`, { estado: false })
                .then((response) => {
                    if (response.status === 202) {
                        createToast(
                            "success",
                            "Confirmado",
                            "El registro a sido deshabilitado"
                        );

                        setListUsuarios(
                            listUsuarios.map((i) =>
                                i._id === idUsuario
                                    ? {
                                        ...i,
                                        estado: response.data.estado,
                                    }
                                    : i
                            )
                        );

                        console.log(response);
                        cleanForm();
                    } else {
                        createToast("error", "Error", response.statusText);
                        console.log(response.data);
                        cleanForm();
                        return;
                    }
                })
                .catch((err) => {
                    createToast(
                        "error",
                        "Error",
                        "Ha ocurrido un error al intentar deshabilitar el registro"
                    );
                    console.log(err);
                    handleCloseDialog();
                    cleanForm();
                });
        } else {
            createToast(
                "warn",
                "Acction requerida",
                "No se selecciono el inventario correctamente"
            );
        }
    };

    const rejectDialogDisable = () => {
        createToast("warn", "Cancelado", "Acción cancelada");
    };

    const handleEnabled = () => {
        confirmDialog({
            message: `¿Desea habilitar el registro? `,
            header: "Habilitar",
            icon: "pi pi-info-circle",
            defaultFocus: "reject",
            acceptClassName: "p-button-danger",
            accept: acceptDialogEnable,
            reject: rejectDialogEnable,
        });
    };

    const acceptDialogEnable = () => {
        if (textValidator(idUsuario)) {
            opticaControlApi
                .put(`usuario/cambiarEstado/${idUsuario}`, { estado: true })
                .then((response) => {
                    if (response.status === 202) {
                        createToast(
                            "success",
                            "Confirmado",
                            "El registro a sido deshabilitado"
                        );
                        setListUsuarios(
                            listUsuarios.map((i) =>
                                i._id === idUsuario
                                    ? {
                                        ...i,
                                        estado: response.data.estado,
                                    }
                                    : i
                            )
                        );
                        console.log(response);
                        cleanForm();
                    } else {
                        createToast("error", "Error", response.statusText);
                        console.log(response.data);
                        cleanForm();
                        return;
                    }
                })
                .catch((err) => {
                    createToast(
                        "error",
                        "Error",
                        "Ha ocurrido un error al intentar habilitar el registro"
                    );
                    console.log(err);
                    handleCloseDialog();
                    cleanForm();
                });
        } else {
            createToast(
                "warn",
                "Acction requerida",
                "No se selecciono el inventario correctamente"
            );
        }
    };

    const rejectDialogEnable = () => {
        createToast("warn", "Cancelado", "Acción cancelada");
    };

    const handleEdit = () => {
        handleOpenDialog();
    };

    const handleCloseDialog = () => {
        cleanForm();
        setOpenDialog(false);
    };

    const cleanForm = () => {
        setFormUsuarios(usuariosJSON);
        setUsuarioSelected("");
        idUsuario = "";
        setchangePass(false);
    };

    const handleChangeText = ({ target }, select) => {
        setFormUsuarios({
            ...formUsuarios,
            [select]: target.value,
        });
    };
    const rowClass = (data) => {
        return {
            "bg-green-100": data.estado === true,
            "bg-red-100": data.estado === false,
        };
    };

    const rendeEstado = (data) => {
        if (data.estado === true) {
            return <Tag severity="success" value="Activo"></Tag>;
        } else {
            return <Tag severity="danger" value="Inactivo"></Tag>;
        }
    };


    const rendeSucursales = (data) => {
        return (
            <Stack direction="row" spacing={1}>
                {data.sucursales.map((sucursal) => (
                    <Chip key={sucursal._id} label={sucursal.nombre} color="primary"/>
                ))}
            </Stack>);

    };

    const renderEditButton = (data) => {
        if (data.estado === true) {
            return <EditIcon color="primary" fontSize="medium" />;
        }
    };

    const renderStatusEnabled = (data) => {
        if (data.estado === false) {
            return <DoneIcon color="success" fontSize="medium" />;
        }
    };
    const renderStatusDisabled = (data) => {
        if (data.estado === true) {
            return <CancelIcon color="error" fontSize="medium" />;
        }
    };

    const handleChangePass = () => {
        setchangePass(true);
        setFormUsuarios({
            ...formUsuarios,
            password: "",
        });
    };

    return (
        <>
            <h1>Usuarios</h1>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenDialogAdd}
            >
                Agregar
            </Button>
            <div style={{ width: "90%" }}>
                <DataTable
                    value={listUsuarios}
                    tableStyle={{ minWidth: "50rem" }}
                    showGridlines
                    stripedRows
                    size="small"
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
                    <Column
                        body={renderEditButton}
                        style={{ textAlign: "center" }}
                    ></Column>
                    <Column
                        body={renderStatusDisabled}
                        style={{ textAlign: "center" }}
                    ></Column>
                    <Column
                        body={renderStatusEnabled}
                        style={{ textAlign: "center" }}
                    ></Column>
                    <Column field="nombre" header="Nombre"></Column>
                    <Column field="usuario" header="Usuario"></Column>
                    <Column field="tipoUsuario" header="Tipo Usuario"></Column>
                    <Column header="Sucursales" body={rendeSucursales}></Column>
                    <Column
                        field="fechaRegistro"
                        header="Fecha de registro"
                        body={(data) =>
                            textValidator(data.fechaRegistro)
                                ? formatearFecha(data.fechaRegistro)
                                : "-"
                        }
                    ></Column>
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
                    component: "form",
                    onSubmit: (event) => {
                        event.preventDefault();
                        console.log(formUsuarios.sucursales);

                        let arraySucursales = textValidator(formUsuarios.sucursales)
                            ? formUsuarios.sucursales.map((p) => p.value)
                            : "";
                        let datosSave = {
                            nombre: formUsuarios.nombre,
                            usuario: formUsuarios.usuario,
                            password: formUsuarios.password,
                            tipoUsuario: formUsuarios.tipoUsuario,
                            fechaRegistro: formUsuarios.fechaRegistro,
                            sucursales: arraySucursales,
                        };
                        if (
                            !textValidator(formUsuarios.nombre) ||
                            !textValidator(formUsuarios.usuario) ||
                            !textValidator(formUsuarios.password) ||
                            !textValidator(formUsuarios.tipoUsuario) ||
                            !textValidator(formUsuarios.fechaRegistro)
                        ) {
                            createToastForm(
                                "warn",
                                "Acción requerida",
                                "Favor ingrese los datos necesarios"
                            );
                            return;
                        }

                        if (textValidator(usuarioSelected)) {
                            if (changePass) {
                                opticaControlApi
                                    .put(`usuario/changePass/${usuarioSelected}`, datosSave)
                                    .then((response) => {
                                        if (response.status === 202) {
                                            createToast(
                                                "success",
                                                "Confirmado",
                                                "El registro fue editado correctamente"
                                            );
                                            handleCloseDialog();
                                            setListUsuarios(
                                                listUsuarios.map((i) =>
                                                    i._id === usuarioSelected
                                                        ? { ...i, ...response.data }
                                                        : i
                                                )
                                            );
                                            cleanForm();
                                        }
                                    })
                                    .catch((err) => {
                                        createToast("error", "Error", "Ha ocurrido un error");
                                        console.log(err);
                                        handleCloseDialog();
                                        cleanForm();
                                    });
                            } else {
                                opticaControlApi
                                    .put(`usuario/${usuarioSelected}`, datosSave)
                                    .then((response) => {
                                        if (response.status === 202) {
                                            createToast(
                                                "success",
                                                "Confirmado",
                                                "El registro fue editado correctamente"
                                            );
                                            handleCloseDialog();
                                            setListUsuarios(
                                                listUsuarios.map((i) =>
                                                    i._id === usuarioSelected
                                                        ? { ...i, ...response.data }
                                                        : i
                                                )
                                            );
                                            cleanForm();
                                        }
                                    })
                                    .catch((err) => {
                                        createToast("error", "Error", "Ha ocurrido un error");
                                        console.log(err);
                                        handleCloseDialog();
                                        cleanForm();
                                    });
                            }
                        } else {
                            opticaControlApi
                                .post("usuario", datosSave)
                                .then(async (response) => {
                                    if (response.status === 201) {
                                        createToast(
                                            "success",
                                            "Confirmado",
                                            "El registro a sido creado"
                                        );
                                        cleanForm();
                                        setListUsuarios([...listUsuarios, response.data]);
                                        handleCloseDialog();
                                    }
                                })
                                .catch((err) => {
                                    createToast(
                                        "error",
                                        "Error",
                                        err.response?.data || "Error desconocido"
                                    );
                                    console.log(err);
                                    cleanForm();
                                    handleCloseDialog();
                                });
                        }
                    },
                }}
            >
                <DialogTitle>Datos del usuario</DialogTitle>
                <DialogContent>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "30px",
                            marginBottom: "2%",
                            alignItems: "center",
                        }}
                    >
                        {!changePass && (
                            <Button variant="contained" onClick={handleChangePass}>
                                Cambiar contraseña
                            </Button>
                        )}
                        <Toast ref={toastForm} />
                        <TextField
                            required
                            value={formUsuarios.nombre}
                            onChange={(event) => handleChangeText(event, "nombre")}
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
                            onChange={(event) => handleChangeText(event, "usuario")}
                            margin="dense"
                            id="usuario"
                            name="usuario"
                            label="Usuario"
                            sx={{ width: "70%" }}
                            variant="standard"
                            size="medium"
                        />
                        {changePass && (
                            <FormControl variant="standard" style={{ width: "70%" }}>
                                <InputLabel id="password">Password *</InputLabel>
                                <Input
                                    id="standard-adornment-password"
                                    value={formUsuarios.password}
                                    type={showPassword ? "text" : "password"}
                                    onChange={(event) => handleChangeText(event, "password")}
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
                        )}
                        <FormControl variant="standard">
                            <InputLabel id="tipoUsuario">Tipo Usuario *</InputLabel>
                            <br />
                            <Select
                                style={{ width: "250px", marginBottom: "-100px" }}
                                labelId="tipoUsuario"
                                id="tipoUsuario"
                                value={formUsuarios.tipoUsuario || ""}
                                onChange={(event) => handleChangeText(event, "tipoUsuario")}
                                label="Tipo Usuario"
                            >
                                <MenuItem key="1" value="Administrador">
                                    Administrador
                                </MenuItem>
                                <MenuItem key="2" value="Usuario">
                                    Usuario
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <br />
                        <div>
                            <p>Sucursales *</p>
                            <SelectReact
                                options={sucursales}
                                value={formUsuarios.sucursales}
                                name="Sucursales"
                                style={{ width: "400px" }}
                                multi={true}
                                labelField="label"
                                valueField="value"
                                onChange={(e) => {
                                    console.log(e);

                                    setFormUsuarios({
                                        ...formUsuarios,
                                        sucursales: e,
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <br />
                    <div></div>
                    <br />
                    <br />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button variant="contained" type="submit">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
