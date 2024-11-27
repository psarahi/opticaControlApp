import { format, addHours } from "date-fns";

export const formatearFecha = (date) => {
  //const fecha = addHours( date.ultimaCita,6)
  return format(date, "yyyy-MM-dd");
};

export const sumarHoras = (fecha, horas) => {
  const date = addHours(fecha, horas);
  return format(date, "yyyy-MM-dd");
};

export const formatearNumero = (numero) => {
  const formatter = new Intl.NumberFormat("en-HN", {
    minimumFractionDigits: 2,
  });
  return formatter.format(numero);
};
