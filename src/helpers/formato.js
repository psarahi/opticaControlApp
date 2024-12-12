import { format, addHours } from "date-fns";
import dayjs from "dayjs";

export const formatearFecha = (date) => {
  //const fecha = addHours( date.ultimaCita,6)
  return dayjs(date).add(6, 'hour').format("YYYY-MM-DD");
};

export const formatearNumero = (numero) => {
  const formatter = new Intl.NumberFormat("en-HN", {
    minimumFractionDigits: 2,
  });
  return formatter.format(numero);
};
