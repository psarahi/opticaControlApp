// eslint-disable-next-line 
import React, { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import afternoon from '../../assets/afternoon.png';
import crescentMoon from '../../assets/crescent-moon.png';
import sunny from '../../assets/sunny.png';


export const Info = () => {

  useEffect(() => {
    let saludo = '';
    let imagen = '';
    const hour = new Date().getHours();

    if (hour <= 12) {
      saludo = 'Buen día';
      imagen = sunny;
    }
    if (hour > 12 && hour <= 18) {
      saludo = 'Buenas tardes';
      imagen = afternoon;
    }
    if (hour > 18) {
      saludo = 'Buenas noches';
      imagen = crescentMoon;
    }

    const nombre = `${localStorage.getItem('nombre')} ${localStorage.getItem('apellido')}`;
    createToast(
      'success',
      saludo,
      nombre,
      imagen
    );
  }, [])

  const toast = useRef(null);

  const createToast = (severity, summary, detail, imagen) => {
    toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000,
      content: (props) => (
           <div 
           style={{
             display: 'flex',
             alignItems: 'center',
           }}
           >
           <img src={imagen} style={{width: '15%'}}/>
           <div  style={{
           marginLeft: '4%'
             }}>
             <p
              style={{
               fontSize:'20px',
               margin: '0%',
               fontWeight: 'bold',
             }}
             >{props.message.summary}</p>
             <p
             style={{
               fontSize:'19px',
               margin: '0%',
               fontWeight: 300
             }}
             >{props.message.detail}</p>
           </div>
           </div>
    )    });
  };

  return (
    <>
      <Toast 
      ref={toast} 
      
      />
      <h1>Informacion </h1>
   

    </>
  )
}
