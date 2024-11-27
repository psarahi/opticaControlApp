import dayjs from "dayjs";

export const textValidator = (value) => {
  if (value === undefined || value === null || value === "") {
    return false;
  } else {
    return true;
  }
};

export const validarFechaProxima = (date) => {
  let fecha = dayjs(date).format("YYYY-MM-DD");
  let hoy = dayjs().format("YYYY-MM-DD");
  if (dayjs(hoy).isBefore(fecha)) {
    return false;
  }
  return true;
};
