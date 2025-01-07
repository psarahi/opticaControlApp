import React, { useState, useRef } from 'react'
import * as XLSX from "xlsx";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Button from '@mui/material/Button';
import { formatearFecha } from '../../helpers/formato';
import { textValidator } from '../../helpers/validator';

import { opticaControlApi } from '../../services/opticaControlApi';
import { Toast } from 'primereact';

const docExport = [{
    nombre: '',
    edad: '',
    genero: '',
    telefono: '',
    direccion: '',
    sucursales: '',
    fechaRegistro: '',
    ultimaCita: '',
    citaProxima: '',
    estado: '',
}];
export const ImportDatos = () => {
    const [dataImport, setDataImport] = useState([]);
    const toast = useRef(null);
    const [disableSave, setdisableSave] = useState(true)

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const exportExcel = (nameFile) => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(docExport);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });
            saveAsExcelFile(excelBuffer, nameFile);
        });
    };

    const saveAsExcelFile = (buffer) => {
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

    const handleFileUpload = (event) => {
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

                jsonData.forEach(f => {
                    dataSave.push({
                        nombre: (textValidator(f.nombre)) ? f.nombre : '',
                        edad: (textValidator(f.edad)) ? f.edad : '',
                        genero: (textValidator(f.genero)) ? f.genero : '',
                        telefono: (textValidator(f.telefono)) ? f.telefono : '',
                        email: (textValidator(f.email)) ? f.email : '',
                        direccion: (textValidator(f.direccion)) ? f.direccion : '',
                        sucursales: (textValidator(f.sucursales)) ? f.sucursales : '',
                        fechaRegistro: (textValidator(f.fechaRegistro) ? `${f.fechaRegistro.substring(6, 10)}-${f.fechaRegistro.substring(3, 5)}-${f.fechaRegistro.substring(0, 2)}` : ''),
                        ultimaCita: (textValidator(f.ultimaCita) ? `${f.ultimaCita.substring(6, 10)}-${f.ultimaCita.substring(3, 5)}-${f.ultimaCita.substring(0, 2)}` : ''),
                        citaProxima: (textValidator(f.citaProxima) ? `${f.citaProxima.substring(6, 10)}-${f.citaProxima.substring(3, 5)}-${f.citaProxima.substring(0, 2)}` : ''),
                        estado: (f.estado === 'true' || !textValidator(f.estado)) ? true : false,
                    });
                });
                createToast(
                    'success',
                    'Confirmado',
                    `Se cargaron ${dataSave.length} registros exitosamente`
                );
                setDataImport(dataSave);
                setdisableSave(false);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const saveCliente = () => {
        opticaControlApi.post('paciente/multipleSave', dataImport)
            .then((response) => {
                if (response.status === 201) {
                    createToast(
                        'success',
                        'Confirmado',
                        `${response.data.length} registros fueron guardados correctamente`
                    );
                    setdisableSave(true);
                }
            })
            .catch((err) => {
                createToast(
                    'error',
                    'Error',
                    'Ha ocurrido un error'
                );
                console.log(err);
                setdisableSave(true);
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
                <Button color='success' variant="contained" onClick={exportExcel}>Descargar .XLSX Paciente</Button>
                <Button color='success' variant="contained">Descargar .XLSX Inventario</Button>
            </div>
            <h2>Pacientes</h2>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '100px'
            }}>
                <input type="file" accept=".xlsx, .xls" style={{ fontSize: '17px' }} onChange={handleFileUpload} />
                <Button variant="contained" onClick={saveCliente} disabled={disableSave}>Guardar</Button>
            </div>
            <DataTable
                value={dataImport}
                size='small'
            >
                <Column field="nombre" header="Nombre"></Column>
                <Column field="edad" header="Edad" bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="genero" header="Genero" bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="telefono" header="Telefono" bodyStyle={{ textAlign: 'center' }}></Column>
                <Column field="direccion" header="Direccion" ></Column>
                <Column field="sucursales" header="Sucursal" ></Column>
                <Column field="fechaRegistro" header="Registro" body={(data) => (textValidator(data.fechaRegistro)) ? formatearFecha(data.fechaRegistro) : '-'}></Column>
                <Column field="ultimaCita" header="Ultima cita" body={(data) => (textValidator(data.ultimaCita)) ? formatearFecha(data.ultimaCita) : '-'}></Column>
                <Column field="citaProxima" header="Cita Proxima" body={(data) => (textValidator(data.citaProxima)) ? formatearFecha(data.citaProxima) : '-'}></Column>
                <Column field="estado" header="Estado" ></Column>
            </DataTable>
        </>
    )
}
