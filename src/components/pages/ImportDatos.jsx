import React, { useState, useRef } from 'react'
import * as XLSX from "xlsx";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Button from '@mui/material/Button';
import { formatearFecha, formatearNumero } from '../../helpers/formato';
import { textValidator } from '../../helpers/validator';

import { opticaControlApi } from '../../services/opticaControlApi';
import { Toast } from 'primereact';
import dayjs from 'dayjs';

const docExportPaciente = [{
    nombre: '',
    edad: '',
    genero: '',
    telefono: '',
    direccion: '',
    fechaRegistro: '',
    ultimaCita: '',
    citaProxima: '',
}];

const docExportInv = [{
    descripcion: '',
    esfera: '',
    cilindro: '',
    adicion: '',
    linea: '',
    precioVenta: '',
    precioCompra: '',
    existencia: '',
    importe: '',
    valorGravado: '',
    categoria: '',
    proveedor: '',
    telefono: '',
    moda: '',
    material: '',
    diseno: '',
    color: '',
}]
export const ImportDatos = () => {
    const [dataImportPaciente, setDataImportPaciente] = useState([]);
    const [dataImportInv, setDataImportInv] = useState([]);
    const toast = useRef(null);
    const [disableSavePaciente, setdisableSavePaciente] = useState(true)
    const [disableSaveInv, setdisableSaveInv] = useState(true)

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const exportExcelPaciente = (nameFile) => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(docExportPaciente);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });
            saveAsExcelFilePaciente(excelBuffer, nameFile);
        });
    };

    const saveAsExcelFilePaciente = (buffer) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });
                module.default.saveAs(data, 'uploadPaciente' + EXCEL_EXTENSION);
            }
        });
    };

    const exportExcelInv = (nameFile) => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(docExportInv);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });
            saveAsExcelFileInv(excelBuffer, nameFile);
        });
    };

    const saveAsExcelFileInv = (buffer) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });
                module.default.saveAs(data, 'uploadInventario' + EXCEL_EXTENSION);
            }
        });
    };

    const handleFileUploadPaciente = (event) => {
        const file = event.target.files[0];
        let dataSave = [];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binaryStr = e.target.result;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                console.log(jsonData);

                jsonData.forEach(f => {
                    dataSave.push({
                        nombre: (textValidator(f.nombre)) ? f.nombre : '',
                        edad: (textValidator(f.edad)) ? f.edad : '',
                        genero: (textValidator(f.genero)) ? f.genero : '',
                        telefono: (textValidator(f.telefono)) ? f.telefono : '',
                        email: (textValidator(f.email)) ? f.email : '',
                        direccion: (textValidator(f.direccion)) ? f.direccion : '',
                        sucursales: localStorage.getItem('sucursalID'),
                        fechaRegistro: (textValidator(f.fechaRegistro) ? `${f.fechaRegistro.substring(6, 10)}-${f.fechaRegistro.substring(3, 5)}-${f.fechaRegistro.substring(0, 2)}` : ''),
                        ultimaCita: (textValidator(f.ultimaCita) ? `${f.ultimaCita.substring(6, 10)}-${f.ultimaCita.substring(3, 5)}-${f.ultimaCita.substring(0, 2)}` : ''),
                        citaProxima: (textValidator(f.citaProxima) ? `${f.citaProxima.substring(6, 10)}-${f.citaProxima.substring(3, 5)}-${f.citaProxima.substring(0, 2)}` : ''),
                        estado: true,
                    });
                });
                console.log(dataSave);

                createToast(
                    'success',
                    'Confirmado',
                    `Se cargaron ${dataSave.length} registros exitosamente`
                );
                setDataImportPaciente(dataSave);
                setdisableSavePaciente(false);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleFileUploadInv = (event) => {
        const file = event.target.files[0];
        let dataSave = [];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binaryStr = e.target.result;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                console.log(jsonData);


                jsonData.forEach(f => {
                    dataSave.push({
                        descripcion: (textValidator(f.descripcion)) ? f.descripcion : '',
                        esfera: (textValidator(f.esfera.toString())) ?
                            (f.esfera.toString().substring(0, 1) === '-') ?
                                f.esfera.toFixed(2) : `+${f.esfera.toFixed(2)}` : '',
                        cilindro: (textValidator(f.cilindro.toString())) ?
                            (f.cilindro.toString().substring(0, 1) === '-') ?
                                f.cilindro.toFixed(2) : `+${f.cilindro.toFixed(2)}` : '',
                        adicion: (textValidator(f.adicion.toString())) ?
                            (f.adicion.toString().substring(0, 1) === '-') ?
                                f.adicion.toFixed(2) : `+${f.adicion.toFixed(2)}` : '',
                        linea: (textValidator(f.linea)) ? f.linea : '',
                        precioVenta: (textValidator(f.precioVenta)) ? f.precioVenta : '',
                        precioCompra: (textValidator(f.precioCompra)) ? f.precioCompra : '',
                        sucursales: localStorage.getItem('sucursalID'),
                        existencia: (textValidator(f.existencia)) ? f.existencia : '',
                        categoria: (textValidator(f.categoria)) ? f.categoria : '',
                        proveedor: (textValidator(f.proveedor)) ? f.proveedor : '',
                        telefono: (textValidator(f.telefono)) ? f.telefono.toString() : '',
                        moda: (textValidator(f.moda)) ? f.moda : '',
                        material: (textValidator(f.material)) ? f.material : '',
                        diseno: (textValidator(f.diseno)) ? f.diseno : '',
                        color: (textValidator(f.color)) ? f.color : '',
                        importe: (textValidator(f.importe)) ? f.importe : '',
                        valorGravado: (textValidator(f.valorGravado)) ? `${(f.valorGravado * 100)}%` : '',
                        estado: true
                    });
                });
                createToast(
                    'success',
                    'Confirmado',
                    `Se cargaron ${dataSave.length} registros exitosamente`
                );
                console.log(dataSave);

                setDataImportInv(dataSave);
                setdisableSaveInv(false);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const savePaciente = () => {
        opticaControlApi.post('paciente/multipleSave', dataImportPaciente)
            .then((response) => {
                if (response.status === 201) {
                    createToast(
                        'success',
                        'Confirmado',
                        `${response.data.length} registros fueron guardados correctamente`
                    );
                    setdisableSavePaciente(true);
                }
            })
            .catch((err) => {
                createToast(
                    'error',
                    'Error',
                    'Ha ocurrido un error'
                );
                console.log(err);
                setdisableSavePaciente(true);
            });
    }

    const saveInv = () => {
        opticaControlApi.post('inventario/multipleSave', dataImportInv)
            .then((response) => {
                if (response.status === 201) {
                    createToast(
                        'success',
                        'Confirmado',
                        `${response.data.length} registros fueron guardados correctamente`
                    );
                    setdisableSaveInv(true);
                }
            })
            .catch((err) => {
                createToast(
                    'error',
                    'Error',
                    'Ha ocurrido un error'
                );
                console.log(err);
                setdisableSaveInv(true);
            });
    }

    return (
        <>
            <h1>Cargue el archivo con los datos</h1>
            <br />
            <Toast ref={toast} />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px'
            }}>
                <Button color='success' variant="contained" onClick={exportExcelPaciente}>Descargar .XLSX Paciente</Button>
                <Button color='success' variant="contained" onClick={exportExcelInv}>Descargar .XLSX Inventario</Button>
            </div>
            <h2>Pacientes</h2>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '100px'
            }}>
                <input type="file" accept=".xlsx, .xls" style={{ fontSize: '17px' }} onChange={handleFileUploadPaciente} />
                <Button variant="contained" onClick={savePaciente} disabled={disableSavePaciente}>Guardar</Button>
            </div>
            <DataTable
                value={dataImportPaciente}
                showGridlines
                stripedRows
                size='small'
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                scrollable
                columnResizeMode="expand"
                resizableColumns                        >
                <Column field="nombre" header="Nombre"></Column>
                <Column field="edad" header="Edad" bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="genero" header="Genero" bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="telefono" header="Telefono" bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="direccion" header="Direccion" ></Column>
                <Column field="fechaRegistro" header="Registro" body={(data) => (textValidator(data.fechaRegistro)) ? formatearFecha(data.fechaRegistro) : '-'}></Column>
                <Column field="ultimaCita" header="Ultima cita" body={(data) => (textValidator(data.ultimaCita)) ? formatearFecha(data.ultimaCita) : '-'}></Column>
                <Column field="citaProxima" header="Cita Proxima" body={(data) => (textValidator(data.citaProxima)) ? formatearFecha(data.citaProxima) : '-'}></Column>
                <Column field="estado" header="Estado" ></Column>
            </DataTable>

            <h2>Inventario</h2>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '100px'
            }}>
                <input type="file" accept=".xlsx, .xls" style={{ fontSize: '17px' }} onChange={handleFileUploadInv} />
                <Button variant="contained" onClick={saveInv} disabled={disableSaveInv}>Guardar</Button>
            </div>
            <div style={{ width: '95%' }}>
                <DataTable
                    value={dataImportInv}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns                >
                    <Column field="descripcion" header="Descripcion"></Column>
                    <Column field="esfera" header="Esfera" ></Column>
                    <Column field="cilindro" header="Cilindro" ></Column>
                    <Column field="adicion" header="Adición" ></Column>
                    <Column field="linea" header="Linea" ></Column>
                    <Column field="existencia" header="Existencia"  ></Column>
                    <Column field="precioVenta" header="Precio Venta" body={(data) => formatearNumero(data.precioVenta)}></Column>
                    <Column field="precioCompra" header="Precio Compra" body={(data) => formatearNumero(data.precioCompra)}></Column>
                    <Column field="importe" header="Importe"></Column>
                    <Column field="valorGravado" header="Gravado"></Column>
                    <Column field="moda" header="Moda" ></Column>
                    <Column field="material" header="Material"></Column>
                    <Column field="categoria" header="Categoria" ></Column>
                    <Column field="color" header="Color"></Column>
                    <Column field="diseno" header="Diseño"></Column>
                    <Column field="proveedor" header="Proveedor" ></Column>
                    <Column field="telefono" header="Telefono" ></Column>
                    <Column field="estado" header="Estado" ></Column>
                </DataTable>
            </div>
        </>
    )
}
