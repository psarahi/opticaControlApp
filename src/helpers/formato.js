import { format } from 'date-fns';

export const formatearFecha = ( date )=>{        
    //const fecha = addHours( date.ultimaCita,6)
    return  format(date, 'yyyy-MM-dd');
}

export const formatearNumero = ( numero )=>{
    const formatter = new Intl.NumberFormat('en-HN',{
        minimumFractionDigits: 2,
    });
    return formatter.format(numero)
}