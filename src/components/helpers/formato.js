import { format } from 'date-fns';


export const formatearFecha = ( {ultimaCita} )=>{        
    //const fecha = addHours( date.ultimaCita,6)
    return  format(ultimaCita, 'yyyy-MM-dd HH:mm:ss');

}